import mongoose from 'mongoose';

export const organizerSchema = new mongoose.Schema({
  companyType: { type: String, enum: ['organizer', 'venue_owner', 'representative', 'artist'] },
  companyName: String,
  companyEmail: String,
  host: { type: String, required: true },
}, { _id: false });