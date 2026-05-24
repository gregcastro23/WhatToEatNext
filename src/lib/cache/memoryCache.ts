/**
 * Process-local memoization with a TTL.
 *
 * Used by admin endpoints (system-status, onboarding-health, live-activity,
 * todays-highlights, agents/network) to coalesce bursts of requests — e.g.
 * the operator has two admin tabs open, or accidentally reloads. Each
 * cached entry is held for the configured TTL, then re-computed on the
 * next miss.
 *
 * In-flight de-duplication: when a cache miss is in flight, concurrent
 * callers wait on the same Promise instead of triggering parallel work.
 *
 * This is intentionally process-local. Next.js dev/hot-reload tears the
 * module down; in prod each Node instance has its own cache. Use a real
 * distributed cache (Redis) if these endpoints ever serve traffic from
 * outside the admin operator.
 *
 * @file src/lib/cache/memoryCache.ts
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

interface PendingEntry<T> {
  promise: Promise<T>;
}

const cache = new Map<string, CacheEntry<unknown>>();
const pending = new Map<string, PendingEntry<unknown>>();

/**
 * Return the cached value for `key` if it's still fresh, otherwise call
 * `compute()`, cache its result for `ttlMs`, and return it.
 *
 * Concurrent callers for the same key during a miss share the same
 * in-flight Promise — no double computation.
 *
 * If `compute()` throws, the failure is NOT cached (next caller retries).
 */
export async function memoize<T>(
  key: string,
  ttlMs: number,
  compute: () => Promise<T>,
): Promise<T> {
  const now = Date.now();
  const cached = cache.get(key) as CacheEntry<T> | undefined;
  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const inFlight = pending.get(key) as PendingEntry<T> | undefined;
  if (inFlight) {
    return inFlight.promise;
  }

  const promise = (async () => {
    try {
      const value = await compute();
      cache.set(key, { value, expiresAt: Date.now() + ttlMs });
      return value;
    } finally {
      pending.delete(key);
    }
  })();
  pending.set(key, { promise });
  return promise;
}

/**
 * Drop a specific cached key. Test-only / admin override.
 */
export function invalidate(key: string): void {
  cache.delete(key);
}

/**
 * Drop every cached key. Used in unit tests; never call from a hot path.
 */
export function clearAll(): void {
  cache.clear();
  pending.clear();
}
