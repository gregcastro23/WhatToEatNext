/**
 * @jest-environment node
 *
 * Database work that runs after a response must be registered with `after()`,
 * never started with a bare `void`.
 *
 * On Vercel, work nothing waits for is suspended with the instance once the
 * response is sent. A suspended query holds one of the pool's connections
 * until the instance next wakes, and its timers then fire late.
 * [MEASURED 2026-09-25, production] read timeouts with a median executionTime
 * of 67 s against a 6 s query timeout. See withObservabilityAfterResponse.test.ts
 * for the request recorder; this covers the other sites on every request's path:
 * the slow-query log's insert, executeQuery's system_metrics sample, and both
 * logs' cold-start hydration reads.
 */
const mockAfterTasks: Array<() => Promise<void>> = [];
jest.mock("next/server", () => ({
  ...jest.requireActual("next/server"),
  after: (task: () => Promise<void>) => {
    mockAfterTasks.push(task);
  },
}));

const mockQuery = jest.fn().mockResolvedValue({ rows: [], rowCount: 0 });
jest.mock("@/lib/database/rawPool", () => ({
  getDatabasePool: () => ({ query: mockQuery, waitingCount: 0, totalCount: 1, idleCount: 1 }),
  initializeDatabase: jest.fn(),
  closeDatabase: jest.fn(),
}));

jest.mock("@/lib/logger", () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
  _logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}));

function sqlCalls(fragment: string): number {
  return mockQuery.mock.calls.filter(([sql]: [string]) => String(sql).includes(fragment)).length;
}

async function runAfterTasks(): Promise<void> {
  const tasks = mockAfterTasks.splice(0);
  await Promise.all(tasks.map((task) => task()));
}

describe("after-response database work", () => {
  const savedUrl = process.env.DATABASE_URL;
  beforeEach(() => {
    jest.resetModules();
    mockAfterTasks.length = 0;
    mockQuery.mockClear();
    process.env.DATABASE_URL = "postgresql://u:p@localhost:5432/test";
  });
  afterAll(() => {
    if (savedUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = savedUrl;
  });

  it("defers the slow-query log insert to after()", async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { recordSlowQuery } = require("@/lib/observability/slowQueryLog");
    recordSlowQuery(500, "SELECT 1", 1, { waiting: 0, total: 1, idle: 1 });

    expect(sqlCalls("slow_query_log_entries")).toBe(0);
    expect(mockAfterTasks.length).toBeGreaterThan(0);
    await runAfterTasks();
    expect(sqlCalls("INSERT INTO slow_query_log_entries")).toBe(1);
  });

  it("defers executeQuery's system_metrics sample to after()", async () => {
    // A 500 ms query, long after the last sample, so the throttled insert fires.
    let calls = 0;
    const now = jest.spyOn(Date, "now").mockImplementation(() => (calls++ === 0 ? 1_000_000 : 1_000_500));
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { executeQuery } = require("@/lib/database/connection");
      await executeQuery("SELECT 1");
    } finally {
      now.mockRestore();
    }

    expect(sqlCalls("system_metrics")).toBe(0);
    await runAfterTasks();
    expect(sqlCalls("INSERT INTO system_metrics")).toBe(1);
  });

  it("defers both logs' hydration reads to after()", async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getRecentSlowQueries } = require("@/lib/observability/slowQueryLog");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getRecentRequests } = require("@/lib/observability/requestLog");
    getRecentSlowQueries();
    getRecentRequests();
    // Give a floating read every chance to start before looking.
    for (let i = 0; i < 10; i++) await new Promise((r) => setImmediate(r));

    expect(mockAfterTasks).toHaveLength(2);
    expect(sqlCalls("FROM slow_query_log_entries")).toBe(0);
    expect(sqlCalls("FROM request_log_entries")).toBe(0);
    await runAfterTasks();
    expect(sqlCalls("FROM slow_query_log_entries")).toBe(1);
    expect(sqlCalls("FROM request_log_entries")).toBe(1);
  });
});
