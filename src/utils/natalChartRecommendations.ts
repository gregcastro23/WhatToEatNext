import { FoodAlchemySystem } from "@/services/FoodAlchemySystem";
import { natalChartToBirthChart, type NatalChart } from "@/services/natalChartService";
import { getCurrentPlanetaryPositions } from "@/services/astrologizeApi";
import type { Recipe } from "@/types/recipe";
import type { ElementalProperties } from "@/types/alchemy";
import type { PlanetPosition } from "@/utils/astrologyUtils";

/**
 * Enhanced recommendation scoring that integrates natal chart compatibility
 */
export interface NatalChartRecommendationScore {
  recipe: Recipe;
  baseScore: number;
  natalChartScore: number;
  finalScore: number;
  compatibility?: {
    compatibility: number;
    recommendations: string[];
    warnings: string[];
  };
}

/**
 * Get the current planetary day based on the day of the week
 */
function getCurrentPlanetaryDay(): string {
  const days = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
  return days[new Date().getDay()];
}

/**
 * Get the current planetary hour (simplified - in reality, this requires complex calculations)
 */
function getCurrentPlanetaryHour(): string {
  // Simplified: rotate through planets by hour
  const planets = ["Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars"];
  const hour = new Date().getHours();
  return planets[hour % 7];
}

/**
 * Check if it's currently daytime (6am - 6pm)
 */
function isDaytime(): boolean {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18;
}

/**
 * Convert a Recipe to FoodCorrespondence for compatibility calculation
 */
function recipeToFoodCorrespondence(recipe: Recipe): any {
  // Get the dominant element from the recipe
  const element = recipe.element || "Fire";

  // Map recipe cuisine to a planetary ruler (simplified)
  const cuisinePlanetMap: Record<string, string> = {
    Italian: "Sun",
    French: "Venus",
    Mexican: "Mars",
    Indian: "Mars",
    Chinese: "Moon",
    Japanese: "Moon",
    Thai: "Mars",
    Greek: "Sun",
    Spanish: "Sun",
    American: "Jupiter",
    Mediterranean: "Sun",
  };

  const planetaryRuler = cuisinePlanetMap[recipe.cuisine || ""] || "Sun";

  return {
    name: recipe.name,
    element,
    planetaryRuler,
    timeOfDay: "Both" as const,
    energyValues: {
      heat: 0.5,
      entropy: 0.5,
      reactivity: 0.5,
      gregsEnergy: 0.5,
      kalchm: 1.0,
      monica: 1.0,
    },
    preparation: recipe.instructions || [],
    combinations: [],
    restrictions: [],
  };
}

/**
 * Calculate a comprehensive recommendation score for a recipe using natal chart data
 *
 * This function:
 * 1. Converts the recipe to a food correspondence
 * 2. Converts the natal chart to a birth chart
 * 3. Uses FoodAlchemySystem to calculate compatibility
 * 4. Combines base score with natal chart compatibility
 *
 * @param recipe - The recipe to score
 * @param natalChart - The user's natal chart
 * @param baseScore - The base recommendation score from other factors
 * @returns Enhanced recommendation score with natal chart compatibility
 */
export async function calculateNatalChartRecommendationScore(
  recipe: Recipe,
  natalChart: NatalChart,
  baseScore: number = 0.5
): Promise<NatalChartRecommendationScore> {
  try {
    // Convert recipe to food correspondence
    const foodCorrespondence = recipeToFoodCorrespondence(recipe);

    // Convert natal chart to birth chart format
    const birthChart = natalChartToBirthChart(natalChart);

    // Get current planetary information
    const planetaryDay = getCurrentPlanetaryDay();
    const planetaryHour = getCurrentPlanetaryHour();
    const isDay = isDaytime();

    // Get current planetary positions
    let currentPlanetaryPositions: Record<string, { sign: string; degree: number }> = {};
    try {
      const positions = await getCurrentPlanetaryPositions();
      currentPlanetaryPositions = Object.entries(positions).reduce((acc, [planet, pos]) => {
        acc[planet] = {
          sign: pos.sign,
          degree: pos.degree,
        };
        return acc;
      }, {} as Record<string, { sign: string; degree: number }>);
    } catch (error) {
      // If we can't get current positions, use natal positions
      currentPlanetaryPositions = Object.entries(natalChart.planetaryPositions).reduce(
        (acc, [planet, sign]) => {
          acc[planet] = { sign, degree: 0 };
          return acc;
        },
        {} as Record<string, { sign: string; degree: number }>
      );
    }

    // Calculate food compatibility using FoodAlchemySystem
    const foodAlchemySystem = new FoodAlchemySystem();
    const compatibility = foodAlchemySystem.calculateFoodCompatibility(
      foodCorrespondence,
      birthChart,
      planetaryDay,
      planetaryHour,
      isDay,
      currentPlanetaryPositions
    );

    // Combine base score (40%) with natal chart compatibility (60%)
    const natalChartScore = compatibility.compatibility;
    const finalScore = baseScore * 0.4 + natalChartScore * 0.6;

    return {
      recipe,
      baseScore,
      natalChartScore,
      finalScore,
      compatibility: {
        compatibility: compatibility.compatibility,
        recommendations: compatibility.recommendations,
        warnings: compatibility.warnings,
      },
    };
  } catch (error) {
    // If calculation fails, return base score only
    console.error("Error calculating natal chart recommendation score:", error);
    return {
      recipe,
      baseScore,
      natalChartScore: 0.5,
      finalScore: baseScore,
    };
  }
}

/**
 * Get recommended recipes enhanced with natal chart compatibility
 *
 * @param recipes - Array of recipes to score
 * @param natalChart - The user's natal chart
 * @param count - Number of recommendations to return
 * @returns Top recommended recipes sorted by natal chart compatibility
 */
export async function getRecommendedRecipesWithNatalChart(
  recipes: Recipe[],
  natalChart: NatalChart,
  count: number = 10
): Promise<NatalChartRecommendationScore[]> {
  // Calculate scores for all recipes
  const scoredRecipes = await Promise.all(
    recipes.map((recipe) =>
      calculateNatalChartRecommendationScore(recipe, natalChart, 0.5)
    )
  );

  // Sort by final score (highest first)
  scoredRecipes.sort((a, b) => b.finalScore - a.finalScore);

  // Return top N recipes
  return scoredRecipes.slice(0, count);
}

/**
 * Calculate elemental harmony between user's natal chart and a recipe
 *
 * @param recipe - The recipe to check
 * @param natalChart - The user's natal chart
 * @returns Harmony score (0-1)
 */
export function calculateElementalHarmony(
  recipe: Recipe,
  natalChart: NatalChart
): number {
  if (!recipe.element) return 0.5;

  const recipeElement = recipe.element;
  const elementalComposition = natalChart.elementalComposition;

  // Get the user's strength in the recipe's element
  const elementStrength = elementalComposition[recipeElement as keyof ElementalProperties] || 0.25;

  // Higher element strength = higher harmony
  return elementStrength;
}

/**
 * Explain why a recipe was recommended based on natal chart
 *
 * @param score - The natal chart recommendation score
 * @returns Human-readable explanation
 */
export function explainNatalChartRecommendation(
  score: NatalChartRecommendationScore
): string {
  const { recipe, natalChartScore, compatibility } = score;

  const reasons: string[] = [];

  // Overall compatibility
  if (natalChartScore > 0.8) {
    reasons.push("This recipe has excellent compatibility with your natal chart.");
  } else if (natalChartScore > 0.6) {
    reasons.push("This recipe harmonizes well with your astrological profile.");
  } else if (natalChartScore > 0.4) {
    reasons.push("This recipe has moderate compatibility with your chart.");
  }

  // Add specific recommendations from compatibility
  if (compatibility?.recommendations && compatibility.recommendations.length > 0) {
    reasons.push(...compatibility.recommendations.slice(0, 2));
  }

  // Add warnings if present
  if (compatibility?.warnings && compatibility.warnings.length > 0) {
    reasons.push(...compatibility.warnings.slice(0, 1));
  }

  return reasons.join(" ");
}
