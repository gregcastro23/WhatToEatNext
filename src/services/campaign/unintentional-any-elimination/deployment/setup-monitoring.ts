#!/usr/bin/env npx tsx

/**
 * Monitoring and Alerting Setup Script
 *
 * This script sets up comprehensive monitoring and alerting for the
 * Unintentional Any Elimination campaign system.
 */

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { environmentConfigManager } from '../config/loader';

interface MonitoringConfig {
  metrics: {
    enabled: boolean;
    interval: number; // minutes
    retention: number; // days
    thresholds: {
      errorIncrease: number;
      successRateDecrease: number;
      buildFailureRate: number;
    };
  };
  alerts: {
    enabled: boolean;
    channels: AlertChannel[];
    conditions: AlertCondition[];
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    retention: number; // days
    maxFileSize: string;
  };
  healthChecks: {
    enabled: boolean;
    interval: number; // minutes
    endpoints: HealthCheckEndpoint[];
  };
}

interface AlertChannel {
  type: 'console' | 'file' | 'webhook';
  name: string;
  config: Record<string, unknown>;
  enabled: boolean;
}

interface AlertCondition {
  name: string;
  description: string;
  condition: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  enabled: boolean;
}

interface HealthCheckEndpoint {
  name: string;
  type: 'build' | 'config' | 'integration' | 'custom';
  command: string;
  args: string[];
  timeout: number;
  expectedExitCode: number;
}

/**
 * Create monitoring configuration
 */
function createMonitoringConfig(): MonitoringConfig {
  const campaignConfig = environmentConfigManager.getConfig();

  return {
    metrics: {
      enabled: true,
      interval: campaignConfig.targets.trackingIntervals.metrics,
      retention: 30,
      thresholds: {
        errorIncrease: campaignConfig.targets.maxErrorIncrease,
        successRateDecrease: 1 - campaignConfig.targets.minSuccessRate,
        buildFailureRate: 0.1
      }
    },
    alerts: {
      enabled: true,
      channels: [
        {
          type: 'console',
          name: 'console-alerts',
          config: {
            colors: true,
            timestamps: true
          },
          enabled: true
        },
        {
          type: 'file',
          name: 'file-alerts',
          config: {
            path: '.kiro/logs/unintentional-any-alerts.log',
            maxSize: '10MB',
            rotate: true
          },
          enabled: true
        }
      ],
      conditions: [
        {
          name: 'High Error Rate',
          description: 'TypeScript error count increased significantly',
          condition: 'typescript_errors > baseline + threshold',
          severity: 'error',
          enabled: true
        },
        {
          name: 'Low Success Rate',
          description: 'Campaign success rate below minimum threshold',
          condition: 'success_rate < min_success_rate',
          severity: 'warning',
          enabled: true
        },
        {
          name: 'Build Failure',
          description: 'Build process failed during campaign execution',
          condition: 'build_status == "failed"',
          severity: 'critical',
          enabled: true
        },
        {
          name: 'Configuration Invalid',
          description: 'Campaign configuration validation failed',
          condition: 'config_valid == false',
          severity: 'error',
          enabled: true
        },
        {
          name: 'Rollback Triggered',
          description: 'Safety protocol triggered rollback',
          condition: 'rollback_triggered == true',
          severity: 'warning',
          enabled: true
        }
      ]
    },
    logging: {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      retention: 14,
      maxFileSize: '50MB'
    },
    healthChecks: {
      enabled: true,
      interval: 15,
      endpoints: [
        {
          name: 'Build Health',
          type: 'build',
          command: 'npm',
          args: ['run', 'build'],
          timeout: 180000,
          expectedExitCode: 0
        },
        {
          name: 'Configuration Health',
          type: 'config',
          command: 'npx',
          args: ['tsx', 'src/services/campaign/unintentional-any-elimination/config/cli.ts', 'validate'],
          timeout: 30000,
          expectedExitCode: 0
        },
        {
          name: 'Integration Health',
          type: 'integration',
          command: 'npx',
          args: ['tsx', 'src/services/campaign/unintentional-any-elimination/verify-integration.ts'],
          timeout: 60000,
          expectedExitCode: 0
        }
      ]
    }
  };
}

/**
 * Setup monitoring directories
 */
function setupMonitoringDirectories(): void {
  const directories = [
    '.kiro/logs',
    '.kiro/metrics',
    '.kiro/monitoring',
    '.kiro/alerts'
  ];

  for (const dir of directories) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      console.log(`Created monitoring directory: ${dir}`);
    }
  }
}

/**
 * Create monitoring service
 */
function createMonitoringService(config: MonitoringConfig): void {
  const serviceCode = `/**
 * Unintentional Any Elimination Monitoring Service
 *
 * Auto-generated monitoring service for campaign system.
 */

import { EventEmitter } from 'events';
import { writeFileSync, appendFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

export interface MetricsData {
  timestamp: Date;
  typescriptErrors: number;
  successRate: number;
  buildStatus: 'success' | 'failed' | 'unknown';
  configValid: boolean;
  rollbackTriggered: boolean;
  campaignActive: boolean;
}

export class UnintentionalAnyMonitoringService extends EventEmitter {
  private config = ${JSON.stringify(config, null, 2)};
  private metricsHistory: MetricsData[] = [];
  private alertsEnabled = ${config.alerts.enabled};
  private healthCheckInterval?: NodeJS.Timeout;

  constructor() {
    super();
    this.setupHealthChecks();
    this.setupMetricsCollection();
  }

  /**
   * Collect current metrics
   */
  async collectMetrics(): Promise<MetricsData> {
    const metrics: MetricsData = {
      timestamp: new Date(),
      typescriptErrors: await this.getTypeScriptErrorCount(),
      successRate: await this.getSuccessRate(),
      buildStatus: await this.getBuildStatus(),
      configValid: await this.getConfigValidation(),
      rollbackTriggered: false, // Will be set by campaign system
      campaignActive: await this.getCampaignStatus()
    };

    this.metricsHistory.push(metrics);
    this.emit('metrics', metrics);

    // Check alert conditions
    if (this.alertsEnabled) {
      this.checkAlertConditions(metrics);
    }

    // Persist metrics
    this.persistMetrics(metrics);

    return metrics;
  }

  /**
   * Get TypeScript error count
   */
  private async getTypeScriptErrorCount(): Promise<number> {
    try {
      const output = execSync('npx tsc --noEmit 2>&1 | grep -c "error TS" || echo "0"', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return parseInt(output.trim()) || 0;
    } catch {
      return -1; // Error getting count
    }
  }

  /**
   * Get campaign success rate
   */
  private async getSuccessRate(): Promise<number> {
    // This would integrate with the actual campaign metrics
    // For now, return a placeholder
    return 0.85;
  }

  /**
   * Get build status
   */
  private async getBuildStatus(): Promise<'success' | 'failed' | 'unknown'> {
    try {
      execSync('yarn build', { stdio: 'pipe' });
      return 'success';
    } catch {
      return 'failed';
    }
  }

  /**
   * Get configuration validation status
   */
  private async getConfigValidation(): Promise<boolean> {
    try {
      execSync('npx tsx src/services/campaign/unintentional-any-elimination/config/cli.ts validate', {
        stdio: 'pipe'
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get campaign status
   */
  private async getCampaignStatus(): Promise<boolean> {
    // This would check if campaign is currently running
    // For now, return false
    return false;
  }

  /**
   * Check alert conditions
   */
  private checkAlertConditions(metrics: MetricsData): void {
    const conditions = this.config.alerts.conditions;

    for (const condition of conditions) {
      if (!condition.enabled) continue;

      let shouldAlert = false;

      switch (condition.name) {
        case 'High Error Rate':
          const baseline = this.getBaselineErrorCount();
          const threshold = this.config.metrics.thresholds.errorIncrease;
          shouldAlert = metrics.typescriptErrors > baseline + threshold;
          break;

        case 'Low Success Rate':
          shouldAlert = metrics.successRate < ${config.metrics.thresholds.successRateDecrease};
          break;

        case 'Build Failure':
          shouldAlert = metrics.buildStatus === 'failed';
          break;

        case 'Configuration Invalid':
          shouldAlert = !metrics.configValid;
          break;

        case 'Rollback Triggered':
          shouldAlert = metrics.rollbackTriggered;
          break;
      }

      if (shouldAlert) {
        this.sendAlert(condition, metrics);
      }
    }
  }

  /**
   * Send alert
   */
  private sendAlert(condition: unknown, metrics: MetricsData): void {
    const alert = {
      timestamp: new Date(),
      condition: condition.name,
      severity: condition.severity,
      description: condition.description,
      metrics
    };

    this.emit('alert', alert);

    // Send to configured channels
    for (const channel of this.config.alerts.channels) {
      if (!channel.enabled) continue;

      switch (channel.type) {
        case 'console':
          console.error(\`[ALERT] \${condition.severity.toUpperCase()}: \${condition.name}\`);
          console.error(\`Description: \${condition.description}\`);
          console.error(\`Metrics: \${JSON.stringify(metrics, null, 2)}\`);
          break;

        case 'file':
          const logPath = channel.config.path || '.kiro/logs/alerts.log';
          const logEntry = \`[\${alert.timestamp.toISOString()}] \${condition.severity.toUpperCase()}: \${condition.name} - \${condition.description}\\n\`;
          appendFileSync(logPath, logEntry);
          break;
      }
    }
  }

  /**
   * Get baseline error count
   */
  private getBaselineErrorCount(): number {
    if (this.metricsHistory.length === 0) return 0;

    const recent = this.metricsHistory.slice(-10);
    const sum = recent.reduce((acc, m) => acc + m.typescriptErrors, 0);
    return Math.floor(sum / recent.length);
  }

  /**
   * Persist metrics
   */
  private persistMetrics(metrics: MetricsData): void {
    const metricsPath = '.kiro/metrics/unintentional-any-metrics.json';
    const metricsData = {
      timestamp: metrics.timestamp.toISOString(),
      data: metrics
    };

    try {
      appendFileSync(metricsPath, JSON.stringify(metricsData) + '\\n');
    } catch (error) {
      console.error('Failed to persist metrics:', error);
    }
  }

  /**
   * Setup health checks
   */
  private setupHealthChecks(): void {
    if (!this.config.healthChecks.enabled) return;

    const interval = this.config.healthChecks.interval * 60 * 1000; // Convert to ms

    this.healthCheckInterval = setInterval(async () => {
      for (const endpoint of this.config.healthChecks.endpoints) {
        try {
          execSync(\`\${endpoint.command} \${endpoint.args.join(' ')}\`, {
            stdio: 'pipe',
            timeout: endpoint.timeout
          });

          this.emit('healthCheck', {
            endpoint: endpoint.name,
            status: 'healthy',
            timestamp: new Date()
          });
        } catch (error) {
          this.emit('healthCheck', {
            endpoint: endpoint.name,
            status: 'unhealthy',
            error: String(error),
            timestamp: new Date()
          });

          // Send alert for unhealthy endpoint
          this.sendAlert({
            name: \`Health Check Failed: \${endpoint.name}\`,
            severity: 'warning',
            description: \`Health check for \${endpoint.name} failed\`
          }, await this.collectMetrics());
        }
      }
    }, interval);
  }

  /**
   * Setup metrics collection
   */
  private setupMetricsCollection(): void {
    if (!this.config.metrics.enabled) return;

    const interval = this.config.metrics.interval * 60 * 1000; // Convert to ms

    setInterval(async () => {
      await this.collectMetrics();
    }, interval);
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }

  /**
   * Get metrics history
   */
  getMetricsHistory(): MetricsData[] {
    return [...this.metricsHistory];
  }

  /**
   * Get current status
   */
  async getCurrentStatus(): Promise<{
    healthy: boolean;
    metrics: MetricsData;
    alerts: number;
  }> {
    const metrics = await this.collectMetrics();

    return {
      healthy: metrics.buildStatus === 'success' && metrics.configValid,
      metrics,
      alerts: 0 // Would track active alerts
    };
  }
}

// Export singleton instance
export const monitoringService = new UnintentionalAnyMonitoringService();
`;

  const servicePath = '.kiro/monitoring/UnintentionalAnyMonitoringService.ts';
  writeFileSync(servicePath, serviceCode);
  console.log(`Created monitoring service: ${servicePath}`);
}

/**
 * Create monitoring dashboard
 */
function createMonitoringDashboard(): void {
  const dashboardCode = `#!/usr/bin/env npx tsx

/**
 * Monitoring Dashboard for Unintentional Any Elimination
 *
 * Simple CLI dashboard to view monitoring status and metrics.
 */

import { monitoringService } from './UnintentionalAnyMonitoringService';

async function displayDashboard() {
  console.clear();
  console.log('='.repeat(80));
  console.log('  UNINTENTIONAL ANY ELIMINATION - MONITORING DASHBOARD');
  console.log('='.repeat(80));

  try {
    const status = await monitoringService.getCurrentStatus();

    console.log(\`\\nSystem Status: \${status.healthy ? '🟢 HEALTHY' : '🔴 UNHEALTHY'}\`);
    console.log(\`Timestamp: \${status.metrics.timestamp.toISOString()}\`);

    console.log('\\n--- METRICS ---');
    console.log(\`TypeScript Errors: \${status.metrics.typescriptErrors}\`);
    console.log(\`Success Rate: \${(status.metrics.successRate * 100).toFixed(1)}%\`);
    console.log(\`Build Status: \${status.metrics.buildStatus.toUpperCase()}\`);
    console.log(\`Config Valid: \${status.metrics.configValid ? 'YES' : 'NO'}\`);
    console.log(\`Campaign Active: \${status.metrics.campaignActive ? 'YES' : 'NO'}\`);

    console.log('\\n--- RECENT HISTORY ---');
    const history = monitoringService.getMetricsHistory().slice(-5);
    history.forEach((metric, index) => {
      const time = metric.timestamp.toLocaleTimeString();
      console.log(\`\${time}: Errors=\${metric.typescriptErrors}, Success=\${(metric.successRate * 100).toFixed(1)}%, Build=\${metric.buildStatus}\`);
    });

    console.log('\\n--- CONTROLS ---');
    console.log('Press Ctrl+C to exit');
    console.log('Dashboard refreshes every 30 seconds');

  } catch (error) {
    console.error('Error displaying dashboard:', error);
  }
}

// Display dashboard and refresh every 30 seconds
displayDashboard();
setInterval(displayDashboard, 30000);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\\nShutting down monitoring dashboard...');
  monitoringService.stop();
  process.exit(0);
});
`;

  const dashboardPath = '.kiro/monitoring/dashboard.ts';
  writeFileSync(dashboardPath, dashboardCode);
  console.log(`Created monitoring dashboard: ${dashboardPath}`);
}

/**
 * Main setup function
 */
async function setupMonitoring(): Promise<void> {
  console.log('Setting up monitoring and alerting for Unintentional Any Elimination...');

  try {
    // Setup directories
    setupMonitoringDirectories();

    // Create monitoring configuration
    const config = createMonitoringConfig();
    const configPath = '.kiro/monitoring/monitoring-config.json';
    writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`Created monitoring configuration: ${configPath}`);

    // Create monitoring service
    createMonitoringService(config);

    // Create monitoring dashboard
    createMonitoringDashboard();

    // Create startup script
    const startupScript = `#!/bin/bash

# Unintentional Any Elimination Monitoring Startup Script

echo "Starting Unintentional Any Elimination Monitoring..."

# Start monitoring service in background
npx tsx .kiro/monitoring/UnintentionalAnyMonitoringService.ts &
MONITORING_PID=$!

echo "Monitoring service started with PID: MONITORING_PID"
echo "Dashboard available at: npx tsx .kiro/monitoring/dashboard.ts"

# Save PID for cleanup
echo MONITORING_PID > .kiro/monitoring/monitoring.pid

echo "Monitoring setup complete!"
`;

    writeFileSync('.kiro/monitoring/start-monitoring.sh', startupScript);
    console.log('Created monitoring startup script: .kiro/monitoring/start-monitoring.sh');

    console.log('\\n✅ Monitoring and alerting setup completed successfully!');
    console.log('\\nTo start monitoring:');
    console.log('  bash .kiro/monitoring/start-monitoring.sh');
    console.log('\\nTo view dashboard:');
    console.log('  npx tsx .kiro/monitoring/dashboard.ts');

  } catch (error) {
    console.error('❌ Failed to setup monitoring:', error);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupMonitoring();
}

export { setupMonitoring };
