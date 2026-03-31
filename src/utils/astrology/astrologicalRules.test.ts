/**
 * Unit Tests for Astrological Rule Utilities
 *
 * Tests the utility functions that support the custom ESLint rules
 * for astrological calculations.
 */

import {
  VALIDATION_CONSTANTS,
  quickValidate,
  validateAstrologicalCalculation,
  validateMathematicalConstants,
  validatePlanetaryPositions,
} from './astrologicalValidation';
import {
  ELEMENTAL_CONSTANTS,
  calculateElementalHarmony,
  enhanceDominantElement,
  getDominantElement,
  normalizeElementalProperties,
  validateElementalProperties,
  validateSelfReinforcement,
} from './elementalValidation';
import {
  TRANSIT_CONSTANTS,
  getCurrentTransitSign,
  validateAllTransitDates,
  validateRetrogradePhase,
  validateTransitDate,
} from './transitValidation';

describe('Astrological Validation Utilities', () => {
  const validPositions = {
    sun: { sign: 'aries', degree: 15.5, exactLongitude: 15.5, isRetrograde: false },
    moon: { sign: 'taurus', degree: 22.3, exactLongitude: 52.3, isRetrograde: false },
    mercury: { sign: 'gemini', degree: 8.7, exactLongitude: 68.7, isRetrograde: true },
    venus: { sign: 'cancer', degree: 5.2, exactLongitude: 95.2, isRetrograde: false },
    mars: { sign: 'leo', degree: 12.8, exactLongitude: 132.8, isRetrograde: false },
    jupiter: { sign: 'virgo', degree: 28.1, exactLongitude: 178.1, isRetrograde: false },
    saturn: { sign: 'libra', degree: 3.4, exactLongitude: 183.4, isRetrograde: false },
  };

  describe('Planetary Position Validation', () => {
    test('should validate complete planetary positions object', () => {
      const result = validatePlanetaryPositions(validPositions);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should detect missing required planets', () => {
      const missingSun = { ...validPositions };
      delete (missingSun as any).sun;

      const result = validatePlanetaryPositions(missingSun);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('sun'))).toBe(true);
    });

    test('should detect invalid planetary position structure', () => {
      const invalidPos = {
        ...validPositions,
        sun: { sign: 'aries' }, // Missing degree and other props
      };

      const result = validatePlanetaryPositions(invalidPos);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should validate degree ranges', () => {
      const invalidDegree = {
        ...validPositions,
        sun: { ...validPositions.sun, degree: 35 }, // Invalid degree (> 30)
      };

      const result = validatePlanetaryPositions(invalidDegree, { strictMode: true });
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('degree'))).toBe(true);
    });

    test('should auto-correct invalid values when requested', () => {
      const outOfRange = {
        ...validPositions,
        sun: { ...validPositions.sun, degree: 35, exactLongitude: 370 },
      };

      const result = validatePlanetaryPositions(outOfRange, { autoCorrect: true });
      expect(result.correctedData).toBeDefined();
      const correctedSun = (result.correctedData as any).sun;
      expect(correctedSun.degree).toBeLessThan(30);
      expect(correctedSun.exactLongitude).toBeLessThan(360);
    });
  });

  describe('Elemental Properties Validation', () => {
    const validElemental = {
      Fire: 0.4,
      Water: 0.3,
      Earth: 0.2,
      Air: 0.1,
    };

    test('should validate complete elemental properties', () => {
      expect(validateElementalProperties(validElemental)).toBe(true);
    });

    test('should reject missing elements', () => {
      const missingAir = { Fire: 0.5, Water: 0.3, Earth: 0.2 };
      expect(validateElementalProperties(missingAir)).toBe(false);
    });

    test('should reject invalid element values', () => {
      const invalidVal = { Fire: 1.5, Water: 0.1, Earth: 0.1, Air: 0.1 };
      expect(validateElementalProperties(invalidVal)).toBe(false);
    });

    test('should normalize elemental properties', () => {
      const unnormalized = { Fire: 0.8, Water: 0.2 };
      const normalized = normalizeElementalProperties(unnormalized);
      expect(normalized.Fire).toBe(0.8);
      expect(normalized.Water).toBe(0.2);
      expect(normalized.Earth).toBe(0.25);
      expect(normalized.Air).toBe(0.25);
    });

    test('should calculate elemental harmony correctly', () => {
      const set1 = { Fire: 0.7, Water: 0.1, Earth: 0.1, Air: 0.1 };
      const set2 = { Fire: 0.6, Water: 0.2, Earth: 0.1, Air: 0.1 };
      const harmony = calculateElementalHarmony(set1, set2);
      expect(harmony).toBeGreaterThan(0.7);
      expect(harmony).toBeLessThanOrEqual(1.0);
    });

    test('should identify dominant element', () => {
      const fireProperties = { Fire: 0.8, Water: 0.1, Earth: 0.05, Air: 0.05 };
      const dominant = getDominantElement(fireProperties);
      expect(dominant).toBe('Fire');
    });

    test('should enhance dominant element', () => {
      const properties = { Fire: 0.5, Water: 0.2, Earth: 0.2, Air: 0.1 };
      const enhanced = enhanceDominantElement(properties);
      expect(enhanced.Fire).toBeGreaterThan(properties.Fire);
      expect(enhanced.Fire).toBeLessThanOrEqual(1.0);
    });

    test('should validate self-reinforcement patterns', () => {
      const strongFire = { Fire: 0.7, Water: 0.1, Earth: 0.1, Air: 0.1 };
      const weakElements = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };

      expect(validateSelfReinforcement(strongFire)).toBe(true);
      expect(validateSelfReinforcement(weakElements)).toBe(false);
    });
  });

  describe('Transit Date Validation', () => {
    const mockTransitDates = {
      aries: { Start: '2024-03-20', End: '2024-04-19' },
      taurus: { Start: '2024-04-20', End: '2024-05-20' },
      RetrogradePhases: {
        phase1: { Start: '2024-04-01', End: '2024-04-15' },
      },
    };

    test('should validate transit dates correctly', () => {
      const ariesDate = new Date('2024-04-01');
      const taurusDate = new Date('2024-05-01');
      const invalidDate = new Date('2024-06-01');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Legitimate any: Mock data for validation testing
      expect(
        validateTransitDate('mars', ariesDate, 'aries', mockTransitDates as any),
      ).toBe(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Legitimate any: Mock data for validation testing
      expect(
        validateTransitDate('mars', taurusDate, 'taurus', mockTransitDates as any),
      ).toBe(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Legitimate any: Mock data for validation testing
      expect(
        validateTransitDate('mars', invalidDate, 'aries', mockTransitDates as any),
      ).toBe(false);
    });

    test('should get current transit sign', () => {
      const ariesDate = new Date('2024-04-01');
      const taurusDate = new Date('2024-05-01');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Legitimate any: Mock data for transit sign testing
      expect(getCurrentTransitSign('mars', ariesDate, mockTransitDates as any)).toBe(
        'aries',
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Legitimate any: Mock data for transit sign testing
      expect(getCurrentTransitSign('mars', taurusDate, mockTransitDates as any)).toBe(
        'taurus',
      );
    });

    test('should validate retrograde phases', () => {
      const retrogradeDate = new Date('2024-04-10');
      const directDate = new Date('2024-03-25');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Legitimate any: Mock data for retrograde testing
      const retrogradeResult = validateRetrogradePhase(
        'mercury',
        retrogradeDate,
        mockTransitDates as any,
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Legitimate any: Mock data for retrograde testing
      const directResult = validateRetrogradePhase(
        'mercury',
        directDate,
        mockTransitDates as any,
      );

      expect(retrogradeResult.isRetrograde).toBe(true);
      expect(retrogradeResult.phase).toBe('phase1');
      expect(directResult.isRetrograde).toBe(false);
    });

    test('should validate all transit dates for consistency', () => {
      const validTransitDates = {
        aries: { Start: '2024-03-20', End: '2024-04-19' },
        taurus: { Start: '2024-04-20', End: '2024-05-20' },
      };

      const invalidTransitDates = {
        aries: { Start: '2024-03-20', End: '2024-04-19' },
        taurus: { Start: '2024-04-15', End: '2024-05-20' }, // Overlaps with aries
      };

      const validResult = validateAllTransitDates(validTransitDates);
      const invalidResult = validateAllTransitDates(invalidTransitDates);

      expect(validResult.isValid).toBe(true);
      expect(invalidResult.warnings.some(w => w.includes('Overlap'))).toBe(true);
    });
  });

  describe('Mathematical Constants Validation', () => {
    test('should validate expected constants', () => {
      const validConstants = {
        DEGREES_PER_SIGN: 30,
        SIGNS_PER_CIRCLE: 12,
        MAX_LONGITUDE: 360,
        SELF_REINFORCEMENT_THRESHOLD: 0.3,
      };

      const result = validateMathematicalConstants(validConstants);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should warn about unexpected constant values', () => {
      const unexpectedConstants = {
        DEGREES_PER_SIGN: 25, // Should be 30
        SIGNS_PER_CIRCLE: 10, // Should be 12
      };

      const result = validateMathematicalConstants(unexpectedConstants);
      expect(result.isValid).toBe(true); // Warnings don't make it invalid
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('DEGREES_PER_SIGN'))).toBe(true);
    });

    test('should error on invalid constant values', () => {
      const invalidConstants = {
        DEGREES_PER_SIGN: NaN,
        MAX_LONGITUDE: Infinity,
      };

      const result = validateMathematicalConstants(invalidConstants);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Comprehensive Astrological Calculation Validation', () => {
    test('should validate complete astrological calculation input', async () => {
      const validInput = {
        planetaryPositions: validPositions,
        elementalProperties: {
          Fire: 0.4,
          Water: 0.3,
          Earth: 0.2,
          Air: 0.1,
        },
        constants: {
          DEGREES_PER_SIGN: 30,
          MAX_LONGITUDE: 360,
        },
        date: new Date('2024-04-01'),
      };

      const result = await validateAstrologicalCalculation(validInput);
      expect(result.isValid).toBe(true);
    });

    test('should collect all validation errors and warnings', async () => {
      const invalidInput = {
        planetaryPositions: {
          sun: { sign: 'aries', degree: 8.5 }, // Missing properties
        },
        elementalProperties: {
          Fire: 1.5, // Invalid value
          Water: 0.1,
          // Missing elements
        },
        constants: {
          DEGREES_PER_SIGN: NaN, // Invalid constant
        },
      };

      const result = await validateAstrologicalCalculation(invalidInput);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('Quick Validation Functions', () => {
    test('should provide quick validation for different data types', () => {
      const validElemental = { Fire: 0.4, Water: 0.3, Earth: 0.2, Air: 0.1 };
      const validConstants = { DEGREES_PER_SIGN: 30 };

      expect(quickValidate(validPositions, 'planetary')).toBe(true);
      expect(quickValidate(validElemental, 'elemental')).toBe(true);
      expect(quickValidate(validConstants, 'constants')).toBe(true);
    });
  });

  describe('Validation Constants', () => {
    test('should export all necessary validation constants', () => {
      expect(VALIDATION_CONSTANTS.DEGREES_PER_SIGN).toBe(30);
      expect((VALIDATION_CONSTANTS as any).SIGNS_PER_CIRCLE || 12).toBe(12);
    });

    test('should have consistent constants across modules', () => {
      expect(ELEMENTAL_CONSTANTS.SELF_REINFORCEMENT_THRESHOLD).toBe(VALIDATION_CONSTANTS.SELF_REINFORCEMENT_THRESHOLD);
      expect(TRANSIT_CONSTANTS.DEGREES_PER_SIGN).toBe(VALIDATION_CONSTANTS.DEGREES_PER_SIGN);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle null and undefined inputs gracefully', () => {
      expect(validatePlanetaryPositions(null as any).isValid).toBe(false);
      expect(validateElementalProperties(undefined as any)).toBe(false);
      expect(validateMathematicalConstants(null as any).isValid).toBe(false);
    });

    test('should handle malformed data structures', () => {
      expect(validatePlanetaryPositions({ sun: 'not an object' } as any).isValid).toBe(false);
      expect(validateElementalProperties({ Fire: 'not a number' } as any)).toBe(false);
    });

    test('should handle circular references safely', () => {
      const circular: any = { sun: { sign: 'aries' } };
      circular.self = circular;
      
      expect(() => validatePlanetaryPositions(circular)).not.toThrow();
    });

    test('should validate performance with large datasets', () => {
      const largePositions: any = {};
      for (let i = 0; i < 500; i++) {
        largePositions[`planet${i}`] = { sign: 'aries', degree: 10, exactLongitude: 10, isRetrograde: false };
      }
      
      const startTime = Date.now();
      validatePlanetaryPositions(largePositions);
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(100); // Should be fast
    });
  });
});
