'use client';

import React, { useReducer, useState, useCallback, useEffect } from 'react';
import { AlchemicalContext, defaultState } from './context';
import { alchemicalReducer } from './reducer';
import { PlanetaryPositionsType, AstrologicalState, AlchemicalState } from './types';
import * as safeAstrology from '@/utils/safeAstrology';
import { createLogger } from '@/utils/logger';

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

// Calculate active planets based on dignity and other factors
const calculateActivePlanets = (positions: PlanetaryPositionsType): string[] => {
  if (!positions) return [];
  
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
    // Return at least the sun and moon as fallback
    return ['sun', 'moon'];
  }
  
  return activePlanets;
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
      refreshPlanetaryPositions(); // Initial fetch of planetary positions
    }
  }, [isInitialized]);

  // Synchronize alchemical values between state and astrologicalState
  useEffect(() => {
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
  }, [state.astrologicalState]);

  const updatePlanetaryPositions = useCallback((positions: PlanetaryPositionsType) => {
    // Only update if positions are different using deep equality
    setPlanetaryPositions(prev => {
      // Skip update if positions are identical to prevent re-renders
      if (deepEqual(prev, positions)) {
        logger.debug('Skipping identical planetary positions update');
        return prev;
      }
      
      logger.info('Updating planetary positions', {
        sun: positions.sun?.sign,
        moon: positions.moon?.sign,
        timestamp: new Date().toISOString()
      });
      return positions;
    });
  }, []);

  const refreshPlanetaryPositions = useCallback(async () => {
    try {
      logger.debug('Refreshing planetary positions...');
      
      // Use reliable hardcoded positions
      const positions = safeAstrology.getReliablePlanetaryPositions();
      
      // Normalize keys to lowercase for consistency
      const normalizedPositions: PlanetaryPositionsType = {};
      Object.entries(positions).forEach(([key, data]) => {
        if (!data || typeof data !== 'object') return;
        
        const planet = key.toLowerCase();
        normalizedPositions[planet] = {
          sign: data.sign?.toLowerCase() || 'unknown',
          degree: typeof data.degree === 'number' ? data.degree : 0,
          exactLongitude: typeof data.exactLongitude === 'number' ? data.exactLongitude : 0,
          isRetrograde: !!data.isRetrograde
        };
      });

      updatePlanetaryPositions(normalizedPositions);
      
      // Import calculation utilities
      const { 
        calculateElementalValues, 
        calculatePlanetaryAlchemicalValues, 
        calculateElementalBalance 
      } = await import('@/utils/alchemicalCalculations');
      
      // Calculate elemental and alchemical values
      const elementalValues = calculateElementalValues(normalizedPositions);
      const planetaryValues = calculatePlanetaryAlchemicalValues(normalizedPositions);
      const elementalBalance = calculateElementalBalance(normalizedPositions);
      
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
      
      const normalizedAlchemicalValues = {
        Spirit: combinedAlchemicalValues.Spirit / total,
        Essence: combinedAlchemicalValues.Essence / total,
        Matter: combinedAlchemicalValues.Matter / total,
        Substance: combinedAlchemicalValues.Substance / total
      };
      
      logger.debug('Calculated alchemical values:', normalizedAlchemicalValues);
      
      // Update state with calculated values
      const activePlanets = calculateActivePlanets(normalizedPositions);
      const sunSign = normalizedPositions.sun?.sign || 'aries';
      const moonSign = normalizedPositions.moon?.sign || 'taurus';
      
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
      
      // Then update the astrological state with the same values
      const astrologicalState: AstrologicalState = {
        sunSign,
        moonSign,
        lunarPhase: safeAstrology.getLunarPhaseName(safeAstrology.calculateLunarPhase()), // Calculate actual lunar phase
        timeOfDay: getTimeOfDay(),
        isDaytime,
        planetaryHour: 'sun', // This would be calculated
        zodiacSign: sunSign,
        activePlanets,
        activeAspects: [],
        dominantElement: 'Fire',
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
      dispatch({
        type: 'SET_ERROR',
        payload: { message: 'Failed to refresh planetary positions' }
      });
      return {};
    }
  }, [isDaytime, updatePlanetaryPositions]);

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
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
      refreshPlanetaryPositions();
    }
  }, [isInitialized, refreshPlanetaryPositions]);

  const updateState = useCallback((updatedState: Partial<AlchemicalState>) => {
    dispatch({
      type: 'UPDATE_STATE',
      payload: updatedState
    });
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
        updateState
      }}
    >
      {children}
    </AlchemicalContext.Provider>
  );
}; 