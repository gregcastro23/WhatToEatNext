// src/utils/ingredientNutritionAggregation.test.ts

import {
  computeRecipeNutritionFromIngredients,
  resolveIngredientByName,
} from "@/utils/ingredientNutritionAggregation";

describe("resolveIngredientByName", () => {
  it("resolves an exact catalog name", () => {
    const hit = resolveIngredientByName("Olive Oil");
    expect(hit?.name).toBe("Olive Oil");
  });

  it("strips preparation adjectives and extra-virgin qualifiers", () => {
    const hit = resolveIngredientByName("extra virgin olive oil");
    expect(hit?.name.toLowerCase()).toContain("olive oil");
  });

  it("strips a leading quantity + unit fragment", () => {
    const hit = resolveIngredientByName("2 tablespoons minced garlic");
    expect(hit?.name.toLowerCase()).toContain("garlic");
  });

  it("takes the first option of an 'X or Y' name", () => {
    const hit = resolveIngredientByName("olive oil or butter");
    expect(hit?.name.toLowerCase()).toContain("olive oil");
  });

  it("singularizes regular and -oes plurals", () => {
    expect(resolveIngredientByName("tomatoes")?.name.toLowerCase()).toContain(
      "tomato",
    );
    expect(resolveIngredientByName("potatoes")?.name.toLowerCase()).toContain(
      "potato",
    );
  });

  it("resolves a plural via whole-word token subset without over-matching", () => {
    const egg = resolveIngredientByName("eggs");
    expect(egg).toBeDefined();
    expect(egg!.name.toLowerCase()).toContain("egg");
    // "egg" must not resolve to "eggplant" — token matching is whole-word.
    expect(egg!.name.toLowerCase()).not.toContain("eggplant");
  });

  it("returns undefined for a genuinely absent ingredient (honest miss)", () => {
    expect(resolveIngredientByName("fish sauce")).toBeUndefined();
    expect(
      resolveIngredientByName("xyzzy nonexistent ingredient"),
    ).toBeUndefined();
  });

  it("returns undefined for empty / nullish input", () => {
    expect(resolveIngredientByName("")).toBeUndefined();
    expect(resolveIngredientByName(undefined)).toBeUndefined();
    expect(resolveIngredientByName(null)).toBeUndefined();
  });
});

describe("computeRecipeNutritionFromIngredients", () => {
  it("aggregates real per-serving nutrition from resolvable staples", () => {
    const result = computeRecipeNutritionFromIngredients({
      ingredients: [
        { name: "olive oil", amount: 2, unit: "tablespoons" },
        { name: "tomato", amount: 3, unit: "pieces" },
        { name: "garlic", amount: 2, unit: "cloves" },
      ],
      numberOfServings: 2,
    } as never);
    expect(result).not.toBeNull();
    expect(result!.calories).toBeGreaterThan(0);
    // Olive oil dominates fat; sanity-check the macro is populated.
    expect(result!.fat).toBeGreaterThan(0);
  });

  it("returns null when fewer than half the ingredients resolve", () => {
    const result = computeRecipeNutritionFromIngredients({
      ingredients: [
        { name: "olive oil", amount: 1, unit: "tablespoon" },
        { name: "xyzzy one", amount: 1, unit: "cup" },
        { name: "xyzzy two", amount: 1, unit: "cup" },
        { name: "xyzzy three", amount: 1, unit: "cup" },
      ],
      numberOfServings: 2,
    } as never);
    expect(result).toBeNull();
  });

  it("returns null for an empty ingredient list", () => {
    expect(
      computeRecipeNutritionFromIngredients({
        ingredients: [],
        numberOfServings: 1,
      } as never),
    ).toBeNull();
  });
});
