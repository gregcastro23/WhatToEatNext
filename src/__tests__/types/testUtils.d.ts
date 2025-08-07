/**
 * Test Utilities Type Definitions
 *
 * Unified type definitions for test utilities and global test objects
 */

import { Mock } from 'jest';

// Memory monitoring interfaces
export interface MemoryUsage {
  heapUsed: string;
  heapTotal: string;
  external: string;
  arrayBuffers: string;
  rss?: string;
}

export interface MemoryThresholds {
  warning?: number;
  error?: number;
  leak?: number;
}

export interface MemoryUsageFn {
  (): MemoryUsage;
}

// Jest mock-compatible memory usage function type for tests
export type MockableMemoryUsageFn = MemoryUsageFn | jest.Mock<MemoryUsage, []> | jest.Mock<any, any>;

// Git operations mock interface - comprehensive implementation
export interface GitOperationsMock {
  stash: Mock;
  stashPop: Mock;
  getCurrentBranch: Mock;
  hasUncommittedChanges: Mock;
  getLastCommitHash: Mock;
  mockStashes: string[];
  mockBranch: string;
  mockGitStatus: {
    staged: string[];
    unstaged: string[];
    untracked: string[];
  };
  shouldFailCommands: boolean;
  setMockBranch: (branch: string) => void;
  setMockStashes: (stashes: string[]) => void;
  setMockGitStatus: (status: unknown) => void;
  setShouldFailCommands: (shouldFail: boolean) => void;
  addMockStash: (stashId: string) => void;
  removeMockStash: (stashId: string) => void;
  clearMockStashes: () => void;
  getMockStashes: () => string[];
  simulateGitError: (command: string, error: string) => void;
  resetMocks: () => void;
}

// Script execution mock interface - comprehensive implementation
export interface ScriptExecutionMock {
  executeScript: Mock;
  executeCommand: Mock;
  getScriptOutput: Mock;
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
  setMockResult: (scriptPath: string, result: any) => void;
  setMockBuildSuccess: (success: boolean) => void;
  setMockTestSuccess: (success: boolean) => void;
  setShouldFailExecution: (shouldFail: boolean) => void;
  setMockExecutionTime: (time: number) => void;
  setMockMemoryUsage: (usage: number) => void;
  setMockOutput: (stdout: string, stderr: string, exitCode: number) => void;
  simulateScriptError: (scriptPath: string, error: string) => void;
  simulateTimeout: (scriptPath: string, timeout: number) => void;
  resetMocks: () => void;
}

// Core test utilities interface
export interface CoreTestUtils {
  waitForAsync: (ms?: number) => Promise<void>;
  createMockFunction: (returnValue?: unknown) => jest.MockedFunction<() => unknown>;
  createMockComponent: (name: string, testId?: string) => React.ComponentType<Record<string, unknown>>;
  checkMemory: () => MemoryUsage;
  cleanupMemory: () => any;
}

// Extended test utilities interface (includes mocks)
export interface ExtendedTestUtils extends CoreTestUtils {
  gitMock: GitOperationsMock;
  scriptMock: ScriptExecutionMock;
  createMockCorruptedFile: (content: string) => string;
  createMockTypeScriptErrors: (count: number) => string;
  createMockLintingWarnings: (count: number) => string;
  createMockProgressMetrics: (overrides?: any) => any;
}

// Mock planetary positions type for tests
export interface MockPlanetaryPosition {
  sign: string;
  degree: number;
  exactLongitude: number;
  isRetrograde: boolean;
}

export interface MockPlanetaryPositions {
  sun: MockPlanetaryPosition;
  moon: MockPlanetaryPosition;
  mercury: MockPlanetaryPosition;
  venus: MockPlanetaryPosition;
  mars: MockPlanetaryPosition;
  jupiter: MockPlanetaryPosition;
  saturn: MockPlanetaryPosition;
  uranus: MockPlanetaryPosition;
  neptune: MockPlanetaryPosition;
  pluto: MockPlanetaryPosition;
  northNode: MockPlanetaryPosition;
  southNode: MockPlanetaryPosition;
}

// React component props types for testing
export interface MockComponentProps {
  children?: React.ReactNode;
  [key: string]: unknown;
}

// App component props interface
export interface AppProps {
  children?: React.ReactNode;
}

// MainPageLayout props interface
export interface MainPageLayoutProps {
  children?: React.ReactNode;
  debugMode?: boolean;
  loading?: boolean;
  onSectionNavigate?: (sectionId: string) => void;
}

// AlchemicalProvider props interface
export interface AlchemicalProviderProps {
  children: React.ReactNode;
}

// Global declarations
declare global {
  var testUtils: ExtendedTestUtils;
  var forceGC: (() => boolean) | undefined;
  var getMemoryUsage: (() => MemoryUsage) | undefined;
  var cleanupTestMemory: (() => any) | undefined;
  var __TEST_CACHE__: Map<string, any> | { clear: () => void } | undefined;
  var __TEST_REFS__: any[] | undefined;

  // Allow process.memoryUsage to be mocked in tests
  namespace NodeJS {
    interface Process {
      memoryUsage: MockableMemoryUsageFn;
    }
  }

  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(floor: number, ceiling: number): R;
    }
  }
}

export { };
