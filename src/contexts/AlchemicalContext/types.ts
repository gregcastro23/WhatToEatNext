"use client";

import type {
  AlchemicalState as BaseAlchemicalState,
  AstrologicalState as BaseAstrologicalState,
} from "@/types/alchemical";
import type { CelestialPosition } from "@/types/celestial";

// Import types directly from alchemical types

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
  normalizedPositions: Record<string, unknown>;
  isLoading: boolean;
  error: string | null;
  isDaytime: boolean;
  getDominantElement: () => string;
  getCurrentElementalBalance: () => Record<string, number>;
  getAlchemicalHarmony: () => number;
  updateAstrologicalState: (updates: Partial<AlchemicalState["astrologicalState"]>) => void;
  calculateSeasonalInfluence: () => number;
  getThermodynamicState: () => Record<string, number>;
  updatePlanetaryPositions: (positions: Record<string, unknown>) => void;
  refreshPlanetaryPositions: () => Promise<Record<string, unknown>>;
  setDaytime: (isDaytime: boolean) => void;
  updateState: (state: Partial<AlchemicalState>) => void;
}
