import { Request, Response, NextFunction } from 'express'
import { RateLimitService, RateLimitConfig } from '../services/rateLimit'

export interface RateLimitedRequest extends Request {
  rateLimit?: {
    remaining: number
    resetIn: number
  }
}

/**
 * Rate limit middleware
 * Usage: app.use(rateLimitMiddleware(config))
 */
export function rateLimitMiddleware(config?: RateLimitConfig) {
  return async (req: RateLimitedRequest, res: Response, next: NextFunction) => {
    try {
      // Use client IP as identifier
      const identifier = req.ip || 'anonymous'

      const result = await RateLimitService.isAllowed(identifier, config)

      // Add rate limit info to request
      req.rateLimit = {
        remaining: result.remaining,
        resetIn: result.resetIn
      }

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', config?.maxRequests || 100)
      res.setHeader('X-RateLimit-Remaining', result.remaining)
      res.setHeader('X-RateLimit-Reset', result.resetIn)

      if (!result.allowed) {
        return res.status(429).json({
          error: 'Too many requests',
          retryAfter: result.resetIn
        })
      }

      next()
    } catch (error) {
      console.error('Rate limit middleware error:', error)
      next() // Continue on error - fail open
    }
  }
}

/**
 * Endpoint-specific rate limiter with custom config
 */
export function createRateLimiter(config: RateLimitConfig) {
  return rateLimitMiddleware(config)
}
