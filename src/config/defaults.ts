// src/config/defaults.ts

import type { FilterOptions, NutritionPreferences } from '../types/alchemy';

export const DEFAULT_FILTERS: FilterOptions = {
  dietary: {
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false,
  },
  time: {
    quick: false,
    medium: false,
    long: false,
  },
  spice: {
    mild: false,
    medium: false,
    spicy: false,
  },
  temperature: {
    hot: false,
    cold: false,
  },
};

export const DEFAULT_NUTRITION_PREFS: NutritionPreferences = {
  lowCalorie: false,
  highProtein: false,
  lowCarb: false,
};

export const TIME_RANGES = {
  quick: 30,
  medium: 60,
  long: 61
};

export const MEAL_PERIODS = {
  breakfast: { start: 5, end: 11 },
  lunch: { start: 11, end: 16 },
  dinner: { start: 16, end: 5 }
};

export const ELEMENTAL_DEFAULTS = {
  Fire: 0.25,
  Water: 0.25,
  Air: 0.25,
  Earth: 0.25
};