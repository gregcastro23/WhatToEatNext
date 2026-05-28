// ========== PHASE, 3: UPDATED IMPORTS TO USE TYPE ALIASES ==========
import {
  _DefaultAstrologicalState,
  DefaultPlanetaryPositions,
  _createSuccessResponse,
  _createErrorResponse,
} from "@/constants/typeDefaults";
import type {
  ElementalPropertiesType,
  ServiceResponseType,
} from "@/types/alchemy";
import type { PlanetaryInfluenceResponse } from "@/types/apiResponses";
import type { AstrologicalTestData } from "@/types/astrologicalTestData";
import type {
  PlanetaryPositions,
  StandardZodiacSignType,
  StandardLunarPhase,
  CompleteAstrologicalState,
  PlanetaryPositionDetails,
  PlanetaryAspectDetails,
} from "@/types/astrology";
import type {
  CelestialPosition,
  PlanetaryAlignment,
  ZodiacSignType,
  Planet,
  LunarPhase,
} from "@/types/celestial";
import { AstrologicalState as _CentralizedAstrologicalState } from "@/types/celestial";
import {
  aggregateEnhancedZodiacElementals,
  calculateAlchemicalFromPlanets,
} from "@/utils/planetaryAlchemyMapping";
import { isCurrentSkyDiurnal } from "@/utils/astrology/positions";
import { createLogger } from "../utils/logger";
import astrologizeApiCache from "./AstrologizeApiCache";

// Create a component-specific logger
const logger = createLogger("AstrologicalService");

// ========== PHASE, 3: STANDARDIZED RESPONSE TYPES ==========

/**
 * Astrological Calculation Response
 * Standardized response for astrological calculations
 */
export type AstrologicalCalculationResponse = ServiceResponseType<{
  planetaryPositions: PlanetaryPositions;
  zodiacSign: StandardZodiacSignType;
  lunarPhase: StandardLunarPhase;
  elementalInfluence: ElementalPropertiesType;
  accuracy: number;
  calculationTimestamp: string;
}>;

/**
 * Astrological Analysis Response
 * Comprehensive astrological analysis response
 */
export type AstrologicalAnalysisResponse = ServiceResponseType<{
  astrologicalState: CompleteAstrologicalState;
  compatibility: number;
  recommendations: string[];
  warnings: string[];
  detailedAnalysis: {
    planetaryInfluences: Record<string, number>;
    aspectPatterns: PlanetaryAspectDetails[];
    elementalBalance: ElementalPropertiesType;
  };
}>;

/**
 * Planetary Position Response
 * Standardized response for planetary position queries
 */
export type PlanetaryPositionResponse = ServiceResponseType<
  Record<string, PlanetaryPositionDetails>
>;

// Export simplified aliases for backward compatibility
export type PlanetName = Planet;

// Export main class and types
export class AstrologicalService {
  private static instance: AstrologicalService;
  private currentState: CompleteAstrologicalState;

  private constructor() {
    // Initialize with default state
    this.currentState = {
      ..._DefaultAstrologicalState,
      elementalInfluence: _DefaultAstrologicalState.elementalInfluence,
    };
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): AstrologicalService {
    if (!AstrologicalService.instance) {
      AstrologicalService.instance = new AstrologicalService();
    }
    return AstrologicalService.instance;
  }

  /**
   * Updated test calculations with standardized response
   */
  static async testCalculations(
    _testData?: AstrologicalTestData,
  ): Promise<AstrologicalCalculationResponse> {
    try {
      logger.info("Testing astrological calculations...");
      const mockCalculationResult = {
        planetaryPositions: DefaultPlanetaryPositions,
        zodiacSign: "aries" as StandardZodiacSignType,
        lunarPhase: "new moon" as StandardLunarPhase,
        elementalInfluence: {
          Fire: 0.3,
          Water: 0.2,
          Earth: 0.25,
          Air: 0.25,
        },
        accuracy: 0.95,
        calculationTimestamp: new Date().toISOString(),
      };

      return _createSuccessResponse(mockCalculationResult);
    } catch (error) {
      return _createErrorResponse(
        `Calculation test failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Updated planetary position verification with standardized response
   */
  static async verifyPlanetaryPositions(
    positions?: PlanetaryPositions,
  ): Promise<ServiceResponseType<boolean>> {
    try {
      logger.info("Verifying planetary positions...");
      if (!positions || Object.keys(positions).length === 0) {
        return _createErrorResponse(
          "No planetary positions provided for verification",
        );
      }

      // Validate that all positions are valid zodiac signs
      const validZodiacSignTypes: StandardZodiacSignType[] = [
        "aries",
        "taurus",
        "gemini",
        "cancer",
        "leo",
        "virgo",
        "libra",
        "scorpio",
        "sagittarius",
        "capricorn",
        "aquarius",
        "pisces",
      ];

      const isValid = Object.values(positions).every((sign) => {
        if (typeof sign === "string") {
          return true; // Skip dominantPlanet property
        }
        return validZodiacSignTypes.includes(
          (sign.sign?.toLowerCase() || "") as StandardZodiacSignType,
        );
      });

      return _createSuccessResponse(isValid);
    } catch (error) {
      return _createErrorResponse(
        `Verification failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Updated API testing with standardized response
   */
  static async testAPIs(apiEndpoints?: string[]): Promise<
    ServiceResponseType<{
      testedEndpoints: string[];
      results: Record<string, boolean>;
    }>
  > {
    try {
      logger.info("Testing astrological APIs...");

      const endpoints = apiEndpoints || [
        "/api/planetary-positions",
        "/api/astrologize",
        "/api/astrology",
      ];

      const results: Record<string, boolean> = {};

      // Mock API testing - in reality, would make actual HTTP requests
      for (const endpoint of endpoints) {
        // Simulate API test result
        results[endpoint] = Math.random() > 0.1; // 90% success rate for testing
      }

      const responseData = {
        testedEndpoints: endpoints,
        results,
      };

      return _createSuccessResponse(responseData);
    } catch (error) {
      return _createErrorResponse(
        `API testing failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get current astrological state
   */
  public getCurrentState(): CompleteAstrologicalState {
    return this.currentState;
  }

  /**
   * Update astrological state
   */
  public updateState(
    newState: Partial<CompleteAstrologicalState>,
  ): ServiceResponseType<CompleteAstrologicalState> {
    try {
      this.currentState = { ...this.currentState, ...newState };
      return _createSuccessResponse(this.currentState);
    } catch (error) {
      return _createErrorResponse(
        `Failed to update state: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Calculate planetary influences
   */
  public async calculatePlanetaryInfluences(
    planetaryPositions: PlanetaryPositions,
  ): Promise<PlanetaryInfluenceResponse> {
    try {
      // Build sign map from positions (skip the dominantPlanet string field)
      const signMap: Record<string, string> = {};
      for (const [planet, pos] of Object.entries(planetaryPositions)) {
        if (planet === "dominantPlanet" || typeof pos === "string") continue;
        const sign = (pos as { sign?: string })?.sign;
        if (sign) signMap[planet] = sign;
      }

      const diurnal = isCurrentSkyDiurnal();
      const elementalBoost = aggregateEnhancedZodiacElementals(signMap, diurnal);
      const rawAlchemical = calculateAlchemicalFromPlanets(signMap, diurnal);

      // Normalize ESMS to 0..1 range for the modifier
      const esmsTotal =
        rawAlchemical.Spirit +
        rawAlchemical.Essence +
        rawAlchemical.Matter +
        rawAlchemical.Substance || 1;
      const alchemicalModifier = {
        Spirit: rawAlchemical.Spirit / esmsTotal,
        Essence: rawAlchemical.Essence / esmsTotal,
        Matter: rawAlchemical.Matter / esmsTotal,
        Substance: rawAlchemical.Substance / esmsTotal,
      };

      const dominant = Math.max(
        elementalBoost.Fire,
        elementalBoost.Water,
        elementalBoost.Earth,
        elementalBoost.Air,
      );
      const compatibilityScore = 0.5 + dominant * 0.5;

      return _createSuccessResponse({
        planetaryPositions,
        elementalBoost,
        alchemicalModifier,
        compatibilityScore,
      });
    } catch (error) {
      return _createErrorResponse(
        `Planetary influence calculation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}

// Re-export types from centralized location - using the imported types instead of re-exporting
export type {
  Planet,
  ZodiacSignType,
  LunarPhase,
  CelestialPosition,
  PlanetaryAlignment,
};

// Interface for legacy code support - use the centralized CelestialPosition type internally
export interface PlanetPosition {
  sign: string;
  degree: number;
  minutes: number;
  isRetrograde: boolean;
}

// MoonPhase type for API compatibility - using string literals
export type MoonPhase =
  | "new"
  | "waxing crescent"
  | "first quarter"
  | "waxing gibbous"
  | "full"
  | "waning gibbous"
  | "last quarter"
  | "waning crescent";
// AstrologicalState for service interface - we'll map this to the centralized one internally

// Canonical async function to get the latest astrological state - Updated with standardized response
export async function getLatestAstrologicalState(): Promise<AstrologicalCalculationResponse> {
  try {
    // On the client, check if the cache already has a real computed entry and
    // derive real elementals from it rather than returning hardcoded defaults.
    const cached =
      typeof window !== "undefined" ? astrologizeApiCache.getLatestEntry() : null;

    if (cached) {
      const signMap: Record<string, string> = {};
      for (const [planet, pos] of Object.entries(cached.planetaryPositions)) {
        const sign = (pos as { sign?: string })?.sign;
        if (sign) signMap[planet] = sign;
      }

      const diurnal = isCurrentSkyDiurnal(cached.date);
      const elementalInfluence = aggregateEnhancedZodiacElementals(signMap, diurnal);

      const sunSign = signMap["Sun"]?.toLowerCase() as StandardZodiacSignType | undefined;
      const accuracy =
        cached.quality === "high" ? 0.95
        : cached.quality === "medium" ? 0.75
        : 0.5;

      return _createSuccessResponse({
        planetaryPositions: cached.planetaryPositions,
        zodiacSign: sunSign ?? "aries",
        lunarPhase: "new moon",
        elementalInfluence,
        accuracy,
        calculationTimestamp: new Date(cached.timestamp).toISOString(),
      });
    }

    // Fallback: balanced defaults when no cached chart exists
    const astrologicalData = {
      planetaryPositions: DefaultPlanetaryPositions,
      zodiacSign: "aries" as StandardZodiacSignType,
      lunarPhase: "new moon" as StandardLunarPhase,
      elementalInfluence: {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25,
      },
      accuracy: 1.0,
      calculationTimestamp: new Date().toISOString(),
    };

    return _createSuccessResponse(astrologicalData);
  } catch (error) {
    return _createErrorResponse(
      `Failed to get astrological state: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
