import eventSchema from "../schema/Event";
import mongoose from "mongoose";

export const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);