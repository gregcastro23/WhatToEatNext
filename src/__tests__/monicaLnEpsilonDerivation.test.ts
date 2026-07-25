/**
 * MONICA_LN_EPSILON is DERIVED, and this is where the derivation is checked.
 *
 * The constant is the midpoint of a measured gap in |ln(kalchm)|. Its two
 * endpoints are stated in `alchemicalCalculations.ts` rather than computed
 * there, because computing them needs `groundingVessel` from `@/utils/agentMonica`,
 * which imports that module — a cycle. So the enumeration lives here.
 *
 * These tests re-derive both endpoints from the grid on every run. If the vessel,
 * the dignity table, or the sectarian ESMS change, the gap moves and THIS FAILS —
 * which is the point. Without it the constants would be a comment asserting a
 * measurement nobody re-checks.
 *
 * The grid is exhaustive, not sampled: the single-body population is fully
 * determined by planet x sign x degree x sect.
 */
import {
  calculateKalchm,
  MONICA_LN_EPSILON,
  SINGLE_BODY_DEGENERATE_LN_CEILING,
  SINGLE_BODY_HEALTHY_LN_FLOOR,
} from "@/data/unified/alchemicalCalculations";
import { getDignityScore } from "@/utils/dignityScales";
import { PLANETARY_SECTARIAN_ESMS, ZODIAC_ELEMENTS } from "@/utils/planetaryAlchemyMapping";
import { groundingVessel, type ESMS } from "@/utils/agentMonica";
import type { AlchemicalProperties } from "@/types/celestial";

const ZERO: ESMS = { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 };

/** Every |ln(kalchm)| the single-body population can produce. */
function enumerateAbsLnKalchm(): number[] {
  const out: number[] = [];
  for (const planet of Object.keys(PLANETARY_SECTARIAN_ESMS)) {
    const table = PLANETARY_SECTARIAN_ESMS[planet as keyof typeof PLANETARY_SECTARIAN_ESMS];
    for (const sign of Object.keys(ZODIAC_ELEMENTS)) {
      const dignityScale = getDignityScore(planet, sign as never).esmsScale;
      for (let degree = 0; degree < 30; degree++) {
        const v = groundingVessel(degree, dignityScale);
        for (const sect of ["diurnal", "nocturnal"] as const) {
          const base: ESMS = table ? { ...ZERO, ...table[sect] } : ZERO;
          const esms: ESMS = {
            Spirit: base.Spirit + v.Spirit,
            Essence: base.Essence + v.Essence,
            Matter: base.Matter + v.Matter,
            Substance: base.Substance + v.Substance,
          };
          const kalchm = calculateKalchm(esms as AlchemicalProperties);
          if (Number.isFinite(kalchm) && kalchm > 0) out.push(Math.abs(Math.log(kalchm)));
        }
      }
    }
  }
  return out.sort((a, b) => a - b);
}

/** The widest gap below 0.5 — the band's home. */
function widestLowGap(sorted: number[]): { lo: number; hi: number; width: number } {
  let best = { lo: 0, hi: 0, width: 0 };
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] >= 0.5) break;
    const width = sorted[i] - sorted[i - 1];
    if (width > best.width) best = { lo: sorted[i - 1], hi: sorted[i], width };
  }
  return best;
}

const GRID = enumerateAbsLnKalchm();
const GAP = widestLowGap(GRID);

describe("MONICA_LN_EPSILON is derived from a measured gap", () => {
  it("enumerates the full deterministic grid", () => {
    // 11 planets x 12 signs x 30 degrees x 2 sects
    expect(GRID.length).toBe(7920);
  });

  it("the |ln kalchm| distribution really is bimodal with ONE dominant gap", () => {
    // Without a gap there is nothing to derive and any epsilon would be an
    // arbitrary threshold on a continuum. This is the load-bearing assumption.
    expect(GAP.width).toBeGreaterThan(0.15);

    // It must also DOMINATE — collect every gap in the low tail and compare the
    // top two directly.
    //
    // ⚠️ Do NOT test this by filtering the winning endpoints out and re-running
    // widestLowGap: removing them merges their neighbours into a single larger
    // span (measured 0.2207 > 0.1727), so that version fails on correct data.
    const widths: number[] = [];
    for (let i = 1; i < GRID.length; i++) {
      if (GRID[i] >= 0.5) break;
      const w = GRID[i] - GRID[i - 1];
      if (w > 0) widths.push(w);
    }
    widths.sort((a, b) => b - a);
    expect(widths[0]).toBeCloseTo(GAP.width, 15);
    // Widest is ~1.48x the runner-up (0.172734 vs 0.116838): a clear winner, so
    // "the gap" is well defined rather than one of several similar candidates.
    expect(widths[0] / widths[1]).toBeGreaterThan(1.3);
  });

  it("re-derives both stated endpoints from the grid", () => {
    expect(GAP.lo).toBeCloseTo(SINGLE_BODY_DEGENERATE_LN_CEILING, 15);
    expect(GAP.hi).toBeCloseTo(SINGLE_BODY_HEALTHY_LN_FLOOR, 15);
  });

  it("the epsilon is exactly the midpoint of those endpoints", () => {
    expect(MONICA_LN_EPSILON).toBeCloseTo((GAP.lo + GAP.hi) / 2, 15);
    // 0.10939293407637272 — was 0.13241878500631321 while calculateKalchm floored
    // each axis at 0.01. The floor smeared the degenerate ceiling up to 0.046; with
    // it removed a degenerate chart's kalchm is exactly 1, so the ceiling is exactly
    // 0 and the midpoint dropped. Classification is unchanged (660, asserted below).
    expect(MONICA_LN_EPSILON).toBeCloseTo(0.10939293407637272, 15);
  });

  it("the degenerate ceiling is EXACTLY zero, not merely small", () => {
    // The strongest consequence of removing the floor: the degenerate set stops
    // being an empirical cluster and becomes an exact algebraic condition.
    // kalchm === 1 <=> ln kalchm === 0, for every chart with a zeroed axis.
    expect(GAP.lo).toBe(0);
    expect(GRID.filter((v) => v === 0).length).toBeGreaterThan(0);
    // And nothing sits between 0 and the healthy floor — that IS the gap.
    expect(GRID.filter((v) => v > 0 && v < GAP.hi).length).toBe(0);
  });

  it("sits strictly inside the gap, with real margin on both sides", () => {
    expect(MONICA_LN_EPSILON).toBeGreaterThan(GAP.lo);
    expect(MONICA_LN_EPSILON).toBeLessThan(GAP.hi);
    // The reason for the change: the old 0.05 had only 0.003948 of lower margin.
    expect(MONICA_LN_EPSILON - GAP.lo).toBeGreaterThan(0.08);
    expect(GAP.hi - MONICA_LN_EPSILON).toBeGreaterThan(0.08);
  });

  it("classifies EXACTLY as the old 0.05 did — a zero-behaviour-change edit", () => {
    const withOld = GRID.filter((v) => v < 0.05).length;
    const withNew = GRID.filter((v) => v < MONICA_LN_EPSILON).length;
    expect(withNew).toBe(withOld);
    expect(withNew).toBe(660);

    // Non-vacuity: the band must actually exclude most of the grid, or "identical
    // classification" would be trivially true.
    expect(withNew).toBeLessThan(GRID.length / 2);
    expect(withNew).toBeGreaterThan(0);
  });

  it("two-body's independently derived epsilon also lands in this gap", () => {
    // agentMonicaTwoBody derives 0.1244355 from a DIFFERENT mechanism (vessel
    // Essence exactly 0). That it falls inside the single-body gap is a genuine
    // corroboration — two derivations, different routes, compatible answers.
    //
    // They are deliberately NOT unified (§18o: different populations). Note the
    // mechanisms really do differ: single-body's degenerate cluster is NOT the
    // Essence==0 set — those points sit at |ln k| in [1.06, 5.55], far from the
    // band.
    const TWO_BODY_LN_EPSILON = 0.1244355;
    expect(TWO_BODY_LN_EPSILON).toBeGreaterThan(GAP.lo);
    expect(TWO_BODY_LN_EPSILON).toBeLessThan(GAP.hi);
    expect(GRID.filter((v) => v < TWO_BODY_LN_EPSILON).length).toBe(660);
  });
});
