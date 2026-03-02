/**
 * Alchemical Context Provider - Minimal Recovery Version
 *
 * Provides alchemical state management with real-time updates,
 * planetary calculations, and elemental harmony tracking.
 */

"use client";

import React, { useReducer, useEffect, useState } from "react";
import { AstrologicalService } from "@/services/AstrologicalService";
import { _AlchemicalContext, defaultState } from "./context";
import type {
  AlchemicalState,
  // AlchemicalAction,
  AlchemicalContextType,
} from "./types";

type AlchemicalAction = any; // Type not exported
import type { ReactNode } from "react";

// Structured logger for browser console visibility
const logger = {
  debug: (message: string, ...args: any[]) => {
    if (typeof window !== "undefined") {
      console.log(`%c[AlchemicalProvider] ${message}`, "color: #9c27b0", ...args);
    }
  },
  info: (message: string, ...args: any[]) => {
    if (typeof window !== "undefined") {
      console.info(`%c[AlchemicalProvider] ${message}`, "color: #2196f3", ...args);
    }
  },
  warn: (message: string, ...args: any[]) =>
    console.warn(`[AlchemicalProvider] ${message}`, ...args),
  error: (message: string, ...args: any[]) =>
    console.error(`[AlchemicalProvider] ${message}`, ...args),
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = React.useRef(true);

  React.useEffect(() => {
    return () => { isMountedRef.current = false; };
  }, []);

  // Helper function to get dominant element
  const getDominantElement = (): string => {
    const elementalProps = state.astrologicalState?.elementalProperties;
    if (!elementalProps) return "Fire";

    const entries = (Object.entries as any)(elementalProps);
    if (!entries || entries.length === 0) return "Fire";

    return entries.reduce(
      (max, [element, value]) =>
        (value as number) > max.value
          ? { element, value: value as number }
          : max,
      { element: "Fire", value: 0 },
    ).element;
  };

  // Helper function to get current elemental balance
  const getCurrentElementalBalance = () =>
    state.astrologicalState?.elementalProperties || {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    };

  // Helper function to calculate alchemical harmony
  const getAlchemicalHarmony = (): number => {
    const elementalProperties = state.astrologicalState?.elementalProperties;
    if (!elementalProperties) return 0.5;

    const values = (Object.values as any)(elementalProperties);
    if (!values || values.length === 0) return 0.5;

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
    state.astrologicalState?.thermodynamicProperties || {
      temperature: 20,
      pressure: 1,
      entropy: 0.5,
      enthalpy: 0.5,
    };

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

      // Update timestamp only - don't spread entire state to avoid loops
      dispatch({
        type: "UPDATE_ASTROLOGICAL_STATE",
        payload: {
          timestamp: now.getTime(),
        },
      });
    };

    // Initial update
    updateTimeBasedValues();

    // Update every 5 minutes
    const interval = setInterval(updateTimeBasedValues, 5 * 60 * 1000);
    return () => clearInterval(interval);
     
  }, []); // Empty deps intentional - we only want this to run once on mount

  // Planetary positions state
  const [planetaryPositions, setPlanetaryPositions] = useState<any>({});
  const [normalizedPositions, setNormalizedPositions] = useState<any>({});

  // Update seasonal values
  useEffect(() => {
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
  }, [state.currentSeason]);

  // Fetch real planetary positions from the astrologize API
  useEffect(() => {
    const fetchLivePlanetaryPositions = async () => {
      try {
        logger.info("Fetching live planetary positions from /api/astrologize...");
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch("/api/astrologize", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data._celestialBodies) {
          const positions: Record<string, any> = {};
          const planetKeys = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"];

          for (const key of planetKeys) {
            const body = data._celestialBodies[key];
            if (body) {
              const titleKey = key.charAt(0).toUpperCase() + key.slice(1);
              positions[titleKey] = {
                sign: body.Sign?.key || "aries",
                degree: body.ChartPosition?.Ecliptic?.ArcDegrees?.degrees ?? 0,
                minute: body.ChartPosition?.Ecliptic?.ArcDegrees?.minutes ?? 0,
                exactLongitude: body.ChartPosition?.Ecliptic?.DecimalDegrees ?? 0,
                isRetrograde: body.isRetrograde ?? false,
              };
            }
          }

          if (isMountedRef.current && Object.keys(positions).length > 0) {
            logger.info(`Loaded ${Object.keys(positions).length} live planetary positions`);
            setPlanetaryPositions(positions);
            setNormalizedPositions(positions);
            dispatch({ type: "UPDATE_PLANETARY_POSITIONS", payload: positions });
            setError(null);
          }
        } else {
          throw new Error("Invalid API response structure");
        }
      } catch (err) {
        logger.warn("Failed to fetch live planetary positions, using AstrologicalService fallback:", err);
        // Fallback to AstrologicalService
        try {
          const astroService = AstrologicalService.getInstance();
          const astroState = astroService.getCurrentState();
          if (astroState && isMountedRef.current) {
            const alignment = (astroState as any).currentPlanetaryAlignment;
            if (alignment) {
              setPlanetaryPositions(alignment);
              setNormalizedPositions(alignment);
            }
          }
        } catch (fallbackErr) {
          logger.error("AstrologicalService fallback also failed:", fallbackErr);
        }
        if (isMountedRef.current) {
          setError(err instanceof Error ? err.message : "Failed to load planetary positions");
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    void fetchLivePlanetaryPositions();

    // Refresh planetary positions every 30 minutes
    const interval = setInterval(() => {
      void fetchLivePlanetaryPositions();
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []); // Run once on mount

  // Compute isDaytime from current hour
  const isDaytime = (() => {
    const hour = new Date().getHours();
    return hour >= 6 && hour < 18;
  })();

  // Stub methods for full interface compatibility
  const updatePlanetaryPositionsDirectly = (positions: Record<string, unknown>) => {
    setPlanetaryPositions(positions);
    setNormalizedPositions(positions);
  };

  const refreshPlanetaryPositionsAsync = async (): Promise<Record<string, unknown>> => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/astrologize", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) throw new Error(`API returned ${response.status}`);

      const data = await response.json();
      if (data.success && data._celestialBodies) {
        const positions: Record<string, any> = {};
        const planetKeys = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"];

        for (const key of planetKeys) {
          const body = data._celestialBodies[key];
          if (body) {
            const titleKey = key.charAt(0).toUpperCase() + key.slice(1);
            positions[titleKey] = {
              sign: body.Sign?.key || "aries",
              degree: body.ChartPosition?.Ecliptic?.ArcDegrees?.degrees ?? 0,
              minute: body.ChartPosition?.Ecliptic?.ArcDegrees?.minutes ?? 0,
              exactLongitude: body.ChartPosition?.Ecliptic?.DecimalDegrees ?? 0,
              isRetrograde: body.isRetrograde ?? false,
            };
          }
        }

        if (Object.keys(positions).length > 0) {
          setPlanetaryPositions(positions);
          setNormalizedPositions(positions);
          dispatch({ type: "UPDATE_PLANETARY_POSITIONS", payload: positions });
          setError(null);
          return positions;
        }
      }
      return planetaryPositions;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Refresh failed";
      setError(msg);
      return planetaryPositions;
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  };

  const contextValue: AlchemicalContextType = {
    state,
    dispatch,
    planetaryPositions,
    normalizedPositions,
    isLoading,
    error,
    isDaytime,
    getDominantElement,
    getCurrentElementalBalance,
    getAlchemicalHarmony,
    updateAstrologicalState,
    calculateSeasonalInfluence,
    getThermodynamicState,
    updatePlanetaryPositions: updatePlanetaryPositionsDirectly,
    refreshPlanetaryPositions: refreshPlanetaryPositionsAsync,
    setDaytime: () => {},
    updateState: (updates) => dispatch({ type: "UPDATE_ASTROLOGICAL_STATE", payload: updates }),
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
