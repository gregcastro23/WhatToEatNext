import { useState, useEffect, useMemo, useCallback } from "react";
import { useAlchemical } from "@/contexts/AlchemicalContext/hooks";
import { usePlanetaryKinetics } from "@/hooks/usePlanetaryKinetics";
import { _logger } from "@/lib/logger";
import type { ZodiacSignType, LunarPhase, Planet } from "@/types/alchemy";
import type {
  AstrologicalState,
  CelestialPosition,
  PlanetaryAlignment,
  PlanetaryAspect,
} from "@/types/celestial";
import type { Season } from "@/types/common";
import type {
  KineticsEnhancedRecommendation,
  KineticsResponse,
  TemporalFoodRecommendation,
} from "@/types/kinetics";
import type { EnhancedIngredient } from "@/utils/foodRecommender";
import { getRecommendedIngredients } from "@/utils/foodRecommender";
import { calculateKineticAlignment } from "@/utils/kineticsFoodMatcher";

/**
 * Enhanced Hook for Kinetics-Aware Food Recommendations
 * Integrates astrological state with real-time planetary kinetics
 * Provides temporal food intelligence and dynamic portion sizing
 */
export interface FoodRecommendationOptions {
  limit?: number;
  filter?: (ingredient: EnhancedIngredient) => boolean;
  enableKinetics?: boolean;
  location?: { lat: number; lon: number };
  userIds?: string[]; // For group recommendations
}

export interface UseFoodRecommendationsReturn {
  recommendations: EnhancedIngredient[];
  loading: boolean;
  error: string | null;
  refreshRecommendations: () => void;
  currentSeason: Season;
  currentZodiac: string;
  lunarPhase: string;
  activePlanets: string[];
  isKineticsEnabled: boolean;
  temporalRecommendations: TemporalFoodRecommendation | null;
  elementalRecommendations: string[];
  aspectEnhancedRecommendations: KineticsEnhancedRecommendation | null;
  currentPowerLevel: number;
  dominantElement: string;
  aspectPhase: "applying" | "exact" | "separating" | null;
  calculatePortions: <T extends { amount: number }>(portions: T[]) => T[];
  getGroupRecommendations: (userIds: string[]) => Promise<EnhancedIngredient[]>;
  fetchGroupDynamics: (userIds: string[]) => Promise<void>;
  kineticsData: KineticsResponse | null;
  isKineticsOnline: boolean;
}

export const useFoodRecommendations = (
  options: FoodRecommendationOptions = {},
): UseFoodRecommendationsReturn => {
  const { state, planetaryPositions } = useAlchemical();
  const [recommendations, setRecommendations] = useState<EnhancedIngredient[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Kinetics integration
  const {
    kinetics,
    temporalRecommendations,
    elementalRecommendations,
    aspectEnhancedRecommendations,
    currentPowerLevel,
    dominantElement,
    aspectPhase,
    calculatePortions,
    fetchGroupDynamics,
    isOnline: isKineticsOnline,
  } = usePlanetaryKinetics({
    location: options.location,
    enableAutoUpdate: options.enableKinetics !== false,
  });

  // Memoize the astrological state to prevent unnecessary re-renders
  const astroState = useMemo<AstrologicalState>(() => {
    const rawState = state.astrologicalState;
    return {
      currentZodiac: (rawState.zodiacSign as ZodiacSignType | undefined) ?? "aries",
      moonPhase: (rawState.lunarPhase as LunarPhase | undefined) ?? "new moon",
      currentPlanetaryAlignment: rawState.currentPlanetaryAlignment as PlanetaryAlignment | undefined,
      activePlanets: rawState.activePlanets,
      planetaryPositions: planetaryPositions as Record<
        string,
        CelestialPosition
      >,
      lunarPhase: (rawState.lunarPhase as LunarPhase | undefined) ?? "new moon",
      zodiacSign: (rawState.zodiacSign as ZodiacSignType | undefined) ?? "aries",
      planetaryHours: (state.planetaryHour as unknown as Planet | undefined) ?? "Sun",
      aspects: rawState.aspects as PlanetaryAspect[],
      tarotElementBoosts: rawState.tarotElementBoosts as Record<string, number>,
      tarotPlanetaryBoosts: rawState.tarotPlanetaryBoosts as Record<string, number>,
    };
  }, [
    state.astrologicalState,
    state.planetaryHour,
    planetaryPositions,
  ]);

  useEffect(() => {
    const fetchRecommendations = (): void => {
      try {
        setLoading(true);
        setError(null);

        // Get base astrological recommendations
        const results = getRecommendedIngredients(astroState);

        // Enhance with kinetics if available
        let enhancedResults = results;
        if (kinetics && options.enableKinetics !== false) {
          enhancedResults = results.map((ingredient) => {
            const kineticScore = calculateKineticAlignment(
              {
                id: ingredient.name,
                name: ingredient.name,
                tags: Array.isArray(ingredient.tags) ? (ingredient.tags as string[]) : [],
                elementalProfile: ingredient.elementalProperties,
                basePortionSize: 1,
                nutritionalDensity:
                  typeof ingredient.nutritionalScore === "number"
                    ? ingredient.nutritionalScore
                    : 0.5,
              },
              kinetics,
            );

            return {
              ...ingredient,
              kineticScore,
              temporalCategory:
                currentPowerLevel > 0.7
                  ? "energizing"
                  : currentPowerLevel < 0.4
                    ? "grounding"
                    : "balanced",
              aspectPhase: aspectPhase ?? undefined,
              dominantElement,
              powerLevel: currentPowerLevel,
            };
          });

          // Sort by kinetic alignment for temporal optimization
          enhancedResults.sort(
            (a, b) =>
              Number((b as { kineticScore?: number }).kineticScore ?? 0) -
              Number((a as { kineticScore?: number }).kineticScore ?? 0),
          );
        }

        // Apply any additional filtering if provided
        const filteredResults = options.filter
          ? enhancedResults.filter(options.filter)
          : enhancedResults;

        // Apply limit if specified
        const limitedResults = options.limit
          ? filteredResults.slice(0, options.limit)
          : filteredResults;

        setRecommendations(limitedResults);
      } catch (err) {
        _logger.error("Error fetching ingredient recommendations: ", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [
    astroState,
    kinetics,
    currentPowerLevel,
    aspectPhase,
    dominantElement,
    options.filter,
    options.limit,
    options.enableKinetics,
  ]);

  // Get the current season
  const currentSeason = useMemo<Season>(() => {
    const date = new Date();
    const month = date.getMonth();

    if (month >= 2 && month <= 4) return "spring";
    if (month >= 5 && month <= 7) return "summer";
    if (month >= 8 && month <= 10) return "autumn";
    return "winter";
  }, []);

  // Enhanced refresh function with kinetics support
  const refreshRecommendations = useCallback(() => {
    try {
      setLoading(true);

      const results = getRecommendedIngredients(astroState);

      // Enhance with kinetics if available
      let enhancedResults = results;
      if (kinetics && options.enableKinetics !== false) {
        enhancedResults = results.map((ingredient) => {
          const kineticScore = calculateKineticAlignment(
            {
              id: ingredient.name,
              name: ingredient.name,
              tags: Array.isArray(ingredient.tags) ? (ingredient.tags as string[]) : [],
              elementalProfile: ingredient.elementalProperties,
              basePortionSize: 1,
              nutritionalDensity:
                typeof ingredient.nutritionalScore === "number"
                  ? ingredient.nutritionalScore
                  : 0.5,
            },
            kinetics,
          );

          return {
            ...ingredient,
            kineticScore,
            temporalCategory:
              currentPowerLevel > 0.7
                ? "energizing"
                : currentPowerLevel < 0.4
                  ? "grounding"
                  : "balanced",
            aspectPhase: aspectPhase ?? undefined,
            dominantElement,
            powerLevel: currentPowerLevel,
          };
        });

        enhancedResults.sort(
          (a, b) =>
            Number((b as { kineticScore?: number }).kineticScore ?? 0) -
            Number((a as { kineticScore?: number }).kineticScore ?? 0),
        );
      }

      const filteredResults = options.filter
        ? enhancedResults.filter(options.filter)
        : enhancedResults;
      const limitedResults = options.limit
        ? filteredResults.slice(0, options.limit)
        : filteredResults;

      setRecommendations(limitedResults);
      setError(null);
    } catch (err) {
      _logger.error("Error refreshing ingredient recommendations: ", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  }, [
    astroState,
    kinetics,
    currentPowerLevel,
    aspectPhase,
    dominantElement,
    options.filter,
    options.limit,
    options.enableKinetics,
  ]);

  // Group dining support
  const getGroupRecommendations = useCallback(
    async (userIds: string[]) => {
      if (!kinetics || !options.enableKinetics) return recommendations;

      try {
        await fetchGroupDynamics(userIds);
        // Group recommendations logic would be implemented here
        return recommendations;
      } catch (err) {
        _logger.warn(
          "Group recommendations failed, using individual recommendations",
          err,
        );
        return recommendations;
      }
    },
    [kinetics, recommendations, fetchGroupDynamics, options.enableKinetics],
  );

  return {
    // Core recommendations
    recommendations,
    loading,
    error,
    refreshRecommendations,

    // Astrological data
    currentSeason,
    currentZodiac: typeof astroState.zodiacSign === "string" ? astroState.zodiacSign : "aries",
    lunarPhase: astroState.lunarPhase ?? "new moon",
    activePlanets: astroState.activePlanets ?? [],

    // Kinetics enhancement
    isKineticsEnabled: options.enableKinetics !== false && isKineticsOnline,
    temporalRecommendations,
    elementalRecommendations,
    aspectEnhancedRecommendations,
    currentPowerLevel,
    dominantElement,
    aspectPhase,

    // Advanced features
    calculatePortions,
    getGroupRecommendations,
    fetchGroupDynamics,

    // Kinetics status
    kineticsData: kinetics,
    isKineticsOnline,
  };
};

// Export default
export default useFoodRecommendations;
