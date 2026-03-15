import { createClient, RedisClientType } from 'redis'

let redisClient: RedisClientType | null = null

export async function initRedis(): Promise<void> {
  try {
    redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('Max Redis reconnection attempts reached')
            return new Error('Max retries reached')
          }
          return retries * 100
        }
      }
    })

    redisClient.on('error', (err) => console.error('Redis Client Error', err))
    redisClient.on('connect', () => console.log('Redis connected successfully'))
    redisClient.on('reconnecting', () => console.log('Redis reconnecting...'))

    await redisClient.connect()
    console.log('✅ Redis initialized')
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error)
    console.log('⚠️ Redis is optional. App will work without it (with degraded performance)')
  }
}

export function getRedisClient(): RedisClientType | null {
  return redisClient || null
}

export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit()
    console.log('Redis connection closed')
  }
}
