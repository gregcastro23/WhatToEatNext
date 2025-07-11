import { wholeGrains } from './grains/wholeGrains';
import { refinedGrains } from './grains/refinedGrains';
import { allGrains, grainNames } from './grains';
import { medicinalHerbs } from './herbs/medicinalHerbs';
import type { Ingredient } from '@/types/alchemy';
import { seafood , seafood as seafoodData } from './proteins/seafood';
import { poultry , poultry as poultryData } from './proteins/poultry';
import { plantBased , plantBased as plantBasedData } from './proteins/plantBased';
import { meats } from './proteins/meat';
import { herbs, allHerbs } from './herbs';
import { processedOils, allOils } from './oils';
import { spices } from './spices';
import { warmSpices } from './spices/warmSpices';
import { vinegars, allVinegars, artisanalVinegars } from './vinegars/vinegars';
import { french } from '@/data/cuisines/french';
import { italian } from '@/data/cuisines/italian';
import { middleEastern } from '@/data/cuisines/middle-eastern';
import { thai } from '@/data/cuisines/thai';
import {
  calculateAlchemicalProperties,
  calculateThermodynamicProperties,
  determineIngredientModality,
} from '@/utils/ingredientUtils';
import { fruits } from './fruits';
import { enhancedVegetables, standardizedVegetables } from './vegetables';
import { seasonings } from './seasonings';
import { fixIngredientMappings } from '@/utils/elementalUtils';

// Add explicit exports needed by imports elsewhere in the codebase
export { fruits } from './fruits';
export { enhancedVegetables as vegetables } from './vegetables';
export { herbs } from './herbs';
export { spices } from './spices';
export { allGrains as grains } from './grains';
export { allOils as oils } from './oils';
export { seasonings } from './seasonings';
export { vinegars } from './vinegars/vinegars';
export { meats, poultry, seafood, plantBased } from './proteins/index';

// Create a combined proteins object for easier imports
import { meats as meatsData } from './proteins/meat';

export const proteins = {
  ...meatsData,
  ...poultryData,
  ...seafoodData,
  ...plantBasedData
};

// Create comprehensive collections that combine all available sources
export const herbsCollection = allHerbs;
export const oilsCollection = allOils;
export const vinegarsCollection = allVinegars;
export const grainsCollection = allGrains;
export const spicesCollection = {
  ...spices,
  ...warmSpices,
};
export const vegetablesCollection = enhancedVegetables;

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
  'seasoning',
] as const;

// Default elemental properties
export const DEFAULT_ELEMENTAL_PROPERTIES = {
  Fire: 0.25,
  Water: 0.25,
  Earth: 0.25,
  Air: 0.25,
};

// Normalize elemental properties to sum to 1
const normalizeElementalProperties = (
  properties: Record<string, number>
): Record<string, number> => {
  if (!properties || Object.keys(properties).length === 0) {
    return { ...DEFAULT_ELEMENTAL_PROPERTIES };
  }

  const sum = Object.values(properties).reduce(
    (acc, val) => acc + (val || 0),
    0
  );
  if (sum === 0) {
    return { ...DEFAULT_ELEMENTAL_PROPERTIES };
  }

  return {
    Fire: (properties.Fire || 0) / sum,
    Water: (properties.Water || 0) / sum,
    Earth: (properties.Earth || 0) / sum,
    Air: (properties.Air || 0) / sum,
  };
};

// Process and validate a single ingredient
const processIngredient = (ingredient: unknown, name: string): Ingredient => {
  if (!ingredient) {
    throw new Error(`Invalid ingredient data for ${name}`);
  }

  // Create default lunar phase modifiers if none exist
  const defaultLunarPhaseModifiers = {
    newMoon: {
      elementalBoost: { Earth: 0.05, Water: 0.05 },
      preparationTips: ['Best for subtle preparation methods'],
      thermodynamicEffects: { heat: -0.1, entropy: -0.05 },
    },
    fullMoon: {
      elementalBoost: { Water: 0.1, Air: 0.05 },
      preparationTips: ['Enhanced flavor extraction'],
      thermodynamicEffects: { reactivity: 0.1, energy: 0.05 },
    },
  };

  // Apply uniform standardization to the ingredient
  const ingredientData = ingredient as unknown;
  const standardized = {
    name: name,
    category: ingredientData?.category || 'culinary_herb',
    elementalProperties: normalizeElementalProperties(
      ingredientData?.elementalProperties
    ),
    qualities: Array.isArray(ingredientData?.qualities) ? ingredientData.qualities : [],
    lunarPhaseModifiers:
      ingredientData?.lunarPhaseModifiers || defaultLunarPhaseModifiers,
    storage: ingredientData?.storage || { duration: 'unknown' },
    elementalTransformation: ingredientData?.elementalTransformation || {
      whenCooked: { Fire: 0.1, Air: 0.05 },
    },
    ...ingredientData,
  };

  return standardized as Ingredient;
};

// Process a collection of ingredients with the new properties
const processIngredientCollection = (
  collection: Record<string, unknown>
): Record<string, Ingredient> => {
  return Object.entries(collection).reduce((acc, [key, value]) => {
    try {
      const processedIngredient = processIngredient(value as unknown, key) as unknown;

      // Add alchemical and thermodynamic properties
      const alchemicalProps =
        calculateAlchemicalProperties(processedIngredient);
      const thermodynamicProps = calculateThermodynamicProperties(
        alchemicalProps,
        processedIngredient.elementalProperties
      );

      // Determine modality
      const modality = determineIngredientModality(
        (processedIngredient as unknown)?.qualities || [],
        processedIngredient.elementalProperties
      );

      // Create elementalSignature (dominant elements in order)
      const elementalSignature = Object.entries(
        processedIngredient.elementalProperties
      )
        .sort((a, b) => {
          // Pattern KK-10: Final Arithmetic Elimination for data processing
          const numericA = Number(a[1]) || 0;
          const numericB = Number(b[1]) || 0;
          return numericB - numericA;
        })
        .map(([element, value]) => [element, Number(value) || 0] as [string, number]);

      acc[key] = {
        ...processedIngredient,
        alchemicalProperties: alchemicalProps,
        thermodynamicProperties: thermodynamicProps,
        modality,
        elementalSignature:
          elementalSignature.length > 0 ? elementalSignature : undefined,
        // Process other enhanced properties if they exist
        astrologicalCorrespondence:
          (processedIngredient as unknown)?.astrologicalCorrespondence || undefined,
        pairingRecommendations:
          (processedIngredient as unknown)?.pairingRecommendations || undefined,
        celestialBoost: (processedIngredient as unknown)?.celestialBoost || undefined,
        planetaryInfluence: (processedIngredient as unknown)?.planetaryInfluence || undefined,
      } as Ingredient;
    } catch (error) {
      // console.warn(`Skipping invalid ingredient ${key}:`, error);
    }
    return acc;
  }, {} as Record<string, Ingredient>);
};

// Compile all ingredients into a single collection with deduplication
// Order matters - later sources overwrite earlier ones
export const allIngredients = (() => {
  // First process all collections separately
  const processedSeasonings = processIngredientCollection(seasonings);
  const processedVegetables = processIngredientCollection(enhancedVegetables);
  const processedFruits = processIngredientCollection(fruits);
  const processedGrains = processIngredientCollection(grainsCollection);
  const processedVinegars = processIngredientCollection(vinegarsCollection);
  const processedOils = processIngredientCollection(oilsCollection);
  const processedPlantBased = processIngredientCollection(plantBased);
  const processedMeats = processIngredientCollection(meats);
  const processedPoultry = processIngredientCollection(poultry);
  const processedSeafood = processIngredientCollection(seafood);
  const processedHerbs = processIngredientCollection(herbsCollection);
  const processedSpices = processIngredientCollection(spicesCollection);
  
  // Create a map to deduplicate by normalized name
  const result: Record<string, Ingredient> = {};
  
  // Helper function to normalize ingredient name for comparison
  const normalizeIngredientName = (name: string): string => {
    return name.toLowerCase()
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
  };
  
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
    { source: processedSpices, priority: 12 } // Highest priority
  ];
  
  // Sort collections by priority
  collectionsList.sort((a, b) => a.priority - b.priority);
  
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
        // Add "name_" prefix to avoid collisions with original keys
        result[`name_${normalizedKey}`] = ingredient;
      }
    });
  });
  
  // Remove the name_ prefixed duplicates for final export
  const finalResult: Record<string, Ingredient> = {};
  Object.entries(result).forEach(([key, value]) => {
    if (!key.startsWith('name_')) {
      finalResult[key] = value;
    }
  });
  
  return finalResult;
})();

// Get a complete list of all ingredient names
export const allIngredientNames = Object.keys(allIngredients);

// Create a map of ingredients for easy lookup by name - defining AFTER allIngredients is initialized
export const ingredientsMap = { ...allIngredients };

// Function to get all ingredients of a specific category
export function getAllIngredientsByCategory(category: string): Ingredient[] {
  return Object.values(allIngredients).filter(
    (ingredient) => ingredient.category === category
  );
}

// Function to get all vegetable ingredients
export function getAllVegetables(): Ingredient[] {
  return getAllIngredientsByCategory('vegetable');
}

// Function to get all protein ingredients
export function getAllProteins(): Ingredient[] {
  return getAllIngredientsByCategory('protein');
}

// Function to get all herb ingredients
export function getAllHerbs(): Ingredient[] {
  return getAllIngredientsByCategory('culinary_herb');
}

// Function to get all spice ingredients
export function getAllSpices(): Ingredient[] {
  return getAllIngredientsByCategory('spice');
}

// Function to get all grain ingredients
export function getAllGrains(): Ingredient[] {
  return getAllIngredientsByCategory('grain');
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
  normalizeElementalProperties,
  DEFAULT_ELEMENTAL_PROPERTIES,
  ingredientsMap,
};

