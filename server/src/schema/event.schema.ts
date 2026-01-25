import { z } from 'zod';
import {
  mediaSchema,
  scheduleSchema,
  venueSchema,
  organizerSchema,
  documentSchema,
  ticketSchema,
} from './event';
import { sanitizedString, sanitizedStringArray } from '../utils/zodSanitizer';

const MAX_CATEGORIES = 3;
const MAX_DOCUMENTS = 5;
const MAX_DESCRIPTION_LENGTH = 5000;
const MAX_TAGLINE_LENGTH = 160;

export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId');

export const categorySchema = z.enum([
  'concert',
  'sports',
  'conference',
  'festival',
  'theater',
  'comedy',
  'networking',
  'workshop',
  'other',
]);

// Steps

// Step 1: Basics
export const stepBasicsSchema = z.object({
  title: sanitizedString({ min: 10, max: 100 }),

  tagline: sanitizedString({ min: 5, max: MAX_TAGLINE_LENGTH }).optional(),

  category: categorySchema,

  subCategory: z
    .array(sanitizedString({ min: 2, max: 50 }))
    .max(MAX_CATEGORIES, `Maximum ${MAX_CATEGORIES} sub-categories allowed`)
    .optional(),
});



// Step 2: Details
export const stepDetailsSchema = z.object({
  media: mediaSchema.optional(),

  description: sanitizedString({
    min: 50,
    max: MAX_DESCRIPTION_LENGTH,
  }),

  highlights: z
    .array(sanitizedString({ max: 100 }))
    .max(10, 'Cannot have more than 10 highlights')
    .optional(),

  languages: z
    .array(sanitizedString({ min: 2, max: 30 }))
    .min(1, 'At least one language is required'),
});



// Step 3: Logistics
export const stepLogisticsSchema = z
  .object({
    schedule: scheduleSchema,
    venue: venueSchema,
  })
  .superRefine((data, ctx) => {
    const { startDate, endDate } = data.schedule ?? {};

    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      ctx.addIssue({
        path: ['schedule', 'endDate'],
        message: 'End date must be after start date',
        code: z.ZodIssueCode.custom,
      });
    }
  });

// Step 4: Verification
export const stepVerifySchema = z.object({
  organizer: organizerSchema.optional(),

  verification: z
    .object({
      documents: z
        .array(documentSchema)
        .max(MAX_DOCUMENTS, `Maximum ${MAX_DOCUMENTS} documents allowed`)
        .optional(),
    })
    .optional(),
});


// Step 5: Tickets
export const stepTicketsSchema = z
  .object({
    tickets: z
      .array(ticketSchema)
      .min(1, 'At least one ticket type is required'),
  })
  .superRefine((data, ctx) => {
    data.tickets.forEach((ticket, index) => {
      const { startDate, endDate } = ticket.salesWindow ?? {};

      if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
        ctx.addIssue({
          path: ['tickets', index, 'salesWindow', 'endDate'],
          message: 'Ticket sales end date must be after start date',
          code: z.ZodIssueCode.custom,
        });
      }
    });
  });

// Step 6: Review
export const stepReviewSchema = z.object({
  platform: z.object({
    terms: z.object({
      termsAccepted: z.boolean().refine(val => val === true, {
        message: 'You must accept the terms and conditions',
      }),
      legalPermissionAccepted: z.boolean().refine(val => val === true, {
        message: 'Legal permission confirmation is required',
      }),
      platformTermsAccepted: z.boolean().refine(val => val === true, {
          message: 'Platform terms acceptance is required',
        }),
      }),
    }),
  })









// Combined
export const submitEventSchema = z.object({
  ...stepBasicsSchema.shape,
  ...stepDetailsSchema.shape,
  ...stepLogisticsSchema.shape,
  ...stepVerifySchema.shape,
  ...stepTicketsSchema.shape,
  ...stepReviewSchema.shape,

  eventId: objectIdSchema.optional(),
  hostId: objectIdSchema.optional(),
});


export const createEventSchema = submitEventSchema
  .partial()
  .extend({
    title: stepBasicsSchema.shape.title,
  });

// Pending Edit Schema
export const pendingApprovalEditSchema = z.object({
  // Editable fields
  description: sanitizedString({
    min: 50,
    max: MAX_DESCRIPTION_LENGTH,
  }).optional(),
  tagline: sanitizedString({
    min: 5,
    max: MAX_TAGLINE_LENGTH,
  }).optional(),
  highlights: z.array(sanitizedString({ max: 100 })).max(10, 'Cannot have more than 10 highlights').optional(),
  languages: z.array(sanitizedString({ min: 2, max: 30 })).optional(),
  media: mediaSchema.optional(),
  
  // Can add docs, not remove
  additionalDocuments: z.array(documentSchema).optional(),
  
  tickets: stepTicketsSchema.shape.tickets.optional(),
});

// Approved Edit Schema
export const approvedEventEditSchema = z.object({
  description: sanitizedString({ min: 50, max: MAX_DESCRIPTION_LENGTH }).optional(),
  tagline: sanitizedString({ min: 5, max: MAX_TAGLINE_LENGTH }).optional(),
  highlights: z.array(sanitizedString({ max: 100 }))
    .max(10, 'Cannot have more than 10 highlights')
    .optional()
    .transform(arr => (arr?.length ? arr : undefined)),
  languages: z.array(sanitizedString({ min: 2, max: 30 }))
    .optional()
    .transform(arr => (arr?.length ? arr : undefined)),
  media: mediaSchema.optional(),
  tickets: z.array(ticketSchema).optional(),

  schedule: z.object({
    startDate: z.coerce.date({ error: () => ({ message: 'Start date is required' }) }),
    endDate: z.coerce.date({ error: () => ({ message: 'End date is required' }) }),
  })
  .optional()
  .superRefine((data, ctx) => {
    if (data && data.endDate <= data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endDate'],
        message: 'End date must be after start date',
      });
    }
  }),
});

// Published Event Edit Schema
export const publishedEventEditSchema = z.object({
  description: sanitizedString({ min: 50, max: MAX_DESCRIPTION_LENGTH }).optional(),
  highlights: z.array(sanitizedString({ max: 100 }))
    .max(10, 'Cannot have more than 10 highlights')
    .optional()
    .transform(arr => (arr?.length ? arr : undefined)),
  languages: z.array(sanitizedString({ min: 2, max: 30 }))
    .optional()
    .transform(arr => (arr?.length ? arr : undefined)),
  media: mediaSchema.optional(),
  tickets: z.array(ticketSchema).optional(),
});


// Live Event Edit Schema
export const liveEventEditSchema = z.object({
  // Gallery updates (can add event photos)
  media: mediaSchema.optional(),
  
  // Ticket operational controls
  tickets: z.array(ticketSchema).optional(),
});