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
 * The table's own count guesses (piece, each, a bare count, clove, slice,
 * head) follow the same rule (owner ruling 2026-10-03, option B). `[MEASURED
 * 2026-10-03]` on master c27e4136 it re-weighs 232 lines in 220 recipes
 * (garlic 180 of them) and moves computed 202 → 204, authored 825 → 823.
 *
 * @file src/__tests__/unitConversionCounts.test.ts
 */
import { parseServingSizeGrams } from "@/utils/ingredientNutritionAggregation";
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

describe("a measured count replaces the table's guess where USDA weighed exactly one (ruling B)", () => {
  it("weighs a garlic clove at USDA's 3 g, not the table's 6 g", () => {
    // FDC 169230 "Garlic, raw" weighs one "clove" at 3 g.
    expect(convertToGramsDetailed(2, "cloves", "garlic")).toEqual({
      grams: 6,
      basis: "usda-measured",
      fdcId: 169230,
      measuredAs: "clove",
    });
  });

  it("weighs a piece, an each or a bare count as USDA's one whole item", () => {
    // FDC 169097 orange "fruit (2-5/8\" dia)" 131 g; 171705 avocado 201 g; 169910 mango 336 g.
    expect(convertToGramsDetailed(1, "piece", "Orange")).toMatchObject({ grams: 131, fdcId: 169097 });
    expect(convertToGramsDetailed(2, "", "Avocado")?.grams).toBe(402);
    expect(convertToGramsDetailed(1, "each", "Mango")?.grams).toBe(336);
  });

  it("weighs a slice of ginger from USDA's five 1\" slices (11 g), not the table's 30 g", () => {
    expect(convertToGramsDetailed(1, "slice", "Ginger")?.grams).toBeCloseTo(2.2, 10);
  });
});

describe("the table's guess stays where USDA has no single unqualified count", () => {
  it("keeps 50 g a piece of egg: USDA weighs an egg only by its size", () => {
    expect(convertToGramsDetailed(1, "piece", "Chicken Egg")).toEqual({ grams: 50, basis: "water-approximation" });
  });

  it("keeps 50 g a piece of lemon: USDA weighs two fruit sizes, 58 g and 84 g", () => {
    expect(convertToGramsDetailed(1, "piece", "Lemon")?.grams).toBe(50);
  });

  it("keeps 200 g a head of cabbage: every USDA head is sized (714–1,248 g)", () => {
    expect(convertToGramsDetailed(1, "head", "cabbage")?.grams).toBe(200);
  });
});

describe("what a count unit feeds", () => {
  it("gives the elemental quantity factor the eggs' mass, not their count", () => {
    // Before, "2 large eggs" had no gram weight and fell back to 2 g.
    expect(calculateQuantityFactor(2, "large", "g", "egg")).toBeCloseTo(Math.log(2), 10);
  });

  it("reads a serving size written with a tilde", () => {
    // The catalog's Egg Yolk is "1 large egg yolk (~17g)". Unread, its calories
    // were scored as if per 100 g.
    expect(parseServingSizeGrams("1 large egg yolk (~17g)")).toBe(17);
    expect(parseServingSizeGrams("1 cup (148 g)")).toBe(148);
  });
});
