import { z } from "zod";

export const coverImageSchema = z.object({
  alt: z.string({error: () => 'Alt text is required'}),
  thumbnailUrl: z.string({error: () => 'Thumbnail URL is required'}),
  url: z.string({error: () => 'URL is required'})
});

export const gallerySchema = z.array(z.object({
  url: z.string({error: () => 'URL is required'}),
  order: z.number({error: () => 'Order is required'}),
  caption: z.string({error: () => 'Caption is required'})
}));

export const mediaSchema = z.object({
  coverImage: coverImageSchema,
  gallery: gallerySchema.optional()
});