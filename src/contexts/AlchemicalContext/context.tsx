'use client';

import { createContext } from 'react';

import { AlchemicalState, AlchemicalContextType } from './types';

// Define default state
export const defaultState: AlchemicalState = {
  currentSeason: 'spring',
  timeOfDay: 'morning',
  astrologicalState: {
    currentZodiac: 'aries',
    sunSign: 'aries',
    lunarPhase: 'new moon',
    moonPhase: 'new moon',
    activePlanets: ['sun', 'moon']
  },
  currentEnergy: {
    zodiacEnergy: '',
    lunarEnergy: '',
    planetaryEnergy: ''
  },
  elementalPreference: {
    Fire: 0.32,
    Water: 0.28,
    Earth: 0.18,
    Air: 0.22
  },
  elementalState: {
    Fire: 0.32,
    Water: 0.28,
    Earth: 0.18,
    Air: 0.22
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
    Spirit: 0.29,
    Essence: 0.28,
    Matter: 0.21,
    Substance: 0.22
  },
  lunarPhase: 'new moon',
  currentTime: new Date(),
  lastUpdated: new Date(),
  planetaryPositions: {},
  normalizedPositions: {},
  dominantElement: 'Fire',
  planetaryHour: 'Sun',
  svgRepresentation: null
};

// Create the context with default values
export const _AlchemicalContext = createContext<AlchemicalContextType>({
  state: defaultState,
  dispatch: () => {},
  planetaryPositions: {},
  isDaytime: true,
  updatePlanetaryPositions: () => {},
  refreshPlanetaryPositions: async () => ({}),
  setDaytime: () => {},
  updateState: () => {}
})

// Export the AlchemicalContextType for direct imports
export type { AlchemicalContextType } from './types';
