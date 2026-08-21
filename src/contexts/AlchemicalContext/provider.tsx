"use client";

import React, { useCallback, useEffect, useReducer, useState } from "react";
import type { CelestialPosition } from "@/types/celestial";
import { fetchWithRetry } from "@/utils/apiUtils";
import { isCurrentSkyDiurnal } from "@/utils/astrology/positions";
import { createLogger } from "@/utils/logger";
import { defaultState, _AlchemicalContext } from "./context";
import type {
  AlchemicalContextType,
  AlchemicalState,
} from "./types";
import type { ReactNode } from "react";

/**
 * Alchemical Context Provider
 *
 * Provides alchemical state management with real-time updates,
 * planetary calculations, and elemental harmony tracking.
 */
type ProviderAlchemicalAction =
  | { type: "UPDATE_SEASON"; payload: "spring" | "summer" | "autumn" | "winter" }
  | { type: "UPDATE_TIME_OF_DAY"; payload: "morning" | "afternoon" | "evening" | "night" }
  | { type: "UPDATE_ASTROLOGICAL_STATE"; payload: Partial<AlchemicalState["astrologicalState"]> }
  | { type: "UPDATE_PLANETARY_POSITIONS"; payload: Record<string, CelestialPosition | undefined> }
  | { type: "UPDATE_HISTORICAL_POSITIONS"; payload: Record<string, CelestialPosition | undefined> }
  | { type: "UPDATE_LUNAR_PHASE"; payload: string }
  | { type: "UPDATE_DOMINANT_ELEMENT"; payload: string }
  | { type: "UPDATE_PLANETARY_HOUR"; payload: string }
  | { type: "RESET_STATE" };

interface AstrologizeCelestialBody {
  Sign?: { key?: string };
  sign?: string;
  ChartPosition?: {
    Ecliptic?: {
      ArcDegrees?: { degrees?: number; minutes?: number };
      DecimalDegrees?: number;
    };
  };
  degree?: number;
  minutes?: number;
  minute?: number;
  exactLongitude?: number;
  isRetrograde?: boolean;
}

interface AstrologizeResponse {
  success?: boolean;
  _celestialBodies?: Record<string, AstrologizeCelestialBody | undefined>;
  ascendant?: AstrologizeCelestialBody;
}

const isTestEnvironment = process.env.NODE_ENV === "test";
const logger = createLogger("AlchemicalProvider");

// Reducer function for state management
const alchemicalReducer = (
  state: AlchemicalState,
  action: ProviderAlchemicalAction,
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
    case "UPDATE_HISTORICAL_POSITIONS":
      return {
        ...state,
        historicalPositions: action.payload,
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
  const [isLoading, setIsLoading] = useState(!isTestEnvironment);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = React.useRef(true);
  React.useEffect(() => () => { isMountedRef.current = false; }, []);

  // Helper function to get dominant element
  const getDominantElement = (): string => {
    const elementalProps = state.astrologicalState?.elementalProperties as
      | Record<string, number>
      | undefined;
    if (!elementalProps) return "Fire";
    const entries = Object.entries(elementalProps);
    if (entries.length === 0) return "Fire";
    return entries.reduce(
      (max: { element: string; value: number }, [element, value]: [string, number]) =>
        value > max.value ? { element, value } : max,
      { element: "Fire", value: 0 },
    ).element;
  };

  // Helper function to get current elemental balance
  const getCurrentElementalBalance = (): Record<string, number> => {
    const props = state.astrologicalState?.elementalProperties as Record<string, number> | undefined;
    return props ?? {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    };
  };

  // Helper function to calculate alchemical harmony
  const getAlchemicalHarmony = (): number => {
    const elementalProperties = state.astrologicalState?.elementalProperties as
      | Record<string, number>
      | undefined;
    if (!elementalProperties) return 0.5;
    const values = Object.values(elementalProperties);
    if (values.length === 0) return 0.5;
    const mean = values.reduce((sum: number, val: number) => sum + val, 0) / values.length;
    const variance =
      values.reduce((sum: number, val: number) => sum + Math.pow(val - mean, 2), 0) /
      values.length;
    return Math.max(0, 1 - Math.sqrt(variance));
  };

  // Helper function to update astrological state
  const updateAstrologicalState = (
    updates: Partial<AlchemicalState["astrologicalState"]>,
  ): void => {
    dispatch({
      type: "UPDATE_ASTROLOGICAL_STATE",
      payload: updates,
    });
  };

  // Helper function to calculate seasonal influence
  const calculateSeasonalInfluence = (): number => {
    const seasonModifiers: Record<string, number> = {
      spring: 0.8,
      summer: 1.0,
      autumn: 0.6,
      winter: 0.4,
    };
    const season = state.currentSeason;
    const modifier = season ? seasonModifiers[season] : undefined;
    return modifier ?? 0.5;
  };

  // Helper function to get thermodynamic state
  const getThermodynamicState = (): Record<string, number> => {
    const props = state.astrologicalState?.thermodynamicProperties as Record<string, number> | undefined;
    return props ?? {
      temperature: 20,
      pressure: 1,
      entropy: 0.5,
      enthalpy: 0.5,
    };
  };

  // Update time-based values periodically
  useEffect(() => {
    const updateTimeBasedValues = (): void => {
      const now = new Date();
      const hour = now.getHours();
      // Update time of day
      let timeOfDay: "morning" | "afternoon" | "evening" | "night";
      if (hour >= 6 && hour < 12) timeOfDay = "morning";
      else if (hour >= 12 && hour < 18) timeOfDay = "afternoon";
      else if (hour >= 18 && hour < 22) timeOfDay = "evening";
      else timeOfDay = "night";
      dispatch({ type: "UPDATE_TIME_OF_DAY", payload: timeOfDay });
      // Update planetary hour
      const planetaryHours = [
        "Sun",
        "Venus",
        "Mercury",
        "Moon",
        "Saturn",
        "Jupiter",
        "Mars",
      ];
      const planetaryHour = planetaryHours[hour % 7] ?? "Sun";
      dispatch({ type: "UPDATE_PLANETARY_HOUR", payload: planetaryHour });
      // Update timestamp only
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
  }, []);

  // Planetary positions state
  const [planetaryPositions, setPlanetaryPositions] = useState<Record<string, CelestialPosition | undefined>>({});
  const [historicalPositions, setHistoricalPositions] = useState<Record<string, CelestialPosition | undefined>>({});
  const [normalizedPositions, setNormalizedPositions] = useState<Record<string, CelestialPosition | undefined>>({});

  const planetaryPositionsRef = React.useRef<Record<string, CelestialPosition | undefined>>({});
  planetaryPositionsRef.current = planetaryPositions;

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
    if (isTestEnvironment || typeof fetch !== "function") {
      return;
    }

    const fetchLivePlanetaryPositions = async (): Promise<void> => {
      try {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

        logger.info("Fetching batch planetary positions (current + historical)...");

        const fetchForDate = async (d: Date): Promise<AstrologizeResponse> => {
          const params = new URLSearchParams({
            year: d.getUTCFullYear().toString(),
            month: (d.getUTCMonth() + 1).toString(),
            date: d.getUTCDate().toString(),
            hour: d.getUTCHours().toString(),
            minute: d.getUTCMinutes().toString(),
          });

          const response = await fetchWithRetry(`/api/astrologize?${params.toString()}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            timeout: 30000,
            retries: 2,
          });
          if (!response.ok) throw new Error(`API returned ${response.status}`);
          return response.json() as Promise<AstrologizeResponse>;
        };

        const currentData = await fetchForDate(now);
        
        let historicalData: AstrologizeResponse | null = null;
        try {
          historicalData = await fetchForDate(oneHourAgo);
        } catch (histErr) {
          logger.warn("Historical fetch failed, continuing with current data only:", histErr);
        }

        const extractPositions = (data: AstrologizeResponse | null): Record<string, CelestialPosition> | null => {
          if (!data?.success || !data._celestialBodies) return null;
          const pos: Record<string, CelestialPosition> = {};
          const planetKeys = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto", "ascendant"];
          for (const key of planetKeys) {
            const body = data._celestialBodies[key] ?? (key === "ascendant" ? data.ascendant : null);
            if (body) {
              const titleKey = key === "ascendant" ? "Ascendant" : key.charAt(0).toUpperCase() + key.slice(1);
              pos[titleKey] = {
                sign: body.Sign?.key ?? body.sign ?? "aries",
                degree: body.ChartPosition?.Ecliptic?.ArcDegrees?.degrees ?? body.degree ?? 0,
                minutes: body.ChartPosition?.Ecliptic?.ArcDegrees?.minutes ?? body.minutes ?? body.minute ?? 0,
                exactLongitude: body.ChartPosition?.Ecliptic?.DecimalDegrees ?? body.exactLongitude ?? 0,
                isRetrograde: body.isRetrograde ?? false,
              };
            }
          }
          return pos;
        };

        const currentPos = extractPositions(currentData);
        const historicalPos = extractPositions(historicalData);

        if (isMountedRef.current && currentPos) {
          setPlanetaryPositions(currentPos);
          setNormalizedPositions(currentPos);
          dispatch({ type: "UPDATE_PLANETARY_POSITIONS", payload: currentPos });

          if (historicalPos) {
            setHistoricalPositions(historicalPos);
            dispatch({ type: "UPDATE_HISTORICAL_POSITIONS", payload: historicalPos });
          }
          setError(null);
        }
      } catch (err) {
        logger.warn("Batch fetch failed, using fallback:", err);
      } finally {
        if (isMountedRef.current) setIsLoading(false);
      }
    };

    fetchLivePlanetaryPositions().catch(() => {});

    // Refresh planetary positions every 5 minutes
    const interval = setInterval(() => {
      fetchLivePlanetaryPositions().catch(() => {});
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const isDaytime = isCurrentSkyDiurnal();

  const updatePlanetaryPositionsDirectly = useCallback(
    (positions: Record<string, CelestialPosition | undefined>): void => {
      setPlanetaryPositions(positions);
      setNormalizedPositions(positions);
    },
    [],
  );

  const refreshPlanetaryPositionsAsync = useCallback(async (): Promise<Record<string, CelestialPosition | undefined>> => {
    if (isTestEnvironment || typeof fetch !== "function") {
      return planetaryPositionsRef.current;
    }

    try {
      setIsLoading(true);
      const response = await fetchWithRetry("/api/astrologize", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        timeout: 30000,
        retries: 2,
      });
      if (!response.ok) throw new Error(`API returned ${response.status}`);
      const data = await response.json() as AstrologizeResponse;
      if (data.success && data._celestialBodies) {
        const positions: Record<string, CelestialPosition> = {};
        const planetKeys = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"];
        for (const key of planetKeys) {
          const body = data._celestialBodies[key];
          if (body) {
            const titleKey = key.charAt(0).toUpperCase() + key.slice(1);
            positions[titleKey] = {
              sign: body.Sign?.key ?? "aries",
              degree: body.ChartPosition?.Ecliptic?.ArcDegrees?.degrees ?? 0,
              minutes: body.ChartPosition?.Ecliptic?.ArcDegrees?.minutes ?? 0,
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
      return planetaryPositionsRef.current;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Refresh failed";
      setError(msg);
      return planetaryPositionsRef.current;
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, []);

  const contextValue: AlchemicalContextType = {
    state,
    dispatch: (action: unknown) => dispatch(action as ProviderAlchemicalAction),
    astrologicalState: state.astrologicalState,
    elementalState: state.elementalState,
    alchemicalValues: state.alchemicalValues,
    planetaryHour: state.planetaryHour,
    lunarPhase: state.lunarPhase,
    zodiacSign: (state.astrologicalState?.zodiacSign as string | undefined) ?? "aries",
    planetaryPositions,
    historicalPositions,
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
    setDaytime: (): void => {},
    updateState: (updates: Partial<AlchemicalState>): void => {
      dispatch({ type: "UPDATE_ASTROLOGICAL_STATE", payload: updates });
    },
  };

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
