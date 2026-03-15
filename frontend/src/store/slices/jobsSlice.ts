import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Job {
  id: string
  title: string
  company: string
  description: string
  location: string
  category: string
  positions: number
  eventDate: string
  skills: string[]
}

export interface JobsState {
  allJobs: Job[]
  appliedJobs: string[]
  favoriteJobs: string[]
  savedJobs: string[]
}

const initialState: JobsState = {
  allJobs: [],
  appliedJobs: [],
  favoriteJobs: [],
  savedJobs: [],
}

export const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    // Initialize jobs
    setAllJobs: (state, action: PayloadAction<Job[]>) => {
      state.allJobs = action.payload
    },

    // Apply to a job
    applyToJob: (state, action: PayloadAction<string>) => {
      const jobId = action.payload
      if (!state.appliedJobs.includes(jobId)) {
        state.appliedJobs.push(jobId)
      }
    },

    // Remove application
    removeApplication: (state, action: PayloadAction<string>) => {
      state.appliedJobs = state.appliedJobs.filter(id => id !== action.payload)
    },

    // Add to favorites
    addToFavorites: (state, action: PayloadAction<string>) => {
      const jobId = action.payload
      if (!state.favoriteJobs.includes(jobId)) {
        state.favoriteJobs.push(jobId)
      }
    },

    // Remove from favorites
    removeFromFavorites: (state, action: PayloadAction<string>) => {
      state.favoriteJobs = state.favoriteJobs.filter(id => id !== action.payload)
    },

    // Add to saved
    addToSaved: (state, action: PayloadAction<string>) => {
      const jobId = action.payload
      if (!state.savedJobs.includes(jobId)) {
        state.savedJobs.push(jobId)
      }
    },

    // Remove from saved
    removeFromSaved: (state, action: PayloadAction<string>) => {
      state.savedJobs = state.savedJobs.filter(id => id !== action.payload)
    },

    // Reset jobs state
    resetJobs: (state) => {
      state.appliedJobs = []
      state.favoriteJobs = []
      state.savedJobs = []
    },
  },
})

export const {
  setAllJobs,
  applyToJob,
  removeApplication,
  addToFavorites,
  removeFromFavorites,
  addToSaved,
  removeFromSaved,
  resetJobs,
} = jobsSlice.actions

export default jobsSlice.reducer
