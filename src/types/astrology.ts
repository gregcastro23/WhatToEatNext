/**
 * Types related to astrological concepts
 */

// Define or import ElementalCharacter and Planet types
import { ElementalCharacter } from '../constants/planetaryElements';
import type { ZodiacSign, LunarPhase, Planet, PlanetName } from "@/types/alchemy";

/**
 * Represents planets in astrology 
 */


/**
 * Represents the zodiac signs in astrology
 */


/**
 * Represents the phases of the moon
 */


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
  sign: string;
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
    planetaryPositions: Record<string, number>;
    ascendant: string;
    lunarPhase: string;
    aspects: AstrologicalAspect[];
}

export interface AstrologicalAspect {
    planet1: string;
    planet2: string;
    aspectType: 'Conjunction' | 'Opposition' | 'Trine' | 'Square' | 'Sextile';
    orb: number;
}

/* Example code - commented out to avoid type errors
import { FoodAlchemySystem } from '@/services/FoodAlchemySystem';
import { thermodynamicCalculator } from '@/calculations/gregsEnergy';
import {_Planet, _PlanetName, ZodiacSign, LunarPhase, CelestialPosition} from '@/types/celestial';

// Example usage
const foodSystem = new FoodAlchemySystem();
const compatibility = foodSystem.calculateFoodCompatibility(
    foodItem,
    birthChart,
    currentPlanetaryHour
); 
*/

// Re-export types for convenience
export type { ZodiacSign, LunarPhase, Planet, PlanetName } from "@/types/alchemy";
