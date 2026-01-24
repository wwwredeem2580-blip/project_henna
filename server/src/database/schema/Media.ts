import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true, default: 'profile_picture' },
  provider: { type: String, enum: ['imagekit', 'backblaze'], required: true },
  status: { type: String, enum: ['temp', 'permanent', 'deleted'], required: true },

  // ImageKit specific
  fileId: String,
  url: String,
  thumbnailUrl: String,

  // Backblaze specific
  bucketName: String,
  objectKey: String,

  // Metadata
  filename: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: false },

  // Lifecycle
  uploadedAt: { type: Date, default: Date.now },
  movedToPermanentAt: Date,
  expiresAt: Date,  // For temp files
  deletedAt: Date,
});

// Indexes
mediaSchema.index({ userId: 1 });
mediaSchema.index({ status: 1 });
mediaSchema.index({ expiresAt: 1 });
mediaSchema.index({ uploadedAt: 1 });

export default mediaSchema;