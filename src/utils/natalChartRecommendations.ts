/**
 * Natal Chart Recommendations
 *
 * Integrates natal chart data with food recommendations using the FoodAlchemySystem
 * to provide personalized culinary suggestions based on birth chart compatibility.
 */

import type { NatalChart } from "@/services/natalChartService";
import type { SystemState, FoodCorrespondence } from "@/lib/FoodAlchemySystem";
import { FoodAlchemySystem } from "@/lib/FoodAlchemySystem";
import type { Element } from "@/types/celestial";
import { _logger } from "@/lib/logger";

/**
 * Recipe interface for recommendations
 */
export interface Recipe {
  id: string;
  name: string;
  cuisine: string;
  description: string;
  cookingTime: number;
  difficulty: "Easy" | "Medium" | "Hard";
  rating: number;
  tags: string[];
  elementalProperties?: Record<Element, number>;
  alchemicalProperties?: {
    Spirit: number;
    Essence: number;
    Matter: number;
    Substance: number;
  };
}

/**
 * Recommendation result with natal chart compatibility
 */
export interface NatalChartRecommendation {
  recipe: Recipe;
  score: number;
  natalChartCompatibility: number;
  baseScore: number;
  reasons: string[];
  elementalMatch: number;
  planetaryHarmony: number;
}

/**
 * Calculate natal chart compatibility score for a recipe
 *
 * Uses the FoodAlchemySystem to calculate compatibility between
 * the recipe's properties and the user's natal chart.
 *
 * @param recipe - Recipe to score
 * @param natalChart - User's natal chart
 * @returns Compatibility score (0-1)
 */
export function calculateNatalChartRecommendationScore(
  recipe: Recipe,
  natalChart: NatalChart,
): {
  score: number;
  elementalMatch: number;
  planetaryHarmony: number;
  reasons: string[];
} {
  try {
    // If recipe doesn't have elemental properties, use default balanced values
    const recipeElements = recipe.elementalProperties || {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    };

    // Create system state from natal chart
    const systemState: SystemState = {
      elements: natalChart.dominantElements,
      metrics: {
        heat: 0.5,
        entropy: 0.5,
        reactivity: 0.5,
      },
      planetaryPositions: natalChart.planetaryPositions,
    };

    // Create food correspondence from recipe
    const foodCorrespondence: FoodCorrespondence = {
      food: recipe.name,
      foodGroup: recipe.cuisine,
      foodType: recipe.cuisine,
      element: getDominantElement(recipeElements),
      planet: "Venus" as any, // Default to Venus (food/pleasure)
      alchemy: {
        day: [1, 1, 1, 1],
        night: [1, 1, 1, 1],
      },
      energyValues: {
        heat: 0.5,
        entropy: 0.5,
        reactivity: 0.5,
      },
    };

    // Calculate compatibility using FoodAlchemySystem
    const alchemySystem = new FoodAlchemySystem();
    const compatibility = alchemySystem.calculateFoodCompatibility(
      foodCorrespondence,
      systemState,
      new Date(),
    );

    // Calculate elemental match score (how well recipe elements match natal chart)
    const elementalMatch = calculateElementalMatchScore(
      recipeElements,
      natalChart.dominantElements,
    );

    // Calculate planetary harmony (based on compatibility score details)
    const planetaryHarmony = compatibility.scoreDetails?.planetaryDayMatch || 0.5;

    // Generate reasons based on scores
    const reasons: string[] = [];

    // Overall compatibility
    if (compatibility.score > 0.8) {
      reasons.push("Excellent alchemical alignment with your birth chart");
    } else if (compatibility.score > 0.6) {
      reasons.push("Good compatibility with your natal energies");
    }

    // Elemental matches
    const topElement = Object.entries(natalChart.dominantElements)
      .sort(([, a], [, b]) => b - a)[0];
    if (topElement && recipeElements[topElement[0] as Element] > 0.3) {
      reasons.push(`Resonates with your dominant ${topElement[0]} element`);
    }

    // Add any recommendations from the compatibility calculation
    if (compatibility.recommendations && compatibility.recommendations.length > 0) {
      reasons.push(...compatibility.recommendations.slice(0, 2));
    }

    return {
      score: compatibility.score,
      elementalMatch,
      planetaryHarmony,
      reasons: reasons.slice(0, 3), // Limit to top 3 reasons
    };
  } catch (error) {
    _logger.error("Error calculating natal chart recommendation score", error as any);
    // Return neutral score on error
    return {
      score: 0.5,
      elementalMatch: 0.5,
      planetaryHarmony: 0.5,
      reasons: ["Standard recommendation"],
    };
  }
}

/**
 * Get dominant element from elemental properties
 */
function getDominantElement(elements: Record<Element, number>): Element {
  return Object.entries(elements).reduce((a, b) =>
    a[1] > b[1] ? a : b,
  )[0] as Element;
}

/**
 * Calculate elemental match score between recipe and natal chart
 *
 * Measures how well the recipe's elemental balance aligns with
 * the user's natal elemental balance.
 *
 * @param recipeElements - Recipe's elemental properties
 * @param chartElements - Natal chart's dominant elements
 * @returns Match score (0-1)
 */
function calculateElementalMatchScore(
  recipeElements: Record<Element, number>,
  chartElements: Record<Element, number>,
): number {
  // Calculate correlation between recipe and chart elements
  // Higher correlation means better match

  let dotProduct = 0;
  let recipeMagnitude = 0;
  let chartMagnitude = 0;

  const elements: Element[] = ["Fire", "Water", "Earth", "Air"];

  elements.forEach((element) => {
    const recipeVal = recipeElements[element] || 0;
    const chartVal = chartElements[element] || 0;

    dotProduct += recipeVal * chartVal;
    recipeMagnitude += recipeVal * recipeVal;
    chartMagnitude += chartVal * chartVal;
  });

  // Cosine similarity
  const magnitude = Math.sqrt(recipeMagnitude) * Math.sqrt(chartMagnitude);
  if (magnitude === 0) return 0.5;

  const similarity = dotProduct / magnitude;

  // Normalize to 0-1 range (cosine similarity is -1 to 1)
  return (similarity + 1) / 2;
}

/**
 * Get recommended recipes with natal chart scoring
 *
 * Combines base recipe recommendations with natal chart compatibility
 * to provide personalized suggestions.
 *
 * @param recipes - Available recipes
 * @param natalChart - User's natal chart
 * @param baseScores - Optional base scores for recipes
 * @returns Sorted recommendations with natal chart compatibility
 */
export function getRecommendedRecipesWithNatalChart(
  recipes: Recipe[],
  natalChart: NatalChart,
  baseScores?: Map<string, number>,
): NatalChartRecommendation[] {
  const recommendations: NatalChartRecommendation[] = recipes.map((recipe) => {
    // Get base score (from other recommendation logic)
    const baseScore = baseScores?.get(recipe.id) || 0.5;

    // Calculate natal chart compatibility
    const natalCompatibility = calculateNatalChartRecommendationScore(
      recipe,
      natalChart,
    );

    // Combine scores: 40% base + 60% natal chart compatibility
    const combinedScore = baseScore * 0.4 + natalCompatibility.score * 0.6;

    return {
      recipe,
      score: combinedScore,
      natalChartCompatibility: natalCompatibility.score,
      baseScore,
      reasons: natalCompatibility.reasons,
      elementalMatch: natalCompatibility.elementalMatch,
      planetaryHarmony: natalCompatibility.planetaryHarmony,
    };
  });

  // Sort by combined score (descending)
  return recommendations.sort((a, b) => b.score - a.score);
}

/**
 * Get explanation for why a recipe matches a natal chart
 *
 * @param recipe - Recipe to explain
 * @param natalChart - User's natal chart
 * @returns Human-readable explanation
 */
export function getNatalChartMatchExplanation(
  recipe: Recipe,
  natalChart: NatalChart,
): string {
  const compatibility = calculateNatalChartRecommendationScore(
    recipe,
    natalChart,
  );

  const explanations: string[] = [];

  // Overall compatibility level
  if (compatibility.score > 0.8) {
    explanations.push("This dish has exceptional alchemical alignment with your birth chart.");
  } else if (compatibility.score > 0.6) {
    explanations.push("This dish harmonizes well with your natal energies.");
  } else {
    explanations.push("This dish offers an interesting energetic contrast.");
  }

  // Elemental explanation
  const recipeElements = recipe.elementalProperties || {
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25,
  };
  const dominantRecipeElement = getDominantElement(recipeElements);
  const chartElementValue = natalChart.dominantElements[dominantRecipeElement];

  if (chartElementValue > 0.3) {
    explanations.push(
      `Its ${dominantRecipeElement} element resonates with your natal chart's emphasis on ${dominantRecipeElement}.`,
    );
  }

  // Add specific reasons
  if (compatibility.reasons.length > 0) {
    explanations.push(...compatibility.reasons);
  }

  return explanations.join(" ");
}
