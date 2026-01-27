import mongoose from 'mongoose';
import { Event } from '../../../database/event/event';
import { Order } from '../../../database/order/order';

/**
 * Advanced Event Recommendation Algorithm
 * 
 * Scoring factors:
 * 1. Category Match (30%) - Events in categories the user has attended/viewed
 * 2. Location Proximity (25%) - Events in cities the user has shown interest in
 * 3. Popularity (20%) - Based on views, orders, and trending score
 * 4. Recency (15%) - Prefer upcoming events over distant ones
 * 5. Price Range (10%) - Similar price points to user's previous orders
 */

interface RecommendationContext {
  currentEventId?: string;
  currentEventCategory?: string;
  currentEventLocation?: string;
  userId?: string;
  limit?: number;
}

export const getRecommendedEventsService = async (context: RecommendationContext) => {
  const {
    currentEventId,
    currentEventCategory,
    currentEventLocation,
    userId,
    limit = 10
  } = context;

  // Get user's order history if authenticated
  let userPreferences = {
    categories: [] as string[],
    locations: [] as string[],
    avgPriceRange: { min: 0, max: 10000 }
  };

  if (userId) {
    try {
      const userOrders = await Order.find({ 
        userId: new mongoose.Types.ObjectId(userId),
        status: { $in: ['completed', 'confirmed'] }
      })
      .populate('eventId', 'category venue.address.city')
      .limit(20)
      .lean();

      // Extract user preferences from order history
      const categories = new Set<string>();
      const locations = new Set<string>();
      const prices: number[] = [];

      userOrders.forEach((order: any) => {
        if (order.eventId?.category) categories.add(order.eventId.category);
        if (order.eventId?.venue?.address?.city) locations.add(order.eventId.venue.address.city);
        if (order.totalAmount) prices.push(order.totalAmount);
      });

      userPreferences.categories = Array.from(categories);
      userPreferences.locations = Array.from(locations);
      
      if (prices.length > 0) {
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
        userPreferences.avgPriceRange = {
          min: Math.max(0, avgPrice * 0.5),
          max: avgPrice * 1.5
        };
      }
    } catch (error) {
      console.error('Error fetching user preferences:', error);
    }
  }

  // If viewing an event, use its category and location as context
  if (currentEventCategory) {
    userPreferences.categories.unshift(currentEventCategory);
  }
  if (currentEventLocation) {
    userPreferences.locations.unshift(currentEventLocation);
  }

  // Build query for candidate events
  const query: any = {
    status: { $in: ['published', 'live'] },
    'moderation.visibility': 'public',
    'schedule.startDate': { $gte: new Date() } // Only upcoming events
  };

  // Exclude current event if provided
  if (currentEventId) {
    query._id = { $ne: new mongoose.Types.ObjectId(currentEventId) };
  }

  // Fetch candidate events
  const candidates = await Event.find(query)
    .select('_id slug title category tagline media.coverImage venue.name venue.address.city schedule.startDate tickets metrics')
    .limit(limit * 3) // Get more candidates for better scoring
    .lean();

  // Score each candidate
  const scoredEvents = candidates.map((event: any) => {
    let score = 0;

    // 1. Category Match (30 points)
    if (userPreferences.categories.includes(event.category)) {
      score += 30;
    }

    // 2. Location Match (25 points)
    if (userPreferences.locations.includes(event.venue?.address?.city)) {
      score += 25;
    }

    // 3. Popularity (20 points)
    const views = event.metrics?.views || 0;
    const orders = event.metrics?.orders || 0;
    const popularityScore = Math.min(20, (views / 100) + (orders * 2));
    score += popularityScore;

    // 4. Recency (15 points) - Events happening sooner get higher scores
    const daysUntilEvent = Math.ceil(
      (new Date(event.schedule.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilEvent <= 7) score += 15;
    else if (daysUntilEvent <= 14) score += 12;
    else if (daysUntilEvent <= 30) score += 8;
    else score += 3;

    // 5. Price Range Match (10 points)
    const minTicketPrice = event.tickets?.reduce((min: number, ticket: any) => {
      const price = ticket.price?.amount || 0;
      return price < min ? price : min;
    }, Infinity) || 0;

    if (minTicketPrice >= userPreferences.avgPriceRange.min && 
        minTicketPrice <= userPreferences.avgPriceRange.max) {
      score += 10;
    }

    return { ...event, recommendationScore: score };
  });

  // Sort by score and return top recommendations
  const recommendations = scoredEvents
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, limit);

  return recommendations;
};
