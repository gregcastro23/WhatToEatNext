import '@testing-library/jest-dom';
import React from 'react';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

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

// Global test utilities
global.testUtils = {
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
  }
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

// Declare custom matcher types
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(floor: number, ceiling: number): R;
    }
  }
  
  var testUtils: {
    waitForAsync: (ms?: number) => Promise<void>;
    createMockFunction: (returnValue?: any) => jest.Mock;
    createMockComponent: (name: string, testId?: string) => React.ComponentType<any>;
  };
}

export {};