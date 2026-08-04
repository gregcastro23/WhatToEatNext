/**
 * ESMS 2.0 — Layer 3 (aspects) vs Layer 2 (essential dignity) commensurability.
 *
 * RULED 2026-08-03, λ = 1: the aspect layer is ratified AS MEASURED. A typical
 * aspect is worth about one dignity FOLD; an exceptional one about a full
 * dignity STACK. No global rescale is applied, because measurement showed the
 * relationship the ruling wanted already holds — see the BASIS block in
 * `src/utils/aspectESMSEffects.ts`.
 *
 * This suite is the enforcement half of that ruling. It exists because the
 * relationship is EMERGENT — it is not written down in any constant. Layer 2 is
 * a per-planet MULTIPLIER (𝒟 = 1 + score/50) and Layer 3 is an ADDITIVE term
 * from a hand-authored per-pair table; nothing structurally ties them together,
 * so either side can drift out of commensurability without a single test
 * failing anywhere else in the repo.
 *
 * The pinned quantity is a distributional relationship between two layers, not
 * a float, so the bounds are ranges rather than a `toBeCloseTo` that would fail
 * on an innocuous ephemeris bump. They are nonetheless tight enough to fail the
 * ×2 / ÷2 class of change that actually moves the economy — VERIFIED by
 * mutation: doubling every value in the effect tables (Scenario B, λ=2.0012,
 * measured at 10.98pp of share movement) fails this suite. An earlier, wider
 * set of bounds passed that mutation, which is the whole reason these are
 * stated as measured-ratio ± a margin rather than as round numbers.
 */

import { calculateAlchemicalFromPlanetsDetailed } from "@/utils/planetaryAlchemyMapping";
import { buildAspectsWithStrength } from "@/utils/aspectCalculator";
import { getAspectESMSEffect, PLANET_PAIR_ASPECT_EFFECTS } from "@/utils/aspectESMSEffects";
import {
  getAccuratePlanetaryPositions,
  isCurrentSkyDiurnal,
} from "@/utils/astrology/positions";
import { DIGNITY_POINTS, DIGNITY_SCORE_DIVISOR } from "@/calculations/dignityManifest";
import golden from "../../backend/tests/aspect_effects_golden.json";

const AXES = ["Spirit", "Essence", "Matter", "Substance"] as const;

/** The measured ceiling of the summed 5-fold dignity score: Mercury 0°–7° Virgo
 *  (domicile +5, exaltation +4, term +2). See DIGNITY_SCORE_DIVISOR's docs. */
const FULL_STACK_POINTS = 11;

/**
 * A fixed, deterministic spread of skies. Fixed so the suite cannot go green or
 * red on the wall clock, and spread so the statistics are not read off one
 * accidental configuration.
 */
const SAMPLE_SKIES: Date[] = [];
for (let year = 1970; year <= 2025; year += 5) {
  for (const month of [0, 3, 6, 9]) {
    SAMPLE_SKIES.push(new Date(Date.UTC(year, month, 15, 12, 0, 0)));
  }
}

interface Measured {
  perAspectGross: number[];
  meanPlanetContribution: number;
  worstAdditivityResidual: number;
}

function measure(): Measured {
  const perAspectGross: number[] = [];
  const planetContributions: number[] = [];
  let worstAdditivityResidual = 0;

  for (const when of SAMPLE_SKIES) {
    const positions = getAccuratePlanetaryPositions(when);
    const detailed = calculateAlchemicalFromPlanetsDetailed(
      positions as never,
      isCurrentSkyDiurnal(when),
    );

    for (const axis of AXES) {
      const summed =
        Object.values(detailed.perPlanet).reduce(
          (acc: number, p: { esms: Record<string, number> }) => acc + p.esms[axis],
          0,
        ) + detailed.aspectModifications[axis];
      worstAdditivityResidual = Math.max(
        worstAdditivityResidual,
        Math.abs(summed - detailed.totals[axis]),
      );
    }

    for (const p of Object.values(detailed.perPlanet) as Array<{
      esms: Record<string, number>;
    }>) {
      planetContributions.push(AXES.reduce((s, k) => s + p.esms[k], 0));
    }

    const rich = Object.fromEntries(
      Object.entries(positions).filter(
        ([, p]) => typeof p === "object" && p !== null,
      ),
    );
    for (const a of buildAspectsWithStrength(rich as never)) {
      const effect = getAspectESMSEffect(a.planet1, a.planet2, a.type);
      if (!effect) continue;
      const gross =
        AXES.reduce((s, k) => s + Math.abs((effect as Record<string, number>)[k]), 0) *
        (a.strength ?? 1);
      perAspectGross.push(gross);
    }
  }

  return {
    perAspectGross: perAspectGross.sort((x, y) => x - y),
    meanPlanetContribution:
      planetContributions.reduce((x, y) => x + y, 0) / planetContributions.length,
    worstAdditivityResidual,
  };
}

const m = measure();
const percentile = (q: number): number =>
  m.perAspectGross[Math.floor(q * (m.perAspectGross.length - 1))];

// Anchors are DERIVED here from the manifest's own constants and the measured
// mean planet contribution — never hardcoded from a previous print, so the
// numbers round-trip from their basis rather than from a transcript.
const foldAnchor =
  m.meanPlanetContribution * (DIGNITY_POINTS.domicile / DIGNITY_SCORE_DIVISOR);
const stackAnchor =
  m.meanPlanetContribution * (FULL_STACK_POINTS / DIGNITY_SCORE_DIVISOR);

describe("Layer 3 ↔ Layer 2 commensurability (RULED λ=1, 2026-08-03)", () => {
  it("decomposes additively — Σ per-planet + aspect mods === totals", () => {
    // Guards the premise of every ratio below. If the layers do not sum to the
    // total, the "aspect share" being measured is not the aspect layer.
    expect(m.worstAdditivityResidual).toBeLessThan(1e-9);
  });

  it("samples enough geometry to be distributional", () => {
    expect(SAMPLE_SKIES.length).toBe(48);
    expect(m.perAspectGross.length).toBeGreaterThan(1000);
    expect(m.meanPlanetContribution).toBeGreaterThan(0);
  });

  it("prices a TYPICAL aspect at roughly one dignity FOLD", () => {
    // MEASURED 2026-08-03: p50 = 0.0352 = 0.75× the fold anchor.
    // Upper bound sits below the 1.51 a doubled aspect layer would produce.
    const ratio = percentile(0.5) / foldAnchor;
    expect(ratio).toBeGreaterThan(0.5);
    expect(ratio).toBeLessThan(1.2);
  });

  it("prices an EXCEPTIONAL aspect at roughly one full dignity STACK", () => {
    // MEASURED 2026-08-03: p90 = 0.1000 = 0.97× the stack anchor.
    // Upper bound sits below the 1.94 a doubled aspect layer would produce.
    const ratio = percentile(0.9) / stackAnchor;
    expect(ratio).toBeGreaterThan(0.7);
    expect(ratio).toBeLessThan(1.4);
  });

  it("keeps the mean aspect below the full-stack ceiling", () => {
    // The ruling in one line: a typical aspect lives in the interval the
    // dignity layer defines, and does not reach the ceiling a single planet's
    // maximum dignity stack sets. MEASURED mean = 0.0514 (fold 0.0468,
    // stack 0.1029); a doubled layer means 0.1028 and breaches this.
    const mean =
      m.perAspectGross.reduce((x, y) => x + y, 0) / m.perAspectGross.length;
    expect(mean).toBeGreaterThan(foldAnchor * 0.7);
    expect(mean).toBeLessThan(stackAnchor * 0.8);
  });

  it("holds the whole aspect layer to a minority of the chart", () => {
    // Layer 3 gross was 25.8% of the Layer 1×2 total when ruled. A layer that
    // grew to dominate the chart would be a different physics model, whatever
    // the per-aspect ratios said.
    const grossPerChart =
      m.perAspectGross.reduce((x, y) => x + y, 0) / SAMPLE_SKIES.length;
    const chartTotal = m.meanPlanetContribution * 11; // 11 bodies incl. Ascendant
    expect(grossPerChart / chartTotal).toBeLessThan(0.5);
  });
});

describe("Layer 3 cross-runtime parity (TS half)", () => {
  // The Python half is backend/tests/test_aspect_effects_parity.py. Both read
  // backend/tests/aspect_effects_golden.json, so a one-sided edit to either
  // table fails on that side rather than drifting silently.
  const tables = golden.tables as Record<string, Record<string, number[]>>;

  it("reproduces every authored planet-pair table", () => {
    for (const [pair, byType] of Object.entries(tables)) {
      if (pair === "__DEFAULT__") continue;
      const [a, b] = pair.split("-");
      for (const [type, expected] of Object.entries(byType)) {
        const effect = getAspectESMSEffect(a, b, type as never) as Record<string, number>;
        expect(AXES.map((k) => effect[k])).toEqual(expected);
      }
    }
  });

  it("reproduces the DEFAULT fallback table for unauthored pairs", () => {
    for (const [type, expected] of Object.entries(tables.__DEFAULT__)) {
      const effect = getAspectESMSEffect("Uranus", "Neptune", type as never) as Record<
        string,
        number
      >;
      expect(AXES.map((k) => effect[k])).toEqual(expected);
    }
  });

  it("authors exactly the pairs the golden records", () => {
    // Catches an ADDED pair table, which the per-pair loop above cannot see.
    const authored = Object.keys(PLANET_PAIR_ASPECT_EFFECTS).sort();
    const expected = Object.keys(tables)
      .filter((k) => k !== "__DEFAULT__")
      .sort();
    expect(authored).toEqual(expected);
  });

  it("pins the dignity anchors the ruling is stated against", () => {
    expect(golden.dignityAnchors.domicileFoldPoints).toBe(DIGNITY_POINTS.domicile);
    expect(golden.dignityAnchors.fullStackPoints).toBe(FULL_STACK_POINTS);
    expect(golden.dignityAnchors.dignityScoreDivisor).toBe(DIGNITY_SCORE_DIVISOR);
  });
});
