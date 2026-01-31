import eventSchema from "../schema/Event";
import eventViewsSchema from "../schema/Event.views";
import mongoose from "mongoose";

export const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);
export const EventViews = mongoose.models.EventViews || mongoose.model('EventViews', eventViewsSchema);