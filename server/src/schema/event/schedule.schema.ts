import { z } from "zod";

export const sessionSchema = z.object({
  date: z.string().datetime(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  doorsOpen: z.string().datetime().optional()
});

export const scheduleSchema = z.object({
  startDate: z.string({ error: () => 'Event start date is required' }).datetime('Start date must be a valid ISO datetime string'),
  endDate: z.string({ error: () => 'Event end date is required' }).datetime('End date must be a valid ISO datetime string'),
  timezone: z.string().optional(),
  isMultiDay: z.boolean().optional(),
  doors: z.string().optional(),
  type: z.enum(['single', 'multiple']).default('single').optional(),
  sessions: z.array(sessionSchema).optional()
});

