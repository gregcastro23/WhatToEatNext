#!/usr/bin/env node

/**
 * CLI script to manually run ingredient data validation
 * Usage: node scripts/validate-ingredient-data.js
 */

const path = require('path');

// Add the src directory to the module path
require('module').globalPaths.push(path.join(__dirname, '..', 'src'));

async function runValidation() {
  try {
    console.log('🥬 Starting Ingredient Data Validation...\n');
    
    // Import the validation function
    const { validateIngredientData } = require('../src/utils/ingredientValidation.ts');
    
    // Run the validation
    const result = await validateIngredientData();
    
    // Display results
    console.log('📊 Validation Results:');
    console.log('='.repeat(50));
    console.log(result.summary);
    console.log('='.repeat(50));
    
    if (result.errors.length > 0) {
      console.log('\n❌ Errors Found:');
      result.errors.forEach((error, index) => {
        console.log(`${index + 1}. [${error.severity}] ${error.message}`);
        if (error.ingredient) {
          console.log(`   Ingredient: ${error.ingredient}`);
        }
        if (error.property) {
          console.log(`   Property: ${error.property}`);
        }
      });
    }
    
    if (result.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      result.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning.message}`);
        if (warning.ingredient) {
          console.log(`   Ingredient: ${warning.ingredient}`);
        }
      });
    }
    
    if (result.isValid) {
      console.log('\n✅ Validation PASSED - Ingredient data is consistent');
      process.exit(0);
    } else {
      console.log('\n❌ Validation FAILED - Issues detected in ingredient data');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 Validation script failed:', error.message);
    process.exit(1);
  }
}

// Run the validation
runValidation();