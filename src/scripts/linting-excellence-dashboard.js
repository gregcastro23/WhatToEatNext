#!/usr/bin/env node

/**
 * Linting Excellence Dashboard CLI (JavaScript version)
 *
 * Command-line interface for the comprehensive linting validation
 * and monitoring dashboard with enhanced configuration support.
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';

class LintingExcellenceDashboardCLI {
  constructor() {
    this.ensureDirectoriesExist();
  }

  async run(args) {
    const options = this.parseArgs(args);

    try {
      switch (options.command) {
        case 'validate':
          await this.runValidation(options);
          break;
        case 'monitor':
          await this.runMonitoring(options);
          break;
        case 'health':
          await this.healthCheck(options);
          break;
        case 'help':
          this.showHelp();
          break;
        default:
          console.error(`Unknown command: ${options.command}`);
          this.showHelp();
          process.exit(1);
      }
    } catch (error) {
      console.error('❌ Dashboard CLI error:', error.message);
      process.exit(1);
    }
  }

  parseArgs(args) {
    const options = {
      command: args[0] || 'validate',
      verbose: false,
      format: 'text',
      watch: false,
    };

    for (let i = 1; i < args.length; i++) {
      const arg = args[i];

      switch (arg) {
        case '--verbose':
        case '-v':
          options.verbose = true;
          break;
        case '--format':
        case '-f':
          options.format = args[++i];
          break;
        case '--watch':
        case '-w':
          options.watch = true;
          break;
      }
    }

    return options;
  }

  async runValidation(options) {
    console.log('🔍 Running comprehensive linting validation...\n');

    const startTime = Date.now();
    const metrics = await this.collectMetrics();
    const alerts = this.evaluateAlerts(metrics);
    const recommendations = this.generateRecommendations(metrics, alerts);
    const duration = Date.now() - startTime;

    const result = {
      passed: alerts.filter(a => a.severity === 'error' || a.severity === 'critical').length === 0,
      metrics,
      alerts,
      recommendations,
    };

    // Generate dashboard report
    await this.generateDashboardReport(result, duration);

    if (options.format === 'json') {
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    // Text format output
    console.log('📊 LINTING EXCELLENCE DASHBOARD RESULTS');
    console.log('='.repeat(50));
    console.log(`Validation Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Quality Score: ${result.metrics.qualityScore}/100`);
    console.log(`Total Issues: ${result.metrics.totalIssues}`);
    console.log(`Duration: ${duration}ms`);
    console.log('');

    // Detailed metrics
    console.log('🔍 DETAILED METRICS');
    console.log('-'.repeat(30));
    console.log(
      `Parser Errors: ${result.metrics.parserErrors} ${result.metrics.parserErrors === 0 ? '✅' : '🚨'}`,
    );
    console.log(
      `Explicit Any Errors: ${result.metrics.explicitAnyErrors} ${result.metrics.explicitAnyErrors < 100 ? '✅' : '⚡'}`,
    );
    console.log(`Import Order Issues: ${result.metrics.importOrderIssues}`);
    console.log(`Unused Variables: ${result.metrics.unusedVariables}`);
    console.log(`React Hooks Issues: ${result.metrics.reactHooksIssues}`);
    console.log(`Console Statements: ${result.metrics.consoleStatements}`);
    console.log('');

    // Performance metrics
    console.log('⚡ PERFORMANCE METRICS');
    console.log('-'.repeat(30));
    console.log(`Linting Duration: ${result.metrics.performanceMetrics.lintingDuration}ms`);
    console.log(`Memory Usage: ${result.metrics.performanceMetrics.memoryUsage.toFixed(1)}MB`);
    console.log(`Files Processed: ${result.metrics.performanceMetrics.filesProcessed}`);
    console.log('');

    // Alerts
    if (result.alerts.length > 0) {
      console.log('🚨 ACTIVE ALERTS');
      console.log('-'.repeat(30));
      for (const alert of result.alerts) {
        const icon = this.getSeverityIcon(alert.severity);
        console.log(`${icon} ${alert.severity.toUpperCase()}: ${alert.message}`);
        console.log(`   Metric: ${alert.metric} (${alert.currentValue}/${alert.threshold})`);
      }
      console.log('');
    }

    // Recommendations
    if (result.recommendations.length > 0) {
      console.log('💡 RECOMMENDATIONS');
      console.log('-'.repeat(30));
      for (const recommendation of result.recommendations) {
        console.log(`• ${recommendation}`);
      }
      console.log('');
    }

    // Next actions
    console.log('🎯 NEXT ACTIONS');
    console.log('-'.repeat(30));
    if (result.metrics.parserErrors > 0) {
      console.log('1. 🚨 URGENT: Fix parser errors immediately');
      console.log('   Run: yarn tsc --noEmit');
    } else if (result.metrics.explicitAnyErrors > 100) {
      console.log('1. ⚡ HIGH PRIORITY: Reduce explicit any errors');
      console.log('   Run: yarn lint:fix');
    } else if (result.metrics.importOrderIssues > 50) {
      console.log('1. 🚀 READY: Deploy import organization');
      console.log('   Run: yarn lint:fix');
    } else {
      console.log('1. ✅ Continue systematic improvement');
      console.log('   Run: yarn lint:workflow-auto');
    }

    console.log(`\n✅ Validation completed in ${duration}ms`);
  }

  async collectMetrics() {
    const startTime = Date.now();

    try {
      // Run ESLint with enhanced configuration (faster approach)
      const lintOutput = execSync('yarn lint:fast --format json --max-warnings 10000', {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 30000, // 30 second timeout
      });

      const lintResults = JSON.parse(lintOutput);
      const metrics = this.parseLintResults(lintResults);

      // Add performance metrics
      metrics.performanceMetrics = {
        lintingDuration: Date.now() - startTime,
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
        filesProcessed: lintResults.length,
      };

      // Calculate quality score
      metrics.qualityScore = this.calculateQualityScore(metrics);

      return metrics;
    } catch (error) {
      console.error('Error collecting linting metrics:', error.message);

      // Return fallback metrics
      return {
        timestamp: new Date(),
        totalIssues: -1,
        errors: -1,
        warnings: -1,
        parserErrors: -1,
        explicitAnyErrors: -1,
        importOrderIssues: -1,
        unusedVariables: -1,
        reactHooksIssues: -1,
        consoleStatements: -1,
        performanceMetrics: {
          lintingDuration: Date.now() - startTime,
          memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
          filesProcessed: 0,
        },
        qualityScore: 0,
      };
    }
  }

  parseLintResults(lintResults) {
    let totalIssues = 0;
    let errors = 0;
    let warnings = 0;
    let parserErrors = 0;
    let explicitAnyErrors = 0;
    let importOrderIssues = 0;
    let unusedVariables = 0;
    let reactHooksIssues = 0;
    let consoleStatements = 0;

    for (const result of lintResults) {
      for (const message of result.messages) {
        totalIssues++;

        if (message.severity === 2) {
          errors++;
        } else {
          warnings++;
        }

        // Categorize by rule type
        const ruleId = message.ruleId;

        if (message.fatal || ruleId === 'parseForESLint') {
          parserErrors++;
        } else if (ruleId === '@typescript-eslint/no-explicit-any') {
          explicitAnyErrors++;
        } else if (ruleId === 'import/order') {
          importOrderIssues++;
        } else if (ruleId === '@typescript-eslint/no-unused-vars') {
          unusedVariables++;
        } else if (ruleId && ruleId.startsWith('react-hooks/')) {
          reactHooksIssues++;
        } else if (ruleId === 'no-console') {
          consoleStatements++;
        }
      }
    }

    return {
      timestamp: new Date(),
      totalIssues,
      errors,
      warnings,
      parserErrors,
      explicitAnyErrors,
      importOrderIssues,
      unusedVariables,
      reactHooksIssues,
      consoleStatements,
      performanceMetrics: {
        lintingDuration: 0, // Will be set by caller
        memoryUsage: 0,
        filesProcessed: lintResults.length,
      },
      qualityScore: 0, // Will be calculated
    };
  }

  calculateQualityScore(metrics) {
    if (metrics.totalIssues === -1) return 0; // Error state

    // Base score starts at 100
    let score = 100;

    // Deduct points for different issue types
    score -= Math.min(50, metrics.parserErrors * 10); // Parser errors are critical
    score -= Math.min(30, metrics.explicitAnyErrors * 0.1); // Explicit any errors
    score -= Math.min(20, metrics.errors * 0.5); // General errors
    score -= Math.min(15, metrics.warnings * 0.01); // Warnings (less impact)

    // Performance penalty
    if (metrics.performanceMetrics.lintingDuration > 30000) {
      score -= 10; // Performance penalty
    }

    // Bonus for zero critical issues
    if (metrics.parserErrors === 0 && metrics.explicitAnyErrors < 10) {
      score += 5;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  evaluateAlerts(metrics) {
    const alerts = [];

    const thresholds = [
      {
        metric: 'parserErrors',
        threshold: 0,
        severity: 'critical',
        message: 'Parser errors detected - blocking accurate linting analysis',
      },
      {
        metric: 'explicitAnyErrors',
        threshold: 100,
        severity: 'error',
        message: 'Explicit any errors exceed acceptable threshold',
      },
      {
        metric: 'totalIssues',
        threshold: 2000,
        severity: 'warning',
        message: 'Total linting issues exceed warning threshold',
      },
      {
        metric: 'qualityScore',
        threshold: 80,
        severity: 'warning',
        message: 'Code quality score below target',
      },
    ];

    for (const threshold of thresholds) {
      const currentValue = metrics[threshold.metric] || 0;

      const shouldTrigger =
        threshold.metric === 'qualityScore'
          ? currentValue < threshold.threshold
          : currentValue > threshold.threshold;

      if (shouldTrigger) {
        alerts.push({
          id: `${threshold.metric}-${Date.now()}`,
          timestamp: new Date(),
          severity: threshold.severity,
          metric: threshold.metric,
          currentValue,
          threshold: threshold.threshold,
          message: threshold.message,
          resolved: false,
        });
      }
    }

    return alerts;
  }

  generateRecommendations(metrics, alerts) {
    const recommendations = [];

    // Parser error recommendations
    if (metrics.parserErrors > 0) {
      recommendations.push(
        '🚨 URGENT: Fix parser errors immediately - they block accurate linting analysis',
        'Check src/utils/recommendationEngine.ts and other files with syntax errors',
        'Run `yarn tsc --noEmit` to identify TypeScript compilation issues',
      );
    }

    // Explicit any recommendations
    if (metrics.explicitAnyErrors > 100) {
      recommendations.push(
        '⚡ HIGH PRIORITY: Reduce explicit any types using systematic type inference',
        'Focus on React components, service layers, and utility functions first',
        'Use domain-specific exceptions for astrological calculations where needed',
      );
    }

    // Import organization recommendations
    if (metrics.importOrderIssues > 50) {
      recommendations.push(
        '🚀 READY: Deploy enhanced import organization with alphabetical sorting',
        'Run `yarn lint:fix` to automatically organize imports',
        'Use batch processing for systematic completion of remaining issues',
      );
    }

    // Performance recommendations
    if (metrics.performanceMetrics.lintingDuration > 30000) {
      recommendations.push(
        '⚡ PERFORMANCE: Linting duration exceeds 30 seconds',
        'Enable ESLint caching with `yarn lint:fast` for incremental changes',
        'Consider using `yarn lint:changed` for git-aware changed-files-only processing',
      );
    }

    // Quality score recommendations
    if (metrics.qualityScore < 80) {
      recommendations.push(
        '📊 QUALITY: Code quality score below target (80%)',
        'Focus on eliminating critical errors first, then warnings',
        'Use domain-specific linting commands for targeted improvements',
      );
    }

    return recommendations;
  }

  async generateDashboardReport(result, duration) {
    const reportPath = '.kiro/metrics/linting-dashboard-report.md';

    const report = `# Linting Excellence Dashboard Report

Generated: ${new Date().toISOString()}

## 📊 Overall Status

- **Validation Status**: ${result.passed ? '✅ PASSED' : '❌ FAILED'}
- **Quality Score**: ${result.metrics.qualityScore}/100
- **Total Issues**: ${result.metrics.totalIssues}
- **Validation Duration**: ${duration}ms

## 🔍 Detailed Metrics

### Error Breakdown
- **Parser Errors**: ${result.metrics.parserErrors} ${result.metrics.parserErrors === 0 ? '✅' : '🚨'}
- **TypeScript Errors**: ${result.metrics.errors}
- **Explicit Any Errors**: ${result.metrics.explicitAnyErrors} ${result.metrics.explicitAnyErrors < 100 ? '✅' : '⚡'}
- **Warnings**: ${result.metrics.warnings}

### Code Quality Issues
- **Import Order Issues**: ${result.metrics.importOrderIssues}
- **Unused Variables**: ${result.metrics.unusedVariables}
- **React Hooks Issues**: ${result.metrics.reactHooksIssues}
- **Console Statements**: ${result.metrics.consoleStatements}

### Performance Metrics
- **Linting Duration**: ${result.metrics.performanceMetrics.lintingDuration}ms
- **Memory Usage**: ${result.metrics.performanceMetrics.memoryUsage.toFixed(1)}MB
- **Files Processed**: ${result.metrics.performanceMetrics.filesProcessed}

## 🚨 Active Alerts

${
  result.alerts.length === 0
    ? 'No active alerts ✅'
    : result.alerts
        .map(
          alert =>
            `- **${alert.severity.toUpperCase()}**: ${alert.message} (${alert.currentValue} vs ${alert.threshold})`,
        )
        .join('\n')
}

## 💡 Recommendations

${result.recommendations.map(rec => `- ${rec}`).join('\n')}

## 🎯 Next Actions

### Immediate (Next 30 Minutes)
1. ${result.metrics.parserErrors > 0 ? '🚨 **URGENT**: Fix parser errors' : '✅ No parser errors'}
2. ${result.metrics.explicitAnyErrors > 100 ? '⚡ **Deploy Explicit Any Campaign**: Address error-level explicit any types' : '✅ Explicit any errors under control'}
3. ${result.metrics.importOrderIssues > 50 ? '🚀 **Execute Import Organization**: Apply alphabetical sorting and grouping' : '✅ Import organization acceptable'}

### Success Metrics Target
- **Target**: ${result.metrics.totalIssues} → <2,000 total issues
- **Critical Path**: Parser errors → Explicit any errors → Import organization
- **Quality Gate**: Zero parser errors, <100 explicit any errors, enhanced import organization

---

*Report generated by Linting Excellence Dashboard v1.0*
*Enhanced Configuration: React 19, TypeScript strict rules, domain-specific configurations*
`;

    try {
      writeFileSync(reportPath, report, 'utf8');
      console.log(`📊 Dashboard report generated: ${reportPath}`);
    } catch (error) {
      console.warn('Warning: Could not write dashboard report:', error.message);
    }
  }

  async healthCheck(options) {
    console.log('🏥 Linting System Health Check\n');

    const checks = [
      {
        name: 'ESLint Configuration',
        check: () => existsSync('eslint.config.cjs'),
        fix: 'Ensure eslint.config.cjs exists in project root',
      },
      {
        name: 'TypeScript Configuration',
        check: () => existsSync('tsconfig.json'),
        fix: 'Ensure tsconfig.json exists in project root',
      },
      {
        name: 'Package.json Scripts',
        check: () => {
          try {
            const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
            return pkg.scripts && pkg.scripts.lint;
          } catch {
            return false;
          }
        },
        fix: 'Ensure package.json has lint scripts',
      },
      {
        name: 'Metrics Directory',
        check: () => existsSync('.kiro/metrics'),
        fix: 'Directory will be created automatically',
      },
    ];

    console.log('Running health checks...\n');

    let allPassed = true;

    for (const check of checks) {
      try {
        const result = typeof check.check === 'function' ? check.check() : check.check;
        const status = result ? '✅ PASS' : '❌ FAIL';

        console.log(`${status} ${check.name}`);

        if (!result) {
          console.log(`   Fix: ${check.fix}`);
          allPassed = false;
        }
      } catch (error) {
        console.log(`❌ FAIL ${check.name} (Error: ${error.message})`);
        console.log(`   Fix: ${check.fix}`);
        allPassed = false;
      }
    }

    console.log(`\n🏥 Overall Health: ${allPassed ? '✅ HEALTHY' : '⚠️  NEEDS ATTENTION'}`);

    if (!allPassed) {
      console.log('\n💡 Run the suggested fixes above to resolve issues');
    }
  }

  ensureDirectoriesExist() {
    const dirs = ['.kiro/metrics'];
    for (const dir of dirs) {
      if (!existsSync(dir)) {
        try {
          execSync(`mkdir -p ${dir}`, { stdio: 'pipe' });
        } catch (error) {
          // Ignore mkdir errors
        }
      }
    }
  }

  showHelp() {
    console.log(`
🎯 Linting Excellence Dashboard CLI

USAGE:
  node src/scripts/linting-excellence-dashboard.js <command> [options]

COMMANDS:
  validate    Run comprehensive linting validation (default)
  monitor     Monitor linting metrics
  health      Run system health check
  help        Show this help message

OPTIONS:
  --verbose, -v     Verbose output
  --format, -f      Output format: text, json (default: text)
  --watch, -w       Watch mode for continuous monitoring

EXAMPLES:
  # Run comprehensive validation
  node src/scripts/linting-excellence-dashboard.js validate

  # Run health check
  node src/scripts/linting-excellence-dashboard.js health

  # Show metrics in JSON format
  node src/scripts/linting-excellence-dashboard.js validate --format json

INTEGRATION:
  # Add to package.json scripts:
  "lint:dashboard": "node src/scripts/linting-excellence-dashboard.js validate"
  "lint:health": "node src/scripts/linting-excellence-dashboard.js health"
`);
  }

  getSeverityIcon(severity) {
    switch (severity) {
      case 'critical':
        return '🚨';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📋';
    }
  }
}

// CLI Entry Point
const cli = new LintingExcellenceDashboardCLI();
const args = process.argv.slice(2);

cli.run(args).catch(error => {
  console.error('❌ CLI Error:', error.message);
  process.exit(1);
});

export { LintingExcellenceDashboardCLI };
