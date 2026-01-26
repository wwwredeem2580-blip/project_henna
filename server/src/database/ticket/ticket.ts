import ticketSchema from "../schema/Ticket";
import mongoose from "mongoose";

export const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);