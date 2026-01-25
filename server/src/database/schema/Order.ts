import mongoose from 'mongoose';

// Order Ticket Schema
const orderTicketSchema = new mongoose.Schema({
  ticketVariantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  variantName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  pricePerTicket: {
    type: Number,
    required: true,
    min: 0
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

// Pricing Schema
const pricingSchema = new mongoose.Schema({
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  platformFee: {
    type: Number,
    required: true,
    min: 0
  },
  paymentFee: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'BDT'
  },
  hostPayout: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

// Refund Schema
const refundSchema = new mongoose.Schema({
  reason: {
    type: String,
    required: true,
    enum: ['event_cancelled', 'user_request', 'fraud', 'price_reduction']
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  refundedAt: {
    type: Date,
    default: Date.now
  },
  stripeRefundId: String
}, { _id: false });

// Main Order Schema
const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },

  // WHO
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // WHAT
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },

  paymentId: {
    type: String,
    ref: 'Payment',
    required: false,
  },

  tickets: [orderTicketSchema],

  // MONEY
  pricing: pricingSchema,

  // STATUS
  status: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'cancelled', 'refunded'],
    default: 'pending'
  },

  requiresManualReview: {
    type: Boolean,
    default: false
  },

  manualReviewReason: {
    type: String,
    default: null
  },
  
  paymentMethod: {
    type: String,
    required: true,
    enum: ['card', 'bkash', 'bank_transfer', 'free']
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'succeeded', 'failed'],
    default: 'pending'
  },
  paidAt: Date,

  // TICKETS ISSUED
  ticketIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket'
  }],

  // LIFECYCLE
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  confirmedAt: Date,
  cancelledAt: Date,
  refundedAt: Date,
  reminderSentAt: Date,

  // CONTACT
  buyerEmail: {
    type: String,
    required: true
  },
  buyerPhone: String,

  // AUDIT
  ipAddress: String,
  userAgent: String,

  // REFUND (if applicable)
  refund: refundSchema
});

// Indexes for performance
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ eventId: 1, status: 1 });
orderSchema.index({ status: 1, expiresAt: 1 });

// Auto-generate order number
orderSchema.pre('save', function(next: any) {
  if (this.isNew && !this.orderNumber) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  next();
});

// Update updatedAt on save
orderSchema.pre('save', function(next: any) {
  // Note: We don't have updatedAt field, but could add if needed
  next();
});

export default orderSchema;