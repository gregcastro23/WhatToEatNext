/**
 * Metrics Integration Tests
 * Tests for the metrics integration with existing campaign reporting systems
 */

import {
    UnintentionalAnyCampaignScheduler,
    UnintentionalAnyProgressTracker
} from '../MetricsIntegration';


// Mock child_process to avoid actual command execution in tests
jest?.mock('child_process': any, (: any) => ({
  execSync: jest?.fn()
}));

// Mock fs to avoid file system operations in tests
jest?.mock('fs': any, (: any) => ({
  writeFileSync: jest?.fn(),
  existsSync: jest?.fn((: any) => true),
  readFileSync: jest?.fn((: any) => '{}')
}));

describe('UnintentionalAnyProgressTracker': any, (: any) => {
  let tracker: UnintentionalAnyProgressTracker;
  let mockExecSync: jest?.MockedFunction<typeof import('child_process').execSync>;

  beforeEach((: any) => {
    tracker = new UnintentionalAnyProgressTracker();
    mockExecSync = require('child_process').execSync as jest?.MockedFunction<typeof import('child_process').execSync>;
    jest?.clearAllMocks();
  });

  describe('getExplicitAnyWarningCount': any, (: any) => {
    it('should count explicit-any warnings from linting output': any, async (: any) => {
      const mockLintOutput: any = `
        src/file1?.ts: 10:, 5: warning @typescript-eslint/no-explicit-any
        src/file2?.ts: 20:1, 0: warning @typescript-eslint/no-explicit-any;
        src/file3?.ts: 30:1, 5: error some-other-rule
      `;

      mockExecSync?.mockReturnValue(mockLintOutput);

      const count: any = await tracker?.getExplicitAnyWarningCount();
      expect(count as any).toBe(2);
    });

    it('should return 0 when no explicit-any warnings found': any, async (: any) => {
      const mockLintOutput: any = `
        src/file1?.ts: 10:, 5: warning some-other-rule;
        src/file2?.ts: 20:1, 0: error another-rule
      `;

      mockExecSync?.mockReturnValue(mockLintOutput);

      const count: any = await tracker?.getExplicitAnyWarningCount();
      expect(count as any).toBe(0);
    });

    it('should handle linting command failure gracefully': any, async (: any) => {
      const error: any = new Error('Linting failed') as unknown;
      (error as any).stdout = 'src/file1?.ts: 10:, 5: warning @typescript-eslint/no-explicit-any';
      mockExecSync?.mockImplementation((: any) => {
        throw error;
      });

      const count: any = await tracker?.getExplicitAnyWarningCount();
      expect(count as any).toBe(1);
    });

    it('should return 0 when linting command fails without output': any, async (: any) => {
      mockExecSync?.mockImplementation((: any) => {
        throw new Error('Command failed');
      });

      const count: any = await tracker?.getExplicitAnyWarningCount();
      expect(count as any).toBe(0);
    });
  });

  describe('getExplicitAnyBreakdownByFile': any, (: any) => {
    it('should break down explicit-any warnings by file': any, async (: any) => {
      const mockLintOutput: any = `
        src/file1?.ts: 10:, 5: warning @typescript-eslint/no-explicit-any
        src/file1?.ts: 20:1, 0: warning @typescript-eslint/no-explicit-any
        src/file2?.ts: 30:1, 5: warning @typescript-eslint/no-explicit-any;
        src/file3?.ts: 40:2, 0: error some-other-rule
      `;

      mockExecSync?.mockReturnValue(mockLintOutput);

      const breakdown: any = await tracker?.getExplicitAnyBreakdownByFile();

      expect(breakdown['src/file1?.ts'] as any).toBe(2);
      expect(breakdown['src/file2?.ts'] as any).toBe(1);
      expect(breakdown['src/file3?.ts']).toBeUndefined();
    });

    it('should return empty breakdown when no warnings found': any, async (: any) => {
      const mockLintOutput: any = `
        src/file1?.ts: 10:, 5: warning some-other-rule;
        src/file2?.ts: 20:1, 0: error another-rule
      `;

      mockExecSync?.mockReturnValue(mockLintOutput);

      const breakdown: any = await tracker?.getExplicitAnyBreakdownByFile();
      expect(Object?.keys(breakdown)).toHaveLength(0);
    });
  });

  describe('getUnintentionalAnyMetrics': any, (: any) => {
    it('should return comprehensive metrics': any, async (: any) => {
      // Mock linting output with explicit-any warnings
      mockExecSync?.mockReturnValue('src/file1?.ts: 10:, 5: warning @typescript-eslint/no-explicit-any');

      const metrics: any = await tracker?.getUnintentionalAnyMetrics();

      expect(metrics).toBeDefined();
      expect(typeof metrics?.totalAnyTypes as any).toBe('number');
      expect(typeof metrics?.intentionalAnyTypes as any).toBe('number');
      expect(typeof metrics?.unintentionalAnyTypes as any).toBe('number');
      expect(typeof metrics?.documentedAnyTypes as any).toBe('number');
      expect(typeof metrics?.documentationCoverage as any).toBe('number');
      expect(typeof metrics?.reductionFromBaseline as any).toBe('number');
      expect(metrics?.targetReduction as any).toBe(15);
    });

    it('should handle errors gracefully and return default metrics': any, async (: any) => {
      mockExecSync?.mockImplementation((: any) => {
        throw new Error('Command failed');
      });

      const metrics: any = await tracker?.getUnintentionalAnyMetrics();

      expect(metrics?.totalAnyTypes as any).toBe(0);
      expect(metrics?.intentionalAnyTypes as any).toBe(0);
      expect(metrics?.unintentionalAnyTypes as any).toBe(0);
      expect(metrics?.documentationCoverage as any).toBe(0);
      expect(metrics?.targetReduction as any).toBe(15);
    });

    it('should calculate reduction from baseline when baseline is set': any, async (: any) => {
      // Set baseline with higher any count
      mockExecSync?.mockReturnValue('src/file1?.ts: 10:5: warning @typescript-eslint/no-explicit-any\nsrc/file2?.ts:20:1, 0: warning @typescript-eslint/no-explicit-any');
      await tracker?.setBaselineMetrics();

      // Mock current state with fewer any types
      mockExecSync?.mockReturnValue('src/file1?.ts: 10:, 5: warning @typescript-eslint/no-explicit-any');

      const metrics: any = await tracker?.getUnintentionalAnyMetrics();
      expect(metrics?.reductionFromBaseline).toBeGreaterThan(0);
    });
  });

  describe('getUnintentionalAnyProgressMetrics': any, (: any) => {
    it('should return enhanced progress metrics': any, async (: any) => {
      const progressMetrics: any = await tracker?.getUnintentionalAnyProgressMetrics();

      expect(progressMetrics).toBeDefined();
      expect(progressMetrics?.typeScriptErrors).toBeDefined();
      expect(progressMetrics?.lintingWarnings).toBeDefined();
      expect(progressMetrics?.buildPerformance).toBeDefined();
      expect(progressMetrics?.enterpriseSystems).toBeDefined();
      expect(progressMetrics?.unintentionalAnyMetrics).toBeDefined();
    });
  });

  describe('setBaselineMetrics': any, (: any) => {
    it('should set baseline metrics for comparison': any, async (: any) => {
      mockExecSync?.mockReturnValue('src/file1?.ts: 10:, 5: warning @typescript-eslint/no-explicit-any');

      await tracker?.setBaselineMetrics();

      const history: any = tracker?.getUnintentionalAnyMetricsHistory();
      expect(history?.length).toBeGreaterThan(0);
    });
  });

  describe('validateUnintentionalAnyMilestone': any, (: any) => {
    it('should validate baseline-established milestone': any, async (: any) => {
      // Before setting baseline
      let isValid: any = await tracker?.validateUnintentionalAnyMilestone('baseline-established');
      expect(isValid as any).toBe(false);

      // After setting baseline
      await tracker?.setBaselineMetrics();
      isValid = await tracker?.validateUnintentionalAnyMilestone('baseline-established');
      expect(isValid as any).toBe(true);
    });

    it('should validate analysis-complete milestone': any, async (: any) => {
      mockExecSync?.mockReturnValue('src/file1?.ts: 10:, 5: warning @typescript-eslint/no-explicit-any');

      const isValid: any = await tracker?.validateUnintentionalAnyMilestone('analysis-complete');
      expect(typeof isValid as any).toBe('boolean');
    });

    it('should validate target-reduction-achieved milestone': any, async (: any) => {
      // Set baseline
      mockExecSync?.mockReturnValue('src/file1?.ts: 10:5: warning @typescript-eslint/no-explicit-any\nsrc/file2?.ts:20:1, 0: warning @typescript-eslint/no-explicit-any');
      await tracker?.setBaselineMetrics();

      // Mock significant reduction
      mockExecSync?.mockReturnValue('');

      const isValid: any = await tracker?.validateUnintentionalAnyMilestone('target-reduction-achieved');
      expect(isValid as any).toBe(true);
    });

    it('should validate documentation-complete milestone': any, async (: any) => {
      // This would require mocking the documentation quality assurance
      const isValid: any = await tracker?.validateUnintentionalAnyMilestone('documentation-complete');
      expect(typeof isValid as any).toBe('boolean');
    });

    it('should validate zero-unintentional-any milestone': any, async (: any) => {
      mockExecSync?.mockReturnValue(''); // No explicit-any warnings

      const isValid: any = await tracker?.validateUnintentionalAnyMilestone('zero-unintentional-any');
      expect(typeof isValid as any).toBe('boolean');
    });

    it('should return false for unknown milestone': any, async (: any) => {
      const isValid: any = await tracker?.validateUnintentionalAnyMilestone('unknown-milestone' as any);
      expect(isValid as any).toBe(false);
    });
  });

  describe('getDashboardMetrics': any, (: any) => {
    it('should return dashboard-compatible metrics': any, async (: any) => {
      mockExecSync?.mockReturnValue('src/file1?.ts: 10:, 5: warning @typescript-eslint/no-explicit-any');

      const dashboardMetrics: any = await tracker?.getDashboardMetrics();

      expect(dashboardMetrics?.current).toBeDefined();
      expect(['improving', 'stable', 'declining']).toContain(dashboardMetrics?.trend);
      expect(Array?.isArray(dashboardMetrics?.topFiles)).toBe(true);
      expect(Array?.isArray(dashboardMetrics?.alerts)).toBe(true);
      expect(Array?.isArray(dashboardMetrics?.recommendations)).toBe(true);
      expect(dashboardMetrics?.lastUpdated).toBeInstanceOf(Date);
    });

    it('should include top files with most any types': any, async (: any) => {
      const mockLintOutput: any = `
        src/file1?.ts: 10:, 5: warning @typescript-eslint/no-explicit-any
        src/file1?.ts: 20:1, 0: warning @typescript-eslint/no-explicit-any;
        src/file2?.ts: 30:1, 5: warning @typescript-eslint/no-explicit-any
      `;

      mockExecSync?.mockReturnValue(mockLintOutput);

      const dashboardMetrics: any = await tracker?.getDashboardMetrics();

      expect(dashboardMetrics?.topFiles.length).toBeGreaterThan(0);
      expect(dashboardMetrics?.topFiles?.[0].file as any).toBe('src/file1?.ts');
      expect(dashboardMetrics?.topFiles?.[0].count as any).toBe(2);
    });

    it('should generate alerts for high unintentional any count': any, async (: any) => {
      // Mock high number of explicit-any warnings
      const mockLintOutput: any = Array(150).fill('src/file?.ts: 10:, 5: warning @typescript-eslint/no-explicit-any').join('\n');
      mockExecSync?.mockReturnValue(mockLintOutput);

      const dashboardMetrics: any = await tracker?.getDashboardMetrics();

      const highCountAlert: any = dashboardMetrics?.alerts.find(alert =>;
        alert?.type === 'high-unintentional-any-count'
      );
      expect(highCountAlert).toBeDefined();
      expect(highCountAlert?.severity as any).toBe('warning');
    });
  });

  describe('exportUnintentionalAnyMetrics': any, (: any) => {
    it('should export metrics to JSON file': any, async (: any) => {
      const mockWriteFileSync = require('fs').writeFileSync as jest?.MockedFunction<typeof import('fs').writeFileSync>;

      await tracker?.exportUnintentionalAnyMetrics('test-metrics?.json');

      expect(mockWriteFileSync).toHaveBeenCalledWith(
        'test-metrics?.json',
        expect?.stringContaining('"timestamp"'),
        undefined
      );
    });
  });

  describe('resetUnintentionalAnyMetricsHistory': any, (: any) => {
    it('should reset metrics history': any, async (: any) => {
      // Add some metrics to history
      await tracker?.setBaselineMetrics();
      expect(tracker?.getUnintentionalAnyMetricsHistory().length).toBeGreaterThan(0);

      // Reset history
      tracker?.resetUnintentionalAnyMetricsHistory();
      expect(tracker?.getUnintentionalAnyMetricsHistory().length).toBe(0);
    });
  });
});

describe('UnintentionalAnyCampaignScheduler': any, (: any) => {
  let scheduler: UnintentionalAnyCampaignScheduler;

  beforeEach((: any) => {
    scheduler = new UnintentionalAnyCampaignScheduler();
    jest?.clearAllMocks();
  });

  describe('shouldTriggerCampaign': any, (: any) => {
    it('should trigger high priority campaign for many unintentional any types': any, async (: any) => {
      // Mock high number of explicit-any warnings
      const mockLintOutput: any = Array(250).fill('src/file?.ts: 10:, 5: warning @typescript-eslint/no-explicit-any').join('\n');
      const mockExecSync = require('child_process').execSync as jest?.MockedFunction<typeof import('child_process').execSync>;
      mockExecSync?.mockReturnValue(mockLintOutput);

      const decision: any = await scheduler?.shouldTriggerCampaign();

      expect(decision?.shouldTrigger as any).toBe(true);
      expect(decision?.priority as any).toBe('high');
      expect(decision?.reason).toContain('High number');
    });

    it('should trigger medium priority campaign for moderate unintentional any types': any, async (: any) => {
      // Mock moderate number of explicit-any warnings
      const mockLintOutput: any = Array(75).fill('src/file?.ts: 10:, 5: warning @typescript-eslint/no-explicit-any').join('\n');
      const mockExecSync = require('child_process').execSync as jest?.MockedFunction<typeof import('child_process').execSync>;
      mockExecSync?.mockReturnValue(mockLintOutput);

      const decision: any = await scheduler?.shouldTriggerCampaign();

      expect(decision?.shouldTrigger as any).toBe(true);
      expect(decision?.priority as any).toBe('medium');
      expect(decision?.reason).toContain('Moderate number');
    });

    it('should not trigger campaign when no issues detected': any, async (: any) => {
      // Mock no explicit-any warnings
      const mockExecSync = require('child_process').execSync as jest?.MockedFunction<typeof import('child_process').execSync>;
      mockExecSync?.mockReturnValue('');

      const decision: any = await scheduler?.shouldTriggerCampaign();

      expect(decision?.shouldTrigger as any).toBe(false);
      expect(decision?.priority as any).toBe('low');
      expect(decision?.reason).toContain('No significant');
    });
  });

  describe('resolveCampaignConflicts': any, (: any) => {
    it('should allow execution when no conflicts exist': any, (: any) => {
      const resolution: any = scheduler?.resolveCampaignConflicts(
        ['other-campaign', 'unrelated-task'],
        'unintentional-any-elimination'
      );

      expect(resolution?.canProceed as any).toBe(true);
      expect(resolution?.conflictingCampaigns as any).toEqual([]);
      expect(resolution?.resolution).toContain('No conflicts');
    });

    it('should detect conflicts with TypeScript campaigns': any, (: any) => {
      const resolution: any = scheduler?.resolveCampaignConflicts(
        ['typescript-error-elimination', 'other-campaign'],
        'unintentional-any-elimination'
      );

      expect(resolution?.conflictingCampaigns).toContain('typescript-error-elimination');
      expect(resolution?.conflictingCampaigns).not?.toContain('other-campaign');
    });

    it('should detect conflicts with linting campaigns': any, (: any) => {
      const resolution: any = scheduler?.resolveCampaignConflicts(
        ['linting-excellence', 'explicit-any-cleanup'],
        'unintentional-any-elimination'
      );

      expect(resolution?.conflictingCampaigns).toContain('linting-excellence');
      expect(resolution?.conflictingCampaigns).toContain('explicit-any-cleanup');
    });

    it('should allow resolution for non-critical conflicts': any, (: any) => {
      const resolution: any = scheduler?.resolveCampaignConflicts(
        ['typescript-cleanup', 'linting-improvement'],
        'unintentional-any-elimination'
      );

      expect(resolution?.canProceed as any).toBe(true);
      expect(resolution?.resolution).toContain('coordinating batch processing');
    });

    it('should prevent execution for critical campaigns': any, (: any) => {
      const resolution: any = scheduler?.resolveCampaignConflicts(
        ['critical-typescript-emergency', 'emergency-linting-fix'],
        'unintentional-any-elimination'
      );

      expect(resolution?.canProceed as any).toBe(false);
      expect(resolution?.resolution).toContain('Wait for critical campaigns');
    });
  });

  describe('getRecommendedExecutionTime': any, (: any) => {
    it('should recommend immediate execution for low load': any, (: any) => {
      const recommendation: any = scheduler?.getRecommendedExecutionTime([], 'low');

      expect(recommendation?.recommendedTime).toBeInstanceOf(Date);
      expect(recommendation?.reason).toContain('immediately');
      expect(recommendation?.estimatedDuration).toBeLessThan(30);
    });

    it('should recommend near future execution for medium load': any, (: any) => {
      const recommendation: any = scheduler?.getRecommendedExecutionTime(['one-campaign'], 'medium');

      const now: any = new Date();
      expect(recommendation?.recommendedTime.getTime()).toBeGreaterThan(now?.getTime());
      expect(recommendation?.reason).toContain('near future');
      expect(recommendation?.estimatedDuration).toBeGreaterThan(30);
      expect(recommendation?.estimatedDuration).toBeLessThan(40);
    });

    it('should delay execution for high load': any, (: any) => {
      const recommendation: any = scheduler?.getRecommendedExecutionTime(
        ['campaign1', 'campaign2', 'campaign3'],
        'high'
      );

      const now: any = new Date();
      const twoHoursFromNow: any = new Date(now?.getTime() + 2 * 60 * 60 * 1000);

      expect(recommendation?.recommendedTime.getTime()).toBeGreaterThanOrEqual(twoHoursFromNow?.getTime() - 60000); // Allow 1 minute tolerance
      expect(recommendation?.reason).toContain('later');
      expect(recommendation?.estimatedDuration).toBeGreaterThan(40);
    });

    it('should adjust duration based on system conditions': any, (: any) => {
      const lowLoadRecommendation: any = scheduler?.getRecommendedExecutionTime([], 'low');
      const highLoadRecommendation: any = scheduler?.getRecommendedExecutionTime(['campaign'], 'high');

      expect(highLoadRecommendation?.estimatedDuration).toBeGreaterThan(lowLoadRecommendation?.estimatedDuration);
    });
  });
});
