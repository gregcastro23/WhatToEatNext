/**
 * Elemental -> ESMS derivation: the transfer coefficients, pinned.
 *
 * `elementalToAlchemicalApproximation` was deleted because it DOUBLE-COUNTED
 * EARTH: `elemental.Earth` appeared at full weight in BOTH `Matter` and
 * `Substance`, so a unit of Earth produced 2.0 units of ESMS while a unit of
 * Air produced 0.4. That is not a tuning choice, it is a structural defect —
 * the same input element contributing twice to the total.
 *
 * The "transfer coefficient" of an element is measured, not asserted: feed a
 * one-hot elemental vector and sum the four ESMS outputs. Nothing here restates
 * the formula, so this file cannot drift from the implementation the way a
 * copied formula would.
 *
 * ⚠️ NOTE WHAT IS *NOT* CLAIMED HERE. Canonical is **not** mass-preserving
 * either — its coefficients are Fire 1.0 / Water 1.2 / Earth 1.2 / Air 0.6, so
 * ΣESMS still varies with the input MIX (measured 0.76 .. 1.13 across
 * normalized inputs). The defensible claim for the swap is narrower and
 * survives measurement: Earth no longer counts twice, and the spread across
 * elements collapses from 5.0x to 2.0x.
 */

import { deriveAlchemicalFromElemental } from "@/data/unified/alchemicalCalculations";
import type { ElementalProperties } from "@/types/alchemy";

const ELEMENTS = ["Fire", "Water", "Earth", "Air"] as const;

const zero = (): ElementalProperties => ({ Fire: 0, Water: 0, Earth: 0, Air: 0 });

/** One-hot input for a single element. */
const oneHot = (el: (typeof ELEMENTS)[number]): ElementalProperties => ({
  ...zero(),
  [el]: 1,
});

const esmsSum = (e: ReturnType<typeof deriveAlchemicalFromElemental>) =>
  e.Spirit + e.Essence + e.Matter + e.Substance;

/** How much total ESMS one unit of `el` contributes. */
const transferCoefficient = (el: (typeof ELEMENTS)[number]) =>
  esmsSum(deriveAlchemicalFromElemental(oneHot(el)));

describe("elemental -> ESMS transfer coefficients", () => {
  it("gives Earth the same order of weight as every other element", () => {
    // THE REGRESSION GUARD. The deleted approximation scored Earth at 2.0.
    // Anything at or above 2.0 means Earth is being counted twice again.
    expect(transferCoefficient("Earth")).toBeLessThan(2.0);
  });

  it("matches the canonical coefficients exactly", () => {
    expect(transferCoefficient("Fire")).toBeCloseTo(1.0, 10);
    expect(transferCoefficient("Water")).toBeCloseTo(1.2, 10);
    expect(transferCoefficient("Earth")).toBeCloseTo(1.2, 10);
    expect(transferCoefficient("Air")).toBeCloseTo(0.6, 10);
  });

  it("keeps the spread across elements within 2x", () => {
    // The deleted approximation spanned 0.4 (Air) .. 2.0 (Earth) = 5.0x.
    const coefficients = ELEMENTS.map(transferCoefficient);
    const spread = Math.max(...coefficients) / Math.min(...coefficients);
    expect(spread).toBeCloseTo(2.0, 10);
    expect(spread).toBeLessThan(5.0);
  });

  it("no single element dominates the Matter/Substance pair", () => {
    // The precise shape of the old defect: Earth landed at full weight in two
    // different output axes at once. Assert no element does that any more.
    for (const el of ELEMENTS) {
      const out = deriveAlchemicalFromElemental(oneHot(el));
      const atFullWeight = [out.Spirit, out.Essence, out.Matter, out.Substance].filter(
        (v) => v >= 1,
      );
      expect(atFullWeight.length).toBeLessThanOrEqual(1);
    }
  });

  it("is linear, so the coefficients fully describe it (control)", () => {
    // If this fails the coefficient model above is not a valid summary and the
    // rest of this file proves less than it claims.
    const mixed: ElementalProperties = { Fire: 0.4, Water: 0.3, Earth: 0.2, Air: 0.1 };
    const predicted =
      0.4 * transferCoefficient("Fire") +
      0.3 * transferCoefficient("Water") +
      0.2 * transferCoefficient("Earth") +
      0.1 * transferCoefficient("Air");
    expect(esmsSum(deriveAlchemicalFromElemental(mixed))).toBeCloseTo(predicted, 10);
  });

  it("is NOT mass-preserving, and that is recorded rather than assumed", () => {
    // Guards against someone later "documenting" mass preservation because two
    // convenient inputs happen to sum to 1. They do so only when W+E == 2A.
    const airHeavy: ElementalProperties = { Fire: 0.1, Water: 0.1, Earth: 0.1, Air: 0.7 };
    const earthHeavy: ElementalProperties = { Fire: 0.1, Water: 0.1, Earth: 0.7, Air: 0.1 };
    expect(esmsSum(deriveAlchemicalFromElemental(airHeavy))).toBeCloseTo(0.76, 10);
    expect(esmsSum(deriveAlchemicalFromElemental(earthHeavy))).toBeCloseTo(1.12, 10);

    // The coincidence that makes it *look* mass-preserving:
    const balanced: ElementalProperties = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
    expect(esmsSum(deriveAlchemicalFromElemental(balanced))).toBeCloseTo(1.0, 10);
  });
});
