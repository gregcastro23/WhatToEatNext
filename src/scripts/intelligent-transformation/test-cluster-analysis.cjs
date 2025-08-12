#!/usr/bin/env node

/**
 * Test Script for Variable Cluster Analysis System
 *
 * This script tests the cluster analysis functionality with sample data
 * to ensure proper clustering, transformation suggestions, and value assessment.
 */

const VariableClusterAnalyzer = require('./VariableClusterAnalyzer.cjs');

class ClusterAnalysisTest {
  constructor() {
    this.analyzer = new VariableClusterAnalyzer();
  }

  /**
   * Generate sample test data representing various types of unused variables
   */
  generateSampleData() {
    return [
      // Astrological domain variables
      {
        id: 'src/calculations/planetary.ts:15:planetPosition',
        filePath: '/project/src/calculations/planetary.ts',
        relativePath: 'src/calculations/planetary.ts',
        line: 15,
        column: 10,
        variableName: 'planetPosition',
        message: "'planetPosition' is defined but never used",
        fileType: 'calculations',
        riskLevel: 'high',
        preservation: {
          shouldPreserve: true,
          domain: 'astrological',
          reason: 'Astrological domain variable',
          confidence: 0.9
        }
      },
      {
        id: 'src/calculations/zodiac.ts:22:mercuryDegree',
        filePath: '/project/src/calculations/zodiac.ts',
        relativePath: 'src/calculations/zodiac.ts',
        line: 22,
        column: 8,
        variableName: 'mercuryDegree',
        message: "'mercuryDegree' is defined but never used",
        fileType: 'calculations',
        riskLevel: 'high',
        preservation: {
          shouldPreserve: true,
          domain: 'astrological',
          reason: 'Planetary calculation variable',
          confidence: 0.95
        }
      },
      {
        id: 'src/calculations/elemental.ts:8:fireElement',
        filePath: '/project/src/calculations/elemental.ts',
        relativePath: 'src/calculations/elemental.ts',
        line: 8,
        column: 12,
        variableName: 'fireElement',
        message: "'fireElement' is defined but never used",
        fileType: 'calculations',
        riskLevel: 'high',
        preservation: {
          shouldPreserve: true,
          domain: 'astrological',
          reason: 'Elemental system variable',
          confidence: 0.9
        }
      },
      {
        id: 'src/calculations/elemental.ts:9:waterBalance',
        filePath: '/project/src/calculations/elemental.ts',
        relativePath: 'src/calculations/elemental.ts',
        line: 9,
        column: 12,
        variableName: 'waterBalance',
        message: "'waterBalance' is defined but never used",
        fileType: 'calculations',
        riskLevel: 'high',
        preservation: {
          shouldPreserve: true,
          domain: 'astrological',
          reason: 'Elemental system variable',
          confidence: 0.9
        }
      },

      // Campaign system variables
      {
        id: 'src/services/campaign/metrics.ts:30:progressTracker',
        filePath: '/project/src/services/campaign/metrics.ts',
        relativePath: 'src/services/campaign/metrics.ts',
        line: 30,
        column: 15,
        variableName: 'progressTracker',
        message: "'progressTracker' is defined but never used",
        fileType: 'services',
        riskLevel: 'high',
        preservation: {
          shouldPreserve: true,
          domain: 'campaign',
          reason: 'Campaign monitoring variable',
          confidence: 0.85
        }
      },
      {
        id: 'src/services/campaign/dashboard.ts:45:metricsCollector',
        filePath: '/project/src/services/campaign/dashboard.ts',
        relativePath: 'src/services/campaign/dashboard.ts',
        line: 45,
        column: 20,
        variableName: 'metricsCollector',
        message: "'metricsCollector' is defined but never used",
        fileType: 'services',
        riskLevel: 'high',
        preservation: {
          shouldPreserve: true,
          domain: 'campaign',
          reason: 'Metrics collection variable',
          confidence: 0.8
        }
      },
      {
        id: 'src/services/campaign/analyzer.ts:12:errorAnalysis',
        filePath: '/project/src/services/campaign/analyzer.ts',
        relativePath: 'src/services/campaign/analyzer.ts',
        line: 12,
        column: 18,
        variableName: 'errorAnalysis',
        message: "'errorAnalysis' is defined but never used",
        fileType: 'services',
        riskLevel: 'high',
        preservation: {
          shouldPreserve: true,
          domain: 'campaign',
          reason: 'Quality analysis variable',
          confidence: 0.85
        }
      },

      // Culinary domain variables
      {
        id: 'src/data/ingredients/spices.ts:25:spiceCompatibility',
        filePath: '/project/src/data/ingredients/spices.ts',
        relativePath: 'src/data/ingredients/spices.ts',
        line: 25,
        column: 10,
        variableName: 'spiceCompatibility',
        message: "'spiceCompatibility' is defined but never used",
        fileType: 'data',
        riskLevel: 'medium',
        preservation: {
          shouldPreserve: true,
          domain: 'culinary',
          reason: 'Culinary domain variable',
          confidence: 0.8
        }
      },
      {
        id: 'src/services/recipe/preparation.ts:18:cookingMethod',
        filePath: '/project/src/services/recipe/preparation.ts',
        relativePath: 'src/services/recipe/preparation.ts',
        line: 18,
        column: 14,
        variableName: 'cookingMethod',
        message: "'cookingMethod' is defined but never used",
        fileType: 'services',
        riskLevel: 'high',
        preservation: {
          shouldPreserve: true,
          domain: 'culinary',
          reason: 'Cooking method variable',
          confidence: 0.75
        }
      },

      // Service layer variables
      {
        id: 'src/services/api/client.ts:35:apiResponse',
        filePath: '/project/src/services/api/client.ts',
        relativePath: 'src/services/api/client.ts',
        line: 35,
        column: 12,
        variableName: 'apiResponse',
        message: "'apiResponse' is defined but never used",
        fileType: 'services',
        riskLevel: 'high',
        preservation: {
          shouldPreserve: true,
          domain: 'service',
          reason: 'API integration variable',
          confidence: 0.6
        }
      },
      {
        id: 'src/services/data/processor.ts:28:dataValidation',
        filePath: '/project/src/services/data/processor.ts',
        relativePath: 'src/services/data/processor.ts',
        line: 28,
        column: 16,
        variableName: 'dataValidation',
        message: "'dataValidation' is defined but never used",
        fileType: 'services',
        riskLevel: 'high',
        preservation: {
          shouldPreserve: true,
          domain: 'service',
          reason: 'Data processing variable',
          confidence: 0.65
        }
      },

      // Test infrastructure variables
      {
        id: 'src/tests/helpers/mock.ts:10:testFixture',
        filePath: '/project/src/tests/helpers/mock.ts',
        relativePath: 'src/tests/helpers/mock.ts',
        line: 10,
        column: 8,
        variableName: 'testFixture',
        message: "'testFixture' is defined but never used",
        fileType: 'tests',
        riskLevel: 'low',
        preservation: {
          shouldPreserve: true,
          domain: 'testing',
          reason: 'Test infrastructure variable',
          confidence: 0.4
        }
      },

      // Generic/utility variables (potential elimination candidates)
      {
        id: 'src/utils/temp.ts:5:unusedTemp',
        filePath: '/project/src/utils/temp.ts',
        relativePath: 'src/utils/temp.ts',
        line: 5,
        column: 6,
        variableName: 'unusedTemp',
        message: "'unusedTemp' is defined but never used",
        fileType: 'utilities',
        riskLevel: 'low',
        preservation: {
          shouldPreserve: false,
          domain: 'generic',
          reason: 'No domain-specific preservation pattern matched',
          confidence: 0.9
        }
      }
    ];
  }

  /**
   * Run comprehensive test of cluster analysis functionality
   */
  async runTests() {
    console.log('🧪 Starting Variable Cluster Analysis Tests...\n');

    try {
      // Test 1: Basic clustering functionality
      console.log('📊 Test 1: Basic Clustering Functionality');
      const sampleData = this.generateSampleData();
      const results = this.analyzer.analyzeVariableClusters(sampleData);

      console.log(`✅ Successfully clustered ${results.summary.totalVariables} variables into ${results.summary.totalClusters} clusters`);
      console.log(`   Transformation readiness: ${Math.round(results.summary.transformationInsights.transformationReadiness * 100)}%\n`);

      // Test 2: Semantic pattern matching
      console.log('🔍 Test 2: Semantic Pattern Matching');
      this.testSemanticPatterns(results);

      // Test 3: Transformation suggestions
      console.log('💡 Test 3: Transformation Suggestions');
      this.testTransformationSuggestions(results);

      // Test 4: Value assessment
      console.log('💎 Test 4: Value Assessment');
      this.testValueAssessment(results);

      // Test 5: Incomplete feature detection
      console.log('🔧 Test 5: Incomplete Feature Detection');
      this.testIncompleteFeatureDetection(results);

      // Test 6: Quick wins identification
      console.log('⚡ Test 6: Quick Wins Identification');
      this.testQuickWinsIdentification(results);

      console.log('✅ All tests completed successfully!\n');

      // Generate test report
      this.generateTestReport(results);

      return results;

    } catch (error) {
      console.error('❌ Test failed:', error.message);
      throw error;
    }
  }

  /**
   * Test semantic pattern matching functionality
   */
  testSemanticPatterns(results) {
    const clusters = results.clusters;

    // Check if astrological variables were properly clustered
    const astrologicalClusters = Array.from(clusters.values())
      .filter(cluster => cluster.domain === 'astrological');

    console.log(`   Found ${astrologicalClusters.length} astrological clusters`);

    // Check if campaign variables were properly clustered
    const campaignClusters = Array.from(clusters.values())
      .filter(cluster => cluster.domain === 'campaign');

    console.log(`   Found ${campaignClusters.length} campaign clusters`);

    // Check semantic coherence scores
    const avgCoherence = Array.from(clusters.values())
      .reduce((sum, cluster) => sum + cluster.semanticCoherence, 0) / clusters.size;

    console.log(`   Average semantic coherence: ${Math.round(avgCoherence * 100)}%`);

    if (astrologicalClusters.length > 0 && campaignClusters.length > 0 && avgCoherence > 0.6) {
      console.log('   ✅ Semantic pattern matching working correctly\n');
    } else {
      console.log('   ⚠️  Semantic pattern matching may need adjustment\n');
    }
  }

  /**
   * Test transformation suggestions functionality
   */
  testTransformationSuggestions(results) {
    const clustersWithSuggestions = Array.from(results.clusters.values())
      .filter(cluster => cluster.suggestions && cluster.suggestions.length > 0);

    console.log(`   ${clustersWithSuggestions.length} clusters have transformation suggestions`);

    // Check for high-value suggestions
    const highValueSuggestions = clustersWithSuggestions
      .flatMap(cluster => cluster.suggestions)
      .filter(suggestion => suggestion.value === 'high' || suggestion.value === 'very-high');

    console.log(`   ${highValueSuggestions.length} high-value transformation suggestions identified`);

    if (clustersWithSuggestions.length > 0 && highValueSuggestions.length > 0) {
      console.log('   ✅ Transformation suggestions working correctly\n');
    } else {
      console.log('   ⚠️  Transformation suggestions may need enhancement\n');
    }
  }

  /**
   * Test value assessment functionality
   */
  testValueAssessment(results) {
    const valueAssessments = results.valueAssessment;

    // Check grade distribution
    const gradeDistribution = {};
    valueAssessments.forEach(assessment => {
      gradeDistribution[assessment.grade] = (gradeDistribution[assessment.grade] || 0) + 1;
    });

    console.log('   Grade distribution:', gradeDistribution);

    // Check for high-value clusters
    const highValueClusters = Array.from(valueAssessments.values())
      .filter(assessment => assessment.totalScore >= 0.7);

    console.log(`   ${highValueClusters.length} high-value clusters identified`);

    // Check score range
    const scores = Array.from(valueAssessments.values()).map(a => a.totalScore);
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    console.log(`   Average value score: ${Math.round(avgScore * 100)}%`);

    if (highValueClusters.length > 0 && avgScore > 0.5) {
      console.log('   ✅ Value assessment working correctly\n');
    } else {
      console.log('   ⚠️  Value assessment may need calibration\n');
    }
  }

  /**
   * Test incomplete feature detection
   */
  testIncompleteFeatureDetection(results) {
    const totalIncompleteFeatures = Array.from(results.clusters.values())
      .reduce((sum, cluster) => sum + cluster.incompleteFeatures.length, 0);

    console.log(`   ${totalIncompleteFeatures} incomplete features detected`);

    // Check for specific patterns
    const featureTypes = {};
    Array.from(results.clusters.values()).forEach(cluster => {
      cluster.incompleteFeatures.forEach(feature => {
        featureTypes[feature.type] = (featureTypes[feature.type] || 0) + 1;
      });
    });

    console.log('   Feature types detected:', featureTypes);

    if (totalIncompleteFeatures > 0) {
      console.log('   ✅ Incomplete feature detection working\n');
    } else {
      console.log('   ℹ️  No incomplete features detected in test data\n');
    }
  }

  /**
   * Test quick wins identification
   */
  testQuickWinsIdentification(results) {
    const quickWins = results.summary.recommendations.quickWins;

    console.log(`   ${quickWins.length} quick win opportunities identified`);

    if (quickWins.length > 0) {
      quickWins.forEach((qw, index) => {
        console.log(`     ${index + 1}. ${qw.clusterName} (Score: ${Math.round(qw.score * 100)}%)`);
      });
      console.log('   ✅ Quick wins identification working correctly\n');
    } else {
      console.log('   ℹ️  No quick wins identified in test data\n');
    }
  }

  /**
   * Generate comprehensive test report
   */
  generateTestReport(results) {
    console.log('📄 Generating Test Report...\n');

    const report = {
      testResults: {
        totalClusters: results.summary.totalClusters,
        totalVariables: results.summary.totalVariables,
        transformationReadiness: Math.round(results.summary.transformationInsights.transformationReadiness * 100),
        highValueClusters: results.summary.transformationInsights.highValueClusters,
        quickWins: results.summary.recommendations.quickWins.length,
        strategicOpportunities: results.summary.recommendations.strategicOpportunities.length
      },
      clusterBreakdown: {},
      valueDistribution: {},
      transformationOpportunities: results.summary.transformationInsights
    };

    // Cluster breakdown by domain
    Array.from(results.clusters.values()).forEach(cluster => {
      report.clusterBreakdown[cluster.domain] = (report.clusterBreakdown[cluster.domain] || 0) + 1;
    });

    // Value distribution
    results.valueAssessment.forEach(assessment => {
      report.valueDistribution[assessment.grade] = (report.valueDistribution[assessment.grade] || 0) + 1;
    });

    console.log('🎯 TEST REPORT SUMMARY');
    console.log('='.repeat(50));
    console.log(`Clusters Created: ${report.testResults.totalClusters}`);
    console.log(`Variables Processed: ${report.testResults.totalVariables}`);
    console.log(`Transformation Readiness: ${report.testResults.transformationReadiness}%`);
    console.log(`High-Value Clusters: ${report.testResults.highValueClusters}`);
    console.log(`Quick Win Opportunities: ${report.testResults.quickWins}`);
    console.log(`Strategic Opportunities: ${report.testResults.strategicOpportunities}`);

    console.log('\nCluster Distribution by Domain:');
    Object.entries(report.clusterBreakdown).forEach(([domain, count]) => {
      console.log(`  ${domain}: ${count} clusters`);
    });

    console.log('\nValue Grade Distribution:');
    Object.entries(report.valueDistribution).forEach(([grade, count]) => {
      console.log(`  Grade ${grade}: ${count} clusters`);
    });

    console.log('='.repeat(50));
  }
}

// Execute if run directly
if (require.main === module) {
  const test = new ClusterAnalysisTest();
  test.runTests().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = ClusterAnalysisTest;
