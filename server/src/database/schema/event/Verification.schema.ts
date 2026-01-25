import mongoose from 'mongoose';
import { documentSchema } from './Document.schema';

export const verificationSchema = new mongoose.Schema({
  status: { type: String, enum: ['unverified', 'pending', 'verified', 'rejected', 'needs_info'], default: 'unverified' },
  documents: [documentSchema],
  additionalInfo: String,
  adminNotes: String,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  rejectionReason: String,
  requestedInfo: String,
}, { _id: false });