import Redis from "ioredis";

let _client: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (_client) return _client;
  if (!process.env.REDIS_URL) return null;

  _client = new Redis(process.env.REDIS_URL, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
  });

  _client.on("error", (err: Error) => {
    // Log and continue — Redis is optional; callers must handle null
    console.warn("[Redis]", err.message);
  });

  return _client;
}

export async function redisGet(key: string): Promise<string | null> {
  try {
    return await getRedisClient()?.get(key) ?? null;
  } catch {
    return null;
  }
}

export async function redisSet(
  key: string,
  value: string,
  ttlSeconds: number,
): Promise<void> {
  try {
    await getRedisClient()?.set(key, value, "EX", ttlSeconds);
  } catch {
    // Non-fatal — in-process cache will still serve
  }
}

export async function redisDel(key: string): Promise<void> {
  try {
    await getRedisClient()?.del(key);
  } catch {
    // Non-fatal
  }
}
