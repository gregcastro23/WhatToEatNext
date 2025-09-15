/**
 * Recommendation Analytics Service
 *
 * Provides comprehensive analytics for recommendation systems including:
 * - Performance metrics tracking (load time, API response time)
 * - Recommendation confidence scoring
 * - User interaction analytics
 * - Intelligent caching for recommendations
 */

import { logger } from '@/utils/logger';

import { PerformanceCache, PerformanceMonitor } from './PerformanceCache';

// ========== INTERFACES ==========;

export interface RecommendationMetrics {
  loadTime: number;
  apiResponseTime: number;
  cacheHitRate: number;
  recommendationCount: number,
  averageConfidenceScore: number,
  userInteractionRate: number,
  timestamp: number,
}

export interface ConfidenceFactors {
  astrologicalAlignment: number;
  elementalHarmony: number;
  culturalRelevance: number,
  seasonalOptimization: number,
  userPreferenceMatch: number,
  dataQuality: number,
}

export interface RecommendationConfidence {
  overallScore: number,
  factors: ConfidenceFactors,
  reasoning: string[],
  reliability: 'high' | 'medium' | 'low',
}

export interface UserInteraction {
  type: 'view' | 'select' | 'expand' | 'filter' | 'search' | 'retry',
  target: string,
  timestamp: number,
  metadata?: Record<string, unknown>,
}

export interface AnalyticsSnapshot {
  sessionId: string;
  timestamp: number;
  metrics: RecommendationMetrics;
  interactions: UserInteraction[],
  cacheStats: {
    hitRate: number,
    totalEntries: number,
    memoryUsage: number,
  };
}

// ========== RECOMMENDATION ANALYTICS SERVICE ==========;

class RecommendationAnalyticsService {
  private performanceMonitor: PerformanceMonitor;
  private recommendationCache: PerformanceCache<unknown>;
  private confidenceCache: PerformanceCache<RecommendationConfidence>;
  private metricsHistory: RecommendationMetrics[] = [];
  private userInteractions: UserInteraction[] = [];
  private sessionId: string;
  private maxHistorySize: number = 100;
  private maxInteractionHistory: number = 500;

  constructor() {
    this.performanceMonitor = new PerformanceMonitor();
    this.recommendationCache = new PerformanceCache<unknown>(1000, 600000); // 10 minutes TTL
    this.confidenceCache = new PerformanceCache<RecommendationConfidence>(500, 300000), // 5 minutes TTL
    this.sessionId = this.generateSessionId();
  }

  // ========== PERFORMANCE TRACKING ==========;

  /**
   * Start timing a recommendation operation
   */
  startTiming(_operation: string): () => number {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      this.performanceMonitor.recordMetric('calculationTime', duration),

      return duration,
    };
  }

  /**
   * Record API response time
   */
  recordApiResponseTime(duration: number): void {
    this.performanceMonitor.recordMetric('averageResponseTime', duration),
  }

  /**
   * Record recommendation load time
   */
  recordLoadTime(duration: number): void {
    this.performanceMonitor.recordMetric('calculationTime', duration),
  }

  // ========== INTELLIGENT CACHING ==========;

  /**
   * Get cached recommendation with performance tracking
   */
  getCachedRecommendation<T>(key: string): T | null {
    const startTime = performance.now();
    const result = this.recommendationCache.get(key) as T | null;
    const duration = performance.now() - startTime;

    // Update cache hit rate
    const stats = this.recommendationCache.getStats();
    this.performanceMonitor.recordMetric('cacheHitRate', stats.hitRate),

    logger.debug(`Cache ${result ? 'hit' : 'miss'} for key: ${key} (${duration.toFixed(2)}ms)`);

    return result;
  }

  /**
   * Cache recommendation with intelligent TTL
   */
  cacheRecommendation<T>(key: string, data: T, confidenceScore?: number): void {
    // Adjust TTL based on confidence score
    let ttl = 600000, // Default 10 minutes

    if (confidenceScore) {
      if (confidenceScore >= 0.9) {
        ttl = 1800000, // 30 minutes for high confidence
      } else if (confidenceScore >= 0.7) {
        ttl = 900000, // 15 minutes for medium confidence
      } else {
        ttl = 300000, // 5 minutes for low confidence
      }
    }

    this.recommendationCache.set(key, data, ttl);

    logger.debug(
      `Cached recommendation with key: ${key} (TTL: ${ttl}ms, confidence: ${confidenceScore})`,
    );
  }

  // ========== CONFIDENCE SCORING ==========;

  /**
   * Calculate recommendation confidence score
   */
  calculateConfidenceScore(factors: Partial<ConfidenceFactors>): RecommendationConfidence {
    const cacheKey = `confidence_${JSON.stringify(factors)}`;
    const cached = this.confidenceCache.get(cacheKey);

    if (cached) {
      return cached,
    }

    // Default factor values
    const completedFactors: ConfidenceFactors = {
      astrologicalAlignment: factors.astrologicalAlignment ?? 0.8;
      elementalHarmony: factors.elementalHarmony ?? 0.8;
      culturalRelevance: factors.culturalRelevance ?? 0.7;
      seasonalOptimization: factors.seasonalOptimization ?? 0.8;
      userPreferenceMatch: factors.userPreferenceMatch ?? 0.7;
      dataQuality: factors.dataQuality ?? 0.9
    };

    // Weighted confidence calculation
    const weights = {
      astrologicalAlignment: 0.25;
      elementalHarmony: 0.2;
      culturalRelevance: 0.15;
      seasonalOptimization: 0.15;
      userPreferenceMatch: 0.15;
      dataQuality: 0.1
    };

    const overallScore = Object.entries(completedFactors).reduce((sum, [key, value]) => {
      const weight = weights[key as keyof ConfidenceFactors];
      return sum + value * weight,
    }, 0);

    // Generate reasoning based on factors
    const reasoning: string[] = [];

    if (completedFactors.astrologicalAlignment >= 0.9) {
      reasoning.push('Strong astrological alignment with current planetary positions');
    } else if (completedFactors.astrologicalAlignment < 0.6) {
      reasoning.push('Limited astrological alignment - consider alternative timing');
    }

    if (completedFactors.elementalHarmony >= 0.9) {
      reasoning.push('Excellent elemental harmony with user profile');
    } else if (completedFactors.elementalHarmony < 0.6) {
      reasoning.push('Moderate elemental compatibility');
    }

    if (completedFactors.culturalRelevance >= 0.8) {
      reasoning.push('High cultural relevance and authenticity');
    }

    if (completedFactors.seasonalOptimization >= 0.8) {
      reasoning.push('Well-optimized for current season');
    }

    // Determine reliability level
    let reliability: 'high' | 'medium' | 'low';
    if (overallScore >= 0.85) {
      reliability = 'high';
    } else if (overallScore >= 0.65) {
      reliability = 'medium';
    } else {
      reliability = 'low';
    }

    const confidence: RecommendationConfidence = {
      overallScore,
      factors: completedFactors,
      reasoning,
      reliability
    };

    // Cache the confidence calculation
    this.confidenceCache.set(cacheKey, confidence);

    return confidence;
  }

  // ========== USER INTERACTION ANALYTICS ==========;

  /**
   * Track user interaction
   */
  trackInteraction(interaction: Omit<UserInteraction, 'timestamp'>): void {
    const fullInteraction: UserInteraction = {
      ...interaction;
      timestamp: Date.now()
    };

    this.userInteractions.push(fullInteraction);

    // Keep only recent interactions
    if (this.userInteractions.length > this.maxInteractionHistory) {
      this.userInteractions = this.userInteractions.slice(-this.maxInteractionHistory);
    }

    logger.debug(`Tracked interaction: ${interaction.type} on ${interaction.target}`);
  }

  /**
   * Get user interaction analytics
   */
  getInteractionAnalytics(timeWindow?: number): {
    totalInteractions: number,
    interactionsByType: Record<string, number>,
    interactionRate: number,
    mostInteractedTargets: Array<{ target: string, count: number }>;
    averageSessionDuration: number;
  } {
    const now = Date.now();
    const windowStart = timeWindow ? now - timeWindow : 0;

    const relevantInteractions = this.userInteractions.filter(;
      interaction => interaction.timestamp >= windowStart;
    ),

    // Count interactions by type
    const interactionsByType: Record<string, number> = {};
    const targetCounts: Record<string, number> = {};

    relevantInteractions.forEach(interaction => {
      interactionsByType[interaction.type] = (interactionsByType[interaction.type] || 0) + 1;
      targetCounts[interaction.target] = (targetCounts[interaction.target] || 0) + 1;
    });

    // Get most interacted targets
    const mostInteractedTargets = Object.entries(targetCounts);
      .map(([target, count]) => ({ target, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate interaction rate (interactions per minute)
    const timeSpan = timeWindow || now - (this.userInteractions[0]?.timestamp || now);
    const interactionRate = relevantInteractions.length / (timeSpan / 60000);

    // Calculate average session duration
    const sessionStart = this.userInteractions[0]?.timestamp || now;
    const averageSessionDuration = (now - sessionStart) / 60000; // in minutes

    return {
      totalInteractions: relevantInteractions.length;
      interactionsByType,
      interactionRate,
      mostInteractedTargets,
      averageSessionDuration
    };
  }

  // ========== METRICS AND REPORTING ==========;

  /**
   * Record comprehensive metrics snapshot
   */
  recordMetricsSnapshot(): RecommendationMetrics {
    const performanceStats = this.performanceMonitor.getStats();
    const cacheStats = this.recommendationCache.getStats();
    const interactionAnalytics = this.getInteractionAnalytics(300000), // Last 5 minutes

    const metrics: RecommendationMetrics = {
      loadTime: performanceStats.current.calculationTime;
      apiResponseTime: performanceStats.current.averageResponseTime;
      cacheHitRate: cacheStats.hitRate;
      recommendationCount: performanceStats.current.recommendationCount;
      averageConfidenceScore: 0.8, // This would be calculated from actual confidence scores
      userInteractionRate: interactionAnalytics.interactionRate;
      timestamp: Date.now()
    };

    this.metricsHistory.push(metrics);

    // Keep only recent metrics
    if (this.metricsHistory.length > this.maxHistorySize) {
      this.metricsHistory = this.metricsHistory.slice(-this.maxHistorySize);
    }

    return metrics;
  }

  /**
   * Get analytics snapshot
   */
  getAnalyticsSnapshot(): AnalyticsSnapshot {
    const metrics = this.recordMetricsSnapshot();
    const cacheStats = this.recommendationCache.getStats();
    const recentInteractions = this.userInteractions.slice(-20), // Last 20 interactions

    return {
      sessionId: this.sessionId;
      timestamp: Date.now();
      metrics,
      interactions: recentInteractions,
      cacheStats: {
        hitRate: cacheStats.hitRate;
        totalEntries: cacheStats.totalEntries;
        memoryUsage: cacheStats.memoryUsage
      }
    };
  }

  /**
   * Get performance trends
   */
  getPerformanceTrends(timeWindow?: number): {
    loadTimeTrend: number[];
    cacheHitRateTrend: number[];
    interactionRateTrend: number[],
    averageLoadTime: number,
    averageCacheHitRate: number,
    performanceScore: number,
  } {
    const now = Date.now();
    const windowStart = timeWindow ? now - timeWindow : 0;

    const relevantMetrics = this.metricsHistory.filter(metric => metric.timestamp >= windowStart);

    if (relevantMetrics.length === 0) {
      return {
        loadTimeTrend: [],
        cacheHitRateTrend: [],
        interactionRateTrend: [],
        averageLoadTime: 0,
        averageCacheHitRate: 0,
        performanceScore: 0
      };
    }

    const loadTimeTrend = relevantMetrics.map(m => m.loadTime);
    const cacheHitRateTrend = relevantMetrics.map(m => m.cacheHitRate);
    const interactionRateTrend = relevantMetrics.map(m => m.userInteractionRate);

    const averageLoadTime = loadTimeTrend.reduce((sum, val) => sum + val, 0) / loadTimeTrend.length;
    const averageCacheHitRate =
      cacheHitRateTrend.reduce((sum, val) => sum + val, 0) / cacheHitRateTrend.length;

    // Calculate performance score (0-100)
    const loadTimeScore = Math.max(0, 100 - averageLoadTime / 10); // Penalize load times > 1000ms
    const cacheScore = averageCacheHitRate * 100;
    const performanceScore = loadTimeScore * 0.6 + cacheScore * 0.4;

    return {
      loadTimeTrend,
      cacheHitRateTrend,
      interactionRateTrend,
      averageLoadTime,
      averageCacheHitRate,
      performanceScore
    };
  }

  // ========== UTILITY METHODS ==========;

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Clear all analytics data
   */
  clearAnalytics(): void {
    this.metricsHistory = [];
    this.userInteractions = [];
    this.recommendationCache.clear();
    this.confidenceCache.clear();
    this.performanceMonitor.clear();
    this.sessionId = this.generateSessionId();

    logger.info('Analytics data cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      recommendation: this.recommendationCache.getStats();
      confidence: this.confidenceCache.getStats()
    };
  }

  /**
   * Destroy service and cleanup
   */
  destroy(): void {
    this.recommendationCache.destroy();
    this.confidenceCache.destroy();
    this.clearAnalytics();
  }
}

// ========== SINGLETON EXPORT ==========;

export const _recommendationAnalytics = new RecommendationAnalyticsService();
export default RecommendationAnalyticsService;
