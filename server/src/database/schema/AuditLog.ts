import mongoose from 'mongoose';

/**
 * Global Audit Log Schema
 * Tracks all administrative actions across the platform for compliance and security
 */
const auditLogSchema = new mongoose.Schema({
  // Action identifier (e.g., "TICKET_STATUS_CHANGED", "ORDER_REFUNDED")
  action: {
    type: String,
    required: true,
    index: true,
    uppercase: true
  },

  // Resource type being modified (e.g., "ticket", "order", "event", "user")
  resource: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },

  // ID of the affected resource
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },

  // Admin who performed the action
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Before/after state for tracking changes
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed
  },

  // Additional context (reason, notes, etc.)
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // Timestamp (auto-indexed for time-based queries)
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },

  // Optional IP address for security tracking
  ipAddress: {
    type: String,
    default: null
  }
}, {
  timestamps: false // Using custom timestamp field
});

// Compound indexes for common query patterns
auditLogSchema.index({ resourceId: 1, timestamp: -1 });
auditLogSchema.index({ adminId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1, timestamp: -1 });

// TTL index - auto-delete logs older than 2 years (optional, adjust as needed)
// auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 63072000 });

export default auditLogSchema;
