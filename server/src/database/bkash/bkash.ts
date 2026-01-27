import bkashSchema from "../schema/Bkash";
import mongoose from "mongoose";

export const Bkash = mongoose.models.Bkash || mongoose.model('Bkash', bkashSchema);