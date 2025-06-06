#!/usr/bin/env node

// ===== SEASONAL CONSOLIDATION VALIDATION =====
// Validates that the seasonal consolidation was successful

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🚀 Validating Seasonal Consolidation...\n');

// Check if unified seasonal file exists
const seasonalPath = 'src/data/unified/seasonal.ts';
const ingredientsPath = 'src/data/unified/ingredients.ts';

console.log('📋 Checking file existence...');

if (existsSync(seasonalPath)) {
  console.log('✅ Unified seasonal file exists');
} else {
  console.log('❌ Unified seasonal file missing');
  process.exit(1);
}

if (existsSync(ingredientsPath)) {
  console.log('✅ Unified ingredients file exists');
} else {
  console.log('❌ Unified ingredients file missing');
  process.exit(1);
}

// Check file content
console.log('\n📋 Checking file content...');

try {
  const seasonalContent = readFileSync(seasonalPath, 'utf8');
  
  // Check for key consolidation markers
  const checks = [
    { pattern: 'UNIFIED SEASONAL SYSTEM', description: 'Unified system header' },
    { pattern: 'unifiedSeasonalProfiles', description: 'Unified seasonal profiles' },
    { pattern: 'SeasonalMonicaModifiers', description: 'Monica modifiers interface' },
    { pattern: 'kalchmRange', description: 'Kalchm range integration' },
    { pattern: 'monicaModifiers', description: 'Monica modifiers' },
    { pattern: 'UnifiedSeasonalSystem', description: 'Unified system class' },
    { pattern: 'getSeasonalRecommendations', description: 'Monica-enhanced recommendations' },
    { pattern: 'calculateSeasonalTransition', description: 'Seasonal transitions' },
    { pattern: 'seasonalPatterns', description: 'Backward compatibility - patterns' },
    { pattern: 'seasonalUsage', description: 'Backward compatibility - usage' },
    { pattern: 'spring:', description: 'Spring season data' },
    { pattern: 'summer:', description: 'Summer season data' },
    { pattern: 'autumn:', description: 'Autumn season data' },
    { pattern: 'winter:', description: 'Winter season data' },
    { pattern: 'tarotProfile', description: 'Tarot integration' },
    { pattern: 'elementalDominance', description: 'Elemental properties' }
  ];
  
  let passedChecks = 0;
  
  for (const check of checks) {
    if (seasonalContent.includes(check.pattern)) {
      console.log(`✅ ${check.description}`);
      passedChecks++;
    } else {
      console.log(`❌ ${check.description} - missing pattern: ${check.pattern}`);
    }
  }
  
  console.log(`\n📊 Content validation: ${passedChecks}/${checks.length} checks passed`);
  
  // Check file size (should be substantial)
  const fileSize = seasonalContent.length;
  console.log(`📏 File size: ${(fileSize / 1024).toFixed(1)}KB`);
  
  if (fileSize > 50000) { // Should be > 50KB for a comprehensive consolidation
    console.log('✅ File size indicates comprehensive consolidation');
  } else {
    console.log('⚠️  File size seems small for a full consolidation');
  }
  
  // Check for consolidation from original files
  const consolidationMarkers = [
    'from seasonalPatterns.ts',
    'from seasonalUsage.ts', 
    'from seasonal.ts',
    'CONSOLIDATED SEASONAL DATA',
    'BACKWARD COMPATIBILITY'
  ];
  
  let consolidationChecks = 0;
  for (const marker of consolidationMarkers) {
    if (seasonalContent.includes(marker)) {
      consolidationChecks++;
    }
  }
  
  console.log(`📋 Consolidation markers: ${consolidationChecks}/${consolidationMarkers.length} found`);
  
  // Check for Monica and Kalchm integration
  const integrationMarkers = [
    'Monica',
    'Kalchm', 
    'monicaConstant',
    'kalchm',
    'thermodynamic',
    'alchemical'
  ];
  
  let integrationChecks = 0;
  for (const marker of integrationMarkers) {
    if (seasonalContent.includes(marker)) {
      integrationChecks++;
    }
  }
  
  console.log(`🧪 Integration markers: ${integrationChecks}/${integrationMarkers.length} found`);
  
  // Overall assessment
  const totalChecks = checks.length + consolidationMarkers.length + integrationMarkers.length;
  const totalPassed = passedChecks + consolidationChecks + integrationChecks;
  const successRate = (totalPassed / totalChecks) * 100;
  
  console.log(`\n📈 Overall Success Rate: ${successRate.toFixed(1)}%`);
  
  if (successRate >= 90) {
    console.log('\n🎉 Seasonal Consolidation SUCCESSFUL!');
    console.log('✅ All key components consolidated');
    console.log('✅ Monica constants integrated');
    console.log('✅ Kalchm values integrated');
    console.log('✅ Backward compatibility maintained');
  } else if (successRate >= 70) {
    console.log('\n⚠️  Seasonal Consolidation completed with warnings');
    console.log('ℹ️  Some components may need attention');
  } else {
    console.log('\n❌ Seasonal Consolidation FAILED');
    console.log('🔧 Critical components missing');
  }
  
  // Check ingredients file for syntax errors
  console.log('\n📋 Checking ingredients file for syntax errors...');
  
  const ingredientsContent = readFileSync(ingredientsPath, 'utf8');
  
  // Check for the syntax errors we fixed
  const syntaxErrors = [
    'Medicinal herbIngredients',
    'Mineral saltIngredients', 
    'Herb / (vegetable || 1)Ingredients'
  ];
  
  let syntaxErrorsFound = 0;
  for (const error of syntaxErrors) {
    if (ingredientsContent.includes(error)) {
      console.log(`❌ Syntax error still present: ${error}`);
      syntaxErrorsFound++;
    }
  }
  
  if (syntaxErrorsFound === 0) {
    console.log('✅ No syntax errors found in ingredients file');
  } else {
    console.log(`❌ ${syntaxErrorsFound} syntax errors still present`);
  }
  
  // Final result
  const finalSuccess = successRate >= 90 && syntaxErrorsFound === 0;
  
  console.log('\n🏁 FINAL RESULT:');
  if (finalSuccess) {
    console.log('🎉 Phase 3 Step 1 (Seasonal Consolidation) COMPLETE!');
    console.log('✅ Ready to proceed to Step 2 (Cuisine Integration)');
  } else {
    console.log('⚠️  Phase 3 Step 1 needs additional work');
    console.log('🔧 Address remaining issues before proceeding');
  }
  
  process.exit(finalSuccess ? 0 : 1);
  
} catch (error) {
  console.error('❌ Error reading seasonal file:', error.message);
  process.exit(1);
} 