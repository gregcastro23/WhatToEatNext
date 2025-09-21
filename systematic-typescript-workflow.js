#!/usr/bin/env node

import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DRY_RUN = process.argv.includes('--dry-run');
const PHASE = process.argv.includes('--phase')
  ? process.argv[process.argv.indexOf('--phase') + 1]
  : null;
const SKIP_BUILD = process.argv.includes('--skip-build');
const VERBOSE = process.argv.includes('--verbose');

console.log('🚀 Systematic TypeScript Error Resolution Workflow');
console.log(`Mode: ${DRY_RUN ? 'DRY RUN (Testing Only)' : 'EXECUTION MODE'}`);
console.log('─'.repeat(70));

const phases = [
  {
    id: 13,
    name: 'Property Access Revolution',
    script: 'fix-property-access-phase13.js',
    target: 'TS2339 (Property does not exist)',
    description: 'Fix missing properties, element casing, optional chaining',
  },
  {
    id: 14,
    name: 'Type Compatibility Revolution',
    script: 'fix-type-compatibility-phase14.js',
    target: 'TS2820, TS2345 (Index signature, argument types)',
    description: 'Fix Record types, function parameters, mixed operators',
  },
  {
    id: 15,
    name: 'Name Resolution & Duplicates Revolution',
    script: 'fix-name-resolution-phase15.js',
    target: 'TS2304, TS2300 (Cannot find name, duplicates)',
    description: 'Add missing imports, fix function names, resolve duplicates',
  },
];

async function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: true,
      ...options,
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', data => {
      stdout += data.toString();
      if (VERBOSE) process.stdout.write(data);
    });

    child.stderr?.on('data', data => {
      stderr += data.toString();
      if (VERBOSE) process.stderr.write(data);
    });

    child.on('close', code => {
      resolve({ code, stdout, stderr });
    });

    child.on('error', reject);
  });
}

async function getTypeScriptErrorCount() {
  try {
    const result = await runCommand('npx', ['tsc', '--noEmit', '--skipLibCheck']);
    const errorLines = result.stderr
      .split('\n')
      .filter(line => line.includes('error TS') && !line.includes('Found'));
    return errorLines.length;
  } catch (error) {
    console.warn('⚠️  Could not get TypeScript error count:', error.message);
    return -1;
  }
}

async function runBuildCheck() {
  console.log('\n🔨 Running build check...');
  const result = await runCommand('yarn', ['build']);

  if (result.code === 0) {
    console.log('✅ Build successful!');
    return true;
  } else {
    console.log('❌ Build failed');
    if (VERBOSE) {
      console.log('Build output:', result.stdout);
      console.log('Build errors:', result.stderr);
    }
    return false;
  }
}

async function runPhase(phase) {
  console.log(`\n📋 Phase ${phase.id}: ${phase.name}`);
  console.log(`Target: ${phase.target}`);
  console.log(`Description: ${phase.description}`);
  console.log('─'.repeat(50));

  // First run in dry-run mode to see what changes would be made
  console.log('🔍 Running dry-run analysis...');
  const dryRunArgs = ['node', phase.script, '--dry-run'];
  if (VERBOSE) dryRunArgs.push('--verbose');

  const dryRunResult = await runCommand(dryRunArgs[0], dryRunArgs.slice(1));

  if (dryRunResult.code !== 0) {
    console.error(`❌ Phase ${phase.id} dry-run failed:`, dryRunResult.stderr);
    return false;
  }

  // Extract change count from dry-run output
  const changeMatch = dryRunResult.stdout.match(/Total changes:\s*(\d+)/);
  const changeCount = changeMatch ? parseInt(changeMatch[1]) : 0;

  console.log(`📊 Dry-run results: ${changeCount} potential changes`);

  if (changeCount === 0) {
    console.log('ℹ️  No changes needed for this phase');
    return true;
  }

  if (!DRY_RUN) {
    console.log('✅ Proceeding with actual changes...');

    const actualArgs = ['node', phase.script];
    if (VERBOSE) actualArgs.push('--verbose');

    const actualResult = await runCommand(actualArgs[0], actualArgs.slice(1));

    if (actualResult.code !== 0) {
      console.error(`❌ Phase ${phase.id} execution failed:`, actualResult.stderr);
      return false;
    }

    console.log(`✅ Phase ${phase.id} completed successfully`);
    return true;
  } else {
    console.log('ℹ️  Dry-run mode: Changes not applied');
    return true;
  }
}

async function validateWorkflow() {
  console.log('\n🔍 Validating workflow prerequisites...');

  // Check if all phase scripts exist
  for (const phase of phases) {
    const scriptPath = join(__dirname, phase.script);
    try {
      readFileSync(scriptPath);
      console.log(`✅ ${phase.script} found`);
    } catch (error) {
      console.error(`❌ Missing script: ${phase.script}`);
      return false;
    }
  }

  // Check Node.js version
  const nodeVersion = process.version;
  console.log(`✅ Node.js version: ${nodeVersion}`);

  // Check yarn availability
  try {
    await runCommand('yarn', ['--version']);
    console.log('✅ Yarn available');
  } catch (error) {
    console.error('❌ Yarn not available');
    return false;
  }

  return true;
}

async function main() {
  console.log('🔧 Starting systematic TypeScript error resolution...\n');

  // Validate workflow
  const isValid = await validateWorkflow();
  if (!isValid) {
    console.error('❌ Workflow validation failed');
    process.exit(1);
  }

  // Get initial error count
  console.log('\n📊 Getting initial TypeScript error count...');
  const initialErrors = await getTypeScriptErrorCount();
  if (initialErrors > 0) {
    console.log(`📈 Initial TypeScript errors: ${initialErrors}`);
  }

  // Run specific phase or all phases
  const phasesToRun = PHASE ? phases.filter(p => p.id === parseInt(PHASE)) : phases;

  if (phasesToRun.length === 0) {
    console.error(`❌ Phase ${PHASE} not found`);
    process.exit(1);
  }

  let successfulPhases = 0;

  for (const phase of phasesToRun) {
    const success = await runPhase(phase);
    if (success) {
      successfulPhases++;

      // Run build check after each successful phase (if not in dry-run)
      if (!DRY_RUN && !SKIP_BUILD) {
        const buildSuccess = await runBuildCheck();
        if (!buildSuccess) {
          console.warn(`⚠️  Build failed after Phase ${phase.id}`);
          break;
        }
      }
    } else {
      console.error(`❌ Phase ${phase.id} failed, stopping workflow`);
      break;
    }
  }

  // Final status
  console.log('\n' + '='.repeat(70));
  console.log('📊 WORKFLOW SUMMARY');
  console.log('='.repeat(70));
  console.log(`Phases completed: ${successfulPhases}/${phasesToRun.length}`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'EXECUTION'}`);

  if (!DRY_RUN && successfulPhases === phasesToRun.length) {
    // Get final error count
    const finalErrors = await getTypeScriptErrorCount();
    if (finalErrors >= 0 && initialErrors >= 0) {
      const reduction = initialErrors - finalErrors;
      console.log(`Initial errors: ${initialErrors}`);
      console.log(`Final errors: ${finalErrors}`);
      console.log(`Errors reduced: ${reduction}`);
      console.log(`Reduction rate: ${((reduction / initialErrors) * 100).toFixed(1)}%`);
    }

    if (!SKIP_BUILD) {
      console.log('\n🔨 Running final build check...');
      const finalBuild = await runBuildCheck();
      console.log(`Final build status: ${finalBuild ? '✅ SUCCESS' : '❌ FAILED'}`);
    }
  }

  console.log('\n🔄 Next Steps:');
  if (DRY_RUN) {
    console.log('1. Review the dry-run results above');
    console.log('2. Run without --dry-run to apply changes');
    console.log('3. Test build with: yarn build');
  } else {
    console.log('1. Review TypeScript errors: npx tsc --noEmit');
    console.log('2. Test the application: yarn dev');
    console.log('3. Run additional phases if needed');
  }

  console.log('\n✨ Systematic TypeScript workflow completed!');
}

// Handle script execution
if (process.argv[1] === __filename) {
  main().catch(error => {
    console.error('❌ Workflow failed:', error);
    process.exit(1);
  });
}
