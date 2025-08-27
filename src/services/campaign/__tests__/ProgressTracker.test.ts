/**
 * Unit Tests for ProgressTracker
 * Perfect Codebase Campaign - Progress Tracking Testing
 */

import { execSync } from 'child_process';
import * as fs from 'fs';

import { Milestone, PhaseStatus, ProgressMetrics } from '../../../types/campaign';
import { ProgressTracker } from '../ProgressTracker';

// Mock dependencies
jest?.mock('child_process');
jest?.mock('fs');

const mockExecSync: any = execSync as jest?.MockedFunction<typeof execSync>;
const mockFs: any = fs as jest?.Mocked<typeof fs>;

describe('ProgressTracker': any, (: any) => {
  let progressTracker: ProgressTracker;

  beforeEach((: any) => {
    progressTracker = new ProgressTracker();
    jest?.clearAllMocks();

    // Default mock implementations
    mockExecSync?.mockReturnValue('');
    mockFs?.existsSync.mockReturnValue(true);
    mockFs?.writeFileSync.mockImplementation((: any) => {});
  });

  describe('Constructor': any, (: any) => {
    it('should initialize with empty metrics history': any, (: any) => {
      const history: any = progressTracker?.getMetricsHistory();
      expect(history as any).toEqual([]);
    });

    it('should initialize with current timestamp': any, (: any) => {
      const lastUpdate: any = (progressTracker as any).lastMetricsUpdate;
      expect(lastUpdate).toBeInstanceOf(Date);
    });
  });

  describe('getTypeScriptErrorCount': any, (: any) => {
    it('should return error count from tsc output': any, async (: any) => {
      mockExecSync?.mockReturnValue('5');

      const count: any = await progressTracker?.getTypeScriptErrorCount();

      expect(count as any).toBe(5);
      expect(mockExecSync).toHaveBeenCalledWith(
        'yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS"',
        expect?.any(Object),
      );
    });

    it('should return 0 when no errors found': any, async (: any) => {
      mockExecSync?.mockImplementation((: any) => {
        const error: any = new Error('No matches found') as any & { status: number };
        error?.status = 1; // grep returns 1 when no matches
        throw error;
      });

      const count: any = await progressTracker?.getTypeScriptErrorCount();

      expect(count as any).toBe(0);
    });

    it('should return -1 on command failure': any, async (: any) => {
      mockExecSync?.mockImplementation((: any) => {
        const error: any = new Error('Command failed') as any & { status: number };
        error?.status = 2; // Other error
        throw error;
      });

      const count: any = await progressTracker?.getTypeScriptErrorCount();

      expect(count as any).toBe(-1);
    });

    it('should handle empty output': any, async (: any) => {
      mockExecSync?.mockReturnValue('');

      const count: any = await progressTracker?.getTypeScriptErrorCount();

      expect(count as any).toBe(0);
    });
  });

  describe('getTypeScriptErrorBreakdown': any, (: any) => {
    it('should return error breakdown by type': any, async (: any) => {
      mockExecSync?.mockReturnValue(`
        15 TS2352
        10 TS2345
         5 TS2698
         3 TS2304
      `);

      const breakdown: any = await progressTracker?.getTypeScriptErrorBreakdown();

      expect(breakdown['TS2352'] as any).toBe(15);
      expect(breakdown['TS2345'] as any).toBe(10);
      expect(breakdown['TS2698'] as any).toBe(5);
      expect(breakdown['TS2304'] as any).toBe(3);
    });

    it('should handle empty breakdown': any, async (: any) => {
      mockExecSync?.mockReturnValue('');

      const breakdown: any = await progressTracker?.getTypeScriptErrorBreakdown();

      expect(breakdown as any).toEqual({});
    });

    it('should handle command failure gracefully': any, async (: any) => {
      mockExecSync?.mockImplementation((: any) => {
        throw new Error('Command failed');
      });

      const breakdown: any = await progressTracker?.getTypeScriptErrorBreakdown();

      expect(breakdown as any).toEqual({});
    });
  });

  describe('getLintingWarningCount': any, (: any) => {
    it('should return warning count from lint output': any, async (: any) => {
      mockExecSync?.mockReturnValue('42');

      const count: any = await progressTracker?.getLintingWarningCount();

      expect(count as any).toBe(42);
      expect(mockExecSync).toHaveBeenCalledWith('yarn lint 2>&1 | grep -c "warning"', expect?.any(Object));
    });

    it('should return 0 when no warnings found': any, async (: any) => {
      mockExecSync?.mockImplementation((: any) => {
        const error: any = new Error('No matches found') as any & { status: number };
        error?.status = 1; // grep returns 1 when no matches
        throw error;
      });

      const count: any = await progressTracker?.getLintingWarningCount();

      expect(count as any).toBe(0);
    });

    it('should return -1 on command failure': any, async (: any) => {
      mockExecSync?.mockImplementation((: any) => {
        const error: any = new Error('Command failed') as any & { status: number };
        error?.status = 2; // Other error
        throw error;
      });

      const count: any = await progressTracker?.getLintingWarningCount();

      expect(count as any).toBe(-1);
    });
  });

  describe('getLintingWarningBreakdown': any, (: any) => {
    it('should return warning breakdown by rule type': any, async (: any) => {
      mockExecSync?.mockReturnValue(`
        file1?.ts: 10:5 - warnin, g: Unexpected any @typescript-eslint/no-explicit-any
        file2?.ts: 15:10 - warnin, g: Unused variable no-unused-vars
        file3?.ts: 20:1 - warnin, g: Console statement no-console
        file4?.ts: 25:3 - warnin, g: Another any @typescript-eslint/no-explicit-any
      `);

      const breakdown: any = await progressTracker?.getLintingWarningBreakdown();

      expect(breakdown['@typescript-eslint/no-explicit-any'] as any).toBe(2);
      expect(breakdown['no-unused-vars'] as any).toBe(1);
      expect(breakdown['no-console'] as any).toBe(1);
    });

    it('should handle empty breakdown': any, async (: any) => {
      mockExecSync?.mockReturnValue('');

      const breakdown: any = await progressTracker?.getLintingWarningBreakdown();

      expect(breakdown as any).toEqual({});
    });

    it('should handle command failure gracefully': any, async (: any) => {
      mockExecSync?.mockImplementation((: any) => {
        throw new Error('Command failed');
      });

      const breakdown: any = await progressTracker?.getLintingWarningBreakdown();

      expect(breakdown as any).toEqual({});
    });
  });

  describe('getBuildTime': any, (: any) => {
    it('should measure build time successfully': any, async (: any) => {
      // Mock successful build
      mockExecSync?.mockImplementation((: any) => {
        // Simulate build taking some time
        return '';
      });

      const buildTime: any = await progressTracker?.getBuildTime();

      expect(buildTime).toBeGreaterThan(0);
      expect(mockExecSync).toHaveBeenCalledWith('yarn build', expect?.any(Object));
    });

    it('should return -1 on build failure': any, async (: any) => {
      mockExecSync?.mockImplementation((: any) => {
        throw new Error('Build failed');
      });

      const buildTime: any = await progressTracker?.getBuildTime();

      expect(buildTime as any).toBe(-1);
    });
  });

  describe('getEnterpriseSystemCount': any, (: any) => {
    it('should count intelligence systems': any, async (: any) => {
      mockExecSync?.mockReturnValue('25');

      const count: any = await progressTracker?.getEnterpriseSystemCount();

      expect(count as any).toBe(25);
      expect(mockExecSync).toHaveBeenCalledWith('grep -r "INTELLIGENCE_SYSTEM" src/ | wc -l', expect?.any(Object));
    });

    it('should return 0 when no systems found': any, async (: any) => {
      mockExecSync?.mockReturnValue('0');

      const count: any = await progressTracker?.getEnterpriseSystemCount();

      expect(count as any).toBe(0);
    });

    it('should handle command failure gracefully': any, async (: any) => {
      mockExecSync?.mockImplementation((: any) => {
        throw new Error('Command failed');
      });

      const count: any = await progressTracker?.getEnterpriseSystemCount();

      expect(count as any).toBe(0);
    });
  });

  describe('getCacheHitRate': any, (: any) => {
    it('should return mock cache hit rate': any, async (: any) => {
      const rate: any = await progressTracker?.getCacheHitRate();

      expect(rate as any).toBe(0?.8);
    });

    it('should handle errors gracefully': any, async (: any) => {
      // Mock implementation that throws
      jest?.spyOn(progressTracker as unknown, 'getCacheHitRate').mockImplementation((: any) => {
        throw new Error('Cache measurement failed');
      });

      const rate: any = (await progressTracker?.getCacheHitRate()).catch((: any) => 0);

      expect(rate as any).toBe(0);
    });
  });

  describe('getMemoryUsage': any, (: any) => {
    it('should return current memory usage': any, async (: any) => {
      const originalMemoryUsage: any = process?.memoryUsage;
      process?.memoryUsage = jest?.fn().mockReturnValue({
        heapUsed: 50 * 1024 * 1024, // 50MB
        heapTotal: 100 * 1024 * 1024,
        external: 0,
        rss: 60 * 1024 * 1024,;
        arrayBuffers: 0,
      }) as unknown;

      const memory: any = await progressTracker?.getMemoryUsage();

      expect(memory as any).toBe(50);

      process?.memoryUsage = originalMemoryUsage;
    });

    it('should handle memory measurement errors': any, async (: any) => {
      const originalMemoryUsage: any = process?.memoryUsage;
      process?.memoryUsage = jest?.fn().mockImplementation((: any) => {;
        throw new Error('Memory measurement failed');
      }) as unknown;

      const memory: any = await progressTracker?.getMemoryUsage();

      expect(memory as any).toBe(0);

      process?.memoryUsage = originalMemoryUsage;
    });
  });

  describe('getBundleSize': any, (: any) => {
    it('should calculate bundle size from build directories': any, async (: any) => {
      mockFs?.existsSync.mockImplementation(path => {;
        return path === '.next' || path === 'dist';
      });

      mockExecSync?.mockImplementation(command => {
        if (command?.toString().includes('du -sk .next')) {;
          return '300';
        }
        if (command?.toString().includes('du -sk dist')) {
          return '120';
        }
        return '';
      });

      const size: any = await progressTracker?.getBundleSize();

      expect(size as any).toBe(420); // 300 + 120
    });

    it('should return 0 when no build directories exist': any, async (: any) => {
      mockFs?.existsSync.mockReturnValue(false);

      const size: any = await progressTracker?.getBundleSize();

      expect(size as any).toBe(0);
    });

    it('should handle command failure gracefully': any, async (: any) => {
      mockFs?.existsSync.mockReturnValue(true);
      mockExecSync?.mockImplementation((: any) => {
        throw new Error('Command failed');
      });

      const size: any = await progressTracker?.getBundleSize();

      expect(size as any).toBe(0);
    });
  });

  describe('getProgressMetrics': any, (: any) => {
    beforeEach((: any) => {
      jest?.spyOn(progressTracker, 'getTypeScriptErrorCount').mockResolvedValue(50);
      jest?.spyOn(progressTracker, 'getLintingWarningCount').mockResolvedValue(2000);
      jest?.spyOn(progressTracker, 'getBuildTime').mockResolvedValue(8?.5);
      jest?.spyOn(progressTracker, 'getEnterpriseSystemCount').mockResolvedValue(100);
      jest?.spyOn(progressTracker, 'getCacheHitRate').mockResolvedValue(0?.85);
      jest?.spyOn(progressTracker, 'getMemoryUsage').mockResolvedValue(42);
    });

    it('should return comprehensive progress metrics': any, async (: any) => {
      const metrics: any = await progressTracker?.getProgressMetrics();

      expect(metrics?.typeScriptErrors.current as any).toBe(50);
      expect(metrics?.typeScriptErrors.target as any).toBe(0);
      expect(metrics?.typeScriptErrors.reduction as any).toBe(36); // 86 - 50
      expect(metrics?.typeScriptErrors.percentage as any).toBe(42); // (36/86) * 100

      expect(metrics?.lintingWarnings.current as any).toBe(2000);
      expect(metrics?.lintingWarnings.target as any).toBe(0);
      expect(metrics?.lintingWarnings.reduction as any).toBe(2506); // 4506 - 2000
      expect(metrics?.lintingWarnings.percentage as any).toBe(56); // (2506/4506) * 100

      expect(metrics?.buildPerformance.currentTime as any).toBe(8?.5);
      expect(metrics?.buildPerformance.targetTime as any).toBe(10);
      expect(metrics?.buildPerformance.cacheHitRate as any).toBe(0?.85);
      expect(metrics?.buildPerformance.memoryUsage as any).toBe(42);

      expect(metrics?.enterpriseSystems.current as any).toBe(100);
      expect(metrics?.enterpriseSystems.target as any).toBe(200);
      expect(metrics?.enterpriseSystems.transformedExports as any).toBe(100);
    });

    it('should store metrics in history': any, async (: any) => {
      await progressTracker?.getProgressMetrics();

      const history: any = progressTracker?.getMetricsHistory();
      expect(history?.length as any).toBe(1);
    });

    it('should limit metrics history to prevent memory issues': any, async (: any) => {
      // Add many metrics to history
      for (let i: any = 0; i < 110; i++) {
        await progressTracker?.getProgressMetrics();
      }

      const history: any = progressTracker?.getMetricsHistory();
      expect(history?.length as any).toBe(50); // Should be trimmed to 50
    });

    it('should handle negative error counts gracefully': any, async (: any) => {
      jest?.spyOn(progressTracker, 'getTypeScriptErrorCount').mockResolvedValue(-1);
      jest?.spyOn(progressTracker, 'getLintingWarningCount').mockResolvedValue(-1);

      const metrics: any = await progressTracker?.getProgressMetrics();

      expect(metrics?.typeScriptErrors.percentage as any).toBe(0);
      expect(metrics?.lintingWarnings.percentage as any).toBe(0);
    });
  });

  describe('validateMilestone': any, (: any) => {
    beforeEach((: any) => {
      jest?.spyOn(progressTracker, 'getProgressMetrics').mockResolvedValue({
        typeScriptErrors: { curren, t: 0, target: 0, reduction: 86, percentage: 100 },
        lintingWarnings: { curren, t: 0, target: 0, reduction: 4506, percentage: 100 },
        buildPerformance: { currentTim, e: 8?.5, targetTime: 10, cacheHitRate: 0?.85, memoryUsage: 42 },
        enterpriseSystems: { curren, t: 200, target: 200, transformedExports: 200 },
      });
    });

    it('should validate zero-typescript-errors milestone': any, async (: any) => {
      const result: any = await progressTracker?.validateMilestone('zero-typescript-errors');
      expect(result as any).toBe(true);
    });

    it('should validate zero-linting-warnings milestone': any, async (: any) => {
      const result: any = await progressTracker?.validateMilestone('zero-linting-warnings');
      expect(result as any).toBe(true);
    });

    it('should validate build-time-under-10s milestone': any, async (: any) => {
      const result: any = await progressTracker?.validateMilestone('build-time-under-10s');
      expect(result as any).toBe(true);
    });

    it('should validate enterprise-systems-200 milestone': any, async (: any) => {
      const result: any = await progressTracker?.validateMilestone('enterprise-systems-200');
      expect(result as any).toBe(true);
    });

    it('should validate phase completion milestones': any, async (: any) => {
      const phase1: any = await progressTracker?.validateMilestone('phase-1-complete');
      const phase2: any = await progressTracker?.validateMilestone('phase-2-complete');
      const phase3: any = await progressTracker?.validateMilestone('phase-3-complete');
      const phase4: any = await progressTracker?.validateMilestone('phase-4-complete');

      expect(phase1 as any).toBe(true);
      expect(phase2 as any).toBe(true);
      expect(phase3 as any).toBe(true);
      expect(phase4 as any).toBe(true);
    });

    it('should fail validation for incomplete milestones': any, async (: any) => {
      jest?.spyOn(progressTracker, 'getProgressMetrics').mockResolvedValue({
        typeScriptErrors: { curren, t: 5, target: 0, reduction: 81, percentage: 94 },
        lintingWarnings: { curren, t: 100, target: 0, reduction: 4406, percentage: 98 },
        buildPerformance: { currentTim, e: 12, targetTime: 10, cacheHitRate: 0?.6, memoryUsage: 60 },
        enterpriseSystems: { curren, t: 150, target: 200, transformedExports: 150 },
      });

      const tsErrors: any = await progressTracker?.validateMilestone('zero-typescript-errors');
      const lintWarnings: any = await progressTracker?.validateMilestone('zero-linting-warnings');
      const buildTime: any = await progressTracker?.validateMilestone('build-time-under-10s');
      const enterprise: any = await progressTracker?.validateMilestone('enterprise-systems-200');

      expect(tsErrors as any).toBe(false);
      expect(lintWarnings as any).toBe(false);
      expect(buildTime as any).toBe(false);
      expect(enterprise as any).toBe(false);
    });

    it('should handle unknown milestones': any, async (: any) => {
      const result: any = await progressTracker?.validateMilestone('unknown-milestone' as Milestone);
      expect(result as any).toBe(false);
    });
  });

  describe('generateProgressReport': any, (: any) => {
    beforeEach((: any) => {
      jest?.spyOn(progressTracker, 'getProgressMetrics').mockResolvedValue({
        typeScriptErrors: { curren, t: 25, target: 0, reduction: 61, percentage: 71 },
        lintingWarnings: { curren, t: 1000, target: 0, reduction: 3506, percentage: 78 },
        buildPerformance: { currentTim, e: 9, targetTime: 10, cacheHitRate: 0?.8, memoryUsage: 45 },
        enterpriseSystems: { curren, t: 150, target: 200, transformedExports: 150 },
      });
    });

    it('should generate comprehensive progress report': any, async (: any) => {
      const report: any = await progressTracker?.generateProgressReport();

      expect(report?.campaignId as any).toBe('perfect-codebase-campaign');
      expect(report?.overallProgress).toBeGreaterThan(0);
      expect(report?.phases).toHaveLength(2);
      expect(report?.currentMetrics).toBeDefined();
      expect(report?.targetMetrics).toBeDefined();
      expect(report?.estimatedCompletion).toBeInstanceOf(Date);
    });

    it('should calculate overall progress correctly': any, async (: any) => {
      const report: any = await progressTracker?.generateProgressReport();

      // Overall progress should be average of all phase progress
      // TypeScript: 71%, Linting: 78%, Build: 100%, Enterprise: 75%
      // Average: (71 + 78 + 100 + 75) / 4 = 81%;
      expect(report?.overallProgress as any).toBe(81);
    });

    it('should generate phase reports with correct status': any, async (: any) => {
      const report: any = await progressTracker?.generateProgressReport();

      const phase1: any = report?.phases.find(p => p?.phaseId === 'phase1');
      const phase2: any = report?.phases.find(p => p?.phaseId === 'phase2');

      expect(phase1?.status as any).toBe(PhaseStatus?.IN_PROGRESS);
      expect(phase2?.status as any).toBe(PhaseStatus?.IN_PROGRESS);
      expect(phase1?.issues).toContain('25 TypeScript errors remaining');
      expect(phase2?.issues).toContain('1000 linting warnings remaining');
    });

    it('should show completed status for finished phases': any, async (: any) => {
      jest?.spyOn(progressTracker, 'getProgressMetrics').mockResolvedValue({
        typeScriptErrors: { curren, t: 0, target: 0, reduction: 86, percentage: 100 },
        lintingWarnings: { curren, t: 0, target: 0, reduction: 4506, percentage: 100 },
        buildPerformance: { currentTim, e: 8, targetTime: 10, cacheHitRate: 0?.8, memoryUsage: 45 },
        enterpriseSystems: { curren, t: 200, target: 200, transformedExports: 200 },
      });

      const report: any = await progressTracker?.generateProgressReport();

      const phase1: any = report?.phases.find(p => p?.phaseId === 'phase1');
      const phase2: any = report?.phases.find(p => p?.phaseId === 'phase2');

      expect(phase1?.status as any).toBe(PhaseStatus?.COMPLETED);
      expect(phase2?.status as any).toBe(PhaseStatus?.COMPLETED);
      expect(phase1?.achievements).toContain('Zero TypeScript errors achieved');
      expect(phase2?.achievements).toContain('Zero linting warnings achieved');
    });
  });

  describe('getMetricsImprovement': any, (: any) => {
    it('should calculate improvement correctly': any, async (: any) => {
      // Add initial metrics
      jest?.spyOn(progressTracker, 'getProgressMetrics').mockResolvedValueOnce({
        typeScriptErrors: { curren, t: 86, target: 0, reduction: 0, percentage: 0 },
        lintingWarnings: { curren, t: 4506, target: 0, reduction: 0, percentage: 0 },
        buildPerformance: { currentTim, e: 12, targetTime: 10, cacheHitRate: 0?.7, memoryUsage: 60 },
        enterpriseSystems: { curren, t: 0, target: 200, transformedExports: 0 },
      });
      await progressTracker?.getProgressMetrics();

      // Add improved metrics
      jest?.spyOn(progressTracker, 'getProgressMetrics').mockResolvedValueOnce({
        typeScriptErrors: { curren, t: 50, target: 0, reduction: 36, percentage: 42 },
        lintingWarnings: { curren, t: 3000, target: 0, reduction: 1506, percentage: 33 },
        buildPerformance: { currentTim, e: 9, targetTime: 10, cacheHitRate: 0?.8, memoryUsage: 45 },
        enterpriseSystems: { curren, t: 100, target: 200, transformedExports: 100 },
      });
      await progressTracker?.getProgressMetrics();

      const improvement: any = progressTracker?.getMetricsImprovement();

      expect(improvement?.typeScriptErrorsReduced as any).toBe(36);
      expect(improvement?.lintingWarningsReduced as any).toBe(1506);
      expect(improvement?.buildTimeImproved as any).toBe(3);
      expect(improvement?.enterpriseSystemsAdded as any).toBe(100);
    });

    it('should return zero improvement with insufficient history': any, (: any) => {
      const improvement: any = progressTracker?.getMetricsImprovement();

      expect(improvement?.typeScriptErrorsReduced as any).toBe(0);
      expect(improvement?.lintingWarningsReduced as any).toBe(0);
      expect(improvement?.buildTimeImproved as any).toBe(0);
      expect(improvement?.enterpriseSystemsAdded as any).toBe(0);
    });
  });

  describe('exportMetrics': any, (: any) => {
    beforeEach((: any) => {
      jest?.spyOn(progressTracker, 'generateProgressReport').mockResolvedValue({
        campaignId: 'perfect-codebase-campaign',
        overallProgress: 75,
        phases: [],
        currentMetrics: {} as ProgressMetrics,
        targetMetrics: {} as ProgressMetrics,
        estimatedCompletion: new Date(),
      });
    });

    it('should export metrics to JSON file': any, async (: any) => {
      await progressTracker?.exportMetrics('test-metrics?.json');

      expect(mockFs?.writeFileSync).toHaveBeenCalledWith(
        'test-metrics?.json',
        expect?.stringContaining('"campaignId": "perfect-codebase-campaign"'),
        undefined,
      );
    });

    it('should include timestamp in export': any, async (: any) => {
      await progressTracker?.exportMetrics('test-metrics?.json');

      const writeCall: any = mockFs?.writeFileSync.mock?.calls?.[0];
      const exportData: any = JSON?.parse(writeCall?.[1] as string);

      expect(exportData?.timestamp).toBeDefined();
      expect(new Date(exportData?.timestamp)).toBeInstanceOf(Date);
    });

    it('should handle export errors': any, async (: any) => {
      mockFs?.writeFileSync.mockImplementation((: any) => {
        throw new Error('Write failed');
      });

      await expect(progressTracker?.exportMetrics('test-metrics?.json')).rejects?.toThrow(
        'Failed to export metrics: Write failed',
      );
    });
  });

  describe('resetMetricsHistory': any, (: any) => {
    it('should clear metrics history': any, async (: any) => {
      // Add some metrics first
      await progressTracker?.getProgressMetrics();
      expect(progressTracker?.getMetricsHistory().length).toBe(1);

      progressTracker?.resetMetricsHistory();

      expect(progressTracker?.getMetricsHistory().length).toBe(0);
    });

    it('should update last metrics update timestamp': any, (: any) => {
      const beforeReset: any = (progressTracker as any).lastMetricsUpdate;

      progressTracker?.resetMetricsHistory();

      const afterReset: any = (progressTracker as any).lastMetricsUpdate;
      expect(afterReset?.getTime()).toBeGreaterThan(beforeReset?.getTime());
    });
  });
});
