/**
 * A bare numeric Ascendant is REFUSED by every reader, because a scalar cannot
 * state its unit.
 *
 * ── What this exists to prevent ─────────────────────────────────────────────
 *
 * Readers used to take `natal_chart.ascendant` as an absolute ecliptic
 * longitude:
 *
 *   `flattenNatalChart`  (src/lib/mcp/synastryTools.ts) — sign = SIGNS[n / 30]
 *
 * `[MEASURED 2026-07-29]` all 71 production charts carrying a numeric ascendant
 * stored a DEGREE WITHIN A SIGN, not a longitude. The proof was one chart's own
 * stored aspect: `Greg Castro` holds `Sun sextile Ascendant, orb 0.65, exact`,
 * with Sun at Cancer 1.63° (91.63° absolute) and `ascendant: 0.98`.
 *
 *   read as a longitude   →  separation 90.65°  (a SQUARE)  orb error 30.65°
 *   read as Taurus 0.98°  →  separation 60.65°              orb error  0.65°  ✓
 *   read as Virgo  0.98°  →  separation 59.35°              orb error  0.65°  ✓
 *
 * Only the degree-within-sign reading reproduces the stored orb. So the readers
 * were assigning the wrong SIGN — and the sign is the dominant lever on monica
 * (±37-43%), while sub-degree precision is noise (0.98° vs 1.0° differ by 1.5e-7).
 *
 * The fabricated values are purged and the writer emits `{ sign, degree }`. These
 * tests pin the refusal, so a future reader cannot quietly start interpreting a
 * scalar again.
 */
import { computeSynastryOverlay, type NatalChartInput, type NatalPlanetInput } from "@/lib/mcp/synastryTools";

const makeChart = (ascendant?: number | NatalPlanetInput): NatalChartInput => ({
  planets: {
    Sun: { sign: "Cancer", degree: 1.63 },
    Moon: { sign: "Leo", degree: 10 },
    Mercury: { sign: "Cancer", degree: 5 },
    Venus: { sign: "Gemini", degree: 20 },
    Mars: { sign: "Aries", degree: 3 },
  },
  ascendant,
});

const partnerChart: NatalChartInput = {
  planets: {
    Sun: { sign: "Cancer", degree: 1.63 },
    Mars: { sign: "Taurus", degree: 0.98 },
  },
};

const FOCUS_PLANETS = ["Sun", "Mars", "Ascendant"];

describe("a bare numeric Ascendant is not interpreted (§18k)", () => {
  it("computeSynastryOverlay reads the { sign, degree } form", async () => {
    // With Taurus 0.98° Ascendant, it forms a conjunction with partner's Taurus 0.98° Mars
    const result = await computeSynastryOverlay({
      agentA: { id: "agent-a", natalChart: makeChart({ sign: "Taurus", degree: 0.98 }) },
      agentB: { id: "agent-b", natalChart: partnerChart },
      focusPlanets: FOCUS_PLANETS,
      cacheStrategy: "bypass",
    });

    expect(result.ok).toBe(true);
    const ascAspect = result.data?.interchartAspects.find(
      (asp) => asp.planetA === "Ascendant" || asp.planetB === "Ascendant",
    );
    expect(ascAspect).toBeDefined();
    expect(ascAspect?.type).toBe("conjunction");
    expect(ascAspect?.orb).toBeCloseTo(0, 1);
  });

  it("computeSynastryOverlay REFUSES a bare number — it is indistinguishable from absent", async () => {
    const bareResult = await computeSynastryOverlay({
      agentA: { id: "agent-a", natalChart: makeChart(0.98) },
      agentB: { id: "agent-b", natalChart: partnerChart },
      focusPlanets: FOCUS_PLANETS,
      cacheStrategy: "bypass",
    });

    const absentResult = await computeSynastryOverlay({
      agentA: { id: "agent-a", natalChart: makeChart(undefined) },
      agentB: { id: "agent-b", natalChart: partnerChart },
      focusPlanets: FOCUS_PLANETS,
      cacheStrategy: "bypass",
    });

    expect(bareResult.ok).toBe(true);
    expect(absentResult.ok).toBe(true);

    const bareAscAspect = bareResult.data?.interchartAspects.find(
      (asp) => asp.planetA === "Ascendant" || asp.planetB === "Ascendant",
    );
    const absentAscAspect = absentResult.data?.interchartAspects.find(
      (asp) => asp.planetA === "Ascendant" || asp.planetB === "Ascendant",
    );

    expect(bareAscAspect).toBeUndefined();
    expect(absentAscAspect).toBeUndefined();
    expect(bareResult.data?.scores.aspectCount).toBe(absentResult.data?.scores.aspectCount);
  });

  it("an unrecognised sign falls back rather than throwing", async () => {
    const bogusResult = await computeSynastryOverlay({
      agentA: { id: "agent-a", natalChart: makeChart({ sign: "Ophiuchus", degree: 12 }) },
      agentB: { id: "agent-b", natalChart: partnerChart },
      focusPlanets: FOCUS_PLANETS,
      cacheStrategy: "bypass",
    });
    expect(bogusResult.ok).toBe(true);
    const bogusAsc = bogusResult.data?.interchartAspects.find(
      (asp) => asp.planetA === "Ascendant" || asp.planetB === "Ascendant",
    );
    expect(bogusAsc).toBeUndefined();
  });
});
