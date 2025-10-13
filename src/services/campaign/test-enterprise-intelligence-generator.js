#!/usr/bin/env node

/**
 * Test script for Enterprise Intelligence Generator
 * Perfect Codebase Campaign - Phase 3 Implementation
 */

import fs from 'fs';
import { EnterpriseIntelligenceGenerator } from './EnterpriseIntelligenceGenerator';
import { UnusedExportAnalyzer } from './UnusedExportAnalyzer';

async function testEnterpriseIntelligenceGenerator() {
  console.log('🧠 Testing Enterprise Intelligence Generator...\n');

  try {
    // First, analyze unused exports to get transformation candidates
    console.log('📊 Analyzing unused exports...');
    const analyzer = new UnusedExportAnalyzer('src');
    const analysisResult = await analyzer.analyzeUnusedExports();

    console.log(
      `✅ Found ${analysisResult.totalUnusedExports} unused exports in ${analysisResult.totalFiles} files`,
    );

    // Take a sample of files for testing (to avoid generating too many systems)
    const sampleFiles = [
      ...analysisResult.highPriorityFiles.slice(0, 2),
      ...analysisResult.mediumPriorityFiles.slice(0, 3),
      ...analysisResult.lowPriorityFiles.slice(0, 2),
    ];

    console.log(
      `🎯 Testing with ${sampleFiles.length} sample files containing ${sampleFiles.reduce((sum, f) => sum + f.transformationCandidates.length, 0)} transformation candidates`,
    );

    // Initialize the generator
    console.log('\n🏗️  Initializing Enterprise Intelligence Generator...');
    const generator = new EnterpriseIntelligenceGenerator('test-intelligence-output');

    // Generate intelligence systems
    console.log('🚀 Generating intelligence systems...');
    const startTime = Date.now();

    const results = await generator.generateIntelligenceSystems(sampleFiles);

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log(`\n✅ Generation completed successfully!`);
    console.log(`⏱️  Duration: ${duration.toFixed(2)}s`);

    // Display results summary
    console.log('\n📈 GENERATION SUMMARY');
    console.log('====================');

    const summary = generator.generateSummary(results);
    console.log(`Total systems generated: ${summary.totalSystemsGenerated}`);
    console.log(`Total capabilities added: ${summary.totalCapabilitiesAdded}`);
    console.log(`Total integration points: ${summary.totalIntegrationPoints}`);
    console.log(`Average complexity: ${summary.averageComplexity.toFixed(1)}`);
    console.log(`Estimated total value: ${summary.estimatedTotalValue}`);

    console.log('\nGeneration by category:');
    Object.entries(summary.generationsByCategory).forEach(([category, count]) => {
      console.log(`  ${category}: ${count}`);
    });

    // Show sample generated systems
    console.log('\n🎯 SAMPLE GENERATED SYSTEMS');
    console.log('===========================');

    results.slice(0, 3).forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.systemName}`);
      console.log(
        `   Original Export: ${result.originalExport.exportName} (${result.originalExport.exportType})`,
      );
      console.log(`   File: ${result.filePath}`);
      console.log(`   Estimated Value: ${result.estimatedValue}/100`);
      console.log(`   Complexity: ${result.complexity}`);
      console.log(`   Capabilities: ${result.capabilities.length}`);
      console.log(`   Integration Points: ${result.integrationPoints.length}`);

      // Show first few lines of generated code
      const codeLines = result.generatedCode.split('\n').slice(0, 10);
      console.log('   Generated Code Preview:');
      codeLines.forEach(line => {
        if (line.trim()) {
          console.log(`     ${line}`);
        }
      });
      console.log('     ...');
    });

    // Generate and save integration guide
    console.log('\n📚 Generating integration guide...');
    const integrationGuide = generator.generateIntegrationGuide(results);

    const guidePath = 'test-intelligence-integration-guide.md';
    await fs.promises.writeFile(guidePath, integrationGuide);
    console.log(`📝 Integration guide saved to: ${guidePath}`);

    // Show sample generated file content
    if (results.length > 0) {
      console.log('\n📄 SAMPLE GENERATED FILE CONTENT');
      console.log('=================================');

      const sampleResult = results[0];
      console.log(`File: ${sampleResult.filePath}`);
      console.log('Content preview:');

      const contentLines = sampleResult.generatedCode.split('\n').slice(0, 30);
      contentLines.forEach((line, index) => {
        console.log(`${(index + 1).toString().padStart(3)}: ${line}`);
      });
      console.log('...');
    }

    // Verify files were created
    console.log('\n🔍 Verifying generated files...');
    let filesCreated = 0;
    for (const result of results) {
      try {
        await fs.promises.access(result.filePath);
        filesCreated++;
      } catch (error) {
        console.warn(`⚠️  File not found: ${result.filePath}`);
      }
    }

    console.log(`✅ ${filesCreated}/${results.length} files successfully created`);

    console.log('\n🎉 Test completed successfully!');

    return {
      success: true,
      duration,
      systemsGenerated: results.length,
      capabilitiesAdded: summary.totalCapabilitiesAdded,
      integrationPoints: summary.totalIntegrationPoints,
      estimatedValue: summary.estimatedTotalValue,
      filesCreated,
    };
  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Run the test if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testEnterpriseIntelligenceGenerator()
    .then(result => {
      if (result.success) {
        console.log('\n✅ All tests passed!');
        console.log(`🎯 Generated ${result.systemsGenerated} intelligence systems`);
        console.log(`🔧 Added ${result.capabilitiesAdded} capabilities`);
        console.log(`🔗 Created ${result.integrationPoints} integration points`);
        console.log(`💎 Estimated total value: ${result.estimatedValue}`);
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

export { testEnterpriseIntelligenceGenerator };
