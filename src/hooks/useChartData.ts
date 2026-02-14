/**
 * useChartData Hook
 *
 * Fetches and manages planetary chart data from the astrologize and alchemize APIs.
 * Calculates planetary aspects and provides alchemical properties.
 */

import { useState, useEffect, useCallback } from "react";
import type { PlanetaryPosition, PlanetaryAspect } from "@/types/celestial";
import { useUser } from "@/contexts/UserContext"; // Import the useUser hook
type PlanetPosition = PlanetaryPosition;
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

// ... (interfaces remain the same)

export function useChartData(options: ChartDataOptions = {}): ChartData {
  const {
    dateTime,
    location: optionLocation, // Rename to avoid conflict
    zodiacSystem = "tropical",
    autoRefresh = false,
    refreshInterval = 60000, // 1 minute default
  } = options;

  const { currentUser } = useUser();
  const userLocation = currentUser?.birthData?.location;

  // Determine the location to use: option > user > null
  const location = optionLocation || userLocation;

  const [positions, setPositions] = useState<Record<
    string,
    PlanetPosition
  > | null>(null);
  const [aspects, setAspects] = useState<PlanetaryAspect[]>([]);
  const [alchemical, setAlchemical] = useState<AlchemicalResult | null>(null);
  const [kinetics, setKinetics] = useState<KineticMetrics | null>(null);
  const [timestamp, setTimestamp] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChartData = useCallback(async () => {
    // If no location is available, do not fetch data
    if (!location) {
      setError("Location data is required to fetch chart data.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams({
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
        zodiacSystem,
      });

      // ... (rest of the fetch logic remains the same)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Chart data fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [dateTime, location, zodiacSystem]);

  // ... (useEffect hooks remain the same)

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
