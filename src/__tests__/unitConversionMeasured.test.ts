/**
 * Guards on the volume→gram conversion after it stopped assuming water.
 *
 * `[MEASURED 2026-08-18]` Across the 1,078-recipe corpus, converting every
 * volume unit at water density overstates the total mass of volume-measured
 * ingredients by 11.6 % (154.4 kg against a measured 138.4 kg, over 1,417
 * mentions), with individual errors reaching 15×. It errs in BOTH directions,
 * which is why the salt case below is not redundant with the flour one.
 *
 * @file src/__tests__/unitConversionMeasured.test.ts
 */
import { PORTIONS_BY_INGREDIENT } from "@/data/cooking/measuredPortions";
import {
  MEASURED_INGREDIENT_COUNT,
  UNIT_CONVERSIONS,
  convertToGrams,
  convertToGramsDetailed,
} from "@/utils/unitConversion";
import { calculateQuantityFactor } from "@/utils/quantityScaling";

describe("volume conversion uses measurements where they exist", () => {
  it("pins the three cases that motivated the change", () => {
    // Each is a real USDA measured weight. The water assumption is 240 g for
    // all three, and it is wrong in both directions.
    const cases: Array<[string, number, number]> = [
      ["all-purpose flour", 125, 240 / 125], // 1.92x OVERstated before
      ["cilantro", 16, 240 / 16], // 15.00x OVERstated before
      ["salt", 292, 240 / 292], // 0.82x UNDERstated before
    ];
    for (const [ingredient, wantGrams, wantOldRatio] of cases) {
      const got = convertToGramsDetailed(1, "cup", ingredient);
      expect(got).not.toBeNull();
      expect(got!.grams).toBeCloseTo(wantGrams, 4);
      expect(got!.basis).toBe("usda-measured");
      expect(got!.fdcId).toBeGreaterThan(0);
      // A measured figure never carries an approximation note.
      expect(got!.approximationNote).toBeUndefined();
      // And it genuinely differs from what the old table would have said.
      expect(UNIT_CONVERSIONS.cup / got!.grams).toBeCloseTo(wantOldRatio, 1);
    }
  });

  it("resolves the spellings a recipe actually uses", () => {
    // Normalise on read: the corpus says "sea salt" and "extra virgin olive
    // oil", the measured rows say "Salt" and "Olive Oil". Aliases bridge them
    // without renaming either source.
    expect(convertToGramsDetailed(1, "cup", "sea salt")!.basis).toBe("usda-measured");
    expect(convertToGramsDetailed(1, "cup", "Kosher Salt")!.basis).toBe("usda-measured");
    expect(convertToGramsDetailed(1, "cup", "extra virgin olive oil")!.basis).toBe("usda-measured");
    expect(convertToGramsDetailed(1, "cup", "granulated sugar")!.basis).toBe("usda-measured");
  });

  it("LABELS the fallback rather than letting absence look like data", () => {
    // The defect was never that a number was wrong. It was that a number was
    // always returned, with nothing to say it had been assumed.
    const unmeasured = convertToGramsDetailed(1, "cup", "quinoa");
    expect(unmeasured).not.toBeNull();
    expect(unmeasured!.basis).toBe("water-approximation");
    expect(unmeasured!.fdcId).toBeUndefined();
    expect(unmeasured!.approximationNote).toContain("quinoa");
    expect(unmeasured!.approximationNote).toMatch(/water density/i);

    // No name supplied at all — same treatment, and the note says so.
    const nameless = convertToGramsDetailed(1, "cup");
    expect(nameless!.basis).toBe("water-approximation");
    expect(nameless!.approximationNote).toMatch(/this ingredient/i);
  });

  it("does not attach an approximation note to a WEIGHT unit", () => {
    // Grams are grams whatever the ingredient is. Flagging them would be noise
    // and would train readers to ignore the flag that matters.
    const grams = convertToGramsDetailed(100, "g", "quinoa");
    expect(grams!.basis).toBe("water-approximation");
    expect(grams!.approximationNote).toBeUndefined();
    expect(grams!.grams).toBe(100);
  });

  it("keeps the old signature working for callers that have no name", () => {
    expect(convertToGrams(1, "cup")).toBe(UNIT_CONVERSIONS.cup);
    expect(convertToGrams(2, "g")).toBe(2);
    expect(convertToGrams(1, "not a unit")).toBeNull();
    expect(convertToGrams(0, "cup")).toBeNull();
    expect(convertToGrams(-1, "cup")).toBeNull();
  });

  it("reports its coverage rather than implying the table is complete", () => {
    // Only a minority of ingredients have measured portions, so MOST of the
    // corpus still takes the approximation path. That number is exported so a
    // caller can say so, instead of the absence being invisible.
    expect(MEASURED_INGREDIENT_COUNT).toBe(PORTIONS_BY_INGREDIENT.size);
    expect(MEASURED_INGREDIENT_COUNT).toBeGreaterThan(0);
  });
});

describe("the elemental quantity factor moves with the measurement", () => {
  it("weights a cup of cilantro far below a cup of flour", () => {
    // Before, both were 240 g and therefore identically weighted. The whole
    // point of threading the name through is that they no longer are.
    const cilantro = calculateQuantityFactor(1, "cup", "g", "cilantro");
    const flour = calculateQuantityFactor(1, "cup", "g", "all-purpose flour");
    expect(cilantro).toBeLessThan(flour);
  });

  it("still returns something sane when no name is available", () => {
    // The signature is optional, so every existing caller keeps working — it
    // just keeps the old water-density behaviour until a name is threaded in.
    const factor = calculateQuantityFactor(1, "cup");
    expect(factor).toBeGreaterThanOrEqual(0.1);
    expect(factor).toBeLessThanOrEqual(2.0);
  });

  it("stays inside its clamped range for absurd inputs", () => {
    expect(calculateQuantityFactor(1000, "cup", "g", "salt")).toBeLessThanOrEqual(2.0);
    expect(calculateQuantityFactor(0.001, "tsp", "g", "salt")).toBeGreaterThanOrEqual(0.1);
  });
});
