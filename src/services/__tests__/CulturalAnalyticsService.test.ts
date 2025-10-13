// Test file for Cultural Analytics Service
import { ElementalProperties } from '@/types/alchemy';

import { CulturalAnalyticsService } from '../CulturalAnalyticsService';

describe('CulturalAnalyticsService', () => {
  const mockElementalProfile: ElementalProperties = {
    Fire: 0.3,
    Water: 0.2,
    Earth: 0.3,
    Air: 0.2,
  };

  const mockAstrologicalState = {
    zodiacSign: 'aries' as const,
    lunarPhase: 'new moon' as const,
  };

  describe('calculateCulturalSynergy', () => {
    it('should calculate cultural synergy for a single cuisine', () => {
      const result = CulturalAnalyticsService.calculateCulturalSynergy('japanese');

      expect(result.score).toBeGreaterThanOrEqual(0.7);
      expect(result.score).toBeLessThanOrEqual(1.0);
      expect(result.culturalGroup).toBe('east_asian');
      expect(Array.isArray(result.reasoning)).toBe(true);
    });

    it('should provide proximity bonus for same cultural group cuisines', () => {
      const result = CulturalAnalyticsService.calculateCulturalSynergy('japanese', ['chinese', 'korean']);

      expect(result.proximityBonus).toBeGreaterThan(0);
      expect(result.score).toBeGreaterThan(0.7);
    });

    it('should provide diversity bonus for different cultural groups', () => {
      const result = CulturalAnalyticsService.calculateCulturalSynergy('japanese', ['italian', 'mexican']);

      expect(result.diversityBonus).toBeGreaterThan(0);
      expect(result.score).toBeGreaterThan(0.7);
    });
  });

  describe('generateCulturalAnalytics', () => {
    it('should generate comprehensive cultural analytics', () => {
      const result = CulturalAnalyticsService.generateCulturalAnalytics(
        'japanese',
        mockElementalProfile,
        mockAstrologicalState,
      );

      expect(result.culturalSynergy).toBeGreaterThanOrEqual(0.5);
      expect(result.culturalCompatibility).toBeGreaterThanOrEqual(0.5);
      expect(result.historicalSignificance).toContain('japanese');
      expect(result.culturalContext).toContain('japanese');
      expect(result.fusionPotential).toBeGreaterThanOrEqual(0.5);
      expect(result.culturalDiversityScore).toBeGreaterThanOrEqual(0.3);
      expect(Array.isArray(result.traditionalPrinciples)).toBe(true);
      expect(Array.isArray(result.modernAdaptations)).toBe(true);
    });

    it('should handle unknown cuisines gracefully', () => {
      const result = CulturalAnalyticsService.generateCulturalAnalytics(
        'unknown_cuisine',
        mockElementalProfile,
        mockAstrologicalState,
      );

      expect(result.culturalSynergy).toBe(0.7);
      expect(result.culturalCompatibility).toBe(0.7);
      expect(result.historicalSignificance).toContain('unknown_cuisine');
    });
  });

  describe('generateFusionRecommendations', () => {
    it('should generate fusion recommendations', () => {
      const availableCuisines = ['japanese', 'italian', 'mexican', 'chinese'];
      const result = CulturalAnalyticsService.generateFusionRecommendations('japanese', availableCuisines, 2);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(2);

      if (result.length > 0) {
        const fusion = result[0];
        expect(fusion.name).toBeDefined();
        expect(fusion.parentCuisines).toContain('japanese');
        expect(fusion.fusionScore).toBeGreaterThanOrEqual(0.6);
        expect(fusion.culturalHarmony).toBeGreaterThanOrEqual(0.6);
        expect(Array.isArray(fusion.recommendedDishes)).toBe(true);
        expect(Array.isArray(fusion.culturalNotes)).toBe(true);
      }
    });

    it('should return empty array for poor fusion potential', () => {
      const result = CulturalAnalyticsService.generateFusionRecommendations(
        'japanese',
        ['japanese'], // Same cuisine only
        3,
      );

      expect(result).toEqual([]);
    });
  });
});
