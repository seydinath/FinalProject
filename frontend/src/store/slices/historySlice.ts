import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { FiltersState } from './filtersSlice'

export interface HistoryEntry {
  filters: FiltersState
  timestamp: number
  action: string
}

export interface HistoryState {
  past: HistoryEntry[]
  present: FiltersState
  future: HistoryEntry[]
  maxHistorySize: number
  isUndoRedoInProgress: boolean
}

const initialFilterState: FiltersState = {
  searchTerm: '',
  locationFilter: '',
  categoryFilter: '',
  sortBy: 'recent',
  dateRange: {
    start: null,
    end: null,
  },
}

const initialState: HistoryState = {
  past: [],
  present: initialFilterState,
  future: [],
  maxHistorySize: 20, // Limiter à 20 entrées d'historique
  isUndoRedoInProgress: false,
}

export const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    // Enregistrer un nouvel état
    recordHistory: (
      state,
      action: PayloadAction<{ filters: FiltersState; action: string }>
    ) => {
      // Vérifier si we're undoing/redoing
      if (state.isUndoRedoInProgress) {
        return
      }

      // Ajouter l'état présent au passé
      state.past.push({
        filters: { ...state.present },
        timestamp: Date.now(),
        action: action.payload.action,
      })

      // Limiter la taille de l'historique
      if (state.past.length > state.maxHistorySize) {
        state.past.shift()
      }

      // Mettre à jour le présent
      state.present = action.payload.filters

      // Vider le futur (les actions de redo sont invalides)
      state.future = []
    },

    // Undo
    undo: (state) => {
      if (state.past.length === 0) return

      state.isUndoRedoInProgress = true

      const previousEntry = state.past.pop()
      if (previousEntry) {
        state.future.unshift({
          filters: { ...state.present },
          timestamp: Date.now(),
          action: 'redo_entry',
        })
        state.present = previousEntry.filters
      }

      state.isUndoRedoInProgress = false
    },

    // Redo
    redo: (state) => {
      if (state.future.length === 0) return

      state.isUndoRedoInProgress = true

      const futureEntry = state.future.shift()
      if (futureEntry) {
        state.past.push({
          filters: { ...state.present },
          timestamp: Date.now(),
          action: 'undo_entry',
        })
        state.present = futureEntry.filters
      }

      state.isUndoRedoInProgress = false
    },

    // Check if undo/redo is available
    // These are removed - can be derived from state instead

    // Clear history
    clearHistory: (state) => {
      state.past = []
      state.future = []
      state.present = initialFilterState
    },

    // Set max history size
    setMaxHistorySize: (state, action: PayloadAction<number>) => {
      state.maxHistorySize = action.payload
    },
  },
})

export const {
  recordHistory,
  undo,
  redo,
  clearHistory,
  setMaxHistorySize,
} = historySlice.actions

export default historySlice.reducer
