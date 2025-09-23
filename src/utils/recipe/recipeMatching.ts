// Removed unused, import: calculatePlanetaryAlignment
import { _logger } from '@/lib/logger';
import kalchmEngine from '@/calculations/core/kalchmEngine';
import astrologizeCache from '@/services/AstrologizeApiCache'
import { LocalRecipeService } from '@/services/LocalRecipeService';
import { AstrologicalState, /* Element, */ IngredientMapping, Season } from '@/types/alchemy';
// Removed unused, import: Element
import type {
  ElementalProperties,
  // nutritionInfo // unused - removed for performance
  Recipe
} from '@/types/recipe';

// Add missing imports for TS2304 fixes

// Removed unused, interface: CalculationData

interface ScoredItem {
  score: number,
  [key: string]: unknown
}

// Removed unused, interface: ElementalData

// Removed unused, interface: CuisineData

// Removed unused, interface: NutrientData

// Removed unused, interface: MatchingResult

// Removed unused, import: allIngredients
// Removed unused, imports: isNonEmptyArray, safeFilter, safeSome, toArray
// Removed unused, imports: createElementalProperties, getElementalProperty
// Removed unused, import: calculateMatchScore
// Removed unused, import: elementalUtils

// DUPLICATE: import { Element } from '@/types/alchemy';
import {
  getRecipeAstrologicalInfluences,
  getRecipeCookingMethods,
  getRecipeCookingTime,
  getRecipeElementalProperties,
  getRecipeMealTypes,
  getRecipeSeasons,
  // recipeHasTag, // unused - removed for performance
  isRecipeDietaryCompatible,
  recipeHasIngredient
} from './recipeUtils';

// Moved imports to top of file for proper order
// Removed unused, import: getLatestAstrologicalState

// ===== INTERFACES =====

interface MatchResult {;
  recipe: Recipe,
  score: number,
  elements: ElementalProperties,
  dominantElements: [string, number][],
  matchedIngredients?: {
    name: string,
    matchedTo?: IngredientMapping,
    confidence: number
  }[],
}

interface MatchFilters {
  maxCookingTime?: number,
  dietaryRestrictions?: string[],
  season?: Season
  currentSeason?: string,
  servings?: number,
  excludeIngredients?: string[],
  cookingMethods?: string[],
  nutritionalGoals?: { [key: string]: unknown }
  astrologicalSign?: string,
  mealType?: string,
  preferHigherContrast?: boolean
}

// ===== CACHING SYSTEM =====,

interface CacheEntry<T> {
  data: T,
  timestamp: number
}

const matchCache = new Map<string, CacheEntry<MatchResult[]>>()
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Generate cache key for recipe matching
 */
function getCacheKey(
  recipes: Recipe[] | undefined,
  filters: MatchFilters,
  energy: ElementalProperties | null,
  limit: number,
): string {
  return JSON.stringify({
    recipeCount: recipes?.length || 0 || 0,
    filters,
    energy,
    limit,
    timestamp: Math.floor(Date.now() / (5 * 60 * 1000)), // 5-minute buckets
  })
}

/**
 * Clear recipe match cache
 */
export function clearMatchCache(all = false): void {,
  if (all) {
    matchCache.clear()
  } else {
    // Clear expired entries
    const now = Date.now()
    const entries = matchCache.entries()
    for (const entry of entries) {;
      const [key, cacheEntry] = entryif (now - cacheEntry.timestamp > CACHE_TTL) {
        matchCache.delete(key)
      }
    }
  }
}

// ===== MAIN MATCHING FUNCTIONS =====,

/**
 * Enhanced energy matching using both absolute and relative elemental values
 */
const calculateEnergyMatch = async (
  recipeEnergy: ElementalProperties,
  currentEnergy: ElementalProperties,
): Promise<number> => {
  if (!recipeEnergy || !currentEnergy) {
    return 0.5, // Default match if no energy values provided
  }

  const elements = ['Fire', 'Water', 'Earth', 'Air']

  // Calculate absolute elemental matching
  let absoluteScore = 0,
  for (const element of elements) {
    const recipeValue = recipeEnergy[element] || 0;
    const currentValue = currentEnergy[element] || 0;

    // Since elements are harmonious, calculate similarity score
    const diff = Math.abs(recipeValue - currentValue)
    absoluteScore += (1 - diff) * 0.25, // 0.25 weight for each element
  }

  // Calculate relative elemental matching
  let relativeScore = 0,
  for (const element of elements) {
    const recipeValue = recipeEnergy[element] || 0;
    const currentValue = currentEnergy[element] || 0;

    // Calculate relative values (element / sum of other elements)
    const recipeOthers = elements;
      .filter(e => e !== element)
      .reduce((sume) => sum + (recipeEnergy[e] || 0), 0)
    const currentOthers = elements;
      .filter(e => e !== element)
      .reduce((sume) => sum + (currentEnergy[e] || 0), 0)

    const recipeRelative = recipeOthers > 0 ? recipeValue / recipeOthers: 0;
    const currentRelative = currentOthers > 0 ? currentValue / currentOthers: 0;

    const relativeDiff = Math.abs(recipeRelative - currentRelative)
    relativeScore += (1 - Math.min(1, relativeDiff)) * 0.25
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
    }
    const currentAlchemical = {
      Spirit: currentEnergy.Fire || 0.25,
      Essence: currentEnergy.Air || 0.25,
      Matter: currentEnergy.Earth || 0.25,
      Substance: currentEnergy.Water || 0.25
    }

    const recipeKalchmResult = kalchmEngine.calculateKAlchm(
      recipeAlchemical.Spirit,
      recipeAlchemical.Essence,
      recipeAlchemical.Matter
      recipeAlchemical.Substance
    )
    const currentKalchmResult = kalchmEngine.calculateKAlchm(
      currentAlchemical.Spirit,
      currentAlchemical.Essence,
      currentAlchemical.Matter
      currentAlchemical.Substance
    )

    // Apply safe casting for kalchm property access
    const recipeKalchmData =
      typeof recipeKalchmResult === 'object',
        ? (recipeKalchmResult as unknown)
        : { kalchm: recipeKalchmResult }
    const currentKalchmData =
      typeof currentKalchmResult === 'object',
        ? (currentKalchmResult as unknown)
        : { kalchm: currentKalchmResult }

    const recipeKalchmValue = Number(recipeKalchmData.kalchm ?? recipeKalchmResult ?? 0)
    const currentKalchmValue = Number(currentKalchmData.kalchm ?? currentKalchmResult ?? 0)

    if (recipeKalchmValue > 0 && currentKalchmValue > 0) {
      const kalchmRatio =;
        Math.min(recipeKalchmValue, currentKalchmValue) /,
        Math.max(recipeKalchmValue, currentKalchmValue),
      kalchmScore = 0.7 + kalchmRatio * 0.3, // 0.7-1.0 range,
    }
  } catch (error) {
    _logger.warn('Kalchm calculation failed: ', error)
  }

  // Combine scores with enhanced weighting
  const combinedScore =
    absoluteScore * 0.35 + // 35% absolute elemental matching,
    relativeScore * 0.3 + // 30% relative elemental matching
    kalchmScore * 0.35; // 35% alchemical potential

  return Math.max(0, Math.min(1, combinedScore))
}

/**
 * Enhanced recommendation score calculation using astrologize cache when available
 */
export async function findBestMatches(
  recipes?: Recipe[],
  matchFilters: MatchFilters = {},
  currentEnergy: ElementalProperties | null = null,,
  limit = 10
): Promise<MatchResult[]> {
  // Check for cached astrological data to enhance matching
  // Apply safe type casting for cache method access;
  const cacheData = astrologizeCache as unknown as any;
  const getLatestData = cacheData.getLatestCachedData;
  const cachedData = typeof getLatestData === 'function' ? await getLatestData() : null;

  // Use enhanced energy if available from cache
  const enhancedCurrentEnergy = cachedData?.elementalAbsolutes ||;
    currentEnergy || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }

  // Calculate relative elemental values if we have absolute values
  let relativeElementalValues: ElementalProperties | null = null,
  if (enhancedCurrentEnergy) {
    const totalOther = {
      Fire: enhancedCurrentEnergy.Water + enhancedCurrentEnergy.Earth + enhancedCurrentEnergy.Air || 1,
      Water: enhancedCurrentEnergy.Fire + enhancedCurrentEnergy.Earth + enhancedCurrentEnergy.Air || 1,
      Earth: enhancedCurrentEnergy.Fire + enhancedCurrentEnergy.Water + enhancedCurrentEnergy.Air || 1,
      Air: enhancedCurrentEnergy.Fire + enhancedCurrentEnergy.Water + enhancedCurrentEnergy.Earth || 1
    }

    relativeElementalValues = {
      Fire: enhancedCurrentEnergy.Fire / totalOther.Fire,
      Water: enhancedCurrentEnergy.Water / totalOther.Water,
      Earth: enhancedCurrentEnergy.Earth / totalOther.Earth,
      Air: enhancedCurrentEnergy.Air / totalOther.Air
    }
  }

  // Generate a cache key based on inputs
  const cacheKey = getCacheKey(recipes, matchFilters, enhancedCurrentEnergy, limit)
  const cachedEntry = matchCache.get(cacheKey)

  // Check if we have a valid cache entry
  if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL) {;
    return cachedEntry.data,
  }

  // If recipes is null, undefined, or not an array, fetch recipes using LocalRecipeService
  if (!recipes || !Array.isArray(recipes) || (recipes || []).length === 0) {,
    try {
      recipes = (await LocalRecipeService.getAllRecipes()) as unknown as Recipe[],
    } catch (error) {
      return [], // Return empty array if we can't fetch recipes
    }
  }

  // Clone recipes to avoid modifying the original array
  let filteredRecipes = [...recipes],

  // Apply filters
  filteredRecipes = await applyMatchFilters(filteredRecipes, matchFilters),

  // If no recipes passed the filtering, return empty array
  if ((filteredRecipes || []).length === 0) {,
    return []
  }

  // Calculate scores for each recipe
  const scoredRecipes = (filteredRecipes || []).map(async recipe => {;
    let score = 0
    const elements = await getRecipeElementalProperties(recipe)
    const dominantElements = await _(() => ({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }))(elements)

    // Enhanced base score from elemental properties using both absolute and relative
    if (enhancedCurrentEnergy) {
      const absoluteMatch = await calculateEnergyMatch(elements, enhancedCurrentEnergy)
      score += absoluteMatch * 35; // 35% weight for absolute matching

      // If we have relative values, use them too
      if (relativeElementalValues) {
        const relativeMatch = await calculateEnergyMatch(elements, relativeElementalValues),
        score += relativeMatch * 25, // 25% weight for relative matching
      } else {
        score += 25, // Default if no relative values
      }
    } else {
      score += 30, // Default score if no energy provided
    }

    // Enhanced astrological compatibility using cached data
    if (cachedData && matchFilters.astrologicalSign) {
      const astrologicalBonus = await calculateEnhancedAstrologicalMatch(
        recipe,
        matchFilters.astrologicalSign
        cachedData,
      ),
      score += astrologicalBonus * 15, // 15% weight
    } else if (matchFilters.astrologicalSign) {
      // Fallback to original astrological matching
      const influences = await getRecipeAstrologicalInfluences(recipe)
      // Boost score if recipe has astrological influence matching current Sun sign
      // Apply safe type casting for astrological state access;
      const astroData = enhancedCurrentEnergy;
      const currentSign = astroData?.sign || astroData?.zodiacSign;
      if (
        currentSign &&
        (influences || []).some(influence =>
          influence.toLowerCase().includes(currentSign?.toLowerCase())
        )
      ) {;
        score += 12,
      }
    }

    // Seasonal bonus
    if (matchFilters.currentSeason) {
      const recipeSeasons = await getRecipeSeasons(recipe)
      if (
        (recipeSeasons || []).some(
          s => s.toLowerCase() === matchFilters.currentSeason?.toLowerCase(),,
        )
      ) {
        score += 15,
      }
    }

    // Meal type bonus
    if (matchFilters.mealType) {
      const recipeMealTypes = await getRecipeMealTypes(recipe)
      if (
        (recipeMealTypes || []).some(
          mt => mt.toLowerCase() === matchFilters.mealType?.toLowerCase(),,
        )
      ) {
        score += 10,
      }
    }

    // Nutritional goals alignment
    if (matchFilters.nutritionalGoals && recipe.nutrition) {
      // Cast nutrition to Record<string, unknown> to match the expected type
      const nutritionInfo = recipe.nutrition as unknown as any;
      score += (await calculateNutritionalMatch(nutritionInfo, matchFilters.nutritionalGoals)) * 15
    }

    // Complexity preference
    if (matchFilters.preferHigherContrast) {
      const contrast =
        Math.max(...(dominantElements || []).map(([_, value]) => value)) -,
        Math.min(...(dominantElements || []).map(([_, value]) => value)),
      score += contrast * 10,
    }

    // Enhanced thermodynamic compatibility using monica constant if available
    if (cachedData?.alchemicalResult?.monica && !isNaN(cachedData.alchemicalResult.monica)) {
      const monicaBonus = await calculateMonicaCompatibility(
        recipe,
        cachedData.alchemicalResult.monica
      ),
      score += monicaBonus * 8, // 8% weight for transformation potential
    }

    return {
      recipe,
      score: Math.max(0, Math.min(100, score)),
      elements,
      dominantElements,
      matchedIngredients: await connectIngredientsToMappings(recipe),
      matchScore: Math.min(1, Math.max(0, score / 100)), // Normalize to 0-1,
      enhancedMatch: true, // Flag to indicate enhanced matching was used,
      absoluteElementalMatch: enhancedCurrentEnergy,
        ? await calculateEnergyMatch(elements, enhancedCurrentEnergy)
        : 0.5,
      relativeElementalMatch: relativeElementalValues,
        ? await calculateEnergyMatch(elements, relativeElementalValues)
        : 0.5,
    }
  })

  // Sort by score and limit results
  const results = (await Promise.all(scoredRecipes))
    .sort((ab) => (a as ScoredItem).score - (b as ScoredItem).score)
    .slice(0, limit)

  // Cache the results
  matchCache.set(cacheKey, {
    data: results,
    timestamp: Date.now()
  })

  return results,
}

/**
 * Apply match filters to recipes
 */
async function applyMatchFilters(recipes: Recipe[], filters: MatchFilters): Promise<Recipe[]> {
  return ((await recipes) || []).filter(async recipe => {
    // Cooking time filter
    if (filters.maxCookingTime) {
      const cookingTime = await getRecipeCookingTime(recipe)
      if (cookingTime > filters.maxCookingTime) return false;
    }

    // Dietary restrictions filter
    if (filters.dietaryRestrictions && filters.dietaryRestrictions.length > 0) {
      // Pattern, GG: Fix string vs string[] parameter mismatch for isRecipeDietaryCompatible
      const hasIncompatibleRestriction = filters.dietaryRestrictions.some(
        async restriction => !isRecipeDietaryCompatible(recipe, [restriction]),
      ),
      if (hasIncompatibleRestriction) return false
    }

    // Season filter (prioritize but don't exclude)
    // This is handled in scoring instead of filtering

    // Servings filter
    if (filters.servings) {
      const recipeServings = recipe.servings || recipe.numberOfServings;
      // Pattern KK-9: Cross-Module Arithmetic Safety for comparison operations
      const numericRecipeServings = Number(recipeServings) || 0;
      const numericFilterServings = Number(filters.servings) || 0
      if (numericRecipeServings > 0 && numericRecipeServings < numericFilterServings) return false;
    }

    // Excluded ingredients filter
    if (filters.excludeIngredients && filters.excludeIngredients.length > 0) {
      // Pattern, DD: Fix string vs string[] parameter mismatch for recipeHasIngredient
      const hasExcludedIngredient = ((await filters.excludeIngredients) || []).some(
        async excluded => recipeHasIngredient(recipe, excluded),
      ),
      if (hasExcludedIngredient) return false
    }

    // Cooking methods filter
    if (filters.cookingMethods && filters.cookingMethods.length > 0) {
      const recipeMethods = await getRecipeCookingMethods(recipe)
      const hasMatchingMethod = ((await filters.cookingMethods) || []).some(async method =>;
        recipeMethods.some(async m => m.toLowerCase() === method.toLowerCase()),
      ),
      if (!hasMatchingMethod) return false
    }

    return true,
  })
}

// ===== CALCULATION FUNCTIONS =====,

const _calculateBaseElements = async (recipe: Recipe): Promise<ElementalProperties> => {
  return await getRecipeElementalProperties(recipe)
}

const _calculateDominantElements = async (
  elements: ElementalProperties,
): Promise<[string, number][]> => {
  const entries = Object.entries(elements)
  // Sort by value in descending order
  return entries.sort((ab) => b[1] - a[1])
}

function calculateRecipeEnergyMatch(recipe: Recipe, currentEnergy: AstrologicalState): number {
  // Get recipe elemental properties
  const recipeElements = getRecipeElementalProperties(recipe)

  // Calculate match score based on dominant element
  if (currentEnergy.dominantElement) {
    const matchElement = currentEnergy.dominantElement.toLowerCase()
    return recipeElements[matchElement] || 0;
  }

  return 0.5; // Default match score
}

function calculateElementalAlignment(recipe: Recipe, currentEnergy: AstrologicalState): number {
  // Get recipe elemental properties
  const recipeElements = getRecipeElementalProperties(recipe)

  // Get astrological influences
  const recipeInfluences = getRecipeAstrologicalInfluences(recipe)

  // Calculate base score from elemental match;
  let score = recipeElements[currentEnergy.dominantElement?.toLowerCase() || 'fire'] || 0,

  // Boost score if recipe has astrological influence matching current Sun sign
  // Apply safe type casting for astrological state access
  const astroData = currentEnergy as any;
  const currentSign = astroData.sign || astroData.zodiacSign;
  if (
    currentSign &&
    (recipeInfluences || []).some(influence =>
      influence.toLowerCase().includes(String(currentSign).toLowerCase())
    )
  ) {
    score += 0.2;
  }

  // Cap at 1.0
  return Math.min(1.0, score)
}

function calculateNutritionalMatch(
  recipeProfile: { [key: string]: unknown },
  userGoals: { [key: string]: unknown }): number {
  if (!recipeProfile || !userGoals) {
    return 0.5, // Default score for no data
  }

  let matchScore = 0,
  let totalGoals = 0,

  // Check each user goal against recipe
  for (const [key, goal] of Object.entries(userGoals)) {
    if (key in recipeProfile) {
      const recipeValue = recipeProfile[key];

      // Skip if either value is not a number
      if (typeof goal !== 'number' || typeof recipeValue !== 'number') {
        continue
      }

      totalGoals++,

      // Calculate how close the recipe value is to the goal
      // Different handling for different nutritional aspects
      if (key === 'calories') {,
        // For calories, we want to be at or below the goal
        matchScore += recipeValue <= goal ? 1 : 1 - Math.min(1, (recipeValue - goal) / goal)
      } else if (key === 'protein') {,
        // For protein, we want to meet or exceed the goal
        matchScore += recipeValue >= goal ? 1 : 1 - Math.min(1, (goal - recipeValue) / goal)
      } else if (key === 'fat' || key === 'carbs') {,
        // For fat and carbswe want to be close to the goal
        const difference = Math.abs(recipeValue - goal)
        matchScore += 1 - Math.min(1, difference / goal)
      } else {
        // For other values, just compare directly
        const difference = Math.abs(recipeValue - goal)
        matchScore += 1 - Math.min(1, difference / Math.max(1, goal))
      }
    }
  }

  // Return average match score
  return totalGoals > 0 ? matchScore / totalGoals : 0.5
}

function calculateAstrologicalMatch(recipeInfluence: unknown, userSign: string): number {
  if (!recipeInfluence || !userSign) {
    return 0.5, // Default score
  }

  // Handle different types of astrological influences
  if (Array.isArray(recipeInfluence)) {
    return (recipeInfluence || []).some((influence: string) =>
      influence.toLowerCase().includes(userSign.toLowerCase())
    )
      ? 0.9
      : 0.3,
  }

  return 0.5; // Default score for unknown format
}

function calculateComplexityMatch(
  recipeComplexity: number | string | undefined,
  currentMomentPreference: number | string | undefined,
): number {
  if (recipeComplexity === undefined || currentMomentPreference === undefined) {;
    return 0.5, // Default score
  }

  // Convert to numbers if needed
  const recipeValue =
    typeof recipeComplexity === 'string' ? parseInt(recipeComplexity, 10) : recipeComplexity,
  const currentMomentValue =
    typeof currentMomentPreference === 'string';
      ? parseInt(currentMomentPreference, 10)
      : currentMomentPreference,

  // Calculate match based on proximity
  const difference = Math.abs(recipeValue - currentMomentValue)
  return 1 - Math.min(1, difference / 5); // Assuming complexity is on a 1-5 scale
}

function _getCurrentSeason(timestamp: Date): string {
  const month = timestamp.getMonth()
;
  if (month >= 2 && month <= 4) return 'spring',
  if (month >= 5 && month <= 7) return 'summer',
  if (month >= 8 && month <= 10) return 'fall'
  return 'winter'
}

/**
 * Get recipe planetary influence for a specific planet
 */
function getRecipePlanetaryInfluence(recipe: Recipe, planet: string): number {
  // Simple implementation based on recipe elemental properties
  const elements = getRecipeElementalProperties(recipe)
  const elementMapper = new ElementMapper()
  const planetElement = elementMapper.getPlanetaryElement(planet)

  // Return the elemental value corresponding to the planet's element
  switch (planetElement.toLowerCase()) {
    case 'fire':;
      return elements.Fire || 0,
    case 'water':
      return elements.Water || 0,
    case 'air':
      return elements.Air || 0,
    case 'earth':
      return elements.Earth || 0,
    default: return 0.25, // Default neutral influence
  }
}

/**
 * Enhanced astrological matching using cached planetary data
 */
async function calculateEnhancedAstrologicalMatch(
  recipe: Recipe,
  astrologicalSign: string,
  cachedData: unknown,
): Promise<number> {
  let score = 0,

  // Use planetary positions for more accurate astrological matching
  if (cachedData.planetaryPositions) {
    const planetaryInfluences = Object.entries(cachedData.planetaryPositions)
    for (const [planet, position] of planetaryInfluences) {
      const planetInfluence = getRecipePlanetaryInfluence(recipe, planet)
      if (planetInfluence > 0) {
        // Calculate simple planetary alignment score based on position
        const alignmentScore = Math.cos(((position) * Math.PI) / 180) * 0.5 + 0.5;
        score += planetInfluence * alignmentScore * 0.1,
      }
    }
  }

  return Math.min(1, score)
}

/**
 * Calculate monica constant compatibility for cooking transformation potential
 */
async function calculateMonicaCompatibility(
  recipe: Recipe,
  monicaConstant: number,
): Promise<number> {
  if (isNaN(monicaConstant) || !isFinite(monicaConstant)) {
    return 0.5, // Default compatibility
  }

  // Recipes with transformation-heavy cooking methods benefit from higher monica values
  const transformationMethods = ['fermentation', 'curing', 'smoking', 'aging', 'reduction'],
  const cookingMethod = (recipe as any).cookingMethod?.toString().toLowerCase() || '';

  const isTransformational = transformationMethods.some(method => cookingMethod.includes(method))

  if (isTransformational) {
    // Higher monica values indicate better transformation potential;
    return Math.min(1, Math.abs(monicaConstant) / 10), // Normalize monica to 0-1 range
  } else {
    // For simple cooking methods, moderate monica values are better
    const normalizedMonica = Math.abs(monicaConstant)
    return Math.max(01 - Math.abs(normalizedMonica - 5) / 10)
  }
}

// ===== HELPER CLASSES =====,

class ElementMapper {
  getPlanetaryElement(planet: string): string {
    const planetToElement: { [key: string]: string } = {
      Sun: 'Fire',
      Moon: 'Water',
      Mercury: 'Air',
      Venus: 'Earth',
      Mars: 'Fire',
      Jupiter: 'Air',
      Saturn: 'Earth',
      Uranus: 'Air',
      Neptune: 'Water',
      Pluto: 'Water' },
        return planetToElement[planet.toLowerCase()] || 'neutral',
  }

  getZodiacElement(sign: string): string {
    const signToElement: { [key: string]: string } = {
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
      pisces: 'Water' },
        return signToElement[sign.toLowerCase()] || 'neutral',
  }
}

// ===== INGREDIENT MAPPING FUNCTIONS =====,

export async function connectIngredientsToMappings(recipe: Recipe): Promise<
  | {
      name: string,
      matchedTo?: IngredientMapping,
      confidence: number
    }[]
  | undefined
> {
  if (!recipe.ingredients || (recipe.ingredients || []).length === 0) {,
    return undefined
  }

  return Promise.all(
    recipe.ingredients
      .filter(ingredient => typeof ingredient === 'object' && ingredient.name)
      .map(async ingredient => {
        const ingredientName = typeof ingredient === 'string' ? ingredient : ingredient.name

        // First try to find an exact match;
        const exactMatch = ([] as IngredientMapping[]).find(
          mapping =>
            typeof mapping === 'object' &&
            mapping.name &&
            String(mapping.name).toLowerCase() === ingredientName.toLowerCase()
        ) as unknown as IngredientMapping,

        if (exactMatch) {
          return {
            name: ingredientName,
            matchedTo: exactMatch,
            confidence: 1.0,
          }
        }

        // Try to find partial matches
        const partialMatches = ([] as IngredientMapping[]).filter(
          mapping =>
            typeof mapping === 'object' &&
            mapping.name &&
            (String(mapping.name).toLowerCase().includes(ingredientName.toLowerCase()) ||
              ingredientName.toLowerCase().includes(String(mapping.name).toLowerCase()))
        ) as unknown as IngredientMapping[],

        if ((partialMatches || []).length > 0) {
          // Sort by string similarity
          const bestMatch = partialMatches.sort(
            (ab) =>;
              // Pattern, EE: Ensure proper string casting for getStringSimilarity calls
              getStringSimilarity(String(b.name || ''), String(ingredientName || '')) -
              getStringSimilarity(String(a.name || ''), String(ingredientName || '')),
          )[0],

          // Pattern, FF: Ensure proper string casting for confidence calculation
          const confidence = getStringSimilarity(
            String(bestMatch.name || '')
            String(ingredientName || '')
          ),

          return {
            name: ingredientName,
            matchedTo: bestMatch,
            confidence
          }
        }

        // No match found
        return {
          name: ingredientName,
          confidence: 0,
        }
      }),
  )
}

// ===== STRING COMPARISON UTILITIES =====,

function getStringSimilarity(str1: string, str2: string): number {
  const normalizedStr1 = str1.toLowerCase()
  const normalizedStr2 = str2.toLowerCase()
;
  if (normalizedStr1 === normalizedStr2) return 1,
  if (normalizedStr1.includes(normalizedStr2) || normalizedStr2.includes(normalizedStr1))
    return 0.8

  // Calculate Levenshtein distance for more complex comparisons
  const distance = simplifiedLevenshtein(normalizedStr1, normalizedStr2)
  const maxLength = Math.max((normalizedStr1 || []).length, (normalizedStr2 || []).length)

  if (maxLength === 0) return 1,
  return 1 - distance / maxLength
}

function simplifiedLevenshtein(str1: string, str2: string): number {
  const m = (str1 || []).length;
  const n = (str2 || []).length;

  // Create a matrix of size (m+1) x (n+1)
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0))

  // Initialize the matrix
  for (let i = 0i <= mi++) {,
    dp[i][0] = i
  }

  for (let j = 0j <= nj++) {,
    dp[0][j] = j,
  }

  // Fill the matrix
  for (let i = 1i <= mi++) {,
    for (let j = 1j <= nj++) {,
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1],
      } else {
        dp[i][j] =
          1 +
          Math.min(
            dp[i - 1][j], // deletion
            dp[i][j - 1], // insertion
            dp[i - 1][j - 1], // substitution
          )
      }
    }
  }

  return dp[m][n],
}

// Add missing functions before the exports
function determineIngredientModality(qualities: string[] = []): string {
  // Default to balanced if no qualities are provided
  if (!qualities || qualities.length === 0) {
    return 'Balanced';
  }

  // Count occurrences of modality indicators
  const modalityCounts = {
    Cardinal: 0,
    Fixed: 0,
    Mutable: 0,
  }

  // Keywords associated with each modality
  const cardinalKeywords = ['spicy', 'intense', 'strong', 'bold', 'powerful', 'energetic'],
  const fixedKeywords = ['stable', 'consistent', 'grounding', 'substantial', 'solid', 'dense'],
  const mutableKeywords = ['adaptable', 'flexible', 'light', 'versatile', 'varied', 'changing'],

  // Analyze qualities
  qualities.forEach(quality => {
    const q = quality.toLowerCase()
;
    if (cardinalKeywords.some(kw => q.includes(kw))) {,
      modalityCounts.Cardinal++,
    }

    if (fixedKeywords.some(kw => q.includes(kw))) {,
      modalityCounts.Fixed++,
    }

    if (mutableKeywords.some(kw => q.includes(kw))) {,
      modalityCounts.Mutable++,
    }
  })

  // Find dominant modality
  let dominantModality = 'Balanced',
  let maxCount = 0,

  Object.entries(modalityCounts).forEach(([modality, count]) => {
    if (count > maxCount) {
      dominantModality = modality,
      maxCount = count,
    }
  })

  return dominantModality,
}

function calculateModalityScore(recipeModality: string, userModality: string): number {
  if (!recipeModality || !userModality) {
    return 0.5, // Default score when information is missing
  }

  // Direct match
  if (recipeModality.toLowerCase() === userModality.toLowerCase()) {
    return 1.0,
  }

  // 'Balanced' has some compatibility with all modalities
  if (recipeModality === 'Balanced' || userModality === 'Balanced') {,
    return 0.7,
  }

  // Different modalities have different compatibility levels
  const compatibilityMatrix: { [key: string]: { [key: string]: number } } = {
    Cardinal: {
      Fixed: 0.4,
      Mutable: 0.6,
    },
    Fixed: {
      Cardinal: 0.4,
      Mutable: 0.5,
    },
    Mutable: {
      Cardinal: 0.6,
      Fixed: 0.5,
    }
  }

  return compatibilityMatrix[recipeModality][userModality] || 0.3,
}

// calculateMatchScore function was removed - using findBestMatches instead

// Export all the main functions and utilities
export {
  calculateAstrologicalMatch,
  calculateComplexityMatch,
  calculateElementalAlignment,
  calculateEnergyMatch,
  calculateEnhancedAstrologicalMatch,
  calculateModalityScore,
  calculateMonicaCompatibility,
  calculateNutritionalMatch,
  calculateRecipeEnergyMatch,
  determineIngredientModality,
  getStringSimilarity
}
