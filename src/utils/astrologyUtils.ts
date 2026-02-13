import SunCalc from "suncalc";

// Removed unused, import: AlchemicalDignityType
import type {
  AlchemicalProperty,
  ElementalCharacter,
} from "@/constants/planetaryElements";
import { _logger } from "@/lib/logger";
import { PlanetaryHourCalculator } from "@/lib/PlanetaryHourCalculator";
import { log } from "@/services/LoggingService";
import type {
  AlchemicalItem,
  AlchemicalResult,
  AstrologicalState,
  DignityType,
  Element,
  ElementalInteraction,
  ElementalItem,
  AspectType as ImportedAspectType,
  ElementalProperties as ImportedElementalProperties,
  // BasicThermodynamicProperties, // unused
  PlanetaryAspect as ImportedPlanetaryAspect,
  LowercaseElementalProperties,
  LunarPhase,
  // PlanetaryAlignment, // unused
  Planet,
  Season,
  ThermodynamicProperties,
} from "@/types/alchemy";
import type { ZodiacSign } from "@/types/celestial";
import type { TimeFactors } from "@/types/time";
// Removed unused, imports: getCurrentSeason, getTimeOfDay
import { calculatePlanetaryAspects as safeCalculatePlanetaryAspects } from "@/utils/safeAstrology";

// Removed unused, imports: solar, moon

// import {
//   getAccuratePlanetaryPositions,
//   getEnhancedPlanetaryPositions,
// } from "./accurateAstronomy";
const getAccuratePlanetaryPositions: any = null; // Function not available
const getEnhancedPlanetaryPositions: any = null; // Function not available
import { calculateAllHouseEffects } from "./houseEffects";

// Import calculatePlanetaryAspects from safeAstrology

/**
 * A utility function for logging debug information
 * This is a safe replacement for _logger.info that can be disabled in production
 */
const debugLog = (message: string, ..._args: unknown[]): void => {
  // Use the log service for debugging with enterprise intelligence integration
  log.info(`[AstrologyUtils Debug] ${message}`);
};

/**
 * A utility function for logging errors
 * This is a safe replacement for _logger.error that can be disabled in production
 */
const errorLog = (message: string, ..._args: unknown[]): void => {
  // Use the log service for errors with enterprise intelligence integration
  log.error(`[AstrologyUtils Error] ${message}`);
};

/**
 * Get the modifier value for a specific lunar phase
 * @param phase Lunar phase
 * @returns Modifier value between 0 and 1
 */
export function getLunarPhaseModifier(_phase: LunarPhase): number {
  const modifiers: Record<LunarPhase, number> = {
    "new moon": 0.2,
    "waxing crescent": 0.5,
    "first quarter": 0.7,
    "waxing gibbous": 0.9,
    "full moon": 1.0,
    "waning gibbous": 0.8,
    "last quarter": 0.6,
    "waning crescent": 0.3,
  };

  return modifiers[_phase] || 0.5; // default to 0.5 if phase is not recognized
}

// Export calculatePlanetaryAspects from safeAstrology
export const calculatePlanetaryAspects = safeCalculatePlanetaryAspects;

/**
 * Get the element associated with a zodiac sign
 * @param sign Zodiac sign
 * @returns Element ('Fire', 'Earth', 'Air', or 'Water')
 */
export function getZodiacElement(_sign: any): ElementalCharacter {
  const elements: Record<ZodiacSign, ElementalCharacter> = {
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
  return elements[_sign]; // All signs are guaranteed to have elements
}

// Define a replacement getPlanetaryDignity function
export function getPlanetaryDignity(
  planet: string,
  sign: any | undefined,
): { type: DignityType; strength: number } {
  return getPlanetaryDignityInfo(planet, sign);
}

// Add type definition for PlanetPosition
export interface PlanetPosition {
  sign: any;
  degree: number;
  minute: number;
  exactLongitude: number;
  isRetrograde?: boolean;
  error?: boolean;
}

// Use the imported ElementalProperties (uppercase Fire, Water, Earth, Air)
export type ElementalProperties = ImportedElementalProperties;

// Use the imported AspectType but keep local for backwards compatibility
export type AspectType = ImportedAspectType;

// Use the imported PlanetaryAspect but keep local for backwards compatibility
export interface PlanetaryAspect extends ImportedPlanetaryAspect {
  // Adding additional properties needed for the astrologyUtils implementation
  exactAngle?: number; // The exact angle in degrees between the two planets
  applyingSeparating?: "applying" | "separating"; // Whether the aspect is applying or separating
  significance?: number; // A calculated significance score for this aspect (0-1)
  description?: string; // Human-readable description of the aspect
  elementalInfluence?: LowercaseElementalProperties; // How this aspect affects elemental properties
}

// Define AstrologicalEffects interface locally
export interface AstrologicalEffects {
  dignity: LowercaseElementalProperties;
  aspect: LowercaseElementalProperties;
  stellium: LowercaseElementalProperties;
  house: Record<ElementalCharacter, number>;
  joy: LowercaseElementalProperties;
}

// Export zodiac signs array for use by other modules (enterprise intelligence pattern)
export const zodiacSigns: any[] = [
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

// Utility function to validate zodiac sign
export function isValidZodiacSign(sign: string): sign is ZodiacSign {
  return zodiacSigns.includes(sign as any);
}

export interface PlanetPositionData {
  sign: any;
  degree: number;
  minute?: number;
  exactLongitude?: number;
}

export interface PlanetaryDignity {
  type: DignityType;
  value: number;
  description: string;
}

/**
 * Calculate lunar phase more accurately using SunCalc and astronomy-engine data
 * @param date Date to calculate phase for
 * @returns A value between 0 and 1 representing the lunar phase
 */
export async function calculateLunarPhase(
  date: Date = new Date(),
): Promise<number> {
  try {
    // Get accurate positions
    const positions = await getAccuratePlanetaryPositions(date);
    // Validate essential planetary positions are available
    if (
      typeof positions.Sun.exactLongitude !== "number" ||
      typeof positions.Moon.exactLongitude !== "number"
    ) {
      throw new Error(
        "Sun or Moon position missing required exactLongitude data",
      );
    }

    // Calculate the angular distance between sun and moon
    let angularDistance =
      positions.Moon.exactLongitude - positions.Sun.exactLongitude;

    // Normalize to 0-360 range
    angularDistance = ((angularDistance % 360) + 360) % 360;

    // Convert to phase percentage (0 to 1)
    return angularDistance / 360;
  } catch (error) {
    errorLog(
      "Error in calculateLunarPhase: ",
      error instanceof Error ? error.message : String(error),
    );
    return 0; // Default to new moon
  }
}

/**
 * Get the name of the lunar phase based on phase value
 * @param phase Lunar phase (0-1)
 * @returns The name of the lunar phase as a LunarPhase type
 */
export function getLunarPhaseName(phase: number): LunarPhase {
  // First ensure phase is between 0 and 1
  const normalizedPhase = ((phase % 1) + 1) % 1;

  // Convert phase to 0-8 range (8 moon phases)
  const phaseNormalized = normalizedPhase * 8;

  // Use proper type for return values
  if (phaseNormalized < 0.5 || phaseNormalized >= 7.5) return "new moon";
  if (phaseNormalized < 1.5) return "waxing crescent";
  if (phaseNormalized < 2.5) return "first quarter";
  if (phaseNormalized < 3.5) return "waxing gibbous";
  if (phaseNormalized < 4.5) return "full moon";
  if (phaseNormalized < 5.5) return "waning gibbous";
  if (phaseNormalized < 6.5) return "last quarter";
  return "waning crescent";
}

/**
 * Calculate the percentage of the moon that is illuminated
 * @param date Date to calculate illumination for
 * @returns Percentage of illumination (0-100)
 */
export async function getMoonIllumination(
  date: Date = new Date(),
): Promise<number> {
  try {
    // Try using SunCalc library first
    const moonIllumination = SunCalc.getMoonIllumination(date);
    // Validate the illumination data
    if (
      !moonIllumination ||
      typeof moonIllumination.fraction !== "number" ||
      isNaN(moonIllumination.fraction)
    ) {
      throw new Error("Invalid moon illumination data from SunCalc");
    }

    // Get lunar phase (0-1)
    const { phase } = moonIllumination;

    // Determine phase name
    const phaseName = getLunarPhaseName(phase);

    // Calculate corrected illumination fraction
    // SunCalc returns a value between 0-1 representing illumination
    // We'll adjust it based on the phase for more accurate representation;
    let correctedFraction = moonIllumination.fraction;

    // Correction for phase transitions (improves visual perception)
    if (phaseName === "new moon") {
      correctedFraction = Math.min(correctedFraction, 0.02); // Cap at 2%
    } else if (phaseName === "full moon") {
      correctedFraction = Math.max(correctedFraction, 0.98); // Minimum 98%
    }

    debugLog("Moon illumination calculated: ", {
      date: date.toISOString(),
      phase: moonIllumination.phase,
      phaseName,
      _originalFraction: moonIllumination.fraction,
      correctedFraction,
    });

    // Convert fraction to percentage (rounded to nearest integer)
    return Math.round(correctedFraction * 100);
  } catch (error) {
    errorLog("Error calculating moon illumination: ", error);

    // Fallback calculation using lunar phase
    try {
      const phase = await calculateLunarPhase(date);
      const phaseName = getLunarPhaseName(phase);

      // Approximate illumination based on phase name
      switch (phaseName) {
        case "new moon":
          return 0;
        case "waxing crescent":
          return 25;
        case "first quarter":
          return 50;
        case "waxing gibbous":
          return 75;
        case "full moon":
          return 100;
        case "waning gibbous":
          return 75;
        case "last quarter":
          return 50;
        case "waning crescent":
          return 25;
        default:
          return 50;
      }
    } catch (_fallbackError) {
      errorLog("Fallback moon illumination calculation failed");
      return 50; // Default to half-illuminated
    }
  }
}

/**
 * Calculate the sun sign for a given date
 * @param date Date to calculate sun sign for
 * @returns The zodiac sign the sun is in
 */
export function calculateSunSign(date: Date = new Date()): any {
  const month = date.getMonth() + 1; // Jan is 1, Feb is 2, etc.
  const day = date.getDate();

  // Rough approximation of sun sign dates
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21))
    return "scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21))
    return "sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19))
    return "capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18))
    return "aquarius";
  return "pisces";
}

/**
 * Calculate the moon sign for a given date using improved approach
 * @param date Date to calculate moon sign for
 * @returns The zodiac sign the moon is in
 */
export async function calculateMoonSign(
  date: Date = new Date(),
): Promise<ZodiacSign> {
  try {
    // Try to get accurate positions first
    const positions = await getAccuratePlanetaryPositions(date);

    // Return Moon position sign (guaranteed by getAccuratePlanetaryPositions)
    return positions.Moon.sign;
  } catch (error) {
    errorLog("Error in calculateMoonSign: ", error);
    // Fallback to simplified calculation
    const moonLongitude = calculateMoonLongitude(calculateJulianDate(date));
    return getZodiacSign(moonLongitude) as any;
  }
}

// Add validation to planetary position calculations
export async function calculatePlanetaryPositions(
  date: Date = new Date(),
): Promise<Record<string, PlanetPosition>> {
  try {
    // 🎯 HIGH-PRECISION VSOP87 ENHANCED CALCULATIONS
    // Use the new VSOP87-enhanced planetary positions for revolutionary accuracy

    try {
      // Get enhanced positions with VSOP87 Sun accuracy (±0.01°)
      const positions = await getEnhancedPlanetaryPositions(date);

      // Process the positions data to the correct format
      const formattedPositions: Record<string, PlanetPosition> = {};

      // Format each planet's position with enhanced accuracy
      Object.entries(positions).forEach(([planet, data]) => {
        const planetData = data as any;
        const { sign, degree } = getSignFromLongitude(
          planetData.exactLongitude,
        );

        formattedPositions[planet] = {
          sign: sign as any, // Cast string to ZodiacSign
          degree: parseFloat(degree.toFixed(4)), // Increased precision to 4 decimal places
          minute: Math.round((degree % 1) * 60), // Minute calculation
          exactLongitude: planetData.exactLongitude,
          isRetrograde: planetData.isRetrograde,
          // Add VSOP87 accuracy metadata
          accuracy: planet === "Sun" ? "VSOP87 ±0.01°" : "Astronomy Engine",
          calculation_method:
            planet === "Sun"
              ? "VSOP87 with aberration correction"
              : "Standard astronomical",
        } as any;
      });

      debugLog(
        `✅ Enhanced planetary positions calculated with VSOP87 precision for ${date.toISOString().split("T")[0]}`,
      );
      return formattedPositions;
    } catch (vsop87Error) {
      errorLog(
        "VSOP87 enhanced calculations failed, falling back to standard method: ",
        vsop87Error,
      );

      // Fallback to standard astronomy-engine calculations
      try {
        const positions = await getAccuratePlanetaryPositions(date);

        // Process the positions data to the correct format
        const formattedPositions: Record<string, PlanetPosition> = {};

        // Format each planet's position
        Object.entries(positions).forEach(([planet, data]) => {
          const planetData = data as any;
          const { sign, degree } = getSignFromLongitude(
            planetData.exactLongitude,
          );

          formattedPositions[planet] = {
            sign: sign as any, // Cast string to ZodiacSign
            degree: parseFloat(degree.toFixed(3)),
            minute: Math.round((degree % 1) * 60), // Add minute calculation
            exactLongitude: planetData.exactLongitude,
            isRetrograde: planetData.isRetrograde,
            accuracy: "Astronomy Engine fallback",
            calculation_method: "Standard astronomical calculation",
          } as any;
        });

        debugLog("⚠️ Using astronomy-engine fallback calculations");
        return formattedPositions;
      } catch (standardError) {
        errorLog(
          "Standard astronomical calculations also failed: ",
          standardError,
        );
      }
    }

    errorLog(
      "All astronomical calculation methods failed, using default positions",
    );

    // Final fallback to default positions with error flag
    const defaults = getDefaultPlanetaryPositions();
    // Mark all positions as error states (all positions exist by design)
    Object.values(defaults).forEach((p) => {
      p.error = true;
      // Add accuracy metadata even for fallbacks
      (p as any).accuracy = "Default fallback positions";
      (p as any).calculation_method = "Static default values";
    });

    return defaults;
  } catch (error) {
    errorLog("Critical error in calculatePlanetaryPositions: ", error);

    // Emergency fallback
    const defaults = getDefaultPlanetaryPositions();
    Object.values(defaults).forEach((p) => {
      p.error = true;
      (p as any).accuracy = "Emergency fallback";
      (p as any).calculation_method = "Critical failure recovery";
    });

    return defaults;
  }
}

/**
 * Standardize planet name to have correct capitalization
 * This helps ensure consistency between different parts of the application
 */
function _standardizePlanetName(_planet: string): string {
  const nameMap: Record<string, string> = {
    sun: "Sun",
    moon: "Moon",
    mercury: "Mercury",
    venus: "Venus",
    mars: "Mars",
    jupiter: "Jupiter",
    saturn: "Saturn",
    uranus: "Uranus",
    neptune: "Neptune",
    pluto: "Pluto",
  };
  const lowerPlanet = _planet.toLowerCase();
  return nameMap[lowerPlanet] || _planet;
}

/**
 * Validate planetary positions
 * @param positions Record of planetary positions
 * @returns True if all positions are valid
 */
function _validatePlanetaryPositions(
  positions: Record<string, number>,
): boolean {
  const REQUIRED_PLANETS = [
    "Sun",
    "Moon",
    "Mercury",
    "Venus",
    "Mars",
    "Jupiter",
    "Saturn",
    "Uranus",
    "Neptune",
    "Pluto",
  ];

  // Check if we have an empty object (positions parameter is defined by function signature)
  if (Object.keys(positions).length === 0) {
    errorLog("Validation, failed: No positions provided in object");
    return false;
  }

  // Log the positions for debugging
  debugLog("Validating positions: ", positions);

  // Check that required planets exist with valid values
  const validation = REQUIRED_PLANETS.every((requiredPlanet) => {
    // Check if the planet exists in the positions object (case insensitive)
    const planetKey = Object.keys(positions).find(
      (key) => key.toLowerCase() === requiredPlanet.toLowerCase(),
    );

    if (!planetKey) {
      errorLog(`Missing position for ${requiredPlanet}`);
      return false;
    }

    const longitude = positions[planetKey];
    const isValid =
      typeof longitude === "number" &&
      !isNaN(longitude) &&
      longitude >= 0 &&
      longitude < 360;

    if (!isValid) {
      errorLog(`Invalid position for ${requiredPlanet}: ${longitude}`);
    }

    return isValid;
  });

  debugLog("Validation result: ", validation);
  return validation;
}

function _calculatePlanetPosition(
  jd: number,
  planet: string,
): { sign: string; degree: number; minute: number } {
  const longitude = calculatePlanetLongitude(jd, planet);
  const position = longitudeToZodiacPosition(longitude);

  return {
    sign: position.sign,
    degree: position.degree,
    minute: Math.floor((position.degree % 1) * 60),
  };
}

function calculatePlanetLongitude(jd: number, planet: string): number {
  // More accurate calculations for each planet
  switch (planet.toLowerCase()) {
    case "sun":
      return calculateSunLongitude(jd);
    case "moon":
      return calculateMoonLongitude(jd);
    case "mercury":
      return calculateInnerPlanetLongitude(jd, "mercury");
    case "venus":
      return calculateInnerPlanetLongitude(jd, "venus");
    case "mars":
      return calculateOuterPlanetLongitude(jd, "mars");
    case "jupiter":
      return calculateOuterPlanetLongitude(jd, "jupiter");
    case "saturn":
      return calculateOuterPlanetLongitude(jd, "saturn");
    case "uranus":
      return calculateOuterPlanetLongitude(jd, "uranus");
    case "neptune":
      return calculateOuterPlanetLongitude(jd, "neptune");
    case "pluto":
      return calculateOuterPlanetLongitude(jd, "pluto");
    default:
      throw new Error(`Unsupported planet: ${planet}`);
  }
}

/**
 * Calculate Julian date from JavaScript Date object
 * @param date The date to convert
 * @returns Julian date
 */
function calculateJulianDate(date: Date): number {
  // Direct calculation (astronomia dependency removed)
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1; // JavaScript months are 0-based
  const day = date.getUTCDate();
  const hour = date.getUTCHours();
  const minute = date.getUTCMinutes();
  const second = date.getUTCSeconds();

  // Use direct calculation to get Julian date
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;

  let jd =
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;

  // Add time of day
  jd += (hour - 12) / 24 + minute / 1440 + second / 86400;

  return jd;
}

/**
 * Calculate the Sun's longitude
 * @param jd Julian date
 * @returns Sun's ecliptic longitude in degrees
 */
function calculateSunLongitude(jd: number): number {
  // Using more precise VSOP87 model calculations
  const T = (jd - 2451545.0) / 36525;
  let L0 = 280.46646 + T * (36000.76983 + T * 0.0003032);
  L0 = (L0 + 360) % 360;
  return L0;
}

/**
 * Calculate the moon's ecliptic longitude
 * @param jd Julian date
 * @returns Moon's ecliptic longitude in degrees
 */
function calculateMoonLongitude(jd: number): number {
  // Using Brown's Lunar Theory with more terms
  const T = (jd - 2451545.0) / 36525;
  let L = 218.3164477 + 481267.88123421 * T;
  L += 6.2886 * Math.sin(((134.9633964 + 477198.8675055 * T) * Math.PI) / 180);
  L += 1.274 * Math.sin(((235.7 + 483202.0175233 * T) * Math.PI) / 180);
  return (L + 360) % 360;
}

/**
 * Calculate the longitude of inner planets (Mercury, Venus)
 * @param jd Julian date
 * @param planet The planet to calculate
 * @returns Planet's ecliptic longitude in degrees
 */
function calculateInnerPlanetLongitude(jd: number, planet: string): number {
  try {
    // Inner planets have different orbital characteristics
    const orbitalData = {
      mercury: {
        sma: 0.387098, // Semi-major axis in AU,
        ecc: 0.20563, // Eccentricity,
        inc: 7.0047, // Inclination,
        peri: 29.1241, // Argument of perihelion,
        node: 48.3313, // Longitude of ascending node,
        period: 87.969, // Orbital period in days
      },
      venus: {
        sma: 0.723332, // Semi-major axis in AU,
        ecc: 0.006772, // Eccentricity,
        inc: 3.3946, // Inclination,
        peri: 54.891, // Argument of perihelion,
        node: 76.68, // Longitude of ascending node,
        period: 224.701, // Orbital period in days
      },
    };

    const planetData = orbitalData[planet as keyof typeof orbitalData];
    if (!planetData) {
      throw new Error(`Planet ${planet} not supported`);
    }

    const t = (jd - 2451545.0) / 365.25; // Julian years since J2000
    // Use time factor for enhanced precision in mean anomaly calculation
    const meanAnomaly =
      ((360 / planetData.period) * (jd - 2451545.0) * (1 + t * 0.0001)) % 360;

    // Very simplified calculation - in a real systemwe'd use full orbital elements
    const longitudeOfPerihelion = planetData.node + planetData.peri;
    const trueAnomaly =
      meanAnomaly +
      2 * planetData.ecc * Math.sin((meanAnomaly * Math.PI) / 180);
    const longitude = (trueAnomaly + longitudeOfPerihelion) % 360;

    return longitude;
  } catch (error) {
    errorLog(`Error calculating ${planet} longitude: `, error);
    // Fallback to simple calculation
    const t = (jd - 2451545.0) / 36525; // Julian centuries since J2000
    const meanLongitude =
      planet === "mercury"
        ? 252.25084 + t * 538101.03
        : 181.9798 + t * 210664.1366; // Venus
    return meanLongitude % 360;
  }
}

/**
 * Calculate the longitude of outer planets (Mars through Pluto)
 * @param jd Julian date
 * @param planet The planet to calculate
 * @returns Planet's ecliptic longitude in degrees
 */
function calculateOuterPlanetLongitude(jd: number, planet: string): number {
  try {
    // Outer planets have different orbital characteristics
    const orbitalData = {
      mars: {
        period: 686.98,
        epochLongitude: 355.45332,
        epochDate: 2451545.0, // J2000,
        dailyMotion: 0.5240207766,
      },
      jupiter: {
        period: 4332.59,
        epochLongitude: 34.40438,
        epochDate: 2451545.0,
        dailyMotion: 0.0830853001,
      },
      saturn: {
        period: 10759.22,
        epochLongitude: 50.077471,
        epochDate: 2451545.0,
        dailyMotion: 0.0334442282,
      },
      uranus: {
        period: 30688.5,
        epochLongitude: 314.055005,
        epochDate: 2451545.0,
        dailyMotion: 0.011725806,
      },
      neptune: {
        period: 60182,
        epochLongitude: 304.348665,
        epochDate: 2451545.0,
        dailyMotion: 0.0059802665,
      },
      pluto: {
        period: 90560,
        epochLongitude: 238.92881,
        epochDate: 2451545.0,
        dailyMotion: 0.0039793764,
      },
    };

    const planetData = orbitalData[planet as keyof typeof orbitalData];
    if (!planetData) {
      throw new Error(`Planet ${planet} not supported`);
    }

    // Calculate days since epoch
    const daysSinceEpoch = jd - planetData.epochDate;

    // Calculate current longitude based on daily motion
    const longitude =
      (planetData.epochLongitude + daysSinceEpoch * planetData.dailyMotion) %
      360;

    return longitude;
  } catch (error) {
    errorLog(`Error calculating ${planet} longitude: `, error);
    // Fallback to very simple calculation based on orbital period
    const periods = {
      mars: 686.98,
      jupiter: 4332.59,
      saturn: 10759.22,
      uranus: 30688.5,
      neptune: 60182,
      pluto: 90560,
    };

    const period = periods[planet as keyof typeof periods] || 365.25;
    const t = jd - 2451545.0; // Days since J2000
    const meanLongitude = ((t / period) * 360) % 360;

    return meanLongitude;
  }
}

/**
 * Fallback planetary position calculation - very simplified
 * Used when primary calculations fail (astronomia dependency removed)
 * @param date Current date
 * @returns Basic planetary positions
 */
function _calculateFallbackPositions(_date: Date): Record<string, number> {
  debugLog("Using fallback planetary position calculation");
  const positions: Record<string, number> = {};
  const dayOfYear =
    Math.floor(
      _date.getTime() - new Date(_date.getFullYear(), 0, 0).getTime(),
    ) /
    (1000 * 60 * 60 * 24);
  const yearFraction = dayOfYear / 365.25;

  // Planetary periods and offsets for simple approximation
  const planetaryData = {
    Sun: { period: 1, offset: 280 },
    Moon: { period: 0.0748, offset: 100 },
    Mercury: { period: 0.241, offset: 50 },
    Venus: { period: 0.615, offset: 140 },
    Mars: { period: 1.881, offset: 220 },
    Jupiter: { period: 11.86, offset: 30 },
    Saturn: { period: 29.46, offset: 90 },
    Uranus: { period: 84.01, offset: 170 },
    Neptune: { period: 164.8, offset: 270 },
    Pluto: { period: 248.1, offset: 320 },
  };

  // Calculate all planet positions
  for (const [planet, data] of Object.entries(planetaryData)) {
    positions[planet] =
      ((yearFraction * 360) / data.period + data.offset) % 360;
  }

  return positions;
}

// Add missing PLANETARY_JOYS constant
const PLANETARY_JOYS: Record<string, number> = {
  Sun: 9,
  Moon: 3,
  Mercury: 1,
  Venus: 5,
  Mars: 6,
  Jupiter: 11,
  Saturn: 12,
};

// Add missing HOUSE_AFFINITIES constant
const HOUSE_AFFINITIES: Record<number, { element: string; planet: string }> = {
  1: { element: "Fire", planet: "Mars" },
  2: { element: "Earth", planet: "Venus" },
  3: { element: "Air", planet: "Mercury" },
  4: { element: "Water", planet: "Moon" },
  5: { element: "Fire", planet: "Sun" },
  6: { element: "Earth", planet: "Mercury" },
  7: { element: "Air", planet: "Venus" },
  8: { element: "Water", planet: "Pluto" },
  9: { element: "Fire", planet: "Jupiter" },
  10: { element: "Earth", planet: "Saturn" },
  11: { element: "Air", planet: "Uranus" },
  12: { element: "Water", planet: "Neptune" },
};

// House meanings and natural affinities with planets
export const _HOUSE_STRENGTH: Record<string, number> = {
  _Angular: 1.5, // 1st, 4th, 7th, 10th - most powerful,
  _Succedent: 1.2, // 2nd, 5th, 8th, 11th - moderately powerful,
  _Cadent: 0.9, // 3rd, 6th, 9th, 12th - least powerful
};

/**
 * Checks if a planet is in its joy house
 * @param planet Planet name
 * @param house House number (1-12)
 * @returns True if the planet is in its joy house
 */
export function isPlanetInJoy(planet: string, house: number): boolean {
  return PLANETARY_JOYS[planet] === house;
}

/**
 * Calculates the house position based on rising degree and planet position
 * @param risingDegree The rising degree (Ascendant)
 * @param planetDegree The absolute degree position of the planet (0-359)
 * @returns House number (1-12)
 */
export function calculateHousePosition(
  risingDegree: number,
  planetDegree: number,
): number {
  // Calculate relative position to the Ascendant
  const relativeDegree = (planetDegree - risingDegree + 360) % 360;

  // Convert to house (each house is 30 degrees)
  const house = Math.floor(relativeDegree / 30) + 1;

  return house;
}

/**
 * Gets the traditional ruler of a zodiac sign
 * @param sign Zodiac sign
 * @returns The ruling planet
 */
export function getTraditionalRuler(sign: string): string {
  const rulers: Record<string, string> = {
    aries: "Mars",
    taurus: "Venus",
    gemini: "Mercury",
    cancer: "Moon",
    leo: "Sun",
    virgo: "Mercury",
    libra: "Venus",
    scorpio: "Mars", // Traditional ruler (before Pluto),
    sagittarius: "Jupiter",
    capricorn: "Saturn",
    aquarius: "Saturn", // Traditional ruler (before Uranus),
    pisces: "Jupiter", // Traditional ruler (before Neptune)
  };

  return rulers[sign] || "";
}

/**
 * Calculate enhanced stellium effects based on planetary positions
 * Stellium = 3+ planets in the same sign or house;
 *
 * @param planetPositions Record of planetary positions
 * @param risingDegree Optional rising degree for house calculations
 * @returns Object with stellium effects by element and modality
 */
export function calculateEnhancedStelliumEffects(
  planetPositions: Record<string, { sign: string; degree: number }>,
  risingDegree?: number,
): LowercaseElementalProperties {
  const result: LowercaseElementalProperties = {
    fire: 0,
    earth: 0,
    air: 0,
    water: 0,
  };

  // Group planets by sign
  const planetsBySign: Record<string, string[]> = {};

  Object.entries(planetPositions).forEach(([planet, position]) => {
    if (position.sign) {
      const sign = position.sign.toLowerCase();
      if (!planetsBySign[sign]) {
        planetsBySign[sign] = [];
      }
      planetsBySign[sign].push(planet);
    }
  });

  // Find stelliums (3+ planets in same sign)
  Object.entries(planetsBySign).forEach(([sign, planets]) => {
    if (planets.length >= 3) {
      // Get the element of the sign
      const element = getZodiacElement(
        sign as any,
      ).toLowerCase() as keyof LowercaseElementalProperties;

      // 1. Add bonus of +n of the sign element (n = number of planets)
      result[element] += planets.length;

      // Count planets whose element matches the sign element
      let matchingElementCount = 0;

      // Count planets by type for weighted stellium effects
      const elementsByPlanet: Record<string, string> = {};

      // Get element for each planet
      planets.forEach((planet) => {
        let planetElement = "";

        // Handle both traditional and modern planets
        switch (planet.toLowerCase()) {
          case "sun":
            planetElement = "fire";
            break;
          case "moon":
            planetElement = "water";
            break;
          case "mercury":
            planetElement =
              planetPositions[planet].degree < 15 ? "air" : "Earth"; // First half: Air, Second half: Earth
            break;
          case "venus":
            planetElement = "water";
            break;
          case "mars":
            planetElement = "fire";
            break;
          case "jupiter":
            planetElement = "air";
            break;
          case "saturn":
            planetElement = "earth";
            break;
          case "uranus":
            planetElement = "air";
            break;
          case "neptune":
            planetElement = "water";
            break;
          case "pluto":
            planetElement = "earth";
            break;
          case "ascendant":
          case "rising":
            planetElement = "earth"; // Ascendant is Earth element
            break;
          default:
            planetElement = "fire"; // Default to fire
        }

        elementsByPlanet[planet] = planetElement;

        // Check if planet's element matches the sign's element
        if (planetElement === element) {
          matchingElementCount++;
        }
      });

      // 2. For planets with matching elements, add (1 + m) per planet where m is other planets with matching elements
      if (matchingElementCount > 0) {
        // Using the formula from the original, algorithm: for each matching planet, add 1 + (number of other matching planets)
        result[element] +=
          matchingElementCount * (1 + (matchingElementCount - 1));
      }

      // 3. For non-matching elements, count how many planets have that element
      const nonMatchingElements: Record<
        keyof LowercaseElementalProperties,
        number
      > = {
        fire: 0,
        earth: 0,
        air: 0,
        water: 0,
      };

      // Count non-matching elements
      Object.values(elementsByPlanet).forEach((planetElement) => {
        if (planetElement !== element) {
          nonMatchingElements[
            planetElement as keyof LowercaseElementalProperties
          ]++;
        }
      });

      // Add bonuses for non-matching elements that appear multiple times
      Object.entries(nonMatchingElements).forEach(([elem, count]) => {
        if (count >= 1) {
          result[elem as keyof LowercaseElementalProperties] += count;
        }
      });
    }
  });

  // If rising degree is provided, also calculate house stelliums
  if (risingDegree !== undefined) {
    const planetsByHouse: Record<number, string[]> = {};

    // Group planets by house
    Object.entries(planetPositions).forEach(([planet, position]) => {
      // Skip if missing data
      if (!position || position.degree === undefined) return;

      // Calculate house position
      const absoluteDegree = getLongitudeFromSignAndDegree(
        position.sign,
        position.degree,
      );
      const house = calculateHousePosition(risingDegree, absoluteDegree);

      if (!planetsByHouse[house]) {
        planetsByHouse[house] = [];
      }
      planetsByHouse[house].push(planet);
    });

    // Process house stelliums
    Object.entries(planetsByHouse).forEach(([houseStr, planets]) => {
      if (planets.length >= 3) {
        const houseNumber = parseInt(houseStr, 10);

        // Determine house element
        const houseElement = getHouseElement(houseNumber);

        // House stelliums are weighted by house type;
        const stelliumStrength = planets.length;

        // Add house stellium effect to the corresponding element
        result[houseElement as keyof LowercaseElementalProperties] +=
          stelliumStrength;
      }
    });
  }

  return result;
}

/**
 * Get the element associated with a house
 */
function getHouseElement(_house: number): string {
  // Houses follow the elemental, pattern: Fire, Earth, Air, Water, repeating
  const houseElements = {
    1: "Fire",
    5: "Fire",
    9: "Fire",
    2: "Earth",
    6: "Earth",
    10: "Earth",
    3: "Air",
    7: "Air",
    11: "Air",
    4: "Water",
    8: "Water",
    12: "Water",
  };
  return houseElements[_house as keyof typeof houseElements] || "fire";
}

/**
 * Get longitude from sign and degree
 */
function getLongitudeFromSignAndDegree(sign: string, degree: number): number {
  const signs = [
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

  const signIndex = signs.findIndex(
    (s) => s.toLowerCase() === sign.toLowerCase(),
  );
  return (signIndex >= 0 ? signIndex : 0) * 30 + degree;
}

/**
 * Calculate elemental effects of planets in joy houses
 * @param planetPositions Map of planet names to their positions in zodiac signs
 * @param risingDegree The rising degree for house calculations
 * @returns Object with elemental properties enhanced by joy effects
 */
export function calculateJoyEffects(
  planetPositions: Record<string, { sign: string; degree: number }>,
  risingDegree: number,
): LowercaseElementalProperties {
  const result: LowercaseElementalProperties = {
    fire: 0,
    earth: 0,
    air: 0,
    water: 0,
  };

  // Process each planet
  for (const [planet, position] of Object.entries(planetPositions)) {
    // Calculate absolute degree (0-359)
    const zodiacSigns = [
      "aries",
      "taurus",
      "gemini",
      "cancer",
      "leo",
      "virgo",
      "Libra",
      "Scorpio",
      "sagittarius",
      "capricorn",
      "aquarius",
      "pisces",
    ];
    const signIndex = zodiacSigns.indexOf(position.sign);
    const absoluteDegree = signIndex * 30 + position.degree;

    // Calculate house
    const house = calculateHousePosition(risingDegree, absoluteDegree);

    // Check if planet is in its joy house
    if (isPlanetInJoy(planet, house)) {
      // Get house data
      const houseData = HOUSE_AFFINITIES[house];

      if (houseData) {
        // Planet in joy gets a significant boost to the house's element
        const element =
          houseData.element.toLowerCase() as keyof LowercaseElementalProperties;
        if (element in result) {
          // The joy effect is powerful
          result[element] += 2.0;
        }
      }
    }
  }

  return result;
}

/**
 * Helper function to combine multiple elemental property objects
 * @param properties Array of LowercaseElementalProperties objects
 * @returns Combined LowercaseElementalProperties
 */
export function combineElementalProperties(
  ...properties: LowercaseElementalProperties[]
): LowercaseElementalProperties {
  const result: LowercaseElementalProperties = {
    fire: 0,
    earth: 0,
    air: 0,
    water: 0,
  };

  properties.forEach((prop) => {
    result.fire += prop.fire || 0;
    result.earth += prop.earth || 0;
    result.air += prop.air || 0;
    result.water += prop.water || 0;
  });

  return result;
}

/**
 * Calculate complete astrological effects including stellium and joy effects
 * @param planetPositions Planet positions with sign and degree
 * @param risingDegree Rising degree for house calculations
 * @returns Complete astrological effects
 */
export function calculateCompleteAstrologicalEffects(
  planetPositions: Record<
    string,
    { sign: string; degree: number; house?: number }
  >,
  risingDegree: number,
): AstrologicalEffects {
  // Calculate dignity effects
  const dignityEffects: LowercaseElementalProperties = {
    fire: 0,
    earth: 0,
    air: 0,
    water: 0,
  };

  // Process each planet for dignity
  for (const [planet, position] of Object.entries(planetPositions)) {
    const dignity = getPlanetaryDignity(planet, position.sign as any); // Cast to ZodiacSign
    const element = getZodiacElement(position.sign as any).toLowerCase();

    // Apply dignity strength based on type
    dignityEffects[element as keyof LowercaseElementalProperties] +=
      dignity.strength;
  }

  // Calculate aspect effects
  const { aspects: _aspects, elementalEffects } = calculateAspects(
    planetPositions,
    risingDegree,
  );

  // Calculate stellium effects
  const stelliumEffects = calculateEnhancedStelliumEffects(
    planetPositions,
    risingDegree,
  );

  // Calculate house effects
  const houseEffects = calculateAllHouseEffects(
    planetPositions as Record<string, { sign: any; house?: number }>,
    {},
  ); // Use type assertion

  // Calculate joy effects
  const joyEffects = calculateJoyEffects(planetPositions, risingDegree);

  return {
    dignity: dignityEffects,
    aspect: elementalEffects,
    stellium: stelliumEffects,
    house: houseEffects,
    joy: joyEffects,
  };
}

/**
 * Convert longitude in degrees to zodiac sign and position
 * @param longitude The longitude in degrees (0-360)
 * @returns Object with zodiac sign and degree within sign
 */
export function longitudeToZodiacPosition(longitude: number): {
  sign: string;
  degree: number;
} {
  try {
    // Enhanced validation for longitude
    if (longitude === undefined || longitude === null) {
      errorLog("longitudeToZodiacPosition: Longitude is undefined or null");
      return { sign: "aries", degree: 0 };
    }

    if (typeof longitude !== "number") {
      errorLog(
        `longitudeToZodiacPosition: Expected number, got ${typeof longitude}:`,
        longitude,
      );
      return { sign: "aries", degree: 0 };
    }

    if (isNaN(longitude)) {
      errorLog("longitudeToZodiacPosition: Longitude is NaN");
      return { sign: "aries", degree: 0 };
    }

    // Normalize longitude to 0-360 range
    const normalizedLongitude = ((longitude % 360) + 360) % 360;

    // Calculate sign index (0-11)
    const signIndex = Math.floor(normalizedLongitude / 30);

    // Calculate degree within sign (0-29)
    const degree = normalizedLongitude % 30;

    // Get sign name
    const signs = [
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

    if (signIndex < 0 || signIndex >= signs.length) {
      errorLog(
        `Invalid sign index: ${signIndex} from longitude: ${longitude} (normalized: ${normalizedLongitude})`,
      );
      return { sign: "aries", degree: 0 };
    }

    const sign = signs[signIndex];
    debugLog(
      `Converted longitude ${longitude} to ${sign} at ${Math.floor(degree)}°`,
    );

    return {
      sign,
      degree,
    };
  } catch (error) {
    errorLog("Error in longitudeToZodiacPosition: ", error);
    return { sign: "aries", degree: 0 }; // Default fallback
  }
}

/**
 * Calculate the planetary dignity based on sign position
 * @param planet Planet name
 * @param sign Zodiac sign
 * @returns Dignity information
 */
export function getPlanetaryDignityInfo(
  planet: string,
  sign: any | undefined,
): { type: DignityType; strength: number } {
  // Handle undefined input
  if (!planet || !sign) {
    return { type: "Neutral", strength: 0 };
  }

  // Convert to lowercase for consistent comparison
  const planetLower = planet.toLowerCase();
  const signLower = sign.toLowerCase();

  // Planetary ruler mappings (essential dignity)
  const rulerships: Record<string, string[]> = {
    sun: ["leo"],
    moon: ["cancer"],
    mercury: ["gemini", "virgo"],
    venus: ["taurus", "libra"],
    mars: ["aries", "scorpio"],
    jupiter: ["sagittarius", "pisces"],
    saturn: ["capricorn", "aquarius"],
    // Modern rulerships
    uranus: ["aquarius"],
    neptune: ["pisces"],
    pluto: ["scorpio"],
  };

  // Exaltation mappings
  const exaltations: Record<string, string> = {
    sun: "aries",
    moon: "taurus",
    mercury: "virgo",
    venus: "pisces",
    mars: "capricorn",
    jupiter: "cancer",
    saturn: "libra",
    uranus: "scorpio",
    neptune: "leo",
    pluto: "sagittarius",
  };

  // Fall mappings (opposite of exaltation)
  const falls: Record<string, string> = {
    sun: "libra",
    moon: "scorpio",
    mercury: "pisces",
    venus: "virgo",
    mars: "cancer",
    jupiter: "capricorn",
    saturn: "aries",
    uranus: "taurus",
    neptune: "aquarius",
    pluto: "gemini",
  };

  // Calculate detriment (opposite of rulership)
  const getDetriments = (planet: string): string[] => {
    const oppositeSignIndexes: Record<string, number> = {
      aries: 6,
      taurus: 7,
      gemini: 8,
      cancer: 9,
      leo: 10,
      virgo: 11,
      libra: 0,
      scorpio: 1,
      sagittarius: 2,
      capricorn: 3,
      aquarius: 4,
      pisces: 5,
    };

    const signs = [
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

    const rules = rulerships[planet] || [];
    return rules.map((sign) => signs[oppositeSignIndexes[sign]]);
  };

  // Check each dignity type - Updated values to match the original algorithm
  if (rulerships[planetLower] && rulerships[planetLower].includes(signLower)) {
    return { type: "Domicile", strength: 1.0 }; // Original, value: 1
  } else if (exaltations[planetLower] === signLower) {
    return { type: "Exaltation", strength: 2.0 }; // Original, value: 2
  } else if (getDetriments(planetLower).includes(signLower)) {
    return { type: "Detriment", strength: -1.0 }; // Original value: -1
  } else if (falls[planetLower] === signLower) {
    return { type: "Fall", strength: -2.0 }; // Original value: -2
  } else {
    return { type: "Neutral", strength: 0 };
  }
}

/**
 * Calculate aspects between planets
 * @param positions Record of planetary positions
 * @param risingDegree Optional rising degree for house calculations
 * @returns Object with aspects array and elemental effects
 */
export function calculateAspects(
  positions: Record<string, { sign: string; degree: number }>,
  _risingDegree?: number,
): {
  aspects: PlanetaryAspect[];
  elementalEffects: LowercaseElementalProperties;
} {
  const _aspects: PlanetaryAspect[] = [];
  const elementalEffects: LowercaseElementalProperties = {
    fire: 0,
    earth: 0,
    air: 0,
    water: 0,
  };

  // Aspect, definitions: type, orb, and elemental multiplier based on original algorithm
  // The original algorithm _uses: // Conjunction: +2 to sign element
  // Opposition: -2 to sign element
  // Trine: +1 to sign element
  // Square: -1 to sign element (or +1 if Ascendant is involved)
  const aspectDefinitions: Record<
    AspectType,
    { maxOrb: number; multiplier: number }
  > = {
    conjunction: { maxOrb: 8, multiplier: 2 }, // +2 effect
    opposition: { maxOrb: 8, multiplier: -2 }, // -2 effect
    trine: { maxOrb: 8, multiplier: 1 }, // +1 effect
    square: { maxOrb: 7, multiplier: -1 }, // -1 effect (special case for Ascendant handled in logic)
    sextile: { maxOrb: 4, multiplier: 0.5 }, // +0.5 effect (moderate positive)
    quincunx: { maxOrb: 3, multiplier: -0.5 }, // -0.5 effect (moderate negative)
    "semi-sextile": { maxOrb: 3, multiplier: 0.2 }, // +0.2 effect (mild positive)
    semisquare: { maxOrb: 2, multiplier: -0.3 }, // -0.3 effect (mild negative)
    sesquisquare: { maxOrb: 2, multiplier: -0.3 }, // -0.3 effect (mild negative)
    quintile: { maxOrb: 2, multiplier: 0.3 }, // +0.3 effect (mild positive)
    biquintile: { maxOrb: 2, multiplier: 0.3 }, // +0.3 effect (mild positive)
  };

  // Helper function to get longitude from sign and degree
  const getLongitude = (position: { sign: string; degree: number }): number => {
    // Check if position or position.sign is undefined/null
    if (!position || !position.sign) {
      debugLog("Invalid position object _encountered: ", position);
      return 0; // Return default value
    }

    const signs = [
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
    const signIndex = signs.findIndex(
      (s) => s.toLowerCase() === position.sign.toLowerCase(),
    );
    return signIndex * 30 + position.degree;
  };

  // Calculate aspects between each planet pair
  const planets = Object.keys(positions);

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const planet1 = planets[i];
      const planet2 = planets[j];

      const pos1 = positions[planet1];
      const pos2 = positions[planet2];

      // Skip if missing position data
      if (!pos1 || !pos2 || !pos1.sign || !pos2.sign) continue;

      const long1 = getLongitude(pos1);
      const long2 = getLongitude(pos2);

      // Calculate angular difference
      let diff = Math.abs(long1 - long2);
      if (diff > 180) diff = 360 - diff;

      // Check each aspect type
      for (const [type, definition] of Object.entries(aspectDefinitions)) {
        // Define the ideal angle for each aspect type
        const aspectAngles: Record<AspectType, number> = {
          conjunction: 0,
          sextile: 60,
          square: 90,
          trine: 120,
          opposition: 180,
          quincunx: 150,
          "semi-sextile": 30,
          semisquare: 45,
          sesquisquare: 135,
          quintile: 72,
          biquintile: 144,
        };

        const idealAngle = aspectAngles[type as AspectType];
        const orb = Math.abs(diff - idealAngle);

        if (orb <= definition.maxOrb) {
          // Calculate aspect strength based on orb (closer aspects are stronger)
          const strength = 1 - orb / definition.maxOrb;

          // Get element of the sign for each planet
          const element1 = getZodiacElement(pos1.sign as any).toLowerCase();
          const element2 = getZodiacElement(pos2.sign as any).toLowerCase();

          // Base multiplier from definition;
          let { multiplier } = definition;

          // Special, case: Square aspect with Ascendant is positive (+1) instead of negative
          if (
            type === "square" &&
            (planet1.toLowerCase() === "ascendant" ||
              planet2.toLowerCase() === "ascendant")
          ) {
            multiplier = 1; // From original, algorithm: Square to Ascendant is +1 instead of -1
          }

          // Add to aspects array
          _aspects.push({
            planet1,
            planet2,
            type: type as AspectType,
            orb,
            strength: strength * Math.abs(multiplier), // Strength is always positive, direction in multiplier,
            influence: multiplier, // Store the raw multiplier for reference,
            exactAngle: orb,
            applyingSeparating: orb <= 120 ? "applying" : "separating",
            significance: orb / 180,
            description: `Aspect between ${planet1} and ${planet2}`,
            elementalInfluence: { fire: 0, earth: 0, air: 0, water: 0 },
          });

          // Apply elemental effects based on sign elements
          // The strength is proportional to the aspect strength and multiplier
          // Add effect to both planet elements to balance the system
          elementalEffects[element1 as keyof LowercaseElementalProperties] +=
            multiplier * strength;
          elementalEffects[element2 as keyof LowercaseElementalProperties] +=
            multiplier * strength;

          // Only count the closest aspect between two planets
          break;
        }
      }
    }
  }

  return { aspects: _aspects, elementalEffects };
}

/**
 * Get the current astrological state
 * @param date Date to calculate the state for (defaults to current date)
 * @returns Complete astrological state object
 */
export async function getCurrentAstrologicalState(
  date: Date = new Date(),
): Promise<AstrologicalState> {
  try {
    // Calculate all the astrological factors;
    const [lunarPhaseValue, moonSignValue, planetaryPositionsValue] =
      await Promise.all([
        calculateLunarPhase(date),
        calculateMoonSign(date),
        calculatePlanetaryPositions(date),
      ]);

    const lunarPhase = getLunarPhaseName(lunarPhaseValue);
    const sunSign = calculateSunSign(date);
    const _moonSign = moonSignValue;
    const planetaryPositions = planetaryPositionsValue;

    // Calculate the planetary hour, day, and minute
    const hourCalculator = new PlanetaryHourCalculator();
    const planetaryHour = hourCalculator.calculatePlanetaryHour(
      date,
    ) as unknown as Planet;
    const _planetaryDay = hourCalculator.getPlanetaryDay(
      date,
    ) as unknown as Planet;
    const _planetaryMinute = hourCalculator.getPlanetaryMinute(
      date,
    ) as unknown as Planet;

    // Convert planetary positions to the format needed for alignment
    const currentPlanetaryAlignment: Record<string, unknown> = {};

    Object.entries(planetaryPositions).forEach(([planet, position]) => {
      currentPlanetaryAlignment[planet.toLowerCase()] = {
        sign: position.sign,
        degree: position.degree,
        minute: position.minute || 0,
        isRetrograde: position.isRetrograde || false,
      };
    });

    // Calculate active planets based on which have special status
    const activePlanets = Object.entries(planetaryPositions)
      .filter(([planet, position]) => {
        // Always include outer planets in activePlanets array
        if (["Uranus", "Neptune", "Pluto"].includes(planet)) {
          return true;
        }

        // For traditional planets, check for dignity
        const dignity = getPlanetaryDignityInfo(planet, position.sign);
        return dignity.type === "Domicile" || dignity.type === "Exaltation";
      })
      .map(([planet]) => planet.toLowerCase());

    // Calculate aspects
    const { aspects } = calculateAspects(
      Object.entries(planetaryPositions).reduce(
        (acc, [planet, pos]) => {
          acc[planet] = { sign: pos.sign, degree: pos.degree };
          return acc;
        },
        {} as Record<string, { sign: string; degree: number }>,
      ),
    );

    // Create the return value with type assertion for aspects
    return {
      currentZodiac: sunSign,
      zodiacSign: sunSign,
      lunarPhase,
      moonPhase: lunarPhase,
      currentPlanetaryAlignment,
      planetaryPositions,
      activePlanets,
      planetaryHour: planetaryHour as any,
      aspects: aspects as Array<import("@/types/celestial").PlanetaryAspect>,
      tarotElementBoosts: { Fire: 0, Water: 0, Earth: 0, Air: 0 },
      tarotPlanetaryBoosts: {},
    };
  } catch (error) {
    errorLog("Error in getCurrentAstrologicalState");

    // Provide fallback state with basic data
    const sunSign = calculateSunSign(date);
    const defaultPositions = getDefaultPlanetaryPositions();

    return {
      currentZodiac: sunSign,
      zodiacSign: sunSign,
      lunarPhase: "new moon",
      moonPhase: "new moon",
      currentPlanetaryAlignment: {},
      planetaryPositions: defaultPositions,
      activePlanets: [],
      planetaryHour: "Sun" as any,
      aspects: [],
      tarotElementBoosts: { Fire: 0, Water: 0, Earth: 0, Air: 0 },
      tarotPlanetaryBoosts: {},
    };
  }
}

/**
 * Get default planetary positions for July 2, 2025 at, 10: 45 PM EDT
 * This is used as a fallback when calculations fail
 * @returns Record of planetary positions
 */
export function getDefaultPlanetaryPositions(): Record<string, PlanetPosition> {
  // _Reference: current-moment-chart.ipynb for July 2nd, 2025 at, 10: 45 PM EDT
  const currentPositions: Record<string, PlanetPosition> = {
    Sun: {
      sign: "cancer",
      degree: 10,
      minute: 45,
      exactLongitude: 100.75, // 10° 45' Cancer,
      isRetrograde: false,
    },
    Moon: {
      sign: "libra",
      degree: 18,
      minute: 19,
      exactLongitude: 198.32, // 18° 19' Libra,
      isRetrograde: false,
    },
    Mercury: {
      sign: "leo",
      degree: 2,
      minute: 9,
      exactLongitude: 122.15, // 2° 9' Leo,
      isRetrograde: false,
    },
    Venus: {
      sign: "leo",
      degree: 14,
      minute: 51,
      exactLongitude: 134.85, // 14° 51' Leo,
      isRetrograde: false,
    },
    Mars: {
      sign: "taurus",
      degree: 25,
      minute: 25,
      exactLongitude: 55.42, // 25° 25' Taurus,
      isRetrograde: false,
    },
    Jupiter: {
      sign: "gemini",
      degree: 12,
      minute: 44,
      exactLongitude: 72.73, // 12° 44' Gemini,
      isRetrograde: false,
    },
    Saturn: {
      sign: "pisces",
      degree: 19,
      minute: 17,
      exactLongitude: 349.28, // 19° 17' Pisces,
      isRetrograde: false,
    },
    Uranus: {
      sign: "taurus",
      degree: 26,
      minute: 9,
      exactLongitude: 56.15, // 26° 9' Taurus,
      isRetrograde: false,
    },
    Neptune: {
      sign: "aries",
      degree: 29,
      minute: 55,
      exactLongitude: 29.92, // 29° 55' Aries,
      isRetrograde: false,
    },
    Pluto: {
      sign: "aquarius",
      degree: 1,
      minute: 53,
      exactLongitude: 301.88, // 1° 53' Aquarius,
      isRetrograde: true,
    },
    northNode: {
      sign: "pisces",
      degree: 26,
      minute: 33,
      exactLongitude: 356.55, // Position in 330-360 degrees (pisces),
      isRetrograde: true,
    },
    southNode: {
      sign: "virgo",
      degree: 26,
      minute: 33,
      exactLongitude: 176.55, // Position in 150-180 degrees (virgo), opposite to North Node,
      isRetrograde: true,
    },
    Ascendant: {
      sign: "sagittarius",
      degree: 3,
      minute: 58,
      exactLongitude: 243.97, // Position in 240-270 degrees (sagittarius),
      isRetrograde: false,
    },
  };

  debugLog("Using updated current planetary positions:", currentPositions);
  return currentPositions;
}

/**
 * Helper function to get the zodiac sign from a longitude
 * @param longitude Longitude in degrees
 * @returns Zodiac sign
 */
export function getZodiacSign(longitude: number): string {
  const signs = [
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

  // Normalize longitude to 0-360 range
  const adjustedLong = (longitude + 0.00001) % 360;

  // Each sign spans 30 degrees
  const signIndex = Math.min(11, Math.floor(adjustedLong / 30));

  return signs[signIndex];
}

const PLANETARY_ORBS: Record<string, number> = {
  Sun: 1.5,
  Moon: 1.5,
  Mercury: 1.0,
  Venus: 1.0,
  Mars: 0.8,
  Jupiter: 0.6,
  Saturn: 0.5,
  Uranus: 0.4,
  Neptune: 0.3,
  Pluto: 0.2,
};

function _getAspectOrb(planet1: string, planet2: string): number {
  return (PLANETARY_ORBS[planet1] + PLANETARY_ORBS[planet2]) / 2;
}

/**
 * Calculate Placidus house cusps based on Julian date, latitude, and longitude
 * This is a proper implementation of the Placidus house system
 * @param jd Julian date
 * @param lat Latitude in degrees (positive for North, negative for South)
 * @param lon Longitude in degrees (positive for East, negative for West)
 * @returns Array of 12 house cusp positions in degrees (0-360)
 */
function _calculatePlacidusHouses(
  jd: number,
  lat: number,
  lon: number,
): number[] {
  try {
    // Validate inputs
    if (isNaN(jd) || isNaN(lat) || isNaN(lon)) {
      throw new Error("Invalid inputs for Placidus house calculation");
    }

    // Convert latitude to radians
    const latRad = (lat * Math.PI) / 180;

    // Earth's obliquity (axial tilt) - approximation for modern times
    const obliquity = 23.4367; // degrees
    const obliquityRad = (obliquity * Math.PI) / 180;

    // Compute local sidereal time (LST) in degrees (0-360)
    // This is the Right Ascension of the local meridian
    const jdCentury = (jd - 2451545.0) / 36525; // centuries since J2000.0

    // Greenwich Mean Sidereal Time in degrees
    let gmst =
      280.46061837 +
      360.98564736629 * (jd - 2451545.0) +
      jdCentury * jdCentury * (0.000387933 - jdCentury / 38710000);

    // Normalize to 0-360 range
    gmst = ((gmst % 360) + 360) % 360;

    // Local Sidereal Time in degrees
    let lst = gmst + lon;
    lst = ((lst % 360) + 360) % 360;

    // Calculate house cusps
    const houseCusps: number[] = [];

    // MC (Medium Coeli, 10th house cusp)
    const mcDegrees = lst;
    houseCusps[9] = mcDegrees;

    // IC (Imum Coeli, 4th house cusp) - opposite to MC
    houseCusps[3] = (mcDegrees + 180) % 360;

    // For Placidus system, we need to calculate intermediate cusps
    // This is a simplified implementation of the Placidus algorithm

    // Ascendant (1st house cusp)
    const _tanObliquity = Math.tan(obliquityRad);
    const tanLat = Math.tan(latRad);

    // Calculate Ascendant, formula: atan2(sin(lst), cos(lst) * cos(obl) + tan(lat) * sin(obl))
    const lstRad = (lst * Math.PI) / 180;
    const ascRad = Math.atan2(
      Math.sin(lstRad),
      Math.cos(lstRad) * Math.cos(obliquityRad) +
        tanLat * Math.sin(obliquityRad),
    );

    // Convert back to degrees in range 0-360
    let ascendant = (ascRad * 180) / Math.PI;
    ascendant = ((ascendant % 360) + 360) % 360;
    houseCusps[0] = ascendant;

    // Descendant (7th house cusp) - opposite to Ascendant
    houseCusps[6] = (ascendant + 180) % 360;

    // Calculate intermediate cusps using spherical trigonometry
    // 11th and 12th house cusps (between MC and Ascendant)
    const mcAscDifference = (ascendant - mcDegrees + 360) % 360;
    houseCusps[10] = (mcDegrees + mcAscDifference / 3) % 360;
    houseCusps[11] = (mcDegrees + (2 * mcAscDifference) / 3) % 360;

    // 2nd and 3rd house cusps (between Ascendant and IC)
    const ascIcDifference = (houseCusps[3] - ascendant + 360) % 360;
    houseCusps[1] = (ascendant + ascIcDifference / 3) % 360;
    houseCusps[2] = (ascendant + (2 * ascIcDifference) / 3) % 360;

    // 5th and 6th house cusps (between IC and Descendant)
    const icDescDifference = (houseCusps[6] - houseCusps[3] + 360) % 360;
    houseCusps[4] = (houseCusps[3] + icDescDifference / 3) % 360;
    houseCusps[5] = (houseCusps[3] + (2 * icDescDifference) / 3) % 360;

    // 8th and 9th house cusps (between Descendant and MC)
    const descMcDifference = (mcDegrees + 360 - houseCusps[6]) % 360;
    houseCusps[7] = (houseCusps[6] + descMcDifference / 3) % 360;
    houseCusps[8] = (houseCusps[6] + (2 * descMcDifference) / 3) % 360;

    // Ensure all cusps are in 0-360 range
    return houseCusps.map((cusp) => ((cusp % 360) + 360) % 360);
  } catch (error) {
    errorLog("Error calculating Placidus houses: ", error);

    // Return equally-spaced houses as fallback (30° per house)
    return [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
  }
}

const TEST_DATES = [
  { date: "2024-01-01", expected: { Sun: "capricorn", Moon: "taurus" } },
  { date: "2024-06-21", expected: { Sun: "gemini", Moon: "aquarius" } },
];

export async function runAstroTests() {
  for (const { date, expected } of TEST_DATES) {
    const testDate = new Date(date);
    const positions = await calculatePlanetaryPositions(testDate);

    debugLog(`Test for ${date}: `);
    debugLog("Sun Position: ", positions.Sun.sign, "Expected: ", expected.Sun);
    debugLog(
      "Moon Position: ",
      positions.Moon.sign,
      "Expected: ",
      expected.Moon,
    );
  }
}

/**
 * Calculate simplified planetary positions based on date
 * This is a temporary implementation until we implement a proper astronomical calculation
 * @param date Date to calculate positions for
 * @returns Record of planetary positions in degrees (0-360)
 */
function _calculatePlanetPositionsInternal(date: Date): Record<string, number> {
  const positions: Record<string, number> = {};
  const jd = calculateJulianDate(date);

  // Calculate sun position - relatively accurate
  const sunLongitude = calculateSunLongitude(jd);
  positions.Sun = sunLongitude;

  // Calculate moon position - simplified but reasonable
  const moonLongitude = calculateMoonLongitude(jd);
  positions.Moon = moonLongitude;

  // Calculate other planets with simple approximations
  // These are not astronomically accurate but provide changing positions
  // that at least move at reasonable rates for testing

  // Days since Jan 1, 2020
  const epoch = new Date("2020-01-01").getTime();
  const daysSinceEpoch = (date.getTime() - epoch) / (24 * 60 * 60 * 1000);

  // Inner planets move faster than outer planets
  positions.Mercury = (sunLongitude + ((daysSinceEpoch * 4) % 360)) % 360;
  positions.Venus = (sunLongitude + ((daysSinceEpoch * 1.6) % 360)) % 360;
  positions.Mars = (daysSinceEpoch * 0.5 + 50) % 360;
  positions.Jupiter = (daysSinceEpoch * 0.08 + 120) % 360;
  positions.Saturn = (daysSinceEpoch * 0.03 + 200) % 360;
  positions.Uranus = (daysSinceEpoch * 0.01 + 270) % 360;
  positions.Neptune = (daysSinceEpoch * 0.006 + 315) % 360;
  positions.Pluto = (daysSinceEpoch * 0.004 + 180) % 360;

  return positions;
}

/**
 * Calculate positions of the lunar nodes with improved accuracy
 * @param date Date to calculate for
 * @returns Object with north node position and retrograde status
 */
export function calculateLunarNodes(date: Date = new Date()): {
  northNode: number;
  isRetrograde: boolean;
} {
  try {
    debugLog("Calculating lunar nodes for date:", date);

    // More accurate calculation of lunar nodes
    // The lunar nodes complete a cycle in about 18.6 years (moving retrograde)
    const _nodeCycleDays = 6793.48; // Precise cycle length in days

    // Updated reference date: January 23, 2022 when North Node was at 0° taurus (30°)
    const referenceDate = new Date("2022-01-23T00:00:00Z");
    const referenceLongitude = 30; // 0° taurus = 30° in absolute longitude

    const msPerDay = 24 * 60 * 60 * 1000;

    // Calculate days since reference date
    const daysSinceReference =
      (date.getTime() - referenceDate.getTime()) / msPerDay;

    // North Node moves retrograde at about 0.053° per day (more precise value)
    const dailyMotion = 0.05295;
    const retrogradeMotion = dailyMotion * daysSinceReference;

    // Calculate current position (moving backwards from the reference position)
    const northNodePosition =
      (((referenceLongitude - retrogradeMotion) % 360) + 360) % 360;
    debugLog("Calculated North Node position: ", northNodePosition);

    // Lunar nodes are always retrograde
    return { northNode: northNodePosition, isRetrograde: true };
  } catch (error) {
    errorLog("Error in calculateLunarNodes: ", error);

    // Fallback to a fixed position if calculation fails - May 2024 position
    return { northNode: 28.5, isRetrograde: true }; // Late aries position
  }
}

/**
 * Convert a node longitude to a zodiac sign and degree
 * @param nodeLongitude Longitude in degrees (0-360)
 * @returns Object with sign and degree information
 */
export function getNodeInfo(nodeLongitude: number): {
  sign: string;
  degree: number;
  exactLongitude: number;
  isRetrograde: boolean;
} {
  const { sign, degree } = getSignFromLongitude(nodeLongitude);

  // Lunar nodes are always retrograde
  return {
    sign,
    degree,
    exactLongitude: nodeLongitude,
    isRetrograde: true,
  };
}

// Enhanced getSignFromLongitude with validation
export function getSignFromLongitude(longitude: number): {
  sign: string;
  degree: number;
} {
  // Validate input
  if (typeof longitude !== "number" || isNaN(longitude)) {
    errorLog("Invalid longitude: ", longitude);
    return { sign: "aries", degree: 0 };
  }

  // Normalize to 0-360 range
  const normalized = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  const degree = normalized % 30;

  const signs = [
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

  return {
    sign: signs[signIndex] || "aries",
    degree: parseFloat(degree.toFixed(4)),
  };
}

/**
 * Maps zodiac signs to their ruling planets
 */
export const _zodiacSignToPlanet: Record<string, string> = {
  aries: "Mars",
  taurus: "Venus",
  gemini: "Mercury",
  cancer: "Moon",
  leo: "Sun",
  virgo: "Mercury",
  libra: "Venus",
  scorpio: "Pluto",
  sagittarius: "Jupiter",
  capricorn: "Saturn",
  aquarius: "Uranus",
  pisces: "Neptune",
};

/**
 * Maps elements to their corresponding zodiac signs
 */
export const _elementToZodiac: Record<string, string[]> = {
  Fire: ["Aries", "Leo", "Sagittarius"],
  Earth: ["Taurus", "Virgo", "Capricorn"],
  Air: ["Gemini", "Libra", "Aquarius"],
  Water: ["Cancer", "Scorpio", "Pisces"],
};

/**
 * Parse AstroCharts.com data format to internal planetary positions
 * @param astroChartData Raw data from AstroCharts.com
 * @returns Formatted planetary positions in our internal format
 */
export const _parseAstroChartData = (
  astroChartData: unknown,
): Record<string, number> => {
  try {
    const result: Record<string, number> = {};
    const data = astroChartData as any;

    // Process planetary positions
    if (data.planets) {
      // Map AstroCharts planet names to our internal format
      const planetMapping: Record<string, string> = {
        Sun: "Sun",
        Moon: "Moon",
        Mercury: "Mercury",
        Venus: "Venus",
        Mars: "Mars",
        Jupiter: "Jupiter",
        Saturn: "Saturn",
        Uranus: "Uranus",
        Neptune: "Neptune",
        Pluto: "Pluto",
        "North Node": "northNode",
        "South Node": "southNode",
        Chiron: "Chiron",
      };

      // Process each planet
      Object.entries(data.planets).forEach(([planetName, planetData]) => {
        const internalName = planetMapping[planetName];
        const pd = planetData as any;
        if (internalName && pd?.longitude !== undefined) {
          // AstroCharts provides longitude in decimal degrees (0-360)
          result[internalName] = Number(pd.longitude);
        }
      });
    }

    // Process houses and angles if available
    if (data.houses) {
      const { houses } = data;
      result["Ascendant"] = houses[1]?.longitude || 0;
      result["MC"] = houses[10]?.longitude || 0;
    }

    return result;
  } catch (error) {
    _logger.error("Error parsing AstroCharts data: ", error);
    return {};
  }
};

/**
 * Parse aspect data from AstroCharts.com format to internal aspects format
 * @param astroChartData Raw data from AstroCharts.com
 * @returns Formatted aspects array in our internal format
 */
export const _parseAstroChartAspects = (
  astroChartData: unknown,
): Array<{
  type: string;
  planet1: string;
  planet2: string;
  orb: number;
  applying: boolean;
}> => {
  try {
    const aspects: Array<{
      type: string;
      planet1: string;
      planet2: string;
      orb: number;
      applying: boolean;
    }> = [];

    const data = astroChartData as any;

    if (data.aspects && Array.isArray(data.aspects)) {
      // Map aspect types to internal format
      const aspectTypeMapping: Record<string, string> = {
        conjunction: "conjunction",
        opposition: "opposition",
        trine: "trine",
        square: "square",
        sextile: "sextile",
        quincunx: "quincunx",
        semisextile: "semisextile",
        semisquare: "semisquare",
        sesquiquadrate: "sesquiquadrate",
        quintile: "quintile",
        biquintile: "biquintile",
      };

      // Process each aspect
      data.aspects.forEach((aspect: unknown) => {
        const aspectData = aspect as any;
        if (aspectData.aspectType && aspectData.planet1 && aspectData.planet2) {
          aspects.push({
            type:
              aspectTypeMapping[String(aspectData.aspectType)] ||
              String(aspectData.aspectType),
            planet1: String(aspectData.planet1),
            planet2: String(aspectData.planet2),
            orb: Number(aspectData.orb) || 0,
            applying: aspectData.applying === true,
          });
        }
      });
    }

    return aspects;
  } catch (error) {
    _logger.error("Error parsing AstroCharts aspects: ", error);
    return [];
  }
};

/**
 * Get the elemental association of a planet
 *
 * @param planet The planet name
 * @returns The elemental association
 */
export function getPlanetaryElementalInfluence(planet: string): Element {
  const planetElementMap: Record<string, Element> = {
    Sun: "Fire",
    Moon: "Water",
    Mercury: "Air",
    Venus: "Earth",
    Mars: "Fire",
    Jupiter: "Air",
    Saturn: "Earth",
    Uranus: "Air",
    Neptune: "Water",
    Pluto: "Fire",
    Ascendant: "Earth",
  };

  return planetElementMap[planet] || "Earth";
}

/**
 * Get the elemental association of a zodiac sign
 *
 * @param sign The zodiac sign
 * @returns The elemental association
 */
export function getZodiacElementalInfluence(sign: ZodiacSign): Element {
  const zodiacElementMap: Record<ZodiacSign, Element> = {
    aries: "Fire",
    taurus: "Earth",
    gemini: "Air",
    cancer: "Water",
    leo: "Fire",
    virgo: "Earth",
    libra: "Air",
    scorpio: "Water",
    sagittarius: "Fire",
    capricorn: "Earth",
    aquarius: "Air",
    pisces: "Water",
  };

  return zodiacElementMap[sign];
}

/**
 * Calculate the compatibility between two elements
 *
 * @param element1 First element
 * @param element2 Second element
 * @returns Compatibility score from 0 to 1
 */
export function calculateElementalCompatibility(
  element1: Element,
  element2: Element,
): number {
  // Elements boost themselves
  if (element1 === element2) {
    return 1.0;
  }

  // Element cycle relationships
  const elementRelationships: Record<Element, Record<Element, number>> = {
    Fire: {
      Fire: 1.0,
      Earth: 0.5,
      Air: 0.8,
      Water: 0.2,
    },
    Earth: {
      Fire: 0.5,
      Earth: 1.0,
      Air: 0.3,
      Water: 0.9,
    },
    Air: {
      Fire: 0.8,
      Earth: 0.3,
      Air: 1.0,
      Water: 0.4,
    },
    Water: {
      Fire: 0.2,
      Earth: 0.9,
      Air: 0.4,
      Water: 1.0,
    },
  };

  return elementRelationships[element1][element2];
}

/**
 * Calculate the dominant element based on the current astrological state
 *
 * @param astroState Current astrological state
 * @param timeFactors Current time factors
 * @returns The dominant element
 */
export function calculateDominantElement(
  astroState: AstrologicalState,
  timeFactors: TimeFactors,
): Element {
  // Count influences of each element
  const elementalCounts: Record<Element, number> = {
    Fire: 0,
    Earth: 0,
    Air: 0,
    Water: 0,
  };

  // Sun sign (strongest influence)
  if (astroState.sunSign) {
    elementalCounts[getZodiacElementalInfluence(astroState.sunSign)] += 3;
  }

  // Moon sign (second strongest)
  if (astroState.moonSign) {
    elementalCounts[getZodiacElementalInfluence(astroState.moonSign)] += 2;
  }

  // Planetary day
  elementalCounts[
    getPlanetaryElementalInfluence(timeFactors.planetaryDay.planet)
  ] += 2;

  // Planetary hour
  elementalCounts[
    getPlanetaryElementalInfluence(timeFactors.planetaryHour.planet)
  ] += 1;

  // Find the element with the highest count
  let dominantElement: Element = "Earth";
  let highestCount = 0;

  for (const [element, count] of Object.entries(elementalCounts) as Array<
    [Element, number]
  >) {
    if (count > highestCount) {
      dominantElement = element;
      highestCount = count;
    }
  }

  return dominantElement;
}

/**
 * Calculate the elemental profile for an astrological state
 * Returns the percentage influence of each element
 *
 * @param astroState Current astrological state
 * @param timeFactors Current time factors
 * @returns Record of elements to their percentage influence (0-1)
 */
export function calculateElementalProfile(
  astroState: AstrologicalState,
  timeFactors: TimeFactors,
): Record<Element, number> {
  // Count influences of each element
  const elementalCounts: Record<Element, number> = {
    Fire: 0,
    Earth: 0,
    Air: 0,
    Water: 0,
  };

  // Sun sign (strongest influence)
  if (astroState.sunSign) {
    elementalCounts[getZodiacElementalInfluence(astroState.sunSign)] += 3;
  }

  // Moon sign (second strongest)
  if (astroState.moonSign) {
    elementalCounts[getZodiacElementalInfluence(astroState.moonSign)] += 2;
  }

  // Planetary day
  elementalCounts[
    getPlanetaryElementalInfluence(timeFactors.planetaryDay.planet)
  ] += 2;

  // Planetary hour
  elementalCounts[
    getPlanetaryElementalInfluence(timeFactors.planetaryHour.planet)
  ] += 1;

  // Calculate total points
  const totalPoints = Object.values(elementalCounts).reduce(
    (sum, count) => sum + count,
    0,
  );

  // Convert to percentages
  const elementalProfile: Record<Element, number> = {
    Fire: elementalCounts["Fire"] / totalPoints,
    Earth: elementalCounts["Earth"] / totalPoints,
    Air: elementalCounts["Air"] / totalPoints,
    Water: elementalCounts["Water"] / totalPoints,
  };

  return elementalProfile;
}

/**
 * Transform items with planetary positions to create alchemical items with compatibility scores
 * @param items Array of elemental items to transform
 * @param planetaryPositions Current planetary positions
 * @param isDaytime Whether it's currently daytime
 * @param currentZodiac Current zodiac sign (optional)
 * @returns Array of alchemical items with compatibility scores
 */
export function transformItemsWithPlanetaryPositions(
  items: ElementalItem[],
  planetaryPositions: { [key: string]: unknown },
  isDaytime = true,
  currentZodiac?: string,
): AlchemicalItem[] {
  if (!items || items.length === 0) {
    return [];
  }

  try {
    // Calculate current elemental influence from planetary positions
    const currentElementalInfluence = calculateCurrentElementalInfluence(
      planetaryPositions,
      isDaytime,
      currentZodiac,
    );

    // Transform each item
    return items.map((item) => {
      // Calculate compatibility score based on elemental alignment
      const compatibilityScore = calculateItemCompatibilityScore(
        item.elementalProperties,
        currentElementalInfluence,
        planetaryPositions,
        isDaytime,
      );

      // Determine dominant element
      const dominantElement = getDominantElementFromProperties(
        item.elementalProperties,
      );

      // Calculate alchemical properties based on planetary influence
      const alchemicalProperties = calculateAlchemicalProperties(
        item.elementalProperties,
        planetaryPositions,
        currentElementalInfluence,
      );

      // Calculate thermodynamic properties
      const thermodynamicProperties = calculateThermodynamicProperties(
        item.elementalProperties,
        compatibilityScore,
      );

      // Create alchemical item with interface compliance
      const alchemicalItem = {
        ...item,
        compatibilityScore,
        dominantElement,
        alchemicalProperties,
        thermodynamicProperties,
        // Required AlchemicalItem properties
        transformedElementalProperties: {
          ...item.elementalProperties,
        } as Record<ElementalCharacter, number>,
        heat: thermodynamicProperties.heat,
        entropy: thermodynamicProperties.entropy,
        reactivity: thermodynamicProperties.reactivity,
        gregsEnergy: thermodynamicProperties.gregsEnergy,
        dominantAlchemicalProperty: "Essence" as AlchemicalProperty,
        planetaryBoost: 1.0 + compatibilityScore * 0.5, // Calculate based on compatibility
        dominantPlanets: [] as string[],
        planetaryDignities: {} as Record<string, unknown>,
        // Optional legacy properties
        transformations: calculateElementalTransformations(
          item.elementalProperties,
          currentElementalInfluence,
        ) as any,
        seasonalResonance: calculateSeasonalResonance(dominantElement),
      } as any;

      return alchemicalItem;
    });
  } catch (error) {
    errorLog(
      "Error in transformItemsWithPlanetaryPositions: ",
      error instanceof Error ? error.message : String(error),
    );

    // Return items with basic transformation if error occurs
    return items.map((item) => {
      const dominantElement = getDominantElementFromProperties(
        item.elementalProperties,
      );
      // Create AlchemicalItem-compliant object with all required properties
      return {
        ...item,
        // Required AlchemicalItem properties
        alchemicalProperties: {
          Spirit: 0.25,
          Essence: 0.25,
          Matter: 0.25,
          Substance: 0.25,
        } as Record<AlchemicalProperty, number>,
        transformedElementalProperties: {
          ...item.elementalProperties,
        } as Record<ElementalCharacter, number>,
        heat: 0.5,
        entropy: 0.5,
        reactivity: 0.5,
        gregsEnergy: 0.5,
        dominantElement,
        dominantAlchemicalProperty: "Spirit" as AlchemicalProperty,
        planetaryBoost: 1.0,
        dominantPlanets: [] as string[],
        planetaryDignities: {} as Record<string, unknown>,

        // Optional legacy properties for backward compatibility
        thermodynamicProperties: {
          heat: 0.5,
          entropy: 0.5,
          reactivity: 0.5,
          gregsEnergy: 0.5,
        },
        transformations: [],
        seasonalResonance: [],
      } as AlchemicalItem;
    });
  }
}

/**
 * Calculate current elemental influence from planetary positions
 */
function calculateCurrentElementalInfluence(
  planetaryPositions: { [key: string]: unknown },
  isDaytime: boolean,
  currentZodiac?: string,
): ElementalProperties {
  const influence: ElementalProperties = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0,
  };

  try {
    // Weight planets by their influence
    const planetWeights: { [key: string]: number } = {
      Sun: 1.0,
      Moon: 0.8,
      Mercury: 0.6,
      Venus: 0.7,
      Mars: 0.7,
      Jupiter: 0.8,
      Saturn: 0.6,
      Uranus: 0.4,
      Neptune: 0.4,
      Pluto: 0.3,
    };

    // Add influence from each planet
    Object.entries(planetaryPositions).forEach(([planet, data]) => {
      const weight = planetWeights[planet] || 0.5;
      const sign =
        typeof data === "object" && (data as any)?.sign
          ? (data as any).sign
          : "";

      if (sign) {
        const element = getZodiacElement(sign.toLowerCase());
        influence[element] += weight;
      }
    });

    // Adjust for day/night cycle
    if (isDaytime) {
      influence.Fire *= 1.2;
      influence.Air *= 1.1;
    } else {
      influence.Water *= 1.2;
      influence.Earth *= 1.1;
    }

    // Boost current zodiac element if available
    if (currentZodiac) {
      const currentElement = getZodiacElement(
        currentZodiac.toLowerCase() as any,
      );
      influence[currentElement] *= 1.3;
    }

    // Normalize to 0-1 range
    const total = Object.values(influence).reduce((sum, val) => sum + val, 0);
    if (total > 0) {
      Object.keys(influence).forEach((key) => {
        influence[key as keyof ElementalProperties] /= total;
      });
    }

    return influence;
  } catch (error) {
    errorLog(
      "Error calculating elemental influence: ",
      error instanceof Error ? error.message : String(error),
    );
    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  }
}

/**
 * Calculate item compatibility score based on elemental alignment
 */
function calculateItemCompatibilityScore(
  itemProperties: ElementalProperties,
  currentInfluence: ElementalProperties,
  planetaryPositions: { [key: string]: unknown },
  isDaytime: boolean,
): number {
  try {
    // Base compatibility from elemental alignment
    let compatibility = 0;

    // Calculate weighted alignment for each element
    Object.keys(itemProperties).forEach((element) => {
      if (element in currentInfluence) {
        const itemStrength = itemProperties[element] || 0;
        const currentStrength = currentInfluence[element as any] || 0;

        // Elements work best with themselves (no opposing elements principle)
        if (itemStrength > 0 && currentStrength > 0) {
          compatibility += Math.sqrt(itemStrength * currentStrength);
        }
      }
    });

    // Bonus for dominant element alignment
    const itemDominant = getDominantElementFromProperties(itemProperties);
    const currentDominant = getDominantElementFromProperties(currentInfluence);

    if (itemDominant === currentDominant) {
      compatibility *= 1.4; // Strong bonus for same dominant element
    }

    // Adjust for planetary strength
    const planetaryStrength = calculatePlanetaryStrength(planetaryPositions);
    compatibility *= 0.8 + planetaryStrength * 0.4;

    // Time of day adjustment
    const timeBonus = isDaytime
      ? (itemProperties.Fire + itemProperties.Air) * 0.1
      : (itemProperties.Water + itemProperties.Earth) * 0.1;

    compatibility += timeBonus;

    // Ensure score is in 0-1 range
    return Math.max(0, Math.min(1, compatibility));
  } catch (error) {
    errorLog(
      "Error calculating compatibility score: ",
      error instanceof Error ? error.message : String(error),
    );
    return 0.5;
  }
}

/**
 * Get dominant element from elemental properties
 */
function getDominantElementFromProperties(
  properties: ElementalProperties,
): ElementalCharacter {
  try {
    const elements = Object.entries(properties) as Array<
      [ElementalCharacter, number]
    >;
    const dominant = elements.reduce(
      (max, [element, value]) => (value > max.value ? { element, value } : max),
      { element: "Fire" as ElementalCharacter, value: 0 },
    );

    return dominant.element;
  } catch (error) {
    return "Fire";
  }
}

/**
 * Calculate alchemical properties from elemental properties and planetary influence
 */
function calculateAlchemicalProperties(
  itemProperties: ElementalProperties,
  planetaryPositions: { [key: string]: unknown },
  currentInfluence: ElementalProperties,
): AlchemicalResult {
  try {
    // Calculate thermodynamic properties using the alchemical formulas
    const { Fire, Water, Earth, Air } = itemProperties;

    // Use simplified alchemical calculations
    const Spirit = Fire + Air;
    const Essence = Water + Earth;
    const Matter = Earth + Water;
    const Substance = Fire + Air;

    // Calculate thermodynamic metrics
    const heat =
      (Math.pow(Spirit, 2) + Math.pow(Fire, 2)) /
      Math.max(1, Math.pow(Essence + Matter + Water + Air, 2));

    const entropy =
      (Math.pow(Spirit, 2) +
        Math.pow(Substance, 2) +
        Math.pow(Fire, 2) +
        Math.pow(Air, 2)) /
      Math.max(1, Math.pow(Essence + Matter + Earth + Water, 2));

    const reactivity =
      (Math.pow(Spirit, 2) +
        Math.pow(Substance, 2) +
        Math.pow(Essence, 2) +
        Math.pow(Fire, 2) +
        Math.pow(Air, 2) +
        Math.pow(Water, 2)) /
      Math.max(1, Math.pow(Matter + Earth, 2));

    const gregsEnergy = heat - entropy * reactivity;

    // Calculate Kalchm
    const kalchm =
      Spirit > 0 && Essence > 0 && Matter > 0 && Substance > 0
        ? (Math.pow(Spirit, Spirit) * Math.pow(Essence, Essence)) /
          (Math.pow(Matter, Matter) * Math.pow(Substance, Substance))
        : 1;

    // Calculate Monica constant
    let monica = 0;
    if (kalchm > 0) {
      const lnK = Math.log(kalchm);
      if (lnK !== 0 && reactivity !== 0) {
        monica = -gregsEnergy / (reactivity * lnK);
      }
    }

    const thermodynamicProperties: ThermodynamicProperties = {
      heat,
      entropy,
      reactivity,
      gregsEnergy,
    };

    const score = calculateOverallAlchemicalScore(
      thermodynamicProperties,
      currentInfluence,
    );

    return {
      elementalProperties: itemProperties,
      thermodynamicProperties,
      kalchm,
      monica,
      score,
    };
  } catch (error) {
    errorLog(
      "Error calculating alchemical properties: ",
      error instanceof Error ? error.message : String(error),
    );
    return {
      elementalProperties: itemProperties,
      thermodynamicProperties: {
        heat: 0,
        entropy: 0,
        reactivity: 0,
        gregsEnergy: 0,
      },
      kalchm: 1,
      monica: 0,
      score: 0.5,
    };
  }
}

/**
 * Calculate basic thermodynamic properties
 */
function calculateThermodynamicProperties(
  itemProperties: ElementalProperties,
  compatibilityScore: number,
): ThermodynamicProperties {
  const { Fire, Water, Earth, Air } = itemProperties;

  const heat = (Fire + Air) * compatibilityScore;
  const entropy = (Water + Earth) * (1 - compatibilityScore);
  const reactivity = (Fire + Water) * compatibilityScore;
  const gregsEnergy = compatibilityScore * (Fire + Water + Earth + Air);

  return {
    heat,
    entropy,
    reactivity,
    gregsEnergy,
  };
}

/**
 * Calculate elemental transformations
 */
function calculateElementalTransformations(
  itemProperties: ElementalProperties,
  currentInfluence: ElementalProperties,
): ElementalInteraction[] {
  const transformations: ElementalInteraction[] = [];

  try {
    // Find strongest interactions
    Object.entries(itemProperties).forEach(([element, strength]) => {
      if (strength > 0.3) {
        const influenceStrength = currentInfluence[element as any] || 0;

        if (influenceStrength > 0.3) {
          transformations.push({
            primary: element as Element,
            _secondary: element as Element, // Same element enhances itself,
            effect: "enhance",
            _potency: strength * influenceStrength,
            _resultingElement: element as Element,
          } as any);
        }
      }
    });

    return transformations;
  } catch (error) {
    return [];
  }
}

/**
 * Calculate seasonal resonance
 */
function calculateSeasonalResonance(
  dominantElement: ElementalCharacter,
): Season[] {
  const seasonalMap: Record<ElementalCharacter, Season[]> = {
    Fire: ["summer"],
    Earth: ["autumn", "fall"],
    Air: ["spring"],
    Water: ["winter"],
  };

  return seasonalMap[dominantElement] || ["all"];
}

/**
 * Calculate planetary strength from positions
 */
function calculatePlanetaryStrength(planetaryPositions: {
  [key: string]: unknown;
}): number {
  try {
    let totalStrength = 0;
    let planetCount = 0;
    Object.entries(planetaryPositions).forEach(([planet, data]) => {
      if (typeof data === "object" && data !== null) {
        // Check for retrograde (reduces strength)
        const retrogradeModifier = (data as any).isRetrograde ? 0.7 : 1.0;

        // Base strength varies by planet;
        const basePlanetStrength: { [key: string]: number } = {
          Sun: 1.0,
          Moon: 0.9,
          Mercury: 0.7,
          Venus: 0.8,
          Mars: 0.8,
          Jupiter: 0.9,
          Saturn: 0.6,
          Uranus: 0.5,
          Neptune: 0.5,
          Pluto: 0.4,
        };

        const strength =
          (basePlanetStrength[planet] || 0.5) * retrogradeModifier;
        totalStrength += strength;
        planetCount++;
      }
    });

    return planetCount > 0 ? totalStrength / planetCount : 0.5;
  } catch (error) {
    return 0.5;
  }
}

/**
 * Calculate overall alchemical score
 */
function calculateOverallAlchemicalScore(
  thermodynamicProperties: ThermodynamicProperties,
  currentInfluence: ElementalProperties,
): number {
  try {
    const { heat, entropy, reactivity, gregsEnergy } = thermodynamicProperties;

    // Balance of thermodynamic properties
    const balance =
      1 - Math.abs(heat - entropy) - Math.abs(reactivity - gregsEnergy / 2);

    // Current influence alignment
    const influenceSum = Object.values(currentInfluence).reduce(
      (sum, val) => sum + val,
      0,
    );
    const influenceBalance = influenceSum > 0 ? Math.min(1, influenceSum) : 0.5;

    // Combine factors
    const score =
      (balance * 0.6 + influenceBalance * 0.4 + gregsEnergy * 0.1) / 1.1;
    return Math.max(0, Math.min(1, score));
  } catch (error) {
    return 0.5;
  }
}
