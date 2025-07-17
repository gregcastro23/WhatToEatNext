#!/usr/bin/env node

/**
 * CLI script to check TypeScript campaign trigger conditions
 * Usage: node scripts/check-typescript-campaign.js [--analyze]
 */

const path = require('path');

// Add the src directory to the module path
require('module').globalPaths.push(path.join(__dirname, '..', 'src'));

async function runCampaignCheck() {
  try {
    const args = process.argv.slice(2);
    const shouldAnalyze = args.includes('--analyze');
    
    console.log('🔍 Checking TypeScript Campaign Trigger Conditions...\n');
    
    // Import the campaign trigger functions
    const { 
      checkCampaignTriggerConditions, 
      getCurrentTypeScriptErrorCount,
      analyzeTypeScriptErrors 
    } = require('../src/utils/typescriptCampaignTrigger.ts');
    
    // Get current error count
    const errorCount = await getCurrentTypeScriptErrorCount();
    
    if (errorCount === -1) {
      console.log('❌ Failed to get TypeScript error count');
      process.exit(1);
    }
    
    console.log(`📊 Current TypeScript Error Count: ${errorCount}`);
    
    // Check trigger conditions
    const shouldTrigger = await checkCampaignTriggerConditions();
    
    console.log(`🎯 Campaign Trigger Required: ${shouldTrigger ? 'YES' : 'NO'}`);
    
    // Provide threshold context
    console.log('\n📋 Threshold Information:');
    console.log('- Emergency (≥500 errors): Immediate action required');
    console.log('- Aggressive (≥200 errors): High priority campaign');
    console.log('- Standard (≥100 errors): Standard campaign');
    console.log('- Monitoring (<100 errors): Continue monitoring');
    
    if (shouldAnalyze || shouldTrigger) {
      console.log('\n🔬 Running Detailed Analysis...');
      
      const analysis = await analyzeTypeScriptErrors();
      
      console.log('\n📈 Analysis Results:');
      console.log('='.repeat(50));
      console.log(`Campaign Mode: ${analysis.campaignMode}`);
      console.log(`Safety Level: ${analysis.safetyLevel}`);
      console.log(`Estimated Duration: ${analysis.estimatedDuration} minutes`);
      console.log(`Batches Scheduled: ${analysis.batchSchedule.batches.length}`);
      
      if (Object.keys(analysis.errorAnalysis.errorsByCategory).length > 0) {
        console.log('\n📊 Error Breakdown by Category:');
        for (const [category, errors] of Object.entries(analysis.errorAnalysis.errorsByCategory)) {
          console.log(`- ${category}: ${errors.length} errors`);
        }
      }
      
      if (analysis.errorAnalysis.highImpactFiles.length > 0) {
        console.log('\n🎯 High-Impact Files (≥5 errors):');
        analysis.errorAnalysis.highImpactFiles.slice(0, 5).forEach((file, index) => {
          console.log(`${index + 1}. ${file.filePath} (${file.errorCount} errors)`);
        });
        
        if (analysis.errorAnalysis.highImpactFiles.length > 5) {
          console.log(`... and ${analysis.errorAnalysis.highImpactFiles.length - 5} more files`);
        }
      }
      
      if (analysis.recommendations.length > 0) {
        console.log('\n💡 Fix Recommendations:');
        analysis.recommendations.slice(0, 3).forEach((rec, index) => {
          console.log(`${index + 1}. ${rec.category}: ${rec.errorCount} errors`);
          console.log(`   Strategy: ${rec.fixStrategy}`);
          console.log(`   Estimated Effort: ${rec.estimatedEffort} minutes`);
          console.log(`   Success Rate: ${(rec.successRate * 100).toFixed(1)}%`);
        });
      }
      
      if (analysis.batchSchedule.safetyProtocols.length > 0) {
        console.log('\n🛡️  Safety Protocols:');
        analysis.batchSchedule.safetyProtocols.forEach((protocol, index) => {
          console.log(`${index + 1}. ${protocol.name}`);
          console.log(`   Description: ${protocol.description}`);
        });
      }
    }
    
    console.log('\n' + '='.repeat(50));
    
    if (shouldTrigger) {
      console.log('⚠️  CAMPAIGN TRIGGER RECOMMENDED');
      console.log('Consider running the campaign system to reduce TypeScript errors.');
      console.log('Use manual approval mode for safety.');
      process.exit(2); // Exit code 2 indicates campaign needed
    } else {
      console.log('✅ No campaign trigger needed at this time');
      console.log('Continue monitoring TypeScript error levels.');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('💥 Campaign check failed:', error.message);
    process.exit(1);
  }
}

// Show usage if help requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('TypeScript Campaign Trigger Checker');
  console.log('');
  console.log('Usage: node scripts/check-typescript-campaign.js [options]');
  console.log('');
  console.log('Options:');
  console.log('  --analyze    Run detailed error analysis');
  console.log('  --help, -h   Show this help message');
  console.log('');
  console.log('Exit Codes:');
  console.log('  0  No campaign needed');
  console.log('  1  Error occurred');
  console.log('  2  Campaign trigger recommended');
  process.exit(0);
}

// Run the campaign check
runCampaignCheck();