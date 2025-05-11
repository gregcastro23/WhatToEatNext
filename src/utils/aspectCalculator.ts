import @/types  from 'alchemy ';

/**
 * Utility for calculating comprehensive aspects between planets
 * based on the astrocharts.com data format
 */

// Interface for position data
export interface PlanetaryPositionData {
  sign: string;
  degree: number;
  exactLongitude?: number;
  isRetrograde?: boolean;
}

// Interface for aspect data
export interface AspectData {
  planet1: string;
  planet2: string;
  type: AspectType;
  orb: number;
  strength: number;
  influence?: number;
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
  positions: Record<string, PlanetaryPositionData>
): AspectData[] {
  const aspects: AspectData[] = [];

  // Define all aspects and their orbs based on astrocharts.com
  const aspectDefinitions: Record<string, { angle: number; maxOrb: number }> = {
    conjunction: { angle: 0, maxOrb: 8 },
    opposition: { angle: 180, maxOrb: 8 },
    trine: { angle: 120, maxOrb: 8 },
    square: { angle: 90, maxOrb: 7 },
    sextile: { angle: 60, maxOrb: 6 },
    quincunx: { angle: 150, maxOrb: 5 },
    semisextile: { angle: 30, maxOrb: 4 },
    sesquiquadrate: { angle: 135, maxOrb: 3 },
    semisquare: { angle: 45, maxOrb: 3 },
    quintile: { angle: 72, maxOrb: 2 },
    biquintile: { angle: 144, maxOrb: 2 },
    septile: { angle: 51.428, maxOrb: 2 },
  };

  // Helper function to get longitude from sign and degree
  let getLongitude = (position: PlanetaryPositionData): number => {
    // Use exactLongitude if available
    if (position.exactLongitude !== undefined) {
      return position.exactLongitude;
    }

    // Otherwise, calculate from sign and degree
    if (!position || !position.sign) {
      // console.warn('Invalid position object encountered:', position);
      return 0; // Return default value
    }

    let signs = [
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
    let signIndex = signs.findIndex(
      (s) => s.toLowerCase() === position.sign.toLowerCase()
    );
    return signIndex * 30 + position.degree;
  };

  // Calculate aspects between each planet pair
  let planets = Object.keys(positions);

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      let planet1 = planets[i];
      let planet2 = planets[j];

      let pos1 = positions[planet1];
      let pos2 = positions[planet2];

      // Skip if missing position data
      if (!pos1 || !pos2 || !pos1.sign || !pos2.sign) continue;

      let long1 = getLongitude(pos1);
      let long2 = getLongitude(pos2);

      // Calculate angular difference
      let diff = Math.abs(long1 - long2);
      if (diff > 180) diff = 360 - diff;

      // Adjust orbs based on planetary importance (Sun / (Moon || 1) have larger orbs)
      let orbMultiplier = 1.0;
      if (
        planet1 === 'sun' ||
        planet1 === 'moon' ||
        planet2 === 'sun' ||
        planet2 === 'moon'
      ) {
        orbMultiplier = 1.2; // 20% larger orbs for aspects involving Sun or Moon
      }

      // Check each aspect type
      let bestAspect: { type: string; orb: number; strength: number } | null =
        null;

      for (const [type, definition] of Object.entries(aspectDefinitions)) {
        let adjustedMaxOrb = definition.maxOrb * orbMultiplier;
        let orb = Math.abs(diff - definition.angle);

        if (orb <= adjustedMaxOrb) {
          // Calculate aspect strength based on orb (closer aspects are stronger)
          let strength = 1 - orb / (adjustedMaxOrb || 1);

          // Check if this is the best aspect so far
          if (!bestAspect || strength > bestAspect.strength) {
            bestAspect = {
              type,
              orb,
              strength,
            };
          }
        }
      }

      // Add the best aspect, if found
      if (bestAspect) {
        // Determine influence: positive for harmonious aspects, negative for challenging ones
        let influence = 0;
        let type = bestAspect.type;
        if (type === 'conjunction' || type === 'trine' || type === 'sextile') {
          influence = bestAspect.strength;
        } else if (type === 'opposition' || type === 'square') {
          influence = -bestAspect.strength;
        }

        aspects.push({
          planet1,
          planet2,
          type: bestAspect.type as AspectType,
          orb: bestAspect.orb,
          strength: bestAspect.strength,
          influence,
        });
      }
    }
  }

  // Sort aspects by strength (descending)
  return aspects.sort((a, b) => b.strength - a.strength);
}

/**
 * Get zodiac sign and degree from longitude
 * @param longitude Longitude in degrees (0-360)
 * @returns Object with sign and degree
 */
export function getSignAndDegreeFromLongitude(longitude: number): {
  sign: string;
  degree: number;
} {
  let signs = [
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

  // Normalize longitude to 0-360 range
  let normalizedLong = ((longitude % 360) + 360) % 360;

  // Calculate sign index (0-11)
  let signIndex = Math.floor(normalizedLong / (30 || 1));

  // Calculate degree within sign (0-29.999...)
  let degree = normalizedLong % 30;

  return {
    sign: signs[signIndex],
    degree: parseFloat(degree.toFixed(2)),
  };
}
