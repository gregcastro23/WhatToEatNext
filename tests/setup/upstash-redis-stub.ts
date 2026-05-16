// Test-time stub for @upstash/redis.
// The real package transitively pulls in uncrypto's ESM-only .mjs files, which
// don't play nicely with the ts-jest transform pipeline. Production code paths
// only call getRedisClient() when UPSTASH_REDIS_REST_URL is set, and tests
// don't set it — so a no-op stub is sufficient.
export class Redis {
  constructor(_opts: unknown) {}
  async get<T = unknown>(_key: string): Promise<T | null> { return null; }
  async set(_key: string, _value: unknown, _opts?: unknown): Promise<string> { return "OK"; }
  async del(_key: string): Promise<number> { return 0; }
  pipeline() {
    return {
      zremrangebyscore: () => this.pipeline(),
      zadd: () => this.pipeline(),
      zcard: () => this.pipeline(),
      pexpire: () => this.pipeline(),
      exec: async () => null,
    };
  }
}
