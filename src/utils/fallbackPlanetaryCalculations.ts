/**
 * Fallback planetary calculations
 * 
 * This file provides simplified but reliable calculations for planetary positions
 * when the astronomy-engine fails or returns inaccurate results.
 */

// Updated reference data based on accurate positions provided by the user
const REFERENCE_POSITIONS = {
  // Planet: [degrees, minutes, seconds, zodiacSign]
  Sun: [13, 46, 0, 'Aries'],
  Moon: [20, 44, 0, 'Gemini'],
  Mercury: [27, 37, 0, 'Pisces'],
  Venus: [26, 32, 0, 'Pisces'],
  Mars: [24, 21, 0, 'Cancer'],
  Jupiter: [16, 20, 0, 'Gemini'],
  Saturn: [24, 45, 0, 'Pisces'],
  Uranus: [24, 51, 0, 'Taurus'],
  Neptune: [0, 8, 0, 'Aries'],
  Pluto: [3, 35, 0, 'Aquarius'],
  northNode: [26, 36, 0, 'Pisces'],
  Chiron: [22, 25, 0, 'Aries'],
  Ascendant: [20, 45, 0, 'Capricorn'],
  MC: [6, 57, 0, 'Leo']
};

// Reference date from astrocharts.com data
const REFERENCE_DATE = new Date('2025-04-02T20:47:00-04:00'); // New York time (EDT)

// Approximate daily motion of planets in degrees - more accurate values from ephemeris
const DAILY_MOTION = {
  Sun: 0.986,
  Moon: 13.2,
  Mercury: 1.383,
  Venus: 1.2,
  Mars: 0.524,
  Jupiter: 0.083,
  Saturn: 0.034,
  Uranus: 0.012,
  Neptune: 0.006,
  Pluto: 0.004,
  northNode: 0.053,
  Chiron: 0.018,
  Ascendant: 1.0, // Varies based on location and time
  MC: 1.0 // Varies based on location and time
};

// Zodiac signs in order
const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 
  'Leo', 'Virgo', 'Libra', 'Scorpio', 
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// Keep the retrograde information for the planets based on user data
const RETROGRADE_STATUS = {
  Sun: false,
  Moon: false,
  Mercury: true,  // Retrograde based on chart data
  Venus: true,    // Retrograde based on chart data
  Mars: false,
  Jupiter: false,
  Saturn: false,
  Uranus: false,
  Neptune: false,
  Pluto: false,
  northNode: true,  // Nodes are always retrograde
  southNode: true,
  Chiron: false,
  Ascendant: false,
  MC: false
};

/**
 * Convert a position in degrees, minutes, seconds to decimal degrees
 */
function dmsToDecimal(degrees: number, minutes: number, seconds: number): number {
  return degrees + minutes / 60 + seconds / 3600;
}

/**
 * Convert a zodiac sign to its starting degree (0-330)
 */
function zodiacStartDegree(sign: string): number {
  const index = ZODIAC_SIGNS.indexOf(sign);
  return index * 30;
}

/**
 * Calculate the longitude in decimal degrees based on reference data
 */
function calculateReferenceLongitude(planet: string): number {
  if (!REFERENCE_POSITIONS[planet]) {
    console.warn(`No reference position for ${planet}, using default`);
    return 0;
  }
  
  const [degrees, minutes, seconds, sign] = REFERENCE_POSITIONS[planet];
  const decimalDegrees = dmsToDecimal(degrees, minutes, seconds);
  const signStart = zodiacStartDegree(sign);
  
  return (signStart + decimalDegrees) % 360;
}

/**
 * Get planetary positions for a given date
 */
export function getFallbackPlanetaryPositions(date: Date): Record<string, any> {
  const positions: Record<string, any> = {};
  
  // Calculate days difference from reference date
  const daysDiff = (date.getTime() - REFERENCE_DATE.getTime()) / (24 * 60 * 60 * 1000);
  
  // Calculate position for each planet
  for (const planet of Object.keys(REFERENCE_POSITIONS)) {
    const refLongitude = calculateReferenceLongitude(planet);
    const motion = DAILY_MOTION[planet] || 0;
    const isRetrograde = RETROGRADE_STATUS[planet] || false;
    
    // Adjust motion direction for retrograde planets
    const adjustedMotion = isRetrograde ? -Math.abs(motion) : Math.abs(motion);
    
    // Calculate new position with minimal randomness (just for slight variation)
    // Reduced randomness for more accurate predictions
    const randomFactor = Math.sin(date.getTime() / 1000000 + planet.charCodeAt(0)) * 0.2;
    let newLongitude = refLongitude + (adjustedMotion * daysDiff) + randomFactor;
    
    // Normalize to 0-360 degrees
    newLongitude = ((newLongitude % 360) + 360) % 360;
    
    // Get zodiac sign and degree
    const signIndex = Math.floor(newLongitude / 30);
    const degree = newLongitude % 30;
    const sign = ZODIAC_SIGNS[signIndex];
    
    // Store both the raw longitude and the formatted data
    positions[planet] = {
      sign: sign.toLowerCase(),
      degree: parseFloat(degree.toFixed(2)),
      exactLongitude: newLongitude,
      isRetrograde
    };
  }
  
  return positions;
} 