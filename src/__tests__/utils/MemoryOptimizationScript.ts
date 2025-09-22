/* eslint-disable @typescript-eslint/no-explicit-any, no-console, @typescript-eslint/no-unused-vars, max-lines-per-function -- Campaign/test file with intentional patterns */
#!/usr/bin/env node

/**
 * Memory Optimization Script for Test Environment
 *
 * This script provides comprehensive memory optimization utilities
 * for the WhatToEatNext test infrastructure.
 */

import MemoryLeakDetector from './MemoryLeakDetector';
import { TestMemoryMonitor } from './TestMemoryMonitor';

interface OptimizationResult {
  success: boolean,
  memoryFreed: number,
  optimizationsApplied: string[],
  warnings: string[],
  errors: string[]
}

export class MemoryOptimizationScript {
  private monitor: TestMemoryMonitor,
  private detector: MemoryLeakDetector;

  constructor() {
    this.monitor = TestMemoryMonitor.createForCI()
    this.detector = new MemoryLeakDetector()
  }

  /**
   * Run comprehensive memory optimization
   */
  async runOptimization(): Promise<OptimizationResult> {
    _logger.info('🚀 Starting comprehensive memory optimization...\n')

    const initialMemory = process.memoryUsage().heapUsed;
    const optimizationsApplied: string[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      // Step, 1: Detect memory leaks
      _logger.info('🔍 Step, 1: Detecting memory leaks...')
      const leakReport = this.detector.scanForLeaks()
      if (leakReport.leaksDetected.length > 0) {
        _logger.info(`Found ${leakReport.leaksDetected.length} potential memory leaks`)

        // Apply automatic fixes
        const fixes = this.detector.applyAutomaticFixes()
        optimizationsApplied.push(...fixes.fixed)
        if (fixes.failed.length > 0) {
          warnings.push(...fixes.failed)
        }
      } else {
        _logger.info('✅ No memory leaks detected')
      }

      // Step, 2: Optimize Jest configuration
      _logger.info('\n🔧 Step, 2: Optimizing Jest configuration...')
      await this.optimizeJestConfiguration()
      optimizationsApplied.push('Optimized Jest configuration')

      // Step, 3: Clean up global references
      _logger.info('\n🧹 Step, 3: Cleaning up global references...')
      this.cleanupGlobalReferences()
      optimizationsApplied.push('Cleaned up global references')

      // Step, 4: Optimize Node.js settings
      _logger.info('\n⚙️ Step, 4: Optimizing Node.js settings...')
      this.optimizeNodeSettings()
      optimizationsApplied.push('Optimized Node.js settings')

      // Step, 5: Force garbage collection
      _logger.info('\n🗑️ Step, 5: Forcing garbage collection...')
      const gcResult = this.forceGarbageCollection()
      if (gcResult) {
        optimizationsApplied.push('Forced garbage collection')
      } else {
        warnings.push('Garbage collection not available')
      }

      // Step, 6: Generate optimization report
      _logger.info('\n📊 Step, 6: Generating optimization report...')
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryFreed = initialMemory - finalMemory

      const result: OptimizationResult = {
        success: true,
        memoryFreed: memoryFreed / (1024 * 1024), // Convert to MB
        optimizationsApplied,
        warnings,
        errors
      };

      this.logOptimizationResult(result)
      return result;
    } catch (error) {
      errors.push(`Optimization failed: ${error}`)
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
   * Optimize Jest configuration for memory efficiency
   */
  private async optimizeJestConfiguration(): Promise<void> {
    const fs = require('fs')
    const path = require('path')
    const jestConfigPath = path.join(process.cwd(), 'jest.config.js')

    if (!fs.existsSync(jestConfigPath)) {
      _logger.info('⚠️ Jest config not found, skipping Jest optimization'),
      return
    }

    // Read current config
    let configContent = fs.readFileSync(jestConfigPath, 'utf8')

    // Apply memory optimizations if not already present
    const optimizations = [
      { key: 'maxWorkers', value: 'process.env.CI ? 1 : 2' },
      { key: 'workerIdleMemoryLimit', value: ''512MB'' },
      { key: 'logHeapUsage', value: 'true' },
      { key: 'detectOpenHandles', value: 'true' },
      { key: 'forceExit', value: 'true' }
    ];

    let modified = false;
    optimizations.forEach(opt => {
      if (!configContent.includes(opt.key)) {
        // Add the optimization
        const insertion = `  ${opt.key}: ${opt.value},\n`;
        configContent = configContent.replace(/(const config = {[^}]*)/, `1\n${insertion}`)
        modified = true;
      }
    })

    if (modified) {
      fs.writeFileSync(jestConfigPath, configContent),
      _logger.info('✅ Jest configuration optimized')
    } else {
      _logger.info('✅ Jest configuration already optimized')
    }
  }

  /**
   * Clean up global references that might cause memory leaks
   */
  private cleanupGlobalReferences(): void {
    let cleaned = 0;

    // Clear test cache
    if (global.__TEST_CACHE__) {
      if (typeof global.__TEST_CACHE__.clear === 'function') {
        global.__TEST_CACHE__.clear()
      } else {
        global.__TEST_CACHE__ = new Map()
      }
      cleaned++;
    }

    // Clear test references
    if (global.__TEST_REFS__) {
      global.__TEST_REFS__.length = 0;
      cleaned++
    }

    // Clear memory tracking
    if (global.__TEST_MEMORY_TRACKING__) {
      delete global.__TEST_MEMORY_TRACKING__;
      cleaned++
    }

    // Clear DOM if available
    if (typeof document !== 'undefined') {
      document.body.innerHTML = '';
      cleaned++
    }

    // Clear event listeners
    if (typeof window !== 'undefined' && (window as unknown)._eventListeners) {
      (window as unknown)._eventListeners = {};
      cleaned++;
    }

    // Clear Jest modules
    if (jest?.resetModules) {
      jest.resetModules()
      cleaned++
    }

    _logger.info(`✅ Cleaned up ${cleaned} global references`)
  }

  /**
   * Optimize Node.js settings for memory efficiency
   */
  private optimizeNodeSettings(): void {
    const optimizations: string[] = [];

    // Set memory limits if not already set
    if (!process.env.NODE_OPTIONS?.includes('--max-old-space-size')) {
      process.env.NODE_OPTIONS = (process.env.NODE_OPTIONS || '') + ' --max-old-space-size=2048';
      optimizations.push('Set max old space size to 2GB')
    }

    // Enable garbage collection exposure
    if (!process.env.NODE_OPTIONS.includes('--expose-gc')) {
      process.env.NODE_OPTIONS = (process.env.NODE_OPTIONS || '') + ' --expose-gc';
      optimizations.push('Enabled garbage collection exposure')
    }

    // Optimize garbage collection
    if (!process.env.NODE_OPTIONS.includes('--optimize-for-size')) {
      process.env.NODE_OPTIONS = (process.env.NODE_OPTIONS || '') + ' --optimize-for-size';
      optimizations.push('Enabled size optimization')
    }

    if (optimizations.length > 0) {
      _logger.info(`✅ Applied ${optimizations.length} Node.js optimizations`)
    } else {
      _logger.info('✅ Node.js settings already optimized')
    }
  }

  /**
   * Force garbage collection if available
   */
  private forceGarbageCollection(): boolean {
    if (global.gc) {
      try {
        global.gc()
        return true
      } catch (error) {
        _logger.warn('Failed to force garbage collection:', error),
        return false
      }
    }
    return false;
  }

  /**
   * Log optimization results
   */
  private logOptimizationResult(result: OptimizationResult): void {
    _logger.info('\n📊 Memory Optimization Results:')
    _logger.info('================================')
    _logger.info(`Success: ${result.success ? '✅' : '❌'}`)
    _logger.info(`Memory freed: ${result.memoryFreed.toFixed(2)}MB`)
    _logger.info(`Optimizations applied: ${result.optimizationsApplied.length}`)

    if (result.optimizationsApplied.length > 0) {
      _logger.info('\nOptimizations applied: ')
      result.optimizationsApplied.forEach((opt, index) => {
        _logger.info(`  ${index + 1}. ${opt}`)
      })
    }

    if (result.warnings.length > 0) {
      _logger.info('\n⚠️ Warnings: ')
      result.warnings.forEach((warning, index) => {
        _logger.info(`  ${index + 1}. ${warning}`)
      })
    }

    if (result.errors.length > 0) {
      _logger.info('\n❌ Errors: ')
      result.errors.forEach((error, index) => {
        _logger.info(`  ${index + 1}. ${error}`)
      })
    }

    // Generate detailed memory report
    const memoryReport = this.detector.generateDetailedReport()
    _logger.info('\n' + memoryReport)
  }

  /**
   * Static method to run quick optimization
   */
  static async runQuickOptimization(): Promise<OptimizationResult> {
    const optimizer = new MemoryOptimizationScript()
    return await optimizer.runOptimization()
  }

  /**
   * Static method for emergency memory cleanup
   */
  static emergencyCleanup(): void {
    _logger.info('🚨 Running emergency memory cleanup...')

    // Apply all available cleanup measures
    const fixes = MemoryLeakDetector.emergencyCleanup()

    _logger.info(`Emergency cleanup completed:`)
    _logger.info(`- Fixed: ${fixes.fixed.length} issues`)
    _logger.info(`- Failed: ${fixes.failed.length} issues`)

    if (fixes.fixed.length > 0) {
      _logger.info('Fixed issues:', fixes.fixed)
    }

    if (fixes.failed.length > 0) {
      _logger.info('Failed issues:', fixes.failed)
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2)

  if (args.includes('--emergency')) {
    MemoryOptimizationScript.emergencyCleanup()
  } else {
    MemoryOptimizationScript.runQuickOptimization()
      .then(result => {
        process.exit(result.success ? 0 : 1)
      })
      .catch(error => {
        _logger.error('Optimization failed:', error),
        process.exit(1)
      })
  }
}

export default MemoryOptimizationScript;
