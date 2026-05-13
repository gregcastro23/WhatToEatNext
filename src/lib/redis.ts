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

export async function redisGet(key: string): Promise<string | null> {
  try {
    const client = getRedisClient();
    if (!client) return null;
    return await client.get<string>(key);
  } catch (err) {
    console.error("[Redis] GET failed:", err);
    return null;
  }
}

export async function redisSet(
  key: string,
  value: string,
  ttlSeconds: number,
): Promise<void> {
  try {
    const client = getRedisClient();
    if (!client) return;
    await client.set(key, value, { ex: ttlSeconds });
    console.debug("[Redis] SET success:", key);
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
