#!/usr/bin/env node

// ===== UNIFIED RECIPE BUILDING SYSTEM TEST =====
// Phase 3 Step 3 Validation Script
// Tests Monica/Kalchm optimization, seasonal adaptation, cuisine integration

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test configuration
const TEST_CONFIG = {
  dryRun: true,
  verbose: true,
  testCategories: [
    'basic_functionality',
    'monica_optimization', 
    'seasonal_adaptation',
    'cuisine_integration',
    'fusion_generation',
    'planetary_recommendations',
    'integration_tests'
  ]
};

// Test results tracking
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: [],
  details: {}
};

// Utility functions
function log(message, level = 'info') {
  if (TEST_CONFIG.verbose || level === 'error') {
    const timestamp = new Date().toISOString();
    const prefix = level === 'error' ? '❌' : level === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }
}

function runTest(testName, testFunction) {
  testResults.total++;
  try {
    log(`Running test: ${testName}`);
    const result = testFunction();
    if (result === true || (typeof result === 'object' && result.success)) {
      testResults.passed++;
      log(`✅ PASSED: ${testName}`, 'success');
      testResults.details[testName] = { status: 'passed', result };
    } else {
      testResults.failed++;
      log(`❌ FAILED: ${testName}`, 'error');
      testResults.details[testName] = { status: 'failed', result };
    }
  } catch (error) {
    testResults.failed++;
    testResults.errors.push({ test: testName, error: error.message });
    log(`❌ ERROR in ${testName}: ${error.message}`, 'error');
    testResults.details[testName] = { status: 'error', error: error.message };
  }
}

// ===== BASIC FUNCTIONALITY TESTS =====

function testUnifiedRecipeBuildingSystemImport() {
  try {
    // Test if the unified recipe building system file exists
    const recipeBuildingPath = join(__dirname, 'src', 'data', 'unified', 'recipeBuilding.ts');
    if (!fs.existsSync(recipeBuildingPath)) {
      return { success: false, error: 'Unified recipe building system file not found' };
    }
    
    // Check file content structure
    const content = fs.readFileSync(recipeBuildingPath, 'utf8');
    const requiredExports = [
      'UnifiedRecipeBuildingSystem',
      'generateMonicaOptimizedRecipe',
      'adaptRecipeForSeason',
      'generateFusionRecipe',
      'generatePlanetaryRecipeRecommendation'
    ];
    
    const missingExports = requiredExports.filter(exp => !content.includes(exp));
    if (missingExports.length > 0) {
      return { success: false, error: `Missing exports: ${missingExports.join(', ')}` };
    }
    
    return { success: true, fileSize: content.length, exports: requiredExports.length };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function testRecipeBuildingInterfaces() {
  try {
    const recipeBuildingPath = join(__dirname, 'src', 'data', 'unified', 'recipeBuilding.ts');
    const content = fs.readFileSync(recipeBuildingPath, 'utf8');
    
    const requiredInterfaces = [
      'RecipeBuildingCriteria',
      'MonicaOptimizedRecipe',
      'RecipeGenerationResult',
      'SeasonalRecipeAdaptation',
      'FusionRecipeProfile',
      'PlanetaryRecipeRecommendation'
    ];
    
    const missingInterfaces = requiredInterfaces.filter(iface => !content.includes(`interface ${iface}`));
    if (missingInterfaces.length > 0) {
      return { success: false, error: `Missing interfaces: ${missingInterfaces.join(', ')}` };
    }
    
    return { success: true, interfaces: requiredInterfaces.length };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function testSystemIntegrations() {
  try {
    const recipeBuildingPath = join(__dirname, 'src', 'data', 'unified', 'recipeBuilding.ts');
    const content = fs.readFileSync(recipeBuildingPath, 'utf8');
    
    const requiredIntegrations = [
      'unifiedIngredients',
      'unifiedSeasonalSystem',
      'unifiedCuisineIntegrationSystem',
      'RecipeEnhancer',
      'calculateKalchm',
      'calculateMonica'
    ];
    
    const missingIntegrations = requiredIntegrations.filter(integration => !content.includes(integration));
    if (missingIntegrations.length > 0) {
      return { success: false, error: `Missing integrations: ${missingIntegrations.join(', ')}` };
    }
    
    return { success: true, integrations: requiredIntegrations.length };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ===== MONICA OPTIMIZATION TESTS =====

function testMonicaOptimizationStructure() {
  try {
    const recipeBuildingPath = join(__dirname, 'src', 'data', 'unified', 'recipeBuilding.ts');
    const content = fs.readFileSync(recipeBuildingPath, 'utf8');
    
    const monicaFeatures = [
      'calculateMonicaOptimization',
      'calculateOptimalMonica',
      'temperatureAdjustments',
      'timingAdjustments',
      'intensityModifications',
      'planetaryTimingRecommendations'
    ];
    
    const missingFeatures = monicaFeatures.filter(feature => !content.includes(feature));
    if (missingFeatures.length > 0) {
      return { success: false, error: `Missing Monica features: ${missingFeatures.join(', ')}` };
    }
    
    return { success: true, features: monicaFeatures.length };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function testMonicaOptimizationInterface() {
  try {
    const recipeBuildingPath = join(__dirname, 'src', 'data', 'unified', 'recipeBuilding.ts');
    const content = fs.readFileSync(recipeBuildingPath, 'utf8');
    
    // Check if MonicaOptimizedRecipe interface has required Monica optimization properties
    const monicaOptimizationMatch = content.match(/monicaOptimization:\s*{[^}]+}/s);
    if (!monicaOptimizationMatch) {
      return { success: false, error: 'Monica optimization interface not found' };
    }
    
    const monicaOptimizationContent = monicaOptimizationMatch[0];
    const requiredProperties = [
      'originalMonica',
      'optimizedMonica',
      'optimizationScore',
      'temperatureAdjustments',
      'timingAdjustments'
    ];
    
    const missingProperties = requiredProperties.filter(prop => !monicaOptimizationContent.includes(prop));
    if (missingProperties.length > 0) {
      return { success: false, error: `Missing Monica optimization properties: ${missingProperties.join(', ')}` };
    }
    
    return { success: true, properties: requiredProperties.length };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ===== SEASONAL ADAPTATION TESTS =====

function testSeasonalAdaptationStructure() {
  try {
    const recipeBuildingPath = join(__dirname, 'src', 'data', 'unified', 'recipeBuilding.ts');
    const content = fs.readFileSync(recipeBuildingPath, 'utf8');
    
    const seasonalFeatures = [
      'applySeasonalAdaptation',
      'adaptRecipeForSeason',
      'generateSeasonalIngredientSubstitutions',
      'generateSeasonalCookingMethodAdjustments',
      'calculateSeasonalScore'
    ];
    
    const missingFeatures = seasonalFeatures.filter(feature => !content.includes(feature));
    if (missingFeatures.length > 0) {
      return { success: false, error: `Missing seasonal features: ${missingFeatures.join(', ')}` };
    }
    
    return { success: true, features: seasonalFeatures.length };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function testSeasonalIntegration() {
  try {
    const recipeBuildingPath = join(__dirname, 'src', 'data', 'unified', 'recipeBuilding.ts');
    const content = fs.readFileSync(recipeBuildingPath, 'utf8');
    
    // Check integration with unified seasonal system
    if (!content.includes('this.seasonalSystem.getSeasonalRecommendations')) {
      return { success: false, error: 'Seasonal system integration not found' };
    }
    
    if (!content.includes('this.seasonalSystem.getCurrentSeason')) {
      return { success: false, error: 'Current season integration not found' };
    }
    
    return { success: true, integration: 'unified seasonal system' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ===== CUISINE INTEGRATION TESTS =====

function testCuisineIntegrationStructure() {
  try {
    const recipeBuildingPath = join(__dirname, 'src', 'data', 'unified', 'recipeBuilding.ts');
    const content = fs.readFileSync(recipeBuildingPath, 'utf8');
    
    const cuisineFeatures = [
      'applyCuisineIntegration',
      'calculateCuisineAuthenticity',
      'calculateFusionPotential',
      'generateCulturalNotes',
      'generateTraditionalVariations'
    ];
    
    const missingFeatures = cuisineFeatures.filter(feature => !content.includes(feature));
    if (missingFeatures.length > 0) {
      return { success: false, error: `Missing cuisine features: ${missingFeatures.join(', ')}` };
    }
    
    return { success: true, features: cuisineFeatures.length };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function testCuisineSystemIntegration() {
  try {
    const recipeBuildingPath = join(__dirname, 'src', 'data', 'unified', 'recipeBuilding.ts');
    const content = fs.readFileSync(recipeBuildingPath, 'utf8');
    
    // Check integration with unified cuisine system
    if (!content.includes('this.cuisineSystem.analyzeCuisineIngredients')) {
      return { success: false, error: 'Cuisine system integration not found' };
    }
    
    if (!content.includes('unifiedCuisineIntegrationSystem')) {
      return { success: false, error: 'Unified cuisine integration system import not found' };
    }
    
    return { success: true, integration: 'unified cuisine system' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ===== FUSION GENERATION TESTS =====

function testFusionRecipeStructure() {
  try {
    const recipeBuildingPath = join(__dirname, 'src', 'data', 'unified', 'recipeBuilding.ts');
    const content = fs.readFileSync(recipeBuildingPath, 'utf8');
    
    const fusionFeatures = [
      'generateFusionRecipe',
      'FusionRecipeProfile',
      'calculateFusionRatio',
      'categorizeFusionIngredients',
      'calculateCulturalHarmony',
      'calculateKalchmFusionBalance'
    ];
    
    const missingFeatures = fusionFeatures.filter(feature => !content.includes(feature));
    if (missingFeatures.length > 0) {
      return { success: false, error: `Missing fusion features: ${missingFeatures.join(', ')}` };
    }
    
    return { success: true, features: fusionFeatures.length };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function testFusionValidation() {
  try {
    const recipeBuildingPath = join(__dirname, 'src', 'data', 'unified', 'recipeBuilding.ts');
    const content = fs.readFileSync(recipeBuildingPath, 'utf8');
    
    // Check for fusion validation logic
    if (!content.includes('cuisines.length < 2')) {
      return { success: false, error: 'Fusion validation logic not found' };
    }
    
    if (!content.includes('Fusion recipes require at least 2 cuisines')) {
      return { success: false, error: 'Fusion error message not found' };
    }
    
    return { success: true, validation: 'fusion cuisine count validation' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ===== PLANETARY RECOMMENDATIONS TESTS =====

function testPlanetaryRecommendationStructure() {
  try {
    const recipeBuildingPath = join(__dirname, 'src', 'data', 'unified', 'recipeBuilding.ts');
    const content = fs.readFileSync(recipeBuildingPath, 'utf8');
    
    const planetaryFeatures = [
      'generatePlanetaryRecipeRecommendation',
      'PlanetaryRecipeRecommendation',
      'calculatePlanetaryAlignment',
      'calculateOptimalCookingTime',
      'calculateEnergeticProfile'
    ];
    
    const missingFeatures = planetaryFeatures.filter(feature => !content.includes(feature));
    if (missingFeatures.length > 0) {
      return { success: false, error: `Missing planetary features: ${missingFeatures.join(', ')}` };
    }
    
    return { success: true, features: planetaryFeatures.length };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function testAstrologicalIntegration() {
  try {
    const recipeBuildingPath = join(__dirname, 'src', 'data', 'unified', 'recipeBuilding.ts');
    const content = fs.readFileSync(recipeBuildingPath, 'utf8');
    
    const astrologicalTypes = [
      'PlanetName',
      'LunarPhase',
      'ZodiacSign',
      'currentPlanetaryHour',
      'lunarPhase',
      'zodiacSign'
    ];
    
    const missingTypes = astrologicalTypes.filter(type => !content.includes(type));
    if (missingTypes.length > 0) {
      return { success: false, error: `Missing astrological types: ${missingTypes.join(', ')}` };
    }
    
    return { success: true, types: astrologicalTypes.length };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ===== INTEGRATION TESTS =====

function testBackwardCompatibility() {
  try {
    const recipeBuildingPath = join(__dirname, 'src', 'data', 'unified', 'recipeBuilding.ts');
    const content = fs.readFileSync(recipeBuildingPath, 'utf8');
    
    const backwardCompatibilityFunctions = [
      'buildRecipe',
      'getSeasonalRecipeRecommendations',
      'getCuisineRecipeRecommendations'
    ];
    
    const missingFunctions = backwardCompatibilityFunctions.filter(func => !content.includes(func));
    if (missingFunctions.length > 0) {
      return { success: false, error: `Missing backward compatibility functions: ${missingFunctions.join(', ')}` };
    }
    
    return { success: true, functions: backwardCompatibilityFunctions.length };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function testConvenienceExports() {
  try {
    const recipeBuildingPath = join(__dirname, 'src', 'data', 'unified', 'recipeBuilding.ts');
    const content = fs.readFileSync(recipeBuildingPath, 'utf8');
    
    const convenienceExports = [
      'export function generateMonicaOptimizedRecipe',
      'export function adaptRecipeForSeason',
      'export function generateFusionRecipe',
      'export function generatePlanetaryRecipeRecommendation'
    ];
    
    const missingExports = convenienceExports.filter(exp => !content.includes(exp));
    if (missingExports.length > 0) {
      return { success: false, error: `Missing convenience exports: ${missingExports.join(', ')}` };
    }
    
    return { success: true, exports: convenienceExports.length };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function testSingletonPattern() {
  try {
    const recipeBuildingPath = join(__dirname, 'src', 'data', 'unified', 'recipeBuilding.ts');
    const content = fs.readFileSync(recipeBuildingPath, 'utf8');
    
    if (!content.includes('export const unifiedRecipeBuildingSystem = new UnifiedRecipeBuildingSystem()')) {
      return { success: false, error: 'Singleton instance not found' };
    }
    
    if (!content.includes('unifiedRecipeBuildingSystem.generateMonicaOptimizedRecipe')) {
      return { success: false, error: 'Singleton usage not found' };
    }
    
    return { success: true, pattern: 'singleton' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function testNutritionalOptimization() {
  try {
    const recipeBuildingPath = join(__dirname, 'src', 'data', 'unified', 'recipeBuilding.ts');
    const content = fs.readFileSync(recipeBuildingPath, 'utf8');
    
    const nutritionalFeatures = [
      'applyNutritionalOptimization',
      'categorizeNutrientsByAlchemy',
      'calculateElementalNutrition',
      'calculateKalchmNutritionalBalance',
      'calculateMonicaNutritionalHarmony'
    ];
    
    const missingFeatures = nutritionalFeatures.filter(feature => !content.includes(feature));
    if (missingFeatures.length > 0) {
      return { success: false, error: `Missing nutritional features: ${missingFeatures.join(', ')}` };
    }
    
    return { success: true, features: nutritionalFeatures.length };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ===== MAIN TEST EXECUTION =====

function runAllTests() {
  log('🚀 Starting Unified Recipe Building System Tests');
  log(`📋 Test Configuration: ${JSON.stringify(TEST_CONFIG, null, 2)}`);
  
  // Basic Functionality Tests
  if (TEST_CONFIG.testCategories.includes('basic_functionality')) {
    log('\n📦 Testing Basic Functionality...');
    runTest('Unified Recipe Building System Import', testUnifiedRecipeBuildingSystemImport);
    runTest('Recipe Building Interfaces', testRecipeBuildingInterfaces);
    runTest('System Integrations', testSystemIntegrations);
  }
  
  // Monica Optimization Tests
  if (TEST_CONFIG.testCategories.includes('monica_optimization')) {
    log('\n🔬 Testing Monica Optimization...');
    runTest('Monica Optimization Structure', testMonicaOptimizationStructure);
    runTest('Monica Optimization Interface', testMonicaOptimizationInterface);
  }
  
  // Seasonal Adaptation Tests
  if (TEST_CONFIG.testCategories.includes('seasonal_adaptation')) {
    log('\n🌱 Testing Seasonal Adaptation...');
    runTest('Seasonal Adaptation Structure', testSeasonalAdaptationStructure);
    runTest('Seasonal Integration', testSeasonalIntegration);
  }
  
  // Cuisine Integration Tests
  if (TEST_CONFIG.testCategories.includes('cuisine_integration')) {
    log('\n🍽️ Testing Cuisine Integration...');
    runTest('Cuisine Integration Structure', testCuisineIntegrationStructure);
    runTest('Cuisine System Integration', testCuisineSystemIntegration);
  }
  
  // Fusion Generation Tests
  if (TEST_CONFIG.testCategories.includes('fusion_generation')) {
    log('\n🌍 Testing Fusion Generation...');
    runTest('Fusion Recipe Structure', testFusionRecipeStructure);
    runTest('Fusion Validation', testFusionValidation);
  }
  
  // Planetary Recommendations Tests
  if (TEST_CONFIG.testCategories.includes('planetary_recommendations')) {
    log('\n🌟 Testing Planetary Recommendations...');
    runTest('Planetary Recommendation Structure', testPlanetaryRecommendationStructure);
    runTest('Astrological Integration', testAstrologicalIntegration);
  }
  
  // Integration Tests
  if (TEST_CONFIG.testCategories.includes('integration_tests')) {
    log('\n🔗 Testing Integration...');
    runTest('Backward Compatibility', testBackwardCompatibility);
    runTest('Convenience Exports', testConvenienceExports);
    runTest('Singleton Pattern', testSingletonPattern);
    runTest('Nutritional Optimization', testNutritionalOptimization);
  }
}

function generateTestReport() {
  const successRate = testResults.total > 0 ? (testResults.passed / testResults.total * 100).toFixed(1) : 0;
  
  log('\n📊 TEST RESULTS SUMMARY');
  log('═'.repeat(50));
  log(`Total Tests: ${testResults.total}`);
  log(`Passed: ${testResults.passed} ✅`);
  log(`Failed: ${testResults.failed} ❌`);
  log(`Success Rate: ${successRate}%`);
  
  if (testResults.errors.length > 0) {
    log('\n❌ ERRORS:');
    testResults.errors.forEach(error => {
      log(`  • ${error.test}: ${error.error}`);
    });
  }
  
  // Generate detailed report
  const report = {
    timestamp: new Date().toISOString(),
    testConfig: TEST_CONFIG,
    summary: {
      total: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      successRate: parseFloat(successRate)
    },
    details: testResults.details,
    errors: testResults.errors
  };
  
  // Save report to file
  const reportPath = join(__dirname, 'test-output', 'unified-recipe-building-test-report.json');
  try {
    // Ensure test-output directory exists
    const testOutputDir = join(__dirname, 'test-output');
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    log(`\n📄 Detailed report saved to: ${reportPath}`);
  } catch (error) {
    log(`❌ Failed to save report: ${error.message}`, 'error');
  }
  
  return report;
}

// ===== EXECUTION =====

if (TEST_CONFIG.dryRun) {
  log('🧪 DRY RUN MODE - Testing unified recipe building system structure and interfaces');
}

try {
  runAllTests();
  const report = generateTestReport();
  
  if (testResults.failed === 0) {
    log('\n🎉 ALL TESTS PASSED! Unified Recipe Building System is ready for integration.', 'success');
    process.exit(0);
  } else {
    log(`\n⚠️ ${testResults.failed} test(s) failed. Please review and fix issues before proceeding.`, 'error');
    process.exit(1);
  }
} catch (error) {
  log(`💥 Test execution failed: ${error.message}`, 'error');
  process.exit(1);
} 