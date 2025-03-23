// Time-related types
export const MEAL_TIMES = ['breakfast', 'lunch', 'snack', 'dinner'] as const;
export type MealTime = typeof MEAL_TIMES[number];

// Using zodiac signs instead of traditional seasons
// Import the ZodiacSign type for use as seasons
import { ZodiacSign, ZodiacSeason } from '@/types/alchemy';

// Define zodiac signs as seasons
export const ZODIAC_SEASONS: ZodiacSign[] = [
  'aries', 'taurus', 'gemini', 'cancer', 
  'leo', 'virgo', 'libra', 'scorpio', 
  'sagittarius', 'capricorn', 'aquarius', 'pisces'
];

// Maintain backward compatibility
// Replace with zodiac-based seasons
export type Season = ZodiacSeason;

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

export enum CuisineType {
  ITALIAN = 'ITALIAN',
  // ... other cuisines
}

// Export all types from alchemy
export * from './alchemy';