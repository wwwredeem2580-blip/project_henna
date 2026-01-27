import paymentSchema from "../schema/Payment";
import mongoose from "mongoose";

export const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);