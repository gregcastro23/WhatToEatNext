#!/usr/bin/env yarn ts-node

/**
 * TypeScript runner for Pilot Campaign Analysis
 * Executes the comprehensive analysis-only pilot phase
 */

import { PilotCampaignAnalysis } from './src/services/campaign/unintentional-any-elimination/PilotCampaignAnalysis';
import { PilotAnalysisConfig } from './src/services/campaign/unintentional-any-elimination/types';

async function runPilotAnalysis() {
  console.log('🚀 Starting Unintentional Any Elimination - Pilot Analysis Phase');
  console.log('=' .repeat(70));

  const config: PilotAnalysisConfig = {
    maxFilesToAnalyze: 500,
    sampleSizeForAccuracy: 100,
    confidenceThreshold: 0.7,
    enableTuning: true,
    generateDetailedReports: true,
    outputDirectory: '.kiro/campaign-reports/pilot-analysis'
  };

  try {
    const pilot = new PilotCampaignAnalysis(config);
    const results = await pilot.executePilotAnalysis();

    console.log('\n📊 PILOT ANALYSIS RESULTS');
    console.log('=' .repeat(50));

    if (results.success) {
      console.log('✅ Status: SUCCESS');
      console.log(`⏱️  Execution Time: ${(results.executionTime / 1000).toFixed(2)}s`);

      if (results.codebaseAnalysis) {
        console.log(`📈 Total Any Types: ${results.codebaseAnalysis.summary.totalAnyTypes}`);
        console.log(`🎯 Unintentional Count: ${results.codebaseAnalysis.summary.unintentionalCount}`);
        console.log(`📊 Top Domain: ${results.codebaseAnalysis.summary.topDomain}`);
        console.log(`📋 Top Category: ${results.codebaseAnalysis.summary.topCategory}`);
      }

      if (results.accuracyValidation) {
        console.log(`🔍 Classification Accuracy: ${results.accuracyValidation.overallAccuracy.toFixed(1)}%`);
        console.log(`📊 Average Confidence: ${(results.accuracyValidation.averageConfidence * 100).toFixed(1)}%`);
      }

      if (results.baselineMetrics) {
        console.log(`📈 Projected Success Rate: ${results.baselineMetrics.projectedSuccessRate.toFixed(1)}%`);
        console.log(`⏰ Time to Target: ${results.baselineMetrics.timeToTarget}`);
        console.log(`📦 Recommended Batch Size: ${results.baselineMetrics.recommendedBatchSize}`);
      }

      if (results.tuningResults && results.tuningResults.tuningPerformed) {
        console.log(`⚙️  Tuning Improvement: ${results.tuningResults.improvementPercentage?.toFixed(1) || 0}%`);
        console.log(`🔧 Adjustments Made: ${results.tuningResults.adjustmentsMade?.length || 0}`);
      }

      console.log('\n💡 RECOMMENDATIONS:');
      results.recommendations.forEach((rec, i) => {
        console.log(`   ${i + 1}. ${rec}`);
      });

      console.log('\n🚀 NEXT STEPS:');
      results.nextSteps.forEach((step, i) => {
        console.log(`   ${i + 1}. ${step}`);
      });

      console.log(`\n📁 Results saved to: ${config.outputDirectory}`);

    } else {
      console.log('❌ Status: FAILED');
      console.log(`💥 Error: ${results.error}`);

      console.log('\n💡 RECOMMENDATIONS:');
      results.recommendations.forEach((rec, i) => {
        console.log(`   ${i + 1}. ${rec}`);
      });
    }

    process.exit(results.success ? 0 : 1);

  } catch (error) {
    console.error('❌ Pilot analysis failed:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  runPilotAnalysis();
}
