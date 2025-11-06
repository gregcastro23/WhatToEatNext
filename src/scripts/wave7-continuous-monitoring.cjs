#!/usr/bin/env node

/**
 * Wave 7: Continuous Monitoring and Prevention System
 *
 * This wave implements the continuous monitoring and prevention systems
 * recommended from Wave 6, focusing on automated tracking, threshold-based
 * alerts, and preventive measures for unused variable accumulation.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class Wave7ContinuousMonitoring {
  constructor() {
    this.monitoringConfig = {
      thresholds: {
        green: 500, // Optimal range
        yellow: 600, // Monitor closely
        orange: 700, // Action required
        red: 800, // Emergency cleanup
      },
      checkInterval: 300000, // 5 minutes in milliseconds
      reportInterval: 3600000, // 1 hour in milliseconds
      alertEnabled: true,
      autoCleanupEnabled: false, // Safety first - manual approval required
    };

    this.currentMetrics = {
      unusedVariables: 0,
      lastCheck: null,
      trend: "stable",
      alerts: [],
      history: [],
    };

    this.preservationPatterns = [
      // Enhanced from Wave 6
      /\b(planet|degree|sign|longitude|position|coordinates|zodiac|celestial|ephemeris|transit|astro|lunar|solar)\b/i,
      /\b(metrics|progress|safety|campaign|validation|intelligence|monitoring|analytics|batch|processor)\b/i,
      /\b(recipe|ingredient|cooking|elemental|fire|water|earth|air|cuisine|flavor|spice|herb|nutrition)\b/i,
      /\b(mock|stub|test|expect|describe|it|fixture|assertion|jest|vitest|spec|suite)\b/i,
      /\b(api|service|business|logic|integration|adapter|client|server|endpoint)\b/i,
      /\b(component|props|state|context|provider|hook|render|jsx|tsx)\b/i,
    ];
  }

  async getCurrentUnusedVariableCount() {
    try {
      const count = execSync(
        'yarn lint 2>/dev/null | grep -c "no-unused-vars" || echo "0"',
        {
          encoding: "utf8",
          timeout: 30000, // 30 second timeout
        },
      ).trim();
      return parseInt(count) || 0;
    } catch (error) {
      console.error("Error getting unused variable count:", error.message);
      return -1;
    }
  }

  async getDetailedUnusedVariables() {
    try {
      // Get a sample of unused variables for analysis
      const lintOutput = execSync(
        'yarn lint 2>/dev/null | grep "no-unused-vars" | head -20',
        {
          encoding: "utf8",
          maxBuffer: 1024 * 1024 * 2, // 2MB buffer
          timeout: 30000,
        },
      );

      const lines = lintOutput.split("\n").filter((line) => line.trim());
      const variables = [];

      for (const line of lines) {
        const match = line.match(
          /^(.+?):(\d+):(\d+)\s+error\s+'([^']+)' is defined but never used/,
        );
        if (match) {
          const [, filePath, lineNum, col, variableName] = match;

          variables.push({
            filePath: filePath.trim(),
            line: parseInt(lineNum),
            variableName: variableName,
            preserved: this.shouldPreserveVariable(variableName, filePath),
            category: this.categorizeVariable(variableName, filePath),
          });
        }
      }

      return variables;
    } catch (error) {
      console.error("Error getting detailed variables:", error.message);
      return [];
    }
  }

  shouldPreserveVariable(variableName, filePath) {
    for (const pattern of this.preservationPatterns) {
      if (pattern.test(variableName) || pattern.test(filePath)) {
        return true;
      }
    }
    return false;
  }

  categorizeVariable(variableName, filePath) {
    if (this.shouldPreserveVariable(variableName, filePath)) {
      return "preserved";
    }

    if (variableName.startsWith("_") || variableName.startsWith("UNUSED_")) {
      return "safe-to-eliminate";
    }

    if (/^[A-Z_]+$/.test(variableName) && variableName.length < 20) {
      return "simple-constant";
    }

    if (filePath.includes("test") || filePath.includes("spec")) {
      return "test-related";
    }

    return "review-required";
  }

  determineAlertLevel(count) {
    const { thresholds } = this.monitoringConfig;

    if (count <= thresholds.green) return "green";
    if (count <= thresholds.yellow) return "yellow";
    if (count <= thresholds.orange) return "orange";
    return "red";
  }

  calculateTrend() {
    const { history } = this.currentMetrics;

    if (history.length < 2) return "stable";

    const recent = history.slice(-3);
    const increasing = recent.every(
      (entry, i) => i === 0 || entry.count >= recent[i - 1].count,
    );
    const decreasing = recent.every(
      (entry, i) => i === 0 || entry.count <= recent[i - 1].count,
    );

    if (increasing && recent[recent.length - 1].count > recent[0].count + 10) {
      return "increasing";
    }
    if (decreasing && recent[0].count > recent[recent.length - 1].count + 10) {
      return "decreasing";
    }

    return "stable";
  }

  generateAlert(level, count, trend) {
    const timestamp = new Date().toISOString();
    const alert = {
      timestamp,
      level,
      count,
      trend,
      message: this.getAlertMessage(level, count, trend),
      recommendations: this.getRecommendations(level, trend),
    };

    this.currentMetrics.alerts.push(alert);

    // Keep only last 10 alerts
    if (this.currentMetrics.alerts.length > 10) {
      this.currentMetrics.alerts = this.currentMetrics.alerts.slice(-10);
    }

    return alert;
  }

  getAlertMessage(level, count, trend) {
    const messages = {
      green: `✅ Unused variables in optimal range: ${count}`,
      yellow: `⚠️ Unused variables increasing: ${count} (monitor closely)`,
      orange: `🟠 Unused variables require attention: ${count} (action recommended)`,
      red: `🔴 Unused variables critical: ${count} (immediate action required)`,
    };

    const trendMessages = {
      increasing: " - Trend: Increasing ⬆️",
      decreasing: " - Trend: Decreasing ⬇️",
      stable: " - Trend: Stable ➡️",
    };

    return messages[level] + trendMessages[trend];
  }

  getRecommendations(level, trend) {
    const recommendations = [];

    if (level === "red") {
      recommendations.push("🚨 Execute immediate cleanup using Wave 6 tools");
      recommendations.push(
        "📊 Analyze variable categories for bulk elimination opportunities",
      );
      recommendations.push(
        "🔍 Review recent commits for unused variable introduction",
      );
    } else if (level === "orange") {
      recommendations.push("🛠️ Schedule cleanup session within 48 hours");
      recommendations.push("📈 Monitor trend closely for further increases");
      recommendations.push("🔧 Consider running Wave 6 DirectApproach tool");
    } else if (level === "yellow") {
      recommendations.push("👀 Monitor daily for trend changes");
      recommendations.push("📝 Document sources of new unused variables");
      recommendations.push("🎯 Target safe-to-eliminate variables first");
    }

    if (trend === "increasing") {
      recommendations.push("🔍 Investigate recent development activity");
      recommendations.push("📚 Review team coding practices");
      recommendations.push("🛡️ Consider implementing pre-commit hooks");
    }

    return recommendations;
  }

  async performMonitoringCheck() {
    console.log("🔍 Performing monitoring check...");

    const count = await this.getCurrentUnusedVariableCount();
    const timestamp = new Date().toISOString();

    if (count === -1) {
      console.error("❌ Failed to get unused variable count");
      return null;
    }

    // Update metrics
    this.currentMetrics.unusedVariables = count;
    this.currentMetrics.lastCheck = timestamp;

    // Add to history
    this.currentMetrics.history.push({ timestamp, count });

    // Keep only last 24 hours of history (assuming 5-minute intervals)
    if (this.currentMetrics.history.length > 288) {
      this.currentMetrics.history = this.currentMetrics.history.slice(-288);
    }

    // Calculate trend
    this.currentMetrics.trend = this.calculateTrend();

    // Determine alert level
    const alertLevel = this.determineAlertLevel(count);

    // Generate alert if needed
    let alert = null;
    if (alertLevel !== "green" || this.currentMetrics.trend === "increasing") {
      alert = this.generateAlert(alertLevel, count, this.currentMetrics.trend);

      if (this.monitoringConfig.alertEnabled) {
        console.log(`\n${alert.message}`);

        if (alert.recommendations.length > 0) {
          console.log("\n📋 Recommendations:");
          alert.recommendations.forEach((rec) => console.log(`  ${rec}`));
        }
      }
    }

    return {
      count,
      alertLevel,
      trend: this.currentMetrics.trend,
      alert,
      timestamp,
    };
  }

  async generateDetailedReport() {
    console.log("\n📊 Generating detailed monitoring report...");

    const detailedVariables = await this.getDetailedUnusedVariables();

    const categoryCounts = detailedVariables.reduce((acc, variable) => {
      acc[variable.category] = (acc[variable.category] || 0) + 1;
      return acc;
    }, {});

    const preservedCount = detailedVariables.filter((v) => v.preserved).length;
    const eliminationCandidates = detailedVariables.filter(
      (v) => !v.preserved,
    ).length;

    const report = {
      timestamp: new Date().toISOString(),
      totalCount: this.currentMetrics.unusedVariables,
      sampleAnalyzed: detailedVariables.length,
      categoryCounts,
      preservedCount,
      eliminationCandidates,
      alertLevel: this.determineAlertLevel(this.currentMetrics.unusedVariables),
      trend: this.currentMetrics.trend,
      recentAlerts: this.currentMetrics.alerts.slice(-5),
      recommendations: this.getRecommendations(
        this.determineAlertLevel(this.currentMetrics.unusedVariables),
        this.currentMetrics.trend,
      ),
    };

    return report;
  }

  async saveMonitoringData() {
    const dataDir = ".kiro/specs/unused-variable-elimination/monitoring";

    // Ensure directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = path.join(dataDir, `monitoring-${timestamp}.json`);

    const data = {
      config: this.monitoringConfig,
      metrics: this.currentMetrics,
      generatedAt: new Date().toISOString(),
    };

    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    console.log(`💾 Monitoring data saved to ${filename}`);

    return filename;
  }

  async runSingleCheck() {
    console.log("🚀 Starting Wave 7 Continuous Monitoring - Single Check\n");

    try {
      const result = await this.performMonitoringCheck();

      if (!result) {
        console.error("❌ Monitoring check failed");
        return;
      }

      console.log("\n📈 Current Status:");
      console.log(`  Unused Variables: ${result.count}`);
      console.log(`  Alert Level: ${result.alertLevel.toUpperCase()}`);
      console.log(`  Trend: ${result.trend}`);
      console.log(`  Last Check: ${result.timestamp}`);

      // Generate detailed report
      const report = await this.generateDetailedReport();

      console.log("\n📊 Sample Analysis (20 variables):");
      console.log(`  Preserved: ${report.preservedCount}`);
      console.log(`  Elimination Candidates: ${report.eliminationCandidates}`);

      console.log("\n📋 Category Breakdown:");
      Object.entries(report.categoryCounts).forEach(([category, count]) => {
        console.log(`  ${category}: ${count}`);
      });

      // Save monitoring data
      await this.saveMonitoringData();

      console.log("\n✅ Wave 7 monitoring check completed successfully!");

      return report;
    } catch (error) {
      console.error("❌ Error during monitoring check:", error.message);
      throw error;
    }
  }

  async runContinuousMonitoring(duration = 3600000) {
    // 1 hour default
    console.log("🚀 Starting Wave 7 Continuous Monitoring - Continuous Mode\n");
    console.log(`⏱️ Duration: ${duration / 60000} minutes`);
    console.log(
      `🔄 Check Interval: ${this.monitoringConfig.checkInterval / 60000} minutes`,
    );

    const startTime = Date.now();
    const endTime = startTime + duration;

    let checkCount = 0;

    while (Date.now() < endTime) {
      checkCount++;
      console.log(
        `\n🔍 Check #${checkCount} - ${new Date().toLocaleTimeString()}`,
      );

      try {
        await this.performMonitoringCheck();

        // Save data every 5 checks
        if (checkCount % 5 === 0) {
          await this.saveMonitoringData();
        }
      } catch (error) {
        console.error(`❌ Check #${checkCount} failed:`, error.message);
      }

      // Wait for next check
      if (Date.now() < endTime) {
        console.log(
          `⏳ Waiting ${this.monitoringConfig.checkInterval / 60000} minutes until next check...`,
        );
        await new Promise((resolve) =>
          setTimeout(resolve, this.monitoringConfig.checkInterval),
        );
      }
    }

    console.log(
      `\n✅ Continuous monitoring completed after ${checkCount} checks`,
    );

    // Generate final report
    const finalReport = await this.generateDetailedReport();
    await this.saveMonitoringData();

    return finalReport;
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const mode = args[0] || "single";

  const monitor = new Wave7ContinuousMonitoring();

  if (mode === "continuous") {
    const duration = parseInt(args[1]) || 3600000; // Default 1 hour
    monitor.runContinuousMonitoring(duration).catch(console.error);
  } else {
    monitor.runSingleCheck().catch(console.error);
  }
}

module.exports = Wave7ContinuousMonitoring;
