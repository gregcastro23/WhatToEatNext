'use client';

import { Dispatch } from 'react';
import { AlchemicalAction, AlchemicalState } from '../../types/alchemical';
import { Season } from '../../types/alchemy';

import { 
  ElementalProperties,
  AlchemicalProperties,
  CelestialPosition,
  ZodiacSign,
  LunarPhase,
  Planet,
  PlanetaryAlignment
} from '../../types/celestial';

import {
  AstrologicalState as CentralizedAstrologicalState,
  AlchemicalState as CentralizedAlchemicalState
} from '../../types/state';

// Use the centralized types but alias them to maintain backward compatibility
export type AstrologicalState = CentralizedAstrologicalState;
export type AlchemicalState = CentralizedAlchemicalState;

// Type for planetary positions
export type PlanetaryPositionsType = Record<string, unknown>;

// Interface for alchemical values
export interface AlchemicalValues extends AlchemicalProperties {}

// Interface for the context type
export interface AlchemicalContextType {
  state: AlchemicalState;
  dispatch: Dispatch<AlchemicalAction>;
  planetaryPositions: PlanetaryPositionsType;
  isDaytime: boolean;
  updatePlanetaryPositions: (positions: PlanetaryPositionsType) => void;
  refreshPlanetaryPositions: () => Promise<PlanetaryPositionsType>;
  setDaytime: (value: boolean) => void;
  updateState: (updatedState: Partial<AlchemicalState>) => void;
}

// Helper functions
export function getCurrentSeason(): Season {
  const month = new Date().getMonth();
  
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

export function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

export const getDayOfYear = (): number => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}; 