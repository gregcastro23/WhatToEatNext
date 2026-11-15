/**
 * Unit tests for pantry-aware deduction in estimateWeeklyGroceryCost.
 *
 * @file src/utils/instacart/__tests__/pantryCostDeduction.test.ts
 */

import {
  estimateWeeklyGroceryCost,
  type RecipeIngredient,
} from "@/utils/instacart/priceEstimator";

function sampleRecipes(): Array<{ ingredients: RecipeIngredient[]; servings: number }> {
  return [
    {
      servings: 2,
      ingredients: [
        { name: "Jasmine Rice", amount: 1, unit: "cup", category: "grains" },
        { name: "Fresh Organic Spinach", amount: 2, unit: "cup", category: "produce" },
        { name: "Black Beans", amount: 1, unit: "can", category: "pantry" },
        { name: "Sea Salt", amount: 1, unit: "tsp", optional: true },
      ],
    },
    {
      servings: 4,
      ingredients: [
        { name: "Chicken Breast", amount: 1, unit: "lb", category: "protein" },
        { name: "Yellow Onion", amount: 1, unit: "each", category: "produce" },
      ],
    },
  ];
}

describe("estimateWeeklyGroceryCost pantry deduction", () => {
  it("deducts owned pantry strings to $0 and lowers totalCost", () => {
    const recipes = sampleRecipes();
    const withoutPantry = estimateWeeklyGroceryCost(recipes, []);
    const withPantry = estimateWeeklyGroceryCost(recipes, [
      "jasmine rice",
      "spinach",
      "black beans",
    ]);

    expect(withPantry.totalCost).toBeLessThan(withoutPantry.totalCost);

    const firstBreakdown = withPantry.recipeBreakdown[0]?.breakdown ?? [];
    expect(firstBreakdown.length).toBe(3); // optional Sea Salt is omitted
    for (const line of firstBreakdown) {
      expect(line.estimatedCost).toBe(0);
      expect(line.confidence).toBe("exact");
    }
    expect(withPantry.recipeBreakdown[0]?.totalCost).toBe(0);
  });

  it("supports object-shaped pantry inventory entries", () => {
    const recipes = sampleRecipes();
    const withObjects = estimateWeeklyGroceryCost(recipes, [
      { name: "Chicken Breast", quantity: 2, unit: "lb" },
      { name: "Jasmine Rice" },
    ]);
    const secondBreakdown = withObjects.recipeBreakdown[1]?.breakdown ?? [];
    const chickenLine = secondBreakdown.find((b) => b.ingredient === "Chicken Breast");
    const onionLine = secondBreakdown.find((b) => b.ingredient === "Yellow Onion");

    expect(chickenLine?.estimatedCost).toBe(0);
    expect(chickenLine?.confidence).toBe("exact");
    expect(onionLine?.estimatedCost).toBeGreaterThan(0);
  });
});
