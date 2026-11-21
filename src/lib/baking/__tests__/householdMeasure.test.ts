/**
 * @jest-environment node
 *
 * Household measures beside grams: each one divides by USDA's own weight for
 * that measure of that ingredient, and rounds only to real kitchen tools.
 */
import { BAKING_INGREDIENTS } from "@/data/baking";
import { fractionText, householdMeasure, roundToParts } from "@/lib/baking/householdMeasure";
import { portionWeight } from "@/lib/baking/recipes/portions";

function text(id: string, grams: number): string {
  const m = householdMeasure(id, grams);
  return m.ok ? m.text : `refused: ${m.reason}`;
}

describe("household measures", () => {
  it("formats fractions with kitchen glyphs", () => {
    expect([0.125, 0.5, 1, 2 + 1 / 3, 1.75].map(fractionText)).toEqual(["⅛", "½", "1", "2 ⅓", "1 ¾"]);
    expect(roundToParts(1.9, [0, 1 / 4, 1 / 2, 3 / 4])).toBe(2);
    expect(roundToParts(0.4, [0, 1 / 4, 1 / 3, 1 / 2])).toBeCloseTo(1 / 3, 9);
  });

  it("reads flour in cups from USDA's measured cup (bread flour 1 cup = 137 g)", () => {
    expect(text("bread-flour", 274)).toBe("2 cups");
    expect(text("bread-flour", 500)).toBe("3 ⅔ cups");
    expect(text("all-purpose-flour", 62.5)).toBe("½ cup");
  });

  it("drops to tablespoons and teaspoons for small amounts, on the measured spoon weight", () => {
    expect(text("salt", 6)).toBe("1 tsp");
    expect(text("salt", 10)).toBe("1 ¾ tsp");
    expect(text("instant-yeast", 7)).toBe("1 ¾ tsp");
    expect(text("butter", 28.4)).toBe("2 Tbsp");
    expect(text("instant-yeast", 0.2)).toBe("pinch (< ⅛ tsp)");
  });

  it("moves to the next unit once the rounded amount reaches it", () => {
    // 3 tsp is a tablespoon and 4 Tbsp is a quarter cup: never shown as "3 tsp" or "4 Tbsp".
    expect(text("water", 14.8)).toBe("1 Tbsp");
    expect(text("granulated-sugar", 47)).toBe("¼ cup");
  });

  it("shows pourable liquids in pints and quarts from 2 and 4 cups", () => {
    expect(text("whole-milk", 244)).toBe("1 cup");
    expect(text("water", 600)).toBe("1 ¼ pt");
    expect(text("water", 1000)).toBe("1 qt");
    expect(text("buttermilk", 1470)).toBe("1 ½ qt");
    // Not pourable: stays in cups however large.
    expect(text("bread-flour", 1096)).toBe("8 cups");
  });

  it("counts eggs as large eggs (USDA 1 large = 50 g whole, 33 g white, 17 g yolk)", () => {
    expect(text("whole-egg", 100)).toBe("2 large eggs");
    expect(text("whole-egg", 50)).toBe("1 large egg");
    expect(text("egg-white", 99)).toBe("3 large egg whites");
    expect(text("egg-yolk", 34)).toBe("2 large egg yolks");
  });

  it("refuses where USDA weighed no household measure, and says why", () => {
    const cassava = householdMeasure("cassava-flour", 200);
    expect(cassava.ok).toBe(false);
    if (!cassava.ok) expect(cassava.reason).toMatch(/30 g reference serving/);
    expect(householdMeasure("water", 0).ok).toBe(false);
  });

  it("uses exactly the USDA portion it names, for every ingredient that has one", () => {
    for (const ing of BAKING_INGREDIENTS) {
      const m = householdMeasure(ing.id, 100);
      if (!m.ok) {
        expect({ id: ing.id, hasCup: portionWeight(ing.id, "cup", "").ok }).toEqual({ id: ing.id, hasCup: false });
        continue;
      }
      expect(m.how).toMatch(/^FDC \d+: /);
      expect(Number.isFinite(m.exact) && m.exact > 0).toBe(true);
    }
  });
});
