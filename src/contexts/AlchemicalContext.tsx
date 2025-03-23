'use client';

import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import type { ElementalProperties, AstrologicalState } from '@/types/alchemy';
import { calculateSeasonalElements } from '@/calculations/seasonalCalculations';
import { AlchemicalEngine } from '@/calculations/alchemicalEngine';
import { 
  getCurrentAstrologicalState,
  calculateLunarPhase,
  calculateSunSign,
  getZodiacElement
} from '@/utils/astrologyUtils';
import { logger } from '@/utils/logger';

interface AlchemicalState {
  currentSeason: string;
  timeOfDay: string;
  astrologicalState: AstrologicalState | null;
  currentEnergy: {
    zodiacEnergy: string;
    lunarEnergy: string;
    planetaryEnergy: string;
  };
  elementalPreference: ElementalProperties;
  lunarPhase?: string;
}

interface AlchemicalContextType {
  state: AlchemicalState;
  dispatch: React.Dispatch<any>;
  planetaryPositions: Record<string, any>;
  isDaytime: boolean;
  refreshPlanetaryPositions: () => void;
}

const getCurrentSeason = (): string => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
};

const getTimeOfDay = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

const getDayOfYear = (): number => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

const calculateInitialBalance = (): ElementalProperties => {
  const season = getCurrentSeason();
  return calculateSeasonalElements({
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25
  }, season);
};

const defaultState: AlchemicalState = {
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
  }
};

const AlchemicalContext = createContext<AlchemicalContextType | undefined>(undefined);

export function AlchemicalProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(alchemicalReducer, defaultState);
  const [planetaryPositions, setPlanetaryPositions] = useState<Record<string, any>>({});
  const [isDaytime, setIsDaytime] = useState<boolean>(true);

  const refreshPlanetaryPositions = () => {
    try {
      console.log('Refreshing planetary positions...');
      const astroState = getCurrentAstrologicalState();
      const isDayTime = astroState?.isDaytime || true;
      setIsDaytime(isDayTime);

      // Create planetary positions from the astrological state
      const positions: Record<string, any> = {};
      
      // Add basic planet data if available
      if (astroState && astroState.planetaryAlignment) {
        const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
        planets.forEach(planet => {
          if (astroState.planetaryAlignment && astroState.planetaryAlignment[planet]) {
            positions[planet.charAt(0).toUpperCase() + planet.slice(1)] = astroState.planetaryAlignment[planet];
          }
        });
      } else {
        // Fallback position data for testing
        positions['Sun'] = { sign: 'aries', degree: 2.92 };
        positions['Moon'] = { sign: 'capricorn', degree: 12.7 };
        positions['Mercury'] = { sign: 'aries', degree: 5.7 };
        positions['Venus'] = { sign: 'aries', degree: 2.47 };
        positions['Mars'] = { sign: 'cancer', degree: 21.0 };
        positions['Jupiter'] = { sign: 'gemini', degree: 14.7 };
        positions['Saturn'] = { sign: 'pisces', degree: 23.43 };
        positions['Uranus'] = { sign: 'taurus', degree: 24.37 };
        positions['Neptune'] = { sign: 'pisces', degree: 29.72 };
        positions['Pluto'] = { sign: 'aquarius', degree: 3.4 };
        positions['Ascendant'] = { sign: 'capricorn', degree: 20.12 };
      }
      
      setPlanetaryPositions(positions);
      console.log('Updated planetary positions:', positions);
    } catch (error) {
      console.error('Error refreshing planetary positions:', error);
      // Provide fallback positions on error
      setPlanetaryPositions({
        'Sun': { sign: 'aries', degree: 2.92 },
        'Moon': { sign: 'capricorn', degree: 12.7 },
        'Mercury': { sign: 'aries', degree: 5.7 },
        'Mars': { sign: 'cancer', degree: 21.0 },
      });
    }
  };

  useEffect(() => {
    const initializeEnergy = async () => {
      try {
        console.log('Initializing astrological energy...');
        
        // Wrap this in a try/catch since it's causing errors
        let astrologicalState;
        try {
          astrologicalState = getCurrentAstrologicalState();
          console.log('Astrological state loaded successfully');
        } catch (astroError) {
          console.error('Error getting astrological state:', astroError);
          // Provide fallback values
          astrologicalState = {
            sunSign: 'aries',
            moonSign: 'cancer',
            lunarPhase: 'new_moon',
            timeOfDay: 'day',
            isDaytime: true,
            planetaryHour: 'Sun',
            zodiacSign: 'aries',
            activePlanets: ['Sun', 'Moon'],
            activeAspects: [],
            dominantElement: 'Fire'
          };
        }
        
        const currentEnergy = {
          zodiacEnergy: astrologicalState.sunSign || '',
          lunarEnergy: astrologicalState.lunarPhase || 'new_moon',
          planetaryEnergy: astrologicalState.activePlanets || [],
          timeEnergy: astrologicalState.timeOfDay || 'day'
        };

        dispatch({
          type: 'INITIALIZE_STATE',
          payload: {
            astrologicalState,
            currentEnergy
          }
        });
        
        // Initialize planetary positions after setting state
        refreshPlanetaryPositions();
      } catch (error) {
        console.error('Error initializing energy:', error);
        // Fallback to default values
        dispatch({
          type: 'INITIALIZE_STATE',
          payload: {
            astrologicalState: {
              sunSign: 'aries',
              moonSign: 'cancer',
              lunarPhase: 'new_moon',
              timeOfDay: 'day',
              isDaytime: true,
              planetaryHour: 'Sun',
              zodiacSign: 'aries',
              activePlanets: ['Sun', 'Moon'],
              activeAspects: [],
              dominantElement: 'Fire'
            },
            currentEnergy: {
              zodiacEnergy: 'aries',
              lunarEnergy: 'new_moon',
              planetaryEnergy: ['Sun', 'Moon'],
              timeEnergy: 'day'
            }
          }
        });
      }
    };

    initializeEnergy();
  }, []);

  useEffect(() => {
    // Refresh planetary positions every 15 minutes
    const refreshInterval = setInterval(() => {
      refreshPlanetaryPositions();
    }, 15 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  return (
    <AlchemicalContext.Provider value={{ 
      state, 
      dispatch, 
      planetaryPositions,
      isDaytime,
      refreshPlanetaryPositions 
    }}>
      {children}
    </AlchemicalContext.Provider>
  );
}

export default AlchemicalProvider;

function alchemicalReducer(state: AlchemicalState, action: any) {
  switch (action.type) {
    case 'SET_ELEMENTAL_PREFERENCE':
      return {
        ...state,
        elementalPreference: action.payload
      };
    case 'UPDATE_ELEMENTAL_BALANCE':
      return {
        ...state,
        elementalState: action.payload
      };
    case 'UPDATE_TIME':
      return {
        ...state,
        currentSeason: action.payload.season,
        timeOfDay: action.payload.timeOfDay,
        elementalState: action.payload.elementalState
      };
    case 'INITIALIZE_STATE':
      return {
        ...state,
        astrologicalState: action.payload.astrologicalState,
        currentEnergy: action.payload.currentEnergy
      };
    default:
      return state;
  }
}

export function useAlchemical() {
  const context = useContext(AlchemicalContext);
  if (context === undefined) {
    throw new Error('useAlchemical must be used within an AlchemicalProvider');
  }
  return context;
}