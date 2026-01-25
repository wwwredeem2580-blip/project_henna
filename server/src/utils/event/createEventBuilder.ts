import { createEventSchema } from "../../schema/event.schema";
import { z } from "zod";
import { generateSlug } from "./generateSlug";

export const buildEventForCreate = (validatedInput: z.infer<typeof createEventSchema>) => {
  return {
    ...validatedInput,
    slug: generateSlug(validatedInput.title),
    tickets: validatedInput.tickets?.map(t => ({
      ...t,
      sold: 0,
      reserved: 0,
    })),
    platform: {
      ...validatedInput.platform,
    },
    status: 'draft',
  };
}
