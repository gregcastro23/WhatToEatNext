// Covers the three branches of isJtiRevoked: Redis hit, Redis miss with
// Postgres hit, and both stores erroring (fail-open).

const redisGetMock = jest.fn();
const redisSetMock = jest.fn().mockResolvedValue("OK");
const executeQueryMock = jest.fn();
const loggerWarnMock = jest.fn();
const loggerErrorMock = jest.fn();

jest.mock("@upstash/redis", () => ({
  Redis: jest.fn().mockImplementation(() => ({
    get: redisGetMock,
    set: redisSetMock,
  })),
}));

jest.mock("@/lib/database", () => ({
  __esModule: true,
  executeQuery: (...args: unknown[]) => executeQueryMock(...args),
}));

jest.mock("@/lib/logger", () => ({
  __esModule: true,
  logger: {
    warn: (...args: unknown[]) => loggerWarnMock(...args),
    error: (...args: unknown[]) => loggerErrorMock(...args),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

describe("isJtiRevoked", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    redisGetMock.mockReset();
    redisSetMock.mockClear();
    executeQueryMock.mockReset();
    loggerWarnMock.mockReset();
    process.env = {
      ...ORIGINAL_ENV,
      UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
      UPSTASH_REDIS_REST_TOKEN: "test-token",
    };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it("returns false for an empty jti without touching either store", async () => {
    const { isJtiRevoked } = await import("@/lib/auth/sessionRevocation");
    expect(await isJtiRevoked("")).toBe(false);
    expect(redisGetMock).not.toHaveBeenCalled();
    expect(executeQueryMock).not.toHaveBeenCalled();
  });

  it("short-circuits on Redis hit (denylist match) without hitting Postgres", async () => {
    redisGetMock.mockResolvedValue("1");
    const { isJtiRevoked } = await import("@/lib/auth/sessionRevocation");
    expect(await isJtiRevoked("jti-abc")).toBe(true);
    expect(redisGetMock).toHaveBeenCalledWith("session:revoked:jti-abc");
    expect(executeQueryMock).not.toHaveBeenCalled();
  });

  it("on Redis miss, returns true when Postgres reports revoked_at IS NOT NULL and populates cache", async () => {
    redisGetMock.mockResolvedValue(null);
    executeQueryMock.mockResolvedValue({
      rowCount: 1,
      rows: [{ revoked_at: new Date("2026-05-01T00:00:00Z") }],
    });
    const { isJtiRevoked } = await import("@/lib/auth/sessionRevocation");
    expect(await isJtiRevoked("jti-revoked")).toBe(true);
    // Populated lazily — the call is fire-and-forget but the mock should
    // still observe it before the microtask queue drains.
    await new Promise((r) => setTimeout(r, 0));
    expect(redisSetMock).toHaveBeenCalledWith(
      "session:revoked:jti-revoked",
      "1",
      expect.objectContaining({ ex: expect.any(Number) }),
    );
  });

  it("on Redis miss, returns false when Postgres reports revoked_at IS NULL and does NOT populate cache", async () => {
    redisGetMock.mockResolvedValue(null);
    executeQueryMock.mockResolvedValue({
      rowCount: 1,
      rows: [{ revoked_at: null }],
    });
    const { isJtiRevoked } = await import("@/lib/auth/sessionRevocation");
    expect(await isJtiRevoked("jti-live")).toBe(false);
    await new Promise((r) => setTimeout(r, 0));
    expect(redisSetMock).not.toHaveBeenCalled();
  });

  it("treats a missing device_sessions row as revoked (ADR-004) and logs a warning", async () => {
    redisGetMock.mockResolvedValue(null);
    executeQueryMock.mockResolvedValue({ rowCount: 0, rows: [] });
    const { isJtiRevoked } = await import("@/lib/auth/sessionRevocation");
    expect(await isJtiRevoked("jti-orphan")).toBe(true);
    expect(loggerWarnMock).toHaveBeenCalledWith(
      "[sessionRevocation] No device_sessions row for jti",
      expect.objectContaining({ jti: "jti-orphan" }),
    );
  });

  it("fail-open: returns false when both stores error", async () => {
    redisGetMock.mockRejectedValue(new Error("redis offline"));
    executeQueryMock.mockRejectedValue(new Error("pg offline"));
    const { isJtiRevoked } = await import("@/lib/auth/sessionRevocation");
    expect(await isJtiRevoked("jti-stranded")).toBe(false);
    expect(loggerWarnMock).toHaveBeenCalled();
  });

  it("when Upstash creds are absent, falls through to Postgres", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    executeQueryMock.mockResolvedValue({
      rowCount: 1,
      rows: [{ revoked_at: new Date("2026-05-01T00:00:00Z") }],
    });
    const { isJtiRevoked } = await import("@/lib/auth/sessionRevocation");
    expect(await isJtiRevoked("jti-no-redis")).toBe(true);
    expect(redisGetMock).not.toHaveBeenCalled();
  });
});
