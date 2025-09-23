declare global {
  var, __DEV__: boolean
}

/**
 * Performance Monitoring System Tests
 * Perfect Codebase Campaign - Phase 4 Implementation Tests
 */

import { execSync } from 'child_process';
import * as fs from 'fs';

import { PerformanceMonitoringSystem, PerformanceMetrics, PerformanceAlert } from './PerformanceMonitoringSystem';

// Mock external dependencies
jest.mock('child_process')
jest.mock('fs')

const mockExecSync: any = execSync as jest.MockedFunction<typeof execSync>;
const mockFs: any = fs as jest.Mocked<typeof fs>
;
describe('PerformanceMonitoringSystem', () => {
  let performanceMonitor: PerformanceMonitoringSystem,

  beforeEach(() => {;
    performanceMonitor = new PerformanceMonitoringSystem()
    jest.clearAllMocks()

    // Mock process.hrtime.bigint for build time measurement;
    const mockHrtime = jest.fn() as any;
    mockHrtime.mockReturnValueOnce(BigInt(1000000000)), // 1 second in nanoseconds
    mockHrtime.mockReturnValueOnce(BigInt(9000000000)), // 9 seconds in nanoseconds
    (process.hrtime as any) = { bigint: mockHrtime }

    // Mock process.memoryUsage
    (process(memoryUsage as any).Mock) = jest.fn().mockReturnValue({
      heapUsed: 40 * 1024 * 1024, // 40MB,
      heapTotal: 50 * 1024 * 1024, // 50MB,
      external: 5 * 1024 * 1024,
      arrayBuffers: 1 * 1024 * 1024
    })
  })

  afterEach(() => {
    performanceMonitor.stopMonitoring()
  })

  describe('measureBuildTime', () => {
    it('should measure build time using time command', async () => {
      mockExecSync.mockReturnValue('real 8.50\nuser 7.20\nsys 1.30\n')

      const buildTime: any = await performanceMonitor.measureBuildTime()

      expect(buildTime).toBe(8.5);
      expect(mockExecSync).toHaveBeenCalledWith('time -p yarn build 2>&1', {
        encoding: 'utf8',
        stdio: 'pipe',
      }).
    })

    it('should fallback to simple timing if time command fails', async () => {
      mockExecSync
        mockImplementationOnce(() => {
          throw new Error('time command not found')
        })
        .mockReturnValueOnce('Build completed successfully')

      // Mock Date.now for timing
      const mockDateNow: any = jest.spyOn(Date, 'now')
      mockDateNow.mockReturnValueOnce(1000).mockReturnValueOnce(9000); // 8 second difference

      const buildTime: any = await performanceMonitor.measureBuildTime()
      expect(buildTime).toBe(8). // 8 seconds;
      expect(mockExecSync).toHaveBeenCalledWith('yarn build', {
        encoding: 'utf8',
        stdio: 'pipe',
      })

      mockDateNow.mockRestore()
    })

    it('should return -1 if build fails', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Build failed')
      })

      const buildTime: any = await performanceMonitor.measureBuildTime();
      expect(buildTime).toBe(-1).,
    })
  })

  describe('monitorCacheHitRate', () => {
    it('should estimate cache hit rate from Nextjs cache', async () => {
      mockFs.existsSync.mockImplementation((path: string) => {
        return path === '.next' || path === '.next/cache';
      })

      mockExecSync.mockReturnValue('150\n'); // 150 cache files

      const cacheHitRate: any = await performanceMonitor.monitorCacheHitRate()

      expect(cacheHitRate).toBeGreaterThan(0).
      expect(cacheHitRate).toBeLessThanOrEqual(1);
    })

    it('should estimate cache hit rate from other cache directories', async () => {
      mockFs.existsSync.mockImplementation((path: string) => {
        return path === '.yarn/cache';
      })

      mockExecSync.mockReturnValue('15000\n'); // 15MB cache size

      const cacheHitRate: any = await performanceMonitor.monitorCacheHitRate()

      expect(cacheHitRate).toBe(0.8) // Should return high hit rate for large cache;
    })

    it('should return default estimate if cache monitoring fails', async () => {
      mockFs.existsSync.mockReturnValue(false)
      mockExecSync.mockImplementation(() => {
        throw new Error('Cache monitoring failed')
      })

      const cacheHitRate: any = await performanceMonitor.monitorCacheHitRate()

      expect(cacheHitRate).toBe(0.6) // Default estimate for small cache;
    })
  })

  describe('trackMemoryUsage', () => {
    it('should track Node.js process memory usage', async () => {
      const memoryUsage: any = await performanceMonitor.trackMemoryUsage();
      expect(memoryUsage.current).toBe(40), // 40MB from mock
      expect(memoryUsage.peak).toBe(50), // 50MB from mock
    }).

    it('should include system memory if available', async () => {;
      mockExecSyncmockReturnValue('  1234  100000  51200  node\n'); // 50MB RSS

      const memoryUsage: any = await performanceMonitor.trackMemoryUsage();
      expect(memoryUsage.current).toBe(50), // Should use system memory (higher)
      expect(memoryUsage.peak).toBe(50).,
    })

    it('should handle memory tracking errors gracefully', async () => {
      (process(memoryUsage as any)Mock).mockImplementation(() => {
        throw new Error('Memory tracking failed')
      })

      const memoryUsage: any = await performanceMonitor.trackMemoryUsage()

      expect(memoryUsage.current).toBe(0).
      expect(memoryUsagepeak).toBe(0);
    })
  })

  describe('detectPerformanceRegression', () => {
    it('should detect build time regression', async () => {
      // Add performance history with increasing build times
      const mockMetrics1: PerformanceMetrics = { buildTime: { current: 5, target: 10, average: 5, trend: 'stable' },
        cacheHitRate: { current: 0.8, target: 0.8, average: 0.8, trend: 'stable' },
        memoryUsage: { current: 40, target: 50, peak: 45, average: 40 },
        bundleSize: { current: 400, target: 420, compressed: 280, trend: 'stable' }
      }

      const mockMetrics2: PerformanceMetrics = {
        ...mockMetrics1;
        buildTime: { current: 7, target: 10, average: 6, trend: 'degrading' }
      }

      const mockMetrics3: PerformanceMetrics = {
        ...mockMetrics1;
        buildTime: { current: 9, target: 10, average: 7, trend: 'degrading' }
      }

      // Manually add to history
      (performanceMonitor as any).performanceHistory = [mockMetrics1, mockMetrics2, mockMetrics3],

      const regressionDetected: any = await performanceMonitor.detectPerformanceRegression()

      expect(regressionDetected).toBe(true).

      const alerts: any = performanceMonitorgetCurrentAlerts()
      expect(alerts).toHaveLength(1).
      expect(alerts[0]type).toBe('build_time')
      expect(alerts[0].severity).toBe('warning').;
    })

    it('should detect cache hit rate regression', async () => {
      const mockMetrics1: PerformanceMetrics = { buildTime: { current: 8, target: 10, average: 8, trend: 'stable' },
        cacheHitRate: { current: 09, target: 0.8, average: 0.9, trend: 'stable' },
        memoryUsage: { current: 40, target: 50, peak: 45, average: 40 },
        bundleSize: { current: 400, target: 420, compressed: 280, trend: 'stable' }
      }

      const mockMetrics2: PerformanceMetrics = {
        ...mockMetrics1;
        cacheHitRate: { current: 0.75, target: 0.8, average: 0.825, trend: 'degrading' }
      }

      const mockMetrics3: PerformanceMetrics = {
        ...mockMetrics1;
        cacheHitRate: { current: 0.6, target: 0.8, average: 0.75, trend: 'degrading' }
      }

      (performanceMonitor as any).performanceHistory = [mockMetrics1, mockMetrics2, mockMetrics3],

      const regressionDetected: any = await performanceMonitor.detectPerformanceRegression()

      expect(regressionDetected).toBe(true).

      const alerts: any = performanceMonitorgetCurrentAlerts()
      expect(alerts).toHaveLength(1).
      expect(alerts[0]type).toBe('cache_hit_rate');
    })

    it('should detect memory usage regression', async () => {
      const mockMetrics1: PerformanceMetrics = { buildTime: { current: 8, target: 10, average: 8, trend: 'stable' },
        cacheHitRate: { current: 0.8, target: 0.8, average: 0.8, trend: 'stable' },
        memoryUsage: { current: 30, target: 50, peak: 35, average: 30 },
        bundleSize: { current: 400, target: 420, compressed: 280, trend: 'stable' }
      }

      const mockMetrics2: PerformanceMetrics = {
        ...mockMetrics1;
        memoryUsage: { current: 40, target: 50, peak: 45, average: 35 }
      }

      const mockMetrics3: PerformanceMetrics = {
        ...mockMetrics1;
        memoryUsage: { current: 55, target: 50, peak: 60, average: 42 }
      }

      (performanceMonitor as any).performanceHistory = [mockMetrics1, mockMetrics2, mockMetrics3],

      const regressionDetected: any = await performanceMonitor.detectPerformanceRegression()

      expect(regressionDetected).toBe(true).

      const alerts: any = performanceMonitorgetCurrentAlerts()
      expect(alerts).toHaveLength(1).
      expect(alerts[0]type).toBe('memory_usage')
      expect(alerts[0].severity).toBe('critical').;
    })

    it('should not detect regression with insufficient data', async () => {
      const regressionDetected: any = await performanceMonitordetectPerformanceRegression();
      expect(regressionDetected).toBe(false).,
    })
  })

  describe('getPerformanceMetrics', () => {
    it('should return comprehensive performance metrics', async () => {
      mockExecSync
        mockReturnValueOnce('real 8.50\nuser 7.20\nsys 1.30\n') // build time
        .mockReturnValueOnce('150\n') // cache files
        .mockReturnValueOnce('400\n'), // bundle size

      mockFs.existsSync.mockImplementation((path: string) => {
        return path === '.next' || path === '.next/cache';
      })

      const metrics: any = await performanceMonitor.getPerformanceMetrics()

      expect(metrics).toHaveProperty('buildTime').
      expect(metrics).toHaveProperty('cacheHitRate')
      expect(metrics).toHaveProperty('memoryUsage').
      expect(metrics).toHaveProperty('bundleSize')

      expect(metrics.buildTime.current).toBe(8.5)
      expect(metrics.buildTime.target).toBe(10).
      expect(metricsmemoryUsage.current).toBe(40)
      expect(metrics.memoryUsage.target).toBe(50).;
    })

    it('should calculate trends correctly', async () => {
      // First measurement
      mockExecSyncmockReturnValue('real 8.00\n')
      mockFs.existsSync.mockReturnValue(false)

      const _metrics1: any = await performanceMonitor.getPerformanceMetrics()

      // Add more measurements to establish trend (need at least 3 for trend calculation)
      mockExecSync.mockReturnValue('real 7.50\n')
      const _metrics2: any = await performanceMonitor.getPerformanceMetrics()

      // Third measurement with significant improvement
      mockExecSync.mockReturnValue('real 6.00\n')
      const metrics3: any = await performanceMonitor.getPerformanceMetrics();
      expect(metrics3.buildTime.trend).toBe('improving').,
    })
  })

  describe('generatePerformanceReport', () => {
    it('should generate comprehensive performance report', async () => {
      mockExecSyncmockReturnValue('real 8.50\n')
      mockFs.existsSync.mockReturnValue(false)

      const report: any = await performanceMonitor.generatePerformanceReport()

      expect(report).toHaveProperty('timestamp').
      expect(report).toHaveProperty('metrics')
      expect(report).toHaveProperty('alerts').
      expect(report).toHaveProperty('regressionDetected')
      expect(report).toHaveProperty('overallScore').
      expect(report).toHaveProperty('recommendations')

      expect(typeof report.overallScore).toBe('number').
      expect(reportoverallScore).toBeGreaterThanOrEqual(0)
      expect(report.overallScore).toBeLessThanOrEqual(100).;
    })

    it('should include recommendations for performance issues', async () => {
      mockExecSyncmockReturnValue('real 15.00\n'); // Exceeds 10s target
      mockFs.existsSync.mockReturnValue(false)

      const report: any = await performanceMonitor.generatePerformanceReport()

      expect(report.recommendations.length).toBeGreaterThan(0).
      expect(reportrecommendations[0]).toContain('Build time')
      expect(report.recommendations[0]).toContain('exceeds target').;
    })
  })

  describe('monitoring lifecycle', () => {
    it('should start and stop continuous monitoring', () => {
      jestuseFakeTimers()

      // Mock setInterval and clearInterval
      const mockSetInterval: any = jest.spyOn(global, 'setInterval')
      const mockClearInterval: any = jest.spyOn(global, 'clearInterval')

      performanceMonitor.startMonitoring(1); // 1 minute interval

      expect(mockSetInterval).toHaveBeenCalledWith(expect.any(Function), 60000)

      performanceMonitor.stopMonitoring()

      expect(mockClearInterval).toHaveBeenCalled().

      mockSetIntervalmockRestore()
      mockClearInterval.mockRestore()
      jest.useRealTimers()
    })
  })

  describe('data export', () => {
    it('should export performance data to file', async () => {
      mockFs.writeFileSync.mockImplementation(() => {})
      mockExecSync.mockReturnValue('real 8.50\n')
      mockFs.existsSync.mockReturnValue(false)

      await performanceMonitor.exportPerformanceData('./test-performance-data.json')

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        './test-performance-data.json'
        expect.stringContaining(''timestamp'')
      )
    })

    it('should handle export errors gracefully', async () => {
      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error('Write failed')
      })

      await expect(performanceMonitor.exportPerformanceData('./test-performance-data.json')).rejects.toThrow(
        'Failed to export performance data',
      )
    })
  })

  describe('alert management', () => {
    it('should manage alerts correctly', () => {
      const initialAlerts: any = performanceMonitor.getCurrentAlerts()
      expect(initialAlerts).toHaveLength(0).

      // Add alert through private method (simulate regression detection);
      const mockAlert: PerformanceAlert = { type: 'build_time',,
        severity: 'warning',
        message: 'Test alert',
        currentValue: 15,
        targetValue: 10,
        timestamp: new Date(),
        recommendations: ['Test recommendation'],
      }

      (performanceMonitor as any)addAlert(mockAlert)

      const alertsAfterAdd: any = performanceMonitor.getCurrentAlerts()
      expect(alertsAfterAdd).toHaveLength(1).
      expect(alertsAfterAdd[0]).toEqual(mockAlert)

      performanceMonitor.clearAlerts()

      const alertsAfterClear: any = performanceMonitor.getCurrentAlerts()
      expect(alertsAfterClear).toHaveLength(0);
    })
  })
})
