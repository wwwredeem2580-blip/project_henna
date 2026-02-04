import mongoose from 'mongoose';

/**
 * TicketSheet Schema
 * Tracks PDF ticket sheet generation for emergency manual verification
 */
const ticketSheetSchema = new mongoose.Schema({
  eventId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event', 
    required: true,
    index: true 
  },
  
  // Generation tracking
  generatedAt: { type: Date, required: true, default: Date.now },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Host user ID
  
  // Availability window
  availableFrom: { type: Date, required: true }, // 24h before event
  expiresAt: { type: Date, required: true }, // Event end date
  
  // Download tracking
  downloadedAt: [{ type: Date }], // Array of download timestamps
  downloadedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of user IDs
  
  // PDF storage
  pdfUrl: { type: String, required: true }, // S3/storage URL
  pdfKey: { type: String, required: true }, // Storage key for deletion
  
  // Metadata
  totalTickets: { type: Number, required: true }, // Number of tickets in sheet
  fileSize: { type: Number }, // PDF file size in bytes
  
  // Status
  status: { 
    type: String, 
    enum: ['generating', 'available', 'expired', 'deleted'],
    default: 'generating'
  }
}, {
  timestamps: true
});

// Indexes
ticketSheetSchema.index({ eventId: 1, status: 1 });
ticketSheetSchema.index({ availableFrom: 1 });

// Method to record download
ticketSheetSchema.methods.recordDownload = function(userId: string) {
  this.downloadedAt.push(new Date());
  this.downloadedBy.push(new mongoose.Types.ObjectId(userId));
  return this.save();
};

// Method to check if available
ticketSheetSchema.methods.isAvailable = function() {
  const now = new Date();
  return this.status === 'available' && 
         now >= this.availableFrom && 
         now <= this.expiresAt;
};

export default ticketSheetSchema;
