/**
 * User Chart Helper Utilities
 *
 * Provides convenient functions for accessing and working with
 * user natal charts and personalized recommendations.
 */

import { compareCharts } from "@/services/ChartComparisonService";
import type { ChartComparison } from "@/services/ChartComparisonService";
import { personalizedRecommendationService } from "@/services/PersonalizedRecommendationService";
import type {
  RecommendableItem,
  PersonalizedRecommendation,
  PersonalizationContext,
} from "@/services/PersonalizedRecommendationService";
import { userDatabase } from "@/services/userDatabaseService";
import type { NatalChart } from "@/types/natalChart";

/**
 * Get user's natal chart by user ID
 */
export async function getUserNatalChart(
  userId: string,
): Promise<NatalChart | null> {
  const user = await userDatabase.getUserById(userId);
  return user?.profile.natalChart || null;
}

/**
 * Get user's natal chart by email
 */
export async function getUserNatalChartByEmail(
  email: string,
): Promise<NatalChart | null> {
  const user = await userDatabase.getUserByEmail(email);
  return user?.profile.natalChart || null;
}

/**
 * Check if user has completed onboarding and has a natal chart
 */
export async function userHasNatalChart(userId: string): Promise<boolean> {
  const chart = await getUserNatalChart(userId);
  return chart !== null;
}

/**
 * Get chart comparison for a user (natal vs current moment)
 */
export async function getUserChartComparison(
  userId: string,
): Promise<ChartComparison | null> {
  const natalChart = await getUserNatalChart(userId);

  if (!natalChart) {
    return null;
  }

  return await compareCharts(natalChart);
}

/**
 * Get personalized recommendations for a user
 *
 * @param userId - User ID
 * @param items - Items to score (cuisines, recipes, etc.)
 * @param limit - Maximum number of recommendations to return
 * @param includeReasons - Whether to include explanation reasons
 * @returns Sorted array of personalized recommendations
 */
export async function getPersonalizedRecommendationsForUser(
  userId: string,
  items: RecommendableItem[],
  limit = 10,
  includeReasons = true,
): Promise<PersonalizedRecommendation[] | null> {
  const natalChart = await getUserNatalChart(userId);

  if (!natalChart) {
    return null;
  }

  const context: PersonalizationContext = {
    natalChart,
    includeReasons,
  };

  return await personalizedRecommendationService.getTopRecommendations(
    items,
    context,
    limit,
  );
}

/**
 * Get personalized recommendations for a user by email
 */
export async function getPersonalizedRecommendationsByEmail(
  email: string,
  items: RecommendableItem[],
  limit = 10,
  includeReasons = true,
): Promise<PersonalizedRecommendation[] | null> {
  const natalChart = await getUserNatalChartByEmail(email);

  if (!natalChart) {
    return null;
  }

  const context: PersonalizationContext = {
    natalChart,
    includeReasons,
  };

  return await personalizedRecommendationService.getTopRecommendations(
    items,
    context,
    limit,
  );
}

/**
 * Calculate compatibility between user and a single item
 *
 * @param userId - User ID
 * @param item - Item to check compatibility with
 * @returns Compatibility score (0-1) or null if user has no natal chart
 */
export async function calculateUserItemCompatibility(
  userId: string,
  item: RecommendableItem,
): Promise<number | null> {
  const natalChart = await getUserNatalChart(userId);

  if (!natalChart) {
    return null;
  }

  return await personalizedRecommendationService.calculateCompatibility(
    item,
    natalChart,
  );
}

/**
 * Get user's favorable elements for current moment
 */
export async function getUserFavorableElements(
  userId: string,
): Promise<string[] | null> {
  const comparison = await getUserChartComparison(userId);

  if (!comparison) {
    return null;
  }

  return comparison.insights.favorableElements.map((e) => e.toString());
}

/**
 * Get user's challenging elements for current moment
 */
export async function getUserChallengingElements(
  userId: string,
): Promise<string[] | null> {
  const comparison = await getUserChartComparison(userId);

  if (!comparison) {
    return null;
  }

  return comparison.insights.challengingElements.map((e) => e.toString());
}

/**
 * Get user's harmonic planets for current moment
 */
export async function getUserHarmonicPlanets(
  userId: string,
): Promise<string[] | null> {
  const comparison = await getUserChartComparison(userId);

  if (!comparison) {
    return null;
  }

  return comparison.insights.harmonicPlanets.map((p) => p.toString());
}

/**
 * Get personalized insights for a user
 */
export async function getUserPersonalizedInsights(userId: string): Promise<{
  overallHarmony: number;
  favorableElements: string[];
  challengingElements: string[];
  harmonicPlanets: string[];
  recommendations: string[];
} | null> {
  const comparison = await getUserChartComparison(userId);

  if (!comparison) {
    return null;
  }

  return {
    overallHarmony: comparison.overallHarmony,
    favorableElements: comparison.insights.favorableElements.map((e) =>
      e.toString(),
    ),
    challengingElements: comparison.insights.challengingElements.map((e) =>
      e.toString(),
    ),
    harmonicPlanets: comparison.insights.harmonicPlanets.map((p) =>
      p.toString(),
    ),
    recommendations: comparison.insights.recommendations,
  };
}

/**
 * Check if current is a good time for the user (based on harmony)
 */
export async function isGoodTimeForUser(userId: string): Promise<boolean> {
  const comparison = await getUserChartComparison(userId);

  if (!comparison) {
    return true; // Neutral if no chart
  }

  return comparison.overallHarmony > 0.6;
}

export default {
  getUserNatalChart,
  getUserNatalChartByEmail,
  userHasNatalChart,
  getUserChartComparison,
  getPersonalizedRecommendationsForUser,
  getPersonalizedRecommendationsByEmail,
  calculateUserItemCompatibility,
  getUserFavorableElements,
  getUserChallengingElements,
  getUserHarmonicPlanets,
  getUserPersonalizedInsights,
  isGoodTimeForUser,
};
