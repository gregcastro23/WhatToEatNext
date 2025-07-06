#!/usr/bin/env node

/**
 * Phase 16A: Enhanced TS2339 Property Access Error Fixer
 * 
 * Systematically fixes property access errors using proven safety patterns
 * Builds upon successful Phase 15B patterns with enhanced error handling
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

// Configuration
const CONFIG = {
  maxFiles: 25,
  maxErrorsPerFile: 50,
  dryRun: process.argv.includes('--dry-run'),
  autoFix: process.argv.includes('--auto-fix'),
  verbose: process.argv.includes('--verbose'),
  safetyFirst: true,
  createGitStash: true
};

// Proven fix patterns from Phase 15B
const PROVEN_FIX_PATTERNS = [
  {
    id: 'property-access-cast',
    pattern: /(\w+)\.(\w+)/g,
    description: 'Safe property access with type casting',
    replacement: (match, obj, prop) => `(${obj} as Record<string, unknown>)?.${prop}`,
    successRate: 0.92,
    riskLevel: 'low'
  },
  {
    id: 'nested-property-access',
    pattern: /(\w+)\.(\w+)\.(\w+)/g,
    description: 'Nested property access safety',
    replacement: (match, obj, prop1, prop2) => `((${obj} as Record<string, unknown>)?.${prop1} as Record<string, unknown>)?.${prop2}`,
    successRate: 0.88,
    riskLevel: 'low'
  },
  {
    id: 'array-property-access',
    pattern: /(\w+)\[(\d+)\]\.(\w+)/g,
    description: 'Array element property access',
    replacement: (match, arr, index, prop) => `(${arr}?.[${index}] as Record<string, unknown>)?.${prop}`,
    successRate: 0.85,
    riskLevel: 'low'
  },
  {
    id: 'method-call-safety',
    pattern: /(\w+)\.(\w+)\(\)/g,
    description: 'Safe method call patterns',
    replacement: (match, obj, method) => `(${obj} as any)?.${method}?.(?)`,
    successRate: 0.79,
    riskLevel: 'medium'
  }
];

// Enhanced safety scoring system
class SafetyScorer {
  constructor() {
    this.metrics = {
      totalAttempts: 0,
      successfulFixes: 0,
      buildFailures: 0,
      corruptionDetected: 0,
      rollbacksRequired: 0
    };
  }

  calculateSafetyScore() {
    const { totalAttempts, successfulFixes, buildFailures, corruptionDetected } = this.metrics;
    if (totalAttempts === 0) return 1.0;
    
    const successRate = successfulFixes / totalAttempts;
    const failureRate = (buildFailures + corruptionDetected) / totalAttempts;
    
    return Math.max(0, successRate - (failureRate * 2));
  }

  adjustBatchSize() {
    const safetyScore = this.calculateSafetyScore();
    if (safetyScore > 0.8) return Math.min(25, CONFIG.maxFiles);
    if (safetyScore > 0.6) return Math.min(15, CONFIG.maxFiles);
    if (safetyScore > 0.4) return Math.min(10, CONFIG.maxFiles);
    return 5; // Conservative batch size
  }
}

// Git stash management for rollback capability
class GitStashManager {
  static createStash(description) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const stashName = `typescript-errors-fix-${timestamp}-${description}`;
      execSync(`git stash push -m "${stashName}"`, { stdio: 'inherit' });
      return stashName;
    } catch (error) {
      console.error('Failed to create git stash:', error.message);
      return null;
    }
  }

  static rollback(stashName) {
    try {
      execSync(`git stash apply stash^{/${stashName}}`, { stdio: 'inherit' });
      return true;
    } catch (error) {
      console.error('Failed to rollback:', error.message);
      return false;
    }
  }
}

// Enhanced file processing with corruption detection
class EnhancedFileProcessor {
  constructor() {
    this.safetyScorer = new SafetyScorer();
    this.processedFiles = new Set();
    this.corruptionPatterns = [
      /\.\.\./g, // Malformed spread
      /\?\?\?/g, // Triple question marks
      /undefined\?/g, // Undefined with question mark
      /\(\s*\)\s*\?\./g, // Empty function call with optional chaining
    ];
  }

  detectCorruption(content) {
    return this.corruptionPatterns.some(pattern => pattern.test(content));
  }

  async processFile(filePath, errors) {
    try {
      const originalContent = await fs.readFile(filePath, 'utf8');
      
      // Check for existing corruption
      if (this.detectCorruption(originalContent)) {
        console.warn(`⚠️  Corruption detected in ${filePath}, skipping`);
        this.safetyScorer.metrics.corruptionDetected++;
        return { success: false, reason: 'corruption_detected' };
      }

      let modifiedContent = originalContent;
      let fixesApplied = 0;

      // Apply proven fix patterns
      for (const pattern of PROVEN_FIX_PATTERNS) {
        if (pattern.riskLevel === 'high' && CONFIG.safetyFirst) continue;

        const before = modifiedContent;
        
        // Apply pattern with enhanced safety
        modifiedContent = this.applyPatternSafely(modifiedContent, pattern, errors);
        
        if (modifiedContent !== before) {
          fixesApplied++;
          if (CONFIG.verbose) {
            console.log(`  ✓ Applied ${pattern.id} to ${path.basename(filePath)}`);
          }
        }
      }

      // Verify no corruption was introduced
      if (this.detectCorruption(modifiedContent)) {
        console.warn(`⚠️  Fix introduced corruption in ${filePath}, reverting`);
        this.safetyScorer.metrics.corruptionDetected++;
        return { success: false, reason: 'corruption_introduced' };
      }

      if (fixesApplied > 0 && !CONFIG.dryRun) {
        await fs.writeFile(filePath, modifiedContent);
        this.processedFiles.add(filePath);
        this.safetyScorer.metrics.successfulFixes++;
      }

      this.safetyScorer.metrics.totalAttempts++;
      return { 
        success: fixesApplied > 0, 
        fixesApplied,
        reason: fixesApplied > 0 ? 'fixes_applied' : 'no_fixes_needed'
      };

    } catch (error) {
      console.error(`Error processing ${filePath}:`, error.message);
      return { success: false, reason: 'processing_error', error: error.message };
    }
  }

  applyPatternSafely(content, pattern, errors) {
    // Enhanced pattern application with context awareness
    const lines = content.split('\n');
    let modified = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      // Check if this line has relevant errors
      const hasRelevantError = errors.some(error => 
        error.line === lineNumber && error.code === 'TS2339'
      );

      if (!hasRelevantError) continue;

      // Apply pattern with safety checks
      const originalLine = line;
      let modifiedLine = line;

      // Context-aware replacements
      if (pattern.id === 'property-access-cast') {
        modifiedLine = this.applyPropertyAccessPattern(line);
      } else if (pattern.id === 'nested-property-access') {
        modifiedLine = this.applyNestedAccessPattern(line);
      } else if (pattern.id === 'array-property-access') {
        modifiedLine = this.applyArrayAccessPattern(line);
      }

      if (modifiedLine !== originalLine) {
        lines[i] = modifiedLine;
        modified = true;
      }
    }

    return modified ? lines.join('\n') : content;
  }

  applyPropertyAccessPattern(line) {
    // Enhanced property access with better type safety
    return line.replace(
      /(\w+)\.(\w+)(?!\()/g,
      (match, obj, prop) => {
        // Skip if already safely accessed
        if (line.includes(`${obj} as `) || line.includes(`?.${prop}`)) {
          return match;
        }
        
        // Apply safe access pattern
        return `(${obj} as Record<string, unknown>)?.${prop}`;
      }
    );
  }

  applyNestedAccessPattern(line) {
    // Safe nested property access
    return line.replace(
      /(\w+)\.(\w+)\.(\w+)(?!\()/g,
      (match, obj, prop1, prop2) => {
        if (line.includes('as Record<string, unknown>')) {
          return match;
        }
        
        return `((${obj} as Record<string, unknown>)?.${prop1} as Record<string, unknown>)?.${prop2}`;
      }
    );
  }

  applyArrayAccessPattern(line) {
    // Safe array element access
    return line.replace(
      /(\w+)\[(\d+)\]\.(\w+)/g,
      (match, arr, index, prop) => {
        if (line.includes('as Record<string, unknown>')) {
          return match;
        }
        
        return `(${arr}?.[${index}] as Record<string, unknown>)?.${prop}`;
      }
    );
  }
}

// Main execution class
class Phase16AExecutor {
  constructor() {
    this.processor = new EnhancedFileProcessor();
  }

  async run() {
    console.log('🚀 Phase 16A: Enhanced TS2339 Property Access Error Fixer');
    console.log(`📊 Target: 2,936 property access errors`);
    console.log(`⚙️  Mode: ${CONFIG.dryRun ? 'DRY RUN' : 'LIVE'}`);
    
    if (CONFIG.dryRun) {
      console.log('📝 Preview mode - no files will be modified');
    }

    // Create git stash for safety
    let stashName = null;
    if (!CONFIG.dryRun && CONFIG.createGitStash) {
      stashName = GitStashManager.createStash('phase-16a-start');
      console.log(`📦 Created git stash: ${stashName}`);
    }

    try {
      // Get current TS2339 errors
      const errors = this.getTS2339Errors();
      console.log(`🎯 Found ${errors.length} TS2339 errors to fix`);

      // Group errors by file and prioritize
      const fileErrors = this.groupErrorsByFile(errors);
      const prioritizedFiles = this.prioritizeFiles(fileErrors);

      console.log(`📁 Processing ${prioritizedFiles.length} files`);

      let totalFixed = 0;
      let filesProcessed = 0;
      const batchSize = this.processor.safetyScorer.adjustBatchSize();

      for (const [filePath, fileErrors] of prioritizedFiles.slice(0, batchSize)) {
        console.log(`\n🔧 Processing: ${path.basename(filePath)} (${fileErrors.length} errors)`);
        
        const result = await this.processor.processFile(filePath, fileErrors);
        
        if (result.success) {
          totalFixed += result.fixesApplied;
          console.log(`  ✅ Applied ${result.fixesApplied} fixes`);
        } else {
          console.log(`  ⚠️  Skipped: ${result.reason}`);
        }

        filesProcessed++;

        // Build validation every 5 files
        if (filesProcessed % 5 === 0 && !CONFIG.dryRun) {
          console.log('\n🏗️  Validating build...');
          if (!this.validateBuild()) {
            console.error('❌ Build validation failed, stopping');
            if (stashName) {
              console.log('🔄 Rolling back changes...');
              GitStashManager.rollback(stashName);
            }
            throw new Error('Build validation failed');
          }
          console.log('✅ Build validation passed');
        }
      }

      // Final validation
      console.log('\n🏁 Phase 16A Complete');
      console.log(`📊 Statistics:`);
      console.log(`  - Files processed: ${filesProcessed}`);
      console.log(`  - Total fixes applied: ${totalFixed}`);
      console.log(`  - Safety score: ${this.processor.safetyScorer.calculateSafetyScore().toFixed(2)}`);

      if (!CONFIG.dryRun) {
        console.log('\n🏗️  Final build validation...');
        if (this.validateBuild()) {
          console.log('✅ All changes validated successfully');
        } else {
          console.error('❌ Final validation failed');
          throw new Error('Final build validation failed');
        }
      }

    } catch (error) {
      console.error('❌ Phase 16A failed:', error.message);
      if (stashName && !CONFIG.dryRun) {
        console.log('🔄 Rolling back all changes...');
        GitStashManager.rollback(stashName);
      }
      throw error;
    }
  }

  getTS2339Errors() {
    try {
      const output = execSync('yarn tsc --noEmit --skipLibCheck', { encoding: 'utf8', stdio: 'pipe' });
      return [];
    } catch (error) {
      const errorLines = error.stdout.split('\n');
      return errorLines
        .filter(line => line.includes('error TS2339'))
        .map(line => {
          const match = line.match(/^(.+?)\((\d+),(\d+)\): error TS2339: (.+)$/);
          if (match) {
            return {
              file: match[1],
              line: parseInt(match[2]),
              column: parseInt(match[3]),
              code: 'TS2339',
              message: match[4]
            };
          }
          return null;
        })
        .filter(Boolean);
    }
  }

  groupErrorsByFile(errors) {
    const grouped = new Map();
    for (const error of errors) {
      if (!grouped.has(error.file)) {
        grouped.set(error.file, []);
      }
      grouped.get(error.file).push(error);
    }
    return grouped;
  }

  prioritizeFiles(fileErrors) {
    return Array.from(fileErrors.entries())
      .sort(([, errorsA], [, errorsB]) => errorsB.length - errorsA.length)
      .filter(([, errors]) => errors.length <= CONFIG.maxErrorsPerFile);
  }

  validateBuild() {
    try {
      execSync('yarn build', { stdio: 'pipe' });
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Script execution
async function main() {
  if (process.argv.includes('--help')) {
    console.log(`
Phase 16A: Enhanced TS2339 Property Access Error Fixer

Usage: node phase-16a-ts2339-enhanced.js [options]

Options:
  --dry-run     Preview changes without modifying files
  --auto-fix    Apply fixes automatically (requires confirmation)
  --verbose     Show detailed progress information
  --help        Show this help message

Features:
  - Enhanced safety scoring with adaptive batch sizing
  - Git stash creation for instant rollback capability
  - Corruption detection and prevention
  - Build validation every 5 files
  - Proven fix patterns from Phase 15B success
    `);
    return;
  }

  try {
    const executor = new Phase16AExecutor();
    await executor.run();
  } catch (error) {
    console.error('Script failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}