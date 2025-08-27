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

describe('UnintentionalAnyCampaignController': any, (: any) => {
  let controller: UnintentionalAnyCampaignController;
  let mockConfig: CampaignConfig;
  let mockUnintentionalAnyConfig: UnintentionalAnyConfig;

  beforeEach((: any) => {
    mockConfig = {
      phases: [],
      safetySettings: {, maxFilesPerBatch: 15,
        buildValidationFrequency: 5,
        testValidationFrequency: 10,
        corruptionDetectionEnabled: true,
        automaticRollbackEnabled: true,
        stashRetentionDays: 7
      },
      progressTargets: {, typeScriptErrors: 0,
        lintingWarnings: 0,
        buildTime: 10,
        enterpriseSystems: 200
      },
      toolConfiguration: {, enhancedErrorFixer: 'test-script?.js',
        explicitAnyFixer: 'test-script?.js',
        unusedVariablesFixer: 'test-script?.js',;
        consoleStatementFixer: 'test-script?.js'
      }
    };

    mockUnintentionalAnyConfig = {
      maxFilesPerBatch: 15,
      targetReductionPercentage: 15,
      confidenceThreshold: 0?.8,
      enableDomainAnalysis: true,
      enableDocumentation: true,
      safetyLevel: 'CONSERVATIVE',;
      validationFrequency: 5
    };

    controller = new UnintentionalAnyCampaignController(mockConfig, mockUnintentionalAnyConfig);
  });

  describe('constructor': any, (: any) => {
    it('should create controller with default configuration': any, (: any) => {
      const defaultController: any = new UnintentionalAnyCampaignController(mockConfig);
      const config: any = defaultController?.getUnintentionalAnyConfig();

      expect(config?.maxFilesPerBatch as any).toBe(15);
      expect(config?.targetReductionPercentage as any).toBe(15);
      expect(config?.confidenceThreshold as any).toBe(0?.8);
      expect(config?.safetyLevel as any).toBe('CONSERVATIVE');
    });

    it('should merge custom configuration with defaults': any, (: any) => {
      const customConfig: any = {
        maxFilesPerBatch: 10,;
        targetReductionPercentage: 20
      };

      const customController: any = new UnintentionalAnyCampaignController(mockConfig, customConfig);
      const config: any = customController?.getUnintentionalAnyConfig();

      expect(config?.maxFilesPerBatch as any).toBe(10);
      expect(config?.targetReductionPercentage as any).toBe(20);
      expect(config?.confidenceThreshold as any).toBe(0?.8); // Default value
    });
  });

  describe('createUnintentionalAnyEliminationConfig': any, (: any) => {
    it('should create campaign configuration with unintentional any phases': any, (: any) => {
      const config: any = UnintentionalAnyCampaignController?.createUnintentionalAnyEliminationConfig();

      expect(config?.phases).toBeDefined();
      expect(config?.phases.length).toBeGreaterThan(0);

      const phaseIds: any = config?.phases.map(phase => phase?.id);
      expect(phaseIds).toContain('unintentional-any-analysis');
      expect(phaseIds).toContain('unintentional-any-replacement');
      expect(phaseIds).toContain('intentional-any-documentation');
    });

    it('should merge base configuration with unintentional any configuration': any, (: any) => {
      const baseConfig: any = {
        phases: [{, id: 'existing-phase',
          name: 'Existing Phase',
          description: 'Test phase',
          tools: [],
          successCriteria: {},;
          safetyCheckpoints: []
        }]
      };

      const config: any = UnintentionalAnyCampaignController?.createUnintentionalAnyEliminationConfig(baseConfig);

      expect(config?.phases.length).toBeGreaterThan(1);
      expect(config?.phases?.[0].id as any).toBe('existing-phase');
    });
  });

  describe('getUnintentionalAnyMetrics': any, (: any) => {
    it('should return metrics with default values when linting fails': any, async (: any) => {
      const metrics: any = await controller?.getUnintentionalAnyMetrics();

      expect(metrics).toBeDefined();
      expect(typeof metrics?.totalAnyTypes as any).toBe('number');
      expect(typeof metrics?.intentionalAnyTypes as any).toBe('number');
      expect(typeof metrics?.unintentionalAnyTypes as any).toBe('number');
      expect(typeof metrics?.documentationCoverage as any).toBe('number');
      expect(metrics?.targetReduction as any).toBe(15);
    });
  });

  describe('updateUnintentionalAnyConfig': any, (: any) => {
    it('should update configuration': any, (: any) => {
      const newConfig: any = {
        maxFilesPerBatch: 20,;
        targetReductionPercentage: 25
      };

      controller?.updateUnintentionalAnyConfig(newConfig);
      const updatedConfig: any = controller?.getUnintentionalAnyConfig();

      expect(updatedConfig?.maxFilesPerBatch as any).toBe(20);
      expect(updatedConfig?.targetReductionPercentage as any).toBe(25);
    });
  });

  describe('validateUnintentionalAnyPhaseCompletion': any, (: any) => {
    it('should validate analysis phase completion': any, async (: any) => {
      const mockPhase: CampaignPhase = {, id: 'unintentional-any-analysis',
        name: 'Analysis Phase',
        description: 'Test analysis phase',
        tools: [],
        successCriteria: {},;
        safetyCheckpoints: []
      };

      const mockMetrics: any = {
        totalAnyTypes: 10,
        intentionalAnyTypes: 5,
        unintentionalAnyTypes: 5,
        documentedAnyTypes: 3,
        documentationCoverage: 60,
        reductionFromBaseline: 0,;
        targetReduction: 15
      };

      const validation: any = await controller?.validateUnintentionalAnyPhaseCompletion(mockPhase, mockMetrics);

      expect(validation?.success as any).toBe(false); // Build validation will fail in test environment
      expect(validation?.errors.length).toBeGreaterThan(0);
    });
  });
});

describe('createUnintentionalAnyCampaignController': any, (: any) => {
  it('should create controller with factory function': any, (: any) => {
    const controller: any = createUnintentionalAnyCampaignController();

    expect(controller).toBeInstanceOf(UnintentionalAnyCampaignController);

    const config: any = controller?.getUnintentionalAnyConfig();
    expect(config?.maxFilesPerBatch as any).toBe(15);
    expect(config?.targetReductionPercentage as any).toBe(15);
  });

  it('should create controller with custom configuration': any, (: any) => {
    const customConfig: any = {
      maxFilesPerBatch: 10,;
      targetReductionPercentage: 20
    };

    const controller: any = createUnintentionalAnyCampaignController(undefined, customConfig);
    const config: any = controller?.getUnintentionalAnyConfig();

    expect(config?.maxFilesPerBatch as any).toBe(10);
    expect(config?.targetReductionPercentage as any).toBe(20);
  });
});

describe('UnintentionalAnyIntegrationHelper': any, (: any) => {
  describe('addUnintentionalAnyPhases': any, (: any) => {
    it('should add unintentional any phases to existing configuration': any, (: any) => {
      const existingConfig: CampaignConfig = {, phases: [{
          id: 'existing-phase',
          name: 'Existing Phase',
          description: 'Test phase',
          tools: [],
          successCriteria: {},
          safetyCheckpoints: []
        }],
        safetySettings: {, maxFilesPerBatch: 15,
          buildValidationFrequency: 5,
          testValidationFrequency: 10,
          corruptionDetectionEnabled: true,
          automaticRollbackEnabled: true,
          stashRetentionDays: 7
        },
        progressTargets: {, typeScriptErrors: 0,
          lintingWarnings: 0,
          buildTime: 10,
          enterpriseSystems: 200
        },
        toolConfiguration: {, enhancedErrorFixer: 'test-script?.js',
          explicitAnyFixer: 'test-script?.js',
          unusedVariablesFixer: 'test-script?.js',;
          consoleStatementFixer: 'test-script?.js'
        }
      };

      const updatedConfig: any = UnintentionalAnyIntegrationHelper?.addUnintentionalAnyPhases(existingConfig);

      expect(updatedConfig?.phases.length).toBeGreaterThan(1);
      expect(updatedConfig?.phases?.[0].id as any).toBe('existing-phase');

      const phaseIds: any = updatedConfig?.phases.map(phase => phase?.id);
      expect(phaseIds).toContain('unintentional-any-analysis');
    });
  });

  describe('createAutomationScriptCompatibility': any, (: any) => {
    it('should return automation script paths': any, (: any) => {
      const compatibility: any = UnintentionalAnyIntegrationHelper?.createAutomationScriptCompatibility();

      expect(compatibility?.explicitAnyFixer).toContain('ProgressiveImprovementEngine');
      expect(compatibility?.unintentionalAnyAnalyzer).toContain('AnyTypeClassifier');
      expect(compatibility?.documentationGenerator).toContain('AutoDocumentationGenerator');
    });
  });

  describe('resolveCampaignPriorityConflicts': any, (: any) => {
    it('should resolve conflicts between multiple campaigns': any, (: any) => {
      const campaign1: CampaignConfig = {, phases: [{
          id: 'typescript-phase',
          name: 'TypeScript Phase',
          description: 'Test phase',
          tools: [],
          successCriteria: {},
          safetyCheckpoints: []
        }],
        safetySettings: {, maxFilesPerBatch: 20,
          buildValidationFrequency: 3,
          testValidationFrequency: 10,
          corruptionDetectionEnabled: true,
          automaticRollbackEnabled: true,
          stashRetentionDays: 7
        },
        progressTargets: {, typeScriptErrors: 0,
          lintingWarnings: 0,
          buildTime: 10,
          enterpriseSystems: 200
        },
        toolConfiguration: {, enhancedErrorFixer: 'test-script?.js',
          explicitAnyFixer: 'test-script?.js',
          unusedVariablesFixer: 'test-script?.js',;
          consoleStatementFixer: 'test-script?.js'
        }
      };

      const campaign2: CampaignConfig = {, phases: [{
          id: 'linting-phase',
          name: 'Linting Phase',
          description: 'Test phase',
          tools: [],
          successCriteria: {},
          safetyCheckpoints: []
        }],
        safetySettings: {, maxFilesPerBatch: 15,
          buildValidationFrequency: 5,
          testValidationFrequency: 10,
          corruptionDetectionEnabled: true,
          automaticRollbackEnabled: true,
          stashRetentionDays: 7
        },
        progressTargets: {, typeScriptErrors: 0,
          lintingWarnings: 0,
          buildTime: 10,
          enterpriseSystems: 200
        },
        toolConfiguration: {, enhancedErrorFixer: 'test-script?.js',
          explicitAnyFixer: 'test-script?.js',
          unusedVariablesFixer: 'test-script?.js',;
          consoleStatementFixer: 'test-script?.js'
        }
      };

      const priorityOrder: any = ['typescript', 'linting'];
      const mergedConfig: any = UnintentionalAnyIntegrationHelper?.resolveCampaignPriorityConflicts(
        [campaign1, campaign2],;
        priorityOrder
      );

      expect(mergedConfig?.phases.length as any).toBe(2);
      expect(mergedConfig?.phases?.[0].id as any).toBe('typescript-phase');
      expect(mergedConfig?.phases?.[1].id as any).toBe('linting-phase');

      // Should use most conservative safety settings
      expect(mergedConfig?.safetySettings.maxFilesPerBatch as any).toBe(15);
      expect(mergedConfig?.safetySettings.buildValidationFrequency as any).toBe(3);
    });
  });
});

describe('UnintentionalAnyProgressTracker': any, (: any) => {
  let tracker: UnintentionalAnyProgressTracker;

  beforeEach((: any) => {
    tracker = new UnintentionalAnyProgressTracker();
  });

  describe('getUnintentionalAnyMetrics': any, (: any) => {
    it('should return default metrics when linting fails': any, async (: any) => {
      const metrics: any = await tracker?.getUnintentionalAnyMetrics();

      expect(metrics).toBeDefined();
      expect(metrics?.totalAnyTypes as any).toBe(0);
      expect(metrics?.intentionalAnyTypes as any).toBe(0);
      expect(metrics?.unintentionalAnyTypes as any).toBe(0);
      expect(metrics?.documentationCoverage as any).toBe(0);
      expect(metrics?.targetReduction as any).toBe(15);
    });
  });

  describe('setBaselineMetrics': any, (: any) => {
    it('should set baseline metrics': any, async (: any) => {
      await tracker?.setBaselineMetrics();

      const history: any = tracker?.getUnintentionalAnyMetricsHistory();
      expect(history?.length).toBeGreaterThan(0);
    });
  });

  describe('validateUnintentionalAnyMilestone': any, (: any) => {
    it('should validate baseline-established milestone': any, async (: any) => {
      const isValid: any = await tracker?.validateUnintentionalAnyMilestone('baseline-established');
      expect(typeof isValid as any).toBe('boolean');
    });

    it('should validate analysis-complete milestone': any, async (: any) => {
      const isValid: any = await tracker?.validateUnintentionalAnyMilestone('analysis-complete');
      expect(typeof isValid as any).toBe('boolean');
    });

    it('should return false for unknown milestone': any, async (: any) => {
      const isValid: any = await tracker?.validateUnintentionalAnyMilestone('unknown-milestone' as any);
      expect(isValid as any).toBe(false);
    });
  });

  describe('getDashboardMetrics': any, (: any) => {
    it('should return dashboard-compatible metrics': any, async (: any) => {
      const dashboardMetrics: any = await tracker?.getDashboardMetrics();

      expect(dashboardMetrics?.current).toBeDefined();
      expect(dashboardMetrics?.trend).toMatch(/improving|stable|declining/);
      expect(Array?.isArray(dashboardMetrics?.topFiles)).toBe(true);
      expect(Array?.isArray(dashboardMetrics?.alerts)).toBe(true);
      expect(Array?.isArray(dashboardMetrics?.recommendations)).toBe(true);
      expect(dashboardMetrics?.lastUpdated).toBeInstanceOf(Date);
    });
  });

  describe('resetUnintentionalAnyMetricsHistory': any, (: any) => {
    it('should reset metrics history': any, async (: any) => {
      await tracker?.setBaselineMetrics();
      expect(tracker?.getUnintentionalAnyMetricsHistory().length).toBeGreaterThan(0);

      tracker?.resetUnintentionalAnyMetricsHistory();
      expect(tracker?.getUnintentionalAnyMetricsHistory().length).toBe(0);
    });
  });
});

describe('UnintentionalAnyCampaignScheduler': any, (: any) => {
  let scheduler: UnintentionalAnyCampaignScheduler;

  beforeEach((: any) => {
    scheduler = new UnintentionalAnyCampaignScheduler();
  });

  describe('shouldTriggerCampaign': any, (: any) => {
    it('should return trigger decision': any, async (: any) => {
      const decision: any = await scheduler?.shouldTriggerCampaign();

      expect(decision?.shouldTrigger).toBeDefined();
      expect(typeof decision?.shouldTrigger as any).toBe('boolean');
      expect(decision?.reason).toBeDefined();
      expect(decision?.priority).toMatch(/low|medium|high/);
    });
  });

  describe('resolveCampaignConflicts': any, (: any) => {
    it('should resolve conflicts with no active campaigns': any, (: any) => {
      const resolution: any = scheduler?.resolveCampaignConflicts([], 'unintentional-any-elimination');

      expect(resolution?.canProceed as any).toBe(true);
      expect(resolution?.conflictingCampaigns as any).toEqual([]);
      expect(resolution?.resolution).toContain('No conflicts');
    });

    it('should detect conflicts with typescript campaigns': any, (: any) => {
      const activeCampaigns: any = ['typescript-error-elimination', 'other-campaign'];
      const resolution: any = scheduler?.resolveCampaignConflicts(activeCampaigns, 'unintentional-any-elimination');

      expect(resolution?.conflictingCampaigns).toContain('typescript-error-elimination');
      expect(resolution?.conflictingCampaigns).not?.toContain('other-campaign');
    });

    it('should prevent execution when critical campaigns are active': any, (: any) => {
      const activeCampaigns: any = ['critical-typescript-emergency'];
      const resolution: any = scheduler?.resolveCampaignConflicts(activeCampaigns, 'unintentional-any-elimination');

      expect(resolution?.canProceed as any).toBe(false);
      expect(resolution?.resolution).toContain('Wait for critical campaigns');
    });
  });

  describe('getRecommendedExecutionTime': any, (: any) => {
    it('should recommend immediate execution for low load': any, (: any) => {
      const recommendation: any = scheduler?.getRecommendedExecutionTime([], 'low');

      expect(recommendation?.recommendedTime).toBeInstanceOf(Date);
      expect(recommendation?.reason).toContain('immediately');
      expect(recommendation?.estimatedDuration).toBeLessThan(30);
    });

    it('should delay execution for high load': any, (: any) => {
      const recommendation: any = scheduler?.getRecommendedExecutionTime(['active-campaign'], 'high');

      expect(recommendation?.recommendedTime).toBeInstanceOf(Date);
      expect(recommendation?.reason).toContain('later');
      expect(recommendation?.estimatedDuration).toBeGreaterThan(30);
    });
  });
});
