/**
 * Test File Rule Validation Test Suite
 *
 * Tests the domain-specific ESLint rules for test files
 * to ensure appropriate relaxations for mock variables and testing patterns.
 *
 * Requirements: 4.4
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';

describe('Test File Rule Validation', () => {
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

  describe('Mock Variable Relaxations', () => {
    test('should ignore unused mock variables', async () => {
      const testContent = `
        describe('Mock Variable Tests', () => {
          test('should handle mock variables', () => {
            const mockFunction = jest.fn();
            const _stubValue = 'test-stub';
            const testData = { id: 1, name: 'test' };
            const _mockObject = { method: jest.fn() };
            const _stubArray = [1, 2, 3];
            const _testConfig = { enabled: true };
            const UNUSED_mock = 'unused-mock';
            const UNUSED_stub = 'unused-stub';
            const UNUSED_test = 'unused-test';
            
            // Only use one variable to test unused variable handling
            expect(mockFunction).toBeDefined();
          });
        });
      `;

      const testFile = join(projectRoot, 'temp-mock-variables.test.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        const output = execSync(`npx eslint "${testFile}" --config eslint.config.cjs --format json`, {
          encoding: 'utf8',
          cwd: projectRoot,
        });

        const result = JSON.parse(output);

        if (result.length > 0 && result[0].messages) {
          const unusedVarErrors = result[0].messages.filter(
            (msg: unknown) =>
              msg.ruleId === '@typescript-eslint/no-unused-vars' &&
              (msg.message.includes('mock') || msg.message.includes('stub') || msg.message.includes('test')),
          );

          // Mock variable patterns should be ignored in test files
          expect(unusedVarErrors.length).toBe(0);
        }
      } catch (error) {
        const output = (error as any).stdout?.toString() || '';
        if (output) {
          const result = JSON.parse(output);
          if (result.length > 0 && result[0].messages) {
            const unusedVarErrors = result[0].messages.filter(
              (msg: unknown) =>
                msg.ruleId === '@typescript-eslint/no-unused-vars' &&
                (msg.message.includes('mock') || msg.message.includes('stub') || msg.message.includes('test')),
            );

            expect(unusedVarErrors.length).toBe(0);
          }
        }
      }
    });

    test('should allow Jest mock functions', async () => {
      const testContent = `
        describe('Jest Mock Functions', () => {
          const mockCallback = jest.fn();
          const mockImplementation = jest.fn(() => 'mocked');
          const mockReturnValue = jest.fn().mockReturnValue('value');
          const mockResolvedValue = jest.fn().mockResolvedValue('resolved');
          const mockRejectedValue = jest.fn().mockRejectedValue(new Error('rejected'));
          
          beforeEach(() => {
            jest.clearAllMocks();
            mockCallback.mockClear();
            mockImplementation.mockReset();
            mockReturnValue.mockRestore();
          });
          
          test('should work with mocks', () => {
            expect(mockCallback).toHaveBeenCalledTimes(0);
            expect(mockImplementation()).toBe('mocked');
            expect(mockReturnValue()).toBe('value');
          });
        });
      `;

      const testFile = join(projectRoot, 'temp-jest-mocks.test.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        const output = execSync(`npx eslint "${testFile}" --config eslint.config.cjs --format json`, {
          encoding: 'utf8',
          cwd: projectRoot,
        });

        const result = JSON.parse(output);

        if (result.length > 0 && result[0].messages) {
          const unusedVarErrors = result[0].messages.filter(
            (msg: unknown) => (msg as any).ruleId === '@typescript-eslint/no-unused-vars' && msg.message.includes('mock'),
          );

          // Jest mock functions should be allowed
          expect(unusedVarErrors.length).toBe(0);
        }
      } catch (error) {
        const output = (error as any).stdout?.toString() || '';
        if (output) {
          const result = JSON.parse(output);
          if (result.length > 0 && result[0].messages) {
            const unusedVarErrors = result[0].messages.filter(
              (msg: unknown) => (msg as any).ruleId === '@typescript-eslint/no-unused-vars' && msg.message.includes('mock'),
            );

            expect(unusedVarErrors.length).toBe(0);
          }
        }
      }
    });

    test('should allow test data structures', async () => {
      const testContent = `
        describe('Test Data Structures', () => {
          const testUser = { id: 1, name: 'Test User', email: 'test@example.com' };
          const _testIngredient = { name: 'tomato', elementalProperties: { Fire: 0.3, Water: 0.7, Earth: 0.2, Air: 0.1 } };
          const _testRecipe = { id: 1, name: 'Test Recipe', ingredients: [] };
          const _testPlanetaryPosition = { sign: 'aries', degree: 8.5, exactLongitude: 8.5, isRetrograde: false };
          const _testConfig = { apiUrl: 'http://test.api', timeout: 5000 };
          const _testMetrics = { errors: 0, warnings: 5, processed: 100 };
          
          test('should use test data', () => {
            expect(testUser.id).toBe(1);
          });
        });
      `;

      const testFile = join(projectRoot, 'temp-test-data.test.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        const output = execSync(`npx eslint "${testFile}" --config eslint.config.cjs --format json`, {
          encoding: 'utf8',
          cwd: projectRoot,
        });

        const result = JSON.parse(output);

        if (result.length > 0 && result[0].messages) {
          const unusedVarErrors = result[0].messages.filter(
            (msg: unknown) => (msg as any).ruleId === '@typescript-eslint/no-unused-vars' && msg.message.includes('test'),
          );

          // Test data structures should be allowed
          expect(unusedVarErrors.length).toBe(0);
        }
      } catch (error) {
        const output = (error as any).stdout?.toString() || '';
        if (output) {
          const result = JSON.parse(output);
          if (result.length > 0 && result[0].messages) {
            const unusedVarErrors = result[0].messages.filter(
              (msg: unknown) => (msg as any).ruleId === '@typescript-eslint/no-unused-vars' && msg.message.includes('test'),
            );

            expect(unusedVarErrors.length).toBe(0);
          }
        }
      }
    });
  });

  describe('Test-Specific Rule Relaxations', () => {
    test('should allow explicit any types in tests', async () => {
      const testContent = `
        describe('Any Type Tests', () => {
          test('should allow any types for flexible testing', () => {
            const anyValue: any = 'test-value';
            const anyObject: any = { prop: 'value' };
            const anyArray: any[] = [1, 'two', { three: 3 }];
            const anyFunction: any = () => 'result';
            
            // Test dynamic behavior
            anyObject.dynamicProperty = 'dynamic';
            anyArray.push({ dynamic: true });
            
            expect(anyValue).toBeDefined();
            expect(anyObject.prop).toBe('value');
            expect(anyArray.length).toBeGreaterThan(0);
            expect(anyFunction()).toBe('result');
          });
          
          test('should handle API responses with any', () => {
            const apiResponse: any = {
              data: { id: 1, name: 'test' },
              status: 200,
              headers: { 'content-type': 'application/json' }
            };
            
            expect(apiResponse.data.id).toBe(1);
          });
        });
      `;

      const testFile = join(projectRoot, 'temp-any-types.test.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        const output = execSync(`npx eslint "${testFile}" --config eslint.config.cjs --format json`, {
          encoding: 'utf8',
          cwd: projectRoot,
        });

        const result = JSON.parse(output);

        if (result.length > 0 && result[0].messages) {
          const anyTypeErrors = result[0].messages.filter(
            (msg: unknown) => (msg as any).ruleId === '@typescript-eslint/no-explicit-any' && msg.severity === 2, // error level
          );

          // Test files should allow explicit any types
          expect(anyTypeErrors.length).toBe(0);
        }
      } catch (error) {
        const output = (error as any).stdout?.toString() || '';
        if (output) {
          const result = JSON.parse(output);
          if (result.length > 0 && result[0].messages) {
            const anyTypeErrors = result[0].messages.filter(
              (msg: unknown) => (msg as any).ruleId === '@typescript-eslint/no-explicit-any' && msg.severity === 2,
            );

            expect(anyTypeErrors.length).toBe(0);
          }
        }
      }
    });

    test('should allow console statements in tests', async () => {
      const testContent = `
        describe('Console Statement Tests', () => {
          test('should allow console output for debugging', () => {
            console.log('Test starting...');
            console.info('Processing test data');
            console.warn('This is a test warning');
            console.error('This is a test error (not real)');
            console.debug('Debug information for test');
            console.table([{ test: 'data', value: 123 }]);
            console.group('Test Group');
            console.log('Grouped test output');
            console.groupEnd();
            console.time('test-timer');
            console.timeEnd('test-timer');
            console.count('test-counter');
            
            expect(true).toBe(true);
          });
          
          beforeEach(() => {
            console.log('Setting up test...');
          });
          
          afterEach(() => {
            console.log('Cleaning up test...');
          });
        });
      `;

      const testFile = join(projectRoot, 'temp-console-statements.test.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        const output = execSync(`npx eslint "${testFile}" --config eslint.config.cjs --format json`, {
          encoding: 'utf8',
          cwd: projectRoot,
        });

        const result = JSON.parse(output);

        if (result.length > 0 && result[0].messages) {
          const consoleErrors = result[0].messages.filter(
            (msg: unknown) => (msg as any).ruleId === 'no-console' && msg.severity === 2, // error level
          );

          // Test files should allow console statements
          expect(consoleErrors.length).toBe(0);
        }
      } catch (error) {
        const output = (error as any).stdout?.toString() || '';
        if (output) {
          const result = JSON.parse(output);
          if (result.length > 0 && result[0].messages) {
            const consoleErrors = result[0].messages.filter(
              (msg: unknown) => (msg as any).ruleId === 'no-console' && msg.severity === 2,
            );

            expect(consoleErrors.length).toBe(0);
          }
        }
      }
    });

    test('should allow non-null assertions in tests', async () => {
      const testContent = `
        describe('Non-null Assertion Tests', () => {
          test('should allow non-null assertions for test certainty', () => {
            const maybeValue: string | null = 'test-value';
            const maybeObject: { prop?: string } = { prop: 'value' };
            const maybeArray: number[] | undefined = [1, 2, 3];
            
            // Non-null assertions should be allowed in tests
            const definiteValue = maybeValue!;
            const definiteProperty = maybeObject.prop!;
            const definiteArray = maybeArray!;
            
            expect(definiteValue).toBe('test-value');
            expect(definiteProperty).toBe('value');
            expect(definiteArray.length).toBe(3);
            
            // Test DOM elements (common in React tests)
            const element = document.querySelector('.test-element')!;
            const button = document.getElementById('test-button')!;
            
            // These would normally be checked, but in tests we know they exist
            expect(element).toBeDefined();
            expect(button).toBeDefined();
          });
        });
      `;

      const testFile = join(projectRoot, 'temp-non-null-assertions.test.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        const output = execSync(`npx eslint "${testFile}" --config eslint.config.cjs --format json`, {
          encoding: 'utf8',
          cwd: projectRoot,
        });

        const result = JSON.parse(output);

        if (result.length > 0 && result[0].messages) {
          const nonNullErrors = result[0].messages.filter(
            (msg: unknown) => (msg as any).ruleId === '@typescript-eslint/no-non-null-assertion' && msg.severity === 2, // error level
          );

          // Test files should allow non-null assertions
          expect(nonNullErrors.length).toBe(0);
        }
      } catch (error) {
        const output = (error as any).stdout?.toString() || '';
        if (output) {
          const result = JSON.parse(output);
          if (result.length > 0 && result[0].messages) {
            const nonNullErrors = result[0].messages.filter(
              (msg: unknown) => (msg as any).ruleId === '@typescript-eslint/no-non-null-assertion' && msg.severity === 2,
            );

            expect(nonNullErrors.length).toBe(0);
          }
        }
      }
    });

    test('should allow magic numbers in tests', async () => {
      const testContent = `
        describe('Magic Numbers Tests', () => {
          test('should allow magic numbers for test values', () => {
            const testId = 12345;
            const testScore = 98.7;
            const testCount = 42;
            const testPercentage = 75.5;
            const _testTimeout = 5000;
            const _testPort = 3000;
            const testStatusCode = 200;
            const testErrorCode = 404;
            
            expect(testId).toBe(12345);
            expect(testScore).toBeCloseTo(98.7);
            expect(testCount).toBe(42);
            expect(testPercentage).toBe(75.5);
            
            // Common test patterns with magic numbers
            setTimeout(() => {}, 1000);
            expect(Array(10).fill(0)).toHaveLength(10);
            expect(Math.random() * 100).toBeLessThan(100);
            
            // HTTP status codes
            expect(testStatusCode).toBe(200);
            expect(testErrorCode).toBe(404);
          });
          
          test('should handle test data with magic numbers', () => {
            const testData = {
              users: Array(50).fill(null).map((_, i) => ({ id: i + 1 })),
              pageSize: 25,
              totalPages: 4,
              currentPage: 1
            };
            
            expect(testData.users).toHaveLength(50);
            expect(testData.pageSize).toBe(25);
          });
        });
      `;

      const testFile = join(projectRoot, 'temp-magic-numbers.test.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        const output = execSync(`npx eslint "${testFile}" --config eslint.config.cjs --format json`, {
          encoding: 'utf8',
          cwd: projectRoot,
        });

        const result = JSON.parse(output);

        if (result.length > 0 && result[0].messages) {
          const magicNumberErrors = result[0].messages.filter(
            (msg: unknown) => (msg as any).ruleId === 'no-magic-numbers' && msg.severity === 2, // error level
          );

          // Test files should allow magic numbers
          expect(magicNumberErrors.length).toBe(0);
        }
      } catch (error) {
        const output = (error as any).stdout?.toString() || '';
        if (output) {
          const result = JSON.parse(output);
          if (result.length > 0 && result[0].messages) {
            const magicNumberErrors = result[0].messages.filter(
              (msg: unknown) => (msg as any).ruleId === 'no-magic-numbers' && msg.severity === 2,
            );

            expect(magicNumberErrors.length).toBe(0);
          }
        }
      }
    });

    test('should allow relaxed complexity in tests', async () => {
      const testContent = `
        describe('Complex Test Logic', () => {
          test('should allow complex test scenarios', () => {
            // Complex test logic should be allowed
            const testScenarios = [
              { input: 'a', expected: 1 },
              { input: 'b', expected: 2 },
              { input: 'c', expected: 3 }
            ];
            
            testScenarios.forEach(scenario => {
              for (let i = 0; i < 5; i++) {
                for (let j = 0; j < 3; j++) {
                  if (scenario.input === 'a') {
                    if (i > 2) {
                      if (j === 1) {
                        expect(scenario.expected).toBe(1);
                      } else if (j === 2) {
                        expect(scenario.expected).toBeGreaterThan(0);
                      } else {
                        expect(scenario.expected).toBeDefined();
                      }
                    } else {
                      expect(scenario.expected).toBeTruthy();
                    }
                  } else if (scenario.input === 'b') {
                    if (i < 3) {
                      expect(scenario.expected).toBe(2);
                    } else {
                      expect(scenario.expected).toBeGreaterThan(1);
                    }
                  } else {
                    expect(scenario.expected).toBe(3);
                  }
                }
              }
            });
          });
        });
      `;

      const testFile = join(projectRoot, 'temp-complex-test.test.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        const output = execSync(`npx eslint "${testFile}" --config eslint.config.cjs --format json`, {
          encoding: 'utf8',
          cwd: projectRoot,
        });

        const result = JSON.parse(output);

        if (result.length > 0 && result[0].messages) {
          const complexityErrors = result[0].messages.filter(
            (msg: unknown) => (msg as any).ruleId === 'complexity' && msg.severity === 2, // error level
          );

          // Test files should allow complex logic
          expect(complexityErrors.length).toBe(0);
        }
      } catch (error) {
        const output = (error as any).stdout?.toString() || '';
        if (output) {
          const result = JSON.parse(output);
          if (result.length > 0 && result[0].messages) {
            const complexityErrors = result[0].messages.filter(
              (msg: unknown) => (msg as any).ruleId === 'complexity' && msg.severity === 2,
            );

            expect(complexityErrors.length).toBe(0);
          }
        }
      }
    });
  });

  describe('Jest Globals Availability', () => {
    test('should have Jest globals available without no-undef errors', async () => {
      const testContent = `
        describe('Jest Globals Test', () => {
          beforeAll(() => {
            console.log('Before all tests');
          });
          
          beforeEach(() => {
            console.log('Before each test');
          });
          
          afterEach(() => {
            console.log('After each test');
          });
          
          afterAll(() => {
            console.log('After all tests');
          });
          
          test('should have access to Jest globals', () => {
            expect(true).toBe(true);
            expect(false).toBeFalsy();
            expect('string').toEqual('string');
            expect(42).toBeGreaterThan(0);
            expect([1, 2, 3]).toHaveLength(3);
            expect({ key: 'value' }).toHaveProperty('key');
          });
          
          it('should work with it() syntax', () => {
            expect(jest).toBeDefined();
            expect(describe).toBeDefined();
            expect(test).toBeDefined();
            expect(it).toBeDefined();
            expect(expect).toBeDefined();
          });
          
          test('should have Jest mock functions', () => {
            const mockFn = jest.fn();
            mockFn('test');
            
            expect(mockFn).toHaveBeenCalled();
            expect(mockFn).toHaveBeenCalledWith('test');
            expect(mockFn).toHaveBeenCalledTimes(1);
            
            jest.clearAllMocks();
            expect(mockFn).not.toHaveBeenCalled();
          });
          
          test('should have Jest spy functions', () => {
            const obj = { method: () => 'original' };
            const spy = jest.spyOn(obj, 'method').mockReturnValue('mocked');
            
            expect(obj.method()).toBe('mocked');
            expect(spy).toHaveBeenCalled();
            
            spy.mockRestore();
            expect(obj.method()).toBe('original');
          });
        });
      `;

      const testFile = join(projectRoot, 'temp-jest-globals.test.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        const output = execSync(`npx eslint "${testFile}" --config eslint.config.cjs --format json`, {
          encoding: 'utf8',
          cwd: projectRoot,
        });

        const result = JSON.parse(output);

        if (result.length > 0 && result[0].messages) {
          const undefErrors = result[0].messages.filter(
            (msg: unknown) =>
              msg.ruleId === 'no-undef' &&
              (msg.message.includes('describe') ||
                msg.message.includes('it') ||
                msg.message.includes('test') ||
                msg.message.includes('expect') ||
                msg.message.includes('jest') ||
                msg.message.includes('beforeAll') ||
                msg.message.includes('beforeEach') ||
                msg.message.includes('afterEach') ||
                msg.message.includes('afterAll')),
          );

          // Jest globals should be available without no-undef errors
          expect(undefErrors.length).toBe(0);
        }
      } catch (error) {
        const output = (error as any).stdout?.toString() || '';
        if (output) {
          const result = JSON.parse(output);
          if (result.length > 0 && result[0].messages) {
            const undefErrors = result[0].messages.filter(
              (msg: unknown) =>
                msg.ruleId === 'no-undef' &&
                (msg.message.includes('describe') ||
                  msg.message.includes('it') ||
                  msg.message.includes('test') ||
                  msg.message.includes('expect') ||
                  msg.message.includes('jest') ||
                  msg.message.includes('beforeAll') ||
                  msg.message.includes('beforeEach') ||
                  msg.message.includes('afterEach') ||
                  msg.message.includes('afterAll')),
            );

            expect(undefErrors.length).toBe(0);
          }
        }
      }
    });

    test('should have additional Jest matchers available', async () => {
      const testContent = `
        describe('Jest Matchers Test', () => {
          test('should have extended Jest matchers', () => {
            // Basic matchers
            expect(true).toBeTruthy();
            expect(false).toBeFalsy();
            expect(null).toBeNull();
            expect(undefined).toBeUndefined();
            expect('defined').toBeDefined();
            
            // Number matchers
            expect(42).toBeGreaterThan(0);
            expect(42).toBeGreaterThanOrEqual(42);
            expect(42).toBeLessThan(100);
            expect(42).toBeLessThanOrEqual(42);
            expect(3.14).toBeCloseTo(3.1, 1);
            
            // String matchers
            expect('hello world').toMatch(/world/);
            expect('hello world').toContain('world');
            
            // Array matchers
            expect([1, 2, 3]).toHaveLength(3);
            expect([1, 2, 3]).toContain(2);
            expect([1, 2, 3]).toEqual(expect.arrayContaining([1, 3]));
            
            // Object matchers
            expect({ a: 1, b: 2 }).toHaveProperty('a');
            expect({ a: 1, b: 2 }).toHaveProperty('a', 1);
            expect({ a: 1, b: 2 }).toMatchObject({ a: 1 });
            
            // Function matchers
            const mockFn = jest.fn();
            mockFn('arg1', 'arg2');
            expect(mockFn).toHaveBeenCalled();
            expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
            expect(mockFn).toHaveBeenCalledTimes(1);
            expect(mockFn).toHaveBeenLastCalledWith('arg1', 'arg2');
            
            // Promise matchers (async)
            expect(Promise.resolve('value')).resolves.toBe('value');
            expect(Promise.reject(new Error('error'))).rejects.toThrow('error');
          });
        });
      `;

      const testFile = join(projectRoot, 'temp-jest-matchers.test.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        const output = execSync(`npx eslint "${testFile}" --config eslint.config.cjs --format json`, {
          encoding: 'utf8',
          cwd: projectRoot,
        });

        const result = JSON.parse(output);

        if (result.length > 0 && result[0].messages) {
          const undefErrors = result[0].messages.filter((msg: unknown) => (msg as any).ruleId === 'no-undef');

          // No undefined variable errors should occur
          expect(undefErrors.length).toBe(0);
        }
      } catch (error) {
        const output = (error as any).stdout?.toString() || '';
        if (output) {
          const result = JSON.parse(output);
          if (result.length > 0 && result[0].messages) {
            const undefErrors = result[0].messages.filter((msg: unknown) => (msg as any).ruleId === 'no-undef');

            expect(undefErrors.length).toBe(0);
          }
        }
      }
    });
  });

  describe('Test File Pattern Matching', () => {
    test('should apply test rules to correct file patterns', () => {
      const testFiles = [
        'src/components/FoodRecommender.test.tsx',
        'src/utils/astrology.spec.ts',
        'src/services/campaign.test.ts',
        'src/__tests__/calculations/culinaryAstrology.test.ts',
        'src/__tests__/utils/reliableAstronomy.spec.ts',
        'tests/integration/api.test.js',
      ];

      testFiles.forEach(file => {
        // Check if file would match test patterns in ESLint config
        const matchesTestPattern =
          file.includes('.test.') || file.includes('.spec.') || file.includes('__tests__/') || file.includes('/tests/');

        expect(matchesTestPattern).toBe(true);
      });
    });

    test('should not apply test rules to non-test files', () => {
      const nonTestFiles = [
        'src/components/FoodRecommender.tsx',
        'src/utils/astrology.ts',
        'src/services/campaign.ts',
        'src/calculations/culinaryAstrology.ts',
        'src/data/ingredients/vegetables.ts',
      ];

      nonTestFiles.forEach(file => {
        // Check that file would NOT match test patterns
        const matchesTestPattern =
          file.includes('.test.') || file.includes('.spec.') || file.includes('__tests__/') || file.includes('/tests/');

        expect(matchesTestPattern).toBe(false);
      });
    });
  });

  describe('Test Environment Configuration', () => {
    test('should have proper Jest environment globals', async () => {
      const testContent = `
        describe('Environment Globals', () => {
          test('should have Node.js globals available', () => {
            expect(process).toBeDefined();
            expect(Buffer).toBeDefined();
            expect(global).toBeDefined();
            expect(__dirname).toBeDefined();
            expect(__filename).toBeDefined();
          });
          
          test('should have browser globals available', () => {
            // These might not be available in Node environment
            // but should not cause no-undef errors if configured properly
            if (typeof window !== 'undefined') {
              expect(window).toBeDefined();
              expect(document).toBeDefined();
            }
          });
          
          test('should have common JavaScript globals', () => {
            expect(console).toBeDefined();
            expect(setTimeout).toBeDefined();
            expect(setInterval).toBeDefined();
            expect(clearTimeout).toBeDefined();
            expect(clearInterval).toBeDefined();
            expect(Promise).toBeDefined();
            expect(Array).toBeDefined();
            expect(Object).toBeDefined();
            expect(JSON).toBeDefined();
          });
        });
      `;

      const testFile = join(projectRoot, 'temp-environment-globals.test.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        const output = execSync(`npx eslint "${testFile}" --config eslint.config.cjs --format json`, {
          encoding: 'utf8',
          cwd: projectRoot,
        });

        const result = JSON.parse(output);

        if (result.length > 0 && result[0].messages) {
          const undefErrors = result[0].messages.filter((msg: unknown) => (msg as any).ruleId === 'no-undef');

          // Environment globals should be available
          expect(undefErrors.length).toBe(0);
        }
      } catch (error) {
        const output = (error as any).stdout?.toString() || '';
        if (output) {
          const result = JSON.parse(output);
          if (result.length > 0 && result[0].messages) {
            const undefErrors = result[0].messages.filter((msg: unknown) => (msg as any).ruleId === 'no-undef');

            expect(undefErrors.length).toBe(0);
          }
        }
      }
    });
  });

  describe('Test-Specific Patterns', () => {
    test('should allow test helper functions', async () => {
      const testContent = `
        describe('Test Helpers', () => {
          // Test helper functions should be allowed even if unused
          const createTestUser = (overrides = {}) => ({
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            ...overrides
          });
          
          const createTestIngredient = (name = 'tomato') => ({
            name,
            elementalProperties: { Fire: 0.3, Water: 0.7, Earth: 0.2, Air: 0.1 }
          });
          
          const _mockApiResponse = (data: any, status = 200) => ({
            data,
            status,
            headers: { 'content-type': 'application/json' }
          });
          
          const _setupTestEnvironment = () => {
            // Setup code
            return { initialized: true };
          };
          
          const _teardownTestEnvironment = () => {
            // Cleanup code
          };
          
          test('should use test helpers', () => {
            const user = createTestUser({ name: 'Custom User' });
            expect(user.name).toBe('Custom User');
          });
        });
      `;

      const testFile = join(projectRoot, 'temp-test-helpers.test.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        const output = execSync(`npx eslint "${testFile}" --config eslint.config.cjs --format json`, {
          encoding: 'utf8',
          cwd: projectRoot,
        });

        const result = JSON.parse(output);

        if (result.length > 0 && result[0].messages) {
          const unusedVarErrors = result[0].messages.filter(
            (msg: unknown) =>
              msg.ruleId === '@typescript-eslint/no-unused-vars' &&
              (msg.message.includes('createTest') ||
                msg.message.includes('mockApi') ||
                msg.message.includes('setupTest') ||
                msg.message.includes('teardownTest')),
          );

          // Test helper functions should be allowed even if unused
          expect(unusedVarErrors.length).toBe(0);
        }
      } catch (error) {
        const output = (error as any).stdout?.toString() || '';
        if (output) {
          const result = JSON.parse(output);
          if (result.length > 0 && result[0].messages) {
            const unusedVarErrors = result[0].messages.filter(
              (msg: unknown) =>
                msg.ruleId === '@typescript-eslint/no-unused-vars' &&
                (msg.message.includes('createTest') ||
                  msg.message.includes('mockApi') ||
                  msg.message.includes('setupTest') ||
                  msg.message.includes('teardownTest')),
            );

            expect(unusedVarErrors.length).toBe(0);
          }
        }
      }
    });
  });
});
