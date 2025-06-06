// scripts/typescript-fixes/run-phase2-fixes.js

import { spawn } from 'child_process';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get root directory
const rootDir = resolve(__dirname, '..', '..');

// Scripts to run in order
const scripts = [
  'fix-recipe-elemental-service.js',
  'fix-elemental-properties-type-compatibility.js',
  'fix-recipe-dietary-properties.js'
];

// Main function
async function runAllPhase2Fixes(dryRun = false) {
  console.log(`${dryRun ? '[DRY RUN] ' : ''}Running Phase 2 TypeScript fixes...\n`);
  
  // Process each script in sequence
  for (const script of scripts) {
    const scriptPath = resolve(__dirname, script);
    console.log(`Running ${script}...`);
    
    try {
      // Run the script and wait for it to complete
      await runScript(scriptPath, dryRun);
      console.log(`✅ Successfully completed ${script}`);
      console.log('-'.repeat(50));
    } catch (error) {
      console.error(`❌ Error running ${script}:`, error);
      process.exit(1);
    }
  }
  
  console.log('\n✅ All Phase 2 fixes completed successfully!');
  console.log('\nNext steps:');
  console.log('1. Run TypeScript checks to verify fixes: yarn tsc --noEmit');
  console.log('2. Run tests: yarn test');
  console.log('3. Build the project: yarn build');
}

// Helper function to run a script
function runScript(scriptPath, dryRun) {
  return new Promise((resolve, reject) => {
    const args = [scriptPath];
    if (dryRun) {
      args.push('--dry-run');
    }
    
    const process = spawn('node', args, { stdio: 'inherit' });
    
    process.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Script exited with code ${code}`));
      }
    });
    
    process.on('error', err => {
      reject(err);
    });
  });
}

// Command line arguments handling
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

// Run all fixes
runAllPhase2Fixes(dryRun); 