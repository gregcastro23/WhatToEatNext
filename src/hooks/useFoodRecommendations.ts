import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import {
  getRecommendedIngredients,
  EnhancedIngredient,
} from '@/utils/foodRecommender';
import type {
  ZodiacSign,
  Season,
  AstrologicalState,
  LunarPhase,
  Planet,
} from '@/types/alchemy';

/**
 * Hook to get ingredient recommendations based on current astrological state
 * This replaces the deprecated useIngredientRecommendations hook
 */
export const useFoodRecommendations = (options?: {
  limit?: number;
  filter?: (ingredient: EnhancedIngredient) => boolean;
}) => {
  const { state, planetaryPositions } = useAlchemical();
  const [recommendations, setRecommendations] = useState<EnhancedIngredient[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize the astrological state to prevent unnecessary re-renders
  const astroState = useMemo<AstrologicalState>(() => {
    // Provide fallback values to ensure the object is always complete
    return {
      // Required fields from the type definition
      currentZodiac:
        (state.astrologicalState?.zodiacSign as ZodiacSign) || 'aries',
      moonPhase:
        (state.astrologicalState?.lunarPhase as LunarPhase) || 'NEW_MOON',
      currentPlanetaryAlignment:
        state.astrologicalState?.currentPlanetaryAlignment || {},
      activePlanets: state.astrologicalState?.activePlanets || ['sun', 'moon'],
      planetaryPositions: planetaryPositions || {},
      lunarPhase:
        (state.astrologicalState?.lunarPhase as LunarPhase) || 'NEW_MOON',
      zodiacSign:
        (state.astrologicalState?.zodiacSign as ZodiacSign) || 'aries',
      planetaryHours:
        (state.astrologicalState?.planetaryHour as Planet) || 'sun',
      aspects: state.astrologicalState?.aspects || [],
      tarotElementBoosts: state.astrologicalState?.tarotElementBoosts || {},
      tarotPlanetaryBoosts: state.astrologicalState?.tarotPlanetaryBoosts || {},
    };
  }, [
    state.astrologicalState?.zodiacSign,
    state.astrologicalState?.lunarPhase,
    state.astrologicalState?.currentPlanetaryAlignment,
    state.astrologicalState?.activePlanets,
    state.astrologicalState?.planetaryHour,
    state.astrologicalState?.aspects,
    state.astrologicalState?.tarotElementBoosts,
    state.astrologicalState?.tarotPlanetaryBoosts,
    planetaryPositions,
  ]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);

        // No need to check if astroState exists, we're using the memoized version with fallbacks
        const results = getRecommendedIngredients(astroState);

        // Apply any additional filtering if provided
        const filteredResults = options?.filter
          ? results.filter(options.filter)
          : results;

        // Apply limit if specified
        const limitedResults = options?.limit
          ? filteredResults.slice(0, options.limit)
          : filteredResults;

        setRecommendations(limitedResults);
      } catch (err) {
        // console.error('Error fetching ingredient recommendations:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    // Always try to fetch recommendations, even with fallback data
    fetchRecommendations();
  }, [astroState, options?.filter, options?.limit]);

  // Get the current season
  const currentSeason = useMemo<Season>(() => {
    const date = new Date();
    const month = date.getMonth();

    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }, []);

  // Create a refresh function that can be called to force a refresh
  const refreshRecommendations = useCallback(async () => {
    try {
      setLoading(true);

      // Use our memoized astroState with fallbacks
      const results = getRecommendedIngredients(astroState);

      // Apply filtering and limits
      const filteredResults = options?.filter
        ? results.filter(options.filter)
        : results;

      const limitedResults = options?.limit
        ? filteredResults.slice(0, options.limit)
        : filteredResults;

      setRecommendations(limitedResults);
      setError(null);
    } catch (err) {
      // console.error('Error refreshing ingredient recommendations:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [astroState, options?.filter, options?.limit]);

  return {
    recommendations,
    loading,
    error,
    refreshRecommendations,
    currentSeason,
    currentZodiac: astroState.zodiacSign || 'aries',
    lunarPhase: astroState.lunarPhase,
    activePlanets: astroState.activePlanets || [],
  };
};
