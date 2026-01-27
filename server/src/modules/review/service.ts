import mongoose from "mongoose";
import { Ticket } from "../../database/ticket/ticket";
import { Event } from "../../database/event/event";
import { Review } from "../../database/review/review";
import CustomError from "../../utils/CustomError";
import { calculateWeightedRating } from "../../utils/review/calculateWeightedRating";

export async function checkReviewEligibility(userId: string, eventId: string) {
  // Rule 1: Must have a valid ticket (not refunded)
  const validTicket = await Ticket.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    eventId: new mongoose.Types.ObjectId(eventId),
    status: { $in: ['valid', 'used'] }, // Allow used tickets too
    checkInStatus: { $in: ['not_checked_in', 'checked_in'] }
  });

  if (!validTicket) {
    return { eligible: false, reason: 'No Valid Ticket' };
  }

  // Rule 2: Event must be ended
  const event = await Event.findById(eventId);
  if (!event) {
    return { eligible: false, reason: 'Event Not Found' };
  }

  if (event.schedule?.endDate && event.schedule.endDate > new Date()) {
    return { eligible: false, reason: 'Event Not Ended' };
  }

  // Rule 3: Within 14-day review window
  const daysSinceEnd = event.schedule?.endDate
    ? ((new Date() as any) - event.schedule.endDate) / (1000 * 60 * 60 * 24)
    : 0;

  if (daysSinceEnd > 14) {
    return { eligible: false, reason: 'Review Window Closed' };
  }

  // Rule 4: One review per user per event
  const existingReview = await Review.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    eventId: new mongoose.Types.ObjectId(eventId)
  });

  if (existingReview) {
    return { eligible: false, reason: 'Already Reviewed' };
  }

  return {
    eligible: true,
    ticketId: validTicket._id.toString(),
    context: {
      hasCheckedIn: validTicket.checkInStatus === 'checked_in',
      checkInTime: validTicket.checkedInAt,
      ticketTier: validTicket.ticketType,
      ticketType: validTicket.ticketType
    }
  };
}

export async function submitReview(data: any) {
  const { eventId, userId, ticketId, rating, title, comment } = data;

  // Validate eligibility
  const eligibility = await checkReviewEligibility(userId, eventId);
  if (!eligibility.eligible) {
    throw new CustomError(`Cannot submit review: ${eligibility.reason}`, 400);
  }

  // Validate rating
  if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    throw new CustomError('Rating must be an integer between 1 and 5', 400);
  }

  // Create review
  const review = await Review.create({
    eventId: new mongoose.Types.ObjectId(eventId),
    userId: new mongoose.Types.ObjectId(userId),
    ticketId: new mongoose.Types.ObjectId(ticketId),
    rating,
    title: title.trim(),
    comment: comment.trim(),
    reviewContext: eligibility.context,
    status: 'approved', // Introduce admin approval later :)
    isVisible: true
  });

  return review;
}


export async function getEventReviews(
  eventId: string,
  userId?: string,
  page: number = 1,
  limit: number = 5
) {
  // Validate pagination parameters
  const validPage = Math.max(1, page);
  const validLimit = Math.min(50, Math.max(1, limit)); // Max 50 per page

  const skip = (validPage - 1) * validLimit;

  // Get total count for pagination
  const total = await Review.countDocuments({
    eventId: new mongoose.Types.ObjectId(eventId),
    status: 'approved',
    isVisible: true
  });

  const totalPages = Math.ceil(total / validLimit);

  // Get paginated reviews
  const reviews = await Review.find({
    eventId: new mongoose.Types.ObjectId(eventId),
    status: 'approved',
    isVisible: true
  })
  .populate('userId', 'firstName lastName')
  .populate('ticketId', 'ticketType')
  .sort({ submittedAt: -1 })
  .skip(skip)
  .limit(validLimit)
  .lean();

  // Calculate weighted rating
  const weightedRating = await calculateWeightedRating(eventId);

  // Get review stats
  const totalReviews = total; // Use total count, not just current page count
  const attendedReviews = reviews.filter(r => r.reviewContext?.hasCheckedIn).length;
  const entryReviews = totalReviews - attendedReviews;

  // Rating distribution (calculate from all reviews, not just current page)
  const allReviews = await Review.find({
    eventId: new mongoose.Types.ObjectId(eventId),
    status: 'approved',
    isVisible: true
  }).select('rating reviewContext').lean();

  const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
    rating,
    count: allReviews.filter(r => r.rating === rating).length,
    percentage: totalReviews > 0 ? (allReviews.filter(r => r.rating === rating).length / totalReviews) * 100 : 0
  }));

  return {
    reviews: reviews.map(review => ({
      _id: review._id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      submittedAt: review.submittedAt,
      reviewContext: review.reviewContext,
      helpfulVotes: review.helpfulVotes,
      userName: review.userId ? `${(review.userId as any).firstName} ${(review.userId as any).lastName}` : 'Anonymous',
      ticketType: review.ticketId ? (review.ticketId as any).ticketType : 'Unknown',
      canReport: userId ? !review.reports?.some((r: any) => r.userId.toString() === userId) : false
    })),
    stats: {
      totalReviews,
      weightedRating: Math.round(weightedRating * 10) / 10, // Round to 1 decimal
      attendedReviews,
      entryReviews,
      ratingDistribution
    },
    pagination: {
      page: validPage,
      limit: validLimit,
      total: total,
      pages: totalPages
    }
  };
}