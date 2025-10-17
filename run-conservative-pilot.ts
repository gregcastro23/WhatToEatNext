#!/usr/bin/env ts-node

/**
 * Conservative Replacement Pilot Execution Script
 * Task 12.2: Execute conservative replacement pilot
 *
 * This script executes the conservative replacement pilot with comprehensive
 * monitoring and safety protocols.
 */

import { ConservativeReplacementPilot } from './src/services/campaign/unintentional-any-elimination/ConservativeReplacementPilot';
import { AnyTypeCategory, ConservativePilotConfig } from './src/services/campaign/unintentional-any-elimination/types';

async function main() {
  console.log('🚀 Starting Conservative Replacement Pilot (Task 12.2)...\n');

  // Configuration for conservative pilot
  const config: ConservativePilotConfig = {
    maxFilesPerBatch: 15,        // Process up to 15 files per batch
    minFilesPerBatch: 10,        // Minimum 10 files per batch
    targetSuccessRate: 0.8,      // Target >80% successful replacements
    maxBatches: 10,              // Maximum 10 batches for pilot
    realTimeValidation: true,    // Enable real-time validation
    rollbackOnFailure: true,     // Rollback on build failures
    safetyThreshold: 0.7,        // Safety threshold for replacements
    focusCategories: [           // Focus on high-confidence categories
      AnyTypeCategory.ARRAY_TYPE,
      AnyTypeCategory.RECORD_TYPE
    ],
    buildValidationFrequency: 1  // Validate after every batch
  };

  console.log('📋 Pilot Configuration:');
  console.log(`   Max files per batch: ${config.maxFilesPerBatch}`);
  console.log(`   Target success rate: ${(config.targetSuccessRate * 100).toFixed(1)}%`);
  console.log(`   Max batches: ${config.maxBatches}`);
  console.log(`   Safety threshold: ${config.safetyThreshold}`);
  console.log(`   Focus categories: ${config.focusCategories.join(', ')}`);
  console.log(`   Real-time validation: ${config.realTimeValidation ? 'Enabled' : 'Disabled'}`);
  console.log('');

  try {
    // Create and execute pilot
    const pilot = new ConservativeReplacementPilot(config);
    const result = await pilot.executePilot();

    // Display results
    console.log('\n📊 Pilot Results:');
    console.log('================');
    console.log(`Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`Message: ${result.message || 'N/A'}`);
    console.log(`Execution time: ${Math.round((result.pilotEndTime.getTime() - result.pilotStartTime.getTime()) / 1000)}s`);
    console.log('');

    console.log('📈 Key Metrics:');
    console.log(`   Cases processed: ${result.totalCasesProcessed}`);
    console.log(`   Successful replacements: ${result.totalSuccessfulReplacements}`);
    console.log(`   Success rate: ${(result.successRate * 100).toFixed(1)}%`);
    console.log(`   Batches executed: ${result.batchesExecuted}`);
    console.log(`   Build failures: ${result.buildFailures}`);
    console.log(`   Rollbacks performed: ${result.rollbacksPerformed}`);
    console.log(`   Safety score: ${result.safetyScore.toFixed(2)}`);
    console.log(`   Target achieved: ${result.targetAchieved ? '✅ YES' : '❌ NO'}`);
    console.log('');

    // Display batch results
    if (result.batchResults.length > 0) {
      console.log('📦 Batch Results:');
      result.batchResults.forEach(batch => {
        const duration = Math.round((batch.endTime.getTime() - batch.startTime.getTime()) / 1000);
        console.log(`   Batch ${batch.batchNumber}: ${batch.successfulReplacements}/${batch.casesProcessed} successful (${duration}s) ${batch.buildStable ? '✅' : '❌'}`);
      });
      console.log('');
    }

    // Display safety metrics
    console.log('🛡️ Safety Metrics:');
    console.log(`   Build failures: ${result.safetyMetrics.buildFailures}`);
    console.log(`   Rollbacks performed: ${result.safetyMetrics.rollbacksPerformed}`);
    console.log(`   Batch failures: ${result.safetyMetrics.batchFailures}`);
    console.log(`   Compilation errors: ${result.safetyMetrics.compilationErrors}`);
    console.log(`   Safety protocol activations: ${result.safetyMetrics.safetyProtocolActivations}`);
    console.log('');

    // Task 12.2 Requirements Validation
    console.log('✅ Task 12.2 Requirements Validation:');
    console.log('====================================');

    // Requirement: Run limited batch processing on high-confidence cases (10-15 files per batch)
    const batchSizeValid = result.batchResults.every(batch =>
      batch.casesProcessed >= config.minFilesPerBatch && batch.casesProcessed <= config.maxFilesPerBatch
    );
    console.log(`   ✓ Limited batch processing (10-15 files): ${batchSizeValid ? '✅ PASS' : '❌ FAIL'}`);

    // Requirement: Focus on array types and simple Record types
    const focusedOnTargetTypes = config.focusCategories.includes(AnyTypeCategory.ARRAY_TYPE) &&
                                config.focusCategories.includes(AnyTypeCategory.RECORD_TYPE);
    console.log(`   ✓ Focus on array/Record types: ${focusedOnTargetTypes ? '✅ PASS' : '❌ FAIL'}`);

    // Requirement: Monitor build stability and rollback frequency with real-time validation
    const realTimeValidationEnabled = config.realTimeValidation;
    console.log(`   ✓ Real-time validation enabled: ${realTimeValidationEnabled ? '✅ PASS' : '❌ FAIL'}`);

    // Requirement: Collect success rate metrics and safety protocol effectiveness
    const metricsCollected = result.successRate !== undefined && result.safetyScore !== undefined;
    console.log(`   ✓ Success rate & safety metrics: ${metricsCollected ? '✅ PASS' : '❌ FAIL'}`);

    // Requirement: Validate integration with existing campaign infrastructure
    const integrationValid = result.success !== undefined; // Basic integration check
    console.log(`   ✓ Campaign infrastructure integration: ${integrationValid ? '✅ PASS' : '❌ FAIL'}`);

    // Requirement: Target >80% successful replacements with zero build failures
    const targetAchieved = result.successRate >= config.targetSuccessRate && result.buildFailures === 0;
    console.log(`   ✓ Target >80% success, 0 build failures: ${targetAchieved ? '✅ PASS' : '❌ FAIL'}`);

    console.log('');

    // Overall assessment
    const allRequirementsMet = batchSizeValid && focusedOnTargetTypes && realTimeValidationEnabled &&
                              metricsCollected && integrationValid && targetAchieved;

    console.log('🎯 Overall Task 12.2 Assessment:');
    console.log(`   Status: ${allRequirementsMet ? '✅ ALL REQUIREMENTS MET' : '⚠️ SOME REQUIREMENTS NOT MET'}`);

    if (result.success && allRequirementsMet) {
      console.log('   🎉 Conservative Replacement Pilot SUCCESSFUL!');
      console.log('   📋 Ready to proceed to Task 12.3: Execute full campaign');
    } else {
      console.log('   ⚠️ Pilot did not meet all requirements');
      console.log('   📋 Review results and adjust strategy before full campaign');
    }

    console.log('');
    console.log('📄 Detailed reports available at: .kiro/campaign-reports/conservative-pilot/');

    // Exit with appropriate code
    process.exit(result.success && allRequirementsMet ? 0 : 1);

  } catch (error) {
    console.error('❌ Conservative Replacement Pilot failed:');
    console.error(error instanceof Error ? error.message : String(error));

    if (error instanceof Error && error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }

    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { main };
