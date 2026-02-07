import { slugify } from 'transliteration';

/**
 * Generates a URL-safe slug from event title
 * Handles Bengali and other non-Latin scripts via transliteration
 * Format: {transliterated-title}-{last-6-digits-of-id}
 * 
 * Examples:
 * - "Summer Music Festival" → "summer-music-festival-abc123"
 * - "ঢাকা কনসার্ট ২০২৪" → "dhaka-kansart-2024-abc123"
 * - "मुंबई संगीत" → "mumbai-sangit-abc123"
 */
export const generateSlug = (title: string, id?: string): string => {
  try {
    // Use slugify which handles transliteration + URL-safe conversion
    // This converts Bengali/Hindi/etc to Latin, removes special chars, lowercases
    let slug = slugify(title, {
      lowercase: true,
      separator: '-',
      trim: true,
      // Remove unknown characters instead of keeping them
      unknown: ''
    });

    // Limit slug length manually (slugify doesn't have maxLength option)
    if (slug.length > 50) {
      slug = slug.substring(0, 50).replace(/-+$/, ''); // Remove trailing dashes
    }

    // If transliteration resulted in empty/very short slug (e.g., only symbols)
    // Fall back to "event" prefix
    if (!slug || slug.length < 3) {
      slug = 'event';
    }

    // Append last 6 characters of ID for uniqueness
    const uniqueId = id?.toString().slice(-6) || Math.random().toString(36).substring(2, 8);
    
    return `${slug}-${uniqueId}`;
  } catch (error) {
    // Fallback to safe slug if transliteration fails
    console.error('[generateSlug] Error generating slug:', error);
    const safeId = id?.toString().slice(-6) || Math.random().toString(36).substring(2, 8);
    return `event-${safeId}`;
  }
};