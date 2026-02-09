/**
 * Recommendation Bridge
 * Connects planetary day recommendations with existing recipe/ingredient recommenders
 * Now includes user chart personalization for tailored recommendations
 *
 * @file src/utils/menuPlanner/recommendationBridge.ts
 * @created 2026-01-11 (Phase 3)
 * @updated 2026-02-03 - Added user chart personalization support
 */

import type { DayOfWeek, MealType } from "@/types/menuPlanner";
import type { Recipe, ElementalProperties } from "@/types/recipe";
import type { AstrologyHookData } from "@/hooks/useAstrologicalState";
import type { NatalChart } from "@/types/natalChart";
import type { ChartComparison } from "@/services/ChartComparisonService";
import {
  getPlanetaryDayCharacteristics,
  calculateDayFoodCompatibility,
  type PlanetaryDayCharacteristics,
} from "@/utils/planetaryDayRecommendations";
import { createLogger } from "@/utils/logger";
import { allRecipes } from "@/data/recipes/index";

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
 * User personalization context for recommendations
 */
export interface UserPersonalizationContext {
  natalChart: NatalChart;
  chartComparison?: ChartComparison;
  prioritizeHarmony?: boolean;
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
  /** User personalization context for chart-based recommendations */
  userContext?: UserPersonalizationContext;
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
  /** Personalized score after applying user chart boost */
  personalizedScore?: number;
  /** Personalization boost multiplier (0.7-1.3) */
  personalizationBoost?: number;
  /** Whether recommendation was personalized for user */
  isPersonalized?: boolean;
}

/**
 * Generate meal recommendations for a specific day
 *
 * @param dayOfWeek - Day of week
 * @param astroState - Current astrological state
 * @param options - Recommendation options (including optional user personalization)
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
      userContext,
    } = options;

    const dayChar = getPlanetaryDayCharacteristics(dayOfWeek);
    const hasPersonalization = !!userContext?.natalChart;

    logger.info(`Generating recommendations for ${dayChar.planet} day`, {
      dayOfWeek,
      mealTypes,
      personalized: hasPersonalization,
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

    // Apply personalization if user context is provided
    if (hasPersonalization) {
      const personalizedRecs = applyUserPersonalization(
        recommendations,
        userContext,
      );

      logger.info(`Generated ${personalizedRecs.length} personalized recommendations`);
      return personalizedRecs;
    }

    logger.info(`Generated ${recommendations.length} recommendations`);
    return recommendations;
  } catch (error) {
    logger.error("Failed to generate day recommendations:", error);
    return [];
  }
}

/**
 * Apply user chart personalization to recommendations
 *
 * @param recommendations - Base recommendations
 * @param userContext - User personalization context
 * @returns Personalized recommendations sorted by personalized score
 */
function applyUserPersonalization(
  recommendations: RecommendedMeal[],
  userContext: UserPersonalizationContext,
): RecommendedMeal[] {
  const { natalChart, chartComparison, prioritizeHarmony = true } = userContext;

  const personalized = recommendations.map((rec) => {
    // Calculate personalization boost based on elemental alignment with user's chart
    const boost = calculatePersonalizationBoost(
      rec.recipe,
      natalChart,
      chartComparison,
    );

    const personalizedScore = rec.score * boost;
    const reasons = [...rec.reasons];

    // Add personalization reasons
    if (boost > 1.05) {
      reasons.push(`Aligned with your ${natalChart.dominantElement} dominant element`);
    }
    if (boost > 1.15) {
      reasons.push("Strong cosmic harmony with your birth chart");
    }

    return {
      ...rec,
      personalizedScore,
      personalizationBoost: boost,
      isPersonalized: true,
      reasons,
    };
  });

  // Sort by personalized score if prioritizing harmony
  if (prioritizeHarmony) {
    personalized.sort((a, b) =>
      (b.personalizedScore || b.score) - (a.personalizedScore || a.score)
    );
  }

  return personalized;
}

/**
 * Calculate personalization boost based on user's natal chart
 *
 * @param recipe - Recipe to evaluate
 * @param natalChart - User's natal chart
 * @param chartComparison - Optional chart comparison with current moment
 * @returns Boost multiplier (0.7 to 1.3)
 */
function calculatePersonalizationBoost(
  recipe: Recipe,
  natalChart: NatalChart,
  chartComparison?: ChartComparison,
): number {
  let boost = 1.0;

  // 1. Elemental alignment with user's dominant element (±15%)
  if (recipe.elementalProperties && natalChart.elementalBalance) {
    const dominantElement = natalChart.dominantElement;
    const recipeElementValue = recipe.elementalProperties[dominantElement] || 0;

    // Higher recipe value for user's dominant element = higher boost
    boost += (recipeElementValue - 0.25) * 0.6; // -0.15 to +0.45 range compressed to ±0.15
  }

  // 2. Chart comparison harmony (if available) (±10%)
  if (chartComparison) {
    const harmonyBoost = (chartComparison.overallHarmony - 0.5) * 0.2;
    boost += harmonyBoost;

    // Extra boost for favorable elements
    if (chartComparison.insights?.favorableElements && recipe.elementalProperties) {
      const favorableMatch = chartComparison.insights.favorableElements.some(
        (el) => {
          const elementKey = el as keyof ElementalProperties;
          return (recipe.elementalProperties?.[elementKey] || 0) > 0.3;
        }
      );
      if (favorableMatch) {
        boost += 0.05;
      }
    }
  }

  // 3. Alchemical property alignment (±5%)
  if (natalChart.alchemicalProperties && (recipe as any).alchemicalProperties) {
    const recipeAlch = (recipe as any).alchemicalProperties;
    const userAlch = natalChart.alchemicalProperties;

    // Simple dot product similarity for alchemical properties
    let similarity = 0;
    const props = ['Spirit', 'Essence', 'Matter', 'Substance'] as const;
    let userTotal = 0;
    let recipeTotal = 0;

    for (const prop of props) {
      similarity += (userAlch[prop] || 0) * (recipeAlch[prop] || 0);
      userTotal += (userAlch[prop] || 0) ** 2;
      recipeTotal += (recipeAlch[prop] || 0) ** 2;
    }

    if (userTotal > 0 && recipeTotal > 0) {
      const cosineSim = similarity / (Math.sqrt(userTotal) * Math.sqrt(recipeTotal));
      boost += (cosineSim - 0.5) * 0.1; // ±0.05
    }
  }

  // Clamp to valid range
  return Math.max(0.7, Math.min(1.3, boost));
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
 * Search for recipes appropriate for a specific day and meal type
 *
 * Uses the standardized allRecipes array and filters by:
 * - Meal type suitability
 * - Cuisine preferences (planetary day recommendations)
 * - Dietary restrictions
 * - Excluded ingredients
 *
 * @param dayChar - Planetary day characteristics
 * @param mealType - Type of meal
 * @param options - Search options
 * @returns Array of candidate recipes sorted by compatibility
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

    // Cast allRecipes to Recipe[] type
    const recipes = allRecipes as unknown as Recipe[];

    if (!recipes || recipes.length === 0) {
      logger.warn("No recipes available in allRecipes");
      return [];
    }

    logger.debug(`Total recipes available: ${recipes.length}`);

    // Filter recipes by criteria
    const filteredRecipes = recipes.filter((recipe) => {
      // 1. Check meal type suitability
      if (!isMealTypeSuitable(recipe, mealType)) {
        return false;
      }

      // 2. Check dietary restrictions
      if (!checkDietaryRestrictions(recipe, options.dietaryRestrictions)) {
        return false;
      }

      // 3. Check excluded ingredients
      if (hasExcludedIngredients(recipe, options.excludeIngredients)) {
        return false;
      }

      return true;
    });

    logger.debug(`Recipes after filtering: ${filteredRecipes.length}`);

    // If no filtered recipes, return a broader set
    if (filteredRecipes.length === 0) {
      logger.info("No exact matches found, returning general recipes for meal type");
      return recipes
        .filter((r) => isMealTypeSuitable(r, mealType))
        .slice(0, 20);
    }

    // Score and sort recipes by cuisine match and elemental alignment
    const scoredRecipes = filteredRecipes.map((recipe) => {
      let score = 0;

      // Cuisine match bonus (0-40 points)
      const cuisineMatchScore = calculateCuisineMatchScore(
        recipe,
        options.preferredCuisines.length > 0
          ? options.preferredCuisines
          : dayChar.recommendedCuisines,
      );
      score += cuisineMatchScore;

      // Elemental alignment bonus (0-30 points)
      if (recipe.elementalProperties) {
        const elementalScore = calculateDayFoodCompatibility(
          dayChar,
          recipe.elementalProperties,
        );
        score += elementalScore * 30;
      }

      // Cooking method alignment (0-20 points)
      const cookingMethodScore = calculateCookingMethodScore(
        recipe,
        dayChar.cookingMethods,
      );
      score += cookingMethodScore;

      return { recipe, score };
    });

    // Sort by score descending
    scoredRecipes.sort((a, b) => b.score - a.score);

    // Return top 15 recipes
    const topRecipes = scoredRecipes.slice(0, 15).map((sr) => sr.recipe);

    logger.info(
      `Found ${topRecipes.length} recipes for ${mealType} on ${dayChar.planet} day`,
    );

    return topRecipes;
  } catch (error) {
    logger.error("Failed to search recipes:", error);
    return [];
  }
}

/**
 * Check if a recipe is suitable for a given meal type
 */
function isMealTypeSuitable(recipe: Recipe, mealType: MealType): boolean {
  // Check explicit mealType field
  if (recipe.mealType) {
    const recipeMealTypes = Array.isArray(recipe.mealType)
      ? recipe.mealType
      : [recipe.mealType];
    const normalized = recipeMealTypes.map((t) =>
      typeof t === "string" ? t.toLowerCase() : "",
    );
    if (normalized.includes(mealType)) return true;
  }

  // Check tags for meal type hints
  const tags = (recipe.tags || []).map((t) =>
    typeof t === "string" ? t.toLowerCase() : "",
  );
  const name = (recipe.name || "").toLowerCase();
  const desc = (recipe.description || "").toLowerCase();

  if (mealType === "breakfast") {
    const breakfastKeywords = [
      "breakfast",
      "egg",
      "oat",
      "pancake",
      "waffle",
      "smoothie",
      "cereal",
      "toast",
      "muffin",
      "granola",
      "yogurt",
      "morning",
      "brunch",
    ];
    return breakfastKeywords.some(
      (k) =>
        name.includes(k) || desc.includes(k) || tags.some((t) => t.includes(k)),
    );
  }

  if (mealType === "lunch") {
    const lunchKeywords = [
      "lunch",
      "sandwich",
      "salad",
      "soup",
      "wrap",
      "bowl",
      "light",
      "quick",
    ];
    return lunchKeywords.some(
      (k) =>
        name.includes(k) || desc.includes(k) || tags.some((t) => t.includes(k)),
    );
  }

  if (mealType === "dinner") {
    // Most recipes are suitable for dinner - return true for main dishes
    const dinnerKeywords = [
      "dinner",
      "pasta",
      "steak",
      "roast",
      "stir-fry",
      "curry",
      "stew",
      "casserole",
      "grill",
      "bake",
      "main",
      "entree",
    ];
    // Also include recipes that don't specifically match breakfast/lunch
    const notBreakfast = ![
      "breakfast",
      "pancake",
      "waffle",
      "cereal",
      "oatmeal",
    ].some((k) => name.includes(k));
    return (
      dinnerKeywords.some(
        (k) =>
          name.includes(k) ||
          desc.includes(k) ||
          tags.some((t) => t.includes(k)),
      ) || notBreakfast
    );
  }

  if (mealType === "snack") {
    const snackKeywords = [
      "snack",
      "appetizer",
      "finger",
      "bite",
      "small",
      "light",
      "dip",
    ];
    return snackKeywords.some(
      (k) =>
        name.includes(k) || desc.includes(k) || tags.some((t) => t.includes(k)),
    );
  }

  // Default: any recipe could work
  return true;
}

/**
 * Check dietary restrictions compliance
 */
function checkDietaryRestrictions(
  recipe: Recipe,
  restrictions: string[],
): boolean {
  if (!restrictions || restrictions.length === 0) return true;

  // Helper to get ingredient name from RecipeIngredient
  const getIngredientName = (ing: { name: string }): string => {
    return (ing.name || "").toLowerCase();
  };

  for (const restriction of restrictions) {
    const lower = restriction.toLowerCase();

    if (lower.includes("vegetarian")) {
      // Check if recipe has meat ingredients
      const meatKeywords = [
        "beef",
        "chicken",
        "pork",
        "lamb",
        "fish",
        "meat",
        "bacon",
        "sausage",
      ];
      const hasMeat = (recipe.ingredients || []).some((ing) => {
        const ingName = getIngredientName(ing);
        return meatKeywords.some((m) => ingName.includes(m));
      });
      if (hasMeat) return false;
    }

    if (lower.includes("vegan")) {
      const animalKeywords = [
        "beef",
        "chicken",
        "pork",
        "lamb",
        "fish",
        "meat",
        "egg",
        "milk",
        "cheese",
        "cream",
        "butter",
        "honey",
      ];
      const hasAnimal = (recipe.ingredients || []).some((ing) => {
        const ingName = getIngredientName(ing);
        return animalKeywords.some((a) => ingName.includes(a));
      });
      if (hasAnimal) return false;
    }

    if (lower.includes("gluten")) {
      const glutenKeywords = ["wheat", "flour", "bread", "pasta", "noodle"];
      const hasGluten = (recipe.ingredients || []).some((ing) => {
        const ingName = getIngredientName(ing);
        return glutenKeywords.some((g) => ingName.includes(g));
      });
      if (hasGluten) return false;
    }
  }

  return true;
}

/**
 * Check if recipe has excluded ingredients
 */
function hasExcludedIngredients(
  recipe: Recipe,
  excludeList: string[],
): boolean {
  if (!excludeList || excludeList.length === 0) return false;
  if (!recipe.ingredients || recipe.ingredients.length === 0) return false;

  const excludeLower = excludeList.map((i) => i.toLowerCase());

  return recipe.ingredients.some((ingredient) => {
    const ingName = (ingredient.name || "").toLowerCase();
    return excludeLower.some((excluded) => ingName.includes(excluded));
  });
}

/**
 * Calculate cuisine match score
 */
function calculateCuisineMatchScore(
  recipe: Recipe,
  targetCuisines: string[],
): number {
  if (!targetCuisines || targetCuisines.length === 0) return 20; // Neutral score

  const recipeCuisine = (recipe.cuisine || "").toLowerCase();

  // Exact match
  if (targetCuisines.some((c) => recipeCuisine === c.toLowerCase())) {
    return 40;
  }

  // Partial match (contains)
  if (
    targetCuisines.some(
      (c) =>
        recipeCuisine.includes(c.toLowerCase()) ||
        c.toLowerCase().includes(recipeCuisine),
    )
  ) {
    return 25;
  }

  return 10; // No match but still included
}

/**
 * Calculate cooking method alignment score
 */
function calculateCookingMethodScore(
  recipe: Recipe,
  targetMethods: string[],
): number {
  if (!targetMethods || targetMethods.length === 0) return 10;

  // cookingMethod is already string[] according to Recipe type
  const recipeMethods = Array.isArray(recipe.cookingMethod)
    ? recipe.cookingMethod
    : recipe.cookingTechniques || [];

  if (recipeMethods.length === 0) return 10;

  const targetLower = targetMethods.map((m) => m.toLowerCase());
  const methodMatches = recipeMethods.filter((m) =>
    targetLower.some(
      (tm) =>
        m.toLowerCase().includes(tm) || tm.includes(m.toLowerCase()),
    ),
  ).length;

  return Math.min(20, (methodMatches / targetMethods.length) * 20);
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
