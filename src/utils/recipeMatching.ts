import type {
  Recipe,
  ElementalProperties,
  AstrologicalState,
  Season,
  IngredientMapping,
} from "@/types/alchemy";
import { elementalUtils } from './elementalUtils';
import { ingredients } from '@/data/ingredients';
import { calculateMatchScore } from './ElementalCalculator';
import { getRecipes } from '@/services/LocalRecipeService';

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
  servings?: number;
  excludeIngredients?: string[];
  cookingMethods?: string[];
  nutritionalGoals?: Record<string, unknown>;
  astrologicalSign?: string;
  mealType?: string;
  preferHigherContrast?: boolean;
}

// Default elemental properties for calculations
export let DEFAULT_ELEMENTAL_PROPERTIES = {
  Fire: 0.25,
  Water: 0.25,
  Air: 0.25,
  Earth: 0.25,
};

// Cache for recipe matches to improve performance
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

let matchCache = new Map<string, CacheEntry<MatchResult[]>>();
let CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

// Define Modality type
type Modality = 'cardinal' | 'fixed' | 'mutable';

/**
 * Find the best recipe matches based on the given parameters
 */
export function findBestMatches(
  recipes?: Recipe[],
  matchFilters: MatchFilters = {},
  currentEnergy: ElementalProperties | null = null,
  limit = 10
): MatchResult[] {
  // console.log(`Finding best matches from ${recipes?.length || 0} recipes with filters:`, matchFilters);

  // Generate a cache key based on inputs
  let cacheKey = getCacheKey(recipes, matchFilters, currentEnergy, limit);
  let cachedEntry = matchCache.get(cacheKey);

  // Check if we have a valid cache entry
  if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL) {
    // console.log('Using cached recipe matches');
    return cachedEntry.data;
  }

  // If recipes is null, undefined, or not an array, fetch recipes using LocalRecipeService
  if (!recipes || !Array.isArray(recipes) || recipes.length === 0) {
    try {
      // console.log('No recipes provided, fetching from LocalRecipeService');
      let recipeService = new LocalRecipeService();
      recipes = recipeService.getAllRecipes();
      // console.log(`Fetched ${recipes.length} recipes from LocalRecipeService`);
    } catch (error) {
      // console.error('Error fetching recipes from LocalRecipeService:', error);
      return []; // Return empty array if we can't fetch recipes
    }
  }

  // Clone recipes to avoid modifying the original array
  let filteredRecipes = [...recipes];

  // Apply filters
  if (matchFilters?.maxCookingTime) {
    filteredRecipes = filteredRecipes.filter(
      (recipe) =>
        !recipe.cookingTime || recipe.cookingTime <= matchFilters.maxCookingTime
    );
    // console.log(`After maxCookingTime filter: ${filteredRecipes.length} recipes remain`);
  }

  if (
    matchFilters?.dietaryRestrictions &&
    matchFilters.dietaryRestrictions.length > 0
  ) {
    filteredRecipes = filteredRecipes.filter((recipe) => {
      if (!recipe.dietaryTags) return true; // Keep recipes without tags

      // Check if any of the restrictions are in the recipe's dietary tags
      let hasRestrictedTag = matchFilters.dietaryRestrictions.some(
        (restriction) => recipe.dietaryTags.includes(restriction)
      );

      // If recipe has the restricted tag, exclude it
      return !hasRestrictedTag;
    });
    // console.log(`After dietaryRestrictions filter: ${filteredRecipes.length} recipes remain`);
  }

  if (matchFilters?.season) {
    // Prioritize seasonal recipes but don't completely exclude off-season ones
    filteredRecipes = filteredRecipes.sort((a, b) => {
      let aIsInSeason =
        a.season === matchFilters.season || a.season === 'all';
      let bIsInSeason =
        b.season === matchFilters.season || b.season === 'all';

      if (aIsInSeason && !bIsInSeason) return -1;
      if (!aIsInSeason && bIsInSeason) return 1;
      return 0;
    });
    // console.log(`After season sorting (${matchFilters.season}): prioritized seasonal recipes`);
  }

  if (matchFilters?.servings) {
    // Filter for recipes that serve at least the required number
    filteredRecipes = filteredRecipes.filter(
      (recipe) => !recipe.servings || recipe.servings >= matchFilters.servings
    );
    // console.log(`After servings filter: ${filteredRecipes.length} recipes remain`);
  }

  if (
    matchFilters?.excludeIngredients &&
    matchFilters.excludeIngredients.length > 0
  ) {
    filteredRecipes = filteredRecipes.filter((recipe) => {
      if (!recipe.ingredients) return true;

      // Check if any of the excluded ingredients are in the recipe
      let hasExcludedIngredient = matchFilters.excludeIngredients.some(
        (excluded) => {
          const lowerExcluded = excluded.toLowerCase();
          return recipe.ingredients.some((ingredient) =>
            typeof ingredient === 'string'
              ? ingredient.toLowerCase().includes(lowerExcluded)
              : ingredient.name?.toLowerCase().includes(lowerExcluded)
          );
        }
      );

      // If recipe has excluded ingredient, filter it out
      return !hasExcludedIngredient;
    });
    // console.log(`After excludeIngredients filter: ${filteredRecipes.length} recipes remain`);
  }

  if (matchFilters?.cookingMethods && matchFilters.cookingMethods.length > 0) {
    // Prioritize recipes that use preferred cooking methods
    filteredRecipes = filteredRecipes.sort((a, b) => {
      let aUsesMethod =
        a.cookingMethods?.some((method) =>
          matchFilters.cookingMethods.includes(method)
        ) || false;

      let bUsesMethod =
        b.cookingMethods?.some((method) =>
          matchFilters.cookingMethods.includes(method)
        ) || false;

      if (aUsesMethod && !bUsesMethod) return -1;
      if (!aUsesMethod && bUsesMethod) return 1;
      return 0;
    });
    // console.log(`After cookingMethods sorting: prioritized recipes with preferred methods`);
  }

  // If no recipes passed the filtering, return empty array
  if (filteredRecipes.length === 0) {
    // console.log('No recipes passed all filters');
    return [];
  }

  // Calculate scores for each recipe
  let scoredRecipes = filteredRecipes.map((recipe) => {
    let score = 0;
    let reasons = [];

    // If we have elemental info and current energy, calculate elemental match
    if (recipe.elementalProperties && currentEnergy) {
      let elementalScore = calculateMatchScore(
        recipe.elementalProperties,
        currentEnergy,
        {
          season: matchFilters.season,
          mealType: recipe.mealType || matchFilters.mealType,
          cuisine: recipe.cuisine,
          preferHigherContrast: matchFilters.preferHigherContrast,
        }
      );

      // Weight elemental score at 70% of total
      score += elementalScore * 0.7;

      // Add reason based on score
      if (elementalScore > 0.8) {
        reasons.push('Excellent elemental balance match');
      } else if (elementalScore > 0.6) {
        reasons.push('Good elemental balance match');
      } else if (elementalScore > 0.4) {
        reasons.push('Moderate elemental balance match');
      }
    }

    // Nutritional profile match (15% weight)
    if (recipe.nutritionalProfile && matchFilters.nutritionalGoals) {
      let nutritionalMatch = calculateNutritionalMatch(
        recipe.nutritionalProfile,
        matchFilters.nutritionalGoals
      );
      score += nutritionalMatch * 0.15;

      if (nutritionalMatch > 0.7) {
        reasons.push('Supports your nutritional goals');
      }
    }

    // Astrological influence match (10% weight if applicable)
    if (recipe.astrologicalInfluence && matchFilters.astrologicalSign) {
      let astroMatch = calculateAstrologicalMatch(
        recipe.astrologicalInfluence,
        matchFilters.astrologicalSign
      );
      score += astroMatch * 0.1;

      if (astroMatch > 0.7) {
        reasons.push('Astrologically aligned');
      }
    }

    // Complexity matching (10% weight)
    if (
      recipe.complexity !== undefined &&
      matchFilters.preferredComplexity !== undefined
    ) {
      let complexityScore = calculateComplexityMatch(
        recipe.complexity,
        matchFilters.preferredComplexity
      );
      score += complexityScore * 0.1;

      if (complexityScore > 0.8) {
        reasons.push('Matches your preferred complexity level');
      }
    }

    // Small random factor (up to 5%) to avoid identical scores
    score += Math.random() * 0.05;

    // Normalize score to be between 0 and 1
    score = Math.min(1, Math.max(0, score));

    // Calculate match percentage (scaled for UI)
    let matchPercentage = Math.round(score * 100);

    return {
      ...recipe,
      matchScore: score,
      matchPercentage,
      matchReasons: reasons,
    };
  });

  // Sort recipes by score (highest first)
  let sortedRecipes = scoredRecipes.sort(
    (a, b) => b.matchScore - a.matchScore
  );

  // Return the top N recipes
  let result = sortedRecipes.slice(0, limit);

  // Cache the result
  matchCache.set(cacheKey, {
    data: result.map((recipe) => ({
      recipe,
      score: recipe.matchScore,
      elements: recipe.elementalProperties || DEFAULT_ELEMENTAL_PROPERTIES,
      dominantElements: calculateDominantElements(
        recipe.elementalProperties || DEFAULT_ELEMENTAL_PROPERTIES
      ),
    })),
    timestamp: Date.now(),
  });

  return result.map((recipe) => ({
    recipe,
    score: recipe.matchScore,
    elements: recipe.elementalProperties || DEFAULT_ELEMENTAL_PROPERTIES,
    dominantElements: calculateDominantElements(
      recipe.elementalProperties || DEFAULT_ELEMENTAL_PROPERTIES
    ),
  }));
}

let calculateBaseElements = (recipe: Recipe): ElementalProperties => {
  let elements: ElementalProperties = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0,
  };

  recipe.ingredients.forEach((ingredient) => {
    let baseProps =
      ingredient.elementalProperties || DEFAULT_ELEMENTAL_PROPERTIES;
    let nutrition = ingredient.nutritionalProfile;

    // Calculate nutritional boost
    let nutritionBoost = nutrition
      ? Math.log1p(
          nutrition.calories +
            nutrition.macros.protein * 3 +
            nutrition.macros.fiber * 2
        )
      : 1;

    let boostedProps = {
      Fire: baseProps.Fire * nutritionBoost,
      Water: baseProps.Water * nutritionBoost,
      Earth: baseProps.Earth * nutritionBoost,
      Air: baseProps.Air * nutritionBoost,
    };

    elements = elementalUtils.combineProperties(
      elements,
      boostedProps,
      ingredient.amount / (100 || 1)
    );
  });

  return elementalUtils.normalizeProperties(elements);
};

let calculateEnergyMatch = (
  recipeEnergy: unknown,
  currentEnergy: unknown
) => {
  let score = 0;

  // Check if we're in Aries season
  let isAriesSeason = currentEnergy.zodiacEnergy === 'aries';

  // Zodiac energy match with increased weight for Mars during Aries season
  if (recipeEnergy.zodiac === currentEnergy.zodiacEnergy) {
    // Base zodiac match score
    score += 0.4;

    // If we're in Aries season and the recipe has Mars influence, add bonus
    if (
      isAriesSeason &&
      recipeEnergy.planetary &&
      recipeEnergy.planetary.includes('Mars')
    ) {
      score += 0.2; // Additional bonus for Mars-influenced recipes during Aries season
    }
  }

  // Lunar energy match with increased weight
  if (recipeEnergy.lunar === currentEnergy.lunarEnergy) {
    score += 0.4; // Increased from 0.3
  }

  // Planetary energy match with specific planet bonuses
  if (recipeEnergy.planetary === currentEnergy.planetaryEnergy) {
    score += 0.35; // Increased base planetary match
  }

  // Special handling for specific planets
  if (recipeEnergy.planetary && currentEnergy.planetaryEnergy) {
    // Sun influence bonus
    if (
      recipeEnergy.planetary.includes('Sun') &&
      currentEnergy.planetaryEnergy.includes('Sun')
    ) {
      score += 0.15;
    }

    // Moon influence bonus
    if (
      recipeEnergy.planetary.includes('Moon') &&
      currentEnergy.planetaryEnergy.includes('Moon')
    ) {
      score += 0.15;
    }

    // Mars influence bonus
    if (
      recipeEnergy.planetary.includes('Mars') &&
      currentEnergy.planetaryEnergy.includes('Mars')
    ) {
      // Higher bonus during Aries season
      score += isAriesSeason ? 0.25 : 0.15;
    }
  }

  return Math.min(1.0, score); // Cap at 1.0
};

let calculateDominantElements = (
  elements: ElementalProperties
): [string, number][] => {
  // Filter out any invalid entries to prevent NaN issues
  return Object.entries(elements)
    .filter(([, value]) => !isNaN(value) && value !== undefined)
    .sort(([, a], [, b]) => (b || 0) - (a || 0))
    .slice(0, 2)
    .map(([element, value]) => [element, value || 0]);
};

function calculateRecipeEnergyMatch(
  recipe: Recipe,
  currentEnergy: AstrologicalState
): number {
  // Base score starts at 0.5 (neutral match)
  let score = 0.5;

  // Get dominant elements for the recipe
  let recipeElements = calculateBaseElements(recipe);
  let recipeDominantElements = calculateDominantElements(recipeElements);

  // Use dominant elements for enhanced scoring if available
  if (recipeDominantElements.length > 0) {
    const [primaryElement, primaryValue] = recipeDominantElements[0];
    if (primaryValue > 0.4) {
      // Boost score for recipes with strong dominant element
      score += 0.1;
    }
  }

  // 1. Calculate elemental score (35% of total) - now with double impact
  let elementalScore = calculateElementalAlignment(recipe, currentEnergy);
  score += elementalScore * 0.7; // Doubled from 0.35

  // 2. Calculate modality score - use qualities array even if preferredModality doesn't exist
  let qualities = recipe.qualities || [];
  // Check if preferredModality exists in currentEnergy, if not skip this boost
  if (currentEnergy.preferredModality) {
    let modalityScore = calculateModalityScore(
      qualities,
      currentEnergy.preferredModality
    );
    score += modalityScore * 0.5; // Doubled from 0.25
  }

  // 3. Calculate astrological score - check if astrologicalEnergy exists
  if (recipe.astrologicalEnergy) {
    let astrologicalScore = calculateEnergyMatch(
      recipe.astrologicalEnergy,
      currentEnergy
    );
    score += astrologicalScore * 0.4; // Doubled from 0.2
  }

  // 4. Calculate seasonal score - check if season exists
  if (recipe.season && currentEnergy.season) {
    let seasonalScore = recipe.season.includes(currentEnergy.season)
      ? 1.0
      : 0.0;
    score += seasonalScore * 0.2; // Doubled from 0.1
  }

  // 5. Calculate nutritional alignment
  let nutritionalScore = calculateNutritionalAlignment(recipe, currentEnergy);
  score += nutritionalScore * 0.2; // Doubled from 0.1

  // Normalize the final score to ensure it stays in 0-1 range despite doubled factors
  return Math.min(1, Math.max(0, score));
}

function calculateElementalAlignment(
  recipe: Recipe,
  currentEnergy: AstrologicalState
): number {
  // Get recipe elemental properties
  let recipeElements = calculateBaseElements(recipe);

  // Get current astrological elemental properties
  let currentElements =
    currentEnergy.elementalProperties || DEFAULT_ELEMENTAL_PROPERTIES;

  // Calculate weighted similarity between the two elemental profiles
  let similarity = 0;
  let totalWeight = 0;

  // Identify dominant elements in current energy
  let dominantElements = Object.entries(currentElements)
    .filter(([, value]) => value !== undefined && !isNaN(value as number)) // Add filter to prevent NaN
    .sort(([, a], [, b]) => ((b as number) || 0) - ((a as number) || 0)) // Add fallback to 0
    .slice(0, 2)
    .map(([element]) => element);

  // Weight importance of elements based on dominance
  Object.entries(currentElements).forEach(([element, value]) => {
    // Skip invalid values
    if (value === undefined || isNaN(value as number)) return;

    let weight = dominantElements.includes(element) ? 1.5 : 1.0;
    let recipeValue =
      recipeElements[element as keyof ElementalProperties] || 0;
    let currentValue = (value as number) || 0;
    let diff = Math.abs(recipeValue - currentValue);

    // Convert difference to similarity (0-1 scale), with exponential scaling for better differentiation
    let elementSimilarity = Math.pow(1 - diff, 1.5);

    similarity += elementSimilarity * weight;
    totalWeight += weight;
  });

  // Normalize the similarity score - ensure we never divide by zero
  return totalWeight > 0 ? similarity / (totalWeight || 1) : 0.5;
}

// New function to calculate nutritional alignment
function calculateNutritionalAlignment(
  recipe: Recipe,
  currentEnergy: AstrologicalState
): number {
  // If there are no nutritional needs or recipe ingredients, return a neutral score
  if (!recipe.ingredients || !currentEnergy.nutritionalNeeds) {
    return 0.5;
  }

  let score = 0.5; // Start with neutral score
  let factorsCount = 0;

  // Adjust based on predefined nutritional needs
  if (
    currentEnergy.nutritionalNeeds &&
    currentEnergy.nutritionalNeeds.highProtein &&
    hasHighProtein(recipe)
  ) {
    score += 0.2;
    factorsCount++;
  }

  if (
    currentEnergy.nutritionalNeeds &&
    currentEnergy.nutritionalNeeds.lowCarb &&
    hasLowCarb(recipe)
  ) {
    score += 0.2;
    factorsCount++;
  }

  if (
    currentEnergy.nutritionalNeeds &&
    currentEnergy.nutritionalNeeds.highFiber &&
    hasHighFiber(recipe)
  ) {
    score += 0.2;
    factorsCount++;
  }

  if (
    currentEnergy.nutritionalNeeds &&
    currentEnergy.nutritionalNeeds.lowFat &&
    hasLowFat(recipe)
  ) {
    score += 0.2;
    factorsCount++;
  }

  // If no specific factors were found, return the base score
  if (factorsCount === 0) {
    return score;
  }

  // Calculate weighted average based on number of factors
  return Math.min(1.0, score + 0.1 * factorsCount);
}

// Helper functions for nutritional evaluation
function hasHighProtein(recipe: Recipe): boolean {
  return recipe.ingredients.some(
    (ingredient) => ingredient.nutritionalProfile?.macros.protein > 15
  );
}

function hasLowCarb(recipe: Recipe): boolean {
  let totalCarbs = recipe.ingredients.reduce(
    (sum, ingredient) =>
      sum + (ingredient.nutritionalProfile?.macros.carbs || 0),
    0
  );
  return totalCarbs < 30;
}

function hasHighFiber(recipe: Recipe): boolean {
  return recipe.ingredients.some(
    (ingredient) => ingredient.nutritionalProfile?.macros.fiber > 5
  );
}

function hasLowFat(recipe: Recipe): boolean {
  let totalFat = recipe.ingredients.reduce(
    (sum, ingredient) => sum + (ingredient.nutritionalProfile?.macros.fat || 0),
    0
  );
  return totalFat < 15;
}

// Helper function to calculate modality score
function calculateModalityScore(
  qualities: string[],
  preferredModality?: 'cardinal' | 'fixed' | 'mutable'
): number {
  if (!preferredModality || !qualities || qualities.length === 0) {
    return 0.5; // Neutral score if no modality preference or recipe qualities
  }

  // Determine the recipe's modality based on its qualities
  let recipeModality = determineIngredientModality(qualities);

  if (!recipeModality) {
    return 0.5; // Neutral score if can't determine recipe modality
  }

  if (recipeModality === preferredModality) {
    return 1.0; // Full match
  } else {
    // Partial match - some modalities are more compatible than others
    // Cardinal and fixed = 0.6, Cardinal and mutable = 0.7, Fixed and mutable = 0.5
    if (
      (recipeModality === 'cardinal' && preferredModality === 'fixed') ||
      (recipeModality === 'fixed' && preferredModality === 'cardinal')
    ) {
      return 0.6;
    } else if (
      (recipeModality === 'cardinal' && preferredModality === 'mutable') ||
      (recipeModality === 'mutable' && preferredModality === 'cardinal')
    ) {
      return 0.7;
    } else if (
      (recipeModality === 'fixed' && preferredModality === 'mutable') ||
      (recipeModality === 'mutable' && preferredModality === 'fixed')
    ) {
      return 0.5;
    }
  }

  return 0.5; // Default fallback
}

// External function to determine modality - might be in another file, placeholder here
function determineIngredientModality(
  qualities: string[]
): 'cardinal' | 'fixed' | 'mutable' | null {
  // Count occurrences of each modality in qualities
  let counts = { cardinal: 0, fixed: 0, mutable: 0 };

  // Keywords associated with each modality
  let modalityKeywords = {
    cardinal: [
      'initiative',
      'leadership',
      'action',
      'dynamic',
      'pioneering',
      'assertive',
      'cardinal',
    ],
    fixed: [
      'stability',
      'persistence',
      'endurance',
      'steady',
      'reliable',
      'stubborn',
      'fixed',
    ],
    mutable: [
      'flexible',
      'adaptable',
      'versatile',
      'changeable',
      'communicative',
      'mutable',
    ],
  };

  // Check each quality for modality keywords
  qualities.forEach((quality) => {
    let lowerQuality = quality.toLowerCase();

    // Check for cardinal keywords
    if (
      modalityKeywords.cardinal.some((keyword) =>
        lowerQuality.includes(keyword)
      )
    ) {
      counts.cardinal++;
    }

    // Check for fixed keywords
    if (
      modalityKeywords.fixed.some((keyword) => lowerQuality.includes(keyword))
    ) {
      counts.fixed++;
    }

    // Check for mutable keywords
    if (
      modalityKeywords.mutable.some((keyword) => lowerQuality.includes(keyword))
    ) {
      counts.mutable++;
    }
  });

  // Find the dominant modality
  let entries = Object.entries(counts) as [
    'cardinal' | 'fixed' | 'mutable',
    number
  ][];

  // Sort by count in descending order
  let sorted = entries.sort((a, b) => b[1] - a[1]);

  // Return the dominant modality if it has any count, otherwise null
  return sorted[0][1] > 0 ? sorted[0][0] : null;
}

// Create an astrologyUtils object with the necessary functions
export let astrologyUtils = {
  getPlanetaryElement(planet: string): string {
    const planetElements: Record<string, string> = {
      Sun: 'Fire',
      Moon: 'Water',
      Mercury: 'Air',
      Venus: 'Earth',
      Mars: 'Fire',
      Jupiter: 'Air',
      Saturn: 'Earth',
      Uranus: 'Air',
      Neptune: 'Water',
      Pluto: 'Water',
    };
    return planetElements[planet] || 'Neutral';
  },

  getZodiacElement(sign: string): string {
    const zodiacElements: Record<string, string> = {
      Aries: 'Fire',
      Leo: 'Fire',
      Sagittarius: 'Fire',
      Taurus: 'Earth',
      Virgo: 'Earth',
      Capricorn: 'Earth',
      Gemini: 'Air',
      Libra: 'Air',
      Aquarius: 'Air',
      Cancer: 'Water',
      Scorpio: 'Water',
      Pisces: 'Water',
    };
    return zodiacElements[sign] || 'Neutral';
  },
};

/**
 * Generate a unique cache key based on function inputs
 */
function getCacheKey(
  recipes: Recipe[] | undefined,
  filters: MatchFilters,
  energy: ElementalProperties | null,
  limit: number
): string {
  // Create a simplified representation of recipes (just ids to avoid huge keys)
  let recipeIds =
    recipes?.map((r) => r.id || `${r.name}-${r.cuisine}`).join(',') || 'none';

  // Stringify the filters and energy objects
  let filtersStr = JSON.stringify(filters);
  let energyStr = energy ? JSON.stringify(energy) : 'null';

  // Combine all into a single key
  return `${recipeIds}|${filtersStr}|${energyStr}|${limit}`;
}

/**
 * Clear the match cache or remove expired entries
 */
export function clearMatchCache(all = false): void {
  if (all) {
    matchCache.clear();
    return;
  }

  // Remove only expired entries
  let now = Date.now();
  for (const [key, entry] of matchCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      matchCache.delete(key);
    }
  }
}

/**
 * Calculate a more accurate string similarity score using Levenshtein distance
 * and additional heuristics for food ingredient matching
 */
function getStringSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;

  // Normalize strings
  let s1 = str1.toLowerCase().trim();
  let s2 = str2.toLowerCase().trim();

  // Exact match
  if (s1 === s2) return 1;

  // Check if one is contained in the other
  if (s1.includes(s2) || s2.includes(s1)) {
    let longerStr = s1.length > s2.length ? s1 : s2;
    let shorterStr = s1.length > s2.length ? s2 : s1;
    // The shorter the gap between lengths, the higher the score
    return 0.8 + (shorterStr.length / (longerStr || 1).length) * 0.2;
  }

  // Calculate Levenshtein distance
  let len1 = s1.length;
  let len2 = s2.length;
  let maxLen = Math.max(len1, len2);

  // Use simplified Levenshtein if strings are very long
  if (maxLen > 20) {
    return simplifiedLevenshtein(s1, s2);
  }

  // Use full Levenshtein for better accuracy with shorter strings
  let distance = levenshteinDistance(s1, s2);
  let similarity = 1 - distance / (maxLen || 1);

  // Boost score if words share the same first few characters
  // (common in food ingredients where prefixes matter)
  let prefixLength = Math.min(4, Math.min(s1.length, s2.length));
  if (s1.substring(0, prefixLength) === s2.substring(0, prefixLength)) {
    similarity += 0.1; // Boost for matching prefix
  }

  // Cap at 1.0
  return Math.min(similarity, 1.0);
}

/**
 * Simplified Levenshtein implementation for longer strings
 */
function simplifiedLevenshtein(str1: string, str2: string): number {
  let maxLen = Math.max(str1.length, str2.length);
  let distance = 0;

  for (let i = 0; i < maxLen; i++) {
    if (!str1[i] || !str2[i] || str1[i] !== str2[i]) {
      distance++;
    }
  }

  return 1 - distance / (maxLen || 1);
}

/**
 * Full Levenshtein distance calculation for accurate similarity
 */
function levenshteinDistance(str1: string, str2: string): number {
  let m = str1.length;
  let n = str2.length;

  // Create matrix
  let matrix = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(null));

  // Fill first row and column
  for (let i = 0; i <= m; i++) matrix[i][0] = i;
  for (let j = 0; j <= n; j++) matrix[0][j] = j;

  // Fill the matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // deletion
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }

  return matrix[m][n];
}

/**
 * Connects recipe ingredients to their mappings in the ingredient data files
 * Provides a confidence score for each match with improved matching algorithm
 */
export let connectIngredientsToMappings = (
  recipe: Recipe
): {
  name: string;
  matchedTo?: IngredientMapping;
  confidence: number;
}[] => {
  if (!recipe.ingredients || recipe.ingredients.length === 0) {
    return [];
  }

  // SSR check - only use localStorage in browser environment
  let isBrowser = typeof window !== 'undefined';

  // Create a cache key for this recipe's ingredients
  let cacheKey = `ingredient-mapping-${recipe.id || recipe.name}`;
  let cached: string | null = null;

  // Try to get from localStorage, with proper error handling
  if (isBrowser) {
    try {
      cached = window.localStorage.getItem(cacheKey);
    } catch (e) {
      // console.debug('localStorage not available:', e);
    }
  }

  // Check for cached results
  if (cached) {
    try {
      let parsedCache = JSON.parse(cached);
      // Verify the cache is still valid (ingredients haven't changed)
      if (
        parsedCache.timestamp &&
        Date.now() - parsedCache.timestamp < 3600000 && // 1 hour cache
        parsedCache.ingredientCount === recipe.ingredients.length
      ) {
        return parsedCache.matches;
      }
    } catch (e) {
      // console.error('Error parsing ingredient mapping cache:', e);
    }
  }

  let matches = recipe.ingredients.map((recipeIngredient) => {
    // Initial result with no match
    const result = {
      name: recipeIngredient.name,
      matchedTo: undefined,
      confidence: 0,
    };

    // 1. Try exact match first
    let exactMatch = ingredientsMap[recipeIngredient.name.toLowerCase()];
    if (exactMatch) {
      result.matchedTo = exactMatch as IngredientMapping;
      result.confidence = 1.0;
      return result;
    }

    // 2. Try matching by name parts (for compound ingredients)
    let nameParts = recipeIngredient.name.toLowerCase().split(/\s+/);
    for (const part of nameParts) {
      if (part.length < 3) continue; // Skip short parts like "of", "and", etc.

      let partMatch = ingredientsMap[part];
      if (partMatch) {
        result.matchedTo = partMatch as IngredientMapping;
        result.confidence = 0.8;
        return result;
      }
    }

    // 3. Try fuzzy matching against all ingredient names
    // Only do this for ingredients that didn't match exactly
    let bestMatch = {
      ingredient: null as IngredientMapping | null,
      similarity: 0.4,
    };

    for (const [key, ingredient] of Object.entries(ingredientsMap)) {
      // Skip very short keys to avoid false positives
      if (key.length < 3) continue;

      // Check if the ingredient matches the category
      let categoryMatch =
        recipeIngredient.category &&
        ingredient.category === recipeIngredient.category
          ? 0.2
          : 0;

      // Calculate string similarity
      let similarity =
        getStringSimilarity(recipeIngredient.name, key) + categoryMatch;

      if (similarity > bestMatch.similarity) {
        bestMatch = {
          similarity,
          ingredient: ingredient as unknown as IngredientMapping,
        };
      }
    }

    if (bestMatch.ingredient && bestMatch.similarity > 0.4) {
      result.matchedTo = bestMatch.ingredient;
      result.confidence = bestMatch.similarity;
      return result;
    }

    // 4. Try matching with swaps if provided
    if (recipeIngredient.swaps && recipeIngredient.swaps.length > 0) {
      for (const swap of recipeIngredient.swaps) {
        let swapMatch = ingredientsMap[swap.toLowerCase()];
        if (swapMatch) {
          result.matchedTo = swapMatch as IngredientMapping;
          result.confidence = 0.7;
          return result;
        }
      }
    }

    return result;
  });

  // Cache the results
  if (isBrowser) {
    try {
      window.localStorage.setItem(
        cacheKey,
        JSON.stringify({
          matches,
          timestamp: Date.now(),
          ingredientCount: recipe.ingredients.length,
        })
      );
    } catch (e) {
      // console.error('Error caching ingredient mappings:', e);
    }
  }

  return matches;
};

/**
 * Calculate how well a recipe's nutritional profile matches the user's goals
 */
function calculateNutritionalMatch(
  recipeProfile: Record<string, number | string>,
  userGoals: Record<string, number | string>
): number {
  if (!recipeProfile || !userGoals) return 0.5; // Neutral score if either is missing

  let matchScore = 0;
  let factorsCount = 0;

  // Common nutritional factors to compare
  let factors = [
    'protein',
    'carbs',
    'fat',
    'fiber',
    'calories',
    'vitamins',
    'minerals',
    'antioxidants',
  ];

  // Calculate match for each factor that exists in both profiles
  factors.forEach((factor) => {
    if (
      recipeProfile[factor] !== undefined &&
      userGoals[factor] !== undefined
    ) {
      // For 'low' goals (e.g., 'low carbs'), a lower value is better
      if (userGoals[factor] === 'low') {
        // Scale from 0-1 where 0 is high and 1 is low
        let recipeValue =
          typeof recipeProfile[factor] === 'number'
            ? (recipeProfile[factor] as number)
            : parseFloat(recipeProfile[factor] as string) || 5;

        let normalizedValue = 1 - Math.min(recipeValue / (5 || 1), 1);
        matchScore += normalizedValue;
      }
      // For 'high' goals (e.g., 'high protein'), a higher value is better
      else if (userGoals[factor] === 'high') {
        // Scale from 0-1 where 1 is high and 0 is low
        let recipeValue =
          typeof recipeProfile[factor] === 'number'
            ? (recipeProfile[factor] as number)
            : parseFloat(recipeProfile[factor] as string) || 0;

        let normalizedValue = Math.min(recipeValue / (5 || 1), 1);
        matchScore += normalizedValue;
      }
      // For exact targets (e.g., specific calorie count)
      else if (
        typeof userGoals[factor] === 'number' ||
        !isNaN(Number(userGoals[factor]))
      ) {
        let goalValue =
          typeof userGoals[factor] === 'number'
            ? (userGoals[factor] as number)
            : parseFloat(userGoals[factor] as string);

        let recipeValue =
          typeof recipeProfile[factor] === 'number'
            ? (recipeProfile[factor] as number)
            : parseFloat(recipeProfile[factor] as string);

        if (!isNaN(goalValue) && !isNaN(recipeValue)) {
          // Calculate how close the recipe is to the target (1 = exact match)
          let proximity =
            1 -
            Math.min(
              Math.abs(recipeValue - goalValue) / (Math.max(goalValue || 1), 1),
              1
            );
          matchScore += proximity;
        }
      }

      factorsCount++;
    }
  });

  // Calculate average match across all factors
  return factorsCount > 0 ? matchScore / (factorsCount || 1) : 0.5;
}

/**
 * Calculate how well a recipe aligns with the user's astrological sign
 */
function calculateAstrologicalMatch(
  recipeInfluence: unknown,
  userSign: string
): number {
  if (!recipeInfluence || !userSign) return 0.5; // Default to neutral if no data

  // Define astrological compatibility between signs and elements
  const signElementMap: Record<string, string> = {
    aries: 'fire',
    taurus: 'earth',
    gemini: 'air',
    cancer: 'water',
    leo: 'fire',
    virgo: 'earth',
    libra: 'air',
    scorpio: 'water',
    sagittarius: 'fire',
    capricorn: 'earth',
    aquarius: 'air',
    pisces: 'water',
  };

  // Define elemental compatibility relationships
  // This is more nuanced - some elements enhance each other
  const elementCompatibility: Record<string, Record<string, number>> = {
    fire: { fire: 0.8, air: 0.9, earth: 0.5, water: 0.3 },
    earth: { earth: 0.8, water: 0.9, fire: 0.5, air: 0.3 },
    air: { air: 0.8, fire: 0.9, water: 0.5, earth: 0.3 },
    water: { water: 0.8, earth: 0.9, air: 0.5, fire: 0.3 },
  };

  // Define sign compatibility based on traditional astrology
  const signCompatibility: Record<string, Record<string, number>> = {
    // Fire signs
    aries: {
      aries: 0.8,
      leo: 0.9,
      sagittarius: 0.9, // Fire signs (good)
      gemini: 0.8,
      libra: 0.7,
      aquarius: 0.8, // Air signs (good)
      taurus: 0.4,
      virgo: 0.5,
      capricorn: 0.5, // Earth signs (challenging)
      cancer: 0.5,
      scorpio: 0.6,
      pisces: 0.4, // Water signs (challenging)
    },
    leo: {
      aries: 0.9,
      leo: 0.8,
      sagittarius: 0.9,
      gemini: 0.8,
      libra: 0.9,
      aquarius: 0.7,
      taurus: 0.6,
      virgo: 0.5,
      capricorn: 0.4,
      cancer: 0.5,
      scorpio: 0.5,
      pisces: 0.4,
    },
    sagittarius: {
      aries: 0.9,
      leo: 0.9,
      sagittarius: 0.8,
      gemini: 0.8,
      libra: 0.8,
      aquarius: 0.9,
      taurus: 0.4,
      virgo: 0.5,
      capricorn: 0.6,
      cancer: 0.4,
      scorpio: 0.5,
      pisces: 0.6,
    },
    // Earth signs
    taurus: {
      taurus: 0.8,
      virgo: 0.9,
      capricorn: 0.9,
      cancer: 0.8,
      scorpio: 0.9,
      pisces: 0.7,
      aries: 0.4,
      leo: 0.6,
      sagittarius: 0.4,
      gemini: 0.4,
      libra: 0.6,
      aquarius: 0.3,
    },
    virgo: {
      taurus: 0.9,
      virgo: 0.8,
      capricorn: 0.9,
      cancer: 0.7,
      scorpio: 0.8,
      pisces: 0.6,
      aries: 0.5,
      leo: 0.5,
      sagittarius: 0.5,
      gemini: 0.6,
      libra: 0.5,
      aquarius: 0.5,
    },
    capricorn: {
      taurus: 0.9,
      virgo: 0.9,
      capricorn: 0.8,
      cancer: 0.7,
      scorpio: 0.8,
      pisces: 0.7,
      aries: 0.5,
      leo: 0.4,
      sagittarius: 0.6,
      gemini: 0.4,
      libra: 0.5,
      aquarius: 0.6,
    },
    // Air signs
    gemini: {
      gemini: 0.8,
      libra: 0.9,
      aquarius: 0.9,
      aries: 0.8,
      leo: 0.8,
      sagittarius: 0.8,
      cancer: 0.4,
      scorpio: 0.3,
      pisces: 0.5,
      taurus: 0.4,
      virgo: 0.6,
      capricorn: 0.4,
    },
    libra: {
      gemini: 0.9,
      libra: 0.8,
      aquarius: 0.9,
      aries: 0.7,
      leo: 0.9,
      sagittarius: 0.8,
      cancer: 0.5,
      scorpio: 0.6,
      pisces: 0.5,
      taurus: 0.6,
      virgo: 0.5,
      capricorn: 0.5,
    },
    aquarius: {
      gemini: 0.9,
      libra: 0.9,
      aquarius: 0.8,
      aries: 0.8,
      leo: 0.7,
      sagittarius: 0.9,
      cancer: 0.4,
      scorpio: 0.4,
      pisces: 0.5,
      taurus: 0.3,
      virgo: 0.5,
      capricorn: 0.6,
    },
    // Water signs
    cancer: {
      cancer: 0.8,
      scorpio: 0.9,
      pisces: 0.9,
      taurus: 0.8,
      virgo: 0.7,
      capricorn: 0.7,
      aries: 0.5,
      leo: 0.5,
      sagittarius: 0.4,
      gemini: 0.4,
      libra: 0.5,
      aquarius: 0.4,
    },
    scorpio: {
      cancer: 0.9,
      scorpio: 0.8,
      pisces: 0.9,
      taurus: 0.9,
      virgo: 0.8,
      capricorn: 0.8,
      aries: 0.6,
      leo: 0.5,
      sagittarius: 0.5,
      gemini: 0.3,
      libra: 0.6,
      aquarius: 0.4,
    },
    pisces: {
      cancer: 0.9,
      scorpio: 0.9,
      pisces: 0.8,
      taurus: 0.7,
      virgo: 0.6,
      capricorn: 0.7,
      aries: 0.4,
      leo: 0.4,
      sagittarius: 0.6,
      gemini: 0.5,
      libra: 0.5,
      aquarius: 0.5,
    },
  };

  let userSignLower = userSign.toLowerCase();
  let userElement = signElementMap[userSignLower];

  if (!userElement) return 0.5; // Default to neutral if sign not recognized

  // If recipe has a specific sign it aligns with
  if (recipeInfluence.sign) {
    let recipeSignLower = recipeInfluence.sign.toLowerCase();

    // Direct sign match is very favorable
    if (recipeSignLower === userSignLower) {
      return 1.0;
    }

    // Check for sign compatibility
    if (signCompatibility[userSignLower]?.[recipeSignLower]) {
      return signCompatibility[userSignLower][recipeSignLower];
    }

    // If no direct sign compatibility, check element compatibility
    let recipeElement = signElementMap[recipeSignLower];
    if (recipeElement && userElement) {
      return elementCompatibility[userElement][recipeElement] || 0.5;
    }
  }

  // If recipe has elemental influences directly
  if (recipeInfluence.elements) {
    // Check if recipe has the user's element
    if (typeof recipeInfluence.elements === 'string') {
      let singleElement = recipeInfluence.elements.toLowerCase();
      return elementCompatibility[userElement][singleElement] || 0.5;
    }

    // If recipe has multiple elements, average their compatibility
    if (Array.isArray(recipeInfluence.elements)) {
      let totalCompatibility = 0;
      recipeInfluence.elements.forEach((element: string) => {
        let elemLower = element.toLowerCase();
        totalCompatibility +=
          elementCompatibility[userElement][elemLower] || 0.5;
      });
      return recipeInfluence.elements.length > 0
        ? totalCompatibility / (recipeInfluence || 1).elements.length
        : 0.5;
    }
  }

  // Consider planetary influences if available
  if (recipeInfluence.planetaryInfluence) {
    // Map planets to elements
    let planetElement = astrologyUtils.getPlanetaryElement(
      recipeInfluence.planetaryInfluence
    );
    if (planetElement) {
      return (
        elementCompatibility[userElement][planetElement.toLowerCase()] || 0.5
      );
    }
  }

  return 0.5; // Default to neutral compatibility
}

/**
 * Calculate how well a recipe's complexity matches user's preferences
 */
function calculateComplexityMatch(
  recipeComplexity: number | string | undefined,
  userPreference: number | string | undefined
): number {
  if (recipeComplexity === undefined || userPreference === undefined) {
    return 0.5; // Neutral score if either value is missing
  }

  // Convert string complexity to number if needed
  let normalizedRecipeComplexity: number;
  if (typeof recipeComplexity === 'string') {
    // Map descriptive terms to values
    switch (recipeComplexity.toLowerCase()) {
      case 'very simple':
      case 'beginner':
        normalizedRecipeComplexity = 1;
        break;
      case 'simple':
      case 'easy':
        normalizedRecipeComplexity = 2;
        break;
      case 'moderate':
      case 'intermediate':
        normalizedRecipeComplexity = 3;
        break;
      case 'complex':
      case 'advanced':
        normalizedRecipeComplexity = 4;
        break;
      case 'very complex':
      case 'expert':
        normalizedRecipeComplexity = 5;
        break;
      default:
        normalizedRecipeComplexity = 3; // Default to moderate if unknown term
    }
  } else {
    normalizedRecipeComplexity = recipeComplexity as number;
  }

  // Normalize recipe complexity to 0-1 scale
  // Assuming recipe complexity is on a 1-5 scale
  let normalizedComplexity = Math.max(
    0,
    Math.min(1, (normalizedRecipeComplexity - 1) / 4)
  );

  // Normalize user preference to 0-1 scale
  let normalizedPreference: number;

  if (typeof userPreference === 'number') {
    normalizedPreference = Math.max(0, Math.min(1, (userPreference - 1) / 4));
  } else if (typeof userPreference === 'string') {
    // Map descriptive terms to values
    switch (userPreference.toLowerCase()) {
      case 'very simple':
      case 'beginner':
        normalizedPreference = 0;
        break;
      case 'simple':
      case 'easy':
        normalizedPreference = 0.25;
        break;
      case 'moderate':
      case 'intermediate':
        normalizedPreference = 0.5;
        break;
      case 'complex':
      case 'advanced':
        normalizedPreference = 0.75;
        break;
      case 'very complex':
      case 'expert':
        normalizedPreference = 1;
        break;
      default:
        normalizedPreference = 0.5; // Default to moderate if unknown term
    }
  } else {
    return 0.5; // Default to neutral if preference format is unknown
  }

  // Calculate proximity (1 = exact match, 0 = farthest possible)
  let proximityScore =
    1 - Math.abs(normalizedComplexity - normalizedPreference);

  // For slight preference to simpler recipes when other factors equal
  // (can be adjusted or removed based on app philosophy)
  let simplicityBonus = (1 - normalizedComplexity) * 0.05;

  return Math.min(proximityScore + simplicityBonus, 1);
}
