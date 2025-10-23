/**
 * Campaign Infrastructure Tests
 * Perfect Codebase Campaign - Infrastructure Validation
 */

import { SafetyLevel, PhaseStatus } from '../../types/campaign';

import { CampaignController } from './CampaignController';
import { ProgressTracker } from './ProgressTracker';
import { SafetyProtocol } from './SafetyProtocol';

describe('Campaign Infrastructure', () => {
  describe('CampaignController', () => {
    test('should load default configuration', async () => {
      const config = await CampaignController.loadConfiguration();

      expect(config).toBeDefined();
      expect(config.phases).toHaveLength(2);
      expect(config.phases[0].id).toBe('phase1');
      expect(config.phases[0].name).toBe('TypeScript Error Elimination');
      expect(config.phases[1].id).toBe('phase2');
      expect(config.phases[1].name).toBe('Linting Excellence Achievement');
    });

    test('should create campaign controller with config', () => {
      const mockConfig = {
        phases: [],
        safetySettings: {
          maxFilesPerBatch: 25,
          buildValidationFrequency: 5,
          testValidationFrequency: 10,
          corruptionDetectionEnabled: true,
          automaticRollbackEnabled: true,
          stashRetentionDays: 7,
        },
        progressTargets: {
          typeScriptErrors: 0,
          lintingWarnings: 0,
          buildTime: 10,
          enterpriseSystems: 200,
        },
        toolConfiguration: {
          enhancedErrorFixer: 'scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js',
          explicitAnyFixer: 'scripts/typescript-fixes/fix-explicit-any-systematic.js',
          unusedVariablesFixer: 'scripts/typescript-fixes/fix-unused-variables-enhanced.js',
          consoleStatementFixer: 'scripts/lint-fixes/fix-console-statements-only.js',
        },
      };

      const controller = new CampaignController(mockConfig);
      expect(controller).toBeDefined();
    });

    test('should validate phase completion', async () => {
      const config = await CampaignController.loadConfiguration();
      const controller = new CampaignController(config);

      const mockPhase = {
        id: 'test-phase',
        name: 'Test Phase',
        description: 'Test phase for validation',
        tools: [],
        successCriteria: {
          typeScriptErrors: 0,
        },
        safetyCheckpoints: [],
      };

      const validation = await controller.validatePhaseCompletion(mockPhase);
      expect(validation).toBeDefined();
      expect(validation.success).toBeDefined();
      expect(validation.errors).toBeDefined();
      expect(validation.warnings).toBeDefined();
    });
  });

  describe('SafetyProtocol', () => {
    test('should create safety protocol with settings', () => {
      const settings = {
        maxFilesPerBatch: 25,
        buildValidationFrequency: 5,
        testValidationFrequency: 10,
        corruptionDetectionEnabled: true,
        automaticRollbackEnabled: true,
        stashRetentionDays: 7,
      };

      const safetyProtocol = new SafetyProtocol(settings);
      expect(safetyProtocol).toBeDefined();
    });

    test('should detect corruption patterns', async () => {
      const settings = {
        maxFilesPerBatch: 25,
        buildValidationFrequency: 5,
        testValidationFrequency: 10,
        corruptionDetectionEnabled: true,
        automaticRollbackEnabled: true,
        stashRetentionDays: 7,
      };

      const safetyProtocol = new SafetyProtocol(settings);

      // Test with empty file list (should not crash)
      const report = await safetyProtocol.detectCorruption([]);
      expect(report).toBeDefined();
      expect(report.detectedFiles).toEqual([]);
      expect(report.corruptionPatterns).toEqual([]);
    });

    test('should validate git state', async () => {
      const settings = {
        maxFilesPerBatch: 25,
        buildValidationFrequency: 5,
        testValidationFrequency: 10,
        corruptionDetectionEnabled: true,
        automaticRollbackEnabled: true,
        stashRetentionDays: 7,
      };

      const safetyProtocol = new SafetyProtocol(settings);
      const validation = await safetyProtocol.validateGitState();

      expect(validation).toBeDefined();
      expect(validation.success).toBeDefined();
      expect(validation.errors).toBeDefined();
      expect(validation.warnings).toBeDefined();
    });
  });

  describe('ProgressTracker', () => {
    test('should create progress tracker', () => {
      const tracker = new ProgressTracker();
      expect(tracker).toBeDefined();
    });

    test('should get progress metrics', async () => {
      const tracker = new ProgressTracker();
      const metrics = await tracker.getProgressMetrics();

      expect(metrics).toBeDefined();
      expect(metrics.typeScriptErrors).toBeDefined();
      expect(metrics.lintingWarnings).toBeDefined();
      expect(metrics.buildPerformance).toBeDefined();
      expect(metrics.enterpriseSystems).toBeDefined();

      expect(typeof metrics.typeScriptErrors.current).toBe('number');
      expect(typeof metrics.lintingWarnings.current).toBe('number');
      expect(typeof metrics.buildPerformance.currentTime).toBe('number');
      expect(typeof metrics.enterpriseSystems.current).toBe('number');
    });

    test('should validate milestones', async () => {
      const tracker = new ProgressTracker();

      // Test milestone validation (should not crash)
      const result = await tracker.validateMilestone('zero-typescript-errors');
      expect(typeof result).toBe('boolean');
    });

    test('should generate progress report', async () => {
      const tracker = new ProgressTracker();
      const report = await tracker.generateProgressReport();

      expect(report).toBeDefined();
      expect(report.campaignId).toBe('perfect-codebase-campaign');
      expect(report.overallProgress).toBeDefined();
      expect(report.phases).toBeDefined();
      expect(report.currentMetrics).toBeDefined();
      expect(report.targetMetrics).toBeDefined();
      expect(report.estimatedCompletion).toBeDefined();

      expect(typeof report.overallProgress).toBe('number');
      expect(Array.isArray(report.phases)).toBe(true);
    });

    test('should track metrics history', async () => {
      const tracker = new ProgressTracker();

      // Get metrics to populate history
      await tracker.getProgressMetrics();
      await tracker.getProgressMetrics();

      const history = tracker.getMetricsHistory();
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
    });

    test('should calculate metrics improvement', async () => {
      const tracker = new ProgressTracker();

      // Get metrics to populate history
      await tracker.getProgressMetrics();

      const improvement = tracker.getMetricsImprovement();
      expect(improvement).toBeDefined();
      expect(typeof improvement.typeScriptErrorsReduced).toBe('number');
      expect(typeof improvement.lintingWarningsReduced).toBe('number');
      expect(typeof improvement.buildTimeImproved).toBe('number');
      expect(typeof improvement.enterpriseSystemsAdded).toBe('number');
    });

    test('should reset metrics history', () => {
      const tracker = new ProgressTracker();

      tracker.resetMetricsHistory();
      const history = tracker.getMetricsHistory();
      expect(history).toEqual([]);
    });
  });

  describe('Integration Tests', () => {
    test('should integrate all components', async () => {
      // Load configuration
      const config = await CampaignController.loadConfiguration();

      // Create components
      const controller = new CampaignController(config);
      const safetyProtocol = new SafetyProtocol(config.safetySettings);
      const tracker = new ProgressTracker();

      // Test basic integration
      const metrics = await tracker.getProgressMetrics();
      const validation = await safetyProtocol.validateGitState();
      const report = await controller.generatePhaseReport(config.phases[0]);

      expect(metrics).toBeDefined();
      expect(validation).toBeDefined();
      expect(report).toBeDefined();
      expect(report.phaseId).toBe('phase1');
    });
  });
});
