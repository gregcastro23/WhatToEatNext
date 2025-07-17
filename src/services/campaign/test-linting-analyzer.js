#!/usr/bin/env node

/**
 * test-linting-analyzer.js
 * 
 * Test script for LintingWarningAnalyzer
 * Validates the analyzer can detect and categorize warnings
 */

import { LintingWarningAnalyzer } from './LintingWarningAnalyzer.js';

async function testLintingAnalyzer() {
  console.log('🧪 Testing Linting Warning Analyzer...\n');
  
  try {
    const analyzer = new LintingWarningAnalyzer();
    
    console.log('📊 Running linting analysis...');
    const result = await analyzer.analyzeLintingWarnings();
    
    console.log('\n📈 Analysis Results:');
    console.log(`Total Warnings: ${result.distribution.total}`);
    console.log(`Explicit Any: ${result.distribution.explicitAny.count}`);
    console.log(`Unused Variables: ${result.distribution.unusedVariables.count}`);
    console.log(`Console Statements: ${result.distribution.consoleStatements.count}`);
    console.log(`Other: ${result.distribution.other.count}`);
    
    console.log('\n🎯 File Prioritization:');
    console.log(`High Priority: ${result.prioritizedFiles.highPriority.length} files`);
    console.log(`Medium Priority: ${result.prioritizedFiles.mediumPriority.length} files`);
    console.log(`Low Priority: ${result.prioritizedFiles.lowPriority.length} files`);
    
    console.log('\n💡 Recommendations:');
    result.recommendations.forEach(rec => console.log(`  ${rec}`));
    
    console.log('\n📋 Generating detailed report...');
    const report = analyzer.generateReport(result);
    console.log('\n' + '='.repeat(50));
    console.log(report);
    console.log('='.repeat(50));
    
    console.log('\n✅ Linting Warning Analyzer test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testLintingAnalyzer();