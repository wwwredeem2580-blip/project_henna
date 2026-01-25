import mongoose from "mongoose";

export const addressSchema = new mongoose.Schema({
  street: String,
  city: { type: String, required: true },
  country: { type: String, required: true },
}, { _id: false });

export const venueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: addressSchema,
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    } // [lng, lat]
  },
  capacity: { type: Number, required: true, min: 10, max: 100000 },
  type: { type: String, enum: ['indoor', 'outdoor', 'hybrid'] },
  parking: Boolean,
  publicTransit: String,
}, { _id: false });