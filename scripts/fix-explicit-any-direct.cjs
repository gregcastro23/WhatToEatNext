#!/usr/bin/env node

/**
 * Direct Explicit-Any Type Elimination Script
 *
 * Directly processes files with explicit any types and replaces them
 * with more appropriate TypeScript types.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DirectAnyEliminator {
  constructor() {
    this.fixedFiles = [];
    this.dryRun = process.argv.includes('--dry-run');
    this.verbose = process.argv.includes('--verbose');
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : '✅';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  findFilesWithAnyTypes() {
    this.log('🔍 Finding files with explicit any types...');

    try {
      const grepOutput = execSync('grep -r ": any" src --include="*.ts" --include="*.tsx" -l', {
        encoding: 'utf8',
        stdio: 'pipe',
      });

      const files = grepOutput
        .trim()
        .split('\n')
        .filter(f => f.length > 0);
      this.log(`Found ${files.length} files with explicit any types`);
      return files;
    } catch (error) {
      this.log('No files with explicit any types found');
      return [];
    }
  }

  shouldPreserveAnyInFile(filePath) {
    // Preserve any types in astronomical integrations
    const astronomicalPatterns = [
      'astronomy',
      'ephemeris',
      'planetary',
      'celestial',
      'astrological',
      'swiss-ephemeris',
      'astronomia',
    ];

    const fileName = path.basename(filePath).toLowerCase();
    const dirPath = path.dirname(filePath).toLowerCase();

    return astronomicalPatterns.some(
      pattern => fileName.includes(pattern) || dirPath.includes(pattern),
    );
  }

  fixExplicitAnyTypes(content, filePath) {
    let fixed = false;
    let newContent = content;
    const appliedFixes = [];

    // Skip if this file should preserve astronomical any types
    if (this.shouldPreserveAnyInFile(filePath)) {
      if (this.verbose) {
        this.log(`  Preserving astronomical any types in ${path.basename(filePath)}`);
      }
      return { content: newContent, fixed: false, appliedFixes: [] };
    }

    // Count initial any occurrences
    const initialAnyCount = (content.match(/:\s*any[^a-zA-Z]/g) || []).length;

    // Common any type replacements
    const anyReplacements = [
      // Function parameters
      {
        from: /\(([^)]*?):\s*any\)/g,
        to: '($1: unknown)',
        description: 'Function parameters any → unknown',
      },

      // Variable declarations
      {
        from: /:\s*any(\s*[=;,\n])/g,
        to: ': unknown$1',
        description: 'Variable declarations any → unknown',
      },

      // Array types
      {
        from: /:\s*any\[\]/g,
        to: ': unknown[]',
        description: 'Array types any[] → unknown[]',
      },

      // Promise types
      {
        from: /Promise<any>/g,
        to: 'Promise<unknown>',
        description: 'Promise<any> → Promise<unknown>',
      },

      // Record types
      {
        from: /Record<string,\s*any>/g,
        to: 'Record<string, unknown>',
        description: 'Record<string, any> → Record<string, unknown>',
      },

      // Generic constraints
      {
        from: /<([^>]*?):\s*any>/g,
        to: '<$1: unknown>',
        description: 'Generic constraints any → unknown',
      },

      // Return types
      {
        from: /\):\s*any(\s*{)/g,
        to: '): unknown$1',
        description: 'Return types any → unknown',
      },
    ];

    // Apply replacements
    anyReplacements.forEach(replacement => {
      const beforeCount = (newContent.match(replacement.from) || []).length;
      if (beforeCount > 0) {
        newContent = newContent.replace(replacement.from, replacement.to);
        fixed = true;
        appliedFixes.push(`${replacement.description} (${beforeCount} occurrences)`);
      }
    });

    // Context-specific replacements
    if (filePath.includes('test') || filePath.includes('spec')) {
      // Test-specific any replacements
      const testReplacements = [
        {
          from: /jest\.fn\(\):\s*any/g,
          to: 'jest.fn(): jest.MockedFunction<any>',
          description: 'Jest mock function types',
        },
      ];

      testReplacements.forEach(replacement => {
        const beforeCount = (newContent.match(replacement.from) || []).length;
        if (beforeCount > 0) {
          newContent = newContent.replace(replacement.from, replacement.to);
          fixed = true;
          appliedFixes.push(`${replacement.description} (${beforeCount} occurrences)`);
        }
      });
    }

    // Service-specific replacements
    if (filePath.includes('services/')) {
      const serviceReplacements = [
        {
          from: /callback:\s*\(data:\s*any\)\s*=>\s*void/g,
          to: 'callback: (data: unknown) => void',
          description: 'Service callback types',
        },
        {
          from: /config:\s*any/g,
          to: 'config: Record<string, unknown>',
          description: 'Service config types',
        },
      ];

      serviceReplacements.forEach(replacement => {
        const beforeCount = (newContent.match(replacement.from) || []).length;
        if (beforeCount > 0) {
          newContent = newContent.replace(replacement.from, replacement.to);
          fixed = true;
          appliedFixes.push(`${replacement.description} (${beforeCount} occurrences)`);
        }
      });
    }

    const finalAnyCount = (newContent.match(/:\s*any[^a-zA-Z]/g) || []).length;
    const reducedCount = initialAnyCount - finalAnyCount;

    if (this.verbose && appliedFixes.length > 0) {
      this.log(
        `  Fixed in ${path.basename(filePath)}: ${appliedFixes.join(', ')} (${reducedCount} any types eliminated)`,
      );
    }

    return { content: newContent, fixed, appliedFixes, reducedCount };
  }

  async fixFile(filePath) {
    try {
      const originalContent = fs.readFileSync(filePath, 'utf8');
      const result = this.fixExplicitAnyTypes(originalContent, filePath);

      if (result.fixed) {
        if (!this.dryRun) {
          fs.writeFileSync(filePath, result.content, 'utf8');
        }

        this.fixedFiles.push({
          path: filePath,
          fixes: result.appliedFixes,
          reducedCount: result.reducedCount || 0,
        });

        this.log(
          `${this.dryRun ? '[DRY RUN] ' : ''}Fixed explicit-any types in ${path.basename(filePath)}`,
        );
        return true;
      }

      return false;
    } catch (error) {
      this.log(`Error fixing ${filePath}: ${error.message}`, 'error');
      return false;
    }
  }

  async validateFixes() {
    this.log('🔍 Validating fixes...');

    try {
      const afterCount = execSync(
        'grep -r ": any" src --include="*.ts" --include="*.tsx" | wc -l',
        {
          encoding: 'utf8',
          stdio: 'pipe',
        },
      );

      const remainingAnyTypes = parseInt(afterCount.trim()) || 0;
      this.log(`Validation: ${remainingAnyTypes} explicit any types remaining`);

      return { remainingAnyTypes };
    } catch (error) {
      this.log(`Validation error: ${error.message}`, 'error');
      return { remainingAnyTypes: -1 };
    }
  }

  async run() {
    this.log('🚀 Starting Direct Explicit-Any Type Elimination (Phase 9.3)');
    this.log(`Mode: ${this.dryRun ? 'DRY RUN' : 'LIVE EXECUTION'}`);

    // Get initial count
    let initialCount = 0;
    try {
      const beforeOutput = execSync(
        'grep -r ": any" src --include="*.ts" --include="*.tsx" | wc -l',
        {
          encoding: 'utf8',
          stdio: 'pipe',
        },
      );
      initialCount = parseInt(beforeOutput.trim()) || 0;
    } catch (error) {
      initialCount = 0;
    }

    this.log(`Initial explicit any types: ${initialCount}`);

    if (initialCount === 0) {
      this.log('✅ No explicit-any types found!');
      return;
    }

    // Find files with any types
    const filesWithAny = this.findFilesWithAnyTypes();

    if (filesWithAny.length === 0) {
      this.log('✅ No files with explicit-any types found!');
      return;
    }

    // Process files (limit to top 50 for this run)
    const filesToProcess = filesWithAny.slice(0, 50);
    this.log(`🔧 Processing ${filesToProcess.length} files...`);

    let fixedCount = 0;
    let totalReduced = 0;

    for (const filePath of filesToProcess) {
      if (fs.existsSync(filePath)) {
        const wasFixed = await this.fixFile(filePath);
        if (wasFixed) {
          fixedCount++;
          const fileInfo = this.fixedFiles[this.fixedFiles.length - 1];
          totalReduced += fileInfo.reducedCount || 0;
        }
      }
    }

    // Validate fixes
    const validation = await this.validateFixes();
    const finalCount =
      validation.remainingAnyTypes >= 0 ? validation.remainingAnyTypes : initialCount;
    const reduction = initialCount > 0 ? (initialCount - finalCount) / initialCount : 0;

    // Report results
    this.log('\\n📊 Fix Summary:');
    this.log(`   Initial explicit-any types: ${initialCount}`);
    this.log(`   Files processed: ${filesToProcess.length}`);
    this.log(`   Files fixed: ${fixedCount}`);
    this.log(`   Any types eliminated: ${totalReduced}`);

    if (validation.remainingAnyTypes >= 0) {
      this.log(`   Remaining explicit-any types: ${finalCount}`);
      this.log(`   Reduction achieved: ${(reduction * 100).toFixed(1)}%`);

      if (reduction >= 0.5) {
        this.log('🎯 Target 50% reduction achieved!');
      } else {
        this.log(`⚠️  Progress toward 50% target: ${(reduction * 100).toFixed(1)}%`);
      }
    }

    if (this.fixedFiles.length > 0) {
      this.log('\\n✅ Fixed files:');
      this.fixedFiles.slice(0, 10).forEach(file => {
        this.log(`   ${file.path} (${file.reducedCount} any types eliminated)`);
      });

      if (this.fixedFiles.length > 10) {
        this.log(`   ... and ${this.fixedFiles.length - 10} more files`);
      }
    }

    this.log(
      `\\n${this.dryRun ? '🔍 DRY RUN COMPLETE' : '✅ EXPLICIT-ANY TYPE ELIMINATION COMPLETE'}`,
    );

    if (!this.dryRun && reduction >= 0.5) {
      this.log('🎉 Target explicit-any reduction achieved!');
    }
  }
}

// Run the eliminator
if (require.main === module) {
  const eliminator = new DirectAnyEliminator();
  eliminator.run().catch(error => {
    console.error('❌ Critical error:', error);
    process.exit(1);
  });
}

module.exports = DirectAnyEliminator;
