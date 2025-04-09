// This file provides compatibility for code that was importing from the deleted ingredients.ts file
// It simply re-exports the relevant types from alchemy.ts

import type { 
  Ingredient,
  IngredientMapping,
  IngredientCategory,
  SensoryProfile,
  CookingMethod,
  LunarPhaseModifier,
  BaseIngredient,
  AlchemicalProperties,
  ThermodynamicProperties,
  Modality
} from './alchemy';

// Re-export types
export type {
  Ingredient,
  IngredientMapping,
  IngredientCategory,
  SensoryProfile,
  CookingMethod,
  LunarPhaseModifier,
  BaseIngredient,
  AlchemicalProperties,
  ThermodynamicProperties,
  Modality
}; 