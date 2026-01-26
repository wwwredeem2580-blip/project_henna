import { Event } from '../../../database/event/event';
import mongoose from "mongoose";
import CustomError from '../../../utils/CustomError';
import getHostEventsQuery from '../../../utils/host/getHostEventsQuery';
import getSortOptions from '../../../utils/host/getSortOptions';
import getFormatedEvents from '../../../utils/host/getFormattedEvents';
import { getEventAnalytics, getEventsAnalytics } from '../analytics/service';

export const getHostEventsService = async (
  hostId: string,
  page: number = 1,
  limit: number = 20,
  filters: {
    status?: string;
    dateRange?: {
      start?: string;
      end?: string;
    };
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  } = {}
) => {
  const query = getHostEventsQuery(hostId, filters);
  
  const total = await Event.countDocuments(query);
  const pages = Math.ceil(total / limit);
  
  const sortOptions = getSortOptions(filters);
  
  const events = await Event.find(query)
    .sort(sortOptions)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
  
  const eventIds = events.map(e => (e._id as mongoose.Types.ObjectId).toString());
  const analyticsMap = await getEventsAnalytics(eventIds);
  
  const formattedEvents = getFormatedEvents(events, analyticsMap);
  
  return {
    events: formattedEvents,
    pagination: { 
      page, 
      limit, 
      total, 
      pages 
    }
  };
};

// --- Get Host Event ---
export const getHostEventService = async (hostId: string, eventId: string) => {
  const event = await Event.findOne({ _id: eventId, hostId });
  if (!event) {
    throw new CustomError('Event not found', 404);
  }
  
  const analytics = await getEventAnalytics(eventId);
  
  return {
    event,
    analytics
  };
};

// --- Publish Event ---
export const publishEventService = async (eventId: string, hostId: string) => {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new CustomError('Event not found', 404);
  }
    
  if (event.hostId.toString() !== hostId) {
    throw new CustomError('Unauthorized', 401);
  }

  if (event.status !== 'approved') {
    throw new CustomError('Event is not in approved state', 400);
  }

  event.set({ status: 'published', publishedAt: new Date() });
  await event.save();
  return { message: 'Event published successfully' };
};