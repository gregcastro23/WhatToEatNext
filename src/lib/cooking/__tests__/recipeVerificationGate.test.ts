/**
 * @jest-environment node
 *
 * Golden Test Suite for the WTEN Deterministic Culinary Verification Gate.
 *
 * Verifies:
 * 1. Unit normalization and fractional parsing.
 * 2. Plant-based ingredients with animal substrings (eggplant, butternut squash, champagne vinegar)
 *    correctly classify as vegan and vegetarian.
 * 3. Gluten sources (spaghetti, soy sauce, udon, seitan) are flagged on gluten-free requests
 *    and NEVER falsely tagged gluten-free.
 * 4. Safe culinary envelopes: wood-fired pizza (850°F), candy syrup boiling (245°F),
 *    refrigerated chilling (40°F), and Celsius internal doneness (74°C = 165.2°F).
 * 5. Low internal poultry temperature (145°F internal) is flagged as BLOCKING.
 * 6. Non-positive and excessive quantities (>10kg).
 * 7. Disallowed ingredients.
 * 8. Advisory reporting: unknown cooking methods and missing nutrition do NOT block or invent fake data.
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

  it("passes known-good plant recipes and normalizes units without inventing fake tags", () => {
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
    expect(outcome.audit.resolvedIngredientsCount).toBeGreaterThanOrEqual(1);
    // Does NOT inject unverified tags into delivered recipe
    expect(outcome.recipe.tags.diet).toEqual(recipe.tags.diet);
  });

  it("correctly classifies eggplant, butternut squash, and champagne vinegar as vegan", () => {
    const recipe = createBaseRecipe();
    recipe.ingredients = [
      {
        name: "eggplant",
        quantity: "1",
        unit: "piece",
        optional: false,
        substitutions: [],
      },
      {
        name: "butternut squash",
        quantity: "1",
        unit: "lb",
        optional: false,
        substitutions: [],
      },
      {
        name: "champagne vinegar",
        quantity: "1",
        unit: "tbsp",
        optional: false,
        substitutions: [],
      },
    ];

    const outcome = verifyAndRepairCosmicRecipe(recipe, { requestedDiet: "vegan" });
    expect(outcome.valid).toBe(true);
    expect(outcome.blockingFindings).toHaveLength(0);
  });

  it("flags gluten-containing ingredients (spaghetti, soy sauce, seitan, udon) when gluten-free is requested", () => {
    const recipe = createBaseRecipe();
    recipe.ingredients = [
      {
        name: "spaghetti",
        quantity: "200",
        unit: "g",
        optional: false,
        substitutions: [],
      },
      {
        name: "soy sauce",
        quantity: "2",
        unit: "tbsp",
        optional: false,
        substitutions: [],
      },
    ];

    const outcome = verifyAndRepairCosmicRecipe(recipe, { requestedDiet: "gluten-free" });
    expect(outcome.valid).toBe(false);
    expect(outcome.blockingFindings.some((f) => f.code === "ALLERGEN_VIOLATION_GLUTEN")).toBe(true);
  });

  it("permits wood-fired pizza ovens operating at 850°F", () => {
    const recipe = createBaseRecipe();
    recipe.steps = [
      {
        step_number: 1,
        instruction: "Bake pizza in a wood-fired oven at 850°F for 90 seconds.",
        time_minutes: 2,
        cooking_method: "bake",
        tips: [],
      },
    ];

    const outcome = verifyAndRepairCosmicRecipe(recipe);
    expect(outcome.valid).toBe(true);
    expect(outcome.blockingFindings).toHaveLength(0);
  });

  it("permits candy syrup boiling at 245°F", () => {
    const recipe = createBaseRecipe();
    recipe.ingredients = [
      {
        name: "sugar",
        quantity: "1",
        unit: "cup",
        optional: false,
        substitutions: [],
      },
    ];
    recipe.steps = [
      {
        step_number: 1,
        instruction: "Boil sugar syrup until thermometer reads 245°F (firm ball stage).",
        time_minutes: 8,
        cooking_method: "boiling",
        tips: [],
      },
    ];

    const outcome = verifyAndRepairCosmicRecipe(recipe);
    expect(outcome.valid).toBe(true);
    expect(outcome.blockingFindings).toHaveLength(0);
  });

  it("permits chilling chicken in refrigerator to 40°F without false positive", () => {
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
        instruction: "Chill marinated chicken breast in refrigerator to 40°F before grilling.",
        time_minutes: 30,
        cooking_method: "prep",
        tips: [],
      },
    ];

    const outcome = verifyAndRepairCosmicRecipe(recipe);
    expect(outcome.valid).toBe(true);
    expect(outcome.blockingFindings).toHaveLength(0);
  });

  it("recognizes Celsius internal temperature for poultry (74°C = 165.2°F)", () => {
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
        instruction: "Roast chicken breast until internal temperature reaches 74°C.",
        time_minutes: 25,
        cooking_method: "roast",
        tips: [],
      },
    ];

    const outcome = verifyAndRepairCosmicRecipe(recipe);
    expect(outcome.valid).toBe(true);
    expect(outcome.blockingFindings).toHaveLength(0);
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
    expect(outcome.valid).toBe(true);
    expect(outcome.blockingFindings).toHaveLength(0);
    const advisory = outcome.advisoryFindings.find(
      (f) => f.code === "UNKNOWN_COOKING_METHOD",
    );
    expect(advisory).toBeDefined();
  });

  it("reports missing nutrition as ADVISORY without inventing fabricated values", () => {
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

    const outcome = verifyAndRepairCosmicRecipe(recipe);
    expect(outcome.valid).toBe(true);
    const advisory = outcome.advisoryFindings.find((f) => f.code === "MISSING_NUTRITION");
    expect(advisory).toBeDefined();
    // Does NOT mutate original calories to fake numbers
    expect(outcome.recipe.nutrition.calories).toBe(0);
  });
});
