/**
 * usePlanetaryPositions Hook
 *
 * Fetches planetary positions from the /api/planetary-positions endpoint
 * with optional alchemical analysis.
 *
 * Features:
 * - Current or historical planetary positions
 * - Optional ESMS and thermodynamic properties
 * - Auto-refresh capability
 * - Intelligent caching
 */

import { useState, useEffect, useCallback } from "react";

// Planetary position from API
export interface PlanetaryPosition {
  planet: string;
  sign: string;
  degree: number;
  longitude?: number;
  retrograde: boolean;
  speed?: number;
}

// Alchemical quantities from API
export interface AlchemicalQuantities {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
  Heat: number;
  Entropy: number;
  Reactivity: number;
  Energy: number;
}

// Full API response
export interface PlanetaryPositionsResponse {
  timestamp: string;
  planetaryPositions: PlanetaryPosition[];
  alchmQuantities?: AlchemicalQuantities;
  monicaConstant?: number;
  source: string;
  accuracy: string;
  cached: boolean;
  cacheAge?: number;
}

// Hook options
export interface UsePlanetaryPositionsOptions {
  date?: Date;
  includeAlchemy?: boolean;
  latitude?: number;
  longitude?: number;
  zodiacSystem?: "tropical" | "sidereal";
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
  useCache?: boolean;
}

// Hook return type
export interface UsePlanetaryPositionsResult {
  data: PlanetaryPositionsResponse | null;
  positions: PlanetaryPosition[];
  alchemical: AlchemicalQuantities | null;
  monicaConstant: number | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch planetary positions with optional alchemical data
 *
 * @example
 * ```tsx
 * const { positions, alchemical, isLoading } = usePlanetaryPositions({
 *   includeAlchemy: true,
 *   autoRefresh: true,
 *   refreshInterval: 300000, // 5 minutes
 * });
 * ```
 */
export function usePlanetaryPositions(
  options: UsePlanetaryPositionsOptions = {},
): UsePlanetaryPositionsResult {
  const {
    date,
    includeAlchemy = false,
    latitude,
    longitude,
    zodiacSystem = "tropical",
    autoRefresh = false,
    refreshInterval = 300000, // 5 minutes default
    useCache = true,
  } = options;

  const [data, setData] = useState<PlanetaryPositionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPositions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Build URL with query parameters for GET request
      const params = new URLSearchParams({
        includeAlchemy: includeAlchemy.toString(),
        zodiacSystem,
        useCache: useCache.toString(),
      });

      if (date) {
        params.append("date", date.toISOString());
      }
      if (latitude !== undefined) {
        params.append("latitude", latitude.toString());
      }
      if (longitude !== undefined) {
        params.append("longitude", longitude.toString());
      }

      const response = await fetch(`/api/planetary-positions?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const result: PlanetaryPositionsResponse = await response.json();
      setData(result);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error("Unknown error");
      setError(errorObj);
      console.error("Error fetching planetary positions:", err);
    } finally {
      setIsLoading(false);
    }
  }, [date, includeAlchemy, latitude, longitude, zodiacSystem, useCache]);

  // Initial fetch
  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  // Auto-refresh if enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchPositions();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchPositions]);

  return {
    data,
    positions: data?.planetaryPositions || [],
    alchemical: data?.alchmQuantities || null,
    monicaConstant: data?.monicaConstant || null,
    isLoading,
    error,
    refetch: fetchPositions,
  };
}

/**
 * Hook variant that always includes alchemical data
 */
export function usePlanetaryPositionsWithAlchemy(
  options: Omit<UsePlanetaryPositionsOptions, "includeAlchemy"> = {},
): UsePlanetaryPositionsResult {
  return usePlanetaryPositions({
    ...options,
    includeAlchemy: true,
  });
}

/**
 * Hook variant for current positions only
 */
export function useCurrentPlanetaryPositions(
  options: Omit<UsePlanetaryPositionsOptions, "date"> = {},
): UsePlanetaryPositionsResult {
  return usePlanetaryPositions({
    ...options,
    date: undefined,
  });
}
