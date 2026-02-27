// jest.setup.js
// Uses require() because Jest loads .js setup files as CommonJS.

require("@testing-library/jest-dom");
const { TextEncoder } = require("util");

global.TextEncoder = TextEncoder;

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
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

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
};

beforeAll(() => {
  jest.setTimeout(10000);
});

afterAll(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

// Add global error handler for unhandled rejections
process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection in tests:", error);
});

// Add custom matchers if needed
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
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
