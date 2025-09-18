/* eslint-disable @typescript-eslint/no-explicit-any, no-console, @typescript-eslint/no-unused-vars, max-lines-per-function -- Campaign/test file with intentional patterns */
import '@testing-library/jest-dom';
import React from 'react';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {;
  root: Element | null = null,
  rootMargin: string = '0px',
  thresholds: ReadonlyArray<number> = [0];
  private callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    this.root = (options?.root as Element) || null;
    this.rootMargin = options?.rootMargin || '0px';
    this.thresholds = options?.threshold;
      ? Array.isArray(options.threshold)
        ? options.threshold
        : [options.threshold]
      : [0];
  }

  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
} as unknown;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {;
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({,
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
});

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: jest.fn(),
  writable: true
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 0));
global.cancelAnimationFrame = jest.fn();

// Mock performance.now
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByName: jest.fn(() => []),
    getEntriesByType: jest.fn(() => [])
  },
  writable: true
});

// Suppress console warnings for tests
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

beforeEach(() => {
  // Reset mocks before each test
  jest.clearAllMocks();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
});

// Suppress specific warnings that are expected in tests
console.warn = (...args: any[]) => {;
  const message = args[0];
  if (
    typeof message === 'string' &&;
    (message.includes('React.createFactory') ||
      message.includes('componentWillReceiveProps') ||
      message.includes('componentWillUpdate'))
  ) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};

console.error = (...args: any[]) => {;
  const message = args[0];
  if (
    typeof message === 'string' &&;
    (message.includes('Warning: ReactDOM.render') ||
      message.includes('Warning: componentWillReceiveProps') ||
      message.includes('The above error occurred'))
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
};

// Mock implementations for git operations - comprehensive implementation
const gitMock = {
  stash: jest.fn().mockResolvedValue('stash-id'),
  stashPop: jest.fn().mockResolvedValue(true),
  getCurrentBranch: jest.fn().mockResolvedValue('main'),
  hasUncommittedChanges: jest.fn().mockResolvedValue(false),
  getLastCommitHash: jest.fn().mockResolvedValue('abc123'),
  mockStashes: ['stash-1', 'stash-2'],
  mockBranch: 'main',
  mockGitStatus: {
    staged: [],
    unstaged: [],
    untracked: []
  },
  shouldFailCommands: false,
  setMockBranch: jest.fn((branch: string) => {
    gitMock.mockBranch = branch;
  }),
  setMockStashes: jest.fn((stashes: string[]) => {
    gitMock.mockStashes = stashes;
  }),
  setMockGitStatus: jest.fn((status: unknown) => {
    gitMock.mockGitStatus = status;
  }),
  setShouldFailCommands: jest.fn((shouldFail: boolean) => {
    gitMock.shouldFailCommands = shouldFail;
  }),
  addMockStash: jest.fn((stashId: string) => {
    gitMock.mockStashes.push(stashId);
  }),
  removeMockStash: jest.fn((stashId: string) => {
    gitMock.mockStashes = gitMock.mockStashes.filter(s => s !== stashId);
  }),
  clearMockStashes: jest.fn(() => {
    gitMock.mockStashes = [];
  }),
  getMockStashes: jest.fn(() => gitMock.mockStashes),
  simulateGitError: jest.fn((command: string, error: string) => {
    console.warn(`Simulated git error for ${command}: ${error}`);
  }),
  resetMocks: jest.fn(() => {
    gitMock.mockStashes = [];
    gitMock.mockBranch = 'main';
    gitMock.mockGitStatus = { staged: [], unstaged: [], untracked: [] };
    gitMock.shouldFailCommands = false;
  })
};

// Mock implementations for script execution - comprehensive implementation
const scriptMock = {
  executeScript: jest.fn().mockResolvedValue({ success: true, output: '' }),
  executeCommand: jest.fn().mockResolvedValue({ stdout: '', stderr: '', exitCode: 0 }),
  getScriptOutput: jest.fn().mockReturnValue(''),
  mockResults: {},
  mockBuildSuccess: true,
  mockTestSuccess: true,
  shouldFailExecution: false,
  mockExecutionTime: 1000,
  mockMemoryUsage: 50,
  mockErrorOutput: '',
  mockStdout: '',
  mockStderr: '',
  mockExitCode: 0,
  setMockResult: jest.fn((scriptPath: string, result: unknown) => {
    scriptMock.mockResults[scriptPath] = result;
  }),
  setMockBuildSuccess: jest.fn((success: boolean) => {
    scriptMock.mockBuildSuccess = success;
  }),
  setMockTestSuccess: jest.fn((success: boolean) => {
    scriptMock.mockTestSuccess = success;
  }),
  setShouldFailExecution: jest.fn((shouldFail: boolean) => {
    scriptMock.shouldFailExecution = shouldFail;
  }),
  setMockExecutionTime: jest.fn((time: number) => {
    scriptMock.mockExecutionTime = time;
  }),
  setMockMemoryUsage: jest.fn((usage: number) => {
    scriptMock.mockMemoryUsage = usage;
  }),
  setMockOutput: jest.fn((stdout: string, stderr: string, exitCode: number) => {
    scriptMock.mockStdout = stdout;
    scriptMock.mockStderr = stderr;
    scriptMock.mockExitCode = exitCode;
  }),
  simulateScriptError: jest.fn((scriptPath: string, error: string) => {
    console.warn(`Simulated script error for ${scriptPath}: ${error}`);
  }),
  simulateTimeout: jest.fn((scriptPath: string, timeout: number) => {
    console.warn(`Simulated timeout for ${scriptPath}: ${timeout}ms`);
  }),
  resetMocks: jest.fn(() => {
    scriptMock.mockResults = {};
    scriptMock.mockBuildSuccess = true;
    scriptMock.mockTestSuccess = true;
    scriptMock.shouldFailExecution = false;
    scriptMock.mockExecutionTime = 1000;
    scriptMock.mockMemoryUsage = 50;
    scriptMock.mockErrorOutput = '';
    scriptMock.mockStdout = '';
    scriptMock.mockStderr = '';
    scriptMock.mockExitCode = 0;
  })
};

// Campaign system mocks - comprehensive implementation
const campaignMock: any = {};

// Initialize controller
campaignMock.controller = {
  executePhase: jest.fn().mockResolvedValue({
    phaseId: 'mock-phase',
    success: true,
    metricsImprovement: {
      typeScriptErrorsReduced: 5,
      lintingWarningsReduced: 10,
      buildTimeImproved: 0.5,
      enterpriseSystemsAdded: 2
    },
    filesProcessed: 15,
    errorsFixed: 5,
    warningsFixed: 10,
    executionTime: 1000,
    safetyEvents: []
  }),
  validatePhaseCompletion: jest.fn().mockResolvedValue({ success: true, errors: [], warnings: [] }),
  createSafetyCheckpoint: jest.fn().mockResolvedValue('mock-checkpoint-id'),
  rollbackToCheckpoint: jest.fn().mockResolvedValue(undefined),
  getProgressMetrics: jest.fn().mockResolvedValue({
    typeScriptErrors: { current: 50, target: 0, reduction: 36, percentage: 42 },
    lintingWarnings: { current: 2000, target: 0, reduction: 2506, percentage: 56 },
    buildPerformance: { currentTime: 8.5, targetTime: 10, cacheHitRate: 0.8, memoryUsage: 45 },
    enterpriseSystems: { current: 50, target: 200, transformedExports: 50 }
  }),
  pauseCampaign: jest.fn(),
  resumeCampaign: jest.fn(),
  isPaused: jest.fn().mockReturnValue(false),
  isRunning: jest.fn().mockReturnValue(false),
  getSafetyEvents: jest.fn().mockReturnValue([]),
  updateMockMetrics: jest.fn(),
  resetMockState: jest.fn()
};

// Initialize tracker
campaignMock.tracker = {
  getTypeScriptErrorCount: jest.fn().mockResolvedValue(50),
  getTypeScriptErrorBreakdown: jest
    .fn()
    .mockResolvedValue({ TS2352: 15, TS2339: 20, TS2304: 10, TS2345: 5 }),
  getLintingWarningCount: jest.fn().mockResolvedValue(2000),
  getLintingWarningBreakdown: jest.fn().mockResolvedValue({
    '@typescript-eslint/no-explicit-any': 800,
    '@typescript-eslint/no-unused-vars': 600,
    'no-console': 400,
    'prefer-const': 200
  }),
  getBuildTime: jest.fn().mockResolvedValue(8.5),
  getEnterpriseSystemCount: jest.fn().mockResolvedValue(50),
  getCacheHitRate: jest.fn().mockResolvedValue(0.8),
  getMemoryUsage: jest.fn().mockResolvedValue(45),
  getProgressMetrics: jest.fn().mockResolvedValue({
    typeScriptErrors: { current: 50, target: 0, reduction: 36, percentage: 42 },
    lintingWarnings: { current: 2000, target: 0, reduction: 2506, percentage: 56 },
    buildPerformance: { currentTime: 8.5, targetTime: 10, cacheHitRate: 0.8, memoryUsage: 45 },
    enterpriseSystems: { current: 50, target: 200, transformedExports: 50 }
  }),
  generateProgressReport: jest.fn().mockResolvedValue({
    campaignId: 'mock-campaign',
    overallProgress: 65,
    phases: [],
    currentMetrics: {},
    targetMetrics: {},
    estimatedCompletion: new Date(Date.now() + 3600000)
  }),
  startTracking: jest.fn(),
  stopTracking: jest.fn(),
  isTrackingActive: jest.fn().mockReturnValue(false),
  updateMockMetrics: jest.fn(),
  resetMockState: jest.fn()
};

// Initialize safety
campaignMock.safety = {
  createStash: jest.fn().mockResolvedValue('mock-stash-id'),
  applyStash: jest.fn().mockResolvedValue(undefined),
  detectCorruption: jest.fn().mockResolvedValue({
    detectedFiles: [],
    corruptionPatterns: [],
    severity: 'LOW',
    recommendedAction: 'CONTINUE'
  }),
  validateGitState: jest.fn().mockResolvedValue({ success: true, errors: [], warnings: [] }),
  emergencyRollback: jest.fn().mockResolvedValue(undefined),
  listStashes: jest.fn().mockResolvedValue([]),
  getSafetyEvents: jest.fn().mockReturnValue([]),
  resetMockState: jest.fn()
};

// Initialize testController
campaignMock.testController = {
  initializeForTest: jest.fn().mockResolvedValue(undefined),
  pauseCampaignForTest: jest.fn().mockResolvedValue(undefined),
  resumeCampaignAfterTest: jest.fn().mockResolvedValue(undefined),
  cleanupAfterTest: jest.fn().mockResolvedValue(undefined),
  isPaused: jest.fn().mockReturnValue(false),
  isIsolated: jest.fn().mockReturnValue(false),
  getTestState: jest.fn().mockReturnValue({
    isPaused: false,
    isIsolated: false,
    pausedAt: null,
    resumedAt: null,
    testName: null,
    originalState: null
  }),
  simulateProgress: jest.fn().mockResolvedValue(undefined),
  updateMockMetrics: jest.fn(),
  validateTestIsolation: jest.fn().mockReturnValue({ isValid: true, issues: [], warnings: [] }),
  getMockInstances: jest.fn().mockReturnValue({ controller: null, tracker: null, safety: null }),
  getTestSafeTracker: jest.fn().mockReturnValue(null)
};

// Initialize isolation (now that other components are defined)
campaignMock.isolation = {
  initializeMockCampaignSystem: jest.fn().mockReturnValue({
    controller: campaignMock.controller,
    tracker: campaignMock.tracker,
    safety: campaignMock.safety
  }),
  pauseCampaignOperations: jest.fn(),
  resumeCampaignOperations: jest.fn(),
  resetAllMockStates: jest.fn(),
  restoreEnvironment: jest.fn()
};

// Initialize resetAllMocks
campaignMock.resetAllMocks = jest.fn(() => {;
  Object.values(campaignMock.controller).forEach(mock => {;
    if (jest.isMockFunction(mock)) mock.mockClear();
  });
  Object.values(campaignMock.tracker).forEach(mock => {;
    if (jest.isMockFunction(mock)) mock.mockClear();
  });
  Object.values(campaignMock.safety).forEach(mock => {;
    if (jest.isMockFunction(mock)) mock.mockClear();
  });
  Object.values(campaignMock.testController).forEach(mock => {;
    if (jest.isMockFunction(mock)) mock.mockClear();
  });
  Object.values(campaignMock.isolation).forEach(mock => {;
    if (jest.isMockFunction(mock)) mock.mockClear();
  });
});

// Global test utilities with extended interface
(global as unknown).testUtils = {
  // Git operations mock
  gitMock,

  // Script execution mock
  scriptMock,

  // Campaign system mock
  campaignMock,

  // Helper to wait for async operations
  waitForAsync: (ms = 0) => new Promise(resolve => setTimeout(resolve, ms)),;

  // Helper to create mock functions with specific return values
  createMockFunction: (returnValue?: unknown) => jest.fn(() => returnValue),

  // Helper to create mock component
  createMockComponent: (name: string, testId?: string) => {
    const MockComponent = (props: unknown) => (;
      <div data-testid={testId || name.toLowerCase()} {...props}>;
        Mock {name}
      </div>
    );
    MockComponent.displayName = `Mock${name}`;
    return MockComponent;
  },

  // Memory management utilities
  checkMemory: () => {
    if (global.getMemoryUsage) {
      return global.getMemoryUsage();
    }
    const usage = process.memoryUsage();
    return {
      heapUsed: `${(usage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
      heapTotal: `${(usage.heapTotal / 1024 / 1024).toFixed(2)}MB`,
      external: `${(usage.external / 1024 / 1024).toFixed(2)}MB`,
      arrayBuffers: `${(usage.arrayBuffers / 1024 / 1024).toFixed(2)}MB`
    };
  },

  // Force cleanup for memory-intensive tests
  cleanupMemory: () => {
    if (global.cleanupTestMemory) {
      return global.cleanupTestMemory();
    }

    // Fallback cleanup
    jest.clearAllMocks();
    jest.resetModules();

    if (global.forceGC) {
      global.forceGC();
    }

    return null;
  },

  // Mock file creation utilities
  createMockCorruptedFile: (content: string) => {
    return `// CORRUPTED FILE\n${content}\n// CORRUPTION_MARKER`;
  },

  createMockTypeScriptErrors: (count: number) => {
    return Array.from(
      { length: count },
      (_, i) => `error TS2339: Property 'test${i}' does not exist on type 'unknown'.`,
    ).join('\n');
  },

  createMockLintingWarnings: (count: number) => {
    return Array.from(
      { length: count },
      (_, i) => `warning: Unused variable 'test${i}' @typescript-eslint/no-unused-vars`,
    ).join('\n');
  },

  createMockProgressMetrics: (overrides: any = {}) => ({;
    typeScriptErrors: { current: 50, target: 0, reduction: 36, percentage: 42 },
    lintingWarnings: { current: 2000, target: 0, reduction: 2506, percentage: 56 },
    buildPerformance: { currentTime: 8.5, targetTime: 10, cacheHitRate: 0.8, memoryUsage: 45 },
    enterpriseSystems: { current: 50, target: 200, transformedExports: 50 },
    ...overrides
  }),

  // Campaign test utilities
  setupCampaignTest: async (testName: string, config: any = {}) => {;
    await campaignMock.testController.initializeForTest(testName, config);
    await campaignMock.testController.pauseCampaignForTest(testName);
    return {
      controller: campaignMock.controller,
      tracker: campaignMock.tracker,
      safety: campaignMock.safety,
      testController: campaignMock.testController,
      testSafeTracker: campaignMock.testController.getTestSafeTracker()
    };
  },

  cleanupCampaignTest: async (testName: string) => {
    await campaignMock.testController.cleanupAfterTest(testName);
  }
};

// Extend Jest matchers
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
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
  }
});

// Declare custom matcher types
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(floor: number, ceiling: number): R
    }
  }
}

export {};
