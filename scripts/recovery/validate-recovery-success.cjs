#!/usr/bin/env node

/**
 * Recovery Success Validation Script
 * Purpose: Comprehensive validation of recovery completion
 * Success Rate: 100% (validation only)
 * Last Updated: 2025-01-09
 *
 * Usage: node scripts/recovery/validate-recovery-success.cjs [options]
 *
 * Options:
 *   --strict     Use strict validation criteria
 *   --report     Generate detailed validation report
 *   --json       Output results in JSON format
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  strict: process.argv.includes('--strict'),
  report: process.argv.includes('--report'),
  json: process.argv.includes('--json'),

  // Success criteria thresholds
  thresholds: {
    typescript: {
      errors: 0,           // Zero tolerance for TS errors
      maxWarnings: 0       // Zero tolerance for TS warnings
    },
    eslint: {
      errors: 0,           // Zero tolerance for ESLint errors
      maxWarnings: process.argv.includes('--strict') ? 0 : 100  // Configurable warning threshold
    },
    build: {
      maxTimeSeconds: 60,  // Maximum acceptable build time
      maxMemoryMB: 4096    // Maximum acceptable memory usage
    },
    performance: {
      maxLintTimeSeconds: 30,  // Maximum acceptable lint time
      maxDevStartSeconds: 15   // Maximum acceptable dev server start time
    }
  }
};

// Validation results
const results = {
  timestamp: new Date().toISOString(),
  overall: 'UNKNOWN',
  validations: {},
  metrics: {},
  recommendations: []
};

// Utility functions
function runCommand(command, options = {}) {
  try {
    const output = execSync(command, {
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
      timeout: options.timeout || 60000,
      ...options
    });
    return { success: true, output: output.trim() };
  } catch (error) {
    return {
      success: false,
      output: error.stdout || error.message,
      error: error.message
    };
  }
}

function log(message, level = 'info') {
  if (CONFIG.json) return; // Suppress logs in JSON mode

  const timestamp = new Date().toLocaleTimeString();
  const prefix = {
    info: '📋',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  }[level] || '📋';

  console.log(`${prefix} [${timestamp}] ${message}`);
}

// Validation functions
async function validateTypeScriptCompilation() {
  log('Validating TypeScript compilation...');

  const startTime = Date.now();
  const result = runCommand('yarn tsc --noEmit --skipLibCheck', { silent: true });
  const duration = Date.now() - startTime;

  let errorCount = 0;
  let warningCount = 0;

  if (!result.success) {
    const errors = result.output.match(/error TS\d+/g) || [];
    errorCount = errors.length;

    const warnings = result.output.match(/warning TS\d+/g) || [];
    warningCount = warnings.length;
  }

  const validation = {
    passed: errorCount === CONFIG.thresholds.typescript.errors &&
            warningCount <= CONFIG.thresholds.typescript.maxWarnings,
    errorCount,
    warningCount,
    duration,
    details: result.success ? 'Compilation successful' : 'Compilation failed'
  };

  results.validations.typescript = validation;
  results.metrics.typescriptCompilationTime = duration;

  if (validation.passed) {
    log(`TypeScript validation passed (${errorCount} errors, ${warningCount} warnings)`, 'success');
  } else {
    log(`TypeScript validation failed (${errorCount} errors, ${warningCount} warnings)`, 'error');
    results.recommendations.push('Run TypeScript error recovery scripts');
  }

  return validation.passed;
}

async function validateESLintAnalysis() {
  log('Validating ESLint analysis...');

  const startTime = Date.now();
  const result = runCommand('yarn lint:quick --format=json', { silent: true });
  const duration = Date.now() - startTime;

  let errorCount = 0;
  let warningCount = 0;
  let fileCount = 0;

  if (result.success) {
    try {
      const data = JSON.parse(result.output);
      errorCount = data.reduce((sum, file) => sum + file.errorCount, 0);
      warningCount = data.reduce((sum, file) => sum + file.warningCount, 0);
      fileCount = data.length;
    } catch (parseError) {
      log('Failed to parse ESLint output', 'warning');
    }
  }

  const validation = {
    passed: errorCount === CONFIG.thresholds.eslint.errors &&
            warningCount <= CONFIG.thresholds.eslint.maxWarnings,
    errorCount,
    warningCount,
    fileCount,
    duration,
    details: result.success ? 'ESLint analysis successful' : 'ESLint analysis failed'
  };

  results.validations.eslint = validation;
  results.metrics.eslintAnalysisTime = duration;

  if (validation.passed) {
    log(`ESLint validation passed (${errorCount} errors, ${warningCount} warnings)`, 'success');
  } else {
    log(`ESLint validation failed (${errorCount} errors, ${warningCount} warnings)`, 'error');
    if (errorCount > 0) {
      results.recommendations.push('Run ESLint error recovery scripts');
    }
    if (warningCount > CONFIG.thresholds.eslint.maxWarnings) {
      results.recommendations.push('Run ESLint warning reduction scripts');
    }
  }

  return validation.passed;
}

async function validateBuildProcess() {
  log('Validating build process...');

  const startTime = Date.now();
  const result = runCommand('yarn build', { silent: true });
  const duration = Date.now() - startTime;

  const validation = {
    passed: result.success && duration <= CONFIG.thresholds.build.maxTimeSeconds * 1000,
    success: result.success,
    duration,
    details: result.success ? 'Build successful' : 'Build failed'
  };

  // Extract build metrics if available
  if (result.output) {
    const sizeMatch = result.output.match(/(\d+(?:\.\d+)?)\s*kB/);
    if (sizeMatch) {
      validation.bundleSize = parseFloat(sizeMatch[1]);
    }
  }

  results.validations.build = validation;
  results.metrics.buildTime = duration;

  if (validation.passed) {
    log(`Build validation passed (${duration}ms)`, 'success');
  } else {
    log(`Build validation failed (${duration}ms, success: ${result.success})`, 'error');
    if (!result.success) {
      results.recommendations.push('Fix build errors before proceeding');
    }
    if (duration > CONFIG.thresholds.build.maxTimeSeconds * 1000) {
      results.recommendations.push('Optimize build performance');
    }
  }

  return validation.passed;
}

async function validateDevelopmentServer() {
  log('Validating development server startup...');

  const startTime = Date.now();

  // Start dev server with timeout
  const devProcess = runCommand('timeout 15s yarn dev', { silent: true });
  const duration = Date.now() - startTime;

  // Check if server started successfully
  const serverStarted = devProcess.output && (
    devProcess.output.includes('ready') ||
    devProcess.output.includes('started') ||
    devProcess.output.includes('Local:')
  );

  const validation = {
    passed: serverStarted && duration <= CONFIG.thresholds.performance.maxDevStartSeconds * 1000,
    serverStarted,
    duration,
    details: serverStarted ? 'Dev server started successfully' : 'Dev server failed to start'
  };

  results.validations.devServer = validation;
  results.metrics.devServerStartTime = duration;

  if (validation.passed) {
    log(`Dev server validation passed (${duration}ms)`, 'success');
  } else {
    log(`Dev server validation failed (started: ${serverStarted}, ${duration}ms)`, 'warning');
    if (!serverStarted) {
      results.recommendations.push('Investigate dev server startup issues');
    }
  }

  return validation.passed;
}

async function validateTestSuite() {
  log('Validating test suite...');

  // Check if tests are configured
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (!packageJson.scripts || !packageJson.scripts.test) {
    log('No test script configured, skipping test validation', 'warning');
    results.validations.tests = {
      passed: true,
      skipped: true,
      details: 'No test script configured'
    };
    return true;
  }

  const startTime = Date.now();
  const result = runCommand('yarn test --run', { silent: true, timeout: 120000 });
  const duration = Date.now() - startTime;

  const validation = {
    passed: result.success,
    success: result.success,
    duration,
    details: result.success ? 'All tests passed' : 'Some tests failed'
  };

  results.validations.tests = validation;
  results.metrics.testSuiteTime = duration;

  if (validation.passed) {
    log(`Test suite validation passed (${duration}ms)`, 'success');
  } else {
    log(`Test suite validation failed (${duration}ms)`, 'error');
    results.recommendations.push('Fix failing tests');
  }

  return validation.passed;
}

async function validateSystemResources() {
  log('Validating system resources...');

  const validation = {
    passed: true,
    diskSpace: null,
    memoryUsage: null,
    details: 'System resources checked'
  };

  // Check disk space
  try {
    const dfResult = runCommand('df .', { silent: true });
    if (dfResult.success) {
      const lines = dfResult.output.split('\n');
      const dataLine = lines[lines.length - 1];
      const usage = dataLine.match(/(\d+)%/);
      if (usage) {
        validation.diskSpace = parseInt(usage[1]);
        if (validation.diskSpace > 90) {
          validation.passed = false;
          results.recommendations.push('Free up disk space (currently ' + validation.diskSpace + '% used)');
        }
      }
    }
  } catch (error) {
    log('Could not check disk space', 'warning');
  }

  // Check memory usage (if available)
  try {
    const freeResult = runCommand('free', { silent: true });
    if (freeResult.success) {
      const lines = freeResult.output.split('\n');
      const memLine = lines.find(line => line.startsWith('Mem:'));
      if (memLine) {
        const parts = memLine.split(/\s+/);
        const total = parseInt(parts[1]);
        const used = parseInt(parts[2]);
        validation.memoryUsage = Math.round((used / total) * 100);

        if (validation.memoryUsage > 90) {
          validation.passed = false;
          results.recommendations.push('High memory usage detected (' + validation.memoryUsage + '%)');
        }
      }
    }
  } catch (error) {
    // Memory check not available on all systems
  }

  results.validations.systemResources = validation;

  if (validation.passed) {
    log('System resources validation passed', 'success');
  } else {
    log('System resources validation failed', 'warning');
  }

  return validation.passed;
}

// Main validation function
async function main() {
  try {
    log('Starting recovery success validation...');
    log(`Using ${CONFIG.strict ? 'strict' : 'standard'} validation criteria`);

    const validations = [
      await validateTypeScriptCompilation(),
      await validateESLintAnalysis(),
      await validateBuildProcess(),
      await validateDevelopmentServer(),
      await validateTestSuite(),
      await validateSystemResources()
    ];

    const passedCount = validations.filter(Boolean).length;
    const totalCount = validations.length;

    // Determine overall result
    if (passedCount === totalCount) {
      results.overall = 'SUCCESS';
      log('🎉 All validations passed! Recovery was successful.', 'success');
    } else if (passedCount >= totalCount * 0.8) {
      results.overall = 'PARTIAL_SUCCESS';
      log(`⚠️ Partial success: ${passedCount}/${totalCount} validations passed.`, 'warning');
    } else {
      results.overall = 'FAILURE';
      log(`❌ Recovery validation failed: ${passedCount}/${totalCount} validations passed.`, 'error');
    }

    // Generate report if requested
    if (CONFIG.report) {
      await generateReport();
    }

    // Output results
    if (CONFIG.json) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      displaySummary();
    }

    // Exit with appropriate code
    process.exit(results.overall === 'SUCCESS' ? 0 : 1);

  } catch (error) {
    log(`Validation failed with error: ${error.message}`, 'error');
    process.exit(1);
  }
}

function displaySummary() {
  console.log('\n=== Recovery Validation Summary ===');
  console.log(`Overall Result: ${results.overall}`);
  console.log(`Timestamp: ${results.timestamp}`);
  console.log('');

  console.log('Validation Results:');
  Object.entries(results.validations).forEach(([key, validation]) => {
    const status = validation.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`  ${key}: ${status} - ${validation.details}`);
  });

  if (results.recommendations.length > 0) {
    console.log('\nRecommendations:');
    results.recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });
  }

  console.log('\nPerformance Metrics:');
  Object.entries(results.metrics).forEach(([key, value]) => {
    if (typeof value === 'number') {
      const displayValue = key.includes('Time') ? `${value}ms` : value;
      console.log(`  ${key}: ${displayValue}`);
    }
  });
}

async function generateReport() {
  const reportPath = `recovery-validation-report-${Date.now()}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  log(`Detailed report saved to: ${reportPath}`, 'info');
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = { main, validateTypeScriptCompilation, validateESLintAnalysis, validateBuildProcess };
