/**
 * @jest-environment node
 *
 * sync-debit's 402 counter: what is written, how it is read, and the two things a mocked
 * database cannot show (the reason list and the conflict target match the migration).
 *
 * @file src/services/__tests__/debitRefusalService.test.ts
 */
import { readFileSync } from "fs";
import { join } from "path";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const mockExecuteQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>>();
const mockLoggerError = jest.fn<(...args: unknown[]) => void>();

jest.mock("@/lib/database", () => ({
  executeQuery: (sql: string, params?: unknown[]) => mockExecuteQuery(sql, params),
}));
jest.mock("@/lib/logger", () => ({
  _logger: { error: (...a: unknown[]) => mockLoggerError(...a), warn: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

import {
  DEBIT_REFUSAL_REASONS,
  RECORD_DEBIT_REFUSAL_SQL,
  buildReport,
  clampWindowHours,
  getDebitRefusalReport,
  hourBucket,
  recordDebitRefusal,
  resetMissingTableLog,
  toDebitRefusal,
  type RefusalHourRow,
} from "@/services/debitRefusalService";

const MIGRATION = readFileSync(join(process.cwd(), "database/init/107-economy-debit-refusals.sql"), "utf8");
const NOW = Date.UTC(2026, 10, 23, 13, 41, 7, 250); // 2026-11-23T13:41:07.250Z
const HOUR_13 = "2026-11-23T13:00:00.000Z";
const EMPTY = { spirit: 0, essence: 0, matter: 0, substance: 0 };

beforeEach(() => {
  mockExecuteQuery.mockReset();
  mockExecuteQuery.mockResolvedValue({ rows: [] });
  mockLoggerError.mockReset();
  resetMissingTableLog();
});

describe("hourBucket", () => {
  it("is the whole UTC hour the moment falls in, edges included", () => {
    expect(hourBucket(Date.UTC(2026, 10, 23, 13, 0, 0, 0))).toBe(HOUR_13);
    expect(hourBucket(Date.UTC(2026, 10, 23, 13, 59, 59, 999))).toBe(HOUR_13);
    expect(hourBucket(Date.UTC(2026, 10, 23, 14, 0, 0, 0))).toBe("2026-11-23T14:00:00.000Z");
  });
});

describe("toDebitRefusal", () => {
  it("takes the shortfall from the bridge's refusal, and none when the bridge never ran", () => {
    expect(
      toDebitRefusal({ cause: "insufficient_value", balances: EMPTY, autoSwap: { shortfallValue: 4.5 } }),
    ).toEqual({ reason: "insufficient_value", balances: EMPTY, shortfallValue: 4.5 });
    expect(toDebitRefusal({ cause: "auto_swap_off", balances: EMPTY }).shortfallValue).toBeNull();
    expect(
      toDebitRefusal({ cause: "rates_unavailable", balances: EMPTY, autoSwap: { shortfallValue: null } }).shortfallValue,
    ).toBeNull();
  });
});

describe("recordDebitRefusal", () => {
  it("binds the hour, reason, empty flag, shortfall and a measured flag in that order", async () => {
    await recordDebitRefusal({ reason: "insufficient_value", balances: { ...EMPTY, spirit: 3 }, shortfallValue: 7.5 }, NOW);

    expect(mockExecuteQuery).toHaveBeenCalledTimes(1);
    expect(mockExecuteQuery).toHaveBeenCalledWith(RECORD_DEBIT_REFUSAL_SQL, [HOUR_13, "insufficient_value", 0, 7.5, 1]);
  });

  it("flags a payer holding nothing on any axis, and one holding dust on any single axis as not empty", async () => {
    await recordDebitRefusal({ reason: "insufficient_value", balances: EMPTY, shortfallValue: 1 }, NOW);
    for (const axis of ["spirit", "essence", "matter", "substance"] as const) {
      await recordDebitRefusal({ reason: "insufficient_value", balances: { ...EMPTY, [axis]: 0.0001 }, shortfallValue: 1 }, NOW);
    }

    expect(mockExecuteQuery.mock.calls.map((c) => c[1]?.[2])).toEqual([1, 0, 0, 0, 0]);
  });

  it("counts an unmeasured shortfall as 0 over 0 samples, including NaN and Infinity", async () => {
    for (const shortfallValue of [null, Number.NaN, Number.POSITIVE_INFINITY]) {
      await recordDebitRefusal({ reason: "rates_unavailable", balances: EMPTY, shortfallValue }, NOW);
    }

    expect(mockExecuteQuery.mock.calls.map((c) => c[1]?.slice(3))).toEqual([[0, 0], [0, 0], [0, 0]]);
  });

  it("never writes a negative shortfall, which the table's CHECK would refuse and so lose the refusal", async () => {
    await recordDebitRefusal({ reason: "insufficient_value", balances: EMPTY, shortfallValue: -0.25 }, NOW);

    expect(mockExecuteQuery.mock.calls[0]?.[1]?.slice(3)).toEqual([0, 1]);
  });

  it("rethrows a database error so runAfterResponse can log it", async () => {
    mockExecuteQuery.mockRejectedValueOnce(Object.assign(new Error("connection reset"), { code: "08006" }));

    await expect(recordDebitRefusal({ reason: "lost_race", balances: EMPTY, shortfallValue: null }, NOW)).rejects.toThrow(
      "connection reset",
    );
  });

  it("logs a missing table once per process, as an error, and keeps counting after it exists", async () => {
    const missing = Object.assign(new Error('relation "economy_debit_refusals" does not exist'), { code: "42P01" });
    mockExecuteQuery.mockRejectedValue(missing);
    const refusal = { reason: "auto_swap_off" as const, balances: EMPTY, shortfallValue: null };

    await recordDebitRefusal(refusal, NOW);
    await recordDebitRefusal(refusal, NOW);

    expect(mockLoggerError).toHaveBeenCalledTimes(1);
    expect(String(mockLoggerError.mock.calls[0]?.[0])).toContain("migration 107");

    mockExecuteQuery.mockResolvedValue({ rows: [] });
    await recordDebitRefusal(refusal, NOW);
    expect(mockExecuteQuery).toHaveBeenCalledTimes(3);
    expect(mockLoggerError).toHaveBeenCalledTimes(1);
  });
});

describe("the writer and the migration agree (what a mocked database cannot check)", () => {
  it("lists exactly the reasons the table's CHECK allows", () => {
    const check = /reason IN \(([^)]*)\)/.exec(MIGRATION);
    const inTable = [...(check?.[1] ?? "").matchAll(/'([a-z_]+)'/g)].map((m) => m[1]);

    expect(inTable).toHaveLength(DEBIT_REFUSAL_REASONS.length);
    expect([...inTable].sort()).toEqual([...DEBIT_REFUSAL_REASONS].sort());
  });

  it("upserts on the primary key the table declares", () => {
    const pk = /PRIMARY KEY \(([^)]*)\)/.exec(MIGRATION)?.[1];
    const conflict = /ON CONFLICT \(([^)]*)\)/.exec(RECORD_DEBIT_REFUSAL_SQL)?.[1];

    expect(pk).toBe("hour, reason");
    expect(conflict).toBe(pk);
  });

  it("writes every column the table counts, with the table's defaults covering the rest", () => {
    const insertColumns = /INSERT INTO economy_debit_refusals\s*\(([^)]*)\)/.exec(RECORD_DEBIT_REFUSAL_SQL)?.[1] ?? "";

    for (const column of ["hour", "reason", "refusals", "empty_basket", "shortfall_value_sum", "shortfall_value_n"]) {
      expect(insertColumns).toContain(column);
      expect(MIGRATION).toContain(`${column} `);
    }
  });
});

describe("buildReport", () => {
  const rows: RefusalHourRow[] = [
    { hour: "2026-11-23T12:00:00.000Z", reason: "insufficient_value", refusals: 10, empty_basket: 4, shortfall_value_sum: 30, shortfall_value_n: 10 },
    { hour: "2026-11-23T12:00:00.000Z", reason: "auto_swap_off", refusals: 2, empty_basket: 0, shortfall_value_sum: 0, shortfall_value_n: 0 },
    { hour: new Date("2026-11-23T13:00:00.000Z"), reason: "insufficient_value", refusals: 5, empty_basket: 5, shortfall_value_sum: 5, shortfall_value_n: 4 },
  ];

  it("totals by reason, most refused first, with a mean over only the refusals that had a shortfall", () => {
    const report = buildReport(rows, "2026-11-23T12:00:00.000Z", 168, NOW);

    expect(report.byReason).toEqual([
      { reason: "insufficient_value", refusals: 15, emptyBasket: 9, meanShortfallValue: 35 / 14, shortfallKnown: 14 },
      { reason: "auto_swap_off", refusals: 2, emptyBasket: 0, meanShortfallValue: null, shortfallKnown: 0 },
    ]);
    expect(report).toMatchObject({ live: true, note: null, total: 17, emptyBasket: 9, windowHours: 168 });
  });

  it("breaks a tie between reasons by name, so the order does not depend on the database's row order", () => {
    const tied = (reason: string): RefusalHourRow => ({
      hour: "2026-11-23T12:00:00.000Z", reason, refusals: 4, empty_basket: 0, shortfall_value_sum: 0, shortfall_value_n: 0,
    });

    expect(buildReport([tied("rates_unavailable"), tied("auto_swap_off"), tied("lost_race")], null, 24, NOW).byReason.map((r) => r.reason)).toEqual([
      "auto_swap_off",
      "lost_race",
      "rates_unavailable",
    ]);
  });

  it("sums the reasons within an hour, oldest hour first, whether the driver gave a Date or a string", () => {
    expect(buildReport([...rows].reverse(), null, 24, NOW).byHour).toEqual([
      { hour: "2026-11-23T12:00:00.000Z", refusals: 12, emptyBasket: 4 },
      { hour: "2026-11-23T13:00:00.000Z", refusals: 5, emptyBasket: 5 },
    ]);
  });

  it("names when counting began, and reports none rather than a date when nothing was ever recorded", () => {
    expect(buildReport(rows, new Date("2026-11-22T20:00:00.000Z"), 168, NOW).recordingSince).toBe("2026-11-22T20:00:00.000Z");
    expect(buildReport([], null, 168, NOW)).toMatchObject({ live: true, recordingSince: null, total: 0, byReason: [], byHour: [] });
  });
});

describe("clampWindowHours", () => {
  it("keeps a whole number of hours in [1, 720] and falls back to a week for anything unusable", () => {
    expect([clampWindowHours(24), clampWindowHours(0), clampWindowHours(-5), clampWindowHours(99_999), clampWindowHours(36.9)]).toEqual([
      24, 1, 1, 720, 36,
    ]);
    expect([clampWindowHours(null), clampWindowHours(undefined), clampWindowHours(Number.NaN)]).toEqual([168, 168, 168]);
  });
});

describe("getDebitRefusalReport", () => {
  it("reads from the start of the oldest hour in the window, so a 24 h window is exactly 24 whole hours", async () => {
    mockExecuteQuery.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [{ first_hour: null }] });

    await getDebitRefusalReport(24, NOW);

    expect(mockExecuteQuery.mock.calls[0]?.[1]).toEqual(["2026-11-22T14:00:00.000Z"]);
  });

  it("a table with no refusals is live and empty; an unreadable table is not live (the two must differ)", async () => {
    mockExecuteQuery.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [{ first_hour: null }] });
    const quiet = await getDebitRefusalReport(24, NOW);

    mockExecuteQuery.mockReset();
    mockExecuteQuery.mockRejectedValue(Object.assign(new Error("boom"), { code: "57P01" }));
    const unreadable = await getDebitRefusalReport(24, NOW);

    expect(quiet).toMatchObject({ live: true, note: null, total: 0 });
    expect(unreadable).toMatchObject({ live: false, total: 0 });
    expect(unreadable.note).toContain("server log");
    expect(mockLoggerError).toHaveBeenCalledTimes(1);
  });

  it("says migration 107 has not run when the table is missing, without logging an error for it", async () => {
    mockExecuteQuery.mockRejectedValue(Object.assign(new Error("no such table"), { code: "42P01" }));

    const report = await getDebitRefusalReport(24, NOW);

    expect(report.live).toBe(false);
    expect(report.note).toContain("migration 107");
    expect(mockLoggerError).not.toHaveBeenCalled();
  });
});
