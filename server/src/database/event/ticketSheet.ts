import ticketSheetSchema from '../schema/event/TicketSheet.schema';
import mongoose from 'mongoose';

export const TicketSheet = mongoose.models.TicketSheet || mongoose.model('TicketSheet', ticketSheetSchema);
