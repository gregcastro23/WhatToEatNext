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
export type Planet = 'sun' | 'moon' | 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune' | 'pluto' | 'northnode' | 'southnode' | 'chiron' | 'ascendant';

// Zodiac sign types
export type ZodiacSign = 'aries' | 'taurus' | 'gemini' | 'cancer' | 'leo' | 'virgo' | 'libra' | 'scorpio' | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';

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
  exactLongitude?: number;
  isRetrograde?: boolean;
  minutes?: number;
  speed?: number;
  element?: Element;
  dignity?: DignityType;
}

// Aspect between two celestial bodies
export interface PlanetaryAspect {
  planet1: string;
  planet2: string;
  aspectType: AspectType;
  orb: number;
  influence: number;
}

// Overall planetary alignment
export interface PlanetaryAlignment {
  description?: string;
  activeAspects?: PlanetaryAspect[];
  dominantPlanets?: string[];
  stabilityIndex?: number;
  [key: string]: CelestialPosition | string[] | PlanetaryAspect[] | number | string | undefined;
  sun?: CelestialPosition;
  moon?: CelestialPosition;
  mercury?: CelestialPosition;
  venus?: CelestialPosition;
  mars?: CelestialPosition;
  jupiter?: CelestialPosition;
  saturn?: CelestialPosition;
  uranus?: CelestialPosition;
  neptune?: CelestialPosition;
  pluto?: CelestialPosition;
  northNode?: CelestialPosition;
  southNode?: CelestialPosition;
  ascendant?: CelestialPosition;
}

// Elemental properties
export interface ElementalProperties {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
}

// Alchemical properties
export interface AlchemicalProperties {
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
}

// Thermodynamic properties
export interface ThermodynamicProperties {
  heat: number;
  entropy: number;
  reactivity: number;
}

// =============== COMPLEX TYPES ===============

/**
 * Lunar phase definitions with spaces (used for display)
 */
export type LunarPhase = 
  | 'new moon' | 'waxing crescent' | 'first quarter' | 'waxing gibbous' 
  | 'full moon' | 'waning gibbous' | 'last quarter' | 'waning crescent';

/**
 * Planetary dignity types
 */
export type DignityType = 'Domicile' | 'Exaltation' | 'Detriment' | 'Fall' | 'Neutral';

/**
 * Complete astrological state information
 */
export interface AstrologicalState {
  currentZodiac: ZodiacSign;
  moonPhase: LunarPhase;
  currentPlanetaryAlignment: PlanetaryAlignment;
  activePlanets: string[];
  lunarPhase?: LunarPhase;
  isDaytime?: boolean;
  planetaryHour?: Planet;
  dominantElement?: Element;
  dominantModality?: Modality;
  aspects?: PlanetaryAspect[];
  
  // Optional tracking fields
  loading?: boolean;
  isReady?: boolean;
  renderCount?: number;
} 