// Common types used across the application
import type { Season } from './alchemy';

export type ZodiacSign = 
  | 'aries' | 'taurus' | 'gemini' | 'cancer'
  | 'leo' | 'virgo' | 'libra' | 'scorpio'
  | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';

export interface PlanetaryAlignment {
  Sun: string;
  Moon: string;
  Mercury: string;
  Venus: string;
  Mars: string;
  Jupiter: string;
  Saturn: string;
  Uranus: string;
  Neptune: string;
  Pluto: string;
  Ascendant?: string;
}

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

// Backward-compatibility re-exports for underscore-prefixed and shared types
export type { _ElementalProperties } from './alchemy';
export type { CuisineType } from './alchemy';
