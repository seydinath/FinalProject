import React, { createContext, useContext, useState, useCallback } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (message: string, type: ToastType, duration?: number) => void
  removeToast: (id: string) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: ToastType, duration = 3000) => {
    const id = `toast-${Date.now()}-${Math.random()}`
    const newToast: Toast = { id, message, type, duration }

    setToasts(prev => [...prev, newToast])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const success = useCallback((message: string, duration = 3000) => {
    addToast(message, 'success', duration)
  }, [addToast])

  const error = useCallback((message: string, duration = 4000) => {
    addToast(message, 'error', duration)
  }, [addToast])

  const info = useCallback((message: string, duration = 3000) => {
    addToast(message, 'info', duration)
  }, [addToast])

  const warning = useCallback((message: string, duration = 3500) => {
    addToast(message, 'warning', duration)
  }, [addToast])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, info, warning }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
