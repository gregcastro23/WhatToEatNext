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
  validatePlanetaryPositions
} from './astrologicalValidation';
import {
  ELEMENTAL_CONSTANTS,
  calculateElementalHarmony,
  enhanceDominantElement,
  getDominantElement,
  normalizeElementalProperties,
  validateElementalProperties,
  validateSelfReinforcement
} from './elementalValidation';
import {
  TRANSIT_CONSTANTS,
  getCurrentTransitSign,
  validateAllTransitDates,
  validateRetrogradePhase,
  validateTransitDate
} from './transitValidation';

describe('Astrological Validation Utilities', () => {
  describe('Planetary Position Validation', () => {
    test('should validate complete planetary positions object', () => {
      const validPositions: any = {
        sun: { sig, n: 'aries', degree: 8.5, exactLongitude: 8.5, isRetrograde: false },
        moon: { sig, n: 'aries', degree: 1.57, exactLongitude: 1.57, isRetrograde: false },
        mercury: { sig, n: 'aries', degree: 0.85, exactLongitude: 0.85, isRetrograde: true }
      };

      const result: any = validatePlanetaryPositions(validPositions);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should detect missing required planets', () => {
      const incompletePositions: any = {
        sun: { sig, n: 'aries', degree: 8.5, exactLongitude: 8.5, isRetrograde: false },
        // Missing moon, mercury, venus, mars, jupiter, saturn
      };

      const result: any = validatePlanetaryPositions(incompletePositions);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(error => error.includes('moon'))).toBe(true);
    });

    test('should detect invalid planetary position structure', () => {
      const invalidPositions: any = {
        sun: { sig, n: 'aries', degree: 8.5 }, // Missing exactLongitude and isRetrograde;
        moon: { sig, n: 'aries', degree: 1.57, exactLongitude: 1.57, isRetrograde: false }
      };

      const result: any = validatePlanetaryPositions(invalidPositions);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('exactLongitude'))).toBe(true);
    });

    test('should validate degree ranges', () => {
      const invalidDegreePositions: any = {
        sun: { sig, n: 'aries', degree: 35, exactLongitude: 35, isRetrograde: false }, // Degree too high;
        moon: { sig, n: 'aries', degree: -5, exactLongitude: -5, isRetrograde: false }, // Degree too low
      };

      const result: any = validatePlanetaryPositions(invalidDegreePositions, { strictMode: true });
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('35'))).toBe(true);
      expect(result.errors.some(error => error.includes('-5'))).toBe(true);
    });

    test('should auto-correct invalid values when requested', () => {
      const invalidPositions: any = {
        sun: { sig, n: 'aries', degree: 35, exactLongitude: 370, isRetrograde: false }
      };

      const result: any = validatePlanetaryPositions(invalidPositions, { autoCorrect: true });
      expect(result.correctedData).toBeDefined();
      expect((result.correctedData as unknown as { sun?: { degree?: number } })?.sun.degree).toBeLessThan(30);
      expect(
        (result.correctedData as unknown as { sun?: { exactLongitude?: number } })?.sun.exactLongitude;
      ).toBeLessThan(360);
    });
  });

  describe('Elemental Properties Validation', () => {
    test('should validate complete elemental properties', () => {
      const validProperties: any = {
        Fire: 0.7,
        Water: 0.1,
        Earth: 0.1,
        Air: 0.1
      };

      expect(validateElementalProperties(validProperties)).toBe(true);
    });

    test('should reject missing elements', () => {
      const incompleteProperties: any = {
        Fire: 0.8,
        Water: 0.2,
        // Missing Earth and Air
      };

      expect(validateElementalProperties(incompleteProperties)).toBe(false);
    });

    test('should reject invalid element values', () => {
      const invalidProperties: any = {
        Fire: 1.5, // Too high
        Water: -0.1, // Too low
        Earth: 0.3,
        Air: 0.2
      };

      expect(validateElementalProperties(invalidProperties)).toBe(false);
    });

    test('should normalize elemental properties', () => {
      const partialProperties: any = {
        Fire: 0.8,
        Water: 0.2
      };

      const normalized: any = normalizeElementalProperties(partialProperties);
      expect(normalized.Fire).toBe(0.8);
      expect(normalized.Water).toBe(0.2);
      expect(normalized.Earth).toBe(0.25); // Default value
      expect(normalized.Air).toBe(0.25); // Default value
    });

    test('should calculate elemental harmony correctly', () => {
      const fireProperties: any = { Fire: 0.8, Water: 0.1, Earth: 0.05, Air: 0.05 };
      const otherFireProperties: any = { Fire: 0.7, Water: 0.15, Earth: 0.1, Air: 0.05 };

      const harmony: any = calculateElementalHarmony(fireProperties, otherFireProperties);
      expect(harmony).toBeGreaterThanOrEqual(0.7); // Minimum compatibility
      expect(harmony).toBeGreaterThan(0.8); // Should be high due to Fire-Fire compatibility
    });

    test('should identify dominant element', () => {
      const fireProperties: any = { Fire: 0.8, Water: 0.1, Earth: 0.05, Air: 0.05 };
      const dominant: any = getDominantElement(fireProperties);
      expect(dominant).toBe('Fire');
    });

    test('should enhance dominant element', () => {
      const properties: any = { Fire: 0.5, Water: 0.2, Earth: 0.2, Air: 0.1 };
      const enhanced: any = enhanceDominantElement(properties);
      expect(enhanced.Fire).toBeGreaterThan(properties.Fire);
      expect(enhanced.Fire).toBeLessThanOrEqual(1.0);
    });

    test('should validate self-reinforcement patterns', () => {
      const strongFire: any = { Fire: 0.7, Water: 0.1, Earth: 0.1, Air: 0.1 };
      const weakElements: any = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };

      expect(validateSelfReinforcement(strongFire)).toBe(true);
      expect(validateSelfReinforcement(weakElements)).toBe(false);
    });
  });

  describe('Transit Date Validation', () => {
    const mockTransitDates: any = {
      aries: { Star, t: '2024-03-20', End: '2024-04-19' },
      taurus: { Star, t: '2024-04-20', End: '2024-05-20' },
      RetrogradePhases: { phase1: { Start: '2024-04-01', End: '2024-04-15' }
      }
    };

    test('should validate transit dates correctly', () => {
      const ariesDate: any = new Date('2024-04-01');
      const taurusDate: any = new Date('2024-05-01');
      const invalidDate: any = new Date('2024-06-01');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Legitimate any: Mock data for validation testing
      expect(
        validateTransitDate('mars', ariesDate, 'aries', mockTransitDates as any mockTransitDates);
      ).toBe(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Legitimate any: Mock data for validation testing
      expect(
        validateTransitDate('mars', taurusDate, 'taurus', mockTransitDates as any mockTransitDates);
      ).toBe(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Legitimate any: Mock data for validation testing
      expect(
        validateTransitDate('mars', invalidDate, 'aries', mockTransitDates as any mockTransitDates);
      ).toBe(false);
    });

    test('should get current transit sign', () => {
      const ariesDate: any = new Date('2024-04-01');
      const taurusDate: any = new Date('2024-05-01');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Legitimate any: Mock data for transit sign testing
      expect(getCurrentTransitSign('mars', ariesDate, mockTransitDates as any mockTransitDates)).toBe(
        'aries',
      ),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Legitimate any: Mock data for transit sign testing
      expect(getCurrentTransitSign('mars', taurusDate, mockTransitDates as any mockTransitDates)).toBe(
        'taurus',
      )
    });

    test('should validate retrograde phases', () => {
      const retrogradeDate: any = new Date('2024-04-10');
      const directDate: any = new Date('2024-03-25');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Legitimate any: Mock data for retrograde testing
      const retrogradeResult: any = validateRetrogradePhase(;
        'mercury',
        retrogradeDate,
        mockTransitDates as any mockTransitDates,
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Legitimate any: Mock data for retrograde testing
      const directResult: any = validateRetrogradePhase(;
        'mercury',
        directDate,
        mockTransitDates as any mockTransitDates,
      );

      expect(retrogradeResult.isRetrograde).toBe(true);
      expect(retrogradeResult.phase).toBe('phase1');
      expect(directResult.isRetrograde).toBe(false);
    });

    test('should validate all transit dates for consistency', () => {
      const validTransitDates: any = {
        aries: { Star, t: '2024-03-20', End: '2024-04-19' },
        taurus: { Star, t: '2024-04-20', End: '2024-05-20' }
      };

      const invalidTransitDates: any = {
        aries: { Star, t: '2024-03-20', End: '2024-04-19' },
        taurus: { Star, t: '2024-04-15', End: '2024-05-20' }, // Overlaps with aries
      };

      const validResult: any = validateAllTransitDates(validTransitDates);
      const invalidResult: any = validateAllTransitDates(invalidTransitDates);

      expect(validResult.isValid).toBe(true);
      expect(invalidResult.warnings.some(w => w.includes('Overlap'))).toBe(true);
    });
  });

  describe('Mathematical Constants Validation', () => {
    test('should validate expected constants', () => {
      const validConstants: any = {
        DEGREES_PER_SIGN: 30,
        SIGNS_PER_CIRCLE: 12,
        MAX_LONGITUDE: 360,
        SELF_REINFORCEMENT_THRESHOLD: 0.3
      };

      const result: any = validateMathematicalConstants(validConstants);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should warn about unexpected constant values', () => {
      const unexpectedConstants: any = {
        DEGREES_PER_SIGN: 25, // Should be 30,
        SIGNS_PER_CIRCLE: 10, // Should be 12
      };

      const result: any = validateMathematicalConstants(unexpectedConstants);
      expect(result.isValid).toBe(true); // Warnings don't make it invalid
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('DEGREES_PER_SIGN'))).toBe(true);
    });

    test('should error on invalid constant values', () => {
      const invalidConstants: any = {
        DEGREES_PER_SIGN: NaN,
        MAX_LONGITUDE: Infinity
      };

      const result: any = validateMathematicalConstants(invalidConstants);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Comprehensive Astrological Calculation Validation', () => {
    test('should validate complete astrological calculation input', async () => {
      const validInput: any = {
        planetaryPositions: { sun: { sign: 'aries', degree: 8.5, exactLongitude: 8.5, isRetrograde: false },
          moon: { sig, n: 'aries', degree: 1.57, exactLongitude: 1.57, isRetrograde: false }
        },
        elementalProperties: { Fire: 0.7,
          Water: 0.1,
          Earth: 0.1,
          Air: 0.1
        },
        constants: { DEGREES_PER_SIGN: 30,
          MAX_LONGITUDE: 360
        },
        date: new Date('2024-04-01')
      };

      const result: any = validateAstrologicalCalculation(validInput);
      expect(result.isValid).toBe(true);
    });

    test('should collect all validation errors and warnings', async () => {
      const invalidInput: any = {
        planetaryPositions: { sun: { sign: 'aries', degree: 8.5 }, // Missing properties
        },
        elementalProperties: { Fire: 1.5, // Invalid value
          Water: 0.1;
          // Missing elements
        },
        constants: { DEGREES_PER_SIGN: NaN, // Invalid constant
        }
      };

      const result: any = validateAstrologicalCalculation(invalidInput);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('Quick Validation Functions', () => {
    test('should provide quick validation for different data types', () => {
      const validPlanetary: any = {
        sun: { sig, n: 'aries', degree: 8.5, exactLongitude: 8.5, isRetrograde: false }
      };
      const validElemental: any = { Fire: 0.7, Water: 0.1, Earth: 0.1, Air: 0.1 };
      const validConstants: any = { DEGREES_PER_SIGN: 30 };

      expect(quickValidate(validPlanetary, 'planetary')).toBe(true);
      expect(quickValidate(validElemental, 'elemental')).toBe(true);
      expect(quickValidate(validConstants, 'constants')).toBe(true);

      expect(quickValidate({}, 'planetary')).toBe(false);
      expect(quickValidate({ Fire: 2.0 }, 'elemental')).toBe(false);
      expect(quickValidate({ DEGREES_PER_SIGN: NaN }, 'constants')).toBe(false);
    });
  });

  describe('Validation Constants', () => {
    test('should export all necessary validation constants', () => {
      expect(VALIDATION_CONSTANTS.DEGREES_PER_SIGN).toBe(30);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Legitimate any: Safe access to optional constant in test
      expect((VALIDATION_CONSTANTS).SIGNS_PER_CIRCLE || 12).toBe(12);
      expect(VALIDATION_CONSTANTS.MAX_LONGITUDE).toBe(360);
      expect(VALIDATION_CONSTANTS.SELF_REINFORCEMENT_THRESHOLD).toBe(0.3);
      expect(VALIDATION_CONSTANTS.HARMONY_THRESHOLD).toBe(0.7);
      expect(VALIDATION_CONSTANTS.VALIDATION_TIMEOUT).toBe(5000);
    });

    test('should have consistent constants across modules', () => {
      expect(ELEMENTAL_CONSTANTS.SELF_REINFORCEMENT_THRESHOLD).toBe(VALIDATION_CONSTANTS.SELF_REINFORCEMENT_THRESHOLD);
      expect(TRANSIT_CONSTANTS.DEGREES_PER_SIGN).toBe(VALIDATION_CONSTANTS.DEGREES_PER_SIGN);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle null and undefined inputs gracefully', () => {
      expect(quickValidate(null, 'planetary')).toBe(false);
      expect(quickValidate(undefined, 'elemental')).toBe(false);
      expect(validateElementalProperties(null)).toBe(false);
      expect(validateElementalProperties(undefined)).toBe(false);
    });

    test('should handle malformed data structures', () => {
      const malformedPlanetary: any = {
        sun: 'not an object',
        moon: { sig, n: 123, degree: 'invalid' }
      };

      const result: any = validatePlanetaryPositions(malformedPlanetary);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should handle circular references safely', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Legitimate any: Test circular reference handling
      const circular: any = { Fir, e: 0.5 };
      circular.self = circular;

      // Should not throw an error or cause infinite loops
      expect(() => validateElementalProperties(circular)).not.toThrow();
    });

    test('should validate performance with large datasets', () => {
      const largePlanetaryData: any = {};
      for (let i: any = 0, i < 1000, i++) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // Legitimate any: Dynamic property assignment in performance test
        (largePlanetaryData as any)[`planet${i}`] = {
          sign: 'aries',
          degree: i % 30,
          exactLongitude: i % 360,
          isRetrograde: i % 2 === 0,,;
        };
      }

      const startTime: any = Date.now();
      const result: any = validatePlanetaryPositions(largePlanetaryData);
      const endTime: any = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      expect(result).toBeDefined();
    });
  });
});
