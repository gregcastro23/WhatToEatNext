/**
 * @jest-environment node
 *
 * `/api/health` must be able to say the database is down.
 *
 * It could not. `checkDatabaseHealth` returns an OBJECT
 * (`{healthy, latency?, error?}`, `src/lib/database/connection.ts`) and catches
 * internally rather than throwing. The route did:
 *
 *     const isHealthy = await checkDatabaseHealth();
 *     dbStatus = isHealthy ? "healthy" : "error";
 *
 * A non-null object is always truthy, so `dbStatus` was `"healthy"` for every
 * possible outcome — including an unreachable Postgres — and because the
 * function never throws, the `catch` that would have set `"error"` was dead
 * too. Two independent reasons the endpoint could not report an outage.
 *
 * `[MEASURED 2026-08-19]` production returned
 * `{"status":"healthy", ..., "services":{"database":"healthy", ...}}`, which is
 * what it returns unconditionally.
 *
 * Scope note, deliberately pinned by the last case: this route still answers
 * HTTP **200** when the database is down. `/lab` (public) does
 * `r.ok ? r.json() : null` and would render an EMPTY panel during the very
 * outage it exists to display, so changing the status code is a separate,
 * consumer-breaking decision — not a drive-by. The Docker/compose healthchecks
 * use `curl -f` and therefore still cannot see a degraded body; that gap is
 * real and is called out in the route.
 */

const mockCheckDatabaseHealth = jest.fn();

jest.mock("@/lib/database", () => ({
  checkDatabaseHealth: () => mockCheckDatabaseHealth(),
}));

describe("GET /api/health", () => {
  beforeEach(() => {
    jest.resetModules();
    mockCheckDatabaseHealth.mockReset();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => jest.restoreAllMocks());

  async function callRoute(): Promise<Record<string, unknown>> {
    const { GET } = await import("@/app/api/health/route");
    const res = await GET();
    return (await res.json()) as Record<string, unknown>;
  }

  it("reports the database as error when the check says unhealthy", async () => {
    // The exact shape checkDatabaseHealth returns on a failed connect.
    mockCheckDatabaseHealth.mockResolvedValue({
      healthy: false,
      latency: 5012,
      error: "connection terminated unexpectedly",
    });

    const body = await callRoute();

    // THE defect: an object is truthy, so this read "healthy" on current code
    // no matter what the database was doing.
    expect((body.services as Record<string, unknown>).database).toBe("error");
    expect(body.status).toBe("degraded");
  });

  it("still reports healthy when the check really succeeds", async () => {
    // Control: the fix must not make the endpoint pessimistic. Without this,
    // hardcoding "error" would pass the case above.
    mockCheckDatabaseHealth.mockResolvedValue({ healthy: true, latency: 12 });

    const body = await callRoute();

    expect((body.services as Record<string, unknown>).database).toBe("healthy");
    expect(body.status).toBe("healthy");
    expect(body.databaseLatencyMs).toBe(12);
  });

  it("still answers 200 on an outage — pinning the known consumer gap", async () => {
    mockCheckDatabaseHealth.mockResolvedValue({ healthy: false });

    const { GET } = await import("@/app/api/health/route");
    const res = await GET();

    // Intentional. `curl -f` in the Docker/compose healthchecks only fails on
    // >= 400, so those gates remain blind to a degraded body — but returning
    // 503 would blank the public /lab panel, which gates on `r.ok`. If someone
    // deliberately changes this, they must fix /lab and BackendStatus.tsx in
    // the same change and accept container restarts during an upstream outage.
    expect(res.status).toBe(200);
  });
});
