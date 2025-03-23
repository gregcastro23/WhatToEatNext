import * as Astronomy from 'astronomy-engine';
import { getFallbackPlanetaryPositions } from './fallbackPlanetaryCalculations';

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

/**
 * Get fallback position for a planet
 * @param planet Planet name
 * @param date Date to calculate for
 * @returns Position in degrees (0-360)
 */
function getFallbackPlanetPosition(planet: string, date: Date): number {
  // Get positions from fallback calculations
  const fallbackPositions = getFallbackPlanetaryPositions(date);
  return fallbackPositions[planet] || 0;
}

/**
 * Get accurate planetary positions using astronomy-engine
 * @param date Date to calculate positions for
 * @returns Record of planetary positions in degrees (0-360)
 */
export function getAccuratePlanetaryPositions(date: Date): Record<string, number> {
  try {
    console.log('Calculating positions for date:', date);
    
    // Create a proper AstroTime object from JavaScript Date
    const astroTime = new Astronomy.AstroTime(date);
    
    console.log('Created AstroTime object:', astroTime);
    
    const positions: Record<string, number> = {};
    let failureCount = 0;
    
    // Process each planet
    for (const [planet, body] of Object.entries(PLANET_MAPPING)) {
      try {
        let longitude: number;
        
        if (planet === 'Sun') {
          // For Sun, use SunPosition
          const solarPosition = Astronomy.SunPosition(astroTime);
          longitude = solarPosition.elon; // Ecliptic longitude
        } else {
          // For other planets, use EclipticLongitude
          longitude = Astronomy.EclipticLongitude(body, astroTime);
        }
        
        // Validate longitude before adding
        if (typeof longitude === 'number' && !isNaN(longitude)) {
          positions[planet] = longitude;
        } else {
          console.warn(`Invalid longitude for ${planet}:`, longitude);
          failureCount++;
          // Use fallback for this planet
          positions[planet] = getFallbackPlanetPosition(planet, date);
        }
      } catch (error) {
        console.error(`Error calculating position for ${planet}:`, error);
        failureCount++;
        // Use fallback calculation for this planet
        positions[planet] = getFallbackPlanetPosition(planet, date);
      }
    }

    // Add extra logging to help debug issues
    console.log('Calculated positions:', positions);
    
    // If too many planets failed to calculate, use fallback for all
    if (failureCount > 5) {
      console.warn('Too many planet calculation failures, using fallback for all');
      return getFallbackPlanetaryPositions(date);
    }
    
    // Ensure we have all required planets
    const requiredPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
    const missingPlanets = requiredPlanets.filter(planet => !(planet in positions));
    
    if (missingPlanets.length > 0) {
      console.warn(`Missing required planets: ${missingPlanets.join(', ')}, using fallback`);
      return getFallbackPlanetaryPositions(date);
    }
    
    return positions;
  } catch (error) {
    console.error('Error calculating accurate planetary positions:', error);
    // Only use fallback if the astronomy-engine fails completely
    try {
      return getFallbackPlanetaryPositions(date);
    } catch (fallbackError) {
      console.error('Fallback calculations also failed:', fallbackError);
      
      // Create a minimal valid response with default values
      const defaultPositions: Record<string, number> = {
        Sun: 15,      // Aries
        Moon: 45,     // Taurus
        Mercury: 75,  // Gemini
        Venus: 105,   // Cancer
        Mars: 135,    // Leo
        Jupiter: 165, // Virgo
        Saturn: 195,  // Libra
        Uranus: 225,  // Scorpio
        Neptune: 255, // Sagittarius
        Pluto: 285    // Capricorn
      };
      
      return defaultPositions;
    }
  }
}

/**
 * Validate planetary positions
 * @param positions Record of planetary positions
 * @returns True if all positions are valid
 */
export function validatePlanetaryPositions(positions: Record<string, number>): boolean {
  const REQUIRED_PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 
                           'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  
  // Check if we have an empty object
  if (!positions || Object.keys(positions).length === 0) {
    console.error('Validation failed: No positions provided or positions is undefined');
    return false;
  }
  
  // Log the positions for debugging
  console.log('Validating positions:', positions);
  
  // Check that required planets exist with valid values
  const validation = REQUIRED_PLANETS.every(planet => {
    // Check if the planet exists in the positions object
    if (!(planet in positions)) {
      console.error(`Missing position for ${planet}`);
      return false;
    }
    
    const longitude = positions[planet];
    const isValid = typeof longitude === 'number' && 
           !isNaN(longitude) && 
           longitude >= 0 && 
           longitude < 360;
    
    if (!isValid) {
      console.error(`Invalid position for ${planet}: ${longitude}`);
    }
    
    return isValid;
  });
  
  console.log('Validation result:', validation);
  return validation;
} 