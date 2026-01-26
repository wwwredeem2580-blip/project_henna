// trending.engine.ts
import { TRENDING_CONFIG } from './trending.config';
import {
  logNormalize,
  safeDivide,
  clamp,
  exponentialDecay
} from './trending.utils';
import { getRecencyBoost } from './recency.model';

export function calculateTrendingScore(
  event: any,
  now: Date = new Date()
) {
  const { metrics = {}, createdAt } = event;

  const {
    uniqueViews = 0,
    orders = 0,
    ticketsSold = 0,
    revenue = 0,
    lastViewedAt,
    checkIns
  } = metrics;

  const { minUniqueViews, minOrders } = TRENDING_CONFIG.thresholds;

  if (uniqueViews < minUniqueViews || orders < minOrders) {
    return null;
  }

  // --- Engagement ---
  const conversionRate = safeDivide(orders, uniqueViews);
  const engagement =
    logNormalize(orders) * TRENDING_CONFIG.engagement.ordersWeight +
    logNormalize(ticketsSold) * TRENDING_CONFIG.engagement.ticketsWeight +
    clamp(
      conversionRate * TRENDING_CONFIG.engagement.maxConversionBoost,
      0,
      TRENDING_CONFIG.engagement.maxConversionBoost
    );

  // --- Awareness ---
  const awareness =
    logNormalize(uniqueViews) * TRENDING_CONFIG.awareness.viewsWeight +
    getRecencyBoost(lastViewedAt, now) *
      TRENDING_CONFIG.awareness.recencyWeight;

  // --- Quality ---
  const rating = event.averageRating ?? 0;
  const reviewCount = event.reviewCount ?? 0;

  const quality =
    rating >= TRENDING_CONFIG.quality.minRating
      ? clamp(
          (rating / 5) *
            Math.min(
              reviewCount / TRENDING_CONFIG.quality.maxReviewInfluence,
              1
            )
        )
      : 0;

  // --- Attendance ---
  const attendanceRate = safeDivide(
    checkIns ?? ticketsSold * 0.8,
    ticketsSold
  );

  // --- Revenue ---
  const revenueScore = logNormalize(revenue);

  const rawScore =
    engagement * TRENDING_CONFIG.weights.engagement +
    awareness * TRENDING_CONFIG.weights.awareness +
    quality * TRENDING_CONFIG.weights.quality +
    attendanceRate * TRENDING_CONFIG.weights.attendance +
    revenueScore * TRENDING_CONFIG.weights.revenue;

  const ageDecay = exponentialDecay(
    createdAt,
    now,
    TRENDING_CONFIG.ageDecay.halfLifeDays
  );

  return {
    eventId: event._id.toString(),
    score: rawScore * ageDecay,
    breakdown: {
      engagement,
      awareness,
      quality,
      attendance: attendanceRate,
      revenue: revenueScore,
      ageDecay
    }
  };
}
