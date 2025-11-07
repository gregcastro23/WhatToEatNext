/**
 * useRecommendationAnalytics Hook
 *
 * React hook for integrating recommendation analytics into components
 * Provides performance tracking, caching, and user interaction analytics
 */

import type {
  AnalyticsSnapshot,
  RecommendationConfidence,
  RecommendationMetrics,
} from "@/services/RecommendationAnalyticsService";
import { _recommendationAnalytics } from "@/services/RecommendationAnalyticsService";
import { logger } from "@/utils/logger";
import { useCallback, useEffect, useRef, useState } from "react";

// ========== INTERFACES ==========

export interface UseRecommendationAnalyticsOptions {
  enablePerformanceTracking?: boolean;
  enableCaching?: boolean;
  enableInteractionTracking?: boolean;
  metricsUpdateInterval?: number;
}

export interface RecommendationAnalyticsState {
  metrics: RecommendationMetrics | null;
  cacheStats: {
    hitRate: number;
    totalEntries: number;
    memoryUsage: number;
  };
  performanceTrends: {
    averageLoadTime: number;
    averageCacheHitRate: number;
    performanceScore: number;
  };
  isLoading: boolean;
  error: string | null;
}

export interface RecommendationAnalyticsActions {
  startTiming: (operation: string) => () => number;
  recordApiResponse: (duration: number) => void;
  recordLoadTime: (duration: number) => void;
  getCachedRecommendation: <T>(key: string) => T | null;
  cacheRecommendation: <T>(
    key: string,
    data: T,
    confidenceScore?: number,
  ) => void;
  calculateConfidence: (factors: unknown) => RecommendationConfidence;
  trackInteraction: (
    type: string,
    target: string,
    metadata?: Record<string, unknown>,
  ) => void;
  getAnalyticsSnapshot: () => AnalyticsSnapshot;
  clearAnalytics: () => void;
}

// ========== HOOK IMPLEMENTATION ==========

export function useRecommendationAnalytics(
  options: UseRecommendationAnalyticsOptions = {},
): [RecommendationAnalyticsState, RecommendationAnalyticsActions] {
  const {
    enablePerformanceTracking = true,
    enableCaching = true,
    enableInteractionTracking = true,
    metricsUpdateInterval = 5000, // 5 seconds
  } = options;

  // ========== STATE ==========

  const [state, setState] = useState<RecommendationAnalyticsState>({
    metrics: null,
    cacheStats: {
      hitRate: 0,
      totalEntries: 0,
      memoryUsage: 0,
    },
    performanceTrends: {
      averageLoadTime: 0,
      averageCacheHitRate: 0,
      performanceScore: 0,
    },
    isLoading: false,
    error: null,
  });

  const metricsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // ========== EFFECTS ==========

  useEffect(() => {
    if (enablePerformanceTracking) {
      // Start periodic metrics collection
      metricsIntervalRef.current = setInterval(() => {
        if (mountedRef.current) {
          void updateMetrics();
        }
      }, metricsUpdateInterval);

      // Initial metrics update
      void updateMetrics();
    }

    return () => {
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current);
      }
      mountedRef.current = false;
    };
  }, [enablePerformanceTracking, metricsUpdateInterval]);

  // ========== HELPER FUNCTIONS ==========

  const updateMetrics = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const metrics = _recommendationAnalytics.recordMetricsSnapshot();
      const cacheStats = _recommendationAnalytics.getCacheStats();
      const performanceTrends =
        _recommendationAnalytics.getPerformanceTrends(300000); // Last 5 minutes

      if (mountedRef.current) {
        setState((prev) => ({
          ...prev,
          metrics,
          cacheStats: {
            hitRate: cacheStats.recommendation.hitRate,
            totalEntries: cacheStats.recommendation.totalEntries,
            memoryUsage: cacheStats.recommendation.memoryUsage,
          },
          performanceTrends: {
            averageLoadTime: performanceTrends.averageLoadTime,
            averageCacheHitRate: performanceTrends.averageCacheHitRate,
            performanceScore: performanceTrends.performanceScore,
          },
          isLoading: false,
        }));
      }
    } catch (error) {
      logger.error(
        "Failed to update recommendation analytics metrics: ",
        error,
      );
      if (mountedRef.current) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "Unknown error",
          isLoading: false,
        }));
      }
    }
  }, []);

  // ========== ACTIONS ==========

  const startTiming = useCallback(
    (operation: string) => {
      if (!enablePerformanceTracking) {
        return () => 0;
      }

      return _recommendationAnalytics.startTiming(operation);
    },
    [enablePerformanceTracking],
  );

  const recordApiResponse = useCallback(
    (duration: number) => {
      if (enablePerformanceTracking) {
        _recommendationAnalytics.recordApiResponseTime(duration);
      }
    },
    [enablePerformanceTracking],
  );

  const recordLoadTime = useCallback(
    (duration: number) => {
      if (enablePerformanceTracking) {
        _recommendationAnalytics.recordLoadTime(duration);
      }
    },
    [enablePerformanceTracking],
  );

  const getCachedRecommendation = useCallback(
    <T>(key: string): T | null => {
      if (!enableCaching) {
        return null;
      }

      return _recommendationAnalytics.getCachedRecommendation<T>(key);
    },
    [enableCaching],
  );

  const cacheRecommendation = useCallback(
    <T>(key: string, data: T, confidenceScore?: number) => {
      if (enableCaching) {
        _recommendationAnalytics.cacheRecommendation(
          key,
          data,
          confidenceScore,
        );
      }
    },
    [enableCaching],
  );

  const calculateConfidence = useCallback(
    (factors: unknown): RecommendationConfidence =>
      _recommendationAnalytics.calculateConfidenceScore(factors as any),
    [],
  );

  const trackInteraction = useCallback(
    (type: string, target: string, metadata?: Record<string, unknown>) => {
      if (enableInteractionTracking) {
        _recommendationAnalytics.trackInteraction({
          type: type as any,
          target,
          metadata,
        });
      }
    },
    [enableInteractionTracking],
  );

  const getAnalyticsSnapshot = useCallback(
    (): AnalyticsSnapshot => _recommendationAnalytics.getAnalyticsSnapshot(),
    [],
  );

  const clearAnalytics = useCallback(() => {
    _recommendationAnalytics.clearAnalytics();
    void updateMetrics();
  }, [updateMetrics]);

  // ========== RETURN ==========

  const actions: RecommendationAnalyticsActions = {
    startTiming,
    recordApiResponse,
    recordLoadTime,
    getCachedRecommendation,
    cacheRecommendation,
    calculateConfidence,
    trackInteraction,
    getAnalyticsSnapshot,
    clearAnalytics,
  };

  return [state, actions];
}

// ========== UTILITY HOOKS ==========

/**
 * Hook for tracking component performance
 */
export function usePerformanceTracking(componentName: string) {
  const [, { startTiming, recordLoadTime }] = useRecommendationAnalytics({
    enablePerformanceTracking: true,
    enableCaching: false,
    enableInteractionTracking: false,
  });

  const trackRender = useCallback(
    () => startTiming(`${componentName}_render`),
    [componentName, startTiming],
  );

  const trackOperation = useCallback(
    (operationName: string) => startTiming(`${componentName}_${operationName}`),
    [componentName, startTiming],
  );

  return {
    trackRender,
    trackOperation,
    recordLoadTime,
  };
}

/**
 * Hook for caching recommendations
 */
export function useRecommendationCache<T>() {
  const [, { getCachedRecommendation, cacheRecommendation }] =
    useRecommendationAnalytics({
      enablePerformanceTracking: false,
      enableCaching: true,
      enableInteractionTracking: false,
    });

  const getCached = useCallback(
    (key: string): T | null => getCachedRecommendation<T>(key),
    [getCachedRecommendation],
  );

  const setCached = useCallback(
    (key: string, data: T, confidenceScore?: number) => {
      cacheRecommendation(key, data, confidenceScore);
    },
    [cacheRecommendation],
  );

  return {
    getCached,
    setCached,
  };
}

/**
 * Hook for tracking user interactions
 */
export function useInteractionTracking() {
  const [, { trackInteraction }] = useRecommendationAnalytics({
    enablePerformanceTracking: false,
    enableCaching: false,
    enableInteractionTracking: true,
  });

  const trackClick = useCallback(
    (target: string, metadata?: Record<string, unknown>) => {
      trackInteraction("select", target, metadata);
    },
    [trackInteraction],
  );

  const trackView = useCallback(
    (target: string, metadata?: Record<string, unknown>) => {
      trackInteraction("view", target, metadata);
    },
    [trackInteraction],
  );

  const trackExpand = useCallback(
    (target: string, metadata?: Record<string, unknown>) => {
      trackInteraction("expand", target, metadata);
    },
    [trackInteraction],
  );

  const trackSearch = useCallback(
    (query: string, metadata?: Record<string, unknown>) => {
      trackInteraction("search", query, metadata);
    },
    [trackInteraction],
  );

  const trackFilter = useCallback(
    (filterType: string, metadata?: Record<string, unknown>) => {
      trackInteraction("filter", filterType, metadata);
    },
    [trackInteraction],
  );

  return {
    trackClick,
    trackView,
    trackExpand,
    trackSearch,
    trackFilter,
  };
}
