#!/usr/bin/env node

/**
 * Master script to run various project fixes
 * Usage: node scripts/fix-project.mjs [--dry-run] [--category=typescript|syntax|cuisine|all]
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const categories = {
  typescript: ['typescript-fixes/fix-typescript-safely.js'],
  syntax: ['syntax-fixes/fix-syntax-errors.js', 'syntax-fixes/fix-jsx-syntax.js'],
  cuisine: ['cuisine-fixes/fix-cuisine-comprehensive.js'],
  elemental: ['elemental-fixes/fix-elemental-logic.js'],
  all: 'all'
};

function runScript(scriptPath, dryRun = false) {
  const fullPath = path.join(__dirname, scriptPath);
  const dryRunFlag = dryRun ? '--dry-run' : '';
  const command = `node ${fullPath} ${dryRunFlag}`;
  
  console.log(`Running: ${command}`);
  
  if (!dryRun) {
    try {
      execSync(command, { stdio: 'inherit' });
    } catch (error) {
      console.error(`Error running ${scriptPath}:`, error.message);
    }
  }
}

function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const categoryArg = args.find(arg => arg.startsWith('--category='));
  const category = categoryArg ? categoryArg.split('=')[1] : 'all';
  
  console.log(`Fix Project Script - Category: ${category}, Dry Run: ${isDryRun}`);
  
  if (category === 'all') {
    Object.values(categories).flat().filter(script => script !== 'all').forEach(script => {
      runScript(script, isDryRun);
    });
  } else if (categories[category]) {
    categories[category].forEach(script => {
      runScript(script, isDryRun);
    });
  } else {
    console.error(`Unknown category: ${category}`);
    console.log('Available categories:', Object.keys(categories).join(', '));
    process.exit(1);
  }
}

main();
