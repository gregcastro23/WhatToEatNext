/**
 * Group Natal Chart Service
 *
 * Service for calculating composite natal charts from multiple individual charts.
 * Combines the astrological properties of multiple people to create
 * group-optimized food recommendations.
 */

import type {
  NatalChart,
  GroupMember,
  CompositeNatalChart,
} from "@/types/natalChart";
import type { Element, Modality } from "@/types/celestial";
import type { ElementalProperties } from "@/types/alchemy";
import type { AlchemicalProperties } from "@/types/celestial";
import { getDominantElement } from "@/utils/planetaryAlchemyMapping";
import { _logger } from "@/lib/logger";

/**
 * Calculate composite natal chart from multiple individual charts
 *
 * Uses weighted averaging to combine elemental and alchemical properties
 * across all group members.
 *
 * @param groupMembers - Array of group members with their natal charts
 * @param groupId - ID of the dining group
 * @returns Composite natal chart representing the group
 */
export function calculateCompositeNatalChart(
  groupMembers: GroupMember[],
  groupId: string,
): CompositeNatalChart {
  if (groupMembers.length === 0) {
    throw new Error("Cannot create composite chart from empty group");
  }

  // Initialize accumulators
  const elementalTotals: ElementalProperties = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0,
  };

  const alchemicalTotals: AlchemicalProperties = {
    Spirit: 0,
    Essence: 0,
    Matter: 0,
    Substance: 0,
  };

  const elementCounts: Record<Element, number> = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0,
  };

  const modalityCounts: Record<Modality, number> = {
    Cardinal: 0,
    Fixed: 0,
    Mutable: 0,
  };

  // Aggregate properties from all members
  groupMembers.forEach((member) => {
    const chart = member.natalChart;

    // Sum elemental properties
    Object.entries(chart.elementalBalance).forEach(([element, value]) => {
      elementalTotals[element as Element] += value;
    });

    // Sum alchemical properties
    Object.entries(chart.alchemicalProperties).forEach(([property, value]) => {
      alchemicalTotals[property as keyof AlchemicalProperties] += value;
    });

    // Count dominant elements
    elementCounts[chart.dominantElement] += 1;

    // Count modalities
    modalityCounts[chart.dominantModality] += 1;
  });

  const memberCount = groupMembers.length;

  // Calculate average elemental balance
  const elementalBalance: ElementalProperties = {
    Fire: elementalTotals.Fire / memberCount,
    Water: elementalTotals.Water / memberCount,
    Earth: elementalTotals.Earth / memberCount,
    Air: elementalTotals.Air / memberCount,
  };

  // Calculate average alchemical properties
  const alchemicalProperties: AlchemicalProperties = {
    Spirit: alchemicalTotals.Spirit / memberCount,
    Essence: alchemicalTotals.Essence / memberCount,
    Matter: alchemicalTotals.Matter / memberCount,
    Substance: alchemicalTotals.Substance / memberCount,
  };

  // Determine dominant element and modality
  const dominantElement = getDominantElement(elementalBalance) as Element;

  let dominantModality: Modality = "Cardinal";
  let maxModalityCount = 0;
  (Object.entries(modalityCounts) as Array<[Modality, number]>).forEach(
    ([modality, count]) => {
      if (count > maxModalityCount) {
        maxModalityCount = count;
        dominantModality = modality;
      }
    },
  );

  // Calculate element distribution percentages
  const elementalDistribution: Record<Element, number> = {
    Fire: (elementCounts.Fire / memberCount) * 100,
    Water: (elementCounts.Water / memberCount) * 100,
    Earth: (elementCounts.Earth / memberCount) * 100,
    Air: (elementCounts.Air / memberCount) * 100,
  };

  // Calculate modality distribution percentages
  const modalityDistribution: Record<Modality, number> = {
    Cardinal: (modalityCounts.Cardinal / memberCount) * 100,
    Fixed: (modalityCounts.Fixed / memberCount) * 100,
    Mutable: (modalityCounts.Mutable / memberCount) * 100,
  };

  const compositeChart: CompositeNatalChart = {
    groupId,
    memberCount,
    dominantElement,
    dominantModality,
    elementalBalance,
    alchemicalProperties,
    elementalDistribution,
    modalityDistribution,
    calculatedAt: new Date().toISOString(),
  };

  _logger.debug("Composite natal chart calculated", {
    groupId,
    memberCount,
    dominantElement,
    dominantModality,
  } as any);

  return compositeChart;
}

/**
 * Get elemental harmony score for a group
 *
 * Measures how balanced the group's elemental distribution is.
 * Higher scores indicate better balance (0-1 scale).
 *
 * @param compositeChart - Composite natal chart for the group
 * @returns Harmony score between 0 and 1
 */
export function calculateElementalHarmony(
  compositeChart: CompositeNatalChart,
): number {
  const { elementalBalance } = compositeChart;

  // Calculate standard deviation of elemental values
  const values = Object.values(elementalBalance);
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    values.length;
  const stdDev = Math.sqrt(variance);

  // Perfect balance (all elements equal at 0.25) has stdDev = 0
  // Maximum imbalance (one element = 1.0, others = 0) has stdDev ≈ 0.433
  // Normalize to 0-1 scale where 1 = perfect balance
  const maxStdDev = 0.433;
  const harmony = 1 - Math.min(stdDev / maxStdDev, 1);

  return harmony;
}

/**
 * Get diversity score for a group
 *
 * Measures how diverse the group's astrological makeup is.
 * Higher scores indicate more diverse membership (0-1 scale).
 *
 * @param compositeChart - Composite natal chart for the group
 * @returns Diversity score between 0 and 1
 */
export function calculateGroupDiversity(
  compositeChart: CompositeNatalChart,
): number {
  const { elementalDistribution, modalityDistribution } = compositeChart;

  // Count how many elements are represented (> 0%)
  const elementsPresent = Object.values(elementalDistribution).filter(
    (pct) => pct > 0,
  ).length;

  // Count how many modalities are represented (> 0%)
  const modalitiesPresent = Object.values(modalityDistribution).filter(
    (pct) => pct > 0,
  ).length;

  // Perfect diversity: all 4 elements and all 3 modalities present
  const elementDiversity = elementsPresent / 4;
  const modalityDiversity = modalitiesPresent / 3;

  // Weighted average (elements more important than modalities)
  const diversity = elementDiversity * 0.7 + modalityDiversity * 0.3;

  return diversity;
}

/**
 * Get insights about a group's composite chart
 *
 * @param compositeChart - Composite natal chart for the group
 * @returns Human-readable insights about the group
 */
export function getGroupInsights(
  compositeChart: CompositeNatalChart,
): string[] {
  const insights: string[] = [];
  const harmony = calculateElementalHarmony(compositeChart);
  const diversity = calculateGroupDiversity(compositeChart);

  // Dominant element insight
  insights.push(
    `The group has a ${compositeChart.dominantElement} dominant energy, ` +
      `suggesting ${getElementInsight(compositeChart.dominantElement)} preferences.`,
  );

  // Harmony insight
  if (harmony > 0.8) {
    insights.push(
      "The group has excellent elemental balance, making most cuisines appealing.",
    );
  } else if (harmony > 0.6) {
    insights.push(
      "The group has good elemental balance with some preferences.",
    );
  } else {
    insights.push(
      "The group has strong elemental preferences that should be considered.",
    );
  }

  // Diversity insight
  if (diversity > 0.8) {
    insights.push("This is a diverse group - fusion cuisines may work well.");
  } else if (diversity < 0.4) {
    insights.push(
      "This group has similar tastes - focused cuisines recommended.",
    );
  }

  // Modality insight
  insights.push(
    `The ${compositeChart.dominantModality} modality suggests ` +
      `${getModalityInsight(compositeChart.dominantModality)} dining experiences.`,
  );

  return insights;
}

/**
 * Get insight text for an element
 */
function getElementInsight(element: Element): string {
  const insights: Record<Element, string> = {
    Fire: "bold, spicy, and energizing",
    Water: "cooling, soothing, and comforting",
    Earth: "grounding, hearty, and substantial",
    Air: "light, fresh, and stimulating",
  };
  return insights[element];
}

/**
 * Get insight text for a modality
 */
function getModalityInsight(modality: Modality): string {
  const insights: Record<Modality, string> = {
    Cardinal: "innovative and adventurous",
    Fixed: "traditional and satisfying",
    Mutable: "varied and adaptable",
  };
  return insights[modality];
}
