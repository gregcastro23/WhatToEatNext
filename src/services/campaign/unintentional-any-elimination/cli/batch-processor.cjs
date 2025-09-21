#!/usr/bin/env node

/**
 * Batch Processing CLI Tool
 *
 * Specialized tool for batch processing with advanced safety controls
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  maxFiles: parseInt(process.env.MAX_FILES) || 15,
  safetyLevel: process.env.SAFETY_LEVEL || 'MAXIMUM',
  validationFrequency: parseInt(process.env.VALIDATION_FREQ) || 5,
  backupDir: process.env.BACKUP_DIR || './backups',
  logFile: process.env.LOG_FILE || './logs/batch-processing.log'
};

// Ensure directories exist
[CONFIG.backupDir, path.dirname(CONFIG.logFile)].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Logging with file output
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

// Safety checkpoint
function createSafetyCheckpoint(description) {
  const checkpointId = `checkpoint-${Date.now()}`;
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

// Rollback to checkpoint
function rollbackToCheckpoint(checkpointId) {
  const checkpointPath = path.join(CONFIG.backupDir, `${checkpointId}.json`);

  if (!fs.existsSync(checkpointPath)) {
    throw new Error(`Checkpoint not found: ${checkpointId}`);
  }

  try {
    const checkpoint = JSON.parse(fs.readFileSync(checkpointPath, 'utf8'));

    // Apply git stash
    execSync('git stash pop', { stdio: 'pipe' });

    log('info', `Rolled back to checkpoint: ${checkpointId}`, checkpoint);
    return checkpoint;

  } catch (error) {
    log('error', 'Rollback failed', { checkpointId, error: error.message });
    throw error;
  }
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

// Validate build
function validateBuild() {
  try {
    execSync('yarn tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
    return { status: 'passing', errors: 0 };
  } catch (error) {
    const errorCount = getTypeScriptErrorCount();
    return { status: 'failing', errors: errorCount };
  }
}

// Batch processing with safety
async function processBatch(options = {}) {
  const {
    maxFiles = CONFIG.maxFiles,
    safetyLevel = CONFIG.safetyLevel,
    dryRun = false,
    filePattern = 'src/**/*.ts',
    continueOnError = false
  } = options;

  log('info', 'Starting batch processing', { maxFiles, safetyLevel, dryRun, filePattern });

  // Create initial checkpoint
  const initialCheckpoint = createSafetyCheckpoint('Batch processing start');

  const results = {
    startTime: Date.now(),
    initialMetrics: {
      typeScriptErrors: getTypeScriptErrorCount(),
      explicitAnyWarnings: getExplicitAnyCount()
    },
    checkpoints: [initialCheckpoint],
    batches: [],
    finalMetrics: null,
    success: false
  };

  try {
    // Get files to process
    const filesToProcess = getFilesToProcess(filePattern, maxFiles);
    log('info', `Found ${filesToProcess.length} files to process`);

    if (filesToProcess.length === 0) {
      log('warn', 'No files found to process');
      return results;
    }

    // Process in batches
    const batchSize = Math.min(CONFIG.validationFrequency, filesToProcess.length);
    const batches = [];

    for (let i = 0; i < filesToProcess.length; i += batchSize) {
      batches.push(filesToProcess.slice(i, i + batchSize));
    }

    log('info', `Processing ${batches.length} batches of up to ${batchSize} files each`);

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      const batchId = `batch-${batchIndex + 1}`;

      log('info', `Processing ${batchId}: ${batch.length} files`);

      // Create batch checkpoint
      const batchCheckpoint = createSafetyCheckpoint(`${batchId} start`);
      results.checkpoints.push(batchCheckpoint);

      const batchResult = {
        batchId,
        files: batch,
        startTime: Date.now(),
        success: false,
        errors: [],
        replacements: 0
      };

      try {
        if (!dryRun) {
          // Process the batch
          const processResult = await processBatchFiles(batch, safetyLevel);
          batchResult.replacements = processResult.replacements;
          batchResult.errors = processResult.errors;
        } else {
          log('info', `DRY RUN: Would process ${batch.length} files`);
          batchResult.replacements = 0;
        }

        // Validate build after batch
        const buildValidation = validateBuild();
        batchResult.buildValidation = buildValidation;

        if (buildValidation.status === 'failing' && safetyLevel === 'MAXIMUM') {
          log('error', `Build validation failed after ${batchId}`, buildValidation);

          // Rollback batch
          rollbackToCheckpoint(batchCheckpoint.id);
          batchResult.rolledBack = true;

          if (!continueOnError) {
            throw new Error(`Build validation failed after ${batchId}`);
          }
        } else {
          batchResult.success = true;
        }

        batchResult.endTime = Date.now();
        batchResult.duration = batchResult.endTime - batchResult.startTime;

        results.batches.push(batchResult);

        log('info', `Completed ${batchId}`, {
          duration: batchResult.duration,
          replacements: batchResult.replacements,
          buildStatus: buildValidation.status
        });

      } catch (error) {
        log('error', `Batch ${batchId} failed`, { error: error.message });
        batchResult.error = error.message;
        batchResult.endTime = Date.now();
        batchResult.duration = batchResult.endTime - batchResult.startTime;
        results.batches.push(batchResult);

        if (!continueOnError) {
          throw error;
        }
      }
    }

    // Final metrics
    results.finalMetrics = {
      typeScriptErrors: getTypeScriptErrorCount(),
      explicitAnyWarnings: getExplicitAnyCount()
    };

    results.success = true;
    results.endTime = Date.now();
    results.totalDuration = results.endTime - results.startTime;

    // Calculate improvements
    results.improvements = {
      typeScriptErrorReduction: results.initialMetrics.typeScriptErrors - results.finalMetrics.typeScriptErrors,
      explicitAnyReduction: results.initialMetrics.explicitAnyWarnings - results.finalMetrics.explicitAnyWarnings
    };

    log('info', 'Batch processing completed successfully', {
      totalDuration: results.totalDuration,
      batchesProcessed: results.batches.length,
      improvements: results.improvements
    });

    return results;

  } catch (error) {
    log('error', 'Batch processing failed', { error: error.message });

    // Rollback to initial checkpoint
    try {
      rollbackToCheckpoint(initialCheckpoint.id);
      results.rolledBackToStart = true;
    } catch (rollbackError) {
      log('error', 'Failed to rollback to initial checkpoint', { error: rollbackError.message });
    }

    results.error = error.message;
    results.endTime = Date.now();
    results.totalDuration = results.endTime - results.startTime;

    throw error;
  }
}

// Get files to process
function getFilesToProcess(pattern, maxFiles) {
  try {
    const findCommand = `find src -name "*.ts" -not -path "*/node_modules/*" -not -path "*/__tests__/*" | head -${maxFiles}`;
    const output = execSync(findCommand, { encoding: 'utf8' });
    return output.trim().split('\n').filter(line => line.trim());
  } catch (error) {
    log('error', 'Failed to get files to process', { error: error.message });
    return [];
  }
}

// Process batch of files
async function processBatchFiles(files, safetyLevel) {
  const result = {
    replacements: 0,
    errors: []
  };

  for (const file of files) {
    try {
      // Use the SafeTypeReplacer to process the file
      const processCommand = `node -e "
        const { SafeTypeReplacer } = require('./src/services/campaign/unintentional-any-elimination/SafeTypeReplacer.ts');
        const replacer = new SafeTypeReplacer();
        replacer.processFile('${file}', { safetyLevel: '${safetyLevel}' })
          .then(result => console.log(JSON.stringify(result, null, 2)))
          .catch(err => { console.error(err); process.exit(1); });
      "`;

      const processOutput = execSync(processCommand, {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 30000 // 30 second timeout per file
      });

      const fileResult = JSON.parse(processOutput);
      result.replacements += fileResult.replacements || 0;

    } catch (error) {
      log('error', `Failed to process file: ${file}`, { error: error.message });
      result.errors.push({ file, error: error.message });
    }
  }

  return result;
}

// Command line interface
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  // Parse options
  const options = {};
  args.slice(1).forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      options[key] = value || true;
    }
  });

  switch (command) {
    case 'process':
      processBatch({
        maxFiles: parseInt(options['max-files']) || CONFIG.maxFiles,
        safetyLevel: options.safety || CONFIG.safetyLevel,
        dryRun: options['dry-run'] || false,
        filePattern: options.files || 'src/**/*.ts',
        continueOnError: options['continue-on-error'] || false
      }).then(result => {
        console.log('\n=== BATCH PROCESSING RESULTS ===');
        console.log(JSON.stringify(result, null, 2));
      }).catch(error => {
        console.error('Batch processing failed:', error.message);
        process.exit(1);
      });
      break;

    case 'checkpoint':
      const description = options.description || 'Manual checkpoint';
      try {
        const checkpoint = createSafetyCheckpoint(description);
        console.log('Checkpoint created:', checkpoint.id);
      } catch (error) {
        console.error('Failed to create checkpoint:', error.message);
        process.exit(1);
      }
      break;

    case 'rollback':
      const checkpointId = options.checkpoint;
      if (!checkpointId) {
        console.error('Checkpoint ID required for rollback');
        process.exit(1);
      }
      try {
        const checkpoint = rollbackToCheckpoint(checkpointId);
        console.log('Rolled back to checkpoint:', checkpoint.id);
      } catch (error) {
        console.error('Rollback failed:', error.message);
        process.exit(1);
      }
      break;

    case 'validate':
      const buildResult = validateBuild();
      console.log('Build validation:', buildResult);
      if (buildResult.status === 'failing') {
        process.exit(1);
      }
      break;

    default:
      console.log(`
Batch Processing CLI Tool

USAGE:
  node batch-processor.cjs <command> [options]

COMMANDS:
  process [--max-files=<n>] [--safety=<level>] [--dry-run] [--continue-on-error]
    Process files in batches with safety controls

  checkpoint [--description=<text>]
    Create a safety checkpoint

  rollback --checkpoint=<id>
    Rollback to a specific checkpoint

  validate
    Validate current build status

OPTIONS:
  --max-files=<n>         Maximum files to process (default: ${CONFIG.maxFiles})
  --safety=<level>        Safety level: MAXIMUM|HIGH|MEDIUM (default: ${CONFIG.safetyLevel})
  --files=<pattern>       File pattern to process (default: src/**/*.ts)
  --dry-run               Show what would be done without executing
  --continue-on-error     Continue processing even if batches fail
  --description=<text>    Description for checkpoint
  --checkpoint=<id>       Checkpoint ID for rollback

EXAMPLES:
  # Process up to 10 files with maximum safety
  node batch-processor.cjs process --max-files=10 --safety=MAXIMUM

  # Create a checkpoint before major changes
  node batch-processor.cjs checkpoint --description="Before major refactor"

  # Rollback to a specific checkpoint
  node batch-processor.cjs rollback --checkpoint=checkpoint-1234567890

  # Validate build status
  node batch-processor.cjs validate
      `);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  processBatch,
  createSafetyCheckpoint,
  rollbackToCheckpoint,
  validateBuild
};
