#!/usr/bin/env node

/**
 * Cuisine System Validation Script
 *
 * Validates the integrity and functionality of the cuisine-level computation system.
 * Performs comprehensive checks on data consistency, computational accuracy, and system performance.
 */

const fs = require("fs");
const path = require("path");

// ========== VALIDATION UTILITIES ==========

function loadModule(modulePath) {
  try {
    return require(modulePath);
  } catch (error) {
    console.error(`Failed to load module: ${modulePath}`, error.message);
    process.exit(1);
  }
}

function loadComputedProperties() {
  const propertiesPath = path.join(
    __dirname,
    "..",
    "computed_cuisine_properties.json",
  );
  if (!fs.existsSync(propertiesPath)) {
    console.log(
      "⚠️  Computed cuisine properties not found. Some validations will be skipped.",
    );
    return null;
  }

  try {
    const data = fs.readFileSync(propertiesPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("❌ Failed to load computed properties:", error.message);
    return null;
  }
}

// ========== VALIDATION CHECKS ==========

/**
 * Validate data integrity
 */
function validateDataIntegrity(computedResults) {
  console.log("\n📋 Data Integrity Validation");
  console.log("===========================");

  const issues = [];
  let checks = 0;
  let passed = 0;

  if (!computedResults) {
    console.log("⚠️  No computed data available");
    return { passed: 0, total: 1, issues: ["No computed data available"] };
  }

  const successful = computedResults.successful || [];

  // Check basic structure
  checks++;
  if (successful.length > 0) {
    passed++;
    console.log("✅ Basic structure valid");
  } else {
    issues.push("No successful computations found");
  }

  // Check cuisine properties
  successful.forEach((result, index) => {
    const { cuisine, properties } = result;

    // Check required properties
    checks++;
    if (
      properties.averageElementals &&
      properties.sampleSize &&
      properties.computedAt
    ) {
      passed++;
    } else {
      issues.push(`${cuisine}: Missing required properties`);
    }

    // Check elemental properties sum to ~1.0
    checks++;
    if (properties.averageElementals) {
      const sum = Object.values(properties.averageElementals).reduce(
        (s, v) => s + v,
        0,
      );
      if (Math.abs(sum - 1.0) < 0.01) {
        passed++;
      } else {
        issues.push(
          `${cuisine}: Elemental properties don't sum to 1.0 (sum: ${sum})`,
        );
      }
    }

    // Check signatures if present
    if (properties.signatures) {
      properties.signatures.forEach((signature, sigIndex) => {
        checks++;
        if (
          signature.property &&
          typeof signature.zscore === "number" &&
          signature.strength
        ) {
          passed++;
        } else {
          issues.push(
            `${cuisine} signature ${sigIndex}: Invalid signature structure`,
          );
        }
      });
    }

    // Check planetary patterns if present
    if (properties.planetaryPatterns) {
      properties.planetaryPatterns.forEach((pattern, patIndex) => {
        checks++;
        if (
          pattern.planet &&
          pattern.commonSigns &&
          typeof pattern.planetaryStrength === "number"
        ) {
          passed++;
        } else {
          issues.push(
            `${cuisine} pattern ${patIndex}: Invalid pattern structure`,
          );
        }
      });
    }
  });

  const success = issues.length === 0;
  console.log(
    `${success ? "✅" : "❌"} Data integrity: ${passed}/${checks} checks passed`,
  );

  if (issues.length > 0) {
    console.log("Issues found:");
    issues.forEach((issue) => console.log(`  - ${issue}`));
  }

  return { passed, total: checks, issues };
}

/**
 * Validate computational accuracy
 */
function validateComputationalAccuracy() {
  console.log("\n🧮 Computational Accuracy Validation");
  console.log("==================================");

  const issues = [];
  let checks = 0;
  let passed = 0;

  try {
    // Load computation modules
    const {
      calculateWeightedAverage,
      calculateVariance,
      calculateConfidenceInterval,
    } = loadModule("../src/utils/cuisine/cuisineAggregationEngine.ts");

    // Test weighted average
    checks++;
    const values = [1, 2, 3, 4, 5];
    const weights = [0.1, 0.2, 0.3, 0.2, 0.2];
    const avg = calculateWeightedAverage(values, weights);
    const expected = 3.0; // (1*0.1 + 2*0.2 + 3*0.3 + 4*0.2 + 5*0.2) = 3.0
    if (Math.abs(avg - expected) < 0.001) {
      passed++;
      console.log("✅ Weighted average calculation correct");
    } else {
      issues.push(
        `Weighted average incorrect: got ${avg}, expected ${expected}`,
      );
    }

    // Test variance
    checks++;
    const testValues = [1, 2, 3, 4, 5];
    const variance = calculateVariance(testValues, 3); // mean = 3
    const expectedVariance = 2.0; // ((1-3)² + (2-3)² + (3-3)² + (4-3)² + (5-3)²) / 5 = 2.0
    if (Math.abs(variance - expectedVariance) < 0.001) {
      passed++;
      console.log("✅ Variance calculation correct");
    } else {
      issues.push(
        `Variance incorrect: got ${variance}, expected ${expectedVariance}`,
      );
    }

    // Test confidence interval
    checks++;
    const ci = calculateConfidenceInterval(10, 2, 25, 0.95);
    if (ci.lower < 10 && ci.upper > 10 && ci.marginOfError > 0) {
      passed++;
      console.log("✅ Confidence interval calculation valid");
    } else {
      issues.push("Confidence interval calculation invalid");
    }
  } catch (error) {
    issues.push(`Module loading error: ${error.message}`);
  }

  const success = issues.length === 0;
  console.log(
    `${success ? "✅" : "❌"} Computational accuracy: ${passed}/${checks} checks passed`,
  );

  if (issues.length > 0) {
    console.log("Issues found:");
    issues.forEach((issue) => console.log(`  - ${issue}`));
  }

  return { passed, total: checks, issues };
}

/**
 * Validate signature identification
 */
function validateSignatureIdentification(computedResults) {
  console.log("\n🎯 Signature Identification Validation");
  console.log("====================================");

  const issues = [];
  let checks = 0;
  let passed = 0;

  if (!computedResults) {
    console.log("⚠️  Skipping signature validation - no computed data");
    return { passed: 0, total: 0, issues: [] };
  }

  try {
    const { calculateZScore, classifySignatureStrength } = loadModule(
      "../src/utils/cuisine/signatureIdentificationEngine.ts",
    );

    // Test z-score calculation
    checks++;
    const zScore = calculateZScore(0.8, 0.6, 0.1); // value, mean, stdDev
    const expected = 2.0; // (0.8 - 0.6) / 0.1 = 2.0
    if (Math.abs(zScore - expected) < 0.001) {
      passed++;
      console.log("✅ Z-score calculation correct");
    } else {
      issues.push(`Z-score incorrect: got ${zScore}, expected ${expected}`);
    }

    // Test signature strength classification
    checks++;
    const strength = classifySignatureStrength(2.5);
    if (strength === "high") {
      passed++;
      console.log("✅ Signature strength classification correct");
    } else {
      issues.push(
        `Signature strength incorrect: got ${strength}, expected 'high'`,
      );
    }

    // Validate actual signatures from computed data
    const successful = computedResults.successful || [];
    successful.forEach((result) => {
      const { cuisine, properties } = result;
      const signatures = properties.signatures || [];

      signatures.forEach((signature, index) => {
        checks++;

        // Check z-score magnitude matches strength
        const absZScore = Math.abs(signature.zscore);
        let expectedStrength;
        if (absZScore >= 3.0) expectedStrength = "very_high";
        else if (absZScore >= 2.0) expectedStrength = "high";
        else if (absZScore >= 1.5) expectedStrength = "moderate";
        else if (absZScore >= 1.0) expectedStrength = "low";
        else expectedStrength = "low";

        if (signature.strength === expectedStrength) {
          passed++;
        } else {
          issues.push(
            `${cuisine} signature ${index}: strength ${signature.strength} doesn't match z-score ${absZScore}`,
          );
        }
      });
    });
  } catch (error) {
    issues.push(`Signature validation error: ${error.message}`);
  }

  const success = issues.length === 0;
  console.log(
    `${success ? "✅" : "❌"} Signature identification: ${passed}/${checks} checks passed`,
  );

  if (issues.length > 0) {
    console.log("Issues found:");
    issues.forEach((issue) => console.log(`  - ${issue}`));
  }

  return { passed, total: checks, issues };
}

/**
 * Validate planetary pattern analysis
 */
function validatePlanetaryPatterns(computedResults) {
  console.log("\n🪐 Planetary Pattern Validation");
  console.log("==============================");

  const issues = [];
  let checks = 0;
  let passed = 0;

  if (!computedResults) {
    console.log("⚠️  Skipping planetary validation - no computed data");
    return { passed: 0, total: 0, issues: [] };
  }

  const successful = computedResults.successful || [];

  // Check planetary pattern structure
  successful.forEach((result) => {
    const { cuisine, properties } = result;
    const patterns = properties.planetaryPatterns || [];

    patterns.forEach((pattern, index) => {
      checks++;
      if (
        pattern.planet &&
        pattern.commonSigns &&
        pattern.commonSigns.length > 0 &&
        typeof pattern.planetaryStrength === "number" &&
        pattern.dominantElement
      ) {
        passed++;
      } else {
        issues.push(`${cuisine} pattern ${index}: Invalid pattern structure`);
      }

      // Check strength is reasonable
      checks++;
      if (pattern.planetaryStrength >= 0 && pattern.planetaryStrength <= 1) {
        passed++;
      } else {
        issues.push(
          `${cuisine} pattern ${index}: Invalid strength value ${pattern.planetaryStrength}`,
        );
      }
    });
  });

  const success = issues.length === 0;
  console.log(
    `${success ? "✅" : "❌"} Planetary patterns: ${passed}/${checks} checks passed`,
  );

  if (issues.length > 0) {
    console.log("Issues found:");
    issues.forEach((issue) => console.log(`  - ${issue}`));
  }

  return { passed, total: checks, issues };
}

/**
 * Validate system performance
 */
function validatePerformance(computedResults) {
  console.log("\n⚡ Performance Validation");
  console.log("========================");

  const issues = [];
  let checks = 0;
  let passed = 0;

  if (!computedResults) {
    console.log("⚠️  Skipping performance validation - no computed data");
    return { passed: 0, total: 0, issues: [] };
  }

  const { summary } = computedResults;

  // Check computation time
  checks++;
  const avgTimePerCuisine = summary.computationTime / summary.totalCuisines;
  if (avgTimePerCuisine < 1000) {
    // Less than 1 second per cuisine
    passed++;
    console.log(
      `✅ Performance acceptable: ${avgTimePerCuisine.toFixed(0)}ms per cuisine`,
    );
  } else {
    issues.push(
      `Performance issue: ${avgTimePerCuisine.toFixed(0)}ms per cuisine (target: <1000ms)`,
    );
  }

  // Check recipe processing rate
  checks++;
  const recipesPerSecond =
    (summary.totalRecipes / summary.computationTime) * 1000;
  if (recipesPerSecond > 10) {
    // At least 10 recipes per second
    passed++;
    console.log(
      `✅ Processing rate good: ${recipesPerSecond.toFixed(1)} recipes/second`,
    );
  } else {
    issues.push(
      `Processing rate low: ${recipesPerSecond.toFixed(1)} recipes/second (target: >10)`,
    );
  }

  // Check data completeness
  checks++;
  const successRate =
    (computedResults.successful.length / summary.totalCuisines) * 100;
  if (successRate > 80) {
    passed++;
    console.log(
      `✅ Success rate good: ${successRate.toFixed(1)}% cuisines processed`,
    );
  } else {
    issues.push(`Success rate low: ${successRate.toFixed(1)}% (target: >80%)`);
  }

  const success = issues.length === 0;
  console.log(
    `${success ? "✅" : "❌"} Performance: ${passed}/${checks} checks passed`,
  );

  if (issues.length > 0) {
    console.log("Issues found:");
    issues.forEach((issue) => console.log(`  - ${issue}`));
  }

  return { passed, total: checks, issues };
}

// ========== MAIN VALIDATION ==========

async function main() {
  console.log("🔍 Starting Cuisine System Validation");
  console.log("====================================");

  try {
    // Load computed properties
    const computedResults = loadComputedProperties();

    // Run all validations
    const validations = [
      validateDataIntegrity(computedResults),
      validateComputationalAccuracy(),
      validateSignatureIdentification(computedResults),
      validatePlanetaryPatterns(computedResults),
      validatePerformance(computedResults),
    ];

    // Summarize results
    console.log("\n" + "=".repeat(50));
    console.log("📊 VALIDATION SUMMARY");
    console.log("=".repeat(50));

    let totalPassed = 0;
    let totalChecks = 0;
    let allIssues = [];

    validations.forEach((validation) => {
      totalPassed += validation.passed;
      totalChecks += validation.total;
      allIssues.push(...validation.issues);
    });

    const overallSuccess = allIssues.length === 0;
    console.log(
      `${overallSuccess ? "🎉" : "⚠️"} Overall: ${totalPassed}/${totalChecks} checks passed`,
    );

    if (allIssues.length > 0) {
      console.log("\n🚨 ALL ISSUES FOUND:");
      allIssues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    } else {
      console.log(
        "\n✅ All validations passed! The cuisine system is working correctly.",
      );
    }

    // Save validation results
    const validationResults = {
      timestamp: new Date().toISOString(),
      overall: {
        success: overallSuccess,
        passed: totalPassed,
        total: totalChecks,
        issueCount: allIssues.length,
      },
      validations,
      issues: allIssues,
    };

    const outputPath = path.join(
      __dirname,
      "..",
      "cuisine_system_validation.json",
    );
    fs.writeFileSync(outputPath, JSON.stringify(validationResults, null, 2));
    console.log(`\n💾 Validation results saved to: ${outputPath}`);
  } catch (error) {
    console.error("💥 Error during validation:", error);
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
