import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface FiltersState {
  searchTerm: string
  locationFilter: string
  categoryFilter: string
  sortBy: 'recent' | 'popular' | 'salary'
  dateRange: {
    start: string | null
    end: string | null
  }
}

const initialState: FiltersState = {
  searchTerm: '',
  locationFilter: '',
  categoryFilter: '',
  sortBy: 'recent',
  dateRange: {
    start: null,
    end: null,
  },
}

export const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    // Search term actions
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload
    },

    // Location filter actions
    setLocationFilter: (state, action: PayloadAction<string>) => {
      state.locationFilter = action.payload
    },

    // Category filter actions
    setCategoryFilter: (state, action: PayloadAction<string>) => {
      state.categoryFilter = action.payload
    },

    // Sort actions
    setSortBy: (state, action: PayloadAction<'recent' | 'popular' | 'salary'>) => {
      state.sortBy = action.payload
    },

    // Date range actions
    setDateRange: (state, action: PayloadAction<{ start: string | null; end: string | null }>) => {
      state.dateRange = action.payload
    },

    // Reset all filters
    resetFilters: (state) => {
      state.searchTerm = ''
      state.locationFilter = ''
      state.categoryFilter = ''
      state.sortBy = 'recent'
      state.dateRange = { start: null, end: null }
    },

    // Update multiple filters at once
    updateFilters: (state, action: PayloadAction<Partial<FiltersState>>) => {
      return { ...state, ...action.payload }
    },
  },
})

export const {
  setSearchTerm,
  setLocationFilter,
  setCategoryFilter,
  setSortBy,
  setDateRange,
  resetFilters,
  updateFilters,
} = filtersSlice.actions

export default filtersSlice.reducer
