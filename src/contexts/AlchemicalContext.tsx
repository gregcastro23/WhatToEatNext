'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ElementalProperties } from '@/types/alchemy';
import { calculateSeasonalElements } from '@/calculations/seasonalCalculations';

interface AlchemicalState {
  currentSeason: string;
  timeOfDay: string;
  elementalBalance: ElementalProperties;
}

interface AlchemicalContextType {
  state: AlchemicalState;
  updateElementalBalance: (newBalance: ElementalProperties) => void;
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
  elementalBalance: calculateInitialBalance()
};

const AlchemicalContext = createContext<AlchemicalContextType | undefined>(undefined);

export function AlchemicalProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(alchemicalReducer, defaultState);

  useEffect(() => {
    const updateTime = () => {
      const newSeason = getCurrentSeason();
      const newTimeOfDay = getTimeOfDay();
      const dayOfYear = getDayOfYear();

      if (newSeason !== state.currentSeason || newTimeOfDay !== state.timeOfDay) {
        const newBalance = calculateSeasonalElements(
          state.elementalBalance,
          newSeason
        );

        dispatch({
          type: 'UPDATE_TIME',
          payload: {
            season: newSeason,
            timeOfDay: newTimeOfDay,
            elementalBalance: newBalance
          }
        });
      }
    };

    const interval = setInterval(updateTime, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [state.currentSeason, state.timeOfDay]);

  const updateElementalBalance = (newBalance: ElementalProperties) => {
    dispatch({ type: 'UPDATE_ELEMENTAL_BALANCE', payload: newBalance });
  };

  return (
    <AlchemicalContext.Provider value={{ state, updateElementalBalance }}>
      {children}
    </AlchemicalContext.Provider>
  );
}

function alchemicalReducer(state: AlchemicalState, action: any) {
  switch (action.type) {
    case 'UPDATE_ELEMENTAL_BALANCE':
      return {
        ...state,
        elementalBalance: action.payload
      };
    case 'UPDATE_TIME':
      return {
        ...state,
        currentSeason: action.payload.season,
        timeOfDay: action.payload.timeOfDay,
        elementalBalance: action.payload.elementalBalance
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