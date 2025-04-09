/**
 * Simplified planetary position calculator 
 * Uses hardcoded current positions with time-based adjustments
 */

import { PlanetaryPositionData } from './aspectCalculator';

// Define the zodiac signs in order
const ZODIAC_SIGNS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
];

// Current exact planetary positions (as of the user's reference data)
const CURRENT_POSITIONS = {
  'sun': { sign: 'aries', degree: 18.52, exactLongitude: 18.52 },
  'moon': { sign: 'leo', degree: 24.28, exactLongitude: 144.28 },
  'mercury': { sign: 'pisces', degree: 26.83, exactLongitude: 356.83 },
  'venus': { sign: 'pisces', degree: 25.12, exactLongitude: 355.12, isRetrograde: true },
  'mars': { sign: 'cancer', degree: 26.07, exactLongitude: 116.07 },
  'jupiter': { sign: 'gemini', degree: 17.12, exactLongitude: 77.12 },
  'saturn': { sign: 'pisces', degree: 25.32, exactLongitude: 355.32 },
  'uranus': { sign: 'taurus', degree: 25.08, exactLongitude: 55.08 },
  'neptune': { sign: 'aries', degree: 0.32, exactLongitude: 0.32 },
  'pluto': { sign: 'aquarius', degree: 3.65, exactLongitude: 333.65 },
  'northnode': { sign: 'pisces', degree: 26.35, exactLongitude: 356.35, isRetrograde: true },
  'ascendant': { sign: 'scorpio', degree: 26.33, exactLongitude: 236.33 }
};

// Daily movement rates for planets (in degrees)
const DAILY_MOVEMENT = {
  'sun': 1.0,
  'moon': 13.2,
  'mercury': 1.5,
  'venus': 1.2,
  'mars': 0.5,
  'jupiter': 0.08,
  'saturn': 0.03,
  'uranus': 0.01,
  'neptune': 0.006,
  'pluto': 0.004,
  'northnode': 0.05,
  'ascendant': 1.0  // Changes rapidly but approximated for simplicity
};

/**
 * Conversion helpers
 */
function signToLongitude(sign: string): number {
  const signIndex = ZODIAC_SIGNS.indexOf(sign.toLowerCase());
  return signIndex >= 0 ? signIndex * 30 : 0;
}

function degreesToSignAndDegree(longitude: number): { sign: string, degree: number } {
  // Normalize to 0-360 range
  const normalizedLong = ((longitude % 360) + 360) % 360;
  
  // Calculate sign index (0-11) and degree (0-29.999...)
  const signIndex = Math.floor(normalizedLong / 30);
  const degree = normalizedLong % 30;
  
  return {
    sign: ZODIAC_SIGNS[signIndex],
    degree: parseFloat(degree.toFixed(2))
  };
}

/**
 * Calculate adjusted planetary positions based on the reference date
 * @param date - The date to calculate positions for
 * @returns Record of planetary positions
 */
export function calculatePlanetaryPositions(date: Date = new Date()): Record<string, PlanetaryPositionData> {
  const positions: Record<string, PlanetaryPositionData> = {};
  
  try {
    // Use current date as reference point
    const referenceDate = new Date();
    
    // Calculate days difference (can be positive or negative)
    const msDiff = date.getTime() - referenceDate.getTime();
    const daysDiff = msDiff / (1000 * 60 * 60 * 24);
    
    // Calculate positions for all planets
    const planets = Object.keys(CURRENT_POSITIONS);
    
    for (const planet of planets) {
      const currentPosition = CURRENT_POSITIONS[planet];
      const dailyMove = DAILY_MOVEMENT[planet] || 0;
      
      // Calculate the adjusted longitude
      let adjustedLongitude = currentPosition.exactLongitude;
      
      // If the planet is retrograde, it moves in the opposite direction
      if (currentPosition.isRetrograde) {
        adjustedLongitude -= dailyMove * daysDiff;
      } else {
        adjustedLongitude += dailyMove * daysDiff;
      }
      
      // Normalize to 0-360 range
      adjustedLongitude = ((adjustedLongitude % 360) + 360) % 360;
      
      // Get the sign and degree from the adjusted longitude
      const { sign, degree } = degreesToSignAndDegree(adjustedLongitude);
      
      positions[planet] = {
        sign,
        degree,
        exactLongitude: adjustedLongitude,
        isRetrograde: currentPosition.isRetrograde || false
      };
    }
    
  } catch (error) {
    console.error('Error calculating planetary positions:', error);
    
    // If anything fails, just return the current positions
    return { ...CURRENT_POSITIONS };
  }
  
  return positions;
} 