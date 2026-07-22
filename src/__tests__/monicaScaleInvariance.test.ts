/**
 * HOW do the six thermodynamic quantities respond to a change of body count?
 *
 * This is the measurement the whole full-chart decision rests on. §18 stores one
 * `monica_constant` column fed by THREE constructions with different body counts
 * (single-body 1, two-body 2, full-chart ~10). If monica were stable under body
 * count those would be comparable; if it is not, the column holds incomparable
 * numbers and no discriminator column rescues a reader that averages them.
 *
 * A change of body count is modelled as a uniform scaling of the ESMS vector,
 * which is what adding bodies does to first order: every axis grows.
 *
 * ⚠️ MEASURED RESULT, and it corrected a claim that was nearly written into the
 * spec. It is NOT true that "heat/entropy/reactivity/gregsEnergy are exactly
 * scale-invariant while monica is not". None of the six is invariant. Four of
 * them SATURATE (bounded, asymptotic, ~15-36% total drift over a 40x scaling)
 * while `ln(kalchm)` grows without bound (147x over the same range) — so monica,
 * which divides by it, collapses. Domination, not invariance, is the real story.
 */
import {
  calculateKalchm,
  calculateMonica,
  calculateThermodynamics,
} from "@/data/unified/alchemicalCalculations";
import type { AlchemicalProperties, ElementalProperties } from "@/types/celestial";

const BASE: AlchemicalProperties = {
  Spirit: 1.7,
  Essence: 2.3,
  Matter: 1.1,
  Substance: 0.8,
} as AlchemicalProperties;

const ELEMENTS: ElementalProperties = {
  Fire: 0.4,
  Water: 0.3,
  Air: 0.2,
  Earth: 0.1,
} as ElementalProperties;

const SCALES = [1, 2, 5, 10, 40] as const;

function quantities(k: number) {
  const esms = {
    Spirit: BASE.Spirit * k,
    Essence: BASE.Essence * k,
    Matter: BASE.Matter * k,
    Substance: BASE.Substance * k,
  } as AlchemicalProperties;
  const t = calculateThermodynamics(esms, ELEMENTS);
  const kalchm = calculateKalchm(esms);
  return {
    heat: t.heat,
    entropy: t.entropy,
    reactivity: t.reactivity,
    gregsEnergy: t.gregsEnergy,
    kalchm,
    lnKalchm: Math.log(kalchm),
    monica: calculateMonica(t.gregsEnergy, t.reactivity, kalchm),
  };
}

/** max/min of |x| across the scale sweep — how far a quantity travels. */
function spread(pick: (q: ReturnType<typeof quantities>) => number): number {
  const vals = SCALES.map((k) => Math.abs(pick(quantities(k))));
  return Math.max(...vals) / Math.max(Math.min(...vals), 1e-15);
}

describe("thermodynamics under a change of body count", () => {
  const at1 = quantities(1);

  it("the base case is non-degenerate (guard: else everything below is vacuous)", () => {
    expect(Number.isFinite(at1.monica)).toBe(true);
    // Outside the equilibrium band, or monica would be a constant φ and no
    // scale response could be observed at all.
    expect(Math.abs(at1.lnKalchm)).toBeGreaterThan(0.05);
    expect(Math.abs(at1.monica)).toBeGreaterThan(0.01);
  });

  it("NOTHING is exactly scale-invariant — including the four that saturate", () => {
    for (const k of [2, 5, 10, 40]) {
      const q = quantities(k);
      expect(q.heat).not.toBeCloseTo(at1.heat, 6);
      expect(q.entropy).not.toBeCloseTo(at1.entropy, 6);
      expect(q.reactivity).not.toBeCloseTo(at1.reactivity, 6);
      expect(q.gregsEnergy).not.toBeCloseTo(at1.gregsEnergy, 6);
    }
  });

  it("but heat/entropy/reactivity/gregsEnergy SATURATE — bounded drift", () => {
    // Each stays within a small factor across a 40x scaling, and is monotone
    // toward an asymptote. These are the quantities that remain broadly
    // comparable across body counts.
    expect(spread((q) => q.heat)).toBeLessThan(1.5);
    expect(spread((q) => q.entropy)).toBeLessThan(1.5);
    expect(spread((q) => q.reactivity)).toBeLessThan(1.5);
    expect(spread((q) => q.gregsEnergy)).toBeLessThan(2);
  });

  it("ln(kalchm) grows WITHOUT saturating — two orders of magnitude", () => {
    // K = (S^S · E^E) / (M^M · Su^Su): scaling raises the exponents as well as
    // the bases, so ln K grows superlinearly and has no fixed point.
    expect(spread((q) => q.lnKalchm)).toBeGreaterThan(100);

    // Strictly monotone increasing — not noise.
    const lns = SCALES.map((k) => quantities(k).lnKalchm);
    for (let i = 1; i < lns.length; i++) expect(lns[i]).toBeGreaterThan(lns[i - 1]);
  });

  it("so MONICA COLLAPSES as body count rises — the load-bearing result", () => {
    const monicas = SCALES.map((k) => quantities(k).monica);

    // Strictly decreasing in magnitude…
    for (let i = 1; i < monicas.length; i++) {
      expect(Math.abs(monicas[i])).toBeLessThan(Math.abs(monicas[i - 1]));
    }
    // …by two orders of magnitude over the sweep. This is why a full-chart
    // monica is far SMALLER than a single-body one, and why the two must never
    // be compared or averaged in one column.
    expect(spread((q) => q.monica)).toBeGreaterThan(100);
  });

  it("the collapse is driven by ln(kalchm), not by G or R", () => {
    // monica = −G / (R · ln K) holds exactly at every scale (definitional).
    for (const k of SCALES) {
      const q = quantities(k);
      expect(q.monica).toBeCloseTo(-q.gregsEnergy / (q.reactivity * q.lnKalchm), 10);
    }
    // And ln K travels ~2 orders of magnitude further than G·R does, so it
    // dominates the ratio.
    const gr = spread((q) => q.gregsEnergy * q.reactivity);
    expect(spread((q) => q.lnKalchm) / gr).toBeGreaterThan(50);
  });
});
