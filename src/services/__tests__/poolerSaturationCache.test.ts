/**
 * @jest-environment node
 *
 * Verifies fetchPoolerSaturationSignals coalesces concurrent callers, caches
 * live pooler reads for 15s so PgBouncer's tiny pool_size=2 admin DB is not
 * saturated by admin panel polls, and never caches live:false failures.
 */

const mockConnect = jest.fn();
const mockQuery = jest.fn();
const mockEnd = jest.fn();
const mockClientCtor = jest.fn(() => ({
  connect: mockConnect,
  query: mockQuery,
  end: mockEnd,
}));

jest.mock("pg", () => ({
  Client: mockClientCtor,
}));

jest.mock("@/lib/logger", () => ({
  _logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

describe("fetchPoolerSaturationSignals caching & coalescing", () => {
  const savedUrl = process.env.DATABASE_URL;
  const savedMode = process.env.DB_POOLER_MODE;

  beforeEach(() => {
    jest.resetModules();
    process.env.DATABASE_URL = "postgresql://postgres:secret@pgbouncer.railway.internal:6432/railway?sslmode=disable";
    process.env.DB_POOLER_MODE = "session";
    mockClientCtor.mockClear();
    mockConnect.mockReset().mockResolvedValue(undefined);
    mockEnd.mockReset().mockResolvedValue(undefined);
    mockQuery.mockReset().mockImplementation(async (sql: string) => {
      if (sql === "SHOW POOLS") {
        return {
          rows: [
            { database: "railway", cl_active: 3, cl_waiting: 0, sv_active: 2, maxwait: 0 },
          ],
        };
      }
      return {
        rows: [
          { key: "max_client_conn", value: "120" },
          { key: "default_pool_size", value: "20" },
        ],
      };
    });
  });

  afterEach(() => {
    if (savedUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = savedUrl;
    if (savedMode === undefined) delete process.env.DB_POOLER_MODE;
    else process.env.DB_POOLER_MODE = savedMode;
  });

  it("coalesces concurrent calls and caches live signals for 15s", async () => {
    const mod = await import("@/services/poolerSaturationHealth");
    mod.resetPoolerSaturationCache();

    const [a, b, c] = await Promise.all([
      mod.fetchPoolerSaturationSignals(),
      mod.fetchPoolerSaturationSignals(),
      mod.fetchPoolerSaturationSignals(),
    ]);

    expect(mockClientCtor).toHaveBeenCalledTimes(1);
    expect(a.live).toBe(true);
    expect(a.clientsActive).toBe(3);
    expect(b).toEqual(a);
    expect(c).toEqual(a);

    const d = await mod.fetchPoolerSaturationSignals();
    expect(mockClientCtor).toHaveBeenCalledTimes(1);
    expect(d).toEqual(a);
  });

  it("never caches live:false failures so recovery is observed immediately", async () => {
    const mod = await import("@/services/poolerSaturationHealth");
    mod.resetPoolerSaturationCache();

    mockConnect.mockRejectedValueOnce(new Error("admin timeout"));
    const failed = await mod.fetchPoolerSaturationSignals();
    expect(failed.live).toBe(false);

    mockConnect.mockResolvedValueOnce(undefined);
    const recovered = await mod.fetchPoolerSaturationSignals();
    expect(recovered.live).toBe(true);
    expect(mockClientCtor).toHaveBeenCalledTimes(2);
  });
});
