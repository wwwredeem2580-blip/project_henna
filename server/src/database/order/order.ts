import orderSchema from "../schema/Order";
import mongoose from "mongoose";

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);