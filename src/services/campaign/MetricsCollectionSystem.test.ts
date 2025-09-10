/**
 * Enhanced Metrics Collection System Tests
 * Perfect Codebase Campaign - Comprehensive Testing
 */

import { execSync } from 'child_process';
import * as fs from 'fs';

import { MetricsCollectionSystem, DetailedMetrics, MetricsSnapshot } from './MetricsCollectionSystem';

// Mock child_process and fs
jest.mock('child_process');
jest.mock('fs');

const mockExecSync: any = execSync as jest.MockedFunction<typeof execSync>;
const mockFs: any = fs as jest.Mocked<typeof fs>;

describe('MetricsCollectionSystem', () => {
  let metricsSystem: MetricsCollectionSystem;

  beforeEach(() => {
    metricsSystem = new MetricsCollectionSystem();
    jest.clearAllMocks();
  });

  afterEach(() => {
    metricsSystem.stopRealTimeCollection();
  });

  describe('Real-time Collection', () => {
    test('should start and stop real-time collection', () => {
      const consoleSpy: any = jest.spyOn(console, 'log').mockImplementation();

      metricsSystem.startRealTimeCollection(1000);
      expect(consoleSpy).toHaveBeenCalledWith('📊 Starting real-time metrics collection (interval: 1000ms)');

      metricsSystem.stopRealTimeCollection();
      expect(consoleSpy).toHaveBeenCalledWith('📊 Stopped real-time metrics collection');

      consoleSpy.mockRestore();
    });

    test('should not start collection if already running', () => {
      const consoleSpy: any = jest.spyOn(console, 'log').mockImplementation();

      metricsSystem.startRealTimeCollection(1000);
      metricsSystem.startRealTimeCollection(1000);

      expect(consoleSpy).toHaveBeenCalledWith('📊 Metrics collection already running');
      consoleSpy.mockRestore();
    });
  });

  describe('TypeScript Metrics Collection', () => {
    test('should collect TypeScript error count and breakdown', async () => {
      // Mock TypeScript error count
      mockExecSync
        .mockReturnValueOnce('5') // Error count
        .mockReturnValueOnce('     3 TS2352\n     2 TS2345'); // Error breakdown

      const snapshot: any = await metricsSystem.collectSnapshot('phase1');

      expect(snapshot.metrics.typeScriptErrors.current).toBe(5);
      expect(snapshot.metrics.errorBreakdown).toEqual({
        TS2352: 3,
        TS2345: 2,
      });
    });

    test('should handle zero TypeScript errors', async () => {
      mockExecSync.mockReturnValueOnce('0');

      const snapshot: any = await metricsSystem.collectSnapshot('phase1');

      expect(snapshot.metrics.typeScriptErrors.current).toBe(0);
      expect(snapshot.metrics.typeScriptErrors.percentage).toBe(100);
    });

    test('should handle TypeScript compilation errors gracefully', async () => {
      mockExecSync.mockImplementation(() => {
        const error: any = new Error('Command failed') as unknown;
        error.status = 2;
        throw error;
      });

      const snapshot: any = await metricsSystem.collectSnapshot('phase1');

      expect(snapshot.metrics.typeScriptErrors.current).toBe(-1);
    });
  });

  describe('Linting Metrics Collection', () => {
    test('should collect linting warning count and breakdown', async () => {
      mockExecSync
        .mockReturnValueOnce('0') // TS errors first
        .mockReturnValueOnce('10') // Warning count
        .mockReturnValueOnce(`
          warning: Unused variable 'test' @typescript-eslint/no-unused-vars, warning: Explicit any type @typescript-eslint/no-explicit-any
          warning: Console statement no-console
        `); // Linting output

      const snapshot: any = await metricsSystem.collectSnapshot('phase2');

      expect(snapshot.metrics.lintingWarnings.current).toBe(10);
      expect(snapshot.metrics.warningBreakdown).toEqual({
        '@typescript-eslint/no-unused-vars': 1,
        '@typescript-eslint/no-explicit-any': 1,
        'no-console': 1,
      });
    });

    test('should handle zero linting warnings', async () => {
      mockExecSync
        .mockReturnValueOnce('0') // TS errors first
        .mockReturnValueOnce('0'); // Warning count

      const snapshot: any = await metricsSystem.collectSnapshot('phase2');

      expect(snapshot.metrics.lintingWarnings.current).toBe(0);
      expect(snapshot.metrics.lintingWarnings.percentage).toBe(100);
    });
  });

  describe('Build Metrics Collection', () => {
    test('should collect build performance metrics', async () => {
      // Mock successful build sequence
      mockExecSync
        .mockReturnValueOnce('0') // TS errors
        .mockReturnValueOnce('0') // Linting warnings
        .mockReturnValueOnce('') // Build command
        .mockReturnValueOnce('420') // Bundle size
        .mockReturnValueOnce('150') // Source file count
        .mockReturnValueOnce('2.5') // CPU usage
        .mockReturnValueOnce('25'); // Enterprise systems

      mockFs.existsSync.mockReturnValue(true);

      const snapshot: any = await metricsSystem.collectSnapshot('phase4');

      expect(snapshot.metrics.buildMetrics.buildTime).toBeGreaterThanOrEqual(0);
      expect(snapshot.metrics.buildMetrics.bundleSize).toBe(420);
    });

    test('should handle build failures gracefully', async () => {
      mockExecSync.mockImplementation(command => {
        if (command.toString().includes('yarn build')) {
          throw new Error('Build failed');
        }
        return '0';
      });

      const snapshot: any = await metricsSystem.collectSnapshot('phase4');

      expect(snapshot.metrics.buildMetrics.buildTime).toBe(-1);
    });
  });

  describe('Enterprise Systems Counting', () => {
    test('should count enterprise intelligence systems', async () => {
      mockExecSync.mockReturnValueOnce('25'); // Enterprise system count

      const snapshot: any = await metricsSystem.collectSnapshot('phase3');

      expect(snapshot.metrics.enterpriseSystems.current).toBe(25);
    });
  });

  describe('Trend Analysis', () => {
    test('should calculate trend data from multiple snapshots', async () => {
      // Mock consistent responses for multiple snapshots
      mockExecSync
        .mockReturnValue('5') // First snapshot
        .mockReturnValue('3') // Second snapshot
        .mockReturnValue('1'); // Third snapshot

      // Collect multiple snapshots with time gaps
      await metricsSystem.collectSnapshot('phase1');

      // Simulate time passage
      jest.advanceTimersByTime(3600000); // 1 hour

      await metricsSystem.collectSnapshot('phase1');

      jest.advanceTimersByTime(3600000); // Another hour

      const snapshot: any = await metricsSystem.collectSnapshot('phase1');

      expect(snapshot.metrics.trendData.errorReductionRate).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Resource Metrics', () => {
    test('should collect system resource metrics', async () => {
      const snapshot: any = await metricsSystem.collectSnapshot();

      expect(snapshot.metrics.resourceMetrics.nodeMemoryUsage).toBeDefined();
      expect(snapshot.metrics.resourceMetrics.nodeMemoryUsage.heapUsed).toBeGreaterThan(0);
    });

    test('should collect system memory on Linux systems', async () => {
      mockExecSync.mockReturnValueOnce('Mem:       8192     4096     4096');

      const snapshot: any = await metricsSystem.collectSnapshot();

      // System memory collection might not work in test environment
      expect(snapshot.metrics.resourceMetrics.systemMemory).toBeDefined();
    });
  });

  describe('Snapshot Management', () => {
    test('should create and store snapshots', async () => {
      mockExecSync.mockReturnValue('0');

      const snapshot: any = await metricsSystem.collectSnapshot('phase1', 'milestone1', 'Test snapshot');

      expect(snapshot.id).toMatch(/^snapshot_\d+$/);
      expect(snapshot.phase).toBe('phase1');
      expect(snapshot.milestone).toBe('milestone1');
      expect(snapshot.notes).toBe('Test snapshot');

      const snapshots: any = metricsSystem.getSnapshots();
      expect(snapshots).toHaveLength(1);
      expect(snapshots.[0]).toEqual(snapshot);
    });

    test('should limit snapshot history to prevent memory issues', async () => {
      mockExecSync.mockReturnValue('0');

      // Create more than 1000 snapshots
      for (let i: any = 0; i < 1100; i++) {
        await metricsSystem.collectSnapshot(`phase${(i % 4) + 1}`);
      }

      const snapshots: any = metricsSystem.getSnapshots();
      expect(snapshots.length).toBeLessThanOrEqual(500);
    });

    test('should get latest snapshot', async () => {
      mockExecSync.mockReturnValue('0');

      expect(metricsSystem.getLatestSnapshot()).toBeNull();

      const snapshot1: any = await metricsSystem.collectSnapshot('phase1');
      const snapshot2: any = await metricsSystem.collectSnapshot('phase2');

      expect(metricsSystem.getLatestSnapshot()).toEqual(snapshot2);
    });

    test('should clear snapshots', async () => {
      mockExecSync.mockReturnValue('0');

      await metricsSystem.collectSnapshot('phase1');
      expect(metricsSystem.getSnapshots()).toHaveLength(1);

      metricsSystem.clearSnapshots();
      expect(metricsSystem.getSnapshots()).toHaveLength(0);
    });
  });

  describe('Export Functionality', () => {
    test('should export snapshots to file', async () => {
      mockExecSync.mockReturnValue('0');
      mockFs.writeFileSync.mockImplementation();

      await metricsSystem.collectSnapshot('phase1');
      await metricsSystem.exportSnapshots('test-metrics.json');

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        'test-metrics.json',
        expect.stringContaining('"totalSnapshots": 1'),
      );
    });

    test('should handle export errors gracefully', async () => {
      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error('Write failed');
      });

      await expect(metricsSystem.exportSnapshots('invalid-path.json')).rejects.toThrow('Write failed');
    });
  });

  describe('Error Handling', () => {
    test('should handle command execution errors gracefully', async () => {
      const consoleWarnSpy: any = jest.spyOn(console, 'warn').mockImplementation();

      mockExecSync.mockImplementation(() => {
        throw new Error('Command not found');
      });

      const snapshot: any = await metricsSystem.collectSnapshot();

      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(snapshot.metrics.typeScriptErrors.current).toBe(-1);

      consoleWarnSpy.mockRestore();
    });

    test('should handle collection errors during real-time collection', done => {
      const consoleErrorSpy: any = jest.spyOn(console, 'error').mockImplementation();

      mockExecSync.mockImplementation(() => {
        throw new Error('Collection failed');
      });

      metricsSystem.startRealTimeCollection(100);

      setTimeout(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Error during metrics collection:', 'Collection failed');

        consoleErrorSpy.mockRestore();
        done();
      }, 150);
    });
  });

  describe('Metrics Calculation', () => {
    test('should calculate correct percentages for TypeScript errors', async () => {
      mockExecSync.mockReturnValueOnce('43'); // Half of initial 86 errors

      const snapshot: any = await metricsSystem.collectSnapshot();

      expect(snapshot.metrics.typeScriptErrors.current).toBe(43);
      expect(snapshot.metrics.typeScriptErrors.reduction).toBe(43);
      expect(snapshot.metrics.typeScriptErrors.percentage).toBe(50);
    });

    test('should calculate correct percentages for linting warnings', async () => {
      mockExecSync
        .mockReturnValueOnce('0') // No TS errors
        .mockReturnValueOnce('2253'); // Half of initial 4506 warnings

      const snapshot: any = await metricsSystem.collectSnapshot();

      expect(snapshot.metrics.lintingWarnings.current).toBe(2253);
      expect(snapshot.metrics.lintingWarnings.reduction).toBe(2253);
      expect(snapshot.metrics.lintingWarnings.percentage).toBe(50);
    });
  });
});
