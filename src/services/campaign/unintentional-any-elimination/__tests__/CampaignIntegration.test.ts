/**
 * Campaign Integration Tests
 * Tests for the campaign system integration layer
 */

import {
    UnintentionalAnyCampaignController,
    UnintentionalAnyIntegrationHelper,
    createUnintentionalAnyCampaignController
} from '../CampaignIntegration';

import {
    UnintentionalAnyCampaignScheduler,
    UnintentionalAnyProgressTracker
} from '../MetricsIntegration';

import {
    CampaignConfig,
    CampaignPhase
} from '../../../../types/campaign';

import { UnintentionalAnyConfig } from '../types';

describe('UnintentionalAnyCampaignController', () => {
  let controller: UnintentionalAnyCampaignController;
  let mockConfig: CampaignConfig;
  let mockUnintentionalAnyConfig: UnintentionalAnyConfig;

  beforeEach(() => {
    mockConfig = {
      phases: [],
      safetySettings: { maxFilesPerBatch: 15,
        buildValidationFrequency: 5,
        testValidationFrequency: 10,
        corruptionDetectionEnabled: true,
        automaticRollbackEnabled: true,
        stashRetentionDays: 7
      },
      progressTargets: { typeScriptErrors: 0,
        lintingWarnings: 0,
        buildTime: 10,
        enterpriseSystems: 200
      },
      toolConfiguration: { enhancedErrorFixer: 'test-script.js',
        explicitAnyFixer: 'test-script.js',
        unusedVariablesFixer: 'test-script.js',
        consoleStatementFixer: 'test-script.js'
      }
    };

    mockUnintentionalAnyConfig = {
      maxFilesPerBatch: 15,
      targetReductionPercentage: 15,
      confidenceThreshold: 0.8,
      enableDomainAnalysis: true,
      enableDocumentation: true,
      safetyLevel: 'CONSERVATIVE',
      validationFrequency: 5
    };

    controller = new UnintentionalAnyCampaignController(mockConfig, mockUnintentionalAnyConfig);
  });

  describe('constructor', () => {
    it('should create controller with default configuration', () => {
      const defaultController: any = new UnintentionalAnyCampaignController(mockConfig);
      const config: any = defaultController.getUnintentionalAnyConfig();

      expect(config.maxFilesPerBatch).toBe(15);
      expect(config.targetReductionPercentage).toBe(15);
      expect(config.confidenceThreshold).toBe(0.8);
      expect(config.safetyLevel).toBe('CONSERVATIVE');
    });

    it('should merge custom configuration with defaults', () => {
      const customConfig: any = {
        maxFilesPerBatch: 10,
        targetReductionPercentage: 20
      };

      const customController: any = new UnintentionalAnyCampaignController(mockConfig, customConfig);
      const config: any = customController.getUnintentionalAnyConfig();

      expect(config.maxFilesPerBatch).toBe(10);
      expect(config.targetReductionPercentage).toBe(20);
      expect(config.confidenceThreshold).toBe(0.8); // Default value
    });
  });

  describe('createUnintentionalAnyEliminationConfig', () => {
    it('should create campaign configuration with unintentional any phases', () => {
      const config: any = UnintentionalAnyCampaignController.createUnintentionalAnyEliminationConfig();

      expect(config.phases).toBeDefined();
      expect(config.phases.length).toBeGreaterThan(0);

      const phaseIds: any = config.phases.map(phase => phase.id);
      expect(phaseIds).toContain('unintentional-any-analysis');
      expect(phaseIds).toContain('unintentional-any-replacement');
      expect(phaseIds).toContain('intentional-any-documentation');
    });

    it('should merge base configuration with unintentional any configuration', () => {
      const baseConfig: any = {
        phases: [{ id: 'existing-phase',
          name: 'Existing Phase',
          description: 'Test phase',
          tools: [],
          successCriteria: {},
          safetyCheckpoints: []
        }]
      };

      const config: any = UnintentionalAnyCampaignController.createUnintentionalAnyEliminationConfig(baseConfig);

      expect(config.phases.length).toBeGreaterThan(1);
      expect(config.phases.[0].id).toBe('existing-phase');
    });
  });

  describe('getUnintentionalAnyMetrics', () => {
    it('should return metrics with default values when linting fails', async () => {
      const metrics: any = await controller.getUnintentionalAnyMetrics();

      expect(metrics).toBeDefined();
      expect(typeof metrics.totalAnyTypes).toBe('number');
      expect(typeof metrics.intentionalAnyTypes).toBe('number');
      expect(typeof metrics.unintentionalAnyTypes).toBe('number');
      expect(typeof metrics.documentationCoverage).toBe('number');
      expect(metrics.targetReduction).toBe(15);
    });
  });

  describe('updateUnintentionalAnyConfig', () => {
    it('should update configuration', () => {
      const newConfig: any = {
        maxFilesPerBatch: 20,
        targetReductionPercentage: 25
      };

      controller.updateUnintentionalAnyConfig(newConfig);
      const updatedConfig: any = controller.getUnintentionalAnyConfig();

      expect(updatedConfig.maxFilesPerBatch).toBe(20);
      expect(updatedConfig.targetReductionPercentage).toBe(25);
    });
  });

  describe('validateUnintentionalAnyPhaseCompletion', () => {
    it('should validate analysis phase completion', async () => {
      const mockPhase: CampaignPhase = { id: 'unintentional-any-analysis',
        name: 'Analysis Phase',
        description: 'Test analysis phase',
        tools: [],
        successCriteria: {},
        safetyCheckpoints: []
      };

      const mockMetrics: any = {
        totalAnyTypes: 10,
        intentionalAnyTypes: 5,
        unintentionalAnyTypes: 5,
        documentedAnyTypes: 3,
        documentationCoverage: 60,
        reductionFromBaseline: 0,
        targetReduction: 15
      };

      const validation: any = await controller.validateUnintentionalAnyPhaseCompletion(mockPhase, mockMetrics);

      expect(validation.success).toBe(false); // Build validation will fail in test environment
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });
});

describe('createUnintentionalAnyCampaignController', () => {
  it('should create controller with factory function', () => {
    const controller: any = createUnintentionalAnyCampaignController();

    expect(controller).toBeInstanceOf(UnintentionalAnyCampaignController);

    const config: any = controller.getUnintentionalAnyConfig();
    expect(config.maxFilesPerBatch).toBe(15);
    expect(config.targetReductionPercentage).toBe(15);
  });

  it('should create controller with custom configuration', () => {
    const customConfig: any = {
      maxFilesPerBatch: 10,
      targetReductionPercentage: 20
    };

    const controller: any = createUnintentionalAnyCampaignController(undefined, customConfig);
    const config: any = controller.getUnintentionalAnyConfig();

    expect(config.maxFilesPerBatch).toBe(10);
    expect(config.targetReductionPercentage).toBe(20);
  });
});

describe('UnintentionalAnyIntegrationHelper', () => {
  describe('addUnintentionalAnyPhases', () => {
    it('should add unintentional any phases to existing configuration', () => {
      const existingConfig: CampaignConfig = { phases: [{
          id: 'existing-phase',
          name: 'Existing Phase',
          description: 'Test phase',
          tools: [],
          successCriteria: {},
          safetyCheckpoints: []
        }],
        safetySettings: { maxFilesPerBatch: 15,
          buildValidationFrequency: 5,
          testValidationFrequency: 10,
          corruptionDetectionEnabled: true,
          automaticRollbackEnabled: true,
          stashRetentionDays: 7
        },
        progressTargets: { typeScriptErrors: 0,
          lintingWarnings: 0,
          buildTime: 10,
          enterpriseSystems: 200
        },
        toolConfiguration: { enhancedErrorFixer: 'test-script.js',
          explicitAnyFixer: 'test-script.js',
          unusedVariablesFixer: 'test-script.js',
          consoleStatementFixer: 'test-script.js'
        }
      };

      const updatedConfig: any = UnintentionalAnyIntegrationHelper.addUnintentionalAnyPhases(existingConfig);

      expect(updatedConfig.phases.length).toBeGreaterThan(1);
      expect(updatedConfig.phases.[0].id).toBe('existing-phase');

      const phaseIds: any = updatedConfig.phases.map(phase => phase.id);
      expect(phaseIds).toContain('unintentional-any-analysis');
    });
  });

  describe('createAutomationScriptCompatibility', () => {
    it('should return automation script paths', () => {
      const compatibility: any = UnintentionalAnyIntegrationHelper.createAutomationScriptCompatibility();

      expect(compatibility.explicitAnyFixer).toContain('ProgressiveImprovementEngine');
      expect(compatibility.unintentionalAnyAnalyzer).toContain('AnyTypeClassifier');
      expect(compatibility.documentationGenerator).toContain('AutoDocumentationGenerator');
    });
  });

  describe('resolveCampaignPriorityConflicts', () => {
    it('should resolve conflicts between multiple campaigns', () => {
      const campaign1: CampaignConfig = { phases: [{
          id: 'typescript-phase',
          name: 'TypeScript Phase',
          description: 'Test phase',
          tools: [],
          successCriteria: {},
          safetyCheckpoints: []
        }],
        safetySettings: { maxFilesPerBatch: 20,
          buildValidationFrequency: 3,
          testValidationFrequency: 10,
          corruptionDetectionEnabled: true,
          automaticRollbackEnabled: true,
          stashRetentionDays: 7
        },
        progressTargets: { typeScriptErrors: 0,
          lintingWarnings: 0,
          buildTime: 10,
          enterpriseSystems: 200
        },
        toolConfiguration: { enhancedErrorFixer: 'test-script.js',
          explicitAnyFixer: 'test-script.js',
          unusedVariablesFixer: 'test-script.js',
          consoleStatementFixer: 'test-script.js'
        }
      };

      const campaign2: CampaignConfig = { phases: [{
          id: 'linting-phase',
          name: 'Linting Phase',
          description: 'Test phase',
          tools: [],
          successCriteria: {},
          safetyCheckpoints: []
        }],
        safetySettings: { maxFilesPerBatch: 15,
          buildValidationFrequency: 5,
          testValidationFrequency: 10,
          corruptionDetectionEnabled: true,
          automaticRollbackEnabled: true,
          stashRetentionDays: 7
        },
        progressTargets: { typeScriptErrors: 0,
          lintingWarnings: 0,
          buildTime: 10,
          enterpriseSystems: 200
        },
        toolConfiguration: { enhancedErrorFixer: 'test-script.js',
          explicitAnyFixer: 'test-script.js',
          unusedVariablesFixer: 'test-script.js',
          consoleStatementFixer: 'test-script.js'
        }
      };

      const priorityOrder: any = ['typescript', 'linting'];
      const mergedConfig: any = UnintentionalAnyIntegrationHelper.resolveCampaignPriorityConflicts(
        [campaign1, campaign2],
        priorityOrder
      );

      expect(mergedConfig.phases.length).toBe(2);
      expect(mergedConfig.phases.[0].id).toBe('typescript-phase');
      expect(mergedConfig.phases.[1].id).toBe('linting-phase');

      // Should use most conservative safety settings
      expect(mergedConfig.safetySettings.maxFilesPerBatch).toBe(15);
      expect(mergedConfig.safetySettings.buildValidationFrequency).toBe(3);
    });
  });
});

describe('UnintentionalAnyProgressTracker', () => {
  let tracker: UnintentionalAnyProgressTracker;

  beforeEach(() => {
    tracker = new UnintentionalAnyProgressTracker();
  });

  describe('getUnintentionalAnyMetrics', () => {
    it('should return default metrics when linting fails', async () => {
      const metrics: any = await tracker.getUnintentionalAnyMetrics();

      expect(metrics).toBeDefined();
      expect(metrics.totalAnyTypes).toBe(0);
      expect(metrics.intentionalAnyTypes).toBe(0);
      expect(metrics.unintentionalAnyTypes).toBe(0);
      expect(metrics.documentationCoverage).toBe(0);
      expect(metrics.targetReduction).toBe(15);
    });
  });

  describe('setBaselineMetrics', () => {
    it('should set baseline metrics', async () => {
      await tracker.setBaselineMetrics();

      const history: any = tracker.getUnintentionalAnyMetricsHistory();
      expect(history.length).toBeGreaterThan(0);
    });
  });

  describe('validateUnintentionalAnyMilestone', () => {
    it('should validate baseline-established milestone', async () => {
      const isValid: any = await tracker.validateUnintentionalAnyMilestone('baseline-established');
      expect(typeof isValid).toBe('boolean');
    });

    it('should validate analysis-complete milestone', async () => {
      const isValid: any = await tracker.validateUnintentionalAnyMilestone('analysis-complete');
      expect(typeof isValid).toBe('boolean');
    });

    it('should return false for unknown milestone', async () => {
      const isValid: any = await tracker.validateUnintentionalAnyMilestone('unknown-milestone' as any);
      expect(isValid).toBe(false);
    });
  });

  describe('getDashboardMetrics', () => {
    it('should return dashboard-compatible metrics', async () => {
      const dashboardMetrics: any = await tracker.getDashboardMetrics();

      expect(dashboardMetrics.current).toBeDefined();
      expect(dashboardMetrics.trend).toMatch(/improving|stable|declining/);
      expect(Array.isArray(dashboardMetrics.topFiles)).toBe(true);
      expect(Array.isArray(dashboardMetrics.alerts)).toBe(true);
      expect(Array.isArray(dashboardMetrics.recommendations)).toBe(true);
      expect(dashboardMetrics.lastUpdated).toBeInstanceOf(Date);
    });
  });

  describe('resetUnintentionalAnyMetricsHistory', () => {
    it('should reset metrics history', async () => {
      await tracker.setBaselineMetrics();
      expect(tracker.getUnintentionalAnyMetricsHistory().length).toBeGreaterThan(0);

      tracker.resetUnintentionalAnyMetricsHistory();
      expect(tracker.getUnintentionalAnyMetricsHistory().length).toBe(0);
    });
  });
});

describe('UnintentionalAnyCampaignScheduler', () => {
  let scheduler: UnintentionalAnyCampaignScheduler;

  beforeEach(() => {
    scheduler = new UnintentionalAnyCampaignScheduler();
  });

  describe('shouldTriggerCampaign', () => {
    it('should return trigger decision', async () => {
      const decision: any = await scheduler.shouldTriggerCampaign();

      expect(decision.shouldTrigger).toBeDefined();
      expect(typeof decision.shouldTrigger).toBe('boolean');
      expect(decision.reason).toBeDefined();
      expect(decision.priority).toMatch(/low|medium|high/);
    });
  });

  describe('resolveCampaignConflicts', () => {
    it('should resolve conflicts with no active campaigns', () => {
      const resolution: any = scheduler.resolveCampaignConflicts([], 'unintentional-any-elimination');

      expect(resolution.canProceed).toBe(true);
      expect(resolution.conflictingCampaigns).toEqual([]);
      expect(resolution.resolution).toContain('No conflicts');
    });

    it('should detect conflicts with typescript campaigns', () => {
      const activeCampaigns: any = ['typescript-error-elimination', 'other-campaign'];
      const resolution: any = scheduler.resolveCampaignConflicts(activeCampaigns, 'unintentional-any-elimination');

      expect(resolution.conflictingCampaigns).toContain('typescript-error-elimination');
      expect(resolution.conflictingCampaigns).not.toContain('other-campaign');
    });

    it('should prevent execution when critical campaigns are active', () => {
      const activeCampaigns: any = ['critical-typescript-emergency'];
      const resolution: any = scheduler.resolveCampaignConflicts(activeCampaigns, 'unintentional-any-elimination');

      expect(resolution.canProceed).toBe(false);
      expect(resolution.resolution).toContain('Wait for critical campaigns');
    });
  });

  describe('getRecommendedExecutionTime', () => {
    it('should recommend immediate execution for low load', () => {
      const recommendation: any = scheduler.getRecommendedExecutionTime([], 'low');

      expect(recommendation.recommendedTime).toBeInstanceOf(Date);
      expect(recommendation.reason).toContain('immediately');
      expect(recommendation.estimatedDuration).toBeLessThan(30);
    });

    it('should delay execution for high load', () => {
      const recommendation: any = scheduler.getRecommendedExecutionTime(['active-campaign'], 'high');

      expect(recommendation.recommendedTime).toBeInstanceOf(Date);
      expect(recommendation.reason).toContain('later');
      expect(recommendation.estimatedDuration).toBeGreaterThan(30);
    });
  });
});
