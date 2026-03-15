import React, { memo } from 'react'
import { FormField } from '../hooks/useFormValidation'

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string
  label?: string
  field: FormField
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void
  showError?: boolean
  icon?: string
  hint?: string
  successMessage?: string
  rightElement?: React.ReactNode
}

function FormInputContent({
  name,
  label,
  field,
  onChange,
  onBlur,
  showError = field.touched,
  icon,
  hint,
  successMessage,
  rightElement,
  className = '',
  ...props
}: FormInputProps) {
  const hasError = showError && field.error
  const isValid = field.dirty && field.touched && !field.error

  return (
    <div className="form-input-wrapper">
      {label && (
        <label htmlFor={name} className="form-input-label">
          {label}
          {props.required && <span className="required-asterisk">*</span>}
        </label>
      )}

      <div className="form-input-container">
        {icon && <span className="form-input-icon">{icon}</span>}
        
        <input
          id={name}
          name={name}
          value={field.value}
          onChange={onChange}
          onBlur={onBlur}
          className={`
            form-input
            ${hasError ? 'form-input-error' : ''}
            ${isValid ? 'form-input-valid' : ''}
            ${icon ? 'with-icon' : ''}
            ${rightElement ? 'with-right-addon' : ''}
            ${className}
          `}
          {...props}
        />

        {rightElement && (
          <span className="form-input-right-addon">{rightElement}</span>
        )}
        {!rightElement && isValid && (
          <span className="form-input-status valid">✓</span>
        )}
        {!rightElement && hasError && (
          <span className="form-input-status error">✕</span>
        )}
      </div>

      {hasError && (
        <span className="form-input-error-message">{field.error}</span>
      )}

      {!hasError && isValid && successMessage && (
        <span className="form-input-success-message">{successMessage}</span>
      )}

      {!hasError && !isValid && hint && (
        <span className="form-input-hint">{hint}</span>
      )}
    </div>
  )
}

// Memoize to prevent re-renders when parent updates
export const FormInput = memo(FormInputContent)

export default FormInput
