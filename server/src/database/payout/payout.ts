import payoutSchema from "../schema/Payout";
import mongoose from "mongoose";

export const Payout = mongoose.models.Payout || mongoose.model('Payout', payoutSchema);