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
  moon: { sign: 'libra', degree: 8.2, element: 'Air' },
  Mercury: { sign: 'gemini', degree: 20.3, element: 'Air' },
  Venus: { sign: 'cancer', degree: 5.7, element: 'Water' },
  Mars: { sign: 'aries', degree: 12.8, element: 'Fire' },
  Jupiter: { sign: 'taurus', degree: 18.9, element: 'Earth' },
  Saturn: { sign: 'pisces', degree: 25.1, element: 'Water' },
  Uranus: { sign: 'taurus', degree: 23.4, element: 'Earth' },
  Neptune: { sign: 'pisces', degree: 29.6, element: 'Water' },
  Pluto: { sign: 'aquarius', degree: 2.75, element: 'Air' }
};

async function testStreamlinedSystem() {
  log.info('=== Streamlined Alchemical Calculation System Test ===\n');

  try {
    // Test comprehensive calculation
    const result = await calculateComprehensiveAlchemicalResult({
      planetaryPositions: streamlinedPositions,
      season: 'spring',
      lunarPhase: 'waxing gibbous',
      isDaytime: true,
      currentDate: new Date(),
      currentZodiacSign: 'gemini'
    });

    log.info('🔬 KALCHM & MONICA CONSTANTS:');
    log.info(`  Kalchm (K_alchm): ${result.kalchm.thermodynamics.kalchm.toFixed(6)}`);
    log.info(`  Monica Constant: ${result.kalchm.thermodynamics.monicaConstant.toFixed(6)}`);
    log.info(`  Heat: ${result.kalchm.thermodynamics.heat.toFixed(6)}`);
    log.info(`  Entropy: ${result.kalchm.thermodynamics.entropy.toFixed(6)}`);
    log.info(`  Reactivity: ${result.kalchm.thermodynamics.reactivity.toFixed(6)}`);
    log.info(`  Greg's Energy: ${result.kalchm.thermodynamics.gregsEnergy.toFixed(6)}\n`);

    log.info('🧪 ALCHEMICAL PROPERTIES:');
    log.info(`  Spirit: ${result.kalchm.alchemicalProperties.Spirit.toFixed(3)}`);
    log.info(`  Essence: ${result.kalchm.alchemicalProperties.Essence.toFixed(3)}`);
    log.info(`  Matter: ${result.kalchm.alchemicalProperties.Matter.toFixed(3)}`);
    log.info(`  Substance: ${result.kalchm.alchemicalProperties.Substance.toFixed(3)}`);
    log.info(`  Dominant Property: ${result.kalchm.dominantProperty}\n`);

    log.info('🌟 ELEMENTAL PROPERTIES:');
    const resultData = result as unknown;
    const elementalState = resultData?.elementalState ||;
      resultData?.kalchm?.elementalProperties || { Fire: 0, Water: 0, Air: 0, Earth: 0 };
    log.info(`  Fire: ${(elementalState.Fire * 100).toFixed(1)}%`);
    log.info(`  Water: ${(elementalState.Water * 100).toFixed(1)}%`);
    log.info(`  Air: ${(elementalState.Air * 100).toFixed(1)}%`);
    log.info(`  Earth: ${(elementalState.Earth * 100).toFixed(1)}%`);
    log.info(`  Dominant Element: ${result.kalchm.dominantElement}\n`);

    log.info('🪐 PLANETARY INFLUENCES:');
    const topPlanets = result.planetaryInfluences.dominantPlanets.slice(0, 3);
    (topPlanets || []).forEach((planet, index) => {
      log.info(
        `  ${index + 1}. ${planet.planet}: ${(planet.strength * 100).toFixed(1)}% (${planet.element})`,
      );
    });
    log.info('');

    log.info('🍳 CULINARY RECOMMENDATIONS:');
    log.info(
      `  Ingredients: ${result.recommendations.culinary.ingredients.slice(0, 3).join(', ')}`,
    );
    log.info(
      `  Cooking Methods: ${result.recommendations.culinary.cookingMethods.slice(0, 3).join(', ')}`,
    );
    log.info(`  Flavors: ${result.recommendations.culinary.flavors.slice(0, 3).join(', ')}`);
    log.info(`  Timing: ${result.recommendations.culinary.timing.slice(0, 2).join(', ')}\n`);

    log.info('📊 ELEMENTAL RECOMMENDATIONS:');
    log.info(`  Balance Score: ${result.recommendations.elemental.balance.toFixed(3)}`);
    log.info(
      `  Recommendations: ${result.recommendations.elemental.recommendations.slice(0, 2).join(', ')}\n`,
    );

    // Test recipe compatibility
    log.info('🥘 RECIPE COMPATIBILITY TEST:');
    const testRecipe = { Fire: 0.3, Water: 0.2, Air: 0.35, Earth: 0.15 };

    const compatibility = await import('./calculations/index').then(mod =>;
      mod.calculateRecipeCompatibility(testRecipe, result),
    );

    log.info(`  Overall Compatibility: ${(compatibility.compatibilityScore * 100).toFixed(1)}%`);
    log.info(`  Elemental Alignment: ${(compatibility.elementalAlignment * 100).toFixed(1)}%`);
    log.info(`  Kalchm Alignment: ${(compatibility.kalchmAlignment * 100).toFixed(1)}%`);
    log.info(`  Planetary Alignment: ${(compatibility.planetaryAlignment * 100).toFixed(1)}%`);
    log.info(`  Recommendations: ${compatibility.recommendations.slice(0, 2).join(', ')}\n`);

    log.info('✅ Streamlined system test completed successfully!');
    log.info(`📝 Cache Key: ${result.cacheKey}`);
    log.info(`⏰ Timestamp: ${result.timestamp}`);
  } catch (error) {
    console.error('❌ Error in streamlined system test:', error);
  }
}

// Run the test
testStreamlinedSystem();
