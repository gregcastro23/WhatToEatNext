// ===== UNIFIED DATA SYSTEMS INDEX =====;
// Central export point for all unified data systems
// Phases 12, and 3 consolidated systems

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

// Pattern OO-4: Integration Import Resolution - Fix type imports to use correct sources
export type { UnifiedIngredient } from './ingredients';

// Import types from their actual sources
export type { AlchemicalProperties, ThermodynamicMetrics } from '@/types/alchemy';

export type { EnhancedRecipe } from './recipes';

export type { EnhancedCuisine } from './cuisines';

export { RecipeEnhancer, RecipeAnalyzer } from './recipes';

export { CuisineEnhancer, CuisineAnalyzer } from './cuisines';

// Export singleton instances

// Placeholder classes until imports are fixed
class UnifiedSeasonalSystem {}
class UnifiedCuisineIntegrationSystem {}

export const _unifiedSeasonalSystem = new UnifiedSeasonalSystem();
export const _unifiedCuisineIntegrationSystem = new UnifiedCuisineIntegrationSystem();

// Pattern OO-4: Integration Import Resolution - Export only existing functions
export {
  getIngredientById,
  getIngredientsByCategory,
  getIngredientsBySubcategory,
  getIngredientsByKalchmRange,
  getIngredientsByElement,
  unifiedIngredients
} from './ingredients';
