import React, { memo } from 'react'
import '../styles/loading.css'

interface SkeletonProps {
  width?: string
  height?: string
  borderRadius?: string
  count?: number
}

function SkeletonLoaderContent({ width = '100%', height = '20px', borderRadius = '8px', count = 1 }: SkeletonProps) {
  return (
    <>
      {Array(count).fill(0).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{ width, height, borderRadius, marginBottom: '12px' }}
        />
      ))}
    </>
  )
}

export const SkeletonLoader = memo(SkeletonLoaderContent)

function SkeletonCardContent() {
  return (
    <div className="skeleton-card">
      <div className="skeleton" style={{ width: '100%', height: '200px', marginBottom: '16px' }} />
      <SkeletonLoader count={3} height="16px" />
    </div>
  )
}

export const SkeletonCard = memo(SkeletonCardContent)

function SkeletonGridContent({ count = 4 }: { count?: number }) {
  return (
    <div className="skeleton-grid">
      {Array(count).fill(0).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export const SkeletonGrid = memo(SkeletonGridContent)

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  text?: string
}

function LoadingSpinnerContent({ size = 'medium', text }: LoadingSpinnerProps) {
  return (
    <div className="loading-container">
      <div className={`spinner ${size}`} />
      {text && <p className="loading-text">{text}</p>}
    </div>
  )
}

export const LoadingSpinner = memo(LoadingSpinnerContent)

function LoadingOverlayContent({ text = 'Chargement...' }: { text?: string }) {
  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <LoadingSpinner text={text} />
      </div>
    </div>
  )
}

export const LoadingOverlay = memo(LoadingOverlayContent)

// Main Loading component for Suspense fallback
export const Loading = memo(LoadingOverlayContent) as React.FC<{ text?: string }>

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  children: React.ReactNode
}

function LoadingButtonContent({ loading, children, disabled, ...props }: LoadingButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`btn-loading ${loading ? 'is-loading' : ''}`}
    >
      {loading ? (
        <>
          <span className="spinner-mini" />
          Chargement...
        </>
      ) : (
        children
      )}
    </button>
  )
}

export const LoadingButton = memo(LoadingButtonContent)

interface ProgressProps {
  value: number
  max?: number
  showLabel?: boolean
  animated?: boolean
}

function ProgressBarContent({ value, max = 100, showLabel = true, animated = true }: ProgressProps) {
  const percentage = (value / max) * 100

  return (
    <div className="progress-wrapper">
      <div className={`progress-bar ${animated ? 'animated' : ''}`} style={{ width: `${percentage}%` }} />
      {showLabel && (
        <div className="progress-label">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  )
}

export const ProgressBar = memo(ProgressBarContent)
