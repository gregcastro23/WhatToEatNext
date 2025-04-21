/**
 * Centralized State Types
 * 
 * This file provides standardized state type definitions used across the application.
 * It consolidates previously redundant definitions from various files including:
 * - types/celestial.ts
 * - types/alchemy.ts
 * - contexts/AlchemicalContext/types.ts
 * - context/AstrologicalContext.tsx
 */

import { 
  AspectType,
  CelestialPosition,
  PlanetaryAlignment,
  PlanetaryAspect,
  ElementalProperties,
  AlchemicalProperties,
  ThermodynamicProperties
} from './celestial';

import {
  ZodiacSign,
  PlanetName,
  Element,
  Modality,
  LunarPhase
} from './constants';

import { ChakraEnergies } from './alchemy';

// Re-export for backwards compatibility
export type Planet = PlanetName;

/**
 * Core AstrologicalState interface with essential properties
 * This serves as the foundation for other state interfaces
 */
export interface AstrologicalState {
  // Core properties
  currentZodiac: ZodiacSign;  // Current zodiac sign
  sunSign: ZodiacSign;        // sun sign
  moonSign?: ZodiacSign;      // Moon sign
  lunarPhase: LunarPhase;     // Current lunar phase (may be called moonPhase in some contexts)
  moonPhase?: LunarPhase;     // Alternative name for lunarPhase
  
  // Active celestial bodies
  activePlanets: string[];    // Currently active/influential planets - keep as string[] for backward compatibility
  dominantPlanets?: PlanetName[]; // Planets with strongest influence
  
  // Elemental and modality information
  dominantElement?: Element;  // Most influential element
  dominantModality?: Modality; // Most influential modality
  
  // Alignment information
  currentPlanetaryAlignment?: PlanetaryAlignment; // Current planetary alignment
  planetaryPositions?: Record<string, CelestialPosition>; // Positions of planets
  
  // Aspects between planets
  aspects?: PlanetaryAspect[]; // Aspects between planets
  activeAspects?: unknown[];  // Active aspects in simplified form
  
  // Time-related information
  isDaytime?: boolean;        // Whether it's daytime
  planetaryHour?: PlanetName;     // Current planetary hour
  timeOfDay?: string;        // Current time of day (morning, afternoon, evening, night)
  
  // Alchemical values
  alchemicalValues?: AlchemicalProperties; // Alchemical property values
  
  // Tarot influences
  tarotElementBoosts?: Record<string, number>; // Element boosts from tarot
  tarotPlanetaryBoosts?: Record<string, number>; // Planetary boosts from tarot
  
  // Additional properties for compatibility
  retrograde?: string[];      // Retrograde planets 
  season?: string;           // Current season
  preferredModality?: Modality; // Preferred modality
  
  // Status information
  loading?: boolean;         // Whether data is loading
  isReady?: boolean;         // Whether the state is ready
  error?: string;            // Any error message
  calculationError?: boolean; // Whether a calculation error occurred
  renderCount?: number;      // Number of renders (for debugging)
}

/**
 * Extended version for the Alchemical context
 */
export interface AlchemicalState {
  currentSeason: string;
  timeOfDay: string;
  astrologicalState: AstrologicalState | null;
  currentEnergy: {
    zodiacEnergy: string;
    lunarEnergy: string;
    planetaryEnergy: string | string[];
  };
  elementalPreference: ElementalProperties;
  elementalState: ElementalProperties;
  celestialPositions: {
    sun?: {
      sign: string;
      degree?: number;
      exactLongitude?: number;
    };
    moon?: {
      sign: string;
      degree?: number;
      exactLongitude?: number;
    };
  };
  error: boolean;
  errorMessage: string;
  errors: string[];
  zodiacEnergy: string;
  lunarEnergy: string;
  planetaryEnergy: string[];
  alchemicalValues: AlchemicalProperties;
  lunarPhase: string;
  currentTime: Date;
  lastUpdated: Date;
}

/**
 * Hook return type for the AstrologicalContext
 */
export interface AstrologicalContextState {
  chakraEnergies: ChakraEnergies | null;
  planetaryPositions: Record<string, unknown> | null;
  zodiacEnergies: Record<string, number> | null;
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

/**
 * Chart data for astrological charts
 */
export interface ChartData {
  planetaryPositions: Record<string, unknown>;
  ascendant?: string;
  midheaven?: string;
  planets: Record<string, {
    sign: string;
    degree: number;
    isRetrograde?: boolean;
    exactLongitude?: number;
  }>;
  houses?: Record<number, {
    sign: string;
    degree: number;
  }>;
}

/**
 * Current chart state
 */
export interface CurrentChart {
  planetaryPositions: Record<string, unknown>;
  aspects: PlanetaryAspect[];
  currentSeason: string;
  lastUpdated: Date;
  stelliums: Record<string, string[]>;
  houseEffects: Record<string, number>;
  elementalEffects?: Record<string, number>;
  alchemicalTokens: Record<string, number>;
}

/**
 * Complete application state
 */
export interface AppState {
  astrologicalState: AstrologicalState;
  alchemicalState: AlchemicalState;
  chart: CurrentChart;
}

// Helper functions for time-related operations
export const getCurrentSeason = (): string => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
};

export const getTimeOfDay = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}; 