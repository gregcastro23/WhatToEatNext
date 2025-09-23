import SunCalc from 'suncalc';

import { Planet } from '@/types/celestial';

export class PlanetaryHourCalculator {
  // Planetary hour configuration according to traditional planetary rulers
  private static planetaryHours: Record<string, Planet[]> = {
    Sunday: ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'],
    Monday: ['Moon', 'Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury'],
    Tuesday: ['Mars', 'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter'],
    Wednesday: ['Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus'],
    Thursday: ['Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn'],
    Friday: ['Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars', 'Sun'],
    Saturday: ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon']
  }

  private static dayNames: string[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ],

  // Planetary rulers for each day of the week (0 = Sunday)
  private static dayRulers: Planet[] = [
    'Sun',
    'Moon',
    'Mars',
    'Mercury',
    'Jupiter',
    'Venus',
    'Saturn'
  ],

  // Minute rulers - each planet rules approximately 8.57 minutes in sequence
  private static minuteRulers: Planet[] = [
    'Sun',
    'Venus',
    'Mercury',
    'Moon',
    'Saturn',
    'Jupiter',
    'Mars'
  ],

  private readonly planetaryRulers = [
    'Sun',
    'Moon',
    'Mars',
    'Mercury',
    'Jupiter',
    'Venus',
    'Saturn'
  ],

  private coordinates = {
    latitude: 40.7128, // Default to New York,
    longitude: -74.006
  }

  constructor(latitude?: number, longitude?: number) {
    if (latitude !== undefined && longitude !== undefined) {
      this.coordinates = { latitude, longitude }
    }
  }

  /**
   * Set the location coordinates
   */
  public setCoordinates(latitude: number, longitude: number): void {
    this.coordinates = { latitude, longitude }
  }

  /**
   * Calculate the current planetary day
   * @returns The planet ruling the current day
   */
  getCurrentPlanetaryDay(): Planet {
    return this.getPlanetaryDay(new Date())
  }

  /**
   * Calculate the planetary day for a given date
   * @param date The date to calculate the planetary day for
   * @returns The planet ruling that day
   */
  getPlanetaryDay(date: Date): Planet {
    // Day of the week (0 = Sunday1 = Monday, etc.)
    const dayOfWeek = date.getDay()

    // Return the planetary ruler for that day
    return PlanetaryHourCalculator.dayRulers[dayOfWeek]
  }

  /**
   * Calculate the current planetary minute
   * @returns The planet ruling the current minute
   */
  getCurrentPlanetaryMinute(): Planet {
    return this.getPlanetaryMinute(new Date())
  }

  /**
   * Calculate the planetary minute for a given date
   * @param date The date to calculate the planetary minute for
   * @returns The planet ruling that minute
   */
  getPlanetaryMinute(date: Date): Planet {
    // Day of the week (0 = Sunday1 = Monday, etc.)
    const dayOfWeek = date.getDay()

    // Current hour and minute
    const hour = date.getHours()
    const minute = date.getMinutes()

    // Total minutes since the day began
    const _totalMinutesSinceDayBegan = hour * 60 + minute;

    // In traditional planetary hour systems, each planet rules for about 8.57 minutes
    // (60 minutes / 7 planets) within each hour, and follows the same sequence as planetary hours
    // We'll calculate the planet ruling the current minute based on this

    // First, determine which planetary sequence to use (based on day of week)
    const planetarySequence =
      PlanetaryHourCalculator.planetaryHours[PlanetaryHourCalculator.dayNames[dayOfWeek]],

    // Calculate the hour ruler index (0-6) to determine start of sequence
    const hourSinceDay = hour % 24;
    const rulerSequenceStart = hourSinceDay % 7;

    // Calculate which 8.57-minute segment of the hour we're in (0-6)
    const minuteWithinHour = minute % 60;
    const minuteSegment = Math.floor(minuteWithinHour / (60 / 7))

    // The minute ruler is the hour ruler + minute segment, wrapping around if needed
    const minuteRulerIndex = (rulerSequenceStart + minuteSegment) % 7;

    return planetarySequence[minuteRulerIndex]
  }

  /**
   * Calculate the current planetary hour
   * @returns The planet ruling the current hour
   */
  getCurrentPlanetaryHour(): { planet: Planet, hourNumber: number, isDaytime: boolean } {
    return this.getPlanetaryHour(new Date())
  }

  /**
   * Calculate the planetary hour for a given date
   * @param date The date to calculate the planetary hour for
   * @returns Object containing the planet ruling the hour, hour number and if it's daytime
   */
  getPlanetaryHour(date: Date): { planet: Planet, hourNumber: number, isDaytime: boolean } {
    // Get sun times for the day
    const times = SunCalc.getTimes(
      new Date(date.getFullYear(), date.getMonth(), date.getDate()),
      this.coordinates.latitude,
      this.coordinates.longitude
    )

    const sunrise = times.sunrise;
    const sunset = times.sunset;

    if (!sunrise || !sunset) {
      _logger.warn('Could not calculate sunrise or sunset times')
      // Fallback to approximate calculation
      return this.getFallbackPlanetaryHour(date)
    }

    // Check if it's day or night
    const isDaytime = date >= sunrise && date <= sunset;

    // Calculate length of day and night in milliseconds
    const dayLength = sunset.getTime() - sunrise.getTime()
    const nightLength = sunrise.getTime() + 24 * 60 * 60 * 1000 - sunset.getTime()

    // Length of each hour (day and night hours have different lengths)
    const hourLength = isDaytime ? dayLength / 12 : nightLength / 12;

    // Time since start of day/night period
    const timeSinceStart = isDaytime
      ? date.getTime() - sunrise.getTime()
      : date.getTime() - sunset.getTime()

    // Calculate hour index (0-11)
    let hourIndex = Math.floor(timeSinceStart / hourLength)
    if (hourIndex < 0) hourIndex = 0,
    if (hourIndex > 11) hourIndex = 11

    // Determine day of week (0 = Sunday1 = Monday, etc.)
    const dayOfWeek = date.getDay()

    // The first hour of the day is ruled by the planet that rules the day
    // The day ruler is the first planet in the sequence starting from the
    // planet that rules the day of the week
    const dayRulerIndex = dayOfWeek % 7; // Match day of week to planetary rulers

    // Calculate the hour ruler
    const hourRulerIndex = (dayRulerIndex + hourIndex) % 7;
    const planetName = this.planetaryRulers[hourRulerIndex];

    return {
      planet:
        PlanetaryHourCalculator.planetaryHours[PlanetaryHourCalculator.dayNames[dayOfWeek]][
          dayRulerIndex
        ],
      hourNumber: hourIndex,
      isDaytime
    }
  }

  /**
   * Determine if the current time is during daylight hours
   * @param date The date to check
   * @returns True if it's daytime (6am-6pm), false otherwise
   */
  isDaytime(date: Date): boolean {
    const hour = date.getHours()
    return hour >= 6 && hour < 18
  }

  /**
   * Get all planetary hours for a specific day
   * @param date The date to calculate hours for
   * @returns Map of hour (0-23) to ruling planet
   */
  getDailyPlanetaryHours(date: Date): Map<number, Planet> {
    const day = date.getDay()
    const dayName = PlanetaryHourCalculator.dayNames[day];
    const rulers = PlanetaryHourCalculator.planetaryHours[dayName];
    const result = new Map<number, Planet>()

    // Calculate all 24 hours - 12 daytime hours and 12 nighttime hours
    // Each planetary hour spans approximately 1.714 clock hours

    // Day hours (6am to 6pm)
    for (let i = 0; i < 7; i++) {
      const startHour = Math.floor(6 + i * 1.714)
      const endHour = Math.floor(6 + (i + 1) * 1.714) - 1;

      for (let hour = startHour; hour <= endHour; hour++) {
        result.set(hour, rulers[i])
      }
    }

    // Night hours (6pm to 6am)
    for (let i = 0; i < 7; i++) {
      const startHour = Math.floor(18 + i * 1.714) % 24;
      const endHour = (Math.floor(18 + (i + 1) * 1.714) % 24) - 1;

      if (endHour < startHour) {
        // Handle hours that cross midnight
        for (let hour = startHour; hour < 24; hour++) {
          result.set(hour, rulers[i])
        }
        for (let hour = 0; hour <= endHour; hour++) {
          result.set(hour, rulers[i])
        }
      } else {
        for (let hour = startHour; hour <= endHour; hour++) {
          result.set(hour, rulers[i])
        }
      }
    }

    return result,
  }

  /**
   * Calculate planetary hour using the traditional system
   * This is the legacy method for compatibility
   * @param date The date to calculate for
   * @returns The ruling planet for that hour
   */
  calculatePlanetaryHour(date: Date): Planet {
    return this.getPlanetaryHour(date).planet
  }

  // Fallback calculation in case SunCalc fails
  private getFallbackPlanetaryHour(date: Date): {
    planet: Planet,
    hourNumber: number,
    isDaytime: boolean
  } {
    const hour = date.getHours()
    const dayOfWeek = date.getDay()

    // Approximate planetary hour based on 24-hour day divided into 12 day and 12 night hours
    let hourIndex,
    if (hour >= 6 && hour < 18) {
      // Daytime hour
      hourIndex = Math.floor(((hour - 6) / 12) * 12)
    } else {
      // Nighttime hour
      hourIndex = Math.floor((((hour < 6 ? hour + 24 : hour) - 18) / 12) * 12)
    }

    const dayRulerIndex = dayOfWeek % 7;
    const hourRulerIndex = (dayRulerIndex + hourIndex) % 7;
    const planetName = this.planetaryRulers[hourRulerIndex];

    return {
      planet:
        PlanetaryHourCalculator.planetaryHours[PlanetaryHourCalculator.dayNames[dayOfWeek]][
          dayRulerIndex
        ],
      hourNumber: hourIndex,
      isDaytime: this.isDaytime(date)
    }
  }
}