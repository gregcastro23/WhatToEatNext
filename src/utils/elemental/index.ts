import { Recipe } from '@/types/recipe';
import type { ElementalProperties } from "@/types/alchemy";
import { Element } from "@/types/alchemy";

/**
 * Elemental Utils Index
 * 
 * Consolidated exports from the elemental module system.
 * Provides a single entry point for all elemental calculations and transformations.
 */

// Core elemental functions
export * from './core';

// Elemental transformations and alchemical functions
export * from './transformations';

// Re-export commonly used functions for backward compatibility
export { 
  validateElementalProperties,
  normalizeProperties,
  calculateDominantElement,
  getElementalColor,
  getElementalSymbol,
  getElementalDescription,
  getElementalCompatibility,
  calculateElementalCompatibility,
  calculateDetailedElementalCompatibility,
  getComplementaryElement,
  getStrengtheningElement,
  combineElementalProperties,
  calculateElementalState,
  getElementalCharacteristics,
  standardizeRecipeElements,
  ELEMENTAL_COLORS,
  ELEMENTAL_SYMBOLS,
  ELEMENTAL_DESCRIPTIONS
} from './core';

export { 
  transformIngredients,
  transformCookingMethods,
  transformCuisines,
  transformSingleItem,
  applyPlanetaryInfluence,
  sortByAlchemicalCompatibility,
  filterByAlchemicalCompatibility,
  getTopCompatibleItems
} from './transformations';

// Type exports
export type {
  ElementalColor,
  ElementalCompatibility,
  ElementalCharacteristics,
  ElementalProfile
} from './core';

export type {
  TransformationContext,
  PlanetaryInfluence,
  AlchemicalTransformation
} from './transformations'; 