/**
 * Regression & integration tests for the ingredient-first meal planner upgrades:
 * - getPrimaryProtein explicit category + regex fallback
 * - scoreNutritionalAlignment reading nutrition vs nutritionalProfile + macro targets
 * - scoreIngredientSynergyAndTargets proportional match, unfulfilled target bonus, pantry, & perishables
 * - getServerRecipes & generateDayRecommendations end-to-end integration
 *
 * @file src/utils/menuPlanner/__tests__/ingredientFirstPlanning.test.ts
 */

import { getServerRecipes } from "@/actions/recipes";
import type { Recipe, RecipeIngredient } from "@/types/recipe";
import {
  generateDayRecommendations,
  getPrimaryProtein,
  scoreIngredientSynergyAndTargets,
  scoreNutritionalAlignment,
  scorePerishableSynergy,
  type AstrologicalState,
} from "@/utils/menuPlanner/recommendationBridge";

function makeIng(name: string, category?: string): RecipeIngredient {
  return {
    name,
    amount: 1,
    unit: "cup",
    ...(category !== undefined ? { category } : {}),
  };
}

function makeRecipe(
  id: string,
  name: string,
  ingredients: RecipeIngredient[],
  extras?: Pick<Recipe, "nutrition" | "nutritionalProfile">,
): Recipe {
  return {
    id,
    name,
    ingredients,
    instructions: ["Prepare ingredients", "Cook until done"],
    elementalProperties: { Fire: 0.3, Water: 0.2, Earth: 0.3, Air: 0.2 },
    ...(extras ?? {}),
  };
}

function makeAstroState(): AstrologicalState {
  return {
    currentZodiac: "libra",
    lunarPhase: "waxing crescent",
    activePlanets: ["Sun", "Venus"],
    domElements: { Fire: 0.3, Water: 0.2, Earth: 0.3, Air: 0.2 },
  };
}

describe("getPrimaryProtein", () => {
  it("prefers explicit category === 'protein' when present", () => {
    const recipe = makeRecipe("p1", "Tagged Protein Dish", [
      makeIng("jasmine rice", "other"),
      makeIng("wild salmon fillet", "protein"),
    ]);
    expect(getPrimaryProtein(recipe)).toBe("wild salmon fillet");
  });

  it("falls back to regex protein detection when category is omitted or 'other'", () => {
    const beanRecipe = makeRecipe("p2", "Untagged Bean Bowl", [
      makeIng("brown rice"),
      makeIng("black beans", "other"),
      makeIng("fresh spinach", "produce"),
    ]);
    expect(getPrimaryProtein(beanRecipe)).toBe("black beans");
  });

  it("returns undefined when no protein keyword or category matches", () => {
    const side = makeRecipe("p3", "Simple Greens", [
      makeIng("baby spinach"),
      makeIng("olive oil"),
    ]);
    expect(getPrimaryProtein(side)).toBeUndefined();
  });
});

describe("scoreNutritionalAlignment", () => {
  it("reads recipe.nutrition when nutritionalProfile is undefined", () => {
    const balanced = makeRecipe("n1", "Balanced Bowl", [makeIng("rice")], {
      nutrition: { calories: 600, protein: 30, carbs: 40, fat: 30 },
    });
    expect(scoreNutritionalAlignment(balanced, "balanced")).toBeCloseTo(1, 5);
    expect(scoreNutritionalAlignment(balanced, "protein")).toBeCloseTo(0.3 / 0.35, 3);
  });

  it("supports explicit calorie and protein targets", () => {
    const exactMatch = makeRecipe("n2", "Target Match", [makeIng("chicken")], {
      nutritionalProfile: { calories: 650, protein: 30, carbs: 60, fat: 20 },
    });
    const offTarget = makeRecipe("n3", "Low Protein", [makeIng("pasta")], {
      nutrition: { calories: 950, protein: 6, carbs: 140, fat: 25 },
    });
    const exactScore = scoreNutritionalAlignment(exactMatch, {
      caloriesPerMeal: 650,
      proteinGramsPerMeal: 30,
    });
    const offScore = scoreNutritionalAlignment(offTarget, {
      dailyCalories: 1950,
      dailyProtein: 90,
    });
    expect(exactScore).toBe(1);
    expect(offScore).toBeLessThan(0.5);
  });
});

describe("scoreIngredientSynergyAndTargets", () => {
  it("exposes scorePerishableSynergy alias and boosts unfulfilled targets", () => {
    expect(scorePerishableSynergy).toBe(scoreIngredientSynergyAndTargets);
    const chickenDish = makeRecipe("s1", "Chicken Skillet", [
      makeIng("chicken breast"),
      makeIng("garlic"),
    ]);
    const beanDish = makeRecipe("s2", "Black Bean Rice Bowl", [
      makeIng("black beans"),
      makeIng("jasmine rice"),
    ]);
    const existingMeals = [{ ingredients: [{ name: "chicken breast" }] }];

    const repeatScore = scoreIngredientSynergyAndTargets(
      chickenDish,
      ["chicken", "black beans", "spinach"],
      existingMeals,
    );
    const newTargetScore = scoreIngredientSynergyAndTargets(
      beanDish,
      ["chicken", "black beans", "spinach"],
      existingMeals,
    );
    expect(newTargetScore.requiredMatchScore).toBeGreaterThan(repeatScore.requiredMatchScore);
    expect(newTargetScore.requiredMatchScore).toBeCloseTo(1 / 3 + 0.25, 3);
  });

  it("rewards pantry overlap and shared perishables across existingMeals", () => {
    const candidate = makeRecipe("s3", "Spinach Cilantro Tacos", [
      makeIng("black beans"),
      makeIng("fresh spinach"),
      makeIng("cilantro"),
      makeIng("corn tortillas"),
    ]);
    const existingMeals = [
      { recipe: { ingredients: [makeIng("baby spinach"), makeIng("fresh cilantro")] } },
    ];
    const result = scoreIngredientSynergyAndTargets(
      candidate,
      ["black beans", "spinach"],
      existingMeals,
      ["black beans", { name: "corn tortillas" }],
    );
    expect(result.pantryMatchScore).toBeGreaterThan(0);
    expect(result.perishableSynergyScore).toBeGreaterThan(0.5);
  });
});

describe("catalog and generateDayRecommendations integration", () => {
  it("populates ingredient categories and nutrition on server catalog recipes", async () => {
    const catalog = await getServerRecipes();
    expect(catalog.length).toBeGreaterThan(50);

    const categorizedCount = catalog.filter((r) =>
      r.ingredients.some((i) => i.category === "protein" || i.category === "produce"),
    ).length;
    expect(categorizedCount).toBeGreaterThan(30);

    const withNutrition = catalog.find((r) => r.nutrition !== undefined);
    expect(withNutrition?.nutritionalProfile).toBeDefined();
  });

  it("generates distinct day recommendations honoring requiredIngredients and intra-day state", async () => {
    const recs = await generateDayRecommendations(1, makeAstroState(), {
      mealTypes: ["lunch", "dinner"],
      maxRecipesPerMeal: 1,
      requiredIngredients: ["spinach", "rice", "beans"],
      pantryInventory: ["olive oil", "garlic"],
    });
    expect(recs.length).toBe(2);
    expect(recs[0]?.recipe.id).not.toBe(recs[1]?.recipe.id);
  });
});
