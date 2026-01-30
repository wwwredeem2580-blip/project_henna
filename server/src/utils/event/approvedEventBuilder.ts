import { approvedEventEditSchema } from "../../schema/event.schema";
import { z } from "zod";

export const buildEventForApprovedEdit = (
  validatedInput: z.infer<typeof approvedEventEditSchema>
) => {
  // Only exclude tickets if they're not provided in the input
  // This allows EventTicketsTab to update tickets while preventing EventDetailsTab from deleting them
  const { tickets, ...updateDataWithoutTickets } = validatedInput;
  
  let finalTickets = tickets;
  
  // For approved events, sales haven't started yet, so sold/reserved are always 0
  if (tickets) {
    finalTickets = tickets.map((ticket: any) => ({
      ...ticket,
      sold: 0,
      reserved: 0,
    }));
  }
  
  const updateData = finalTickets !== undefined 
    ? { ...updateDataWithoutTickets, tickets: finalTickets }  // Include tickets if explicitly provided
    : updateDataWithoutTickets;                                // Exclude tickets if not provided
  
  return {
    ...updateData,
    status: 'approved',
  };
}
