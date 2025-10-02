#!/usr/bin/env node

/**
 * Cuisine System Demonstration Script
 *
 * Demonstrates the complete cuisine-level recommendation system
 * with personalized recommendations and signature analysis.
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

// ========== DEMONSTRATION FUNCTIONS ==========

function demonstratePersonalizedRecommendations() {
  console.log('\n🎯 Personalized Cuisine Recommendations Demo');
  console.log('============================================');

  try {
    const { generateCuisineRecommendations, createAdvancedUserProfile } = loadModule('../src/utils/cuisine/cuisineRecommendationEngine.ts');

    // Create sample user profiles
    const profiles = [
      {
        name: 'Fire Enthusiast',
        preferences: { Fire: 0.8, Water: 0.1, Earth: 0.05, Air: 0.05 },
        description: 'Loves spicy, bold flavors'
      },
      {
        name: 'Earth Grounded',
        preferences: { Fire: 0.2, Water: 0.2, Earth: 0.5, Air: 0.1 },
        description: 'Prefers hearty, comforting dishes'
      },
      {
        name: 'Air Light',
        preferences: { Fire: 0.1, Water: 0.2, Earth: 0.1, Air: 0.6 },
        description: 'Enjoys fresh, aromatic cuisine'
      }
    ];

    // Create mock cuisine data
    const mockCuisines = new Map([
      ['Italian', {
        name: 'Italian',
        properties: {
          averageElementals: { Fire: 0.3, Water: 0.3, Earth: 0.3, Air: 0.1 },
          sampleSize: 50,
          computedAt: new Date(),
          version: '1.0.0'
        }
      }],
      ['Mexican', {
        name: 'Mexican',
        properties: {
          averageElementals: { Fire: 0.6, Water: 0.2, Earth: 0.1, Air: 0.1 },
          sampleSize: 40,
          computedAt: new Date(),
          version: '1.0.0'
        }
      }],
      ['Japanese', {
        name: 'Japanese',
        properties: {
          averageElementals: { Fire: 0.2, Water: 0.4, Earth: 0.1, Air: 0.3 },
          sampleSize: 45,
          computedAt: new Date(),
          version: '1.0.0'
        }
      }]
    ]);

    // Generate recommendations for each profile
    profiles.forEach(profile => {
      console.log(`\n👤 ${profile.name} (${profile.description})`);

      const userProfile = createAdvancedUserProfile(profile.preferences);
      const recommendations = generateCuisineRecommendations(
        userProfile,
        mockCuisines,
        { maxRecommendations: 3, minCompatibilityThreshold: 0.1 }
      );

      recommendations.forEach((rec, index) => {
        const scorePercent = (rec.compatibilityScore * 100).toFixed(1);
        console.log(`  ${index + 1}. ${rec.cuisineName} (${scorePercent}% match)`);
        console.log(`     ${rec.reasoning[0]}`);
      });
    });

  } catch (error) {
    console.error('❌ Recommendation demo failed:', error.message);
  }
}

function demonstrateSignatureAnalysis(computedResults) {
  console.log('\n🎭 Cuisine Signature Analysis Demo');
  console.log('==================================');

  try {
    if (!computedResults || !computedResults.successful) {
      console.log('⚠️  No computed data available for signature demo');
      return;
    }

    const successful = computedResults.successful.filter(r => r.properties.signatures?.length > 0);

    if (successful.length === 0) {
      console.log('⚠️  No cuisines with signatures found');
      return;
    }

    // Show top signatures
    console.log('🏆 Most Distinctive Cuisine Signatures:');

    successful.forEach(result => {
      const { cuisine, properties } = result;
      const topSignature = properties.signatures?.[0]; // Already sorted by z-score

      if (topSignature) {
        const zScoreStr = topSignature.zscore.toFixed(2);
        const direction = topSignature.zscore > 0 ? 'higher' : 'lower';
        console.log(`  ${cuisine}: ${topSignature.property} is ${topSignature.strength}ly ${direction} than average`);
        console.log(`    ${topSignature.description}`);
      }
    });

  } catch (error) {
    console.error('❌ Signature analysis demo failed:', error.message);
  }
}

function demonstratePlanetaryPatterns(computedResults) {
  console.log('\n🪐 Planetary Pattern Analysis Demo');
  console.log('=================================');

  try {
    if (!computedResults || !computedResults.successful) {
      console.log('⚠️  No computed data available for planetary demo');
      return;
    }

    const successful = computedResults.successful.filter(r => r.properties.planetaryPatterns?.length > 0);

    if (successful.length === 0) {
      console.log('⚠️  No cuisines with planetary patterns found');
      return;
    }

    // Show planetary patterns
    console.log('🌟 Strongest Planetary Influences:');

    successful.forEach(result => {
      const { cuisine, properties } = result;
      const patterns = properties.planetaryPatterns || [];
      const strongestPattern = patterns.sort((a, b) => b.planetaryStrength - a.planetaryStrength)[0];

      if (strongestPattern) {
        const strengthPercent = (strongestPattern.planetaryStrength * 100).toFixed(1);
        console.log(`  ${cuisine}: ${strongestPattern.planet} (${strengthPercent}% strength)`);
        console.log(`    Dominant element: ${strongestPattern.dominantElement}`);
        if (strongestPattern.commonSigns.length > 0) {
          console.log(`    Common signs: ${strongestPattern.commonSigns.slice(0, 2).map(s => s.sign).join(', ')}`);
        }
      }
    });

  } catch (error) {
    console.error('❌ Planetary pattern demo failed:', error.message);
  }
}

function demonstrateSystemIntegration() {
  console.log('\n🔗 System Integration Demo');
  console.log('=========================');

  try {
    // Demonstrate how all components work together
    const { computeCuisineProperties } = loadModule('../src/utils/cuisine/cuisineAggregationEngine.ts');
    const { identifyCuisineSignatures, DEFAULT_GLOBAL_BASELINE } = loadModule('../src/utils/cuisine/signatureIdentificationEngine.ts');
    const { analyzePlanetaryPatterns } = loadModule('../src/utils/cuisine/planetaryPatternAnalysis.ts');
    const { getGlobalCache } = loadModule('../src/utils/cuisine/cuisineComputationCache.ts');

    console.log('✅ All cuisine modules loaded successfully');
    console.log('✅ Hierarchical computation pipeline ready');
    console.log('✅ Signature identification system active');
    console.log('✅ Planetary pattern analysis available');
    console.log('✅ Caching system initialized');

    // Show cache status
    const cache = getGlobalCache();
    const cacheStats = cache.getStats();
    console.log(`📊 Cache status: ${cacheStats.totalEntries} entries, ${(cacheStats.hitRate * 100).toFixed(1)}% hit rate`);

  } catch (error) {
    console.error('❌ Integration demo failed:', error.message);
  }
}

function showPerformanceMetrics(computedResults) {
  console.log('\n⚡ Performance Metrics');
  console.log('=====================');

  if (!computedResults || !computedResults.summary) {
    console.log('⚠️  No performance data available');
    return;
  }

  const { summary } = computedResults;

  console.log(`⏱️  Total computation time: ${(summary.computationTime / 1000).toFixed(2)}s`);
  console.log(`🏃 Average per cuisine: ${(summary.computationTime / summary.totalCuisines).toFixed(0)}ms`);
  console.log(`📚 Recipes processed: ${summary.totalRecipes}`);
  console.log(`🎯 Signatures identified: ${summary.totalSignatures}`);
  console.log(`📈 Success rate: ${((computedResults.successful.length / summary.totalCuisines) * 100).toFixed(1)}%`);
}

// ========== MAIN DEMONSTRATION ==========

async function main() {
  console.log('🎪 Cuisine System Demonstration');
  console.log('==============================');
  console.log('Showcasing the complete hierarchical cuisine recommendation system');

  try {
    // Load computed properties
    const computedResults = loadComputedProperties();

    // Run demonstrations
    demonstratePersonalizedRecommendations();
    demonstrateSignatureAnalysis(computedResults);
    demonstratePlanetaryPatterns(computedResults);
    demonstrateSystemIntegration();
    showPerformanceMetrics(computedResults);

    console.log('\n' + '='.repeat(60));
    console.log('🎉 DEMONSTRATION COMPLETE');
    console.log('=' .repeat(60));
    console.log('The cuisine-level system is ready for integration!');
    console.log('Use the following commands to explore further:');
    console.log('  node scripts/computeCuisineProperties.cjs    # Compute all cuisine properties');
    console.log('  node scripts/identifyCuisineSignatures.cjs   # Analyze signatures');
    console.log('  node scripts/validateCuisineSystem.cjs       # Validate system integrity');

  } catch (error) {
    console.error('💥 Error during demonstration:', error);
    process.exit(1);
  }
}

// Run the demonstration
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { main };
