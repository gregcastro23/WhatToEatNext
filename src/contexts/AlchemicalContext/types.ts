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
  // Shorthands for direct state access
  astrologicalState: AstrologicalState;
  elementalState: AlchemicalState["elementalState"];
  alchemicalValues: AlchemicalState["alchemicalValues"];
  planetaryHour: string;
  lunarPhase: string;
  zodiacSign: string;
  // Core status properties
  planetaryPositions: Record<string, CelestialPosition | undefined>;
  historicalPositions: Record<string, CelestialPosition | undefined>;
  normalizedPositions: Record<string, CelestialPosition | undefined>;
  isLoading: boolean;
  error: string | null;
  isDaytime: boolean;
  getDominantElement: () => string;
  getCurrentElementalBalance: () => Record<string, number>;
  getAlchemicalHarmony: () => number;
  updateAstrologicalState: (updates: Partial<AlchemicalState["astrologicalState"]>) => void;
  calculateSeasonalInfluence: () => number;
  getThermodynamicState: () => Record<string, number>;
  updatePlanetaryPositions: (positions: Record<string, CelestialPosition | undefined>) => void;
  refreshPlanetaryPositions: () => Promise<Record<string, CelestialPosition | undefined>>;
  setDaytime: (isDaytime: boolean) => void;
  updateState: (state: Partial<AlchemicalState>) => void;
}
