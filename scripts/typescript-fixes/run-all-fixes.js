#!/usr/bin/env node

/**
 * run-all-fixes.js
 * 
 * This script runs all TypeScript fixes in the correct order:
 * 1. Fix async/await patterns
 * 2. Fix ThermodynamicMetrics interface
 * 3. Fix Ingredient type issues
 * 4. Create missing component files
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Track if we're in dry run mode
const isDryRun = process.argv.includes('--dry-run');
const isVerbose = process.argv.includes('--verbose');

// Get the root directory
const rootDir = path.resolve(__dirname, '../..');

// Run a script
function runScript(scriptPath, dryRun) {
  const fullPath = path.resolve(rootDir, scriptPath);
  const command = `node ${fullPath}${dryRun ? ' --dry-run' : ''}`;
  
  if (isVerbose) {
    console.log(`Running: ${command}`);
  }
  
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Error running ${scriptPath}:`, error);
    return false;
  }
}

// Scripts to run in order
const scripts = [
  'scripts/typescript-fixes/fix-async-await-patterns.js',
  'scripts/typescript-fixes/fix-thermodynamic-metrics.js',
  'scripts/typescript-fixes/fix-ingredient-type.js',
  'scripts/typescript-fixes/create-missing-components.js'
];

console.log(`Running TypeScript fixes ${isDryRun ? 'in dry-run mode' : ''}`);

let allSuccessful = true;

// Run each script in order
for (const script of scripts) {
  console.log(`\n=== Running ${script} ===`);
  const success = runScript(script, isDryRun);
  if (!success) {
    allSuccessful = false;
    console.error(`Failed to run ${script}`);
  }
}

if (allSuccessful) {
  console.log('\n✅ All TypeScript fixes completed successfully');
} else {
  console.error('\n❌ Some TypeScript fixes failed');
  process.exit(1);
} 