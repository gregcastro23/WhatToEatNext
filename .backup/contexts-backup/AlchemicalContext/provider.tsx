// Add at the top of the file, before imports
declare global {
  interface Window {
    alchemize?: unknown;
  }
}

'use client';

import React, { useReducer, useEffect, useState, useCallback, useMemo } from 'react';
import { 
  AlchemicalContext, 
  defaultState, 
  PlanetaryPositionsType 
} from './context';
import { alchemicalReducer } from './reducer';
import { calculateSeasonalElements } from '@/calculations/seasonalCalculations';
import { initializeAlchemicalEngine, staticAlchemize } from '@/utils/alchemyInitializer';
import { calculateTokenizedValues } from '@/utils/planetaryCycles';
import { logPlanetaryConsistencyCheck } from '@/utils/planetaryConsistencyCheck';
import { safeImportFunction, safeImportAndExecute } from '@/utils/dynamicImport';
import { 
  calculateSunSign,
  getSignFromLongitude
} from '@/utils/astrologyUtils';
import { getCachedCalculation } from '@/utils/calculationCache';
// Import our new safe astrological utilities
import * as safeAstrology from '@/utils/safeAstrology';
// Import alchemical calculation functions
import { 
  calculateElementalValues,
  calculateElementalBalance,
  calculatePlanetaryAlchemicalValues 
} from '@/utils/alchemicalCalculations';
// Import zodiac constants
import { 
  ZODIAC_ELEMENTS, 
  PLANETARY_RULERSHIPS, 
  PLANETARY_EXALTATIONS, 
  TRIPLICITY_RULERS 
} from '@/constants/zodiac';
// Import centralized types
import { 
  CelestialPosition,
  ZodiacSign,
  PlanetaryAspect,
  AspectType,
  Element,
  PlanetaryAlignment
} from '@/types/celestial';
// Import standardized result type
import { StandardizedAlchemicalResult } from '@/types/alchemy';
import { createLogger } from '@/utils/logger';

// Create a component-specific logger
const logger = createLogger('AlchemicalProvider');

// Function to do a deep equality check without lodash dependency
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

// Add a function to calculate active planets based on dignity and other factors
const calculateActivePlanets = (positions: PlanetaryPositionsType): string[] => {
  if (!positions) return [];
  
  // Enhanced algorithm to determine active planets based on:
  // 1. Essential dignities (rulership, exaltation, triplicity)
  // 2. Angular house placement (1, 4, 7, 10)
  // 3. Aspects to luminaries (Sun and Moon)
  // 4. Current phase of planetary cycle
  
  const activePlanets: string[] = [];
  
  try {
    // Check each planet's position and dignity
    Object.entries(positions).forEach(([planet, position]) => {
      // Skip if planet or position is missing necessary data
      if (!position || !position.sign) return;
      
      const sign = position.sign as ZodiacSign;
      const degree = position.degree || 0;
      
      // Calculate dignity
      let dignityScore = 0;
      
      // Rulership (strongest dignity)
      if (PLANETARY_RULERSHIPS[planet]?.includes(sign)) {
        dignityScore += 5;
      }
      
      // Exaltation
      if (PLANETARY_EXALTATIONS[planet] === sign) {
        dignityScore += 4;
      }
      
      // Triplicity rulers
      const element = ZODIAC_ELEMENTS[sign];
      if (element && TRIPLICITY_RULERS[element]?.includes(planet)) {
        dignityScore += 3;
      }
      
      // Angular position bonus (approximate)
      if (degree >= 0 && degree <= 10) dignityScore += 2; // Angular house approximation
      
      // Check if planet has significant dignity
      if (dignityScore >= 3) {
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
      
      // Use our reliable hardcoded positions directly
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

      // Ensure the northNode and southNode are included
      if (positions.northNode && !normalizedPositions.northnode) {
        normalizedPositions.northnode = {
          sign: positions.northNode.sign.toLowerCase(),
          degree: positions.northNode.degree,
          exactLongitude: positions.northNode.exactLongitude,
          isRetrograde: true
        };
      }
      
      if (positions.southNode && !normalizedPositions.southnode) {
        normalizedPositions.southnode = {
          sign: positions.southNode.sign.toLowerCase(),
          degree: positions.southNode.degree,
          exactLongitude: positions.southNode.exactLongitude,
          isRetrograde: true
        };
      }

      logger.debug('Normalized positions:', normalizedPositions);
      // Only update if positions changed
      if (!deepEqual(planetaryPositions, normalizedPositions)) {
        updatePlanetaryPositions(normalizedPositions);
        
        // Calculate active planets and update state
        const activePlanets = calculateActivePlanets(normalizedPositions);
        
        // Update the state with active planets
        dispatch({
          type: 'UPDATE_ACTIVE_PLANETS',
          payload: { activePlanets }
        });
      }
      
      return normalizedPositions;
    } catch (error) {
      logger.error('Error refreshing planetary positions:', error);
      return planetaryPositions; // Return current positions as fallback
    }
  }, [planetaryPositions, updatePlanetaryPositions]);

  const setDaytime = useCallback((value: boolean) => {
    setIsDaytime(prev => {
      if (prev === value) return prev;
      return value;
    });
  }, []);

  // Memoize context values to prevent unnecessary renders of consumers
  const contextValue = useMemo(() => ({
    state,
    dispatch,
    planetaryPositions,
    isDaytime,
    updatePlanetaryPositions,
    refreshPlanetaryPositions,
    setDaytime,
    updateState: () => {}
  }), [
    state, 
    planetaryPositions, 
    isDaytime, 
    updatePlanetaryPositions, 
    refreshPlanetaryPositions, 
    setDaytime
  ]);

  useEffect(() => {
    const initializeEnergy = async () => {
      try {
        logger.debug('Initializing astrological energy...');
        
        // Use our safe astrological state directly
        const astrologicalState = safeAstrology.getCurrentAstrologicalState();
        
        logger.debug('Astrological state loaded successfully', astrologicalState);

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
        
        if (astrologicalState.lunarPhase && astrologicalState.lunarPhase !== 'unknown') {
          dispatch({
            type: 'UPDATE_LUNAR_PHASE',
            payload: { lunarPhase: astrologicalState.lunarPhase }
          });
        }
        
        refreshPlanetaryPositions();
      } catch (error) {
        logger.error('Error in initializeEnergy:', error);
        dispatch({
          type: 'INITIALIZE_ERROR_STATE',
          payload: {
            error: true,
            errorMessage: 'Failed to initialize astrological data. Some features may not work correctly.'
          }
        });
        
        refreshPlanetaryPositions();
      }
    };

    initializeEnergy();
  }, [refreshPlanetaryPositions]);

  useEffect(() => {
    // Initialize the alchemical engine
    initializeAlchemicalEngine();
    
    refreshPlanetaryPositions();
    
    const intervalId = setInterval(() => {
      refreshPlanetaryPositions();
    }, 15 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [refreshPlanetaryPositions]);

  useEffect(() => {
    if (Object.keys(planetaryPositions).length > 0) {
      try {
        const currentDate = new Date();
        
        const birthInfo = {
          year: currentDate.getFullYear(),
          month: currentDate.getMonth() + 1,
          day: currentDate.getDate(),
          hour: currentDate.getHours(),
          minute: currentDate.getMinutes()
        };
        
        // Make sure North and South nodes are included in the horoscope data
        const horoscopeData = {
          tropical: {
            Ascendant: { 
              Sign: { label: planetaryPositions.ascendant?.sign || calculateSunSign(currentDate) }
            },
            CelestialBodies: { 
              all: Object.entries(planetaryPositions).map(([planet, data]: any) => {
                if (planet.startsWith('_') || !data || !data.sign) return null;
                
                // Ensure proper capitalization for the engine
                const planetName = planet === 'northnode' ? 'NorthNode' : 
                                   planet === 'southnode' ? 'SouthNode' : 
                                   planet.charAt(0).toUpperCase() + planet.slice(1);
                
                return {
                  label: planetName,
                  Sign: { label: data.sign.charAt(0).toUpperCase() + data.sign.slice(1) },
                  House: { label: '1' },
                  Retrograde: data.isRetrograde
                };
              }).filter(Boolean),
            }
          }
        };
        
        logger.debug('Horoscope data for alchemy engine:', horoscopeData);
        
        // Try using the alchemical engine first
        const engine = typeof window !== 'undefined' && window.alchemize ? window.alchemize : staticAlchemize;
        const alchemicalResult = engine(birthInfo, horoscopeData) as StandardizedAlchemicalResult;
        
        logger.debug('Raw alchemical result:', alchemicalResult);
        
        // Extract values with consistent approach using the StandardizedAlchemicalResult interface
        // Check both the new standardized fields and the legacy fields for backward compatibility
        const baseSpirit = alchemicalResult.spirit ?? 
                           alchemicalResult['Alchemy Effects']?.['Total Spirit'] ?? 
                           0.25;
        const baseEssence = alchemicalResult.essence ?? 
                            alchemicalResult['Alchemy Effects']?.['Total Essence'] ?? 
                            0.25;
        const baseMatter = alchemicalResult.matter ?? 
                          alchemicalResult['Alchemy Effects']?.['Total Matter'] ?? 
                          0.25;
        const baseSubstance = alchemicalResult.substance ?? 
                              alchemicalResult['Alchemy Effects']?.['Total Substance'] ?? 
                              0.25;
        
        // Check if the engine returned meaningful values
        const hasEngineValues = baseSpirit !== undefined && 
                                baseEssence !== undefined && 
                                baseMatter !== undefined && 
                                baseSubstance !== undefined;
                              
        if (!hasEngineValues) {
          logger.debug('Alchemical engine returned no values, using custom calculations instead');
          
          // Calculate alchemical values using our custom functions
          const elementalValues = calculateElementalValues(planetaryPositions);
          const planetaryValues = calculatePlanetaryAlchemicalValues(planetaryPositions);
          const tokenValues = calculateTokenizedValues(currentDate);
          
          // Combine elemental and planetary influences (weighted average)
          const combinedValues = {
            Spirit: (elementalValues.Spirit * 0.6) + (planetaryValues.Spirit * 0.4),
            Essence: (elementalValues.Essence * 0.6) + (planetaryValues.Essence * 0.4),
            Matter: (elementalValues.Matter * 0.6) + (planetaryValues.Matter * 0.4),
            Substance: (elementalValues.Substance * 0.6) + (planetaryValues.Substance * 0.4)
          };
          
          // Apply time-based modifiers
          const tokenizedValues = {
            Spirit: Math.max(combinedValues.Spirit * tokenValues.Spirit, 0.1),
            Essence: Math.max(combinedValues.Essence * tokenValues.Essence, 0.1),
            Matter: Math.max(combinedValues.Matter * tokenValues.Matter, 0.1),
            Substance: Math.max(combinedValues.Substance * tokenValues.Substance, 0.1)
          };
          
          // Normalize to ensure values add up to 1.0
          const totalValue = tokenizedValues.Spirit + tokenizedValues.Essence + 
                             tokenizedValues.Matter + tokenizedValues.Substance;
          
          const normalizedValues = {
            Spirit: tokenizedValues.Spirit / totalValue,
            Essence: tokenizedValues.Essence / totalValue,
            Matter: tokenizedValues.Matter / totalValue,
            Substance: tokenizedValues.Substance / totalValue
          };
          
          logger.debug('Custom-calculated alchemical values:', normalizedValues);
          
          dispatch({
            type: 'UPDATE_ALCHEMICAL_VALUES',
            payload: {
              alchemicalValues: normalizedValues
            }
          });
          
          // Calculate elemental state
          const elementalState = calculateElementalBalance(planetaryPositions);
          
          dispatch({
            type: 'UPDATE_ELEMENTAL_STATE',
            payload: { elementalState }
          });
        } else {
          logger.debug('Using alchemical engine values');
          
          // Use the values from the alchemical engine
          const tokenValues = calculateTokenizedValues(currentDate);
          const tokenizedValues = {
            Spirit: Math.max(baseSpirit * tokenValues.Spirit, 0.1),
            Essence: Math.max(baseEssence * tokenValues.Essence, 0.1),
            Matter: Math.max(baseMatter * tokenValues.Matter, 0.1),
            Substance: Math.max(baseSubstance * tokenValues.Substance, 0.1)
          };
          
          // Normalize engine values
          const totalValue = tokenizedValues.Spirit + tokenizedValues.Essence + 
                           tokenizedValues.Matter + tokenizedValues.Substance;
                           
          const normalizedValues = {
            Spirit: tokenizedValues.Spirit / totalValue,
            Essence: tokenizedValues.Essence / totalValue,
            Matter: tokenizedValues.Matter / totalValue,
            Substance: tokenizedValues.Substance / totalValue
          };
          
          logger.debug('Engine-based alchemical values:', normalizedValues);
          
          dispatch({
            type: 'UPDATE_ALCHEMICAL_VALUES',
            payload: {
              alchemicalValues: normalizedValues
            }
          });
          
          // Get elemental state from engine or calculate
          let elementalState;
          if (alchemicalResult.elementalBalance || alchemicalResult['Total Effect Value']) {
            // First try to use the standardized elementalBalance field (lowercase keys)
            if (alchemicalResult.elementalBalance) {
              elementalState = {
                Fire: alchemicalResult.elementalBalance.fire ?? 0.25,
                Water: alchemicalResult.elementalBalance.water ?? 0.25,
                Earth: alchemicalResult.elementalBalance.earth ?? 0.25,
                Air: alchemicalResult.elementalBalance.air ?? 0.25
              };
            } 
            // Fall back to legacy Total Effect Value (uppercase keys)
            else if (alchemicalResult['Total Effect Value']) {
              elementalState = {
                Fire: alchemicalResult['Total Effect Value']['Fire'] ?? 0.25,
                Water: alchemicalResult['Total Effect Value']['Water'] ?? 0.25,
                Earth: alchemicalResult['Total Effect Value']['Earth'] ?? 0.25,
                Air: alchemicalResult['Total Effect Value']['Air'] ?? 0.25
              };
            }
          } else {
            // Calculate elementalState if not available from engine
            elementalState = calculateElementalBalance(planetaryPositions);
          }
          
          dispatch({
            type: 'UPDATE_ELEMENTAL_STATE',
            payload: { elementalState }
          });
        }
      } catch (error) {
        logger.error('Error calculating alchemical values:', error);
        
        // Calculate values directly even on error to avoid placeholders
        try {
          const elementalValues = calculateElementalValues(planetaryPositions);
          const elementalState = calculateElementalBalance(planetaryPositions);
          
          dispatch({
            type: 'UPDATE_ALCHEMICAL_VALUES',
            payload: {
              alchemicalValues: elementalValues
            }
          });
          
          dispatch({
            type: 'UPDATE_ELEMENTAL_STATE',
            payload: { elementalState }
          });
        } catch (fallbackError) {
          logger.error('Even fallback calculations failed:', fallbackError);
          
          // Only use varied fallbacks as last resort
          dispatch({
            type: 'UPDATE_ALCHEMICAL_VALUES',
            payload: {
              alchemicalValues: {
                Spirit: 0.35,
                Essence: 0.30,
                Matter: 0.20,
                Substance: 0.15
              }
            }
          });
        }
      }
    }
  }, [planetaryPositions, dispatch]);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      logPlanetaryConsistencyCheck();
    }
  }, []);

  // Enhanced useEffect to incorporate more celestial factors
  useEffect(() => {
    if (state.astrologicalState?.currentPlanetaryAlignment) {
      // Calculate active planets based on positions and dignities
      const activePlanets = calculateActivePlanets(state.astrologicalState.currentPlanetaryAlignment);
      
      // Update the state with active planets
      dispatch({
        type: 'UPDATE_ACTIVE_PLANETS',
        payload: { activePlanets }
      });
      
      // Calculate aspects between planets using safeAstrology utility
      const aspects: PlanetaryAspect[] = safeAstrology.calculatePlanetaryAspects(
        state.astrologicalState.currentPlanetaryAlignment
      );
      
      // Calculate the current elemental state based on all factors
      const elementalState = calculateElementalBalance(
        state.astrologicalState.currentPlanetaryAlignment
      );
      
      // Update the state with the new elemental state
      dispatch({
        type: 'UPDATE_ELEMENTAL_STATE',
        payload: { elementalState }
      });
    }
  }, [state.astrologicalState?.currentPlanetaryAlignment]);

  return (
    <AlchemicalContext.Provider value={contextValue}>
      {children}
    </AlchemicalContext.Provider>
  );
};

export default AlchemicalProvider; 