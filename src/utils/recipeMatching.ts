import { LocalRecipeService } from '@/services/LocalRecipeService';
import { log } from '@/services/LoggingService';
import type {
  Recipe,
  ElementalProperties,
  AstrologicalState,
  Season,
} from "@/types/alchemy";
import { createAstrologicalBridge } from '@/types/bridges/astrologicalBridge';
import type { CookingMethod } from "@/types/cookingMethod";


// Define IngredientMapping locally since it's not exported from alchemy
interface IngredientMapping {
  name: string;
  elementalProperties: ElementalProperties;
  astrologicalProfile?: any;
  qualities?: string[];
  // Add commonly missing properties
  description?: string;
  category?: string;
  cuisine?: string;
  flavorProfile?: Record<string, number>;
  regionalCuisine?: string;
  season?: any;
  timing?: any;
  duration?: any;
  matchScore?: number;
  mealType?: string;
}
import { calculateMatchScore } from './ElementalCalculator';
import { elementalUtils , getCurrentElementalState } from './elementalUtils';

import { ingredientsMap } from '@/data/ingredients';
// Import from correct location
import { getRecipes } from '@/data/recipes';
import { getLatestAstrologicalState } from '@/services/AstrologicalService';

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
  // Add commonly missing properties
  matchScore?: number;
  timing?: any;
  duration?: any;
  season?: any;
  mealType?: string;
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
  preferredComplexity?: number | string;
}

// Cache for recipe matches to improve performance
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const matchCache = new Map<string, CacheEntry<MatchResult[]>>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

// Define Modality type
type Modality = 'cardinal' | 'fixed' | 'mutable';

/**
 * Find the best recipe matches based on the given parameters
 */
export async function findBestMatches(
  recipes?: Recipe[],
  matchFilters: MatchFilters = {},
  currentEnergy: ElementalProperties | null = null,
  limit = 10
): Promise<MatchResult[]> {
  // log.info(`Finding best matches from ${recipes?.length || 0} recipes with filters:`, matchFilters);

  // Generate a cache key based on inputs
  const cacheKey = getCacheKey(recipes, matchFilters, currentEnergy, limit);
  const cachedEntry = matchCache.get(cacheKey);

  // Check if we have a valid cache entry
  if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL) {
    // log.info('Using cached recipe matches');
    return cachedEntry.data;
  }

  // If recipes is null, undefined, or not an array, fetch recipes using LocalRecipeService
  if (!recipes || !Array.isArray(recipes) || recipes.length === 0) {
    try {
      // log.info('No recipes provided, fetching from LocalRecipeService');
      const recipeService = new LocalRecipeService();
      recipes = await LocalRecipeService.getAllRecipes() as unknown as Recipe[];
      // log.info(`Fetched ${recipes.length} recipes from LocalRecipeService`);
    } catch (error) {
      // console.error('Error fetching recipes from LocalRecipeService:', error);
      return []; // Return empty array if we can't fetch recipes
    }
  }

  // Clone recipes to avoid modifying the original array
  let filteredRecipes = [...recipes];

  // Apply filters
  if (matchFilters.maxCookingTime) {
    filteredRecipes = filteredRecipes.filter(
      (recipe) =>
        // Apply Pattern KK-1: Explicit Type Assertion for comparison operations
        !recipe.cookingTime || Number(recipe.cookingTime) <= matchFilters.maxCookingTime ?? undefined
    );
    // log.info(`After maxCookingTime filter: ${filteredRecipes.length} recipes remain`);
  }

  if (
    matchFilters.dietaryRestrictions &&
    matchFilters.dietaryRestrictions.length > 0
  ) {
    filteredRecipes = filteredRecipes.filter((recipe) => {
      // Extract recipe data with safe property access
      const recipeData = recipe as Record<string, unknown>;
      const dietaryTags = recipeData.dietaryTags;
      
      if (!dietaryTags) return true; // Keep recipes without tags

      // Check if any of the restrictions are in the recipe's dietary tags
      const hasRestrictedTag = matchFilters.dietaryRestrictions?.some(
        (restriction) => Array.isArray(dietaryTags) && dietaryTags.includes(restriction)
      );

      // If recipe has the restricted tag, exclude it
      return !hasRestrictedTag;
    });
    // log.info(`After dietaryRestrictions filter: ${filteredRecipes.length} recipes remain`);
  }

  if (matchFilters.season) {
    // Prioritize seasonal recipes but don't completely exclude off-season ones
    filteredRecipes = filteredRecipes.sort((a, b) => {
      const aIsInSeason =
        Array.isArray(a.season) ? a.season.includes((matchFilters as Record<string, unknown>).season as Season) || a.season.includes('all') : a.season === (matchFilters as Record<string, unknown>).season || a.season === 'all';
      const bIsInSeason =
        Array.isArray(b.season) ? b.season.includes((matchFilters as Record<string, unknown>).season as Season) || b.season.includes('all') : b.season === (matchFilters as Record<string, unknown>).season || b.season === 'all';

      if (aIsInSeason && !bIsInSeason) return -1;
      if (!aIsInSeason && bIsInSeason) return 1;
      return 0;
    });
    // log.info(`After season sorting (${(matchFilters as any)?.season}): prioritized seasonal recipes`);
  }

  if (matchFilters.servings) {
    // Filter for recipes that serve at least the required number
    filteredRecipes = filteredRecipes.filter(
      (recipe) => 
        // Apply Pattern KK-1: Explicit Type Assertion for comparison operations
        !recipe.servings || Number(recipe.servings) >= matchFilters.servings ?? undefined
    );
    // log.info(`After servings filter: ${filteredRecipes.length} recipes remain`);
  }

  if (
    matchFilters.excludeIngredients &&
    matchFilters.excludeIngredients.length > 0
  ) {
    filteredRecipes = filteredRecipes.filter((recipe) => {
      if (!recipe.ingredients) return true;

      // Check if any of the excluded ingredients are in the recipe
      const hasExcludedIngredient = matchFilters.excludeIngredients?.some(
        (excluded) => {
          const lowerExcluded = excluded.toLowerCase();
          return recipe.ingredients.some((ingredient) => {
            if (typeof ingredient === 'string') {
              const ingredientStr = ingredient as string;
              return ingredientStr.toLowerCase().includes(lowerExcluded);
            } else {
              // Extract ingredient data with safe property access
              const ingredientData = ingredient as Record<string, unknown>;
              const name = ingredientData.name;
              return typeof name === 'string' && name.toLowerCase().includes(lowerExcluded);
            }
          });
        }
      );

      // If recipe has excluded ingredient, filter it out
      return !hasExcludedIngredient;
    });
    // log.info(`After excludeIngredients filter: ${filteredRecipes.length} recipes remain`);
  }

  if (matchFilters.cookingMethods && matchFilters.cookingMethods.length > 0) {
    // Prioritize recipes that use preferred cooking methods
    filteredRecipes = filteredRecipes.sort((a, b) => {
      // Extract recipe data with safe property access for cooking methods
      const aData = a as Record<string, unknown>;
      const bData = b as Record<string, unknown>;
      const aCookingMethods = aData.cookingMethods;
      const bCookingMethods = bData.cookingMethods;
      
      const aUsesMethod =
        Array.isArray(aCookingMethods) && aCookingMethods.some((method) =>
          matchFilters.cookingMethods?.includes(method)
        ) || false;

      const bUsesMethod =
        Array.isArray(bCookingMethods) && bCookingMethods.some((method) =>
          matchFilters.cookingMethods?.includes(method)
        ) || false;

      if (aUsesMethod && !bUsesMethod) return -1;
      if (!aUsesMethod && bUsesMethod) return 1;
      return 0;
    });
    // log.info(`After cookingMethods sorting: prioritized recipes with preferred methods`);
  }

  // If no recipes passed the filtering, return empty array
  if (filteredRecipes.length === 0) {
    // log.info('No recipes passed all filters');
    return [];
  }

  // Calculate match scores for each recipe
  const matchResults = await Promise.all(
    filteredRecipes.map(async (recipe) => {
      // Calculate base elemental properties
      const elements = await calculateBaseElements(recipe);
      
      // Calculate dominant elements
      const dominantElements = calculateDominantElements(elements);
      
      // Calculate match score
      let score = 0;
      
      if (currentEnergy) {
        // Calculate elemental alignment
        const elementalScore = calculateElementalAlignment(recipe, currentEnergy as AstrologicalState);
        score += elementalScore * 0.4; // 40% weight for elemental alignment
        
        // Calculate nutritional alignment
        const nutritionalScore = calculateNutritionalAlignment(recipe, currentEnergy as AstrologicalState);
        score += nutritionalScore * 0.3; // 30% weight for nutritional alignment
        
        // Calculate astrological alignment
        const astrologicalScore = await _calculateRecipeEnergyMatch(recipe, currentEnergy as AstrologicalState);
        score += astrologicalScore * 0.3; // 30% weight for astrological alignment
      } else {
        // Fallback scoring without current energy
        score = Math.random() * 0.5 + 0.5; // Random score between 0.5 and 1.0
      }
      
      // Connect ingredients to mappings
      const matchedIngredients = connectIngredientsToMappings(recipe);
      
      return {
        recipe,
        score,
        elements,
        dominantElements,
        matchedIngredients
      } as MatchResult;
    })
  );

  // Sort by score (highest first) and limit results
  const sortedResults = matchResults
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  // Cache the results
  matchCache.set(cacheKey, {
    data: sortedResults,
    timestamp: Date.now(),
  });

  return sortedResults;
}

const calculateBaseElements = async (recipe: Recipe): Promise<ElementalProperties> => {
  const baseElements: ElementalProperties = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0,
  };

  if (!recipe.ingredients) {
    return baseElements;
  }

  for (const ingredient of recipe.ingredients) {
    let ingredientName: string;
    
    if (typeof ingredient === 'string') {
      ingredientName = ingredient;
    } else {
      // Extract ingredient data with safe property access
      const ingredientData = ingredient as Record<string, unknown>;
      ingredientName = (ingredientData.name as string) || 'unknown';
    }

    // Get ingredient mapping
    const ingredientMapping = ingredientsMap[ingredientName.toLowerCase()];
    
    if (ingredientMapping.elementalProperties) {
      const properties = ingredientMapping.elementalProperties ;
      baseElements.Fire += properties.Fire || 0;
      baseElements.Water += properties.Water || 0;
      baseElements.Earth += properties.Earth || 0;
      baseElements.Air += properties.Air || 0;
    }
  }

  // Normalize elemental properties
  const total = baseElements.Fire + baseElements.Water + baseElements.Earth + baseElements.Air;
  if (total > 0) {
    baseElements.Fire = baseElements.Fire / total;
    baseElements.Water = baseElements.Water / total;
    baseElements.Earth = baseElements.Earth / total;
    baseElements.Air = baseElements.Air / total;
  }

  return baseElements;
};

interface EnergyData {
  zodiacEnergy?: string;
  lunarEnergy?: string;
  planetaryEnergy?: string | string[];
  zodiac?: string;
  lunar?: string;
  planetary?: string | string[];
}

const calculateEnergyMatch = (
  recipeEnergy: EnergyData,
  currentEnergy: EnergyData
) => {
  let score = 0;

  // Check if we're in Aries season
  const isAriesSeason = currentEnergy.zodiacEnergy === 'aries';

  // Zodiac energy match with increased weight for Mars during Aries season
  if (recipeEnergy.zodiac === currentEnergy.zodiacEnergy) {
    // Base zodiac match score
    score += 0.4;

    // If we're in Aries season and the recipe has Mars influence, add bonus
    if (
      isAriesSeason &&
      recipeEnergy.planetary &&
      (Array.isArray(recipeEnergy.planetary) ? recipeEnergy.planetary.includes('Mars') : recipeEnergy.planetary === 'Mars')
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
      (Array.isArray(recipeEnergy.planetary) ? recipeEnergy.planetary.includes('Sun') : recipeEnergy.planetary === 'Sun') &&
      (Array.isArray(currentEnergy.planetaryEnergy) ? currentEnergy.planetaryEnergy.includes('Sun') : currentEnergy.planetaryEnergy === 'Sun')
    ) {
      score += 0.15;
    }

    // Moon influence bonus
    if (
      (Array.isArray(recipeEnergy.planetary) ? recipeEnergy.planetary.includes('Moon') : recipeEnergy.planetary === 'Moon') &&
      (Array.isArray(currentEnergy.planetaryEnergy) ? currentEnergy.planetaryEnergy.includes('Moon') : currentEnergy.planetaryEnergy === 'Moon')
    ) {
      score += 0.15;
    }

    // Mars influence bonus
    if (
      (Array.isArray(recipeEnergy.planetary) ? recipeEnergy.planetary.includes('Mars') : recipeEnergy.planetary === 'Mars') &&
      (Array.isArray(currentEnergy.planetaryEnergy) ? currentEnergy.planetaryEnergy.includes('Mars') : currentEnergy.planetaryEnergy === 'Mars')
    ) {
      // Higher bonus during Aries season
      score += isAriesSeason ? 0.25 : 0.15;
    }
  }

  return Math.min(1.0, score); // Cap at 1.0
};

const calculateDominantElements = (
  elements: ElementalProperties
): [string, number][] => {
  // Filter out any invalid entries to prevent NaN issues
  return Object.entries(elements)
    .filter(([, value]) => !isNaN(value) && value !== undefined)
    .sort(([, a], [, b]) => (b || 0) - (a || 0))
    .slice(0, 2)
    .map(([element, value]) => [element, value || 0]);
};

async function _calculateRecipeEnergyMatch(
  recipe: Recipe,
  currentEnergy: AstrologicalState
): Promise<number> {
  // Base score starts at 0.5 (neutral match)
  let score = 0.5;

  // Get dominant elements for the recipe
  const recipeElements = await calculateBaseElements(recipe);
  const recipeDominantElements = calculateDominantElements(recipeElements);

  // Use dominant elements for enhanced scoring if available
  if (recipeDominantElements.length > 0) {
    const [primaryElement, primaryValue] = recipeDominantElements[0];
    if (primaryValue > 0.4) {
      // Boost score for recipes with strong dominant element
      score += 0.1;
    }
  }

  // 1. Calculate elemental score (35% of total) - now with double impact
  const elementalScore = calculateElementalAlignment(recipe, currentEnergy);
  score += elementalScore * 0.7; // Doubled from 0.35

  // 2. Calculate modality score - use qualities array even if preferredModality doesn't exist
  const qualities = recipe.qualities || [];
  // Extract currentEnergy data with safe property access for preferredModality
  const energyData = currentEnergy as Record<string, unknown>;
  const preferredModality = energyData.preferredModality;
  
  // Check if preferredModality exists in currentEnergy, if not skip this boost
  if (preferredModality) {
    const modalityScore = calculateModalityScore(
      qualities as unknown as string[],
      preferredModality as 'cardinal' | 'fixed' | 'mutable'
    );
    score += modalityScore * 0.5; // Doubled from 0.25
  }

  // 3. Calculate astrological score - check if astrologicalEnergy exists
  if (recipe.astrologicalEnergy) {
    const astrologicalScore = calculateEnergyMatch(
      recipe.astrologicalEnergy,
      currentEnergy as unknown as EnergyData
    );
    score += astrologicalScore * 0.4; // Doubled from 0.2
  }

  // 4. Calculate seasonal score - check if season exists
  if ((recipe as Record<string, unknown>).season && (currentEnergy as Record<string, unknown>).season) {
    const recipeSeason = (recipe as Record<string, unknown>).season;
    const currentSeason = (currentEnergy as Record<string, unknown>).season;
    
    // Apply Pattern GG-6: Enhanced property access with type guards
    const seasonalScore = (Array.isArray(recipeSeason) && typeof currentSeason === 'string' && recipeSeason.includes(currentSeason)) ||
                         (typeof recipeSeason === 'string' && recipeSeason === currentSeason)
      ? 1.0
      : 0.0;
    score += seasonalScore * 0.2; // Doubled from 0.1
  }

  // 5. Calculate nutritional alignment
  const nutritionalScore = calculateNutritionalAlignment(recipe, currentEnergy);
  score += nutritionalScore * 0.2; // Doubled from 0.1

  // Normalize the final score to ensure it stays in 0-1 range despite doubled factors
  return Math.min(1, Math.max(0, score));
}

function calculateElementalAlignment(
  recipe: Recipe,
  currentEnergy: AstrologicalState
): number {
  // Extract current elemental properties with safe property access
  const currentData = currentEnergy as Record<string, unknown>;
  const currentElements = currentData.currentElementalProperties as ElementalProperties;
  
  if (!currentElements) {
    return 0.5; // Default score if no current elements
  }

  // Calculate recipe elements (simplified for now)
  const recipeElements: ElementalProperties = {
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25,
  };

  // Calculate alignment score
  const fireAlignment = 1 - Math.abs(recipeElements.Fire - currentElements.Fire);
  const waterAlignment = 1 - Math.abs(recipeElements.Water - currentElements.Water);
  const earthAlignment = 1 - Math.abs(recipeElements.Earth - currentElements.Earth);
  const airAlignment = 1 - Math.abs(recipeElements.Air - currentElements.Air);

  return (fireAlignment + waterAlignment + earthAlignment + airAlignment) / 4;
}

// New function to calculate nutritional alignment
function calculateNutritionalAlignment(
  recipe: Recipe,
  currentEnergy: AstrologicalState
): number {
  // Extract nutritional goals with safe property access
  const currentData = currentEnergy as Record<string, unknown>;
  const nutritionalGoals = currentData.nutritionalGoals as Record<string, unknown>;
  
  if (!nutritionalGoals) {
    return 0.5; // Default score if no nutritional goals
  }

  // Extract recipe nutritional profile with safe property access
  const recipeData = recipe as Record<string, unknown>;
  const recipeProfile = recipeData.nutritionalProfile as Record<string, unknown>;
  
  if (!recipeProfile) {
    return 0.5; // Default score if no recipe profile
  }

  // Check for high protein preference
  const highProtein = nutritionalGoals.highProtein as boolean;
  if (highProtein && hasHighProtein(recipe)) {
    return 0.9;
  }

  // Check for low carb preference
  const lowCarb = nutritionalGoals.lowCarb as boolean;
  if (lowCarb && hasLowCarb(recipe)) {
    return 0.9;
  }

  // Check for high fiber preference
  const highFiber = nutritionalGoals.highFiber as boolean;
  if (highFiber && hasHighFiber(recipe)) {
    return 0.9;
  }

  // Check for low fat preference
  const lowFat = nutritionalGoals.lowFat as boolean;
  if (lowFat && hasLowFat(recipe)) {
    return 0.9;
  }

  return 0.5; // Default score
}

// Helper functions for nutritional evaluation
function hasHighProtein(recipe: Recipe): boolean {
  // Extract nutritional profile with safe property access
  const recipeData = recipe as Record<string, unknown>;
  const profile = recipeData.nutritionalProfile as Record<string, unknown>;
  
  if (!profile) return false;
  
  const protein = profile.protein as number;
  return typeof protein === 'number' && protein >= 20;
}

function hasLowCarb(recipe: Recipe): boolean {
  // Extract nutritional profile with safe property access
  const recipeData = recipe as Record<string, unknown>;
  const profile = recipeData.nutritionalProfile as Record<string, unknown>;
  
  if (!profile) return false;
  
  const carbs = profile.carbohydrates as number;
  return typeof carbs === 'number' && carbs <= 30;
}

function hasHighFiber(recipe: Recipe): boolean {
  // Extract nutritional profile with safe property access
  const recipeData = recipe as Record<string, unknown>;
  const profile = recipeData.nutritionalProfile as Record<string, unknown>;
  
  if (!profile) return false;
  
  const fiber = profile.fiber as number;
  return typeof fiber === 'number' && fiber >= 8;
}

function hasLowFat(recipe: Recipe): boolean {
  // Extract nutritional profile with safe property access
  const recipeData = recipe as Record<string, unknown>;
  const profile = recipeData.nutritionalProfile as Record<string, unknown>;
  
  if (!profile) return false;
  
  const fat = profile.fat as number;
  return typeof fat === 'number' && fat <= 10;
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
  const recipeModality = determineIngredientModality(qualities);

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
  const counts = { cardinal: 0, fixed: 0, mutable: 0 };

  // Keywords associated with each modality
  const modalityKeywords = {
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
    const lowerQuality = quality.toLowerCase();

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
  const entries = Object.entries(counts) as [
    'cardinal' | 'fixed' | 'mutable',
    number
  ][];

  // Sort by count in descending order
  const sorted = entries.sort((a, b) => b[1] - a[1]);

  // Return the dominant modality if it has any count, otherwise null
  return sorted[0][1] > 0 ? sorted[0][0] : null;
}

// Create an astrologyUtils object with the necessary functions
export const astrologyUtils = {
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
  const recipeIds =
    recipes?.map((r) => {
      // Apply Pattern GG-6: Enhanced property access with type guards
      const recipeData = r as Record<string, unknown>;
      return r.id || `${recipeData.name || 'unknown'}-${r.cuisine || 'unknown'}`;
    }).join(',') || 'none';

  // Stringify the filters and energy objects
  const filtersStr = JSON.stringify(filters);
  const energyStr = energy ? JSON.stringify(energy) : 'null';

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
  const now = Date.now();
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
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  // Exact match
  if (s1 === s2) return 1;

  // Check if one is contained in the other
  if (s1.includes(s2) || s2.includes(s1)) {
    const longerStr = s1.length > s2.length ? s1 : s2;
    const shorterStr = s1.length > s2.length ? s2 : s1;
    // The shorter the gap between lengths, the higher the score
    const longerLength = longerStr.length || 1;
    return 0.8 + (shorterStr.length / longerLength) * 0.2;
  }

  // Calculate Levenshtein distance
  const len1 = s1.length;
  const len2 = s2.length;
  const maxLen = Math.max(len1, len2);

  // Use simplified Levenshtein if strings are very long
  if (maxLen > 20) {
    return simplifiedLevenshtein(s1, s2);
  }

  // Use full Levenshtein for better accuracy with shorter strings
  const distance = levenshteinDistance(s1, s2);
  let similarity = 1 - distance / (maxLen || 1);

  // Boost score if words share the same first few characters
  // (common in food ingredients where prefixes matter)
  const prefixLength = Math.min(4, Math.min(s1.length, s2.length));
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
  const maxLen = Math.max(str1.length, str2.length);
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
  const m = str1.length;
  const n = str2.length;

  // Create matrix
  const matrix = Array(m + 1)
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
export const connectIngredientsToMappings = (
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
  const isBrowser = typeof window !== 'undefined';

  // Create a cache key for this recipe's ingredients
  const cacheKey = `ingredient-mapping-${recipe.id || (recipe as Record<string, unknown>).name}`;
  let cached: string | null = null;

  // Try to get from localStorage, with proper error handling
  if (isBrowser) {
    try {
      cached = window.localStorage.getItem(cacheKey);
    } catch (e) {
      // log.debug('localStorage not available:', e);
    }
  }

  // Check for cached results
  if (cached) {
    try {
      const parsedCache = JSON.parse(cached);
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

  const matches = recipe.ingredients.map((recipeIngredient) => {
    // Initial result with no match
    // Apply Pattern MM-1: Safe type assertions
    const ingredientData = recipeIngredient as Record<string, unknown>;
    const ingredientName = typeof ingredientData.name === 'string' ? ingredientData.name : 'unknown';
    
    const result = {
      name: ingredientName,
      matchedTo: undefined as IngredientMapping | undefined,
      confidence: 0,
    };

    // 1. Try exact match first
    // Apply Pattern GG-6: Enhanced property access with type guards (use existing variables)
    
    const exactMatch = ingredientsMap[ingredientName.toLowerCase()];
    if (exactMatch) {
      result.matchedTo = exactMatch as IngredientMapping;
      result.confidence = 1.0;
      return result;
    }

    // 2. Try matching by name parts (for compound ingredients)
    const nameParts = ingredientName.toLowerCase().split(/\s+/);
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
    let bestMatch = {
      ingredient: null as IngredientMapping | null,
      similarity: 0.4,
    };

    for (const [key, ingredient] of Object.entries(ingredientsMap)) {
      // Skip very short keys to avoid false positives
      if (key.length < 3) continue;

      // Check if the ingredient matches the category
      const categoryMatch =
        recipeIngredient.category &&
        ingredient.category === recipeIngredient.category
          ? 0.2
          : 0;

      // Calculate string similarity
      // Apply Pattern MM-1: Safe type assertions
      const ingredientData = recipeIngredient as Record<string, unknown>;
      const ingredientName = typeof ingredientData.name === 'string' ? ingredientData.name : '';
      const similarity = getStringSimilarity(ingredientName, key) + categoryMatch;

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
    const ingredientSwapData = recipeIngredient as Record<string, unknown>;
    const swaps = ingredientSwapData.swaps;
    if (swaps && Array.isArray(swaps) && swaps.length > 0) {
      for (const swap of swaps) {
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
  const factors = [
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
        const recipeValue =
          typeof recipeProfile[factor] === 'number'
            ? (recipeProfile[factor] as number)
            : parseFloat(recipeProfile[factor] as string) || 5;

        const normalizedValue = 1 - Math.min(recipeValue / (5 || 1), 1);
        matchScore += normalizedValue;
      }
      // For 'high' goals (e.g., 'high protein'), a higher value is better
      else if (userGoals[factor] === 'high') {
        // Scale from 0-1 where 1 is high and 0 is low
        const recipeValue =
          typeof recipeProfile[factor] === 'number'
            ? (recipeProfile[factor] as number)
            : parseFloat(recipeProfile[factor] as string) || 0;

        const normalizedValue = Math.min(recipeValue / (5 || 1), 1);
        matchScore += normalizedValue;
      }
      // For exact targets (e.g., specific calorie count)
      else if (
        typeof userGoals[factor] === 'number' ||
        !isNaN(Number(userGoals[factor]))
      ) {
        const goalValue =
          typeof userGoals[factor] === 'number'
            ? (userGoals[factor] as number)
            : parseFloat(userGoals[factor] as string);

        const recipeValue =
          typeof recipeProfile[factor] === 'number'
            ? (recipeProfile[factor] as number)
            : parseFloat(recipeProfile[factor] as string);

        if (!isNaN(goalValue) && !isNaN(recipeValue)) {
          // Calculate how close the recipe is to the target (1 = exact match)
          const proximity =
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
interface AstrologicalInfluence {
  zodiacCompatibility?: Record<string, number>;
  planetaryAlignment?: Record<string, number>;
  lunarInfluence?: Record<string, number>;
}

function calculateAstrologicalMatch(
  recipeInfluence: AstrologicalInfluence,
  userSign: string
): number {
  if (!recipeInfluence || !userSign) return 0.5; // Default to neutral if no data

  // Define astrological compatibility between signs and elements
  const signElementMap: Record<string, string> = {
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
    pisces: 'Water',
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

  const userSignLower = userSign.toLowerCase();
  const userElement = signElementMap[userSignLower];

  if (!userElement) return 0.5; // Default to neutral if sign not recognized

  // Extract recipeInfluence data with safe property access
  const influenceData = recipeInfluence as any;
  const sign = influenceData?.sign;
  const elements = influenceData?.elements;
  
  // If recipe has a specific sign it aligns with
  if (sign && typeof sign === 'string') {
    const recipeSignLower = String(sign).toLowerCase();

    // Direct sign match is very favorable
    if (recipeSignLower === userSignLower) {
      return 1.0;
    }

    // Check for sign compatibility
    if (signCompatibility[userSignLower][recipeSignLower]) {
      return signCompatibility[userSignLower][recipeSignLower];
    }

    // If no direct sign compatibility, check element compatibility
    const recipeElement = signElementMap[recipeSignLower];
    if (recipeElement && userElement) {
      return elementCompatibility[userElement][recipeElement] || 0.5;
    }
  }

  // If recipe has elemental influences directly
  if (elements) {
    // Check if recipe has the user's element
    if (typeof elements === 'string') {
      const singleElement = String(elements).toLowerCase();
      return elementCompatibility[userElement][singleElement] || 0.5;
    }

    // If recipe has multiple elements, average their compatibility
    if (Array.isArray(elements)) {
      let totalCompatibility = 0;
      elements.forEach((element: unknown) => {
        if (typeof element === 'string') {
          const elemLower = element.toLowerCase();
          totalCompatibility +=
            elementCompatibility[userElement][elemLower] || 0.5;
        }
      });
      return elements.length > 0
        ? totalCompatibility / elements.length
        : 0.5;
    }
  }

  // Consider lunar influences if available
  if (recipeInfluence.lunarInfluence) {
    // Map lunar influences to elements
    const lunarElement = astrologyUtils.getPlanetaryElement(
      'Moon'
    );
    if (lunarElement) {
      return (
        elementCompatibility[userElement][lunarElement.toLowerCase()] || 0.5
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
    normalizedRecipeComplexity = recipeComplexity ;
  }

  // Normalize recipe complexity to 0-1 scale
  // Assuming recipe complexity is on a 1-5 scale
  const normalizedComplexity = Math.max(
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
  const proximityScore =
    1 - Math.abs(normalizedComplexity - normalizedPreference);

  // For slight preference to simpler recipes when other factors equal
  // (can be adjusted or removed based on app philosophy)
  const simplicityBonus = (1 - normalizedComplexity) * 0.05;

  return Math.min(proximityScore + simplicityBonus, 1);
}
