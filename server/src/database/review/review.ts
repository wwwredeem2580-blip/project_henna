import reviewSchema from "../schema/Review";
import mongoose from "mongoose";

export const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);