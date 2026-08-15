/**
 * The A-number distribution — the measured basis for A_NUMBER_CENTER /
 * A_NUMBER_SPREAD (ADR-012).
 *
 * The global cost multiplier is `1 + (A − A_NUMBER_CENTER) / A_NUMBER_SPREAD`,
 * clamped. Both constants are claims about where the real sky's A-number sits
 * and how far it travels — so both are MEASURABLE, and this file is where they
 * are measured. Nothing here is hand-fitted: the candidate parameterisations
 * are solved from the measured quantiles.
 *
 * The sweep is env-gated because it costs ~20s (17,520 ephemeris evaluations)
 * and nothing in the product depends on it at runtime — it is a derivation, run
 * on demand, not a guard. What DOES run by default is the control: the harness
 * must reproduce the committed golden pin from priceIndex.test.ts, which is
 * what proves the sweep samples the same engine the oracle prices with.
 *
 *   bun run jest src/lib/economy/__tests__/aNumberDistribution.measure.test.ts \
 *     --testPathIgnorePatterns='/node_modules/'                # control only
 *
 *   MEASURE_A_NUMBER=1 bun run jest \
 *     src/lib/economy/__tests__/aNumberDistribution.measure.test.ts \
 *     --testPathIgnorePatterns='/node_modules/'                # full derivation
 *
 * (`--testPathIgnorePatterns` is required only when running from a git worktree
 * under `.claude/`, which the default config ignores.)
 *
 * MEASUREMENT BOUNDARY: this samples the LOCAL astronomy-engine positions util
 * — the source `priceIndex.ts` quotes from. The debit path (`livePricing.ts`)
 * is remote-first via `calculatePlanetaryPositions` and falls back to this same
 * engine. At 2026-08-15T12:00Z, with the backend unreachable, the two paths
 * agreed to 2e-4 (6.3353 vs 6.3355, the difference being the `minute` field
 * livePricing carries and the oracle zeroes). Whether a LIVE remote backend
 * shifts A is NOT established here and must not be assumed.
 */

import {
  A_NUMBER_CENTER,
  A_NUMBER_SPREAD,
  GLOBAL_MULTIPLIER_MAX,
  GLOBAL_MULTIPLIER_MIN,
  globalMultiplierForANumber,
} from "@/lib/economy/livePricing";
import { computeSkySample } from "@/lib/economy/priceIndex";
import {
  getAccuratePlanetaryPositionsWithMeta,
  type PlanetPositionData,
} from "@/utils/astrology/positions";

/** The window the constants are derived over: one year either side of today. */
const SWEEP_START_UTC = Date.UTC(2025, 7, 15);
const SWEEP_END_UTC = Date.UTC(2027, 7, 15);
const SWEEP_STEP_MS = 3_600_000;

const SIGN_INDEX: Record<string, number> = {
  aries: 0, taurus: 1, gemini: 2, cancer: 3, leo: 4, virgo: 5,
  libra: 6, scorpio: 7, sagittarius: 8, capricorn: 9, aquarius: 10, pisces: 11,
};

function planetAt(sign: string, degree: number, isRetrograde = false): PlanetPositionData {
  return {
    sign: sign as PlanetPositionData["sign"],
    degree,
    exactLongitude: SIGN_INDEX[sign] * 30 + degree,
    isRetrograde,
  };
}

/** Byte-identical to priceIndex.test.ts's fixture — the control's whole point. */
function fixtureSky(): Record<string, PlanetPositionData> {
  return {
    Sun: planetAt("cancer", 28.2), Moon: planetAt("taurus", 12.4),
    Mercury: planetAt("leo", 5.1), Venus: planetAt("gemini", 20.7),
    Mars: planetAt("virgo", 3.9), Jupiter: planetAt("cancer", 10.3),
    Saturn: planetAt("aries", 2.1, true), Uranus: planetAt("gemini", 1.6),
    Neptune: planetAt("aries", 2.8, true), Pluto: planetAt("aquarius", 3.2, true),
  };
}

const r4 = (x: number) => Math.round(x * 10000) / 10000;

function quantile(sortedAsc: number[], p: number): number {
  const idx = (sortedAsc.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return lo === hi
    ? sortedAsc[lo]
    : sortedAsc[lo] + (sortedAsc[hi] - sortedAsc[lo]) * (idx - lo);
}

function summarise(values: number[]) {
  const s = [...values].sort((a, b) => a - b);
  const n = s.length;
  const mean = s.reduce((a, b) => a + b, 0) / n;
  return {
    n,
    min: r4(s[0]), max: r4(s[n - 1]),
    mean: r4(mean),
    sd: r4(Math.sqrt(s.reduce((a, b) => a + (b - mean) ** 2, 0) / n)),
    p01: r4(quantile(s, 0.01)), p05: r4(quantile(s, 0.05)),
    p25: r4(quantile(s, 0.25)), p50: r4(quantile(s, 0.5)),
    p75: r4(quantile(s, 0.75)), p95: r4(quantile(s, 0.95)),
    p99: r4(quantile(s, 0.99)),
    distinct: new Set(values).size,
  };
}

/** What a (center, spread) pair actually does to the charged multiplier. */
function evaluatePair(aNumbers: number[], center: number, spread: number) {
  let atFloor = 0;
  let atCeil = 0;
  const mult = aNumbers.map((a) => {
    const raw = 1 + (a - center) / spread;
    if (raw <= GLOBAL_MULTIPLIER_MIN) atFloor++;
    if (raw >= GLOBAL_MULTIPLIER_MAX) atCeil++;
    return Math.max(GLOBAL_MULTIPLIER_MIN, Math.min(GLOBAL_MULTIPLIER_MAX, raw));
  });
  const m = summarise(mult);
  return {
    center: r4(center), spread: r4(spread),
    pctAtFloor: r4((atFloor / aNumbers.length) * 100),
    pctAtCeil: r4((atCeil / aNumbers.length) * 100),
    multiplierP50: m.p50, multiplierSd: m.sd,
    multiplierMin: m.min, multiplierMax: m.max,
    bandUsedPct: r4(
      ((m.max - m.min) / (GLOBAL_MULTIPLIER_MAX - GLOBAL_MULTIPLIER_MIN)) * 100,
    ),
  };
}

function sweepANumbers(): number[] {
  const out: number[] = [];
  for (let t = SWEEP_START_UTC; t < SWEEP_END_UTC; t += SWEEP_STEP_MS) {
    const d = new Date(t);
    const { positions, degraded } = getAccuratePlanetaryPositionsWithMeta(d);
    out.push(computeSkySample(positions, d, degraded).aNumber);
  }
  return out;
}

describe("A-number distribution — measured basis for the pricing constants", () => {
  it("CONTROL: this harness reproduces the committed oracle golden pin", () => {
    // If this drifts, every number derived below is measuring a DIFFERENT
    // engine than the one that prices, and the derivation is void.
    //
    // Pins the ENGINE fact (aNumber) only. The multiplier is deliberately NOT
    // pinned to a literal here: it is a function of the very constants this
    // file exists to derive, so a literal would make the derivation harness
    // fail every time its own output was adopted. Asserting it against
    // `globalMultiplierForANumber` still proves the wiring.
    const sample = computeSkySample(fixtureSky(), new Date("2026-07-20T12:00:00.000Z"));
    expect(sample.aNumber).toBe(6.3484);
    expect(sample.multiplier).toBe(
      Math.round(globalMultiplierForANumber(sample.aNumber) * 10000) / 10000,
    );
  });

  const maybe = process.env.MEASURE_A_NUMBER ? it : it.skip;

  maybe("DERIVATION: sweeps 2y hourly and solves the candidate constants", () => {
    const aNumbers = sweepANumbers();
    expect(aNumbers).toHaveLength(17520);

    const a = summarise(aNumbers);
    // Anti-degenerate control: a sign-blind or frozen engine collapses this.
    expect(a.distinct).toBeGreaterThan(1000);

    // Candidates, each SOLVED from the measured quantiles — not hand-picked.
    // The band is asymmetric about 1.0 (−0.15 / +0.35), so the floor is the
    // binding side and the "center" of a band-filling fit sits at the 30%
    // point of [p_lo, p_hi], not at the median.
    const bandFillSpread = 2 * (a.p99 - a.p01);
    const bandFillCenter = a.p01 + 0.3 * (a.p99 - a.p01);

    const table = {
      measured: a,
      current: evaluatePair(aNumbers, A_NUMBER_CENTER, A_NUMBER_SPREAD),
      A_bandFilling: evaluatePair(aNumbers, bandFillCenter, bandFillSpread),
      B_medianCentred_1pctFloor: evaluatePair(aNumbers, a.p50, (a.p50 - a.p01) / 0.15),
      C_medianCentred_5pctFloor: evaluatePair(aNumbers, a.p50, (a.p50 - a.p05) / 0.15),
      D_medianCentred_sd05: evaluatePair(aNumbers, a.p50, a.sd / 0.05),
    };
    console.log("A_NUMBER_DERIVATION", JSON.stringify(table, null, 2));

    // The health properties ADR-012 adopted these constants FOR. Before that
    // ADR these three read the other way (band < 10%, max < 1.00, center 34 sd
    // out) — that was the defect, and this is the assertion that would catch
    // its return.
    expect(table.current.bandUsedPct).toBeGreaterThan(80);
    expect(table.current.multiplierP50).toBeGreaterThan(0.99);
    expect(table.current.multiplierP50).toBeLessThan(1.01);
    // Floor clamping is the binding side (the band is −0.15 / +0.35); the
    // spread was solved to put p01 on it, so ~1% is the intended rate.
    expect(table.current.pctAtFloor).toBeLessThan(2);
    // The center must stay inside the sky the engine actually produces.
    expect(Math.abs(A_NUMBER_CENTER - a.mean) / a.sd).toBeLessThan(1);
  });
});
