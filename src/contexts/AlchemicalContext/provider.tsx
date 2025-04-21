'use client';

import React, { useReducer, useState, useCallback, useEffect, createContext, useContext, useRef, useMemo } from 'react';
import { AlchemicalContext, defaultState } from './context';
import { alchemicalReducer } from './reducer';
import { PlanetaryPositionsType, AlchemicalContextType, getCurrentSeason, getTimeOfDay } from './types';
import { AlchemicalState } from '../../types/state';
import * as safeAstrology from '../../utils/safeAstrology';
import { createLogger } from '../../utils/logger';
import { AstrologyService } from '../../services/AstrologyService';
import { ChartContext } from '../ChartContext/context';
import { AlchemicalAction, AlchemicalDispatchType } from '../../types/alchemical';
import { ChartState } from '../../types/chart';
import { createChartSvg } from './utils';

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
    
    // Always include luminaries (sun and Moon) as they're constantly active
    if (!activePlanets.includes('sun')) activePlanets.push('sun');
    if (!activePlanets.includes('moon')) activePlanets.push('moon');
  } catch (error) {
    logger.error('Error calculating active planets:', error);
    // Return at least the sun and moon as fallback
    return ['sun', 'moon'];
  }
  
  return activePlanets;
};

export const AlchemicalDispatchContext = createContext<React.Dispatch<AlchemicalAction>>(() => null);

// Create the initial state with proper typing
const initialAlchemicalState: AlchemicalState = {
  planetaryPositions: {},
  normalizedPositions: {},
  elementalState: {
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25
  },
  lunarPhase: 'new_moon',
  dominantElement: 'Balanced',
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
  currentSeason: 'spring',
  timeOfDay: 'day',
  astrologicalState: {
    currentZodiac: 'aries',
    sunSign: 'aries',
    lunarPhase: 'new moon',
    activePlanets: [],
    moonPhase: 'new moon'
  },
  currentEnergy: {
    zodiacEnergy: '',
    lunarEnergy: '',
    planetaryEnergy: []
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
      sign: 'taurus',
      degree: 0
    }
  },
  zodiacEnergy: '',
  lunarEnergy: '',
  planetaryEnergy: [],
  currentTime: new Date(),
  lastUpdated: new Date()
};

// Export the provider component
export const AlchemicalProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Add a ref to track initialization
  const isInitializedRef = useRef(false);
  
  const [state, dispatch] = useReducer(alchemicalReducer, initialAlchemicalState);

  // Get chart context with a default fallback in case it's null
  const chartContext = useContext(ChartContext);
  // Default values when ChartContext is null
  const chart = chartContext?.chart || { 
    planetaryPositions: {},
    aspects: [],
    currentSeason: '',
    lastUpdated: new Date(),
    stelliums: {},
    houseEffects: {}
  };
  const isLoading = chartContext?.loading || false;
  
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  
  // Initialize service for astrological calculations
  const safeAstrology = AstrologyService.getInstance();
  
  // Function to refresh planetary positions - wrap in useCallback to prevent recreating on every render
  const refreshPlanetaryPositions = useCallback((): PlanetaryPositionsType => {
    // Get reliable planetary positions from service
    const positions = safeAstrology.getReliablePlanetaryPositions();
    
    // Normalize positions for calculations
    const normalizedPositions = safeAstrology.normalizePositions(positions);
    
    // Log warning if sun or moon data is missing since these are critical
    if (!positions.sun || !positions.moon) {
      console.warn('Critical planetary data missing:', {
        sunMissing: !positions.sun,
        moonMissing: !positions.moon,
      });
    }
    
    // Calculate lunar phase from positions
    const lunarPhase = safeAstrology.calculateLunarPhase(positions);
    
    // Calculate elemental state from positions
    const elementalState = safeAstrology.calculateElementalState(normalizedPositions);
    
    // Determine dominant element from elemental state
    const dominantElement = getDominantElement(elementalState);
    
    // Calculate planetary hour
    const planetaryHour = calculatePlanetaryHour();
    
    // Generate SVG representation of the chart
    const svgRepresentation = createChartSvg(
      normalizedPositions,
      elementalState,
      lunarPhase,
      dominantElement
    );
    
    // Calculate alchemical values based on positions
    const alchemicalValues = calculateAlchemicalValues(normalizedPositions, elementalState);
    
    // Update state with all calculated values
    dispatch({
      type: AlchemicalDispatchType.UPDATE_ASTROLOGICAL_STATE,
      payload: {
        planetaryPositions: positions,
        normalizedPositions,
        elementalState,
        lunarPhase,
        dominantElement,
        planetaryHour,
        svgRepresentation,
        alchemicalValues
      }
    });
    
    // Update last refresh time
    setLastUpdateTime(new Date());
    
    return positions as PlanetaryPositionsType;
  }, [safeAstrology]); // Add safeAstrology as a dependency
  
  // Calculate planetary hour based on current time and day
  const calculatePlanetaryHour = (): string => {
    const now = new Date();
    const hours = now.getHours();
    const day = now.getDay();
    
    // Planetary rulers for each day (0 = sunday, 1 = Monday, etc.)
    const dayRulers = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
    
    // Order of planetary hours (traditional order)
    const hourRulers = ['saturn', 'jupiter', 'mars', 'sun', 'venus', 'mercury', 'moon'];
    
    // Get the day's ruler
    const dayRuler = dayRulers[day];
    
    // Calculate which planetary hour we're in
    // First hour of the day is ruled by the day's ruler
    // Subsequent hours follow the traditional order in the hourRulers array
    const hourOfDay = hours % 24;
    const hourIndex = (hourRulers.indexOf(dayRuler) + hourOfDay) % 7;
    
    return hourRulers[hourIndex];
  };
  
  // Determine dominant element from elemental state
  const getDominantElement = (elementalState: Record<string, number>): string => {
    if (!elementalState) return 'Balanced';
    
    // Find element with highest value
    let maxElement = 'Balanced';
    let maxValue = 0;
    
    Object.entries(elementalState).forEach(([element, value]) => {
      if (value > maxValue) {
        maxValue = value;
        maxElement = element;
      }
    });
    
    return maxElement;
  };
  
  // Calculate alchemical values based on planetary positions and elemental balance
  const calculateAlchemicalValues = (
    normalizedPositions: Record<string, unknown>,
    elementalState: Record<string, number>
  ): Record<string, number> => {
    // Base values derived from elemental balance
    const fireValue = elementalState.Fire || 0.25;
    const waterValue = elementalState.Water || 0.25;
    const airValue = elementalState.Air || 0.25;
    const earthValue = elementalState.Earth || 0.25;
    
    // Log the current values for debugging
    logger.info('Starting alchemical calculations', {
      fire: fireValue,
      water: waterValue,
      air: airValue,
      earth: earthValue
    });
    
    // Get planetary contributions based on their positions
    let planetaryContributions = {
      Spirit: 0,
      Matter: 0,
      Essence: 0,
      Substance: 0
    };
    
    // Analyze each planet's contribution based on its sign
    Object.entries(normalizedPositions).forEach(([planet, data]) => {
      if (!data || !data.sign) return;
      
      const planetLower = planet.toLowerCase();
      const sign = data.sign.toLowerCase();
      
      // Skip non-standard planets
      if (!['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'].includes(planetLower)) {
        return;
      }
      
      // Apply contributions based on the alchemizer logic
      // sun in fire signs increases Spirit
      if (planetLower === 'sun' && ['aries', 'leo', 'sagittarius'].includes(sign)) {
        planetaryContributions.Spirit += 0.15;
      }
      
      // Moon in water signs increases Matter
      if (planetLower === 'moon' && ['cancer', 'scorpio', 'pisces'].includes(sign)) {
        planetaryContributions.Matter += 0.15;
      }
      
      // mercury in air or earth signs affects Spirit and Substance
      if (planetLower === 'mercury') {
        if (['gemini', 'libra', 'aquarius'].includes(sign)) {
          planetaryContributions.Spirit += 0.1;
        } else if (['taurus', 'virgo', 'capricorn'].includes(sign)) {
          planetaryContributions.Substance += 0.1;
        }
      }
      
      // venus in water or earth signs affects Essence and Matter
      if (planetLower === 'venus') {
        if (['cancer', 'scorpio', 'pisces'].includes(sign)) {
          planetaryContributions.Essence += 0.1;
        } else if (['taurus', 'virgo', 'capricorn'].includes(sign)) {
          planetaryContributions.Matter += 0.1;
        }
      }
      
      // Mars affects Essence in fire signs
      if (planetLower === 'mars' && ['aries', 'leo', 'sagittarius'].includes(sign)) {
        planetaryContributions.Essence += 0.12;
      }
      
      // Jupiter affects Spirit and Essence
      if (planetLower === 'jupiter') {
        if (['gemini', 'libra', 'aquarius'].includes(sign)) {
          planetaryContributions.Spirit += 0.1;
        } else if (['sagittarius', 'aries', 'leo'].includes(sign)) {
          planetaryContributions.Essence += 0.1;
        }
      }
      
      // Saturn affects Spirit and Matter
      if (planetLower === 'saturn') {
        if (['gemini', 'libra', 'aquarius'].includes(sign)) {
          planetaryContributions.Spirit += 0.08;
        } else if (['taurus', 'virgo', 'capricorn'].includes(sign)) {
          planetaryContributions.Matter += 0.12;
        }
      }
      
      // Outer planets have more subtle effects
      if (planetLower === 'uranus') {
        planetaryContributions.Essence += 0.07;
        planetaryContributions.Matter += 0.05;
      }
      
      if (planetLower === 'neptune') {
        planetaryContributions.Essence += 0.08;
        planetaryContributions.Substance += 0.06;
      }
      
      if (planetLower === 'pluto') {
        planetaryContributions.Essence += 0.06;
        planetaryContributions.Matter += 0.08;
      }
    });
    
    logger.info('Planetary contributions calculated', planetaryContributions);
    
    // Apply the alchemical formulas from the alchemizer engine with elemental contributions
    // Spirit = Fire + Air (volatile elements)
    // Matter = Earth + Water (fixed elements)
    // Essence = Air + Water (moist elements)
    // Substance = Fire + Earth (dry elements)
    
    // Base calculations from elemental states
    let spirit = (fireValue * 0.6) + (airValue * 0.4) + planetaryContributions.Spirit;
    let matter = (earthValue * 0.7) + (waterValue * 0.3) + planetaryContributions.Matter;
    let essence = (airValue * 0.55) + (waterValue * 0.45) + planetaryContributions.Essence;
    let substance = (fireValue * 0.4) + (earthValue * 0.6) + planetaryContributions.Substance;
    
    // Normalize values to ensure they're within reasonable range (0-1)
    // Using a softmax-like approach to keep relationships but normalize values
    const total = spirit + matter + essence + substance;
    
    // Prevent division by zero
    if (total === 0) {
      spirit = 0.25;
      matter = 0.25;
      essence = 0.25;
      substance = 0.25;
    } else if (total < 0.1) { 
      // If total is very small, ensure minimum values
      const normFactor = 0.4 / total; // Ensure sum is at least 0.4
      spirit *= normFactor;
      matter *= normFactor;
      essence *= normFactor;
      substance *= normFactor;
    } else if (total > 4) {
      // If total is very large, scale values down
      const normFactor = 4 / total; // Cap sum at 4
      spirit *= normFactor;
      matter *= normFactor;
      essence *= normFactor;
      substance *= normFactor;
    }
    
    // Final safety check to ensure no negative values
    spirit = Math.max(0, spirit);
    matter = Math.max(0, matter);
    essence = Math.max(0, essence);
    substance = Math.max(0, substance);
    
    logger.info('Final alchemical values calculated', {
      Spirit: spirit,
      Matter: matter,
      Essence: essence,
      Substance: substance
    });
    
    return {
      Spirit: spirit,
      Matter: matter,
      Essence: essence,
      Substance: substance
    };
  };
  
  // Initial setup - load planetary positions on component mount
  useEffect(() => {
    // Only refresh if not initialized yet
    if (!isInitializedRef.current && !isLoading && chart) {
      isInitializedRef.current = true;
      console.log('Initial planetary positions load');
      refreshPlanetaryPositions();
    }
  }, [isLoading, chart, refreshPlanetaryPositions]); // Keep dependencies
  
  // Add this new effect to ensure alchemical values are initialized
  useEffect(() => {
    // Check if alchemical values are all zero or near zero
    const allValuesLow = 
      !state.alchemicalValues || 
      (state.alchemicalValues.Spirit < 0.05 && 
       state.alchemicalValues.Essence < 0.05 && 
       state.alchemicalValues.Matter < 0.05 && 
       state.alchemicalValues.Substance < 0.05);
       
    if (allValuesLow) {
      console.log('Alchemical values are minimal, initializing with calculated values');
      
      // Set default elemental state if not present or if all values are too low
      const existingElementalState = state.elementalState || {};
      const lowElementalValues = 
        !existingElementalState.Fire || 
        (existingElementalState.Fire < 0.05 && 
         existingElementalState.Water < 0.05 && 
         existingElementalState.Earth < 0.05 && 
         existingElementalState.Air < 0.05);
      
      // Create a meaningful base elemental state based on season if available
      let elementalState = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
      
      if (lowElementalValues && state.currentSeason) {
        // Adjust elemental state based on current season
        const season = state.currentSeason.toLowerCase();
        
        if (season.includes('summer')) {
          elementalState = { Fire: 0.4, Water: 0.2, Earth: 0.2, Air: 0.2 };
        } else if (season.includes('winter')) {
          elementalState = { Fire: 0.2, Water: 0.4, Earth: 0.2, Air: 0.2 };
        } else if (season.includes('spring')) {
          elementalState = { Fire: 0.3, Water: 0.2, Earth: 0.2, Air: 0.3 };
        } else if (season.includes('autumn') || season.includes('fall')) {
          elementalState = { Fire: 0.2, Water: 0.2, Earth: 0.4, Air: 0.2 };
        }
      } else if (!lowElementalValues) {
        // Use existing values if they're reasonable
        elementalState = existingElementalState;
      }
      
      // Use real planetary data if available, or fallback data as last resort
      const usePlanetaryPositions = state.planetaryPositions && Object.keys(state.planetaryPositions).length >= 5;
      
      // Calculate alchemical values using real formulas from planetary positions if possible
      let alchemicalValues;
      
      if (usePlanetaryPositions) {
        const normalizedPositions = safeAstrology.normalizePositions(state.planetaryPositions);
        alchemicalValues = calculateAlchemicalValues(normalizedPositions, elementalState);
      } else {
        // Calculate from elemental state only
        alchemicalValues = {
          Spirit: (elementalState.Fire * 0.6) + (elementalState.Air * 0.4) + 0.1,
          Matter: (elementalState.Earth * 0.7) + (elementalState.Water * 0.3) + 0.1,
          Essence: (elementalState.Air * 0.55) + (elementalState.Water * 0.45) + 0.05,
          Substance: (elementalState.Fire * 0.4) + (elementalState.Earth * 0.6) + 0.05
        };
      }
      
      // Fallback planetary positions for calculation if no data available
      const fallbackPositions = {
        sun: { sign: 'aries', degree: 8.5, exactLongitude: 8.5, isRetrograde: false },
        moon: { sign: 'cancer', degree: 15.7, exactLongitude: 105.7, isRetrograde: false },
        mercury: { sign: 'taurus', degree: 5.2, exactLongitude: 35.2, isRetrograde: false },
        venus: { sign: 'gemini', degree: 12.4, exactLongitude: 72.4, isRetrograde: false },
        mars: { sign: 'cancer', degree: 22.63, exactLongitude: 112.63, isRetrograde: false },
        jupiter: { sign: 'gemini', degree: 15.52, exactLongitude: 75.52, isRetrograde: false },
        saturn: { sign: 'pisces', degree: 24.12, exactLongitude: 354.12, isRetrograde: false },
        ascendant: { sign: 'libra', degree: 7.82, exactLongitude: 187.82, isRetrograde: false }
      };
      
      // Determine dominant element from elemental state
      const dominantElement = Object.entries(elementalState)
        .sort((a, b) => b[1] - a[1])[0][0];
        
      // Calculate moon phase if not available
      const lunarPhase = state.lunarPhase || 
        (state.planetaryPositions ? 
          safeAstrology.calculateLunarPhase(state.planetaryPositions) : 
          'full_moon');
      
      // Update state with calculated values
      dispatch({
        type: AlchemicalDispatchType.UPDATE_STATE,
        payload: {
          alchemicalValues,
          elementalState,
          planetaryPositions: state.planetaryPositions || fallbackPositions,
          currentSeason: state.currentSeason || getCurrentSeason(),
          timeOfDay: state.timeOfDay || getTimeOfDay(),
          lunarPhase,
          dominantElement,
          lastUpdated: new Date()
        }
      });
      
      // Schedule a refresh of planetary positions for proper calculations
      setTimeout(() => {
        refreshPlanetaryPositions();
      }, 1000);
    }
  }, [state, safeAstrology, calculateAlchemicalValues, refreshPlanetaryPositions]);
  
  // Update positions every 15 minutes
  useEffect(() => {
    const intervalId = setInterval(() => {
      refreshPlanetaryPositions();
    }, 15 * 60 * 1000); // 15 minutes in milliseconds
    
    return () => clearInterval(intervalId);
  }, [refreshPlanetaryPositions]); // Add refreshPlanetaryPositions as a dependency
  
  // Refresh with chart updates
  useEffect(() => {
    if (chart?.lastUpdated) {
      const chartUpdateTime = new Date(chart.lastUpdated);
      
      // Only refresh if chart was updated after our last update
      if (chartUpdateTime > lastUpdateTime) {
        refreshPlanetaryPositions();
      }
    }
  }, [chart, lastUpdateTime, refreshPlanetaryPositions]); // Add refreshPlanetaryPositions as a dependency

  // Create context value object for Provider
  const contextValue: AlchemicalContextType = useMemo(() => ({
    state,
    dispatch,
    planetaryPositions: state.planetaryPositions,
    isDaytime: state.astrologicalState?.isDaytime || false,
    updatePlanetaryPositions: (positions: PlanetaryPositionsType) => {
      dispatch({
        type: AlchemicalDispatchType.UPDATE_PLANETARY_POSITIONS,
        payload: positions
      });
    },
    refreshPlanetaryPositions: async () => {
      const positions = await refreshPlanetaryPositions();
      // Return the updated positions for convenience
      return positions as PlanetaryPositionsType;
    },
    setDaytime: (value: boolean) => {
      dispatch({
        type: AlchemicalDispatchType.SET_DAYTIME,
        payload: value
      });
    },
    updateState: (updatedState: Partial<AlchemicalState>) => {
      dispatch({
        type: AlchemicalDispatchType.UPDATE_STATE,
        payload: updatedState
      });
    }
  }), [state, dispatch, refreshPlanetaryPositions]);

  return (
    <AlchemicalContext.Provider value={contextValue}>
      <AlchemicalDispatchContext.Provider value={dispatch}>
        {children}
      </AlchemicalDispatchContext.Provider>
    </AlchemicalContext.Provider>
  );
}; 