import mongoose from 'mongoose';
import { Order } from '../../database/order/order';
import { User } from '../../database/auth/auth';
import { Event } from '../../database/event/event';
import CustomError from '../../utils/CustomError';
import { calculateTrustScore, calculateEventCompletionRate } from '../../utils/public/trustScore';

export async function getHostProfileService(hostId: string) {
  // Get basic host info
  const host = await User.findById(hostId).select('firstName lastName createdAt');
  if (!host) {
    throw new CustomError('Host not found', 404);
  }

  // Get trust score
  const trustScore = await calculateTrustScore(hostId);

  // Get host profile data
  const hostProfile = await User.findOne({ _id: hostId })
    .select('firstName lastName email businessName businessEmail website photo')
    .lean();

  // Get aggregated review data
  // const reviewStats = await calculateAttendedReviewRating(hostId);

  // Get event stats
  const eventStats = await calculateEventCompletionRate(hostId);

  return {
    success: true,
    host: {
      id: hostId,
      name: `${host.firstName} ${host.lastName}`,
      joinedDate: host.createdAt,
      trustScore: trustScore.metadata.isVisible ? trustScore : null,
      profile: hostProfile,
      stats: {
        totalEvents: eventStats.totalEvents,
        completedEvents: eventStats.completedEvents,
        // totalReviews: reviewStats.totalReviews,
        // averageRating: reviewStats.averageRating
      }
    }
  }
}

export async function getHostTrustScoreService(hostId: string) {
  // Get basic host info
  const host = await User.findById(hostId).select('firstName lastName createdAt');
  if (!host) {
    throw new CustomError('Host not found', 404);
  }

  // Get trust score
  const trustScore = await calculateTrustScore(hostId);

  return {
    success: true,
    trustScore
  }
}