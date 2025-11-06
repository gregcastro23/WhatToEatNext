/**
 * Cuisine Computation Cache
 *
 * Implements intelligent caching for cuisine-level computations with
 * automatic invalidation, batch processing, and performance optimization.
 *
 * Key Features:
 * - Computed cuisine properties caching
 * - Cache invalidation based on recipe changes
 * - Batch processing for multiple cuisines
 * - Cache warming and prefetching
 * - Memory-efficient storage with TTL
 */

import type {
    CuisineComputationOptions,
    CuisineComputedProperties,
    RecipeComputedProperties
} from '@/types/hierarchy';

// ========== CACHE ENTRY TYPES ==========

/**
 * Cache entry for cuisine computation results
 */
interface CuisineCacheEntry {
  /** Cached computed properties */
  properties: CuisineComputedProperties;

  /** Cache metadata */
  metadata: {
    /** When this entry was cached */
    cachedAt: Date;

    /** Cache version for invalidation */
    version: string;

    /** Recipe IDs used in computation */
    recipeIds: string[];

    /** Computation options used */
    computationOptions: CuisineComputationOptions;

    /** Cache hit count */
    accessCount: number;

    /** Last accessed timestamp */
    lastAccessed: Date
  };
}

/**
 * Cache statistics
 */
interface CacheStatistics {
  /** Total number of cached entries */
  totalEntries: number;

  /** Cache hit rate (0-1) */
  hitRate: number;

  /** Total cache hits */
  totalHits: number;

  /** Total cache misses */
  totalMisses: number;

  /** Average computation time saved (ms) */
  averageTimeSaved: number;

  /** Memory usage estimate (bytes) */
  memoryUsage: number
}

/**
 * Cache invalidation reason
 */
type InvalidationReason =
  | 'recipe_added'
  | 'recipe_removed'
  | 'recipe_modified'
  | 'options_changed'
  | 'manual_invalidation'
  | 'ttl_expired'
// ========== CACHE CONFIGURATION ==========

/**
 * Default cache configuration
 */
const DEFAULT_CACHE_CONFIG = {
  /** Maximum cache size (number of entries) */
  maxSize: 100,

  /** Time to live in milliseconds (24 hours) */
  ttl: 24 * 60 * 60 * 1000,

  /** Cache version for invalidation */
  version: '1.0.0',

  /** Enable statistics tracking */
  enableStats: true,

  /** Enable automatic cleanup */
  enableCleanup: true,

  /** Cleanup interval in milliseconds (1 hour) */
  cleanupInterval: 60 * 60 * 1000
};

// ========== CACHE STORAGE ==========

/**
 * In-memory cache storage
 */
class CuisineComputationCache {
  private readonly cache = new Map<string, CuisineCacheEntry>();
  private readonly config: typeof DEFAULT_CACHE_CONFIG;
  private stats: CacheStatistics;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config: Partial<typeof DEFAULT_CACHE_CONFIG> = {}) {
    this.config = { ...DEFAULT_CACHE_CONFIG, ...config };
    this.stats = {
      totalEntries: 0,
      hitRate: 0,
      totalHits: 0,
      totalMisses: 0,
      averageTimeSaved: 0,
      memoryUsage: 0
};

    if (this.config.enableCleanup) {
      this.startCleanupTimer();
    }
  }

  // ========== CORE CACHE OPERATIONS ==========

  /**
   * Get cached cuisine properties
   *
   * @param cuisineId - Cuisine identifier
   * @param options - Computation options (for cache key generation)
   * @returns Cached properties or null if not found/expired
   */
  get(cuisineId: string, options: CuisineComputationOptions = {}): CuisineComputedProperties | null {
    const cacheKey = this.generateCacheKey(cuisineId, options);
    const entry = this.cache.get(cacheKey);

    if (!entry) {
      this.updateStats(false);
      return null;
    }

    // Check TTL
    const now = new Date();
    if (now.getTime() - entry.metadata.cachedAt.getTime() > this.config.ttl) {
      this.invalidateEntry(cacheKey, 'ttl_expired');
      this.updateStats(false);
      return null;
    }

    // Update access metadata
    entry.metadata.accessCount++;
    entry.metadata.lastAccessed = now;

    this.updateStats(true);
    return entry.properties;
  }

  /**
   * Set cached cuisine properties
   *
   * @param cuisineId - Cuisine identifier
   * @param properties - Computed properties to cache
   * @param options - Computation options used
   * @param recipeIds - Recipe IDs used in computation
   */
  set(
    cuisineId: string,
    properties: CuisineComputedProperties,
    options: CuisineComputationOptions = {},
    recipeIds: string[] = []
  ): void {
    const cacheKey = this.generateCacheKey(cuisineId, options);

    // Check cache size limits
    if (this.cache.size >= this.config.maxSize) {
      this.evictLeastRecentlyUsed();
    }

    const entry: CuisineCacheEntry = {
      properties,
      metadata: {
        cachedAt: new Date(),
        version: this.config.version,
        recipeIds: [...recipeIds],
        computationOptions: { ...options },
        accessCount: 0,
        lastAccessed: new Date()
      }
    };

    this.cache.set(cacheKey, entry);
    this.stats.totalEntries = this.cache.size;
    this.updateMemoryUsage();
  }

  /**
   * Check if cuisine properties are cached
   *
   * @param cuisineId - Cuisine identifier
   * @param options - Computation options
   * @returns True if cached and valid
   */
  has(cuisineId: string, options: CuisineComputationOptions = {}): boolean {
    return this.get(cuisineId, options) !== null;
  }

  /**
   * Invalidate cache entry
   *
   * @param cuisineId - Cuisine identifier
   * @param options - Computation options
   * @param reason - Reason for invalidation
   */
  invalidate(cuisineId: string, options: CuisineComputationOptions = {}, reason: InvalidationReason = 'manual_invalidation'): void {
    const cacheKey = this.generateCacheKey(cuisineId, options);
    this.invalidateEntry(cacheKey, reason);
  }

  /**
   * Invalidate all entries for a cuisine (all option variations)
   *
   * @param cuisineId - Cuisine identifier
   * @param reason - Reason for invalidation
   */
  public invalidateCuisine(cuisineId: string, reason: InvalidationReason = 'manual_invalidation'): void {
    const keysToDelete: string[] = [];

    this.cache.forEach((_, cacheKey) => {
      if (cacheKey.startsWith(`${cuisineId}:`)) {
        keysToDelete.push(cacheKey);
      }
    });

    keysToDelete.forEach(key => this.invalidateEntry(key, reason));
  }

  /**
   * Invalidate entries based on recipe changes
   *
   * @param recipeId - Recipe ID that changed
   * @param changeType - Type of change (added/removed/modified)
   */
  public invalidateByRecipe(recipeId: string, changeType: 'added' | 'removed' | 'modified'): void {
    const reason = `recipe_${changeType}` as InvalidationReason;
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, cacheKey) => {
      if (entry.metadata.recipeIds.includes(recipeId)) {
        keysToDelete.push(cacheKey);
      }
    });

    keysToDelete.forEach(key => this.invalidateEntry(key, reason));
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
    this.resetStats();
  }

  // ========== BATCH OPERATIONS ==========

  /**
   * Get multiple cuisines from cache
   *
   * @param requests - Array of cuisine requests
   * @returns Map of cuisine IDs to properties (null if not cached)
   */
  getBatch(requests: Array<{ cuisineId: string; options?: CuisineComputationOptions }>): Map<string, CuisineComputedProperties | null> {
    const results = new Map<string, CuisineComputedProperties | null>();

    requests.forEach(({ cuisineId, options = {} }) => {
      const properties = this.get(cuisineId, options);
      results.set(cuisineId, properties);
    });

    return results;
  }

  /**
   * Set multiple cuisines in cache
   *
   * @param entries - Array of cache entries to set
   */
  setBatch(entries: Array<{
    cuisineId: string;
    properties: CuisineComputedProperties;
    options?: CuisineComputationOptions;
    recipeIds?: string[];
  }>): void {
    entries.forEach(({ cuisineId, properties, options = {}, recipeIds = [] }) => {
      this.set(cuisineId, properties, options, recipeIds);
    });
  }

  /**
   * Warm cache with pre-computed entries
   *
   * @param entries - Array of entries to warm the cache with
   */
  warm(entries: Array<{
    cuisineId: string;
    properties: CuisineComputedProperties;
    options?: CuisineComputationOptions;
    recipeIds?: string[];
  }>): void {
    // Temporarily disable size limits for warming
    const originalMaxSize = this.config.maxSize;
    this.config.maxSize = Infinity;

    this.setBatch(entries);

    // Restore original limits
    this.config.maxSize = originalMaxSize;

    // Evict if necessary
    while (this.cache.size > this.config.maxSize) {
      this.evictLeastRecentlyUsed();
    }
  }

  // ========== CACHE MANAGEMENT ==========

  /**
   * Get cache statistics
   *
   * @returns Current cache statistics
   */
  getStats(): CacheStatistics {
    return { ...this.stats };
  }

  /**
   * Get cache information
   *
   * @returns Detailed cache information
   */
  getInfo(): {
    config: typeof DEFAULT_CACHE_CONFIG,
    stats: CacheStatistics,
    entries: Array<{
      cuisineId: string,
      options: CuisineComputationOptions,
      cachedAt: Date,
      accessCount: number,
      lastAccessed: Date,
      size: number
    }>;
  } {
    const entries = Array.from(this.cache.entries()).map(([cacheKey, entry]) => {
      const [cuisineId, optionsHash] = cacheKey.split(':');
      return {
        cuisineId,
        options: entry.metadata.computationOptions,
        cachedAt: entry.metadata.cachedAt,
        accessCount: entry.metadata.accessCount,
        lastAccessed: entry.metadata.lastAccessed,
        size: this.estimateEntrySize(entry)
      };
    });

    return {
      config: this.config,
      stats: this.stats,
      entries
    };
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): void {
    const now = new Date();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, cacheKey) => {
      if (now.getTime() - entry.metadata.cachedAt.getTime() > this.config.ttl) {
        keysToDelete.push(cacheKey);
      }
    });

    keysToDelete.forEach(key => this.invalidateEntry(key, 'ttl_expired'));
  }

  // ========== PRIVATE METHODS ==========

  /**
   * Generate cache key from cuisine ID and options
   */
  private generateCacheKey(cuisineId: string, options: CuisineComputationOptions): string {
    // Create a stable hash of the options
    const optionsStr = JSON.stringify(options, Object.keys(options).sort());
    const optionsHash = this.simpleHash(optionsStr);
    return `${cuisineId}:${optionsHash}`;
  }

  /**
   * Simple string hash function
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Invalidate a specific cache entry
   */
  private invalidateEntry(cacheKey: string, reason: InvalidationReason): void {
    const entry = this.cache.get(cacheKey);
    if (entry) {
      this.cache.delete(cacheKey);
      this.stats.totalEntries = this.cache.size;
      this.updateMemoryUsage();
    }
  }

  /**
   * Evict least recently used entry
   */
  private evictLeastRecentlyUsed(): void {
    let oldestKey = '';
    let oldestTime = new Date();

    this.cache.forEach((entry, cacheKey) => {
      if (entry.metadata.lastAccessed < oldestTime) {
        oldestTime = entry.metadata.lastAccessed;
        oldestKey = cacheKey;
      }
    });

    if (oldestKey) {
      this.invalidateEntry(oldestKey, 'manual_invalidation');
    }
  }

  /**
   * Update cache statistics
   */
  private updateStats(isHit: boolean): void {
    if (!this.config.enableStats) return;

    if (isHit) {
      this.stats.totalHits++;
    } else {
      this.stats.totalMisses++;
    }

    const totalRequests = this.stats.totalHits + this.stats.totalMisses;
    this.stats.hitRate = totalRequests > 0 ? this.stats.totalHits / totalRequests : 0;
  }

  /**
   * Reset statistics
   */
  private resetStats(): void {
    this.stats = {
      totalEntries: 0,
      hitRate: 0,
      totalHits: 0,
      totalMisses: 0,
      averageTimeSaved: 0,
      memoryUsage: 0
};
  }

  /**
   * Update memory usage estimate
   */
  private updateMemoryUsage(): void {
    let totalSize = 0;
    this.cache.forEach(entry => {
      totalSize += this.estimateEntrySize(entry);
    });
    this.stats.memoryUsage = totalSize;
  }

  /**
   * Estimate size of a cache entry in bytes
   */
  private estimateEntrySize(entry: CuisineCacheEntry): number {
    // Rough estimation: JSON string length * 2 (for UTF-16 storage)
    const jsonStr = JSON.stringify(entry);
    return jsonStr.length * 2;
  }

  /**
   * Start automatic cleanup timer
   */
  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Stop cleanup timer
   */
  private stopCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }
}

// ========== CACHE INSTANCE ==========

/**
 * Global cache instance
 */
let globalCache: CuisineComputationCache | null = null;

/**
 * Get global cache instance
 */
export function getGlobalCache(): CuisineComputationCache {
  if (!globalCache) {
    globalCache = new CuisineComputationCache();
  }
  return globalCache;
}

/**
 * Set global cache configuration
 */
export function configureGlobalCache(config: Partial<typeof DEFAULT_CACHE_CONFIG>): void {
  if (globalCache) {
    // Reconfigure existing cache (limited options)
    if (config.maxSize !== undefined) {
      globalCache = new CuisineComputationCache({ ...config });
    }
  } else {
    globalCache = new CuisineComputationCache(config);
  }
}

/**
 * Reset global cache
 */
export function resetGlobalCache(): void {
  if (globalCache) {
    globalCache.clear();
  }
  globalCache = new CuisineComputationCache();
}

// ========== CACHE-AWARE COMPUTATION ==========

/**
 * Compute cuisine properties with caching
 *
 * @param cuisineId - Cuisine identifier
 * @param recipes - Recipe computed properties
 * @param options - Computation options
 * @param computeFn - Function to compute properties if not cached
 * @returns Computed properties (from cache or fresh computation)
 */
export async function computeCuisineWithCache(
  cuisineId: string,
  recipes: RecipeComputedProperties[],
  options: CuisineComputationOptions,
  computeFn: () => Promise<CuisineComputedProperties>
): Promise<CuisineComputedProperties> {
  const cache = getGlobalCache();

  // Check cache first
  const cached = cache.get(cuisineId, options);
  if (cached) {
    return cached;
  }

  // Compute fresh
  const properties = await computeFn();

  // Cache the result
  const recipeIds = recipes.map(r => `${r.computationMetadata.planetaryPositionsUsed.Sun}_${r.computationMetadata.planetaryPositionsUsed.Moon}`);
  cache.set(cuisineId, properties, options, recipeIds);

  return properties;
}

// ========== EXPORTS ==========

export type {
    CacheStatistics,
    InvalidationReason
};

    export {
        CuisineComputationCache
    };
