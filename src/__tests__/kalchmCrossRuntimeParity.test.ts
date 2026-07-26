/**
 * Cross-runtime parity for the kalchm/monica engine — the TypeScript half.
 *
 * The formula is implemented ONCE PER RUNTIME: canonically in
 * `src/data/unified/alchemicalCalculations.ts`, and in Python in
 * `backend/alchm_kitchen/main.py` (`compute_kalchm_monica`), which is LIVE —
 * railway.json builds backend/Dockerfile, whose CMD is
 * `uvicorn backend.alchm_kitchen.main:app`, and POST /alchemize serves real
 * computed values from it.
 *
 * Nothing in either build stops those two from drifting apart. The only defence
 * is that both must reproduce the SAME golden vectors exactly, so both tests
 * read the same file and this one owns the expected values.
 *
 * The Python half is `backend/tests/test_kalchm_parity.py`. If you change a
 * vector here, that suite fails until Python agrees — which is the point.
 *
 * Assertions are `toBe` on numbers, deliberately. `toBeCloseTo(…, 15)` once
 * passed against three separately WRONG constants, and an epsilon floor at 0.01
 * inflates kalchm by 4.7129% — a difference any tolerant comparison waves
 * through.
 */
import { readFileSync } from "fs";
import { join } from "path";

import {
  KALCHM_EPSILON,
  MONICA_EQUILIBRIUM,
  MONICA_LN_EPSILON,
  SINGLE_BODY_DEGENERATE_LN_CEILING,
  SINGLE_BODY_HEALTHY_LN_FLOOR,
  calculateKalchm,
  calculateMonica,
} from "@/data/unified/alchemicalCalculations";

interface GoldenVector {
  name: string;
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
  reactivity: number;
  gregsEnergy: number;
  expectedKalchm: number;
  expectedMonica: number;
}

const GOLDEN = JSON.parse(
  readFileSync(
    join(process.cwd(), "backend/tests/kalchm_golden_vectors.json"),
    "utf8",
  ),
) as {
  constants: Record<string, number>;
  vectors: GoldenVector[];
};

describe("kalchm cross-runtime parity", () => {
  // CONTROL. `it.each([])` is a silent no-op, so an empty or unreadable vector
  // file would leave this whole suite green while testing nothing.
  it("loaded a populated vector set covering every divergence regime", () => {
    expect(GOLDEN.vectors.length).toBeGreaterThanOrEqual(10);
    const names = GOLDEN.vectors.map((v) => v.name);
    expect(new Set(names).size).toBe(names.length);
    const joined = names.join(" ").toLowerCase();
    for (const regime of [
      "healthy",
      "zeroed axis",
      "degenerate",
      "negative",
      "reactivity",
    ]) {
      expect(joined).toContain(regime);
    }
  });

  it("pins the shared constants, so neither runtime can edit one alone", () => {
    expect(MONICA_LN_EPSILON).toBe(GOLDEN.constants.MONICA_LN_EPSILON);
    expect(MONICA_EQUILIBRIUM).toBe(GOLDEN.constants.MONICA_EQUILIBRIUM);
    expect(KALCHM_EPSILON).toBe(GOLDEN.constants.KALCHM_EPSILON);
  });

  it("re-derives MONICA_LN_EPSILON rather than re-typing it", () => {
    // The band is the midpoint of a MEASURED bimodal gap. Re-deriving from the
    // module's own exported endpoints means a moved grid fails CI instead of
    // silently invalidating the comment beside the constant.
    expect(MONICA_LN_EPSILON).toBe(
      (SINGLE_BODY_DEGENERATE_LN_CEILING + SINGLE_BODY_HEALTHY_LN_FLOOR) / 2,
    );
    expect(SINGLE_BODY_DEGENERATE_LN_CEILING).toBe(0);
  });

  it("confirms x^x never reaches 0, which is why no epsilon floor is needed", () => {
    // Computed as exp(x·ln x) rather than as a self-exponentiation. Two reasons:
    // it is an INDEPENDENT route to the same function, so this does not merely
    // assert Math.pow against itself; and the formula gate (correctly) flags
    // every `Math.pow(x, x)` / `x ** x` in src, so writing it that way here
    // would mean adding this file to an allowlist that is supposed to shrink to
    // one entry.
    let minimum = Infinity;
    for (let i = 1; i <= 100000; i++) {
      const x = i / 100000;
      minimum = Math.min(minimum, Math.exp(x * Math.log(x)));
    }
    expect(minimum).toBeCloseTo(GOLDEN.constants.X_POW_X_GLOBAL_MINIMUM, 12);
    expect(minimum).toBeGreaterThan(0.69);
  });

  it("treats a zeroed axis as the true limit of x^x, contributing exactly 1", () => {
    // The property that makes the epsilon floors unnecessary, asserted through
    // the engine rather than through a bare 0**0. An axis at 0 must leave the
    // value identical to that axis being absent from the product entirely.
    const matterZero = calculateKalchm({
      Spirit: 3, Essence: 5, Matter: 0, Substance: 2,
    } as never);
    const matterOne = calculateKalchm({
      Spirit: 3, Essence: 5, Matter: 1, Substance: 2,
    } as never);
    // 0^0 and 1^1 are both exactly 1, so these must be bit-for-bit equal.
    expect(matterZero).toBe(matterOne);
  });

  it.each(GOLDEN.vectors.map((v) => [v.name, v] as const))(
    "reproduces %s exactly",
    (_name, v) => {
      const kalchm = calculateKalchm({
        Spirit: v.spirit,
        Essence: v.essence,
        Matter: v.matter,
        Substance: v.substance,
      } as never);
      expect(kalchm).toBe(v.expectedKalchm);
      expect(calculateMonica(v.gregsEnergy, v.reactivity, kalchm)).toBe(
        v.expectedMonica,
      );
    },
  );

  it.each(GOLDEN.vectors.map((v) => [v.name, v] as const))(
    "is total for %s — always finite, never NaN",
    (_name, v) => {
      const kalchm = calculateKalchm({
        Spirit: v.spirit,
        Essence: v.essence,
        Matter: v.matter,
        Substance: v.substance,
      } as never);
      const monica = calculateMonica(v.gregsEnergy, v.reactivity, kalchm);
      expect(Number.isFinite(kalchm)).toBe(true);
      expect(kalchm).toBeGreaterThan(0);
      expect(Number.isFinite(monica)).toBe(true);
      expect(Number.isNaN(monica)).toBe(false);
    },
  );

  it("clamps a negative axis rather than taking its absolute value", () => {
    // These are different operations and one repo copy conflated them: abs()
    // feeds |-0.5|^|-0.5| = 0.7071 into the numerator where the true limit
    // contributes exactly 1. It also lets kalchm go NEGATIVE, which the formula
    // forbids. A negative base with a fractional exponent is NaN in JS (and a
    // COMPLEX number in Python), so the clamp is load-bearing in both runtimes.
    const negBase = -0.5;
    const fractionalExp = -0.5;
    expect(Number.isNaN(Math.pow(negBase, fractionalExp))).toBe(true);
    const clamped = calculateKalchm({
      Spirit: -0.5, Essence: 2, Matter: 1, Substance: 0.5,
    } as never);
    const zeroed = calculateKalchm({
      Spirit: 0, Essence: 2, Matter: 1, Substance: 0.5,
    } as never);
    expect(clamped).toBe(zeroed);
    expect(clamped).toBeGreaterThan(0);
  });

  it("treats a zeroed axis as NEITHER sufficient NOR necessary for kalchm === 1", () => {
    // This exact claim sat FALSE inside a passing test for two days, because no
    // assertion covered it. Prose beside a green test proves nothing.
    const zeroedButNotOne = calculateKalchm({
      Spirit: 3, Essence: 5, Matter: 0, Substance: 2,
    } as never);
    expect(zeroedButNotOne).not.toBe(1);

    const oneWithoutAnyZero = calculateKalchm({
      Spirit: 1.3, Essence: 1.3, Matter: 1.3, Substance: 1.3,
    } as never);
    expect(oneWithoutAnyZero).toBe(1);
  });

  it("returns φ across the whole near-degenerate band, not just at ln k === 0", () => {
    // A bare `ln !== 0` test excludes one single point and lets kalchm = 1.00002
    // produce monica ≈ -49999.5 — finite, plausible, and therefore invisible to
    // every downstream isFinite guard. That is the Python defect this pair pins.
    const kalchm = calculateKalchm({
      Spirit: 1, Essence: 1.00002, Matter: 1, Substance: 1,
    } as never);
    expect(Math.abs(Math.log(kalchm))).toBeLessThan(MONICA_LN_EPSILON);
    expect(calculateMonica(1, 1, kalchm)).toBe(MONICA_EQUILIBRIUM);

    const unguarded = -1 / (1 * Math.log(kalchm));
    expect(Math.abs(unguarded)).toBeGreaterThan(10000);
    expect(Number.isFinite(unguarded)).toBe(true);
  });
});
