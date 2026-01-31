import mongoose from "mongoose";

/**
 * Payment Details Schema
 * Stores payment/payout information separate from User
 */
const paymentDetailsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  
  // Payment Method
  method: {
    type: String,
    enum: ['bkash', 'nagad', 'rocket', 'bank_transfer'],
    required: true,
    index: true
  },
  
  // Mobile Money (bKash, Nagad, Rocket)
  mobileNumber: {
    type: String,
    trim: true
  },
  accountHolderName: {
    type: String,
    trim: true
  },
  
  // Bank Transfer
  bankName: {
    type: String,
    trim: true
  },
  accountNumber: {
    type: String,
    trim: true
  },
  branchName: {
    type: String,
    trim: true
  },
  routingNumber: {
    type: String,
    trim: true
  },
  swiftCode: {
    type: String,
    trim: true
  },
  
  // Verification
  verified: {
    type: Boolean,
    default: false,
    index: true
  },
  verifiedAt: {
    type: Date
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: {
    type: String
  },
  
  // Metadata
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
paymentDetailsSchema.index({ userId: 1 });
paymentDetailsSchema.index({ verified: 1, createdAt: -1 });
paymentDetailsSchema.index({ method: 1, verified: 1 });

// Methods
paymentDetailsSchema.methods.markAsVerified = function(verifiedBy: mongoose.Types.ObjectId) {
  this.verified = true;
  this.verifiedAt = new Date();
  this.verifiedBy = verifiedBy;
  this.rejectionReason = undefined;
  return this.save();
};

paymentDetailsSchema.methods.reject = function(reason: string, rejectedBy: mongoose.Types.ObjectId) {
  this.verified = false;
  this.verifiedAt = undefined;
  this.rejectionReason = reason;
  this.lastUpdatedBy = rejectedBy;
  return this.save();
};

paymentDetailsSchema.methods.isMobileMoney = function() {
  return ['bkash', 'nagad', 'rocket'].includes(this.method);
};

paymentDetailsSchema.methods.isBankTransfer = function() {
  return this.method === 'bank_transfer';
};

export default paymentDetailsSchema;
