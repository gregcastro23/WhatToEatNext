/**
 * @jest-environment node
 *
 * The per-instance cap on admin analytics queries (adminQueryLimiter.ts), and a
 * witness that the two services that fan out the most go through it.
 *
 * The harness HOLDS every query open until the test settles it. A mock that
 * resolves at once can never show queueing: it would pass with no limiter at all.
 *
 * @file src/services/admin/__tests__/adminQueryLimiter.test.ts
 */
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

interface FakeResult {
  command: string;
  rowCount: number;
  oid: number;
  fields: never[];
  rows: Record<string, unknown>[];
}

interface Gate {
  settle: (failure: Error | null) => void;
}

const EMPTY: FakeResult = { command: "SELECT", rowCount: 0, oid: 0, fields: [], rows: [] };

// `mock`-prefixed so jest lets the factory close over them; read lazily at call time.
const mockExecuteQuery = jest.fn<(...args: unknown[]) => Promise<FakeResult>>();
const mockGates: Gate[] = [];
const mockStartedSql: string[] = [];
let mockInFlight = 0;
let mockPeak = 0;

jest.mock("@/lib/database/connection", () => ({
  executeQuery: (...args: unknown[]) => mockExecuteQuery(...args),
}));

import {
  ADMIN_ANALYTICS_QUERY_CONCURRENCY,
  executeAdminAnalyticsQuery,
} from "@/services/admin/adminQueryLimiter";
import { getTrafficSummary } from "@/services/admin/trafficAnalyticsService";
import { getUserGrowth } from "@/services/admin/userGrowthService";

const flush = (): Promise<void> => new Promise((resolve) => setImmediate(resolve));

/** Settle one held query per turn, oldest first, until `work` finishes. */
async function settleAll<T>(work: Promise<T>): Promise<T> {
  let done = false;
  const tracked = work.finally(() => {
    done = true;
  });
  for (let turn = 0; turn < 2000 && !done; turn += 1) {
    await flush();
    mockGates.shift()?.settle(null);
  }
  expect(done).toBe(true);
  return tracked;
}

beforeEach(() => {
  mockExecuteQuery.mockReset();
  mockGates.length = 0;
  mockStartedSql.length = 0;
  mockInFlight = 0;
  mockPeak = 0;
  mockExecuteQuery.mockImplementation((...args) => {
    mockStartedSql.push(String(args[0]));
    mockInFlight += 1;
    mockPeak = Math.max(mockPeak, mockInFlight);
    return new Promise<FakeResult>((resolve, reject) => {
      mockGates.push({
        settle: (failure) => {
          mockInFlight -= 1;
          if (failure) reject(failure);
          else resolve(EMPTY);
        },
      });
    });
  });
});

describe("executeAdminAnalyticsQuery", () => {
  it("pins the cap at 2", () => {
    expect(ADMIN_ANALYTICS_QUERY_CONCURRENCY).toBe(2);
  });

  it("never runs more than 2 at once, starts the rest in order as slots free, and finishes all 19", async () => {
    const sqls = Array.from({ length: 19 }, (_, i) => `SELECT ${i}`);
    const all = Promise.all(sqls.map((sql) => executeAdminAnalyticsQuery(sql)));
    await flush();
    expect(mockInFlight).toBe(2);
    expect(mockStartedSql).toEqual(["SELECT 0", "SELECT 1"]); // the other 17 are queued, not started

    await settleAll(all);
    expect(mockPeak).toBe(2);
    expect(mockStartedSql).toEqual(sqls);
  });

  it("frees the slot when a query rejects, and the caller still sees the rejection", async () => {
    const boom = new Error("boom");
    const settled = Promise.allSettled(
      ["SELECT a", "SELECT b", "SELECT c", "SELECT d"].map((sql) => executeAdminAnalyticsQuery(sql)),
    );
    await flush();
    expect(mockStartedSql).toEqual(["SELECT a", "SELECT b"]);

    mockGates.shift()?.settle(boom);
    await flush();
    expect(mockStartedSql).toContain("SELECT c"); // the rejected query's slot went to the next waiter

    const results = await settleAll(settled);
    expect(results[0]).toEqual({ status: "rejected", reason: boom });
    expect(results.slice(1).map((r) => r.status)).toEqual(["fulfilled", "fulfilled", "fulfilled"]);
    expect(mockPeak).toBe(2);
  });

  it("forwards exactly the arguments it was given, filling in no defaults", async () => {
    const both = Promise.all([
      executeAdminAnalyticsQuery("SELECT 1"),
      executeAdminAnalyticsQuery("SELECT 2", [7], { logQuery: false }),
    ]);
    await flush();
    expect(mockExecuteQuery.mock.calls[0]).toEqual(["SELECT 1"]);
    expect(mockExecuteQuery.mock.calls[1]).toEqual(["SELECT 2", [7], { logQuery: false }]);
    await settleAll(both);
  });

  it("hands back the driver's result untouched", async () => {
    const result = await settleAll(executeAdminAnalyticsQuery("SELECT 1"));
    expect(result).toBe(EMPTY);
  });
});

describe("the services that fan out the most go through the cap", () => {
  it("/admin/traffic: every query of getTrafficSummary runs two at a time and the summary completes", async () => {
    const summary = await settleAll(getTrafficSummary("24h"));
    expect(mockStartedSql.length).toBeGreaterThanOrEqual(19);
    expect(mockPeak).toBe(2);
    expect(summary.status).toBe("live");
  });

  it("/admin/growth: every query of getUserGrowth runs two at a time and the payload completes", async () => {
    const growth = await settleAll(getUserGrowth());
    expect(mockStartedSql.length).toBeGreaterThanOrEqual(9);
    expect(mockPeak).toBe(2);
    expect(growth.live).toBe(true);
  });
});
