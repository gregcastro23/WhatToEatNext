/**
 * @jest-environment node
 *
 * Unit tests for recommendations route options adapter and userContext stripping.
 */

import { toDayRecommendationOptions } from "../optionsAdapter";

describe("toDayRecommendationOptions", () => {
  it("strictly excludes userContext from output", () => {
    const maliciousInput = {
      mealTypes: ["lunch"],
      userContext: {
        natalChart: {
          planets: [{ name: "Sun", sign: "aries", position: 10 }],
        },
        prioritizeHarmony: false,
      },
      unsupportedOption: "arbitrary",
    };

    const adapted = toDayRecommendationOptions(maliciousInput);

    expect(adapted.mealTypes).toEqual(["lunch"]);
    expect(adapted.userContext).toBeUndefined();
    expect("userContext" in adapted).toBe(false);
    expect("unsupportedOption" in adapted).toBe(false);
  });

  it("handles undefined or empty input gracefully", () => {
    expect(toDayRecommendationOptions(undefined)).toEqual({});
    expect(toDayRecommendationOptions(null)).toEqual({});
    expect(toDayRecommendationOptions("string")).toEqual({});
    expect(toDayRecommendationOptions([])).toEqual({});
  });

  it("adapts allowlisted properties accurately", () => {
    const fullInput = {
      mealTypes: ["breakfast", "dinner"],
      dietaryRestrictions: ["gluten-free", "vegan"],
      useCurrentPlanetary: true,
      maxRecipesPerMeal: 3,
      preferredCuisines: ["Italian", "Japanese"],
      excludeIngredients: ["peanuts"],
      requiredIngredients: ["basil"],
      preferredCookingMethods: ["sauté"],
      flavorPreferences: ["savory"],
      favoriteIngredients: ["garlic"],
      dislikedIngredients: ["cilantro"],
      complexityPreference: "simple",
      budgetPerMeal: 15,
      maxPrepTimeMinutes: 30,
      existingMeals: [
        {
          recipeId: "r-1",
          recipeName: "Pasta",
          cuisine: "Italian",
          primaryProtein: "beans",
        },
      ],
      nutritionalContext: {
        remainingCalories: 500,
        remainingProteinG: 30,
        prioritizeProtein: true,
      },
    };

    const adapted = toDayRecommendationOptions(fullInput);

    expect(adapted.mealTypes).toEqual(["breakfast", "dinner"]);
    expect(adapted.dietaryRestrictions).toEqual(["gluten-free", "vegan"]);
    expect(adapted.useCurrentPlanetary).toBe(true);
    expect(adapted.maxRecipesPerMeal).toBe(3);
    expect(adapted.preferredCuisines).toEqual(["Italian", "Japanese"]);
    expect(adapted.excludeIngredients).toEqual(["peanuts"]);
    expect(adapted.requiredIngredients).toEqual(["basil"]);
    expect(adapted.preferredCookingMethods).toEqual(["sauté"]);
    expect(adapted.flavorPreferences).toEqual(["savory"]);
    expect(adapted.favoriteIngredients).toEqual(["garlic"]);
    expect(adapted.dislikedIngredients).toEqual(["cilantro"]);
    expect(adapted.complexityPreference).toBe("simple");
    expect(adapted.budgetPerMeal).toBe(15);
    expect(adapted.maxPrepTimeMinutes).toBe(30);
    expect(adapted.existingMeals).toHaveLength(1);
    expect(adapted.nutritionalContext?.prioritizeProtein).toBe(true);
  });

  it("filters out invalid meal types and invalid complexity", () => {
    const input = {
      mealTypes: ["invalid_meal", "breakfast"],
      complexityPreference: "extra_complex",
    };

    const adapted = toDayRecommendationOptions(input);

    expect(adapted.mealTypes).toEqual(["breakfast"]);
    expect(adapted.complexityPreference).toBeUndefined();
  });
});
