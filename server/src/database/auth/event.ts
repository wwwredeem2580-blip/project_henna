import eventViewsSchema from "../schema/Event.views";
import eventSchema from "../schema/Event";
import mongoose from "mongoose";

export const EventViews = mongoose.models.EventViews || mongoose.model('EventViews', eventViewsSchema);
export const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);
