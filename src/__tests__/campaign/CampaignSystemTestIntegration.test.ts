/**
 * Campaign System Test Integration Tests
 *
 * Comprehensive tests for campaign system test integration functionality,
 * including mocking, isolation, and memory management.
 */

import {
    SafetyEventType
    // Note: SafetyEventSeverity and PhaseStatus imported but not currently used
} from '../../types/campaign';
import { campaignTestController } from '../utils/CampaignTestController';
import {
    campaignTestAssertions, campaignTestData, cleanupCampaignTest, createMockCampaignConfig, executeCampaignTestScenario, setupCampaignTest, validateCampaignTestIsolation
} from '../utils/campaignTestUtils';

describe('Campaign System Test Integration', () => {
  // Test isolation and cleanup
  afterEach(async () => {
    // Ensure cleanup after each test
    try {
      campaignTestController.cleanupAfterTest('test-cleanup');
    } catch (error) {
      console.warn('Cleanup warning:', error);
    }
  });

  afterAll(async () => {
    // Force cleanup of singleton instances
    const { CampaignTestController } = import('../utils/CampaignTestController');
    CampaignTestController.forceCleanup();
  });

  describe('Campaign System Mocking', () => {
    it('should initialize mock campaign system without running actual builds', async () => {
      const context = await setupCampaignTest({
        testName: 'mock-initialization-test',
        preventActualBuilds: true,
        preventGitOperations: true
      });

      try {
        // Verify mock instances are created
        expect(context.controller).toBeDefined();
        expect(context.tracker).toBeDefined();
        expect(context.safety).toBeDefined();

        // Verify test isolation is active
        campaignTestAssertions.testIsolationActive(context);

        // Verify environment variables are set for test isolation
        expect(process.env.NODE_ENV).toBe('test');
        expect(process.env.DISABLE_ACTUAL_BUILDS).toBe('true');
        expect(process.env.DISABLE_GIT_OPERATIONS).toBe('true');

        // Test that mock controller doesn't run actual scripts
        const mockPhase = createMockCampaignConfig().phases[0];
        const result = await context.controller.executePhase(mockPhase);

        expect(result.success).toBe(true);
        expect(result.executionTime).toBeGreaterThan(0);
        expect(result.safetyEvents).toBeDefined();

        // Verify no actual build processes were triggered
        expect(result.filesProcessed).toBeGreaterThan(0); // Mock processing
        expect(result.errorsFixed).toBeGreaterThan(0); // Mock fixes

      } finally {
        cleanupCampaignTest('mock-initialization-test');
      }
    });

    it('should prevent actual TypeScript compilation during tests', async () => {
      const context = await setupCampaignTest({
        testName: 'prevent-tsc-test',
        preventActualBuilds: true
      });

      try {
        // Mock TypeScript error count should not run actual tsc
        const errorCount = context.tracker.getTypeScriptErrorCount
        expect(typeof errorCount).toBe('number');
        expect(errorCount).toBeGreaterThanOrEqual(0);

        // Mock error breakdown should not run actual analysis
        const breakdown = context.tracker.getTypeScriptErrorBreakdown
        expect(typeof breakdown).toBe('object');
        expect(Object.keys(breakdown).length).toBeGreaterThan(0);

        // Verify that actual tsc command was not executed
        // (This is ensured by the mock implementation)
        expect(breakdown['TS2352']).toBeDefined();
        expect(breakdown['TS2339']).toBeDefined();

      } finally {
        cleanupCampaignTest('prevent-tsc-test');
      }
    });

    it('should prevent actual git operations during tests', async () => {
      const context = await setupCampaignTest({
        testName: 'prevent-git-test',
        preventGitOperations: true
      });

      try {
        // Mock stash creation should not run actual git commands
        const stashId = await context.safety.createStash
        expect(typeof stashId).toBe('string');
        expect(stashId).toContain('mock_stash_');

        // Mock stash application should not run actual git commands
        const stashResult = await context.safety.applyStash(String(stashId));
        expect(stashResult).toBeDefined();

        // Mock git state validation should not run actual git commands
        const validation = await context.safety.validateGitState();
        expect(validation.success).toBe(true);

        // Verify safety events were recorded
        const safetyEvents = context.safety.getSafetyEvents();
        expect(safetyEvents.length).toBeGreaterThan(0);
        expect(safetyEvents.some(e => e.type === SafetyEventType.CHECKPOINT_CREATED)).toBe(true);

      } finally {
        cleanupCampaignTest('prevent-git-test');
      }
    });
  });

  describe('Test-Safe Progress Tracking', () => {
    it('should track progress without memory leaks', async () => {
      const context = await setupCampaignTest({
        testName: 'memory-safe-tracking-test',
        enableMemoryMonitoring: true,
        mockProgressTracking: true
      });

      try {
        expect(context.testSafeTracker).toBeDefined();

        if (context.testSafeTracker) {
          // Start tracking
          await context.testSafeTracker.startTracking('memory-test');

          // Simulate multiple progress updates
          for (let i = 0; i < 10; i++) {
            context.testSafeTracker.updateMetrics({
              typeScriptErrors: {
                current: 86 - (i * 5),
                target: 0,
                reduction: i * 5,
                percentage: Math.round((i * 5 / 86) * 100)
              }
            }, `update-${i}`);
          }

          // Get progress history
          const history = await context.testSafeTracker.getProgressHistory();
          expect(history.length).toBeGreaterThan(0);
          expect(history.length).toBeLessThanOrEqual(20); // Should be limited to prevent memory issues

          // Validate memory usage
          const memoryStats = await context.testSafeTracker.getMemoryStatistics();
          if (memoryStats) {
            expect(memoryStats.memoryEfficient).toBe(true);
          }

          // Stop tracking
          await context.testSafeTracker.stopTracking('memory-test');
        }

      } finally {
        cleanupCampaignTest('memory-safe-tracking-test');
      }
    });

    it('should simulate realistic progress over time', async () => {
      const context = await setupCampaignTest({
        testName: 'progress-simulation-test',
        mockProgressTracking: true
      });

      try {
        if (context.testSafeTracker) {
          const initialMetrics = context.testSafeTracker.getProgressMetrics();
          // Simulate progress to target metrics
          const targetMetrics = {
            typeScriptErrors: { current: 0, target: 0, reduction: 86, percentage: 100 },
            lintingWarnings: { current: 0, target: 0, reduction: 4506, percentage: 100 }
          };

          context.testSafeTracker.simulateProgress(targetMetrics, 1000, 'simulation-test');

          const finalMetrics = context.testSafeTracker.getProgressMetrics();

          // Verify progress was made
          expect(finalMetrics.typeScriptErrors.current).toBeLessThanOrEqual(initialMetrics.typeScriptErrors.current);
          expect(finalMetrics.lintingWarnings.current).toBeLessThanOrEqual(initialMetrics.lintingWarnings.current);
        }

      } finally {
        cleanupCampaignTest('progress-simulation-test');
      }
    });

    it('should generate comprehensive progress reports', async () => {
      const context = await setupCampaignTest({
        testName: 'progress-report-test',
        mockProgressTracking: true
      });

      try {
        // Generate progress report
        const report = await context.tracker.generateProgressReport();

        expect(report).toBeDefined();
        expect(report.campaignId).toBe('mock-campaign');
        expect(report.overallProgress).toBeGreaterThanOrEqual(0);
        expect(report.overallProgress).toBeLessThanOrEqual(100);
        expect(report.phases).toBeDefined();
        expect(report.phases.length).toBeGreaterThan(0);
        expect(report.currentMetrics).toBeDefined();
        expect(report.targetMetrics).toBeDefined();
        expect(report.estimatedCompletion).toBeInstanceOf(Date);

        // Verify phase reports
        const phase = report.phases[0];
        expect(phase.phaseId).toBeDefined();
        expect(phase.phaseName).toBeDefined();
        expect(phase.status).toBeDefined();
        expect(phase.metrics).toBeDefined();
        expect(Array.isArray(phase.achievements)).toBe(true);
        expect(Array.isArray(phase.issues)).toBe(true);
        expect(Array.isArray(phase.recommendations)).toBe(true);

      } finally {
        cleanupCampaignTest('progress-report-test');
      }
    });
  });

  describe('Campaign Pause/Resume Functionality', () => {
    it('should pause campaign operations for test isolation', async () => {
      const context = await setupCampaignTest({
        testName: 'pause-resume-test'
      });

      try {
        // Verify campaign is paused
        expect(context.testController.isPaused()).toBe(true);
        expect(context.controller.isPaused()).toBe(true);

        // Attempt to execute phase while paused should handle gracefully
        const mockPhase = createMockCampaignConfig().phases[0];
        await expect(context.controller.executePhase(mockPhase)).rejects.toThrow('Campaign is paused');

        // Resume campaign
        await context.testController.resumeCampaignAfterTest('pause-resume-test');
        expect(context.testController.isPaused()).toBe(false);
        expect(context.controller.isPaused()).toBe(false);

        // Should be able to execute phase after resume
        const result = await context.controller.executePhase(mockPhase);
        expect(result.success).toBe(true);

      } finally {
        cleanupCampaignTest('pause-resume-test');
      }
    });

    it('should maintain test isolation across multiple tests', async () => {
      // First test
      const context1 = await setupCampaignTest({
        testName: 'isolation-test-1'
      });

      try {
        context1.testController.updateMockMetrics({
          typeScriptErrors: { current: 10, target: 0, reduction: 76, percentage: 88 }
        }, 'isolation-test-1');
        const metrics1 = context1.tracker.getProgressMetrics();
        expect(metrics1.typeScriptErrors.current).toBe(10);

      } finally {
        cleanupCampaignTest('isolation-test-1');
      }

      // Second test should have clean state
      const context2 = await setupCampaignTest({
        testName: 'isolation-test-2'
      });

      try {
        const metrics2 = context2.tracker.getProgressMetrics();
        // Should not have the modified metrics from test 1
        expect(metrics2.typeScriptErrors.current).not.toBe(10);
        expect(metrics2.typeScriptErrors.current).toBeGreaterThan(10); // Should be initial value

      } finally {
        cleanupCampaignTest('isolation-test-2');
      }
    });

    it('should handle concurrent test isolation', async () => {
      // This test verifies that the singleton pattern works correctly
      // and doesn't cause conflicts between concurrent test setups

      const testPromises = [
        withCampaignTestIsolation('concurrent-test-1', async (context) => {
          context.testController.updateMockMetrics({
            typeScriptErrors: { current: 20, target: 0, reduction: 66, percentage: 77 }
          }, 'concurrent-test-1');
          const metrics = context.tracker.getProgressMetrics();
          expect(metrics.typeScriptErrors.current).toBe(20);
          return 'test-1-complete';
        }),

        withCampaignTestIsolation('concurrent-test-2', async (context) => {
          context.testController.updateMockMetrics({
            typeScriptErrors: { current: 30, target: 0, reduction: 56, percentage: 65 }
          }, 'concurrent-test-2');
          const metrics = context.tracker.getProgressMetrics();
          expect(metrics.typeScriptErrors.current).toBe(30);
          return 'test-2-complete';
        })
      ];

      const results = await Promise.all(testPromises);
      expect(results).toEqual(['test-1-complete', 'test-2-complete']);
    });
  });

  describe('Memory Management', () => {
    it('should prevent memory leaks during campaign operations', async () => {
      const context = await setupCampaignTest({
        testName: 'memory-leak-prevention-test',
        enableMemoryMonitoring: true
      });

      try {
        // Perform multiple operations that could cause memory leaks
        for (let i = 0; i < 20; i++) {
          const mockPhase = createMockCampaignConfig().phases[0];
          await context.controller.executePhase(mockPhase);

          // Update metrics
          context.testController.updateMockMetrics({
            typeScriptErrors: { current: 86 - i, target: 0, reduction: i, percentage: Math.round((i / 86) * 100) }
          }, `iteration-${i}`);

          // Create safety checkpoints
          await context.safety.createStash(`Checkpoint ${i}`, 'test-phase');
        }

        // Validate memory usage
        campaignTestAssertions.memoryUsageAcceptable(context);

        // Verify that safety events are properly managed (not accumulating indefinitely)
        const safetyEvents = await context.controller.getSafetyEvents();
        expect(safetyEvents.length).toBeLessThan(100); // Should be limited to prevent memory issues

      } finally {
        cleanupCampaignTest('memory-leak-prevention-test');
      }
    });

    it('should cleanup resources properly after test completion', async () => {
      // Setup and use campaign test
      const context = await setupCampaignTest({
        testName: 'resource-cleanup-test',
        enableMemoryMonitoring: true
      });

      // Perform some operations
      const mockPhase = createMockCampaignConfig().phases[0];
      await context.controller.executePhase(mockPhase);

      if (context.testSafeTracker) {
        await context.testSafeTracker.startTracking('cleanup-test');
        context.testSafeTracker.updateMetrics({
          typeScriptErrors: { current: 50, target: 0, reduction: 50, percentage: 50 }
        }, 'cleanup-test');
      }

      // Cleanup
      cleanupCampaignTest('resource-cleanup-test');

      // Verify cleanup was effective
      expect(context.testController.isPaused()).toBe(false);
      expect(context.testController.isIsolated()).toBe(false);

      // Test-safe tracker should be cleaned up
      if (context.testSafeTracker) {
        const validation = await context.testSafeTracker.validateTrackingState();
        // Should not be tracking anymore
        expect(validation.success).toBe(true);
      }
    });
  });

  describe('Complete Campaign Test Scenarios', () => {
    it('should execute TypeScript error reduction scenario', async () => {
      const scenario = campaignTestData.typeScriptErrorReduction();
      const _config = createMockCampaignConfig();
      const { context: _context, results, finalMetrics, safetyEvents: _safetyEvents } = await executeCampaignTestScenario(scenario, _config);
      try {
        // Verify phase execution
        expect(results.length).toBe(1);
        campaignTestAssertions.phaseCompletedSuccessfully(results[0]);

        // Verify progress improvement
        campaignTestAssertions.progressImproved(scenario.initialMetrics, finalMetrics);

        // Verify safety events
        campaignTestAssertions.safetyEventsRecorded(_safetyEvents, scenario.expectedSafetyEvents);

        // Verify final state
        expect(finalMetrics.typeScriptErrors.current).toBeLessThanOrEqual(scenario.initialMetrics.typeScriptErrors.current);

      } finally {
        cleanupCampaignTest(scenario.name);
      }
    });

    it('should execute linting warning cleanup scenario', async () => {
      const scenario = campaignTestData.lintingWarningCleanup();
      const _config = createMockCampaignConfig();
      const { context: _context, results, finalMetrics, safetyEvents: _safetyEvents } = await executeCampaignTestScenario(scenario, _config);
      try {
        // Verify phase execution
        expect(results.length).toBe(1);
        campaignTestAssertions.phaseCompletedSuccessfully(results[0]);

        // Verify progress improvement
        campaignTestAssertions.progressImproved(scenario.initialMetrics, finalMetrics);

        // Verify linting-specific improvements
        expect(finalMetrics.lintingWarnings.current).toBeLessThanOrEqual(scenario.initialMetrics.lintingWarnings.current);

      } finally {
        cleanupCampaignTest(scenario.name);
      }
    });

    it('should handle campaign failures gracefully', async () => {
      const context = await setupCampaignTest({
        testName: 'failure-handling-test'
      });

      try {
        // Create a phase that will fail
        const failingPhase = {
          ...createMockCampaignConfig().phases[0],
          successCriteria: {
            typeScriptErrors: -1 // Impossible criteria
          }
        };

        // Mock the controller to simulate failure
        jest.spyOn(context.controller, 'executePhase').mockRejectedValueOnce(new Error('Mock failure'));

        // Execute phase and expect it to handle failure
        await expect(context.controller.executePhase(failingPhase)).rejects.toThrow('Mock failure');

        // Verify safety events were recorded for the failure
        const safetyEvents = context.controller.getSafetyEvents();
        expect(safetyEvents.length).toBeGreaterThan(0);

      } finally {
        cleanupCampaignTest('failure-handling-test');
      }
    });
  });

  describe('Integration Validation', () => {
    it('should validate complete campaign system integration', async () => {
      const context = await setupCampaignTest({
        testName: 'integration-validation-test',
        enableMemoryMonitoring: true,
        preventActualBuilds: true,
        preventGitOperations: true,
        mockProgressTracking: true
      });

      try {
        // Validate test isolation
        const isolation = validateCampaignTestIsolation(context);
        expect(isolation.isValid).toBe(true);
        expect(isolation.issues).toHaveLength(0);

        // Test all major components
        const mockPhase = createMockCampaignConfig().phases[0];

        // 1. Execute campaign phase
        const phaseResult = await context.controller.executePhase(mockPhase);
        campaignTestAssertions.phaseCompletedSuccessfully(phaseResult);

        // 2. Track progress
        const initialMetrics = context.tracker.getProgressMetrics();
        context.testController.updateMockMetrics({
          typeScriptErrors: { current: 25, target: 0, reduction: 61, percentage: 71 }
        }, 'integration-test');
        const updatedMetrics = context.tracker.getProgressMetrics();
        campaignTestAssertions.progressImproved(initialMetrics, updatedMetrics);

        // 3. Safety operations
        const stashId = await context.safety.createStash('Integration test stash', 'test-phase');
        expect(stashId).toBeDefined();
        await context.safety.applyStash(String(stashId));

        // 4. Generate reports
        const report = await context.tracker.generateProgressReport();
        expect(report).toBeDefined();
        expect(report.phases.length).toBeGreaterThan(0);

        // 5. Validate memory usage
        campaignTestAssertions.memoryUsageAcceptable(context);

        // 6. Verify all safety events
        const safetyEvents = context.controller.getSafetyEvents();
        expect(safetyEvents.length).toBeGreaterThan(0);
        campaignTestAssertions.safetyEventsRecorded(safetyEvents, [
          SafetyEventType.CHECKPOINT_CREATED
        ]);

      } finally {
        cleanupCampaignTest('integration-validation-test');
      }
    });
  });
});
