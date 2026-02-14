// Unified Astrological Type Hub - Single Source of Truth

// Import types for local use
import type {
  ElementalProperties,
  PlanetaryPosition,
  AstrologicalState,
  ZodiacSignType,
  LunarPhase,
  Ingredient,
} from "../alchemy";
import type { Recipe } from "../recipe";

// Re-export all astrological types from their sources
export type {
  ElementalProperties,
  PlanetaryPosition,
  AstrologicalState,
  ZodiacSignType,
  LunarPhase,
  Ingredient,
} from "../alchemy";
export type { Recipe } from "../recipe";

export type { Recipe as UnifiedRecipe } from "../recipe";

// Bridge types for compatibility
export interface FlexibleAstrologicalData {
  [key: string]: unknown;
  elementalProperties?: ElementalProperties;
  planetaryInfluences?: PlanetaryPosition[];
  zodiacSign?: ZodiacSignType;
  lunarPhase?: LunarPhase;
}

export interface SafeAstrologicalAccess {
  getData<T>(path: string): T | undefined;
  hasProperty(path: string): boolean;
  validateStructure(): boolean;
}

// Utility type for gradual migration
export type PartiallyTyped<T> = {
  [K in keyof T]?: T[K] | unknown;
};
