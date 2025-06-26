/**
 * Spoonacular API Type Definitions
 * This file contains all interfaces for the Spoonacular API data structures
 */

import { _ElementalProperties } from './elemental';

/**
 * Represents a nutrient returned by the Spoonacular API
 */
export interface SpoonacularNutrient {
  name: string;
  amount: number;
  unit?: string;
  percentOfDailyNeeds?: number;
}

/**
 * Represents nutrition information returned by the Spoonacular API
 */
export interface SpoonacularNutrition {
  nutrients: SpoonacularNutrient[];
  caloricBreakdown?: {
    percentProtein: number;
    percentFat: number;
    percentCarbs: number;
  };
  weightPerServing?: {
    amount: number;
    unit: string;
  };
  properties?: Array<{
    name: string;
    amount: number;
    unit: string;
  }>;
  flavonoids?: Array<{
    name: string;
    amount: number;
    unit: string;
  }>;
}

/**
 * Represents an ingredient returned by the Spoonacular API
 */
export interface SpoonacularIngredient {
  id?: number;
  name?: string;
  originalName?: string;
  amount?: number;
  unit?: string;
  aisle?: string;
  nutrition?: SpoonacularNutrition;
  meta?: string[];
  image?: string;
  consistency?: string;
  nameClean?: string;
  original?: string;
  possibleUnits?: string[];
  estimated?: boolean;
  shoppingListUnits?: string[];
  categoryPath?: string[];
  elementalProperties?: ElementalProperties;
}

/**
 * Represents a base recipe returned by the Spoonacular API
 */
export interface SpoonacularRecipe {
  id?: number;
  title?: string;
  nutrition?: SpoonacularNutrition;
  extendedIngredients?: SpoonacularIngredient[];
  analyzedInstructions?: {
    steps: {
      step: string;
      equipment?: { name: string; id?: number; temperature?: number }[];
      ingredients?: { name: string; id?: number }[];
    }[];
  }[];
  servings?: number;
  readyInMinutes?: number;
  summary?: string;
  instructions?: string;
}

/**
 * Extended recipe information from Spoonacular API
 */
export interface SpoonacularApiRecipe extends SpoonacularRecipe {
  cuisines?: string[];
  dishTypes?: string[];
  diets?: string[];
  occasions?: string[];
  dairyFree?: boolean;
  vegan?: boolean;
  vegetarian?: boolean;
  glutenFree?: boolean;
  healthScore?: number;
  pricePerServing?: number;
  sourceUrl?: string;
  image?: string;
  imageType?: string;
  likes?: number;
  creditsText?: string;
  sourceName?: string;
  aggregateLikes?: number;
  spoonacularScore?: number;
  gaps?: string;
  preparationMinutes?: number;
  cookingMinutes?: number;
  sustainable?: boolean;
  veryHealthy?: boolean;
  veryPopular?: boolean;
  whole30?: boolean;
  weightWatcherSmartPoints?: number;
  cheap?: boolean;
  wine?: {
    pairedWines?: string[];
    pairingText?: string;
    productMatches?: Array<{
      id: number;
      title: string;
      description: string;
      price: string;
      imageUrl: string;
      averageRating: number;
      ratingCount: number;
      score: number;
      link: string;
    }>;
  };
  license?: string;
}

/**
 * Parameters for searching recipes in Spoonacular API
 */
export interface SpoonacularSearchParams {
  cuisine?: string;
  query?: string;
  diet?: string;
  maxReadyTime?: number;
  number?: number;
  addRecipeInformation?: boolean;
  fillIngredients?: boolean;
  instructionsRequired?: boolean;
  addRecipeNutrition?: boolean;
  intolerances?: string | string[];
  sort?: string;
  sortDirection?: string;
  offset?: number;
  maxCalories?: number;
  minCalories?: number;
  maxCarbs?: number;
  minCarbs?: number;
  maxProtein?: number;
  minProtein?: number;
  maxFat?: number;
  minFat?: number;
  includeIngredients?: string;
  excludeIngredients?: string;
  type?: string;
}

/**
 * Recipe nutrition data structure
 */
export interface SpoonacularNutritionData {
  nutrients?: SpoonacularNutrient[];
  properties?: Array<{
    name: string;
    amount: number;
    unit: string;
  }>;
  flavonoids?: Array<{
    name: string;
    amount: number;
    unit: string;
  }>;
  caloricBreakdown?: {
    percentProtein: number;
    percentFat: number;
    percentCarbs: number;
  };
  weightPerServing?: {
    amount: number;
    unit: string;
  };
} 