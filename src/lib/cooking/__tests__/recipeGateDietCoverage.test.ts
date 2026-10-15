/** @jest-environment node */
import { describe, expect, it } from "@jest/globals";
import { verifyAndRepairCosmicRecipe } from "@/lib/cooking/recipeVerificationGate";
import { cosmicRecipeSchema } from "@/types/cosmicRecipeSchema";
import { VALID_RECIPE } from "@/app/api/generate-cosmic-recipe/__tests__/helpers/validCosmicRecipe";

function evaluate(names: string[], requestedDiet: string) {
  const recipe = cosmicRecipeSchema.parse(structuredClone(VALID_RECIPE));
  recipe.ingredients = names.map((name) => ({
    name,
    quantity: "100",
    unit: "g",
    optional: false,
    substitutions: [],
  }));
  recipe.steps = [
    {
      step_number: 1,
      instruction: "Mix the ingredients.",
      time_minutes: 1,
      cooking_method: "mix",
      tips: [],
    },
  ];
  return verifyAndRepairCosmicRecipe(recipe, { requestedDiet });
}

describe("dietary coverage and ingredient-local exclusions", () => {
  it("uses the same plant-compound classification for explicit dairy exclusions", () => {
    const recipe = cosmicRecipeSchema.parse(structuredClone(VALID_RECIPE));
    recipe.ingredients = [
      {
        name: "coconut milk",
        quantity: "100",
        unit: "g",
        optional: false,
        substitutions: [],
      },
    ];
    const outcome = verifyAndRepairCosmicRecipe(recipe, {
      disallowedIngredients: ["dairy"],
    });
    expect(outcome.blockingFindings).toHaveLength(0);
  });
  it.each(["coconut milk", "oat milk", "almond butter", "cream of tartar"])(
    "does not classify the plant compound %s as dairy from its catalog aisle",
    (name) => {
      const outcome = evaluate(["salt", name], "Dairy-Free");
      expect(
        outcome.blockingFindings.some(
          (finding) => finding.code === "DIET_VIOLATION_DAIRY_FREE",
        ),
      ).toBe(false);
      expect(outcome.verified).toBe(false);
    },
  );

  it.each(["Dairy-Free", "Nut-Free", "Gluten-Free"])(
    "keeps %s explicitly uncertified without product evidence",
    (restriction) => {
      const outcome = evaluate(["olive oil"], restriction);
      expect(outcome.valid).toBe(true);
      expect(outcome.verified).toBe(false);
      expect(outcome.audit.evaluatedRestrictions).toContain(
        restriction.toLowerCase(),
      );
      expect(
        outcome.advisoryFindings.some((finding) =>
          finding.code.startsWith("UNCERTIFIED_"),
        ),
      ).toBe(true);
    },
  );

  it("still detects actual dairy in a compound containing a plant milk", () => {
    const outcome = evaluate(
      ["salt", "coconut milk and heavy cream"],
      "Dairy-Free",
    );
    expect(
      outcome.blockingFindings.some(
        (finding) => finding.code === "DIET_VIOLATION_DAIRY_FREE",
      ),
    ).toBe(true);
  });

  it.each([
    "rice flour and pasta",
    "gluten-free seitan",
    "gluten-free soy sauce with wheat",
    "rice noodles with wheat flour",
  ])(
    "does not let an exempt phrase hide the remaining gluten source in %s",
    (name) => {
      const outcome = evaluate(["salt", name], "Gluten-Free");
      expect(
        outcome.blockingFindings.some(
          (finding) => finding.code === "ALLERGEN_VIOLATION_GLUTEN",
        ),
      ).toBe(true);
    },
  );

  it.each([
    "rice flour",
    "almond flour",
    "buckwheat flour",
    "gluten-free soy sauce",
    "gluten-free bread",
  ])(
    "preserves the named substitute %s while withholding certification",
    (name) => {
      const outcome = evaluate(["salt", name], "Gluten-Free");
      expect(
        outcome.blockingFindings.some(
          (finding) => finding.code === "ALLERGEN_VIOLATION_GLUTEN",
        ),
      ).toBe(false);
      expect(outcome.verified).toBe(false);
    },
  );

  it("runs checks for normalized recipe tags as well as normalized requested diets", () => {
    const recipe = cosmicRecipeSchema.parse(structuredClone(VALID_RECIPE));
    recipe.tags.diet = ["plant-based"];
    recipe.ingredients = [
      {
        name: "beef",
        quantity: "100",
        unit: "g",
        optional: false,
        substitutions: [],
      },
    ];
    const outcome = verifyAndRepairCosmicRecipe(recipe);
    expect(outcome.audit.evaluatedRestrictions).toContain("vegan");
    expect(
      outcome.blockingFindings.some(
        (finding) => finding.code === "DIET_VIOLATION_VEGAN",
      ),
    ).toBe(true);
  });
});
