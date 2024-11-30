"use client";

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AlchemicalEngine } from '@/lib/alchemicalEngine';
import type { 
  ElementalProperties, 
  LunarPhase, 
  ZodiacSign, 
  AstrologicalState 
} from '@/types/alchemy';

interface AlchemicalState {
  elementalBalance: ElementalProperties;
  season: string;
  astrologicalState: AstrologicalState;
}

type AlchemicalAction = 
  | { type: 'UPDATE_ELEMENTS'; payload: ElementalProperties }
  | { type: 'SET_SEASON'; payload: string }
  | { type: 'UPDATE_LUNAR_PHASE'; payload: LunarPhase }
  | { type: 'UPDATE_SUN_SIGN'; payload: ZodiacSign }
  | { type: 'UPDATE_MOON_SIGN'; payload: ZodiacSign }
  | { type: 'UPDATE_ASTROLOGICAL_STATE'; payload: AstrologicalState };

const initialState: AlchemicalState = {
  elementalBalance: {
    Fire: 0.25,
    Water: 0.25,
    Air: 0.25,
    Earth: 0.25
  },
  season: 'spring',
  astrologicalState: {
    lunarPhase: 'new_moon',
    sunSign: 'aries',
    moonSign: 'aries'
  }
};

const alchemicalReducer = (state: AlchemicalState, action: AlchemicalAction): AlchemicalState => {
  switch (action.type) {
    case 'UPDATE_ELEMENTS':
      return {
        ...state,
        elementalBalance: action.payload
      };
    case 'SET_SEASON':
      return {
        ...state,
        season: action.payload
      };
    case 'UPDATE_LUNAR_PHASE':
      return {
        ...state,
        astrologicalState: {
          ...state.astrologicalState,
          lunarPhase: action.payload
        }
      };
    case 'UPDATE_SUN_SIGN':
      return {
        ...state,
        astrologicalState: {
          ...state.astrologicalState,
          sunSign: action.payload
        }
      };
    case 'UPDATE_MOON_SIGN':
      return {
        ...state,
        astrologicalState: {
          ...state.astrologicalState,
          moonSign: action.payload
        }
      };
    case 'UPDATE_ASTROLOGICAL_STATE':
      return {
        ...state,
        astrologicalState: action.payload
      };
    default:
      return state;
  }
};

interface AlchemicalContextType {
  state: AlchemicalState;
  engine: AlchemicalEngine;
  updateElements: (elements: ElementalProperties) => void;
  setSeason: (season: string) => void;
  updateLunarPhase: (phase: LunarPhase) => void;
  updateSunSign: (sign: ZodiacSign) => void;
  updateMoonSign: (sign: ZodiacSign) => void;
  updateAstrologicalState: (state: AstrologicalState) => void;
}

const AlchemicalContext = createContext<AlchemicalContextType | undefined>(undefined);

export const AlchemicalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(alchemicalReducer, initialState);
  const engine = new AlchemicalEngine();

  const updateElements = (elements: ElementalProperties) => {
    dispatch({ type: 'UPDATE_ELEMENTS', payload: elements });
  };

  const setSeason = (season: string) => {
    dispatch({ type: 'SET_SEASON', payload: season });
  };

  const updateLunarPhase = (phase: LunarPhase) => {
    dispatch({ type: 'UPDATE_LUNAR_PHASE', payload: phase });
  };

  const updateSunSign = (sign: ZodiacSign) => {
    dispatch({ type: 'UPDATE_SUN_SIGN', payload: sign });
  };

  const updateMoonSign = (sign: ZodiacSign) => {
    dispatch({ type: 'UPDATE_MOON_SIGN', payload: sign });
  };

  const updateAstrologicalState = (astroState: AstrologicalState) => {
    dispatch({ type: 'UPDATE_ASTROLOGICAL_STATE', payload: astroState });
  };

  useEffect(() => {
    // Update season based on current date
    const getCurrentSeason = () => {
      const month = new Date().getMonth();
      if (month >= 2 && month <= 4) return 'spring';
      if (month >= 5 && month <= 7) return 'summer';
      if (month >= 8 && month <= 10) return 'autumn';
      return 'winter';
    };

    setSeason(getCurrentSeason());

    // TODO: Add initial astrological calculations
    // This would typically come from an astronomical calculation service
    // For now, we'll leave it at the default state
  }, []);

  return (
    <AlchemicalContext.Provider 
      value={{ 
        state, 
        engine, 
        updateElements, 
        setSeason,
        updateLunarPhase,
        updateSunSign,
        updateMoonSign,
        updateAstrologicalState
      }}
    >
      {children}
    </AlchemicalContext.Provider>
  );
};

export const useAlchemical = () => {
  const context = useContext(AlchemicalContext);
  if (context === undefined) {
    throw new Error('useAlchemical must be used within an AlchemicalProvider');
  }
  return context;
};

export default AlchemicalContext;