// This file provides compatibility for code that was importing from the deleted ingredients.ts file
// It imports types from their actual locations

import type { 
  Ingredient,
  IngredientMapping,
  CookingMethod,
  BaseIngredient,
  AlchemicalProperties,
  ThermodynamicProperties,
  Modality
} from './alchemy';

import type {
  SensoryProfile,
  LunarPhaseModifier
} from '../data/ingredients/types';

// Re-export types
export type {
  Ingredient,
  IngredientMapping,
  SensoryProfile,
  CookingMethod,
  LunarPhaseModifier,
  BaseIngredient,
  AlchemicalProperties,
  ThermodynamicProperties,
  Modality
}; 