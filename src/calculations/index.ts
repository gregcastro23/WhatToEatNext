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
} from "@/types/alchemy";
import type { CelestialPosition } from "@/types/celestial";
import type { KineticMetrics } from "@/types/kinetics";
import { Cache } from "@/utils/cache";
import { createLogger } from "@/utils/logger";
import {
  analyzeElementalCompatibility, calculateBaseElementalProperties,
} from "./core/elementalCalculations";
import {
  calculateKalchmResults, type ThermodynamicResults,
} from "./core/kalchmEngine";
import {
  calculatePlanetaryInfluences,
  getPlanetaryCulinaryRecommendations,
} from "./core/planetaryInfluences";
import {
  generateCuisineRecommendations,
} from "./culinary/cuisineRecommendations";
import { calculateRecipeCompatibility } from "./culinary/recipeMatching";
import { calculateGregsEnergy } from "./gregsEnergy";
import { calculateKinetics } from "./kinetics";

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
  planetaryPositions?: Record<string, CelestialPosition>;
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
function toZodiacSign(sign?: string): import("@/types/celestial").ZodiacSignType {
  const normalized = (sign ?? "aries").toLowerCase();
  const validSigns: Array<import("@/types/celestial").ZodiacSignType> = [
    "aries", "taurus", "gemini", "cancer", "leo", "virgo",
    "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
  ];
  return validSigns.includes(normalized as import("@/types/celestial").ZodiacSignType)
    ? (normalized as import("@/types/celestial").ZodiacSignType)
    : "aries";
}

function toRealAlchemizePositions(
  positions: Record<string, CelestialPosition>,
): Record<string, import("@/services/RealAlchemizeService").PlanetaryPosition> {
  const mapped: Record<string, import("@/services/RealAlchemizeService").PlanetaryPosition> = {};
  for (const [planet, pos] of Object.entries(positions)) {
    mapped[planet] = {
      sign: pos.sign ?? "aries",
      degree: pos.degree ?? 0,
      minute: pos.minutes ?? 0,
      isRetrograde: Boolean(pos.isRetrograde),
      exactLongitude: pos.exactLongitude,
    };
  }
  return mapped;
}

function toAlchemyPlanetaryPositions(
  positions: Record<string, CelestialPosition>,
): Record<string, import("@/types/alchemy").PlanetaryPosition> {
  const mapped: Record<string, import("@/types/alchemy").PlanetaryPosition> = {};
  for (const [planet, pos] of Object.entries(positions)) {
    mapped[planet] = {
      sign: toZodiacSign(pos.sign),
      degree: pos.degree ?? 0,
      minute: pos.minutes,
      isRetrograde: pos.isRetrograde,
      longitude: pos.exactLongitude,
    };
  }
  return mapped;
}

function toAstrologyUtilsPlanetPositions(
  positions: Record<string, CelestialPosition>,
): Record<string, import("@/utils/astrologyUtils").PlanetPosition> {
  const mapped: Record<string, import("@/utils/astrologyUtils").PlanetPosition> = {};
  for (const [planet, pos] of Object.entries(positions)) {
    mapped[planet] = {
      sign: toZodiacSign(pos.sign),
      degree: pos.degree ?? 0,
      minute: pos.minutes ?? 0,
      exactLongitude: pos.exactLongitude ?? 0,
      isRetrograde: Boolean(pos.isRetrograde),
    };
  }
  return mapped;
}

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
      const planetaryPositions: Record<string, CelestialPosition> =
        input.planetaryPositions ??
        (input.dateTime
          ? await getPlanetaryPositionsForDateTime(
              input.dateTime,
              input.location,
            )
          : await getCurrentPlanetaryPositions());

      const alchemizePositions = toRealAlchemizePositions(planetaryPositions);
      const alchemyPositions = toAlchemyPlanetaryPositions(planetaryPositions);
      const astrologyPositions = toAstrologyUtilsPlanetPositions(planetaryPositions);
      const stringPositionsRecord: Record<string, string> = Object.fromEntries(
        Object.entries(planetaryPositions).map(([k, v]) => [
          k,
          typeof v === "string" ? v : v.sign ?? "aries",
        ]),
      );

      // Calculate core alchemical properties
      alchemize(alchemizePositions);
      const kalchmResult = calculateKalchmResults(alchemyPositions);

      // Calculate elemental properties
      const elementalProperties = calculateBaseElementalProperties(planetaryPositions);

      // Calculate planetary influences
      const planetaryInfluence = calculatePlanetaryInfluences(alchemyPositions);

      // Calculate kinetics
      const kinetics = calculateKinetics({
        currentPlanetaryPositions: stringPositionsRecord,
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
      updateCurrentMoment(input.dateTime, input.location);

      // Log API call
      onAlchemizeApiCall(astrologyPositions);

      const [dominantPlanetObj] = planetaryInfluence.dominantPlanets;
      const result: SMESCalculationResult = {
        // SMES Properties
        spirit: kalchmResult.alchemicalCounts.Spirit,
        essence: kalchmResult.alchemicalCounts.Essence,
        matter: kalchmResult.alchemicalCounts.Matter,
        substance: kalchmResult.alchemicalCounts.Substance,
        energy: gregsEnergy.gregsEnergy,
        // Elemental Properties
        elements: elementalProperties,
        // Thermodynamic Metrics
        thermodynamics: kalchmResult.thermodynamicResults ?? ({} as ThermodynamicResults),
        // Planetary Influences
        planetaryInfluence: {
          dominantPlanet: dominantPlanetObj.planet,
          planetaryStrength: dominantPlanetObj.strength,
          aspectHarmony: 0.8,
        },
        // Kinetics & Dynamics
        kinetics: {
          momentum: Object.values(kinetics.momentum).reduce((a, b) => a + b, 0),
          force: kinetics.forceMagnitude,
          charge: kinetics.charge,
          potential: kinetics.potentialDifference,
        },
        // Metadata
        metadata: {
          calculationTime: Date.now() - startTime,
          cacheUsed: false,
          planetaryPositions: stringPositionsRecord,
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
        { cause: error },
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
          instructions: [],
          prepTime: "0 min",
          cookTime: "0 min",
          numberOfServings: 1,
          elementalProperties: recipeElements,
        },
        {
          zodiacSign: "aries",
          lunarPhase: "new moon",
          domElements: smesProfile.elements,
        },
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
          cuisine: recommendations[0]?.cuisine ?? "Italian",
          dishes: recommendations[0]?.suggestedDishes ?? [],
          reasoning: recommendations[0]?.reasons ?? [],
        },
        timing,
      };
    } catch (error) {
      this.logger.error("Recipe optimization failed:", error);
      throw new Error(
        `Recipe optimization failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        { cause: error },
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
        [
          {
            planet: smesProfile.planetaryInfluence.dominantPlanet,
            strength: smesProfile.planetaryInfluence.planetaryStrength,
            element: "Fire",
          },
        ],
      );

      return {
        cuisines: cuisineRecs.map((rec) => ({
          name: rec.cuisine,
          compatibility: rec.compatibility,
          reasoning: rec.reasons,
        })),
        ingredients: planetaryRecs.ingredients,
        cookingMethods: planetaryRecs.cookingMethods,
        timing: {
          optimal: ["12:00-14:00", "18:00-20:00"],
          avoid: ["03:00-05:00", "15:00-17:00"],
        },
      };
    } catch (error) {
      this.logger.error("Culinary recommendations failed:", error);
      throw new Error(
        `Culinary recommendations failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        { cause: error },
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
  }): KineticMetrics {
    return calculateKinetics({
      currentPlanetaryPositions: input.currentPositions,
      previousPlanetaryPositions: input.previousPositions,
      timeInterval: input.timeInterval ?? 3600,
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
    return result.compatibility;
  }

  private generateCacheKey(
    type: string,
    input: UnifiedCalculationInput,
  ): string {
    const keyParts = [
      type,
      input.dateTime?.toISOString() ?? "current",
      input.location
        ? `${input.location.latitude},${input.location.longitude}`
        : "default",
      input.zodiacSystem ?? "tropical",
      JSON.stringify(input.planetaryPositions ?? {}),
      JSON.stringify(input.context ?? {}),
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
  return calculationEngine.getCulinaryRecommendations(input);
}

/**
 * ⚡ Kinetics calculation function (convenience export)
 */
export function calculatePlanetaryKinetics(input: {
  currentPositions: Record<string, string>;
  previousPositions?: Record<string, string>;
  timeInterval?: number;
}): KineticMetrics {
  return calculationEngine.calculateKinetics(input);
}

// ============================================================================
// 📤 LEGACY EXPORTS (for backward compatibility)
// ============================================================================
// Export all core calculation modules for direct access
// Export legacy calculation modules
export * from "./alchemicalCalculations";
export * from "./alchemicalTransformation";
export * from "./combinationEffects";
export * from "./core/elementalCalculations";
export * from "./core/kalchmEngine";
// Commented to avoid duplicate export with alchemicalCalculations
// export * from "./core/planetaryInfluences";
// Export culinary systems
export * from "./culinary/cuisineRecommendations";
export * from "./culinary/recipeMatching";
export * from "./culinaryAstrology";
export * from "./enhancedAlchemicalMatching";
// Export thermodynamics and kinetics
export { calculateGregsEnergy } from "./gregsEnergy";
export { calculateKinetics } from "./kinetics";

// Default export - the unified engine
export default calculationEngine;
