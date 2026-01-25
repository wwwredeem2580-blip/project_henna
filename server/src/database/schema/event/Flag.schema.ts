import mongoose from 'mongoose';

export const flagSchema = new mongoose.Schema({
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reason: String,
  description: String,
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'resolved', 'dismissed'], default: 'pending' },
}, { _id: false });