import { getRedisClient } from './redis'

const SESSION_TTL = 24 * 60 * 60 // 24 hours in seconds

export interface SessionData {
  userId: string
  email: string
  userType: 'job_seeker' | 'recruiter'
  createdAt: number
}

export class SessionService {
  private static readonly isDev = process.env.NODE_ENV !== 'production'

  /**
   * Create a new session
   */
  static async createSession(sessionId: string, data: SessionData): Promise<void> {
    try {
      const redis = getRedisClient()
      if (!redis) return

      const key = `session:${sessionId}`
      await redis.setEx(key, SESSION_TTL, JSON.stringify(data))
      if (this.isDev) {
        console.log(`Session created: ${sessionId}`)
      }
    } catch (error) {
      console.error('Session creation error:', error)
    }
  }

  /**
   * Get session data
   */
  static async getSession(sessionId: string): Promise<SessionData | null> {
    try {
      const redis = getRedisClient()
      if (!redis) return null

      const key = `session:${sessionId}`
      const value = await redis.get(key)

      if (value) {
        // Refresh expiry on access
        await redis.expire(key, SESSION_TTL)
        return JSON.parse(value)
      }

      return null
    } catch (error) {
      console.error('Session retrieval error:', error)
      return null
    }
  }

  /**
   * Delete session
   */
  static async deleteSession(sessionId: string): Promise<void> {
    try {
      const redis = getRedisClient()
      if (!redis) return

      const key = `session:${sessionId}`
      await redis.del(key)
      if (this.isDev) {
        console.log(`Session deleted: ${sessionId}`)
      }
    } catch (error) {
      console.error('Session deletion error:', error)
    }
  }

  /**
   * Check if session exists and is valid
   */
  static async isSessionValid(sessionId: string): Promise<boolean> {
    try {
      const redis = getRedisClient()
      if (!redis) return false

      const key = `session:${sessionId}`
      const result = await redis.exists(key)
      return result === 1
    } catch (error) {
      console.error('Session validation error:', error)
      return false
    }
  }
}
