import { spices } from './spices';
import { herbs, medicinalHerbs } from './herbs';
import { oils } from './oils';
import { vegetables } from './vegetables';
import { fruits } from './fruits';
import { seafood } from './proteins/seafood';
import { poultry } from './proteins/poultry';
import { plantBased } from './proteins/plantBased';
import { wholeGrains, refinedGrains } from './grains';
import type { ElementalProperties } from '@/types/alchemy';
import type { Ingredient } from '@/types/index';
import type { IngredientMapping } from './types';

// Export ingredient groups for organizing the UI
export const ingredientGroups = {
  'Vegetables': Object.keys(vegetables).map(k => ({ id: k, name: vegetables[k].name })),
  'Fruits': Object.keys(fruits).map(k => ({ id: k, name: fruits[k].name })),
  'Herbs': Object.keys(herbs).map(k => ({ id: k, name: herbs[k].name })),
  'Spices': Object.keys(spices).map(k => ({ id: k, name: spices[k].name })),
  'Oils & Fats': Object.keys(oils).map(k => ({ id: k, name: oils[k].name })),
  'Seafood': Object.keys(seafood).map(k => ({ id: k, name: seafood[k].name })),
  'Poultry': Object.keys(poultry).map(k => ({ id: k, name: poultry[k].name })),
  'Plant-Based': Object.keys(plantBased).map(k => ({ id: k, name: plantBased[k].name })),
  'Whole Grains': Object.keys(wholeGrains).map(k => ({ id: k, name: wholeGrains[k].name })),
  'Refined Grains': Object.keys(refinedGrains).map(k => ({ id: k, name: refinedGrains[k].name })),
  'Medicinal Herbs': Object.keys(medicinalHerbs).map(k => ({ id: k, name: medicinalHerbs[k].name }))
};

// Convert to Record<string, Ingredient> for proteins
export const proteins: Record<string, Ingredient> = Object.entries({
  ...seafood,
  ...poultry,
  ...plantBased
}).reduce((acc, [key, value]) => {
  // Convert astrologicalProfile to match the expected structure
  const astroProfile = {
    elementalAffinity: {
      base: value.astrologicalProfile?.elementalAffinity 
        ? (typeof value.astrologicalProfile.elementalAffinity === 'string' 
          ? value.astrologicalProfile.elementalAffinity 
          : value.astrologicalProfile.elementalAffinity.base)
        : Object.entries(value.elementalProperties)
            .sort(([, a], [, b]) => b - a)[0][0].toLowerCase()
    },
    rulingPlanets: value.astrologicalProfile?.rulingPlanets || []
  };
  
  acc[key] = {
    name: value.name,
    category: value.category || '',
    amount: "0", // Default amount as string (to match the string type in index.ts)
    elementalProperties: value.elementalProperties,
    astrologicalProfile: astroProfile
  };
  return acc;
}, {} as Record<string, Ingredient>);

// Helper function to normalize elemental properties
export function normalizeProperties(properties: Record<string, number>): Record<string, number> {
  const sum = Object.values(properties).reduce((acc: number, val: number) => acc + val, 0);
  
  if (sum === 0) return properties;
  
  return Object.entries(properties).reduce((acc, [key, value]) => {
    acc[key] = value / sum;
    return acc;
  }, {} as Record<string, number>);
}

// Convert IngredientMapping objects to Ingredient[] arrays
function convertToIngredientArray(mappings: Record<string, IngredientMapping>): Ingredient[] {
  return Object.entries(mappings).map(([key, value]) => {
    // Convert astrologicalProfile to match the expected structure
    const astroProfile = {
      elementalAffinity: {
        base: value.astrologicalProfile?.elementalAffinity 
          ? (typeof value.astrologicalProfile.elementalAffinity === 'string' 
            ? value.astrologicalProfile.elementalAffinity 
            : value.astrologicalProfile.elementalAffinity.base)
          : Object.entries(value.elementalProperties)
              .sort(([, a], [, b]) => b - a)[0][0].toLowerCase()
      },
      rulingPlanets: value.astrologicalProfile?.rulingPlanets || []
    };
    
    return {
      name: value.name,
      category: value.category || '',
      amount: "0", // Default amount as string (to match the string type in index.ts)
      elementalProperties: value.elementalProperties,
      astrologicalProfile: astroProfile
    };
  });
}

// Export individual categories
export {
    herbs,
    spices,
    oils,
    seafood,
    poultry,
    plantBased,
    wholeGrains,
    refinedGrains,
    medicinalHerbs
};

// Keep this as the single declaration
export const allIngredients: Record<string, Ingredient[]> = {
    'Herbs': convertToIngredientArray(herbs),
    'Spices': convertToIngredientArray(spices),
    'Oils & Fats': convertToIngredientArray(oils),
    'Seafood': convertToIngredientArray(seafood),
    'Poultry': convertToIngredientArray(poultry),
    'Plant-Based': convertToIngredientArray(plantBased),
    'Whole Grains': convertToIngredientArray(wholeGrains),
    'Refined Grains': convertToIngredientArray(refinedGrains),
    'Medicinal Herbs': convertToIngredientArray(medicinalHerbs)
};

// Default elemental properties referenced in multiple tests
export const defaultElementalProps: ElementalProperties = {
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25
};

// Normalize elemental properties to ensure they sum to 1
export const normalizeElementalProperties = (properties: ElementalProperties): ElementalProperties => {
    const sum = Object.values(properties).reduce((acc, val) => acc + val, 0);
    return Object.entries(properties).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: value / sum
    }), {} as ElementalProperties);
};

// Validate ingredient categories based on test requirements
export const validCategories = ['culinary_herb', 'spice', 'protein', 'oil'];

// Export types
export type { Ingredient, ElementalProperties, IngredientMapping }; 