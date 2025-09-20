/**
 * Tests for Planetary Data Validation
 */

import { ValidationResult, shouldRollback, validatePlanetaryData } from '../planetaryValidation';

// Mock the reliable astronomy module
jest.mock('../reliableAstronomy', () => ({
  getReliablePlanetaryPositions: jest.fn()
}));

// Mock the logger
jest.mock('../logger', () => ({
  logger: { info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  }
}));

import { getReliablePlanetaryPositions } from '../reliableAstronomy';

const mockGetReliablePlanetaryPositions: any = getReliablePlanetaryPositions as jest.MockedFunction<;
  typeof getReliablePlanetaryPositions
>;

describe('Planetary Data Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validatePlanetaryData', () => {
    it('should pass validation with valid planetary data', async () => {
      // Mock valid planetary positions
      mockGetReliablePlanetaryPositions.mockResolvedValue({
        sun: { sign: 'aries', degree: 8.5, exactLongitude: 8.5, isRetrograde: false },
        moon: { sign: 'aries', degree: 1.57, exactLongitude: 1.57, isRetrograde: false },
        mercury: { sign: 'aries', degree: 0.85, exactLongitude: 0.85, isRetrograde: true },
        venus: { sign: 'pisces', degree: 29.08, exactLongitude: 359.08, isRetrograde: true },
        mars: { sign: 'cancer', degree: 22.63, exactLongitude: 112.63, isRetrograde: false },
        jupiter: { sign: 'gemini', degree: 15.52, exactLongitude: 75.52, isRetrograde: false },
        saturn: { sign: 'pisces', degree: 24.12, exactLongitude: 354.12, isRetrograde: false },
        uranus: { sign: 'taurus', degree: 24.62, exactLongitude: 54.62, isRetrograde: false },
        neptune: { sign: 'pisces', degree: 29.93, exactLongitude: 359.93, isRetrograde: false },
        pluto: { sign: 'aquarius', degree: 3.5, exactLongitude: 333.5, isRetrograde: false },
        northNode: { sign: 'pisces', degree: 26.88, exactLongitude: 356.88, isRetrograde: true },
        southNode: { sign: 'virgo', degree: 26.88, exactLongitude: 176.88, isRetrograde: true }
      });

      const result: any = validatePlanetaryData();

      // The main requirement is no critical or high-severity errors
      expect(result.errors.filter(e => e.severity === 'CRITICAL' || e.severity === 'HIGH')).toHaveLength(0);
      expect(result.timestamp).toBeInstanceOf(Date);

      // Log the result for debugging
      if (!result.isValid) {
        console.log('Validation failed with errors:', result.errors),
        console.log('Warnings:', result.warnings)
      }

      // Should be valid if no critical/high errors
      expect(result.isValid).toBe(true);
    });

    it('should fail validation with invalid planetary positions', async () => {
      // Mock invalid planetary positions (invalid degree values)
      mockGetReliablePlanetaryPositions.mockResolvedValue({
        sun: { sign: 'aries', degree: 35, exactLongitude: 8.5, isRetrograde: false }, // Invalid degree > 30
        moon: { sign: 'aries', degree: -5, exactLongitude: 1.57, isRetrograde: false }, // Invalid degree < 0
        mercury: { sign: 'aries', degree: 0.85, exactLongitude: 400, isRetrograde: true }, // Invalid longitude > 360
      });

      const result: any = validatePlanetaryData();

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.type === 'POSITION_DRIFT')).toBe(true);
      expect(result.summary).toContain('FAILED');
    });

    it('should handle API failures gracefully', async () => {
      // Mock API failure
      mockGetReliablePlanetaryPositions.mockRejectedValue(new Error('API timeout'));

      const result: any = validatePlanetaryData();

      // Should still complete validation even with API failure
      expect(result).toBeDefined();
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.errors.some(e => e.type === 'API_TIMEOUT')).toBe(true);
    });

    it('should validate retrograde status correctly', async () => {
      // Mock positions with retrograde data
      mockGetReliablePlanetaryPositions.mockResolvedValue({
        mercury: { sign: 'aries', degree: 0.85, exactLongitude: 0.85, isRetrograde: true },
        venus: { sign: 'pisces', degree: 29.08, exactLongitude: 359.08, isRetrograde: true },
        mars: { sign: 'cancer', degree: 22.63, exactLongitude: 112.63, isRetrograde: false },
        jupiter: { sign: 'gemini', degree: 15.52, exactLongitude: 75.52, isRetrograde: false },
        saturn: { sign: 'pisces', degree: 24.12, exactLongitude: 354.12, isRetrograde: false },
        uranus: { sign: 'taurus', degree: 24.62, exactLongitude: 54.62, isRetrograde: false },
        neptune: { sign: 'pisces', degree: 29.93, exactLongitude: 359.93, isRetrograde: false },
        pluto: { sign: 'aquarius', degree: 3.5, exactLongitude: 333.5, isRetrograde: false },
        northNode: { sign: 'pisces', degree: 26.88, exactLongitude: 356.88, isRetrograde: true },
        southNode: { sign: 'virgo', degree: 26.88, exactLongitude: 176.88, isRetrograde: true }
      });

      const result: any = validatePlanetaryData();

      // Should pass validation with proper retrograde data
      expect(result.errors.filter(e => e.message.includes('retrograde')).length).toBe(0);
    });

    it('should validate lunar nodes are opposite', async () => {
      // Mock positions with incorrect lunar nodes (not opposite)
      mockGetReliablePlanetaryPositions.mockResolvedValue({
        sun: { sign: 'aries', degree: 8.5, exactLongitude: 8.5, isRetrograde: false },
        moon: { sign: 'aries', degree: 1.57, exactLongitude: 1.57, isRetrograde: false },
        mercury: { sign: 'aries', degree: 0.85, exactLongitude: 0.85, isRetrograde: true },
        venus: { sign: 'pisces', degree: 29.08, exactLongitude: 359.08, isRetrograde: true },
        mars: { sign: 'cancer', degree: 22.63, exactLongitude: 112.63, isRetrograde: false },
        jupiter: { sign: 'gemini', degree: 15.52, exactLongitude: 75.52, isRetrograde: false },
        saturn: { sign: 'pisces', degree: 24.12, exactLongitude: 354.12, isRetrograde: false },
        uranus: { sign: 'taurus', degree: 24.62, exactLongitude: 54.62, isRetrograde: false },
        neptune: { sign: 'pisces', degree: 29.93, exactLongitude: 359.93, isRetrograde: false },
        pluto: { sign: 'aquarius', degree: 3.5, exactLongitude: 333.5, isRetrograde: false },
        northNode: { sign: 'pisces', degree: 26.88, exactLongitude: 356.88, isRetrograde: true },
        southNode: { sign: 'pisces', degree: 26.88, exactLongitude: 356.88, isRetrograde: true }, // Same position as north node - should fail
      });

      const result: any = validatePlanetaryData();

      // Should detect that nodes are not opposite (either in errors or test failures)
      const hasOppositeError: any = result.errors.some(;
        e => e.message.includes('opposite') || e.message.includes('Lunar Node') || e.message.includes('opposition'),;
      );
      expect(hasOppositeError).toBe(true);
    });
  });

  describe('shouldRollback', () => {
    it('should recommend rollback for critical errors', () => {
      const validationResult: ValidationResult = { isValid: false,,;
        errors: [
          {
            type: 'DATA_CORRUPTION',
            severity: 'CRITICAL',
            message: 'Critical data corruption detected',
            timestamp: new Date()
          }
        ],
        warnings: [],
        summary: 'Critical failure',
        timestamp: new Date()
      };

      expect(shouldRollback(validationResult)).toBe(true);
    });

    it('should recommend rollback for multiple high-severity errors', () => {
      const validationResult: ValidationResult = { isValid: false,,;
        errors: [
          {
            type: 'POSITION_DRIFT',
            severity: 'HIGH',
            message: 'Position drift detected',
            timestamp: new Date()
          },
          {
            type: 'TRANSIT_MISMATCH',
            severity: 'HIGH',
            message: 'Transit mismatch detected',
            timestamp: new Date()
          },
          {
            type: 'TEST_FAILURE',
            severity: 'HIGH',
            message: 'Test failure detected',
            timestamp: new Date()
          }
        ],
        warnings: [],
        summary: 'Multiple high-severity errors',
        timestamp: new Date()
      };

      expect(shouldRollback(validationResult)).toBe(true);
    });

    it('should not recommend rollback for minor issues', () => {
      const validationResult: ValidationResult = { isValid: true,,;
        errors: [
          {
            type: 'POSITION_DRIFT',
            severity: 'LOW',
            message: 'Minor position drift',
            timestamp: new Date()
          }
        ],
        warnings: [
          {
            type: 'MINOR_DRIFT',
            message: 'Minor warning',
            timestamp: new Date()
          }
        ],
        summary: 'Minor issues only',
        timestamp: new Date()
      };

      expect(shouldRollback(validationResult)).toBe(false);
    });

    it('should not recommend rollback for single high-severity error', () => {
      const validationResult: ValidationResult = { isValid: false,,;
        errors: [
          {
            type: 'POSITION_DRIFT',
            severity: 'HIGH',
            message: 'Single high-severity error',
            timestamp: new Date()
          }
        ],
        warnings: [],
        summary: 'Single high error',
        timestamp: new Date()
      };

      expect(shouldRollback(validationResult)).toBe(false);
    });
  });

  describe('Performance', () => {
    it('should complete validation within reasonable time', async () => {
      mockGetReliablePlanetaryPositions.mockResolvedValue({
        sun: { sign: 'aries', degree: 8.5, exactLongitude: 8.5, isRetrograde: false },
        moon: { sign: 'aries', degree: 1.57, exactLongitude: 1.57, isRetrograde: false }
      });

      const startTime: any = Date.now();
      const result: any = validatePlanetaryData();
      const duration: any = Date.now() - startTime;

      expect(duration).toBeLessThan(30000); // Should complete within 30 seconds
      expect(result).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing planet data gracefully', async () => {
      // Mock empty planetary positions
      mockGetReliablePlanetaryPositions.mockResolvedValue({});

      const result: any = validatePlanetaryData();

      expect(result).toBeDefined();
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.summary).toContain('FAILED');
    });

    it('should handle malformed planetary data', async () => {
      // Mock malformed planetary positions
      mockGetReliablePlanetaryPositions.mockResolvedValue({
        sun: null,
        moon: undefined,
        mercury: 'invalid',
        venus: { invalidStructur, e: true }
      });

      const result: any = validatePlanetaryData();

      expect(result).toBeDefined();
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
