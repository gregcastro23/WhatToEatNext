'use client';

import { createContext } from 'react';
import type { ReactNode } from 'react';
// Import from celestial.ts instead of alchemy.ts
import { 
  ElementalProperties,
  AlchemicalProperties,
  CelestialPosition,
  ZodiacSign,
  LunarPhase,
  Planet,
  PlanetaryAlignment,
  AstrologicalState as CentralizedAstrologicalState
} from '@/types/celestial';

// Additional interfaces for alchemical values
export interface AlchemicalValues extends AlchemicalProperties {}

export interface AstrologicalState {
  sunSign: string;
  moonSign: string;
  lunarPhase: string;
  timeOfDay: string;
  isDaytime: boolean;
  planetaryHour: string;
  zodiacSign: string;
  activePlanets: string[];
  activeAspects: any[];
  dominantElement: string;
  alchemicalValues?: AlchemicalValues;
  calculationError: boolean;
  aspects?: any[];
  tarotElementBoosts?: Record<string, number>;
  tarotPlanetaryBoosts?: Record<string, number>;
  currentPlanetaryAlignment?: PlanetaryAlignment;
  planetaryPositions?: Record<string, CelestialPosition>;
  currentZodiac?: string;
  moonPhase?: string;
  planetaryHours?: string;
}

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
    // other celestial bodies as needed
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

// Define all planets for complete planetary positions tracking using CelestialPosition
export type PlanetaryPositionsType = Record<string, CelestialPosition>;

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

export const defaultState: AlchemicalState = {
  currentSeason: getCurrentSeason(),
  timeOfDay: getTimeOfDay(),
  astrologicalState: null,
  currentEnergy: {
    zodiacEnergy: '',
    lunarEnergy: '',
    planetaryEnergy: ''
  },
  elementalPreference: {
    Fire: 0.25,
    Water: 0.25, 
    Earth: 0.25,
    Air: 0.25
  },
  elementalState: {
    Fire: 0.25,
    Water: 0.25, 
    Earth: 0.25,
    Air: 0.25
  },
  celestialPositions: {
    sun: {
      sign: 'aries',
      degree: 0
    },
    moon: {
      sign: 'taurus',
      degree: 0
    }
  },
  error: false,
  errorMessage: '',
  errors: [],
  zodiacEnergy: '',
  lunarEnergy: '',
  planetaryEnergy: [],
  alchemicalValues: {
    Spirit: 0.25,
    Essence: 0.25,
    Matter: 0.25,
    Substance: 0.25
  },
  lunarPhase: 'new moon',
  currentTime: new Date(),
  lastUpdated: new Date()
};

// Create the context with default values
export const AlchemicalContext = createContext<AlchemicalContextType>({
  state: defaultState,
  dispatch: () => {},
  planetaryPositions: {},
  isDaytime: true,
  updatePlanetaryPositions: () => {},
  refreshPlanetaryPositions: async () => ({}),
  setDaytime: () => {},
  updateState: () => {}
}); 