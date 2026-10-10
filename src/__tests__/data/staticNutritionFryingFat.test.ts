/**
 * A fried recipe counts the oil its food absorbs, not the bath it was fried in.
 * Real catalog rows, with the value each published before (2026-09-26).
 */
import { getServerRecipes } from "@/actions/recipes";
import { computeIngredientNutrition, computeRecipeNutritionFromIngredients, resolveIngredientByName } from "@/utils/ingredientNutritionAggregation";

async function recipe(id: string) {
  const found = (await getServerRecipes()).find((r) => r.id === id);
  if (!found) throw new Error(`${id} is not in the catalog`);
  return found;
}

describe("a frying bath counts as the fat the food absorbs", () => {
  it("Nigerian chin-chin: 872 g of frying oil counts as 65 g (it published 1,382 kcal)", async () => {
    const chinChin = await recipe("african-dessert-all-authentic-nigerian-coconut-chin-chin");
    const computed = computeRecipeNutritionFromIngredients(chinChin);
    expect(computed).not.toBeNull();
    expect(chinChin.nutrition?.calories).toBeCloseTo(computed?.calories ?? Number.NaN, 6);
    // The oil alone, in full, was 7,474 kcal of the batch: 934 kcal a serving over 8.
    expect(computed?.calories).toBeLessThan(600);
  });

  it("counts the same oil in full when the recipe is not fried in it", async () => {
    const chinChin = await recipe("african-dessert-all-authentic-nigerian-coconut-chin-chin");
    // Both signals removed: the oil's own note ("For deep frying.") and the instructions.
    const unfried = computeRecipeNutritionFromIngredients({
      ...chinChin,
      ingredients: chinChin.ingredients.map((ing) => ({ ...ing, notes: "" })),
      instructions: ["Mix and bake."],
    });
    const oil = resolveIngredientByName("vegetable oil");
    const perServing = (computeIngredientNutrition(oil, 872, "g")?.calories ?? 0) / 8;
    expect((unfried?.calories ?? 0) - (chinChin.nutrition?.calories ?? 0)).toBeGreaterThan(perServing * 0.9);
  });
});
