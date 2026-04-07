import { useCallback, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import type { PlanetaryAspect, PlanetaryPosition } from "@/types/celestial";
import type { KineticMetrics } from "@/types/kinetics";

/**
 * useChartData Hook
 *
 * Fetches and manages planetary chart data from the astrologize and alchemize APIs.
 * Calculates planetary aspects and provides alchemical properties.
 */
 // Import the useUser hook
type PlanetPosition = PlanetaryPosition;
// Define the expected structure of AlchemicalResult
export interface AlchemicalResult {
  // Properties expected by AlchemicalDisplay.tsx
  elementalProperties: Record<string, number>; // Assuming a Record for elements
  thermodynamicProperties: {
    heat: number;
    entropy: number;
    reactivity: number;
    gregsEnergy?: number; // Optional, as not directly destructured but could be part of it
  };
  esms: Record<string, number>; // ESMS values
  kalchm: number;
  monica: number;
  score: number;
  metadata?: {
    dominantElement?: string;
    sunSign?: string;
    source?: string;
    chartRuler?: string;
    dominantModality?: string;
  };
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
}
// Define the return type of the useChartData hook
export interface ChartData {
  positions: Record<string, PlanetPosition> | null;
  aspects: PlanetaryAspect[];
  alchemical: AlchemicalResult | null;
  kinetics: KineticMetrics | null;
  timestamp: string | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}
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
    dateTime: _dateTime,
    location: optionLocation, // Rename to avoid conflict
    zodiacSystem = "tropical",
    autoRefresh: _autoRefresh = false,
    refreshInterval: _refreshInterval = 60000, // 1 minute default
  } = options;
  const { currentUser } = useUser();
  const userLocation = currentUser?.birthData
    ? {
        latitude: currentUser.birthData.latitude,
        longitude: currentUser.birthData.longitude,
      }
    : undefined;
  // Determine the location to use: option > user > null
  const location = optionLocation || userLocation;
  const [positions, _setPositions] = useState<Record<
    string,
    PlanetPosition
  > | null>(null);
  const [aspects, _setAspects] = useState<PlanetaryAspect[]>([]);
  const [alchemical, _setAlchemical] = useState<AlchemicalResult | null>(null);
  const [kinetics, _setKinetics] = useState<KineticMetrics | null>(null);
  const [timestamp, _setTimestamp] = useState<string | null>(null);
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
      const _params = new URLSearchParams({
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
  }, [location, zodiacSystem]);

  const refetch = useCallback(() => {
    void fetchChartData();
  }, [fetchChartData]);
  // ... (useEffect hooks remain the same)
  return {
    positions,
    aspects,
    alchemical,
    kinetics,
    timestamp,
    isLoading,
    error,
    refetch,
  };
}
