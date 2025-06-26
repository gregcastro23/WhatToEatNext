import SunCalc from 'suncalc';

interface SunTimes {
  sunrise: Date | null;
  sunset: Date | null;
  solarNoon: Date | null;
  goldenHour: Date | null;
  goldenHourEnd: Date | null;
  // Additional times available in SunCalc
  dawn: Date | null;
  dusk: Date | null;
  nauticalDawn: Date | null;
  nauticalDusk: Date | null;
  nightEnd: Date | null;
  night: Date | null;
  nadir: Date | null;
}

/**
 * Calculate sun times for a specific location and date
 * @param date The date to calculate for
 * @param latitude The location latitude
 * @param longitude The location longitude
 * @returns An object containing various sun time information
 */
export function calculateSunTimes(
  date: Date = new Date(),
  latitude = 40.7128, // Default to New York
  longitude = -74.0060
): SunTimes {
  try {
    const times = SunCalc.getTimes(date, latitude, longitude);
    
    return {
      sunrise: times.sunrise || null,
      sunset: times.sunset || null,
      solarNoon: times.solarNoon || null,
      goldenHour: times.goldenHour || null,
      goldenHourEnd: times.goldenHourEnd || null,
      dawn: times.dawn || null,
      dusk: times.dusk || null,
      nauticalDawn: times.nauticalDawn || null,
      nauticalDusk: times.nauticalDusk || null,
      nightEnd: times.nightEnd || null,
      night: times.night || null,
      nadir: times.nadir || null
    };
  } catch (error) {
    // console.error('Error calculating sun times:', error);
    return {
      sunrise: null,
      sunset: null,
      solarNoon: null,
      goldenHour: null,
      goldenHourEnd: null,
      dawn: null,
      dusk: null,
      nauticalDawn: null,
      nauticalDusk: null,
      nightEnd: null,
      night: null,
      nadir: null
    };
  }
}

/**
 * Format a Date object to hour:minute format with AM/PM
 */
export function formatSunTime(date: Date | null): string {
  if (!date) return 'Unknown';
  
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Determine if the current time is daytime or nighttime
 * @param latitude The location latitude
 * @param longitude The location longitude
 * @returns Boolean indicating if it's currently daytime
 */
export function isDaytime(
  latitude = 40.7128,
  longitude = -74.0060
): boolean {
  const now = new Date();
  const times = calculateSunTimes(now, latitude, longitude);
  
  // Check if current time is between sunrise and sunset
  return times.sunrise && times.sunset && 
         now.getTime() >= times.sunrise.getTime() && 
         now.getTime() <= times.sunset.getTime();
} 