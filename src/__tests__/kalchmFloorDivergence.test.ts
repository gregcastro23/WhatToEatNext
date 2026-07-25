/**
 * What exactly do the duplicate kalchm implementations disagree about?
 *
 * There are several live implementations of the same formula
 * `kalchm = (S^S · E^E) / (M^M · Su^Su)`, differing only in how they keep an axis
 * away from zero. Before any of them is delegated to the canonical engine, the
 * behavioural difference has to be characterised — otherwise "de-duplication"
 * silently re-values whatever reads them (the §17c acceptance bar: characterisation
 * tests BEFORE touching a shared table).
 *
 * These tests import the REAL functions rather than restating their formulas. A
 * transcribed formula is the same hazard as a transcribed constant: it can drift
 * from the thing it claims to describe, and the test would keep passing.
 *
 * The headline result is that the disagreement is not a vague percentage — it is an
 * exact, input-independent law. Flooring an axis at `eps` replaces a factor of
 * `0^0 = 1` in the denominator with `eps^eps`, so the result is inflated by exactly
 *
 *     eps^(-eps) - 1        per zeroed axis
 *
 * which is 0.6932% at eps=0.001, 4.7129% at 0.01, and 25.8925% at 0.1 — for ANY
 * input. And where no axis is at or below the floor, every implementation agrees
 * to the last bit, so delegation is a no-op for all healthy charts.
 *
 * Two more implementations exist but are file-local and cannot be imported:
 * `src/data/unified/ingredients.ts:74` (floor 0.001) and
 * `src/data/unified/flavorProfileMigration.ts:797` (returns 1.0 when Matter or
 * Substance is 0 — a band, not a floor). A third,
 * `src/calculations/alchemicalCalculations.ts:246`, returns **0** on a zeroed axis,
 * which makes `ln(kalchm)` −Infinity and monica non-finite — a totality-contract
 * violation. It is unreachable (no call, no value reference, and its only importer
 * exposes it through a string-dispatch helper that itself has no callers), which is
 * the only reason it has never caused an incident.
 */
import { calculateKAlchm as kalchmEps01 } from "@/utils/monicaKalchmCalculations";
import { calculateKAlchm as kalchmEps1 } from "@/calculations/core/kalchmEngine";

/**
 * The formula as defined, with no floor. `0 ** 0 === 1` in JavaScript, which is
 * exactly `lim(x→0) x^x`, so a zeroed axis needs no special handling at all.
 * Negatives are clamped because `Math.pow(-0.5, -0.5)` is NaN.
 *
 * This is the mathematical definition, not a copy of any implementation.
 */
function exactKalchm(S: number, E: number, M: number, Su: number): number {
  const nn = (x: number) => (x > 0 ? x : 0);
  return (
    (Math.pow(nn(S), nn(S)) * Math.pow(nn(E), nn(E))) /
    (Math.pow(nn(M), nn(M)) * Math.pow(nn(Su), nn(Su)))
  );
}

/** Inputs with no axis at or below any implementation's floor. */
const HEALTHY: [number, number, number, number][] = [
  [4, 7, 5, 3],
  [0.5, 0.8, 0.4, 0.3],
  [2.5, 3.1, 1.7, 1.1],
  [1.2, 1.2, 1.2, 1.2],
  [9, 0.5, 2, 6],
];

/** Inputs with exactly ONE axis at zero. */
const ONE_ZEROED: [number, number, number, number][] = [
  [0.3, 0.6, 0.1, 0], // the shape found persisted at src/data/cuisines/russian.ts:480
  [1, 1, 1, 0],
  [2.5, 3.1, 1.7, 0],
  [0.9, 0.2, 4.4, 0],
];

describe("the duplicate kalchm implementations", () => {
  it("agree EXACTLY on healthy input — delegation is a no-op there", () => {
    for (const [S, E, M, Su] of HEALTHY) {
      const exact = exactKalchm(S, E, M, Su);
      // `toBe`, not toBeCloseTo: identical arithmetic on identical inputs must give
      // identical doubles. Any tolerance here would hide a real formula difference.
      expect(kalchmEps01(S, E, M, Su)).toBe(exact);
      expect(kalchmEps1(S, E, M, Su)).toBe(exact);
    }
  });

  it("diverge by exactly eps^(-eps) - 1 per zeroed axis, independent of input", () => {
    // This is the load-bearing claim: the error is a fixed multiplicative factor,
    // so it can be stated for the whole class rather than sampled per call site.
    const law = (eps: number) => Math.pow(eps, -eps);
    for (const [S, E, M, Su] of ONE_ZEROED) {
      const exact = exactKalchm(S, E, M, Su);
      expect(kalchmEps01(S, E, M, Su) / exact).toBeCloseTo(law(0.01), 12);
      expect(kalchmEps1(S, E, M, Su) / exact).toBeCloseTo(law(0.1), 12);
    }
    // The percentages quoted in the docstring, so a change to either floor shows up
    // as a failure here rather than as quietly stale prose.
    expect((law(0.01) - 1) * 100).toBeCloseTo(4.7129, 4);
    expect((law(0.1) - 1) * 100).toBeCloseTo(25.8925, 4);
    expect((law(0.001) - 1) * 100).toBeCloseTo(0.6932, 4);
  });

  it("a floor inflates kalchm — it never deflates it", () => {
    // Direction matters: kalchm > 1 vs < 1 decides the SIGN of ln(kalchm) and so of
    // monica. A floor can only shrink the denominator, so it can only push kalchm up.
    for (const [S, E, M, Su] of ONE_ZEROED) {
      const exact = exactKalchm(S, E, M, Su);
      expect(kalchmEps01(S, E, M, Su)).toBeGreaterThan(exact);
      expect(kalchmEps1(S, E, M, Su)).toBeGreaterThan(exact);
    }
  });

  it("the bigger floor is always the bigger error", () => {
    // Orders the implementations by how far they sit from the definition, which is
    // the order they should be delegated in.
    for (const [S, E, M, Su] of ONE_ZEROED) {
      expect(kalchmEps1(S, E, M, Su)).toBeGreaterThan(kalchmEps01(S, E, M, Su));
    }
  });

  it("a floor can flip a degenerate chart into a spuriously computable monica", () => {
    // The consequence that actually matters. With no floor, a zeroed axis gives
    // kalchm exactly 1, so ln(kalchm) is 0 and monica is undefined — which the
    // §17c totality contract answers with φ, the equilibrium value. A floor moves
    // kalchm off 1, so ln(kalchm) becomes non-zero and the engine returns a REAL
    // NUMBER for a chart that has no defined monica. That is fabrication, not rescue.
    const [S, E, M, Su] = [1, 1, 1, 0];
    expect(exactKalchm(S, E, M, Su)).toBe(1);
    expect(Math.log(exactKalchm(S, E, M, Su))).toBe(0);

    expect(kalchmEps01(S, E, M, Su)).not.toBe(1);
    expect(Math.log(kalchmEps01(S, E, M, Su))).toBeCloseTo(0.0460517, 6);
    expect(kalchmEps1(S, E, M, Su)).not.toBe(1);
    expect(Math.log(kalchmEps1(S, E, M, Su))).toBeCloseTo(0.2302585, 6);

    // And the floored ln values are large enough to matter: eps=0.1 lands at
    // 0.23, which is beyond the single-body healthy floor (0.2188) — so a
    // degenerate chart floored at 0.1 does not merely look computable, it looks
    // HEALTHY.
    expect(Math.log(kalchmEps1(S, E, M, Su))).toBeGreaterThan(0.21878586815274545);
  });
});
