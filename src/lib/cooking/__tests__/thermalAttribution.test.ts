/**
 * @jest-environment node
 *
 * Thermal Attribution and Step Feasibility Verification (Phase 45 Slice A4).
 *
 * Verifies:
 * 1. Clause-level temperature purpose (oven vs liquid vs internal doneness).
 * 2. Mixed proteins in both ingredient orders (highest safety threshold governs).
 * 3. Species coverage gaps: duck (165°F), tuna (145°F), cod (145°F), shrimp (145°F).
 * 4. Multi-temperature steps (simmer 200°F + oven 400°F does not trigger false positive).
 * 5. Cooling followed by cooking (refrigeration does not bypass unsafe internal roast).
 * 6. Verb and gerund parity for boiling, simmering, poaching, and steaming.
 * 7. Pressure cooking context (permits liquid water up to 250°F, blocks >250°F).
 * 8. Sous-vide unnamed protein attribution from recipe ingredients.
 * 9. Temperature units (°C and °F) in internal doneness checks.
 *
 * @file src/lib/cooking/__tests__/thermalAttribution.test.ts
 */

import { verifyAndRepairCosmicRecipe, type CosmicRecipe } from "@/lib/cooking/recipeVerificationGate";
import { VALID_RECIPE } from "@/app/api/generate-cosmic-recipe/__tests__/helpers/validCosmicRecipe";
import { cosmicRecipeSchema } from "@/types/cosmicRecipeSchema";

describe("thermalAttribution and step feasibility (Slice A4)", () => {
  const createBaseRecipe = (): CosmicRecipe => cosmicRecipeSchema.parse(VALID_RECIPE);

  describe("mixed proteins and ingredient order invariance", () => {
    it("flags 150°F internal temperature when beef is listed before chicken", () => {
      const recipe = createBaseRecipe();
      recipe.ingredients = [
        { name: "beef", quantity: "100", unit: "g", optional: false, substitutions: [] },
        { name: "chicken", quantity: "100", unit: "g", optional: false, substitutions: [] },
      ];
      recipe.steps = [
        {
          step_number: 1,
          instruction: "Roast beef and chicken until the internal temperature reaches 150°F.",
          time_minutes: 25,
          cooking_method: "roast",
          tips: [],
        },
      ];

      const outcome = verifyAndRepairCosmicRecipe(recipe);
      expect(outcome.valid).toBe(false);
      expect(outcome.blockingFindings.some((f) => f.code === "UNSAFE_TEMPERATURE")).toBe(true);
      const finding = outcome.blockingFindings.find((f) => f.code === "UNSAFE_TEMPERATURE");
      expect(finding?.message).toContain("165°F");
    });

    it("flags 150°F internal temperature when chicken is listed before beef", () => {
      const recipe = createBaseRecipe();
      recipe.ingredients = [
        { name: "chicken", quantity: "100", unit: "g", optional: false, substitutions: [] },
        { name: "beef", quantity: "100", unit: "g", optional: false, substitutions: [] },
      ];
      recipe.steps = [
        {
          step_number: 1,
          instruction: "Roast beef and chicken until the internal temperature reaches 150°F.",
          time_minutes: 25,
          cooking_method: "roast",
          tips: [],
        },
      ];

      const outcome = verifyAndRepairCosmicRecipe(recipe);
      expect(outcome.valid).toBe(false);
      expect(outcome.blockingFindings.some((f) => f.code === "UNSAFE_TEMPERATURE")).toBe(true);
      const finding = outcome.blockingFindings.find((f) => f.code === "UNSAFE_TEMPERATURE");
      expect(finding?.message).toContain("165°F");
    });

    it("permits mixed beef and chicken when internal temperature reaches 165°F", () => {
      const recipe = createBaseRecipe();
      recipe.ingredients = [
        { name: "beef", quantity: "100", unit: "g", optional: false, substitutions: [] },
        { name: "chicken", quantity: "100", unit: "g", optional: false, substitutions: [] },
      ];
      recipe.steps = [
        {
          step_number: 1,
          instruction: "Roast beef and chicken until the internal temperature reaches 165°F.",
          time_minutes: 30,
          cooking_method: "roast",
          tips: [],
        },
      ];

      const outcome = verifyAndRepairCosmicRecipe(recipe);
      expect(outcome.valid).toBe(true);
      expect(outcome.blockingFindings).toHaveLength(0);
    });
  });

  describe("species coverage: duck, tuna, cod, shrimp", () => {
    it("flags unsafe internal temperature for duck (<165°F) and passes safe duck (165°F)", () => {
      const recipeUnsafe = createBaseRecipe();
      recipeUnsafe.ingredients = [{ name: "duck", quantity: "200", unit: "g", optional: false, substitutions: [] }];
      recipeUnsafe.steps = [
        {
          step_number: 1,
          instruction: "Roast duck until internal temperature reaches 120°F.",
          time_minutes: 20,
          cooking_method: "roast",
          tips: [],
        },
      ];
      const outcomeUnsafe = verifyAndRepairCosmicRecipe(recipeUnsafe);
      expect(outcomeUnsafe.valid).toBe(false);
      expect(outcomeUnsafe.blockingFindings.some((f) => f.code === "UNSAFE_TEMPERATURE")).toBe(true);

      const recipeSafe = createBaseRecipe();
      recipeSafe.ingredients = [{ name: "duck", quantity: "200", unit: "g", optional: false, substitutions: [] }];
      recipeSafe.steps = [
        {
          step_number: 1,
          instruction: "Roast duck until internal temperature reaches 165°F.",
          time_minutes: 35,
          cooking_method: "roast",
          tips: [],
        },
      ];
      const outcomeSafe = verifyAndRepairCosmicRecipe(recipeSafe);
      expect(outcomeSafe.valid).toBe(true);
      expect(outcomeSafe.blockingFindings).toHaveLength(0);
    });

    it("flags unsafe internal temperature for tuna (<145°F) and passes safe tuna (145°F)", () => {
      const recipeUnsafe = createBaseRecipe();
      recipeUnsafe.ingredients = [{ name: "tuna", quantity: "150", unit: "g", optional: false, substitutions: [] }];
      recipeUnsafe.steps = [
        {
          step_number: 1,
          instruction: "Roast tuna until internal temperature reaches 120°F.",
          time_minutes: 10,
          cooking_method: "roast",
          tips: [],
        },
      ];
      const outcomeUnsafe = verifyAndRepairCosmicRecipe(recipeUnsafe);
      expect(outcomeUnsafe.valid).toBe(false);
      expect(outcomeUnsafe.blockingFindings.some((f) => f.code === "UNSAFE_TEMPERATURE")).toBe(true);

      const recipeSafe = createBaseRecipe();
      recipeSafe.ingredients = [{ name: "tuna", quantity: "150", unit: "g", optional: false, substitutions: [] }];
      recipeSafe.steps = [
        {
          step_number: 1,
          instruction: "Roast tuna until internal temperature reaches 145°F.",
          time_minutes: 15,
          cooking_method: "roast",
          tips: [],
        },
      ];
      const outcomeSafe = verifyAndRepairCosmicRecipe(recipeSafe);
      expect(outcomeSafe.valid).toBe(true);
      expect(outcomeSafe.blockingFindings).toHaveLength(0);
    });

    it("flags unsafe internal temperature for cod (<145°F) and passes safe cod (145°F)", () => {
      const recipeUnsafe = createBaseRecipe();
      recipeUnsafe.ingredients = [{ name: "cod", quantity: "150", unit: "g", optional: false, substitutions: [] }];
      recipeUnsafe.steps = [
        {
          step_number: 1,
          instruction: "Roast cod until internal temperature reaches 120°F.",
          time_minutes: 10,
          cooking_method: "roast",
          tips: [],
        },
      ];
      const outcomeUnsafe = verifyAndRepairCosmicRecipe(recipeUnsafe);
      expect(outcomeUnsafe.valid).toBe(false);
      expect(outcomeUnsafe.blockingFindings.some((f) => f.code === "UNSAFE_TEMPERATURE")).toBe(true);

      const recipeSafe = createBaseRecipe();
      recipeSafe.ingredients = [{ name: "cod", quantity: "150", unit: "g", optional: false, substitutions: [] }];
      recipeSafe.steps = [
        {
          step_number: 1,
          instruction: "Roast cod until internal temperature reaches 145°F.",
          time_minutes: 15,
          cooking_method: "roast",
          tips: [],
        },
      ];
      const outcomeSafe = verifyAndRepairCosmicRecipe(recipeSafe);
      expect(outcomeSafe.valid).toBe(true);
      expect(outcomeSafe.blockingFindings).toHaveLength(0);
    });

    it("flags unsafe internal temperature for shrimp (<145°F) and passes safe shrimp (145°F)", () => {
      const recipeUnsafe = createBaseRecipe();
      recipeUnsafe.ingredients = [{ name: "shrimp", quantity: "150", unit: "g", optional: false, substitutions: [] }];
      recipeUnsafe.steps = [
        {
          step_number: 1,
          instruction: "Roast shrimp until internal temperature reaches 120°F.",
          time_minutes: 8,
          cooking_method: "roast",
          tips: [],
        },
      ];
      const outcomeUnsafe = verifyAndRepairCosmicRecipe(recipeUnsafe);
      expect(outcomeUnsafe.valid).toBe(false);
      expect(outcomeUnsafe.blockingFindings.some((f) => f.code === "UNSAFE_TEMPERATURE")).toBe(true);

      const recipeSafe = createBaseRecipe();
      recipeSafe.ingredients = [{ name: "shrimp", quantity: "150", unit: "g", optional: false, substitutions: [] }];
      recipeSafe.steps = [
        {
          step_number: 1,
          instruction: "Roast shrimp until internal temperature reaches 145°F.",
          time_minutes: 12,
          cooking_method: "roast",
          tips: [],
        },
      ];
      const outcomeSafe = verifyAndRepairCosmicRecipe(recipeSafe);
      expect(outcomeSafe.valid).toBe(true);
      expect(outcomeSafe.blockingFindings).toHaveLength(0);
    });
  });

  describe("cooling scope and multi-action steps", () => {
    it("does not allow refrigeration keyword to bypass unsafe internal cooking temperature", () => {
      const recipe = createBaseRecipe();
      recipe.ingredients = [{ name: "chicken", quantity: "150", unit: "g", optional: false, substitutions: [] }];
      recipe.steps = [
        {
          step_number: 1,
          instruction: "Refrigerate chicken, then roast until its internal temperature reaches 120°F.",
          time_minutes: 30,
          cooking_method: "roast",
          tips: [],
        },
      ];

      const outcome = verifyAndRepairCosmicRecipe(recipe);
      expect(outcome.valid).toBe(false);
      expect(outcome.blockingFindings.some((f) => f.code === "UNSAFE_TEMPERATURE")).toBe(true);
      const finding = outcome.blockingFindings.find((f) => f.code === "UNSAFE_TEMPERATURE");
      expect(finding?.message).toContain("165°F");
    });

    it("permits multi-action step with simmer at 200°F and bake in oven at 400°F", () => {
      const recipe = createBaseRecipe();
      recipe.ingredients = [{ name: "salt", quantity: "1", unit: "tsp", optional: false, substitutions: [] }];
      recipe.steps = [
        {
          step_number: 1,
          instruction: "Simmer the sauce at 200°F, then bake it in the oven at 400°F.",
          time_minutes: 20,
          cooking_method: "simmering",
          tips: [],
        },
      ];

      const outcome = verifyAndRepairCosmicRecipe(recipe);
      expect(outcome.valid).toBe(true);
      expect(outcome.blockingFindings).toHaveLength(0);
    });

    it("correctly distinguishes oven, liquid, and internal temperatures in a single step", () => {
      const recipe = createBaseRecipe();
      recipe.ingredients = [
        { name: "chicken breast", quantity: "1", unit: "lb", optional: false, substitutions: [] },
        { name: "chicken broth", quantity: "1", unit: "cup", optional: false, substitutions: [] },
      ];
      recipe.steps = [
        {
          step_number: 1,
          instruction: "Preheat oven to 375°F. Simmer sauce at 190°F. Roast chicken until internal temperature reaches 165°F.",
          time_minutes: 35,
          cooking_method: "roast",
          tips: [],
        },
      ];

      const outcome = verifyAndRepairCosmicRecipe(recipe);
      expect(outcome.valid).toBe(true);
      expect(outcome.blockingFindings).toHaveLength(0);
    });
  });

  describe("boiling method verb and gerund parity", () => {
    const boilingMethods = ["boil", "simmer", "steam", "poach", "boiling", "simmering", "steaming", "poaching"];

    it.each(boilingMethods)("flags 230°F liquid water as unsafe for method '%s'", (method) => {
      const recipe = createBaseRecipe();
      recipe.ingredients = [{ name: "salt", quantity: "1", unit: "tsp", optional: false, substitutions: [] }];
      recipe.steps = [
        {
          step_number: 1,
          instruction: "Heat water to 230°F for 10 minutes.",
          time_minutes: 10,
          cooking_method: method,
          tips: [],
        },
      ];

      const outcome = verifyAndRepairCosmicRecipe(recipe);
      expect(outcome.valid).toBe(false);
      expect(outcome.blockingFindings.some((f) => f.code === "UNSAFE_TEMPERATURE")).toBe(true);
      const finding = outcome.blockingFindings.find((f) => f.code === "UNSAFE_TEMPERATURE");
      expect(finding?.message).toContain("212°F");
    });
  });

  describe("pressure context and physical limits", () => {
    it("permits liquid water up to 250°F when pressure cooking context is present", () => {
      const recipe = createBaseRecipe();
      recipe.ingredients = [{ name: "salt", quantity: "1", unit: "tsp", optional: false, substitutions: [] }];
      recipe.steps = [
        {
          step_number: 1,
          instruction: "Cook under pressure at 235°F for 15 minutes.",
          time_minutes: 15,
          cooking_method: "pressure_cook",
          tips: [],
        },
      ];

      const outcome = verifyAndRepairCosmicRecipe(recipe);
      expect(outcome.valid).toBe(true);
      expect(outcome.blockingFindings).toHaveLength(0);
    });

    it("flags liquid water exceeding 250°F in pressure cooking as impossible", () => {
      const recipe = createBaseRecipe();
      recipe.ingredients = [{ name: "salt", quantity: "1", unit: "tsp", optional: false, substitutions: [] }];
      recipe.steps = [
        {
          step_number: 1,
          instruction: "Cook in the pressure cooker at 270°F for 10 minutes.",
          time_minutes: 10,
          cooking_method: "pressure_cook",
          tips: [],
        },
      ];

      const outcome = verifyAndRepairCosmicRecipe(recipe);
      expect(outcome.valid).toBe(false);
      expect(outcome.blockingFindings.some((f) => f.code === "UNSAFE_TEMPERATURE")).toBe(true);
      const finding = outcome.blockingFindings.find((f) => f.code === "UNSAFE_TEMPERATURE");
      expect(finding?.message).toContain("250°F");
    });
  });

  describe("sous-vide unnamed protein attribution", () => {
    it("attributes chicken from ingredients when sous-vide step does not name protein explicitly", () => {
      const recipe = createBaseRecipe();
      recipe.ingredients = [{ name: "chicken", quantity: "200", unit: "g", optional: false, substitutions: [] }];
      recipe.steps = [
        {
          step_number: 1,
          instruction: "Cook sous vide at 140°F for two hours.",
          time_minutes: 120,
          cooking_method: "sous_vide",
          tips: [],
        },
      ];

      const outcome = verifyAndRepairCosmicRecipe(recipe);
      expect(outcome.valid).toBe(false);
      expect(outcome.blockingFindings.some((f) => f.code === "UNSAFE_TEMPERATURE")).toBe(true);
      const finding = outcome.blockingFindings.find((f) => f.code === "UNSAFE_TEMPERATURE");
      expect(finding?.message).toContain("165°F");
    });

    it("permits sous-vide chicken when cooked at safe minimum internal temperature (165°F)", () => {
      const recipe = createBaseRecipe();
      recipe.ingredients = [{ name: "chicken", quantity: "200", unit: "g", optional: false, substitutions: [] }];
      recipe.steps = [
        {
          step_number: 1,
          instruction: "Cook sous vide at 165°F for two hours.",
          time_minutes: 120,
          cooking_method: "sous_vide",
          tips: [],
        },
      ];

      const outcome = verifyAndRepairCosmicRecipe(recipe);
      expect(outcome.valid).toBe(true);
      expect(outcome.blockingFindings).toHaveLength(0);
    });
  });

  describe("temperature units in Celsius", () => {
    it("converts Celsius internal temperature and validates poultry safety", () => {
      const recipeUnsafe = createBaseRecipe();
      recipeUnsafe.ingredients = [{ name: "duck", quantity: "200", unit: "g", optional: false, substitutions: [] }];
      recipeUnsafe.steps = [
        {
          step_number: 1,
          instruction: "Roast duck until internal temperature reaches 55°C.", // 55°C = 131°F < 165°F
          time_minutes: 25,
          cooking_method: "roast",
          tips: [],
        },
      ];
      const outcomeUnsafe = verifyAndRepairCosmicRecipe(recipeUnsafe);
      expect(outcomeUnsafe.valid).toBe(false);
      expect(outcomeUnsafe.blockingFindings.some((f) => f.code === "UNSAFE_TEMPERATURE")).toBe(true);

      const recipeSafe = createBaseRecipe();
      recipeSafe.ingredients = [{ name: "duck", quantity: "200", unit: "g", optional: false, substitutions: [] }];
      recipeSafe.steps = [
        {
          step_number: 1,
          instruction: "Roast duck until internal temperature reaches 74°C.", // 74°C = 165.2°F >= 165°F
          time_minutes: 35,
          cooking_method: "roast",
          tips: [],
        },
      ];
      const outcomeSafe = verifyAndRepairCosmicRecipe(recipeSafe);
      expect(outcomeSafe.valid).toBe(true);
      expect(outcomeSafe.blockingFindings).toHaveLength(0);
    });
  });
});
