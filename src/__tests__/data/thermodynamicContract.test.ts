/**
 * The canonical thermodynamic contract (§17c).
 *
 * `src/data/unified/alchemicalCalculations.ts` is the single source of truth for
 * heat / entropy / reactivity / gregsEnergy / kalchm / monica. These tests pin
 * two things every other surface must converge toward:
 *
 *  1. TOTALITY — no function ever returns NaN / null / non-finite, for ANY input,
 *     including all-zero and near-equilibrium (kalchm ≈ 1). Degenerate input
 *     resolves to a documented constant (0 for the ratios, 1.0 for kalchm, φ for
 *     monica). This is the "no NaN/null" guarantee.
 *  2. The reference values on the shared probe input, which every forked engine
 *     is being reconciled against.
 *
 * See docs/physics/SYNTHESIS_MODEL.md §14/§17c.
 */
import {
  calculateKalchm,
  calculateThermodynamics,
  calculateMonica,
  MONICA_EQUILIBRIUM,
  KALCHM_EPSILON,
  MONICA_LN_EPSILON,
} from "@/data/unified/alchemicalCalculations";

const ZERO_ALCH = { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 };
const ZERO_ELEM = { Fire: 0, Water: 0, Air: 0, Earth: 0 };

// The shared probe input used across the §17c reconciliation.
const PROBE_ALCH = { Spirit: 4, Essence: 4, Matter: 4, Substance: 2 };
const PROBE_ELEM = { Fire: 0.3, Water: 0.25, Air: 0.25, Earth: 0.2 };

const full = (a: typeof ZERO_ALCH, e: typeof ZERO_ELEM) => {
  const t = calculateThermodynamics(a, e);
  const kalchm = calculateKalchm(a);
  const monica = calculateMonica(t.gregsEnergy, t.reactivity, kalchm);
  return { ...t, kalchm, monica };
};

describe("canonical thermodynamic contract — totality", () => {
  const inputs: Array<[string, typeof ZERO_ALCH, typeof ZERO_ELEM]> = [
    ["all-zero", ZERO_ALCH, ZERO_ELEM],
    ["probe", PROBE_ALCH, PROBE_ELEM],
    ["only-Spirit (near kalchm=1)", { Spirit: 1, Essence: 0, Matter: 0, Substance: 0 }, { Fire: 1, Water: 0, Air: 0, Earth: 0 }],
    ["symmetric ESMS", { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 }, { Fire: 0, Water: 1, Air: 0, Earth: 0 }],
    ["huge", { Spirit: 1e6, Essence: 1e6, Matter: 1e-6, Substance: 1e-6 }, { Fire: 1e6, Water: 0, Air: 0, Earth: 0 }],
    ["negative (defensive)", { Spirit: -5, Essence: -5, Matter: -5, Substance: -5 }, { Fire: -1, Water: -1, Air: -1, Earth: -1 }],
  ];

  it.each(inputs)("returns only finite values for %s", (_label, a, e) => {
    const r = full(a, e);
    for (const [k, v] of Object.entries(r)) {
      expect(Number.isFinite(v)).toBe(true);
      expect(v).not.toBeNaN();
      expect(v).not.toBeNull();
      // Belt-and-braces: no key is undefined either.
      expect(typeof v).toBe("number");
      void k;
    }
  });

  it("never returns NaN from calculateMonica across a kalchm sweep through 1", () => {
    // ln(kalchm)=0 exactly at kalchm=1 was the old NaN source.
    for (let k = 0.5; k <= 1.5; k += 0.001) {
      const m = calculateMonica(-0.44, 2.05, k);
      expect(Number.isFinite(m)).toBe(true);
    }
    // and pathological reactivity / kalchm inputs
    expect(Number.isFinite(calculateMonica(1, 0, 1))).toBe(true);
    expect(Number.isFinite(calculateMonica(1, 0, 0))).toBe(true);
    expect(Number.isFinite(calculateMonica(0, 0, -3))).toBe(true);
  });
});

describe("canonical thermodynamic contract — degenerate constants", () => {
  it("resolves all-zero input to the documented constants", () => {
    const r = full(ZERO_ALCH, ZERO_ELEM);
    expect(r.heat).toBe(0);
    expect(r.entropy).toBe(0);
    expect(r.reactivity).toBe(0);
    expect(r.gregsEnergy).toBe(0);
    expect(r.kalchm).toBe(1.0); // equilibrium
    expect(r.monica).toBe(MONICA_EQUILIBRIUM); // φ — perfect balance
  });

  it("returns φ for monica anywhere inside the equilibrium band", () => {
    // kalchm within exp(±MONICA_LN_EPSILON) of 1 is the balanced band.
    const insideHi = Math.exp(MONICA_LN_EPSILON * 0.5);
    const insideLo = Math.exp(-MONICA_LN_EPSILON * 0.5);
    expect(calculateMonica(-0.44, 2.05, insideHi)).toBe(MONICA_EQUILIBRIUM);
    expect(calculateMonica(-0.44, 2.05, insideLo)).toBe(MONICA_EQUILIBRIUM);
    expect(calculateMonica(-0.44, 2.05, 1)).toBe(MONICA_EQUILIBRIUM);
  });

  it("computes a normal monica outside the band (real charts unaffected)", () => {
    // kalchm=64 is far from 1 — the raw formula applies.
    const m = calculateMonica(-0.4389, 2.053005, 64);
    expect(m).not.toBe(MONICA_EQUILIBRIUM);
    expect(m).toBeCloseTo(0.0514, 3);
  });
});

describe("canonical thermodynamic contract — reference values on the probe", () => {
  it("pins the canonical output every forked engine converges toward", () => {
    const r = full(PROBE_ALCH, PROBE_ELEM);
    expect(r.heat).toBeCloseTo(0.140536, 5);
    expect(r.entropy).toBeCloseTo(0.282238, 5);
    // reactivity = (Matter+Earth)² form — the §17c canonical, NOT the
    // RealAlchemizeService (Σ/M)+Earth² fork that read 9.09.
    expect(r.reactivity).toBeCloseTo(2.053005, 5);
    expect(r.gregsEnergy).toBeCloseTo(-0.4389, 4);
    expect(r.kalchm).toBeCloseTo(64, 5);
  });

  it("exposes the epsilons as tunable constants", () => {
    expect(KALCHM_EPSILON).toBeGreaterThan(0);
    expect(MONICA_LN_EPSILON).toBeGreaterThan(0);
    expect(MONICA_EQUILIBRIUM).toBeCloseTo(1.618, 3);
  });
});
