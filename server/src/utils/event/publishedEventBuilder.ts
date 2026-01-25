import { publishedEventEditSchema } from "../../schema/event.schema";
import { z } from "zod";

export const buildEventForPublishedEdit = (validatedInput: z.infer<typeof publishedEventEditSchema>) => {
  return {
    ...validatedInput,
    tickets: validatedInput.tickets?.map(t => ({
      ...t,
      sold: 0,
      reserved: 0,
    })),
    status: 'published',
  };
}
