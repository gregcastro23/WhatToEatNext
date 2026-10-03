/**
 * A cup USDA weighed several ways is weighed at the cut the recipe line names;
 * a line naming none is weighed at the lightest cut, and the gap to the
 * heaviest counts against the recipe's unresolved share. Real catalog rows.
 */
import { getServerRecipes } from "@/actions/recipes";
import type { Recipe } from "@/types/recipe";
import { computeRecipeNutritionFromIngredients } from "@/utils/ingredientNutritionAggregation";

async function recipe(id: string): Promise<Recipe> {
  const found = (await getServerRecipes()).find((r) => r.id === id);
  if (!found) throw new Error(`${id} is not in the catalog`);
  return found;
}

/** The recipe with one line's name and notes replaced. */
function withLine(found: Recipe, name: string, replacement: { name: string; notes?: string }): Recipe {
  return {
    ...found,
    ingredients: found.ingredients.map((ing) => (ing.name === name ? { ...ing, notes: undefined, ...replacement } : ing)),
  };
}

describe("a line naming its cut is weighed at that cut", () => {
  it("weighs spiced carrot cake's walnuts chopped, not ground", async () => {
    // "1.5 cups walnuts, lightly toasted and coarsely chopped": 175.5 g chopped
    // (FDC 170187, 117 g a cup), not 120 g ground (80 g a cup), the cut FDC lists first.
    const found = await recipe("hsca-dessert-all-spiced-carrot-cake");
    const chopped = computeRecipeNutritionFromIngredients(found);
    const unnamed = computeRecipeNutritionFromIngredients(withLine(found, "walnuts", { name: "walnuts" }));
    expect(chopped).not.toBeNull();
    expect(found.nutrition?.calories).toBeCloseTo(chopped?.calories ?? Number.NaN, 6);
    expect(chopped?.calories ?? 0).toBeGreaterThan(unnamed?.calories ?? Number.POSITIVE_INFINITY);
  });
});

describe("a line naming no cut carries the spread between cuts", () => {
  it("withholds almond cream sauce, whose minced onion could weigh 45 g more", async () => {
    // "1 cup minced onion": USDA weighs a cup of onion sliced (115 g) and
    // chopped (160 g), not minced. Named chopped, the recipe accounts for itself.
    const found = await recipe("hsca-lunch-all-almond-cream-sauce");
    expect(computeRecipeNutritionFromIngredients(found)).toBeNull();
    expect(computeRecipeNutritionFromIngredients(withLine(found, "minced onion", { name: "chopped onion" }))).not.toBeNull();
  });
});
