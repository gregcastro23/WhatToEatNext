#!/usr/bin/env node

/**
 * SimpleMetrics - Phase 4 Enterprise Error Elimination
 * WhatToEatNext - October 9, 2025
 *
 * Lightweight metrics tracking for monitoring error reduction progress
 * Provides daily snapshots and trend analysis without heavy overhead
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class SimpleMetrics {
  constructor() {
    this.projectRoot = process.cwd();
    this.metricsDir = path.join(this.projectRoot, '.quality-gates', 'metrics');

    // Ensure metrics directory exists
    if (!fs.existsSync(this.metricsDir)) {
      fs.mkdirSync(this.metricsDir, { recursive: true });
    }
  }

  /**
   * Capture current error metrics snapshot
   */
  async captureCurrentMetrics() {
    const timestamp = new Date().toISOString();

    try {
      console.log('📊 Capturing current error metrics...');

      const tscOutput = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 || true', {
        cwd: this.projectRoot,
        encoding: 'utf8',
        maxBuffer: 50 * 1024 * 1024
      });

      const errorCounts = {};
      const errorsByFile = {};
      const lines = tscOutput.split('\n');

      for (const line of lines) {
        const errorMatch = line.match(/error (TS\d+):/);
        if (errorMatch) {
          const errorCode = errorMatch[1];
          errorCounts[errorCode] = (errorCounts[errorCode] || 0) + 1;

          // Track errors by file
          const fileMatch = line.match(/^(.+?)\(\d+,\d+\):/);
          if (fileMatch) {
            const fileName = path.basename(fileMatch[1]);
            if (!errorsByFile[fileName]) {
              errorsByFile[fileName] = {};
            }
            errorsByFile[fileName][errorCode] = (errorsByFile[fileName][errorCode] || 0) + 1;
          }
        }
      }

      const totalErrors = Object.values(errorCounts).reduce((a, b) => a + b, 0);

      const metrics = {
        timestamp,
        totalErrors,
        errorTypes: Object.keys(errorCounts).length,
        errorsByType: errorCounts,
        topErrors: Object.entries(errorCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .map(([code, count]) => ({ code, count })),
        topFiles: Object.entries(errorsByFile)
          .map(([file, errors]) => ({
            file,
            totalErrors: Object.values(errors).reduce((a, b) => a + b, 0),
            errorTypes: Object.keys(errors).length
          }))
          .sort((a, b) => b.totalErrors - a.totalErrors)
          .slice(0, 10)
      };

      // Save daily snapshot
      const date = timestamp.split('T')[0];
      const filename = `metrics-${date}.json`;
      const filepath = path.join(this.metricsDir, filename);

      fs.writeFileSync(filepath, JSON.stringify(metrics, null, 2));

      console.log(`✅ Metrics captured: ${totalErrors} total errors across ${metrics.errorTypes} types`);
      console.log(`   Saved to: ${filename}`);

      // Also save latest snapshot for quick access
      const latestPath = path.join(this.metricsDir, 'metrics-latest.json');
      fs.writeFileSync(latestPath, JSON.stringify(metrics, null, 2));

      return metrics;

    } catch (error) {
      console.error('❌ Failed to capture metrics:', error.message);
      return null;
    }
  }

  /**
   * Generate progress report for specified number of days
   */
  async generateProgressReport(days = 7) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📈 PROGRESS REPORT - Last ${days} Days`);
    console.log('='.repeat(60));

    const files = fs.readdirSync(this.metricsDir)
      .filter(f => f.startsWith('metrics-') && f.endsWith('.json') && f !== 'metrics-latest.json')
      .sort()
      .slice(-days);

    if (files.length === 0) {
      console.log('\n📊 No metrics history found');
      console.log('Run "node simple-metrics.js capture" to start tracking metrics');
      return null;
    }

    const history = files.map(f => {
      const data = JSON.parse(fs.readFileSync(path.join(this.metricsDir, f), 'utf8'));
      return {
        date: data.timestamp.split('T')[0],
        totalErrors: data.totalErrors,
        errorTypes: data.errorTypes,
        topErrors: data.topErrors
      };
    });

    const first = history[0];
    const last = history[history.length - 1];
    const reduction = first.totalErrors - last.totalErrors;
    const percentChange = first.totalErrors > 0 ? ((reduction / first.totalErrors) * 100).toFixed(1) : '0.0';
    const avgDaily = history.length > 1 ? (reduction / (history.length - 1)).toFixed(1) : '0.0';

    // Summary
    console.log('\n📊 Summary:');
    console.log('─'.repeat(60));
    console.log(`Starting Errors:   ${first.totalErrors.toString().padStart(6)} (${first.date})`);
    console.log(`Current Errors:    ${last.totalErrors.toString().padStart(6)} (${last.date})`);
    console.log(`Reduction:         ${reduction.toString().padStart(6)} errors`);
    console.log(`Percent Change:    ${percentChange.toString().padStart(6)}%`);
    console.log(`Daily Average:     ${avgDaily.toString().padStart(6)} errors/day`);

    // Daily breakdown
    console.log('\n📅 Daily Breakdown:');
    console.log('─'.repeat(60));
    const maxErrors = Math.max(...history.map(h => h.totalErrors));
    const scale = maxErrors > 0 ? 50 / maxErrors : 1; // Scale to 50 chars max

    history.forEach((h, i) => {
      const bar = '█'.repeat(Math.ceil(h.totalErrors * scale));
      const change = i > 0 ? h.totalErrors - history[i - 1].totalErrors : 0;
      const changeStr = change !== 0 ? (change > 0 ? ` (+${change})` : ` (${change})`) : '';
      console.log(`${h.date}: ${h.totalErrors.toString().padStart(6)} ${bar}${changeStr}`);
    });

    // Top error types currently
    console.log('\n🎯 Current Top Errors:');
    console.log('─'.repeat(60));
    if (last.topErrors && last.topErrors.length > 0) {
      last.topErrors.slice(0, 5).forEach((err, i) => {
        const bar = '█'.repeat(Math.ceil((err.count / last.totalErrors) * 30));
        console.log(`${(i + 1)}. ${err.code}: ${err.count.toString().padStart(5)} ${bar}`);
      });
    } else {
      console.log('No errors found!');
    }

    console.log('='.repeat(60));

    return {
      history,
      reduction,
      percentChange,
      avgDaily,
      summary: {
        start: first,
        current: last
      }
    };
  }

  /**
   * Compare two snapshots to show what changed
   */
  async compareSnapshots(date1, date2) {
    const file1 = path.join(this.metricsDir, `metrics-${date1}.json`);
    const file2 = path.join(this.metricsDir, `metrics-${date2}.json`);

    if (!fs.existsSync(file1) || !fs.existsSync(file2)) {
      console.log('❌ One or both snapshot files not found');
      return null;
    }

    const snapshot1 = JSON.parse(fs.readFileSync(file1, 'utf8'));
    const snapshot2 = JSON.parse(fs.readFileSync(file2, 'utf8'));

    const allErrorTypes = new Set([
      ...Object.keys(snapshot1.errorsByType),
      ...Object.keys(snapshot2.errorsByType)
    ]);

    const changes = [];
    for (const errorType of allErrorTypes) {
      const count1 = snapshot1.errorsByType[errorType] || 0;
      const count2 = snapshot2.errorsByType[errorType] || 0;
      const change = count2 - count1;

      if (change !== 0) {
        changes.push({
          errorType,
          before: count1,
          after: count2,
          change,
          percentChange: count1 > 0 ? ((change / count1) * 100).toFixed(1) : 'N/A'
        });
      }
    }

    changes.sort((a, b) => a.change - b.change); // Most improved first

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 SNAPSHOT COMPARISON: ${date1} → ${date2}`);
    console.log('='.repeat(60));
    console.log(`Total Errors: ${snapshot1.totalErrors} → ${snapshot2.totalErrors} (${snapshot2.totalErrors - snapshot1.totalErrors})`);

    if (changes.length > 0) {
      console.log('\n📈 Error Type Changes:');
      changes.forEach(c => {
        const arrow = c.change < 0 ? '↓' : '↑';
        const sign = c.change > 0 ? '+' : '';
        console.log(`  ${c.errorType}: ${c.before} → ${c.after} ${arrow} ${sign}${c.change} (${c.percentChange}%)`);
      });
    } else {
      console.log('\nNo changes in error distribution');
    }

    return { snapshot1, snapshot2, changes };
  }

  /**
   * Export metrics to CSV for external analysis
   */
  async exportToCSV(outputFile) {
    const files = fs.readdirSync(this.metricsDir)
      .filter(f => f.startsWith('metrics-') && f.endsWith('.json') && f !== 'metrics-latest.json')
      .sort();

    if (files.length === 0) {
      console.log('❌ No metrics data available to export');
      return null;
    }

    // Collect all unique error types
    const allErrorTypes = new Set();
    const data = files.map(f => {
      const metrics = JSON.parse(fs.readFileSync(path.join(this.metricsDir, f), 'utf8'));
      Object.keys(metrics.errorsByType).forEach(type => allErrorTypes.add(type));
      return metrics;
    });

    const errorTypeArray = Array.from(allErrorTypes).sort();

    // Generate CSV
    const headers = ['Date', 'Total Errors', 'Error Types', ...errorTypeArray];
    const rows = data.map(d => {
      const date = d.timestamp.split('T')[0];
      const row = [
        date,
        d.totalErrors,
        d.errorTypes,
        ...errorTypeArray.map(type => d.errorsByType[type] || 0)
      ];
      return row.join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');

    const outputPath = outputFile || path.join(this.metricsDir, 'metrics-export.csv');
    fs.writeFileSync(outputPath, csv);

    console.log(`✅ Metrics exported to: ${outputPath}`);
    console.log(`   ${data.length} rows, ${headers.length} columns`);

    return outputPath;
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  const metrics = new SimpleMetrics();

  switch (command) {
    case 'capture':
      await metrics.captureCurrentMetrics();
      break;

    case 'report':
      const days = parseInt(args[1]) || 7;
      await metrics.generateProgressReport(days);
      break;

    case 'compare':
      if (args.length < 3) {
        console.log('❌ Usage: node simple-metrics.js compare <date1> <date2>');
        console.log('Example: node simple-metrics.js compare 2025-10-01 2025-10-08');
        process.exit(1);
      }
      await metrics.compareSnapshots(args[1], args[2]);
      break;

    case 'export':
      const outputFile = args[1];
      await metrics.exportToCSV(outputFile);
      break;

    default:
      console.log(`
SimpleMetrics - Phase 4 Enterprise Error Elimination
WhatToEatNext - October 9, 2025

Lightweight metrics tracking for monitoring error reduction progress

Usage: node src/scripts/quality-gates/simple-metrics.js <command> [options]

Commands:
  capture              - Capture current error metrics snapshot
  report [days]        - Generate progress report (default: 7 days)
  compare <d1> <d2>    - Compare two snapshots by date (YYYY-MM-DD)
  export [file]        - Export metrics to CSV

Examples:
  # Capture daily metrics (run this daily or in CI)
  node src/scripts/quality-gates/simple-metrics.js capture

  # View 7-day progress report
  node src/scripts/quality-gates/simple-metrics.js report

  # View 30-day progress report
  node src/scripts/quality-gates/simple-metrics.js report 30

  # Compare two specific dates
  node src/scripts/quality-gates/simple-metrics.js compare 2025-10-01 2025-10-08

  # Export all metrics to CSV
  node src/scripts/quality-gates/simple-metrics.js export

  # Export to specific file
  node src/scripts/quality-gates/simple-metrics.js export ./metrics.csv

Features:
  ✅ Daily error snapshots
  ✅ Trend analysis and visualization
  ✅ Error type tracking
  ✅ File-level error distribution
  ✅ CSV export for external analysis
      `);
  }
}

export default SimpleMetrics;
