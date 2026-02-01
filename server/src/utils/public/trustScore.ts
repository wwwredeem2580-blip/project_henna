import { User } from "../../database/auth/auth";
import { Event } from "../../database/event/event";
import { Order } from "../../database/order/order";
import { Review } from "../../database/review/review";

const MIN_EVENTS_THRESHOLD = 2;


const WEIGHTS = {
  eventCompletionRate: 35,
  refundRatio: 25,
  checkInSuccessRate: 25,
  accountAgeConsistency: 15
};

// const ADVANCED_WEIGHTS = {
//   eventCompletionRate: 25,      // % of events completed successfully
//   attendedReviewRating: 25,     // Average rating from checked-in attendees
//   refundRatio: 15,             // % of orders that were refunded (lower is better)
//   checkInSuccessRate: 15,      // % of tickets successfully checked-in
//   policyViolations: 10,        // Penalty for policy violations (lower violations = higher score)
//   accountAgeConsistency: 10    // Account age + hosting consistency
// };


export const calculateTrustScore = async (hostId: string): Promise<{
  score: number;
  components: {
    eventCompletionRate: number;
    // attendedReviewRating: number;
    refundRatio: number;
    checkInSuccessRate: number;
    // policyViolations: number;
    accountAgeConsistency: number;
  };
  metadata: {
    totalEvents: number;
    completedEvents: number;
    // totalReviews: number;
    totalOrders: number;
    accountAge: number;
    isVisible: boolean;
  };
}> => {
  // Get all metrics in parallel
  const [
    eventMetrics,
    // reviewMetrics,
    refundMetrics,
    checkInMetrics,
    // violationMetrics,
    accountMetrics
  ] = await Promise.all([
    calculateEventCompletionRate(hostId),
    // calculateAttendedReviewRating(hostId),
    calculateRefundRatio(hostId),
    calculateCheckInSuccessRate(hostId),
    // calculatePolicyViolationPenalty(hostId),
    calculateAccountAgeConsistency(hostId)
  ]);

  // Calculate weighted score
  const components = {
    eventCompletionRate: eventMetrics.score,
    // attendedReviewRating: reviewMetrics.score,
    refundRatio: refundMetrics.score,
    checkInSuccessRate: checkInMetrics.score,
    // policyViolations: violationMetrics.score,
    accountAgeConsistency: accountMetrics.score
  };

  const totalScore = Math.round(
    (components.eventCompletionRate * WEIGHTS.eventCompletionRate / 100) +
    // (components.attendedReviewRating * WEIGHTS.attendedReviewRating / 100) +
    (components.refundRatio * WEIGHTS.refundRatio / 100) +
    (components.checkInSuccessRate * WEIGHTS.checkInSuccessRate / 100) +
    // (components.policyViolations * WEIGHTS.policyViolations / 100) +
    (components.accountAgeConsistency * WEIGHTS.accountAgeConsistency / 100)
  );

  return {
    score: Math.max(0, Math.min(100, totalScore)), // Clamp between 0-100
    components,
    metadata: {
      totalEvents: eventMetrics.totalEvents,
      completedEvents: eventMetrics.completedEvents,
      // totalReviews: reviewMetrics.totalReviews,
      totalOrders: refundMetrics.totalOrders,
      accountAge: accountMetrics.accountAge,
      isVisible: eventMetrics.totalEvents >= MIN_EVENTS_THRESHOLD
    }
  };
}

export const calculateEventCompletionRate = async (hostId: string): Promise<{
  score: number;
  totalEvents: number;
  completedEvents: number;
}> => {
  const events = await Event.find({ hostId }).select('status');

  if (events.length === 0) {
    return { score: 0, totalEvents: 0, completedEvents: 0 };
  }

  const completedEvents = events.filter(event =>
    event.status === 'ended' || event.status === 'completed'
  ).length;

  // Perfect completion = 100, no completion = 0
  const completionRate = (completedEvents / events.length) * 100;

  return {
    score: Math.round(completionRate),
    totalEvents: events.length,
    completedEvents
  };
}


export const calculateRefundRatio = async (hostId: string): Promise<{
  score: number;
  totalOrders: number;
  refundedOrders: number;
  refundRate: number;
}> => {
  // Get all events by this host
  const hostEvents = await Event.find({ hostId }).select('_id');
  const eventIds = hostEvents.map(e => e._id);

  if (eventIds.length === 0) {
    return { score: 100, totalOrders: 0, refundedOrders: 0, refundRate: 0 };
  }

  // Count total orders and refunded orders
  const orderStats = await Order.aggregate([
    {
      $match: {
        eventId: { $in: eventIds },
        status: { $in: ['confirmed', 'refunded'] }
      }
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        refundedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'refunded'] }, 1, 0] }
        }
      }
    }
  ]);

  if (orderStats.length === 0 || orderStats[0].totalOrders === 0) {
    return { score: 100, totalOrders: 0, refundedOrders: 0, refundRate: 0 };
  }

  const { totalOrders, refundedOrders } = orderStats[0];
  const refundRate = (refundedOrders / totalOrders) * 100;

  // Invert: lower refund rate = higher score
  // 0% refunds = 100 score, 50% refunds = 0 score
  const score = Math.max(0, 100 - (refundRate * 2));

  return {
    score: Math.round(score),
    totalOrders,
    refundedOrders,
    refundRate: Math.round(refundRate * 10) / 10
  };
}



export const calculateCheckInSuccessRate = async (hostId: string): Promise<{
  score: number;
  totalTickets: number;
  checkedInTickets: number;
  checkInRate: number;
}> => {
  // Get all events by this host
  const hostEvents = await Event.find({ hostId }).select('_id');
  const eventIds = hostEvents.map(e => e._id);

  if (eventIds.length === 0) {
    return { score: 0, totalTickets: 0, checkedInTickets: 0, checkInRate: 0 };
  }

  // Aggregate ticket check-in data
  const checkInStats = await Order.aggregate([
    {
      $match: {
        eventId: { $in: eventIds },
        status: 'confirmed'
      }
    },
    {
      $unwind: '$tickets'
    },
    {
      $group: {
        _id: null,
        totalTickets: { $sum: 1 },
        checkedInTickets: {
          $sum: { $cond: [{ $eq: ['$tickets.checkInStatus', 'checked_in'] }, 1, 0] }
        }
      }
    }
  ]);

  if (checkInStats.length === 0 || checkInStats[0].totalTickets === 0) {
    return { score: 0, totalTickets: 0, checkedInTickets: 0, checkInRate: 0 };
  }

  const { totalTickets, checkedInTickets } = checkInStats[0];
  const checkInRate = (checkedInTickets / totalTickets) * 100;

  return {
    score: Math.round(checkInRate),
    totalTickets,
    checkedInTickets,
    checkInRate: Math.round(checkInRate * 10) / 10
  };
}


// @Implement In future

// export const calculatePolicyViolationPenalty = async (hostId: string): Promise<{
//     score: number;
//     totalViolations: number;
//     recentViolations: number;
//   }> => {
//     // Count violations in the last 12 months
//     const oneYearAgo = new Date();
//     oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

//     const violations = await AuditLog.countDocuments({
//       userId: hostId,
//       action: { $in: ['warning', 'suspension', 'ban'] },
//       createdAt: { $gte: oneYearAgo }
//     });

//     // Count violations in the last 6 months (more heavily weighted)
//     const sixMonthsAgo = new Date();
//     sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

//     const recentViolations = await AuditLog.countDocuments({
//       userId: hostId,
//       action: { $in: ['warning', 'suspension', 'ban'] },
//       createdAt: { $gte: sixMonthsAgo }
//     });

//     // Calculate penalty score
//     // 0 violations = 100, many violations = lower score
//     let penaltyScore = 100;

//     if (violations > 0) {
//       penaltyScore -= violations * 10; // -10 per violation
//     }

//     if (recentViolations > 0) {
//       penaltyScore -= recentViolations * 15; // -15 per recent violation
//     }

//     return {
//       score: Math.max(0, penaltyScore),
//       totalViolations: violations,
//       recentViolations
//     };
//   }

// const calculateAttendedReviewRating = async (hostId: string): Promise<{
//   score: number;
//   totalReviews: number;
//   averageRating: number;
// }> => {
//   // Get all events by this host
//   const hostEvents = await Event.find({ hostId }).select('_id');
//   const eventIds = hostEvents.map(e => e._id);

//   if (eventIds.length === 0) {
//     return { score: 0, totalReviews: 0, averageRating: 0 };
//   }

//   // Aggregate reviews from these events where attendee was checked in
//   const reviewStats = await Review.aggregate([
//     {
//       $match: {
//         eventId: { $in: eventIds },
//         checkedIn: true, // Only count reviews from checked-in attendees
//         rating: { $exists: true, $ne: null }
//       }
//     },
//     {
//       $group: {
//         _id: null,
//         totalReviews: { $sum: 1 },
//         averageRating: { $avg: '$rating' }
//       }
//     }
//   ]);

//   if (reviewStats.length === 0) {
//     return { score: 0, totalReviews: 0, averageRating: 0 };
//   }

//   const { totalReviews, averageRating } = reviewStats[0];

//   // Convert 1-5 star rating to 0-100 scale
//   const normalizedScore = (averageRating / 5) * 100;

//   return {
//     score: Math.round(normalizedScore),
//     totalReviews,
//     averageRating: Math.round(averageRating * 10) / 10 // Round to 1 decimal
//   };
// }




export const calculateAccountAgeConsistency = async (hostId: string): Promise<{
    score: number;
    accountAge: number;
    hostingConsistency: number;
  }> => {
    const host = await User.findById(hostId).select('createdAt');

    if (!host) {
      return { score: 0, accountAge: 0, hostingConsistency: 0 };
    }

    // Calculate account age in months
    const accountAgeMonths = Math.floor(
      (Date.now() - host.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );

    // Get hosting history
    const events = await Event.find({ hostId })
      .select('createdAt status')
      .sort({ createdAt: 1 });

    let hostingConsistency = 0;

    if (events.length > 1) {
      // Calculate consistency based on event frequency
      const eventIntervals: number[] = [];
      for (let i = 1; i < events.length; i++) {
        const interval = events[i].createdAt.getTime() - events[i-1].createdAt.getTime();
        eventIntervals.push(interval);
      }

      if (eventIntervals.length > 0) {
        // Calculate coefficient of variation (lower = more consistent)
        const mean = eventIntervals.reduce((a, b) => a + b, 0) / eventIntervals.length;
        const variance = eventIntervals.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / eventIntervals.length;
        const stdDev = Math.sqrt(variance);
        const cv = stdDev / mean; // Coefficient of variation

        // Lower CV = more consistent = higher score
        hostingConsistency = Math.max(0, 100 - (cv * 100));
      }
    }

    // Account age score (capped at 24 months = 100 points)
    const ageScore = Math.min(100, (accountAgeMonths / 24) * 100);

    // Combined score: 70% age, 30% consistency
    const combinedScore = (ageScore * 0.7) + (hostingConsistency * 0.3);

    return {
      score: Math.round(combinedScore),
      accountAge: accountAgeMonths,
      hostingConsistency: Math.round(hostingConsistency)
    };
  }

  /**
   * Get trust score color based on score
   */
  export const getTrustScoreColor = (score: number): 'red' | 'yellow' | 'green' => {
    if (score >= 70) return 'green';
    if (score >= 40) return 'yellow';
    return 'red';
  }

  /**
   * Get trust score label
   */
  export const getTrustScoreLabel = (score: number): string => {
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Very Good';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    if (score >= 20) return 'Poor';
    return 'Very Poor';
  }