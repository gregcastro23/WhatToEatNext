import type {
  ElementalProperties,
  PlanetaryPosition
} from '@/types/alchemy';
import { logger } from '@/utils/logger';

// Import the core alchemical functionality
import { alchemize } from './RealAlchemizeService';
import type {
  PlanetaryPosition as RealAlchemizePlanetaryPosition,
  StandardizedAlchemicalResult
} from './RealAlchemizeService';

/**
 * Consolidated Alchemical Service
 *
 * A unified service for all alchemical operations that wraps the core
 * RealAlchemizeService and provides additional alchemical functionality.
 * This service handles elemental calculations, thermodynamic analysis,
 * and alchemical transformations.
 */
export class AlchemicalService {
  private static instance: AlchemicalService;

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    // Private constructor
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): AlchemicalService {
    if (!AlchemicalService.instance) {
      AlchemicalService.instance = new AlchemicalService();
    }
    return AlchemicalService.instance;
  }

  /**
   * Calculate alchemical properties for planetary positions
   */
  async calculateAlchemicalProperties(
    planetaryPositions: Record<string, PlanetaryPosition>
  ): Promise<StandardizedAlchemicalResult> {
    try {
      logger.info('Calculating alchemical properties for planetary positions');

      // Convert PlanetaryPosition format to RealAlchemizeService format
      const convertedPositions: Record<string, RealAlchemizePlanetaryPosition> = {};

      for (const [planet, position] of Object.entries(planetaryPositions)) {
        convertedPositions[planet] = {
          sign: position.sign,
          degree: position.degree,
          minute: position.minute || 0,
          isRetrograde: position.isRetrograde || false
        };
      }

      const result = alchemize(convertedPositions);
      logger.info('Alchemical calculation completed');

      return result;
    } catch (error) {
      logger.error('Error calculating alchemical properties:', error);
      throw new Error('Failed to calculate alchemical properties');
    }
  }

  /**
   * Calculate alchemical properties for current moment
   */
  async calculateCurrentAlchemicalProperties(
    location?: { latitude: number; longitude: number },
    zodiacSystem: 'tropical' | 'sidereal' = 'tropical'
  ): Promise<StandardizedAlchemicalResult> {
    try {
      logger.info('Calculating current alchemical properties');

      // Import astrologizeApi to get current positions
      const { getCurrentPlanetaryPositions } = await import('./astrologizeApi');

      const defaultLocation = { latitude: 40.7498, longitude: -73.7976 }; // NYC
      const planetaryPositions = await getCurrentPlanetaryPositions(
        location || defaultLocation,
        zodiacSystem
      );

      return await this.calculateAlchemicalProperties(planetaryPositions);
    } catch (error) {
      logger.error('Error calculating current alchemical properties:', error);
      throw new Error('Failed to calculate current alchemical properties');
    }
  }

  /**
   * Calculate alchemical properties for specific date/time
   */
  async calculateAlchemicalPropertiesForDateTime(
    date: Date,
    location?: { latitude: number; longitude: number },
    zodiacSystem: 'tropical' | 'sidereal' = 'tropical'
  ): Promise<StandardizedAlchemicalResult> {
    try {
      logger.info('Calculating alchemical properties for specific date/time:', date);

      // Import astrologizeApi to get positions for date/time
      const { getPlanetaryPositionsForDateTime } = await import('./astrologizeApi');

      const defaultLocation = { latitude: 40.7498, longitude: -73.7976 }; // NYC
      const planetaryPositions = await getPlanetaryPositionsForDateTime(
        date,
        location || defaultLocation,
        zodiacSystem
      );

      return await this.calculateAlchemicalProperties(planetaryPositions);
    } catch (error) {
      logger.error('Error calculating alchemical properties for date/time:', error);
      throw new Error('Failed to calculate alchemical properties for date/time');
    }
  }

  /**
   * Calculate elemental compatibility between two property sets
   */
  calculateElementalCompatibility(
    properties1: ElementalProperties,
    properties2: ElementalProperties
  ): number {
    // Elements work best when they complement each other
    // Same elements reinforce, different elements harmonize
    const elements = ['Fire', 'Water', 'Earth', 'Air'] as const;

    let totalCompatibility = 0;
    let elementCount = 0;

    for (const element of elements) {
      const val1 = properties1[element] || 0;
      const val2 = properties2[element] || 0;

      if (val1 > 0 && val2 > 0) {
        // Same element reinforcement (like strengthens like)
        totalCompatibility += Math.min(val1, val2);
        elementCount++;
      }
    }

    // Return average compatibility or minimum score
    return elementCount > 0 ? totalCompatibility / elementCount : 0.5;
  }

  /**
   * Get complementary elemental properties
   */
  getComplementaryElementalProperties(
    currentProperties: ElementalProperties
  ): ElementalProperties {
    // Elements complement themselves most strongly
    // Return the same properties as the most complementary
    return { ...currentProperties };
  }

  /**
   * Calculate thermodynamic properties from elemental properties
   */
  calculateThermodynamicProperties(
    elementalProperties: ElementalProperties
  ): ThermodynamicMetrics {
    const { Fire = 0, Water = 0, Earth = 0, Air = 0 } = elementalProperties;

    // Heat: Fire + Air (active elements)
    const heat = (Fire + Air) / 2;

    // Entropy: Air + Fire (chaotic elements)
    const entropy = (Air + Fire) / 2;

    // Reactivity: Fire + Water (opposing elements create reactivity)
    const reactivity = Math.abs(Fire - Water) / 2;

    // Greg's Energy: Balance between heat and entropy
    const gregsEnergy = heat - entropy * reactivity;

    return {
      heat,
      entropy,
      reactivity,
      gregsEnergy,
      kalchm: 0, // Would need full alchemical calculation
      monica: 0   // Would need full alchemical calculation
    };
  }

  /**
   * Analyze alchemical harmony of a recipe or ingredient combination
   */
  analyzeAlchemicalHarmony(
    elementalProperties: ElementalProperties[]
  ): {
    overallHarmony: number;
    dominantElement: string;
    elementalBalance: ElementalProperties;
    recommendations: string[];
  } {
    if (elementalProperties.length === 0) {
      return {
        overallHarmony: 0,
        dominantElement: 'None',
        elementalBalance: { Fire: 0, Water: 0, Earth: 0, Air: 0 },
        recommendations: ['Add ingredients with elemental properties']
      };
    }

    // Calculate average elemental properties
    const averageProperties: ElementalProperties = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    const elements = ['Fire', 'Water', 'Earth', 'Air'] as const;

    for (const properties of elementalProperties) {
      for (const element of elements) {
        averageProperties[element] += properties[element] || 0;
      }
    }

    for (const element of elements) {
      averageProperties[element] /= elementalProperties.length;
    }

    // Find dominant element
    let dominantElement = 'Fire';
    let maxValue = 0;

    for (const element of elements) {
      if (averageProperties[element] > maxValue) {
        maxValue = averageProperties[element];
        dominantElement = element;
      }
    }

    // Calculate overall harmony (balance between elements)
    const values = Object.values(averageProperties);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
    const overallHarmony = Math.max(0, 1 - variance); // Lower variance = higher harmony

    // Generate recommendations
    const recommendations: string[] = [];

    if (overallHarmony < 0.5) {
      recommendations.push('Consider adding ingredients that balance elemental properties');
    }

    const lowElements = elements.filter(el => averageProperties[el] < 0.2);
    if (lowElements.length > 0) {
      recommendations.push(`Add ingredients with ${lowElements.join(' or ')} properties`);
    }

    return {
      overallHarmony,
      dominantElement,
      elementalBalance: averageProperties,
      recommendations
    };
  }

  /**
   * Transform elemental properties through cooking methods
   */
  transformElementalProperties(
    baseProperties: ElementalProperties,
    cookingMethod: string,
    intensity: 'low' | 'medium' | 'high' = 'medium'
  ): ElementalProperties {
    // Simplified cooking method transformations
    // In a full implementation, this would use the 14 alchemical pillars
    const transformations: Record<string, Record<string, (val: number) => number>> = {
      grilling: {
        Fire: (val) => Math.min(1, val + 0.2),
        Water: (val) => Math.max(0, val - 0.1),
        Earth: (val) => val,
        Air: (val) => Math.min(1, val + 0.1)
      },
      boiling: {
        Fire: (val) => Math.max(0, val - 0.1),
        Water: (val) => Math.min(1, val + 0.2),
        Earth: (val) => val,
        Air: (val) => Math.max(0, val - 0.1)
      },
      baking: {
        Fire: (val) => Math.min(1, val + 0.15),
        Water: (val) => Math.max(0, val - 0.05),
        Earth: (val) => Math.min(1, val + 0.1),
        Air: (val) => val
      },
      steaming: {
        Water: (val) => Math.min(1, val + 0.15),
        Fire: (val) => Math.max(0, val - 0.1),
        Earth: (val) => val,
        Air: (val) => Math.min(1, val + 0.05)
      }
    };

    const methodKey = cookingMethod.toLowerCase();
    const transform = transformations[methodKey];

    if (!transform) {
      // No transformation for this cooking method
      return { ...baseProperties };
    }

    const result: ElementalProperties = { Fire: 0, Water: 0, Earth: 0, Air: 0 };

    for (const element of ['Fire', 'Water', 'Earth', 'Air'] as const) {
      const baseValue = baseProperties[element] || 0;
      result[element] = transform[element](baseValue) ?? baseValue;
    }

    // Apply intensity modifier
    const intensityMultiplier = { low: 0.5, medium: 1, high: 1.5 }[intensity] || 1;

    for (const element of ['Fire', 'Water', 'Earth', 'Air'] as const) {
      const change = result[element] - (baseProperties[element] || 0);
      result[element] = baseProperties[element]! + (change * intensityMultiplier);
      result[element] = Math.max(0, Math.min(1, result[element]));
    }

    return result;
  }

  /**
   * Get alchemical insights for current astrological conditions
   */
  async getAlchemicalInsights(
    planetaryPositions?: Record<string, PlanetaryPosition>
  ): Promise<{
    dominantElements: string[];
    recommendedActions: string[];
    energeticQualities: string[];
    transformativeOpportunities: string[];
  }> {
    try {
      let alchemicalResult: StandardizedAlchemicalResult;

      if (planetaryPositions) {
        alchemicalResult = await this.calculateAlchemicalProperties(planetaryPositions);
      } else {
        alchemicalResult = await this.calculateCurrentAlchemicalProperties();
      }

      const { elementalProperties } = alchemicalResult;

      // Determine dominant elements
      const elements = ['Fire', 'Water', 'Earth', 'Air'] as const;
      const dominantElements = elements
        .filter(el => (elementalProperties[el] || 0) > 0.3)
        .sort((a, b) => (elementalProperties[b] || 0) - (elementalProperties[a] || 0));

      // Generate insights based on dominant elements
      const recommendedActions: string[] = [];
      const energeticQualities: string[] = [];
      const transformativeOpportunities: string[] = [];

      if (dominantElements.includes('Fire')) {
        recommendedActions.push('Grill, roast, or bake ingredients');
        energeticQualities.push('Passionate, transformative energy');
        transformativeOpportunities.push('Focus on bold, decisive actions in cooking');
      }

      if (dominantElements.includes('Water')) {
        recommendedActions.push('Steam, boil, or poach ingredients');
        energeticQualities.push('Fluid, adaptable energy');
        transformativeOpportunities.push('Embrace gentle, nurturing cooking techniques');
      }

      if (dominantElements.includes('Earth')) {
        recommendedActions.push('Slow-cook, stew, or ferment ingredients');
        energeticQualities.push('Grounded, stable energy');
        transformativeOpportunities.push('Build complex flavors through patient cooking');
      }

      if (dominantElements.includes('Air')) {
        recommendedActions.push('Stir-fry, sauté, or use light cooking methods');
        energeticQualities.push('Light, communicative energy');
        transformativeOpportunities.push('Experiment with fresh, vibrant ingredient combinations');
      }

      return {
        dominantElements,
        recommendedActions,
        energeticQualities,
        transformativeOpportunities
      };
    } catch (error) {
      logger.error('Error getting alchemical insights:', error);
      return {
        dominantElements: [],
        recommendedActions: ['Follow your culinary intuition'],
        energeticQualities: ['Balanced cosmic energy'],
        transformativeOpportunities: ['Explore mindful cooking practices']
      };
    }
  }
}

// Export singleton instance
export const alchemicalService = AlchemicalService.getInstance();
