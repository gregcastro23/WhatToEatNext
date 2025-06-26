import { Recipe } from '@/types/recipe';
import { _Element , _ElementalProperties } from "@/types/alchemy";

/**
 * Data Utils Index
 * 
 * Consolidated exports from the data processing module.
 * Provides a single entry point for all data standardization and validation functions.
 */

// Data processing functions
export * from './processing';

// Re-export commonly used functions for backward compatibility
export { 
  standardizeElementalAffinity,
  standardizeIngredient,
  standardizeRecipe,
  validateIngredient,
  validateRecipe,
  cleanupIngredientsDatabase,
  mergeElementalProperties
} from './processing';

// Type exports
export type {
  ValidationResult,
  DataCleanupResult,
  StandardizationOptions
} from './processing'; 