/**
 * §14d / §17c — the thermodynamic degenerate-case contract, NOW UNIFIED.
 *
 * This file began as a pure characterisation test that pinned three
 * implementations disagreeing. The two non-canonical ones now delegate to the
 * canonical engine, so the goldens have CONVERGED — which is exactly the diff
 * this file existed to produce. The pre-unification values are kept in the
 * comments below, because they are the evidence that the change was safe.
 *
 * ── What the divergence WAS (measured 2026-07-24) ────────────────────────────
 *
 *   input                canonical      monicaKalchm     kalchmEngine
 *   healthy              -2.705053      -2.705053        -2.705053   <- agreed
 *   kalchm = 1           1.618 (φ)      1.0              NaN
 *   kalchm = 1.0001      1.618          -18750.94        -18750.94
 *   kalchm <= 0          1.618          1.0              NaN
 *   reactivity = 0       -216.40        1.0              -Infinity
 *
 * Two facts made the unification low-risk, and both are still asserted below:
 *
 *   1. ALL THREE AGREED EXACTLY ON HEALTHY INPUT. Not three rival physics
 *      models — one model with three different failure handlers. So delegation
 *      moves NO healthy value, and the first test here proves it.
 *
 *   2. THE DANGEROUS CASE WAS NEAR-DEGENERATE, NOT DEGENERATE. At
 *      kalchm = 1.0001 — ordinary production data — the canonical engine bands
 *      |ln kalchm| < MONICA_LN_EPSILON to φ while the others divided by
 *      ln(1.0001) ~ 1e-4 and returned -18750.94. Both answers finite, so nothing
 *      threw and no consumer could tell. That is what got fixed.
 *
 * ⚠️ If a test here fails, an engine changed. Investigate the engine; do not
 * edit the expected value to match.
 */
import {
  calculateMonica,
  MONICA_EQUILIBRIUM,
  MONICA_LN_EPSILON,
} from "@/data/unified/alchemicalCalculations";
import { calculateMonicaConstant as monicaKalchmImpl } from "@/utils/monicaKalchmCalculations";
import { calculateMonicaConstant as kalchmEngineImpl } from "@/calculations/core/kalchmEngine";

/** Fixed, arbitrary-but-healthy. Only kalchm/reactivity vary per case. */
const G = 1.5;
const R = 0.8;

/** Every implementation that must now agree. */
const IMPLS: Array<[string, (g: number, r: number, k: number) => number]> = [
  ["canonical", calculateMonica],
  ["monicaKalchmCalculations", monicaKalchmImpl],
  ["kalchmEngine", kalchmEngineImpl],
];

describe("§14d — the three monica implementations are unified", () => {
  it("still agree exactly on healthy input (proves delegation moved nothing)", () => {
    const expected = -2.705053;
    for (const [name, fn] of IMPLS) {
      expect(fn(G, R, 2.0)).toBeCloseTo(expected, 6);
      // Guard the guard: an impl stubbed to return a constant would also
      // "agree". Require the value to actually depend on its input.
      expect(fn(G * 2, R, 2.0)).not.toBeCloseTo(fn(G, R, 2.0), 6);
      expect(name).toBeTruthy();
    }
  });

  describe("degenerate inputs now produce ONE answer, not three", () => {
    const CASES: Array<[string, number, number, number]> = [
      ["kalchm exactly 1 (ln = 0)", G, R, 1.0],
      ["kalchm 1.0001 (near-degenerate)", G, R, 1.0001],
      ["kalchm 1.05 (inside the band)", G, R, 1.05],
      ["kalchm 0 (log undefined)", G, R, 0],
      ["kalchm negative", G, R, -2.0],
      ["reactivity 0 (division by zero)", G, 0, 2.0],
      ["reactivity 1e-9", G, 1e-9, 2.0],
      ["all zero", 0, 0, 0],
    ];

    it.each(CASES)("%s — all three return the same value", (_label, g, r, k) => {
      const values = IMPLS.map(([, fn]) => fn(g, r, k));
      const [first] = values;
      for (const v of values) expect(v).toBe(first);
    });
  });

  describe("the specific WRONG values are gone", () => {
    it("no implementation returns the unmotivated 1.0 default any more", () => {
      // monicaKalchmCalculations returned exactly 1.0 for kalchm <= 0,
      // ln(kalchm) === 0, and reactivity === 0. Its own comment called that a
      // "Default neutral value" — 1.0 is neither neutral (monica is signed and
      // unbounded) nor derived from anything.
      for (const [, fn] of IMPLS) {
        expect(fn(G, R, 1.0)).not.toBe(1.0);
        expect(fn(G, R, 0)).not.toBe(1.0);
        expect(fn(G, R, -2.0)).not.toBe(1.0);
        expect(fn(G, 0, 2.0)).not.toBe(1.0);
      }
    });

    it("no implementation returns NaN or +/-Infinity any more", () => {
      // kalchmEngine returned NaN (kalchm <= 0, ln === 0) and -Infinity
      // (reactivity === 0, which it never checked). -Infinity is worse than NaN:
      // NaN poisons comparisons visibly, while -Infinity silently wins every
      // Math.min and sorts to the front of every list.
      for (const [, fn] of IMPLS) {
        for (const [g, r, k] of [
          [G, R, 1.0],
          [G, R, 0],
          [G, R, -2.0],
          [G, 0, 2.0],
        ]) {
          const v = fn(g, r, k);
          expect(Number.isNaN(v)).toBe(false);
          expect(v).not.toBe(Number.NEGATIVE_INFINITY);
          expect(v).not.toBe(Number.POSITIVE_INFINITY);
        }
      }
    });

    it("the near-degenerate blowup is banded, not divided", () => {
      // Was -18750.94 in two of three impls. Now phi everywhere.
      for (const [, fn] of IMPLS) {
        expect(fn(G, R, 1.0001)).toBe(MONICA_EQUILIBRIUM);
        expect(fn(G, R, 1.05)).toBe(MONICA_EQUILIBRIUM);
      }
      // Non-vacuity: just outside the band it must compute normally again,
      // otherwise "banded" is indistinguishable from "always phi".
      const outside = Math.exp(MONICA_LN_EPSILON * 4);
      for (const [, fn] of IMPLS) {
        expect(fn(G, R, outside)).not.toBe(MONICA_EQUILIBRIUM);
        expect(Number.isFinite(fn(G, R, outside))).toBe(true);
      }
    });
  });

  describe("§17c totality now holds for ALL THREE (was canonical only)", () => {
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

    it("every implementation is finite across all 10 hostile inputs", () => {
      // Before delegation, 8 of these 10 produced a non-finite result in at least
      // one of the two non-canonical impls. Now none do.
      const nonFinite: string[] = [];
      for (const [name, fn] of IMPLS) {
        for (const [g, r, k] of HOSTILE) {
          if (!Number.isFinite(fn(g, r, k))) nonFinite.push(`${name}(${g},${r},${k})`);
        }
      }
      expect(nonFinite).toEqual([]);
    });

    it("and all three AGREE on every hostile input, not merely stay finite", () => {
      for (const [g, r, k] of HOSTILE) {
        const values = IMPLS.map(([, fn]) => fn(g, r, k));
        const [first] = values;
        for (const v of values) expect(v).toBe(first);
      }
    });
  });
});
