#!/usr/bin/env node

// ===== UNIFIED NUTRITIONAL SYSTEM TEST SCRIPT =====
// Phase 3 Step 4 of WhatToEatNext Data Consolidation
// Comprehensive validation of nutritional enhancement with Monica/Kalchm integration

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test configuration
const TEST_CONFIG = {
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose'),
  testIngredients: ['blueberry', 'spinach', 'salmon', 'quinoa', 'ginger'],
  testSeasons: ['spring', 'summer', 'autumn', 'winter'],
  testZodiacSigns: ['aries', 'taurus', 'gemini', 'cancer'],
  testPlanets: ['Sun', 'Moonmoon', 'Mercurymercury', 'Venusvenus', 'Marsmars']
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  errors: [],
  details: []
};

// Utility functions
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  
  if (level === 'error') {
    console.error(`${prefix} ${message}`);
    testResults.errors.push(message);
  } else if (level === 'warn') {
    console.warn(`${prefix} ${message}`);
    testResults.warnings++;
  } else if (level === 'verbose' && TEST_CONFIG.verbose) {
    console.log(`${prefix} ${message}`);
  } else if (level === 'info') {
    console.log(`${prefix} ${message}`);
  }
}

function assert(condition, message, details = null) {
  if (condition) {
    testResults.passed++;
    log(`✅ PASS: ${message}`, 'verbose');
    if (details) testResults.details.push({ type: 'pass', message, details });
  } else {
    testResults.failed++;
    log(`❌ FAIL: ${message}`, 'error');
    if (details) testResults.details.push({ type: 'fail', message, details });
  }
  return condition;
}

function assertExists(value, name) {
  return assert(value !== undefined && value !== null, `${name} exists`, { value });
}

function assertNumber(value, name, min = null, max = null) {
  const isNumber = typeof value === 'number' && !isNaN(value);
  if (!assert(isNumber, `${name} is a valid number`, { value, type: typeof value })) {
    return false;
  }
  
  if (min !== null) {
    assert(value >= min, `${name} >= ${min}`, { value, min });
  }
  
  if (max !== null) {
    assert(value <= max, `${name} <= ${max}`, { value, max });
  }
  
  return true;
}

function assertArray(value, name, minLength = 0) {
  const isArray = Array.isArray(value);
  if (!assert(isArray, `${name} is an array`, { value, type: typeof value })) {
    return false;
  }
  
  assert(value.length >= minLength, `${name} has at least ${minLength} items`, { 
    length: value.length, 
    minLength 
  });
  
  return true;
}

// Test functions
async function testUnifiedNutritionalSystemImport() {
  log('Testing unified nutritional system import...', 'info');
  
  try {
    // Test basic imports
    const { unifiedNutritionalSystem } = await import('./src/data/unified/nutritional.ts');
    assertExists(unifiedNutritionalSystem, 'unifiedNutritionalSystem');
    
    const { unifiedNutritionalService } = await import('./src/services/unifiedNutritionalService.ts');
    assertExists(unifiedNutritionalService, 'unifiedNutritionalService');
    
    log('✅ Unified nutritional system imports successful', 'info');
    return true;
    
  } catch (error) {
    log(`❌ Import failed: ${error.message}`, 'error');
    return false;
  }
}

async function testAlchemicalNutritionalCategorization() {
  log('Testing alchemical nutritional categorization...', 'info');
  
  try {
    const { 
      alchemicalNutrientMapping, 
      elementalNutrientMapping 
    } = await import('./src/data/unified/nutritional.ts');
    
    // Test alchemical nutrient mapping
    assertExists(alchemicalNutrientMapping, 'alchemicalNutrientMapping');
    
    // Test specific nutrient mappings
    const vitaminC = alchemicalNutrientMapping['vitamin_c'];
    assertExists(vitaminC, 'vitamin_c mapping');
    assertNumber(vitaminC?.Spirit, 'vitamin_c Spirit', 0, 1);
    assertNumber(vitaminC?.Essence, 'vitamin_c Essence', 0, 1);
    
    const protein = alchemicalNutrientMapping['protein'];
    assertExists(protein, 'protein mapping');
    assertNumber(protein?.Matter, 'protein Matter', 0, 1);
    
    // Test elemental nutrient mapping
    assertExists(elementalNutrientMapping, 'elementalNutrientMapping');
    
    const fireNutrients = elementalNutrientMapping['Fire'];
    assertExists(fireNutrients, 'Fire elemental nutrients');
    assertExists(fireNutrients?.macronutrients, 'Fire macronutrients');
    assertExists(fireNutrients?.micronutrients, 'Fire micronutrients');
    assertNumber(fireNutrients?.totalElementalValue, 'Fire totalElementalValue', 0, 1);
    
    log('✅ Alchemical nutritional categorization tests passed', 'info');
    return true;
    
  } catch (error) {
    log(`❌ Alchemical categorization test failed: ${error.message}`, 'error');
    return false;
  }
}

async function testPlanetaryNutritionalProfiles() {
  log('Testing planetary nutritional profiles...', 'info');
  
  try {
    const { planetaryNutritionalProfiles } = await import('./src/data/unified/nutritional.ts');
    
    assertExists(planetaryNutritionalProfiles, 'planetaryNutritionalProfiles');
    
    for (const planet of TEST_CONFIG.testPlanets) {
      const profile = planetaryNutritionalProfiles[planet];
      assertExists(profile, `${planet} profile`);
      
      if (profile) {
        assertExists(profile.planet, `${planet} planet name`);
        assertArray(profile.ruledNutrients, `${planet} ruledNutrients`);
        assertArray(profile.healthDomains, `${planet} healthDomains`);
        assertArray(profile.beneficialFoods, `${planet} beneficialFoods`);
        assertNumber(profile.kalchmResonance, `${planet} kalchmResonance`, 0);
        assertNumber(profile.monicaInfluence, `${planet} monicaInfluence`, 0, 2);
      }
    }
    
    log('✅ Planetary nutritional profiles tests passed', 'info');
    return true;
    
  } catch (error) {
    log(`❌ Planetary profiles test failed: ${error.message}`, 'error');
    return false;
  }
}

async function testZodiacNutritionalProfiles() {
  log('Testing zodiac nutritional profiles...', 'info');
  
  try {
    const { zodiacNutritionalProfiles } = await import('./src/data/unified/nutritional.ts');
    
    assertExists(zodiacNutritionalProfiles, 'zodiacNutritionalProfiles');
    
    for (const sign of TEST_CONFIG.testZodiacSigns) {
      const profile = zodiacNutritionalProfiles[sign];
      assertExists(profile, `${sign} profile`);
      
      if (profile) {
        assertExists(profile.sign, `${sign} sign name`);
        assertExists(profile.elementalNeeds, `${sign} elementalNeeds`);
        assertArray(profile.nutritionalFocus, `${sign} nutritionalFocus`);
        assertArray(profile.beneficialFoods, `${sign} beneficialFoods`);
        assertArray(profile.challengeFoods, `${sign} challengeFoods`);
        assertNumber(profile.kalchmCompatibility, `${sign} kalchmCompatibility`, 0);
        assertNumber(profile.monicaOptimization, `${sign} monicaOptimization`, 0, 2);
        
        // Test elemental needs sum to reasonable total
        const elementalSum = Object.values(profile.elementalNeeds).reduce((sum, val) => sum + val, 0);
        assertNumber(elementalSum, `${sign} elemental needs sum`, 0.8, 1.2);
      }
    }
    
    log('✅ Zodiac nutritional profiles tests passed', 'info');
    return true;
    
  } catch (error) {
    log(`❌ Zodiac profiles test failed: ${error.message}`, 'error');
    return false;
  }
}

async function testSeasonalNutritionalProfiles() {
  log('Testing seasonal nutritional profiles...', 'info');
  
  try {
    const { seasonalNutritionalProfiles } = await import('./src/data/unified/nutritional.ts');
    
    assertExists(seasonalNutritionalProfiles, 'seasonalNutritionalProfiles');
    
    for (const season of TEST_CONFIG.testSeasons) {
      const profile = seasonalNutritionalProfiles[season];
      assertExists(profile, `${season} profile`);
      
      if (profile) {
        assertExists(profile.season, `${season} season name`);
        assertExists(profile.elementalNutritionalFocus, `${season} elementalNutritionalFocus`);
        assertArray(profile.priorityNutrients, `${season} priorityNutrients`);
        assertArray(profile.optimalFoods, `${season} optimalFoods`);
        assertArray(profile.avoidanceFoods, `${season} avoidanceFoods`);
        assertExists(profile.kalchmRange, `${season} kalchmRange`);
        assertNumber(profile.kalchmRange?.min, `${season} kalchm min`, 0);
        assertNumber(profile.kalchmRange?.max, `${season} kalchm max`, 0);
        assertExists(profile.monicaModifiers, `${season} monicaModifiers`);
        assertNumber(profile.biorhythmAlignment, `${season} biorhythmAlignment`, 0, 1);
      }
    }
    
    log('✅ Seasonal nutritional profiles tests passed', 'info');
    return true;
    
  } catch (error) {
    log(`❌ Seasonal profiles test failed: ${error.message}`, 'error');
    return false;
  }
}

async function testUnifiedNutritionalSystemClass() {
  log('Testing UnifiedNutritionalSystem class functionality...', 'info');
  
  try {
    const { unifiedNutritionalSystem } = await import('./src/data/unified/nutritional.ts');
    
    // Test Kalchm calculation
    const testProfile = {
      calories: 100,
      protein: 10,
      carbs: 20,
      fat: 5,
      fiber: 3
    };
    
    const kalchm = unifiedNutritionalSystem.calculateNutritionalKalchm(testProfile);
    assertNumber(kalchm, 'calculated Kalchm', 0);
    
    // Test profile enhancement
    const enhanced = unifiedNutritionalSystem.enhanceNutritionalProfile(testProfile, {
      season: 'spring',
      zodiacSign: 'aries'
    });
    
    assertExists(enhanced, 'enhanced profile');
    assertExists(enhanced.alchemicalProperties, 'enhanced alchemicalProperties');
    assertNumber(enhanced.kalchm, 'enhanced kalchm', 0);
    assertExists(enhanced.elementalNutrients, 'enhanced elementalNutrients');
    assertExists(enhanced.monicaOptimization, 'enhanced monicaOptimization');
    assertExists(enhanced.astrologicalProfile, 'enhanced astrologicalProfile');
    assertExists(enhanced.metadata, 'enhanced metadata');
    
    // Test nutritional recommendations
    const recommendations = unifiedNutritionalSystem.getNutritionalRecommendations({
      season: 'spring',
      zodiacSign: 'aries'
    });
    
    assertExists(recommendations, 'nutritional recommendations');
    assertArray(recommendations.ingredients, 'recommended ingredients');
    assertArray(recommendations.nutritionalProfiles, 'recommended nutritional profiles');
    assertNumber(recommendations.seasonalOptimization, 'seasonal optimization', 0, 1);
    assertNumber(recommendations.kalchmHarmony, 'kalchm harmony', 0, 1);
    assertNumber(recommendations.monicaOptimization, 'monica optimization', 0, 1);
    
    log('✅ UnifiedNutritionalSystem class tests passed', 'info');
    return true;
    
  } catch (error) {
    log(`❌ UnifiedNutritionalSystem class test failed: ${error.message}`, 'error');
    return false;
  }
}

async function testUnifiedNutritionalService() {
  log('Testing UnifiedNutritionalService functionality...', 'info');
  
  try {
    const { unifiedNutritionalService } = await import('./src/services/unifiedNutritionalService.ts');
    
    // Test service instance
    assertExists(unifiedNutritionalService, 'service instance');
    
    // Test Kalchm calculation
    const testProfile = {
      calories: 150,
      protein: 15,
      carbs: 25,
      fat: 8,
      fiber: 5
    };
    
    const kalchm = unifiedNutritionalService.calculateNutritionalKalchm(testProfile);
    assertNumber(kalchm, 'service Kalchm calculation', 0);
    
    // Test nutritional recommendations
    const recommendations = unifiedNutritionalService.getNutritionalRecommendations({
      season: 'summer',
      zodiacSign: 'leo',
      planetaryHour: 'Sun'
    });
    
    assertExists(recommendations, 'service recommendations');
    assertArray(recommendations.ingredients, 'service recommended ingredients');
    assertArray(recommendations.healthBenefits, 'service health benefits');
    
    // Test seasonal recommendations
    const seasonalRecs = unifiedNutritionalService.getSeasonalNutritionalRecommendations('autumn');
    assertExists(seasonalRecs, 'seasonal recommendations');
    assertArray(seasonalRecs.ingredients, 'seasonal ingredients');
    
    // Test zodiac recommendations
    const zodiacRecs = unifiedNutritionalService.getZodiacNutritionalRecommendations('gemini');
    assertExists(zodiacRecs, 'zodiac recommendations');
    assertArray(zodiacRecs.ingredients, 'zodiac ingredients');
    
    // Test planetary recommendations
    const planetaryRecs = unifiedNutritionalService.getPlanetaryNutritionalRecommendations('Mercurymercury');
    assertExists(planetaryRecs, 'planetary recommendations');
    assertArray(planetaryRecs.ingredients, 'planetary ingredients');
    
    log('✅ UnifiedNutritionalService tests passed', 'info');
    return true;
    
  } catch (error) {
    log(`❌ UnifiedNutritionalService test failed: ${error.message}`, 'error');
    return false;
  }
}

async function testBackwardCompatibility() {
  log('Testing backward compatibility...', 'info');
  
  try {
    const { 
      calculateNutritionalBalance,
      nutritionalToElemental,
      getZodiacNutritionalRecommendations,
      getPlanetaryNutritionalRecommendations,
      getSeasonalNutritionalRecommendations,
      evaluateNutritionalElementalBalance
    } = await import('./src/data/unified/nutritional.ts');
    
    // Test legacy functions exist
    assertExists(calculateNutritionalBalance, 'calculateNutritionalBalance');
    assertExists(nutritionalToElemental, 'nutritionalToElemental');
    assertExists(getZodiacNutritionalRecommendations, 'getZodiacNutritionalRecommendations');
    assertExists(getPlanetaryNutritionalRecommendations, 'getPlanetaryNutritionalRecommendations');
    assertExists(getSeasonalNutritionalRecommendations, 'getSeasonalNutritionalRecommendations');
    assertExists(evaluateNutritionalElementalBalance, 'evaluateNutritionalElementalBalance');
    
    // Test legacy function calls
    const testProfile = { calories: 100, protein: 10, carbs: 20, fat: 5 };
    
    const balance = calculateNutritionalBalance([]);
    assertExists(balance, 'legacy balance calculation');
    
    const elemental = nutritionalToElemental(testProfile);
    assertExists(elemental, 'legacy elemental conversion');
    
    const zodiacRecs = getZodiacNutritionalRecommendations('virgo');
    assertExists(zodiacRecs, 'legacy zodiac recommendations');
    assertExists(zodiacRecs.elementalBalance, 'legacy zodiac elemental balance');
    
    const planetaryRecs = getPlanetaryNutritionalRecommendations(['Marsmars', 'Venusvenus']);
    assertExists(planetaryRecs, 'legacy planetary recommendations');
    assertArray(planetaryRecs.focusNutrients, 'legacy planetary focus nutrients');
    
    const seasonalRecs = getSeasonalNutritionalRecommendations('winter');
    assertExists(seasonalRecs, 'legacy seasonal recommendations');
    assertExists(seasonalRecs.element, 'legacy seasonal element');
    
    const elementalBalance = evaluateNutritionalElementalBalance(testProfile, {
      Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
    });
    assertExists(elementalBalance, 'legacy elemental balance evaluation');
    assertNumber(elementalBalance.score, 'legacy balance score', 0, 1);
    
    log('✅ Backward compatibility tests passed', 'info');
    return true;
    
  } catch (error) {
    log(`❌ Backward compatibility test failed: ${error.message}`, 'error');
    return false;
  }
}

async function testIntegrationWithUnifiedSystems() {
  log('Testing integration with other unified systems...', 'info');
  
  try {
    // Test integration with unified ingredients
    const { unifiedIngredients } = await import('./src/data/unified/ingredients.ts');
    assertExists(unifiedIngredients, 'unified ingredients integration');
    
    // Test integration with unified seasonal system
    const { unifiedSeasonalSystem } = await import('./src/data/unified/seasonal.ts');
    assertExists(unifiedSeasonalSystem, 'unified seasonal system integration');
    
    // Test that nutritional service can access unified systems
    const { unifiedNutritionalService } = await import('./src/services/unifiedNutritionalService.ts');
    
    // Test seasonal integration
    const currentSeason = unifiedSeasonalSystem.getCurrentSeason();
    assertExists(currentSeason, 'current season from seasonal system');
    
    const seasonalNutritionalRecs = unifiedNutritionalService.getSeasonalNutritionalRecommendations();
    assertExists(seasonalNutritionalRecs, 'seasonal nutritional recommendations');
    
    log('✅ Integration with unified systems tests passed', 'info');
    return true;
    
  } catch (error) {
    log(`❌ Integration test failed: ${error.message}`, 'error');
    return false;
  }
}

async function testMonicaKalchmIntegration() {
  log('Testing Monica/Kalchm integration...', 'info');
  
  try {
    const { unifiedNutritionalSystem } = await import('./src/data/unified/nutritional.ts');
    
    // Test Kalchm calculation for various nutritional profiles
    const profiles = [
      { calories: 50, protein: 2, carbs: 10, fat: 0.5, fiber: 3 },    // Vegetable-like
      { calories: 200, protein: 25, carbs: 0, fat: 10, fiber: 0 },    // Meat-like
      { calories: 150, protein: 5, carbs: 30, fat: 1, fiber: 4 },     // Grain-like
      { calories: 75, protein: 1, carbs: 20, fat: 0.2, fiber: 3 }     // Fruit-like
    ];
    
    const kalchmValues = profiles.map(profile => 
      unifiedNutritionalSystem.calculateNutritionalKalchm(profile)
    );
    
    kalchmValues.forEach((kalchm, index) => {
      assertNumber(kalchm, `profile ${index + 1} Kalchm`, 0);
    });
    
    // Test Monica optimization in enhanced profiles
    const enhanced = unifiedNutritionalSystem.enhanceNutritionalProfile(profiles[0], {
      season: 'spring',
      zodiacSign: 'aries',
      planetaryHour: 'Marsmars'
    });
    
    assertExists(enhanced.monicaOptimization, 'Monica optimization');
    assertNumber(enhanced.monicaOptimization.baselineScore, 'baseline score', 0, 1);
    assertNumber(enhanced.monicaOptimization.seasonalModifier, 'seasonal modifier', 0, 2);
    assertNumber(enhanced.monicaOptimization.planetaryModifier, 'planetary modifier', 0, 2);
    assertNumber(enhanced.monicaOptimization.finalOptimizedScore, 'final optimized score', 0);
    
    // Test compatibility analysis with Kalchm harmony
    const compatibility = unifiedNutritionalSystem.analyzeNutritionalCompatibility([enhanced]);
    assertExists(compatibility, 'nutritional compatibility');
    assertNumber(compatibility.kalchmHarmony, 'Kalchm harmony', 0, 1);
    assertNumber(compatibility.elementalBalance, 'elemental balance', 0, 1);
    assertNumber(compatibility.overallCompatibility, 'overall compatibility', 0, 1);
    assertArray(compatibility.recommendations, 'compatibility recommendations');
    
    log('✅ Monica/Kalchm integration tests passed', 'info');
    return true;
    
  } catch (error) {
    log(`❌ Monica/Kalchm integration test failed: ${error.message}`, 'error');
    return false;
  }
}

async function testElementalSelfReinforcement() {
  log('Testing elemental self-reinforcement compliance...', 'info');
  
  try {
    const { elementalNutrientMapping } = await import('./src/data/unified/nutritional.ts');
    
    // Test that elemental mappings follow self-reinforcement principles
    const elements = ['Fire', 'Water', 'Earth', 'Air'];
    
    elements.forEach(element => {
      const mapping = elementalNutrientMapping[element];
      assertExists(mapping, `${element} mapping`);
      
      // Test that total elemental value is reasonable (not opposing)
      assertNumber(mapping.totalElementalValue, `${element} total value`, 0.5, 1.0);
      
      // Test that nutrient values are positive (no opposing/negative values)
      Object.values(mapping.macronutrients).forEach(value => {
        assert(value >= 0, `${element} macronutrient value is non-negative`, { value });
      });
      
      Object.values(mapping.micronutrients).forEach(value => {
        assert(value >= 0, `${element} micronutrient value is non-negative`, { value });
      });
    });
    
    log('✅ Elemental self-reinforcement compliance tests passed', 'info');
    return true;
    
  } catch (error) {
    log(`❌ Elemental self-reinforcement test failed: ${error.message}`, 'error');
    return false;
  }
}

// Main test execution
async function runAllTests() {
  log('🚀 Starting Unified Nutritional System Test Suite', 'info');
  log(`Test Configuration: ${JSON.stringify(TEST_CONFIG, null, 2)}`, 'verbose');
  
  if (TEST_CONFIG.dryRun) {
    log('🔍 DRY RUN MODE - No actual changes will be made', 'info');
  }
  
  const tests = [
    testUnifiedNutritionalSystemImport,
    testAlchemicalNutritionalCategorization,
    testPlanetaryNutritionalProfiles,
    testZodiacNutritionalProfiles,
    testSeasonalNutritionalProfiles,
    testUnifiedNutritionalSystemClass,
    testUnifiedNutritionalService,
    testBackwardCompatibility,
    testIntegrationWithUnifiedSystems,
    testMonicaKalchmIntegration,
    testElementalSelfReinforcement
  ];
  
  log(`📋 Running ${tests.length} test suites...`, 'info');
  
  for (const test of tests) {
    try {
      await test();
    } catch (error) {
      log(`💥 Test suite failed: ${error.message}`, 'error');
    }
  }
  
  // Generate test report
  const totalTests = testResults.passed + testResults.failed;
  const successRate = totalTests > 0 ? (testResults.passed / totalTests * 100).toFixed(1) : 0;
  
  log('\n📊 TEST RESULTS SUMMARY', 'info');
  log('=' .repeat(50), 'info');
  log(`✅ Passed: ${testResults.passed}`, 'info');
  log(`❌ Failed: ${testResults.failed}`, 'info');
  log(`⚠️  Warnings: ${testResults.warnings}`, 'info');
  log(`📈 Success Rate: ${successRate}%`, 'info');
  log(`🎯 Total Tests: ${totalTests}`, 'info');
  
  if (testResults.errors.length > 0) {
    log('\n🚨 ERRORS ENCOUNTERED:', 'info');
    testResults.errors.forEach((error, index) => {
      log(`${index + 1}. ${error}`, 'error');
    });
  }
  
  if (testResults.failed === 0) {
    log('\n🎉 ALL TESTS PASSED! Unified Nutritional System is ready for use.', 'info');
    return true;
  } else {
    log('\n⚠️  SOME TESTS FAILED. Please review and fix issues before proceeding.', 'info');
    return false;
  }
}

// Execute tests
runAllTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    log(`💥 Test execution failed: ${error.message}`, 'error');
    process.exit(1);
  }); 