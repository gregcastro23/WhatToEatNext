/**
 * Comprehensive Tests for Astrological ESLint Rules
 *
 * Tests the custom ESLint plugin rules for astrological calculations
 * to ensure they properly validate planetary positions, elemental properties,
 * and transit date validation patterns.
 */

import { ESLint } from 'eslint';

describe('Astrological ESLint Rules', () => {
  let eslint: ESLint;

  beforeAll(() => {
    // Create ESLint instance with our custom rules
    eslint = new ESLint({
      baseConfig: {
        languageOptions: {
          ecmaVersion: 2022,
          sourceType: 'module',
          parser: require('@typescript-eslint/parser'),
          parserOptions: {
            ecmaFeatures: {
              jsx: true,
            },
          },
        },
        plugins: {
          astrological: require('../../eslint-plugins/astrological-rules.cjs'),
        },
        rules: {
          'astrological/preserve-planetary-constants': 'error',
          'astrological/validate-planetary-position-structure': 'error',
          'astrological/validate-elemental-properties': 'error',
          'astrological/require-transit-date-validation': 'warn',
          'astrological/preserve-fallback-values': 'error',
        },
      },
      useEslintrc: false,
    });
  });

  describe('preserve-planetary-constants rule', () => {
    test('should error when modifying protected constants', async () => {
      const code = `
        const DEGREES_PER_SIGN = 30;
        DEGREES_PER_SIGN = 25; // This should error
      `;

      const results = eslint.lintText(code, { filePath: 'test.ts' });
      const messages = results[0].messages;

      expect(messages).toHaveLength(1);
      expect(messages[0].ruleId).toBe('astrological/preserve-planetary-constants');
      expect(messages[0].message).toContain('should not be modified');
    });

    test('should error when modifying constant object properties', async () => {
      const code = `
        const RELIABLE_POSITIONS = { sun: { sign: 'aries' } };
        RELIABLE_POSITIONS.sun = { sign: 'taurus' }; // This should error
      `;

      const results = eslint.lintText(code, { filePath: 'test.ts' });
      const messages = results[0].messages;

      expect(messages).toHaveLength(1);
      expect(messages[0].ruleId).toBe('astrological/preserve-planetary-constants');
      expect(messages[0].message).toContain('should not be modified');
    });

    test('should error when using update operators on constants', async () => {
      const code = `
        let MAX_LONGITUDE = 360;
        MAX_LONGITUDE++; // This should error
      `;

      const results = eslint.lintText(code, { filePath: 'test.ts' });
      const messages = results[0].messages;

      expect(messages).toHaveLength(1);
      expect(messages[0].ruleId).toBe('astrological/preserve-planetary-constants');
      expect(messages[0].message).toContain('should not be modified');
    });

    test('should allow using constants without modification', async () => {
      const code = `
        const DEGREES_PER_SIGN = 30;
        const angle = DEGREES_PER_SIGN * 2; // This should be fine
        console.log(RELIABLE_POSITIONS.sun.sign); // This should be fine
      `;

      const results = eslint.lintText(code, { filePath: 'test.ts' });
      const messages = results[0].messages;

      expect(messages).toHaveLength(0);
    });
  });

  describe('validate-planetary-position-structure rule', () => {
    test('should error when planetary position missing required properties', async () => {
      const code = `
        const position = {
          sign: 'aries',
          degree: 15
          // Missing exactLongitude and isRetrograde
        };
      `;

      const results = eslint.lintText(code, { filePath: 'test.ts' });
      const messages = results[0].messages;

      expect(messages).toHaveLength(1);
      expect(messages[0].ruleId).toBe('astrological/validate-planetary-position-structure');
      expect(messages[0].message).toContain('missing required properties');
      expect(messages[0].message).toContain('exactLongitude');
      expect(messages[0].message).toContain('isRetrograde');
    });

    test('should pass when planetary position has all required properties', async () => {
      const code = `
        const position = {
          sign: 'aries',
          degree: 15.5,
          exactLongitude: 15.5,
          isRetrograde: false
        };
      `;

      const results = eslint.lintText(code, { filePath: 'test.ts' });
      const messages = results[0].messages;

      expect(messages).toHaveLength(0);
    });

    test('should not flag non-planetary objects', async () => {
      const code = `
        const UNUSED_config = {
          timeout: 5000,
          retries: 3
        };

        const UNUSED_user = {
          name: 'John',
          age: 30
        };
      `;

      const results = eslint.lintText(code, { filePath: 'test.ts' });
      const messages = results[0].messages;

      expect(messages).toHaveLength(0);
    });
  });

  describe('validate-elemental-properties rule', () => {
    test('should error when elemental properties missing required elements', async () => {
      const code = `
        const properties = {
          Fire: 0.8,
          Water: 0.2
          // Missing Earth and Air
        };
      `;

      const results = eslint.lintText(code, { filePath: 'test.ts' });
      const messages = results[0].messages;

      expect(messages).toHaveLength(1);
      expect(messages[0].ruleId).toBe('astrological/validate-elemental-properties');
      expect(messages[0].message).toContain('missing required elements');
      expect(messages[0].message).toContain('Earth');
      expect(messages[0].message).toContain('Air');
    });

    test('should error when using invalid element names', async () => {
      const code = `
        const properties = {
          Fire: 0.5,
          Water: 0.3,
          Earth: 0.1,
          Wind: 0.1 // Should be Air
        };
      `;

      const results = eslint.lintText(code, { filePath: 'test.ts' });
      const messages = results[0].messages;

      expect(messages).toHaveLength(1);
      expect(messages[0].ruleId).toBe('astrological/validate-elemental-properties');
      expect(messages[0].message).toContain('Invalid element names');
      expect(messages[0].message).toContain('Wind');
    });

    test('should error when element values are out of range', async () => {
      const code = `
        const properties = {
          Fire: 1.5, // Too high
          Water: -0.1, // Too low
          Earth: 0.3,
          Air: 0.2
        };
      `;

      const results = eslint.lintText(code, { filePath: 'test.ts' });
      const messages = results[0].messages;

      expect(messages).toHaveLength(2);
      expect(messages.some(m => m.message.includes('1.5'))).toBe(true);
      expect(messages.some(m => m.message.includes('-0.1'))).toBe(true);
    });

    test('should pass when elemental properties are valid', async () => {
      const code = `
        const properties = {
          Fire: 0.7,
          Water: 0.1,
          Earth: 0.1,
          Air: 0.1
        };
      `;

      const results = eslint.lintText(code, { filePath: 'test.ts' });
      const messages = results[0].messages;

      expect(messages).toHaveLength(0);
    });
  });

  describe('require-transit-date-validation rule', () => {
    test('should warn when astrological file lacks validation import', async () => {
      const code = `
        // This is in a calculations file but has no validation
        function calculatePlanetaryInfluence() {
          return { influence: 0.8 };
        }
      `;

      const results = eslint.lintText(code, {
        filePath: 'src/calculations/planetary.ts',
      });
      const messages = results[0].messages;

      expect(messages).toHaveLength(1);
      expect(messages[0].ruleId).toBe('astrological/require-transit-date-validation');
      expect(messages[0].message).toContain('should import transit validation utilities');
    });

    test('should warn when validation is imported but not used', async () => {
      const code = `
        import { validateTransitDate } from '@/utils/astrology/transitValidation';

        function calculatePlanetaryInfluence() {
          // Validation imported but not called
          return { influence: 0.8 };
        }
      `;

      const results = eslint.lintText(code, {
        filePath: 'src/calculations/planetary.ts',
      });
      const messages = results[0].messages;

      expect(messages).toHaveLength(1);
      expect(messages[0].ruleId).toBe('astrological/require-transit-date-validation');
      expect(messages[0].message).toContain('Consider adding transit date validation calls');
    });

    test('should pass when validation is properly used', async () => {
      const code = `
        import { validateTransitDate } from '@/utils/astrology/transitValidation';

        function calculatePlanetaryInfluence(planet, date) {
          const isValid = validateTransitDate(planet, date, 'aries', transitDates);
          return { influence: isValid ? 0.8 : 0.5 };
        }
      `;

      const results = eslint.lintText(code, {
        filePath: 'src/calculations/planetary.ts',
      });
      const messages = results[0].messages;

      expect(messages).toHaveLength(0);
    });

    test('should not flag non-astrological files', async () => {
      const code = `
        function regularFunction() {
          return { result: 'success' };
        }
      `;

      const results = eslint.lintText(code, {
        filePath: 'src/components/Button.tsx',
      });
      const messages = results[0].messages;

      expect(messages).toHaveLength(0);
    });
  });

  describe('preserve-fallback-values rule', () => {
    test('should error when fallback variable assigned null', async () => {
      const code = `
        let FALLBACK_POSITIONS = null; // This should error
        const RELIABLE_DATA = undefined; // This should error
      `;

      const results = eslint.lintText(code, { filePath: 'test.ts' });
      const messages = results[0].messages;

      expect(messages).toHaveLength(2);
      expect(messages[0].ruleId).toBe('astrological/preserve-fallback-values');
      expect(messages[1].ruleId).toBe('astrological/preserve-fallback-values');
      expect(messages.some(m => m.message.includes('FALLBACK_POSITIONS'))).toBe(true);
      expect(messages.some(m => m.message.includes('RELIABLE_DATA'))).toBe(true);
    });

    test('should error when fallback variable reassigned to null', async () => {
      const code = `
        let MARCH2025_POSITIONS = { sun: { sign: 'aries' } };
        MARCH2025_POSITIONS = null; // This should error
      `;

      const results = eslint.lintText(code, { filePath: 'test.ts' });
      const messages = results[0].messages;

      expect(messages).toHaveLength(1);
      expect(messages[0].ruleId).toBe('astrological/preserve-fallback-values');
      expect(messages[0].message).toContain('should not be assigned null');
    });

    test('should allow valid fallback assignments', async () => {
      const code = `
        const FALLBACK_POSITIONS = {
          sun: { sign: 'aries', degree: 8.5 }
        };

        let RELIABLE_DATA = getReliableData
        RELIABLE_DATA = { updated: true };
      `;

      const results = eslint.lintText(code, { filePath: 'test.ts' });
      const messages = results[0].messages;

      expect(messages).toHaveLength(0);
    });

    test('should not flag non-fallback variables', async () => {
      const code = `
        let regularVariable = null;
        const anotherVar = undefined;
        regularVariable = null;
      `;

      const results = eslint.lintText(code, { filePath: 'test.ts' });
      const messages = results[0].messages;

      expect(messages).toHaveLength(0);
    });
  });

  describe('Integration with existing ESLint configuration', () => {
    test('should work with TypeScript files', async () => {
      const code = `
        interface PlanetaryPosition {
          sign: string;
          degree: number;
          exactLongitude: number;
          isRetrograde: boolean;
        }

        const position: PlanetaryPosition = {
          sign: 'aries',
          degree: 15.5,
          exactLongitude: 15.5,
          isRetrograde: false
        };
      `;

      const results = eslint.lintText(code, { filePath: 'test.ts' });
      const messages = results[0].messages;

      expect(messages).toHaveLength(0);
    });

    test('should work with React components', async () => {
      const code = `
        import React from 'react';

        interface Props {
          elementalProperties: {
            Fire: number;
            Water: number;
            Earth: number;
            Air: number;
          };
        }

        const ElementalDisplay: React.FC<Props> = ({ elementalProperties }) => {
          return <div>Elemental display</div>;
        };
      `;

      const results = eslint.lintText(code, { filePath: 'test.tsx' });
      const messages = results[0].messages;

      expect(messages).toHaveLength(0);
    });
  });

  describe('Rule performance and edge cases', () => {
    test('should handle large files efficiently', async () => {
      const largeCode = `
        ${Array(100)
          .fill(0)
          .map(
            (_, i) => `
          const position${i} = {
            sign: 'aries',
            degree: ${i},
            exactLongitude: ${i},
            isRetrograde: false
          };
        `,
          )
          .join('\n')}
      `;

      const startTime = Date.now();
      const results = eslint.lintText(largeCode, { filePath: 'test.ts' });
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      expect(results[0].messages).toHaveLength(0);
    });

    test('should handle malformed code gracefully', async () => {
      const malformedCode = `
        const incomplete = {
          sign: 'aries'
          // Missing comma and closing brace
      `;

      // This should not throw an error, even with malformed code
      const results = eslint.lintText(malformedCode, { filePath: 'test.ts' });

      // ESLint should handle syntax errors, our rules should not crash
      expect(results).toBeDefined();
    });

    test('should handle nested objects correctly', async () => {
      const code = `
        const UNUSED_planetData = {
          mercury: {
            position: {
              sign: 'gemini',
              degree: 10.5,
              exactLongitude: 70.5,
              isRetrograde: true
            },
            properties: {
              Fire: 0.3,
              Water: 0.2,
              Earth: 0.2,
              Air: 0.3
            }
          }
        };
      `;

      const results = eslint.lintText(code, { filePath: 'test.ts' });
      const messages = results[0].messages;

      expect(messages).toHaveLength(0);
    });
  });
});
