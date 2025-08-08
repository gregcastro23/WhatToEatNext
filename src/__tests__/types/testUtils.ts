/**
 * Extended Test Utils Type Definitions
 *
 * Type definitions for the comprehensive test utilities including
 * campaign system mocks and memory management.
 */

import { ProgressMetrics } from '../../types/campaign';

export interface GitMock {
  stash: jest.MockedFunction<() => Promise<string>>;
  stashPop: jest.MockedFunction<() => Promise<boolean>>;
  getCurrentBranch: jest.MockedFunction<() => Promise<string>>;
  hasUncommittedChanges: jest.MockedFunction<() => Promise<boolean>>;
  getLastCommitHash: jest.MockedFunction<() => Promise<string>>;
  mockStashes: string[];
  mockBranch: string;
  mockGitStatus: {
    staged: string[];
    unstaged: string[];
    untracked: string[];
  };
  shouldFailCommands: boolean;
  setMockBranch: jest.MockedFunction<(branch: string) => void>;
  setMockStashes: jest.MockedFunction<(stashes: string[]) => void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // Intentionally any: Git status structure varies by test scenario
  setMockGitStatus: (status: unknown) => void;
  setShouldFailCommands: jest.MockedFunction<(shouldFail: boolean) => void>;
  addMockStash: jest.MockedFunction<(stashId: string) => void>;
  removeMockStash: jest.MockedFunction<(stashId: string) => void>;
  clearMockStashes: jest.MockedFunction<() => void>;
  getMockStashes: jest.MockedFunction<() => string[]>;
  simulateGitError: jest.MockedFunction<(command: string, error: string) => void>;
  resetMocks: jest.MockedFunction<() => void>;
}

export interface ScriptMock {
  executeScript: jest.MockedFunction<(scriptPath: string) => Promise<{ success: boolean; output: string }>>;
  executeCommand: jest.MockedFunction<(command: string) => Promise<{ stdout: string; stderr: string; exitCode: number }>>;
  getScriptOutput: jest.MockedFunction<() => string>;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // Intentionally any: Mock results can be any type depending on script execution
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // Intentionally any: Test results have varying structures by test scenario
  setMockResult: (scriptPath: string, result: unknown) => void;
  setMockBuildSuccess: jest.MockedFunction<(success: boolean) => void>;
  setMockTestSuccess: jest.MockedFunction<(success: boolean) => void>;
  setShouldFailExecution: jest.MockedFunction<(shouldFail: boolean) => void>;
  setMockExecutionTime: jest.MockedFunction<(time: number) => void>;
  setMockMemoryUsage: jest.MockedFunction<(usage: number) => void>;
  setMockOutput: jest.MockedFunction<(stdout: string, stderr: string, exitCode: number) => void>;
  simulateScriptError: jest.MockedFunction<(scriptPath: string, error: string) => void>;
  simulateTimeout: jest.MockedFunction<(scriptPath: string, timeout: number) => void>;
  resetMocks: jest.MockedFunction<() => void>;
}

export interface CampaignMock {
  controller: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // Intentionally any: Campaign controller methods have varying signatures for test flexibility
    executePhase: jest.MockedFunction<unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validatePhaseCompletion: jest.MockedFunction<unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createSafetyCheckpoint: jest.MockedFunction<unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rollbackToCheckpoint: jest.MockedFunction<unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getProgressMetrics: jest.MockedFunction<unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pauseCampaign: jest.MockedFunction<unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resumeCampaign: jest.MockedFunction<unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isPaused: jest.MockedFunction<unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isRunning: jest.MockedFunction<unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getSafetyEvents: jest.MockedFunction<unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateMockMetrics: jest.MockedFunction<unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resetMockState: jest.MockedFunction<unknown>;
  };
  tracker: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // Intentionally any: Tracker methods return various metric types for test scenarios
    getTypeScriptErrorCount: jest.MockedFunction<unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getTypeScriptErrorBreakdown: jest.MockedFunction<unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getLintingWarningCount: jest.MockedFunction<unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getLintingWarningBreakdown: jest.MockedFunction<unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getBuildTime: jest.MockedFunction<unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getEnterpriseSystemCount: jest.MockedFunction<unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getCacheHitRate: jest.MockedFunction<unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getMemoryUsage: jest.MockedFunction<unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getProgressMetrics: jest.MockedFunction<unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    generateProgressReport: jest.MockedFunction<unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    startTracking: jest.MockedFunction<unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stopTracking: jest.MockedFunction<unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isTrackingActive: jest.MockedFunction<unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateMockMetrics: jest.MockedFunction<unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resetMockState: jest.MockedFunction<unknown>;
  };
  safety: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // Intentionally any: Safety protocol methods need flexible return types for test scenarios
    createStash: jest.MockedFunction<unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    applyStash: jest.MockedFunction<unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    detectCorruption: jest.MockedFunction<unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validateGitState: jest.MockedFunction<unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    emergencyRollback: jest.MockedFunction<unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listStashes: jest.MockedFunction<unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getSafetyEvents: jest.MockedFunction<unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resetMockState: jest.MockedFunction<unknown>;
  };
  testController: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // Intentionally any: Test controller methods require complete flexibility for test isolation
    initializeForTest: jest.MockedFunction<unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pauseCampaignForTest: jest.MockedFunction<unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resumeCampaignAfterTest: jest.MockedFunction<unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cleanupAfterTest: jest.MockedFunction<unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isPaused: jest.MockedFunction<unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isIsolated: jest.MockedFunction<unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getTestState: jest.MockedFunction<unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    simulateProgress: jest.MockedFunction<unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateMockMetrics: jest.MockedFunction<unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validateTestIsolation: jest.MockedFunction<unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getMockInstances: jest.MockedFunction<unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getTestSafeTracker: jest.MockedFunction<unknown>;
  };
  isolation: {
    initializeMockCampaignSystem: jest.MockedFunction<unknown>;
    pauseCampaignOperations: jest.MockedFunction<unknown>;
    resumeCampaignOperations: jest.MockedFunction<unknown>;
    resetAllMockStates: jest.MockedFunction<unknown>;
    restoreEnvironment: jest.MockedFunction<unknown>;
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
  createMockFunction: (returnValue?: unknown) => jest.MockedFunction<() => unknown>;
  createMockComponent: (name: string, testId?: string) => React.ComponentType<Record<string, unknown>>;

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
  setupCampaignTest: (testName: string, config?: any) => Promise<{
    controller: any;
    tracker: any;
    safety: any;
    testController: any;
    testSafeTracker: any;
  }>;
  cleanupCampaignTest: (testName: string) => Promise<void>;
}

export default ExtendedTestUtils;
