// Mock @upstash/redis with a controllable in-memory store so the read-through
// cache path is exercised deterministically — no network, no real Upstash.
const mockStore = new Map<string, unknown>();
jest.mock("@upstash/redis", () => ({
  Redis: jest.fn().mockImplementation(() => ({
    get: jest.fn(async (key: string) =>
      mockStore.has(key) ? mockStore.get(key) : null,
    ),
    set: jest.fn(async (key: string, value: unknown) => {
      mockStore.set(key, value);
      return "OK";
    }),
    del: jest.fn(async (key: string) => (mockStore.delete(key) ? 1 : 0)),
  })),
}));

describe("redisCached", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    mockStore.clear();
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  function configureUpstash() {
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
  }

  it("runs the loader on a miss, caches it, and serves the next call from cache", async () => {
    configureUpstash();
    const { redisCached } = await import("@/lib/redis");

    const loader = jest.fn(async () => [{ id: 1 }]);
    const first = await redisCached("feed:recent:40:0", 30, loader);
    const second = await redisCached("feed:recent:40:0", 30, loader);

    expect(first).toEqual([{ id: 1 }]);
    expect(second).toEqual([{ id: 1 }]);
    expect(loader).toHaveBeenCalledTimes(1); // second served from cache
  });

  it("caches an empty array as a valid hit (does not treat [] as a miss)", async () => {
    configureUpstash();
    const { redisCached } = await import("@/lib/redis");

    const loader = jest.fn(async () => [] as unknown[]);
    await redisCached("k:empty", 30, loader);
    const again = await redisCached("k:empty", 30, loader);

    expect(again).toEqual([]);
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it("keys are independent", async () => {
    configureUpstash();
    const { redisCached } = await import("@/lib/redis");

    expect(await redisCached("a", 30, async () => "A")).toBe("A");
    expect(await redisCached("b", 30, async () => "B")).toBe("B");
  });

  it("invalidates every roster limit, including uncommon limits", async () => {
    configureUpstash();
    const { communityAgentsCached, invalidateCommunityAgentsCache } = await import("@/lib/redis");
    const limits = [1, 71, 80, 137, 200];
    for (const limit of limits) await communityAgentsCached(limit, 30, async () => "old");
    await invalidateCommunityAgentsCache();
    for (const limit of limits) {
      expect(await communityAgentsCached(limit, 30, async () => "new")).toBe("new");
    }
  });

  it("cannot refill the visible cache with a query started before invalidation", async () => {
    configureUpstash();
    const { communityAgentsCached, invalidateCommunityAgentsCache } = await import("@/lib/redis");
    let finish: (value: string) => void = () => { throw new Error("loader not started"); };
    let started: () => void = () => {};
    const ready = new Promise<void>((resolve) => { started = resolve; });
    const staleRequest = communityAgentsCached(71, 30, () => new Promise<string>((resolve) => {
      finish = resolve;
      started();
    }));
    await ready;
    await invalidateCommunityAgentsCache();
    finish("old");
    expect(await staleRequest).toBe("old");
    expect(await communityAgentsCached(71, 30, async () => "new")).toBe("new");
    expect(await communityAgentsCached(71, 30, async () => "unexpected")).toBe("new");
  });

  it("fails open when Upstash is unconfigured: loader runs every call, value still returned", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    const { redisCached } = await import("@/lib/redis");

    const loader = jest.fn(async () => 42);
    expect(await redisCached("k:noredis", 30, loader)).toBe(42);
    expect(await redisCached("k:noredis", 30, loader)).toBe(42);
    expect(loader).toHaveBeenCalledTimes(2); // no cache available → no dedupe
  });
});
