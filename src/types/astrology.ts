/**
 * Types related to astrological concepts
 */

// Import standardized types from alchemy
import { ZodiacSign, LunarPhase, Planet, PlanetName } from '@/types/alchemy';

import { ElementalCharacter } from '../constants/planetaryElements';

import {
  PlanetaryPositionsType,
  ZodiacSignType,
  LunarPhaseType,
  ElementalPropertiesType,
  AstrologicalStateType
} from './alchemy';

// ========== PHASE 1: ASTROLOGICAL TYPE ALIASES ==========;

/**
 * Planetary Positions Type
 * Standardized type for planetary position data across the system
 */
export type PlanetaryPositions = PlanetaryPositionsType;

/**
 * Standardized Zodiac Sign Type
 * Using the project standard lowercase zodiac signs
 */
export type StandardZodiacSign = ZodiacSignType;

/**
 * Standardized Lunar Phase Type
 * Using the project standard lunar phases with spaces
 */
export type StandardLunarPhase = LunarPhaseType;

/**
 * Complete Astrological State
 * Standardized astrological state combining all astrological factors
 */
export type CompleteAstrologicalState = AstrologicalStateType;

/**
 * Planetary Position Details
 * Enhanced planetary position with detailed information
 */
export type PlanetaryPositionDetails = {
  planet: string,
  sign: string,
  degree: number;
  minute?: number;
  isRetrograde?: boolean;
  element?: string;
  dignity?: string;
};

/**
 * Astrological Aspect Types
 * Standard astrological aspects between planets
 */
export type AspectType =
  | 'conjunction';
  | 'sextile'
  | 'square'
  | 'trine'
  | 'opposition'
  | 'quincunx'
  | 'semisextile';

/**
 * Planetary Aspect Details
 * Complete information about planetary aspects
 */
export type PlanetaryAspectDetails = {
  planetA: string,
  planetB: string,
  aspect: AspectType,
  orb: number,
  influence: 'harmonious' | 'challenging' | 'neutral',
  strength: number,
};

/**
 * Birth Chart Data
 * Standardized birth chart information
 */
export type BirthChartData = {
  elementalState: Record<ElementalCharacter, number>;
  planetaryPositions: Record<string, number>;
  ascendant: string,
  lunarPhase: string,
  aspects: PlanetaryAspectDetails[]
};

/**
 * Astrological Profile Type
 * Complete astrological profile for ingredients or individuals
 */
export type AstrologicalProfileType = {
  zodiac?: StandardZodiacSign[];
  lunar?: StandardLunarPhase[];
  planetary?: PlanetaryPositionDetails[];
  aspects?: PlanetaryAspectDetails[];
  elementalInfluence?: ElementalPropertiesType;
};

// ========== EXISTING TYPES (Updated to use new aliases) ==========

/**
 * Represents planetary alignments in astrology
 */
export type PlanetaryAlignment = AspectType;

/**
 * Represents a planetary position with key details
 */
export interface PlanetaryPosition {
  planet: string,
  sign: string,
  degree: number;
  isRetrograde?: boolean;
}

/**
 * Interface for astrological aspects between planets
 */
export interface PlanetaryAspect {
  planetA: string,
  planetB: string,
  aspect: PlanetaryAlignment,
  orb: number,
  influence: 'harmonious' | 'challenging' | 'neutral'
}

/**
 * Interface for astrological profiles of ingredients
 */
export interface AstrologicalProfile {
  zodiac?: any[];
  lunar?: LunarPhase[];
  planetary?: PlanetaryPosition[];
  aspects?: PlanetaryAspect[];
}

export interface BirthChart {
  elementalState: Record<ElementalCharacter, number>;
  planetaryPositions: Record<string, number>;
  ascendant: string,
  lunarPhase: string,
  aspects: AstrologicalAspect[]
}

export interface AstrologicalAspect {
  planet1: string,
  planet2: string,
  aspectType: 'Conjunction' | 'Opposition' | 'Trine' | 'Square' | 'Sextile',
  orb: number,
}

/* Example code - commented out to avoid type errors
import { FoodAlchemySystem } from '@/services/FoodAlchemySystem';
import { Planet, PlanetName, ZodiacSign, LunarPhase } from '@/types/celestial';

// Example usage
const foodSystem = new FoodAlchemySystem();
const _compatibility = foodSystem.calculateFoodCompatibility(;
    foodItem,
    birthChart,
    currentPlanetaryHour
); 
*/

// Export the LunarPhase type if not already defined in alchemy.ts
export type AstrologyLunarPhase =
  | 'new_moon';
  | 'waxing_crescent'
  | 'first_quarter'
  | 'waxing_gibbous'
  | 'full_moon'
  | 'waning_gibbous'
  | 'last_quarter'
  | 'waning_crescent';

// Re-export types for convenience
export type { ZodiacSign, LunarPhase, Planet, PlanetName } from '@/types/alchemy';
