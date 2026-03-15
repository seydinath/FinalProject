import { ValidationRule } from '../hooks/useFormValidation'

/**
 * Règles de validation standard pour formulaires
 */

export const ValidationRules = {
  // Email validation
  email: (message?: string): ValidationRule => (value: string) => {
    if (!value) return null
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return message || 'Email invalide'
    }
    return null
  },

  // Required field
  required: (message?: string): ValidationRule => (value: string) => {
    if (!value || value.trim() === '') {
      return message || 'Ce champ est requis'
    }
    return null
  },

  // Minimum length
  minLength: (min: number, message?: string): ValidationRule => (value: string) => {
    if (value.length < min) {
      return message || `Au minimum ${min} caractères`
    }
    return null
  },

  // Maximum length
  maxLength: (max: number, message?: string): ValidationRule => (value: string) => {
    if (value.length > max) {
      return message || `Maximum ${max} caractères`
    }
    return null
  },

  // Password requirements
  password: (message?: string): ValidationRule => (value: string) => {
    if (!value) return null
    
    const requirements = {
      length: value.length >= 8,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /\d/.test(value),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(value)
    }

    const allMet = Object.values(requirements).every(req => req)
    
    if (!allMet) {
      return message || 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial'
    }
    return null
  },

  // Weak password (minimum requirement)
  weakPassword: (): ValidationRule => (value: string) => {
    if (!value) return null
    if (value.length < 6) {
      return 'Au minimum 6 caractères'
    }
    return null
  },

  // Phone number
  phone: (message?: string): ValidationRule => (value: string) => {
    if (!value) return null
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/
    if (!phoneRegex.test(value.replace(/\s/g, ''))) {
      return message || 'Numéro de téléphone invalide'
    }
    return null
  },

  // URL validation
  url: (message?: string): ValidationRule => (value: string) => {
    if (!value) return null
    try {
      new URL(value)
      return null
    } catch {
      return message || 'URL invalide'
    }
  },

  // Username - alphanumeric + underscore/hyphen
  username: (message?: string): ValidationRule => (value: string) => {
    if (!value) return null
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/
    if (!usernameRegex.test(value)) {
      return message || 'Le nom d\'utilisateur doit contenir 3-20 caractères alphanumériques'
    }
    return null
  },

  // Match field (for password confirmation)
  match: (getOtherValue: () => string, message?: string): ValidationRule => (value: string) => {
    if (!value) return null
    if (value !== getOtherValue()) {
      return message || 'Les valeurs ne correspondent pas'
    }
    return null
  },

  // Custom validation
  custom: (validator: (value: string) => boolean, message?: string): ValidationRule => (value: string) => {
    if (!validator(value)) {
      return message || 'Validation échouée'
    }
    return null
  },

  // No spaces
  noSpaces: (message?: string): ValidationRule => (value: string) => {
    if (value.includes(' ')) {
      return message || 'Les espaces ne sont pas autorisés'
    }
    return null
  },

  // Alphanumeric only
  alphanumeric: (message?: string): ValidationRule => (value: string) => {
    if (!value) return null
    if (!/^[a-zA-Z0-9]+$/.test(value)) {
      return message || 'Uniquement les caractères alphanumériques'
    }
    return null
  }
}

export default ValidationRules
