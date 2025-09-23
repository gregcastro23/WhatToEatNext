// src/config/defaults.ts

import type { FilterOptions, NutritionPreferences, __ } from '../types/alchemy';

export const _DEFAULT_FILTERS: FilterOptions = {
  cookingTime: 'any',
  elementalFocus: null,
  mealType: 'any',
  seasonality: null,
  difficulty: 'any'
} as unknown as FilterOptions,

// Separate dietary preferences - these are no longer part of FilterOptions
export const _DEFAULT_DIETARY_PREFERENCES = {
  vegetarian: false,
  vegan: false,
  glutenFree: false,
  dairyFree: false
}

// Separate time preferences
export const _DEFAULT_TIME_PREFERENCES = {
  quick: false,
  medium: false,
  long: false
}

// Separate spice preferences
export const _DEFAULT_SPICE_PREFERENCES = {
  mild: false,
  medium: false,
  spicy: false
}

// Separate temperature preferences
export const _DEFAULT_TEMPERATURE_PREFERENCES = {
  hot: false,
  cold: false
}

export const _DEFAULT_NUTRITION_PREFS: NutritionPreferences = {
  calories: { min: 1500, max: 2500 }
  macros: {
    protein: 50,
    carbs: 250,
    fat: 70
  },
  vitamins: [],
  minerals: [],
  allergens: [],
  dietaryRestrictions: []
}

export const _TIME_RANGES = {
  quick: 30,
  medium: 60,
  long: 61
}

export const _MEAL_PERIODS = {
  breakfast: { start: 5, end: 11 }
  lunch: { start: 11, end: 16 }
  dinner: { start: 16, end: 5 }
}

export const _ELEMENTAL_DEFAULTS = {
  Fire: 0.25,
  Water: 0.25,
  Air: 0.25,
  Earth: 0.25
}
