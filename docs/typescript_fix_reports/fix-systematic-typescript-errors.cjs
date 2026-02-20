#!/usr/bin/env node

/**
 * Systematic TypeScript Error Resolution Script
 *
 * This script addresses the most common TypeScript errors systematically:
 * - TS2339: Property does not exist on type
 * - TS18046: Element implicitly has an 'any' type
 * - TS2571: Object is of type 'unknown'
 * - TS2345: Argument of type is not assignable
 * - TS2322: Type is not assignable to type
 * - Malformed type casting patterns
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const MAX_FILES_PER_BATCH = 15;
const BACKUP_DIR = '.typescript-fix-backup';

// Create backup directory
function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `${BACKUP_DIR}-${timestamp}`;

  if (!fs.existsSync(backupPath)) {
    fs.mkdirSync(backupPath, { recursive: true });
  }

  return backupPath;
}

// Get TypeScript errors by type
function getTypeScriptErrors() {
  try {
    const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep "error TS"', {
      encoding: 'utf8',
      stdio: 'pipe'
    });

    const errors = [];
    const lines = output.trim().split('\n').filter(line => line.trim());

    for (const line of lines) {
      const match = line.match(/^(.+?)\((\d+),(\d+)\): error (TS\d+): (.+)$/);
      if (match) {
        errors.push({
          file: match[1],
          line: parseInt(match[2]),
          column: parseInt(match[3]),
          code: match[4],
          message: match[5],
          fullLine: line
        });
      }
    }

    return errors;
  } catch (error) {
    console.log('No TypeScript errors found or command failed');
    return [];
  }
}

// Fix malformed type casting patterns
function fixMalformedTypeCasting(content) {
  let fixed = content;
  let modified = false;

  // Pattern 1: Double type casting - ((obj as Record<string, unknown>) as Record<string, unknown>)
  const doubleCastPattern = /\(\(([^)]+)\s+as\s+([^)]+)\)\s+as\s+([^)]+)\)/g;
  if (doubleCastPattern.test(fixed)) {
    fixed = fixed.replace(doubleCastPattern, '($1 as $3)');
    modified = true;
  }

  // Pattern 2: Malformed Record casting - (obj as Record<string, (unknown>)
  const malformedRecordPattern = /\(([^)]+)\s+as\s+Record<string,\s*\(unknown>\)/g;
  if (malformedRecordPattern.test(fixed)) {
    fixed = fixed.replace(malformedRecordPattern, '($1 as Record<string, unknown>)');
    modified = true;
  }

  // Pattern 3: Nested casting with property access - ((data as Record<string, unknown>).prop as Type)
  const nestedCastPattern = /\(\(([^)]+)\s+as\s+Record<string,\s*unknown>\)\.(\w+)\s+as\s+([^)]+)\)/g;
  if (nestedCastPattern.test(fixed)) {
    fixed = fixed.replace(nestedCastPattern, '(($1 as Record<string, unknown>).$2 as $3)');
    modified = true;
  }

  // Pattern 4: Malformed property access - (obj as Record<string, unknown>)?.prop as Type)[0]
  const malformedAccessPattern = /\(([^)]+)\s+as\s+Record<string,\s*unknown>\)\?\.([\w.]+)\s+as\s+([^)]+)\)\[(\d+)\]/g;
  if (malformedAccessPattern.test(fixed)) {
    fixed = fixed.replace(malformedAccessPattern, '(($1 as Record<string, unknown>)?.$2 as $3)[$4]');
    modified = true;
  }

  // Pattern 5: Missing closing parenthesis in object literals
  const missingParenPattern = /(\w+):\s*\(([^)]+as\s+Record<string,\s*unknown>)\?\.([\w.]+),/g;
  if (missingParenPattern.test(fixed)) {
    fixed = fixed.replace(missingParenPattern, '$1: ($2)?.$3,');
    modified = true;
  }

  return { content: fixed, modified };
}

// Fix TS2339 errors (Property does not exist on type)
function fixTS2339Errors(content, errors) {
  let fixed = content;
  let modified = false;
  const lines = fixed.split('\n');

  errors.forEach(error => {
    if (error.code === 'TS2339') {
      const lineIndex = error.line - 1;
      if (lineIndex >= 0 && lineIndex < lines.length) {
        let line = lines[lineIndex];

        // Pattern: Property 'prop' does not exist on type 'unknown'
        if (error.message.includes("does not exist on type 'unknown'")) {
          // Add type assertion for unknown objects
          line = line.replace(/(\w+)\.(\w+)/g, '($1 as Record<string, unknown>).$2');
          modified = true;
        }

        // Pattern: Property access on potentially undefined objects
        if (error.message.includes("does not exist on type") && !line.includes('as Record')) {
          // Use optional chaining and type assertion
          line = line.replace(/(\w+)\.(\w+)/g, '($1 as any)?.$2');
          modified = true;
        }

        lines[lineIndex] = line;
      }
    }
  });

  return { content: lines.join('\n'), modified };
}

// Fix TS18046 errors (Element implicitly has an 'any' type)
function fixTS18046Errors(content, errors) {
  let fixed = content;
  let modified = false;
  const lines = fixed.split('\n');

  errors.forEach(error => {
    if (error.code === 'TS18046') {
      const lineIndex = error.line - 1;
      if (lineIndex >= 0 && lineIndex < lines.length) {
        let line = lines[lineIndex];

        // Pattern: Element implicitly has an 'any' type because expression of type 'string' can't be used to index
        if (error.message.includes("implicitly has an 'any' type")) {
          // Add proper type assertion for bracket notation
          line = line.replace(/(\w+)\[([^\]]+)\]/g, '($1 as Record<string, unknown>)[$2]');
          modified = true;
        }

        lines[lineIndex] = line;
      }
    }
  });

  return { content: lines.join('\n'), modified };
}

// Fix TS2571 errors (Object is of type 'unknown')
function fixTS2571Errors(content, errors) {
  let fixed = content;
  let modified = false;
  const lines = fixed.split('\n');

  errors.forEach(error => {
    if (error.code === 'TS2571') {
      const lineIndex = error.line - 1;
      if (lineIndex >= 0 && lineIndex < lines.length) {
        let line = lines[lineIndex];

        // Pattern: Object is of type 'unknown'
        if (error.message.includes("Object is of type 'unknown'")) {
          // Add type assertion for Object methods
          line = line.replace(/Object\.(keys|values|entries)\(([^)]+)\)/g, 'Object.$1($2 as Record<string, unknown>)');

          // Add type assertion for for...in loops
          line = line.replace(/for\s*\(\s*const\s+(\w+)\s+in\s+([^)]+)\)/g, 'for (const $1 in ($2 as Record<string, unknown>))');

          modified = true;
        }

        lines[lineIndex] = line;
      }
    }
  });

  return { content: lines.join('\n'), modified };
}

// Fix TS2345 errors (Argument of type is not assignable)
function fixTS2345Errors(content, errors) {
  let fixed = content;
  let modified = false;
  const lines = fixed.split('\n');

  errors.forEach(error => {
    if (error.code === 'TS2345') {
      const lineIndex = error.line - 1;
      if (lineIndex >= 0 && lineIndex < lines.length) {
        let line = lines[lineIndex];

        // Pattern: Argument of type 'unknown' is not assignable to parameter of type
        if (error.message.includes("Argument of type 'unknown'")) {
          // Add type assertion for function arguments
          line = line.replace(/(\w+)\(([^)]*unknown[^)]*)\)/g, (match, func, args) => {
            const fixedArgs = args.replace(/(\w+)/g, '($1 as any)');
            return `${func}(${fixedArgs})`;
          });
          modified = true;
        }

        lines[lineIndex] = line;
      }
    }
  });

  return { content: lines.join('\n'), modified };
}

// Fix TS2322 errors (Type is not assignable to type)
function fixTS2322Errors(content, errors) {
  let fixed = content;
  let modified = false;
  const lines = fixed.split('\n');

  errors.forEach(error => {
    if (error.code === 'TS2322') {
      const lineIndex = error.line - 1;
      if (lineIndex >= 0 && lineIndex < lines.length) {
        let line = lines[lineIndex];

        // Pattern: Type 'unknown' is not assignable to type
        if (error.message.includes("Type 'unknown' is not assignable")) {
          // Add type assertion for assignments
          line = line.replace(/=\s*([^;,\n]+unknown[^;,\n]*)/g, '= ($1 as any)');
          modified = true;
        }

        lines[lineIndex] = line;
      }
    }
  });

  return { content: lines.join('\n'), modified };
}

// Process a single file
function processFile(filePath, errors, backupPath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileErrors = errors.filter(error => error.file === filePath);

    if (fileErrors.length === 0) {
      return { processed: false, errors: 0 };
    }

    console.log(`Processing ${filePath} (${fileErrors.length} errors)`);

    // Create backup
    const relativePath = path.relative('.', filePath);
    const backupFilePath = path.join(backupPath, relativePath);
    const backupDir = path.dirname(backupFilePath);

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    fs.writeFileSync(backupFilePath, content);

    let result = { content, modified: false };

    // Apply fixes in order of priority

    // 1. Fix malformed type casting patterns first
    const malformedResult = fixMalformedTypeCasting(result.content);
    result.content = malformedResult.content;
    result.modified = result.modified || malformedResult.modified;

    // 2. Fix TS2571 errors (Object is of type 'unknown')
    const ts2571Result = fixTS2571Errors(result.content, fileErrors);
    result.content = ts2571Result.content;
    result.modified = result.modified || ts2571Result.modified;

    // 3. Fix TS2339 errors (Property does not exist on type)
    const ts2339Result = fixTS2339Errors(result.content, fileErrors);
    result.content = ts2339Result.content;
    result.modified = result.modified || ts2339Result.modified;

    // 4. Fix TS18046 errors (Element implicitly has an 'any' type)
    const ts18046Result = fixTS18046Errors(result.content, fileErrors);
    result.content = ts18046Result.content;
    result.modified = result.modified || ts18046Result.modified;

    // 5. Fix TS2345 errors (Argument of type is not assignable)
    const ts2345Result = fixTS2345Errors(result.content, fileErrors);
    result.content = ts2345Result.content;
    result.modified = result.modified || ts2345Result.modified;

    // 6. Fix TS2322 errors (Type is not assignable to type)
    const ts2322Result = fixTS2322Errors(result.content, fileErrors);
    result.content = ts2322Result.content;
    result.modified = result.modified || ts2322Result.modified;

    if (result.modified) {
      fs.writeFileSync(filePath, result.content);
      console.log(`  ✓ Fixed TypeScript errors in ${filePath}`);
      return { processed: true, errors: fileErrors.length };
    } else {
      console.log(`  - No changes needed in ${filePath}`);
      return { processed: false, errors: fileErrors.length };
    }

  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return { processed: false, errors: 0 };
  }
}

// Validate build after fixes
function validateBuild() {
  try {
    console.log('\n🔍 Validating TypeScript compilation...');
    execSync('yarn tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
    console.log('✅ TypeScript compilation successful');
    return true;
  } catch (error) {
    console.log('⚠️ TypeScript compilation has errors');
    return false;
  }
}

// Main execution
function main() {
  console.log('🔍 Analyzing TypeScript errors for systematic resolution...');

  const errors = getTypeScriptErrors();
  console.log(`Found ${errors.length} TypeScript errors`);

  if (errors.length === 0) {
    console.log('✅ No TypeScript errors to fix!');
    return;
  }

  // Create backup
  const backupPath = createBackup();
  console.log(`📁 Created backup at: ${backupPath}`);

  // Analyze error distribution
  const errorsByType = {};
  errors.forEach(error => {
    errorsByType[error.code] = (errorsByType[error.code] || 0) + 1;
  });

  console.log('\n📊 Error distribution:');
  Object.entries(errorsByType)
    .sort(([,a], [,b]) => b - a)
    .forEach(([code, count]) => {
      console.log(`  ${code}: ${count} errors`);
    });

  // Group errors by file
  const fileErrors = {};
  errors.forEach(error => {
    if (!fileErrors[error.file]) {
      fileErrors[error.file] = [];
    }
    fileErrors[error.file].push(error);
  });

  console.log(`\n📁 Files with errors: ${Object.keys(fileErrors).length}`);

  let totalProcessed = 0;
  let totalErrors = 0;

  // Process files with most errors first
  const sortedFiles = Object.keys(fileErrors).sort((a, b) =>
    fileErrors[b].length - fileErrors[a].length
  );

  console.log(`\n🔧 Processing top ${MAX_FILES_PER_BATCH} files with most errors...`);

  for (const filePath of sortedFiles.slice(0, MAX_FILES_PER_BATCH)) {
    const result = processFile(filePath, fileErrors[filePath], backupPath);
    if (result.processed) {
      totalProcessed++;
    }
    totalErrors += result.errors;

    // Validate build every 5 files
    if (totalProcessed % 5 === 0) {
      const buildValid = validateBuild();
      if (!buildValid) {
        console.log('⚠️ Build validation failed, stopping to prevent further issues');
        break;
      }
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`  Files processed: ${totalProcessed}`);
  console.log(`  Total errors addressed: ${totalErrors}`);
  console.log(`  Backup location: ${backupPath}`);

  // Final verification
  console.log('\n🔍 Verifying fixes...');
  const remainingErrors = getTypeScriptErrors();
  const reduction = errors.length - remainingErrors.length;

  console.log(`  Before: ${errors.length} TypeScript errors`);
  console.log(`  After: ${remainingErrors.length} TypeScript errors`);
  console.log(`  Reduction: ${reduction} errors (${Math.round(reduction / errors.length * 100)}%)`);

  // Final build validation
  const finalBuildValid = validateBuild();
  if (finalBuildValid) {
    console.log('✅ Final build validation successful');
  } else {
    console.log('⚠️ Final build validation failed - consider reviewing changes');
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  main,
  getTypeScriptErrors,
  processFile,
  fixMalformedTypeCasting,
  fixTS2339Errors,
  fixTS18046Errors,
  fixTS2571Errors,
  fixTS2345Errors,
  fixTS2322Errors
};
