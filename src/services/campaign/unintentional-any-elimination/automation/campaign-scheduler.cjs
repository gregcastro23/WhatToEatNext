#!/usr/bin/env node

/**
 * Campaign Scheduler for Unintentional Any Elimination
 *
 * Integrates with existing campaign automation infrastructure
 * Provides scheduled execution with safety monitoring
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const cron = require('node-cron');

// Configuration
const CONFIG = {
  scheduleFile: process.env.SCHEDULE_FILE || './config/campaign-schedule.json',
  logFile: process.env.LOG_FILE || './logs/campaign-scheduler.log',
  metricsFile: process.env.METRICS_FILE || './metrics/campaign-metrics.json',
  alertThreshold: parseInt(process.env.ALERT_THRESHOLD) || 100,
  maxConcurrentCampaigns: parseInt(process.env.MAX_CONCURRENT) || 1,
  safetyCheckInterval: parseInt(process.env.SAFETY_CHECK_INTERVAL) || 300, // 5 minutes
  enableAlerts: process.env.ENABLE_ALERTS !== 'false',
  enableMetrics: process.env.ENABLE_METRICS !== 'false'
};

// Ensure directories exist
[path.dirname(CONFIG.scheduleFile), path.dirname(CONFIG.logFile), path.dirname(CONFIG.metricsFile)].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Active campaigns tracking
const activeCampaigns = new Map();

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

// Load schedule configuration
function loadSchedule() {
  if (fs.existsSync(CONFIG.scheduleFile)) {
    try {
      const data = fs.readFileSync(CONFIG.scheduleFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      log('error', 'Failed to load schedule configuration', { error: error.message });
    }
  }

  // Default schedule
  const defaultSchedule = {
    campaigns: [
      {
        id: 'daily-analysis',
        name: 'Daily Analysis Campaign',
        schedule: '0 9 * * *', // 9 AM daily
        command: 'node unintentional-any-eliminator.cjs --max-files=10 --safety=MAXIMUM --dry-run',
        enabled: true,
        safetyLevel: 'MAXIMUM',
        maxDuration: 1800000, // 30 minutes
        retryCount: 2
      },
      {
        id: 'weekly-cleanup',
        name: 'Weekly Cleanup Campaign',
        schedule: '0 2 * * 0', // 2 AM on Sundays
        command: 'node unintentional-any-eliminator.cjs --max-files=50 --safety=HIGH --target=10',
        enabled: true,
        safetyLevel: 'HIGH',
        maxDuration: 3600000, // 1 hour
        retryCount: 1
      },
      {
        id: 'emergency-response',
        name: 'Emergency Response Campaign',
        schedule: null, // Triggered manually or by alerts
        command: 'node unintentional-any-eliminator.cjs --max-files=5 --safety=MAXIMUM --continue-on-error',
        enabled: true,
        safetyLevel: 'MAXIMUM',
        maxDuration: 900000, // 15 minutes
        retryCount: 0
      }
    ],
    globalSettings: {
      maxConcurrentCampaigns: CONFIG.maxConcurrentCampaigns,
      alertThreshold: CONFIG.alertThreshold,
      safetyCheckInterval: CONFIG.safetyCheckInterval
    }
  };

  // Save default schedule
  fs.writeFileSync(CONFIG.scheduleFile, JSON.stringify(defaultSchedule, null, 2));
  log('info', 'Created default schedule configuration');

  return defaultSchedule;
}

// Get current metrics
function getCurrentMetrics() {
  try {
    const typeScriptErrors = getTypeScriptErrorCount();
    const explicitAnyWarnings = getExplicitAnyCount();
    const buildStatus = getBuildStatus();

    return {
      timestamp: new Date().toISOString(),
      typeScriptErrors,
      explicitAnyWarnings,
      buildStatus,
      total: typeScriptErrors + explicitAnyWarnings
    };
  } catch (error) {
    log('error', 'Failed to get current metrics', { error: error.message });
    return {
      timestamp: new Date().toISOString(),
      error: error.message,
      typeScriptErrors: -1,
      explicitAnyWarnings: -1,
      buildStatus: 'unknown',
      total: -1
    };
  }
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

// Save metrics
function saveMetrics(metrics) {
  if (!CONFIG.enableMetrics) return;

  try {
    let metricsHistory = [];

    if (fs.existsSync(CONFIG.metricsFile)) {
      const data = fs.readFileSync(CONFIG.metricsFile, 'utf8');
      metricsHistory = JSON.parse(data);
    }

    metricsHistory.push(metrics);

    // Keep only last 1000 entries
    if (metricsHistory.length > 1000) {
      metricsHistory = metricsHistory.slice(-1000);
    }

    fs.writeFileSync(CONFIG.metricsFile, JSON.stringify(metricsHistory, null, 2));

  } catch (error) {
    log('error', 'Failed to save metrics', { error: error.message });
  }
}

// Check for alert conditions
function checkAlerts(metrics) {
  if (!CONFIG.enableAlerts) return [];

  const alerts = [];

  // Threshold alerts
  if (metrics.typeScriptErrors > CONFIG.alertThreshold) {
    alerts.push({
      type: 'threshold',
      severity: 'high',
      message: `TypeScript errors (${metrics.typeScriptErrors}) exceed threshold (${CONFIG.alertThreshold})`,
      metrics
    });
  }

  if (metrics.explicitAnyWarnings > CONFIG.alertThreshold) {
    alerts.push({
      type: 'threshold',
      severity: 'medium',
      message: `Explicit-any warnings (${metrics.explicitAnyWarnings}) exceed threshold (${CONFIG.alertThreshold})`,
      metrics
    });
  }

  // Build failure alerts
  if (metrics.buildStatus === 'failing') {
    alerts.push({
      type: 'build',
      severity: 'high',
      message: 'Build is currently failing',
      metrics
    });
  }

  return alerts;
}

// Execute campaign
async function executeCampaign(campaign) {
  const campaignId = `${campaign.id}-${Date.now()}`;

  const execution = {
    id: campaignId,
    campaignId: campaign.id,
    name: campaign.name,
    startTime: Date.now(),
    endTime: null,
    status: 'running',
    command: campaign.command,
    success: false,
    output: null,
    error: null,
    metrics: {
      before: getCurrentMetrics(),
      after: null
    }
  };

  activeCampaigns.set(campaignId, execution);

  log('info', `Starting campaign: ${campaign.name}`, { campaignId, command: campaign.command });

  try {
    // Execute with timeout
    const output = execSync(campaign.command, {
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: campaign.maxDuration || 1800000 // 30 minutes default
    });

    execution.output = output;
    execution.success = true;
    execution.status = 'completed';

    log('info', `Campaign completed successfully: ${campaign.name}`, { campaignId });

  } catch (error) {
    execution.error = error.message;
    execution.success = false;
    execution.status = 'failed';

    log('error', `Campaign failed: ${campaign.name}`, { campaignId, error: error.message });

    // Retry logic
    if (campaign.retryCount > 0) {
      log('info', `Retrying campaign: ${campaign.name}`, { campaignId, retriesLeft: campaign.retryCount });

      // Create retry campaign
      const retryCampaign = {
        ...campaign,
        retryCount: campaign.retryCount - 1,
        id: `${campaign.id}-retry`
      };

      // Schedule retry after 5 minutes
      setTimeout(() => {
        executeCampaign(retryCampaign);
      }, 300000);
    }
  }

  execution.endTime = Date.now();
  execution.duration = execution.endTime - execution.startTime;
  execution.metrics.after = getCurrentMetrics();

  activeCampaigns.delete(campaignId);

  // Save execution record
  const executionRecord = {
    ...execution,
    timestamp: new Date().toISOString()
  };

  const executionLogPath = path.join(path.dirname(CONFIG.logFile), 'campaign-executions.json');
  let executionHistory = [];

  if (fs.existsSync(executionLogPath)) {
    try {
      const data = fs.readFileSync(executionLogPath, 'utf8');
      executionHistory = JSON.parse(data);
    } catch (error) {
      log('warn', 'Failed to load execution history', { error: error.message });
    }
  }

  executionHistory.push(executionRecord);

  // Keep only last 100 executions
  if (executionHistory.length > 100) {
    executionHistory = executionHistory.slice(-100);
  }

  fs.writeFileSync(executionLogPath, JSON.stringify(executionHistory, null, 2));

  return execution;
}

// Schedule campaigns
function scheduleCampaigns(schedule) {
  log('info', 'Scheduling campaigns', { count: schedule.campaigns.length });

  schedule.campaigns.forEach(campaign => {
    if (!campaign.enabled || !campaign.schedule) {
      log('debug', `Skipping disabled or manual campaign: ${campaign.name}`);
      return;
    }

    try {
      cron.schedule(campaign.schedule, () => {
        // Check if we can run another campaign
        if (activeCampaigns.size >= CONFIG.maxConcurrentCampaigns) {
          log('warn', `Cannot start campaign ${campaign.name}: max concurrent campaigns reached`);
          return;
        }

        // Check safety conditions
        const currentMetrics = getCurrentMetrics();
        const alerts = checkAlerts(currentMetrics);

        if (alerts.some(alert => alert.severity === 'high') && campaign.safetyLevel === 'MAXIMUM') {
          log('warn', `Cannot start campaign ${campaign.name}: high severity alerts present`, { alerts });
          return;
        }

        // Execute campaign
        executeCampaign(campaign);
      });

      log('info', `Scheduled campaign: ${campaign.name}`, { schedule: campaign.schedule });

    } catch (error) {
      log('error', `Failed to schedule campaign: ${campaign.name}`, { error: error.message });
    }
  });
}

// Safety monitoring
function startSafetyMonitoring() {
  log('info', 'Starting safety monitoring', { interval: CONFIG.safetyCheckInterval });

  setInterval(() => {
    const currentMetrics = getCurrentMetrics();
    const alerts = checkAlerts(currentMetrics);

    // Save metrics
    saveMetrics(currentMetrics);

    // Handle alerts
    if (alerts.length > 0) {
      log('warn', 'Safety alerts detected', { alerts });

      // Check for emergency conditions
      const highSeverityAlerts = alerts.filter(alert => alert.severity === 'high');
      if (highSeverityAlerts.length > 0) {
        log('error', 'High severity alerts detected - considering emergency response', { alerts: highSeverityAlerts });

        // Trigger emergency response if configured
        const schedule = loadSchedule();
        const emergencyCampaign = schedule.campaigns.find(c => c.id === 'emergency-response');

        if (emergencyCampaign && emergencyCampaign.enabled && activeCampaigns.size === 0) {
          log('info', 'Triggering emergency response campaign');
          executeCampaign(emergencyCampaign);
        }
      }
    }

    // Log active campaigns
    if (activeCampaigns.size > 0) {
      log('debug', `Active campaigns: ${activeCampaigns.size}`, {
        campaigns: Array.from(activeCampaigns.values()).map(c => ({
          id: c.id,
          name: c.name,
          status: c.status,
          duration: Date.now() - c.startTime
        }))
      });
    }

  }, CONFIG.safetyCheckInterval * 1000);
}

// Command line interface
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'start':
      log('info', 'Starting campaign scheduler');

      const schedule = loadSchedule();
      scheduleCampaigns(schedule);
      startSafetyMonitoring();

      // Keep process alive
      process.on('SIGINT', () => {
        log('info', 'Shutting down campaign scheduler');
        process.exit(0);
      });

      log('info', 'Campaign scheduler started - press Ctrl+C to stop');
      break;

    case 'status':
      const currentMetrics = getCurrentMetrics();
      const alerts = checkAlerts(currentMetrics);

      console.log('=== CAMPAIGN SCHEDULER STATUS ===');
      console.log(`Active Campaigns: ${activeCampaigns.size}`);
      console.log(`TypeScript Errors: ${currentMetrics.typeScriptErrors}`);
      console.log(`Explicit-Any Warnings: ${currentMetrics.explicitAnyWarnings}`);
      console.log(`Build Status: ${currentMetrics.buildStatus}`);
      console.log(`Active Alerts: ${alerts.length}`);

      if (alerts.length > 0) {
        console.log('\nAlerts:');
        alerts.forEach(alert => {
          console.log(`  - ${alert.severity.toUpperCase()}: ${alert.message}`);
        });
      }
      break;

    case 'trigger':
      const campaignId = args[1];
      if (!campaignId) {
        console.error('Campaign ID required');
        process.exit(1);
      }

      const scheduleData = loadSchedule();
      const campaign = scheduleData.campaigns.find(c => c.id === campaignId);

      if (!campaign) {
        console.error(`Campaign not found: ${campaignId}`);
        process.exit(1);
      }

      log('info', `Manually triggering campaign: ${campaign.name}`);
      executeCampaign(campaign).then(result => {
        console.log('Campaign execution completed:', result.status);
      });
      break;

    default:
      console.log(`
Campaign Scheduler for Unintentional Any Elimination

USAGE:
  node campaign-scheduler.cjs <command> [options]

COMMANDS:
  start     Start the campaign scheduler daemon
  status    Show current status and metrics
  trigger   Manually trigger a specific campaign

EXAMPLES:
  # Start the scheduler
  node campaign-scheduler.cjs start

  # Check status
  node campaign-scheduler.cjs status

  # Trigger emergency response
  node campaign-scheduler.cjs trigger emergency-response

CONFIGURATION:
  Edit ${CONFIG.scheduleFile} to configure campaigns and schedules
      `);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  loadSchedule,
  executeCampaign,
  scheduleCampaigns,
  startSafetyMonitoring,
  getCurrentMetrics,
  checkAlerts
};
