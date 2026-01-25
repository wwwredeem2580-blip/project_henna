import { z } from 'zod';

export const documentSchema = z.object({
  type: z.enum(['venue_booking', 'permit', 'insurance', 'license', 'portfolio', 'other'], { error: 'Document type is required' }).optional(),
  url: z.url({ error: 'Document URL is required' }).optional(),
  filename: z.string({ error: 'Document filename is required' }),
  objectKey: z.string({ error: 'Document object key is required' }),
});