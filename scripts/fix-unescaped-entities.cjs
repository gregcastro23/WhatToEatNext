#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  sourceDir: './src',
  extensions: ['.tsx', '.jsx'],
  dryRun: process.argv.includes('--dry-run'),
  createBackup: true,
  excludePatterns: ['node_modules', '.next', 'dist', 'build'],
};

// Track fix metrics
const metrics = {
  filesProcessed: 0,
  filesModified: 0,
  entitiesFixed: 0,
  errors: [],
};

// HTML entities that should be escaped in JSX
const ENTITY_FIXES = [
  {
    // Unescaped ampersand followed by word characters (not entities) in JSX text
    pattern: />([^<]*?)&([a-zA-Z][^<;]*?)</g,
    replacement: '>$1&amp;$2<',
    description: 'Escape unescaped ampersand in JSX text',
  },
  {
    // Unescaped single quote in JSX text between tags (common in contractions)
    pattern: />([^<]*?[a-zA-Z])'([a-zA-Z][^<]*?)</g,
    replacement: '>$1&apos;$2<',
    description: 'Escape unescaped single quote in JSX text',
  },
  {
    // Unescaped double quote in JSX text content
    pattern: />([^<]*?[a-zA-Z])"([a-zA-Z][^<]*?)</g,
    replacement: '>$1&quot;$2<',
    description: 'Escape unescaped double quote in JSX text',
  },
];

// Special patterns that should NOT be escaped (preserve these)
const PRESERVE_PATTERNS = [
  /&amp;/g, // Already escaped ampersand
  /&lt;/g, // Already escaped less than
  /&gt;/g, // Already escaped greater than
  /&quot;/g, // Already escaped double quote
  /&apos;/g, // Already escaped single quote
  /&#\d+;/g, // Numeric entities
  /&#x[0-9a-fA-F]+;/g, // Hex entities
  /&[a-zA-Z]+;/g, // Named entities
];

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix =
    {
      info: '✓',
      warn: '⚠',
      error: '✗',
      debug: '→',
    }[type] || '•';

  console.log(`[${timestamp}] ${prefix} ${message}`);
}

function createBackup(filePath) {
  if (!CONFIG.createBackup) return null;

  const backupPath = `${filePath}.backup-${Date.now()}`;
  fs.copyFileSync(filePath, backupPath);
  return backupPath;
}

function getAllReactFiles(dir) {
  const files = [];

  function scanDirectory(directory) {
    try {
      const items = fs.readdirSync(directory);

      for (const item of items) {
        const fullPath = path.join(directory, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          if (!CONFIG.excludePatterns.some(pattern => item.includes(pattern))) {
            scanDirectory(fullPath);
          }
        } else if (stat.isFile()) {
          if (CONFIG.extensions.some(ext => fullPath.endsWith(ext))) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      log(`Error scanning directory ${directory}: ${error.message}`, 'error');
    }
  }

  scanDirectory(dir);
  return files;
}

function isPreservedContent(text) {
  // Check if text contains already escaped entities that should be preserved
  return PRESERVE_PATTERNS.some(pattern => {
    pattern.lastIndex = 0; // Reset regex state
    return pattern.test(text);
  });
}

function fixFileEntities(filePath) {
  try {
    const originalContent = fs.readFileSync(filePath, 'utf8');
    let modifiedContent = originalContent;
    let fileFixCount = 0;

    // Apply each entity fix pattern
    for (const fix of ENTITY_FIXES) {
      const beforeLength = modifiedContent.length;

      // Apply the fix pattern
      modifiedContent = modifiedContent.replace(fix.pattern, (match, ...groups) => {
        // Check if this content should be preserved
        if (isPreservedContent(match)) {
          return match; // Don't modify already escaped content
        }

        const replacement = fix.replacement;
        log(`  ${fix.description}: ${match.trim()} → ${replacement}`, 'debug');
        fileFixCount++;

        return replacement;
      });

      const afterLength = modifiedContent.length;
      if (afterLength !== beforeLength) {
        log(`  Applied: ${fix.description}`, 'debug');
      }
    }

    // Only write file if changes were made
    if (modifiedContent !== originalContent) {
      if (CONFIG.dryRun) {
        log(
          `[DRY RUN] Would fix ${fileFixCount} entities in ${path.relative(process.cwd(), filePath)}`,
          'info',
        );
      } else {
        // Create backup before modifying
        const backupPath = createBackup(filePath);
        if (backupPath) {
          log(`  Created backup: ${path.basename(backupPath)}`, 'debug');
        }

        // Write the fixed content
        fs.writeFileSync(filePath, modifiedContent, 'utf8');
        log(`Fixed ${fileFixCount} entities in ${path.relative(process.cwd(), filePath)}`, 'info');
      }

      metrics.filesModified++;
      metrics.entitiesFixed += fileFixCount;
    }

    metrics.filesProcessed++;
    return fileFixCount;
  } catch (error) {
    const errorMsg = `Error processing ${filePath}: ${error.message}`;
    log(errorMsg, 'error');
    metrics.errors.push(errorMsg);
    return 0;
  }
}

function validateFixes() {
  // Run a quick validation to ensure we haven't broken anything
  log('Validating fixes...');

  try {
    // Try to run TypeScript compilation to catch syntax errors
    const { execSync } = require('child_process');
    execSync('yarn tsc --noEmit --skipLibCheck', {
      stdio: 'ignore',
      timeout: 30000, // 30 second timeout
    });
    log('TypeScript validation passed', 'info');
    return true;
  } catch (error) {
    log('TypeScript validation failed - some fixes may have introduced errors', 'warn');
    log('Check the backup files if needed', 'warn');
    return false;
  }
}

function main() {
  log('Starting unescaped entities fix script...');
  log(`Mode: ${CONFIG.dryRun ? 'DRY RUN' : 'LIVE FIX'}`);

  // Find all React files
  const reactFiles = getAllReactFiles(CONFIG.sourceDir);
  log(`Found ${reactFiles.length} React component files`);

  if (reactFiles.length === 0) {
    log('No React files found to process', 'warn');
    return;
  }

  // Process each file
  let totalFixesApplied = 0;
  for (const file of reactFiles) {
    const fixes = fixFileEntities(file);
    totalFixesApplied += fixes;

    // Progress update every 20 files
    if (metrics.filesProcessed % 20 === 0) {
      log(`Progress: ${metrics.filesProcessed}/${reactFiles.length} files processed`);
    }
  }

  // Validate fixes if not in dry run mode
  if (!CONFIG.dryRun && metrics.filesModified > 0) {
    validateFixes();
  }

  // Final summary
  log('\n=== Unescaped Entities Fix Complete ===');
  log(`Files processed: ${metrics.filesProcessed}`);
  log(`Files modified: ${metrics.filesModified}`);
  log(`Entities fixed: ${metrics.entitiesFixed}`);

  if (metrics.errors.length > 0) {
    log(`Errors encountered: ${metrics.errors.length}`, 'error');
    metrics.errors.forEach(error => log(`  - ${error}`, 'error'));
  }

  if (totalFixesApplied > 0) {
    log(`\n✓ Successfully fixed ${totalFixesApplied} unescaped entities!`);
    if (!CONFIG.dryRun) {
      log('Backup files created for all modified files');
      log('Run "git diff" to review changes');
    }
  } else {
    log('No unescaped entities found to fix', 'info');
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { fixFileEntities, ENTITY_FIXES };
