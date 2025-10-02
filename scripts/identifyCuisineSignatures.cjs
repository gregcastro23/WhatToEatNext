#!/usr/bin/env node

/**
 * Cuisine Signatures Identification Script
 *
 * Analyzes computed cuisine properties to identify distinctive signatures
 * and generate insights about culinary patterns.
 */

const fs = require('fs');
const path = require('path');

// ========== UTILITIES ==========

function loadModule(modulePath) {
  try {
    return require(modulePath);
  } catch (error) {
    console.error(`Failed to load module: ${modulePath}`, error.message);
    process.exit(1);
  }
}

function loadComputedProperties() {
  const propertiesPath = path.join(__dirname, '..', 'computed_cuisine_properties.json');
  if (!fs.existsSync(propertiesPath)) {
    console.error('❌ Computed cuisine properties not found. Run computeCuisineProperties.cjs first.');
    process.exit(1);
  }

  try {
    const data = fs.readFileSync(propertiesPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Failed to load computed properties:', error.message);
    process.exit(1);
  }
}

// ========== SIGNATURE ANALYSIS ==========

function analyzeSignatures(computedResults) {
  console.log('\n🔍 Analyzing Cuisine Signatures');
  console.log('==============================');

  const successful = computedResults.successful || [];
  const signatureStats = {
    totalSignatures: 0,
    signaturesByStrength: { low: 0, moderate: 0, high: 0, very_high: 0 },
    signaturesByType: { elemental: 0, alchemical: 0, thermodynamic: 0 },
    cuisinesWithSignatures: 0,
    topSignatures: []
  };

  successful.forEach(result => {
    const { cuisine, properties } = result;
    const signatures = properties.signatures || [];

    if (signatures.length > 0) {
      signatureStats.cuisinesWithSignatures++;
      signatureStats.totalSignatures += signatures.length;

      signatures.forEach(signature => {
        // Count by strength
        signatureStats.signaturesByStrength[signature.strength] =
          (signatureStats.signaturesByStrength[signature.strength] || 0) + 1;

        // Count by type
        if (['Fire', 'Water', 'Earth', 'Air'].includes(signature.property)) {
          signatureStats.signaturesByType.elemental++;
        } else if (['Spirit', 'Essence', 'Matter', 'Substance'].includes(signature.property)) {
          signatureStats.signaturesByType.alchemical++;
        } else {
          signatureStats.signaturesByType.thermodynamic++;
        }

        // Track top signatures
        signatureStats.topSignatures.push({
          cuisine,
          property: signature.property,
          zscore: signature.zscore,
          strength: signature.strength,
          description: signature.description
        });
      });
    }
  });

  // Sort top signatures by z-score
  signatureStats.topSignatures.sort((a, b) => Math.abs(b.zscore) - Math.abs(a.zscore));

  return signatureStats;
}

function analyzePlanetaryPatterns(computedResults) {
  console.log('\n🪐 Analyzing Planetary Patterns');
  console.log('==============================');

  const successful = computedResults.successful || [];
  const patternStats = {
    totalPatterns: 0,
    patternsByPlanet: {},
    averageStrength: 0,
    strongPatterns: [],
    elementDistribution: { Fire: 0, Water: 0, Earth: 0, Air: 0 }
  };

  successful.forEach(result => {
    const { cuisine, properties } = result;
    const patterns = properties.planetaryPatterns || [];

    patternStats.totalPatterns += patterns.length;

    patterns.forEach(pattern => {
      // Count by planet
      patternStats.patternsByPlanet[pattern.planet] =
        (patternStats.patternsByPlanet[pattern.planet] || 0) + 1;

      // Track strong patterns
      if (pattern.planetaryStrength > 0.6) {
        patternStats.strongPatterns.push({
          cuisine,
          planet: pattern.planet,
          strength: pattern.planetaryStrength,
          dominantElement: pattern.dominantElement
        });
      }

      // Count elemental distribution
      patternStats.elementDistribution[pattern.dominantElement]++;
    });
  });

  if (patternStats.totalPatterns > 0) {
    patternStats.averageStrength = successful.reduce((sum, result) => {
      const patterns = result.properties.planetaryPatterns || [];
      return sum + patterns.reduce((pSum, p) => pSum + p.planetaryStrength, 0);
    }, 0) / patternStats.totalPatterns;
  }

  return patternStats;
}

function generateInsights(signatureStats, patternStats) {
  console.log('\n💡 Culinary Insights');
  console.log('===================');

  const insights = [];

  // Signature insights
  if (signatureStats.totalSignatures > 0) {
    insights.push(`🎯 Found ${signatureStats.totalSignatures} distinctive signatures across ${signatureStats.cuisinesWithSignatures} cuisines`);

    const topStrength = Object.entries(signatureStats.signaturesByStrength)
      .sort(([,a], [,b]) => b - a)[0];
    insights.push(`⭐ Most common signature strength: ${topStrength[0]} (${topStrength[1]} signatures)`);

    const topType = Object.entries(signatureStats.signaturesByType)
      .sort(([,a], [,b]) => b - a)[0];
    insights.push(`🔥 Most common signature type: ${topType[0]} (${topType[1]} signatures)`);
  }

  // Planetary insights
  if (patternStats.totalPatterns > 0) {
    insights.push(`🪐 Identified ${patternStats.totalPatterns} planetary patterns`);

    const topPlanet = Object.entries(patternStats.patternsByPlanet)
      .sort(([,a], [,b]) => b - a)[0];
    if (topPlanet) {
      insights.push(`🌟 Most influential planet: ${topPlanet[0]} (${topPlanet[1]} patterns)`);
    }

    const topElement = Object.entries(patternStats.elementDistribution)
      .sort(([,a], [,b]) => b - a)[0];
    insights.push(`⚡ Most common elemental alignment: ${topElement[0]} (${topElement[1]} patterns)`);
  }

  // Cross-analysis insights
  const cuisinesWithBoth = computedResults.successful.filter(result =>
    (result.properties.signatures?.length || 0) > 0 &&
    (result.properties.planetaryPatterns?.length || 0) > 0
  ).length;

  if (cuisinesWithBoth > 0) {
    insights.push(`🔗 ${cuisinesWithBoth} cuisines show both signature and planetary patterns`);
  }

  insights.forEach(insight => console.log(`  ${insight}`));

  return insights;
}

function displayTopSignatures(signatureStats, limit = 10) {
  if (signatureStats.topSignatures.length === 0) return;

  console.log('\n🏆 Top Cuisine Signatures');
  console.log('=========================');

  signatureStats.topSignatures.slice(0, limit).forEach((sig, index) => {
    const zScoreStr = sig.zscore.toFixed(2);
    const direction = sig.zscore > 0 ? '↑' : '↓';
    console.log(`${index + 1}. ${sig.cuisine} - ${sig.property} (${zScoreStr}${direction})`);
    console.log(`   ${sig.description}`);
  });
}

function displayStrongPatterns(patternStats, limit = 10) {
  if (patternStats.strongPatterns.length === 0) return;

  console.log('\n💪 Strong Planetary Patterns');
  console.log('============================');

  patternStats.strongPatterns
    .sort((a, b) => b.strength - a.strength)
    .slice(0, limit)
    .forEach((pattern, index) => {
      const strengthPercent = (pattern.strength * 100).toFixed(1);
      console.log(`${index + 1}. ${pattern.cuisine} - ${pattern.planet} (${strengthPercent}%)`);
      console.log(`   Dominant element: ${pattern.dominantElement}`);
    });
}

// ========== MAIN FUNCTION ==========

async function main() {
  console.log('🎯 Starting Cuisine Signatures Analysis');
  console.log('======================================');

  try {
    // Load computed properties
    const computedResults = loadComputedProperties();

    if (computedResults.successful.length === 0) {
      console.log('❌ No successful computations found');
      return;
    }

    // Analyze signatures
    const signatureStats = analyzeSignatures(computedResults);

    // Analyze planetary patterns
    const patternStats = analyzePlanetaryPatterns(computedResults);

    // Generate insights
    generateInsights(signatureStats, patternStats);

    // Display top results
    displayTopSignatures(signatureStats);
    displayStrongPatterns(patternStats);

    // Save analysis results
    const analysisResults = {
      timestamp: new Date().toISOString(),
      signatureStats,
      patternStats,
      insights: generateInsights(signatureStats, patternStats)
    };

    const outputPath = path.join(__dirname, '..', 'cuisine_signatures_analysis.json');
    fs.writeFileSync(outputPath, JSON.stringify(analysisResults, null, 2));
    console.log(`\n💾 Analysis saved to: ${outputPath}`);

    console.log('\n🎉 Signatures analysis completed!');

  } catch (error) {
    console.error('💥 Error during analysis:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { main };
