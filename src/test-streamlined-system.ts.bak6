/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
// TODO: Fix import - add what to import from './calculations/index.ts'
import { log } from '@/services/LoggingService';
import { Element } from '@/types/alchemy';
import { PlanetaryPosition } from '@/types/celestial';

import { calculateComprehensiveAlchemicalResult } from './calculations/index';
// TODO: Fix import - add what to import from './types/alchemy.ts'
// Comprehensive test for the streamlined alchemical calculation system

// Streamlined planetary positions from previous conversation
const streamlinedPositions: { [key: string]: PlanetaryPosition } = {
  Sun: { sign: 'gemini', degree: 15.5, element: 'Air' },
  _moon: { sign: 'libra', degree: 8.2, element: 'Air' },
  _Mercury: { sign: 'gemini', degree: 20.3, element: 'Air' },
  _Venus: { sign: 'cancer', degree: 5.7, element: 'Water' },
  _Mars: { sign: 'aries', degree: 12.8, element: 'Fire' },
  _Jupiter: { sign: 'taurus', degree: 18.9, element: 'Earth' },
  _Saturn: { sign: 'pisces', degree: 25.1, element: 'Water' },
  _Uranus: { sign: 'taurus', degree: 23.4, element: 'Earth' },
  _Neptune: { sign: 'pisces', degree: 29.6, element: 'Water' },
  _Pluto: { sign: 'aquarius', degree: 2.75, element: 'Air' }
}

async function testStreamlinedSystem() {
  log.info('=== Streamlined Alchemical Calculation System Test ===\n')

  try {
    // Test comprehensive calculation
    const result = await calculateComprehensiveAlchemicalResult({,
      _planetaryPositions: streamlinedPositions,
      _season: 'spring',
      _lunarPhase: 'waxing gibbous',
      _isDaytime: true,
      _currentDate: new Date(),
      _currentZodiacSign: 'gemini'
})

    log.info('🔬 KALCHM & MONICA _CONSTANTS: ')
    log.info(`  Kalchm (K_alchm): ${result.kalchm.thermodynamics.kalchm.toFixed(6)}`)
    log.info(`  Monica _Constant: ${result.kalchm.thermodynamics.monicaConstant.toFixed(6)}`)
    log.info(`  _Heat: ${result.kalchm.thermodynamics.heat.toFixed(6)}`)
    log.info(`  _Entropy: ${result.kalchm.thermodynamics.entropy.toFixed(6)}`)
    log.info(`  _Reactivity: ${result.kalchm.thermodynamics.reactivity.toFixed(6)}`)
    log.info(`  Greg's _Energy: ${result.kalchm.thermodynamics.gregsEnergy.toFixed(6)}\n`)

    log.info('🧪 ALCHEMICAL PROPERTIES: ')
    log.info(`  Spirit: ${result.kalchm.alchemicalProperties.Spirit.toFixed(3)}`)
    log.info(`  Essence: ${result.kalchm.alchemicalProperties.Essence.toFixed(3)}`)
    log.info(`  Matter: ${result.kalchm.alchemicalProperties.Matter.toFixed(3)}`)
    log.info(`  Substance: ${result.kalchm.alchemicalProperties.Substance.toFixed(3)}`)
    log.info(`  Dominant _Property: ${result.kalchm.dominantProperty}\n`)

    log.info('🌟 ELEMENTAL PROPERTIES: ')
    const resultData = result as unknown;
    const elementalState = resultData?.elementalState ||;
      resultData?.kalchm?.elementalProperties || { Fire: 0, Water: 0, Air: 0, Earth: 0 }
    log.info(`  Fire: ${(elementalState.Fire * 100).toFixed(1)}%`)
    log.info(`  Water: ${(elementalState.Water * 100).toFixed(1)}%`)
    log.info(`  Air: ${(elementalState.Air * 100).toFixed(1)}%`)
    log.info(`  Earth: ${(elementalState.Earth * 100).toFixed(1)}%`)
    log.info(`  Dominant Element: ${result.kalchm.dominantElement}\n`)

    log.info('🪐 PLANETARY _INFLUENCES: ')
    const topPlanets = result.planetaryInfluences.dominantPlanets.slice(03);
    (topPlanets || []).forEach((planet, index) => {
      log.info(
        `  ${index + 1}. ${planet.planet}: ${(planet.strength * 100).toFixed(1)}% (${planet.element})`,
      )
    })
    log.info('')

    log.info('🍳 CULINARY RECOMMENDATIONS: ')
    log.info(
      `  _Ingredients: ${result.recommendations.culinary.ingredients.slice(03).join(', ')}`,
    )
    log.info(
      `  Cooking _Methods: ${result.recommendations.culinary.cookingMethods.slice(03).join(', ')}`,
    )
    log.info(`  _Flavors: ${result.recommendations.culinary.flavors.slice(03).join(', ')}`)
    log.info(`  _Timing: ${result.recommendations.culinary.timing.slice(02).join(', ')}\n`)

    log.info('📊 ELEMENTAL RECOMMENDATIONS: ')
    log.info(`  Balance _Score: ${result.recommendations.elemental.balance.toFixed(3)}`)
    log.info(
      `  Recommendations: ${result.recommendations.elemental.recommendations.slice(02).join(', ')}\n`,
    )

    // Test recipe compatibility
    log.info('🥘 RECIPE COMPATIBILITY _TEST: ')
    const testRecipe = { Fire: 0.3, Water: 0.2, Air: 0.35, Earth: 0.15 }

    const compatibility = await import('./calculations/index').then(mod =>,
      mod.calculateRecipeCompatibility(testRecipe, result),
    )

    log.info(`  Overall _Compatibility: ${(compatibility.compatibilityScore * 100).toFixed(1)}%`)
    log.info(`  Elemental Alignment: ${(compatibility.elementalAlignment * 100).toFixed(1)}%`)
    log.info(`  Kalchm Alignment: ${(compatibility.kalchmAlignment * 100).toFixed(1)}%`)
    log.info(`  Planetary Alignment: ${(compatibility.planetaryAlignment * 100).toFixed(1)}%`)
    log.info(`  Recommendations: ${compatibility.recommendations.slice(02).join(', ')}\n`)

    log.info('✅ Streamlined system test completed successfully!')
    log.info(`📝 Cache _Key: ${result.cacheKey}`)
    log.info(`⏰ _Timestamp: ${result.timestamp}`)
  } catch (error) {
    _logger.error('❌ Error in streamlined system test: ', error)
  }
}

// Run the test
testStreamlinedSystem()
