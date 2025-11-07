/**
 * User Personalization Hook - Phase 26 Advanced Features
 *
 * Provides comprehensive personalization capabilities including preference learning,
 * recommendation scoring, and adaptive UI based on user behavior patterns.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { logger } from "@/lib/logger";
import { userLearning } from "@/lib/personalization/user-learning";
import type { ElementalProperties } from "@/types/alchemy";
import { usePerformanceMonitoring } from "./usePerformanceMonitoring";

interface PersonalizationData {
  userId: string;
  preferences: {
    cuisines: string[];
    ingredients: {
      favorites: string[];
      dislikes: string[];
    };
    elementalAffinities: ElementalProperties;
    complexity: "simple" | "moderate" | "complex";
    planetaryPreferences: Record<string, number>;
  };
  recommendations: {
    scores: Array<{
      id: string;
      score: number;
      reasons: string[];
      confidence: number;
    }>;
    lastUpdated: number;
  };
  learningStats: {
    totalInteractions: number;
    confidence: number;
    lastActivity: number;
  };
  isLoading: boolean;
}

interface PersonalizationConfig {
  autoLearn: boolean;
  trackViews: boolean;
  cacheRecommendations: boolean;
  updateInterval: number;
}

export function usePersonalization(
  userId: string | null,
  config: PersonalizationConfig = {
    autoLearn: true,
    trackViews: true,
    cacheRecommendations: true,
    updateInterval: 60000, // 1 minute
  },
) {
  const { trackApiCall } = usePerformanceMonitoring();

  const [data, setData] = useState<PersonalizationData>({
    userId: userId || "anonymous",
    preferences: {
      cuisines: [],
      ingredients: { favorites: [], dislikes: [] },
      elementalAffinities: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
      complexity: "moderate",
      planetaryPreferences: {},
    },
    recommendations: {
      scores: [],
      lastUpdated: 0,
    },
    learningStats: {
      totalInteractions: 0,
      confidence: 0,
      lastActivity: 0,
    },
    isLoading: true,
  });

  // Load user preferences
  const loadPreferences = useCallback(async () => {
    if (!userId) return;

    const startTime = performance.now();

    try {
      setData((prev) => ({ ...prev, isLoading: true }));

      const preferences = await userLearning.getUserPreferences(userId);

      setData((prev) => ({
        ...prev,
        preferences: {
          cuisines: preferences.cuisinePreferences,
          ingredients: {
            favorites: preferences.favoriteIngredients,
            dislikes: preferences.dislikedIngredients,
          },
          elementalAffinities: preferences.elementalAffinities,
          complexity: preferences.complexityPreference,
          planetaryPreferences: preferences.planetaryPreferences,
        },
        learningStats: {
          totalInteractions: preferences.totalInteractions,
          confidence: preferences.learningConfidence,
          lastActivity: preferences.lastActivity,
        },
        isLoading: false,
      }));

      const responseTime = performance.now() - startTime;
      trackApiCall("personalization/preferences", responseTime);

      logger.debug("User preferences loaded", {
        userId,
        confidence: preferences.learningConfidence,
        responseTime,
      });
    } catch (error) {
      logger.error("Failed to load user preferences", { userId, error });
      setData((prev) => ({ ...prev, isLoading: false }));
    }
  }, [userId, trackApiCall]);

  // Track recipe interaction
  const trackRecipeInteraction = useCallback(
    async (
      recipeData: {
        id: string;
        ingredients: string[];
        cuisine: string;
        cookingMethod: string;
        complexity: string;
        elementalBalance: ElementalProperties;
      },
      interactionType: "view" | "save" | "cook",
    ) => {
      if (!userId || !config.autoLearn) return;

      try {
        userLearning.learnFromRecipe(userId, recipeData, interactionType);

        // Update local preferences after learning
        await loadPreferences();

        logger.debug("Recipe interaction tracked", {
          userId,
          recipeId: recipeData.id,
          type: interactionType,
        });
      } catch (error) {
        logger.error("Failed to track recipe interaction", { userId, error });
      }
    },
    [userId, config.autoLearn, loadPreferences],
  );

  // Track ingredient preferences
  const trackIngredientPreferences = useCallback(
    async (selected: string[], rejected: string[] = []) => {
      if (!userId || !config.autoLearn) return;

      try {
        userLearning.learnFromIngredients(userId, selected, rejected);
        await loadPreferences();

        logger.debug("Ingredient preferences tracked", {
          userId,
          selected: selected.length,
          rejected: rejected.length,
        });
      } catch (error) {
        logger.error("Failed to track ingredient preferences", {
          userId,
          error,
        });
      }
    },
    [userId, config.autoLearn, loadPreferences],
  );

  // Track planetary interest
  const trackPlanetaryInterest = useCallback(
    async (planetaryHour: string, engagement: number) => {
      if (!userId || !config.autoLearn) return;

      try {
        userLearning.learnFromPlanetaryQuery(userId, planetaryHour, engagement);
        await loadPreferences();

        logger.debug("Planetary interest tracked", {
          userId,
          planet: planetaryHour,
          engagement,
        });
      } catch (error) {
        logger.error("Failed to track planetary interest", { userId, error });
      }
    },
    [userId, config.autoLearn, loadPreferences],
  );

  // Get personalized recommendations
  const getPersonalizedRecommendations = useCallback(
    async (
      baseRecommendations: any[],
      context?: { planetaryHour?: string; timeOfDay?: string },
    ) => {
      if (!userId) {
        return baseRecommendations.map((rec) => ({
          ...rec,
          personalizedScore: rec.score || 0.5,
          reasons: ["No personalization data available"],
          confidence: 0,
        }));
      }

      const startTime = performance.now();

      try {
        const personalizedScores =
          await userLearning.personalizeRecommendations(
            userId,
            baseRecommendations,
            context,
          );

        const responseTime = performance.now() - startTime;
        trackApiCall("personalization/recommendations", responseTime);

        setData((prev: any) => ({
          ...prev,
          recommendations: {
            scores: personalizedScores,
            lastUpdated: Date.now(),
          },
        } as any));

        logger.debug("Personalized recommendations generated", {
          userId,
          count: personalizedScores.length,
          avgConfidence:
            personalizedScores.reduce((sum, r) => sum + r.confidence, 0) /
            personalizedScores.length,
          responseTime,
        });

        return personalizedScores.map((score) => ({
          ...baseRecommendations.find((rec) => rec.id === score.recipeId),
          personalizedScore: score.personalizedScore,
          reasons: score.reasons,
          confidence: score.confidence,
        }));
      } catch (error) {
        logger.error("Failed to generate personalized recommendations", {
          userId,
          error,
        });
        return baseRecommendations;
      }
    },
    [userId, trackApiCall],
  );

  // Get personalization insights for UI
  const getPersonalizationInsights = useCallback(() => {
    const { preferences, learningStats } = data;

    const insights = {
      // Learning progress
      learningStage:
        learningStats.confidence < 0.3
          ? "early"
          : learningStats.confidence < 0.7
            ? "developing"
            : "mature",

      // Top preferences
      topCuisines: preferences.cuisines.slice(0, 3),
      topIngredients: preferences.ingredients.favorites.slice(0, 5),

      // Elemental dominance
      dominantElement:
        Object.entries(preferences.elementalAffinities).sort(
          ([, a], [, b]) => b - a,
        )[0]?.[0] || "balanced",

      // Planetary preferences
      topPlanets: Object.entries(preferences.planetaryPreferences)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([planet]) => planet),

      // Personalization recommendations
      uiRecommendations: [
        ...(learningStats.confidence < 0.5
          ? ["Interact with more recipes to improve recommendations"]
          : []),
        ...(preferences.cuisines.length < 3
          ? ["Try recipes from different cuisines to expand your palate"]
          : []),
        ...(Object.keys(preferences.planetaryPreferences).length < 3
          ? ["Explore planetary hours to enhance timing guidance"]
          : []),
      ],
    };

    return insights;
  }, [data]);

  // Auto-track page views if enabled
  useEffect(() => {
    if (!config.trackViews || !userId) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Track general engagement
        userLearning.trackInteraction(userId, {
          type: "recipe_view",
          data: { type: "page_visit" },
          timestamp: Date.now(),
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [userId, config.trackViews]);

  // Periodic preference refresh
  useEffect(() => {
    if (!userId || !config.updateInterval) return;

    const interval = setInterval(loadPreferences, config.updateInterval);
    return () => clearInterval(interval);
  }, [userId, config.updateInterval, loadPreferences]);

  // Initial load
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  return {
    // Data
    data,
    isLoading: data.isLoading,

    // Actions
    trackRecipeInteraction,
    trackIngredientPreferences,
    trackPlanetaryInterest,
    getPersonalizedRecommendations,

    // Utilities
    getPersonalizationInsights,
    refreshPreferences: loadPreferences,

    // Computed properties
    hasPersonalizationData: data.learningStats.totalInteractions > 0,
    personalizationStrength: data.learningStats.confidence,
    isPersonalizationMature: data.learningStats.confidence >= 0.7,
  };
}

export default usePersonalization;
