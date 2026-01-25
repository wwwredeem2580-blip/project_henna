import mongoose from 'mongoose';

export const metricsSchema = new mongoose.Schema({
  views: { type: Number, default: 0 },
  uniqueViews: { type: Number, default: 0 },
  orders: { type: Number, default: 0 },
  ticketsSold: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
  checkIns: { type: Number, default: 0 },
  lastViewedAt: Date, // for trending calculation

  // --- For Review ---
  averageRating: Number,
  reviewCount: { type: Number, default: 0 },
}, { _id: false });