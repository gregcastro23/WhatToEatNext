#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Campaign Progress Tracker
 * Monitors active campaigns and manages phase transitions
 */

async function trackCampaignProgress() {
  console.log('📊 Tracking campaign progress...');

  try {
    // Check for active campaign triggers
    const activeTriggers = await getActiveCampaignTriggers();

    if (activeTriggers.length === 0) {
      console.log('ℹ️ No active campaigns to track');
      return;
    }

    console.log(`📋 Found ${activeTriggers.length} active campaign(s)`);

    // Process each active campaign
    for (const trigger of activeTriggers) {
      await processCampaignTrigger(trigger);
    }

    // Generate progress report
    await generateProgressReport();
  } catch (error) {
    console.error('❌ Error tracking campaign progress:', error.message);
  }
}

async function getActiveCampaignTriggers() {
  const triggersDir = path.join(process.cwd(), '.kiro', 'campaign-triggers');

  if (!fs.existsSync(triggersDir)) {
    return [];
  }

  const triggerFiles = fs
    .readdirSync(triggersDir)
    .filter(file => file.endsWith('.json'))
    .map(file => {
      const filePath = path.join(triggersDir, file);
      try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return { ...content, filePath, fileName: file };
      } catch (error) {
        console.warn(`⚠️ Could not parse trigger file: ${file}`);
        return null;
      }
    })
    .filter(Boolean);

  return triggerFiles;
}

async function processCampaignTrigger(trigger) {
  console.log(`🔄 Processing campaign: ${trigger.type}`);

  try {
    // Get current metrics
    const currentMetrics = await getCurrentMetrics(trigger.type);

    // Check if campaign goals are met
    const isComplete = await checkCampaignCompletion(trigger, currentMetrics);

    if (isComplete) {
      console.log(`✅ Campaign ${trigger.type} completed successfully`);
      await completeCampaign(trigger);
    } else {
      // Check if next phase should be triggered
      const shouldAdvance = await shouldAdvancePhase(trigger, currentMetrics);

      if (shouldAdvance) {
        console.log(`⏭️ Advancing to next phase for ${trigger.type}`);
        await advanceToNextPhase(trigger, currentMetrics);
      } else {
        console.log(`⏳ Campaign ${trigger.type} in progress...`);
        await updateCampaignProgress(trigger, currentMetrics);
      }
    }
  } catch (error) {
    console.error(`❌ Error processing campaign ${trigger.type}:`, error.message);
    await handleCampaignError(trigger, error);
  }
}

async function getCurrentMetrics(campaignType) {
  const metrics = {};

  try {
    switch (campaignType) {
      case 'typescript-error-elimination':
        metrics.typeScriptErrors = await getTypeScriptErrorCount();
        metrics.errorBreakdown = await getTypeScriptErrorBreakdown();
        break;

      case 'linting-excellence':
        metrics.lintingWarnings = await getLintingWarningCount();
        metrics.warningBreakdown = await getLintingWarningBreakdown();
        break;

      case 'unused-variable-cleanup':
        metrics.unusedVariables = await getUnusedVariableCount();
        break;

      default:
        console.log(`⚠️ Unknown campaign type: ${campaignType}`);
    }

    metrics.timestamp = new Date().toISOString();
  } catch (error) {
    console.warn('⚠️ Could not get all metrics:', error.message);
  }

  return metrics;
}

async function getTypeScriptErrorCount() {
  try {
    const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS"', {
      encoding: 'utf8',
      stdio: 'pipe',
    });
    return parseInt(output.trim()) || 0;
  } catch (error) {
    return error.status === 1 ? 0 : -1;
  }
}

async function getTypeScriptErrorBreakdown() {
  try {
    const output = execSync(
      "yarn tsc --noEmit --skipLibCheck 2>&1 | grep -E \"error TS\" | sed 's/.*error //' | cut -d':' -f1 | sort | uniq -c | sort -nr",
      { encoding: 'utf8', stdio: 'pipe' },
    );

    const breakdown = {};
    const lines = output
      .trim()
      .split('\n')
      .filter(line => line.trim());

    for (const line of lines) {
      const match = line.trim().match(/^\s*(\d+)\s+(.+)$/);
      if (match) {
        breakdown[match[2].trim()] = parseInt(match[1]);
      }
    }

    return breakdown;
  } catch (error) {
    return {};
  }
}

async function getLintingWarningCount() {
  try {
    const output = execSync('yarn eslint src --config eslint.config.cjs --format json', {
      encoding: 'utf8',
      stdio: 'pipe',
    });

    const results = JSON.parse(output);
    return results.reduce((total, file) => total + file.warningCount, 0);
  } catch (error) {
    return -1;
  }
}

async function getLintingWarningBreakdown() {
  try {
    const output = execSync('yarn eslint src --config eslint.config.cjs --format json', {
      encoding: 'utf8',
      stdio: 'pipe',
    });

    const results = JSON.parse(output);
    const breakdown = {};

    results.forEach(file => {
      file.messages.forEach(message => {
        if (message.severity === 1) {
          // Warning
          const ruleId = message.ruleId || 'unknown';
          breakdown[ruleId] = (breakdown[ruleId] || 0) + 1;
        }
      });
    });

    return breakdown;
  } catch (error) {
    return {};
  }
}

async function getUnusedVariableCount() {
  try {
    const output = execSync(
      'yarn eslint src --config eslint.config.cjs 2>&1 | grep -c "is defined but never used"',
      {
        encoding: 'utf8',
        stdio: 'pipe',
      },
    );
    return parseInt(output.trim()) || 0;
  } catch (error) {
    return error.status === 1 ? 0 : -1;
  }
}

async function checkCampaignCompletion(trigger, metrics) {
  switch (trigger.type) {
    case 'typescript-error-elimination':
      return metrics.typeScriptErrors <= (trigger.targetErrors || 0);

    case 'linting-excellence':
      return metrics.lintingWarnings <= (trigger.targetWarnings || 0);

    case 'unused-variable-cleanup':
      return metrics.unusedVariables <= (trigger.targetUnused || 0);

    default:
      return false;
  }
}

async function shouldAdvancePhase(trigger, metrics) {
  // Check if significant progress has been made
  const progressThreshold = 0.1; // 10% improvement

  if (trigger.lastMetrics) {
    const improvement = calculateImprovement(trigger.lastMetrics, metrics, trigger.type);
    return improvement >= progressThreshold;
  }

  return false;
}

function calculateImprovement(lastMetrics, currentMetrics, campaignType) {
  switch (campaignType) {
    case 'typescript-error-elimination':
      if (lastMetrics.typeScriptErrors && currentMetrics.typeScriptErrors) {
        const reduction = lastMetrics.typeScriptErrors - currentMetrics.typeScriptErrors;
        return reduction / lastMetrics.typeScriptErrors;
      }
      break;

    case 'linting-excellence':
      if (lastMetrics.lintingWarnings && currentMetrics.lintingWarnings) {
        const reduction = lastMetrics.lintingWarnings - currentMetrics.lintingWarnings;
        return reduction / lastMetrics.lintingWarnings;
      }
      break;
  }

  return 0;
}

async function completeCampaign(trigger) {
  // Move trigger to completed folder
  const completedDir = path.join(process.cwd(), '.kiro', 'campaign-completed');
  if (!fs.existsSync(completedDir)) {
    fs.mkdirSync(completedDir, { recursive: true });
  }

  const completedPath = path.join(completedDir, trigger.fileName);
  const completedTrigger = {
    ...trigger,
    completedAt: new Date().toISOString(),
    status: 'completed',
  };

  fs.writeFileSync(completedPath, JSON.stringify(completedTrigger, null, 2));
  fs.unlinkSync(trigger.filePath);

  console.log(`🎉 Campaign ${trigger.type} marked as completed`);
}

async function advanceToNextPhase(trigger, metrics) {
  // Update trigger with new phase information
  const updatedTrigger = {
    ...trigger,
    lastMetrics: metrics,
    phaseAdvancedAt: new Date().toISOString(),
    currentPhase: (trigger.currentPhase || 0) + 1,
  };

  fs.writeFileSync(trigger.filePath, JSON.stringify(updatedTrigger, null, 2));

  console.log(`📈 Advanced ${trigger.type} to phase ${updatedTrigger.currentPhase}`);
}

async function updateCampaignProgress(trigger, metrics) {
  // Update trigger with latest metrics
  const updatedTrigger = {
    ...trigger,
    lastMetrics: metrics,
    lastUpdated: new Date().toISOString(),
  };

  fs.writeFileSync(trigger.filePath, JSON.stringify(updatedTrigger, null, 2));
}

async function handleCampaignError(trigger, error) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    campaignType: trigger.type,
    error: error.message,
    stack: error.stack,
  };

  const errorLogPath = path.join(process.cwd(), 'logs', 'campaign-errors.log');
  const logsDir = path.dirname(errorLogPath);

  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  fs.appendFileSync(errorLogPath, JSON.stringify(errorLog) + '\n');
}

async function generateProgressReport() {
  const report = {
    timestamp: new Date().toISOString(),
    activeCampaigns: await getActiveCampaignTriggers(),
    systemMetrics: {
      typeScriptErrors: await getTypeScriptErrorCount(),
      lintingWarnings: await getLintingWarningCount(),
      unusedVariables: await getUnusedVariableCount(),
    },
  };

  const reportPath = path.join(
    process.cwd(),
    '.kiro',
    'progress-reports',
    `progress-${Date.now()}.json`,
  );
  const reportDir = path.dirname(reportPath);

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📊 Progress report generated: ${reportPath}`);
}

// Run if called directly
if (require.main === module) {
  trackCampaignProgress().catch(console.error);
}

module.exports = { trackCampaignProgress };
