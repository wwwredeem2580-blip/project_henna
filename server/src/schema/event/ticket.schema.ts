import { z } from 'zod';

export const salesWindowSchema = z.object({
  startDate: z.string().datetime('Sales start date must be a valid ISO datetime string').optional(),
  endDate: z.string().datetime('Sales end date must be a valid ISO datetime string').optional(),
});

export const ticketSchema = z.object({
  _id: z.string().optional(),
  name: z.string({ error: () => ({ message: 'Ticket name is required' }) }),
  price: z.object({
    amount: z.number({ error: () => ({ message: 'Ticket price amount is required' }) }).min(0, 'Ticket price cannot be negative'),
    currency: z.string({ error: () => ({ message: 'Ticket currency is required' }) }).default('BDT'),
  }),
  quantity: z.number({ error: () => ({ message: 'Ticket quantity is required' }) }).int('Quantity must be an integer').positive('Quantity must be positive'),
  limits: z.object({
    minPerOrder: z.number({ error: () => ({ message: 'Min per order must be a number' }) }).int('Min per order must be an integer').min(1, 'Min per order must be at least 1').default(1),
    maxPerOrder: z.number({ error: () => ({ message: 'Max per order must be a number' }) }).int('Max per order must be an integer').min(1, 'Max per order must be at least 1').default(5),
  }),
  sold: z.number().default(0).optional(),
  reserved: z.number().default(0).optional(),
  
  // Visual customization
  wristbandColor: z.string().default('#4f46e5'),
  accentColor: z.string().default('#4f46e5'),
  isDark: z.boolean().default(false),
  glassMode: z.boolean().default(false),
  cornerRadius: z.number().min(0).max(50).default(32),
  perforationStyle: z.enum(['solid', 'dashed', 'dotted']).default('dotted'),
  
  // Metadata
  isVisible: z.boolean().default(true).optional(),
  isActive: z.boolean().default(true).optional(),
  benefits: z.array(z.string(), { error: () => ({ message: 'Benefits must be an array of strings' }) }).default([]),
  tier: z.string({ error: () => ({ message: 'Ticket tier must be early_bird, regular or vip' }) }).default('regular'),
  salesWindow: salesWindowSchema.optional(),
});

