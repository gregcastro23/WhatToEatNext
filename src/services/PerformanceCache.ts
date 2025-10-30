import { log } from '@/services/LoggingService';
// ===== PHASE, 8: INTELLIGENT CACHING SYSTEM =====

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  accessCount: number;
  lastAccessed: number
}

export interface CacheStats {
  totalEntries: number;
  hitCount: number;
  missCount: number;
  hitRate: number;
  memoryUsage: number; // Estimated in bytes
  oldestEntry: number;
  newestEntry: number
}

export interface PerformanceMetrics {
  calculationTime: number;
  cacheHitRate: number;
  memoryUsage: number;
  recommendationCount: number;
  averageResponseTime: number;
  peakMemoryUsage: number
}

/**
 * Advanced caching system with TTL, LRU eviction, and performance monitoring
 * Designed for Phase 8 performance optimization
 */
export class PerformanceCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private maxSize: number;
  private defaultTTL: number;
  private hitCount: number = 0;
  private missCount: number = 0;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(maxSize: number = 1000, defaultTTL: number = 300000) {
    // 5 minutes default TTL
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;

    // Start cleanup interval (every 60 seconds)
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Get item from cache with automatic TTL checking
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.missCount++;
      return null;
    }

    // Check TTL
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.missCount++;
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = now;
    this.hitCount++;

    return entry.data;
  }

  /**
   * Set item in cache with optional custom TTL
   */
  set(key: string, data: T, customTTL?: number): void {
    const now = Date.now();
    const ttl = customTTL || this.defaultTTL;

    // Check if we need to evict items
    if (this.cache.size >= this.maxSize && !this.cache.has(key) {
      this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      ttl,
      accessCount: 1,
      lastAccessed: now
    };

    this.cache.set(key, entry);
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete specific key
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const now = Date.now();
    let memoryUsage = 0;
    let oldestEntry = now;
    let newestEntry = 0;

    for (const [key, entry] of this.cache.entries() {
      // Estimate memory usage (rough calculation)
      memoryUsage += (key || []).length * 2; // String characters are 2 bytes each
      memoryUsage += this.estimateObjectSize(entry.data);
      memoryUsage += 64; // Overhead for entry metadata

      if (entry.timestamp < oldestEntry) oldestEntry = entry.timestamp;
      if (entry.timestamp > newestEntry) newestEntry = entry.timestamp;
    }

    const totalRequests = this.hitCount + this.missCount;
    const hitRate = totalRequests > 0 ? this.hitCount / totalRequests : 0;

    return {
      totalEntries: this.cache.size,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate,
      memoryUsage,
      oldestEntry: oldestEntry === now ? 0 : oldestEntry,
      newestEntry
    };
  }

  /**
   * Evict least recently used item
   */
  private evictLRU(): void {
    let lruKey: string | null = null;
    let lruTime = Date.now();
    for (const [key, entry] of this.cache.entries() {
      if (entry.lastAccessed < lruTime) {
        lruTime = entry.lastAccessed;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries() {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    (keysToDelete || []).forEach(key => this.cache.delete(key));
  }

  /**
   * Estimate object size in bytes (rough calculation)
   */
  private estimateObjectSize(obj: unknown): number {
    if (obj === null || obj === undefined) return 0;
    if (typeof obj === 'string') return (obj || []).length * 2;
    if (typeof obj === 'number') return 8;
    if (typeof obj === 'boolean') return 4;

    if (Array.isArray(obj) {
      return obj.reduce((size, item) => size + this.estimateObjectSize(item), 0);
    }

    if (typeof obj === 'object') {
      let size = 0;
      for (const [key, value] of Object.entries(obj) {
        size += (key || []).length * 2; // Key size
        size += this.estimateObjectSize(value); // Value size
      }
      return size;
    }

    return 64; // Default size for unknown types
  }

  /**
   * Destroy cache and cleanup intervals
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
}

/**
 * Performance monitoring utility
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private currentMetrics: Partial<PerformanceMetrics> = {};
  private maxHistorySize: number = 100;

  /**
   * Start timing an operation
   */
  startTiming(operation: string): () => void {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      this.recordMetric('calculationTime', duration);

      return duration;
    };
  }

  /**
   * Record a metric value
   */
  recordMetric(metric: keyof PerformanceMetrics, value: number): void {
    if (this.currentMetrics) {
      this.currentMetrics[metric] = value;
    }
  }

  /**
   * Snapshot current metrics
   */
  snapshot(): PerformanceMetrics {
    const snapshot: PerformanceMetrics = {
      calculationTime: this.currentMetrics.calculationTime || 0,
      cacheHitRate: this.currentMetrics.cacheHitRate || 0,
      memoryUsage: this.currentMetrics.memoryUsage || 0,
      recommendationCount: this.currentMetrics.recommendationCount || 0,
      averageResponseTime: this.currentMetrics.averageResponseTime || 0,
      peakMemoryUsage: this.currentMetrics.peakMemoryUsage || 0
    };

    this.metrics.push(snapshot);

    // Keep only recent metrics
    if (this.metrics || [].length > this.maxHistorySize) {
      this.metrics.shift();
    }

    return snapshot;
  }

  /**
   * Get performance statistics
   */
  getStats(): {
    current: PerformanceMetrics;
    average: PerformanceMetrics;
    peak: PerformanceMetrics;
    history: PerformanceMetrics[];
  } {
    if (this.metrics.length === 0) {
      const empty: PerformanceMetrics = {
        calculationTime: 0,
        cacheHitRate: 0,
        memoryUsage: 0,
        recommendationCount: 0,
        averageResponseTime: 0,
        peakMemoryUsage: 0
      };
      return { current: empty, average: empty, peak: empty, history: [] };
    }

    const current = this.metrics[(this.metrics || []).length - 1];

    // Calculate averages
    // Pattern KK-1: Safe arithmetic with type validation
    const metricsLength = this.metrics.length || 1;
    const average: PerformanceMetrics = {
      calculationTime: (this.metrics.reduce((sum, m) => {
          const numericSum = typeof sum === 'number' ? sum : 0;
          const numericValue = typeof m.calculationTime === 'number' ? m.calculationTime : 0;
          return numericSum + numericValue;
        }, 0) || 0) / metricsLength,
      cacheHitRate: (this.metrics.reduce((sum, m) => {
          const numericSum = typeof sum === 'number' ? sum : 0;
          const numericValue = typeof m.cacheHitRate === 'number' ? m.cacheHitRate : 0;
          return numericSum + numericValue;
        }, 0) || 0) / metricsLength,
      memoryUsage: (this.metrics.reduce((sum, m) => {
          const numericSum = typeof sum === 'number' ? sum : 0;
          const numericValue = typeof m.memoryUsage === 'number' ? m.memoryUsage : 0;
          return numericSum + numericValue;
        }, 0) || 0) / metricsLength,
      recommendationCount: (this.metrics.reduce((sum, m) => {
          const numericSum = typeof sum === 'number' ? sum : 0;
          const numericValue =
            typeof m.recommendationCount === 'number' ? m.recommendationCount : 0;
          return numericSum + numericValue;
        }, 0) || 0) / metricsLength,
      averageResponseTime: (this.metrics.reduce((sum, m) => {
          const numericSum = typeof sum === 'number' ? sum : 0;
          const numericValue =
            typeof m.averageResponseTime === 'number' ? m.averageResponseTime : 0;
          return numericSum + numericValue;
        }, 0) || 0) / metricsLength,
      peakMemoryUsage: (this.metrics.reduce((sum, m) => {
          const numericSum = typeof sum === 'number' ? sum : 0;
          const numericValue = typeof m.peakMemoryUsage === 'number' ? m.peakMemoryUsage : 0;
          return numericSum + numericValue;
        }, 0) || 0) / metricsLength
    };

    // Calculate peaks
    const metricsArray = this.metrics.length > 0 ? this.metrics : [];
    const peak: PerformanceMetrics = {
      calculationTime:
        metricsArray.length > 0 ? Math.max(...metricsArray.map(m => m.calculationTime)) : 0,
      cacheHitRate: metricsArray.length > 0 ? Math.max(...metricsArray.map(m => m.cacheHitRate)) : 0,
      memoryUsage: metricsArray.length > 0 ? Math.max(...metricsArray.map(m => m.memoryUsage)) : 0,
      recommendationCount: metricsArray.length > 0 ? Math.max(...metricsArray.map(m => m.recommendationCount)) : 0,
      averageResponseTime: metricsArray.length > 0 ? Math.max(...metricsArray.map(m => m.averageResponseTime)) : 0,
      peakMemoryUsage: metricsArray.length > 0 ? Math.max(...metricsArray.map(m => m.peakMemoryUsage)) : 0
    };

    return { current, average, peak, history: [...this.metrics] };
  }

  /**
   * Clear metrics history
   */
  clear(): void {
    this.metrics = [];
    this.currentMetrics = {};
  }
}

// ===== GLOBAL CACHE INSTANCES =====

export const flavorCompatibilityCache = new PerformanceCache<unknown>(2000, 600000); // 10 minutes TTL
export const astrologicalProfileCache = new PerformanceCache<unknown>(500, 300000); // 5 minutes TTL
export const ingredientProfileCache = new PerformanceCache<unknown>(1500, 1800000); // 30 minutes TTL
export const performanceMonitor = new PerformanceMonitor();

// ===== CACHE WARMING FUNCTIONS =====

/**
 * Warm up caches with common calculations
 */
export async function warmupCaches(): Promise<void> {
  log.info('🔥 Warming up caches for optimal performance...');
  // This will be implemented with actual data warming
  // For now, just log the warming process

  log.info('✅ Cache warmup complete');
}

/**
 * Get combined cache statistics
 */
export function getAllCacheStats(): {
  flavorCompatibility: CacheStats;
  astrologicalProfile: CacheStats;
  ingredientProfile: CacheStats;
  performance: ReturnType<PerformanceMonitor['getStats']>;
} {
  return {
    flavorCompatibility: flavorCompatibilityCache.getStats(),
    astrologicalProfile: astrologicalProfileCache.getStats(),
    ingredientProfile: ingredientProfileCache.getStats(),
    performance: performanceMonitor.getStats()
  };
}

/**
 * Clear all caches
 */
export function clearAllCaches(): void {
  flavorCompatibilityCache.clear();
  astrologicalProfileCache.clear();
  ingredientProfileCache.clear();
  performanceMonitor.clear();
  log.info('🧹 All caches cleared');
}