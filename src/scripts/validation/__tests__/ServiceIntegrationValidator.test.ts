/**
 * Test Suite for Service Integration Validator
 *
 * This test suite validates the service integration validation functionality
 * including API endpoint verification, service method validation, and quality assurance reporting.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import { ServiceIntegrationConfig, ServiceIntegrationValidator } from '../ServiceIntegrationValidator';

// Mock external dependencies
jest.mock('fs');
jest.mock('child_process');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;

describe('ServiceIntegrationValidator', () => {
  let validator: ServiceIntegrationValidator;
  let mockProcessedFiles: string[];

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup default configuration
    const config: Partial<ServiceIntegrationConfig> = {
      enableApiEndpointValidation: true,
      enableServiceMethodValidation: true,
      enableConfigurationValidation: true,
      enableIntegrationTests: true,
      apiTimeout: 10000,
      testTimeout: 30000,
      qualityTarget: 90,
      buildStabilityTarget: 100,
      logLevel: 'info'
    };

    validator = new ServiceIntegrationValidator(config);

    // Setup mock processed files
    mockProcessedFiles = [
      '/project/src/services/ApiService.ts',
      '/project/src/services/UserService.ts',
      '/project/src/components/TestComponent.tsx',
      '/project/src/utils/helper.ts'
    ];

    // Mock successful executions by default
    mockExecSync.mockReturnValue(Buffer.from(''));
    mockFs.readFileSync.mockReturnValue('export default Service;');
    mockFs.existsSync.mockReturnValue(true);
    mockFs.mkdirSync.mockReturnValue(undefined);
    mockFs.writeFileSync.mockReturnValue(undefined);
  });

  describe('Service Integration Validation', () => {
    test('should validate service integration successfully', async () => {
      // Mock service file content
      mockFs.readFileSync.mockImplementation((path) => {
        if (path.toString().includes('ApiService.ts')) {
          return `
            export class ApiService {
              async fetchData() {
                return fetch('/api/data');
              }

              async postData(data: any) {
                return fetch('/api/submit', { method: 'POST' });
              }
            }
          `;
        }
        return 'export default Service;';
      });

      // Mock successful lint and build
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.toString().includes('yarn lint')) {
          return Buffer.from('[]'); // No lint errors
        }
        if (cmd.toString().includes('yarn tsc')) {
          return Buffer.from(''); // No build errors
        }
        if (cmd.toString().includes('yarn test')) {
          return Buffer.from('5 passed, 0 failed, 5 total');
        }
        return Buffer.from('');
      });

      const report = await validator.validateServiceIntegration(mockProcessedFiles, 'test-batch-1');

      expect(report.batchId).toBe('test-batch-1');
      expect(report.processedServices.length).toBeGreaterThan(0);
      expect(report.qualityMetrics).toBeDefined();
      expect(report.targetStatus.readyForProduction).toBeDefined();
    });

    test('should identify service files correctly', async () => {
      const mixedFiles = [
        '/project/src/services/ApiService.ts',
        '/project/src/components/Component.tsx',
        '/project/src/utils/helper.ts',
        '/project/src/services/UserService.ts',
        '/project/src/api/routes.ts'
      ];

      const report = await validator.validateServiceIntegration(mixedFiles, 'test-batch-1');

      // Should identify 3 service files: ApiService.ts, UserService.ts, and routes.ts
      expect(report.processedServices.length).toBe(3);
      expect(report.processedServices).toContain('/project/src/services/ApiService.ts');
      expect(report.processedServices).toContain('/project/src/services/UserService.ts');
      expect(report.processedServices).toContain('/project/src/api/routes.ts');
    });

    test('should calculate quality metrics correctly', async () => {
      // Mock baseline metrics
      const baselineMetrics = { unusedVariables: 100, buildErrors: 0 };

      // Mock current state with reduced unused variables
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.toString().includes('yarn lint')) {
          // Simulate 10 remaining unused variables (90% reduction)
          const lintResults = Array.from({ length: 10 }, () => ({
            messages: [{ ruleId: '@typescript-eslint/no-unused-vars' }]
          }));
          return Buffer.from(JSON.stringify(lintResults));
        }
        if (cmd.toString().includes('yarn tsc')) {
          return Buffer.from(''); // No build errors
        }
        return Buffer.from('');
      });

      const report = await validator.validateServiceIntegration(
        mockProcessedFiles,
        'test-batch-1',
        baselineMetrics
      );

      expect(report.qualityMetrics.unusedVariableReduction).toBe(90);
      expect(report.qualityMetrics.buildStabilityScore).toBe(100);
      expect(report.qualityMetrics.targetAchievement.reductionAchieved).toBe(true);
      expect(report.qualityMetrics.targetAchievement.stabilityAchieved).toBe(true);
    });

    test('should handle quality targets not met', async () => {
      // Mock insufficient reduction and build errors
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.toString().includes('yarn lint')) {
          // Simulate 50 remaining unused variables (50% reduction)
          const lintResults = Array.from({ length: 50 }, () => ({
            messages: [{ ruleId: '@typescript-eslint/no-unused-vars' }]
          }));
          return Buffer.from(JSON.stringify(lintResults));
        }
        if (cmd.toString().includes('yarn tsc')) {
          // Simulate build errors
          const error = new Error('Build failed') as any;
          (error as any).stdout = 'error TS2322: Type error\nerror TS2339: Property error';
          throw error;
        }
        return Buffer.from('');
      });

      const baselineMetrics = { unusedVariables: 100, buildErrors: 0 };
      const report = await validator.validateServiceIntegration(
        mockProcessedFiles,
        'test-batch-1',
        baselineMetrics
      );

      expect(report.qualityMetrics.unusedVariableReduction).toBe(50);
      expect(report.qualityMetrics.buildStabilityScore).toBeLessThan(100);
      expect(report.qualityMetrics.targetAchievement.reductionAchieved).toBe(false);
      expect(report.qualityMetrics.targetAchievement.stabilityAchieved).toBe(false);
      expect(report.targetStatus.readyForProduction).toBe(false);
    });
  });

  describe('API Endpoint Validation', () => {
    test('should analyze API endpoints correctly', async () => {
      mockFs.readFileSync.mockReturnValue(`
        export class ApiService {
          async fetchUsers() {
            return fetch('/api/users');
          }

          async createUser(userData: any) {
            return axios.post('/api/users', userData);
          }

          async updateUser(id: string, data: any) {
            return fetch(\`/api/users/\${id}\`, { method: 'PUT' });
          }
        }
      `);

      const report = await validator.validateServiceIntegration(mockProcessedFiles, 'test-batch-1');

      const apiResults = report.serviceResults.filter(r => r.validationType === 'api-endpoint');
      expect(apiResults.length).toBeGreaterThan(0);

      const apiResult = apiResults[0];
      expect(apiResult.details.apiEndpoints).toBeDefined();
      expect(apiResult.details.apiEndpoints?.length).toBeGreaterThan(0);

      const endpoints = apiResult.details.apiEndpoints!;
      expect(endpoints.some(e => e.endpoint === '/api/users')).toBe(true);
    });

    test('should handle services with no API endpoints', async () => {
      mockFs.readFileSync.mockReturnValue(`
        export class UtilityService {
          formatData(data: any) {
            return data.toString();
          }
        }
      `);

      const report = await validator.validateServiceIntegration(mockProcessedFiles, 'test-batch-1');

      const apiResults = report.serviceResults.filter(r => r.validationType === 'api-endpoint');
      const apiResult = apiResults[0];

      expect(apiResult.warnings).toContain('No API endpoints found in service file');
      expect(apiResult.recommendations).toContain('Verify if this service should contain API endpoints');
    });

    test('should detect invalid API endpoints', async () => {
      mockFs.readFileSync.mockReturnValue(`
        export class ApiService {
          async fetchData() {
            return fetch('invalid-endpoint');
          }
        }
      `);

      const report = await validator.validateServiceIntegration(mockProcessedFiles, 'test-batch-1');

      const apiResults = report.serviceResults.filter(r => r.validationType === 'api-endpoint');
      const apiResult = apiResults[0];

      expect(apiResult.passed).toBe(false);
      expect(apiResult.errors.some(e => e.includes('validation failed'))).toBe(true);
    });
  });

  describe('Service Method Validation', () => {
    test('should analyze service methods correctly', async () => {
      mockFs.readFileSync.mockReturnValue(`
        export class UserService {
          async getUser(id: string) {
            return this.fetchUser(id);
          }

          async createUser(userData: UserData) {
            return this.saveUser(userData);
          }

          private fetchUser(id: string) {
            return fetch(\`/api/users/\${id}\`);
          }
        }

        export const userService = new UserService();
      `);

      const report = await validator.validateServiceIntegration(mockProcessedFiles, 'test-batch-1');

      const methodResults = report.serviceResults.filter(r => r.validationType === 'service-method');
      expect(methodResults.length).toBeGreaterThan(0);

      const methodResult = methodResults[0];
      expect(methodResult.details.serviceMethods).toBeDefined();
      expect(methodResult.details.serviceMethods?.length).toBeGreaterThan(0);

      const methods = methodResult.details.serviceMethods!;
      expect(methods.some(m => m.methodName === 'UserService')).toBe(true);
      expect(methods.some(m => m.methodName === 'userService')).toBe(true);
    });

    test('should handle services with no exported methods', async () => {
      mockFs.readFileSync.mockReturnValue(`
        class InternalService {
          private processData() {
            return 'processed';
          }
        }
      `);

      const report = await validator.validateServiceIntegration(mockProcessedFiles, 'test-batch-1');

      const methodResults = report.serviceResults.filter(r => r.validationType === 'service-method');
      const methodResult = methodResults[0];

      expect(methodResult.warnings).toContain('No exported service methods found');
      expect(methodResult.recommendations).toContain('Verify if this service should export methods');
    });
  });

  describe('Configuration Validation', () => {
    test('should analyze configuration dependencies correctly', async () => {
      mockFs.readFileSync.mockReturnValue(`
        export class ConfigService {
          private apiUrl = process.env.API_URL || 'http://localhost:3000';
          private apiKey = process.env.API_KEY;
          private timeout = config.timeout ?? 5000;

          getConfig(key: string) {
            return getConfig(key);
          }
        }
      `);

      const report = await validator.validateServiceIntegration(mockProcessedFiles, 'test-batch-1');

      const configResults = report.serviceResults.filter(r => r.validationType === 'configuration');
      expect(configResults.length).toBeGreaterThan(0);

      const configResult = configResults[0];
      expect(configResult.details.configDependencies).toBeDefined();
      expect(configResult.details.configDependencies?.length).toBeGreaterThan(0);

      const configs = configResult.details.configDependencies!;
      expect(configs.some(c => c.key === 'API_URL')).toBe(true);
      expect(configs.some(c => c.key === 'API_KEY')).toBe(true);
    });

    test('should identify required vs optional configuration', async () => {
      mockFs.readFileSync.mockReturnValue(`
        const requiredConfig = process.env.REQUIRED_API_KEY;
        const optionalConfig = process.env.OPTIONAL_SETTING || 'default';
      `);

      const report = await validator.validateServiceIntegration(mockProcessedFiles, 'test-batch-1');

      const configResults = report.serviceResults.filter(r => r.validationType === 'configuration');
      const configResult = configResults[0];
      const configs = configResult.details.configDependencies!;

      const requiredConfig = configs.find(c => c.key === 'REQUIRED_API_KEY');
      const optionalConfig = configs.find(c => c.key === 'OPTIONAL_SETTING');

      expect(requiredConfig?.isRequired).toBe(true);
      expect(optionalConfig?.isRequired).toBe(false);
    });
  });

  describe('Integration Test Validation', () => {
    test('should find and run integration tests', async () => {
      // Mock test files exist
      mockFs.existsSync.mockImplementation((path) => {
        return path.toString().includes('.integration.test.ts');
      });

      // Mock successful test execution
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.toString().includes('yarn test')) {
          return Buffer.from('3 passed, 0 failed, 3 total');
        }
        return Buffer.from('');
      });

      const report = await validator.validateServiceIntegration(mockProcessedFiles, 'test-batch-1');

      const testResults = report.serviceResults.filter(r => r.validationType === 'integration-test');
      expect(testResults.length).toBeGreaterThan(0);

      const testResult = testResults[0];
      expect(testResult.passed).toBe(true);
      expect(testResult.details.testResults).toEqual({
        passed: 3,
        failed: 0,
        total: 3
      });
    });

    test('should handle services with no integration tests', async () => {
      // Mock no test files exist
      mockFs.existsSync.mockReturnValue(false);

      const report = await validator.validateServiceIntegration(mockProcessedFiles, 'test-batch-1');

      const testResults = report.serviceResults.filter(r => r.validationType === 'integration-test');
      const testResult = testResults[0];

      expect(testResult.warnings).toContain('No integration test files found for service');
      expect(testResult.recommendations).toContain('Consider adding integration tests for this service');
    });

    test('should handle failing integration tests', async () => {
      mockFs.existsSync.mockReturnValue(true);

      // Mock failing test execution
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.toString().includes('yarn test')) {
          const error = new Error('Tests failed') as any;
          (error as any).stdout = '2 passed, 1 failed, 3 total';
          throw error;
        }
        return Buffer.from('');
      });

      const report = await validator.validateServiceIntegration(mockProcessedFiles, 'test-batch-1');

      const testResults = report.serviceResults.filter(r => r.validationType === 'integration-test');
      const testResult = testResults[0];

      expect(testResult.passed).toBe(false);
      expect(testResult.errors).toContain('1 integration tests failed');
      expect(testResult.recommendations).toContain('Review and fix failing integration tests');
    });
  });

  describe('Quality Metrics Calculation', () => {
    test('should calculate unused variable reduction correctly', async () => {
      const baselineMetrics = { unusedVariables: 200, buildErrors: 0 };

      // Mock 20 remaining unused variables (90% reduction)
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.toString().includes('yarn lint')) {
          const lintResults = Array.from({ length: 20 }, () => ({
            messages: [{ ruleId: '@typescript-eslint/no-unused-vars' }]
          }));
          return Buffer.from(JSON.stringify(lintResults));
        }
        if (cmd.toString().includes('yarn tsc')) {
          return Buffer.from(''); // No build errors
        }
        return Buffer.from('');
      });

      const report = await validator.validateServiceIntegration(
        mockProcessedFiles,
        'test-batch-1',
        baselineMetrics
      );

      expect(report.qualityMetrics.unusedVariableReduction).toBe(90);
      expect(report.qualityMetrics.targetAchievement.reductionAchieved).toBe(true);
    });

    test('should calculate build stability score correctly', async () => {
      // Mock build with errors
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.toString().includes('yarn tsc')) {
          const error = new Error('Build failed') as any;
          (error as any).stdout = 'error TS2322: Type error\nerror TS2339: Property error\nerror TS2345: Argument error';
          throw error;
        }
        if (cmd.toString().includes('yarn lint')) {
          return Buffer.from('[]');
        }
        return Buffer.from('');
      });

      const report = await validator.validateServiceIntegration(mockProcessedFiles, 'test-batch-1');

      // 3 build errors should result in score of 70 (100 - 3*10)
      expect(report.qualityMetrics.buildStabilityScore).toBe(70);
      expect(report.qualityMetrics.targetAchievement.stabilityAchieved).toBe(false);
    });

    test('should calculate overall quality score correctly', async () => {
      const baselineMetrics = { unusedVariables: 100, buildErrors: 0 };

      // Mock perfect scenario
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.toString().includes('yarn lint')) {
          return Buffer.from('[]'); // No unused variables (100% reduction)
        }
        if (cmd.toString().includes('yarn tsc')) {
          return Buffer.from(''); // No build errors (100% stability)
        }
        return Buffer.from('');
      });

      const report = await validator.validateServiceIntegration(
        mockProcessedFiles,
        'test-batch-1',
        baselineMetrics
      );

      // Perfect scores should result in high overall quality
      expect(report.qualityMetrics.overallQualityScore).toBeGreaterThan(95);
      expect(report.overallAssessment).toBe('excellent');
      expect(report.targetStatus.readyForProduction).toBe(true);
    });
  });

  describe('Quality Assurance Reporting', () => {
    test('should generate comprehensive quality report', async () => {
      const report = await validator.validateServiceIntegration(mockProcessedFiles, 'test-batch-1');

      expect(report.timestamp).toBeInstanceOf(Date);
      expect(report.batchId).toBe('test-batch-1');
      expect(report.processedServices).toBeDefined();
      expect(report.qualityMetrics).toBeDefined();
      expect(report.serviceResults).toBeDefined();
      expect(report.overallAssessment).toBeDefined();
      expect(report.actionItems).toBeDefined();
      expect(report.recommendations).toBeDefined();
      expect(report.targetStatus).toBeDefined();
    });

    test('should generate appropriate action items for unmet targets', async () => {
      // Mock scenario where targets are not met
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.toString().includes('yarn lint')) {
          // 50% reduction (below 90% target)
          const lintResults = Array.from({ length: 50 }, () => ({
            messages: [{ ruleId: '@typescript-eslint/no-unused-vars' }]
          }));
          return Buffer.from(JSON.stringify(lintResults));
        }
        if (cmd.toString().includes('yarn tsc')) {
          // Build errors (below 100% stability target)
          const error = new Error('Build failed') as any;
          (error as any).stdout = 'error TS2322: Type error';
          throw error;
        }
        return Buffer.from('');
      });

      const baselineMetrics = { unusedVariables: 100, buildErrors: 0 };
      const report = await validator.validateServiceIntegration(
        mockProcessedFiles,
        'test-batch-1',
        baselineMetrics
      );

      expect(report.actionItems).toContain('Achieve 90% unused variable reduction target');
      expect(report.actionItems).toContain('Resolve all build errors to achieve 100% build stability');
      expect(report.targetStatus.readyForProduction).toBe(false);
    });

    test('should export quality reports to file system', async () => {
      await validator.validateServiceIntegration(mockProcessedFiles, 'test-batch-1');
      await validator.exportQualityReports('./test-reports');

      expect(mockFs.mkdirSync).toHaveBeenCalledWith('./test-reports', { recursive: true });
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('service-integration-test-batch-1.json'),
        expect.any(String)
      );
    });
  });

  describe('Configuration Options', () => {
    test('should respect disabled validation options', async () => {
      const configWithDisabledValidations: Partial<ServiceIntegrationConfig> = {
        enableApiEndpointValidation: false,
        enableServiceMethodValidation: false,
        enableConfigurationValidation: false,
        enableIntegrationTests: false
      };

      const validatorWithDisabledValidations = new ServiceIntegrationValidator(configWithDisabledValidations);
      const report = await validatorWithDisabledValidations.validateServiceIntegration(mockProcessedFiles, 'test-batch-1');

      // Should have no service results since all validations are disabled
      expect(report.serviceResults.length).toBe(0);
    });

    test('should respect timeout configurations', async () => {
      const configWithShortTimeouts: Partial<ServiceIntegrationConfig> = {
        apiTimeout: 1000,
        testTimeout: 1000
      };

      const validatorWithShortTimeouts = new ServiceIntegrationValidator(configWithShortTimeouts);

      // Mock long-running command
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.toString().includes('yarn test')) {
          // Simulate timeout
          const error = new Error('Command timed out') as any;
          (error as any).code = 'TIMEOUT';
          throw error;
        }
        return Buffer.from('');
      });

      const report = await validatorWithShortTimeouts.validateServiceIntegration(mockProcessedFiles, 'test-batch-1');

      const testResults = report.serviceResults.filter(r => r.validationType === 'integration-test');
      if (testResults.length > 0) {
        expect(testResults[0].passed).toBe(false);
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle service file read errors gracefully', async () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File read error');
      });

      const report = await validator.validateServiceIntegration(mockProcessedFiles, 'test-batch-1');

      // Should still generate a report even with file read errors
      expect(report).toBeDefined();
      expect(report.serviceResults.some(r => !r.passed)).toBe(true);
    });

    test('should handle command execution errors gracefully', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Command execution failed');
      });

      const report = await validator.validateServiceIntegration(mockProcessedFiles, 'test-batch-1');

      // Should still generate a report even with command execution errors
      expect(report).toBeDefined();
      expect(report.qualityMetrics).toBeDefined();
    });
  });
});
