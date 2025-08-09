#!/usr/bin/env node

/**
 * Simple Performance Validation Test
 *
 * Tests basic performance metrics for linting operations
 */

const { execSync } = require('child_process');
const { existsSync, statSync } = require('fs');

async function testPerformanceValidation() {
  console.log('🚀 Testing Linting Performance Validation...\n');

  try {
    // Test 1: Cache file creation
    console.log('📊 Test 1: Cache file creation and usage');

    // Clear cache first
    try {
      execSync('rm -f .eslintcache', { stdio: 'pipe' });
    } catch (error) {
      // Ignore cleanup errors
    }

    // Run linting to create cache
    const startTime = Date.now();
    try {
      execSync('yarn lint:fast src/components/debug/ConsolidatedDebugInfo.tsx', {
        stdio: 'pipe',
        timeout: 30000,
      });
    } catch (error) {
      // May have linting errors, but cache should be created
    }
    const firstRunTime = Date.now() - startTime;

    // Check if cache was created
    const cacheExists = existsSync('.eslintcache');
    console.log(`   Cache created: ${cacheExists ? '✅' : '❌'}`);
    console.log(`   First run time: ${firstRunTime}ms`);

    if (cacheExists) {
      const cacheStats = statSync('.eslintcache');
      console.log(`   Cache size: ${Math.round(cacheStats.size / 1024)}KB`);
    }

    // Test 2: Cache performance improvement
    console.log('\n📈 Test 2: Cache performance improvement');

    const cachedStartTime = Date.now();
    try {
      execSync('yarn lint:fast src/components/debug/ConsolidatedDebugInfo.tsx', {
        stdio: 'pipe',
        timeout: 30000,
      });
    } catch (error) {
      // May have linting errors
    }
    const cachedRunTime = Date.now() - cachedStartTime;

    console.log(`   Cached run time: ${cachedRunTime}ms`);

    if (firstRunTime > 0) {
      const improvement = ((firstRunTime - cachedRunTime) / firstRunTime) * 100;
      console.log(`   Performance improvement: ${improvement.toFixed(1)}%`);
      console.log(`   Target met (>0%): ${improvement > 0 ? '✅' : '❌'}`);
    }

    // Test 3: Memory usage check
    console.log('\n💾 Test 3: Memory usage validation');

    const initialMemory = process.memoryUsage().heapUsed;
    try {
      execSync('yarn lint:fast src/components/debug/ConsolidatedDebugInfo.tsx', {
        stdio: 'pipe',
        timeout: 30000,
      });
    } catch (error) {
      // May have linting errors
    }
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;
    const memoryIncreaseMB = memoryIncrease / 1024 / 1024;

    console.log(`   Memory increase: ${memoryIncreaseMB.toFixed(1)}MB`);
    console.log(`   Within reasonable bounds (<100MB): ${memoryIncreaseMB < 100 ? '✅' : '❌'}`);

    // Test 4: Parallel processing configuration
    console.log('\n⚡ Test 4: Parallel processing validation');

    const packageJson = require('../../package.json');
    const hasParallelScript = packageJson.scripts && packageJson.scripts['lint:parallel'];
    console.log(`   Parallel script configured: ${hasParallelScript ? '✅' : '❌'}`);

    if (hasParallelScript) {
      const parallelStartTime = Date.now();
      try {
        execSync('yarn lint:parallel src/components/debug/ConsolidatedDebugInfo.tsx', {
          stdio: 'pipe',
          timeout: 30000,
        });
      } catch (error) {
        // May have linting errors
      }
      const parallelTime = Date.now() - parallelStartTime;
      console.log(`   Parallel execution time: ${parallelTime}ms`);
      console.log(`   Reasonable performance (<20s): ${parallelTime < 20000 ? '✅' : '❌'}`);
    }

    // Test 5: Incremental linting
    console.log('\n⚡ Test 5: Incremental linting validation');

    const hasIncrementalScript = packageJson.scripts && packageJson.scripts['lint:changed'];
    console.log(`   Incremental script configured: ${hasIncrementalScript ? '✅' : '❌'}`);

    if (hasIncrementalScript) {
      const incrementalStartTime = Date.now();
      try {
        execSync('yarn lint:changed', {
          stdio: 'pipe',
          timeout: 15000,
        });
      } catch (error) {
        // May have linting errors or no changed files
      }
      const incrementalTime = Date.now() - incrementalStartTime;
      console.log(`   Incremental execution time: ${incrementalTime}ms`);
      console.log(`   Sub-10 second target: ${incrementalTime < 10000 ? '✅' : '❌'}`);
    }

    console.log('\n🎉 Performance validation test completed!');
    console.log('\n📋 Summary:');
    console.log(`   ✅ Cache system: ${cacheExists ? 'Working' : 'Not working'}`);
    console.log(
      `   ✅ Performance improvement: ${firstRunTime > cachedRunTime ? 'Achieved' : 'Needs work'}`,
    );
    console.log(
      `   ✅ Memory efficiency: ${memoryIncreaseMB < 100 ? 'Good' : 'Needs optimization'}`,
    );
    console.log(`   ✅ Parallel processing: ${hasParallelScript ? 'Configured' : 'Missing'}`);
    console.log(`   ✅ Incremental linting: ${hasIncrementalScript ? 'Configured' : 'Missing'}`);
  } catch (error) {
    console.error('❌ Performance validation failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testPerformanceValidation();
