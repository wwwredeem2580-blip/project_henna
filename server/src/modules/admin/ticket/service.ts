import { Order } from "../../../database/order/order";
import { Event } from "../../../database/event/event";
import { Ticket } from "../../../database/ticket/ticket";
import { Payout } from "../../../database/payout/payout";
import { User } from "../../../database/auth/auth";
import { isValidObjectId } from "../../../utils/isValidObjectId";
import CustomError from "../../../utils/CustomError";
import { addEmailJob } from "../../../workers/email.queue";
import { createAuditLog } from "../../../utils/auditLog";
import mongoose from "mongoose";

// ========================================
// TICKET MANAGEMENT SERVICES
// ========================================

/**
 * Get paginated tickets with filters (cursor-based)
 */
export const getTicketsService = async (
  cursor: string | null,
  limit: number = 50,
  filters: {
    status?: string;
    eventId?: string;
    orderId?: string;
    email?: string;
    ticketNumber?: string;
  } = {}
) => {
  // Validate limit
  const safeLimit = Math.min(Math.max(limit, 1), 100);

  // Build query
  const query: any = {};

  // Cursor pagination
  if (cursor) {
    query.ticketNumber = { $gt: cursor };
  }

  // Filters (AND logic)
  if (filters.status && ['valid', 'used', 'cancelled', 'refunded', 'transferred'].includes(filters.status)) {
    query.status = filters.status;
  }

  if (filters.eventId && isValidObjectId(filters.eventId)) {
    query.eventId = new mongoose.Types.ObjectId(filters.eventId);
  }

  if (filters.orderId && isValidObjectId(filters.orderId)) {
    query.orderId = new mongoose.Types.ObjectId(filters.orderId);
  }

  if (filters.ticketNumber) {
    query.ticketNumber = { $regex: filters.ticketNumber, $options: 'i' };
  }

  // Email search requires aggregation with User lookup
  if (filters.email) {
    const users = await User.find({
      email: { $regex: filters.email, $options: 'i' }
    }).select('_id').lean();

    const userIds = users.map(u => u._id);
    if (userIds.length > 0) {
      query.userId = { $in: userIds };
    } else {
      // No users found, return empty result
      return {
        tickets: [],
        pagination: { nextCursor: null, hasMore: false, limit: safeLimit }
      };
    }
  }

  // Fetch tickets (limit + 1 to check if more exist)
  const tickets = await Ticket.find(query)
    .sort({ ticketNumber: 1 })
    .limit(safeLimit + 1)
    .populate('userId', 'email firstName lastName')
    .populate('orderId', 'orderNumber status')
    .lean();

  // Check if more results exist
  const hasMore = tickets.length > safeLimit;
  const resultTickets = hasMore ? tickets.slice(0, safeLimit) : tickets;

  // Format response
  const formattedTickets = resultTickets.map((ticket: any) => ({
    _id: ticket._id,
    ticketNumber: ticket.ticketNumber,
    status: ticket.status,
    checkInStatus: ticket.checkInStatus,
    eventTitle: ticket.eventTitle,
    ticketType: ticket.ticketType,
    price: ticket.price,
    buyerEmail: ticket.userId?.email || 'N/A',
    buyerName: ticket.userId ? `${ticket.userId.firstName} ${ticket.userId.lastName}` : 'N/A',
    orderNumber: ticket.orderId?.orderNumber || 'N/A',
    paymentStatus: ticket.orderId?.status || 'N/A',
    issuedAt: ticket.issuedAt,
    validUntil: ticket.validUntil,
    checkedInAt: ticket.checkedInAt || null
  }));

  return {
    tickets: formattedTickets,
    pagination: {
      nextCursor: hasMore ? resultTickets[resultTickets.length - 1].ticketNumber : null,
      hasMore,
      limit: safeLimit
    }
  };
};

/**
 * Update ticket status with validation and audit logging
 */
export const updateTicketStatusService = async (
  ticketId: string,
  newStatus: string,
  adminId: string,
  reason?: string
) => {
  if (!isValidObjectId(ticketId)) {
    throw new CustomError('Invalid ticket ID', 400);
  }

  if (!isValidObjectId(adminId)) {
    throw new CustomError('Invalid admin ID', 400);
  }

  // Validate new status
  const validStatuses = ['valid', 'used', 'cancelled', 'refunded', 'transferred'];
  if (!validStatuses.includes(newStatus)) {
    throw new CustomError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
  }

  // Fetch ticket
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    throw new CustomError('Ticket not found', 404);
  }

  const oldStatus = ticket.status;

  // Enforce status transition rules
  const dangerousTransitions = [
    { from: 'refunded', to: 'valid', reason: 'Cannot reactivate refunded tickets' },
    { from: 'used', to: 'valid', reason: 'Cannot reactivate used tickets' },
    { from: 'cancelled', to: 'valid', reason: 'Cannot reactivate cancelled tickets' }
  ];

  for (const rule of dangerousTransitions) {
    if (oldStatus === rule.from && newStatus === rule.to) {
      throw new CustomError(rule.reason, 403);
    }
  }

  // Additional check: if ticket is checked in, prevent changing to 'valid'
  if (ticket.checkInStatus === 'checked_in' && newStatus === 'valid') {
    throw new CustomError('Cannot change status to valid for checked-in tickets', 403);
  }

  // Update status
  ticket.status = newStatus as any;
  await ticket.save();

  // Create audit log
  await createAuditLog({
    action: 'TICKET_STATUS_CHANGED',
    resource: 'ticket',
    resourceId: ticketId,
    adminId,
    changes: {
      before: { status: oldStatus },
      after: { status: newStatus }
    },
    metadata: {
      ticketNumber: ticket.ticketNumber,
      reason: reason || 'No reason provided'
    }
  });

  return {
    success: true,
    message: 'Ticket status updated successfully',
    ticket: {
      _id: ticket._id,
      ticketNumber: ticket.ticketNumber,
      status: ticket.status,
      previousStatus: oldStatus
    }
  };
};

/**
 * Manual check-in with validation and audit logging
 */
export const manualCheckInService = async (
  ticketId: string,
  adminId: string
) => {
  if (!isValidObjectId(ticketId)) {
    throw new CustomError('Invalid ticket ID', 400);
  }

  if (!isValidObjectId(adminId)) {
    throw new CustomError('Invalid admin ID', 400);
  }

  // Fetch ticket
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    throw new CustomError('Ticket not found', 404);
  }

  // Validation: Respect same rules as scanner
  if (ticket.status !== 'valid') {
    throw new CustomError(`Cannot check in ticket with status: ${ticket.status}`, 400);
  }

  if (ticket.checkInStatus === 'checked_in') {
    throw new CustomError('Ticket already checked in', 400);
  }

  if (ticket.validUntil && new Date() > new Date(ticket.validUntil)) {
    throw new CustomError('Ticket has expired', 400);
  }

  // Perform check-in
  ticket.checkInStatus = 'checked_in';
  ticket.checkedInAt = new Date();
  ticket.checkedInBy = new mongoose.Types.ObjectId(adminId);
  ticket.status = 'used';
  await ticket.save();

  // Create audit log
  await createAuditLog({
    action: 'MANUAL_CHECKIN',
    resource: 'ticket',
    resourceId: ticketId,
    adminId,
    metadata: {
      ticketNumber: ticket.ticketNumber,
      method: 'MANUAL_OVERRIDE',
      eventTitle: ticket.eventTitle
    }
  });

  return {
    success: true,
    message: 'Ticket checked in successfully',
    ticket: {
      _id: ticket._id,
      ticketNumber: ticket.ticketNumber,
      checkInStatus: ticket.checkInStatus,
      checkedInAt: ticket.checkedInAt
    }
  };
};

/**
 * Get all tickets for an event with enriched data (paginated)
 */
export const getEventTicketsService = async (
  eventId: string,
  cursor: string | null,
  limit: number = 100
) => {
  if (!isValidObjectId(eventId)) {
    throw new CustomError('Invalid event ID', 400);
  }

  const safeLimit = Math.min(Math.max(limit, 1), 200);

  // Build aggregation pipeline
  const pipeline: any[] = [
    { $match: { eventId: new mongoose.Types.ObjectId(eventId) } },
    { $sort: { ticketNumber: 1 } }
  ];

  // Cursor pagination
  if (cursor) {
    pipeline.push({ $match: { ticketNumber: { $gt: cursor } } });
  }

  pipeline.push({ $limit: safeLimit + 1 });

  // Lookup buyer info
  pipeline.push({
    $lookup: {
      from: 'users',
      localField: 'userId',
      foreignField: '_id',
      as: 'buyer'
    }
  });

  // Lookup order info
  pipeline.push({
    $lookup: {
      from: 'orders',
      localField: 'orderId',
      foreignField: '_id',
      as: 'order'
    }
  });

  // Lookup event info
  pipeline.push({
    $lookup: {
      from: 'events',
      localField: 'eventId',
      foreignField: '_id',
      as: 'event'
    }
  });

  // Unwind lookups
  pipeline.push(
    { $unwind: { path: '$buyer', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$order', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$event', preserveNullAndEmptyArrays: true } }
  );

  // Project final shape
  pipeline.push({
    $project: {
      ticketNumber: 1,
      status: 1,
      checkInStatus: 1,
      price: 1,
      issuedAt: 1,
      validUntil: 1,
      checkedInAt: 1,
      ticketType: 1,
      buyerEmail: '$buyer.email',
      buyerName: { $concat: ['$buyer.firstName', ' ', '$buyer.lastName'] },
      orderNumber: '$order.orderNumber',
      paymentStatus: '$order.status',
      eventTitle: '$event.title',
      eventVenue: '$event.venue.name',
      eventSchedule: {
        startDate: '$event.schedule.startDate',
        endDate: '$event.schedule.endDate'
      }
    }
  });

  // Execute aggregation
  const tickets = await Ticket.aggregate(pipeline);

  // Check if more results exist
  const hasMore = tickets.length > safeLimit;
  const resultTickets = hasMore ? tickets.slice(0, safeLimit) : tickets;

  // Get event metadata
  const event = await Event.findById(eventId)
    .select('title venue schedule tickets')
    .lean();

  if (!event) {
    throw new CustomError('Event not found', 404);
  }

  return {
    event: {
      _id: event._id,
      title: event.title,
      venue: event.venue,
      schedule: event.schedule,
      ticketTiers: event.tickets
    },
    tickets: resultTickets,
    pagination: {
      nextCursor: hasMore ? resultTickets[resultTickets.length - 1].ticketNumber : null,
      hasMore,
      limit: safeLimit
    }
  };
};


export const verifyTicketService = async (qrData: string, eventId: string) => {
  const ticket = await Ticket.findOne({ qrCode: qrData });
  if (!ticket) {
    return { valid: false, reason: "INVALID_QR" };
  }

  if (ticket.status !== "valid") {
    return { valid: false, reason: "TICKET_INVALID" };
  }

  if (ticket.eventId.toString() !== eventId) {
    return { valid: false, reason: "EVENT_MISMATCH" };
  }

  if (ticket.validUntil && new Date() > new Date(ticket.validUntil)) {
    return { valid: false, reason: "TICKET_EXPIRED" };
  }
  if (ticket.checkInStatus === "checked_in") {
    return {
      valid: false,
      reason: "ALREADY_USED",
      checkedInAt: ticket.checkedInAt
    };
  }

  const updated = await Ticket.findOneAndUpdate(
    {
      _id: ticket._id,
      checkInStatus: "not_checked_in"
    },
    {
      $set: {
        checkInStatus: "checked_in",
        status: "used",
        checkedInAt: new Date()
      }
    },
    { new: true }
  );

  if (!updated) {
    return {
      valid: false,
      reason: "RACE_CONDITION"
    };
  }

  // 6️⃣ Success response
  return {
    valid: true,
    ticketNumber: updated.ticketNumber,
    ticketType: updated.ticketType,
    userId: updated.userId,
    eventTitle: updated.eventTitle,
    checkedInAt: updated.checkedInAt
  };
};