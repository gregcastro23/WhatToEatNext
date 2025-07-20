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
  setMockGitStatus: jest.MockedFunction<(status: any) => void>;
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
  mockResults: Record<string, any>;
  mockBuildSuccess: boolean;
  mockTestSuccess: boolean;
  shouldFailExecution: boolean;
  mockExecutionTime: number;
  mockMemoryUsage: number;
  mockErrorOutput: string;
  mockStdout: string;
  mockStderr: string;
  mockExitCode: number;
  setMockResult: jest.MockedFunction<(scriptPath: string, result: any) => void>;
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
    executePhase: jest.MockedFunction<any>;
    validatePhaseCompletion: jest.MockedFunction<any>;
    createSafetyCheckpoint: jest.MockedFunction<any>;
    rollbackToCheckpoint: jest.MockedFunction<any>;
    getProgressMetrics: jest.MockedFunction<any>;
    pauseCampaign: jest.MockedFunction<any>;
    resumeCampaign: jest.MockedFunction<any>;
    isPaused: jest.MockedFunction<any>;
    isRunning: jest.MockedFunction<any>;
    getSafetyEvents: jest.MockedFunction<any>;
    updateMockMetrics: jest.MockedFunction<any>;
    resetMockState: jest.MockedFunction<any>;
  };
  tracker: {
    getTypeScriptErrorCount: jest.MockedFunction<any>;
    getTypeScriptErrorBreakdown: jest.MockedFunction<any>;
    getLintingWarningCount: jest.MockedFunction<any>;
    getLintingWarningBreakdown: jest.MockedFunction<any>;
    getBuildTime: jest.MockedFunction<any>;
    getEnterpriseSystemCount: jest.MockedFunction<any>;
    getCacheHitRate: jest.MockedFunction<any>;
    getMemoryUsage: jest.MockedFunction<any>;
    getProgressMetrics: jest.MockedFunction<any>;
    generateProgressReport: jest.MockedFunction<any>;
    startTracking: jest.MockedFunction<any>;
    stopTracking: jest.MockedFunction<any>;
    isTrackingActive: jest.MockedFunction<any>;
    updateMockMetrics: jest.MockedFunction<any>;
    resetMockState: jest.MockedFunction<any>;
  };
  safety: {
    createStash: jest.MockedFunction<any>;
    applyStash: jest.MockedFunction<any>;
    detectCorruption: jest.MockedFunction<any>;
    validateGitState: jest.MockedFunction<any>;
    emergencyRollback: jest.MockedFunction<any>;
    listStashes: jest.MockedFunction<any>;
    getSafetyEvents: jest.MockedFunction<any>;
    resetMockState: jest.MockedFunction<any>;
  };
  testController: {
    initializeForTest: jest.MockedFunction<any>;
    pauseCampaignForTest: jest.MockedFunction<any>;
    resumeCampaignAfterTest: jest.MockedFunction<any>;
    cleanupAfterTest: jest.MockedFunction<any>;
    isPaused: jest.MockedFunction<any>;
    isIsolated: jest.MockedFunction<any>;
    getTestState: jest.MockedFunction<any>;
    simulateProgress: jest.MockedFunction<any>;
    updateMockMetrics: jest.MockedFunction<any>;
    validateTestIsolation: jest.MockedFunction<any>;
    getMockInstances: jest.MockedFunction<any>;
    getTestSafeTracker: jest.MockedFunction<any>;
  };
  isolation: {
    initializeMockCampaignSystem: jest.MockedFunction<any>;
    pauseCampaignOperations: jest.MockedFunction<any>;
    resumeCampaignOperations: jest.MockedFunction<any>;
    resetAllMockStates: jest.MockedFunction<any>;
    restoreEnvironment: jest.MockedFunction<any>;
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
  createMockFunction: (returnValue?: any) => jest.MockedFunction<any>;
  createMockComponent: (name: string, testId?: string) => React.ComponentType<any>;
  
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
  createMockProgressMetrics: (overrides?: any) => ProgressMetrics;
  
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