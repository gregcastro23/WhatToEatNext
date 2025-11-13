/** @type {import('jest').Config} */
// @ts-check
const config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.jest.json",
        useESM: true,
        diagnostics: {
          ignoreCodes: [2322, 2339],
        },
      },
    ],
  },
  testPathIgnorePatterns: [
    "/node_modules/",
    "/.next/",
    "/docs/archived-tests/",
    "/.temp-disabled-tests/",
    "/archive/",
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],

  // Memory Management Configuration
  testTimeout: 30000, // 30s timeout for CI environment
  maxWorkers: process.env.CI ? 2 : "50%", // 2 workers in CI, 50% locally
  workerIdleMemoryLimit: "1GB", // 1GB limit per worker

  // Memory optimization settings
  clearMocks: true,
  restoreMocks: true,
  resetModules: true,

  // Force garbage collection between test suites
  setupFilesAfterEnv: [
    "<rootDir>/src/__tests__/setupTests.tsx",
    "<rootDir>/src/__tests__/setupMemoryManagement.ts",
  ],

  verbose: true,

  // Additional memory-safe configurations
  detectOpenHandles: false, // Disabled in CI to prevent hanging
  forceExit: true,
  bail: false, // Don't stop on first failure

  // Cache configuration for memory efficiency
  cacheDirectory: "<rootDir>/.jest-cache",

  // Test environment options for memory management
  testEnvironmentOptions: {
    url: "http://localhost",
    // Limit DOM memory usage
    resources: "usable",
    runScripts: "dangerously",
    pretendToBeVisual: false,
  },

  // Test reporters for CI/CD artifacts
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: ".",
        outputName: "junit.xml",
        classNameTemplate: "{classname}",
        titleTemplate: "{title}",
        ancestorSeparator: " › ",
        usePathForSuiteName: true,
      },
    ],
  ],

  // Coverage configuration
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
    "!src/**/*.test.{ts,tsx}",
    "!src/**/*.spec.{ts,tsx}",
  ],
  coverageReporters: ["text", "lcov", "cobertura"],
  coverageDirectory: "coverage",
};

export default config;
