// services/payouts/src/jobs/generatePayouts.ts

import { Payout } from '../database/payout/payout';
import { Event } from '../database/event/event';
import { Order } from '../database/order/order';
import { User, PaymentDetails } from '../database/auth/auth';
import crypto from 'crypto';
import { addEmailJob } from './email.queue';

export async function generatePendingPayouts() {
  console.log('[PAYOUT_JOB] Starting payout generation...');
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  // Find eligible events
  const eligibleEvents = await Event.find({
    status: { $in: ['published', 'completed'] },
    'schedule.endDate': { $lt: sevenDaysAgo },
    payoutGenerated: { $ne: true }
  });
  
  console.log(`[PAYOUT_JOB] Found ${eligibleEvents.length} eligible events`);
  
  for (const event of eligibleEvents) {
    try {
      await generatePayoutForEvent(event);
    } catch (err) {
      console.error(`[PAYOUT_JOB] Failed for event ${event._id}:`, err);
      // Continue to next event
    }
  }
  
  console.log('[PAYOUT_JOB] Completed');
}

async function generatePayoutForEvent(event: any) {
  // 1. Get all orders for this event
  const orders = await Order.find({
    eventId: event._id,
    status: { $in: ['confirmed', 'refunded'] }
  });
  
  if (orders.length === 0) {
    console.log(`[PAYOUT_JOB] Event ${event._id} has no orders, skipping`);
    event.payoutGenerated = true;
    event.payoutSkipped = true;
    event.payoutSkipReason = 'no_orders';
    await event.save();
    return;
  }
  
  // 2. Calculate financials
  let grossRevenue = 0;
  let refundAmount = 0;
  let grossPayout = 0;
  let confirmedOrders = 0;
  let refundedOrders = 0;
  let totalTicketsSold = 0;
  
  for (const order of orders) {
    if (order.status === 'confirmed') {
      grossRevenue += order.pricing.total;
      grossPayout += order.pricing.hostPayout;
      confirmedOrders++;
      
      const ticketCount = order.tickets.reduce((sum: number, t: any) => sum + t.quantity, 0);
      totalTicketsSold += ticketCount;
    }
    
    if (order.status === 'refunded') {
      refundAmount += order.refund?.amount || order.pricing.total;
      refundedOrders++;
    }
  }
  
  // Calculate net payout
  const netPayout = grossPayout - refundAmount;
  
  // Validation checks
  if (netPayout < 0) {
    console.warn(`[PAYOUT_JOB] Event ${event._id} has negative payout (BDT ${netPayout}), flagging for review`);
    // Still create payout but flag it
  }
  
  if (netPayout < 100) {
    console.log(`[PAYOUT_JOB] Event ${event._id} has low payout (BDT ${netPayout}), skipping`);
    event.payoutGenerated = true;
    event.payoutSkipped = true;
    event.payoutSkipReason = 'amount_too_low';
    await event.save();
    return;
  }
  
  // 6. Get host payment details
  const host = await User.findById(event.hostId);
  const paymentDetails = await PaymentDetails.findOne({ hostId: event.hostId });
  
  if (!host) {
    throw new Error('Host not found');
  }
  
  // Extract payment details based on method
  let hasPaymentDetails = false;
  let accountNumber = '';
  let bankName = '';
  let branchName = '';
  let routingNumber = '';
  
  if (paymentDetails?.method === 'bkash') {
    hasPaymentDetails = !!paymentDetails.mobileNumber;
    accountNumber = `880${paymentDetails.mobileNumber}` || '';
  } else if (paymentDetails?.method === 'nagad') {
    hasPaymentDetails = !!paymentDetails.mobileNumber;
    accountNumber = `880${paymentDetails.mobileNumber}` || '';
  } else if (paymentDetails?.method === 'rocket') {
    hasPaymentDetails = !!paymentDetails.mobileNumber;
    accountNumber = `880${paymentDetails.mobileNumber}` || '';
  } else if (paymentDetails?.method === 'bank_transfer') {
    hasPaymentDetails = !!paymentDetails.accountNumber;
    accountNumber = paymentDetails.accountNumber || '';
    bankName = paymentDetails.bankName || '';
    branchName = paymentDetails.branchName || '';
    routingNumber = paymentDetails.routingNumber || '';
  }
  
  if (!hasPaymentDetails) {
    console.warn(`[PAYOUT_JOB] Host ${host._id} has no payment details, holding payout`);
  }
  
  // 7. Check for suspicious activity
  const requiresReview = await checkSuspiciousActivity(event, orders);
  
  // 8. Generate payout number
  const payoutNumber = `PAYOUT-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  
  // 9. Create payout record
  const payout = await Payout.create({
    payoutNumber,
    hostId: event.hostId,
    eventId: event._id,
    
    grossRevenue: Math.floor(grossRevenue),
    grossPayout: Math.floor(grossPayout),
    refundAmount: Math.ceil(refundAmount),
    netPayout: Math.floor(netPayout),
    currency: 'BDT',
    
    totalOrders: orders.length,
    confirmedOrders,
    refundedOrders,
    totalTicketsSold,
    
    status: requiresReview || netPayout < 0 || !hasPaymentDetails 
      ? 'on_hold' 
      : 'pending',
    
    paymentMethod: host.paymentDetails?.method || 'bkash',
    accountNumber: accountNumber,
    accountHolderName: paymentDetails?.accountHolderName || '',
    bankName: bankName || undefined,
    branchName: branchName || undefined,
    routingNumber: routingNumber || undefined,
    
    requiresReview: requiresReview || netPayout < 0,
    reviewReason: requiresReview 
      ? 'Suspicious activity detected' 
      : netPayout < 0 
        ? 'Negative payout amount'
        : undefined,
    
    onHold: !hasPaymentDetails,
    holdReason: !hasPaymentDetails 
      ? 'Host has not provided payment details'
      : undefined,
    
    createdAt: new Date()
  });
  
  // 10. Mark event as payout generated
  event.payoutGenerated = true;
  event.payoutId = payout._id;
  await event.save();
  
  // 11. Notify host
  try {
    await sendPayoutNotificationEmail(host, payout, event);
  } catch (emailErr) {
    console.error('[PAYOUT_JOB] Failed to send notification:', emailErr);
  }
  
  console.log(`[PAYOUT_JOB] Generated payout ${payoutNumber} for event ${event.title}: BDT ${netPayout}`);
}

// Check for suspicious patterns
async function checkSuspiciousActivity(event: any, orders: any[]): Promise<boolean> {
  // 1. High refund rate
  const confirmedOrders = orders.filter(o => o.status === 'confirmed').length;
  const refundedOrders = orders.filter(o => o.status === 'refunded').length;
  const refundRate = confirmedOrders > 0 ? (refundedOrders / confirmedOrders) : 0;
  
  if (refundRate > 0.3) {
    console.warn(`[PAYOUT_JOB] High refund rate (${(refundRate * 100).toFixed(1)}%) for event ${event._id}`);
    return true;
  }
  
  // 2. All tickets bought by same user (fraud)
  const uniqueBuyers = new Set(orders.map(o => o.userId.toString()));
  if (orders.length > 10 && uniqueBuyers.size === 1) {
    console.warn(`[PAYOUT_JOB] All tickets bought by single user for event ${event._id}`);
    return true;
  }
  
  // 3. New host (first event)
  const hostEventCount = await Event.countDocuments({ 
    hostId: event.hostId,
    payoutGenerated: true 
  });
  
  if (hostEventCount === 0) {
    console.log(`[PAYOUT_JOB] First payout for host ${event.hostId}, flagging for manual review`);
    return true;
  }
  
  return false;
}

async function sendPayoutNotificationEmail(host: any, payout: any, event: any) {
  await addEmailJob('email-notification',{
    type: 'PAYOUT_GENERATED',
    payload: {
        host,
        payout,
        event
    },
  });
}
