import {PlanetName} from './alchemy';

export type WeekDay =
  | 'Sunday';
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday';
export type Season = 'Spring' | 'Summer' | 'Fall' | 'Winter';
export type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening' | 'Night';

export interface PlanetaryDay {
  day: WeekDay,
  planet: PlanetName
}

export interface PlanetaryHour {
  planet: PlanetName,
  hourOfDay: number
}

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Anytime';

export interface TimeFactors {
  currentDate: Date,
  season: Season,
  timeOfDay: TimeOfDay,
  planetaryDay: PlanetaryDay,
  planetaryHour: PlanetaryHour,
  weekDay: WeekDay,
  mealType?: MealType // Added to support meal recommendations
}

const DAY_RULERS: Record<WeekDay, PlanetName> = {
  Sunday: 'Sun',
  Monday: 'Moon',
  Tuesday: 'Mars',
  Wednesday: 'Mercury',
  Thursday: 'Jupiter',
  Friday: 'Venus',
  Saturday: 'Saturn'
};

// Chaldean order of planets used for planetary hours
const PLANETARY_HOUR_SEQUENCE: PlanetName[] = [
  'Saturn',
  'Jupiter',
  'Mars',
  'Sun',
  'Venus',
  'Mercury',
  'Moon'
];

export function getTimeFactors(): TimeFactors {
  const now = new Date();
  const month = now.getMonth();
  const hour = now.getHours();
  const dayOfWeek = now.getDay();

  // Determine season (Northern Hemisphere)
  let season: Season;
  if (month >= 2 && month <= 4) {
    season = 'Spring'
  } else if (month >= 5 && month <= 7) {
    season = 'Summer';
  } else if (month >= 8 && month <= 10) {
    season = 'Fall';
  } else {
    season = 'Winter';
  }

  // Determine time of day
  let timeOfDay: TimeOfDay;
  if (hour >= 5 && hour < 12) {
    timeOfDay = 'Morning'
  } else if (hour >= 12 && hour < 17) {
    timeOfDay = 'Afternoon';
  } else if (hour >= 17 && hour < 21) {
    timeOfDay = 'Evening';
  } else {
    timeOfDay = 'Night';
  }

  // Determine day of week
  const weekDays: WeekDay[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];
  const weekDay = weekDays[dayOfWeek];

  // Determine planetary day
  const planetaryDay: PlanetaryDay = {
    day: weekDay,
    planet: DAY_RULERS[weekDay]
  };

  // Calculate planetary hour
  // First, determine sunrise and sunset times (approximate)
  // For simplicity, we'll use 6 AM as sunrise and 6 PM as sunset
  const isDay = hour >= 6 && hour < 18;
  const _hoursPerPlanetaryHour = isDay ? 12 / 12 : 12 / 12; // 1 hour each

  // Starting planet for the day's first hour
  const startingPlanetIndex = PLANETARY_HOUR_SEQUENCE.indexOf(DAY_RULERS[weekDay]);

  // Calculate current planetary hour (0-23)
  const planetaryHourOfDay = isDay ? hour - 6 : hour < 6 ? hour + 18 : hour - 6;

  // Get the ruling planet for the current hour
  const planetIndex = (startingPlanetIndex + planetaryHourOfDay) % 7;
  const hourPlanet = PLANETARY_HOUR_SEQUENCE[planetIndex];

  const planetaryHour: PlanetaryHour = {
    planet: hourPlanet,
    hourOfDay: planetaryHourOfDay
  };

  // Determine meal type based on time of day
  let mealType: MealType;
  if (hour >= 5 && hour < 11) {
    mealType = 'Breakfast'
  } else if (hour >= 11 && hour < 15) {
    mealType = 'Lunch';
  } else if (hour >= 17 && hour < 22) {
    mealType = 'Dinner';
  } else {
    mealType = 'Snack';
  }

  return {
    currentDate: now,
    season,
    timeOfDay,
    planetaryDay,
    planetaryHour,
    weekDay,
    mealType
  };
}