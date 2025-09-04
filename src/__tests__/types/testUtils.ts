/**
 * Extended Test Utils Type Definitions
 *
 * Type definitions for the comprehensive test utilities including
 * campaign system mocks and memory management.
 */

import type { ProgressMetrics } from '../../types/campaign';

type AnyMockFn = jest.MockedFunction<(...args: unknown[]) => unknown>;

export interface GitMock {
  stash: AnyMockFn;
  stashPop: AnyMockFn;
  getCurrentBranch: AnyMockFn;
  hasUncommittedChanges: AnyMockFn;
  getLastCommitHash: AnyMockFn;
  mockStashes: string[];
  mockBranch: string;
  mockGitStatus: {
    staged: string[];
    unstaged: string[];
    untracked: string[];
  };
  shouldFailCommands: boolean;
  setMockBranch: AnyMockFn;
  setMockStashes: AnyMockFn;
  // Git status structure varies by test scenario
  setMockGitStatus: (status: unknown) => void;
  setShouldFailCommands: AnyMockFn;
  addMockStash: AnyMockFn;
  removeMockStash: AnyMockFn;
  clearMockStashes: AnyMockFn;
  getMockStashes: AnyMockFn;
  simulateGitError: AnyMockFn;
  resetMocks: AnyMockFn;
}

export interface ScriptMock {
  executeScript: AnyMockFn;
  executeCommand: AnyMockFn;
  getScriptOutput: AnyMockFn;
  mockResults: Record<string, unknown>;
  mockBuildSuccess: boolean;
  mockTestSuccess: boolean;
  shouldFailExecution: boolean;
  mockExecutionTime: number;
  mockMemoryUsage: number;
  mockErrorOutput: string;
  mockStdout: string;
  mockStderr: string;
  mockExitCode: number;
  // Mock results can be any type depending on script execution
  // Test results have varying structures by test scenario
  setMockResult: (...args: unknown[]) => unknown;
  setMockBuildSuccess: AnyMockFn;
  setMockTestSuccess: AnyMockFn;
  setShouldFailExecution: AnyMockFn;
  setMockExecutionTime: AnyMockFn;
  setMockMemoryUsage: AnyMockFn;
  setMockOutput: AnyMockFn;
  simulateScriptError: AnyMockFn;
  simulateTimeout: AnyMockFn;
  resetMocks: AnyMockFn;
}

export interface CampaignMock {
  controller: {
    executePhase: AnyMockFn;
    validatePhaseCompletion: AnyMockFn;
    createSafetyCheckpoint: AnyMockFn;
    rollbackToCheckpoint: AnyMockFn;
    getProgressMetrics: AnyMockFn;
    pauseCampaign: AnyMockFn;
    resumeCampaign: AnyMockFn;
    isPaused: AnyMockFn;
    isRunning: AnyMockFn;
    getSafetyEvents: AnyMockFn;
    updateMockMetrics: AnyMockFn;
    resetMockState: AnyMockFn;
  };
  tracker: {
    getTypeScriptErrorCount: AnyMockFn;
    getTypeScriptErrorBreakdown: AnyMockFn;
    getLintingWarningCount: AnyMockFn;
    getLintingWarningBreakdown: AnyMockFn;
    getBuildTime: AnyMockFn;
    getEnterpriseSystemCount: AnyMockFn;
    getCacheHitRate: AnyMockFn;
    getMemoryUsage: AnyMockFn;
    getProgressMetrics: AnyMockFn;
    generateProgressReport: AnyMockFn;
    startTracking: AnyMockFn;
    stopTracking: AnyMockFn;
    isTrackingActive: AnyMockFn;
    updateMockMetrics: AnyMockFn;
    resetMockState: AnyMockFn;
  };
  safety: {
    createStash: AnyMockFn;
    applyStash: AnyMockFn;
    detectCorruption: AnyMockFn;
    validateGitState: AnyMockFn;
    emergencyRollback: AnyMockFn;
    listStashes: AnyMockFn;
    getSafetyEvents: AnyMockFn;
    resetMockState: AnyMockFn;
  };
  testController: {
    initializeForTest: AnyMockFn;
    pauseCampaignForTest: AnyMockFn;
    resumeCampaignAfterTest: AnyMockFn;
    cleanupAfterTest: AnyMockFn;
    isPaused: AnyMockFn;
    isIsolated: AnyMockFn;
    getTestState: AnyMockFn;
    simulateProgress: AnyMockFn;
    updateMockMetrics: AnyMockFn;
    validateTestIsolation: AnyMockFn;
    getMockInstances: AnyMockFn;
    getTestSafeTracker: AnyMockFn;
  };
  isolation: {
    initializeMockCampaignSystem: AnyMockFn;
    pauseCampaignOperations: AnyMockFn;
    resumeCampaignOperations: AnyMockFn;
    resetAllMockStates: AnyMockFn;
    restoreEnvironment: AnyMockFn;
  };
  resetAllMocks: jest.MockedFunction<() => void>;
}

export interface ExtendedTestUtils {
  // Git operations mock
  gitMock: GitMock;

  // Script execution mock
  scriptMock: ScriptMock;

  // Campaign system mock
  campaignMock: CampaignMock;

  // Helper functions
  waitForAsync: (ms?: number) => Promise<void>;
  createMockFunction: (
    returnValue?: unknown,
  ) => jest.MockedFunction<(...args: unknown[]) => unknown>;
  createMockComponent: (
    name: string,
    testId?: string,
  ) => React.ComponentType<Record<string, unknown>>;

  // Memory management utilities
  checkMemory: () => {
    heapUsed: string;
    heapTotal: string;
    external: string;
    arrayBuffers: string;
  };
  cleanupMemory: () => void;

  // Mock file creation utilities
  createMockCorruptedFile: (content: string) => string;
  createMockTypeScriptErrors: (count: number) => string;
  createMockLintingWarnings: (count: number) => string;
  createMockProgressMetrics: (overrides?: Record<string, unknown>) => ProgressMetrics;

  // Campaign test utilities
  setupCampaignTest: (
    testName: string,
    config?: unknown,
  ) => Promise<{
    controller: unknown;
    tracker: unknown;
    safety: unknown;
    testController: unknown;
    testSafeTracker: unknown;
  }>;
  cleanupCampaignTest: (testName: string) => Promise<void>;
}

export default ExtendedTestUtils;
