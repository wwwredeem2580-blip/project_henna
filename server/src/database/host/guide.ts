import mongoose from "mongoose";
import hostGuideProgressSchema from "../schema/HostGuideProgress";

export const HostGuideProgress = mongoose.models.HostGuideProgress || mongoose.model('HostGuideProgress', hostGuideProgressSchema);
