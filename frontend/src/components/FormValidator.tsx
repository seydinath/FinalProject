import React, { useState, useCallback } from 'react'
import '../styles/form-validation.css'

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: string) => boolean | string
  message?: string
}

export interface FieldError {
  field: string
  message: string
  type: 'error' | 'warning'
}

interface FormValidatorState {
  [key: string]: {
    value: string
    error?: string | null
    touched: boolean
    validating?: boolean
  }
}

export function useFormValidator(rules: { [key: string]: ValidationRule }) {
  const [state, setState] = useState<FormValidatorState>({})

  const validateField = useCallback((fieldName: string, value: string): string | null => {
    const rule = rules[fieldName]
    if (!rule) return null

    // Required validation
    if (rule.required && !value.trim()) {
      return rule.message || `Ce champ est requis`
    }

    // Min length
    if (rule.minLength && value.length < rule.minLength) {
      return rule.message || `Minimum ${rule.minLength} caractères`
    }

    // Max length
    if (rule.maxLength && value.length > rule.maxLength) {
      return rule.message || `Maximum ${rule.maxLength} caractères`
    }

    // Pattern matching
    if (rule.pattern && !rule.pattern.test(value)) {
      return rule.message || `Format invalide`
    }

    // Custom validation
    if (rule.custom) {
      const result = rule.custom(value)
      if (typeof result === 'string') return result
      if (result === false) return rule.message || `Validation échouée`
    }

    return null
  }, [rules])

  const handleFieldChange = useCallback((fieldName: string, value: string) => {
    const error = validateField(fieldName, value)
    setState(prev => ({
      ...prev,
      [fieldName]: {
        value,
        error: error || undefined,
        touched: true
      }
    }))
  }, [validateField])

  const handleFieldBlur = useCallback((fieldName: string) => {
    setState(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        touched: true
      }
    }))
  }, [])

  const validateForm = useCallback((): boolean => {
    const newState: FormValidatorState = {}
    let isValid = true

    Object.keys(rules).forEach(fieldName => {
      const currentValue = state[fieldName]?.value || ''
      const error = validateField(fieldName, currentValue)

      newState[fieldName] = {
        value: currentValue,
        error: error || undefined,
        touched: true
      }

      if (error) isValid = false
    })

    setState(newState)
    return isValid
  }, [rules, state, validateField])

  const resetForm = useCallback(() => {
    setState({})
  }, [])

  const getFieldState = (fieldName: string) => {
    return state[fieldName] || { value: '', touched: false }
  }

  return {
    state,
    handleFieldChange,
    handleFieldBlur,
    validateField,
    validateForm,
    resetForm,
    getFieldState
  }
}

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string | undefined
  touched?: boolean
  icon?: React.ReactNode
  successMessage?: string
}

export function FormInput({
  label,
  error,
  touched,
  icon,
  successMessage,
  ...props
}: FormInputProps) {
  const hasError = touched && error
  const isSuccess = touched && !error && successMessage

  return (
    <div className="form-input-group">
      {label && <label htmlFor={props.id}>{label}</label>}
      <div className="input-wrapper">
        {icon && <span className="input-icon">{icon}</span>}
        <input
          {...props}
          className={`form-input ${hasError ? 'error' : ''} ${isSuccess ? 'success' : ''} ${icon ? 'with-icon' : ''}`}
        />
        {hasError && <span className="input-error-icon">✕</span>}
        {isSuccess && <span className="input-success-icon">✓</span>}
      </div>
      {hasError && <span className="error-message">{error}</span>}
      {isSuccess && successMessage && <span className="success-message">{successMessage}</span>}
    </div>
  )
}

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string | undefined
  touched?: boolean
  maxChars?: number
}

export function FormTextarea({
  label,
  error,
  touched,
  maxChars,
  value,
  ...props
}: FormTextareaProps) {
  const hasError = touched && error
  const charCount = String(value).length

  return (
    <div className="form-input-group">
      {label && (
        <div className="label-row">
          <label htmlFor={props.id}>{label}</label>
          {maxChars && (
            <span className={`char-count ${charCount > maxChars * 0.9 ? 'warning' : ''}`}>
              {charCount}/{maxChars}
            </span>
          )}
        </div>
      )}
      <textarea
        {...props}
        value={value}
        className={`form-textarea ${hasError ? 'error' : ''}`}
      />
      {hasError && <span className="error-message">{error}</span>}
    </div>
  )
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string | undefined
  touched?: boolean
  options: { value: string; label: string }[]
}

export function FormSelect({
  label,
  error,
  touched,
  options,
  ...props
}: FormSelectProps) {
  const hasError = touched && error

  return (
    <div className="form-input-group">
      {label && <label htmlFor={props.id}>{label}</label>}
      <select
        {...props}
        className={`form-select ${hasError ? 'error' : ''}`}
      >
        <option value="">Sélectionner...</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hasError && <span className="error-message">{error}</span>}
    </div>
  )
}

interface FormCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string | undefined
  touched?: boolean
}

export function FormCheckbox({
  label,
  error,
  touched,
  ...props
}: FormCheckboxProps) {
  const hasError = touched && error

  return (
    <div className={`form-checkbox-group ${hasError ? 'has-error' : ''}`}>
      <label className="checkbox-label">
        <input
          {...props}
          type="checkbox"
          className={`form-checkbox ${hasError ? 'error' : ''}`}
        />
        <span>{label}</span>
      </label>
      {hasError && <span className="error-message">{error}</span>}
    </div>
  )
}
