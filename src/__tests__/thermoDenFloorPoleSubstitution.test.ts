/**
 * THERMO_DEN_FLOOR is ASSUMED and load-bearing (§18k k30), so what has to be
 * checked is not its value but the SHAPE of what it does — and that shape is
 * counter-intuitive enough to have been mis-documented as a "floor" for months.
 *
 * Three claims are re-derived here on every run:
 *
 *   1. It is a POLE SUBSTITUTION, never an interpolation. No denominator ever
 *      lands in the open band (0, 0.01), so `Math.max(den, 0.01)` only ever
 *      fires on an exact 0.
 *   2. Only the REACTIVITY denominator reaches zero. The heat and entropy floors
 *      are inert on this population.
 *   3. The clamped values form a band that is DISJOINT FROM and far above every
 *      genuine value — so any max/percentile/normalisation over reactivity is
 *      dominated by this constant rather than by the data.
 *
 * If the vessel, the dignity table, the pillar effects or the sectarian ESMS
 * change, these move and THIS FAILS, which is the point.
 *
 * The grid is exhaustive, not sampled: 11 planets x 12 signs x 30 degrees x 2
 * sects. Mirrors the enumeration in `monicaLnEpsilonDerivation.test.ts`.
 */
import { ALCHEMICAL_PILLARS } from "@/constants/alchemicalPillars";
import {
  THERMO_DEN_FLOOR,
  calculateThermodynamics,
} from "@/data/unified/alchemicalCalculations";
import { getDignityScore } from "@/utils/dignityScales";
import { PLANETARY_SECTARIAN_ESMS, ZODIAC_ELEMENTS } from "@/utils/planetaryAlchemyMapping";
import { groundingVessel, type ESMS } from "@/utils/agentMonica";
import type { AlchemicalProperties } from "@/types/celestial";

const ZERO: ESMS = { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 };

type Cell = {
  sign: string; degree: number; pillar: number;
  heatDen: number; entropyDen: number; reactDen: number;
  reactNum: number; reactivity: number;
  Matter: number; Earth: number;
};

function enumerateCells(): Cell[] {
  const out: Cell[] = [];
  for (const planet of Object.keys(PLANETARY_SECTARIAN_ESMS)) {
    const table = PLANETARY_SECTARIAN_ESMS[planet as keyof typeof PLANETARY_SECTARIAN_ESMS];
    for (const sign of Object.keys(ZODIAC_ELEMENTS)) {
      const dignityScale = getDignityScore(planet, sign as never).esmsScale;
      const element = ZODIAC_ELEMENTS[sign as keyof typeof ZODIAC_ELEMENTS];
      const Fire = element === "Fire" ? 1 : 0;
      const Water = element === "Water" ? 1 : 0;
      const Air = element === "Air" ? 1 : 0;
      const Earth = element === "Earth" ? 1 : 0;
      const elementalProps = { Fire, Water, Air, Earth };
      for (let degree = 0; degree < 30; degree++) {
        const v = groundingVessel(degree, dignityScale);
        for (const sect of ["diurnal", "nocturnal"] as const) {
          const base: ESMS = table ? { ...ZERO, ...table[sect] } : ZERO;
          const S = base.Spirit + v.Spirit;
          const E = base.Essence + v.Essence;
          const M = base.Matter + v.Matter;
          const Su = base.Substance + v.Substance;
          const esms = { Spirit: S, Essence: E, Matter: M, Substance: Su };
          out.push({
            sign, degree,
            pillar: ((Math.floor(degree) - 1) % 14 + 14) % 14,
            heatDen: (Su + E + M + Water + Air + Earth) ** 2,
            entropyDen: (E + M + Earth + Water) ** 2,
            reactDen: (M + Earth) ** 2,
            reactNum: S ** 2 + Su ** 2 + E ** 2 + Fire ** 2 + Air ** 2 + Water ** 2,
            reactivity: calculateThermodynamics(esms as AlchemicalProperties, elementalProps).reactivity,
            Matter: M, Earth,
          });
        }
      }
    }
  }
  return out;
}

const CELLS = enumerateCells();
const inBand = (d: number) => d > 0 && d < THERMO_DEN_FLOOR;

describe("THERMO_DEN_FLOOR is a pole substitution (§18k k30)", () => {
  it("enumerates the whole single-body population", () => {
    expect(CELLS.length).toBe(7920);
  });

  it("on THIS POPULATION it never interpolates — nothing lands in (0, 0.01)", () => {
    // ⚠️ Scoped to the single-body grid deliberately. Generalising this census to
    // the function is exactly the error corrected below in "CALLER input CAN land
    // in the open band" — caller-supplied elementals reach it and the clamp then
    // understates by up to 10,000x.
    expect(CELLS.filter((c) => inBand(c.heatDen)).length).toBe(0);
    expect(CELLS.filter((c) => inBand(c.entropyDen)).length).toBe(0);
    expect(CELLS.filter((c) => inBand(c.reactDen)).length).toBe(0);

    // CONTROL: the band predicate must be able to say yes, or the three zeros
    // above are vacuous.
    expect(inBand(0.005)).toBe(true);
    expect(inBand(0)).toBe(false);
    expect(inBand(0.81)).toBe(false);
  });

  it("only the reactivity denominator ever reaches zero", () => {
    expect(CELLS.filter((c) => c.heatDen === 0).length).toBe(0);
    expect(CELLS.filter((c) => c.entropyDen === 0).length).toBe(0);
    expect(CELLS.filter((c) => c.reactDen === 0).length).toBe(1008);

    // The heat and entropy floors are inert: their minima sit far above 0.01.
    expect(Math.min(...CELLS.map((c) => c.heatDen))).toBe(3.24);
    expect(Math.min(...CELLS.map((c) => c.entropyDen))).toBe(1.44);
    // And nothing lies between 0 and the smallest non-zero reactivity
    // denominator, which is why no gap exists to derive the constant from.
    expect(Math.min(...CELLS.filter((c) => c.reactDen > 0).map((c) => c.reactDen))).toBe(0.81);
  });

  it("the three conditions that make (Matter + Earth) exactly zero", () => {
    const z = CELLS.filter((c) => c.reactDen === 0);
    // Both terms non-negative, so both must be exactly 0.
    expect(z.every((c) => c.Earth === 0)).toBe(true);
    expect(z.every((c) => c.Matter === 0)).toBe(true);
    // Earth signs are structurally exempt.
    expect(
      z.every((c) => ZODIAC_ELEMENTS[c.sign as keyof typeof ZODIAC_ELEMENTS] !== "Earth"),
    ).toBe(true);
    // Exactly the four pillars whose Matter effect is -1.
    expect([...new Set(z.map((c) => c.pillar))].sort((a, b) => a - b)).toEqual([1, 2, 3, 8]);
    expect(
      [1, 2, 3, 8].every((i) => ALCHEMICAL_PILLARS[i].effects.Matter === -1),
    ).toBe(true);
    expect([...new Set(z.map((c) => c.degree))].sort((a, b) => a - b)).toEqual(
      [2, 3, 4, 9, 16, 17, 18, 23],
    );
  });

  it("it is a TRUE pole, not an indeterminate 0/0", () => {
    // If the numerator were also 0 the value would be genuinely undefined and
    // substituting something would be defensible on different grounds. It is not:
    // the numerator is strictly positive, so the true limit is +Infinity and 0.01
    // is choosing where to cap it.
    const z = CELLS.filter((c) => c.reactDen === 0);
    expect(z.filter((c) => c.reactNum === 0).length).toBe(0);
    expect(Math.min(...z.map((c) => c.reactNum))).toBe(8.48);
    expect(Math.max(...z.map((c) => c.reactNum))).toBe(16.080000000000002);
  });

  it("the manufactured band is disjoint from, and far above, the real data", () => {
    // ⚠️ The consequence that matters for consumers: a max, a percentile or a
    // normalisation over reactivity is dominated by this constant.
    const manufactured = CELLS.filter((c) => c.reactDen === 0).map((c) => c.reactivity);
    const genuine = CELLS.filter((c) => c.reactDen > 0).map((c) => c.reactivity);

    expect(Math.max(...genuine)).toBe(20);
    expect(Math.min(...manufactured)).toBe(848);
    expect(Math.max(...manufactured)).toBe(1608.0000000000002);
    expect(Math.min(...manufactured)).toBeGreaterThan(Math.max(...genuine));

    // Every manufactured value is exactly numerator / THERMO_DEN_FLOOR — i.e. the
    // constant sets this band directly. Halving it would double the band.
    const z = CELLS.filter((c) => c.reactDen === 0);
    expect(z.every((c) => c.reactivity === c.reactNum / THERMO_DEN_FLOOR)).toBe(true);

    // The 90th percentile lands INSIDE the manufactured band.
    const sorted = [...manufactured, ...genuine].sort((a, b) => a - b);
    const p90 = sorted[Math.floor(0.9 * (sorted.length - 1))];
    expect(p90).toBeGreaterThan(Math.max(...genuine));
  });

  it("CALLER input in the open band is now EXACT, not interpolated", () => {
    // `[CORRECTED 2026-07-29]` The grid census above says 0 cells fall in
    // (0, 0.01). An earlier revision generalised that to the function and called
    // the clamp "never" a small-denominator guard. False — and it mattered
    // because GET /api/alchemize takes caller-supplied elementals.
    //
    // `[FIXED 2026-07-30]` The engine no longer clamps there. `Math.max(den,
    // floor)` became `thermoQuotient`, which is exact for any den > 0 and
    // substitutes ONLY at an exact 0. This test previously PINNED the
    // interpolation as correct behaviour; it now pins its removal.
    const esms = {
      Spirit: 2.3684111079749997,
      Essence: 1.5543791025227327,
      Matter: 0,
      Substance: 0,
    };
    const el = { Fire: 0, Water: 0, Air: 0, Earth: 0.001 };
    const den = (esms.Matter + el.Earth) ** 2;
    expect(den).toBe(1e-6);
    expect(inBand(den)).toBe(true); // inside (0, 0.01) — unreachable on the grid

    const num =
      esms.Spirit ** 2 + esms.Substance ** 2 + esms.Essence ** 2 +
      el.Fire ** 2 + el.Air ** 2 + el.Water ** 2;
    const exact = num / den;
    const served = calculateThermodynamics(esms as AlchemicalProperties, el).reactivity;

    // What the engine serves is now the true ratio.
    expect(served).toBe(exact);

    // And it is NOT what the old clamp would have produced — the regression
    // guard. That value was 10,000x low here, and unboundedly low as den -> 0.
    const wouldHaveBeenClamped = num / THERMO_DEN_FLOOR;
    expect(served).not.toBe(wouldHaveBeenClamped);
    expect(exact / wouldHaveBeenClamped).toBe(10000);

    // The old understatement grew without bound as den -> 0; confirm the fix
    // holds at a tighter denominator too rather than only at this one point.
    // Tolerance rather than `===` deliberately: 0.0001**2 does not round-trip.
    const tighter = { ...el, Earth: 0.0001 };
    const servedTighter = calculateThermodynamics(
      esms as AlchemicalProperties,
      tighter,
    ).reactivity;
    expect(servedTighter).toBeCloseTo(num / tighter.Earth ** 2, 0);
    expect(servedTighter / wouldHaveBeenClamped).toBeGreaterThan(exact / wouldHaveBeenClamped);
  });

  it("still substitutes at an EXACT zero — the API contract is unchanged", () => {
    // The pole treatment is deliberately untouched: at den === 0 the numerator
    // is strictly positive, so the limit is +Infinity and THERMO_DEN_FLOOR is
    // the published choice of where to cap it (§18k k30: keep it, do not derive
    // it, do not delete it). Removing the interpolation must not have removed
    // this.
    const esms = { Spirit: 3, Essence: 2, Matter: 0, Substance: 1 };
    const el = { Fire: 1, Water: 0, Air: 0, Earth: 0 };
    expect((esms.Matter + el.Earth) ** 2).toBe(0);

    const num =
      esms.Spirit ** 2 + esms.Substance ** 2 + esms.Essence ** 2 +
      el.Fire ** 2 + el.Air ** 2 + el.Water ** 2;
    const served = calculateThermodynamics(esms as AlchemicalProperties, el).reactivity;
    expect(served).toBe(num / THERMO_DEN_FLOOR);
    expect(Number.isFinite(served)).toBe(true);
  });

  it("the isFinite guard IS reachable — a missing elemental key zeroes everything", () => {
    // `[CORRECTED 2026-07-29]` The comment beside that guard said "not a
    // reachable branch". A missing key destructures to undefined, every result
    // becomes NaN, and all four fall through to 0.
    const esms = { Spirit: 4, Essence: 4, Matter: 4, Substance: 2 };
    const missingAir = { Fire: 0.3, Water: 0.25, Earth: 0.2 } as never;
    const r = calculateThermodynamics(esms as AlchemicalProperties, missingAir);
    expect(Object.values(r)).toEqual([0, 0, 0, 0]);

    // CONTROL: the complete object must NOT be all zeros, or the assertion above
    // would pass for any input at all.
    const complete = { Fire: 0.3, Water: 0.25, Air: 0.25, Earth: 0.2 };
    const c = calculateThermodynamics(esms as AlchemicalProperties, complete);
    expect(c.reactivity).toBe(2.0530045351473922);
  });

  it("the clamp is NOT uniform — a confound for cross-sect comparison", () => {
    // Earth signs and most nocturnal sects are exempt, so the inflation is
    // systematic rather than spread evenly. Anything comparing reactivity across
    // sects or elements inherits this.
    const z = CELLS.filter((c) => c.reactDen === 0);
    const bySign = new Map<string, number>();
    for (const c of z) bySign.set(c.sign, (bySign.get(c.sign) ?? 0) + 1);
    expect(bySign.size).toBe(9);
    for (const earthSign of ["Taurus", "Virgo", "Capricorn"]) {
      expect(bySign.has(earthSign)).toBe(false);
    }
  });
});
