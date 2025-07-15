// CommonJS imports
const { celestialCalculator } = require('../services/celestialCalculations');

// Local interface for testing purposes
interface PlanetaryPosition {
  planet: string;
  sign: string;
  degrees: number;
}

// Create a test function to verify gas giant calculations
async function testGasGiantInfluences() {
  console.log('🪐 Testing Gas Giant Influence Calculations 🪐');
  console.log('============================================');
  
  // Test Jupiter and Saturn dignity states
  console.log('Testing Gas Giant dignities and aspects\n');
  
  // Access calculated influences
  const influences = celestialCalculator.calculateCurrentInfluences();
  
  // Find Jupiter and Saturn in dominant planets
  const jupiter = influences.dominantPlanets?.find(p => p.name === 'Jupiter');
  const saturn = influences.dominantPlanets?.find(p => p.name === 'Saturn');
  
  console.log('Current Influences:');
  console.log(`Zodiac Sign: ${influences.zodiacSign || 'unknown'}`);
  console.log(`Lunar Phase: ${influences.lunarPhase || 'unknown'}`);
  
  console.log('\nDominant Planets:');
  if (influences.dominantPlanets) {
    for (const planet of influences.dominantPlanets) {
      if (planet.name === 'Jupiter' || planet.name === 'Saturn') {
        console.log(`${planet.name}: influence = ${planet.influence}, effect = ${planet.effect || 'balanced'}`);
      }
    }
  }
  
  // Check planetary aspects
  console.log('\nPlanetary Aspects:');
  const aspects = influences.aspectInfluences || [];
  for (const aspect of aspects) {
    if (
      (aspect.planet1 === 'Jupiter' || aspect.planet1 === 'Saturn') && 
      (aspect.planet2 === 'Jupiter' || aspect.planet2 === 'Saturn')
    ) {
      console.log(`${aspect.planet1} ${aspect.type} ${aspect.planet2}, strength: ${aspect.strength || aspect.orb}`);
    }
  }
  
  // Print energy state balance
  if (influences.energyStateBalance) {
    console.log('\nEnergy State Balance:');
    Object.entries(influences.energyStateBalance).forEach(([state, value]) => {
      console.log(`  ${state}: ${value}`);
    });
  }
}

// Execute the test
testGasGiantInfluences()
  .then(() => console.log('\nTest completed successfully!'))
  .catch(error => console.error('Test failed:', error)); 