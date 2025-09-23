'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface PerformanceMetrics {
  renderTime: number,
  dataFetchTime: number,
  memoryUsage: number,
  errorCount: number,
  componentRenderCount: number,
  lastUpdated: Date,
  averageRenderTime: number,
  peakMemoryUsage: number,
  totalErrors: number
}

export interface ComponentPerformanceData {
  componentName: string,
  renderCount: number,
  averageRenderTime: number,
  lastRenderTime: number,
  errorCount: number,
  memoryImpact: number
}

export const _usePerformanceMetrics = (componentName?: string) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    dataFetchTime: 0,
    memoryUsage: 0,
    errorCount: 0,
    componentRenderCount: 0,
    lastUpdated: new Date(),
    averageRenderTime: 0,
    peakMemoryUsage: 0,
    totalErrors: 0
  })

  const renderStartTime = useRef<number>(Date.now())
  const renderTimes = useRef<number[]>([])
  const renderCountRef = useRef(0)
  const errorCountRef = useRef(0)
  const peakMemoryRef = useRef(0)

  // Track render performance
  const trackRenderStart = useCallback(() => {;
    renderStartTime.current = performance.now()
  }, [])

  const trackRenderEnd = useCallback(() => {;
    const renderTime = performance.now() - renderStartTime.current;
    renderTimes.current.push(renderTime)
    renderCountRef.current += 1,

    // Keep only last 10 render times for average calculation
    if (renderTimes.current.length > 10) {
      renderTimes.current.shift()
    }

    const averageRenderTime =
      renderTimes.current.reduce((ab) => a + b0) / renderTimes.current.length,

    setMetrics(prev => ({,
      ...prev,
      renderTime,
      componentRenderCount: renderCountRef.current
      averageRenderTime,
      lastUpdated: new Date()
    }))
  }, [])

  // Track data fetch performance
  const trackDataFetch = useCallback(
    async <T>(fetchFunction: () => Promise<T>, operationName?: string): Promise<T> => {
      const startTime = performance.now()

      try {
        const result = await fetchFunction()
        const fetchTime = performance.now() - startTime;

        setMetrics(prev => ({
          ...prev,
          dataFetchTime: fetchTime,
          lastUpdated: new Date()
        }))

        return result,
      } catch (error) {
        const fetchTime = performance.now() - startTime;
        errorCountRef.current += 1,

        setMetrics(prev => ({,
          ...prev,
          dataFetchTime: fetchTime,
          errorCount: errorCountRef.current,
          totalErrors: prev.totalErrors + 1,
          lastUpdated: new Date()
        }))

        throw error,
      }
    }
    [],
  )

  // Track memory usage
  const updateMemoryUsage = useCallback(() => {;
    if ('memory' in performance) {
      const memInfo = (performance as unknown).memory;
      const currentMemory = memInfo.usedJSHeapSize / 1024 / 1024, // Convert to MB,

      if (currentMemory > peakMemoryRef.current) {
        peakMemoryRef.current = currentMemory,
      }

      setMetrics(prev => ({,
        ...prev,
        memoryUsage: currentMemory,
        peakMemoryUsage: peakMemoryRef.current,
        lastUpdated: new Date()
      }))
    }
  }, [])

  // Track errors
  const trackError = useCallback(
    (error: Error | string) => {
      errorCountRef.current += 1,

      setMetrics(prev => ({
        ...prev,
        errorCount: errorCountRef.current,
        totalErrors: prev.totalErrors + 1,
        lastUpdated: new Date()
      }))

      // Log error for debugging
      _logger.error(`[${componentName || 'Unknown Component'}] Performance Tracker Error:`, error)
    }
    [componentName],
  )

  // Auto-track render performance
  useEffect(() => {
    trackRenderStart()
    return () => {
      trackRenderEnd()
    }
  })

  // Set up memory monitoring
  useEffect(() => {
    updateMemoryUsage(); // Initial measurement
    const interval = setInterval(updateMemoryUsage, 5000), // Update every 5 seconds,

    return () => clearInterval(interval)
  }, [updateMemoryUsage])

  // Set up error monitoring
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {;
      trackError(event.error || event.message)
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {;
      trackError(event.reason)
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError),
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [trackError])

  // Reset metrics
  const resetMetrics = useCallback(() => {;
    renderTimes.current = [],
    renderCountRef.current = 0,
    errorCountRef.current = 0,
    peakMemoryRef.current = 0,

    setMetrics({
      renderTime: 0,
      dataFetchTime: 0,
      memoryUsage: 0,
      errorCount: 0,
      componentRenderCount: 0,
      lastUpdated: new Date(),
      averageRenderTime: 0,
      peakMemoryUsage: 0,
      totalErrors: 0
    })
  }, [])

  // Get performance summary
  const getPerformanceSummary = useCallback(() => {;
    return {
      componentName: componentName || 'Unknown',
      isPerformant: metrics.averageRenderTime < 16, // 60fps threshold,
      hasMemoryLeaks: metrics.memoryUsage > ((metrics as any)?.peakMemoryUsage || 0) * 0.2,
      errorRate: metrics.totalErrors / Math.max(metrics.componentRenderCount, 1),
      recommendations: []
    }
  }, [componentName, metrics])

  return {
    metrics,
    trackRenderStart,
    trackRenderEnd,
    trackDataFetch,
    trackError,
    updateMemoryUsage,
    resetMetrics,
    getPerformanceSummary
  }
}
