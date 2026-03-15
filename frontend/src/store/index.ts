import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER, PersistConfig } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import filtersReducer, { FiltersState } from './slices/filtersSlice'
import jobsReducer, { JobsState } from './slices/jobsSlice'
import historyReducer, { HistoryState } from './slices/historySlice'
import { historyMiddleware } from './middleware/historyMiddleware'

// Configuration de persistence
const persistConfig: PersistConfig<any> = {
  key: 'root',
  storage,
  whitelist: ['filters', 'jobs', 'history'],
  blacklist: [],
}

// Créer les reducers persistés
const persistedFiltersReducer = persistReducer(
  { ...persistConfig, key: 'filters' } as PersistConfig<FiltersState>,
  filtersReducer
)

const persistedJobsReducer = persistReducer(
  { ...persistConfig, key: 'jobs' } as PersistConfig<JobsState>,
  jobsReducer
)

const persistedHistoryReducer = persistReducer(
  { ...persistConfig, key: 'history' } as PersistConfig<HistoryState>,
  historyReducer
)

// Configuration du store
const middlewareConfig = (getDefaultMiddleware: any) =>
  getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    },
  }).concat(historyMiddleware)

export const store = configureStore({
  reducer: {
    filters: persistedFiltersReducer as any,
    jobs: persistedJobsReducer as any,
    history: persistedHistoryReducer as any,
  },
  middleware: middlewareConfig,
  devTools: true,
})

// Persister
export const persistor = persistStore(store)

// Types TypeScript - Explicitly define RootState to avoid PersistPartial issues
export interface RootState {
  filters: FiltersState
  jobs: JobsState
  history: HistoryState
}

export type AppDispatch = typeof store.dispatch
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>
