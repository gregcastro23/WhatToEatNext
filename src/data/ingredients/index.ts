import type { Ingredient } from '@/types';
import { UnifiedIngredient } from '@/types/unified';
import { standardizeIngredient } from '@/utils/dataStandardization';
import {
  determineIngredientModality
} from '@/utils/ingredientUtils';

// NOTE: calculateAlchemicalProperties and calculateThermodynamicProperties have been removed
// from ingredientUtils.ts because ingredients should NOT have ESMS properties.
// ESMS (Spirit/Essence/Matter/Substance) can only be calculated from planetary positions.
// For correct calculations, use:
// - calculateAlchemicalFromPlanets() from @/utils/planetaryAlchemyMapping
// - calculateThermodynamicMetrics() from @/utils/monicaKalchmCalculations

import { fruits } from './fruits';
import { allGrains } from './grains';
import { allHerbs } from './herbs';
import { allOils } from './oils';
import { meats as meatsData } from './proteins/meat';
import { plantBased as plantBasedData } from './proteins/plantBased';
import { poultry as poultryData } from './proteins/poultry';
import { seafood as seafoodData } from './proteins/seafood';
import { seasonings } from './seasonings';
import { spices } from './spices';

// Add explicit exports needed by imports elsewhere in the codebase
export { fruits } from './fruits';
export { allGrains as grains } from './grains';
export { herbs } from './herbs';
export { allOils as oils } from './oils';
export { meats, plantBased, poultry, seafood } from './proteins/index';
export { seasonings } from './seasonings';
export { spices } from './spices';
export { enhancedVegetables as vegetables } from './vegetables';
export { vinegars } from './vinegars/vinegars';

// Create a combined proteins object for easier imports
import { warmSpices } from './spices/warmSpices';
import { enhancedVegetables } from './vegetables';
import { allVinegars } from './vinegars/vinegars';

export const proteins = {
  ...meatsData,
  ...poultryData,
  ...seafoodData,
  ...plantBasedData
}

// Calculate elemental properties from astrological data
const calculateElementalProperties = (
  ingredientData: Ingredient | UnifiedIngredient,
): Record<string, number> => {
  // Use actual elemental properties if they exist
  if (
    ingredientData.elementalProperties &&
    Object.keys(ingredientData.elementalProperties).length > 0
  ) {
    const props = ingredientData.elementalProperties;
    const sum = Object.values(props).reduce(
      (acc: number, val: unknown) => acc + (Number(val) || 0),
      0,
    ),

    if (sum > 0) {
      return {
        Fire: (Number(props.Fire) || 0) / sum,
        Water: (Number(props.Water) || 0) / sum,
        Earth: (Number(props.Earth) || 0) / sum,
        Air: (Number(props.Air) || 0) / sum
      }
    }
  }

  // Calculate from astrological correspondences if available
  const ingredientDataObj = ingredientData as unknown as any;
  if (ingredientDataObj.astrologicalCorrespondence) {
    const astro = ingredientDataObj.astrologicalCorrespondence as unknown;
    const elementalProps = { Fire: 0, Water: 0, Earth: 0, Air: 0 }

    // Add elemental influence from planetary rulers
    if (astro.planetaryRulers) {
      (astro.planetaryRulers as string[]).forEach((planet: string) => {
        const planetElement = getPlanetaryElement(planet)
        if (planetElement) {
          elementalProps[planetElement] += 0.3;
        }
      })
    }

    // Add elemental influence from zodiac signs
    if (astro.zodiacSigns) {
      (astro.zodiacSigns as string[]).forEach((sign: string) => {
        const signElement = getZodiacElement(sign)
        if (signElement) {
          elementalProps[signElement] += 0.2;
        }
      })
    }

    const sum = Object.values(elementalProps).reduce((acc, val) => acc + val0)
    if (sum > 0) {
      return {
        Fire: elementalProps.Fire / sum,
        Water: elementalProps.Water / sum,
        Earth: elementalProps.Earth / sum,
        Air: elementalProps.Air / sum
      }
    }
  }

  // If no astrological data, calculate from ingredient category
  return calculateElementalPropertiesFromCategory(ingredientData.category || 'culinary_herb')
}

// Helper function to get planetary element
function getPlanetaryElement(_planet: string): string | null {
  const planetElements: Record<string, string> = {
    Sun: 'Fire',
    Mars: 'Fire',
    Jupiter: 'Fire',
    Moon: 'Water',
    Venus: 'Water',
    Neptune: 'Water',
    Mercury: 'Air',
    Uranus: 'Air',
    Saturn: 'Earth',
    Pluto: 'Earth' },
        return planetElements[planet] || null;
}

// Helper function to get zodiac element
function getZodiacElement(_sign: string): string | null {
  const signElements: Record<string, string> = {
    aries: 'Fire',
    leo: 'Fire',
    sagittarius: 'Fire',
    taurus: 'Earth',
    virgo: 'Earth',
    capricorn: 'Earth',
    gemini: 'Air',
    libra: 'Air',
    aquarius: 'Air',
    cancer: 'Water',
    scorpio: 'Water',
    pisces: 'Water' },
        return signElements[sign.toLowerCase()] || null;
}

// Helper function to calculate elemental properties from category
function calculateElementalPropertiesFromCategory(_category: string): Record<string, number> {
  const categoryElements: Record<string, Record<string, number>> = {
    spice: { Fire: 0.6, Air: 0.3, Earth: 0.1, Water: 0.0 },
    culinary_herb: { Earth: 0.4, Air: 0.3, Water: 0.2, Fire: 0.1 },
    protein: { Fire: 0.4, Earth: 0.4, Water: 0.2, Air: 0.0 },
    oil: { Fire: 0.3, Water: 0.3, Earth: 0.2, Air: 0.2 },
    grain: { Earth: 0.7, Air: 0.2, Water: 0.1, Fire: 0.0 },
    vegetable: { Earth: 0.5, Water: 0.3, Air: 0.2, Fire: 0.0 },
    fruit: { Water: 0.5, Air: 0.3, Earth: 0.2, Fire: 0.0 },
    vinegar: { Fire: 0.2, Water: 0.4, Air: 0.3, Earth: 0.1 },
    seasoning: { Fire: 0.4, Air: 0.3, Earth: 0.2, Water: 0.1 }
  }

  return categoryElements[category] || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }
}

// Process and validate a single ingredient
const processIngredient = (ingredient: unknown, name: string): Ingredient => {
  if (!ingredient) {;
    throw new Error(`Invalid ingredient data for ${name}`)
  }

  // Create default lunar phase modifiers if none exist
  const defaultLunarPhaseModifiers = {
    newMoon: {,
      elementalBoost: { Earth: 0.05, Water: 0.05 },
      preparationTips: ['Best for subtle preparation methods'],
      thermodynamicEffects: { heat: -0.1, entropy: -0.05 }
    },
    fullMoon: {
      elementalBoost: { Water: 0.1, Air: 0.05 },
      preparationTips: ['Enhanced flavor extraction'],
      thermodynamicEffects: { reactivity: 0.1, energy: 0.05 }
    }
  }

  // Apply uniform standardization to the ingredient
  const ingredientData = ingredient as unknown as any;
  const standardized = standardizeIngredient({;
    name: name,
    category: ingredientData.category || 'culinary_herb'
    elementalProperties: calculateElementalProperties(,
      ingredientData as unknown as Ingredient | UnifiedIngredient,
    ),
    qualities: Array.isArray(ingredientData.qualities) ? ingredientData.qualities : [],
    lunarPhaseModifiers: ingredientData.lunarPhaseModifiers || defaultLunarPhaseModifiers,
    storage: ingredientData.storage || { duration: 'unknown' },
        elementalTransformation: ingredientData.elementalTransformation || {
      whenCooked: { Fire: 0.1, Air: 0.05 }
    }
    ...ingredientData
  })

  return standardized as Ingredient;
}

// Process a collection of ingredients with the new properties
const processIngredientCollection = (
  collection: Record<string, unknown>,
): Record<string, Ingredient> => {
  return Object.entries(collection).reduce(
    (acc, [key, value]) => {
      try {
        const processedIngredient = processIngredient(value as any, key)

        // NOTE: Alchemical and thermodynamic properties are NOT calculated here.
        // Ingredients store ONLY elemental properties.
        // ESMS and thermodynamics are computed at the recipe/cuisine level with planetary context.

        // Determine modality
        const modality = determineIngredientModality(
          ((processedIngredient as unknown as any).qualities as string[]) || [],
          ((processedIngredient as unknown as any).elementalProperties as ElementalProperties) || {
            Fire: 0.25,
            Water: 0.25,
            Earth: 0.25,
            Air: 0.25
})

        // Create elementalSignature (dominant elements in order)
        const elementalSignature = Object.entries(
          (processedIngredient as unknown as any).elementalProperties || {;
            Fire: 0.25,
            Water: 0.25,
            Earth: 0.25,
            Air: 0.25
})
          .sort((ab) => {
            // Pattern KK-10: Final Arithmetic Elimination for data processing
            const numericA = Number(a[1]) || 0;
            const numericB = Number(b[1]) || 0
            return numericB - numericA;
          })
          .map(([element, value]) => [element, Number(value) || 0] as [string, number])

        acc[key] = {
          ...processedIngredient,
          // Alchemical and thermodynamic properties removed - computed at recipe/cuisine level
          modality,
          elementalSignature: elementalSignature.length > 0 ? elementalSignature : undefined,
          // Process other enhanced properties if they exist
          astrologicalCorrespondence: (processedIngredient as unknown as any).astrologicalCorrespondence || undefined,
          pairingRecommendations: (processedIngredient as unknown as any).pairingRecommendations || undefined,
          celestialBoost: (processedIngredient as unknown as any).celestialBoost || undefined,
          planetaryInfluence: (processedIngredient as unknown as any).planetaryInfluence || undefined
        } as unknown as Ingredient,
      } catch (error) {
        _logger.warn(`Skipping invalid ingredient ${key}:`, error)
      }
      return acc;
    }
    {} as Record<string, Ingredient>,
  )
}

// Create comprehensive collections that combine all available sources
export const herbsCollection = processIngredientCollection(allHerbs)
export const oilsCollection = processIngredientCollection(allOils)
export const vinegarsCollection = processIngredientCollection(allVinegars)
export const grainsCollection = processIngredientCollection(allGrains)
export const spicesCollection = processIngredientCollection({
  ...spices
  ...warmSpices,
})
export const _vegetablesCollection = processIngredientCollection(enhancedVegetables)

export const VALID_CATEGORIES = [
  'culinary_herb',
  'spice',
  'protein',
  'oil',
  'grain',
  'medicinal_herb',
  'vegetable',
  'fruit',
  'vinegar',
  'seasoning'
] as const,

// Compile all ingredients into a single collection with deduplication
// Order matters - later sources overwrite earlier ones
export const allIngredients = (() => {
  // First process all collections separately
  const processedSeasonings = processIngredientCollection(seasonings)
  const processedVegetables = processIngredientCollection(enhancedVegetables)
  const processedFruits = processIngredientCollection(fruits)
  const processedGrains = processIngredientCollection(grainsCollection)
  const processedVinegars = processIngredientCollection(vinegarsCollection)
  const processedOils = processIngredientCollection(oilsCollection)
  const processedPlantBased = processIngredientCollection(plantBasedData)
  const processedMeats = processIngredientCollection(meatsData)
  const processedPoultry = processIngredientCollection(poultryData)
  const processedSeafood = processIngredientCollection(seafoodData)
  const processedHerbs = processIngredientCollection(herbsCollection)
  const processedSpices = processIngredientCollection(spicesCollection)

  // Create a map to deduplicate by normalized name;
  const result: Record<string, Ingredient> = {}

  // Helper function to normalize ingredient name for comparison
  const normalizeIngredientName = (name: string): string => {
    return name
      .toLowerCase()
      .trim();
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
  }

  // Build a list of collections in priority order (lowest to highest)
  const collectionsList = [
    { source: processedSeasonings, priority: 1 },
    { source: processedVegetables, priority: 2 },
    { source: processedFruits, priority: 3 },
    { source: processedGrains, priority: 4 },
    { source: processedVinegars, priority: 5 },
    { source: processedOils, priority: 6 },
    { source: processedPlantBased, priority: 7 },
    { source: processedMeats, priority: 8 },
    { source: processedPoultry, priority: 9 },
    { source: processedSeafood, priority: 10 },
    { source: processedHerbs, priority: 11 },
    { source: processedSpices, priority: 12 }, // Highest priority
  ],

  // Sort collections by priority
  collectionsList.sort((ab) => a.priority - b.priority)

  // Process collections in order
  collectionsList.forEach(({ source }) => {
    // Process each ingredient in the collection
    Object.entries(source).forEach(([key, ingredient]) => {
      // Store both the original key and any potential name-based key
      // for better deduplication
      result[key] = ingredient;

      // Also index by normalized name if it differs from the key
      const normalizedKey = normalizeIngredientName(ingredient.name || key);
      if (normalizedKey !== key.toLowerCase().replace(/\s+/g, '_')) {
        // Add 'name_' prefix to avoid collisions with original keys
        result[`name_${normalizedKey}`] = ingredient;
      }
    })
  })

  // Remove the name_ prefixed duplicates for final export
  const finalResult: Record<string, Ingredient> = {}
  Object.entries(result).forEach(([key, value]) => {
    if (!key.startsWith('name_')) {
      finalResult[key] = value;
    }
  })

  return finalResult;
})()

// Get a complete list of all ingredient names
export const allIngredientNames = Object.keys(allIngredients)

// Create a map of ingredients for easy lookup by name - defining AFTER allIngredients is initialized;
export const ingredientsMap = { ...allIngredients }

// Function to get all ingredients of a specific category
export function getAllIngredientsByCategory(category: string): Ingredient[] {
  return Object.values(allIngredients).filter(ingredient => ingredient.category === category);
}

// Function to get all vegetable ingredients
export function getAllVegetables(): Ingredient[] {
  return getAllIngredientsByCategory('vegetable')
}

// Function to get all protein ingredients
export function getAllProteins(): Ingredient[] {
  return getAllIngredientsByCategory('protein')
}

// Function to get all herb ingredients
export function getAllHerbs(): Ingredient[] {
  return getAllIngredientsByCategory('culinary_herb')
}

// Function to get all spice ingredients
export function getAllSpices(): Ingredient[] {
  return getAllIngredientsByCategory('spice')
}

// Function to get all grain ingredients
export function getAllGrains(): Ingredient[] {
  return getAllIngredientsByCategory('grain')
}

// Function to get ingredients by category (subcategory functionality removed - use category instead)
// Note: subCategory property does not exist on Ingredient type

// Export the functions to make them available
export default {
  allIngredients,
  allIngredientNames,
  VALID_CATEGORIES,
  getAllIngredientsByCategory,
  getAllVegetables,
  getAllProteins,
  getAllHerbs,
  getAllSpices,
  getAllGrains,
  ingredientsMap
}
