import { z } from 'zod';

export const venueTypeSchema = z.enum(['indoor', 'outdoor', 'hybrid'], { error: 'Venue type must be indoor, outdoor, or hybrid' }).optional();

export const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string({ error: 'City is required' }).min(1, 'City is required'),
  country: z.string({ error: 'Country is required' }).min(1, 'Country is required'),
});

export const venueSchema = z.object({
  name: z.string({ error: 'Venue name is required' }).min(1, 'Venue name is required'),
  address: addressSchema,
  coordinates: z.object({
    type: z.literal('Point', { error: 'Coordinates type must be Point' }),
    coordinates: z.tuple([z.number({ error: 'Longitude is required' }), z.number({ error: 'Latitude is required' })], { error: 'Coordinates array [lng, lat] is required' }), // [lng, lat]
  }).optional(),
  capacity: z.number({ error: 'Venue capacity is required' }).int('Capacity must be an integer').positive('Capacity must be positive').min(10, 'Capacity must be at least 10'),
  type: venueTypeSchema,
  parking: z.boolean().optional(),
  publicTransit: z.string().optional(),
});