import { AstrologicalState } from '@/types/celestial';
import { ElementalProperties } from "@/types/alchemy";

/**
 * Astrology Utils Index
 * 
 * Consolidated exports from the astrology module system.
 * Provides a single entry point for all astrological calculations.
 */

// Import necessary types from core.ts for use in our local interface definitions
import type { 
  PlanetPosition,
  PlanetaryAspect 
} from './core';

// Re-export individual modules by name rather than using wildcard exports
// to avoid name conflicts
export { 
  // Core functions
  calculatePlanetaryPositions,
  getLunarPhaseName,
  getZodiacElement,
  calculateElementalCompatibility,
  getCurrentAstrologicalState,
  // Re-export types directly from core
  PlanetPosition,
  PlanetPositionData,
  ElementalProperties,
  AspectType,
  PlanetaryAspect,
  PlanetaryDignity
} from './core';

export { 
  // Positions module exports
  getAccuratePlanetaryPositions,
  getFallbackPlanetaryPositions,
  getPositionsSummary,
  validatePositionsStructure,
  clearPositionsCache,
  calculateLunarNodes,
  getNodeInfo
} from './positions';

export { 
  // Validation module exports
  getReliablePlanetaryPositions,
  validatePlanetaryPositions,
  normalizeZodiacSign,
  getCurrentTransitSign,
  getCurrentTransitPositions,
  getCurrentAstrologicalState as getSafeAstrologicalState,
  calculatePlanetaryAspects,
  calculateLunarPhase,
  getLunarPhaseName as getValidatedLunarPhaseName,
  getmoonIllumination
} from './validation';

export { 
  // Calculations module exports
  alchemize,
  alchemizeDetailed,
  calculateElementalValues,
  calculatePlanetaryAlchemicalValues,
  calculateElementalBalance,
  signs,
  planetInfo,
  signInfo,
  // Export types from calculations
  AlchemyTotals,
  ThermodynamicMetrics,
  AlchemicalResult,
  PlanetaryPosition,
  PlanetaryPositionsType
} from './calculations';

// Import directly from types for broader type definitions
import type { 
  ZodiacSign,
  Element,
  PlanetName,
  LunarPhase 
} from "@/types/alchemy";

// Re-export these types for external use
export type {
  ZodiacSign,
  Element,
  PlanetName,
  LunarPhase
};

// Define missing types
export type Modality = 'cardinal' | 'fixed' | 'mutable';

// Create TypeScript interfaces for missing types to resolve errors

/**
 * Complete astrological state information
 */
;
  activePlanets: string[];
  dominantPlanets?: string[];
  
  // Elemental properties
  dominantElement?: Element;
  elementalProperties?: ElementalProperties;// Time-related
  isDaytime?: boolean;
  planetaryHour?: string;
  timeOfDay?: string;
  season?: string;
  
  // Modality
  dominantModality?: Modality;
  
  // Aspects
  aspects?: PlanetaryAspect[];
  
  // Additional data for specific implementations
  ascendantSign?: string;
  currentZodiacSign?: string;
  tarotPlanetaryBoosts?: { [key: string]: number };
  
  // Tracking fields
  loading?: boolean;
  isReady?: boolean;
  renderCount?: number;
  error?: string;
}

export interface ElementalCompatibility {
  value: number;
  description: string;
}

export interface SafeAstrologicalState extends AstrologicalState {
  isReliable: boolean;
  fallbackUsed: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  messages: string[];
  correctedData?: { [key: string]: any };
}

export interface FallbackPositions {
  positions: { [key: string]: any };
  isReliable: boolean;
}

export interface AccuratePlanetaryPositions {
  positions: { [key: string]: any };
  timestamp: number;
} 