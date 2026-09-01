/**
 * Safe Astrological Utilities
 *
 * This module provides reliable astronomy calculations using hardcoded
 * accurate planetary positions for March 2025, avoiding the need for
 * complex API calls and calculations that might fail.
 */

import type { AstrologicalState } from "@/types/alchemy";
import type {
  AspectType,
  CelestialPosition,
  PlanetaryAspect,
  ZodiacSignType,
} from "@/types/celestial";
import { createLogger } from "@/utils/logger";

// Create a component-specific logger
const logger = createLogger("SafeAstrology");

// Cache system to avoid redundant calculations
interface StateCache<T> {
  data: T;
  timestamp: number;
}

// Ensure ZodiacSignType type is properly formatted
const ZODIAC_SIGNS: ZodiacSignType[] = [
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

let astrologyCache: StateCache<AstrologicalState> | null = null;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

/**
 * Get the current reliable planetary positions
 * Uses hardcoded accurate values for March 2025;
 * @returns Record of planetary positions with sign, degree, and other data
 */
export function getReliablePlanetaryPositions(): Record<
  string,
  CelestialPosition
> {
  const positions: Record<string, CelestialPosition> = {
    Sun: {
      sign: "aries",
      degree: 8.63,
      exactLongitude: 8.63,
      isRetrograde: false,
    },
    Moon: {
      sign: "aries",
      degree: 3.48,
      exactLongitude: 3.48,
      isRetrograde: false,
    },
    _Mercury: {
      sign: "aries",
      degree: 0.75,
      exactLongitude: 0.75,
      isRetrograde: true,
    },
    _Venus: {
      sign: "pisces",
      degree: 29.0,
      exactLongitude: 359.0,
      isRetrograde: true,
    },
    _Mars: {
      sign: "cancer",
      degree: 22.67,
      exactLongitude: 112.67,
      isRetrograde: false,
    },
    _Jupiter: {
      sign: "gemini",
      degree: 15.53,
      exactLongitude: 75.53,
      isRetrograde: false,
    },
    _Saturn: {
      sign: "pisces",
      degree: 24.13,
      exactLongitude: 354.13,
      isRetrograde: false,
    },
    _Uranus: {
      sign: "taurus",
      degree: 24.62,
      exactLongitude: 54.62,
      isRetrograde: false,
    },
    _Neptune: {
      sign: "pisces",
      degree: 29.56,
      exactLongitude: 359.56,
      isRetrograde: false,
    },
    _Pluto: {
      sign: "aquarius",
      degree: 3.24,
      exactLongitude: 303.24,
      isRetrograde: false,
    },
  };

  return positions;
}

/**
 * Calculate the current lunar phase using accurate astronomical methods
 * @returns Lunar phase value (0-1, where 0/1 is New Moon, 0.5 is Full Moon)
 */
export function calculateLunarPhase(): number {
  const now = new Date();
  const knownNewMoon = new Date(Date.UTC(2025, 2, 29, 10, 58)); // March 29, 2025 10:58 UTC
  const synodicMonth = 29.53058867; // Days

  const diffTime = now.getTime() - knownNewMoon.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  const phase = (diffDays % synodicMonth) / synodicMonth;
  return phase < 0 ? phase + 1 : phase;
}

/**
 * Get human-readable lunar phase name
 * @param phase Lunar phase value (0-1)
 * @returns Standard lunar phase name
 */
export function getLunarPhaseName(phase: number = calculateLunarPhase()): string {
  if (phase >= 0.97 || phase < 0.03) return "New Moon";
  if (phase >= 0.03 && phase < 0.22) return "Waxing Crescent";
  if (phase >= 0.22 && phase < 0.28) return "First Quarter";
  if (phase >= 0.28 && phase < 0.47) return "Waxing Gibbous";
  if (phase >= 0.47 && phase < 0.53) return "Full Moon";
  if (phase >= 0.53 && phase < 0.72) return "Waning Gibbous";
  if (phase >= 0.72 && phase < 0.78) return "Last Quarter";
  return "Waning Crescent";
}

/**
 * Calculate moon illumination percentage
 * @param phase Lunar phase value (0-1)
 * @returns Illumination from 0 to 1
 */
export function getMoonIllumination(
  phase: number = calculateLunarPhase(),
): number {
  return 0.5 * (1 - Math.cos(phase * 2 * Math.PI));
}

/**
 * Calculate sun sign for a given date
 * @param date Date to calculate sun sign for (defaults to current date)
 * @returns Zodiac sign as a string
 */
export function calculateSunSign(date: Date = new Date()): ZodiacSignType {
  // For simplicity, hardcode the sun sign based on the month
  const month = date.getMonth();
  const day = date.getDate();

  // Simple zodiac date ranges
  if ((month === 2 && day >= 21) || (month === 3 && day <= 19)) return "aries";
  if ((month === 3 && day >= 20) || (month === 4 && day <= 20)) return "taurus";
  if ((month === 4 && day >= 21) || (month === 5 && day <= 20)) return "gemini";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 22)) return "cancer";
  if ((month === 6 && day >= 23) || (month === 7 && day <= 22)) return "leo";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "virgo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "libra";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 21))
    return "scorpio";
  if ((month === 10 && day >= 22) || (month === 11 && day <= 21))
    return "sagittarius";
  if ((month === 11 && day >= 22) || (month === 0 && day <= 19))
    return "capricorn";
  if ((month === 0 && day >= 20) || (month === 1 && day <= 18))
    return "aquarius";
  return "pisces";
}

/**
 * Get zodiac sign position in degrees (0-359)
 * @param sign Zodiac sign
 * @param degree Degree within the sign (0-29.99)
 * @returns Absolute position in degrees (0-359)
 */
export function getZodiacPositionInDegrees(
  sign: ZodiacSignType | string,
  degree: number,
): number {
  const signIndex = ZODIAC_SIGNS.indexOf(sign.toLowerCase() as ZodiacSignType);
  if (signIndex === -1) {
    logger.warn(`Unknown sign: ${sign}, falling back to Aries`);
    return degree; // Aries starts at 0 degrees
  }
  return signIndex * 30 + degree;
}

/**
 * Calculate planetary aspects from positions
 * @param positions Record of planetary positions
 * @returns Array of planetary aspects
 */
export function calculatePlanetaryAspects(
  positions: Record<string, CelestialPosition | undefined>,
): PlanetaryAspect[] {
  const aspects: PlanetaryAspect[] = [];
  const planets = Object.keys(positions);

  // Calculate aspects between all planet pairs
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const planet1 = planets[i];
      const planet2 = planets[j];
      if (planet1 === undefined || planet2 === undefined) continue;
      const pos1Obj = positions[planet1];
      const pos2Obj = positions[planet2];

      if (!pos1Obj || !pos2Obj) continue;

      // Convert lowercase sign strings to proper ZodiacSignType type values
      const pos1Sign = pos1Obj.sign ?? "aries";
      const pos2Sign = pos2Obj.sign ?? "aries";

      // Calculate the angular difference between planets;
      const pos1 = getZodiacPositionInDegrees(
        pos1Sign,
        pos1Obj.degree ?? 0,
      );
      const pos2 = getZodiacPositionInDegrees(
        pos2Sign,
        pos2Obj.degree ?? 0,
      );

      let diff = Math.abs(pos1 - pos2);
      if (diff > 180) diff = 360 - diff;

      // Check for aspects with orbs
      const aspect = identifyAspect(diff);
      if (aspect) {
        // Create aspect with proper typing
        aspects.push({
          planet1,
          planet2,
          type: aspect.type,
          aspectType: aspect.type,
          orb: aspect.orb,
          influence: calculateAspectStrength(aspect.type, aspect.orb),
          strength: calculateAspectStrength(aspect.type, aspect.orb),
          planets: [planet1, planet2],
        });
      }
    }
  }

  logger.debug(`Found ${aspects.length} aspects`);
  return aspects;
}

/**
 * Identify aspect type from angle
 * @param angleDiff Angular difference between planets
 * @returns Aspect type and orb if aspect exists, null otherwise
 */
export function identifyAspect(
  angleDiff: number,
): { type: AspectType; orb: number } | null {
  const aspects = [
    { type: "conjunction" as AspectType, angle: 0, maxOrb: 10 },
    { type: "opposition" as AspectType, angle: 180, maxOrb: 10 },
    { type: "trine" as AspectType, angle: 120, maxOrb: 8 },
    { type: "square" as AspectType, angle: 90, maxOrb: 8 },
    { type: "sextile" as AspectType, angle: 60, maxOrb: 6 },
    { type: "quincunx" as AspectType, angle: 150, maxOrb: 5 },
    { type: "semisextile" as AspectType, angle: 30, maxOrb: 3 },
    { type: "semisquare" as AspectType, angle: 45, maxOrb: 3 },
    { type: "sesquisquare" as AspectType, angle: 135, maxOrb: 3 },
  ];

  for (const aspect of aspects) {
    const orb = Math.abs(angleDiff - aspect.angle);
    if (orb <= aspect.maxOrb) {
      return { type: aspect.type, orb };
    }
  }

  return null;
}

/**
 * Calculate aspect strength based on type and orb
 * @param type Aspect type
 * @param orb Orb (angle deviation from exact aspect)
 * @returns Strength value (0-10)
 */
export function calculateAspectStrength(type: AspectType, orb: number): number {
  const baseStrengths: Record<AspectType, number> = {
    conjunction: 10,
    opposition: 10,
    trine: 8,
    square: 8,
    sextile: 6,
  };

  // Diminish strength based on orb
  const baseStrength = baseStrengths[type];
  const maxOrb =
    type === "conjunction" || type === "opposition"
      ? 10
      : type === "trine" || type === "square"
        ? 8
        : 6;

  return baseStrength * (1 - orb / maxOrb);
}

/**
 * Get the current astrological state
 * @returns Current astrological state with planetary positions, aspects, etc.
 */
export function getCurrentAstrologicalState(): AstrologicalState {
  // Use cache if available and recent
  if (
    astrologyCache &&
    Date.now() - astrologyCache.timestamp < CACHE_DURATION
  ) {
    logger.debug("Using cached astrological state");
    return astrologyCache.data;
  }

  logger.debug("Calculating fresh astrological state");

  const now = new Date();
  const positions = getReliablePlanetaryPositions();
  const lunarPhase = calculateLunarPhase();
  const phaseName = getLunarPhaseName(lunarPhase);

  // Determine dominant element based on positions
  const elements = countElements(positions);
  const dominantElement = getDominantElement(elements);

  // Calculate aspects
  const aspects = calculatePlanetaryAspects(positions);

  // Determine if it's daytime (between 6 AM and 6 PM)
  const hours = now.getHours();
  const _isDaytime = hours >= 6 && hours < 18;

  // Calculate active planets (sun, moon + any in major aspect)
  const activePlanets = ["Sun", "Moon"];
  aspects.forEach((aspect) => {
    // Check influence rather than strength
    if (aspect.influence && aspect.influence > 5) {
      const planet1 =
        aspect.planet1.charAt(0).toUpperCase() + aspect.planet1.slice(1);
      const planet2 =
        aspect.planet2.charAt(0).toUpperCase() + aspect.planet2.slice(1);

      if (!activePlanets.includes(planet1)) activePlanets.push(planet1);
      if (!activePlanets.includes(planet2)) activePlanets.push(planet2);
    }
  });

  // Convert string element to proper casing for Element type
  const dominantElementCapitalized = (dominantElement.charAt(0).toUpperCase() +
    dominantElement.slice(1)) as "Fire" | "Water" | "Earth" | "Air";
  const sunPos = positions.Sun;
  const moonPos = positions.Moon;
  const state: AstrologicalState = {
    sunSign: toZodiacSignType(String(sunPos?.sign ?? "aries")),
    moonSign: toZodiacSignType(String(moonPos?.sign ?? "aries")),
    lunarPhase: phaseName as unknown as LunarPhase,
    activePlanets,
    dominantElement: dominantElementCapitalized,
    dominantPlanets: activePlanets,
  };

  // Update cache
  astrologyCache = {
    data: state,
    timestamp: Date.now(),
  };

  return state;
}

/**
 * Count elements from planetary positions
 * @param positions Record of planetary positions
 * @returns Count of each element
 */
function countElements(
  positions: Record<string, CelestialPosition>,
): Record<string, number> {
  const elements: Record<string, number> = {
    Fire: 0,
    Earth: 0,
    Air: 0,
    Water: 0,
  };

  // Element mapping for signs
  const signElements: Record<ZodiacSignType, keyof typeof elements> = {
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

  // Extra weight for certain planets
  const planetWeight: Record<string, number> = {
    sun: 3,
    moon: 2,
    ascendant: 2,
    mercury: 1.5,
    venus: 1.5,
    mars: 1.5,
    jupiter: 1.5,
    saturn: 1.5,
    uranus: 1,
    neptune: 1,
    pluto: 1,
    northNode: 0.5,
    southNode: 0.5,
  };

  // Count elements
  Object.entries(positions).forEach(([planet, position]) => {
    const sign = (position.sign ?? "aries") as ZodiacSignType;
    const element = signElements[sign];
    const weight = planetWeight[planet.toLowerCase()] ?? 1;
    const currentElement = elements[element];
    if (currentElement !== undefined) {
      elements[element] = currentElement + weight;
    }
  });

  return elements;
}

/**
 * Get the dominant element from element counts
 * @param elements Record of element counts
 * @returns Dominant element
 */
function getDominantElement(elements: Record<string, number>): string {
  let maxElement = "balanced";
  let maxCount = 0;

  Object.entries(elements).forEach(([element, count]) => {
    if (count > maxCount) {
      maxCount = count;
      maxElement = element;
    }
  });

  return maxElement;
}

/**
 * Calculate days since a specific date
 * @param date Reference date
 * @returns Number of days since the reference date
 */
function _getDaysSinceDate(date: Date): number {
  const now = new Date();
  const timeDiff = now.getTime() - date.getTime();
  return timeDiff / (1000 * 60 * 60 * 24);
}

// Helper function to convert any string to a valid ZodiacSignType
function toZodiacSignType(sign: string): ZodiacSignType {
  const lowerSign = sign.toLowerCase() as ZodiacSignType;
  if (ZODIAC_SIGNS.includes(lowerSign)) {
    return lowerSign;
  }

  // Default to Aries if invalid
  return "aries";
}
