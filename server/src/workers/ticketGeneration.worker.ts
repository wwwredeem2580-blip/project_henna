import { Worker } from 'bullmq';
import { Order } from '../database/order/order';
import { createTicket } from '../utils/order/ticket';
import { updateEventMetrics } from '../utils/order/updateEventMetrics';
import { invalidatePDFCache } from '../lib/redis';

const redisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
};

export const ticketGenerationWorker = new Worker(
  'ticket-generation-queue',
  async (job) => {
    const { orderId, tickets } = job.data;

    console.log(`[TICKET_GEN] Processing order: ${orderId}`);

    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    const ticketIds: any[] = [];

    // Generate all tickets
    for (const item of tickets) {
      // Create tickets in parallel batches of 5
      const ticketPromises = [];
      for (let i = 0; i < item.quantity; i++) {
        ticketPromises.push(createTicket(order, item, i));
        
        // Process in batches of 5 to avoid overwhelming ImageKit
        if (ticketPromises.length === 5 || i === item.quantity - 1) {
          const batchTickets = await Promise.all(ticketPromises);
          ticketIds.push(...batchTickets.map(t => t._id));
          ticketPromises.length = 0; // Clear array
        }
      }
    }

    // Update order with ticket IDs
    order.ticketIds = ticketIds;
    await order.save();

    // Update event metrics
    await updateEventMetrics(orderId);

    // Invalidate PDF cache
    await invalidatePDFCache(order.eventId.toString());

    console.log(`[TICKET_GEN] Completed: ${orderId}, ${ticketIds.length} tickets`);

    // Send email notification
    try {
      const { addEmailJob } = await import('./email.queue');
      const { Event } = await import('../database/event/event');
      
      const event = await Event.findById(order.eventId);
      if (event && event.schedule) {
        const tickets = order.tickets.map((item: any) => ({
          ticketType: item.variantName,
          quantity: item.quantity,
          price: item.pricePerTicket
        }));

        await addEmailJob('ORDER_CONFIRMATION', {
          orderNumber: order.orderNumber,
          buyerName: order.buyerEmail.split('@')[0],
          buyerEmail: order.buyerEmail,
          eventTitle: event.title,
          eventDate: new Date(event.schedule.startDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          eventTime: new Date(event.schedule.startDate).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          }),
          venue: event.venue?.name || 'TBA',
          venueAddress: event.venue?.address || 'Address TBA',
          tickets,
          totalAmount: order.pricing?.total || 0,
          paymentMethod: order.paymentMethod || 'bKash',
        });
      }
    } catch (emailError) {
      console.error('[TICKET_GEN] Email error:', emailError);
    }

    return { ticketCount: ticketIds.length };
  },
  {
    connection: redisOptions,
    concurrency: 10, // Process 10 orders concurrently
  }
);

ticketGenerationWorker.on('completed', (job) => {
  console.log(`[TICKET_GEN] Job ${job.id} completed`);
});

ticketGenerationWorker.on('failed', (job, err) => {
  console.error(`[TICKET_GEN] Job ${job?.id} failed:`, err);
});

console.log('🎫 Ticket Generation Worker started (concurrency: 10)');
