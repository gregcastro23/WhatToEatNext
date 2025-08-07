/**
 * Unit Tests for CampaignController
 * Perfect Codebase Campaign - Testing Infrastructure
 */

import {
  CampaignConfig,
  CampaignPhase,
  PhaseResult,
  ProgressMetrics,
  ValidationResult,
  SafetySettings,
  ProgressTargets,
  ToolConfiguration,
  SafetyLevel,
  PhaseStatus
} from '../../../types/campaign';
import { CampaignController } from '../CampaignController';

// Mock dependencies
jest.mock('child_process');
jest.mock('fs');

describe('CampaignController', () => {
  let controller: CampaignController;
  let mockConfig: CampaignConfig;

  beforeEach(() => {
    // Setup mock configuration
    mockConfig = {
      phases: [
        {
          id: 'phase1',
          name: 'TypeScript Error Elimination',
          description: 'Eliminate all TypeScript compilation errors',
          tools: [
            {
              scriptPath: 'scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js',
              parameters: { maxFiles: 15, autoFix: true, validateSafety: true },
              batchSize: 15,
              safetyLevel: SafetyLevel.MAXIMUM
            }
          ],
          successCriteria: {
            typeScriptErrors: 0
          },
          safetyCheckpoints: []
        },
        {
          id: 'phase2',
          name: 'Linting Excellence Achievement',
          description: 'Eliminate all linting warnings',
          tools: [
            {
              scriptPath: 'scripts/typescript-fixes/fix-explicit-any-systematic.js',
              parameters: { maxFiles: 25, autoFix: true },
              batchSize: 25,
              safetyLevel: SafetyLevel.HIGH
            }
          ],
          successCriteria: {
            lintingWarnings: 0
          },
          safetyCheckpoints: []
        }
      ],
      safetySettings: {
        maxFilesPerBatch: 25,
        buildValidationFrequency: 5,
        testValidationFrequency: 10,
        corruptionDetectionEnabled: true,
        automaticRollbackEnabled: true,
        stashRetentionDays: 7
      },
      progressTargets: {
        typeScriptErrors: 0,
        lintingWarnings: 0,
        buildTime: 10,
        enterpriseSystems: 200
      },
      toolConfiguration: {
        enhancedErrorFixer: 'scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js',
        explicitAnyFixer: 'scripts/typescript-fixes/fix-explicit-any-systematic.js',
        unusedVariablesFixer: 'scripts/typescript-fixes/fix-unused-variables-enhanced.js',
        consoleStatementFixer: 'scripts/lint-fixes/fix-console-statements-only.js'
      }
    };

    controller = new CampaignController(mockConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with provided configuration', () => {
      expect(controller).toBeInstanceOf(CampaignController);
    });

    it('should initialize with empty safety events', () => {
      const events = (controller as unknown as { safetyEvents: unknown[] }).safetyEvents;
      expect(events).toEqual([]);
    });

    it('should set current phase to null initially', () => {
      const currentPhase = (controller as unknown as { currentPhase: CampaignPhase | null }).currentPhase;
      expect(currentPhase).toBeNull();
    });
  });

  describe('executePhase', () => {
    let mockPhase: CampaignPhase;

    beforeEach(() => {
      mockPhase = mockConfig.phases[0];
      
      // Mock private methods
      jest.spyOn(controller as unknown as { createSafetyCheckpoint: () => Promise<string> }, 'createSafetyCheckpoint').mockResolvedValue('checkpoint_123');
      jest.spyOn(controller as unknown as { getCurrentMetrics: () => Promise<ProgressMetrics> }, 'getCurrentMetrics').mockResolvedValue({
        typeScriptErrors: { current: 86, target: 0, reduction: 0, percentage: 0 },
        lintingWarnings: { current: 4506, target: 0, reduction: 0, percentage: 0 },
        buildPerformance: { currentTime: 8.5, targetTime: 10, cacheHitRate: 0.8, memoryUsage: 45 },
        enterpriseSystems: { current: 0, target: 200, transformedExports: 0 }
      });
      jest.spyOn(controller as unknown as { executeTool: (tool: ToolConfiguration, phase: CampaignPhase) => Promise<Record<string, unknown>> }, 'executeTool').mockResolvedValue({
        filesProcessed: ['file1.ts', 'file2.ts'],
        changesApplied: 5,
        success: true
      });
      jest.spyOn(controller as unknown as { validatePhaseProgress: (phase: CampaignPhase) => Promise<ValidationResult> }, 'validatePhaseProgress').mockResolvedValue({
        success: true,
        errors: [],
        warnings: []
      });
    });

    it('should execute phase successfully', async () => {
      const result = await controller.executePhase(mockPhase);

      expect(result.success).toBe(true);
      expect(result.phaseId).toBe('phase1');
      expect(result.filesProcessed).toBe(2);
      expect(result.errorsFixed).toBe(5);
      expect(result.executionTime).toBeGreaterThan(0);
    });

    it('should create safety checkpoint before execution', async () => {
      await controller.executePhase(mockPhase);

      expect(controller['createSafetyCheckpoint']).toHaveBeenCalledWith(
        'Pre-phase checkpoint: TypeScript Error Elimination'
      );
    });

    it('should execute all tools in sequence', async () => {
      await controller.executePhase(mockPhase);

      expect(controller['executeTool']).toHaveBeenCalledTimes(1);
      expect(controller['executeTool']).toHaveBeenCalledWith(mockPhase.tools[0]);
    });

    it('should validate progress after each tool execution', async () => {
      await controller.executePhase(mockPhase);

      expect(controller['validatePhaseProgress']).toHaveBeenCalledWith(mockPhase);
    });

    it('should handle execution failure gracefully', async () => {
      jest.spyOn(controller as any, 'executeTool').mockRejectedValue(new Error('Tool execution failed'));

      const result = await controller.executePhase(mockPhase);

      expect(result.success).toBe(false);
      expect(result.phaseId).toBe('phase1');
      expect(result.filesProcessed).toBe(0);
      expect(result.errorsFixed).toBe(0);
    });

    it('should rollback on validation failure when automatic rollback is enabled', async () => {
      jest.spyOn(controller as unknown as { validatePhaseProgress: (phase: CampaignPhase) => Promise<ValidationResult> }, 'validatePhaseProgress').mockResolvedValue({
        success: false,
        errors: ['Validation failed'],
        warnings: []
      });
      jest.spyOn(controller, 'rollbackToCheckpoint').mockResolvedValue();

      await expect(controller.executePhase(mockPhase)).rejects.toThrow('Tool execution failed: Validation failed');
      expect(controller.rollbackToCheckpoint).toHaveBeenCalledWith('checkpoint_123');
    });

    it('should record safety events during execution', async () => {
      await controller.executePhase(mockPhase);

      const events = (controller as unknown as { safetyEvents: unknown[] }).safetyEvents;
      expect(events.length).toBeGreaterThan(0);
      expect(events[0].description).toContain('Starting phase: TypeScript Error Elimination');
    });
  });

  describe('validatePhaseCompletion', () => {
    let mockPhase: CampaignPhase;

    beforeEach(() => {
      mockPhase = mockConfig.phases[0];
      jest.spyOn(controller as unknown as { getCurrentMetrics: () => Promise<ProgressMetrics> }, 'getCurrentMetrics').mockResolvedValue({
        typeScriptErrors: { current: 0, target: 0, reduction: 86, percentage: 100 },
        lintingWarnings: { current: 4506, target: 0, reduction: 0, percentage: 0 },
        buildPerformance: { currentTime: 8.5, targetTime: 10, cacheHitRate: 0.8, memoryUsage: 45 },
        enterpriseSystems: { current: 0, target: 200, transformedExports: 0 }
      });
    });

    it('should validate successful phase completion', async () => {
      const result = await controller.validatePhaseCompletion(mockPhase);

      expect(result.success).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.warnings).toEqual([]);
    });

    it('should detect TypeScript error validation failure', async () => {
      jest.spyOn(controller as unknown as { getCurrentMetrics: () => Promise<ProgressMetrics> }, 'getCurrentMetrics').mockResolvedValue({
        typeScriptErrors: { current: 5, target: 0, reduction: 81, percentage: 94 },
        lintingWarnings: { current: 4506, target: 0, reduction: 0, percentage: 0 },
        buildPerformance: { currentTime: 8.5, targetTime: 10, cacheHitRate: 0.8, memoryUsage: 45 },
        enterpriseSystems: { current: 0, target: 200, transformedExports: 0 }
      });

      const result = await controller.validatePhaseCompletion(mockPhase);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('TypeScript errors: 5 > 0');
    });

    it('should detect linting warning validation failure', async () => {
      const phaseWithLintingCriteria = {
        ...mockPhase,
        successCriteria: { lintingWarnings: 0 }
      };

      const result = await controller.validatePhaseCompletion(phaseWithLintingCriteria);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Linting warnings: 4506 > 0');
    });

    it('should detect build time validation warning', async () => {
      const phaseWithBuildTimeCriteria = {
        ...mockPhase,
        successCriteria: { buildTime: 5 }
      };

      const result = await controller.validatePhaseCompletion(phaseWithBuildTimeCriteria);

      expect(result.success).toBe(true);
      expect(result.warnings).toContain('Build time: 8.5s > 5s');
    });

    it('should execute custom validation when provided', async () => {
      const customValidation = jest.fn().mockResolvedValue(true);
      const phaseWithCustomValidation = {
        ...mockPhase,
        successCriteria: { customValidation }
      };

      const result = await controller.validatePhaseCompletion(phaseWithCustomValidation);

      expect(customValidation).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should handle validation errors gracefully', async () => {
      jest.spyOn(controller as any, 'getCurrentMetrics').mockRejectedValue(new Error('Metrics error'));

      const result = await controller.validatePhaseCompletion(mockPhase);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Validation error: Metrics error');
    });
  });

  describe('createSafetyCheckpoint', () => {
    it('should create checkpoint with descriptive name', async () => {
      const checkpointId = await controller.createSafetyCheckpoint('Test checkpoint');

      expect(checkpointId).toMatch(/^checkpoint_\d+$/);
    });

    it('should record safety event for checkpoint creation', async () => {
      await controller.createSafetyCheckpoint('Test checkpoint');

      const events = (controller as unknown as { safetyEvents: unknown[] }).safetyEvents;
      expect(events.length).toBe(1);
      expect(events[0].description).toContain('Safety checkpoint created: Test checkpoint');
    });
  });

  describe('rollbackToCheckpoint', () => {
    it('should record safety event for rollback', async () => {
      await controller.rollbackToCheckpoint('checkpoint_123');

      const events = (controller as unknown as { safetyEvents: unknown[] }).safetyEvents;
      expect(events.length).toBe(1);
      expect(events[0].description).toContain('Rolling back to checkpoint: checkpoint_123');
    });
  });

  describe('getProgressMetrics', () => {
    it('should return current metrics', async () => {
      const mockMetrics = {
        typeScriptErrors: { current: 86, target: 0, reduction: 0, percentage: 0 },
        lintingWarnings: { current: 4506, target: 0, reduction: 0, percentage: 0 },
        buildPerformance: { currentTime: 8.5, targetTime: 10, cacheHitRate: 0.8, memoryUsage: 45 },
        enterpriseSystems: { current: 0, target: 200, transformedExports: 0 }
      };

      jest.spyOn(controller as any, 'getCurrentMetrics').mockResolvedValue(mockMetrics);

      const result = await controller.getProgressMetrics();

      expect(result).toEqual(mockMetrics);
    });
  });

  describe('generatePhaseReport', () => {
    let mockPhase: CampaignPhase;

    beforeEach(() => {
      mockPhase = mockConfig.phases[0];
      jest.spyOn(controller as unknown as { getCurrentMetrics: () => Promise<ProgressMetrics> }, 'getCurrentMetrics').mockResolvedValue({
        typeScriptErrors: { current: 0, target: 0, reduction: 86, percentage: 100 },
        lintingWarnings: { current: 4506, target: 0, reduction: 0, percentage: 0 },
        buildPerformance: { currentTime: 8.5, targetTime: 10, cacheHitRate: 0.8, memoryUsage: 45 },
        enterpriseSystems: { current: 0, target: 200, transformedExports: 0 }
      });
      jest.spyOn(controller, 'validatePhaseCompletion').mockResolvedValue({
        success: true,
        errors: [],
        warnings: []
      });
    });

    it('should generate comprehensive phase report', async () => {
      const report = await controller.generatePhaseReport(mockPhase);

      expect(report.phaseId).toBe('phase1');
      expect(report.phaseName).toBe('TypeScript Error Elimination');
      expect(report.status).toBe(PhaseStatus.COMPLETED);
      expect(report.achievements).toContain('Zero TypeScript errors achieved');
      expect(report.issues).toEqual([]);
    });

    it('should show in-progress status for incomplete phase', async () => {
      jest.spyOn(controller, 'validatePhaseCompletion').mockResolvedValue({
        success: false,
        errors: ['TypeScript errors: 5 > 0'],
        warnings: []
      });

      const report = await controller.generatePhaseReport(mockPhase);

      expect(report.status).toBe(PhaseStatus.IN_PROGRESS);
      expect(report.issues).toContain('TypeScript errors: 5 > 0');
    });
  });

  describe('loadConfiguration', () => {
    it('should load default configuration', async () => {
      const config = await CampaignController.loadConfiguration();

      expect(config.phases).toHaveLength(2);
      expect(config.phases[0].name).toBe('TypeScript Error Elimination');
      expect(config.phases[1].name).toBe('Linting Excellence Achievement');
      expect(config.safetySettings.automaticRollbackEnabled).toBe(true);
    });

    it('should have proper tool configuration', async () => {
      const config = await CampaignController.loadConfiguration();

      expect(config.toolConfiguration.enhancedErrorFixer).toContain('fix-typescript-errors-enhanced-v3.js');
      expect(config.toolConfiguration.explicitAnyFixer).toContain('fix-explicit-any-systematic.js');
    });

    it('should have proper progress targets', async () => {
      const config = await CampaignController.loadConfiguration();

      expect(config.progressTargets.typeScriptErrors).toBe(0);
      expect(config.progressTargets.lintingWarnings).toBe(0);
      expect(config.progressTargets.buildTime).toBe(10);
      expect(config.progressTargets.enterpriseSystems).toBe(200);
    });
  });

  describe('Safety Event Management', () => {
    it('should limit safety events to prevent memory issues', async () => {
      // Add many safety events
      for (let i = 0; i < 1100; i++) {
        (controller as unknown as { addSafetyEvent: (event: Record<string, unknown>) => void }).addSafetyEvent({
          type: 'CHECKPOINT_CREATED',
          timestamp: new Date(),
          description: `Event ${i}`,
          severity: 'INFO',
          action: 'TEST'
        });
      }

      const events = (controller as unknown as { safetyEvents: unknown[] }).safetyEvents;
      expect(events.length).toBe(500); // Should be trimmed to 500
    });

    it('should preserve most recent events when trimming', async () => {
      // Add many safety events
      for (let i = 0; i < 1100; i++) {
        (controller as unknown as { addSafetyEvent: (event: Record<string, unknown>) => void }).addSafetyEvent({
          type: 'CHECKPOINT_CREATED',
          timestamp: new Date(),
          description: `Event ${i}`,
          severity: 'INFO',
          action: 'TEST'
        });
      }

      const events = (controller as unknown as { safetyEvents: unknown[] }).safetyEvents;
      expect(events[events.length - 1].description).toBe('Event 1099');
    });
  });

  describe('Metrics Improvement Calculation', () => {
    it('should calculate metrics improvement correctly', () => {
      const initialMetrics = {
        typeScriptErrors: { current: 86, target: 0, reduction: 0, percentage: 0 },
        lintingWarnings: { current: 4506, target: 0, reduction: 0, percentage: 0 },
        buildPerformance: { currentTime: 10.5, targetTime: 10, cacheHitRate: 0.7, memoryUsage: 55 },
        enterpriseSystems: { current: 0, target: 200, transformedExports: 0 }
      };

      const finalMetrics = {
        typeScriptErrors: { current: 50, target: 0, reduction: 36, percentage: 42 },
        lintingWarnings: { current: 3000, target: 0, reduction: 1506, percentage: 33 },
        buildPerformance: { currentTime: 8.5, targetTime: 10, cacheHitRate: 0.8, memoryUsage: 45 },
        enterpriseSystems: { current: 50, target: 200, transformedExports: 50 }
      };

      const improvement = (controller as unknown as { calculateMetricsImprovement: (initial: ProgressMetrics, final: ProgressMetrics) => Record<string, unknown> }).calculateMetricsImprovement(initialMetrics, finalMetrics);

      expect(improvement.typeScriptErrorsReduced).toBe(36);
      expect(improvement.lintingWarningsReduced).toBe(1506);
      expect(improvement.buildTimeImproved).toBe(2);
      expect(improvement.enterpriseSystemsAdded).toBe(50);
    });
  });

  describe('Achievement Generation', () => {
    it('should generate achievements for zero TypeScript errors', () => {
      const metrics = {
        typeScriptErrors: { current: 0, target: 0, reduction: 86, percentage: 100 },
        lintingWarnings: { current: 4506, target: 0, reduction: 0, percentage: 0 },
        buildPerformance: { currentTime: 8.5, targetTime: 10, cacheHitRate: 0.8, memoryUsage: 45 },
        enterpriseSystems: { current: 0, target: 200, transformedExports: 0 }
      };

      const achievements = (controller as unknown as { generateAchievements: (phase: CampaignPhase, metrics: ProgressMetrics) => string[] }).generateAchievements(mockConfig.phases[0], metrics);

      expect(achievements).toContain('Zero TypeScript errors achieved');
      expect(achievements).toContain('Build time under 10 seconds maintained');
    });

    it('should generate achievements for zero linting warnings', () => {
      const metrics = {
        typeScriptErrors: { current: 5, target: 0, reduction: 81, percentage: 94 },
        lintingWarnings: { current: 0, target: 0, reduction: 4506, percentage: 100 },
        buildPerformance: { currentTime: 8.5, targetTime: 10, cacheHitRate: 0.8, memoryUsage: 45 },
        enterpriseSystems: { current: 0, target: 200, transformedExports: 0 }
      };

      const achievements = (controller as any).generateAchievements(mockConfig.phases[1], metrics);

      expect(achievements).toContain('Zero linting warnings achieved');
      expect(achievements).toContain('Build time under 10 seconds maintained');
    });
  });

  describe('Recommendation Generation', () => {
    it('should recommend addressing validation errors', () => {
      const validation = {
        success: false,
        errors: ['TypeScript errors: 5 > 0'],
        warnings: []
      };

      const recommendations = (controller as unknown as { generateRecommendations: (phase: CampaignPhase, validation: ValidationResult) => string[] }).generateRecommendations(mockConfig.phases[0], validation);

      expect(recommendations).toContain('Address validation errors before proceeding');
    });

    it('should recommend addressing warnings', () => {
      const validation = {
        success: true,
        errors: [],
        warnings: ['Build time: 12s > 10s']
      };

      const recommendations = (controller as unknown as { generateRecommendations: (phase: CampaignPhase, validation: ValidationResult) => string[] }).generateRecommendations(mockConfig.phases[0], validation);

      expect(recommendations).toContain('Consider addressing warnings for optimal performance');
    });
  });
});