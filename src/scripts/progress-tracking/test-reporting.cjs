#!/usr/bin/env node

/**
 * Test script for the progress reporting system
 */

const ProgressReportingSystem = require('./ProgressReportingSystem.cjs');

async function testReporting() {
  try {
    console.log('🧪 Testing Progress Reporting System...');

    const reportingSystem = new ProgressReportingSystem();

    // Test executive summary
    console.log('\n📊 Testing Executive Summary...');
    reportingSystem.printExecutiveSummary();

    // Test report generation
    console.log('\n📊 Testing Report Generation...');
    const result = await reportingSystem.generateAndSaveReport();

    console.log('\n✅ Test completed successfully!');
    console.log(`   Full Report: ${result.fullReport}`);
    console.log(`   Summary: ${result.summary}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

testReporting();
