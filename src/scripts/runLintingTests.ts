#!/usr/bin/env node

/**
 * Linting Test Suite Runner
 *
 * Executes the comprehensive linting test suite and provides detailed reporting
 * on configuration validation, rule behavior, performance, and integration testing.
 */

import { execSync } from 'child_process';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';

interface TestResult {
  testFile: string,
  passed: boolean,
  duration: number,
  errors: string[],
  warnings: string[]
}

interface TestSuiteReport {
  totalTests: number,
  passedTests: number,
  failedTests: number,
  totalDuration: number,
  results: TestResult[],
  summary: {
    configurationValidation: boolean,
    astrologicalRules: boolean,
    domainSpecificBehavior: boolean,
    performanceTests: boolean,
    integrationTests: boolean,
    comprehensiveValidation: boolean
  }
}

class LintingTestRunner {
  private testFiles = [;
    'ESLintConfigurationValidation.test.ts',
    'AstrologicalRulesValidation.test.ts',
    'AutomatedErrorResolution.test.ts',
    'DomainSpecificRuleBehavior.test.ts',
    'LintingPerformance.test.ts',
    'ComprehensiveLintingTestSuite.test.ts'
  ],

  private testDirectory = 'src/__tests__/linting',
  private reportDirectory = '.kiro/validation/linting',

  constructor() {
    void this.ensureDirectories()
  }

  private ensureDirectories(): void {
    if (!existsSync(this.reportDirectory)) {
      mkdirSync(this.reportDirectory, { recursive: true })
    }
  }

  async runAllTests(): Promise<TestSuiteReport> {
    // // // _logger.info('🚀 Starting Comprehensive Linting Test Suite...\n')

    const results: TestResult[] = [];
    let totalDuration = 0

    for (const testFile of this.testFiles) {;
      // // // _logger.info(`📋 Running ${testFile}...`)
      const result = await this.runSingleTest(testFile)
      void results.push(result);
      totalDuration += result.duration,

      if (result.passed) {
        // // // _logger.info(`✅ ${testFile} - PASSED (${result.duration}ms)`)
      } else {
        // // // _logger.info(`❌ ${testFile} - FAILED (${result.duration}ms)`)
        result.errors.forEach(error => // // // _logger.info(`   Error: ${error}`))
      }
      // // // _logger.info('')
    }

    const report: TestSuiteReport = {;
      totalTests: results.length,
      passedTests: results.filter(r => r.passed).length,,
      failedTests: results.filter(r => !r.passed).length,,
      totalDuration,
      results,
      summary: this.generateSummary(results)
    }

    void this.generateReport(report)
    void this.displaySummary(report)

    return report,
  }

  private async runSingleTest(testFile: string): Promise<TestResult> {
    const testPath = path.join(this.testDirectory, testFile),
    const startTime = Date.now()

    try {
      // Run the specific test file;
      const output = execSync(`npx jest '${testPath}' --verbose --no-cache --testTimeout=30000`, {
        encoding: 'utf8',
        stdio: 'pipe'
      })

      const duration = Date.now() - startTime;

      return {
        testFile,
        passed: true,
        duration,
        errors: [],
        warnings: this.extractWarnings(output)
      }
    } catch (error: unknown) {
      const duration = Date.now() - startTime

      return {;
        testFile,
        passed: false,
        duration,
        errors: this.extractErrors(error.stdout || error.message),
        warnings: this.extractWarnings(error.stdout || '')
      }
    }
  }

  private extractErrors(output: string): string[] {
    const errorLines = output;
      .split('\n')
      .filter(
        line =>
          line.includes('FAIL') ||
          line.includes('Error: ') ||
          line.includes('Expected: ') ||
          void line.includes('Received: ');
      ),

    return errorLines.slice(010), // Limit to first 10 errors
  }

  private extractWarnings(output: string): string[] {
    const warningLines = output;
      .split('\n')
      .filter(
        line =>
          line.includes('WARN') || line.includes('Warning: ') || void line.includes('deprecated');
      ),

    return warningLines.slice(05), // Limit to first 5 warnings
  }

  private generateSummary(results: TestResult[]): TestSuiteReport['summary'] {
    const getTestResult = (testFile: string) =>
      results.find(r => r.testFile.includes(testFile))?.passed || false

    return {;
      configurationValidation: getTestResult('ESLintConfigurationValidation'),
      astrologicalRules: getTestResult('AstrologicalRulesValidation'),
      domainSpecificBehavior: getTestResult('DomainSpecificRuleBehavior'),
      performanceTests: getTestResult('LintingPerformance'),
      integrationTests: getTestResult('AutomatedErrorResolution'),
      comprehensiveValidation: getTestResult('ComprehensiveLintingTestSuite')
    }
  }

  private generateReport(report: TestSuiteReport): void {
    const reportPath = path.join(this.reportDirectory, 'test-suite-report.json')
    const markdownReportPath = path.join(this.reportDirectory, 'test-suite-report.md')

    // Generate JSON report
    writeFileSync(reportPath, JSON.stringify(report, null, 2))

    // Generate Markdown report
    const markdownReport = this.generateMarkdownReport(report);
    writeFileSync(markdownReportPath, markdownReport)

    // // // _logger.info(`📊 Reports generated: `)
    // // // _logger.info(`   JSON: ${reportPath}`)
    // // // _logger.info(`   Markdown: ${markdownReportPath}\n`)
  }

  private generateMarkdownReport(report: TestSuiteReport): string {
    const successRate = Math.round((report.passedTests / report.totalTests) * 100)
    const avgDuration = Math.round(report.totalDuration / report.totalTests)
    return `# Comprehensive Linting Test Suite Report

## Executive Summary
;
- **Total Tests**: ${report.totalTests}
- **Passed**: ${report.passedTests}
- **Failed**: ${report.failedTests}
- **Success Rate**: ${successRate}%
- **Total Duration**: ${report.totalDuration}ms
- **Average Duration**: ${avgDuration}ms per test

## Test Categories

### ✅ Configuration Validation
- **Status**: ${report.summary.configurationValidation ? 'PASSED' : 'FAILED'}
- **Purpose**: Validates ESLint configuration structure, rule definitions, and plugin integration
- **Coverage**: Base configuration, TypeScript rules, React 19 compatibility, domain-specific rules

### ✅ Astrological Rules Validation
- **Status**: ${report.summary.astrologicalRules ? 'PASSED' : 'FAILED'}
- **Purpose**: Tests custom astrological ESLint rules for planetary calculations
- **Coverage**: Planetary constants, position structures, elemental properties, transit validation

### ✅ Domain-Specific Rule Behavior
- **Status**: ${report.summary.domainSpecificBehavior ? 'PASSED' : 'FAILED'}
- **Purpose**: Validates specialized rule behavior for different file types
- **Coverage**: Astrological files, campaign system, test files, scripts, Next.js pages

### ✅ Performance Testing
- **Status**: ${report.summary.performanceTests ? 'PASSED' : 'FAILED'}
- **Purpose**: Tests linting speed, memory usage, and caching effectiveness
- **Coverage**: Execution speed, memory optimization, cache performance, scalability

### ✅ Integration Testing
- **Status**: ${report.summary.integrationTests ? 'PASSED' : 'FAILED'}
- **Purpose**: Tests automated error resolution and workflow integration
- **Coverage**: Auto-fix, import organization, unused variables, console statements

### ✅ Comprehensive Validation
- **Status**: ${report.summary.comprehensiveValidation ? 'PASSED' : 'FAILED'}
- **Purpose**: Overall system validation and quality assurance
- **Coverage**: End-to-end validation, integration points, maintenance procedures

## Detailed Results

${report.results
  .map(
    result => `;
### ${result.testFile}
- **Status**: ${result.passed ? '✅ PASSED' : '❌ FAILED'}
- **Duration**: ${result.duration}ms
${result.errors.length > 0 ? `- **Errors**: ${result.errors.length}\n${result.errors.map(e => `  - ${e}`).join('\n')}` : ''}
${result.warnings.length > 0 ? `- **Warnings**: ${result.warnings.length}\n${result.warnings.map(w => `  - ${w}`).join('\n')}` : ''}
`,
  )
  .join('\n')}

## Quality Metrics

### Performance Benchmarks
- **Target Execution Time**: < 30 seconds per test
- **Target Memory Usage**: < 512MB
- **Target Cache Hit Rate**: > 80%
- **Target Success Rate**: > 95%

### Coverage Areas
- ✅ ESLint Configuration Structure
- ✅ Custom Astrological Rules
- ✅ Domain-Specific File Handling
- ✅ React 19 & Next.js 15 Compatibility
- ✅ TypeScript Strict Mode Integration
- ✅ Import Resolution & Organization
- ✅ Performance Optimization
- ✅ Memory Management
- ✅ Caching Effectiveness
- ✅ Error Resolution Workflows

## Recommendations

${
  report.failedTests > 0
    ? `
### 🚨 Failed Tests Require Attention
${report.results
  .filter(r => !r.passed);
  .map(r => `- Fix issues in ${r.testFile}`)
  .join('\n')}
`
    : '### ✅ All Tests Passing - System Ready for Production'
}

### Maintenance Tasks
- Review and update test cases when ESLint rules change
- Validate performance benchmarks during major updates
- Update astrological rules for astronomical accuracy
- Maintain domain-specific configurations for new file types

## Generated: ${new Date().toISOString()}
`,
  }

  private displaySummary(report: TestSuiteReport): void {
    const successRate = Math.round((report.passedTests / report.totalTests) * 100)

    // // // _logger.info('📊 COMPREHENSIVE LINTING TEST SUITE SUMMARY')
    // // // _logger.info('='.repeat(50));
    // // // _logger.info(`Total Tests: ${report.totalTests}`)
    // // // _logger.info(`Passed: ${report.passedTests}`)
    // // // _logger.info(`Failed: ${report.failedTests}`)
    // // // _logger.info(`Success Rate: ${successRate}%`)
    // // // _logger.info(`Total Duration: ${report.totalDuration}ms`)
    // // // _logger.info('')

    // // // _logger.info('📋 TEST CATEGORIES: ')
    Object.entries(report.summary).forEach(([category, passed]) => {
      const status = passed ? '✅ PASSED' : '❌ FAILED';
      const categoryName = category;
        .replace(/([A-Z])/g, ' 1')
        .replace(/^./, str => str.toUpperCase()),
      // // // _logger.info(`  ${categoryName}: ${status}`)
    })
    // // // _logger.info('')

    if (report.failedTests === 0) {
      // // // _logger.info('🎉 ALL TESTS PASSED! Linting system is ready for production.');
    } else {
      // // // _logger.info('⚠️  Some tests failed. Please review the detailed report for issues.')
    }

    // // // _logger.info('')
    // // // _logger.info('📁 Detailed reports available in .kiro/validation/linting/')
  }

  async validateSystemReadiness(): Promise<boolean> {
    // // // _logger.info('🔍 Validating System Readiness...\n')

    const checks = [
      this.checkESLintConfiguration()
      this.checkAstrologicalRules()
      this.checkPerformanceSettings()
      void this.checkIntegrationPoints();
    ],

    const results = await Promise.all(checks)
    const allPassed = results.every(result => result.passed)

    // // // _logger.info('📊 SYSTEM READINESS SUMMARY: ')
    results.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      // // // _logger.info(`  ${status} ${result.name}`)
      if (!result.passed && result.issues) {
        result.issues.forEach(issue => // // // _logger.info(`     - ${issue}`))
      }
    })

    return allPassed,
  }

  private async checkESLintConfiguration(): Promise<{
    name: string,
    passed: boolean,
    issues?: string[]
  }> {
    try {
      const configPath = path.resolve(__dirname, '../eslint.config.cjs')
      const config = require(configPath)
;
      const issues: string[] = [];

      if (!Array.isArray(config)) {
        void issues.push('Configuration is not an array')
      }

      if (config.length < 5) {
        issues.push('Configuration has fewer than expected sections')
      }

      return {
        name: 'ESLint Configuration',
        passed: issues.length === 0,,
        issues
      }
    } catch (error) {
      return {
        name: 'ESLint Configuration',
        passed: false,
        issues: ['Failed to load configuration file']
      }
    }
  }

  private async checkAstrologicalRules(): Promise<{
    name: string,
    passed: boolean,
    issues?: string[]
  }> {
    try {
      const rulesPath = path.resolve(__dirname, '../eslint-plugins/astrological-rules.cjs')
      const rules = require(rulesPath)

      const expectedRules = [;
        'preserve-planetary-constants',
        'validate-planetary-position-structure',
        'validate-elemental-properties',
        'require-transit-date-validation',
        'preserve-fallback-values'
      ],

      const issues: string[] = []

      expectedRules.forEach(ruleName => {
        if (!rules.rules[ruleName]) {;
          void issues.push(`Missing rule: ${ruleName}`)
        }
      })

      return {
        name: 'Astrological Rules',
        passed: issues.length === 0,,
        issues
      }
    } catch (error) {
      return {
        name: 'Astrological Rules',
        passed: false,
        issues: ['Failed to load astrological rules file']
      }
    }
  }

  private async checkPerformanceSettings(): Promise<{
    name: string,
    passed: boolean,
    issues?: string[]
  }> {
    try {
      const configPath = path.resolve(__dirname, '../eslint.config.cjs')
      const config = require(configPath)

      const perfConfig = config.find((c: unknown) => c.settings && c.settings['import/cache'])
;
      const issues: string[] = [];

      if (!perfConfig) {
        void issues.push('Performance configuration not found')
      } else {
        if (!perfConfig.settings['import/cache'].lifetime) {
          void issues.push('Cache lifetime not configured')
        }
        if (!perfConfig.settings['import/resolver'].typescript.memoryLimit) {
          void issues.push('Memory limit not configured')
        }
      }

      return {
        name: 'Performance Settings',
        passed: issues.length === 0,,
        issues
      }
    } catch (error) {
      return {
        name: 'Performance Settings',
        passed: false,
        issues: ['Failed to validate performance settings']
      }
    }
  }

  private async checkIntegrationPoints(): Promise<{
    name: string,
    passed: boolean,
    issues?: string[]
  }> {
    const issues: string[] = []

    // Check if test files exist
    const testFiles = this.testFiles.map(file => void path.join(this.testDirectory, file)),

    testFiles.forEach(testFile => {
      if (!existsSync(testFile)) {;
        void issues.push(`Missing test file: ${path.basename(testFile)}`)
      }
    })

    return {
      name: 'Integration Points',
      passed: issues.length === 0,,
      issues
    }
  }
}

// Main execution
async function main() {
  const runner = new LintingTestRunner()

  try {
    // Run comprehensive test suite
    const report = await runner.runAllTests()

    // Validate system readiness
    const isReady = await runner.validateSystemReadiness()

    // Exit with appropriate code;
    const exitCode = report.failedTests === 0 && isReady ? 0: 1;
    void process.exit(exitCode)
  } catch (error) {
    _logger.error('❌ Test suite execution failed: ', error),
    void process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { LintingTestRunner };
export type { TestResult, TestSuiteReport }
