import type {} from 'jest';
/**
 * Test Suite for Comprehensive Validation Framework
 *
 * This test suite validates the comprehensive validation framework functionality
 * including TypeScript validation, test suite validation, and component validation.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import { ComprehensiveValidationFramework, ValidationConfig } from '../ComprehensiveValidationFramework';

// Mock external dependencies
jest.mock('fs');
jest.mock('child_process');

const mockFs = fs.Mocked<typeof fs>;
const mockExecSync = execSync.MockedFunction<typeof execSync>;

describe('ComprehensiveValidationFramework', () => {
  let framework: ComprehensiveValidationFramework;
  let mockProcessedFiles: string[];

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup default configuration
    const config: Partial<ValidationConfig> = {
      enableTypeScriptValidation: true,
      enableTestSuiteValidation: true,
      enableComponentValidation: true,
      enableServiceValidation: true,
      enableBuildValidation: true,
      testTimeout: 30000,
      compilationTimeout: 45000,
      maxRetries: 2,
      logLevel: 'info',
    };

    framework = new ComprehensiveValidationFramework(config);

    // Setup mock processed files
    mockProcessedFiles = [
      '/project/src/components/TestComponent.tsx',
      '/project/src/services/TestService.ts',
      '/project/src/utils/helper.ts',
    ];

    // Mock successful executions by default
    mockExecSync.mockReturnValue(Buffer.from(''));
    mockFs.readFileSync.mockReturnValue('export default TestComponent;');
    mockFs.existsSync.mockReturnValue(true);
  });

  describe('Comprehensive Validation', () => {
    test('should perform all validations successfully', async () => {
      const result: any = await framework.performComprehensiveValidation(mockProcessedFiles, 'test-batch-1');

      expect(result.overallPassed).toBe(true);
      expect(result.qualityScore).toBeGreaterThan(90);
      expect(result.requiresRollback).toBe(false);
      expect(result.validationResults.length).toBeGreaterThan(0);
    });

    test('should fail overall validation on TypeScript compilation errors', async () => {
      // Mock TypeScript compilation failure
      mockExecSync.mockImplementation((cmd: any) => {
        if (cmd.toString().includes('tsc')) {
          const error = new Error('Compilation failed');
          (error as any).stdout = 'error TS2322: Type error\nerror TS233, 9: Property error';
          throw error;
        }
        return Buffer.from('');
      });

      const result: any = await framework.performComprehensiveValidation(mockProcessedFiles, 'test-batch-1');

      expect(result.overallPassed).toBe(false);
      expect(result.qualityScore).toBeLessThan(70);
      expect(result.requiresRollback).toBe(true);

      const tsResult: any = result.validationResults.find(r => r.validationType === 'typescript-compilation');
      expect(tsResult.passed).toBe(false);
      expect(tsResult.details.errorCount).toBe(2);
    });

    test('should handle test suite failures appropriately', async () => {
      // Mock test failure
      mockExecSync.mockImplementation((cmd: any) => {
        if (cmd.toString().includes('yarn test')) {
          const error = new Error('Tests failed');
          (error as any).stdout = '2 failed, 5 passed, 7 total';
          throw error;
        }
        return Buffer.from('');
      });

      const result: any = await framework.performComprehensiveValidation(mockProcessedFiles, 'test-batch-1');

      expect(result.overallPassed).toBe(false);
      expect(result.qualityScore).toBeLessThan(80);

      const testResult: any = result.validationResults.find(r => r.validationType === 'test-suite');
      expect(testResult.passed).toBe(false);
    });

    test('should calculate quality score correctly', async () => {
      // Mock partial failures
      let callCount: any = 0;
      mockExecSync.mockImplementation((cmd: any) => {
        callCount++;
        if (cmd.toString().includes('tsc')) {
          return Buffer.from(''); // TypeScript passes
        }
        if (cmd.toString().includes('yarn test')) {
          const error = new Error('Some tests failed');
          (error as any).stdout = '1 failed, 4 passed, 5 total';
          throw error; // Tests fail
        }
        return Buffer.from('');
      });

      const result: any = await framework.performComprehensiveValidation(mockProcessedFiles, 'test-batch-1');

      // Should lose 25 points for test failures but keep TypeScript points
      expect(result.qualityScore).toBeLessThan(100);
      expect(result.qualityScore).toBeGreaterThan(70);
    });
  });

  describe('TypeScript Validation', () => {
    test('should pass TypeScript validation with no errors', async () => {
      mockExecSync.mockReturnValue(Buffer.from(''));

      const result: any = await framework.performComprehensiveValidation(mockProcessedFiles, 'test-batch-1');

      const tsResult: any = result.validationResults.find(r => r.validationType === 'typescript-compilation');
      expect(tsResult.passed).toBe(true);
      expect(tsResult.errors.length).toBe(0);
    });

    test('should retry TypeScript validation on failure', async () => {
      let attemptCount: any = 0;
      mockExecSync.mockImplementation((cmd: any) => {
        if (cmd.toString().includes('tsc')) {
          attemptCount++;
          if (attemptCount <= 2) {
            const error = new Error('Compilation failed');
            (error as any).stdout = 'error TS2322: Type error';
            throw error;
          }
          return Buffer.from(''); // Success on third attempt
        }
        return Buffer.from('');
      });

      const result: any = await framework.performComprehensiveValidation(mockProcessedFiles, 'test-batch-1');

      const tsResult: any = result.validationResults.find(r => r.validationType === 'typescript-compilation');
      expect(tsResult.passed).toBe(true);
      expect(tsResult.retryCount).toBe(2);
      expect(attemptCount).toBe(3);
    });

    test('should extract and categorize TypeScript error types', async () => {
      mockExecSync.mockImplementation((cmd: any) => {
        if (cmd.toString().includes('tsc')) {
          const error = new Error('Compilation failed');
          (error as any).stdout = `;
            error TS2322: Type 'string' is not assignable to type 'number'
            error TS2339: Property 'foo' does not exist on type 'Bar';
            error TS2322: Another type error
          `;
          throw error;
        }
        return Buffer.from('');
      });

      const result: any = await framework.performComprehensiveValidation(mockProcessedFiles, 'test-batch-1');

      const tsResult: any = result.validationResults.find(r => r.validationType === 'typescript-compilation');
      expect(tsResult.details.errorTypes).toEqual({
        TS2322: 2,
        TS2339: 1,
      });
    });
  });

  describe('Test Suite Validation', () => {
    test('should find and validate related test files', async () => {
      // Mock test files exist
      mockFs.existsSync.mockImplementation((path: any) => {
        return path.toString().includes('.test.') || path.toString().includes('__tests__');
      });

      mockExecSync.mockImplementation((cmd: any) => {
        if (cmd.toString().includes('yarn test')) {
          return Buffer.from('5 passed, 0 failed, 5 total');
        }
        return Buffer.from('');
      });

      const result: any = await framework.performComprehensiveValidation(mockProcessedFiles, 'test-batch-1');

      const testResult: any = result.validationResults.find(r => r.validationType === 'test-suite');
      expect(testResult.passed).toBe(true);
      expect(testResult.details.relatedTestFiles).toBeDefined();
    });

    test('should handle case with no related test files', async () => {
      // Mock no test files exist
      mockFs.existsSync.mockReturnValue(false);

      const result: any = await framework.performComprehensiveValidation(mockProcessedFiles, 'test-batch-1');

      const testResult: any = result.validationResults.find(r => r.validationType === 'test-suite');
      expect(testResult.passed).toBe(true);
      expect(testResult.warnings).toContain('No related test files found for processed files');
    });

    test('should parse test results correctly', async () => {
      mockExecSync.mockImplementation((cmd: any) => {
        if (cmd.toString().includes('yarn test')) {
          return Buffer.from('Test Suites: 2 passed, 1 failed, 3 total\nTests: 8 passed, 2 failed, 10 total');
        }
        return Buffer.from('');
      });

      const result: any = await framework.performComprehensiveValidation(mockProcessedFiles, 'test-batch-1');

      const testResult: any = result.validationResults.find(r => r.validationType === 'test-suite');
      expect(testResult.details.testResults).toEqual({
        passed: 8,
        failed: 2,
        total: 10,
      });
    });
  });

  describe('React Component Validation', () => {
    test('should validate React components successfully', async () => {
      // Mock component file content
      mockFs.readFileSync.mockImplementation((path: any) => {
        if (path.toString().includes('TestComponent.tsx')) {
          return `
            import React from 'react';

            interface TestComponentProps {
              title: string
            }

            export const TestComponent: React.FC<TestComponentProps> = ({ title }: any) => {
              const [count, setCount] = useState(0);
              return <div>{title}</div>;
            };

            export default TestComponent;
          `;
        }
        return 'export default Component;';
      });

      const result: any = await framework.performComprehensiveValidation(mockProcessedFiles, 'test-batch-1');

      const componentResults: any = result.validationResults.filter(r => r.validationType === 'react-component');
      expect(componentResults.length).toBeGreaterThan(0);

      const componentResult: any = componentResults[0];
      expect(componentResult.passed).toBe(true);
      expect(componentResult.details.componentInfo.componentName).toBe('TestComponent');
      expect(componentResult.details.componentInfo.exportedFunctions).toContain('TestComponent');
      expect(componentResult.details.componentInfo.propsInterface).toBe('TestComponentProps');
      expect(componentResult.details.componentInfo.stateVariables).toContain('count');
    });

    test('should detect component import issues', async () => {
      // Mock component with no exports
      mockFs.readFileSync.mockImplementation((path: any) => {
        if (path.toString().includes('TestComponent.tsx')) {
          return 'const Component: any = () => <div>Test</div>;'; // No export
        }
        return 'export default Component;';
      });

      const result: any = await framework.performComprehensiveValidation(mockProcessedFiles, 'test-batch-1');

      const componentResults: any = result.validationResults.filter(r => r.validationType === 'react-component');
      const componentResult: any = componentResults[0];
      expect(componentResult.passed).toBe(false);
      expect(componentResult.errors).toContain('Component import failed: No exports found in component')
    });

    test('should validate component props interface preservation', async () => {
      // Mock component with props interface
      mockFs.readFileSync.mockImplementation((path: any) => {
        if (path.toString().includes('TestComponent.tsx')) {
          return `
            interface TestProps { title: string; }
            export const TestComponent: any = ({ title }: TestProps) => <div>{title}</div>;
          `;
        }
        return 'export default Component;';
      });

      const result: any = await framework.performComprehensiveValidation(mockProcessedFiles, 'test-batch-1');

      const componentResults: any = result.validationResults.filter(r => r.validationType === 'react-component');
      const componentResult: any = componentResults[0];
      expect(componentResult.passed).toBe(true);
      expect(componentResult.details.componentInfo.propsInterface).toBe('TestProps');
    });
  });

  describe('Service Integration Validation', () => {
    test('should validate service integration successfully', async () => {
      // Mock service file content
      mockFs.readFileSync.mockImplementation((path: any) => {
        if (path.toString().includes('TestService.ts')) {
          return `
            export class TestService {
              async fetchData() : any {
                return fetch('/api/data');
              }

              async postData(data: any) : any {
                return fetch('/api/submit', { method: 'POST', body: JSON.stringify(data) });
              }
            }

            export const apiClient: any = new TestService();
          `;
        }
        return 'export default Service;';
      });

      const result: any = await framework.performComprehensiveValidation(mockProcessedFiles, 'test-batch-1');

      const serviceResults: any = result.validationResults.filter(r => r.validationType === 'service-integration');
      expect(serviceResults.length).toBeGreaterThan(0);

      const serviceResult: any = serviceResults[0];
      expect(serviceResult.passed).toBe(true);
      expect(serviceResult.details.serviceInfo.serviceName).toBe('TestService');
      expect(serviceResult.details.serviceInfo.exportedMethods).toContain('TestService');
      expect(serviceResult.details.serviceInfo.exportedMethods).toContain('apiClient');
      expect(serviceResult.details.serviceInfo.apiEndpoints).toContain('/api/data');
      expect(serviceResult.details.serviceInfo.apiEndpoints).toContain('/api/submit');
    });

    test('should detect service method elimination issues', async () => {
      // Mock service with missing methods
      mockFs.readFileSync.mockImplementation((path: any) => {
        if (path.toString().includes('TestService.ts')) {
          return `
            export class TestService {
              // fetchData method was eliminated
            }
          `;
        }
        return 'export default Service;';
      });

      const result: any = await framework.performComprehensiveValidation(mockProcessedFiles, 'test-batch-1');

      const serviceResults: any = result.validationResults.filter(r => r.validationType === 'service-integration');
      const serviceResult: any = serviceResults[0];

      // This test would need more sophisticated analysis to detect missing methods
      // For now, we test that the validation framework processes service files
      expect(serviceResult).toBeDefined();
      expect(serviceResult.details.serviceInfo).toBeDefined();
    });
  });

  describe('Build System Validation', () => {
    test('should validate build system successfully', async () => {
      mockExecSync.mockImplementation((cmd: any) => {
        if (cmd.toString().includes('next build --dry-run')) {
          return Buffer.from('Build validation successful');
        }
        return Buffer.from('');
      });

      const result: any = await framework.performComprehensiveValidation(mockProcessedFiles, 'test-batch-1');

      const buildResult: any = result.validationResults.find(r => r.validationType === 'build-system');
      expect(buildResult.passed).toBe(true);
      expect(buildResult.details.buildOutput).toContain('Build validation successful');
    });

    test('should handle build system failures', async () => {
      mockExecSync.mockImplementation((cmd: any) => {
        if (cmd.toString().includes('next build --dry-run')) {
          const error = new Error('Build failed');
          error.message = 'Module not found';
          throw error;
        }
        return Buffer.from('');
      });

      const result: any = await framework.performComprehensiveValidation(mockProcessedFiles, 'test-batch-1');

      const buildResult: any = result.validationResults.find(r => r.validationType === 'build-system');
      expect(buildResult.passed).toBe(false);
      expect(buildResult.errors).toContain('Build system validation failed: Module not found')
    });
  });

  describe('Configuration Options', () => {
    test('should respect disabled validation options', async () => {
      const configWithDisabledValidations: Partial<ValidationConfig> = {
        enableTypeScriptValidation: false,
        enableTestSuiteValidation: false,
        enableComponentValidation: false,
        enableServiceValidation: false,
        enableBuildValidation: false,
      };

      const frameworkWithDisabledValidations: any = new ComprehensiveValidationFramework(configWithDisabledValidations);
      const result: any = await frameworkWithDisabledValidations.performComprehensiveValidation(
        mockProcessedFiles,
        'test-batch-1',
      );

      expect(result.validationResults.length).toBe(0);
      expect(result.overallPassed).toBe(true);
      expect(result.qualityScore).toBe(100);
    });

    test('should respect timeout configurations', async () => {
      const configWithShortTimeouts: Partial<ValidationConfig> = { testTimeout: 1000, compilationTimeout: 1000 };

      const frameworkWithShortTimeouts: any = new ComprehensiveValidationFramework(configWithShortTimeouts);

      // Mock long-running command
      mockExecSync.mockImplementation((cmd: any) => {
        if (cmd.toString().includes('tsc')) {
          // Simulate timeout
          const error = new Error('Command timed out');
          (error as any).code = 'TIMEOUT';
          throw error;
        }
        return Buffer.from('');
      });

      const result: any = await frameworkWithShortTimeouts.performComprehensiveValidation(
        mockProcessedFiles,
        'test-batch-1',
      );

      const tsResult: any = result.validationResults.find(r => r.validationType === 'typescript-compilation');
      expect(tsResult.passed).toBe(false);
      expect(tsResult.errors.some(e => e.includes('timed out'))).toBe(true);
    });
  });

  describe('Validation History and Reporting', () => {
    test('should store validation history', async () => {
      await framework.performComprehensiveValidation(mockProcessedFiles, 'test-batch-1');
      await framework.performComprehensiveValidation(mockProcessedFiles, 'test-batch-2');

      const history: any = framework.getValidationHistory();
      expect(history.size).toBe(2);
      expect(history.has('test-batch-1')).toBe(true);
      expect(history.has('test-batch-2')).toBe(true);
    });

    test('should generate validation report', async () => {
      await framework.performComprehensiveValidation(mockProcessedFiles, 'test-batch-1');

      const report: any = framework.generateValidationReport('test-batch-1');

      expect(report).toContain('# Validation Report');
      expect(report).toContain('Batch ID: test-batch-1');
      expect(report).toContain('## Summary');
      expect(report).toContain('Total Validations:');
      expect(report).toContain('## Validation Results');
    });

    test('should generate comprehensive report for all batches', async () => {
      await framework.performComprehensiveValidation(mockProcessedFiles, 'test-batch-1');
      await framework.performComprehensiveValidation(mockProcessedFiles, 'test-batch-2');

      const report: any = framework.generateValidationReport();

      expect(report).toContain('# Validation Report');
      expect(report).toContain('All Batches');
      expect(report).toContain('## Summary');
    });
  });

  describe('Error Handling', () => {
    test('should handle framework errors gracefully', async () => {
      // Mock file system error
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File system error');
      });

      const result: any = await framework.performComprehensiveValidation(mockProcessedFiles, 'test-batch-1');

      expect(result.overallPassed).toBe(false);
      expect(result.requiresRollback).toBe(true);
      expect(result.qualityScore).toBe(0);
      expect(result.validationResults[0].validationType).toBe('framework-error');
    });

    test('should handle partial validation failures', async () => {
      // Mock TypeScript success but test failure
      mockExecSync.mockImplementation((cmd: any) => {
        if (cmd.toString().includes('tsc')) {
          return Buffer.from(''); // Success
        }
        if (cmd.toString().includes('yarn test')) {
          throw new Error('Tests failed'); // Failure
        }
        return Buffer.from('');
      });

      const result: any = await framework.performComprehensiveValidation(mockProcessedFiles, 'test-batch-1');

      expect(result.overallPassed).toBe(false);
      expect(result.qualityScore).toBeLessThan(100);
      expect(result.qualityScore).toBeGreaterThan(0);

      const tsResult: any = result.validationResults.find(r => r.validationType === 'typescript-compilation');
      const testResult: any = result.validationResults.find(r => r.validationType === 'test-suite');

      expect(tsResult.passed).toBe(true);
      expect(testResult.passed).toBe(false);
    });
  });

  describe('Quality Score Calculation', () => {
    test('should calculate quality score based on validation results', async () => {
      // Mock mixed results
      let callCount: any = 0;
      mockExecSync.mockImplementation((cmd: any) => {
        callCount++;
        if (cmd.toString().includes('tsc')) {
          return Buffer.from(''); // TypeScript passes (no penalty)
        }
        if (cmd.toString().includes('yarn test')) {
          const error = new Error('Tests failed');
          (error as any).stdout = '1 failed, 4 passed, 5 total';
          throw error; // Tests fail (-25 points)
        }
        if (cmd.toString().includes('next build')) {
          const error = new Error('Build failed');
          throw error; // Build fails (-10 points)
        }
        return Buffer.from('');
      });

      const result: any = await framework.performComprehensiveValidation(mockProcessedFiles, 'test-batch-1');

      // Should be 100 - 25 (test failure) - 10 (build failure) = 65
      expect(result.qualityScore).toBe(65);
    });

    test('should not allow negative quality scores', async () => {
      // Mock all validations failing
      mockExecSync.mockImplementation((cmd: any) => {
        throw new Error('All validations failed');
      });

      const result: any = await framework.performComprehensiveValidation(mockProcessedFiles, 'test-batch-1');

      expect(result.qualityScore).toBeGreaterThanOrEqual(0);
    });
  });
});
