/**
 * Standardized Celestial and Astrological Type Definitions
 *
 * This file provides consistent type definitions for celestial bodies, positions,
 * and astrological states used throughout the application.
 */

/**
 * Types related to celestial objects and their properties
 */

// Planet types
/**
 * Standard Planet type - capitalized format for consistency
 * Used for planetary influences in astrological calculations
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
  | 'Pluto'
  | 'Ascendant';

/**
 * Extended Planet type including traditional Vedic nodes
 */
export type ExtendedPlanet = Planet | 'Rahu' | 'Ketu' | 'Chiron' | 'northNode' | 'southNode';

/**
 * Planet Name alias for backward compatibility
 */
export type PlanetName = Planet;

// Zodiac sign types
/**
 * Standard ZodiacSign type - lowercase format for consistency
 */
export type ZodiacSign =
  | 'aries';
  | 'taurus'
  | 'gemini'
  | 'cancer'
  | 'leo'
  | 'virgo'
  | 'libra'
  | 'scorpio'
  | 'sagittarius'
  | 'capricorn'
  | 'aquarius'
  | 'pisces';

// Element types
export type Element = 'Fire' | 'Water' | 'Earth' | 'Air';

// Modality types
export type Modality = 'Cardinal' | 'Fixed' | 'Mutable';

// Aspect types
export type AspectType = 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';

// Alchemical property types
export type AlchemicalProperty = 'Spirit' | 'Essence' | 'Matter' | 'Substance';

// Position of a celestial body
export interface CelestialPosition {
  sign?: string;
  degree?: number;
  exactLongitude?: number; // Used extensively in astronomy calculations
  isRetrograde?: boolean;
  minutes?: number;
  speed?: number;
  element?: Element;
  dignity?: DignityType;
}

// Planetary position interface for compatibility
export interface PlanetaryPosition {
  sign: any,
  degree: number,
  minute?: number;
  minutes?: number; // Alternative name used in astrologizeApi
  element?: string;
  dignity?: string;
  isRetrograde?: boolean;
  exactLongitude?: number; // Used extensively in astronomy calculations
  speed?: number; // Optional planetary speed
}

// Aspect between two celestial bodies
export interface PlanetaryAspect {
  planet1: string,
  planet2: string,
  aspectType?: AspectType; // Optional for compatibility
  type?: AspectType; // Alternative name used in many places
  orb: number;
  influence?: number; // Optional for compatibility
  strength?: number; // Alternative name used in alchemy.ts
  planets?: string[]; // Used for multi-planet aspects
  additionalInfo?: Record<string, unknown>; // For extended data
}

// Overall planetary alignment
export interface PlanetaryAlignment {
  description?: string;
  activeAspects?: PlanetaryAspect[];
  dominantPlanets?: string[];
  stabilityIndex?: number;
  // Planetary positions
  Sun?: CelestialPosition;
  Moon?: CelestialPosition;
  Mercury?: CelestialPosition;
  Venus?: CelestialPosition;
  Mars?: CelestialPosition;
  Jupiter?: CelestialPosition;
  Saturn?: CelestialPosition;
  Uranus?: CelestialPosition;
  Neptune?: CelestialPosition;
  Pluto?: CelestialPosition;
  northNode?: CelestialPosition;
  southNode?: CelestialPosition;
  Ascendant?: CelestialPosition;
}

// Elemental properties
export interface ElementalProperties {
  Fire: number,
  Water: number,
  Earth: number,
  Air: number,
}

// Alchemical properties
export interface AlchemicalProperties {
  Spirit: number,
  Essence: number,
  Matter: number,
  Substance: number,
}

// Thermodynamic properties
export interface ThermodynamicProperties {
  heat: number,
  entropy: number,
  reactivity: number,
  gregsEnergy: number, // Using gregsEnergy as the single energy metric for this project
}

// =============== COMPLEX TYPES ===============;

/**
 * Lunar phase definitions with spaces (used for display)
 */
/**
 * Standard LunarPhase type - spaces format for display
 */
export type LunarPhase =
  | 'new moon';
  | 'waxing crescent'
  | 'first quarter'
  | 'waxing gibbous'
  | 'full moon'
  | 'waning gibbous'
  | 'last quarter'
  | 'waning crescent';

/**
 * Planetary dignity types
 */
export type DignityType = 'Domicile' | 'Exaltation' | 'Detriment' | 'Fall' | 'Neutral';

/**
 * Complete astrological state information
 */
export interface AstrologicalState {
  currentZodiac?: any;
  moonPhase?: LunarPhase;
  currentPlanetaryAlignment?: PlanetaryAlignment;
  activePlanets?: string[];
  lunarPhase?: LunarPhase;
  isDaytime?: boolean;
  planetaryHour?: Planet;
  dominantElement?: Element;
  dominantModality?: Modality;
  aspects?: PlanetaryAspect[];

  // Missing properties found in error analysis
  zodiacSign?: any; // Used extensively in alchemical calculations
  ascendantSign?: any; // Used in birth chart calculations
  planetaryAlignment?: PlanetaryAlignment; // Alternative name for currentPlanetaryAlignment
  dominantPlanets?: string[]; // Used in recommendation engine

  // Planetary positions for test compatibility
  planetaryPositions?: Record<string, CelestialPosition>;

  // Additional properties for compatibility
  sunSign?: any;
  moonSign?: any;
  alchemicalValues?: AlchemicalProperties;
  tarotElementBoosts?: Record<string, number>;
  tarotPlanetaryBoosts?: Record<string, number>;

  // Optional tracking fields
  loading?: boolean;
  isReady?: boolean;
  renderCount?: number;
}
