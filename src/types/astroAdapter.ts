/**
 * Adapters for AstrologicalState Types
 * 
 * This module provides adapter functions to convert between different AstrologicalState
 * interfaces used throughout the codebase, ensuring compatibility between modules.
 */

import { 
  AstrologicalState as CelestialAstroState,
  PlanetaryAlignment,
  ElementalProperties as CelestialElementalProperties
} from './celestial';

import { 
  AstrologicalState as AlchemyAstroState,
  LunarPhase,
  ZodiacSign,
  PlanetName,
  PlanetaryPosition,
  PlanetaryAlignment as AlchemyPlanetaryAlignment
} from './alchemy';

/**
 * Convert from celestial-based AstrologicalState to alchemy-based AstrologicalState
 */
export function convertToAlchemyAstroState(state: CelestialAstroState): AlchemyAstroState {
  // Extract planetary positions from currentPlanetaryAlignment
  const extractedPlanets: PlanetName[] = [];
  const dominantPlanets: Array<{name: PlanetName, influence: number}> = [];

  // Process alignment to extract planet data
  if (state.currentPlanetaryAlignment) {
    Object.entries(state.currentPlanetaryAlignment).forEach(([key, value]) => {
      if (typeof value === 'object' && 
          value !== null && 
          'sign' in value && 
          !['description', 'activeAspects', 'dominantPlanets', 'stabilityIndex'].includes(key)) {
        extractedPlanets.push(key.toLowerCase() as PlanetName);
        dominantPlanets.push({
          name: key.toLowerCase() as PlanetName,
          influence: 1
        });
      }
    });
  }

  // Use provided activePlanets or fallback to extracted ones
  const activePlanets = (state.activePlanets?.length ? 
    state.activePlanets.map(p => p.toLowerCase() as PlanetName) : 
    extractedPlanets) || [];

  return {
    sunSign: (state.currentZodiac || 'aries') as ZodiacSign,
    moonSign: state.currentPlanetaryAlignment?.moon?.sign as ZodiacSign,
    lunarPhase: state.moonPhase || 'new moon' as LunarPhase,
    activePlanets: activePlanets,
    dominantElement: state.dominantElement || 'Fire',
    dominantPlanets: state.currentPlanetaryAlignment?.dominantPlanets?.map(p => ({
      name: p.toLowerCase() as PlanetName,
      influence: 1
    })) || dominantPlanets || [],
    loading: state.loading || false,
    error: undefined
  };
}

/**
 * Convert from alchemy-based AstrologicalState to celestial-based AstrologicalState
 */
export function convertToCelestialAstroState(state: AlchemyAstroState): CelestialAstroState {
  // Create a planetary alignment object with positions for each planet
  const alignment: PlanetaryAlignment = {
    sun: { sign: state.sunSign },
    moon: { sign: state.moonSign as string || state.sunSign }
  };

  // Add dominant planets to the alignment
  if (state.dominantPlanets?.length) {
    state.dominantPlanets.forEach(planet => {
      const planetKey = planet.name.toLowerCase();
      alignment[planetKey] = { 
        sign: state.sunSign, // Default to sunSign if specific position unknown
        influence: planet.influence
      };
    });
  }

  // Convert active planets to proper format
  const activePlanets = state.activePlanets.map(p => p.toLowerCase());

  return {
    currentZodiac: state.sunSign,
    moonPhase: state.lunarPhase,
    currentPlanetaryAlignment: alignment,
    activePlanets: activePlanets,
    dominantElement: state.dominantElement,
    loading: state.loading || false,
    isReady: true,
    renderCount: 0
  };
}

/**
 * Type guard to check if an object is a CelestialAstroState
 */
export function isCelestialAstroState(state: any): state is CelestialAstroState {
  return state && 
    'currentZodiac' in state && 
    'moonPhase' in state && 
    'currentPlanetaryAlignment' in state;
}

/**
 * Type guard to check if an object is an AlchemyAstroState
 */
export function isAlchemyAstroState(state: any): state is AlchemyAstroState {
  return state && 
    'sunSign' in state && 
    'lunarPhase' in state && 
    'activePlanets' in state;
}

/**
 * Ensure AstrologicalState is in the correct format for the target context
 */
export function ensureCompatibleAstroState(
  state: CelestialAstroState | AlchemyAstroState, 
  targetType: 'celestial' | 'alchemy'
): CelestialAstroState | AlchemyAstroState {
  if (targetType === 'celestial') {
    return isCelestialAstroState(state) ? state : convertToCelestialAstroState(state as AlchemyAstroState);
  } else {
    return isAlchemyAstroState(state) ? state : convertToAlchemyAstroState(state as CelestialAstroState);
  }
} 