/**
 * 🌟 Unified Alchemical Calculation Engine v3.0
 *
 * Modern, integrated calculation system for WhatToEatNext
 * Features:
 * - SMES (Spirit/Essence/Matter/Substance/Energy) calculations
 * - Kinetics & Thermodynamics integration
 * - Intelligent caching and API orchestration
 * - Planetary influences and elemental harmony
 * - Recipe optimization and cuisine recommendations
 */

import {
  getCurrentPlanetaryPositions,
  getPlanetaryPositionsForDateTime,
} from "@/services/astrologizeApi";
import {
  onAlchemizeApiCall,
  updateCurrentMoment,
} from "@/services/CurrentMomentManager";
import { alchemize } from "@/services/RealAlchemizeService";
import type {
  ElementalProperties,
  PlanetaryPosition,
  ZodiacSign,
  Element,
} from "@/types/alchemy";
import { Cache } from "@/utils/cache";
import { createLogger } from "@/utils/logger";

// Core calculation modules
import {
  calculateBaseElementalProperties,
  analyzeElementalCompatibility,
  ELEMENTAL_ANALYSIS_INTELLIGENCE,
} from "./core/elementalCalculations";
import {
  calculateKalchmResults,
  type AlchemicalProperties,
  type KalchmResult,
  type ThermodynamicResults,
} from "./core/kalchmEngine";
import {
  calculatePlanetaryInfluences,
  getPlanetaryCulinaryRecommendations,
} from "./core/planetaryInfluences";

// Culinary and recipe systems
import {
  generateCuisineRecommendations,
  // calculateCuisineCompatibility,
} from "./culinary/cuisineRecommendations";

const calculateCuisineCompatibility: any = null; // Commented out non-existent export
import { calculateRecipeCompatibility } from "./culinary/recipeMatching";
import { calculateGregsEnergy } from "./gregsEnergy";
import { calculateKinetics } from "./kinetics";

// Logger and cache setup
const logger = createLogger("UnifiedCalculationEngine");
const calculationCache = new Cache(5 * 60 * 1000); // 5 minute TTL

// ============================================================================
// 🌟 CORE INTERFACES & TYPES
// ============================================================================

/**
 * Unified calculation input for all alchemical operations
 */
export interface UnifiedCalculationInput {
  /** Planetary positions for the calculation */
  planetaryPositions?: Record<string, string>;
  /** Date/time for calculation (defaults to current) */
  dateTime?: Date;
  /** Location coordinates */
  location?: { latitude: number; longitude: number };
  /** Zodiac system preference */
  zodiacSystem?: "tropical" | "sidereal";
  /** Enable caching for performance */
  useCache?: boolean;
  /** Additional context for calculations */
  context?: Record<string, unknown>;
}

/**
 * Complete SMES (Spirit/Essence/Matter/Substance/Energy) calculation result
 */
export interface SMESCalculationResult {
  // SMES Properties
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
  energy: number; // Greg's Energy

  // Elemental Properties
  elements: ElementalProperties;

  // Thermodynamic Metrics
  thermodynamics: ThermodynamicResults;

  // Planetary Influences
  planetaryInfluence: {
    dominantPlanet: string;
    planetaryStrength: number;
    aspectHarmony: number;
  };

  // Kinetics & Dynamics
  kinetics: {
    momentum: number;
    force: number;
    charge: number;
    potential: number;
  };

  // Metadata
  metadata: {
    calculationTime: number;
    cacheUsed: boolean;
    planetaryPositions: Record<string, string>;
    timestamp: string;
  };
}

/**
 * Recipe optimization result
 */
export interface RecipeOptimizationResult {
  recipe: {
    name: string;
    compatibility: number;
    elementalBalance: ElementalProperties;
    smesProfile: Pick<
      SMESCalculationResult,
      "spirit" | "essence" | "matter" | "substance" | "energy"
    >;
  };
  recommendations: {
    cuisine: string;
    dishes: string[];
    reasoning: string[];
  };
  timing: {
    optimalHours: string[];
    lunarPhase: string;
    planetaryHour: string;
  };
}

// ============================================================================
// 🎯 MAIN UNIFIED CALCULATION ENGINE
// ============================================================================

/**
 * 🌟 Unified Alchemical Calculation Engine
 *
 * Single entry point for all alchemical calculations with intelligent:
 * - SMES quantity calculations
 * - API orchestration and caching
 * - Kinetics and thermodynamics integration
 * - Recipe and cuisine optimization
 */
export class UnifiedCalculationEngine {
  private readonly cache: Cache;
  private readonly logger: ReturnType<typeof createLogger>;

  constructor() {
    this.cache = calculationCache;
    this.logger = logger;
  }

  /**
   * 🎭 Calculate complete SMES profile for given conditions
   */
  async calculateSMES(
    input: UnifiedCalculationInput = {},
  ): Promise<SMESCalculationResult> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey("smes", input);

    // Check cache first
    if (input.useCache !== false) {
      const cached = this.cache.get<SMESCalculationResult>(cacheKey);
      if (cached) {
        this.logger.debug("SMES calculation served from cache");
        return { ...cached, metadata: { ...cached.metadata, cacheUsed: true } };
      }
    }

    try {
      // Get planetary positions
      const planetaryPositions =
        input.planetaryPositions ||
        (input.dateTime
          ? await getPlanetaryPositionsForDateTime(
              input.dateTime,
              input.location,
            )
          : await getCurrentPlanetaryPositions());

      // Calculate core alchemical properties
      const alchemicalResult = alchemize(planetaryPositions as any);
      const kalchmResult = calculateKalchmResults(planetaryPositions as any);

      // Calculate elemental properties
      const elementalProperties = calculateBaseElementalProperties(
        planetaryPositions as any,
      );

      // Calculate planetary influences
      const planetaryInfluence = calculatePlanetaryInfluences(
        planetaryPositions as any,
      );

      // Calculate kinetics
      const kinetics = calculateKinetics({
        currentPlanetaryPositions: planetaryPositions as any,
        timeInterval: 3600, // 1 hour default
      });

      // Calculate Greg's Energy
      const gregsEnergy = calculateGregsEnergy({
        Spirit: kalchmResult.alchemicalCounts.Spirit,
        Essence: kalchmResult.alchemicalCounts.Essence,
        Matter: kalchmResult.alchemicalCounts.Matter,
        Substance: kalchmResult.alchemicalCounts.Substance,
        ...elementalProperties,
      });

      // Update current moment tracking
      updateCurrentMoment(planetaryPositions as any);

      // Log API call
      (onAlchemizeApiCall as any)(planetaryPositions, alchemicalResult);

      const result: SMESCalculationResult = {
        // SMES Properties
        spirit: kalchmResult.alchemicalCounts.Spirit,
        essence: kalchmResult.alchemicalCounts.Essence,
        matter: kalchmResult.alchemicalCounts.Matter,
        substance: kalchmResult.alchemicalCounts.Substance,
        energy: (gregsEnergy as any).energy,

        // Elemental Properties
        elements: elementalProperties,

        // Thermodynamic Metrics
        thermodynamics: kalchmResult.thermodynamicResults || ({} as any),

        // Planetary Influences
        planetaryInfluence: {
          dominantPlanet:
            planetaryInfluence.dominantPlanets?.[0]?.planet || "Sun",
          planetaryStrength: (planetaryInfluence as any).strength || 1,
          aspectHarmony: (planetaryInfluence as any).aspectHarmony || 0.8,
        },

        // Kinetics & Dynamics
        kinetics: {
          momentum: (kinetics as any).momentum || 0,
          force: (kinetics as any).force || 0,
          charge: kinetics.charge || 0,
          potential: kinetics.potential || 0,
        },

        // Metadata
        metadata: {
          calculationTime: Date.now() - startTime,
          cacheUsed: false,
          planetaryPositions: planetaryPositions as any,
          timestamp: new Date().toISOString(),
        },
      };

      // Cache result
      if (input.useCache !== false) {
        this.cache.set(cacheKey, result);
      }

      this.logger.info(
        `SMES calculation completed in ${result.metadata.calculationTime}ms`,
      );
      return result;
    } catch (error) {
      this.logger.error("SMES calculation failed:", error);
      throw new Error(
        `SMES calculation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * 🍽️ Optimize recipe based on current alchemical conditions
   */
  async optimizeRecipe(
    recipeName: string,
    recipeElements: ElementalProperties,
    input: UnifiedCalculationInput = {},
  ): Promise<RecipeOptimizationResult> {
    try {
      // Get current SMES profile
      const smesProfile = await this.calculateSMES(input);

      // Calculate recipe compatibility
      const compatibility = calculateRecipeCompatibility(
        {
          id: recipeName,
          name: recipeName,
          ingredients: [],
          elementalProperties: recipeElements,
        } as any,
        smesProfile.elements as any,
      );

      // Generate cuisine recommendations
      const recommendations = generateCuisineRecommendations(
        [
          {
            planet: smesProfile.planetaryInfluence.dominantPlanet,
            strength: smesProfile.planetaryInfluence.planetaryStrength,
            element: "Fire",
          },
        ],
        smesProfile.elements,
      );

      // Get timing recommendations
      const timing = {
        optimalHours: ["12:00", "18:00"], // Default optimal hours
        lunarPhase: "full moon", // Would be calculated from date
        planetaryHour:
          smesProfile.planetaryInfluence.dominantPlanet.toLowerCase(),
      };

      return {
        recipe: {
          name: recipeName,
          compatibility: compatibility.score,
          elementalBalance: recipeElements,
          smesProfile: {
            spirit: smesProfile.spirit,
            essence: smesProfile.essence,
            matter: smesProfile.matter,
            substance: smesProfile.substance,
            energy: smesProfile.energy,
          },
        },
        recommendations: {
          cuisine: recommendations[0]?.cuisine || "Italian",
          dishes: recommendations[0]?.suggestedDishes || [],
          reasoning: recommendations[0]?.reasons || [],
        },
        timing,
      };
    } catch (error) {
      this.logger.error("Recipe optimization failed:", error);
      throw new Error(
        `Recipe optimization failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * 🔮 Get intelligent culinary recommendations
   */
  async getCulinaryRecommendations(
    input: UnifiedCalculationInput = {},
  ): Promise<{
    cuisines: Array<{
      name: string;
      compatibility: number;
      reasoning: string[];
    }>;
    ingredients: string[];
    cookingMethods: string[];
    timing: { optimal: string[]; avoid: string[] };
  }> {
    try {
      const smesProfile = await this.calculateSMES(input);

      // Generate cuisine recommendations
      const cuisineRecs = generateCuisineRecommendations(
        [
          {
            planet: smesProfile.planetaryInfluence.dominantPlanet,
            strength: smesProfile.planetaryInfluence.planetaryStrength,
            element: "Fire",
          },
        ],
        smesProfile.elements,
      );

      // Get planetary culinary recommendations
      const planetaryRecs = getPlanetaryCulinaryRecommendations(
        smesProfile.planetaryInfluence.dominantPlanet as any,
      );

      return {
        cuisines: cuisineRecs.map((rec) => ({
          name: rec.cuisine,
          compatibility: rec.compatibility,
          reasoning: rec.reasons,
        })),
        ingredients: planetaryRecs.ingredients || [],
        cookingMethods: planetaryRecs.cookingMethods || [],
        timing: {
          optimal: ["12:00-14:00", "18:00-20:00"],
          avoid: ["03:00-05:00", "15:00-17:00"],
        },
      };
    } catch (error) {
      this.logger.error("Culinary recommendations failed:", error);
      throw new Error(
        `Culinary recommendations failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * ⚡ Calculate kinetics for dynamic planetary movements
   */
  calculateKinetics(input: {
    currentPositions: Record<string, string>;
    previousPositions?: Record<string, string>;
    timeInterval?: number;
  }) {
    return calculateKinetics({
      currentPlanetaryPositions: input.currentPositions,
      previousPlanetaryPositions: input.previousPositions,
      timeInterval: input.timeInterval || 3600,
    });
  }

  /**
   * 🧪 Get elemental compatibility between two profiles
   */
  getElementalCompatibility(
    profile1: ElementalProperties,
    profile2: ElementalProperties,
  ): number {
    const result = analyzeElementalCompatibility(profile1, profile2);
    return (result as any).compatibility || result;
  }

  private generateCacheKey(
    type: string,
    input: UnifiedCalculationInput,
  ): string {
    const keyParts = [
      type,
      input.dateTime?.toISOString() || "current",
      input.location
        ? `${input.location.latitude},${input.location.longitude}`
        : "default",
      input.zodiacSystem || "tropical",
      JSON.stringify(input.planetaryPositions || {}),
      JSON.stringify(input.context || {}),
    ];
    return keyParts.join("|");
  }
}

// ============================================================================
// 🎭 CONVENIENCE FUNCTIONS & EXPORTS
// ============================================================================

/**
 * 🌟 Singleton instance of the unified calculation engine
 */
export const calculationEngine = new UnifiedCalculationEngine();

/**
 * 🎭 Main SMES calculation function (convenience export)
 */
export async function calculateSMES(
  input?: UnifiedCalculationInput,
): Promise<SMESCalculationResult> {
  return calculationEngine.calculateSMES(input);
}

/**
 * 🍽️ Recipe optimization function (convenience export)
 */
export async function optimizeRecipe(
  recipeName: string,
  recipeElements: ElementalProperties,
  input?: UnifiedCalculationInput,
): Promise<RecipeOptimizationResult> {
  return calculationEngine.optimizeRecipe(recipeName, recipeElements, input);
}

/**
 * 🔮 Culinary recommendations function (convenience export)
 */
export async function getCulinaryRecommendations(
  input?: UnifiedCalculationInput,
) {
  return calculationEngine.getCulinaryRecommendations(input);
}

/**
 * ⚡ Kinetics calculation function (convenience export)
 */
export function calculatePlanetaryKinetics(input: {
  currentPositions: Record<string, string>;
  previousPositions?: Record<string, string>;
  timeInterval?: number;
}) {
  return calculationEngine.calculateKinetics(input);
}

// ============================================================================
// 📤 LEGACY EXPORTS (for backward compatibility)
// ============================================================================

// Export all core calculation modules for direct access
export * from "./core/elementalCalculations";
export * from "./core/kalchmEngine";
// Commented to avoid duplicate export with alchemicalCalculations
// export * from "./core/planetaryInfluences";

// Export culinary systems
export * from "./culinary/cuisineRecommendations";
export * from "./culinary/recipeMatching";

// Export thermodynamics and kinetics
export { calculateGregsEnergy } from "./gregsEnergy";
export { calculateKinetics } from "./kinetics";

// Export legacy calculation modules
export * from "./alchemicalCalculations";
export * from "./alchemicalTransformation";
export * from "./combinationEffects";
export * from "./culinaryAstrology";
export * from "./enhancedAlchemicalMatching";
export * from "./enhancedCuisineRecommender";

// Default export - the unified engine
export default calculationEngine;
