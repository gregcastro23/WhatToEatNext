/**
 * Count units ("2 large eggs", "3 sprigs cilantro") weigh at USDA's measured
 * count portions, and only where USDA weighed exactly that unit.
 *
 * Since the 2026-09-26 nutrition gate, a count unit with no gram weight is
 * unknown mass and withholds the recipe's computed total. `[MEASURED
 * 2026-09-26]` routing count units through FDC's count portions moved static
 * recipes with computed nutrition from 163 to 200 (authored 862 → 828, none
 * 59 → 56).
 *
 * @file src/__tests__/unitConversionCounts.test.ts
 */
import { calculateQuantityFactor } from "@/utils/quantityScaling";
import { convertToGramsDetailed } from "@/utils/unitConversion";

describe("a count unit weighs at USDA's measured count portion", () => {
  it("weighs eggs by the size the recipe names, under the record's fdcId", () => {
    // The catalog's Chicken Egg IS FDC 171287 ("1 large egg (50g), whole").
    expect(convertToGramsDetailed(2, "large", "Chicken Egg")).toEqual({
      grams: 100,
      basis: "usda-measured",
      fdcId: 171287,
      measuredAs: "large",
    });
    expect(convertToGramsDetailed(1, "jumbo", "Chicken Egg")?.grams).toBe(63);
    expect(convertToGramsDetailed(4, "large", "Egg Yolk")?.grams).toBe(68);
  });

  it("reads plurals and per-several portions", () => {
    // USDA weighs 9 sprigs of cilantro at 20 g together.
    const sprigs = convertToGramsDetailed(9, "sprigs", "cilantro");
    expect(sprigs?.grams).toBeCloseTo(20, 10);
    expect(sprigs?.fdcId).toBe(169997);
    expect(convertToGramsDetailed(2, "stalks", "celery")).toBeNull();
  });

  it("weighs both catalog onions as the record their profiles are", () => {
    expect(convertToGramsDetailed(1, "medium", "yellow onion")).toMatchObject({ grams: 110, fdcId: 170000 });
    expect(convertToGramsDetailed(2, "large", "red onion")).toMatchObject({ grams: 300, fdcId: 170000 });
  });

  it("weighs a whole item only where USDA weighed one whole item", () => {
    expect(convertToGramsDetailed(1, "whole", "Lime")).toMatchObject({ grams: 67, measuredAs: 'fruit (2" dia)' });
  });
});

describe("it never chooses a size the recipe did not state", () => {
  it("refuses a whole lemon: USDA weighs two fruit sizes, 58 g and 84 g", () => {
    expect(convertToGramsDetailed(1, "whole", "Lemon")).toBeNull();
  });

  it("refuses a stalk of celery: USDA weighs only small, medium and large stalks", () => {
    expect(convertToGramsDetailed(1, "stalk", "celery")).toBeNull();
  });

  it("takes USDA's plain leaf of cabbage, never its large or medium one", () => {
    expect(convertToGramsDetailed(2, "leaves", "cabbage")).toMatchObject({ grams: 30, measuredAs: "leaf" });
  });

  it("refuses a count of an ingredient USDA has no count portion for", () => {
    expect(convertToGramsDetailed(3, "sprigs", "thyme")).toBeNull();
    expect(convertToGramsDetailed(2, "large", "eggplant")).toBeNull();
  });

  it("refuses a count with no ingredient to weigh", () => {
    expect(convertToGramsDetailed(2, "large")).toBeNull();
  });
});

describe("the table's own count guesses are untouched (owner ruling pending)", () => {
  it("keeps 6 g a clove although USDA weighs a garlic clove at 3 g", () => {
    expect(convertToGramsDetailed(2, "cloves", "garlic")).toEqual({ grams: 12, basis: "water-approximation" });
  });

  it("keeps 50 g a piece although USDA weighs an orange at 131 g", () => {
    expect(convertToGramsDetailed(1, "piece", "Orange")?.grams).toBe(50);
  });
});

describe("what a count unit feeds", () => {
  it("gives the elemental quantity factor the eggs' mass, not their count", () => {
    // Before, "2 large eggs" had no gram weight and fell back to 2 g.
    expect(calculateQuantityFactor(2, "large", "g", "egg")).toBeCloseTo(Math.log(2), 10);
  });
});
