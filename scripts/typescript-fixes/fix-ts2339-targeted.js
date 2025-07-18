#!/usr/bin/env node

/**
 * TS2339 Targeted Property Access Error Fixer
 * Phase 3.10: Enterprise Intelligence Integration Phase
 * 
 * Analyzes actual TS2339 error messages and applies precise fixes
 * only where the errors actually occur.
 * 
 * Usage:
 *   node scripts/typescript-fixes/fix-ts2339-targeted.js --dry-run
 *   node scripts/typescript-fixes/fix-ts2339-targeted.js --max-files=5
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const MAX_FILES = parseInt(process.argv.find(arg => arg.startsWith('--max-files='))?.split('=')[1] || '5');
const ROOT_DIR = process.cwd();

console.log('🔧 TS2339 Targeted Property Access Error Fixer');
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
      const stashMessage = `ts2339-targeted-fix-${new Date().toISOString()}`;
      execSync(`git stash push -m "${stashMessage}"`, { stdio: 'pipe' });
      console.log('💾 Created git stash for rollback');
    }

    // Get actual TS2339 errors with line numbers
    const ts2339Errors = getTS2339ErrorsWithDetails();
    console.log(`📁 Found ${ts2339Errors.length} TS2339 errors`);

    // Group errors by file
    const fileErrors = groupErrorsByFile(ts2339Errors);
    const filesToProcess = Object.keys(fileErrors).slice(0, MAX_FILES);
    
    console.log(`🔄 Processing ${filesToProcess.length} files`);

    let totalFixed = 0;

    for (const filePath of filesToProcess) {
      try {
        const result = await processTS2339File(filePath, fileErrors[filePath]);
        if (result.success) {
          totalFixed += result.fixesApplied;
        }
      } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
      }
    }

    console.log('\n🎉 TS2339 Targeted Property Access Error Fixer completed successfully!');
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

function getTS2339ErrorsWithDetails() {
  try {
    const result = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -E "error TS2339"', { encoding: 'utf8' });
    const lines = result.trim().split('\n');
    const errors = [];
    
    for (const line of lines) {
      const match = line.match(/^(.+?)\((\d+),(\d+)\):\s+error\s+TS2339:\s*(.+)$/);
      if (match) {
        const [, filePath, lineNum, colNum, message] = match;
        errors.push({
          filePath: path.resolve(filePath),
          line: parseInt(lineNum),
          column: parseInt(colNum),
          message: message.trim()
        });
      }
    }
    
    return errors;
  } catch (error) {
    return [];
  }
}

function groupErrorsByFile(errors) {
  const fileErrors = {};
  
  for (const error of errors) {
    if (!fileErrors[error.filePath]) {
      fileErrors[error.filePath] = [];
    }
    fileErrors[error.filePath].push(error);
  }
  
  return fileErrors;
}

async function processTS2339File(filePath, errors) {
  if (!fs.existsSync(filePath)) {
    return { success: false, error: 'File not found' };
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let fixesApplied = 0;

    // Sort errors by line number (descending) to avoid line number shifts
    const sortedErrors = errors.sort((a, b) => b.line - a.line);

    for (const error of sortedErrors) {
      const lineIndex = error.line - 1; // Convert to 0-based index
      if (lineIndex >= 0 && lineIndex < lines.length) {
        const originalLine = lines[lineIndex];
        const fixedLine = fixTS2339Line(originalLine, error);
        
        if (DRY_RUN) {
          console.log(`Checking line ${error.line} in ${filePath}:`);
          console.log(`  Message: ${error.message}`);
          console.log(`  Line: ${originalLine.trim()}`);
          console.log(`  Fixed: ${fixedLine.trim()}`);
          console.log(`  Changed: ${fixedLine !== originalLine}`);
        }
        
        if (fixedLine !== originalLine) {
          if (DRY_RUN) {
            console.log(`Would fix line ${error.line} in ${filePath}:`);
            console.log(`  Before: ${originalLine.trim()}`);
            console.log(`  After:  ${fixedLine.trim()}`);
          } else {
            lines[lineIndex] = fixedLine;
            fixesApplied++;
          }
        }
      }
    }

    // Write changes
    if (fixesApplied > 0 && !DRY_RUN) {
      const newContent = lines.join('\n');
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ Fixed ${filePath}: ${fixesApplied} TS2339 errors`);
    }

    return { success: true, fixesApplied };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

function fixTS2339Line(line, error) {
  const { message, column } = error;
  
  // Extract property name from error message
  const propertyMatch = message.match(/Property '([^']+)' does not exist on type/);
  if (!propertyMatch) {
    return line;
  }
  
  const propertyName = propertyMatch[1];
  
  // Pattern 1: Property does not exist on type 'string'
  if (message.includes("Property does not exist on type 'string'")) {
    // This is likely unnecessary type casting - remove the cast
    const searchPattern = `((`; // Start of double parentheses
    const endPattern = ` as string).${propertyName}`;
    
    if (DRY_RUN) {
      console.log(`    Debug: line.includes('(('): ${line.includes(searchPattern)}`);
      console.log(`    Debug: line.includes(' as string).${propertyName}'): ${line.includes(endPattern)}`);
    }
    
    if (line.includes(searchPattern) && line.includes(endPattern)) {
      // Find the variable name between the parentheses
      const startIndex = line.indexOf(searchPattern) + 2;
      const endIndex = line.indexOf(' as string');
      if (startIndex > 1 && endIndex > startIndex) {
        const variableName = line.substring(startIndex, endIndex);
        const oldPattern = `((${variableName} as string).${propertyName}`;
        const newPattern = `(${variableName}?.${propertyName}`;
        
        if (DRY_RUN) {
          console.log(`    Debug: variableName: ${variableName}`);
          console.log(`    Debug: oldPattern: ${oldPattern}`);
          console.log(`    Debug: newPattern: ${newPattern}`);
          console.log(`    Debug: line.includes(oldPattern): ${line.includes(oldPattern)}`);
        }
        
        return line.replace(oldPattern, newPattern);
      }
    }
  }
  
  // Pattern 2: Property does not exist on type '{ ... }'
  if (message.includes("Property does not exist on type '{")) {
    // Object literal type mismatch - add optional chaining
    return line.replace(
      new RegExp(`\\.${propertyName}\\b`, 'g'),
      `?.${propertyName}`
    );
  }
  
  // Pattern 3: Property does not exist on type 'unknown'
  if (message.includes("Property does not exist on type 'unknown'")) {
    return line.replace(
      new RegExp(`\\.${propertyName}\\b`, 'g'),
      `?.${propertyName}`
    );
  }
  
  // Pattern 4: Property does not exist on type 'any'
  if (message.includes("Property does not exist on type 'any'")) {
    return line.replace(
      new RegExp(`\\.${propertyName}\\b`, 'g'),
      `?.${propertyName}`
    );
  }
  
  // Pattern 5: Property does not exist on type 'object'
  if (message.includes("Property does not exist on type 'object'")) {
    return line.replace(
      new RegExp(`\\.${propertyName}\\b`, 'g'),
      `?.${propertyName}`
    );
  }
  
  // Pattern 6: Property does not exist on type 'never'
  if (message.includes("Property does not exist on type 'never'")) {
    return line.replace(
      new RegExp(`\\.${propertyName}\\b`, 'g'),
      `?.${propertyName}`
    );
  }
  
  // Pattern 7: Property does not exist on specific interface/type
  if (message.includes("Property does not exist on type '") && !message.includes("'unknown'") && !message.includes("'any'") && !message.includes("'object'") && !message.includes("'never'") && !message.includes("'string'") && !message.includes("'{")) {
    // This is likely a missing property on a specific type - add optional chaining
    return line.replace(
      new RegExp(`\\.${propertyName}\\b`, 'g'),
      `?.${propertyName}`
    );
  }
  
  return line;
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

// Run main function
main().catch(console.error); 