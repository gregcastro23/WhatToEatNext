/**
 * MONICA_REACTIVITY_FLOOR is ASSUMED, not derived (§18k k26) — so the thing that
 * has to be checked is not its value but its INERTNESS. This re-derives that on
 * every run.
 *
 * The claim in the constant's docstring is structural, not a lucky margin: the
 * minimum reactivity the single-body population can produce is 0.2243767…, so any
 * floor strictly below that cannot fire at all. If the vessel, the dignity table
 * or the sectarian ESMS move, the minimum moves with them and THIS FAILS — which
 * is the point. Without it the docstring would be a comment asserting a
 * measurement nobody re-checks, which is exactly how the constant came to carry a
 * name describing a job it had not done for two months.
 *
 * The grid is exhaustive, not sampled: the single-body population is fully
 * determined by planet x sign x degree x sect. Mirrors the enumeration in
 * `monicaLnEpsilonDerivation.test.ts`, which does the same job for the DERIVED
 * constant.
 */
import {
  MONICA_EQUILIBRIUM,
  MONICA_LN_EPSILON,
  MONICA_REACTIVITY_FLOOR,
  calculateKalchm,
  calculateMonica,
  calculateThermodynamics,
} from "@/data/unified/alchemicalCalculations";
import { getDignityScore } from "@/utils/dignityScales";
import { PLANETARY_SECTARIAN_ESMS, ZODIAC_ELEMENTS } from "@/utils/planetaryAlchemyMapping";
import { groundingVessel, type ESMS } from "@/utils/agentMonica";
import type { AlchemicalProperties } from "@/types/celestial";

const ZERO: ESMS = { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 };

/** The (gregsEnergy, reactivity, kalchm) triple every single-body cell produces. */
type Cell = { gregsEnergy: number; reactivity: number; kalchm: number };

function enumerateCells(): Cell[] {
  const out: Cell[] = [];
  for (const planet of Object.keys(PLANETARY_SECTARIAN_ESMS)) {
    const table = PLANETARY_SECTARIAN_ESMS[planet as keyof typeof PLANETARY_SECTARIAN_ESMS];
    for (const sign of Object.keys(ZODIAC_ELEMENTS)) {
      const dignityScale = getDignityScore(planet, sign as never).esmsScale;
      const element = ZODIAC_ELEMENTS[sign as keyof typeof ZODIAC_ELEMENTS];
      // Single-body elements come from the sign — the same mapping agentMonica
      // uses when it builds the value that is written to production.
      const elementalProps = {
        Fire: element === "Fire" ? 1 : 0,
        Water: element === "Water" ? 1 : 0,
        Air: element === "Air" ? 1 : 0,
        Earth: element === "Earth" ? 1 : 0,
      };
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
          const t = calculateThermodynamics(esms as AlchemicalProperties, elementalProps);
          out.push({
            gregsEnergy: t.gregsEnergy,
            reactivity: t.reactivity,
            kalchm: calculateKalchm(esms as AlchemicalProperties),
          });
        }
      }
    }
  }
  return out;
}

/**
 * `calculateMonica` with the floor as a parameter, so alternatives can be
 * compared. `floor = 0` means no floor at all.
 *
 * This is a re-implementation, and a re-implementation that has drifted from the
 * original proves nothing — so the first test below pins it against the real
 * exported function at the shipped floor before any other test uses it.
 */
function monicaWithFloor(
  gregsEnergy: number,
  reactivity: number,
  kalchm: number,
  floor: number,
): number {
  if (!Number.isFinite(kalchm) || kalchm <= 0) return MONICA_EQUILIBRIUM;
  const lnKalchm = Math.log(kalchm);
  if (Math.abs(lnKalchm) < MONICA_LN_EPSILON) return MONICA_EQUILIBRIUM;
  const safeReactivity =
    floor > 0 && Math.abs(reactivity) < floor
      ? Math.sign(reactivity || 1) * floor
      : reactivity;
  const monica = -gregsEnergy / (safeReactivity * lnKalchm);
  return Number.isFinite(monica) ? monica : MONICA_EQUILIBRIUM;
}

const CELLS = enumerateCells();

describe("MONICA_REACTIVITY_FLOOR inertness (§18k k26)", () => {
  it("enumerates the whole single-body population, not a sample", () => {
    // 11 planets x 12 signs x 30 degrees x 2 sects.
    expect(CELLS.length).toBe(7920);
  });

  it("CONTROL: the parameterised monica matches the shipped one at the shipped floor", () => {
    // Without this, every comparison below could be measuring the difference
    // between two implementations rather than between two floors.
    let mismatches = 0;
    for (const c of CELLS) {
      const mine = monicaWithFloor(
        c.gregsEnergy,
        c.reactivity,
        c.kalchm,
        MONICA_REACTIVITY_FLOOR,
      );
      const theirs = calculateMonica(c.gregsEnergy, c.reactivity, c.kalchm);
      if (!Object.is(mine, theirs)) mismatches++;
    }
    expect(mismatches).toBe(0);
  });

  it("the floor sits below every reactivity this population can produce", () => {
    const reactivities = CELLS.map((c) => c.reactivity);
    const min = Math.min(...reactivities);

    // Exact, not toBeCloseTo. A tolerant assertion here would pass against a
    // wrong value, which is how three Sacred-7 scales once shipped irreproducible.
    expect(min).toBe(0.22437673130193908);

    // The inertness is structural: nothing below the minimum can ever fire.
    expect(MONICA_REACTIVITY_FLOOR).toBeLessThan(min);

    // Neither of the two shapes the guard exists to catch occurs here. Both are
    // zero results, so both are controlled by the assertions above and below:
    // `min` is a real positive number the probe genuinely computed.
    expect(reactivities.filter((r) => r === 0).length).toBe(0);
    expect(reactivities.filter((r) => r < 0).length).toBe(0);
  });

  it("removing the floor entirely changes nothing on this population", () => {
    let changed = 0;
    for (const c of CELLS) {
      const withFloor = calculateMonica(c.gregsEnergy, c.reactivity, c.kalchm);
      const without = monicaWithFloor(c.gregsEnergy, c.reactivity, c.kalchm, 0);
      if (!Object.is(withFloor, without)) changed++;
    }
    expect(changed).toBe(0);
  });

  it("CONTROL: a floor above the minimum reactivity DOES change values", () => {
    // A comparator that can only ever report 0 would make the test above
    // vacuous. Raise the floor past the population minimum and it must bite.
    const min = Math.min(...CELLS.map((c) => c.reactivity));
    let changed = 0;
    for (const c of CELLS) {
      const withFloor = calculateMonica(c.gregsEnergy, c.reactivity, c.kalchm);
      const raised = monicaWithFloor(c.gregsEnergy, c.reactivity, c.kalchm, min * 1.5);
      if (!Object.is(withFloor, raised)) changed++;
    }
    expect(changed).toBeGreaterThan(0);
  });

  it("pins where values first move, so the docstring's bound stays true", () => {
    // [MEASURED 2026-07-28] Quoted in the constant's docstring. If these move,
    // the docstring is stale and this fails rather than the comment quietly
    // becoming a lie.
    const changedAt = (floor: number) =>
      CELLS.filter(
        (c) =>
          !Object.is(
            calculateMonica(c.gregsEnergy, c.reactivity, c.kalchm),
            monicaWithFloor(c.gregsEnergy, c.reactivity, c.kalchm, floor),
          ),
      ).length;

    for (const inert of [0, 0.0001, 0.001, 0.01, 0.05, 0.1, 0.2]) {
      expect([inert, changedAt(inert)]).toEqual([inert, 0]);
    }
    expect(changedAt(0.5)).toBe(306);
    expect(changedAt(1)).toBe(1430);
  });
});
