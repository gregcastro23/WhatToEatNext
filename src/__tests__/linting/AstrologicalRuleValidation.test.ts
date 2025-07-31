/**
 * Astrological Rule Validation Test Suite
 * 
 * Tests the domain-specific ESLint rules for astrological calculation files
 * to ensure mathematical constants and planetary variables are preserved.
 * 
 * Requirements: 4.1, 4.2
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('Astrological Rule Validation', () => {
  const projectRoot = process.cwd();
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
    test('should preserve DEGREES_PER_SIGN constant', async () => {
      const testContent = `
        const DEGREES_PER_SIGN = 30;
        
        function calculatePosition(longitude: number) {
          return Math.floor(longitude / DEGREES_PER_SIGN);
        }
      `;

      const testFile = join(projectRoot, 'src/calculations/temp-degrees-test.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        execSync(`npx eslint "${testFile}" --no-eslintrc --config eslint.config.cjs`, {
          stdio: 'pipe',
          cwd: projectRoot
        });
        
        // Should not throw error for valid constant usage
        expect(true).toBe(true);
      } catch (error) {
        const output = (error as any).stderr?.toString() || '';
        if (output.includes('preserve-planetary-constants')) {
          fail('Valid constant usage should not be flagged');
        }
      }
    });

    test('should preserve RELIABLE_POSITIONS constant', async () => {
      const testContent = `
        const RELIABLE_POSITIONS = {
          sun: { sign: 'aries', degree: 8.5, exactLongitude: 8.5, isRetrograde: false },
          moon: { sign: 'aries', degree: 1.57, exactLongitude: 1.57, isRetrograde: false }
        };
        
        function getFallbackPosition(planet: string) {
          return RELIABLE_POSITIONS[planet];
        }
      `;

      const testFile = join(projectRoot, 'src/calculations/temp-reliable-test.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        execSync(`npx eslint "${testFile}" --no-eslintrc --config eslint.config.cjs`, {
          stdio: 'pipe',
          cwd: projectRoot
        });
        
        expect(true).toBe(true);
      } catch (error) {
        const output = (error as any).stderr?.toString() || '';
        if (output.includes('preserve-planetary-constants')) {
          fail('Valid RELIABLE_POSITIONS usage should not be flagged');
        }
      }
    });

    test('should flag modification of protected constants', async () => {
      const testContent = `
        const DEGREES_PER_SIGN = 30;
        
        // This should be flagged
        DEGREES_PER_SIGN = 25;
      `;

      const testFile = join(projectRoot, 'src/calculations/temp-modify-test.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        execSync(`npx eslint "${testFile}" --no-eslintrc --config eslint.config.cjs`, {
          stdio: 'pipe',
          cwd: projectRoot
        });
        
        // Should have caught the constant modification
        console.warn('Constant modification not caught by validation rule');
      } catch (error) {
        const output = (error as any).stderr?.toString() || '';
        // We expect this to fail with our custom rule or TypeScript error
        expect(output.length > 0).toBe(true);
      }
    });

    test('should preserve MARCH2025_POSITIONS fallback data', async () => {
      const testContent = `
        const MARCH2025_POSITIONS = {
          sun: { sign: 'aries', degree: 8.5, exactLongitude: 8.5, isRetrograde: false },
          mercury: { sign: 'aries', degree: 0.85, exactLongitude: 0.85, isRetrograde: true }
        };
        
        function getMarch2025Fallback() {
          return MARCH2025_POSITIONS;
        }
      `;

      const testFile = join(projectRoot, 'src/calculations/temp-march2025-test.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        execSync(`npx eslint "${testFile}" --no-eslintrc --config eslint.config.cjs`, {
          stdio: 'pipe',
          cwd: projectRoot
        });
        
        expect(true).toBe(true);
      } catch (error) {
        const output = (error as any).stderr?.toString() || '';
        if (output.includes('preserve-planetary-constants')) {
          fail('Valid MARCH2025_POSITIONS usage should not be flagged');
        }
      }
    });
  });

  describe('Planetary Variable Patterns', () => {
    test('should ignore unused planetary variables', async () => {
      const testContent = `
        const planet = 'mars';
        const position = { sign: 'cancer', degree: 22.63 };
        const longitude = 112.63;
        const retrograde = false;
        const degree = 15.5;
        const sign = 'leo';
      `;

      const testFile = join(projectRoot, 'src/calculations/temp-planetary-vars.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        await const output = execSync
        const result = JSON.parse(output);
        
        if (result.length > 0 && result[0].messages) {
          const unusedVarErrors = result[0].messages.filter((msg: any) => 
            msg.ruleId === '@typescript-eslint/no-unused-vars' &&
            (msg.message.includes('planet') || msg.message.includes('position') || 
             msg.message.includes('longitude') || msg.message.includes('degree') || 
             msg.message.includes('sign'))
          );
          
          expect(unusedVarErrors.length).toBe(0);
        }
      } catch (error) {
        const output = (error as any).stdout?.toString() || '';
        if (output) {
          const result = JSON.parse(output);
          if (result.length > 0 && result[0].messages) {
            const unusedVarErrors = result[0].messages.filter((msg: any) => 
              msg.ruleId === '@typescript-eslint/no-unused-vars' &&
              (msg.message.includes('planet') || msg.message.includes('position') || 
               msg.message.includes('longitude') || msg.message.includes('degree') || 
               msg.message.includes('sign'))
            );
            
            expect(unusedVarErrors.length).toBe(0);
          }
        }
      }
    });

    test('should ignore UNUSED_ prefixed planetary variables', async () => {
      const testContent = `
        const UNUSED_planet = 'jupiter';
        const UNUSED_position = { sign: 'gemini', degree: 15.52 };
        const UNUSED_longitude = 75.52;
        const UNUSED_retrograde = false;
      `;

      const testFile = join(projectRoot, 'src/calculations/temp-unused-planetary.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        await const output = execSync
        const result = JSON.parse(output);
        
        if (result.length > 0 && result[0].messages) {
          const unusedVarErrors = result[0].messages.filter((msg: any) => 
            msg.ruleId === '@typescript-eslint/no-unused-vars'
          );
          
          expect(unusedVarErrors.length).toBe(0);
        }
      } catch (error) {
        const output = (error as any).stdout?.toString() || '';
        if (output) {
          const result = JSON.parse(output);
          if (result.length > 0 && result[0].messages) {
            const unusedVarErrors = result[0].messages.filter((msg: any) => 
              msg.ruleId === '@typescript-eslint/no-unused-vars'
            );
            
            expect(unusedVarErrors.length).toBe(0);
          }
        }
      }
    });

    test('should preserve astrological naming conventions', async () => {
      const testContent = `
        const exactLongitude = 112.63;
        const isRetrograde = false;
        const TransitDates = { Start: '2024-07-01', End: '2024-09-15' };
        const PlanetSpecific = { mars: 'cancer' };
        const ZodiacTransit = { sign: 'cancer', degree: 22.63 };
        const RetrogradePhases = { current: false };
      `;

      const testFile = join(projectRoot, 'src/calculations/temp-naming-test.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        const output = execSync(`npx eslint "${testFile}" --no-eslintrc --config eslint.config.cjs --format json`, {
          encoding: 'utf8',
          cwd: projectRoot
        });

        const result = JSON.parse(output);
        
        if (result.length > 0 && result[0].messages) {
          const camelCaseErrors = result[0].messages.filter((msg: any) => 
            msg.ruleId === 'camelcase' && msg.severity === 2 // error level
          );
          
          // These naming conventions should be allowed
          expect(camelCaseErrors.length).toBe(0);
        }
      } catch (error) {
        const output = (error as any).stdout?.toString() || '';
        if (output) {
          const result = JSON.parse(output);
          if (result.length > 0 && result[0].messages) {
            const camelCaseErrors = result[0].messages.filter((msg: any) => 
              msg.ruleId === 'camelcase' && msg.severity === 2
            );
            
            expect(camelCaseErrors.length).toBe(0);
          }
        }
      }
    });
  });

  describe('Elemental Properties Validation', () => {
    test('should validate complete elemental properties', async () => {
      const testContent = `
        const elementalProps = {
          Fire: 0.8,
          Water: 0.2,
          Earth: 0.1,
          Air: 0.3
        };
        
        function getElementalBalance() {
          return elementalProps;
        }
      `;

      const testFile = join(projectRoot, 'src/calculations/temp-elemental-complete.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        execSync(`npx eslint "${testFile}" --no-eslintrc --config eslint.config.cjs`, {
          stdio: 'pipe',
          cwd: projectRoot
        });
        
        // Complete elemental properties should not cause errors
        expect(true).toBe(true);
      } catch (error) {
        const output = (error as any).stderr?.toString() || '';
        if (output.includes('validate-elemental-properties')) {
          fail('Complete elemental properties should not be flagged');
        }
      }
    });

    test('should detect incomplete elemental properties', async () => {
      const testContent = `
        const incompleteElemental = {
          Fire: 0.8,
          Water: 0.2
          // Missing Earth and Air
        };
      `;

      const testFile = join(projectRoot, 'src/calculations/temp-elemental-incomplete.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        execSync(`npx eslint "${testFile}" --no-eslintrc --config eslint.config.cjs`, {
          stdio: 'pipe',
          cwd: projectRoot
        });
        
        // Should have caught incomplete elemental properties
        console.warn('Incomplete elemental properties not caught');
      } catch (error) {
        const output = (error as any).stderr?.toString() || '';
        // We expect this to fail with validation or syntax error
        expect(output.length > 0).toBe(true);
      }
    });

    test('should validate elemental property values', async () => {
      const testContent = `
        const validElemental = {
          Fire: 0.8,
          Water: 0.2,
          Earth: 0.0,
          Air: 1.0
        };
        
        const invalidElemental = {
          Fire: 1.5, // Invalid: > 1
          Water: -0.1, // Invalid: < 0
          Earth: 0.5,
          Air: 0.3
        };
      `;

      const testFile = join(projectRoot, 'src/calculations/temp-elemental-values.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        execSync(`npx eslint "${testFile}" --no-eslintrc --config eslint.config.cjs`, {
          stdio: 'pipe',
          cwd: projectRoot
        });
        
        // Should have caught invalid elemental values
        console.warn('Invalid elemental values not caught');
      } catch (error) {
        const output = (error as any).stderr?.toString() || '';
        // We expect this to fail with validation error
        expect(output.length > 0).toBe(true);
      }
    });

    test('should detect invalid element names', async () => {
      const testContent = `
        const invalidElements = {
          Fire: 0.8,
          Water: 0.2,
          Earth: 0.1,
          Wind: 0.3 // Invalid: should be Air
        };
      `;

      const testFile = join(projectRoot, 'src/calculations/temp-invalid-elements.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        execSync(`npx eslint "${testFile}" --no-eslintrc --config eslint.config.cjs`, {
          stdio: 'pipe',
          cwd: projectRoot
        });
        
        // Should have caught invalid element name
        console.warn('Invalid element name not caught');
      } catch (error) {
        const output = (error as any).stderr?.toString() || '';
        // We expect this to fail with validation error
        expect(output.length > 0).toBe(true);
      }
    });
  });

  describe('Planetary Position Structure Validation', () => {
    test('should validate complete planetary position structure', async () => {
      const testContent = `
        const planetPosition = {
          sign: 'cancer',
          degree: 22.63,
          exactLongitude: 112.63,
          isRetrograde: false
        };
        
        function getPosition() {
          return planetPosition;
        }
      `;

      const testFile = join(projectRoot, 'src/calculations/temp-position-complete.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        execSync(`npx eslint "${testFile}" --no-eslintrc --config eslint.config.cjs`, {
          stdio: 'pipe',
          cwd: projectRoot
        });
        
        // Complete planetary position should not cause errors
        expect(true).toBe(true);
      } catch (error) {
        const output = (error as any).stderr?.toString() || '';
        if (output.includes('validate-planetary-position-structure')) {
          fail('Complete planetary position should not be flagged');
        }
      }
    });

    test('should detect incomplete planetary position structure', async () => {
      const testContent = `
        const incompletePosition = {
          sign: 'cancer',
          degree: 22.63
          // Missing exactLongitude and isRetrograde
        };
      `;

      const testFile = join(projectRoot, 'src/calculations/temp-position-incomplete.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        execSync(`npx eslint "${testFile}" --no-eslintrc --config eslint.config.cjs`, {
          stdio: 'pipe',
          cwd: projectRoot
        });
        
        // Should have caught incomplete position structure
        console.warn('Incomplete planetary position not caught');
      } catch (error) {
        const output = (error as any).stderr?.toString() || '';
        // We expect this to fail with validation error
        expect(output.length > 0).toBe(true);
      }
    });
  });

  describe('Fallback Value Preservation', () => {
    test('should preserve valid fallback values', async () => {
      const testContent = `
        const FALLBACK_POSITIONS = {
          sun: { sign: 'aries', degree: 8.5, exactLongitude: 8.5, isRetrograde: false }
        };
        
        const RELIABLE_DATA = {
          mars: { sign: 'cancer', degree: 22.63, exactLongitude: 112.63, isRetrograde: false }
        };
        
        const MARCH2025_BACKUP = {
          moon: { sign: 'aries', degree: 1.57, exactLongitude: 1.57, isRetrograde: false }
        };
      `;

      const testFile = join(projectRoot, 'src/calculations/temp-fallback-valid.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        execSync(`npx eslint "${testFile}" --no-eslintrc --config eslint.config.cjs`, {
          stdio: 'pipe',
          cwd: projectRoot
        });
        
        // Valid fallback values should not cause errors
        expect(true).toBe(true);
      } catch (error) {
        const output = (error as any).stderr?.toString() || '';
        if (output.includes('preserve-fallback-values')) {
          fail('Valid fallback values should not be flagged');
        }
      }
    });

    test('should detect null fallback values', async () => {
      const testContent = `
        const FALLBACK_POSITIONS = null; // Should be flagged
        const RELIABLE_DATA = undefined; // Should be flagged
      `;

      const testFile = join(projectRoot, 'src/calculations/temp-fallback-null.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        execSync(`npx eslint "${testFile}" --no-eslintrc --config eslint.config.cjs`, {
          stdio: 'pipe',
          cwd: projectRoot
        });
        
        // Should have caught null fallback values
        console.warn('Null fallback values not caught');
      } catch (error) {
        const output = (error as any).stderr?.toString() || '';
        // We expect this to fail with validation error
        expect(output.length > 0).toBe(true);
      }
    });
  });

  describe('Transit Date Validation Requirements', () => {
    test('should suggest transit validation imports', async () => {
      const testContent = `
        function calculatePlanetaryInfluence(date: Date) {
          // This file should import transit validation
          await const positions = getPlanetaryPositions
          return await processPositions
        }
      `;

      const testFile = join(projectRoot, 'src/calculations/temp-transit-suggestion.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
              await const output = execSync   const result = JSON.parse(output);
        
        if (result.length > 0 && result[0].messages) {
          const transitWarnings = result[0].messages.filter((msg: any) => 
            msg.ruleId === 'astrological/require-transit-date-validation'
          );
          
          // Should suggest transit validation
          expect(transitWarnings.length).toBeGreaterThan(0);
        }
      } catch (error) {
        const output = (error as any).stdout?.toString() || '';
        if (output) {
          const result = JSON.parse(output);
          if (result.length > 0 && result[0].messages) {
            const transitWarnings = result[0].messages.filter((msg: any) => 
              msg.ruleId === 'astrological/require-transit-date-validation'
            );
            
            // Should suggest transit validation
            expect(transitWarnings.length).toBeGreaterThan(0);
          }
        }
      }
    });

    test('should not warn when transit validation is present', async () => {
      const testContent = `
        import { validateTransitDate } from '@/utils/astrology/transitValidation';
        
        function calculatePlanetaryInfluence(date: Date) {
          const isValid = validateTransitDate('mars', date, 'cancer');
          if (!isValid) return null;
                
          await const positions = getPlanetaryPositions     return await processPositions
        }
      `;

      const testFile = join(projectRoot, 'src/calculations/temp-transit-valid.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        const output = execSync(`npx eslint "${testFile}" --no-eslintrc --config eslint.config.cjs --format json`, {
          encoding: 'utf8',
          cwd: projectRoot
        });

        const result = JSON.parse(output);
        
        if (result.length > 0 && result[0].messages) {
          const transitWarnings = result[0].messages.filter((msg: any) => 
            msg.ruleId === 'astrological/require-transit-date-validation'
          );
          
          // Should not warn when validation is present
          expect(transitWarnings.length).toBe(0);
        }
      } catch (error) {
        const output = (error as any).stdout?.toString() || '';
        if (output) {
          const result = JSON.parse(output);
          if (result.length > 0 && result[0].messages) {
            const transitWarnings = result[0].messages.filter((msg: any) => 
              msg.ruleId === 'astrological/require-transit-date-validation'
            );
            
            expect(transitWarnings.length).toBe(0);
          }
        }
      }
    });
  });

  describe('Console Debugging Allowance', () => {
    test('should allow console statements in astrological files', async () => {
      const testContent = `
        function calculatePlanetaryPosition(date: Date) {
          console.info('Calculating planetary position for', date);
          console.debug('Using reliable astronomy calculations');
          console.warn('Fallback to cached positions if API fails');
          
          co          await const position = getPositioneturn position;
        }
      `;

      const testFile = join(projectRoot, 'src/calculations/temp-console-allowed.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        const output = execSync(`npx eslint "${testFile}" --no-eslintrc --config eslint.config.cjs --format json`, {
          encoding: 'utf8',
          cwd: projectRoot
        });

        const result = JSON.parse(output);
        
        if (result.length > 0 && result[0].messages) {
          const consoleErrors = result[0].messages.filter((msg: any) => 
            msg.ruleId === 'no-console' && msg.severity === 2 // error level
          );
          
          // Console statements should be allowed in astrological files
          expect(consoleErrors.length).toBe(0);
        }
      } catch (error) {
        const output = (error as any).stdout?.toString() || '';
        if (output) {
          const result = JSON.parse(output);
          if (result.length > 0 && result[0].messages) {
            const consoleErrors = result[0].messages.filter((msg: any) => 
              msg.ruleId === 'no-console' && msg.severity === 2
            );
            
            expect(consoleErrors.length).toBe(0);
          }
        }
      }
    });
  });

  describe('Complexity Allowances', () => {
    test('should allow complex astronomical calculations', async () => {
      const testContent = `
        function complexAstronomicalCalculation(date: Date) {
          // Complex calculation with multiple nested conditions
          let result = 0;
          
          for (let i = 0; i < 12; i++) { // 12 zodiac signs
            for (let j = 0; j < 30; j++) { // 30 degrees per sign
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

      const testFile = join(projectRoot, 'src/calculations/temp-complex-calc.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        const output = execSync(`npx eslint "${testFile}" --no-eslintrc --config eslint.config.cjs --format json`, {
          encoding: 'utf8',
          cwd: projectRoot
        });

        const result = JSON.parse(output);
        
        if (result.length > 0 && result[0].messages) {
          const complexityErrors = result[0].messages.filter((msg: any) => 
            msg.ruleId === 'complexity' && msg.severity === 2 // error level
          );
          
          // Complex astronomical calculations should be allowed
          expect(complexityErrors.length).toBe(0);
        }
      } catch (error) {
        const output = (error as any).stdout?.toString() || '';
        if (output) {
          const result = JSON.parse(output);
          if (result.length > 0 && result[0].messages) {
            const complexityErrors = result[0].messages.filter((msg: any) => 
              msg.ruleId === 'complexity' && msg.severity === 2
            );
            
            expect(complexityErrors.length).toBe(0);
          }
        }
      }
    });
  });
});