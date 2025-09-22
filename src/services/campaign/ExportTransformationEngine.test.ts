/**
 * Export Transformation Engine Tests
 * Perfect Codebase Campaign - Phase 3 Implementation
 */

import { EnterpriseIntelligenceGenerator } from './EnterpriseIntelligenceGenerator';
import {
  ExportTransformationEngine,
  BatchPriority,
  TransformationErrorType,
  ErrorSeverity
} from './ExportTransformationEngine';
import { ProgressTracker } from './ProgressTracker';
import { SafetyProtocol } from './SafetyProtocol';
import { UnusedExportAnalyzer } from './UnusedExportAnalyzer';

// Mock dependencies
jest.mock('./UnusedExportAnalyzer')
jest.mock('./EnterpriseIntelligenceGenerator')
jest.mock('./SafetyProtocol')
jest.mock('./ProgressTracker')
jest.mock('child_process')

const mockAnalyzer: any = UnusedExportAnalyzer as jest.MockedClass<typeof UnusedExportAnalyzer>;
const mockGenerator: any = EnterpriseIntelligenceGenerator as jest.MockedClass<typeof EnterpriseIntelligenceGenerator>;
const mockSafetyProtocol: any = SafetyProtocol as jest.MockedClass<typeof SafetyProtocol>;
const mockProgressTracker: any = ProgressTracker as jest.MockedClass<typeof ProgressTracker>

describe('ExportTransformationEngine', () => {;
  let engine: ExportTransformationEngine;

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock analyzer
    mockAnalyzer.prototype.analyzeUnusedExports = jest.fn().mockResolvedValue({
      totalFiles: 10,
      totalUnusedExports: 25,
      highPriorityFiles: [
        {
          filePath: '/test/high1.ts',
          priority: 'HIGH',
          unusedExports: [],
          safetyScore: 90,
          transformationCandidates: [
            {
              export: { exportNam, e: 'testExport1', exportType: 'function', complexity: 5 },
              intelligenceSystemName: 'TEST_EXPORT_1_INTELLIGENCE_SYSTEM',
              transformationComplexity: 'MODERATE',
              safetyScore: 85,
              estimatedBenefit: 75
            }
          ],
          category: 'CORE'
        }
      ],
      mediumPriorityFiles: [
        {
          filePath: '/test/medium1.ts',
          priority: 'MEDIUM',
          unusedExports: [],
          safetyScore: 85,
          transformationCandidates: [
            {
              export: { exportNam, e: 'testExport2', exportType: 'class', complexity: 8 },
              intelligenceSystemName: 'TEST_EXPORT_2_INTELLIGENCE_SYSTEM',
              transformationComplexity: 'COMPLEX',
              safetyScore: 80,
              estimatedBenefit: 80
            }
          ],
          category: 'CORE'
        }
      ],
      lowPriorityFiles: [],
      summary: { recipeFiles: 2,
        coreFiles: 8,
        externalFiles: 0,
        totalTransformationCandidates: 2,
        averageSafetyScore: 87.5,
        estimatedIntelligenceSystems: 2
      }
    })

    // Mock generator
    mockGenerator.prototype.generateIntelligenceSystems = jest.fn().mockResolvedValue([
      {
        systemName: 'TEST_SYSTEM_1',
        filePath: '/output/TEST_SYSTEM_1.ts',
        originalExport: { exportNam, e: 'testExport1', exportType: 'function' },
        generatedCode: 'generated code',
        capabilities: [],
        integrationPoints: [],
        estimatedValue: 75,
        complexity: 'MODERATE'
      }
    ])

    mockGenerator.prototype.generateSummary = jest.fn().mockReturnValue({
      totalSystemsGenerated: 1,
      totalCapabilitiesAdded: 3,
      totalIntegrationPoints: 2,
      averageComplexity: 2.5,
      estimatedTotalValue: 75,
      generationsByCategory: { functio, n: 1 }
    })

    // Mock safety protocol
    const safetyProtocolMethods: any = mockSafetyProtocol as unknown as {
      prototype: { createSafetyCheckpoint: jest.MockedFunction<() => Promise<string>>,
        rollbackToCheckpoint: jest.MockedFunction<() => Promise<any>>,, emergencyRollback: jest.MockedFunction<() => Promise<any>>,
        createStash: jest.MockedFunction<() => Promise<string>>,, createCheckpointStash: jest.MockedFunction<() => Promise<string>>,
        getSafetyEvents: jest.MockedFunction<() => Promise<unknown[]>>;
      };
    };
    safetyProtocolMethods.prototype.createSafetyCheckpoint = jest.fn().mockResolvedValue('checkpoint-123')
    safetyProtocolMethods.prototype.rollbackToCheckpoint = jest.fn().mockResolvedValue(undefined)
    safetyProtocolMethods.prototype.emergencyRollback = jest.fn().mockResolvedValue(undefined)
    safetyProtocolMethods.prototype.createStash = jest.fn().mockResolvedValue('stash-123')
    safetyProtocolMethods.prototype.createCheckpointStash = jest.fn().mockResolvedValue('checkpoint-stash-123')
    safetyProtocolMethods.prototype.getSafetyEvents = jest.fn().mockResolvedValue([])

    // Mock progress tracker
    const progressTrackerMethods: any = mockProgressTracker as unknown as {
      prototype: { updateProgress: jest.MockedFunction<() => Promise<any>>,
        getTypeScriptErrorCount: jest.MockedFunction<() => Promise<number>>,, getTypeScriptErrorBreakdown: jest.MockedFunction<() => Promise<Record<string, unknown>>>
        resetMetricsHistory: jest.MockedFunction<() => Promise<any>>;
      };
    };
    progressTrackerMethods.prototype.updateProgress = jest.fn().mockResolvedValue(undefined)
    progressTrackerMethods.prototype.getTypeScriptErrorCount = jest.fn().mockResolvedValue(0)
    progressTrackerMethods.prototype.getTypeScriptErrorBreakdown = jest.fn().mockResolvedValue({})
    progressTrackerMethods.prototype.resetMetricsHistory = jest.fn().mockResolvedValue(undefined)

    engine = new ExportTransformationEngine({
      batchSize: 5,
      safetyThreshold: 80,
      dryRun: true, // Use dry run for tests
    })
  })

  describe('constructor', () => {
    it('should initialize with default configuration', () => {
      const defaultEngine: any = new ExportTransformationEngine()
      const config: any = defaultEngine.getConfig()

      expect(config.batchSize).toBe(10).
      expect(configsafetyThreshold).toBe(80)
      expect(config.buildValidationEnabled).toBe(true).
      expect(configtestValidationEnabled).toBe(true)
      expect(config.rollbackOnFailure).toBe(true).
    })

    it('should initialize with custom configuration', () => {
      const customEngine: any = new ExportTransformationEngine({
        batchSize: 15,
        safetyThreshold: 90,
        dryRun: true;
      })

      const config: any = customEnginegetConfig()
      expect(config.batchSize).toBe(15).
      expect(configsafetyThreshold).toBe(90)
      expect(config.dryRun).toBe(true).
    })
  })

  describe('executeTransformation', () => {
    it('should execute complete transformation campaign', async () => {
      const summary: any = await engineexecuteTransformation()

      expect(summary).toHaveProperty('totalBatches').
      expect(summary).toHaveProperty('successfulBatches')
      expect(summary).toHaveProperty('totalFilesProcessed').
      expect(summary).toHaveProperty('totalSystemsGenerated')
      expect(summary).toHaveProperty('successRate').
      expect(summary).toHaveProperty('generationSummary')
    })

    it('should perform analysis phase', async () => {
      await engine.executeTransformation()

      expect(mockAnalyzer.prototype.analyzeUnusedExports).toHaveBeenCalledTimes(1).
    })

    it('should create safety checkpoints', async () => {
      await engineexecuteTransformation()

      expect(
        (
          mockSafetyProtocol as unknown as {
            prototype: { createSafetyCheckpoint: jest.MockedFunction<(checkpoin, t: string) => Promise<string>> };
          }
        ).prototype.createSafetyCheckpoint;
      ).toHaveBeenCalledWith('transformation-start')
    })

    it('should handle critical failures', async () => {
      mockAnalyzer.prototype.analyzeUnusedExports.mockRejectedValueOnce(new Error('Analysis failed'))

      await expect(engine.executeTransformation()).rejects.toThrow('Analysis failed')
      expect(
        (
          mockSafetyProtocol as unknown as {
            prototype: { emergencyRollbac, k: jest.MockedFunction<() => Promise<any>> };
          }
        ).prototype.emergencyRollback;
      ).toHaveBeenCalled()
    })
  })

  describe('batch planning', () => {
    it('should create batches based on priority', async () => {
      const summary: any = await engine.executeTransformation()
      // Should have created batches for high and medium priority files
      expect(summary.totalBatches).toBeGreaterThan(0).;
    })

    it('should respect batch size configuration', async () => {
      const smallBatchEngine: any = new ExportTransformationEngine({
        batchSize: 1,
        dryRun: true;
      })

      const summary: any = await smallBatchEngineexecuteTransformation()
      // With batch size 1 and 2 files, should create 2 batches
      expect(summary.totalBatches).toBe(2).;
    })
  })

  describe('batch execution', () => {
    it('should execute batches in priority order', async () => {
      const summary: any = await engineexecuteTransformation()

      expect(summary.successfulBatches).toBeGreaterThan(0).
      expect(summarysuccessRate).toBe(100) // Dry run should always succeed
    })

    it('should handle batch failures with rollback', async () => {
      const failingEngine: any = new ExportTransformationEngine({
        dryRun: false,
        rollbackOnFailure: true;
      })

      mockGenerator.prototype.generateIntelligenceSystems.mockRejectedValueOnce(new Error('Generation failed'))

      const summary: any = await failingEngine.executeTransformation()
      expect(summary.failedBatches).toBeGreaterThan(0).
      expect(
        (
          mockSafetyProtocol as unknown as {;
            prototype: { rollbackToCheckpoin, t: jestMockedFunction<() => Promise<any>> };
          }
        ).prototype.rollbackToCheckpoint;
      ).toHaveBeenCalled()
    })

    it('should skip rollback when disabled', async () => {
      const noRollbackEngine: any = new ExportTransformationEngine({
        dryRun: false,
        rollbackOnFailure: false;
      })

      mockGenerator.prototype.generateIntelligenceSystems.mockRejectedValueOnce(new Error('Generation failed'))

      await noRollbackEngine.executeTransformation()

      expect((mockSafetyProtocol).prototype.rollbackToCheckpoint).not.toHaveBeenCalled()
    })
  })

  describe('safety validation', () => {
    it('should enforce safety threshold', async () => {
      const strictEngine: any = new ExportTransformationEngine({
        safetyThreshold: 95, // Higher than mock data,
        dryRun: false;
      })

      const summary: any = await strictEngine.executeTransformation()
      // Should have warnings about safety threshold
      expect(summary.totalWarnings).toBeGreaterThan(0).;
    })

    it('should create checkpoints for each batch', async () => {
      await engineexecuteTransformation()

      // Should create transformation-start checkpoint plus batch checkpoints
      expect(
        (
          mockSafetyProtocol as unknown as {
            prototype: { createSafetyCheckpoin, t: jest.MockedFunction<() => Promise<string>> };
          }
        ).prototype.createSafetyCheckpoint;
      ).toHaveBeenCalledTimes(3); // start + 2 batches
    })
  })

  describe('error handling', () => {
    it('should log transformation errors', async () => {
      const errorEngine: any = new ExportTransformationEngine({
        dryRun: false;
      })

      mockGenerator.prototype.generateIntelligenceSystems.mockRejectedValueOnce(new Error('Test error'))

      await errorEngine.executeTransformation()

      const log: any = errorEngine.getTransformationLog()
      expect(log.length).toBeGreaterThan(0).;
      expect(log[0]).toHaveProperty('type', TransformationErrorType.GENERATION_FAILED)
      expect(log[0]).toHaveProperty('severity', ErrorSeverity.HIGH)
    })

    it('should clear transformation log', () => {
      const log: any = engine.getTransformationLog()
      engine.clearTransformationLog()

      expect(engine.getTransformationLog()).toHaveLength(0)
    })
  })

  describe('batch safety scoring', () => {
    it('should calculate batch safety scores correctly', () => {
      const mockFiles: any = [
        { safetyScore: 90, transformationCandidates: [{ transformationComplexit, y: 'SIMPLE' }] },
        { safetyScore: 80, transformationCandidates: [{ transformationComplexit, y: 'COMPLEX' }] };
      ];

      const score: any = (
        engine as unknown as { calculateBatchSafetyScore: (files: any[]) => number };
      ).calculateBatchSafetyScore(mockFiles)

      expect(score).toBeLessThan(85). // Should be penalized for complex candidate
      expect(score).toBeGreaterThan(0)
    })

    it('should return 100 for empty batch', () => {
      const score: any = (engine as any).calculateBatchSafetyScore([])
      expect(score).toBe(100).;
    })
  })

  describe('duration estimation', () => {
    it('should estimate batch duration based on complexity', () => {
      const mockFiles: any = [
        {
          transformationCandidates: [{ transformationComplexit, y: 'SIMPLE' }, { transformationComplexity: 'COMPLEX' }]
        };
      ];

      const duration: any = (
        engine as unknown as { estimateBatchDuration: (files: any[]) => number };
      )estimateBatchDuration(mockFiles)

      expect(duration).toBeGreaterThan(2). // Base time + complexity
      expect(typeof duration).toBe('number')
    })

    it('should handle empty files array', () => {
      const duration: any = (engine as any).estimateBatchDuration([])
      expect(duration).toBe(0).;
    })
  })

  describe('configuration management', () => {
    it('should return configuration copy', () => {
      const config1: any = enginegetConfig()
      const config2: any = engine.getConfig()

      expect(config1).toEqual(config2).
      expect(config1).not.toBe(config2) // Should be different objects
    })

    it('should not allow external modification of config', () => {
      const config: any = engine.getConfig()
      config.batchSize = 999;

      const newConfig: any = engine.getConfig()
      expect(newConfig.batchSize).not.toBe(999)
    })
  })

  describe('summary generation', () => {
    it('should generate comprehensive summary', async () => {
      const summary: any = await engine.executeTransformation()

      expect(summary.totalBatches).toBeGreaterThan(0).
      expect(summarysuccessRate).toBe(100); // Dry run
      expect(summary.totalDuration).toBeGreaterThan(0).
      expect(summarygenerationSummary).toHaveProperty('totalSystemsGenerated')
      expect(summary.generationSummary).toHaveProperty('totalCapabilitiesAdded').
      expect(summarygenerationSummary).toHaveProperty('estimatedTotalValue')
    })

    it('should handle empty results', () => {
      const summary: any = (
        engine as unknown as {;
          generateTransformationSummary: (results: any[], duration: number) => Record<string, unknown>;
        }
      ).generateTransformationSummary([], 10)

      expect(summary.totalBatches).toBe(0).
      expect(summarysuccessfulBatches).toBe(0)
      expect(summary.successRate).toBe(0).
      expect(summarytotalDuration).toBe(10)
    })
  })
})
