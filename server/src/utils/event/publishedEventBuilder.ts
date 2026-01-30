import { publishedEventEditSchema } from "../../schema/event.schema";
import { z } from "zod";

export const buildEventForPublishedEdit = (
  validatedInput: z.infer<typeof publishedEventEditSchema>,
  existingEvent?: any
) => {
  // Only exclude tickets if they're not provided in the input
  // This allows EventTicketsTab to update tickets while preventing EventDetailsTab from deleting them
  const { tickets, ...updateDataWithoutTickets } = validatedInput;
  
  let finalTickets = tickets;
  
  // For published events, we need to preserve sold/reserved counts
  if (tickets && existingEvent?.tickets) {
    finalTickets = tickets.map((newTicket: any) => {
      // Find matching existing ticket by _id
      const existingTicket = existingEvent.tickets.find(
        (t: any) => t._id?.toString() === newTicket._id?.toString()
      );
      
      // If found, preserve sold and reserved counts
      if (existingTicket) {
        return {
          ...newTicket,
          sold: existingTicket.sold || 0,
          reserved: existingTicket.reserved || 0,
        };
      }
      
      // New ticket - initialize sold/reserved to 0
      return {
        ...newTicket,
        sold: 0,
        reserved: 0,
      };
    });
  }
  
  const updateData = finalTickets !== undefined 
    ? { ...updateDataWithoutTickets, tickets: finalTickets }  // Include tickets if explicitly provided
    : updateDataWithoutTickets;                                // Exclude tickets if not provided
  
  return {
    ...updateData,
    status: 'published',
  };
}
