/**
 * Common Types Export File
 * 
 * This file re-exports all common types from a single location to ensure type consistency
 * throughout the application. Import types from this file rather than directly from
 * individual type definition files to avoid type mismatches.
 */

// Re-export Season from constants.ts (the authoritative source)
export { Season } from './constants';

// Re-export ElementalProperties from alchemy.ts but make it compatible with other interfaces
export { 
  ElementalProperties,
  Element,
  CookingMethod,
  ZodiacSign,
  PlanetName,
  LunarPhase,
  AstrologicalState,
  StandardizedAlchemicalResult,
} from './alchemy';

// Re-export recipe types
export {
  Recipe,
  RecipeIngredient,
  ScoredRecipe
} from './recipe';

// Re-export other common types as needed
export { Ingredient } from './ingredient';

// Type conversion utilities

/**
 * Converts a string to a valid CookingMethod enum value if possible
 * This helps with tests and data migration where string values might be used
 */
export function toCookingMethod(value: string): CookingMethod {
  // We're casting here since we know these values are valid
  // This function should only be used in tests or data migration
  return value as CookingMethod;
}

/**
 * Converts a string or array of strings to Season enum values
 */
export function toSeason(value: string | string[]): Season | Season[] {
  if (Array.isArray(value)) {
    return value.map(v => v as Season);
  }
  return value as Season;
} 