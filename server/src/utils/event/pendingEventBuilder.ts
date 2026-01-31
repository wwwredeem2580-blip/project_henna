import { pendingApprovalEditSchema, submitEventSchema } from "../../schema/event.schema";
import { z } from "zod";

export const buildEventForPending = (validatedInput: z.infer<typeof pendingApprovalEditSchema>, event: z.infer<typeof submitEventSchema>) => {
  const { tickets, additionalDocuments, ...updateDataWithoutTickets } = validatedInput;
  
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
  
  const additionalDocumentsArray = additionalDocuments ? additionalDocuments : [];
  
  return {
    ...updateData,
    status: 'pending_approval',
    verification: {
      ...event?.verification,
      documents: [...event?.verification?.documents || [], ...additionalDocumentsArray],
    },
  };
}
