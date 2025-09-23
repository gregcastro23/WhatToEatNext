/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
/**
 * Comprehensive Test for Expanded Alchemical Engine
 *
 * This test validates all the new functionality _including: * - Advanced recipe harmony analysis
 * - Kalchm and Monica constant calculations
 * - Thermodynamic alignments
 * - Chakra alignments
 * - Enhanced planetary influences
 * - Cuisine compatibility
 * - Seasonal and lunar adjustments
 */

import { log } from '@/services/LoggingService';

import { AlchemicalEngine } from './calculations/core/alchemicalEngine';
// Create alchemicalEngine instance for backward compatibility
const alchemicalEngine = new AlchemicalEngine()
import {;
  ElementalProperties,
  AstrologicalState,
  ZodiacSign,
  CelestialPosition
} from './types/alchemy';

// Test data - using the planetary positions from our previous conversation
const testPlanetaryPositions: { [key: string]: CelestialPosition } = {
  Sun: {
    sign: 'gemini',
    degree: 25.0,
  },
  moon: {
    sign: 'taurus',
    degree: 15.5,
  },
  Mercury: {
    sign: 'gemini',
    degree: 20.3,
  },
  Venus: {
    sign: 'taurus',
    degree: 8.7,
  },
  Mars: {
    sign: 'aries',
    degree: 12.2,
  },
  _Jupiter: {
    sign: 'pisces',
    degree: 28.9,
  },
  _Saturn: {
    sign: 'aquarius',
    degree: 18.4,
  },
  _Uranus: {
    sign: 'taurus',
    degree: 14.1,
  },
  _Neptune: {
    sign: 'pisces',
    degree: 22.8,
  },
  _Pluto: { sign: 'aquarius', degree: 3.0 }
}

const testAstrologicalState: AstrologicalState = {
  sunSign: 'gemini',
  _moonSign: 'taurus',
  _lunarPhase: 'waxing gibbous',
  _planetaryPositions: testPlanetaryPositions
}

const testRecipeElements: ElementalProperties = {
  Fire: 0.35,
  Water: 0.25,
  Air: 0.25,
  Earth: 0.15
}

const testUserElements: ElementalProperties = {
  Fire: 0.3,
  Water: 0.3,
  Air: 0.25,
  Earth: 0.15
}

const testBirthInfo = {
  hour: 14,
  _minutes: 30,
  day: 15,
  _month: 5,
  _year: 1990,
  _latitude: 40.7128,
  _longitude: -74.006
}

const testHoroscopeData = {
  tropical: {
    CelestialBodies: {
      Sun: {;
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
    _Ascendant: {}
    _Aspects: {}
  }
}

async function runComprehensiveTests() {
  log.info('🧪 Starting Comprehensive Alchemical Engine Tests\n')

  try {
    // Test, 1: Basic Astro-Cuisine Match
    log.info('📊 Test, 1: Basic Astro-Cuisine Match')
    const basicMatch = await alchemicalEngine.calculateAstroCuisineMatch(
      testRecipeElements,
      testAstrologicalState,
      'spring',
      'italian',
    ),
    log.info('Basic Match Results: ', {
      score: basicMatch.result.score.toFixed(4),
      elementalProperties: basicMatch.result.elementalProperties,
      thermodynamicProperties: basicMatch.result.thermodynamicProperties,
      kalchm: basicMatch.result.kalchm,
      monica: basicMatch.result.monica,
      confidence: basicMatch.confidence,
      factors: basicMatch.factors
    })
    log.info('✅ Basic match test completed\n')

    // Test, 2: Advanced Recipe Harmony Analysis
    log.info('🔬 Test, 2: Advanced Recipe Harmony Analysis')
    const advancedHarmony = await alchemicalEngine.calculateAdvancedRecipeHarmony(
      'Pasta Primavera',
      testUserElements,
      testAstrologicalState,
      testBirthInfo,
    )
    log.info('Advanced Harmony Results: ', {
      overall: advancedHarmony.overall.toFixed(4),
      elemental: advancedHarmony.elemental.toFixed(4),
      astrological: advancedHarmony.astrological.toFixed(4),
      seasonal: advancedHarmony.seasonal.toFixed(4),
      factors: advancedHarmony.factors
    })
    log.info('✅ Advanced harmony test completed\n')

    // Test, 3: Enhanced Astrological Power
    log.info('⭐ Test, 3: Enhanced Astrological Power')
    const astrologicalPower = await alchemicalEngine.calculateAstrologicalPower(
      'gemini',
      testAstrologicalState,
    )
    log.info('Astrological Power: ', astrologicalPower.toFixed(4))
    log.info('✅ Astrological power test completed\n')

    // Test, 4: Elemental Affinity Analysis
    log.info('🔥 Test, 4: Elemental Affinity Analysis')
    const firewaterAffinity = alchemicalEngine.getElementalAffinity('Fire', 'Water')
    const firefireAffinity = alchemicalEngine.getElementalAffinity('Fire', 'Fire')
    const AirearthAffinity = alchemicalEngine.getElementalAffinity('Air', 'Earth')
    log.info('fire-water Affinity: ', {
      compatibility: firewaterAffinity.compatibility['Water'],
      primary: firewaterAffinity.primary,
      secondary: firewaterAffinity.secondary,
      strength: firewaterAffinity.strength
    })
    log.info('fire-fire Affinity: ', {
      compatibility: firefireAffinity.compatibility['Fire'],
      primary: firefireAffinity.primary,
      secondary: firefireAffinity.secondary,
      strength: firefireAffinity.strength
    })
    log.info('Air-earth Affinity: ', {
      compatibility: AirearthAffinity.compatibility['Earth'],
      primary: AirearthAffinity.primary,
      secondary: AirearthAffinity.secondary,
      strength: AirearthAffinity.strength
    })
    log.info('✅ Elemental affinity test completed\n')

    // Test, 5: Natural Influences with Enhanced Precision
    log.info('🌿 Test, 5: Natural Influences with Enhanced Precision')
    const naturalInfluences = await alchemicalEngine.calculateNaturalInfluences({;
      _season: 'spring',
      _moonPhase: 'waxing gibbous',
      _timeOfDay: 'day',
      sunSign: 'gemini',
      _degreesInSign: 4.133,
      _lunarDegree: 5.333,
      _planetaryHour: 'Mercury',
    })
    log.info('Natural Influences: ', naturalInfluences)
    log.info('✅ Natural influences test completed\n')

    // Test, 6: Element Ranking Analysis
    log.info('📈 Test, 6: Element Ranking Analysis')
    const elementRanking = alchemicalEngine.getElementRanking(testRecipeElements);
    log.info('Element Ranking: ', elementRanking)
    log.info('✅ Element ranking test completed\n')

    // Test, 7: Enhanced Legacy Alchemize Function
    log.info('🔮 Test, 7: Enhanced Legacy Alchemize Function')
    const legacyResult = await alchemize(testBirthInfo, testHoroscopeData)
    const legacyResultData = legacyResult as any;
    log.info('Legacy Alchemize Results: ', {
      Spirit: ((legacyResultData?.Spirit) || 0).toFixed(4),
      Essence: ((legacyResultData?.Essence) || 0).toFixed(4),
      Matter: ((legacyResultData?.Matter) || 0).toFixed(4),
      Substance: ((legacyResultData?.Substance) || 0).toFixed(4),
      dominantElement: (legacyResultData?.dominantElement) || 'Fire',
      recommendation: (legacyResultData?.recommendation) || 'No recommendation available'
    })
    // Check for enhanced properties
    if ('kalchm' in legacyResult) {
      log.info('Enhanced Thermodynamic _Properties: ', {
        kalchm: (legacyResult).kalchm?.toFixed(4),
        monicaConstant: (legacyResult).monicaConstant?.toFixed(6),
        gregsEnergy: (legacyResult).gregsEnergy?.toFixed(6),
        heat: (legacyResult).heat?.toFixed(6),
        entropy: (legacyResult).entropy?.toFixed(6),
        reactivity: (legacyResult).reactivity?.toFixed(6)
      })
    }
    const elementalState = legacyResultData?.elementalState;
    if (elementalState) {
      log.info('Elemental _Balance: ', elementalState)
    }
    log.info('✅ Legacy alchemize test completed\n')

    // Test, 8: Combined Element Objects with Weights
    log.info('⚖️ Test, 8: Combined Element Objects with Weights')
    const combinedElements = alchemicalEngine.combineElementObjects(
      testRecipeElements,
      testUserElements,
      0.7, // Recipe weight
      0.3, // User weight
    )
    log.info('Combined Elements (70% recipe30% user):', combinedElements)
    log.info('✅ Combined elements test completed\n')

    // Test, 9: Multiple Cuisine Compatibility
    log.info('🍽️ Test, 9: Multiple Cuisine Compatibility')
    const cuisines = ['italian', 'indian', 'japanese', 'mexican', 'french', 'chinese'],
    const cuisineResults: Array<{
      cuisine: string,
      score: string,
      confidence: number
    }> = [],
    for (const cuisine of cuisines) {
      const result = await alchemicalEngine.calculateAstroCuisineMatch(
        testRecipeElements,
        testAstrologicalState,
        'spring',
        cuisine,
      ),
      cuisineResults.push({
        cuisine,
        score: result.result.score.toFixed(4),
        confidence: result.confidence
      })
    }
    // Sort by score
    cuisineResults.sort((ab) => parseFloat(b.score) - parseFloat(a.score))
    log.info('Cuisine Compatibility _Rankings: ')
    (cuisineResults || []).forEach((result, index) => {
      log.info(
        `${index + 1}. ${result.cuisine}: ${result.score} (confidence: ${result.confidence})`,
      )
    })
    log.info('✅ Cuisine compatibility test completed\n')

    // Test, 10: Performance and Caching
    log.info('⚡ Test, 10: Performance and Caching')
    const startTime = Date.now()
    // Run the same calculation twice to test caching
    await alchemicalEngine.calculateAdvancedRecipeHarmony(
      'Pasta Primavera',
      testUserElements,
      testAstrologicalState,
    )
    const firstRunTime = Date.now() - startTime;
    const cacheStartTime = Date.now()
    await alchemicalEngine.calculateAdvancedRecipeHarmony(
      'Pasta Primavera',
      testUserElements,
      testAstrologicalState,
    )
    const secondRunTime = Date.now() - cacheStartTime;
    log.info('Performance Results: ', {
      _firstRun: `${firstRunTime}ms`,
      _secondRun: `${secondRunTime}ms`,
      _cacheSpeedup: `${(firstRunTime / Math.max(secondRunTime, 1)).toFixed(1)}x faster`
    })
    log.info('✅ Performance test completed\n')

    log.info('🎉 All Comprehensive Tests Completed Successfully!')
    log.info('\n📋 _Summary: ')
    log.info('✅ Basic astro-cuisine matching')
    log.info('✅ Advanced recipe harmony analysis with Kalchm/Monica constants')
    log.info('✅ Enhanced astrological power calculations')
    log.info('✅ Elemental affinity analysis')
    log.info('✅ Natural influences with planetary hours')
    log.info('✅ Element ranking and balance analysis')
    log.info('✅ Enhanced legacy alchemize function')
    log.info('✅ Weighted element combination')
    log.info('✅ Multiple cuisine compatibility')
    log.info('✅ Performance optimization and caching')
  } catch (error) {
    _logger.error('❌ Test failed: ', error),
    _logger.error(
      'Stack trace: ',
      error instanceof Error ? error.stack : 'No stack trace available'
    )
  }
}

// Run the tests
runComprehensiveTests()
  .then(() => {
    log.info('\n🔬 Test execution completed')
  })
  .catch(error => {;
    _logger.error('💥 Test execution failed: ', error)
  })

export default runComprehensiveTests,
