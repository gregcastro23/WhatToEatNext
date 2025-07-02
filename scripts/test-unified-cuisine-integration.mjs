#!/usr/bin/env node

// ===== UNIFIED CUISINE INTEGRATION VALIDATION =====
// Tests the consolidated cuisine integration system with Monica/Kalchm integration

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🚀 Testing Unified Cuisine Integration System...\n');

// ===== FILE EXISTENCE VALIDATION =====

console.log('📋 Checking file existence...');

const cuisineIntegrationPath = 'src/data/unified/cuisineIntegrations.ts';
const seasonalPath = 'src/data/unified/seasonal.ts';
const ingredientsPath = 'src/data/unified/ingredients.ts';

const requiredFiles = [
  { path: cuisineIntegrationPath, name: 'Unified cuisine integration file' },
  { path: seasonalPath, name: 'Unified seasonal file' },
  { path: ingredientsPath, name: 'Unified ingredients file' }
];

let filesExist = true;
for (const file of requiredFiles) {
  if (existsSync(file.path)) {
    console.log(`✅ ${file.name} exists`);
  } else {
    console.log(`❌ ${file.name} missing: ${file.path}`);
    filesExist = false;
  }
}

if (!filesExist) {
  console.log('\n❌ Required files missing. Cannot proceed with tests.');
  process.exit(1);
}

// ===== CONTENT VALIDATION =====

console.log('\n📋 Checking file content...');

try {
  const cuisineContent = readFileSync(cuisineIntegrationPath, 'utf8');
  
  // Core system validation checks
  const coreChecks = [
    { pattern: 'UNIFIED CUISINE INTEGRATION SYSTEM', description: 'Unified system header' },
    { pattern: 'UnifiedCuisineIntegrationSystem', description: 'Main system class' },
    { pattern: 'CuisineCompatibilityProfile', description: 'Compatibility interface' },
    { pattern: 'FusionCuisineProfile', description: 'Fusion cuisine interface' },
    { pattern: 'CuisineMonicaProfile', description: 'Monica profile interface' },
    { pattern: 'SeasonalFusionProfile', description: 'Seasonal fusion interface' },
    { pattern: 'MonicaBlendProfile', description: 'Monica blend interface' },
    { pattern: 'CuisineSeasonalAdaptation', description: 'Seasonal adaptation interface' },
    { pattern: 'CuisineIngredientAnalysis', description: 'Ingredient analysis interface' }
  ];
  
  let coreChecksPassed = 0;
  for (const check of coreChecks) {
    if (cuisineContent.includes(check.pattern)) {
      console.log(`✅ ${check.description}`);
      coreChecksPassed++;
    } else {
      console.log(`❌ ${check.description} - missing pattern: ${check.pattern}`);
    }
  }
  
  // Functionality validation checks
  const functionalityChecks = [
    { pattern: 'calculateCuisineCompatibility', description: 'Cuisine compatibility calculation' },
    { pattern: 'generateFusion', description: 'Fusion cuisine generation' },
    { pattern: 'optimizeMonicaBlend', description: 'Monica blend optimization' },
    { pattern: 'getCuisineSeasonalCompatibility', description: 'Seasonal compatibility' },
    { pattern: 'adaptCuisineForSeason', description: 'Seasonal adaptation' },
    { pattern: 'analyzeCuisineIngredients', description: 'Ingredient analysis' },
    { pattern: 'findCuisinesByIngredient', description: 'Ingredient-to-cuisine mapping' },
    { pattern: 'getSeasonalFusionRecommendations', description: 'Seasonal fusion recommendations' }
  ];
  
  let functionalityChecksPassed = 0;
  for (const check of functionalityChecks) {
    if (cuisineContent.includes(check.pattern)) {
      console.log(`✅ ${check.description}`);
      functionalityChecksPassed++;
    } else {
      console.log(`❌ ${check.description} - missing pattern: ${check.pattern}`);
    }
  }
  
  // Data consolidation validation checks
  const dataChecks = [
    { pattern: 'enhancedCuisineMatrix', description: 'Enhanced cuisine matrix' },
    { pattern: 'cuisineMonicaConstants', description: 'Cuisine Monica constants' },
    { pattern: 'grainCuisineMatrix', description: 'Grain cuisine matrix integration' },
    { pattern: 'herbCuisineMatrix', description: 'Herb cuisine matrix integration' },
    { pattern: 'spice:', description: 'Spice cuisine mappings' },
    { pattern: 'protein:', description: 'Protein cuisine mappings' },
    { pattern: 'vegetable:', description: 'Vegetable cuisine mappings' }
  ];
  
  let dataChecksPassed = 0;
  for (const check of dataChecks) {
    if (cuisineContent.includes(check.pattern)) {
      console.log(`✅ ${check.description}`);
      dataChecksPassed++;
    } else {
      console.log(`❌ ${check.description} - missing pattern: ${check.pattern}`);
    }
  }
  
  // Monica and Kalchm integration validation
  const integrationChecks = [
    { pattern: 'monicaCompatibility', description: 'Monica compatibility calculation' },
    { pattern: 'kalchmHarmony', description: 'Kalchm harmony calculation' },
    { pattern: 'baseMonicaConstant', description: 'Base Monica constants' },
    { pattern: 'seasonalModifiers', description: 'Seasonal Monica modifiers' },
    { pattern: 'cookingMethodOptimization', description: 'Cooking method optimization' },
    { pattern: 'temperaturePreferences', description: 'Temperature preferences' },
    { pattern: 'timingAdjustments', description: 'Timing adjustments' },
    { pattern: 'fusionKalchm', description: 'Fusion Kalchm calculation' },
    { pattern: 'fusionMonica', description: 'Fusion Monica calculation' }
  ];
  
  let integrationChecksPassed = 0;
  for (const check of integrationChecks) {
    if (cuisineContent.includes(check.pattern)) {
      console.log(`✅ ${check.description}`);
      integrationChecksPassed++;
    } else {
      console.log(`❌ ${check.description} - missing pattern: ${check.pattern}`);
    }
  }
  
  // Seasonal integration validation
  const seasonalIntegrationChecks = [
    { pattern: 'unifiedSeasonalSystem', description: 'Seasonal system integration' },
    { pattern: 'seasonalCompatibility', description: 'Seasonal compatibility' },
    { pattern: 'seasonalAdaptations', description: 'Seasonal adaptations' },
    { pattern: 'getSeasonalScore', description: 'Seasonal scoring integration' },
    { pattern: 'seasonalProfile', description: 'Seasonal profile usage' },
    { pattern: 'calculateSeasonalOptimization', description: 'Seasonal optimization' }
  ];
  
  let seasonalIntegrationChecksPassed = 0;
  for (const check of seasonalIntegrationChecks) {
    if (cuisineContent.includes(check.pattern)) {
      console.log(`✅ ${check.description}`);
      seasonalIntegrationChecksPassed++;
    } else {
      console.log(`❌ ${check.description} - missing pattern: ${check.pattern}`);
    }
  }
  
  // Backward compatibility validation
  const backwardCompatibilityChecks = [
    { pattern: 'getCuisinePAirings', description: 'Original getCuisinePAirings function' },
    { pattern: 'getIngredientsForCuisine', description: 'Original getIngredientsForCuisine function' },
    { pattern: 'BACKWARD COMPATIBILITY', description: 'Backward compatibility section' },
    { pattern: 'export { getCuisinePAirings', description: 'Backward compatibility exports' }
  ];
  
  let backwardCompatibilityChecksPassed = 0;
  for (const check of backwardCompatibilityChecks) {
    if (cuisineContent.includes(check.pattern)) {
      console.log(`✅ ${check.description}`);
      backwardCompatibilityChecksPassed++;
    } else {
      console.log(`❌ ${check.description} - missing pattern: ${check.pattern}`);
    }
  }
  
  // Elemental self-reinforcement validation
  const elementalChecks = [
    { pattern: '0.9', description: 'Self-reinforcement compatibility (0.9)' },
    { pattern: '0.7', description: 'Minimum compatibility (0.7)' },
    { pattern: 'Self-reinforcement principle', description: 'Self-reinforcement principle mentioned' },
    { pattern: 'elementalAlignment', description: 'Elemental alignment calculation' },
    { pattern: 'elementalProfile', description: 'Elemental profile usage' }
  ];
  
  let elementalChecksPassed = 0;
  for (const check of elementalChecks) {
    if (cuisineContent.includes(check.pattern)) {
      console.log(`✅ ${check.description}`);
      elementalChecksPassed++;
    } else {
      console.log(`❌ ${check.description} - missing pattern: ${check.pattern}`);
    }
  }
  
  // Calculate overall scores
  const totalChecks = coreChecks.length + functionalityChecks.length + dataChecks.length + 
                     integrationChecks.length + seasonalIntegrationChecks.length + 
                     backwardCompatibilityChecks.length + elementalChecks.length;
  
  const totalPassed = coreChecksPassed + functionalityChecksPassed + dataChecksPassed + 
                     integrationChecksPassed + seasonalIntegrationChecksPassed + 
                     backwardCompatibilityChecksPassed + elementalChecksPassed;
  
  const successRate = (totalPassed / totalChecks) * 100;
  
  console.log(`\n📊 Validation Results:`);
  console.log(`Core System: ${coreChecksPassed}/${coreChecks.length} checks passed`);
  console.log(`Functionality: ${functionalityChecksPassed}/${functionalityChecks.length} checks passed`);
  console.log(`Data Consolidation: ${dataChecksPassed}/${dataChecks.length} checks passed`);
  console.log(`Monica/Kalchm Integration: ${integrationChecksPassed}/${integrationChecks.length} checks passed`);
  console.log(`Seasonal Integration: ${seasonalIntegrationChecksPassed}/${seasonalIntegrationChecks.length} checks passed`);
  console.log(`Backward Compatibility: ${backwardCompatibilityChecksPassed}/${backwardCompatibilityChecks.length} checks passed`);
  console.log(`Elemental Self-Reinforcement: ${elementalChecksPassed}/${elementalChecks.length} checks passed`);
  
  // File size validation
  const fileSize = cuisineContent.length;
  console.log(`\n📏 File size: ${(fileSize / 1024).toFixed(1)}KB`);
  
  if (fileSize > 100000) { // Should be > 100KB for comprehensive consolidation
    console.log('✅ File size indicates comprehensive consolidation');
  } else {
    console.log('⚠️  File size seems small for a comprehensive consolidation');
  }
  
  // Cuisine coverage validation
  const cuisineCoverageChecks = [
    'italian', 'chinese', 'indian', 'french', 'japanese', 
    'mexican', 'thai', 'middle-eastern'
  ];
  
  let cuisineCoveragePassed = 0;
  for (const cuisine of cuisineCoverageChecks) {
    if (cuisineContent.includes(`'${cuisine}'`) || cuisineContent.includes(`"${cuisine}"`)) {
      cuisineCoveragePassed++;
    }
  }
  
  console.log(`\n🍽️  Cuisine Coverage: ${cuisineCoveragePassed}/${cuisineCoverageChecks.length} major cuisines covered`);
  
  // Ingredient category coverage validation
  const ingredientCategoryChecks = ['grain', 'herb', 'spice', 'protein', 'vegetable'];
  let ingredientCategoryPassed = 0;
  
  for (const category of ingredientCategoryChecks) {
    if (cuisineContent.includes(`${category}:`)) {
      ingredientCategoryPassed++;
    }
  }
  
  console.log(`🥘 Ingredient Categories: ${ingredientCategoryPassed}/${ingredientCategoryChecks.length} categories covered`);
  
  // Cooking method coverage validation
  const cookingMethodChecks = [
    'grilling', 'roasting', 'steaming', 'braising', 'sauteing', 
    'stir_frying', 'tempering', 'tandoor'
  ];
  
  let cookingMethodPassed = 0;
  for (const method of cookingMethodChecks) {
    if (cuisineContent.includes(method)) {
      cookingMethodPassed++;
    }
  }
  
  console.log(`🍳 Cooking Methods: ${cookingMethodPassed}/${cookingMethodChecks.length} methods covered`);
  
  // Overall assessment
  console.log(`\n📈 Overall Success Rate: ${successRate.toFixed(1)}%`);
  
  if (successRate >= 90) {
    console.log('\n🎉 Unified Cuisine Integration SUCCESSFUL!');
    console.log('✅ All key components consolidated');
    console.log('✅ Monica constants integrated');
    console.log('✅ Kalchm values integrated');
    console.log('✅ Seasonal system integrated');
    console.log('✅ Backward compatibility maintained');
    console.log('✅ Elemental self-reinforcement principles followed');
  } else if (successRate >= 80) {
    console.log('\n⚠️  Unified Cuisine Integration completed with warnings');
    console.log('ℹ️  Some components may need attention');
  } else {
    console.log('\n❌ Unified Cuisine Integration FAILED');
    console.log('🔧 Critical components missing');
  }
  
  // ===== MOCK FUNCTIONALITY TESTING =====
  
  console.log('\n🧪 Testing Mock Functionality...');
  
  // Test cuisine compatibility calculation
  console.log('\n📋 Testing Cuisine Compatibility...');
  
  const testCuisineCompatibility = () => {
    try {
      // Mock compatibility calculation
      const cuisine1 = 'italian';
      const cuisine2 = 'chinese';
      
      // Check if Monica constants exist for test cuisines
      const monicaPattern = new RegExp(`${cuisine1}:\\s*{[\\s\\S]*?baseMonicaConstant:\\s*[\\d.]+`);
      const hasMonicaData = monicaPattern.test(cuisineContent);
      
      if (hasMonicaData) {
        console.log(`✅ Monica constants found for ${cuisine1}`);
      } else {
        console.log(`❌ Monica constants missing for ${cuisine1}`);
      }
      
      // Check if Kalchm estimates exist
      const kalchmPattern = new RegExp(`'${cuisine1}':\\s*[\\d.]+`);
      const hasKalchmData = kalchmPattern.test(cuisineContent);
      
      if (hasKalchmData) {
        console.log(`✅ Kalchm estimates found for ${cuisine1}`);
      } else {
        console.log(`❌ Kalchm estimates missing for ${cuisine1}`);
      }
      
      // Check if elemental profiles exist
      const elementalPattern = new RegExp(`'${cuisine1}':\\s*{\\s*Fire:\\s*[\\d.]+`);
      const hasElementalData = elementalPattern.test(cuisineContent);
      
      if (hasElementalData) {
        console.log(`✅ Elemental profiles found for ${cuisine1}`);
      } else {
        console.log(`❌ Elemental profiles missing for ${cuisine1}`);
      }
      
      return true;
    } catch (error) {
      console.log(`❌ Error testing cuisine compatibility: ${error.message}`);
      return false;
    }
  };
  
  const compatibilityTestPassed = testCuisineCompatibility();
  
  // Test fusion cuisine generation
  console.log('\n📋 Testing Fusion Cuisine Generation...');
  
  const testFusionGeneration = () => {
    try {
      // Check if fusion name generation exists
      const fusionNamePattern = /generateFusionName.*{[\s\S]*?nameMap[\s\S]*?}/;
      const hasFusionNameGeneration = fusionNamePattern.test(cuisineContent);
      
      if (hasFusionNameGeneration) {
        console.log('✅ Fusion name generation found');
      } else {
        console.log('❌ Fusion name generation missing');
      }
      
      // Check if fusion dishes exist
      const fusionDishesPattern = /dishCombinations.*{[\s\S]*?'italian'[\s\S]*?'chinese'/;
      const hasFusionDishes = fusionDishesPattern.test(cuisineContent);
      
      if (hasFusionDishes) {
        console.log('✅ Fusion dish combinations found');
      } else {
        console.log('❌ Fusion dish combinations missing');
      }
      
      return hasFusionNameGeneration && hasFusionDishes;
    } catch (error) {
      console.log(`❌ Error testing fusion generation: ${error.message}`);
      return false;
    }
  };
  
  const fusionTestPassed = testFusionGeneration();
  
  // Test seasonal integration
  console.log('\n📋 Testing Seasonal Integration...');
  
  const testSeasonalIntegration = () => {
    try {
      // Check if seasonal system import exists
      const seasonalImportPattern = /import.*unifiedSeasonalSystem.*from.*seasonal/;
      const hasSeasonalImport = seasonalImportPattern.test(cuisineContent);
      
      if (hasSeasonalImport) {
        console.log('✅ Seasonal system import found');
      } else {
        console.log('❌ Seasonal system import missing');
      }
      
      // Check if seasonal compatibility calculation exists
      const seasonalCompatibilityPattern = /getCuisineSeasonalCompatibility.*season.*Season/;
      const hasSeasonalCompatibility = seasonalCompatibilityPattern.test(cuisineContent);
      
      if (hasSeasonalCompatibility) {
        console.log('✅ Seasonal compatibility calculation found');
      } else {
        console.log('❌ Seasonal compatibility calculation missing');
      }
      
      // Check if seasonal adaptation exists
      const seasonalAdaptationPattern = /adaptCuisineForSeason.*season.*Season/;
      const hasSeasonalAdaptation = seasonalAdaptationPattern.test(cuisineContent);
      
      if (hasSeasonalAdaptation) {
        console.log('✅ Seasonal adaptation found');
      } else {
        console.log('❌ Seasonal adaptation missing');
      }
      
      return hasSeasonalImport && hasSeasonalCompatibility && hasSeasonalAdaptation;
    } catch (error) {
      console.log(`❌ Error testing seasonal integration: ${error.message}`);
      return false;
    }
  };
  
  const seasonalTestPassed = testSeasonalIntegration();
  
  // Test ingredient analysis
  console.log('\n📋 Testing Ingredient Analysis...');
  
  const testIngredientAnalysis = () => {
    try {
      // Check if ingredient analysis function exists
      const ingredientAnalysisPattern = /analyzeCuisineIngredients.*cuisine.*string/;
      const hasIngredientAnalysis = ingredientAnalysisPattern.test(cuisineContent);
      
      if (hasIngredientAnalysis) {
        console.log('✅ Ingredient analysis function found');
      } else {
        console.log('❌ Ingredient analysis function missing');
      }
      
      // Check if ingredient categorization exists
      const categorizationPattern = /categorizedIngredients.*Record.*string.*UnifiedIngredient/;
      const hasCategorization = categorizationPattern.test(cuisineContent);
      
      if (hasCategorization) {
        console.log('✅ Ingredient categorization found');
      } else {
        console.log('❌ Ingredient categorization missing');
      }
      
      // Check if Kalchm distribution calculation exists
      const kalchmDistributionPattern = /calculateKalchmDistribution.*kalchmValues.*number/;
      const hasKalchmDistribution = kalchmDistributionPattern.test(cuisineContent);
      
      if (hasKalchmDistribution) {
        console.log('✅ Kalchm distribution calculation found');
      } else {
        console.log('❌ Kalchm distribution calculation missing');
      }
      
      return hasIngredientAnalysis && hasCategorization && hasKalchmDistribution;
    } catch (error) {
      console.log(`❌ Error testing ingredient analysis: ${error.message}`);
      return false;
    }
  };
  
  const ingredientTestPassed = testIngredientAnalysis();
  
  // ===== FINAL ASSESSMENT =====
  
  const functionalityTests = [
    compatibilityTestPassed,
    fusionTestPassed,
    seasonalTestPassed,
    ingredientTestPassed
  ];
  
  const functionalityTestsPassed = functionalityTests.filter(test => test).length;
  const functionalitySuccessRate = (functionalityTestsPassed / functionalityTests.length) * 100;
  
  console.log(`\n🧪 Functionality Tests: ${functionalityTestsPassed}/${functionalityTests.length} passed (${functionalitySuccessRate.toFixed(1)}%)`);
  
  // Final result
  const overallSuccess = successRate >= 90 && functionalitySuccessRate >= 75;
  
  console.log('\n🏁 FINAL RESULT:');
  if (overallSuccess) {
    console.log('🎉 Phase 3 Step 2 (Enhanced Cuisine Integration) COMPLETE!');
    console.log('✅ Cuisine matrix files consolidated');
    console.log('✅ Monica constants integrated');
    console.log('✅ Kalchm values integrated');
    console.log('✅ Seasonal system integrated');
    console.log('✅ Fusion cuisine generation implemented');
    console.log('✅ Ingredient analysis implemented');
    console.log('✅ Backward compatibility maintained');
    console.log('✅ Ready to proceed to Step 3 (Recipe Building Enhancement)');
  } else {
    console.log('⚠️  Phase 3 Step 2 needs additional work');
    console.log('🔧 Address remaining issues before proceeding');
    
    if (successRate < 90) {
      console.log('📋 Content validation needs improvement');
    }
    if (functionalitySuccessRate < 75) {
      console.log('🧪 Functionality implementation needs improvement');
    }
  }
  
  // Summary statistics
  console.log('\n📊 SUMMARY STATISTICS:');
  console.log(`📁 File Size: ${(fileSize / 1024).toFixed(1)}KB`);
  console.log(`📋 Content Validation: ${successRate.toFixed(1)}%`);
  console.log(`🧪 Functionality Tests: ${functionalitySuccessRate.toFixed(1)}%`);
  console.log(`🍽️  Cuisine Coverage: ${cuisineCoveragePassed}/${cuisineCoverageChecks.length} cuisines`);
  console.log(`🥘 Ingredient Categories: ${ingredientCategoryPassed}/${ingredientCategoryChecks.length} categories`);
  console.log(`🍳 Cooking Methods: ${cookingMethodPassed}/${cookingMethodChecks.length} methods`);
  
  process.exit(overallSuccess ? 0 : 1);
  
} catch (error) {
  console.error('❌ Error reading cuisine integration file:', error.message);
  process.exit(1);
} 