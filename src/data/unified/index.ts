// ===== UNIFIED DATA SYSTEMS INDEX =====
// Central export point for all unified data systems
// Phases 1, 2, and 3 consolidated systems

// Phase 1: Unified Flavor Profiles
export * from './flavorProfiles';

// Phase 2: Unified Ingredients with Kalchm Integration
export * from './ingredients';
export * from './alchemicalCalculations';

// Phase 3: Unified Recipe System with Monica Constants
export * from './recipes';

// Phase 3: Unified Cuisine System with Kalchm Values
export * from './cuisines';

// Export the seasonal system
export * from './seasonal';

// Export the cuisine integration system
export * from './cuisineIntegrations';

// Re-export key types and utilities
export type { 
  UnifiedIngredient,
  AlchemicalProperties,
  ThermodynamicMetrics
} from './ingredients';

export type {
  EnhancedRecipe
} from './recipes';

export type {
  EnhancedCuisine
} from './cuisines';

export {
  RecipeEnhancer,
  RecipeAnalyzer
} from './recipes';

export {
  CuisineEnhancer,
  CuisineAnalyzer
} from './cuisines';

// Export singleton instances
// TODO: Fix import - add what to import from "./seasonal.ts"
import { Recipe } from '@/types/recipe';
// TODO: Fix import - add what to import from "./cuisineIntegrations.ts"

import { Element , AlchemicalProperties } from "@/types/alchemy";

// Placeholder classes until imports are fixed
class UnifiedSeasonalSystem {}
class UnifiedCuisineIntegrationSystem {}

export const unifiedSeasonalSystem = new UnifiedSeasonalSystem();
export const unifiedCuisineIntegrationSystem = new UnifiedCuisineIntegrationSystem();

// Export ingredient utility functions with correct names
export {
  getIngredientById,
  getIngredientsByCategory,
  getIngredientsBySubcategory,
  getIngredientsByKalchmRange,
  getIngredientsByElement,
  getIngredientsBySeason,
  unifiedIngredients
} from './ingredients';
