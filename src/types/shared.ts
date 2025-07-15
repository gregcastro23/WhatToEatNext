/**
 * Shared Type Definitions
 * 
 * This file contains centralized type definitions used across the application
 * to prevent duplication and ensure consistency.
 */

import { 
  ElementalProperties,
  isElementalProperties,
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

// Lunar phase types are now imported from @/types/alchemy
// All lunar phase definitions have been consolidated to use the canonical LunarPhase type

// Lunar phase mappings are now handled by @/utils/lunarPhaseUtils.ts

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
import type { Season } from './alchemy';

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