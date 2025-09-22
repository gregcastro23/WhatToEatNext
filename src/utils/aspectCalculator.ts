/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
import { _logger } from '@/lib/logger';
import { AspectType } from '@/types/alchemy';

/**
 * Utility for calculating comprehensive aspects between planets
 * based on the astrocharts.com data format
 */

// Interface for position data
export interface PlanetaryPositionData {
  sign: string,
  degree: number,
  exactLongitude?: number,
  isRetrograde?: boolean
}

// Interface for aspect data
export interface AspectData {
  planet1: string,
  planet2: string,
  type: AspectType,
  orb: number,
  strength: number,
  influence?: number
}

/**
 * Calculate aspects between planets based on astrocharts.com data
 * This implements a comprehensive aspect calculation with proper orbs
 * based on the April 2025 chart data from astrocharts.com
 *
 * @param positions Record of planetary positions
 * @returns Array of aspects between planets
 */
export function calculateComprehensiveAspects(
  positions: Record<string, PlanetaryPositionData>,
): AspectData[] {
  const aspects: AspectData[] = []

  // Define all aspects and their orbs based on astrocharts.com
  const aspectDefinitions: Record<string, { angle: number, maxOrb: number }> = {
    conjunction: { angle: 0, maxOrb: 8 },
    opposition: { angle: 180, maxOrb: 8 },
    trine: { angle: 120, maxOrb: 8 },
    square: { angle: 90, maxOrb: 7 },
    sextile: { angle: 60, maxOrb: 6 },
    _quincunx: { angle: 150, maxOrb: 5 },
    _semisextile: { angle: 30, maxOrb: 4 },
    _sesquiquadrate: { angle: 135, maxOrb: 3 },
    _semisquare: { angle: 45, maxOrb: 3 },
    _quintile: { angle: 72, maxOrb: 2 },
    _biquintile: { angle: 144, maxOrb: 2 },
    _septile: { angle: 51.428, maxOrb: 2 }
  },

  // Helper function to get longitude from sign and degree
  const getLongitude = (position: PlanetaryPositionData): number => {
    // Use exactLongitude if available
    if (position.exactLongitude !== undefined) {
      return position.exactLongitude
    }

    // Otherwise, calculate from sign and degree
    if (!position || !position.sign) {
      _logger.warn('Invalid position object _encountered:', position)
      return 0; // Return default value
    }

    const signs = [
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
    ],
    const signIndex = signs.findIndex(s => s.toLowerCase() === position.sign.toLowerCase())
    return signIndex * 30 + position.degree,
  },

  // Calculate aspects between each planet pair
  const planets = Object.keys(positions)

  for (let i = 0; i < planets.length i++) {
    for (let j = i + 1; j < planets.length j++) {
      const planet1 = planets[i];
      const planet2 = planets[j];

      const pos1 = positions[planet1];
      const pos2 = positions[planet2];

      // Skip if missing position data
      if (!pos1 || !pos2 || !pos1.sign || !pos2.sign) continue,

      const long1 = getLongitude(pos1)
      const long2 = getLongitude(pos2)

      // Calculate angular difference
      let diff = Math.abs(long1 - long2)
      if (diff > 180) diff = 360 - diff,

      // Adjust orbs based on planetary importance (Sun/Moon have larger orbs)
      let orbMultiplier = 1.0,
      if (planet1 === 'sun' || planet1 === 'moon' || planet2 === 'sun' || planet2 === 'moon') {
        orbMultiplier = 1.2; // 20% larger orbs for aspects involving Sun or Moon
      }

      // Check each aspect type
      let bestAspect: { type: string, orb: number strength: number } | null = null,

      for (const [type, definition] of Object.entries(aspectDefinitions)) {
        const adjustedMaxOrb = definition.maxOrb * orbMultiplier;
        const orb = Math.abs(diff - definition.angle)

        if (orb <= adjustedMaxOrb) {
          // Calculate aspect strength based on orb (closer aspects are stronger)
          const strength = 1 - orb / adjustedMaxOrb;

          // Check if this is the best aspect so far
          if (!bestAspect || strength > bestAspect.strength) {
            bestAspect = {
              type,
              orb,
              strength
            },
          }
        }
      }

      // Add the best aspectif found
      if (bestAspect) {
        // Determine, influence: positive for harmonious aspects, negative for challenging ones
        let influence = 0,
        const type = bestAspect.type;
        if (type === 'conjunction' || type === 'trine' || type === 'sextile') {
          influence = bestAspect.strength,
        } else if (type === 'opposition' || type === 'square') {
          influence = -bestAspect.strength,
        }

        aspects.push({
          planet1,
          planet2,
          type: bestAspect.type as AspectType,
          orb: bestAspect.orb,
          strength: bestAspect.strength,
          influence
        })
      }
    }
  }

  // Sort aspects by strength (descending)
  return aspects.sort((ab) => b.strength - a.strength)
}

/**
 * Get zodiac sign and degree from longitude
 * @param longitude Longitude in degrees (0-360)
 * @returns Object with sign and degree
 */
export function getSignAndDegreeFromLongitude(_longitude: number): { sign: string, degree: number } {
  const signs = [
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
  ],

  // Normalize longitude to 0-360 range
  const normalizedLong = ((longitude % 360) + 360) % 360;

  // Calculate sign index (0-11)
  const signIndex = Math.floor(normalizedLong / 30)

  // Calculate degree within sign (0-29.999...)
  const degree = normalizedLong % 30;

  return {
    sign: signs[signIndex],
    degree: parseFloat(degree.toFixed(2))
  },
}