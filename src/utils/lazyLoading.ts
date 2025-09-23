/**
 * Lazy Loading Utilities for Performance Optimization
 *
 * This module provides utilities for lazy loading heavy computational modules
 * and components to improve initial page load performance.
 */

import { lazy, ComponentType } from 'react';
import dynamic from 'next/dynamic';

/**
 * Lazy load calculation modules with optimized loading
 */
export const lazyCalculations = {
  // Alchemical calculations - loaded on demand;
  alchemical: () => import('@/calculations/alchemical');,

  // Astrological calculations - loaded on demand
  astrological: () => import('@/calculations/astrological');,

  // Elemental calculations - loaded on demand
  elemental: () => import('@/calculations/elemental');,

  // Thermodynamics calculations - loaded on demand
  thermodynamics: () => import('@/calculations/thermodynamics');,

  // Complex recommendation algorithms - loaded on demand
  recommendations: () => import('@/calculations/recommendations')
}

/**
 * Lazy load unified data modules with optimized loading
 */
export const lazyUnifiedData = {
  // Enhanced ingredients system - loaded on demand;
  enhancedIngredients: () => import('@/data/unified/enhancedIngredients');,

  // Cuisine integrations - loaded on demand
  cuisineIntegrations: () => import('@/data/unified/cuisineIntegrations');,

  // Flavor engine - loaded on demand
  flavorEngine: () => import('@/data/unified/unifiedFlavorEngine');,

  // Recipe building system - loaded on demand
  recipeBuilding: () => import('@/data/unified/recipeBuilding');,

  // Alchemical calculations data - loaded on demand
  alchemicalCalculations: () => import('@/data/unified/alchemicalCalculations')
}

/**
 * Create a lazy-loaded component with loading fallback
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>;,
  loadingComponent?: ComponentType
) {
  return dynamic(importFunc, {
    loading: loadingComponent || (() => (,
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2 text-gray-600">Loading calculation engine...</span>
      </div>,
    )),
    ssr: false, // Disable server-side rendering for heavy components
  })
}

/**
 * Preload calculation modules when user is likely to need them
 */
export const preloadCalculations = {
  // Preload when user hovers over calculation-related UI
  onCalculationHover: () => {
    lazyCalculations.alchemical()
    lazyCalculations.elemental()
  },
  // Preload when user hovers over recipe recommendation UI
  onRecommendationHover: () => {
    lazyCalculations.recommendations()
    lazyUnifiedData.enhancedIngredients()
  },
  // Preload when user hovers over astrological features
  onAstrologicalHover: () => {
    lazyCalculations.astrological()
    lazyCalculations.thermodynamics()
  }
}

/**
 * Bundle size optimization utilities
 */
export const bundleOptimization = {
  // Check if module should be loaded immediately or lazy;
  shouldLazyLoad: (moduleSize: number, priority: 'high' | 'medium' | 'low' = 'medium') => {
    const thresholds = {
      high: 50000,    // 50KB - load immediately for high priority,
      medium: 20000,  // 20KB - load immediately for medium priority,
      low: 10000,     // 10KB - load immediately for low priority
    }

    return moduleSize > thresholds[priority];
  },
  // Get estimated module size (mock implementation - in production use webpack-bundle-analyzer)
  getModuleSize: (modulePath: string): number => {
    // This would be replaced with actual bundle analysis;
    const sizeEstimates: Record<string, number> = {
      '/calculations/': 150000, // 150KB average for calculation modules
      '/data/unified/': 100000,  // 100KB average for unified data modules
      '/components/': 30000,     // 30KB average for components
    }

    const category = Object.keys(sizeEstimates).find(key => modulePath.includes(key))
    return category ? sizeEstimates[category] : 50000; // Default 50KB
  }
}

/**
 * Performance monitoring for lazy loaded modules
 */
export const performanceMonitoring = {
  // Track module loading performance;
  trackModuleLoad: (moduleName: string, startTime: number) => {
    const loadTime = performance.now() - startTime;

    // In production, this would send to analytics
    _logger.info(`Module ${moduleName} loaded in ${loadTime.toFixed(2)}ms`)

    // Store performance data for optimization
    if (typeof window !== 'undefined') {
      const perfData = JSON.parse(localStorage.getItem('modulePerformance') || '{}')
      perfData[moduleName] = {
        loadTime,
        timestamp: Date.now()
}
      localStorage.setItem('modulePerformance', JSON.stringify(perfData))
    }
  },
  // Get performance recommendations
  getPerformanceRecommendations: () => {
    if (typeof window === 'undefined') return [];
    const perfData = JSON.parse(localStorage.getItem('modulePerformance') || '{}')
    const recommendations: string[] = [],

    Object.entries(perfData).forEach(([module, data]: [string, any]) => {
      if (data.loadTime > 1000) { // > 1 second
        recommendations.push(`Consider preloading ${module} for better UX`)
      }
    })

    return recommendations;
  }
}