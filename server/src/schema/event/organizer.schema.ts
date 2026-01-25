import { z } from 'zod';

export const organizerSchema = z.object({
  companyName: z.string().optional(),
  companyType: z.enum(['organizer', 'venue_owner', 'representative', 'artist'], { error: 'Company type must be organizer, venue_owner, representative, or artist' }).optional(),
  host: z.string().optional(),
  companyEmail: z.string().email().optional(),
});
