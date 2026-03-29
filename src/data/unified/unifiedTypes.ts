// ===== UNIFIED TYPES SYSTEM =====;
// This file defines type interfaces for the unified data system
// with compatibility for existing type systems

import type {
  Element,
  AlchemicalProperties,
  _IngredientMapping,
  ElementalProperties,
  NutritionalProfile,
  Season,
  PlanetName,
  _ZodiacSignType,
  ThermodynamicMetrics,
  ThermodynamicProperties,
  _FlavorProfile,
  _CookingMethod,
} from "@/types/alchemy";

type PlanetaryFlavorInfluence = unknown;
type CuisineFlavorCompatibility = unknown;

export interface UnifiedFlavorProfile {
  id: string;
  name: string;
  category: "cuisine" | "planetary" | "elemental" | "ingredient" | "fusion";
  baseNotes: BaseFlavorNotes;
  elementalFlavors: ElementalProperties;
  intensity: number;
  complexity: number;
  kalchm: number;
  monicaOptimization: number;
  alchemicalProperties: AlchemicalProperties;
  seasonalPeak: Season[];
  seasonalModifiers: Record<Season, number>;
  culturalOrigins: string[];
  pairingRecommendations: string[];
  nutritionalSynergy: number;
  description: string;
  planetaryResonance: Record<PlanetName, PlanetaryFlavorInfluence>;
  cuisineCompatibility: { [key: string]: CuisineFlavorCompatibility };
  cookingMethodAffinity: Record<string, number>;
  temperatureRange: { min: number; max: number };
  avoidCombinations: string[];
}

export interface BaseFlavorNotes {
  sweet: number;
  sour: number;
  salty: number;
  bitter: number;
  umami: number;
  spicy: number;
}

/**
 * UnifiedIngredient interface combines properties from multiple Ingredient interfaces
 * across the system while ensuring compatibility with the data consolidation system.
 */
export interface UnifiedIngredient {
  // Core Properties required by multiple interfaces
  name: string;
  category: string;
  subcategory?: string;
  amount?: number;
  unit?: string;
  element?: Element;

  // Elemental Properties (Self-Reinforcement Compliant)
  elementalProperties: ElementalProperties;

  // Alchemical Properties (Core Metrics)
  alchemicalProperties: AlchemicalProperties;

  // Kalchm Value (Intrinsic Alchemical Equilibrium)
  kalchm?: number; // K_alchm = (Spirit^Spirit * Essence^Essence) / (Matter^Matter * Substance^Substance)
  monica?: number;

  // Enhanced Properties;
  flavorProfile?: { [key: string]: number };
  nutritionalProfile?: NutritionalProfile;
  astrologicalProfile?: {
    elementalAffinity?: {
      base: string;
      secondary?: string;
    };
    rulingPlanets?: PlanetName[] | string[];
    favorableZodiac?: any[] | string[];
    zodiacAffinity?: any[] | string[];
  };

  // Energy properties
  energyProfile?: ThermodynamicMetrics;
  energyValues?: ThermodynamicProperties;

  // Additional properties for compatibility
  culinaryProperties?: unknown;
  storage?: unknown;
  preparation?: unknown;
  qualities?: string[];
  origin?: string[];
  affinities?: string[];
  healthBenefits?: string[];
  seasonality?: Season[];
  season?: Season[];
  score?: number;
  intensity?: number;
  complexity?: number;
  swaps?: string[];
  culturalOrigins?: string[] | unknown;
  elementalAffinity?: {
    base: string;
    secondary?: string;
  };
  tags?: string[];
  pairingRecommendations?: string[];
  preparationMethods?: string[];
  description?: string;
  planetaryRuler?: PlanetName;

  // Metadata
  metadata?: {
    sourceFile: string;
    enhancedAt: string;
    kalchmCalculated: boolean;
  };

  // Allow additional properties
  [key: string]: unknown;
}

/**
 * Helper function to create a basic valid UnifiedIngredient with default values.
 * Alchemical properties are derived from elemental properties using the
 * standard elemental-to-alchemical mapping rather than placeholder zeros.
 */
export function createUnifiedIngredient(
  name: string,
  category: string,
  elementalProperties: ElementalProperties = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
): UnifiedIngredient {
  const { Fire, Water, Earth, Air } = elementalProperties;
  return {
    name,
    category,
    elementalProperties,
    alchemicalProperties: {
      Spirit: Fire * 0.6 + Air * 0.4,
      Essence: Water * 0.5 + Fire * 0.3 + Air * 0.2,
      Matter: Earth * 0.7 + Water * 0.3,
      Substance: Earth * 0.5 + Water * 0.4 + Fire * 0.1,
    },
  };
}

/**
 * Type guard to check if an object is a valid UnifiedIngredient
 */
export function isUnifiedIngredient(obj: unknown): obj is UnifiedIngredient {
  if (!obj || typeof obj !== "object") return false;
  const ingredient = obj as Partial<UnifiedIngredient>;
  return (
    typeof ingredient.name === "string" &&
    typeof ingredient.category === "string" &&
    ingredient.elementalPropertiesState !== undefined &&
    typeof ingredient.elementalPropertiesState === "object" &&
    ingredient.alchemicalProperties !== undefined &&
    typeof ingredient.alchemicalProperties === "object"
  );
}
