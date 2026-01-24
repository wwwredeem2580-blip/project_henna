import mongoose from "mongoose";

/**
 * Email Verification Schema
 * Handles email verification tokens and tracking
 */
const emailVerificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date
  },
  attempts: {
    type: Number,
    default: 0
  },
  lastAttemptAt: {
    type: Date
  },
  // Metadata
  sentFrom: {
    type: String // IP address
  }
}, {
  timestamps: true
});

// Indexes
emailVerificationSchema.index({ userId: 1, verified: 1 });
emailVerificationSchema.index({ token: 1, verified: 1 });

// TTL Index: Auto-delete expired tokens after they expire
emailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Methods
emailVerificationSchema.methods.isExpired = function() {
  return this.expiresAt < new Date();
};

emailVerificationSchema.methods.incrementAttempts = function() {
  this.attempts += 1;
  this.lastAttemptAt = new Date();
  return this.save();
};

export default emailVerificationSchema;
