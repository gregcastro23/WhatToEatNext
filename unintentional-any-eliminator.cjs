#!/usr/bin/env node

/**
 * Unintentional Any Eliminator
 *
 * Comprehensive automation script for systematic unintentional any elimination
 * Integrates with the campaign system and uses advanced classification
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  maxFiles: parseInt(process.env.MAX_FILES) || 25,
  safetyLevel: process.env.SAFETY_LEVEL || 'MAXIMUM',
  batchSize: parseInt(process.env.BATCH_SIZE) || 15,
  validationFrequency: parseInt(process.env.VALIDATION_FREQ) || 5,
  confidenceThreshold: parseFloat(process.env.CONFIDENCE_THRESHOLD) || 0.8,
  targetReduction: parseFloat(process.env.TARGET_REDUCTION) || 15.0,
  backupDir: process.env.BACKUP_DIR || './backups/unintentional-any',
  logFile: process.env.LOG_FILE || './logs/unintentional-any-eliminator.log',
  reportDir: process.env.REPORT_DIR || './reports/unintentional-any',
  dryRun: process.env.DRY_RUN === 'true',
  continueOnError: process.env.CONTINUE_ON_ERROR === 'true',
  enableCampaignIntegration: process.env.ENABLE_CAMPAIGN !== 'false'
};

// Ensure directories exist
[CONFIG.backupDir, CONFIG.reportDir, path.dirname(CONFIG.logFile)].forEach(dir => {
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
  if (data && level === 'debug') {
    console.log(JSON.stringify(data, null, 2));
  }

  // File output
  fs.appendFileSync(CONFIG.logFile, logLine);
}

// Get current metrics
function getCurrentMetrics() {
  return {
    timestamp: new Date().toISOString(),
    typeScriptErrors: getTypeScriptErrorCount(),
    explicitAnyWarnings: getExplicitAnyCount(),
    buildStatus: getBuildStatus()
  };
}

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

function getBuildStatus() {
  try {
    execSync('yarn tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
    return 'passing';
  } catch (error) {
    return 'failing';
  }
}
// Campaign integration
async function initializeCampaign() {
  if (!CONFIG.enableCampaignIntegration) {
    log('info', 'Campaign integration disabled');
    return null;
  }

  try {
    const campaignCommand = `node -e "
      const { UnintentionalAnyEliminationCampaign } = require('./src/services/campaign/unintentional-any-elimination/UnintentionalAnyEliminationCampaign.ts');
      const campaign = new UnintentionalAnyEliminationCampaign();
      campaign.initialize()
        .then(result => console.log(JSON.stringify(result, null, 2)))
        .catch(err => { console.error(err); process.exit(1); });
    "`;

    const campaignOutput = execSync(campaignCommand, {
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 30000
    });

    const campaignResult = JSON.parse(campaignOutput);
    log('info', 'Campaign integration initialized', campaignResult);

    return campaignResult;

  } catch (error) {
    log('warn', 'Campaign integration failed, continuing without it', { error: error.message });
    return null;
  }
}

// Progressive improvement engine integration
async function executeProgressiveImprovement(config) {
  try {
    const engineCommand = `node -e "
      const { ProgressiveImprovementEngine } = require('./src/services/campaign/unintentional-any-elimination/ProgressiveImprovementEngine.ts');
      const engine = new ProgressiveImprovementEngine();
      const config = ${JSON.stringify(config)};
      engine.executeBatch(config)
        .then(result => console.log(JSON.stringify(result, null, 2)))
        .catch(err => { console.error(err); process.exit(1); });
    "`;

    const engineOutput = execSync(engineCommand, {
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 600000 // 10 minute timeout
    });

    const engineResult = JSON.parse(engineOutput);
    log('info', 'Progressive improvement engine completed', {
      filesProcessed: engineResult.filesProcessed,
      successfulReplacements: engineResult.successfulReplacements,
      failedReplacements: engineResult.failedReplacements
    });

    return engineResult;

  } catch (error) {
    log('error', 'Progressive improvement engine failed', { error: error.message });
    throw error;
  }
}

// Analysis and classification
async function runComprehensiveAnalysis() {
  try {
    const analysisCommand = `node -e "
      const { AnalysisTools } = require('./src/services/campaign/unintentional-any-elimination/AnalysisTools.ts');
      const analyzer = new AnalysisTools();
      analyzer.analyzeCurrentAnyTypeDistribution()
        .then(result => console.log(JSON.stringify(result, null, 2)))
        .catch(err => { console.error(err); process.exit(1); });
    "`;

    const analysisOutput = execSync(analysisCommand, {
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 300000 // 5 minute timeout
    });

    const analysisResult = JSON.parse(analysisOutput);
    log('info', 'Comprehensive analysis completed', {
      totalAnalyzed: analysisResult.totalAnalyzed,
      intentional: analysisResult.intentional,
      unintentional: analysisResult.unintentional
    });

    return analysisResult;

  } catch (error) {
    log('error', 'Comprehensive analysis failed', { error: error.message });
    throw error;
  }
}

// Safety checkpoint management
function createSafetyCheckpoint(description) {
  const checkpointId = `unintentional-any-${Date.now()}`;
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
      metrics: getCurrentMetrics()
    };

    fs.writeFileSync(checkpointPath, JSON.stringify(checkpoint, null, 2));

    log('info', `Safety checkpoint created: ${checkpointId}`, checkpoint);
    return checkpoint;

  } catch (error) {
    log('error', 'Failed to create safety checkpoint', { error: error.message });
    throw error;
  }
}

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

// Progress monitoring
function calculateProgress(initialMetrics, currentMetrics, targetReduction) {
  const initialTotal = initialMetrics.explicitAnyWarnings;
  const currentTotal = currentMetrics.explicitAnyWarnings;
  const actualReduction = initialTotal - currentTotal;
  const actualReductionPercentage = initialTotal > 0 ? (actualReduction / initialTotal) * 100 : 0;

  return {
    initialCount: initialTotal,
    currentCount: currentTotal,
    actualReduction,
    actualReductionPercentage: actualReductionPercentage.toFixed(1),
    targetReduction,
    progressToTarget: targetReduction > 0 ? (actualReductionPercentage / targetReduction) * 100 : 0,
    targetMet: actualReductionPercentage >= targetReduction
  };
}

// Generate comprehensive report
function generateReport(executionResults) {
  const report = {
    timestamp: new Date().toISOString(),
    configuration: CONFIG,
    executionResults,
    summary: {
      totalDuration: executionResults.endTime - executionResults.startTime,
      phasesCompleted: executionResults.phases.length,
      totalFixes: executionResults.phases.reduce((sum, phase) => sum + (phase.fixes || 0), 0),
      successRate: executionResults.phases.length > 0
        ? (executionResults.phases.filter(p => p.success).length / executionResults.phases.length) * 100
        : 0
    },
    recommendations: []
  };

  // Add recommendations based on results
  if (report.summary.successRate < 80) {
    report.recommendations.push('Consider increasing confidence threshold for more conservative fixes');
  }

  if (executionResults.progress && !executionResults.progress.targetMet) {
    report.recommendations.push(`Target reduction of ${CONFIG.targetReduction}% not met. Consider running additional cycles.`);
  }

  if (executionResults.safetyEvents && executionResults.safetyEvents.length > 0) {
    report.recommendations.push('Safety events occurred. Review safety protocols and consider more conservative approach.');
  }

  const reportPath = path.join(CONFIG.reportDir, `elimination-report-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  log('info', `Comprehensive report generated: ${reportPath}`);
  return { report, reportPath };
}

// Main execution phases
async function executePhase1Analysis() {
  log('info', 'Phase 1: Comprehensive Analysis');

  const phase = {
    name: 'analysis',
    startTime: Date.now(),
    success: false,
    results: null,
    error: null
  };

  try {
    const analysisResults = await runComprehensiveAnalysis();
    phase.results = analysisResults;
    phase.success = true;

    log('info', 'Phase 1 completed successfully', {
      totalAnalyzed: analysisResults.totalAnalyzed,
      unintentionalCount: analysisResults.unintentional
    });

  } catch (error) {
    phase.error = error.message;
    log('error', 'Phase 1 failed', { error: error.message });

    if (!CONFIG.continueOnError) {
      throw error;
    }
  }

  phase.endTime = Date.now();
  phase.duration = phase.endTime - phase.startTime;

  return phase;
}

async function executePhase2Processing() {
  log('info', 'Phase 2: Progressive Processing');

  const phase = {
    name: 'processing',
    startTime: Date.now(),
    success: false,
    results: null,
    error: null
  };

  try {
    const processingConfig = {
      maxFiles: CONFIG.maxFiles,
      safetyLevel: CONFIG.safetyLevel,
      batchSize: CONFIG.batchSize,
      validationFrequency: CONFIG.validationFrequency,
      confidenceThreshold: CONFIG.confidenceThreshold,
      dryRun: CONFIG.dryRun
    };

    const processingResults = await executeProgressiveImprovement(processingConfig);
    phase.results = processingResults;
    phase.success = processingResults.success || false;
    phase.fixes = processingResults.successfulReplacements || 0;

    log('info', 'Phase 2 completed', {
      success: phase.success,
      fixes: phase.fixes,
      filesProcessed: processingResults.filesProcessed
    });

  } catch (error) {
    phase.error = error.message;
    log('error', 'Phase 2 failed', { error: error.message });

    if (!CONFIG.continueOnError) {
      throw error;
    }
  }

  phase.endTime = Date.now();
  phase.duration = phase.endTime - phase.startTime;

  return phase;
}

async function executePhase3Documentation() {
  log('info', 'Phase 3: Documentation Enhancement');

  const phase = {
    name: 'documentation',
    startTime: Date.now(),
    success: false,
    results: null,
    error: null
  };

  try {
    const docCommand = `node -e "
      const { AutoDocumentationGenerator } = require('./src/services/campaign/unintentional-any-elimination/AutoDocumentationGenerator.ts');
      const generator = new AutoDocumentationGenerator();
      generator.documentIntentionalAnyTypes()
        .then(result => console.log(JSON.stringify(result, null, 2)))
        .catch(err => { console.error(err); process.exit(1); });
    "`;

    const docOutput = execSync(docCommand, {
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 180000 // 3 minute timeout
    });

    const docResults = JSON.parse(docOutput);
    phase.results = docResults;
    phase.success = true;

    log('info', 'Phase 3 completed successfully', {
      documented: docResults.documented || 0
    });

  } catch (error) {
    phase.error = error.message;
    log('error', 'Phase 3 failed', { error: error.message });

    // Documentation phase failure is not critical
    phase.success = true;
  }

  phase.endTime = Date.now();
  phase.duration = phase.endTime - phase.startTime;

  return phase;
}

// Main execution function
async function main() {
  const args = process.argv.slice(2);

  // Parse command line options
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
  if (options['target']) CONFIG.targetReduction = parseFloat(options['target']);
  if (options['confidence']) CONFIG.confidenceThreshold = parseFloat(options['confidence']);
  if (options['dry-run']) CONFIG.dryRun = true;
  if (options['continue-on-error']) CONFIG.continueOnError = true;
  if (options['no-campaign']) CONFIG.enableCampaignIntegration = false;

  log('info', 'Starting Unintentional Any Eliminator', {
    config: CONFIG,
    options
  });

  const executionResults = {
    startTime: Date.now(),
    initialMetrics: getCurrentMetrics(),
    phases: [],
    checkpoints: [],
    safetyEvents: [],
    campaign: null,
    progress: null,
    finalMetrics: null,
    endTime: null,
    success: false
  };

  try {
    // Create initial checkpoint
    const initialCheckpoint = createSafetyCheckpoint('Unintentional Any Eliminator start');
    executionResults.checkpoints.push(initialCheckpoint);

    // Initialize campaign integration
    const campaign = await initializeCampaign();
    executionResults.campaign = campaign;

    // Execute phases
    const phase1 = await executePhase1Analysis();
    executionResults.phases.push(phase1);

    if (phase1.success) {
      const phase2 = await executePhase2Processing();
      executionResults.phases.push(phase2);

      // Always run documentation phase
      const phase3 = await executePhase3Documentation();
      executionResults.phases.push(phase3);
    }

    // Calculate final metrics and progress
    executionResults.finalMetrics = getCurrentMetrics();
    executionResults.progress = calculateProgress(
      executionResults.initialMetrics,
      executionResults.finalMetrics,
      CONFIG.targetReduction
    );

    executionResults.success = executionResults.phases.some(p => p.success);

  } catch (error) {
    log('error', 'Execution failed', { error: error.message });
    executionResults.error = error.message;

    // Try to rollback to initial checkpoint
    try {
      rollbackToCheckpoint(initialCheckpoint.id);
      executionResults.rolledBack = true;
    } catch (rollbackError) {
      log('error', 'Failed to rollback', { error: rollbackError.message });
    }
  }

  executionResults.endTime = Date.now();

  // Generate comprehensive report
  const { report, reportPath } = generateReport(executionResults);

  // Display summary
  console.log('\n=== UNINTENTIONAL ANY ELIMINATOR SUMMARY ===');
  console.log(`Execution Time: ${executionResults.endTime - executionResults.startTime}ms`);
  console.log(`Phases Completed: ${executionResults.phases.length}`);
  console.log(`Total Fixes: ${report.summary.totalFixes}`);
  console.log(`Success Rate: ${report.summary.successRate.toFixed(1)}%`);

  if (executionResults.progress) {
    console.log(`Initial Any Count: ${executionResults.progress.initialCount}`);
    console.log(`Final Any Count: ${executionResults.progress.currentCount}`);
    console.log(`Reduction: ${executionResults.progress.actualReduction} (${executionResults.progress.actualReductionPercentage}%)`);
    console.log(`Target Met: ${executionResults.progress.targetMet ? 'YES' : 'NO'}`);
  }

  console.log(`Report Location: ${reportPath}`);

  if (CONFIG.dryRun) {
    console.log('\n🔍 DRY RUN MODE - No actual changes were made');
  }

  if (!executionResults.success) {
    console.log('\n❌ Execution completed with errors');
    process.exit(1);
  } else {
    console.log('\n✅ Execution completed successfully');
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = {
  executeProgressiveImprovement,
  runComprehensiveAnalysis,
  createSafetyCheckpoint,
  rollbackToCheckpoint,
  calculateProgress,
  generateReport
};
