#!/usr/bin/env node

/**
 * Debug and Diagnostic CLI Tools
 *
 * Comprehensive debugging and diagnostic utilities for the unintentional any elimination system
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  debugOutputDir: process.env.DEBUG_OUTPUT_DIR || './debug-output',
  logLevel: process.env.LOG_LEVEL || 'debug',
  maxSampleSize: parseInt(process.env.MAX_SAMPLE_SIZE) || 50,
  timeoutMs: parseInt(process.env.TIMEOUT_MS) || 30000
};

// Ensure debug output directory exists
if (!fs.existsSync(CONFIG.debugOutputDir)) {
  fs.mkdirSync(CONFIG.debugOutputDir, { recursive: true });
}

// Logging utility
function log(level, message, data = null) {
  const levels = { error: 0, warn: 1, info: 2, debug: 3 };
  const currentLevel = levels[CONFIG.logLevel] || 3;

  if (levels[level] <= currentLevel) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    console.log(logMessage);

    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }
}

// System diagnostics
function runSystemDiagnostics() {
  log('info', 'Running system diagnostics...');

  const diagnostics = {
    timestamp: new Date().toISOString(),
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      cwd: process.cwd(),
      memory: process.memoryUsage(),
      uptime: process.uptime()
    },
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      CI: process.env.CI,
      DEBUG: process.env.DEBUG
    },
    dependencies: {},
    fileSystem: {},
    buildStatus: {},
    errors: []
  };

  try {
    // Check package.json
    const packagePath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packagePath)) {
      const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      diagnostics.dependencies = {
        typescript: packageData.devDependencies?.typescript || 'not found',
        eslint: packageData.devDependencies?.eslint || 'not found',
        jest: packageData.devDependencies?.jest || 'not found'
      };
    }

    // Check file system
    const srcPath = path.join(process.cwd(), 'src');
    if (fs.existsSync(srcPath)) {
      const tsFiles = execSync('find src -name "*.ts" | wc -l', { encoding: 'utf8' }).trim();
      const tsxFiles = execSync('find src -name "*.tsx" | wc -l', { encoding: 'utf8' }).trim();

      diagnostics.fileSystem = {
        srcExists: true,
        tsFiles: parseInt(tsFiles),
        tsxFiles: parseInt(tsxFiles),
        totalFiles: parseInt(tsFiles) + parseInt(tsxFiles)
      };
    }

    // Check build status
    try {
      execSync('yarn tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
      diagnostics.buildStatus.typescript = 'passing';
    } catch (error) {
      diagnostics.buildStatus.typescript = 'failing';
      diagnostics.buildStatus.typescriptErrors = getTypeScriptErrorCount();
    }

    try {
      execSync('yarn lint --max-warnings=0', { stdio: 'pipe' });
      diagnostics.buildStatus.linting = 'passing';
    } catch (error) {
      diagnostics.buildStatus.linting = 'failing';
      diagnostics.buildStatus.lintingWarnings = getExplicitAnyCount();
    }

  } catch (error) {
    diagnostics.errors.push({
      type: 'system_diagnostics',
      message: error.message,
      stack: error.stack
    });
  }

  return diagnostics;
}

// Component diagnostics
function runComponentDiagnostics(componentName) {
  log('info', `Running diagnostics for component: ${componentName}`);

  const diagnostics = {
    timestamp: new Date().toISOString(),
    component: componentName,
    status: 'unknown',
    loadTest: null,
    apiTest: null,
    memoryTest: null,
    errors: []
  };

  try {
    // Test component loading
    const loadTest = testComponentLoading(componentName);
    diagnostics.loadTest = loadTest;

    if (loadTest.success) {
      // Test component API
      const apiTest = testComponentAPI(componentName);
      diagnostics.apiTest = apiTest;

      // Test memory usage
      const memoryTest = testComponentMemory(componentName);
      diagnostics.memoryTest = memoryTest;

      diagnostics.status = 'healthy';
    } else {
      diagnostics.status = 'failed';
    }

  } catch (error) {
    diagnostics.status = 'error';
    diagnostics.errors.push({
      type: 'component_diagnostics',
      message: error.message,
      stack: error.stack
    });
  }

  return diagnostics;
}

// Test component loading
function testComponentLoading(componentName) {
  const test = {
    component: componentName,
    success: false,
    loadTime: 0,
    error: null
  };

  const startTime = Date.now();

  try {
    const testScript = `
      const { ${componentName} } = require('./src/services/campaign/unintentional-any-elimination/');
      console.log(JSON.stringify({
        loaded: true,
        type: typeof ${componentName},
        hasConstructor: typeof ${componentName} === 'function'
      }));
    `;

    const result = execSync(`node -e "${testScript}"`, {
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: CONFIG.timeoutMs
    });

    const loadResult = JSON.parse(result.trim());
    test.success = loadResult.loaded;
    test.loadTime = Date.now() - startTime;
    test.details = loadResult;

  } catch (error) {
    test.success = false;
    test.loadTime = Date.now() - startTime;
    test.error = error.message;
  }

  return test;
}

// Test component API
function testComponentAPI(componentName) {
  const test = {
    component: componentName,
    methods: [],
    properties: [],
    success: false,
    error: null
  };

  try {
    const testScript = `
      const { ${componentName} } = require('./src/services/campaign/unintentional-any-elimination/');

      if (typeof ${componentName} === 'function') {
        const instance = new ${componentName}();
        const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(instance))
          .filter(name => name !== 'constructor' && typeof instance[name] === 'function');
        const properties = Object.getOwnPropertyNames(instance)
          .filter(name => typeof instance[name] !== 'function');

        console.log(JSON.stringify({ methods, properties, hasInstance: true }));
      } else {
        const methods = Object.getOwnPropertyNames(${componentName})
          .filter(name => typeof ${componentName}[name] === 'function');
        const properties = Object.getOwnPropertyNames(${componentName})
          .filter(name => typeof ${componentName}[name] !== 'function');

        console.log(JSON.stringify({ methods, properties, hasInstance: false }));
      }
    `;

    const result = execSync(`node -e "${testScript}"`, {
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: CONFIG.timeoutMs
    });

    const apiResult = JSON.parse(result.trim());
    test.methods = apiResult.methods;
    test.properties = apiResult.properties;
    test.success = true;
    test.hasInstance = apiResult.hasInstance;

  } catch (error) {
    test.success = false;
    test.error = error.message;
  }

  return test;
}

// Test component memory usage
function testComponentMemory(componentName) {
  const test = {
    component: componentName,
    beforeMemory: null,
    afterMemory: null,
    memoryDelta: null,
    success: false,
    error: null
  };

  try {
    const testScript = `
      const beforeMemory = process.memoryUsage();

      const { ${componentName} } = require('./src/services/campaign/unintentional-any-elimination/');

      let instances = [];
      for (let i = 0; i < 10; i++) {
        if (typeof ${componentName} === 'function') {
          instances.push(new ${componentName}());
        }
      }

      const afterMemory = process.memoryUsage();

      console.log(JSON.stringify({
        beforeMemory,
        afterMemory,
        memoryDelta: {
          rss: afterMemory.rss - beforeMemory.rss,
          heapUsed: afterMemory.heapUsed - beforeMemory.heapUsed,
          heapTotal: afterMemory.heapTotal - beforeMemory.heapTotal,
          external: afterMemory.external - beforeMemory.external
        }
      }));
    `;

    const result = execSync(`node -e "${testScript}"`, {
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: CONFIG.timeoutMs
    });

    const memoryResult = JSON.parse(result.trim());
    test.beforeMemory = memoryResult.beforeMemory;
    test.afterMemory = memoryResult.afterMemory;
    test.memoryDelta = memoryResult.memoryDelta;
    test.success = true;

  } catch (error) {
    test.success = false;
    test.error = error.message;
  }

  return test;
}

// Sample data analysis
function analyzeSampleData(filePattern = 'src/**/*.ts', sampleSize = CONFIG.maxSampleSize) {
  log('info', `Analyzing sample data from ${filePattern}...`);

  const analysis = {
    timestamp: new Date().toISOString(),
    filePattern,
    sampleSize,
    files: [],
    patterns: {},
    statistics: {},
    errors: []
  };

  try {
    // Get sample files
    const findCommand = `find src -name "*.ts" -not -path "*/node_modules/*" | head -${sampleSize}`;
    const fileList = execSync(findCommand, { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(line => line.trim());

    analysis.files = fileList;

    // Analyze each file
    const patterns = {
      explicitAny: 0,
      implicitAny: 0,
      anyArray: 0,
      anyRecord: 0,
      anyFunction: 0,
      anyReturn: 0,
      anyParameter: 0,
      documentedAny: 0
    };

    fileList.forEach(filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');

        // Count patterns
        patterns.explicitAny += (content.match(/:\s*any\b/g) || []).length;
        patterns.anyArray += (content.match(/:\s*any\[\]/g) || []).length;
        patterns.anyRecord += (content.match(/Record<[^,>]+,\s*any>/g) || []).length;
        patterns.anyFunction += (content.match(/\([^)]*:\s*any[^)]*\)\s*=>/g) || []).length;
        patterns.anyReturn += (content.match(/\):\s*any\s*[{;]/g) || []).length;
        patterns.anyParameter += (content.match(/\([^)]*:\s*any[^)]*\)/g) || []).length;

        // Check for documented any types
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line.includes(': any') && index > 0) {
            const prevLine = lines[index - 1];
            if (prevLine.includes('//') || prevLine.includes('/*')) {
              patterns.documentedAny++;
            }
          }
        });

      } catch (error) {
        analysis.errors.push({
          file: filePath,
          error: error.message
        });
      }
    });

    analysis.patterns = patterns;

    // Calculate statistics
    analysis.statistics = {
      totalFiles: fileList.length,
      totalAnyTypes: patterns.explicitAny,
      averageAnyPerFile: fileList.length > 0 ? (patterns.explicitAny / fileList.length).toFixed(2) : 0,
      documentationRate: patterns.explicitAny > 0 ? ((patterns.documentedAny / patterns.explicitAny) * 100).toFixed(1) : 0,
      patternDistribution: {
        arrays: patterns.anyArray,
        records: patterns.anyRecord,
        functions: patterns.anyFunction,
        returns: patterns.anyReturn,
        parameters: patterns.anyParameter
      }
    };

  } catch (error) {
    analysis.errors.push({
      type: 'sample_analysis',
      message: error.message,
      stack: error.stack
    });
  }

  return analysis;
}

// Performance benchmarks
function runPerformanceBenchmarks() {
  log('info', 'Running performance benchmarks...');

  const benchmarks = {
    timestamp: new Date().toISOString(),
    tests: [],
    summary: {},
    errors: []
  };

  const tests = [
    {
      name: 'TypeScript Compilation',
      command: 'yarn tsc --noEmit --skipLibCheck',
      timeout: 60000
    },
    {
      name: 'ESLint Analysis',
      command: 'yarn lint --format=unix',
      timeout: 30000
    },
    {
      name: 'File System Scan',
      command: 'find src -name "*.ts" | wc -l',
      timeout: 10000
    }
  ];

  tests.forEach(test => {
    const benchmark = {
      name: test.name,
      startTime: Date.now(),
      endTime: null,
      duration: null,
      success: false,
      output: null,
      error: null
    };

    try {
      const output = execSync(test.command, {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: test.timeout
      });

      benchmark.endTime = Date.now();
      benchmark.duration = benchmark.endTime - benchmark.startTime;
      benchmark.success = true;
      benchmark.output = output.trim();

    } catch (error) {
      benchmark.endTime = Date.now();
      benchmark.duration = benchmark.endTime - benchmark.startTime;
      benchmark.success = false;
      benchmark.error = error.message;
    }

    benchmarks.tests.push(benchmark);
  });

  // Calculate summary
  const successfulTests = benchmarks.tests.filter(t => t.success);
  benchmarks.summary = {
    totalTests: benchmarks.tests.length,
    successfulTests: successfulTests.length,
    failedTests: benchmarks.tests.length - successfulTests.length,
    averageDuration: successfulTests.length > 0
      ? (successfulTests.reduce((sum, t) => sum + t.duration, 0) / successfulTests.length).toFixed(0)
      : 0,
    totalDuration: benchmarks.tests.reduce((sum, t) => sum + (t.duration || 0), 0)
  };

  return benchmarks;
}

// Helper functions
function getTypeScriptErrorCount() {
  try {
    const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS"', {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    return parseInt(output.trim()) || 0;
  } catch (error) {
    return error.status === 1 ? 0 : -1;
  }
}

function getExplicitAnyCount() {
  try {
    const output = execSync('yarn lint --format=unix 2>/dev/null | grep -c "@typescript-eslint/no-explicit-any"', {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    return parseInt(output.trim()) || 0;
  } catch (error) {
    return error.status === 1 ? 0 : -1;
  }
}

// Save debug report
function saveDebugReport(reportData, filename) {
  const reportPath = path.join(CONFIG.debugOutputDir, filename);
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  log('info', `Debug report saved: ${reportPath}`);
  return reportPath;
}

// Command line interface
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  // Parse options
  const options = {};
  args.slice(1).forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      options[key] = value || true;
    }
  });

  switch (command) {
    case 'system':
      const systemDiagnostics = runSystemDiagnostics();
      const systemReportPath = saveDebugReport(systemDiagnostics, 'system-diagnostics.json');

      console.log('=== SYSTEM DIAGNOSTICS ===');
      console.log(`Node Version: ${systemDiagnostics.system.nodeVersion}`);
      console.log(`Platform: ${systemDiagnostics.system.platform}`);
      console.log(`TypeScript Files: ${systemDiagnostics.fileSystem.totalFiles || 'unknown'}`);
      console.log(`Build Status: ${systemDiagnostics.buildStatus.typescript || 'unknown'}`);
      console.log(`Linting Status: ${systemDiagnostics.buildStatus.linting || 'unknown'}`);
      console.log(`Full Report: ${systemReportPath}`);
      break;

    case 'component':
      const componentName = options.name || args[1];
      if (!componentName) {
        console.error('Component name required. Use --name=<ComponentName> or provide as argument');
        process.exit(1);
      }

      const componentDiagnostics = runComponentDiagnostics(componentName);
      const componentReportPath = saveDebugReport(componentDiagnostics, `component-${componentName}-diagnostics.json`);

      console.log(`=== COMPONENT DIAGNOSTICS: ${componentName} ===`);
      console.log(`Status: ${componentDiagnostics.status}`);
      console.log(`Load Test: ${componentDiagnostics.loadTest?.success ? 'PASS' : 'FAIL'}`);
      console.log(`API Test: ${componentDiagnostics.apiTest?.success ? 'PASS' : 'FAIL'}`);
      console.log(`Memory Test: ${componentDiagnostics.memoryTest?.success ? 'PASS' : 'FAIL'}`);
      if (componentDiagnostics.apiTest?.methods) {
        console.log(`Methods: ${componentDiagnostics.apiTest.methods.join(', ')}`);
      }
      console.log(`Full Report: ${componentReportPath}`);
      break;

    case 'sample':
      const filePattern = options.files || 'src/**/*.ts';
      const sampleSize = parseInt(options.size) || CONFIG.maxSampleSize;

      const sampleAnalysis = analyzeSampleData(filePattern, sampleSize);
      const sampleReportPath = saveDebugReport(sampleAnalysis, 'sample-analysis.json');

      console.log('=== SAMPLE DATA ANALYSIS ===');
      console.log(`Files Analyzed: ${sampleAnalysis.statistics.totalFiles}`);
      console.log(`Total Any Types: ${sampleAnalysis.statistics.totalAnyTypes}`);
      console.log(`Average Per File: ${sampleAnalysis.statistics.averageAnyPerFile}`);
      console.log(`Documentation Rate: ${sampleAnalysis.statistics.documentationRate}%`);
      console.log(`Array Types: ${sampleAnalysis.patterns.anyArray}`);
      console.log(`Record Types: ${sampleAnalysis.patterns.anyRecord}`);
      console.log(`Function Types: ${sampleAnalysis.patterns.anyFunction}`);
      console.log(`Full Report: ${sampleReportPath}`);
      break;

    case 'performance':
      const performanceBenchmarks = runPerformanceBenchmarks();
      const performanceReportPath = saveDebugReport(performanceBenchmarks, 'performance-benchmarks.json');

      console.log('=== PERFORMANCE BENCHMARKS ===');
      console.log(`Total Tests: ${performanceBenchmarks.summary.totalTests}`);
      console.log(`Successful: ${performanceBenchmarks.summary.successfulTests}`);
      console.log(`Failed: ${performanceBenchmarks.summary.failedTests}`);
      console.log(`Average Duration: ${performanceBenchmarks.summary.averageDuration}ms`);
      console.log(`Total Duration: ${performanceBenchmarks.summary.totalDuration}ms`);

      performanceBenchmarks.tests.forEach(test => {
        const status = test.success ? '✅' : '❌';
        console.log(`  ${status} ${test.name}: ${test.duration}ms`);
      });

      console.log(`Full Report: ${performanceReportPath}`);
      break;

    case 'all':
      console.log('Running comprehensive diagnostics...\n');

      const allDiagnostics = {
        timestamp: new Date().toISOString(),
        system: runSystemDiagnostics(),
        sample: analyzeSampleData(),
        performance: runPerformanceBenchmarks()
      };

      const allReportPath = saveDebugReport(allDiagnostics, 'comprehensive-diagnostics.json');

      console.log('=== COMPREHENSIVE DIAGNOSTICS COMPLETE ===');
      console.log(`Full Report: ${allReportPath}`);
      break;

    default:
      console.log(`
Debug and Diagnostic CLI Tools

USAGE:
  node debug-tools.cjs <command> [options]

COMMANDS:
  system
    Run system diagnostics (Node.js, dependencies, build status)

  component --name=<ComponentName>
    Run diagnostics for a specific component

  sample [--files=<pattern>] [--size=<n>]
    Analyze sample data from source files

  performance
    Run performance benchmarks

  all
    Run comprehensive diagnostics (all of the above)

OPTIONS:
  --name=<ComponentName>  Component to diagnose
  --files=<pattern>       File pattern for sample analysis (default: src/**/*.ts)
  --size=<n>              Sample size for analysis (default: ${CONFIG.maxSampleSize})
  --verbose               Enable verbose output

EXAMPLES:
  # Run system diagnostics
  node debug-tools.cjs system

  # Diagnose AnyTypeClassifier component
  node debug-tools.cjs component --name=AnyTypeClassifier

  # Analyze 100 sample files
  node debug-tools.cjs sample --size=100

  # Run performance benchmarks
  node debug-tools.cjs performance

  # Run all diagnostics
  node debug-tools.cjs all

OUTPUT:
  All reports are saved to: ${CONFIG.debugOutputDir}/
      `);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  runSystemDiagnostics,
  runComponentDiagnostics,
  analyzeSampleData,
  runPerformanceBenchmarks,
  saveDebugReport
};
