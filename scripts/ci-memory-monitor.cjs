#!/usr/bin/env node

/**
 * CI/CD Memory Monitoring Script
 * 
 * This script provides comprehensive memory monitoring and reporting
 * specifically designed for CI/CD environments.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CIMemoryMonitor {
  constructor() {
    this.startTime = Date.now();
    this.initialMemory = process.memoryUsage();
    this.memorySnapshots = [];
    this.alerts = [];
    this.isCI = process.env.CI === 'true';
    
    // CI-specific thresholds (more conservative)
    this.thresholds = {
      warning: 100,    // 100MB
      critical: 200,   // 200MB
      emergency: 400   // 400MB
    };
    
    this.ensureLogsDirectory();
  }

  ensureLogsDirectory() {
    const logsDir = path.join(process.cwd(), 'logs');
    const reportsDir = path.join(logsDir, 'memory-reports');
    
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
  }

  takeSnapshot(label = 'snapshot') {
    const memory = process.memoryUsage();
    const snapshot = {
      timestamp: Date.now(),
      label,
      memory: {
        heapUsed: memory.heapUsed,
        heapTotal: memory.heapTotal,
        external: memory.external,
        arrayBuffers: memory.arrayBuffers,
        rss: memory.rss
      },
      memoryMB: {
        heapUsed: (memory.heapUsed / 1024 / 1024).toFixed(2),
        heapTotal: (memory.heapTotal / 1024 / 1024).toFixed(2),
        external: (memory.external / 1024 / 1024).toFixed(2),
        rss: (memory.rss / 1024 / 1024).toFixed(2)
      }
    };
    
    this.memorySnapshots.push(snapshot);
    this.checkThresholds(snapshot);
    
    return snapshot;
  }

  checkThresholds(snapshot) {
    const heapUsedMB = parseFloat(snapshot.memoryMB.heapUsed);
    const rssMB = parseFloat(snapshot.memoryMB.rss);
    
    if (rssMB > this.thresholds.emergency || heapUsedMB > this.thresholds.emergency) {
      this.addAlert('EMERGENCY', `Memory usage critical: RSS=${rssMB}MB, Heap=${heapUsedMB}MB`, snapshot);
      this.triggerEmergencyCleanup();
    } else if (rssMB > this.thresholds.critical || heapUsedMB > this.thresholds.critical) {
      this.addAlert('CRITICAL', `Memory usage high: RSS=${rssMB}MB, Heap=${heapUsedMB}MB`, snapshot);
    } else if (rssMB > this.thresholds.warning || heapUsedMB > this.thresholds.warning) {
      this.addAlert('WARNING', `Memory usage elevated: RSS=${rssMB}MB, Heap=${heapUsedMB}MB`, snapshot);
    }
  }

  addAlert(level, message, snapshot) {
    const alert = {
      timestamp: Date.now(),
      level,
      message,
      snapshot: snapshot.label,
      memory: snapshot.memoryMB
    };
    
    this.alerts.push(alert);
    
    // Log to console for CI visibility
    const emoji = level === 'EMERGENCY' ? '🚨' : level === 'CRITICAL' ? '⚠️' : '💡';
    console.log(`${emoji} [${level}] ${message}`);
    
    // Write to alerts log
    this.writeAlertToLog(alert);
  }

  writeAlertToLog(alert) {
    const alertsLogPath = path.join(process.cwd(), 'logs', 'memory-alerts.log');
    const logEntry = `[${new Date(alert.timestamp).toISOString()}] ${alert.level}: ${alert.message}\n`;
    
    try {
      fs.appendFileSync(alertsLogPath, logEntry);
    } catch (error) {
      console.warn('Failed to write to alerts log:', error.message);
    }
  }

  triggerEmergencyCleanup() {
    console.log('🚨 Triggering emergency memory cleanup...');
    
    try {
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
        console.log('✅ Emergency garbage collection completed');
      }
      
      // Run emergency cleanup script
      const { MemoryOptimizer } = require('../src/__tests__/utils/memoryOptimization.cjs');
      MemoryOptimizer.emergencyCleanup();
      
    } catch (error) {
      console.error('❌ Emergency cleanup failed:', error.message);
    }
  }

  generateCIReport() {
    const endTime = Date.now();
    const duration = endTime - this.startTime;
    const finalMemory = process.memoryUsage();
    
    const report = {
      metadata: {
        timestamp: new Date().toISOString(),
        duration: `${(duration / 1000).toFixed(2)}s`,
        environment: {
          isCI: this.isCI,
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
          nodeOptions: process.env.NODE_OPTIONS || 'not set'
        }
      },
      memoryAnalysis: {
        initial: {
          heapUsed: `${(this.initialMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`,
          heapTotal: `${(this.initialMemory.heapTotal / 1024 / 1024).toFixed(2)}MB`,
          rss: `${(this.initialMemory.rss / 1024 / 1024).toFixed(2)}MB`
        },
        final: {
          heapUsed: `${(finalMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`,
          heapTotal: `${(finalMemory.heapTotal / 1024 / 1024).toFixed(2)}MB`,
          rss: `${(finalMemory.rss / 1024 / 1024).toFixed(2)}MB`
        },
        delta: {
          heapUsed: `${((finalMemory.heapUsed - this.initialMemory.heapUsed) / 1024 / 1024).toFixed(2)}MB`,
          heapTotal: `${((finalMemory.heapTotal - this.initialMemory.heapTotal) / 1024 / 1024).toFixed(2)}MB`,
          rss: `${((finalMemory.rss - this.initialMemory.rss) / 1024 / 1024).toFixed(2)}MB`
        }
      },
      snapshots: this.memorySnapshots,
      alerts: this.alerts,
      thresholds: this.thresholds,
      recommendations: this.generateRecommendations()
    };
    
    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Analyze alerts
    const emergencyAlerts = this.alerts.filter(a => a.level === 'EMERGENCY');
    const criticalAlerts = this.alerts.filter(a => a.level === 'CRITICAL');
    const warningAlerts = this.alerts.filter(a => a.level === 'WARNING');
    
    if (emergencyAlerts.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Memory Management',
        recommendation: 'Emergency memory usage detected. Consider increasing CI runner memory or reducing test parallelism.',
        action: 'Increase NODE_OPTIONS --max-old-space-size or reduce Jest maxWorkers'
      });
    }
    
    if (criticalAlerts.length > 2) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Test Optimization',
        recommendation: 'Multiple critical memory alerts. Review test suite for memory-intensive operations.',
        action: 'Implement more aggressive cleanup in test teardown'
      });
    }
    
    if (warningAlerts.length > 5) {
      recommendations.push({
        priority: 'LOW',
        category: 'Performance',
        recommendation: 'Frequent memory warnings detected. Consider optimizing test execution.',
        action: 'Use memory-safe test commands and implement periodic cleanup'
      });
    }
    
    // Analyze memory growth
    if (this.memorySnapshots.length > 1) {
      const firstSnapshot = this.memorySnapshots[0];
      const lastSnapshot = this.memorySnapshots[this.memorySnapshots.length - 1];
      const growthMB = parseFloat(lastSnapshot.memoryMB.heapUsed) - parseFloat(firstSnapshot.memoryMB.heapUsed);
      
      if (growthMB > 50) {
        recommendations.push({
          priority: 'MEDIUM',
          category: 'Memory Leaks',
          recommendation: `Significant memory growth detected (${growthMB.toFixed(2)}MB). Potential memory leak.`,
          action: 'Run memory leak detection and implement stricter cleanup procedures'
        });
      }
    }
    
    // CI-specific recommendations
    if (this.isCI) {
      recommendations.push({
        priority: 'INFO',
        category: 'CI Optimization',
        recommendation: 'Running in CI environment with optimized memory settings.',
        action: 'Monitor memory reports and adjust thresholds as needed'
      });
    }
    
    return recommendations;
  }

  writeCIReport() {
    const report = this.generateCIReport();
    const reportPath = path.join(process.cwd(), 'logs', 'memory-reports', `ci-memory-${Date.now()}.json`);
    
    try {
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`📊 CI memory report written to: ${reportPath}`);
      return reportPath;
    } catch (error) {
      console.error('❌ Failed to write CI memory report:', error.message);
      return null;
    }
  }

  generateMarkdownReport() {
    const report = this.generateCIReport();
    
    let markdown = `# CI/CD Memory Monitoring Report\n\n`;
    markdown += `**Generated:** ${report.metadata.timestamp}\n`;
    markdown += `**Duration:** ${report.metadata.duration}\n`;
    markdown += `**Environment:** ${report.metadata.environment.isCI ? 'CI' : 'Local'}\n`;
    markdown += `**Node Version:** ${report.metadata.environment.nodeVersion}\n`;
    markdown += `**Node Options:** ${report.metadata.environment.nodeOptions}\n\n`;
    
    // Memory Analysis
    markdown += `## Memory Analysis\n\n`;
    markdown += `| Metric | Initial | Final | Delta |\n`;
    markdown += `|--------|---------|-------|-------|\n`;
    markdown += `| Heap Used | ${report.memoryAnalysis.initial.heapUsed} | ${report.memoryAnalysis.final.heapUsed} | ${report.memoryAnalysis.delta.heapUsed} |\n`;
    markdown += `| Heap Total | ${report.memoryAnalysis.initial.heapTotal} | ${report.memoryAnalysis.final.heapTotal} | ${report.memoryAnalysis.delta.heapTotal} |\n`;
    markdown += `| RSS | ${report.memoryAnalysis.initial.rss} | ${report.memoryAnalysis.final.rss} | ${report.memoryAnalysis.delta.rss} |\n\n`;
    
    // Alerts Summary
    if (report.alerts.length > 0) {
      markdown += `## Memory Alerts\n\n`;
      markdown += `| Time | Level | Message |\n`;
      markdown += `|------|-------|----------|\n`;
      report.alerts.forEach(alert => {
        const time = new Date(alert.timestamp).toLocaleTimeString();
        markdown += `| ${time} | ${alert.level} | ${alert.message} |\n`;
      });
      markdown += `\n`;
    } else {
      markdown += `## Memory Alerts\n\n✅ No memory alerts generated during execution.\n\n`;
    }
    
    // Recommendations
    if (report.recommendations.length > 0) {
      markdown += `## Recommendations\n\n`;
      report.recommendations.forEach((rec, index) => {
        markdown += `### ${index + 1}. ${rec.category} (${rec.priority})\n\n`;
        markdown += `**Issue:** ${rec.recommendation}\n\n`;
        markdown += `**Action:** ${rec.action}\n\n`;
      });
    } else {
      markdown += `## Recommendations\n\n✅ No specific recommendations. Memory usage is within acceptable limits.\n\n`;
    }
    
    // Thresholds
    markdown += `## Memory Thresholds\n\n`;
    markdown += `- **Warning:** ${report.thresholds.warning}MB\n`;
    markdown += `- **Critical:** ${report.thresholds.critical}MB\n`;
    markdown += `- **Emergency:** ${report.thresholds.emergency}MB\n\n`;
    
    return markdown;
  }

  writeMarkdownReport() {
    const markdown = this.generateMarkdownReport();
    const reportPath = path.join(process.cwd(), 'logs', 'memory-reports', `ci-memory-report-${Date.now()}.md`);
    
    try {
      fs.writeFileSync(reportPath, markdown);
      console.log(`📄 CI memory markdown report written to: ${reportPath}`);
      return reportPath;
    } catch (error) {
      console.error('❌ Failed to write markdown report:', error.message);
      return null;
    }
  }

  // Static method for quick CI monitoring
  static async monitorCIExecution(command, label = 'ci-execution') {
    const monitor = new CIMemoryMonitor();
    
    console.log(`🚀 Starting CI memory monitoring for: ${label}`);
    monitor.takeSnapshot(`${label}-start`);
    
    try {
      // Execute the command if provided
      if (command) {
        console.log(`📋 Executing: ${command}`);
        execSync(command, { stdio: 'inherit' });
      }
      
      monitor.takeSnapshot(`${label}-end`);
      
      // Generate reports
      const jsonReport = monitor.writeCIReport();
      const markdownReport = monitor.writeMarkdownReport();
      
      console.log(`✅ CI memory monitoring completed for: ${label}`);
      
      return {
        success: true,
        jsonReport,
        markdownReport,
        alerts: monitor.alerts.length,
        snapshots: monitor.memorySnapshots.length
      };
      
    } catch (error) {
      monitor.takeSnapshot(`${label}-error`);
      monitor.addAlert('ERROR', `Command execution failed: ${error.message}`, monitor.memorySnapshots[monitor.memorySnapshots.length - 1]);
      
      // Still generate reports for debugging
      monitor.writeCIReport();
      monitor.writeMarkdownReport();
      
      console.error(`❌ CI memory monitoring failed for: ${label}`, error.message);
      
      return {
        success: false,
        error: error.message,
        alerts: monitor.alerts.length,
        snapshots: monitor.memorySnapshots.length
      };
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args.join(' ');
  
  if (command) {
    CIMemoryMonitor.monitorCIExecution(command, 'cli-command')
      .then(result => {
        process.exit(result.success ? 0 : 1);
      })
      .catch(error => {
        console.error('Monitoring failed:', error);
        process.exit(1);
      });
  } else {
    // Just run monitoring without command
    const monitor = new CIMemoryMonitor();
    monitor.takeSnapshot('manual-snapshot');
    monitor.writeCIReport();
    monitor.writeMarkdownReport();
    console.log('📊 Memory monitoring completed');
  }
}

module.exports = { CIMemoryMonitor };