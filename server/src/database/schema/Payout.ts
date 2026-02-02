import mongoose from 'mongoose';

const payoutSchema = new mongoose.Schema({
  payoutNumber: {
    type: String,
    required: true
  },         // "PAYOUT-20260109-ABC123"
  
  // Ownership
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  
  // Financial Breakdown
  grossRevenue: {
    type: Number,
  },         // Total Revenue
  grossPayout: {
    type: Number,
  },
  refundAmount: {
    type: Number,
  },         // Total refunded
  netPayout: {
    type: Number,
  },            // What host receives
  currency: {
    type: String,
    default: 'BDT'
  },             // "BDT"
  
  // Order Summary
  totalOrders: {
    type: Number,
  },
  confirmedOrders: {
    type: Number,
  },
  refundedOrders: {
    type: Number,
  },
  totalTicketsSold: {
    type: Number,
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'processing', 'completed', 'failed', 'on_hold', 'rejected'],
    default: 'pending'
  },  // "pending" | "approved" | "processing" | "completed" | "failed" | "on_hold"
  
  // Admin Actions
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },         // Admin who approved
  approvedAt: {
    type: Date,
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  rejectedAt: {
    type: Date,
  },
  rejectionReason: {
    type: String,
  },
  
  // Payment Details
  paymentMethod: {
    type: String,
    enum: ['bkash', 'bank_transfer', 'mobile_banking'],
    default: 'bkash'
  },        // "bkash" | "bank_transfer" | "mobile_banking"
  accountNumber: {
    type: String,
  },        // Host's bKash number or bank account number
  accountHolderName: {
    type: String,
  },
  
  // Bank Transfer Details (when paymentMethod = 'bank_transfer')
  bankName: {
    type: String,
  },
  branchName: {
    type: String,
  },
  routingNumber: {
    type: String,
  },
  
  // Processing
  initiatedAt: {
    type: Date,
  },            // When payout started
  completedAt: {
    type: Date,
  },            // When money sent
  failedAt: {
    type: Date,
  },
  transactionId: {
    type: String,
  },        // bKash transaction ID
  
  // Notes
  adminNotes: {
    type: String,
  },           // Internal notes
  hostNotes: {
    type: String,
  },            // Host can add context
  
  // Audit
  createdAt: Date,
  updatedAt: Date,
  
  // Flags
  requiresReview: {
    type: Boolean,
    default: false
  },      // Suspicious activity
  reviewReason: {
    type: String,
  },         // Why flagged
  onHold: {
    type: Boolean,
    default: false
  },              // Admin hold
  holdReason: {
    type: String,
  }
}, { timestamps: true });

export default payoutSchema;
