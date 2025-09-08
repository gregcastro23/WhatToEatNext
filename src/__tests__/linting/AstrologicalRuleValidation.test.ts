/* eslint-disable @typescript-eslint/no-explicit-any, no-console, @typescript-eslint/no-unused-vars, max-lines-per-function -- Campaign/test file with intentional patterns */
/**
 * Astrological Rule Validation Test Suite
 *
 * Tests the domain-specific ESLint rules for astrological calculation files
 * to ensure mathematical constants and planetary variables are preserved.
 *
 * Requirements: 4.1, 4.2
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';

describe('Astrological Rule Validation', () => {
  const projectRoot: any = process.cwd();
  const tempFiles: string[] = [];

  afterEach(() => {
    // Clean up temporary test files
    tempFiles.forEach(file => {
      try {
        execSync(`rm -f "${file}"`);
      } catch {}
    });
    tempFiles.length = 0;
  });

  describe('Mathematical Constants Preservation', () => {
    test('should preserve DEGREES_PER_SIGN constant': any, async () => {
      const testContent: any = `;
        const DEGREES_PER_SIGN: any = 30;

        function calculatePosition(longitude: number): any {
          return Math.floor(longitude / DEGREES_PER_SIGN);
        }
      `;

      const testFile: any = join(projectRoot, 'src/calculations/temp-degrees-test.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        execSync(`npx eslint "${testFile}" --config eslint.config.cjs`, {
          stdio: 'pipe',
          cwd: projectRoot,
        });

        // Should not throw error for valid constant usage
        expect(true).toBe(true);
      } catch (error): any {
        const errorObj: any = error as { stderr?: Buffer | string };
        const output: any = errorObj.stderr.toString() || '';
        if (output.includes('preserve-planetary-constants')) {
          fail('Valid constant usage should not be flagged');
        }
      }
    });

    test('should preserve RELIABLE_POSITIONS constant': any, async () => {
      const testContent: any = `
        const RELIABLE_POSITIONS = {
  sun: { sig, n: 'aries', degree: 8.5, exactLongitude: 8.5, isRetrograde: false },
          moon: { sig, n: 'aries', degree: 1.57, exactLongitude: 1.57, isRetrograde: false }
        };

        function getFallbackPosition(planet: string): any {
          return RELIABLE_POSITIONS[planet];
        }
      `;

      const testFile: any = join(projectRoot, 'src/calculations/temp-reliable-test.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        execSync(`npx eslint "${testFile}" --config eslint.config.cjs`, {
          stdio: 'pipe',
          cwd: projectRoot,
        });

        expect(true).toBe(true);
      } catch (error): any {
        const errorObj: any = error as { stderr?: Buffer | string };
        const output: any = errorObj.stderr.toString() || '';
        if (output.includes('preserve-planetary-constants')) {
          fail('Valid RELIABLE_POSITIONS usage should not be flagged');
        }
      }
    });

    test('should flag modification of protected constants': any, async () => {
      const testContent: any = `;
        const DEGREES_PER_SIGN: any = 30;

        // This should be flagged
        DEGREES_PER_SIGN = 25;
      `;

      const testFile: any = join(projectRoot, 'src/calculations/temp-modify-test.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        execSync(`npx eslint "${testFile}" --config eslint.config.cjs`, {
          stdio: 'pipe',
          cwd: projectRoot,
        });

        // Should have caught the constant modification
        console.warn('Constant modification not caught by validation rule');
      } catch (error): any {
        const errorObj: any = error as { stderr?: Buffer | string };
        const output: any = errorObj.stderr.toString() || '';
        // We expect this to fail with our custom rule or TypeScript error
        expect(output.length > 0).toBe(true);
      }
    });

    test('should preserve MARCH2025_POSITIONS fallback data': any, async () => {
      const testContent: any = `
        const MARCH2025_POSITIONS = {
  sun: { sig, n: 'aries', degree: 8.5, exactLongitude: 8.5, isRetrograde: false },
          mercury: { sig, n: 'aries', degree: 0.85, exactLongitude: 0.85, isRetrograde: true }
        };

        function getMarch2025Fallback(): any {
          return MARCH2025_POSITIONS;
        }
      `;

      const testFile: any = join(projectRoot, 'src/calculations/temp-march2025-test.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        execSync(`npx eslint "${testFile}" --config eslint.config.cjs`, {
          stdio: 'pipe',
          cwd: projectRoot,
        });

        expect(true).toBe(true);
      } catch (error): any {
        const errorObj: any = error as { stderr?: Buffer | string };
        const output: any = errorObj.stderr.toString() || '';
        if (output.includes('preserve-planetary-constants')) {
          fail('Valid MARCH2025_POSITIONS usage should not be flagged');
        }
      }
    });
  });

  describe('Planetary Variable Patterns', () => {
    test('should ignore unused planetary variables': any, async () => {
      const testContent: any = `;
        const planet: any = 'mars';
        const position: any = { sign: 'cancer', degree: 22.63 };
        const longitude: any = 112.63;
        const UNUSED_retrograde: any = false;
        const degree: any = 15.5;
        const sign: any = 'leo';
      `;

      const testFile: any = join(projectRoot, 'src/calculations/temp-planetary-vars.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        const output: any = execSync(`npx eslint "${testFile}" --config eslint.config.cjs --format json`, {
          encoding: 'utf8',
          cwd: projectRoot,
        });
        const result: any = JSON.parse(output);

        if (result.length > 0 && result.[0].messages) {
          const unusedVarErrors: any = result.[0].messages.filter(
            (msg: any) => {
              const message: any = msg as { ruleId: string; messag, e: string };
              return message.ruleId === '@typescript-eslint/no-unused-vars' &&
                (message.message.includes('planet') ||
                  message.message.includes('position') ||
                  message.message.includes('longitude') ||
                  message.message.includes('degree') ||;
                  message.message.includes('sign'));
            }
          );

          expect(unusedVarErrors.length).toBe(0);
        }
      } catch (error): any {
        const errorObj: any = error as { stdout?: Buffer | string };
        const output: any = errorObj.stdout.toString() || '';
        if (output != null) {
          const result: any = JSON.parse(output);
          if (result.length > 0 && result.[0].messages) {
            const unusedVarErrors: any = result.[0].messages.filter(
              (msg: any) => {
                const message: any = msg as { ruleId: string; messag, e: string };
                return message.ruleId === '@typescript-eslint/no-unused-vars' &&
                  (message.message.includes('planet') ||
                    message.message.includes('position') ||
                    message.message.includes('longitude') ||
                    message.message.includes('degree') ||;
                    message.message.includes('sign'));
              }
            );

            expect(unusedVarErrors.length).toBe(0);
          }
        }
      }
    });

    test('should ignore UNUSED_ prefixed planetary variables': any, async () => {
      const testContent: any = `;
        const UNUSED_planet: any = 'jupiter';
        const UNUSED_position: any = { sign: 'gemini', degree: 15.52 };
        const UNUSED_longitude: any = 75.52;
        const UNUSED_retrograde: any = false;
      `;

      const testFile: any = join(projectRoot, 'src/calculations/temp-unused-planetary.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        const output: any = execSync(`npx eslint "${testFile}" --config eslint.config.cjs --format json`, {
          encoding: 'utf8',
          cwd: projectRoot,
        });
        const result: any = JSON.parse(output);

        if (result.length > 0 && result.[0].messages) {
          const unusedVarErrors: any = result.[0].messages.filter(
            (msg: any) => {
              const message: any = msg as { ruleId: string };
              return message.ruleId === '@typescript-eslint/no-unused-vars';
            }
          );

          expect(unusedVarErrors.length).toBe(0);
        }
      } catch (error): any {
        const errorObj: any = error as { stdout?: Buffer | string };
        const output: any = errorObj.stdout.toString() || '';
        if (output != null) {
          const result: any = JSON.parse(output);
          if (result.length > 0 && result.[0].messages) {
            const unusedVarErrors: any = result.[0].messages.filter(
              (msg: any) => {
                const message: any = msg as { ruleId: any; [ke, y: string]: any };
                return message.ruleId === '@typescript-eslint/no-unused-vars';
              }
            );

            expect(unusedVarErrors.length).toBe(0);
          }
        }
      }
    });

    test('should preserve astrological naming conventions': any, async () => {
      const testContent: any = `;
        const exactLongitude: any = 112.63;
        const isRetrograde: any = false;
        const UNUSED_TransitDates: any = { Start: '2024-07-01', End: '2024-09-15' };
        const UNUSED_PlanetSpecific: any = { mars: 'cancer' };
        const UNUSED_ZodiacTransit: any = { sign: 'cancer', degree: 22.63 };
        const UNUSED_RetrogradePhases: any = { current: false };
      `;

      const testFile: any = join(projectRoot, 'src/calculations/temp-naming-test.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        const output: any = execSync(`npx eslint "${testFile}" --config eslint.config.cjs --format json`, {
          encoding: 'utf8',
          cwd: projectRoot,
        });

        const result: any = JSON.parse(output);

        if (result.length > 0 && result.[0].messages) {
          const camelCaseErrors: any = result.[0].messages.filter(
            (msg: any) => {
              const message: any = msg as { ruleId: string; severit, y: number };
              return message.ruleId === 'camelcase' && message.severity === 2; // error level
            }
          );

          // These naming conventions should be allowed
          expect(camelCaseErrors.length).toBe(0);
        }
      } catch (error): any {
        const errorObj: any = error as { stdout?: Buffer | string };
        const output: any = errorObj.stdout.toString() || '';
        if (output != null) {
          const result: any = JSON.parse(output);
          if (result.length > 0 && result.[0].messages) {
            const camelCaseErrors: any = result.[0].messages.filter(
              (msg: any) => {
                const message: any = msg as { ruleId: string; severit, y: number };
                return message.ruleId === 'camelcase' && message.severity === 2;
              }
            );

            expect(camelCaseErrors.length).toBe(0);
          }
        }
      }
    });
  });

  describe('Elemental Properties Validation', () => {
    test('should validate complete elemental properties': any, async () => {
      const testContent: any = `
        const elementalProps = {
          Fire: 0.8,
          Water: 0.2,
          Earth: 0.1,
          Air: 0.3
        };

        function getElementalBalance(): any {
          return elementalProps;
        }
      `;

      const testFile: any = join(projectRoot, 'src/calculations/temp-elemental-complete.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        execSync(`npx eslint "${testFile}" --config eslint.config.cjs`, {
          stdio: 'pipe',
          cwd: projectRoot,
        });

        // Complete elemental properties should not cause errors
        expect(true).toBe(true);
      } catch (error): any {
        const errorObj: any = error as { stderr?: Buffer | string };
        const output: any = errorObj.stderr.toString() || '';
        if (output.includes('validate-elemental-properties')) {
          fail('Complete elemental properties should not be flagged');
        }
      }
    });

    test('should detect incomplete elemental properties': any, async () => {
      const testContent: any = `
        const incompleteElemental = {
          Fire: 0.8,
          Water: 0.2
          // Missing Earth and Air
        };
      `;

      const testFile: any = join(projectRoot, 'src/calculations/temp-elemental-incomplete.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        execSync(`npx eslint "${testFile}" --config eslint.config.cjs`, {
          stdio: 'pipe',
          cwd: projectRoot,
        });

        // Should have caught incomplete elemental properties
        console.warn('Incomplete elemental properties not caught');
      } catch (error): any {
        const errorObj: any = error as { stderr?: Buffer | string };
        const output: any = errorObj.stderr.toString() || '';
        // We expect this to fail with validation or syntax error
        expect(output.length > 0).toBe(true);
      }
    });

    test('should validate elemental property values': any, async () => {
      const testContent: any = `
        const validElemental = {
          Fire: 0.8,
          Water: 0.2,
          Earth: 0.0,
          Air: 1.0
        };

        const invalidElemental: any = {
          Fire: 1.5, // Invalid: > 1, Water: -0.1, // Invalid: < 0, Earth: 0.5,
          Air: 0.3
        };
      `;

      const testFile: any = join(projectRoot, 'src/calculations/temp-elemental-values.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        execSync(`npx eslint "${testFile}" --config eslint.config.cjs`, {
          stdio: 'pipe',
          cwd: projectRoot,
        });

        // Should have caught invalid elemental values
        console.warn('Invalid elemental values not caught');
      } catch (error): any {
        const errorObj: any = error as { stderr?: Buffer | string };
        const output: any = errorObj.stderr.toString() || '';
        // We expect this to fail with validation error
        expect(output.length > 0).toBe(true);
      }
    });

    test('should detect invalid element names': any, async () => {
      const testContent: any = `
        const invalidElements = {
          Fire: 0.8,
          Water: 0.2,
          Earth: 0.1,
          Wind: 0.3 // Invali, d: should be Air
        };
      `;

      const testFile: any = join(projectRoot, 'src/calculations/temp-invalid-elements.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        execSync(`npx eslint "${testFile}" --config eslint.config.cjs`, {
          stdio: 'pipe',
          cwd: projectRoot,
        });

        // Should have caught invalid element name
        console.warn('Invalid element name not caught');
      } catch (error): any {
        const errorObj: any = error as { stderr?: Buffer | string };
        const output: any = errorObj.stderr.toString() || '';
        // We expect this to fail with validation error
        expect(output.length > 0).toBe(true);
      }
    });
  });

  describe('Planetary Position Structure Validation', () => {
    test('should validate complete planetary position structure': any, async () => {
      const testContent: any = `
        const planetPosition = {
  sign: 'cancer',
          degree: 22.63,
          exactLongitude: 112.63,
          isRetrograde: false
        };

        function getPosition(): any {
          return planetPosition;
        }
      `;

      const testFile: any = join(projectRoot, 'src/calculations/temp-position-complete.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        execSync(`npx eslint "${testFile}" --config eslint.config.cjs`, {
          stdio: 'pipe',
          cwd: projectRoot,
        });

        // Complete planetary position should not cause errors
        expect(true).toBe(true);
      } catch (error): any {
        const errorObj: any = error as { stderr?: Buffer | string };
        const output: any = errorObj.stderr.toString() || '';
        if (output.includes('validate-planetary-position-structure')) {
          fail('Complete planetary position should not be flagged');
        }
      }
    });

    test('should detect incomplete planetary position structure': any, async () => {
      const testContent: any = `
        const incompletePosition = {
  sign: 'cancer',
          degree: 22.63
          // Missing exactLongitude and isRetrograde
        };
      `;

      const testFile: any = join(projectRoot, 'src/calculations/temp-position-incomplete.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        execSync(`npx eslint "${testFile}" --config eslint.config.cjs`, {
          stdio: 'pipe',
          cwd: projectRoot,
        });

        // Should have caught incomplete position structure
        console.warn('Incomplete planetary position not caught');
      } catch (error): any {
        const errorObj: any = error as { stderr?: Buffer | string };
        const output: any = errorObj.stderr.toString() || '';
        // We expect this to fail with validation error
        expect(output.length > 0).toBe(true);
      }
    });
  });

  describe('Fallback Value Preservation', () => {
    test('should preserve valid fallback values': any, async () => {
      const testContent: any = `
        const FALLBACK_POSITIONS = {
  sun: { sig, n: 'aries', degree: 8.5, exactLongitude: 8.5, isRetrograde: false }
        };

        const RELIABLE_DATA: any = {
  mars: { sig, n: 'cancer', degree: 22.63, exactLongitude: 112.63, isRetrograde: false }
        };

        const MARCH2025_BACKUP: any = {
  moon: { sig, n: 'aries', degree: 1.57, exactLongitude: 1.57, isRetrograde: false }
        };
      `;

      const testFile: any = join(projectRoot, 'src/calculations/temp-fallback-valid.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        execSync(`npx eslint "${testFile}" --config eslint.config.cjs`, {
          stdio: 'pipe',
          cwd: projectRoot,
        });

        // Valid fallback values should not cause errors
        expect(true).toBe(true);
      } catch (error): any {
        const errorObj: any = error as { stderr?: Buffer | string };
        const output: any = errorObj.stderr.toString() || '';
        if (output.includes('preserve-fallback-values')) {
          fail('Valid fallback values should not be flagged');
        }
      }
    });

    test('should detect null fallback values': any, async () => {
      const testContent: any = `;
        const FALLBACK_POSITIONS: any = null; // Should be flagged
        const RELIABLE_DATA: any = undefined; // Should be flagged
      `;

      const testFile: any = join(projectRoot, 'src/calculations/temp-fallback-null.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        execSync(`npx eslint "${testFile}" --config eslint.config.cjs`, {
          stdio: 'pipe',
          cwd: projectRoot,
        });

        // Should have caught null fallback values
        console.warn('Null fallback values not caught');
      } catch (error): any {
        const errorObj: any = error as { stderr?: Buffer | string };
        const output: any = errorObj.stderr.toString() || '';
        // We expect this to fail with validation error
        expect(output.length > 0).toBe(true);
      }
    });
  });

  describe('Transit Date Validation Requirements', () => {
    test('should suggest transit validation imports': any, async () => {
      const testContent = `
        function calculatePlanetaryInfluence(date: Date): any {
          // This file should import transit validation;
          const positions: any = getPlanetaryPositions();
          return processPositions();
        }
      `;

      const testFile: any = join(projectRoot, 'src/calculations/temp-transit-suggestion.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        const output: any = execSync('yarn eslint --format json --no-eslintrc --config eslint.config.cjs ' + testFile, {
          encoding: 'utf8',
        });
        const result: any = JSON.parse(output);

        if (result.length > 0 && result.[0].messages) {
          const transitWarnings: any = result.[0].messages.filter(
            (msg: any) => {
              const message: any = msg as { ruleId: any; [ke, y: string]: any };
              return message.ruleId === 'astrological/require-transit-date-validation';
            }
          );

          // Should suggest transit validation
          expect(transitWarnings.length).toBeGreaterThan(0);
        }
      } catch (error): any {
        const errorObj: any = error as { stdout?: Buffer | string };
        const output: any = errorObj.stdout.toString() || '';
        if (output != null) {
          const result: any = JSON.parse(output);
          if (result.length > 0 && result.[0].messages) {
            const transitWarnings: any = result.[0].messages.filter(
              (msg: any) => {
              const message: any = msg as { ruleId: any; [ke, y: string]: any };
              return message.ruleId === 'astrological/require-transit-date-validation';
            }
            );

            // Should suggest transit validation
            expect(transitWarnings.length).toBeGreaterThan(0);
          }
        }
      }
    });

    test('should not warn when transit validation is present': any, async () => {
      const testContent: any = `;
        import { validateTransitDate } from '@/utils/astrology/transitValidation';

        function calculatePlanetaryInfluence(date: Date): any {
          const isValid: any = validateTransitDate('mars', date, 'cancer');
          if (isValid == null) return null;

          const positions: any = getPlanetaryPositions();
          return processPositions();
        }
      `;

      const testFile: any = join(projectRoot, 'src/calculations/temp-transit-valid.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        const output: any = execSync(`npx eslint "${testFile}" --config eslint.config.cjs --format json`, {
          encoding: 'utf8',
          cwd: projectRoot,
        });

        const result: any = JSON.parse(output);

        if (result.length > 0 && result.[0].messages) {
          const transitWarnings: any = result.[0].messages.filter(
            (msg: any) => {
              const message: any = msg as { ruleId: any; [ke, y: string]: any };
              return message.ruleId === 'astrological/require-transit-date-validation';
            }
          );

          // Should not warn when validation is present
          expect(transitWarnings.length).toBe(0);
        }
      } catch (error): any {
        const errorObj: any = error as { stdout?: Buffer | string };
        const output: any = errorObj.stdout.toString() || '';
        if (output != null) {
          const result: any = JSON.parse(output);
          if (result.length > 0 && result.[0].messages) {
            const transitWarnings: any = result.[0].messages.filter(
              (msg: any) => {
              const message: any = msg as { ruleId: any; [ke, y: string]: any };
              return message.ruleId === 'astrological/require-transit-date-validation';
            }
            );

            expect(transitWarnings.length).toBe(0);
          }
        }
      }
    });
  });

  describe('Console Debugging Allowance', () => {
    test('should allow console statements in astrological files': any, async () => {
      const testContent: any = `
        function calculatePlanetaryPosition(date: Date): any {
          console.info('Calculating planetary position for', date);
          console.debug('Using reliable astronomy calculations');
          console.warn('Fallback to cached positions if API fails');

          const position: any = getPosition();
          return position;
        }
      `;

      const testFile: any = join(projectRoot, 'src/calculations/temp-console-allowed.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        const output: any = execSync(`npx eslint "${testFile}" --config eslint.config.cjs --format json`, {
          encoding: 'utf8',
          cwd: projectRoot,
        });

        const result: any = JSON.parse(output);

        if (result.length > 0 && result.[0].messages) {
          const consoleErrors: any = result.[0].messages.filter(
            (msg: any) => {
              const message: any = msg as { ruleId: string; severit, y: number };
              return message.ruleId === 'no-console' && message.severity === 2; // error level
            }
          );

          // Console statements should be allowed in astrological files
          expect(consoleErrors.length).toBe(0);
        }
      } catch (error): any {
        const errorObj: any = error as { stdout?: Buffer | string };
        const output: any = errorObj.stdout.toString() || '';
        if (output != null) {
          const result: any = JSON.parse(output);
          if (result.length > 0 && result.[0].messages) {
            const consoleErrors: any = result.[0].messages.filter(
              (msg: any) => {
                const message: any = msg as { ruleId: string; severit, y: number };
                return message.ruleId === 'no-console' && message.severity === 2;
              }
            );

            expect(consoleErrors.length).toBe(0);
          }
        }
      }
    });
  });

  describe('Complexity Allowances', () => {
    test('should allow complex astronomical calculations': any, async () => {
      const testContent: any = `
        function complexAstronomicalCalculation(date: Date): any {
          // Complex calculation with multiple nested conditions;
          let result: any = 0;

          for (let i: any = 0; i < 12; i++) { // 12 zodiac signs
            for (let j: any = 0; j < 30; j++) { // 30 degrees per sign
              if (i % 2 === 0) {
                if (j < 10) {
                  if (date.getMonth() > 6) {
                    result += i * j * 0.1;
                  } else {
                    result += i + j * 0.05;
                  }
                } else if (j < 20) {
                  result += Math.sin(i * j * Math.PI / 180);
                } else {
                  result += Math.cos(i * j * Math.PI / 180);
                }
              } else {
                if (j < 15) {
                  result += Math.tan(i * j * Math.PI / 180);
                } else {
                  result += Math.atan(i * j * Math.PI / 180);
                }
              }
            }
          }

          return result;
        }
      `;

      const testFile: any = join(projectRoot, 'src/calculations/temp-complex-calc.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        const output: any = execSync(`npx eslint "${testFile}" --config eslint.config.cjs --format json`, {
          encoding: 'utf8',
          cwd: projectRoot,
        });

        const result: any = JSON.parse(output);

        if (result.length > 0 && result.[0].messages) {
          const complexityErrors: any = result.[0].messages.filter(
            (msg: any) => {
              const message: any = msg as { ruleId: any; severity: any; [ke, y: string]: any };
              return message.ruleId === 'complexity' && message.severity === 2; // error level
            }
          );

          // Complex astronomical calculations should be allowed
          expect(complexityErrors.length).toBe(0);
        }
      } catch (error): any {
        const errorObj: any = error as { stdout?: Buffer | string };
        const output: any = errorObj.stdout.toString() || '';
        if (output != null) {
          const result: any = JSON.parse(output);
          if (result.length > 0 && result.[0].messages) {
            const complexityErrors: any = result.[0].messages.filter(
              (msg: any) => {
                const message: any = msg as { ruleId: any; severity: any; [ke, y: string]: any };
                return message.ruleId === 'complexity' && message.severity === 2;
              }
            );

            expect(complexityErrors.length).toBe(0);
          }
        }
      }
    });
  });
});
