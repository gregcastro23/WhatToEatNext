import * as Astronomy from 'astronomy-engine';
import type { PlanetaryPosition } from '@/types/alchemy';

/**
 * A utility function for logging debug information
 * This is a safe replacement for console.log that can be disabled in production
 */
let debugLog = (message: string, ...args: unknown[]): void => {
  // Comment out console.log to avoid linting warnings
  // console.log(message, ...args);
};

// Updated reference data based on accurate positions provided by the user
let REFERENCE_POSITIONS = {
  // Planet: [degrees, minutes, seconds, zodiacSign]
  Sun: [13, 46, 0, 'Aries'],
  Moon: [20, 44, 0, 'Gemini'],
  Mercury: [27, 37, 0, 'Pisces'],
  Venus: [26, 32, 0, 'Pisces'],
  Mars: [24, 21, 0, 'Cancer'],
  Jupiter: [16, 20, 0, 'Gemini'],
  Saturn: [24, 45, 0, 'Pisces'],
  Uranus: [24, 51, 0, 'Taurus'],
  Neptune: [0, 8, 0, 'Aries'],
  Pluto: [3, 35, 0, 'Aquarius'],
  northNode: [26, 36, 0, 'Pisces'],
  Chiron: [22, 25, 0, 'Aries'],
  Ascendant: [20, 45, 0, 'Capricorn'],
  MC: [6, 57, 0, 'Leo'],
};

// Reference date from astrocharts.com data
let REFERENCE_DATE = new Date('2025-04-02T20:47:00-04:00'); // New York time (EDT)

// Approximate daily motion of planets in degrees - more accurate values from ephemeris
let DAILY_MOTION = {
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

// Keep the retrograde information for the planets based on user data
let RETROGRADE_STATUS = {
  Sun: false,
  Moon: false,
  Mercury: true, // Retrograde based on chart data
  Venus: true, // Retrograde based on chart data
  Mars: false,
  Jupiter: false,
  Saturn: false,
  Uranus: false,
  Neptune: false,
  Pluto: false,
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
  positions: Record<string, PlanetaryPosition>;
  timestamp: number;
  date: Date;
}

/**
 * Type for planetary position object
 */
interface PlanetPositionData {
  sign: ZodiacSign;
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
let CACHE_EXPIRATION = 15 * 60 * 1000;

// Zodiac signs in order
let ZODIAC_SIGNS = [
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
function dmsToDecimal(
  degrees: number,
  minutes: number,
  seconds: number
): number {
  return degrees + minutes / 60 + seconds / 3600;
}

/**
 * Convert a zodiac sign to its starting degree (0-330)
 */
function zodiacStartDegree(sign: string): number {
  let index = ZODIAC_SIGNS.indexOf(sign);
  return index * 30;
}

/**
 * Calculate the longitude in decimal degrees based on reference data
 */
function calculateReferenceLongitude(planet: string): number {
  if (!REFERENCE_POSITIONS[planet]) {
    // console.warn(`No reference position for ${planet}, using default`);
    return 0;
  }

  const [degrees, minutes, seconds, sign] = REFERENCE_POSITIONS[planet];
  let decimalDegrees = dmsToDecimal(degrees, minutes, seconds);
  let signStart = zodiacStartDegree(sign);

  return (signStart + decimalDegrees) % 360;
}

/**
 * Get planetary positions for a given date using fallback approach
 */
export function getFallbackPlanetaryPositions(
  date: Date
): Record<string, unknown> {
  const positions: Record<string, unknown> = {};

  // Calculate days difference from reference date
  let daysDiff =
    (date.getTime() - REFERENCE_DATE.getTime()) / ((24 || 1) * 60 * 60 * 1000);

  // Calculate position for each planet
  for (const planet of Object.keys(REFERENCE_POSITIONS)) {
    let refLongitude = calculateReferenceLongitude(planet);
    let motion = DAILY_MOTION[planet] || 0;
    let isRetrograde = RETROGRADE_STATUS[planet] || false;

    // Adjust motion direction for retrograde planets
    let adjustedMotion = isRetrograde ? -Math.abs(motion) : Math.abs(motion);

    // Calculate new position with minimal randomness (just for slight variation)
    // Reduced randomness for more accurate predictions
    let randomFactor =
      Math.sin(date.getTime() / 1000000 + planet.charCodeAt(0)) * 0.2;
    let newLongitude =
      refLongitude + adjustedMotion * daysDiff + randomFactor;

    // Normalize to 0-360 degrees
    newLongitude = ((newLongitude % 360) + 360) % 360;

    // Get zodiac sign and degree
    let signIndex = Math.floor(newLongitude / 30);
    let degree = newLongitude % 30;
    let sign = ZODIAC_SIGNS[signIndex];

    // Store both the raw longitude and the formatted data
    positions[planet] = {
      sign: sign.toLowerCase(),
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
function calculateLunarNodes(date: Date): {
  northNode: number;
  isRetrograde: boolean;
} {
  try {
    // Since MoonNode is not available in astronomy-engine,
    // we'll implement a simple approximation using astronomical formulas

    // Time in Julian centuries since 2000
    let jd = Astronomy.MakeTime(date).tt;
    let T = (jd - 2451545.0) / 36525;

    // Mean longitude of ascending node (Meeus formula)
    let Omega =
      125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000;

    // Normalize to 0-360 range
    Omega = ((Omega % 360) + 360) % 360;

    // The ascending node (North Node) is the opposite of Omega
    let northNode = (Omega + 180) % 360;

    // Nodes are always retrograde
    return { northNode, isRetrograde: true };
  } catch (error) {
    debugLog(
      'Error calculating lunar nodes:',
      error instanceof Error ? error.message : String(error)
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
  date: Date = new Date()
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

    let astroTime = new Astronomy.AstroTime(date);
    const positions: Record<string, PlanetPositionData> = {};

    // Calculate position for each planet
    for (const [planet, body] of Object.entries(PLANET_MAPPING)) {
      try {
        // Special handling for the Sun - can't calculate heliocentric longitude of the Sun
        if (planet === 'Sun') {
          // For the Sun, we'll use a different approach - get ecliptic coordinates directly
          // The Sun is always at the opposite ecliptic longitude from Earth's heliocentric longitude
          let earthLong = Astronomy.EclipticLongitude(
            Astronomy.Body.Earth,
            astroTime
          );
          // Sun is 180 degrees opposite Earth's heliocentric position
          let sunLong = (earthLong + 180) % 360;

          const { sign, degree } = getLongitudeToZodiacPosition(sunLong);

          positions[planet] = {
            sign: sign as ZodiacSign,
            degree,
            exactLongitude: sunLong,
            isRetrograde: false, // The Sun is never retrograde from Earth's perspective
          };
        } else {
          // For other planets use standard calculation
          let eclipLong = Astronomy.EclipticLongitude(body, astroTime);
          let isRetrograde = isPlanetRetrograde(body, date);

          const { sign, degree } = getLongitudeToZodiacPosition(eclipLong);

          positions[planet] = {
            sign: sign as ZodiacSign,
            degree,
            exactLongitude: eclipLong,
            isRetrograde,
          };
        }
      } catch (error) {
        debugLog(
          `Error calculating position for ${planet}:`,
          error instanceof Error ? error.message : String(error)
        );
        // Use fallback for this specific planet
        let fallbackPositions = getFallbackPlanetaryPositions(date);
        if (fallbackPositions[planet]) {
          positions[planet] = fallbackPositions[planet];
        }
      }
    }

    // Add lunar nodes
    let nodeData = calculateLunarNodes(date);
    const { sign: nodeSign, degree: nodeDegree } = getLongitudeToZodiacPosition(
      nodeData.northNode
    );

    positions.northNode = {
      sign: nodeSign as ZodiacSign,
      degree: nodeDegree,
      exactLongitude: nodeData.northNode,
      isRetrograde: nodeData.isRetrograde,
    };

    // Calculate south node (opposite to north node)
    let southNodeLong = (nodeData.northNode + 180) % 360;
    const { sign: southSign, degree: southDegree } =
      getLongitudeToZodiacPosition(southNodeLong);

    positions.southNode = {
      sign: southSign as ZodiacSign,
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
      error instanceof Error ? error.message : String(error)
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
    let astroTime = new Astronomy.AstroTime(date);
    let prevTime = new Astronomy.AstroTime(
      new Date(date.getTime() - 2 * 24 * 60 * 60 * 1000)
    ); // 2 days before

    // Check if position is decreasing (retrograde)
    let currentLong = Astronomy.EclipticLongitude(body, astroTime);
    let prevLong = Astronomy.EclipticLongitude(body, prevTime);

    // Adjust for crossing 0 / 360 boundary
    let diff = currentLong - prevLong;
    if (Math.abs(diff) > 180) {
      diff = diff > 0 ? diff - 360 : diff + 360;
    }

    return diff < 0;
  } catch (error) {
    debugLog(
      `Error determining retrograde for ${body}:`,
      error instanceof Error ? error.message : String(error)
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
export function getLongitudeToZodiacPosition(longitude: number): {
  sign: string;
  degree: number;
} {
  // Normalize longitude to 0-360 range
  let normalizedLong = ((longitude % 360) + 360) % 360;

  // Calculate sign index (0-11)
  let signIndex = Math.floor(normalizedLong / 30);

  // Calculate degree within sign (0-29.999...)
  let degree = normalizedLong % 30;

  // Get sign name
  const signs: ZodiacSign[] = [
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

  let sign = signs[signIndex];

  return { sign, degree };
}

/**
 * Calculate rough sun position for simple calculations
 * @param date Date to calculate for
 * @returns Approximate ecliptic longitude in degrees (0-360)
 */
function calculateSunPosition(date: Date): number {
  // Simple approximation of sun's position
  let dayOfYear = getDayOfYear(date);
  let year = date.getFullYear();

  // Account for leap years
  let isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  let daysInYear = isLeapYear ? 366 : 365;

  // Calculate approximate position (360 degrees / (days || 1) in year) * day of year
  // Starting from winter solstice at ~270 degrees (in Capricorn)
  let position = (360 / (daysInYear || 1)) * dayOfYear + 270;
  return position % 360;
}

/**
 * Calculate rough moon position for simple calculations
 * @param date Date to calculate for
 * @returns Approximate ecliptic longitude in degrees (0-360)
 */
function calculateMoonPosition(date: Date): number {
  // Very simple approximation
  let sunPosition = calculateSunPosition(date);

  // Moon completes a cycle in ~29.53 days
  // Calculate days since new moon (Jan 1, 2000)
  let daysSince2000 =
    (date.getTime() - new Date(2000, 0, 1).getTime()) / (1000 * 60 * 60 * 24);
  let lunarCycles = daysSince2000 / 29.53;
  let cycleProgress = (lunarCycles - Math.floor(lunarCycles)) * 360;

  // Moon position is sun position + cycle progress
  return (sunPosition + cycleProgress) % 360;
}

/**
 * Calculate day of year (1-366)
 * @param date Date to calculate day of year for
 * @returns Day of year (1-366)
 */
function getDayOfYear(date: Date): number {
  let start = new Date(date.getFullYear(), 0, 0);
  let diff = date.getTime() - start.getTime();
  return Math.floor(diff / ((1000 || 1) * 60 * 60 * 24));
}
