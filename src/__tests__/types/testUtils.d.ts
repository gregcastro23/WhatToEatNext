/**
 * Test Utilities Type Definitions
 * 
 * Unified type definitions for test utilities and global test objects
 */

import { Mock } from 'jest';
import { ComponentType } from 'react';

// Memory monitoring interfaces
export interface MemoryUsage {
  heapUsed: string;
  heapTotal: string;
  external: string;
  arrayBuffers: string;
}

export interface MemoryThresholds {
  warning?: number;
  error?: number;
  leak?: number;
}

// Git operations mock interface
export interface GitOperationsMock {
  stash: Mock;
  stashPop: Mock;
  getCurrentBranch: Mock;
  hasUncommittedChanges: Mock;
  getLastCommitHash: Mock;
}

// Script execution mock interface
export interface ScriptExecutionMock {
  executeScript: Mock;
  executeCommand: Mock;
  getScriptOutput: Mock;
}

// Core test utilities interface
export interface CoreTestUtils {
  waitForAsync: (ms?: number) => Promise<void>;
  createMockFunction: (returnValue?: any) => Mock<any, [], any>;
  createMockComponent: (name: string, testId?: string) => ComponentType<any>;
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

// Global declarations
declare global {
  var testUtils: ExtendedTestUtils;
  var forceGC: (() => boolean) | undefined;
  var getMemoryUsage: (() => MemoryUsage) | undefined;
  var cleanupTestMemory: (() => any) | undefined;
  var __TEST_CACHE__: Map<string, any> | { clear: () => void } | undefined;
  var __TEST_REFS__: any[] | undefined;
  
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(floor: number, ceiling: number): R;
    }
  }
}

export {};