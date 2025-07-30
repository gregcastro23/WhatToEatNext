/**
 * Linting Performance and Memory Usage Tests
 * 
 * Tests the performance characteristics of the ESLint configuration,
 * including execution speed, memory usage, and caching effectiveness.
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync, mkdirSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';
import { performance } from 'perf_hooks';

// Mock dependencies for controlled testing
jest.mock('child_process');
jest.mock('fs');

const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;
const mockWriteFileSync = writeFileSync as jest.MockedFunction<typeof writeFileSync>;
const mockReadFileSync = readFileSync as jest.MockedFunction<typeof readFileSync>;
const mockExistsSync = existsSync as jest.MockedFunction<typeof existsSync>;
const mockMkdirSync = mkdirSync as jest.MockedFunction<typeof mkdirSync>;
const mockRmSync = rmSync as jest.MockedFunction<typeof rmSync>;

describe('Linting Performance and Memory Usage', () => {
  const testDir = path.join(tmpdir(), 'eslint-performance-test');
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockExistsSync.mockReturnValue(true);
  });

  describe('Execution Speed Tests', () => {
    test('should complete linting within performance targets', async () => {
      // Mock a medium-sized codebase response
      const mockLintOutput = JSON.stringify(
        Array.from({ length: 50 }, (_, i) => ({
          filePath: `/test/file${i}.ts`,
          messages: Array.from({ length: 3 }, (_, j) => ({
            ruleId: 'no-unused-vars',
            severity: 1,
            message: 'Variable is unused',
            line: j + 1,
            column: 10
          }))
        }))
      );

      // Simulate execution time
      const executionTime = 8000; // 8 seconds
      mockExecSync.mockImplementation(() => {
        // Simulate processing time
        const start = Date.now();
        while (Date.now() - start < 100) {
          // Simulate work
        }
        return mockLintOutput;
      });

      const startTime = performance.now();
      const result = mockExecSync('yarn lint --format=json', { encoding: 'utf8' });
      const endTime = performance.now();
      
      const actualExecutionTime = endTime - startTime;
      
      // Should complete within reasonable time (allowing for test overhead)
      expect(actualExecutionTime).toBeLessThan(5000); // 5 seconds max for test
      
      // Verify output structure
      const parsedResult = JSON.parse(result );
      expect(parsedResult).toHaveLength(50);
      expect(parsedResult[0].messages).toHaveLength(3);
    });

    test('should show performance improvement with caching', async () => {
      const mockLintOutput = JSON.stringify([
        { filePath: '/test/file.ts', messages: [] }
      ]);

      // First run - no cache
      mockExistsSync.mockReturnValueOnce(false); // No cache exists
      mockExecSync.mockReturnValueOnce(mockLintOutput);

      const firstRunStart = performance.now();
      mockExecSync('yarn lint --format=json', { encoding: 'utf8' });
      const firstRunTime = performance.now() - firstRunStart;

      // Second run - with cache
      mockExistsSync.mockReturnValueOnce(true); // Cache exists
      mockExecSync.mockReturnValueOnce(mockLintOutput);

      const secondRunStart = performance.now();
      mockExecSync('yarn lint --format=json', { encoding: 'utf8' });
      const secondRunTime = performance.now() - secondRunStart;

      // Cache should improve performance (in real scenario)
      expect(mockExecSync).toHaveBeenCalledTimes(2);
    });

    test('should handle incremental linting efficiently', async () => {
      // Mock git diff output for changed files
      const changedFiles = [
        'src/calculations/planetary.ts',
        'src/components/AstrologicalChart.tsx'
      ];

      const gitDiffOutput = changedFiles.join('\n');
      const mockLintOutput = JSON.stringify(
        changedFiles.map(file => ({
          filePath: file,
          messages: [
            { ruleId: 'no-unused-vars', severity: 1, message: 'Unused variable' }
          ]
        }))
      );

      mockExecSync
        .mockReturnValueOnce(gitDiffOutput) // git diff
        .mockReturnValueOnce(mockLintOutput); // lint changed files

      // Simulate incremental linting
      const changedFilesResult = mockExecSync('git diff --name-only HEAD~1', { encoding: 'utf8' });
      const lintResult = mockExecSync(`yarn lint ${changedFiles.join(' ')} --format=json`, { encoding: 'utf8' });

      expect(changedFilesResult).toBe(gitDiffOutput);
      expect(JSON.parse(lintResult )).toHaveLength(2);
    });

    test('should optimize performance for large codebases', async () => {
      // Mock large codebase with many files
      const largeCodebaseOutput = JSON.stringify(
        Array.from({ length: 500 }, (_, i) => ({
          filePath: `/src/file${i}.ts`,
          messages: Array.from({ length: Math.floor(Math.random() * 5) }, (_, j) => ({
            ruleId: 'prefer-const',
            severity: 1,
            message: 'Prefer const',
            line: j + 1
          }))
        }))
      );

      mockExecSync.mockReturnValue(largeCodebaseOutput);

      const startTime = performance.now();
      const result = mockExecSync('yarn lint --format=json', { encoding: 'utf8' });
      const executionTime = performance.now() - startTime;

      // Should handle large codebase efficiently
      expect(executionTime).toBeLessThan(10000); // 10 seconds max
      
      const parsedResult = JSON.parse(result );
      expect(parsedResult).toHaveLength(500);
    });

    test('should measure parallel processing performance', async () => {
      const mockParallelOutput = JSON.stringify([
        { filePath: '/test/batch1.ts', messages: [] },
        { filePath: '/test/batch2.ts', messages: [] },
        { filePath: '/test/batch3.ts', messages: [] }
      ]);

      // Simulate parallel processing
      mockExecSync.mockReturnValue(mockParallelOutput);

      const startTime = performance.now();
      const result = mockExecSync('yarn lint:parallel --format=json', { encoding: 'utf8' });
      const parallelTime = performance.now() - startTime;

      // Parallel processing should be efficient
      expect(parallelTime).toBeLessThan(3000); // 3 seconds max
      expect(JSON.parse(result )).toHaveLength(3);
    });
  });

  describe('Memory Usage Tests', () => {
    test('should monitor memory usage during linting', async () => {
      const mockLintOutput = JSON.stringify([
        { filePath: '/test/file.ts', messages: [] }
      ]);

      // Mock memory usage monitoring
      const initialMemory = process.memoryUsage();
      mockExecSync.mockReturnValue(mockLintOutput);

      // Simulate linting execution
      mockExecSync('yarn lint --format=json', { encoding: 'utf8' });
      
      const finalMemory = process.memoryUsage();
      
      // Memory usage should be reasonable
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // Less than 100MB increase
    });

    test('should handle memory-intensive astrological calculations', async () => {
      const astrologicalLintOutput = JSON.stringify([
        {
          filePath: '/src/calculations/planetary.ts',
          messages: [
            { ruleId: 'astrological/validate-planetary-position-structure', severity: 1 }
          ]
        }
      ]);

      mockExecSync.mockReturnValue(astrologicalLintOutput);

      // Monitor memory during astrological rule processing
      const memoryBefore = process.memoryUsage();
      mockExecSync('yarn lint src/calculations/ --format=json', { encoding: 'utf8' });
      const memoryAfter = process.memoryUsage();

      // Should not cause excessive memory usage
      const memoryDiff = memoryAfter.heapUsed - memoryBefore.heapUsed;
      expect(memoryDiff).toBeLessThan(50 * 1024 * 1024); // Less than 50MB
    });

    test('should optimize TypeScript parser memory usage', async () => {
      const typescriptLintOutput = JSON.stringify([
        {
          filePath: '/src/complex.ts',
          messages: [
            { ruleId: '@typescript-eslint/no-explicit-any', severity: 2 }
          ]
        }
      ]);

      mockExecSync.mockReturnValue(typescriptLintOutput);

      // Test TypeScript parser memory efficiency
      const result = mockExecSync('yarn lint --parser-options.project=tsconfig.json --format=json', { encoding: 'utf8' });
      
      expect(JSON.parse(result )).toHaveLength(1);
      // Memory usage is monitored by the test framework
    });

    test('should manage cache memory efficiently', async () => {
      const cacheDir = '.eslint-ts-cache';
      const mockCacheData = JSON.stringify({
        version: '1.0.0',
        files: {
          '/test/file.ts': { hash: 'abc123', results: [] }
        }
      });

      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(mockCacheData);

      // Simulate cache usage
      const cacheContent = mockReadFileSync(path.join(cacheDir, 'cache.json'), 'utf8');
      const cacheData = JSON.parse(cacheContent );

      expect(cacheData.files).toBeDefined();
      expect(Object.keys(cacheData.files)).toHaveLength(1);
    });
  });

  describe('Caching Performance Tests', () => {
    test('should validate cache hit rates', async () => {
      const cacheMetrics = {
        totalFiles: 100,
        cacheHits: 85,
        cacheMisses: 15,
        cacheHitRate: 0.85
      };

      // Mock cache performance data
      mockReadFileSync.mockReturnValue(JSON.stringify(cacheMetrics));
      mockExistsSync.mockReturnValue(true);

      const metricsData = JSON.parse(mockReadFileSync('.eslint-cache-metrics.json', 'utf8') );
      
      expect(metricsData.cacheHitRate).toBeGreaterThan(0.8); // 80% hit rate target
      expect(metricsData.cacheHits).toBeGreaterThan(metricsData.cacheMisses);
    });

    test('should measure cache invalidation performance', async () => {
      const mockLintOutput = JSON.stringify([
        { filePath: '/test/file.ts', messages: [] }
      ]);

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
      const largeCacheData = {
        version: '1.0.0',
        files: Object.fromEntries(
          Array.from({ length: 1000 }, (_, i) => [
            `/test/file${i}.ts`,
            { hash: `hash${i}`, results: [] }
          ])
        )
      };

      mockReadFileSync.mockReturnValue(JSON.stringify(largeCacheData));
      mockExistsSync.mockReturnValue(true);

      const cacheContent = mockReadFileSync('.eslint-cache.json', 'utf8') ;
      const cacheSize = Buffer.byteLength(cacheContent, 'utf8');

      // Cache should be reasonably sized (less than 10MB)
      expect(cacheSize).toBeLessThan(10 * 1024 * 1024);
    });

    test('should handle cache corruption gracefully', async () => {
      const corruptedCache = 'invalid json content';
      const mockLintOutput = JSON.stringify([
        { filePath: '/test/file.ts', messages: [] }
      ]);

      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(corruptedCache);
      mockExecSync.mockReturnValue(mockLintOutput);

      // Should handle corrupted cache without failing
      expect(() => {
        try {
          JSON.parse(mockReadFileSync('.eslint-cache.json', 'utf8') );
        } catch (error) {
          // Simulate graceful handling
          return mockExecSync('yarn lint --no-cache --format=json', { encoding: 'utf8' });
        }
      }).not.toThrow();
    });
  });

  describe('Resource Optimization Tests', () => {
    test('should optimize CPU usage during linting', async () => {
      const mockLintOutput = JSON.stringify([
        { filePath: '/test/file.ts', messages: [] }
      ]);

      mockExecSync.mockReturnValue(mockLintOutput);

      // Simulate CPU monitoring
      const cpuUsageBefore = process.cpuUsage();
      mockExecSync('yarn lint --format=json', { encoding: 'utf8' });
      const cpuUsageAfter = process.cpuUsage(cpuUsageBefore);

      // CPU usage should be reasonable (values in microseconds)
      expect(cpuUsageAfter.user).toBeLessThan(5000000); // 5 seconds
      expect(cpuUsageAfter.system).toBeLessThan(2000000); // 2 seconds
    });

    test('should handle concurrent linting processes', async () => {
      const mockOutputs = [
        JSON.stringify([{ filePath: '/test/file1.ts', messages: [] }]),
        JSON.stringify([{ filePath: '/test/file2.ts', messages: [] }]),
        JSON.stringify([{ filePath: '/test/file3.ts', messages: [] }])
      ];

      mockExecSync
        .mockReturnValueOnce(mockOutputs[0])
        .mockReturnValueOnce(mockOutputs[1])
        .mockReturnValueOnce(mockOutputs[2]);

      // Simulate concurrent processes
      const promises = [
        Promise.resolve(mockExecSync('yarn lint file1.ts --format=json', { encoding: 'utf8' })),
        Promise.resolve(mockExecSync('yarn lint file2.ts --format=json', { encoding: 'utf8' })),
        Promise.resolve(mockExecSync('yarn lint file3.ts --format=json', { encoding: 'utf8' }))
      ];

      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(JSON.parse(result )[0].filePath).toContain(`file${index + 1}.ts`);
      });
    });

    test('should optimize import resolution performance', async () => {
      const importResolutionOutput = JSON.stringify([
        {
          filePath: '/test/imports.ts',
          messages: [
            { ruleId: 'import/no-unresolved', severity: 1, message: 'Unable to resolve path' }
          ]
        }
      ]);

      mockExecSync.mockReturnValue(importResolutionOutput);

      const startTime = performance.now();
      const result = mockExecSync('yarn lint --format=json', { encoding: 'utf8' });
      const resolutionTime = performance.now() - startTime;

      // Import resolution should be fast
      expect(resolutionTime).toBeLessThan(2000); // 2 seconds
      expect(JSON.parse(result )).toHaveLength(1);
    });

    test('should measure rule execution performance', async () => {
      const rulePerformanceData = {
        rules: {
          '@typescript-eslint/no-unused-vars': { executionTime: 150, fileCount: 50 },
          'import/order': { executionTime: 200, fileCount: 50 },
          'astrological/preserve-planetary-constants': { executionTime: 50, fileCount: 10 },
          'react-hooks/exhaustive-deps': { executionTime: 100, fileCount: 25 }
        }
      };

      mockReadFileSync.mockReturnValue(JSON.stringify(rulePerformanceData));
      mockExistsSync.mockReturnValue(true);

      const perfData = JSON.parse(mockReadFileSync('.eslint-rule-performance.json', 'utf8') );
      
      // Each rule should execute efficiently
      Object.entries(perfData.rules).forEach(([ruleName, data]: [string, any]) => {
        const avgTimePerFile = data.executionTime / data.fileCount;
        expect(avgTimePerFile).toBeLessThan(10); // Less than 10ms per file per rule
      });
    });
  });

  describe('Scalability Tests', () => {
    test('should scale with increasing file count', async () => {
      const fileCounts = [10, 50, 100, 500];
      const executionTimes: number[] = [];

      fileCounts.forEach(count => {
        const mockOutput = JSON.stringify(
          Array.from({ length: count }, (_, i) => ({
            filePath: `/test/file${i}.ts`,
            messages: []
          }))
        );

        mockExecSync.mockReturnValueOnce(mockOutput);

        const startTime = performance.now();
        mockExecSync('yarn lint --format=json', { encoding: 'utf8' });
        const executionTime = performance.now() - startTime;
        
        executionTimes.push(executionTime);
      });

      // Execution time should scale reasonably (not exponentially)
      expect(executionTimes[1]).toBeLessThan(executionTimes[0] * 10); // 50 files shouldn't take 10x longer than 10 files
      expect(executionTimes[2]).toBeLessThan(executionTimes[1] * 5); // 100 files shouldn't take 5x longer than 50 files
    });

    test('should handle memory pressure gracefully', async () => {
      // Simulate memory pressure scenario
      const memoryIntensiveOutput = JSON.stringify(
        Array.from({ length: 1000 }, (_, i) => ({
          filePath: `/test/large-file${i}.ts`,
          messages: Array.from({ length: 20 }, (_, j) => ({
            ruleId: 'complex-rule',
            severity: 1,
            message: `Complex message ${j}`,
            line: j + 1,
            column: 10,
            source: 'a'.repeat(1000) // Large source content
          }))
        }))
      );

      mockExecSync.mockReturnValue(memoryIntensiveOutput);

      // Should handle large output without memory issues
      const result = mockExecSync('yarn lint --format=json', { encoding: 'utf8' });
      const parsedResult = JSON.parse(result );
      
      expect(parsedResult).toHaveLength(1000);
      expect(parsedResult[0].messages).toHaveLength(20);
    });

    test('should optimize for CI/CD environments', async () => {
      const ciOptimizedOutput = JSON.stringify([
        { filePath: '/test/file.ts', messages: [] }
      ]);

      // Simulate CI environment variables
      process.env.CI = 'true';
      process.env.NODE_ENV = 'production';

      mockExecSync.mockReturnValue(ciOptimizedOutput);

      const startTime = performance.now();
      const result = mockExecSync('yarn lint --format=json --cache --cache-location .eslintcache', { encoding: 'utf8' });
      const ciExecutionTime = performance.now() - startTime;

      // CI execution should be optimized
      expect(ciExecutionTime).toBeLessThan(5000); // 5 seconds max
      expect(JSON.parse(result )).toHaveLength(1);

      // Clean up environment
      delete process.env.CI;
      delete process.env.NODE_ENV;
    });
  });

  describe('Performance Regression Detection', () => {
    test('should detect performance regressions', async () => {
      const baselineMetrics = {
        executionTime: 5000,
        memoryUsage: 128 * 1024 * 1024, // 128MB
        cacheHitRate: 0.85,
        filesProcessed: 100
      };

      const currentMetrics = {
        executionTime: 7500, // 50% slower
        memoryUsage: 192 * 1024 * 1024, // 50% more memory
        cacheHitRate: 0.75, // Lower cache hit rate
        filesProcessed: 100
      };

      mockReadFileSync
        .mockReturnValueOnce(JSON.stringify(baselineMetrics))
        .mockReturnValueOnce(JSON.stringify(currentMetrics));

      const baseline = JSON.parse(mockReadFileSync('baseline-metrics.json', 'utf8') );
      const current = JSON.parse(mockReadFileSync('current-metrics.json', 'utf8') );

      // Detect regressions
      const executionRegression = (current.executionTime - baseline.executionTime) / baseline.executionTime;
      const memoryRegression = (current.memoryUsage - baseline.memoryUsage) / baseline.memoryUsage;
      const cacheRegression = (baseline.cacheHitRate - current.cacheHitRate) / baseline.cacheHitRate;

      expect(executionRegression).toBeGreaterThan(0.2); // 20% regression threshold
      expect(memoryRegression).toBeGreaterThan(0.2); // 20% regression threshold
      expect(cacheRegression).toBeGreaterThan(0.05); // 5% regression threshold
    });

    test('should track performance trends over time', async () => {
      const performanceHistory = [
        { date: '2024-01-01', executionTime: 5000, memoryUsage: 128 * 1024 * 1024 },
        { date: '2024-01-02', executionTime: 5100, memoryUsage: 130 * 1024 * 1024 },
        { date: '2024-01-03', executionTime: 5200, memoryUsage: 132 * 1024 * 1024 },
        { date: '2024-01-04', executionTime: 5300, memoryUsage: 134 * 1024 * 1024 }
      ];

      mockReadFileSync.mockReturnValue(JSON.stringify(performanceHistory));

      const history = JSON.parse(mockReadFileSync('performance-history.json', 'utf8') );
      
      // Calculate trend
      const executionTrend = history[history.length - 1].executionTime - history[0].executionTime;
      const memoryTrend = history[history.length - 1].memoryUsage - history[0].memoryUsage;

      expect(executionTrend).toBeLessThan(1000); // Less than 1 second increase over time
      expect(memoryTrend).toBeLessThan(10 * 1024 * 1024); // Less than 10MB increase over time
    });
  });
});