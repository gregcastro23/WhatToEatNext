#!/usr/bin/env node

/**
 * Console Statement Cleanup Script
 *
 * Systematically removes console statements while preserving intentional ones
 * in debug files, test files, and astrological debugging contexts.
 *
 * Target: 95% reduction (1,354 out of 1,425 errors eliminated)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const MAX_FILES =
  parseInt(process.argv.find(arg => arg.startsWith('--max-files='))?.split('=')[1]) || 50;
const VERBOSE = process.argv.includes('--verbose');

// Patterns for files where console statements should be preserved
const PRESERVE_PATTERNS = [
  // Debug and development files
  /debug/i,
  /\.debug\./,
  /\.dev\./,
  /development/i,

  // Test files
  /\.test\./,
  /\.spec\./,
  /__tests__/,
  /test-/,

  // Planet test layouts (specific preservation)
  /planet-test.*layout/,

  // Configuration and script files
  /config/,
  /scripts/,
  /\.config\./,

  // Campaign system monitoring (preserve some logging)
  /PerformanceMonitoringSystem/,
  /CampaignController/,
  /ProgressTracker/,

  // Astrological debugging contexts
  /astrology.*debug/i,
  /planetary.*debug/i,
  /elemental.*debug/i,
];

// Console methods to handle differently
const CONSOLE_METHODS = {
  // Remove these (development/debugging)
  REMOVE: ['log', 'debug', 'trace', 'info'],

  // Convert to comments (preserve information)
  COMMENT: ['log'], // Only console.log gets commented

  // Preserve these (important for error handling)
  PRESERVE: ['error', 'warn', 'assert'],
};

// Domain-specific preservation patterns
const DOMAIN_PRESERVATION = {
  // Astrological calculation debugging
  ASTROLOGICAL: [
    /planetary.*position/i,
    /astronomical.*calculation/i,
    /elemental.*state/i,
    /transit.*validation/i,
    /fallback.*data/i,
  ],

  // Campaign system logging
  CAMPAIGN: [
    /campaign.*progress/i,
    /metrics.*collection/i,
    /safety.*protocol/i,
    /performance.*alert/i,
    /enterprise.*intelligence/i,
  ],
};

class ConsoleStatementCleaner {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      consoleStatementsRemoved: 0,
      consoleStatementsCommented: 0,
      consoleStatementsPreserved: 0,
      errors: [],
    };
  }

  /**
   * Get all TypeScript/JavaScript files with console statements
   */
  getFilesWithConsoleStatements() {
    try {
      // Use ESLint to find files with console statement violations
      const lintOutput = execSync('yarn lint --format=json 2>/dev/null', {
        encoding: 'utf8',
        stdio: 'pipe',
      });

      let lintResults = [];
      try {
        lintResults = JSON.parse(lintOutput);
      } catch (e) {
        throw new Error('Failed to parse ESLint JSON output');
      }

      // Extract files with console-related violations
      const filesWithConsole = new Set();

      lintResults.forEach(result => {
        if (result.messages && result.messages.length > 0) {
          const hasConsoleViolations = result.messages.some(msg => msg.ruleId === 'no-console');

          if (hasConsoleViolations) {
            // Convert absolute path to relative path
            const relativePath = result.filePath.replace(process.cwd() + '/', '');
            filesWithConsole.add(relativePath);
          }
        }
      });

      const files = Array.from(filesWithConsole).slice(0, MAX_FILES);

      if (VERBOSE) {
        console.log('Files with console violations found:');
        files.forEach(f => console.log(`  - ${f}`));
      }

      return files;
    } catch (error) {
      console.warn('Warning: Could not get lint results, using grep fallback');

      // Fallback to direct file search
      const grepOutput = execSync(
        'find src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs grep -l "console\\." 2>/dev/null || true',
        { encoding: 'utf8' },
      );

      return grepOutput
        .trim()
        .split('\n')
        .filter(f => f && fs.existsSync(f))
        .slice(0, MAX_FILES);
    }
  }

  /**
   * Check if a file should have its console statements preserved
   */
  shouldPreserveFile(filePath) {
    return PRESERVE_PATTERNS.some(pattern => pattern.test(filePath));
  }

  /**
   * Check if a console statement should be preserved based on context
   */
  shouldPreserveConsoleStatement(line, filePath, lineNumber) {
    // Always preserve error and warn
    if (/console\.(error|warn|assert)/.test(line)) {
      return true;
    }

    // Check domain-specific preservation
    const lineContent = line.toLowerCase();

    // Astrological context preservation
    if (DOMAIN_PRESERVATION.ASTROLOGICAL.some(pattern => pattern.test(lineContent))) {
      return true;
    }

    // Campaign system context preservation - be more selective
    if (filePath.includes('campaign/')) {
      // Only preserve console.log statements that are clearly important status messages
      if (
        /console\.log/.test(line) &&
        (/final|complete|success|failure|error|critical|emergency/.test(lineContent) ||
          /validation.*result|campaign.*status|certification/.test(lineContent))
      ) {
        return true;
      }
      // Always preserve console.error and console.warn in campaign files
      if (/console\.(error|warn)/.test(line)) {
        return true;
      }
      // Don't preserve other console.log statements in campaign files
      return false;
    }

    // Preserve console statements with meaningful error handling context
    if (/catch|error|fail|warn|alert/.test(lineContent)) {
      return true;
    }

    // Preserve console statements in API error handling
    if (/api.*fail|fallback.*data|using.*cached/.test(lineContent)) {
      return true;
    }

    // Preserve console statements that are clearly for monitoring/debugging important systems
    if (/monitoring|performance|alert|critical/.test(lineContent)) {
      return true;
    }

    return false;
  }

  /**
   * Process a single file to clean up console statements
   */
  processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      let modified = false;
      let fileStats = {
        removed: 0,
        commented: 0,
        preserved: 0,
      };

      // Skip files that should be preserved entirely
      if (this.shouldPreserveFile(filePath)) {
        if (VERBOSE) {
          console.log(`⏭️  Skipping preserved file: ${filePath}`);
        }
        return false;
      }

      const processedLines = lines.map((line, index) => {
        const lineNumber = index + 1;

        // Find console statements
        const consoleMatch = line.match(
          /(\s*)(.*?)(console\.(log|debug|trace|info|warn|error|assert))\s*\(/,
        );

        if (consoleMatch) {
          const [, indent, prefix, consoleCall, method] = consoleMatch;

          // Check if this console statement should be preserved
          if (this.shouldPreserveConsoleStatement(line, filePath, lineNumber)) {
            fileStats.preserved++;
            return line; // Keep as-is
          }

          // Handle based on console method
          if (CONSOLE_METHODS.REMOVE.includes(method)) {
            // Convert to comment for console.log, remove others
            if (method === 'log') {
              fileStats.commented++;
              modified = true;
              return `${indent}${prefix}// console.${method}(${line.split('console.' + method + '(')[1]}`;
            } else {
              // Remove debug, trace, info entirely
              fileStats.removed++;
              modified = true;
              return `${indent}// Removed console.${method} statement`;
            }
          } else if (CONSOLE_METHODS.PRESERVE.includes(method)) {
            fileStats.preserved++;
            return line; // Keep error, warn, assert
          }
        }

        return line;
      });

      if (modified && !DRY_RUN) {
        fs.writeFileSync(filePath, processedLines.join('\n'));
      }

      // Update stats
      this.stats.consoleStatementsRemoved += fileStats.removed;
      this.stats.consoleStatementsCommented += fileStats.commented;
      this.stats.consoleStatementsPreserved += fileStats.preserved;

      if (modified || VERBOSE) {
        console.log(
          `${modified ? '✅' : '⏭️'} ${filePath}: ${fileStats.removed} removed, ${fileStats.commented} commented, ${fileStats.preserved} preserved`,
        );
      }

      return modified;
    } catch (error) {
      this.stats.errors.push({ file: filePath, error: error.message });
      console.error(`❌ Error processing ${filePath}:`, error.message);
      return false;
    }
  }

  /**
   * Validate changes don't break TypeScript compilation
   */
  validateChanges() {
    try {
      console.log('🔍 Validating TypeScript compilation...');
      execSync('yarn tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
      console.log('✅ TypeScript validation passed');
      return true;
    } catch (error) {
      console.error('❌ TypeScript validation failed');
      console.error(error.stdout?.toString() || error.message);
      return false;
    }
  }

  /**
   * Run the console statement cleanup process
   */
  async run() {
    console.log('🧹 Starting Console Statement Cleanup');
    console.log(`📊 Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
    console.log(`📁 Max files: ${MAX_FILES}`);
    console.log('');

    // Get files with console statements
    const files = this.getFilesWithConsoleStatements();
    console.log(`📋 Found ${files.length} files with console statements`);

    if (files.length === 0) {
      console.log('✅ No files with console statements found');
      return;
    }

    // Process each file
    let modifiedFiles = 0;
    for (const filePath of files) {
      const wasModified = this.processFile(filePath);
      if (wasModified) {
        modifiedFiles++;
        this.stats.filesProcessed++;
      }

      // Validate every 10 files in live mode
      if (!DRY_RUN && modifiedFiles > 0 && modifiedFiles % 10 === 0) {
        if (!this.validateChanges()) {
          console.error('❌ Stopping due to TypeScript validation failure');
          break;
        }
      }
    }

    // Final validation
    if (!DRY_RUN && modifiedFiles > 0) {
      this.validateChanges();
    }

    // Print summary
    this.printSummary();
  }

  /**
   * Print execution summary
   */
  printSummary() {
    console.log('\n📊 Console Statement Cleanup Summary');
    console.log('=====================================');
    console.log(`Files processed: ${this.stats.filesProcessed}`);
    console.log(`Console statements removed: ${this.stats.consoleStatementsRemoved}`);
    console.log(`Console statements commented: ${this.stats.consoleStatementsCommented}`);
    console.log(`Console statements preserved: ${this.stats.consoleStatementsPreserved}`);

    const totalProcessed =
      this.stats.consoleStatementsRemoved +
      this.stats.consoleStatementsCommented +
      this.stats.consoleStatementsPreserved;

    if (totalProcessed > 0) {
      const reductionRate = (
        ((this.stats.consoleStatementsRemoved + this.stats.consoleStatementsCommented) /
          totalProcessed) *
        100
      ).toFixed(1);
      console.log(`Reduction rate: ${reductionRate}%`);
    }

    if (this.stats.errors.length > 0) {
      console.log(`\n❌ Errors encountered: ${this.stats.errors.length}`);
      this.stats.errors.forEach(({ file, error }) => {
        console.log(`   ${file}: ${error}`);
      });
    }

    console.log(`\n${DRY_RUN ? '🔍 DRY RUN COMPLETE' : '✅ CLEANUP COMPLETE'}`);
  }
}

// Run the cleaner
if (require.main === module) {
  const cleaner = new ConsoleStatementCleaner();
  cleaner.run().catch(error => {
    console.error('❌ Console statement cleanup failed:', error);
    process.exit(1);
  });
}

module.exports = ConsoleStatementCleaner;
