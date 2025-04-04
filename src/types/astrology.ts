/**
 * Types related to astrological concepts
 */

// Define or import ElementalCharacter and Planet types
import { ElementalCharacter } from '../constants/planetaryElements';

/**
 * Represents planets in astrology 
 */
export type Planet = 
  | 'Sun'
  | 'Moon'
  | 'Mercury'
  | 'Venus'
  | 'Mars'
  | 'Jupiter'
  | 'Saturn'
  | 'Uranus'
  | 'Neptune'
  | 'Pluto';

/**
 * Represents the zodiac signs in astrology
 */
export type ZodiacSign = 
  | 'Aries'
  | 'Taurus'
  | 'Gemini'
  | 'Cancer'
  | 'Leo'
  | 'Virgo'
  | 'Libra'
  | 'Scorpio'
  | 'Sagittarius'
  | 'Capricorn'
  | 'Aquarius'
  | 'Pisces';

/**
 * Represents the phases of the moon
 */
export type LunarPhase = 
  | 'new_moon'
  | 'waxing_crescent'
  | 'first_quarter'
  | 'waxing_gibbous'
  | 'full_moon'
  | 'waning_gibbous'
  | 'third_quarter'
  | 'waning_crescent';

/**
 * Represents planetary alignments in astrology
 */
export type PlanetaryAlignment = 
  | 'conjunction'
  | 'sextile'
  | 'square'
  | 'trine'
  | 'opposition'
  | 'quincunx'
  | 'semisextile';

/**
 * Represents a planetary position with key details
 */
export interface PlanetaryPosition {
  planet: string;
  sign: ZodiacSign;
  degree: number;
  isRetrograde?: boolean;
}

/**
 * Interface for astrological aspects between planets
 */
export interface PlanetaryAspect {
  planetA: string;
  planetB: string;
  aspect: PlanetaryAlignment;
  orb: number;
  influence: 'harmonious' | 'challenging' | 'neutral';
}

/**
 * Interface for astrological profiles of ingredients
 */
export interface AstrologicalProfile {
  zodiac?: ZodiacSign[];
  lunar?: LunarPhase[];
  planetary?: PlanetaryPosition[];
  aspects?: PlanetaryAspect[];
}

export interface BirthChart {
    elementalState: Record<ElementalCharacter, number>;
    planetaryPositions: Record<Planet, number>;
    ascendant: string;
    lunarPhase: LunarPhase;
    aspects: AstrologicalAspect[];
}

export interface AstrologicalAspect {
    planet1: Planet;
    planet2: Planet;
    aspectType: 'Conjunction' | 'Opposition' | 'Trine' | 'Square' | 'Sextile';
    orb: number;
}

/* Example code - commented out to avoid type errors
import { FoodAlchemySystem } from '@/services/FoodAlchemySystem';
import { thermodynamicCalculator } from '@/calculations/gregsEnergy';

// Example usage
const foodSystem = new FoodAlchemySystem();
const compatibility = foodSystem.calculateFoodCompatibility(
    foodItem,
    birthChart,
    currentPlanetaryHour
); 
*/

// Export the LunarPhase type if not already defined in alchemy.ts
export type AstrologyLunarPhase = 
  | 'new_moon'
  | 'waxing_crescent'
  | 'first_quarter'
  | 'waxing_gibbous'
  | 'full_moon'
  | 'waning_gibbous'
  | 'last_quarter'
  | 'waning_crescent'; 