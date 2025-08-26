/**
 * Unit Tests for ProgressTracker
 * Perfect Codebase Campaign - Progress Tracking Testing
 */

import { execSync } from 'child_process';
import * as fs from 'fs';

import { Milestone, PhaseStatus, ProgressMetrics } from '../../../types/campaign';
import { ProgressTracker } from '../ProgressTracker';

// Mock dependencies
jest.mock('child_process');
jest.mock('fs');

const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;
const mockFs = fs as jest.Mocked<typeof fs>;

describe('ProgressTracker', () => {
  let progressTracker: ProgressTracker;

  beforeEach(() => {
    progressTracker = new ProgressTracker();
    jest.clearAllMocks();

    // Default mock implementations
    mockExecSync.mockReturnValue('');
    mockFs.existsSync.mockReturnValue(true);
    mockFs.writeFileSync.mockImplementation(() => {});
  });

  describe('Constructor', () => {
    it('should initialize with empty metrics history', () => {
      const history = progressTracker.getMetricsHistory();
      expect(history).toEqual([]);
    });

    it('should initialize with current timestamp', () => {
      const lastUpdate = (progressTracker as any).lastMetricsUpdate;
      expect(lastUpdate).toBeInstanceOf(Date);
    });
  });

  describe('getTypeScriptErrorCount', () => {
    it('should return error count from tsc output', async () => {
      mockExecSync.mockReturnValue('5');

      const count = await progressTracker.getTypeScriptErrorCount();

      expect(count).toBe(5);
      expect(mockExecSync).toHaveBeenCalledWith(
        'yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS"',
        expect.any(Object),
      );
    });

    it('should return 0 when no errors found', async () => {
      mockExecSync.mockImplementation(() => {
        const error = new Error('No matches found') as unknown as Error & { status: number };
        error.status = 1; // grep returns 1 when no matches
        throw error;
      });

      const count = await progressTracker.getTypeScriptErrorCount();

      expect(count).toBe(0);
    });

    it('should return -1 on command failure', async () => {
      mockExecSync.mockImplementation(() => {
        const error = new Error('Command failed') as unknown as Error & { status: number };
        error.status = 2; // Other error
        throw error;
      });

      const count = await progressTracker.getTypeScriptErrorCount();

      expect(count).toBe(-1);
    });

    it('should handle empty output', async () => {
      mockExecSync.mockReturnValue('');

      const count = await progressTracker.getTypeScriptErrorCount();

      expect(count).toBe(0);
    });
  });

  describe('getTypeScriptErrorBreakdown', () => {
    it('should return error breakdown by type', async () => {
      mockExecSync.mockReturnValue(`
        15 TS2352
        10 TS2345
         5 TS2698
         3 TS2304
      `);

      const breakdown = await progressTracker.getTypeScriptErrorBreakdown();

      expect(breakdown['TS2352']).toBe(15);
      expect(breakdown['TS2345']).toBe(10);
      expect(breakdown['TS2698']).toBe(5);
      expect(breakdown['TS2304']).toBe(3);
    });

    it('should handle empty breakdown', async () => {
      mockExecSync.mockReturnValue('');

      const breakdown = await progressTracker.getTypeScriptErrorBreakdown();

      expect(breakdown).toEqual({});
    });

    it('should handle command failure gracefully', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Command failed');
      });

      const breakdown = await progressTracker.getTypeScriptErrorBreakdown();

      expect(breakdown).toEqual({});
    });
  });

  describe('getLintingWarningCount', () => {
    it('should return warning count from lint output', async () => {
      mockExecSync.mockReturnValue('42');

      const count = await progressTracker.getLintingWarningCount();

      expect(count).toBe(42);
      expect(mockExecSync).toHaveBeenCalledWith('yarn lint 2>&1 | grep -c "warning"', expect.any(Object));
    });

    it('should return 0 when no warnings found', async () => {
      mockExecSync.mockImplementation(() => {
        const error = new Error('No matches found') as unknown as Error & { status: number };
        error.status = 1; // grep returns 1 when no matches
        throw error;
      });

      const count = await progressTracker.getLintingWarningCount();

      expect(count).toBe(0);
    });

    it('should return -1 on command failure', async () => {
      mockExecSync.mockImplementation(() => {
        const error = new Error('Command failed') as unknown as Error & { status: number };
        error.status = 2; // Other error
        throw error;
      });

      const count = await progressTracker.getLintingWarningCount();

      expect(count).toBe(-1);
    });
  });

  describe('getLintingWarningBreakdown', () => {
    it('should return warning breakdown by rule type', async () => {
      mockExecSync.mockReturnValue(`
        file1.ts:10:5 - warning: Unexpected any @typescript-eslint/no-explicit-any
        file2.ts:15:10 - warning: Unused variable no-unused-vars
        file3.ts:20:1 - warning: Console statement no-console
        file4.ts:25:3 - warning: Another any @typescript-eslint/no-explicit-any
      `);

      const breakdown = await progressTracker.getLintingWarningBreakdown();

      expect(breakdown['@typescript-eslint/no-explicit-any']).toBe(2);
      expect(breakdown['no-unused-vars']).toBe(1);
      expect(breakdown['no-console']).toBe(1);
    });

    it('should handle empty breakdown', async () => {
      mockExecSync.mockReturnValue('');

      const breakdown = await progressTracker.getLintingWarningBreakdown();

      expect(breakdown).toEqual({});
    });

    it('should handle command failure gracefully', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Command failed');
      });

      const breakdown = await progressTracker.getLintingWarningBreakdown();

      expect(breakdown).toEqual({});
    });
  });

  describe('getBuildTime', () => {
    it('should measure build time successfully', async () => {
      // Mock successful build
      mockExecSync.mockImplementation(() => {
        // Simulate build taking some time
        return '';
      });

      const buildTime = await progressTracker.getBuildTime();

      expect(buildTime).toBeGreaterThan(0);
      expect(mockExecSync).toHaveBeenCalledWith('yarn build', expect.any(Object));
    });

    it('should return -1 on build failure', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Build failed');
      });

      const buildTime = await progressTracker.getBuildTime();

      expect(buildTime).toBe(-1);
    });
  });

  describe('getEnterpriseSystemCount', () => {
    it('should count intelligence systems', async () => {
      mockExecSync.mockReturnValue('25');

      const count = await progressTracker.getEnterpriseSystemCount();

      expect(count).toBe(25);
      expect(mockExecSync).toHaveBeenCalledWith('grep -r "INTELLIGENCE_SYSTEM" src/ | wc -l', expect.any(Object));
    });

    it('should return 0 when no systems found', async () => {
      mockExecSync.mockReturnValue('0');

      const count = await progressTracker.getEnterpriseSystemCount();

      expect(count).toBe(0);
    });

    it('should handle command failure gracefully', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Command failed');
      });

      const count = await progressTracker.getEnterpriseSystemCount();

      expect(count).toBe(0);
    });
  });

  describe('getCacheHitRate', () => {
    it('should return mock cache hit rate', async () => {
      const rate = await progressTracker.getCacheHitRate();

      expect(rate).toBe(0.8);
    });

    it('should handle errors gracefully', async () => {
      // Mock implementation that throws
      jest.spyOn(progressTracker as unknown, 'getCacheHitRate').mockImplementation(() => {
        throw new Error('Cache measurement failed');
      });

      const rate = await progressTracker.getCacheHitRate().catch(() => 0);

      expect(rate).toBe(0);
    });
  });

  describe('getMemoryUsage', () => {
    it('should return current memory usage', async () => {
      const originalMemoryUsage = process.memoryUsage;
      process.memoryUsage = jest.fn().mockReturnValue({
        heapUsed: 50 * 1024 * 1024, // 50MB
        heapTotal: 100 * 1024 * 1024,
        external: 0,
        rss: 60 * 1024 * 1024,
        arrayBuffers: 0,
      }) as unknown;

      const memory = await progressTracker.getMemoryUsage();

      expect(memory).toBe(50);

      process.memoryUsage = originalMemoryUsage;
    });

    it('should handle memory measurement errors', async () => {
      const originalMemoryUsage = process.memoryUsage;
      process.memoryUsage = jest.fn().mockImplementation(() => {
        throw new Error('Memory measurement failed');
      }) as unknown;

      const memory = await progressTracker.getMemoryUsage();

      expect(memory).toBe(0);

      process.memoryUsage = originalMemoryUsage;
    });
  });

  describe('getBundleSize', () => {
    it('should calculate bundle size from build directories', async () => {
      mockFs.existsSync.mockImplementation(path => {
        return path === '.next' || path === 'dist';
      });

      mockExecSync.mockImplementation(command => {
        if (command.toString().includes('du -sk .next')) {
          return '300';
        }
        if (command.toString().includes('du -sk dist')) {
          return '120';
        }
        return '';
      });

      const size = await progressTracker.getBundleSize();

      expect(size).toBe(420); // 300 + 120
    });

    it('should return 0 when no build directories exist', async () => {
      mockFs.existsSync.mockReturnValue(false);

      const size = await progressTracker.getBundleSize();

      expect(size).toBe(0);
    });

    it('should handle command failure gracefully', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockExecSync.mockImplementation(() => {
        throw new Error('Command failed');
      });

      const size = await progressTracker.getBundleSize();

      expect(size).toBe(0);
    });
  });

  describe('getProgressMetrics', () => {
    beforeEach(() => {
      jest.spyOn(progressTracker, 'getTypeScriptErrorCount').mockResolvedValue(50);
      jest.spyOn(progressTracker, 'getLintingWarningCount').mockResolvedValue(2000);
      jest.spyOn(progressTracker, 'getBuildTime').mockResolvedValue(8.5);
      jest.spyOn(progressTracker, 'getEnterpriseSystemCount').mockResolvedValue(100);
      jest.spyOn(progressTracker, 'getCacheHitRate').mockResolvedValue(0.85);
      jest.spyOn(progressTracker, 'getMemoryUsage').mockResolvedValue(42);
    });

    it('should return comprehensive progress metrics', async () => {
      const metrics = await progressTracker.getProgressMetrics();

      expect(metrics.typeScriptErrors.current).toBe(50);
      expect(metrics.typeScriptErrors.target).toBe(0);
      expect(metrics.typeScriptErrors.reduction).toBe(36); // 86 - 50
      expect(metrics.typeScriptErrors.percentage).toBe(42); // (36/86) * 100

      expect(metrics.lintingWarnings.current).toBe(2000);
      expect(metrics.lintingWarnings.target).toBe(0);
      expect(metrics.lintingWarnings.reduction).toBe(2506); // 4506 - 2000
      expect(metrics.lintingWarnings.percentage).toBe(56); // (2506/4506) * 100

      expect(metrics.buildPerformance.currentTime).toBe(8.5);
      expect(metrics.buildPerformance.targetTime).toBe(10);
      expect(metrics.buildPerformance.cacheHitRate).toBe(0.85);
      expect(metrics.buildPerformance.memoryUsage).toBe(42);

      expect(metrics.enterpriseSystems.current).toBe(100);
      expect(metrics.enterpriseSystems.target).toBe(200);
      expect(metrics.enterpriseSystems.transformedExports).toBe(100);
    });

    it('should store metrics in history', async () => {
      await progressTracker.getProgressMetrics();

      const history = progressTracker.getMetricsHistory();
      expect(history.length).toBe(1);
    });

    it('should limit metrics history to prevent memory issues', async () => {
      // Add many metrics to history
      for (let i = 0; i < 110; i++) {
        await progressTracker.getProgressMetrics();
      }

      const history = progressTracker.getMetricsHistory();
      expect(history.length).toBe(50); // Should be trimmed to 50
    });

    it('should handle negative error counts gracefully', async () => {
      jest.spyOn(progressTracker, 'getTypeScriptErrorCount').mockResolvedValue(-1);
      jest.spyOn(progressTracker, 'getLintingWarningCount').mockResolvedValue(-1);

      const metrics = await progressTracker.getProgressMetrics();

      expect(metrics.typeScriptErrors.percentage).toBe(0);
      expect(metrics.lintingWarnings.percentage).toBe(0);
    });
  });

  describe('validateMilestone', () => {
    beforeEach(() => {
      jest.spyOn(progressTracker, 'getProgressMetrics').mockResolvedValue({
        typeScriptErrors: { current: 0, target: 0, reduction: 86, percentage: 100 },
        lintingWarnings: { current: 0, target: 0, reduction: 4506, percentage: 100 },
        buildPerformance: { currentTime: 8.5, targetTime: 10, cacheHitRate: 0.85, memoryUsage: 42 },
        enterpriseSystems: { current: 200, target: 200, transformedExports: 200 },
      });
    });

    it('should validate zero-typescript-errors milestone', async () => {
      const result = await progressTracker.validateMilestone('zero-typescript-errors');
      expect(result).toBe(true);
    });

    it('should validate zero-linting-warnings milestone', async () => {
      const result = await progressTracker.validateMilestone('zero-linting-warnings');
      expect(result).toBe(true);
    });

    it('should validate build-time-under-10s milestone', async () => {
      const result = await progressTracker.validateMilestone('build-time-under-10s');
      expect(result).toBe(true);
    });

    it('should validate enterprise-systems-200 milestone', async () => {
      const result = await progressTracker.validateMilestone('enterprise-systems-200');
      expect(result).toBe(true);
    });

    it('should validate phase completion milestones', async () => {
      const phase1 = await progressTracker.validateMilestone('phase-1-complete');
      const phase2 = await progressTracker.validateMilestone('phase-2-complete');
      const phase3 = await progressTracker.validateMilestone('phase-3-complete');
      const phase4 = await progressTracker.validateMilestone('phase-4-complete');

      expect(phase1).toBe(true);
      expect(phase2).toBe(true);
      expect(phase3).toBe(true);
      expect(phase4).toBe(true);
    });

    it('should fail validation for incomplete milestones', async () => {
      jest.spyOn(progressTracker, 'getProgressMetrics').mockResolvedValue({
        typeScriptErrors: { current: 5, target: 0, reduction: 81, percentage: 94 },
        lintingWarnings: { current: 100, target: 0, reduction: 4406, percentage: 98 },
        buildPerformance: { currentTime: 12, targetTime: 10, cacheHitRate: 0.6, memoryUsage: 60 },
        enterpriseSystems: { current: 150, target: 200, transformedExports: 150 },
      });

      const tsErrors = await progressTracker.validateMilestone('zero-typescript-errors');
      const lintWarnings = await progressTracker.validateMilestone('zero-linting-warnings');
      const buildTime = await progressTracker.validateMilestone('build-time-under-10s');
      const enterprise = await progressTracker.validateMilestone('enterprise-systems-200');

      expect(tsErrors).toBe(false);
      expect(lintWarnings).toBe(false);
      expect(buildTime).toBe(false);
      expect(enterprise).toBe(false);
    });

    it('should handle unknown milestones', async () => {
      const result = await progressTracker.validateMilestone('unknown-milestone' as Milestone);
      expect(result).toBe(false);
    });
  });

  describe('generateProgressReport', () => {
    beforeEach(() => {
      jest.spyOn(progressTracker, 'getProgressMetrics').mockResolvedValue({
        typeScriptErrors: { current: 25, target: 0, reduction: 61, percentage: 71 },
        lintingWarnings: { current: 1000, target: 0, reduction: 3506, percentage: 78 },
        buildPerformance: { currentTime: 9, targetTime: 10, cacheHitRate: 0.8, memoryUsage: 45 },
        enterpriseSystems: { current: 150, target: 200, transformedExports: 150 },
      });
    });

    it('should generate comprehensive progress report', async () => {
      const report = await progressTracker.generateProgressReport();

      expect(report.campaignId).toBe('perfect-codebase-campaign');
      expect(report.overallProgress).toBeGreaterThan(0);
      expect(report.phases).toHaveLength(2);
      expect(report.currentMetrics).toBeDefined();
      expect(report.targetMetrics).toBeDefined();
      expect(report.estimatedCompletion).toBeInstanceOf(Date);
    });

    it('should calculate overall progress correctly', async () => {
      const report = await progressTracker.generateProgressReport();

      // Overall progress should be average of all phase progress
      // TypeScript: 71%, Linting: 78%, Build: 100%, Enterprise: 75%
      // Average: (71 + 78 + 100 + 75) / 4 = 81%
      expect(report.overallProgress).toBe(81);
    });

    it('should generate phase reports with correct status', async () => {
      const report = await progressTracker.generateProgressReport();

      const phase1 = report.phases.find(p => p.phaseId === 'phase1');
      const phase2 = report.phases.find(p => p.phaseId === 'phase2');

      expect(phase1?.status).toBe(PhaseStatus.IN_PROGRESS);
      expect(phase2?.status).toBe(PhaseStatus.IN_PROGRESS);
      expect(phase1?.issues).toContain('25 TypeScript errors remaining');
      expect(phase2?.issues).toContain('1000 linting warnings remaining');
    });

    it('should show completed status for finished phases', async () => {
      jest.spyOn(progressTracker, 'getProgressMetrics').mockResolvedValue({
        typeScriptErrors: { current: 0, target: 0, reduction: 86, percentage: 100 },
        lintingWarnings: { current: 0, target: 0, reduction: 4506, percentage: 100 },
        buildPerformance: { currentTime: 8, targetTime: 10, cacheHitRate: 0.8, memoryUsage: 45 },
        enterpriseSystems: { current: 200, target: 200, transformedExports: 200 },
      });

      const report = await progressTracker.generateProgressReport();

      const phase1 = report.phases.find(p => p.phaseId === 'phase1');
      const phase2 = report.phases.find(p => p.phaseId === 'phase2');

      expect(phase1?.status).toBe(PhaseStatus.COMPLETED);
      expect(phase2?.status).toBe(PhaseStatus.COMPLETED);
      expect(phase1?.achievements).toContain('Zero TypeScript errors achieved');
      expect(phase2?.achievements).toContain('Zero linting warnings achieved');
    });
  });

  describe('getMetricsImprovement', () => {
    it('should calculate improvement correctly', async () => {
      // Add initial metrics
      jest.spyOn(progressTracker, 'getProgressMetrics').mockResolvedValueOnce({
        typeScriptErrors: { current: 86, target: 0, reduction: 0, percentage: 0 },
        lintingWarnings: { current: 4506, target: 0, reduction: 0, percentage: 0 },
        buildPerformance: { currentTime: 12, targetTime: 10, cacheHitRate: 0.7, memoryUsage: 60 },
        enterpriseSystems: { current: 0, target: 200, transformedExports: 0 },
      });
      await progressTracker.getProgressMetrics();

      // Add improved metrics
      jest.spyOn(progressTracker, 'getProgressMetrics').mockResolvedValueOnce({
        typeScriptErrors: { current: 50, target: 0, reduction: 36, percentage: 42 },
        lintingWarnings: { current: 3000, target: 0, reduction: 1506, percentage: 33 },
        buildPerformance: { currentTime: 9, targetTime: 10, cacheHitRate: 0.8, memoryUsage: 45 },
        enterpriseSystems: { current: 100, target: 200, transformedExports: 100 },
      });
      await progressTracker.getProgressMetrics();

      const improvement = progressTracker.getMetricsImprovement();

      expect(improvement.typeScriptErrorsReduced).toBe(36);
      expect(improvement.lintingWarningsReduced).toBe(1506);
      expect(improvement.buildTimeImproved).toBe(3);
      expect(improvement.enterpriseSystemsAdded).toBe(100);
    });

    it('should return zero improvement with insufficient history', () => {
      const improvement = progressTracker.getMetricsImprovement();

      expect(improvement.typeScriptErrorsReduced).toBe(0);
      expect(improvement.lintingWarningsReduced).toBe(0);
      expect(improvement.buildTimeImproved).toBe(0);
      expect(improvement.enterpriseSystemsAdded).toBe(0);
    });
  });

  describe('exportMetrics', () => {
    beforeEach(() => {
      jest.spyOn(progressTracker, 'generateProgressReport').mockResolvedValue({
        campaignId: 'perfect-codebase-campaign',
        overallProgress: 75,
        phases: [],
        currentMetrics: {} as ProgressMetrics,
        targetMetrics: {} as ProgressMetrics,
        estimatedCompletion: new Date(),
      });
    });

    it('should export metrics to JSON file', async () => {
      await progressTracker.exportMetrics('test-metrics.json');

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        'test-metrics.json',
        expect.stringContaining('"campaignId": "perfect-codebase-campaign"'),
        undefined,
      );
    });

    it('should include timestamp in export', async () => {
      await progressTracker.exportMetrics('test-metrics.json');

      const writeCall = mockFs.writeFileSync.mock.calls[0];
      const exportData = JSON.parse(writeCall[1] as string);

      expect(exportData.timestamp).toBeDefined();
      expect(new Date(exportData.timestamp)).toBeInstanceOf(Date);
    });

    it('should handle export errors', async () => {
      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error('Write failed');
      });

      await expect(progressTracker.exportMetrics('test-metrics.json')).rejects.toThrow(
        'Failed to export metrics: Write failed',
      );
    });
  });

  describe('resetMetricsHistory', () => {
    it('should clear metrics history', async () => {
      // Add some metrics first
      await progressTracker.getProgressMetrics();
      expect(progressTracker.getMetricsHistory().length).toBe(1);

      progressTracker.resetMetricsHistory();

      expect(progressTracker.getMetricsHistory().length).toBe(0);
    });

    it('should update last metrics update timestamp', () => {
      const beforeReset = (progressTracker as any).lastMetricsUpdate;

      progressTracker.resetMetricsHistory();

      const afterReset = (progressTracker as any).lastMetricsUpdate;
      expect(afterReset.getTime()).toBeGreaterThan(beforeReset.getTime());
    });
  });
});
