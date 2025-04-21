'use client';

import { createContext } from 'react';
import { AlchemicalContextType, getCurrentSeason, getTimeOfDay } from './types';
import { AlchemicalState, AstrologicalState } from '../../types/alchemical';

// Create a default state for the context
export const defaultState: AlchemicalState = {
  planetaryPositions: {},
  normalizedPositions: {},
  elementalState: {
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25
  },
  lunarPhase: 'new moon',
  dominantElement: 'Fire',
  planetaryHour: 'sun',
  svgRepresentation: null,
  alchemicalValues: {
    Spirit: 0.25,
    Essence: 0.25,
    Matter: 0.25,
    Substance: 0.25
  },
  error: false,
  errorMessage: '',
  errors: [],
  currentSeason: getCurrentSeason(),
  timeOfDay: getTimeOfDay(),
  astrologicalState: {
    currentZodiac: 'aries',
    sunSign: 'aries',
    lunarPhase: 'new moon',
    moonPhase: 'new moon',
    activePlanets: []
  },
  currentEnergy: {
    zodiacEnergy: 'aries',
    lunarEnergy: 'new moon',
    planetaryEnergy: ['sun', 'moon']
  },
  elementalPreference: {
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
      sign: 'aries',
      degree: 0
    }
  },
  zodiacEnergy: 'aries',
  lunarEnergy: 'new moon',
  planetaryEnergy: ['sun', 'moon'],
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