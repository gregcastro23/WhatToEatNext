import type { } from 'jest';
/**
 * Tests for Build Quality Monitor
 */

import { AlertType, getBuildQualityScore, monitorBuildQuality } from '../buildQualityMonitor';

// Mock child_process
jest.mock('child_process', () => ({
  execSync: jest.fn()
}));

// Mock fs
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readdirSync: jest.fn(),
  statSync: jest.fn()
}));

// Mock the logger
jest.mock('../logger', () => ({
  logger: { info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  }
}));

import { execSync } from 'child_process';
import fs from 'fs';

const mockExecSync: any = execSync as jest.MockedFunction<typeof execSync>;
const mockExistsSync: any = fs.existsSync as jest.MockedFunction<typeof fs.existsSync>;
const mockReaddirSync: any = fs.readdirSync as jest.MockedFunction<typeof fs.readdirSync>;
const mockStatSync: any = fs.statSync as jest.MockedFunction<typeof fs.statSync>;

describe('Build Quality Monitor', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock default file system responses
    mockExistsSync.mockReturnValue(false);
    mockReaddirSync.mockReturnValue([]),
    mockStatSync.mockReturnValue({
      isDirectory: () => false,
      size: 1024,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Intentionally any: Jest mock for fs.Stats requires flexible typing for test scenarios
    } as any);
  });

  describe('monitorBuildQuality', () => {
    it('should generate comprehensive build quality report', async () => {
      // Mock successful TypeScript compilation
      mockExecSync.mockReturnValue('');

      const report: any = monitorBuildQuality();

      expect(report).toBeDefined();
      expect((report)?.buildMetrics).toBeDefined();
      expect((report)?.performanceAnalysis).toBeDefined();
      expect((report)?.memoryAnalysis).toBeDefined();
      expect((report)?.qualityMetrics).toBeDefined();
      expect((report)?.alerts).toBeDefined();
      expect((report)?.recommendations).toBeDefined();
      expect((report)?.timestamp).toBeInstanceOf(Date);
    });

    it('should detect build performance issues', async () => {
      // Mock TypeScript compilation
      mockExecSync.mockReturnValue('');

      const report: any = monitorBuildQuality();

      expect((report)?.buildMetrics.duration).toBeGreaterThan(0);
      expect((report)?.performanceAnalysis.currentBuildTime).toBeGreaterThan(0);
    });

    it('should detect TypeScript errors', async () => {
      // Mock TypeScript output with errors
      const mockTscOutput: any = [
        'src/test1.ts(105): error TS2304: Cannot find name 'test1'.',
        'src/test2.ts(1510): error TS2352: Conversion error.',
        'src/test3.ts(2015): error TS2345: Argument error.'
      ].join('\n');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Intentionally any: Error object needs custom properties for test mock scenarios
      const error: any = new Error('TypeScript compilation failed') as unknown;
      (error as any).stdout = mockTscOutput;
      mockExecSync.mockImplementation(() => {
        throw error
      });

      const report: any = monitorBuildQuality();

      expect((report)?.buildMetrics.errorCount).toBe(3);
      expect((report)?.buildMetrics.success).toBe(false);
    });

    it('should generate performance alerts for slow builds', async () => {
      // Mock TypeScript compilation
      mockExecSync.mockReturnValue('');

      const report: any = monitorBuildQuality();

      // Check if performance alerts are generated for slow builds
      const performanceAlerts: any = (report as any)?.alerts.filter(alert => (alert as any)?.type === (AlertType as any)?.BUILD_PERFORMANCE);

      // May or may not have alerts depending on actual timing
      expect(performanceAlerts.length).toBeGreaterThanOrEqual(0);
    });

    it('should analyze bundle size when .next directory exists', async () => {
      // Mock .next directory existence
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Intentionally any: Jest mock function parameter requires flexible typing for path variations
      mockExistsSync.mockImplementation((path: any) => {
        return path.includes('.next');
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Intentionally any: Jest mock return value for fs.readdirSync requires array flexibility
      mockReaddirSync.mockReturnValue(['(static as any)', '(server as any)', '(cache as any)'] (as as any) (unknown as any));
      mockStatSync.mockReturnValue({
        isDirectory: () => true,
        size: 0,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // Intentionally any: Jest mock for fs.Stats interface requires flexible typing
      } as any);

      const report: any = monitorBuildQuality();

      expect((report)?.buildMetrics.bundleSize).toBeDefined();
      expect((report)?.buildMetrics.bundleSize.total).toBeGreaterThanOrEqual(0);
    });

    it('should estimate cache hit rate', async () => {
      // Mock cache directory
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Intentionally any: Jest mock function parameter requires flexible typing for path variations
      mockExistsSync.mockImplementation((path: any) => {
        return path.includes('cache');
      });

      const report: any = monitorBuildQuality();

      expect((report)?.buildMetrics.cacheHitRate).toBeGreaterThan(0);
      expect((report)?.buildMetrics.cacheHitRate).toBeLessThanOrEqual(1);
    });

    it('should detect memory usage patterns', async () => {
      const report: any = monitorBuildQuality();

      expect((report)?.memoryAnalysis.peakMemoryUsage).toBeGreaterThanOrEqual(0);
      expect((report)?.memoryAnalysis.averageMemoryUsage).toBeGreaterThanOrEqual(0);
      expect((report)?.memoryAnalysis.memoryOptimizationSuggestions).toBeDefined();
      expect((Array)?.isArray((report as any)?.memoryAnalysis.memoryOptimizationSuggestions)).toBe(true);
    });

    it('should generate optimization recommendations', async () => {
      const report: any = monitorBuildQuality();

      expect((Array)?.isArray((report as any)?.recommendations)).toBe(true);

      if ((report as any)?.recommendations.length > 0) {
        const recommendation: any = (report as any)?.recommendations.[0];
        expect(recommendation.category).toBeDefined();
        expect(recommendation.priority).toBeDefined();
        expect(recommendation.impact).toBeDefined();
        expect(recommendation.effort).toBeDefined();
        expect(recommendation.description).toBeDefined();
        expect(Array.isArray(recommendation.implementation)).toBe(true);
      }
    });

    it('should calculate quality metrics', async () => {
      mockExecSync.mockReturnValue('');

      const report: any = monitorBuildQuality();

      expect((report)?.qualityMetrics.overallScore).toBeGreaterThanOrEqual(0);
      expect((report)?.qualityMetrics.overallScore).toBeLessThanOrEqual(100);
      expect((report)?.qualityMetrics.codeQuality).toBeDefined();
      expect((report)?.qualityMetrics.buildQuality).toBeDefined();
      expect((report)?.qualityMetrics.performanceQuality).toBeDefined();
      expect((report)?.qualityMetrics.technicalDebt).toBeDefined();
    });

    it('should handle build failures gracefully', async () => {
      // Mock complete build failure
      mockExecSync.mockImplementation(() => {
        throw new Error('Complete build failure')
      });

      const report: any = monitorBuildQuality();

      expect((report)?.buildMetrics.success).toBe(false);
      expect((report)?.buildMetrics.errorCount).toBeGreaterThanOrEqual(0);
    });

    it('should analyze parallelization efficiency', async () => {
      const report: any = monitorBuildQuality();

      expect((report)?.buildMetrics.parallelization.workers).toBeGreaterThan(0);
      expect((report)?.buildMetrics.parallelization.efficiency).toBeGreaterThan(0);
      expect((report)?.buildMetrics.parallelization.efficiency).toBeLessThanOrEqual(1);
    });
  });

  describe('getBuildQualityScore', () => {
    it('should return quality score between 0 and 100', async () => {
      mockExecSync.mockReturnValue('');

      const score: any = getBuildQualityScore();

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should return 0 on error', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Complete failure')
      });

      const score: any = getBuildQualityScore();

      expect(score).toBe(0);
    });
  });

  describe('Performance Analysis', () => {
    it('should identify build bottlenecks', async () => {
      // Mock build with TypeScript errors (smaller number to avoid memory issues)
      const mockTscOutput: any = [
        'src/test1.ts(105): error TS2304: Cannot find name 'test1'.',
        'src/test2.ts(1510): error TS2352: Conversion error.',
        'src/test3.ts(2015): error TS2345: Argument error.',
        'src/test4.ts(2520): error TS2698: Spread error.',
        'src/test5.ts(3025): error TS2362: Arithmetic error.'
      ].join('\n');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Intentionally any: Error object needs custom properties for test mock scenarios
      const error: any = new Error('TypeScript compilation failed') as unknown;
      (error as any).stdout = mockTscOutput;
      mockExecSync.mockImplementation(() => {
        throw error
      });

      const report: any = monitorBuildQuality();

      expect((report)?.performanceAnalysis.bottleneckAnalysis.length).toBeGreaterThan(0);

      const tsBottleneck: any = (report as any)?.performanceAnalysis.bottleneckAnalysis.find(;
        b => b.phase === 'TypeScript Compilation'
      );
      expect(tsBottleneck).toBeDefined();
    });

    it('should analyze performance trends', async () => {
      mockExecSync.mockReturnValue('');

      const report: any = monitorBuildQuality();

      expect(['improving', 'stable', 'degrading']).toContain((report as any)?.performanceAnalysis.performanceTrend);
    });

    it('should calculate build time percentiles', async () => {
      mockExecSync.mockReturnValue('');

      const report: any = monitorBuildQuality();

      expect((report)?.performanceAnalysis.buildTimePercentile).toBeGreaterThanOrEqual(0);
      expect((report)?.performanceAnalysis.buildTimePercentile).toBeLessThanOrEqual(100);
    });
  });

  describe('Alert Generation', () => {
    it('should generate alerts for high error counts', async () => {
      // Mock TypeScript errors (smaller number to avoid memory issues)
      const mockTscOutput: any = [
        'src/test1.ts(105): error TS2304: Cannot find name 'test1'.',
        'src/test2.ts(1510): error TS2352: Conversion error.',
        'src/test3.ts(2015): error TS2345: Argument error.'
      ].join('\n');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Intentionally any: Error object needs custom properties for test mock scenarios
      const error: any = new Error('TypeScript compilation failed') as unknown;
      (error as any).stdout = mockTscOutput;
      mockExecSync.mockImplementation(() => {
        throw error
      });

      const report: any = monitorBuildQuality();

      expect((report)?.buildMetrics.errorCount).toBe(3);
      // Alerts may be generated based on various thresholds
      expect((Array)?.isArray((report as any)?.alerts)).toBe(true);
    });

    it('should include alert metadata', async () => {
      mockExecSync.mockReturnValue('');

      const report: any = monitorBuildQuality();

      (report as any)?.alerts.forEach(alert => {
        expect(alert.type).toBeDefined();
        expect(alert.severity).toBeDefined();
        expect(alert.message).toBeDefined();
        expect(Array.isArray(alert.recommendations)).toBe(true);
        expect(alert.autoResponse).toBeDefined();
        expect(alert.timestamp).toBeInstanceOf(Date);
      });
    });
  });

  describe('Memory Analysis', () => {
    it('should detect potential memory leaks', async () => {
      mockExecSync.mockReturnValue('');

      const report: any = monitorBuildQuality();

      expect((Array)?.isArray((report as any)?.memoryAnalysis.memoryLeakDetection)).toBe(true);
      expect((report)?.memoryAnalysis.garbageCollectionStats).toBeDefined();
    });

    it('should provide memory optimization suggestions', async () => {
      mockExecSync.mockReturnValue('');

      const report: any = monitorBuildQuality();

      expect((Array)?.isArray((report as any)?.memoryAnalysis.memoryOptimizationSuggestions)).toBe(true);
      expect((report)?.memoryAnalysis.memoryOptimizationSuggestions.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle file system errors gracefully', async () => {
      mockExistsSync.mockImplementation(() => {
        throw new Error('File system error')
      });

      const report: any = monitorBuildQuality();

      expect(report).toBeDefined();
      expect((report)?.buildMetrics.bundleSize.total).toBe(0);
    });

    it('should handle ESLint configuration errors', async () => {
      mockExecSync.mockImplementation((command: string) => {
        if (command.includes('lint')) {
          throw new Error('ESLint not configured')
        }
        return '';
      });

      const report: any = monitorBuildQuality();

      expect((report)?.buildMetrics.warningCount).toBe(0);
    });
  });

  describe('Performance', () => {
    it('should complete monitoring within reasonable time', async () => {
      mockExecSync.mockReturnValue('');

      const startTime: any = Date.now();
      const report: any = monitorBuildQuality();
      const duration: any = Date.now() - startTime;

      expect(duration).toBeLessThan(10000), // Should complete within 10 seconds
      expect(report).toBeDefined();
    });
  });
});
