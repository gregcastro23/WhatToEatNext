/**
 * Metrics Integration Tests
 * Tests for the metrics integration with existing campaign reporting systems
 */

import {
    UnintentionalAnyCampaignScheduler,
    UnintentionalAnyProgressTracker
} from '../MetricsIntegration';


// Mock child_process to avoid actual command execution in tests
jest.mock('child_process', () => ({
  execSync: jest.fn()
}));

// Mock fs to avoid file system operations in tests
jest.mock('fs', () => ({
  writeFileSync: jest.fn(),
  existsSync: jest.fn(() => true),
  readFileSync: jest.fn(() => '{}')
}));

describe('UnintentionalAnyProgressTracker', () => {
  let tracker: UnintentionalAnyProgressTracker;
  let mockExecSync: jest.MockedFunction<typeof import('child_process').execSync>;

  beforeEach(() => {
    tracker = new UnintentionalAnyProgressTracker();
    mockExecSync = require('child_process').execSync as jest.MockedFunction<typeof import('child_process').execSync>;
    jest.clearAllMocks();
  });

  describe('getExplicitAnyWarningCount', () => {
    it('should count explicit-any warnings from linting output', async () => {
      const mockLintOutput = `
        src/file1.ts:10:5: warning @typescript-eslint/no-explicit-any
        src/file2.ts:20:10: warning @typescript-eslint/no-explicit-any
        src/file3.ts:30:15: error some-other-rule
      `;

      mockExecSync.mockReturnValue(mockLintOutput);

      const count = await tracker.getExplicitAnyWarningCount();
      expect(count).toBe(2);
    });

    it('should return 0 when no explicit-any warnings found', async () => {
      const mockLintOutput = `
        src/file1.ts:10:5: warning some-other-rule
        src/file2.ts:20:10: error another-rule
      `;

      mockExecSync.mockReturnValue(mockLintOutput);

      const count = await tracker.getExplicitAnyWarningCount();
      expect(count).toBe(0);
    });

    it('should handle linting command failure gracefully', async () => {
      const error = new Error('Linting failed') as any;
      error.stdout = 'src/file1.ts:10:5: warning @typescript-eslint/no-explicit-any';
      mockExecSync.mockImplementation(() => {
        throw error;
      });

      const count = await tracker.getExplicitAnyWarningCount();
      expect(count).toBe(1);
    });

    it('should return 0 when linting command fails without output', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Command failed');
      });

      const count = await tracker.getExplicitAnyWarningCount();
      expect(count).toBe(0);
    });
  });

  describe('getExplicitAnyBreakdownByFile', () => {
    it('should break down explicit-any warnings by file', async () => {
      const mockLintOutput = `
        src/file1.ts:10:5: warning @typescript-eslint/no-explicit-any
        src/file1.ts:20:10: warning @typescript-eslint/no-explicit-any
        src/file2.ts:30:15: warning @typescript-eslint/no-explicit-any
        src/file3.ts:40:20: error some-other-rule
      `;

      mockExecSync.mockReturnValue(mockLintOutput);

      const breakdown = await tracker.getExplicitAnyBreakdownByFile();

      expect(breakdown['src/file1.ts']).toBe(2);
      expect(breakdown['src/file2.ts']).toBe(1);
      expect(breakdown['src/file3.ts']).toBeUndefined();
    });

    it('should return empty breakdown when no warnings found', async () => {
      const mockLintOutput = `
        src/file1.ts:10:5: warning some-other-rule
        src/file2.ts:20:10: error another-rule
      `;

      mockExecSync.mockReturnValue(mockLintOutput);

      const breakdown = await tracker.getExplicitAnyBreakdownByFile();
      expect(Object.keys(breakdown)).toHaveLength(0);
    });
  });

  describe('getUnintentionalAnyMetrics', () => {
    it('should return comprehensive metrics', async () => {
      // Mock linting output with explicit-any warnings
      mockExecSync.mockReturnValue('src/file1.ts:10:5: warning @typescript-eslint/no-explicit-any');

      const metrics = await tracker.getUnintentionalAnyMetrics();

      expect(metrics).toBeDefined();
      expect(typeof metrics.totalAnyTypes).toBe('number');
      expect(typeof metrics.intentionalAnyTypes).toBe('number');
      expect(typeof metrics.unintentionalAnyTypes).toBe('number');
      expect(typeof metrics.documentedAnyTypes).toBe('number');
      expect(typeof metrics.documentationCoverage).toBe('number');
      expect(typeof metrics.reductionFromBaseline).toBe('number');
      expect(metrics.targetReduction).toBe(15);
    });

    it('should handle errors gracefully and return default metrics', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Command failed');
      });

      const metrics = await tracker.getUnintentionalAnyMetrics();

      expect(metrics.totalAnyTypes).toBe(0);
      expect(metrics.intentionalAnyTypes).toBe(0);
      expect(metrics.unintentionalAnyTypes).toBe(0);
      expect(metrics.documentationCoverage).toBe(0);
      expect(metrics.targetReduction).toBe(15);
    });

    it('should calculate reduction from baseline when baseline is set', async () => {
      // Set baseline with higher any count
      mockExecSync.mockReturnValue('src/file1.ts:10:5: warning @typescript-eslint/no-explicit-any\nsrc/file2.ts:20:10: warning @typescript-eslint/no-explicit-any');
      await tracker.setBaselineMetrics();

      // Mock current state with fewer any types
      mockExecSync.mockReturnValue('src/file1.ts:10:5: warning @typescript-eslint/no-explicit-any');

      const metrics = await tracker.getUnintentionalAnyMetrics();
      expect(metrics.reductionFromBaseline).toBeGreaterThan(0);
    });
  });

  describe('getUnintentionalAnyProgressMetrics', () => {
    it('should return enhanced progress metrics', async () => {
      const progressMetrics = await tracker.getUnintentionalAnyProgressMetrics();

      expect(progressMetrics).toBeDefined();
      expect(progressMetrics.typeScriptErrors).toBeDefined();
      expect(progressMetrics.lintingWarnings).toBeDefined();
      expect(progressMetrics.buildPerformance).toBeDefined();
      expect(progressMetrics.enterpriseSystems).toBeDefined();
      expect(progressMetrics.unintentionalAnyMetrics).toBeDefined();
    });
  });

  describe('setBaselineMetrics', () => {
    it('should set baseline metrics for comparison', async () => {
      mockExecSync.mockReturnValue('src/file1.ts:10:5: warning @typescript-eslint/no-explicit-any');

      await tracker.setBaselineMetrics();

      const history = tracker.getUnintentionalAnyMetricsHistory();
      expect(history.length).toBeGreaterThan(0);
    });
  });

  describe('validateUnintentionalAnyMilestone', () => {
    it('should validate baseline-established milestone', async () => {
      // Before setting baseline
      let isValid = await tracker.validateUnintentionalAnyMilestone('baseline-established');
      expect(isValid).toBe(false);

      // After setting baseline
      await tracker.setBaselineMetrics();
      isValid = await tracker.validateUnintentionalAnyMilestone('baseline-established');
      expect(isValid).toBe(true);
    });

    it('should validate analysis-complete milestone', async () => {
      mockExecSync.mockReturnValue('src/file1.ts:10:5: warning @typescript-eslint/no-explicit-any');

      const isValid = await tracker.validateUnintentionalAnyMilestone('analysis-complete');
      expect(typeof isValid).toBe('boolean');
    });

    it('should validate target-reduction-achieved milestone', async () => {
      // Set baseline
      mockExecSync.mockReturnValue('src/file1.ts:10:5: warning @typescript-eslint/no-explicit-any\nsrc/file2.ts:20:10: warning @typescript-eslint/no-explicit-any');
      await tracker.setBaselineMetrics();

      // Mock significant reduction
      mockExecSync.mockReturnValue('');

      const isValid = await tracker.validateUnintentionalAnyMilestone('target-reduction-achieved');
      expect(isValid).toBe(true);
    });

    it('should validate documentation-complete milestone', async () => {
      // This would require mocking the documentation quality assurance
      const isValid = await tracker.validateUnintentionalAnyMilestone('documentation-complete');
      expect(typeof isValid).toBe('boolean');
    });

    it('should validate zero-unintentional-any milestone', async () => {
      mockExecSync.mockReturnValue(''); // No explicit-any warnings

      const isValid = await tracker.validateUnintentionalAnyMilestone('zero-unintentional-any');
      expect(typeof isValid).toBe('boolean');
    });

    it('should return false for unknown milestone', async () => {
      const isValid = await tracker.validateUnintentionalAnyMilestone('unknown-milestone' as any);
      expect(isValid).toBe(false);
    });
  });

  describe('getDashboardMetrics', () => {
    it('should return dashboard-compatible metrics', async () => {
      mockExecSync.mockReturnValue('src/file1.ts:10:5: warning @typescript-eslint/no-explicit-any');

      const dashboardMetrics = await tracker.getDashboardMetrics();

      expect(dashboardMetrics.current).toBeDefined();
      expect(['improving', 'stable', 'declining']).toContain(dashboardMetrics.trend);
      expect(Array.isArray(dashboardMetrics.topFiles)).toBe(true);
      expect(Array.isArray(dashboardMetrics.alerts)).toBe(true);
      expect(Array.isArray(dashboardMetrics.recommendations)).toBe(true);
      expect(dashboardMetrics.lastUpdated).toBeInstanceOf(Date);
    });

    it('should include top files with most any types', async () => {
      const mockLintOutput = `
        src/file1.ts:10:5: warning @typescript-eslint/no-explicit-any
        src/file1.ts:20:10: warning @typescript-eslint/no-explicit-any
        src/file2.ts:30:15: warning @typescript-eslint/no-explicit-any
      `;

      mockExecSync.mockReturnValue(mockLintOutput);

      const dashboardMetrics = await tracker.getDashboardMetrics();

      expect(dashboardMetrics.topFiles.length).toBeGreaterThan(0);
      expect(dashboardMetrics.topFiles[0].file).toBe('src/file1.ts');
      expect(dashboardMetrics.topFiles[0].count).toBe(2);
    });

    it('should generate alerts for high unintentional any count', async () => {
      // Mock high number of explicit-any warnings
      const mockLintOutput = Array(150).fill('src/file.ts:10:5: warning @typescript-eslint/no-explicit-any').join('\n');
      mockExecSync.mockReturnValue(mockLintOutput);

      const dashboardMetrics = await tracker.getDashboardMetrics();

      const highCountAlert = dashboardMetrics.alerts.find(alert =>
        alert.type === 'high-unintentional-any-count'
      );
      expect(highCountAlert).toBeDefined();
      expect(highCountAlert?.severity).toBe('warning');
    });
  });

  describe('exportUnintentionalAnyMetrics', () => {
    it('should export metrics to JSON file', async () => {
      const mockWriteFileSync = require('fs').writeFileSync as jest.MockedFunction<typeof import('fs').writeFileSync>;

      await tracker.exportUnintentionalAnyMetrics('test-metrics.json');

      expect(mockWriteFileSync).toHaveBeenCalledWith(
        'test-metrics.json',
        expect.stringContaining('"timestamp"'),
        undefined
      );
    });
  });

  describe('resetUnintentionalAnyMetricsHistory', () => {
    it('should reset metrics history', async () => {
      // Add some metrics to history
      await tracker.setBaselineMetrics();
      expect(tracker.getUnintentionalAnyMetricsHistory().length).toBeGreaterThan(0);

      // Reset history
      tracker.resetUnintentionalAnyMetricsHistory();
      expect(tracker.getUnintentionalAnyMetricsHistory().length).toBe(0);
    });
  });
});

describe('UnintentionalAnyCampaignScheduler', () => {
  let scheduler: UnintentionalAnyCampaignScheduler;

  beforeEach(() => {
    scheduler = new UnintentionalAnyCampaignScheduler();
    jest.clearAllMocks();
  });

  describe('shouldTriggerCampaign', () => {
    it('should trigger high priority campaign for many unintentional any types', async () => {
      // Mock high number of explicit-any warnings
      const mockLintOutput = Array(250).fill('src/file.ts:10:5: warning @typescript-eslint/no-explicit-any').join('\n');
      const mockExecSync = require('child_process').execSync as jest.MockedFunction<typeof import('child_process').execSync>;
      mockExecSync.mockReturnValue(mockLintOutput);

      const decision = await scheduler.shouldTriggerCampaign();

      expect(decision.shouldTrigger).toBe(true);
      expect(decision.priority).toBe('high');
      expect(decision.reason).toContain('High number');
    });

    it('should trigger medium priority campaign for moderate unintentional any types', async () => {
      // Mock moderate number of explicit-any warnings
      const mockLintOutput = Array(75).fill('src/file.ts:10:5: warning @typescript-eslint/no-explicit-any').join('\n');
      const mockExecSync = require('child_process').execSync as jest.MockedFunction<typeof import('child_process').execSync>;
      mockExecSync.mockReturnValue(mockLintOutput);

      const decision = await scheduler.shouldTriggerCampaign();

      expect(decision.shouldTrigger).toBe(true);
      expect(decision.priority).toBe('medium');
      expect(decision.reason).toContain('Moderate number');
    });

    it('should not trigger campaign when no issues detected', async () => {
      // Mock no explicit-any warnings
      const mockExecSync = require('child_process').execSync as jest.MockedFunction<typeof import('child_process').execSync>;
      mockExecSync.mockReturnValue('');

      const decision = await scheduler.shouldTriggerCampaign();

      expect(decision.shouldTrigger).toBe(false);
      expect(decision.priority).toBe('low');
      expect(decision.reason).toContain('No significant');
    });
  });

  describe('resolveCampaignConflicts', () => {
    it('should allow execution when no conflicts exist', () => {
      const resolution = scheduler.resolveCampaignConflicts(
        ['other-campaign', 'unrelated-task'],
        'unintentional-any-elimination'
      );

      expect(resolution.canProceed).toBe(true);
      expect(resolution.conflictingCampaigns).toEqual([]);
      expect(resolution.resolution).toContain('No conflicts');
    });

    it('should detect conflicts with TypeScript campaigns', () => {
      const resolution = scheduler.resolveCampaignConflicts(
        ['typescript-error-elimination', 'other-campaign'],
        'unintentional-any-elimination'
      );

      expect(resolution.conflictingCampaigns).toContain('typescript-error-elimination');
      expect(resolution.conflictingCampaigns).not.toContain('other-campaign');
    });

    it('should detect conflicts with linting campaigns', () => {
      const resolution = scheduler.resolveCampaignConflicts(
        ['linting-excellence', 'explicit-any-cleanup'],
        'unintentional-any-elimination'
      );

      expect(resolution.conflictingCampaigns).toContain('linting-excellence');
      expect(resolution.conflictingCampaigns).toContain('explicit-any-cleanup');
    });

    it('should allow resolution for non-critical conflicts', () => {
      const resolution = scheduler.resolveCampaignConflicts(
        ['typescript-cleanup', 'linting-improvement'],
        'unintentional-any-elimination'
      );

      expect(resolution.canProceed).toBe(true);
      expect(resolution.resolution).toContain('coordinating batch processing');
    });

    it('should prevent execution for critical campaigns', () => {
      const resolution = scheduler.resolveCampaignConflicts(
        ['critical-typescript-emergency', 'emergency-linting-fix'],
        'unintentional-any-elimination'
      );

      expect(resolution.canProceed).toBe(false);
      expect(resolution.resolution).toContain('Wait for critical campaigns');
    });
  });

  describe('getRecommendedExecutionTime', () => {
    it('should recommend immediate execution for low load', () => {
      const recommendation = scheduler.getRecommendedExecutionTime([], 'low');

      expect(recommendation.recommendedTime).toBeInstanceOf(Date);
      expect(recommendation.reason).toContain('immediately');
      expect(recommendation.estimatedDuration).toBeLessThan(30);
    });

    it('should recommend near future execution for medium load', () => {
      const recommendation = scheduler.getRecommendedExecutionTime(['one-campaign'], 'medium');

      const now = new Date();
      expect(recommendation.recommendedTime.getTime()).toBeGreaterThan(now.getTime());
      expect(recommendation.reason).toContain('near future');
      expect(recommendation.estimatedDuration).toBeGreaterThan(30);
      expect(recommendation.estimatedDuration).toBeLessThan(40);
    });

    it('should delay execution for high load', () => {
      const recommendation = scheduler.getRecommendedExecutionTime(
        ['campaign1', 'campaign2', 'campaign3'],
        'high'
      );

      const now = new Date();
      const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

      expect(recommendation.recommendedTime.getTime()).toBeGreaterThanOrEqual(twoHoursFromNow.getTime() - 60000); // Allow 1 minute tolerance
      expect(recommendation.reason).toContain('later');
      expect(recommendation.estimatedDuration).toBeGreaterThan(40);
    });

    it('should adjust duration based on system conditions', () => {
      const lowLoadRecommendation = scheduler.getRecommendedExecutionTime([], 'low');
      const highLoadRecommendation = scheduler.getRecommendedExecutionTime(['campaign'], 'high');

      expect(highLoadRecommendation.estimatedDuration).toBeGreaterThan(lowLoadRecommendation.estimatedDuration);
    });
  });
});
