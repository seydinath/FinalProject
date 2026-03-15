import { memo, useCallback } from 'react'
import { useToast } from '../utils/ToastContext'
import { Toast } from './Toast'

function ToastContainerContent() {
  const { toasts, removeToast } = useToast()

  const handleClose = useCallback((id: string) => {
    removeToast(id)
  }, [removeToast])

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast 
          key={toast.id}
          toast={toast}
          onClose={() => handleClose(toast.id)}
        />
      ))}
    </div>
  )
}

// Memoize to prevent re-renders when parent updates
export const ToastContainer = memo(ToastContainerContent)
