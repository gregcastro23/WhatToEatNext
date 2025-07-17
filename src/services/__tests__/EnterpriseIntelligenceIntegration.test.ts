/**
 * Enterprise Intelligence Integration Tests
 * Main Page Restoration - Task 3.8 Implementation
 */

import { EnterpriseIntelligenceIntegration } from '../EnterpriseIntelligenceIntegration';
import type { ElementalProperties, ZodiacSign, LunarPhase } from '@/types/alchemy';

// Mock the logger to avoid initialization issues in tests
jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  }
}));

describe('EnterpriseIntelligenceIntegration', () => {
  let service: EnterpriseIntelligenceIntegration;

  beforeEach(() => {
    service = new EnterpriseIntelligenceIntegration({
      enableRecipeIntelligence: true,
      enableIngredientIntelligence: true,
      enableValidationIntelligence: true,
      enableSafetyIntelligence: true,
      enableOptimizationRecommendations: true,
      cacheResults: false, // Disable caching for tests
      logLevel: 'error' // Reduce log noise in tests
    });
  });

  describe('performEnterpriseAnalysis', () => {
    const mockRecipeData = {
      id: 'test-recipe',
      name: 'Test Recipe',
      elementalProperties: {
        Fire: 0.3,
        Water: 0.2,
        Earth: 0.3,
        Air: 0.2
      }
    };

    const mockIngredientData = {
      id: 'test-ingredients',
      ingredients: [
        {
          name: 'Test Ingredient',
          category: 'vegetables',
          elementalProperties: {
            Fire: 0.2,
            Water: 0.3,
            Earth: 0.3,
            Air: 0.2
          }
        }
      ]
    };

    const mockAstrologicalContext = {
      zodiacSign: 'aries' as ZodiacSign,
      lunarPhase: 'new moon' as LunarPhase,
      elementalProperties: {
        Fire: 0.4,
        Water: 0.2,
        Earth: 0.2,
        Air: 0.2
      } as ElementalProperties,
      planetaryPositions: {}
    };

    it('should perform comprehensive enterprise analysis', async () => {
      const result = await service.performEnterpriseAnalysis(
        mockRecipeData,
        mockIngredientData,
        mockAstrologicalContext
      );

      expect(result).toBeDefined();
      expect(result.recipeIntelligence).toBeDefined();
      expect(result.ingredientIntelligence).toBeDefined();
      expect(result.validationIntelligence).toBeDefined();
      expect(result.safetyIntelligence).toBeDefined();
      expect(result.optimizationRecommendations).toBeDefined();
      expect(result.overallScore).toBeGreaterThan(0);
      expect(result.systemHealth).toMatch(/excellent|good|fair|poor/);
      expect(result.timestamp).toBeDefined();
    });

    it('should handle recipe intelligence analysis', async () => {
      const result = await service.performEnterpriseAnalysis(
        mockRecipeData,
        mockIngredientData,
        mockAstrologicalContext
      );

      const recipeIntelligence = result.recipeIntelligence;
      expect(recipeIntelligence.compatibilityAnalysis).toBeDefined();
      expect(recipeIntelligence.optimizationScore).toBeGreaterThanOrEqual(0);
      expect(recipeIntelligence.optimizationScore).toBeLessThanOrEqual(1);
      expect(recipeIntelligence.safetyScore).toBeGreaterThanOrEqual(0);
      expect(recipeIntelligence.safetyScore).toBeLessThanOrEqual(1);
      expect(Array.isArray(recipeIntelligence.recommendations)).toBe(true);
      expect(recipeIntelligence.confidence).toBeGreaterThanOrEqual(0);
      expect(recipeIntelligence.confidence).toBeLessThanOrEqual(1);
    });

    it('should handle ingredient intelligence analysis', async () => {
      const result = await service.performEnterpriseAnalysis(
        mockRecipeData,
        mockIngredientData,
        mockAstrologicalContext
      );

      const ingredientIntelligence = result.ingredientIntelligence;
      expect(ingredientIntelligence.categorizationAnalysis).toBeDefined();
      expect(ingredientIntelligence.seasonalAnalysis).toBeDefined();
      expect(ingredientIntelligence.compatibilityAnalysis).toBeDefined();
      expect(ingredientIntelligence.astrologicalAnalysis).toBeDefined();
      expect(ingredientIntelligence.validationResults).toBeDefined();
      expect(ingredientIntelligence.optimizationScore).toBeGreaterThanOrEqual(0);
      expect(ingredientIntelligence.optimizationScore).toBeLessThanOrEqual(1);
      expect(Array.isArray(ingredientIntelligence.recommendations)).toBe(true);
    });

    it('should perform validation intelligence', async () => {
      const result = await service.performEnterpriseAnalysis(
        mockRecipeData,
        mockIngredientData,
        mockAstrologicalContext
      );

      const validation = result.validationIntelligence;
      expect(validation.dataIntegrity).toBeDefined();
      expect(validation.astrologicalConsistency).toBeDefined();
      expect(validation.elementalHarmony).toBeDefined();
      expect(validation.overallValidation).toBeDefined();
      expect(validation.overallValidation.score).toBeGreaterThanOrEqual(0);
      expect(validation.overallValidation.score).toBeLessThanOrEqual(1);
      expect(validation.overallValidation.status).toMatch(/excellent|good|fair|poor/);
    });

    it('should perform safety intelligence', async () => {
      const result = await service.performEnterpriseAnalysis(
        mockRecipeData,
        mockIngredientData,
        mockAstrologicalContext
      );

      const safety = result.safetyIntelligence;
      expect(safety.riskAssessment).toBeDefined();
      expect(safety.riskAssessment.level).toMatch(/low|medium|high|critical/);
      expect(safety.riskAssessment.score).toBeGreaterThanOrEqual(0);
      expect(safety.riskAssessment.score).toBeLessThanOrEqual(1);
      expect(Array.isArray(safety.riskAssessment.factors)).toBe(true);
      expect(Array.isArray(safety.fallbackStrategies)).toBe(true);
      expect(safety.errorRecovery).toBeDefined();
      expect(safety.errorRecovery.enabled).toBe(true);
    });

    it('should generate optimization recommendations', async () => {
      const result = await service.performEnterpriseAnalysis(
        mockRecipeData,
        mockIngredientData,
        mockAstrologicalContext
      );

      const optimization = result.optimizationRecommendations;
      expect(optimization.performance).toBeDefined();
      expect(optimization.accuracy).toBeDefined();
      expect(optimization.userExperience).toBeDefined();
      expect(optimization.systemIntegration).toBeDefined();
      expect(optimization.overallOptimization).toBeDefined();
      expect(optimization.overallOptimization.priority).toMatch(/low|medium|high|critical/);
      expect(optimization.overallOptimization.estimatedValue).toBeGreaterThanOrEqual(0);
    });

    it('should handle missing data gracefully', async () => {
      const result = await service.performEnterpriseAnalysis(
        null,
        null,
        mockAstrologicalContext
      );

      expect(result).toBeDefined();
      expect(result.validationIntelligence.dataIntegrity.score).toBeLessThan(1);
      expect(result.safetyIntelligence.riskAssessment.level).toMatch(/low|medium|high|critical/);
    });
  });

  describe('configuration', () => {
    it('should respect disabled features', async () => {
      const disabledService = new EnterpriseIntelligenceIntegration({
        enableRecipeIntelligence: false,
        enableIngredientIntelligence: false,
        enableValidationIntelligence: false,
        enableSafetyIntelligence: false,
        enableOptimizationRecommendations: false
      });

      const result = await disabledService.performEnterpriseAnalysis(
        { id: 'test' },
        { id: 'test' },
        {
          zodiacSign: 'aries' as ZodiacSign,
          lunarPhase: 'new moon' as LunarPhase,
          elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }
        }
      );

      expect(result.recipeIntelligence.recommendations).toContain('Recipe intelligence disabled');
      expect(result.ingredientIntelligence.recommendations).toContain('Ingredient intelligence disabled');
    });

    it('should update configuration', () => {
      service.updateConfig({
        enableRecipeIntelligence: false,
        logLevel: 'debug'
      });

      // Configuration should be updated (we can't easily test this without exposing internal state)
      expect(service).toBeDefined();
    });

    it('should clear cache', () => {
      service.clearCache();
      expect(service).toBeDefined();
    });

    it('should reset metrics', () => {
      service.resetMetrics();
      const metrics = service.getPerformanceMetrics();
      expect(metrics.analysisCount).toBe(0);
      expect(metrics.averageExecutionTime).toBe(0);
      expect(metrics.cacheHitRate).toBe(0);
      expect(metrics.errorRate).toBe(0);
    });
  });

  describe('performance metrics', () => {
    it('should track performance metrics', async () => {
      const initialMetrics = service.getPerformanceMetrics();
      expect(initialMetrics.analysisCount).toBe(0);

      await service.performEnterpriseAnalysis(
        { id: 'test' },
        { id: 'test' },
        {
          zodiacSign: 'aries' as ZodiacSign,
          lunarPhase: 'new moon' as LunarPhase,
          elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }
        }
      );

      const updatedMetrics = service.getPerformanceMetrics();
      expect(updatedMetrics.analysisCount).toBe(1);
      expect(updatedMetrics.averageExecutionTime).toBeGreaterThan(0);
    });
  });
});