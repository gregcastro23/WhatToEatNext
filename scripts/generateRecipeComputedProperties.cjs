#!/usr/bin/env node

/**
 * Generate Recipe Computed Properties
 *
 * Script to compute and cache properties for recipes in the hierarchical
 * culinary data system using planetary alchemy and thermodynamic calculations.
 */

const fs = require("fs");
const path = require("path");

// Mock planetary positions for demonstration
const SAMPLE_PLANETARY_POSITIONS = {
  Sun: "Leo",
  Moon: "Cancer",
  Mercury: "Virgo",
  Venus: "Libra",
  Mars: "Aries",
  Jupiter: "Sagittarius",
  Saturn: "Capricorn",
  Uranus: "Aquarius",
  Neptune: "Pisces",
  Pluto: "Scorpio",
};

// Mock computation functions (would be imported from actual modules)
function calculateAlchemicalFromPlanets(positions) {
  // Simplified alchemical calculation
  const alchemy = {
    Spirit: 0,
    Essence: 0,
    Matter: 0,
    Substance: 0,
  };

  // Count planetary influences (simplified)
  for (const planet in positions) {
    switch (planet) {
      case "Sun":
      case "Mercury":
      case "Jupiter":
      case "Saturn":
        alchemy.Spirit += 1;
        break;
      case "Moon":
      case "Venus":
      case "Mars":
      case "Uranus":
      case "Neptune":
      case "Pluto":
        alchemy.Essence += 1;
        break;
      default:
        alchemy.Matter += 1;
    }
  }

  // Normalize to typical ranges
  alchemy.Spirit = Math.min(alchemy.Spirit, 4);
  alchemy.Essence = Math.min(alchemy.Essence, 6);
  alchemy.Matter = Math.min(alchemy.Matter, 5);
  alchemy.Substance = Math.min(alchemy.Substance, 3);

  return alchemy;
}

function aggregateZodiacElementals(positions) {
  const elements = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  let count = 0;

  for (const sign of Object.values(positions)) {
    switch (sign) {
      case "Aries":
      case "Leo":
      case "Sagittarius":
        elements.Fire += 1;
        break;
      case "Taurus":
      case "Virgo":
      case "Capricorn":
        elements.Earth += 1;
        break;
      case "Gemini":
      case "Libra":
      case "Aquarius":
        elements.Air += 1;
        break;
      case "Cancer":
      case "Scorpio":
      case "Pisces":
        elements.Water += 1;
        break;
    }
    count += 1;
  }

  // Normalize
  return {
    Fire: count > 0 ? elements.Fire / count : 0.25,
    Water: count > 0 ? elements.Water / count : 0.25,
    Earth: count > 0 ? elements.Earth / count : 0.25,
    Air: count > 0 ? elements.Air / count : 0.25,
  };
}

function calculateThermodynamicMetrics(alchemical, elemental) {
  const { Spirit, Essence, Matter, Substance } = alchemical;
  const { Fire, Water, Earth, Air } = elemental;

  // Simplified thermodynamic calculations
  const heat =
    (Spirit * 0.3 + Fire * 0.7) /
    (Substance + Essence + Matter + Water + Air + Earth + 1);
  const entropy =
    (Spirit * 0.2 + Substance * 0.3 + Fire * 0.2 + Air * 0.3) /
    (Essence + Matter + Earth + Water + 1);
  const reactivity =
    (Spirit * 0.25 + Substance * 0.25 + Essence * 0.25 + Fire * 0.25) /
    (Matter + Earth + 1);

  return {
    heat: Math.min(heat, 1),
    entropy: Math.min(entropy, 1),
    reactivity: Math.min(reactivity, 1),
    gregsEnergy: heat - entropy * reactivity,
    kalchm: Spirit + Essence > 0 ? Spirit / (Spirit + Essence) : 0.5,
    monica: 1.0, // Simplified
  };
}

function getDominantElement(elemental) {
  const entries = Object.entries(elemental);
  entries.sort(([, a], [, b]) => b - a);
  return entries[0][0];
}

function getDominantAlchemical(alchemical) {
  const entries = Object.entries(alchemical);
  entries.sort(([, a], [, b]) => b - a);
  return entries[0][0];
}

function calculateRecipeKinetics(alchemical, thermodynamic, positions) {
  const { Spirit, Essence, Matter, Substance } = alchemical;
  const { gregsEnergy, reactivity } = thermodynamic;

  // Simplified kinetic calculations
  const charge = Matter + Substance;
  const potential = charge > 0 ? gregsEnergy / charge : 0;
  const current = reactivity * 0.5;
  const power = current * potential;

  return {
    velocity: { Fire: 0.1, Water: 0.1, Earth: 0.1, Air: 0.1 },
    momentum: { Fire: 0.1, Water: 0.1, Earth: 0.1, Air: 0.1 },
    charge,
    potentialDifference: potential,
    currentFlow: current,
    power,
    inertia: 1 + (Matter + Substance) * 0.1,
    force: {
      Fire: power * (Spirit / (Spirit + Essence + Matter + Substance + 1)),
      Water: power * (Essence / (Spirit + Essence + Matter + Substance + 1)),
      Earth: power * (Matter / (Spirit + Essence + Matter + Substance + 1)),
      Air: power * (Substance / (Spirit + Essence + Matter + Substance + 1)),
    },
    forceMagnitude: Math.abs(power),
    forceClassification:
      power > 1 ? "accelerating" : power < 0.5 ? "decelerating" : "balanced",
    aspectPhase: null,
    thermalDirection: gregsEnergy > 0 ? "heating" : "cooling",
  };
}

// Configuration
const INPUT_FILE = "src/data/enhanced_recipes/enhanced_recipes.json";
const OUTPUT_FILE = "src/data/computed_recipes/computed_recipes.json";
const CACHE_FILE = "src/data/cache/recipe_computation_cache.json";

/**
 * Load enhanced recipes
 */
function loadEnhancedRecipes() {
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`Input file not found: ${INPUT_FILE}`);
    return [];
  }

  try {
    const data = JSON.parse(fs.readFileSync(INPUT_FILE, "utf8"));
    return data.enhancedRecipes || [];
  } catch (e) {
    console.error(`Failed to load recipes: ${e.message}`);
    return [];
  }
}

/**
 * Compute properties for a single recipe
 */
function computeRecipeProperties(recipe) {
  console.log(`Computing properties for: ${recipe.name}`);

  try {
    // Use recipe-specific planetary positions if available, otherwise use sample
    const planetaryPositions =
      recipe.astrologicalTiming?.optimalPositions || SAMPLE_PLANETARY_POSITIONS;

    // Step 1: Aggregate ingredient elementals
    const ingredientElementals = aggregateIngredientElementals(
      recipe.ingredients || [],
    );

    // Step 2: Calculate ESMS from planetary positions
    const alchemicalProperties =
      calculateAlchemicalFromPlanets(planetaryPositions);

    // Step 3: Aggregate zodiac elementals
    const zodiacElementals = aggregateZodiacElementals(planetaryPositions);

    // Step 4: Combine elementals (70% ingredients, 30% zodiac)
    const combinedElementals = {
      Fire: ingredientElementals.Fire * 0.7 + zodiacElementals.Fire * 0.3,
      Water: ingredientElementals.Water * 0.7 + zodiacElementals.Water * 0.3,
      Earth: ingredientElementals.Earth * 0.7 + zodiacElementals.Earth * 0.3,
      Air: ingredientElementals.Air * 0.7 + zodiacElementals.Air * 0.3,
    };

    // Step 5: Apply cooking method transformations
    const finalElementals = applyCookingTransforms(
      combinedElementals,
      recipe.cookingMethod || [],
    );

    // Step 6: Calculate thermodynamic metrics
    const thermodynamicMetrics = calculateThermodynamicMetrics(
      alchemicalProperties,
      finalElementals,
    );

    // Step 7: Calculate kinetic properties
    const kineticProperties = calculateRecipeKinetics(
      alchemicalProperties,
      thermodynamicMetrics,
      planetaryPositions,
    );

    // Step 8: Determine dominant properties
    const dominantElement = getDominantElement(finalElementals);
    const dominantAlchemicalProperty =
      getDominantAlchemical(alchemicalProperties);

    // Create computed properties object
    const computedProperties = {
      alchemicalProperties,
      elementalProperties: finalElementals,
      thermodynamicProperties: thermodynamicMetrics,
      kineticProperties,
      dominantElement,
      dominantAlchemicalProperty,
      computationMetadata: {
        planetaryPositionsUsed: planetaryPositions,
        cookingMethodsApplied: recipe.cookingMethod || [],
        computationTimestamp: new Date().toISOString(),
      },
    };

    return computedProperties;
  } catch (e) {
    console.error(
      `Failed to compute properties for ${recipe.name}: ${e.message}`,
    );
    return null;
  }
}

/**
 * Aggregate elemental properties from ingredients
 */
function aggregateIngredientElementals(ingredients) {
  if (!ingredients || ingredients.length === 0) {
    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  }

  const totals = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  let totalWeight = 0;

  for (const ingredient of ingredients) {
    const elementals = ingredient.elementalProperties || {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    };
    const weight = Math.log(ingredient.amount + 1); // Logarithmic scaling

    totals.Fire += elementals.Fire * weight;
    totals.Water += elementals.Water * weight;
    totals.Earth += elementals.Earth * weight;
    totals.Air += elementals.Air * weight;
    totalWeight += weight;
  }

  // Normalize
  if (totalWeight > 0) {
    return {
      Fire: totals.Fire / totalWeight,
      Water: totals.Water / totalWeight,
      Earth: totals.Earth / totalWeight,
      Air: totals.Air / totalWeight,
    };
  }

  return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
}

/**
 * Apply cooking method transformations
 */
function applyCookingTransforms(baseElementals, cookingMethods) {
  const modifiers = {
    grilling: { Fire: 1.4, Water: 0.6, Earth: 0.9, Air: 1.1 },
    boiling: { Fire: 0.7, Water: 1.3, Earth: 0.8, Air: 1.0 },
    baking: { Fire: 1.2, Water: 0.8, Earth: 1.1, Air: 0.9 },
    frying: { Fire: 1.5, Water: 0.5, Earth: 0.8, Air: 1.2 },
    steaming: { Fire: 0.6, Water: 1.4, Earth: 0.9, Air: 1.1 },
    roasting: { Fire: 1.3, Water: 0.7, Earth: 1.0, Air: 1.0 },
    fermenting: { Fire: 0.6, Water: 1.2, Earth: 1.3, Air: 0.9 },
    braising: { Fire: 0.9, Water: 1.1, Earth: 1.0, Air: 0.8 },
  };

  let current = { ...baseElementals };

  for (const method of cookingMethods) {
    const methodModifiers = modifiers[method.toLowerCase()];
    if (methodModifiers) {
      current = {
        Fire: current.Fire * methodModifiers.Fire,
        Water: current.Water * methodModifiers.Water,
        Earth: current.Earth * methodModifiers.Earth,
        Air: current.Air * methodModifiers.Air,
      };

      // Re-normalize
      const total = current.Fire + current.Water + current.Earth + current.Air;
      if (total > 0) {
        current = {
          Fire: current.Fire / total,
          Water: current.Water / total,
          Earth: current.Earth / total,
          Air: current.Air / total,
        };
      }
    }
  }

  return current;
}

/**
 * Save computed recipes
 */
function saveComputedRecipes(recipes) {
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const output = {
    computedRecipes: recipes,
    metadata: {
      totalRecipes: recipes.length,
      computationDate: new Date().toISOString(),
      planetaryPositionsUsed: SAMPLE_PLANETARY_POSITIONS,
      version: "1.0",
    },
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`Saved ${recipes.length} computed recipes to ${OUTPUT_FILE}`);
}

/**
 * Save computation cache
 */
function saveComputationCache(cache) {
  const cacheDir = path.dirname(CACHE_FILE);
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
  console.log(`Saved computation cache to ${CACHE_FILE}`);
}

/**
 * Main computation function
 */
function generateRecipeComputedProperties() {
  console.log("Starting recipe computed properties generation...");

  // Load enhanced recipes
  const recipes = loadEnhancedRecipes();
  console.log(`Loaded ${recipes.length} enhanced recipes`);

  if (recipes.length === 0) {
    console.log("No recipes found. Run enhancement script first.");
    return;
  }

  // Compute properties for each recipe
  const computedRecipes = [];
  const cache = {
    entries: [],
    metadata: {
      createdAt: new Date().toISOString(),
      planetaryPositions: SAMPLE_PLANETARY_POSITIONS,
    },
  };

  for (const recipe of recipes) {
    const computedProperties = computeRecipeProperties(recipe);

    if (computedProperties) {
      const computedRecipe = {
        ...recipe,
        _computed: computedProperties,
      };

      computedRecipes.push(computedRecipe);

      // Add to cache
      cache.entries.push({
        recipeId: recipe.id,
        computedProperties,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Save results
  saveComputedRecipes(computedRecipes);
  saveComputationCache(cache);

  console.log("\nRecipe computed properties generation complete!");
  console.log(
    `Successfully computed properties for ${computedRecipes.length} recipes`,
  );

  // Display summary
  const elements = ["Fire", "Water", "Earth", "Air"];
  const alchemical = ["Spirit", "Essence", "Matter", "Substance"];

  console.log("\n--- Computation Summary ---");
  console.log(`Total recipes processed: ${recipes.length}`);
  console.log(`Successfully computed: ${computedRecipes.length}`);
  console.log(
    `Computation rate: ${Math.round((computedRecipes.length / recipes.length) * 100)}%`,
  );

  // Show sample results
  if (computedRecipes.length > 0) {
    const sample = computedRecipes[0];
    console.log(`\nSample recipe: ${sample.name}`);
    console.log(`Dominant element: ${sample._computed.dominantElement}`);
    console.log(
      `Dominant alchemical: ${sample._computed.dominantAlchemicalProperty}`,
    );
    console.log(
      `Kinetic power: ${sample._computed.kineticProperties.power.toFixed(3)}`,
    );
  }
}

// Run computation if called directly
if (require.main === module) {
  generateRecipeComputedProperties();
}

module.exports = {
  computeRecipeProperties,
  aggregateIngredientElementals,
  applyCookingTransforms,
};
