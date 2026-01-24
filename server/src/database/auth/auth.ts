import emailVerificationSchema from "../schema/EmailVerification";
import userSchema from "../schema/User";
import mongoose from "mongoose";

export const EmailVerification = mongoose.models.EmailVerification || mongoose.model('EmailVerification', emailVerificationSchema);
export const User = mongoose.models.User || mongoose.model('User', userSchema);