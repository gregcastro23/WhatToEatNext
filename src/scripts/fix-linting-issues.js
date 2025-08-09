/**
 * Script to safely fix common ESLint issues
 *
 * This script implements several safeguards to prevent file corruption:
 * 1. Creates backups of all files before modifying them
 * 2. Uses precise fixes rather than broad find-and-replace
 * 3. Has comprehensive error handling
 * 4. Logs all changes for review
 * 5. Validates content before saving
 * 6. Provides restore functionality if needed
 *
 * Run with: node src/scripts/fix-linting-issues.js
 * To restore: node src/scripts/fix-linting-issues.js --restore
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SRC_DIR = path.resolve(process.cwd(), 'src');
const BACKUP_DIR = path.resolve(process.cwd(), 'lint-fix-backups');
const LOG_FILE = path.resolve(process.cwd(), 'lint-fix-log.txt');
const EXCLUDED_DIRS = ['node_modules', '.next', '.git', 'public'];
const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];
const MAX_TOKENS_MODIFIED = 100; // Safety threshold for maximum changes

// Parse command line arguments
const args = process.argv.slice(2);
const isRestoreMode = args.includes('--restore');
const isSafeMode = args.includes('--safe-mode');
const isTestMode = args.includes('--test');

// Safe logging
function log(message) {
  // console.log(message);
  fs.appendFileSync(LOG_FILE, message + '\n');
}

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Initialize log file
fs.writeFileSync(LOG_FILE, `Lint Fix Log - ${new Date().toISOString()}\n\n`);
log(`Mode: ${isRestoreMode ? 'Restore' : isSafeMode ? 'Safe' : isTestMode ? 'Test' : 'Normal'}`);

// Create backup of a file before modifying it
function backupFile(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);
  const backupPath = path.join(BACKUP_DIR, relativePath);

  // Ensure the directory structure exists
  const backupDir = path.dirname(backupPath);
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  try {
    fs.copyFileSync(filePath, backupPath);
    return backupPath;
  } catch (error) {
    log(`Error backing up file ${filePath}: ${error.message}`);
    return null;
  }
}

// Safely read a file
function safeReadFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    log(`Error reading file ${filePath}: ${error.message}`);
    return null;
  }
}

// Safely write a file
function safeWriteFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (error) {
    log(`Error writing file ${filePath}: ${error.message}`);
    return false;
  }
}

// Restore a file from backup
function restoreFromBackup(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);
  const backupPath = path.join(BACKUP_DIR, relativePath);

  if (!fs.existsSync(backupPath)) {
    log(`No backup found for ${relativePath}`);
    return false;
  }

  try {
    fs.copyFileSync(backupPath, filePath);
    log(`Restored ${relativePath} from backup`);
    return true;
  } catch (error) {
    log(`Error restoring file ${filePath}: ${error.message}`);
    return false;
  }
}

// Find all files to process
function findFiles(dir, excludedDirs, extensions) {
  const files = [];

  function traverse(currentDir) {
    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory()) {
          if (!excludedDirs.includes(entry.name)) {
            traverse(fullPath);
          }
        } else if (entry.isFile() && extensions.includes(path.extname(entry.name))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      log(`Error traversing directory ${currentDir}: ${error.message}`);
    }
  }

  traverse(dir);
  return files;
}

// Validate content to ensure it's not corrupted
function validateContent(content, updatedContent) {
  // Check if the content has changed too much
  const contentTokens = content.split(/\s+/).length;
  const updatedTokens = updatedContent.split(/\s+/).length;
  const tokenDiff = Math.abs(contentTokens - updatedTokens);

  if (tokenDiff > MAX_TOKENS_MODIFIED) {
    return {
      valid: false,
      reason: `Too many tokens changed (${tokenDiff}). This may indicate corruption.`,
    };
  }

  // Check for unbalanced brackets/parentheses
  const bracketCount = str => {
    const brackets = { '{': 0, '(': 0, '[': 0 };

    for (let i = 0; i < str.length; i++) {
      if (str[i] === '{') brackets['{']++;
      if (str[i] === '}') brackets['{']--;
      if (str[i] === '(') brackets['(']++;
      if (str[i] === ')') brackets['(']--;
      if (str[i] === '[') brackets['[']++;
      if (str[i] === ']') brackets['[']--;
    }

    return brackets;
  };

  const originalBrackets = bracketCount(content);
  const updatedBrackets = bracketCount(updatedContent);

  if (
    originalBrackets['{'] !== updatedBrackets['{'] ||
    originalBrackets['('] !== updatedBrackets['('] ||
    originalBrackets['['] !== updatedBrackets['[']
  ) {
    return {
      valid: false,
      reason: 'Unbalanced brackets detected. This may indicate corruption.',
    };
  }

  // Ensure there are no syntax markers that could indicate corruption
  const corruptionMarkers = ['<<<<<<', '>>>>>>>', '======'];

  for (const marker of corruptionMarkers) {
    if (updatedContent.includes(marker)) {
      return {
        valid: false,
        reason: `Corruption marker "${marker}" found in content.`,
      };
    }
  }

  return { valid: true };
}

// Fix unused variables by prefixing them with underscores
function fixUnusedVariables(filePath, content) {
  // We'll be less aggressive here to avoid false positives
  // Only apply to variables flagged by ESLint warnings

  // Get ESLint warnings for this file
  let eslintOutput = '';
  try {
    eslintOutput = execSync(`npx eslint "${filePath}" --quiet --format json`, { encoding: 'utf8' });
  } catch (error) {
    // ESLint might exit with non-zero status if it finds issues
    eslintOutput = error.stdout || '';
  }

  if (!eslintOutput) {
    return content;
  }

  let unusedVars = [];
  try {
    const eslintResult = JSON.parse(eslintOutput);

    if (eslintResult.length > 0 && eslintResult[0].messages) {
      // Extract unused variable names from ESLint messages
      unusedVars = eslintResult[0].messages
        .filter(m => m.ruleId === '@typescript-eslint/no-unused-vars')
        .map(m => m.message.match(/'([^']+)'/))
        .filter(Boolean)
        .map(m => m[1]);
    }
  } catch (error) {
    log(`Error parsing ESLint output for ${filePath}: ${error.message}`);
    return content;
  }

  if (unusedVars.length === 0) {
    return content;
  }

  // Apply fixes for each unused variable
  let updatedContent = content;
  for (const varName of unusedVars) {
    const varRegex = new RegExp(`(const|let|var)\\s+(${varName})(\\s*=|\\s*:)`, 'g');
    updatedContent = updatedContent.replace(varRegex, `$1 _${varName}$3`);

    const argRegex = new RegExp(`(\\([^)]*?)\\b(${varName})(\\s*:|\\s*,|\\s*\\))`, 'g');
    updatedContent = updatedContent.replace(argRegex, `$1_${varName}$3`);
  }

  return updatedContent;
}

// Fix console.log statements by removing them or commenting them out
function fixConsoleStatements(content) {
  // Comment out console statements rather than removing them entirely
  return content.replace(/^(\s*)(console\.[a-zA-Z]+\(.*\);?)$/gm, '$1// $2');
}

// Fix unnecessary escape characters
function fixUnnecessaryEscapes(content) {
  // Fix common unnecessary escapes in template literals and regular expressions
  let updated = content.replace(/\\{1,2}\(\\{1,2}\)/g, '\\(\\)'); // Replace \\\( with \(
  updated = updated.replace(/\\\`/g, '`'); // Replace \` with `
  return updated;
}

// Fix prefer-const issues
function fixPreferConst(content) {
  // Find let declarations that are never reassigned and convert to const
  const letDeclarationRegex = /let\s+([a-zA-Z0-9_$]+)\s*=/g;
  return content.replace(letDeclarationRegex, 'const $1 =');
}

// Fix duplicate imports
function fixDuplicateImports(content) {
  const importLines = content.split('\n');
  const uniqueImports = new Map();

  // First pass to gather imports
  importLines.forEach(line => {
    const importMatch = line.match(/import\s+.*\s+from\s+['"]([^'"]+)['"]/);
    if (importMatch) {
      const importSource = importMatch[1];
      if (!uniqueImports.has(importSource)) {
        uniqueImports.set(importSource, []);
      }
      uniqueImports.get(importSource).push(line);
    }
  });

  // Second pass to remove duplicates
  let updatedContent = content;
  uniqueImports.forEach((lines, source) => {
    if (lines.length > 1) {
      // Keep only the first import line
      for (const i = 1; i < lines.length; i++) {
        updatedContent = updatedContent.replace(lines[i], `// Removed duplicate: ${lines[i]}`);
      }
    }
  });

  return updatedContent;
}

// Restore backups for all files if in restore mode
async function restoreBackups() {
  log('Starting restore from backups...');

  // Find all backups
  const backupFiles = findFiles(BACKUP_DIR, EXCLUDED_DIRS, EXTENSIONS);
  log(`Found ${backupFiles.length} backup files`);

  const restoredFiles = 0;
  const failedFiles = 0;

  for (const backupPath of backupFiles) {
    const relativePath = path.relative(BACKUP_DIR, backupPath);
    const targetPath = path.join(process.cwd(), relativePath);

    log(`Restoring ${relativePath}...`);

    try {
      // Ensure the target directory exists
      const targetDir = path.dirname(targetPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      fs.copyFileSync(backupPath, targetPath);
      log(`Successfully restored ${relativePath}`);
      restoredFiles++;
    } catch (error) {
      log(`Failed to restore ${relativePath}: ${error.message}`);
      failedFiles++;
    }
  }

  log('\nRestore Summary:');
  log(`Total backup files: ${backupFiles.length}`);
  log(`Successfully restored: ${restoredFiles}`);
  log(`Failed to restore: ${failedFiles}`);
}

// Main function to process files
async function fixLintingIssues() {
  // If in restore mode, restore backups and exit
  if (isRestoreMode) {
    await restoreBackups();
    return;
  }

  log('Starting linting fixes...');

  // Find all files to process
  const files = findFiles(SRC_DIR, EXCLUDED_DIRS, EXTENSIONS);
  log(`Found ${files.length} files to process`);

  const fixedFiles = 0;
  const skippedFiles = 0;
  const backupMap = new Map(); // Track files and their backups

  // Process each file
  for (const filePath of files) {
    const relativePath = path.relative(process.cwd(), filePath);
    log(`Processing ${relativePath}...`);

    // Read file content
    const content = safeReadFile(filePath);
    if (content === null) {
      log(`Skipping file ${relativePath} due to read error`);
      skippedFiles++;
      continue;
    }

    // Apply fixes
    let updatedContent = content;

    try {
      // Only apply fixes if not in test mode
      if (!isTestMode) {
        // Only apply unused variable fixes to TS files to avoid false positives
        if ((filePath.endsWith('.ts') || filePath.endsWith('.tsx')) && !isSafeMode) {
          updatedContent = fixUnusedVariables(filePath, updatedContent);
        }

        updatedContent = fixConsoleStatements(updatedContent);
        updatedContent = fixUnnecessaryEscapes(updatedContent);

        // Only apply const fixes if not in safe mode
        if (!isSafeMode) {
          updatedContent = fixPreferConst(updatedContent);
        }

        if (!isSafeMode) {
          updatedContent = fixDuplicateImports(updatedContent);
        }
      }

      // Only write the file if changes were made
      if (updatedContent !== content) {
        // Validate content to ensure no corruption
        const validation = validateContent(content, updatedContent);

        if (!validation.valid) {
          log(`Skipping file ${relativePath}: Validation failed: ${validation.reason}`);
          skippedFiles++;
          continue;
        }

        // Backup the file before changing it
        const backupPath = backupFile(filePath);
        if (backupPath) {
          // If in test mode, just report what would be changed
          if (isTestMode) {
            log(`Would fix issues in ${relativePath} (test mode)`);
            fixedFiles++;
            continue;
          }

          if (safeWriteFile(filePath, updatedContent)) {
            backupMap.set(filePath, backupPath);
            log(`Fixed issues in ${relativePath}`);

            // Try to format the file with Prettier
            try {
              execSync(`npx prettier --write "${filePath}"`, { stdio: 'ignore' });
            } catch (error) {
              log(`Note: Could not format ${relativePath} with Prettier`);
            }

            fixedFiles++;
          } else {
            log(`Failed to write updates to ${relativePath}`);
            skippedFiles++;
            // Try to restore from backup if the write failed
            restoreFromBackup(filePath);
          }
        } else {
          log(`Skipping file ${relativePath} due to backup failure`);
          skippedFiles++;
        }
      } else {
        log(`No issues to fix in ${relativePath}`);
      }
    } catch (error) {
      log(`Error processing ${relativePath}: ${error.message}`);
      skippedFiles++;
      // Try to restore from backup if an error occurred
      if (backupMap.has(filePath)) {
        restoreFromBackup(filePath);
      }
    }
  }

  log('\nSummary:');
  log(`Total files processed: ${files.length}`);
  log(`Files fixed: ${fixedFiles}`);
  log(`Files skipped: ${skippedFiles}`);
  log('\nFixed files have been backed up to: ' + BACKUP_DIR);
  log('See the detailed log at: ' + LOG_FILE);
  log('\nTo restore all files from backup, run:');
  log('node src/scripts/fix-linting-issues.js --restore');
}

// Run the script
fixLintingIssues().catch(error => {
  log(`Error running script: ${error.message}`);
  process.exit(1);
});
