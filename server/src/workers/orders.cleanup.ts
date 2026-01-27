import { Order } from "../database/order/order";
import { Event } from "../database/event/event";
import { Ticket } from "../database/ticket/ticket";

export default async function cleanupExpiredOrders() {
  const now = new Date();
  
  // Find expired pending orders
  const expiredOrders = await Order.find({
    status: "pending",
    expiresAt: { $lt: now }
  });
  
  for (const order of expiredOrders) {
    // 1. Cancel order
    order.status = "cancelled";
    order.cancelledAt = now;
    await order.save();
    
    // 2. Release inventory
    for (const item of order.tickets) {
      // Read current reserved value
      const event = await Event.findOne(
        { _id: order.eventId, "tickets._id": item.ticketVariantId },
        { "tickets.$": 1 }
      );

      if (event && event.tickets && event.tickets[0]) {
        const currentReserved = event.tickets[0].reserved || 0;
        const newReserved = Math.max(0, currentReserved - item.quantity);

        // Update with calculated value
        await Event.updateOne(
          { _id: order.eventId, "tickets._id": item.ticketVariantId },
          { $set: { "tickets.$.reserved": newReserved } }
        );
      }
    }
  }

  // Update event statuses
  await updateEventStatuses(now);
  console.log(`Cleaned up ${expiredOrders.length} expired orders`);
  await updateTicketsStatuses(now);
}


async function updateEventStatuses(now: Date) {
  // Update published → live
  const liveEvents = await Event.updateMany(
    {
      status: 'published',
      'schedule.startDate': { $lte: now },
      'schedule.endDate': { $gte: now }
    },
    { $set: { status: 'live' } }
  );
  
  // Update live → ended
  const endedEvents = await Event.updateMany(
    {
      status: { $in: ['live', 'published'] },
      'schedule.endDate': { $lt: now }
    },
    { $set: { status: 'ended' } }
  );
  
  console.log(`Updated ${liveEvents.modifiedCount} events to live, ${endedEvents.modifiedCount} events to ended`);
}

async function updateTicketsStatuses(now: Date) {
  // Update expired tickets
  const expiredTickets = await Ticket.updateMany(
    {
      status: 'valid',
      validUntil: { $lt: now }
    },
    { $set: { status: 'expired' } }
  );
  
  console.log(`Updated ${expiredTickets.modifiedCount} tickets to expired`);
}