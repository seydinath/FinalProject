import { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose'

type FieldType = 'string' | 'number' | 'array'

type Rule = {
  field: string
  type: FieldType
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  enum?: string[]
  trim?: boolean
}

function sanitizeString(value: string): string {
  // Basic sanitization to reduce common script injection payloads.
  return value.replace(/[<>]/g, '').trim()
}

export function validateBody(rules: Rule[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const body = req.body as Record<string, unknown>

    for (const rule of rules) {
      const value = body[rule.field]

      if (rule.required && (value === undefined || value === null || value === '')) {
        return res.status(400).json({ error: `${rule.field} is required` })
      }

      if (value === undefined || value === null) {
        continue
      }

      if (rule.type === 'string') {
        if (typeof value !== 'string') {
          return res.status(400).json({ error: `${rule.field} must be a string` })
        }

        const normalized = rule.trim === false ? value : sanitizeString(value)

        if (rule.minLength !== undefined && normalized.length < rule.minLength) {
          return res.status(400).json({ error: `${rule.field} must be at least ${rule.minLength} characters` })
        }

        if (rule.maxLength !== undefined && normalized.length > rule.maxLength) {
          return res.status(400).json({ error: `${rule.field} must be at most ${rule.maxLength} characters` })
        }

        if (rule.enum && !rule.enum.includes(normalized)) {
          return res.status(400).json({ error: `${rule.field} must be one of: ${rule.enum.join(', ')}` })
        }

        body[rule.field] = normalized
      }

      if (rule.type === 'number') {
        if (typeof value !== 'number' || Number.isNaN(value)) {
          return res.status(400).json({ error: `${rule.field} must be a number` })
        }

        if (rule.min !== undefined && value < rule.min) {
          return res.status(400).json({ error: `${rule.field} must be >= ${rule.min}` })
        }

        if (rule.max !== undefined && value > rule.max) {
          return res.status(400).json({ error: `${rule.field} must be <= ${rule.max}` })
        }
      }

      if (rule.type === 'array') {
        if (!Array.isArray(value)) {
          return res.status(400).json({ error: `${rule.field} must be an array` })
        }
      }
    }

    req.body = body
    next()
  }
}

export function validateObjectIdParam(paramName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const value = req.params[paramName]
    if (!value || !mongoose.Types.ObjectId.isValid(value)) {
      return res.status(400).json({ error: `Invalid ${paramName}` })
    }

    next()
  }
}
