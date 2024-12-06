// jest.setup.js

import '@testing-library/jest-dom';
import fetch from 'node-fetch';

// Set up fetch globally
global.fetch = fetch;

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: '',
      asPath: '',
      push: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn()
      },
      beforePopState: jest.fn(() => null),
      prefetch: jest.fn(() => null)
    };
  }
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock console methods to reduce test noise
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

beforeAll(() => {
  console.error = (...args) => {
    if (args[0]?.includes?.('Warning:')) return;
    originalConsoleError.call(console, ...args);
  };
  console.warn = (...args) => {
    if (args[0]?.includes?.('Warning:')) return;
    originalConsoleWarn.call(console, ...args);
  };
  console.log = (...args) => {
    if (process.env.DEBUG) {
      originalConsoleLog.call(console, ...args);
    }
  };
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.log = originalConsoleLog;
});

// Add custom matchers
expect.extend({
  toHaveBeenCalledBefore(received, expected) {
    const receivedIndex = this.currentTestName.indexOf(received.mock.calls[0]);
    const expectedIndex = this.currentTestName.indexOf(expected.mock.calls[0]);
    return {
      pass: receivedIndex < expectedIndex,
      message: () =>
        `expected ${received} to have been called before ${expected}`,
    };
  },
});