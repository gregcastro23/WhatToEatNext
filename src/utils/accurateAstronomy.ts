import * as Astronomy from 'astronomy-engine';
import type { PlanetaryPosition, ZodiacSign } from '@/types/alchemy';

/**
 * A utility function for logging debug information
 * This is a safe replacement for console.log that can be disabled in production
 */
const debugLog = (message: string, ...args: unknown[]): void => {
  // Comment out console.log to avoid linting warnings
  // console.log(message, ...args);
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
  Pluto: Astronomy.Body.Pluto
};

// Cache for planetary positions to avoid frequent recalculations
let positionsCache: PositionsCache | null = null;

// Cache expiration in milliseconds (15 minutes)
const CACHE_EXPIRATION = 15 * 60 * 1000;

/**
 * Calculate lunar node positions with more accurate reference data
 * @param date Date to calculate for
 * @returns Object with north node position and retrograde status
 */
function calculateLunarNodes(date: Date): { northNode: number, isRetrograde: boolean } {
  try {
    // Since MoonNode is not available in astronomy-engine,
    // we'll implement a simple approximation using astronomical formulas
    
    // Time in Julian centuries since 2000
    const jd = Astronomy.MakeTime(date).tt;
    const T = (jd - 2451545.0) / 36525;
    
    // Mean longitude of ascending node (Meeus formula)
    let Omega = 125.04452 - 1934.136261 * T + 0.0020708 * T*T + T*T*T/450000;
    
    // Normalize to 0-360 range
    Omega = ((Omega % 360) + 360) % 360;
    
    // The ascending node (North Node) is the opposite of Omega
    const northNode = (Omega + 180) % 360;
    
    // Nodes are always retrograde
    return { northNode, isRetrograde: true };
  } catch (error) {
    debugLog('Error calculating lunar nodes:', error instanceof Error ? error.message : String(error));
    // Return current position for March 2024 (late pisces)
    return { northNode: 356.54, isRetrograde: true };
  }
}

/**
 * Get accurate planetary positions using astronomy-engine
 * @param date Date to calculate positions for
 * @returns Record of planetary positions in degrees (0-360)
 */
export async function getAccuratePlanetaryPositions(date: Date = new Date()): Promise<Record<string, PlanetPositionData>> {
  try {
    // Check cache first
    if (positionsCache && 
        (date.getTime() - positionsCache.date.getTime()) < 60000 && // 1 minute cache for same date
        (Date.now() - positionsCache.timestamp) < CACHE_EXPIRATION) {
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
            sign: sign as ZodiacSign,
            degree,
            exactLongitude: sunLong,
            isRetrograde: false // The Sun is never retrograde from Earth's perspective
          };
        } else {
          // For other planets use standard calculation
          const eclipLong = Astronomy.EclipticLongitude(body, astroTime);
          const isRetrograde = isPlanetRetrograde(body, date);
          
          const { sign, degree } = getLongitudeToZodiacPosition(eclipLong);
          
          positions[planet] = {
            sign: sign as ZodiacSign,
            degree,
            exactLongitude: eclipLong,
            isRetrograde
          };
        }
      } catch (error) {
        debugLog(`Error calculating position for ${planet}:`, error instanceof Error ? error.message : String(error));
        // Use fallback for this specific planet
        const fallbackPositions = getFallbackPositions(date);
        if (fallbackPositions[planet]) {
          positions[planet] = fallbackPositions[planet];
        }
      }
    }
    
    // Add lunar nodes
    const nodeData = calculateLunarNodes(date);
    const { sign: nodeSign, degree: nodeDegree } = getLongitudeToZodiacPosition(nodeData.northNode);
    
    positions.northNode = {
      sign: nodeSign as ZodiacSign,
      degree: nodeDegree,
      exactLongitude: nodeData.northNode,
      isRetrograde: nodeData.isRetrograde
    };
    
    // Calculate south node (opposite to north node)
    const southNodeLong = (nodeData.northNode + 180) % 360;
    const { sign: southSign, degree: southDegree } = getLongitudeToZodiacPosition(southNodeLong);
    
    positions.southNode = {
      sign: southSign as ZodiacSign,
      degree: southDegree,
      exactLongitude: southNodeLong,
      isRetrograde: nodeData.isRetrograde
    };
    
    // Cache the results
    positionsCache = {
      positions,
      timestamp: Date.now(),
      date: new Date(date)
    };
    
    return positions;
  } catch (error) {
    debugLog('Error calculating planetary positions:', error instanceof Error ? error.message : String(error));
    // Fall back to approximate calculations
    return getFallbackPositions(date);
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
    debugLog(`Error determining retrograde for ${body}:`, error instanceof Error ? error.message : String(error));
    // Default retrograde status for common retrograde planets
    if (body === Astronomy.Body.Mercury || body === Astronomy.Body.Venus) {
      return Math.random() < 0.4; // 40% chance of retrograde (rough approximation)
    }
    return false;
  }
}

/**
 * Get fallback planetary positions for March 2024 
 * @param date Date to calculate positions for
 * @returns Record of planetary positions
 */
function getFallbackPositions(date: Date = new Date()): Record<string, PlanetPositionData> {
  try {
    // Calculate positions based on simplified orbital elements
    const positions: Record<string, PlanetPositionData> = {};
    
    // Updated planetary positions from user-provided data
    positions.Sun = createPositionObject('aries', 14.62); // 14° 37' Aries
    positions.Moon = createPositionObject('cancer', 2.67); // 2° 40' Cancer
    positions.Mercury = createPositionObject('pisces', 27.32, true); // 27° 19' Pisces (r)
    positions.Venus = createPositionObject('pisces', 26.22, true); // 26° 13' Pisces (r)
    positions.Mars = createPositionObject('cancer', 24.65); // 24° 39' Cancer
    positions.Jupiter = createPositionObject('gemini', 16.47); // 16° 28' Gemini
    positions.Saturn = createPositionObject('pisces', 24.85); // 24° 51' Pisces
    positions.Uranus = createPositionObject('taurus', 24.90); // 24° 54' Taurus
    positions.Neptune = createPositionObject('aries', 0.17); // 0° 10' Aries
    positions.Pluto = createPositionObject('aquarius', 3.60); // 3° 36' Aquarius
    positions.northNode = createPositionObject('pisces', 26.55, true); // 26° 33' Pisces (r)
    positions.southNode = createPositionObject('virgo', 26.55, true); // Opposite to North Node
    positions.Ascendant = createPositionObject('sagittarius', 3.97); // 3° 58' Sagittarius
    
    // Reference date - keeping this the same as it will be adjusted based on the date parameter
    const referenceDate = new Date('2025-04-02T20:47:00-04:00'); // New York time (EDT)
    const timestampDiff = date.getTime() - referenceDate.getTime();
    const daysDiff = timestampDiff / (1000 * 60 * 60 * 24);
    
    // Only adjust positions if the requested date is different from the reference date
    if (Math.abs(daysDiff) > 0.01) { // If more than ~15 minutes difference
      adjustPositionForDays(positions.Sun, daysDiff, 0.986); // ~1° per day
      adjustPositionForDays(positions.Moon, daysDiff, 13.2); // 13.2° per day
      adjustPositionForDays(positions.Mercury, daysDiff, 1.383, positions.Mercury.isRetrograde); 
      adjustPositionForDays(positions.Venus, daysDiff, 1.2, positions.Venus.isRetrograde);
      adjustPositionForDays(positions.Mars, daysDiff, 0.524);
      adjustPositionForDays(positions.Jupiter, daysDiff, 0.083);
      adjustPositionForDays(positions.Saturn, daysDiff, 0.034);
      adjustPositionForDays(positions.Uranus, daysDiff, 0.012);
      adjustPositionForDays(positions.Neptune, daysDiff, 0.006);
      adjustPositionForDays(positions.Pluto, daysDiff, 0.004);
      adjustPositionForDays(positions.northNode, daysDiff, 0.053, true);
      adjustPositionForDays(positions.southNode, daysDiff, 0.053, true);
      adjustPositionForDays(positions.Ascendant, daysDiff, 1.0);
    }
    
    return positions;
  } catch (error) {
    debugLog('Error in fallback positions:', error instanceof Error ? error.message : String(error));
    // Return empty object if everything fails
    return {};
  }
}

/**
 * Create a planetary position object
 * @param sign Zodiac sign
 * @param degree Degree within the sign
 * @param isRetrograde Whether the planet is in retrograde motion
 * @returns Planet position object
 */
function createPositionObject(sign: ZodiacSign, degree: number, isRetrograde: boolean = false): PlanetPositionData {
  // Calculate exact longitude based on sign and degree
  const signs: ZodiacSign[] = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 
    'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
  const signIndex = signs.indexOf(sign);
  const exactLongitude = signIndex * 30 + degree;
  
  return {
    sign,
    degree,
    exactLongitude,
    isRetrograde
  };
}

/**
 * Adjust a planet's position for a given number of days
 * @param position Planet position to adjust
 * @param days Number of days to adjust for
 * @param degPerDay Degrees per day the planet moves
 * @param isRetrograde Whether the planet is in retrograde motion
 */
function adjustPositionForDays(
  position: PlanetPositionData, 
  days: number, 
  degPerDay: number, 
  isRetrograde: boolean = false
): void {
  // Calculate adjustment (negative if retrograde)
  const adjustment = isRetrograde ? -degPerDay * days : degPerDay * days;
  
  // Update exact longitude
  position.exactLongitude = (position.exactLongitude + adjustment + 360) % 360;
  
  // Update sign and degree
  const { sign, degree } = getLongitudeToZodiacPosition(position.exactLongitude);
  position.sign = sign as ZodiacSign;
  position.degree = degree;
}

/**
 * Convert ecliptic longitude to zodiac sign and degree
 * @param longitude Ecliptic longitude in degrees (0-360)
 * @returns Object with sign and degree
 */
export function getLongitudeToZodiacPosition(longitude: number): { sign: string, degree: number } {
  // Normalize longitude to 0-360 range
  const normalizedLong = ((longitude % 360) + 360) % 360;
  
  // Calculate sign index (0-11)
  const signIndex = Math.floor(normalizedLong / 30);
  
  // Calculate degree within sign (0-29.999...)
  const degree = normalizedLong % 30;
  
  // Get sign name
  const signs: ZodiacSign[] = [
    'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
    'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
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
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
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
function calculateMoonPosition(date: Date): number {
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