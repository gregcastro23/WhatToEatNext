#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const isDryRun = !process.argv.includes('--execute');

console.log(`🔧 Syntax Corruption Fix Script (dry-run: ${isDryRun})`);

// Get TypeScript syntax errors
function getSyntaxErrors() {
  console.log('📊 Collecting syntax errors...');
  
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
    
    const syntaxErrors = lines.filter(line => {
      return line.includes('error TS1128') || // Declaration or statement expected
             line.includes('error TS1434') || // Unexpected keyword or identifier
             line.includes('error TS1005') || // Expected ';' or ','
             line.includes('error TS1109');   // Expression expected
    });
    
    console.log(`📈 Found ${syntaxErrors.length} syntax errors`);
    return syntaxErrors;
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

// Fix corrupted files
function fixCorruptedFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;
  const appliedFixes = [];
  
  // Fix common corruption patterns
  
  // 1. Fix broken export statements (missing 'export const')
  const exportConstPattern = /^(\s*)([A-Z_][A-Z0-9_]*)\s*=\s*/gm;
  const fixedExportConst = content.replace(exportConstPattern, (match, indent, varName) => {
    if (!content.substring(0, content.indexOf(match)).includes(`export const ${varName}`)) {
      hasChanges = true;
      appliedFixes.push('Fix missing export const');
      return `${indent}export const ${varName} = `;
    }
    return match;
  });
  content = fixedExportConst;
  
  // 2. Fix broken object declarations
  const brokenObjectPattern = /^(\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*{/gm;
  const fixedObjects = content.replace(brokenObjectPattern, (match, indent, propName, offset) => {
    const beforeMatch = content.substring(0, offset);
    const lines = beforeMatch.split('\n');
    const currentLineIndex = lines.length - 1;
    
    // Check if this looks like it should be part of an object
    if (currentLineIndex > 0) {
      const prevLine = lines[currentLineIndex - 1].trim();
      if (prevLine.endsWith('{') || prevLine.endsWith(',')) {
        return match; // This is already part of an object
      }
    }
    
    // Check if this should be an export
    if (propName.match(/^[A-Z]/)) {
      hasChanges = true;
      appliedFixes.push('Fix missing export object');
      return `${indent}export const ${propName}: {`;
    }
    
    return match;
  });
  content = fixedObjects;
  
  // 3. Fix missing semicolons in object properties
  const missingSemicolonPattern = /^(\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*([^,\n}]+)$/gm;
  const fixedSemicolons = content.replace(missingSemicolonPattern, (match, indent, prop, value) => {
    if (!value.trim().endsWith(',') && !value.trim().endsWith(';')) {
      hasChanges = true;
      appliedFixes.push('Add missing commas');
      return `${indent}${prop}: ${value.trim()},`;
    }
    return match;
  });
  content = fixedSemicolons;
  
  // 4. Fix broken import statements
  const brokenImportPattern = /^(\s*)([A-Z][a-zA-Z0-9_]*),?\s*$/gm;
  const fixedImports = content.replace(brokenImportPattern, (match, indent, importName, offset) => {
    const beforeMatch = content.substring(0, offset);
    const afterMatch = content.substring(offset + match.length);
    
    // Check if this looks like a broken import
    if (beforeMatch.includes('import {') && !beforeMatch.includes('} from')) {
      // This might be part of a broken import, leave it alone for now
      return match;
    }
    
    // Check if this is a standalone identifier that should be part of an export
    if (afterMatch.trim().startsWith('} from')) {
      return match; // This is part of an import
    }
    
    return match;
  });
  content = fixedImports;
  
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
  const errors = getSyntaxErrors();
  
  if (errors.length === 0) {
    console.log('🎉 No syntax errors found!');
    return;
  }
  
  console.log(`🎯 Processing ${errors.length} syntax errors...`);
  
  // Group errors by file
  const errorsByFile = {};
  
  for (const errorLine of errors) {
    const parsed = parseError(errorLine);
    if (parsed) {
      if (!errorsByFile[parsed.filePath]) {
        errorsByFile[parsed.filePath] = [];
      }
      errorsByFile[parsed.filePath].push(parsed);
    }
  }
  
  console.log(`📁 Processing ${Object.keys(errorsByFile).length} files with syntax errors`);
  
  let fixedFiles = 0;
  for (const filePath of Object.keys(errorsByFile)) {
    const success = fixCorruptedFile(filePath);
    if (success) {
      fixedFiles++;
    }
  }
  
  console.log(`\n📊 SYNTAX CORRUPTION FIX SUMMARY`);
  console.log(`=================================`);
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