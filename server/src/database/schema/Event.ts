import mongoose from 'mongoose';
import * as EventUtils from './event/index';

const eventSchema = new mongoose.Schema(
  {
    // =====================
    // CORE
    // =====================
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    // =====================
    // STEP 1: BASICS
    // =====================
    title: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 100,
    },

    category: {
      type: String,
      required: true,
      index: true,
    },

    subCategory: {
      type: [String],
      default: [],
      index: true,
    },

    tagline: {
      type: String,
      maxlength: 150,
    },

    // =====================
    // STEP 2: DETAILS
    // =====================
    description: {
      type: String,
      minlength: 50,
      maxlength: 5000,
    },

    highlights: {
      type: [String],
      default: [],
    },

    languages: {
      type: [String],
      default: [],
    },

    media: EventUtils.mediaSchema,

    // =====================
    // STEP 3: DATE, TIME & LOCATION
    // =====================
    schedule: EventUtils.scheduleSchema,
    venue: EventUtils.venueSchema,

    // =====================
    // STEP 4: VERIFICATION
    // =====================
    organizer: EventUtils.organizerSchema,
    verification: EventUtils.verificationSchema,

    // =====================
    // STEP 5: TICKETS
    // =====================
    tickets: {
      type: [EventUtils.ticketSchema],
      default: [],
    },

    // =====================
    // STATUS & WORKFLOW
    // =====================
    status: {
      type: String,
      enum: [
        'draft',
        'pending_approval',
        'approved',
        'rejected',
        'published',
        'live',
        'ended',
        'cancelled',
      ],
      default: 'draft',
      index: true,
    },

    rejectionReason: String,
    publishedAt: Date,

    scheduleModified: {
      type: Boolean,
      default: false,
    },

    // =====================
    // METRICS (READ-HEAVY)
    // =====================
    metrics: EventUtils.metricsSchema,

    // =====================
    // PLATFORM (SYSTEM-OWNED)
    // =====================
    platform: {
      fee: {
        commission: { type: Number, default: 5 },
        paymentProcessingFee: Number,
        currency: { type: String, default: 'BDT' },
      },

      terms: {
        termsAccepted: { type: Boolean, default: false },
        legalPermissionAccepted: { type: Boolean, default: false },
        platformTermsAccepted: { type: Boolean, default: false },
      },

      payout: {
        status: {
          type: String,
          enum: ['pending', 'scheduled', 'completed', 'skipped'],
          default: 'pending',
        },
        skipReason: String,
        amount: Number,
        scheduledDate: Date,
        paidAt: Date,
        payoutId: String,
      },
    },

    // =====================
    // SEO
    // =====================
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
      ogImage: String,
    },

    // =====================
    // MODERATION & VISIBILITY
    // =====================
    moderation: {
      features: {
        isFeatured: { type: Boolean, default: false },
        isPremium: { type: Boolean, default: false },
        badges: { type: [String], default: [] },
        featuredAt: Date,
        featuredPriority: { type: Number, default: 0 },
      },

      cancellation: {
        allowed: { type: Boolean, default: true },
        refundPercentage: { type: Number, default: 100 },
        deadlineHours: Number,
      },

      sales: {
        paused: { type: Boolean, default: false },
        pausedAt: Date,
        pausedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        pausedReason: String,
      },

      visibility: {
        type: String,
        enum: ['public', 'private', 'unlisted'],
        default: 'public',
        index: true,
      },
    },

    // =====================
    // USER REPORTS
    // =====================
    flags: {
      isFlagged: { type: Boolean, default: false },
      reports: { type: [EventUtils.flagSchema], default: [] },
      suspended: { type: Boolean, default: false },
      suspendedUntil: Date,
      suspensionReason: String,
      suspendedAt: Date,
      banReason: String,
    },

    // =====================
    // AUDIT
    // =====================
    submittedAt: Date,

    history: [
      {
        action: String,
        performedBy: mongoose.Schema.Types.ObjectId,
        timestamp: { type: Date, default: Date.now },
        changes: mongoose.Schema.Types.Mixed,
      },
    ],

    deletedAt: Date,
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  }
);

// =====================
// INDEXES
// =====================

// Geo
eventSchema.index({ 'venue.coordinates': '2dsphere' });

// Core filters
eventSchema.index({
  status: 1,
  'moderation.visibility': 1,
  'schedule.startDate': 1,
});

// Featured / promoted
eventSchema.index({
  'moderation.features.isFeatured': 1,
  'moderation.features.featuredPriority': -1,
});

// Trending
eventSchema.index({
  'metrics.lastViewedAt': -1,
  'metrics.ticketsSold': -1,
});

// Host dashboard
eventSchema.index({
  hostId: 1,
  status: 1,
  updatedAt: -1,
});

// Location-based discovery
eventSchema.index({
  'venue.address.city': 1,
  status: 1,
});

export default eventSchema;
