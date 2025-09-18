// Removed unused type imports

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
  cleanupIngredientsDatabase,
  mergeElementalProperties,
  standardizeElementalAffinity,
  standardizeIngredient,
  standardizeRecipe,
  validateIngredient,
  validateRecipe,
} from './processing';

// Type exports
export type { DataCleanupResult, StandardizationOptions, ValidationResult } from './processing';
