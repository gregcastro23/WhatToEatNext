/**
 * Streamlined Planetary Positions Utility
 *
 * This module provides reliable planetary positions for the alchemizer engine.
 * It consolidates the best working parts from multiple utilities and provides
 * current accurate positions with fallback mechanisms.
 */

import { ZodiacSign } from '../types';
import { CelestialPosition } from '../types/celestial';

import { getCurrentTransitSign } from './astrology/validation';
// Removed unused cache import
import { createLogger } from './logger';

const logger = createLogger('StreamlinedPlanetaryPositions');

// Cache system to avoid redundant calculations
interface PositionsCache {
  positions: { [key: string]: CelestialPosition };
  timestamp: number;
}

let positionsCache: PositionsCache | null = null;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

/**
 * Get current accurate planetary positions for the alchemizer
 * Uses the most current accurate positions (May 25, 2025) with transit validation
 */
export function getCurrentPlanetaryPositions(): { [key: string]: CelestialPosition } {
  // Check cache first
  if (positionsCache && Date.now() - positionsCache.timestamp < CACHE_DURATION) {
    return positionsCache.positions;
  }

  // Current accurate planetary positions (May 25, 2025)
  // Current accurate planetary positions (July 2, 2025 at 11:11 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:11 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:11 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:11 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:11 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:11 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:11 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:11 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:11 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:11 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:11 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:15 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:15 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:15 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:16 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:17 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:19 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:19 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:20 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:20 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:20 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:20 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:20 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:20 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:20 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:20 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:20 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:20 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:20 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:20 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:20 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:20 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:20 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:20 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:20 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:20 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:20 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:20 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:20 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:20 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:20 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:20 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:20 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:20 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:21 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:21 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:21 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:21 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:21 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:21 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:21 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:23 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:36 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:36 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:36 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:36 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:36 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:36 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:36 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:36 PM EDT)
  // Current accurate planetary positions (July 2, 2025 at 11:36 PM EDT)
  const basePositions: { [key: string]: CelestialPosition } = {
    Sun: {
      sign: 'cancer',
      degree: 101.48333333333333,
      exactLongitude: 101.4844,
      isRetrograde: false
    },
    Moon: {
      sign: 'libra',
      degree: 195.16666666666666,
      exactLongitude: 195.18319999999994,
      isRetrograde: false
    },
    Mercury: {
      sign: 'leo',
      degree: 127.38333333333334,
      exactLongitude: 127.38920000000002,
      isRetrograde: false
    },
    Venus: {
      sign: 'taurus',
      degree: 58.35,
      exactLongitude: 58.35340000000002,
      isRetrograde: false
    },
    Mars: { sign: 'virgo', degree: 159, exactLongitude: 159.0158, isRetrograde: false },
    Jupiter: {
      sign: 'cancer',
      degree: 95.3,
      exactLongitude: 95.30540000000002,
      isRetrograde: false
    },
    Saturn: {
      sign: 'aries',
      degree: 1.85,
      exactLongitude: 1.8501999999999725,
      isRetrograde: false
    },
    Uranus: { sign: 'taurus', degree: 59.8, exactLongitude: 59.8091, isRetrograde: false },
    Neptune: {
      sign: 'aries',
      degree: 2.1666666666666665,
      exactLongitude: 2.174699999999973,
      isRetrograde: false
    },
    Pluto: {
      sign: 'aquarius',
      degree: 303.0833333333333,
      exactLongitude: 303.09529999999995,
      isRetrograde: false
    },
    Chiron: {
      sign: 'aries',
      degree: 26.933333333333334,
      exactLongitude: 26.939399999999978,
      isRetrograde: false
    },
    Sirius: {
      sign: 'aries',
      degree: 1.7666666666666666,
      exactLongitude: 1.7726000000000113,
      isRetrograde: false
    }
  };

  // Validate positions against transit dates
  const validatedPositions = validatePositionsWithTransitDates(basePositions);

  // Cache the positions
  positionsCache = {;
    positions: validatedPositions,
    timestamp: Date.now()
  };

  logger.info('Updated planetary positions cache with transit validation', {
    sunSign: validatedPositions.Sun.sign,
    moonSign: validatedPositions.moon.sign,
    timestamp: new Date().toISOString()
  });

  return validatedPositions;
}

/**
 * Validate positions against planet-specific transit dates
 * @param positions Base positions to validate
 * @returns Validated positions
 */
function validatePositionsWithTransitDates(positions: { [key: string]: CelestialPosition }): {
  [key: string]: CelestialPosition;
} {
  const validatedPositions = { ...positions };
  const currentDate = new Date();

  // Check each planet against its transit dates
  for (const [planetKey, position] of Object.entries(validatedPositions)) {
    // Convert planet key to proper case for transit validation
    const planetName = planetKey.charAt(0).toUpperCase() + planetKey.slice(1);

    // Skip nodes and Ascendant as they don't have transit dates
    if (['northNode', 'southNode', 'ascendant'].includes(planetKey)) {
      continue;
    }

    try {
      const transitSign = getCurrentTransitSign(planetName, currentDate);

      if (transitSign && transitSign !== position.sign) {
        // Log the discrepancy but prioritize user's accurate positions
        logger.warn(
          `Transit data discrepancy for ${planetName}: transit data suggests ${transitSign}, but using accurate position ${position.sign}. Transit dates may need updating.`,
        );

        // Keep the user's accurate position rather than 'correcting' it
        // This ensures we use the most accurate current data
      }
    } catch (error) {
      logger.warn(`Error validating transit for ${planetName}:`, error);
      // Keep original position if validation fails
    }
  }

  return validatedPositions;
}

/**
 * Get planetary positions adjusted for a specific date
 * Uses daily movement rates to approximate positions
 */
export function getPlanetaryPositionsForDate(date: Date): { [key: string]: CelestialPosition } {
  const basePositions = getCurrentPlanetaryPositions();
  const now = new Date();
  const daysDiff = (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

  // Daily movement rates (degrees per day)
  const dailyMovement: { [key: string]: number } = {
    Sun: 1.0,
    moon: 13.2,
    Mercury: 1.5,
    Venus: 1.2,
    Mars: 0.5,
    Jupiter: 0.08,
    Saturn: 0.03,
    Uranus: 0.01,
    Neptune: 0.006,
    Pluto: 0.004,
    NorthNode: -0.05, // Nodes move backwards
    southNode: -0.05,
    Ascendant: 1.0, // Approximation
  };

  const adjustedPositions: { [key: string]: CelestialPosition } = {};

  for (const [planet, position] of Object.entries(basePositions)) {
    const movement = dailyMovement[planet] || 0;
    let adjustedLongitude = position.exactLongitude ?? 0;

    // Apply movement (retrograde planets move backwards)
    if (position.isRetrograde) {
      adjustedLongitude -= movement * daysDiff;
    } else {
      adjustedLongitude += movement * daysDiff;
    }

    // Normalize to 0-360 range
    adjustedLongitude = ((adjustedLongitude % 360) + 360) % 360;

    // Convert back to sign and degree
    const { sign, degree } = longitudeToSignAndDegree(adjustedLongitude);

    adjustedPositions[planet] = {
      sign,
      degree,
      exactLongitude: adjustedLongitude,
      isRetrograde: position.isRetrograde
    };
  }

  return adjustedPositions;
}

/**
 * Convert longitude to zodiac sign and degree
 */
function longitudeToSignAndDegree(longitude: number): { sign: any; degree: number } {
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
    'pisces'
  ];

  const normalizedLong = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalizedLong / 30);
  const degree = normalizedLong % 30;

  return {
    sign: signs[signIndex],
    degree: parseFloat(degree.toFixed(2))
  };
}

/**
 * Get the current lunar phase as a number (0-29.5 days)
 */
export function getCurrentLunarPhase(): number {
  // Calculate approximate lunar age based on known new Moon
  // May 30, 2025 has a new Moon
  const newmoonDate = new Date('2025-05-30');
  const now = new Date();
  const daysSinceNewmoon = (now.getTime() - newmoonDate.getTime()) / (1000 * 60 * 60 * 24);

  // Lunar cycle is approximately 29.5 days
  const lunarAge = ((daysSinceNewmoon % 29.5) + 29.5) % 29.5;
  return lunarAge;
}

/**
 * Get the name of the current lunar phase
 */
export function getCurrentLunarPhaseName(): string {
  const phase = getCurrentLunarPhase();

  if (phase < 1) return 'new moon';
  if (phase < 7.4) return 'waxing crescent';
  if (phase < 8.4) return 'first quarter';
  if (phase < 14.8) return 'waxing gibbous';
  if (phase < 15.8) return 'full moon';
  if (phase < 22.1) return 'waning gibbous';
  if (phase < 23.1) return 'last quarter';
  return 'waning crescent';
}

/**
 * Get Moon illumination percentage (0-1)
 */
export function getmoonIllumination(): number {
  const phase = getCurrentLunarPhase();

  if (phase <= 14.8) {
    // Waxing from new to full
    return phase / 14.8;
  } else {
    // Waning from full to new
    return (29.5 - phase) / 14.8;
  }
}

/**
 * Validate that planetary positions have the required structure
 */
export function validatePositionsStructure(positions: { [key: string]: unknown }): boolean {
  const requiredPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];

  for (const planet of requiredPlanets) {
    const position = positions[planet];
    if (!position || typeof position !== 'object') {
      logger.warn(`Missing or invalid position for ${planet}`);
      return false;
    }

    const pos = position as any;
    if (!pos.sign || typeof pos.degree !== 'number') {
      logger.warn(`Invalid position structure for ${planet}`, pos);
      return false;
    }
  }

  return true;
}

/**
 * Get a summary of current planetary positions for logging/debugging
 */
export function getPositionsSummary(): string {
  const positions = getCurrentPlanetaryPositions();
  const lines = ['Current Planetary Positions (May 25, 2025):'];

  for (const [planet, position] of Object.entries(positions)) {
    const retrograde = position.isRetrograde ? ' (R)' : '';
    const degrees = Math.floor(position.degree ?? 0);
    const minutes = Math.floor((position.degree ?? 0 - degrees) * 60);
    lines.push(`${planet}: ${position.sign} ${degrees}° ${minutes}'${retrograde}`);
  }

  lines.push(
    `Lunar Phase: ${getCurrentLunarPhaseName()} (${(getmoonIllumination() * 100).toFixed(0)}% illuminated)`,
  );

  return lines.join('\n');
}

/**
 * Clear the positions cache (useful for testing or forced refresh)
 */
export function clearPositionsCache(): void {
  positionsCache = null;
  logger.info('Planetary positions cache cleared');
}
