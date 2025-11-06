/**
 * Recipe Computation Cache System
 *
 * Efficient caching system for recipe property calculations to improve performance
 * and reduce redundant computations in the hierarchical culinary system.
 */

import type { RecipeComputedProperties } from '@/types/hierarchy';
import type { RecipeComputationCache } from '@/types/recipe/enhancedRecipe';

interface CacheConfig {
  /** Maximum cache size */
  maxSize: number;

  /** Cache TTL in milliseconds */
  ttlMs: number;

  /** Cache key prefix */
  prefix: string;
}

class RecipeComputationCacheManager {
  private cache = new Map<string, RecipeComputationCache>();
  private config: CacheConfig;
  private accessOrder: string[] = [];

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 1000,
      ttlMs: 30 * 60 * 1000, // 30 minutes
      prefix: 'recipe_computation',
      ...config
    };

    // Start cleanup interval
    setInterval(() => this.cleanup(), 5 * 60 * 1000); // Clean every 5 minutes
  }

  /**
   * Generate cache key from recipe ID and planetary positions
   */
  generateCacheKey(recipeId: string, planetaryPositions: { [planet: string]: string }): string {
    // Create a deterministic hash of planetary positions
    const positionsString = Object.entries(planetaryPositions);
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([planet, sign]) => `${planet}:${sign}`)
      .join('|');

    const positionsHash = this.hashString(positionsString);
    return `${this.config.prefix}:${recipeId}:${positionsHash}`;
  }

  /**
   * Get cached computation result
   */
  get(cacheKey: string): RecipeComputedProperties | null {
    const entry = this.cache.get(cacheKey);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() > entry.expiresAt.getTime()) {
      this.cache.delete(cacheKey);
      this.removeFromAccessOrder(cacheKey);
      return null;
    }

    // Update access order for LRU
    this.updateAccessOrder(cacheKey);

    return entry.computedProperties;
  }

  /**
   * Set cached computation result
   */
  set()
    cacheKey: string,
    computedProperties: RecipeComputedProperties,
    computationTimeMs: number,
    planetaryPositions: { [planet: string]: string }
  ): void {
    // Create cache entry
    const entry: RecipeComputationCache = {
      cacheKey,
      computedProperties,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.config.ttlMs),
      computationTimeMs,
      planetaryPositionsHash: this.generatePlanetaryPositionsHash(planetaryPositions)
    };

    // Check if we need to evict entries
    if (this.cache.size >= this.config.maxSize) {
      this.evictLeastRecentlyUsed();
    }

    // Store in cache
    this.cache.set(cacheKey, entry);
    this.updateAccessOrder(cacheKey);
  }

  /**
   * Check if cache key exists and is valid
   */
  has(cacheKey: string): boolean {
    const entry = this.cache.get(cacheKey);
    if (!entry) return false;

    // Check expiration
    if (Date.now() > entry.expiresAt.getTime()) {
      this.cache.delete(cacheKey);
      this.removeFromAccessOrder(cacheKey);
      return false;
    }

    return true;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    averageComputationTime: number;
    oldestEntry: Date | null;
    newestEntry: Date | null;
  } {
    const entries = Array.from(this.cache.values());

    if (entries.length === 0) {
      return {
        size: 0,
        maxSize: this.config.maxSize,
        hitRate: 0,
        averageComputationTime: 0,
        oldestEntry: null,
        newestEntry: null
      };
    }

    const totalComputationTime = entries.reduce((sum, entry) => sum + entry.computationTimeMs, 0);
    const averageComputationTime = totalComputationTime / entries.length;

    const timestamps = entries.map(entry => entry.createdAt.getTime());
    const oldestEntry = new Date(Math.min(...timestamps));
    const newestEntry = new Date(Math.max(...timestamps));

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: 0, // Would need hit/miss tracking to calculate
      averageComputationTime,
      oldestEntry,
      newestEntry
    };
  }

  /**
   * Warm up cache with pre-computed results
   */
  warmUp(entries: RecipeComputationCache[]): void {
    for (const entry of entries) {
      // Only add if not expired
      if (Date.now() <= entry.expiresAt.getTime()) {
        this.cache.set(entry.cacheKey, entry);
        this.updateAccessOrder(entry.cacheKey);
      }
    }

    // Evict if over capacity
    while (this.cache.size > this.config.maxSize) {
      this.evictLeastRecentlyUsed();
    }
  }

  /**
   * Export cache for persistence
   */
  export(): RecipeComputationCache[] {
    return Array.from(this.cache.values());
  }

  /**
   * Import cache from persistence
   */
  import(entries: RecipeComputationCache[]): void {
    this.clear();
    this.warmUp(entries);
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private generatePlanetaryPositionsHash(planetaryPositions: { [planet: string]: string }): string {
    const positionsString = Object.entries(planetaryPositions);
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([planet, sign]) => `${planet}:${sign}`)
      .join('|');
    return this.hashString(positionsString);
  }

  private updateAccessOrder(cacheKey: string): void {
    this.removeFromAccessOrder(cacheKey);
    this.accessOrder.push(cacheKey);
  }

  private removeFromAccessOrder(cacheKey: string): void {
    const index = this.accessOrder.indexOf(cacheKey);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  private evictLeastRecentlyUsed(): void {
    if (this.accessOrder.length === 0) return;

    const lruKey = this.accessOrder.shift();
    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt.getTime()) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
    }
  }
}

// Global cache instance
let globalCacheInstance: RecipeComputationCacheManager | null = null;

/**
 * Get the global recipe computation cache instance
 */
export function getRecipeComputationCache(): RecipeComputationCacheManager {
  if (!globalCacheInstance) {
    globalCacheInstance = new RecipeComputationCacheManager();
  }
  return globalCacheInstance;
}

/**
 * Create a new cache instance with custom configuration
 */
export function createRecipeComputationCache(config?: Partial<CacheConfig>): RecipeComputationCacheManager {
  return new RecipeComputationCacheManager(config);
}

/**
 * Cached recipe computation wrapper
 *
 * Wraps recipe computation functions to automatically cache results.
 */
export function withComputationCaching<T extends any[], R>(
  computationFn: (...args: T) => R,
  options: { getCacheKey: (args: T) => string;
    getPlanetaryPositions: (args: T) => { [planet: string]: string };
    cache?: RecipeComputationCacheManager
  }
) {
  const cache = options.cache || getRecipeComputationCache();

  return (...args: T): R => {
    const cacheKey = options.getCacheKey(args);

    // Try to get from cache first
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (cached) {
        return cached as R;
      }
    }

    // Compute the result
    const startTime = Date.now();
    const result = computationFn(...args);
    const computationTimeMs = Date.now() - startTime;

    // Cache the result
    if (result && typeof result === 'object' && 'computationMetadata' in result) {
      const planetaryPositions = options.getPlanetaryPositions(args);
      cache.set(cacheKey, result as RecipeComputedProperties, computationTimeMs, planetaryPositions);
    }

    return result;
  };
}

/**
 * Batch cache operations for multiple recipes
 */
export function batchCacheOperations(operations: Array<{
    cacheKey: string;
    operation: 'get' | 'set' | 'delete';
    data?: RecipeComputedProperties;
    planetaryPositions?: { [planet: string]: string };
  }>,
  cache?: RecipeComputationCacheManager
): Array<RecipeComputedProperties | null> {
  const cacheManager = cache || getRecipeComputationCache();
  const results: Array<RecipeComputedProperties | null> = [];

  for (const op of operations) {
    switch (op.operation) {
      case 'get':
        results.push(cacheManager.get(op.cacheKey));
        break;
      case 'set':
        if (op.data && op.planetaryPositions) {
          cacheManager.set(op.cacheKey, op.data, 0, op.planetaryPositions);
        }
        results.push(null);
        break;
      case 'delete':
        // Note: CacheManager doesn't have a delete method, so we skip
        results.push(null);
        break;
    }
  }

  return results;
}

/**
 * Cache performance monitoring
 */
export interface CachePerformanceMetrics {
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;
  averageHitTime: number;
  averageMissTime: number;
  totalRequests: number
}

export function getCachePerformanceMetrics()
  cache?: RecipeComputationCacheManager
): CachePerformanceMetrics {
  // This would require additional instrumentation
  // For now, return basic stats
  const cacheManager = cache || getRecipeComputationCache();
  const stats = cacheManager.getStats();

  return {
    cacheHits: 0, // Would need to track hits/misses
    cacheMisses: 0,
    hitRate: 0,
    averageHitTime: 0,
    averageMissTime: 0,
    totalRequests: stats.size
  };
}

/**
 * Export cache data for persistence
 */
export function exportCacheData(cache?: RecipeComputationCacheManager): RecipeComputationCache[] {
  const cacheManager = cache || getRecipeComputationCache();
  return cacheManager.export();
}

/**
 * Import cache data from persistence
 */
export function importCacheData(data: RecipeComputationCache[], cache?: RecipeComputationCacheManager): void {
  const cacheManager = cache || getRecipeComputationCache();
  cacheManager.import(data);
}
