// Time-related types
export const MEAL_TIMES = ['breakfast', 'lunch', 'snack', 'dinner'] as const;
export type MealTime = typeof MEAL_TIMES[number];

// Import fundamental types
import { Recipe as AlchemyRecipe } from './alchemy';
import { 
  CelestialPosition, 
  ZodiacSign, 
  Element, 
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

// Export types properly for TypeScript isolatedModules
export type { 
  CelestialPosition, 
  ZodiacSign, 
  Element, 
  LunarPhase, 
  Planet, 
  AspectType, 
  DignityType,
  AstrologicalState,
  ElementalProperties,
  AlchemicalProperties,
  ThermodynamicProperties,
  PlanetaryAlignment
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

// Selectively export types from alchemy that don't conflict
export type {
  Element,
  LunarPhase,
  Planet,
  AspectType,
  DignityType,
  AstrologicalState,
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