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

  describe("containment names the head, not a portion or a modifier", () => {
    it.each([
      ["garlic cloves", "garlic"],
      ["large garlic cloves", "garlic"],
      ["-4 cloves garlic", "garlic"],
      ["lemon juice", "lemon"],
      ["fresh lemon juice", "lemon"],
      ["juice of 1 lemon", "lemon"],
      ["freshly squeezed lime juice", "lime"],
      ["garlic chives", "chives"],
      ["salt pork", "pork"],
    ])("%s → %s", (input, slug) => {
      expect(resolveIngredientSlug(input)).toBe(slug);
    });

    it("a portion word still resolves when it is the only name", () => {
      expect(resolveIngredientSlug("ground cloves")).toBe("cloves");
      expect(resolveIngredientSlug("whole cloves")).toBe("cloves");
      expect(resolveIngredientSlug("juice")).toBe("juice");
    });

    it("a longer name that contains a portion word wins over its parts", () => {
      expect(resolveIngredientSlug("bottled clam juice")).toBe("clam_juice");
    });

    it("an uncarded nut butter is neither the nut nor dairy butter", () => {
      expect(resolveIngredientSlug("unsweetened peanut butter")).toBeNull();
      expect(resolveIngredientSlug("creamy almond butter")).toBe("almond_butter");
      expect(resolveIngredientSlug("salted butter")).toBe("butter");
    });
  });

  it("returns matches and count consistently", () => {
    const slug = resolveIngredientSlug("Pandan jelly");
    expect(slug).toBe("pandan_jelly");
    const matches = getRecipesForIngredient("Pandan jelly");
    expect(matches.length).toBe(getRecipeCountForIngredient("Pandan jelly"));
  });
});

