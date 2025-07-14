// src/data/cuisines.ts
import { cuisinesMap as importedCuisinesMap, CUISINES } from './cuisines/index';
import { african } from './cuisines/african';
import { american } from './cuisines/american';
import { chinese } from './cuisines/chinese';
import { french } from './cuisines/french';
import { greek } from './cuisines/greek';
import { indian } from './cuisines/indian';
import { italian } from './cuisines/italian';
import { japanese } from './cuisines/japanese';
import { korean } from './cuisines/korean';
import { mexican } from './cuisines/mexican';
import { middleEastern } from './cuisines/middle-eastern';
import { thai } from './cuisines/thai';
import { vietnamese } from './cuisines/vietnamese';
import { russian } from './cuisines/russian';

// Import types - removed Cuisine to avoid conflict with local type declaration
import type { Recipe, ElementalProperties, CuisineType } from '@/types/alchemy';

// Example recipe type for reference
const _exampleRecipe: Recipe = {
  id: "example-recipe-001",
  name: "Example Recipe",
  description: "Template for recipe structure",
  cuisine: "Any",
  ingredients: [
    { name: "ingredient", amount: 100, unit: "g", category: "category", element: "Earth" }
  ],
  cookingMethod: "baking",
  timeToMake: 30, // minutes
  numberOfServings: 4,
  elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }, // ← Pattern GG-4: Added missing elementalProperties
  instructions: ["Prepare ingredients", "Follow cooking method"], // ← Pattern GG-4: Added missing instructions
  nutrition: {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    vitamins: [],
    minerals: []
  },
  season: ["all"],
  mealType: ["any"]
};

// Helper function to adapt ElementalProperties from cuisine.ts to alchemy.ts format
function adaptElementalProperties(props: unknown): ElementalProperties {
  const propsData = props as Record<string, unknown>;
  // If it already has the index signature, return as is
  if (propsData && typeof propsData === 'object' && Object.prototype.hasOwnProperty.call(propsData, 'Fire')) {
    return propsData as ElementalProperties;
  }
  
  // Convert to the format expected by alchemy.ts
  return {
    Fire: (propsData?.Fire as number) || 0,
    Water: (propsData?.Water as number) || 0,
    Earth: (propsData?.Earth as number) || 0,
    Air: (propsData?.Air as number) || 0
  };
}

// Helper function to adapt cuisines to the local cuisine interface format
function adaptCuisine(cuisine: unknown): Record<string, unknown> {
  const cuisineData = cuisine as Record<string, unknown>;
  return {
    ...(cuisineData || {}),
    // Convert elementalProperties if present - apply safe type casting
    elementalProperties: cuisineData?.elementalProperties ? 
      adaptElementalProperties(cuisineData.elementalProperties) : undefined,
    
    // Convert elementalState if present - apply safe type casting
    elementalState: cuisineData?.elementalState ? 
      adaptElementalProperties(cuisineData.elementalState) : undefined
  };
}

// Combine all cuisines
export const cuisines: Record<string, Record<string, unknown>> = {
  american: adaptCuisine(american),
  chinese: adaptCuisine(chinese),
  french: adaptCuisine(french),
  greek: adaptCuisine(greek),
  indian: adaptCuisine(indian),
  italian: adaptCuisine(italian),
  japanese: adaptCuisine(japanese),
  korean: adaptCuisine(korean),
  mexican: adaptCuisine(mexican),
  middleEastern: adaptCuisine(middleEastern),
  thai: adaptCuisine(thai),
  vietnamese: adaptCuisine(vietnamese),
  african: adaptCuisine(african),
  russian: adaptCuisine(russian)
};

// Type exports
export type { CuisineType };
// Local type definition - renamed to avoid conflict with imported Cuisine type
export type LocalCuisineType = Record<string, unknown>; // Fixed: replaced 'any' with proper type

// Helper functions for accessing cuisine properties
export const getCuisineByName = (name: string): Record<string, unknown> => 
  cuisines[name.toLowerCase()];

export const getCuisinesByElement = (element: keyof ElementalProperties): Record<string, unknown>[] => 
  Object.values(cuisines).filter(cuisine => {
    const cuisineData = cuisine as Record<string, unknown>;
    const elementalState = cuisineData?.elementalState as ElementalProperties | undefined;
    const elementalProperties = cuisineData?.elementalProperties as ElementalProperties | undefined;
    
    return (elementalState?.[element] ?? 0) >= 0.3 || (elementalProperties?.[element] ?? 0) >= 0.3;
  });

// Re-export the cuisinesMap from the imported one
export const cuisinesMap = importedCuisinesMap;

// Re-export CUISINES constant
export { CUISINES };

export default cuisines;

export type Cuisine = LocalCuisineType;
  