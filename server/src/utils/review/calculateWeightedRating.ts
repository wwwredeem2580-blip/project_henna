import { Review } from "../../database/review/review";
import mongoose from "mongoose";

export async function calculateWeightedRating(eventId: string): Promise<number> {
  const reviews = await Review.find({
    eventId: new mongoose.Types.ObjectId(eventId),
    status: 'approved',
    isVisible: true
  });

  if (reviews.length === 0) return 0;

  let totalWeightedRating = 0;
  let totalWeight = 0;

  reviews.forEach((review: any) => {
    const weight = review.reviewContext.hasCheckedIn ? 1.0 : 0.6;
    totalWeightedRating += review.rating * weight;
    totalWeight += weight;
  });

  return totalWeight > 0 ? totalWeightedRating / totalWeight : 0;
}