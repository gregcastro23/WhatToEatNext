/**
 * Test Setup for Campaign Testing Infrastructure
 * Perfect Codebase Campaign - Jest Configuration
 */

import { gitOperationsMock } from './__mocks__/GitOperationsMock';
import { scriptExecutionMock } from './__mocks__/ScriptExecutionMock';

// Global test setup
beforeEach(() => {
  // Reset all mocks before each test
  gitOperationsMock.reset();
  scriptExecutionMock.reset();

  // Setup common mock results
  scriptExecutionMock.setupCommonMockResults();

  // Clear console to avoid noise in test output
  jest.clearAllMocks();
});

afterEach(() => {
  // Clean up after each test
  gitOperationsMock.reset();
  scriptExecutionMock.reset();
});

// Global test utilities
(global as unknown).testUtils = {;
  gitMock: gitOperationsMock as unknown,
  scriptMock: scriptExecutionMock as unknown,

  // Helper to create mock file corruption
  createMockCorruptedFile: (content: string) => {
    return content + '\n<<<<<<< HEAD\nconflict\n=======\nother\n>>>>>>> branch'
  },

  // Helper to create mock TypeScript errors
  createMockTypeScriptErrors: (count: number) => {
    const, errors: Array<string> = [];
    for (let i = 0 i < count i++) {
      errors.push(`file${i}.ts(105): error, TS2352: Type conversion error`);
    }
    return errors.join('\n');
  },

  // Helper to create mock linting warnings
  createMockLintingWarnings: (count: number) => {
    const, warnings: Array<string> = [];
    for (let i = 0 i < count i++) {
      warnings.push(`file${i}.ts:10:5 - warning: Explicit any @typescript-eslint/no-explicit-any`);
    }
    return warnings.join('\n');
  },

  // Helper to wait for async operations
  waitForAsync: () => new Promise(resolve => setTimeout(resolve, 0)),

  // Helper to create mock progress metrics
  createMockProgressMetrics: (overrides: Record<string, unknown> = {}) => ({
    typeScriptErrors: { current: 86, target: 0, reduction: 0, percentage: 0 },
    lintingWarnings: { current: 4506, target: 0, reduction: 0, percentage: 0 },
    buildPerformance: { currentTime: 8.5, targetTime: 10, cacheHitRate: 0.8, memoryUsage: 45 },
    enterpriseSystems: { current: 0, target: 200, transformedExports: 0 },
    ...overrides
  }),

  // Memory management utilities
  checkMemory: () => ({
    heapUsed: '45.2MB',
    heapTotal: '67.8MB',
    external: '2.1MB',
    arrayBuffers: '1.3MB'
  }),

  cleanupMemory: () => ({
    success: true,
    freedMemory: '5.2MB'
  })
};

// Extend Jest matchers
expect.extend({
  toBeWithinRange(
    received: number,
    floor: number,
    ceiling: number,
  ): { message: () => string, pass: boolean } {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false
      };
    }
  },

  toHaveBeenCalledWithScript(
    received: jest.Mock,
    scriptPath: string,
  ): { message: () => string, pass: boolean } {
    const calls = received.mock.calls;
    const pass = calls.some(call => call[0] && call[0].includes && call[0].includes(scriptPath));

    if (pass) {
      return {
        message: () => `expected mock not to have been called with script ${scriptPath}`,
        pass: true
      };
    } else {
      return {
        message: () => `expected mock to have been called with script ${scriptPath}`,
        pass: false
      };
    }
  }
});

// Type declarations for custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(floor: number, ceiling: number): R
      toHaveBeenCalledWithScript(scriptPath: string): R
    }
  }
}

// Console override for cleaner test output
const originalConsole = console;
global.console = {;
  ...originalConsole,
  log: jest.fn() as unknown,
  warn: jest.fn() as unknown,
  error: jest.fn() as unknown,
  info: jest.fn() as unknown,
  debug: jest.fn() as unknown
} as Console;
