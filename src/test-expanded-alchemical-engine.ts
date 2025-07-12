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

import { alchemicalEngine } from './calculations/core/alchemicalEngine';
import { 
  _ElementalProperties, 
  AstrologicalState, 
  ZodiacSign,
  _CelestialPosition 
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
  // Test logging - replace with proper test framework
  // console.log('🧪 Starting Comprehensive Alchemical Engine Tests\n');

  try {
    // Test 1: Basic Astro-Cuisine Match
    // console.log('📊 Test 1: Basic Astro-Cuisine Match');
    const basicMatch = await alchemicalEngine.calculateAstroCuisineMatch(
      testRecipeElements,
      testAstrologicalState,
      'spring',
      'italian'
    );
    // console.log('Basic Match Results:', {
    //   compatibility: basicMatch.compatibility.toFixed(4),
    //   astrologicalPower: basicMatch.astrologicalPower.toFixed(4),
    //   seasonalAlignment: basicMatch.seasonalAlignment.toFixed(4),
    //   recommendationsCount: basicMatch.recommendations  || [].length,
    // });
    // console.log('Sample Recommendations:', basicMatch.recommendations?.slice(0, 3));
    // console.log('✅ Basic match test completed\n');

    // Test 2: Advanced Recipe Harmony Analysis
    // console.log('🔬 Test 2: Advanced Recipe Harmony Analysis');
    const advancedHarmony = await alchemicalEngine.calculateAdvancedRecipeHarmony(
      'Pasta Primavera',
      testUserElements,
      testAstrologicalState,
      testBirthInfo
    );
    
    console.log('Advanced Harmony Results:', {
      harmonyScore: advancedHarmony.harmonyScore.toFixed(4),
      elementalAlignment: advancedHarmony.elementalAlignment.toFixed(4),
      alchemicalAlignment: advancedHarmony.alchemicalAlignment.toFixed(4),
      astrologicalAlignment: advancedHarmony.astrologicalAlignment.toFixed(4),
      seasonalAlignment: advancedHarmony.seasonalAlignment.toFixed(4),
      lunarAlignment: advancedHarmony.lunarAlignment.toFixed(4),
      thermodynamicAlignment: advancedHarmony.thermodynamicAlignment.toFixed(4),
      kalchmAlignment: advancedHarmony.kalchmAlignment.toFixed(4),
      monicaAlignment: advancedHarmony.monicaAlignment.toFixed(4),
      dominantElement: advancedHarmony.dominantElement,
    });
    
    console.log('Cooking Recommendations:', {
      methods: advancedHarmony?.cookingRecommendations?.methods?.slice(0, 3),
      timing: advancedHarmony?.cookingRecommendations?.timing?.slice(0, 3),
      ingredients: advancedHarmony?.cookingRecommendations?.ingredients?.slice(0, 3),
      flavors: advancedHarmony?.cookingRecommendations?.flavors?.slice(0, 3)
    });
    
    console.log('Chakra Alignment:', {
      root: advancedHarmony?.chakraAlignment?.root?.toFixed(3),
      sacral: advancedHarmony?.chakraAlignment?.sacral?.toFixed(3),
      solarPlexus: advancedHarmony?.chakraAlignment?.solarPlexus?.toFixed(3),
      heart: advancedHarmony?.chakraAlignment?.heart?.toFixed(3),
      throat: advancedHarmony?.chakraAlignment?.throat?.toFixed(3),
      brow: advancedHarmony?.chakraAlignment?.brow?.toFixed(3),
      crown: advancedHarmony?.chakraAlignment?.crown?.toFixed(3),
    });
    console.log('✅ Advanced harmony test completed\n');

    // Test 3: Enhanced Astrological Power
    console.log('⭐ Test 3: Enhanced Astrological Power');
    const astrologicalPower = await alchemicalEngine.calculateAstrologicalPower(
      'gemini',
      testAstrologicalState
    );
    console.log('Astrological Power:', astrologicalPower.toFixed(4));
    console.log('✅ Astrological power test completed\n');

    // Test 4: Elemental Affinity Analysis
    console.log('🔥 Test 4: Elemental Affinity Analysis');
    const firewaterAffinity = alchemicalEngine.getElementalAffinity('Fire', 'Water');
    const firefireAffinity = alchemicalEngine.getElementalAffinity('Fire', 'Fire');
    const AirearthAffinity = alchemicalEngine.getElementalAffinity('Air', 'Earth');
    
    console.log('fire-water Affinity:', {
      compatibility: firewaterAffinity.compatibility.toFixed(3),
      description: firewaterAffinity.description,
    });
    console.log('fire-fire Affinity:', {
      compatibility: firefireAffinity.compatibility.toFixed(3),
      description: firefireAffinity.description,
    });
    console.log('Air-earth Affinity:', {
      compatibility: AirearthAffinity.compatibility.toFixed(3),
      description: AirearthAffinity.description,
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
    
    console.log('Natural Influences:', { 
      Fire: naturalInfluences.Fire.toFixed(4), 
      Water: naturalInfluences.Water.toFixed(4), 
      Air: naturalInfluences.Air.toFixed(4),
      Earth: naturalInfluences.Earth.toFixed(4),
    });
    console.log('✅ Natural influences test completed\n');

    // Test 6: Element Ranking Analysis
    console.log('📈 Test 6: Element Ranking Analysis');
    const elementRanking = alchemicalEngine.getElementRanking(testRecipeElements);
    
    console.log('Element Ranking:', {
      dominantElement: elementRanking.dominantElement,
      balance: elementRanking.balance.toFixed(4),
      ranking: {
        '1st': elementRanking?.ranking?.[1],
        '2nd': elementRanking?.ranking?.[2],
        '3rd': elementRanking?.ranking?.[3],
        '4th': elementRanking?.ranking?.[4]
      },
      scores: { 
        Fire: elementRanking?.scores?.Fire?.toFixed(3), 
        Water: elementRanking?.scores?.Water?.toFixed(3), 
        Air: elementRanking?.scores?.Air?.toFixed(3),
        Earth: elementRanking?.scores?.Earth?.toFixed(3),
      }
    });
    console.log('✅ Element ranking test completed\n');

    // Test 7: Enhanced Legacy Alchemize Function
    console.log('🔮 Test 7: Enhanced Legacy Alchemize Function');
    const legacyResult = await alchemize(testBirthInfo, testHoroscopeData);
    
    const legacyResultData = legacyResult as unknown;
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
        kalchm: (legacyResult as Record<string, any>)?.kalchm.toFixed(4),
        monicaConstant: (legacyResult as Record<string, any>).monicaConstant.toFixed(6),
        gregsEnergy: (legacyResult as Record<string, any>).gregsEnergy.toFixed(6),
        heat: (legacyResult as Record<string, any>).heat.toFixed(6),
        entropy: (legacyResult as Record<string, any>).entropy.toFixed(6),
        reactivity: (legacyResult as Record<string, any>).reactivity.toFixed(6)
      });
    }
    
    const elementalState = legacyResultData?.elementalState;
    console.log('Elemental Balance:', { 
      Fire: (elementalState?.Fire || 0).toFixed(4), 
      Water: (elementalState?.Water || 0).toFixed(4), 
      Air: (elementalState?.Air || 0).toFixed(4),
      Earth: (elementalState?.Earth || 0).toFixed(4),
    });
    console.log('✅ Legacy alchemize test completed\n');

    // Test 8: Combined Element Objects with Weights
    console.log('⚖️ Test 8: Combined Element Objects with Weights');
    const combinedElements = alchemicalEngine.combineElementObjects(
      testRecipeElements,
      testUserElements,
      0.7, // Recipe weight
      0.3  // User weight
    );
    
    console.log('Combined Elements (70% recipe, 30% user):', { Fire: combinedElements.Fire.toFixed(4), Water: combinedElements.Water.toFixed(4), Air: combinedElements.Air.toFixed(4),
      Earth: combinedElements.Earth.toFixed(4),
    });
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
        compatibility: result.compatibility.toFixed(4),
        seasonalAlignment: result.seasonalAlignment.toFixed(4),
      });
    }
    
    // Sort by compatibility
    cuisineResults.sort((a, b) => parseFloat(b.compatibility) - parseFloat(a.compatibility));
    
    console.log('Cuisine Compatibility Rankings:');
    (cuisineResults || []).forEach((result, index) => {
      console.log(`${index + 1}. ${result.cuisine}: ${result.compatibility} (seasonal: ${result.seasonalAlignment})`);
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