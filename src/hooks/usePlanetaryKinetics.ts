/**
 * 🌟 usePlanetaryKinetics Hook
 * React hook for real-time planetary kinetics integration
 *
 * Features: * - Real-time kinetics data with caching
 * - Location-aware calculations
 * - Group dynamics support
 * - Automatic updates every 5 minutes
 * - Error handling and fallback states
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  calculateKinetics,
  type KineticsCalculationInput,
} from "@/calculations/kinetics";
import { _logger } from "@/lib/logger";
import { planetaryKineticsClient } from "@/services/PlanetaryKineticsClient";
import type {
  GroupDynamicsResponse,
  KineticMetrics,
  KineticsEnhancedRecommendation,
  KineticsLocation,
  KineticsOptions,
  KineticsResponse,
  TemporalFoodRecommendation,
} from "@/types/kinetics";
import {
  calculateOptimalPortions,
  getAspectEnhancedRecommendations,
  getElementalFoodRecommendations,
  getTemporalFoodRecommendations,
} from "@/utils/kineticsFoodMatcher";

export interface UsePlanetaryKineticsOptions {
  location?: KineticsLocation;
  updateInterval?: number; // in milliseconds, default 5 minutes
  enableAutoUpdate?: boolean;
  kineticsOptions?: KineticsOptions;
}

export interface UsePlanetaryKineticsReturn {
  // Core kinetics data
  kinetics: KineticsResponse | null;
  groupDynamics: GroupDynamicsResponse | null;
  kineticsMetrics: KineticMetrics | null;

  // Loading and error states
  isLoading: boolean;
  error: string | null;
  isOnline: boolean;
  lastUpdate: Date | null;

  // Enhanced food recommendations
  temporalRecommendations: TemporalFoodRecommendation | null;
  elementalRecommendations: string[];
  aspectEnhancedRecommendations: KineticsEnhancedRecommendation | null;

  // Current state analysis
  currentPowerLevel: number;
  dominantElement: string;
  aspectPhase: "applying" | "exact" | "separating" | null;
  seasonalInfluence: string;

  // Actions
  refreshKinetics: () => Promise<void>;
  fetchGroupDynamics: (userIds: string[]) => Promise<void>;
  calculatePortions: <T extends { amount: number }>(portions: T[]) => T[];
  clearCache: () => void;

  // Health monitoring
  checkHealth: () => Promise<{ status: string; latency: number }>;
}

export function usePlanetaryKinetics(
  options: UsePlanetaryKineticsOptions = {},
): UsePlanetaryKineticsReturn {
  const {
    location = { lat: 40.7128, lon: -74.006 }, // Default to NYC
    updateInterval = 300000, // 5 minutes
    enableAutoUpdate = true,
    kineticsOptions = {},
  } = options;

  // State
  const [kinetics, setKinetics] = useState<KineticsResponse | null>(null);
  const [groupDynamics, setGroupDynamics] =
    useState<GroupDynamicsResponse | null>(null);
  const [kineticsMetrics, setKineticsMetrics] = useState<KineticMetrics | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [previousPlanetaryPositions, setPreviousPlanetaryPositions] =
    useState<Record<string, string> | null>(null);
  const [lastKineticsTime, setLastKineticsTime] = useState<number>(Date.now());

  // Fetch kinetics data
  const refreshKinetics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await planetaryKineticsClient.getEnhancedKinetics(
        location as any,
        kineticsOptions as any,
      );

      // Get current planetary positions (for now using default, can be enhanced later)
      const currentPlanetaryPositions = getDefaultPlanetaryPositions();

      // Calculate kinetics metrics
      const currentTime = Date.now();
      const timeInterval = previousPlanetaryPositions
        ? (currentTime - lastKineticsTime) / 1000
        : 1; // seconds

      const kineticsInput: KineticsCalculationInput = {
        currentPlanetaryPositions,
        previousPlanetaryPositions: previousPlanetaryPositions || undefined,
        timeInterval,
        currentPlanet: "Sun", // Default to Sun, can be enhanced
        previousMetrics: kineticsMetrics || undefined,
      };

      const metrics = calculateKinetics(kineticsInput);

      setKinetics(data as any);
      setKineticsMetrics(metrics);
      setPreviousPlanetaryPositions(currentPlanetaryPositions);
      setLastKineticsTime(currentTime);
      setIsOnline(true);
      setLastUpdate(new Date());

      _logger.debug("usePlanetaryKinetics: Kinetics data updated", {
        powerLevel: (data.data as any).base.power[0]?.power,
        forceMagnitude: metrics.forceMagnitude,
        cacheHit: data.cacheHit,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch kinetics data";
      setError(errorMessage);
      setIsOnline(false);

      _logger.warn("usePlanetaryKinetics: Failed to fetch kinetics", err);
    } finally {
      setIsLoading(false);
    }
  }, [
    location,
    kineticsOptions,
    previousPlanetaryPositions,
    lastKineticsTime,
    kineticsMetrics,
  ]);

  // Fetch group dynamics
  const fetchGroupDynamics = useCallback(
    async (userIds: string[]) => {
      try {
        const data = await planetaryKineticsClient.getGroupDynamics(
          userIds,
          location as any,
        );
        setGroupDynamics(data as any);

        _logger.debug("usePlanetaryKinetics: Group dynamics updated", {
          userCount: userIds.length,
          harmony: (data as any).data.harmony,
        });
      } catch (err) {
        _logger.warn(
          "usePlanetaryKinetics: Failed to fetch group dynamics",
          err,
        );
      }
    },
    [location],
  );

  // Check API health
  const checkHealth = useCallback(async (): Promise<{
    status: string;
    latency: number;
  }> => {
    try {
      const result = await planetaryKineticsClient.checkHealth();
      return typeof result === "boolean"
        ? { status: result ? "online" : "offline", latency: 0 }
        : result;
    } catch (err) {
      _logger.warn("usePlanetaryKinetics: Health check failed", err);
      return { status: "offline", latency: -1 };
    }
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    planetaryKineticsClient.clearCache();
    _logger.debug("usePlanetaryKinetics: Cache cleared");
  }, []);

  // Calculate portions based on kinetics
  const calculatePortions = useCallback(
    <T extends { amount: number }>(portions: T[]): T[] => {
      if (!kinetics) return portions;
      return calculateOptimalPortions(portions, kinetics);
    },
    [kinetics],
  );

  // Auto-update effect
  useEffect(() => {
    // Initial fetch
    void refreshKinetics();

    if (!enableAutoUpdate) return;

    const interval = setInterval(() => void refreshKinetics(), updateInterval);
    return () => clearInterval(interval);
  }, [refreshKinetics, updateInterval, enableAutoUpdate]);

  // Computed values
  const currentPowerLevel = useMemo(() => {
    if (!kinetics?.data?.base?.power) return 0.5;

    const currentHour = new Date().getHours();
    const powerData = kinetics.data.base.power.find(
      (p) => p.hour === currentHour,
    );
    return powerData?.power ?? 0.5;
  }, [kinetics]);

  const dominantElement = useMemo(() => {
    if (!kinetics?.data?.base?.elemental?.totals) return "Earth";

    const { totals } = kinetics.data.base.elemental;
    const entries = Object.entries(totals);
    if (entries.length === 0) return "Earth";

    return entries.sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))[0]?.[0] ?? "Earth";
  }, [kinetics]);

  const aspectPhase = useMemo(():
    | "applying"
    | "exact"
    | "separating"
    | null => {
    if (!kinetics?.data.powerPrediction) return null;

    const { trend } = kinetics.data.powerPrediction;

    if (trend === "ascending" && currentPowerLevel > 0.8) {
      return "applying";
    } else if (trend === "stable" && currentPowerLevel > 0.6) {
      return "exact";
    } else {
      return "separating";
    }
  }, [kinetics, currentPowerLevel]);

  const seasonalInfluence = useMemo(
    () => kinetics?.data?.base?.timing?.seasonalInfluence ?? "Spring",
    [kinetics],
  );

  // Enhanced food recommendations
  const temporalRecommendations =
    useMemo((): TemporalFoodRecommendation | null => {
      if (!kinetics) return null;

      try {
        return getTemporalFoodRecommendations(kinetics, {
          cuisineTypes: [],
          dietaryRestrictions: [],
          allergies: [],
        });
      } catch (err) {
        _logger.warn(
          "usePlanetaryKinetics: Failed to generate temporal recommendations",
          err,
        );
        return null;
      }
    }, [kinetics]);

  const elementalRecommendations = useMemo((): string[] => {
    if (!kinetics?.data?.base?.elemental?.totals) return [];

    try {
      return getElementalFoodRecommendations(
        kinetics.data.base.elemental.totals,
      );
    } catch (err) {
      _logger.warn(
        "usePlanetaryKinetics: Failed to generate elemental recommendations",
        err,
      );
      return [];
    }
  }, [kinetics]);

  const aspectEnhancedRecommendations =
    useMemo((): KineticsEnhancedRecommendation | null => {
      if (!kinetics) return null;

      try {
        return getAspectEnhancedRecommendations(kinetics, {
          cuisineTypes: [],
          dietaryRestrictions: [],
          allergies: [],
        });
      } catch (err) {
        _logger.warn(
          "usePlanetaryKinetics: Failed to generate aspect-enhanced recommendations",
          err,
        );
        return null;
      }
    }, [kinetics]);

  return {
    // Core data
    kinetics,
    groupDynamics,
    kineticsMetrics,

    // States
    isLoading,
    error,
    isOnline,
    lastUpdate,

    // Enhanced recommendations
    temporalRecommendations,
    elementalRecommendations,
    aspectEnhancedRecommendations,

    // Current state
    currentPowerLevel,
    dominantElement,
    aspectPhase,
    seasonalInfluence,

    // Actions
    refreshKinetics,
    fetchGroupDynamics,
    calculatePortions,
    clearCache,
    checkHealth,
  };
}

/**
 * Get default planetary positions for kinetics calculation
 * TODO: Replace with actual planetary position service
 */
function getDefaultPlanetaryPositions(): Record<string, string> {
  return {
    Sun: "leo",
    Moon: "cancer",
    Mercury: "gemini",
    Venus: "libra",
    Mars: "aries",
    Jupiter: "pisces",
    Saturn: "aquarius",
    Uranus: "taurus",
    Neptune: "pisces",
    Pluto: "scorpio",
    Ascendant: "aries",
  };
}
