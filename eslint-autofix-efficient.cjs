#!/usr/bin/env node

/**
 * ESLint Auto-Fix Efficient Processor
 *
 * Optimized version that handles large codebases efficiently
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class EfficientAutoFixProcessor {
  constructor() {
    this.processedFiles = 0;
    this.fixedFiles = 0;
    this.errors = [];
    this.logFile = 'eslint-autofix-efficient.log';

    this.log('ESLint Efficient Auto-Fix Started');
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    fs.appendFileSync(this.logFile, logMessage + '\n');
  }

  async getSourceFiles() {
    try {
      // Get all TypeScript and JavaScript files
      const output = execSync('find src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | head -100', {
        encoding: 'utf8'
      });

      const files = output.trim().split('\n').filter(f => f.length > 0);
      this.log(`Found ${files.length} source files to process`);
      return files;
    } catch (error) {
      this.log(`Error finding source files: ${error.message}`);
      return [];
    }
  }

  async checkFileFixable(filePath) {
    try {
      // Check if file has fixable issues
      const output = execSync(`yarn lint --fix-dry-run --format=json "${filePath}" 2>/dev/null`, {
        encoding: 'utf8',
        timeout: 10000 // 10 second timeout per file
      });

      const results = JSON.parse(output);
      if (results.length > 0 && results[0].output && results[0].output !== results[0].source) {
        return {
          filePath: results[0].filePath,
          fixableErrorCount: results[0].fixableErrorCount || 0,
          fixableWarningCount: results[0].fixableWarningCount || 0
        };
      }

      return null;
    } catch (error) {
      // File might not have fixable issues or might have syntax errors
      return null;
    }
  }

  async applyFixToFile(filePath) {
    try {
      this.log(`Applying fixes to: ${path.relative(process.cwd(), filePath)}`);

      // Create backup
      const backupPath = filePath + '.backup';
      fs.copyFileSync(filePath, backupPath);

      // Apply fix
      execSync(`yarn lint --fix "${filePath}"`, {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 15000 // 15 second timeout
      });

      // Verify the file still compiles
      try {
        execSync(`yarn tsc --noEmit --skipLibCheck "${filePath}"`, {
          encoding: 'utf8',
          stdio: 'pipe',
          timeout: 10000
        });

        // Success - remove backup
        fs.unlinkSync(backupPath);
        this.fixedFiles++;
        this.log(`✅ Successfully fixed: ${path.relative(process.cwd(), filePath)}`);
        return true;
      } catch (compileError) {
        // Compilation failed - restore backup
        fs.copyFileSync(backupPath, filePath);
        fs.unlinkSync(backupPath);
        this.log(`❌ Fix caused compilation error, restored: ${path.relative(process.cwd(), filePath)}`);
        return false;
      }
    } catch (error) {
      this.log(`Error fixing file ${filePath}: ${error.message}`);

      // Restore backup if it exists
      const backupPath = filePath + '.backup';
      if (fs.existsSync(backupPath)) {
        fs.copyFileSync(backupPath, filePath);
        fs.unlinkSync(backupPath);
      }

      return false;
    }
  }

  async processFiles() {
    const sourceFiles = await this.getSourceFiles();

    if (sourceFiles.length === 0) {
      this.log('No source files found');
      return;
    }

    this.log(`Processing ${sourceFiles.length} files for auto-fixes...`);

    let fixableCount = 0;

    for (let i = 0; i < sourceFiles.length; i++) {
      const filePath = sourceFiles[i];
      this.processedFiles++;

      // Progress update
      if (i % 10 === 0) {
        const progress = ((i / sourceFiles.length) * 100).toFixed(1);
        this.log(`Progress: ${progress}% (${i}/${sourceFiles.length} files checked)`);
      }

      // Check if file has fixable issues
      const fixableInfo = await this.checkFileFixable(filePath);
      if (fixableInfo) {
        fixableCount++;
        this.log(`Found fixable issues in: ${path.relative(process.cwd(), filePath)} (${fixableInfo.fixableErrorCount} errors, ${fixableInfo.fixableWarningCount} warnings)`);

        // Apply fixes
        await this.applyFixToFile(filePath);
      }
    }

    this.log(`Found ${fixableCount} files with fixable issues`);
  }

  async validateOverallBuild() {
    try {
      this.log('Performing final build validation...');

      execSync('yarn tsc --noEmit --skipLibCheck', {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 60000 // 1 minute timeout
      });

      this.log('✅ Final build validation successful');
      return true;
    } catch (error) {
      this.log(`❌ Final build validation failed: ${error.message}`);
      return false;
    }
  }

  async getLintingStats() {
    try {
      // Get current error/warning counts
      const errorOutput = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS" || echo "0"', {
        encoding: 'utf8'
      });

      const warningOutput = execSync('yarn lint --format=json 2>/dev/null | jq "[.[] | .warningCount] | add" || echo "0"', {
        encoding: 'utf8'
      });

      const errors = parseInt(errorOutput.trim()) || 0;
      const warnings = parseInt(warningOutput.trim()) || 0;

      return { errors, warnings };
    } catch (error) {
      this.log(`Error getting linting stats: ${error.message}`);
      return { errors: -1, warnings: -1 };
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      processedFiles: this.processedFiles,
      fixedFiles: this.fixedFiles,
      errors: this.errors,
      success: this.errors.length === 0 && this.fixedFiles > 0
    };

    fs.writeFileSync('eslint-autofix-efficient-report.json', JSON.stringify(report, null, 2));

    this.log('='.repeat(60));
    this.log('ESLint Efficient Auto-Fix Completed');
    this.log(`Files processed: ${this.processedFiles}`);
    this.log(`Files fixed: ${this.fixedFiles}`);
    this.log(`Errors encountered: ${this.errors.length}`);
    this.log('='.repeat(60));

    return report;
  }
}

// Main execution
async function main() {
  const processor = new EfficientAutoFixProcessor();

  try {
    // Get initial stats
    const initialStats = await processor.getLintingStats();
    processor.log(`Initial linting status: ${initialStats.errors} TypeScript errors, ${initialStats.warnings} ESLint warnings`);

    // Process files
    await processor.processFiles();

    // Validate build
    await processor.validateOverallBuild();

    // Get final stats
    const finalStats = await processor.getLintingStats();
    processor.log(`Final linting status: ${finalStats.errors} TypeScript errors, ${finalStats.warnings} ESLint warnings`);

    // Calculate improvements
    if (initialStats.warnings >= 0 && finalStats.warnings >= 0) {
      const warningReduction = initialStats.warnings - finalStats.warnings;
      processor.log(`ESLint warnings reduced by: ${warningReduction}`);
    }

  } catch (error) {
    processor.log(`Fatal error: ${error.message}`);
    processor.errors.push(error.message);
  } finally {
    processor.generateReport();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { EfficientAutoFixProcessor };
