#!/usr/bin/env node

/**
 * Automatic Linting Fix System
 * Applies safe ESLint fixes with comprehensive validation and rollback capabilities
 * Respects domain-specific patterns and campaign system intelligence
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AutoLintFixer {
  constructor() {
    this.backupDir = '.lint-backups';
    this.rateLimitFile = '.lint-rate-limit.json';
    this.maxExecutionsPerHour = 20;
    this.cooldownMs = 5000; // 5 seconds
    this.log = this.createLogger();

    this.ensureBackupDir();
  }

  createLogger() {
    return {
      info: (msg, ...args) => console.log(`[AUTO-LINT] ${msg}`, ...args),
      warn: (msg, ...args) => console.warn(`[AUTO-LINT WARN] ${msg}`, ...args),
      error: (msg, ...args) => console.error(`[AUTO-LINT ERROR] ${msg}`, ...args),
      success: (msg, ...args) => console.log(`[AUTO-LINT SUCCESS] ${msg}`, ...args),
    };
  }

  ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Check rate limiting to respect 20/hour limit
   */
  checkRateLimit() {
    try {
      if (!fs.existsSync(this.rateLimitFile)) {
        return { allowed: true, reason: 'No previous executions' };
      }

      const rateLimitData = JSON.parse(fs.readFileSync(this.rateLimitFile, 'utf8'));
      const now = Date.now();
      const oneHourAgo = now - 60 * 60 * 1000;

      // Filter executions within the last hour
      const recentExecutions = rateLimitData.executions.filter(time => time > oneHourAgo);

      if (recentExecutions.length >= this.maxExecutionsPerHour) {
        return {
          allowed: false,
          reason: `Rate limit exceeded: ${recentExecutions.length}/${this.maxExecutionsPerHour} executions in last hour`,
        };
      }

      // Check cooldown period
      const lastExecution = Math.max(...rateLimitData.executions);
      if (now - lastExecution < this.cooldownMs) {
        const remainingCooldown = this.cooldownMs - (now - lastExecution);
        return {
          allowed: false,
          reason: `Cooldown period: ${remainingCooldown}ms remaining`,
        };
      }

      return { allowed: true, reason: 'Within rate limits' };
    } catch (error) {
      this.log.warn('Error checking rate limit, allowing execution:', error.message);
      return { allowed: true, reason: 'Rate limit check failed, allowing' };
    }
  }

  /**
   * Record execution for rate limiting
   */
  recordExecution() {
    try {
      let rateLimitData = { executions: [] };

      if (fs.existsSync(this.rateLimitFile)) {
        rateLimitData = JSON.parse(fs.readFileSync(this.rateLimitFile, 'utf8'));
      }

      const now = Date.now();
      const oneHourAgo = now - 60 * 60 * 1000;

      // Keep only executions within the last hour and add current
      rateLimitData.executions = rateLimitData.executions
        .filter(time => time > oneHourAgo)
        .concat([now]);

      fs.writeFileSync(this.rateLimitFile, JSON.stringify(rateLimitData, null, 2));
    } catch (error) {
      this.log.warn('Error recording execution:', error.message);
    }
  }

  /**
   * Create timestamped backup of the file
   */
  createBackup(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File does not exist: ${filePath}`);
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = path.basename(filePath);
      const backupFileName = `${fileName}.${timestamp}.backup`;
      const backupPath = path.join(this.backupDir, backupFileName);

      fs.copyFileSync(filePath, backupPath);
      this.log.info(`Created backup: ${backupPath}`);

      return backupPath;
    } catch (error) {
      this.log.error('Failed to create backup:', error.message);
      throw error;
    }
  }

  /**
   * Restore file from backup
   */
  restoreFromBackup(filePath, backupPath) {
    try {
      fs.copyFileSync(backupPath, filePath);
      this.log.info(`Restored file from backup: ${backupPath}`);
      return true;
    } catch (error) {
      this.log.error('Failed to restore from backup:', error.message);
      return false;
    }
  }

  /**
   * Apply ESLint auto-fix using project configuration
   */
  applyESLintFix(filePath) {
    try {
      this.log.info(`Applying ESLint auto-fix to: ${filePath}`);

      const command = `yarn eslint --config eslint.config.cjs --fix "${filePath}"`;
      const output = execSync(command, {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 30000, // 30 second timeout
      });

      this.log.info('ESLint auto-fix completed successfully');
      return { success: true, output };
    } catch (error) {
      // ESLint returns non-zero exit code even for successful fixes with remaining issues
      if (error.status === 1 && error.stdout) {
        this.log.info('ESLint auto-fix completed with remaining issues');
        return { success: true, output: error.stdout };
      }

      this.log.error('ESLint auto-fix failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Apply safe pattern fixes
   */
  applySafePatternFixes(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      const originalContent = content;

      // Remove trailing whitespace
      const withoutTrailingWhitespace = content.replace(/[ \t]+$/gm, '');
      if (withoutTrailingWhitespace !== content) {
        content = withoutTrailingWhitespace;
        modified = true;
        this.log.info('Removed trailing whitespace');
      }

      // Fix double semicolons (but preserve domain-specific patterns)
      const withoutDoubleSemicolons = content.replace(/;;+/g, ';');
      if (withoutDoubleSemicolons !== content) {
        content = withoutDoubleSemicolons;
        modified = true;
        this.log.info('Fixed double semicolons');
      }

      // Normalize multiple empty lines (max 2 consecutive)
      const withNormalizedLines = content.replace(/\n\s*\n\s*\n+/g, '\n\n');
      if (withNormalizedLines !== content) {
        content = withNormalizedLines;
        modified = true;
        this.log.info('Normalized multiple empty lines');
      }

      // Conservative semicolon addition (only for obvious cases)
      const lines = content.split('\n');
      const fixedLines = lines.map(line => {
        const trimmed = line.trim();

        // Skip if line is empty, comment, or already has semicolon
        if (
          !trimmed ||
          trimmed.startsWith('//') ||
          trimmed.startsWith('/*') ||
          trimmed.endsWith(';') ||
          trimmed.endsWith('{') ||
          trimmed.endsWith('}') ||
          trimmed.endsWith(',') ||
          trimmed.includes('//')
        ) {
          return line;
        }

        // Add semicolon for obvious statements (very conservative)
        if (
          trimmed.match(/^(const|let|var|return|throw|break|continue)\s+/) ||
          trimmed.match(/^\w+\s*=\s*/) ||
          trimmed.match(/^this\.\w+\s*=/) ||
          trimmed.match(/^\w+\(\)$/) ||
          trimmed.match(/^console\.(log|warn|error|info)\(/)
        ) {
          return line + ';';
        }

        return line;
      });

      const withSemicolons = fixedLines.join('\n');
      if (withSemicolons !== content) {
        content = withSemicolons;
        modified = true;
        this.log.info('Added missing semicolons (conservative)');
      }

      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        this.log.info('Applied safe pattern fixes');
        return { success: true, modified: true };
      } else {
        this.log.info('No safe pattern fixes needed');
        return { success: true, modified: false };
      }
    } catch (error) {
      this.log.error('Failed to apply safe pattern fixes:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Validate TypeScript compilation
   */
  validateTypeScript(filePath) {
    try {
      this.log.info('Validating TypeScript compilation...');

      const command = 'yarn tsc --noEmit --skipLibCheck';
      execSync(command, {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 60000, // 60 second timeout
      });

      this.log.success('TypeScript validation passed');
      return { success: true };
    } catch (error) {
      this.log.error('TypeScript validation failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check for corruption patterns
   */
  validateSyntaxIntegrity(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');

      // Check for corruption patterns
      const corruptionPatterns = [
        /undefined undefined/g,
        /null null/g,
        /;;+/g,
        /\{\s*\}/g, // Empty objects that might indicate corruption
        /\[\s*\]/g, // Empty arrays that might indicate corruption
      ];

      const issues = [];
      corruptionPatterns.forEach((pattern, index) => {
        const matches = content.match(pattern);
        if (matches) {
          issues.push(`Pattern ${index + 1}: ${matches.length} occurrences`);
        }
      });

      // Try to parse as JavaScript/TypeScript
      try {
        // Basic syntax check - try to parse with Node.js
        const vm = require('vm');
        new vm.Script(content, { filename: filePath });
      } catch (parseError) {
        issues.push(`Parse error: ${parseError.message}`);
      }

      if (issues.length > 0) {
        this.log.warn('Syntax integrity issues found:', issues);
        return { success: false, issues };
      }

      this.log.success('Syntax integrity validation passed');
      return { success: true };
    } catch (error) {
      this.log.error('Syntax integrity validation failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Preserve critical patterns check
   */
  validateCriticalPatterns(filePath, originalContent) {
    try {
      const currentContent = fs.readFileSync(filePath, 'utf8');

      // Critical patterns to preserve
      const criticalPatterns = [
        // Astrological calculation constants
        /RELIABLE_POSITIONS/,
        /TransitDates/,
        /ElementalProperties/,
        /PlanetaryPositions/,

        // Fallback values and error handling
        /fallback/i,
        /catch\s*\(/,
        /try\s*\{/,
        /\.catch\(/,

        // Campaign system intelligence patterns
        /CampaignController/,
        /ProgressTracker/,
        /SafetyProtocol/,
        /IntelligenceSystem/,

        // Domain-specific calculations
        /calculateElementalCompatibility/,
        /getReliablePlanetaryPositions/,
        /validateTransitDate/,
      ];

      const issues = [];
      criticalPatterns.forEach((pattern, index) => {
        const originalMatches = (originalContent.match(pattern) || []).length;
        const currentMatches = (currentContent.match(pattern) || []).length;

        if (originalMatches !== currentMatches) {
          issues.push(
            `Critical pattern ${index + 1} count changed: ${originalMatches} -> ${currentMatches}`,
          );
        }
      });

      if (issues.length > 0) {
        this.log.warn('Critical pattern validation failed:', issues);
        return { success: false, issues };
      }

      this.log.success('Critical patterns preserved');
      return { success: true };
    } catch (error) {
      this.log.error('Critical pattern validation failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Main execution function
   */
  async fixFile(filePath) {
    const startTime = Date.now();

    try {
      // Check rate limiting
      const rateLimitCheck = this.checkRateLimit();
      if (!rateLimitCheck.allowed) {
        this.log.warn(`Rate limit check failed: ${rateLimitCheck.reason}`);
        return { success: false, reason: rateLimitCheck.reason };
      }

      this.log.info(`Starting automatic linting fix for: ${filePath}`);

      // Record execution for rate limiting
      this.recordExecution();

      // Step 1: Safety First - Create backup
      const originalContent = fs.readFileSync(filePath, 'utf8');
      const backupPath = this.createBackup(filePath);

      let rollbackRequired = false;
      const results = {
        backup: backupPath,
        eslintFix: null,
        patternFixes: null,
        validation: {
          typescript: null,
          syntax: null,
          criticalPatterns: null,
        },
      };

      try {
        // Step 2: Apply ESLint Auto-Fix
        results.eslintFix = this.applyESLintFix(filePath);
        if (!results.eslintFix.success) {
          this.log.warn('ESLint auto-fix had issues, continuing with validation');
        }

        // Step 3: Apply Safe Pattern Fixes
        results.patternFixes = this.applySafePatternFixes(filePath);
        if (!results.patternFixes.success) {
          this.log.error('Safe pattern fixes failed');
          rollbackRequired = true;
        }

        // Step 4: Comprehensive Validation
        if (!rollbackRequired) {
          // TypeScript compilation check
          results.validation.typescript = this.validateTypeScript(filePath);
          if (!results.validation.typescript.success) {
            this.log.error('TypeScript validation failed');
            rollbackRequired = true;
          }

          // Syntax integrity check
          results.validation.syntax = this.validateSyntaxIntegrity(filePath);
          if (!results.validation.syntax.success) {
            this.log.error('Syntax integrity validation failed');
            rollbackRequired = true;
          }

          // Critical patterns check
          results.validation.criticalPatterns = this.validateCriticalPatterns(
            filePath,
            originalContent,
          );
          if (!results.validation.criticalPatterns.success) {
            this.log.error('Critical patterns validation failed');
            rollbackRequired = true;
          }
        }

        // Step 5: Automatic Rollback if needed
        if (rollbackRequired) {
          this.log.warn('Validation failed, performing automatic rollback');
          const rollbackSuccess = this.restoreFromBackup(filePath, backupPath);

          if (rollbackSuccess) {
            this.log.success('Automatic rollback completed successfully');
            return {
              success: false,
              rolledBack: true,
              reason: 'Validation failed, file restored from backup',
              results,
            };
          } else {
            this.log.error('Automatic rollback failed - manual intervention required');
            return {
              success: false,
              rolledBack: false,
              reason: 'Validation failed and rollback failed - manual intervention required',
              results,
            };
          }
        }

        // Success!
        const duration = Date.now() - startTime;
        this.log.success(`Automatic linting fix completed successfully in ${duration}ms`);

        return {
          success: true,
          duration,
          results,
          message: 'All fixes applied and validated successfully',
        };
      } catch (error) {
        this.log.error('Unexpected error during processing:', error.message);

        // Emergency rollback
        const rollbackSuccess = this.restoreFromBackup(filePath, backupPath);
        return {
          success: false,
          rolledBack: rollbackSuccess,
          error: error.message,
          results,
        };
      }
    } catch (error) {
      this.log.error('Fatal error in auto-lint-fixer:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// CLI interface
if (require.main === module) {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error('Usage: node auto-lint-fixer.cjs <file-path>');
    process.exit(1);
  }

  const fixer = new AutoLintFixer();
  fixer
    .fixFile(filePath)
    .then(result => {
      if (result.success) {
        console.log('✅ Auto-lint fix completed successfully');
        process.exit(0);
      } else {
        console.error('❌ Auto-lint fix failed:', result.reason || result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 Fatal error:', error.message);
      process.exit(1);
    });
}

module.exports = AutoLintFixer;
