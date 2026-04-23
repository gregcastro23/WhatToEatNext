import {
  getRecipeCountForIngredient,
  getRecipesForIngredient,
  resolveIngredientSlug,
} from "@/data/ingredientRecipeIndex";

describe("ingredientRecipeIndex", () => {
  it("resolves canonical slug directly", () => {
    expect(resolveIngredientSlug("pandan_jelly")).toBe("pandan_jelly");
  });

  it("resolves descriptive ingredient input to canonical slug", () => {
    expect(resolveIngredientSlug("Fresh pandan leaves")).toBe("pandan_leaves");
  });

  it("returns matches and count consistently", () => {
    const slug = resolveIngredientSlug("Pandan jelly");
    expect(slug).toBe("pandan_jelly");
    const matches = getRecipesForIngredient("Pandan jelly");
    expect(matches.length).toBe(getRecipeCountForIngredient("Pandan jelly"));
  });
});

