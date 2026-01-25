import mongoose from 'mongoose';

export const sessionSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  doorsOpen: Date,
}, { _id: false });

export const scheduleSchema = new mongoose.Schema({
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  timezone: String,
  isMultiDay: Boolean,
  doors: String,
  type: { type: String, enum: ['single', 'multiple'], default: 'single' },
  sessions: [sessionSchema]
}, { _id: false });