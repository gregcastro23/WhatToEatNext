/**
 * useChartData Hook
 *
 * Fetches and manages planetary chart data from the astrologize and alchemize APIs.
 * Calculates planetary aspects and provides alchemical properties.
 */

import { useState, useEffect, useCallback } from "react";
import type { PlanetPosition, PlanetaryAspect } from "@/types/celestial";
import { calculateAspects } from "@/utils/astrologyUtils";
import { calculateKineticProperties } from "@/utils/kineticCalculations";
import type { KineticMetrics } from "@/types/kinetics";

export interface ChartDataOptions {
  dateTime?: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
  zodiacSystem?: "tropical" | "sidereal";
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}

export interface AlchemicalResult {
  elementalProperties: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
  thermodynamicProperties: {
    heat: number;
    entropy: number;
    reactivity: number;
    gregsEnergy: number;
  };
  esms: {
    Spirit: number;
    Essence: number;
    Matter: number;
    Substance: number;
  };
  kalchm: number;
  monica: number;
  score: number;
  metadata: {
    source: string;
    dominantElement?: string;
    dominantModality?: string;
    sunSign?: string;
    chartRuler?: string;
  };
}

export interface ChartData {
  positions: Record<string, PlanetPosition> | null;
  aspects: PlanetaryAspect[];
  alchemical: AlchemicalResult | null;
  kinetics: KineticMetrics | null;
  timestamp: string | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage planetary chart data
 */
export function useChartData(options: ChartDataOptions = {}): ChartData {
  const {
    dateTime,
    location = { latitude: 40.7128, longitude: -74.0060 }, // Default: NYC
    zodiacSystem = "tropical",
    autoRefresh = false,
    refreshInterval = 60000, // 1 minute default
  } = options;

  const [positions, setPositions] = useState<Record<string, PlanetPosition> | null>(null);
  const [aspects, setAspects] = useState<PlanetaryAspect[]>([]);
  const [alchemical, setAlchemical] = useState<AlchemicalResult | null>(null);
  const [kinetics, setKinetics] = useState<KineticMetrics | null>(null);
  const [timestamp, setTimestamp] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChartData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams({
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
        zodiacSystem,
      });

      // Add date/time parameters if specified
      if (dateTime) {
        params.append("year", dateTime.getFullYear().toString());
        params.append("month", (dateTime.getMonth() + 1).toString()); // 1-indexed
        params.append("date", dateTime.getDate().toString());
        params.append("hour", dateTime.getHours().toString());
        params.append("minute", dateTime.getMinutes().toString());
      }

      // Fetch planetary positions from astrologize API
      const astrologizeResponse = await fetch(`/api/astrologize?${params}`);

      if (!astrologizeResponse.ok) {
        throw new Error(`Astrologize API error: ${astrologizeResponse.statusText}`);
      }

      const astrologizeData = await astrologizeResponse.json();

      // Extract planet positions from _celestialBodies
      const planetPositions: Record<string, PlanetPosition> = {};

      if (astrologizeData._celestialBodies) {
        Object.entries(astrologizeData._celestialBodies).forEach(([key, data]: [string, any]) => {
          if (key === "all") return; // Skip the 'all' array

          const planetName = key.charAt(0).toUpperCase() + key.slice(1);

          if (data && data.Sign && data.ChartPosition) {
            planetPositions[planetName] = {
              sign: data.Sign.key.toLowerCase(),
              degree: data.ChartPosition.Ecliptic.ArcDegrees.degrees,
              minute: data.ChartPosition.Ecliptic.ArcDegrees.minutes,
              exactLongitude: data.ChartPosition.Ecliptic.DecimalDegrees,
              isRetrograde: data.isRetrograde || false,
            };
          }
        });
      }

      setPositions(planetPositions);
      setTimestamp(astrologizeData.metadata?.timestamp || new Date().toISOString());

      // Calculate aspects from positions
      const calculatedAspects = calculateAspects(planetPositions);
      setAspects(calculatedAspects);

      // Fetch alchemical data from alchemize API
      // Pass the planetary positions we just fetched to avoid redundant calculation
      const alchemizeResponse = await fetch("/api/alchemize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          zodiacSystem,
          planetaryPositions,
          ...(dateTime && {
            year: dateTime.getFullYear(),
            month: dateTime.getMonth() + 1,
            date: dateTime.getDate(),
            hour: dateTime.getHours(),
            minute: dateTime.getMinutes(),
          }),
        }),
      });

      if (!alchemizeResponse.ok) {
        throw new Error(`Alchemize API error: ${alchemizeResponse.statusText}`);
      }

      const alchemizeData = await alchemizeResponse.json();

      if (alchemizeData.success && alchemizeData.alchemicalResult) {
        setAlchemical(alchemizeData.alchemicalResult);

        // Calculate kinetics from alchemical and elemental data
        try {
          const alchemicalResult = alchemizeData.alchemicalResult;

          // Defensive checks before calculating kinetics
          if (
            alchemicalResult.esms &&
            alchemicalResult.elementalProperties &&
            alchemicalResult.thermodynamicProperties
          ) {
            const kineticMetrics = calculateKineticProperties(
              alchemicalResult.esms,
              alchemicalResult.elementalProperties,
              alchemicalResult.thermodynamicProperties,
            );
            setKinetics(kineticMetrics);
          } else {
            console.warn("Incomplete alchemical data for kinetics calculation:", {
              hasEsms: !!alchemicalResult.esms,
              hasElemental: !!alchemicalResult.elementalProperties,
              hasThermodynamics: !!alchemicalResult.thermodynamicProperties,
            });
            setKinetics(null);
          }
        } catch (kineticError) {
          console.error("Error calculating kinetics:", kineticError);
          // Don't fail the whole request if kinetics calculation fails
          setKinetics(null);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Chart data fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [dateTime, location.latitude, location.longitude, zodiacSystem]);

  // Initial fetch
  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  // Auto-refresh if enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchChartData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchChartData]);

  return {
    positions,
    aspects,
    alchemical,
    kinetics,
    timestamp,
    isLoading,
    error,
    refetch: fetchChartData,
  };
}
