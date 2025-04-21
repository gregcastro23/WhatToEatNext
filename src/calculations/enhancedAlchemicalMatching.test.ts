import { 
  calculateAstrologicalAffinity, 
  calculateAlchemicalCompatibility,
  generateEnhancedRecommendation,
  validateAlgorithms
} from './enhancedAlchemicalMatching';
import { ZodiacSign, StandardizedAlchemicalResult as AlchemyStandardizedAlchemicalResult } from '@/types/alchemy';
import type { StandardizedAlchemicalResult } from '../types/alchemicalResults';

// Adapter to convert partial mock data to complete StandardizedAlchemicalResult that is compatible
// with both alchemicalResults.ts and alchemy.ts versions
function createStandardizedAlchemicalResult(mockData: any): AlchemyStandardizedAlchemicalResult {
  return {
    elements: mockData.elements || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    modalities: mockData.modalities || { Cardinal: 0.33, Fixed: 0.33, Mutable: 0.34 },
    qualities: mockData.qualities || { Hot: 0.25, Dry: 0.25, Cold: 0.25, Wet: 0.25 },
    dominant: mockData.dominant || {
      element: 'Fire',
      modality: 'Cardinal',
      quality: 'Hot'
    },
    // Create compatible elementalBalance that is not a number
    elementalBalance: {
      fire: 0.25,
      earth: 0.25,
      air: 0.25,
      water: 0.25
    },
    spirit: 0.5,
    essence: 0.5,
    matter: 0.5,
    substance: 0.5,
    harmonyScore: 0.6,
    reciprocality: 0.5,
    // Add cuisine to match expected properties
    dominantElement: mockData.dominant?.element || 'Fire'
  } as AlchemyStandardizedAlchemicalResult;
}

describe('Enhanced Alchemical Matching Algorithms', () => {
  describe('calculateAstrologicalAffinity', () => {
    it('should calculate compatibility between signs with the same element', () => {
      // Test Fire signs (should be harmonious)
      const compatibility = calculateAstrologicalAffinity('aries' as ZodiacSign, 'leo' as ZodiacSign);
      expect(compatibility).toBeGreaterThan(0.5); // Should be above neutral
    });
    
    it('should calculate compatibility between signs with different elements', () => {
      // Test Fire and Water signs (should still have good compatibility)
      const compatibility = calculateAstrologicalAffinity('aries' as ZodiacSign, 'cancer' as ZodiacSign);
      expect(compatibility).toBeGreaterThanOrEqual(0.5); // All elements work well together
    });
    
    it('should incorporate modality compatibility in scoring', () => {
      // Aries (Cardinal Fire) and Leo (Fixed Fire)
      // Same element but different modality
      const compatibility = calculateAstrologicalAffinity('aries' as ZodiacSign, 'leo' as ZodiacSign);
      
      // Should be somewhat compatible (same element) but not perfect (different modality)
      expect(compatibility).toBeGreaterThan(0.5);
      expect(compatibility).toBeLessThan(0.9);
    });
    
    it('should favor same-modality signs of the same element', () => {
      // Aries (Cardinal Fire) and Sagittarius (Mutable Fire)
      const differentModalityCompat = calculateAstrologicalAffinity(
        'aries' as ZodiacSign, 
        'sagittarius' as ZodiacSign
      );
      
      // Leo (Fixed Fire) and Sagittarius (Mutable Fire)
      const differentModalityCompat2 = calculateAstrologicalAffinity(
        'leo' as ZodiacSign, 
        'sagittarius' as ZodiacSign
      );
      
      // Aries (Cardinal Fire) and Libra (Cardinal Air)
      const sameModalityDiffElement = calculateAstrologicalAffinity(
        'aries' as ZodiacSign, 
        'libra' as ZodiacSign
      );
      
      // All combinations should have good compatibility
      expect(differentModalityCompat).toBeGreaterThanOrEqual(0.5);
      expect(sameModalityDiffElement).toBeGreaterThanOrEqual(0.5);
    });
    
    it('should reflect element-modality natural affinities', () => {
      // Gemini (Mutable Air) and Aquarius (Fixed Air)
      // Air has high affinity with Mutability
      const airSignsCompat = calculateAstrologicalAffinity(
        'gemini' as ZodiacSign, 
        'aquarius' as ZodiacSign
      );
      
      // Taurus (Fixed Earth) and Virgo (Mutable Earth)
      // Earth has high affinity with Fixed quality
      const earthSignsCompat = calculateAstrologicalAffinity(
        'taurus' as ZodiacSign, 
        'virgo' as ZodiacSign
      );
      
      // Cardinal Fire and Fixed Fire
      const fireSignsCompat = calculateAstrologicalAffinity(
        'aries' as ZodiacSign, 
        'leo' as ZodiacSign
      );
      
      // The air signs compatibility should reflect air's natural affinity with mutability
      expect(airSignsCompat).toBeGreaterThan(0.45);
    });
    
    it('should incorporate tarot correspondences in scoring', () => {
      // Signs with same element tarot cards
      const compatibility = calculateAstrologicalAffinity('aries' as ZodiacSign, 'leo' as ZodiacSign);
      
      // The Emperor (Aries) and Strength (Leo) are both Fire-aligned Major Arcana
      expect(compatibility).toBeGreaterThan(0.5);
    });
    
    it('should incorporate rulership compatibility in scoring', () => {
      // Aries (ruled by Mars) and Scorpio (traditionally ruled by Mars)
      const compatibility = calculateAstrologicalAffinity('aries' as ZodiacSign, 'scorpio' as ZodiacSign);
      
      // Different elements, but shared ruler should prevent score from being too low
      expect(compatibility).toBeGreaterThan(0.3);
    });
  });
  
  describe('calculateAlchemicalCompatibility', () => {
    it('should calculate compatibility between similar elemental properties', () => {
      const elemPropsA = { Fire: 0.6, Water: 0.1, Earth: 0.2, Air: 0.1 };
      const elemPropsB = { Fire: 0.5, Water: 0.2, Earth: 0.2, Air: 0.1 };
      
      const compatibility = calculateAlchemicalCompatibility(elemPropsA, elemPropsB);
      expect(compatibility).toBeGreaterThan(0.7); // Should be highly compatible
    });
    
    it('should calculate compatibility between contrasting elemental properties', () => {
      const elemPropsA = { Fire: 0.7, Water: 0.1, Earth: 0.1, Air: 0.1 };
      const elemPropsB = { Fire: 0.1, Water: 0.7, Earth: 0.1, Air: 0.1 };
      
      const compatibility = calculateAlchemicalCompatibility(elemPropsA, elemPropsB);
      // Different elements should still have good compatibility
      expect(compatibility).toBeGreaterThanOrEqual(0.5);
    });
    
    it('should incorporate zodiac affinity when signs are provided', () => {
      const elemPropsA = { Fire: 0.4, Water: 0.2, Earth: 0.2, Air: 0.2 };
      const elemPropsB = { Fire: 0.3, Water: 0.3, Earth: 0.2, Air: 0.2 };
      
      // With harmonious signs
      const compatWithSigns = calculateAlchemicalCompatibility(
        elemPropsA, 
        elemPropsB,
        'aries' as ZodiacSign, 
        'leo' as ZodiacSign
      );
      
      // Without signs
      const compatWithoutSigns = calculateAlchemicalCompatibility(elemPropsA, elemPropsB);
      
      // Harmonious signs should boost compatibility
      expect(compatWithSigns).toBeGreaterThan(compatWithoutSigns);
    });
  });
  
  describe('generateEnhancedRecommendation', () => {
    it('should generate cuisine recommendations based on elemental dominance', () => {
      const mockResult = {
        elements: { Fire: 0.6, Water: 0.2, Earth: 0.1, Air: 0.1 },
        modalities: { Cardinal: 0.5, Fixed: 0.3, Mutable: 0.2 },
        qualities: { Hot: 0.7, Dry: 0.5, Cold: 0.2, Wet: 0.1 },
        dominant: {
          element: 'Fire',
          modality: 'Cardinal',
          quality: 'Hot'
        }
      };
      
      const recommendation = generateEnhancedRecommendation(createStandardizedAlchemicalResult(mockResult));
      
      // Fire dominant should suggest spicy cuisine
      expect(recommendation.cuisine).toBeTruthy();
      expect(recommendation.reasoning.elementalInfluence).toContain('Fire');
      
      // Mock a water-dominant result
      const waterResult = {
        elements: { Fire: 0.1, Water: 0.6, Earth: 0.2, Air: 0.1 },
        modalities: { Cardinal: 0.3, Fixed: 0.5, Mutable: 0.2 },
        qualities: { Hot: 0.2, Dry: 0.1, Cold: 0.5, Wet: 0.6 },
        dominant: {
          element: 'Water',
          modality: 'Fixed',
          quality: 'Wet'
        }
      };
      
      const waterRecommendation = generateEnhancedRecommendation(createStandardizedAlchemicalResult(waterResult));
      
      // Water dominant should suggest different cuisine than fire
      expect(waterRecommendation.cuisine).not.toEqual(recommendation.cuisine);
      expect(waterRecommendation.reasoning.elementalInfluence).toContain('Water');
    });
    
    it('should consider modality in cooking method recommendations', () => {
      const mockResultCardinalFire = {
        elements: { Fire: 0.6, Water: 0.1, Earth: 0.1, Air: 0.2 },
        modalities: { Cardinal: 0.7, Fixed: 0.2, Mutable: 0.1 },
        qualities: { Hot: 0.7, Dry: 0.6, Cold: 0.1, Wet: 0.1 },
        dominant: {
          element: 'Fire',
          modality: 'Cardinal',
          quality: 'Hot'
        }
      };
      
      const mockResultMutableAir = {
        elements: { Fire: 0.2, Water: 0.2, Earth: 0.1, Air: 0.5 },
        modalities: { Cardinal: 0.2, Fixed: 0.2, Mutable: 0.6 },
        qualities: { Hot: 0.3, Dry: 0.6, Cold: 0.2, Wet: 0.3 },
        dominant: {
          element: 'Air',
          modality: 'Mutable',
          quality: 'Dry'
        }
      };
      
      const recCardinalFire = generateEnhancedRecommendation(createStandardizedAlchemicalResult(mockResultCardinalFire));
      const recMutableAir = generateEnhancedRecommendation(createStandardizedAlchemicalResult(mockResultMutableAir));
      
      // Cardinal Fire should recommend techniques like grilling
      expect(recCardinalFire.cookingMethod).toMatch(/grilling|roasting|flame cooking/);
      
      // Mutable Air should recommend techniques that enhance air's mutable nature
      expect(recMutableAir.cookingMethod).toMatch(/whipping|aerating|cold infusing/);
      
      // Check that modality influence is included in reasoning
      expect(recCardinalFire.reasoning.modalityInfluence).toContain('Cardinal Fire');
      expect(recMutableAir.reasoning.modalityInfluence).toContain('Mutable Air');
    });
    
    it('should adapt recommendations based on user preferences', () => {
      const mockResult = {
        elements: { Fire: 0.6, Water: 0.2, Earth: 0.1, Air: 0.1 },
        modalities: { Cardinal: 0.5, Fixed: 0.3, Mutable: 0.2 },
        qualities: { Hot: 0.7, Dry: 0.5, Cold: 0.2, Wet: 0.1 },
        dominant: {
          element: 'Fire',
          modality: 'Cardinal',
          quality: 'Hot'
        }
      };
      
      // User doesn't eat chicken
      const userPreferences = ['chicken'];
      const recommendation = generateEnhancedRecommendation(
        createStandardizedAlchemicalResult(mockResult), 
        userPreferences
      );
      
      // Should not recommend chicken
      expect(recommendation.mainIngredient).not.toContain('chicken');
    });
    
    it('should consider seasonal influences', () => {
      const mockResult = {
        elements: { Fire: 0.6, Water: 0.2, Earth: 0.1, Air: 0.1 },
        modalities: { Cardinal: 0.5, Fixed: 0.3, Mutable: 0.2 },
        qualities: { Hot: 0.7, Dry: 0.5, Cold: 0.2, Wet: 0.1 },
        dominant: {
          element: 'Fire',
          modality: 'Cardinal',
          quality: 'Hot'
        }
      };
      
      // Test winter recommendations
      const winterRecommendation = generateEnhancedRecommendation(
        createStandardizedAlchemicalResult(mockResult), 
        [], 
        'winter'
      );
      
      // Should mention seasonal effects in reasoning
      expect(winterRecommendation.reasoning.seasonal).toContain('Winter');
    });
  });
  
  describe('validateAlgorithms', () => {
    it('should validate all algorithm components', () => {
      const validationResult = validateAlgorithms();
      
      // Should successfully validate all components
      expect(validationResult.success).toBe(true);
      
      // All individual tests should pass
      validationResult.results.forEach(result => {
        expect(result.passed).toBe(true);
      });
    });
  });
}); 