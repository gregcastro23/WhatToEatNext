/**
 * Recipe Search Engine
 * Advanced recipe search with filtering, scoring, and ranking
 *
 * @file src/utils/recipeSearchEngine.ts
 * @created 2026-01-10 (Phase 2)
 */

import type { MealType, DayOfWeek } from "@/types/menuPlanner";
import { getPlanetaryDayCharacteristics } from "@/types/menuPlanner";
import type { Recipe, ElementalProperties } from "@/types/recipe";
import { createLogger } from "@/utils/logger";
import {
  jaccardSimilarity,
  looseIncludes,
  normalizeForMatch,
} from "@/utils/searchNormalize";

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
 * Calculate text similarity score (Jaccard similarity over normalized tokens).
 * Backed by the shared search-normalization util so it tolerates separators
 * and punctuation consistently with the rest of the app's search bars.
 */
function calculateTextSimilarity(text1: string, text2: string): number {
  return jaccardSimilarity(text1, text2);
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

  return recipe.ingredients.some((ingredient) =>
    excludeList.some((excluded) => looseIncludes(ingredient.name, excluded)),
  );
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

  // 1. Name match (0-100 points). Uses separator-tolerant matching so
  // "chicken_tikka", "chicken-tikka", and "chicken tikka" all hit equally.
  // Also scores against cuisine and tags, since users often type those
  // directly into the search box (e.g. "italian", "weeknight").
  if (options.query) {
    const queryNorm = normalizeForMatch(options.query);
    const nameNorm = normalizeForMatch(recipe.name);

    if (nameNorm && nameNorm === queryNorm) {
      details.nameMatch = 100;
    } else if (looseIncludes(recipe.name, options.query) && nameNorm) {
      details.nameMatch = 50 + (queryNorm.length / nameNorm.length) * 50;
    } else if (looseIncludes(recipe.cuisine, options.query)) {
      details.nameMatch = 45;
    } else if (
      Array.isArray(recipe.tags) &&
      recipe.tags.some((tag) => looseIncludes(tag, options.query))
    ) {
      details.nameMatch = 42;
    } else if (
      recipe.ingredients?.some((ing) => looseIncludes(ing.name, options.query))
    ) {
      details.nameMatch = 40;
    } else if (looseIncludes(recipe.description, options.query)) {
      details.nameMatch = 35;
    } else {
      details.nameMatch =
        calculateTextSimilarity(recipe.name, options.query) * 30;
    }
  }

  // 2. Ingredient match (0-50 points)
  if (options.includeIngredients && options.includeIngredients.length > 0) {
    let matchCount = 0;
    recipe.ingredients?.forEach((ingredient) => {
      if (
        options.includeIngredients!.some((included) =>
          looseIncludes(ingredient.name, included),
        )
      ) {
        matchCount++;
      }
    });

    details.ingredientMatch =
      (matchCount / options.includeIngredients.length) * 50;
  }

  // 3. Cuisine match (0-40 points)
  if (options.cuisine && options.cuisine.length > 0) {
    const matchesCuisine = options.cuisine.some((c) =>
      looseIncludes(recipe.cuisine, c),
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
    if (options.prepTimeMax || options.cookTimeMax || options.totalTimeMax) {
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
      results = results.filter(
        (r) =>
          !options.excludeCuisine!.some((c) => looseIncludes(r.cuisine, c)),
      );
    }

    // 5. Filter by spice level
    if (
      options.spiceLevelMin !== undefined ||
      options.spiceLevelMax !== undefined
    ) {
      results = results.filter((r) => {
        const spiceLevel = typeof r.spiceLevel === "number" ? r.spiceLevel : 0;
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
      const wanted = options.season.map((s) => normalizeForMatch(s));
      results = results.filter((r) => {
        if (!r.season) return false;
        const recipeSeasons = Array.isArray(r.season) ? r.season : [r.season];
        return recipeSeasons.some((s) =>
          wanted.includes(normalizeForMatch(s)),
        );
      });
    }

    // 7. Filter by tags
    if (options.tags && options.tags.length > 0) {
      const wanted = options.tags.map((t) => normalizeForMatch(t));
      results = results.filter((r) => {
        if (!r.tags || r.tags.length === 0) return false;
        return wanted.some((tag) =>
          r.tags!.some((rt) => normalizeForMatch(rt) === tag),
        );
      });
    }

    // 8. Exclude by tags
    if (options.excludeTags && options.excludeTags.length > 0) {
      const excluded = options.excludeTags.map((t) => normalizeForMatch(t));
      results = results.filter((r) => {
        if (!r.tags || r.tags.length === 0) return true;
        return !excluded.some((tag) =>
          r.tags!.some((rt) => normalizeForMatch(rt) === tag),
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

/**
 * Search recipes by ingredients
 * Returns recipes that contain any of the specified ingredients
 * Results are scored by how many matching ingredients they have
 */
export function searchRecipesByIngredients(
  recipes: Recipe[],
  ingredients: string[],
  options: {
    matchAll?: boolean; // If true, recipe must contain all ingredients
    excludeIngredients?: string[];
    limit?: number;
  } = {},
): ScoredRecipe[] {
  if (ingredients.length === 0) {
    return [];
  }

  const { matchAll = false, excludeIngredients = [], limit = 20 } = options;
  const searchTerms = ingredients.map((i) => i.trim()).filter(Boolean);

  // Filter recipes by ingredient match
  const filteredRecipes = recipes.filter((recipe) => {
    if (!recipe.ingredients || recipe.ingredients.length === 0) return false;

    // Check excluded ingredients first
    if (excludeIngredients.length > 0) {
      const hasExcluded = recipe.ingredients.some((ing) =>
        excludeIngredients.some((ex) => looseIncludes(ing.name, ex)),
      );
      if (hasExcluded) return false;
    }

    const ings = recipe.ingredients;
    const check = (searchIng: string): boolean =>
      ings.some((ing) => looseIncludes(ing.name, searchIng));

    return matchAll ? searchTerms.every(check) : searchTerms.some(check);
  });

  // Score recipes by number of matching ingredients
  const scoredRecipes: ScoredRecipe[] = filteredRecipes.map((recipe) => {
    const matchedIngredients = new Set<string>();
    recipe.ingredients?.forEach((ing) => {
      searchTerms.forEach((searchIng) => {
        if (looseIncludes(ing.name, searchIng)) {
          matchedIngredients.add(searchIng);
        }
      });
    });

    const matchRatio =
      searchTerms.length > 0 ? matchedIngredients.size / searchTerms.length : 0;
    const ingredientScore = matchRatio * 80; // Max 80 points for ingredient match

    return {
      ...recipe,
      searchScore: ingredientScore,
      matchDetails: {
        nameMatch: 0,
        ingredientMatch: ingredientScore,
        cuisineMatch: 0,
        mealTypeMatch: 0,
        elementalMatch: 0,
        planetaryMatch: 0,
        dietaryMatch: 0,
        timeMatch: 0,
      },
    };
  });

  // Sort by score descending
  scoredRecipes.sort((a, b) => b.searchScore - a.searchScore);

  // Apply limit
  return scoredRecipes.slice(0, limit);
}

/**
 * Get all unique ingredients from recipes
 * Useful for autocomplete/suggestions
 */
export function getAllUniqueIngredients(recipes: Recipe[]): string[] {
  const ingredientSet = new Set<string>();

  recipes.forEach((recipe) => {
    recipe.ingredients?.forEach((ing) => {
      // Normalize ingredient name (lowercase, trim)
      const normalized = ing.name.toLowerCase().trim();
      if (normalized.length > 0) {
        ingredientSet.add(normalized);
      }
    });
  });

  // Sort alphabetically
  return Array.from(ingredientSet).sort();
}

/**
 * Search ingredients for autocomplete. Uses the shared separator-tolerant
 * normalizer so "oat_milk", "oat-milk", and "oatmilk" all surface the same
 * stored ingredient names.
 */
export function searchIngredients(
  recipes: Recipe[],
  query: string,
  limit: number = 10,
): string[] {
  if (!query || query.length < 2) return [];

  const allIngredients = getAllUniqueIngredients(recipes);
  const queryNorm = normalizeForMatch(query);
  if (!queryNorm) return [];
  const queryCompact = queryNorm.replace(/\s+/g, "");

  const matches = allIngredients.filter((ing) => looseIncludes(ing, query));

  // Sort: prioritise ingredients whose normalized form starts with the query
  matches.sort((a, b) => {
    const an = normalizeForMatch(a);
    const bn = normalizeForMatch(b);
    const aStarts =
      an.startsWith(queryNorm) || an.replace(/\s+/g, "").startsWith(queryCompact)
        ? 0
        : 1;
    const bStarts =
      bn.startsWith(queryNorm) || bn.replace(/\s+/g, "").startsWith(queryCompact)
        ? 0
        : 1;
    if (aStarts !== bStarts) return aStarts - bStarts;
    return a.localeCompare(b);
  });

  return matches.slice(0, limit);
}

/**
 * Recipe Completeness Audit
 * Checks recipes for required fields and data quality
 */
export interface RecipeAuditResult {
  totalRecipes: number;
  completeRecipes: number;
  incompleteRecipes: RecipeIssue[];
  stats: {
    missingIngredients: number;
    missingInstructions: number;
    missingNutrition: number;
    missingCalories: number;
    missingProtein: number;
    missingCarbs: number;
    missingFat: number;
    missingFiber: number;
    missingPrepTime: number;
    missingDescription: number;
  };
}

export interface RecipeIssue {
  recipeId: string;
  recipeName: string;
  cuisine?: string;
  issues: string[];
}

/**
 * Audit recipes for data completeness
 * Checks for:
 * - ingredients array with name, amount, unit
 * - instructions array
 * - nutrition object with calories, protein, carbs, fat, fiber
 * - prepTime or timeToMake
 * - description
 */
export function auditRecipeCompleteness(recipes: Recipe[]): RecipeAuditResult {
  const stats = {
    missingIngredients: 0,
    missingInstructions: 0,
    missingNutrition: 0,
    missingCalories: 0,
    missingProtein: 0,
    missingCarbs: 0,
    missingFat: 0,
    missingFiber: 0,
    missingPrepTime: 0,
    missingDescription: 0,
  };

  const incompleteRecipes: RecipeIssue[] = [];

  for (const recipe of recipes) {
    const issues: string[] = [];

    // Check ingredients
    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      issues.push("Missing ingredients array");
      stats.missingIngredients++;
    } else {
      // Check if ingredients have required fields
      const hasIncompleteIngredients = recipe.ingredients.some(
        (ing) => !ing.name || (!ing.amount && ing.amount !== 0) || !ing.unit,
      );
      if (hasIncompleteIngredients) {
        issues.push("Some ingredients missing name/amount/unit");
      }
    }

    // Check instructions
    if (!recipe.instructions || recipe.instructions.length === 0) {
      issues.push("Missing instructions array");
      stats.missingInstructions++;
    }

    // Check nutrition
    if (!recipe.nutrition) {
      issues.push("Missing nutrition object");
      stats.missingNutrition++;
      stats.missingCalories++;
      stats.missingProtein++;
      stats.missingCarbs++;
      stats.missingFat++;
      stats.missingFiber++;
    } else {
      if (recipe.nutrition.calories === undefined) {
        issues.push("Missing calories");
        stats.missingCalories++;
      }
      if (recipe.nutrition.protein === undefined) {
        issues.push("Missing protein");
        stats.missingProtein++;
      }
      if (recipe.nutrition.carbs === undefined) {
        issues.push("Missing carbs");
        stats.missingCarbs++;
      }
      if (recipe.nutrition.fat === undefined) {
        issues.push("Missing fat");
        stats.missingFat++;
      }
      if (recipe.nutrition.fiber === undefined) {
        issues.push("Missing fiber");
        stats.missingFiber++;
      }
    }

    // Check prep time (accepts prepTime or timeToMake)
    if (!recipe.prepTime && !recipe.timeToMake) {
      issues.push("Missing prepTime/timeToMake");
      stats.missingPrepTime++;
    }

    // Check description
    if (!recipe.description) {
      issues.push("Missing description");
      stats.missingDescription++;
    }

    if (issues.length > 0) {
      incompleteRecipes.push({
        recipeId: recipe.id || "unknown",
        recipeName: recipe.name || "Unnamed recipe",
        cuisine: recipe.cuisine,
        issues,
      });
    }
  }

  return {
    totalRecipes: recipes.length,
    completeRecipes: recipes.length - incompleteRecipes.length,
    incompleteRecipes,
    stats,
  };
}

/**
 * Get audit summary as formatted string
 */
export function formatAuditSummary(audit: RecipeAuditResult): string {
  const completionRate = (
    (audit.completeRecipes / audit.totalRecipes) *
    100
  ).toFixed(1);

  const lines = [
    "=== Recipe Completeness Audit ===",
    `Total Recipes: ${audit.totalRecipes}`,
    `Complete Recipes: ${audit.completeRecipes} (${completionRate}%)`,
    `Incomplete Recipes: ${audit.incompleteRecipes.length}`,
    "",
    "--- Missing Data Stats ---",
    `Ingredients: ${audit.stats.missingIngredients}`,
    `Instructions: ${audit.stats.missingInstructions}`,
    `Nutrition: ${audit.stats.missingNutrition}`,
    `  - Calories: ${audit.stats.missingCalories}`,
    `  - Protein: ${audit.stats.missingProtein}`,
    `  - Carbs: ${audit.stats.missingCarbs}`,
    `  - Fat: ${audit.stats.missingFat}`,
    `  - Fiber: ${audit.stats.missingFiber}`,
    `Time (prepTime/timeToMake): ${audit.stats.missingPrepTime}`,
    `Description: ${audit.stats.missingDescription}`,
  ];

  if (
    audit.incompleteRecipes.length > 0 &&
    audit.incompleteRecipes.length <= 20
  ) {
    lines.push("", "--- Incomplete Recipes (first 20) ---");
    audit.incompleteRecipes.slice(0, 20).forEach((r, i) => {
      lines.push(`${i + 1}. ${r.recipeName} (${r.cuisine || "no cuisine"})`);
      lines.push(`   Issues: ${r.issues.join(", ")}`);
    });
  }

  return lines.join("\n");
}
