import type { Middleware, AnyAction } from '@reduxjs/toolkit'
import { recordHistory } from '../slices/historySlice'

/**
 * Middleware pour synchroniser les changements de filtres avec l'historique
 * Enregistre automatiquement les changements de filtres pour Undo/Redo
 */
export const historyMiddleware: Middleware = ((store: any) => (next: any) => (action: AnyAction) => {
  const previousFilters = store.getState().filters
  const previousHistory = store.getState().history

  // Passer l'action suivante
  const result = next(action)

  // Vérifier si les filtres ont changé
  const currentFilters = store.getState().filters
  const filtersChanged = JSON.stringify(previousFilters) !== JSON.stringify(currentFilters)

  // Si les filtres ont changé ET ce n'est pas un undo/redo
  if (
    filtersChanged &&
    !previousHistory.isUndoRedoInProgress &&
    action.type &&
    action.type.startsWith('filters/')
  ) {
    // Enregistrer l'historique
    store.dispatch(
      recordHistory({
        filters: previousFilters,
        action: action.type,
      })
    )
  }

  return result
}) as any

/**
 * Middleware pour tracker les changements de filtres avec debug
 */
export const filterChangeTrackerMiddleware: Middleware = ((store: any) => (next: any) => (action: AnyAction) => {
  const result = next(action)

  if (action.type && action.type.startsWith('filters/')) {
    const state = store.getState()
    console.log('[Filters Changed]', {
      action: action.type,
      filters: state.filters,
      historySize: {
        past: state.history.past.length,
        future: state.history.future.length,
      },
    })
  }

  return result
}) as any
