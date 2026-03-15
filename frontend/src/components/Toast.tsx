import { useTheme } from '../utils/ThemeContext'
import { Toast as ToastType } from '../utils/ToastContext'

interface ToastItemProps {
  toast: ToastType
  onClose: () => void
}

export function Toast({ toast, onClose }: ToastItemProps) {
  const { isDark } = useTheme()

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✓'
      case 'error':
        return '✕'
      case 'warning':
        return '⚠'
      case 'info':
        return 'ⓘ'
    }
  }

  const getColor = () => {
    switch (toast.type) {
      case 'success':
        return '#10b981'
      case 'error':
        return '#ef4444'
      case 'warning':
        return '#f59e0b'
      case 'info':
        return '#3b82f6'
    }
  }

  return (
    <div className={`toast toast-${toast.type} ${isDark ? 'dark' : 'light'}`}>
      <div className="toast-icon" style={{ color: getColor() }}>
        {getIcon()}
      </div>
      
      <div className="toast-content">
        <p className="toast-message">{toast.message}</p>
      </div>

      <button className="toast-close" onClick={onClose}>
        ✕
      </button>

      <div className="toast-progress">
        <div 
          className="toast-progress-bar" 
          style={{ 
            backgroundColor: getColor(),
            animation: `toastProgress ${toast.duration || 3000}ms linear forwards`
          }}
        />
      </div>
    </div>
  )
}
