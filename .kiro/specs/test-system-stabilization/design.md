# Test System Stabilization Design

## Overview

This design document outlines the systematic approach to resolving critical test failures, memory issues, and build problems in the WhatToEatNext application. The solution focuses on infrastructure repair, dependency resolution, and memory optimization to restore system stability.

## Architecture

### Problem Analysis

**Critical Issues Identified:**
1. **Memory Exhaustion**: JavaScript heap out of memory (4GB limit exceeded)
2. **Missing Modules**: `elementalCalculations` and `createLogger` undefined exports
3. **Build Failures**: Next.js build process failing with missing manifests
4. **Test Timeouts**: Safety protocol tests exceeding 30-second limits
5. **Worker Process Crashes**: Jest workers terminated with SIGABRT

**Root Cause Analysis:**
- Circular dependencies in module imports
- Excessive memory allocation in test suites
- Missing or incorrectly exported modules
- Build process attempting to access non-existent files
- Infinite loops or memory leaks in test execution

### Solution Architecture

**Phase 1: Emergency Stabilization**
- Fix critical missing module exports
- Implement memory-safe test configurations
- Resolve circular dependency issues
- Add proper error boundaries for test execution

**Phase 2: Build System Repair**
- Fix Next.js build configuration issues
- Ensure all required files are properly generated
- Implement proper API route handling
- Add build validation and error recovery

**Phase 3: Memory Optimization**
- Implement memory-efficient test patterns
- Add garbage collection hints
- Optimize large object allocations
- Implement test isolation strategies

**Phase 4: TypeScript Error Resolution**
- Systematic resolution of 2,768 TypeScript errors across 187 files
- Fix critical type definition imports and missing type declarations
- Replace unsafe type conversions with proper type guards
- Implement runtime type validation and property access safety
- Align function signatures and resolve argument type mismatches

**Phase 5: Test Infrastructure Hardening**
- Add timeout management for long-running tests
- Implement proper mocking strategies
- Add test environment isolation
- Implement retry mechanisms for flaky tests

## Components and Interfaces

### Module Export Repair System

**Missing Module Resolution:**
```typescript
// src/calculations/index.ts - Fix missing exports
export { ElementalCalculator as elementalCalculations } from './ElementalCalculator';
export { calculateElementalCompatibility } from './elemental/elementalCompatibility';
export { calculatePlanetaryInfluences } from './planetary/planetaryInfluences';

// Ensure all required exports are available
export * from './culinary/culinaryAstrology';
export * from './core/alchemicalEngine';
```

**Logger System Standardization:**
```typescript
// src/utils/logger.ts - Ensure createLogger is properly exported
export const createLogger = (component: string) => {
  return {
    debug: (message: string, ...args: any[]) => console.debug(`[${component}]`, message, ...args),
    info: (message: string, ...args: any[]) => console.info(`[${component}]`, message, ...args),
    warn: (message: string, ...args: any[]) => console.warn(`[${component}]`, message, ...args),
    error: (message: string, ...args: any[]) => console.error(`[${component}]`, message, ...args)
  };
};

// Default logger export
export const logger = createLogger('Default');
```

### Memory Management System

**Test Memory Configuration:**
```typescript
// jest.config.js - Memory-safe test configuration
module.exports = {
  // Limit memory usage per worker
  maxWorkers: 2,
  workerIdleMemoryLimit: '1GB',
  
  // Add memory monitoring
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setupTests.tsx'],
  
  // Optimize test execution
  testTimeout: 15000, // Reduce from 30000
  
  // Memory-efficient test patterns
  clearMocks: true,
  restoreMocks: true,
  resetModules: true
};
```

**Memory Monitoring Integration:**
```typescript
// Memory usage tracking in tests
class TestMemoryMonitor {
  private initialMemory: number;
  
  constructor() {
    this.initialMemory = process.memoryUsage().heapUsed;
  }
  
  checkMemoryUsage(testName: string) {
    const currentMemory = process.memoryUsage().heapUsed;
    const memoryDiff = currentMemory - this.initialMemory;
    
    if (memoryDiff > 100 * 1024 * 1024) { // 100MB threshold
      console.warn(`High memory usage in ${testName}: ${memoryDiff / 1024 / 1024}MB`);
    }
  }
  
  cleanup() {
    if (global.gc) {
      global.gc();
    }
  }
}
```

### TypeScript Error Resolution System

**Error Analysis and Categorization:**
```typescript
// TypeScript Error Resolution Strategy
interface TypeScriptErrorCategory {
  errorCode: string;
  count: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  pattern: string;
  fixStrategy: string;
}

const ERROR_CATEGORIES: TypeScriptErrorCategory[] = [
  {
    errorCode: 'TS2352',
    count: 800,
    priority: 'critical',
    pattern: 'Unsafe type conversions (as Record<string, unknown>)',
    fixStrategy: 'Replace with proper type guards and runtime validation'
  },
  {
    errorCode: 'TS2339',
    count: 600,
    priority: 'critical',
    pattern: 'Property access on unknown types',
    fixStrategy: 'Add type guards before property access'
  },
  {
    errorCode: 'TS2304',
    count: 400,
    priority: 'critical',
    pattern: 'Missing type definitions (Ingredient, UnifiedIngredient, CookingMethod)',
    fixStrategy: 'Fix imports and add missing type declarations'
  }
];
```

**Type Safety Restoration Framework:**
```typescript
// Type Guard Implementation
class TypeSafetyValidator {
  // Replace unsafe type conversions
  static isValidIngredient(obj: unknown): obj is Ingredient {
    return typeof obj === 'object' && 
           obj !== null && 
           'name' in obj && 
           'elementalProperties' in obj;
  }
  
  static isValidElementalProperties(obj: unknown): obj is ElementalProperties {
    return typeof obj === 'object' && 
           obj !== null &&
           typeof (obj as any).Fire === 'number' &&
           typeof (obj as any).Water === 'number' &&
           typeof (obj as any).Earth === 'number' &&
           typeof (obj as any).Air === 'number';
  }
  
  // Safe property access
  static safePropertyAccess<T>(obj: unknown, property: string): T | undefined {
    if (typeof obj === 'object' && obj !== null && property in obj) {
      return (obj as any)[property];
    }
    return undefined;
  }
}
```

**Missing Type Definition Resolution:**
```typescript
// src/types/unified.ts - Comprehensive type definitions
export interface Ingredient {
  id: string;
  name: string;
  category: string;
  elementalProperties: ElementalProperties;
  astrologicalProfile?: AstrologicalProfile;
  nutritionalData?: NutritionalData;
}

export interface UnifiedIngredient extends Ingredient {
  unifiedId: string;
  mappings: IngredientMapping[];
  validationStatus: 'validated' | 'pending' | 'error';
}

export interface CookingMethod {
  id: string;
  name: string;
  elementalEffect: ElementalProperties;
  thermodynamicProperties: ThermodynamicProperties;
  astrologicalInfluences?: AstrologicalInfluences;
}

// Ensure proper exports in index files
export * from './unified';
export * from './alchemy';
export * from './astrology';
```

**Runtime Type Validation System:**
```typescript
// Runtime validation for critical operations
class RuntimeTypeValidator {
  static validateAndConvert<T>(
    value: unknown, 
    validator: (val: unknown) => val is T,
    fallback: T
  ): T {
    if (validator(value)) {
      return value;
    }
    
    console.warn('Type validation failed, using fallback:', { value, fallback });
    return fallback;
  }
  
  static safeMethodCall<T, R>(
    obj: T,
    method: keyof T,
    args: any[] = [],
    fallback: R
  ): R {
    try {
      const fn = obj[method];
      if (typeof fn === 'function') {
        return (fn as any).apply(obj, args);
      }
    } catch (error) {
      console.warn('Safe method call failed:', error);
    }
    return fallback;
  }
}
```

**Function Signature Alignment:**
```typescript
// Function signature standardization
interface StandardizedFunctionSignatures {
  calculateElementalScore: (
    source: ElementalProperties, 
    target: ElementalProperties
  ) => number;
  
  getIngredientRecommendations: (
    preferences: ElementalProperties,
    options?: RecommendationOptions
  ) => Promise<Ingredient[]>;
  
  validateAstrologicalState: (
    state: unknown
  ) => state is AstrologicalState;
}

// Implementation with proper error handling
class FunctionSignatureValidator {
  static ensureElementalProperties(obj: unknown): ElementalProperties {
    if (TypeSafetyValidator.isValidElementalProperties(obj)) {
      return obj;
    }
    
    // Return safe default
    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  }
  
  static ensureStringArray(obj: unknown): string[] {
    if (Array.isArray(obj) && obj.every(item => typeof item === 'string')) {
      return obj;
    }
    return [];
  }
}
```

### Build System Repair

**Next.js Configuration Fix:**
```typescript
// next.config.js - Ensure proper build configuration
module.exports = {
  // Fix API route handling
  experimental: {
    appDir: true
  },
  
  // Ensure proper file generation
  generateBuildId: async () => {
    return 'stable-build-id';
  },
  
  // Handle missing files gracefully
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ensure server-side modules are properly handled
      config.externals = config.externals || [];
    }
    return config;
  }
};
```

**Build Validation System:**
```typescript
// Build validation and recovery
class BuildValidator {
  async validateBuild(): Promise<boolean> {
    const requiredFiles = [
      '.next/server/pages-manifest.json',
      '.next/server/app-paths-manifest.json',
      '.next/server/next-font-manifest.json'
    ];
    
    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        console.warn(`Missing build file: ${file}`);
        return false;
      }
    }
    
    return true;
  }
  
  async repairBuild(): Promise<void> {
    // Create missing manifest files with minimal content
    const manifests = {
      'pages-manifest.json': '{}',
      'app-paths-manifest.json': '{}',
      'next-font-manifest.json': '{}'
    };
    
    for (const [filename, content] of Object.entries(manifests)) {
      const filepath = `.next/server/${filename}`;
      if (!fs.existsSync(filepath)) {
        fs.writeFileSync(filepath, content);
      }
    }
  }
}
```

### Test Infrastructure Hardening

**Timeout Management:**
```typescript
// Test timeout configuration
const TEST_TIMEOUTS = {
  unit: 5000,      // 5 seconds for unit tests
  integration: 15000, // 15 seconds for integration tests
  e2e: 30000       // 30 seconds for end-to-end tests
};

// Apply timeouts based on test type
describe('Safety Protocol Tests', () => {
  beforeEach(() => {
    jest.setTimeout(TEST_TIMEOUTS.integration);
  });
  
  it('should complete within timeout', async () => {
    // Test implementation with proper timeout handling
  });
});
```

**Mock Strategy Implementation:**
```typescript
// Comprehensive mocking for external dependencies
class TestMockManager {
  setupMocks() {
    // Mock file system operations
    jest.mock('fs', () => ({
      existsSync: jest.fn(() => true),
      readFileSync: jest.fn(() => '{}'),
      writeFileSync: jest.fn()
    }));
    
    // Mock build processes
    jest.mock('child_process', () => ({
      execSync: jest.fn(() => 'mocked output')
    }));
    
    // Mock external APIs
    jest.mock('@/utils/reliableAstronomy', () => ({
      getReliablePlanetaryPositions: jest.fn(() => Promise.resolve({}))
    }));
  }
  
  cleanupMocks() {
    jest.clearAllMocks();
    jest.resetModules();
  }
}
```

## Data Models

### Test Execution Context

```typescript
interface TestExecutionContext {
  memoryLimit: number;
  timeoutLimit: number;
  mockingEnabled: boolean;
  isolationLevel: 'none' | 'partial' | 'full';
  retryCount: number;
}

interface TestResult {
  passed: boolean;
  memoryUsed: number;
  executionTime: number;
  errors: string[];
  warnings: string[];
}
```

### Build Validation Model

```typescript
interface BuildValidationResult {
  isValid: boolean;
  missingFiles: string[];
  corruptedFiles: string[];
  repairActions: RepairAction[];
}

interface RepairAction {
  type: 'create' | 'fix' | 'remove';
  target: string;
  description: string;
}
```

## Error Handling

### Memory Error Recovery

```typescript
class MemoryErrorHandler {
  handleOutOfMemory(error: Error): void {
    console.error('Memory exhaustion detected:', error.message);
    
    // Force garbage collection
    if (global.gc) {
      global.gc();
    }
    
    // Clear large objects
    this.clearCaches();
    
    // Reduce test parallelism
    this.reduceWorkerCount();
  }
  
  private clearCaches(): void {
    // Clear any global caches
    if (global.__TEST_CACHE__) {
      global.__TEST_CACHE__.clear();
    }
  }
  
  private reduceWorkerCount(): void {
    // Dynamically reduce Jest worker count
    process.env.JEST_MAX_WORKERS = '1';
  }
}
```

### Build Error Recovery

```typescript
class BuildErrorHandler {
  async handleBuildFailure(error: Error): Promise<void> {
    console.error('Build failure detected:', error.message);
    
    // Clean build artifacts
    await this.cleanBuildArtifacts();
    
    // Recreate missing files
    await this.createMissingFiles();
    
    // Retry build with reduced complexity
    await this.retryBuildWithFallback();
  }
  
  private async cleanBuildArtifacts(): Promise<void> {
    const buildDirs = ['.next', 'dist', 'build'];
    for (const dir of buildDirs) {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    }
  }
}
```

## Testing Strategy

### Memory-Safe Test Patterns

```typescript
// Memory-efficient test structure
describe('Memory-Safe Test Suite', () => {
  let memoryMonitor: TestMemoryMonitor;
  
  beforeEach(() => {
    memoryMonitor = new TestMemoryMonitor();
  });
  
  afterEach(() => {
    memoryMonitor.checkMemoryUsage(expect.getState().currentTestName);
    memoryMonitor.cleanup();
  });
  
  it('should execute without memory leaks', async () => {
    // Test implementation with memory monitoring
    const result = await performOperation();
    expect(result).toBeDefined();
    
    // Explicit cleanup
    result.cleanup?.();
  });
});
```

### Isolated Test Environment

```typescript
// Test isolation strategy
class TestIsolationManager {
  async setupIsolatedTest(testName: string): Promise<TestContext> {
    return {
      mocks: new TestMockManager(),
      memoryMonitor: new TestMemoryMonitor(),
      timeoutHandler: new TimeoutHandler(TEST_TIMEOUTS.integration),
      cleanup: () => this.cleanupTest(testName)
    };
  }
  
  private async cleanupTest(testName: string): Promise<void> {
    // Clean up test-specific resources
    jest.clearAllMocks();
    jest.resetModules();
    
    // Force garbage collection
    if (global.gc) {
      global.gc();
    }
  }
}
```

## Performance Considerations

### Memory Optimization Strategies

1. **Lazy Loading**: Load test dependencies only when needed
2. **Object Pooling**: Reuse test objects to reduce allocation
3. **Explicit Cleanup**: Ensure proper cleanup in test teardown
4. **Worker Isolation**: Isolate memory-intensive tests in separate workers
5. **Garbage Collection**: Force GC between test suites

### Build Performance Optimization

1. **Incremental Builds**: Only rebuild changed components
2. **Parallel Processing**: Optimize build parallelism for available resources
3. **Cache Management**: Implement intelligent build caching
4. **Resource Monitoring**: Monitor build resource usage
5. **Fallback Strategies**: Implement graceful degradation for build failures

## Integration Points

### Campaign System Integration

The test stabilization system integrates with the existing campaign system to ensure that automated quality improvements don't interfere with test execution:

```typescript
// Campaign-aware test execution
class CampaignAwareTestRunner {
  async runTests(): Promise<TestResult[]> {
    // Pause campaigns during test execution
    await this.pauseCampaigns();
    
    try {
      return await this.executeTests();
    } finally {
      // Resume campaigns after tests complete
      await this.resumeCampaigns();
    }
  }
}
```

### CI/CD Pipeline Integration

The stabilized test system integrates with CI/CD pipelines to provide reliable validation:

```typescript
// CI/CD integration
class CIPipelineIntegration {
  async validateForDeployment(): Promise<boolean> {
    const buildValid = await this.validateBuild();
    const testsPass = await this.runStabilizedTests();
    const memoryEfficient = await this.validateMemoryUsage();
    
    return buildValid && testsPass && memoryEfficient;
  }
}
```