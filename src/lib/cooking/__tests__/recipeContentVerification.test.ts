/** @jest-environment node */
import { describe, expect, it } from "@jest/globals";
import {
  verifyRecipeContent,
  verifyAndRepairCosmicRecipe,
  type RecipeContent,
} from "@/lib/cooking/recipeVerificationGate";
import { cosmicRecipeSchema } from "@/types/cosmicRecipeSchema";
import { VALID_RECIPE } from "@/app/api/generate-cosmic-recipe/__tests__/helpers/validCosmicRecipe";

function minimal(names = ["salt", "olive oil"]): RecipeContent {
  return {
    ingredients: names.map((name) => ({ name, quantity: "1", unit: "g" })),
    steps: [{ instruction: "Mix the ingredients." }],
  };
}

describe("real recipe content verification", () => {
  it("checks actual ingredients and instructions without inventing recipe metadata", () => {
    const content = minimal();
    const outcome = verifyRecipeContent(content, {
      requestedDiet: "vegetarian",
    });
    expect(outcome.valid).toBe(true);
    expect(outcome.verified).toBe(false);
    expect(outcome.audit.evaluatedRestrictions).toContain("vegetarian");
    expect(outcome.notChecked).toEqual([
      "nutrition",
      "steps.0.cooking_method",
      "steps.0.time_minutes",
    ]);
    expect(outcome.content).toEqual(content);
    expect(outcome.content).not.toHaveProperty("calories");
    expect(outcome.content).not.toHaveProperty("alignment_score");
    expect(outcome.content.steps[0]).not.toHaveProperty("time_minutes");
    expect(
      outcome.advisoryFindings.some(
        (finding) => finding.code === "MISSING_NUTRITION",
      ),
    ).toBe(false);
  });

  it("blocks a known dietary violation even when time and nutrition are unavailable", () => {
    const outcome = verifyRecipeContent(minimal(["chicken"]), {
      requestedDiet: "vegetarian",
    });
    expect(outcome.valid).toBe(false);
    expect(
      outcome.blockingFindings.some(
        (finding) => finding.code === "DIET_VIOLATION_VEGETARIAN",
      ),
    ).toBe(true);
  });

  it.each([
    [
      "chicken",
      "Cook chicken until internal temperature reaches 120°F.",
      "165°F",
    ],
    ["salt", "Boil water at 230°F.", "212°F"],
  ])(
    "uses actual instruction temperatures without a fabricated method: %s",
    (name, instruction, floor) => {
      const content = minimal([name]);
      content.steps = [{ instruction }];
      const outcome = verifyRecipeContent(content);
      expect(outcome.valid).toBe(false);
      expect(
        outcome.blockingFindings.some(
          (finding) =>
            finding.code === "UNSAFE_TEMPERATURE" &&
            finding.message.includes(floor),
        ),
      ).toBe(true);
    },
  );

  it("keeps allergen-sensitive restrictions uncertified", () => {
    const outcome = verifyRecipeContent(minimal(), {
      requestedDiet: "Dairy-Free",
    });
    expect(outcome.verified).toBe(false);
    expect(
      outcome.advisoryFindings.some(
        (finding) => finding.code === "UNCERTIFIED_DAIRY_FREE",
      ),
    ).toBe(true);
  });

  it("normalizes actual units on a clone while preserving absent metadata", () => {
    const content = minimal();
    const ingredient = content.ingredients[0];
    if (!ingredient) throw new Error("Fixture requires its first ingredient.");
    ingredient.unit = "tablespoons";
    const outcome = verifyRecipeContent(content);
    expect(outcome.repaired).toBe(true);
    expect(outcome.content.ingredients[0]?.unit).toBe("tbsp");
    expect(content.ingredients[0]?.unit).toBe("tablespoons");
    expect(outcome.content.steps[0]).not.toHaveProperty("cooking_method");
  });

  it("checks authored method/time/calories when present, including real zero values", () => {
    const content = minimal();
    content.steps = [
      { instruction: "Mix.", cooking_method: "mix", time_minutes: 0 },
    ];
    content.calories = 10;
    const outcome = verifyRecipeContent(content);
    expect(outcome.notChecked).toEqual([]);
    expect(outcome.verified).toBe(true);
    content.calories = 0;
    const zeroNutrition = verifyRecipeContent(content);
    expect(zeroNutrition.notChecked).toEqual([]);
    expect(
      zeroNutrition.advisoryFindings.some(
        (finding) => finding.code === "MISSING_NUTRITION",
      ),
    ).toBe(true);
  });

  it("retains primary resolution and quantity checks", () => {
    const content = minimal(["unknown_test_ingredient"]);
    const ingredient = content.ingredients[0];
    if (!ingredient) throw new Error("Fixture requires its first ingredient.");
    ingredient.quantity = "0";
    const outcome = verifyRecipeContent(content);
    expect(outcome.blockingFindings.map((finding) => finding.code)).toEqual(
      expect.arrayContaining([
        "UNRESOLVED_PRIMARY_INGREDIENT",
        "IMPOSSIBLE_QUANTITY",
      ]),
    );
  });

  it("does not validate an empty ingredient or instruction collection as real content", () => {
    const content = minimal();
    content.ingredients = [];
    content.steps = [];
    const outcome = verifyRecipeContent(content);
    expect(outcome.valid).toBe(false);
    expect(outcome.verified).toBe(false);
  });

  it("preserves complete CosmicRecipe output and shares its existing behavior", () => {
    const recipe = cosmicRecipeSchema.parse(structuredClone(VALID_RECIPE));
    recipe.ingredients = [
      {
        name: "olive oil",
        quantity: "2",
        unit: "tablespoons",
        optional: false,
        substitutions: [],
      },
    ];
    recipe.steps = [
      {
        step_number: 1,
        instruction: "Mix.",
        time_minutes: 1,
        cooking_method: "mix",
        tips: [],
      },
    ];
    const full = verifyAndRepairCosmicRecipe(recipe, {
      requestedDiet: "vegetarian",
    });
    const partial = verifyRecipeContent(
      {
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        dietTags: recipe.tags.diet,
        calories: recipe.nutrition.calories,
      },
      { requestedDiet: "vegetarian" },
    );
    expect({
      valid: partial.valid,
      verified: partial.verified,
      repaired: partial.repaired,
      blockingFindings: partial.blockingFindings,
      advisoryFindings: partial.advisoryFindings,
      audit: partial.audit,
    }).toEqual({
      valid: full.valid,
      verified: full.verified,
      repaired: full.repaired,
      blockingFindings: full.blockingFindings,
      advisoryFindings: full.advisoryFindings,
      audit: full.audit,
    });
    expect(full.recipe.alignment_score).toEqual(recipe.alignment_score);
    expect(full.recipe.nutrition).toEqual(recipe.nutrition);
    expect(full.recipe.ingredients[0]?.unit).toBe("tbsp");
    expect(full).not.toHaveProperty("notChecked");
  });
});
