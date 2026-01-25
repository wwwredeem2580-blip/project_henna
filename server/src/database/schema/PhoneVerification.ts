import mongoose from "mongoose";

/**
 * Phone Verification Schema
 * Handles OTP generation, verification, and rate limiting
 */
const phoneVerificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  otp: {
    type: String,
    required: true
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
  // Attempt tracking (security)
  attempts: {
    type: Number,
    default: 0
  },
  lastAttemptAt: {
    type: Date
  },
  maxAttempts: {
    type: Number,
    default: 5
  },
  // Rate limiting
  sentCount: {
    type: Number,
    default: 1
  },
  lastSentAt: {
    type: Date,
    default: Date.now
  },
  // Metadata
  sentFrom: {
    type: String // IP address
  }
}, {
  timestamps: true
});

// Indexes
phoneVerificationSchema.index({ userId: 1, phoneNumber: 1 });
phoneVerificationSchema.index({ userId: 1, verified: 1 });
phoneVerificationSchema.index({ phoneNumber: 1, verified: 1 });

// TTL Index: Auto-delete expired OTPs after they expire
phoneVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Methods
phoneVerificationSchema.methods.isExpired = function() {
  return this.expiresAt < new Date();
};

phoneVerificationSchema.methods.isMaxAttemptsReached = function() {
  return this.attempts >= this.maxAttempts;
};

phoneVerificationSchema.methods.incrementAttempts = function() {
  this.attempts += 1;
  this.lastAttemptAt = new Date();
  return this.save();
};

phoneVerificationSchema.methods.canResend = function(cooldownSeconds = 60) {
  if (!this.lastSentAt) return true;
  const cooldownMs = cooldownSeconds * 1000;
  return Date.now() - this.lastSentAt.getTime() > cooldownMs;
};

export default phoneVerificationSchema;
