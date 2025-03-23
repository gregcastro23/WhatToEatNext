// src/data/cuisines.ts
import { cuisinesMap as importedCuisinesMap, CUISINES } from './cuisines/index';
import { african } from './cuisines/african';
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

// Import types
import type { Recipe, ElementalProperties, CuisineType } from '@/types/alchemy';

// Example recipe type for reference
const _exampleRecipe: Recipe = {
  name: "Example Recipe",
  description: "Template for recipe structure",
  cuisine: "Any",
  ingredients: [
    { name: "ingredient", amount: "100", unit: "g", category: "category" }
  ],
  nutrition: {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    vitamins: [],
    minerals: []
  },
  timeToMake: "30 minutes",
  season: ["all"],
  mealType: ["any"]
};

// Combine all cuisines
export const cuisines: Record<string, CuisineType> = {
  chinese,
  french,
  greek,
  indian,
  italian,
  japanese,
  korean,
  mexican,
  middleEastern,
  thai,
  vietnamese,
  african
};

// Type exports
export type { CuisineType };
export type Cuisine = typeof cuisines[keyof typeof cuisines];

// Helper functions for accessing cuisine properties
export const getCuisineByName = (name: string): CuisineType | undefined => 
  cuisines[name.toLowerCase()];

export const getCuisinesByElement = (element: keyof ElementalProperties): CuisineType[] => 
  Object.values(cuisines).filter(cuisine => 
    cuisine.elementalState[element] >= 0.3
  );

// Re-export the cuisinesMap from the imported one
export const cuisinesMap = importedCuisinesMap;

// Re-export CUISINES constant
export { CUISINES };

export default cuisines;
  