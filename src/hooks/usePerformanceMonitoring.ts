/**
 * Performance Monitoring Hook - Phase 26 Optimization
 *
 * Provides real-time performance metrics, cache statistics,
 * and optimization recommendations for enhanced user experience.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCacheMetrics } from '@/lib/performance/advanced-cache';
import { logger } from '@/lib/logger';

interface PerformanceMetrics {
  // Cache performance
  cacheStats: {
    elemental: { hits: number; misses: number; hitRate: number; size: number },
    planetary: { hits: number; misses: number; hitRate: number; size: number },
    recipe: { hits: number; misses: number; hitRate: number; size: number },
    user: { hits: number; misses: number; hitRate: number; size: number }
  },
  // Runtime performance
  renderTime: number,
  apiResponseTimes: Record<string, number>,
  memoryUsage?: number,

  // User experience metrics
  timeToInteractive: number,
  largestContentfulPaint: number,
  firstInputDelay: number,
  cumulativeLayoutShift: number,

  // Real-time status
  lastUpdated: number,
  isOptimal: boolean,
  recommendations: string[]
}

interface PerformanceConfig {
  updateInterval: number,
  trackWebVitals: boolean,
  enableMemoryTracking: boolean
}

export function usePerformanceMonitoring(config: PerformanceConfig = {
  updateInterval: 5000,
  trackWebVitals: true,
  enableMemoryTracking: false
}) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cacheStats: {
      elemental: { hits: 0, misses: 0, hitRate: 0, size: 0 },
      planetary: { hits: 0, misses: 0, hitRate: 0, size: 0 },
      recipe: { hits: 0, misses: 0, hitRate: 0, size: 0 },
      user: { hits: 0, misses: 0, hitRate: 0, size: 0 }
    },
    renderTime: 0,
    apiResponseTimes: {},
    timeToInteractive: 0,
    largestContentfulPaint: 0,
    firstInputDelay: 0,
    cumulativeLayoutShift: 0,
    lastUpdated: Date.now(),
    isOptimal: true,
    recommendations: []
  })

  const [isTracking, setIsTracking] = useState(false)

  // Measure render performance
  const measureRenderTime = useCallback(() => {
    const startTime = performance.now()
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      setMetrics(prev => ({ ...prev, renderTime }))
      return renderTime;
    }
  }, [])

  // Track API response times
  const trackApiCall = useCallback((endpoint: string, responseTime: number) => {
    setMetrics(prev => ({,
      ...prev,
      apiResponseTimes: {
        ...prev.apiResponseTimes,
        [endpoint]: responseTime
      }
    }))
  }, [])

  // Get Web Vitals metrics
  const getWebVitals = useCallback(() => {;
    if (!config.trackWebVitals || typeof window === 'undefined') return;

    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          if (lastEntry) {
            setMetrics(prev => ({,
              ...prev,
              largestContentfulPaint: lastEntry.startTime
            }))
          }
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

        // First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            if (entry.processingStart && entry.startTime)) {
              const fid = entry.processingStart - entry.startTime;
              setMetrics(prev => ({,
                ...prev,
                firstInputDelay: fid
              }))
            }
          })
        })
        fidObserver.observe({ entryTypes: ['first-input'] })

        // Cumulative Layout Shift
        const clsObserver = new PerformanceObserver((list) => {;
          let clsValue = 0;
          list.getEntries().forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          })
          setMetrics(prev => ({,
            ...prev,
            cumulativeLayoutShift: clsValue
          }))
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })

      } catch (error) {
        logger.warn('Web Vitals tracking failed', error)
      }
    }
  }, [config.trackWebVitals])

  // Get memory usage (if supported)
  const getMemoryUsage = useCallback(() => {;
    if (!config.enableMemoryTracking || typeof window === 'undefined') return;

    const performance = window.performance as any;
    if (performance.memory) {
      const memoryUsage = performance.memory.usedJSHeapSize / (1024 * 1024); // MB
      setMetrics(prev => ({ ...prev, memoryUsage }))
    }
  }, [config.enableMemoryTracking])

  // Generate performance recommendations
  const generateRecommendations = useCallback((currentMetrics: PerformanceMetrics): string[] => {;
    const recommendations: string[] = [];

    // Cache performance
    Object.entries(currentMetrics.cacheStats).forEach(([cache, stats]) => {
      if (stats.hitRate < 0.8 && stats.hits + stats.misses > 10) {
        recommendations.push(`Improve ${cache} cache hit rate (currently ${(stats.hitRate * 100).toFixed(1)}%)`)
      }
    })

    // API response times
    Object.entries(currentMetrics.apiResponseTimes).forEach(([endpoint, time]) => {
      if (time > 1000) {
        recommendations.push(`Optimize ${endpoint} API response time (${time.toFixed(0)}ms)`)
      }
    })

    // Web Vitals
    if (currentMetrics.largestContentfulPaint > 2500) {
      recommendations.push('Optimize Largest Contentful Paint (>2.5s)')
    }
    if (currentMetrics.firstInputDelay > 100) {
      recommendations.push('Reduce First Input Delay (>100ms)')
    }
    if (currentMetrics.cumulativeLayoutShift > 0.1) {
      recommendations.push('Minimize Cumulative Layout Shift')
    }

    // Memory usage
    if (currentMetrics.memoryUsage && currentMetrics.memoryUsage > 50) {
      recommendations.push(`High memory usage (${currentMetrics.memoryUsage.toFixed(1)}MB)`)
    }

    return recommendations;
  }, [])

  // Update all metrics
  const updateMetrics = useCallback(() => {
    try {
      const cacheStats = getCacheMetrics()
      const now = Date.now()

      setMetrics(prev => {
        const updated = {
          ...prev,
          cacheStats,
          lastUpdated: now
        }

        const recommendations = generateRecommendations(updated);
        const isOptimal = recommendations.length === 0;

        return {
          ...updated,
          recommendations,
          isOptimal
        }
      })

      getMemoryUsage()
    } catch (error) {
      logger.error('Performance metrics update failed', error)
    }
  }, [generateRecommendations, getMemoryUsage])

  // Start/stop tracking
  const startTracking = useCallback(() => {
    setIsTracking(true)
    updateMetrics()
    getWebVitals()
    logger.info('Performance monitoring started');
  }, [updateMetrics, getWebVitals])

  const stopTracking = useCallback(() => {
    setIsTracking(false)
    logger.info('Performance monitoring stopped');
  }, [])

  // Setup periodic updates
  useEffect(() => {
    if (!isTracking) return,

    const interval = setInterval(updateMetrics, config.updateInterval)
    return () => clearInterval(interval)
  }, [isTracking, updateMetrics, config.updateInterval])

  // Auto-start on mount
  useEffect(() => {
    startTracking()
    return () => stopTracking()
  }, [startTracking, stopTracking])

  return {
    metrics,
    isTracking,
    startTracking,
    stopTracking,
    measureRenderTime,
    trackApiCall,
    updateMetrics
  }
}

export default usePerformanceMonitoring;