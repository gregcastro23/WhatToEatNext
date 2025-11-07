// Type imports
import { DEFAULT_ELEMENTAL_PROPERTIES } from "@/constants/defaults";
import { PLANETARY_MODIFIERS, type RulingPlanet } from "@/constants/planets";
import type { AlchemicalCalculationResult, BirthInfo } from "@/types/alchemy";
import type { ChakraEnergies } from "@/types/chakra";
import type {
  AstrologicalState,
  ElementalProperties,
  PlanetPosition,
  StandardizedAlchemicalResult,
  ZodiacSign,
} from "@/types/unified";

// Internal imports
import { createLogger } from "@/utils/logger";

// Logger
const logger = createLogger("AlchemicalEngine");

// Define interfaces
interface Decan {
  ruler: RulingPlanet;
  element: keyof ElementalProperties;
  degree: number;
}

// Interface for horoscope data
interface HoroscopeData {
  tropical: Record<string, unknown>;
  [key: string]: unknown;
}

// Use StandardizedAlchemicalResult
export type AlchemicalResult = StandardizedAlchemicalResult;

// Default elemental value
const DEFAULT_ELEMENT_VALUE = 0.25;

/**
 * Safely gets an element value from elemental properties
 */
function safeGetElementValue(
  props: Partial<ElementalProperties> | null | undefined,
  element: keyof ElementalProperties,
): number {
  try {
    if (!props || typeof props !== "object") {
      return DEFAULT_ELEMENT_VALUE;
    }

    const value = props[element];
    if (typeof value !== "number" || isNaN(value)) {
      return DEFAULT_ELEMENT_VALUE;
    }

    return Math.max(0, Math.min(1, value));
  } catch (error) {
    logger.error("Error in safeGetElementValue", {
      element,
      error: error instanceof Error ? error.message : String(error),
    });
    return DEFAULT_ELEMENT_VALUE;
  }
}

/**
 * AlchemicalEngineAdvanced class handles calculations related to
 * astrological and elemental influences.
 */
export class AlchemicalEngineAdvanced {
  private readonly elementalStrengths: Record<string, number> = {
    Fire: 1,
    Air: 1,
    Water: 1,
    Earth: 1,
  };

  private readonly zodiacElements: Record<
    ZodiacSign,
    keyof ElementalProperties
  > = {
    aries: "Fire",
    leo: "Fire",
    sagittarius: "Fire",
    taurus: "Earth",
    virgo: "Earth",
    capricorn: "Earth",
    gemini: "Air",
    libra: "Air",
    aquarius: "Air",
    cancer: "Water",
    scorpio: "Water",
    pisces: "Water",
  };

  private readonly lunarPhaseModifiers: Record<string, ElementalProperties> = {
    "new moon": { Fire: 0.1, Water: 0.4, Air: 0.3, Earth: 0.2 },
    "waxing crescent": { Fire: 0.2, Water: 0.3, Air: 0.3, Earth: 0.2 },
    "first quarter": { Fire: 0.3, Water: 0.2, Air: 0.3, Earth: 0.2 },
    "waxing gibbous": { Fire: 0.4, Water: 0.2, Air: 0.3, Earth: 0.1 },
    "full moon": { Fire: 0.4, Water: 0.1, Air: 0.4, Earth: 0.1 },
    "waning gibbous": { Fire: 0.3, Water: 0.2, Air: 0.3, Earth: 0.2 },
    "last quarter": { Fire: 0.2, Water: 0.3, Air: 0.2, Earth: 0.3 },
    "waning crescent": { Fire: 0.1, Water: 0.4, Air: 0.2, Earth: 0.3 },
  };

  private readonly seasonalModifiers: Record<string, ElementalProperties> = {
    spring: { Fire: 0.3, Water: 0.3, Air: 0.3, Earth: 0.1 },
    summer: { Fire: 0.4, Water: 0.2, Air: 0.3, Earth: 0.1 },
    autumn: { Fire: 0.2, Water: 0.2, Air: 0.3, Earth: 0.3 },
    fall: { Fire: 0.2, Water: 0.2, Air: 0.3, Earth: 0.3 },
    winter: { Fire: 0.1, Water: 0.4, Air: 0.2, Earth: 0.3 },
  };

  private readonly decans: Record<ZodiacSign, Decan[]> = {
    aries: [
      { ruler: "Mars", element: "Fire", degree: 0 },
      { ruler: "Sun", element: "Fire", degree: 10 },
      { ruler: "Jupiter", element: "Fire", degree: 20 },
    ],
    taurus: [
      { ruler: "Venus", element: "Earth", degree: 0 },
      { ruler: "Mercury", element: "Earth", degree: 10 },
      { ruler: "Saturn", element: "Earth", degree: 20 },
    ],
    gemini: [
      { ruler: "Mercury", element: "Air", degree: 0 },
      { ruler: "Venus", element: "Air", degree: 10 },
      { ruler: "Uranus", element: "Air", degree: 20 },
    ],
    cancer: [
      { ruler: "Moon", element: "Water", degree: 0 },
      { ruler: "Pluto", element: "Water", degree: 10 },
      { ruler: "Neptune", element: "Water", degree: 20 },
    ],
    leo: [
      { ruler: "Sun", element: "Fire", degree: 0 },
      { ruler: "Jupiter", element: "Fire", degree: 10 },
      { ruler: "Mars", element: "Fire", degree: 20 },
    ],
    virgo: [
      { ruler: "Mercury", element: "Earth", degree: 0 },
      { ruler: "Saturn", element: "Earth", degree: 10 },
      { ruler: "Venus", element: "Earth", degree: 20 },
    ],
    libra: [
      { ruler: "Venus", element: "Air", degree: 0 },
      { ruler: "Uranus", element: "Air", degree: 10 },
      { ruler: "Mercury", element: "Air", degree: 20 },
    ],
    scorpio: [
      { ruler: "Pluto", element: "Water", degree: 0 },
      { ruler: "Neptune", element: "Water", degree: 10 },
      { ruler: "Moon", element: "Water", degree: 20 },
    ],
    sagittarius: [
      { ruler: "Jupiter", element: "Fire", degree: 0 },
      { ruler: "Mars", element: "Fire", degree: 10 },
      { ruler: "Sun", element: "Fire", degree: 20 },
    ],
    capricorn: [
      { ruler: "Saturn", element: "Earth", degree: 0 },
      { ruler: "Venus", element: "Earth", degree: 10 },
      { ruler: "Mercury", element: "Earth", degree: 20 },
    ],
    aquarius: [
      { ruler: "Uranus", element: "Air", degree: 0 },
      { ruler: "Mercury", element: "Air", degree: 10 },
      { ruler: "Venus", element: "Air", degree: 20 },
    ],
    pisces: [
      { ruler: "Neptune", element: "Water", degree: 0 },
      { ruler: "Moon", element: "Water", degree: 10 },
      { ruler: "Pluto", element: "Water", degree: 20 },
    ],
  };

  /**
   * Calculate the astrological match between a recipe and the current astrological state
   */
  calculateAstroCuisineMatch(
    recipeElements: ElementalProperties | undefined,
    astrologicalState: AstrologicalState | undefined,
    season: string | undefined,
    cuisine: string | undefined,
  ): AlchemicalCalculationResult {
    try {
      // Get dominant element
      const baseElements = recipeElements || DEFAULT_ELEMENTAL_PROPERTIES;
      const entries = Object.entries(baseElements).filter(
        ([, v]) => typeof v === "number",
      );
      const dominantElement = (entries.reduce((max, current) =>
        current[1] > max[1] ? current : max,
      ) || ["Fire", DEFAULT_ELEMENT_VALUE])[0];

      // Validate season
      const validSeason = this.getValidSeason(season);

      // Function to check if string is a valid RulingPlanet
      const isRulingPlanet = (planet: string): planet is RulingPlanet =>
        Object.prototype.hasOwnProperty.call(PLANETARY_MODIFIERS, planet);

      // Calculate astronomical score
      const astronomicalScore = astrologicalState?.activePlanets
        ? astrologicalState.activePlanets.filter(
            (p) => isRulingPlanet(p) && PLANETARY_MODIFIERS[p] > 0,
          ).length * 10
        : 0;

      // Cuisine compatibility score (placeholder)
      const cuisineScore = cuisine
        ? this.getCuisineCompatibility(cuisine, astrologicalState, validSeason)
        : 0;

      // Calculate total score
      const totalScore = astronomicalScore + cuisineScore;

      return {
        result: {
          elementalProperties: baseElements,
          thermodynamicProperties: {
            heat: 0,
            entropy: 0,
            reactivity: 0,
            gregsEnergy: 0,
          },
          score: totalScore,
        } as any,
        dominantElement: dominantElement as keyof ElementalProperties,
        season: validSeason,
      };
    } catch (error) {
      logger.error("Error in calculateAstroCuisineMatch", {
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        result: {
          elementalProperties: DEFAULT_ELEMENTAL_PROPERTIES,
          thermodynamicProperties: {
            heat: 0,
            entropy: 0,
            reactivity: 0,
            gregsEnergy: 0,
          },
          score: 0,
        } as any,
        dominantElement: "Fire",
        season: "winter",
      };
    }
  }

  /**
   * Get valid season string
   */
  private getValidSeason(season?: string): string {
    const normalizedSeason = season?.toLowerCase();
    if (
      normalizedSeason === "spring" ||
      normalizedSeason === "summer" ||
      normalizedSeason === "autumn" ||
      normalizedSeason === "winter" ||
      normalizedSeason === "fall"
    ) {
      return normalizedSeason === "fall" ? "autumn" : normalizedSeason;
    }
    return "winter";
  }

  /**
   * Get cuisine compatibility score (placeholder)
   */
  private getCuisineCompatibility(
    _cuisine: string,
    _astrologicalState: AstrologicalState | undefined,
    _season: string | undefined,
  ): number {
    return 50; // Default compatibility score
  }
}

/**
 * Main alchemize function for birth chart calculations
 */
export function alchemize(
  birthInfo: BirthInfo,
  horoscopeDict: HoroscopeData,
): AlchemicalResult {
  try {
    // Validate inputs
    if (!birthInfo || typeof birthInfo !== "object") {
      throw new TypeError("Invalid birth info: expected an object");
    }

    if (
      !horoscopeDict ||
      typeof horoscopeDict !== "object" ||
      !horoscopeDict.tropical
    ) {
      throw new TypeError("Invalid horoscope data: missing tropical data");
    }

    // Basic implementation - returns default values
    // This can be expanded with full alchemical calculations
    return {
      elementalProperties: {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25,
      },
      thermodynamicProperties: {
        heat: 0,
        entropy: 0,
        reactivity: 0,
        gregsEnergy: 0,
      },
      zodiacSign: "aries",
      planetaryPositions: {},
      aspects: [],
      houses: [],
      metadata: {
        name: "Alchemical Chart",
        description: "Generated alchemical chart",
        attributes: [],
      },
    } as any;
  } catch (error) {
    logger.error("Error in alchemize", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Calculate current planetary positions
 */
export function calculateCurrentPlanetaryPositions(): PlanetPosition[] {
  // Placeholder implementation
  return [];
}

/**
 * Calculate zodiac energies
 */
export function calculateZodiacEnergies(): Record<string, number> {
  return {};
}

/**
 * Calculate chakra energies
 */
export function calculateChakraEnergies(
  _zodiacEnergies: Record<string, number>,
): ChakraEnergies {
  return {
    root: 0,
    sacral: 0,
    solarPlexus: 0,
    heart: 0,
    throat: 0,
    thirdEye: 0,
    crown: 0,
    brow: 0,
  };
}

/**
 * Safe alchemize wrapper
 */
export function safeAlchemize(
  birthInfo: BirthInfo,
  horoscopeDict: HoroscopeData,
): AlchemicalResult {
  try {
    return alchemize(birthInfo, horoscopeDict);
  } catch (error) {
    logger.error("Safe alchemize failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    // Return default result
    return {
      elementalProperties: DEFAULT_ELEMENTAL_PROPERTIES,
      thermodynamicProperties: {
        heat: 0,
        entropy: 0,
        reactivity: 0,
        gregsEnergy: 0,
      },
      zodiacSign: "aries",
      planetaryPositions: {},
      aspects: [],
      houses: [],
      metadata: {
        name: "Default Chart",
        description: "Fallback alchemical chart",
        attributes: [],
      },
    } as any;
  }
}

/**
 * Alchemize with safety wrapper
 */
export function alchemizeWithSafety(
  birthInfo: BirthInfo,
  horoscopeDict: HoroscopeData,
): AlchemicalResult {
  return safeAlchemize(birthInfo, horoscopeDict);
}
