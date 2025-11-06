// Consolidated ingredients export file - Fixed for TS2308 conflicts
// Use explicit re-exports instead of wildcard exports to avoid naming conflicts

// Re-export specific types from types module
export type {
  AlchemicalProperties, CookingMethod,
  ElementalProperties, Ingredient, ThermodynamicProperties
} from './types';

// Re-export specific data from index module (avoiding conflicts)
export {
  VALID_CATEGORIES, getAllGrains, getAllHerbs, getAllIngredientsByCategory, getAllProteins, getAllSpices, getAllVegetables
} from './index';

// Re-export specific ingredient categories with explicit names
export { fruits } from './fruits';
export { allGrains as grains } from './grains';
export { herbs } from './herbs';
export { _allOils as oils } from './oils';
export { meats, plantBased, poultry, seafood } from './proteins/index';
export { seasonings } from './seasonings';
export { spices } from './spices';
export { _enhancedVegetables as vegetables } from './vegetables';
export { vinegars } from './vinegars/vinegars';

// Re-export flavor profiles
export * from './elementalProperties';
export * from './flavorProfiles';

// Re-export the main index as default
import * as ingredientData from './index';

export default ingredientData;
