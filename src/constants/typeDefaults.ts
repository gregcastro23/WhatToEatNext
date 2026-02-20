/**
 * Type Defaults - Phase 2 of Type Alias Implementation
 *
 * This file contains default values and fallback objects using the standardized type aliases.
 * These defaults ensure type safety throughout the application and provide consistent fallback values.
 */

import type {
  AlchemicalPropertiesType,
  ElementalPropertiesType,
  ThermodynamicMetricsType,
  AlchemicalStateType,
  CompleteAlchemicalResultType,
  PlanetaryPositionsType,
  LunarPhaseType,
  NutritionalContentType,
  IngredientMappingType,
  AstrologicalStateType,
  ServiceResponseType,
} from "../types/alchemy";
import type { CelestialPosition, ZodiacSignType } from "../types/celestial";

// ========== PHASE, 2: TYPE DEFAULTS ==========

/**
 * Empty Alchemical Properties;
 * Default/empty state for ESMS (Spirit, Essence, Matter, Substance) properties
 */
export const _EmptyAlchemicalProperties: AlchemicalPropertiesType = {
  Spirit: 0,
  Essence: 0,
  Matter: 0,
  Substance: 0,
} as const;

/**
 * Default Alchemical Properties (alias for compatibility)
 * Equal distribution across all four alchemical properties (25% each)
 */
export const _DefaultAlchemicalProperties: AlchemicalPropertiesType = {
  Spirit: 0.25,
  Essence: 0.25,
  Matter: 0.25,
  Substance: 0.25,
} as const;

/**
 * Balanced Alchemical Properties
 * Equal distribution across all four alchemical properties (25% each)
 */
export const BalancedAlchemicalProperties: AlchemicalPropertiesType = {
  Spirit: 0.25,
  Essence: 0.25,
  Matter: 0.25,
  Substance: 0.25,
} as const;

/**
 * Empty Elemental Properties
 * Default/empty state for classical elemental properties
 */
export const _EmptyElementalProperties: ElementalPropertiesType = {
  Fire: 0,
  Water: 0,
  Earth: 0,
  Air: 0,
} as const;

/**
 * Default Elemental Properties (alias for compatibility)
 * Equal distribution across all four elements (25% each)
 */
export const _DefaultElementalProperties: ElementalPropertiesType = {
  Fire: 0.25,
  Water: 0.25,
  Earth: 0.25,
  Air: 0.25,
} as const;

/**
 * Balanced Elemental Properties
 * Equal distribution across all four elements (25% each)
 */
export const BalancedElementalProperties: ElementalPropertiesType = {
  Fire: 0.25,
  Water: 0.25,
  Earth: 0.25,
  Air: 0.25,
} as const;

/**
 * Default Thermodynamic Metrics
 * Safe default values for thermodynamic calculations
 */
export const DefaultThermodynamicMetrics: ThermodynamicMetricsType = {
  heat: 0.5,
  entropy: 0.5,
  reactivity: 0.5,
  gregsEnergy: 0.5,
  kalchm: 1.0,
  monica: 1.0,
} as const;

/**
 * Default Alchemical State
 * Combined default state with both elemental and alchemical properties
 */
export const DefaultAlchemicalState: AlchemicalStateType = {
  ...BalancedAlchemicalProperties,
  ...BalancedElementalProperties,
} as const;

/**
 * Default Complete Alchemical Result
 * Full default result including all properties and metrics
 */
export const _DefaultCompleteAlchemicalResult: CompleteAlchemicalResultType = {
  ...DefaultAlchemicalState,
  ...DefaultThermodynamicMetrics,
} as const;

/**
 * Empty Planetary Positions
 * Default empty planetary positions map
 */
export const _EmptyPlanetaryPositions: PlanetaryPositionsType = {} as const;

/**
 * Default Planetary Positions
 * Basic planetary positions with default zodiac signs
 */
export const DefaultPlanetaryPositions: PlanetaryPositionsType = {
  Sun: { sign: "aries" as ZodiacSignType, degree: 0 },
  Moon: { sign: "cancer" as ZodiacSignType, degree: 0 },
  Mercury: { sign: "gemini" as ZodiacSignType, degree: 0 },
  Venus: { sign: "taurus" as ZodiacSignType, degree: 0 },
  Mars: { sign: "aries" as ZodiacSignType, degree: 0 },
  Jupiter: { sign: "sagittarius" as ZodiacSignType, degree: 0 },
  Saturn: { sign: "capricorn" as ZodiacSignType, degree: 0 },
  Uranus: { sign: "aquarius" as ZodiacSignType, degree: 0 },
  Neptune: { sign: "pisces" as ZodiacSignType, degree: 0 },
  Pluto: { sign: "scorpio" as ZodiacSignType, degree: 0 },
} as const;

/**
 * Default Zodiac Sign
 * Fallback zodiac sign (first sign of the zodiac)
 */
export const DefaultZodiacSignType = "aries" as const;

/**
 * Default Lunar Phase
 * Fallback lunar phase (new moon)
 */
export const DefaultLunarPhase: LunarPhaseType = "new moon" as const;

/**
 * Default Nutritional Content
 * Safe default nutritional values
 */
export const DefaultNutritionalContent: NutritionalContentType = {
  calories: 0,
  protein: 0,
  fat: 0,
  carbohydrates: 0,
  fiber: 0,
  vitamins: {},
  minerals: {},
} as const;

/**
 * Default Ingredient Mapping
 * Template ingredient with safe default values
 */
export const _DefaultIngredientMapping: IngredientMappingType = {
  name: "Unknown Ingredient",
  category: "unspecified",
  season: ["all"],
  regionalOrigins: ["universal"],
  nutritionalContent: DefaultNutritionalContent,
  elementalProperties: BalancedElementalProperties,
  cookingMethods: ["raw"],
  affinities: [],
  sustainabilityScore: 0.5,
  qualities: [],
  culinaryApplications: {},
};

/**
 * Default Astrological State
 * Complete default astrological state
 */
export const _DefaultAstrologicalState: AstrologicalStateType = {
  planetaryPositions: DefaultPlanetaryPositions,
  currentZodiac: DefaultZodiacSignType,
  lunarPhase: DefaultLunarPhase,
  elementalInfluence: BalancedElementalProperties,
} as const;

/**
 * Error Service Response Factory
 * Creates a standardized error response
 */
export const _createErrorResponse = <T>(
  error: string,
): ServiceResponseType<T> => ({
  success: false,
  error,
  timestamp: new Date().toISOString(),
});

/**
 * Success Service Response Factory
 * Creates a standardized success response
 */
export const _createSuccessResponse = <T>(data: T): ServiceResponseType<T> => ({
  success: true,
  data,
  timestamp: new Date().toISOString(),
});

// ========== UTILITY FUNCTIONS ==========

/**
 * Create Safe Elemental Properties
 * Ensures all elemental values are valid numbers and sum to 1.0
 */
export const _createSafeElementalProperties = (
  properties: Partial<ElementalPropertiesType>,
): ElementalPropertiesType => {
  const fire = Number.isFinite(properties.Fire)
    ? Math.max(0, properties.Fire ?? 0)
    : 0.25;
  const water = Number.isFinite(properties.Water)
    ? Math.max(0, properties.Water ?? 0)
    : 0.25;
  const earth = Number.isFinite(properties.Earth)
    ? Math.max(0, properties.Earth ?? 0)
    : 0.25;
  const air = Number.isFinite(properties.Air)
    ? Math.max(0, properties.Air ?? 0)
    : 0.25;

  const total = fire + water + earth + air;
  const normalizer = total > 0 ? 1.0 / total : 0.25;

  return {
    Fire: fire * normalizer,
    Water: water * normalizer,
    Earth: earth * normalizer,
    Air: air * normalizer,
  };
};

/**
 * Create Safe Alchemical Properties
 * Ensures all alchemical values are valid numbers and sum to 1.0
 */
export const _createSafeAlchemicalProperties = (
  properties: Partial<AlchemicalPropertiesType>,
): AlchemicalPropertiesType => {
  const spirit = Number.isFinite(properties.Spirit)
    ? Math.max(0, properties.Spirit ?? 0)
    : 0.25;
  const essence = Number.isFinite(properties.Essence)
    ? Math.max(0, properties.Essence ?? 0)
    : 0.25;
  const matter = Number.isFinite(properties.Matter)
    ? Math.max(0, properties.Matter ?? 0)
    : 0.25;
  const substance = Number.isFinite(properties.Substance)
    ? Math.max(0, properties.Substance ?? 0)
    : 0.25;

  const total = spirit + essence + matter + substance;
  const normalizer = total > 0 ? 1.0 / total : 0.25;

  return {
    Spirit: spirit * normalizer,
    Essence: essence * normalizer,
    Matter: matter * normalizer,
    Substance: substance * normalizer,
  };
};

/**
 * Create Safe Thermodynamic Metrics
 * Ensures all thermodynamic values are valid numbers within reasonable ranges
 */
export const _createSafeThermodynamicMetrics = (
  metrics: Partial<ThermodynamicMetricsType>,
): ThermodynamicMetricsType => ({
  heat: Number.isFinite(metrics.heat)
    ? Math.max(0.1, Math.min(1.0, metrics.heat ?? 0.5))
    : 0.5,
  entropy: Number.isFinite(metrics.entropy)
    ? Math.max(0.1, Math.min(1.0, metrics.entropy ?? 0.5))
    : 0.5,
  reactivity: Number.isFinite(metrics.reactivity)
    ? Math.max(0.1, Math.min(1.0, metrics.reactivity ?? 0.5))
    : 0.5,
  gregsEnergy: Number.isFinite(metrics.gregsEnergy)
    ? Math.max(0.1, Math.min(1.0, metrics.gregsEnergy ?? 0.5))
    : 0.5,
  kalchm: Number.isFinite(metrics.kalchm)
    ? Math.max(0.1, metrics.kalchm ?? 1.0)
    : 1.0,
  monica: Number.isFinite(metrics.monica)
    ? Math.max(0.1, metrics.monica ?? 1.0)
    : 1.0,
});

/**
 * Validate Zodiac Sign
 * Ensures the provided string is a valid zodiac sign
 */
export const _validateZodiacSignType = (sign: string): string => {
  const validSigns: string[] = [
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

  const normalizedSign = sign.toLowerCase();
  return validSigns.includes(normalizedSign)
    ? normalizedSign
    : DefaultZodiacSignType;
};

/**
 * Validate Lunar Phase
 * Ensures the provided string is a valid lunar phase
 */
export const _validateLunarPhase = (phase: string): LunarPhaseType => {
  const validPhases: LunarPhaseType[] = [
    "new moon",
    "waxing crescent",
    "first quarter",
    "waxing gibbous",
    "full moon",
    "waning gibbous",
    "last quarter",
    "waning crescent",
  ];

  const normalizedPhase = phase.toLowerCase() as LunarPhaseType;
  return validPhases.includes(normalizedPhase)
    ? normalizedPhase
    : DefaultLunarPhase;
};
