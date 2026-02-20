/**
 * Personalized Recommendation Service
 *
 * Integrates user natal chart with moment chart to personalize
 * cuisine and recipe recommendations.
 *
 * This service wraps existing recommendation logic and applies
 * personalization boosts based on astrological harmony.
 */

import {
  compareCharts,
  calculateMomentChart,
  getPersonalizationBoost,
} from "@/services/ChartComparisonService";
import type {
  ChartComparison,
  MomentChart,
} from "@/services/ChartComparisonService";
import type { NatalChart } from "@/types/natalChart";
import type {
  ElementalProperties,
  AlchemicalProperties,
  Element,
} from "@/types/alchemy";
import { _logger } from "@/lib/logger";

/**
 * Cuisine/Recipe item with elemental and alchemical properties
 */
export interface RecommendableItem {
  id: string;
  name: string;
  elementalProperties: ElementalProperties;
  alchemicalProperties: AlchemicalProperties;
  baseScore?: number; // Optional base score from other recommendation logic
}

/**
 * Scored recommendation with personalization applied
 */
export interface PersonalizedRecommendation {
  id: string;
  name: string;
  baseScore: number;
  personalizedScore: number;
  personalizationBoost: number;
  reasons: string[];
  elementalProperties: ElementalProperties;
  alchemicalProperties: AlchemicalProperties;
}

/**
 * Personalized Recommendation Context
 */
export interface PersonalizationContext {
  natalChart: NatalChart;
  chartComparison?: ChartComparison;
  momentChart?: MomentChart;
  includeReasons?: boolean;
}

class PersonalizedRecommendationService {
  private chartComparisonCache: Map<string, ChartComparison> = new Map();
  private cacheExpiryMs = 5 * 60 * 1000; // 5 minutes

  /**
   * Get or calculate chart comparison for a user
   */
  private async getChartComparison(
    natalChart: NatalChart,
    momentChart?: MomentChart,
  ): Promise<ChartComparison> {
    const cacheKey = `${natalChart.calculatedAt}`;

    // Check cache
    const cached = this.chartComparisonCache.get(cacheKey);
    if (cached) {
      const cacheAge = Date.now() - new Date(cached.calculatedAt).getTime();
      if (cacheAge < this.cacheExpiryMs) {
        return cached;
      }
    }

    // Calculate fresh comparison
    const comparison = await compareCharts(natalChart, momentChart);

    // Cache it
    this.chartComparisonCache.set(cacheKey, comparison);

    // Clean old cache entries
    this.cleanCache();

    return comparison;
  }

  /**
   * Clean expired cache entries
   */
  private cleanCache(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.chartComparisonCache.forEach((value, key) => {
      const age = now - new Date(value.calculatedAt).getTime();
      if (age > this.cacheExpiryMs) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.chartComparisonCache.delete(key));
  }

  /**
   * Score a single item with personalization
   */
  async scoreItem(
    item: RecommendableItem,
    context: PersonalizationContext,
  ): Promise<PersonalizedRecommendation> {
    // Get or calculate chart comparison
    const chartComparison =
      context.chartComparison ||
      (await this.getChartComparison(context.natalChart, context.momentChart));

    // Get personalization boost
    const boost = getPersonalizationBoost(
      item.elementalProperties,
      item.alchemicalProperties,
      chartComparison,
    );

    // Calculate base score (default to 0.5 if not provided)
    const baseScore = item.baseScore !== undefined ? item.baseScore : 0.5;

    // Apply personalization boost
    const personalizedScore = baseScore * boost;

    // Generate reasons if requested
    const reasons: string[] = [];
    if (context.includeReasons) {
      reasons.push(...this.generateReasons(item, chartComparison, boost));
    }

    return {
      id: item.id,
      name: item.name,
      baseScore,
      personalizedScore,
      personalizationBoost: boost,
      reasons,
      elementalProperties: item.elementalProperties,
      alchemicalProperties: item.alchemicalProperties,
    };
  }

  /**
   * Score multiple items and sort by personalized score
   */
  async scoreItems(
    items: RecommendableItem[],
    context: PersonalizationContext,
  ): Promise<PersonalizedRecommendation[]> {
    // Get or calculate chart comparison once for all items
    const chartComparison =
      context.chartComparison ||
      (await this.getChartComparison(context.natalChart, context.momentChart));

    // Score all items
    const scoredItems = await Promise.all(
      items.map((item) =>
        this.scoreItem(item, { ...context, chartComparison }),
      ),
    );

    // Sort by personalized score (descending)
    scoredItems.sort((a, b) => b.personalizedScore - a.personalizedScore);

    _logger.info("Personalized recommendations scored", {
      itemCount: items.length,
      topScore: scoredItems[0]?.personalizedScore,
    } as any);

    return scoredItems;
  }

  /**
   * Get top N personalized recommendations
   */
  async getTopRecommendations(
    items: RecommendableItem[],
    context: PersonalizationContext,
    limit = 10,
  ): Promise<PersonalizedRecommendation[]> {
    const scoredItems = await this.scoreItems(items, context);
    return scoredItems.slice(0, limit);
  }

  /**
   * Generate explanation for why an item is recommended
   */
  private generateReasons(
    item: RecommendableItem,
    chartComparison: ChartComparison,
    boost: number,
  ): string[] {
    const reasons: string[] = [];

    // Overall harmony
    if (chartComparison.overallHarmony > 0.7) {
      reasons.push("Excellent cosmic alignment enhances this choice");
    } else if (chartComparison.overallHarmony > 0.5) {
      reasons.push("Good cosmic balance supports this selection");
    }

    // Elemental harmony
    const favorableElements = chartComparison.insights.favorableElements;
    const itemDominantElement = this.getDominantElement(
      item.elementalProperties,
    ) as Element;

    if (favorableElements.includes(itemDominantElement)) {
      reasons.push(
        `${itemDominantElement} element aligns with your favorable cosmic energies`,
      );
    }

    // Alchemical alignment
    if (chartComparison.alchemicalAlignment > 0.6) {
      const dominantAlchemical = this.getDominantAlchemical(
        item.alchemicalProperties,
      );
      reasons.push(
        `${dominantAlchemical} properties resonate with your current astrological phase`,
      );
    }

    // Personalization boost
    if (boost > 1.15) {
      reasons.push("Highly personalized match based on your natal chart");
    } else if (boost > 1.05) {
      reasons.push("Well-suited to your astrological profile");
    } else if (boost < 0.85) {
      reasons.push("Consider alternatives better aligned with your chart");
    }

    return reasons;
  }

  /**
   * Get dominant element from elemental properties
   */
  private getDominantElement(
    elemental: ElementalProperties,
  ): keyof ElementalProperties {
    const elements = Object.entries(elemental) as Array<
      [keyof ElementalProperties, number]
    >;
    elements.sort((a, b) => b[1] - a[1]);
    return elements[0][0];
  }

  /**
   * Get dominant alchemical property
   */
  private getDominantAlchemical(
    alchemical: AlchemicalProperties,
  ): keyof AlchemicalProperties {
    const properties = Object.entries(alchemical) as Array<
      [keyof AlchemicalProperties, number]
    >;
    properties.sort((a, b) => b[1] - a[1]);
    return properties[0][0];
  }

  /**
   * Calculate personalized compatibility score between user and item
   * Returns 0-1 score
   */
  async calculateCompatibility(
    item: RecommendableItem,
    natalChart: NatalChart,
  ): Promise<number> {
    const chartComparison = await this.getChartComparison(natalChart);

    const boost = getPersonalizationBoost(
      item.elementalProperties,
      item.alchemicalProperties,
      chartComparison,
    );

    // Normalize boost (0.7-1.3) to 0-1 compatibility score
    // 0.7 → 0, 1.0 → 0.5, 1.3 → 1.0
    const compatibility = (boost - 0.7) / 0.6;

    return Math.max(0, Math.min(1, compatibility));
  }

  /**
   * Get current moment chart (cached)
   */
  async getCurrentMomentChart(): Promise<MomentChart> {
    return await calculateMomentChart();
  }

  /**
   * Clear cache (useful for testing or manual refresh)
   */
  clearCache(): void {
    this.chartComparisonCache.clear();
    _logger.info("Personalization cache cleared");
  }
}

// Export singleton instance
export const personalizedRecommendationService =
  new PersonalizedRecommendationService();

export default personalizedRecommendationService;
