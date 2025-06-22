// Consolidated ingredients export file - Fixed for TS2308 conflicts
// Use explicit re-exports instead of wildcard exports to avoid naming conflicts

// Re-export specific types from types module
export type { 
  Ingredient,
  CookingMethod,
  ElementalProperties,
  AlchemicalProperties,
  ThermodynamicProperties
} from './types';

// Re-export specific data from index module (avoiding conflicts)
export { 
  VALID_CATEGORIES,
  DEFAULT_ELEMENTAL_PROPERTIES,
  getAllIngredientsByCategory,
  getAllVegetables,
  getAllProteins,
  getAllHerbs,
  getAllSpices,
  getAllGrains
} from './index';

// Re-export specific ingredient categories with explicit names
export { fruits } from './fruits';
export { enhancedVegetables as vegetables } from './vegetables';
export { herbs } from './herbs';
export { spices } from './spices';
export { allGrains as grains } from './grains';
export { allOils as oils } from './oils';
export { seasonings } from './seasonings';
export { vinegars } from './vinegars/vinegars';
export { meats, poultry, seafood, plantBased } from './proteins/index';

// Re-export flavor profiles
export * from './flavorProfiles';
export * from './elementalProperties';

// Re-export the main index as default
import * as ingredientData from './index';
export default ingredientData; 