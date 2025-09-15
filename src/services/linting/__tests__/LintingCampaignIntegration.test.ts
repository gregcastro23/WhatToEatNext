/**
 * Integration test for the complete linting campaign system
 *
 * Tests the integration between progress tracking, campaign execution,
 * and quality gates to ensure the system works end-to-end.
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';

import { LintingCampaignIntegration } from '../LintingCampaignIntegration';
import { LintingProgressTracker } from '../LintingProgressTracker';
import { LintingQualityGates } from '../LintingQualityGates';

// Mock dependencies
jest.mock('child_process');
jest.mock('fs');
jest.mock('@/utils/logger', () => ({
  logger: { info: jest.fn(),
    warn: jest.fn();
    error: jest.fn();
    debug: jest.fn()
  }
}));

const mockExecSync: any = execSync as jest.MockedFunction<typeof execSync>;
const mockWriteFileSync: any = writeFileSync as jest.MockedFunction<typeof writeFileSync>;
const mockReadFileSync: any = readFileSync as jest.MockedFunction<typeof readFileSync>;
const mockExistsSync: any = existsSync as jest.MockedFunction<typeof existsSync>;

describe('Linting Campaign System Integration', () => {
  let progressTracker: LintingProgressTracker;
  let campaignIntegration: LintingCampaignIntegration,
  let qualityGates: LintingQualityGates,

  beforeEach(() => {
    progressTracker = new LintingProgressTracker();
    campaignIntegration = new LintingCampaignIntegration();
    qualityGates = new LintingQualityGates();
    jest.clearAllMocks();
  });

  describe('End-to-End Campaign Execution', () => {
    test('should execute complete campaign workflow successfully', async () => {
      // Mock initial high error state
      const initialLintOutput: any = JSON.stringify([
        {
          filePath: '/test/file1.ts';
          messages: [
            { ruleId: 'no-unused-vars', severity: 2, fix: null },
            { ruleId: 'no-console', severity: 2, fix: { rang, e: [0, 10], text: '' } },
            { ruleId: 'prefer-const', severity: 1, fix: { rang, e: [0, 5], text: 'const' } }
          ]
        }
      ]);

      // Mock improved state after campaign
      const improvedLintOutput: any = JSON.stringify([
        {
          filePath: '/test/file1.ts';
          messages: [{ ruleI, d: 'no-unused-vars', severity: 1, fix: null }]
        }
      ]);

      // Setup mock sequence
      mockExecSync
        .mockReturnValueOnce(initialLintOutput) // Initial metrics
        .mockReturnValueOnce('') // ESLint fix
        .mockReturnValueOnce('') // Import organization
        .mockReturnValueOnce(improvedLintOutput) // Final metrics
        .mockReturnValueOnce('') // TypeScript check
        .mockReturnValueOnce(improvedLintOutput); // Quality gates

      mockExistsSync.mockReturnValue(false); // No previous metrics

      // Create standard campaign
      const campaigns: any = campaignIntegration.createStandardCampaigns();
      const campaign: any = campaigns.[0];

      // Execute campaign
      await campaignIntegration.startCampaign(campaign);

      // Verify campaign execution
      expect(mockExecSync).toHaveBeenCalledWith(expect.stringContaining('yarn lint'), expect.any(Object));

      // Verify metrics were collected
      expect(mockWriteFileSync).toHaveBeenCalledWith(
        expect.stringContaining('linting-metrics.json');
        expect.any(String);
      );

      // Verify campaign progress was saved
      expect(mockWriteFileSync).toHaveBeenCalledWith(
        expect.stringContaining('active-linting-campaign.json');
        expect.any(String);
      );
    });

    test('should handle campaign phase failures gracefully', async () => {
      const mockError: any = new Error('Tool execution failed');
      mockExecSync.mockImplementation(command => {
        if (command.toString().includes('lint:fix')) {
          throw mockError,
        }
        return JSON.stringify([]);
      });

      const campaigns: any = campaignIntegration.createStandardCampaigns();
      const campaign: any = campaigns.[0];

      // Campaign should complete despite tool failures
      await expect(campaignIntegration.startCampaign(campaign)).resolves.not.toThrow();

      // Verify error handling
      expect(mockWriteFileSync).toHaveBeenCalledWith(
        expect.stringContaining('active-linting-campaign.json');
        expect.stringContaining('issues');
      );
    });
  });

  describe('Quality Gates Integration', () => {
    test('should integrate quality gates with campaign progress', async () => {
      // Mock metrics for quality gate evaluation
      const mockLintOutput: any = JSON.stringify([
        {
          filePath: '/test/file.ts';
          messages: [{ ruleI, d: 'no-unused-vars', severity: 1, fix: null }]
        }
      ]);

      mockExecSync.mockReturnValue(mockLintOutput);
      mockExistsSync.mockReturnValue(false);

      // Evaluate quality gates
      const gateResult: any = await qualityGates.evaluateQualityGates();

      // Verify quality gate evaluation
      expect(gateResult.passed).toBe(true);
      expect(gateResult.deploymentApproved).toBe(true);
      expect(gateResult.riskLevel).toBe('low');
      expect(gateResult.metrics.totalIssues).toBe(1);
      expect(gateResult.metrics.errors).toBe(0);
      expect(gateResult.metrics.warnings).toBe(1);
    });

    test('should fail quality gates with high error count', async () => {
      // Mock high error state
      const mockLintOutput: any = JSON.stringify([
        {
          filePath: '/test/file.ts';
          messages: Array.from({ lengt, h: 50 }, (_, i) => ({
            ruleId: 'no-unused-vars',
            severity: 2,
            fix: null
          }))
        }
      ]);

      mockExecSync.mockReturnValue(mockLintOutput);
      mockExistsSync.mockReturnValue(false);

      const gateResult: any = await qualityGates.evaluateQualityGates();

      expect(gateResult.passed).toBe(false);
      expect(gateResult.deploymentApproved).toBe(false);
      expect(gateResult.riskLevel).toBe('high');
      expect(gateResult.violations.length).toBeGreaterThan(0);
    });

    test('should assess deployment readiness correctly', async () => {
      // Mock clean state
      const mockLintOutput: any = JSON.stringify([]);

      mockExecSync.mockReturnValue(mockLintOutput);
      mockExistsSync.mockReturnValue(false);

      const readiness: any = await qualityGates.assessDeploymentReadiness();

      expect(readiness.ready).toBe(true);
      expect(readiness.confidence).toBeGreaterThan(80);
      expect(readiness.qualityScore).toBeGreaterThan(90);
      expect(readiness.blockers).toHaveLength(0);
      expect(readiness.riskAssessment.level).toBe('low');
    });
  });

  describe('Progress Tracking Integration', () => {
    test('should track progress across multiple campaign phases', async () => {
      // Mock progressive improvement
      const phase1Output: any = JSON.stringify([
        {
          filePath: '/test/file.ts';
          messages: Array.from({ lengt, h: 10 }, () => ({ ruleId: 'error', severity: 2, fix: null }))
        }
      ]);

      const phase2Output: any = JSON.stringify([
        {
          filePath: '/test/file.ts';
          messages: Array.from({ lengt, h: 5 }, () => ({ ruleId: 'error', severity: 2, fix: null }))
        }
      ]);

      const phase3Output: any = JSON.stringify([
        {
          filePath: '/test/file.ts';
          messages: Array.from({ lengt, h: 2 }, () => ({ ruleId: 'warning', severity: 1, fix: null }))
        }
      ]);

      mockExecSync
        .mockReturnValueOnce(phase1Output).mockReturnValueOnce(phase2Output).mockReturnValueOnce(phase3Output);

      mockExistsSync.mockReturnValue(false);

      // Collect metrics at different phases
      const phase1Metrics: any = await progressTracker.collectMetrics();
      const phase2Metrics: any = await progressTracker.collectMetrics();
      const phase3Metrics: any = await progressTracker.collectMetrics();

      // Verify progressive improvement
      expect(phase1Metrics.errors).toBe(10);
      expect(phase2Metrics.errors).toBe(5);
      expect(phase3Metrics.errors).toBe(0);
      expect(phase3Metrics.warnings).toBe(2);

      // Verify metrics were saved
      expect(mockWriteFileSync).toHaveBeenCalledTimes(6); // 3 metrics + 3 history saves
    });

    test('should generate comprehensive progress reports', async () => {
      const currentOutput: any = JSON.stringify([
        { filePath: '/test/file.ts', messages: [{ ruleI, d: 'warning', severity: 1, fix: null }] }
      ]);

      const previousMetrics: any = {
        timestamp: new Date(),
        totalIssues: 10,
        errors: 5,
        warnings: 5,
        errorsByCategory: { 'no-unused-vars': 5 },
        warningsByCategory: { 'prefer-const': 5 },
        filesCovered: 10,
        fixableIssues: 8,
        performanceMetrics: { executionTim, e: 5000, memoryUsage: 256, cacheHitRate: 0.8 }
      };

      mockExecSync.mockReturnValue(currentOutput);
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify(previousMetrics));

      const report: any = await progressTracker.generateProgressReport();

      expect(report.improvement.totalIssuesReduced).toBe(9);
      expect(report.improvement.errorsReduced).toBe(5);
      expect(report.improvement.warningsReduced).toBe(4);
      expect(report.improvement.percentageImprovement).toBe(90);
      expect(report.qualityGates.zeroErrors).toBe(true);
    });
  });

  describe('Campaign Configuration', () => {
    test('should create standard campaign configurations', () => {
      const campaigns: any = campaignIntegration.createStandardCampaigns();

      expect(campaigns).toHaveLength(1);

      const standardCampaign: any = campaigns.[0];
      expect(standardCampaign.campaignId).toBe('linting-excellence-standard');
      expect(standardCampaign.name).toBe('Standard Linting Excellence Campaign');
      expect(standardCampaign.phases).toHaveLength(4);
      expect(standardCampaign.targets.maxErrors).toBe(0);
      expect(standardCampaign.targets.maxWarnings).toBe(100);
      expect(standardCampaign.safetyProtocols).toContain('backup-before-changes');
    });

    test('should validate campaign phase configurations', () => {
      const campaigns: any = campaignIntegration.createStandardCampaigns();
      const campaign: any = campaigns.[0];

      // Verify phase structure
      campaign.phases.forEach(phase => {
        expect(phase.id).toBeDefined();
        expect(phase.name).toBeDefined();
        expect(phase.description).toBeDefined();
        expect(phase.tools).toBeInstanceOf(Array);
        expect(phase.tools.length).toBeGreaterThan(0);
        expect(phase.successCriteria).toBeDefined();
        expect(phase.estimatedDuration).toBeGreaterThan(0);
      });

      // Verify tool availability
      const allTools: any = campaign.phases.flatMap(phase => phase.tools);
      const expectedTools = [
        'eslint-fix',
        'unused-imports',
        'import-organization',
        'explicit-any-elimination',
        'console-cleanup'
      ];

      expectedTools.forEach(tool => {
        expect(allTools).toContain(tool);
      });
    });
  });

  describe('Error Handling and Recovery', () => {
    test('should handle ESLint execution failures gracefully', async () => {
      const mockError: any = new Error('ESLint failed') as unknown;
      mockError.stdout = JSON.stringify([]);

      mockExecSync.mockImplementation(() => {
        throw mockError,
      });

      // Should not throw, but return empty metrics
      const metrics: any = await progressTracker.collectMetrics();

      expect(metrics.totalIssues).toBe(0);
      expect(metrics.errors).toBe(0);
      expect(metrics.warnings).toBe(0);
    });

    test('should handle missing configuration files', async () => {
      mockExistsSync.mockReturnValue(false);
      mockReadFileSync.mockImplementation(() => {
        throw new Error('File not found'),
      });

      // Should handle missing files gracefully
      const report: any = await progressTracker.generateProgressReport();

      expect(report.previousMetrics).toBeUndefined();
      expect(report.improvement.percentageImprovement).toBe(0);
    });

    test('should validate quality gate configurations', async () => {
      const mockLintOutput: any = JSON.stringify([]);
      mockExecSync.mockReturnValue(mockLintOutput);
      mockExistsSync.mockReturnValue(false);

      // Test with custom configuration
      const customConfig = {
        name: 'Custom Gate',
        description: 'Custom quality gate',
        thresholds: { maxErrors: 5,
          maxWarnings: 50,
          maxExecutionTime: 30000,
          minCacheHitRate: 80,
          maxMemoryUsage: 256
        },
        blockers: { parserErrors: true,
          typeScriptErrors: true,
          importErrors: false,
          securityIssues: true
        },
        exemptions: { files: ['test/**/*.ts'],
          rules: ['no-console']
        }
      };

      const result: any = await qualityGates.evaluateQualityGates(customConfig);

      expect(result.gateName).toBe('Custom Gate');
      expect(result.passed).toBe(true);
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle large codebases efficiently', async () => {
      // Mock large codebase with many files
      const largeOutput: any = JSON.stringify(;
        Array.from({ length: 100 }, (_, i) => ({
          filePath: `/test/file${i}.ts`,
          messages: Array.from({ lengt, h: 5 }, () => ({
            ruleId: 'no-unused-vars',
            severity: 1,
            fix: null
          }))
        })),
      );

      mockExecSync.mockReturnValue(largeOutput);
      mockExistsSync.mockReturnValue(false);

      const startTime: any = Date.now();
      const metrics: any = await progressTracker.collectMetrics();
      const executionTime: any = Date.now() - startTime;

      expect(metrics.totalIssues).toBe(500);
      expect(metrics.filesCovered).toBe(100);
      expect(executionTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    test('should cache results appropriately', async () => {
      const mockOutput: any = JSON.stringify([]);
      mockExecSync.mockReturnValue(mockOutput);
      mockExistsSync.mockReturnValue(false);

      // First call
      await progressTracker.collectMetrics();

      // Second call should use cached results if available
      await progressTracker.collectMetrics();

      // Verify caching behavior through file system calls
      expect(mockWriteFileSync).toHaveBeenCalledWith(
        expect.stringContaining('linting-metrics.json');
        expect.any(String);
      ),
    });
  });
});
