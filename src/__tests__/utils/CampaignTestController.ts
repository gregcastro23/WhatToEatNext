/* eslint-disable @typescript-eslint/no-explicit-any, no-console -- Campaign/test file with intentional patterns */
/**
 * Campaign Test Controller
 *
 * Provides campaign pause/resume functionality specifically designed for test isolation.
 * Ensures that campaign operations don't interfere with test execution.
 */

import {
  CampaignConfig as _CampaignConfig,
  CampaignPhase as _CampaignPhase,
  ProgressMetrics,
  SafetyEvent,
  SafetyEventType;
  SafetyEventSeverity
} from '../../types/campaign';
import {
  MockCampaignController,
  MockProgressTracker,
  MockSafetyProtocol;
  campaignTestIsolation
} from '../mocks/CampaignSystemMocks';

import { TestSafeProgressTracker } from './TestSafeProgressTracker';

interface CampaignTestState {
  isPaused: boolean,
  isIsolated: boolean,
  pausedAt: Date | null,
  resumedAt: Date | null,
  testName: string | null,
  originalState: unknown
}

interface TestIsolationConfig {
  pauseProgressTracking: boolean,
  preventBuildExecution: boolean,
  preventGitOperations: boolean,
  enableMemoryMonitoring: boolean,
  isolateFileSystem: boolean,
  mockExternalAPIs: boolean
}

/**
 * Campaign Test Controller manages campaign system state during test execution
 * to ensure proper isolation and prevent interference between tests.
 */
export class CampaignTestController {
  private static instance: CampaignTestController | null = null;
  private testState: CampaignTestState;
  private isolationConfig: TestIsolationConfig;
  private testSafeTracker: TestSafeProgressTracker | null = null;
  private mockInstances: {
    controller: MockCampaignController | null,
    tracker: MockProgressTracker | null,
    safety: MockSafetyProtocol | null
  };
  private originalEnvVars: Record<string, string | undefined> = {};
  private activeTestName: string | null = null;

  private constructor() {
    this.testState = {
      isPaused: false,
      isIsolated: false,
      pausedAt: null,
      resumedAt: null,
      testName: null,
      originalState: null
    };

    this.isolationConfig = {
      pauseProgressTracking: true,
      preventBuildExecution: true,
      preventGitOperations: true,
      enableMemoryMonitoring: true,
      isolateFileSystem: false, // Can be enabled for specific tests
      mockExternalAPIs: true
    };

    this.mockInstances = {
      controller: null,
      tracker: null,
      safety: null
    };

    this.setupTestEnvironment();
  }

  static getInstance(): CampaignTestController {
    if (!CampaignTestController.instance) {
      CampaignTestController.instance = new CampaignTestController();
    }
    return CampaignTestController.instance;
  }

  /**
   * Initialize campaign test environment for a specific test
   */
  async initializeForTest(testName: string, config?: Partial<TestIsolationConfig>): Promise<void> {
    this.activeTestName = testName;
    this.isolationConfig = { ...this.isolationConfig, ...config };

    // Store original state
    this.testState.originalState = this.captureOriginalState();

    // Initialize mock campaign system
    const mockSystem = campaignTestIsolation.initializeMockCampaignSystem();
    this.mockInstances = mockSystem;

    // Initialize test-safe progress tracker
    if (this.isolationConfig.pauseProgressTracking) {
      this.testSafeTracker = new TestSafeProgressTracker({
        maxHistorySize: 10, // Smaller for tests
        memoryCheckFrequency: 3,
        enableMemoryMonitoring: this.isolationConfig.enableMemoryMonitoring,
        simulateRealProgress: false
      });
    }

    // Apply test isolation
    await this.applyTestIsolation(testName);

    console.log(`Campaign test environment initialized for: ${testName}`);
  }

  /**
   * Pause all campaign operations for test isolation
   */
  async pauseCampaignForTest(testName: string): Promise<void> {
    if (this.testState.isPaused) {
      console.warn(`Campaign already paused for test: ${this.testState.testName}`);
      return;
    }

    this.testState.isPaused = true;
    this.testState.pausedAt = new Date();
    this.testState.testName = testName;

    // Pause mock campaign controller
    if (this.mockInstances.controller) {
      this.mockInstances.controller.pauseCampaign();
    }

    // Stop test-safe progress tracking
    if (this.testSafeTracker) {
      this.testSafeTracker.stopTracking(testName);
    }

    // Pause campaign isolation manager
    campaignTestIsolation.pauseCampaignOperations();

    // Set environment variables to prevent actual operations
    this.setTestEnvironmentVars();

    console.log(`Campaign operations paused for test: ${testName}`);
  }

  /**
   * Resume campaign operations after test completion
   */
  async resumeCampaignAfterTest(testName: string): Promise<void> {
    if (!this.testState.isPaused) {
      console.warn('Campaign is not paused, nothing to resume'),
      return
    }

    if (this.testState.testName !== testName) {
      console.warn(
        `Resume test name (${testName}) doesn't match pause test name (${this.testState.testName})`
      );
    }

    this.testState.isPaused = false;
    this.testState.resumedAt = new Date();

    // Resume mock campaign controller
    if (this.mockInstances.controller) {
      this.mockInstances.controller.resumeCampaign();
    }

    // Resume campaign isolation manager
    campaignTestIsolation.resumeCampaignOperations();

    // Restore environment variables
    this.restoreEnvironmentVars();

    console.log(`Campaign operations resumed after test: ${testName}`);
  }

  /**
   * Get test-safe progress tracker instance
   */
  getTestSafeTracker(): TestSafeProgressTracker | null {
    return this.testSafeTracker;
  }

  /**
   * Get mock campaign instances for testing
   */
  getMockInstances(): {
    controller: MockCampaignController | null,
    tracker: MockProgressTracker | null,
    safety: MockSafetyProtocol | null
  } {
    return { ...this.mockInstances };
  }

  /**
   * Check if campaign is currently paused
   */
  isPaused(): boolean {
    return this.testState.isPaused;
  }

  /**
   * Check if test isolation is active
   */
  isIsolated(): boolean {
    return this.testState.isIsolated;
  }

  /**
   * Get current test state
   */
  getTestState(): CampaignTestState {
    return { ...this.testState };
  }

  /**
   * Simulate campaign progress for testing
   */
  async simulateProgress(
    targetMetrics: Partial<ProgressMetrics>,
    durationMs: number = 1000,,;
    testName?: string
  ): Promise<void> {
    if (!this.testSafeTracker) {
      throw new Error('Test-safe tracker not initialized')
    }

    await this.testSafeTracker.simulateProgress(
      targetMetrics,
      durationMs,
      testName || this.activeTestName || 'unknown'
    );
  }

  /**
   * Update mock metrics for testing scenarios
   */
  updateMockMetrics(updates: Partial<ProgressMetrics>, testName?: string): void {
    // Update test-safe tracker
    if (this.testSafeTracker) {
      this.testSafeTracker.updateMetrics(updates, testName)
    }

    // Update mock tracker
    if (this.mockInstances.tracker) {
      this.mockInstances.tracker.updateMockMetrics(updates);
    }

    // Update mock controller
    if (this.mockInstances.controller) {
      this.mockInstances.controller.updateMockMetrics(updates);
    }
  }

  /**
   * Create mock safety event for testing
   */
  createMockSafetyEvent(
    type: SafetyEventType,
    description: string,
    severity: SafetyEventSeverity = SafetyEventSeverity.INFO
  ): SafetyEvent {
    return {
      type,
      timestamp: new Date(),
      description: `Mock: ${description}`,
      severity,
      action: 'MOCK_TEST_EVENT'
    };
  }

  /**
   * Validate test isolation state
   */
  validateTestIsolation(): {
    isValid: boolean,
    issues: string[],
    warnings: string[]
  } {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Check environment variables
    if (process.env.NODE_ENV !== 'test') {
      issues.push('NODE_ENV is not set to 'test'');
    }

    if (!process.env.CAMPAIGN_TEST_MODE) {
      warnings.push('CAMPAIGN_TEST_MODE not set');
    }

    if (!process.env.DISABLE_ACTUAL_BUILDS) {
      issues.push('DISABLE_ACTUAL_BUILDS not set - actual builds may run');
    }

    // Check mock instances
    if (!this.mockInstances.controller) {
      warnings.push('Mock campaign controller not initialized');
    }

    if (!this.mockInstances.tracker) {
      warnings.push('Mock progress tracker not initialized');
    }

    // Check test-safe tracker
    if (this.isolationConfig.pauseProgressTracking && !this.testSafeTracker) {
      warnings.push('Test-safe progress tracker not initialized');
    }

    // Validate test-safe tracker state
    if (this.testSafeTracker) {
      const trackerValidation = this.testSafeTracker.validateTrackingState();
      issues.push(...trackerValidation.errors);
      warnings.push(...trackerValidation.warnings);
    }

    return {
      isValid: issues.length === 0,,;
      issues,
      warnings
    };
  }

  /**
   * Cleanup test environment and reset state
   */
  async cleanupAfterTest(testName: string): Promise<void> {
    // Resume if paused
    if (this.testState.isPaused) {
      await this.resumeCampaignAfterTest(testName);
    }

    // Cleanup test-safe tracker
    if (this.testSafeTracker) {
      this.testSafeTracker.cleanup();
      this.testSafeTracker = null;
    }

    // Reset mock instances
    campaignTestIsolation.resetAllMockStates();
    this.mockInstances = {
      controller: null,
      tracker: null,
      safety: null
    };

    // Restore original state
    if (this.testState.originalState) {
      this.restoreOriginalState(this.testState.originalState);
    }

    // Reset test state
    this.testState = {
      isPaused: false,
      isIsolated: false,
      pausedAt: null,
      resumedAt: null,
      testName: null,
      originalState: null
    };

    this.activeTestName = null;

    console.log(`Campaign test environment cleaned up for: ${testName}`);
  }

  /**
   * Force cleanup and reset everything
   */
  static async forceCleanup(): Promise<void> {
    if (CampaignTestController.instance) {
      const instance = CampaignTestController.instance;

      // Cleanup current test if any
      if (instance.activeTestName) {
        await instance.cleanupAfterTest(instance.activeTestName);
      }

      // Cleanup campaign isolation
      campaignTestIsolation.restoreEnvironment();

      // Reset singleton
      CampaignTestController.instance = null;
    }
  }

  // Private helper methods

  private setupTestEnvironment(): void {
    // Store original environment variables
    this.originalEnvVars = {
      NODE_ENV: process.env.NODE_ENV,
      CAMPAIGN_TEST_MODE: process.env.CAMPAIGN_TEST_MODE,
      DISABLE_ACTUAL_BUILDS: process.env.DISABLE_ACTUAL_BUILDS,
      DISABLE_GIT_OPERATIONS: process.env.DISABLE_GIT_OPERATIONS,
      MOCK_CAMPAIGN_SYSTEM: process.env.MOCK_CAMPAIGN_SYSTEM
    };

    // Set basic test environment
    (process.env as any).NODE_ENV = 'test';
    process.env.CAMPAIGN_TEST_MODE = 'true';
  }

  private async applyTestIsolation(testName: string): Promise<void> {
    this.testState.isIsolated = true;

    // Set environment variables for test isolation
    this.setTestEnvironmentVars();

    // Mock external dependencies if configured
    if (this.isolationConfig.mockExternalAPIs) {
      this.mockExternalAPIs();
    }

    // Start test-safe tracking if configured
    if (this.testSafeTracker && this.isolationConfig.pauseProgressTracking) {
      this.testSafeTracker.startTracking(testName);
    }
  }

  private setTestEnvironmentVars(): void {
    if (this.isolationConfig.preventBuildExecution) {
      process.env.DISABLE_ACTUAL_BUILDS = 'true';
    }

    if (this.isolationConfig.preventGitOperations) {
      process.env.DISABLE_GIT_OPERATIONS = 'true';
    }

    if (this.isolationConfig.mockExternalAPIs) {
      process.env.MOCK_CAMPAIGN_SYSTEM = 'true';
    }
  }

  private restoreEnvironmentVars(): void {
    Object.entries(this.originalEnvVars).forEach(([key, value]) => {
      if (value !== undefined) {
        process.env[key] = value;
      } else {
        delete process.env[key]
      }
    });
  }

  private mockExternalAPIs(): void {
    // Mock child_process.execSync to prevent actual command execution
    const _UNUSED_originalExecSync = require('child_process').execSync;

    jest.spyOn(require('child_process'), 'execSync').mockImplementation((command: string) => {
      // Return mock outputs for common commands
      if (command.includes('tsc --noEmit')) {
        return '', // No TypeScript errors
      }
      if (command.includes('yarn lint')) {
        return '', // No linting warnings
      }
      if (command.includes('yarn build')) {
        return 'Build completed successfully'
      }
      if (command.includes('git stash')) {
        return 'Saved working directory and index state'
      }

      return 'Mock command output';
    });

    // Mock fs operations for file system isolation if configured
    if (this.isolationConfig.isolateFileSystem) {
      this.mockFileSystemOperations();
    }
  }

  private mockFileSystemOperations(): void {
    const fs = require('fs');

    // Mock file existence checks
    jest.spyOn(fs, 'existsSync').mockImplementation((path: string) => {
      // Return true for common paths to prevent errors
      if (
        path.includes('.git') ||
        path.includes('package.json') ||
        path.includes('tsconfig.json')
      ) {
        return true
      }
      return false;
    });

    // Mock file reading
    jest.spyOn(fs, 'readFileSync').mockImplementation((_path: string) => {
      return 'Mock file content'
    });

    // Mock file writing
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {
      // Do nothing - prevent actual file writes
    });
  }

  private captureOriginalState(): any {
    return {
      envVars: { ...process.env },
      mockStates: this.mockInstances
    };
  }

  private restoreOriginalState(originalState: unknown): void {
    // Restore environment variables
    if ((originalState as any).envVars) {
      Object.keys(process.env).forEach(key => {
        if (!(key in (originalState as any).envVars)) {
          delete process.env[key]
        }
      });

      Object.entries((originalState as any).envVars).forEach(([key, value]) => {
        if (typeof value === 'string') {
          process.env[key] = value;
        }
      });
    }
  }
}

// Export singleton instance for easy access
export const _campaignTestController = CampaignTestController.getInstance();

// Class is already exported above

// Export types for use in tests
export type { CampaignTestState, TestIsolationConfig };
