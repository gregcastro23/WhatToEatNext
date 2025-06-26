/**
 * Shared Type Definitions
 * 
 * This file contains centralized type definitions used across the application
 * to prevent duplication and ensure consistency.
 */

import { 
  _ElementalProperties,
  _isElementalProperties,
  DEFAULT_ELEMENTAL_PROPERTIES
} from './elemental';

// ========== ELEMENTAL TYPES ==========

/**
 * The four primary elements in our system
 */
export type Element = 'Fire' | 'Water' | 'Air' | 'Earth';

// Re-export the elemental properties types
export type {
  ElementalProperties
};
// Re-export utility functions and constants
export {
  isElementalProperties,
  DEFAULT_ELEMENTAL_PROPERTIES
};

// ========== CELESTIAL TYPES ==========

/**
 * Celestial position type
 */
export interface CelestialPosition {
  sign?: string;
  degree?: number;
  exactLongitude?: number;
  isRetrograde?: boolean;
  minutes?: number;
  speed?: number;
  element?: Element;
  dignity?: DignityType;
}

/**
 * Dignity types for planetary positions
 */
export type DignityType = 'Domicile' | 'Exaltation' | 'Detriment' | 'Fall' | 'Neutral';

/**
 * Zodiac signs
 */
export type ZodiacSign = 'aries' | 'taurus' | 'gemini' | 'cancer' | 'leo' | 'virgo' | 'libra' | 'scorpio' | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';

/**
 * Planet names - all lowercase as per project requirements
 */
export type Planet = 'sun' | 'moon' | 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune' | 'pluto';

// ========== LUNAR TYPES ==========

/**
 * Lunar phases with spaces (UI friendly)
 */
export type LunarPhaseWithSpaces = 'new moon' | 'waxing crescent' | 'first quarter' | 'waxing gibbous' | 'full moon' | 'waning gibbous' | 'last quarter' | 'waning crescent';

/**
 * Default LunarPhase type using spaces format
 */
export type LunarPhase = LunarPhaseWithSpaces;

/**
 * Standardized MoonPhase type to be used throughout the codebase.
 * This includes all possible moon phase values in uppercase format.
 */
export type MoonPhase = 
  | 'NEW_MOON' 
  | 'WAXING_CRESCENT' 
  | 'FIRST_QUARTER' 
  | 'WAXING_GIBBOUS' 
  | 'FULL_MOON' 
  | 'WANING_GIBBOUS' 
  | 'LAST_QUARTER' 
  | 'WANING_CRESCENT';

/**
 * MoonPhase with spaces format for display purposes
 */
export type MoonPhaseWithSpaces = 
  | 'New Moon' 
  | 'Waxing Crescent' 
  | 'First Quarter' 
  | 'Waxing Gibbous' 
  | 'Full Moon' 
  | 'Waning Gibbous' 
  | 'Last Quarter' 
  | 'Waning Crescent';

/**
 * MoonPhase with underscores format for storage and API purposes
 */
export type MoonPhaseWithUnderscores = 
  | 'new_moon' 
  | 'waxing_crescent' 
  | 'first_quarter' 
  | 'waxing_gibbous' 
  | 'full_moon' 
  | 'waning_gibbous' 
  | 'last_quarter' 
  | 'waning_crescent';

/**
 * Lowercase moon phases with spaces for backward compatibility
 */
export type LowercaseMoonPhaseWithSpaces =
  | 'new moon'
  | 'waxing crescent'
  | 'first quarter'
  | 'waxing gibbous'
  | 'full moon'
  | 'waning gibbous'
  | 'last quarter'
  | 'waning crescent';

/**
 * Mapping between different lunar phase formats
 */
export const MOON_PHASE_MAP: Record<MoonPhaseWithUnderscores, MoonPhase> = {
  'new_moon': 'NEW_MOON',
  'waxing_crescent': 'WAXING_CRESCENT',
  'first_quarter': 'FIRST_QUARTER',
  'waxing_gibbous': 'WAXING_GIBBOUS',
  'full_moon': 'FULL_MOON',
  'waning_gibbous': 'WANING_GIBBOUS',
  'last_quarter': 'LAST_QUARTER',
  'waning_crescent': 'WANING_CRESCENT'
};

/**
 * Mapping from MoonPhase to MoonPhaseWithSpaces for display
 */
export const MOON_PHASE_TO_DISPLAY: Record<MoonPhase, MoonPhaseWithSpaces> = {
  'NEW_MOON': 'New Moon',
  'WAXING_CRESCENT': 'Waxing Crescent',
  'FIRST_QUARTER': 'First Quarter',
  'WAXING_GIBBOUS': 'Waxing Gibbous',
  'FULL_MOON': 'Full Moon',
  'WANING_GIBBOUS': 'Waning Gibbous',
  'LAST_QUARTER': 'Last Quarter',
  'WANING_CRESCENT': 'Waning Crescent'
};

/**
 * Mapping from MoonPhase to lowercase moon phases with spaces
 */
export const MOON_PHASE_TO_LOWERCASE: Record<MoonPhase, LowercaseMoonPhaseWithSpaces> = {
  'NEW_MOON': 'new moon',
  'WAXING_CRESCENT': 'waxing crescent',
  'FIRST_QUARTER': 'first quarter',
  'WAXING_GIBBOUS': 'waxing gibbous',
  'FULL_MOON': 'full moon',
  'WANING_GIBBOUS': 'waning gibbous',
  'LAST_QUARTER': 'last quarter',
  'WANING_CRESCENT': 'waning crescent'
};

/**
 * Mapping from lowercase moon phases with spaces to MoonPhase
 */
export const LOWERCASE_TO_MOON_PHASE: Record<LowercaseMoonPhaseWithSpaces, MoonPhase> = {
  'new moon': 'NEW_MOON',
  'waxing crescent': 'WAXING_CRESCENT',
  'first quarter': 'FIRST_QUARTER',
  'waxing gibbous': 'WAXING_GIBBOUS',
  'full moon': 'FULL_MOON',
  'waning gibbous': 'WANING_GIBBOUS',
  'last quarter': 'LAST_QUARTER',
  'waning crescent': 'WANING_CRESCENT'
};

/**
 * Convenience type for elemental scoring
 */
export interface ElementalScore {
  element: string;
  score: number;
}

// ========== SEASONAL TYPES ==========

/**
 * Seasons of the year
 * Note: Both 'autumn' and 'fall' are included for flexibility
 */
export type Season = 'spring' | 'summer' | 'autumn' | 'fall' | 'winter';

// ========== UI COMPONENT TYPES ==========

/**
 * View options for recipe displays
 */
export type ViewOption = 'grid' | 'list' | 'compact';

/**
 * Elemental filter types
 */
export type ElementalFilter = 'all' | 'Fire' | 'Water' | 'Air' | 'Earth';

// ========== THERMODYNAMIC TYPES ==========

/**
 * Thermodynamic properties for cooking methods and ingredients
 */
export interface ThermodynamicProperties {
  heat: number;
  entropy: number;
  reactivity: number;
  gregsEnergy: number; // Using gregsEnergy as the single energy metric for this project
}

// ========== COOKING TYPES ==========

/**
 * Comprehensive cooking methods including traditional, modern, and molecular techniques
 * Using string literal union for index type compatibility
 */
export type CookingMethod = 
  // Basic/Traditional methods
  | 'baking' 
  | 'boiling' 
  | 'roasting' 
  | 'steaming' 
  | 'frying' 
  | 'grilling' 
  | 'sauteing' 
  | 'raw'
  // Dry heat methods
  | 'broiling'
  // Wet methods  
  | 'simmering'
  // Specialized frying
  | 'stir-frying'
  // Traditional preservation/fermentation
  | 'fermentation'
  | 'pickling'
  // Molecular gastronomy
  | 'gelification'
  | 'spherification'
  // Additional common methods
  | 'braising'
  | 'poaching'
  | 'smoking'
  | 'curing'
  | 'pressure_cooking'
  | 'slow_cooking'
  | 'dehydrating'
  | 'blanching'
  | 'stewing'
  | 'sous_vide'
  | 'deep_frying'
  | 'marinating'
  | 'confit'
  | 'tempering'
  | 'caramelizing'
  | 'reduction'
  | 'emulsification'
  | 'infusing'
  | 'toasting'
  | 'grinding'
  | 'drying'
  | 'fermenting';

// Helper type for cooking method data records
export type CookingMethodRecord<T> = Record<CookingMethod, T>; 