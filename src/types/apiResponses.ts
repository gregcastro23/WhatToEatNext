/**
 * API Response Type Definitions
 *
 * This file contains standardized type definitions for external API responses.
 */

import {
  ELEMENT_TYPES,
  isElementType,
  isZodiacSignType,
  PLANETS,
} from "./constants";
import { TOKEN_TYPES, type TokenType } from "./economy";
import type {
  AlchemicalTransformationResultType,
  ElementalPropertiesType,
  PlanetaryInfluenceResultType,
  ServiceResponseType,
  ThermodynamicMetricsType,
} from "./alchemy";
import type { ElementType } from "./constants";
import type {
  IngredientAnalysisResponse,
  IngredientRecommendationResponse,
} from "./ingredients";
import type { BirthData, CompositeNatalChart, NatalChart } from "./natalChart";
import type { Recipe } from "./recipe";

// ========== PHASE 1: API RESPONSE TYPE ALIASES ==========

/**
 * Generic Service Response
 * Standardized response structure for all services
 */
export type ServiceResponse<T> = ServiceResponseType<T>;

/**
 * Alchemical Recommendation Response
 * Standardized response for alchemical recommendation services
 */
export type AlchemicalRecommendationResponse = ServiceResponseType<{
  recommendations: AlchemicalTransformationResultType[];
  compatibility: number;
  reasoning: string[];
  elementalBalance: ElementalPropertiesType;
  thermodynamicMetrics: ThermodynamicMetricsType;
}>;

/**
 * Planetary Influence Response
 * Standardized response for planetary influence calculations
 */
export type PlanetaryInfluenceResponse =
  ServiceResponseType<PlanetaryInfluenceResultType>;

/**
 * Standardized Planetary Position Response
 * Common structure for planetary position data from any API
 */
export type StandardizedPlanetaryResponse = ServiceResponseType<{
  positions: Record<string, StandardizedPlanetaryPosition>;
  timestamp: string;
  source: string;
  accuracy: number;
}>;

/**
 * Recipe Recommendation Response
 * Standardized response for recipe recommendations
 */
export type RecipeRecommendationResponse = ServiceResponseType<{
  recipes: Array<{
    id: string;
    name: string;
    compatibility: number;
    elementalBalance: ElementalPropertiesType;
    ingredients: string[];
    reasoning: string[];
  }>;
  totalMatches: number;
  searchCriteria: Record<string, Record<string, number>>;
}>;

/**
 * Culinary Analysis Response
 * Comprehensive culinary analysis response
 */
export type CulinaryAnalysisResponse = ServiceResponseType<{
  overallCompatibility: number;
  elementalAnalysis: ElementalPropertiesType;
  thermodynamicProfile: ThermodynamicMetricsType;
  recommendations: {
    ingredients: string[];
    cookingMethods: string[];
    seasonalTiming: string[];
  };
  warnings: string[];
}>;

/**
 * Shared response contract for the adept and premium table midpoint routes.
 * Both endpoints expose the same client boundary even though their access
 * policies differ.
 */
export type TableRitualResponse =
  | {
      success: true;
      compositeChart: CompositeNatalChart;
      recipes: Recipe[];
    }
  | {
      success?: false;
      message?: string;
      error?: string;
    };

export interface CompanionActivation {
  strength: number;
  dignity: string;
  element: ElementType;
  planetaryRuler: string;
  description: string;
}

export interface CompanionSuggestion {
  userId: string;
  email: string;
  name: string;
  bio: string;
  dominantElement: ElementType;
  monicaConstant: number | null;
  birthData: BirthData;
  natalChart: NatalChart | null;
  activation?: CompanionActivation;
  lastActionAt?: string | null;
}

export type CompanionsResponse =
  | {
      success: true;
      activeAgents: CompanionSuggestion[];
      historicalAgents: CompanionSuggestion[];
      cosmicRoster: CompanionSuggestion[];
      savedCompanions: CompanionSuggestion[];
      degraded?: boolean;
    }
  | {
      success?: false;
      message?: string;
    };

export interface ProfileFeedEvent {
  id: string;
  eventType: string;
  metadataPayload: Record<string, unknown> | null;
  createdAt: string;
  actorIsAgent?: boolean;
  actorName?: string;
  actorSlug?: string;
  actorImage?: string;
}

export type ProfileFeedResponse =
  | { success: true; events: ProfileFeedEvent[] }
  | { success?: false; message?: string };

export interface CompletedQuestResponse {
  questSlug: string;
  tokensAwarded: number;
  tokenType: TokenType | "all";
}

export interface PreferenceActionResponse {
  success?: boolean;
  message?: string;
  completedQuests?: CompletedQuestResponse[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasNumericKeys(value: unknown, keys: readonly string[]): boolean {
  return isRecord(value) && keys.every((key) => typeof value[key] === "number");
}

function isRecipeIngredient(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.name === "string" &&
    typeof value.amount === "number" &&
    typeof value.unit === "string"
  );
}

function isRecipe(value: unknown): value is Recipe {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    Array.isArray(value.ingredients) &&
    value.ingredients.every(isRecipeIngredient) &&
    Array.isArray(value.instructions) &&
    value.instructions.every((step) => typeof step === "string") &&
    hasNumericKeys(value.elementalProperties, ELEMENT_TYPES)
  );
}

function isBirthData(value: unknown): value is BirthData {
  if (!isRecord(value)) return false;

  const locationIsValid =
    value.location === undefined ||
    (isRecord(value.location) &&
      typeof value.location.latitude === "number" &&
      typeof value.location.longitude === "number");
  const timezoneBasisIsValid =
    value.timezoneBasis === undefined ||
    value.timezoneBasis === "DERIVED_FROM_COORDINATES" ||
    value.timezoneBasis === "STORED_IANA_STRING" ||
    value.timezoneBasis === "ABSENT";

  return (
    typeof value.dateTime === "string" &&
    typeof value.latitude === "number" &&
    typeof value.longitude === "number" &&
    (value.utcInstant === undefined || typeof value.utcInstant === "string") &&
    (value.timezone === undefined || typeof value.timezone === "string") &&
    timezoneBasisIsValid &&
    (value.timezoneStoredBefore === undefined ||
      typeof value.timezoneStoredBefore === "string") &&
    locationIsValid
  );
}

function isPlanetInfo(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.name === "string" &&
    (value.name === "Ascendant" ||
      PLANETS.some((planet) => planet === value.name)) &&
    typeof value.sign === "string" &&
    isZodiacSignType(value.sign) &&
    typeof value.position === "number"
  );
}

function isNatalChart(value: unknown): value is NatalChart {
  return (
    isRecord(value) &&
    (value.id === undefined || typeof value.id === "string") &&
    (value.name === undefined || typeof value.name === "string") &&
    isBirthData(value.birthData) &&
    Array.isArray(value.planets) &&
    value.planets.every(isPlanetInfo) &&
    typeof value.ascendant === "string" &&
    isZodiacSignType(value.ascendant) &&
    isRecord(value.planetaryPositions) &&
    Object.values(value.planetaryPositions).every(
      (sign) => typeof sign === "string" && isZodiacSignType(sign),
    ) &&
    typeof value.dominantElement === "string" &&
    isElementType(value.dominantElement) &&
    ["Cardinal", "Fixed", "Mutable"].includes(
      typeof value.dominantModality === "string" ? value.dominantModality : "",
    ) &&
    hasNumericKeys(value.elementalBalance, ELEMENT_TYPES) &&
    hasNumericKeys(value.alchemicalProperties, [
      "Spirit",
      "Essence",
      "Matter",
      "Substance",
    ]) &&
    typeof value.calculatedAt === "string"
  );
}

function isCompositeNatalChart(value: unknown): value is CompositeNatalChart {
  return (
    isRecord(value) &&
    typeof value.groupId === "string" &&
    typeof value.memberCount === "number" &&
    typeof value.dominantElement === "string" &&
    isElementType(value.dominantElement) &&
    ["Cardinal", "Fixed", "Mutable"].includes(
      typeof value.dominantModality === "string" ? value.dominantModality : "",
    ) &&
    hasNumericKeys(value.elementalBalance, ELEMENT_TYPES) &&
    hasNumericKeys(value.alchemicalProperties, [
      "Spirit",
      "Essence",
      "Matter",
      "Substance",
    ]) &&
    hasNumericKeys(value.elementalDistribution, ELEMENT_TYPES) &&
    hasNumericKeys(value.modalityDistribution, [
      "Cardinal",
      "Fixed",
      "Mutable",
    ]) &&
    typeof value.calculatedAt === "string"
  );
}

function isCompanionSuggestion(value: unknown): value is CompanionSuggestion {
  if (!isRecord(value)) return false;

  const { activation } = value;
  return (
    typeof value.userId === "string" &&
    typeof value.email === "string" &&
    typeof value.name === "string" &&
    typeof value.bio === "string" &&
    typeof value.dominantElement === "string" &&
    isElementType(value.dominantElement) &&
    (value.monicaConstant === null ||
      typeof value.monicaConstant === "number") &&
    isBirthData(value.birthData) &&
    (value.natalChart === null || isNatalChart(value.natalChart)) &&
    (activation === undefined ||
      (isRecord(activation) &&
        typeof activation.strength === "number" &&
        typeof activation.dignity === "string" &&
        typeof activation.element === "string" &&
        isElementType(activation.element) &&
        typeof activation.planetaryRuler === "string" &&
        typeof activation.description === "string")) &&
    (value.lastActionAt === undefined ||
      value.lastActionAt === null ||
      typeof value.lastActionAt === "string")
  );
}

function isCompanionArray(value: unknown): value is CompanionSuggestion[] {
  return Array.isArray(value) && value.every(isCompanionSuggestion);
}

export function isCompanionsResponse(
  value: unknown,
): value is CompanionsResponse {
  if (!isRecord(value)) return false;
  if (value.success !== true) {
    return (
      (value.success === undefined || value.success === false) &&
      (value.message === undefined || typeof value.message === "string")
    );
  }

  return (
    isCompanionArray(value.activeAgents) &&
    isCompanionArray(value.historicalAgents) &&
    isCompanionArray(value.cosmicRoster) &&
    isCompanionArray(value.savedCompanions) &&
    (value.degraded === undefined || typeof value.degraded === "boolean")
  );
}

function isProfileFeedEvent(value: unknown): value is ProfileFeedEvent {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.eventType === "string" &&
    (value.metadataPayload === null || isRecord(value.metadataPayload)) &&
    typeof value.createdAt === "string" &&
    (value.actorIsAgent === undefined ||
      typeof value.actorIsAgent === "boolean") &&
    (value.actorName === undefined || typeof value.actorName === "string") &&
    (value.actorSlug === undefined || typeof value.actorSlug === "string") &&
    (value.actorImage === undefined || typeof value.actorImage === "string")
  );
}

export function isProfileFeedResponse(
  value: unknown,
): value is ProfileFeedResponse {
  if (!isRecord(value)) return false;
  if (value.success !== true) {
    return (
      (value.success === undefined || value.success === false) &&
      (value.message === undefined || typeof value.message === "string")
    );
  }
  return Array.isArray(value.events) && value.events.every(isProfileFeedEvent);
}

function isQuestTokenType(value: unknown): value is TokenType | "all" {
  return (
    value === "all" || TOKEN_TYPES.some((tokenType) => tokenType === value)
  );
}

function isCompletedQuestResponse(
  value: unknown,
): value is CompletedQuestResponse {
  return (
    isRecord(value) &&
    typeof value.questSlug === "string" &&
    typeof value.tokensAwarded === "number" &&
    isQuestTokenType(value.tokenType)
  );
}

export function isPreferenceActionResponse(
  value: unknown,
): value is PreferenceActionResponse {
  return (
    isRecord(value) &&
    (value.success === undefined || typeof value.success === "boolean") &&
    (value.message === undefined || typeof value.message === "string") &&
    (value.completedQuests === undefined ||
      (Array.isArray(value.completedQuests) &&
        value.completedQuests.every(isCompletedQuestResponse)))
  );
}

/** Validate the shared table JSON boundary before client state consumes it. */
export function isTableRitualResponse(
  value: unknown,
): value is TableRitualResponse {
  if (!isRecord(value)) return false;

  if (value.success !== true) {
    return (
      (value.success === undefined || value.success === false) &&
      (value.message === undefined || typeof value.message === "string") &&
      (value.error === undefined || typeof value.error === "string")
    );
  }

  return (
    isCompositeNatalChart(value.compositeChart) &&
    Array.isArray(value.recipes) &&
    value.recipes.every(isRecipe)
  );
}

// ========== EXTERNAL API RESPONSE TYPES ==========

/**
 * Base response for NASA JPL Horizons API
 */
export interface NasaHorizonsResponse {
  /**
   * Result string containing the data in text format
   */
  result?: string;

  /**
   * Error message if the request failed
   */
  error?: string;

  /**
   * Signature indicating the type of error
   */
  signature?: {
    source?: string;
    version?: string;
  };
}

/**
 * Base response for Astronomy API
 */
export interface AstronomyApiResponse {
  /**
   * Response data containing planetary positions
   */
  data?: {
    /**
     * Table of planetary data
     */
    table?: {
      /**
       * Rows of planetary information
       */
      rows?: Array<{
        /**
         * Entry containing planet details
         */
        entry?: {
          /**
           * Unique identifier
           */
          id?: string;

          /**
           * Planet name
           */
          name?: string;

          /**
           * Equatorial coordinates (right ascension and declination)
           */
          equatorialCoordinates?: {
            rightAscension?: {
              hours?: number;
              minutes?: number;
              seconds?: number;
            };
            declination?: {
              degrees?: number;
              minutes?: number;
              seconds?: number;
            };
          };

          /**
           * Ecliptic coordinates (longitude and latitude)
           */
          eclipticCoordinates?: {
            longitude?: {
              degrees?: number;
              minutes?: number;
              seconds?: number;
            };
            latitude?: {
              degrees?: number;
              minutes?: number;
              seconds?: number;
            };
          };
        };
      }>;
    };
  };

  /**
   * Error information
   */
  error?: {
    code?: number;
    message?: string;
  };
}

/**
 * Base response for public Swiss Ephemeris API
 */
export interface SwissEphemerisApiResponse {
  /**
   * Array of planet information
   */
  planets?: Array<{
    /**
     * Planet name
     */
    name?: string;

    /**
     * Position information
     */
    position?: {
      /**
       * Longitude in degrees (0-360)
       */
      longitude?: number;

      /**
       * Whether the planet is retrograde
       */
      retrograde?: boolean;

      /**
       * Speed of the planet
       */
      speed?: number;
    };
  }>;

  /**
   * Error information
   */
  error?:
    | string
    | {
        message?: string;
        code?: number;
      };
}

/**
 * Standardized planetary position from any API source
 */
export interface StandardizedPlanetaryPosition {
  /**
   * Zodiac sign (e.g., 'aries', 'taurus')
   */
  sign: string;

  /**
   * Degree within the sign (0-29)
   */
  degree: number;

  /**
   * Exact longitude in degrees (0-360)
   */
  exactLongitude?: number;

  /**
   * Whether the planet is retrograde
   */
  isRetrograde?: boolean;

  /**
   * Minutes within the degree (0-59)
   */
  minute?: number;

  /**
   * Speed of the planet (positive for direct, negative for retrograde)
   */
  speed?: number;
}

/**
 * Type guard to validate NASA Horizons API response
 */
export function isValidNasaHorizonsResponse(
  data: unknown,
): data is NasaHorizonsResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    (("result" in data &&
      typeof (data as NasaHorizonsResponse).result === "string") ||
      ("error" in data &&
        typeof (data as NasaHorizonsResponse).error === "string"))
  );
}

/**
 * Type guard to validate Astronomy API response
 */
export function isValidAstronomyApiResponse(
  data: unknown,
): data is AstronomyApiResponse {
  return typeof data === "object" && data !== null && "data" in data;
}

/**
 * Type guard to validate Swiss Ephemeris API response
 */
export function isValidSwissEphemerisApiResponse(
  data: unknown,
): data is SwissEphemerisApiResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    ("planets" in data || "error" in data)
  );
}

// Re-export ingredient response types for convenience
export type { IngredientAnalysisResponse, IngredientRecommendationResponse };
