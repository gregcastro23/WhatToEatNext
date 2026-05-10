/**
 * In-memory cache for Amazon catalog lookups.
 *
 * TTL is 23h — Amazon's Associates Operating Agreement requires that cached
 * price/availability data must not exceed 24h. Staying at 23h gives us margin
 * for clock skew between cache write and the moment a user actually clicks.
 *
 * Single Railway instance today. If we scale horizontally, swap the Map for
 * Upstash Redis — the function signatures are stable.
 */

const TTL_MS = 23 * 60 * 60 * 1000;
const MAX_ENTRIES = 5_000;

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

declare global {
  // Survive HMR / route module re-evaluation in dev.
  var __amazonResultCache: Map<string, CacheEntry<unknown>> | undefined;
}

const cache: Map<string, CacheEntry<unknown>> =
  globalThis.__amazonResultCache ?? new Map();
globalThis.__amazonResultCache = cache;

export function getCachedAmazonResult<T>(key: string): T | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    cache.delete(key);
    return null;
  }
  return hit.value as T;
}

export function setCachedAmazonResult<T>(key: string, value: T): void {
  if (cache.size >= MAX_ENTRIES) {
    // Drop oldest insertion-order key.
    const firstKey = cache.keys().next().value;
    if (firstKey !== undefined) cache.delete(firstKey);
  }
  cache.set(key, { value, expiresAt: Date.now() + TTL_MS });
}

export function clearAmazonCache(): void {
  cache.clear();
}

export function amazonCacheSize(): number {
  return cache.size;
}
