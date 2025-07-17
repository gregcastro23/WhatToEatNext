#!/usr/bin/env node

/**
 * CLI script to manually run planetary data validation
 * Usage: node scripts/validate-planetary-data.js
 */

const path = require('path');

// Add the src directory to the module path
require('module').globalPaths.push(path.join(__dirname, '..', 'src'));

async function runValidation() {
  try {
    console.log('🌟 Starting Planetary Data Validation...\n');
    
    // Import the validation function
    const { validatePlanetaryData } = require('../src/utils/planetaryValidation.ts');
    
    // Run the validation
    const result = await validatePlanetaryData();
    
    // Display results
    console.log('📊 Validation Results:');
    console.log('='.repeat(50));
    console.log(result.summary);
    console.log('='.repeat(50));
    
    if (result.errors.length > 0) {
      console.log('\n❌ Errors Found:');
      result.errors.forEach((error, index) => {
        console.log(`${index + 1}. [${error.severity}] ${error.message}`);
        if (error.planet) {
          console.log(`   Planet: ${error.planet}`);
        }
      });
    }
    
    if (result.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      result.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning.message}`);
        if (warning.planet) {
          console.log(`   Planet: ${warning.planet}`);
        }
      });
    }
    
    if (result.isValid) {
      console.log('\n✅ Validation PASSED - Planetary data is consistent');
      process.exit(0);
    } else {
      console.log('\n❌ Validation FAILED - Issues detected in planetary data');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 Validation script failed:', error.message);
    process.exit(1);
  }
}

// Run the validation
runValidation();