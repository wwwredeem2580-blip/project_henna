import supportConversationSchema from "../schema/Support";
import mongoose from "mongoose";

export const Support = mongoose.models.Support || mongoose.model('Support', supportConversationSchema);