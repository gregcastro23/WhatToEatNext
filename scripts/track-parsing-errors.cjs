#!/usr/bin/env node
/**
 * Parsing Error Tracking Dashboard
 * Monitors TypeScript compilation errors during cleanup campaign
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TRACKING_FILE = path.join(__dirname, '../.parsing-errors-log.json');
const BASELINE_ERRORS = 6601;

function getTimestamp() {
  return new Date().toISOString();
}

function getCurrentErrors() {
  try {
    const output = execSync('tsc --noEmit 2>&1', { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    const errorLines = output.split('\n').filter(line => line.includes('error TS'));

    const errorsByType = {};
    const errorsByFile = {};

    errorLines.forEach(line => {
      const typeMatch = line.match(/error (TS\d+):/);
      const fileMatch = line.match(/^([^(]+)\(/);

      if (typeMatch) {
        const errorType = typeMatch[1];
        errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;
      }

      if (fileMatch) {
        const file = fileMatch[1];
        errorsByFile[file] = (errorsByFile[file] || 0) + 1;
      }
    });

    return {
      total: errorLines.length,
      byType: errorsByType,
      byFile: errorsByFile,
      timestamp: getTimestamp()
    };
  } catch (error) {
    // TypeScript errors cause non-zero exit, but we still get output
    const output = error.stdout || '';
    const errorLines = output.split('\n').filter(line => line.includes('error TS'));

    const errorsByType = {};
    const errorsByFile = {};

    errorLines.forEach(line => {
      const typeMatch = line.match(/error (TS\d+):/);
      const fileMatch = line.match(/^([^(]+)\(/);

      if (typeMatch) {
        const errorType = typeMatch[1];
        errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;
      }

      if (fileMatch) {
        const file = fileMatch[1];
        errorsByFile[file] = (errorsByFile[file] || 0) + 1;
      }
    });

    return {
      total: errorLines.length,
      byType: errorsByType,
      byFile: errorsByFile,
      timestamp: getTimestamp()
    };
  }
}

function loadHistory() {
  if (fs.existsSync(TRACKING_FILE)) {
    return JSON.parse(fs.readFileSync(TRACKING_FILE, 'utf8'));
  }
  return { baseline: BASELINE_ERRORS, history: [] };
}

function saveHistory(data) {
  fs.writeFileSync(TRACKING_FILE, JSON.stringify(data, null, 2));
}

function displayDashboard(current, history) {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║         PARSING ERROR TRACKING DASHBOARD                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const baseline = history.baseline || BASELINE_ERRORS;
  const reduction = baseline - current.total;
  const percentReduction = ((reduction / baseline) * 100).toFixed(1);

  console.log(`📊 Current Error Count: ${current.total}`);
  console.log(`📉 Baseline: ${baseline}`);
  console.log(`✅ Errors Eliminated: ${reduction} (${percentReduction}%)`);
  console.log(`🎯 Remaining: ${current.total}\n`);

  console.log('📋 Top Error Types:');
  const sortedTypes = Object.entries(current.byType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  sortedTypes.forEach(([type, count]) => {
    console.log(`   ${type}: ${count}`);
  });

  console.log('\n📁 Top Problem Files:');
  const sortedFiles = Object.entries(current.byFile)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  sortedFiles.forEach(([file, count]) => {
    const shortFile = file.replace(/^src\//, '');
    console.log(`   ${shortFile}: ${count}`);
  });

  if (history.history.length > 0) {
    const lastEntry = history.history[history.history.length - 1];
    const change = current.total - lastEntry.total;
    const changeSymbol = change > 0 ? '⚠️ +' : '✅ ';
    console.log(`\n📈 Change since last check: ${changeSymbol}${change}`);
  }

  console.log(`\n🕐 Last updated: ${current.timestamp}\n`);
}

function main() {
  console.log('🔍 Analyzing TypeScript errors...\n');

  const current = getCurrentErrors();
  const history = loadHistory();

  // Add current state to history
  history.history.push({
    total: current.total,
    timestamp: current.timestamp,
    topTypes: Object.entries(current.byType).sort((a, b) => b[1] - a[1]).slice(0, 5)
  });

  // Keep only last 50 entries
  if (history.history.length > 50) {
    history.history = history.history.slice(-50);
  }

  saveHistory(history);
  displayDashboard(current, history);

  // Exit with error if count increased
  if (history.history.length > 1) {
    const lastEntry = history.history[history.history.length - 2];
    if (current.total > lastEntry.total) {
      console.error('❌ ERROR COUNT INCREASED! Consider rolling back recent changes.\n');
      process.exit(1);
    }
  }
}

main();
