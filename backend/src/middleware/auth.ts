import jwt from 'jsonwebtoken'
import { config } from '../config/env'
import { Request, Response, NextFunction } from 'express'

export interface AuthRequest extends Request {
  userId?: string
  user?: any
}

export function generateToken(userId: string): string {
  const token = jwt.sign(
    { userId },
    config.jwtSecret as string,
    { expiresIn: '30d' } as any
  )
  return token
}

export function verifyToken(token: string): string | null {
  try {
    const decoded: any = jwt.verify(token, config.jwtSecret as string)
    return decoded.userId
  } catch (error) {
    return null
  }
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization']
  const token = authHeader?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  const userId = verifyToken(token)
  if (!userId) {
    return res.status(403).json({ error: 'Invalid or expired token' })
  }

  req.userId = userId
  next()
}
