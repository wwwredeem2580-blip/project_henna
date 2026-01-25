import mongoose from "mongoose";

export const mediaSchema = new mongoose.Schema({
  coverImage: {
    url: String,
    thumbnailUrl: String,
    alt: String,
  },
  gallery: [{
    url: String,
    caption: String,
    order: Number,
  }],
}, { _id: false });