#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ===== CONFIGURATION =====
const DRY_RUN = !process.argv.includes('--apply');
const SINGLE_FILE = process.argv.find(arg => arg.startsWith('--file='))?.split('=')[1];
const BACKUP_DIR = path.join(__dirname, '.backups');
const LOG_FILE = path.join(__dirname, `../fix-log-pattern-1-${Date.now()}.txt`);

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

  // Pattern 1: Missing opening parenthesis in function definitions
  // Match: function name() followed by newline and parameter with colon
  // Fix: Replace () with (

  const lines = content.split('\n');
  const fixedLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = i < lines.length - 1 ? lines[i + 1] : '';

    // Check if current line has function/const with () and next line starts with parameter
    // Pattern: export function name() OR export const name = () OR function name()
    const functionMatch = line.match(/^(\s*)(export\s+)?(function|const)\s+(\w+)\s*=?\s*\(\)\s*$/);
    const nextLineMatch = nextLine.match(/^\s+\w+\s*:/);

    if (functionMatch && nextLineMatch) {
      // Found a match - this line ends with () and next line has a parameter
      const [fullMatch, indent, exportKeyword, funcType, funcName] = functionMatch;
      const fixed = line.replace(/\(\)\s*$/, '(');
      fixedLines.push(fixed);
      changeCount++;
      log(`  Line ${i + 1}: Found function ${funcName} with missing opening paren`);
      log(`    Before: ${line.trim()}`);
      log(`    After:  ${fixed.trim()}`);
    } else {
      fixedLines.push(line);
    }
  }

  if (changeCount > 0) {
    modified = fixedLines.join('\n');
  }

  return { modified, changeCount };
}

// ===== MAIN EXECUTION =====
function main() {
  log('===== PATTERN 1: MISSING OPENING PARENTHESIS IN FUNCTIONS =====');
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
      log(`  No missing parenthesis errors found`);
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
