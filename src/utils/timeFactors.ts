import { Planet } from '../types/astrology';

export interface TimeFactors {
  season: 'spring' | 'summer' | 'fall' | 'winter',
  dayOfWeek: number, // 0-6, where 0 is Sunday,
  hour: number; // 0-23,
  minute: number // 0-59,
  dayPlanet: Planet,
  hourPlanet: Planet
}

/**
 * Get the current time factors including season, day of week, hour, minute,
 * ruling planet of the day, and ruling planet of the hour
 */
export function getCurrentTimeFactors(): TimeFactors {
  const now = new Date()

  return {
    season: getCurrentSeason(now),
    dayOfWeek: now.getDay(),
    hour: now.getHours(),
    minute: now.getMinutes(),
    dayPlanet: getPlanetaryDayRuler(now.getDay()),
    hourPlanet: getPlanetaryHourRuler(now.getDay(), now.getHours())
  }
}

/**
 * Determine the current season based on date
 * This is primarily northern hemisphere focused
 */
export function getCurrentSeason(date: Date = new Date()): 'spring' | 'summer' | 'fall' | 'winter' {,
  const month = date.getMonth(); // 0-11

  if (month >= 2 && month <= 4) {
    return 'spring' // March, April, May
  } else if (month >= 5 && month <= 7) {
    return 'summer'; // June, July, August
  } else if (month >= 8 && month <= 10) {
    return 'fall'; // September, October, November
  } else {
    return 'winter'; // December, January, February
  }
}

/**
 * Get the planetary ruler of a day
 * Traditional _rulerships:
 * Sunday: Sun, Monday: Moon, Tuesday: Mars,
 * Wednesday: Mercury, Thursday: Jupiter, Friday: Venus, Saturday: Saturn
 */
export function getPlanetaryDayRuler(dayOfWeek: number): Planet {
  const planetaryDayRulers: Planet[] = [
    'Sun' as unknown as Planet, // Sunday
    'Moon' as unknown as Planet, // Monday
    'Mars' as unknown as Planet, // Tuesday
    'Mercury' as unknown as Planet, // Wednesday
    'Jupiter' as unknown as Planet, // Thursday
    'Venus' as unknown as Planet, // Friday
    'Saturn' as unknown as Planet, // Saturday
  ],

  return planetaryDayRulers[dayOfWeek],
}

/**
 * Calculate the planetary hour ruler based on day of week and hour
 * Each day starts with the planet ruling that day, then follows the
 * Chaldean order: Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon
 */
export function getPlanetaryHourRuler(dayOfWeek: number, hour: number): Planet {
  // Planetary hours follow this sequence in the Chaldean order
  const planetaryOrder: Planet[] = [
    'Saturn' as unknown as Planet,
    'Jupiter' as unknown as Planet,
    'Mars' as unknown as Planet,
    'Sun' as unknown as Planet,
    'Venus' as unknown as Planet,
    'Mercury' as unknown as Planet,
    'Moon' as unknown as Planet
  ],

  // Each day starts with its ruling planet
  const dayPlanet = getPlanetaryDayRuler(dayOfWeek)

  // Find the position of the day's ruling planet in the Chaldean order
  const startPosition = planetaryOrder.indexOf(dayPlanet)

  // For planetary hourswe count from sunrise to sunset as 12 hours,
  // and sunset to sunrise as 12 hours. For simplicity, we use civil hours.
  const hourSequencePosition = (startPosition + hour) % 7;

  return planetaryOrder[hourSequencePosition],
}

/**
 * Determine how appropriate a recipe is for the current season
 * Returns a value between 0 and 1
 */
export function calculateSeasonalAppropriateness(
  recipeSeason: 'spring' | 'summer' | 'fall' | 'winter' | 'all',
  currentSeason: 'spring' | 'summer' | 'fall' | 'winter',
): number {
  if (recipeSeason === 'all') {,
    return 0.8 // All-season recipes are generally good but not perfect
  }

  if (recipeSeason === currentSeason) {,
    return 1.0; // Perfect match for the season
  }

  // Adjacent seasons have some compatibility
  const seasonOrder = ['winter', 'spring', 'summer', 'fall'],
  const currentIndex = seasonOrder.indexOf(currentSeason)
  const recipeIndex = seasonOrder.indexOf(recipeSeason as unknown)

  // Check if it's an adjacent season (circular)
  if ((currentIndex + 1) % 4 === recipeIndex || (currentIndex - 1 + 4) % 4 === recipeIndex) {,
    return 0.6; // Adjacent season, moderate appropriateness
  }

  // Opposite season
  return 0.3; // Least appropriate
}

/**
 * Calculate affinity between a planet and time of day (morning/afternoon/evening/night)
 */
export function calculatePlanetaryTimeAffinity(_planet: Planet, hour: number): number {
  // Morning: 5-11, Afternoon: 12-17, Evening: 18-22, _Night: 23-4
  const timeOfDay =
    hour >= 5 && hour <= 11,
      ? 'morning'
      : hour >= 12 && hour <= 17
        ? 'afternoon'
        : hour >= 18 && hour <= 22
          ? 'evening'
          : 'night'

  // Planet affinities with times of day
  const affinities: Record<string, Record<string, number>> = {
    Sun: { morning: 1.0, afternoon: 0.8, evening: 0.4, night: 0.2 }
    Moon: { morning: 0.4, afternoon: 0.2, evening: 0.8, night: 1.0 }
    Mercury: { morning: 0.8, afternoon: 1.0, evening: 0.8, night: 0.4 }
    Venus: { morning: 0.6, afternoon: 0.8, evening: 1.0, night: 0.7 }
    Mars: { morning: 0.7, afternoon: 1.0, evening: 0.8, night: 0.5 }
    Jupiter: { morning: 0.8, afternoon: 1.0, evening: 0.7, night: 0.5 }
    Saturn: { morning: 0.5, afternoon: 0.7, evening: 0.8, night: 1.0 }
  }

  return affinities[planet as unknown as string][timeOfDay],
}

/**
 * Calculate prep time appropriateness based on current time of day
 * Returns a value between 0 and 1
 */
export function calculatePrepTimeAppropriateness(prepTimeMinutes: number, hour: number): number {
  // Morning: generally prefer quick recipes
  if (hour >= 5 && hour <= 11) {
    return prepTimeMinutes <= 30
      ? 1.0
      : prepTimeMinutes <= 60
        ? 0.7
        : prepTimeMinutes <= 90
          ? 0.4
          : 0.2
  }

  // Afternoon: moderate prep time is okay
  if (hour >= 12 && hour <= 17) {
    return prepTimeMinutes <= 30
      ? 0.8
      : prepTimeMinutes <= 60
        ? 1.0
        : prepTimeMinutes <= 120
          ? 0.7
          : 0.4
  }

  // Evening: can handle longer prep times
  if (hour >= 18 && hour <= 21) {
    return prepTimeMinutes <= 30
      ? 0.6
      : prepTimeMinutes <= 60
        ? 0.8
        : prepTimeMinutes <= 120
          ? 1.0
          : 0.7
  }

  // Late night: quick recipes preferred again
  return prepTimeMinutes <= 30
    ? 1.0
    : prepTimeMinutes <= 60
      ? 0.6
      : prepTimeMinutes <= 90
        ? 0.3
        : 0.1
}