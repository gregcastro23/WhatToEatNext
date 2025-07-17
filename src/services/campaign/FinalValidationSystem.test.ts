/**
 * Perfect Codebase Campaign - Final Validation System Tests
 * 
 * Comprehensive test suite for the Final Validation System
 */

import { FinalValidationSystem } from './FinalValidationSystem';
import { execSync } from 'child_process';
import * as fs from 'fs';

// Mock external dependencies
jest.mock('child_process');
jest.mock('fs');

const mockedExecSync = execSync as jest.MockedFunction<typeof execSync>;
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('FinalValidationSystem', () => {
  let validationSystem: FinalValidationSystem;

  beforeEach(() => {
    validationSystem = new FinalValidationSystem();
    jest.clearAllMocks();
  });

  describe('TypeScript Error Validation', () => {
    it('should pass validation when no TypeScript errors exist', async () => {
      // Mock successful TypeScript compilation
      mockedExecSync.mockReturnValue('');

      const result = await (validationSystem as any).validateTypeScriptErrors();

      expect(result.category).toBe('TypeScript Compilation');
      expect(result.passed).toBe(true);
      expect(result.current).toBe(0);
      expect(result.target).toBe(0);
      expect(result.criticalIssues).toHaveLength(0);
    });

    it('should fail validation when TypeScript errors exist', async () => {
      // Mock TypeScript compilation with errors
      const mockError = new Error('TypeScript compilation failed');
      (mockError as any).stdout = `
src/test.ts(10,5): error TS2304: Cannot find name 'unknownVariable'.
src/test.ts(15,10): error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
      `;
      mockedExecSync.mockImplementation(() => {
        throw mockError;
      });

      const result = await (validationSystem as any).validateTypeScriptErrors();

      expect(result.category).toBe('TypeScript Compilation');
      expect(result.passed).toBe(false);
      expect(result.current).toBe(2);
      expect(result.target).toBe(0);
      expect(result.criticalIssues.length).toBeGreaterThan(0);
    });
  });

  describe('Linting Warning Validation', () => {
    it('should pass validation when no linting warnings exist', async () => {
      // Mock successful linting with no warnings
      mockedExecSync.mockReturnValue('✨ All files passed linting');

      const result = await (validationSystem as any).validateLintingWarnings();

      expect(result.category).toBe('Linting Quality');
      expect(result.passed).toBe(true);
      expect(result.current).toBe(0);
      expect(result.target).toBe(0);
      expect(result.criticalIssues).toHaveLength(0);
    });

    it('should fail validation when linting warnings exist', async () => {
      // Mock linting with warnings
      const mockError = new Error('Linting warnings found');
      (mockError as any).stdout = `
src/test.ts:10:5 - warning: Unexpected any. Specify a different type (@typescript-eslint/no-explicit-any)
src/test.ts:15:10 - warning: 'unusedVar' is defined but never used (no-unused-vars)
src/test.ts:20:8 - warning: Unexpected console statement (no-console)
      `;
      mockedExecSync.mockImplementation(() => {
        throw mockError;
      });

      const result = await (validationSystem as any).validateLintingWarnings();

      expect(result.category).toBe('Linting Quality');
      expect(result.passed).toBe(false);
      expect(result.current).toBe(3);
      expect(result.target).toBe(0);
      expect(result.criticalIssues.length).toBeGreaterThan(0);
    });
  });

  describe('Enterprise Intelligence Validation', () => {
    it('should pass validation when sufficient intelligence systems exist', async () => {
      // Mock grep output with 250 intelligence systems
      const mockIntelligenceOutput = Array(250).fill(0).map((_, i) => 
        `src/services/test${i}.ts:export const TEST_${i}_INTELLIGENCE_SYSTEM = {`
      ).join('\n');
      
      mockedExecSync.mockReturnValue(mockIntelligenceOutput);

      const result = await (validationSystem as any).validateEnterpriseIntelligence();

      expect(result.category).toBe('Enterprise Intelligence');
      expect(result.passed).toBe(true);
      expect(result.current).toBe(250);
      expect(result.target).toBe(200);
      expect(result.criticalIssues).toHaveLength(0);
    });

    it('should fail validation when insufficient intelligence systems exist', async () => {
      // Mock grep output with only 50 intelligence systems
      const mockIntelligenceOutput = Array(50).fill(0).map((_, i) => 
        `src/services/test${i}.ts:export const TEST_${i}_INTELLIGENCE_SYSTEM = {`
      ).join('\n');
      
      mockedExecSync.mockReturnValue(mockIntelligenceOutput);

      const result = await (validationSystem as any).validateEnterpriseIntelligence();

      expect(result.category).toBe('Enterprise Intelligence');
      expect(result.passed).toBe(false);
      expect(result.current).toBe(50);
      expect(result.target).toBe(200);
      expect(result.criticalIssues.length).toBeGreaterThan(0);
    });

    it('should handle case when no intelligence systems exist', async () => {
      // Mock grep failure (no matches found)
      const mockError = new Error('No matches found');
      mockedExecSync.mockImplementation(() => {
        throw mockError;
      });

      const result = await (validationSystem as any).validateEnterpriseIntelligence();

      expect(result.category).toBe('Enterprise Intelligence');
      expect(result.passed).toBe(false);
      expect(result.current).toBe(0);
      expect(result.target).toBe(200);
      expect(result.criticalIssues.length).toBeGreaterThan(0);
    });
  });

  describe('Performance Validation', () => {
    it('should pass validation when performance targets are met', async () => {
      // Mock fast build time and low memory usage
      mockedExecSync
        .mockReturnValueOnce('') // yarn build
        .mockReturnValueOnce('Maximum resident set size (kbytes): 40960') // memory usage (40MB)
        .mockReturnValueOnce('400K\t.next/'); // bundle size

      // Mock Date.now to simulate 5-second build
      const originalDateNow = Date.now;
      let callCount = 0;
      Date.now = jest.fn(() => {
        callCount++;
        return callCount === 1 ? 1000 : 6000; // 5 second difference
      });

      const result = await (validationSystem as any).validatePerformanceTargets();

      expect(result.category).toBe('Performance Optimization');
      expect(result.passed).toBe(true);
      expect(result.current).toBe(5); // 5 seconds build time
      expect(result.target).toBe(10);
      expect(result.criticalIssues).toHaveLength(0);

      // Restore Date.now
      Date.now = originalDateNow;
    });

    it('should fail validation when performance targets are not met', async () => {
      // Mock slow build time and high memory usage
      mockedExecSync
        .mockReturnValueOnce('') // yarn build
        .mockReturnValueOnce('Maximum resident set size (kbytes): 61440') // memory usage (60MB)
        .mockReturnValueOnce('500K\t.next/'); // bundle size

      // Mock Date.now to simulate 15-second build
      const originalDateNow = Date.now;
      let callCount = 0;
      Date.now = jest.fn(() => {
        callCount++;
        return callCount === 1 ? 1000 : 16000; // 15 second difference
      });

      const result = await (validationSystem as any).validatePerformanceTargets();

      expect(result.category).toBe('Performance Optimization');
      expect(result.passed).toBe(false);
      expect(result.current).toBe(15); // 15 seconds build time
      expect(result.target).toBe(10);
      expect(result.criticalIssues.length).toBeGreaterThan(0);

      // Restore Date.now
      Date.now = originalDateNow;
    });
  });

  describe('Build and Test Validation', () => {
    it('should pass validation when build and tests succeed', async () => {
      // Mock successful build and tests
      mockedExecSync
        .mockReturnValueOnce('') // yarn build
        .mockReturnValueOnce(''); // yarn test

      const result = await (validationSystem as any).validateBuildAndTests();

      expect(result.category).toBe('Build and Test Stability');
      expect(result.passed).toBe(true);
      expect(result.current).toBe(1);
      expect(result.target).toBe(1);
      expect(result.criticalIssues).toHaveLength(0);
    });

    it('should fail validation when build fails', async () => {
      // Mock build failure
      mockedExecSync
        .mockImplementationOnce(() => {
          throw new Error('Build failed');
        })
        .mockReturnValueOnce(''); // yarn test succeeds

      const result = await (validationSystem as any).validateBuildAndTests();

      expect(result.category).toBe('Build and Test Stability');
      expect(result.passed).toBe(false);
      expect(result.current).toBe(0);
      expect(result.target).toBe(1);
      expect(result.criticalIssues.length).toBeGreaterThan(0);
    });

    it('should fail validation when tests fail', async () => {
      // Mock test failure
      mockedExecSync
        .mockReturnValueOnce('') // yarn build succeeds
        .mockImplementationOnce(() => {
          throw new Error('Tests failed');
        });

      const result = await (validationSystem as any).validateBuildAndTests();

      expect(result.category).toBe('Build and Test Stability');
      expect(result.passed).toBe(false);
      expect(result.current).toBe(0);
      expect(result.target).toBe(1);
      expect(result.criticalIssues.length).toBeGreaterThan(0);
    });
  });

  describe('Campaign Summary Generation', () => {
    it('should generate accurate campaign summary with baseline', async () => {
      // Mock baseline file
      const mockBaseline = {
        errors: 100,
        warnings: 500,
        intelligence: 10
      };
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(mockBaseline));

      // Mock current state (perfect codebase)
      mockedExecSync
        .mockReturnValueOnce('') // TypeScript - no errors
        .mockReturnValueOnce('') // Linting - no warnings
        .mockReturnValueOnce(Array(250).fill('INTELLIGENCE_SYSTEM').join('\n')); // 250 intelligence systems

      const summary = await (validationSystem as any).generateCampaignSummary();

      expect(summary.initialState).toEqual(mockBaseline);
      expect(summary.finalState.errors).toBe(0);
      expect(summary.finalState.warnings).toBe(0);
      expect(summary.finalState.intelligence).toBe(250);
      expect(summary.improvements.errorReduction).toBe(100);
      expect(summary.improvements.warningReduction).toBe(500);
      expect(summary.improvements.intelligenceIncrease).toBe(240);
    });

    it('should handle missing baseline file', async () => {
      // Mock missing baseline file
      mockedFs.existsSync.mockReturnValue(false);

      // Mock current state
      mockedExecSync
        .mockReturnValueOnce('') // TypeScript - no errors
        .mockReturnValueOnce('') // Linting - no warnings
        .mockReturnValueOnce(Array(200).fill('INTELLIGENCE_SYSTEM').join('\n')); // 200 intelligence systems

      const summary = await (validationSystem as any).generateCampaignSummary();

      expect(summary.initialState).toEqual({ errors: 0, warnings: 0, intelligence: 0 });
      expect(summary.finalState.intelligence).toBe(200);
      expect(summary.improvements.intelligenceIncrease).toBe(200);
    });
  });

  describe('Certification Status Determination', () => {
    it('should achieve ENTERPRISE certification for perfect codebase', () => {
      const mockValidationResults = [
        { category: 'TypeScript', passed: true, current: 0, target: 0, details: [], criticalIssues: [] },
        { category: 'Linting', passed: true, current: 0, target: 0, details: [], criticalIssues: [] },
        { category: 'Intelligence', passed: true, current: 250, target: 200, details: [], criticalIssues: [] },
        { category: 'Performance', passed: true, current: 8, target: 10, details: [], criticalIssues: [] },
        { category: 'Build/Test', passed: true, current: 1, target: 1, details: [], criticalIssues: [] }
      ];

      const mockPerformanceMetrics = {
        buildTime: 8,
        memoryUsage: 40,
        bundleSize: '400kB',
        cacheHitRate: 85,
        testCoverage: 98
      };

      const certification = (validationSystem as any).determineCertificationStatus(
        mockValidationResults,
        mockPerformanceMetrics
      );

      expect(certification.perfectCodebaseAchieved).toBe(true);
      expect(certification.enterpriseReady).toBe(true);
      expect(certification.productionDeploymentReady).toBe(true);
      expect(certification.certificationLevel).toBe('ENTERPRISE');
      expect(certification.certificationDate).toBeDefined();
    });

    it('should achieve BASIC certification for incomplete campaign', () => {
      const mockValidationResults = [
        { category: 'TypeScript', passed: false, current: 10, target: 0, details: [], criticalIssues: [] },
        { category: 'Linting', passed: false, current: 50, target: 0, details: [], criticalIssues: [] },
        { category: 'Intelligence', passed: false, current: 100, target: 200, details: [], criticalIssues: [] },
        { category: 'Performance', passed: false, current: 15, target: 10, details: [], criticalIssues: [] },
        { category: 'Build/Test', passed: true, current: 1, target: 1, details: [], criticalIssues: [] }
      ];

      const mockPerformanceMetrics = {
        buildTime: 15,
        memoryUsage: 60,
        bundleSize: '500kB',
        cacheHitRate: 70,
        testCoverage: 85
      };

      const certification = (validationSystem as any).determineCertificationStatus(
        mockValidationResults,
        mockPerformanceMetrics
      );

      expect(certification.perfectCodebaseAchieved).toBe(false);
      expect(certification.enterpriseReady).toBe(false);
      expect(certification.productionDeploymentReady).toBe(false);
      expect(certification.certificationLevel).toBe('BASIC');
      expect(certification.certificationDate).toBeUndefined();
    });
  });

  describe('Comprehensive Validation', () => {
    it('should execute complete validation successfully', async () => {
      // Mock all successful validations
      mockedExecSync
        .mockReturnValueOnce('') // TypeScript compilation
        .mockReturnValueOnce('✨ All files passed linting') // Linting
        .mockReturnValueOnce(Array(250).fill('INTELLIGENCE_SYSTEM').join('\n')) // Intelligence systems
        .mockReturnValueOnce('') // Build performance test
        .mockReturnValueOnce('Maximum resident set size (kbytes): 40960') // Memory usage
        .mockReturnValueOnce('400K\t.next/') // Bundle size
        .mockReturnValueOnce('') // Build validation
        .mockReturnValueOnce('') // Test validation
        .mockReturnValueOnce('') // Performance metrics build
        .mockReturnValueOnce('') // TypeScript for summary
        .mockReturnValueOnce('') // Linting for summary
        .mockReturnValueOnce(Array(250).fill('INTELLIGENCE_SYSTEM').join('\n')); // Intelligence for summary

      // Mock file system operations
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify({ errors: 100, warnings: 500, intelligence: 10 }));
      mockedFs.mkdirSync.mockReturnValue(undefined);
      mockedFs.writeFileSync.mockReturnValue(undefined);

      // Mock Date.now for consistent build time
      const originalDateNow = Date.now;
      let callCount = 0;
      Date.now = jest.fn(() => {
        callCount++;
        return callCount % 2 === 1 ? 1000 : 6000; // 5 second build times
      });

      const report = await validationSystem.executeComprehensiveValidation();

      expect(report.overallSuccess).toBe(true);
      expect(report.validationResults).toHaveLength(5);
      expect(report.certificationStatus.perfectCodebaseAchieved).toBe(true);
      expect(report.certificationStatus.certificationLevel).toBe('ENTERPRISE');

      // Restore Date.now
      Date.now = originalDateNow;
    });

    it('should handle validation failures gracefully', async () => {
      // Mock validation failures
      const mockError = new Error('Validation failed');
      (mockError as any).stdout = 'error TS2304: Cannot find name';
      mockedExecSync.mockImplementation(() => {
        throw mockError;
      });

      // Mock file system operations
      mockedFs.existsSync.mockReturnValue(false);
      mockedFs.mkdirSync.mockReturnValue(undefined);
      mockedFs.writeFileSync.mockReturnValue(undefined);

      const report = await validationSystem.executeComprehensiveValidation();

      expect(report.overallSuccess).toBe(false);
      expect(report.certificationStatus.perfectCodebaseAchieved).toBe(false);
      expect(report.certificationStatus.certificationLevel).toBe('BASIC');
    });
  });

  describe('Report Generation', () => {
    it('should save validation report to file', async () => {
      const mockReport = {
        timestamp: '2025-01-15T10:00:00.000Z',
        overallSuccess: true,
        validationResults: [],
        performanceMetrics: {
          buildTime: 8,
          memoryUsage: 40,
          bundleSize: '400kB',
          cacheHitRate: 85,
          testCoverage: 98
        },
        campaignSummary: {
          initialState: { errors: 100, warnings: 500, intelligence: 10 },
          finalState: { errors: 0, warnings: 0, intelligence: 250 },
          improvements: { errorReduction: 100, warningReduction: 500, intelligenceIncrease: 240 }
        },
        certificationStatus: {
          perfectCodebaseAchieved: true,
          enterpriseReady: true,
          productionDeploymentReady: true,
          certificationLevel: 'ENTERPRISE' as const,
          certificationDate: '2025-01-15T10:00:00.000Z'
        }
      };

      mockedFs.existsSync.mockReturnValue(false);
      mockedFs.mkdirSync.mockReturnValue(undefined);
      mockedFs.writeFileSync.mockReturnValue(undefined);

      await (validationSystem as any).saveValidationReport(mockReport);

      expect(mockedFs.mkdirSync).toHaveBeenCalledWith('.campaign-progress', { recursive: true });
      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
        expect.stringMatching(/\.campaign-progress\/final-validation-report-\d+\.json/),
        JSON.stringify(mockReport, null, 2)
      );
    });

    it('should create certification document for successful campaigns', async () => {
      const mockReport = {
        timestamp: '2025-01-15T10:00:00.000Z',
        overallSuccess: true,
        validationResults: [
          { category: 'TypeScript', passed: true, current: 0, target: 0, details: [], criticalIssues: [] }
        ],
        performanceMetrics: {
          buildTime: 8,
          memoryUsage: 40,
          bundleSize: '400kB',
          cacheHitRate: 85,
          testCoverage: 98
        },
        campaignSummary: {
          initialState: { errors: 100, warnings: 500, intelligence: 10 },
          finalState: { errors: 0, warnings: 0, intelligence: 250 },
          improvements: { errorReduction: 100, warningReduction: 500, intelligenceIncrease: 240 }
        },
        certificationStatus: {
          perfectCodebaseAchieved: true,
          enterpriseReady: true,
          productionDeploymentReady: true,
          certificationLevel: 'ENTERPRISE' as const,
          certificationDate: '2025-01-15T10:00:00.000Z'
        }
      };

      mockedFs.writeFileSync.mockReturnValue(undefined);

      await (validationSystem as any).createCertification(mockReport);

      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
        'PERFECT_CODEBASE_CERTIFICATION.md',
        expect.stringContaining('# Perfect Codebase Campaign - Certification')
      );
      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
        'PERFECT_CODEBASE_CERTIFICATION.md',
        expect.stringContaining('**Certification Level**: ENTERPRISE')
      );
    });
  });
});

// Integration test for CLI execution
describe('FinalValidationSystem CLI', () => {
  it('should handle CLI validation command', () => {
    // This test would require more complex mocking of the module execution
    // For now, we'll just verify the class can be instantiated
    const validator = new FinalValidationSystem();
    expect(validator).toBeInstanceOf(FinalValidationSystem);
  });
});