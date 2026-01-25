import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

export const sanitizedString = (
  opts?: { min?: number; max?: number }
) => {
  let schema = z.string();

  if (opts?.min) schema = schema.min(opts.min);
  if (opts?.max) schema = schema.max(opts.max);

  return schema.transform(val =>
    DOMPurify.sanitize(val, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    }).trim()
  );
};

export const sanitizedStringArray = (
  opts?: { minLength?: number; maxItemLength?: number }
) =>
  z.array(
    sanitizedString({
      min: opts?.maxItemLength ? 1 : undefined,
      max: opts?.maxItemLength,
    })
  )
  .transform(arr => arr.filter(Boolean))
  .refine(arr => !opts?.minLength || arr.length >= opts.minLength, {
    message: `At least ${opts?.minLength} items required`,
  });
