import { useState, useCallback } from 'react'

interface UseLoadingStateOptions {
  delay?: number
  minDuration?: number
}

export function useLoadingState(options: UseLoadingStateOptions = {}) {
  const { delay = 0, minDuration = 300 } = options
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const startLoading = useCallback(() => {
    if (delay > 0) {
      setTimeout(() => {
        setIsLoading(true)
        setProgress(0)
        setError(null)
      }, delay)
    } else {
      setIsLoading(true)
      setProgress(0)
      setError(null)
    }
  }, [delay])

  const stopLoading = useCallback(() => {
    setIsLoading(false)
    setProgress(100)
    
    setTimeout(() => {
      setProgress(0)
    }, minDuration)
  }, [minDuration])

  const setLoadingProgress = useCallback((value: number) => {
    setProgress(Math.min(Math.max(value, 0), 100))
  }, [])

  const incrementProgress = useCallback((amount: number = 10) => {
    setProgress(prev => Math.min(prev + amount, 90))
  }, [])

  const setLoadingError = useCallback((err: string | null) => {
    setError(err)
    if (err) {
      setIsLoading(false)
    }
  }, [])

  return {
    isLoading,
    progress,
    error,
    startLoading,
    stopLoading,
    setLoadingProgress,
    incrementProgress,
    setLoadingError
  }
}

export function useApiLoader<T>(
  fetchFn: () => Promise<T>,
  options: UseLoadingStateOptions = {}
) {
  const loader = useLoadingState(options)
  const [data, setData] = useState<T | null>(null)

  const load = useCallback(async () => {
    loader.startLoading()
    try {
      loader.setLoadingProgress(25)
      const result = await fetchFn()
      loader.setLoadingProgress(75)
      setData(result)
      loader.setLoadingProgress(100)
      loader.stopLoading()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement'
      loader.setLoadingError(message)
    }
  }, [fetchFn, loader])

  return {
    ...loader,
    data,
    load,
    reset: () => {
      setData(null)
      loader.setLoadingError(null)
    }
  }
}

export function useDelayedLoading(threshold: number = 500) {
  const [showLoading, setShowLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const startLoading = useCallback(() => {
    setIsLoading(true)
    setTimeout(() => {
      if (isLoading) {
        setShowLoading(true)
      }
    }, threshold)
  }, [threshold, isLoading])

  const stopLoading = useCallback(() => {
    setIsLoading(false)
    setShowLoading(false)
  }, [])

  return {
    showLoading: showLoading && isLoading,
    isLoading,
    startLoading,
    stopLoading
  }
}
