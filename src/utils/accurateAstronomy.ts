import * as Astronomy from 'astronomy-engine';
import type { PlanetaryPosition, ZodiacSign } from '@/types/alchemy';
import { createLogger } from '@/utils/logger';

const logger = createLogger('AccurateAstronomy');

const ZODIAC_SIGNS: ZodiacSign[] = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
];

const PLANET_MAPPING: Record<string, Astronomy.Body> = {
  sun: Astronomy.Body.Sun,
  moon: Astronomy.Body.Moon,
  mercury: Astronomy.Body.Mercury,
  venus: Astronomy.Body.Venus,
  mars: Astronomy.Body.Mars,
  jupiter: Astronomy.Body.Jupiter,
  saturn: Astronomy.Body.Saturn,
  uranus: Astronomy.Body.Uranus,
  neptune: Astronomy.Body.Neptune,
  pluto: Astronomy.Body.Pluto,
};

/**
 * Converts ecliptic longitude to zodiac sign and degree
 */
function getZodiacPosition(longitude: number): { sign: ZodiacSign; degree: number } {
  const normalizedLong = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalizedLong / 30);
  const degree = normalizedLong % 30;
  return {
    sign: ZODIAC_SIGNS[signIndex],
    degree: parseFloat(degree.toFixed(4)) // Keep high precision for arc minutes
  };
}

/**
 * Determines if a planet is retrograde at a specific time
 */
function isPlanetRetrograde(body: Astronomy.Body, date: Date): boolean {
  if (body === Astronomy.Body.Sun || body === Astronomy.Body.Moon) return false;
  
  const astroTime = new Astronomy.AstroTime(date);
  const hourAgo = new Astronomy.AstroTime(new Date(date.getTime() - 3600000));
  
  const currentLong = Astronomy.EclipticLongitude(body, astroTime);
  const prevLong = Astronomy.EclipticLongitude(body, hourAgo);
  
  let diff = currentLong - prevLong;
  if (Math.abs(diff) > 180) {
    diff = diff > 0 ? diff - 360 : diff + 360;
  }
  return diff < 0;
}

/**
 * Calculates mean lunar node positions using astronomical formula (Meeus)
 */
function calculateLunarNodes(date: Date): { northNode: number; southNode: number; isRetrograde: boolean } {
  const jd = Astronomy.MakeTime(date).tt;
  const T = (jd - 2451545.0) / 36525;

  // Mean longitude of ascending node
  let Omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000;
  Omega = ((Omega % 360) + 360) % 360;

  const northNode = Omega;
  const southNode = (Omega + 180) % 360;

  return { northNode, southNode, isRetrograde: true };
}

/**
 * Calculates the current lunar phase (0-1)
 * 0 = new moon, 0.25 = first quarter, 0.5 = full moon, 0.75 = last quarter
 */
export function calculateLunarPhase(date: Date = new Date()): number {
  try {
    const astroTime = new Astronomy.AstroTime(date);
    // Astronomy.MoonPhase returns angle in degrees (0-360)
    const phaseAngle = Astronomy.MoonPhase(astroTime);
    return phaseAngle / 360;
  } catch (error) {
    logger.error('Error calculating lunar phase:', error);
    throw new Error('Astronomy Engine failure: Could not calculate lunar phase.');
  }
}

/**
 * Converts a lunar phase (0-1) to its traditional name
 */
export function getLunarPhaseName(phase: number): string {
  // Convert 0-1 to 0-360 degrees for easier naming
  const degrees = phase * 360;
  
  if (degrees < 45) return 'new moon';
  if (degrees < 90) return 'waxing crescent';
  if (degrees < 135) return 'first quarter';
  if (degrees < 180) return 'waxing gibbous';
  if (degrees < 225) return 'full moon';
  if (degrees < 270) return 'waning gibbous';
  if (degrees < 315) return 'last quarter';
  return 'waning crescent';
}

/**
 * Get accurate planetary positions using astronomy-engine (Synchronous version)
 * Strictly calculates based on mathematical models, no hardcoded defaults.
 */
export function getAccuratePlanetaryPositionsSync(
  date: Date = new Date()
): Record<string, PlanetaryPosition & { exactLongitude: number }> {
  try {
    const astroTime = new Astronomy.AstroTime(date);
    const positions: Record<string, any> = {};

    for (const [planet, body] of Object.entries(PLANET_MAPPING)) {
      let longitude: number;
      
      if (planet === 'sun') {
        const earthLong = Astronomy.EclipticLongitude(Astronomy.Body.Earth, astroTime);
        longitude = (earthLong + 180) % 360;
      } else {
        longitude = Astronomy.EclipticLongitude(body, astroTime);
      }

      const { sign, degree } = getZodiacPosition(longitude);
      positions[planet] = {
        sign,
        degree,
        exactLongitude: longitude,
        isRetrograde: isPlanetRetrograde(body, date)
      };
    }

    const { northNode, southNode, isRetrograde } = calculateLunarNodes(date);
    
    const nNodePos = getZodiacPosition(northNode);
    positions.northNode = {
      sign: nNodePos.sign,
      degree: nNodePos.degree,
      exactLongitude: northNode,
      isRetrograde
    };

    const sNodePos = getZodiacPosition(southNode);
    positions.southNode = {
      sign: sNodePos.sign,
      degree: sNodePos.degree,
      exactLongitude: southNode,
      isRetrograde
    };

    return positions;
  } catch (error) {
    logger.error('CRITICAL: Accurate planetary calculation (sync) failed!', error);
    throw new Error('Astronomy Engine failure: Could not calculate planetary positions sync without defaults.');
  }
}

/**
 * Get accurate planetary positions using astronomy-engine
 * Strictly calculates based on mathematical models, no hardcoded defaults.
 */
export async function getAccuratePlanetaryPositions(
  date: Date = new Date()
): Promise<Record<string, PlanetaryPosition & { exactLongitude: number }>> {
  return getAccuratePlanetaryPositionsSync(date);
}
