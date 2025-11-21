/**
 * useChartData Hook
 *
 * Fetches and manages planetary chart data using the /api/planetary-positions endpoint.
 * Provides planetary positions, aspects, alchemical properties, and kinetic metrics.
 */

import { useState, useEffect, useCallback } from "react";
import type { PlanetaryAspect } from "@/types/celestial";
import {
  calculateAspects,
  type PlanetPosition,
} from "@/utils/astrologyUtils";
import { calculateKineticProperties } from "@/utils/kineticCalculations";
import type { KineticMetrics } from "@/types/kinetics";
import type {
  PlanetaryPositionsResponse,
  AlchemicalQuantities,
} from "./usePlanetaryPositions";

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
 * Convert API planetary position to internal PlanetPosition format
 */
function convertToPlanetPosition(apiPosition: {
  planet: string;
  sign: string;
  degree: number;
  longitude?: number;
  retrograde: boolean;
}): PlanetPosition {
  // Extract whole degrees and minutes from decimal degree
  const wholeDegrees = Math.floor(apiPosition.degree);
  const decimalMinutes = (apiPosition.degree - wholeDegrees) * 60;
  const minutes = Math.floor(decimalMinutes);

  return {
    sign: apiPosition.sign.toLowerCase() as any,
    degree: wholeDegrees,
    minute: minutes,
    exactLongitude: apiPosition.longitude || 0,
    isRetrograde: apiPosition.retrograde,
  };
}

/**
 * Convert alchemical quantities from API to AlchemicalResult format
 */
function convertToAlchemicalResult(
  alchmQuantities: AlchemicalQuantities,
  monicaConstant: number,
  positions: Record<string, PlanetPosition>,
): AlchemicalResult {
  // Calculate elemental properties from zodiac signs
  const elementalProperties = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0,
  };

  const zodiacElements: Record<string, keyof typeof elementalProperties> = {
    aries: "Fire",
    leo: "Fire",
    sagittarius: "Fire",
    taurus: "Earth",
    virgo: "Earth",
    capricorn: "Earth",
    gemini: "Air",
    libra: "Air",
    aquarius: "Air",
    cancer: "Water",
    scorpio: "Water",
    pisces: "Water",
  };

  let count = 0;
  Object.values(positions).forEach((position) => {
    const element = zodiacElements[position.sign];
    if (element) {
      elementalProperties[element] += 1;
      count++;
    }
  });

  // Normalize to sum to 1.0
  if (count > 0) {
    Object.keys(elementalProperties).forEach((key) => {
      elementalProperties[key as keyof typeof elementalProperties] /= count;
    });
  }

  // Find dominant element
  let dominantElement: string | undefined;
  let maxValue = 0;
  Object.entries(elementalProperties).forEach(([element, value]) => {
    if (value > maxValue) {
      maxValue = value;
      dominantElement = element;
    }
  });

  // Get Sun sign if available
  const sunPosition = positions["Sun"];
  const sunSign = sunPosition
    ? sunPosition.sign.charAt(0).toUpperCase() + sunPosition.sign.slice(1)
    : undefined;

  return {
    elementalProperties,
    thermodynamicProperties: {
      heat: alchmQuantities.Heat,
      entropy: alchmQuantities.Entropy,
      reactivity: alchmQuantities.Reactivity,
      gregsEnergy: alchmQuantities.Energy,
    },
    esms: {
      Spirit: alchmQuantities.spirit,
      Essence: alchmQuantities.essence,
      Matter: alchmQuantities.matter,
      Substance: alchmQuantities.substance,
    },
    kalchm: 1.0, // Not returned by API, would need separate calculation
    monica: monicaConstant,
    score: 0.8, // Default compatibility score
    metadata: {
      source: "planetary-positions-api",
      dominantElement,
      sunSign,
    },
  };
}

/**
 * Hook to fetch and manage planetary chart data
 */
export function useChartData(options: ChartDataOptions = {}): ChartData {
  const {
    dateTime,
    location = { latitude: 40.7128, longitude: -74.006 }, // Default: NYC
    zodiacSystem = "tropical",
    autoRefresh = false,
    refreshInterval = 60000, // 1 minute default
  } = options;

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
    setIsLoading(true);
    setError(null);

    try {
      // Build URL with query parameters
      const params = new URLSearchParams({
        includeAlchemy: "true", // Always include alchemy for full chart data
        zodiacSystem,
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
      });

      if (dateTime) {
        params.append("date", dateTime.toISOString());
      }

      // Fetch from planetary-positions API
      const response = await fetch(`/api/planetary-positions?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data: PlanetaryPositionsResponse = await response.json();

      // Convert API positions to internal format
      const planetPositions: Record<string, PlanetPosition> = {};
      data.planetaryPositions.forEach((apiPos) => {
        planetPositions[apiPos.planet] = convertToPlanetPosition(apiPos);
      });

      setPositions(planetPositions);
      setTimestamp(data.timestamp);

      // Calculate aspects from positions
      const calculatedAspects = calculateAspects(planetPositions);
      setAspects(calculatedAspects);

      // Convert alchemical data if available
      if (data.alchmQuantities && data.monicaConstant !== undefined) {
        const alchemicalResult = convertToAlchemicalResult(
          data.alchmQuantities,
          data.monicaConstant,
          planetPositions,
        );
        setAlchemical(alchemicalResult);

        // Calculate kinetics from alchemical and elemental data
        try {
          const kineticMetrics = calculateKineticProperties(
            alchemicalResult.esms,
            alchemicalResult.elementalProperties,
            {
              ...alchemicalResult.thermodynamicProperties,
              kalchm: alchemicalResult.kalchm,
              monica: alchemicalResult.monica,
            },
          );
          setKinetics(kineticMetrics);
        } catch (kineticError) {
          console.error("Error calculating kinetics:", kineticError);
          setKinetics(null);
        }
      } else {
        setAlchemical(null);
        setKinetics(null);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
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
