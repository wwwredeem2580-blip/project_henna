import { Order } from "../../../database/order/order";
import { Event } from "../../../database/event/event";
import { Ticket } from "../../../database/ticket/ticket";
import { Payout } from "../../../database/payout/payout";
import { User } from "../../../database/auth/auth";
import { isValidObjectId } from "../../../utils/isValidObjectId";
import CustomError from "../../../utils/CustomError";
import { addEmailJob } from "../../../workers/email.queue";
import { success } from "zod";
import { invalidatePDFCache } from "../../../lib/redis";



// --- Get All Orders ---
export const getOrdersService = async (
  page = 1,
  limit = 20,
  filters: { status?: string; search?: string } = {}
) => {
  const query: any = {
    status: { $in: ["confirmed", "cancelled", "refunded"] }
  };

  // Search handling
  let eventMap = new Map<string, any>();

  if (filters.search) {
    const events = await Event.find({
      title: { $regex: filters.search, $options: "i" }
    }).select("_id title");

    const eventIds = events.map(e => e._id);
    events.forEach(e => eventMap.set(e._id.toString(), e));

    query.$or = [
      { orderNumber: { $regex: filters.search, $options: "i" } },
      { buyerEmail: { $regex: filters.search, $options: "i" } },
      ...(eventIds.length ? [{ eventId: { $in: eventIds } }] : [])
    ];
  }

  // Status filter
  if (filters.status && ["confirmed", "cancelled", "refunded"].includes(filters.status)) {
    query.status = filters.status;
  }

  // Pagination
  const total = await Order.countDocuments(query);
  const pages = Math.ceil(total / limit);

  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .select("orderNumber eventId buyerEmail tickets pricing.total status createdAt")
    .lean();

  // Fetch missing events
  const missingEventIds = orders
    .map(o => o.eventId.toString())
    .filter(id => !eventMap.has(id));

  if (missingEventIds.length) {
    const events = await Event.find({ _id: { $in: missingEventIds } })
      .select("_id title");

    events.forEach(e => eventMap.set(e._id.toString(), e));
  }

  // Helpers
  const maskEmail = (email: string) => {
    const [name, domain] = email.split("@");
    if (name.length <= 1) return `*@${domain}`;
    return `${name[0]}${"*".repeat(name.length - 1)}@${domain}`;
  };

  // Format response
  const formattedOrders = orders.map(order => ({
    _id: order._id,
    orderNumber: order.orderNumber,
    eventTitle: eventMap.get(order.eventId.toString())?.title ?? "Unknown Event",
    buyerEmail: maskEmail(order.buyerEmail),
    ticketCount: order.tickets.reduce((sum: number, t: any) => sum + t.quantity, 0),
    total: order.pricing?.total,
    status: order.status,
    createdAt: order.createdAt
  }));

  return {
    orders: formattedOrders,
    pagination: { page, limit, total, pages }
  };
};


export const refundOrderService = async (orderId: string, amount: number, reason: string, refundType: string) => {
  
  const admin = await User.findOne({role: 'admin'}).select('_id');
  
  // Get order
  const order = await Order.findById(orderId).populate('eventId');
  
  if (!order) {
    throw new CustomError('Order not found', 404);
  }
  
  if (order.status === 'refunded') {
    throw new CustomError('Order already refunded', 400);
  }
  
  if (order.status !== 'confirmed') {
    throw new CustomError('Only confirmed orders can be refunded', 400);
  }
  
  // Determine refund amount
  let refundAmount = amount || order.pricing.total;

  console.log(refundAmount);
  
  if (refundType === 'partial') {
    if (!amount || amount <= 0 || amount > order.pricing.total) {
      throw new CustomError('Invalid refund amount', 400);
    }
  } else {
    refundAmount = order.pricing.total; // Full refund
  }
  
  try {
    // Process bKash refund
    const refundResult = await processBkashRefund({
      paymentId: order.paymentIntentId,
      amount: refundAmount,
    });
    
    // Update order
    order.status = 'refunded';
    order.refund = {
      amount: refundAmount,
      reason,
      refundedBy: admin._id,
      refundedAt: new Date(),
      transactionId: refundResult.transactionId
    };
    await order.save();
    
    // Invalidate tickets
    await Ticket.updateMany(
      { orderId: order._id },
      { 
        status: 'refunded',
        checkInStatus: 'invalid'
      }
    );
    
    // Invalidate PDF cache for this event (tickets changed)
    await invalidatePDFCache(order.eventId.toString());
    
    // Update event metrics
    const ticketCount = order.tickets.reduce((sum: number, t: any) => sum + t.quantity, 0);
    
    await Event.updateOne(
      { _id: order.eventId },
      {
        $inc: {
          'metrics.totalRevenue': -order.pricing.total,
          'metrics.totalOrders': -1,
          'metrics.totalTicketsSold': -ticketCount
        }
      }
    );
    
    // Update event inventory (return tickets to pool)
    for (const item of order.tickets) {
      await Event.updateOne(
        { _id: order.eventId, "tickets._id": item.ticketVariantId },
        {
          $inc: {
            "tickets.$.sold": -item.quantity,
          }
        }
      );
    }
    
    // Adjust pending payout if exists
    const payout = await Payout.findOne({
      eventId: order.eventId,
      status: { $in: ['pending', 'approved'] }
    });
    
    if (payout) {
      payout.refundAmount += refundAmount;
      payout.netPayout -= refundAmount;
      payout.refundedOrders += 1;
      
      if (payout.netPayout < 0) {
        payout.requiresReview = true;
        payout.reviewReason = 'Negative payout due to refunds';
        payout.onHold = true;
      }
      
      await payout.save();
    }

    const userData = await User.findById(order.userId);
    const user = {name: userData.firstName + ' ' + userData.lastName, email: userData.email};
    const event = await Event.findById(order.eventId);
    // Notify user
    await sendRefundConfirmationEmail(order, user, event, refundAmount);
    
    return {
      success: true,
      message: 'Refund processed successfully',
      refundAmount,
      transactionId: refundResult.transactionId
    };
    
  } catch (err: any) {
    console.error('[REFUND_ERROR]', err);
    throw new CustomError('Refund processing failed', 500)
  }
}

async function sendRefundConfirmationEmail(order: any, user: any, event: any, refundAmount: number) {
    await addEmailJob('email-notification',{
      type: 'REFUND_CONFIRMATION',
      payload: {
        order,
        user,
        event,
        refundAmount
      },
    });
}


async function processBkashRefund({
  paymentId,
  amount
}: {
  paymentId: string;
  amount: number;
}) {
  // Implement bKash refund logic here
  return {
    transactionId: '123456789',
    amount,
    status: 'completed'
  };
}