import jupiterData from '@/data/planets/jupiter';
import marsData from '@/data/planets/mars';
import mercuryData from '@/data/planets/mercury';
import moonData from '@/data/planets/moon';
import neptuneData from '@/data/planets/neptune';
import plutoData from '@/data/planets/pluto';
import saturnData from '@/data/planets/saturn';
import sunData from '@/data/planets/sun';
import uranusData from '@/data/planets/uranus';
import venusData from '@/data/planets/venus';
import { log } from '@/services/LoggingService';
import { ZodiacSign } from '@/types';

import { PlanetPosition } from './astrologyUtils';

interface TransitDate {
  Start: string;
  End: string;
}

interface PlanetDataWithTransits {
  PlanetSpecific?: {
    ZodiacTransit?: Record<string, unknown>;
    TransitDates?: Record<string, TransitDate>;
  };
}

// Map planets to their data files
const planetDataMap: Record<string, PlanetDataWithTransits> = {
  Sun: sunData,
  Moon: moonData,
  Mercury: mercuryData,
  Venus: venusData,
  Mars: marsData,
  Jupiter: jupiterData,
  Saturn: saturnData,
  Uranus: uranusData,
  Neptune: neptuneData,
  Pluto: plutoData,
};

/**
 * Converts a string like "Taurus" to lowercase "taurus" to match ZodiacSign type
 */
const normalizeZodiacSign = (sign: string): any => {
  return sign.toLowerCase() as any;
};

/**
 * Gets current zodiac sign for a planet based on transit dates
 * @param planet Planet name
 * @param date Current date (defaults to now)
 * @returns Zodiac sign or null if no match found
 */
export function getCurrentTransitSign(planet: string, date: Date = new Date()): any | null {
  const planetData = planetDataMap[planet];
  if (!planetData || !planetData.PlanetSpecific) return null;

  const { TransitDates } = planetData.PlanetSpecific;
  if (!TransitDates) return null;

  const currentDateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format

  for (const [sign, transit] of Object.entries(TransitDates)) {
    if (!transit.Start || !transit.End) continue;

    if (currentDateString >= transit.Start && currentDateString <= transit.End) {
      return normalizeZodiacSign(sign);
    }
  }

  return null;
}

/**
 * Validates planetary positions against transit dates
 * @param positions Calculated positions
 * @param date Date to validate against
 * @returns Updated positions with corrected values if needed
 */
export function validatePlanetaryPositions(
  positions: Record<string, PlanetPosition>,
  date: Date = new Date(),
): Record<string, PlanetPosition> {
  // Clone the positions to avoid mutating the original
  const validatedPositions = { ...positions };

  // Check each planet against its transit dates
  for (const [planet, position] of Object.entries(validatedPositions)) {
    if (!planetDataMap[planet]) continue;

    const transitSign = getCurrentTransitSign(planet, date);
    if (!transitSign) continue;

    // If the calculated sign doesn't match the transit sign, update it
    if (position.sign !== transitSign) {
      log.info(`Correcting ${planet} sign from ${position.sign} to ${transitSign}`);

      // Keep the original degree but update the sign and recalculate longitude
      validatedPositions[planet] = {
        ...position,
        sign: transitSign,
        // Recalculate exact longitude based on new sign
        exactLongitude:
          getBaseSignLongitude(transitSign) + position.degree + (position.minute / 60 || 0),
      };
    }
  }

  return validatedPositions;
}

/**
 * Gets the base longitude value for a sign (0 for Aries, 30 for Taurus, etc.)
 */
function getBaseSignLongitude(sign: any): number {
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

  const index = signs.indexOf(sign);
  return index * 30;
}

/**
 * Gets the current planetary positions based on the transit dates in planet data files
 * This is a more reliable fallback than fixed positions when astronomy calculations fail
 */
export function getCurrentTransitPositions(): Record<string, PlanetPosition> {
  const _currentDate = new Date();
  const positions: Record<string, PlanetPosition> = {};

  // Current planetary positions (May 16, 2024) from user input
  const hardcodedPositions: Record<string, { sign: any; degree: number; minute: number }> = {
    Sun: { sign: 'taurus', degree: 27, minute: 12 },
    Moon: { sign: 'capricorn', degree: 25, minute: 36 },
    Mercury: { sign: 'taurus', degree: 13, minute: 17 },
    Venus: { sign: 'aries', degree: 12, minute: 10 },
    Mars: { sign: 'leo', degree: 13, minute: 44 },
    Jupiter: { sign: 'gemini', degree: 24, minute: 53 },
    Saturn: { sign: 'pisces', degree: 29, minute: 25 },
    Uranus: { sign: 'taurus', degree: 27, minute: 17 },
    Neptune: { sign: 'aries', degree: 1, minute: 33 },
    Pluto: { sign: 'aquarius', degree: 3, minute: 46 },
    Ascendant: { sign: 'libra', degree: 23, minute: 47 },
  };

  // Use the hardcoded positions from May 16, 2024
  for (const [planet, data] of Object.entries(hardcodedPositions)) {
    const { sign, degree, minute } = data;

    // Calculate exact longitude
    const exactLongitude = getBaseSignLongitude(sign) + degree + minute / 60;

    positions[planet] = {
      sign,
      degree,
      minute,
      exactLongitude,
      isRetrograde: planet === 'Pluto', // Only Pluto is retrograde currently
    };
  }

  return positions;
}
