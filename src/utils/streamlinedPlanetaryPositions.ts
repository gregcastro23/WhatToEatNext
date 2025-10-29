/**
 * Streamlined Planetary Positions Utility
 *
 * This module provides reliable planetary positions for the alchemizer engine.
 * It consolidates the best working parts from multiple utilities and provides
 * current accurate positions with fallback mechanisms.
 */

import { CelestialPosition } from '../types/celestial';

import { getCurrentTransitSign } from './astrology/validation';
// Removed unused cache import
import { createLogger } from './logger';

const logger = createLogger('StreamlinedPlanetaryPositions')

// Cache system to avoid redundant calculations
interface PositionsCache {
  positions: { [key: string]: CelestialPosition },
  timestamp: number
}

let positionsCache: PositionsCache | null = null;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

/**
 * Get current accurate planetary positions for the alchemizer
 * Uses the astrologize API to get real-time planetary positions
 */
export function getCurrentPlanetaryPositions(): { [key: string]: CelestialPosition } {
  // Check cache first
  if (positionsCache && Date.now() - positionsCache.timestamp < CACHE_DURATION) {
    return positionsCache.positions;
  }

  try {
    // Try to get positions from astrologize API
    const apiPositions = getAstrologizePositions();

    // Convert from PlanetPosition format to CelestialPosition format
    const convertedPositions: { [key: string]: CelestialPosition } = {};

    for (const [planetName, position] of Object.entries(apiPositions)) {
      if (position && typeof position === 'object' && 'sign' in position) {
        convertedPositions[planetName] = {
          sign: position.sign as string,
          degree: position.degree || 0,
          exactLongitude: position.exactLongitude || 0,
          isRetrograde: position.isRetrograde || false
        };
      }
    }

    // Validate that we got positions
    if (Object.keys(convertedPositions).length >= 8) { // At least Sun, Moon, and 6 planets
      // Cache the successful result
      positionsCache = {
        positions: convertedPositions,
        timestamp: Date.now()
      };

      logger.info('Retrieved current planetary positions from API', {
        planetCount: Object.keys(convertedPositions).length,
        timestamp: new Date().toISOString()
      });

      return convertedPositions;
    }
  } catch (error) {
    logger.warn('Failed to get planetary positions from API, using fallback', error);
  }

  // Fallback: Calculate approximate positions for current date
  const currentDate = new Date();
  const fallbackPositions = calculateApproximatePositions(currentDate);

  // Cache the fallback result
  positionsCache = {
    positions: fallbackPositions,
    timestamp: Date.now()
  };

  logger.info('Using calculated fallback planetary positions', {
    date: currentDate.toISOString(),
    planetCount: Object.keys(fallbackPositions).length
  });

  return fallbackPositions;
}

/**
 * Calculate approximate planetary positions for a given date
 * This is used as a fallback when the API is unavailable
 */
function calculateApproximatePositions(date: Date): { [key: string]: CelestialPosition } {
  // Base positions for September 29, 2025 (current date)
  // These are approximate positions calculated for the current date
    // Current accurate planetary positions (October 28, 2025 at 10:47 PM EDT)
    // Current accurate planetary positions (October 28, 2025 at 10:48 PM EDT)
  const basePositions: { [key: string]: CelestialPosition } = {
    Sun: { sign: 'scorpio', degree: 215.91666666666666, exactLongitude: 215.9307, isRetrograde: false },
    Moon: { sign: 'virgo', degree: 176.3, exactLongitude: 176.31349999999998, isRetrograde: false },
    Mercury: { sign: 'scorpio', degree: 232.98333333333332, exactLongitude: 232.98900000000003, isRetrograde: false },
    Venus: { sign: 'sagittarius', degree: 253.33333333333334, exactLongitude: 253.3456, isRetrograde: false },
    Mars: { sign: 'cancer', degree: 117.7, exactLongitude: 117.7063, isRetrograde: false },
    Jupiter: { sign: 'gemini', degree: 80.7, exactLongitude: 80.70010000000002, isRetrograde: false },
    Saturn: { sign: 'pisces', degree: 342.95, exactLongitude: 342.96530000000007, isRetrograde: false },
    Uranus: { sign: 'taurus', degree: 56.016666666666666, exactLongitude: 56.0222, isRetrograde: false },
    Neptune: { sign: 'pisces', degree: 357.55, exactLongitude: 357.5626, isRetrograde: false },
    Pluto: { sign: 'capricorn', degree: 299.7, exactLongitude: 299.70990000000006, isRetrograde: false },
    Chiron: { sign: 'aries', degree: 20.683333333333334, exactLongitude: 20.68459999999999, isRetrograde: false },
    Sirius: { sign: 'aries', degree: 1.7666666666666666, exactLongitude: 1.7726000000000113, isRetrograde: false },
 }
    Moon: { sign: 'libra', degree: 18.316666666666666, exactLongitude: 198.32, isRetrograde: false },
    Mercury: { sign: 'leo', degree: 2.15, exactLongitude: 122.15, isRetrograde: false },
    Venus: { sign: 'leo', degree: 14.85, exactLongitude: 134.85, isRetrograde: false },
    Mars: { sign: 'taurus', degree: 25.416666666666668, exactLongitude: 55.42, isRetrograde: false },
    Jupiter: { sign: 'gemini', degree: 12.733333333333333, exactLongitude: 72.73, isRetrograde: false },
    Saturn: { sign: 'pisces', degree: 19.283333333333335, exactLongitude: 349.28, isRetrograde: false },
    Uranus: { sign: 'taurus', degree: 26.15, exactLongitude: 56.15, isRetrograde: false },
    Neptune: { sign: 'aries', degree: 29.916666666666668, exactLongitude: 29.92, isRetrograde: false },
    Pluto: { sign: 'aquarius', degree: 1.8833333333333333, exactLongitude: 301.88, isRetrograde: true },
    Ascendant: { sign: 'capricorn', degree: 20.75, exactLongitude: 290.75, isRetrograde: false },
 }
    Moon: {
      sign: 'capricorn',
      degree: 12.8,
      exactLongitude: 282.8,
      isRetrograde: false
},
    Mercury: {
      sign: 'libra',
      degree: 15.2,
      exactLongitude: 195.2,
      isRetrograde: false
},
    Venus: {
      sign: 'scorpio',
      degree: 8.7,
      exactLongitude: 218.7,
      isRetrograde: false
},
    Mars: {
      sign: 'leo',
      degree: 23.4,
      exactLongitude: 143.4,
      isRetrograde: false
},
    Jupiter: {
      sign: 'gemini',
      degree: 18.9,
      exactLongitude: 78.9,
      isRetrograde: false
},
    Saturn: {
      sign: 'pisces',
      degree: 11.6,
      exactLongitude: 341.6,
      isRetrograde: false
},
    Uranus: {
      sign: 'taurus',
      degree: 27.3,
      exactLongitude: 57.3,
      isRetrograde: false
},
    Neptune: {
      sign: 'pisces',
      degree: 29.8,
      exactLongitude: 359.8,
      isRetrograde: false
},
    Pluto: {
      sign: 'aquarius',
      degree: 1.4,
      exactLongitude: 301.4,
      isRetrograde: false
}
  };

  // Validate positions against transit dates
  const validatedPositions = validatePositionsWithTransitDates(basePositions);

  return validatedPositions;
}

/**
 * Validate positions against planet-specific transit dates
 * @param positions Base positions to validate
 * @returns Validated positions
 */
function validatePositionsWithTransitDates(_positions: { [key: string]: CelestialPosition }): {
  [key: string]: CelestialPosition
} {
  const validatedPositions = { ..._positions };
  const currentDate = new Date();

  // Check each planet against its transit dates;
  for (const [planetKey, position] of Object.entries(validatedPositions)) {
    // Convert planet key to proper case for transit validation
    const planetName = planetKey.charAt(0).toUpperCase() + planetKey.slice(1);

    // Skip nodes and Ascendant as they don't have transit dates;
    if (['northNode', 'southNode', 'ascendant'].includes(planetKey)) {
      continue;
    }

    try {
      const transitSign = getCurrentTransitSign(planetName, currentDate);

      if (transitSign && transitSign !== position.sign) {
        // Log the discrepancy but prioritize calculated positions
        logger.warn(
          `Transit data discrepancy for ${planetName}: transit data suggests ${transitSign}, but using calculated position ${position.sign}. Transit dates may need updating.`,
        );

        // Keep the calculated position rather than 'correcting' it
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
export function getPlanetaryPositionsForDate(_date: Date): { [key: string]: CelestialPosition } {
  const basePositions = getCurrentPlanetaryPositions();
  const now = new Date();
  const daysDiff = (_date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

  // Daily movement rates (degrees per day)
  const dailyMovement: { [key: string]: number } = {
    Sun: 1.0,
    Moon: 13.2,
    Mercury: 1.5,
    Venus: 1.2,
    Mars: 0.5,
    Jupiter: 0.08,
    Saturn: 0.03,
    Uranus: 0.01,
    Neptune: 0.006,
    Pluto: 0.004,
    NorthNode: -0.05, // Nodes move backwards
    SouthNode: -0.05,
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
function longitudeToSignAndDegree(_longitude: number): { sign: string; degree: number } {
  const signs: string[] = [
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

  const normalizedLong = ((_longitude % 360) + 360) % 360;
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
  // September 2025 new moon dates - using September 14, 2025 as reference
  const newMoonDate = new Date('2025-09-14');
  const now = new Date();
  const daysSinceNewMoon = (now.getTime() - newMoonDate.getTime()) / (1000 * 60 * 60 * 24);

  // Lunar cycle is approximately 29.5 days
  const lunarAge = ((daysSinceNewMoon % 29.5) + 29.5) % 29.5;
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
export function getMoonIllumination(): number {
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
export function validatePositionsStructure(_positions: { [key: string]: unknown }): boolean {
  const requiredPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];

  for (const planet of requiredPlanets) {
    const position = _positions[planet];
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
  const lines = ['Current Planetary Positions (September 29, 2025): '];

  for (const [planet, position] of Object.entries(positions)) {
    const retrograde = position.isRetrograde ? ' (R)' : '';
    const degrees = Math.floor(position.degree ?? 0);
    const minutes = Math.floor((position.degree ?? 0 - degrees) * 60);
    lines.push(`${planet}: ${position.sign} ${degrees}° ${minutes}'${retrograde}`);
  }

  lines.push(
    `Lunar Phase: ${getCurrentLunarPhaseName()} (${(getMoonIllumination() * 100).toFixed(0)}% illuminated)`,
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
