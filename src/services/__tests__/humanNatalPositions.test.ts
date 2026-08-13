/**
 * @jest-environment node
 *
 * A human's chart must land in `natal_positions`, not only in `natal_chart`.
 *
 * `[MEASURED 2026-08-12]` against production: 71 of 71 chart-bearing AGENTS held
 * `natal_positions`; **0 of 8** chart-bearing HUMANS did. `createUser` persisted
 * `natal_chart` and `birth_data` and nothing else, while `parseNatalPositions` —
 * the function every full-chart computation goes through — reads only
 * `natal_positions`. So a human with a real birthchart produced no full-chart
 * monica at all, and nothing failed: the drift gate scans `WHERE u.is_agent`.
 *
 * Two dialects are stored in production and both are real:
 *   humans — `planets` is an ARRAY of `{ name, sign, position }` (absolute longitude)
 *   agents — `planets` is an OBJECT of `{ sign, house, degree, retrograde }`
 *            with NO absolute position; `degree` is the degree WITHIN the sign
 *
 * The converter is pinned against both, because a version that handled only the
 * human dialect returned null for all 71 agent charts.
 */

const mockWithTransaction = jest.fn();
const mockExecuteQuery = jest.fn();
jest.mock("@/lib/database", () => ({
  withTransaction: (...args: unknown[]) => mockWithTransaction(...args),
  executeQuery: (...args: unknown[]) => mockExecuteQuery(...args),
}));

import { userDatabase } from "@/services/userDatabaseService";
import {
  MIN_CHART_BODIES,
  fullChartMonica,
  natalPositionsFromStoredChart,
} from "@/utils/fullChartMonica";

/** The human dialect: absolute ecliptic longitude in `position`. */
const HUMAN_CHART = {
  planets: [
    { name: "Sun", sign: "Aries", position: 15.5 },
    { name: "Moon", sign: "Taurus", position: 42.1 },
    { name: "Mercury", sign: "Gemini", position: 73.2 },
    { name: "Venus", sign: "Cancer", position: 100.4 },
    { name: "Mars", sign: "Leo", position: 130.9 },
    { name: "Jupiter", sign: "Virgo", position: 165.3 },
  ],
};

/** The agent dialect: degree WITHIN the sign, no absolute position. */
const AGENT_CHART = {
  planets: {
    Sun: { sign: "Capricorn", house: 9, degree: 25, retrograde: false },
    Moon: { sign: "Aries", house: 1, degree: 12.5, retrograde: false },
    Mercury: { sign: "Aquarius", house: 10, degree: 3.2, retrograde: true },
    Venus: { sign: "Sagittarius", house: 8, degree: 18.8, retrograde: false },
    Mars: { sign: "Scorpio", house: 7, degree: 9.1, retrograde: false },
    Jupiter: { sign: "Pisces", house: 11, degree: 22.4, retrograde: false },
  },
};

describe("natalPositionsFromStoredChart", () => {
  it("converts the human dialect, preserving the absolute longitude", () => {
    const rows = natalPositionsFromStoredChart(HUMAN_CHART);
    expect(rows).not.toBeNull();
    expect(rows).toHaveLength(6);
    const sun = rows!.find((r) => r.planet === "Sun")!;
    expect(sun.position).toBe(15.5);
    expect(sun.sign).toBe("aries");
  });

  /**
   * The case that caught a real bug. A converter requiring an absolute position
   * dropped every body on all 71 production agent charts and returned null.
   */
  it("converts the agent dialect by deriving signIndex * 30 + degree", () => {
    const rows = natalPositionsFromStoredChart(AGENT_CHART);
    expect(rows).not.toBeNull();
    expect(rows).toHaveLength(6);
    // Capricorn is the 10th sign (index 9) => 9*30 + 25 = 295.
    const sun = rows!.find((r) => r.planet === "Sun")!;
    expect(sun.position).toBeCloseTo(295, 9);
    expect(sun.degree).toBeCloseTo(25, 9);
  });

  it("produces rows that the reader can turn into a monica", () => {
    for (const chart of [HUMAN_CHART, AGENT_CHART]) {
      const monica = fullChartMonica(natalPositionsFromStoredChart(chart));
      expect(monica).not.toBeNull();
      expect(Number.isFinite(monica!.combined)).toBe(true);
    }
  });

  it("returns null rather than a partial chart", () => {
    const short = { planets: HUMAN_CHART.planets.slice(0, MIN_CHART_BODIES - 1) };
    expect(natalPositionsFromStoredChart(short)).toBeNull();
    expect(natalPositionsFromStoredChart({})).toBeNull();
    expect(natalPositionsFromStoredChart(null)).toBeNull();
  });

  /**
   * A body with a sign but no degree must be DROPPED, not placed at 0° of that
   * sign. `parseNatalPositions` defaults `degree ?? 0`; doing that here would
   * fabricate a position, which is precisely what
   * `checkNoFabricatedNatalFields` exists to catch.
   */
  it("drops a body with no degree instead of pinning it to 0 degrees", () => {
    const rows = natalPositionsFromStoredChart({
      planets: [{ name: "Sun", sign: "Aries" }, ...HUMAN_CHART.planets.slice(1)],
    });
    expect(rows!.map((r) => r.planet)).not.toContain("Sun");
    expect(rows).toHaveLength(5);
  });

  /**
   * A zero position is indistinguishable from an unmeasured one, so it must be
   * treated as ABSENT and the body's sign+degree used — not treated as a veto
   * that discards good data. This is the 710-of-710 fabricated-zero shape.
   */
  it("falls back to sign+degree when position is a fabricated zero", () => {
    const rows = natalPositionsFromStoredChart({
      planets: {
        Sun: { sign: "Capricorn", degree: 25, longitude: 0 },
        Moon: { sign: "Aries", degree: 12.5, longitude: 0 },
        Mercury: { sign: "Aquarius", degree: 3.2, longitude: 0 },
        Venus: { sign: "Sagittarius", degree: 18.8, longitude: 0 },
        Mars: { sign: "Scorpio", degree: 9.1, longitude: 0 },
      },
    });
    expect(rows).toHaveLength(5);
    expect(rows!.find((r) => r.planet === "Sun")!.position).toBeCloseTo(295, 9);
  });

  it("never emits the fabricated longitude key", () => {
    for (const chart of [HUMAN_CHART, AGENT_CHART]) {
      for (const row of natalPositionsFromStoredChart(chart)!) {
        expect(Object.keys(row)).not.toContain("longitude");
      }
    }
  });

  it("skips bodies whose sign is not a real sign", () => {
    const rows = natalPositionsFromStoredChart({
      planets: [{ name: "Nibiru", sign: "Ophiuchus", position: 200 }, ...HUMAN_CHART.planets],
    });
    expect(rows!.map((r) => r.planet)).not.toContain("Nibiru");
  });
});

describe("createUser — persists the derived positions", () => {
  const savedDatabaseUrl = process.env.DATABASE_URL;
  beforeAll(() => {
    process.env.DATABASE_URL = "postgresql://mock:mock@localhost:5432/mock";
  });
  afterAll(() => {
    if (savedDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = savedDatabaseUrl;
  });

  async function createCapturing(natalChart: unknown): Promise<Array<{ sql: string; values: unknown[] }>> {
    const seen: Array<{ sql: string; values: unknown[] }> = [];
    const client = {
      query: jest.fn(async (sql: string, values: unknown[] = []) => {
        seen.push({ sql, values });
        return { rowCount: 1, rows: [{ id: "user-uuid" }] };
      }),
    };
    mockWithTransaction.mockImplementation(async (cb: (c: unknown) => Promise<void>) => {
      await cb(client);
    });
    mockExecuteQuery.mockResolvedValue({ rows: [] });
    await userDatabase
      .createUser({
        email: `chart-${seen.length}-${natalChart ? "y" : "n"}@example.com`,
        name: "Test Human",
        profile: { natalChart } as never,
      })
      .catch(() => undefined);
    return seen;
  }

  it("writes natal_positions derived from the chart it stores", async () => {
    const seen = await createCapturing(HUMAN_CHART);
    const profileWrite = seen.find((s) => /INSERT INTO user_profiles/i.test(s.sql));
    expect(profileWrite).toBeDefined();
    expect(profileWrite!.sql).toMatch(/natal_positions/);

    // The stored value must be the converter's output for the SAME chart — not
    // an empty array, and not some separately-derived thing.
    const written = profileWrite!.values.find(
      (v) => typeof v === "string" && v.includes('"planet"'),
    ) as string | undefined;
    expect(written).toBeDefined();
    const parsed = JSON.parse(written!);
    expect(parsed).toHaveLength(6);
    expect(parsed).toEqual(natalPositionsFromStoredChart(HUMAN_CHART));
  });

  it("writes NULL, not an empty array, when there is no usable chart", async () => {
    const seen = await createCapturing(undefined);
    const profileWrite = seen.find((s) => /INSERT INTO user_profiles/i.test(s.sql))!;
    const anyPositionsArray = profileWrite.values.find(
      (v) => typeof v === "string" && v.includes('"planet"'),
    );
    expect(anyPositionsArray).toBeUndefined();
    // jsonbOrNull turns an unusable chart into SQL NULL rather than '[]', which
    // would read as "positions present" to every non-null check.
    expect(profileWrite.values).toContain(null);
  });
});
