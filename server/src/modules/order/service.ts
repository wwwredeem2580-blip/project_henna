import mongoose from 'mongoose';
import { Order } from '../../database/order/order';
import { User } from '../../database/auth/auth';
import { Event } from '../../database/event/event';
import { Payment } from '../../database/payment/payment';
import CustomError from '../../utils/CustomError';
import { dummyCreatePayment, dummyExecutePayment } from '../../utils/order/bkash';
import { completeOrder } from '../../utils/order/completeOrder';
import { generateOrderNumber } from '../../utils/order/generateOrderNumber';
import { calculatePricing } from '../../utils/order/calculatePricing';
import { updateEventMetrics } from '../../utils/order/updateEventMetrics';
import { createTicket } from '../../utils/order/ticket';
import { handlePaymentFailure } from '../../utils/order/payment';

const FREE_TICKET_LIMITS = {
  maxPerUser: 2,
  maxPerUserTotal: 5,
};

const GENERAL_TICKET_LIMITS = {
  maxPerEvent: 100,
  maxPerTier: 50
};

async function validateTicketLimits(userId: string, eventId: string, requestedTickets: any[]) {
  // Get all active orders for this user and event
  const existingOrders = await Order.find({
    userId,
    eventId,
    status: { $in: ['confirmed', 'pending'] }
  });

  // Calculate total tickets bought for this event
  const currentTotalTickets = existingOrders.reduce((sum, order) => {
    return sum + order.tickets.reduce((tSum: number, t: any) => tSum + t.quantity, 0);
  }, 0);

  const requestedTotal = requestedTickets.reduce((sum: number, t: any) => sum + t.quantity, 0);

  if (currentTotalTickets + requestedTotal > GENERAL_TICKET_LIMITS.maxPerEvent) {
    throw new CustomError(
      `You can only purchase a maximum of ${GENERAL_TICKET_LIMITS.maxPerEvent} tickets per event. You have already booked ${currentTotalTickets}.`,
      400
    );
  }

  // Calculate limits per tier
  for (const requestedTicket of requestedTickets) {
    const currentTierCount = existingOrders.reduce((sum, order) => {
      const tierTickets = order.tickets.filter((t: any) => t.ticketVariantId.toString() === requestedTicket.ticketVariantId);
      return sum + tierTickets.reduce((tSum: number, t: any) => tSum + t.quantity, 0);
    }, 0);

    if (currentTierCount + requestedTicket.quantity > GENERAL_TICKET_LIMITS.maxPerTier) {
      throw new CustomError(
        `You can only purchase a maximum of ${GENERAL_TICKET_LIMITS.maxPerTier} tickets for "${requestedTicket.variantName}". You have already booked ${currentTierCount}.`,
        400
      );
    }
  }
}



// Create new order
export const createOrderService = async (data: any) => {
  // Validate event exists and is available for purchase
  const event = await Event.findById(data.eventId);
  if (!event) {
    throw new CustomError('Event not found', 404);
  }

  if (!(event.status === 'published' || event.status === 'live')) {
    throw new CustomError('Event is not available for purchase', 400);
  }

  // Check if event has ended
  if (event.schedule && event.schedule.endDate < new Date()) {
    throw new CustomError('Event has already ended', 400);
  }
  
  if (event.moderation.sales.paused) {
    throw new CustomError('Event sales are paused. Please come back later', 400);
  }

  if(event.moderation.visibility === 'unlisted') {
    throw new CustomError('Event is unlisted from our platform as we are ensuring its validity, please wait for it to be listed', 400);
  }

  // Validate aggregate ticket limits
  await validateTicketLimits(data.userId, data.eventId, data.tickets);

  // Validate ticket variants and check availability
  for (const ticketReq of data.tickets) {
    const ticketVariant = event.tickets?.find((t: any) => t._id?.toString() === ticketReq.ticketVariantId);
    if (!ticketVariant) {
      throw new CustomError(`Ticket variant "${ticketReq.variantName}" not found`, 400);
    }

    // Check if ticket variant is active
    if (!ticketVariant.isActive) {
      throw new CustomError(`Ticket variant "${ticketReq.variantName}" is not for sale`, 400);
    }

    // Check available quantity
    const availableQuantity = ticketVariant.quantity - ticketVariant.sold;
    if (ticketReq.quantity > availableQuantity) {
      throw new CustomError(
        `Only ${availableQuantity} tickets available for "${ticketReq.variantName}"`,
        400
      );
    }

    // Validate price matches
    if (ticketVariant.price?.amount !== ticketReq.pricePerTicket) {
      throw new CustomError(`Price mismatch for "${ticketReq.variantName}"`, 400);
    }
  }

  // Check venue capacity
  const requestedTotal = data.tickets.reduce((sum: number, ticket: any) => sum + ticket.quantity, 0);
  const currentTotalSold = event.tickets?.reduce((sum: number, ticket: any) => sum + ticket.sold, 0) || 0;
  const venueCapacity = event.venue?.capacity || 0;

  if (currentTotalSold + requestedTotal > venueCapacity) {
    throw new CustomError('Not enough venue capacity for requested tickets', 400);
  }
  
  const ticketsWithSubtotal = data.tickets.map((ticket: any) => ({
    ticketVariantId: ticket.ticketVariantId,
    variantName: ticket.variantName,
    quantity: ticket.quantity,
    pricePerTicket: ticket.pricePerTicket,
    subtotal: ticket.quantity * ticket.pricePerTicket
  }));

  // Calculate overall pricing
  const total = ticketsWithSubtotal.reduce((sum: number, ticket: any) => sum + ticket.subtotal, 0);
  const pricing = calculatePricing(total, data.paymentMethod);
  
  // *** FREE TICKET LOGIC ***
  if (pricing.subtotal === 0) {
      await validateFreeTicketBooking(data.userId, data.eventId, requestedTotal);
      
      const order = await Order.create({
        userId: data.userId,
        eventId: data.eventId,
        tickets: ticketsWithSubtotal,
        orderNumber: generateOrderNumber(),
        pricing,
        paymentMethod: 'free', // Force 'free' method
        buyerEmail: data.buyerEmail,
        buyerPhone: data?.buyerPhone || null,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        status: 'confirmed', // INSTANT CONFIRMATION
        paymentStatus: 'succeeded',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // Never expire really
      });
      
      // Reserve Inventory
      for (const item of ticketsWithSubtotal) {
          // ... (simplified reservation for free tickets - or reuse standard logic if strict locking needed)
          await Event.updateOne(
              { _id: data.eventId, "tickets._id": item.ticketVariantId },
              { $inc: { "tickets.$.reserved": item.quantity } }
          );
      }
      
      // Complete Order (Generate tickets, email, metrics)
      await completeOrder(order);
      
      return {
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          subtotal: 0,
          paymentStatus: 'succeeded',
          isFree: true
      };
  }

  // Set expiration (15 minutes from now)
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  const order = await Order.create({
    userId: data.userId,
    eventId: data.eventId,
    tickets: ticketsWithSubtotal,
    orderNumber: generateOrderNumber(),
    pricing,
    paymentMethod: data.paymentMethod,
    buyerEmail: data.buyerEmail,
    buyerPhone: data?.buyerPhone || null,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    status: 'pending',
    paymentStatus: 'pending',
    expiresAt
  });

  // 3. RESERVE INVENTORY (prevents overselling with atomic check)
  for (const item of ticketsWithSubtotal) {
    const event = await Event.findOne(
      { _id: data.eventId },
      { "tickets.$": 1 }
    ).where("tickets._id").equals(item.ticketVariantId);

    if (!event) {
      throw new Error("Event or ticket variant not found");
    }

    const variant = event.tickets[0];
    const available = variant.quantity - variant.sold - (variant.reserved || 0);

    if (available < item.quantity) {
      throw new Error(`Only ${available} tickets available`);
    }

    // 2. Then, update with optimistic locking
    const result = await Event.updateOne(
      {
        _id: data.eventId,
        "tickets._id": item.ticketVariantId,
        "tickets.sold": variant.sold,  // Optimistic lock: only update if sold count unchanged
        "tickets.reserved": variant.reserved || 0
      },
      {
        $inc: { "tickets.$.reserved": item.quantity }
      }
    );

    if (result.modifiedCount === 0) {
      // Someone else bought tickets between our read and update
      throw new Error("Tickets just sold out, please try again");
    }
  }

  const payment: any = await dummyCreatePayment({
    amount: pricing.subtotal,
    callbackURL: `${process.env.SERVER_URL!}/order/bkash/callback?orderId=${order._id.toString()}`,
    orderID: order._id.toString(),
    reference: order.orderNumber,
    eventId: data.eventId // Include eventId for redirect
  });

  if(payment?.statusCode !== "0000" || !payment?.bkashUrl || !payment?.paymentId) {
    order.paymentStatus = 'failed';
    await order.save();
    throw new CustomError("Payment failed", 400);
  }

   await Payment.create({
    orderId: order._id,
    userId: data.userId,
    paymentId: payment.paymentId,
    amount: pricing.subtotal,
    currency: "BDT",
    paymentMethod: data.paymentMethod,
    status: "pending",
    createdAt: new Date()
  });

  order.paymentId = payment.paymentId;
  await order.save();

  return {
    orderId: order._id.toString(),
    orderNumber: order.orderNumber,
    subtotal: pricing.subtotal,
    expiresAt: order.expiresAt,
    paymentId: order.paymentId,
    paymentUrl: payment?.bkashUrl
  };
};


// Handle Bkash callback
export const handleBkashCallbackService = async (
  orderId: string, 
  paymentId: string,
  userId?: string  // Optional: for security check
) => {
  // 1. VALIDATE ORDER EXISTS
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new CustomError('Order not found', 404);
  }

  // SECURITY: Verify ownership (if userId provided)
  if (userId && order.userId.toString() !== userId) {
    throw new CustomError('Unauthorized', 403);
  }

  // 2. CHECK PAYMENT TIMEOUT
  if (order.expiresAt < new Date()) {
    throw new CustomError('Order has expired', 400);
  }

  // 3. ENSURE PAYMENT RECORD EXISTS
  let payment = await Payment.findOne({ paymentId });
  if (!payment) {
    payment = await Payment.create({
      paymentId,
      orderId: order._id,
      userId: order.userId,
      amount: order.pricing?.subtotal,
      currency: 'BDT',
      status: 'pending',
      paymentMethod: 'bkash',
      createdAt: new Date()
    });
  }

  // 4. IDEMPOTENCY CHECK
  if (payment.status === 'succeeded') {
    return { 
      success: true, 
      message: 'Payment already processed', 
      orderId: order._id 
    };
  }

  // 5. VALIDATE PAYMENT WITH BKASH
  const result: any = await dummyExecutePayment(paymentId);

  if (result?.statusCode !== '0000') {
    // PAYMENT FAILED - Cleanup
    await handlePaymentFailure(order, payment, result);
    return { 
      success: false, 
      message: 'Payment failed', 
      orderId: order._id 
    };
  }

  // 6. VALIDATE PAYMENT RESPONSE
  if (!result?.amount || !result?.currency) {
    throw new CustomError('Invalid payment response from gateway', 400);
  }

  // 7. AMOUNT VALIDATION - Critical security check
  if (result.amount !== order.pricing?.subtotal) {
    console.error(`[SECURITY] PAYMENT AMOUNT MISMATCH: Order ${orderId}, Expected: ${order.pricing?.subtotal}, Received: ${result.amount}`);
    
    await Payment.updateOne(
      { paymentId },
      {
        status: "suspicious",
        suspiciousAt: new Date(),
        suspiciousReason: "amount_mismatch",
        receivedAmount: result.amount,
        expectedAmount: order.pricing?.subtotal
      }
    );
    
    throw new CustomError('Payment amount validation failed', 400);
  }

  // 8. CURRENCY VALIDATION
  if (result.currency !== 'BDT') {
    throw new CustomError('Invalid payment currency', 400);
  }

  // 9. ATOMIC PAYMENT UPDATE
  const paymentUpdate = await Payment.findOneAndUpdate(
    { paymentId, status: { $ne: 'succeeded' } },
    {
      status: "succeeded",
      succeededAt: new Date(),
      transactionId: result.transactionId,
      amount: result.amount,
      currency: result.currency,
      webhookReceived: true,
      webhookReceivedAt: new Date()
    },
    { new: true }
  );

  if (!paymentUpdate) {
    return { 
      success: true, 
      message: 'Payment already processed', 
      orderId: order._id 
    };
  }

  console.log(`[PAYMENT_SUCCESS] Order: ${orderId}, Amount: ${result.amount} ${result.currency}`);

  // 10. UPDATE ORDER STATUS
  if (order.status !== "confirmed") {
    order.status = "confirmed";
    order.paymentStatus = "succeeded";
    order.confirmedAt = new Date();
    order.paidAt = new Date();
    await order.save();
  }

  // 11. UPDATE INVENTORY (RESERVED → SOLD)
  for (const item of order.tickets) {
    const event = await Event.findOne(
      { _id: order.eventId, "tickets._id": item.ticketVariantId },
      { "tickets.$": 1 }
    );

    const currentReserved = event?.tickets[0]?.reserved || 0;
    const newReserved = Math.max(0, currentReserved - item.quantity);

    await Event.updateOne(
      { _id: order.eventId, "tickets._id": item.ticketVariantId },
      {
        $set: { "tickets.$.reserved": newReserved },
        $inc: { "tickets.$.sold": item.quantity }
      }
    );
  }

  // 12. GENERATE TICKETS
  const ticketIds: any[] = [];
  try {
    for (const item of order.tickets) {
      for (let i = 0; i < item.quantity; i++) {
        const ticket = await createTicket(order, item, i);
        ticketIds.push(ticket._id);
      }
    }
    console.log(`[TICKETS_GENERATED] Order: ${orderId}, Count: ${ticketIds.length}`);
  } catch (err) {
    console.error('[CRITICAL] Ticket generation failed:', err);
    // Don't fail the payment - tickets can be regenerated manually
    // Mark order for manual review
    order.requiresManualReview = true;
    order.manualReviewReason = 'ticket_generation_failed';
    await order.save();
  }

  // 13. LINK TICKETS TO ORDER
  if (ticketIds.length > 0) {
    order.ticketIds = ticketIds;
    await order.save();
  }
  await updateEventMetrics(order._id.toString());
  // 14. SEND ORDER CONFIRMATION EMAIL
  try {
    const { addEmailJob } = await import('../../workers/email.queue');

    // Fetch event details for email
    const event = await Event.findById(order.eventId);
    if (event && event.schedule) {
      // Prepare tickets array for email
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
        transactionId: payment.transactionId,
      });

      console.log(`[EMAIL_QUEUED] Order confirmation for ${order.orderNumber}`);
    }
  } catch (emailError) {
    console.error('[EMAIL_ERROR] Failed to queue order confirmation:', emailError);
    // Don't fail the order if email fails
  }

  return { 
    success: true, 
    message: 'Payment succeeded', 
    orderId: order._id,
    ticketCount: ticketIds.length
  };
};

// Get single order
export const getOrderService = async (orderId: string, userId: string) => {
  const order = await Order.findOne({ _id: orderId, userId })
    .populate('eventId', '_id title schedule.venue schedule.startDate media')
    .populate('ticketIds')
    .select('-__v');

  if (!order) {
    throw new CustomError('Order not found', 404);
  }

  return order;
};




async function validateFreeTicketBooking(userId: string, eventId: string, quantity: number) {
  const user = await User.findById(userId);
  
  if (!user) {
     throw new CustomError('User not found', 404);
  }

  if (!user.emailVerified && user.provider !== 'google' ) {
    throw new CustomError('Please login with google to book free tickets', 403);
  }
  
  // 2. Check event-specific limit
  const existingOrders = await Order.find({
    userId,
    eventId,
    'pricing.total': 0,
    status: { $in: ['confirmed', 'pending'] } // Count pending too to prevent race conditions
  });
  
  const currentEventFreeTickets = existingOrders.reduce((sum, order) => {
      return sum + order.tickets.reduce((tSum: number, t: any) => tSum + t.quantity, 0);
  }, 0);
  
  if (currentEventFreeTickets + quantity > FREE_TICKET_LIMITS.maxPerUser) {
    throw new CustomError(`Maximum ${FREE_TICKET_LIMITS.maxPerUser} free tickets allowed per event`, 400);
  }
  
  // 3. Check monthly limit
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  
  const monthlyFreeStats = await Order.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        'pricing.total': 0,
        status: { $in: ['confirmed', 'pending'] },
        createdAt: { $gte: monthStart }
      }
    },
    {
      $group: {
        _id: null,
        totalTickets: {
          $sum: {
            $reduce: {
              input: '$tickets',
              initialValue: 0,
              in: { $add: ['$$value', '$$this.quantity'] }
            }
          }
        }
      }
    }
  ]);
  
  const currentMonthlyFree = monthlyFreeStats[0]?.totalTickets || 0;
  if (currentMonthlyFree + quantity > FREE_TICKET_LIMITS.maxPerUserTotal) {
    throw new CustomError(`Monthly limit of ${FREE_TICKET_LIMITS.maxPerUserTotal} free tickets reached`, 400);
  }
}