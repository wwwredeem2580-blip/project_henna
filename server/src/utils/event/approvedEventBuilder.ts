import { approvedEventEditSchema } from "../../schema/event.schema";
import { z } from "zod";

export const buildEventForApprovedEdit = (validatedInput: z.infer<typeof approvedEventEditSchema>) => {
  return {
    ...validatedInput,
    tickets: validatedInput.tickets?.map(t => ({
      ...t,
      sold: 0,
      reserved: 0,
    })),
    status: 'approved',
  };
}
