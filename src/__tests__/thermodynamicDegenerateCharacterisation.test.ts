/**
 * §14d / §17c CHARACTERISATION — the thermodynamic layer's degenerate-case
 * contract, as it behaves TODAY.
 *
 * ⚠️ THIS TEST PINS BUGS ON PURPOSE. It asserts current behaviour, including
 * behaviour that is wrong. Do not "fix" a failure here by editing the expected
 * value — a failure means an engine changed, which is the signal this file
 * exists to produce. When the modules are unified, these goldens converge, and
 * THAT diff is the deliverable.
 *
 * §17c states the problem as "the same undefined input returns 1.0 / NaN / 0 /
 * null across modules". Measured, it is sharper than that, in two ways that
 * matter for how the reconciliation should be sequenced.
 *
 * ── 1. On HEALTHY input all three agree, exactly ─────────────────────────────
 *
 * Same formula, same result to the last digit. So this is NOT a case of three
 * rival physics models — it is one model with three different failure handlers.
 * Unification is therefore much lower-risk than the §14 framing suggests: no
 * healthy value moves.
 *
 * ── 2. The danger is NEAR-degenerate, not degenerate ─────────────────────────
 *
 * At kalchm = 1.0001 — ordinary production data, not an edge case — the
 * canonical engine returns φ (1.618) because it bands |ln kalchm| < 0.05, while
 * the other two return −18750.94. That is not a different convention, it is a
 * four-orders-of-magnitude disagreement on a realistic input, and it is invisible
 * because both answers are finite numbers a consumer will happily render.
 *
 * The exactly-degenerate cases (kalchm = 1, kalchm <= 0) disagree too, but at
 * least NaN announces itself. The near-degenerate band does not.
 */
import { calculateMonica, MONICA_EQUILIBRIUM } from "@/data/unified/alchemicalCalculations";
import { calculateMonicaConstant as monicaKalchmImpl } from "@/utils/monicaKalchmCalculations";
import { calculateMonicaConstant as kalchmEngineImpl } from "@/calculations/core/kalchmEngine";

/** Fixed, arbitrary-but-healthy inputs. Only kalchm/reactivity vary per case. */
const G = 1.5;
const R = 0.8;

describe("§17c — three implementations of monica(gregsEnergy, reactivity, kalchm)", () => {
  it("AGREE exactly on healthy input (so unification moves no healthy value)", () => {
    const expected = -2.705053;
    expect(calculateMonica(G, R, 2.0)).toBeCloseTo(expected, 6);
    expect(monicaKalchmImpl(G, R, 2.0)).toBeCloseTo(expected, 6);
    expect(kalchmEngineImpl(G, R, 2.0)).toBeCloseTo(expected, 6);

    // Non-vacuity: the shared value must be a real computation, not all three
    // hitting the same fallback. A fallback would be positive and small.
    expect(expected).toBeLessThan(0);
  });

  describe("kalchm EXACTLY 1 — ln(kalchm) is 0, the true degenerate case", () => {
    it("canonical returns φ (the §17c totality contract)", () => {
      expect(calculateMonica(G, R, 1.0)).toBe(MONICA_EQUILIBRIUM);
      expect(MONICA_EQUILIBRIUM).toBe(1.618);
    });

    it("monicaKalchmCalculations returns 1.0 — an unmotivated 'neutral'", () => {
      // Its own comment calls this a "Default neutral value". 1.0 is neither
      // neutral (monica is signed and unbounded) nor derived from anything.
      expect(monicaKalchmImpl(G, R, 1.0)).toBe(1.0);
    });

    it("kalchmEngine returns NaN — no totality contract at all", () => {
      expect(Number.isNaN(kalchmEngineImpl(G, R, 1.0))).toBe(true);
    });

    it("=> three different answers to one input", () => {
      const answers = new Set([
        String(calculateMonica(G, R, 1.0)),
        String(monicaKalchmImpl(G, R, 1.0)),
        String(kalchmEngineImpl(G, R, 1.0)),
      ]);
      expect(answers.size).toBe(3);
    });
  });

  describe("kalchm NEAR 1 — the case that actually threatens production data", () => {
    it("canonical bands |ln kalchm| < MONICA_LN_EPSILON to φ", () => {
      expect(calculateMonica(G, R, 1.0001)).toBe(MONICA_EQUILIBRIUM);
      expect(calculateMonica(G, R, 1.05)).toBe(MONICA_EQUILIBRIUM);
    });

    it("the other two EXPLODE instead, on input that is not degenerate at all", () => {
      // kalchm = 1.0001 is ordinary data. ln(1.0001) ~ 1e-4, so dividing by it
      // yields ~-18750 where the canonical engine yields 1.618.
      expect(monicaKalchmImpl(G, R, 1.0001)).toBeCloseTo(-18750.937484, 4);
      expect(kalchmEngineImpl(G, R, 1.0001)).toBeCloseTo(-18750.937484, 4);

      expect(monicaKalchmImpl(G, R, 1.05)).toBeCloseTo(-38.429877, 4);
      expect(kalchmEngineImpl(G, R, 1.05)).toBeCloseTo(-38.429877, 4);
    });

    it("=> a 4-orders-of-magnitude disagreement, both answers finite", () => {
      // This is why it is invisible: nothing throws, nothing is NaN, and a
      // consumer renders -18750.94 as readily as 1.618.
      const canonical = calculateMonica(G, R, 1.0001);
      const other = monicaKalchmImpl(G, R, 1.0001);
      expect(Number.isFinite(canonical)).toBe(true);
      expect(Number.isFinite(other)).toBe(true);
      expect(Math.abs(other / canonical)).toBeGreaterThan(10_000);
    });
  });

  describe("kalchm <= 0 — undefined logarithm", () => {
    it.each([
      ["zero", 0],
      ["negative", -2.0],
    ])("canonical returns φ for %s", (_label, k) => {
      expect(calculateMonica(G, R, k)).toBe(MONICA_EQUILIBRIUM);
    });

    it.each([
      ["zero", 0],
      ["negative", -2.0],
    ])("monicaKalchmCalculations returns 1.0 for %s", (_label, k) => {
      expect(monicaKalchmImpl(G, R, k)).toBe(1.0);
    });

    it.each([
      ["zero", 0],
      ["negative", -2.0],
    ])("kalchmEngine returns NaN for %s", (_label, k) => {
      expect(Number.isNaN(kalchmEngineImpl(G, R, k))).toBe(true);
    });
  });

  describe("reactivity 0 — division by zero", () => {
    it("canonical clamps reactivity to +/-KALCHM_EPSILON and stays finite", () => {
      const v = calculateMonica(G, 0, 2.0);
      expect(v).toBeCloseTo(-216.404256, 4);
      expect(Number.isFinite(v)).toBe(true);
    });

    it("monicaKalchmCalculations returns its 1.0 default", () => {
      expect(monicaKalchmImpl(G, 0, 2.0)).toBe(1.0);
    });

    it("kalchmEngine returns -Infinity, which nothing downstream guards", () => {
      // Worse than NaN: NaN poisons comparisons visibly, while -Infinity
      // silently wins every `Math.min` and sorts to the front of every list.
      expect(kalchmEngineImpl(G, 0, 2.0)).toBe(Number.NEGATIVE_INFINITY);
    });
  });

  describe("the totality contract holds for the canonical engine ONLY", () => {
    const HOSTILE: Array<[number, number, number]> = [
      [G, R, 1.0],
      [G, R, 1.0001],
      [G, R, 0],
      [G, R, -2.0],
      [G, 0, 2.0],
      [G, 1e-9, 2.0],
      [0, 0, 0],
      [Number.NaN, R, 2.0],
      [G, Number.NaN, 2.0],
      [G, R, Number.NaN],
    ];

    it("canonical is ALWAYS finite (§17c totality)", () => {
      for (const [g, r, k] of HOSTILE) {
        const v = calculateMonica(g, r, k);
        expect(Number.isFinite(v)).toBe(true);
      }
    });

    it("the other two are NOT — pinned as the gap to close", () => {
      const nonFinite = HOSTILE.filter(
        ([g, r, k]) =>
          !Number.isFinite(monicaKalchmImpl(g, r, k)) || !Number.isFinite(kalchmEngineImpl(g, r, k)),
      );

      // 8 of 10, MEASURED — not estimated. (My first guess here was 5, and
      // writing it as a test is what caught that. The two that stay finite are
      // the near-degenerate rows, kalchm=1.0001 and reactivity=1e-9, which
      // return huge-but-finite numbers — the invisible failure mode above.)
      expect(nonFinite.length).toBe(8);

      // Name them, so a change in this count says WHICH case moved rather than
      // just that the number is different.
      const finiteCases = HOSTILE.filter(
        ([g, r, k]) =>
          Number.isFinite(monicaKalchmImpl(g, r, k)) && Number.isFinite(kalchmEngineImpl(g, r, k)),
      ).map(([g, r, k]) => `g=${g} r=${r} k=${k}`);
      expect(finiteCases).toEqual(["g=1.5 r=0.8 k=1.0001", "g=1.5 r=1e-9 k=2"]);
    });
  });
});
