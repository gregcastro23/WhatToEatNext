// Database cache integration - Phase 3
// IMPORTANT: This file must be browser-safe since it's imported by client components
// Database operations are only executed server-side

import { log } from "@/services/LoggingService";

/**
 * Calculation Cache Utility - Database Integration
 *
 * A utility for caching expensive calculations with database persistence
 * and performance monitoring.
 *
 * BROWSER-SAFE: Database operations are skipped in browser environment
 */

// Default TTL is 60 seconds - adjust based on how quickly data changes
const DEFAULT_CACHE_TTL = 60 * 1000;

// In-memory cache for browser environment
const browserCache = new Map<string, { data: any; timestamp: number; inputHash: string }>();

// Lazy-load database service (only on server)
let CacheService: any = null;
if (typeof window === 'undefined') {
  // Only import database on server-side
  import("@/lib/database").then(mod => {
    CacheService = mod.CacheService;
  }).catch(err => {
    log.warn("Database not available, using memory-only cache");
  });
}

/**
 * Get a cached calculation result or compute and cache it if not found
 *
 * @param cacheKey - Unique identifier for this calculation
 * @param inputObj - Object representing the calculation inputs (for comparison)
 * @param calculationFn - Function that performs the actual calculation
 * @param ttl - Optional TTL in milliseconds (defaults to 60s)
 * @returns The calculation result (either from cache or freshly computed)
 */
export async function getCachedCalculation<T>(
  cacheKey: string,
  inputObj: Record<string, unknown>,
  calculationFn: () => T | Promise<T>,
  ttl: number = DEFAULT_CACHE_TTL,
): Promise<T> {
  // Create a hash of the input for comparison
  const inputHash = JSON.stringify(inputObj);
  const now = Date.now();

  // Browser environment - use in-memory cache
  if (typeof window !== 'undefined') {
    const cached = browserCache.get(cacheKey);

    if (cached && cached.inputHash === inputHash && (now - cached.timestamp) < ttl) {
      log.info(`🔄 Browser cache hit for ${cacheKey} (age: ${Math.round((now - cached.timestamp) / 1000)}s)`);
      return cached.data;
    }

    // Cache miss - perform the calculation
    log.info(`⚡ Browser cache miss for ${cacheKey}, calculating...`);
    const result = await calculationFn();

    // Store in browser cache
    browserCache.set(cacheKey, { data: result, timestamp: now, inputHash });
    return result;
  }

  // Server environment - use database cache
  try {
    // CacheService might be null if database is unavailable
    if (CacheService) {
      const cachedResult = await (CacheService.get as any)(cacheKey, inputHash);

      if (cachedResult) {
        log.info(
          `🔄 Database cache hit for ${cacheKey} (age: ${Math.round((now - cachedResult.created_at.getTime()) / 1000)}s)`,
        );
        return JSON.parse(cachedResult.result_data);
      }
    }

    // Cache miss - perform the calculation
    log.info(`⚡ Cache miss for ${cacheKey}, calculating...`);

    const result = await calculationFn();

    // Store in database cache if available
    if (CacheService) {
      await (CacheService.set as any)(
        cacheKey,
        inputHash,
        JSON.stringify(result),
        ttl,
      );
    }

    return result;
  } catch (error) {
    log.error(`Error in cached calculation for ${cacheKey}:`, error as any);

    // Fallback to direct calculation if caching fails
    try {
      return await calculationFn();
    } catch (calcError) {
      log.error(`Calculation also failed for ${cacheKey}:`, calcError as any);
      throw calcError;
    }
  }
}

/**
 * Clear all cached calculations or a specific cache entry
 * @param cacheKey - Optional specific cache key to clear
 */
export async function clearCalculationCache(cacheKey?: string): Promise<void> {
  // Browser environment - clear in-memory cache
  if (typeof window !== 'undefined') {
    if (cacheKey) {
      browserCache.delete(cacheKey);
      log.info(`Browser cache cleared for ${cacheKey}`);
    } else {
      browserCache.clear();
      log.info("Browser cache cleared (all entries)");
    }
    return;
  }

  // Server environment - clear database cache
  try {
    if (CacheService) {
      const cache = CacheService as any;
      if (cacheKey) {
        await cache.delete(cacheKey);
        log.info(`Database cache cleared for ${cacheKey}`);
      } else {
        await cache.clearExpired(); // Clear expired entries
        log.info("Database cache cleared (expired entries)");
      }
    }
  } catch (error) {
    log.error("Failed to clear database cache:", error as any);
  }
}

/**
 * Get cache statistics for debugging
 */
export async function getCacheStats(): Promise<{
  totalEntries: number;
  activeEntries: number;
  expiredEntries: number;
}> {
  // Browser environment - return in-memory cache stats
  if (typeof window !== 'undefined') {
    const totalEntries = browserCache.size;
    return {
      totalEntries,
      activeEntries: totalEntries, // All in-memory entries are considered active
      expiredEntries: 0, // Browser cache doesn't track expiration separately
    };
  }

  // Server environment - return database cache stats
  try {
    if (CacheService) {
      const cache = CacheService as any;
      const stats = await cache.getStats();
      return {
        totalEntries: stats.total,
        activeEntries: stats.active,
        expiredEntries: stats.expired,
      };
    }
  } catch (error) {
    log.error("Failed to get database cache stats:", error as any);
  }

  return {
    totalEntries: 0,
    activeEntries: 0,
    expiredEntries: 0,
  };
}
