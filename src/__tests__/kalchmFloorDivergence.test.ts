/**
 * What did the duplicate kalchm implementations disagree about, and do they
 * still?
 *
 * This file began as a CHARACTERISATION test: several live implementations of
 * `kalchm = (S^S · E^E) / (M^M · Su^Su)` differed in how they kept an axis away
 * from zero, and the behavioural difference had to be measured before any of
 * them could be delegated (the §17c bar: characterise BEFORE touching a shared
 * table).
 *
 * They have now all been delegated to the canonical engine, so its job has
 * changed. It now asserts the two halves that outlive the migration:
 *
 *   1. THE LAW — flooring an axis at `eps` replaces a factor of `0^0 = 1` in the
 *      denominator with `eps^eps`, inflating the result by exactly
 *
 *          eps^(-eps) - 1        per zeroed axis
 *
 *      which is 0.6932% at eps=0.001, 4.7129% at 0.01, and 25.8925% at 0.1 — for
 *      ANY input. This is arithmetic, not a property of any implementation, so
 *      it stays true and stays worth pinning: it is the reason a floor is never
 *      a harmless "safety" measure.
 *
 *   2. CONVERGENCE — the two importable former divergers now return the canonical
 *      value on zeroed axes as well as healthy ones. These assertions are what
 *      would fail if someone reintroduced a floor, and they are the reason this
 *      file is worth keeping rather than deleting along with the duplicates.
 *
 * `exactKalchm` below is the one legitimate restatement of the formula in the
 * repo, and the sole entry in the gate's allowlist
 * (scripts/checkNoStrayKalchmFormula.ts). It must restate the DEFINITION in
 * order to measure implementations against it — an independent statement of the
 * maths, deliberately not an import of the thing under test.
 *
 * The other former copies are file-local and cannot be imported:
 * `src/data/unified/ingredients.ts` (was floor 0.001),
 * `src/data/unified/flavorProfileMigration.ts` (was a band returning 1.0 when
 * Matter or Substance was 0), `src/utils/recommendation/ingredientRecommendation.ts`
 * (was THREE copies at floor 0.01), `src/utils/alchemy/derivedStats.ts` (two),
 * `src/services/RealAlchemizeService.ts` (two, the production ESMS path),
 * `src/lib/core-energy-rules.ts`, `src/calculations/core/alchemicalEngine.ts`,
 * `src/data/unified/recipeBuilding.ts`, `src/services/UnifiedScoringService.ts`
 * and `src/utils/astrologyUtils.ts`. All delegate; the AST gate is what keeps
 * them delegated.
 *
 * ⚠️ A correction worth recording, because the earlier version of this docstring
 * asserted the opposite. `src/calculations/alchemicalCalculations.ts` returned
 * **0** on a zeroed axis — making `ln(kalchm)` −Infinity and monica non-finite,
 * a totality violation — and was described here and in the gate's allowlist as
 * UNREACHABLE, and therefore as safe to delete rather than delegate. That was
 * wrong. `src/calculations/index.ts:459` does
 * `export * from "./alchemicalCalculations"`, which the TypeScript resolver
 * confirms binds to THAT file; deleting it produces
 * `TS2307: Cannot find module './alchemicalCalculations'`. Worse, the
 * neighbouring `export * from "./core/kalchmEngine"` exports `calculateKAlchm`
 * (capital A), a DIFFERENT identifier, so there was no name collision and
 * `import { calculateKalchm } from "@/calculations"` resolved to the
 * zero-returning implementation. The barrel was publishing the worst copy in the
 * repo. It has been delegated, not deleted.
 */
import { calculateKAlchm as formerlyEps1 } from "@/calculations/core/kalchmEngine";
import { calculateKalchm as canonical } from "@/data/unified/alchemicalCalculations";
import { calculateKAlchm as formerlyEps01 } from "@/utils/monicaKalchmCalculations";

/**
 * The formula as DEFINED, with no floor. `0 ** 0 === 1` in JavaScript, which is
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

/**
 * What a floored implementation would return.
 *
 * Expressed by feeding `exactKalchm` the floored axes rather than by restating
 * the formula a second time — flooring at `eps` IS just passing `eps` where the
 * axis was below it. That keeps exactly one reference implementation in this
 * file, which is what the AST gate's single allowlist entry accounts for; a
 * second copy here would be the very thing the gate exists to stop, and it
 * caught this when it was first written the other way.
 */
function flooredKalchm(
  S: number, E: number, M: number, Su: number, eps: number,
): number {
  const f = (x: number) => Math.max(x, eps);
  return exactKalchm(f(S), f(E), f(M), f(Su));
}

/** Inputs with no axis at or below any former implementation's floor. */
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

describe("the epsilon-floor divergence law", () => {
  it("is exactly eps^(-eps) - 1 per zeroed axis, independent of input", () => {
    // The load-bearing claim: the error is a fixed MULTIPLICATIVE factor, so it
    // can be stated for the whole class rather than sampled per call site.
    const law = (eps: number) => Math.pow(eps, -eps);
    for (const [S, E, M, Su] of ONE_ZEROED) {
      const exact = exactKalchm(S, E, M, Su);
      expect(flooredKalchm(S, E, M, Su, 0.01) / exact).toBeCloseTo(law(0.01), 12);
      expect(flooredKalchm(S, E, M, Su, 0.1) / exact).toBeCloseTo(law(0.1), 12);
      expect(flooredKalchm(S, E, M, Su, 0.001) / exact).toBeCloseTo(law(0.001), 12);
    }
    // The percentages quoted in the docstring, so a change to either shows up as
    // a failure here rather than as quietly stale prose.
    expect((law(0.01) - 1) * 100).toBeCloseTo(4.7129, 4);
    expect((law(0.1) - 1) * 100).toBeCloseTo(25.8925, 4);
    expect((law(0.001) - 1) * 100).toBeCloseTo(0.6932, 4);
  });

  it("inflates kalchm — a floor never deflates it", () => {
    // Direction matters: kalchm > 1 vs < 1 decides the SIGN of ln(kalchm) and so
    // of monica. A floor can only shrink the denominator, so it can only push
    // kalchm up.
    for (const [S, E, M, Su] of ONE_ZEROED) {
      const exact = exactKalchm(S, E, M, Su);
      expect(flooredKalchm(S, E, M, Su, 0.01)).toBeGreaterThan(exact);
      expect(flooredKalchm(S, E, M, Su, 0.1)).toBeGreaterThan(exact);
    }
  });

  it("would flip a degenerate chart into a spuriously HEALTHY one at eps=0.1", () => {
    // The consequence that actually mattered, and why kalchmEngine.ts was the
    // highest-priority delegation. With no floor a zeroed axis gives kalchm
    // exactly 1, so ln(kalchm) is 0 and the chart is degenerate — which the
    // totality contract answers with φ. A floor moves kalchm off 1, and at
    // eps=0.1 it moves it so far that the chart no longer even looks degenerate.
    const [S, E, M, Su] = [1, 1, 1, 0];
    expect(exactKalchm(S, E, M, Su)).toBe(1);
    expect(Math.log(exactKalchm(S, E, M, Su))).toBe(0);

    expect(Math.log(flooredKalchm(S, E, M, Su, 0.01))).toBeCloseTo(0.0460517, 6);
    expect(Math.log(flooredKalchm(S, E, M, Su, 0.1))).toBeCloseTo(0.2302585, 6);

    // eps=0.1 lands at 0.2303, beyond the single-body healthy floor of 0.2188 —
    // so a degenerate chart floored at 0.1 does not merely look computable, it
    // looks HEALTHY. eps=0.01 stays inside the degenerate band, so that copy
    // corrupted magnitude only, never classification.
    expect(Math.log(flooredKalchm(S, E, M, Su, 0.1))).toBeGreaterThan(
      0.21878586815274545,
    );
    expect(Math.log(flooredKalchm(S, E, M, Su, 0.01))).toBeLessThan(
      0.10939293407637272,
    );
  });
});

describe("the former divergers now agree with canonical", () => {
  it("agree EXACTLY on healthy input — delegation was a no-op there", () => {
    for (const [S, E, M, Su] of HEALTHY) {
      const exact = exactKalchm(S, E, M, Su);
      // `toBe`, not toBeCloseTo: identical arithmetic on identical inputs must
      // give identical doubles. Any tolerance would hide a real difference.
      expect(canonical({ Spirit: S, Essence: E, Matter: M, Substance: Su })).toBe(exact);
      expect(formerlyEps01(S, E, M, Su)).toBe(exact);
      expect(formerlyEps1(S, E, M, Su)).toBe(exact);
    }
  });

  it("now agree on ZEROED axes too — this is what the delegation changed", () => {
    // These four assertions per input are the regression guard. Before
    // delegation, formerlyEps01 was 4.7129% high here and formerlyEps1 25.8925%
    // high; both now return the definition exactly.
    for (const [S, E, M, Su] of ONE_ZEROED) {
      const exact = exactKalchm(S, E, M, Su);
      expect(canonical({ Spirit: S, Essence: E, Matter: M, Substance: Su })).toBe(exact);
      expect(formerlyEps01(S, E, M, Su)).toBe(exact);
      expect(formerlyEps1(S, E, M, Su)).toBe(exact);
      // ...and are therefore no longer inflated relative to the definition.
      expect(formerlyEps01(S, E, M, Su)).not.toBeGreaterThan(exact);
      expect(formerlyEps1(S, E, M, Su)).not.toBeGreaterThan(exact);
    }
  });

  it("agree that a degenerate chart is degenerate", () => {
    const [S, E, M, Su] = [1, 1, 1, 0];
    expect(canonical({ Spirit: S, Essence: E, Matter: M, Substance: Su })).toBe(1);
    expect(formerlyEps01(S, E, M, Su)).toBe(1);
    expect(formerlyEps1(S, E, M, Su)).toBe(1);
  });

  it("clamp negatives rather than returning NaN", () => {
    // Math.pow(-0.5, -0.5) is NaN, so this is the one case where a guard is
    // genuinely required — as opposed to the zero case, where none ever was.
    for (const impl of [formerlyEps01, formerlyEps1]) {
      const v = impl(-0.5, 2, 1, 0.5);
      expect(Number.isFinite(v)).toBe(true);
      expect(v).toBeGreaterThan(0);
      expect(v).toBe(exactKalchm(0, 2, 1, 0.5));
    }
  });
});
