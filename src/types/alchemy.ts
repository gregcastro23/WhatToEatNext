import { ZodiacSign, LunarPhase, Planet, Element, Modality, PlanetaryAlignment, CelestialPosition, PlanetaryAspect, AlchemicalProperties } from '@/types/celestial';
import { Planet, PlanetName, LunarPhase } from '@/types/celestial';

// src/types/alchemy.ts

// ========== CORE ELEMENTAL TYPES ==========

export type Element = 'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether';

export interface ElementalProperties {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
  [key: string]: number; // Allow indexing with string
}

// Also export the lowercase version used in astrologyUtils.ts
export interface LowercaseElementalProperties {
  fire: number;
  water: number;
  earth: number;
  air: number;
  [key: string]: number; // Allow indexing with string
}

export type ElementalRatio = Record<Element, number>;
export type ElementalModifier = Partial<Record<Element, number>>;

// Enhanced elemental interactions
export interface ElementalInteraction {
  primary: Element;
  secondary: Element;
  effect: 'enhance' | 'diminish' | 'transmute';
  potency: number;
  resultingElement?: Element;
}

// ========== COOKING METHOD MODIFIERS ==========

export interface CookingMethodModifier {
  element: Element;
  intensity: number; // 0-1 scale
  effect: 'enhance' | 'transmute' | 'diminish' | 'balance';
  applicableTo: string[]; // food categories this applies to
  duration?: {
    min: number; // minutes
    max: number; 
  };
  notes?: string;
}

// ========== ASTROLOGICAL TYPES ==========

// Format with spaces (UI friendly)
export type LunarPhaseWithSpaces = 'new moon' | 'waxing crescent' | 'first quarter' | 'waxing gibbous' | 'full moon' | 'waning gibbous' | 'last quarter' | 'waning crescent';

// Format with underscores (API/object key friendly)
export type LunarPhaseWithUnderscores = 'new_moon' | 'waxing_crescent' | 'first_quarter' | 'waxing_gibbous' | 'full_moon' | 'waning_gibbous' | 'last_quarter' | 'waning_crescent';

// Default LunarPhase type - use the format with spaces as the primary representation


// Mapping between the two formats
export const LUNAR_PHASE_MAPPING: Record<LunarPhaseWithSpaces, LunarPhaseWithUnderscores> = {
  'new moon': 'new_moon',
  'waxing crescent': 'waxing_crescent',
  'first quarter': 'first_quarter',
  'waxing gibbous': 'waxing_gibbous',
  'full moon': 'full_moon',
  'waning gibbous': 'waning_gibbous',
  'last quarter': 'last_quarter',
  'waning crescent': 'waning_crescent'
};

// Reverse mapping (can be useful in some contexts)
export const LUNAR_PHASE_REVERSE_MAPPING: Record<LunarPhaseWithUnderscores, LunarPhaseWithSpaces> = {
  'new_moon': 'new moon',
  'waxing_crescent': 'waxing crescent',
  'first_quarter': 'first quarter',
  'waxing_gibbous': 'waxing gibbous',
  'full_moon': 'full moon',
  'waning_gibbous': 'waning gibbous',
  'last_quarter': 'last quarter',
  'waning_crescent': 'waning crescent'
};





export interface Planet {
  name: PlanetName;
  influence: number; // 0-1 scale indicating strength of influence
  position?: string; // Optional zodiac position
}

export interface PlanetaryPosition {
  sign: ZodiacSign;
  degree: number;
  minute?: number;
  element?: string;
  dignity?: string;
  isRetrograde?: boolean;
}

export interface PlanetaryAlignment {
  sun: PlanetaryPosition;
  moon: PlanetaryPosition;
  mercury: PlanetaryPosition;
  venus: PlanetaryPosition;
  mars: PlanetaryPosition;
  jupiter: PlanetaryPosition;
  saturn: PlanetaryPosition;
  uranus: PlanetaryPosition;
  neptune: PlanetaryPosition;
  pluto: PlanetaryPosition;
  [key: string]: PlanetaryPosition; // Allow indexing with string
}

export interface PlanetaryHarmony {
  [key: string]: Record<PlanetName, number>;
  sun: Record<PlanetName, number>;
  moon: Record<PlanetName, number>;
  mercury: Record<PlanetName, number>;
  venus: Record<PlanetName, number>;
  mars: Record<PlanetName, number>;
  jupiter: Record<PlanetName, number>;
  saturn: Record<PlanetName, number>;
}

// Define AspectType
export type AspectType = 
  | 'conjunction' 
  | 'sextile' 
  | 'square' 
  | 'trine' 
  | 'opposition' 
  | 'quincunx' 
  | 'semisextile'
  | 'semisquare'
  | 'sesquisquare'
  | 'quintile'
  | 'biquintile';

// Define PlanetaryAspect
export interface PlanetaryAspect {
  planet1: string;
  planet2: string;
  type: AspectType;
  orb: number;
  strength: number;
  planets?: string[];
  influence?: number;
  additionalInfo?: Record<string, unknown>;
}

// Define Dignity type
export type DignityType = 'Domicile' | 'Exaltation' | 'Detriment' | 'Fall' | 'Neutral';

export interface CelestialPosition {
  sign: ZodiacSign;
  degree: number;
  minute?: number;
  position?: number;
  retrograde?: boolean;
  element?: Element;
  dignity?: DignityType;
}



// Re-export AstrologicalState from celestial types
export { AstrologicalState } from "@/types/celestial";


// Re-export standard types from celestial
export { Planet, PlanetName, ZodiacSign, LunarPhase } from "@/types/celestial";
