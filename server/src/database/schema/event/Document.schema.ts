import mongoose from 'mongoose';

export const documentSchema = new mongoose.Schema({
  type: { type: String, default: 'verification_docs' },
  url: String,
  filename: String,
  objectKey: String,
  uploadedAt: Date,
  status: { type: String, enum: ['pending', 'approved', 'rejected'] },
  rejectionReason: String,
}, { _id: false });