// ===== UNIFIED TYPES SYSTEM =====;
// This file defines type interfaces for the unified data system
// with compatibility for existing type systems

import type {
  Element,
  AlchemicalProperties,
  IngredientMapping,
  ElementalProperties,
  NutritionalProfile,
  Season,
  PlanetName,
  ZodiacSign,
  ThermodynamicMetrics,
  ThermodynamicProperties,
  FlavorProfile,
  CookingMethod
} from '@/types/alchemy';

/**
 * UnifiedIngredient interface combines properties from multiple Ingredient interfaces
 * across the system while ensuring compatibility with the data consolidation system.
 */
export interface UnifiedIngredient {
  // Core Properties required by multiple interfaces
  name: string,
  category: string,
  subcategory?: string,
  amount?: number,
  unit?: string,
  element?: Element,

  // Elemental Properties (Self-Reinforcement Compliant)
  elementalProperties: ElementalProperties,

  // Alchemical Properties (Core Metrics)
  alchemicalProperties: AlchemicalProperties,

  // Kalchm Value (Intrinsic Alchemical Equilibrium)
  kalchm?: number; // K_alchm = (Spirit^Spirit * Essence^Essence) / (Matter^Matter * Substance^Substance)
  monica?: number

  // Enhanced Properties;
  flavorProfile?: { [key: string]: number }
  nutritionalProfile?: NutritionalProfile,
  astrologicalProfile?: {
    elementalAffinity?: {
      base: string,
      secondary?: string
    }
    rulingPlanets?: PlanetName[] | string[],
    favorableZodiac?: any[] | string[],
    zodiacAffinity?: any[] | string[]
  }

  // Energy properties
  energyProfile?: ThermodynamicMetrics,
  energyValues?: ThermodynamicProperties,

  // Additional properties for compatibility
  culinaryProperties?: unknown,
  storage?: unknown,
  preparation?: unknown,
  qualities?: string[],
  origin?: string[],
  affinities?: string[],
  healthBenefits?: string[],
  seasonality?: Season[],
  season?: Season[],
  score?: number,
  intensity?: number,
  complexity?: number,
  swaps?: string[],
  culturalOrigins?: string[] | unknown,
  elementalAffinity?: {
    base: string,
    secondary?: string
  }
  tags?: string[],
  pairingRecommendations?: string[],
  preparationMethods?: string[],
  description?: string,
  planetaryRuler?: PlanetName

  // Metadata
  metadata?: {
    sourceFile: string,
    enhancedAt: string,
    kalchmCalculated: boolean
  }

  // Allow additional properties
  [key: string]: unknown
}

/**
 * Helper function to create a basic valid UnifiedIngredient with default values
 */
export function createUnifiedIngredient(name: string, category: string): UnifiedIngredient {
  return {
    name,
    category,
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    alchemicalProperties: {
      Spirit: 0,
      Essence: 0,
      Matter: 0,
      Substance: 0
}
  }
}

/**
 * Type guard to check if an object is a valid UnifiedIngredient
 */
export function isUnifiedIngredient(obj: unknown): obj is UnifiedIngredient {
  if (!obj || typeof obj !== 'object') return false;
  const ingredient = obj as Partial<UnifiedIngredient>;
  return (
    typeof ingredient.name === 'string' &&
    typeof ingredient.category === 'string' &&
    ingredient.elementalPropertiesState !== undefined &&
    typeof ingredient.elementalPropertiesState === 'object' &&
    ingredient.alchemicalProperties !== undefined &&
    typeof ingredient.alchemicalProperties === 'object'
  );
}