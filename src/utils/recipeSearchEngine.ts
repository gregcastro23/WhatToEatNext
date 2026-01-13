/**
 * Recipe Search Engine
 * Advanced recipe search with filtering, scoring, and ranking
 *
 * @file src/utils/recipeSearchEngine.ts
 * @created 2026-01-10 (Phase 2)
 */

import type { Recipe, ElementalProperties } from "@/types/recipe";
import type { MealType, DayOfWeek } from "@/types/menuPlanner";
import { getPlanetaryDayCharacteristics } from "@/types/menuPlanner";
import { createLogger } from "@/utils/logger";

const logger = createLogger("RecipeSearchEngine");

/**
 * Recipe search options interface
 */
export interface RecipeSearchOptions {
  // Text search
  query?: string;

  // Cuisine filters
  cuisine?: string[];
  excludeCuisine?: string[];

  // Dietary filters
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isDairyFree?: boolean;
  isNutFree?: boolean;
  isLowCarb?: boolean;
  isKeto?: boolean;
  isPaleo?: boolean;

  // Meal type
  mealType?: MealType[];

  // Time constraints
  prepTimeMax?: number; // in minutes
  cookTimeMax?: number; // in minutes
  totalTimeMax?: number; // in minutes

  // Spice level
  spiceLevelMin?: number;
  spiceLevelMax?: number;

  // Elemental matching
  elementalMatch?: Partial<ElementalProperties>;
  elementalMatchThreshold?: number; // 0-1, default 0.7

  // Ingredients
  includeIngredients?: string[];
  excludeIngredients?: string[];

  // Planetary alignment
  planetaryDay?: DayOfWeek;
  planetaryInfluences?: string[];

  // Season
  season?: string[];

  // Tags
  tags?: string[];
  excludeTags?: string[];

  // Pagination
  limit?: number;
  offset?: number;
}

/**
 * Scored recipe result
 */
export interface ScoredRecipe extends Recipe {
  searchScore: number;
  matchDetails: {
    nameMatch: number;
    ingredientMatch: number;
    cuisineMatch: number;
    mealTypeMatch: number;
    elementalMatch: number;
    planetaryMatch: number;
    dietaryMatch: number;
    timeMatch: number;
  };
}

/**
 * Calculate text similarity score (simple Jaccard similarity)
 */
function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));

  const intersection = new Set([...words1].filter((x) => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return union.size > 0 ? intersection.size / union.size : 0;
}

/**
 * Calculate elemental properties similarity (cosine similarity)
 */
function calculateElementalSimilarity(
  props1: ElementalProperties,
  props2: Partial<ElementalProperties>,
): number {
  const elements = ["Fire", "Water", "Earth", "Air"] as const;

  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;

  elements.forEach((element) => {
    const val1 = props1[element] || 0;
    const val2 = props2[element] || 0;

    dotProduct += val1 * val2;
    mag1 += val1 * val1;
    mag2 += val2 * val2;
  });

  mag1 = Math.sqrt(mag1);
  mag2 = Math.sqrt(mag2);

  if (mag1 === 0 || mag2 === 0) return 0;

  return dotProduct / (mag1 * mag2);
}

/**
 * Extract time in minutes from various time formats
 */
function parseTimeToMinutes(timeStr?: string | number): number {
  if (typeof timeStr === "number") return timeStr;
  if (!timeStr) return 0;

  const str = timeStr.toLowerCase();

  // Extract number and unit
  const match = str.match(/(\d+)\s*(min|minute|minutes|hour|hours|h)/);
  if (!match) return 0;

  const value = parseInt(match[1], 10);
  const unit = match[2];

  if (unit.startsWith("h")) {
    return value * 60;
  }

  return value;
}

/**
 * Check if recipe meets dietary requirements
 */
function checkDietaryCompliance(
  recipe: Recipe,
  options: RecipeSearchOptions,
): boolean {
  if (options.isVegetarian && !recipe.isVegetarian) return false;
  if (options.isVegan && !recipe.isVegan) return false;
  if (options.isGlutenFree && !recipe.isGlutenFree) return false;
  if (options.isDairyFree && !recipe.isDairyFree) return false;
  if (options.isNutFree && !recipe.isNutFree) return false;
  if (options.isLowCarb && !recipe.isLowCarb) return false;
  if (options.isKeto && !recipe.isKeto) return false;
  if (options.isPaleo && !recipe.isPaleo) return false;

  return true;
}

/**
 * Check if recipe matches time constraints
 */
function checkTimeConstraints(
  recipe: Recipe,
  options: RecipeSearchOptions,
): boolean {
  if (options.prepTimeMax) {
    const prepTime = parseTimeToMinutes(recipe.prepTime);
    if (prepTime > options.prepTimeMax) return false;
  }

  if (options.cookTimeMax) {
    const cookTime = parseTimeToMinutes(recipe.cookTime);
    if (cookTime > options.cookTimeMax) return false;
  }

  if (options.totalTimeMax) {
    const totalTime = parseTimeToMinutes(recipe.totalTime);
    if (totalTime > options.totalTimeMax) return false;
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
    const ingName = ingredient.name.toLowerCase();
    return excludeLower.some((excluded) => ingName.includes(excluded));
  });
}

/**
 * Calculate match score for a recipe
 */
function calculateRecipeScore(
  recipe: Recipe,
  options: RecipeSearchOptions,
): { score: number; details: ScoredRecipe["matchDetails"] } {
  const details: ScoredRecipe["matchDetails"] = {
    nameMatch: 0,
    ingredientMatch: 0,
    cuisineMatch: 0,
    mealTypeMatch: 0,
    elementalMatch: 0,
    planetaryMatch: 0,
    dietaryMatch: 0,
    timeMatch: 0,
  };

  // 1. Name match (0-100 points)
  if (options.query) {
    const query = options.query.toLowerCase();
    const name = recipe.name.toLowerCase();

    if (name === query) {
      details.nameMatch = 100;
    } else if (name.includes(query)) {
      details.nameMatch = 50 + (query.length / name.length) * 50;
    } else {
      details.nameMatch = calculateTextSimilarity(name, query) * 30;
    }
  }

  // 2. Ingredient match (0-50 points)
  if (options.includeIngredients && options.includeIngredients.length > 0) {
    const includeLower = options.includeIngredients.map((i) => i.toLowerCase());
    let matchCount = 0;

    recipe.ingredients?.forEach((ingredient) => {
      const ingName = ingredient.name.toLowerCase();
      if (includeLower.some((included) => ingName.includes(included))) {
        matchCount++;
      }
    });

    details.ingredientMatch =
      (matchCount / options.includeIngredients.length) * 50;
  }

  // 3. Cuisine match (0-40 points)
  if (options.cuisine && options.cuisine.length > 0) {
    const recipeCuisine = recipe.cuisine?.toLowerCase() || "";
    const matchesCuisine = options.cuisine.some(
      (c) => recipeCuisine.includes(c.toLowerCase()),
    );
    details.cuisineMatch = matchesCuisine ? 40 : 0;
  }

  // 4. Meal type match (0-35 points)
  if (options.mealType && options.mealType.length > 0) {
    const recipeMealTypes = Array.isArray(recipe.mealType)
      ? recipe.mealType
      : [recipe.mealType];

    const matchesMealType = recipeMealTypes.some((mt) =>
      options.mealType!.includes(mt as MealType),
    );
    details.mealTypeMatch = matchesMealType ? 35 : 0;
  }

  // 5. Elemental match (0-50 points)
  if (
    options.elementalMatch &&
    recipe.elementalProperties &&
    Object.keys(options.elementalMatch).length > 0
  ) {
    const similarity = calculateElementalSimilarity(
      recipe.elementalProperties,
      options.elementalMatch,
    );
    details.elementalMatch = similarity * 50;
  }

  // 6. Planetary alignment (0-30 points)
  if (options.planetaryDay !== undefined) {
    const dayCharacteristics = getPlanetaryDayCharacteristics(
      options.planetaryDay,
    );
    const planet = dayCharacteristics.planet;

    // Check if recipe has favorable planetary influences
    if (recipe.planetaryInfluences?.favorable?.includes(planet)) {
      details.planetaryMatch = 30;
    } else if (!recipe.planetaryInfluences?.unfavorable?.includes(planet)) {
      details.planetaryMatch = 15;
    }
  }

  // 7. Dietary compliance bonus (0-20 points)
  const dietaryCount = [
    options.isVegetarian,
    options.isVegan,
    options.isGlutenFree,
    options.isDairyFree,
    options.isNutFree,
    options.isLowCarb,
    options.isKeto,
    options.isPaleo,
  ].filter(Boolean).length;

  if (dietaryCount > 0) {
    details.dietaryMatch = 20; // Passed all requirements
  }

  // 8. Time bonus (0-20 points)
  if (options.prepTimeMax || options.cookTimeMax || options.totalTimeMax) {
    const prepTime = parseTimeToMinutes(recipe.prepTime);
    const maxTime = options.prepTimeMax || options.totalTimeMax || 120;

    if (prepTime <= maxTime) {
      // Score higher for quicker recipes
      details.timeMatch = 20 * (1 - prepTime / maxTime);
    }
  }

  // Calculate total score
  const totalScore =
    details.nameMatch +
    details.ingredientMatch +
    details.cuisineMatch +
    details.mealTypeMatch +
    details.elementalMatch +
    details.planetaryMatch +
    details.dietaryMatch +
    details.timeMatch;

  return { score: totalScore, details };
}

/**
 * Search and filter recipes with scoring
 */
export function searchRecipes(
  recipes: Recipe[],
  options: RecipeSearchOptions = {},
): ScoredRecipe[] {
  try {
    logger.debug("Searching recipes with options:", options);

    let results = recipes;

    // 1. Filter by dietary requirements
    if (
      options.isVegetarian ||
      options.isVegan ||
      options.isGlutenFree ||
      options.isDairyFree ||
      options.isNutFree ||
      options.isLowCarb ||
      options.isKeto ||
      options.isPaleo
    ) {
      results = results.filter((r) => checkDietaryCompliance(r, options));
    }

    // 2. Filter by time constraints
    if (
      options.prepTimeMax ||
      options.cookTimeMax ||
      options.totalTimeMax
    ) {
      results = results.filter((r) => checkTimeConstraints(r, options));
    }

    // 3. Filter by excluded ingredients
    if (options.excludeIngredients && options.excludeIngredients.length > 0) {
      results = results.filter(
        (r) => !hasExcludedIngredients(r, options.excludeIngredients!),
      );
    }

    // 4. Filter by excluded cuisines
    if (options.excludeCuisine && options.excludeCuisine.length > 0) {
      results = results.filter((r) => {
        const recipeCuisine = r.cuisine?.toLowerCase() || "";
        return !options.excludeCuisine!.some((c) =>
          recipeCuisine.includes(c.toLowerCase()),
        );
      });
    }

    // 5. Filter by spice level
    if (
      options.spiceLevelMin !== undefined ||
      options.spiceLevelMax !== undefined
    ) {
      results = results.filter((r) => {
        const spiceLevel =
          typeof r.spiceLevel === "number" ? r.spiceLevel : 0;
        if (
          options.spiceLevelMin !== undefined &&
          spiceLevel < options.spiceLevelMin
        ) {
          return false;
        }
        if (
          options.spiceLevelMax !== undefined &&
          spiceLevel > options.spiceLevelMax
        ) {
          return false;
        }
        return true;
      });
    }

    // 6. Filter by season
    if (options.season && options.season.length > 0) {
      results = results.filter((r) => {
        if (!r.season) return false;
        const recipeSeasons = Array.isArray(r.season) ? r.season : [r.season];
        return recipeSeasons.some((s) =>
          options.season!.some((os) => s.toLowerCase() === os.toLowerCase()),
        );
      });
    }

    // 7. Filter by tags
    if (options.tags && options.tags.length > 0) {
      results = results.filter((r) => {
        if (!r.tags || r.tags.length === 0) return false;
        return options.tags!.some((tag) =>
          r.tags!.some((rt) => rt.toLowerCase() === tag.toLowerCase()),
        );
      });
    }

    // 8. Exclude by tags
    if (options.excludeTags && options.excludeTags.length > 0) {
      results = results.filter((r) => {
        if (!r.tags || r.tags.length === 0) return true;
        return !options.excludeTags!.some((tag) =>
          r.tags!.some((rt) => rt.toLowerCase() === tag.toLowerCase()),
        );
      });
    }

    // 9. Score and rank results
    const scoredResults: ScoredRecipe[] = results.map((recipe) => {
      const { score, details } = calculateRecipeScore(recipe, options);
      return {
        ...recipe,
        searchScore: score,
        matchDetails: details,
      };
    });

    // 10. Sort by score (descending)
    scoredResults.sort((a, b) => b.searchScore - a.searchScore);

    // 11. Apply pagination
    const start = options.offset || 0;
    const end = options.limit ? start + options.limit : undefined;
    const paginatedResults = scoredResults.slice(start, end);

    logger.info(
      `Found ${scoredResults.length} recipes, returning ${paginatedResults.length}`,
    );

    return paginatedResults;
  } catch (error) {
    logger.error("Recipe search error:", error);
    return [];
  }
}

/**
 * Quick search by text only (for search bar)
 */
export function quickSearchRecipes(
  recipes: Recipe[],
  query: string,
  limit: number = 20,
): ScoredRecipe[] {
  return searchRecipes(recipes, { query, limit });
}

/**
 * Get recommended recipes for a specific meal type and day
 */
export function getRecommendedRecipesForMeal(
  recipes: Recipe[],
  dayOfWeek: DayOfWeek,
  mealType: MealType,
  limit: number = 10,
): ScoredRecipe[] {
  return searchRecipes(recipes, {
    mealType: [mealType],
    planetaryDay: dayOfWeek,
    limit,
  });
}

/**
 * Get recipes matching dietary restrictions
 */
export function getRecipesByDiet(
  recipes: Recipe[],
  dietType:
    | "vegetarian"
    | "vegan"
    | "glutenFree"
    | "dairyFree"
    | "nutFree"
    | "lowCarb"
    | "keto"
    | "paleo",
  limit?: number,
): ScoredRecipe[] {
  const options: RecipeSearchOptions = { limit };

  switch (dietType) {
    case "vegetarian":
      options.isVegetarian = true;
      break;
    case "vegan":
      options.isVegan = true;
      break;
    case "glutenFree":
      options.isGlutenFree = true;
      break;
    case "dairyFree":
      options.isDairyFree = true;
      break;
    case "nutFree":
      options.isNutFree = true;
      break;
    case "lowCarb":
      options.isLowCarb = true;
      break;
    case "keto":
      options.isKeto = true;
      break;
    case "paleo":
      options.isPaleo = true;
      break;
  }

  return searchRecipes(recipes, options);
}
