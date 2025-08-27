type SafetyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'MAXIMUM';

/**
 * Campaign Test Utilities
 *
 * Comprehensive utilities for testing campaign system functionality
 * with proper isolation and memory management.
 */

import {
    CampaignConfig,
    CampaignPhase,
    PhaseResult,
    ProgressMetrics,
    SafetyEvent,
    SafetyEventSeverity,
    SafetyEventType,
} from '../../types/campaign';
import {
    MockCampaignController,
    MockProgressTracker,
    MockSafetyProtocol
} from '../mocks/CampaignSystemMocks';

import { campaignTestController, CampaignTestController } from './CampaignTestController';
import { TestSafeProgressTracker } from './TestSafeProgressTracker';

/**
 * Test setup configuration for campaign tests
 */
export interface CampaignTestSetup {
  testName: string;
  enableMemoryMonitoring?: boolean;
  preventActualBuilds?: boolean;
  preventGitOperations?: boolean;
  mockProgressTracking?: boolean;
  simulateRealProgress?: boolean;
  customConfig?: Partial<CampaignConfig>;
}

/**
 * Campaign test context that provides access to all mock instances
 */
export interface CampaignTestContext {
  controller: MockCampaignController;
  tracker: MockProgressTracker;
  safety: MockSafetyProtocol;
  testSafeTracker: TestSafeProgressTracker | null;
  testController: CampaignTestController;
}

/**
 * Setup campaign test environment with proper isolation
 */
export async function setupCampaignTest(setup: CampaignTestSetup): Promise<CampaignTestContext> {
  const {
    testName,
    enableMemoryMonitoring = true,
    preventActualBuilds = true,
    preventGitOperations = true,
    mockProgressTracking = true,
    simulateRealProgress: _simulateRealProgress = false,
    customConfig: _customConfig,
  } = setup;

  // Initialize test controller with configuration
  await campaignTestController.initializeForTest(testName, {
    pauseProgressTracking: mockProgressTracking,
    preventBuildExecution: preventActualBuilds,
    preventGitOperations,
    enableMemoryMonitoring,
    isolateFileSystem: false,
    mockExternalAPIs: true,
  });

  // Pause campaign operations for test isolation
  await campaignTestController.pauseCampaignForTest(testName);

  // Get mock instances
  const mockInstances = campaignTestController.getMockInstances();
  const testSafeTracker = campaignTestController.getTestSafeTracker();

  // Validate that all required instances are available
  if (!mockInstances.controller || !mockInstances.tracker || !mockInstances.safety) {
    throw new Error('Failed to initialize campaign mock instances');
  }

  return {
    controller: mockInstances.controller,
    tracker: mockInstances.tracker,
    safety: mockInstances.safety,
    testSafeTracker,
    testController: campaignTestController,
  };
}

/**
 * Cleanup campaign test environment
 */
export async function cleanupCampaignTest(testName: string): Promise<void> {
  await campaignTestController.cleanupAfterTest(testName);
}

/**
 * Create mock campaign configuration for testing
 */
export function createMockCampaignConfig(overrides?: Partial<CampaignConfig>): CampaignConfig {
  const defaultConfig: CampaignConfig = {
    phases: [
      {
        id: 'test-phase-1',
        name: 'Test Phase 1',
        description: 'Mock phase for testing',
        tools: [
          {
            scriptPath: 'mock-script.js',
            parameters: { maxFiles: 10, autoFix: true },
            batchSize: 10,
            safetyLevel: 'HIGH' as unknown,
          },
        ],
        successCriteria: {
          typeScriptErrors: 0,
          lintingWarnings: 0,
        },
        safetyCheckpoints: [],
      },
    ],
    safetySettings: {
      maxFilesPerBatch: 10,
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
      enhancedErrorFixer: 'mock-enhanced-fixer.js',
      explicitAnyFixer: 'mock-any-fixer.js',
      unusedVariablesFixer: 'mock-unused-fixer.js',
      consoleStatementFixer: 'mock-console-fixer.js',
    },
  };

  return { ...defaultConfig, ...overrides };
}

/**
 * Create mock progress metrics for testing
 */
export function createMockProgressMetrics(overrides?: Partial<ProgressMetrics>): ProgressMetrics {
  const defaultMetrics: ProgressMetrics = {
    typeScriptErrors: {
      current: 50,
      target: 0,
      reduction: 36,
      percentage: 42,
    },
    lintingWarnings: {
      current: 2000,
      target: 0,
      reduction: 2506,
      percentage: 56,
    },
    buildPerformance: {
      currentTime: 8.5,
      targetTime: 10,
      cacheHitRate: 0.8,
      memoryUsage: 45,
    },
    enterpriseSystems: {
      current: 50,
      target: 200,
      transformedExports: 50,
    },
  };

  return { ...defaultMetrics, ...overrides };
}

/**
 * Create mock safety event for testing
 */
export function createMockSafetyEvent(
  type: SafetyEventType,
  description: string,
  severity: SafetyEventSeverity = SafetyEventSeverity.INFO,
): SafetyEvent {
  return {
    type,
    timestamp: new Date(),
    description: `Mock: ${description}`,
    severity,
    action: 'MOCK_TEST_EVENT',
  };
}

/**
 * Simulate campaign phase execution for testing
 */
export async function simulateCampaignPhase(
  context: CampaignTestContext,
  phase: CampaignPhase,
  expectedResult?: Partial<PhaseResult>,
): Promise<PhaseResult> {
  const result = await context.controller.executePhase(phase);

  // Validate result if expected result is provided
  if (expectedResult) {
    expect(result.success).toBe(expectedResult.success ?? true);
    if (expectedResult.filesProcessed !== undefined) {
      expect(result.filesProcessed).toBe(expectedResult.filesProcessed);
    }
    if (expectedResult.errorsFixed !== undefined) {
      expect(result.errorsFixed).toBe(expectedResult.errorsFixed);
    }
  }

  return result;
}

/**
 * Simulate progress tracking for testing
 */
export async function simulateProgressTracking(
  context: CampaignTestContext,
  targetMetrics: Partial<ProgressMetrics>,
  durationMs: number = 1000,
): Promise<ProgressMetrics> {
  if (context.testSafeTracker) {
    await context.testSafeTracker.simulateProgress(targetMetrics, durationMs, 'test-simulation');
    return await context.testSafeTracker.getProgressMetrics();
  } else {
    // Fallback to mock tracker
    context.tracker.updateMockMetrics(targetMetrics);
    return await context.tracker.getProgressMetrics();
  }
}

/**
 * Validate campaign test isolation
 */
export function validateCampaignTestIsolation(context: CampaignTestContext): {
  isValid: boolean;
  issues: string[];
  warnings: string[];
} {
  return context.testController.validateTestIsolation();
}

/**
 * Create test scenario for campaign operations
 */
export interface CampaignTestScenario {
  name: string;
  initialMetrics: ProgressMetrics;
  targetMetrics: Partial<ProgressMetrics>;
  expectedPhaseResults: Partial<PhaseResult>[];
  expectedSafetyEvents: SafetyEventType[];
  simulationDuration?: number;
}

/**
 * Execute a complete campaign test scenario
 */
export async function executeCampaignTestScenario(
  scenario: CampaignTestScenario,
  config?: Partial<CampaignConfig>,
): Promise<{
  context: CampaignTestContext;
  results: PhaseResult[];
  finalMetrics: ProgressMetrics;
  safetyEvents: SafetyEvent[];
}> {
  // Setup test environment
  const context = await setupCampaignTest({
    testName: scenario.name,
    customConfig: config,
  });

  try {
    // Set initial metrics
    context.testController.updateMockMetrics(scenario.initialMetrics, scenario.name);

    // Execute phases
    const campaignConfig = createMockCampaignConfig(config);
    const results: PhaseResult[] = [];

    for (let i = 0; i < campaignConfig.phases.length; i++) {
      const phase = campaignConfig.phases[i];
      const expectedResult = scenario.expectedPhaseResults[i] || {};

      const result = await simulateCampaignPhase(context, phase, expectedResult);
      results.push(result);
    }

    // Simulate progress to target metrics
    const finalMetrics = await simulateProgressTracking(
      context,
      scenario.targetMetrics,
      scenario.simulationDuration,
    );

    // Get safety events
    const safetyEvents = context.controller.getSafetyEvents();

    // Validate expected safety events
    scenario.expectedSafetyEvents.forEach(expectedType => {
      const hasEvent = safetyEvents.some(event => event.type === expectedType);
      expect(hasEvent).toBe(true);
    });

    return {
      context,
      results,
      finalMetrics,
      safetyEvents,
    };
  } finally {
    // Cleanup is handled by the caller or test framework
  }
}

/**
 * Memory-safe test wrapper for campaign operations
 */
export async function withCampaignTestIsolation<T>(
  testName: string,
  testFn: (context: CampaignTestContext) => Promise<T>,
  setup?: Partial<CampaignTestSetup>,
): Promise<T> {
  const context = await setupCampaignTest({
    testName,
    ...setup,
  });

  try {
    return await testFn(context);
  } finally {
    await cleanupCampaignTest(testName);
  }
}

/**
 * Validate campaign system memory usage during tests
 */
export function validateCampaignMemoryUsage(context: CampaignTestContext): {
  isMemoryEfficient: boolean;
  memoryStats: any;
  recommendations: string[];
} {
  const recommendations: string[] = [];
  let isMemoryEfficient = true;

  // Check test-safe tracker memory usage
  if (context.testSafeTracker) {
    const memoryStats = context.testSafeTracker.getMemoryStatistics();

    if (memoryStats && !memoryStats.memoryEfficient) {
      isMemoryEfficient = false;
      recommendations.push('Test-safe tracker memory usage is high');
    }

    return {
      isMemoryEfficient,
      memoryStats,
      recommendations,
    };
  }

  return {
    isMemoryEfficient: true,
    memoryStats: null,
    recommendations: [],
  };
}

/**
 * Create comprehensive test assertions for campaign operations
 */
export const campaignTestAssertions = {
  /**
   * Assert that campaign phase completed successfully
   */
  phaseCompletedSuccessfully: (result: PhaseResult) => {
    expect(result.success).toBe(true);
    expect(result.executionTime).toBeGreaterThan(0);
    expect(result.safetyEvents).toBeDefined();
  },

  /**
   * Assert that progress metrics improved
   */
  progressImproved: (initial: ProgressMetrics, final: ProgressMetrics) => {
    expect(final.typeScriptErrors.current).toBeLessThanOrEqual(initial.typeScriptErrors.current);
    expect(final.lintingWarnings.current).toBeLessThanOrEqual(initial.lintingWarnings.current);
  },

  /**
   * Assert that safety events were recorded
   */
  safetyEventsRecorded: (events: SafetyEvent[], expectedTypes: SafetyEventType[]) => {
    expectedTypes.forEach(expectedType => {
      const hasEvent = events.some(event => event.type === expectedType);
      expect(hasEvent).toBe(true);
    });
  },

  /**
   * Assert that test isolation is working
   */
  testIsolationActive: (context: CampaignTestContext) => {
    const validation = validateCampaignTestIsolation(context);
    expect(validation.isValid).toBe(true);
    expect(validation.issues).toHaveLength(0);
  },

  /**
   * Assert that memory usage is within acceptable limits
   */
  memoryUsageAcceptable: (context: CampaignTestContext) => {
    const memoryValidation = validateCampaignMemoryUsage(context);
    expect(memoryValidation.isMemoryEfficient).toBe(true);
  },
};

/**
 * Common test data generators
 */
export const campaignTestData = {
  /**
   * Generate realistic TypeScript error reduction scenario
   */
  typeScriptErrorReduction: (): CampaignTestScenario => ({
    name: 'typescript-error-reduction',
    initialMetrics: createMockProgressMetrics({
      typeScriptErrors: { current: 86, target: 0, reduction: 0, percentage: 0 },
    }),
    targetMetrics: {
      typeScriptErrors: { current: 0, target: 0, reduction: 86, percentage: 100 },
    },
    expectedPhaseResults: [{ success: true, errorsFixed: 86 }],
    expectedSafetyEvents: [
      SafetyEventType.CHECKPOINT_CREATED,
      SafetyEventType.CHECKPOINT_CREATED, // Start and end checkpoints
    ],
    simulationDuration: 2000,
  }),

  /**
   * Generate linting warning cleanup scenario
   */
  lintingWarningCleanup: (): CampaignTestScenario => ({
    name: 'linting-warning-cleanup',
    initialMetrics: createMockProgressMetrics({
      lintingWarnings: { current: 4506, target: 0, reduction: 0, percentage: 0 },
    }),
    targetMetrics: {
      lintingWarnings: { current: 0, target: 0, reduction: 4506, percentage: 100 },
    },
    expectedPhaseResults: [{ success: true, warningsFixed: 4506 }],
    expectedSafetyEvents: [SafetyEventType.CHECKPOINT_CREATED],
    simulationDuration: 3000,
  }),

  /**
   * Generate build performance optimization scenario
   */
  buildPerformanceOptimization: (): CampaignTestScenario => ({
    name: 'build-performance-optimization',
    initialMetrics: createMockProgressMetrics({
      buildPerformance: { currentTime: 15, targetTime: 10, cacheHitRate: 0.6, memoryUsage: 80 },
    }),
    targetMetrics: {
      buildPerformance: { currentTime: 8, targetTime: 10, cacheHitRate: 0.8, memoryUsage: 45 },
    },
    expectedPhaseResults: [{ success: true }],
    expectedSafetyEvents: [SafetyEventType.CHECKPOINT_CREATED],
    simulationDuration: 1500,
  }),
};

// Functions are already exported at their declarations above
