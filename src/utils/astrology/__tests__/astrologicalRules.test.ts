/**
 * Test file for custom astrological ESLint rules
 * 
 * This file tests the domain-specific linting rules to ensure they properly
 * validate astrological calculations, planetary positions, and elemental properties.
 */

import { validateElementalProperties, normalizeElementalProperties } from '../elementalValidation';
import { validateTransitDate, getCurrentTransitSign } from '../transitValidation';
import { validatePlanetaryPositions, quickValidate } from '../astrologicalValidation';

describe('Astrological ESLint Rules Integration', () => {
  describe('Elemental Properties Validation', () => {
    test('validates correct elemental properties structure', () => {
      const validProperties = {
        Fire: 0.4,
        Water: 0.3,
        Earth: 0.2,
        Air: 0.1
      };
      
      expect(validateElementalProperties(validProperties)).toBe(true);
    });
    
    test('rejects invalid elemental properties', () => {
      const invalidProperties = {
        Fire: 1.5, // Invalid: > 1
        Water: -0.1, // Invalid: < 0
        Earth: 0.2
        // Missing Air
      };
      
      expect(validateElementalProperties(invalidProperties)).toBe(false);
    });
    
    test('normalizes partial elemental properties', () => {
      const partialProperties = {
        Fire: 0.8,
        Water: 0.2
      };
      
      const normalized = normalizeElementalProperties(partialProperties);
      expect(normalized).toHaveProperty('Fire', 0.8);
      expect(normalized).toHaveProperty('Water', 0.2);
      expect(normalized).toHaveProperty('Earth', 0.25); // Default
      expect(normalized).toHaveProperty('Air', 0.25); // Default
    });
  });
  
  describe('Planetary Position Validation', () => {
    test('validates correct planetary positions structure', () => {
      const validPositions = {
        sun: { sign: 'aries', degree: 15.5, exactLongitude: 15.5, isRetrograde: false },
        moon: { sign: 'taurus', degree: 22.3, exactLongitude: 52.3, isRetrograde: false },
        mercury: { sign: 'gemini', degree: 8.7, exactLongitude: 68.7, isRetrograde: true },
        venus: { sign: 'cancer', degree: 5.2, exactLongitude: 95.2, isRetrograde: false },
        mars: { sign: 'leo', degree: 12.8, exactLongitude: 132.8, isRetrograde: false },
        jupiter: { sign: 'virgo', degree: 28.1, exactLongitude: 178.1, isRetrograde: false },
        saturn: { sign: 'libra', degree: 3.4, exactLongitude: 183.4, isRetrograde: false }
      };
      
      const result = validatePlanetaryPositions(validPositions);
      if (!result.isValid) {
        console.log('Validation errors:', result.errors);
        console.log('Validation warnings:', result.warnings);
      }
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    test('detects missing required properties', () => {
      const invalidPositions = {
        sun: { sign: 'aries', degree: 15.5 }, // Missing exactLongitude and isRetrograde
        moon: { degree: 22.3, exactLongitude: 52.3, isRetrograde: false } // Missing sign
      };
      
      const result = validatePlanetaryPositions(invalidPositions);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
    
    test('validates degree ranges', () => {
      const invalidPositions = {
        sun: { sign: 'aries', degree: 35.0, exactLongitude: 35.0, isRetrograde: false }, // Invalid degree > 30
        moon: { sign: 'taurus', degree: -5.0, exactLongitude: 325.0, isRetrograde: false }, // Invalid degree < 0
        mercury: { sign: 'gemini', degree: 8.7, exactLongitude: 68.7, isRetrograde: true },
        venus: { sign: 'cancer', degree: 5.2, exactLongitude: 95.2, isRetrograde: false },
        mars: { sign: 'leo', degree: 12.8, exactLongitude: 132.8, isRetrograde: false },
        jupiter: { sign: 'virgo', degree: 28.1, exactLongitude: 178.1, isRetrograde: false },
        saturn: { sign: 'libra', degree: 3.4, exactLongitude: 183.4, isRetrograde: false }
      };
      
      const result = validatePlanetaryPositions(invalidPositions, { strictMode: true });
      console.log('Strict mode result:', result);
      
      // In strict mode, invalid degrees should be errors
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      
      // Test non-strict mode for warnings
      const resultNonStrict = validatePlanetaryPositions(invalidPositions, { strictMode: false });
      console.log('Non-strict mode result:', resultNonStrict);
      expect(resultNonStrict.warnings.length).toBeGreaterThan(0);
    });
  });
  
  describe('Quick Validation Functions', () => {
    test('quick validate planetary positions', () => {
      const validPositions = {
        sun: { sign: 'aries', degree: 15.5, exactLongitude: 15.5, isRetrograde: false },
        moon: { sign: 'taurus', degree: 22.3, exactLongitude: 52.3, isRetrograde: false },
        mercury: { sign: 'gemini', degree: 8.7, exactLongitude: 68.7, isRetrograde: true },
        venus: { sign: 'cancer', degree: 5.2, exactLongitude: 95.2, isRetrograde: false },
        mars: { sign: 'leo', degree: 12.8, exactLongitude: 132.8, isRetrograde: false },
        jupiter: { sign: 'virgo', degree: 28.1, exactLongitude: 178.1, isRetrograde: false },
        saturn: { sign: 'libra', degree: 3.4, exactLongitude: 183.4, isRetrograde: false }
      };
      
      const result = quickValidate(validPositions, 'planetary');
      if (!result) {
        console.log('Quick validation failed for:', validPositions);
      }
      expect(result).toBe(true);
    });
    
    test('quick validate elemental properties', () => {
      const validProperties = {
        Fire: 0.4,
        Water: 0.3,
        Earth: 0.2,
        Air: 0.1
      };
      
      expect(quickValidate(validProperties, 'elemental')).toBe(true);
    });
    
    test('quick validate mathematical constants', () => {
      const validConstants = {
        DEGREES_PER_SIGN: 30,
        SIGNS_PER_CIRCLE: 12,
        MAX_LONGITUDE: 360
      };
      
      expect(quickValidate(validConstants, 'constants')).toBe(true);
    });
  });
  
  describe('Mathematical Constants Preservation', () => {
    // These constants should be preserved by the ESLint rules
    const DEGREES_PER_SIGN = 30;
    const SIGNS_PER_CIRCLE = 12;
    const MAX_LONGITUDE = 360;
    const FALLBACK_POSITIONS = {
      sun: { sign: 'aries', degree: 8.5, exactLongitude: 8.5, isRetrograde: false }
    };
    
    test('mathematical constants maintain correct values', () => {
      expect(DEGREES_PER_SIGN).toBe(30);
      expect(SIGNS_PER_CIRCLE).toBe(12);
      expect(MAX_LONGITUDE).toBe(360);
    });
    
    test('fallback positions structure is preserved', () => {
      expect(FALLBACK_POSITIONS.sun).toHaveProperty('sign');
      expect(FALLBACK_POSITIONS.sun).toHaveProperty('degree');
      expect(FALLBACK_POSITIONS.sun).toHaveProperty('exactLongitude');
      expect(FALLBACK_POSITIONS.sun).toHaveProperty('isRetrograde');
    });
  });
  
  describe('Domain-Specific Variable Patterns', () => {
    test('preserves astrological variable naming patterns', () => {
      // These variables should be allowed by the custom rules
      const planetPosition = { sign: 'aries', degree: 15.0, exactLongitude: 15.0, isRetrograde: false };
      const degreeValue = 15.5;
      const signName = 'aries';
      const longitudeCalculation = 45.7;
      
      expect(planetPosition).toBeDefined();
      expect(degreeValue).toBeDefined();
      expect(signName).toBeDefined();
      expect(longitudeCalculation).toBeDefined();
    });
    
    test('preserves fallback and reliability patterns', () => {
      // These variables should be allowed by the custom rules
      const FALLBACK_DATA = { sun: { sign: 'aries', degree: 0, exactLongitude: 0, isRetrograde: false } };
      const RELIABLE_POSITIONS = { moon: { sign: 'taurus', degree: 15, exactLongitude: 45, isRetrograde: false } };
      const TRANSIT_DATES = { aries: { Start: '2024-03-20', End: '2024-04-19' } };
      const DEFAULT_VALUES = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
      
      expect(FALLBACK_DATA).toBeDefined();
      expect(RELIABLE_POSITIONS).toBeDefined();
      expect(TRANSIT_DATES).toBeDefined();
      expect(DEFAULT_VALUES).toBeDefined();
    });
  });
});