import mongoose from 'mongoose';
import { Event } from '../../../database/event/event';
import { EventViews } from '../../../database/auth/event';
import { Review } from '../../../database/review/review';
import CustomError from '../../../utils/CustomError';
import { calculateTrendingScore } from '../../../utils/event/trending/engine';

const CANDIDATE_LOOKBACK_DAYS = 30;
const MIN_VIEWS_FOR_CANDIDATE = 20;


// --- Get Published Events ---
export const getEventsService = async (filters: {
  category?: string;
  location?: string;
  date?: string;
  search?: string;
  page: number;
  limit: number;
}) => {
  const query: any = { status: { $in: ['published', 'live'] }, visibility: 'public' };
  
  if (filters.category) {
    query.type = filters.category;
  }
  
  if (filters.location) {
    query['venue.address.city'] = new RegExp(filters.location, 'i');
  }
  
  if (filters.date) {
    const searchDate = new Date(filters.date);
    query['schedule.startDate'] = { $gte: searchDate };
  }
  
  if (filters.search) {
    query.$or = [
      { title: new RegExp(filters.search, 'i') },
      { description: new RegExp(filters.search, 'i') },
      { tagline: new RegExp(filters.search, 'i') },
    ];
  }
  
  const skip = (filters.page - 1) * filters.limit;
  const events = await Event.find(query)
    .select('_id slug title type categories tagline media.coverImage venue.name venue.address.city venue.address.state schedule.startDate schedule.endDate tickets.tiers metrics.views status')
    .sort({ 'schedule.startDate': 1 })
    .skip(skip)
    .limit(filters.limit);
  
  const total = await Event.countDocuments(query);
  
  return {
    events,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      pages: Math.ceil(total / filters.limit),
    },
  };
};

// --- Get Event Details ---
export const getEventDetailsService = async (identifier: string, userId?: string) => {
  let event = await Event.findOne({ slug: identifier }).select('_id slug title type categories description tagline highlights media status venue organizer schedule tickets features');

  if (!event) {
    event = await Event.findById(identifier).select('_id slug title type categories description tagline highlights media status venue organizer schedule tickets features');
  }

  if (!event || (event.status !== 'published' && event.status !== 'live' && event.status !== 'ended')) {
    throw new CustomError('Event not found', 404);
  }

  trackEventView(event._id.toString(), userId).catch(err => {
    console.error('Error tracking event view:', err);
  });

  return event;
};

// --- Get Featured Events ---
export const getFeaturedEventsService = async (limit: number) => {
  const events = await Event.find({
    'features.isFeatured': true,
    status: { $in: ['published', 'live'] },
    visibility: 'public',
  })
    .select('_id slug title type categories tagline media.coverImage venue.name venue.address.city venue.address.state schedule.startDate schedule.endDate tickets.tiers metrics.views status')
    .sort({ 'features.featuredPriority': -1, 'features.featuredAt': -1 })
    .limit(limit);
  
  return events;
};

// --- Get Trending Events ---
export const getTrendingEventsService = async (
  limit: number,
  options?: {
    includeDebug?: boolean;
    now?: Date;
  }
) => {
  const now = options?.now ?? new Date();

  // 1. Fetch candidate events only
  const events = await Event.find({
    status: { $in: ['published', 'live'] },
    visibility: 'public',
    createdAt: {
      $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    },
    'metrics.uniqueViews': { $gte: 20 }
  })
    .select(
      '_id title slug type categories description tagline media status venue schedule tickets metrics createdAt'
    )
    .lean()
    .limit(500); // HARD SAFETY CAP

  if (!events.length) return [];

  // 2. Aggregate reviews in one bounded query
  const eventIds = events.map(e => e._id);

  const reviewStats = await Review.aggregate([
    { $match: { eventId: { $in: eventIds } } },
    {
      $group: {
        _id: '$eventId',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  const reviewMap = new Map(
    reviewStats.map(r => [
      r._id.toString(),
      {
        averageRating: r.averageRating,
        reviewCount: r.reviewCount
      }
    ])
  );

  // 3. Score events
  const scored = [];

  for (const event of events) {
    const review = reviewMap.get(event._id.toString());

    const scoredEvent = calculateTrendingScore(
      {
        ...event,
        averageRating: review?.averageRating ?? 0,
        reviewCount: review?.reviewCount ?? 0
      },
      now
    );

    if (scoredEvent) {
      scored.push({
        event,
        score: scoredEvent.score,
        breakdown: scoredEvent.breakdown
      });
    }
  }

  // 4. Rank and limit
  scored.sort((a, b) => b.score - a.score);

  const top = scored.slice(0, limit);

  // 5. Return clean domain response
  return top.map(({ event, score, breakdown }) => ({
    ...event,
    trendingScore: score,
    ...(options?.includeDebug && {
      _trendingBreakdown: breakdown
    })
  }));
};



// --- Track Event View ---
async function trackEventView(eventId: string, userId?: string) {
  const now = new Date();

  await Event.updateOne({
      _id: eventId 
    }, { 
      $inc: { 'metrics.views': 1 }, 
      $set: { 'metrics.lastViewedAt': now } 
    });
  
  if (!userId) return;

  const viewed = await EventViews.findOne({ eventId, userId });
  if (viewed) return;

  await EventViews.create({ eventId, userId });
  
  await Event.updateOne({ _id: eventId }, { $inc: { 'metrics.uniqueViews': 1 } });
}