import { spawn } from 'child_process';
import path from 'path';

const dryRun = process.argv.includes('--dry-run');
const dryRunFlag = dryRun ? '--dry-run' : '';

const fixes = [
  'fix-spoonacular-service.js',
  'fix-elemental-calculator.js',
  'fix-astrological-service.js',
  'fix-recipe-services.js',
  'fix-recommendation-utils.js'
];

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

console.log(`${colors.bright}${colors.cyan}=========================================${colors.reset}`);
console.log(`${colors.bright}${colors.cyan}= TypeScript Phase 2 Service Fixes Script =${colors.reset}`);
console.log(`${colors.bright}${colors.cyan}=========================================${colors.reset}`);

if (dryRun) {
  console.log(`${colors.yellow}Running in DRY RUN mode - no changes will be made${colors.reset}`);
}

/**
 * Run a single fix script and return a promise that resolves when the script completes
 */
function runFix(fixScript) {
  return new Promise((resolve, reject) => {
    console.log(`\n${colors.cyan}Running ${fixScript}...${colors.reset}`);
    
    const scriptPath = path.join(process.cwd(), 'scripts', 'typescript-fixes', fixScript);
    const nodeProcess = spawn('node', [scriptPath, dryRunFlag]);
    
    // Capture and display stdout
    nodeProcess.stdout.on('data', (data) => {
      process.stdout.write(data);
    });
    
    // Capture and display stderr
    nodeProcess.stderr.on('data', (data) => {
      process.stderr.write(`${colors.red}${data}${colors.reset}`);
    });
    
    // Handle script completion
    nodeProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`${colors.green}✓ ${fixScript} completed successfully${colors.reset}`);
        resolve();
      } else {
        console.log(`${colors.red}✗ ${fixScript} failed with code ${code}${colors.reset}`);
        reject(new Error(`Script failed with code ${code}`));
      }
    });
    
    // Handle errors
    nodeProcess.on('error', (err) => {
      console.error(`${colors.red}Error executing ${fixScript}: ${err}${colors.reset}`);
      reject(err);
    });
  });
}

/**
 * Run all fix scripts in sequence
 */
async function runAllFixes() {
  console.log(`${colors.blue}Running ${fixes.length} fix scripts in sequence...${colors.reset}`);
  
  // Track number of successful and failed fixes
  let successful = 0;
  let failed = 0;
  
  for (const [index, fixScript] of fixes.entries()) {
    console.log(`\n${colors.blue}[${index + 1}/${fixes.length}] ${fixScript}${colors.reset}`);
    
    try {
      await runFix(fixScript);
      successful++;
    } catch (error) {
      console.error(`${colors.red}Failed to run ${fixScript}: ${error}${colors.reset}`);
      failed++;
      
      if (process.argv.includes('--stop-on-error')) {
        console.error(`${colors.red}Stopping due to error (--stop-on-error flag)${colors.reset}`);
        break;
      }
    }
  }
  
  // Show summary
  console.log(`\n${colors.bright}${colors.cyan}=================${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}= Run Complete =${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}=================${colors.reset}`);
  console.log(`${colors.green}Successful: ${successful}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`${colors.blue}Total: ${fixes.length}${colors.reset}`);
  
  if (dryRun) {
    console.log(`\n${colors.yellow}This was a dry run - no files were modified${colors.reset}`);
    console.log(`${colors.yellow}Run without --dry-run flag to apply changes${colors.reset}`);
  } else if (failed === 0) {
    console.log(`\n${colors.green}All service fixes were applied successfully!${colors.reset}`);
  } else {
    console.log(`\n${colors.yellow}Some fixes failed - check the logs above for details${colors.reset}`);
  }
}

// Run all the fixes
runAllFixes().catch(error => {
  console.error(`${colors.red}Unhandled error in script: ${error}${colors.reset}`);
  process.exit(1);
}); 