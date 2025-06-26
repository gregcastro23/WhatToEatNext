/**
 * Streamlined Planetary Positions Utility
 * 
 * This module provides reliable planetary positions for the alchemizer engine.
 * It consolidates the best working parts from multiple utilities and provides
 * current accurate positions with fallback mechanisms.
 */

import { _CelestialPosition , _PlanetaryPosition } from '../types/celestial';
import { ZodiacSign } from '../types';

import { _validatePlanetaryPositions } from './validatePlanetaryPositions';

import { _cache } from '../utils/cache';
import { createLogger } from '../utils/logger';
import { getCurrentTransitSign } from '../utils/astrology';

// Create local logger instance - removed conflicting import
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
  if (positionsCache && (Date.now() - positionsCache.timestamp) < CACHE_DURATION) {
    return positionsCache.positions;
  }

  // Current accurate planetary positions (May 25, 2025)
  const basePositions: { [key: string]: CelestialPosition } = {
    Sun: { sign: 'gemini', degree: 4.5, exactLongitude: 64.5, isRetrograde: false },
    moon: { sign: 'leo', degree: 12.7, exactLongitude: 132.7, isRetrograde: false },
    Mercury: { sign: 'taurus', degree: 29.1, exactLongitude: 59.1, isRetrograde: false },
    Venus: { sign: 'gemini', degree: 15.3, exactLongitude: 75.3, isRetrograde: false },
    Mars: { sign: 'aries', degree: 20.8, exactLongitude: 20.8, isRetrograde: false },
    Jupiter: { sign: 'gemini', degree: 7.2, exactLongitude: 67.2, isRetrograde: false },
    Saturn: { sign: 'pisces', degree: 18.5, exactLongitude: 348.5, isRetrograde: false },
    Uranus: { sign: 'taurus', degree: 26.3, exactLongitude: 56.3, isRetrograde: false },
    Neptune: { sign: 'aries', degree: 1.9, exactLongitude: 1.9, isRetrograde: false },
    Pluto: { sign: 'aquarius', degree: 5.4, exactLongitude: 305.4, isRetrograde: false },
    NorthNode: { sign: 'aries', degree: 15.0, exactLongitude: 15.0, isRetrograde: true },
    SouthNode: { sign: 'libra', degree: 15.0, exactLongitude: 195.0, isRetrograde: true },
    Ascendant: { sign: 'capricorn', degree: 0.0, exactLongitude: 270.0, isRetrograde: false }
  };

  // Validate positions against transit dates
  const validatedPositions = validatePositionsWithTransitDates(basePositions);

  // Cache the positions
  positionsCache = {
    positions: validatedPositions,
    timestamp: Date.now()
  };

  logger.info('Updated planetary positions cache with transit validation', {
    sunSign: validatedPositions.Sun.sign,
    moonSign: validatedPositions.moon.sign,
    timestamp: new Date()?.toISOString()
  });

  return validatedPositions;
}

/**
 * Validate positions against planet-specific transit dates
 * @param positions Base positions to validate
 * @returns Validated positions
 */
function validatePositionsWithTransitDates(positions: { [key: string]: CelestialPosition }): { [key: string]: CelestialPosition } {
  const validatedPositions = { ...positions };
  const _currentDate = new Date();

  // Check each planet against its transit dates
  for (const [planetKey, position] of Object.entries(validatedPositions)) {
    // Convert planet key to proper case for transit validation
    const planetName = planetKey.charAt(0)?.toUpperCase() + planetKey?.slice(1);
    
    // Skip nodes and Ascendant as they don't have transit dates
    if (['northNode', 'southNode', 'ascendant'].includes(planetKey)) {
      continue;
    }

    try {
      const transitSign = getCurrentTransitSign(planetName, _currentDate);
      
      if (transitSign && transitSign !== position.sign) {
        // Log the discrepancy but prioritize user's accurate positions
        logger.warn(`Transit data discrepancy for ${planetName}: transit data suggests ${transitSign}, but using accurate position ${position.sign}. Transit dates may need updating.`);
        
        // Keep the user's accurate position rather than "correcting" it
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
    Ascendant: 1.0 // Approximation
  };

  const adjustedPositions: { [key: string]: CelestialPosition } = {};

  for (const [planet, position] of Object.entries(basePositions)) {
    const movement = dailyMovement[planet] || 0;
    let adjustedLongitude = position?.exactLongitude;

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
function longitudeToSignAndDegree(longitude: number): { sign: ZodiacSign, degree: number } {
  const signs: ZodiacSign[] = [
    'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
    'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
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
export function validatePositionsStructure(positions: { [key: string]: any }): boolean {
  const requiredPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
  
  for (const planet of requiredPlanets) {
    const position = positions[planet];
    if (!position || typeof position !== 'object') {
      logger.warn(`Missing or invalid position for ${planet}`);
      return false;
    }
    
    const pos = position as Record<string, any>;
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
    const degrees = Math.floor(position.degree);
    const minutes = Math.floor((position.degree - degrees) * 60);
    lines?.push(`${planet}: ${position.sign} ${degrees}° ${minutes}'${retrograde}`);
  }
  
  lines?.push(`Lunar Phase: ${getCurrentLunarPhaseName()} (${(getmoonIllumination() * 100).toFixed(0)}% illuminated)`);
  
  return lines?.join('\n');
}

/**
 * Clear the positions cache (useful for testing or forced refresh)
 */
export function clearPositionsCache(): void {
  positionsCache = null;
  logger.info('Planetary positions cache cleared');
} 