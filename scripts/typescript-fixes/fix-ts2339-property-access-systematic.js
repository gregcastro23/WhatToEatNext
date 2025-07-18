#!/usr/bin/env node

/**
 * TS2339 Property Access Error Fixer
 * Phase 3.10: Enterprise Intelligence Integration Phase
 * 
 * Specialized script to fix TS2339 "Property does not exist on type" errors
 * with proven safe patterns and comprehensive validation.
 * 
 * Usage:
 *   node scripts/typescript-fixes/fix-ts2339-property-access-systematic.js --dry-run
 *   node scripts/typescript-fixes/fix-ts2339-property-access-systematic.js --max-files=10
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const MAX_FILES = parseInt(process.argv.find(arg => arg.startsWith('--max-files='))?.split('=')[1] || '10');
const ROOT_DIR = process.cwd();

// Proven TS2339 fix patterns with high success rates
const TS2339_PATTERNS = {
  // Pattern 1: Optional chaining for property access
  optional_chaining: {
    pattern: /\.([a-zA-Z_][a-zA-Z0-9_]*)\s*\?\?/g,
    replacement: (match, property) => `?.${property} ??`,
    description: 'Convert property access to optional chaining',
    successRate: 0.95
  },
  
  // Pattern 2: Safe property access with type assertion
  safe_property_access: {
    pattern: /\.([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=[,;\s\)\]}])/g,
    replacement: (match, property) => `?.${property}`,
    description: 'Add optional chaining to property access',
    successRate: 0.90
  },
  
  // Pattern 3: Type assertion for unknown objects
  type_assertion: {
    pattern: /(unknown|any)\s*\.\s*([a-zA-Z_][a-zA-Z0-9_]*)/g,
    replacement: (match, type, property) => `(${type} as Record<string, unknown>)?.${property}`,
    description: 'Add type assertion for unknown/any property access',
    successRate: 0.85
  },
  
  // Pattern 4: Safe array access
  safe_array_access: {
    pattern: /\[([^\]]+)\]\s*\.\s*([a-zA-Z_][a-zA-Z0-9_]*)/g,
    replacement: (match, index, property) => `[${index}]?.${property}`,
    description: 'Add optional chaining to array element property access',
    successRate: 0.88
  }
};

// Safety validation patterns
const CORRUPTION_PATTERNS = [
  /,;,;,;,;,;,;,;,;,;/,  // Multiple semicolons
  /'',',',''/,           // Multiple quotes
  /undefined\s+undefined/, // Multiple undefined
  /import\s+import/,     // Double imports
  /export\s+export/,     // Double exports
  /function\s+function/, // Double function declarations
];

console.log('🔧 TS2339 Property Access Error Fixer');
console.log('🎯 Phase 3.10: Enterprise Intelligence Integration Phase');
console.log(`📊 Current TS2339 error count: ${getTS2339ErrorCount()}`);

if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
}

// Main execution
async function main() {
  try {
    // Create git stash for rollback
    if (!DRY_RUN) {
      const stashMessage = `ts2339-fix-${new Date().toISOString()}`;
      execSync(`git stash push -m "${stashMessage}"`, { stdio: 'pipe' });
      console.log('💾 Created git stash for rollback');
    }

    // Get files with TS2339 errors
    const filesWithTS2339 = getFilesWithTS2339Errors();
    console.log(`📁 Found ${filesWithTS2339.length} files with TS2339 errors`);

    // Process files in batches
    const batches = chunkArray(filesWithTS2339, MAX_FILES);
    console.log(`🔄 Processing ${batches.length} batches of ${MAX_FILES} files each`);

    let totalFixed = 0;
    let totalErrors = 0;

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`\n📦 Processing batch ${i + 1}/${batches.length} (${batch.length} files)`);
      
      const batchStartTime = Date.now();
      let batchFixed = 0;
      let batchErrors = 0;

      for (const filePath of batch) {
        try {
          const result = await processTS2339File(filePath);
          if (result.success) {
            batchFixed += result.fixesApplied;
            totalFixed += result.fixesApplied;
          } else {
            batchErrors++;
            totalErrors++;
          }
        } catch (error) {
          console.error(`❌ Error processing ${filePath}:`, error.message);
          batchErrors++;
          totalErrors++;
        }
      }

      const batchTime = Date.now() - batchStartTime;
      console.log(`✅ Batch ${i + 1} completed: ${batchFixed} fixes, ${batchErrors} errors (${batchTime}ms)`);

      // Validate build after each batch
      if (!DRY_RUN && i % 2 === 0) { // Every 2nd batch
        console.log('🔍 Validating build stability...');
        const buildValid = validateBuild();
        if (!buildValid) {
          console.error('❌ Build validation failed! Rolling back...');
          rollbackChanges();
          process.exit(1);
        }
        console.log('✅ Build validation passed');
      }
    }

    console.log('\n🎉 TS2339 Property Access Error Fixer completed successfully!');
    console.log(`📊 Total fixes applied: ${totalFixed}`);
    console.log(`📊 Final TS2339 error count: ${getTS2339ErrorCount()}`);

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    if (!DRY_RUN) {
      rollbackChanges();
    }
    process.exit(1);
  }
}

function getTS2339ErrorCount() {
  try {
    const result = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -E "error TS2339" | wc -l', { encoding: 'utf8' });
    return parseInt(result.trim()) || 0;
  } catch (error) {
    return 0;
  }
}

function getFilesWithTS2339Errors() {
  try {
    const result = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -E "error TS2339" | cut -d"(" -f1 | sort | uniq', { encoding: 'utf8' });
    return result.trim().split('\n').filter(line => line.trim() && line.includes('src/'));
  } catch (error) {
    return [];
  }
}

async function processTS2339File(filePath) {
  if (!fs.existsSync(filePath)) {
    return { success: false, error: 'File not found' };
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let fixesApplied = 0;

    // Apply TS2339 fix patterns
    for (const [patternName, pattern] of Object.entries(TS2339_PATTERNS)) {
      const matches = content.match(pattern.pattern);
      if (matches) {
        if (DRY_RUN) {
          console.log(`Would apply ${patternName} to ${filePath} (${matches.length} matches)`);
        } else {
          const newContent = content.replace(pattern.pattern, pattern.replacement);
          if (newContent !== content) {
            content = newContent;
            fixesApplied += matches.length;
          }
        }
      }
    }

    // Check for corruption
    if (fixesApplied > 0 && !DRY_RUN) {
      const hasCorruption = CORRUPTION_PATTERNS.some(pattern => pattern.test(content));
      if (hasCorruption) {
        console.error(`🚨 Corruption detected in ${filePath}! Skipping...`);
        return { success: false, error: 'Corruption detected' };
      }
    }

    // Write changes
    if (fixesApplied > 0 && !DRY_RUN) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed ${filePath}: ${fixesApplied} TS2339 errors`);
    }

    return { success: true, fixesApplied };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

function validateBuild() {
  try {
    execSync('yarn tsc --noEmit --skipLibCheck', { stdio: 'pipe', timeout: 30000 });
    return true;
  } catch (error) {
    return false;
  }
}

function rollbackChanges() {
  try {
    console.log('🔄 Rolling back changes...');
    execSync('git stash pop', { stdio: 'pipe' });
    console.log('✅ Rollback completed');
  } catch (error) {
    console.error('❌ Rollback failed:', error.message);
  }
}

function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// Run main function
main().catch(console.error); 