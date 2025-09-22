// CommonJS imports
const { _celestialCalculator} = require('../services/celestialCalculations')

// Local interface for testing purposes
interface PlanetaryPosition {
  planet: string,
  sign: string,
  degrees: number
}

// Create a test function to verify gas giant calculations
async function testGasGiantInfluences() {
  _logger.info('🪐 Testing Gas Giant Influence Calculations 🪐')
  _logger.info('============================================')

  // Test Jupiter and Saturn dignity states
  _logger.info('Testing Gas Giant dignities and aspects\n')

  // Access calculated influences
  const influences = celestialCalculator.calculateCurrentInfluences()

  // Find Jupiter and Saturn in dominant planets
  const _jupiter = influences.dominantPlanets?.find(p => p.name === 'Jupiter')
  const _saturn = influences.dominantPlanets?.find(p => p.name === 'Saturn')

  _logger.info('Current Influences: ')
  _logger.info(`Zodiac Sign: ${influences.zodiacSign || 'unknown'}`)
  _logger.info(`Lunar Phase: ${influences.lunarPhase || 'unknown'}`)

  _logger.info('\nDominant Planets: ')
  if (influences.dominantPlanets) {
    for (const planet of influences.dominantPlanets) {
      if (planet.name === 'Jupiter' || planet.name === 'Saturn') {
        _logger.info(
          `${planet.name}: influence = ${planet.influence}, effect = ${planet.effect || 'balanced'}`,
        )
      }
    }
  }

  // Check planetary aspects
  _logger.info('\nPlanetary Aspects: ')
  const aspects = influences.aspectInfluences || [];
  for (const aspect of aspects) {
    if (
      (aspect.planet1 === 'Jupiter' || aspect.planet1 === 'Saturn') &&
      (aspect.planet2 === 'Jupiter' || aspect.planet2 === 'Saturn')
    ) {
      _logger.info(
        `${aspect.planet1} ${aspect.type} ${aspect.planet2}, strength: ${aspect.strength || aspect.orb}`,
      )
    }
  }

  // Print energy state balance
  if (influences.energyStateBalance) {
    _logger.info('\nEnergy State Balance: ')
    Object.entries(influences.energyStateBalance).forEach(([state, value]) => {
      _logger.info(`  ${state}: ${value}`)
    })
  }
}

// Execute the test
testGasGiantInfluences()
  .then(() => _logger.info('\nTest completed successfully!'))
  .catch(error => _logger.error('Test failed:', error))
