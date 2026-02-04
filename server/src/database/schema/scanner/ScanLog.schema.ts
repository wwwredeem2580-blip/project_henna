import mongoose from 'mongoose';

/**
 * Scan Log Schema
 * Records every ticket scan attempt (successful or failed)
 * Used for analytics, audit trail, and duplicate detection
 */
const scanLogSchema = new mongoose.Schema({
  // REFERENCES
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: false, // Optional since invalid scans won't have a ticket
    default: null,
    index: true
  },

  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
    index: true
  },

  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ScannerSession',
    required: true,
    index: true
  },

  deviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ScannerDevice',
    required: true,
    index: true
  },

  // SCAN DETAILS
  scanTimestamp: {
    type: Date,
    default: Date.now,
    required: true,
    index: true
  },

  scanResult: {
    type: String,
    enum: ['success', 'duplicate', 'invalid', 'expired', 'cancelled', 'refunded'],
    required: true,
    index: true
  },

  // OFFLINE TRACKING
  offlineScanned: {
    type: Boolean,
    default: false,
    required: true
  }, // Was this scan performed while device was offline?

  syncedAt: {
    type: Date
  }, // When offline scan was synced to server (null if scanned online)

  // MANUAL VERIFICATION (Emergency Override)
  isManualOverride: {
    type: Boolean,
    default: false
  }, // Was this check-in performed manually by host?

  manualVerifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }, // Host user ID who performed manual check-in

  manualVerificationNotes: {
    type: String
  }, // Optional reason/notes for manual override

  manualVerificationIP: {
    type: String
  }, // IP address for security audit

  // METADATA
  ticketNumber: {
    type: String
  }, // Denormalized for quick lookup

  deviceName: {
    type: String
  } // Denormalized for reporting
});

// Compound index for duplicate detection
scanLogSchema.index({ ticketId: 1, scanResult: 1 });

// Index for analytics queries
scanLogSchema.index({ eventId: 1, scanTimestamp: 1 });

// Index for device performance tracking
scanLogSchema.index({ deviceId: 1, scanTimestamp: 1 });

export default scanLogSchema;
