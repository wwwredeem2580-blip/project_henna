import { pendingApprovalEditSchema, submitEventSchema } from "../../schema/event.schema";
import { z } from "zod";

export const buildEventForPending = (validatedInput: z.infer<typeof pendingApprovalEditSchema>, event: z.infer<typeof submitEventSchema>) => {
  return {
    ...validatedInput,
    tickets: validatedInput.tickets?.map(t => ({
      ...t,
      sold: 0,
      reserved: 0,
    })),
    verification: {
      ...event.verification,
      documents: [...(event.verification?.documents || []), ...(validatedInput.additionalDocuments || [])],
    },
    status: 'pending_approval',
  };
}
