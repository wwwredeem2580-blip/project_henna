import mediaSchema from "../schema/Media";
import mongoose from "mongoose";

export const Media = mongoose.models.Media || mongoose.model('Media', mediaSchema);