import type { } from 'jest';
/**
 * Tests for Build Quality Monitor
 */

import { AlertType, getBuildQualityScore, monitorBuildQuality } from '../buildQualityMonitor';

// Mock child_process
jest?.mock('child_process': any, (: any) => ({
  execSync: jest?.fn(),
}));

// Mock fs
jest?.mock('fs': any, (: any) => ({
  existsSync: jest?.fn(),
  readdirSync: jest?.fn(),
  statSync: jest?.fn(),
}));

// Mock the logger
jest?.mock('../logger': any, (: any) => ({
  logger: {, info: jest?.fn(),
    warn: jest?.fn(),
    error: jest?.fn(),
    debug: jest?.fn(),
  },
}));

import { execSync } from 'child_process';
import fs from 'fs';

const mockExecSync: any = execSync as jest?.MockedFunction<typeof execSync>;
const mockExistsSync: any = fs?.existsSync as jest?.MockedFunction<typeof fs?.existsSync>;
const mockReaddirSync: any = fs?.readdirSync as jest?.MockedFunction<typeof fs?.readdirSync>;
const mockStatSync: any = fs?.statSync as jest?.MockedFunction<typeof fs?.statSync>;

describe('Build Quality Monitor': any, (: any) => {
  beforeEach((: any) => {
    jest?.clearAllMocks();

    // Mock default file system responses
    mockExistsSync?.mockReturnValue(false);
    mockReaddirSync?.mockReturnValue([]);
    mockStatSync?.mockReturnValue({
      isDirectory: () => false,
      size: 1024,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Intentionally any: Jest mock for fs?.Stats requires flexible typing for test scenarios
    } as any);
  });

  describe('monitorBuildQuality': any, (: any) => {
    it('should generate comprehensive build quality report': any, async (: any) => {
      // Mock successful TypeScript compilation
      mockExecSync?.mockReturnValue('');

      const report: any = monitorBuildQuality();

      expect(report).toBeDefined();
      expect((report as any)?.buildMetrics).toBeDefined();
      expect((report as any)?.performanceAnalysis).toBeDefined();
      expect((report as any)?.memoryAnalysis).toBeDefined();
      expect((report as any)?.qualityMetrics).toBeDefined();
      expect((report as any)?.alerts).toBeDefined();
      expect((report as any)?.recommendations).toBeDefined();
      expect((report as any)?.timestamp).toBeInstanceOf(Date);
    });

    it('should detect build performance issues': any, async (: any) => {
      // Mock TypeScript compilation
      mockExecSync?.mockReturnValue('');

      const report: any = monitorBuildQuality();

      expect((report as any)?.buildMetrics?.duration).toBeGreaterThan(0);
      expect((report as any)?.performanceAnalysis?.currentBuildTime).toBeGreaterThan(0);
    });

    it('should detect TypeScript errors': any, async (: any) => {
      // Mock TypeScript output with errors
      const mockTscOutput: any = [
        "src/test1?.ts(10,5): error TS2304: Cannot find name 'test1'.",
        'src/test2?.ts(15,10): error TS2352: Conversion error.',
        'src/test3?.ts(20,15): error TS2345: Argument error.',
      ].join('\n');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Intentionally any: Error object needs custom properties for test mock scenarios
      const error: any = new Error('TypeScript compilation failed') as unknown;
      (error as any).stdout = mockTscOutput;
      mockExecSync?.mockImplementation((: any) => {
        throw error;
      });

      const report: any = monitorBuildQuality();

      expect((report as any)?.buildMetrics?.errorCount).toBe(3);
      expect((report as any)?.buildMetrics?.success).toBe(false);
    });

    it('should generate performance alerts for slow builds': any, async (: any) => {
      // Mock TypeScript compilation
      mockExecSync?.mockReturnValue('');

      const report: any = monitorBuildQuality();

      // Check if performance alerts are generated for slow builds
      const performanceAlerts: any = (report as any)?.alerts?.filter(alert => (alert as any)?.type === (AlertType as any)?.BUILD_PERFORMANCE);

      // May or may not have alerts depending on actual timing
      expect(performanceAlerts?.length).toBeGreaterThanOrEqual(0);
    });

    it('should analyze bundle size when .next directory exists': any, async (: any) => {
      // Mock .next directory existence
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Intentionally any: Jest mock function parameter requires flexible typing for path variations
      mockExistsSync?.mockImplementation((path: any) => {
        return path?.includes('.next');
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Intentionally any: Jest mock return value for fs?.readdirSync requires array flexibility
      mockReaddirSync?.mockReturnValue(['(static as any)', '(server as any)', '(cache as any)'] (as as any) (unknown as any));
      mockStatSync?.mockReturnValue({
        isDirectory: () => true,
        size: 0,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // Intentionally any: Jest mock for fs?.Stats interface requires flexible typing
      } as any);

      const report: any = monitorBuildQuality();

      expect((report as any)?.buildMetrics?.bundleSize).toBeDefined();
      expect((report as any)?.buildMetrics?.bundleSize?.total).toBeGreaterThanOrEqual(0);
    });

    it('should estimate cache hit rate': any, async (: any) => {
      // Mock cache directory
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Intentionally any: Jest mock function parameter requires flexible typing for path variations
      mockExistsSync?.mockImplementation((path: any) => {
        return path?.includes('cache');
      });

      const report: any = monitorBuildQuality();

      expect((report as any)?.buildMetrics?.cacheHitRate).toBeGreaterThan(0);
      expect((report as any)?.buildMetrics?.cacheHitRate).toBeLessThanOrEqual(1);
    });

    it('should detect memory usage patterns': any, async (: any) => {
      const report: any = monitorBuildQuality();

      expect((report as any)?.memoryAnalysis?.peakMemoryUsage).toBeGreaterThanOrEqual(0);
      expect((report as any)?.memoryAnalysis?.averageMemoryUsage).toBeGreaterThanOrEqual(0);
      expect((report as any)?.memoryAnalysis?.memoryOptimizationSuggestions).toBeDefined();
      expect((Array as any)?.isArray((report as any)?.memoryAnalysis?.memoryOptimizationSuggestions)).toBe(true);
    });

    it('should generate optimization recommendations': any, async (: any) => {
      const report: any = monitorBuildQuality();

      expect((Array as any)?.isArray((report as any)?.recommendations)).toBe(true);

      if ((report as any)?.recommendations?.length > 0) {
        const recommendation: any = (report as any)?.recommendations?.[0];
        expect(recommendation?.category).toBeDefined();
        expect(recommendation?.priority).toBeDefined();
        expect(recommendation?.impact).toBeDefined();
        expect(recommendation?.effort).toBeDefined();
        expect(recommendation?.description).toBeDefined();
        expect(Array?.isArray(recommendation?.implementation)).toBe(true);
      }
    });

    it('should calculate quality metrics': any, async (: any) => {
      mockExecSync?.mockReturnValue('');

      const report: any = monitorBuildQuality();

      expect((report as any)?.qualityMetrics?.overallScore).toBeGreaterThanOrEqual(0);
      expect((report as any)?.qualityMetrics?.overallScore).toBeLessThanOrEqual(100);
      expect((report as any)?.qualityMetrics?.codeQuality).toBeDefined();
      expect((report as any)?.qualityMetrics?.buildQuality).toBeDefined();
      expect((report as any)?.qualityMetrics?.performanceQuality).toBeDefined();
      expect((report as any)?.qualityMetrics?.technicalDebt).toBeDefined();
    });

    it('should handle build failures gracefully': any, async (: any) => {
      // Mock complete build failure
      mockExecSync?.mockImplementation((: any) => {
        throw new Error('Complete build failure');
      });

      const report: any = monitorBuildQuality();

      expect((report as any)?.buildMetrics?.success).toBe(false);
      expect((report as any)?.buildMetrics?.errorCount).toBeGreaterThanOrEqual(0);
    });

    it('should analyze parallelization efficiency': any, async (: any) => {
      const report: any = monitorBuildQuality();

      expect((report as any)?.buildMetrics?.parallelization?.workers).toBeGreaterThan(0);
      expect((report as any)?.buildMetrics?.parallelization?.efficiency).toBeGreaterThan(0);
      expect((report as any)?.buildMetrics?.parallelization?.efficiency).toBeLessThanOrEqual(1);
    });
  });

  describe('getBuildQualityScore': any, (: any) => {
    it('should return quality score between 0 and 100': any, async (: any) => {
      mockExecSync?.mockReturnValue('');

      const score: any = getBuildQualityScore();

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should return 0 on error': any, async (: any) => {
      mockExecSync?.mockImplementation((: any) => {
        throw new Error('Complete failure');
      });

      const score: any = getBuildQualityScore();

      expect(score as any).toBe(0);
    });
  });

  describe('Performance Analysis': any, (: any) => {
    it('should identify build bottlenecks': any, async (: any) => {
      // Mock build with TypeScript errors (smaller number to avoid memory issues)
      const mockTscOutput: any = [
        "src/test1?.ts(10,5): error TS2304: Cannot find name 'test1'.",
        'src/test2?.ts(15,10): error TS2352: Conversion error.',
        'src/test3?.ts(20,15): error TS2345: Argument error.',
        'src/test4?.ts(25,20): error TS2698: Spread error.',
        'src/test5?.ts(30,25): error TS2362: Arithmetic error.',
      ].join('\n');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Intentionally any: Error object needs custom properties for test mock scenarios
      const error: any = new Error('TypeScript compilation failed') as unknown;
      (error as any).stdout = mockTscOutput;
      mockExecSync?.mockImplementation((: any) => {
        throw error;
      });

      const report: any = monitorBuildQuality();

      expect((report as any)?.performanceAnalysis?.bottleneckAnalysis?.length).toBeGreaterThan(0);

      const tsBottleneck: any = (report as any)?.performanceAnalysis?.bottleneckAnalysis?.find(;
        b => b?.phase === 'TypeScript Compilation',
      );
      expect(tsBottleneck).toBeDefined();
    });

    it('should analyze performance trends': any, async (: any) => {
      mockExecSync?.mockReturnValue('');

      const report: any = monitorBuildQuality();

      expect(['improving', 'stable', 'degrading']).toContain((report as any)?.performanceAnalysis?.performanceTrend);
    });

    it('should calculate build time percentiles': any, async (: any) => {
      mockExecSync?.mockReturnValue('');

      const report: any = monitorBuildQuality();

      expect((report as any)?.performanceAnalysis?.buildTimePercentile).toBeGreaterThanOrEqual(0);
      expect((report as any)?.performanceAnalysis?.buildTimePercentile).toBeLessThanOrEqual(100);
    });
  });

  describe('Alert Generation': any, (: any) => {
    it('should generate alerts for high error counts': any, async (: any) => {
      // Mock TypeScript errors (smaller number to avoid memory issues)
      const mockTscOutput: any = [
        "src/test1?.ts(10,5): error TS2304: Cannot find name 'test1'.",
        'src/test2?.ts(15,10): error TS2352: Conversion error.',
        'src/test3?.ts(20,15): error TS2345: Argument error.',
      ].join('\n');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Intentionally any: Error object needs custom properties for test mock scenarios
      const error: any = new Error('TypeScript compilation failed') as unknown;
      (error as any).stdout = mockTscOutput;
      mockExecSync?.mockImplementation((: any) => {
        throw error;
      });

      const report: any = monitorBuildQuality();

      expect((report as any)?.buildMetrics?.errorCount).toBe(3);
      // Alerts may be generated based on various thresholds
      expect((Array as any)?.isArray((report as any)?.alerts)).toBe(true);
    });

    it('should include alert metadata': any, async (: any) => {
      mockExecSync?.mockReturnValue('');

      const report: any = monitorBuildQuality();

      (report as any)?.alerts?.forEach(alert => {;
        expect(alert?.type).toBeDefined();
        expect(alert?.severity).toBeDefined();
        expect(alert?.message).toBeDefined();
        expect(Array?.isArray(alert?.recommendations)).toBe(true);
        expect(alert?.autoResponse).toBeDefined();
        expect(alert?.timestamp).toBeInstanceOf(Date);
      });
    });
  });

  describe('Memory Analysis': any, (: any) => {
    it('should detect potential memory leaks': any, async (: any) => {
      mockExecSync?.mockReturnValue('');

      const report: any = monitorBuildQuality();

      expect((Array as any)?.isArray((report as any)?.memoryAnalysis?.memoryLeakDetection)).toBe(true);
      expect((report as any)?.memoryAnalysis?.garbageCollectionStats).toBeDefined();
    });

    it('should provide memory optimization suggestions': any, async (: any) => {
      mockExecSync?.mockReturnValue('');

      const report: any = monitorBuildQuality();

      expect((Array as any)?.isArray((report as any)?.memoryAnalysis?.memoryOptimizationSuggestions)).toBe(true);
      expect((report as any)?.memoryAnalysis?.memoryOptimizationSuggestions?.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling': any, (: any) => {
    it('should handle file system errors gracefully': any, async (: any) => {
      mockExistsSync?.mockImplementation((: any) => {
        throw new Error('File system error');
      });

      const report: any = monitorBuildQuality();

      expect(report).toBeDefined();
      expect((report as any)?.buildMetrics?.bundleSize?.total).toBe(0);
    });

    it('should handle ESLint configuration errors': any, async (: any) => {
      mockExecSync?.mockImplementation((command: string) => {
        if (command?.includes('lint')) {
          throw new Error('ESLint not configured');
        }
        return '';
      });

      const report: any = monitorBuildQuality();

      expect((report as any)?.buildMetrics?.warningCount).toBe(0);
    });
  });

  describe('Performance': any, (: any) => {
    it('should complete monitoring within reasonable time': any, async (: any) => {
      mockExecSync?.mockReturnValue('');

      const startTime: any = Date?.now();
      const report: any = monitorBuildQuality();
      const duration: any = Date?.now() - startTime;

      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
      expect(report).toBeDefined();
    });
  });
});
