/**
 * Static recipes publish computed nutrition only when it accounts for the
 * recipe; otherwise their authored nutritionPerServing (owner ruling
 * 2026-09-26). Real catalog rows, with the value each published before.
 */
import { getServerRecipes } from "@/actions/recipes";
import { chinese } from "@/data/cuisines/chinese";
import { french } from "@/data/cuisines/french";
import type { Cuisine } from "@/types/cuisine";
import { computeRecipeNutritionFromIngredients } from "@/utils/ingredientNutritionAggregation";
import { normalizeRecipeNutrition } from "@/utils/recipeNutrition";
import { convertToGramsDetailed } from "@/utils/unitConversion";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** The dish's authored nutritionPerServing, as the loader normalizes it. */
function authoredCalories(cuisine: Cuisine, name: string): number | undefined {
  const dish = Object.values(cuisine.dishes)
    .flatMap((seasons) => Object.values(seasons ?? {}).flatMap((list: unknown) => (Array.isArray(list) ? list.filter(isRecord) : [])))
    .find((d) => d.name === name);
  return normalizeRecipeNutrition(dish ?? null)?.calories;
}

async function recipe(id: string) {
  const found = (await getServerRecipes()).find((r) => r.id === id);
  if (!found) throw new Error(`${id} is not in the catalog`);
  return found;
}

describe("a computed total that does not account for the recipe is withheld", () => {
  it("Pot-au-feu: 1.5 kg of brisket unresolved (it published 59 kcal a serving)", async () => {
    const pot = await recipe("french-dinner-all-authentic-pot-au-feu");
    expect(computeRecipeNutritionFromIngredients(pot)).toBeNull();
    expect(pot.nutrition?.calories).toBe(authoredCalories(french, "Authentic Pot-au-Feu"));
    expect(pot.nutrition?.calories).not.toBe(59);
  });

  it("Wonton soup: '30 whole' wrappers have no gram weight, not 30 × 50 g (it published 1,705 kcal)", async () => {
    const soup = await recipe("chinese-dinner-all-wonton-soup");
    expect(computeRecipeNutritionFromIngredients(soup)).toBeNull();
    expect(soup.nutrition?.calories).toBe(authoredCalories(chinese, "Wonton Soup"));
  });
});

describe("a computed total that does account for the recipe is kept", () => {
  it("Mozambican peri-peri shrimp: every line resolves and is weighed", async () => {
    const shrimp = await recipe("african-dinner-all-authentic-mozambican-peri-peri-shrimp");
    const computed = computeRecipeNutritionFromIngredients(shrimp);
    expect(computed).not.toBeNull();
    expect(shrimp.nutrition?.calories).toBeCloseTo(computed?.calories ?? Number.NaN, 6);
  });
});

describe("defined units", () => {
  it("weigh a quart as four measured cups when the ingredient was measured", () => {
    // USDA FDC 171265 weighs a cup of whole milk at 244 g; Galaktoboureko uses a quart.
    expect(convertToGramsDetailed(1, "quart", "whole milk")).toEqual({ grams: 976, basis: "usda-measured", fdcId: 171265 });
  });

  it("weigh lbs, pints and gallons by definition otherwise", () => {
    expect(convertToGramsDetailed(2, "lbs", "pork belly")?.grams).toBeCloseTo(907.18, 2);
    const broth = convertToGramsDetailed(1, "gallon", "vegetable broth");
    expect(broth?.grams).toBeCloseTo(3785.41, 2);
    expect(broth?.basis).toBe("water-approximation");
    expect(convertToGramsDetailed(1, "pint", "vegetable broth")?.grams).toBeCloseTo(473.18, 2);
  });
});
