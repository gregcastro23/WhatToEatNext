import type { ElementalProperties } from '@/types/alchemy';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert',
export type CuisineType =
  | 'chinese',
  | 'japanese'
  | 'korean'
  | 'indian'
  | 'thai'
  | 'vietnamese'
  | 'western'
  | 'mediterranean'
  | 'middle-eastern',
export type DietaryType = 'vegetarian' | 'vegan' | 'pescatarian' | 'omnivore' | 'keto' | 'paleo',
export type CookingTime = 'quick' | 'medium' | 'slow',
export type Season = 'spring' | 'summer' | 'fall' | 'winter' | 'all',

// Constants for meal types and recipe types
export const _MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'],
export const _RECIPE_TYPES: DietaryType[] = [
  'vegetarian',
  'vegan',
  'pescatarian',
  'omnivore',
  'keto',
  'paleo'
],

export interface Ingredient {
  name: string,
  amount: string,
  unit: string,
  category: string,
  subCategory?: string,
  preparation?: string,
  notes?: string,
  substitutes?: string[],
  elementalProperties?: ElementalProperties
}

export interface CookingStep {
  order: number,
  description: string,
  duration?: {
    value: number,
    unit: 'minutes' | 'hours' },
        method?: string
  temperature?: {
    value: number,
    unit: 'C' | 'F' },
        notes?: string
}

export interface NutritionalInfo {
  calories?: number,
  protein?: number,
  carbs?: number,
  fat?: number,
  fiber?: number
  vitamins?: Record<string, number>,
  minerals?: Record<string, number>,
}

export interface Dish {
  id: string,
  name: string,
  alternateName?: string
  cuisine: CuisineType,
  description: string,
  mealType: MealType,
  dietaryType: DietaryType[],
  season: Season[],
  servings: number,
  prepTime: number,
  cookTime: number,
  totalTime: number,
  ingredients: Ingredient[],
  steps: CookingStep[],
  nutritionalInfo?: NutritionalInfo,
  elementalState?: ElementalProperties
}