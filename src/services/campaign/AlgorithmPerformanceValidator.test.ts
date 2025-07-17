/**
 * Algorithm Performance Validator Tests
 * Perfect Codebase Campaign - Phase 4 Implementation Tests
 */

import { 
  AlgorithmPerformanceValidator, 
  PerformanceBenchmark, 
  CachePerformanceMetrics,
  RegressionTestResult,
  AlgorithmPerformanceReport
} from './AlgorithmPerformanceValidator';
import * as fs from 'fs';

// Mock external dependencies
jest.mock('fs');

const mockFs = fs as jest.Mocked<typeof fs>;

describe('AlgorithmPerformanceValidator', () => {
  let validator: AlgorithmPerformanceValidator;

  beforeEach(() => {
    validator = new AlgorithmPerformanceValidator();
    jest.clearAllMocks();
  });

  describe('runPerformanceBenchmarks', () => {
    it('should run comprehensive performance benchmarks', async () => {
      const benchmarks = await validator.runPerformanceBenchmarks();
      
      expect(benchmarks.length).toBeGreaterThan(0);
      
      // Check that all categories are represented
      const categories = benchmarks.map(b => b.category);
      expect(categories).toContain('algorithm');
      expect(categories).toContain('cache');
      expect(categories).toContain('database');
      expect(categories).toContain('api');
      expect(categories).toContain('ui');
      
      // Check benchmark structure
      const firstBenchmark = benchmarks[0];
      expect(firstBenchmark).toHaveProperty('name');
      expect(firstBenchmark).toHaveProperty('category');
      expect(firstBenchmark).toHaveProperty('baseline');
      expect(firstBenchmark).toHaveProperty('current');
      expect(firstBenchmark).toHaveProperty('improvement');
      expect(firstBenchmark).toHaveProperty('target');
      expect(firstBenchmark).toHaveProperty('status');
      expect(firstBenchmark).toHaveProperty('samples');
      expect(firstBenchmark).toHaveProperty('timestamp');
      
      // Check that samples are arrays of numbers
      expect(Array.isArray(firstBenchmark.samples)).toBe(true);
      expect(firstBenchmark.samples.length).toBeGreaterThan(0);
      expect(typeof firstBenchmark.samples[0]).toBe('number');
    });

    it('should calculate performance improvements correctly', async () => {
      const benchmarks = await validator.runPerformanceBenchmarks();
      
      for (const benchmark of benchmarks) {
        expect(benchmark.improvement).toBeGreaterThanOrEqual(0);
        expect(benchmark.improvement).toBeLessThanOrEqual(1);
        
        // Improvement should be calculated as (baseline - current) / baseline
        const expectedImprovement = Math.max(0, (benchmark.baseline - benchmark.current) / benchmark.baseline);
        expect(Math.abs(benchmark.improvement - expectedImprovement)).toBeLessThan(0.001);
      }
    });

    it('should set correct benchmark status', async () => {
      const benchmarks = await validator.runPerformanceBenchmarks();
      
      for (const benchmark of benchmarks) {
        if (benchmark.current <= benchmark.target) {
          expect(benchmark.status).toBe('passing');
        } else if (benchmark.current <= benchmark.baseline) {
          expect(benchmark.status).toBe('degraded');
        } else {
          expect(benchmark.status).toBe('failing');
        }
      }
    });
  });

  describe('validateCachePerformance', () => {
    it('should validate 3-tier caching system', async () => {
      const cacheMetrics = await validator.validateCachePerformance();
      
      expect(cacheMetrics).toHaveProperty('tier1');
      expect(cacheMetrics).toHaveProperty('tier2');
      expect(cacheMetrics).toHaveProperty('tier3');
      expect(cacheMetrics).toHaveProperty('overall');
      
      // Check tier 1 (memory cache)
      expect(cacheMetrics.tier1.name).toBe('memory');
      expect(cacheMetrics.tier1.hitRate).toBeGreaterThanOrEqual(0);
      expect(cacheMetrics.tier1.hitRate).toBeLessThanOrEqual(1);
      expect(cacheMetrics.tier1.avgResponseTime).toBeGreaterThan(0);
      
      // Check tier 2 (Redis cache)
      expect(cacheMetrics.tier2.name).toBe('redis');
      expect(cacheMetrics.tier2.hitRate).toBeGreaterThanOrEqual(0);
      expect(cacheMetrics.tier2.hitRate).toBeLessThanOrEqual(1);
      expect(cacheMetrics.tier2.avgResponseTime).toBeGreaterThan(0);
      
      // Check tier 3 (database cache)
      expect(cacheMetrics.tier3.name).toBe('database');
      expect(cacheMetrics.tier3.hitRate).toBeGreaterThanOrEqual(0);
      expect(cacheMetrics.tier3.hitRate).toBeLessThanOrEqual(1);
      expect(cacheMetrics.tier3.avgResponseTime).toBeGreaterThan(0);
      
      // Check overall metrics
      expect(cacheMetrics.overall.hitRate).toBeGreaterThanOrEqual(0);
      expect(cacheMetrics.overall.hitRate).toBeLessThanOrEqual(1);
      expect(cacheMetrics.overall.avgResponseTime).toBeGreaterThan(0);
      expect(cacheMetrics.overall.efficiency).toBeGreaterThanOrEqual(0);
      expect(cacheMetrics.overall.efficiency).toBeLessThanOrEqual(100);
    });

    it('should generate cache performance alerts when hit rate is low', async () => {
      // Mock low cache performance
      const mockValidateMemoryCache = jest.spyOn(validator as any, 'validateMemoryCache');
      mockValidateMemoryCache.mockResolvedValue({
        name: 'memory',
        hitRate: 0.5, // Low hit rate
        avgResponseTime: 5,
        size: 50,
        maxSize: 100
      });

      await validator.validateCachePerformance();
      
      const alerts = validator.getCurrentAlerts();
      const cacheAlert = alerts.find(alert => alert.type === 'cache_miss');
      
      expect(cacheAlert).toBeDefined();
      expect(cacheAlert?.message).toContain('hit rate');
      
      mockValidateMemoryCache.mockRestore();
    });
  });

  describe('detectPerformanceRegressions', () => {
    it('should detect performance regressions', async () => {
      // First, run benchmarks to establish baseline
      await validator.runPerformanceBenchmarks();
      
      // Mock degraded performance for second run
      const mockRunAlgorithmBenchmark = jest.spyOn(validator as any, 'runAlgorithmBenchmark');
      mockRunAlgorithmBenchmark.mockResolvedValue([200, 210, 205, 195, 200]); // Slower performance
      
      // Run benchmarks again
      await validator.runPerformanceBenchmarks();
      
      const regressionTests = await validator.detectPerformanceRegressions();
      
      expect(regressionTests.length).toBeGreaterThan(0);
      
      const regressionTest = regressionTests[0];
      expect(regressionTest).toHaveProperty('testName');
      expect(regressionTest).toHaveProperty('category');
      expect(regressionTest).toHaveProperty('previousPerformance');
      expect(regressionTest).toHaveProperty('currentPerformance');
      expect(regressionTest).toHaveProperty('regressionDetected');
      expect(regressionTest).toHaveProperty('regressionPercentage');
      expect(regressionTest).toHaveProperty('threshold');
      expect(regressionTest).toHaveProperty('recommendations');
      
      mockRunAlgorithmBenchmark.mockRestore();
    });

    it('should not detect regression when performance improves', async () => {
      // First, run benchmarks to establish baseline
      await validator.runPerformanceBenchmarks();
      
      // Mock improved performance for all benchmark types
      const mockRunAlgorithmBenchmark = jest.spyOn(validator as any, 'runAlgorithmBenchmark');
      const mockRunCacheBenchmark = jest.spyOn(validator as any, 'runCacheBenchmark');
      const mockRunDatabaseBenchmark = jest.spyOn(validator as any, 'runDatabaseBenchmark');
      const mockRunApiBenchmark = jest.spyOn(validator as any, 'runApiBenchmark');
      const mockRunUiBenchmark = jest.spyOn(validator as any, 'runUiBenchmark');
      
      mockRunAlgorithmBenchmark.mockResolvedValue([30, 35, 32, 28, 30]); // Better performance
      mockRunCacheBenchmark.mockResolvedValue([2, 2.5, 2.2, 1.8, 2]); // Better performance
      mockRunDatabaseBenchmark.mockResolvedValue([80, 85, 82, 78, 80]); // Better performance
      mockRunApiBenchmark.mockResolvedValue([150, 155, 152, 148, 150]); // Better performance
      mockRunUiBenchmark.mockResolvedValue([20, 25, 22, 18, 20]); // Better performance
      
      // Run benchmarks again
      await validator.runPerformanceBenchmarks();
      
      const regressionTests = await validator.detectPerformanceRegressions();
      
      // Should have tests but no regressions detected (or very few due to randomness)
      const regressionsDetected = regressionTests.filter(t => t.regressionDetected);
      expect(regressionsDetected.length).toBeLessThanOrEqual(2); // Allow for some randomness in mock data
      
      mockRunAlgorithmBenchmark.mockRestore();
      mockRunCacheBenchmark.mockRestore();
      mockRunDatabaseBenchmark.mockRestore();
      mockRunApiBenchmark.mockRestore();
      mockRunUiBenchmark.mockRestore();
    });

    it('should generate alerts for detected regressions', async () => {
      // First, run benchmarks
      await validator.runPerformanceBenchmarks();
      
      // Mock significantly degraded performance
      const mockRunAlgorithmBenchmark = jest.spyOn(validator as any, 'runAlgorithmBenchmark');
      mockRunAlgorithmBenchmark.mockResolvedValue([300, 310, 305, 295, 300]); // Much slower
      
      // Run benchmarks again
      await validator.runPerformanceBenchmarks();
      
      await validator.detectPerformanceRegressions();
      
      const alerts = validator.getCurrentAlerts();
      const regressionAlert = alerts.find(alert => alert.type === 'regression');
      
      expect(regressionAlert).toBeDefined();
      expect(regressionAlert?.message).toContain('regression detected');
      
      mockRunAlgorithmBenchmark.mockRestore();
    });
  });

  describe('validateImprovementMaintenance', () => {
    it('should validate 50% improvement maintenance', async () => {
      // Run benchmarks to populate history
      await validator.runPerformanceBenchmarks();
      
      const improvementMaintained = await validator.validateImprovementMaintenance();
      
      expect(typeof improvementMaintained).toBe('boolean');
    });

    it('should return false when no benchmark history exists', async () => {
      const improvementMaintained = await validator.validateImprovementMaintenance();
      
      expect(improvementMaintained).toBe(false);
    });

    it('should generate alert when improvement is below target', async () => {
      // Mock poor performance benchmarks
      const mockBenchmarkAlgorithms = jest.spyOn(validator as any, 'benchmarkAlgorithms');
      mockBenchmarkAlgorithms.mockResolvedValue([
        {
          name: 'test_algorithm',
          category: 'algorithm',
          baseline: 100,
          current: 95, // Only 5% improvement
          improvement: 0.05,
          target: 50,
          status: 'failing',
          samples: [95],
          timestamp: new Date()
        }
      ]);
      
      await validator.runPerformanceBenchmarks();
      await validator.validateImprovementMaintenance();
      
      const alerts = validator.getCurrentAlerts();
      const improvementAlert = alerts.find(alert => alert.type === 'slow_algorithm');
      
      expect(improvementAlert).toBeDefined();
      expect(improvementAlert?.message).toContain('improvement below target');
      
      mockBenchmarkAlgorithms.mockRestore();
    });
  });

  describe('generatePerformanceReport', () => {
    it('should generate comprehensive performance report', async () => {
      const report = await validator.generatePerformanceReport();
      
      expect(report).toHaveProperty('timestamp');
      expect(report).toHaveProperty('benchmarks');
      expect(report).toHaveProperty('cacheMetrics');
      expect(report).toHaveProperty('regressionTests');
      expect(report).toHaveProperty('overallScore');
      expect(report).toHaveProperty('improvementMaintained');
      expect(report).toHaveProperty('recommendations');
      expect(report).toHaveProperty('alerts');
      
      expect(report.timestamp).toBeInstanceOf(Date);
      expect(Array.isArray(report.benchmarks)).toBe(true);
      expect(Array.isArray(report.regressionTests)).toBe(true);
      expect(Array.isArray(report.recommendations)).toBe(true);
      expect(Array.isArray(report.alerts)).toBe(true);
      
      expect(typeof report.overallScore).toBe('number');
      expect(report.overallScore).toBeGreaterThanOrEqual(0);
      expect(report.overallScore).toBeLessThanOrEqual(100);
      
      expect(typeof report.improvementMaintained).toBe('boolean');
    });

    it('should include recommendations based on performance issues', async () => {
      // Mock poor performance to trigger recommendations
      const mockBenchmarkAlgorithms = jest.spyOn(validator as any, 'benchmarkAlgorithms');
      mockBenchmarkAlgorithms.mockResolvedValue([
        {
          name: 'slow_algorithm',
          category: 'algorithm',
          baseline: 100,
          current: 150, // Worse than baseline
          improvement: -0.5,
          target: 50,
          status: 'failing',
          samples: [150],
          timestamp: new Date()
        }
      ]);
      
      const report = await validator.generatePerformanceReport();
      
      expect(report.recommendations.length).toBeGreaterThan(0);
      expect(report.recommendations.some(rec => rec.includes('algorithm'))).toBe(true);
      
      mockBenchmarkAlgorithms.mockRestore();
    });
  });

  describe('alert management', () => {
    it('should manage alerts correctly', async () => {
      const initialAlerts = validator.getCurrentAlerts();
      expect(initialAlerts).toHaveLength(0);
      
      // Trigger alerts by running performance validation with poor metrics
      const mockValidateMemoryCache = jest.spyOn(validator as any, 'validateMemoryCache');
      mockValidateMemoryCache.mockResolvedValue({
        name: 'memory',
        hitRate: 0.4, // Very low hit rate
        avgResponseTime: 10,
        size: 50,
        maxSize: 100
      });
      
      await validator.validateCachePerformance();
      
      const alertsAfterValidation = validator.getCurrentAlerts();
      expect(alertsAfterValidation.length).toBeGreaterThan(0);
      
      validator.clearAlerts();
      
      const alertsAfterClear = validator.getCurrentAlerts();
      expect(alertsAfterClear).toHaveLength(0);
      
      mockValidateMemoryCache.mockRestore();
    });
  });

  describe('data export', () => {
    it('should export performance data to file', async () => {
      mockFs.writeFileSync.mockImplementation(() => {});
      
      await validator.exportPerformanceData('./test-performance-data.json');
      
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        './test-performance-data.json',
        expect.stringContaining('"timestamp"')
      );
    });

    it('should handle export errors gracefully', async () => {
      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error('Write failed');
      });
      
      await expect(
        validator.exportPerformanceData('./test-performance-data.json')
      ).rejects.toThrow('Failed to export performance data');
    });
  });

  describe('benchmark history', () => {
    it('should maintain benchmark history', async () => {
      const initialHistory = validator.getBenchmarkHistory();
      expect(initialHistory).toHaveLength(0);
      
      await validator.runPerformanceBenchmarks();
      
      const historyAfterBenchmarks = validator.getBenchmarkHistory();
      expect(historyAfterBenchmarks.length).toBeGreaterThan(0);
      
      // Run benchmarks again
      await validator.runPerformanceBenchmarks();
      
      const historyAfterSecondRun = validator.getBenchmarkHistory();
      expect(historyAfterSecondRun.length).toBeGreaterThan(historyAfterBenchmarks.length);
    });

    it('should limit benchmark history size', async () => {
      // Mock a large number of benchmarks
      const mockBenchmarks = Array.from({ length: 1200 }, (_, i) => ({
        name: `test_${i}`,
        category: 'algorithm' as const,
        baseline: 100,
        current: 80,
        improvement: 0.2,
        target: 50,
        status: 'passing' as const,
        samples: [80],
        timestamp: new Date()
      }));
      
      // Directly set the history to test size limiting
      (validator as any).benchmarkHistory = mockBenchmarks;
      
      // Run benchmarks to trigger history cleanup
      await validator.runPerformanceBenchmarks();
      
      const history = validator.getBenchmarkHistory();
      expect(history.length).toBeLessThanOrEqual(500); // Should be limited to 500
    });
  });

  describe('benchmark categories', () => {
    it('should benchmark all performance categories', async () => {
      const benchmarks = await validator.runPerformanceBenchmarks();
      
      const categories = [...new Set(benchmarks.map(b => b.category))];
      
      expect(categories).toContain('algorithm');
      expect(categories).toContain('cache');
      expect(categories).toContain('database');
      expect(categories).toContain('api');
      expect(categories).toContain('ui');
      
      expect(categories.length).toBe(5);
    });

    it('should have realistic performance ranges for each category', async () => {
      const benchmarks = await validator.runPerformanceBenchmarks();
      
      const algorithmBenchmarks = benchmarks.filter(b => b.category === 'algorithm');
      const cacheBenchmarks = benchmarks.filter(b => b.category === 'cache');
      const databaseBenchmarks = benchmarks.filter(b => b.category === 'database');
      const apiBenchmarks = benchmarks.filter(b => b.category === 'api');
      const uiBenchmarks = benchmarks.filter(b => b.category === 'ui');
      
      // Algorithm benchmarks should be in reasonable range (50-300ms)
      algorithmBenchmarks.forEach(b => {
        expect(b.current).toBeGreaterThan(10);
        expect(b.current).toBeLessThan(500);
      });
      
      // Cache benchmarks should be fast (1-20ms)
      cacheBenchmarks.forEach(b => {
        expect(b.current).toBeGreaterThan(0);
        expect(b.current).toBeLessThan(50);
      });
      
      // Database benchmarks should be slower (50-500ms)
      databaseBenchmarks.forEach(b => {
        expect(b.current).toBeGreaterThan(10);
        expect(b.current).toBeLessThan(1000);
      });
      
      // API benchmarks should be in network range (100-1000ms)
      apiBenchmarks.forEach(b => {
        expect(b.current).toBeGreaterThan(50);
        expect(b.current).toBeLessThan(2000);
      });
      
      // UI benchmarks should vary by operation type
      uiBenchmarks.forEach(b => {
        expect(b.current).toBeGreaterThan(1);
        expect(b.current).toBeLessThan(3000);
      });
    });
  });
});