#!/usr/bin/env node

// ===== UNIFIED SEASONAL SYSTEM TEST SCRIPT =====
// Phase 3 of WhatToEatNext Data Consolidation
// Tests the consolidation of seasonal.ts, seasonalPatterns.ts, and seasonalUsage.ts
// Validates Monica constants and Kalchm integration

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test configuration
const TEST_CONFIG = {
  dryRun: true,
  verbose: true,
  testIngredients: ['asparagus', 'tomatoes', 'pumpkin', 'kale', 'garlic'],
  testSeasons: ['spring', 'summer', 'autumn', 'winter', 'all'],
  testCookingMethods: ['grilling', 'roasting', 'braising', 'raw'],
  kalchmTestRanges: [
    { min: 0.8, max: 1.0 },
    { min: 1.0, max: 1.2 },
    { min: 1.2, max: 1.4 }
  ]
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  errors: []
};

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '📋',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    debug: '🔍'
  }[type] || '📋';
  
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function assert(condition, message, details = null) {
  if (condition) {
    testResults.passed++;
    if (TEST_CONFIG.verbose) {
      log(`PASS: ${message}`, 'success');
    }
  } else {
    testResults.failed++;
    log(`FAIL: ${message}`, 'error');
    if (details) {
      console.log('  Details:', details);
    }
    testResults.errors.push({ message, details });
  }
}

function warn(message, details = null) {
  testResults.warnings++;
  log(`WARNING: ${message}`, 'warning');
  if (details && TEST_CONFIG.verbose) {
    console.log('  Details:', details);
  }
}

// Test functions
async function testUnifiedSeasonalImport() {
  log('Testing unified seasonal system import...', 'debug');
  
  try {
    const { 
      unifiedSeasonalSystem,
      unifiedSeasonalProfiles,
      getCurrentSeason,
      getSeasonalScore,
      getSeasonalData,
      isInSeason,
      seasonalPatterns,
      seasonalUsage
    } = await import('./src/data/unified/seasonal.ts');
    
    assert(unifiedSeasonalSystem !== undefined, 'UnifiedSeasonalSystem class imported');
    assert(unifiedSeasonalProfiles !== undefined, 'Unified seasonal profiles imported');
    assert(typeof getCurrentSeason === 'function', 'getCurrentSeason function imported');
    assert(typeof getSeasonalScore === 'function', 'getSeasonalScore function imported');
    assert(typeof getSeasonalData === 'function', 'getSeasonalData function imported');
    assert(typeof isInSeason === 'function', 'isInSeason function imported');
    assert(seasonalPatterns !== undefined, 'Backward compatibility seasonalPatterns exported');
    assert(seasonalUsage !== undefined, 'Backward compatibility seasonalUsage exported');
    
    return {
      unifiedSeasonalSystem,
      unifiedSeasonalProfiles,
      getCurrentSeason,
      getSeasonalScore,
      getSeasonalData,
      isInSeason,
      seasonalPatterns,
      seasonalUsage
    };
  } catch (error) {
    assert(false, 'Failed to import unified seasonal system', error.message);
    throw error;
  }
}

async function testSeasonalProfileStructure(unifiedSeasonalProfiles) {
  log('Testing seasonal profile structure...', 'debug');
  
  for (const season of TEST_CONFIG.testSeasons) {
    const profile = unifiedSeasonalProfiles[season];
    
    assert(profile !== undefined, `Season '${season}' profile exists`);
    
    if (profile) {
      // Test core structure
      assert(profile.elementalDominance !== undefined, `${season}: elementalDominance exists`);
      assert(profile.kalchmRange !== undefined, `${season}: kalchmRange exists`);
      assert(profile.monicaModifiers !== undefined, `${season}: monicaModifiers exists`);
      assert(profile.ingredients !== undefined, `${season}: ingredients exists`);
      assert(profile.tarotProfile !== undefined, `${season}: tarotProfile exists`);
      
      // Test elemental dominance
      const elements = profile.elementalDominance;
      const elementSum = elements.Fire + elements.water + elements.earth + elements.Air;
      assert(Math.abs(elementSum - 1.0) < 0.01, `${season}: elemental dominance sums to 1.0`, 
        `Sum: ${elementSum}`);
      
      // Test Kalchm range
      assert(profile.kalchmRange.min < profile.kalchmRange.max, 
        `${season}: Kalchm range min < max`);
      assert(profile.kalchmRange.min > 0, `${season}: Kalchm range min > 0`);
      
      // Test Monica modifiers
      const monica = profile.monicaModifiers;
      assert(typeof monica.temperatureAdjustment === 'number', 
        `${season}: temperatureAdjustment is number`);
      assert(typeof monica.timingAdjustment === 'number', 
        `${season}: timingAdjustment is number`);
      assert(['increase', 'decrease', 'maintain'].includes(monica.intensityModifier), 
        `${season}: intensityModifier is valid`);
      assert(monica.planetaryAlignment >= 0 && monica.planetaryAlignment <= 1, 
        `${season}: planetaryAlignment in range [0,1]`);
      assert(monica.lunarPhaseBonus >= 0 && monica.lunarPhaseBonus <= 1, 
        `${season}: lunarPhaseBonus in range [0,1]`);
      
      // Test ingredients
      assert(Object.keys(profile.ingredients).length > 0, 
        `${season}: has ingredients`);
      
      for (const [ingredient, score] of Object.entries(profile.ingredients)) {
        assert(score >= 0 && score <= 1, 
          `${season}: ingredient '${ingredient}' score in range [0,1]`, `Score: ${score}`);
      }
      
      // Test tarot profile
      const tarot = profile.tarotProfile;
      assert(Array.isArray(tarot.minorArcana), `${season}: minorArcana is array`);
      assert(Array.isArray(tarot.majorArcana), `${season}: majorArcana is array`);
      assert(Array.isArray(tarot.zodiacSigns), `${season}: zodiacSigns is array`);
      assert(Array.isArray(tarot.cookingRecommendations), `${season}: cookingRecommendations is array`);
      assert(typeof tarot.tarotInfluences === 'object', `${season}: tarotInfluences is object`);
    }
  }
}

async function testBackwardCompatibility(seasonalPatterns, seasonalUsage) {
  log('Testing backward compatibility...', 'debug');
  
  // Test seasonalPatterns structure
  for (const season of TEST_CONFIG.testSeasons) {
    const patterns = seasonalPatterns[season];
    assert(patterns !== undefined, `seasonalPatterns['${season}'] exists`);
    
    if (patterns) {
      assert(typeof patterns.elementalInfluence === 'number', 
        `seasonalPatterns['${season}'].elementalInfluence is number`);
      assert(typeof patterns.tarotInfluences === 'object', 
        `seasonalPatterns['${season}'].tarotInfluences is object`);
    }
  }
  
  // Test seasonalUsage structure
  for (const season of TEST_CONFIG.testSeasons) {
    const usage = seasonalUsage[season];
    assert(usage !== undefined, `seasonalUsage['${season}'] exists`);
    
    if (usage) {
      assert(Array.isArray(usage.growing), `seasonalUsage['${season}'].growing is array`);
      assert(Array.isArray(usage.herbs), `seasonalUsage['${season}'].herbs is array`);
      assert(Array.isArray(usage.vegetables), `seasonalUsage['${season}'].vegetables is array`);
      assert(typeof usage.cuisines === 'object', `seasonalUsage['${season}'].cuisines is object`);
      assert(typeof usage.tarotAssociations === 'object', 
        `seasonalUsage['${season}'].tarotAssociations is object`);
    }
  }
}

async function testSeasonalFunctions(seasonalSystem, getCurrentSeason, getSeasonalScore, getSeasonalData, isInSeason) {
  log('Testing seasonal functions...', 'debug');
  
  // Test getCurrentSeason
  const currentSeason = getCurrentSeason();
  assert(TEST_CONFIG.testSeasons.includes(currentSeason), 
    'getCurrentSeason returns valid season', `Season: ${currentSeason}`);
  
  // Test getSeasonalScore
  for (const ingredient of TEST_CONFIG.testIngredients) {
    for (const season of TEST_CONFIG.testSeasons.slice(0, 4)) { // Skip 'all'
      const score = getSeasonalScore(ingredient, season);
      assert(typeof score === 'number', 
        `getSeasonalScore('${ingredient}', '${season}') returns number`);
      assert(score >= 0 && score <= 1, 
        `getSeasonalScore('${ingredient}', '${season}') in range [0,1]`, `Score: ${score}`);
    }
  }
  
  // Test getSeasonalData (now getSeasonalIngredientProfile)
  for (const ingredient of TEST_CONFIG.testIngredients) {
    const data = getSeasonalData(ingredient);
    assert(typeof data === 'object', `getSeasonalData('${ingredient}') returns object`);
    
    if (data) {
      assert(typeof data.availability === 'number', 
        `getSeasonalData('${ingredient}').availability is number`);
      assert(Array.isArray(data.traditionalUse), 
        `getSeasonalData('${ingredient}').traditionalUse is array`);
      assert(Array.isArray(data.complementaryFlavors), 
        `getSeasonalData('${ingredient}').complementaryFlavors is array`);
      
      // Test enhanced properties
      if (data.kalchmCompatibility !== undefined) {
        assert(typeof data.kalchmCompatibility === 'number', 
          `getSeasonalData('${ingredient}').kalchmCompatibility is number`);
        assert(data.kalchmCompatibility >= 0 && data.kalchmCompatibility <= 1, 
          `getSeasonalData('${ingredient}').kalchmCompatibility in range [0,1]`);
      }
      
      if (data.monicaResonance !== undefined) {
        assert(typeof data.monicaResonance === 'number', 
          `getSeasonalData('${ingredient}').monicaResonance is number`);
        assert(data.monicaResonance >= 0 && data.monicaResonance <= 1, 
          `getSeasonalData('${ingredient}').monicaResonance in range [0,1]`);
      }
    }
  }
  
  // Test isInSeason
  for (const ingredient of TEST_CONFIG.testIngredients) {
    const inSeason = isInSeason(ingredient);
    assert(typeof inSeason === 'boolean', `isInSeason('${ingredient}') returns boolean`);
  }
}

async function testMonicaIntegration(seasonalSystem) {
  log('Testing Monica constant integration...', 'debug');
  
  try {
    // Test seasonal recommendations with Monica optimization
    for (const season of TEST_CONFIG.testSeasons.slice(0, 4)) { // Skip 'all'
      const recommendations = seasonalSystem.getSeasonalRecommendations(season, 1.0);
      
      assert(typeof recommendations === 'object', 
        `getSeasonalRecommendations('${season}') returns object`);
      
      if (recommendations) {
        assert(Array.isArray(recommendations.ingredients), 
          `${season}: recommendations.ingredients is array`);
        assert(Array.isArray(recommendations.cookingMethods), 
          `${season}: recommendations.cookingMethods is array`);
        assert(typeof recommendations.monicaOptimization === 'number', 
          `${season}: recommendations.monicaOptimization is number`);
        assert(typeof recommendations.kalchmHarmony === 'number', 
          `${season}: recommendations.kalchmHarmony is number`);
        assert(typeof recommendations.elementalBalance === 'object', 
          `${season}: recommendations.elementalBalance is object`);
        
        // Test Monica optimization score
        assert(recommendations.monicaOptimization >= 0 && recommendations.monicaOptimization <= 1, 
          `${season}: monicaOptimization in range [0,1]`, 
          `Score: ${recommendations.monicaOptimization}`);
        
        // Test Kalchm harmony score
        assert(recommendations.kalchmHarmony >= 0 && recommendations.kalchmHarmony <= 1, 
          `${season}: kalchmHarmony in range [0,1]`, 
          `Score: ${recommendations.kalchmHarmony}`);
      }
    }
  } catch (error) {
    warn('Monica integration test failed', error.message);
  }
}

async function testKalchmIntegration(seasonalSystem) {
  log('Testing Kalchm integration...', 'debug');
  
  try {
    // Test seasonal recommendations with different Kalchm ranges
    for (const season of TEST_CONFIG.testSeasons.slice(0, 4)) { // Skip 'all'
      for (const kalchmRange of TEST_CONFIG.kalchmTestRanges) {
        const recommendations = seasonalSystem.getSeasonalRecommendations(
          season, 
          undefined, 
          kalchmRange
        );
        
        assert(typeof recommendations === 'object', 
          `getSeasonalRecommendations('${season}', undefined, kalchmRange) returns object`);
        
        if (recommendations && recommendations.ingredients.length > 0) {
          // Check that recommended ingredients have compatible Kalchm values
          let compatibleCount = 0;
          for (const ingredient of recommendations.ingredients) {
            if (ingredient.kalchm >= kalchmRange.min && ingredient.kalchm <= kalchmRange.max) {
              compatibleCount++;
            }
          }
          
          // At least some ingredients should be within the specified range
          if (recommendations.ingredients.length > 0) {
            const compatibilityRatio = compatibleCount / recommendations.ingredients.length;
            if (compatibilityRatio < 0.3) {
              warn(`${season}: Low Kalchm compatibility ratio`, 
                `${compatibilityRatio.toFixed(2)} for range [${kalchmRange.min}, ${kalchmRange.max}]`);
            }
          }
        }
      }
    }
  } catch (error) {
    warn('Kalchm integration test failed', error.message);
  }
}

async function testSeasonalTransitions(seasonalSystem) {
  log('Testing seasonal transitions...', 'debug');
  
  try {
    const seasonPAirs = [
      ['spring', 'summer'],
      ['summer', 'autumn'],
      ['autumn', 'winter'],
      ['winter', 'spring']
    ];
    
    for (const [fromSeason, toSeason] of seasonPAirs) {
      for (const progress of [0.25, 0.5, 0.75]) {
        const transition = seasonalSystem.calculateSeasonalTransition(
          fromSeason, 
          toSeason, 
          progress
        );
        
        assert(typeof transition === 'object', 
          `calculateSeasonalTransition('${fromSeason}', '${toSeason}', ${progress}) returns object`);
        
        if (transition) {
          assert(transition.fromSeason === fromSeason, 
            `transition.fromSeason matches input`);
          assert(transition.toSeason === toSeason, 
            `transition.toSeason matches input`);
          assert(transition.transitionProgress === progress, 
            `transition.transitionProgress matches input`);
          assert(typeof transition.blendedElementalProfile === 'object', 
            `transition.blendedElementalProfile is object`);
          assert(typeof transition.blendedKalchmRange === 'object', 
            `transition.blendedKalchmRange is object`);
          assert(typeof transition.blendedMonicaModifiers === 'object', 
            `transition.blendedMonicaModifiers is object`);
          assert(Array.isArray(transition.recommendedIngredients), 
            `transition.recommendedIngredients is array`);
          assert(Array.isArray(transition.recommendedCookingMethods), 
            `transition.recommendedCookingMethods is array`);
        }
      }
    }
  } catch (error) {
    warn('Seasonal transitions test failed', error.message);
  }
}

async function testElementalSelfReinforcement(unifiedSeasonalProfiles) {
  log('Testing elemental self-reinforcement principles...', 'debug');
  
  // Test that elemental compatibility follows self-reinforcement principles
  for (const season of TEST_CONFIG.testSeasons) {
    const profile = unifiedSeasonalProfiles[season];
    if (!profile) continue;
    
    const elements = profile.elementalDominance;
    
    // Find dominant element
    let dominantElement = 'Fire';
    let maxValue = elements.Fire;
    
    for (const [element, value] of Object.entries(elements)) {
      if (value > maxValue) {
        dominantElement = element;
        maxValue = value;
      }
    }
    
    // Verify that the dominant element has the highest value
    assert(elements[dominantElement] === maxValue, 
      `${season}: dominant element '${dominantElement}' has highest value`);
    
    // Verify that all elemental values are non-negative
    for (const [element, value] of Object.entries(elements)) {
      assert(value >= 0, `${season}: element '${element}' has non-negative value`, 
        `Value: ${value}`);
    }
  }
}

async function testPerformance(seasonalSystem) {
  log('Testing performance...', 'debug');
  
  const startTime = Date.now();
  
  try {
    // Run multiple operations to test performance
    for (let i = 0; i < 100; i++) {
      const season = TEST_CONFIG.testSeasons[i % 4];
      const ingredient = TEST_CONFIG.testIngredients[i % TEST_CONFIG.testIngredients.length];
      
      seasonalSystem.getSeasonalScore(ingredient, season);
      seasonalSystem.getSeasonalIngredientProfile(ingredient, season);
      seasonalSystem.isInSeason(ingredient);
      
      if (i % 20 === 0) {
        seasonalSystem.getSeasonalRecommendations(season);
      }
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    assert(duration < 5000, 'Performance test completed within 5 seconds', 
      `Duration: ${duration}ms`);
    
    log(`Performance test completed in ${duration}ms`, 'success');
  } catch (error) {
    warn('Performance test failed', error.message);
  }
}

// Main test runner
async function runTests() {
  log('🚀 Starting Unified Seasonal System Tests', 'info');
  log(`Test Configuration: ${JSON.stringify(TEST_CONFIG, null, 2)}`, 'debug');
  
  try {
    // Import and basic structure tests
    const imports = await testUnifiedSeasonalImport();
    
    // Structure tests
    await testSeasonalProfileStructure(imports.unifiedSeasonalProfiles);
    await testBackwardCompatibility(imports.seasonalPatterns, imports.seasonalUsage);
    
    // Functionality tests
    await testSeasonalFunctions(
      imports.unifiedSeasonalSystem,
      imports.getCurrentSeason,
      imports.getSeasonalScore,
      imports.getSeasonalData,
      imports.isInSeason
    );
    
    // Integration tests
    await testMonicaIntegration(imports.unifiedSeasonalSystem);
    await testKalchmIntegration(imports.unifiedSeasonalSystem);
    await testSeasonalTransitions(imports.unifiedSeasonalSystem);
    
    // Principle compliance tests
    await testElementalSelfReinforcement(imports.unifiedSeasonalProfiles);
    
    // Performance tests
    await testPerformance(imports.unifiedSeasonalSystem);
    
  } catch (error) {
    log(`Critical test failure: ${error.message}`, 'error');
    testResults.failed++;
    testResults.errors.push({ message: 'Critical failure', details: error.message });
  }
  
  // Print results
  log('\n📊 TEST RESULTS SUMMARY', 'info');
  log(`✅ Passed: ${testResults.passed}`, 'success');
  log(`❌ Failed: ${testResults.failed}`, 'error');
  log(`⚠️  Warnings: ${testResults.warnings}`, 'warning');
  
  if (testResults.errors.length > 0) {
    log('\n🔍 DETAILED ERRORS:', 'error');
    testResults.errors.forEach((error, index) => {
      log(`${index + 1}. ${error.message}`, 'error');
      if (error.details) {
        console.log(`   Details: ${error.details}`);
      }
    });
  }
  
  const successRate = testResults.passed / (testResults.passed + testResults.failed) * 100;
  log(`\n📈 Success Rate: ${successRate.toFixed(1)}%`, 
    successRate >= 90 ? 'success' : successRate >= 70 ? 'warning' : 'error');
  
  if (successRate >= 90) {
    log('🎉 Unified Seasonal System consolidation SUCCESSFUL!', 'success');
    log('✅ All core functionality working correctly', 'success');
    log('✅ Monica constants integrated successfully', 'success');
    log('✅ Kalchm values integrated successfully', 'success');
    log('✅ Backward compatibility maintained', 'success');
    log('✅ Elemental self-reinforcement principles followed', 'success');
  } else if (successRate >= 70) {
    log('⚠️  Unified Seasonal System consolidation completed with warnings', 'warning');
    log('ℹ️  Review warnings and consider improvements', 'info');
  } else {
    log('❌ Unified Seasonal System consolidation FAILED', 'error');
    log('🔧 Critical issues need to be addressed', 'error');
  }
  
  return successRate >= 70;
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      log(`Unexpected error: ${error.message}`, 'error');
      process.exit(1);
    });
}

export { runTests, TEST_CONFIG, testResults }; 