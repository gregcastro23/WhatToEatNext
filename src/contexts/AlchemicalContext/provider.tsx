'use client';

import React, { useCallback, useEffect, useReducer, useState } from 'react';

import { createLogger } from '@/utils/logger';
import * as safeAstrology from '@/utils/safeAstrology';

import { AlchemicalContext, defaultState } from './context';
import { alchemicalReducer } from './reducer';
import { AlchemicalState, AstrologicalState, PlanetaryPositionsType } from './types';

// Phase 5: Type-safe conversion interfaces for alchemical calculations
interface CalculationCompatiblePosition {
  sign?: string,
  degree?: number,
  isRetrograde?: boolean,
  [key: string]: unknown
}

interface CalculationCompatiblePositions {
  [key: string]: CalculationCompatiblePosition
}

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
    if (!deepEqual((obj1 as any)[key], (obj2 as any)[key])) return false;
  }

  return true;
}

// Calculate active planets based on dignity and other factors
const calculateActivePlanets = (positions: PlanetaryPositionsType): string[] => {
  if (!positions) return [];

  // Basic implementation just returns the major planets
  const activePlanets: string[] = [];

  try {
    // Add main planets (using capitalized names to match proven working implementation)
    const mainPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
    mainPlanets.forEach(planet => {
      if (positions[planet]) {
        activePlanets.push(planet);
      }
    });

    // Always include luminaries (Sun and Moon) as they're constantly active
    if (!activePlanets.includes('Sun')) activePlanets.push('Sun');
    if (!activePlanets.includes('Moon')) activePlanets.push('Moon');
  } catch (error) {
    logger.error('Error calculating active planets:', error);
    // Return at least the sun and moon as fallback (capitalized)
    return ['Sun', 'Moon'];
  }

  return activePlanets;
};

// Safe type conversion function to replace 'as any' casts
const convertToCalculationFormat = (
  positions: PlanetaryPositionsType
): CalculationCompatiblePositions => {
  const converted: CalculationCompatiblePositions = {};

  Object.entries(positions).forEach(([planet, position]) => {
    if (position && typeof position === 'object') {
      converted[planet] = {
        sign: position.sign,
        degree: position.degree,
        isRetrograde: position.isRetrograde,
        // Preserve any additional properties safely
        ...position
      };
    }
  });

  return converted;
};

// Export the provider component
export const AlchemicalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(alchemicalReducer, defaultState);
  const [planetaryPositions, setPlanetaryPositions] = useState<PlanetaryPositionsType>({});
  const [isDaytime, setIsDaytime] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize data once on mount
  useEffect(() => {
    if (!isInitialized) {
      logger.debug(`AlchemicalProvider initializing`);
      setIsInitialized(true);
      void refreshPlanetaryPositions(), // Initial fetch of planetary positions
    }
  }, [isInitialized]);

  // Synchronize alchemical values between state and astrologicalState
  useEffect(() => {
    // Check if astrologicalState exists and has alchemicalValues
    if (state.astrologicalState.alchemicalValues) {
      // If the values differ, update the main state alchemicalValues
      if (!deepEqual(state.alchemicalValues, state.astrologicalState.alchemicalValues)) {
        logger.debug('Synchronizing alchemical values from astrologicalState to root state');
        dispatch({
          type: 'SET_ALCHEMICAL_VALUES',
          payload:
            state.astrologicalState.alchemicalValues &&
            Object.keys(state.astrologicalState.alchemicalValues).length === 4
              ? (state.astrologicalState.alchemicalValues as {
                  Spirit: number,
                  Essence: number,
                  Matter: number,
                  Substance: number
                })
              : { Spirit: 0.25, Essence: 0.25, Matter: 0.25, Substance: 0.25 }
        });
      }
    } else if (state.astrologicalState) {
      // If astrologicalState exists but doesn't have alchemicalValues, add them from root state
      const updatedAstroState = {
        ...state.astrologicalState,
        alchemicalValues:
          state.alchemicalValues && Object.keys(state.alchemicalValues).length === 4
            ? state.alchemicalValues
            : { Spirit: 0.25, Essence: 0.25, Matter: 0.25, Substance: 0.25 }
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
        sun: positions.Sun.sign,
        moon: positions.Moon.sign,
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

      // Normalize keys to capitalized format for consistency with proven working implementation
      const normalizedPositions: PlanetaryPositionsType = {};
      Object.entries(positions).forEach(([key, data]) => {
        if (!data || typeof data !== 'object') return;

        const planet = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
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

      // Calculate elemental and alchemical values using type-safe conversion
      const compatiblePositions = convertToCalculationFormat(normalizedPositions);
      const elementalValues = calculateElementalValues(compatiblePositions);
      const planetaryValues = calculatePlanetaryAlchemicalValues(compatiblePositions);
      const elementalBalance = calculateElementalBalance(compatiblePositions);

      // Combine elemental and planetary influences (weighted average)
      const combinedAlchemicalValues = {
        Spirit:
          ((elementalValues as any)?.Spirit || 0) * 0.2 +
          ((planetaryValues as any)?.Spirit || 0) * 0.2,
        Essence:
          ((elementalValues as any)?.Essence || 0) * 0.2 +
          ((planetaryValues as any)?.Essence || 0) * 0.2,
        Matter:
          ((elementalValues as any)?.Matter || 0) * 0.2 +
          ((planetaryValues as any)?.Matter || 0) * 0.2,
        Substance:
          ((elementalValues as any)?.Substance || 0) * 0.2 +
          ((planetaryValues as any)?.Substance || 0) * 0.2
      };

      // Normalize alchemical values to ensure they sum to approximately 1
      const total =
        combinedAlchemicalValues.Spirit +
        combinedAlchemicalValues.Essence +
        combinedAlchemicalValues.Matter +
        combinedAlchemicalValues.Substance;

      const normalizedAlchemicalValues = {
        Spirit: combinedAlchemicalValues.Spirit / total,
        Essence: combinedAlchemicalValues.Essence / total,
        Matter: combinedAlchemicalValues.Matter / total,
        Substance: combinedAlchemicalValues.Substance / total
      };

      logger.debug('Calculated alchemical values:', normalizedAlchemicalValues);

      // Update state with calculated values
      const activePlanets = calculateActivePlanets(normalizedPositions);
      const sunSign = normalizedPositions.Sun.sign || 'aries';
      const moonSign = normalizedPositions.Moon.sign || 'taurus';

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
      }

      // Then update the astrological state with the same values
      const astrologicalState: AstrologicalState = {
        sunSign,
        moonSign,
        lunarPhase: safeAstrology.getLunarPhaseName(safeAstrology.calculateLunarPhase()), // Calculate actual lunar phase
        timeOfDay: _getTimeOfDay(),
        isDaytime,
        planetaryHour: 'sun', // This would be calculated
        zodiacSign: sunSign,
        activePlanets,
        activeAspects: [],
        dominantElement: 'Fire',
        calculationError: false,
        alchemicalValues: normalizedAlchemicalValues,
        currentZodiac: sunSign,
        moonPhase: safeAstrology.getLunarPhaseName(safeAstrology.calculateLunarPhase())
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
      // Pattern JJ-2: AlchemicalState Interface Completion - Return proper structure instead of empty object
      return {
        Sun: { sign: 'aries', degree: 0, exactLongitude: 0, isRetrograde: false },
        Moon: { sign: 'taurus', degree: 0, exactLongitude: 0, isRetrograde: false }
      };
    }
  }, [isDaytime, updatePlanetaryPositions]);

  const _getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  };

  const setDaytime = useCallback(
    (value: boolean) => {
      setIsDaytime(value);
      logger.debug(`Setting isDaytime to ${value}`);
      // Refresh planetary positions on daytime change
      if (isInitialized) {
        void refreshPlanetaryPositions();
      }
    },
    [isInitialized, refreshPlanetaryPositions],
  );

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
        planetaryPositions: planetaryPositions as unknown,
        isDaytime,
        updatePlanetaryPositions: updatePlanetaryPositions as (
          positions: Record<string, unknown>,
        ) => void,
        refreshPlanetaryPositions: refreshPlanetaryPositions as () => Promise<
          Record<string, unknown>
        >;
        setDaytime,
        updateState
      }}
    >
      {children}
    </AlchemicalContext.Provider>
  );
};
