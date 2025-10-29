import kalchmEngine from '@/calculations/core/kalchmEngine';
import astrologizeCache from '@/services/AstrologizeApiCache';
import { LocalRecipeService } from '@/services/LocalRecipeService';
import { AstrologicalState, IngredientMapping, Season } from '@/types/alchemy';
import type { ElementalProperties, Recipe } from '@/types/recipe';
import { isNonEmptyArray } from '../common/arrayUtils';
import { createLogger } from '../logger';

const _logger = createLogger('RecipeMatching');

import {
    getRecipeAstrologicalInfluences,
    getRecipeCookingMethods,
    getRecipeCookingTime,
    getRecipeElementalProperties,
    getRecipeMealTypes,
    getRecipeSeasons,
    isRecipeDietaryCompatible,
    recipeHasIngredient,
} from './recipeUtils';

// ===== INTERFACES =====

interface MatchResult {
  recipe: Recipe;
  score: number;
  elements: ElementalProperties;
  dominantElements: [string, number][];
  matchedIngredients?: {
    name: string;
    matchedTo?: IngredientMapping;
    confidence: number;
  }[];
}

interface MatchFilters {
  maxCookingTime?: number;
  dietaryRestrictions?: string[];
  season?: Season;
  currentSeason?: string;
  servings?: number;
  excludeIngredients?: string[];
  cookingMethods?: string[];
  nutritionalGoals?: Record<string, unknown>;
  astrologicalSign?: string;
  mealType?: string;
  preferHigherContrast?: boolean;
}


// ===== CACHING SYSTEM =====

interface CacheEntry<T> {
  data: T,
  timestamp: number;
}

const matchCache = new Map<string, CacheEntry<MatchResult[]>>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Generate cache key for recipe matching
 */
function getCacheKey()
  recipes: Recipe[] | undefined,
  filters: MatchFilters,
  energy: ElementalProperties | null,
  limit: number,
): string {
  return JSON.stringify({
    recipeCount: recipes?.length || 0,
    filters,
    energy,
    limit,
    timestamp: Math.floor(Date.now() / (5 * 60 * 1000)), // 5-minute buckets
  });
}

/**
 * Clear recipe match cache
 */
export function clearMatchCache(all = false): void {
  if (all) {
    matchCache.clear();
  } else {
    // Clear expired entries
    const now = Date.now();
    for (const [key, cacheEntry] of matchCache.entries() {
      if (now - cacheEntry.timestamp > CACHE_TTL) {
        matchCache.delete(key);
      }
    }
  }
}

// ===== MAIN MATCHING FUNCTIONS =====

/**
 * Enhanced energy matching using both absolute and relative elemental values
 */
const calculateEnergyMatch = async (
  recipeEnergy: ElementalProperties,
  currentEnergy: ElementalProperties,
): Promise<number> => {
  if (!recipeEnergy || !currentEnergy) {
    return 0.5; // Default match if no energy values provided
  }

  const elements: (keyof ElementalProperties)[] = ['Fire', 'Water', 'Earth', 'Air'];

  // Calculate absolute elemental matching
  let absoluteScore = 0;
  for (const element of elements) {
    const recipeValue = recipeEnergy[element] || 0;
    const currentValue = currentEnergy[element] || 0;

    // Since elements are harmonious, calculate similarity score
    const diff = Math.abs(recipeValue - currentValue);
    absoluteScore += (1 - diff) * 0.25; // 0.25 weight for each element
  }

  // Calculate relative elemental matching
  let relativeScore = 0;
  for (const element of elements) {
    const recipeValue = recipeEnergy[element] || 0;
    const currentValue = currentEnergy[element] || 0;

    // Calculate relative values (element / sum of other elements)
    const recipeOthers = elements
      .filter(e => e !== element)
      .reduce((sum, e) => sum + (recipeEnergy[e] || 0), 0);
    const currentOthers = elements
      .filter(e => e !== element)
      .reduce((sum, e) => sum + (currentEnergy[e] || 0), 0);

    const recipeRelative = recipeOthers > 0 ? recipeValue / recipeOthers : 0;
    const currentRelative = currentOthers > 0 ? currentValue / currentOthers : 0;

    const relativeDiff = Math.abs(recipeRelative - currentRelative);
    relativeScore += (1 - Math.min(1, relativeDiff)) * 0.25;
  }

  // Calculate kalchm alignment if available
  let kalchmScore = 0.7; // Default score
  try {
    // Convert elemental properties to alchemical properties for kalchm calculation
    const recipeAlchemical = {
      Spirit: recipeEnergy.Fire || 0.25,
      Essence: recipeEnergy.Air || 0.25,
      Matter: recipeEnergy.Earth || 0.25,
      Substance: recipeEnergy.Water || 0.25
};
    const currentAlchemical = {
      Spirit: currentEnergy.Fire || 0.25,
      Essence: currentEnergy.Air || 0.25,
      Matter: currentEnergy.Earth || 0.25,
      Substance: currentEnergy.Water || 0.25
};

    const recipeKalchmResult = kalchmEngine.calculateKAlchm()
      recipeAlchemical.Spirit,
      recipeAlchemical.Essence,
      recipeAlchemical.Matter,
      recipeAlchemical.Substance,
    );
    const currentKalchmResult = kalchmEngine.calculateKAlchm()
      currentAlchemical.Spirit,
      currentAlchemical.Essence,
      currentAlchemical.Matter,
      currentAlchemical.Substance,
    );

    // Apply safe casting for kalchm property access
    const recipeKalchmData =
      typeof recipeKalchmResult === 'object'
        ? (recipeKalchmResult as Record<string, unknown>)
        : { kalchm: recipeKalchmResult },
    const currentKalchmData =
      typeof currentKalchmResult === 'object'
        ? (currentKalchmResult as Record<string, unknown>)
        : { kalchm: currentKalchmResult },

    const recipeKalchmValue = Number(recipeKalchmData.kalchm ?? recipeKalchmResult ?? 0);
    const currentKalchmValue = Number(currentKalchmData.kalchm ?? currentKalchmResult ?? 0);

    if (recipeKalchmValue > 0 && currentKalchmValue > 0) {
      const kalchmRatio =
        Math.min(recipeKalchmValue, currentKalchmValue) /
        Math.max(recipeKalchmValue, currentKalchmValue);
      kalchmScore = 0.7 + kalchmRatio * 0.3; // 0.7-1.0 range
    }
  } catch (error) {
    _logger.warn('Kalchm calculation failed:', error);
  }

  // Combine scores with enhanced weighting
  const combinedScore =
    absoluteScore * 0.35 + // 35% absolute elemental matching
    relativeScore * 0.3 + // 30% relative elemental matching
    kalchmScore * 0.35; // 35% alchemical potential

  return Math.max(0, Math.min(1, combinedScore));
};

/**
 * Enhanced recommendation score calculation using astrologize cache when available
 */
export async function findBestMatches()
  recipes?: Recipe[],
  matchFilters: MatchFilters = {};
  currentEnergy: ElementalProperties | null = null;
  limit = 10;
): Promise<MatchResult[]> {
  try {
    // Check for cached astrological data to enhance matching
    const cacheData = astrologizeCache as unknown as any;
    const getLatestData = cacheData.getLatestCachedData;
    const cachedData = typeof getLatestData === 'function' ? await getLatestData() : null;

    // Use enhanced energy if available from cache
    const enhancedCurrentEnergy = cachedData?.elementalAbsolutes ||
      currentEnergy || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };

    // Calculate relative elemental values if we have absolute values
    let relativeElementalValues: ElementalProperties | null = null;
    if (enhancedCurrentEnergy) {
      const totalOther = {
        Fire:
          enhancedCurrentEnergy.Water + enhancedCurrentEnergy.Earth + enhancedCurrentEnergy.Air ||
          1,
        Water:
          enhancedCurrentEnergy.Fire + enhancedCurrentEnergy.Earth + enhancedCurrentEnergy.Air || 1,
        Earth:
          enhancedCurrentEnergy.Fire + enhancedCurrentEnergy.Water + enhancedCurrentEnergy.Air || 1,
        Air:
          enhancedCurrentEnergy.Fire + enhancedCurrentEnergy.Water + enhancedCurrentEnergy.Earth ||
          1,
      };

      relativeElementalValues = {
        Fire: enhancedCurrentEnergy.Fire / totalOther.Fire,
        Water: enhancedCurrentEnergy.Water / totalOther.Water,
        Earth: enhancedCurrentEnergy.Earth / totalOther.Earth,
        Air: enhancedCurrentEnergy.Air / totalOther.Air
};
    }

    // Generate a cache key based on inputs
    const cacheKey = getCacheKey(recipes, matchFilters, enhancedCurrentEnergy, limit);
    const cachedEntry = matchCache.get(cacheKey);

    // Check if we have a valid cache entry
    if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL) {
      return cachedEntry.data;
    }

    // If recipes is null, undefined, or not an array, fetch recipes using LocalRecipeService
    if (!recipes || !Array.isArray(recipes) || recipes.length === 0) {
      try {
        recipes = await LocalRecipeService.getAllRecipes();
      } catch (error) {
        _logger.error('Error fetching recipes:', error);
        return [];
      }
    }

    // Clone recipes to avoid modifying the original array
    let filteredRecipes = [...recipes];

    // Apply filters
    filteredRecipes = await applyMatchFilters(filteredRecipes, matchFilters);

    // If no recipes passed the filtering, return empty array
    if (!isNonEmptyArray(filteredRecipes) {
      return [];
    }

    // Calculate scores for each recipe
    const scoredRecipes = await Promise.all(filteredRecipes.map(async recipe => {
        let score = 0;
        const elements = await getRecipeElementalProperties(recipe);
        const dominantElements = Object.entries(elements).sort(([, a], [, b]) => b - a) as [
          string,
          number,
        ][];

        // Enhanced base score from elemental properties using both absolute and relative
        if (enhancedCurrentEnergy) {
          const absoluteMatch = await calculateEnergyMatch(elements, enhancedCurrentEnergy);
          score += absoluteMatch * 35; // 35% weight for absolute matching

          // If we have relative values, use them too
          if (relativeElementalValues) {
            const relativeMatch = await calculateEnergyMatch(elements, relativeElementalValues);
            score += relativeMatch * 25; // 25% weight for relative matching
          } else {
            score += 25; // Default if no relative values
          }
        } else {
          score += 30; // Default score if no energy provided
        }

        // Enhanced astrological compatibility using cached data
        if (cachedData && matchFilters.astrologicalSign) {
          const astrologicalBonus = await calculateEnhancedAstrologicalMatch()
            recipe,
            matchFilters.astrologicalSign,
            cachedData,
          );
          score += astrologicalBonus * 15; // 15% weight
        } else if (matchFilters.astrologicalSign) {
          // Fallback to original astrological matching
          const influences = await getRecipeAstrologicalInfluences(recipe);
          const currentSign = enhancedCurrentEnergy?.sign || enhancedCurrentEnergy?.zodiacSign;
          if (
            currentSign &&
            influences.some(influence =>)
              influence.toLowerCase().includes(String(currentSign).toLowerCase()),
            )
          ) {
            score += 12;
          }
        }

        // Seasonal bonus
        if (matchFilters.currentSeason) {
          const recipeSeasons = await getRecipeSeasons(recipe);
          if (
            recipeSeasons.some()
              season => season.toLowerCase() === matchFilters.currentSeason?.toLowerCase();
            )
          ) {
            score += 15;
          }
        }

        // Meal type bonus
        if (matchFilters.mealType) {
          const recipeMealTypes = await getRecipeMealTypes(recipe);
          if (
            recipeMealTypes.some()
              mealType => mealType.toLowerCase() === matchFilters.mealType?.toLowerCase();
            )
          ) {
            score += 10;
          }
        }

        // Nutritional goals alignment
        if (matchFilters.nutritionalGoals && recipe.nutrition) {
          const nutritionInfo = recipe.nutrition as Record<string, unknown>;
          score += calculateNutritionalMatch(nutritionInfo, matchFilters.nutritionalGoals) * 15;
        }

        // Complexity preference
        if (matchFilters.preferHigherContrast && dominantElements.length >= 2) {
          const contrast = dominantElements[0][1] - dominantElements[1][1];
          score += contrast * 10;
        }

        // Enhanced thermodynamic compatibility using monica constant if available
        if (cachedData?.alchemicalResult?.monica && !isNaN(cachedData.alchemicalResult.monica) {
          const monicaBonus = await calculateMonicaCompatibility()
            recipe,
            cachedData.alchemicalResult.monica,
          );
          score += monicaBonus * 8; // 8% weight for transformation potential
        }

        return {
          recipe,
          score: Math.max(0, Math.min(100, score)),
          elements,
          dominantElements,
          matchedIngredients: await connectIngredientsToMappings(recipe),
          matchScore: Math.min(1, Math.max(0, score / 100)), // Normalize to 0-1
          enhancedMatch: true, // Flag to indicate enhanced matching was used
          absoluteElementalMatch: enhancedCurrentEnergy
            ? await calculateEnergyMatch(elements, enhancedCurrentEnergy)
            : 0.5,
          relativeElementalMatch: relativeElementalValues
            ? await calculateEnergyMatch(elements, relativeElementalValues)
            : 0.5,
        };
      }),
    );

    // Sort by score and limit results
    const results = scoredRecipes.sort((a, b) => b.score - a.score).slice(0, limit);

    // Cache the results
    matchCache.set(cacheKey, {
      data: results,
      timestamp: Date.now()
});

    return results;
  } catch (error) {
    _logger.error('Error finding best matches:', error);
    return [];
  }
}

/**
 * Apply match filters to recipes
 */
async function applyMatchFilters(recipes: Recipe[], filters: MatchFilters): Promise<Recipe[]> {
  if (!isNonEmptyArray(recipes) {
    return [];
  }

  const filteredRecipes = [];
  for (const recipe of recipes) {
    try {
      // Cooking time filter
      if (filters.maxCookingTime) {
        const cookingTime = await getRecipeCookingTime(recipe);
        if (cookingTime > filters.maxCookingTime) continue;
      }

      // Dietary restrictions filter
      if (isNonEmptyArray(filters.dietaryRestrictions) {
        const hasIncompatibleRestriction = filters.dietaryRestrictions.some()
          restriction => !isRecipeDietaryCompatible(recipe, [restriction]),
        );
        if (hasIncompatibleRestriction) continue;
      }

      // Servings filter
      if (filters.servings) {
        const recipeServings = recipe.servings || recipe.numberOfServings || 0;
        const numericRecipeServings = Number(recipeServings);
        const numericFilterServings = Number(filters.servings);
        if (numericRecipeServings > 0 && numericRecipeServings < numericFilterServings) continue;
      }

      // Excluded ingredients filter
      if (isNonEmptyArray(filters.excludeIngredients) {
        const hasExcludedIngredient = filters.excludeIngredients.some(excluded =>)
          recipeHasIngredient(recipe, excluded),
        );
        if (hasExcludedIngredient) continue;
      }

      // Cooking methods filter
      if (isNonEmptyArray(filters.cookingMethods) {
        const recipeMethods = await getRecipeCookingMethods(recipe);
        const hasMatchingMethod = filters.cookingMethods.some(method =>)
          recipeMethods.some(recipeMethod =>)
            recipeMethod.toLowerCase().includes(method.toLowerCase()),
          ),
        );
        if (!hasMatchingMethod) continue;
      }

      filteredRecipes.push(recipe);
    } catch (error) {
      _logger.error('Error applying filters to recipe:', { recipe, error });
    }
  }

  return filteredRecipes;
}

// ===== CALCULATION FUNCTIONS =====

/**
 * Calculate recipe energy match
 */
export function calculateRecipeEnergyMatch()
  recipe: Recipe,
  currentEnergy: AstrologicalState,
): number {
  try {
    const recipeElements = getRecipeElementalProperties(recipe);

    // Calculate match score based on dominant element
    if (currentEnergy.dominantElement) {
      const matchElement = currentEnergy.dominantElement.toLowerCase();
      return recipeElements[matchElement as keyof ElementalProperties] || 0;
    }

    return 0.5; // Default match score
  } catch (error) {
    _logger.error('Error calculating recipe energy match:', error);
    return 0.5;
  }
}

/**
 * Calculate elemental alignment
 */
export function calculateElementalAlignment()
  recipe: Recipe,
  currentEnergy: AstrologicalState,
): number {
  try {
    const recipeElements = getRecipeElementalProperties(recipe);
    const influences = getRecipeAstrologicalInfluences(recipe);

    // Calculate base score from elemental match
    let score =
      recipeElements[currentEnergy.dominantElement?.toLowerCase() as keyof ElementalProperties] ||
      0;

    // Boost score if recipe has astrological influence matching current Sun sign
    const currentSign = (currentEnergy as any).sign || (currentEnergy as any).zodiacSign;
    if (
      currentSign &&
      influences.some((influence: string) =>
        influence.toLowerCase().includes(String(currentSign).toLowerCase()),
      )
    ) {
      score += 0.2;
    }

    // Cap at 1.0
    return Math.min(1.0, score);
  } catch (error) {
    _logger.error('Error calculating elemental alignment:', error);
    return 0.5;
  }
}

/**
 * Calculate nutritional match
 */
export function calculateNutritionalMatch()
  recipeProfile: Record<string, unknown>,
  userGoals: Record<string, unknown>,
): number {
  if (!recipeProfile || !userGoals) {
    return 0.5; // Default score for no data
  }

  try {
    let matchScore = 0;
    let totalGoals = 0;

    // Check each user goal against recipe
    for (const [key, goal] of Object.entries(userGoals) {
      if (key in recipeProfile) {
        const recipeValue = recipeProfile[key];

        // Skip if either value is not a number
        if (typeof goal !== 'number' || typeof recipeValue !== 'number') {
          continue;
        }

        totalGoals++;

        // Different handling for different nutritional aspects
        if (key === 'calories') {
          // For calories, we want to be at or below the goal
          matchScore += recipeValue <= goal ? 1 : 1 - Math.min(1, (recipeValue - goal) / goal);
        } else if (key === 'protein') {
          // For protein, we want to meet or exceed the goal
          matchScore += recipeValue >= goal ? 1 : 1 - Math.min(1, (goal - recipeValue) / goal);
        } else if (key === 'fat' || key === 'carbs') {
          // For fat and carbs, we want to be close to the goal
          const difference = Math.abs(recipeValue - goal);
          matchScore += 1 - Math.min(1, difference / goal);
        } else {
          // For other values, just compare directly
          const difference = Math.abs(recipeValue - goal);
          matchScore += 1 - Math.min(1, difference / Math.max(1, goal));
        }
      }
    }

    // Return average match score
    return totalGoals > 0 ? matchScore / totalGoals : 0.5;
  } catch (error) {
    _logger.error('Error calculating nutritional match:', error);
    return 0.5;
  }
}

/**
 * Calculate astrological match
 */
export function calculateAstrologicalMatch(recipeInfluence: unknown, userSign: string): number {
  if (!recipeInfluence || !userSign) {
    return 0.5; // Default score
  }

  try {
    // Handle different types of astrological influences
    if (Array.isArray(recipeInfluence) {
      return recipeInfluence.some(influence =>)
        influence.toLowerCase().includes(userSign.toLowerCase()),
      )
        ? 0.9
        : 0.3;
    }

    return 0.5; // Default score for unknown format
  } catch (error) {
    _logger.error('Error calculating astrological match:', error);
    return 0.5;
  }
}

/**
 * Calculate complexity match
 */
export function calculateComplexityMatch()
  recipeComplexity: number | string | undefined,
  currentMomentPreference: number | string | undefined,
): number {
  if (recipeComplexity === undefined || currentMomentPreference === undefined) {
    return 0.5; // Default score
  }

  try {
    // Convert to numbers if needed
    const recipeValue =
      typeof recipeComplexity === 'string' ? parseInt(recipeComplexity, 10) : recipeComplexity,
    const currentMomentValue =
      typeof currentMomentPreference === 'string'
        ? parseInt(currentMomentPreference, 10)
        : currentMomentPreference;

    // Calculate match based on proximity
    const difference = Math.abs(recipeValue - currentMomentValue);
    return 1 - Math.min(1, difference / 5); // Assuming complexity is on a 1-5 scale
  } catch (error) {
    _logger.error('Error calculating complexity match:', error);
    return 0.5;
  }
}

/**
 * Get recipe planetary influence
 */
export function getRecipePlanetaryInfluence(recipe: Recipe, planet: string): number {
  try {
    const elements = getRecipeElementalProperties(recipe);
    const planetToElement: Record<string, string> = {
      Sun: 'Fire',
      Moon: 'Water',
      Mercury: 'Air',
      Venus: 'Earth',
      Mars: 'Fire',
      Jupiter: 'Air',
      Saturn: 'Earth',
      Uranus: 'Air',
      Neptune: 'Water',
      Pluto: 'Water'
};

    const element = planetToElement[planet.toLowerCase()] || 'Fire'
    return elements[element as keyof ElementalProperties] || 0.25;
  } catch (error) {
    _logger.error('Error getting recipe planetary influence:', error);
    return 0.25;
  }
}

/**
 * Enhanced astrological matching using cached planetary data
 */
export async function calculateEnhancedAstrologicalMatch()
  recipe: Recipe,
  astrologicalSign: string,
  cachedData: unknown,
): Promise<number> {
  try {
    let score = 0;

    // Use planetary positions for more accurate astrological matching
    if ((cachedData as any)?.planetaryPositions) {
      const planetaryInfluences = Object.entries((cachedData as any).planetaryPositions);
      for (const [planet, position] of planetaryInfluences) {
        const planetInfluence = getRecipePlanetaryInfluence(recipe, planet);
        if (planetInfluence > 0) {
          // Calculate simple planetary alignment score based on position
          const alignmentScore = Math.cos((Number(position) * Math.PI) / 180) * 0.5 + 0.5;
          score += planetInfluence * alignmentScore * 0.1;
        }
      }
    }

    return Math.min(1, score);
  } catch (error) {
    _logger.error('Error calculating enhanced astrological match:', error);
    return 0.5;
  }
}

/**
 * Calculate monica constant compatibility for cooking transformation potential
 */
export async function calculateMonicaCompatibility()
  recipe: Recipe,
  monicaConstant: number,
): Promise<number> {
  if (isNaN(monicaConstant) || !isFinite(monicaConstant) {
    return 0.5; // Default compatibility
  }

  try {
    // Recipes with transformation-heavy cooking methods benefit from higher monica values
    const transformationMethods = ['fermentation', 'curing', 'smoking', 'aging', 'reduction'];
    const cookingMethods = await getRecipeCookingMethods(recipe);
    const cookingMethodStr = cookingMethods.join(' ').toLowerCase();

    const isTransformational = transformationMethods.some(method =>)
      cookingMethodStr.includes(method),
    );

    if (isTransformational) {
      // Higher monica values indicate better transformation potential
      return Math.min(1, Math.abs(monicaConstant) / 10); // Normalize monica to 0-1 range
    } else {
      // For simple cooking methods, moderate monica values are better
      const normalizedMonica = Math.abs(monicaConstant);
      return Math.max(0.1, 1 - Math.abs(normalizedMonica - 5) / 10);
    }
  } catch (error) {
    _logger.error('Error calculating monica compatibility:', error);
    return 0.5;
  }
}

// ===== HELPER FUNCTIONS =====

/**
 * Connect ingredients to mappings
 */
export async function connectIngredientsToMappings()
  recipe: Recipe,
): Promise<{ name: string; matchedTo?, IngredientMapping; confidence, number }[] | undefined> {
  if (!isNonEmptyArray(recipe.ingredients) {
    return undefined;
  }

  try {
    return await Promise.all()
      recipe.ingredients
        .filter(ingredient => typeof ingredient === 'object' && ingredient.name)
        .map(async ingredient => {
          const ingredientName = ingredient.name;

          // For now, return basic ingredient data
          // In a full implementation, this would connect to ingredient mapping database
          return {
            name: ingredientName,
            confidence: 0.5
},
        }),
    );
  } catch (error) {
    _logger.error('Error connecting ingredients to mappings:', error);
    return undefined;
  }
}

// ===== UTILITY FUNCTIONS =====

/**
 * Get string similarity
 */
function getStringSimilarity(str1: string, str2: string): number {
  const normalizedStr1 = str1.toLowerCase();
  const normalizedStr2 = str2.toLowerCase();

  if (normalizedStr1 === normalizedStr2) return 1;
  if (normalizedStr1.includes(normalizedStr2) || normalizedStr2.includes(normalizedStr1) {
    return 0.8;
  }

  // Calculate Levenshtein distance for more complex comparisons
  const distance = simplifiedLevenshtein(normalizedStr1, normalizedStr2);
  const maxLength = Math.max(normalizedStr1.length, normalizedStr2.length);

  if (maxLength === 0) return 1;
  return 1 - distance / maxLength;
}

/**
 * Simplified Levenshtein distance calculation
 */
function simplifiedLevenshtein(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;

  // Create a matrix of size (m+1) x (n+1)
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  // Initialize the matrix
  for (let i = 0; i <= m; i++) {
    dp[i][0] = i;
  }

  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  // Fill the matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] =
          1 +
          Math.min()
            dp[i - 1][j], // deletion
            dp[i][j - 1], // insertion
            dp[i - 1][j - 1], // substitution
          );
      }
    }
  }

  return dp[m][n];
}

/**
 * Determine ingredient modality
 */
export function determineIngredientModality(qualities: string[] = []): string {
  // Default to balanced if no qualities are provided
  if (!isNonEmptyArray(qualities) {
    return 'Balanced';
  }

  // Count occurrences of modality indicators
  const modalityCounts = { Cardinal: 0, Fixed: 0, Mutable: 0 };

  // Keywords associated with each modality
  const cardinalKeywords = ['spicy', 'intense', 'strong', 'bold', 'powerful', 'energetic'];
  const fixedKeywords = ['stable', 'consistent', 'grounding', 'substantial', 'solid', 'dense'];
  const mutableKeywords = ['adaptable', 'flexible', 'light', 'versatile', 'varied', 'changing'];

  // Analyze qualities
  qualities.forEach(quality => {
    const q = quality.toLowerCase();

    if (cardinalKeywords.some(kw => q.includes(kw)) {
      modalityCounts.Cardinal++;
    }

    if (fixedKeywords.some(kw => q.includes(kw)) {
      modalityCounts.Fixed++;
    }

    if (mutableKeywords.some(kw => q.includes(kw)) {
      modalityCounts.Mutable++;
    }
  });

  // Find dominant modality
  let dominantModality = 'Balanced';
  let maxCount = 0;

  Object.entries(modalityCounts).forEach(([modality, count]) => {
    if (count > maxCount) {
      dominantModality = modality;
      maxCount = count;
    }
  });

  return dominantModality;
}

/**
 * Calculate modality score
 */
export function calculateModalityScore(recipeModality: string, userModality: string): number {
  if (!recipeModality || !userModality) {
    return 0.5; // Default score when information is missing
  }

  // Direct match
  if (recipeModality.toLowerCase() === userModality.toLowerCase() {
    return 1.0;
  }

  // 'Balanced' has some compatibility with all modalities
  if (recipeModality === 'Balanced' || userModality === 'Balanced') {
    return 0.7;
  }

  // Different modalities have different compatibility levels
  const compatibilityMatrix: Record<string, Record<string, number>> = {
    Cardinal: { Fixed: 0.4, Mutable: 0.6 },
    Fixed: { Cardinal: 0.4, Mutable: 0.5 },
    Mutable: { Cardinal: 0.6, Fixed: 0.5 }
};

  return compatibilityMatrix[recipeModality]?.[userModality] || 0.3;
}
