import { User } from "../../../database/auth/auth";
import { Event } from "../../../database/event/event";
import { isValidObjectId } from "../../../utils/isValidObjectId";
import CustomError from "../../../utils/CustomError";
import { addEmailJob } from "../../../workers/email.queue";
import { success } from "zod";
import axios from "axios";



// --- Get All Events ---
export const getEventsService = async (filters: {
  search?: string;
  status?: string;
  hostId?: string;
  page: number;
  limit: number;
}) => {
  const query: any = {};

  if(filters?.hostId && !isValidObjectId(filters.hostId)){
    throw new CustomError('Invalid host ID', 400);
  }

  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: 'i' } },
    ];
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.hostId) {
    query.hostId = filters.hostId;
  }

  const skip = (filters.page - 1) * filters.limit;
  const events = await Event.find(query)
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(filters.limit);

  const total = await Event.countDocuments(query);

  return {
    success: true,
    events,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      pages: Math.ceil(total / filters.limit),
    },
  };
};

// --- Get Event ---
export const getEventService = async (eventId: string) => {

  if(eventId && !isValidObjectId(eventId)){
    throw new CustomError('Invalid event ID', 400);
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw new CustomError('Event not found', 404);
  }

  return {
    success: true,
    event,
  };
};


// --- Approve Event ---
export const approveEventService = async (eventId: string) => {

  if(eventId && !isValidObjectId(eventId)){
    throw new CustomError('Invalid event ID', 400);
  }

  const event = await Event.findById(eventId).populate('hostId');
  if (!event) {
    throw new CustomError('Event not found', 404);
  }

  event.set({ status: 'approved' });
  await event.save();

  if (!event?.hostId) {
    throw new CustomError('Host not found', 404);
  }

  if(!event?.hostId?.emailVerified){
    throw new CustomError('Host email is not verified', 400);
  }

  // Send email notification
  if (event?.hostId?.email) {
    await addEmailJob('email-notification', {
      type: 'EVENT_APPROVED',
      payload: {
        hostEmail: event.hostId.email,
        hostName: event.hostId.firstName + ' ' + event.hostId.lastName || 'Host',
        eventTitle: event.title,
      },
    });
  }

  return {
    success: true,
    message: 'Event approved successfully',
  };
};

// --- Reject Event ---
export const rejectEventService = async (eventId: string, rejectionReason: string) => {

  if(eventId && !isValidObjectId(eventId)){
    throw new CustomError('Invalid event ID', 400);
  }

  if(!rejectionReason){
    throw new CustomError('Rejection reason is required', 400);
  }

  const event = await Event.findById(eventId).populate('hostId');
  if (!event) {
    throw new CustomError('Event not found', 404);
  }

  event.set({ status: 'rejected', rejectionReason });
  await event.save();

  if (!event?.hostId) {
    throw new CustomError('Host not found', 404);
  }

  // Send email notification
  if (event?.hostId?.email) {
    await addEmailJob('email-notification', {
      type: 'EVENT_REJECTED',
      payload: {
        hostEmail: event.hostId.email,
        hostName: event.hostId.firstName + ' ' + event.hostId.lastName || 'Host',
        eventTitle: event.title,
        reason: rejectionReason,
        eventId: event._id.toString(),
      },
    });
  }

  return {
    success: true,
    message: 'Event rejected successfully',
  };
};


// --- Feature Event ---
export const featureEventService = async (eventId: string, priority?: number) => {

  if(eventId && !isValidObjectId(eventId)){
    throw new CustomError('Invalid event ID', 400);
  }

  const event = await Event.findById(eventId).populate('hostId');
  if (!event) {
    throw new CustomError('Event not found', 404);
  }

  if (!event?.hostId) {
    throw new CustomError('Host not found', 404);
  }

  if(!event?.hostId?.emailVerified){
    throw new CustomError('Host email is not verified', 400);
  }

  // Introduce host kyc verification check in future

  event.set({
    'moderation.featured.isFeatured': true,
    'moderation.featured.featuredAt': new Date(),
    'moderation.featured.featuredPriority': priority || 0,
  });
  await event.save();

  // Send email notification
  if (event?.hostId?.email) {
    await addEmailJob('email-notification', {
      type: 'EVENT_FEATURED',
      payload: {
        hostEmail: event.hostId.email,
        hostName: event.hostId.firstName + ' ' + event.hostId.lastName || 'Host',
        eventTitle: event.title,
        eventId: event._id.toString(),
      },
    });
  }

  return { 
    success: true,
    message: 'Event featured successfully',
  };
};

// --- Unfeature Event ---
export const unfeatureEventService = async (eventId: string) => {

  if(eventId && !isValidObjectId(eventId)){
    throw new CustomError('Invalid event ID', 400);
  }

  const event = await Event.findById(eventId).populate('hostId');
  if (!event) {
    throw new CustomError('Event not found', 404);
  }

  event.set({
    'moderation.featured.isFeatured': false,
    'moderation.featured.featuredAt': undefined,
    'moderation.featured.featuredPriority': 0,
  });

  await event.save();

  // Send email notification
  if (event?.hostId?.email) {
    await addEmailJob('email-notification', {
      type: 'EVENT_UNFEATURED',
      payload: {
        hostEmail: event.hostId.email,
        hostName: event.hostId.firstName + ' ' + event.hostId.lastName || 'Host',
        eventTitle: event.title,
        eventId: event._id.toString(),
      },
    });
  }

  return { 
    success: true,
    message: 'Event unfeatured successfully',
  };
};

// --- Suspend Event ---
export const suspendEventService = async (eventId: string, reason: string) => {

  const admin = await User.findOne({ role: 'admin' });

  if(eventId && !isValidObjectId(eventId)){
    throw new CustomError('Invalid event ID', 400);
  }

  if(!reason){
    throw new CustomError('Reason is required', 400);
  }

  const event = await Event.findById(eventId).populate('hostId');
  if (!event) {
    throw new CustomError('Event not found', 404);
  }

  event.set({
    'flags.suspended': true,
    'flags.suspendedAt': new Date(),
    'flags.suspensionReason': reason,
    'moderation.visibility': 'unlisted',
    'moderation.sales.paused': true,
    'moderation.sales.pausedAt': new Date(),
    'moderation.sales.pausedBy': admin._id,
    'moderation.sales.pausedReason': `Admin suspended the event: ${reason}`,
  });

  // Send email notification
  if (event?.hostId?.email) {
    await addEmailJob('email-notification', {
      type: 'EVENT_SUSPENDED',
      payload: {
        hostEmail: event.hostId.email,
        hostName: event.hostId.firstName + ' ' + event.hostId.lastName || 'Host',
        eventTitle: event.title,
        eventId: event._id.toString(),
      },
    });
  }

  await event.save();

  return { message: 'Event suspended successfully' };
};

// --- Unsuspend Event ---
export const unsuspendEventService = async (eventId: string) => {

  if(eventId && !isValidObjectId(eventId)){
    throw new CustomError('Invalid event ID', 400);
  }

  const event = await Event.findById(eventId).populate('hostId');
  if (!event) {
    throw new CustomError('Event not found', 404);
  }

  event.set({
    'flags.suspended': false,
    'flags.suspendedAt': undefined,
    'flags.suspensionReason': undefined,
    'moderation.visibility': 'public',
    'moderation.sales.paused': false,
    'moderation.sales.pausedAt': undefined,
    'moderation.sales.pausedBy': undefined,
    'moderation.sales.pausedReason': undefined,
  });

  // Send email notification
  if (event?.hostId?.email) {
    await addEmailJob('email-notification', {
      type: 'EVENT_UNSUSPENDED',
      payload: {
        hostEmail: event.hostId.email,
        hostName: event.hostId.firstName + ' ' + event.hostId.lastName || 'Host',
        eventTitle: event.title,
        eventId: event._id.toString(),
      },
    });
  }

  await event.save();

  return { message: 'Event unsuspended successfully' };
};

// --- Toggle Sales Pause ---
export const toggleSalesPauseService = async (eventId: string) => {

  const admin = await User.findOne({ role: 'admin' });

  if(eventId && !isValidObjectId(eventId)){
    throw new CustomError('Invalid event ID', 400);
  }

  const event = await Event.findById(eventId).populate('hostId');
  if (!event) {
    throw new CustomError('Event not found', 404);
  }

  // Only allow toggling for published/live events
  if (!['published', 'live'].includes(event.status)) {
    throw new CustomError('Sales can only be paused for published or live events', 400);
  }

  const newSalesPaused = !event.moderation.sales.paused;
  event.set({ 
    'moderation.sales.paused': newSalesPaused, 
    'moderation.sales.pausedAt': newSalesPaused ? new Date() : undefined, 
    'moderation.sales.pausedBy': newSalesPaused ? admin._id : undefined, 
    'moderation.sales.pausedReason': newSalesPaused ? 'Admin paused the sales of the event' : undefined,
  });
  await event.save();

  // Send email notification
  if (event?.hostId?.email && newSalesPaused) {
    await addEmailJob('email-notification', {
      type: 'EVENT_SALES_PAUSED',
      payload: {
        hostEmail: event.hostId.email,
        hostName: event.hostId.firstName + ' ' + event.hostId.lastName || 'Host',
        eventTitle: event.title,
        eventId: event._id.toString(),
      },
    });
  } else if (event?.hostId?.email && !newSalesPaused) {
    await addEmailJob('email-notification', {
      type: 'EVENT_SALES_RESUMED',
      payload: {
        hostEmail: event.hostId.email,
        hostName: event.hostId.firstName + ' ' + event.hostId.lastName || 'Host',
        eventTitle: event.title,
        eventId: event._id.toString(),
      },
    });
  }

  return {
    message: `Sales ${newSalesPaused ? 'paused' : 'resumed'} successfully`,
    salesPaused: newSalesPaused
  };
};


// --- Toggle Event Visibility ---
export const toggleEventVisibilityService = async (eventId: string) => {

  if(eventId && !isValidObjectId(eventId)){
    throw new CustomError('Invalid event ID', 400);
  }

  const event = await Event.findById(eventId).populate('hostId');
  if (!event) {
    throw new CustomError('Event not found', 404);
  }

  const newVisibility = event?.visibility === 'public' ? 'unlisted' : 'public';
  event.set({ 
    'moderation.visibility': newVisibility,
  });
  await event.save();

  // Send email notification
  if (event?.hostId?.email && newVisibility === 'unlisted') {
    await addEmailJob('email-notification', {
      type: 'EVENT_UNLISTED',
      payload: {
        hostEmail: event.hostId.email,
        hostName: event.hostId.firstName + ' ' + event.hostId.lastName || 'Host',
        eventTitle: event.title,
        eventId: event._id.toString(),
      },
    });
  } else if (event?.hostId?.email && newVisibility === 'public') {
    await addEmailJob('email-notification', {
      type: 'EVENT_PUBLIC',
      payload: {
        hostEmail: event.hostId.email,
        hostName: event.hostId.firstName + ' ' + event.hostId.lastName || 'Host',
        eventTitle: event.title,
        eventId: event._id.toString(),
      },
    });
  }

  return {
    message: `Event visibility ${newVisibility} successfully`,
    visibility: newVisibility
  };
};


// --- Withdraw Approval ---
export const withdrawApprovedEventService = async (eventId: string) => {

  if(eventId && !isValidObjectId(eventId)){
    throw new CustomError('Invalid event ID', 400);
  }

  const event = await Event.findById(eventId).populate('hostId');
  if (!event) {
    throw new CustomError('Event not found', 404);
  }

  event.set({ status: 'pending_approval' });
  await event.save();

  // Send email notification
  if (event?.hostId?.email) {
    await addEmailJob('email-notification', {
      type: 'EVENT_WITHDRAW_APPROVAL',
      payload: {
        hostEmail: event.hostId.email,
        hostName: event.hostId.firstName + ' ' + event.hostId.lastName || 'Host',
        eventTitle: event.title,
        eventId: event._id.toString(),
      },
    });
  }

  return {
    message: 'Event status set to pending approval successfully',
    status: event.status
  };
};

// --- Admin Delete Event ---
export const adminDeleteEventService = async (eventId: string) => {

  if(eventId && !isValidObjectId(eventId)){
    throw new CustomError('Invalid event ID', 400);
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw new CustomError('Event not found', 404);
  }

  await event.deleteOne();
  return { message: 'Event permanently deleted' };
};

// --- Get Verification Document Link ---
export const getVerificationDocumentLinkService = async (docKey: string) => {

  if(!docKey){
    throw new CustomError('Document key is required', 400);
  }

  const result:any = await axios.get(`https://cloudflare-worker.itzariful777.workers.dev/media/${docKey}`);
  const link = result?.data?.url;

  return {
    message: 'Verification document link fetched successfully',
    verificationDocumentLink: link
  };
};
