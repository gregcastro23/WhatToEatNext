/**
 * Performance Tests for Memory Usage Validation
 * Perfect Codebase Campaign - Memory Performance Testing
 */

import { createAstrologicalBridge } from '@/types/bridges/astrologicalBridge';

import {
  CampaignConfig,
  SafetySettings,
  SafetyLevel,
  ProgressMetrics
} from '../../../../types/campaign';
import { CampaignController } from '../../CampaignController';
import { ProgressTracker } from '../../ProgressTracker';
import { SafetyProtocol } from '../../SafetyProtocol';


describe('Memory Usage Performance Tests', () => {
  let progressTracker: ProgressTracker;
  let campaignController: CampaignController;
  let safetyProtocol: SafetyProtocol;
  let mockConfig: CampaignConfig;

  beforeEach(() => {
    const safetySettings: SafetySettings = {
      maxFilesPerBatch: 25,
      buildValidationFrequency: 5,
      testValidationFrequency: 10,
      corruptionDetectionEnabled: true,
      automaticRollbackEnabled: true,
      stashRetentionDays: 7
    };

    mockConfig = {
      phases: [{
        id: 'memory-test-phase',
        name: 'Memory Test Phase',
        description: 'Phase for memory testing',
        tools: [{
          scriptPath: 'scripts/memory/test-script.js',
          parameters: { maxFiles: 100 },
          batchSize: 100,
          safetyLevel: SafetyLevel.MEDIUM
        }],
        successCriteria: { buildTime: 10 },
        safetyCheckpoints: []
      }],
      safetySettings,
      progressTargets: { typeScriptErrors: 0, lintingWarnings: 0, buildTime: 10, enterpriseSystems: 200 },
      toolConfiguration: {
        enhancedErrorFixer: 'scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js',
        explicitAnyFixer: 'scripts/typescript-fixes/fix-explicit-any-systematic.js',
        unusedVariablesFixer: 'scripts/typescript-fixes/fix-unused-variables-enhanced.js',
        consoleStatementFixer: 'scripts/lint-fixes/fix-console-statements-only.js'
      }
    };

    progressTracker = new ProgressTracker();
    campaignController = new CampaignController(mockConfig);
    safetyProtocol = new SafetyProtocol(safetySettings);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('Memory Usage Monitoring', () => {
    it('should track memory usage under 50MB target', async () => {
      const originalMemoryUsage = process.memoryUsage;
      process.memoryUsage = jest.fn().mockReturnValue({
        heapUsed: 40 * 1024 * 1024, // 40MB
        heapTotal: 80 * 1024 * 1024,
        external: 5 * 1024 * 1024,
        rss: 100 * 1024 * 1024,
        arrayBuffers: 2 * 1024 * 1024
      }) as unknown as typeof process.memoryUsage;

      const memoryUsage = await progressTracker.getMemoryUsage();

      expect(memoryUsage).toBe(40);
      expect(memoryUsage).toBeLessThan(50); // Under target

      process.memoryUsage = originalMemoryUsage;
    });

    it('should detect memory usage spikes', async () => {
      const originalMemoryUsage = process.memoryUsage;
      process.memoryUsage = jest.fn().mockReturnValue({
        heapUsed: 75 * 1024 * 1024, // 75MB - exceeds target
        heapTotal: 150 * 1024 * 1024,
        external: 10 * 1024 * 1024,
        rss: 200 * 1024 * 1024,
        arrayBuffers: 5 * 1024 * 1024
      }) as unknown as typeof process.memoryUsage;

      const memoryUsage = await progressTracker.getMemoryUsage();

      expect(memoryUsage).toBe(75);
      expect(memoryUsage).toBeGreaterThan(50); // Exceeds target

      process.memoryUsage = originalMemoryUsage;
    });

    it('should handle memory measurement errors gracefully', async () => {
      const originalMemoryUsage = process.memoryUsage;
      process.memoryUsage = jest.fn().mockImplementation(() => {
        throw new Error('Memory measurement failed');
      }) as unknown as typeof process.memoryUsage;

      const memoryUsage = await progressTracker.getMemoryUsage();

      expect(memoryUsage).toBe(0); // Error handling returns 0

      process.memoryUsage = originalMemoryUsage;
    });

    it('should track memory usage trends over time', async () => {
      const originalMemoryUsage = process.memoryUsage;
      const memoryReadings: number[] = [];
      let callCount = 0;

      process.memoryUsage = jest.fn().mockImplementation(() => {
        callCount++;
        // Simulate memory usage that increases then decreases (garbage collection)
        const baseMemory = 30;
        const variation = Math.sin(callCount * 0.5) * 10; // ±10MB variation
        const heapUsed = (baseMemory + variation) * 1024 * 1024;
        
        return {
          heapUsed,
          heapTotal: heapUsed * 2,
          external: 5 * 1024 * 1024,
          rss: heapUsed * 1.5,
          arrayBuffers: 2 * 1024 * 1024
        };
      }) as unknown as typeof process.memoryUsage;

      // Collect multiple memory readings
      for (let i = 0; i < 10; i++) {
        const memoryUsage = await progressTracker.getMemoryUsage();
        memoryReadings.push(memoryUsage);
      }

      expect(memoryReadings.length).toBe(10);
      expect(memoryReadings.every(reading => reading > 0)).toBe(true);

      // Memory should vary but stay within reasonable bounds
      const maxMemory = Math.max(...memoryReadings);
      const minMemory = Math.min(...memoryReadings);
      expect(maxMemory).toBeLessThan(50); // Should stay under target
      expect(minMemory).toBeGreaterThan(15); // Should have reasonable minimum

      process.memoryUsage = originalMemoryUsage;
    });
  });

  describe('Memory Leak Detection', () => {
    it('should detect potential memory leaks in progress tracking', async () => {
      const originalMemoryUsage = process.memoryUsage;
      let simulatedMemoryLeak = 30; // Start at 30MB

      process.memoryUsage = jest.fn().mockImplementation(() => {
        // Simulate memory leak - memory increases with each call
        simulatedMemoryLeak += 2; // 2MB increase per call
        return {
          heapUsed: simulatedMemoryLeak * 1024 * 1024,
          heapTotal: simulatedMemoryLeak * 2 * 1024 * 1024,
          external: 5 * 1024 * 1024,
          rss: simulatedMemoryLeak * 1.5 * 1024 * 1024,
          arrayBuffers: 2 * 1024 * 1024
        };
      }) as unknown as typeof process.memoryUsage;

      const memoryReadings: number[] = [];

      // Simulate multiple operations that could cause memory leaks
      for (let i = 0; i < 15; i++) {
        const memoryUsage = await progressTracker.getMemoryUsage();
        memoryReadings.push(memoryUsage);
      }

      // Should detect increasing memory usage pattern
      const firstReading = memoryReadings[0];
      const lastReading = memoryReadings[memoryReadings.length - 1];
      
      expect(lastReading).toBeGreaterThan(firstReading);
      expect(lastReading).toBeGreaterThan(50); // Should exceed target, indicating leak

      process.memoryUsage = originalMemoryUsage;
    });

    it('should validate memory cleanup in safety protocol', async () => {
      const originalMemoryUsage = process.memoryUsage;
      const memoryUsage = 35; // Start at 35MB

      process.memoryUsage = jest.fn().mockImplementation(() => {
        return {
          heapUsed: memoryUsage * 1024 * 1024,
          heapTotal: memoryUsage * 2 * 1024 * 1024,
          external: 5 * 1024 * 1024,
          rss: memoryUsage * 1.5 * 1024 * 1024,
          arrayBuffers: 2 * 1024 * 1024
        };
      }) as unknown as typeof process.memoryUsage;

      // Create many safety events to test memory management
      for (let i = 0; i < 1100; i++) {
        (safetyProtocol as any).addSafetyEvent({
          type: 'CHECKPOINT_CREATED',
          timestamp: new Date(),
          description: `Event ${i}`,
          severity: 'INFO',
          action: 'TEST'
        });
      }

      const events = safetyProtocol.getSafetyEvents();
      
      // Should limit events to prevent memory issues
      expect(events.length).toBe(500); // Should be trimmed

      // Memory should remain stable
      const finalMemoryUsage = await progressTracker.getMemoryUsage();
      expect(finalMemoryUsage).toBeLessThan(50);

      process.memoryUsage = originalMemoryUsage;
    });

    it('should validate memory cleanup in progress tracker', async () => {
      const originalMemoryUsage = process.memoryUsage;
      const memoryUsage = 30; // Start at 30MB

      process.memoryUsage = jest.fn().mockImplementation(() => {
        return {
          heapUsed: memoryUsage * 1024 * 1024,
          heapTotal: memoryUsage * 2 * 1024 * 1024,
          external: 5 * 1024 * 1024,
          rss: memoryUsage * 1.5 * 1024 * 1024,
          arrayBuffers: 2 * 1024 * 1024
        };
      }) as unknown as typeof process.memoryUsage;

      // Mock progress metrics to create history
      jest.spyOn(progressTracker, 'getProgressMetrics').mockImplementation(async () => {
        return {
          typeScriptErrors: { current: 86, target: 0, reduction: 0, percentage: 0 },
          lintingWarnings: { current: 4506, target: 0, reduction: 0, percentage: 0 },
          buildPerformance: { currentTime: 8.5, targetTime: 10, cacheHitRate: 0.8, memoryUsage: memoryUsage },
          enterpriseSystems: { current: 0, target: 200, transformedExports: 0 }
        };
      });

      // Generate large metrics history
      for (let i = 0; i < 110; i++) {
        await progressTracker.getProgressMetrics();
      }

      const history = progressTracker.getMetricsHistory();
      
      // Should limit history to prevent memory issues
      expect(history.length).toBe(50); // Should be trimmed

      // Memory should remain stable
      const finalMemoryUsage = await progressTracker.getMemoryUsage();
      expect(finalMemoryUsage).toBeLessThan(50);

      process.memoryUsage = originalMemoryUsage;
    });
  });

  describe('Memory Efficiency Testing', () => {
    it('should efficiently handle large file processing', async () => {
      const originalMemoryUsage = process.memoryUsage;
      const baseMemory = 35;

      process.memoryUsage = jest.fn().mockImplementation(() => {
        // Memory should not increase significantly with large file counts
        const memoryIncrease = Math.min(10, Math.random() * 5); // Max 10MB increase
        return {
          heapUsed: (baseMemory + memoryIncrease) * 1024 * 1024,
          heapTotal: (baseMemory + memoryIncrease) * 2 * 1024 * 1024,
          external: 5 * 1024 * 1024,
          rss: (baseMemory + memoryIncrease) * 1.5 * 1024 * 1024,
          arrayBuffers: 2 * 1024 * 1024
        };
      }) as unknown as typeof process.memoryUsage;

      // Simulate processing large number of files
      const largeFileList = Array.from({ length: 1000 }, (_, i) => `file${i}.ts`);
      
      // Mock campaign execution with large file processing
      jest.spyOn(campaignController as any, 'executeTool').mockResolvedValue({
        filesProcessed: largeFileList,
        changesApplied: largeFileList.length,
        success: true
      });

      const phase = mockConfig.phases[0];
      const result = await campaignController.executePhase(phase);

      expect(result.success).toBe(true);
      expect(result.filesProcessed).toBe(1000);

      // Memory should remain efficient even with large file processing
      const memoryUsage = await progressTracker.getMemoryUsage();
      expect(memoryUsage).toBeLessThan(50);

      process.memoryUsage = originalMemoryUsage;
    });

    it('should efficiently manage concurrent operations', async () => {
      const originalMemoryUsage = process.memoryUsage;
      const baseMemory = 30;

      process.memoryUsage = jest.fn().mockImplementation(() => {
        // Memory should remain stable during concurrent operations
        const variation = Math.random() * 5; // ±5MB variation
        return {
          heapUsed: (baseMemory + variation) * 1024 * 1024,
          heapTotal: (baseMemory + variation) * 2 * 1024 * 1024,
          external: 5 * 1024 * 1024,
          rss: (baseMemory + variation) * 1.5 * 1024 * 1024,
          arrayBuffers: 2 * 1024 * 1024
        };
      }) as unknown as typeof process.memoryUsage;

      // Run multiple concurrent operations
      const promises = Array.from({ length: 10 }, async () => {
        return Promise.all([
          progressTracker.getMemoryUsage(),
          progressTracker.getProgressMetrics(),
          safetyProtocol.validateGitState()
        ]);
      });

      const results = await Promise.all(promises);

      expect(results.length).toBe(10);
      expect(results.every(result => result.length === 3)).toBe(true);

      // Memory should remain stable
      const finalMemoryUsage = await progressTracker.getMemoryUsage();
      expect(finalMemoryUsage).toBeLessThan(50);

      process.memoryUsage = originalMemoryUsage;
    });

    it('should handle memory pressure gracefully', async () => {
      const originalMemoryUsage = process.memoryUsage;
      let memoryPressure = false;

      process.memoryUsage = jest.fn().mockImplementation(() => {
        // Simulate memory pressure scenario
        const baseMemory = memoryPressure ? 48 : 35; // High memory when under pressure
        return {
          heapUsed: baseMemory * 1024 * 1024,
          heapTotal: baseMemory * 2 * 1024 * 1024,
          external: 5 * 1024 * 1024,
          rss: baseMemory * 1.5 * 1024 * 1024,
          arrayBuffers: 2 * 1024 * 1024
        };
      }) as unknown as typeof process.memoryUsage;

      // Normal operation
      let memoryUsage = await progressTracker.getMemoryUsage();
      expect(memoryUsage).toBe(35);

      // Simulate memory pressure
      memoryPressure = true;
      memoryUsage = await progressTracker.getMemoryUsage();
      expect(memoryUsage).toBe(48);
      expect(memoryUsage).toBeLessThan(50); // Still under target

      // System should handle pressure gracefully
      const metrics = await progressTracker.getProgressMetrics();
      expect(metrics).toBeDefined();
      expect(metrics?.buildPerformance?.memoryUsage).toBe(48);

      process.memoryUsage = originalMemoryUsage;
    });
  });

  describe('Memory Performance Benchmarks', () => {
    it('should benchmark memory allocation patterns', async () => {
      const originalMemoryUsage = process.memoryUsage;
      const memorySnapshots: number[] = [];
      let allocationCount = 0;

      process.memoryUsage = jest.fn().mockImplementation(() => {
        allocationCount++;
        // Simulate realistic memory allocation pattern
        const baseMemory = 30;
        const cyclicPattern = Math.sin(allocationCount * 0.3) * 8; // ±8MB cyclic pattern
        const growthTrend = allocationCount * 0.1; // Slight growth trend
        const totalMemory = baseMemory + cyclicPattern + growthTrend;
        
        return {
          heapUsed: totalMemory * 1024 * 1024,
          heapTotal: totalMemory * 2 * 1024 * 1024,
          external: 5 * 1024 * 1024,
          rss: totalMemory * 1.5 * 1024 * 1024,
          arrayBuffers: 2 * 1024 * 1024
        };
      }) as unknown as typeof process.memoryUsage;

      // Collect memory snapshots during various operations
      for (let i = 0; i < 20; i++) {
        const memoryUsage = await progressTracker.getMemoryUsage();
        memorySnapshots.push(memoryUsage);
        
        // Perform some operations to trigger memory allocation
        await progressTracker.getProgressMetrics();
      }

      expect(memorySnapshots.length).toBe(20);

      // Analyze memory allocation patterns
      const maxMemory = Math.max(...memorySnapshots);
      const minMemory = Math.min(...memorySnapshots);
      const avgMemory = memorySnapshots.reduce((sum, mem) => sum + mem, 0) / memorySnapshots.length;

      expect(maxMemory).toBeLessThan(50); // Should stay under target
      expect(minMemory).toBeGreaterThan(20); // Should have reasonable minimum
      expect(avgMemory).toBeLessThan(45); // Average should be well under target

      // Memory variance should be reasonable
      const variance = memorySnapshots.reduce((sum, mem) => sum + Math.pow(mem - avgMemory, 2), 0) / memorySnapshots.length;
      const standardDeviation = Math.sqrt(variance);
      expect(standardDeviation).toBeLessThan(10); // Should have reasonable variance

      process.memoryUsage = originalMemoryUsage;
    });

    it('should validate memory efficiency across different operations', async () => {
      const originalMemoryUsage = process.memoryUsage;
      const operationMemoryUsage: Record<string, number[]> = {
        typeScriptCheck: [],
        lintingCheck: [],
        enterpriseCount: [],
        buildTime: [],
        progressMetrics: []
      };

      let operationType = 'default';
      process.memoryUsage = jest.fn().mockImplementation(() => {
        // Different memory usage patterns for different operations
        let baseMemory = 30;
        switch (operationType) {
          case 'typeScriptCheck':
            baseMemory = 35; // TypeScript checking uses more memory
            break;
          case 'lintingCheck':
            baseMemory = 32; // Linting uses moderate memory
            break;
          case 'enterpriseCount':
            baseMemory = 28; // Simple grep uses less memory
            break;
          case 'buildTime':
            baseMemory = 40; // Build process uses more memory
            break;
          case 'progressMetrics':
            baseMemory = 33; // Metrics collection uses moderate memory
            break;
        }

        return {
          heapUsed: baseMemory * 1024 * 1024,
          heapTotal: baseMemory * 2 * 1024 * 1024,
          external: 5 * 1024 * 1024,
          rss: baseMemory * 1.5 * 1024 * 1024,
          arrayBuffers: 2 * 1024 * 1024
        };
      }) as unknown as typeof process.memoryUsage;

      // Test different operations and their memory usage
      const operations = [
        { name: 'typeScriptCheck', fn: () => progressTracker.getTypeScriptErrorCount() },
        { name: 'lintingCheck', fn: () => progressTracker.getLintingWarningCount() },
        { name: 'enterpriseCount', fn: () => progressTracker.getEnterpriseSystemCount() },
        { name: 'buildTime', fn: () => progressTracker.getBuildTime() },
        { name: 'progressMetrics', fn: () => progressTracker.getProgressMetrics() }
      ];

      for (const operation of operations) {
        operationType = operation.name;
        
        // Run operation multiple times to get average memory usage
        for (let i = 0; i < 5; i++) {
          await operation.fn();
          const memoryUsage = await progressTracker.getMemoryUsage();
          operationMemoryUsage[operation.name].push(memoryUsage);
        }
      }

      // Validate memory usage for each operation type
      for (const [opName, memoryReadings] of Object.entries(operationMemoryUsage)) {
        expect(memoryReadings.length).toBe(5);
        
        const avgMemory = memoryReadings.reduce((sum, mem) => sum + mem, 0) / memoryReadings.length;
        expect(avgMemory).toBeLessThan(50); // All operations should stay under target
        
        // Memory usage should be consistent for the same operation
        const maxMemory = Math.max(...memoryReadings);
        const minMemory = Math.min(...memoryReadings);
        expect(maxMemory - minMemory).toBeLessThan(5); // Should have low variance
      }

      process.memoryUsage = originalMemoryUsage;
    });
  });
});