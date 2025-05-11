'use client';

import React, { useReducer, useState, useCallback, useEffect } from 'react';
import { AlchemicalContext, defaultState } from './context';
import { alchemicalReducer } from './reducer';
import { PlanetaryPositionsType, AstrologicalState, AlchemicalState } from './types';
import * as safeAstrology from '@/utils/safeAstrology';
import { createLogger } from '@/utils/logger';
import { 
  safeGet, 
  safeProperty, 
  safeExecute, 
  safeArray 
} from '@/utils/safeAccess';
import ErrorHandler from '@/services/errorHandler';

// Create a component-specific logger
const logger = createLogger('AlchemicalProvider');

// Function to do a deep equality check
function deepEqual<T>(obj1: T, obj2: T): boolean {
  if (obj1 === obj2) return true;
  if (obj1 == null || obj2 == null) return false;
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;
  
  const keys1 = Object.keys(obj1 as object);
  const keys2 = Object.keys(obj2 as object);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual((obj1 as Record<string, unknown>)[key], (obj2 as Record<string, unknown>)[key])) return false;
  }
  
  return true;
}

// Safely extract sign from a position object
function getSafeSign(position: unknown, defaultSign = 'aries'): string {
  if (!position || typeof position !== 'object') {
    return defaultSign;
  }
  
  const sign = (position as { sign?: unknown }).sign;
  if (typeof sign !== 'string' || sign.length === 0) {
    return defaultSign;
  }
  
  return sign.toLowerCase();
}

// Calculate active planets based on dignity and other factors
const calculateActivePlanets = (positions: PlanetaryPositionsType): string[] => {
  if (!positions || typeof positions !== 'object') return ['sun', 'moon'];
  
  // Basic implementation just returns the major planets
  const activePlanets: string[] = [];
  
  try {
    // Add main planets
    const mainPlanets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
    mainPlanets.forEach(planet => {
      if (positions[planet]) {
        activePlanets.push(planet);
      }
    });
    
    // Always include luminaries (Sun and Moon) as they're constantly active
    if (!activePlanets.includes('sun')) activePlanets.push('sun');
    if (!activePlanets.includes('moon')) activePlanets.push('moon');
  } catch (error) {
    logger.error('Error calculating active planets:', error);
    ErrorHandler.log(error, {
      context: 'AlchemicalProvider:calculateActivePlanets',
    });
    
    // Return at least the sun and moon as fallback
    return ['sun', 'moon'];
  }
  
  return activePlanets;
};

// Default values for elemental properties if calculation fails
const DEFAULT_ELEMENTAL_BALANCE = {
  Fire: 0.25,
  Water: 0.25,
  Earth: 0.25,
  Air: 0.25
};

// Default values for alchemical properties if calculation fails
const DEFAULT_ALCHEMICAL_VALUES = {
  Spirit: 0.29,
  Essence: 0.28,
  Matter: 0.21,
  Substance: 0.22
};

// Export the provider component
export const AlchemicalProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [state, dispatch] = useReducer(alchemicalReducer, defaultState);
  const [planetaryPositions, setPlanetaryPositions] = useState<PlanetaryPositionsType>({});
  const [isDaytime, setIsDaytime] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize data once on mount
  useEffect(() => {
    if (!isInitialized) {
      logger.debug(`AlchemicalProvider initializing`);
      setIsInitialized(true);
      refreshPlanetaryPositions() // Initial fetch of planetary positions
        .catch(error => {
          logger.error('Failed to initialize planetary positions:', error);
          ErrorHandler.log(error, {
            context: 'AlchemicalProvider:initialization',
          });
        });
    }
  }, [isInitialized]);

  // Synchronize alchemical values between state and astrologicalState
  useEffect(() => {
    try {
      // Check if astrologicalState exists and has alchemicalValues
      if (state.astrologicalState?.alchemicalValues) {
        // If the values differ, update the main state alchemicalValues
        if (!deepEqual(state.alchemicalValues, state.astrologicalState.alchemicalValues)) {
          logger.debug('Synchronizing alchemical values from astrologicalState to root state');
          dispatch({
            type: 'SET_ALCHEMICAL_VALUES',
            payload: state.astrologicalState.alchemicalValues
          });
        }
      } else if (state.astrologicalState) {
        // If astrologicalState exists but doesn't have alchemicalValues, add them from root state
        const updatedAstroState = {
          ...state.astrologicalState,
          alchemicalValues: state.alchemicalValues
        };
        
        dispatch({
          type: 'SET_ASTROLOGICAL_STATE',
          payload: updatedAstroState
        });
      }
    } catch (error) {
      logger.error('Error synchronizing alchemical values:', error);
      ErrorHandler.log(error, {
        context: 'AlchemicalProvider:synchronizeValues',
      });
    }
  }, [state.astrologicalState]);

  const updatePlanetaryPositions = useCallback((positions: PlanetaryPositionsType) => {
    // Only update if positions are different using deep equality
    setPlanetaryPositions(prev => {
      try {
        // Validate positions object
        if (!positions || typeof positions !== 'object') {
          logger.warn('Invalid positions provided to updatePlanetaryPositions');
          return prev;
        }
        
        // Skip update if positions are identical to prevent re-renders
        if (deepEqual(prev, positions)) {
          logger.debug('Skipping identical planetary positions update');
          return prev;
        }
        
        // Ensure we have at least sun and moon data
        const hasSun = positions.sun && typeof positions.sun === 'object' && positions.sun.sign;
        const hasMoon = positions.moon && typeof positions.moon === 'object' && positions.moon.sign;
        
        if (!hasSun || !hasMoon) {
          logger.warn('Missing sun or moon data in positions update');
          return prev;
        }
        
        logger.info('Updating planetary positions', {
          sun: positions.sun?.sign,
          moon: positions.moon?.sign,
          timestamp: new Date().toISOString()
        });
        return positions;
      } catch (error) {
        logger.error('Error in updatePlanetaryPositions:', error);
        ErrorHandler.log(error, {
          context: 'AlchemicalProvider:updatePlanetaryPositions',
        });
        return prev;
      }
    });
  }, []);

  const refreshPlanetaryPositions = useCallback(async () => {
    try {
      logger.debug('Refreshing planetary positions...');
      
      // Use reliable hardcoded positions
      const positions = safeAstrology.getReliablePlanetaryPositions();
      
      // Normalize keys to lowercase for consistency
      const normalizedPositions: PlanetaryPositionsType = {};
      
      // Safely process positions data
      if (positions && typeof positions === 'object') {
        Object.entries(positions).forEach(([key, data]) => {
          if (!data || typeof data !== 'object') return;
          
          const planet = key.toLowerCase();
          normalizedPositions[planet] = {
            sign: safeProperty(data, 'sign', 'aries', val => typeof val === 'string').toLowerCase(),
            degree: safeProperty(data, 'degree', 0, val => typeof val === 'number'),
            exactLongitude: safeProperty(data, 'exactLongitude', 0, val => typeof val === 'number'),
            isRetrograde: !!safeProperty(data, 'isRetrograde', false)
          };
        });
      } else {
        throw new Error('Invalid positions data received from safeAstrology');
      }

      // Ensure at least sun and moon are present
      if (!normalizedPositions.sun) {
        normalizedPositions.sun = {
          sign: 'aries',
          degree: 0,
          exactLongitude: 0,
          isRetrograde: false
        };
      }
      
      if (!normalizedPositions.moon) {
        normalizedPositions.moon = {
          sign: 'taurus',
          degree: 0,
          exactLongitude: 0,
          isRetrograde: false
        };
      }

      updatePlanetaryPositions(normalizedPositions);
      
      // Import calculation utilities
      const calculationUtils = await safeExecute(
        async () => import('@/utils/alchemicalCalculations'),
        {
          calculateElementalValues: () => DEFAULT_ALCHEMICAL_VALUES,
          calculatePlanetaryAlchemicalValues: () => DEFAULT_ALCHEMICAL_VALUES,
          calculateElementalBalance: () => DEFAULT_ELEMENTAL_BALANCE
        }
      );
      
      const { 
        calculateElementalValues, 
        calculatePlanetaryAlchemicalValues, 
        calculateElementalBalance 
      } = calculationUtils;
      
      // Calculate elemental and alchemical values with safety checks
      const elementalValues = safeExecute(
        () => calculateElementalValues(normalizedPositions),
        DEFAULT_ALCHEMICAL_VALUES
      );
      
      const planetaryValues = safeExecute(
        () => calculatePlanetaryAlchemicalValues(normalizedPositions),
        DEFAULT_ALCHEMICAL_VALUES
      );
      
      const elementalBalance = safeExecute(
        () => calculateElementalBalance(normalizedPositions),
        DEFAULT_ELEMENTAL_BALANCE
      );
      
      // Combine elemental and planetary influences (weighted average)
      const combinedAlchemicalValues = {
        Spirit: (elementalValues.Spirit * 0.5) + (planetaryValues.Spirit * 0.5),
        Essence: (elementalValues.Essence * 0.5) + (planetaryValues.Essence * 0.5),
        Matter: (elementalValues.Matter * 0.5) + (planetaryValues.Matter * 0.5),
        Substance: (elementalValues.Substance * 0.5) + (planetaryValues.Substance * 0.5)
      };
      
      // Normalize alchemical values to ensure they sum to approximately 1
      const total = combinedAlchemicalValues.Spirit + combinedAlchemicalValues.Essence + 
                    combinedAlchemicalValues.Matter + combinedAlchemicalValues.Substance;
      
      // Guard against division by zero
      const normalizedAlchemicalValues = total > 0 
        ? {
          Spirit: combinedAlchemicalValues.Spirit / total,
          Essence: combinedAlchemicalValues.Essence / total,
          Matter: combinedAlchemicalValues.Matter / total,
          Substance: combinedAlchemicalValues.Substance / total
        }
        : DEFAULT_ALCHEMICAL_VALUES;
      
      logger.debug('Calculated alchemical values:', normalizedAlchemicalValues);
      
      // Update state with calculated values
      const activePlanets = calculateActivePlanets(normalizedPositions);
      const sunSign = getSafeSign(normalizedPositions.sun, 'aries');
      const moonSign = getSafeSign(normalizedPositions.moon, 'taurus');
      
      // First update the alchemical values at the root of the state
      dispatch({
        type: 'SET_ALCHEMICAL_VALUES',
        payload: normalizedAlchemicalValues
      });
      
      // Update elemental state
      dispatch({
        type: 'SET_ELEMENTAL_STATE',
        payload: elementalBalance
      });
      
      // Sync with ElementalCalculator
      try {
        const { ElementalCalculator } = await import('@/services/ElementalCalculator');
        ElementalCalculator.updateElementalState(elementalBalance);
      } catch (error) {
        logger.error('Error syncing ElementalCalculator state:', error);
        ErrorHandler.log(error, {
          context: 'AlchemicalProvider:syncElementalCalculator',
        });
      }
      
      // Calculate lunar phase safely
      const lunarPhase = safeExecute(
        () => safeAstrology.getLunarPhaseName(safeAstrology.calculateLunarPhase()),
        'new moon',
        true
      );
      
      // Calculate planetary hour
      const now = new Date();
      let hour = now.getHours();
      // Use a simple planetary hour calculation - each day is ruled by a planet in sequence
      // and hours are ruled in sequence: Sun, Venus, Mercury, Moon, Saturn, Jupiter, Mars
      const planetaryRulers = ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'];
      const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday, etc.
      // Map day of week to traditional planetary ruler
      const dayRulers = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
      const dayRuler = dayRulers[dayOfWeek];
      
      // Calculate the hour index and get the planetary ruler
      const hourIndex = (hour % 24) % 7;
      const planetaryHour = planetaryRulers[hourIndex];
      
      logger.debug(`Calculated lunar phase: ${lunarPhase}`);
      logger.debug(`Calculated planetary hour: ${planetaryHour}`);
      
      // Then update the astrological state with the same values
      const astrologicalState: AstrologicalState = {
        sunSign,
        moonSign,
        lunarPhase,
        timeOfDay: getTimeOfDay(),
        isDaytime,
        planetaryHour,
        zodiacSign: sunSign,
        activePlanets,
        activeAspects: [],
        dominantElement: getDominantElement(elementalBalance),
        calculationError: false,
        alchemicalValues: normalizedAlchemicalValues
      };
      
      dispatch({
        type: 'SET_ASTROLOGICAL_STATE',
        payload: astrologicalState
      });
      
      return normalizedPositions;
    } catch (error) {
      logger.error('Error refreshing planetary positions:', error);
      ErrorHandler.log(error, {
        context: 'AlchemicalProvider:refreshPlanetaryPositions',
        data: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      
      dispatch({
        type: 'SET_ERROR',
        payload: { message: 'Failed to refresh planetary positions' }
      });
      
      // Return minimal fallback data
      const fallbackPositions: PlanetaryPositionsType = {
        sun: { sign: 'aries', degree: 0, exactLongitude: 0, isRetrograde: false },
        moon: { sign: 'taurus', degree: 0, exactLongitude: 0, isRetrograde: false }
      };
      return fallbackPositions;
    }
  }, [isDaytime, updatePlanetaryPositions]);

  // Determine dominant element from elemental balance
  const getDominantElement = (elementalBalance: typeof DEFAULT_ELEMENTAL_BALANCE): string => {
    try {
      let maxElement = 'Fire';
      let maxValue = 0;
      
      Object.entries(elementalBalance).forEach(([element, value]) => {
        if (typeof value === 'number' && value > maxValue) {
          maxValue = value;
          maxElement = element;
        }
      });
      
      return maxElement;
    } catch (error) {
      logger.warn('Error determining dominant element:', error);
      return 'Fire'; // Default to Fire if there's an error
    }
  };

  const getTimeOfDay = () => {
    let hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  };

  const setDaytime = useCallback((value: boolean) => {
    setIsDaytime(value);
    logger.debug(`Setting isDaytime to ${value}`);
    // Refresh planetary positions on daytime change
    if (isInitialized) {
      refreshPlanetaryPositions().catch(error => {
        logger.error('Error refreshing positions after daytime change:', error);
      });
    }
  }, [isInitialized, refreshPlanetaryPositions]);

  const updateState = useCallback((updatedState: Partial<AlchemicalState>) => {
    try {
      if (!updatedState || typeof updatedState !== 'object') {
        logger.warn('Invalid state update object provided to updateState');
        return;
      }
      
      dispatch({ type: 'UPDATE_STATE', payload: updatedState });
    } catch (error) {
      logger.error('Error in updateState:', error);
      ErrorHandler.log(error, {
        context: 'AlchemicalProvider:updateState',
      });
    }
  }, []);

  return (
    <AlchemicalContext.Provider
      value={{
        state,
        dispatch,
        planetaryPositions,
        isDaytime,
        updatePlanetaryPositions,
        refreshPlanetaryPositions,
        setDaytime,
        updateState,
      }}
    >
      {children}
    </AlchemicalContext.Provider>
  );
}; 