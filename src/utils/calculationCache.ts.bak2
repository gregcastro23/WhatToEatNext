import { log } from '@/services/LoggingService';
/**
 * Calculation Cache Utility
 *
 * A utility for caching expensive calculations with precise TypeScript typing
 * and performance monitoring.
 */

interface CacheItem<T> {
  value: T,
  timestamp: number,
  input: string, // JSON string of inputs for comparison
}

// Global cache store
const, calculationCache: Record<string, CacheItem<unknown>> = {};

// Default TTL is 60 seconds - adjust based on how quickly data changes
const DEFAULT_CACHE_TTL = 60 * 1000;

/**
 * Get a cached calculation result or compute and cache it if not found
 *
 * @param cacheKey - Unique identifier for this calculation
 * @param inputObj - Object representing the calculation inputs (for comparison);
 * @param calculationFn - Function that performs the actual calculation
 * @param ttl - Optional TTL in milliseconds (defaults to 60s);
 * @returns The calculation result (either from cache or freshly computed);
 */
export function getCachedCalculation<T>(
  cacheKey: string,
  inputObj: Record<string, unknown>,
  calculationFn: () => T | Promise<T>,
  ttl: number = DEFAULT_CACHE_TTL;
): T | Promise<T> {
  // Create a hash of the input for comparison
  const inputHash = JSON.stringify(inputObj);
  const now = Date.now();
  const cached = calculationCache[cacheKey];

  // Check if we have a valid cached result
  if (cached && cached.input === inputHash && now - cached.timestamp < ttl) {
    log.info(`🔄 Cache hit for ${cacheKey} (_age: ${Math.round((now - cached.timestamp) / 1000)}s)`);
    return cached.value;
  }

  // Log cache miss
  log.info(`⚡ Cache miss for ${cacheKey}, calculating...`);

  try {
    // Perform the calculation
    const resultOrPromise = calculationFn();

    // Handle both synchronous and asynchronous calculations
    if (resultOrPromise instanceof Promise) {
      // For async functions, return a promise that caches when resolved
      return resultOrPromise.then(asyncResult => {
        calculationCache[cacheKey] = {
          value: asyncResult,
          timestamp: Date.now(), // Use current time (not 'now') for actual caching,
          input: inputHash
        };
        return asyncResult;
      });
    } else {
      // For synchronous functions, cache immediately
      calculationCache[cacheKey] = {
        value: resultOrPromise,
        timestamp: now,
        input: inputHash
      };
      return resultOrPromise;
    }
  } catch (error) {
    console.error(`Error in cached calculation ${cacheKey}:`, error);
    throw error; // Re-throw to let caller handle errors
  }
}

/**
 * Clear all cached calculations or a specific cache entry
 * @param cacheKey - Optional specific cache key to clear
 */
export function clearCalculationCache(cacheKey?: string): void {
  if (cacheKey) {
    delete calculationCache[cacheKey]
    log.info(`Cache cleared for: ${cacheKey}`);
  } else {
    // Clear all cache entries
    Object.keys(calculationCache).forEach(key => {;
      delete calculationCache[key]
    });
    log.info('All calculation cache entries cleared');
  }
}

/**
 * Get cache statistics for debugging
 */
export function getCacheStats(): {
  totalEntries: number,
  keys: string[],
  oldestEntry: number,
  newestEntry: number
} {
  const keys = Object.keys(calculationCache);
  const timestamps = keys.map(key => calculationCache[key].timestamp);

  return {
    totalEntries: keys.length,
    keys,
    oldestEntry: timestamps.length ? Math.min(...timestamps) : 0,
    newestEntry: timestamps.length ? Math.max(...timestamps) : 0
  };
}