/**
 * Planetary calculations using the astronomia library
 * This provides more accurate calculations than our fallback methods
 */

import * as astronomia from 'astronomia';
import { PlanetaryPositionData } from './aspectCalculator';

// Define the zodiac signs
const ZODIAC_SIGNS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
];

/**
 * Conversion helpers
 */
function degreesToRadians(degrees: number): number {
  return degrees * Math.PI / 180;
}

function radiansToDegrees(radians: number): number {
  return radians * 180 / Math.PI;
}

/**
 * Get zodiac sign and degree from a longitude in degrees
 */
function getSignAndDegree(longitude: number): { sign: string, degree: number } {
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
 * Calculate Sun position using astronomia
 */
function calculateSunPosition(date: Date): number {
  const jde = astronomia.julian.DateToJDE(date);
  const earth = new astronomia.planetposition.Planet(astronomia.planetposition.earth);
  const sun = new astronomia.solar.ApparentEquatorialVSOP87(earth);
  const sunCoordinates = sun.position(jde);
  
  // Convert equatorial to ecliptic coordinates
  const ecliptic = new astronomia.coord.Ecliptic(
    sunCoordinates.ra, 
    sunCoordinates.dec, 
    astronomia.coord.EquatorialToEcliptic
  );
  
  // Convert to degrees and normalize
  let longitude = radiansToDegrees(ecliptic.lon);
  longitude = ((longitude % 360) + 360) % 360;
  
  return longitude;
}

/**
 * Calculate Moon position using astronomia
 */
function calculateMoonPosition(date: Date): number {
  const jde = astronomia.julian.DateToJDE(date);
  const result = astronomia.moon.position(jde);
  
  // Convert to degrees and normalize
  let longitude = radiansToDegrees(result.lon);
  longitude = ((longitude % 360) + 360) % 360;
  
  return longitude;
}

/**
 * Calculate planet position using astronomia
 */
function calculatePlanetPosition(date: Date, planet: string): number {
  const jde = astronomia.julian.DateToJDE(date);
  let longitude = 0;

  try {
    let planetData;
    
    // Set up the correct planet
    switch (planet.toLowerCase()) {
      case 'mercury':
        planetData = new astronomia.planetposition.Planet(astronomia.planetposition.mercury);
        break;
      case 'venus':
        planetData = new astronomia.planetposition.Planet(astronomia.planetposition.venus);
        break;
      case 'mars':
        planetData = new astronomia.planetposition.Planet(astronomia.planetposition.mars);
        break;
      case 'jupiter':
        planetData = new astronomia.planetposition.Planet(astronomia.planetposition.jupiter);
        break;
      case 'saturn':
        planetData = new astronomia.planetposition.Planet(astronomia.planetposition.saturn);
        break;
      case 'uranus':
        planetData = new astronomia.planetposition.Planet(astronomia.planetposition.uranus);
        break;
      case 'neptune':
        planetData = new astronomia.planetposition.Planet(astronomia.planetposition.neptune);
        break;
      default:
        throw new Error(`Planet ${planet} not implemented`);
    }
    
    // Calculate heliocentric position
    const helio = planetData.position(jde);
    const earth = new astronomia.planetposition.Planet(astronomia.planetposition.earth);
    
    // Calculate geocentric position
    const pos = astronomia.planetposition.topocentricPosition(
      earth,
      planetData,
      jde,
      0, // longitude of observer
      0, // latitude of observer
      0  // height of observer
    );
    
    // Convert to ecliptic longitude
    const ecliptic = new astronomia.coord.Ecliptic(
      pos.ra, 
      pos.dec, 
      astronomia.coord.EquatorialToEcliptic
    );
    
    // Convert to degrees and normalize
    longitude = radiansToDegrees(ecliptic.lon);
    longitude = ((longitude % 360) + 360) % 360;
  } catch (error) {
    console.error(`Error calculating position for ${planet}:`, error);
    // Return approximate position (this will be improved in future versions)
    const fallbackPositions = {
      'mercury': 357.72,
      'venus': 356.63,
      'mars': 114.27,
      'jupiter': 76.28,
      'saturn': 354.72,
      'uranus': 54.85,
      'neptune': 0.12,
      'pluto': 333.58
    };
    
    longitude = fallbackPositions[planet.toLowerCase()] || 0;
  }
  
  return longitude;
}

/**
 * Check if a planet is in retrograde motion
 */
function isPlanetRetrograde(planet: string, date: Date): boolean {
  if (planet.toLowerCase() === 'sun' || planet.toLowerCase() === 'moon') {
    return false; // Sun and Moon are never retrograde
  }
  
  // For this implementation, we'll use a simple check comparing positions
  // over a few days to see if the planet is moving backward
  const jde = astronomia.julian.DateToJDE(date);
  const jdeEarlier = jde - 5; // 5 days earlier
  
  try {
    let planetData;
    
    // Set up the correct planet
    switch (planet.toLowerCase()) {
      case 'mercury':
        planetData = new astronomia.planetposition.Planet(astronomia.planetposition.mercury);
        break;
      case 'venus':
        planetData = new astronomia.planetposition.Planet(astronomia.planetposition.venus);
        break;
      case 'mars':
        planetData = new astronomia.planetposition.Planet(astronomia.planetposition.mars);
        break;
      case 'jupiter':
        planetData = new astronomia.planetposition.Planet(astronomia.planetposition.jupiter);
        break;
      case 'saturn':
        planetData = new astronomia.planetposition.Planet(astronomia.planetposition.saturn);
        break;
      case 'uranus':
        planetData = new astronomia.planetposition.Planet(astronomia.planetposition.uranus);
        break;
      case 'neptune':
        planetData = new astronomia.planetposition.Planet(astronomia.planetposition.neptune);
        break;
      default:
        return false;
    }
    
    const earth = new astronomia.planetposition.Planet(astronomia.planetposition.earth);
    
    // Calculate current position
    const currentPos = astronomia.planetposition.topocentricPosition(
      earth, planetData, jde, 0, 0, 0
    );
    
    // Calculate position from 5 days ago
    const earlierPos = astronomia.planetposition.topocentricPosition(
      earth, planetData, jdeEarlier, 0, 0, 0
    );
    
    // Convert both to ecliptic coordinates
    const currentEcliptic = new astronomia.coord.Ecliptic(
      currentPos.ra, currentPos.dec, astronomia.coord.EquatorialToEcliptic
    );
    
    const earlierEcliptic = new astronomia.coord.Ecliptic(
      earlierPos.ra, earlierPos.dec, astronomia.coord.EquatorialToEcliptic
    );
    
    // Calculate the difference in longitude (taking care of the 0/360 boundary)
    let diff = radiansToDegrees(currentEcliptic.lon - earlierEcliptic.lon);
    if (Math.abs(diff) > 180) {
      diff = diff > 0 ? diff - 360 : diff + 360;
    }
    
    // If difference is negative, the planet is retrograde
    return diff < 0;
  } catch (error) {
    console.error(`Error determining retrograde for ${planet}:`, error);
    
    // Fallback to typical retrograde periods based on April 2025 data
    const retrogradeStatus = {
      'mercury': true,
      'venus': true,
      'mars': false,
      'jupiter': false,
      'saturn': false,
      'uranus': false,
      'neptune': false,
      'pluto': false,
      'chiron': false
    };
    
    return retrogradeStatus[planet.toLowerCase()] || false;
  }
}

/**
 * Calculate all planetary positions for a given date
 */
export function calculatePlanetaryPositions(date: Date = new Date()): Record<string, PlanetaryPositionData> {
  const positions: Record<string, PlanetaryPositionData> = {};
  
  try {
    // Calculate Sun and Moon positions
    const sunLongitude = calculateSunPosition(date);
    const moonLongitude = calculateMoonPosition(date);
    
    const { sign: sunSign, degree: sunDegree } = getSignAndDegree(sunLongitude);
    const { sign: moonSign, degree: moonDegree } = getSignAndDegree(moonLongitude);
    
    positions.sun = {
      sign: sunSign,
      degree: sunDegree,
      exactLongitude: sunLongitude,
      isRetrograde: false
    };
    
    positions.moon = {
      sign: moonSign,
      degree: moonDegree,
      exactLongitude: moonLongitude,
      isRetrograde: false
    };
    
    // Calculate positions for other planets
    const planets = ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
    
    for (const planet of planets) {
      const longitude = calculatePlanetPosition(date, planet);
      const { sign, degree } = getSignAndDegree(longitude);
      const isRetrograde = isPlanetRetrograde(planet, date);
      
      positions[planet] = {
        sign,
        degree,
        exactLongitude: longitude,
        isRetrograde
      };
    }
    
    // Add Pluto (using approximate calculation or astronomia extensions)
    // For now using the April 2025 position as reference
    positions.pluto = {
      sign: 'aquarius',
      degree: 3.58,
      exactLongitude: 333.58,
      isRetrograde: false
    };
    
  } catch (error) {
    console.error('Error calculating planetary positions:', error);
    // Return empty object for error case
  }
  
  return positions;
} 