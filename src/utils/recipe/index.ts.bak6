/**
 * Recipe Utilities Index
 *
 * Centralized exports for all recipe-related utilities including
 * computation, validation, caching, and enhancement functions.
 */

// Core computation engine
export {
    COOKING_METHOD_MODIFIERS, aggregateIngredientElementals,
    applyCookingMethodTransforms, calculateQuantityScalingFactor, calculateRecipeKinetics, computeRecipeProperties,
    computeRecipePropertiesSimple, scaleIngredientByQuantity
} from '../hierarchicalRecipeCalculations';

// Validation system
export {
    getValidationStatistics, validateRecipe,
    validateRecipes
} from './recipeValidation';

// Caching system
export {
    batchCacheOperations, createRecipeComputationCache, exportCacheData, getCachePerformanceMetrics, getRecipeComputationCache, importCacheData, withComputationCaching
} from './recipeComputationCache';

// Enhanced recipe types
export type {
    BatchEnhancementResult, EnhancedRecipe, RecipeComputationCache,
    RecipeEnhancementOptions, RecipeRecommendation, RecipeRecommendationContext, RecipeSearchCriteria, RecipeValidationResult
} from '../../types/recipe/enhancedRecipe';

// Hierarchical types
export type {
    AstrologicalTiming, CookingMethodTransformation, QuantityScaledProperties, RecipeComputationOptions, RecipeComputedProperties
} from '../../types/hierarchy';

// Re-export existing utilities for convenience
export * from './recipeAdapter';
export * from './recipeEnrichment';
export * from './recipeFiltering';
export * from './recipeMatching';
export * from './recipeUtils';
