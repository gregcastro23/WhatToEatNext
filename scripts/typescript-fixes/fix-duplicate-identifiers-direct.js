#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const isDryRun = !process.argv.includes('--execute');

console.log(`🔧 Direct Duplicate Identifier Resolution Script (dry-run: ${isDryRun})`);

// Get TypeScript errors and filter for duplicate identifier issues
function getDuplicateErrors() {
  console.log('📊 Collecting duplicate identifier errors...');
  
  try {
    const result = execSync('yarn tsc --noEmit', { 
      encoding: 'utf8', 
      cwd: process.cwd(),
      stdio: 'pipe'
    });
    return [];
  } catch (error) {
    const output = error.stdout || error.stderr || '';
    const lines = output.split('\n');
    
    const duplicateErrors = lines.filter(line => {
      return line.includes('error TS2300') && line.includes('Duplicate identifier');
    });
    
    console.log(`📈 Found ${duplicateErrors.length} duplicate identifier errors`);
    return duplicateErrors;
  }
}

// Parse error information
function parseError(errorLine) {
  const match = errorLine.match(/^(.+?)\((\d+),(\d+)\): error (TS\d+): (.+)$/);
  if (!match) return null;
  
  const [, filePath, line, col, errorCode, message] = match;
  return {
    filePath: filePath.trim(),
    line: parseInt(line),
    col: parseInt(col),
    errorCode,
    message: message.trim()
  };
}

// Fix patterns for duplicate identifier issues
const fixPatterns = [
  {
    name: 'Remove duplicate import lines',
    pattern: /Duplicate identifier '(.+)'/,
    fix: (error, content) => {
      const identifierMatch = error.message.match(/Duplicate identifier '(.+)'/);
      if (!identifierMatch) return null;
      
      const duplicateIdentifier = identifierMatch[1];
      const lines = content.split('\n');
      
      // Find import lines with this identifier
      const importLines = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('import') && line.includes(duplicateIdentifier)) {
          importLines.push({ index: i, line: line.trim() });
        }
      }
      
      // If we have multiple imports of the same identifier, remove duplicates
      if (importLines.length > 1) {
        // Keep the first import, remove the rest
        for (let i = 1; i < importLines.length; i++) {
          lines[importLines[i].index] = '';
        }
        return lines.join('\n');
      }
      
      return null;
    }
  },
  {
    name: 'Remove duplicate type declarations',
    pattern: /Duplicate identifier '(.+)'/,
    fix: (error, content) => {
      const identifierMatch = error.message.match(/Duplicate identifier '(.+)'/);
      if (!identifierMatch) return null;
      
      const duplicateIdentifier = identifierMatch[1];
      const lines = content.split('\n');
      
      // Find type/interface declarations with this identifier
      const declarationLines = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if ((line.includes('type ') || line.includes('interface ') || line.includes('export type ') || line.includes('export interface ')) 
            && line.includes(duplicateIdentifier)) {
          declarationLines.push({ index: i, line: line.trim() });
        }
      }
      
      // If we have multiple declarations, remove duplicates (keep the first)
      if (declarationLines.length > 1) {
        for (let i = 1; i < declarationLines.length; i++) {
          lines[declarationLines[i].index] = '';
        }
        return lines.join('\n');
      }
      
      return null;
    }
  },
  {
    name: 'Consolidate duplicate exports',
    pattern: /Duplicate identifier '(.+)'/,
    fix: (error, content) => {
      const identifierMatch = error.message.match(/Duplicate identifier '(.+)'/);
      if (!identifierMatch) return null;
      
      const duplicateIdentifier = identifierMatch[1];
      const lines = content.split('\n');
      
      // Find export lines with this identifier
      const exportLines = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('export') && line.includes(duplicateIdentifier) && !line.includes('import')) {
          exportLines.push({ index: i, line: line.trim() });
        }
      }
      
      // If we have multiple exports, remove duplicates
      if (exportLines.length > 1) {
        for (let i = 1; i < exportLines.length; i++) {
          lines[exportLines[i].index] = '';
        }
        return lines.join('\n');
      }
      
      return null;
    }
  }
];

// Apply fixes to a file
function applyFixes(filePath, errors) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;
  const appliedFixes = [];
  
  // Sort errors by line number (descending) to avoid line number issues
  const sortedErrors = errors.sort((a, b) => b.line - a.line);
  
  for (const error of sortedErrors) {
    for (const pattern of fixPatterns) {
      if (pattern.pattern.test(error.message)) {
        const newContent = pattern.fix(error, content);
        if (newContent && newContent !== content) {
          content = newContent;
          hasChanges = true;
          appliedFixes.push(pattern.name);
          break;
        }
      }
    }
  }
  
  if (hasChanges) {
    if (!isDryRun) {
      fs.writeFileSync(filePath, content);
    }
    console.log(`✅ ${filePath}: Applied fixes - ${appliedFixes.join(', ')}`);
    return true;
  }
  
  return false;
}

// Main execution
async function main() {
  const errors = getDuplicateErrors();
  
  if (errors.length === 0) {
    console.log('🎉 No duplicate identifier errors found!');
    return;
  }
  
  console.log(`🎯 Processing ${errors.length} duplicate identifier errors...`);
  
  // Group errors by file
  const errorsByFile = {};
  const parsedErrors = [];
  
  for (const errorLine of errors) {
    const parsed = parseError(errorLine);
    if (parsed) {
      parsedErrors.push(parsed);
      if (!errorsByFile[parsed.filePath]) {
        errorsByFile[parsed.filePath] = [];
      }
      errorsByFile[parsed.filePath].push(parsed);
    }
  }
  
  console.log(`📁 Processing ${Object.keys(errorsByFile).length} files with duplicate identifier errors`);
  
  let fixedFiles = 0;
  for (const [filePath, fileErrors] of Object.entries(errorsByFile)) {
    const success = applyFixes(filePath, fileErrors);
    if (success) {
      fixedFiles++;
    }
  }
  
  console.log(`\n📊 DUPLICATE IDENTIFIER FIX SUMMARY`);
  console.log(`=====================================`);
  console.log(`📈 Total errors processed: ${errors.length}`);
  console.log(`📁 Files processed: ${Object.keys(errorsByFile).length}`);
  console.log(`✅ Files fixed: ${fixedFiles}`);
  console.log(`🔧 Dry run mode: ${isDryRun}`);
  
  if (isDryRun) {
    console.log(`\n💡 To apply fixes, run: node ${process.argv[1]} --execute`);
  } else {
    console.log(`\n🔍 Running verification build...`);
    try {
      execSync('yarn build', { stdio: 'pipe' });
      console.log(`✅ Build successful! Fixes applied correctly.`);
    } catch (error) {
      console.log(`⚠️  Build still has issues - some fixes may need manual review.`);
    }
  }
}

// Error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Script error:', error.message);
  process.exit(1);
});

main().catch(console.error); 