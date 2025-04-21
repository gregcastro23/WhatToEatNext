import type { Recipe } from '../types/alchemy';
import { ElementalProperties } from '../types/celestial';
import { Season, ZodiacSign } from '../types/constants';
import { AstrologicalState } from '../types/state';
import { LocalRecipeService } from '../services/LocalRecipeService';

// Helper types
interface MatchResult {
  recipe: Recipe;
  score: number;
  elements: ElementalProperties;
  dominantElements: [string, number][];
}

interface MatchFilters {
  maxCookingTime?: number;
  dietaryRestrictions?: string[];
  season?: Season;
  servings?: number;
  excludeIngredients?: string[];
  cookingMethods?: string[];
  nutritionalGoals?: Record<string, string | number>;
  astrologicalSign?: string;
  mealType?: string;
  preferredComplexity?: number;
  preferHigherContrast?: boolean;
}

// Helper functions
function hasProperty<T extends object, K extends string>(
  obj: T,
  prop: K
): obj is T & Record<K, unknown> {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

function safeNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Calculate elemental score between recipe elements and current elements
 */
function calculateElementalScore(
  recipeElements: Record<string, number>,
  currentElements: Record<string, number>
): number {
  // If either object is empty, return neutral score
  if (
    !recipeElements || 
    !currentElements || 
    Object.keys(recipeElements).length === 0 || 
    Object.keys(currentElements).length === 0
  ) {
    return 0.5;
  }
  
  let totalScore = 0;
  let totalWeight = 0;
  
  // For each element in the recipe, calculate the match score
  Object.entries(recipeElements).forEach(([element, recipeValue]) => {
    const currentValue = currentElements[element] || 0;
    
    // More similar values = higher score
    const similarity = 1 - Math.abs(recipeValue - currentValue);
    
    // Weight more prominent elements higher
    const weight = recipeValue;
    
    totalScore += similarity * weight;
    totalWeight += weight;
  });
  
  // Normalize final score
  return totalWeight > 0 ? totalScore / totalWeight : 0.5;
}

// Default elemental properties for calculations
export const DEFAULT_ELEMENTAL_PROPERTIES: ElementalProperties = {
  Fire: 0.25,
  Water: 0.25,
  Earth: 0.25,
  Air: 0.25
};

// Import ingredient mappings data
import { ingredientsMap } from '../data/ingredients';
import type { IngredientMapping } from '../types/ingredient';

/**
 * Calculate string similarity between two strings
 * Used for fuzzy matching ingredients
 */
function getStringSimilarity(str1: string, str2: string): number {
  // Normalize strings for comparison
  const a = str1.toLowerCase();
  const b = str2.toLowerCase();
  
  // If strings are identical, return highest similarity
  if (a === b) return 1;
  
  // If either string contains the other, high similarity
  if (a.includes(b) || b.includes(a)) {
    const lengthRatio = Math.min(a.length, b.length) / Math.max(a.length, b.length);
    return 0.8 * lengthRatio;
  }
  
  // Use simplified levenshtein distance for other cases
  const levenshtein = simplifiedLevenshtein(a, b);
  const maxLength = Math.max(a.length, b.length);
  
  // Normalize distance to a similarity score (0-1)
  return maxLength > 0 ? Math.max(0, 1 - levenshtein / maxLength) : 0;
}

/**
 * Simplified Levenshtein distance calculation
 * Optimized for performance in ingredient matching
 */
function simplifiedLevenshtein(str1: string, str2: string): number {
  // For short strings, use full Levenshtein
  if (str1.length < 10 && str2.length < 10) {
    return levenshteinDistance(str1, str2);
  }
  
  // For longer strings, use simplified approach for performance
  const s1 = str1.split(' ');
  const s2 = str2.split(' ');
  
  // Calculate word-based similarity
  let matches = 0;
  for (const word of s1) {
    if (word.length <= 2) continue; // Skip short words
    if (s2.includes(word)) matches++;
  }
  
  // Calculate similarity score
  const similarity = matches / Math.max(s1.length, s2.length);
  
  // Convert similarity to a distance
  return (1 - similarity) * Math.max(str1.length, str2.length);
}

/**
 * Standard Levenshtein distance calculation
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  
  // Create matrix
  const d: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  // Initialize first row and column
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;
  
  // Calculate distances
  for (let j = 1; j <= n; j++) {
    for (let i = 1; i <= m; i++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,      // deletion
        d[i][j - 1] + 1,      // insertion
        d[i - 1][j - 1] + cost  // substitution
      );
    }
  }
  
  return d[m][n];
}

/**
 * Connect recipe ingredients to their corresponding mappings
 * This function matches each ingredient in a recipe to an ingredient mapping,
 * which contains detailed elemental and nutritional information.
 */
export function connectIngredientsToMappings(
  recipe: Recipe
): { 
  name: string; 
  matchedTo?: IngredientMapping; 
  confidence: number;
}[] {
  if (!recipe.ingredients || recipe.ingredients.length === 0) {
    return [];
  }

  // SSR check - only use localStorage in browser environment
  const isBrowser = typeof window !== 'undefined';

  // Create a cache key for this recipe's ingredients
  const cacheKey = `ingredient-mapping-${recipe.id || recipe.name}`;
  let cached: string | null = null;
  
  // Try to get from localStorage, with proper error handling
  if (isBrowser) {
    try {
      cached = window.localStorage.getItem(cacheKey);
    } catch (e) {
      console.debug('localStorage not available:', e);
    }
  }
  
  // Check for cached results
  if (cached) {
    try {
      const parsedCache = JSON.parse(cached);
      // Verify the cache is still valid (ingredients haven't changed)
      if (parsedCache.timestamp && 
          Date.now() - parsedCache.timestamp < 3600000 && // 1 hour cache
          parsedCache.ingredientCount === recipe.ingredients.length) {
        return parsedCache.matches;
      }
    } catch (e) {
      console.error('Error parsing ingredient mapping cache:', e);
    }
  }

  const matches = recipe.ingredients.map(recipeIngredient => {
    // Initial result with no match
    const result = {
      name: recipeIngredient.name,
      matchedTo: undefined,
      confidence: 0
    };

    // 1. Try exact match first
    const exactMatch = ingredientsMap[recipeIngredient.name.toLowerCase()];
    if (exactMatch) {
      result.matchedTo = exactMatch as IngredientMapping;
      result.confidence = 1.0;
      return result;
    }

    // 2. Try matching by name parts (for compound ingredients)
    const nameParts = recipeIngredient.name.toLowerCase().split(/\s+/);
    for (const part of nameParts) {
      if (part.length < 3) continue; // Skip short parts like "of", "and", etc.
      
      const partMatch = ingredientsMap[part];
      if (partMatch) {
        result.matchedTo = partMatch as IngredientMapping;
        result.confidence = 0.8;
        return result;
      }
    }

    // 3. Try fuzzy matching against all ingredient names
    // Only do this for ingredients that didn't match exactly
    let bestMatch = { ingredient: null as IngredientMapping | null, similarity: 0.4 };
    
    for (const [key, ingredient] of Object.entries(ingredientsMap)) {
      // Skip very short keys to avoid false positives
      if (key.length < 3) continue;
      
      // Check if the ingredient matches the category
      const categoryMatch = recipeIngredient.category && 
        ingredient.category === recipeIngredient.category ? 0.2 : 0;
        
      // Calculate string similarity
      const similarity = getStringSimilarity(recipeIngredient.name, key) + categoryMatch;
      
      if (similarity > bestMatch.similarity) {
        bestMatch = { 
          similarity, 
          ingredient: ingredient as unknown as IngredientMapping 
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
        const swapMatch = ingredientsMap[swap.toLowerCase()];
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
      window.localStorage.setItem(cacheKey, JSON.stringify({
        matches,
        timestamp: Date.now(),
        ingredientCount: recipe.ingredients.length
      }));
    } catch (e) {
      console.error('Error caching ingredient mappings:', e);
    }
  }

  return matches;
}

/**
 * Find the best recipe matches based on the given parameters
 */
export async function findBestMatches(
  recipes?: Recipe[], 
  matchFilters: MatchFilters = {}, 
  currentEnergy: ElementalProperties | null = null, 
  limit = 10
): Promise<MatchResult[]> {
  console.log(`Finding best matches from ${recipes?.length || 0} recipes with filters:`, matchFilters);
  
  // If recipes is null, undefined, or not an array, fetch recipes using LocalRecipeService
  if (!recipes || !Array.isArray(recipes) || recipes.length === 0) {
    try {
      console.log('No recipes provided, fetching from LocalRecipeService');
      const allRecipes = await LocalRecipeService.getAllRecipes();
      recipes = allRecipes;
      console.log(`Fetched ${recipes.length} recipes from LocalRecipeService`);
    } catch (error) {
      console.error('Error fetching recipes from LocalRecipeService:', error);
      return []; // Return empty array if we can't fetch recipes
    }
  }
  
  // Clone recipes to avoid modifying the original array
  let filteredRecipes = [...recipes];
  
  // Apply filters
  if (matchFilters?.maxCookingTime) {
    filteredRecipes = filteredRecipes.filter(recipe => 
      !hasProperty(recipe, 'cookingTime') || 
      safeNumber(recipe.cookingTime) <= matchFilters.maxCookingTime
    );
    console.log(`After maxCookingTime filter: ${filteredRecipes.length} recipes remain`);
  }
  
  // Calculate simple scores for each recipe based on available data
  const scoredRecipes = filteredRecipes.map(recipe => {
    const baseScore = 0.5; // Default neutral score
    
    // Apply a minimal scoring system for demonstration
    const finalScore = baseScore;
    
    return {
      recipe,
      score: finalScore,
      elements: recipe.elementalProperties || DEFAULT_ELEMENTAL_PROPERTIES,
      dominantElements: calculateDominantElements(recipe.elementalProperties || DEFAULT_ELEMENTAL_PROPERTIES)
    };
  });
  
  // Sort recipes by score (highest first)
  const sortedRecipes = scoredRecipes.sort((a, b) => b.score - a.score);
  
  // Return the top N recipes
  return sortedRecipes.slice(0, limit);
}

/**
 * Calculate dominant elements from ElementalProperties
 */
function calculateDominantElements(elements: ElementalProperties): [string, number][] {
  return Object.entries(elements)
    .filter(([_, value]) => typeof value === 'number' && !isNaN(value))
    .sort(([_, valueA], [__, valueB]) => (valueB as number) - (valueA as number));
}

/**
 * Calculate the alignment score between a recipe and current astrological state
 */
export function calculateAlignmentScore(
  recipe: Recipe,
  astrologicalState: AstrologicalState
): number {
  // If recipe or astrological state is missing, return a neutral score
  if (!recipe || !astrologicalState) {
    return 0.5;
  }
  
  // Initialize base score components
  let elementalScore = 0;
  let zodiacScore = 0;
  let planetaryScore = 0;
  let seasonalScore = 0;
  
  // 1. Calculate elemental alignment
  if (recipe.elementalProperties && astrologicalState.elementalProperties) {
    elementalScore = calculateElementalScore(
      recipe.elementalProperties,
      astrologicalState.elementalProperties
    );
  }
  
  // 2. Calculate zodiac sign alignment
  if (recipe.zodiacInfluences && astrologicalState.sunSign) {
    // Direct match - recipe is influenced by current sun sign
    const sunSign = astrologicalState.sunSign.toLowerCase() as ZodiacSign;
    if (recipe.zodiacInfluences.includes(sunSign)) {
      zodiacScore = 0.9; // Strong alignment
    } else {
      // Check for elemental compatibility
      const zodiacElements: Record<ZodiacSign, string> = {
        aries: 'Fire',
        taurus: 'Earth',
        gemini: 'Air',
        cancer: 'Water',
        leo: 'Fire',
        virgo: 'Earth',
        libra: 'Air',
        scorpio: 'Water',
        sagittarius: 'Fire',
        capricorn: 'Earth',
        aquarius: 'Air',
        pisces: 'Water'
      };
      
      // Get current sun sign's element
      const sunSignElement = zodiacElements[sunSign];
      
      // Check if recipe's strongest element matches sun sign's element
      if (recipe.elementalProperties) {
        const elements = Object.entries(recipe.elementalProperties);
        elements.sort((a, b) => b[1] - a[1]); // Sort by value (descending)
        
        if (elements.length > 0 && elements[0][0] === sunSignElement) {
          zodiacScore = 0.7; // Good elemental alignment
        } else {
          zodiacScore = 0.3; // Poor elemental alignment
        }
      } else {
        zodiacScore = 0.5; // Neutral if no elemental data
      }
    }
  } else {
    zodiacScore = 0.5; // Neutral if missing zodiac data
  }
  
  // 3. Calculate planetary alignment
  if (recipe.astrologicalInfluences && astrologicalState.activePlanets) {
    // Check how many active planets influence this recipe
    const matchingPlanets = recipe.astrologicalInfluences.filter(
      planet => astrologicalState.activePlanets?.includes(planet.toLowerCase())
    );
    
    if (matchingPlanets.length > 0) {
      // Calculate score based on percentage of matching planets
      planetaryScore = 0.5 + (matchingPlanets.length / recipe.astrologicalInfluences.length) * 0.5;
    } else {
      planetaryScore = 0.4; // Slight penalty for no matching planets
    }
  } else {
    planetaryScore = 0.5; // Neutral if missing planetary data
  }
  
  // 4. Calculate seasonal alignment
  if (recipe.season && astrologicalState.season) {
    // Check if recipe's season matches current season
    const recipeSeasons = Array.isArray(recipe.season) ? recipe.season : [recipe.season];
    
    if (recipeSeasons.includes(astrologicalState.season)) {
      seasonalScore = 1.0; // Perfect seasonal match
    } else {
      seasonalScore = 0.3; // Out of season
    }
  } else {
    seasonalScore = 0.5; // Neutral if missing seasonal data
  }
  
  // Calculate final weighted score
  // Weight elemental alignment most heavily, followed by zodiac and planetary influences
  const weightedScore = (
    elementalScore * 0.4 +
    zodiacScore * 0.3 +
    planetaryScore * 0.2 +
    seasonalScore * 0.1
  );
  
  // Make sure score is within 0-1 range
  return Math.max(0, Math.min(1, weightedScore));
} 