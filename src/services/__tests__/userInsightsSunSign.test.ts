/**
 * @jest-environment node
 *
 * The Sun Sign Distribution on /admin/users showed 0 for all twelve signs.
 *
 * The query read `natal_chart->'planetaryPositions'->'Sun'->>'sign'`, but every
 * writer stores each planet as a bare sign STRING (`{ "Sun": "leo" }`), and `->>`
 * on a jsonb string is NULL, so every row was filtered out. The real cause lives
 * in the SQL, which no Jest test can execute here (PGlite is not a project
 * dependency), so this file pins two things:
 *  - the SQL reads the value AT `Sun`, never a `.sign` field of it, and
 *  - the rows that path produces (one `bucket` per sign) fill the right slots.
 * The path was checked against the production database on 2026-11-23: of 9
 * onboarded humans 8 have `Sun` as a jsonb string; the old expression matched 0
 * and `->>'Sun'` matched all 8.
 *
 * @file src/services/__tests__/userInsightsSunSign.test.ts
 */
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

type Query = (sql: string) => Promise<{ rows: Array<Record<string, unknown>> }>;

// `mock`-prefixed so jest lets the factory close over it; read lazily at call time.
const mockExecuteQuery = jest.fn<Query>();

jest.mock("@/lib/database", () => ({
  executeQuery: (sql: string) => mockExecuteQuery(sql),
}));
jest.mock("@/lib/logger", () => ({
  _logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

import { getUserInsights, NATAL_SUN_SIGN_SQL } from "@/services/userInsightsService";

/** The aggregate that buckets onboarded humans by natal Sun sign. */
const isSunSignQuery = (sql: string): boolean => sql.includes("planetaryPositions") && sql.includes("AS bucket");

beforeEach(() => {
  mockExecuteQuery.mockReset();
});

describe("natal Sun sign SQL", () => {
  it("reads the sign string stored AT Sun, not a .sign field of it", () => {
    expect(NATAL_SUN_SIGN_SQL).toBe("LOWER(up.natal_chart->'planetaryPositions'->>'Sun')");
    expect(NATAL_SUN_SIGN_SQL).not.toContain("'sign'");
  });

  it("is the expression the Sun Sign Distribution query actually runs", async () => {
    const seen: string[] = [];
    mockExecuteQuery.mockImplementation(async (sql) => {
      seen.push(sql);
      return { rows: [] };
    });

    await getUserInsights();

    const sunSignSql = seen.find(isSunSignQuery);
    expect(sunSignSql).toBeDefined();
    // select, the NOT NULL filter and the GROUP BY must all use it
    expect(sunSignSql?.split(NATAL_SUN_SIGN_SQL)).toHaveLength(4);
    expect(sunSignSql).not.toContain("->'Sun'->>'sign'");
  });
});

describe("Sun Sign Distribution", () => {
  it("fills the twelve slots from the buckets the query returns, and keeps unseen signs at 0", async () => {
    mockExecuteQuery.mockImplementation(async (sql) =>
      isSunSignQuery(sql)
        ? {
            rows: [
              { bucket: "leo", count: 3 },
              { bucket: "aquarius", count: 1 },
            ],
          }
        : { rows: [] },
    );

    const { sunSigns } = await getUserInsights();

    expect(sunSigns).toHaveLength(12);
    expect(sunSigns.find((s) => s.sign === "Leo")?.count).toBe(3);
    expect(sunSigns.find((s) => s.sign === "Aquarius")?.count).toBe(1);
    expect(sunSigns.filter((s) => s.count === 0)).toHaveLength(10);
  });

  it("ignores a bucket that is not one of the twelve signs (a control: unchanged behaviour)", async () => {
    mockExecuteQuery.mockImplementation(async (sql) =>
      isSunSignQuery(sql) ? { rows: [{ bucket: '{"sign":"leo"}', count: 5 }] } : { rows: [] },
    );

    const { sunSigns } = await getUserInsights();

    expect(sunSigns.every((s) => s.count === 0)).toBe(true);
  });
});
