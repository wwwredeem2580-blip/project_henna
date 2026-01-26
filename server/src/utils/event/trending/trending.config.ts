// trending.config.ts
export const TRENDING_CONFIG = {
  thresholds: {
    minUniqueViews: 50,
    minOrders: 3
  },

  ageDecay: {
    halfLifeDays: 14
  },

  weights: {
    engagement: 0.40,
    awareness: 0.25,
    quality: 0.20,
    attendance: 0.10,
    revenue: 0.05
  },

  engagement: {
    ordersWeight: 0.5,
    ticketsWeight: 0.3,
    conversionWeight: 0.2,
    maxConversionBoost: 0.25
  },

  awareness: {
    viewsWeight: 0.7,
    recencyWeight: 0.3
  },

  quality: {
    minRating: 4,
    maxReviewInfluence: 10
  },

  caps: {
    maxNormalizedValue: 3.0
  }
} as const;
