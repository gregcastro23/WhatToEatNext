/**
 * Unified Scoring Service for Astrological-Alchemical Recommendations
 *
 * This service provides a centralized, extensible scoring system that leverages: * - Astrologize API for real-time planetary positions
 * - Alchemize API for alchemical calculations
 * - Swiss Ephemeris data for high-precision astronomy
 * - Transit database for seasonal effects
 * - Location service for geographic influences
 * - Dignity calculations for planetary strength
 * - Tarot effects and other mystical influences
 */

import { log } from "@/services/LoggingService";
import {
  calculateThermodynamicCompatibility,
  calculateKineticCompatibility,
  calculateEnhancedElementalCompatibility,
  type ThermodynamicState,
  type KineticState,
} from "@/utils/enhancedCompatibilityScoring";
import { PlanetaryLocationService } from "../data/planets/locationService";
import { getCurrentAlchemicalState } from "./RealAlchemizeService";
import type { GeographicCoordinates } from "../data/planets/locationService";
import type { ElementalProperties } from "../types/alchemy";
import type {
  AspectType,
  LunarPhase,
  Planet,
  PlanetaryAspect,
  PlanetaryPosition,
} from "../types/celestial";
import type {
  CuisineType,
  DietaryRestriction,
  Season,
} from "../types/constants";

// Add missing ScoringWeights type
interface ScoringWeights {
  elemental: number;
  seasonal: number;
  astrological: number;
  cultural: number;
  nutritional: number;
  ingredient: number;
  recipe: number;
  cuisine: number;
  cooking_method: number;
  [key: string]: number;
}

// ==================== INTERFACES ====================

/**
 * Breakdown of all scoring factors
 */
export interface ScoringBreakdown {
  base: number;
  transitEffect: number;
  dignityEffect: number;
  tarotEffect: number;
  seasonalEffect: number;
  locationEffect: number;
  lunarPhaseEffect: number;
  aspectEffect: number;
  elementalCompatibility: number;
  thermalDynamicEffect: number;
  kineticCompatibilityEffect: number;
  kalchmResonance: number;
  monicaOptimization: number;
  retrogradeEffect: number;
  [key: string]: number;
}

/**
 * Complete scoring result with metadata
 */
export interface ScoringResult {
  score: number; // Final normalized score (0-1)
  confidence: number; // Confidence in the result (0-1)
  breakdown: ScoringBreakdown;
  sources: string[];
  notes: string[];
  metadata: {
    timestamp: Date;
    location?: GeographicCoordinates;
    dominantEffects: string[];
    warnings: string[];
  };
}

/**
 * Context for scoring calculations
 */
export interface ScoringContext {
  // Time and location
  dateTime: Date;
  location?: GeographicCoordinates;

  // Astrological data
  planetaryPositions?: Record<Planet, PlanetaryPosition>;

  // Intentionally any: Transit data structure varies by astronomical library

  currentTransits?: any;
  aspects?: PlanetaryAspect[];
  lunarPhase?: LunarPhase;

  // Target item data
  item: {
    name: string;
    type: "ingredient" | "recipe" | "cuisine" | "cooking_method";
    elementalProperties?: ElementalProperties;
    seasonality?: Season[];
    planetaryRulers?: Planet[];
    flavorProfile?: Record<string, number>;
    culturalOrigins?: string[];

    // Intentionally any: Item properties vary by type (ingredient/recipe/cuisine/method)

    [key: string]: any;
  };

  // User preferences
  preferences?: {
    dietaryRestrictions?: DietaryRestriction[];
    culturalPreferences?: CuisineType[];
    intensityPreference?: "mild" | "moderate" | "intense";
    complexityPreference?: "simple" | "moderate" | "complex";
    // Intentionally any: User preferences can include custom fields

    [key: string]: any;
  };

  // Calculation options
  options?: {
    includeEffects?: string[];
    excludeEffects?: string[];
    weights?: Partial<ScoringBreakdown>;
    debugMode?: boolean;
  };
}

/**
 * Astrological data from various sources
 */
export interface AstrologicalData {
  planetaryPositions: Record<Planet, PlanetaryPosition>;
  aspects: PlanetaryAspect[];
  transits: {
    active: Array<{
      transitingPlanet: Planet;
      natalPlanet: Planet;
      aspect: AspectType;
      strength: number;
    }>;
    seasonal: {
      currentSeason: Season;
      alignment: number;
      recommendation: string;
    };
  };
  lunarPhase: {
    name: LunarPhase;
    illumination: number;
    effect: string;
  };
  dignity: Record<Planet, number>;
  houses?: Record<string, number>;
  source: "astrologize" | "swiss_ephemeris" | "fallback";
  confidence: number;
}

// ==================== SCORING MODULES ====================

/**
 * Calculate transit effects on the item
 */
export function calculateTransitEffect(
  astroData: AstrologicalData,
  _context: ScoringContext,
): number {
  let score = 0;
  const transits = astroData.transits.active;

  // Check if item has planetary rulers that are being transited
  const itemRulers = _context.item.planetaryRulers || [];

  for (const transit of transits) {
    if (itemRulers.includes(transit.natalPlanet)) {
      // Positive transits boost score
      if (["trine", "sextile", "conjunction"].includes(transit.aspect)) {
        score += ((transit as any)?.strength || 0) * 0.2;
      }
      // Challenging transits reduce score
      else if (["square", "opposition"].includes(transit.aspect)) {
        score -= ((transit as any)?.strength || 0) * 0.2;
      }
    }
  }

  return Math.max(-0.5, Math.min(0.5, score)); // Clamp between -0.5 and 0.5
}

/**
 * Calculate planetary dignity effects
 */
export function calculateDignityEffect(
  astroData: AstrologicalData,
  _context: ScoringContext,
): number {
  let score = 0;
  const itemRulers = _context.item.planetaryRulers || [];

  for (const planet of itemRulers) {
    const dignity = astroData.dignity[planet] || 0;
    // Strong dignity boosts score, weak dignity reduces it
    score += dignity * 0.1;
  }

  return Math.max(-0.3, Math.min(0.3, score)); // Clamp between -0.3 and 0.3
}

/**
 * Calculate tarot effects (placeholder for future tarot integration)
 */
export function calculateTarotEffect(
  _astroData: AstrologicalData,
  _context: ScoringContext,
): number {
  // Future integration with tarot system
  // For now, return neutral effect
  const itemType = _context.item.type;

  // Different item types have different tarot affinities
  const tarotAffinities = {
    ingredient: 0.05,
    recipe: 0.1,
    cuisine: 0.15,
    cooking_method: 0.08,
  };

  return tarotAffinities[itemType] || 0;
}

/**
 * Calculate seasonal effects
 */
export function calculateSeasonalEffect(
  _astroData: AstrologicalData,
  context: ScoringContext,
): number {
  const month = context.dateTime.getMonth();
  const season = [
    "winter",
    "winter",
    "spring",
    "spring",
    "spring",
    "summer",
    "summer",
    "summer",
    "autumn",
    "autumn",
    "autumn",
    "winter",
  ][month];

  const itemSeasonality = context.item.seasonality || [];

  if (itemSeasonality.includes(season as Season)) {
    return 0.2; // Boost for seasonal items
  } else if (itemSeasonality.length > 0) {
    return -0.1; // Slight penalty for out-of-season items
  }

  return 0; // Neutral for non-seasonal items
}

/**
 * Calculate location-based effects
 */
export function calculateLocationEffect(
  _astroData: AstrologicalData,
  context: ScoringContext,
): number {
  if (!context.location) return 0;
  const locationInfluences =
    PlanetaryLocationService.calculateLocationPlanetaryInfluences(
      context.location,
      context.dateTime,
    );

  const itemRulers = context.item.planetaryRulers || [];
  let score = 0;

  for (const influence of locationInfluences) {
    if (itemRulers.includes(influence.planet as Planet)) {
      score += (influence.finalInfluence - 1) * 0.1;
    }
  }

  return Math.max(-0.2, Math.min(0.2, score));
}

/**
 * Calculate lunar phase effects
 */
export function calculateLunarPhaseEffect(
  astroData: AstrologicalData,
  _context: ScoringContext,
): number {
  const { lunarPhase } = astroData;
  const itemType = _context.item.type;

  // Lunar phase modifiers (using standard lowercase format)
  const LUNAR_PHASE_MODIFIERS: Record<LunarPhase, ScoringWeights> = {
    "new moon": {
      elemental: 0.1,
      seasonal: 0.1,
      astrological: 0.1,
      cultural: 0.1,
      nutritional: 0.1,
      ingredient: 0.1,
      recipe: 0.05,
      cuisine: 0.1,
      cooking_method: 0.15,
    },
    "waxing crescent": {
      elemental: 0.15,
      seasonal: 0.15,
      astrological: 0.15,
      cultural: 0.15,
      nutritional: 0.15,
      ingredient: 0.15,
      recipe: 0.1,
      cuisine: 0.05,
      cooking_method: 0.1,
    },
    "first quarter": {
      elemental: 0.1,
      seasonal: 0.1,
      astrological: 0.1,
      cultural: 0.1,
      nutritional: 0.1,
      ingredient: 0.1,
      recipe: 0.15,
      cuisine: 0.1,
      cooking_method: 0.15,
    },
    "waxing gibbous": {
      elemental: 0.05,
      seasonal: 0.05,
      astrological: 0.05,
      cultural: 0.05,
      nutritional: 0.05,
      ingredient: 0.05,
      recipe: 0.2,
      cuisine: 0.15,
      cooking_method: 0.1,
    },
    "full moon": {
      elemental: 0.2,
      seasonal: 0.2,
      astrological: 0.2,
      cultural: 0.2,
      nutritional: 0.2,
      ingredient: 0.2,
      recipe: 0.25,
      cuisine: 0.2,
      cooking_method: 0.05,
    },
    "waning gibbous": {
      elemental: 0.1,
      seasonal: 0.1,
      astrological: 0.1,
      cultural: 0.1,
      nutritional: 0.1,
      ingredient: 0.1,
      recipe: 0.15,
      cuisine: 0.25,
      cooking_method: 0,
    },
    "last quarter": {
      elemental: 0,
      seasonal: 0,
      astrological: 0,
      cultural: 0,
      nutritional: 0,
      ingredient: 0,
      recipe: 0.05,
      cuisine: 0.1,
      cooking_method: -0.05,
    },
    "waning crescent": {
      elemental: -0.05,
      seasonal: -0.05,
      astrological: -0.05,
      cultural: -0.05,
      nutritional: -0.05,
      ingredient: -0.05,
      recipe: 0,
      cuisine: 0.05,
      cooking_method: 0.1,
    },
  };

  return LUNAR_PHASE_MODIFIERS[lunarPhase.name][itemType] || 0;
}

/**
 * Calculate aspect effects
 */
export function calculateAspectEffect(
  astroData: AstrologicalData,
  context: ScoringContext,
): number {
  let score = 0;
  const itemRulers = context.item.planetaryRulers || [];

  for (const aspect of astroData.aspects) {
    if (
      itemRulers.includes(aspect.planet1 as Planet) ||
      itemRulers.includes(aspect.planet2 as Planet)
    ) {
      const aspectStrength = aspect.strength ?? 1.0;

      switch (aspect.type) {
        case "conjunction":
          score += aspectStrength * 0.2;
          break;
        case "trine":
          score += aspectStrength * 0.15;
          break;
        case "sextile":
          score += aspectStrength * 0.1;
          break;
        case "square":
          score -= aspectStrength * 0.1;
          break;
        case "opposition":
          score -= aspectStrength * 0.15;
          break;
      }
    }
  }

  return Math.max(-0.3, Math.min(0.3, score));
}

/**
 * Calculate elemental compatibility using enhanced non-linear scoring
 * Uses exponential decay for better differentiation
 */
export function calculateElementalCompatibility(
  _astroData: AstrologicalData,
  context: ScoringContext,
): number {
  if (!context.item.elementalProperties) return 0;

  // Get current elemental state from alchemical calculations
  const currentState = getCurrentAlchemicalState();
  const currentElemental = currentState.elementalProperties;
  const itemElemental = context.item.elementalProperties;

  // Use enhanced elemental compatibility calculator
  const compatibility = calculateEnhancedElementalCompatibility(
    currentElemental,
    itemElemental,
  );

  // Convert 0-1 compatibility to scoring range (0 to 0.4)
  // Perfect match (1.0) → 0.4
  // Medium match (0.5) → 0.2
  // No match (0) → 0
  return compatibility * 0.4;
}

/**
 * Calculate thermodynamic compatibility using enhanced scoring
 * Uses non-linear functions to create better differentiation
 */
export function calculateThermodynamicEffect(
  _astroData: AstrologicalData,
  context: ScoringContext,
): number {
  const currentState = getCurrentAlchemicalState();

  // Get user's thermodynamic state
  const userThermo: ThermodynamicState = {
    heat: currentState.thermodynamicProperties.heat,
    entropy: currentState.thermodynamicProperties.entropy,
    reactivity: currentState.thermodynamicProperties.reactivity,
    gregsEnergy: currentState.thermodynamicProperties.gregsEnergy,
    kalchm: currentState.kalchm,
    monica: currentState.monica,
  };

  // Get or calculate item's thermodynamic properties
  // If item has alchemical properties, calculate thermodynamics
  let itemThermo: ThermodynamicState;

  if (context.item.alchemicalProperties && context.item.elementalProperties) {
    // Calculate thermodynamic properties for the item
    const alch = context.item.alchemicalProperties;
    const elem = context.item.elementalProperties;

    // Heat = (Spirit² + Fire²) / (Substance + Essence + Matter + Water + Air + Earth)²
    const heatNum = Math.pow(alch.Spirit || 0, 2) + Math.pow(elem.Fire || 0, 2);
    const heatDen = Math.pow(
      (alch.Substance || 0) +
        (alch.Essence || 0) +
        (alch.Matter || 0) +
        (elem.Water || 0) +
        (elem.Air || 0) +
        (elem.Earth || 0),
      2,
    );
    const heat = heatNum / (heatDen || 1);

    // Entropy = (Spirit² + Substance² + Fire² + Air²) / (Essence + Matter + Earth + Water)²
    const entropyNum =
      Math.pow(alch.Spirit || 0, 2) +
      Math.pow(alch.Substance || 0, 2) +
      Math.pow(elem.Fire || 0, 2) +
      Math.pow(elem.Air || 0, 2);
    const entropyDen = Math.pow(
      (alch.Essence || 0) +
        (alch.Matter || 0) +
        (elem.Earth || 0) +
        (elem.Water || 0),
      2,
    );
    const entropy = entropyNum / (entropyDen || 1);

    // Reactivity
    const reactivityNum =
      Math.pow(alch.Spirit || 0, 2) +
      Math.pow(alch.Substance || 0, 2) +
      Math.pow(alch.Essence || 0, 2) +
      Math.pow(elem.Fire || 0, 2) +
      Math.pow(elem.Air || 0, 2) +
      Math.pow(elem.Water || 0, 2);
    const reactivityDen = Math.pow((alch.Matter || 0) + (elem.Earth || 0), 2);
    const reactivity = reactivityNum / (reactivityDen || 1);

    // Greg's Energy
    const gregsEnergy = heat - entropy * reactivity;

    // Kalchm
    const kalchm =
      context.item.kalchmResonance ||
      (Math.pow(alch.Spirit || 1, alch.Spirit || 1) *
        Math.pow(alch.Essence || 1, alch.Essence || 1)) /
        (Math.pow(alch.Matter || 1, alch.Matter || 1) *
          Math.pow(alch.Substance || 1, alch.Substance || 1));

    // Monica
    let monica = context.item.monicaConstant || 1.0;
    if (kalchm > 0 && !context.item.monicaConstant) {
      const lnK = Math.log(kalchm);
      if (lnK !== 0) {
        monica = -gregsEnergy / (reactivity * lnK);
      }
    }

    itemThermo = { heat, entropy, reactivity, gregsEnergy, kalchm, monica };
  } else {
    // Fallback: Use average values for items without alchemical properties
    itemThermo = {
      heat: 0.5,
      entropy: 0.5,
      reactivity: 0.5,
      gregsEnergy: 0,
      kalchm: 1.0,
      monica: 1.0,
    };
  }

  // Calculate compatibility using enhanced algorithm
  const compatibility = calculateThermodynamicCompatibility(
    userThermo,
    itemThermo,
  );

  // Convert 0-1 compatibility to scoring range (-0.3 to 0.3)
  // High compatibility (1.0) → +0.3
  // Medium compatibility (0.5) → 0
  // Low compatibility (0) → -0.3
  const score = (compatibility.overall - 0.5) * 0.6;

  return Math.max(-0.3, Math.min(0.3, score));
}

/**
 * Calculate Kalchm resonance effects
 */
export function calculateKalchmResonance(
  _astroData: AstrologicalData,
  _context: ScoringContext,
): number {
  const currentState = getCurrentAlchemicalState();
  const { kalchm } = currentState;

  // Higher Kalchm values favor transformation and fermentation
  if (kalchm > 2.0) {
    return 0.1;
  } else if (kalchm < 0.5) {
    return -0.05;
  }

  return 0;
}

/**
 * Calculate Monica optimization effects
 */
export function calculateMonicaOptimization(
  _astroData: AstrologicalData,
  _context: ScoringContext,
): number {
  const currentState = getCurrentAlchemicalState();
  const { monica } = currentState;

  // Monica constant affects optimization and efficiency
  if (monica > 1.5) {
    return 0.08;
  } else if (monica < 0.5) {
    return -0.03;
  }

  return 0;
}

/**
 * Calculate kinetic compatibility using P=IV circuit model
 * Uses power, current, voltage matching for temporal alignment
 */
export function calculateKineticCompatibilityEffect(
  _astroData: AstrologicalData,
  context: ScoringContext,
): number {
  const currentState = getCurrentAlchemicalState();

  // Get user's kinetic state from current alchemical state
  // Calculate using P=IV circuit model
  const alch = currentState.esms;
  const elem = currentState.elementalProperties;

  // Charge: Q = Matter + Substance
  const userCharge = alch.Matter + alch.Substance;

  // Potential Difference: V = Greg's Energy / Q
  const userVoltage =
    userCharge > 0
      ? currentState.thermodynamicProperties.gregsEnergy / userCharge
      : 0;

  // Current Flow: I = Reactivity (simplified, full formula would use dQ/dt)
  const userCurrent = currentState.thermodynamicProperties.reactivity;

  // Power: P = I × V
  const userPower = userCurrent * userVoltage;

  const userKinetic: KineticState = {
    power: userPower,
    currentFlow: userCurrent,
    potentialDifference: userVoltage,
    charge: userCharge,
  };

  // Get or estimate item's kinetic properties
  let itemKinetic: KineticState;

  if (context.item.alchemicalProperties && context.item.elementalProperties) {
    const itemAlch = context.item.alchemicalProperties;
    const itemElem = context.item.elementalProperties;

    // Calculate thermodynamics first (needed for kinetics)
    const heatNum =
      Math.pow(itemAlch.Spirit || 0, 2) + Math.pow(itemElem.Fire || 0, 2);
    const heatDen = Math.pow(
      (itemAlch.Substance || 0) +
        (itemAlch.Essence || 0) +
        (itemAlch.Matter || 0) +
        (itemElem.Water || 0) +
        (itemElem.Air || 0) +
        (itemElem.Earth || 0),
      2,
    );
    const heat = heatNum / (heatDen || 1);

    const entropyNum =
      Math.pow(itemAlch.Spirit || 0, 2) +
      Math.pow(itemAlch.Substance || 0, 2) +
      Math.pow(itemElem.Fire || 0, 2) +
      Math.pow(itemElem.Air || 0, 2);
    const entropyDen = Math.pow(
      (itemAlch.Essence || 0) +
        (itemAlch.Matter || 0) +
        (itemElem.Earth || 0) +
        (itemElem.Water || 0),
      2,
    );
    const entropy = entropyNum / (entropyDen || 1);

    const reactivityNum =
      Math.pow(itemAlch.Spirit || 0, 2) +
      Math.pow(itemAlch.Substance || 0, 2) +
      Math.pow(itemAlch.Essence || 0, 2) +
      Math.pow(itemElem.Fire || 0, 2) +
      Math.pow(itemElem.Air || 0, 2) +
      Math.pow(itemElem.Water || 0, 2);
    const reactivityDen = Math.pow(
      (itemAlch.Matter || 0) + (itemElem.Earth || 0),
      2,
    );
    const reactivity = reactivityNum / (reactivityDen || 1);

    const gregsEnergy = heat - entropy * reactivity;

    // Kinetic properties
    const itemCharge = (itemAlch.Matter || 0) + (itemAlch.Substance || 0);
    const itemVoltage = itemCharge > 0 ? gregsEnergy / itemCharge : 0;
    const itemCurrent = reactivity;
    const itemPower = itemCurrent * itemVoltage;

    itemKinetic = {
      power: itemPower,
      currentFlow: itemCurrent,
      potentialDifference: itemVoltage,
      charge: itemCharge,
    };
  } else {
    // Fallback: neutral kinetic state
    itemKinetic = {
      power: 0.5,
      currentFlow: 0.5,
      potentialDifference: 1.0,
      charge: 1.0,
    };
  }

  // Calculate compatibility using enhanced algorithm
  const compatibility = calculateKineticCompatibility(userKinetic, itemKinetic);

  // Convert 0-1 compatibility to scoring range (-0.3 to 0.3)
  const score = (compatibility.overall - 0.5) * 0.6;

  return Math.max(-0.3, Math.min(0.3, score));
}

/**
 * Calculate retrograde effects
 */
export function calculateRetrogradeEffect(
  astroData: AstrologicalData,
  context: ScoringContext,
): number {
  let score = 0;
  const itemRulers = context.item.planetaryRulers || [];

  for (const planet of itemRulers) {
    const planetData = astroData.planetaryPositions[planet];
    if (planetData.isRetrograde) {
      // Retrograde planets generally reduce effectiveness
      score -= 0.1;

      // Exception: Mercury retrograde can favor traditional methods
      if (planet === "Mercury" && context.item.type === "cooking_method") {
        score += 0.05; // Partial compensation
      }
    }
  }

  return Math.max(-0.3, Math.min(0, score));
}

// ==================== MAIN SCORING SERVICE ====================

export class UnifiedScoringService {
  private static instance: UnifiedScoringService;

  private constructor() {}

  public static getInstance(): UnifiedScoringService {
    if (!UnifiedScoringService.instance) {
      UnifiedScoringService.instance = new UnifiedScoringService();
    }
    return UnifiedScoringService.instance;
  }

  /**
   * Main scoring function that calculates a comprehensive score
   */
  public async scoreRecommendation(
    context: ScoringContext,
  ): Promise<ScoringResult> {
    const startTime = performance.now();

    try {
      // 1. Gather astrological data
      const astroData = await this.gatherAstrologicalData(context);
      // 2. Calculate each effect using modular functions
      const breakdown: ScoringBreakdown = {
        base: 0.5, // Neutral base score
        transitEffect: calculateTransitEffect(astroData, context),
        dignityEffect: calculateDignityEffect(astroData, context),
        tarotEffect: calculateTarotEffect(astroData, context),
        seasonalEffect: calculateSeasonalEffect(astroData, context),
        locationEffect: calculateLocationEffect(astroData, context),
        lunarPhaseEffect: calculateLunarPhaseEffect(astroData, context),
        aspectEffect: calculateAspectEffect(astroData, context),
        elementalCompatibility: calculateElementalCompatibility(
          astroData,
          context,
        ),
        thermalDynamicEffect: calculateThermodynamicEffect(astroData, context),
        kineticCompatibilityEffect: calculateKineticCompatibilityEffect(
          astroData,
          context,
        ),
        kalchmResonance: calculateKalchmResonance(astroData, context),
        monicaOptimization: calculateMonicaOptimization(astroData, context),
        retrogradeEffect: calculateRetrogradeEffect(astroData, context),
      };

      // 3. Apply custom weights if provided
      if (context.options?.weights) {
        for (const [key, weight] of Object.entries(context.options.weights)) {
          if (key in breakdown && typeof weight === "number") {
            breakdown[key] *= weight;
          }
        }
      }

      // 4. Aggregate final score
      const finalScore = this.aggregateScore(breakdown);

      // 5. Determine confidence based on data quality
      const confidence = this.calculateConfidence(astroData, context);

      // 6. Generate notes and metadata
      const notes = this.generateNotes(breakdown, astroData, context);
      const dominantEffects = this.identifyDominantEffects(breakdown);
      const warnings = this.generateWarnings(breakdown, astroData, context);

      const result: ScoringResult = {
        score: finalScore,
        confidence,
        breakdown,
        sources: [astroData.source, "alchemical_engine", "location_service"],
        notes,
        metadata: {
          timestamp: new Date(),
          location: context.location,
          dominantEffects,
          warnings,
        },
      };

      // Debug logging
      if (context.options?.debugMode) {
        const endTime = performance.now();
        log.info(`Scoring completed in ${endTime - startTime}ms`, result);
      }

      return result;
    } catch (error) {
      log.error("Error in scoring calculation: ", error as any);

      // Return fallback result
      return {
        score: 0.5,
        confidence: 0.1,
        breakdown: { base: 0.5 } as ScoringBreakdown,
        sources: ["fallback"],
        notes: [`Error in calculation: ${(error as Error).message}`],
        metadata: {
          timestamp: new Date(),
          dominantEffects: [],
          warnings: ["Calculation error - using fallback score"],
        },
      };
    }
  }

  /**
   * Gather astrological data from various sources
   */
  private async gatherAstrologicalData(
    context: ScoringContext,
  ): Promise<AstrologicalData> {
    try {
      // Try to get data from Astrologize API first
      const astrologizeData = await this.getAstrologizeData(context);
      if (astrologizeData) {
        return {
          ...astrologizeData,
          source: "astrologize" as const,
          confidence: 0.95,
        } as AstrologicalData;
      }
    } catch (error) {
      log.warn("Astrologize API unavailable, falling back to Swiss Ephemeris");
    }

    try {
      // Fallback to Swiss Ephemeris or local calculations
      const fallbackData = await this.getFallbackAstrologicalData(context);
      return {
        ...fallbackData,
        source: "swiss_ephemeris" as const,
        confidence: 0.7,
      } as AstrologicalData;
    } catch (error) {
      log.warn("Swiss Ephemeris unavailable, using minimal fallback data");

      // Last resort: basic fallback data
      return this.getMinimalFallbackData(context);
    }
  }

  /**
   * Get data from Astrologize API
   */
  private async getAstrologizeData(
    context: ScoringContext,
  ): Promise<Partial<AstrologicalData> | null> {
    try {
      const response = await fetch("/api/astrologize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: context.dateTime.getFullYear(),
          month: context.dateTime.getMonth() + 1,
          date: context.dateTime.getDate(),
          hour: context.dateTime.getHours(),
          minute: context.dateTime.getMinutes(),
          latitude: context.location?.latitude || 40.7498,
          longitude: context.location?.longitude || -73.7976,
        }),
      });

      if (!response.ok) return null;

      const data = await response.json();

      // Transform API response to our format
      return this.transformAstrologizeResponse(data);
    } catch (error) {
      log.error("Error fetching Astrologize data: ", error as any);
      return null;
    }
  }

  /**
   * Get fallback astrological data
   */
  private async getFallbackAstrologicalData(
    context: ScoringContext,
  ): Promise<Partial<AstrologicalData>> {
    return {
      planetaryPositions:
        context.planetaryPositions || ({} as Record<Planet, PlanetaryPosition>),
      aspects: (context.aspects || []).map((aspect) => ({
        ...aspect,
        strength: 0.5, // Default strength for fallback data
      })),
      transits: { active: [], seasonal: {} as any },
      lunarPhase: {
        name: "new moon" as LunarPhase,
        illumination: 0.5,
        effect: "Neutral",
      },
      dignity: {} as Record<Planet, number>,
    };
  }

  /**
   * Get minimal fallback data when all else fails
   */
  private getMinimalFallbackData(context: ScoringContext): AstrologicalData {
    return {
      planetaryPositions: {} as Record<Planet, PlanetaryPosition>,
      aspects: [],
      transits: { active: [], seasonal: {} as any },
      lunarPhase: {
        name: "new moon" as LunarPhase,
        illumination: 0.5,
        effect: "Neutral",
      },
      dignity: {} as Record<Planet, number>,
      source: "fallback" as const,
      confidence: 0.1,
    };
  }

  /**
   * Transform Astrologize API response to our format
   */
  private transformAstrologizeResponse(
    data: Record<string, unknown>,
  ): Partial<AstrologicalData> {
    // This would transform the actual API response
    // The exact structure depends on what the Astrologize API returns
    return {
      planetaryPositions: data.planets || ({} as any),
      aspects: data.aspects || ([] as any),
      dignity: data.dignity || ({} as any),
    } as any;
  }

  /**
   * Aggregate individual effect scores into final score
   */
  private aggregateScore(breakdown: ScoringBreakdown): number {
    // Default weights for each effect
    // ENHANCED: Increased weights for thermodynamic and kinetic effects
    // to create better score differentiation
    const weights = {
      base: 1.0,
      transitEffect: 0.7,
      dignityEffect: 0.6,
      tarotEffect: 0.25,
      seasonalEffect: 0.5,
      locationEffect: 0.4,
      lunarPhaseEffect: 0.35,
      aspectEffect: 0.65,
      elementalCompatibility: 0.85,
      thermalDynamicEffect: 1.2, // INCREASED from 0.6 - more impact
      kineticCompatibilityEffect: 1.1, // NEW - significant weight
      kalchmResonance: 0.4,
      monicaOptimization: 0.3,
      retrogradeEffect: 0.55,
    };

    let totalWeightedScore = 0;
    let totalWeight = 0;

    for (const [effect, score] of Object.entries(breakdown)) {
      const weight = weights[effect as keyof typeof weights] || 0.1;
      totalWeightedScore += score * weight;
      totalWeight += weight;
    }

    const aggregatedScore = totalWeightedScore / totalWeight;

    // Normalize to 0-1 range
    return Math.max(0, Math.min(1, aggregatedScore));
  }

  /**
   * Calculate confidence in the result
   */
  private calculateConfidence(
    astroData: AstrologicalData,
    context: ScoringContext,
  ): number {
    let { confidence } = astroData;

    // Reduce confidence if missing key data
    if (!context.location) confidence -= 0.1;
    if (!context.item.elementalProperties) confidence -= 0.1;
    if (!context.item.planetaryRulers?.length) confidence -= 0.1;

    return Math.max(0.1, Math.min(1.0, confidence));
  }

  /**
   * Generate explanatory notes
   */
  private generateNotes(
    breakdown: ScoringBreakdown,
    astroData: AstrologicalData,
    _context: ScoringContext,
  ): string[] {
    const notes: string[] = [];

    // Highlight significant effects
    if (breakdown.seasonalEffect > 0.15) {
      notes.push("Strong seasonal alignment enhances this recommendation");
    }
    if (breakdown.transitEffect > 0.2) {
      notes.push("Current planetary transits strongly favor this choice");
    }
    if (breakdown.elementalCompatibility > 0.3) {
      notes.push("Excellent elemental compatibility with current state");
    }
    if (breakdown.retrogradeEffect < -0.15) {
      notes.push("Retrograde planets may reduce effectiveness");
    }

    // Add source information
    notes.push(`Astrological data from: ${astroData.source}`);

    return notes;
  }

  /**
   * Identify the most influential effects
   */
  private identifyDominantEffects(breakdown: ScoringBreakdown): string[] {
    const effects = Object.entries(breakdown)
      .filter(([key]) => key !== "base")
      .map(([key, value]) => ({ key, value: Math.abs(value) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
      .map(({ key }) => key);

    return effects;
  }

  /**
   * Generate warnings based on the calculation
   */
  private generateWarnings(
    breakdown: ScoringBreakdown,
    astroData: AstrologicalData,
    _context: ScoringContext,
  ): string[] {
    const warnings: string[] = [];

    if (astroData.confidence < 0.5) {
      warnings.push("Low confidence in astrological data");
    }

    if (breakdown.retrogradeEffect < -0.2) {
      warnings.push("Multiple retrograde planets may cause complications");
    }

    if (breakdown.transitEffect < -0.2) {
      warnings.push("Challenging planetary transits detected");
    }

    return warnings;
  }
}

// Export convenience function
export const scoreRecommendation = (
  context: ScoringContext,
): Promise<ScoringResult> =>
  UnifiedScoringService.getInstance().scoreRecommendation(context);
