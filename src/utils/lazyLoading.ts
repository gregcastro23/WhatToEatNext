import dynamic from "next/dynamic";
import { lazy } from "react";
import { _logger } from "@/lib/logger";
import type { ComponentType } from "react";
/**
 * Lazy Loading Utilities for Performance Optimization
 *
 * This module provides utilities for lazy loading heavy computational modules
 * and components to improve initial page load performance.
 */

/**
 * Lazy load calculation modules with optimized loading
 */
export const lazyCalculations = {
  // DISABLED - These barrel exports don't exist, use main calculations/index instead
  // Alchemical calculations - loaded on demand
  // alchemical: () => import("@/calculations/alchemical"),

  // Astrological calculations - loaded on demand
  // astrological: () => import("@/calculations/astrological"),

  // Elemental calculations - loaded on demand
  // elemental: () => import("@/calculations/elemental"),

  // Thermodynamics calculations - loaded on demand
  // thermodynamics: () => import("@/calculations/thermodynamics"),

  // Complex recommendation algorithms - loaded on demand
  // recommendations: () => import("@/calculations/recommendations"),

  // Use the main calculations module instead
  main: () => import("@/calculations"),
};

/**
 * Lazy load unified data modules with optimized loading
 */
export const lazyUnifiedData = {
  // Enhanced ingredients system - loaded on demand
  enhancedIngredients: () => import("@/data/unified/enhancedIngredients"),

  // Cuisine integrations - loaded on demand
  cuisineIntegrations: () => import("@/data/unified/cuisineIntegrations"),

  // Flavor engine - loaded on demand
  flavorEngine: () => import("@/data/unified/unifiedFlavorEngine"),

  // Recipe building system - loaded on demand
  recipeBuilding: () => import("@/data/unified/recipeBuilding"),

  // Alchemical calculations data - loaded on demand
  alchemicalCalculations: () => import("@/data/unified/alchemicalCalculations"),
};

/**
 * Create a lazy-loaded component with loading fallback
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  loadingComponent?: ComponentType,
) {
  return dynamic(importFunc, {
    loading: loadingComponent as any,
    ssr: false, // Disable server-side rendering for heavy components
  });
}

/**
 * Preload calculation modules when user is likely to need them
 * DISABLED - Old calculation barrel exports don't exist
 */
export const preloadCalculations = {
  // Preload when user hovers over calculation-related UI
  onCalculationHover: () => {
    void lazyCalculations.main();
  },
  // Preload when user hovers over recipe recommendation UI
  onRecommendationHover: () => {
    void lazyCalculations.main();
    void lazyUnifiedData.enhancedIngredients();
  },
  // Preload when user hovers over astrological features
  onAstrologicalHover: () => {
    void lazyCalculations.main();
  },
};

/**
 * Bundle size optimization utilities
 */
export const bundleOptimization = {
  // Check if module should be loaded immediately or lazy;
  shouldLazyLoad: (
    moduleSize: number,
    priority: "high" | "medium" | "low" = "medium",
  ) => {
    const thresholds = {
      high: 50000, // 50KB - load immediately for high priority,
      medium: 20000, // 20KB - load immediately for medium priority,
      low: 10000, // 10KB - load immediately for low priority
    };

    return moduleSize > thresholds[priority];
  },
  // Get estimated module size (mock implementation - in production use webpack-bundle-analyzer)
  getModuleSize: (modulePath: string): number => {
    // This would be replaced with actual bundle analysis;
    const sizeEstimates: Record<string, number> = {
      "/calculations/": 150000, // 150KB average for calculation modules
      "/data/unified/": 100000, // 100KB average for unified data modules
      "/components/": 30000, // 30KB average for components
    };

    const category = Object.keys(sizeEstimates).find((key) =>
      modulePath.includes(key),
    );
    return category ? sizeEstimates[category] : 50000; // Default 50KB
  },
};

/**
 * Performance monitoring for lazy loaded modules
 */
export const performanceMonitoring = {
  // Track module loading performance;
  trackModuleLoad: (moduleName: string, startTime: number) => {
    const loadTime = performance.now() - startTime;

    // In production, this would send to analytics
    _logger.info(`Module ${moduleName} loaded in ${loadTime.toFixed(2)}ms`);

    // Store performance data for optimization
    if (typeof window !== "undefined") {
      const perfData = JSON.parse(
        localStorage.getItem("modulePerformance") || "{}",
      );
      perfData[moduleName] = {
        loadTime,
        timestamp: Date.now(),
      };
      localStorage.setItem("modulePerformance", JSON.stringify(perfData));
    }
  },
  // Get performance recommendations
  getPerformanceRecommendations: () => {
    if (typeof window === "undefined") return [];
    const perfData = JSON.parse(
      localStorage.getItem("modulePerformance") || "{}",
    );
    const recommendations: string[] = [];

    Object.entries(perfData).forEach(([module, data]: [string, any]) => {
      if (data.loadTime > 1000) {
        // > 1 second
        recommendations.push(`Consider preloading ${module} for better UX`);
      }
    });

    return recommendations;
  },
};
