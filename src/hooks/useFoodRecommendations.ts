import { useState, useEffect, useMemo, useCallback } from 'react';

import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { usePlanetaryKinetics } from '@/hooks/usePlanetaryKinetics';
import { _logger } from '@/lib/logger';
import type { ZodiacSign, Season, AstrologicalState, LunarPhase, Planet } from '@/types/alchemy';
import type { KineticsEnhancedRecommendation } from '@/types/kinetics';
import { getRecommendedIngredients, EnhancedIngredient } from '@/utils/foodRecommender';
import { calculateKineticAlignment } from '@/utils/kineticsFoodMatcher';

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

export const _useFoodRecommendations = (options: FoodRecommendationOptions = {}) => {
  const { state, planetaryPositions } = useAlchemical();
  const [recommendations, setRecommendations] = useState<EnhancedIngredient[]>([]);
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
    isOnline: isKineticsOnline
  } = usePlanetaryKinetics({
    location: options.location,
    enableAutoUpdate: options.enableKinetics !== false
  });

  // Memoize the astrological state to prevent unnecessary re-renders
  const astroState = useMemo<AstrologicalState>(() => {
    // Provide fallback values to ensure the object is always complete
    return {
      // Required fields from the type definition
      currentZodiac: (state.astrologicalState.zodiacSign as any) || 'aries',
      moonPhase: (state.astrologicalState.lunarPhase as LunarPhase) || 'NEW_MOON',
      currentPlanetaryAlignment: state.astrologicalState.currentPlanetaryAlignment || {},
      activePlanets: state.astrologicalState.activePlanets || ['sun', 'moon'],
      planetaryPositions: planetaryPositions || {},
      lunarPhase: (state.astrologicalState.lunarPhase as LunarPhase) || 'NEW_MOON',
      zodiacSign: (state.astrologicalState.zodiacSign as any) || 'aries',
      planetaryHours: (state.astrologicalState.planetaryHour as Planet) || 'sun',
      aspects: state.astrologicalState.aspects || [],
      tarotElementBoosts: state.astrologicalState.tarotElementBoosts || {},
      tarotPlanetaryBoosts: state.astrologicalState.tarotPlanetaryBoosts || {},
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- High-risk domain requiring flexibility
    } as any;
  }, [
    state.astrologicalState.zodiacSign,
    state.astrologicalState.lunarPhase,
    state.astrologicalState.currentPlanetaryAlignment,
    state.astrologicalState.activePlanets,
    state.astrologicalState.planetaryHour,
    state.astrologicalState.aspects,
    state.astrologicalState.tarotElementBoosts,
    state.astrologicalState.tarotPlanetaryBoosts,
    planetaryPositions
  ])

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get base astrological recommendations
        const results = getRecommendedIngredients(astroState);

        // Enhance with kinetics if available
        let enhancedResults = results;
        if (kinetics && options.enableKinetics !== false) {
          enhancedResults = results.map(ingredient => {
            const kineticScore = calculateKineticAlignment(
              {
                id: ingredient.name,
                name: ingredient.name,
                tags: ingredient.tags || [],
                elementalProfile: ingredient.elementalProperties || { Fire: 0, Water: 0, Air: 0, Earth: 0 },
                basePortionSize: 1,
                nutritionalDensity: ingredient.nutritionalScore || 0.5
              },
              kinetics
            );

            return {
              ...ingredient,
              kineticScore,
              temporalCategory: currentPowerLevel > 0.7 ? 'energizing' :
                              currentPowerLevel < 0.4 ? 'grounding' : 'balanced',
              aspectPhase,
              dominantElement,
              powerLevel: currentPowerLevel
            };
          });

          // Sort by kinetic alignment for temporal optimization
          enhancedResults.sort((a, b) => (b.kineticScore || 0) - (a.kineticScore || 0));
        }

        // Apply any additional filtering if provided
        const filteredResults = options?.filter ? enhancedResults.filter(options.filter) : enhancedResults;

        // Apply limit if specified
        const limitedResults = options?.limit
          ? filteredResults.slice(0, options.limit)
          : filteredResults;

        setRecommendations(limitedResults);
      } catch (err) {
        _logger.error('Error fetching ingredient recommendations:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    // Always try to fetch recommendations, even with fallback data
    void fetchRecommendations();
  }, [astroState, kinetics, currentPowerLevel, aspectPhase, dominantElement, options?.filter, options?.limit, options.enableKinetics]);

  // Get the current season
  const currentSeason = useMemo<Season>(() => {
    const date = new Date();
    const month = date.getMonth();

    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }, []);

  // Enhanced refresh function with kinetics support
  const refreshRecommendations = useCallback(async () => {
    try {
      setLoading(true);

      const results = getRecommendedIngredients(astroState);

      // Enhance with kinetics if available
      let enhancedResults = results;
      if (kinetics && options.enableKinetics !== false) {
        enhancedResults = results.map(ingredient => {
          const kineticScore = calculateKineticAlignment(
            {
              id: ingredient.name,
              name: ingredient.name,
              tags: ingredient.tags || [],
              elementalProfile: ingredient.elementalProperties || { Fire: 0, Water: 0, Air: 0, Earth: 0 },
              basePortionSize: 1,
              nutritionalDensity: ingredient.nutritionalScore || 0.5
            },
            kinetics
          );

          return {
            ...ingredient,
            kineticScore,
            temporalCategory: currentPowerLevel > 0.7 ? 'energizing' :
                            currentPowerLevel < 0.4 ? 'grounding' : 'balanced',
            aspectPhase,
            dominantElement,
            powerLevel: currentPowerLevel
          };
        });

        enhancedResults.sort((a, b) => (b.kineticScore || 0) - (a.kineticScore || 0));
      }

      const filteredResults = options?.filter ? enhancedResults.filter(options.filter) : enhancedResults;
      const limitedResults = options?.limit
        ? filteredResults.slice(0, options.limit)
        : filteredResults;

      setRecommendations(limitedResults);
      setError(null);
    } catch (err) {
      _logger.error('Error refreshing ingredient recommendations:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [astroState, kinetics, currentPowerLevel, aspectPhase, dominantElement, options?.filter, options?.limit, options.enableKinetics]);

  // Group dining support
  const getGroupRecommendations = useCallback(async (userIds: string[]) => {
    if (!kinetics || !options.enableKinetics) return recommendations;

    try {
      await fetchGroupDynamics(userIds);
      // Group recommendations logic would be implemented here
      return recommendations;
    } catch (err) {
      _logger.warn('Group recommendations failed, using individual recommendations', err);
      return recommendations;
    }
  }, [kinetics, recommendations, fetchGroupDynamics, options.enableKinetics]);

  return {
    // Core recommendations
    recommendations,
    loading,
    error,
    refreshRecommendations,

    // Astrological data
    currentSeason,
    currentZodiac: astroState.zodiacSign || 'aries',
    lunarPhase: astroState.lunarPhase,
    activePlanets: astroState.activePlanets || [],

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

    // Kinetics status
    kineticsData: kinetics,
    isKineticsOnline
  };
};

// Legacy export for compatibility
export const useFoodRecommendations = _useFoodRecommendations;
