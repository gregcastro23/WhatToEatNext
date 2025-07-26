#!/usr/bin/env ts-node

/**
 * Unused Variable Cleanup Script
 * 
 * Systematically processes unused variable warnings while preserving
 * critical astrological calculations and domain-specific variables.
 */

import { execSync } from 'child_process';

import { UnusedVariableProcessor } from './UnusedVariableProcessor';

async function main() {
  console.log('🚀 Starting Unused Variable Cleanup Campaign');
  console.log('============================================\n');

  // Get initial count
  const initialCount = await getUnusedVariableCount();
  console.log(`📊 Initial unused variable warnings: ${initialCount}\n`);

  const processor = new UnusedVariableProcessor();

  try {
    // Create backup
    console.log('💾 Creating backup...');
    execSync('git stash push -m "Pre unused-variable-cleanup backup"', { stdio: 'inherit' });
    
    // Process unused variables
    const result = await processor.processUnusedVariables();
    
    // Generate report
    await processor.generateReport(result);
    
    // Validate changes
    const isValid = await processor.validateChanges();
    
    if (!isValid) {
      console.log('\n❌ Validation failed, restoring backup...');
      execSync('git stash pop', { stdio: 'inherit' });
      process.exit(1);
    }

    // Get final count
    const finalCount = await getUnusedVariableCount();
    console.log(`\n📊 Final unused variable warnings: ${finalCount}`);
    
    const reduction = initialCount - finalCount;
    const reductionPercentage = initialCount > 0 
      ? ((reduction / initialCount) * 100).toFixed(1)
      : '0';
    
    console.log(`✨ Total reduction: ${reduction} warnings (${reductionPercentage}%)`);
    
    if (reduction > 0) {
      console.log('\n✅ Unused variable cleanup completed successfully!');
      console.log('💡 Consider running additional linting to catch any remaining issues.');
    } else {
      console.log('\n⚠️  No unused variables were processed.');
      console.log('This might indicate all variables are critical or already properly prefixed.');
    }

  } catch (error) {
    console.error('\n❌ Error during processing:', (error as Error).message);
    
    // Restore backup on error
    try {
      execSync('git stash pop', { stdio: 'inherit' });
      console.log('🔄 Backup restored successfully');
    } catch (restoreError) {
      console.error('❌ Failed to restore backup:', (restoreError as Error).message);
    }
    
    process.exit(1);
  }
}

async function getUnusedVariableCount(): Promise<number> {
  try {
    const output = execSync('yarn lint 2>&1 | grep -c "no-unused-vars" || echo "0"', {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    return parseInt(output.trim()) || 0;
  } catch (error) {
    return 0;
  }
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}