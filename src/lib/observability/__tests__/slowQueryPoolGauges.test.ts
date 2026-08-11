/**
 * @jest-environment node
 *
 * A slow-query entry's `ms` conflates two unrelated failures, because
 * executeQuery starts its timer before `pool.query()` and that call does
 * checkout AND execution. On 2026-08-11 that ambiguity sent a whole
 * investigation down the wrong path: production showed durations up to
 * 1,185,182 ms and the obvious reading — "the pool is starving" — was wrong.
 *
 * `pool_waiting` is what settles it. An entry recorded with `waiting === 0` was
 * not queued for a connection, whatever the duration says.
 *
 * The property these tests exist to protect is therefore narrow and specific:
 * **a measured 0 must never be stored as NULL.** NULL means "this row predates
 * the column"; 0 means "measured, and nothing was waiting". Collapsing them
 * would delete exactly the signal the column was added for — and `?? null` on a
 * zero is an easy way to do it by accident.
 */

const mockQuery = jest.fn().mockResolvedValue({ rows: [] });
const mockPool = {
  query: mockQuery,
  waitingCount: 0,
  totalCount: 0,
  idleCount: 0,
};

jest.mock("@/lib/database/rawPool", () => ({
  getDatabasePool: () => mockPool,
}));

import {
  recordSlowQuery,
  setSlowQueryThresholdMs,
  type PoolGauges,
} from "@/lib/observability/slowQueryLog";

/**
 * The parameter array of the persisted INSERT, once it has been flushed.
 *
 * persistSlowQueryEntry is void-ed AND does a dynamic `await import(...)`, so a
 * couple of microtask ticks is not enough to see it — poll the macrotask queue
 * instead. Returning null after the budget is a real "it never wrote", which is
 * what several tests below assert.
 */
async function persistedParams(): Promise<unknown[] | null> {
  for (let i = 0; i < 20; i++) {
    const call = mockQuery.mock.calls.find(([sql]: [string]) =>
      String(sql).includes("INSERT INTO slow_query_log_entries"),
    );
    if (call) return call[1] as unknown[];
    await new Promise((r) => setImmediate(r));
  }
  return null;
}

const PARAM = { waiting: 4, total: 5, idle: 6 } as const;

describe("pool gauges on the slow-query log", () => {
  const savedUrl = process.env.DATABASE_URL;

  beforeEach(() => {
    mockQuery.mockClear();
    process.env.DATABASE_URL = "postgresql://u:p@h:5432/d";
    setSlowQueryThresholdMs(200);
  });

  afterEach(() => {
    if (savedUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = savedUrl;
  });

  it("persists the gauges alongside the duration", async () => {
    recordSlowQuery(500, "SELECT 1", 1, {
      waiting: PARAM.waiting,
      total: PARAM.total,
      idle: PARAM.idle,
    });
    const params = await persistedParams();
    expect(params).not.toBeNull();
    // (at, ms, preview, row_count, pool_waiting, pool_total, pool_idle)
    expect(params!.slice(4)).toEqual([PARAM.waiting, PARAM.total, PARAM.idle]);
  });

  it("stores a measured ZERO as 0, not NULL", async () => {
    // THE LOAD-BEARING CASE. `waiting: 0` is the finding — it is what proves an
    // entry was not starved. `?? null` on a zero would erase it and make the
    // column useless for the one question it was added to answer.
    recordSlowQuery(500, "SELECT 1", 1, { waiting: 0, total: 3, idle: 3 });
    const params = await persistedParams();
    expect(params!.slice(4)).toEqual([0, 3, 3]);
    expect(params![4]).not.toBeNull();
  });

  it("stores NULL when the gauges were not available", async () => {
    // Distinct from the case above: nothing was measured, so nothing may be
    // claimed. A row from before this column exists reads the same way.
    recordSlowQuery(500, "SELECT 1", 1, undefined);
    const params = await persistedParams();
    expect(params!.slice(4)).toEqual([null, null, null]);
  });

  it("still skips its own writes, so the log cannot feed itself", async () => {
    recordSlowQuery(500, "INSERT INTO slow_query_log_entries (at) VALUES ($1)", 1, {
      waiting: 0,
      total: 1,
      idle: 1,
    });
    expect(await persistedParams()).toBeNull();
  });

  it("respects the threshold — gauges do not make a fast query loggable", async () => {
    recordSlowQuery(10, "SELECT 1", 1, { waiting: 9, total: 9, idle: 0 });
    expect(await persistedParams()).toBeNull();
  });
});

describe("executeQuery actually passes the gauges through", () => {
  // Without this, dropping the `readPoolGauges()` argument at the single call
  // site in connection.ts leaves every test above passing while every row in
  // production silently records NULL — the column would be dead and nothing
  // would say so. Mutation-checked: removing that argument fails this test and
  // only this test.
  const savedUrl = process.env.DATABASE_URL;

  // The threshold MUST be set through `require`, not through the ESM import at
  // the top of this file: they resolve to different module instances here (the
  // ESM one read 0 while connection.ts's read 200), so setting it the obvious
  // way leaves executeQuery's copy at 200, the sub-millisecond mock query falls
  // under it, nothing is recorded — and the assertion below would fail for a
  // reason that has nothing to do with the code under test.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const live = () => require("@/lib/observability/slowQueryLog");

  beforeEach(() => {
    mockQuery.mockClear();
    process.env.DATABASE_URL = "postgresql://u:p@h:5432/d";
    live().setSlowQueryThresholdMs(0); // record every query, however fast
  });

  afterEach(() => {
    live().setSlowQueryThresholdMs(200);
    if (savedUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = savedUrl;
  });

  it("records the live pool state for a real executeQuery call", async () => {
    mockPool.waitingCount = 2;
    mockPool.totalCount = 5;
    mockPool.idleCount = 1;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { executeQuery } = require("@/lib/database/connection");

    await executeQuery("SELECT 1 FROM users", []);

    // Anti-vacuity: prove the query actually ran before trusting what was or
    // was not persisted alongside it.
    expect(mockQuery).toHaveBeenCalledWith("SELECT 1 FROM users", []);

    const params = await persistedParams();
    expect(params).not.toBeNull();
    expect(params!.slice(4)).toEqual([2, 5, 1]);
  });
});

describe("readPoolGauges", () => {
  // The real function, not a restatement of it: it runs on the hot query path,
  // so "never throws" is the property that matters and it can only be shown by
  // calling it.
  afterEach(() => {
    mockPool.waitingCount = 0;
    mockPool.totalCount = 0;
    mockPool.idleCount = 0;
    delete (mockPool as { throwOnAccess?: boolean }).throwOnAccess;
  });

  it("reads the live counters off the pool", () => {
    mockPool.waitingCount = 7;
    mockPool.totalCount = 5;
    mockPool.idleCount = 1;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { readPoolGauges } = require("@/lib/database/connection");
    expect(readPoolGauges()).toEqual({ waiting: 7, total: 5, idle: 1 });
  });

  it("reports zero as zero, not as 'unavailable'", () => {
    mockPool.waitingCount = 0;
    mockPool.totalCount = 2;
    mockPool.idleCount = 2;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { readPoolGauges } = require("@/lib/database/connection");
    const g: PoolGauges | undefined = readPoolGauges();
    expect(g).toEqual({ waiting: 0, total: 2, idle: 2 });
  });

  it("returns undefined when the pool has no counters", () => {
    // A mocked or non-pg pool. Degrade to "not measured" rather than inventing
    // a number that would read as a measurement.
    delete (mockPool as { waitingCount?: number }).waitingCount;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { readPoolGauges } = require("@/lib/database/connection");
    expect(readPoolGauges()).toBeUndefined();
    mockPool.waitingCount = 0;
  });
});
