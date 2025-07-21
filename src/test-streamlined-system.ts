// TODO: Fix import - add what to import from "./calculations/index.ts"
import { Element } from "@/types/alchemy";
import { PlanetaryPosition } from "@/types/celestial";
import { Recipe } from '@/types/recipe';

import { calculateComprehensiveAlchemicalResult } from './calculations/index';
// TODO: Fix import - add what to import from "./types/alchemy.ts"
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
  console.log('=== Streamlined Alchemical Calculation System Test ===\n');
  
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

    console.log('🔬 KALCHM & MONICA CONSTANTS:');
    console.log(`  Kalchm (K_alchm): ${result?.kalchm?.thermodynamics?.kalchm.toFixed(6)}`);
    console.log(`  Monica Constant: ${result?.kalchm?.thermodynamics?.monicaConstant.toFixed(6)}`);
    console.log(`  Heat: ${result?.kalchm?.thermodynamics?.heat.toFixed(6)}`);
    console.log(`  Entropy: ${result?.kalchm?.thermodynamics?.entropy.toFixed(6)}`);
    console.log(`  Reactivity: ${result?.kalchm?.thermodynamics?.reactivity.toFixed(6)}`);
    console.log(`  Greg's Energy: ${result?.kalchm?.thermodynamics?.gregsEnergy.toFixed(6)}\n`);

    console.log('🧪 ALCHEMICAL PROPERTIES:');
    console.log(`  Spirit: ${result?.kalchm?.alchemicalProperties?.Spirit.toFixed(3)}`);
    console.log(`  Essence: ${result?.kalchm?.alchemicalProperties?.Essence.toFixed(3)}`);
    console.log(`  Matter: ${result?.kalchm?.alchemicalProperties?.Matter.toFixed(3)}`);
    console.log(`  Substance: ${result?.kalchm?.alchemicalProperties?.Substance.toFixed(3)}`);
    console.log(`  Dominant Property: ${result.kalchm.dominantProperty}\n`);

    console.log('🌟 ELEMENTAL PROPERTIES:');
    const resultData = result as any;
    const elementalState = resultData?.elementalState || resultData?.kalchm?.elementalProperties || { Fire: 0, Water: 0, Air: 0, Earth: 0 };
    console.log(`  Fire: ${(elementalState.Fire * 100)?.toFixed(1)}%`);
    console.log(`  Water: ${(elementalState.Water * 100)?.toFixed(1)}%`);
    console.log(`  Air: ${(elementalState.Air * 100)?.toFixed(1)}%`);
    console.log(`  Earth: ${(elementalState.Earth * 100)?.toFixed(1)}%`);
    console.log(`  Dominant Element: ${result.kalchm.dominantElement}\n`);

    console.log('🪐 PLANETARY INFLUENCES:');
    const topPlanets = result?.planetaryInfluences?.dominantPlanets?.slice(0, 3);
    (topPlanets || []).forEach((planet, index) => {
      console.log(`  ${index + 1}. ${planet.planet}: ${(planet.strength * 100)?.toFixed(1)}% (${planet.element})`);
    });
    console.log();

    console.log('🍳 CULINARY RECOMMENDATIONS:');
    console.log(`  Ingredients: ${result?.recommendations?.culinary?.ingredients?.slice(0, 3)?.join(', ')}`);
    console.log(`  Cooking Methods: ${result?.recommendations?.culinary?.cookingMethods?.slice(0, 3)?.join(', ')}`);
    console.log(`  Flavors: ${result?.recommendations?.culinary?.flavors?.slice(0, 3)?.join(', ')}`);
    console.log(`  Timing: ${result?.recommendations?.culinary?.timing?.slice(0, 2)?.join(', ')}\n`);

    console.log('📊 ELEMENTAL RECOMMENDATIONS:');
    console.log(`  Balance Score: ${result?.recommendations?.elemental?.balance.toFixed(3)}`);
    console.log(`  Recommendations: ${result?.recommendations?.elemental?.recommendations?.slice(0, 2)?.join(', ')}\n`);

    // Test recipe compatibility
    console.log('🥘 RECIPE COMPATIBILITY TEST:');
    const testRecipe = { Fire: 0.3, Water: 0.2, Air: 0.35,
      Earth: 0.15
    };

    const compatibility = await import('./calculations/index')?.then(mod => 
      mod.calculateRecipeCompatibility(testRecipe, result)
    );

    console.log(`  Overall Compatibility: ${(compatibility.compatibilityScore * 100)?.toFixed(1)}%`);
    console.log(`  Elemental Alignment: ${(compatibility.elementalAlignment * 100)?.toFixed(1)}%`);
    console.log(`  Kalchm Alignment: ${(compatibility.kalchmAlignment * 100)?.toFixed(1)}%`);
    console.log(`  Planetary Alignment: ${(compatibility.planetaryAlignment * 100)?.toFixed(1)}%`);
    console.log(`  Recommendations: ${compatibility.recommendations?.slice(0, 2)?.join(', ')}\n`);

    console.log('✅ Streamlined system test completed successfully!');
    console.log(`📝 Cache Key: ${result.cacheKey}`);
    console.log(`⏰ Timestamp: ${result.timestamp}`);

  } catch (error) {
    console.error('❌ Error in streamlined system test:', error);
  }
}

// Run the test
testStreamlinedSystem(); 