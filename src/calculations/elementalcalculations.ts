// Type imports
import { DEFAULT_ELEMENTAL_PROPERTIES } from '@/constants/elementalConstants';
import type { Season } from '@/types/alchemy';
import type { ElementalProperties } from '@/types/unified';

// Internal imports
import { createLogger } from '@/utils/logger';

// Logger
const logger = createLogger('ElementalCalculator');

/**
 * ElementalCalculator class for managing and calculating elemental state
 */
export class ElementalCalculator {
  private static instance: ElementalCalculator;
  private currentBalance: ElementalProperties = DEFAULT_ELEMENTAL_PROPERTIES;
  private initialized = false;

  private constructor() {}

  static getInstance(): ElementalCalculator {
    if (!ElementalCalculator.instance) {
      ElementalCalculator.instance = new ElementalCalculator();
    }
    return ElementalCalculator.instance;
  }

  static initialize(): void {
    const instance = ElementalCalculator.getInstance();
    instance.currentBalance = { ...DEFAULT_ELEMENTAL_PROPERTIES };
    instance.initialized = true;
  }

  static getCurrentBalance(): ElementalProperties {
    const instance = ElementalCalculator.getInstance();
    if (!instance.initialized) {
      ElementalCalculator.initialize();
    }
    return instance.currentBalance;
  }

  /**
   * Calculate the seasonal effectiveness of a recipe
   * @param recipe The recipe to evaluate
   * @param season The current season
   * @returns A score from 0-100 representing the effectiveness
   */
  static calculateSeasonalEffectiveness(recipe: unknown, season: string): number {
    try {
      const recipeData = recipe as any;
      if (!recipeData?.elementalProperties) {
        return 0;
      }

      const seasonalModifiers = this.getSeasonalModifiers(season as Season);
      let score = 0;

      // Calculate base seasonal alignment
      Object.entries(recipeData.elementalProperties).forEach(([element, value]) => {
        const modifier = seasonalModifiers[element as keyof ElementalProperties] || 0;
        score += (value as number) * modifier * 100;
      });

      // Apply seasonal bonuses/penalties
      if (recipeData.season) {
        const seasons = Array.isArray(recipeData.season) ? recipeData.season : [recipeData.season];

        if (seasons.map((s: string) => s.toLowerCase()).includes(season.toLowerCase())) {
          score += 20;
        }
      }

      return Math.max(0, Math.min(100, Math.round(score)));
    } catch (error) {
      logger.error('Error calculating seasonal effectiveness:', { error: error instanceof Error ? error.message : String(error) });
      return 0;
    }
  }

  /**
   * Get elemental modifiers for a specific season
   */
  static getSeasonalModifiers(season: Season): ElementalProperties {
    const baseModifiers = { ...DEFAULT_ELEMENTAL_PROPERTIES };

    // Normalize season to lowercase for consistency with type definition
    const seasonLower = season.toLowerCase() as Season;

    switch (seasonLower) {
      case 'spring':
        baseModifiers.Air = 0.4;
        baseModifiers.Fire = 0.3;
        baseModifiers.Water = 0.2;
        baseModifiers.Earth = 0.1;
        break;
      case 'summer':
        baseModifiers.Fire = 0.4;
        baseModifiers.Air = 0.3;
        baseModifiers.Earth = 0.2;
        baseModifiers.Water = 0.1;
        break;
      case 'autumn':
      case 'fall':
        baseModifiers.Earth = 0.4;
        baseModifiers.Air = 0.3;
        baseModifiers.Water = 0.2;
        baseModifiers.Fire = 0.1;
        break;
      case 'winter':
        baseModifiers.Water = 0.4;
        baseModifiers.Earth = 0.3;
        baseModifiers.Fire = 0.2;
        baseModifiers.Air = 0.1;
        break;
      case 'all':
        // Balanced for 'all' season
        baseModifiers.Fire = 0.25;
        baseModifiers.Water = 0.25;
        baseModifiers.Earth = 0.25;
        baseModifiers.Air = 0.25;
        break;
      default:
        // Balanced for unknown seasons
        baseModifiers.Fire = 0.25;
        baseModifiers.Water = 0.25;
        baseModifiers.Earth = 0.25;
        baseModifiers.Air = 0.25;
    }

    return baseModifiers;
  }

  /**
   * Calculate harmony score for given elemental properties
   * @param properties Elemental properties to evaluate
   * @returns Harmony score between 0 and 1
   */
  static calculateHarmony(properties: ElementalProperties): number {
    if (!properties) {
      return 0;
    }

    // Check if properties are balanced
    const values = Object.values(properties);
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;

    // Calculate variance from the ideal (perfect balance would be 0 variance)
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / values.length;

    // Convert variance to harmony score (0-1)
    return Math.max(0, Math.min(1, 1 - Math.sqrt(variance)));
  }

  /**
   * Calculate elemental state based on provided properties and conditions
   * @param baseProperties Base elemental properties
   * @param phase Optional phase/condition
   * @param time Optional time factor
   * @returns Enhanced elemental properties with additional information
   */
  calculateElementalState(
    baseProperties: ElementalProperties,
    phase = 'default',
    time = 'neutral'
  ): {
    properties: ElementalProperties;
    seasonalInfluence: ElementalProperties;
  } {
    try {
      // Start with the base properties
      const properties = { ...baseProperties };

      // Create default seasonal influence
      const seasonalInfluence: ElementalProperties = {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25
      };

      // Apply time-based modifiers
      if (time === 'day') {
        properties.Fire = Math.min(1, properties.Fire * 1.1);
        properties.Air = Math.min(1, properties.Air * 1.05);
        properties.Water = Math.max(0, properties.Water * 0.95);
        properties.Earth = Math.max(0, properties.Earth * 0.95);
      } else if (time === 'night') {
        properties.Water = Math.min(1, properties.Water * 1.1);
        properties.Earth = Math.min(1, properties.Earth * 1.05);
        properties.Fire = Math.max(0, properties.Fire * 0.95);
        properties.Air = Math.max(0, properties.Air * 0.95);
      }

      return {
        properties,
        seasonalInfluence
      };
    } catch (error) {
      logger.error('Error calculating elemental state:', { error: error instanceof Error ? error.message : String(error) });
      return {
        properties: DEFAULT_ELEMENTAL_PROPERTIES,
        seasonalInfluence: DEFAULT_ELEMENTAL_PROPERTIES
      };
    }
  }

  /**
   * Update the current elemental balance
   */
  updateBalance(newBalance: ElementalProperties): void {
    this.currentBalance = { ...newBalance };
    this.initialized = true;
  }

  /**
   * Reset elemental balance to defaults
   */
  resetBalance(): void {
    this.currentBalance = { ...DEFAULT_ELEMENTAL_PROPERTIES };
  }
}

/**
 * Utility functions for elemental calculations
 */

/**
 * Combine two elemental property sets
 */
export function combineElementalProperties(
  primary: ElementalProperties,
  secondary: ElementalProperties,
  weight = 0.5
): ElementalProperties {
  return {
    Fire: primary.Fire * weight + secondary.Fire * (1 - weight),
    Water: primary.Water * weight + secondary.Water * (1 - weight),
    Earth: primary.Earth * weight + secondary.Earth * (1 - weight),
    Air: primary.Air * weight + secondary.Air * (1 - weight)
  };
}

/**
 * Get elemental ranking from properties
 */
export function getElementRanking(properties: Record<string, number>): Record<number, string> {
  const entries = Object.entries(properties).sort(([, a], [, b]) => b - a);
  const ranking: Record<number, string> = {};

  entries.forEach(([element, value], index) => {
    ranking[index + 1] = element;
  });

  return ranking;
}

/**
 * Get absolute elemental value
 */
export function getAbsoluteElementValue(properties: Record<string, number>): number {
  return Object.values(properties).reduce((sum, val) => sum + Math.abs(val), 0);
}
