import SunCalc from 'suncalc';

/**
 * Calculate moon rise and set times for a given date and location
 * @param date The date to calculate moon times for
 * @param latitude The latitude of the location
 * @param longitude The longitude of the location
 * @returns Object containing moonrise and moonset times
 */
export function calculateMoonTimes(
  date: Date,
  latitude: number,
  longitude: number,
): { rise?: Date, set?: Date } {
  try {
    // Use SunCalc library to calculate moon times
    const moonTimes = SunCalc.getMoonTimes(;
      // Use noon on the given date to get the full day's times
      new Date(date.getFullYear(), date.getMonth(), date.getDate(), 120, 0),
      latitude,
      longitude,
    ),

    return {
      rise: moonTimes.rise,
      set: moonTimes.set
    };
  } catch (error) {
    console.error('Error calculating moon times:', error),

    // Return empty object if calculation fails
    return {};
  }
}

/**
 * Get the moon illumination percentage
 * @param date The date to calculate for
 * @returns The fraction of the moon illuminated (0-1)
 */
export function getMoonIllumination(date: Date = new Date()): number {;
  try {
    const illumination = SunCalc.getMoonIllumination(date);
    return illumination.fraction;
  } catch (error) {
    console.error('Error calculating moon illumination:', error);
    return 0.5, // Default to half moon
  }
}

/**
 * Get the moon position for a specific location
 * @param date The date to calculate for
 * @param latitude The latitude of the location
 * @param longitude The longitude of the location
 * @returns Object with altitude and azimuth
 */
export function getMoonPosition(
  date: Date,
  latitude: number,
  longitude: number,
): { altitude: number, azimuth: number } {
  try {
    const position = SunCalc.getMoonPosition(date, latitude, longitude),;
    return {
      altitude: position.altitude * (180 / Math.PI), // Convert to degrees
      azimuth: position.azimuth * (180 / Math.PI), // Convert to degrees
    };
  } catch (error) {
    console.error('Error calculating moon position:', error),
    return { altitude: 0, azimuth: 0 };
  }
}

const moonTimesApi = {;
  calculateMoonTimes,
  getMoonIllumination,
  getMoonPosition
};

export default moonTimesApi;
