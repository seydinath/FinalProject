import { getRedisClient } from './redis'

const CACHE_TTL = 3600 // 1 hour in seconds

interface CacheOptions {
  ttl?: number
}

export class CacheService {
  /**
   * Get cached value
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const redis = getRedisClient()
      if (!redis) return null

      const value = await redis.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error)
      return null
    }
  }

  /**
   * Set cached value
   */
  static async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    try {
      const redis = getRedisClient()
      if (!redis) return

      const ttl = options.ttl || CACHE_TTL
      await redis.setEx(key, ttl, JSON.stringify(value))
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error)
    }
  }

  /**
   * Delete cached value
   */
  static async delete(key: string): Promise<void> {
    try {
      const redis = getRedisClient()
      if (!redis) return

      await redis.del(key)
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error)
    }
  }

  /**
   * Delete many cached values
   */
  static async deleteMany(keys: string[]): Promise<void> {
    try {
      const redis = getRedisClient()
      if (!redis) return

      if (keys.length > 0) {
        await redis.del(keys)
      }
    } catch (error) {
      console.error(`Cache deleteMany error:`, error)
    }
  }

  /**
   * Clear all cache (use with caution!)
   */
  static async clear(): Promise<void> {
    try {
      const redis = getRedisClient()
      if (!redis) return

      await redis.flushDb()
      console.log('Cache cleared')
    } catch (error) {
      console.error(`Cache clear error:`, error)
    }
  }

  /**
   * Check if key exists
   */
  static async exists(key: string): Promise<boolean> {
    try {
      const redis = getRedisClient()
      if (!redis) return false

      const result = await redis.exists(key)
      return result === 1
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error)
      return false
    }
  }
}
