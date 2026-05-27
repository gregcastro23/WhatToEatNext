/**
 * In-process per-API-key sliding-window rate limiter for the MCP server.
 *
 * The HTTP-shaped `src/lib/rateLimit.ts` expects a `Request` and is built
 * for Next.js API routes. The stdio MCP server doesn't have a `Request`,
 * so this is a stripped-down sibling that keys off `apiKeyId` (or the
 * synthetic anonymous bucket when no key is present) and caps the per-key
 * RPM using `rpmForTier()`.
 *
 * One bucket per key, sliding 60s window. Memory-only — the MCP server
 * runs as a single long-lived Node process, so a Map is sufficient. If
 * we ever scale MCP horizontally, this becomes the place to swap in Redis.
 */

import { rpmForTier } from "@/lib/rateLimit";

interface Bucket {
  timestamps: number[];
}

const WINDOW_MS = 60_000;
const MAX_KEYS = 10_000;
const store = new Map<string, Bucket>();

export interface CheckOptions {
  /** apiKeyId, or `null` for anonymous/synthetic — uses a shared bucket. */
  apiKeyId: string | null;
  /** `api_keys.rate_limit_tier` value, or null when unknown. */
  rateLimitTier: string | null;
  /** Optional override for testing — defaults to Date.now(). */
  now?: number;
}

export interface CheckResult {
  allowed: boolean;
  remaining: number;
  /** Per-minute cap derived from the tier. */
  limit: number;
  /** When the bucket will have capacity again, in ms. */
  resetMs: number;
}

/**
 * Account for one MCP tool call against the per-key bucket. Always
 * records the timestamp on success; on overflow the call is rejected
 * before the handler runs.
 */
export function checkMcpRateLimit(options: CheckOptions): CheckResult {
  const now = options.now ?? Date.now();
  const limit = rpmForTier(options.rateLimitTier);
  const key = options.apiKeyId ?? "anonymous";

  let bucket = store.get(key);
  if (!bucket) {
    if (store.size >= MAX_KEYS) {
      const oldest = store.keys().next().value;
      if (oldest !== undefined) store.delete(oldest);
    }
    bucket = { timestamps: [] };
    store.set(key, bucket);
  }

  const cutoff = now - WINDOW_MS;
  bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff);

  if (bucket.timestamps.length >= limit) {
    const oldest = bucket.timestamps[0];
    return {
      allowed: false,
      remaining: 0,
      limit,
      resetMs: Math.max(0, WINDOW_MS - (now - oldest)),
    };
  }

  bucket.timestamps.push(now);
  return {
    allowed: true,
    remaining: limit - bucket.timestamps.length,
    limit,
    resetMs: WINDOW_MS,
  };
}

/** Test-only: clear the bucket store between runs. */
export function __resetMcpRateLimit(): void {
  store.clear();
}
