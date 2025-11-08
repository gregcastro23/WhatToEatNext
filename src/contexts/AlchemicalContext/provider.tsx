/**
 * Alchemical Context Provider - Minimal Recovery Version
 *
 * Provides alchemical state management with real-time updates,
 * planetary calculations, and elemental harmony tracking.
 */

"use client";

import React, { useReducer, useEffect } from "react";
import { _AlchemicalContext, defaultState } from "./context";
import type {
  AlchemicalState,
  // AlchemicalAction,
  AlchemicalContextType,
} from "./types";
import type { ReactNode } from "react";

// Simple logger fallback
const logger = {
  debug: (message: string, ...args: any[]) =>
    console.log(`[DEBUG] ${message}`, ...args),
  error: (message: string, ...args: any[]) =>
    console.error(`[ERROR] ${message}`, ...args),
};

// Reducer function for state management
const alchemicalReducer = (
  state: AlchemicalState,
  action: AlchemicalAction,
): AlchemicalState => {
  switch (action.type) {
    case "UPDATE_SEASON":
      return {
        ...state,
        currentSeason: action.payload,
        lastUpdated: new Date(),
      };

    case "UPDATE_TIME_OF_DAY":
      return {
        ...state,
        timeOfDay: action.payload,
        lastUpdated: new Date(),
      };

    case "UPDATE_ASTROLOGICAL_STATE":
      return {
        ...state,
        astrologicalState: {
          ...state.astrologicalState,
          ...action.payload,
        },
        lastUpdated: new Date(),
      };

    case "UPDATE_PLANETARY_POSITIONS":
      return {
        ...state,
        planetaryPositions: action.payload,
        lastUpdated: new Date(),
      };

    case "UPDATE_LUNAR_PHASE":
      return {
        ...state,
        lunarPhase: action.payload,
        lastUpdated: new Date(),
      };

    case "UPDATE_DOMINANT_ELEMENT":
      return {
        ...state,
        dominantElement: action.payload,
        lastUpdated: new Date(),
      };

    case "UPDATE_PLANETARY_HOUR":
      return {
        ...state,
        planetaryHour: action.payload,
        lastUpdated: new Date(),
      };

    case "RESET_STATE":
      return {
        ...defaultState,
        lastUpdated: new Date(),
      };

    default:
      return state;
  }
};

// Provider component
export const AlchemicalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(alchemicalReducer, defaultState);

  // Helper function to get dominant element
  const getDominantElement = (): string => {
    const elementalProps = state.astrologicalState.elementalProperties;
    const entries = Object.entries(elementalProps);
    return entries.reduce(
      (max, [element, value]) => ((value as number) > max.value ? { element, value: value as number } : max),
      { element: "Fire", value: 0 },
    ).element;
  };

  // Helper function to get current elemental balance
  const getCurrentElementalBalance = () =>
    state.astrologicalState.elementalProperties;

  // Helper function to calculate alchemical harmony
  const getAlchemicalHarmony = (): number => {
    const { elementalProperties } = state.astrologicalState;
    const values = Object.values(elementalProperties) as number[];
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      values.length;
    return Math.max(0, 1 - Math.sqrt(variance));
  };

  // Helper function to update astrological state
  const updateAstrologicalState = (
    updates: Partial<AlchemicalState["astrologicalState"]>,
  ) => {
    dispatch({
      type: "UPDATE_ASTROLOGICAL_STATE",
      payload: updates,
    });
  };

  // Helper function to calculate seasonal influence
  const calculateSeasonalInfluence = (): number => {
    const seasonModifiers = {
      spring: 0.8,
      summer: 1.0,
      autumn: 0.6,
      winter: 0.4,
    };
    return seasonModifiers[state.currentSeason as any] || 0.5;
  };

  // Helper function to get thermodynamic state
  const getThermodynamicState = () =>
    state.astrologicalState.thermodynamicProperties;

  // Update time-based values periodically
  useEffect(() => {
    const updateTimeBasedValues = () => {
      const now = new Date();
      const hour = now.getHours();

      // Update time of day
      let timeOfDay: "morning" | "afternoon" | "evening" | "night";
      if (hour >= 6 && hour < 12) timeOfDay = "morning";
      else if (hour >= 12 && hour < 18) timeOfDay = "afternoon";
      else if (hour >= 18 && hour < 22) timeOfDay = "evening";
      else timeOfDay = "night";

      dispatch({ type: "UPDATE_TIME_OF_DAY", payload: timeOfDay });

      // Update planetary hour (simplified)
      const planetaryHours = [
        "Sun",
        "Venus",
        "Mercury",
        "Moon",
        "Saturn",
        "Jupiter",
        "Mars",
      ];
      const planetaryHour = planetaryHours[hour % 7];
      dispatch({ type: "UPDATE_PLANETARY_HOUR", payload: planetaryHour });

      // Update current time
      dispatch({
        type: "UPDATE_ASTROLOGICAL_STATE",
        payload: {
          ...state.astrologicalState,
          timestamp: now.getTime(),
        },
      });
    };

    // Initial update
    updateTimeBasedValues();

    // Update every 5 minutes
    const interval = setInterval(updateTimeBasedValues, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Update seasonal values
  useEffect(() => {
    const updateSeasonalValues = () => {
      const now = new Date();
      const month = now.getMonth();

      let season: "spring" | "summer" | "autumn" | "winter";
      if (month >= 2 && month <= 4) season = "spring";
      else if (month >= 5 && month <= 7) season = "summer";
      else if (month >= 8 && month <= 10) season = "autumn";
      else season = "winter";

      if (season !== state.currentSeason) {
        dispatch({ type: "UPDATE_SEASON", payload: season });
      }
    };

    updateSeasonalValues();
  }, [state.currentSeason]);

  // Mock planetary positions for now
  const planetaryPositions = {};
  const normalizedPositions = {};

  const contextValue: AlchemicalContextType = {
    state,
    dispatch,
    planetaryPositions,
    normalizedPositions,
    getDominantElement,
    getCurrentElementalBalance,
    getAlchemicalHarmony,
    updateAstrologicalState,
    calculateSeasonalInfluence,
    getThermodynamicState,
  } as any;

  logger.debug("AlchemicalProvider rendered with state:", {
    season: state.currentSeason,
    timeOfDay: state.timeOfDay,
    dominantElement: getDominantElement(),
    harmony: getAlchemicalHarmony(),
  });

  return (
    <_AlchemicalContext.Provider value={contextValue}>
      {children}
    </_AlchemicalContext.Provider>
  );
};

export default AlchemicalProvider;
