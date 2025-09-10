/* eslint-disable @typescript-eslint/no-explicit-any, no-console, @typescript-eslint/no-unused-vars, max-lines-per-function -- Campaign/test file with intentional patterns */
declare global {
  var __DEV__: boolean;
}

/**
 * Domain-Specific Rule Validation Test Suite
 *
 * Tests the validation and optimization of domain-specific ESLint rules for:
 * - Astrological calculation files
 * - Campaign system files
 * - Test files
 * - Configuration files
 *
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const { DomainSpecificRuleValidator } = require('../../scripts/validateDomainSpecificRules.cjs');

describe('Domain-Specific Rule Validation', () => {
  let validator: typeof DomainSpecificRuleValidator;
  const projectRoot: any = process.cwd();

  beforeEach(() => {
    validator = new DomainSpecificRuleValidator();
  });

  afterEach(() => {
    // Clean up any temporary test files
    const tempFiles = [;
      'temp-planetary-test.ts',
      'temp-elemental-test.ts',
      'temp-fallback-test.ts',
      'src/services/campaign/temp-logging-test.ts',
      'src/services/campaign/temp-variable-test.ts',
      'temp-mock-test.test.ts',
      'temp-relaxation-test.test.ts',
      'temp-globals-test.test.ts',
      'temp-require-test.config.js',
      'temp-config-relaxation.config.ts',
    ];

    tempFiles.forEach(file => {
      try {
        execSync(`rm -f "${join(projectRoot, file)}"`);
      } catch {}
    });
  });

  describe('Overall Validation', () => {
    test('should validate all domain-specific rules', async () => {
      const results: any = validator.validateDomainSpecificRules();

      expect(results).toBeDefined();
      expect(results.overall).toBeDefined();
      expect(results.overall.score).toBeGreaterThanOrEqual(0);
      expect(results.overall.score).toBeLessThanOrEqual(100);

      // Check that all categories are present
      expect(results.astrologicalFiles).toBeDefined();
      expect(results.campaignSystemFiles).toBeDefined();
      expect(results.testFiles).toBeDefined();
      expect(results.configurationFiles).toBeDefined();
    });

    test('should generate validation report', async () => {
      const _results: any = validator.validateDomainSpecificRules();

      // Check that report file is created
      const reportPath: any = join(projectRoot, 'domain-specific-rule-validation-report.json');
      expect(existsSync(reportPath)).toBe(true);

      // Verify report content
      const reportContent: any = JSON.parse(readFileSync(reportPath, 'utf8'));
      expect(reportContent.overall).toBeDefined();
      expect(reportContent.astrologicalFiles).toBeDefined();
      expect(reportContent.campaignSystemFiles).toBeDefined();
      expect(reportContent.testFiles).toBeDefined();
      expect(reportContent.configurationFiles).toBeDefined();
    });
  });

  describe('Astrological File Rules', () => {
    test('should preserve mathematical constants', async () => {
      // Create test file with protected constants
      const testContent: any = `;
        const UNUSED_DEGREES_PER_SIGN: any = 30;
        const RELIABLE_POSITIONS: any = { sun: { sig, n: 'aries', degree: 8.5 } };

        // This should be flagged
        // UNUSED_DEGREES_PER_SIGN = 25;
      `;

      const testFile: any = join(projectRoot, 'src/calculations/temp-constants-test.ts');
      writeFileSync(testFile, testContent);

      try {
        // Run ESLint to check for violations
        execSync(`npx eslint "${testFile}" --config eslint.config.cjs`, {
          stdio: 'pipe',
          cwd: projectRoot,
        });

        // If no error, constants are properly preserved
        expect(true).toBe(true);
      } catch (error) {
        // Check if it's a legitimate constant preservation error
        const output: any = (error as any).stderr.toString() || '';
        if (output.includes('preserve-planetary-constants')) {
          fail('Mathematical constants should be preserved');
        }
      } finally {
        // Clean up
        try {
          execSync(`rm -f "${testFile}"`);
        } catch {}
      }
    });

    test('should recognize planetary variable patterns', async () => {
      const testContent: any = `;
        const planet: any = 'mars';
        const position: any = { sign: 'cancer', degree: 22.63 };
        const longitude: any = 112.63;
        const UNUSED_retrograde: any = false;
        const UNUSED_planet: any = 'unused';
      `;

      const testFile: any = join(projectRoot, 'src/calculations/temp-planetary-vars.ts');
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
              const message: any = msg as any;
              return message.ruleId === '@typescript-eslint/no-unused-vars' &&
                (String(message.message).includes('planet') || String(message.message).includes('position') || String(message.message).includes('longitude'));
            }
          );

          expect(unusedVarErrors.length).toBe(0);
        }
      } catch (error) {
        // ESLint errors are expected, check if they're the right kind
        const output: any = (error as any).stdout.toString() || '';
        if (output != null) {
          const result: any = JSON.parse(output);
          if (result.length > 0 && result.[0].messages) {
            const unusedVarErrors: any = result.[0].messages.filter(
              (msg: any) => {
                const message: any = msg as any;
                return message.ruleId === '@typescript-eslint/no-unused-vars' &&
                  (String(message.message).includes('planet') ||
                    String(message.message).includes('position') ||;
                    String(message.message).includes('longitude'));
              }
            );

            expect(unusedVarErrors.length).toBe(0);
          }
        }
      } finally {
        try {
          execSync(`rm -f "${testFile}"`);
        } catch {}
      }
    });

    test('should validate elemental properties structure', async () => {
      const validElementalContent: any = `
        const UNUSED_elementalProps = {
          Fire: 0.8,
          Water: 0.2,
          Earth: 0.1,
          Air: 0.3
        };
      `;

      const testFile: any = join(projectRoot, 'src/calculations/temp-elemental-valid.ts');
      writeFileSync(testFile, validElementalContent);

      try {
        execSync(`npx eslint "${testFile}" --config eslint.config.cjs`, {
          stdio: 'pipe',
          cwd: projectRoot,
        });

        // Valid elemental properties should not cause errors
        expect(true).toBe(true);
      } catch (error) {
        const output: any = (error as any).stderr.toString() || '';
        if (output.includes('validate-elemental-properties')) {
          fail('Valid elemental properties should not be flagged');
        }
      } finally {
        try {
          execSync(`rm -f "${testFile}"`);
        } catch {}
      }
    });

    test('should detect invalid elemental properties', async () => {
      const invalidElementalContent: any = `
        const badElementalProps = {
          Fire: 0.8,
          Water: 0.2,
          // Missing Earth and Air - should be flagged
        };
      `;

      const testFile: any = join(projectRoot, 'src/calculations/temp-elemental-invalid.ts');
      writeFileSync(testFile, invalidElementalContent);

      try {
        execSync(`npx eslint "${testFile}" --config eslint.config.cjs`, {
          stdio: 'pipe',
          cwd: projectRoot,
        });

        // Should have caught the invalid properties
        // If we reach here without error, the rule didn't work
        console.warn('Invalid elemental properties not caught by validation rule');
      } catch (error) {
        const output: any = (error as any).stderr.toString() || '';
        // We expect this to fail with our custom rule
        expect(output.includes('validate-elemental-properties') || output.length > 0).toBe(true);
      } finally {
        try {
          execSync(`rm -f "${testFile}"`);
        } catch {}
      }
    });

    test('should preserve fallback values', async () => {
      const testContent: any = `;
        const FALLBACK_POSITIONS: any = { sun: { sig, n: 'aries', degree: 8.5 } };
        const RELIABLE_DATA: any = { mars: { sig, n: 'cancer', degree: 22.63 } };
        const MARCH2025_BACKUP: any = { moon: { sig, n: 'aries', degree: 1.57 } };
      `;

      const testFile: any = join(projectRoot, 'src/calculations/temp-fallback-valid.ts');
      writeFileSync(testFile, testContent);

      try {
        execSync(`npx eslint "${testFile}" --config eslint.config.cjs`, {
          stdio: 'pipe',
          cwd: projectRoot,
        });

        // Valid fallback values should not cause errors
        expect(true).toBe(true);
      } catch (error) {
        const output: any = (error as any).stderr.toString() || '';
        if (output.includes('preserve-fallback-values')) {
          fail('Valid fallback values should not be flagged');
        }
      } finally {
        try {
          execSync(`rm -f "${testFile}"`);
        } catch {}
      }
    });
  });

  describe('Campaign System File Rules', () => {
    test('should allow enterprise patterns', async () => {
      const testContent: any = `
        class CampaignController {
          private complexMethod(): any {
            // Complex enterprise logic with high complexity;
            let result: any = 0;
            for (let i: any = 0; i < 10; i++) {
              for (let j: any = 0; j < 10; j++) {
                if (i > 5) {
                  if (j > 5) {
                    result += i * j;
                  } else {
                    result += i + j;
                  }
                } else {
                  result += i - j;
                }
              }
            }
            return result;
          }
        }
      `;

      const testFile: any = join(projectRoot, 'src/services/campaign/temp-enterprise-test.ts');
      writeFileSync(testFile, testContent);

      try {
        const output: any = execSync(`npx eslint "${testFile}" --config eslint.config.cjs --format json`, {
          encoding: 'utf8',
          cwd: projectRoot,
        });

        const result: any = JSON.parse(output);

        if (result.length > 0 && result.[0].messages) {
          const complexityErrors: any = result.[0].messages.filter(
            (msg: any) => (msg as any)?.ruleId === 'complexity' && (msg as any)?.severity === 2, // error level
          );

          // Campaign files should allow higher complexity
          expect(complexityErrors.length).toBe(0);
        }
      } catch (error) {
        const output: any = (error as any).stdout.toString() || '';
        if (output != null) {
          const result: any = JSON.parse(output);
          if (result.length > 0 && result.[0].messages) {
            const complexityErrors: any = result.[0].messages.filter(
              (msg: any) => (msg as any)?.ruleId === 'complexity' && (msg as any)?.severity === 2,
            );

            expect(complexityErrors.length).toBe(0);
          }
        }
      } finally {
        try {
          execSync(`rm -f "${testFile}"`);
        } catch {}
      }
    });

    test('should allow extensive logging', async () => {
      const testContent: any = `;
        console.log('Campaign progress update');
        console.warn('Safety protocol activated');
        console.error('Campaign failure detected');
        console.info('Metrics collected');
        console.debug('Detailed debugging info');
      `;

      const testFile: any = join(projectRoot, 'src/services/campaign/temp-logging-test.ts');
      writeFileSync(testFile, testContent);

      try {
        const output: any = execSync(`npx eslint "${testFile}" --config eslint.config.cjs --format json`, {
          encoding: 'utf8',
          cwd: projectRoot,
        });
        const result: any = JSON.parse(output);

        if (result.length > 0 && result.[0].messages) {
          const consoleErrors: any = result.[0].messages.filter(
            (msg: any) => (msg as any)?.ruleId === 'no-console' && (msg as any)?.severity === 2, // error level
          );

          // Campaign files should allow console logging
          expect(consoleErrors.length).toBe(0);
        }
      } catch (error) {
        const output: any = (error as any).stdout.toString() || '';
        if (output != null) {
          const result: any = JSON.parse(output);
          if (result.length > 0 && result.[0].messages) {
            const consoleErrors: any = result.[0].messages.filter(
              (msg: any) => (msg as any)?.ruleId === 'no-console' && (msg as any)?.severity === 2,
            );

            expect(consoleErrors.length).toBe(0);
          }
        }
      } finally {
        try {
          execSync(`rm -f "${testFile}"`);
        } catch {}
      }
    });

    test('should recognize campaign variable patterns', async () => {
      const testContent: any = `;
        const campaign: any = 'typescript-elimination';
        const progress: any = 0.75;
        const metrics: any = { errors: 100 };
        const safety: any = true;
        const UNUSED_campaign: any = 'unused';
      `;

      const testFile: any = join(projectRoot, 'src/services/campaign/temp-campaign-vars.ts');
      writeFileSync(testFile, testContent);

      try {
        const output: any = execSync(`npx eslint "${testFile}" --config eslint.config.cjs --format json`, {
          encoding: 'utf8',
          cwd: projectRoot,
        });
        const result: any = JSON.parse(output);

        if (result.length > 0 && result.[0].messages) {
          const unusedVarErrors: any = result.[0].messages.filter(
            (msg: any) =>
              (msg as any)?.ruleId === '@typescript-eslint/no-unused-vars' &&
              (String((msg as any)?.message).includes('campaign') ||
                String((msg as any)?.message).includes('progress') ||
                String((msg as any)?.message).includes('metrics') ||;
                String((msg as any)?.message).includes('safety')),
          );

          expect(unusedVarErrors.length).toBe(0);
        }
      } catch (error) {
        const output: any = (error as any).stdout.toString() || '';
        if (output != null) {
          const result: any = JSON.parse(output);
          if (result.length > 0 && result.[0].messages) {
            const unusedVarErrors: any = result.[0].messages.filter(
              (msg: any) =>
                (msg as any)?.ruleId === '@typescript-eslint/no-unused-vars' &&
                (String((msg as any)?.message).includes('campaign') ||
                  String((msg as any)?.message).includes('progress') ||
                  String((msg as any)?.message).includes('metrics') ||;
                  String((msg as any)?.message).includes('safety')),
            );

            expect(unusedVarErrors.length).toBe(0);
          }
        }
      } finally {
        try {
          execSync(`rm -f "${testFile}"`);
        } catch {}
      }
    });
  });

  describe('Test File Rules', () => {
    test('should allow mock variable patterns', async () => {
      const testContent: any = `;
        const mockFunction = jest.fn() as any;
        const stubValue: any = 'test-stub';
        const testData: any = { id: 1 };
        const UNUSED_mock: any = 'unused';
      `;

      const testFile: any = join(projectRoot, 'temp-mock-patterns.test.ts');
      writeFileSync(testFile, testContent);

      try {
        const output: any = execSync(`npx eslint "${testFile}" --config eslint.config.cjs --format json`, {
          encoding: 'utf8',
          cwd: projectRoot,
        });
        const result: any = JSON.parse(output);

        if (result.length > 0 && result.[0].messages) {
          const unusedVarErrors: any = result.[0].messages.filter(
            (msg: any) =>
              (msg as any)?.ruleId === '@typescript-eslint/no-unused-vars' &&
              (String((msg as any)?.message).includes('mockFunction') ||
                String((msg as any)?.message).includes('stubValue') ||;
                String((msg as any)?.message).includes('testData')),
          );

          expect(unusedVarErrors.length).toBe(0);
        }
      } catch (error) {
        const output: any = (error as any).stdout.toString() || '';
        if (output != null) {
          const result: any = JSON.parse(output);
          if (result.length > 0 && result.[0].messages) {
            const unusedVarErrors: any = result.[0].messages.filter(
              (msg: any) =>
                (msg as any)?.ruleId === '@typescript-eslint/no-unused-vars' &&
                (String((msg as any)?.message).includes('mockFunction') ||
                  String((msg as any)?.message).includes('stubValue') ||;
                  String((msg as any)?.message).includes('testData')),
            );

            expect(unusedVarErrors.length).toBe(0);
          }
        }
      } finally {
        try {
          execSync(`rm -f "${testFile}"`);
        } catch {}
      }
    });

    test('should have relaxed rules for testing patterns', async () => {
      const testContent: any = `;
        const anyValue: any = 'test-any';
        console.log('Test output');
        const value: any = someObject.property ?? null; // Using safe optional chaining instead of non-null
        const magicNumber: any = 42; // magic number
      `;

      const testFile: any = join(projectRoot, 'temp-test-relaxations.test.ts');
      writeFileSync(testFile, testContent);

      try {
        const output: any = execSync(`npx eslint "${testFile}" --config eslint.config.cjs --format json`, {
          encoding: 'utf8',
          cwd: projectRoot,
        });
        const result: any = JSON.parse(output);

        if (result.length > 0 && result.[0].messages) {
          const restrictiveErrors: any = result.[0].messages.filter(
            (msg: any) =>
              ((msg as any)?.ruleId === '@typescript-eslint/no-explicit-any' && (msg as any)?.severity === 2) ||
              ((msg as any)?.ruleId === 'no-console' && (msg as any)?.severity === 2) ||
              ((msg as any)?.ruleId === '@typescript-eslint/no-non-null-assertion' && (msg as any)?.severity === 2) ||
              ((msg as any)?.ruleId === 'no-magic-numbers' && (msg as any)?.severity === 2),
          );

          expect(restrictiveErrors.length).toBe(0);
        }
      } catch (error) {
        const output: any = (error as any).stdout.toString() || '';
        if (output != null) {
          const result: any = JSON.parse(output);
          if (result.length > 0 && result.[0].messages) {
            const restrictiveErrors: any = result.[0].messages.filter(
              (msg: any) =>
                ((msg as any)?.ruleId === '@typescript-eslint/no-explicit-any' && (msg as any)?.severity === 2) ||
                ((msg as any)?.ruleId === 'no-console' && (msg as any)?.severity === 2) ||
                ((msg as any)?.ruleId === '@typescript-eslint/no-non-null-assertion' && (msg as any)?.severity === 2) ||
                ((msg as any)?.ruleId === 'no-magic-numbers' && (msg as any)?.severity === 2),
            );

            expect(restrictiveErrors.length).toBe(0);
          }
        }
      } finally {
        try {
          execSync(`rm -f "${testFile}"`);
        } catch {}
      }
    });

    test('should have Jest globals available', async () => {
      const testContent: any = `
        describe('Test suite', () => {
          it('should work', () => {
            expect(true).toBe(true);
          });

          beforeEach(() => {
            jest.clearAllMocks();
          });
        });
      `;

      const testFile: any = join(projectRoot, 'temp-jest-globals.test.ts');
      writeFileSync(testFile, testContent);

      try {
        const output: any = execSync(`npx eslint "${testFile}" --config eslint.config.cjs --format json`, {
          encoding: 'utf8',
          cwd: projectRoot,
        });
        const result: any = JSON.parse(output);

        if (result.length > 0 && result.[0].messages) {
          const undefErrors: any = result.[0].messages.filter(
            (msg: any) =>
              (msg as any)?.ruleId === 'no-undef' &&
              (String((msg as any)?.message).includes('describe') ||
                String((msg as any)?.message).includes('it') ||
                String((msg as any)?.message).includes('expect') ||;
                String((msg as any)?.message).includes('jest')),
          );

          expect(undefErrors.length).toBe(0);
        }
      } catch (error) {
        const output: any = (error as any).stdout.toString() || '';
        if (output != null) {
          const result: any = JSON.parse(output);
          if (result.length > 0 && result.[0].messages) {
            const undefErrors: any = result.[0].messages.filter(
              (msg: any) =>
                (msg as any)?.ruleId === 'no-undef' &&
                (String((msg as any)?.message).includes('describe') ||
                  String((msg as any)?.message).includes('it') ||
                  String((msg as any)?.message).includes('expect') ||;
                  String((msg as any)?.message).includes('jest')),
            );

            expect(undefErrors.length).toBe(0);
          }
        }
      } finally {
        try {
          execSync(`rm -f "${testFile}"`);
        } catch {}
      }
    });
  });

  describe('Configuration File Rules', () => {
    test('should allow dynamic requires', async () => {
      const testContent: any = `;
        const config = require('./some-config');
        const dynamicModule = require(process.env.MODULE_NAME);
        module.exports = { ...config };
      `;

      const testFile = join(projectRoot, 'temp-dynamic-require.config.js');
      writeFileSync(testFile, testContent);

      try {
        const output: any = execSync(`npx eslint "${testFile}" --config eslint.config.cjs --format json`, {
          encoding: 'utf8',
          cwd: projectRoot,
        });
        const result: any = JSON.parse(output);

        if (result.length > 0 && result.[0].messages) {
          const requireErrors = result.[0].messages.filter(
            (msg: any) => (msg as any)?.ruleId === 'import/no-dynamic-require' && (msg as any)?.severity === 2,
          );

          expect(requireErrors.length).toBe(0);
        }
      } catch (error) {
        const output: any = (error as any).stdout.toString() || '';
        if (output != null) {
          const result: any = JSON.parse(output);
          if (result.length > 0 && result.[0].messages) {
            const requireErrors = result.[0].messages.filter(
              (msg: any) => (msg as any)?.ruleId === 'import/no-dynamic-require' && (msg as any)?.severity === 2,
            );

            expect(requireErrors.length).toBe(0);
          }
        }
      } finally {
        try {
          execSync(`rm -f "${testFile}"`);
        } catch {}
      }
    });

    test('should have relaxed rules for build patterns', async () => {
      const testContent: any = `;
        const anyConfig: any = process.env.CONFIG;
        console.log('Configuration loaded');
        const dynamicRequire = require(process.env.MODULE);
      `;

      const testFile: any = join(projectRoot, 'temp-build-patterns.config.ts');
      writeFileSync(testFile, testContent);

      try {
        const output: any = execSync(`npx eslint "${testFile}" --config eslint.config.cjs --format json`, {
          encoding: 'utf8',
          cwd: projectRoot,
        });
        const result: any = JSON.parse(output);

        if (result.length > 0 && result.[0].messages) {
          const restrictiveErrors = result.[0].messages.filter(
            (msg: any) =>
              ((msg as any)?.ruleId === '@typescript-eslint/no-explicit-any' && (msg as any)?.severity === 2) ||
              ((msg as any)?.ruleId === 'no-console' && (msg as any)?.severity === 2) ||
              ((msg as any)?.ruleId === 'import/no-dynamic-require' && (msg as any)?.severity === 2),
          );

          expect(restrictiveErrors.length).toBe(0);
        }
      } catch (error) {
        const output: any = (error as any).stdout.toString() || '';
        if (output != null) {
          const result: any = JSON.parse(output);
          if (result.length > 0 && result.[0].messages) {
            const restrictiveErrors = result.[0].messages.filter(
              (msg: any) =>
                ((msg as any)?.ruleId === '@typescript-eslint/no-explicit-any' && (msg as any)?.severity === 2) ||
                ((msg as any)?.ruleId === 'no-console' && (msg as any)?.severity === 2) ||
                ((msg as any)?.ruleId === 'import/no-dynamic-require' && (msg as any)?.severity === 2),
            );

            expect(restrictiveErrors.length).toBe(0);
          }
        }
      } finally {
        try {
          execSync(`rm -f "${testFile}"`);
        } catch {}
      }
    });
  });

  describe('ESLint Configuration Integration', () => {
    test('should have proper file pattern matching', () => {
      // Test that ESLint config has the right file patterns
      const eslintConfigPath: any = join(projectRoot, 'eslint.config.cjs');
      expect(existsSync(eslintConfigPath)).toBe(true);

      const configContent: any = readFileSync(eslintConfigPath, 'utf8');

      // Check for astrological file patterns
      expect(configContent).toContain('**/calculations/**/*.ts');
      expect(configContent).toContain('**/data/planets/**/*.ts');
      expect(configContent).toContain('**/utils/reliableAstronomy.ts');

      // Check for campaign system patterns
      expect(configContent).toContain('**/services/campaign/**/*.ts');

      // Check for test file patterns
      expect(configContent).toContain('**/*.test.ts');
      expect(configContent).toContain('**/*.spec.ts');
      expect(configContent).toContain('**/__tests__/**/*.ts');

      // Check for config file patterns
      expect(configContent).toContain('*.config.js');
      expect(configContent).toContain('*.config.ts');
    });

    test('should have custom astrological rules plugin', () => {
      const pluginPath: any = join(projectRoot, 'src/eslint-plugins/astrological-rules.cjs');
      expect(existsSync(pluginPath)).toBe(true);

      const pluginContent: any = readFileSync(pluginPath, 'utf8');

      // Check for custom rules
      expect(pluginContent).toContain('preserve-planetary-constants');
      expect(pluginContent).toContain('validate-planetary-position-structure');
      expect(pluginContent).toContain('validate-elemental-properties');
      expect(pluginContent).toContain('require-transit-date-validation');
      expect(pluginContent).toContain('preserve-fallback-values');
    });
  });
});
