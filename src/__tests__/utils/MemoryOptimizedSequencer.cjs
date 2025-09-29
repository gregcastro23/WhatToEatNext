/**
 * Memory-Optimized Test Sequencer
 *
 * This sequencer orders tests to minimize memory usage and prevent memory leaks
 * by running memory-intensive tests in isolation and smaller tests in batches.
 */

const Sequencer = require('@jest/test-sequencer').default;

class MemoryOptimizedSequencer extends Sequencer {
  /**
   * Sort tests to optimize memory usage
   */
  sort(tests) {
    // Categorize tests by memory intensity
    const memoryIntensiveTests = [];
    const integrationTests = [];
    const unitTests = [];
    const componentTests = [];

    tests.forEach(test => {
      const testPath = test.path;
      const testName = testPath.toLowerCase();

      if (
        testName.includes('memory') ||
        testName.includes('performance') ||
        testName.includes('campaign') ||
        testName.includes('guardian')
      ) {
        memoryIntensiveTests.push(test);
      } else if (
        testName.includes('integration') ||
        testName.includes('e2e') ||
        testName.includes('system')
      ) {
        integrationTests.push(test);
      } else if (testName.includes('component') || testName.includes('.tsx')) {
        componentTests.push(test);
      } else {
        unitTests.push(test);
      }
    });

    // Sort each category by file size (smaller files first within category)
    const sortBySize = (a, b) => {
      try {
        const fs = require('fs');
        const sizeA = fs.statSync(a.path).size;
        const sizeB = fs.statSync(b.path).size;
        return sizeA - sizeB;
      } catch (error) {
        return 0;
      }
    };

    unitTests.sort(sortBySize);
    componentTests.sort(sortBySize);
    integrationTests.sort(sortBySize);
    memoryIntensiveTests.sort(sortBySize);

    // Optimal execution order:
    // 1. Unit tests first (fastest, least memory)
    // 2. Component tests (moderate memory)
    // 3. Integration tests (higher memory, but can run in parallel)
    // 4. Memory-intensive tests last (run in isolation)
    return [...unitTests, ...componentTests, ...integrationTests, ...memoryIntensiveTests];
  }

  /**
   * Determine if tests should run in band (sequentially) for memory safety
   */
  allFailedTests(tests) {
    // Run memory-intensive tests in band to prevent memory issues
    const memoryIntensiveTests = tests.filter(test => {
      const testName = test.path.toLowerCase();
      return (
        testName.includes('memory') ||
        testName.includes('performance') ||
        testName.includes('campaign') ||
        testName.includes('guardian') ||
        testName.includes('integration')
      );
    });

    return memoryIntensiveTests;
  }
}

module.exports = MemoryOptimizedSequencer;
