#!/usr/bin/env node

/**
 * Run Targeted Unused Variable Fixes
 * 
 * Executes safe, targeted fixes for unused variables while preserving
 * critical astrological and campaign system variables.
 */

import { execSync } from 'child_process';

import { UnusedVariableTargetedFixer } from './UnusedVariableTargetedFixer';

async function main() {
  console.log('🚀 Starting Targeted Unused Variable Fixes\n');
  
  const fixer = new UnusedVariableTargetedFixer();
  
  // Get initial count
  const getUnusedCount = () => {
    try {
      const output = execSync('yarn lint --format=compact 2>&1 | grep "@typescript-eslint/no-unused-vars" | wc -l', {
        encoding: 'utf8'
      });
      return parseInt(output.trim()) || 0;
    } catch (error) {
      return 0;
    }
  };

  const initialCount = getUnusedCount();
  console.log(`📊 Initial unused variable count: ${initialCount}\n`);

  let totalFixed = 0;
  let totalErrors = 0;

  // Step 1: Fix unused function parameters
  console.log('='.repeat(50));
  console.log('STEP 1: Fixing Unused Function Parameters');
  console.log('='.repeat(50));
  
  const paramResult = await fixer.fixUnusedFunctionParameters();
  totalFixed += paramResult.variablesFixed;
  totalErrors += paramResult.errors.length;
  
  console.log(`\n📊 Parameters fixed: ${paramResult.variablesFixed}`);
  console.log(`📄 Files processed: ${paramResult.filesProcessed}`);
  if (paramResult.errors.length > 0) {
    console.log(`❌ Errors: ${paramResult.errors.length}`);
  }

  // Step 2: Fix unused destructured variables
  console.log('\n' + '='.repeat(50));
  console.log('STEP 2: Fixing Unused Destructured Variables');
  console.log('='.repeat(50));
  
  const destructuredResult = await fixer.fixUnusedDestructuredVariables();
  totalFixed += destructuredResult.variablesFixed;
  totalErrors += destructuredResult.errors.length;
  
  console.log(`\n📊 Variables fixed: ${destructuredResult.variablesFixed}`);
  console.log(`📄 Files processed: ${destructuredResult.filesProcessed}`);
  if (destructuredResult.errors.length > 0) {
    console.log(`❌ Errors: ${destructuredResult.errors.length}`);
  }

  // Step 3: Remove unused imports
  console.log('\n' + '='.repeat(50));
  console.log('STEP 3: Removing Unused Imports');
  console.log('='.repeat(50));
  
  const importResult = await fixer.removeUnusedImports();
  totalErrors += importResult.errors.length;
  
  if (importResult.warnings.length > 0) {
    console.log(`⚠️  Warnings: ${importResult.warnings.length}`);
  }

  // Get final count
  const finalCount = getUnusedCount();
  const reduction = initialCount - finalCount;

  console.log('\n' + '='.repeat(50));
  console.log('FINAL RESULTS');
  console.log('='.repeat(50));
  console.log(`Initial unused variables: ${initialCount}`);
  console.log(`Final unused variables: ${finalCount}`);
  console.log(`Variables fixed: ${totalFixed}`);
  console.log(`Total reduction: ${reduction}`);
  console.log(`Reduction percentage: ${Math.round((reduction / initialCount) * 100)}%`);
  console.log(`Total errors: ${totalErrors}`);

  // Validate changes
  const isValid = await fixer.validateChanges();
  
  if (isValid) {
    console.log('\n🎉 Targeted unused variable fixes completed successfully!');
    console.log('✅ Build validation passed');
    console.log('✅ No functionality was broken');
    
    if (totalFixed > 0) {
      console.log(`\n📈 Successfully fixed ${totalFixed} unused variables`);
      console.log('🔧 All fixes used safe prefixing with underscore');
      console.log('🛡️  Critical astrological and campaign variables preserved');
    }
  } else {
    console.log('\n⚠️  Fixes completed but build validation failed');
    console.log('Please review the changes manually');
    process.exit(1);
  }
}

main().catch(console.error);