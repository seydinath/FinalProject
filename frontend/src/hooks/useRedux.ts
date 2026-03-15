import { useDispatch, useSelector } from 'react-redux'
import type { TypedUseSelectorHook } from 'react-redux'
import type { RootState, AppDispatch } from '../store'
import {
  setSearchTerm,
  setLocationFilter,
  setCategoryFilter,
  setSortBy,
  setDateRange,
  resetFilters,
  updateFilters,
  type FiltersState,
} from '../store/slices/filtersSlice'
import {
  applyToJob,
  removeApplication,
  addToFavorites,
  removeFromFavorites,
  addToSaved,
  removeFromSaved,
} from '../store/slices/jobsSlice'
import {
  undo,
  redo,
  clearHistory,
} from '../store/slices/historySlice'

// Hooks typés pour Redux
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

/**
 * Hook personnalisé pour les filtres
 */
export function useFilters() {
  const dispatch = useAppDispatch()
  const filters = useAppSelector((state) => state.filters)

  return {
    filters,
    setSearchTerm: (term: string) => dispatch(setSearchTerm(term)),
    setLocationFilter: (location: string) => dispatch(setLocationFilter(location)),
    setCategoryFilter: (category: string) => dispatch(setCategoryFilter(category)),
    setSortBy: (sort: 'recent' | 'popular' | 'salary') => dispatch(setSortBy(sort)),
    setDateRange: (range: { start: string | null; end: string | null }) =>
      dispatch(setDateRange(range)),
    resetFilters: () => dispatch(resetFilters()),
    updateFilters: (partialFilters: Partial<FiltersState>) =>
      dispatch(updateFilters(partialFilters)),
  }
}

/**
 * Hook personnalisé pour les jobs
 */
export function useJobs() {
  const dispatch = useAppDispatch()
  const jobs = useAppSelector((state) => state.jobs)

  return {
    jobs,
    appliedJobs: jobs.appliedJobs,
    favoriteJobs: jobs.favoriteJobs,
    savedJobs: jobs.savedJobs,
    isJobApplied: (jobId: string) => jobs.appliedJobs.includes(jobId),
    isJobFavorited: (jobId: string) => jobs.favoriteJobs.includes(jobId),
    isJobSaved: (jobId: string) => jobs.savedJobs.includes(jobId),
    applyToJob: (jobId: string) => dispatch(applyToJob(jobId)),
    removeApplication: (jobId: string) => dispatch(removeApplication(jobId)),
    addToFavorites: (jobId: string) => dispatch(addToFavorites(jobId)),
    removeFromFavorites: (jobId: string) => dispatch(removeFromFavorites(jobId)),
    addToSaved: (jobId: string) => dispatch(addToSaved(jobId)),
    removeFromSaved: (jobId: string) => dispatch(removeFromSaved(jobId)),
  }
}

/**
 * Hook personnalisé pour l'historique (Undo/Redo)
 */
export function useHistory() {
  const dispatch = useAppDispatch()
  const history = useAppSelector((state) => state.history)

  return {
    history,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    undoCount: history.past.length,
    redoCount: history.future.length,
    undo: () => {
      if (history.past.length > 0) {
        dispatch(undo())
      }
    },
    redo: () => {
      if (history.future.length > 0) {
        dispatch(redo())
      }
    },
    clearHistory: () => dispatch(clearHistory()),
    lastAction: history.past.length > 0 ? history.past[history.past.length - 1]?.action : null,
    lastRedoAction: history.future.length > 0 ? history.future[0]?.action : null,
  }
}

/**
 * Hook pour obtenir des informations combinées
 */
export function useReduxState() {
  const filters = useAppSelector((state) => state.filters)
  const jobs = useAppSelector((state) => state.jobs)
  const history = useAppSelector((state) => state.history)

  return {
    filters,
    jobs,
    history,
  }
}
