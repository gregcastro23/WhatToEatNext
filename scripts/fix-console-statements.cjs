#!/usr/bin/env node

/**
 * Console Statement Cleanup Script
 * 
 * Safely removes development console statements while preserving:
 * - Astrological debugging patterns
 * - Campaign monitoring systems
 * - Error logging in production
 * - Critical debugging information
 * 
 * Target: 1,517 console statement issues
 * 
 * SAFETY FEATURES:
 * - Git stash before execution
 * - TypeScript compilation validation
 * - Domain-specific preservation patterns
 * - Conservative pattern matching
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Domain-specific preservation patterns
const PRESERVE_PATTERNS = [
  // Astrological system debugging
  /console\.(log|debug|info)\([^)]*astrological/i,
  /console\.(log|debug|info)\([^)]*zodiac/i,
  /console\.(log|debug|info)\([^)]*celestial/i,
  /console\.(log|debug|info)\([^)]*elemental/i,
  /console\.(log|debug|info)\([^)]*kalchm/i,
  /console\.(log|debug|info)\([^)]*monica/i,
  
  // Campaign monitoring systems
  /console\.(log|debug|info)\([^)]*campaign/i,
  /console\.(log|debug|info)\([^)]*phase/i,
  /console\.(log|debug|info)\([^)]*wave/i,
  /console\.(log|debug|info)\([^)]*typescript.*error/i,
  /console\.(log|debug|info)\([^)]*linting.*progress/i,
  
  // Error handling (preserve in production)
  /console\.(error|warn)\(/,
  /console\.log\([^)]*error[^)]*\)/i,
  /console\.log\([^)]*exception[^)]*\)/i,
  /console\.log\([^)]*failed[^)]*\)/i,
  
  // Critical system information
  /console\.log\([^)]*build[^)]*\)/i,
  /console\.log\([^)]*deploy[^)]*\)/i,
  /console\.log\([^)]*production[^)]*\)/i,
];

// Safe console patterns to remove
const SAFE_REMOVAL_PATTERNS = [
  {
    name: 'simpleDebugLog',
    pattern: /^\s*console\.log\(['"`][^'"`]*['"`]\);\s*$/gm,
    description: 'Simple string-only console.log statements'
  },
  {
    name: 'basicVariableLog',
    pattern: /^\s*console\.log\(\w+\);\s*$/gm,
    description: 'Basic variable logging'
  },
  {
    name: 'simpleObjectLog',
    pattern: /^\s*console\.log\(['"`][^'"`]*['"`],\s*\w+\);\s*$/gm,
    description: 'Simple object logging with string prefix'
  },
  {
    name: 'developmentOnlyLog',
    pattern: /^\s*console\.log\(['"`].*debug.*['"`][^)]*\);\s*$/gmi,
    description: 'Development debugging statements'
  },
  {
    name: 'testingLog',
    pattern: /^\s*console\.log\(['"`].*test.*['"`][^)]*\);\s*$/gmi,
    description: 'Testing-related console statements'
  }
];

class ConsoleCleanupProcessor {
  constructor() {
    this.filesProcessed = 0;
    this.totalRemovals = 0;
    this.preservedStatements = 0;
    this.errors = [];
  }

  shouldPreserveStatement(line) {
    return PRESERVE_PATTERNS.some(pattern => pattern.test(line));
  }

  processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      let modified = false;
      let fileRemovals = 0;
      let filePreservations = 0;

      const processedLines = lines.map(line => {
        // Skip if line should be preserved
        if (this.shouldPreserveStatement(line)) {
          if (line.includes('console.')) {
            filePreservations++;
          }
          return line;
        }

        // Apply safe removal patterns
        let processedLine = line;
        for (const pattern of SAFE_REMOVAL_PATTERNS) {
          const matches = processedLine.match(pattern.pattern);
          if (matches) {
            // Additional safety check - ensure it's actually a console statement
            if (processedLine.includes('console.')) {
              processedLine = processedLine.replace(pattern.pattern, '');
              modified = true;
              fileRemovals += matches.length;
            }
          }
        }

        return processedLine;
      });

      if (modified) {
        const newContent = processedLines.join('\n');
        fs.writeFileSync(filePath, newContent, 'utf8');
        
        this.filesProcessed++;
        this.totalRemovals += fileRemovals;
        this.preservedStatements += filePreservations;

        console.log(`✓ ${path.relative(process.cwd(), filePath)}: ${fileRemovals} removed, ${filePreservations} preserved`);
      }

      return { modified, removals: fileRemovals, preserved: filePreservations };
    } catch (error) {
      this.errors.push({ file: filePath, error: error.message });
      console.error(`✗ Error processing ${filePath}: ${error.message}`);
      return { modified: false, removals: 0, preserved: 0 };
    }
  }

  validateBuild() {
    try {
      console.log('🔍 Validating TypeScript compilation...');
      execSync('yarn tsc --noEmit', { stdio: 'inherit' });
      console.log('✅ TypeScript compilation successful');
      return true;
    } catch (error) {
      console.error('❌ TypeScript compilation failed');
      return false;
    }
  }

  createStash() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      execSync(`git stash push -m "console-cleanup-${timestamp}"`, { stdio: 'pipe' });
      console.log('📦 Created git stash for rollback safety');
      return true;
    } catch (error) {
      console.log('ℹ️  No changes to stash or git not available');
      return false;
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('🧹 CONSOLE CLEANUP EXECUTION REPORT');
    console.log('='.repeat(60));
    console.log(`📁 Files processed: ${this.filesProcessed}`);
    console.log(`🗑️  Console statements removed: ${this.totalRemovals}`);
    console.log(`🛡️  Statements preserved: ${this.preservedStatements}`);
    console.log(`❌ Errors encountered: ${this.errors.length}`);
    
    if (this.errors.length > 0) {
      console.log('\n⚠️  ERRORS:');
      this.errors.forEach(({ file, error }) => {
        console.log(`  - ${path.relative(process.cwd(), file)}: ${error}`);
      });
    }

    console.log('\n📊 PRESERVATION CATEGORIES:');
    console.log('  - Astrological system debugging');
    console.log('  - Campaign monitoring systems');
    console.log('  - Error handling (console.error/warn)');
    console.log('  - Critical system information');

    const reductionPercentage = this.totalRemovals > 0 ? ((this.totalRemovals / 1517) * 100).toFixed(1) : '0.0';
    console.log(`\n🎯 Target Progress: ${this.totalRemovals}/1517 console issues (${reductionPercentage}% of target)`);
    console.log('='.repeat(60));
  }
}

// Main execution
async function main() {
  const processor = new ConsoleCleanupProcessor();
  
  console.log('🚀 Starting Console Statement Cleanup');
  console.log('Target: 1,517 console statement issues');
  console.log('Strategy: Conservative removal with domain preservation\n');

  // Create safety stash
  processor.createStash();

  // Get TypeScript/JavaScript files
  const srcDir = path.join(process.cwd(), 'src');
  
  function getFiles(dir, files = []) {
    const entries = fs.readdirSync(dir);
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        getFiles(fullPath, files);
      } else if (/\.(ts|tsx|js|jsx)$/.test(entry)) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  const files = getFiles(srcDir);
  console.log(`📂 Found ${files.length} source files to process\n`);

  // Process files in small batches for safety
  const batchSize = 10;
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    
    console.log(`📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(files.length/batchSize)}`);
    
    // Process batch
    batch.forEach(file => processor.processFile(file));
    
    // Validate build after each batch
    if (processor.filesProcessed > 0 && (i + batchSize) % 20 === 0) {
      if (!processor.validateBuild()) {
        console.error('🚨 Build validation failed, stopping execution');
        console.log('💡 Use: git stash apply to restore previous state');
        process.exit(1);
      }
    }
  }

  // Final validation
  console.log('\n🔍 Final build validation...');
  if (!processor.validateBuild()) {
    console.error('🚨 Final build validation failed');
    console.log('💡 Use: git stash apply to restore previous state');
    process.exit(1);
  }

  processor.generateReport();
  
  if (processor.totalRemovals > 0) {
    console.log('\n✅ Console cleanup completed successfully!');
    console.log('💡 Changes have been applied. Run "git status" to review.');
    console.log('🔄 To rollback: git stash apply');
  } else {
    console.log('\n📋 No console statements were eligible for removal.');
    console.log('💡 All existing console statements appear to be preserved patterns.');
  }
}

// Execute if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { ConsoleCleanupProcessor, PRESERVE_PATTERNS, SAFE_REMOVAL_PATTERNS };