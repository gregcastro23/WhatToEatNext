/**
 * Common Types Export File
 *
 * This file re-exports all common types from a single location to ensure type consistency
 * throughout the application. Import types from this file rather than directly from
 * individual type definition files to avoid type mismatches.
 */

// Import Season, ZodiacSign, CookingMethod as types from constants.ts
import type {
  CookingMethod,
  ElementType,
  LunarPhase,
  Planet,
  Season,
  ZodiacSign,
} from "./constants";
// Import LunarPhase as type from constants.ts

// Define types directly since they're not exported from constants
type Element = "Fire" | "Water" | "Earth" | "Air";
type PlanetName =
  | "Sun"
  | "Moon"
  | "Mercury"
  | "Venus"
  | "Mars"
  | "Jupiter"
  | "Saturn";
// Define necessary types directly if they're not available for import
// Define a simplified AstrologicalState type
export interface AstrologicalState {
  currentZodiac?: string;
  sunSign?: string;
  moonPhase?: string;
  lunarPhase?: string;
  activePlanets?: string[];
  [key: string]: unknown;
}

// Define a simplified ElementalProperties type
export interface ElementalProperties {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
  [key: string]: number;
}

// Define basic Recipe and RecipeIngredient types
export interface RecipeIngredient {
  name: string;
  amount?: number | string;
  unit?: string;
  [key: string]: unknown;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  [key: string]: unknown;
}

export interface ScoredRecipe extends Recipe {
  score: number;
}

// Define a simplified Ingredient type
export interface Ingredient {
  name: string;
  [key: string]: unknown;
}

// Re-export all types
export type {
  Season,
  ZodiacSign,
  LunarPhase,
  CookingMethod,
  ElementType as Element,
  Planet as PlanetName,
};

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
    return value.map((v) => v as Season);
  }
  return value as Season;
}
