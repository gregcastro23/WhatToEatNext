#!/usr/bin/env node

/**
 * Enhanced Explicit-Any Fix Script with Classification
 *
 * Integrates with the unintentional any elimination system for smarter fixes
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  maxFiles: parseInt(process.env.MAX_FILES) || 15,
  safetyLevel: process.env.SAFETY_LEVEL || 'MAXIMUM',
  batchSize: parseInt(process.env.BATCH_SIZE) || 5,
  backupDir: process.env.BACKUP_DIR || './backups/enhanced-fixes',
  logFile: process.env.LOG_FILE || './logs/enhanced-fixes.log',
  dryRun: process.env.DRY_RUN === 'true',
  useClassification: process.env.USE_CLASSIFICATION !== 'false'
};

// Ensure directories exist
[CONFIG.backupDir, path.dirname(CONFIG.logFile)].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Logging utility
function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level: level.toUpperCase(),
    message,
    data
  };

  const logLine = JSON.stringify(logEntry) + '\n';

  // Console output
  console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }

  // File output
  fs.appendFileSync(CONFIG.logFile, logLine);
}

// Get current error counts
function getTypeScriptErrorCount() {
  try {
    const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS"', {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    return parseInt(output.trim()) || 0;
  } catch (error) {
    return error.status === 1 ? 0 : -1;
  }
}

function getExplicitAnyCount() {
  try {
    const output = execSync('yarn lint --format=unix 2>/dev/null | grep -c "@typescript-eslint/no-explicit-any"', {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    return parseInt(output.trim()) || 0;
  } catch (error) {
    return error.status === 1 ? 0 : -1;
  }
}

// Create safety checkpoint
function createSafetyCheckpoint(description) {
  const checkpointId = `enhanced-fix-${Date.now()}`;
  const checkpointPath = path.join(CONFIG.backupDir, `${checkpointId}.json`);

  try {
    // Create git stash
    const stashOutput = execSync('git stash push -m "' + description + '"', {
      encoding: 'utf8',
      stdio: 'pipe'
    });

    const checkpoint = {
      id: checkpointId,
      timestamp: new Date().toISOString(),
      description,
      gitStash: stashOutput.trim(),
      typeScriptErrors: getTypeScriptErrorCount(),
      explicitAnyWarnings: getExplicitAnyCount()
    };

    fs.writeFileSync(checkpointPath, JSON.stringify(checkpoint, null, 2));

    log('info', `Safety checkpoint created: ${checkpointId}`, checkpoint);
    return checkpoint;

  } catch (error) {
    log('error', 'Failed to create safety checkpoint', { error: error.message });
    throw error;
  }
}

// Classify any types using the classification system
async function classifyAnyTypes(filePath) {
  if (!CONFIG.useClassification) {
    log('debug', 'Classification disabled, using fallback patterns');
    return classifyWithFallback(filePath);
  }

  try {
    const classificationCommand = `node -e "
      const { AnyTypeClassifier } = require('./src/services/campaign/unintentional-any-elimination/AnyTypeClassifier.ts');
      const classifier = new AnyTypeClassifier();
      classifier.classifyFile('${filePath}')
        .then(result => console.log(JSON.stringify(result, null, 2)))
        .catch(err => { console.error(err); process.exit(1); });
    "`;

    const classificationOutput = execSync(classificationCommand, {
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 30000
    });

    const classifications = JSON.parse(classificationOutput);
    log('debug', `Classified ${classifications.length} any types in ${filePath}`);

    return classifications;

  } catch (error) {
    log('warn', `Classification failed for ${filePath}, using fallback`, { error: error.message });
    return classifyWithFallback(filePath);
  }
}

// Fallback classification using simple patterns
function classifyWithFallback(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const classifications = [];

    lines.forEach((line, index) => {
      const lineNumber = index + 1;

      // Look for any types
      const anyMatches = line.match(/:\s*any\b/g);
      if (anyMatches) {
        anyMatches.forEach(() => {
          let isIntentional = false;
          let confidence = 0.7;
          let suggestedReplacement = 'unknown';
          let category = 'unknown';

          // Simple heuristics
          if (line.includes('catch') || line.includes('error')) {
            isIntentional = true;
            confidence = 0.9;
            category = 'error_handling';
          } else if (line.includes('any[]')) {
            isIntentional = false;
            confidence = 0.95;
            suggestedReplacement = 'unknown[]';
            category = 'array_type';
          } else if (line.includes('Record<string, any>')) {
            isIntentional = false;
            confidence = 0.85;
            suggestedReplacement = 'Record<string, unknown>';
            category = 'record_type';
          } else if (line.includes('jest.') || line.includes('Mock')) {
            isIntentional = true;
            confidence = 0.8;
            category = 'test_mock';
          } else if (index > 0 && lines[index - 1].includes('//')) {
            isIntentional = true;
            confidence = 0.9;
            category = 'documented';
          }

          classifications.push({
            filePath,
            lineNumber,
            codeSnippet: line.trim(),
            isIntentional,
            confidence,
            suggestedReplacement,
            category,
            reasoning: `Fallback classification based on patterns`
          });
        });
      }
    });

    return classifications;

  } catch (error) {
    log('error', `Fallback classification failed for ${filePath}`, { error: error.message });
    return [];
  }
}

// Apply safe replacements based on classification
function applySafeReplacements(filePath, classifications) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let fixes = 0;
    const appliedFixes = [];

    // Filter for unintentional any types with high confidence
    const safeReplacements = classifications.filter(c =>
      !c.isIntentional &&
      c.confidence >= 0.8 &&
      c.suggestedReplacement &&
      ['array_type', 'record_type', 'variable_assignment'].includes(c.category)
    );

    log('debug', `Found ${safeReplacements.length} safe replacements in ${filePath}`);

    // Apply replacements in reverse order to maintain line numbers
    safeReplacements.reverse().forEach(replacement => {
      const lines = content.split('\n');
      const lineIndex = replacement.lineNumber - 1;

      if (lineIndex >= 0 && lineIndex < lines.length) {
        const originalLine = lines[lineIndex];
        let newLine = originalLine;

        // Apply specific replacement based on category
        switch (replacement.category) {
          case 'array_type':
            newLine = originalLine.replace(/:\s*any\[\]/g, ': unknown[]');
            break;
          case 'record_type':
            newLine = originalLine.replace(/Record<string,\s*any>/g, 'Record<string, unknown>');
            break;
          case 'variable_assignment':
            newLine = originalLine.replace(/:\s*any\s*=/g, ': unknown =');
            break;
        }

        if (newLine !== originalLine) {
          lines[lineIndex] = newLine;
          content = lines.join('\n');
          fixes++;

          appliedFixes.push({
            lineNumber: replacement.lineNumber,
            category: replacement.category,
            original: originalLine.trim(),
            replacement: newLine.trim(),
            confidence: replacement.confidence
          });

          log('debug', `Applied fix at line ${replacement.lineNumber}`, {
            category: replacement.category,
            confidence: replacement.confidence
          });
        }
      }
    });

    if (fixes > 0) {
      if (CONFIG.dryRun) {
        log('info', `DRY RUN: Would apply ${fixes} fixes to ${filePath}`, appliedFixes);
        return { fixes: 0, appliedFixes: [], dryRun: true };
      }

      // Create backup
      const backupPath = path.join(CONFIG.backupDir, `${path.basename(filePath)}.backup-${Date.now()}`);
      fs.writeFileSync(backupPath, originalContent);

      // Write fixed content
      fs.writeFileSync(filePath, content);

      log('info', `Applied ${fixes} fixes to ${filePath}`, appliedFixes);

      // Test TypeScript compilation
      try {
        execSync('yarn tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
        log('info', 'TypeScript compilation successful after fixes');
        return { fixes, appliedFixes, success: true };
      } catch (error) {
        log('error', 'TypeScript compilation failed - restoring backup');
        fs.writeFileSync(filePath, originalContent);
        return { fixes: 0, appliedFixes: [], success: false, error: 'compilation_failed' };
      }
    }

    return { fixes: 0, appliedFixes: [], success: true };

  } catch (error) {
    log('error', `Error applying replacements to ${filePath}`, { error: error.message });
    return { fixes: 0, appliedFixes: [], success: false, error: error.message };
  }
}

// Get files with explicit-any warnings
function getFilesWithExplicitAny(maxFiles = CONFIG.maxFiles) {
  try {
    const output = execSync(
      `yarn lint --format=unix 2>/dev/null | grep "@typescript-eslint/no-explicit-any" | cut -d: -f1 | sort | uniq -c | sort -nr | head -${maxFiles}`,
      { encoding: 'utf8' }
    );

    const files = [];
    output.split('\n').forEach(line => {
      const match = line.trim().match(/^\s*(\d+)\s+(.+)$/);
      if (match) {
        const count = parseInt(match[1]);
        const filePath = match[2].trim();
        files.push({ path: filePath, count });
      }
    });

    return files;

  } catch (error) {
    log('error', 'Error getting files with explicit-any warnings', { error: error.message });
    return [];
  }
}

// Process files in batches
async function processBatch(files) {
  const results = {
    startTime: Date.now(),
    initialMetrics: {
      typeScriptErrors: getTypeScriptErrorCount(),
      explicitAnyWarnings: getExplicitAnyCount()
    },
    processedFiles: [],
    totalFixes: 0,
    successfulFiles: 0,
    failedFiles: 0,
    errors: []
  };

  log('info', `Processing batch of ${files.length} files`, {
    dryRun: CONFIG.dryRun,
    useClassification: CONFIG.useClassification
  });

  for (const file of files) {
    const fileResult = {
      filePath: file.path,
      anyCount: file.count,
      startTime: Date.now(),
      classifications: [],
      fixes: 0,
      success: false,
      error: null
    };

    try {
      log('info', `Processing ${file.path} (${file.count} any types)`);

      // Classify any types
      const classifications = await classifyAnyTypes(file.path);
      fileResult.classifications = classifications;

      // Apply safe replacements
      const replacementResult = applySafeReplacements(file.path, classifications);
      fileResult.fixes = replacementResult.fixes;
      fileResult.appliedFixes = replacementResult.appliedFixes;
      fileResult.success = replacementResult.success;
      fileResult.error = replacementResult.error;

      if (replacementResult.success) {
        results.successfulFiles++;
        results.totalFixes += replacementResult.fixes;
      } else {
        results.failedFiles++;
        results.errors.push({
          file: file.path,
          error: replacementResult.error
        });
      }

    } catch (error) {
      log('error', `Failed to process ${file.path}`, { error: error.message });
      fileResult.success = false;
      fileResult.error = error.message;
      results.failedFiles++;
      results.errors.push({
        file: file.path,
        error: error.message
      });
    }

    fileResult.endTime = Date.now();
    fileResult.duration = fileResult.endTime - fileResult.startTime;
    results.processedFiles.push(fileResult);
  }

  // Final metrics
  results.finalMetrics = {
    typeScriptErrors: getTypeScriptErrorCount(),
    explicitAnyWarnings: getExplicitAnyCount()
  };

  results.endTime = Date.now();
  results.totalDuration = results.endTime - results.startTime;

  // Calculate improvements
  results.improvements = {
    typeScriptErrorReduction: results.initialMetrics.typeScriptErrors - results.finalMetrics.typeScriptErrors,
    explicitAnyReduction: results.initialMetrics.explicitAnyWarnings - results.finalMetrics.explicitAnyWarnings
  };

  return results;
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  // Parse options
  const options = {};
  args.forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      options[key] = value || true;
    }
  });

  // Override config with command line options
  if (options['max-files']) CONFIG.maxFiles = parseInt(options['max-files']);
  if (options['safety']) CONFIG.safetyLevel = options['safety'];
  if (options['dry-run']) CONFIG.dryRun = true;
  if (options['no-classification']) CONFIG.useClassification = false;

  log('info', 'Starting enhanced explicit-any fix script', {
    config: CONFIG,
    options
  });

  try {
    // Create initial checkpoint
    const checkpoint = createSafetyCheckpoint('Enhanced explicit-any fixes start');

    // Get files to process
    const files = getFilesWithExplicitAny(CONFIG.maxFiles);

    if (files.length === 0) {
      log('info', 'No files with explicit-any warnings found');
      return;
    }

    log('info', `Found ${files.length} files with explicit-any warnings`);

    // Process files in batches
    const batchSize = CONFIG.batchSize;
    const batches = [];

    for (let i = 0; i < files.length; i += batchSize) {
      batches.push(files.slice(i, i + batchSize));
    }

    let totalResults = {
      batches: [],
      totalFixes: 0,
      successfulFiles: 0,
      failedFiles: 0,
      totalDuration: 0
    };

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      log('info', `Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} files)`);

      const batchResults = await processBatch(batch);
      totalResults.batches.push(batchResults);
      totalResults.totalFixes += batchResults.totalFixes;
      totalResults.successfulFiles += batchResults.successfulFiles;
      totalResults.failedFiles += batchResults.failedFiles;
      totalResults.totalDuration += batchResults.totalDuration;

      // Validate build after each batch if safety level is MAXIMUM
      if (CONFIG.safetyLevel === 'MAXIMUM' && !CONFIG.dryRun) {
        try {
          execSync('yarn tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
          log('info', `Build validation passed after batch ${batchIndex + 1}`);
        } catch (error) {
          log('error', `Build validation failed after batch ${batchIndex + 1} - stopping`);
          break;
        }
      }
    }

    // Generate final report
    const reportPath = path.join(CONFIG.backupDir, `enhanced-fix-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(totalResults, null, 2));

    log('info', 'Enhanced explicit-any fix script completed', {
      totalFixes: totalResults.totalFixes,
      successfulFiles: totalResults.successfulFiles,
      failedFiles: totalResults.failedFiles,
      totalDuration: totalResults.totalDuration,
      reportPath
    });

    // Display summary
    console.log('\n=== ENHANCED FIX SUMMARY ===');
    console.log(`Total Fixes Applied: ${totalResults.totalFixes}`);
    console.log(`Successful Files: ${totalResults.successfulFiles}`);
    console.log(`Failed Files: ${totalResults.failedFiles}`);
    console.log(`Total Duration: ${totalResults.totalDuration}ms`);
    console.log(`Report Location: ${reportPath}`);

    if (CONFIG.dryRun) {
      console.log('\n🔍 DRY RUN MODE - No actual changes were made');
    }

  } catch (error) {
    log('error', 'Enhanced fix script failed', { error: error.message });
    console.error('Script failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  classifyAnyTypes,
  applySafeReplacements,
  processBatch,
  createSafetyCheckpoint
};
