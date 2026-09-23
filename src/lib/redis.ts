import { Redis } from "@upstash/redis";
import { createLogger } from "@/utils/logger";

const logger = createLogger("Redis");

let _client: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (_client) return _client;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    logger.warn("Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN");
    return null;
  }

  try {
    _client = new Redis({
      url,
      token,
    });
    return _client;
  } catch (err) {
    logger.error("Initialization failed:", err);
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
    logger.error("GET failed", { error: err });
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
    await client.set(key, value as never, { ex: ttlSeconds });
  } catch (err) {
    logger.error("SET failed", { error: err });
  }
}

export async function redisDel(key: string): Promise<void> {
  try {
    const client = getRedisClient();
    if (!client) return;
    await client.del(key);
  } catch (err) {
    logger.error("DEL failed", { error: err });
  }
}

/**
 * Read-through cache. Returns the cached value for `key`; on a miss it runs
 * `loader`, caches the result for `ttlSeconds`, and returns it.
 *
 * Fails OPEN: if Upstash is unconfigured or errors, redisGet/redisSet degrade
 * to null/no-op, so the caller transparently falls back to `loader` (a direct
 * read) rather than surfacing an error. Intended for short TTLs on hot,
 * globally-shared read endpoints (e.g. the Live Network Feed pollers), where a
 * few seconds of staleness is fine and the goal is to collapse a poll storm
 * into at most one backing query per key per TTL.
 */
export async function redisCached<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>,
): Promise<T> {
  const cached = await redisGet<T>(key);
  if (cached !== null && cached !== undefined) return cached;
  const fresh = await loader();
  await redisSet(key, fresh, ttlSeconds);
  return fresh;
}
