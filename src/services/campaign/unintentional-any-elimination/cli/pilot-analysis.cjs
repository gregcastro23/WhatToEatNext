#!/usr/bin/env node

/**
 * Pilot Campaign Analysis CLI
 * Command-line interface for executing the analysis-only pilot phase
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const DEFAULT_CONFIG = {
  maxFilesToAnalyze: 500,
  sampleSizeForAccuracy: 100,
  confidenceThreshold: 0.7,
  enableTuning: true,
  generateDetailedReports: true,
  outputDirectory: '.kiro/campaign-reports/pilot-analysis'
};

/**
 * Execute pilot analysis using TypeScript compilation
 */
async function executePilotAnalysis(config = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  console.log('🚀 Starting Unintentional Any Elimination - Pilot Analysis Phase');
  console.log('=' .repeat(70));

  try {
    // Ensure TypeScript compilation works
    console.log('📋 Checking TypeScript compilation...');
    const tsCheck = execSync('yarn tsc --noEmit --skipLibCheck', {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log('✅ TypeScript compilation check passed');

    // Compile and run the pilot analysis
    console.log('🔧 Compiling pilot analysis system...');

    // Create a temporary runner script
    const runnerScript = `
const { PilotCampaignAnalysis } = require('./src/services/campaign/unintentional-any-elimination/PilotCampaignAnalysis.ts');

async function runPilotAnalysis() {
  try {
    const pilot = new PilotCampaignAnalysis(${JSON.stringify(finalConfig)});
    const results = await pilot.executePilotAnalysis();

    console.log('\\n📊 PILOT ANALYSIS RESULTS');
    console.log('=' .repeat(50));

    if (results.success) {
      console.log('✅ Status: SUCCESS');
      console.log(\`⏱️  Execution Time: \${(results.executionTime / 1000).toFixed(2)}s\`);

      if (results.codebaseAnalysis) {
        console.log(\`📈 Total Any Types: \${results.codebaseAnalysis.summary.totalAnyTypes}\`);
        console.log(\`🎯 Unintentional Count: \${results.codebaseAnalysis.summary.unintentionalCount}\`);
        console.log(\`📊 Top Domain: \${results.codebaseAnalysis.summary.topDomain}\`);
        console.log(\`📋 Top Category: \${results.codebaseAnalysis.summary.topCategory}\`);
      }

      if (results.accuracyValidation) {
        console.log(\`🔍 Classification Accuracy: \${results.accuracyValidation.overallAccuracy.toFixed(1)}%\`);
        console.log(\`📊 Average Confidence: \${(results.accuracyValidation.averageConfidence * 100).toFixed(1)}%\`);
      }

      if (results.baselineMetrics) {
        console.log(\`📈 Projected Success Rate: \${results.baselineMetrics.projectedSuccessRate.toFixed(1)}%\`);
        console.log(\`⏰ Time to Target: \${results.baselineMetrics.timeToTarget}\`);
        console.log(\`📦 Recommended Batch Size: \${results.baselineMetrics.recommendedBatchSize}\`);
      }

      if (results.tuningResults && results.tuningResults.tuningPerformed) {
        console.log(\`⚙️  Tuning Improvement: \${results.tuningResults.improvementPercentage?.toFixed(1) || 0}%\`);
        console.log(\`🔧 Adjustments Made: \${results.tuningResults.adjustmentsMade?.length || 0}\`);
      }

      console.log('\\n💡 RECOMMENDATIONS:');
      results.recommendations.forEach((rec, i) => {
        console.log(\`   \${i + 1}. \${rec}\`);
      });

      console.log('\\n🚀 NEXT STEPS:');
      results.nextSteps.forEach((step, i) => {
        console.log(\`   \${i + 1}. \${step}\`);
      });

      console.log(\`\\n📁 Results saved to: \${finalConfig.outputDirectory}\`);

    } else {
      console.log('❌ Status: FAILED');
      console.log(\`💥 Error: \${results.error}\`);

      console.log('\\n💡 RECOMMENDATIONS:');
      results.recommendations.forEach((rec, i) => {
        console.log(\`   \${i + 1}. \${rec}\`);
      });
    }

    process.exit(results.success ? 0 : 1);

  } catch (error) {
    console.error('❌ Pilot analysis failed:', error);
    process.exit(1);
  }
}

runPilotAnalysis();
`;

    // Write and execute the runner
    const runnerPath = path.join(process.cwd(), 'temp-pilot-runner.js');
    fs.writeFileSync(runnerPath, runnerScript);

    try {
      // Use yarn with ts-node to run TypeScript directly
      console.log('🚀 Executing pilot analysis...');
      execSync(`yarn ts-node -e "${runnerScript.replace(/"/g, '\\"')}"`, {
        stdio: 'inherit',
        cwd: process.cwd()
      });
    } catch (error) {
      console.error('❌ Failed to execute pilot analysis:', error.message);

      // Fallback: Try to run a simplified analysis
      console.log('🔄 Attempting fallback analysis...');
      await runFallbackAnalysis(finalConfig);
    } finally {
      // Clean up
      if (fs.existsSync(runnerPath)) {
        fs.unlinkSync(runnerPath);
      }
    }

  } catch (error) {
    console.error('❌ Pilot analysis setup failed:', error.message);

    // Run fallback analysis
    console.log('🔄 Running fallback analysis...');
    await runFallbackAnalysis(finalConfig);
  }
}

/**
 * Fallback analysis using shell commands
 */
async function runFallbackAnalysis(config) {
  console.log('📊 Running fallback codebase analysis...');

  try {
    // Count TypeScript errors
    let tsErrors = 0;
    try {
      const tsOutput = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS" || echo "0"', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      tsErrors = parseInt(tsOutput.trim()) || 0;
    } catch (e) {
      console.warn('Could not count TypeScript errors');
    }

    // Count any types
    let anyTypeCount = 0;
    try {
      const anyOutput = execSync('grep -r "\\bany\\b" src --include="*.ts" --include="*.tsx" | wc -l', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      anyTypeCount = parseInt(anyOutput.trim()) || 0;
    } catch (e) {
      console.warn('Could not count any types');
    }

    // Count files
    let fileCount = 0;
    try {
      const fileOutput = execSync('find src -name "*.ts" -o -name "*.tsx" | wc -l', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      fileCount = parseInt(fileOutput.trim()) || 0;
    } catch (e) {
      console.warn('Could not count TypeScript files');
    }

    // Generate basic analysis
    const analysisResults = {
      timestamp: new Date().toISOString(),
      currentTypeScriptErrors: tsErrors,
      totalAnyTypes: anyTypeCount,
      totalTypeScriptFiles: fileCount,
      estimatedUnintentionalAnyTypes: Math.floor(anyTypeCount * 0.7), // Estimate 70% unintentional
      analysisScope: Math.min(fileCount, config.maxFilesToAnalyze),
      coveragePercentage: fileCount > 0 ? Math.min(100, (config.maxFilesToAnalyze / fileCount) * 100) : 0
    };

    // Ensure output directory exists
    if (!fs.existsSync(config.outputDirectory)) {
      fs.mkdirSync(config.outputDirectory, { recursive: true });
    }

    // Save fallback results
    const fallbackResultsPath = path.join(config.outputDirectory, 'fallback-analysis-results.json');
    fs.writeFileSync(fallbackResultsPath, JSON.stringify(analysisResults, null, 2));

    // Generate summary report
    const summaryReport = `# Fallback Pilot Analysis Results

## Basic Metrics
- **Analysis Date**: ${analysisResults.timestamp}
- **Current TypeScript Errors**: ${analysisResults.currentTypeScriptErrors}
- **Total Any Types Found**: ${analysisResults.totalAnyTypes}
- **Total TypeScript Files**: ${analysisResults.totalTypeScriptFiles}
- **Estimated Unintentional Any Types**: ${analysisResults.estimatedUnintentionalAnyTypes}

## Analysis Scope
- **Files in Scope**: ${analysisResults.analysisScope}
- **Coverage**: ${analysisResults.coveragePercentage.toFixed(1)}%

## Recommendations
- Complete TypeScript compilation setup for full analysis
- Review the ${analysisResults.estimatedUnintentionalAnyTypes} estimated unintentional any types
- Focus on high-impact files first
- Consider manual review for complex cases

## Next Steps
1. Fix TypeScript compilation issues if any
2. Run full pilot analysis with proper TypeScript setup
3. Review and categorize any types by domain
4. Prepare for conservative replacement pilot

---
*Fallback analysis generated on ${new Date().toISOString()}*
`;

    const summaryPath = path.join(config.outputDirectory, 'fallback-summary.md');
    fs.writeFileSync(summaryPath, summaryReport);

    console.log('✅ Fallback analysis completed');
    console.log('📊 FALLBACK ANALYSIS RESULTS');
    console.log('=' .repeat(50));
    console.log(`📈 Total Any Types: ${analysisResults.totalAnyTypes}`);
    console.log(`🎯 Estimated Unintentional: ${analysisResults.estimatedUnintentionalAnyTypes}`);
    console.log(`📁 TypeScript Files: ${analysisResults.totalTypeScriptFiles}`);
    console.log(`⚠️  TypeScript Errors: ${analysisResults.currentTypeScriptErrors}`);
    console.log(`📊 Analysis Coverage: ${analysisResults.coveragePercentage.toFixed(1)}%`);
    console.log(`📁 Results saved to: ${config.outputDirectory}`);

    console.log('\n💡 RECOMMENDATIONS:');
    console.log('   1. Fix TypeScript compilation for full analysis capabilities');
    console.log('   2. Review estimated unintentional any types manually');
    console.log('   3. Focus on high-impact files and domains first');
    console.log('   4. Prepare safety protocols before replacement attempts');

  } catch (error) {
    console.error('❌ Fallback analysis failed:', error.message);
    process.exit(1);
  }
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const config = { ...DEFAULT_CONFIG };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--max-files':
        config.maxFilesToAnalyze = parseInt(args[++i]) || DEFAULT_CONFIG.maxFilesToAnalyze;
        break;
      case '--sample-size':
        config.sampleSizeForAccuracy = parseInt(args[++i]) || DEFAULT_CONFIG.sampleSizeForAccuracy;
        break;
      case '--confidence':
        config.confidenceThreshold = parseFloat(args[++i]) || DEFAULT_CONFIG.confidenceThreshold;
        break;
      case '--no-tuning':
        config.enableTuning = false;
        break;
      case '--no-detailed-reports':
        config.generateDetailedReports = false;
        break;
      case '--output':
        config.outputDirectory = args[++i] || DEFAULT_CONFIG.outputDirectory;
        break;
      case '--help':
        console.log(`
Unintentional Any Elimination - Pilot Analysis

Usage: node pilot-analysis.cjs [options]

Options:
  --max-files <number>      Maximum files to analyze (default: ${DEFAULT_CONFIG.maxFilesToAnalyze})
  --sample-size <number>    Sample size for accuracy testing (default: ${DEFAULT_CONFIG.sampleSizeForAccuracy})
  --confidence <number>     Confidence threshold (default: ${DEFAULT_CONFIG.confidenceThreshold})
  --no-tuning              Disable algorithm tuning
  --no-detailed-reports    Disable detailed report generation
  --output <directory>     Output directory (default: ${DEFAULT_CONFIG.outputDirectory})
  --help                   Show this help message

Examples:
  node pilot-analysis.cjs
  node pilot-analysis.cjs --max-files 200 --sample-size 50
  node pilot-analysis.cjs --no-tuning --output ./analysis-results
`);
        process.exit(0);
    }
  }

  return config;
}

// Main execution
if (require.main === module) {
  const config = parseArgs();
  executePilotAnalysis(config).catch(error => {
    console.error('❌ Pilot analysis failed:', error);
    process.exit(1);
  });
}

module.exports = { executePilotAnalysis, runFallbackAnalysis };
