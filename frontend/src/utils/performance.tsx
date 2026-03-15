/**
 * Performance Monitoring Utility
 * Tracks bundle size, load times, and component rendering performance
 */

import React from 'react'

interface PerformanceMetrics {
  resourceName: string
  duration: number
  timestamp: number
  type: 'navigation' | 'resource' | 'paint' | 'render'
}

// Bundle metrics interface for future use
// interface BundleMetrics {
//   js: number
//   css: number
//   total: number
//   gzip: {
//     js: number
//     css: number
//     total: number
//   }
// }

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private marks: Map<string, number> = new Map()
  private readonly isDev = typeof window !== 'undefined' && /localhost|127\.0\.0\.1/.test(window.location.hostname)

  /**
   * Start measuring a component or operation
   */
  startMeasure(label: string): void {
    this.marks.set(label, performance.now())
  }

  /**
   * End measuring and record the duration
   */
  endMeasure(label: string, type: 'render' = 'render'): number {
    const startTime = this.marks.get(label)
    if (!startTime) {
      console.warn(`No start mark found for "${label}"`)
      return 0
    }

    const duration = performance.now() - startTime
    const metric: PerformanceMetrics = {
      resourceName: label,
      duration,
      timestamp: Date.now(),
      type,
    }

    this.metrics.push(metric)
    this.marks.delete(label)

    // Log slow renders (>16ms = 60fps threshold)
    if (duration > 16) {
      console.warn(`⚠️ Slow render detected: "${label}" took ${duration.toFixed(2)}ms`)
    }

    return duration
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics]
  }

  /**
   * Get average render time for a component
   */
  getAverageRenderTime(label: string): number {
    const componentMetrics = this.metrics.filter(m => m.resourceName === label && m.type === 'render')
    if (componentMetrics.length === 0) return 0
    const total = componentMetrics.reduce((sum, m) => sum + m.duration, 0)
    return total / componentMetrics.length
  }

  /**
   * Get Core Web Vitals
   */
  getCoreWebVitals(): {
    fcp: number | null
    lcp: number | null
    cls: number | null
    ttfb: number | null
  } {
    return {
      fcp: this.getNavigationMetric('first-contentful-paint'),
      lcp: this.getNavigationMetric('largest-contentful-paint'),
      cls: this.getNavigationMetric('cumulative-layout-shift'),
      ttfb: this.getNavigationMetric('time-to-first-byte'),
    }
  }

  /**
   * Get navigation timing metric
   */
  private getNavigationMetric(name: string): number | null {
    try {
      const entries = performance.getEntriesByName(name)
      if (entries.length === 0) return null
      return entries[0].startTime
    } catch {
      return null
    }
  }

  /**
   * Get resource timings (CSS, JS chunks, images, etc.)
   */
  getResourceTimings(): {
    name: string
    size: number
    duration: number
  }[] {
    try {
      return performance.getEntriesByType('resource').map(entry => ({
        name: entry.name,
        size: (entry as any).transferSize || 0,
        duration: entry.duration,
      }))
    } catch {
      return []
    }
  }

  /**
   * Get total page load time
   */
  getPageLoadTime(): number {
    try {
      const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (!navigationTiming) return 0
      return navigationTiming.loadEventEnd - navigationTiming.fetchStart
    } catch {
      return 0
    }
  }

  /**
   * Get detailed load timing breakdown
   */
  getLoadTimingBreakdown(): {
    dns: number
    tcp: number
    ttfb: number
    download: number
    domInteractive: number
    domLoading: number
  } {
    try {
      const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (!timing) return { dns: 0, tcp: 0, ttfb: 0, download: 0, domInteractive: 0, domLoading: 0 }

      return {
        dns: timing.domainLookupEnd - timing.domainLookupStart,
        tcp: timing.connectEnd - timing.connectStart,
        ttfb: timing.responseStart - timing.requestStart,
        download: timing.responseEnd - timing.responseStart,
        domInteractive: timing.domInteractive - timing.fetchStart,
        domLoading: timing.domComplete - timing.domContentLoadedEventStart,
      }
    } catch {
      return { dns: 0, tcp: 0, ttfb: 0, download: 0, domInteractive: 0, domLoading: 0 }
    }
  }

  /**
   * Log performance report
   */
  logReport(): void {
    if (!this.isDev) return

    console.group('📊 Performance Report')
    
    console.group('Core Web Vitals')
    const vitals = this.getCoreWebVitals()
    console.log(`FCP: ${vitals.fcp?.toFixed(2)}ms`)
    console.log(`LCP: ${vitals.lcp?.toFixed(2)}ms`)
    console.log(`CLS: ${vitals.cls?.toFixed(4)}`)
    console.groupEnd()

    console.group('Load Timing')
    console.log(`Total Page Load: ${this.getPageLoadTime().toFixed(2)}ms`)
    const breakdown = this.getLoadTimingBreakdown()
    console.log(`DNS: ${breakdown.dns.toFixed(2)}ms`)
    console.log(`TCP: ${breakdown.tcp.toFixed(2)}ms`)
    console.log(`TTFB: ${breakdown.ttfb.toFixed(2)}ms`)
    console.log(`Download: ${breakdown.download.toFixed(2)}ms`)
    console.groupEnd()

    console.group('Slow Renders (>16ms)')
    const slowMetrics = this.metrics.filter(m => m.duration > 16)
    if (slowMetrics.length === 0) {
      console.log('✓ No slow renders detected')
    } else {
      slowMetrics.forEach(m => {
        console.log(`${m.resourceName}: ${m.duration.toFixed(2)}ms`)
      })
    }
    console.groupEnd()

    console.groupEnd()
  }

  /**
   * Clear all recorded metrics
   */
  clear(): void {
    this.metrics = []
    this.marks.clear()
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor()

/**
 * React hook for measuring component render time
 */
export function useRenderTime(componentName: string): void {
  React.useEffect(() => {
    performanceMonitor.startMeasure(componentName)
    return () => {
      performanceMonitor.endMeasure(componentName, 'render')
    }
  }, [componentName])
}

/**
 * Hook to report component render count
 */
export function useRenderCount(componentName: string): number {
  const renderCount = React.useRef(0)
  const isDev = typeof window !== 'undefined' && /localhost|127\.0\.0\.1/.test(window.location.hostname)

  React.useEffect(() => {
    renderCount.current++
    if (isDev && renderCount.current > 1) {
      console.log(`🔄 ${componentName} re-rendered (count: ${renderCount.current})`)
    }
  }, [componentName, isDev])

  return renderCount.current
}

/**
 * HOC to measure render performance
 */
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string = Component.displayName || Component.name
): React.ComponentType<P> {
  return (props: P) => {
    useRenderTime(componentName)
    return <Component {...props} />
  }
}
