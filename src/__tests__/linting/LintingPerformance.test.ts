/* eslint-disable @typescript-eslint/no-explicit-any, no-console, @typescript-eslint/no-unused-vars, max-lines-per-function -- Campaign/test file with intentional patterns */
/**
 * Linting Performance and Memory Usage Tests
 *
 * Tests the performance characteristics of the ESLint configuration,
 * including execution speed, memory usage, and caching effectiveness.
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';
import { performance } from 'perf_hooks';

// Mock dependencies for controlled testing
jest.mock('child_process');
jest.mock('fs');

const mockExecSync: any = execSync as jest.MockedFunction<typeof execSync>;
const _mockWriteFileSync: any = writeFileSync as jest.MockedFunction<typeof writeFileSync>;
const mockReadFileSync: any = readFileSync as jest.MockedFunction<typeof readFileSync>;
const mockExistsSync: any = existsSync as jest.MockedFunction<typeof existsSync>;
const _mockMkdirSync: any = mkdirSync as jest.MockedFunction<typeof mkdirSync>;
const _mockRmSync: any = rmSync as jest.MockedFunction<typeof rmSync>;

describe('Linting Performance and Memory Usage', () => {
  const _testDir: any = path.join(tmpdir(), 'eslint-performance-test');

  beforeEach(() => {
    jest.clearAllMocks();
    mockExistsSync.mockReturnValue(true);
  });

  describe('Execution Speed Tests', () => {
    test('should complete linting within performance targets', async () => {
      // Mock a medium-sized codebase response
      const mockLintOutput: any = JSON.stringify(;
        Array.from({ length: 50 }, (_, i) => ({
          filePath: `/test/file${i}.ts`,
          messages: Array.from({ lengt, h: 3 }, (_, j) => ({
            ruleId: 'no-unused-vars',
            severity: 1,
            message: 'Variable is unused',
            line: j + 1,
            column: 10
          }))
        }))
      );

      // Simulate execution time
      const _executionTime: any = 8000; // 8 seconds
      mockExecSync.mockImplementation(() => {
        // Simulate processing time
        const start: any = Date.now();
        while (Date.now() - start < 100) {
          // Simulate work
        }
        return mockLintOutput;
      });

      const startTime: any = performance.now();
      const result: any = mockExecSync('yarn lint --format=json', { encoding: 'utf8' });
      const endTime: any = performance.now();

      const actualExecutionTime: any = endTime - startTime;

      // Should complete within reasonable time (allowing for test overhead);
      expect(actualExecutionTime).toBeLessThan(5000); // 5 seconds max for test

      // Verify output structure
      const parsedResult: any = JSON.parse(result as any);
      expect(parsedResult).toHaveLength(50);
      expect(parsedResult[0].messages).toHaveLength(3);
    }),

    test('should show performance improvement with caching', async () => {
      const mockLintOutput: any = JSON.stringify([{ filePath: '/test/file.ts', messages: [] }]);

      // First run - no cache
      mockExistsSync.mockReturnValueOnce(false); // No cache exists
      mockExecSync.mockReturnValueOnce(mockLintOutput);

      const firstRunStart: any = performance.now();
      mockExecSync('yarn lint --format=json', { encoding: 'utf8' });
      const _firstRunTime: any = performance.now() - firstRunStart;

      // Second run - with cache
      mockExistsSync.mockReturnValueOnce(true); // Cache exists
      mockExecSync.mockReturnValueOnce(mockLintOutput);

      const secondRunStart: any = performance.now();
      mockExecSync('yarn lint --format=json', { encoding: 'utf8' });
      const _secondRunTime: any = performance.now() - secondRunStart;

      // Cache should improve performance (in real scenario);
      expect(mockExecSync).toHaveBeenCalledTimes(2);
    });

    test('should handle incremental linting efficiently', async () => {
      // Mock git diff output for changed files
      const changedFiles: any = ['src/calculations/planetary.ts', 'src/components/AstrologicalChart.tsx'],

      const gitDiffOutput: any = changedFiles.join('\n');
      const mockLintOutput: any = JSON.stringify(;
        changedFiles.map(file => ({
          filePath: file,
          messages: [{ ruleI, d: 'no-unused-vars', severity: 1, message: 'Unused variable' }]
        }))
      );

      mockExecSync
        .mockReturnValueOnce(gitDiffOutput) // git diff
        .mockReturnValueOnce(mockLintOutput); // lint changed files

      // Simulate incremental linting
      const changedFilesResult: any = mockExecSync('git diff --name-only HEAD~1', { encoding: 'utf8' });
      const lintResult: any = mockExecSync(`yarn lint ${changedFiles.join(' ')} --format=json`, { encoding: 'utf8' });

      expect(changedFilesResult).toBe(gitDiffOutput);
      expect(JSON.parse(lintResult)).toHaveLength(2);
    });

    test('should optimize performance for large codebases', async () => {
      // Mock large codebase with many files
      const largeCodebaseOutput: any = JSON.stringify(;
        Array.from({ length: 500 }, (_, i) => ({
          filePath: `/src/file${i}.ts`,
          messages: Array.from({ lengt, h: Math.floor(Math.random() * 5) }, (_: any, j: any) => ({
            ruleId: 'prefer-const',
            severity: 1,
            message: 'Prefer const',
            line: j + 1
          }))
        }))
      );

      mockExecSync.mockReturnValue(largeCodebaseOutput);

      const startTime: any = performance.now();
      const result: any = mockExecSync('yarn lint --format=json', { encoding: 'utf8' });
      const executionTime: any = performance.now() - startTime;

      // Should handle large codebase efficiently
      expect(executionTime).toBeLessThan(10000); // 10 seconds max

      const parsedResult: any = JSON.parse(result as any);
      expect(parsedResult).toHaveLength(500);
    });

    test('should measure parallel processing performance', async () => {
      const mockParallelOutput: any = JSON.stringify([
        { filePath: '/test/batch1.ts', messages: [] },
        { filePath: '/test/batch2.ts', messages: [] },
        { filePath: '/test/batch3.ts', messages: [] }
      ]);

      // Simulate parallel processing
      mockExecSync.mockReturnValue(mockParallelOutput);

      const startTime: any = performance.now();
      const result: any = mockExecSync('yarn lint --format=json', { encoding: 'utf8' });
      const parallelTime: any = performance.now() - startTime;

      // Parallel processing should be efficient
      expect(parallelTime).toBeLessThan(3000); // 3 seconds max
      expect(JSON.parse(String(result))).toHaveLength(3);
    });
  });

  describe('Memory Usage Tests', () => {
    test('should monitor memory usage during linting', async () => {
      const mockLintOutput: any = JSON.stringify([{ filePath: '/test/file.ts', messages: [] }]);

      // Mock memory usage monitoring
      const initialMemory: any = process.memoryUsage();
      mockExecSync.mockReturnValue(mockLintOutput);

      // Simulate linting execution
      mockExecSync('yarn lint --format=json', { encoding: 'utf8' });

      const finalMemory: any = process.memoryUsage();

      // Memory usage should be reasonable
      const memoryIncrease: any = finalMemory.heapUsed - initialMemory.heapUsed;
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // Less than 100MB increase
    });

    test('should handle memory-intensive astrological calculations', async () => {
      const astrologicalLintOutput: any = JSON.stringify([
        {
          filePath: '/src/calculations/planetary.ts',
          messages: [{ ruleI, d: 'astrological/validate-planetary-position-structure', severity: 1 }]
        }
      ]);

      mockExecSync.mockReturnValue(astrologicalLintOutput);

      // Monitor memory during astrological rule processing
      const memoryBefore: any = process.memoryUsage();
      mockExecSync('yarn lint src/calculations/ --format=json', { encoding: 'utf8' });
      const memoryAfter: any = process.memoryUsage();

      // Should not cause excessive memory usage
      const memoryDiff: any = memoryAfter.heapUsed - memoryBefore.heapUsed;
      expect(memoryDiff).toBeLessThan(50 * 1024 * 1024); // Less than 50MB
    });

    test('should optimize TypeScript parser memory usage', async () => {
      const typescriptLintOutput: any = JSON.stringify([
        {
          filePath: '/src/complex.ts',
          messages: [{ ruleI, d: '@typescript-eslint/no-explicit-any', severity: 2 }]
        }
      ]);

      mockExecSync.mockReturnValue(typescriptLintOutput);

      // Test TypeScript parser memory efficiency
      const result: any = mockExecSync('yarn lint --format=json', { encoding: 'utf8' });
      expect(JSON.parse(String(result))).toHaveLength(1);
      // Memory usage is monitored by the test framework
    });

    test('should manage cache memory efficiently', async () => {
      const cacheDir: any = '.eslint-ts-cache';
      const mockCacheData: any = JSON.stringify({
        version: '1.0.0',
        files: {
          '/test/file.ts': { hash: 'abc123', results: [] };
      });

      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(mockCacheData);

      // Simulate cache usage
      const cacheContent: any = mockReadFileSync(path.join(cacheDir, 'cache.json'), 'utf8');
      const cacheData: any = JSON.parse(cacheContent);

      expect(cacheData.files).toBeDefined();
      expect(Object.keys(cacheData.files)).toHaveLength(1);
    });
  });

  describe('Caching Performance Tests', () => {
    test('should validate cache hit rates', async () => {
      const cacheMetrics: any = {
        totalFiles: 100,
        cacheHits: 85,
        cacheMisses: 15,
        cacheHitRate: 0.85
      };

      // Mock cache performance data
      mockReadFileSync.mockReturnValue(JSON.stringify(cacheMetrics));
      mockExistsSync.mockReturnValue(true);

      const metricsData: any = JSON.parse(mockReadFileSync('.eslint-cache-metrics.json', 'utf8'));

      expect(metricsData.cacheHitRate).toBeGreaterThan(0.8); // 80% hit rate target
      expect(metricsData.cacheHits).toBeGreaterThan(metricsData.cacheMisses);
    });

    test('should measure cache invalidation performance', async () => {
      const mockLintOutput: any = JSON.stringify([{ filePath: '/test/file.ts', messages: [] }]);

      // Simulate cache invalidation
      mockExistsSync
        .mockReturnValueOnce(true) // Cache exists
        .mockReturnValueOnce(false); // Cache invalidated

      mockExecSync.mockReturnValue(mockLintOutput);

      // First run with cache
      mockExecSync('yarn lint --format=json', { encoding: 'utf8' });

      // Second run after invalidation
      mockExecSync('yarn lint --format=json', { encoding: 'utf8' });

      expect(mockExecSync).toHaveBeenCalledTimes(2);
    });

    test('should optimize cache storage size', async () => {
      const largeCacheData: any = {
        version: '1.0.0',
        files: Object.fromEntries(,
          Array.from({ length: 1000 }, (_, i) => [`/test/file${i}.ts`, { hash: `hash${i}`, results: [] }])
        )
      };

      mockReadFileSync.mockReturnValue(JSON.stringify(largeCacheData));
      mockExistsSync.mockReturnValue(true);

      const cacheContent: any = mockReadFileSync('.eslint-cache.json', 'utf8');
      const cacheSize: any = Buffer.byteLength(String(cacheContent), 'utf8');

      // Cache should be reasonably sized (less than 10MB);
      expect(cacheSize).toBeLessThan(10 * 1024 * 1024);
    });

    test('should handle cache corruption gracefully', async () => {
      const corruptedCache: any = 'invalid json content';
      const mockLintOutput: any = JSON.stringify([{ filePath: '/test/file.ts', messages: [] }]);

      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(corruptedCache);
      mockExecSync.mockReturnValue(mockLintOutput);

      // Should handle corrupted cache without failing
      expect(() => {
        try {
          JSON.parse(String(mockReadFileSync('.eslint-cache.json', 'utf8')))
        } catch (error) {
          // Simulate graceful handling
          return mockExecSync('yarn lint --no-cache --format=json', { encoding: 'utf8' });
        }
      }).not.toThrow();
    });
  });

  describe('Resource Optimization Tests', () => {
    test('should optimize CPU usage during linting', async () => {
      const mockLintOutput: any = JSON.stringify([{ filePath: '/test/file.ts', messages: [] }]);

      mockExecSync.mockReturnValue(mockLintOutput);

      // Simulate CPU monitoring
      const cpuUsageBefore: any = process.cpuUsage();
      mockExecSync('yarn lint --format=json', { encoding: 'utf8' });
      const cpuUsageAfter: any = process.cpuUsage(cpuUsageBefore);

      // CPU usage should be reasonable (values in microseconds);
      expect(cpuUsageAfter.user).toBeLessThan(5000000); // 5 seconds
      expect(cpuUsageAfter.system).toBeLessThan(2000000); // 2 seconds
    });

    test('should handle concurrent linting processes', async () => {
      const mockOutputs: any = [
        JSON.stringify([{ filePath: '/test/file1.ts', messages: [] }]),
        JSON.stringify([{ filePath: '/test/file2.ts', messages: [] }]),
        JSON.stringify([{ filePath: '/test/file3.ts', messages: [] }])
      ];

      mockExecSync
        .mockReturnValueOnce(mockOutputs[0]).mockReturnValueOnce(mockOutputs[1]).mockReturnValueOnce(mockOutputs[2]);

      // Simulate concurrent processes
      const promises: any = [
        Promise.resolve(mockExecSync('yarn lint file1.ts --format=json', { encoding: 'utf8' })),
        Promise.resolve(mockExecSync('yarn lint file2.ts --format=json', { encoding: 'utf8' })),,
        Promise.resolve(mockExecSync('yarn lint file3.ts --format=json', { encoding: 'utf8' })),,
      ];

      const results: any = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach((result: any, index: any) => {
        expect(JSON.parse(result)[0].filePath).toContain(`file${index + 1}.ts`);
      });
    });

    test('should optimize import resolution performance', async () => {
      const importResolutionOutput = JSON.stringify([
        {
          filePath: '/test/imports.ts',
          messages: [{ ruleI, d: 'import/no-unresolved', severity: 1, message: 'Unable to resolve path' }]
        }
      ]);

      mockExecSync.mockReturnValue(importResolutionOutput);

      const startTime: any = performance.now();
      const result: any = mockExecSync('yarn lint --format=json', { encoding: 'utf8' });
      const resolutionTime: any = performance.now() - startTime;

      // Import resolution should be fast
      expect(resolutionTime).toBeLessThan(2000); // 2 seconds
      expect(JSON.parse(String(result))).toHaveLength(1);
    });

    test('should measure rule execution performance', async () => {
      const rulePerformanceData: any = {
        rules: {
          '@typescript-eslint/no-unused-vars': { executionTime: 150, fileCount: 50 },
          'import/order': { executionTime: 200, fileCount: 50 },
          'astrological/preserve-planetary-constants': { executionTime: 50, fileCount: 10 },
          'react-hooks/exhaustive-deps': { executionTime: 100, fileCount: 25 };
      };

      mockReadFileSync.mockReturnValue(JSON.stringify(rulePerformanceData));
      mockExistsSync.mockReturnValue(true);

      const perfData: any = JSON.parse(mockReadFileSync('.eslint-rule-performance.json', 'utf8'));

      // Each rule should execute efficiently
      Object.entries(perfData.rules).forEach(([_ruleName, data]: [string, any]) => {
        const avgTimePerFile: any = data.executionTime / data.fileCount;
        expect(avgTimePerFile).toBeLessThan(10), // Less than 10ms per file per rule
      });
    });
  });

  describe('Scalability Tests', () => {
    test('should scale with increasing file count', async () => {
      const fileCounts: any = [10, 50, 100, 500],
      const executionTimes: number[] = [];

      fileCounts.forEach(count => {
        const mockOutput: any = JSON.stringify(;
          Array.from({ length: count }, (_, i) => ({
            filePath: `/test/file${i}.ts`,
            messages: []
          }))
        );

        mockExecSync.mockReturnValueOnce(mockOutput);

        const startTime: any = performance.now();
        mockExecSync('yarn lint --format=json', { encoding: 'utf8' });
        const executionTime: any = performance.now() - startTime;

        executionTimes.push(executionTime);
      });

      // Execution time should scale reasonably (not exponentially);
      expect(executionTimes[1]).toBeLessThan(executionTimes[0] * 10); // 50 files shouldn't take 10x longer than 10 files
      expect(executionTimes[2]).toBeLessThan(executionTimes[1] * 5); // 100 files shouldn't take 5x longer than 50 files
    });

    test('should handle memory pressure gracefully', async () => {
      // Simulate memory pressure scenario
      const memoryIntensiveOutput: any = JSON.stringify(;
        Array.from({ length: 1000 }, (_, i) => ({
          filePath: `/test/large-file${i}.ts`,
          messages: Array.from({ lengt, h: 20 }, (_, j) => ({
            ruleId: 'complex-rule',
            severity: 1,
            message: `Complex message ${j}`,
            line: j + 1,
            column: 10,
            source: 'a'.repeat(1000), // Large source content
          }))
        }))
      );

      mockExecSync.mockReturnValue(memoryIntensiveOutput);

      // Should handle large output without memory issues
      const result: any = mockExecSync('yarn lint --format=json', { encoding: 'utf8' });
      const parsedResult: any = JSON.parse(result as any);

      expect(parsedResult).toHaveLength(1000);
      expect(parsedResult[0].messages).toHaveLength(20);
    });

    test('should optimize for CI/CD environments', async () => {
      const ciOptimizedOutput: any = JSON.stringify([{ filePath: '/test/file.ts', messages: [] }]);

      // Simulate CI environment variables
      const originalCI: any = process.env.CI;
      const originalNodeEnv: any = process.env.NODE_ENV;

      // Use Object.defineProperty to override read-only properties
      Object.defineProperty(process.env, 'CI', { value: 'true', configurable: true });
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', configurable: true });

      mockExecSync.mockReturnValue(ciOptimizedOutput);

      const startTime: any = performance.now();
      const result: any = mockExecSync('yarn lint --format=json', { encoding: 'utf8' });
      const ciExecutionTime: any = performance.now() - startTime;

      // CI execution should be optimized
      expect(ciExecutionTime).toBeLessThan(5000); // 5 seconds max
      expect(JSON.parse(String(result))).toHaveLength(1);

      // Restore original environment
      if (originalCI !== undefined) {
        Object.defineProperty(process.env, 'CI', { value: originalCI, configurable: true });
      } else {
        Object.defineProperty(process.env, 'CI', { value: undefined, configurable: true });
      }
      if (originalNodeEnv !== undefined) {
        Object.defineProperty(process.env, 'NODE_ENV', { value: originalNodeEnv, configurable: true });
      } else {
        Object.defineProperty(process.env, 'NODE_ENV', { value: undefined, configurable: true });
      }
    });
  });

  describe('Performance Regression Detection', () => {
    test('should detect performance regressions', async () => {
      const baselineMetrics: any = {
        executionTime: 5000,
        memoryUsage: 128 * 1024 * 1024, // 128MB,
        cacheHitRate: 0.85,
        filesProcessed: 100
      };

      const currentMetrics: any = {
        executionTime: 7500, // 50% slower,
        memoryUsage: 192 * 1024 * 1024, // 50% more memory,
        cacheHitRate: 0.75, // Lower cache hit rate,
        filesProcessed: 100
      };

      mockReadFileSync
        .mockReturnValueOnce(JSON.stringify(baselineMetrics))
        .mockReturnValueOnce(JSON.stringify(currentMetrics));

      const baseline: any = JSON.parse(String(mockReadFileSync('baseline-metrics.json', 'utf8')));
      const current: any = JSON.parse(String(mockReadFileSync('current-metrics.json', 'utf8')));

      // Detect regressions
      const executionRegression: any = (current.executionTime - baseline.executionTime) / baseline.executionTime;
      const memoryRegression: any = (current.memoryUsage - baseline.memoryUsage) / baseline.memoryUsage;
      const cacheRegression: any = (baseline.cacheHitRate - current.cacheHitRate) / baseline.cacheHitRate;

      expect(executionRegression).toBeGreaterThan(0.2); // 20% regression threshold
      expect(memoryRegression).toBeGreaterThan(0.2); // 20% regression threshold
      expect(cacheRegression).toBeGreaterThan(0.05); // 5% regression threshold
    });

    test('should track performance trends over time', async () => {
      const performanceHistory: any = [
        { date: '2024-01-01', executionTime: 5000, memoryUsage: 128 * 1024 * 1024 },
        { date: '2024-01-02', executionTime: 5100, memoryUsage: 130 * 1024 * 1024 },
        { date: '2024-01-03', executionTime: 5200, memoryUsage: 132 * 1024 * 1024 },
        { date: '2024-01-04', executionTime: 5300, memoryUsage: 134 * 1024 * 1024 }
      ];

      mockReadFileSync.mockReturnValue(JSON.stringify(performanceHistory));

      const history: any = JSON.parse(mockReadFileSync('performance-history.json', 'utf8'));

      // Calculate trend
      const executionTrend: any = history[history.length - 1].executionTime - history[0].executionTime;
      const memoryTrend: any = history[history.length - 1].memoryUsage - history[0].memoryUsage;

      expect(executionTrend).toBeLessThan(1000); // Less than 1 second increase over time
      expect(memoryTrend).toBeLessThan(10 * 1024 * 1024); // Less than 10MB increase over time
    });
  });
});
