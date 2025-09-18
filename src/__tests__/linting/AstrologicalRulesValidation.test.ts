/* eslint-disable @typescript-eslint/no-explicit-any, no-console, @typescript-eslint/no-unused-vars, max-lines-per-function -- Campaign/test file with intentional patterns */
import type { } from 'jest';
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
      baseConfig: { languageOptions: {
          ecmaVersion: 2022,
          sourceType: 'module',
          parser: require('@typescript-eslint/parser'),
          parserOptions: { ecmaFeatures: {
              jsx: true
            }
          }
        },
        plugins: { astrological: require('../../eslint-plugins/astrological-rules.cjs')
        },
        rules: {
          'astrological/preserve-planetary-constants': 'error',
          'astrological/validate-planetary-position-structure': 'error',
          'astrological/validate-elemental-properties': 'error',
          'astrological/require-transit-date-validation': 'warn',
          'astrological/preserve-fallback-values': 'error'
        }
      },
      useEslintrc: false
    });
  });

  describe('preserve-planetary-constants rule', () => {
    test('should error when modifying protected constants', async () => {
      const code: any = `;
        const DEGREES_PER_SIGN: any = 30;
        DEGREES_PER_SIGN = 25; // This should error
      `;

      const results: any = eslint.lintText(code, { filePath: 'test.ts' });
      const messages: any = results[0].messages;

      expect(messages).toHaveLength(1);
      expect(messages[0].ruleId).toBe('astrological/preserve-planetary-constants');
      expect(messages[0].message).toContain('should not be modified');
    });

    test('should error when modifying constant object properties', async () => {
      const code: any = `;
        const RELIABLE_POSITIONS: any = { sun: { sign: 'aries' } };
        RELIABLE_POSITIONS.sun = { sign: 'taurus' }; // This should error
      `;

      const results: any = eslint.lintText(code, { filePath: 'test.ts' });
      const messages: any = results[0].messages;

      expect(messages).toHaveLength(1);
      expect(messages[0].ruleId).toBe('astrological/preserve-planetary-constants');
      expect(messages[0].message).toContain('should not be modified');
    });

    test('should error when using update operators on constants', async () => {
      const code: any = `;
        let MAX_LONGITUDE: any = 360;
        MAX_LONGITUDE++; // This should error
      `;

      const results: any = eslint.lintText(code, { filePath: 'test.ts' });
      const messages: any = results[0].messages;

      expect(messages).toHaveLength(1);
      expect(messages[0].ruleId).toBe('astrological/preserve-planetary-constants');
      expect(messages[0].message).toContain('should not be modified');
    });

    test('should allow using constants without modification', async () => {
      const code: any = `;
        const DEGREES_PER_SIGN: any = 30;
        const _angle: any = DEGREES_PER_SIGN * 2; // This should be fine
        console.log(RELIABLE_POSITIONS.sun.sign); // This should be fine
      `;

      const results: any = eslint.lintText(code, { filePath: 'test.ts' });
      const messages: any = results[0].messages;

      expect(messages).toHaveLength(0);
    });
  });

  describe('validate-planetary-position-structure rule', () => {
    test('should error when planetary position missing required properties', async () => {
      const code: any = `;
        const position = {
          sign: 'aries',
          degree: 15
          // Missing exactLongitude and isRetrograde
        };
      `;

      const results: any = eslint.lintText(code, { filePath: 'test.ts' });
      const messages: any = results[0].messages;

      expect(messages).toHaveLength(1);
      expect(messages[0].ruleId).toBe('astrological/validate-planetary-position-structure');
      expect(messages[0].message).toContain('missing required properties');
      expect(messages[0].message).toContain('exactLongitude');
      expect(messages[0].message).toContain('isRetrograde');
    });

    test('should pass when planetary position has all required properties', async () => {
      const code: any = `;
        const position = {
          sign: 'aries',
          degree: 15.5,
          exactLongitude: 15.5,
          isRetrograde: false
        };
      `;

      const results: any = eslint.lintText(code, { filePath: 'test.ts' });
      const messages: any = results[0].messages;

      expect(messages).toHaveLength(0);
    });

    test('should not flag non-planetary objects', async () => {
      const code: any = `;
        const _UNUSED_config = {
          timeout: 5000,
          retries: 3
        };

        const _UNUSED_user: any = {
          name: 'John',
          age: 30
        };
      `;

      const results: any = eslint.lintText(code, { filePath: 'test.ts' });
      const messages: any = results[0].messages;

      expect(messages).toHaveLength(0);
    });
  });

  describe('validate-elemental-properties rule', () => {
    test('should error when elemental properties missing required elements', async () => {
      const code: any = `;
        const properties = {
          Fire: 0.8,
          Water: 0.2
          // Missing Earth and Air
        };
      `;

      const results: any = eslint.lintText(code, { filePath: 'test.ts' });
      const messages: any = results[0].messages;

      expect(messages).toHaveLength(1);
      expect(messages[0].ruleId).toBe('astrological/validate-elemental-properties');
      expect(messages[0].message).toContain('missing required elements');
      expect(messages[0].message).toContain('Earth');
      expect(messages[0].message).toContain('Air');
    });

    test('should error when using invalid element names', async () => {
      const code: any = `;
        const properties = {
          Fire: 0.5,
          Water: 0.3,
          Earth: 0.1,
          Wind: 0.1 // Should be Air
        };
      `;

      const results: any = eslint.lintText(code, { filePath: 'test.ts' });
      const messages: any = results[0].messages;

      expect(messages).toHaveLength(1);
      expect(messages[0].ruleId).toBe('astrological/validate-elemental-properties');
      expect(messages[0].message).toContain('Invalid element names');
      expect(messages[0].message).toContain('Wind');
    });

    test('should error when element values are out of range', async () => {
      const code: any = `;
        const properties = {
          Fire: 1.5, // Too high
          Water: -0.1, // Too low
          Earth: 0.3,
          Air: 0.2
        };
      `;

      const results: any = eslint.lintText(code, { filePath: 'test.ts' });
      const messages: any = results[0].messages;

      expect(messages).toHaveLength(2);
      expect(messages.some(m => m.message.includes('1.5'))).toBe(true);
      expect(messages.some(m => m.message.includes('-0.1'))).toBe(true);
    });

    test('should pass when elemental properties are valid', async () => {
      const code: any = `;
        const properties = {
          Fire: 0.7,
          Water: 0.1,
          Earth: 0.1,
          Air: 0.1
        };
      `;

      const results: any = eslint.lintText(code, { filePath: 'test.ts' });
      const messages: any = results[0].messages;

      expect(messages).toHaveLength(0);
    });
  });

  describe('require-transit-date-validation rule', () => {
    test('should warn when astrological file lacks validation import', async () => {
      const code: any = `;
        // This is in a calculations file but has no validation
        function calculatePlanetaryInfluence(): any {
          return { influence: 0.8 };
        }
      `;

      const results: any = eslint.lintText(code, {
        filePath: 'src/calculations/planetary.ts'
      });
      const messages: any = results[0].messages;

      expect(messages).toHaveLength(1);
      expect(messages[0].ruleId).toBe('astrological/require-transit-date-validation');
      expect(messages[0].message).toContain('should import transit validation utilities');
    });

    test('should warn when validation is imported but not used', async () => {
      const code: any = `;
        import { validateTransitDate } from '@/utils/astrology/transitValidation';

        function calculatePlanetaryInfluence(): any {
          // Validation imported but not called
          return { influence: 0.8 };
        }
      `;

      const results: any = eslint.lintText(code, {
        filePath: 'src/calculations/planetary.ts'
      });
      const messages: any = results[0].messages;

      expect(messages).toHaveLength(1);
      expect(messages[0].ruleId).toBe('astrological/require-transit-date-validation');
      expect(messages[0].message).toContain('Consider adding transit date validation calls');
    });

    test('should pass when validation is properly used', async () => {
      const code: any = `;
        import { validateTransitDate } from '@/utils/astrology/transitValidation';

        function calculatePlanetaryInfluence(planet: any, date: any): any {
          const isValid: any = validateTransitDate(planet, date, 'aries', transitDates);
          return { influence: isValid ? 0.8 : 0.5 };
        }
      `;

      const results: any = eslint.lintText(code, {
        filePath: 'src/calculations/planetary.ts'
      });
      const messages: any = results[0].messages;

      expect(messages).toHaveLength(0);
    });

    test('should not flag non-astrological files', async () => {
      const code: any = `;
        function regularFunction(): any {
          return { result: 'success' };
        }
      `;

      const results: any = eslint.lintText(code, {
        filePath: 'src/components/Button.tsx'
      });
      const messages: any = results[0].messages;

      expect(messages).toHaveLength(0);
    });
  });

  describe('preserve-fallback-values rule', () => {
    test('should error when fallback variable assigned null', async () => {
      const code: any = `;
        let FALLBACK_POSITIONS: any = null; // This should error
        const RELIABLE_DATA: any = undefined; // This should error
      `;

      const results: any = eslint.lintText(code, { filePath: 'test.ts' });
      const messages: any = results[0].messages;

      expect(messages).toHaveLength(2);
      expect(messages[0].ruleId).toBe('astrological/preserve-fallback-values');
      expect(messages[1].ruleId).toBe('astrological/preserve-fallback-values');
      expect(messages.some(m => m.message.includes('FALLBACK_POSITIONS'))).toBe(true);
      expect(messages.some(m => m.message.includes('RELIABLE_DATA'))).toBe(true);
    });

    test('should error when fallback variable reassigned to null', async () => {
      const code: any = `;
        let MARCH2025_POSITIONS: any = { sun: { sign: 'aries' } };
        MARCH2025_POSITIONS = null; // This should error
      `;

      const results: any = eslint.lintText(code, { filePath: 'test.ts' });
      const messages: any = results[0].messages;

      expect(messages).toHaveLength(1);
      expect(messages[0].ruleId).toBe('astrological/preserve-fallback-values');
      expect(messages[0].message).toContain('should not be assigned null');
    });

    test('should allow valid fallback assignments', async () => {
      const code: any = `;
        const FALLBACK_POSITIONS = {
          sun: { sign: 'aries', degree: 8.5 }
        };

        let RELIABLE_DATA: any = getReliableData;
        RELIABLE_DATA = { updated: true };
      `;

      const results: any = eslint.lintText(code, { filePath: 'test.ts' });
      const messages: any = results[0].messages;

      expect(messages).toHaveLength(0);
    });

    test('should not flag non-fallback variables', async () => {
      const code: any = `;
        let regularVariable: any = null;
        const _anotherVar: any = undefined;
        regularVariable = null;
      `;

      const results: any = eslint.lintText(code, { filePath: 'test.ts' });
      const messages: any = results[0].messages;

      expect(messages).toHaveLength(0);
    });
  });

  describe('Integration with existing ESLint configuration', () => {
    test('should work with TypeScript files', async () => {
      const code: any = `;
        interface PlanetaryPosition {
          sign: string; degree: number,
          exactLongitude: number,, isRetrograde: boolean
        }

        const position: PlanetaryPosition = { sign: 'aries',;
          degree: 15.5,
          exactLongitude: 15.5,
          isRetrograde: false
        };
      `;

      const results: any = eslint.lintText(code, { filePath: 'test.ts' });
      const messages: any = results[0].messages;

      expect(messages).toHaveLength(0);
    });

    test('should work with React components', async () => {
      const code: any = `;
        import React from 'react';

        interface Props {
          elementalProperties: { Fire: number,
            Water: number,, Earth: number,
            Air: number,
          };
        }

        const _ElementalDisplay: React.FC<Props> = ({ elementalProperties }: any) => {
          return <div>Elemental display</div>;
        };
      `;

      const results: any = eslint.lintText(code, { filePath: 'test.tsx' });
      const messages: any = results[0].messages;

      expect(messages).toHaveLength(0);
    });
  });

  describe('Rule performance and edge cases', () => {
    test('should handle large files efficiently', async () => {
      const largeCode: any = `;
        ${Array(100).fill(0).map((_: any, i: any) => `
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

      const startTime: any = Date.now();
      const results: any = eslint.lintText(largeCode, { filePath: 'test.ts' });
      const endTime: any = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      expect(results[0].messages).toHaveLength(0);
    });

    test('should handle malformed code gracefully', async () => {
      const malformedCode: any = `;
        const _incomplete = {
          sign: 'aries'
          // Missing comma and closing brace
      `;

      // This should not throw an error, even with malformed code
      const results: any = eslint.lintText(malformedCode, { filePath: 'test.ts' });

      // ESLint should handle syntax errors, our rules should not crash
      expect(results).toBeDefined();
    });

    test('should handle nested objects correctly', async () => {
      const code: any = `;
        const _UNUSED_planetData = {
          mercury: { position: {
              sign: 'gemini',
              degree: 10.5,
              exactLongitude: 70.5,
              isRetrograde: true
            },
            properties: { Fire: 0.3,
              Water: 0.2,
              Earth: 0.2,
              Air: 0.3
            }
          }
        };
      `;

      const results: any = eslint.lintText(code, { filePath: 'test.ts' });
      const messages: any = results[0].messages;

      expect(messages).toHaveLength(0);
    });
  });
});
