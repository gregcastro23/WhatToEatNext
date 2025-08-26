/**
 * Test suite for LintingProgressTracker
 *
 * Tests the linting progress tracking functionality including metrics collection,
 * progress reporting, and campaign integration.
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync, unlinkSync } from 'fs';

import { LintingProgressTracker, LintingMetrics, LintingProgressReport } from '../LintingProgressTracker';

// Mock dependencies
jest.mock('child_process');
jest.mock('fs');
jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;
const mockWriteFileSync = writeFileSync as jest.MockedFunction<typeof writeFileSync>;
const mockReadFileSync = readFileSync as jest.MockedFunction<typeof readFileSync>;
const mockExistsSync = existsSync as jest.MockedFunction<typeof existsSync>;

describe('LintingProgressTracker', () => {
  let tracker: LintingProgressTracker;

  beforeEach(() => {
    tracker = new LintingProgressTracker();
    jest.clearAllMocks();
  });

  describe('collectMetrics', () => {
    test('should collect and parse linting metrics successfully', async () => {
      const mockLintOutput = JSON.stringify([
        {
          filePath: '/test/file1.ts',
          messages: [
            { ruleId: 'no-unused-vars', severity: 1, fix: null },
            { ruleId: 'no-console', severity: 2, fix: { range: [0, 10], text: '' } },
          ],
        },
        {
          filePath: '/test/file2.ts',
          messages: [{ ruleId: 'prefer-const', severity: 1, fix: { range: [0, 5], text: 'const' } }],
        },
      ]);

      mockExecSync.mockReturnValue(mockLintOutput);

      const metrics = await tracker.collectMetrics();

      expect(metrics).toMatchObject({
        totalIssues: 3,
        errors: 1,
        warnings: 2,
        filesCovered: 2,
        fixableIssues: 2,
        errorsByCategory: {
          'no-console': 1,
        },
        warningsByCategory: {
          'no-unused-vars': 1,
          'prefer-const': 1,
        },
      });

      expect(metrics.timestamp).toBeInstanceOf(Date);
      expect(metrics.performanceMetrics).toBeDefined();
      expect(mockWriteFileSync).toHaveBeenCalled();
    });

    test('should handle ESLint execution errors gracefully', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Intentionally any: Mock error object needs custom stdout property for testing
      const mockError = new Error('ESLint failed') as unknown;
      mockError.stdout = JSON.stringify([]);
      mockExecSync.mockImplementation(() => {
        throw mockError;
      });

      const metrics = await tracker.collectMetrics();

      expect(metrics.totalIssues).toBe(0);
      expect(metrics.errors).toBe(0);
      expect(metrics.warnings).toBe(0);
    });

    test('should handle invalid JSON output', async () => {
      mockExecSync.mockReturnValue('invalid json');

      await expect(tracker.collectMetrics()).rejects.toThrow();
    });
  });

  describe('generateProgressReport', () => {
    test('should generate comprehensive progress report', async () => {
      const mockCurrentMetrics: LintingMetrics = {
        timestamp: new Date(),
        totalIssues: 50,
        errors: 5,
        warnings: 45,
        errorsByCategory: { 'no-console': 3, 'no-unused-vars': 2 },
        warningsByCategory: { 'prefer-const': 25, 'no-explicit-any': 20 },
        filesCovered: 100,
        fixableIssues: 30,
        performanceMetrics: {
          executionTime: 5000,
          memoryUsage: 256,
          cacheHitRate: 0.8,
        },
      };

      const mockPreviousMetrics: LintingMetrics = {
        ...mockCurrentMetrics,
        totalIssues: 80,
        errors: 15,
        warnings: 65,
      };

      // Mock the collectMetrics method
      jest.spyOn(tracker, 'collectMetrics').mockResolvedValue(mockCurrentMetrics);

      // Mock file system calls for previous metrics
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify(mockPreviousMetrics));

      const report = await tracker.generateProgressReport();

      expect(report.currentMetrics).toEqual(mockCurrentMetrics);
      expect(report.previousMetrics).toMatchObject({
        ...mockPreviousMetrics,
        timestamp: expect.any(String), // JSON serialization converts Date to string
      });
      expect(report.improvement).toEqual({
        totalIssuesReduced: 30,
        errorsReduced: 10,
        warningsReduced: 20,
        percentageImprovement: 37.5,
      });
      expect(report.qualityGates).toBeDefined();
      expect(report.trends).toBeDefined();
    });

    test('should handle missing previous metrics', async () => {
      const mockCurrentMetrics: LintingMetrics = {
        timestamp: new Date(),
        totalIssues: 50,
        errors: 5,
        warnings: 45,
        errorsByCategory: {},
        warningsByCategory: {},
        filesCovered: 100,
        fixableIssues: 30,
        performanceMetrics: {
          executionTime: 5000,
          memoryUsage: 256,
          cacheHitRate: 0.8,
        },
      };

      jest.spyOn(tracker, 'collectMetrics').mockResolvedValue(mockCurrentMetrics);
      mockExistsSync.mockReturnValue(false);

      const report = await tracker.generateProgressReport();

      expect(report.previousMetrics).toBeUndefined();
      expect(report.improvement).toEqual({
        totalIssuesReduced: 0,
        errorsReduced: 0,
        warningsReduced: 0,
        percentageImprovement: 0,
      });
    });
  });

  describe('integrateCampaignProgress', () => {
    test('should integrate with campaign system successfully', async () => {
      const campaignData = {
        campaignId: 'test-campaign',
        phase: 'phase-1',
        targetReduction: 100,
        currentProgress: 50,
        estimatedCompletion: new Date(),
        safetyProtocols: ['backup', 'validate'],
      };

      const mockReport: LintingProgressReport = {
        currentMetrics: {
          timestamp: new Date(),
          totalIssues: 25,
          errors: 2,
          warnings: 23,
          errorsByCategory: {},
          warningsByCategory: {},
          filesCovered: 50,
          fixableIssues: 15,
          performanceMetrics: {
            executionTime: 3000,
            memoryUsage: 128,
            cacheHitRate: 0.9,
          },
        },
        improvement: {
          totalIssuesReduced: 25,
          errorsReduced: 8,
          warningsReduced: 17,
          percentageImprovement: 50,
        },
        trends: {
          last24Hours: 10,
          last7Days: 20,
          last30Days: 30,
        },
        qualityGates: {
          zeroErrors: false,
          warningsUnderThreshold: true,
          performanceAcceptable: true,
        },
      };

      jest.spyOn(tracker, 'generateProgressReport').mockResolvedValue(mockReport);

      await tracker.integrateCampaignProgress(campaignData);

      expect(mockWriteFileSync).toHaveBeenCalledWith(
        expect.stringContaining('campaign-integration.json'),
        expect.stringContaining(campaignData.campaignId),
      );
    });
  });

  describe('createQualityGates', () => {
    test('should evaluate quality gates correctly', () => {
      const mockMetrics: LintingMetrics = {
        timestamp: new Date(),
        totalIssues: 10,
        errors: 0,
        warnings: 10,
        errorsByCategory: {},
        warningsByCategory: {},
        filesCovered: 50,
        fixableIssues: 5,
        performanceMetrics: {
          executionTime: 30000,
          memoryUsage: 256,
          cacheHitRate: 0.8,
        },
      };

      // Mock getLatestMetrics
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Intentionally any: Jest spy requires access to private method for testing
      jest.spyOn(tracker as unknown, 'getLatestMetrics').mockReturnValue(mockMetrics);

      const thresholds = {
        maxErrors: 0,
        maxWarnings: 50,
        maxExecutionTime: 60000,
      };

      const result = tracker.createQualityGates(thresholds);

      expect(result).toBe(true);
    });

    test('should fail quality gates when thresholds exceeded', () => {
      const mockMetrics: LintingMetrics = {
        timestamp: new Date(),
        totalIssues: 100,
        errors: 5,
        warnings: 95,
        errorsByCategory: {},
        warningsByCategory: {},
        filesCovered: 50,
        fixableIssues: 20,
        performanceMetrics: {
          executionTime: 90000,
          memoryUsage: 512,
          cacheHitRate: 0.6,
        },
      };

      jest.spyOn(tracker as unknown, 'getLatestMetrics').mockReturnValue(mockMetrics);

      const thresholds = {
        maxErrors: 0,
        maxWarnings: 50,
        maxExecutionTime: 60000,
      };

      const result = tracker.createQualityGates(thresholds);

      expect(result).toBe(false);
    });

    test('should handle missing metrics gracefully', () => {
      jest.spyOn(tracker as unknown, 'getLatestMetrics').mockReturnValue(null);

      const thresholds = {
        maxErrors: 0,
        maxWarnings: 50,
        maxExecutionTime: 60000,
      };

      const result = tracker.createQualityGates(thresholds);

      expect(result).toBe(false);
    });
  });

  describe('private methods', () => {
    test('should parse linting output correctly', () => {
      const mockOutput = JSON.stringify([
        {
          filePath: '/test/file.ts',
          messages: [
            { ruleId: 'no-unused-vars', severity: 1, fix: null },
            { ruleId: 'no-console', severity: 2, fix: { range: [0, 10], text: '' } },
            { ruleId: null, severity: 1, fix: null }, // Test unknown rule
          ],
        },
      ]);

      const result = (tracker as any).parseLintingOutput(mockOutput);

      expect(result).toEqual({
        totalIssues: 3,
        errors: 1,
        warnings: 2,
        filesCovered: 1,
        fixableIssues: 1,
        errorsByCategory: {
          'no-console': 1,
        },
        warningsByCategory: {
          'no-unused-vars': 1,
          unknown: 1,
        },
      });
    });

    test('should calculate improvement metrics correctly', () => {
      const current: LintingMetrics = {
        timestamp: new Date(),
        totalIssues: 50,
        errors: 5,
        warnings: 45,
        errorsByCategory: {},
        warningsByCategory: {},
        filesCovered: 100,
        fixableIssues: 25,
        performanceMetrics: {
          executionTime: 5000,
          memoryUsage: 256,
          cacheHitRate: 0.8,
        },
      };

      const previous: LintingMetrics = {
        ...current,
        totalIssues: 100,
        errors: 20,
        warnings: 80,
      };

      const improvement = (tracker as any).calculateImprovement(current, previous);

      expect(improvement).toEqual({
        totalIssuesReduced: 50,
        errorsReduced: 15,
        warningsReduced: 35,
        percentageImprovement: 50,
      });
    });

    test('should handle improvement calculation with no previous metrics', () => {
      const current: LintingMetrics = {
        timestamp: new Date(),
        totalIssues: 50,
        errors: 5,
        warnings: 45,
        errorsByCategory: {},
        warningsByCategory: {},
        filesCovered: 100,
        fixableIssues: 25,
        performanceMetrics: {
          executionTime: 5000,
          memoryUsage: 256,
          cacheHitRate: 0.8,
        },
      };

      const improvement = (tracker as any).calculateImprovement(current, undefined);

      expect(improvement).toEqual({
        totalIssuesReduced: 0,
        errorsReduced: 0,
        warningsReduced: 0,
        percentageImprovement: 0,
      });
    });

    test('should evaluate quality gates correctly', () => {
      const metrics: LintingMetrics = {
        timestamp: new Date(),
        totalIssues: 50,
        errors: 0,
        warnings: 50,
        errorsByCategory: {},
        warningsByCategory: {},
        filesCovered: 100,
        fixableIssues: 25,
        performanceMetrics: {
          executionTime: 30000,
          memoryUsage: 256,
          cacheHitRate: 0.8,
        },
      };

      const gates = (tracker as any).evaluateQualityGates(metrics);

      expect(gates).toEqual({
        zeroErrors: true,
        warningsUnderThreshold: true,
        performanceAcceptable: true,
      });
    });
  });
});
