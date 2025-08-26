import * as Astronomy from 'astronomy-engine';

import type { ZodiacSign } from '@/types/alchemy';

/**
 * A utility function for logging debug information
 * This is a safe replacement for console.log that can be disabled in production
 */
const debugLog = (_message: string, ...args: unknown[]): void => {
  // Comment out console.log to avoid linting warnings
  // log.info(message, ...args);
};

// Updated reference data based on accurate positions for July 2, 2025 at 10:45 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:11 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:11 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:11 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:11 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:11 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:11 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:11 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:11 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:11 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:11 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:11 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:15 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:15 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:15 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:16 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:17 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:19 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:19 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:20 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:20 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:20 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:20 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:20 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:20 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:20 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:20 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:20 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:20 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:20 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:20 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:20 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:20 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:20 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:20 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:20 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:20 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:20 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:20 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:20 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:20 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:20 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:20 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:20 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:20 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:21 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:21 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:21 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:21 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:21 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:21 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:21 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:23 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:36 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:36 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:36 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:36 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:36 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:36 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:36 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:36 PM EDT
// Updated reference data based on accurate positions for July 2, 2025 at 11:36 PM EDT
const REFERENCE_POSITIONS = {
  Sun: [101, 29, 0, 'cancer'],
  Moon: [195, 10, 0, 'libra'],
  Mercury: [127, 23, 0, 'leo'],
  Venus: [58, 21, 0, 'taurus'],
  Mars: [159, 0, 0, 'virgo'],
  Jupiter: [95, 18, 0, 'cancer'],
  Saturn: [1, 51, 0, 'aries'],
  Uranus: [59, 48, 0, 'taurus'],
  Neptune: [2, 10, 0, 'aries'],
  Pluto: [303, 5, 0, 'aquarius'],
  Chiron: [26, 56, 0, 'aries'],
  Sirius: [1, 46, 0, 'aries'],
};

// Reference date for July 2, 2025 at 10:45 PM EDT
const REFERENCE_DATE = new Date('2025-07-03T03:36:29.687Z'); // New York time (EDT)

// Approximate daily motion of planets in degrees - more accurate values from ephemeris
const DAILY_MOTION = {
  Sun: 0.986,
  Moon: 13.2,
  Mercury: 1.383,
  Venus: 1.2,
  Mars: 0.524,
  Jupiter: 0.083,
  Saturn: 0.034,
  Uranus: 0.012,
  Neptune: 0.006,
  Pluto: 0.004,
  northNode: 0.053,
  Chiron: 0.018,
  Ascendant: 1.0, // Varies based on location and time
  MC: 1.0, // Varies based on location and time
};

// Keep the retrograde information for the planets based on July 2, 2025 data
const RETROGRADE_STATUS = {
  Sun: false,
  Moon: false,
  Mercury: false, // Direct in Leo
  Venus: false, // Direct in Leo
  Mars: false,
  Jupiter: false,
  Saturn: false,
  Uranus: false,
  Neptune: false,
  Pluto: true, // Retrograde in Aquarius
  northNode: true, // Nodes are always retrograde
  southNode: true,
  Chiron: false,
  Ascendant: false,
  MC: false,
};

/**
 * Type definition for cached positions
 */
interface PositionsCache {
  positions: Record<string, PlanetPositionData>;
  timestamp: number;
  date: Date;
}

/**
 * Type for planetary position object
 */
interface PlanetPositionData {
  sign: any;
  degree: number;
  exactLongitude: number;
  isRetrograde: boolean;
}

// Map our planet names to astronomy-engine bodies
const PLANET_MAPPING: Record<string, Astronomy.Body> = {
  Sun: Astronomy.Body.Sun,
  Moon: Astronomy.Body.Moon,
  Mercury: Astronomy.Body.Mercury,
  Venus: Astronomy.Body.Venus,
  Mars: Astronomy.Body.Mars,
  Jupiter: Astronomy.Body.Jupiter,
  Saturn: Astronomy.Body.Saturn,
  Uranus: Astronomy.Body.Uranus,
  Neptune: Astronomy.Body.Neptune,
  Pluto: Astronomy.Body.Pluto,
};

// Cache for planetary positions to avoid frequent recalculations
let positionsCache: PositionsCache | null = null;

// Cache expiration in milliseconds (15 minutes)
const CACHE_EXPIRATION = 15 * 60 * 1000;

// Zodiac signs in order
const ZODIAC_SIGNS = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
];

/**
 * Convert a position in degrees, minutes, seconds to decimal degrees
 */
function dmsToDecimal(degrees: number, minutes: number, seconds: number): number {
  return degrees + minutes / 60 + seconds / 3600;
}

/**
 * Convert a zodiac sign to its starting degree (0-330)
 */
function zodiacStartDegree(sign: string): number {
  const index = ZODIAC_SIGNS.indexOf(sign);
  return index * 30;
}

/**
 * Calculate the longitude in decimal degrees based on reference data
 */
function calculateReferenceLongitude(planet: string): number {
  if (!REFERENCE_POSITIONS[planet]) {
    console.warn(`No reference position for ${planet}, using default`);
    return 0;
  }

  const [degrees, minutes, seconds, sign] = REFERENCE_POSITIONS[planet];
  const decimalDegrees = dmsToDecimal(degrees, minutes, seconds);
  const signStart = zodiacStartDegree(sign);

  return (signStart + decimalDegrees) % 360;
}

/**
 * Get planetary positions for a given date using fallback approach
 */
export function getFallbackPlanetaryPositions(date: Date): Record<string, PlanetPositionData> {
  const positions: Record<string, PlanetPositionData> = {};

  // Calculate days difference from reference date
  const daysDiff = (date.getTime() - REFERENCE_DATE.getTime()) / (24 * 60 * 60 * 1000);

  // Calculate position for each planet
  for (const planet of Object.keys(REFERENCE_POSITIONS)) {
    const refLongitude = calculateReferenceLongitude(planet);
    const motion = DAILY_MOTION[planet] || 0;
    const isRetrograde = RETROGRADE_STATUS[planet] || false;

    // Adjust motion direction for retrograde planets
    const adjustedMotion = isRetrograde ? -Math.abs(motion) : Math.abs(motion);

    // Calculate new position with minimal randomness (just for slight variation)
    // Reduced randomness for more accurate predictions
    const randomFactor = Math.sin(date.getTime() / 1000000 + planet.charCodeAt(0)) * 0.2;
    let newLongitude = refLongitude + adjustedMotion * daysDiff + randomFactor;

    // Normalize to 0-360 degrees
    newLongitude = ((newLongitude % 360) + 360) % 360;

    // Get zodiac sign and degree
    const signIndex = Math.floor(newLongitude / 30);
    const degree = newLongitude % 30;
    const sign = ZODIAC_SIGNS[signIndex];

    // Store both the raw longitude and the formatted data
    positions[planet] = {
      sign: sign.toLowerCase() as any,
      degree: parseFloat(degree.toFixed(2)),
      exactLongitude: newLongitude,
      isRetrograde,
    };
  }

  return positions;
}

/**
 * Calculate lunar node positions with more accurate reference data
 * @param date Date to calculate for
 * @returns Object with north node position and retrograde status
 */
function calculateLunarNodes(date: Date): { northNode: number; isRetrograde: boolean } {
  try {
    // Since MoonNode is not available in astronomy-engine,
    // we'll implement a simple approximation using astronomical formulas

    // Time in Julian centuries since 2000
    const jd = Astronomy.MakeTime(date).tt;
    const T = (jd - 2451545.0) / 36525;

    // Mean longitude of ascending node (Meeus formula)
    let Omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000;

    // Normalize to 0-360 range
    Omega = ((Omega % 360) + 360) % 360;

    // The ascending node (North Node) is the opposite of Omega
    const northNode = (Omega + 180) % 360;

    // Nodes are always retrograde
    return { northNode, isRetrograde: true };
  } catch (error) {
    debugLog(
      'Error calculating lunar nodes:',
      error instanceof Error ? error.message : String(error),
    );
    // Return current position for March 2024 (late pisces)
    return { northNode: 356.54, isRetrograde: true };
  }
}

/**
 * Get accurate planetary positions using astronomy-engine
 * @param date Date to calculate positions for
 * @returns Record of planetary positions in degrees (0-360)
 */
export async function getAccuratePlanetaryPositions(
  date: Date = new Date(),
): Promise<Record<string, PlanetPositionData>> {
  try {
    // Check cache first
    if (
      positionsCache &&
      date.getTime() - positionsCache.date.getTime() < 60000 && // 1 minute cache for same date
      Date.now() - positionsCache.timestamp < CACHE_EXPIRATION
    ) {
      debugLog('Using cached planetary positions');
      return positionsCache.positions;
    }

    const astroTime = new Astronomy.AstroTime(date);
    const positions: Record<string, PlanetPositionData> = {};

    // Calculate position for each planet
    for (const [planet, body] of Object.entries(PLANET_MAPPING)) {
      try {
        // Special handling for the Sun - can't calculate heliocentric longitude of the Sun
        if (planet === 'Sun') {
          // For the Sun, we'll use a different approach - get ecliptic coordinates directly
          // The Sun is always at the opposite ecliptic longitude from Earth's heliocentric longitude
          const earthLong = Astronomy.EclipticLongitude(Astronomy.Body.Earth, astroTime);
          // Sun is 180 degrees opposite Earth's heliocentric position
          const sunLong = (earthLong + 180) % 360;

          const { sign, degree } = getLongitudeToZodiacPosition(sunLong);

          positions[planet] = {
            sign: sign as any,
            degree,
            exactLongitude: sunLong,
            isRetrograde: false, // The Sun is never retrograde from Earth's perspective
          };
        } else {
          // For other planets use standard calculation
          const eclipLong = Astronomy.EclipticLongitude(body, astroTime);
          const isRetrograde = isPlanetRetrograde(body, date);

          const { sign, degree } = getLongitudeToZodiacPosition(eclipLong);

          positions[planet] = {
            sign: sign as any,
            degree,
            exactLongitude: eclipLong,
            isRetrograde,
          };
        }
      } catch (error) {
        debugLog(
          `Error calculating position for ${planet}:`,
          error instanceof Error ? error.message : String(error),
        );
        // Use fallback for this specific planet
        const fallbackPositions = getFallbackPlanetaryPositions(date);
        if (fallbackPositions[planet]) {
          positions[planet] = fallbackPositions[planet];
        }
      }
    }

    // Add lunar nodes
    const nodeData = calculateLunarNodes(date);
    const { sign: nodeSign, degree: nodeDegree } = getLongitudeToZodiacPosition(nodeData.northNode);

    positions.northNode = {
      sign: nodeSign as any,
      degree: nodeDegree,
      exactLongitude: nodeData.northNode,
      isRetrograde: nodeData.isRetrograde,
    };

    // Calculate south node (opposite to north node)
    const southNodeLong = (nodeData.northNode + 180) % 360;
    const { sign: southSign, degree: southDegree } = getLongitudeToZodiacPosition(southNodeLong);

    positions.southNode = {
      sign: southSign as any,
      degree: southDegree,
      exactLongitude: southNodeLong,
      isRetrograde: nodeData.isRetrograde,
    };

    // Cache the results
    positionsCache = {
      positions,
      timestamp: Date.now(),
      date: new Date(date),
    };

    return positions;
  } catch (error) {
    debugLog(
      'Error calculating planetary positions:',
      error instanceof Error ? error.message : String(error),
    );
    // Fall back to approximate calculations
    return getFallbackPlanetaryPositions(date);
  }
}

/**
 * Check if a planet is retrograde
 * @param body Astronomy body
 * @param date Date to check
 * @returns Boolean indicating if planet is retrograde
 */
function isPlanetRetrograde(body: Astronomy.Body, date: Date): boolean {
  try {
    // Skip for Sun and Moon as they don't have retrograde motion
    if (body === Astronomy.Body.Sun || body === Astronomy.Body.Moon) {
      return false;
    }

    // Create proper AstroTime objects
    const astroTime = new Astronomy.AstroTime(date);
    const prevTime = new Astronomy.AstroTime(new Date(date.getTime() - 2 * 24 * 60 * 60 * 1000)); // 2 days before

    // Check if position is decreasing (retrograde)
    const currentLong = Astronomy.EclipticLongitude(body, astroTime);
    const prevLong = Astronomy.EclipticLongitude(body, prevTime);

    // Adjust for crossing 0/360 boundary
    let diff = currentLong - prevLong;
    if (Math.abs(diff) > 180) {
      diff = diff > 0 ? diff - 360 : diff + 360;
    }

    return diff < 0;
  } catch (error) {
    debugLog(
      `Error determining retrograde for ${body}:`,
      error instanceof Error ? error.message : String(error),
    );
    // Default retrograde status for common retrograde planets
    if (body === Astronomy.Body.Mercury || body === Astronomy.Body.Venus) {
      return Math.random() < 0.4; // 40% chance of retrograde (rough approximation)
    }
    return false;
  }
}

/**
 * Convert ecliptic longitude to zodiac sign and degree
 * @param longitude Ecliptic longitude in degrees (0-360)
 * @returns Object with sign and degree
 */
export function getLongitudeToZodiacPosition(longitude: number): { sign: string; degree: number } {
  // Normalize longitude to 0-360 range
  const normalizedLong = ((longitude % 360) + 360) % 360;

  // Calculate sign index (0-11)
  const signIndex = Math.floor(normalizedLong / 30);

  // Calculate degree within sign (0-29.999...)
  const degree = normalizedLong % 30;

  // Get sign name
  const signs: any[] = [
    'aries',
    'taurus',
    'gemini',
    'cancer',
    'leo',
    'virgo',
    'libra',
    'scorpio',
    'sagittarius',
    'capricorn',
    'aquarius',
    'pisces',
  ];

  const sign = signs[signIndex];

  return { sign, degree };
}

/**
 * Calculate rough sun position for simple calculations
 * @param date Date to calculate for
 * @returns Approximate ecliptic longitude in degrees (0-360)
 */
function calculateSunPosition(date: Date): number {
  // Simple approximation of sun's position
  const dayOfYear = getDayOfYear(date);
  const year = date.getFullYear();

  // Account for leap years
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const daysInYear = isLeapYear ? 366 : 365;

  // Calculate approximate position (360 degrees / days in year) * day of year
  // Starting from winter solstice at ~270 degrees (in Capricorn)
  const position = (360 / daysInYear) * dayOfYear + 270;
  return position % 360;
}

/**
 * Calculate rough moon position for simple calculations
 * @param date Date to calculate for
 * @returns Approximate ecliptic longitude in degrees (0-360)
 */
function _calculateMoonPosition(date: Date): number {
  // Very simple approximation
  const sunPosition = calculateSunPosition(date);

  // Moon completes a cycle in ~29.53 days
  // Calculate days since new moon (Jan 1, 2000)
  const daysSince2000 = (date.getTime() - new Date(2000, 0, 1).getTime()) / (1000 * 60 * 60 * 24);
  const lunarCycles = daysSince2000 / 29.53;
  const cycleProgress = (lunarCycles - Math.floor(lunarCycles)) * 360;

  // Moon position is sun position + cycle progress
  return (sunPosition + cycleProgress) % 360;
}

/**
 * Calculate day of year (1-366)
 * @param date Date to calculate day of year for
 * @returns Day of year (1-366)
 */
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
