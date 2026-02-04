/**
 * Recipe Auto-Fixer Tests
 *
 * @file src/__tests__/recipe/recipeAutoFixer.test.ts
 * @created 2026-01-28
 */

import {
  fixRecipe,
  fixAllRecipes,
  extractFixedRecipes,
  type FixOptions,
} from "@/utils/recipe/recipeAutoFixer";

describe("Recipe Auto-Fixer", () => {
  describe("fixRecipe", () => {
    it("generates ID if missing", () => {
      const recipe = {
        name: "Pasta Carbonara",
        cuisine: "Italian",
        ingredients: [],
        instructions: [],
      };

      const result = fixRecipe(recipe, { generateIds: true });
      expect(result.fixes.some(f => f.field === "id")).toBe(true);
      expect(result.fixedRecipe.id).toBe("italian-pasta-carbonara");
    });

    it("does not modify existing ID", () => {
      const recipe = {
        id: "my-custom-id",
        name: "Pasta",
        ingredients: [],
        instructions: [],
      };

      const result = fixRecipe(recipe, { generateIds: true });
      expect(result.fixes.some(f => f.field === "id")).toBe(false);
      expect(result.fixedRecipe.id).toBe("my-custom-id");
    });

    it("normalizes time format", () => {
      const recipe = {
        name: "Quick Pasta",
        prepTime: 30,
        cookTime: 15,
        ingredients: [],
        instructions: [],
      };

      const result = fixRecipe(recipe, { normalizeTimeFOrmat: true });
      expect(result.fixedRecipe.prepTime).toBe("30 minutes");
      expect(result.fixedRecipe.cookTime).toBe("15 minutes");
    });

    it("adds default elemental properties", () => {
      const recipe = {
        name: "Plain Recipe",
        ingredients: [],
        instructions: [],
      };

      const result = fixRecipe(recipe, { addDefaultElemental: true });
      expect(result.fixes.some(f => f.field === "elementalProperties")).toBe(true);
      const props = result.fixedRecipe.elementalProperties as any;
      expect(props.Fire).toBe(0.25);
      expect(props.Water).toBe(0.25);
      expect(props.Earth).toBe(0.25);
      expect(props.Air).toBe(0.25);
    });

    it("normalizes existing elemental properties", () => {
      const recipe = {
        name: "Recipe",
        elementalProperties: {
          Fire: 1,
          Water: 1,
          Earth: 1,
          Air: 1,
        },
        ingredients: [],
        instructions: [],
      };

      const result = fixRecipe(recipe, { addDefaultElemental: true });
      const props = result.fixedRecipe.elementalProperties as any;
      expect(props.Fire).toBeCloseTo(0.25, 2);
      expect(props.Water).toBeCloseTo(0.25, 2);
    });

    it("adds default serving size", () => {
      const recipe = {
        name: "Recipe",
        ingredients: [],
        instructions: [],
      };

      const result = fixRecipe(recipe, { addDefaultServingSize: true });
      expect(result.fixedRecipe.servingSize).toBe(4);
    });

    it("uses numberOfServings for serving size", () => {
      const recipe = {
        name: "Recipe",
        numberOfServings: 6,
        ingredients: [],
        instructions: [],
      };

      const result = fixRecipe(recipe, { addDefaultServingSize: true });
      expect(result.fixedRecipe.servingSize).toBe(6);
    });

    it("normalizes season values", () => {
      const recipe = {
        name: "Recipe",
        season: "Fall",
        ingredients: [],
        instructions: [],
      };

      const result = fixRecipe(recipe, { normalizeSeasons: true });
      expect(result.fixedRecipe.season).toEqual(["autumn"]);
    });

    it("adds default season if missing", () => {
      const recipe = {
        name: "Recipe",
        ingredients: [],
        instructions: [],
      };

      const result = fixRecipe(recipe, { normalizeSeasons: true });
      expect(result.fixedRecipe.season).toEqual(["all"]);
    });

    it("normalizes meal type values", () => {
      const recipe = {
        name: "Recipe",
        mealType: "Main",
        ingredients: [],
        instructions: [],
      };

      const result = fixRecipe(recipe, { normalizeMealTypes: true });
      expect(result.fixedRecipe.mealType).toEqual(["dinner"]);
    });

    it("adds default meal type if missing", () => {
      const recipe = {
        name: "Recipe",
        ingredients: [],
        instructions: [],
      };

      const result = fixRecipe(recipe, { normalizeMealTypes: true });
      expect(result.fixedRecipe.mealType).toEqual(["dinner"]);
    });

    it("normalizes spice level", () => {
      const recipe = {
        name: "Recipe",
        spiceLevel: "MILD",
        ingredients: [],
        instructions: [],
      };

      const result = fixRecipe(recipe, { normalizeSpiceLevel: true });
      expect(result.fixedRecipe.spiceLevel).toBe("mild");
    });

    it("clamps numeric spice level", () => {
      const recipe = {
        name: "Recipe",
        spiceLevel: 10,
        ingredients: [],
        instructions: [],
      };

      const result = fixRecipe(recipe, { normalizeSpiceLevel: true });
      expect(result.fixedRecipe.spiceLevel).toBe(5);
    });

    it("normalizes ingredient amounts", () => {
      const recipe = {
        name: "Recipe",
        ingredients: [
          { name: "Flour", amount: "2", unit: "cups" },
          { name: "Sugar" },
        ],
        instructions: [],
      };

      const result = fixRecipe(recipe, { normalizeIngredients: true });
      const ingredients = result.fixedRecipe.ingredients as any[];
      expect(ingredients[0].amount).toBe(2);
      expect(ingredients[0].name).toBe("flour");
      expect(ingredients[1].amount).toBe(1);
      expect(ingredients[1].unit).toBe("piece");
    });

    it("copies instructions from preparationSteps", () => {
      const recipe = {
        name: "Recipe",
        preparationSteps: ["Step 1", "Step 2"],
        ingredients: [],
      };

      const result = fixRecipe(recipe, { copyInstructionsFromSteps: true });
      expect(result.fixedRecipe.instructions).toEqual(["Step 1", "Step 2"]);
    });

    it("converts string arrays", () => {
      const recipe = {
        name: "Recipe",
        cookingMethods: "baking",
        ingredients: [],
        instructions: [],
      };

      const result = fixRecipe(recipe, { normalizeArrayFields: true });
      expect(result.fixedRecipe.cookingMethods).toEqual(["baking"]);
    });

    it("tracks all fixes applied", () => {
      const recipe = {
        name: "Incomplete Recipe",
        prepTime: 30,
      };

      const result = fixRecipe(recipe);
      expect(result.fixes.length).toBeGreaterThan(0);
      expect(result.fixes.every(f => f.field && f.description)).toBe(true);
    });

    it("returns remaining issues", () => {
      const recipe = {
        name: "",
      };

      const result = fixRecipe(recipe);
      expect(result.remainingIssues.length).toBeGreaterThan(0);
    });
  });

  describe("fixAllRecipes", () => {
    it("fixes multiple recipes", () => {
      const recipes = [
        { name: "Recipe 1", cuisine: "Italian" },
        { name: "Recipe 2", cuisine: "French" },
      ];

      const result = fixAllRecipes(recipes);
      expect(result.totalRecipes).toBe(2);
      expect(result.recipesFixed).toBe(2);
    });

    it("tracks total fixes by type", () => {
      const recipes = [
        { name: "Recipe 1" },
        { name: "Recipe 2" },
      ];

      const result = fixAllRecipes(recipes);
      expect(result.totalFixes).toBeGreaterThan(0);
      expect(Object.keys(result.fixesByType).length).toBeGreaterThan(0);
    });

    it("reports unfixed recipes", () => {
      const recipes = [
        { name: "" }, // Cannot be fixed - no name
      ];

      const result = fixAllRecipes(recipes);
      expect(result.unfixedRecipes.length).toBeGreaterThan(0);
    });
  });

  describe("extractFixedRecipes", () => {
    it("extracts fixed recipe objects", () => {
      const recipes = [
        { name: "Recipe 1", cuisine: "Italian" },
        { name: "Recipe 2", cuisine: "French" },
      ];

      const result = fixAllRecipes(recipes);
      const fixed = extractFixedRecipes(result);

      expect(fixed).toHaveLength(2);
      expect(fixed[0]).toHaveProperty("id");
      expect(fixed[0]).toHaveProperty("elementalProperties");
    });
  });

  describe("Fix Options", () => {
    it("respects disabled options", () => {
      const recipe = {
        name: "Recipe",
        ingredients: [],
        instructions: [],
      };

      const options: FixOptions = {
        generateIds: false,
        addDefaultElemental: false,
        addDefaultServingSize: false,
        normalizeSeasons: false,
        normalizeMealTypes: false,
      };

      const result = fixRecipe(recipe, options);
      expect(result.fixedRecipe.id).toBeUndefined();
      expect(result.fixedRecipe.elementalProperties).toBeUndefined();
      expect(result.fixedRecipe.servingSize).toBeUndefined();
    });
  });
});
