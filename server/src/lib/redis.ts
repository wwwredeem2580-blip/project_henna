import Redis from 'ioredis';

const redisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3
};

export const redis = new Redis(redisOptions);

// PDF Cache configuration
export const PDF_CACHE_PREFIX = 'pdf:ticket-sheet:';
export const PDF_LOCK_PREFIX = 'pdf:generating:';
export const PDF_CACHE_TTL = 300; // 5 minutes in seconds

/**
 * Get cached PDF from Redis
 */
export async function getCachedPDF(eventId: string): Promise<Buffer | null> {
  try {
    const cached = await redis.getBuffer(`${PDF_CACHE_PREFIX}${eventId}`);
    return cached;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
}

/**
 * Cache PDF in Redis with TTL
 */
export async function cachePDF(eventId: string, pdfBuffer: Buffer): Promise<void> {
  try {
    await redis.setex(`${PDF_CACHE_PREFIX}${eventId}`, PDF_CACHE_TTL, pdfBuffer);
  } catch (error) {
    console.error('Redis cache error:', error);
    // Don't throw - caching failure shouldn't break PDF generation
  }
}

/**
 * Invalidate PDF cache for an event
 */
export async function invalidatePDFCache(eventId: string): Promise<void> {
  try {
    await redis.del(`${PDF_CACHE_PREFIX}${eventId}`);
    console.log(`Invalidated PDF cache for event ${eventId}`);
  } catch (error) {
    console.error('Redis invalidation error:', error);
  }
}

/**
 * Acquire lock for PDF generation (prevents concurrent generation)
 */
export async function acquirePDFLock(eventId: string): Promise<boolean> {
  try {
    const result = await redis.set(
      `${PDF_LOCK_PREFIX}${eventId}`,
      '1',
      'EX',
      30, // 30 second lock timeout
      'NX' // Only set if not exists
    );
    return result === 'OK';
  } catch (error) {
    console.error('Redis lock error:', error);
    return false;
  }
}

/**
 * Release PDF generation lock
 */
export async function releasePDFLock(eventId: string): Promise<void> {
  try {
    await redis.del(`${PDF_LOCK_PREFIX}${eventId}`);
  } catch (error) {
    console.error('Redis unlock error:', error);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  await redis.quit();
});
