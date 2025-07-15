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

// Current exact planetary positions (as of July 2, 2025 at 10:45 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:11 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:11 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:11 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:11 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:11 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:11 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:11 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:11 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:11 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:11 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:11 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:15 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:15 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:15 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:16 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:17 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:19 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:19 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:20 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:20 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:20 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:20 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:20 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:20 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:20 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:20 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:20 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:20 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:20 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:20 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:20 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:20 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:20 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:20 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:20 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:20 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:20 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:20 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:20 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:20 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:20 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:20 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:20 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:20 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:21 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:21 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:21 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:21 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:21 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:21 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:21 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:23 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:36 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:36 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:36 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:36 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:36 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:36 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:36 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:36 PM EDT)
// Reference: current-moment-chart.ipynb
// Current exact planetary positions (as of July 2, 2025 at 11:36 PM EDT)
// Reference: current-moment-chart.ipynb
const CURRENT_POSITIONS = {
  'sun': { sign: 'cancer', degree: 101.48333333333333, exactLongitude: 101.4844 },
  'moon': { sign: 'libra', degree: 195.16666666666666, exactLongitude: 195.18319999999994 },
  'mercury': { sign: 'leo', degree: 127.38333333333334, exactLongitude: 127.38920000000002 },
  'venus': { sign: 'taurus', degree: 58.35, exactLongitude: 58.35340000000002 },
  'mars': { sign: 'virgo', degree: 159, exactLongitude: 159.0158 },
  'jupiter': { sign: 'cancer', degree: 95.3, exactLongitude: 95.30540000000002 },
  'saturn': { sign: 'aries', degree: 1.85, exactLongitude: 1.8501999999999725 },
  'uranus': { sign: 'taurus', degree: 59.8, exactLongitude: 59.8091 },
  'neptune': { sign: 'aries', degree: 2.1666666666666665, exactLongitude: 2.174699999999973 },
  'pluto': { sign: 'aquarius', degree: 303.0833333333333, exactLongitude: 303.09529999999995 },
  'chiron': { sign: 'aries', degree: 26.933333333333334, exactLongitude: 26.939399999999978 },
  'sirius': { sign: 'aries', degree: 1.7666666666666666, exactLongitude: 1.7726000000000113 },
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
function _signToLongitude(sign: string): number {
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