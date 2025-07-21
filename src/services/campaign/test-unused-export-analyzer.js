#!/usr/bin/env node

/**
 * Test script for Unused Export Analyzer
 * Perfect Codebase Campaign - Phase 3 Implementation
 */

import fs from 'fs';
import { UnusedExportAnalyzer } from './UnusedExportAnalyzer.js';

async function testUnusedExportAnalyzer() {
  console.log('🧪 Testing Unused Export Analyzer...\n');

  try {
    const analyzer = new UnusedExportAnalyzer('src');
    
    console.log('📊 Starting analysis...');
    const startTime = Date.now();
    
    const result = await analyzer.analyzeUnusedExports();
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log('\n✅ Analysis completed successfully!');
    console.log(`⏱️  Duration: ${duration.toFixed(2)}s\n`);

    // Display summary
    console.log('📈 ANALYSIS SUMMARY');
    console.log('==================');
    console.log(`Total files analyzed: ${result.totalFiles}`);
    console.log(`Total unused exports: ${result.totalUnusedExports}`);
    console.log(`High priority files: ${result.highPriorityFiles.length}`);
    console.log(`Medium priority files: ${result.mediumPriorityFiles.length}`);
    console.log(`Low priority files: ${result.lowPriorityFiles.length}`);
    console.log(`Recipe files: ${result.summary.recipeFiles}`);
    console.log(`Core files: ${result.summary.coreFiles}`);
    console.log(`External files: ${result.summary.externalFiles}`);
    console.log(`Transformation candidates: ${result.summary.totalTransformationCandidates}`);
    console.log(`Average safety score: ${result.summary.averageSafetyScore.toFixed(1)}`);
    console.log(`Estimated intelligence systems: ${result.summary.estimatedIntelligenceSystems}`);

    // Show top candidates
    console.log('\n🎯 TOP TRANSFORMATION CANDIDATES');
    console.log('=================================');

    const allFiles = [...result.highPriorityFiles, ...result.mediumPriorityFiles, ...result.lowPriorityFiles];
    const topCandidates = allFiles
      .filter(f => f.transformationCandidates.length > 0)
      .sort((a, b) => b.safetyScore - a.safetyScore)
      .slice(0, 5);

    topCandidates.forEach((file, index) => {
      console.log(`\n${index + 1}. ${file.filePath}`);
      console.log(`   Priority: ${file.priority}`);
      console.log(`   Category: ${file.category}`);
      console.log(`   Safety Score: ${file.safetyScore}`);
      console.log(`   Unused Exports: ${file.unusedExports.length}`);
      console.log(`   Candidates: ${file.transformationCandidates.length}`);
      
      if (file.transformationCandidates.length > 0) {
        const topCandidate = file.transformationCandidates[0];
        console.log(`   Top Candidate: ${topCandidate.export.exportName} -> ${topCandidate.intelligenceSystemName}`);
        console.log(`   Complexity: ${topCandidate.transformationComplexity}`);
        console.log(`   Benefit: ${topCandidate.estimatedBenefit}`);
      }
    });

    // Generate and save report
    console.log('\n📄 Generating detailed report...');
    const report = analyzer.generateReport(result);
    
    const reportPath = '.unused-export-analysis-report.md';
    await fs.promises.writeFile(reportPath, report);
    console.log(`📝 Report saved to: ${reportPath}`);

    console.log('\n🎉 Test completed successfully!');
    
    return {
      success: true,
      duration,
      totalFiles: result.totalFiles,
      totalUnusedExports: result.totalUnusedExports,
      transformationCandidates: result.summary.totalTransformationCandidates
    };

  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testUnusedExportAnalyzer()
    .then(result => {
      if (result.success) {
        console.log('\n✅ All tests passed!');
        process.exit(0);
      } else {
        console.log('\n❌ Tests failed!');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 Unexpected error:', error);
      process.exit(1);
    });
}

export { testUnusedExportAnalyzer };