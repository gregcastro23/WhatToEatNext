/**
 * Lightweight sliding-window rate limiter for Next.js API routes.
 *
 * In-memory by design: Railway runs a single Node process per service, so a
 * shared Map is sufficient. If we ever scale horizontally, swap the store
 * for Upstash Redis (`@upstash/ratelimit`) — the call sites do not change.
 *
 * Usage:
 *   const rl = await rateLimit(request, { window: 60_000, max: 30 });
 *   if (!rl.allowed) return rl.response;
 */
import { NextResponse } from "next/server";
import { getRedisClient } from "./redis";

interface Bucket {
  timestamps: number[];
}

const store = new Map<string, Bucket>();
const MAX_KEYS = 10_000;

function clientKey(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

export interface RateLimitOptions {
  /** Sliding window length in ms. */
  window: number;
  /** Max requests allowed within the window. */
  max: number;
  /** Optional bucket name to namespace counters per route. */
  bucket?: string;
  /** Optional override for the client identifier (e.g. user id). */
  identifier?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
  response?: NextResponse;
}

/**
 * Sliding window rate limiter.
 * Attempts to use Redis for shared state, falls back to in-memory Map.
 */
export async function rateLimit(
  request: Request,
  options: RateLimitOptions,
): Promise<RateLimitResult> {
  const { window, max, bucket = "global", identifier } = options;
  const id = identifier ?? clientKey(request);
  const key = `ratelimit:${bucket}:${id}`;
  const now = Date.now();
  const cutoff = now - window;

  const redis = getRedisClient();
  if (redis) {
    try {
      // Use Redis ZSET for sliding window
      const pipeline = redis.pipeline();
      pipeline.zremrangebyscore(key, 0, cutoff);
      pipeline.zadd(key, { score: now, member: `${now}-${Math.random()}` });
      pipeline.zcard(key);
      pipeline.pexpire(key, window);

      const results = await pipeline.exec();
      if (results) {
        // results[2] is the ZCARD count
        const count = results[2] as number;
        const allowed = count <= max;

        if (!allowed) {
          const resetMs = window;
          return buildResponse(false, 0, resetMs, max, now);
        }

        return {
          allowed: true,
          remaining: max - count,
          resetMs: window,
        };
      }
    } catch (err) {
      console.warn("[RateLimit] Redis failed, falling back to Memory:", err);
    }
  }

  // Memory Fallback
  let entry = store.get(key);
  if (!entry) {
    if (store.size >= MAX_KEYS) {
      const oldest = store.keys().next().value;
      if (oldest !== undefined) store.delete(oldest);
    }
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= max) {
    const oldestInWindow = entry.timestamps[0];
    const resetMs = Math.max(0, window - (now - oldestInWindow));
    return buildResponse(false, 0, resetMs, max, now);
  }

  entry.timestamps.push(now);
  return {
    allowed: true,
    remaining: max - entry.timestamps.length,
    resetMs: window,
  };
}

function buildResponse(
  allowed: boolean,
  remaining: number,
  resetMs: number,
  max: number,
  now: number,
): RateLimitResult {
  const retryAfter = Math.ceil(resetMs / 1000);
  return {
    allowed,
    remaining,
    resetMs,
    response: NextResponse.json(
      {
        error: "rate_limit_exceeded",
        message: "Too many requests. Please try again shortly.",
        retryAfter,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": String(max),
          "X-RateLimit-Remaining": String(remaining),
          "X-RateLimit-Reset": String(Math.ceil((now + resetMs) / 1000)),
        },
      },
    ),
  };
}
