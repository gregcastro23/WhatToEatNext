// src/utils/recipeAlchemicalQuantities.test.ts

import {
  calculateRecipeAlchemicalQuantities,
  lookupIngredientAlchemical,
} from "@/utils/recipeAlchemicalQuantities";

describe("lookupIngredientAlchemical", () => {
  it("resolves a plain staple to its own catalog key", () => {
    const garlic = lookupIngredientAlchemical("garlic");
    expect(garlic).not.toBeNull();
    // Regression guard: "garlic" must resolve to garlic — NOT a specific
    // product like "garlic_infused_olive_oil" (over-broad token indexing).
    expect(garlic!.key).toBe("garlic");
  });

  it("resolves preparation-qualified names to the base ingredient", () => {
    expect(lookupIngredientAlchemical("minced garlic")?.key).toBe("garlic");
    expect(lookupIngredientAlchemical("fresh garlic")?.key).toBe("garlic");
    expect(lookupIngredientAlchemical("extra virgin olive oil")?.key).toBe(
      "olive_oil",
    );
  });

  it("returns null for a genuinely unknown ingredient", () => {
    expect(lookupIngredientAlchemical("xyzzy nonexistent ingredient")).toBeNull();
  });
});

describe("calculateRecipeAlchemicalQuantities", () => {
  it("matches all resolvable ingredients (matchRate 1, no defaults)", () => {
    const summary = calculateRecipeAlchemicalQuantities([
      "minced garlic",
      "fresh tomatoes",
      "extra virgin olive oil",
    ]);
    expect(summary.matchRate).toBe(1);
    expect(summary.perIngredient.every((p) => !p.isDefaultValue)).toBe(true);
    expect(summary.totalASharp).toBeGreaterThan(0);
  });

  it("reports a partial matchRate and flags unmatched ingredients as defaults", () => {
    const summary = calculateRecipeAlchemicalQuantities([
      "garlic",
      "xyzzy one",
      "xyzzy two",
      "xyzzy three",
    ]);
    expect(summary.matchRate).toBeCloseTo(0.25, 5);
    const defaults = summary.perIngredient.filter((p) => p.isDefaultValue);
    expect(defaults).toHaveLength(3);
  });

  it("returns matchRate 0 for an empty ingredient list", () => {
    const summary = calculateRecipeAlchemicalQuantities([]);
    expect(summary.matchRate).toBe(0);
  });
});
