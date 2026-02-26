/**
 * Hierarchical Culinary Data Type System
 *
 * This module defines the three-tier architecture for culinary data:
 * 1. Ingredients: Store only elemental properties (Fire, Water, Earth, Air)
 * 2. Recipes: Compute alchemical + thermodynamic properties from planetary positions + ingredients
 * 3. Cuisines: Aggregate statistics and signatures from recipe collections
 *
 * CRITICAL PRINCIPLE:
 * - Ingredients have NO alchemical properties (Spirit/Essence/Matter/Substance)
 * - Recipes require planetary positions to calculate ESMS values
 * - Cuisines aggregate patterns and identify cultural signatures
 */

import type {
  AlchemicalProperties,
  CookingMethod,
  ElementalProperties,
  LunarPhase,
  Season,
  ThermodynamicProperties,
} from "@/types/alchemy";
import type { KineticMetrics } from "@/types/kinetics";
import type { Recipe, RecipeIngredient } from "@/types/recipe";

// ========== TIER 1: INGREDIENT LEVEL ==========

/**
 * Ingredient Data Structure
 *
 * Ingredients contain ONLY elemental properties at their core level.
 * No alchemical properties (ESMS) can exist without astrological context.
 */
export interface IngredientData {
  /** Core elemental properties (Fire, Water, Earth, Air) - must sum to 1.0 */
  elementalProperties: ElementalProperties;

  /** Optional astrological affinities (ruling planets, favorable signs) */
  astrologicalProfile?: {
    rulingPlanets?: string[];
    favorableZodiac?: string[];
    seasonalAffinity?: Season[];
    lunarPhasePreferences?: LunarPhase[];
  };

  /** Physical and culinary metadata */
  qualities?: string[];
  category?: string;
  subCategory?: string;
  origin?: string[];
  affinities?: string[];
  cookingMethods?: string[];
}

// ========== TIER 2: RECIPE LEVEL ==========

/**
 * Recipe Computed Properties
 *
 * These properties are calculated on-demand, not stored.
 * Require planetary positions for ESMS calculation.
 */
export interface RecipeComputedProperties {
  /** Alchemical properties derived from planetary positions */
  alchemicalProperties: AlchemicalProperties;

  /** Elemental properties aggregated from ingredients + zodiac signs */
  elementalProperties: ElementalProperties;

  /** Thermodynamic metrics calculated from ESMS + elementals */
  thermodynamicProperties: ThermodynamicProperties;

  /** Kinetic properties using P=IV circuit model */
  kineticProperties: KineticMetrics;

  /** Dominant properties for quick reference */
  dominantElement: keyof ElementalProperties;
  dominantAlchemicalProperty: keyof AlchemicalProperties;

  /** Computation metadata */
  computationMetadata: {
    planetaryPositionsUsed: { [planet: string]: string };
    cookingMethodsApplied: CookingMethod[];
    computationTimestamp: Date;
  };
}

/**
 * Astrological Timing for Recipes
 *
 * Optional field storing recommended planetary positions for optimal preparation.
 */
export interface AstrologicalTiming {
  /** Recommended planetary positions for this recipe */
  optimalPositions: { [planet: string]: string };

  /** Explanation of why these positions are optimal */
  rationale?: string;

  /** Alternative acceptable positions */
  alternativePositions?: Array<{
    positions: { [planet: string]: string };
    suitability: number; // 0-1 scale
    notes?: string;
  }>;

  /** Lunar phase recommendations */
  optimalLunarPhases?: LunarPhase[];

  /** Seasonal recommendations */
  optimalSeasons?: Season[];
}

/**
 * Recipe Data Structure
 *
 * Recipes store ingredient lists and cooking methods.
 * Alchemical/thermodynamic properties are computed on-demand.
 */
export interface RecipeData extends Recipe {
  /** List of ingredients with quantities */
  ingredients: RecipeIngredient[];

  /** Cooking methods applied sequentially */
  cookingMethods: CookingMethod[];

  /** Optional: recommended astrological timing */
  astrologicalTiming?: AstrologicalTiming;

  /** Computed properties (calculated dynamically, not persisted) */
  _computed?: RecipeComputedProperties;
}

// ========== TIER 3: CUISINE LEVEL ==========

/**
 * Cuisine Signature
 *
 * Identifies distinctive properties of a cuisine through statistical analysis.
 * A signature exists when a property's z-score exceeds ±1.5 from global average.
 */
export interface CuisineSignature {
  /** The property that forms the signature */
  property:
    | keyof AlchemicalProperties
    | keyof ThermodynamicProperties
    | keyof ElementalProperties;

  /** Z-score relative to global cuisine average */
  zscore: number;

  /** Strength classification */
  strength: "low" | "moderate" | "high" | "very_high";
  /** Average value for this property in this cuisine */
  averageValue: number;

  /** Global average for comparison */
  globalAverage: number;

  /** Human-readable description */
  description?: string;
}

/**
 * Property Variance
 *
 * Statistical spread of properties within a cuisine.
 * High variance = diverse cuisine, low variance = consistent cuisine.
 */
export interface PropertyVariance {
  /** Elemental property variance (standard deviation) */
  elementals: ElementalProperties;

  /** Alchemical property variance */
  alchemical?: Partial<AlchemicalProperties>;

  /** Thermodynamic property variance */
  thermodynamics?: Partial<ThermodynamicProperties>;

  /** Overall diversity score (0-1, higher = more diverse) */
  diversityScore: number;
}

/**
 * Common Planetary Patterns
 *
 * Identifies frequently occurring planetary positions in a cuisine's recipes.
 */
export interface PlanetaryPattern {
  /** Planet name */
  planet: string;

  /** Most common zodiac signs for this planet (sorted by frequency) */
  commonSigns: Array<{
    sign: string;
    frequency: number; // Proportion of recipes with this placement
  }>;

  /** Dominant element for this planet across recipes */
  dominantElement: keyof ElementalProperties;

  /** Planetary strength metric (optional) */
  planetaryStrength?: number;
}

/**
 * Cultural Influence Modifiers
 *
 * Additional contextual factors affecting cuisine properties.
 */
export interface CulturalInfluence {
  /** Geographic region */
  region?: string;

  /** Climate influences */
  climate?: "tropical" | "temperate" | "arctic" | "desert" | "mediterranean";
  /** Historical influences from other cuisines */
  culturalExchanges?: string[];

  /** Traditional preparation philosophies */
  philosophies?: string[];
}

/**
 * Cuisine Computed Properties
 *
 * Aggregated statistics and signatures calculated from recipe collections.
 */
export interface CuisineComputedProperties {
  /** Weighted average elemental properties across all recipes */
  averageElementals: ElementalProperties;

  /** Weighted average alchemical properties (if planetary data available) */
  averageAlchemical?: AlchemicalProperties;

  /** Weighted average thermodynamic metrics */
  averageThermodynamics?: ThermodynamicProperties;

  /** Statistical variance of properties */
  variance: PropertyVariance;

  /** Distinctive signatures (z-score > 1.5) */
  signatures: CuisineSignature[];

  /** Common planetary patterns in recipes */
  planetaryPatterns?: PlanetaryPattern[];

  /** Number of recipes analyzed */
  sampleSize: number;

  /** Computation metadata */
  computedAt: Date;
  version: string; // Algorithm version for cache invalidation
}

/**
 * Cuisine Data Structure
 *
 * Top-level cuisine definition with aggregated properties.
 */
export interface CuisineData {
  /** Unique identifier */
  id: string;

  /** Display name */
  name: string;

  /** Description and history */
  description?: string;

  /** Recipe collections organized by meal type and season */
  dishes: {
    [mealType: string]: {
      [season: string]: RecipeData[];
    };
  };

  /** Cultural context */
  culturalInfluence?: CulturalInfluence;

  /** Computed properties (calculated dynamically from recipes) */
  _computed?: CuisineComputedProperties;
}

// ========== COMPUTATION OPTIONS ==========

/**
 * Recipe Computation Options
 *
 * Configuration for recipe property calculations.
 */
export interface RecipeComputationOptions {
  /** Planetary positions to use (required for ESMS) */
  planetaryPositions: { [planet: string]: string };

  /** Whether to apply cooking method transformations */
  applyCookingMethods?: boolean;

  /** Ingredient quantity scaling method */
  quantityScaling?: "linear" | "logarithmic";
  /** Cache computation results */
  cacheResults?: boolean;
}

/**
 * Cuisine Computation Options
 *
 * Configuration for cuisine-level aggregations.
 */
export interface CuisineComputationOptions {
  /** Weighting strategy for recipe averaging */
  weightingStrategy?: "equal" | "popularity" | "representativeness";
  /** Minimum z-score for signature identification */
  signatureThreshold?: number; // Default: 1.5

  /** Global averages for z-score calculation */
  globalAverages?: {
    elementals?: ElementalProperties;
    alchemical?: AlchemicalProperties;
    thermodynamics?: Partial<ThermodynamicProperties>;
  };

  /** Include variance calculations */
  includeVariance?: boolean;

  /** Identify planetary patterns */
  identifyPlanetaryPatterns?: boolean;
}

// ========== HELPER TYPES ==========

/**
 * Quantity-Scaled Ingredient Properties
 *
 * Elemental properties adjusted for ingredient quantity in a recipe.
 */
export interface QuantityScaledProperties {
  /** Base ingredient properties */
  base: ElementalProperties;

  /** Scaled properties after quantity adjustment */
  scaled: ElementalProperties;

  /** Quantity value */
  quantity: number;

  /** Unit of measurement */
  unit: string;

  /** Scaling factor applied */
  scalingFactor: number;
}

/**
 * Cooking Method Transformation
 *
 * Effect of a cooking method on elemental properties.
 */
export interface CookingMethodTransformation {
  /** Method identifier */
  methodId: string;

  /** Method name */
  methodName: string;

  /** Elemental property multipliers */
  elementalModifiers: Partial<ElementalProperties>;

  /** Thermodynamic effects */
  thermodynamicImpact?: {
    heatAddition?: number;
    entropyIncrease?: number;
    reactivityChange?: number;
  };

  /** Application order (for sequential method application) */
  order?: number;
}

/**
 * Computation Result with Confidence
 *
 * Generic result wrapper with confidence scoring.
 */
export interface ComputationResult<T> {
  /** Computed value */
  value: T;

  /** Confidence score (0-1) */
  confidence: number;

  /** Computation method used */
  method: string;

  /** Warnings or caveats */
  warnings?: string[];
}

// ========== EXPORTS ==========

export type {
  AlchemicalProperties,
  CookingMethod,
  // Re-export imported types for convenience
  ElementalProperties,
  LunarPhase,
  Recipe,
  RecipeIngredient,
  Season,
  ThermodynamicProperties,
};
