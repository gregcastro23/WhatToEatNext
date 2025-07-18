#!/usr/bin/env node

/**
 * Simple TS2339 Property Access Error Fixer
 * Phase 3.10: Enterprise Intelligence Integration Phase
 * 
 * Focuses on the most common TS2339 patterns with proven safe fixes.
 * 
 * Usage:
 *   node scripts/typescript-fixes/fix-ts2339-simple.js --dry-run
 *   node scripts/typescript-fixes/fix-ts2339-simple.js --max-files=5
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const MAX_FILES = parseInt(process.argv.find(arg => arg.startsWith('--max-files='))?.split('=')[1] || '5');
const ROOT_DIR = process.cwd();

console.log('🔧 Simple TS2339 Property Access Error Fixer');
console.log('🎯 Phase 3.10: Enterprise Intelligence Integration Phase');

// Get current TS2339 error count
function getTS2339ErrorCount() {
  try {
    const result = execSync('yarn tsc --noEmit --skipLibCheck 2>&1', { encoding: 'utf8' });
    const errors = result.split('\n').filter(line => line.includes('error TS2339'));
    return errors.length;
  } catch (error) {
    console.log('Error getting TS2339 count:', error.message);
    return 0;
  }
}

// Get TS2339 errors with file paths
function getTS2339Errors() {
  try {
    const result = execSync('yarn tsc --noEmit --skipLibCheck 2>&1', { encoding: 'utf8' });
    const lines = result.split('\n');
    const errors = [];
    let currentError = '';
    
    for (const line of lines) {
      if (line.includes('error TS2339')) {
        if (currentError) {
          errors.push(currentError);
        }
        currentError = line;
      } else if (currentError && line.trim()) {
        // This is a continuation of the previous error
        currentError += line;
      }
    }
    
    if (currentError) {
      errors.push(currentError);
    }
    
    return errors;
  } catch (error) {
    return [];
  }
}

// Parse error line to extract file, line number, and message
function parseError(errorLine) {
  const match = errorLine.match(/^([^(]+)\((\d+),(\d+)\):\s*error TS2339:\s*(.+)$/);
  if (match) {
    return {
      file: match[1],
      line: parseInt(match[2]),
      column: parseInt(match[3]),
      message: match[4]
    };
  }
  return null;
}

// Apply fixes to a line
function fixTS2339Line(line, error) {
  let fixedLine = line;
  
  // Pattern 1: Remove unnecessary "as string" casting
  if (error.message.includes("Property does not exist on type 'string'")) {
    // Find and replace patterns like ((variable as string).property)
    const propertyMatch = error.message.match(/Property '([^']+)' does not exist on type 'string'/);
    if (propertyMatch) {
      const propertyName = propertyMatch[1];
      
      // Look for the pattern: ((variable as string).property)
      const pattern = new RegExp(`\\(\\(([^)]+)\\s+as\\s+string\\)\\.${propertyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'g');
      const replacement = `($1?.${propertyName})`;
      
      if (pattern.test(line)) {
        fixedLine = line.replace(pattern, replacement);
      }
    }
  }
  
  // Pattern 2: Add optional chaining for unknown types
  if (error.message.includes("Property does not exist on type 'unknown'")) {
    const propertyMatch = error.message.match(/Property '([^']+)' does not exist on type 'unknown'/);
    if (propertyMatch) {
      const propertyName = propertyMatch[1];
      const pattern = new RegExp(`\\.${propertyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
      const replacement = `?.${propertyName}`;
      
      if (pattern.test(line)) {
        fixedLine = line.replace(pattern, replacement);
      }
    }
  }
  
  // Pattern 3: Add optional chaining for object literals
  if (error.message.includes("Property does not exist on type '{")) {
    const propertyMatch = error.message.match(/Property '([^']+)' does not exist on type/);
    if (propertyMatch) {
      const propertyName = propertyMatch[1];
      const pattern = new RegExp(`\\.${propertyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
      const replacement = `?.${propertyName}`;
      
      if (pattern.test(line)) {
        fixedLine = line.replace(pattern, replacement);
      }
    }
  }
  
  return fixedLine;
}

// Process a single file
function processFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return 0;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let fixesApplied = 0;
  
  // Get all TS2339 errors for this file
  const errors = getTS2339Errors()
    .map(parseError)
    .filter(error => error && error.file === filePath)
    .sort((a, b) => b.line - a.line); // Process from bottom to top
  
  for (const error of errors) {
    const lineIndex = error.line - 1;
    if (lineIndex >= 0 && lineIndex < lines.length) {
      const originalLine = lines[lineIndex];
      const fixedLine = fixTS2339Line(originalLine, error);
      
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
  
  if (!DRY_RUN && fixesApplied > 0) {
    fs.writeFileSync(filePath, lines.join('\n'));
  }
  
  return fixesApplied;
}

// Main execution
async function main() {
  const initialErrorCount = getTS2339ErrorCount();
  console.log(`📊 Current TS2339 error count: ${initialErrorCount}`);
  
  if (DRY_RUN) {
    console.log('🏃 DRY RUN MODE - No files will be modified');
  }
  
  const errors = getTS2339Errors();
  console.log(`Debug: Found ${errors.length} raw error lines`);
  if (errors.length > 0) {
    console.log(`Debug: First error: ${errors[0]}`);
  }
  const filesWithErrors = [...new Set(errors.map(parseError).filter(e => e).map(e => e.file))];
  
  console.log(`📁 Found ${errors.length} TS2339 errors in ${filesWithErrors.length} files`);
  console.log(`🔄 Processing ${Math.min(MAX_FILES, filesWithErrors.length)} files`);
  
  let totalFixes = 0;
  let filesProcessed = 0;
  
  for (const filePath of filesWithErrors.slice(0, MAX_FILES)) {
    const fixes = processFile(filePath);
    totalFixes += fixes;
    filesProcessed++;
    
    if (!DRY_RUN && fixes > 0) {
      console.log(`✅ Fixed ${fixes} errors in ${filePath}`);
    }
  }
  
  if (!DRY_RUN) {
    const finalErrorCount = getTS2339ErrorCount();
    console.log(`\n🎉 Simple TS2339 Property Access Error Fixer completed successfully!`);
    console.log(`📊 Total fixes applied: ${totalFixes}`);
    console.log(`📊 Files processed: ${filesProcessed}`);
    console.log(`📊 Final TS2339 error count: ${finalErrorCount}`);
    console.log(`📊 Error reduction: ${initialErrorCount - finalErrorCount}`);
  } else {
    console.log(`\n🎉 Simple TS2339 Property Access Error Fixer completed successfully!`);
    console.log(`📊 Total fixes that would be applied: ${totalFixes}`);
    console.log(`📊 Files that would be processed: ${filesProcessed}`);
  }
}

main().catch(console.error); 