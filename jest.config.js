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
    // Git worktrees checked out inside the repo. Without this, running the
    // suite from the primary checkout also collects every sibling worktree's
    // copy of every test — they fail on module resolution (their node_modules
    // is a symlink to this checkout's) and report as failures that belong to
    // no branch. `/.claude/` above already covers `.claude/worktrees/`; this
    // covers the top-level `.worktrees/` convention.
    "/.worktrees/",
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
    // Also keeps Haste from colliding on duplicate package.json/module names
    // between the primary checkout and any worktree nested inside it.
    "<rootDir>/.worktrees/",
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

  testEnvironmentOptions: {
    url: "http://localhost",
    // `resources: "usable"` and `runScripts: "dangerously"` were removed. The
    // comment here claimed they limited DOM memory usage; they do the opposite.
    // `resources: "usable"` makes jsdom fetch real external subresources during
    // unit tests (jest's default is not to), and `runScripts: "dangerously"` was
    // a no-op — @jest/environment-jsdom-abstract hardcodes that value before
    // spreading these options. No test depended on either.
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
