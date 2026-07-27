/**
 * What `agents/unified` writes into `user_profiles.natal_positions` must be what
 * `parseNatalPositions` can read back.
 *
 * The bug these pin: the route stored `formattedChart.planets` verbatim — an
 * OBJECT keyed by planet name — while every other writer (the PA sync path via
 * `/api/internal/agent-sync`, and `/api/economy/sync-debit`) stores an ARRAY of
 * `{ planet, sign, degree }`. `parseNatalPositions` begins with
 * `if (!Array.isArray(raw)) return null`, so a chart written here yielded NO
 * full-chart monica at all and every consumer skipped the row.
 *
 * `[MEASURED 2026-07-26]` on production `jsonb_typeof(natal_positions)` was
 * `array` for all 5084 rows, so no object-shaped row ever landed — the divergence
 * was latent, and there was no data to repair. What was missing was this
 * assertion: nothing tied the writer's shape to the reader's, so they drifted.
 */

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      status: init?.status ?? 200,
      json: async () => body,
    })),
  },
}));

import { calculateNatalChart } from "@/services/natalChartService";
import { executeQuery } from "@/lib/database";
import {
  MIN_CHART_BODIES,
  fullChartMonica,
  natalPositionsFromChart,
  parseNatalPositions,
  statesALongitude,
} from "@/utils/fullChartMonica";
import { POST } from "../route";

jest.mock("@/lib/database", () => ({
  executeQuery: jest.fn(),
}));
jest.mock("@/lib/auth/auth", () => ({
  auth: jest.fn(async () => ({ user: { id: "creator-uuid-0001" } })),
}));
jest.mock("@/lib/rateLimit", () => ({
  rateLimit: jest.fn(async () => ({ allowed: true })),
}));
jest.mock("@/services/natalChartService", () => ({
  calculateNatalChart: jest.fn(),
}));
// Module-scope imports of the route that the "create" path never touches.
jest.mock("@/lib/agents/persona/build-agent-context", () => ({
  buildAgentContext: jest.fn(),
}));
jest.mock("@/lib/serviceUrls", () => ({
  getServiceUrlSafe: jest.fn(() => null),
}));

/**
 * A fixed chart in the shape `calculateNatalChart` really returns: lowercase
 * signs (`normalizeSignName`), `position` as ABSOLUTE ecliptic longitude, and
 * an `Ascendant` entry alongside the ten planets.
 */
const CHART_LONGITUDES: Record<string, { sign: string; position: number }> = {
  Sun: { sign: "leo", position: 135 },
  Moon: { sign: "taurus", position: 33 },
  Mercury: { sign: "virgo", position: 152.5 },
  Venus: { sign: "cancer", position: 110 },
  Mars: { sign: "aries", position: 8 },
  Jupiter: { sign: "sagittarius", position: 265 },
  Saturn: { sign: "capricorn", position: 281 },
  Uranus: { sign: "aquarius", position: 310 },
  Neptune: { sign: "pisces", position: 340 },
  Pluto: { sign: "scorpio", position: 220 },
  Ascendant: { sign: "gemini", position: 75 },
};

const serverChart = {
  planets: Object.entries(CHART_LONGITUDES).map(([name, p]) => ({
    name,
    sign: p.sign,
    position: p.position,
  })),
  ascendant: "gemini",
  elementalBalance: { Fire: 0.4, Water: 0.3, Earth: 0.2, Air: 0.1 },
};

const CREATE_BODY = {
  action: "create",
  parameters: {
    name: "Test Agent",
    purpose: "Pin the natal_positions shape",
    // In range: the route rejects a year outside 1900-2100 outright.
    birthInfo: {
      year: 1984,
      month: 9,
      day: 17,
      hour: 12,
      minute: 0,
      latitude: 49.79,
      longitude: 8.12,
      timezone: "Europe/Berlin",
      locationName: "Bermersheim vor der Höhe",
    },
  },
};

function makeRequest(body: unknown): any {
  return {
    headers: { get: () => null },
    json: async () => body,
  } as unknown as any;
}

/** The parameter array of the `INSERT INTO user_profiles` the route just ran. */
function captureUserProfilesParams(): unknown[] {
  const call = (executeQuery as jest.Mock).mock.calls.find(([sql]: [string]) =>
    sql.includes("INSERT INTO user_profiles"),
  );
  if (!call) throw new Error("INSERT INTO user_profiles was never called");
  return call[1];
}

/** natal_positions is $6 of that INSERT — index 5. */
const NATAL_POSITIONS_PARAM = 5;
/** natal_chart is $5 — index 4. */
const NATAL_CHART_PARAM = 4;

async function createAgent(): Promise<unknown[]> {
  const res = await POST(makeRequest(CREATE_BODY));
  const data = await res.json();
  // Guard: a failed create would make every assertion below vacuous, and the
  // route reports the reason in the body — surface it rather than a bare false.
  if (data.success !== true) throw new Error(`create failed: ${JSON.stringify(data)}`);
  return captureUserProfilesParams();
}

beforeEach(() => {
  jest.clearAllMocks();
  (calculateNatalChart as jest.Mock).mockResolvedValue(serverChart);
  (executeQuery as jest.Mock).mockResolvedValue({ rows: [], rowCount: 1 });
});

describe("POST /api/agents/unified — the natal_positions it writes", () => {
  it("writes an ARRAY, not an object keyed by planet name", async () => {
    const params = await createAgent();
    const written = JSON.parse(params[NATAL_POSITIONS_PARAM] as string);

    expect(Array.isArray(written)).toBe(true);
    // Same test Postgres answers with jsonb_typeof, and the same one the
    // canonical parser applies on its first line.
    expect(written).toHaveLength(Object.keys(CHART_LONGITUDES).length);
  });

  it("round-trips through parseNatalPositions to a non-null chart", async () => {
    const params = await createAgent();
    const written = JSON.parse(params[NATAL_POSITIONS_PARAM] as string);

    const positions = parseNatalPositions(written);
    expect(positions).not.toBeNull();
    expect(Object.keys(positions!).sort()).toEqual(
      Object.keys(CHART_LONGITUDES).sort(),
    );
    // Non-vacuity: a chart this size clears the usability floor by a margin, so
    // the assertion above is not passing on a boundary.
    expect(Object.keys(positions!).length).toBeGreaterThan(MIN_CHART_BODIES);
  });

  it("yields a real full-chart monica for the row it just wrote", async () => {
    const params = await createAgent();
    const written = JSON.parse(params[NATAL_POSITIONS_PARAM] as string);

    // The consumer that the object shape silently starved: both backfill
    // (`scripts/backfillMonicaPerConstruction.ts`) and the drift check skip any
    // row whose chart parses to null.
    const monica = fullChartMonica(written);
    expect(monica).not.toBeNull();
    expect(Number.isFinite(monica!.diurnal)).toBe(true);
    expect(Number.isFinite(monica!.nocturnal)).toBe(true);
    expect(monica!.combined).toBe((monica!.diurnal + monica!.nocturnal) / 2);
  });

  it("carries the REAL absolute longitude in `position`, the key the parser reads", async () => {
    const params = await createAgent();
    const written = JSON.parse(params[NATAL_POSITIONS_PARAM] as string) as Array<
      Record<string, unknown>
    >;

    for (const row of written) {
      const expected = CHART_LONGITUDES[row.planet as string];
      expect(expected).toBeDefined();
      expect(row.sign).toBe(expected.sign);
      expect(row.position).toBe(expected.position);
      expect(row.degree).toBe(expected.position % 30);
      // `longitude` is not on this contract. The route's own chart blob uses
      // that name, and copying it here would read to the parser as no
      // longitude at all — see the parser test below for why that matters.
      expect(row.longitude).toBeUndefined();
    }
  });

  it("leaves the natal_chart blob's own shape alone", async () => {
    const params = await createAgent();
    const chart = JSON.parse(params[NATAL_CHART_PARAM] as string);

    // natal_chart is a different contract: an object keyed by planet name, read
    // by the client. Only natal_positions changed shape.
    expect(Array.isArray(chart.planets)).toBe(false);
    expect(chart.planets.Sun).toMatchObject({ sign: "leo", longitude: 135 });
  });
});

/**
 * The ascendant of the same stored blob.
 *
 * The bug these pin: `formattedChart.ascendant` came from
 * `SIGN_ORDER.indexOf(serverChart.ascendant) * 30` against a Capitalised list,
 * while every sign `calculateNatalChart` returns is lowercase
 * (`normalizeSignName`). `indexOf` was always -1, so the stored ascendant was
 * always 0 — and `flattenNatalChart` (`src/lib/mcp/synastryTools.ts:213-237`)
 * reads a numeric `ascendant` as an absolute longitude, so such a row would put an
 * Ascendant fabricated at 0° Aries into every synastry score and transit overlay
 * that read it. `midheaven` was never computed at all, yet shipped the same
 * literal 0 through the same reader.
 *
 * `[MEASURED 2026-07-26]` all 71 chart-bearing agents in production hold a
 * NON-ZERO numeric ascendant and none holds a zero midheaven, so no surviving row
 * bears this create path's signature and there is nothing to repair — the same
 * latency, and the same cause, as the shape defect above.
 */
describe("POST /api/agents/unified — the ascendant it writes", () => {
  const SIGNS = [
    "aries", "taurus", "gemini", "cancer", "leo", "virgo",
    "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
  ];

  async function storedChart(): Promise<Record<string, unknown>> {
    const params = await createAgent();
    return JSON.parse(params[NATAL_CHART_PARAM] as string);
  }

  it("stores the chart's REAL ascendant longitude", async () => {
    const chart = await storedChart();

    // 75°, the Ascendant body's own longitude. Distinguishes all three
    // candidates: 0 was the bug, 60 would be the sign-start reconstruction the
    // broken lookup was reaching for, 75 is the angle the chart actually states.
    expect(chart.ascendant).toBe(CHART_LONGITUDES.Ascendant.position);
    expect(chart.ascendant).not.toBe(0);
    expect(chart.ascendant).not.toBe(SIGNS.indexOf("gemini") * 30);
  });

  it("the stored longitude falls in the ascendant's own sign", async () => {
    const chart = await storedChart();

    // The consistency the old code could not have had: a longitude of 0 lands in
    // aries, which disagrees with every ascendant sign but one.
    const sign = SIGNS[Math.floor((chart.ascendant as number) / 30)];
    expect(sign).toBe(CHART_LONGITUDES.Ascendant.sign);
    expect(sign).toBe(serverChart.ascendant);
  });

  it("writes null, not 0, when the chart carries no Ascendant body", async () => {
    (calculateNatalChart as jest.Mock).mockResolvedValue({
      ...serverChart,
      planets: serverChart.planets.filter((p) => p.name !== "Ascendant"),
    });

    // null is skipped by flattenNatalChart; 0 would be placed at 0° Aries.
    expect((await storedChart()).ascendant).toBeNull();
  });

  it("a placeholder ascendant is absent from BOTH fields, not null in one and 0° Aries in the other", async () => {
    (calculateNatalChart as jest.Mock).mockResolvedValue({
      ...serverChart,
      planets: serverChart.planets.map((p) =>
        p.name === "Ascendant" ? { ...p, position: 0 } : p,
      ),
    });

    const params = await createAgent();
    const chart = JSON.parse(params[NATAL_CHART_PARAM] as string);
    const positions = JSON.parse(params[NATAL_POSITIONS_PARAM] as string) as Array<
      Record<string, unknown>
    >;

    // The disagreement this pins: natal_chart said "no angle" while
    // natal_positions still carried the body at position 0, where the parser
    // would hand it to alchemize as a real placement at 0° aries — with the
    // sign gemini beside it.
    expect(chart.ascendant).toBeNull();
    expect(positions.some((r) => r.planet === "Ascendant")).toBe(false);
    // The ten real planets survive, so the chart is still usable.
    expect(positions).toHaveLength(Object.keys(CHART_LONGITUDES).length - 1);
    expect(parseNatalPositions(positions)).not.toBeNull();
  });

  it("writes null for a placeholder ascendant at longitude 0", async () => {
    // What `fetchPlanetaryPositions` produces when the astrologize response has
    // no ascendant: a locally derived SIGN paired with the 0 initialiser. The
    // pair is self-contradictory — 0 is 0° aries, not 15° gemini — so the angle
    // is absent, not zero.
    (calculateNatalChart as jest.Mock).mockResolvedValue({
      ...serverChart,
      planets: serverChart.planets.map((p) =>
        p.name === "Ascendant" ? { ...p, position: 0 } : p,
      ),
    });

    expect((await storedChart()).ascendant).toBeNull();
  });

  it("omits midheaven rather than storing an MC it never computed", async () => {
    const chart = await storedChart();

    expect(chart.midheaven).toBeUndefined();
    expect("midheaven" in chart).toBe(false);
  });

  it("still records the ascendant among the planets it writes", async () => {
    // The angle survives in natal_positions too, where the parser reads it as a
    // body — so this fix does not depend on the natal_chart blob alone.
    const params = await createAgent();
    const positions = JSON.parse(params[NATAL_POSITIONS_PARAM] as string) as Array<
      Record<string, unknown>
    >;

    const ascendant = positions.find((r) => r.planet === "Ascendant");
    expect(ascendant?.position).toBe(CHART_LONGITUDES.Ascendant.position);
  });
});

describe("natalPositionsFromChart / parseNatalPositions — the contract itself", () => {
  /** The route's chart-blob shape, as `formattedChart.planets` builds it. */
  const chartPlanets = Object.fromEntries(
    Object.entries(CHART_LONGITUDES).map(([name, p]) => [
      name,
      {
        sign: p.sign,
        degree: p.position % 30,
        retrograde: false,
        longitude: p.position,
      },
    ]),
  );

  it("the OLD payload — the chart object itself — parses to null", () => {
    // The defect, stated directly. If this ever starts returning a chart, the
    // shape assertions above stop being load-bearing.
    expect(parseNatalPositions(chartPlanets)).toBeNull();
  });

  it("the encoded array parses back to every body", () => {
    const rows = natalPositionsFromChart(chartPlanets);
    const positions = parseNatalPositions(JSON.parse(JSON.stringify(rows)));

    expect(positions).not.toBeNull();
    for (const [planet, p] of Object.entries(CHART_LONGITUDES)) {
      expect(positions![planet].exactLongitude).toBe(p.position);
      expect(positions![planet].sign).toBe(p.sign);
    }
  });

  it("`position` is what the parser believes — sign and degree do not override it", () => {
    // Why the key matters. Here `position` disagrees with sign+degree; the
    // parser follows `position`. A row that named the field `longitude` instead
    // would land on the sign+degree reconstruction with no error anywhere.
    const [followed] = Object.values(
      parseNatalPositions([
        { planet: "Sun", sign: "aries", degree: 1, position: 200.25 },
        ...natalPositionsFromChart(chartPlanets).slice(1),
      ])!,
    );
    expect(followed.exactLongitude).toBe(200.25);
    expect(followed.degree).toBeCloseTo(20.25, 10);
  });

  it.each([
    ["NaN", Number.NaN],
    ["a placeholder 0", 0],
    ["Infinity", Number.POSITIVE_INFINITY],
  ])("drops a body whose longitude is %s rather than placing it at 0° of its sign", (_label, longitude) => {
    const rows = natalPositionsFromChart({
      ...chartPlanets,
      Chiron: { sign: "libra", longitude: longitude as number },
    });

    expect(rows.some((r) => r.planet === "Chiron")).toBe(false);
    expect(rows).toHaveLength(Object.keys(CHART_LONGITUDES).length);
  });

  it("statesALongitude is the one rule both writers apply", () => {
    // Single-sourced deliberately: the encoder and the route's ascendant used to
    // carry their own copy of this test, which is how the two fields of one row
    // came to disagree about the same body.
    expect(statesALongitude(135.0341)).toBe(true);
    expect(statesALongitude(-12.5)).toBe(true); // negative is still a stated angle
    expect(statesALongitude(0)).toBe(false);
    expect(statesALongitude(Number.NaN)).toBe(false);
    expect(statesALongitude(Number.POSITIVE_INFINITY)).toBe(false);
  });

  it("an empty chart encodes to [] — the literal readers already treat as absent", () => {
    // Not `{}`: every consumer's emptiness guard is
    // `natal_positions::text NOT IN ('[]', 'null', '{}')`, and jsonbOrNull
    // treats both as absent, but only `[]` is type-correct for this column.
    expect(natalPositionsFromChart({})).toEqual([]);
    expect(parseNatalPositions([])).toBeNull();
  });
});
