import Redis from 'ioredis';

// Redis client for caching
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redis.on('connect', () => {
  console.log('✅ Redis cache connected');
});

redis.on('error', (err) => {
  console.error('❌ Redis cache error:', err);
});

/**
 * Cache utility with cache-aside pattern
 */
export class CacheService {
  /**
   * Get value from cache
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await redis.get(key);
      if (!cached) return null;
      return JSON.parse(cached) as T;
    } catch (error) {
      console.error(`Cache GET error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache with TTL (in seconds)
   */
  static async set(key: string, value: any, ttl: number = 300): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value);
      await redis.setex(key, ttl, serialized);
      return true;
    } catch (error) {
      console.error(`Cache SET error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete key from cache
   */
  static async del(key: string): Promise<boolean> {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error(`Cache DEL error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete multiple keys matching pattern
   */
  static async delPattern(pattern: string): Promise<number> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length === 0) return 0;
      await redis.del(...keys);
      return keys.length;
    } catch (error) {
      console.error(`Cache DEL pattern error for ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  static async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Cache EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get or set pattern - fetch from cache or execute function and cache result
   */
  static async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = 300
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Cache miss - fetch data
    const data = await fetchFn();
    
    // Store in cache (don't await - fire and forget)
    this.set(key, data, ttl).catch(err => 
      console.error(`Background cache SET failed for ${key}:`, err)
    );

    return data;
  }

  /**
   * Increment counter with TTL
   */
  static async incr(key: string, ttl?: number): Promise<number> {
    try {
      const value = await redis.incr(key);
      if (ttl && value === 1) {
        // Set TTL only on first increment
        await redis.expire(key, ttl);
      }
      return value;
    } catch (error) {
      console.error(`Cache INCR error for key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Get TTL for key
   */
  static async ttl(key: string): Promise<number> {
    try {
      return await redis.ttl(key);
    } catch (error) {
      console.error(`Cache TTL error for key ${key}:`, error);
      return -1;
    }
  }
}

// Cache key builders
export const CacheKeys = {
  // Events
  eventList: (filters: string) => `events:list:${filters}`,
  eventDetail: (id: string) => `events:detail:${id}`,
  eventTickets: (id: string) => `events:tickets:${id}`,
  
  // Tickets
  ticketAvailability: (ticketId: string) => `tickets:availability:${ticketId}`,
  ticketDetail: (ticketId: string) => `tickets:detail:${ticketId}`,
  
  // Users
  userProfile: (userId: string) => `users:profile:${userId}`,
  userOrders: (userId: string) => `users:orders:${userId}`,
  
  // Orders
  orderDetail: (orderId: string) => `orders:detail:${orderId}`,
  
  // Stats
  eventStats: (eventId: string) => `stats:event:${eventId}`,
  organizerStats: (orgId: string) => `stats:organizer:${orgId}`,
};

// Cache TTLs (in seconds)
export const CacheTTL = {
  SHORT: 30,        // 30 seconds - frequently changing data
  MEDIUM: 300,      // 5 minutes - moderate changes
  LONG: 1800,       // 30 minutes - rarely changing
  VERY_LONG: 86400, // 24 hours - static data
};

export default CacheService;
