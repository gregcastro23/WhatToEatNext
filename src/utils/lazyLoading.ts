import dynamic from "next/dynamic";
import React, { type ComponentType } from "react";
import { _logger } from "@/lib/logger";

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
  // Use the main calculations module
  main: (): Promise<typeof import("@/calculations")> => import("@/calculations"),
};

/**
 * Lazy load unified data modules with optimized loading
 */
export const lazyUnifiedData = {
  // Enhanced ingredients system - loaded on demand
  enhancedIngredients: (): Promise<typeof import("@/data/unified/enhancedIngredients")> =>
    import("@/data/unified/enhancedIngredients"),

  // Cuisine integrations - loaded on demand
  cuisineIntegrations: (): Promise<typeof import("@/data/unified/cuisineIntegrations")> =>
    import("@/data/unified/cuisineIntegrations"),

  // Flavor engine - loaded on demand
  flavorEngine: (): Promise<typeof import("@/data/unified/unifiedFlavorEngine")> =>
    import("@/data/unified/unifiedFlavorEngine"),

  // Recipe building system - loaded on demand
  recipeBuilding: (): Promise<typeof import("@/data/unified/recipeBuilding")> =>
    import("@/data/unified/recipeBuilding"),

  // Alchemical calculations data - loaded on demand
  alchemicalCalculations: (): Promise<typeof import("@/data/unified/alchemicalCalculations")> =>
    import("@/data/unified/alchemicalCalculations"),
};

/**
 * Create a lazy-loaded component with loading fallback
 */
export function createLazyComponent<P = Record<string, unknown>>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  loadingComponent?: ComponentType,
): ComponentType<P> {
  return dynamic(importFunc as unknown as Parameters<typeof dynamic>[0], {
    loading: loadingComponent ? (): React.JSX.Element => React.createElement(loadingComponent) : undefined,
    ssr: false, // Disable server-side rendering for heavy components
  }) as unknown as ComponentType<P>;
}

/**
 * Preload calculation modules when user is likely to need them
 */
export const preloadCalculations = {
  // Preload when user hovers over calculation-related UI
  onCalculationHover: (): void => {
    lazyCalculations.main().catch(() => {});
  },
  // Preload when user hovers over recipe recommendation UI
  onRecommendationHover: (): void => {
    lazyCalculations.main().catch(() => {});
    lazyUnifiedData.enhancedIngredients().catch(() => {});
  },
  // Preload when user hovers over astrological features
  onAstrologicalHover: (): void => {
    lazyCalculations.main().catch(() => {});
  },
};

/**
 * Bundle size optimization utilities
 */
export const bundleOptimization = {
  // Check if module should be loaded immediately or lazy
  shouldLazyLoad: (
    moduleSize: number,
    priority: "high" | "medium" | "low" = "medium",
  ): boolean => {
    const thresholds = {
      high: 50000, // 50KB - load immediately for high priority
      medium: 20000, // 20KB - load immediately for medium priority
      low: 10000, // 10KB - load immediately for low priority
    };

    return moduleSize > thresholds[priority];
  },
  // Get estimated module size (mock implementation - in production use webpack-bundle-analyzer)
  getModuleSize: (modulePath: string): number => {
    const sizeEstimates: Record<string, number> = {
      "/calculations/": 150000, // 150KB average for calculation modules
      "/data/unified/": 100000, // 100KB average for unified data modules
      "/components/": 30000, // 30KB average for components
    };

    const category = Object.keys(sizeEstimates).find((key) =>
      modulePath.includes(key),
    );
    return category ? (sizeEstimates[category] ?? 50000) : 50000;
  },
};

interface ModulePerfRecord {
  loadTime: number;
  timestamp: number;
}

/**
 * Performance monitoring for lazy loaded modules
 */
export const performanceMonitoring = {
  // Track module loading performance
  trackModuleLoad: (moduleName: string, startTime: number): void => {
    const loadTime = performance.now() - startTime;

    _logger.info(`Module ${moduleName} loaded in ${loadTime.toFixed(2)}ms`);

    // Store performance data for optimization
    if (typeof window !== "undefined") {
      const perfData = (JSON.parse(
        localStorage.getItem("modulePerformance") ?? "{}",
      ) ?? {}) as Record<string, ModulePerfRecord>;
      perfData[moduleName] = {
        loadTime,
        timestamp: Date.now(),
      };
      localStorage.setItem("modulePerformance", JSON.stringify(perfData));
    }
  },
  // Get performance recommendations
  getPerformanceRecommendations: (): string[] => {
    if (typeof window === "undefined") return [];
    const perfData = (JSON.parse(
      localStorage.getItem("modulePerformance") ?? "{}",
    ) ?? {}) as Record<string, ModulePerfRecord>;
    const recommendations: string[] = [];

    Object.entries(perfData).forEach(([module, data]) => {
      if (data.loadTime > 1000) {
        // > 1 second
        recommendations.push(`Consider preloading ${module} for better UX`);
      }
    });

    return recommendations;
  },
};
