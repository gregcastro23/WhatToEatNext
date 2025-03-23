import type { ElementalProperties } from './alchemy';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';
export type CuisineType = 'chinese' | 'japanese' | 'korean' | 'indian' | 'thai' | 'vietnamese' | 'western' | 'mediterranean' | 'middle-eastern';
export type DietaryType = 'vegetarian' | 'vegan' | 'pescatarian' | 'omnivore' | 'keto' | 'paleo';
export type CookingTime = 'quick' | 'medium' | 'slow';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Season = 'spring' | 'summer' | 'fall' | 'winter' | 'all';

export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
  category: string;
  subCategory?: string;
  preparation?: string;
  notes?: string;
  substitutes?: string[];
  elementalProperties?: ElementalProperties;
}

export interface CookingStep {
  order: number;
  description: string;
  duration?: {
    value: number;
    unit: 'minutes' | 'hours'
  };
  method?: string;
  temperature?: {
    value: number;
    unit: 'C' | 'F'
  };
  notes?: string;
}

export interface NutritionalInfo {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  vitamins?: Record<string, number>;
  minerals?: Record<string, number>;
}

export interface Dish {
  id: string;
  name: string;
  alternateName?: string;
  cuisine: CuisineType;
  description: string;
  mealType: MealType;
  dietaryType: DietaryType[];
  season: Season[];
  servings: number;
  prepTime: number;
  cookTime: number;
  totalTime: number;
  difficulty: Difficulty;
  ingredients: Ingredient[];
  steps: CookingStep[];
  nutritionalInfo?: NutritionalInfo;
  elementalState?: ElementalProperties;
}
