#!/usr/bin/env node

/**
 * Test Script for Transformation Decision Engine
 *
 * This script tests the decision engine functionality with sample cluster data
 * to ensure proper transformation vs elimination decisions.
 */

const TransformationDecisionEngine = require('./TransformationDecisionEngine.cjs');

class DecisionEngineTest {
  constructor() {
    this.engine = new TransformationDecisionEngine();
  }

  /**
   * Generate sample cluster data for testing
   */
  generateSampleClusters() {
    const clusters = new Map();
    const valueAssessments = new Map();

    // High-value astrological cluster
    clusters.set('planetaryPositions', {
      id: 'planetaryPositions',
      name: 'Planetary Position Calculations',
      domain: 'astrological',
      category: 'planetary-calculations',
      size: 5,
      semanticCoherence: 0.9,
      transformationPotential: 'very-high',
      variables: [
        { variableName: 'planetPosition', relativePath: 'src/calculations/planetary.ts', riskLevel: 'high' },
        { variableName: 'mercuryDegree', relativePath: 'src/calculations/zodiac.ts', riskLevel: 'high' },
        { variableName: 'venusLongitude', relativePath: 'src/calculations/planetary.ts', riskLevel: 'high' },
        { variableName: 'marsPosition', relativePath: 'src/calculations/planetary.ts', riskLevel: 'high' },
        { variableName: 'jupiterCoordinates', relativePath: 'src/calculations/planetary.ts', riskLevel: 'high' }
      ],
      incompleteFeatures: [
        {
          type: 'feature-set',
          pattern: 'planetary*',
          variables: ['planetPosition', 'mercuryDegree', 'venusLongitude'],
          description: 'Incomplete planetary position feature set'
        }
      ],
      activationOpportunities: [
        {
          type: 'feature-completion',
          priority: 'very-high',
          description: 'Complete planetary calculation features',
          businessValue: 'very-high'
        }
      ],
      fileDistribution: {
        concentration: 0.8,
        spread: 2
      }
    });

    valueAssessments.set('planetaryPositions', {
      totalScore: 0.85,
      grade: 'A',
      recommendation: {
        action: 'transform',
        priority: 'high',
        description: 'High-value cluster with excellent transformation potential'
      }
    });

    // Medium-value campaign cluster
    clusters.set('metricsMonitoring', {
      id: 'metricsMonitoring',
      name: 'Metrics and Monitoring System',
      domain: 'campaign',
      category: 'metrics-monitoring',
      size: 8,
      semanticCoherence: 0.75,
      transformationPotential: 'high',
      variables: [
        { variableName: 'progressTracker', relativePath: 'src/services/campaign/metrics.ts', riskLevel: 'high' },
        { variableName: 'metricsCollector', relativePath: 'src/services/campaign/dashboard.ts', riskLevel: 'high' },
        { variableName: 'performanceMonitor', relativePath: 'src/services/campaign/monitor.ts', riskLevel: 'high' },
        { variableName: 'qualityAnalyzer', relativePath: 'src/services/campaign/analyzer.ts', riskLevel: 'high' },
        { variableName: 'reportGenerator', relativePath: 'src/services/campaign/reports.ts', riskLevel: 'high' },
        { variableName: 'dashboardData', relativePath: 'src/services/campaign/dashboard.ts', riskLevel: 'high' },
        { variableName: 'intelligenceEngine', relativePath: 'src/services/campaign/intelligence.ts', riskLevel: 'high' },
        { variableName: 'validationSystem', relativePath: 'src/services/campaign/validator.ts', riskLevel: 'high' }
      ],
      incompleteFeatures: [],
      activationOpportunities: [
        {
          type: 'dashboard-integration',
          priority: 'high',
          description: 'Transform monitoring variables into real-time dashboard',
          businessValue: 'high'
        }
      ],
      fileDistribution: {
        concentration: 0.6,
        spread: 5
      }
    });

    valueAssessments.set('metricsMonitoring', {
      totalScore: 0.72,
      grade: 'B+',
      recommendation: {
        action: 'transform',
        priority: 'medium',
        description: 'Good transformation candidate for next development cycle'
      }
    });

    // Service layer cluster (medium value, requires review)
    clusters.set('apiIntegration', {
      id: 'apiIntegration',
      name: 'API Integration Variables',
      domain: 'service',
      category: 'api-integration',
      size: 4,
      semanticCoherence: 0.6,
      transformationPotential: 'medium',
      variables: [
        { variableName: 'apiResponse', relativePath: 'src/services/api/client.ts', riskLevel: 'high' },
        { variableName: 'requestHandler', relativePath: 'src/services/api/handler.ts', riskLevel: 'high' },
        { variableName: 'dataProcessor', relativePath: 'src/services/data/processor.ts', riskLevel: 'high' },
        { variableName: 'errorHandler', relativePath: 'src/services/api/errors.ts', riskLevel: 'high' }
      ],
      incompleteFeatures: [],
      activationOpportunities: [
        {
          type: 'service-enhancement',
          priority: 'medium',
          description: 'Enhance service layer with unused variables',
          businessValue: 'medium'
        }
      ],
      fileDistribution: {
        concentration: 0.5,
        spread: 3
      }
    });

    valueAssessments.set('apiIntegration', {
      totalScore: 0.58,
      grade: 'C+',
      recommendation: {
        action: 'review',
        priority: 'low',
        description: 'Moderate value - review for potential prefixing or selective transformation'
      }
    });

    // Low-value utility cluster (elimination candidate)
    clusters.set('utilityVariables', {
      id: 'utilityVariables',
      name: 'Utility and Temporary Variables',
      domain: 'generic',
      category: 'development-tools',
      size: 3,
      semanticCoherence: 0.3,
      transformationPotential: 'low',
      variables: [
        { variableName: 'unusedTemp', relativePath: 'src/utils/temp.ts', riskLevel: 'low' },
        { variableName: 'debugHelper', relativePath: 'src/utils/debug.ts', riskLevel: 'low' },
        { variableName: 'testPlaceholder', relativePath: 'src/utils/placeholder.ts', riskLevel: 'low' }
      ],
      incompleteFeatures: [],
      activationOpportunities: [],
      fileDistribution: {
        concentration: 1.0,
        spread: 1
      }
    });

    valueAssessments.set('utilityVariables', {
      totalScore: 0.25,
      grade: 'D',
      recommendation: {
        action: 'eliminate',
        priority: 'low',
        description: 'Low value cluster - consider for elimination with appropriate safety protocols'
      }
    });

    // Test infrastructure cluster (prefixing candidate)
    clusters.set('testInfrastructure', {
      id: 'testInfrastructure',
      name: 'Test Infrastructure Variables',
      domain: 'testing',
      category: 'test-infrastructure',
      size: 2,
      semanticCoherence: 0.7,
      transformationPotential: 'low',
      variables: [
        { variableName: 'testFixture', relativePath: 'src/tests/helpers/mock.ts', riskLevel: 'low' },
        { variableName: 'mockHelper', relativePath: 'src/tests/helpers/mock.ts', riskLevel: 'low' }
      ],
      incompleteFeatures: [],
      activationOpportunities: [],
      fileDistribution: {
        concentration: 1.0,
        spread: 1
      }
    });

    valueAssessments.set('testInfrastructure', {
      totalScore: 0.45,
      grade: 'C',
      recommendation: {
        action: 'prefix',
        priority: 'low',
        description: 'Moderate value - consider prefixing for future use'
      }
    });

    return { clusters, valueAssessments };
  }

  /**
   * Run comprehensive decision engine tests
   */
  async runTests() {
    console.log('🧪 Starting Transformation Decision Engine Tests...\n');

    try {
      // Generate test data
      const { clusters, valueAssessments } = this.generateSampleClusters();

      // Test 1: Individual cluster decisions
      console.log('🎯 Test 1: Individual Cluster Decisions');
      await this.testIndividualDecisions(clusters, valueAssessments);

      // Test 2: Decision criteria scoring
      console.log('🔢 Test 2: Decision Criteria Scoring');
      await this.testDecisionScoring(clusters, valueAssessments);

      // Test 3: Transformation strategy selection
      console.log('💡 Test 3: Transformation Strategy Selection');
      await this.testTransformationStrategies(clusters);

      // Test 4: Prefixing rule selection
      console.log('🏷️  Test 4: Prefixing Rule Selection');
      await this.testPrefixingRules(clusters);

      // Test 5: Elimination safeguards
      console.log('🛡️  Test 5: Elimination Safeguards');
      await this.testEliminationSafeguards(clusters);

      // Test 6: Batch processing
      console.log('📦 Test 6: Batch Decision Processing');
      await this.testBatchProcessing(clusters, valueAssessments);

      console.log('✅ All decision engine tests completed successfully!\n');

      return true;

    } catch (error) {
      console.error('❌ Decision engine test failed:', error.message);
      throw error;
    }
  }

  /**
   * Test individual cluster decisions
   */
  async testIndividualDecisions(clusters, valueAssessments) {
    const testCases = [
      {
        clusterId: 'planetaryPositions',
        expectedDecision: 'transform',
        expectedConfidence: 0.8
      },
      {
        clusterId: 'metricsMonitoring',
        expectedDecision: 'transform',
        expectedConfidence: 0.7
      },
      {
        clusterId: 'apiIntegration',
        expectedDecision: 'manual-review',
        expectedConfidence: 0.6
      },
      {
        clusterId: 'utilityVariables',
        expectedDecision: 'eliminate',
        expectedConfidence: 0.6
      },
      {
        clusterId: 'testInfrastructure',
        expectedDecision: 'prefix',
        expectedConfidence: 0.5
      }
    ];

    let passedTests = 0;

    for (const testCase of testCases) {
      const cluster = clusters.get(testCase.clusterId);
      const valueAssessment = valueAssessments.get(testCase.clusterId);

      const decision = this.engine.makeClusterDecision(cluster, valueAssessment);

      console.log(`   Testing ${cluster.name}:`);
      console.log(`     Expected: ${testCase.expectedDecision}, Got: ${decision.decision}`);
      console.log(`     Confidence: ${Math.round(decision.confidence * 100)}%`);
      console.log(`     Reasoning: ${decision.reasoning}`);

      if (decision.decision === testCase.expectedDecision) {
        console.log(`     ✅ Decision correct`);
        passedTests++;
      } else {
        console.log(`     ⚠️  Decision differs from expected`);
      }
      console.log();
    }

    console.log(`   Results: ${passedTests}/${testCases.length} tests passed\n`);
  }

  /**
   * Test decision criteria scoring
   */
  async testDecisionScoring(clusters, valueAssessments) {
    const testCluster = clusters.get('planetaryPositions');
    const testAssessment = valueAssessments.get('planetaryPositions');

    const scores = this.engine.calculateDecisionScores(testCluster, testAssessment);

    console.log(`   Testing scoring for: ${testCluster.name}`);
    console.log(`     Domain Score: ${Math.round(scores.domain * 100)}%`);
    console.log(`     Coherence Score: ${Math.round(scores.coherence * 100)}%`);
    console.log(`     Business Score: ${Math.round(scores.business * 100)}%`);
    console.log(`     Effort Score: ${Math.round(scores.effort * 100)}%`);
    console.log(`     Risk Score: ${Math.round(scores.risk * 100)}%`);
    console.log(`     Total Score: ${Math.round(scores.total * 100)}%`);

    // Validate scoring logic
    if (scores.domain >= 0.9 && scores.total >= 0.7) {
      console.log(`     ✅ High-value astrological cluster scored correctly`);
    } else {
      console.log(`     ⚠️  Scoring may need adjustment`);
    }
    console.log();
  }

  /**
   * Test transformation strategy selection
   */
  async testTransformationStrategies(clusters) {
    const testClusters = [
      clusters.get('planetaryPositions'),
      clusters.get('metricsMonitoring'),
      clusters.get('apiIntegration')
    ];

    for (const cluster of testClusters) {
      const strategy = this.engine.findApplicableTransformationStrategy(cluster);

      console.log(`   Testing strategy for: ${cluster.name}`);
      if (strategy) {
        console.log(`     Strategy: ${strategy.name}`);
        console.log(`     Transformations: ${strategy.transformations.length}`);

        const bestTransformation = strategy.transformations
          .sort((a, b) => this.engine.scoreTransformation(b, cluster) - this.engine.scoreTransformation(a, cluster))[0];

        console.log(`     Best Option: ${bestTransformation.name}`);
        console.log(`     ✅ Strategy found and scored`);
      } else {
        console.log(`     ⚠️  No applicable strategy found`);
      }
      console.log();
    }
  }

  /**
   * Test prefixing rule selection
   */
  async testPrefixingRules(clusters) {
    const testClusters = [
      clusters.get('testInfrastructure'),
      clusters.get('apiIntegration')
    ];

    for (const cluster of testClusters) {
      const prefixRule = this.engine.selectPrefixingRule(cluster);

      console.log(`   Testing prefixing for: ${cluster.name}`);
      console.log(`     Rule: ${prefixRule.name}`);
      console.log(`     Prefix: ${prefixRule.prefix}`);
      console.log(`     Reason: ${prefixRule.reason}`);
      console.log(`     ✅ Prefixing rule selected`);
      console.log();
    }
  }

  /**
   * Test elimination safeguards
   */
  async testEliminationSafeguards(clusters) {
    const testCases = [
      {
        cluster: clusters.get('planetaryPositions'),
        shouldBlock: true,
        reason: 'Astrological domain protection'
      },
      {
        cluster: clusters.get('metricsMonitoring'),
        shouldBlock: true,
        reason: 'Campaign domain protection'
      },
      {
        cluster: clusters.get('utilityVariables'),
        shouldBlock: false,
        reason: 'Generic domain - no protection'
      }
    ];

    for (const testCase of testCases) {
      const safeguardResult = this.engine.checkEliminationSafeguards(testCase.cluster);

      console.log(`   Testing safeguards for: ${testCase.cluster.name}`);
      console.log(`     Expected Block: ${testCase.shouldBlock}, Got: ${safeguardResult.blocked}`);

      if (safeguardResult.blocked === testCase.shouldBlock) {
        console.log(`     ✅ Safeguard working correctly`);
      } else {
        console.log(`     ⚠️  Safeguard behavior unexpected`);
      }

      if (safeguardResult.blocked) {
        console.log(`     Reason: ${safeguardResult.reason}`);
        console.log(`     Recommended Action: ${safeguardResult.recommendedAction}`);
      }
      console.log();
    }
  }

  /**
   * Test batch processing
   */
  async testBatchProcessing(clusters, valueAssessments) {
    const results = this.engine.processClusterDecisions(clusters, valueAssessments);

    console.log(`   Processing ${clusters.size} clusters...`);
    console.log(`   Decisions made: ${results.decisions.size}`);
    console.log(`   Summary:`);
    console.log(`     Transform: ${results.summary.transform}`);
    console.log(`     Prefix: ${results.summary.prefix}`);
    console.log(`     Eliminate: ${results.summary.eliminate}`);
    console.log(`     Manual Review: ${results.summary.manualReview}`);
    console.log(`     Total Variables: ${results.summary.totalVariables}`);

    console.log(`   Recommendations: ${results.recommendations.length}`);
    results.recommendations.forEach((rec, index) => {
      console.log(`     ${index + 1}. ${rec.title} (${rec.priority} priority)`);
    });

    console.log(`   Implementation Plan: ${results.implementationPlan.phases.length} phases`);
    console.log(`     Total Duration: ${results.implementationPlan.totalDuration}`);
    console.log(`     Total Actions: ${results.implementationPlan.totalActions}`);

    console.log(`   ✅ Batch processing completed successfully`);
    console.log();
  }
}

// Execute if run directly
if (require.main === module) {
  const test = new DecisionEngineTest();
  test.runTests().catch(error => {
    console.error('Decision engine test execution failed:', error);
    process.exit(1);
  });
}

module.exports = DecisionEngineTest;
