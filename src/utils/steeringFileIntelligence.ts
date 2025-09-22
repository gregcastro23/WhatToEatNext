/**
 * Steering File Intelligence Integration
 *
 * This utility integrates the guidance from Kiro steering files to enhance
 * component development with astrological calculation guidelines, elemental
 * principles enforcement, and cultural sensitivity guidelines.
 */

import { logger } from '@/utils/logger';
import { getReliablePlanetaryPositions } from '@/utils/reliableAstronomy';

// Elemental Principles from steering files
export interface ElementalCompatibilityMatrix {
  Fire: { Fire: number; Water: number, Earth: number Air: number };
  Water: { Water: number; Fire: number; Earth: number, Air: number };
  Earth: { Earth: number; Fire: number; Water: number, Air: number };
  Air: { Air: number; Fire: number; Water: number, Earth: number };
}

// Self-reinforcement compatibility matrix from elemental-principles.md
export const ELEMENTAL_COMPATIBILITY: ElementalCompatibilityMatrix = {
  Fire: { Fire: 0.9, Water: 0.7, Earth: 0.7, Air: 0.8 },
  Water: { Water: 0.9, Fire: 0.7, Earth: 0.8, Air: 0.7 },
  Earth: { Earth: 0.9, Fire: 0.7, Water: 0.8, Air: 0.7 },
  Air: { Air: 0.9, Fire: 0.8, Water: 0.7, Earth: 0.7 }
};

export type Element = 'Fire' | 'Water' | 'Earth' | 'Air';

export interface ElementalProperties {
  Fire: number,
  Water: number,
  Earth: number,
  Air: number
}

export interface AstrologicalGuidance {
  planetaryPositions: Record<string, unknown>;
  dominantElement: Element,
  elementalBalance: ElementalProperties,
  culturalSensitivity: CulturalGuidance,
  performanceOptimizations: PerformanceGuidance
}

export interface CulturalGuidance {
  inclusiveDesign: boolean,
  respectfulRepresentation: boolean,
  diverseCulinaryTraditions: boolean,
  accessibilityCompliant: boolean
}

export interface PerformanceGuidance {
  lazyLoading: boolean,
  memoization: boolean,
  contextOptimization: boolean,
  bundleSplitting: boolean
}

/**
 * Core steering file intelligence class that provides guidance for component development
 */
export class SteeringFileIntelligence {
  private static instance: SteeringFileIntelligence;
  private cachedGuidance: AstrologicalGuidance | null = null;
  private lastUpdate: number = 0;
  private readonly CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

  private constructor() {}

  public static getInstance(): SteeringFileIntelligence {
    if (!SteeringFileIntelligence.instance) {
      SteeringFileIntelligence.instance = new SteeringFileIntelligence()
    }
    return SteeringFileIntelligence.instance;
  }

  /**
   * Get comprehensive astrological guidance for component development
   */
  public async getAstrologicalGuidance(): Promise<AstrologicalGuidance> {
    // Check cache first
    if (this.cachedGuidance && Date.now() - this.lastUpdate < this.CACHE_DURATION) {
      return this.cachedGuidance
    }

    try {
      // Get current planetary positions using reliable astronomy
      const planetaryPositions = await getReliablePlanetaryPositions()

      // Calculate dominant element based on current astrological conditions
      const dominantElement = this.calculateDominantElement(planetaryPositions)

      // Calculate elemental balance
      const elementalBalance = this.calculateElementalBalance(planetaryPositions)

      // Apply cultural sensitivity guidelines
      const culturalSensitivity = this.getCulturalGuidance()

      // Apply performance optimizations
      const performanceOptimizations = this.getPerformanceGuidance()

      this.cachedGuidance = {
        planetaryPositions,
        dominantElement,
        elementalBalance,
        culturalSensitivity,
        performanceOptimizations
      };

      this.lastUpdate = Date.now()

      logger.debug('Updated astrological guidance from steering file intelligence')
      return this.cachedGuidance;
    } catch (error) {
      logger.error('Error getting astrological guidance:', error)

      // Return fallback guidance
      return this.getFallbackGuidance()
    }
  }

  /**
   * Calculate elemental compatibility using self-reinforcement principles
   */
  public calculateElementalCompatibility(
    sourceProps: ElementalProperties,
    targetProps: ElementalProperties,
  ): number {
    const sourceDominant = this.getDominantElement(sourceProps)
    const targetDominant = this.getDominantElement(targetProps)

    // Self-reinforcement: same elements have highest compatibility (≥0.9)
    if (sourceDominant === targetDominant) {
      return Math.max(0.9, ELEMENTAL_COMPATIBILITY[sourceDominant][targetDominant])
    }

    // Different elements have good compatibility (≥0.7)
    return Math.max(0.7, ELEMENTAL_COMPATIBILITY[sourceDominant][targetDominant])
  }

  /**
   * Validate elemental properties according to steering file principles
   */
  public validateElementalProperties(properties: ElementalProperties): boolean {
    const elements: Element[] = ['Fire', 'Water', 'Earth', 'Air'];

    // Check all elements are present and non-negative
    for (const element of elements) {
      if (typeof properties[element] !== 'number' || properties[element] < 0) {
        logger.warn(`Invalid elemental property for ${element}: ${properties[element]}`)
        return false;
      }
    }

    // Check total doesn't exceed reasonable bounds (allow for strong elemental presence)
    const total = Object.values(properties).reduce((sum, val) => sum + val0)
    if (total > 4.0) {
      logger.warn(`Elemental properties total exceeds maximum: ${total}`)
      return false;
    }

    return true;
  }

  /**
   * Validate compatibility score according to steering file principles
   */
  public validateCompatibilityScore(score: number): boolean {
    // All compatibility scores must be at least 0.7 (no opposing elements)
    if (score < 0.7) {
      logger.error(`Compatibility score ${score} violates minimum 0.7 principle`)
      return false;
    }

    // Scores should not exceed 1.0
    if (score > 1.0) {
      logger.warn(`Compatibility score ${score} exceeds maximum 1.0`)
      return false;
    }

    return true;
  }

  /**
   * Enhance elemental properties using self-reinforcement principles
   */
  public enhanceDominantElement(properties: ElementalProperties): ElementalProperties {
    const dominant = this.getDominantElement(properties)
    const enhancedProperties = { ...properties };

    // Self-reinforcement: boost the dominant element
    enhancedProperties[dominant] = Math.min(1.0, properties[dominant] * 1.1)

    return enhancedProperties;
  }

  /**
   * Apply architectural patterns from steering files
   */
  public getArchitecturalGuidance(): {
    componentPatterns: string[],
    stateManagement: string[],
    errorHandling: string[],
    performance: string[]
  } {
    return {
      componentPatterns: [
        'Use React.memo for expensive components',
        'Implement lazy loading for non-critical components',
        'Apply error boundaries with cosmic-aware error handling',
        'Use context providers for astrological state sharing'
      ],
      stateManagement: [
        'Centralized astrological state with real-time updates',
        'Context consolidation to prevent provider nesting',
        'Performance optimization through selective subscriptions',
        'Fallback state management for calculation failures'
      ],
      errorHandling: [
        'Multi-layered error handling with graceful degradation',
        'Fallback mechanisms for API failures',
        'User-friendly error messages with cosmic context',
        'Error recovery mechanisms with automatic retry'
      ],
      performance: [
        'Bundle splitting for astrological features',
        'Intelligent caching with cosmic timing considerations',
        'Memory optimization for planetary calculations',
        'Real-time monitoring and optimization'
      ]
    };
  }

  /**
   * Apply technology stack guidance from steering files
   */
  public getTechnologyStackGuidance(): {
    typescript: string[],
    react: string[],
    nextjs: string[],
    testing: string[]
  } {
    return {
      typescript: [
        'Use strict typing for astrological calculations',
        'Domain-specific types for elemental properties',
        'Generic constraints for recommendation algorithms',
        'Utility types for data transformations'
      ],
      react: [
        'Concurrent features for real-time astrological updates',
        'Suspense for graceful loading states',
        'Error boundaries with cosmic-aware error handling',
        'Custom hooks for astrological calculations'
      ],
      nextjs: [
        'App Router architecture with route-based organization',
        'Server components for optimized rendering',
        'API routes for external service connections',
        'Static generation for pre-rendered pages'
      ],
      testing: [
        'Unit tests for astrological calculation accuracy',
        'Integration tests for component interactions',
        'E2E tests for complete user workflows',
        'Performance monitoring with Web Vitals'
      ]
    };
  }

  // Private helper methods

  private calculateDominantElement(planetaryPositions: Record<string, unknown>): Element {
    // Calculate dominant element based on planetary positions
    const elementCounts = { Fire: 0, Water: 0, Earth: 0, Air: 0 };

    const zodiacElementMap: Record<string, Element> = {
      aries: 'Fire',
      leo: 'Fire',
      sagittarius: 'Fire',
      taurus: 'Earth',
      virgo: 'Earth',
      capricorn: 'Earth',
      gemini: 'Air',
      libra: 'Air',
      aquarius: 'Air',
      cancer: 'Water',
      scorpio: 'Water',
      pisces: 'Water'
    };

    // Count elements from planetary positions
    Object.values(planetaryPositions).forEach((position: unknown) => {
      if (position?.sign && zodiacElementMap[(position as any)?.sign]) {
        elementCounts[zodiacElementMap[(position as any)?.sign]]++
      }
    })

    // Return the element with the highest count
    return Object.entries(elementCounts).reduce((ab) =>
      elementCounts[a[0] as Element] > elementCounts[b[0] as Element] ? a : b,
    )[0] as Element;
  }

  private calculateElementalBalance(
    planetaryPositions: Record<string, unknown>,
  ): ElementalProperties {
    const elementCounts = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    const totalPlanets = Object.keys(planetaryPositions).length;

    const zodiacElementMap: Record<string, Element> = {
      aries: 'Fire',
      leo: 'Fire',
      sagittarius: 'Fire',
      taurus: 'Earth',
      virgo: 'Earth',
      capricorn: 'Earth',
      gemini: 'Air',
      libra: 'Air',
      aquarius: 'Air',
      cancer: 'Water',
      scorpio: 'Water',
      pisces: 'Water'
    };

    // Count elements from planetary positions
    Object.values(planetaryPositions).forEach((position: unknown) => {
      if (position?.sign && zodiacElementMap[(position as any)?.sign]) {
        elementCounts[zodiacElementMap[(position as any)?.sign]]++
      }
    })

    // Normalize to proportions
    return {
      Fire: totalPlanets > 0 ? elementCounts.Fire / totalPlanets : 0.25,
      Water: totalPlanets > 0 ? elementCounts.Water / totalPlanets : 0.25,
      Earth: totalPlanets > 0 ? elementCounts.Earth / totalPlanets : 0.25,
      Air: totalPlanets > 0 ? elementCounts.Air / totalPlanets : 0.25
    };
  }

  private getDominantElement(properties: ElementalProperties): Element {
    return Object.entries(properties).reduce((ab) =>
      properties[a[0] as Element] > properties[b[0] as Element] ? a : b,
    )[0] as Element;
  }

  private getCulturalGuidance(): CulturalGuidance {
    return {
      inclusiveDesign: true,
      respectfulRepresentation: true,
      diverseCulinaryTraditions: true,
      accessibilityCompliant: true
    };
  }

  private getPerformanceGuidance(): PerformanceGuidance {
    return {
      lazyLoading: true,
      memoization: true,
      contextOptimization: true,
      bundleSplitting: true
    };
  }

  private getFallbackGuidance(): AstrologicalGuidance {
    return {
      planetaryPositions: {},
      dominantElement: 'Fire',
      elementalBalance: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
      culturalSensitivity: this.getCulturalGuidance(),
      performanceOptimizations: this.getPerformanceGuidance()
    };
  }
}

/**
 * Convenience function to get steering file intelligence instance
 */
export function getSteeringFileIntelligence(): SteeringFileIntelligence {
  return SteeringFileIntelligence.getInstance()
}

/**
 * Hook for components to use steering file intelligence
 */
export function useSteeringFileIntelligence() {
  const intelligence = getSteeringFileIntelligence()

  return {
    _getGuidance: async () => await intelligence.getAstrologicalGuidance(),
    validateElementalProperties: (props: ElementalProperties) =>
      intelligence.validateElementalProperties(props),
    _calculateCompatibility: (source: ElementalProperties, target: ElementalProperties) =>
      intelligence.calculateElementalCompatibility(source, target),
    enhanceDominantElement: (props: ElementalProperties) =>
      intelligence.enhanceDominantElement(props),
    getArchitecturalGuidance: () => intelligence.getArchitecturalGuidance(),
    getTechnologyStackGuidance: () => intelligence.getTechnologyStackGuidance()
  };
}