import type { MealSlot, RecipeIngredient } from "@/types";
import { generateGroceryList } from "@/utils/groceryListGenerator";

function makeMeal(
  ingredients: unknown[],
  servings = 1,
  id = "recipe-1",
): MealSlot {
  return {
    id: `slot-${id}`,
    dayOfWeek: 0,
    mealType: "dinner",
    recipe: {
      id,
      name: "Test Recipe",
      title: "Test Recipe",
      ingredients: ingredients as RecipeIngredient[],
      instructions: [],
      elementalProperties: {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25,
      },
    },
    servings,
    planetarySnapshot: {
      dominantPlanet: "Sun",
      zodiacSign: "aries",
      lunarPhase: "new moon",
      elementalState: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
      timestamp: new Date("2026-08-23T00:00:00.000Z"),
    },
    createdAt: new Date("2026-08-23T00:00:00.000Z"),
    updatedAt: new Date("2026-08-23T00:00:00.000Z"),
  };
}

describe("generateGroceryList ingredient boundary", () => {
  it("scales and consolidates canonical recipe ingredients", () => {
    const items = generateGroceryList([
      makeMeal([{ name: "Carrot", amount: 2, unit: "piece" }], 2, "one"),
      makeMeal([{ name: "carrot", amount: 1, unit: "piece" }], 1, "two"),
    ]);

    expect(items).toEqual([
      expect.objectContaining({
        ingredient: "carrot",
        quantity: 5,
        unit: "pieces",
        usedInRecipes: ["one", "two"],
      }),
    ]);
  });

  it("accepts the legacy string ingredient shape at runtime", () => {
    const items = generateGroceryList([makeMeal(["sea salt"])]);

    expect(items[0]).toEqual(
      expect.objectContaining({
        ingredient: "sea salt",
        quantity: 1,
        unit: "piece",
      }),
    );
  });

  it("skips malformed ingredients without dropping valid siblings", () => {
    const items = generateGroceryList([
      makeMeal([
        { amount: 2, unit: "cup" },
        { name: "water", amount: "not-a-number", unit: "cup" },
        { name: "rice", amount: 1, unit: "cup" },
      ]),
    ]);

    expect(items).toHaveLength(1);
    expect(items[0]?.ingredient).toBe("rice");
  });
});
