/**
 * Automated Quality Assurance Integration
 * 
 * This module implements automated quality assurance with agent hooks for:
 * - Automatic planetary data validation
 * - Ingredient consistency checking for elemental properties
 * - TypeScript campaign triggers for error threshold management
 * - Build quality monitoring for performance tracking
 */

import { calculateElementalAffinity } from '@/utils/elementalUtils';
import { logger } from '@/utils/logger';
import { getReliablePlanetaryPositions } from '@/utils/reliableAstronomy';
import { ElementalProperties, getSteeringFileIntelligence } from '@/utils/steeringFileIntelligence';

// Quality assurance thresholds from campaign-integration.md
export const QA_THRESHOLDS = {
  typescript: {
    criticalThreshold: 100,
    warningThreshold: 500,
    target: 0
  },
  linting: {
    criticalThreshold: 1000,
    warningThreshold: 2000,
    target: 0
  },
  performance: {
    renderTime: 16, // 60fps target
    memoryUsage: 50, // MB
    bundleSize: 250, // KB
    apiResponseTime: 2000 // 2 seconds
  },
  planetaryData: {
    positionAccuracy: 0.1, // degrees
    cacheValidityHours: 6,
    fallbackThresholdMs: 5000
  }
} as const;

export interface QualityMetrics {
  typeScriptErrors: number;
  lintingWarnings: number;
  performanceMetrics: {
    renderTime: number;
    memoryUsage: number;
    bundleSize: number;
    apiResponseTime: number;
  };
  planetaryDataQuality: {
    accuracy: number;
    freshness: number;
    reliability: number;
  };
  ingredientConsistency: {
    elementalValidation: number;
    compatibilityScores: number;
    culturalSensitivity: number;
  };
}

export interface QualityAssuranceConfig {
  enableAutomaticValidation: boolean;
  enableCampaignTriggers: boolean;
  enablePerformanceMonitoring: boolean;
  enablePlanetaryDataValidation: boolean;
  enableIngredientConsistencyChecking: boolean;
  thresholds: typeof QA_THRESHOLDS;
}

export interface ValidationResult {
  isValid: boolean;
  score: number;
  issues: string[];
  recommendations: string[];
  timestamp: number;
}

export interface CampaignTrigger {
  type: 'typescript' | 'linting' | 'performance' | 'planetary' | 'ingredient';
  threshold: number;
  currentValue: number;
  action: 'monitor' | 'warn' | 'campaign' | 'emergency';
  triggered: boolean;
  timestamp: number;
}

/**
 * Automated Quality Assurance System
 */
export class AutomatedQualityAssurance {
  private static instance: AutomatedQualityAssurance;
  private config: QualityAssuranceConfig;
  private metrics: QualityMetrics;
  private lastValidation: number = 0;
  private validationInterval: NodeJS.Timeout | null = null;
  private campaignTriggers: CampaignTrigger[] = [];

  private constructor(config?: Partial<QualityAssuranceConfig>) {
    this.config = {
      enableAutomaticValidation: true,
      enableCampaignTriggers: true,
      enablePerformanceMonitoring: true,
      enablePlanetaryDataValidation: true,
      enableIngredientConsistencyChecking: true,
      thresholds: QA_THRESHOLDS,
      ...config
    };

    this.metrics = this.initializeMetrics();
    this.startAutomaticValidation();
  }

  public static getInstance(config?: Partial<QualityAssuranceConfig>): AutomatedQualityAssurance {
    if (!AutomatedQualityAssurance.instance) {
      AutomatedQualityAssurance.instance = new AutomatedQualityAssurance(config);
    }
    return AutomatedQualityAssurance.instance;
  }

  /**
   * Agent hook for automatic planetary data validation
   */
  public async validatePlanetaryData(date: Date = new Date()): Promise<ValidationResult> {
    if (!this.config.enablePlanetaryDataValidation) {
      return this.createValidationResult(true, 1.0, [], []);
    }

    try {
      const startTime = performance.now();
      const positions = await getReliablePlanetaryPositions(date);
      const responseTime = performance.now() - startTime;

      const issues: string[] = [];
      const recommendations: string[] = [];
      let score = 1.0;

      // Validate response time
      if (responseTime > this.config.thresholds.planetaryData.fallbackThresholdMs) {
        issues.push(`Planetary data fetch time (${responseTime.toFixed(0)}ms) exceeds threshold`);
        recommendations.push('Consider implementing more aggressive caching');
        score -= 0.2;
      }

      // Validate data completeness
      const requiredPlanets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
      const missingPlanets = requiredPlanets.filter(planet => !positions[planet]);
      
      if (missingPlanets.length > 0) {
        issues.push(`Missing planetary data for: ${missingPlanets.join(', ')}`);
        recommendations.push('Verify API connectivity and fallback mechanisms');
        score -= 0.1 * missingPlanets.length;
      }

      // Validate position accuracy (check for reasonable longitude values)
      Object.entries(positions).forEach(([planet, data]: [string, any]) => {
        if (data?.exactLongitude !== undefined) {
          if (data.exactLongitude < 0 || data.exactLongitude >= 360) {
            issues.push(`Invalid longitude for ${planet}: ${data.exactLongitude}`);
            score -= 0.1;
          }
        }
      });

      // Update metrics
      this.metrics.planetaryDataQuality = {
        accuracy: Math.max(0, score),
        freshness: this.calculateDataFreshness(positions),
        reliability: issues.length === 0 ? 1.0 : Math.max(0, 1.0 - (issues.length * 0.1))
      };

      // Check for campaign triggers
      this.checkCampaignTriggers('planetary', score);

      logger.debug('Planetary data validation completed', { score, issues: issues.length });
      return this.createValidationResult(score >= 0.8, score, issues, recommendations);

    } catch (error) {
      logger.error('Error validating planetary data:', error);
      return this.createValidationResult(false, 0, ['Planetary data validation failed'], ['Check API connectivity and error handling']);
    }
  }

  /**
   * Agent hook for ingredient consistency checking
   */
  public validateIngredientConsistency(ingredients: Array<{
    name: string;
    elementalProperties: ElementalProperties;
    category?: string;
  }>): ValidationResult {
    if (!this.config.enableIngredientConsistencyChecking) {
      return this.createValidationResult(true, 1.0, [], []);
    }

    const intelligence = getSteeringFileIntelligence();
    const issues: string[] = [];
    const recommendations: string[] = [];
    let totalScore = 0;
    let validatedCount = 0;

    ingredients.forEach((ingredient, index) => {
      // Validate elemental properties structure
      const isValidStructure = intelligence.validateElementalProperties(ingredient.elementalProperties);
      if (!isValidStructure) {
        issues.push(`Invalid elemental properties for ingredient: ${ingredient.name}`);
        recommendations.push(`Fix elemental properties for ${ingredient.name} to meet minimum standards`);
      } else {
        validatedCount++;
        
        // Calculate elemental consistency score
        const elementalSum = Object.values(ingredient.elementalProperties).reduce((sum, val) => sum + val, 0);
        const consistencyScore = elementalSum > 0 ? Math.min(1.0, elementalSum / 1.0) : 0;
        totalScore += consistencyScore;

        // Check for elemental balance (no single element should dominate too much)
        const maxElement = Math.max(...Object.values(ingredient.elementalProperties));
        if (maxElement > 0.8) {
          recommendations.push(`Consider balancing elemental properties for ${ingredient.name} (max: ${maxElement.toFixed(2)})`);
        }
      }

      // Validate compatibility with other ingredients
      if (index > 0) {
        const prevIngredient = ingredients[index - 1];
        // Use calculateElementalCompatibility directly
        const compatibility = calculateElementalAffinity(
          ingredient.elementalProperties as any,
          prevIngredient.elementalProperties as any
        );

        if (compatibility < 0.7) {
          issues.push(`Low compatibility between ${ingredient.name} and ${prevIngredient.name}: ${compatibility.toFixed(2)}`);
          recommendations.push('Consider adjusting elemental properties to improve compatibility');
        }
      }
    });

    const averageScore = validatedCount > 0 ? totalScore / validatedCount : 0;
    
    // Update metrics
    this.metrics.ingredientConsistency = {
      elementalValidation: averageScore,
      compatibilityScores: issues.filter(issue => issue.includes('compatibility')).length === 0 ? 1.0 : 0.7,
      culturalSensitivity: this.validateCulturalSensitivity(ingredients.map(i => i.name))
    };

    // Check for campaign triggers
    this.checkCampaignTriggers('ingredient', averageScore);

    logger.debug('Ingredient consistency validation completed', { 
      score: averageScore, 
      issues: issues.length,
      validatedCount 
    });

    return this.createValidationResult(averageScore >= 0.8, averageScore, issues, recommendations);
  }

  /**
   * TypeScript campaign trigger for error threshold management
   */
  public async checkTypeScriptErrorThreshold(): Promise<CampaignTrigger | null> {
    if (!this.config.enableCampaignTriggers) {
      return null;
    }

    try {
      // Simulate TypeScript error count check (in real implementation, this would run tsc)
      const errorCount = await this.getTypeScriptErrorCount();
      
      this.metrics.typeScriptErrors = errorCount;

      const trigger: CampaignTrigger = {
        type: 'typescript',
        threshold: this.config.thresholds.typescript.criticalThreshold,
        currentValue: errorCount,
        action: this.determineAction('typescript', errorCount),
        triggered: errorCount > this.config.thresholds.typescript.criticalThreshold,
        timestamp: Date.now()
      };

      if (trigger.triggered) {
        logger.warn(`TypeScript error threshold exceeded: ${errorCount} > ${trigger.threshold}`);
        this.campaignTriggers.push(trigger);
        
        // In a real implementation, this would trigger the campaign system
        this.triggerCampaign('typescript-error-elimination', {
          errorCount,
          threshold: trigger.threshold,
          action: trigger.action
        });
      }

      return trigger;
    } catch (error) {
      logger.error('Error checking TypeScript error threshold:', error);
      return null;
    }
  }

  /**
   * Build quality monitoring for performance tracking
   */
  public monitorBuildQuality(buildMetrics: {
    buildTime?: number;
    bundleSize?: number;
    memoryUsage?: number;
    errorCount?: number;
  }): ValidationResult {
    if (!this.config.enablePerformanceMonitoring) {
      return this.createValidationResult(true, 1.0, [], []);
    }

    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 1.0;

    // Check build time
    if (buildMetrics.buildTime && buildMetrics.buildTime > 30000) { // 30 seconds
      issues.push(`Build time (${buildMetrics.buildTime}ms) exceeds recommended threshold`);
      recommendations.push('Consider optimizing build configuration and dependencies');
      score -= 0.2;
    }

    // Check bundle size
    if (buildMetrics.bundleSize && buildMetrics.bundleSize > this.config.thresholds.performance.bundleSize * 1024) {
      issues.push(`Bundle size (${Math.round(buildMetrics.bundleSize / 1024)}KB) exceeds threshold`);
      recommendations.push('Implement code splitting and tree shaking optimizations');
      score -= 0.2;
    }

    // Check memory usage
    if (buildMetrics.memoryUsage && buildMetrics.memoryUsage > this.config.thresholds.performance.memoryUsage) {
      issues.push(`Memory usage (${buildMetrics.memoryUsage}MB) exceeds threshold`);
      recommendations.push('Optimize memory usage and check for memory leaks');
      score -= 0.2;
    }

    // Check error count
    if (buildMetrics.errorCount && buildMetrics.errorCount > 0) {
      issues.push(`Build contains ${buildMetrics.errorCount} errors`);
      recommendations.push('Fix all build errors before deployment');
      score -= 0.3;
    }

    // Update performance metrics
    this.metrics.performanceMetrics = {
      renderTime: 0, // Will be updated by component monitoring
      memoryUsage: buildMetrics.memoryUsage || 0,
      bundleSize: buildMetrics.bundleSize || 0,
      apiResponseTime: 0 // Will be updated by API monitoring
    };

    // Check for campaign triggers
    this.checkCampaignTriggers('performance', score);

    logger.debug('Build quality monitoring completed', { score, issues: issues.length });
    return this.createValidationResult(score >= 0.8, score, issues, recommendations);
  }

  /**
   * Get current quality metrics
   */
  public getQualityMetrics(): QualityMetrics {
    return { ...this.metrics };
  }

  /**
   * Get active campaign triggers
   */
  public getActiveCampaignTriggers(): CampaignTrigger[] {
    return this.campaignTriggers.filter(trigger => 
      Date.now() - trigger.timestamp < 24 * 60 * 60 * 1000 // Last 24 hours
    );
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<QualityAssuranceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.debug('Quality assurance configuration updated', newConfig);
  }

  /**
   * Stop automatic validation
   */
  public stop(): void {
    if (this.validationInterval) {
      clearInterval(this.validationInterval);
      this.validationInterval = null;
    }
  }

  // Private helper methods

  private initializeMetrics(): QualityMetrics {
    return {
      typeScriptErrors: 0,
      lintingWarnings: 0,
      performanceMetrics: {
        renderTime: 0,
        memoryUsage: 0,
        bundleSize: 0,
        apiResponseTime: 0
      },
      planetaryDataQuality: {
        accuracy: 1.0,
        freshness: 1.0,
        reliability: 1.0
      },
      ingredientConsistency: {
        elementalValidation: 1.0,
        compatibilityScores: 1.0,
        culturalSensitivity: 1.0
      }
    };
  }

  private startAutomaticValidation(): void {
    if (!this.config.enableAutomaticValidation) {
      return;
    }

    // Run validation every 5 minutes
    this.validationInterval = setInterval(async () => {
      try {
        await this.validatePlanetaryData();
        await this.checkTypeScriptErrorThreshold();
        logger.debug('Automatic quality validation completed');
      } catch (error) {
        logger.error('Error in automatic validation:', error);
      }
    }, 5 * 60 * 1000);

    logger.debug('Automatic quality validation started');
  }

  private createValidationResult(
    isValid: boolean,
    score: number,
    issues: string[],
    recommendations: string[]
  ): ValidationResult {
    return {
      isValid,
      score: Math.max(0, Math.min(1, score)),
      issues,
      recommendations,
      timestamp: Date.now()
    };
  }

  private calculateDataFreshness(positions: Record<string, any>): number {
    // In a real implementation, this would check the timestamp of the data
    // For now, return 1.0 (fresh) as a placeholder
    return 1.0;
  }

  private validateCulturalSensitivity(ingredientNames: string[]): number {
    // Check for potentially insensitive terms
    const sensitiveTerms = ['exotic', 'ethnic', 'primitive', 'weird'];
    const issues = ingredientNames.filter(name => 
      sensitiveTerms.some(term => name.toLowerCase().includes(term))
    );
    
    return issues.length === 0 ? 1.0 : Math.max(0, 1.0 - (issues.length * 0.2));
  }

  private checkCampaignTriggers(type: CampaignTrigger['type'], value: number): void {
    if (!this.config.enableCampaignTriggers) {
      return;
    }

    const thresholds = this.getThresholdsForType(type);
    if (!thresholds) return;

    const trigger: CampaignTrigger = {
      type,
      threshold: thresholds.critical,
      currentValue: value,
      action: this.determineAction(type, value),
      triggered: value < thresholds.critical,
      timestamp: Date.now()
    };

    if (trigger.triggered) {
      this.campaignTriggers.push(trigger);
      logger.warn(`Campaign trigger activated for ${type}:`, trigger);
    }
  }

  private getThresholdsForType(type: CampaignTrigger['type']): { critical: number; warning: number } | null {
    switch (type) {
      case 'typescript':
        return { critical: this.config.thresholds.typescript.criticalThreshold, warning: this.config.thresholds.typescript.warningThreshold };
      case 'linting':
        return { critical: this.config.thresholds.linting.criticalThreshold, warning: this.config.thresholds.linting.warningThreshold };
      case 'performance':
      case 'planetary':
      case 'ingredient':
        return { critical: 0.8, warning: 0.9 }; // Score-based thresholds
      default:
        return null;
    }
  }

  private determineAction(type: string, value: number): CampaignTrigger['action'] {
    const thresholds = this.getThresholdsForType(type as CampaignTrigger['type']);
    if (!thresholds) return 'monitor';

    if (type === 'typescript' || type === 'linting') {
      // For error counts, higher values are worse
      if (value > thresholds.critical) return 'emergency';
      if (value > thresholds.warning) return 'campaign';
      return 'monitor';
    } else {
      // For scores, lower values are worse
      if (value < 0.7) return 'emergency';
      if (value < thresholds.critical) return 'campaign';
      if (value < thresholds.warning) return 'warn';
      return 'monitor';
    }
  }

  private async getTypeScriptErrorCount(): Promise<number> {
    // In a real implementation, this would run: yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS"
    // For now, return a simulated count
    return Math.floor(Math.random() * 50); // Simulate 0-50 errors
  }

  private triggerCampaign(campaignType: string, context: any): void {
    // In a real implementation, this would integrate with the campaign system
    logger.info(`Campaign triggered: ${campaignType}`, context);
    
    // Simulate campaign system integration
    if (typeof window !== 'undefined') {
      // Dispatch custom event for campaign system integration
      window.dispatchEvent(new CustomEvent('kiro-campaign-trigger', {
        detail: { campaignType, context }
      }));
    }
  }
}

/**
 * Convenience function to get quality assurance instance
 */
export function getAutomatedQualityAssurance(config?: Partial<QualityAssuranceConfig>): AutomatedQualityAssurance {
  return AutomatedQualityAssurance.getInstance(config);
}

/**
 * Hook for components to use automated quality assurance
 */
export function useAutomatedQualityAssurance() {
  const qa = getAutomatedQualityAssurance();
  
  return {
    validatePlanetaryData: (date?: Date) => qa.validatePlanetaryData(date),
    validateIngredientConsistency: (ingredients: Array<{ name: string; elementalProperties: ElementalProperties; category?: string }>) => 
      qa.validateIngredientConsistency(ingredients),
    checkTypeScriptErrorThreshold: () => qa.checkTypeScriptErrorThreshold(),
    monitorBuildQuality: (metrics: any) => qa.monitorBuildQuality(metrics),
    getQualityMetrics: () => qa.getQualityMetrics(),
    getActiveCampaignTriggers: () => qa.getActiveCampaignTriggers(),
    updateConfig: (config: Partial<QualityAssuranceConfig>) => qa.updateConfig(config)
  };
}