// Time-related types
export const MEAL_TIMES = ['breakfast', 'lunch', 'snack', 'dinner'] as const;
export type MealTime = typeof MEAL_TIMES[number];

// Import fundamental types
import { Recipe as AlchemyRecipe } from './alchemy';
import { 
  _CelestialPosition, 
  ZodiacSign, 
  _Element, 
  _LunarPhase, 
  _Planet, 
  AspectType, 
  DignityType,
  AstrologicalState,
  _ElementalProperties,
  AlchemicalProperties,
  ThermodynamicProperties,
  PlanetaryAlignment
} from './celestial';
import { type Season } from "@/types/alchemy";

// Export types properly for TypeScript isolatedModules
export type { 
  CelestialPosition, 
  ZodiacSign, 
  LunarPhase, 
  Planet, 
  AspectType, 
  DignityType,
  AstrologicalState,
  ElementalProperties,
  AlchemicalProperties,
  ThermodynamicProperties,
  PlanetaryAlignment
} from './celestial';

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

// Export Element from alchemy as the authoritative source
export type { Element } from './alchemy';

// Export unique types from alchemy
export type {
  BasicThermodynamicProperties,
  ElementalCharacteristics,
  ElementalProfile
} from './alchemy';

// Export essential utils
export * from './utils';
export * from './cuisine';

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

// Export ZodiacAffinity types
export * from './zodiacAffinity';

// Re-export all relevant types from their modules with explicit exports to avoid conflicts
export * from './elemental';
export * from './nutrition';
export * from './spoonacular';

// Explicit re-exports from recipe module to avoid conflicts
export type { 
  Recipe,
  RecipeIngredient,
  ElementalProperties as RecipeElementalProperties,
  validateRecipe,
  validateIngredient,
  IngredientMapping
} from './recipe';

export * from './zodiac';

// Explicit re-exports from time module to avoid conflicts
export type { 
  WeekDay,
  TimeOfDay,
  PlanetaryDay,
  PlanetaryHour,
  MealType,
  TimeFactors,
  getTimeFactors
} from './time';

// Explicit re-exports from seasons module to avoid conflicts
export type { Season, SeasonalProfile, SeasonalAdjustment, SeasonalRecommendations, recipe as SeasonalRecipe } from './seasons';

// Explicit re-exports from zodiacAffinity module to avoid conflicts
export type { Modality, ZodiacAffinity } from './zodiacAffinity';

// Explicit re-exports from lunar module to avoid conflicts
export type { 
  LunarPhaseModifier 
} from './lunar';

export * from './food';
export * from './ingredient';

// Explicit re-exports from cookingMethod module to avoid conflicts
export type { 
  CookingMethodData
} from './cookingMethod';

export * from './recipeIngredient';
export * from './recipes';
export * from './ingredient-compatibility';
export * from './utils';
export * from './validation';

// Define core app state types
export interface AppState {
  currentIngredients: Ingredient[];
  savedRecipes: unknown[];
  userPreferences: {
    theme: 'light' | 'dark';
    dietaryRestrictions: string[];
    favoriteIngredients: string[];
  };
}