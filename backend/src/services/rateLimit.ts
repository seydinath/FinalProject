import { getRedisClient } from './redis'

export interface RateLimitConfig {
  windowSizeSeconds: number // Time window in seconds
  maxRequests: number // Max requests per window
}

export class RateLimitService {
  private static readonly DEFAULT_CONFIG: RateLimitConfig = {
    windowSizeSeconds: 60, // 1 minute
    maxRequests: 100 // 100 requests per minute
  }

  /**
   * Check if request should be allowed
   */
  static async isAllowed(
    identifier: string,
    config: RateLimitConfig = this.DEFAULT_CONFIG
  ): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
    try {
      const redis = getRedisClient()

      // If Redis not available, allow requests
      if (!redis) {
        return { allowed: true, remaining: config.maxRequests, resetIn: config.windowSizeSeconds }
      }

      const key = `ratelimit:${identifier}`
      const current = await redis.incr(key)

      if (current === 1) {
        // First request in this window
        await redis.expire(key, config.windowSizeSeconds)
      }

      const ttl = await redis.ttl(key)

      if (current > config.maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetIn: ttl > 0 ? ttl : config.windowSizeSeconds
        }
      }

      return {
        allowed: true,
        remaining: config.maxRequests - current,
        resetIn: ttl > 0 ? ttl : config.windowSizeSeconds
      }
    } catch (error) {
      console.error('Rate limit check error:', error)
      // On error, allow request
      return { allowed: true, remaining: config.maxRequests, resetIn: config.windowSizeSeconds }
    }
  }

  /**
   * Reset rate limit for identifier
   */
  static async reset(identifier: string): Promise<void> {
    try {
      const redis = getRedisClient()
      if (!redis) return

      const key = `ratelimit:${identifier}`
      await redis.del(key)
    } catch (error) {
      console.error('Rate limit reset error:', error)
    }
  }

  /**
   * Get current count for identifier
   */
  static async getCount(identifier: string): Promise<number> {
    try {
      const redis = getRedisClient()
      if (!redis) return 0

      const key = `ratelimit:${identifier}`
      const count = await redis.get(key)
      return count ? parseInt(count) : 0
    } catch (error) {
      console.error('Rate limit get count error:', error)
      return 0
    }
  }
}
