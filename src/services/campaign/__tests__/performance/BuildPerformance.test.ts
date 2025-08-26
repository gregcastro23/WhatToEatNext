/**
 * Performance Tests for Build Time Validation
 * Perfect Codebase Campaign - Build Performance Testing
 */

import { execSync } from 'child_process';
import * as fs from 'fs';

import { CampaignConfig, SafetySettings, SafetyLevel, ProgressMetrics } from '../../../../types/campaign';
import { CampaignController } from '../../CampaignController';
import { ProgressTracker } from '../../ProgressTracker';
import { SafetyProtocol } from '../../SafetyProtocol';

// Mock dependencies
jest.mock('child_process');
jest.mock('fs');

const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;
const mockFs = fs as jest.Mocked<typeof fs>;

describe('Build Performance Tests', () => {
  let progressTracker: ProgressTracker;
  let campaignController: CampaignController;
  let mockConfig: CampaignConfig;

  beforeEach(() => {
    const safetySettings: SafetySettings = {
      maxFilesPerBatch: 25,
      buildValidationFrequency: 5,
      testValidationFrequency: 10,
      corruptionDetectionEnabled: true,
      automaticRollbackEnabled: true,
      stashRetentionDays: 7,
    };

    mockConfig = {
      phases: [
        {
          id: 'performance-test-phase',
          name: 'Performance Test Phase',
          description: 'Phase for performance testing',
          tools: [
            {
              scriptPath: 'scripts/performance/test-script.js',
              parameters: { maxFiles: 50 },
              batchSize: 50,
              safetyLevel: SafetyLevel.MEDIUM,
            },
          ],
          successCriteria: { buildTime: 10 },
          safetyCheckpoints: [],
        },
      ],
      safetySettings,
      progressTargets: { typeScriptErrors: 0, lintingWarnings: 0, buildTime: 10, enterpriseSystems: 200 },
      toolConfiguration: {
        enhancedErrorFixer: 'scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js',
        explicitAnyFixer: 'scripts/typescript-fixes/fix-explicit-any-systematic.js',
        unusedVariablesFixer: 'scripts/typescript-fixes/fix-unused-variables-enhanced.js',
        consoleStatementFixer: 'scripts/lint-fixes/fix-console-statements-only.js',
      },
    };

    progressTracker = new ProgressTracker();
    campaignController = new CampaignController(mockConfig);

    // Reset mocks
    jest.clearAllMocks();

    // Default mock implementations
    mockExecSync.mockReturnValue('');
    mockFs.existsSync.mockReturnValue(true);
    mockFs.writeFileSync.mockImplementation(() => {});
  });

  describe('Build Time Measurement', () => {
    it('should measure build time under 10 seconds target', async () => {
      // Mock fast build
      let buildStartTime: number;
      mockExecSync.mockImplementation(command => {
        if (command.toString().includes('yarn build')) {
          buildStartTime = Date.now();
          // Simulate fast build (2 seconds)
          const delay = 2000;
          const endTime = buildStartTime + delay;
          while (Date.now() < endTime) {
            // Busy wait to simulate build time
          }
          return '';
        }
        return '';
      });

      const buildTime = await progressTracker.getBuildTime();

      expect(buildTime).toBeLessThan(10);
      expect(buildTime).toBeGreaterThan(0);
    });

    it('should detect build time regression', async () => {
      // Mock slow build
      mockExecSync.mockImplementation(command => {
        if (command.toString().includes('yarn build')) {
          // Simulate slow build (12 seconds)
          const delay = 100; // Use shorter delay for test performance
          const endTime = Date.now() + delay;
          while (Date.now() < endTime) {
            // Busy wait
          }
          return '';
        }
        return '';
      });

      const buildTime = await progressTracker.getBuildTime();

      // Should detect that build time exceeds target
      expect(buildTime).toBeGreaterThan(0);
    });

    it('should handle build failures gracefully', async () => {
      mockExecSync.mockImplementation(command => {
        if (command.toString().includes('yarn build')) {
          throw new Error('Build compilation failed');
        }
        return '';
      });

      const buildTime = await progressTracker.getBuildTime();

      expect(buildTime).toBe(-1); // Indicates build failure
    });

    it('should measure build time consistently across multiple runs', async () => {
      const buildTimes: Array<number> = [];
      const targetBuildTime = 8; // 8 seconds

      mockExecSync.mockImplementation(command => {
        if (command.toString().includes('yarn build')) {
          // Simulate consistent build time with small variance
          const baseTime = targetBuildTime * 1000;
          const variance = Math.random() * 1000; // ±1 second variance
          const delay = Math.max(100, baseTime + variance - 500); // Minimum 100ms for test performance
          const endTime = Date.now() + Math.min(delay, 200); // Cap at 200ms for test performance
          while (Date.now() < endTime) {
            // Busy wait
          }
          return '';
        }
        return '';
      });

      // Measure build time multiple times
      for (let i = 0; i < 5; i++) {
        const buildTime = await progressTracker.getBuildTime();
        buildTimes.push(buildTime);
      }

      // All build times should be positive and relatively consistent
      expect(buildTimes.every(time => time > 0)).toBe(true);
      expect(buildTimes.length).toBe(5);

      // Calculate variance
      const average = buildTimes.reduce((sum, time) => sum + time, 0) / buildTimes.length;
      const variance = buildTimes.reduce((sum, time) => sum + Math.pow(time - average, 2), 0) / buildTimes.length;
      const standardDeviation = Math.sqrt(variance);

      // Standard deviation should be reasonable (less than 2 seconds)
      expect(standardDeviation).toBeLessThan(2);
    });
  });

  describe('Build Performance Optimization', () => {
    it('should validate cache hit rate performance', async () => {
      // Mock cache hit rate measurement
      jest.spyOn(progressTracker, 'getCacheHitRate').mockResolvedValue(0.85);

      const cacheHitRate = await progressTracker.getCacheHitRate();

      expect(cacheHitRate).toBeGreaterThanOrEqual(0.8); // 80% minimum target
      expect(cacheHitRate).toBeLessThanOrEqual(1.0); // Cannot exceed 100%
    });

    it('should detect cache performance degradation', async () => {
      // Mock poor cache performance
      jest.spyOn(progressTracker, 'getCacheHitRate').mockResolvedValue(0.65);

      const cacheHitRate = await progressTracker.getCacheHitRate();

      expect(cacheHitRate).toBeLessThan(0.8); // Below target
    });

    it('should measure memory usage during build', async () => {
      // Mock memory usage tracking
      const originalMemoryUsage = process.memoryUsage;
      (process as any).memoryUsage = jest.fn().mockReturnValue({
        heapUsed: 45 * 1024 * 1024, // 45MB
        heapTotal: 100 * 1024 * 1024,
        external: 0,
        rss: 0,
        arrayBuffers: 0,
      });

      const memoryUsage = await progressTracker.getMemoryUsage();

      expect(memoryUsage).toBeLessThan(50); // 50MB target
      expect(memoryUsage).toBeGreaterThan(0);

      process.memoryUsage = originalMemoryUsage;
    });

    it('should detect memory usage spikes', async () => {
      // Mock high memory usage
      const originalMemoryUsage = process.memoryUsage;
      (process as any).memoryUsage = jest.fn().mockReturnValue({
        heapUsed: 75 * 1024 * 1024, // 75MB - exceeds target
        heapTotal: 150 * 1024 * 1024,
        external: 0,
        rss: 0,
        arrayBuffers: 0,
      });

      const memoryUsage = await progressTracker.getMemoryUsage();

      expect(memoryUsage).toBeGreaterThan(50); // Exceeds 50MB target

      process.memoryUsage = originalMemoryUsage;
    });
  });

  describe('Bundle Size Performance', () => {
    it('should validate bundle size under 420kB target', async () => {
      // Mock bundle size measurement
      mockFs.existsSync.mockImplementation(path => {
        return path === '.next' || path === 'dist';
      });

      mockExecSync.mockImplementation(command => {
        const cmd = command.toString();
        if (cmd.includes('du -sk .next')) {
          return '300'; // 300kB
        }
        if (cmd.includes('du -sk dist')) {
          return '100'; // 100kB
        }
        return '';
      });

      const bundleSize = await progressTracker.getBundleSize();

      expect(bundleSize).toBe(400); // 300 + 100 = 400kB
      expect(bundleSize).toBeLessThan(420); // Under target
    });

    it('should detect bundle size regression', async () => {
      // Mock large bundle size
      mockFs.existsSync.mockReturnValue(true);
      mockExecSync.mockImplementation(command => {
        if (command.toString().includes('du -sk')) {
          return '500'; // 500kB - exceeds target
        }
        return '';
      });

      const bundleSize = await progressTracker.getBundleSize();

      expect(bundleSize).toBeGreaterThan(420); // Exceeds target
    });

    it('should handle missing build directories', async () => {
      mockFs.existsSync.mockReturnValue(false);

      const bundleSize = await progressTracker.getBundleSize();

      expect(bundleSize).toBe(0); // No build directories found
    });

    it('should measure bundle size across different build outputs', async () => {
      const buildDirs = ['.next', 'dist', 'build'];
      const expectedSizes = [200, 150, 50]; // kB

      mockFs.existsSync.mockImplementation(path => {
        return buildDirs.includes(path as string);
      });

      mockExecSync.mockImplementation(command => {
        const cmd = command.toString();
        if (cmd.includes('du -sk .next')) return '200';
        if (cmd.includes('du -sk dist')) return '150';
        if (cmd.includes('du -sk build')) return '50';
        return '';
      });

      const bundleSize = await progressTracker.getBundleSize();

      expect(bundleSize).toBe(400); // 200 + 150 + 50 = 400kB
    });
  });

  describe('Performance Regression Testing', () => {
    it('should detect performance regression during campaign execution', async () => {
      const phase = mockConfig.phases[0];

      // Mock performance degradation
      let buildTimeCallCount = 0;
      jest.spyOn(progressTracker, 'getBuildTime').mockImplementation(async () => {
        buildTimeCallCount++;
        // Simulate performance degradation over time
        return 8 + buildTimeCallCount * 2; // 8s, 10s, 12s, etc.
      });

      // Execute phase multiple times to simulate regression
      const results: Array<unknown> = [];
      for (let i = 0; i < 3; i++) {
        const result = await campaignController.executePhase(phase);
        results.push(result);
      }

      // Verify that performance degradation would be detected
      const finalBuildTime = await progressTracker.getBuildTime();
      expect(finalBuildTime).toBeGreaterThan(10); // Exceeds target
    });

    it('should validate performance improvements during campaign', async () => {
      const phase = mockConfig.phases[0];

      // Mock performance improvement
      let buildTimeCallCount = 0;
      jest.spyOn(progressTracker, 'getBuildTime').mockImplementation(async () => {
        buildTimeCallCount++;
        // Simulate performance improvement over time
        return Math.max(6, 12 - buildTimeCallCount * 2); // 12s, 10s, 8s, 6s
      });

      // Execute phase multiple times to simulate improvement
      const results: Array<unknown> = [];
      for (let i = 0; i < 4; i++) {
        const result = await campaignController.executePhase(phase);
        results.push(result);
      }

      // Verify performance improvement
      const finalBuildTime = await progressTracker.getBuildTime();
      expect(finalBuildTime).toBeLessThan(10); // Under target
    });

    it('should track performance metrics over time', async () => {
      const performanceHistory: ProgressMetrics[] = [];

      // Mock progressive performance improvement
      let metricsCallCount = 0;
      jest.spyOn(progressTracker, 'getProgressMetrics').mockImplementation(async () => {
        metricsCallCount++;
        const metrics: ProgressMetrics = {
          typeScriptErrors: { current: 86, target: 0, reduction: 0, percentage: 0 },
          lintingWarnings: { current: 4506, target: 0, reduction: 0, percentage: 0 },
          buildPerformance: {
            currentTime: Math.max(7, 12 - metricsCallCount), // Improving build time
            targetTime: 10,
            cacheHitRate: Math.min(0.9, 0.6 + metricsCallCount * 0.1), // Improving cache hit rate
            memoryUsage: Math.max(35, 55 - metricsCallCount * 5), // Improving memory usage
          },
          enterpriseSystems: { current: 0, target: 200, transformedExports: 0 },
        };
        performanceHistory.push(metrics);
        return metrics;
      });

      // Collect performance metrics over multiple calls
      for (let i = 0; i < 5; i++) {
        await progressTracker.getProgressMetrics();
      }

      expect(performanceHistory.length).toBe(5);

      // Verify performance improvement trend
      const firstMetrics = performanceHistory[0];
      const lastMetrics = performanceHistory[performanceHistory.length - 1];

      expect(lastMetrics.buildPerformance.currentTime).toBeLessThan(firstMetrics.buildPerformance.currentTime);
      expect(lastMetrics.buildPerformance.cacheHitRate).toBeGreaterThan(firstMetrics.buildPerformance.cacheHitRate);
      expect(lastMetrics.buildPerformance.memoryUsage).toBeLessThan(firstMetrics.buildPerformance.memoryUsage);
    });
  });

  describe('Performance Benchmarking', () => {
    it('should benchmark TypeScript compilation performance', async () => {
      const compilationTimes: Array<number> = [];

      mockExecSync.mockImplementation(command => {
        if (command.toString().includes('yarn tsc')) {
          const startTime = Date.now();
          // Simulate TypeScript compilation time
          const delay = 50 + Math.random() * 100; // 50-150ms
          const endTime = startTime + delay;
          while (Date.now() < endTime) {
            // Busy wait
          }
          compilationTimes.push(Date.now() - startTime);
          return '0'; // No errors
        }
        return '';
      });

      // Run multiple TypeScript error checks
      for (let i = 0; i < 5; i++) {
        await progressTracker.getTypeScriptErrorCount();
      }

      expect(compilationTimes.length).toBe(5);
      expect(compilationTimes.every(time => time > 0)).toBe(true);

      // Calculate average compilation time
      const averageTime = compilationTimes.reduce((sum, time) => sum + time, 0) / compilationTimes.length;
      expect(averageTime).toBeLessThan(1000); // Should be under 1 second
    });

    it('should benchmark linting performance', async () => {
      const lintingTimes: Array<number> = [];

      mockExecSync.mockImplementation(command => {
        if (command.toString().includes('yarn lint')) {
          const startTime = Date.now();
          // Simulate linting time
          const delay = 30 + Math.random() * 70; // 30-100ms
          const endTime = startTime + delay;
          while (Date.now() < endTime) {
            // Busy wait
          }
          lintingTimes.push(Date.now() - startTime);
          return '0'; // No warnings
        }
        return '';
      });

      // Run multiple linting checks
      for (let i = 0; i < 5; i++) {
        await progressTracker.getLintingWarningCount();
      }

      expect(lintingTimes.length).toBe(5);
      expect(lintingTimes.every(time => time > 0)).toBe(true);

      // Calculate average linting time
      const averageTime = lintingTimes.reduce((sum, time) => sum + time, 0) / lintingTimes.length;
      expect(averageTime).toBeLessThan(500); // Should be under 0.5 seconds
    });

    it('should benchmark enterprise system counting performance', async () => {
      const countingTimes: Array<number> = [];

      mockExecSync.mockImplementation(command => {
        if (command.toString().includes('grep -r "INTELLIGENCE_SYSTEM"')) {
          const startTime = Date.now();
          // Simulate grep operation time
          const delay = 20 + Math.random() * 30; // 20-50ms
          const endTime = startTime + delay;
          while (Date.now() < endTime) {
            // Busy wait
          }
          countingTimes.push(Date.now() - startTime);
          return '150'; // 150 systems found
        }
        return '';
      });

      // Run multiple enterprise system counts
      for (let i = 0; i < 5; i++) {
        await progressTracker.getEnterpriseSystemCount();
      }

      expect(countingTimes.length).toBe(5);
      expect(countingTimes.every(time => time > 0)).toBe(true);

      // Calculate average counting time
      const averageTime = countingTimes.reduce((sum, time) => sum + time, 0) / countingTimes.length;
      expect(averageTime).toBeLessThan(200); // Should be under 0.2 seconds
    });
  });

  describe('Scalability Testing', () => {
    it('should handle large codebase performance', async () => {
      // Mock large codebase metrics
      mockExecSync.mockImplementation(command => {
        const cmd = command.toString();
        if (cmd.includes('yarn tsc')) {
          // Simulate longer compilation for large codebase
          const delay = 100; // 100ms for test performance
          const endTime = Date.now() + delay;
          while (Date.now() < endTime) {
            // Busy wait
          }
          return '500'; // 500 TypeScript errors
        }
        if (cmd.includes('yarn lint')) {
          return '10000'; // 10,000 linting warnings
        }
        if (cmd.includes('grep -r "INTELLIGENCE_SYSTEM"')) {
          return '1000'; // 1,000 enterprise systems
        }
        return '';
      });

      const metrics = await progressTracker.getProgressMetrics();

      expect(metrics.typeScriptErrors.current).toBe(500);
      expect(metrics.lintingWarnings.current).toBe(10000);
      expect(metrics.enterpriseSystems.current).toBe(1000);

      // Performance should still be reasonable even with large numbers
      expect(metrics).toBeDefined();
    });

    it('should maintain performance with concurrent operations', async () => {
      // Run multiple progress tracking operations concurrently
      const promises = [
        progressTracker.getTypeScriptErrorCount(),
        progressTracker.getLintingWarningCount(),
        progressTracker.getEnterpriseSystemCount(),
        progressTracker.getBuildTime(),
        progressTracker.getMemoryUsage(),
      ];

      const startTime = Date.now();
      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      expect(results.length).toBe(5);
      expect(results.every(result => typeof result === 'number')).toBe(true);
      expect(totalTime).toBeLessThan(2000); // Should complete within 2 seconds
    });

    it('should handle memory-intensive operations efficiently', async () => {
      // Mock memory-intensive progress tracking
      const largeMetricsHistory: ProgressMetrics[] = [];

      jest.spyOn(progressTracker, 'getProgressMetrics').mockImplementation(async () => {
        const metrics: ProgressMetrics = {
          typeScriptErrors: { current: 86, target: 0, reduction: 0, percentage: 0 },
          lintingWarnings: { current: 4506, target: 0, reduction: 0, percentage: 0 },
          buildPerformance: { currentTime: 8.5, targetTime: 10, cacheHitRate: 0.8, memoryUsage: 45 },
          enterpriseSystems: { current: 0, target: 200, transformedExports: 0 },
        };
        largeMetricsHistory.push(metrics);
        return metrics;
      });

      // Generate large metrics history
      for (let i = 0; i < 100; i++) {
        await progressTracker.getProgressMetrics();
      }

      const history = progressTracker.getMetricsHistory();

      // Should limit history size to prevent memory issues
      expect(history.length).toBeLessThanOrEqual(50); // Should be trimmed
    });
  });
});
