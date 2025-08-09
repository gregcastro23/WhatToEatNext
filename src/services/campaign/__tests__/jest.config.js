/**
 * Jest Configuration for Campaign Testing Infrastructure
 * Perfect Codebase Campaign - Test Configuration
 */

module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/setup.ts'],

  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.integration.test.ts',
    '**/__tests__/**/performance/*.test.ts',
  ],

  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: ['../**/*.ts', '!../**/*.test.ts', '!../**/*.d.ts', '!../node_modules/**', '!../__tests__/**'],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // TypeScript support
  preset: 'ts-jest',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },

  // Module resolution
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/../../../$1',
  },

  // Test timeout
  testTimeout: 30000, // 30 seconds for performance tests

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,

  // Performance test configuration
  testPathIgnorePatterns: ['/node_modules/', '/coverage/', '/__mocks__/'],

  // Custom test groups
  projects: [
    {
      displayName: 'Unit Tests',
      testMatch: ['**/__tests__/**/*.test.ts'],
      testPathIgnorePatterns: ['**/__tests__/integration/**', '**/__tests__/performance/**'],
    },
    {
      displayName: 'Integration Tests',
      testMatch: ['**/__tests__/integration/**/*.test.ts'],
      testTimeout: 60000, // Longer timeout for integration tests
    },
    {
      displayName: 'Performance Tests',
      testMatch: ['**/__tests__/performance/**/*.test.ts'],
      testTimeout: 120000, // Longer timeout for performance tests
      setupFilesAfterEnv: ['<rootDir>/setup.ts'],
      // Performance-specific configuration
      maxWorkers: 1, // Run performance tests sequentially
      detectOpenHandles: true,
      forceExit: true,
    },
  ],

  // Global setup and teardown
  globalSetup: '<rootDir>/globalSetup.js',
  globalTeardown: '<rootDir>/globalTeardown.js',

  // Error handling
  bail: false, // Continue running tests after failures
  errorOnDeprecated: true,

  // Mock configuration
  automock: false,
  resetMocks: true,

  // Watch mode configuration
  watchman: true,
  watchPathIgnorePatterns: ['/node_modules/', '/coverage/', '/.git/'],
};
