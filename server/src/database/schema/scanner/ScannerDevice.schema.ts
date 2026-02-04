import mongoose from 'mongoose';

/**
 * Scanner Device Schema
 * Represents a device (browser) that has joined a scanner session
 * Simplified for PWA - minimal device tracking
 */
const scannerDeviceSchema = new mongoose.Schema({
  // BELONGS TO
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ScannerSession',
    required: true,
    index: true
  },

  // DEVICE INFO
  deviceName: {
    type: String,
    required: true,
    trim: true
  }, // User-provided name (e.g., "Gate 1 - John's Phone")

  userAgent: {
    type: String,
    required: true
  }, // Browser user agent for basic fingerprinting

  // DEVICE MANAGEMENT
  status: {
    type: String,
    enum: ['active', 'disabled'],
    default: 'active',
    required: true
  },

  battery: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  }, // Battery percentage (0-100)

  gate: {
    type: String,
    default: null,
    trim: true
  }, // Assigned gate/entrance (e.g., "Gate A", "Main Entrance")

  lastScanAt: {
    type: Date,
    default: null
  }, // Timestamp of last successful scan

  revokedAt: {
    type: Date,
    default: null
  }, // Timestamp when device was force logged out

  // ACTIVITY TRACKING
  lastSeen: {
    type: Date,
    default: Date.now,
    required: true
  },

  totalScans: {
    type: Number,
    default: 0,
    required: true
  },

  // LIFECYCLE
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Method to update last seen
scannerDeviceSchema.methods.updateActivity = async function() {
  this.lastSeen = new Date();
  return this.save();
};

// Method to increment scan count
scannerDeviceSchema.methods.incrementScans = async function() {
  this.totalScans += 1;
  this.lastSeen = new Date();
  return this.save();
};

// Virtual to check if device is online (seen in last 2 minutes)
scannerDeviceSchema.virtual('isOnline').get(function() {
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
  return this.lastSeen > twoMinutesAgo;
});

export default scannerDeviceSchema;
