import mongoose from 'mongoose';

export const ticketSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: {
    amount: { type: Number, required: true },
    currency: { type: String, default: 'BDT' },
  },
  quantity: { type: Number, required: true },
  sold: { type: Number, default: 0 },
  reserved: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isVisible: { type: Boolean, default: true },
  
  // Visual customization
  wristbandColor: { type: String, default: '#4f46e5' },
  accentColor: { type: String, default: '#4f46e5' },
  isDark: { type: Boolean, default: false },
  glassMode: { type: Boolean, default: false },
  cornerRadius: { type: Number, default: 0, min: 0, max: 50 },
  perforationStyle: { type: String, enum: ['solid', 'dashed', 'dotted'], default: 'dotted' },
  
  limits: {
    minPerOrder: { type: Number, default: 1 },
    maxPerOrder: { type: Number, default: 5 },
  },
  benefits: [String],
  tier: { type: String, default: 'regular' },
  salesWindow: {
    startDate: Date,
    endDate: Date,
  },
  lastPriceReductionAt: Date,
});