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

// Import types
import type { Recipe, ElementalProperties, CuisineType, Cuisine } from '@/types/alchemy';

// Example recipe type for reference
const exampleRecipe: Recipe = {
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
  const propsData = props as any;
  // If it already has the index signature, return as is
  if (propsData && typeof propsData === 'object' && propsData.hasOwnProperty('Fire')) {
    return propsData as ElementalProperties;
  }
  
  // Convert to the format expected by alchemy.ts
  return {
    Fire: propsData?.Fire || 0,
    Water: propsData?.Water || 0,
    Earth: propsData?.Earth || 0,
    Air: propsData?.Air || 0
  };
}

// Helper function to adapt cuisines to the Cuisine interface format
function adaptCuisine(cuisine: unknown): Cuisine {
  const cuisineData = cuisine as any;
  return {
    ...cuisineData,
    // Convert elementalProperties if present
    elementalProperties: cuisineData.elementalProperties ? 
      adaptElementalProperties(cuisineData.elementalProperties) : undefined,
    
    // Convert elementalState if present
    elementalState: cuisineData.elementalState ? 
      adaptElementalProperties(cuisineData.elementalState) : undefined
  };
}

// Combine all cuisines
export const cuisines: Record<string, Cuisine> = {
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
export type Cuisine = typeof cuisines[keyof typeof cuisines];

// Helper functions for accessing cuisine properties
export const getCuisineByName = (name: string): Cuisine | undefined => 
  cuisines[name.toLowerCase()];

export const getCuisinesByElement = (element: keyof ElementalProperties): Cuisine[] => 
  Object.values(cuisines).filter(cuisine => 
    (cuisine.elementalState?.[element] ?? 0) >= 0.3 || (cuisine.elementalProperties?.[element] ?? 0) >= 0.3
  );

// Re-export the cuisinesMap from the imported one
export const cuisinesMap = importedCuisinesMap;

// Re-export CUISINES constant
export { CUISINES };

export default cuisines;
  