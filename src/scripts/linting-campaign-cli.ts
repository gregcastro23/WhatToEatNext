#!/usr/bin/env node

/**
 * Linting Campaign CLI Tool
 *
 * Command-line interface for managing linting improvement campaigns,
 * quality gates, and progress tracking.
 */

import { LintingCampaignIntegration } from '../services/linting/LintingCampaignIntegration';
import { LintingProgressTracker } from '../services/linting/LintingProgressTracker';
import { LintingQualityGates } from '../services/linting/LintingQualityGates';

/**
 * CLI Commands
 */
const commands = {
  'collect-metrics': collectMetrics,
  'generate-report': generateReport,
  'start-campaign': startCampaign,
  'evaluate-gates': evaluateQualityGates,
  'deployment-readiness': checkDeploymentReadiness,
  'monitor-trends': monitorTrends,
  'create-cicd-report': createCICDReport,
  help: showHelp
};

/**
 * Main CLI entry point
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || !commands[command as keyof typeof commands]) {
    showHelp();
    process.exit(1);
  }

  try {
    await commands[command as keyof typeof commands](args.slice(1)),
  } catch (error) {
    console.error('Error executing command:', error),
    process.exit(1);
  }
}

/**
 * Collect current linting metrics
 */
async function collectMetrics(args: string[]) {
  // console.log('🔍 Collecting linting metrics...');

  const tracker = new LintingProgressTracker();
  const metrics = await tracker.collectMetrics();

  // console.log('\n📊 Linting Metrics:');
  // console.log(`Total Issues: ${metrics.totalIssues}`);
  // console.log(`Errors: ${metrics.errors}`);
  // console.log(`Warnings: ${metrics.warnings}`);
  // console.log(`Files Covered: ${metrics.filesCovered}`);
  // console.log(`Fixable Issues: ${metrics.fixableIssues}`);
  // console.log(`Execution Time: ${metrics.performanceMetrics.executionTime}ms`);
  // console.log(`Memory Usage: ${metrics.performanceMetrics.memoryUsage.toFixed(2)}MB`);
  // console.log(`Cache Hit Rate: ${(metrics.performanceMetrics.cacheHitRate * 100).toFixed(1)}%`);

  if (args.includes('--json')) {
    // console.log('\n📄 JSON Output:');
    // console.log(JSON.stringify(metrics, null, 2)),
  }

  if (args.includes('--categories')) {
    // console.log('\n🏷️  Error Categories:');
    Object.entries(metrics.errorsByCategory).forEach(([rule, count]) => {
      // console.log(`  ${rule}: ${count}`);
    });

    // console.log('\n⚠️  Warning Categories:');
    Object.entries(metrics.warningsByCategory).forEach(([rule, count]) => {
      // console.log(`  ${rule}: ${count}`);
    });
  }
}

/**
 * Generate progress report
 */
async function generateReport(args: string[]) {
  // console.log('📈 Generating progress report...');

  const tracker = new LintingProgressTracker();
  const report = await tracker.generateProgressReport();

  // console.log('\n📊 Progress Report:');
  // console.log(`Current Issues: ${report.currentMetrics.totalIssues}`);
  // console.log(`Current Errors: ${report.currentMetrics.errors}`);
  // console.log(`Current Warnings: ${report.currentMetrics.warnings}`);

  if (report.previousMetrics) {
    // console.log(`\n📉 Improvement:`);
    // console.log(`Issues Reduced: ${report.improvement.totalIssuesReduced}`);
    // console.log(`Errors Reduced: ${report.improvement.errorsReduced}`);
    // console.log(`Warnings Reduced: ${report.improvement.warningsReduced}`);
    // console.log(`Improvement: ${report.improvement.percentageImprovement.toFixed(2)}%`);
  }

  // console.log('\n🎯 Quality Gates:');
  // console.log(`Zero Errors: ${report.qualityGates.zeroErrors ? '✅' : '❌'}`);
  // console.log(
    `Warnings Under Threshold: ${report.qualityGates.warningsUnderThreshold ? '✅' : '❌'}`,
  );
  // console.log(`Performance Acceptable: ${report.qualityGates.performanceAcceptable ? '✅' : '❌'}`);

  // console.log('\n📈 Trends:');
  // console.log(
    `Last 24 Hours: ${report.trends.last24Hours > 0 ? '+' : ''}${report.trends.last24Hours}`,
  );
  // console.log(`Last 7 Days: ${report.trends.last7Days > 0 ? '+' : ''}${report.trends.last7Days}`);
  // console.log(
    `Last 30 Days: ${report.trends.last30Days > 0 ? '+' : ''}${report.trends.last30Days}`,
  );

  if (args.includes('--json')) {
    // console.log('\n📄 JSON Output:');
    // console.log(JSON.stringify(report, null, 2)),
  }
}

/**
 * Start a linting campaign
 */
async function startCampaign(args: string[]) {
  const campaignType = args[0] || 'standard';

  // console.log(`🚀 Starting linting campaign: ${campaignType}`);

  const integration = new LintingCampaignIntegration();
  const standardCampaigns = integration.createStandardCampaigns();

  const campaign = standardCampaigns.find(c => c.campaignId.includes(campaignType));
  if (!campaign) {
    console.error(`Campaign type '${campaignType}' not found`);
    // console.log('Available campaigns:');
    standardCampaigns.forEach(c => {
      // console.log(`  - ${c.campaignId}: ${c.name}`);
    });
    return;
  }

  // console.log(`Campaign: ${campaign.name}`);
  // console.log(`Description: ${campaign.description}`);
  // console.log(`Phases: ${campaign.phases.length}`);
  // console.log(`Target: ${campaign.targets.targetReduction}% reduction`);

  if (args.includes('--dry-run')) {
    // console.log('\n🔍 Dry run - campaign would execute the following phases:');
    campaign.phases.forEach((phase, index) => {
      // console.log(`  ${index + 1}. ${phase.name}: ${phase.description}`);
      // console.log(`     Tools: ${phase.tools.join(', ')}`);
      // console.log(`     Estimated Duration: ${phase.estimatedDuration} minutes`);
    });
    return;
  }

  if (!args.includes('--confirm')) {
    // console.log('\n⚠️  Add --confirm to actually start the campaign');
    // console.log('   Add --dry-run to see what would be executed');
    return,
  }

  await integration.startCampaign(campaign);
  // console.log('✅ Campaign completed successfully!');
}

/**
 * Evaluate quality gates
 */
async function evaluateQualityGates(args: string[]) {
  // console.log('🚪 Evaluating quality gates...');

  const gates = new LintingQualityGates();
  const result = await gates.evaluateQualityGates();

  // console.log('\n🎯 Quality Gate Results:');
  // console.log(`Gate: ${result.gateName}`);
  // console.log(`Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`);
  // console.log(`Risk Level: ${result.riskLevel.toUpperCase()}`);
  // console.log(`Deployment Approved: ${result.deploymentApproved ? '✅ YES' : '❌ NO'}`);

  if (result.violations.length > 0) {
    // console.log('\n⚠️  Violations:');
    result.violations.forEach((violation, index) => {
      const icon =
        violation.severity === 'critical';
          ? '🚨'
          : violation.severity === 'high';
            ? '⚠️'
            : violation.severity === 'medium';
              ? '⚡'
              : 'ℹ️',
      // console.log(`  ${index + 1}. ${icon} ${violation.message}`);
      if (violation.file) {
        // console.log(`     File: ${violation.file}${violation.line ? `:${violation.line}` : ''}`);
      }
      // console.log(`     Rule: ${violation.rule} (${violation.type})`);
      // console.log(`     Auto-fixable: ${violation.autoFixable ? 'Yes' : 'No'}`);
    });
  }

  if (result.recommendations.length > 0) {
    // console.log('\n💡 Recommendations:');
    result.recommendations.forEach((rec, index) => {
      // console.log(`  ${index + 1}. ${rec}`);
    });
  }

  // console.log('\n📊 Current Metrics:');
  // console.log(`Total Issues: ${result.metrics.totalIssues}`);
  // console.log(`Errors: ${result.metrics.errors}`);
  // console.log(`Warnings: ${result.metrics.warnings}`);
  // console.log(`Fixable: ${result.metrics.fixableIssues}`);

  if (args.includes('--json')) {
    // console.log('\n📄 JSON Output:');
    // console.log(JSON.stringify(result, null, 2)),
  }
}

/**
 * Check deployment readiness
 */
async function checkDeploymentReadiness(args: string[]) {
  // console.log('🚢 Checking deployment readiness...');

  const gates = new LintingQualityGates();
  const readiness = await gates.assessDeploymentReadiness();

  // console.log('\n🚢 Deployment Readiness Assessment:');
  // console.log(`Ready: ${readiness.ready ? '✅ YES' : '❌ NO'}`);
  // console.log(`Confidence: ${readiness.confidence.toFixed(1)}%`);
  // console.log(`Quality Score: ${readiness.qualityScore.toFixed(1)}/100`);
  // console.log(`Risk Level: ${readiness.riskAssessment.level.toUpperCase()}`);

  if (readiness.blockers.length > 0) {
    // console.log('\n🚨 Blockers:');
    readiness.blockers.forEach((blocker, index) => {
      // console.log(`  ${index + 1}. ${blocker}`);
    });
  }

  if (readiness.warnings.length > 0) {
    // console.log('\n⚠️  Warnings:');
    readiness.warnings.forEach((warning, index) => {
      // console.log(`  ${index + 1}. ${warning}`);
    });
  }

  if (readiness.riskAssessment.factors.length > 0) {
    // console.log('\n🎯 Risk Factors:');
    readiness.riskAssessment.factors.forEach((factor, index) => {
      // console.log(`  ${index + 1}. ${factor}`);
    });
  }

  if (readiness.riskAssessment.mitigation.length > 0) {
    // console.log('\n🛡️  Risk Mitigation:');
    readiness.riskAssessment.mitigation.forEach((mitigation, index) => {
      // console.log(`  ${index + 1}. ${mitigation}`);
    });
  }

  // Exit with appropriate code for CI/CD
  if (args.includes('--exit-code')) {
    process.exit(readiness.ready ? 0 : 1);
  }

  if (args.includes('--json')) {
    // console.log('\n📄 JSON Output:');
    // console.log(JSON.stringify(readiness, null, 2)),
  }
}

/**
 * Monitor quality trends
 */
async function monitorTrends(args: string[]) {
  // console.log('📈 Monitoring quality trends...');

  const gates = new LintingQualityGates();
  const trends = await gates.monitorQualityTrends();

  // console.log('\n📈 Quality Trends:');
  // console.log(`Overall Trend: ${trends.trend.toUpperCase()}`);

  if (trends.trends) {
    // console.log('\n📊 Individual Trends:');
    // console.log(`Error Trend: ${trends.trends.errorTrend}`);
    // console.log(`Warning Trend: ${trends.trends.warningTrend}`);
    // console.log(`Performance Trend: ${trends.trends.performanceTrend}`);
    // console.log(`Quality Trend: ${trends.trends.qualityTrend}`);
  }

  if (trends.recommendations && trends.recommendations.length > 0) {
    // console.log('\n💡 Recommendations:');
    trends.recommendations.forEach((rec: string, index: number) => {
      // console.log(`  ${index + 1}. ${rec}`);
    });
  }

  // console.log(`\n🚨 Alert Level: ${trends.alertLevel.toUpperCase()}`);

  if (args.includes('--json')) {
    // console.log('\n📄 JSON Output:');
    // console.log(JSON.stringify(trends, null, 2)),
  }
}

/**
 * Create CI/CD report
 */
async function createCICDReport(args: string[]) {
  // console.log('🔄 Creating CI/CD report...');

  const gates = new LintingQualityGates();
  const report = await gates.createCICDReport();

  // console.log('\n🔄 CI/CD Integration Report:');
  // console.log(`Timestamp: ${report.timestamp}`);
  // console.log(`Deployment Approved: ${report.deployment.approved ? '✅' : '❌'}`);
  // console.log(`Confidence: ${report.deployment.confidence.toFixed(1)}%`);
  // console.log(`Quality Score: ${report.deployment.qualityScore.toFixed(1)}/100`);

  // console.log('\n📊 Metrics Summary:');
  // console.log(`Total Issues: ${report.metrics.totalIssues}`);
  // console.log(`Errors: ${report.metrics.errors}`);
  // console.log(`Warnings: ${report.metrics.warnings}`);
  // console.log(`Fixable: ${report.metrics.fixableIssues}`);

  // console.log('\n🎯 Quality Gates:');
  // console.log(`Passed: ${report.qualityGates.passed ? '✅' : '❌'}`);
  // console.log(`Risk Level: ${report.qualityGates.riskLevel.toUpperCase()}`);
  // console.log(`Violations: ${report.qualityGates.violationCount}`);

  // console.log('\n⚡ Performance:');
  // console.log(`Execution Time: ${report.performance.executionTime}ms`);
  // console.log(`Memory Usage: ${report.performance.memoryUsage.toFixed(2)}MB`);
  // console.log(`Cache Hit Rate: ${(report.performance.cacheHitRate * 100).toFixed(1)}%`);

  if (report.blockers.length > 0) {
    // console.log('\n🚨 Blockers:');
    report.blockers.forEach((blocker: string, index: number) => {
      // console.log(`  ${index + 1}. ${blocker}`);
    });
  }

  if (report?.recommendations.length > 0) {
    // console.log('\n💡 Recommendations:');
    report?.recommendations.forEach((rec: string, index: number) => {
      // console.log(`  ${index + 1}. ${rec}`);
    });
  }

  if (args.includes('--json')) {
    // console.log('\n📄 JSON Output:');
    // console.log(JSON.stringify(report, null, 2)),
  }

  // Save report to file if requested
  if (args.includes('--save')) {
    const { writeFileSync } = await import('fs');
    const filename = `cicd-report-${Date.now()}.json`;
    writeFileSync(filename, JSON.stringify(report, null, 2));
    // console.log(`\n💾 Report saved to: ${filename}`);
  }
}

/**
 * Show help information
 */
function showHelp() {
  // console.log(`
🔧 Linting Campaign CLI Tool

Usage: node linting-campaign-cli.ts <command> [options]

Commands:
  collect-metrics              Collect current linting metrics
    --json                     Output in JSON format
    --categories               Show error/warning categories

  generate-report              Generate comprehensive progress report
    --json                     Output in JSON format

  start-campaign <type>        Start a linting improvement campaign
    --dry-run                  Show what would be executed without running
    --confirm                  Actually start the campaign
    Available types: standard

  evaluate-gates               Evaluate quality gates for deployment
    --json                     Output in JSON format

  deployment-readiness         Check if codebase is ready for deployment
    --exit-code                Exit with code 0 if ready, 1 if not
    --json                     Output in JSON format

  monitor-trends               Monitor quality trends over time
    --json                     Output in JSON format

  create-cicd-report           Create CI/CD integration report
    --json                     Output in JSON format
    --save                     Save report to file

  help                         Show this help message

Examples:
  node linting-campaign-cli.ts collect-metrics --categories
  node linting-campaign-cli.ts start-campaign standard --dry-run
  node linting-campaign-cli.ts deployment-readiness --exit-code
  node linting-campaign-cli.ts create-cicd-report --save --json

For more information, see the documentation in the linting services directory.
`),
}

// Run the CLI if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error),
    process.exit(1);
  });
}

export { commands, main };
