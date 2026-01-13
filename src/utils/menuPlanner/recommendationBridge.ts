/**
 * Recommendation Bridge
 * Connects planetary day recommendations with existing recipe/ingredient recommenders
 *
 * @file src/utils/menuPlanner/recommendationBridge.ts
 * @created 2026-01-11 (Phase 3)
 */

import type { DayOfWeek, MealType } from "@/types/menuPlanner";
import type { Recipe, ElementalProperties } from "@/types/recipe";
import type { AstrologyHookData } from "@/hooks/useAstrologicalState";
import {
  getPlanetaryDayCharacteristics,
  calculateDayFoodCompatibility,
  type PlanetaryDayCharacteristics,
} from "@/utils/planetaryDayRecommendations";
import { createLogger } from "@/utils/logger";
import { getRecipes } from "@/data/recipes";
import { searchRecipes, type RecipeSearchOptions } from "@/utils/recipeSearchEngine";

const logger = createLogger("RecommendationBridge");

/**
 * Astrological state interface for recommendations
 * Simplified interface that matches what we get from useAstrologicalState
 */
export interface AstrologicalState {
  currentZodiac: string;
  lunarPhase: string;
  activePlanets: string[];
  domElements: ElementalProperties;
  currentPlanetaryHour?: string;
}

/**
 * Day recommendation options
 */
export interface DayRecommendationOptions {
  mealTypes?: MealType[];
  dietaryRestrictions?: string[];
  useCurrentPlanetary?: boolean;
  maxRecipesPerMeal?: number;
  preferredCuisines?: string[];
  excludeIngredients?: string[];
}

/**
 * Recommended meal result
 */
export interface RecommendedMeal {
  mealType: MealType;
  recipe: Recipe;
  score: number;
  reasons: string[];
  dayAlignment: number;
  planetaryAlignment: number;
}

/**
 * Generate meal recommendations for a specific day
 *
 * @param dayOfWeek - Day of week
 * @param astroState - Current astrological state
 * @param options - Recommendation options
 * @returns Array of recommended meals
 */
export async function generateDayRecommendations(
  dayOfWeek: DayOfWeek,
  astroState: AstrologicalState,
  options: DayRecommendationOptions = {},
): Promise<RecommendedMeal[]> {
  try {
    const {
      mealTypes = ["breakfast", "lunch", "dinner"],
      maxRecipesPerMeal = 3,
      dietaryRestrictions = [],
      preferredCuisines = [],
      excludeIngredients = [],
    } = options;

    const dayChar = getPlanetaryDayCharacteristics(dayOfWeek);

    logger.info(`Generating recommendations for ${dayChar.planet} day`, {
      dayOfWeek,
      mealTypes,
    });

    const recommendations: RecommendedMeal[] = [];

    // Generate recommendations for each meal type
    for (const mealType of mealTypes) {
      const mealRecs = await generateMealRecommendations(
        dayOfWeek,
        mealType,
        dayChar,
        astroState,
        {
          maxRecipes: maxRecipesPerMeal,
          dietaryRestrictions,
          preferredCuisines,
          excludeIngredients,
        },
      );

      recommendations.push(...mealRecs);
    }

    logger.info(`Generated ${recommendations.length} recommendations`);

    return recommendations;
  } catch (error) {
    logger.error("Failed to generate day recommendations:", error);
    return [];
  }
}

/**
 * Generate recommendations for a specific meal
 *
 * @param dayOfWeek - Day of week
 * @param mealType - Type of meal
 * @param dayChar - Planetary day characteristics
 * @param astroState - Astrological state
 * @param options - Options for meal recommendations
 * @returns Array of recommended meals
 */
async function generateMealRecommendations(
  dayOfWeek: DayOfWeek,
  mealType: MealType,
  dayChar: PlanetaryDayCharacteristics,
  astroState: AstrologicalState,
  options: {
    maxRecipes: number;
    dietaryRestrictions: string[];
    preferredCuisines: string[];
    excludeIngredients: string[];
  },
): Promise<RecommendedMeal[]> {
  try {
    // Get candidate recipes (this would come from your recipe database)
    const candidateRecipes = await searchRecipesForDay(
      dayChar,
      mealType,
      options,
    );

    // Score each recipe
    const scoredRecipes = candidateRecipes.map((recipe) => {
      const { score, reasons, dayAlignment, planetaryAlignment } = scoreRecipeForDay(
        recipe,
        dayChar,
        mealType,
        astroState,
      );

      return {
        mealType,
        recipe,
        score,
        reasons,
        dayAlignment,
        planetaryAlignment,
      };
    });

    // Sort by score and take top N
    scoredRecipes.sort((a, b) => b.score - a.score);

    return scoredRecipes.slice(0, options.maxRecipes);
  } catch (error) {
    logger.error(`Failed to generate ${mealType} recommendations:`, error);
    return [];
  }
}

/**
 * Search for recipes appropriate for a specific day
 *
 * NOTE: This is a placeholder that returns mock data.
 * In a real implementation, this would query your recipe database
 * with filters based on day characteristics.
 *
 * @param dayChar - Planetary day characteristics
 * @param mealType - Type of meal
 * @param options - Search options
 * @returns Array of candidate recipes
 */
async function searchRecipesForDay(
  dayChar: PlanetaryDayCharacteristics,
  mealType: MealType,
  options: {
    dietaryRestrictions: string[];
    preferredCuisines: string[];
    excludeIngredients: string[];
  },
): Promise<Recipe[]> {
  try {
    logger.debug("Searching recipes for day", {
      planet: dayChar.planet,
      mealType,
      cuisines: dayChar.recommendedCuisines,
    });

    // 1. Get all recipes from database
    const allRecipes = await getRecipes();

    // 2. Build search options
    const searchOptions: RecipeSearchOptions = {
      mealType: [mealType],
      excludeIngredients: options.excludeIngredients,
      planetaryDay: 0 as DayOfWeek, // Will be enhanced later
      limit: 50, // Get top 50 matches
    };

    // Add cuisine preference if provided
    if (options.preferredCuisines.length > 0) {
      searchOptions.cuisine = options.preferredCuisines;
    } else {
      // Use day's recommended cuisines
      searchOptions.cuisine = dayChar.recommendedCuisines;
    }

    // Add dietary restrictions
    options.dietaryRestrictions.forEach((restriction) => {
      const lower = restriction.toLowerCase();
      if (lower.includes("vegetarian")) searchOptions.isVegetarian = true;
      if (lower.includes("vegan")) searchOptions.isVegan = true;
      if (lower.includes("gluten")) searchOptions.isGlutenFree = true;
      if (lower.includes("dairy")) searchOptions.isDairyFree = true;
      if (lower.includes("nut")) searchOptions.isNutFree = true;
    });

    // 3. Search and score recipes
    const scoredRecipes = searchRecipes(
      allRecipes as unknown as Recipe[],
      searchOptions
    );

    // 4. Return top matches (already sorted by score)
    const topRecipes = scoredRecipes.slice(0, 10); // Top 10 for this meal

    logger.info(`Found ${topRecipes.length} recipes for ${mealType} on ${dayChar.planet} day`);

    return topRecipes as Recipe[];
  } catch (error) {
    logger.error("Failed to search recipes:", error);
    return [];
  }
}

/**
 * Score a recipe for alignment with a specific day
 *
 * @param recipe - Recipe to score
 * @param dayChar - Planetary day characteristics
 * @param mealType - Type of meal
 * @param astroState - Current astrological state
 * @returns Score and reasons
 */
function scoreRecipeForDay(
  recipe: Recipe,
  dayChar: PlanetaryDayCharacteristics,
  mealType: MealType,
  astroState: AstrologicalState,
): {
  score: number;
  reasons: string[];
  dayAlignment: number;
  planetaryAlignment: number;
} {
  const reasons: string[] = [];
  let score = 0;
  const weights = {
    elemental: 0.3,
    cuisine: 0.2,
    nutritional: 0.15,
    mealType: 0.15,
    planetary: 0.2,
  };

  // 1. Elemental alignment
  if (recipe.elementalProperties) {
    const elementalScore = calculateDayFoodCompatibility(
      dayChar,
      recipe.elementalProperties,
    );
    score += elementalScore * weights.elemental;

    if (elementalScore > 0.7) {
      reasons.push(`Strong elemental alignment with ${dayChar.planet} energy`);
    }
  }

  // 2. Cuisine match
  if (recipe.cuisine) {
    const cuisineMatch = dayChar.recommendedCuisines.some((c) =>
      recipe.cuisine?.toLowerCase().includes(c.toLowerCase()),
    );
    if (cuisineMatch) {
      score += weights.cuisine;
      reasons.push(`${recipe.cuisine} cuisine aligned with ${dayChar.planet} day`);
    }
  }

  // 3. Nutritional emphasis
  const nutritionalScore = scoreNutritionalAlignment(
    recipe,
    dayChar.nutritionalEmphasis,
  );
  score += nutritionalScore * weights.nutritional;

  if (nutritionalScore > 0.7) {
    reasons.push(`Matches ${dayChar.nutritionalEmphasis} emphasis`);
  }

  // 4. Meal type appropriateness
  const mealTypeScore = scoreMealTypeAppropriate(recipe, mealType, dayChar);
  score += mealTypeScore * weights.mealType;

  // 5. Planetary hour alignment (if available)
  let planetaryScore = 0.5; // Default neutral score
  if (astroState.currentPlanetaryHour) {
    planetaryScore = astroState.currentPlanetaryHour.toLowerCase() === dayChar.planet.toLowerCase() ? 1.0 : 0.3;
    if (planetaryScore > 0.7) {
      reasons.push(`Perfect timing with ${astroState.currentPlanetaryHour} planetary hour`);
    }
  }
  score += planetaryScore * weights.planetary;

  // Normalize score to 0-1 range
  const normalizedScore = Math.max(0, Math.min(1, score));

  return {
    score: normalizedScore,
    reasons,
    dayAlignment: score / (weights.elemental + weights.cuisine + weights.nutritional + weights.mealType),
    planetaryAlignment: planetaryScore,
  };
}

/**
 * Score nutritional alignment with day's emphasis
 *
 * @param recipe - Recipe to score
 * @param emphasis - Nutritional emphasis
 * @returns Score (0-1)
 */
function scoreNutritionalAlignment(
  recipe: Recipe,
  emphasis: "protein" | "carbs" | "fats" | "balanced",
): number {
  if (!recipe.nutritionalProfile) return 0.5;

  const nutritionProfile = recipe.nutritionalProfile as any;
  const protein = nutritionProfile.protein || 0;
  const carbs = nutritionProfile.carbs || 0;
  const fat = nutritionProfile.fat || 0;
  const total = protein + carbs + fat;

  if (total === 0) return 0.5;

  const proteinRatio = protein / total;
  const carbsRatio = carbs / total;
  const fatRatio = fat / total;

  switch (emphasis) {
    case "protein":
      return proteinRatio > 0.35 ? 1.0 : proteinRatio / 0.35;
    case "carbs":
      return carbsRatio > 0.45 ? 1.0 : carbsRatio / 0.45;
    case "fats":
      return fatRatio > 0.30 ? 1.0 : fatRatio / 0.30;
    case "balanced":
      // Check if ratios are reasonably balanced (none too high or too low)
      const balance =
        1 -
        Math.abs(proteinRatio - 0.3) -
        Math.abs(carbsRatio - 0.4) -
        Math.abs(fatRatio - 0.3);
      return Math.max(0, Math.min(1, balance));
    default:
      return 0.5;
  }
}

/**
 * Score how appropriate a recipe is for a meal type on a specific day
 *
 * @param recipe - Recipe to score
 * @param mealType - Type of meal
 * @param dayChar - Day characteristics
 * @returns Score (0-1)
 */
function scoreMealTypeAppropriate(
  recipe: Recipe,
  mealType: MealType,
  dayChar: PlanetaryDayCharacteristics,
): number {
  // If recipe has meal type tags, check for exact match
  if (recipe.mealTypes && Array.isArray(recipe.mealTypes)) {
    if (recipe.mealTypes.includes(mealType)) {
      return 1.0;
    }
  }

  // Fallback: Use prep time as a heuristic
  const prepTime = typeof recipe.prepTime === "string"
    ? parseInt(recipe.prepTime.match(/\d+/)?.[0] || "30", 10)
    : (recipe.prepTime || 30);

  switch (mealType) {
    case "breakfast":
      // Breakfast should be quick (< 30 min)
      return prepTime <= 30 ? 1.0 : 0.5;
    case "lunch":
      // Lunch can be moderate (< 45 min)
      return prepTime <= 45 ? 1.0 : 0.6;
    case "dinner":
      // Dinner can be longer, especially on Jupiter/Venus days
      if (dayChar.planet === "Jupiter" || dayChar.planet === "Venus") {
        return 1.0; // Any prep time okay
      }
      return prepTime <= 60 ? 1.0 : 0.7;
    case "snack":
      // Snacks should be very quick (< 15 min)
      return prepTime <= 15 ? 1.0 : 0.3;
    default:
      return 0.5;
  }
}

/**
 * Get ingredient recommendations for a specific day
 *
 * @param dayOfWeek - Day of week
 * @param astroState - Astrological state
 * @param limit - Maximum number of ingredients
 * @returns Array of recommended ingredient names
 */
export function getDailyIngredientRecommendations(
  dayOfWeek: DayOfWeek,
  astroState: AstrologicalState,
  limit: number = 20,
): string[] {
  const dayChar = getPlanetaryDayCharacteristics(dayOfWeek);

  // Return day-specific recommended foods
  return dayChar.recommendedFoods.slice(0, limit);
}

/**
 * Get cuisine recommendations for a specific day
 *
 * @param dayOfWeek - Day of week
 * @param astroState - Astrological state
 * @returns Array of recommended cuisines with scores
 */
export function getDailyCuisineRecommendations(
  dayOfWeek: DayOfWeek,
  astroState: AstrologicalState,
): Array<{ cuisine: string; score: number; reason: string }> {
  const dayChar = getPlanetaryDayCharacteristics(dayOfWeek);

  return dayChar.recommendedCuisines.map((cuisine, index) => ({
    cuisine,
    score: 1.0 - index * 0.1, // Decrease score for later cuisines
    reason: `Aligned with ${dayChar.planet} (${dayChar.element} element) energy`,
  }));
}

/**
 * Get cooking method recommendations for a specific day
 *
 * @param dayOfWeek - Day of week
 * @param mealType - Type of meal
 * @returns Array of recommended cooking methods
 */
export function getDailyCookingMethods(
  dayOfWeek: DayOfWeek,
  mealType: MealType,
): string[] {
  const dayChar = getPlanetaryDayCharacteristics(dayOfWeek);

  // Filter methods appropriate for meal type
  const breakfastMethods = ["steaming", "poaching", "baking", "quick-cooking"];
  const lunchMethods = ["grilling", "roasting", "stir-frying", "searing"];
  const dinnerMethods = ["slow-cooking", "braising", "roasting", "multi-course"];
  const snackMethods = ["assembly", "raw preparations"];

  let appropriateMethods: string[] = [];

  switch (mealType) {
    case "breakfast":
      appropriateMethods = breakfastMethods;
      break;
    case "lunch":
      appropriateMethods = lunchMethods;
      break;
    case "dinner":
      appropriateMethods = dinnerMethods;
      break;
    case "snack":
      appropriateMethods = snackMethods;
      break;
  }

  // Return methods that appear in both day recommendations and meal-appropriate methods
  return dayChar.cookingMethods.filter((method) =>
    appropriateMethods.some((am) => method.toLowerCase().includes(am.toLowerCase())),
  );
}
