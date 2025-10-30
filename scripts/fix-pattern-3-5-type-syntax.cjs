#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ===== CONFIGURATION =====
const DRY_RUN = !process.argv.includes('--apply');
const SINGLE_FILE = process.argv.find(arg => arg.startsWith('--file='))?.split('=')[1];
const BACKUP_DIR = path.join(__dirname, '.backups');
const LOG_FILE = path.join(__dirname, `../fix-log-pattern-3-5-${Date.now()}.txt`);

// ===== SAFETY FUNCTIONS =====
function createBackup(filePath) {
  const timestamp = Date.now();
  const backupPath = `${filePath}.backup-${timestamp}`;
  fs.copyFileSync(filePath, backupPath);
  log(`✓ Backup created: ${backupPath}`);
  return backupPath;
}

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync(LOG_FILE, logMessage + '\n');
}

function getParsingErrorCount(filePath) {
  try {
    const output = execSync(`yarn lint "${filePath}" 2>&1`, { encoding: 'utf8', timeout: 30000 });
    const matches = output.match(/Parsing error/g);
    return matches ? matches.length : 0;
  } catch (e) {
    const output = e.stdout || '';
    const matches = output.match(/Parsing error/g);
    return matches ? matches.length : 0;
  }
}

function restoreBackup(backupPath, originalPath) {
  fs.copyFileSync(backupPath, originalPath);
  log(`✓ Restored from backup: ${backupPath}`);
}

// ===== PATTERN FIXING FUNCTION =====
function fixPattern(content, filePath) {
  let modified = content;
  let changeCount = 0;
  const fixes = [];

  // Pattern 3: Malformed object syntax ") {" -> "{"
  // BUT NOT in function definitions like "): ReturnType {"
  let pattern3Count = 0;
  modified = modified.replace(/([,\s])(\)\s*\{)/g, (match, before, malformed, offset) => {
    // Check context - make sure this isn't a function return type
    const beforeContext = content.substring(Math.max(0, offset - 50), offset);

    // Skip if this looks like a function definition (has ")" before)
    if (beforeContext.match(/\)\s*:\s*[A-Z\w<>[\]]+\s*$/)) {
      return match; // Don't fix - this is a function return type
    }

    pattern3Count++;
    fixes.push(`Pattern 3 (Line ~${content.substring(0, offset).split('\n').length}): ${match.trim()} -> {`);
    return before + '{';
  });
  changeCount += pattern3Count;

  // Pattern 4: Semicolon before closing brace in imports/types
  // Match: word; followed by whitespace and }
  let pattern4Count = 0;
  const lines = modified.split('\n');
  const fixedLines = lines.map((line, index) => {
    // In import statements: Type2; } -> Type2 }
    if (line.includes('import') || line.includes('from')) {
      const fixed = line.replace(/(\w+);(\s*\})/g, (match, word, closing) => {
        pattern4Count++;
        fixes.push(`Pattern 4 (Line ${index + 1}): ${match.trim()} -> ${word}${closing}`);
        return word + closing;
      });
      return fixed;
    }

    // In type/interface definitions: : Type; } -> : Type }
    if (line.match(/^\s*(interface|type|export\s+(interface|type))/)) {
      const fixed = line.replace(/:\s*([A-Za-z0-9[\]<>]+);(\s*\})/g, (match, type, closing) => {
        pattern4Count++;
        fixes.push(`Pattern 4 (Line ${index + 1}): ${match.trim()} -> : ${type}${closing}`);
        return ': ' + type + closing;
      });
      return fixed;
    }

    return line;
  });

  if (pattern4Count > 0) {
    modified = fixedLines.join('\n');
  }
  changeCount += pattern4Count;

  // Pattern 5: Comma instead of colon in type properties
  // Match: propertyName, Type -> propertyName: Type
  let pattern5Count = 0;
  modified = modified.replace(/^(\s+)(\w+),\s*(number|string|boolean|void|null|undefined|[A-Z]\w*(?:\[\])?)/gm,
    (match, indent, propName, type, offset) => {
      // Only fix if we're inside a type/interface block
      const beforeContext = content.substring(Math.max(0, offset - 200), offset);
      if (beforeContext.match(/(interface|type)\s+\w+\s*=?\s*\{[^}]*$/)) {
        pattern5Count++;
        const lineNum = content.substring(0, offset).split('\n').length;
        fixes.push(`Pattern 5 (Line ${lineNum}): ${propName}, ${type} -> ${propName}: ${type}`);
        return `${indent}${propName}: ${type}`;
      }
      return match;
    });
  changeCount += pattern5Count;

  if (changeCount > 0) {
    log(`  Found ${changeCount} total issues:`);
    log(`    Pattern 3 (malformed objects): ${pattern3Count}`);
    log(`    Pattern 4 (semicolons in types): ${pattern4Count}`);
    log(`    Pattern 5 (comma instead of colon): ${pattern5Count}`);
    fixes.forEach(fix => log(`    ${fix}`));
  }

  return { modified, changeCount };
}

// ===== MAIN EXECUTION =====
function main() {
  log('===== PATTERNS 3-5: TYPE AND OBJECT SYNTAX ERRORS =====');
  log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes will be made)' : 'APPLY CHANGES'}`);
  log(`Log file: ${LOG_FILE}`);

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  let filesToProcess = [];

  if (SINGLE_FILE) {
    if (!fs.existsSync(SINGLE_FILE)) {
      log(`ERROR: File not found: ${SINGLE_FILE}`);
      process.exit(1);
    }
    filesToProcess = [SINGLE_FILE];
    log(`Processing single file: ${SINGLE_FILE}`);
  } else {
    log('Scanning codebase for files with parsing errors...');
    try {
      const output = execSync('yarn lint 2>&1', {
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024,
        timeout: 120000
      });
      const fileMatches = output.match(/\/Users\/[^\s:]+\.tsx?/g);
      if (fileMatches) {
        filesToProcess = [...new Set(fileMatches)];
      }
    } catch (e) {
      const output = e.stdout || '';
      const fileMatches = output.match(/\/Users\/[^\s:]+\.tsx?/g);
      if (fileMatches) {
        filesToProcess = [...new Set(fileMatches)];
      }
    }
  }

  log(`Found ${filesToProcess.length} files to scan`);

  let successCount = 0;
  let failCount = 0;
  let skippedCount = 0;

  for (const filePath of filesToProcess) {
    log(`\n--- Processing: ${filePath} ---`);

    if (!fs.existsSync(filePath)) {
      log(`  ⚠ File not found, skipping`);
      skippedCount++;
      continue;
    }

    const errorsBefore = getParsingErrorCount(filePath);
    log(`  Parsing errors before: ${errorsBefore}`);

    const content = fs.readFileSync(filePath, 'utf8');
    const { modified, changeCount } = fixPattern(content, filePath);

    if (changeCount === 0) {
      log(`  No type/object syntax errors found`);
      skippedCount++;
      continue;
    }

    if (DRY_RUN) {
      log(`  [DRY RUN] Would make ${changeCount} changes`);
      successCount++;
      continue;
    }

    const backup = createBackup(filePath);

    try {
      fs.writeFileSync(filePath, modified, 'utf8');
      log(`  ✓ File written`);

      const errorsAfter = getParsingErrorCount(filePath);
      log(`  Parsing errors after: ${errorsAfter}`);

      if (errorsAfter > errorsBefore) {
        log(`  ❌ ERRORS INCREASED (${errorsBefore} → ${errorsAfter}) - Restoring backup`);
        restoreBackup(backup, filePath);
        failCount++;
      } else {
        log(`  ✅ Success! Errors: ${errorsBefore} → ${errorsAfter} (Fixed ${changeCount} instances)`);
        successCount++;
      }
    } catch (error) {
      log(`  ❌ ERROR: ${error.message}`);
      log(`  Restoring backup...`);
      restoreBackup(backup, filePath);
      failCount++;
    }
  }

  log('\n===== SUMMARY =====');
  log(`Successful fixes: ${successCount}`);
  log(`Failed fixes: ${failCount}`);
  log(`Skipped (no changes): ${skippedCount}`);
  log(`Total files processed: ${filesToProcess.length}`);
  log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes made)' : 'CHANGES APPLIED'}`);

  if (DRY_RUN) {
    log('\n💡 To apply changes, run with --apply flag');
    log('💡 To test on single file, use --file=/path/to/file.ts');
  }
}

try {
  main();
} catch (error) {
  console.error('FATAL ERROR:', error);
  process.exit(1);
}
