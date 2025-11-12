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
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],

  // Memory Management Configuration
  testTimeout: 15000, // Reduced from 30s to 15s for integration tests
  maxWorkers: 2, // Max 2 workers for memory safety
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
  detectOpenHandles: true,
  forceExit: true,

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
