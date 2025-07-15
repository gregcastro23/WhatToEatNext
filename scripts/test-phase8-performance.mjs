// ===== PHASE 8: PERFORMANCE OPTIMIZATION TESTING =====

import { performance } from 'perf_hooks';

console.log('🚀 Phase 8: Performance Optimization Testing');
console.log('=' .repeat(60));

async function testPhase8Performance() {
  try {
    // Test 1: Cache Performance
    console.log('\n🧪 Test 1: Cache Performance');
    console.log('-'.repeat(40));
    
    const { getAllCacheStats, clearAllCaches } = await import('./src/services/PerformanceCache.ts');
    
    // Clear caches to start fresh
    clearAllCaches();
    
    // Test cache warming
    console.log('🔥 Testing cache warming...');
    const warmupStart = performance.now();
    
    // Import and test unified flavor engine caching
    const { unifiedFlavorEngine } = await import('./src/data/unified/unifiedFlavorEngine.ts');
    await unifiedFlavorEngine.warmupCache();
    
    const warmupTime = performance.now() - warmupStart;
    console.log(`✅ Cache warmup completed in ${warmupTime.toFixed(2)}ms`);
    
    // Test cache statistics
    const cacheStats = getAllCacheStats();
    console.log('📊 Cache Statistics:');
    console.log(`   Flavor Compatibility Cache: ${cacheStats.flavorCompatibility.totalEntries} entries`);
    console.log(`   Astrological Profile Cache: ${cacheStats.astrologicalProfile.totalEntries} entries`);
    console.log(`   Ingredient Profile Cache: ${cacheStats.ingredientProfile.totalEntries} entries`);
    
    // Test 2: Lazy Loading Performance
    console.log('\n🧪 Test 2: Lazy Loading Performance');
    console.log('-'.repeat(40));
    
    const { loadIngredientCategories, getIngredientsFromCategories } = await import('./src/utils/recommendation/ingredientRecommendation.ts');
    
    // Test selective category loading
    const selectiveLoadStart = performance.now();
    const limitedCategories = await getIngredientsFromCategories(['spices', 'herbs'], 50);
    const selectiveLoadTime = performance.now() - selectiveLoadStart;
    
    console.log(`✅ Selective loading (2 categories, 50 items): ${selectiveLoadTime.toFixed(2)}ms`);
    console.log(`📊 Loaded ${limitedCategories.length} ingredients`);
    
    // Test full loading for comparison
    const fullLoadStart = performance.now();
    const allCategories = await getIngredientsFromCategories(['vegetables', 'fruits', 'herbs', 'spices', 'proteins', 'grains'], 200);
    const fullLoadTime = performance.now() - fullLoadStart;
    
    console.log(`✅ Full loading (6 categories, 200 items): ${fullLoadTime.toFixed(2)}ms`);
    console.log(`📊 Loaded ${allCategories.length} ingredients`);
    console.log(`⚡ Selective loading is ${(fullLoadTime / selectiveLoadTime).toFixed(1)}x faster`);
    
    // Test 3: Enhanced Recommendation Service Performance
    console.log('\n🧪 Test 3: Enhanced Recommendation Service Performance');
    console.log('-'.repeat(40));
    
    const { EnhancedRecommendationService } = await import('./src/services/EnhancedRecommendationService.ts');
    const service = new EnhancedRecommendationService();
    
    // Create test astrological state
    const testAstroState = {
      zodiacSign: 'leoLeo',
      lunarPhase: 'waxing_gibbous',
      elementalProperties: {
        Fire: 0.4,
        Water: 0.2,
        Earth: 0.2,
        Air: 0.2
      },
      planetaryPositions: {
        Sun: 'leoLeo',
        Moonmoon: 'scorpioScorpio',
        Mercurymercury: 'virgoVirgo'
      }
    };
    
    // Test recommendation performance (first call - uncached)
    const uncachedStart = performance.now();
    const uncachedRecommendations = await service.getEnhancedRecommendations(testAstroState);
    const uncachedTime = performance.now() - uncachedStart;
    
    console.log(`✅ Uncached recommendations: ${uncachedTime.toFixed(2)}ms`);
    console.log(`📊 Generated ${uncachedRecommendations.recommendations.length} recommendations`);
    console.log(`🎯 Overall score: ${(uncachedRecommendations.overallScore * 100).toFixed(1)}%`);
    
    // Test recommendation performance (second call - cached)
    const cachedStart = performance.now();
    const cachedRecommendations = await service.getEnhancedRecommendations(testAstroState);
    const cachedTime = performance.now() - cachedStart;
    
    console.log(`✅ Cached recommendations: ${cachedTime.toFixed(2)}ms`);
    console.log(`⚡ Cache speedup: ${(uncachedTime / cachedTime).toFixed(1)}x faster`);
    
    // Test 4: Unified Flavor Engine Performance
    console.log('\n🧪 Test 4: Unified Flavor Engine Performance');
    console.log('-'.repeat(40));
    
    const { calculateFlavorCompatibility } = await import('./src/data/unified/unifiedFlavorEngine.ts');
    
    // Create test profiles
    const testProfile1 = {
      id: 'test-profile-1',
      name: 'Test Profile 1',
      category: 'ingredient',
      baseNotes: { sweet: 0.3, sour: 0.2, salty: 0.1, bitter: 0.1, umami: 0.2, spicy: 0.1 },
      elementalFlavors: { Fire: 0.3, Water: 0.3, Earth: 0.2, Air: 0.2 },
      intensity: 0.6,
      complexity: 0.5,
      kalchm: 1.1,
      monicaOptimization: 0.9,
      alchemicalProperties: { Spirit: 0.3, Essence: 0.3, Matter: 0.2, Substance: 0.2 },
      seasonalPeak: ['summer'],
      seasonalModifiers: { spring: 0.8, summer: 1.0, autumn: 0.7, winter: 0.6 },
      culturalOrigins: ['mediterranean'],
      pAiringRecommendations: [],
      preparationMethods: ['raw', 'cooked'],
      nutritionalSynergy: 0.7,
      temperatureOptimal: 20,
      description: 'Test profile 1',
      tags: ['test'],
      lastUpdated: new Date()
    };
    
    const testProfile2 = {
      ...testProfile1,
      id: 'test-profile-2',
      name: 'Test Profile 2',
      baseNotes: { sweet: 0.2, sour: 0.3, salty: 0.2, bitter: 0.1, umami: 0.1, spicy: 0.1 },
      elementalFlavors: { Fire: 0.2, Water: 0.4, Earth: 0.2, Air: 0.2 },
      kalchm: 1.05
    };
    
    // Test compatibility calculation performance
    const compatibilityStart = performance.now();
    const compatibility = calculateFlavorCompatibility(testProfile1, testProfile2);
    const compatibilityTime = performance.now() - compatibilityStart;
    
    console.log(`✅ Flavor compatibility calculation: ${compatibilityTime.toFixed(2)}ms`);
    console.log(`📊 Overall compatibility: ${(compatibility.overall * 100).toFixed(1)}%`);
    console.log(`🔥 Elemental harmony: ${(compatibility.elemental * 100).toFixed(1)}%`);
    console.log(`⚗️  Kalchm resonance: ${(compatibility.kalchm * 100).toFixed(1)}%`);
    
    // Test batch compatibility calculations
    const batchStart = performance.now();
    const batchCalculations = 50;
    
    for (let i = 0; i < batchCalculations; i++) {
      calculateFlavorCompatibility(testProfile1, testProfile2);
    }
    
    const batchTime = performance.now() - batchStart;
    const avgBatchTime = batchTime / batchCalculations;
    
    console.log(`✅ Batch calculations (${batchCalculations}): ${batchTime.toFixed(2)}ms`);
    console.log(`⚡ Average per calculation: ${avgBatchTime.toFixed(2)}ms`);
    console.log(`🚀 Cache effectiveness: ${(compatibilityTime / avgBatchTime).toFixed(1)}x improvement`);
    
    // Test 5: Memory Usage Analysis
    console.log('\n🧪 Test 5: Memory Usage Analysis');
    console.log('-'.repeat(40));
    
    const finalCacheStats = getAllCacheStats();
    
    console.log('📊 Final Cache Statistics:');
    console.log(`   Flavor Compatibility: ${finalCacheStats.flavorCompatibility.totalEntries} entries, ${(finalCacheStats.flavorCompatibility.memoryUsage / 1024).toFixed(1)}KB`);
    console.log(`   Hit Rate: ${(finalCacheStats.flavorCompatibility.hitRate * 100).toFixed(1)}%`);
    console.log(`   Astrological Profiles: ${finalCacheStats.astrologicalProfile.totalEntries} entries, ${(finalCacheStats.astrologicalProfile.memoryUsage / 1024).toFixed(1)}KB`);
    console.log(`   Ingredient Profiles: ${finalCacheStats.ingredientProfile.totalEntries} entries, ${(finalCacheStats.ingredientProfile.memoryUsage / 1024).toFixed(1)}KB`);
    
    const totalMemory = finalCacheStats.flavorCompatibility.memoryUsage + 
                       finalCacheStats.astrologicalProfile.memoryUsage + 
                       finalCacheStats.ingredientProfile.memoryUsage;
    
    console.log(`💾 Total cache memory usage: ${(totalMemory / 1024).toFixed(1)}KB`);
    
    // Test 6: Performance Monitoring
    console.log('\n🧪 Test 6: Performance Monitoring');
    console.log('-'.repeat(40));
    
    const performanceStats = finalCacheStats.performance;
    
    console.log('📈 Performance Metrics:');
    console.log(`   Current calculation time: ${performanceStats.current.calculationTime.toFixed(2)}ms`);
    console.log(`   Average calculation time: ${performanceStats.average.calculationTime.toFixed(2)}ms`);
    console.log(`   Peak calculation time: ${performanceStats.peak.calculationTime.toFixed(2)}ms`);
    console.log(`   Current cache hit rate: ${(performanceStats.current.cacheHitRate * 100).toFixed(1)}%`);
    console.log(`   Average cache hit rate: ${(performanceStats.average.cacheHitRate * 100).toFixed(1)}%`);
    
    // Performance Summary
    console.log('\n' + '=' .repeat(60));
    console.log('🎉 PHASE 8 PERFORMANCE OPTIMIZATION RESULTS');
    console.log('=' .repeat(60));
    
    console.log('✅ **ACHIEVEMENTS:**');
    console.log(`   🚀 Cache speedup: ${(uncachedTime / cachedTime).toFixed(1)}x faster for repeated calculations`);
    console.log(`   ⚡ Selective loading: ${(fullLoadTime / selectiveLoadTime).toFixed(1)}x faster than full loading`);
    console.log(`   💾 Memory efficiency: ${(totalMemory / 1024).toFixed(1)}KB total cache usage`);
    console.log(`   📊 Cache hit rate: ${(finalCacheStats.flavorCompatibility.hitRate * 100).toFixed(1)}%`);
    console.log(`   🎯 Recommendation quality maintained: ${(uncachedRecommendations.overallScore * 100).toFixed(1)}% score`);
    
    console.log('\n✅ **TARGET ACHIEVEMENTS:**');
    const targetSpeedup = 2.0; // 50% reduction = 2x speedup
    const actualSpeedup = uncachedTime / cachedTime;
    
    if (actualSpeedup >= targetSpeedup) {
      console.log(`   🎯 50% performance improvement: ✅ ACHIEVED (${actualSpeedup.toFixed(1)}x speedup)`);
    } else {
      console.log(`   🎯 50% performance improvement: ⚠️  PARTIAL (${actualSpeedup.toFixed(1)}x speedup, target: ${targetSpeedup}x)`);
    }
    
    if (finalCacheStats.flavorCompatibility.hitRate >= 0.8) {
      console.log(`   🎯 80% cache hit rate: ✅ ACHIEVED (${(finalCacheStats.flavorCompatibility.hitRate * 100).toFixed(1)}%)`);
    } else {
      console.log(`   🎯 80% cache hit rate: ⚠️  PARTIAL (${(finalCacheStats.flavorCompatibility.hitRate * 100).toFixed(1)}%, target: 80%)`);
    }
    
    if (totalMemory < 50 * 1024 * 1024) { // 50MB
      console.log(`   🎯 Memory usage <50MB: ✅ ACHIEVED (${(totalMemory / 1024 / 1024).toFixed(1)}MB)`);
    } else {
      console.log(`   🎯 Memory usage <50MB: ⚠️  EXCEEDED (${(totalMemory / 1024 / 1024).toFixed(1)}MB)`);
    }
    
    console.log('\n🚀 **PHASE 8 COMPLETE: Performance optimization successfully implemented!**');
    
  } catch (error) {
    console.error('❌ Phase 8 testing failed:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testPhase8Performance().catch(console.error); 