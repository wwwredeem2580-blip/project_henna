import { Order } from "../../../database/order/order";
import { Event } from "../../../database/event/event";
import { Ticket } from "../../../database/ticket/ticket";
import { Payout } from "../../../database/payout/payout";
import { User, PaymentDetails } from "../../../database/auth/auth";
import CustomError from "../../../utils/CustomError";
import { addEmailJob } from "../../../workers/email.queue";
import { isValidObjectId } from "../../../utils/isValidObjectId";



// --- Get All Orders ---
export const getPayoutsService = async (
  page = 1,
  limit = 20,
  status = 'all',
) => {
  
  const query: any = {};
  
  if (status !== 'all') {
    query.status = status;
  }
  
  const payouts = await Payout.find(query)
    .populate('hostId', 'firstName lastName email')
    .populate('eventId', 'title schedule')
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));
  
  const total = await Payout.countDocuments(query);
  
  return {
    success: true,
    payouts: payouts.map((p: any) => ({
      id: p._id,
      payoutNumber: p.payoutNumber,
      host: {
        id: p.hostId?._id,
        name: p.hostId ? `${p.hostId.firstName} ${p.hostId.lastName}` : 'Unknown',
        email: p.hostId?.email
      },
      event: {
        id: p.eventId?._id,
        title: p.eventId?.title,
        endDate: p.eventId?.schedule?.endDate
      },
      amount: Math.floor(p.netPayout),
      currency: p.currency,
      status: p.status,
      requiresReview: p.requiresReview,
      reviewReason: p.reviewReason,
      onHold: p.onHold,
      holdReason: p.holdReason,
      createdAt: p.createdAt,
      paymentMethod: p.paymentMethod,
      bankName: p.bankName,
      accountNumber: p.accountNumber
    })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  };
};


export const getPayoutDetailsService = async (payoutId: string, page = 1, limit = 10) => {
  
  if(!isValidObjectId(payoutId)){
    throw new CustomError('Invalid payout ID', 400);
  }

  const payout = await Payout.findById(payoutId)
    .populate('hostId', 'firstName lastName email')
    .populate('eventId', 'title schedule');
  
  if (!payout) {
    throw new CustomError('Payout not found', 404);
  }
  
  // Get paginated orders for this payout
  const query = {
    eventId: payout.eventId?._id,
    status: { $in: ['confirmed', 'refunded'] }
  };

  const orders = await Order.find(query)
    .select('orderNumber status pricing createdAt buyerEmail ticketCount')
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  const totalOrders = await Order.countDocuments(query);
  
  return {
    success: true,
    payout: {
      ...payout.toObject(),
      hostId: {
        _id: payout.hostId?._id,
        name: payout.hostId ? `${payout.hostId.firstName} ${payout.hostId.lastName}` : 'Unknown',
        email: payout.hostId?.email
      },
      orders: orders.map(o => ({
        id: o._id,
        orderNumber: o.orderNumber,
        status: o.status,
        amount: o.pricing.total,
        buyerEmail: o.buyerEmail,
        ticketCount: o.ticketCount,
        createdAt: o.createdAt
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalOrders,
        pages: Math.ceil(totalOrders / Number(limit))
      }
    }
  };
};


export const approvePayoutService = async (payoutId: string, notes: string) => {
  
  if(!isValidObjectId(payoutId)){
    throw new CustomError('Invalid payout ID', 400);
  }

  const admin = await User.findOne({role: 'admin'});
  const payout = await Payout.findById(payoutId).populate('hostId');
  
  if (!payout) {
    throw new CustomError('Payout not found', 404);
  }
  
  if (payout.status !== 'pending' && payout.status !== 'on_hold') {
    throw new CustomError('Payout cannot be approved in current status', 400);
  }

  if (payout.netPayout <= 0) {
    throw new CustomError('Cannot approve payout with zero or negative amount', 400);
  }
  
  // Update status
  payout.status = 'approved';
  payout.approvedBy = admin?._id;
  payout.approvedAt = new Date();
  payout.adminNotes = notes;
  payout.requiresReview = false;
  payout.onHold = false;
  await payout.save();
  
  await addEmailJob('email-notification', {
    type: 'EVENT_WITHDRAW_APPROVAL',
    payload: {
      hostEmail: payout.hostId.email,
      hostName: payout.hostId.firstName + ' ' + payout.hostId.lastName || 'Host',
      payout,
    },
  });
  
  return {
    success: true,
    message: 'Payout approved'
  };
};


export const rejectPayoutService = async (payoutId: string, reason: string) => {
  
  if(!isValidObjectId(payoutId)){
    throw new CustomError('Invalid payout ID', 400);
  }

  const admin = await User.findOne({role: 'admin'});
  const payout = await Payout.findById(payoutId).populate('hostId');
  
  if (!payout) {
    throw new CustomError('Payout not found', 404);
  }
  
  if (!reason) {
    throw new CustomError('Rejection reason required', 400);
  }
  
  payout.status = 'rejected';
  payout.rejectedBy = admin?._id;
  payout.rejectedAt = new Date();
  payout.rejectionReason = reason;
  payout.requiresReview = false;
  payout.onHold = false;
  await payout.save();
  await addEmailJob('email-notification', {
    type: 'PAYOUT_REJECTION',
    payload: {
      hostEmail: payout.hostId.email,
      hostName: payout.hostId.firstName + ' ' + payout.hostId.lastName || 'Host',
      payout,
    },
  });
  
  return {
    success: true,
    message: 'Payout rejected'
  };
};


export const putOnHoldService = async (payoutId: string, reason: string) => {
  
  if(!isValidObjectId(payoutId)){
    throw new CustomError('Invalid payout ID', 400);
  }

  const payout = await Payout.findById(payoutId).populate('hostId');
  
  if (!payout) {
    throw new CustomError('Payout not found', 404);
  }
  
  if (!reason) {
    throw new CustomError('Reason required', 400);
  }
  
  payout.status = 'on_hold';
  payout.onHold = true;
  payout.holdReason = reason;
  await payout.save();
  await addEmailJob('email-notification', {
    type: 'PAYOUT_ON_HOLD',
    payload: {
      hostEmail: payout.hostId.email,
      hostName: payout.hostId.firstName + ' ' + payout.hostId.lastName || 'Host',
      payout,
    },
  });
  
  return {
    success: true,
    message: 'Payout put on hold'
  };
};


export const processPayoutService = async (payoutId: string) => {
  
  if(!isValidObjectId(payoutId)){
    throw new CustomError('Invalid payout ID', 400);
  }

  const payout = await Payout.findById(payoutId).populate('hostId');
  
  if (!payout) {
    throw new CustomError('Payout not found', 404);
  }
  
  if (payout.status !== 'approved') {
    throw new CustomError('Payout cannot be processed in current status', 400);
  }
  
  try {
    // Update status to processing
    payout.status = 'processing';
    payout.initiatedAt = new Date();
    await payout.save();
    
    // Initiate bKash transfer
    const transferResult = await initiateBkashTransfer({
      amount: payout.netPayout,
      receiverNumber: payout.accountNumber,
      reference: payout.payoutNumber
    });
    
    // Mark as completed
    payout.status = 'completed';
    payout.completedAt = new Date();
    payout.transactionId = transferResult.transactionId;
    await payout.save();
    
    // Notify host
    await addEmailJob('email-notification', {
      type: 'PAYOUT_COMPLETED',
      payload: {
        hostEmail: payout.hostId.email,
        hostName: payout.hostId.firstName + ' ' + payout.hostId.lastName || 'Host',
        payout,
      },
    });

    return {
      success: true, 
      message: 'Payout processed successfully',
      transactionId: transferResult.transactionId
    };
    
  } catch (err: any) {
    console.error('[PAYOUT_PROCESS] Failed:', err);
    
    payout.status = 'failed';
    payout.failedAt = new Date();
    payout.adminNotes = `Processing failed: ${err?.message}`;
    await payout.save();
    
    throw new CustomError('Payout processing failed', 500);
  }
};

async function initiateBkashTransfer(data: any) {
 console.log('Initiating bKash transfer:', data);
 return {
    transactionId: '123456789'
 }   
}