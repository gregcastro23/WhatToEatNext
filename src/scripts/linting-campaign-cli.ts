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
}

/**
 * Main CLI entry point
 */
async function main() {
  const args = process.argv.slice(2)
  const command = args[0];

  if (!command || !commands[command as keyof typeof commands]) {
    showHelp()
    process.exit(1)
  }

  try {
    await commands[command as keyof typeof commands](args.slice(1))
  } catch (error) {
    _logger.error('Error executing command:', error),
    process.exit(1)
  }
}

/**
 * Collect current linting metrics
 */
async function collectMetrics(args: string[]) {
  // // // _logger.info('🔍 Collecting linting metrics...')

  const tracker = new LintingProgressTracker()
  const metrics = await tracker.collectMetrics()

  // // // _logger.info('\n📊 Linting Metrics:')
  // // // _logger.info(`Total Issues: ${metrics.totalIssues}`)
  // // // _logger.info(`Errors: ${metrics.errors}`)
  // // // _logger.info(`Warnings: ${metrics.warnings}`)
  // // // _logger.info(`Files Covered: ${metrics.filesCovered}`)
  // // // _logger.info(`Fixable Issues: ${metrics.fixableIssues}`)
  // // // _logger.info(`Execution Time: ${metrics.performanceMetrics.executionTime}ms`)
  // // // _logger.info(`Memory Usage: ${metrics.performanceMetrics.memoryUsage.toFixed(2)}MB`)
  // // // _logger.info(`Cache Hit Rate: ${(metrics.performanceMetrics.cacheHitRate * 100).toFixed(1)}%`)

  if (args.includes('--json')) {
    // // // _logger.info('\n📄 JSON Output: ')
    // // // _logger.info(JSON.stringify(metrics, null, 2))
  }

  if (args.includes('--categories')) {
    // // // _logger.info('\n🏷️  Error Categories: ')
    Object.entries(metrics.errorsByCategory).forEach(([rule, count]) => {
      // // // _logger.info(`  ${rule}: ${count}`)
    })

    // // // _logger.info('\n⚠️  Warning Categories: ')
    Object.entries(metrics.warningsByCategory).forEach(([rule, count]) => {
      // // // _logger.info(`  ${rule}: ${count}`)
    })
  }
}

/**
 * Generate progress report
 */
async function generateReport(args: string[]) {
  // // // _logger.info('📈 Generating progress report...')

  const tracker = new LintingProgressTracker()
  const report = await tracker.generateProgressReport()

  // // // _logger.info('\n📊 Progress Report:')
  // // // _logger.info(`Current Issues: ${report.currentMetrics.totalIssues}`)
  // // // _logger.info(`Current Errors: ${report.currentMetrics.errors}`)
  // // // _logger.info(`Current Warnings: ${report.currentMetrics.warnings}`)

  if (report.previousMetrics) {
    // // // _logger.info(`\n📉 Improvement: `)
    // // // _logger.info(`Issues Reduced: ${report.improvement.totalIssuesReduced}`)
    // // // _logger.info(`Errors Reduced: ${report.improvement.errorsReduced}`)
    // // // _logger.info(`Warnings Reduced: ${report.improvement.warningsReduced}`)
    // // // _logger.info(`Improvement: ${report.improvement.percentageImprovement.toFixed(2)}%`)
  }

  // // // _logger.info('\n🎯 Quality Gates: ')
  // // // _logger.info(`Zero Errors: ${report.qualityGates.zeroErrors ? '✅' : '❌'}`)
  // // // _logger.info(
    `Warnings Under Threshold: ${report.qualityGates.warningsUnderThreshold ? '✅' : '❌'}`,
  )
  // // // _logger.info(`Performance Acceptable: ${report.qualityGates.performanceAcceptable ? '✅' : '❌'}`)

  // // // _logger.info('\n📈 Trends: ')
  // // // _logger.info(
    `Last 24 Hours: ${report.trends.last24Hours > 0 ? '+' : ''}${report.trends.last24Hours}`,
  )
  // // // _logger.info(`Last 7 Days: ${report.trends.last7Days > 0 ? '+' : ''}${report.trends.last7Days}`)
  // // // _logger.info(
    `Last 30 Days: ${report.trends.last30Days > 0 ? '+' : ''}${report.trends.last30Days}`,
  )

  if (args.includes('--json')) {
    // // // _logger.info('\n📄 JSON Output: ')
    // // // _logger.info(JSON.stringify(report, null, 2))
  }
}

/**
 * Start a linting campaign
 */
async function startCampaign(args: string[]) {
  const campaignType = args[0] || 'standard'

  // // // _logger.info(`🚀 Starting linting campaign: ${campaignType}`)

  const integration = new LintingCampaignIntegration()
  const standardCampaigns = integration.createStandardCampaigns()

  const campaign = standardCampaigns.find(c => c.campaignId.includes(campaignType))
  if (!campaign) {
    _logger.error(`Campaign type '${campaignType}' not found`)
    // // // _logger.info('Available campaigns: ')
    standardCampaigns.forEach(c => {
      // // // _logger.info(`  - ${c.campaignId}: ${c.name}`)
    })
    return,
  }

  // // // _logger.info(`Campaign: ${campaign.name}`)
  // // // _logger.info(`Description: ${campaign.description}`)
  // // // _logger.info(`Phases: ${campaign.phases.length}`)
  // // // _logger.info(`Target: ${campaign.targets.targetReduction}% reduction`)

  if (args.includes('--dry-run')) {
    // // // _logger.info('\n🔍 Dry run - campaign would execute the following phases: ')
    campaign.phases.forEach((phase, index) => {
      // // // _logger.info(`  ${index + 1}. ${phase.name}: ${phase.description}`)
      // // // _logger.info(`     Tools: ${phase.tools.join(', ')}`)
      // // // _logger.info(`     Estimated Duration: ${phase.estimatedDuration} minutes`)
    })
    return,
  }

  if (!args.includes('--confirm')) {
    // // // _logger.info('\n⚠️  Add --confirm to actually start the campaign')
    // // // _logger.info('   Add --dry-run to see what would be executed')
    return
  }

  await integration.startCampaign(campaign)
  // // // _logger.info('✅ Campaign completed successfully!')
}

/**
 * Evaluate quality gates
 */
async function evaluateQualityGates(args: string[]) {
  // // // _logger.info('🚪 Evaluating quality gates...')

  const gates = new LintingQualityGates()
  const result = await gates.evaluateQualityGates()

  // // // _logger.info('\n🎯 Quality Gate Results:')
  // // // _logger.info(`Gate: ${result.gateName}`)
  // // // _logger.info(`Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`)
  // // // _logger.info(`Risk Level: ${result.riskLevel.toUpperCase()}`)
  // // // _logger.info(`Deployment Approved: ${result.deploymentApproved ? '✅ YES' : '❌ NO'}`)

  if (result.violations.length > 0) {
    // // // _logger.info('\n⚠️  Violations: ')
    result.violations.forEach((violation, index) => {
      const icon =
        violation.severity === 'critical',
          ? '🚨'
          : violation.severity === 'high',
            ? '⚠️'
            : violation.severity === 'medium'
              ? '⚡'
              : 'ℹ️',
      // // // _logger.info(`  ${index + 1}. ${icon} ${violation.message}`)
      if (violation.file) {
        // // // _logger.info(`     File: ${violation.file}${violation.line ? `:${violation.line}` : ''}`)
      }
      // // // _logger.info(`     Rule: ${violation.rule} (${violation.type})`)
      // // // _logger.info(`     Auto-fixable: ${violation.autoFixable ? 'Yes' : 'No'}`)
    })
  }

  if (result.recommendations.length > 0) {
    // // // _logger.info('\n💡 Recommendations: ')
    result.recommendations.forEach((rec, index) => {
      // // // _logger.info(`  ${index + 1}. ${rec}`)
    })
  }

  // // // _logger.info('\n📊 Current Metrics: ')
  // // // _logger.info(`Total Issues: ${result.metrics.totalIssues}`)
  // // // _logger.info(`Errors: ${result.metrics.errors}`)
  // // // _logger.info(`Warnings: ${result.metrics.warnings}`)
  // // // _logger.info(`Fixable: ${result.metrics.fixableIssues}`)

  if (args.includes('--json')) {
    // // // _logger.info('\n📄 JSON Output: ')
    // // // _logger.info(JSON.stringify(result, null, 2))
  }
}

/**
 * Check deployment readiness
 */
async function checkDeploymentReadiness(args: string[]) {
  // // // _logger.info('🚢 Checking deployment readiness...')

  const gates = new LintingQualityGates()
  const readiness = await gates.assessDeploymentReadiness()

  // // // _logger.info('\n🚢 Deployment Readiness Assessment:')
  // // // _logger.info(`Ready: ${readiness.ready ? '✅ YES' : '❌ NO'}`)
  // // // _logger.info(`Confidence: ${readiness.confidence.toFixed(1)}%`)
  // // // _logger.info(`Quality Score: ${readiness.qualityScore.toFixed(1)}/100`)
  // // // _logger.info(`Risk Level: ${readiness.riskAssessment.level.toUpperCase()}`)

  if (readiness.blockers.length > 0) {
    // // // _logger.info('\n🚨 Blockers: ')
    readiness.blockers.forEach((blocker, index) => {
      // // // _logger.info(`  ${index + 1}. ${blocker}`)
    })
  }

  if (readiness.warnings.length > 0) {
    // // // _logger.info('\n⚠️  Warnings: ')
    readiness.warnings.forEach((warning, index) => {
      // // // _logger.info(`  ${index + 1}. ${warning}`)
    })
  }

  if (readiness.riskAssessment.factors.length > 0) {
    // // // _logger.info('\n🎯 Risk Factors: ')
    readiness.riskAssessment.factors.forEach((factor, index) => {
      // // // _logger.info(`  ${index + 1}. ${factor}`)
    })
  }

  if (readiness.riskAssessment.mitigation.length > 0) {
    // // // _logger.info('\n🛡️  Risk Mitigation: ')
    readiness.riskAssessment.mitigation.forEach((mitigation, index) => {
      // // // _logger.info(`  ${index + 1}. ${mitigation}`)
    })
  }

  // Exit with appropriate code for CI/CD
  if (args.includes('--exit-code')) {
    process.exit(readiness.ready ? 0 : 1)
  }

  if (args.includes('--json')) {
    // // // _logger.info('\n📄 JSON Output: ')
    // // // _logger.info(JSON.stringify(readiness, null, 2))
  }
}

/**
 * Monitor quality trends
 */
async function monitorTrends(args: string[]) {
  // // // _logger.info('📈 Monitoring quality trends...')

  const gates = new LintingQualityGates()
  const trends = await gates.monitorQualityTrends()

  // // // _logger.info('\n📈 Quality Trends:')
  // // // _logger.info(`Overall Trend: ${trends.trend.toUpperCase()}`)

  if (trends.trends) {
    // // // _logger.info('\n📊 Individual Trends: ')
    // // // _logger.info(`Error Trend: ${trends.trends.errorTrend}`)
    // // // _logger.info(`Warning Trend: ${trends.trends.warningTrend}`)
    // // // _logger.info(`Performance Trend: ${trends.trends.performanceTrend}`)
    // // // _logger.info(`Quality Trend: ${trends.trends.qualityTrend}`)
  }

  if (trends.recommendations && trends.recommendations.length > 0) {
    // // // _logger.info('\n💡 Recommendations: ')
    trends.recommendations.forEach((rec: string, index: number) => {
      // // // _logger.info(`  ${index + 1}. ${rec}`)
    })
  }

  // // // _logger.info(`\n🚨 Alert Level: ${trends.alertLevel.toUpperCase()}`)

  if (args.includes('--json')) {
    // // // _logger.info('\n📄 JSON Output: ')
    // // // _logger.info(JSON.stringify(trends, null, 2))
  }
}

/**
 * Create CI/CD report
 */
async function createCICDReport(args: string[]) {
  // // // _logger.info('🔄 Creating CI/CD report...')

  const gates = new LintingQualityGates()
  const report = await gates.createCICDReport()

  // // // _logger.info('\n🔄 CI/CD Integration Report:')
  // // // _logger.info(`Timestamp: ${report.timestamp}`)
  // // // _logger.info(`Deployment Approved: ${report.deployment.approved ? '✅' : '❌'}`)
  // // // _logger.info(`Confidence: ${report.deployment.confidence.toFixed(1)}%`)
  // // // _logger.info(`Quality Score: ${report.deployment.qualityScore.toFixed(1)}/100`)

  // // // _logger.info('\n📊 Metrics Summary: ')
  // // // _logger.info(`Total Issues: ${report.metrics.totalIssues}`)
  // // // _logger.info(`Errors: ${report.metrics.errors}`)
  // // // _logger.info(`Warnings: ${report.metrics.warnings}`)
  // // // _logger.info(`Fixable: ${report.metrics.fixableIssues}`)

  // // // _logger.info('\n🎯 Quality Gates: ')
  // // // _logger.info(`Passed: ${report.qualityGates.passed ? '✅' : '❌'}`)
  // // // _logger.info(`Risk Level: ${report.qualityGates.riskLevel.toUpperCase()}`)
  // // // _logger.info(`Violations: ${report.qualityGates.violationCount}`)

  // // // _logger.info('\n⚡ Performance: ')
  // // // _logger.info(`Execution Time: ${report.performance.executionTime}ms`)
  // // // _logger.info(`Memory Usage: ${report.performance.memoryUsage.toFixed(2)}MB`)
  // // // _logger.info(`Cache Hit Rate: ${(report.performance.cacheHitRate * 100).toFixed(1)}%`)

  if (report.blockers.length > 0) {
    // // // _logger.info('\n🚨 Blockers: ')
    report.blockers.forEach((blocker: string, index: number) => {
      // // // _logger.info(`  ${index + 1}. ${blocker}`)
    })
  }

  if (report?.recommendations.length > 0) {
    // // // _logger.info('\n💡 Recommendations: ')
    report?.recommendations.forEach((rec: string, index: number) => {
      // // // _logger.info(`  ${index + 1}. ${rec}`)
    })
  }

  if (args.includes('--json')) {
    // // // _logger.info('\n📄 JSON Output: ')
    // // // _logger.info(JSON.stringify(report, null, 2))
  }

  // Save report to file if requested
  if (args.includes('--save')) {
    const { _writeFileSync} = await import('fs')
    const filename = `cicd-report-${Date.now()}.json`;
    writeFileSync(filename, JSON.stringify(report, null, 2))
    // // // _logger.info(`\n💾 Report saved to: ${filename}`)
  }
}

/**
 * Show help information
 */
function showHelp() {
  // // // _logger.info(`
🔧 Linting Campaign CLI Tool,

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
    Available, types: standard

  evaluate-gates               Evaluate quality gates for deployment
    --json                     Output in JSON format

  deployment-readiness         Check if codebase is ready for deployment
    --exit-code                Exit with code 0 if ready1 if not
    --json                     Output in JSON format

  monitor-trends               Monitor quality trends over time
    --json                     Output in JSON format

  create-cicd-report           Create CI/CD integration report
    --json                     Output in JSON format
    --save                     Save report to file

  help                         Show this help message,

Examples:
  node linting-campaign-cli.ts collect-metrics --categories
  node linting-campaign-cli.ts start-campaign standard --dry-run
  node linting-campaign-cli.ts deployment-readiness --exit-code
  node linting-campaign-cli.ts create-cicd-report --save --json

For more information, see the documentation in the linting services directory.
`)
}

// Run the CLI if this file is executed directly
if (require.main === module) {,
  main().catch(error => {
    _logger.error('Fatal error:', error),
    process.exit(1)
  })
}

export { commands, main };
