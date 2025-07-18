import '@testing-library/jest-dom';
import React from 'react';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  root: Element | null = null;
  rootMargin: string = '0px';
  thresholds: ReadonlyArray<number> = [0];
  
  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.root = (options?.root as Element) || null;
    this.rootMargin = options?.rootMargin || '0px';
    this.thresholds = options?.threshold ? 
      (Array.isArray(options.threshold) ? options.threshold : [options.threshold]) : 
      [0];
  }
  
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
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
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
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
    getEntriesByType: jest.fn(() => []),
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
console.warn = (...args) => {
  const message = args[0];
  if (
    typeof message === 'string' && 
    (message.includes('React.createFactory') ||
     message.includes('componentWillReceiveProps') ||
     message.includes('componentWillUpdate'))
  ) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};

console.error = (...args) => {
  const message = args[0];
  if (
    typeof message === 'string' && 
    (message.includes('Warning: ReactDOM.render') ||
     message.includes('Warning: componentWillReceiveProps') ||
     message.includes('The above error occurred'))
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
};

// Mock implementations for git operations
const gitMock = {
  stash: jest.fn().mockResolvedValue('stash-id'),
  stashPop: jest.fn().mockResolvedValue(true),
  getCurrentBranch: jest.fn().mockResolvedValue('main'),
  hasUncommittedChanges: jest.fn().mockResolvedValue(false),
  getLastCommitHash: jest.fn().mockResolvedValue('abc123')
};

// Mock implementations for script execution
const scriptMock = {
  executeScript: jest.fn().mockResolvedValue({ success: true, output: '' }),
  executeCommand: jest.fn().mockResolvedValue({ stdout: '', stderr: '', exitCode: 0 }),
  getScriptOutput: jest.fn().mockReturnValue('')
};

// Global test utilities with extended interface
global.testUtils = {
  // Git operations mock
  gitMock,
  
  // Script execution mock
  scriptMock,
  
  // Helper to wait for async operations
  waitForAsync: (ms = 0) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Helper to create mock functions with specific return values
  createMockFunction: (returnValue?: any) => jest.fn(() => returnValue),
  
  // Helper to create mock component
  createMockComponent: (name: string, testId?: string) => {
    const MockComponent = (props: any) => (
      <div data-testid={testId || name.toLowerCase()} {...props}>
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
    return Array.from({ length: count }, (_, i) => 
      `error TS2339: Property 'test${i}' does not exist on type 'unknown'.`
    ).join('\n');
  },
  
  createMockLintingWarnings: (count: number) => {
    return Array.from({ length: count }, (_, i) => 
      `warning: Unused variable 'test${i}' @typescript-eslint/no-unused-vars`
    ).join('\n');
  },
  
  createMockProgressMetrics: (overrides: any = {}) => ({
    typeScriptErrors: 0,
    lintingWarnings: 0,
    buildTime: 5000,
    memoryUsage: 100,
    ...overrides
  })
};

// Extend Jest matchers
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// Import the unified type definitions
import type { ExtendedTestUtils } from './types/testUtils';

// Declare custom matcher types
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(floor: number, ceiling: number): R;
    }
  }
  
  var testUtils: ExtendedTestUtils;
}

export {};