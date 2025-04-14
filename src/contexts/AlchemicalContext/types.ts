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

// Type for planetary positions
export type PlanetaryPositionsType = Record<string, CelestialPosition>;

// Interface for astrological state
export interface AstrologicalState {
  sunSign: string;
  moonSign: string;
  lunarPhase: string;
  timeOfDay: string;
  isDaytime: boolean;
  planetaryHour: string;
  zodiacSign: string;
  activePlanets: string[];
  activeAspects: unknown[];
  dominantElement: string;
  alchemicalValues?: AlchemicalValues;
  calculationError: boolean;
  aspects?: unknown[];
  tarotElementBoosts?: Record<string, number>;
  tarotPlanetaryBoosts?: Record<string, number>;
  currentPlanetaryAlignment?: PlanetaryAlignment;
  planetaryPositions?: Record<string, CelestialPosition>;
  currentZodiac?: string;
  moonPhase?: string;
  planetaryHours?: string;
}

// Interface for alchemical values
export interface AlchemicalValues extends AlchemicalProperties {}

// Interface for alchemical state
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

// Interface for the context type
export interface AlchemicalContextType {
  state: AlchemicalState;
  dispatch: React.Dispatch<any>;
  planetaryPositions: PlanetaryPositionsType;
  isDaytime: boolean;
  updatePlanetaryPositions: (positions: PlanetaryPositionsType) => void;
  refreshPlanetaryPositions: () => Promise<PlanetaryPositionsType>;
  setDaytime: (value: boolean) => void;
  updateState: (updatedState: Partial<AlchemicalState>) => void;
}

// Helper functions
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

export const getDayOfYear = (): number => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}; 