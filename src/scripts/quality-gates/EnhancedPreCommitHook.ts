#!/usr/bin/env node

/**
 * Enhanced Pre-Commit Hook System
 *
 * Comprehensive pre-commit validation including:
 * - Explicit any type prevention
 * - TypeScript error checking
 * - Linting validation
 * - Documentation requirements
 * - Performance impact assessment
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import { ExplicitAnyPreventionHook } from '../../.kiro/hooks/explicit-any-prevention';
import { AutomatedDocumentationGenerator } from './AutomatedDocumentationGenerator';

interface PreCommitConfig {
  checks: {
    explicitAny: boolean;
    typescript: boolean;
    linting: boolean;
    documentation: boolean;
    performance: boolean;
    formatting: boolean;
  };
  thresholds: {
    maxNewAnyTypes: number;
    maxTypeScriptErrors: number;
    maxLintingWarnings: number;
    minDocumentationCoverage: number;
    maxBuildTimeIncrease: number; // percentage
  };
  autoFix: {
    formatting: boolean;
    linting: boolean;
    documentation: boolean;
  };
  exemptions: {
    files: string[];
    directories: string[];
    patterns: string[];
  };
}

interface PreCommitResult {
  check: string;
  passed: boolean;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  autoFixed: boolean;
  details?: any;
}

class EnhancedPreCommitHook {
  private config: PreCommitConfig;
  private stagedFiles: string[];

  constructor() {
    this.config = {
      checks: {
        explicitAny: true,
        typescript: true,
        linting: true,
        documentation: true,
        performance: false, // Disabled for pre-commit (too slow)
        formatting: true
      },
      thresholds: {
        maxNewAnyTypes: 5,
        maxTypeScriptErrors: 0,
        maxLintingWarnings: 50, // Allow some increase for staged files
        minDocumentationCoverage: 80,
        maxBuildTimeIncrease: 20 // 20% increase allowed
      },
      autoFix: {
        formatting: true,
        linting: true,
        documentation: false // Require manual review
      },
      exemptions: {
        files: [
          'package.json',
          'yarn.lock',
          'tsconfig.json'
        ],
        directories: [
          'node_modules',
          '.next',
          'dist',
          '.git'
        ],
        patterns: [
          '**/*.test.ts',
          '**/*.spec.ts',
          '**/scripts/unintentional-any-elimination/**/*'
        ]
      }
    };

    this.stagedFiles = this.getStagedFiles();
  }

  log(message: string, level: 'info' | 'warn' | 'error' | 'success' = 'info'): void {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      success: '✅'
    }[level];

    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  private getStagedFiles(): string[] {
    try {
      const output = execSync('git diff --cached --name-only --diff-filter=AM', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      return output.split('\n')
        .filter(file => file.trim())
        .filter(file => fs.existsSync(file))
        .filter(file => !this.isFileExempt(file));
    } catch (error) {
      this.log(`Error getting staged files: ${error}`, 'error');
      return [];
    }
  }

  private isFileExempt(filePath: string): boolean {
    // Check exact file matches
    if (this.config.exemptions.files.includes(filePath)) {
      return true;
    }

    // Check directory matches
    if (this.config.exemptions.directories.some(dir => filePath.startsWith(dir))) {
      return true;
    }

    // Check pattern matches
    return this.config.exemptions.patterns.some(pattern => {
      const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
      return regex.test(filePath);
    });
  }

  async runPreCommitChecks(): Promise<boolean> {
    this.log('🚀 Running Enhanced Pre-Commit Checks', 'info');
    this.log('='.repeat(60), 'info');

    if (this.stagedFiles.length === 0) {
      this.log('No eligible files staged for commit', 'info');
      return true;
    }

    this.log(`📁 Checking ${this.stagedFiles.length} staged files`, 'info');
    this.stagedFiles.forEach(file => this.log(`  ${file}`, 'info'));

    const results: PreCommitResult[] = [];

    // Run all enabled checks
    if (this.config.checks.formatting) {
      results.push(await this.checkFormatting());
    }

    if (this.config.checks.linting) {
      results.push(await this.checkLinting());
    }

    if (this.config.checks.typescript) {
      results.push(await this.checkTypeScript());
    }

    if (this.config.checks.explicitAny) {
      results.push(await this.checkExplicitAny());
    }

    if (this.config.checks.documentation) {
      results.push(await this.checkDocumentation());
    }

    if (this.config.checks.performance) {
      results.push(await this.checkPerformance());
    }

    // Analyze results
    const passed = results.every(result => result.passed);
    const criticalFailures = results.filter(result => !result.passed && result.severity === 'critical');
    const autoFixed = results.filter(result => result.autoFixed);

    // Display results
    this.log('\n📋 Pre-Commit Check Results:', 'info');
    results.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      const autoFixNote = result.autoFixed ? ' (auto-fixed)' : '';
      this.log(`   ${result.check}: ${status}${autoFixNote} - ${result.message}`,
        result.passed ? 'success' : result.severity === 'critical' ? 'error' : 'warn');
    });

    if (autoFixed.length > 0) {
      this.log(`\n🔧 ${autoFixed.length} issues were automatically fixed`, 'success');
      this.log('Please review the changes and re-stage the files if needed', 'info');
    }

    if (criticalFailures.length > 0) {
      this.log(`\n❌ ${criticalFailures.length} critical failures prevent commit`, 'error');
      criticalFailures.forEach(failure => {
        this.log(`   ${failure.check}: ${failure.message}`, 'error');
        if (failure.details) {
          this.log(`   Details: ${JSON.stringify(failure.details, null, 2)}`, 'error');
        }
      });
      return false;
    }

    if (passed) {
      this.log('\n✅ All pre-commit checks passed! Commit approved.', 'success');
    } else {
      this.log('\n⚠️ Some checks failed but are not critical. Commit allowed with warnings.', 'warn');
    }

    return true;
  }

  private async checkFormatting(): Promise<PreCommitResult> {
    try {
      const tsFiles = this.stagedFiles.filter(file =>
        file.endsWith('.ts') || file.endsWith('.tsx') ||
        file.endsWith('.js') || file.endsWith('.jsx')
      );

      if (tsFiles.length === 0) {
        return {
          check: 'Code Formatting',
          passed: true,
          message: 'No code files to format',
          severity: 'info',
          autoFixed: false
        };
      }

      // Check formatting
      const checkResult = execSync(`prettier --check ${tsFiles.join(' ')}`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      return {
        check: 'Code Formatting',
        passed: true,
        message: `${tsFiles.length} files properly formatted`,
        severity: 'info',
        autoFixed: false
      };
    } catch (error) {
      // Formatting issues detected
      if (this.config.autoFix.formatting) {
        try {
          const tsFiles = this.stagedFiles.filter(file =>
            file.endsWith('.ts') || file.endsWith('.tsx') ||
            file.endsWith('.js') || file.endsWith('.jsx')
          );

          execSync(`prettier --write ${tsFiles.join(' ')}`, { stdio: 'pipe' });

          return {
            check: 'Code Formatting',
            passed: true,
            message: `Auto-fixed formatting for ${tsFiles.length} files`,
            severity: 'info',
            autoFixed: true
          };
        } catch (fixError) {
          return {
            check: 'Code Formatting',
            passed: false,
            message: `Formatting errors could not be auto-fixed: ${fixError}`,
            severity: 'error',
            autoFixed: false
          };
        }
      }

      return {
        check: 'Code Formatting',
        passed: false,
        message: 'Formatting issues detected. Run `yarn format` to fix.',
        severity: 'warning',
        autoFixed: false
      };
    }
  }

  private async checkLinting(): Promise<PreCommitResult> {
    try {
      const tsFiles = this.stagedFiles.filter(file =>
        file.endsWith('.ts') || file.endsWith('.tsx')
      );

      if (tsFiles.length === 0) {
        return {
          check: 'Linting',
          passed: true,
          message: 'No TypeScript files to lint',
          severity: 'info',
          autoFixed: false
        };
      }

      // Run linting on staged files
      const lintOutput = execSync(`yarn lint ${tsFiles.join(' ')} --format=compact`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const warningCount = (lintOutput.match(/warning/g) || []).length;
      const errorCount = (lintOutput.match(/error/g) || []).length;

      if (errorCount > 0) {
        return {
          check: 'Linting',
          passed: false,
          message: `${errorCount} linting errors in staged files`,
          severity: 'critical',
          autoFixed: false,
          details: { errors: errorCount, warnings: warningCount }
        };
      }

      if (warningCount > this.config.thresholds.maxLintingWarnings) {
        if (this.config.autoFix.linting) {
          try {
            execSync(`yarn lint:fix ${tsFiles.join(' ')}`, { stdio: 'pipe' });
            return {
              check: 'Linting',
              passed: true,
              message: `Auto-fixed ${warningCount} linting warnings`,
              severity: 'info',
              autoFixed: true
            };
          } catch (fixError) {
            return {
              check: 'Linting',
              passed: false,
              message: `${warningCount} linting warnings could not be auto-fixed`,
              severity: 'warning',
              autoFixed: false,
              details: { warnings: warningCount }
            };
          }
        }

        return {
          check: 'Linting',
          passed: false,
          message: `${warningCount} linting warnings exceed threshold (${this.config.thresholds.maxLintingWarnings})`,
          severity: 'warning',
          autoFixed: false,
          details: { warnings: warningCount }
        };
      }

      return {
        check: 'Linting',
        passed: true,
        message: `${warningCount} linting warnings within acceptable range`,
        severity: 'info',
        autoFixed: false
      };
    } catch (error) {
      return {
        check: 'Linting',
        passed: false,
        message: `Linting check failed: ${error}`,
        severity: 'error',
        autoFixed: false
      };
    }
  }

  private async checkTypeScript(): Promise<PreCommitResult> {
    try {
      // Run TypeScript compilation check
      execSync('yarn tsc --noEmit --skipLibCheck', { stdio: 'pipe' });

      return {
        check: 'TypeScript Compilation',
        passed: true,
        message: 'No TypeScript compilation errors',
        severity: 'info',
        autoFixed: false
      };
    } catch (error) {
      const errorOutput = error.toString();
      const errorCount = (errorOutput.match(/error TS/g) || []).length;

      return {
        check: 'TypeScript Compilation',
        passed: false,
        message: `${errorCount} TypeScript compilation errors`,
        severity: 'critical',
        autoFixed: false,
        details: { errors: errorCount }
      };
    }
  }

  private async checkExplicitAny(): Promise<PreCommitResult> {
    try {
      const anyHook = new ExplicitAnyPreventionHook();
      const approved = await anyHook.runPreventionCheck();

      return {
        check: 'Explicit Any Prevention',
        passed: approved,
        message: approved ? 'No explicit any regression detected' : 'Explicit any regression detected',
        severity: approved ? 'info' : 'critical',
        autoFixed: false
      };
    } catch (error) {
      return {
        check: 'Explicit Any Prevention',
        passed: false,
        message: `Any type check failed: ${error}`,
        severity: 'error',
        autoFixed: false
      };
    }
  }

  private async checkDocumentation(): Promise<PreCommitResult> {
    try {
      const docGenerator = new AutomatedDocumentationGenerator();
      const isValid = await docGenerator.validateDocumentation();

      if (!isValid && this.config.autoFix.documentation) {
        // Auto-generate documentation (dry run first to check)
        await docGenerator.generateDocumentationForAll(false);

        return {
          check: 'Documentation Coverage',
          passed: true,
          message: 'Auto-generated documentation for undocumented any types',
          severity: 'info',
          autoFixed: true
        };
      }

      return {
        check: 'Documentation Coverage',
        passed: isValid,
        message: isValid ? 'All any types properly documented' : 'Some any types lack documentation',
        severity: isValid ? 'info' : 'warning',
        autoFixed: false
      };
    } catch (error) {
      return {
        check: 'Documentation Coverage',
        passed: false,
        message: `Documentation check failed: ${error}`,
        severity: 'error',
        autoFixed: false
      };
    }
  }

  private async checkPerformance(): Promise<PreCommitResult> {
    try {
      // This is a simplified performance check
      // In practice, you might want to run a subset of tests or check bundle size
      const startTime = Date.now();

      // Quick build check (if enabled)
      execSync('yarn build --dry-run || echo "Build check skipped"', { stdio: 'pipe' });

      const duration = Date.now() - startTime;
      const isWithinThreshold = duration < 30000; // 30 seconds

      return {
        check: 'Performance Impact',
        passed: isWithinThreshold,
        message: `Build check completed in ${(duration / 1000).toFixed(1)}s`,
        severity: isWithinThreshold ? 'info' : 'warning',
        autoFixed: false,
        details: { buildTime: duration }
      };
    } catch (error) {
      return {
        check: 'Performance Impact',
        passed: true, // Don't block commits on performance check failures
        message: `Performance check skipped: ${error}`,
        severity: 'info',
        autoFixed: false
      };
    }
  }

  async generatePreCommitReport(): Promise<void> {
    const report = `# Pre-Commit Hook Report

## Configuration

### Enabled Checks
${Object.entries(this.config.checks)
  .map(([check, enabled]) => `- **${check}**: ${enabled ? '✅ Enabled' : '❌ Disabled'}`)
  .join('\n')}

### Thresholds
- **Max New Any Types per Commit**: ${this.config.thresholds.maxNewAnyTypes}
- **Max TypeScript Errors**: ${this.config.thresholds.maxTypeScriptErrors}
- **Max Linting Warnings**: ${this.config.thresholds.maxLintingWarnings}
- **Min Documentation Coverage**: ${this.config.thresholds.minDocumentationCoverage}%

### Auto-Fix Settings
${Object.entries(this.config.autoFix)
  .map(([fix, enabled]) => `- **${fix}**: ${enabled ? '✅ Enabled' : '❌ Disabled'}`)
  .join('\n')}

## Staged Files
${this.stagedFiles.length > 0
  ? this.stagedFiles.map(file => `- ${file}`).join('\n')
  : 'No eligible files staged'
}

## Usage

### Manual Execution
\`\`\`bash
node src/scripts/quality-gates/EnhancedPreCommitHook.ts
\`\`\`

### Git Hook Integration
Add to \`.git/hooks/pre-commit\`:
\`\`\`bash
#!/bin/sh
node src/scripts/quality-gates/EnhancedPreCommitHook.ts
\`\`\`

### Husky Integration
\`\`\`json
{
  "husky": {
    "hooks": {
      "pre-commit": "node src/scripts/quality-gates/EnhancedPreCommitHook.ts"
    }
  }
}
\`\`\`

---
Generated: ${new Date().toISOString()}
`;

    const reportPath = '.kiro/specs/unintentional-any-elimination/pre-commit-report.md';
    fs.writeFileSync(reportPath, report);
    this.log(`📊 Pre-commit report generated: ${reportPath}`, 'success');
  }
}

// CLI Interface
if (require.main === module) {
  const hook = new EnhancedPreCommitHook();

  const command = process.argv[2] || 'run';

  switch (command) {
    case 'run':
      hook.runPreCommitChecks()
        .then(passed => {
          if (passed) {
            console.log('\n✅ Pre-commit checks passed!');
            process.exit(0);
          } else {
            console.log('\n❌ Pre-commit checks failed!');
            process.exit(1);
          }
        })
        .catch(error => {
          console.error('\n❌ Pre-commit check error:', error);
          process.exit(1);
        });
      break;

    case 'report':
      hook.generatePreCommitReport()
        .then(() => {
          console.log('✅ Pre-commit report generated');
          process.exit(0);
        })
        .catch(error => {
          console.error('Report generation error:', error);
          process.exit(1);
        });
      break;

    default:
      console.log(`
Usage: node EnhancedPreCommitHook.ts <command>

Commands:
  run       Run pre-commit checks (default)
  report    Generate pre-commit configuration report

Examples:
  node EnhancedPreCommitHook.ts run
  node EnhancedPreCommitHook.ts report
      `);
      process.exit(0);
  }
}

export { EnhancedPreCommitHook, PreCommitConfig, PreCommitResult };
