/** @type {import('jest').Config} */
// @ts-check
const config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  // Note: do NOT include ".mjs" here — Jest always treats .mjs as ESM and
  // rejects the config if .mjs is listed explicitly.
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  moduleNameMapper: {
    // Stub the SpacetimeDB codegen entrypoint — its real module pulls in the
    // spacetimedb package's ESM-only build, which ts-jest can't transform.
    // Must come before the general "@/(.*)" mapping below.
    "^@/lib/spacetime/generated$": "<rootDir>/tests/setup/spacetime-generated-stub.ts",
    "^@/(.*)$": "<rootDir>/src/$1",
    "^react$": "<rootDir>/node_modules/react",
    "^react-dom$": "<rootDir>/node_modules/react-dom",
    // Stub @upstash/redis to avoid ESM-only uncrypto transitive in tests
    "^@upstash/redis$": "<rootDir>/tests/setup/upstash-redis-stub.ts",
  },
  transform: {
    "^.+\\.(ts|tsx|mjs)$": [
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
    "/.claude/",
    "/docs/archived-tests/",
    "/.temp-disabled-tests/",
    "/archive/",
    "/__tests__/temp-validation/", // Exclude temp validation components (not actual tests)
    "/docs/Alchm Kitchen/", // Exclude Alchm Kitchen docs from tests to resolve Haste collision
    // Excluded integration tests
    "tests/cross-backend-rectification",
  ],
  transformIgnorePatterns: [
    "/node_modules/(?!(@upstash/redis|uncrypto)/)",
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  modulePathIgnorePatterns: [
    "<rootDir>/.claude/",
    "<rootDir>/Alchm Kitchen/",
    "<rootDir>/docs/Alchm Kitchen/",
    "<rootDir>/.next/",
    "<rootDir>/.open-next/",
  ],
  setupFiles: ["<rootDir>/tests/setup/jest.globals.ts"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup/jest.setup.ts"],

  // Memory Management Configuration
  testTimeout: 30000, // 30s timeout for CI environment
  maxWorkers: process.env.CI ? 2 : "50%", // 2 workers in CI, 50% locally
  workerIdleMemoryLimit: "1GB", // 1GB limit per worker

  // Memory optimization settings
  clearMocks: true,
  restoreMocks: true,
  resetModules: true,

  verbose: true,

  // Additional memory-safe configurations
  detectOpenHandles: false, // Enable explicitly via CLI when debugging test hangs
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
