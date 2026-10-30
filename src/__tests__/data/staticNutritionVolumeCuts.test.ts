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
  const friedWalnuts = (oilGrams: number, notes = "") => ({
    numberOfServings: 4,
    ingredients: [
      { name: "flour", amount: 270, unit: "g" },
      { name: "walnuts", amount: 1, unit: "cup", notes },
      { name: "vegetable oil", amount: oilGrams, unit: "g", notes: "for deep frying" },
    ],
    instructions: ["Deep-fry until golden."],
  });

  it("includes the extra frying fat absorbed by an uncertain food mass", () => {
    // The walnuts weigh 80–120 g. Food plus absorbed oil has 42.8 g of
    // uncertainty out of 417.3 g, exceeding 10%; ignoring oil's spread passes.
    expect(computeRecipeNutritionFromIngredients(friedWalnuts(1000))).toBeNull();
    expect(computeRecipeNutritionFromIngredients(friedWalnuts(1000, "ground"))).not.toBeNull();
  });

  it("caps absorption uncertainty at the oil actually listed", () => {
    // All 10 g of oil is absorbed at either food mass: only the walnuts'
    // 40 g spread remains, exactly 10% of the 400 g maximum total.
    expect(computeRecipeNutritionFromIngredients(friedWalnuts(10))).not.toBeNull();
  });

  it("accounts for dilution when the minced onion could weigh 45 g more", async () => {
    // The restored archive recipe includes 2 cups of water, so its 45 g onion
    // spread is below the limit. Without that dilution, it needs a named cut.
    const found = await recipe("hsca-lunch-all-almond-cream-sauce");
    expect(computeRecipeNutritionFromIngredients(found)).not.toBeNull();
    const concentrated = { ...found, ingredients: found.ingredients.filter((ing) => ing.name !== "water") };
    expect(computeRecipeNutritionFromIngredients(concentrated)).toBeNull();
    expect(computeRecipeNutritionFromIngredients(withLine(concentrated, "minced onion", { name: "chopped onion" }))).not.toBeNull();
  });
});
