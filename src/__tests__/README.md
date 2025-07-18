# Memory Management System for Tests

This directory contains a comprehensive memory management system designed to prevent memory issues, detect leaks, and optimize test performance.

## Overview

The memory management system addresses critical test infrastructure issues including:
- Memory exhaustion (JavaScript heap out of memory)
- Test timeouts and worker crashes
- Memory leaks in long-running test suites
- Inefficient garbage collection

## Key Components

### 1. TestMemoryMonitor (`utils/TestMemoryMonitor.ts`)

A comprehensive memory monitoring class that provides:
- **Memory Snapshots**: Track memory usage at specific points
- **Leak Detection**: Identify potential memory leaks between snapshots
- **Threshold Monitoring**: Alert when memory usage exceeds limits
- **Garbage Collection**: Force GC when available
- **Cleanup Procedures**: Comprehensive memory cleanup

```typescript
import { TestMemoryMonitor } from '../utils/TestMemoryMonitor';

const monitor = new TestMemoryMonitor({
  warningThreshold: 100, // MB
  errorThreshold: 500,   // MB
  leakThreshold: 50      // MB
});

// Take snapshots
monitor.takeSnapshot('test-start');
// ... test operations ...
monitor.takeSnapshot('test-end');

// Check memory usage
const result = monitor.checkMemoryUsage('my-test');
if (!result.isWithinLimits) {
  console.warn('Memory issues detected:', result.errors);
}

// Cleanup
monitor.cleanup('test-cleanup');
```

### 2. Memory Test Helpers (`utils/memoryTestHelpers.ts`)

Utility functions for writing memory-efficient tests:

```typescript
import { 
  itWithMemoryCleanup, 
  itMemoryIntensive,
  withMemoryTracking,
  TEST_TIMEOUTS 
} from '../utils/memoryTestHelpers';

// Memory-safe test with automatic cleanup
itWithMemoryCleanup('should handle data processing', async () => {
  // Test implementation
  const data = processLargeDataset();
  expect(data).toBeDefined();
  // Cleanup happens automatically
});

// Memory-intensive test with strict monitoring
itMemoryIntensive('should process large files', async () => {
  const largeFile = await loadLargeFile();
  const result = await processFile(largeFile);
  expect(result).toBeDefined();
}, TEST_TIMEOUTS.memory);

// Track memory usage for async operations
const result = await withMemoryTracking(
  () => performExpensiveOperation(),
  'expensive-operation'
);
```

### 3. Global Memory Utilities

Available in all tests via `global.testUtils`:

```typescript
// Check current memory usage
const memoryUsage = global.testUtils.checkMemory();
console.log('Current memory:', memoryUsage.heapUsed);

// Force memory cleanup
global.testUtils.cleanupMemory();

// Force garbage collection (if available)
if (global.forceGC) {
  global.forceGC();
}
```

## Jest Configuration

The system includes optimized Jest configuration:

```javascript
// jest.config.js
{
  testTimeout: 15000,           // Reduced from 30s to 15s
  maxWorkers: 2,                // Max 2 workers for memory safety
  workerIdleMemoryLimit: '1GB', // 1GB limit per worker
  clearMocks: true,             // Clear mocks between tests
  restoreMocks: true,           // Restore mocks between tests
  resetModules: true,           // Reset modules between tests
  detectOpenHandles: true,      // Detect memory leaks
  forceExit: true              // Force exit to prevent hanging
}
```

## Memory-Safe Test Scripts

Use these npm scripts for memory-optimized testing:

```bash
# Standard test with memory management
yarn test

# Memory-safe test with garbage collection
yarn test:memory

# Watch mode with memory management
yarn test:watch
```

## Best Practices

### 1. Use Memory-Safe Test Patterns

```typescript
// ✅ Good: Use memory-safe wrappers
itWithMemoryCleanup('test name', async () => {
  // Test implementation
});

// ✅ Good: Manual cleanup in afterEach
afterEach(() => {
  global.testUtils.cleanupMemory();
});

// ❌ Avoid: Large objects without cleanup
it('test name', () => {
  const largeArray = new Array(1000000).fill('data');
  // No cleanup - potential memory leak
});
```

### 2. Monitor Memory Usage

```typescript
// ✅ Good: Monitor memory-intensive tests
itMemoryIntensive('process large dataset', async () => {
  const monitor = new TestMemoryMonitor();
  monitor.takeSnapshot('start');
  
  const result = await processLargeDataset();
  
  const memoryCheck = monitor.checkMemoryUsage('end');
  if (!memoryCheck.isWithinLimits) {
    console.warn('High memory usage detected');
  }
  
  monitor.cleanup('test-cleanup');
});
```

### 3. Use Appropriate Timeouts

```typescript
// ✅ Good: Use predefined timeout constants
import { TEST_TIMEOUTS } from '../utils/memoryTestHelpers';

it('unit test', () => {
  // Fast test
}, TEST_TIMEOUTS.unit); // 5s

it('integration test', async () => {
  // Integration test
}, TEST_TIMEOUTS.integration); // 15s (reduced from 30s)

it('memory-intensive test', async () => {
  // Memory-intensive operation
}, TEST_TIMEOUTS.memory); // 20s
```

### 4. Handle Large Datasets Safely

```typescript
// ✅ Good: Use batch processing with cleanup
import { processBatchWithMemoryManagement } from '../utils/memoryTestHelpers';

const results = await processBatchWithMemoryManagement(
  largeDataset,
  (item) => processItem(item),
  10, // batch size
  true // cleanup between batches
);
```

## Troubleshooting

### Memory Exhaustion

If you encounter "JavaScript heap out of memory" errors:

1. **Use memory-safe test scripts**:
   ```bash
   yarn test:memory
   ```

2. **Reduce batch sizes** in data processing tests

3. **Add explicit cleanup** in memory-intensive tests:
   ```typescript
   afterEach(() => {
     global.testUtils.cleanupMemory();
   });
   ```

### Test Timeouts

If tests are timing out:

1. **Check if using reduced timeouts** (15s for integration tests)
2. **Use appropriate timeout constants**:
   ```typescript
   it('test', async () => {
     // test implementation
   }, TEST_TIMEOUTS.integration);
   ```

3. **Optimize test performance** by reducing unnecessary operations

### Memory Leaks

If memory usage keeps increasing:

1. **Use TestMemoryMonitor** to identify leak sources:
   ```typescript
   const monitor = new TestMemoryMonitor();
   const leakAnalysis = monitor.detectMemoryLeaks();
   if (leakAnalysis.hasLeaks) {
     console.log('Leaks detected:', leakAnalysis.leakDetails);
   }
   ```

2. **Add cleanup procedures** for test resources
3. **Use memory-safe test wrappers** that handle cleanup automatically

### Worker Crashes

If Jest workers crash with SIGABRT:

1. **Verify Jest configuration** uses max 2 workers
2. **Use memory-safe test scripts** with proper Node.js options
3. **Add memory monitoring** to identify problematic tests

## Configuration Files

- `jest.config.js` - Jest configuration with memory optimizations
- `src/__tests__/setupTests.tsx` - Global test setup with memory utilities
- `src/__tests__/setupMemoryManagement.ts` - Memory management initialization
- `package.json` - Memory-safe test scripts

## Monitoring and Reporting

The system provides comprehensive monitoring:

- **Real-time memory tracking** during test execution
- **Memory usage reports** for test suites
- **Leak detection** with detailed analysis
- **Performance metrics** and cleanup effectiveness

Example memory report:
```
Memory Usage Report
==================
Initial Memory: 45.23MB
Current Memory: 67.89MB
Peak Memory: 89.45MB
Total Increase: 22.66MB
Test Duration: 12.34s
Snapshots Taken: 15

No significant memory leaks detected.
```

## Integration with Campaign System

The memory management system integrates with the existing campaign system to ensure that automated quality improvements don't interfere with test execution and memory management.

For more information, see the individual component documentation and test files.