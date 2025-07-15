'use client';

import { 
  ElementalProperties,
  AlchemicalProperties,
  CelestialPosition,
  ZodiacSign,
  LunarPhase,
  Planet,
  PlanetaryAlignment
} from '@/types/celestial';

// Import types directly from alchemical types
import { 
  AlchemicalState as BaseAlchemicalState, 
  AstrologicalState as BaseAstrologicalState 
} from '@/types/alchemical';

// Type for planetary positions
export type PlanetaryPositionsType = Record<string, CelestialPosition>;

// Re-export the types with proper names
export type AlchemicalState = BaseAlchemicalState;
export type AstrologicalState = BaseAstrologicalState;

// AlchemicalContextType interface
export interface AlchemicalContextType {
  state: AlchemicalState;
  dispatch: (action: unknown) => void;
  planetaryPositions: Record<string, unknown>;
  isDaytime: boolean;
  updatePlanetaryPositions: (positions: Record<string, unknown>) => void;
  refreshPlanetaryPositions: () => Promise<Record<string, unknown>>;
  setDaytime: (isDaytime: boolean) => void;
  updateState: (state: Partial<AlchemicalState>) => void;
} 