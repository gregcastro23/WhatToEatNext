/**
 * The dead `longitude` key on `natal_positions`, and the ingest boundary that
 * removes it.
 *
 * ── The defect ──────────────────────────────────────────────────────────────
 *
 * `[MEASURED 2026-07-26 on production]` `longitude` was present on **710 of 710**
 * stored bodies across all 71 chart-bearing agents, and `0` was its **only
 * distinct value**. Its origin is upstream, in the agent-authoring repo:
 *
 *     longitude: data?.longitude ?? data?.degrees ?? 0
 *
 * over objects carrying `{ sign, degree, retrograde, house }` — neither
 * `longitude` nor `degrees` exists on them, so the chain reaches the literal `0`
 * every time. A fabricated literal standing in for an absent measurement, which
 * is the exact class this programme exists to remove.
 *
 * ── Why it is actively harmful, not merely redundant ────────────────────────
 *
 * `0` is not nullish, so a `p.position ?? p.longitude ?? …` chain STOPS at the
 * zero and never reaches `degree`. An earlier audit was written that way and
 * "found" 71 identical all-zero charts. That was false — the real data was in
 * `sign` + `degree` the whole time.
 *
 * These tests pin BOTH halves: that the canonical parser never consults the key
 * (so removing it is a no-op for monica), and that the normaliser removes it.
 */
import {
  MIN_CHART_BODIES,
  fullChartMonica,
  normaliseNatalPositions,
  parseNatalPositions,
} from "@/utils/fullChartMonica";

/** A real stored chart, shape-exact: Adam Smith, as held in production. */
const STORED_CHART = [
  { planet: "Sun", sign: "Gemini", degree: 25.0, longitude: 0 },
  { planet: "Moon", sign: "Pisces", degree: 11.4, longitude: 0 },
  { planet: "Mercury", sign: "Aquarius", degree: 20.3, longitude: 0 },
  { planet: "Venus", sign: "Gemini", degree: 5.3, longitude: 0 },
  { planet: "Mars", sign: "Taurus", degree: 22.0, longitude: 0 },
  { planet: "Jupiter", sign: "Virgo", degree: 6.5, longitude: 0 },
  { planet: "Saturn", sign: "Libra", degree: 8.1, longitude: 0 },
  { planet: "Uranus", sign: "Scorpio", degree: 6.7, longitude: 0 },
  { planet: "Neptune", sign: "Scorpio", degree: 12.9, longitude: 0 },
  { planet: "Pluto", sign: "Capricorn", degree: 18.2, longitude: 0 },
];

describe("natal_positions — the dead longitude key", () => {
  it("CONTROL: the fixture is the real shape and is actually parseable", () => {
    // Without this control, every assertion below could pass against a fixture
    // the parser rejects outright — a green suite proving nothing.
    expect(STORED_CHART).toHaveLength(10);
    expect(STORED_CHART.every((b) => "longitude" in b)).toBe(true);
    expect(new Set(STORED_CHART.map((b) => b.longitude))).toEqual(new Set([0]));
    expect(Object.keys(parseNatalPositions(STORED_CHART) ?? {})).toHaveLength(10);
  });

  it("the canonical parser derives longitude from sign+degree, never from the key", () => {
    const parsed = parseNatalPositions(STORED_CHART)!;
    // Gemini is the 3rd sign (index 2) -> 2*30 + 25.0 = 85.0. If the parser had
    // read the stored `longitude`, this would be 0.
    expect(parsed.Sun.exactLongitude).toBe(85);
    expect(parsed.Mars.exactLongitude).toBe(52); // Taurus (1) -> 30 + 22.0
    expect(Object.values(parsed).every((p) => p.exactLongitude !== 0)).toBe(true);
  });

  it("removing the key changes NOTHING about the resulting monica", () => {
    // This is the reader-tolerance proof for the production write: the stored
    // rows may lose the key without any monica moving.
    const stripped = normaliseNatalPositions(STORED_CHART);
    expect(JSON.stringify(parseNatalPositions(stripped))).toBe(
      JSON.stringify(parseNatalPositions(STORED_CHART)),
    );

    const before = fullChartMonica(STORED_CHART)!;
    const after = fullChartMonica(stripped)!;
    expect(after.diurnal).toBe(before.diurnal); // === , not toBeCloseTo
    expect(after.nocturnal).toBe(before.nocturnal);
    expect(after.combined).toBe(before.combined);
  });

  it("strips the fabricated zero, leaving the rest of the body untouched", () => {
    const out = normaliseNatalPositions(STORED_CHART) as Array<
      Record<string, unknown>
    >;
    expect(out.some((b) => "longitude" in b)).toBe(false);
    expect(out[0]).toEqual({ planet: "Sun", sign: "Gemini", degree: 25.0 });
  });

  it("promotes a REAL longitude to `position` rather than discarding it", () => {
    // No stored row takes this branch today (all 710 are 0). It exists so that
    // fixing the upstream producer improves the data instead of being silently
    // thrown away by a blanket delete.
    const [row] = normaliseNatalPositions([
      { planet: "Sun", sign: "Gemini", degree: 25.0, longitude: 85.0 },
    ]) as Array<Record<string, unknown>>;
    expect(row).toEqual({ planet: "Sun", sign: "Gemini", degree: 25.0, position: 85.0 });
    expect(parseNatalPositions([row, ...STORED_CHART.slice(1)])!.Sun.exactLongitude).toBe(85);
  });

  it("never lets a stray longitude overwrite an existing `position`", () => {
    const [row] = normaliseNatalPositions([
      { planet: "Sun", sign: "Gemini", degree: 25.0, position: 85.0, longitude: 999 },
    ]) as Array<Record<string, unknown>>;
    expect(row.position).toBe(85.0);
    expect("longitude" in row).toBe(false);
  });

  it("is a total function — passes through anything that is not a body array", () => {
    // The column holds `[]` for 5013 of 5084 production rows, and the ingest
    // payload is unvalidated JSON from another repo. A throw here would be a
    // 500 on the sync path.
    expect(normaliseNatalPositions([])).toEqual([]);
    expect(normaliseNatalPositions(null)).toBeNull();
    expect(normaliseNatalPositions(undefined)).toBeUndefined();
    expect(normaliseNatalPositions({ Sun: { sign: "Gemini" } })).toEqual({
      Sun: { sign: "Gemini" },
    });
    expect(normaliseNatalPositions([null, 7, "x"])).toEqual([null, 7, "x"]);
  });

  it("a non-finite longitude is treated as fabrication, not as data", () => {
    const out = normaliseNatalPositions([
      { planet: "Sun", sign: "Gemini", degree: 25.0, longitude: Number.NaN },
      { planet: "Moon", sign: "Pisces", degree: 11.4, longitude: null },
    ]) as Array<Record<string, unknown>>;
    expect(out.every((b) => !("longitude" in b) && !("position" in b))).toBe(true);
  });

  it("MIN_CHART_BODIES still gates a chart stripped of the key", () => {
    // Stripping must not accidentally make a too-small chart look usable.
    const short = normaliseNatalPositions(STORED_CHART.slice(0, MIN_CHART_BODIES - 1));
    expect(parseNatalPositions(short)).toBeNull();
  });
});
