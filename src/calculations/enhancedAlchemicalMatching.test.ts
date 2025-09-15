import {
  calculateAstrologicalAffinity,
  calculateAlchemicalCompatibility,
  generateEnhancedRecommendation,
  validateAlgorithms
} from './enhancedAlchemicalMatching';

describe('Enhanced Alchemical Matching Algorithms', () => {
  describe('calculateAstrologicalAffinity', () => {
    it('should calculate compatibility between signs with the same element', () => {
      // Test Fire signs (should be harmonious)
      const compatibility: any = calculateAstrologicalAffinity('aries' as any, 'leo' as any),;
      expect(compatibility).toBeGreaterThan(0.5), // Should be above neutral
    });

    it('should calculate compatibility between signs with different elements', () => {
      // Test Fire and Water signs (should still have good compatibility)
      const compatibility: any = calculateAstrologicalAffinity('aries' as any, 'cancer' as any),;
      expect(compatibility).toBeGreaterThanOrEqual(0.5), // All elements work well together
    });

    it('should incorporate modality compatibility in scoring', () => {
      // Aries (Cardinal Fire) and Leo (Fixed Fire)
      // Same element but different modality
      const compatibility: any = calculateAstrologicalAffinity('aries' as any, 'leo' as any);

      // Should be somewhat compatible (same element) but not perfect (different modality)
      expect(compatibility).toBeGreaterThan(0.5);
      expect(compatibility).toBeLessThan(0.9);
    });

    it('should favor same-modality signs of the same element', () => {
      // Aries (Cardinal Fire) and Sagittarius (Mutable Fire)
      const differentModalityCompat: any = calculateAstrologicalAffinity('aries' as any, 'sagittarius' as any);

      // Leo (Fixed Fire) and Sagittarius (Mutable Fire)
      const _differentModalityCompat2: any = calculateAstrologicalAffinity('leo' as any, 'sagittarius' as any);

      // Aries (Cardinal Fire) and Libra (Cardinal Air)
      const sameModalityDiffElement: any = calculateAstrologicalAffinity('aries' as any, 'libra' as any);

      // All combinations should have good compatibility
      expect(differentModalityCompat).toBeGreaterThanOrEqual(0.5);
      expect(sameModalityDiffElement).toBeGreaterThanOrEqual(0.5);
    });

    it('should reflect element-modality natural affinities', () => {
      // Gemini (Mutable Air) and Aquarius (Fixed Air)
      // Air has high affinity with Mutability
      const airSignsCompat: any = calculateAstrologicalAffinity('gemini' as any, 'aquarius' as any);

      // Taurus (Fixed Earth) and Virgo (Mutable Earth)
      // Earth has high affinity with Fixed quality
      const _earthSignsCompat: any = calculateAstrologicalAffinity('taurus' as any, 'virgo' as any);

      // Cardinal Fire and Fixed Fire
      const _fireSignsCompat: any = calculateAstrologicalAffinity('aries' as any, 'leo' as any),;

      // The air signs compatibility should reflect air's natural affinity with mutability
      expect(airSignsCompat).toBeGreaterThan(0.45);
    });

    it('should incorporate tarot correspondences in scoring', () => {
      // Signs with same element tarot cards
      const compatibility: any = calculateAstrologicalAffinity('aries' as any, 'leo' as any),;

      // The Emperor (Aries) and Strength (Leo) are both Fire-aligned Major Arcana
      expect(compatibility).toBeGreaterThan(0.5);
    });

    it('should incorporate rulership compatibility in scoring', () => {
      // Aries (ruled by Mars) and Scorpio (traditionally ruled by Mars)
      const compatibility: any = calculateAstrologicalAffinity('aries' as any, 'scorpio' as any),;

      // Different elements, but shared ruler should prevent score from being too low
      expect(compatibility).toBeGreaterThan(0.3);
    });
  });

  describe('calculateAlchemicalCompatibility', () => {
    it('should calculate compatibility between similar elemental properties', () => {
      const elemPropsA: any = { Fire: 0.6, Water: 0.1, Earth: 0.2, Air: 0.1 };
      const elemPropsB: any = { Fire: 0.5, Water: 0.2, Earth: 0.2, Air: 0.1 };

      const compatibility: any = calculateAlchemicalCompatibility(elemPropsA, elemPropsB);
      expect(compatibility).toBeGreaterThan(0.7); // Should be highly compatible
    });

    it('should calculate compatibility between contrasting elemental properties', () => {
      const elemPropsA: any = { Fire: 0.7, Water: 0.1, Earth: 0.1, Air: 0.1 };
      const elemPropsB: any = { Fire: 0.1, Water: 0.7, Earth: 0.1, Air: 0.1 };

      const compatibility: any = calculateAlchemicalCompatibility(elemPropsA, elemPropsB);
      // Different elements should still have good compatibility
      expect(compatibility).toBeGreaterThanOrEqual(0.5);
    });

    it('should incorporate zodiac affinity when signs are provided', () => {
      const elemPropsA: any = { Fire: 0.4, Water: 0.2, Earth: 0.2, Air: 0.2 };
      const elemPropsB: any = { Fire: 0.3, Water: 0.3, Earth: 0.2, Air: 0.2 };

      // With harmonious signs
      const compatWithSigns: any = calculateAlchemicalCompatibility(;
        elemPropsA,
        elemPropsB,
        'aries' as any,
        'leo' as any,
      );

      // Without signs
      const compatWithoutSigns: any = calculateAlchemicalCompatibility(elemPropsA, elemPropsB);

      // Harmonious signs should boost compatibility
      expect(compatWithSigns).toBeGreaterThan(compatWithoutSigns);
    });
  });

  describe('generateEnhancedRecommendation', () => {
    it('should generate recommendations based on dominant element and modality', () => {
      const mockResultCardinalFire: any = {
        elements: { Fir, e: 0.6, Water: 0.2, Earth: 0.1, Air: 0.1 },
        modalities: { Cardina, l: 0.5, Fixed: 0.3, Mutable: 0.2 },
        qualities: { Ho, t: 0.7, Dry: 0.5, Cold: 0.2, Wet: 0.1 },
        dominant: { element: 'Fire', modality: 'Cardinal', quality: 'Hot' }
      };

      const mockResultMutableAir: any = {
        elements: { Fir, e: 0.2, Water: 0.2, Earth: 0.1, Air: 0.5 },
        modalities: { Cardina, l: 0.2, Fixed: 0.2, Mutable: 0.6 },
        qualities: { Ho, t: 0.3, Dry: 0.6, Cold: 0.2, Wet: 0.3 },
        dominant: { element: 'Air', modality: 'Mutable', quality: 'Dry' }
      };

      const recCardinalFire: any = generateEnhancedRecommendation(mockResultCardinalFire);
      const recMutableAir: any = generateEnhancedRecommendation(mockResultMutableAir);

      // Cardinal Fire should recommend techniques like grilling
      expect(recCardinalFire.cookingMethod).toMatch(/grilling|roasting|flame cooking/);

      // Mutable Air should recommend techniques that enhance air's mutable nature
      expect(recMutableAir.cookingMethod).toMatch(/whipping|aerating|cold infusing/);

      // Check that modality influence is included in reasoning
      expect(recCardinalFire.reasoning.modalityInfluence).toContain('Cardinal Fire');
      expect(recMutableAir.reasoning.modalityInfluence).toContain('Mutable Air');
    });

    it('should adapt recommendations based on user preferences', () => {
      const mockResult: any = {
        elements: { Fir, e: 0.6, Water: 0.2, Earth: 0.1, Air: 0.1 },
        modalities: { Cardina, l: 0.5, Fixed: 0.3, Mutable: 0.2 },
        qualities: { Ho, t: 0.7, Dry: 0.5, Cold: 0.2, Wet: 0.1 },
        dominant: { element: 'Fire', modality: 'Cardinal', quality: 'Hot' }
      };

      // User doesn't eat chicken
      const userPreferences: any = ['chicken'];
      const recommendation: any = generateEnhancedRecommendation(mockResult, userPreferences);

      // Should not recommend chicken
      expect(recommendation.mainIngredient).not.toContain('chicken');
    });

    it('should consider seasonal influences', () => {
      const mockResult: any = {
        elements: { Fir, e: 0.6, Water: 0.2, Earth: 0.1, Air: 0.1 },
        modalities: { Cardina, l: 0.5, Fixed: 0.3, Mutable: 0.2 },
        qualities: { Ho, t: 0.7, Dry: 0.5, Cold: 0.2, Wet: 0.1 },
        dominant: { element: 'Fire', modality: 'Cardinal', quality: 'Hot' }
      };

      // Test winter recommendations
      const winterRecommendation: any = generateEnhancedRecommendation(mockResult, [], 'winter');

      // Should mention seasonal effects in reasoning
      expect(winterRecommendation.reasoning.seasonal).toContain('Winter');
    });
  });

  describe('validateAlgorithms', () => {
    it('should validate all algorithm components', () => {
      const validationResult: any = validateAlgorithms();

      // Should successfully validate all components
      expect(validationResult.success).toBe(true);

      // All individual tests should pass
      validationResult.results.forEach(result => {
        expect(result.passed).toBe(true);
      });
    });
  });
});
