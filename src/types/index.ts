/**
 * Type Definitions Index
 * 
 * This file centralizes all type exports from the types directory
 * to make it easier to import from a single location
 */

// Time-related types
export const MEAL_TIMES = ['breakfast', 'lunch', 'snack', 'dinner'] as const;
export type MealTime = typeof MEAL_TIMES[number];

// Import from alchemy.ts (primary source of truth)
import type { 
  ZodiacSign, 
  LunarPhase, 
  PlanetaryAlignment, 
  Element,
  LunarPhaseWithSpaces,
  LunarPhaseWithUnderscores,
  PlanetName, 
  ElementalProperties, 
  ThermodynamicProperties,
  AlchemicalProperties,
  AspectType,
  DignityType,
  AstrologicalState,
  Planet,
  Season,
  CookingMethod
} from './alchemy';

// Import from shared.ts
import { 
  DEFAULT_ELEMENTAL_PROPERTIES,
  MoonPhase,
  ElementalScore,
  MOON_PHASE_TO_LOWERCASE,
  LOWERCASE_TO_MOON_PHASE,
  LowercaseMoonPhaseWithSpaces,
  isElementalProperties,
  MOON_PHASE_MAP,
  MOON_PHASE_TO_DISPLAY,
  MoonPhaseWithSpaces
} from './shared';

// Import from ingredient.ts
import {
  IngredientRecommendation,
  isIngredient,
  isIngredientMapping
} from './ingredient';

// Re-export key types from alchemy.ts and others
export type {
  ZodiacSign,
  LunarPhase,
  PlanetaryAlignment,
  Element,
  LunarPhaseWithSpaces, 
  LunarPhaseWithUnderscores,
  PlanetName,
  ElementalProperties,
  ThermodynamicProperties,
  AlchemicalProperties,
  AspectType,
  DignityType,
  AstrologicalState,
  Planet,
  Season,
  CookingMethod
};

// Re-export from shared.ts
export {
  DEFAULT_ELEMENTAL_PROPERTIES,
  MoonPhase,
  ElementalScore,
  MOON_PHASE_TO_LOWERCASE,
  LOWERCASE_TO_MOON_PHASE,
  LowercaseMoonPhaseWithSpaces,
  isElementalProperties,
  MOON_PHASE_MAP,
  MOON_PHASE_TO_DISPLAY,
  MoonPhaseWithSpaces
};

// Re-export from ingredient.ts
export {
  IngredientRecommendation,
  isIngredient,
  isIngredientMapping
};

// Define zodiac signs as seasons
export const ZODIAC_SEASONS: ZodiacSign[] = [
  'aries', 'taurus', 'gemini', 'cancer', 
  'leo', 'virgo', 'libra', 'scorpio', 
  'sagittarius', 'capricorn', 'aquarius', 'pisces'
];

// Recipe and ingredient types
export interface Ingredient {
  name: string;
  category: string;
  amount: string;
  elementalProperties: ElementalProperties;
  astrologicalProfile: {
    elementalAffinity: {
      base: string;
      secondary?: string;
    };
    rulingPlanets: string[];
    zodiacAffinity?: string[];
  };
  flavorProfile?: {
    spicy: number;
    sweet: number;
    sour: number;
    bitter: number;
    salty: number;
    umami: number;
  };
}

export interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
}

export interface Dish {
  name: string;
  ingredients: Ingredient[];
  instructions: string[];
  timeToMake: string;
  nutrition: Nutrition;
}

export interface FilterOptions {
  dietary: {
    vegetarian: boolean;
    vegan: boolean;
    glutenFree: boolean;
    dairyFree: boolean;
  };
  time: {
    quick: boolean;
    medium: boolean;
    long: boolean;
  };
  spice: {
    mild: boolean;
    medium: boolean;
    spicy: boolean;
  };
  temperature: {
    hot: boolean;
    cold: boolean;
  };
}

export interface NutritionPreferences {
  lowCalorie: boolean;
  highProtein: boolean;
  lowCarb: boolean;
}

export type TimeData = {
  [season in Season]?: Dish[];
};

export type CuisineData = {
  name: string;
  dishes: {
    [mealTime in MealTime]?: TimeData;
  };
};

export type Cuisines = {
  [id: string]: CuisineData;
};

// Helper type for time-based context
export type TimeOfDay = {
  hour: number;
  minute: number;
  period: MealTime;
  season: Season;
};

// Use as type instead of enum to avoid merging issues
export type CuisineTypeEnum = 'ITALIAN' | 'FRENCH' | 'CHINESE' | 'INDIAN' | 'MEXICAN';

// App State definition moved to state.ts
export interface AppState {
  currentIngredients: Ingredient[];
  savedRecipes: unknown[];
  userPreferences: {
    theme: 'light' | 'dark';
    dietaryRestrictions: string[];
    favoriteIngredients: string[];
  };
}

export interface SimpleIngredient {
  name: string;
  amount?: number;
  unit?: string;
  element?: string;
  category?: string;
}

export enum IngredientCategory {
  Vegetable = 'vegetable',
  Fruit = 'fruit',
  Protein = 'protein',
  Grain = 'grain',
  Dairy = 'dairy',
  Herb = 'herb',
  Spice = 'spice',
  Oil = 'oil',
  Vinegar = 'vinegar',
  Sauce = 'sauce',
  Sweetener = 'sweetener',
  Nut = 'nut',
  Seed = 'seed',
  Legume = 'legume',
  Mushroom = 'mushroom',
  Seafood = 'seafood',
  Beverage = 'beverage',
  Alcohol = 'alcohol',
  Other = 'other'
}

// Add CuisineType for compatibility
export type CuisineType = string;

// Add DietaryRestriction type if missing from any type files
export type DietaryRestriction = 
  | 'vegan' 
  | 'vegetarian' 
  | 'pescatarian' 
  | 'dairy-free' 
  | 'gluten-free' 
  | 'nut-free' 
  | 'keto' 
  | 'paleo' 
  | 'low-carb' 
  | 'low-fat';

// Type checking utilities
export const isObject = (value: unknown): value is Record<string, unknown> => 
  typeof value === 'object' && value !== null;

export const isString = (value: unknown): value is string => 
  typeof value === 'string';

// Export individual type modules (without * to avoid duplicate exports)
export { cookingMethod } from './cookingMethod';
export { utils } from './utils';
export { cuisine } from './cuisine';
export { zodiacAffinity } from './zodiacAffinity';
export { elemental } from './elemental';
export { nutrition } from './nutrition';
export { spoonacular } from './spoonacular';
export { recipe } from './recipe';
export { zodiac } from './zodiac';
export { time } from './time';
export { seasons } from './seasons';
export { seasonal } from './seasonal';
export { chakra } from './chakra';
export { astrology } from './astrology';
export { astrological } from './astrological';
export { lunar } from './lunar';
export { food } from './food';
export { state } from './state';
export { chart } from './chart';
export { currentChart } from './CurrentChart';
export { cooking } from './cooking';
export { constants } from './constants';
export { common } from './common';
export { commonTypes } from './commonTypes';
export { recipeIngredient } from './recipeIngredient';
export { recipes } from './recipes';
export { validation } from './validation';
export { validators } from './validators';
export { alchemical } from './alchemical';
export { alchemicalResults } from './alchemicalResults';