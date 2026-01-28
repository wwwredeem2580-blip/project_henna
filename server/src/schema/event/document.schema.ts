import { z } from 'zod';

export const documentSchema = z.object({
  type: z.string({ error: 'Document type is required' }).default('verification_docs'),
  filename: z.string({ error: 'Document filename is required' }),
  objectKey: z.string({ error: 'Document object key is required' }),
});