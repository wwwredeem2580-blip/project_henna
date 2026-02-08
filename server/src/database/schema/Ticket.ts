import mongoose from 'mongoose';

// Ticket schema for individual issued tickets
const ticketSchema = new mongoose.Schema({
  ticketNumber: { type: String, required: true, unique: true, index: true }, // Human-readable: "TKT-EVT123-A3K9-01"

  // BELONGS TO
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true }, // Parent order
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true }, // Which event
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, // Owner
  ticketVariantId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Which type (VIP, GA, etc)

  // DETAILS (denormalized for speed)
  eventTitle: { type: String, required: true },
  eventDate: { type: Date, required: true },
  eventVenue: { type: String, required: true },
  ticketType: { type: String, required: true }, // "VIP Pass"
  price: { type: Number, required: true },

  // QR CODE
  qrCode: { type: String, unique: true, required: true }, // Unique hash: SHA256(ticketId + secret)
  qrCodeUrl: { type: String, required: true }, // ImageKit/S3 URL to QR image

  // STATUS
  status: {
    type: String,
    required: true,
    enum: ['valid', 'used', 'cancelled', 'refunded', 'transferred'],
    default: 'valid',
    index: true
  },

  // CHECK-IN
  checkInStatus: {
    type: String,
    required: true,
    enum: ['not_checked_in', 'checked_in'],
    default: 'not_checked_in'
  },
  checkedInAt: Date,
  checkedInBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Staff/scanner user ID

  // TRANSFER (if user transfers ticket to friend)
  transferredTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // New owner user ID
  transferredAt: Date,

  // LIFECYCLE
  issuedAt: { type: Date, default: Date.now }, // When ticket was created
  validUntil: { type: Date, required: true }, // Event end date (after this, ticket expires)

  // SECURITY
  secretHash: { type: String, required: true }, // Internal validation hash (never exposed)
});


// Virtual for checking if ticket is expired
ticketSchema.virtual('isExpired').get(function() {
  return new Date() > this.validUntil;
});

// Method to check if ticket can be used
ticketSchema.methods.canBeUsed = function() {
  return this.status === 'valid' &&
         this.checkInStatus === 'not_checked_in' &&
         !this.isExpired;
};

// Method to mark as used (check-in)
ticketSchema.methods.checkIn = function(staffUserId: string) {
  if (!this.canBeUsed()) {
    throw new Error('Ticket cannot be checked in');
  }

  this.checkInStatus = 'checked_in';
  this.checkedInAt = new Date();
  this.checkedInBy = new mongoose.Types.ObjectId(staffUserId);

  return this.save();
};

// Method to transfer ticket
ticketSchema.methods.transfer = function(newOwnerId: string) {
  if (this.status !== 'valid') {
    throw new Error('Only valid tickets can be transferred');
  }

  this.transferredTo = new mongoose.Types.ObjectId(newOwnerId);
  this.transferredAt = new Date();
  this.userId = new mongoose.Types.ObjectId(newOwnerId); // Update ownership

  return this.save();
};

// =====================
// PERFORMANCE INDEXES (Phase 1)
// =====================

// Scanner operations - bulk ticket lookup by event
// Critical for scanner dashboard and ticket sheet generation
ticketSchema.index({
  eventId: 1,
  status: 1,
  checkInStatus: 1
});

// User's tickets for specific event (wallet view)
ticketSchema.index({
  userId: 1,
  eventId: 1,
  status: 1
});

// Order tickets lookup (for order details page)
ticketSchema.index({
  orderId: 1,
  status: 1
});

// Check-in history queries
ticketSchema.index({
  eventId: 1,
  checkInStatus: 1,
  checkedInAt: -1
});

// Ticket expiry cleanup job
ticketSchema.index({
  validUntil: 1,
  status: 1
});

export default ticketSchema;
