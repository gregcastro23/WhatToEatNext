/**
 * Tests for ProgressiveImprovementEngine
 * Validates batch processing orchestration and realistic target management
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import { ProgressiveImprovementEngine } from '../ProgressiveImprovementEngine';
import { UnintentionalAnyConfig } from '../types';

// Mock dependencies
jest.mock('fs');
jest.mock('child_process');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;

describe('ProgressiveImprovementEngine', () => {
  let engine: ProgressiveImprovementEngine;
  let mockConfig: UnintentionalAnyConfig;

  beforeEach(() => {
    engine = new ProgressiveImprovementEngine();
    mockConfig = {
      maxFilesPerBatch: 10,
      targetReductionPercentage: 15,
      confidenceThreshold: 0.8,
      enableDomainAnalysis: true,
      enableDocumentation: true,
      safetyLevel: 'MODERATE',
      validationFrequency: 5
    };

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('Batch Processing Orchestration', () => {
    test('should initialize with adaptive configuration', () => {
      const config = engine.getAdaptiveConfig();

      expect(config.maxFilesPerBatch).toBe(15); // Default value
      expect(config.targetReductionPercentage).toBe(15);
      expect(config.confidenceThreshold).toBe(0.8);
      expect(config.safetyLevel).toBe('MODERATE');
    });

    test('should adapt batch size based on safety scores', async () => {
      // Mock file system operations
      mockExecSync.mockReturnValue('src/test1.ts\nsrc/test2.ts\n');
      mockFs.readFileSync.mockReturnValue('const data: any = {};');
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue([]);

      // Mock TypeScript error count (no errors)
      mockExecSync.mockImplementation((command) => {
        if (command.includes('grep -c "error TS"')) {
          const error = new Error('No matches') as unknown;
          error.status = 1; // grep exit code for no matches
          throw error;
        }
        return 'src/test1.ts\nsrc/test2.ts\n';
      });

      // Execute multiple batches to trigger adaptation
      const batch1 = await engine.executeBatch(mockConfig);
      const batch2 = await engine.executeBatch(mockConfig);

      expect(batch1.batchNumber).toBe(1);
      expect(batch2.batchNumber).toBe(2);

      const history = engine.getBatchHistory();
      expect(history).toHaveLength(2);
    });

    test('should create safety checkpoints during execution', async () => {
      // Mock successful execution
      mockExecSync.mockReturnValue('');
      mockFs.readFileSync.mockReturnValue('const data: any = {};');

      const batch = await engine.executeBatch(mockConfig);

      expect(batch.safetyScore).toBeGreaterThanOrEqual(0);
      expect(batch.executionTime).toBeGreaterThan(0);
    });

    test('should track progress metrics accurately', async () => {
      const progress = await engine.getProgressMetrics();

      expect(progress).toHaveProperty('totalAnyTypes');
      expect(progress).toHaveProperty('reductionPercentage');
      expect(progress).toHaveProperty('batchesCompleted');
      expect(progress).toHaveProperty('averageSuccessRate');
    });
  });

  describe('Realistic Target Management', () => {
    test('should set realistic targets based on file analysis', async () => {
      // Mock file analysis
      mockExecSync.mockReturnValue('src/test1.ts\nsrc/test2.ts\nsrc/test3.test.ts\n');
      mockFs.readFileSync.mockImplementation((path) => {
        if (path.toString().includes('test')) {
          return 'const mockData: any = {};'; // Test file
        }
        return 'const items: any[] = []; const config: Record<string, unknown> = {};';
      });

      const targetInfo = await engine.setRealisticTargets();

      expect(targetInfo.recommendedTarget).toBeGreaterThan(0);
      expect(targetInfo.recommendedTarget).toBeLessThanOrEqual(25);
      expect(targetInfo.reasoning).toBeInstanceOf(Array);
      expect(targetInfo.reasoning.length).toBeGreaterThan(0);
      expect(targetInfo.milestones).toHaveLength(4);

      // Verify milestones are progressive
      for (let i = 1; i < targetInfo.milestones.length; i++) {
        expect(targetInfo.milestones[i].percentage).toBeGreaterThan(
          targetInfo.milestones[i - 1].percentage
        );
      }
    });

    test('should monitor progress with milestone tracking', async () => {
      mockExecSync.mockReturnValue('src/test1.ts\n');
      mockFs.readFileSync.mockReturnValue('const data: any = {};');

      const monitoring = await engine.monitorProgress();

      expect(monitoring.currentProgress).toBeDefined();
      expect(monitoring.milestoneStatus).toBeInstanceOf(Array);
      expect(monitoring.recommendations).toBeInstanceOf(Array);
      expect(typeof monitoring.needsManualIntervention).toBe('boolean');
    });

    test('should analyze success rate and adapt strategy', () => {
      const analysis = engine.analyzeSuccessRateAndAdapt();

      expect(analysis.currentSuccessRate).toBeGreaterThanOrEqual(0);
      expect(analysis.currentSuccessRate).toBeLessThanOrEqual(1);
      expect(['improving', 'declining', 'stable']).toContain(analysis.trend);
      expect(analysis.adaptations).toBeInstanceOf(Array);
    });

    test('should recommend manual intervention when needed', async () => {
      // Simulate low success rate scenario by mocking batch history
      const lowSuccessBatch = {
        batchNumber: 1,
        filesProcessed: 5,
        anyTypesAnalyzed: 10,
        replacementsAttempted: 10,
        replacementsSuccessful: 1, // Very low success rate
        compilationErrors: 0,
        rollbacksPerformed: 0,
        executionTime: 1000,
        safetyScore: 0.6 // Low safety score
      };

      // Add multiple low-success batches to history
      for (let i = 0; i < 5; i++) {
        (engine as unknown).batchHistory.push({ ...lowSuccessBatch, batchNumber: i + 1 });
      }

      mockExecSync.mockReturnValue('src/test1.ts\n');
      mockFs.readFileSync.mockReturnValue('const data: any = {};');

      const monitoring = await engine.monitorProgress();

      expect(monitoring.needsManualIntervention).toBe(true);
      expect(monitoring.recommendations.some(r =>
        r.includes('manual review') || r.includes('documentation')
      )).toBe(true);
    });

    test('should adjust targets based on historical performance', async () => {
      // Add successful batch history
      const successfulBatch = {
        batchNumber: 1,
        filesProcessed: 10,
        anyTypesAnalyzed: 20,
        replacementsAttempted: 15,
        replacementsSuccessful: 12, // High success rate
        compilationErrors: 0,
        rollbacksPerformed: 0,
        executionTime: 2000,
        safetyScore: 0.95
      };

      (engine as unknown).batchHistory.push(successfulBatch);

      mockExecSync.mockReturnValue('src/test1.ts\nsrc/test2.ts\n');
      mockFs.readFileSync.mockReturnValue('const items: any[] = [];');

      const targetInfo = await engine.setRealisticTargets();

      // Should increase target due to high success rate
      expect(targetInfo.reasoning.some(r =>
        r.includes('High historical success rate')
      )).toBe(true);
    });
  });

  describe('Strategy Adaptation', () => {
    test('should reduce batch size when safety score is low', () => {
      const initialConfig = engine.getAdaptiveConfig();
      const initialBatchSize = initialConfig.maxFilesPerBatch;

      // Add low safety score batches
      const lowSafetyBatch = {
        batchNumber: 1,
        filesProcessed: 5,
        anyTypesAnalyzed: 10,
        replacementsAttempted: 8,
        replacementsSuccessful: 3,
        compilationErrors: 2,
        rollbacksPerformed: 1,
        executionTime: 1500,
        safetyScore: 0.5 // Low safety score
      };

      for (let i = 0; i < 3; i++) {
        (engine as unknown).batchHistory.push({ ...lowSafetyBatch, batchNumber: i + 1 });
      }

      // Trigger adaptation
      (engine as unknown).adaptStrategy();

      const adaptedConfig = engine.getAdaptiveConfig();
      expect(adaptedConfig.maxFilesPerBatch).toBeLessThan(initialBatchSize);
      expect(adaptedConfig.confidenceThreshold).toBeGreaterThan(initialConfig.confidenceThreshold);
    });

    test('should increase batch size when performance is good', () => {
      const initialConfig = engine.getAdaptiveConfig();
      const initialBatchSize = initialConfig.maxFilesPerBatch;

      // Add high performance batches
      const highPerformanceBatch = {
        batchNumber: 1,
        filesProcessed: 10,
        anyTypesAnalyzed: 20,
        replacementsAttempted: 18,
        replacementsSuccessful: 16,
        compilationErrors: 0,
        rollbacksPerformed: 0,
        executionTime: 1000,
        safetyScore: 0.95
      };

      for (let i = 0; i < 3; i++) {
        (engine as unknown).batchHistory.push({ ...highPerformanceBatch, batchNumber: i + 1 });
      }

      // Trigger adaptation
      (engine as unknown).adaptStrategy();

      const adaptedConfig = engine.getAdaptiveConfig();
      expect(adaptedConfig.maxFilesPerBatch).toBeGreaterThanOrEqual(initialBatchSize);
    });
  });

  describe('Full Campaign Execution', () => {
    test('should execute full campaign with progress tracking', async () => {
      // Mock minimal file system for quick test
      mockExecSync.mockImplementation((command) => {
        if (command.includes('grep -c "error TS"')) {
          const error = new Error('No matches') as unknown;
          error.status = 1;
          throw error;
        }
        return ''; // No files to process
      });

      const result = await engine.executeFullCampaign(mockConfig);

      expect(result).toHaveProperty('totalAnyTypesAnalyzed');
      expect(result).toHaveProperty('reductionAchieved');
      expect(result).toHaveProperty('safetyEvents');
      expect(result.safetyEvents).toBeInstanceOf(Array);
    });

    test('should handle campaign with realistic file processing', async () => {
      // Mock realistic file discovery and processing
      mockExecSync.mockImplementation((command) => {
        if (command.includes('grep -r -l')) {
          return 'src/test1.ts\nsrc/test2.ts\nsrc/test3.ts\n';
        }
        if (command.includes('grep -c "error TS"')) {
          const error = new Error('No matches') as unknown;
          error.status = 1;
          throw error;
        }
        return '';
      });

      mockFs.readFileSync.mockImplementation((path: unknown) => {
        if (path.includes('test1.ts')) return 'const items: any[] = [];';
        if (path.includes('test2.ts')) return 'const data: Record<string, unknown> = {};';
        if (path.includes('test3.ts')) return 'function test(param: unknown) { return param; }';
        return 'backup content';
      });

      const result = await engine.executeFullCampaign({
        ...mockConfig,
        maxFilesPerBatch: 2,
        targetReductionPercentage: 10
      });

      expect(result.totalAnyTypesAnalyzed).toBeGreaterThan(0);
      expect(result.reductionAchieved).toBeGreaterThanOrEqual(0);
    });

    test('should handle campaign interruption gracefully', async () => {
      // Mock scenario where campaign needs to stop due to safety concerns
      let batchCount = 0;
      mockExecSync.mockImplementation((command) => {
        if (command.includes('grep -r -l')) {
          return 'src/test1.ts\nsrc/test2.ts\n';
        }
        if (command.includes('grep -c "error TS"')) {
          batchCount++;
          if (batchCount > 2) {
            // Simulate increasing errors after a few batches
            return '10'; // Return error count as string
          }
          const error = new Error('No matches') as unknown;
          error.status = 1;
          throw error;
        }
        return '';
      });

      mockFs.readFileSync.mockReturnValue('const data: any = complexOperation();');

      const result = await engine.executeFullCampaign({
        ...mockConfig,
        maxFilesPerBatch: 1,
        targetReductionPercentage: 50 // High target to test interruption
      });

      expect(result.safetyEvents.length).toBeGreaterThan(0);
      expect(result.safetyEvents.some(event => event.type === 'LOW_SAFETY_SCORE')).toBe(true);
    });
  });

  describe('Advanced Batch Processing Scenarios', () => {
    test('should handle mixed file types in single batch', async () => {
      mockExecSync.mockImplementation((command) => {
        if (command.includes('grep -r -l')) {
          return 'src/component.tsx\nsrc/service.ts\nsrc/test.test.ts\n';
        }
        if (command.includes('grep -c "error TS"')) {
          const error = new Error('No matches') as unknown;
          error.status = 1;
          throw error;
        }
        return '';
      });

      mockFs.readFileSync.mockImplementation((path: unknown) => {
        if (path.includes('component.tsx')) return 'const props: any = {};';
        if (path.includes('service.ts')) return 'const response: any = await fetch("/api");';
        if (path.includes('test.test.ts')) return 'const mockData: any = jest.fn();';
        return 'backup content';
      });

      const batch = await engine.executeBatch({
        ...mockConfig,
        maxFilesPerBatch: 3
      });

      expect(batch.filesProcessed).toBe(3);
      expect(batch.anyTypesAnalyzed).toBe(3);
    });

    test('should adapt to compilation errors during batch', async () => {
      mockExecSync.mockImplementation((command) => {
        if (command.includes('grep -r -l')) {
          return 'src/problematic.ts\n';
        }
        if (command.includes('grep -c "error TS"')) {
          // Simulate compilation errors appearing
          return '5';
        }
        return '';
      });

      mockFs.readFileSync.mockReturnValue('const data: any = getValue();');

      const batch = await engine.executeBatch(mockConfig);

      expect(batch.compilationErrors).toBe(5);
      expect(batch.safetyScore).toBeLessThan(1.0);
    });

    test('should handle file system errors during batch processing', async () => {
      mockExecSync.mockImplementation((command) => {
        if (command.includes('grep -r -l')) {
          return 'src/inaccessible.ts\n';
        }
        return '';
      });

      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('ENOENT: file not found');
      });

      const batch = await engine.executeBatch(mockConfig);

      expect(batch.filesProcessed).toBe(0);
      expect(batch.rollbacksPerformed).toBeGreaterThan(0);
    });
  });

  describe('Realistic Target Management Edge Cases', () => {
    test('should handle codebase with no any types', async () => {
      mockExecSync.mockImplementation((command) => {
        if (command.includes('grep -r -l')) {
          const error = new Error('No matches') as unknown;
          error.status = 1;
          throw error;
        }
        return '';
      });

      const targetInfo = await engine.setRealisticTargets();

      expect(targetInfo.recommendedTarget).toBeGreaterThan(0);
      expect(targetInfo.reasoning).toContain('analysis of 0 files');
    });

    test('should handle codebase with only test files', async () => {
      mockExecSync.mockImplementation((command) => {
        if (command.includes('grep -r -l')) {
          return 'src/test1.test.ts\nsrc/test2.spec.ts\n';
        }
        return '';
      });

      mockFs.readFileSync.mockReturnValue('const mockData: any = {};');

      const targetInfo = await engine.setRealisticTargets();

      expect(targetInfo.reasoning.some(r => r.includes('test files'))).toBe(true);
      expect(targetInfo.recommendedTarget).toBeLessThan(15); // Should be reduced due to test files
    });

    test('should handle extremely complex codebase', async () => {
      mockExecSync.mockImplementation((command) => {
        if (command.includes('grep -r -l')) {
          return Array(100).fill(null).map((_, i) => `src/complex${i}.ts`).join('\n');
        }
        return '';
      });

      mockFs.readFileSync.mockImplementation((path: unknown) => {
        if (path.includes('complex')) {
          return 'function complex(param: unknown): any { return param as unknown; }';
        }
        return 'backup content';
      });

      const targetInfo = await engine.setRealisticTargets();

      expect(targetInfo.recommendedTarget).toBeGreaterThan(0);
      expect(targetInfo.milestones).toHaveLength(4);
      expect(targetInfo.reasoning.length).toBeGreaterThan(0);
    });
  });

  describe('Progress Monitoring Edge Cases', () => {
    test('should detect stagnation and recommend intervention', async () => {
      // Add multiple low-progress batches to simulate stagnation
      const stagnantBatch = {
        batchNumber: 1,
        filesProcessed: 5,
        anyTypesAnalyzed: 10,
        replacementsAttempted: 8,
        replacementsSuccessful: 0, // No successful replacements
        compilationErrors: 0,
        rollbacksPerformed: 0,
        executionTime: 1000,
        safetyScore: 0.8
      };

      for (let i = 0; i < 5; i++) {
        (engine as unknown).batchHistory.push({ ...stagnantBatch, batchNumber: i + 1 });
      }

      mockExecSync.mockReturnValue('src/test1.ts\n');
      mockFs.readFileSync.mockReturnValue('const data: any = {};');

      const monitoring = await engine.monitorProgress();

      expect(monitoring.needsManualIntervention).toBe(true);
      expect(monitoring.recommendations.some(r =>
        r.includes('stagnated') || r.includes('manual')
      )).toBe(true);
    });

    test('should provide strategic recommendations based on progress', async () => {
      mockExecSync.mockReturnValue('src/test1.ts\n');
      mockFs.readFileSync.mockReturnValue('const items: any[] = [];');

      // Test early stage recommendations
      const earlyMonitoring = await engine.monitorProgress();
      expect(earlyMonitoring.recommendations.some(r =>
        r.includes('array types') || r.includes('quick wins')
      )).toBe(true);

      // Simulate progress to mid-stage
      const progressBatch = {
        batchNumber: 1,
        filesProcessed: 10,
        anyTypesAnalyzed: 20,
        replacementsAttempted: 15,
        replacementsSuccessful: 12,
        compilationErrors: 0,
        rollbacksPerformed: 0,
        executionTime: 2000,
        safetyScore: 0.9
      };

      (engine as unknown).batchHistory.push(progressBatch);

      const midMonitoring = await engine.monitorProgress();
      expect(midMonitoring.recommendations.some(r =>
        r.includes('Record') || r.includes('domain-specific')
      )).toBe(true);
    });
  });

  describe('Memory and Performance Under Load', () => {
    test('should handle memory pressure gracefully', async () => {
      // Simulate memory pressure scenario
      const originalMemoryUsage = process.memoryUsage;
      process.memoryUsage = jest.fn().mockReturnValue({
        rss: 500 * 1024 * 1024, // 500MB
        heapUsed: 400 * 1024 * 1024, // 400MB
        heapTotal: 450 * 1024 * 1024,
        external: 10 * 1024 * 1024,
        arrayBuffers: 5 * 1024 * 1024
      });

      mockExecSync.mockReturnValue('src/test1.ts\n');
      mockFs.readFileSync.mockReturnValue('const data: any = {};');

      const batch = await engine.executeBatch(mockConfig);

      expect(batch).toBeDefined();
      expect(batch.executionTime).toBeGreaterThan(0);

      // Restore original function
      process.memoryUsage = originalMemoryUsage;
    });

    test('should maintain performance with large batch history', async () => {
      // Add large batch history
      for (let i = 0; i < 1000; i++) {
        (engine as unknown).batchHistory.push({
          batchNumber: i + 1,
          filesProcessed: 5,
          anyTypesAnalyzed: 10,
          replacementsAttempted: 8,
          replacementsSuccessful: 6,
          compilationErrors: 0,
          rollbacksPerformed: 0,
          executionTime: 1000,
          safetyScore: 0.9
        });
      }

      const startTime = Date.now();
      const analysis = engine.analyzeSuccessRateAndAdapt();
      const endTime = Date.now();

      expect(analysis).toBeDefined();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});
