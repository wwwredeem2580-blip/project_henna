import mongoose, { Schema, Document, Types, Model } from 'mongoose';
import { sanitizedString } from '../../utils/zodSanitizer'; // Your existing sanitizer

export interface IReview extends Document {
  eventId: Types.ObjectId;
  userId: Types.ObjectId;
  ticketId: Types.ObjectId;

  rating: number;
  title: string;
  comment: string;

  reviewContext: {
    hasCheckedIn: boolean;
    checkInTime?: Date;
    ticketTier: string;
    ticketType: string;
  };

  status: 'pending' | 'approved' | 'hidden' | 'flagged';
  isVisible: boolean;
  moderationNotes?: string;

  submittedAt: Date;
  moderatedAt?: Date;
  moderatorId?: Types.ObjectId;

  helpfulVotes: number;
  reportedCount: number;
  reports: Array<{
    userId: Types.ObjectId;
    reason: 'spam' | 'abusive' | 'fake' | 'irrelevant' | 'other';
    reportedAt: Date;
  }>;

  markHelpful(): Promise<IReview>;
  report(userId: string, reason: string): Promise<IReview>;
  moderate(moderatorId: string, action: 'approve' | 'hide' | 'flag', notes?: string): Promise<IReview>;
}

interface IReviewModel extends Model<IReview> {
  calculateWeightedRating(eventId: string): Promise<number>;
}

const reviewSchema = new Schema<IReview>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    ticketId: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true, index: true },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: { validator: Number.isInteger, message: 'Rating must be an integer' },
    },

    title: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    comment: { type: String, required: true, trim: true, minlength: 5, maxlength: 1000 },

    reviewContext: {
      hasCheckedIn: { type: Boolean, required: true },
      checkInTime: Date,
      ticketTier: { type: String, required: true },
      ticketType: { type: String, required: true },
    },

    status: { type: String, enum: ['pending', 'approved', 'hidden', 'flagged'], default: 'pending', index: true },
    isVisible: { type: Boolean, default: true },
    moderationNotes: { type: String, trim: true, maxlength: 500 },

    moderatorId: { type: Schema.Types.ObjectId, ref: 'User' },

    helpfulVotes: { type: Number, default: 0, min: 0 },
    reportedCount: { type: Number, default: 0, min: 0 },
    reports: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        reason: { type: String, required: true, enum: ['spam', 'abusive', 'fake', 'irrelevant', 'other'] },
        reportedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: { createdAt: 'submittedAt', updatedAt: 'moderatedAt' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ------------------------- INDEXES -------------------------
reviewSchema.index({ eventId: 1, status: 1, isVisible: 1 });
reviewSchema.index({ userId: 1, eventId: 1 }, { unique: true }); // one review per user per event
reviewSchema.index({ submittedAt: -1 });
reviewSchema.index({ 'reviewContext.hasCheckedIn': 1 });
reviewSchema.index(
  { eventId: 1, 'reviewContext.hasCheckedIn': 1, rating: 1 },
  { partialFilterExpression: { status: 'approved', isVisible: true } }
);

// ------------------------- VIRTUALS -------------------------
reviewSchema.virtual('reviewType').get(function () {
  return this.reviewContext.hasCheckedIn ? 'attended' : 'entry_access';
});

// ------------------------- PRE-SAVE HOOKS -------------------------
reviewSchema.pre('save', function (next: any) {
  // Sanitize user input
  if (this.isModified('title')) this.title = sanitizedString({ min: 2, max: 100 }).parse(this.title) || '';
  if (this.isModified('comment')) this.comment = sanitizedString({ min: 5, max: 1000 }).parse(this.comment) || '';

  next();
});

// ------------------------- INSTANCE METHODS -------------------------
reviewSchema.methods.markHelpful = async function () {
  this.helpfulVotes += 1;
  return this.save();
};

reviewSchema.methods.report = async function (userId: string, reason: string) {
  if (this.reports.some((r: any) => r.userId.toString() === userId)) return this;

  this.reports.push({ userId: new mongoose.Types.ObjectId(userId), reason, reportedAt: new Date() });
  this.reportedCount += 1;

  if (this.reportedCount >= 3) this.status = 'flagged';
  return this.save();
};

reviewSchema.methods.moderate = async function (moderatorId: string, action: 'approve' | 'hide' | 'flag', notes?: string) {
  this.moderatorId = new mongoose.Types.ObjectId(moderatorId);
  this.moderatedAt = new Date();

  switch (action) {
    case 'approve':
      this.status = 'approved';
      this.isVisible = true;
      break;
    case 'hide':
      this.status = 'hidden';
      this.isVisible = false;
      break;
    case 'flag':
      this.status = 'flagged';
      this.isVisible = false;
      break;
  }

  if (notes) this.moderationNotes = sanitizedString({ min: 5, max: 500 }).parse(notes);
  return this.save();
};

// ------------------------- STATIC METHODS -------------------------
reviewSchema.statics.calculateWeightedRating = async function (eventId: string) {
  const result = await this.aggregate([
    { $match: { eventId: new mongoose.Types.ObjectId(eventId), status: 'approved', isVisible: true } },
    {
      $project: {
        weightedRating: {
          $multiply: ['$rating', { $cond: [{ $eq: ['$reviewContext.hasCheckedIn', true] }, 1, 0.6] }],
        },
        weight: { $cond: [{ $eq: ['$reviewContext.hasCheckedIn', true] }, 1, 0.6] },
      },
    },
    { $group: { _id: null, totalWeighted: { $sum: '$weightedRating' }, totalWeight: { $sum: '$weight' } } },
  ]);

  if (!result[0] || result[0].totalWeight === 0) return 0;
  return result[0].totalWeighted / result[0].totalWeight;
};

export default reviewSchema;
