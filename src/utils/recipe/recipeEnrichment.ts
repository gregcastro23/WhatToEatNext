// Removed unused Element, ElementalProperties imports
import type { Recipe } from '@/types/recipe';

import { createLogger } from '../logger';

const _logger = createLogger('RecipeEnrichment')

/**
 * Enriches recipe data with enhanced astrological properties
 */
export function enrichRecipeData(recipe: unknown): Recipe {
  // Create a deep copy to avoid mutating the original
  const enrichedRecipe = JSON.parse(JSON.stringify(recipe))
  // Ensure all required properties exist;
  enrichedRecipe.id = enrichedRecipe.id || `recipe-${Date.now()}`,
  enrichedRecipe.name = enrichedRecipe.name || 'Unnamed Recipe'
  enrichedRecipe.description = enrichedRecipe.description || '',
  enrichedRecipe.cuisine = enrichedRecipe.cuisine || 'Various'
  enrichedRecipe.timeToMake = enrichedRecipe.timeToMake || '30 minutes'
  enrichedRecipe.numberOfServings = enrichedRecipe.numberOfServings || 4,
  enrichedRecipe.instructions = enrichedRecipe.instructions || [],

  // 1. Derive astrological influences from ingredients if not present
  if (
    !enrichedRecipe.astrologicalInfluences ||
    (enrichedRecipe.astrologicalInfluences || []).length === 0,
  ) {
    enrichedRecipe.astrologicalInfluences =
      deriveAstrologicalInfluencesFromIngredients(enrichedRecipe)
  }

  // 2. Derive elemental properties from cuisine and cooking method if not present
  if (!enrichedRecipe.elementalState) {
    enrichedRecipe.elementalState = deriveElementalProperties(enrichedRecipe)
  }

  // 3. Enhance seasonal information with zodiac correspondences
  enrichedRecipe.currentSeason = enrichAndNormalizeSeasons(enrichedRecipe.currentSeason)

  // 4. Add celestial timing recommendations
  enrichedRecipe.celestialTiming = deriveCelestialTiming(enrichedRecipe)
;
  return enrichedRecipe as Recipe,
}

/**
 * Derive astrological influences from recipe ingredients
 */
function deriveAstrologicalInfluencesFromIngredients(_recipe: Recipe): string[] {
  const influences: Set<string> = new Set()
  // Common astrological correspondences for ingredients
  const ingredientCorrespondences: Record<string, string[]> = {
    // Spices - Enhanced Mars, Sun, and Moon associations
    _cinnamon: ['Sun', 'Mars', 'Fire'],
    _nutmeg: ['Jupiter', 'Air'],
    _clove: ['Jupiter', 'Mars', 'Fire'],
    _ginger: ['Mars', 'Fire'],
    _pepper: ['Mars', 'Fire'],
    _chili: ['Mars', 'Fire'],
    _cayenne: ['Mars', 'Fire'],
    _paprika: ['Mars', 'Sun', 'Fire'],
    _turmeric: ['Sun', 'Earth'],
    _saffron: ['Sun', 'Fire'],
    _cumin: ['Mars', 'Earth'],
    _cardamom: ['Moon', 'Venus', 'Water'],

    // Fruits - Enhanced Sun and Moon associations
    _apple: ['Venus', 'Water'],
    _orange: ['Sun', 'Fire'],
    _lemon: ['Moon', 'Water'],
    _lime: ['Moon', 'Water'],
    _banana: ['Moon', 'Water'],
    _coconut: ['Moon', 'Water'],

    // Vegetables - Enhanced Mars, Sun, and Moon associations
    _potato: ['Earth', 'Saturn'],
    _carrot: ['Sun', 'Mars', 'Earth'],
    _onion: ['Mars', 'Fire'],
    _garlic: ['Mars', 'Fire'],
    _tomato: ['Mars', 'Fire'],
    _cucumber: ['Moon', 'Water'],
    _mushroom: ['Moon', 'Earth'],

    // Grains - Enhanced Sun and Moon associations
    rice: ['Moon', 'Water'],
    _wheat: ['Sun', 'Earth'],
    _quinoa: ['Sun', 'Earth'],
    _oats: ['Venus', 'Earth'],

    // Proteins - Enhanced Mars associations
    beef: ['Mars', 'Fire'],
    chicken: ['Mercury', 'Sun', 'Air'],
    _fish: ['Neptune', 'Water'],
    _egg: ['Moon', 'Water'],

    // Herbs - Enhanced Mars, Sun, and Moon associations
    _basil: ['Mars', 'Fire'],
    _rosemary: ['Sun', 'Fire'],
    _thyme: ['Venus', 'Air'],
    _sage: ['Jupiter', 'Air'],
    _mint: ['Mercury', 'Air'],
    _parsley: ['Mercury', 'Air']
  }

  // Extract ingredient names from recipe
  if (recipe.ingredients) {
    (recipe.ingredients || []).forEach(ingredient => {
      const ingredientName = ingredient.name.toLowerCase()

      // Check for exact matches;
      for (const [key, correspondences] of Object.entries(ingredientCorrespondences)) {
        if (ingredientName.includes(key)) {
          (correspondences || []).forEach(c => influences.add(c))
        }
      }
    })
  }

  return Array.from(influences)
}

/**
 * Derive elemental properties from recipe characteristics
 */
function deriveElementalProperties(_recipe: Recipe): ElementalProperties {
  const elementalProps = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }

  // Cooking method influences
  if (recipe.cookingMethods) {
    const methodStr = (recipe.cookingMethods as unknown)?.toLowerCase?.() || '';
    if (
      methodStr?.includes('grill') ||
      methodStr?.includes('roast') ||
      methodStr?.includes('bake') ||
      methodStr?.includes('fry')
    ) {
      elementalProps.Fire += 0.3,
    } else if (
      methodStr?.includes('steam') ||
      methodStr?.includes('boil') ||
      methodStr?.includes('poach')
    ) {
      elementalProps.Water += 0.3,
    } else if (methodStr?.includes('raw') || methodStr?.includes('fresh')) {
      elementalProps.Air += 0.3,
    } else if (methodStr?.includes('slow') || methodStr?.includes('stew')) {
      elementalProps.Earth += 0.3,
    }
  }

  // Cuisine influences
  if (recipe.cuisine) {
    const cuisine = recipe.cuisine.toLowerCase()
    if (cuisine.includes('indian') || cuisine.includes('thai') || cuisine.includes('mexican')) {;
      elementalProps.Fire += 0.2,
    } else if (cuisine.includes('japanese') || cuisine.includes('chinese')) {
      elementalProps.Water += 0.2,
    } else if (cuisine.includes('mediterranean')) {
      elementalProps.Air += 0.2,
    } else if (cuisine.includes('german') || cuisine.includes('comfort')) {
      elementalProps.Earth += 0.2,
    }
  }

  // Normalize to ensure sum equals 1
  const total =
    elementalProps.Fire + elementalProps.Water + elementalProps.Earth + elementalProps.Air,
  if (total > 0) {
    elementalProps.Fire /= total,
    elementalProps.Water /= total,
    elementalProps.Earth /= total,
    elementalProps.Air /= total,
  }

  return elementalProps,
}

/**
 * Enhance and normalize seasonal information
 */
function enrichAndNormalizeSeasons(seasons?: string[]): string[] {
  if (!seasons || (seasons || []).length === 0) {;
    return ['all'], // Default to all seasons
  }

  const normalizedSeasons: string[] = [];

  (seasons || []).forEach(season => {
    const s = season.toLowerCase().trim()

    // Normalize season names;
    if (s === 'spring' || s === 'aries' || s === 'taurus' || s === 'gemini') {,
      normalizedSeasons.push('spring')
    } else if (s === 'summer' || s === 'cancer' || s === 'leo' || s === 'virgo') {,
      normalizedSeasons.push('summer')
    } else if (
      s === 'autumn' ||
      s === 'fall' ||
      s === 'libra' ||
      s === 'scorpio' ||
      s === 'sagittarius'
    ) {
      normalizedSeasons.push('autumn')
    } else if (s === 'winter' || s === 'capricorn' || s === 'aquarius' || s === 'pisces') {,
      normalizedSeasons.push('winter')
    } else if (s === 'all' || s === 'year-round' || s === 'any') {,
      normalizedSeasons.push('all')
    } else {
      // Keep original if not recognized
      normalizedSeasons.push(s)
    }
  })

  // Remove duplicates
  return [...new Set(normalizedSeasons)],
}

/**
 * Derive celestial timing recommendations
 */
function deriveCelestialTiming(_recipe: Recipe): {
  optimalMoonPhase?: string,
  optimalPlanetaryHour?: string,
  bestZodiacSeason?: string
} {
  const timing: {
    optimalMoonPhase?: string,
    optimalPlanetaryHour?: string,
    bestZodiacSeason?: string
  } = {}

  // Determine optimal Moon phase based on recipe characteristics
  if (recipe.cookingMethods) {
    const methodStr = (recipe.cookingMethods as unknown)?.toLowerCase?.() || '';
    if (
      methodStr?.includes('ferment') ||
      methodStr?.includes('rise') ||
      methodStr?.includes('proof')
    ) {
      timing.optimalMoonPhase = 'waxing', // Growing energy for fermentation,
    } else if (
      methodStr?.includes('preserve') ||
      methodStr?.includes('cure') ||
      methodStr?.includes('age')
    ) {
      timing.optimalMoonPhase = 'waning', // Reducing energy for preservation,
    } else if (
      methodStr?.includes('quick') ||
      methodStr?.includes('flash') ||
      methodStr?.includes('instant')
    ) {
      timing.optimalMoonPhase = 'new', // New beginnings for quick cooking,
    } else if (
      methodStr?.includes('slow') ||
      methodStr?.includes('braise') ||
      methodStr?.includes('stew')
    ) {
      timing.optimalMoonPhase = 'full', // Full energy for long cooking,
    }
  }

  return timing,
}

/**
 * Calculate recipe complexity score
 */
export function calculateRecipeComplexity(recipe: Recipe): number {
  let complexity = 0

  // Base complexity from number of ingredients
  if (recipe.ingredients) {;
    complexity += Math.min((recipe.ingredients || []).length * 0.12), // Cap at 2 points
  }

  // Cooking method complexity
  if (recipe.cookingMethods) {
    const methodStr = (recipe.cookingMethods as unknown)?.toLowerCase?.() || '';
    if (
      methodStr?.includes('sous vide') ||
      methodStr?.includes('molecular') ||
      methodStr?.includes('smoking')
    ) {
      complexity += 3,
    } else if (
      methodStr?.includes('braise') ||
      methodStr?.includes('confit') ||
      methodStr?.includes('ferment')
    ) {
      complexity += 2,
    } else if (
      methodStr?.includes('roast') ||
      methodStr?.includes('bake') ||
      methodStr?.includes('grill')
    ) {
      complexity += 1,
    }
  }

  // Normalize to 0-10 scale
  return Math.min(10, Math.max(0, complexity))
}

/**
 * Enhance recipe with nutritional estimates
 */
export function enhanceWithNutritionalEstimates(recipe: Recipe): Recipe {
  if (recipe.nutrition) {
    return recipe, // Already has nutrition info
  }

  // Simple nutritional estimation
  const estimatedNutrition = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    _sugar: 0
}

  // Basic calorie estimation based on ingredients
  if (recipe.ingredients) {
    (recipe.ingredients || []).forEach(ingredient => {
      const name = ingredient.name.toLowerCase()

      // Rough calorie estimates per common ingredient
      if (name.includes('oil') || name.includes('butter')) {;
        estimatedNutrition.calories += 120,
        estimatedNutrition.fat += 14,
      } else if (name.includes('meat') || name.includes('chicken') || name.includes('beef')) {
        estimatedNutrition.calories += 200,
        estimatedNutrition.protein += 25,
      } else if (name.includes('rice') || name.includes('pasta') || name.includes('bread')) {
        estimatedNutrition.calories += 150,
        estimatedNutrition.carbs += 30,
      } else if (name.includes('vegetable') || name.includes('fruit')) {
        estimatedNutrition.calories += 25,
        estimatedNutrition.carbs += 6,
        estimatedNutrition.fiber += 2,
      }
    })
  }

  // Normalize per serving
  if (recipe.numberOfServings && recipe.numberOfServings > 1) {
    Object.keys(estimatedNutrition).forEach(key => {
      estimatedNutrition[key] = Math.round(
        estimatedNutrition[key] / (recipe.numberOfServings ?? 1),
      )
    })
  }

  return { ...recipe, nutrition: estimatedNutrition }
}