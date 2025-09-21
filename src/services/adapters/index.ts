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
    EnhancedFoodAlchemySystem, default as enhancedFoodAlchemySystem
} from './FoodAlchemySystemAdapter';

// Export EnhancedIngredientSystem
export {
    EnhancedIngredientSystem, default as enhancedIngredientSystem
} from './IngredientServiceAdapter';

// Export NutritionalDataAdapter
export {
    default as nutritionalDataAdapter,
    type NutritionalDataAdapterInterface
} from './NutritionalDataAdapter';

// Export other adapters as they are created
// export { default as someOtherAdapter } from './SomeOtherAdapter';
