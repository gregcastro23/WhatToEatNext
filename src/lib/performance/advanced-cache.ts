/**
 * Advanced Caching System - Phase 26 Performance Optimization
 *
 * Implements intelligent caching strategies with automatic invalidation,
 * cache warming, and performance monitoring for optimal user experience.
 */

import { logger } from '@/lib/logger';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  maxSize: number;
  hitRate: number;
}

class AdvancedCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize: number;
  private defaultTTL: number;
  private stats: CacheStats;

  constructor(maxSize = 1000, defaultTTL = 30 * 60 * 1000) { // 30 minutes default
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      maxSize,
      hitRate: 0
    };

    // Cleanup expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Get item from cache with automatic expiration check
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    const now = Date.now();

    // Check if entry has expired
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.size--;
      this.updateHitRate();
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = now;
    this.stats.hits++;
    this.updateHitRate();

    logger.debug('Cache hit', { key, accessCount: entry.accessCount });
    return entry.data;
  }

  /**
   * Set item in cache with optional TTL override
   */
  set<T>(key: string, data: T, ttlOverride?: number): void {
    const now = Date.now();
    const ttl = ttlOverride || this.defaultTTL;

    // If cache is full, remove least recently used item
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      ttl,
      accessCount: 1,
      lastAccessed: now
    };

    const wasExisting = this.cache.has(key);
    this.cache.set(key, entry);

    if (!wasExisting) {
      this.stats.size++;
    }

    logger.debug('Cache set', { key, ttl, size: this.stats.size });
  }

  /**
   * Get or compute value with caching
   */
  async getOrCompute<T>(
    key: string,
    computeFn: () => Promise<T>,
    ttlOverride?: number
  ): Promise<T> {
    const cached = this.get<T>(key);

    if (cached !== null) {
      return cached;
    }

    logger.debug('Cache miss, computing value', { key });
    const computed = await computeFn();
    this.set(key, computed, ttlOverride);

    return computed;
  }

  /**
   * Warm cache with frequently accessed data
   */
  async warmup(entries: Array<{ key: string; computeFn: () => Promise<any>; ttl?: number }>): Promise<void> {
    logger.info('Starting cache warmup', { count: entries.length });

    const promises = entries.map(async ({ key, computeFn, ttl }) => {
      try {
        const data = await computeFn();
        this.set(key, data, ttl);
        logger.debug('Cache warmed', { key });
      } catch (error) {
        logger.error('Cache warmup failed', { key, error });
      }
    });

    await Promise.allSettled(promises);
    logger.info('Cache warmup complete', this.getStats());
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidatePattern(pattern: RegExp): number {
    let invalidated = 0;

    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        invalidated++;
        this.stats.size--;
      }
    }

    logger.info('Cache invalidated by pattern', { pattern: pattern.source, invalidated });
    return invalidated;
  }

  /**
   * Clear specific cache entry
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.size--;
    }
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats.size = 0;
    this.stats.hits = 0;
    this.stats.misses = 0;
    this.stats.hitRate = 0;
    logger.info('Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        removed++;
        this.stats.size--;
      }
    }

    if (removed > 0) {
      logger.debug('Cache cleanup completed', { removed, size: this.stats.size });
    }
  }

  /**
   * Evict least recently used item
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.size--;
      logger.debug('Evicted LRU entry', { key: oldestKey });
    }
  }

  /**
   * Update hit rate statistics
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }
}

// Specialized cache instances for different data types
export const elementalCache = new AdvancedCache(500, 60 * 60 * 1000); // 1 hour TTL
export const planetaryCache = new AdvancedCache(200, 15 * 60 * 1000); // 15 minutes TTL
export const recipeCache = new AdvancedCache(1000, 2 * 60 * 60 * 1000); // 2 hours TTL
export const userCache = new AdvancedCache(100, 24 * 60 * 60 * 1000); // 24 hours TTL

/**
 * Cache warmup for application startup
 */
export async function initializeCaches(): Promise<void> {
  logger.info('Initializing advanced caching system')

  try {
    // Warm up planetary cache with current data
    await planetaryCache.warmup([
      {
        key: 'current_planetary_hour',
        computeFn: async () => {
          // This would normally call the planetary calculation service
          return {
            planet: 'Sun',
            influence: 0.7,
            timeRemaining: '45:30',
            energyType: 'Vitality & Leadership'
          };
        },
        ttl: 15 * 60 * 1000
      }
    ])

    // Warm up elemental cache with common calculations
    await elementalCache.warmup([
      {
        key: 'elemental_base_properties',
        computeFn: async () => ({
          Fire: { energy: 'hot', quality: 'dry', direction: 'South' },
          Water: { energy: 'cold', quality: 'wet', direction: 'West' },
          Earth: { energy: 'cold', quality: 'dry', direction: 'North' },
          Air: { energy: 'hot', quality: 'wet', direction: 'East' }
        }),
        ttl: 60 * 60 * 1000
      }
    ])

    logger.info('Cache initialization complete', {
      planetary: planetaryCache.getStats(),
      elemental: elementalCache.getStats()
    });
  } catch (error) {
    logger.error('Cache initialization failed', error);
  }
}

/**
 * Cache performance monitoring
 */
export function getCacheMetrics() {
  return {
    elemental: elementalCache.getStats(),
    planetary: planetaryCache.getStats(),
    recipe: recipeCache.getStats(),
    user: userCache.getStats()
  };
}

export default AdvancedCache;