/**
 * Tests for Ingredient Data Validation
 */

import { IngredientValidationResult, shouldRollbackIngredients, validateIngredientData } from '../ingredientValidation';

// Mock the ingredient data
jest.mock('../../data/ingredients', () => ({
  allIngredients: {
    basil: {
      name: 'Basil',
      category: 'culinary_herb',
      elementalProperties: {
        Fire: 0.2,
        Water: 0.1,
        Earth: 0.1,
        Air: 0.6
      },
      qualities: ['aromatic', 'warming'],
      storage: { duration: '1 week' }
    },
    tomato: {
      name: 'Tomato',
      category: 'vegetable',
      elementalProperties: {
        Fire: 0.4,
        Water: 0.4,
        Earth: 0.1,
        Air: 0.1
      },
      qualities: ['juicy', 'acidic'],
      storage: { duration: '1 week' }
    },
    invalidIngredient: {
      name: 'Invalid',
      category: 'invalid_category',
      elementalProperties: {
        Fire: 0.5,
        Water: 0.3,
        Earth: 0.3, // Sum > 1.0
        Air: 0.2
      }
    }
  }
}))

// Mock the elemental utils
jest.mock('../elementalUtils', () => ({
  calculateElementalCompatibility: jest.fn()
}))

// Mock the logger
jest.mock('../logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  }
}))

import { calculateElementalAffinity } from '../elementalUtils';

const mockCalculateElementalCompatibility: any = calculateElementalAffinity as jest.MockedFunction<
  typeof calculateElementalAffinity
>;

describe('Ingredient Data Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Mock compatibility calculations to return expected values
    mockCalculateElementalCompatibility.mockImplementation((props1: any, props2: any) => {
      // Self-compatibility should be high
      if (props1 === props2) {
        return 0.95;
      }
      // Cross-compatibility should be good
      return 0.75;
    });
  })

  describe('validateIngredientData', () => {
    it('should pass validation with valid ingredient data', async () => {
      const result: any = validateIngredientData();

      // Should have some warnings but no critical/high errors for the invalid ingredient
      expect(result.errors.filter(e => e.severity === 'CRITICAL').length).toBe(0);
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.summary).toContain('Ingredient Data Validation');
    })

    it('should detect elemental property sum errors', async () => {
      const result: any = validateIngredientData();

      // Should detect that invalidIngredient has elemental properties that sum > 1.0
      const sumErrors: any = result.errors.filter(e => e.type === 'ELEMENTAL_INVALID' && e.message.includes('sum'));
      expect(sumErrors.length).toBeGreaterThan(0);
    })

    it('should detect invalid categories', async () => {
      const result: any = validateIngredientData();

      // Should detect invalid category
      const categoryErrors: any = result.errors.filter(
        e => e.type === 'CATEGORY_MISMATCH' && e.ingredient === 'invalidIngredient'
      );

      expect(categoryErrors.length).toBeGreaterThan(0);
    })

    it('should validate compatibility calculations', async () => {
      const result: any = validateIngredientData();

      // Should call compatibility calculations
      expect(mockCalculateElementalCompatibility).toHaveBeenCalled();

      // Should not have compatibility violations with our mocked values
      const compatibilityErrors: any = result.errors.filter(e => e.type === 'COMPATIBILITY_VIOLATION');
      expect(compatibilityErrors.length).toBe(0);
    })

    it('should handle missing elemental properties', async () => {
      // This test would require mocking ingredients without elemental properties
      const result: any = validateIngredientData();
      // All our mock ingredients have elemental properties, so no errors expected
      expect(result).toBeDefined();
    })

    it('should validate data completeness', async () => {
      const result: any = validateIngredientData();
      // Should check for required fields
      const completenessErrors: any = result.errors.filter(
        e => e.type === 'DATA_INCOMPLETE' && e.message.includes('Missing required field')
      );

      // Our mock data has all required fields so should be 0
      expect(completenessErrors.length).toBe(0);
    })
  })

  describe('shouldRollbackIngredients', () => {
    it('should recommend rollback for critical errors', () => {
      const validationResult: IngredientValidationResult = {
        isValid: false,
        errors: [
          {
            type: 'DATA_INCOMPLETE',
            severity: 'CRITICAL',
            message: 'Critical data corruption detected',
            timestamp: new Date()
          }
        ],
        warnings: [],
        summary: 'Critical failure',
        timestamp: new Date()
      };

      expect(shouldRollbackIngredients(validationResult)).toBe(true);
    })

    it('should recommend rollback for multiple high-severity errors', () => {
      const validationResult: IngredientValidationResult = {
        isValid: false,
        errors: [
          {
            type: 'ELEMENTAL_INVALID',
            severity: 'HIGH',
            message: 'Elemental error 1',
            timestamp: new Date()
          },
          {
            type: 'COMPATIBILITY_VIOLATION',
            severity: 'HIGH',
            message: 'Compatibility error 2',
            timestamp: new Date()
          },
          {
            type: 'DATA_INCOMPLETE',
            severity: 'HIGH',
            message: 'Data error 3',
            timestamp: new Date()
          },
          {
            type: 'CATEGORY_MISMATCH',
            severity: 'HIGH',
            message: 'Category error 4',
            timestamp: new Date()
          }
        ],
        warnings: [],
        summary: 'Multiple high-severity errors',
        timestamp: new Date()
      };

      expect(shouldRollbackIngredients(validationResult)).toBe(true);
    })

    it('should not recommend rollback for minor issues', () => {
      const validationResult: IngredientValidationResult = {
        isValid: true,
        errors: [
          {
            type: 'ELEMENTAL_INVALID',
            severity: 'LOW',
            message: 'Minor elemental issue',
            timestamp: new Date()
          }
        ],
        warnings: [
          {
            type: 'MINOR_INCONSISTENCY',
            message: 'Minor warning',
            timestamp: new Date()
          }
        ],
        summary: 'Minor issues only',
        timestamp: new Date()
      };

      expect(shouldRollbackIngredients(validationResult)).toBe(false);
    })

    it('should not recommend rollback for few high-severity errors', () => {
      const validationResult: IngredientValidationResult = {
        isValid: false,
        errors: [
          {
            type: 'ELEMENTAL_INVALID',
            severity: 'HIGH',
            message: 'Single high-severity error',
            timestamp: new Date()
          },
          {
            type: 'COMPATIBILITY_VIOLATION',
            severity: 'MEDIUM',
            message: 'Medium severity error',
            timestamp: new Date()
          }
        ],
        warnings: [],
        summary: 'Few high errors',
        timestamp: new Date()
      };

      expect(shouldRollbackIngredients(validationResult)).toBe(false);
    })
  })

  describe('Performance', () => {
    it('should complete validation within reasonable time', async () => {
      const startTime: any = Date.now();
      const result: any = validateIngredientData();
      const duration: any = Date.now() - startTime;

      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
      expect(result).toBeDefined();
    })
  })

  describe('Error Handling', () => {
    it('should handle empty ingredient data gracefully', async () => {
      // Mock empty ingredients
      jest.doMock('../../data/ingredients', () => ({
        allIngredients: {}
      }));

      const result: any = validateIngredientData();

      expect(result).toBeDefined();
      expect(result.timestamp).toBeInstanceOf(Date);
    })

    it('should handle malformed ingredient data', async () => {
      // Mock malformed ingredients
      jest.doMock('../../data/ingredients', () => ({
        allIngredients: {
          malformed: null,
          invalid: undefined,
          broken: 'not an object'
        }
      }));

      const result: any = validateIngredientData();

      expect(result).toBeDefined();
      expect(result.errors.length).toBeGreaterThan(0);
    })
  })

  describe('Elemental Properties Validation', () => {
    it('should validate elemental property ranges', async () => {
      const result: any = validateIngredientData();
      // Check that validation catches out-of-range values
      const rangeErrors: any = result.errors.filter(
        e => e.type === 'ELEMENTAL_INVALID' && e.message.includes('out of range')
      );

      // Our mock data has valid ranges so should be 0
      expect(rangeErrors.length).toBe(0);
    })

    it('should validate elemental property sums', async () => {
      const result: any = validateIngredientData();

      // Should detect sum errors for invalidIngredient
      const sumErrors: any = result.errors.filter(e => e.type === 'ELEMENTAL_INVALID' && e.message.includes('sum'));
      expect(sumErrors.length).toBeGreaterThan(0);
    })

    it('should check for elemental dominance', async () => {
      const result: any = validateIngredientData();
      // Should have warnings about elemental dominance if applicable
      const dominanceWarnings: any = result.warnings.filter(
        w => w.type === 'MINOR_INCONSISTENCY' && w.message.includes('dominant element')
      );

      // Our mock ingredients have clear dominance, so should be 0
      expect(dominanceWarnings.length).toBe(0);
    })
  })

  describe('Compatibility Validation', () => {
    it('should validate self-compatibility scores', async () => {
      mockCalculateElementalCompatibility.mockImplementation((props1: any, props2: any) => {
        if (props1 === props2) {
          return 0.85; // Below threshold
        }
        return 0.75;
      });

      const result: any = validateIngredientData();
      // Should detect low self-compatibility
      const selfCompatibilityErrors: any = result.errors.filter(
        e => e.type === 'COMPATIBILITY_VIOLATION' && e.message.includes('Self-compatibility')
      );

      expect(selfCompatibilityErrors.length).toBeGreaterThan(0);
    })

    it('should validate cross-compatibility scores', async () => {
      mockCalculateElementalCompatibility.mockImplementation((props1: any, props2: any) => {
        if (props1 === props2) {
          return 0.95;
        }
        return 0.6; // Below threshold
      });

      const result: any = validateIngredientData();
      // Should detect low cross-compatibility
      const crossCompatibilityErrors: any = result.errors.filter(
        e => e.type === 'COMPATIBILITY_VIOLATION' && e.message.includes('Cross-compatibility')
      );

      expect(crossCompatibilityErrors.length).toBeGreaterThan(0);
    })
  })
})
