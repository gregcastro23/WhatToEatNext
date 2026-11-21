// Mock @upstash/redis with a controllable in-memory store so the read-through
// cache path is exercised deterministically — no network, no real Upstash.
const mockStore = new Map<string, unknown>();
const mockGet = jest.fn(async (key: string) =>
  mockStore.has(key) ? mockStore.get(key) : null,
);
const mockSet = jest.fn(async (key: string, value: unknown) => {
  mockStore.set(key, value);
  return "OK";
});
const mockDel = jest.fn(async (key: string) => (mockStore.delete(key) ? 1 : 0));
const mockLoggerWarn = jest.fn();
const mockLoggerError = jest.fn();

jest.mock("@upstash/redis", () => ({
  Redis: jest.fn().mockImplementation(() => ({
    get: mockGet,
    set: mockSet,
    del: mockDel,
  })),
}));

jest.mock("@/utils/logger", () => ({
  createLogger: () => ({
    debug: jest.fn(),
    log: jest.fn(),
    info: jest.fn(),
    warn: (...args: unknown[]) => mockLoggerWarn(...args),
    error: (...args: unknown[]) => mockLoggerError(...args),
  }),
}));

describe("redisCached", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
    mockStore.clear();
    mockGet.mockReset().mockImplementation(async (key: string) =>
      mockStore.has(key) ? mockStore.get(key) : null,
    );
    mockSet.mockReset().mockImplementation(async (key: string, value: unknown) => {
      mockStore.set(key, value);
      return "OK";
    });
    mockDel.mockReset().mockImplementation(async (key: string) =>
      mockStore.delete(key) ? 1 : 0,
    );
    mockLoggerWarn.mockReset();
    mockLoggerError.mockReset();
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

  it("summarizeRedisError strips command payloads and truncates long messages", async () => {
    const { summarizeRedisError } = await import("@/lib/redis");
    const raw = new Error(
      'ERR This database has reached current Fixed plan limits, command was: [["set","recipes:catalog:all","HUGE"]]',
    );
    expect(summarizeRedisError(raw)).toBe(
      "ERR This database has reached current Fixed plan limits",
    );

    const longSummary = summarizeRedisError(new Error("x".repeat(400)));
    expect(longSummary.length).toBe(240);
    expect(longSummary.endsWith("…")).toBe(true);
  });

  it("trips quota circuit breaker on Fixed-plan error, logs once without payload, uses fallback cache, and recovers after 5 min", async () => {
    configureUpstash();
    const nowSpy = jest.spyOn(Date, "now").mockReturnValue(1_000_000);
    mockGet.mockRejectedValue(
      new Error(
        'ERR This database has reached current Fixed plan limits, command was: [["get","feed:recent"]]',
      ),
    );

    const { redisCached, isRedisCircuitOpen } = await import("@/lib/redis");
    const loader = jest.fn(async () => ({ ok: true }));

    expect(await redisCached("feed:recent", 60, loader)).toEqual({ ok: true });
    expect(isRedisCircuitOpen()).toBe(true);
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockSet).not.toHaveBeenCalled();
    expect(mockLoggerError).not.toHaveBeenCalled();
    expect(mockLoggerWarn).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(mockLoggerWarn.mock.calls[0])).not.toContain(
      "command was:",
    );

    // Subsequent calls during cooldown hit bounded warm-instance fallback without touching Upstash.
    nowSpy.mockReturnValue(1_030_000);
    expect(await redisCached("feed:recent", 60, loader)).toEqual({ ok: true });
    expect(loader).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledTimes(1);

    // After 5-minute cooldown expires, circuit closes and Upstash is retried.
    nowSpy.mockReturnValue(1_000_000 + 5 * 60 * 1000 + 1);
    expect(isRedisCircuitOpen()).toBe(false);
    mockGet.mockImplementation(async (key: string) =>
      mockStore.has(key) ? mockStore.get(key) : null,
    );
    expect(await redisCached("feed:recent", 60, loader)).toEqual({ ok: true });
    expect(loader).toHaveBeenCalledTimes(2);
    expect(mockGet).toHaveBeenCalledTimes(2);
    expect(mockSet).toHaveBeenCalledTimes(1);
  });

  it("preserves race-free communityAgentsCached invalidation while quota circuit is open", async () => {
    configureUpstash();
    mockGet.mockRejectedValue(
      new Error("ERR This database has reached current Fixed plan limits"),
    );

    const { communityAgentsCached, invalidateCommunityAgentsCache } =
      await import("@/lib/redis");

    let finishSlow: (value: string) => void = () => {
      throw new Error("slow loader not started");
    };
    let signalStarted: () => void = () => {};
    const started = new Promise<void>((resolve) => {
      signalStarted = resolve;
    });

    const staleCall = communityAgentsCached(
      71,
      60,
      () =>
        new Promise<string>((resolve) => {
          finishSlow = resolve;
          signalStarted();
        }),
    );
    await started;

    await invalidateCommunityAgentsCache();
    finishSlow("stale-agent-list");
    expect(await staleCall).toBe("stale-agent-list");

    const freshCall = await communityAgentsCached(
      71,
      60,
      async () => "fresh-agent-list",
    );
    expect(freshCall).toBe("fresh-agent-list");
    expect(
      await communityAgentsCached(71, 60, async () => "unexpected-reload"),
    ).toBe("fresh-agent-list");
  });

  it("skips oversized writes exceeding 128 KB without calling Upstash client.set", async () => {
    configureUpstash();
    const { redisSet } = await import("@/lib/redis");

    await redisSet("recipes:catalog:all", "a".repeat(128 * 1024 + 1), 300);
    expect(mockSet).not.toHaveBeenCalled();
    expect(mockLoggerWarn).toHaveBeenCalledWith(
      "Skipping oversized Redis write",
      expect.objectContaining({ key: "recipes:catalog:all" }),
    );
  });
});
