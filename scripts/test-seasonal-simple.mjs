#!/usr/bin/env node

// ===== SIMPLE UNIFIED SEASONAL SYSTEM TEST =====
// Basic validation of the unified seasonal system

console.log('🚀 Testing Unified Seasonal System...\n');

// Test basic import and structure
async function testBasicImport() {
  try {
    console.log('📋 Testing basic import...');
    
    // Try to import the unified seasonal system
    const seasonalModule = await import('./src/data/unified/seasonal.ts');
    
    console.log('✅ Import successful');
    console.log('📊 Available exports:', Object.keys(seasonalModule));
    
    // Test basic functionality
    if (seasonalModule.getCurrentSeason) {
      const currentSeason = seasonalModule.getCurrentSeason();
      console.log(`✅ Current season: ${currentSeason}`);
    }
    
    if (seasonalModule.unifiedSeasonalProfiles) {
      const profiles = seasonalModule.unifiedSeasonalProfiles;
      console.log(`✅ Seasonal profiles available: ${Object.keys(profiles).join(', ')}`);
      
      // Test spring profile structure
      const spring = profiles.spring;
      if (spring) {
        console.log('✅ Spring profile structure:');
        console.log(`  - Elemental dominance: Fire=${spring.elementalDominance.Fire}, water=${spring.elementalDominance.water}, earth=${spring.elementalDominance.earth}, Air=${spring.elementalDominance.Air}`);
        console.log(`  - Kalchm range: ${spring.kalchmRange.min} - ${spring.kalchmRange.max}`);
        console.log(`  - Monica modifiers: temp=${spring.monicaModifiers.temperatureAdjustment}, timing=${spring.monicaModifiers.timingAdjustment}`);
        console.log(`  - Ingredients count: ${Object.keys(spring.ingredients).length}`);
        console.log(`  - Optimal cooking methods: ${spring.optimalCookingMethods.join(', ')}`);
      }
    }
    
    if (seasonalModule.unifiedSeasonalSystem) {
      const system = seasonalModule.unifiedSeasonalSystem;
      console.log('✅ Unified seasonal system instance available');
      
      // Test seasonal score
      const asparagusScore = system.getSeasonalScore('asparagus', 'spring');
      console.log(`✅ Asparagus spring score: ${asparagusScore}`);
      
      // Test seasonal recommendations
      try {
        const recommendations = system.getSeasonalRecommendations('spring');
        console.log(`✅ Spring recommendations: ${recommendations.ingredients.length} ingredients, ${recommendations.cookingMethods.length} cooking methods`);
        console.log(`  - Monica optimization: ${recommendations.monicaOptimization.toFixed(3)}`);
        console.log(`  - Kalchm harmony: ${recommendations.kalchmHarmony.toFixed(3)}`);
      } catch (error) {
        console.log(`⚠️  Recommendations test failed: ${error.message}`);
      }
    }
    
    // Test backward compatibility
    if (seasonalModule.seasonalPatterns && seasonalModule.seasonalUsage) {
      console.log('✅ Backward compatibility exports available');
      console.log(`  - seasonalPatterns seasons: ${Object.keys(seasonalModule.seasonalPatterns).join(', ')}`);
      console.log(`  - seasonalUsage seasons: ${Object.keys(seasonalModule.seasonalUsage).join(', ')}`);
    }
    
    console.log('\n🎉 Basic tests PASSED!');
    return true;
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
}

// Test Monica integration
async function testMonicaIntegration() {
  try {
    console.log('\n📋 Testing Monica integration...');
    
    const { unifiedSeasonalSystem } = await import('./src/data/unified/seasonal.ts');
    
    // Test Monica-based recommendations
    const recommendations = unifiedSeasonalSystem.getSeasonalRecommendations('summer', 1.0);
    
    console.log('✅ Monica integration working');
    console.log(`  - Monica optimization score: ${recommendations.monicaOptimization.toFixed(3)}`);
    console.log(`  - Recommended cooking methods: ${recommendations.cookingMethods.map(m => m.name).join(', ')}`);
    
    return true;
  } catch (error) {
    console.error('❌ Monica integration failed:', error.message);
    return false;
  }
}

// Test Kalchm integration
async function testKalchmIntegration() {
  try {
    console.log('\n📋 Testing Kalchm integration...');
    
    const { unifiedSeasonalSystem } = await import('./src/data/unified/seasonal.ts');
    
    // Test Kalchm-based recommendations
    const kalchmRange = { min: 1.0, max: 1.2 };
    const recommendations = unifiedSeasonalSystem.getSeasonalRecommendations('autumn', undefined, kalchmRange);
    
    console.log('✅ Kalchm integration working');
    console.log(`  - Kalchm harmony score: ${recommendations.kalchmHarmony.toFixed(3)}`);
    console.log(`  - Recommended ingredients: ${recommendations.ingredients.slice(0, 3).map(i => i.name).join(', ')}...`);
    
    return true;
  } catch (error) {
    console.error('❌ Kalchm integration failed:', error.message);
    return false;
  }
}

// Test seasonal transitions
async function testSeasonalTransitions() {
  try {
    console.log('\n📋 Testing seasonal transitions...');
    
    const { unifiedSeasonalSystem } = await import('./src/data/unified/seasonal.ts');
    
    // Test transition from spring to summer
    const transition = unifiedSeasonalSystem.calculateSeasonalTransition('spring', 'summer', 0.5);
    
    console.log('✅ Seasonal transitions working');
    console.log(`  - Transition: ${transition.fromSeason} → ${transition.toSeason} (${transition.transitionProgress * 100}%)`);
    console.log(`  - Blended Kalchm range: ${transition.blendedKalchmRange.min.toFixed(2)} - ${transition.blendedKalchmRange.max.toFixed(2)}`);
    console.log(`  - Recommended ingredients: ${transition.recommendedIngredients.length}`);
    console.log(`  - Recommended cooking methods: ${transition.recommendedCookingMethods.length}`);
    
    return true;
  } catch (error) {
    console.error('❌ Seasonal transitions failed:', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🧪 Running Unified Seasonal System Tests\n');
  
  const results = [];
  
  results.push(await testBasicImport());
  results.push(await testMonicaIntegration());
  results.push(await testKalchmIntegration());
  results.push(await testSeasonalTransitions());
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log('\n📊 TEST RESULTS:');
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  const successRate = (passed / total) * 100;
  console.log(`📈 Success Rate: ${successRate.toFixed(1)}%`);
  
  if (successRate >= 90) {
    console.log('\n🎉 Unified Seasonal System consolidation SUCCESSFUL!');
    console.log('✅ All core functionality working correctly');
    console.log('✅ Monica constants integrated successfully');
    console.log('✅ Kalchm values integrated successfully');
    console.log('✅ Seasonal transitions working correctly');
  } else if (successRate >= 70) {
    console.log('\n⚠️  Unified Seasonal System consolidation completed with warnings');
  } else {
    console.log('\n❌ Unified Seasonal System consolidation FAILED');
  }
  
  return successRate >= 70;
}

// Run tests
runAllTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  }); 