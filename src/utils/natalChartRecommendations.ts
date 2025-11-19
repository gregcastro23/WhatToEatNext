/**
 * Natal Chart Recommendations
 *
 * Utilities for calculating food recommendation scores based on
 * individual and group natal charts.
 */

import type {
  NatalChart,
  GroupMember,
  GroupRecipeScore,
  MemberRecipeScore,
  GroupScoringStrategy,
  CompositeNatalChart,
} from "@/types/natalChart";
import type { ElementalProperties, AlchemicalProperties } from "@/types/celestial";
import { calculateCompositeNatalChart } from "@/services/groupNatalChartService";

/**
 * Recipe data structure (simplified for compatibility scoring)
 */
export interface RecipeData {
  id: string;
  name: string;
  elementalProperties?: ElementalProperties;
  alchemicalProperties?: AlchemicalProperties;
  cuisine?: string;
  tags?: string[];
}

/**
 * Calculate elemental compatibility between recipe and natal chart
 *
 * Compares the elemental properties of a recipe with a person's
 * elemental balance from their natal chart.
 *
 * @param recipeElementals - Recipe's elemental properties
 * @param chartElementals - Person's elemental balance
 * @returns Compatibility score (0-1)
 */
function calculateElementalCompatibility(
  recipeElementals: ElementalProperties,
  chartElementals: ElementalProperties,
): number {
  let compatibility = 0;
  const elements: Array<keyof ElementalProperties> = [
    "Fire",
    "Water",
    "Earth",
    "Air",
  ];

  elements.forEach((element) => {
    // Higher person's elemental affinity + higher recipe elemental = better match
    const personAffinity = chartElementals[element];
    const recipeStrength = recipeElementals[element];

    // Weighted product: both being high is best
    compatibility += personAffinity * recipeStrength;
  });

  // Normalize to 0-1 range
  // Maximum would be if both had all 1.0 in same element = 1.0
  // Typical scores will be lower, so we scale up slightly
  return Math.min(compatibility * 1.5, 1.0);
}

/**
 * Calculate alchemical compatibility between recipe and natal chart
 *
 * Compares the alchemical properties (ESMS) of a recipe with a person's
 * alchemical profile from their natal chart.
 *
 * @param recipeAlchemical - Recipe's alchemical properties
 * @param chartAlchemical - Person's alchemical properties
 * @returns Compatibility score (0-1)
 */
function calculateAlchemicalCompatibility(
  recipeAlchemical: AlchemicalProperties,
  chartAlchemical: AlchemicalProperties,
): number {
  // Calculate correlation between recipe and chart alchemical properties
  const properties: Array<keyof AlchemicalProperties> = [
    "Spirit",
    "Essence",
    "Matter",
    "Substance",
  ];

  let dotProduct = 0;
  let chartMagnitude = 0;
  let recipeMagnitude = 0;

  properties.forEach((property) => {
    const chartValue = chartAlchemical[property];
    const recipeValue = recipeAlchemical[property];

    dotProduct += chartValue * recipeValue;
    chartMagnitude += chartValue * chartValue;
    recipeMagnitude += recipeValue * recipeValue;
  });

  // Cosine similarity
  const magnitude = Math.sqrt(chartMagnitude) * Math.sqrt(recipeMagnitude);
  if (magnitude === 0) return 0.5; // Neutral if no data

  const similarity = dotProduct / magnitude;

  // Normalize to 0-1 range
  return (similarity + 1) / 2;
}

/**
 * Calculate individual recommendation score
 *
 * Combines base recipe score (40%) with natal chart compatibility (60%)
 *
 * @param recipe - Recipe to score
 * @param natalChart - Person's natal chart
 * @param baseScore - Base recipe score (0-1)
 * @returns Combined score (0-1) and reasons
 */
export function calculateIndividualRecommendationScore(
  recipe: RecipeData,
  natalChart: NatalChart,
  baseScore: number = 0.5,
): { score: number; compatibility: number; reasons: string[] } {
  const reasons: string[] = [];

  // If recipe doesn't have elemental/alchemical data, use base score only
  if (!recipe.elementalProperties || !recipe.alchemicalProperties) {
    return {
      score: baseScore,
      compatibility: 0.5,
      reasons: ["Recipe compatibility data not available"],
    };
  }

  // Calculate elemental compatibility
  const elementalComp = calculateElementalCompatibility(
    recipe.elementalProperties,
    natalChart.elementalBalance,
  );

  // Calculate alchemical compatibility
  const alchemicalComp = calculateAlchemicalCompatibility(
    recipe.alchemicalProperties,
    natalChart.alchemicalProperties,
  );

  // Overall natal compatibility (average of elemental and alchemical)
  const natalCompatibility = (elementalComp + alchemicalComp) / 2;

  // Combined score: 40% base + 60% natal
  const score = baseScore * 0.4 + natalCompatibility * 0.6;

  // Generate reasons
  if (elementalComp > 0.7) {
    reasons.push(
      `Strong elemental match with your ${natalChart.dominantElement} energy`,
    );
  }

  if (alchemicalComp > 0.7) {
    reasons.push("Excellent alchemical harmony with your chart");
  }

  if (natalCompatibility > 0.8) {
    reasons.push("Highly compatible with your natal chart");
  } else if (natalCompatibility < 0.4) {
    reasons.push("Different energy than your chart profile");
  }

  return {
    score,
    compatibility: natalCompatibility,
    reasons,
  };
}

/**
 * Calculate group recommendation score
 *
 * Scores a recipe for multiple people using the selected aggregation strategy.
 *
 * @param recipe - Recipe to score
 * @param groupMembers - Array of group members
 * @param strategy - Scoring strategy to use
 * @param baseScore - Base recipe score (0-1)
 * @returns Group score with per-member breakdown
 */
export function calculateGroupRecommendationScore(
  recipe: RecipeData,
  groupMembers: GroupMember[],
  strategy: GroupScoringStrategy = { type: "average" },
  baseScore: number = 0.5,
): GroupRecipeScore {
  if (groupMembers.length === 0) {
    throw new Error("Cannot calculate group score for empty group");
  }

  // Calculate individual scores for each member
  const memberScores: MemberRecipeScore[] = groupMembers.map((member) => {
    const individualResult = calculateIndividualRecommendationScore(
      recipe,
      member.natalChart,
      baseScore,
    );

    return {
      memberId: member.id,
      memberName: member.name,
      score: individualResult.score,
      compatibility: individualResult.compatibility,
      reasons: individualResult.reasons,
    };
  });

  // Calculate group score based on strategy
  let groupScore: number;
  let groupCompatibility: number;
  let harmony: number;

  switch (strategy.type) {
    case "minimum":
      // Use the lowest individual score (ensure everyone is satisfied)
      groupScore = Math.min(...memberScores.map((ms) => ms.score));
      groupCompatibility = Math.min(
        ...memberScores.map((ms) => ms.compatibility),
      );
      harmony = calculateHarmonyScore(memberScores);
      break;

    case "weighted":
      // Use weighted average based on provided weights
      if (!strategy.weights) {
        throw new Error("Weighted strategy requires weights parameter");
      }
      let totalWeight = 0;
      let weightedSum = 0;
      let weightedCompSum = 0;

      memberScores.forEach((ms) => {
        const weight = strategy.weights![ms.memberId] || 1.0;
        weightedSum += ms.score * weight;
        weightedCompSum += ms.compatibility * weight;
        totalWeight += weight;
      });

      groupScore = weightedSum / totalWeight;
      groupCompatibility = weightedCompSum / totalWeight;
      harmony = calculateHarmonyScore(memberScores);
      break;

    case "consensus":
      // Only recommend if most members like it
      const threshold = strategy.minimumConsensus || 0.6;
      const highScores = memberScores.filter(
        (ms) => ms.score >= threshold,
      ).length;
      const consensusRatio = highScores / memberScores.length;

      if (consensusRatio >= 0.7) {
        // Good consensus
        groupScore = memberScores.reduce((sum, ms) => sum + ms.score, 0) / memberScores.length;
        groupCompatibility =
          memberScores.reduce((sum, ms) => sum + ms.compatibility, 0) /
          memberScores.length;
      } else {
        // Poor consensus, lower the score
        groupScore =
          (memberScores.reduce((sum, ms) => sum + ms.score, 0) /
            memberScores.length) *
          0.7;
        groupCompatibility =
          (memberScores.reduce((sum, ms) => sum + ms.compatibility, 0) /
            memberScores.length) *
          0.7;
      }
      harmony = consensusRatio;
      break;

    case "average":
    default:
      // Simple average of all scores
      groupScore =
        memberScores.reduce((sum, ms) => sum + ms.score, 0) /
        memberScores.length;
      groupCompatibility =
        memberScores.reduce((sum, ms) => sum + ms.compatibility, 0) /
        memberScores.length;
      harmony = calculateHarmonyScore(memberScores);
      break;
  }

  // Generate group-level reasons
  const reasons: string[] = [];
  const avgScore =
    memberScores.reduce((sum, ms) => sum + ms.score, 0) / memberScores.length;

  if (harmony > 0.8) {
    reasons.push("Great consensus - everyone will enjoy this!");
  } else if (harmony < 0.5) {
    reasons.push("Mixed opinions in the group");
  }

  if (avgScore > 0.7) {
    reasons.push("Highly rated by the group overall");
  }

  // Check if recipe matches group's composite chart
  if (recipe.elementalProperties && recipe.alchemicalProperties) {
    const compositeChart = calculateCompositeNatalChart(
      groupMembers,
      "temp-group",
    );
    const compositeElementalComp = calculateElementalCompatibility(
      recipe.elementalProperties,
      compositeChart.elementalBalance,
    );

    if (compositeElementalComp > 0.7) {
      reasons.push(
        `Matches your group's ${compositeChart.dominantElement} energy`,
      );
    }
  }

  return {
    recipeId: recipe.id,
    recipeName: recipe.name,
    groupScore,
    groupCompatibility,
    harmony,
    memberScores,
    aggregationStrategy: strategy.type,
    reasons,
  };
}

/**
 * Calculate harmony score (how much agreement there is)
 *
 * @param memberScores - Individual member scores
 * @returns Harmony score (0-1, higher = more agreement)
 */
function calculateHarmonyScore(memberScores: MemberRecipeScore[]): number {
  if (memberScores.length <= 1) return 1.0;

  const scores = memberScores.map((ms) => ms.score);
  const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length;

  // Calculate variance
  const variance =
    scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);

  // Lower standard deviation = higher harmony
  // Maximum stdDev is ~0.5 (when scores range from 0 to 1)
  const maxStdDev = 0.5;
  return 1 - Math.min(stdDev / maxStdDev, 1);
}

/**
 * Filter "Best for everyone" recipes
 *
 * Returns only recipes where the minimum individual score is high,
 * ensuring everyone in the group will like it.
 *
 * @param groupScores - Array of group recipe scores
 * @param minimumThreshold - Minimum acceptable score for all members (default 0.6)
 * @returns Filtered array of group scores
 */
export function filterBestForEveryone(
  groupScores: GroupRecipeScore[],
  minimumThreshold: number = 0.6,
): GroupRecipeScore[] {
  return groupScores.filter((groupScore) => {
    const minMemberScore = Math.min(
      ...groupScore.memberScores.map((ms) => ms.score),
    );
    return minMemberScore >= minimumThreshold;
  });
}
