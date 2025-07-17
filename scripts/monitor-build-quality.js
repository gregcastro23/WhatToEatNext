#!/usr/bin/env node

/**
 * CLI script to monitor build quality and performance
 * Usage: node scripts/monitor-build-quality.js [--detailed]
 */

const path = require('path');

// Add the src directory to the module path
require('module').globalPaths.push(path.join(__dirname, '..', 'src'));

async function runBuildQualityMonitoring() {
  try {
    const args = process.argv.slice(2);
    const showDetailed = args.includes('--detailed');
    
    console.log('🔧 Starting Build Quality Monitoring...\n');
    
    // Import the build quality monitor functions
    const { getBuildQualityScore } = require('../src/utils/buildQualityMonitor.ts');
    
    // Get build quality score
    const qualityScore = await getBuildQualityScore();
    
    console.log('📊 Build Quality Results:');
    console.log('='.repeat(50));
    console.log(`Overall Quality Score: ${qualityScore}/100`);
    
    // Provide quality assessment
    let assessment = '';
    let emoji = '';
    
    if (qualityScore >= 90) {
      assessment = 'Excellent';
      emoji = '🟢';
    } else if (qualityScore >= 75) {
      assessment = 'Good';
      emoji = '🟡';
    } else if (qualityScore >= 60) {
      assessment = 'Fair';
      emoji = '🟠';
    } else {
      assessment = 'Needs Improvement';
      emoji = '🔴';
    }
    
    console.log(`Quality Assessment: ${emoji} ${assessment}`);
    
    // Provide recommendations based on score
    console.log('\n💡 Recommendations:');
    if (qualityScore < 90) {
      console.log('- Review and fix TypeScript errors');
      console.log('- Optimize build performance');
      console.log('- Improve code quality metrics');
    }
    
    if (qualityScore < 75) {
      console.log('- Consider running campaign system for automated fixes');
      console.log('- Review build configuration for optimization opportunities');
    }
    
    if (qualityScore < 60) {
      console.log('- Immediate attention required for code quality');
      console.log('- Consider comprehensive code review and refactoring');
    }
    
    if (showDetailed) {
      console.log('\n🔍 Detailed Analysis:');
      console.log('Note: Detailed analysis requires full monitoring report');
      console.log('Use the full monitorBuildQuality() function for comprehensive metrics');
    }
    
    console.log('\n' + '='.repeat(50));
    
    if (qualityScore >= 75) {
      console.log('✅ Build quality is acceptable');
      process.exit(0);
    } else if (qualityScore >= 60) {
      console.log('⚠️  Build quality needs attention');
      process.exit(1);
    } else {
      console.log('❌ Build quality requires immediate improvement');
      process.exit(2);
    }
    
  } catch (error) {
    console.error('💥 Build quality monitoring failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('- Ensure TypeScript is properly configured');
    console.log('- Check that build tools are available');
    console.log('- Verify project structure is correct');
    process.exit(1);
  }
}

// Show usage if help requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Build Quality Monitor');
  console.log('');
  console.log('Usage: node scripts/monitor-build-quality.js [options]');
  console.log('');
  console.log('Options:');
  console.log('  --detailed   Show detailed analysis (requires full monitoring)');
  console.log('  --help, -h   Show this help message');
  console.log('');
  console.log('Exit Codes:');
  console.log('  0  Quality acceptable (≥75)');
  console.log('  1  Quality needs attention (60-74)');
  console.log('  2  Quality requires improvement (<60)');
  console.log('  1  Error occurred');
  process.exit(0);
}

// Run the build quality monitoring
runBuildQualityMonitoring();