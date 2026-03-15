import React from 'react'

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  icon?: string
  error?: string
  options: Array<{ value: string; label: string }>
}

export function SelectInput({
  label,
  icon,
  error,
  options,
  className = '',
  ...props
}: SelectInputProps) {
  return (
    <div className="select-input-wrapper">
      {label && <label className="select-label">{label}</label>}
      <div className="select-container">
        {icon && <span className="select-icon">{icon}</span>}
        <select
          className={`select-input ${error ? 'error' : ''} ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="select-arrow">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 8 10 12 14 8"></polyline>
          </svg>
        </span>
      </div>
      {error && <span className="select-error">{error}</span>}
    </div>
  )
}
