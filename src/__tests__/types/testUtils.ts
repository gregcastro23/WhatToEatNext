/**
 * Extended Test Utils Type Definitions
 *
 * Type definitions for the comprehensive test utilities including
 * campaign system mocks and memory management.
 */

import { ProgressMetrics } from '../../types/campaign';

export interface GitMock {
  stash: jest.MockedFunction<(...args: any[]) => any>;
  stashPop: jest.MockedFunction<(...args: any[]) => any>;
  getCurrentBranch: jest.MockedFunction<(...args: any[]) => any>;
  hasUncommittedChanges: jest.MockedFunction<(...args: any[]) => any>;
  getLastCommitHash: jest.MockedFunction<(...args: any[]) => any>;
  mockStashes: string[];
  mockBranch: string;
  mockGitStatus: {
    staged: string[];
    unstaged: string[];
    untracked: string[];
  };
  shouldFailCommands: boolean;
  setMockBranch: jest.MockedFunction<(...args: any[]) => any>;
  setMockStashes: jest.MockedFunction<(...args: any[]) => any>;
  // Git status structure varies by test scenario
  setMockGitStatus: (status: unknown) => void;
  setShouldFailCommands: jest.MockedFunction<(...args: any[]) => any>;
  addMockStash: jest.MockedFunction<(...args: any[]) => any>;
  removeMockStash: jest.MockedFunction<(...args: any[]) => any>;
  clearMockStashes: jest.MockedFunction<(...args: any[]) => any>;
  getMockStashes: jest.MockedFunction<(...args: any[]) => any>;
  simulateGitError: jest.MockedFunction<(...args: any[]) => any>;
  resetMocks: jest.MockedFunction<(...args: any[]) => any>;
}

export interface ScriptMock {
  executeScript: jest.MockedFunction<(...args: any[]) => any>;
  executeCommand: jest.MockedFunction<(...args: any[]) => any>;
  getScriptOutput: jest.MockedFunction<(...args: any[]) => any>;
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
  setMockResult: (...args: any[]) => any;
  setMockBuildSuccess: jest.MockedFunction<(...args: any[]) => any>;
  setMockTestSuccess: jest.MockedFunction<(...args: any[]) => any>;
  setShouldFailExecution: jest.MockedFunction<(...args: any[]) => any>;
  setMockExecutionTime: jest.MockedFunction<(...args: any[]) => any>;
  setMockMemoryUsage: jest.MockedFunction<(...args: any[]) => any>;
  setMockOutput: jest.MockedFunction<(...args: any[]) => any>;
  simulateScriptError: jest.MockedFunction<(...args: any[]) => any>;
  simulateTimeout: jest.MockedFunction<(...args: any[]) => any>;
  resetMocks: jest.MockedFunction<(...args: any[]) => any>;
}

export interface CampaignMock {
  controller: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // Intentionally any: Campaign controller methods have varying signatures for test flexibility
    executePhase: jest.MockedFunction<(...args: any[]) => any>;
    validatePhaseCompletion: jest.MockedFunction<(...args: any[]) => any>;
    createSafetyCheckpoint: jest.MockedFunction<(...args: any[]) => any>;
    rollbackToCheckpoint: jest.MockedFunction<(...args: any[]) => any>;
    getProgressMetrics: jest.MockedFunction<(...args: any[]) => any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pauseCampaign: jest.MockedFunction<(...args: any[]) => any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resumeCampaign: jest.MockedFunction<(...args: any[]) => any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isPaused: jest.MockedFunction<(...args: any[]) => any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isRunning: jest.MockedFunction<(...args: any[]) => any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getSafetyEvents: jest.MockedFunction<(...args: any[]) => any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateMockMetrics: jest.MockedFunction<(...args: any[]) => any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resetMockState: jest.MockedFunction<(...args: any[]) => any>;
  };
  tracker: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // Intentionally any: Tracker methods return various metric types for test scenarios
    getTypeScriptErrorCount: jest.MockedFunction<(...args: any[]) => any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getTypeScriptErrorBreakdown: jest.MockedFunction<(...args: any[]) => any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getLintingWarningCount: jest.MockedFunction<(...args: any[]) => any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getLintingWarningBreakdown: jest.MockedFunction<(...args: any[]) => any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getBuildTime: jest.MockedFunction<(...args: any[]) => any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getEnterpriseSystemCount: jest.MockedFunction<(...args: any[]) => any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getCacheHitRate: jest.MockedFunction<(...args: any[]) => any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getMemoryUsage: jest.MockedFunction<(...args: any[]) => any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getProgressMetrics: jest.MockedFunction<(...args: any[]) => any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    generateProgressReport: jest.MockedFunction<(...args: any[]) => any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    startTracking: jest.MockedFunction<(...args: any[]) => any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stopTracking: jest.MockedFunction<(...args: any[]) => any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isTrackingActive: jest.MockedFunction<(...args: any[]) => any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateMockMetrics: jest.MockedFunction<(...args: any[]) => any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resetMockState: jest.MockedFunction<(...args: any[]) => any>;
  };
  safety: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // Intentionally any: Safety protocol methods need flexible return types for test scenarios
    createStash: jest.MockedFunction<(...args: any[]) => any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    applyStash: jest.MockedFunction<(...args: any[]) => any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    detectCorruption: jest.MockedFunction<(...args: any[]) => any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validateGitState: jest.MockedFunction<(...args: any[]) => any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    emergencyRollback: jest.MockedFunction<(...args: any[]) => any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listStashes: jest.MockedFunction<(...args: any[]) => any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getSafetyEvents: jest.MockedFunction<(...args: any[]) => any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resetMockState: jest.MockedFunction<(...args: any[]) => any>;
  };
  testController: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // Intentionally any: Test controller methods require complete flexibility for test isolation
    initializeForTest: jest.MockedFunction<(...args: any[]) => any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pauseCampaignForTest: jest.MockedFunction<(...args: any[]) => any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resumeCampaignAfterTest: jest.MockedFunction<(...args: any[]) => any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cleanupAfterTest: jest.MockedFunction<(...args: any[]) => any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isPaused: jest.MockedFunction<(...args: any[]) => any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isIsolated: jest.MockedFunction<(...args: any[]) => any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getTestState: jest.MockedFunction<(...args: any[]) => any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    simulateProgress: jest.MockedFunction<(...args: any[]) => any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateMockMetrics: jest.MockedFunction<(...args: any[]) => any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validateTestIsolation: jest.MockedFunction<(...args: any[]) => any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getMockInstances: jest.MockedFunction<(...args: any[]) => any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getTestSafeTracker: jest.MockedFunction<(...args: any[]) => any>;
  };
  isolation: {
    initializeMockCampaignSystem: jest.MockedFunction<(...args: any[]) => any>;
    pauseCampaignOperations: jest.MockedFunction<(...args: any[]) => any>;
    resumeCampaignOperations: jest.MockedFunction<(...args: any[]) => any>;
    resetAllMockStates: jest.MockedFunction<(...args: any[]) => any>;
    restoreEnvironment: jest.MockedFunction<(...args: any[]) => any>;
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
  createMockFunction: (returnValue?: unknown) => jest.MockedFunction<(...args: any[]) => any>;
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
  cleanupMemory: () => any;

  // Mock file creation utilities
  createMockCorruptedFile: (content: string) => string;
  createMockTypeScriptErrors: (count: number) => string;
  createMockLintingWarnings: (count: number) => string;
  createMockProgressMetrics: (overrides?: Record<string, unknown>) => ProgressMetrics;

  // Campaign test utilities
  setupCampaignTest: (
    testName: string,
    config?: any,
  ) => Promise<{
    controller: any;
    tracker: any;
    safety: any;
    testController: any;
    testSafeTracker: any;
  }>;
  cleanupCampaignTest: (testName: string) => Promise<void>;
}

export default ExtendedTestUtils;
