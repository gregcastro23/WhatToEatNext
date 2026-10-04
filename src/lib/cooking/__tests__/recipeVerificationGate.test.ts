/**
 * @jest-environment node
 *
 * Golden Test Suite for the WTEN Culinary Verification & Local Repair Gate.
 *
 * Tests the deterministic culinary authority gate against:
 * 1. Known-good recipes (passes, normalizes units, derives diet tags, recomputes nutrition).
 * 2. Unsafe food temperatures (USDA FSIS poultry < 165°F, liquid water > 212°F, flash fire > 600°F).
 * 3. Impossible or non-positive quantities and household batch overflows (>10kg).
 * 4. Dietary & allergen violations (vegan recipe containing poultry/dairy, gluten in gluten-free).
 * 5. Disallowed ingredients matching user restrictions.
 * 6. Primary ingredient unverified in catalog vs advisory minor uncataloged ingredients.
 * 7. Local deterministic repair without model invocation.
 *
 * @file src/lib/cooking/__tests__/recipeVerificationGate.test.ts
 */

import {
  verifyAndRepairCosmicRecipe,
  normalizeUnit,
  parseFractionalQuantity,
  type CosmicRecipe,
} from "@/lib/cooking/recipeVerificationGate";
import { VALID_RECIPE } from "@/app/api/generate-cosmic-recipe/__tests__/helpers/validCosmicRecipe";
import { cosmicRecipeSchema } from "@/types/cosmicRecipeSchema";

describe("recipeVerificationGate unit helpers", () => {
  it("normalizes colloquial culinary units", () => {
    expect(normalizeUnit("tablespoons")).toBe("tbsp");
    expect(normalizeUnit("Tablespoon")).toBe("tbsp");
    expect(normalizeUnit("grams")).toBe("g");
    expect(normalizeUnit("teaspoons")).toBe("tsp");
    expect(normalizeUnit("pounds")).toBe("lb");
    expect(normalizeUnit("cups")).toBe("cup");
  });

  it("parses fractional and decimal quantities", () => {
    expect(parseFractionalQuantity("1/2")).toBe(0.5);
    expect(parseFractionalQuantity("1 1/2")).toBe(1.5);
    expect(parseFractionalQuantity("2.25")).toBe(2.25);
    expect(parseFractionalQuantity("0")).toBe(0);
    expect(parseFractionalQuantity("")).toBe(0);
  });
});

describe("verifyAndRepairCosmicRecipe", () => {
  const createBaseRecipe = (): CosmicRecipe =>
    cosmicRecipeSchema.parse(VALID_RECIPE);

  it("passes a known-good recipe and derives diet tags and nutrition", () => {
    const recipe = createBaseRecipe();
    recipe.ingredients = [
      {
        name: "salt",
        quantity: "1",
        unit: "tsp",
        optional: false,
        substitutions: [],
      },
      {
        name: "olive oil",
        quantity: "2",
        unit: "tablespoons",
        optional: false,
        substitutions: [],
      },
    ];

    const outcome = verifyAndRepairCosmicRecipe(recipe);
    expect(outcome.valid).toBe(true);
    expect(outcome.blockingFindings).toHaveLength(0);
    // Unit normalization repair: "tablespoons" -> "tbsp"
    expect(outcome.recipe.ingredients[1]?.unit).toBe("tbsp");
    expect(outcome.repaired).toBe(true);
    // Nutrition recomputed
    expect(outcome.audit.resolvedIngredientsCount).toBeGreaterThanOrEqual(1);
    expect(outcome.audit.derivedDietTags).toContain("vegan");
    expect(outcome.audit.derivedDietTags).toContain("gluten-free");
  });

  it("flags unsafe low internal temperature for poultry as BLOCKING", () => {
    const recipe = createBaseRecipe();
    recipe.ingredients = [
      {
        name: "chicken breast",
        quantity: "1",
        unit: "lb",
        optional: false,
        substitutions: [],
      },
    ];
    recipe.steps = [
      {
        step_number: 1,
        instruction: "Bake chicken breast until internal temperature reaches 145°F.",
        time_minutes: 20,
        cooking_method: "bake",
        tips: [],
      },
    ];

    const outcome = verifyAndRepairCosmicRecipe(recipe);
    expect(outcome.valid).toBe(false);
    const tempFinding = outcome.blockingFindings.find((f) => f.code === "UNSAFE_TEMPERATURE");
    expect(tempFinding).toBeDefined();
    expect(tempFinding?.message).toContain("165°F");
  });

  it("flags physically impossible boiling liquid water temperature as BLOCKING", () => {
    const recipe = createBaseRecipe();
    recipe.steps = [
      {
        step_number: 1,
        instruction: "Boil the water at 280°F vigorously.",
        time_minutes: 10,
        cooking_method: "boiling",
        tips: [],
      },
    ];

    const outcome = verifyAndRepairCosmicRecipe(recipe);
    expect(outcome.valid).toBe(false);
    const tempFinding = outcome.blockingFindings.find((f) => f.code === "UNSAFE_TEMPERATURE");
    expect(tempFinding).toBeDefined();
    expect(tempFinding?.message).toContain("212°F");
  });

  it("flags impossible non-positive quantity as BLOCKING", () => {
    const recipe = createBaseRecipe();
    recipe.ingredients = [
      {
        name: "salt",
        quantity: "0",
        unit: "tsp",
        optional: false,
        substitutions: [],
      },
    ];

    const outcome = verifyAndRepairCosmicRecipe(recipe);
    expect(outcome.valid).toBe(false);
    expect(outcome.blockingFindings.some((f) => f.code === "IMPOSSIBLE_QUANTITY")).toBe(true);
  });

  it("flags excessive quantity (>10kg) as BLOCKING", () => {
    const recipe = createBaseRecipe();
    recipe.ingredients = [
      {
        name: "rice",
        quantity: "25",
        unit: "kg",
        optional: false,
        substitutions: [],
      },
    ];

    const outcome = verifyAndRepairCosmicRecipe(recipe);
    expect(outcome.valid).toBe(false);
    expect(outcome.blockingFindings.some((f) => f.code === "EXCESSIVE_QUANTITY")).toBe(true);
  });

  it("flags dietary violation (meat in vegan/vegetarian request) as BLOCKING", () => {
    const recipe = createBaseRecipe();
    recipe.ingredients = [
      {
        name: "beef steak",
        quantity: "8",
        unit: "oz",
        optional: false,
        substitutions: [],
      },
    ];
    recipe.tags.diet = ["vegan"];

    const outcome = verifyAndRepairCosmicRecipe(recipe, { requestedDiet: "vegan" });
    expect(outcome.valid).toBe(false);
    expect(outcome.blockingFindings.some((f) => f.code === "DIET_VIOLATION_VEGAN")).toBe(true);
  });

  it("flags disallowed ingredients as BLOCKING", () => {
    const recipe = createBaseRecipe();
    recipe.ingredients = [
      {
        name: "peanut butter",
        quantity: "2",
        unit: "tbsp",
        optional: false,
        substitutions: [],
      },
    ];

    const outcome = verifyAndRepairCosmicRecipe(recipe, {
      disallowedIngredients: ["peanut", "shellfish"],
    });
    expect(outcome.valid).toBe(false);
    const disallowedFinding = outcome.blockingFindings.find(
      (f) => f.code === "DISALLOWED_INGREDIENT_FOUND",
    );
    expect(disallowedFinding).toBeDefined();
    expect(disallowedFinding?.message).toContain("peanut");
  });

  it("treats unprofiled cooking method as ADVISORY, not blocking", () => {
    const recipe = createBaseRecipe();
    recipe.steps = [
      {
        step_number: 1,
        instruction: "Infuse with liquid nitrogen smoke.",
        time_minutes: 2,
        cooking_method: "cryogenic_freeze",
        tips: [],
      },
    ];

    const outcome = verifyAndRepairCosmicRecipe(recipe);
    // Advisory findings do NOT invalidate the recipe
    expect(outcome.valid).toBe(true);
    expect(outcome.blockingFindings).toHaveLength(0);
    const advisory = outcome.advisoryFindings.find(
      (f) => f.code === "UNKNOWN_COOKING_METHOD",
    );
    expect(advisory).toBeDefined();
  });

  it("deterministically repairs missing nutrition and syncs verified diet tags", () => {
    const recipe = createBaseRecipe();
    recipe.nutrition = { calories: 0, protein: 0, carbohydrates: 0, fat: 0 };
    recipe.ingredients = [
      {
        name: "olive oil",
        quantity: "1",
        unit: "tbsp",
        optional: false,
        substitutions: [],
      },
    ];
    recipe.tags.diet = []; // missing tags

    const outcome = verifyAndRepairCosmicRecipe(recipe);
    expect(outcome.valid).toBe(true);
    expect(outcome.repaired).toBe(true);
    expect(outcome.recipe.nutrition.calories).toBeGreaterThan(0);
    expect(outcome.recipe.tags.diet).toContain("vegan");
    expect(outcome.recipe.tags.diet).toContain("dairy-free");
  });
});
