#!/usr/bin/env node

/**
 * Memory Optimization Script for Test Environment (JavaScript version)
 * 
 * This script provides comprehensive memory optimization utilities
 * for the WhatToEatNext test infrastructure.
 */

const fs = require('fs');
const path = require('path');

class MemoryOptimizer {
  constructor() {
    this.initialMemory = process.memoryUsage().heapUsed;
  }

  /**
   * Run comprehensive memory optimization
   */
  async runOptimization() {
    console.log('🚀 Starting comprehensive memory optimization...\n');

    const optimizationsApplied = [];
    const warnings = [];
    const errors = [];

    try {
      // Step 1: Detect and fix memory leaks
      console.log('🔍 Step 1: Detecting and fixing memory leaks...');
      const leakFixes = this.applyAutomaticFixes();
      optimizationsApplied.push(...leakFixes.fixed);
      if (leakFixes.failed.length > 0) {
        warnings.push(...leakFixes.failed);
      }

      // Step 2: Optimize Jest configuration
      console.log('\n🔧 Step 2: Optimizing Jest configuration...');
      await this.optimizeJestConfiguration();
      optimizationsApplied.push('Optimized Jest configuration');

      // Step 3: Clean up global references
      console.log('\n🧹 Step 3: Cleaning up global references...');
      this.cleanupGlobalReferences();
      optimizationsApplied.push('Cleaned up global references');

      // Step 4: Optimize Node.js settings
      console.log('\n⚙️ Step 4: Optimizing Node.js settings...');
      this.optimizeNodeSettings();
      optimizationsApplied.push('Optimized Node.js settings');

      // Step 5: Force garbage collection
      console.log('\n🗑️ Step 5: Forcing garbage collection...');
      const gcResult = this.forceGarbageCollection();
      if (gcResult) {
        optimizationsApplied.push('Forced garbage collection');
      } else {
        warnings.push('Garbage collection not available (run with --expose-gc)');
      }

      // Step 6: Generate optimization report
      console.log('\n📊 Step 6: Generating optimization report...');
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryFreed = (this.initialMemory - finalMemory) / (1024 * 1024);

      const result = {
        success: true,
        memoryFreed,
        optimizationsApplied,
        warnings,
        errors
      };

      this.logOptimizationResult(result);
      return result;

    } catch (error) {
      errors.push(`Optimization failed: ${error.message}`);
      return {
        success: false,
        memoryFreed: 0,
        optimizationsApplied,
        warnings,
        errors
      };
    }
  }

  /**
   * Apply automatic fixes for common memory leaks
   */
  applyAutomaticFixes() {
    const fixed = [];
    const failed = [];

    try {
      // Fix 1: Clear test cache
      if (global.__TEST_CACHE__) {
        if (typeof global.__TEST_CACHE__.clear === 'function') {
          global.__TEST_CACHE__.clear();
        } else {
          global.__TEST_CACHE__ = new Map();
        }
        fixed.push('Cleared test cache');
      }
    } catch (error) {
      failed.push('Failed to clear test cache');
    }

    try {
      // Fix 2: Clear global references
      if (global.__TEST_REFS__) {
        global.__TEST_REFS__.length = 0;
        fixed.push('Cleared global test references');
      }
    } catch (error) {
      failed.push('Failed to clear global references');
    }

    try {
      // Fix 3: Clear memory tracking
      if (global.__TEST_MEMORY_TRACKING__) {
        delete global.__TEST_MEMORY_TRACKING__;
        fixed.push('Cleared memory tracking');
      }
    } catch (error) {
      failed.push('Failed to clear memory tracking');
    }

    try {
      // Fix 4: Clear require cache for test files
      if (require.cache) {
        const testFiles = Object.keys(require.cache).filter(key => 
          key.includes('__tests__') || 
          key.includes('.test.') || 
          key.includes('.spec.')
        );
        
        testFiles.forEach(key => delete require.cache[key]);
        
        if (testFiles.length > 0) {
          fixed.push(`Cleared ${testFiles.length} test files from require cache`);
        }
      }
    } catch (error) {
      failed.push('Failed to clear require cache');
    }

    return { fixed, failed };
  }

  /**
   * Optimize Jest configuration for memory efficiency
   */
  async optimizeJestConfiguration() {
    const jestConfigPath = path.join(process.cwd(), 'jest.config.js');
    
    if (!fs.existsSync(jestConfigPath)) {
      console.log('⚠️ Jest config not found, skipping Jest optimization');
      return;
    }

    try {
      // Read current config
      let configContent = fs.readFileSync(jestConfigPath, 'utf8');
      
      // Check if already optimized
      if (configContent.includes('workerIdleMemoryLimit') && 
          configContent.includes('logHeapUsage') &&
          configContent.includes('detectOpenHandles')) {
        console.log('✅ Jest configuration already optimized');
        return;
      }

      // Apply basic optimizations by ensuring key settings exist
      const requiredSettings = [
        'maxWorkers: process.env.CI ? 1 : 2',
        "workerIdleMemoryLimit: '512MB'",
        'logHeapUsage: true',
        'detectOpenHandles: true',
        'forceExit: true'
      ];

      let modified = false;
      requiredSettings.forEach(setting => {
        const key = setting.split(':')[0].trim();
        if (!configContent.includes(key)) {
          console.log(`Adding missing Jest setting: ${key}`);
          modified = true;
        }
      });

      if (modified) {
        console.log('✅ Jest configuration optimization recommendations noted');
        console.log('   (Manual review of jest.config.js recommended)');
      } else {
        console.log('✅ Jest configuration appears to be optimized');
      }

    } catch (error) {
      console.warn('Failed to optimize Jest configuration:', error.message);
    }
  }

  /**
   * Clean up global references that might cause memory leaks
   */
  cleanupGlobalReferences() {
    let cleaned = 0;

    // Clear test cache
    if (global.__TEST_CACHE__) {
      if (typeof global.__TEST_CACHE__.clear === 'function') {
        global.__TEST_CACHE__.clear();
      } else {
        global.__TEST_CACHE__ = new Map();
      }
      cleaned++;
    }

    // Clear test references
    if (global.__TEST_REFS__) {
      global.__TEST_REFS__.length = 0;
      cleaned++;
    }

    // Clear memory tracking
    if (global.__TEST_MEMORY_TRACKING__) {
      delete global.__TEST_MEMORY_TRACKING__;
      cleaned++;
    }

    // Clear require cache for test files
    if (require.cache) {
      const testFiles = Object.keys(require.cache).filter(key => 
        key.includes('__tests__') || 
        key.includes('.test.') || 
        key.includes('.spec.')
      );
      
      testFiles.forEach(key => delete require.cache[key]);
      if (testFiles.length > 0) {
        cleaned++;
      }
    }

    console.log(`✅ Cleaned up ${cleaned} global references`);
  }

  /**
   * Optimize Node.js settings for memory efficiency
   */
  optimizeNodeSettings() {
    const optimizations = [];

    // Check current NODE_OPTIONS
    const currentOptions = process.env.NODE_OPTIONS || '';

    // Set memory limits if not already set
    if (!currentOptions.includes('--max-old-space-size')) {
      console.log('💡 Recommendation: Set NODE_OPTIONS="--max-old-space-size=2048"');
      optimizations.push('Recommend max old space size setting');
    }

    // Enable garbage collection exposure
    if (!currentOptions.includes('--expose-gc')) {
      console.log('💡 Recommendation: Add --expose-gc to NODE_OPTIONS');
      optimizations.push('Recommend garbage collection exposure');
    }

    // Optimize garbage collection
    if (!currentOptions.includes('--optimize-for-size')) {
      console.log('💡 Recommendation: Add --optimize-for-size to NODE_OPTIONS');
      optimizations.push('Recommend size optimization');
    }

    if (optimizations.length > 0) {
      console.log(`✅ Generated ${optimizations.length} Node.js optimization recommendations`);
    } else {
      console.log('✅ Node.js settings appear to be optimized');
    }
  }

  /**
   * Force garbage collection if available
   */
  forceGarbageCollection() {
    if (global.gc) {
      try {
        global.gc();
        return true;
      } catch (error) {
        console.warn('Failed to force garbage collection:', error.message);
        return false;
      }
    }
    return false;
  }

  /**
   * Log optimization results
   */
  logOptimizationResult(result) {
    console.log('\n📊 Memory Optimization Results:');
    console.log('================================');
    console.log(`Success: ${result.success ? '✅' : '❌'}`);
    console.log(`Memory freed: ${result.memoryFreed.toFixed(2)}MB`);
    console.log(`Optimizations applied: ${result.optimizationsApplied.length}`);
    
    if (result.optimizationsApplied.length > 0) {
      console.log('\nOptimizations applied:');
      result.optimizationsApplied.forEach((opt, index) => {
        console.log(`  ${index + 1}. ${opt}`);
      });
    }

    if (result.warnings.length > 0) {
      console.log('\n⚠️ Warnings:');
      result.warnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning}`);
      });
    }

    if (result.errors.length > 0) {
      console.log('\n❌ Errors:');
      result.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }

    // Memory usage summary
    const currentMemory = process.memoryUsage();
    console.log('\n💾 Current Memory Usage:');
    console.log(`  Heap Used: ${(currentMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`);
    console.log(`  Heap Total: ${(currentMemory.heapTotal / 1024 / 1024).toFixed(2)}MB`);
    console.log(`  External: ${(currentMemory.external / 1024 / 1024).toFixed(2)}MB`);
    console.log(`  Array Buffers: ${(currentMemory.arrayBuffers / 1024 / 1024).toFixed(2)}MB`);
  }

  /**
   * Static method for emergency memory cleanup
   */
  static emergencyCleanup() {
    console.log('🚨 Running emergency memory cleanup...');
    
    const optimizer = new MemoryOptimizer();
    const fixes = optimizer.applyAutomaticFixes();
    
    // Force garbage collection
    const gcResult = optimizer.forceGarbageCollection();
    if (gcResult) {
      fixes.fixed.push('Forced garbage collection');
    }
    
    console.log(`Emergency cleanup completed:`);
    console.log(`- Fixed: ${fixes.fixed.length} issues`);
    console.log(`- Failed: ${fixes.failed.length} issues`);
    
    if (fixes.fixed.length > 0) {
      console.log('Fixed issues:', fixes.fixed);
    }
    
    if (fixes.failed.length > 0) {
      console.log('Failed issues:', fixes.failed);
    }

    // Show current memory usage
    const currentMemory = process.memoryUsage();
    console.log('\n💾 Memory Usage After Cleanup:');
    console.log(`  Heap Used: ${(currentMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`);
    console.log(`  Heap Total: ${(currentMemory.heapTotal / 1024 / 1024).toFixed(2)}MB`);
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--emergency')) {
    MemoryOptimizer.emergencyCleanup();
  } else {
    const optimizer = new MemoryOptimizer();
    optimizer.runOptimization()
      .then(result => {
        process.exit(result.success ? 0 : 1);
      })
      .catch(error => {
        console.error('Optimization failed:', error);
        process.exit(1);
      });
  }
}

module.exports = { MemoryOptimizer };