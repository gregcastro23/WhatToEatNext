import '@testing-library/jest-dom';
import { ElementalCalculator } from '@/services/ElementalCalculator';

// Setup test environment
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_ENABLE_ASTRO_DEBUG = 'false';

// Suppress console output during tests to reduce noise in CI
if (process.env.CI) {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}

// Mock fetch for all tests
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers(),
  } as Response)
);

// Mock global services
jest.mock('@/services/ElementalCalculator', () => ({
  ElementalCalculator: {
    getCurrentElementalState: jest.fn().mockReturnValue({
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    }),
    initialize: jest.fn((initialState) => {
      // console.log('Mock initialize called', initialState);
    }),
    updateElementalState: jest.fn((newState) => {
      // console.log('Mock updateElementalState called', newState);
    }),
    getInstance: jest.fn().mockReturnValue({
      initialized: true,
      currentBalance: {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25,
      },
    }),
  },
}));

// Add platform-specific mocks
const isMacOS = process.platform === 'darwin';
const isWindows = process.platform === 'win32';
const isLinux = process.platform === 'linux';

// Add platform-specific configuration if needed
if (isLinux && process.env.CI) {
  // Additional CI-specific Linux configuration
  jest.setTimeout(30000); // 30 seconds for CI environment
}

// Add a simple test so the file doesn't fail with "no tests" error
test('setup is working correctly', () => {
  expect(ElementalCalculator.getCurrentElementalState()).toEqual({
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25,
  });
});
