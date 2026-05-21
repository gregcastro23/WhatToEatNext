import { Redis } from "@upstash/redis";

let _client: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (_client) return _client;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn("[Redis] Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN");
    return null;
  }

  try {
    _client = new Redis({
      url,
      token,
    });
    return _client;
  } catch (err) {
    console.error("[Redis] Initialization failed:", err);
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
    console.error("[Redis] GET failed:", err);
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
    console.error("[Redis] SET failed:", err);
  }
}

export async function redisDel(key: string): Promise<void> {
  try {
    const client = getRedisClient();
    if (!client) return;
    await client.del(key);
  } catch (err) {
    console.error("[Redis] DEL failed:", err);
  }
}
