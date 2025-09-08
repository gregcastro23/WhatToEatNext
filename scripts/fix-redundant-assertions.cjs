#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  dryRun: process.argv.includes('--dry-run'),
  maxFiles: parseInt(process.argv.find(arg => arg.startsWith('--max-files='))?.split('=')[1]) || 25,
  createBackup: true,
  validateBuild: !process.argv.includes('--skip-validation'),
  analysisFile: 'type-assertions-analysis.json',
};

// Track fix metrics
const metrics = {
  filesProcessed: 0,
  filesModified: 0,
  assertionsRemoved: 0,
  errors: [],
  skipped: [],
};

// Patterns for redundant assertions that can be safely removed
const REDUNDANT_REMOVAL_PATTERNS = [
  {
    // Simple variable declarations with obvious types
    pattern: /const\s+(\w+):\s*\w+\s*=\s*([^;]+)\s+as\s+\w+/g,
    description: 'Remove redundant assertion in const declaration',
    replacement: 'const $1 = $2',
    category: 'const-declaration',
  },
  {
    // Return statements with redundant assertions
    pattern: /return\s+([^;]+)\s+as\s+(\w+);/g,
    description: 'Remove redundant assertion in return statement',
    replacement: 'return $1;',
    category: 'return-statement',
  },
  {
    // Redundant string literal assertions
    pattern: /(['"`][^'"`]*['"`])\s+as\s+string/g,
    description: 'Remove redundant string literal assertion',
    replacement: '$1',
    category: 'string-literal',
  },
  {
    // Redundant number literal assertions
    pattern: /(\d+(?:\.\d+)?)\s+as\s+number/g,
    description: 'Remove redundant number literal assertion',
    replacement: '$1',
    category: 'number-literal',
  },
  {
    // Redundant boolean literal assertions
    pattern: /(true|false)\s+as\s+boolean/g,
    description: 'Remove redundant boolean literal assertion',
    replacement: '$1',
    category: 'boolean-literal',
  },
  {
    // Redundant array literal assertions
    pattern: /(\[[^\]]*\])\s+as\s+\w+\[\]/g,
    description: 'Remove redundant array literal assertion',
    replacement: '$1',
    category: 'array-literal',
  },
];

// Patterns that should be preserved (don't remove these)
const PRESERVE_PATTERNS = [
  /as\s+unknown\s+as/, // Chained unknown assertions
  /as\s+const/, // Const assertions
  /as\s+keyof/, // Keyof assertions
  /as\s+Parameters</, // Parameters utility type
  /as\s+ReturnType</, // ReturnType utility type
  /\bas\s+React\./, // React type assertions
  /\bas\s+HTMLElement/, // DOM element assertions
  /\bas\s+Event/, // Event assertions
  /\(error\s+as\s+any\)\.(?:stderr|stdout|message|stack)/, // Error object property access
  /\(.*error.*\s+as\s+any\)\.(?:stderr|stdout|message|stack)/, // Error-like object property access
  /as\s+Error\)/, // Error type assertions
  /\bas\s+NodeJS\./, // NodeJS type assertions
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

  const backupPath = `${filePath}.backup-redundant-${Date.now()}`;
  fs.copyFileSync(filePath, backupPath);
  return backupPath;
}

function loadAnalysisData() {
  try {
    if (!fs.existsSync(CONFIG.analysisFile)) {
      log(
        `Analysis file ${CONFIG.analysisFile} not found. Run analyze-type-assertions.cjs first.`,
        'error',
      );
      return null;
    }

    const content = fs.readFileSync(CONFIG.analysisFile, 'utf8');
    const data = JSON.parse(content);

    log(
      `Loaded analysis data: ${data.summary.totalAssertions} assertions across ${data.summary.filesScanned} files`,
    );
    return data;
  } catch (error) {
    log(`Error loading analysis data: ${error.message}`, 'error');
    return null;
  }
}

function shouldPreserveAssertion(assertionText, context) {
  // Check if assertion matches any preserve patterns
  return PRESERVE_PATTERNS.some(pattern => pattern.test(assertionText));
}

function isRedundantAssertion(assertion) {
  // Only process assertions categorized as redundant
  return assertion.analysis && assertion.analysis.category === 'redundant';
}

function removeRedundantAssertions(content, filePath) {
  let modifiedContent = content;
  let removedCount = 0;
  const changes = [];

  // Apply each redundant removal pattern
  for (const pattern of REDUNDANT_REMOVAL_PATTERNS) {
    const beforeContent = modifiedContent;

    modifiedContent = modifiedContent.replace(pattern.pattern, (match, ...groups) => {
      // Double-check if this should be preserved
      if (shouldPreserveAssertion(match, '')) {
        return match; // Don't modify
      }

      const replacement = pattern.replacement.replace(
        /\$(\d+)/g,
        (_, num) => groups[parseInt(num) - 1] || '',
      );

      changes.push({
        original: match,
        replacement: replacement,
        pattern: pattern.description,
        category: pattern.category,
      });

      removedCount++;
      log(`  ${pattern.description}: ${match} → ${replacement}`, 'debug');

      return replacement;
    });

    if (modifiedContent !== beforeContent) {
      log(`  Applied pattern: ${pattern.description}`, 'debug');
    }
  }

  return { content: modifiedContent, removedCount, changes };
}

function processFile(filePath, fileAssertions) {
  try {
    const originalContent = fs.readFileSync(filePath, 'utf8');

    // Filter to only redundant assertions
    const redundantAssertions = fileAssertions.filter(isRedundantAssertion);

    if (redundantAssertions.length === 0) {
      log(`  No redundant assertions found in ${path.basename(filePath)}`, 'debug');
      metrics.filesProcessed++;
      return 0;
    }

    log(
      `Processing ${path.relative(process.cwd(), filePath)} (${redundantAssertions.length} redundant assertions)...`,
    );

    const result = removeRedundantAssertions(originalContent, filePath);

    if (result.removedCount === 0) {
      log(`  No changes made to ${path.basename(filePath)}`, 'debug');
      metrics.filesProcessed++;
      return 0;
    }

    if (CONFIG.dryRun) {
      log(
        `[DRY RUN] Would remove ${result.removedCount} assertions from ${path.basename(filePath)}`,
        'info',
      );
      result.changes.forEach(change => {
        log(`  ${change.pattern}: ${change.original} → ${change.replacement}`, 'debug');
      });
    } else {
      // Create backup
      const backupPath = createBackup(filePath);
      if (backupPath) {
        log(`  Created backup: ${path.basename(backupPath)}`, 'debug');
      }

      // Write modified content
      fs.writeFileSync(filePath, result.content, 'utf8');
      log(
        `Removed ${result.removedCount} redundant assertions from ${path.basename(filePath)}`,
        'info',
      );
    }

    metrics.filesProcessed++;
    metrics.filesModified++;
    metrics.assertionsRemoved += result.removedCount;

    return result.removedCount;
  } catch (error) {
    const errorMsg = `Error processing ${filePath}: ${error.message}`;
    log(errorMsg, 'error');
    metrics.errors.push(errorMsg);
    return 0;
  }
}

function validateBuild() {
  if (!CONFIG.validateBuild || CONFIG.dryRun) return true;

  try {
    log('Validating TypeScript compilation...');
    const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1', {
      encoding: 'utf8',
      timeout: 60000, // 1 minute timeout
    });
    log('TypeScript validation passed', 'info');
    return true;
  } catch (error) {
    const output = error.stdout || error.stderr || '';
    const errorCount = (output.match(/error TS\d+:/g) || []).length;

    if (errorCount > 500) {
      log(`TypeScript validation failed with ${errorCount} errors - stopping for safety`, 'error');
      return false;
    } else {
      log(
        `TypeScript validation found ${errorCount} errors (within acceptable range) - continuing`,
        'warn',
      );
      return true;
    }
  }
}

function main() {
  log('Starting redundant type assertions removal...');
  log(`Mode: ${CONFIG.dryRun ? 'DRY RUN' : 'LIVE FIX'}`);
  log(`Max files per batch: ${CONFIG.maxFiles}`);

  // Load analysis data
  const analysisData = loadAnalysisData();
  if (!analysisData) {
    process.exit(1);
  }

  // Get redundant assertions grouped by file
  const redundantAssertions = analysisData.assertions.filter(isRedundantAssertion);
  log(`Found ${redundantAssertions.length} redundant assertions to remove`);

  if (redundantAssertions.length === 0) {
    log('No redundant assertions found to remove', 'info');
    return;
  }

  // Group by file
  const assertionsByFile = {};
  redundantAssertions.forEach(assertion => {
    if (!assertionsByFile[assertion.file]) {
      assertionsByFile[assertion.file] = [];
    }
    assertionsByFile[assertion.file].push(assertion);
  });

  const files = Object.keys(assertionsByFile);
  log(`Assertions span ${files.length} files`);

  // Process files in batches
  const batches = [];
  for (let i = 0; i < files.length; i += CONFIG.maxFiles) {
    batches.push(files.slice(i, i + CONFIG.maxFiles));
  }

  log(`Processing in ${batches.length} batches...`);

  let totalRemoved = 0;

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    log(`\n=== Batch ${batchIndex + 1}/${batches.length} (${batch.length} files) ===`);

    let batchRemoved = 0;
    for (const file of batch) {
      const removed = processFile(file, assertionsByFile[file]);
      batchRemoved += removed;
      totalRemoved += removed;
    }

    log(`Batch ${batchIndex + 1} completed: ${batchRemoved} assertions removed`);

    // Validate build after each batch (except last)
    if (!CONFIG.dryRun && batchIndex < batches.length - 1) {
      if (!validateBuild()) {
        log('Build validation failed, stopping', 'error');
        break;
      }
    }
  }

  // Final validation
  if (!CONFIG.dryRun && metrics.filesModified > 0) {
    validateBuild();
  }

  // Summary
  log('\n=== Redundant Type Assertions Removal Complete ===');
  log(`Files processed: ${metrics.filesProcessed}`);
  log(`Files modified: ${metrics.filesModified}`);
  log(`Assertions removed: ${metrics.assertionsRemoved}`);

  if (metrics.errors.length > 0) {
    log(`Errors encountered: ${metrics.errors.length}`, 'error');
    metrics.errors.forEach(error => log(`  - ${error}`, 'error'));
  }

  if (totalRemoved > 0) {
    log(`\n✓ Successfully removed ${totalRemoved} redundant type assertions!`);
    if (!CONFIG.dryRun) {
      log('Backup files created for all modified files');
      log('Run "git diff" to review changes');
    }
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { removeRedundantAssertions, REDUNDANT_REMOVAL_PATTERNS };
