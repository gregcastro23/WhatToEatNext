// Time-related types
export const MEAL_TIMES = ['breakfast', 'lunch', 'snack', 'dinner'] as const;
export type MealTime = typeof MEAL_TIMES[number];

// Import fundamental types
import { Recipe as AlchemyRecipe, ZodiacSign, Season, ElementalProperties } from './alchemy';

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

// Export ZodiacAffinity types (removed to avoid Modality conflict)
// export * from './zodiacAffinity';

// Re-export all relevant types from their modules
// Remove duplicate exports to avoid conflicts
export * from './nutrition';
export * from './spoonacular';
// Note: Removing './recipe', './time', './lunar', './cookingMethod', './validation' to avoid conflicts
// Note: Removing './seasons' and './zodiacAffinity' to avoid conflicts
export * from './seasonal';
export * from './cuisine';
export * from './chakra';
export * from './astrology';
// Explicitly re-export PlanetaryPositions from astrological to resolve ambiguity  
export type { PlanetaryPositions as AstrologicalPlanetaryPositions } from './astrological';
// Note: Removing wildcard export from './astrological' to avoid PlanetaryPositions conflict
export * from './ingredient-compatibility';
export * from './utils';

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

// Instead, import and export only from './alchemy' for these types:
import { 
  AlchemicalProperties, 
  ThermodynamicProperties, 
  Element, 
  PlanetName, 
  LunarPhase, 
  PlanetaryAlignment 
} from './alchemy';

export type { 
  AlchemicalProperties, 
  ThermodynamicProperties, 
  Season, 
  Element, 
  PlanetName, 
  ZodiacSign, 
  LunarPhase, 
  PlanetaryAlignment,
  ElementalProperties
} from './alchemy';

// Add missing exports for frequently used types
export type { AstrologicalState } from './celestial';
export type { RecipeIngredient } from './recipeIngredient';
export type { UnifiedIngredient } from '../data/unified/unifiedTypes';

// Export unified types that are missing
export type { UnifiedRecipe } from './unified';
export type { UnifiedFlavorProfile, BaseFlavorNotes } from '../data/unified/flavorProfiles';

// Export recommendation types
export type { IngredientRecommendation } from './ingredients';