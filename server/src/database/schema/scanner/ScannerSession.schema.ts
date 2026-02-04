import mongoose from 'mongoose';

/**
 * Scanner Session Schema
 * Represents a scanning session created by a host for an event
 * Simplified for PWA implementation - uses shared token for all devices
 */
const scannerSessionSchema = new mongoose.Schema({
  // BELONGS TO
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
    index: true
  },
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // SESSION STATUS
  sessionStatus: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active',
    required: true,
    index: true
  },

  // ACCESS CONTROL
  accessToken: {
    type: String,
    required: true,
    unique: true,
    index: true
  }, // JWT token shared by all devices in this session

  maxDevices: {
    type: Number,
    default: 5,
    required: true
  }, // Maximum number of devices allowed

  activeDeviceCount: {
    type: Number,
    default: 0,
    required: true
  }, // Current number of active devices

  // LIFECYCLE
  startTime: {
    type: Date,
    default: Date.now,
    required: true
  },

  expiresAt: {
    type: Date,
    required: true
  }, // Event end + 3 hours

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
scannerSessionSchema.pre('save', function(next: any) {
  this.updatedAt = new Date();
  next();
});

// Method to check if session is active
scannerSessionSchema.methods.isActive = function() {
  return this.sessionStatus === 'active' && new Date() < this.expiresAt;
};

// Method to check if can add more devices
scannerSessionSchema.methods.canAddDevice = function() {
  return this.isActive() && this.activeDeviceCount < this.maxDevices;
};

// Method to close session
scannerSessionSchema.methods.close = async function() {
  this.sessionStatus = 'closed';
  return this.save();
};

export default scannerSessionSchema;
