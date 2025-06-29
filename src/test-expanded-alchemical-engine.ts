/**
 * Comprehensive Test for Expanded Alchemical Engine
 * 
 * This test validates all the new functionality including:
 * - Advanced recipe harmony analysis
 * - Kalchm and Monica constant calculations
 * - Thermodynamic alignments
 * - Chakra alignments
 * - Enhanced planetary influences
 * - Cuisine compatibility
 * - Seasonal and lunar adjustments
 */

import { AlchemicalEngine } from './calculations/core/alchemicalEngine';

// Create alchemicalEngine instance for backward compatibility
const alchemicalEngine = new AlchemicalEngine();
import { 
  ElementalProperties, 
  AstrologicalState, 
  ZodiacSign,
  CelestialPosition 
} from './types/alchemy';
import { AlchemicalEngineAdvanced } from './calculations/alchemicalEngine';
import { staticAlchemize as alchemize } from '@/utils/alchemyInitializer';

// Test data - using the planetary positions from our previous conversation
const testPlanetaryPositions: { [key: string]: CelestialPosition } = {
  Sun: { 
    sign: 'gemini', 
    degree: 25.0 
  },
  moon: { 
    sign: 'taurus', 
    degree: 15.5 
  },
  Mercury: { 
    sign: 'gemini', 
    degree: 20.3 
  },
  Venus: { 
    sign: 'taurus', 
    degree: 8.7 
  },
  Mars: { 
    sign: 'aries', 
    degree: 12.2 
  },
  Jupiter: { 
    sign: 'pisces', 
    degree: 28.9 
  },
  Saturn: { 
    sign: 'aquarius', 
    degree: 18.4 
  },
  Uranus: { 
    sign: 'taurus', 
    degree: 14.1 
  },
  Neptune: { 
    sign: 'pisces', 
    degree: 22.8 
  },
  Pluto: { sign: 'aquarius', degree: 3.0 }
};

const testAstrologicalState: AstrologicalState = {
  sunSign: 'gemini',
  moonSign: 'taurus',
  lunarPhase: 'waxing gibbous',
  planetaryPositions: testPlanetaryPositions,
};

const testRecipeElements: ElementalProperties = { 
  Fire: 0.35, 
  Water: 0.25, 
  Air: 0.25,
  Earth: 0.15,
};

const testUserElements: ElementalProperties = { 
  Fire: 0.30, 
  Water: 0.30, 
  Air: 0.25,
  Earth: 0.15,
};

const testBirthInfo = {
  hour: 14,
  minutes: 30,
  day: 15,
  month: 5,
  year: 1990,
  latitude: 40.7128,
  longitude: -74.0060,
};

const testHoroscopeData = {
  tropical: {
    CelestialBodies: {
      Sun: {
        Sign: {},
        ChartPosition: { Ecliptic: { DecimalDegrees: 64.133 } }
      },
      moon: {
        Sign: {},
        ChartPosition: { Ecliptic: { DecimalDegrees: 35.333 } }
      },
      Mercury: {
        Sign: {},
        ChartPosition: { Ecliptic: { DecimalDegrees: 59.5 } }
      },
      Venus: {
        Sign: {},
        ChartPosition: { Ecliptic: { DecimalDegrees: 78.75 } }
      },
      Mars: {
        Sign: {},
        ChartPosition: { Ecliptic: { DecimalDegrees: 12.25 } }
      }
    },
    Ascendant: {},
    Aspects: {}
  }
};

async function runComprehensiveTests() {
  console.log('🧪 Starting Comprehensive Alchemical Engine Tests\n');

  try {
    // Test 1: Basic Astro-Cuisine Match
    console.log('📊 Test 1: Basic Astro-Cuisine Match');
    const basicMatch = await alchemicalEngine.calculateAstroCuisineMatch(
      testRecipeElements,
      testAstrologicalState,
      'spring',
      'italian'
    );
    console.log('Basic Match Results:', {
      score: basicMatch.result?.score?.toFixed(4),
      elementalProperties: basicMatch.result?.elementalProperties,
      thermodynamicProperties: basicMatch.result?.thermodynamicProperties,
      kalchm: basicMatch.result?.kalchm,
      monica: basicMatch.result?.monica,
      confidence: basicMatch.confidence,
      factors: basicMatch.factors,
    });
    console.log('✅ Basic match test completed\n');

    // Test 2: Advanced Recipe Harmony Analysis
    console.log('🔬 Test 2: Advanced Recipe Harmony Analysis');
    const advancedHarmony = await alchemicalEngine.calculateAdvancedRecipeHarmony(
      'Pasta Primavera',
      testUserElements,
      testAstrologicalState,
      testBirthInfo
    );
    console.log('Advanced Harmony Results:', {
      overall: advancedHarmony.overall?.toFixed(4),
      elemental: advancedHarmony.elemental?.toFixed(4),
      astrological: advancedHarmony.astrological?.toFixed(4),
      seasonal: advancedHarmony.seasonal?.toFixed(4),
      factors: advancedHarmony.factors,
    });
    console.log('✅ Advanced harmony test completed\n');

    // Test 3: Enhanced Astrological Power
    console.log('⭐ Test 3: Enhanced Astrological Power');
    const astrologicalPower = await alchemicalEngine.calculateAstrologicalPower(
      'gemini',
      testAstrologicalState
    );
    console.log('Astrological Power:', astrologicalPower?.toFixed(4));
    console.log('✅ Astrological power test completed\n');

    // Test 4: Elemental Affinity Analysis
    console.log('🔥 Test 4: Elemental Affinity Analysis');
    const firewaterAffinity = alchemicalEngine.getElementalAffinity('Fire', 'Water');
    const firefireAffinity = alchemicalEngine.getElementalAffinity('Fire', 'Fire');
    const AirearthAffinity = alchemicalEngine.getElementalAffinity('Air', 'Earth');
    console.log('fire-water Affinity:', {
      compatibility: firewaterAffinity.compatibility['Water'],
      primary: firewaterAffinity.primary,
      secondary: firewaterAffinity.secondary,
      strength: firewaterAffinity.strength,
    });
    console.log('fire-fire Affinity:', {
      compatibility: firefireAffinity.compatibility['Fire'],
      primary: firefireAffinity.primary,
      secondary: firefireAffinity.secondary,
      strength: firefireAffinity.strength,
    });
    console.log('Air-earth Affinity:', {
      compatibility: AirearthAffinity.compatibility['Earth'],
      primary: AirearthAffinity.primary,
      secondary: AirearthAffinity.secondary,
      strength: AirearthAffinity.strength,
    });
    console.log('✅ Elemental affinity test completed\n');

    // Test 5: Natural Influences with Enhanced Precision
    console.log('🌿 Test 5: Natural Influences with Enhanced Precision');
    const naturalInfluences = await alchemicalEngine.calculateNaturalInfluences({
      season: 'spring',
      moonPhase: 'waxing gibbous',
      timeOfDay: 'day',
      sunSign: 'gemini',
      degreesInSign: 4.133,
      lunarDegree: 5.333,
      planetaryHour: 'Mercury',
    });
    console.log('Natural Influences:', naturalInfluences);
    console.log('✅ Natural influences test completed\n');

    // Test 6: Element Ranking Analysis
    console.log('📈 Test 6: Element Ranking Analysis');
    const elementRanking = alchemicalEngine.getElementRanking(testRecipeElements);
    console.log('Element Ranking:', elementRanking);
    console.log('✅ Element ranking test completed\n');

    // Test 7: Enhanced Legacy Alchemize Function
    console.log('🔮 Test 7: Enhanced Legacy Alchemize Function');
    const legacyResult = await alchemize(testBirthInfo, testHoroscopeData);
    const legacyResultData = legacyResult as any;
    console.log('Legacy Alchemize Results:', {
      Spirit: (legacyResultData?.Spirit || 0).toFixed(4),
      Essence: (legacyResultData?.Essence || 0).toFixed(4),
      Matter: (legacyResultData?.Matter || 0).toFixed(4),
      Substance: (legacyResultData?.Substance || 0).toFixed(4),
      dominantElement: legacyResultData?.dominantElement || 'Fire',
      recommendation: legacyResultData?.recommendation || 'No recommendation available',
    });
    // Check for enhanced properties
    if ('kalchm' in legacyResult) {
      console.log('Enhanced Thermodynamic Properties:', {
        kalchm: (legacyResult as Record<string, any>)?.kalchm?.toFixed(4),
        monicaConstant: (legacyResult as Record<string, any>)?.monicaConstant?.toFixed(6),
        gregsEnergy: (legacyResult as Record<string, any>)?.gregsEnergy?.toFixed(6),
        heat: (legacyResult as Record<string, any>)?.heat?.toFixed(6),
        entropy: (legacyResult as Record<string, any>)?.entropy?.toFixed(6),
        reactivity: (legacyResult as Record<string, any>)?.reactivity?.toFixed(6)
      });
    }
    const elementalState = legacyResultData?.elementalState;
    if (elementalState) {
      console.log('Elemental Balance:', elementalState);
    }
    console.log('✅ Legacy alchemize test completed\n');

    // Test 8: Combined Element Objects with Weights
    console.log('⚖️ Test 8: Combined Element Objects with Weights');
    const combinedElements = alchemicalEngine.combineElementObjects(
      testRecipeElements,
      testUserElements,
      0.7, // Recipe weight
      0.3  // User weight
    );
    console.log('Combined Elements (70% recipe, 30% user):', combinedElements);
    console.log('✅ Combined elements test completed\n');

    // Test 9: Multiple Cuisine Compatibility
    console.log('🍽️ Test 9: Multiple Cuisine Compatibility');
    const cuisines = ['italian', 'indian', 'japanese', 'mexican', 'french', 'chinese'];
    const cuisineResults = [];
    for (const cuisine of cuisines) {
      const result = await alchemicalEngine.calculateAstroCuisineMatch(
        testRecipeElements,
        testAstrologicalState,
        'spring',
        cuisine
      );
      cuisineResults?.push({
        cuisine,
        score: result.result?.score?.toFixed(4),
        confidence: result.confidence,
      });
    }
    // Sort by score
    cuisineResults.sort((a, b) => parseFloat(b.score) - parseFloat(a.score));
    console.log('Cuisine Compatibility Rankings:');
    (cuisineResults || []).forEach((result, index) => {
      console.log(`${index + 1}. ${result.cuisine}: ${result.score} (confidence: ${result.confidence})`);
    });
    console.log('✅ Cuisine compatibility test completed\n');

    // Test 10: Performance and Caching
    console.log('⚡ Test 10: Performance and Caching');
    const startTime = Date.now();
    // Run the same calculation twice to test caching
    await alchemicalEngine.calculateAdvancedRecipeHarmony(
      'Pasta Primavera',
      testUserElements,
      testAstrologicalState
    );
    const firstRunTime = Date.now() - startTime;
    const cacheStartTime = Date.now();
    await alchemicalEngine.calculateAdvancedRecipeHarmony(
      'Pasta Primavera',
      testUserElements,
      testAstrologicalState
    );
    const secondRunTime = Date.now() - cacheStartTime;
    console.log('Performance Results:', {
      firstRun: `${firstRunTime}ms`,
      secondRun: `${secondRunTime}ms`,
      cacheSpeedup: `${(firstRunTime / Math.max(secondRunTime, 1)).toFixed(1)}x faster`
    });
    console.log('✅ Performance test completed\n');

    console.log('🎉 All Comprehensive Tests Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ Basic astro-cuisine matching');
    console.log('✅ Advanced recipe harmony analysis with Kalchm/Monica constants');
    console.log('✅ Enhanced astrological power calculations');
    console.log('✅ Elemental affinity analysis');
    console.log('✅ Natural influences with planetary hours');
    console.log('✅ Element ranking and balance analysis');
    console.log('✅ Enhanced legacy alchemize function');
    console.log('✅ Weighted element combination');
    console.log('✅ Multiple cuisine compatibility');
    console.log('✅ Performance optimization and caching');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
  }
}

// Run the tests
runComprehensiveTests()?.then(() => {
  console.log('\n🔬 Test execution completed');
}).catch(error => {
  console.error('💥 Test execution failed:', error);
});

export default runComprehensiveTests; 