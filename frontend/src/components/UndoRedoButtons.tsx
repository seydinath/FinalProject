import { memo, useCallback } from 'react'
import { useHistory } from '../hooks/useRedux'

interface UndoRedoButtonsProps {
  className?: string
  showLabels?: boolean
}

function UndoRedoButtonsContent({ className = '', showLabels = false }: UndoRedoButtonsProps) {
  const { canUndo, canRedo, undo, redo, undoCount, redoCount } = useHistory()

  const handleUndo = useCallback(() => {
    undo()
  }, [undo])

  const handleRedo = useCallback(() => {
    redo()
  }, [redo])

  return (
    <div className={`undo-redo-buttons ${className}`}>
      <button
        className={`btn-undo ${canUndo ? 'enabled' : 'disabled'}`}
        onClick={handleUndo}
        disabled={!canUndo}
        title={`Undo (${undoCount} actions) - Ctrl+Z`}
        aria-label="Undo last action"
      >
        <span className="icon">↶</span>
        {showLabels && <span className="label">{undoCount}</span>}
      </button>

      <button
        className={`btn-redo ${canRedo ? 'enabled' : 'disabled'}`}
        onClick={handleRedo}
        disabled={!canRedo}
        title={`Redo (${redoCount} actions) - Ctrl+Shift+Z`}
        aria-label="Redo last action"
      >
        <span className="icon">↷</span>
        {showLabels && <span className="label">{redoCount}</span>}
      </button>
    </div>
  )
}

// Memoize with custom comparison to avoid re-renders
export const UndoRedoButtons = memo(UndoRedoButtonsContent, (prevProps, nextProps) => {
  return prevProps.className === nextProps.className && prevProps.showLabels === nextProps.showLabels
})

export default UndoRedoButtons
