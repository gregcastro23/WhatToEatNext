/**
 * Static recipes whose count units USDA weighs now publish computed nutrition;
 * those whose count units it does not weigh at the stated size still do not.
 * Real catalog rows.
 */
import { getServerRecipes } from "@/actions/recipes";
import { computeRecipeNutritionFromIngredients } from "@/utils/ingredientNutritionAggregation";

async function recipe(id: string) {
  const found = (await getServerRecipes()).find((r) => r.id === id);
  if (!found) throw new Error(`${id} is not in the catalog`);
  return found;
}

describe("a count USDA weighs lets the recipe account for itself", () => {
  it.each([
    // "4 large egg yolks": 4 × 17 g (FDC 172184).
    "italian-dinner-all-authentic-spaghetti-alla-carbonara",
    // "1 large onion": 150 g (FDC 170000).
    "american-dinner-all-classic-new-england-clam-chowder",
  ])("%s publishes its computed total", async (id) => {
    const found = await recipe(id);
    const computed = computeRecipeNutritionFromIngredients(found);
    expect(computed).not.toBeNull();
    expect(found.nutrition?.calories).toBeCloseTo(computed?.calories ?? Number.NaN, 6);
  });
});

describe("a count USDA does not weigh at the stated size stays unknown mass", () => {
  it.each([
    // "1 stalk celery": USDA weighs small, medium and large stalks (17–64 g).
    "italian-dinner-all-authentic-osso-buco-alla-milanese",
    // "2 whole lemons": USDA weighs two fruit sizes (58 g and 84 g).
    "greek-dinner-all-avgolemono",
  ])("%s withholds its computed total", async (id) => {
    expect(computeRecipeNutritionFromIngredients(await recipe(id))).toBeNull();
  });
});
