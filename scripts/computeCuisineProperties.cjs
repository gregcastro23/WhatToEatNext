#!/usr/bin/env node

/**
 * Cuisine Properties Computation Script
 *
 * Computes cuisine-level properties from recipe collections using the hierarchical system.
 * This script processes all cuisines and generates comprehensive statistical signatures.
 */

const fs = require("fs");
const path = require("path");

// Mock console methods for better output formatting
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

console.log = (...args) => {
  const timestamp = new Date().toISOString().slice(11, 19);
  originalConsoleLog(`[${timestamp}]`, ...args);
};

console.error = (...args) => {
  const timestamp = new Date().toISOString().slice(11, 19);
  originalConsoleError(`[${timestamp}] ERROR:`, ...args);
};

// ========== UTILITIES ==========

/**
 * Load a module with error handling
 */
function loadModule(modulePath) {
  try {
    return require(modulePath);
  } catch (error) {
    console.error(`Failed to load module: ${modulePath}`, error.message);
    process.exit(1);
  }
}

/**
 * Get all cuisine files
 */
function getCuisineFiles() {
  const cuisinesDir = path.join(__dirname, "..", "src", "data", "cuisines");
  const files = fs
    .readdirSync(cuisinesDir)
    .filter(
      (file) =>
        file.endsWith(".ts") && file !== "index.ts" && file !== "__mocks__",
    );

  return files.map((file) => ({
    name: file.replace(".ts", ""),
    path: path.join(cuisinesDir, file),
  }));
}

/**
 * Load cuisine data
 */
function loadCuisineData(cuisinePath) {
  try {
    // Clear require cache to get fresh data
    delete require.cache[require.resolve(cuisinePath)];
    const module = require(cuisinePath);
    return module.default || module[Object.keys(module)[0]];
  } catch (error) {
    console.error(`Failed to load cuisine: ${cuisinePath}`, error.message);
    return null;
  }
}

/**
 * Mock planetary positions for recipe computation
 */
function generateMockPlanetaryPositions(recipeIndex = 0) {
  const planets = [
    "Sun",
    "Moon",
    "Mercury",
    "Venus",
    "Mars",
    "Jupiter",
    "Saturn",
    "Uranus",
    "Neptune",
    "Pluto",
  ];
  const signs = [
    "aries",
    "taurus",
    "gemini",
    "cancer",
    "leo",
    "virgo",
    "libra",
    "scorpio",
    "sagittarius",
    "capricorn",
    "aquarius",
    "pisces",
  ];

  const positions = {};

  // Use recipe index to create varied but deterministic positions
  planets.forEach((planet, index) => {
    const signIndex = (recipeIndex + index) % signs.length;
    positions[planet] = signs[signIndex];
  });

  return positions;
}

// ========== MAIN COMPUTATION ==========

async function main() {
  console.log("🍽️  Starting Cuisine Properties Computation");
  console.log("==========================================");

  try {
    // Load required modules
    console.log("Loading computation modules...");

    const { computeRecipeProperties } = loadModule(
      "../src/utils/hierarchicalRecipeCalculations.ts",
    );
    const { computeCuisineProperties } = loadModule(
      "../src/utils/cuisine/cuisineAggregationEngine.ts",
    );
    const { identifyCuisineSignatures, DEFAULT_GLOBAL_BASELINE } = loadModule(
      "../src/utils/cuisine/signatureIdentificationEngine.ts",
    );
    const { analyzePlanetaryPatterns } = loadModule(
      "../src/utils/cuisine/planetaryPatternAnalysis.ts",
    );
    const { applyCulturalInfluences } = loadModule(
      "../src/utils/cuisine/culturalInfluenceEngine.ts",
    );
    const { getGlobalCache } = loadModule(
      "../src/utils/cuisine/cuisineComputationCache.ts",
    );

    console.log("✅ Modules loaded successfully");

    // Get cuisine files
    const cuisineFiles = getCuisineFiles();
    console.log(`📁 Found ${cuisineFiles.length} cuisine files`);

    const results = {
      successful: [],
      failed: [],
      summary: {
        totalCuisines: cuisineFiles.length,
        totalRecipes: 0,
        totalSignatures: 0,
        computationTime: 0,
      },
    };

    const startTime = Date.now();

    // Process each cuisine
    for (let i = 0; i < cuisineFiles.length; i++) {
      const { name: cuisineName, path: cuisinePath } = cuisineFiles[i];
      console.log(
        `\n[${i + 1}/${cuisineFiles.length}] Processing ${cuisineName}...`,
      );

      try {
        // Load cuisine data
        const cuisineData = loadCuisineData(cuisinePath);
        if (!cuisineData) {
          results.failed.push({
            cuisine: cuisineName,
            error: "Failed to load cuisine data",
          });
          continue;
        }

        // Extract recipes from cuisine data
        const recipes = [];
        const mealTypes = ["breakfast", "lunch", "dinner", "dessert", "snacks"];
        const seasons = ["all", "summer", "winter", "spring", "fall"];

        mealTypes.forEach((mealType) => {
          if (!cuisineData.dishes[mealType]) return;

          seasons.forEach((season) => {
            const seasonRecipes = cuisineData.dishes[mealType][season];
            if (seasonRecipes && Array.isArray(seasonRecipes)) {
              recipes.push(...seasonRecipes);
            }
          });
        });

        if (recipes.length === 0) {
          console.log(`⚠️  No recipes found for ${cuisineName}`);
          results.failed.push({
            cuisine: cuisineName,
            error: "No recipes found",
          });
          continue;
        }

        console.log(`📊 Found ${recipes.length} recipes for ${cuisineName}`);

        // Compute recipe properties
        console.log("Computing recipe properties...");
        const recipeComputedProperties = [];

        for (let j = 0; j < recipes.length; j++) {
          const recipe = recipes[j];
          const planetaryPositions = generateMockPlanetaryPositions(j);

          try {
            // Extract ingredients and cooking methods
            const ingredients = recipe.ingredients || [];
            const cookingMethods = recipe.cookingMethods || [];

            // Compute recipe properties
            const computed = computeRecipeProperties(
              ingredients,
              cookingMethods,
              {
                planetaryPositions,
                applyCookingMethods: true,
                quantityScaling: "logarithmic",
                cacheResults: false,
              },
            );

            recipeComputedProperties.push(computed);
          } catch (error) {
            console.log(`⚠️  Failed to compute recipe ${j}: ${error.message}`);
          }
        }

        if (recipeComputedProperties.length === 0) {
          results.failed.push({
            cuisine: cuisineName,
            error: "Failed to compute any recipe properties",
          });
          continue;
        }

        // Compute cuisine properties
        console.log("Computing cuisine properties...");
        let cuisineProperties = computeCuisineProperties(
          recipeComputedProperties,
          {
            weightingStrategy: "equal",
            includeVariance: true,
            identifyPlanetaryPatterns: true,
          },
        );

        // Identify signatures
        console.log("Identifying cuisine signatures...");
        const signatures = identifyCuisineSignatures(
          cuisineProperties,
          DEFAULT_GLOBAL_BASELINE,
          {
            threshold: 1.5,
            includeConfidence: true,
          },
        );

        // Update cuisine properties with signatures
        cuisineProperties = {
          ...cuisineProperties,
          signatures,
        };

        // Analyze planetary patterns
        console.log("Analyzing planetary patterns...");
        const planetaryPatterns = analyzePlanetaryPatterns(
          recipeComputedProperties,
          {
            minStrength: 0.3,
            includeCulturalNotes: true,
          },
        );

        cuisineProperties = {
          ...cuisineProperties,
          planetaryPatterns,
        };

        // Apply cultural influences if available
        if (cuisineData.culturalInfluence) {
          console.log("Applying cultural influences...");
          cuisineProperties = applyCulturalInfluences(
            cuisineProperties,
            cuisineData.culturalInfluence,
          );
        }

        // Cache the results
        const cache = getGlobalCache();
        cache.set(
          cuisineName,
          cuisineProperties,
          {},
          recipes.map((_, idx) => `${cuisineName}_${idx}`),
        );

        // Store results
        results.successful.push({
          cuisine: cuisineName,
          properties: cuisineProperties,
          recipeCount: recipeComputedProperties.length,
          signatureCount: signatures.length,
        });

        results.summary.totalRecipes += recipeComputedProperties.length;
        results.summary.totalSignatures += signatures.length;

        console.log(
          `✅ ${cuisineName}: ${recipeComputedProperties.length} recipes, ${signatures.length} signatures`,
        );
      } catch (error) {
        console.error(`❌ Failed to process ${cuisineName}:`, error.message);
        results.failed.push({ cuisine: cuisineName, error: error.message });
      }
    }

    const endTime = Date.now();
    results.summary.computationTime = endTime - startTime;

    // Generate summary report
    console.log("\n" + "=".repeat(50));
    console.log("📊 COMPUTATION SUMMARY");
    console.log("=".repeat(50));

    console.log(
      `✅ Successful: ${results.successful.length}/${results.summary.totalCuisines}`,
    );
    console.log(
      `❌ Failed: ${results.failed.length}/${results.summary.totalCuisines}`,
    );
    console.log(`📚 Total Recipes: ${results.summary.totalRecipes}`);
    console.log(`🎯 Total Signatures: ${results.summary.totalSignatures}`);
    console.log(
      `⏱️  Total Time: ${(results.summary.computationTime / 1000).toFixed(2)}s`,
    );
    console.log(
      `📈 Average per cuisine: ${(results.summary.computationTime / results.summary.totalCuisines).toFixed(0)}ms`,
    );

    if (results.successful.length > 0) {
      console.log("\n🏆 TOP SIGNATURES FOUND:");
      const topSignatures = results.successful
        .filter((r) => r.signatureCount > 0)
        .sort((a, b) => b.signatureCount - a.signatureCount)
        .slice(0, 5);

      topSignatures.forEach((result) => {
        console.log(`  ${result.cuisine}: ${result.signatureCount} signatures`);
      });
    }

    if (results.failed.length > 0) {
      console.log("\n⚠️  FAILED CUISINES:");
      results.failed.forEach((failure) => {
        console.log(`  ${failure.cuisine}: ${failure.error}`);
      });
    }

    // Save results to file
    const outputPath = path.join(
      __dirname,
      "..",
      "computed_cuisine_properties.json",
    );
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 Results saved to: ${outputPath}`);

    console.log("\n🎉 Cuisine properties computation completed!");
  } catch (error) {
    console.error("💥 Fatal error during computation:", error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error("💥 Unhandled error:", error);
    process.exit(1);
  });
}

module.exports = { main };
