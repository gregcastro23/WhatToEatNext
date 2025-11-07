// Database cache integration - Phase 3
import { CacheService } from "@/lib/database";
import { log } from "@/services/LoggingService";

/**
 * Calculation Cache Utility - Database Integration
 *
 * A utility for caching expensive calculations with database persistence
 * and performance monitoring.
 */

// Default TTL is 60 seconds - adjust based on how quickly data changes
const DEFAULT_CACHE_TTL = 60 * 1000;

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

  try {
    // Try to get from database cache first
    const cachedResult = await CacheService.get(cacheKey, inputHash);

    if (cachedResult) {
      log.info(
        `🔄 Database cache hit for ${cacheKey} (age: ${Math.round((now - cachedResult.created_at.getTime()) / 1000)}s)`,
      );
      return JSON.parse(cachedResult.result_data);
    }

    // Cache miss - perform the calculation
    log.info(`⚡ Cache miss for ${cacheKey}, calculating...`);

    const result = await calculationFn();

    // Store in database cache
    await CacheService.set(cacheKey, inputHash, JSON.stringify(result), ttl);

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
  try {
    const cache = CacheService as any;
    if (cacheKey) {
      await cache.delete(cacheKey);
      log.info(`Database cache cleared for ${cacheKey}`);
    } else {
      await cache.clearExpired(); // Clear expired entries
      log.info("Database cache cleared (expired entries)");
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
  try {
    const cache = CacheService as any;
    const stats = await cache.getStats();
    return {
      totalEntries: stats.total,
      activeEntries: stats.active,
      expiredEntries: stats.expired,
    };
  } catch (error) {
    log.error("Failed to get database cache stats:", error as any);
    return {
      totalEntries: 0,
      activeEntries: 0,
      expiredEntries: 0,
    };
  }
}
