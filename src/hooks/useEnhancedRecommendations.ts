"use client";

/**
 * Enhanced Recommendations Hook - With Natal Chart Integration
 *
 * Custom hook for managing enhanced recipe recommendations with backend integration,
 * astrological context, natal chart compatibility, and personalized filtering.
 */

import { useState, useCallback } from "react";
import { useUser } from "@/contexts/UserContext";
import {
  getRecommendedRecipesWithNatalChart,
  type Recipe as NatalRecipe,
} from "@/utils/natalChartRecommendations";

// Type definitions
interface EnhancedRecommendationContext {
  datetime?: string;
  location?: { latitude: number; longitude: number };
  preferences?: {
    dietaryRestrictions: string[];
    cuisinePreferences: string[];
    spiceLevel: number;
  };
  useBackendInfluence?: boolean;
  useNatalChart?: boolean;
}

interface Recipe {
  id: string;
  name: string;
  cuisine: string;
  description: string;
  cookingTime: number;
  difficulty: "Easy" | "Medium" | "Hard";
  rating: number;
  tags: string[];
}

interface RecommendationResult {
  recipe: Recipe;
  score: number;
  reasons: string[];
  alchemicalCompatibility: number;
  astrologicalAlignment: number;
  natalChartCompatibility?: number;
  elementalMatch?: number;
  planetaryHarmony?: number;
}

interface EnhancedRecommendationsResponse {
  recommendations: RecommendationResult[];
  totalCount: number;
  processingTime: number;
  astrologicalContext: {
    dominantElement: string;
    planetaryHour: string;
    lunarPhase: string;
  };
}

// Mock backend client
const kitchenBackendClient = {
  getCuisineRecommendations: async (
    payload: EnhancedRecommendationContext,
  ): Promise<EnhancedRecommendationsResponse> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock response
    const mockRecipes: Recipe[] = [
      {
        id: "1",
        name: "Celestial Pasta Primavera",
        cuisine: "italian",
        description: "Fresh seasonal vegetables with cosmic elemental balance",
        cookingTime: 25,
        difficulty: "Medium",
        rating: 4.8,
        tags: ["vegetarian", "seasonal", "elemental-balance"],
      },
      {
        id: "2",
        name: "Planetary Spice Curry",
        cuisine: "indian",
        description: "Aromatic curry aligned with current planetary influences",
        cookingTime: 45,
        difficulty: "Hard",
        rating: 4.9,
        tags: ["vegan", "spicy", "planetary-aligned"],
      },
      {
        id: "3",
        name: "Lunar Phase Salad",
        cuisine: "mediterranean",
        description:
          "Light, refreshing salad perfect for the current moon phase",
        cookingTime: 15,
        difficulty: "Easy",
        rating: 4.6,
        tags: ["raw", "lunar-aligned", "cleansing"],
      },
    ];

    const recommendations: RecommendationResult[] = mockRecipes.map(
      (recipe, index) => ({
        recipe,
        score: 0.9 - index * 0.1,
        reasons: [
          "Matches dietary preferences",
          "Aligned with current planetary hour",
          "Compatible with elemental balance",
        ],
        alchemicalCompatibility: 0.85 - index * 0.05,
        astrologicalAlignment: 0.8 - index * 0.03,
      }),
    );

    return {
      recommendations,
      totalCount: recommendations.length,
      processingTime: 750,
      astrologicalContext: {
        dominantElement: "Fire",
        planetaryHour: "Venus",
        lunarPhase: "waxing crescent",
      },
    };
  },
};

// Hook implementation
export const useEnhancedRecommendations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] =
    useState<EnhancedRecommendationsResponse | null>(null);

  // Get user context for natal chart data
  const { currentUser } = useUser();

  const getRecommendations = useCallback(
    async (
      context?: Partial<EnhancedRecommendationContext>,
      initial?: EnhancedRecommendationContext,
    ) => {
      setLoading(true);
      setError(null);

      try {
        const payload: EnhancedRecommendationContext = {
          datetime: context?.datetime ?? initial?.datetime,
          location: context?.location ?? initial?.location,
          preferences: context?.preferences ?? initial?.preferences,
          useBackendInfluence:
            context?.useBackendInfluence ??
            initial?.useBackendInfluence ??
            true,
          useNatalChart:
            context?.useNatalChart ??
            initial?.useNatalChart ??
            true,
        };

        // Get base recommendations
        const result =
          await kitchenBackendClient.getCuisineRecommendations(payload);

        // Apply natal chart scoring if available and enabled
        if (payload.useNatalChart && currentUser?.natalChart) {
          // Convert recipes to natal chart format
          const natalRecipes: NatalRecipe[] = result.recommendations.map(
            (rec) => ({
              id: rec.recipe.id,
              name: rec.recipe.name,
              cuisine: rec.recipe.cuisine,
              description: rec.recipe.description,
              cookingTime: rec.recipe.cookingTime,
              difficulty: rec.recipe.difficulty,
              rating: rec.recipe.rating,
              tags: rec.recipe.tags,
            }),
          );

          // Get base scores
          const baseScores = new Map(
            result.recommendations.map((rec) => [rec.recipe.id, rec.score]),
          );

          // Apply natal chart scoring
          const natalRecommendations = getRecommendedRecipesWithNatalChart(
            natalRecipes,
            currentUser.natalChart,
            baseScores,
          );

          // Convert back to RecommendationResult format
          const enhancedRecommendations: RecommendationResult[] =
            natalRecommendations.map((natalRec) => ({
              recipe: natalRec.recipe,
              score: natalRec.score,
              reasons: natalRec.reasons,
              alchemicalCompatibility: natalRec.baseScore,
              astrologicalAlignment: natalRec.planetaryHarmony,
              natalChartCompatibility: natalRec.natalChartCompatibility,
              elementalMatch: natalRec.elementalMatch,
              planetaryHarmony: natalRec.planetaryHarmony,
            }));

          const enhancedResult: EnhancedRecommendationsResponse = {
            ...result,
            recommendations: enhancedRecommendations,
          };

          setRecommendations(enhancedResult);
          return enhancedResult;
        }

        setRecommendations(result);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to fetch recommendations";
        setError(errorMessage);

        // Return fallback response
        const fallbackResponse: EnhancedRecommendationsResponse = {
          recommendations: [],
          totalCount: 0,
          processingTime: 0,
          astrologicalContext: {
            dominantElement: "Earth",
            planetaryHour: "Sun",
            lunarPhase: "new moon",
          },
        };

        setRecommendations(fallbackResponse);
        return fallbackResponse;
      } finally {
        setLoading(false);
      }
    },
    [currentUser],
  );

  const clearRecommendations = useCallback(() => {
    setRecommendations(null);
    setError(null);
  }, []);

  const refreshRecommendations = useCallback(
    async (context?: Partial<EnhancedRecommendationContext>) => {
      if (!recommendations) return null;
      return await getRecommendations(context);
    },
    [getRecommendations, recommendations],
  );

  return {
    recommendations,
    loading,
    error,
    getRecommendations,
    clearRecommendations,
    refreshRecommendations,
    isConnected: !error && recommendations !== null,
  };
};
