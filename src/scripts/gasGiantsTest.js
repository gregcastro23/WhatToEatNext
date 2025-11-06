// CommonJS imports
const celestialCalculations = require("../services/celestialCalculations");
const celestialCalculator = celestialCalculations.celestialCalculator;

/**
 * Simple test script to verify Gas Giant influence calculations
 */
function testGasGiantInfluences() {
  console.log("🪐 Testing Gas Giant Influence Calculations 🪐");
  console.log("============================================");

  try {
    // Access calculated influences
    const influences = celestialCalculator.calculateCurrentInfluences();

    // Find Jupiter and Saturn in dominant planets
    const jupiter = influences.dominantPlanets?.find(
      (p) => p.name === "Jupiter",
    );
    const saturn = influences.dominantPlanets?.find((p) => p.name === "Saturn");

    console.log("Current Influences:");
    console.log(`Zodiac Sign: ${influences.zodiacSign || "unknown"}`);
    console.log(`Lunar Phase: ${influences.lunarPhase || "unknown"}`);

    console.log("\nDominant Planets:");
    if (influences.dominantPlanets) {
      influences.dominantPlanets.forEach((planet) => {
        console.log(
          `${planet.name}: influence = ${planet.influence}${planet.effect ? `, effect = ${planet.effect}` : ""}`,
        );
      });
    }

    // Check planetary aspects
    console.log("\nPlanetary Aspects:");
    const aspects = influences.aspectInfluences || [];
    for (const aspect of aspects) {
      console.log(
        `${aspect.planet1} ${aspect.type} ${aspect.planet2}, strength: ${aspect.strength || aspect.orb}`,
      );
    }

    // Print energy state balance
    if (influences.energyStateBalance) {
      console.log("\nEnergy State Balance:");
      Object.entries(influences.energyStateBalance).forEach(
        ([state, value]) => {
          console.log(`  ${state}: ${value.toFixed(4)}`);
        },
      );
    }
  } catch (error) {
    console.error("Error running test:", error);
  }

  console.log("\nTest completed!");
}

// Execute the test
testGasGiantInfluences();
