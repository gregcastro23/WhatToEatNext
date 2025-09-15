
/**
 * Service Adapters Index
 *
 * This file exports all service adapters for easy importing throughout the application.
 * These adapters provide a bridge between legacy service implementations and the new
 * modern service architecture.
 */

// Export UnifiedDataAdapter
export {
  default as unifiedDataAdapter,
  type UnifiedDataAdapterInterface
} from './UnifiedDataAdapter';

// Export FoodAlchemySystemAdapter
export {
  default as enhancedFoodAlchemySystem,
  EnhancedFoodAlchemySystem
} from './FoodAlchemySystemAdapter';

// Export EnhancedIngredientSystem
export {
  default as enhancedIngredientSystem,
  EnhancedIngredientSystem
} from './IngredientServiceAdapter';

// Export NutritionalDataAdapter
export {
  default as nutritionalDataAdapter,
  type NutritionalDataAdapterInterface
} from './NutritionalDataAdapter';

// Export LegacyIngredientAdapter
export {
  default as legacyIngredientAdapter,
  LegacyIngredientAdapter
} from './LegacyIngredientAdapter';

// Export LegacyRecipeAdapter
export { default as legacyRecipeAdapter, LegacyRecipeAdapter } from './LegacyRecipeAdapter';

// Export LegacyRecommendationAdapter
export {
  default as legacyRecommendationAdapter,
  LegacyRecommendationAdapter
} from './LegacyRecommendationAdapter';

// Export other adapters as they are created
// export { default as someOtherAdapter } from './SomeOtherAdapter';
