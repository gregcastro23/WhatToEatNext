import { randomUUID } from "node:crypto";
import { Redis } from "@upstash/redis";
import { createLogger } from "@/utils/logger";
import { invalidate, memoize } from "./cache/memoryCache";

const logger = createLogger("Redis");

const REDIS_QUOTA_COOLDOWN_MS = 5 * 60 * 1000;
const MAX_FALLBACK_TTL_SECONDS = 300;
const MAX_REDIS_VALUE_CHARS = 128 * 1024;
const MAX_ERROR_SUMMARY_CHARS = 240;
const FALLBACK_KEY_PREFIX = "redis-fallback:";
const QUOTA_ERROR_PATTERNS: readonly string[] = [
  "fixed plan limits",
  "max daily request limit",
  "max requests limit",
  "quota exceeded",
  "oom command not allowed",
];
const COMMUNITY_AGENTS_REVISION_KEY = "community:agents:v3:revision";

let _client: Redis | null = null;
let _quotaCooldownUntil = 0;
let _fallbackCommunityRevision = 0;

/**
 * Strips command argument payloads (e.g. `, command was: [["set",...]]`) and
 * truncates error strings so Redis failures never flood logs with multi-hundred-KB payloads.
 */
export function summarizeRedisError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  const commandIdx = raw.indexOf(", command was:");
  const stripped = (commandIdx >= 0 ? raw.slice(0, commandIdx) : raw).trim();
  if (stripped.length <= MAX_ERROR_SUMMARY_CHARS) return stripped;
  return `${stripped.slice(0, MAX_ERROR_SUMMARY_CHARS - 1)}…`;
}

/** Returns true when an error reflects an Upstash quota/plan cap or memory limit. */
export function isRedisQuotaError(err: unknown): boolean {
  const lower = summarizeRedisError(err).toLowerCase();
  return QUOTA_ERROR_PATTERNS.some((pattern) => lower.includes(pattern));
}

/** Returns true while Redis calls are paused after an Upstash quota error. */
export function isRedisCircuitOpen(now = Date.now()): boolean {
  return now < _quotaCooldownUntil;
}

/**
 * Records a Redis error, opens the quota cooldown circuit when applicable
 * (emitting a single summary warning per cooldown window), and returns the
 * sanitized error summary for caller logging.
 */
export function noteRedisError(op: string, err: unknown, key?: string): string {
  const summary = summarizeRedisError(err);
  if (isRedisQuotaError(err)) {
    const now = Date.now();
    const alreadyOpen = now < _quotaCooldownUntil;
    _quotaCooldownUntil = now + REDIS_QUOTA_COOLDOWN_MS;
    if (!alreadyOpen) {
      logger.warn(
        "Upstash quota limit reached; pausing Redis calls for cooldown window",
        { op, key, cooldownMs: REDIS_QUOTA_COOLDOWN_MS, message: summary },
      );
    }
  }
  return summary;
}

function logRedisFailure(op: string, err: unknown, key?: string): void {
  const summary = noteRedisError(op, err, key);
  if (!isRedisQuotaError(err)) {
    logger.error(`${op} failed`, { key, message: summary });
  }
}

function exceedsRedisValueCap(value: unknown): boolean {
  try {
    const serialized = typeof value === "string" ? value : JSON.stringify(value);
    return typeof serialized === "string" && serialized.length > MAX_REDIS_VALUE_CHARS;
  } catch {
    return false;
  }
}

function memoizeFallback<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>,
): Promise<T> {
  const cappedMs =
    Math.max(1, Math.min(ttlSeconds, MAX_FALLBACK_TTL_SECONDS)) * 1000;
  return memoize(`${FALLBACK_KEY_PREFIX}${key}`, cappedMs, loader);
}

export function getRedisClient(): Redis | null {
  if (isRedisCircuitOpen()) return null;
  if (_client) return _client;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    logger.warn("Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN");
    return null;
  }

  try {
    // Use `cache: "default"` instead of @upstash/redis's default `"no-store"` so
    // Next.js 15's patched fetch does not throw DynamicServerError (`DYNAMIC_SERVER_USAGE`)
    // when Redis reads/writes occur inside ISR routes like /recipes/[recipeId].
    _client = new Redis({
      url,
      token,
      cache: "default",
    });
    return _client;
  } catch (err) {
    logger.error("Initialization failed:", {
      message: summarizeRedisError(err),
    });
    return null;
  }
}

// NOTE: the Upstash REST client (@upstash/redis) auto-serializes objects on
// SET and auto-parses JSON-shaped values on GET. Callers must not double-encode
// with JSON.stringify/JSON.parse — the previous contract did, and the resulting
// double-parse produced literal `"[object Object]"` strings on read.
export async function redisGet<T = unknown>(key: string): Promise<T | null> {
  try {
    const client = getRedisClient();
    if (!client) return null;
    return await client.get<T>(key);
  } catch (err) {
    logRedisFailure("GET", err, key);
    return null;
  }
}

export async function redisSet(
  key: string,
  value: unknown,
  ttlSeconds: number,
): Promise<void> {
  try {
    const client = getRedisClient();
    if (!client) return;
    if (exceedsRedisValueCap(value)) {
      logger.warn("Skipping oversized Redis write", {
        key,
        maxChars: MAX_REDIS_VALUE_CHARS,
      });
      return;
    }
    await client.set(key, value, { ex: ttlSeconds });
  } catch (err) {
    logRedisFailure("SET", err, key);
  }
}

export async function redisDel(key: string): Promise<void> {
  invalidate(`${FALLBACK_KEY_PREFIX}${key}`);
  try {
    const client = getRedisClient();
    if (!client) return;
    await client.del(key);
  } catch (err) {
    logRedisFailure("DEL", err, key);
  }
}

/** Rotate the namespace after COMMIT, covering every limit and in-flight fill. */
export async function invalidateCommunityAgentsCache(): Promise<void> {
  _fallbackCommunityRevision += 1;
  const client = getRedisClient();
  if (!client) return;
  try {
    await client.set(COMMUNITY_AGENTS_REVISION_KEY, randomUUID());
  } catch (err) {
    const summary = noteRedisError(
      "invalidateCommunityAgentsCache",
      err,
      COMMUNITY_AGENTS_REVISION_KEY,
    );
    if (!isRedisQuotaError(err)) {
      logger.warn("invalidateCommunityAgentsCache failed", { message: summary });
    }
  }
}

export async function communityAgentsCached<T>(
  limit: number,
  ttlSeconds: number,
  loader: () => Promise<T>,
): Promise<T> {
  const localKey = `community:agents:v3:local:${_fallbackCommunityRevision}:${limit}`;
  if (isRedisCircuitOpen()) {
    return memoizeFallback(localKey, ttlSeconds, loader);
  }
  const client = getRedisClient();
  if (!client) return loader();
  let revision: string | null;
  try {
    revision = await client.get<string>(COMMUNITY_AGENTS_REVISION_KEY);
  } catch (err) {
    const summary = noteRedisError(
      "communityAgentsCached.revision",
      err,
      COMMUNITY_AGENTS_REVISION_KEY,
    );
    if (isRedisCircuitOpen()) {
      return memoizeFallback(localKey, ttlSeconds, loader);
    }
    logger.warn("Community agents cache revision unavailable", {
      message: summary,
    });
    return loader();
  }
  // Old generations expire normally. A loader started before publication can
  // only refill its old generation, never the newly visible namespace.
  return redisCached(`community:agents:v3:${revision ?? "initial"}:${limit}`, ttlSeconds, loader);
}

/**
 * Read-through cache. Returns the cached value for `key`; on a miss it runs
 * `loader`, caches the result for `ttlSeconds`, and returns it.
 *
 * Fails OPEN: if Upstash is unconfigured, `redisGet`/`redisSet` degrade to
 * null/no-op, so the caller runs `loader` directly. When Upstash rejects
 * requests due to a quota/plan limit, the circuit breaker falls back to a
 * bounded in-process cache (`memoizeFallback`) for the cooldown window to avoid
 * collapsing into a backing-DB storm.
 */
export async function redisCached<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>,
): Promise<T> {
  if (isRedisCircuitOpen()) {
    return memoizeFallback(key, ttlSeconds, loader);
  }
  const cached = await redisGet<T>(key);
  if (cached !== null && cached !== undefined) return cached;
  if (isRedisCircuitOpen()) {
    return memoizeFallback(key, ttlSeconds, loader);
  }
  const fresh = await loader();
  await redisSet(key, fresh, ttlSeconds);
  return fresh;
}
