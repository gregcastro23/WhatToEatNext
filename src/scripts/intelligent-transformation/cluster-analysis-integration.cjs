#!/usr/bin/env node

/**
 * Variable Cluster Analysis Integration Script
 *
 * This script integrates the VariableClusterAnalyzer with the existing
 * unused variable analysis system to provide intelligent clustering,
 * transformation suggestions, and semantic value assessment.
 */

const fs = require('fs');
const path = require('path');
const UnusedVariableAnalyzer = require('../unused-variable-analyzer.cjs');
const VariableClusterAnalyzer = require('./VariableClusterAnalyzer.cjs');

class ClusterAnalysisIntegration {
  constructor() {
    this.variableAnalyzer = new UnusedVariableAnalyzer();
    this.clusterAnalyzer = new VariableClusterAnalyzer();
  }

  /**
   * Run complete cluster analysis integration
   */
  async runCompleteAnalysis() {
    console.log('🚀 Starting Intelligent Variable Cluster Analysis...\n');

    try {
      // Step 1: Get base unused variable analysis
      console.log('📊 Running base unused variable analysis...');
      const baseAnalysis = await this.variableAnalyzer.analyze();

      if (!baseAnalysis || !baseAnalysis.detailedResults) {
        throw new Error('Base analysis failed or returned no results');
      }

      console.log(`✅ Base analysis complete: ${baseAnalysis.detailedResults.length} variables analyzed\n`);

      // Step 2: Run cluster analysis on the results
      console.log('🔍 Running intelligent cluster analysis...');
      const clusterResults = this.clusterAnalyzer.analyzeVariableClusters(baseAnalysis.detailedResults);

      console.log(`✅ Cluster analysis complete: ${clusterResults.summary.totalClusters} clusters identified\n`);

      // Step 3: Generate integrated report
      console.log('📄 Generating integrated analysis report...');
      const integratedReport = this.generateIntegratedReport(baseAnalysis, clusterResults);

      // Step 4: Save results
      const outputPath = path.join(process.cwd(), 'variable-cluster-analysis-report.json');
      this.saveResults(integratedReport, outputPath);

      // Step 5: Generate markdown summary
      const markdownPath = path.join(process.cwd(), 'variable-cluster-analysis-summary.md');
      this.generateMarkdownSummary(integratedReport, markdownPath);

      // Step 6: Print summary
      this.printAnalysisSummary(integratedReport);

      console.log(`\n✅ Complete cluster analysis finished!`);
      console.log(`📄 Detailed report: ${outputPath}`);
      console.log(`📝 Summary report: ${markdownPath}`);

      return integratedReport;

    } catch (error) {
      console.error('❌ Cluster analysis failed:', error.message);
      throw error;
    }
  }

  /**
   * Generate integrated report combining base analysis and cluster analysis
   */
  generateIntegratedReport(baseAnalysis, clusterResults) {
    return {
      metadata: {
        analysisDate: new Date().toISOString(),
        analyzer: 'ClusterAnalysisIntegration v1.0',
        baseVariables: baseAnalysis.summary.total,
        clusteredVariables: clusterResults.summary.totalVariables,
        clusterCount: clusterResults.summary.totalClusters
      },

      // Base analysis summary
      baseAnalysis: {
        summary: baseAnalysis.summary,
        categoryBreakdown: baseAnalysis.categoryBreakdown,
        recommendations: baseAnalysis.recommendations
      },

      // Cluster analysis results
      clusterAnalysis: this.clusterAnalyzer.generateDetailedReport(clusterResults),

      // Integrated insights
      integratedInsights: this.generateIntegratedInsights(baseAnalysis, clusterResults),

      // Transformation roadmap
      transformationRoadmap: this.generateTransformationRoadmap(clusterResults),

      // Implementation priorities
      implementationPriorities: this.generateImplementationPriorities(clusterResults)
    };
  }

  /**
   * Generate integrated insights combining both analyses
   */
  generateIntegratedInsights(baseAnalysis, clusterResults) {
    const insights = [];

    // Insight 1: Cluster coverage analysis
    const clusterCoverage = (clusterResults.summary.totalVariables / baseAnalysis.summary.total) * 100;
    insights.push({
      type: 'cluster-coverage',
      title: 'Variable Clustering Coverage',
      description: `${clusterCoverage.toFixed(1)}% of variables successfully clustered into semantic groups`,
      impact: clusterCoverage > 80 ? 'positive' : 'neutral',
      recommendation: clusterCoverage > 80
        ? 'Excellent clustering coverage enables sophisticated transformation strategies'
        : 'Consider expanding semantic patterns to capture more variables'
    });

    // Insight 2: Domain concentration analysis
    const domainConcentration = this.analyzeDomainConcentration(baseAnalysis, clusterResults);
    insights.push({
      type: 'domain-concentration',
      title: 'Domain-Specific Variable Concentration',
      description: `${domainConcentration.topDomain.name} domain contains ${domainConcentration.topDomain.percentage}% of clustered variables`,
      impact: 'strategic',
      recommendation: `Focus transformation efforts on ${domainConcentration.topDomain.name} domain for maximum impact`
    });

    // Insight 3: Transformation potential assessment
    const transformationPotential = this.assessOverallTransformationPotential(clusterResults);
    insights.push({
      type: 'transformation-potential',
      title: 'Overall Transformation Potential',
      description: `${transformationPotential.highPotentialPercentage}% of variables have high transformation potential`,
      impact: transformationPotential.highPotentialPercentage > 60 ? 'very-positive' : 'positive',
      recommendation: transformationPotential.highPotentialPercentage > 60
        ? 'Excellent transformation opportunities - prioritize feature development'
        : 'Good transformation potential - plan systematic activation'
    });

    // Insight 4: Incomplete feature detection
    const incompleteFeatures = Array.from(clusterResults.clusters.values())
      .reduce((sum, cluster) => sum + cluster.incompleteFeatures.length, 0);

    if (incompleteFeatures > 0) {
      insights.push({
        type: 'incomplete-features',
        title: 'Incomplete Feature Detection',
        description: `${incompleteFeatures} incomplete features detected across clusters`,
        impact: 'opportunity',
        recommendation: 'Prioritize completing identified incomplete features for quick value gains'
      });
    }

    // Insight 5: Quick win identification
    const quickWins = clusterResults.summary.recommendations.quickWins.length;
    if (quickWins > 0) {
      insights.push({
        type: 'quick-wins',
        title: 'Quick Win Opportunities',
        description: `${quickWins} quick win transformation opportunities identified`,
        impact: 'immediate',
        recommendation: 'Start with quick wins to demonstrate value and build momentum'
      });
    }

    return insights;
  }

  /**
   * Analyze domain concentration patterns
   */
  analyzeDomainConcentration(baseAnalysis, clusterResults) {
    const domainCounts = clusterResults.summary.distributions.domains;
    const totalVariables = clusterResults.summary.totalVariables;

    const domainPercentages = Object.entries(domainCounts)
      .map(([domain, count]) => ({
        name: domain,
        count,
        percentage: Math.round((count / totalVariables) * 100)
      }))
      .sort((a, b) => b.count - a.count);

    return {
      topDomain: domainPercentages[0],
      distribution: domainPercentages,
      concentrationIndex: domainPercentages[0].percentage / 100 // 0-1 scale
    };
  }

  /**
   * Assess overall transformation potential
   */
  assessOverallTransformationPotential(clusterResults) {
    const potentialCounts = clusterResults.summary.distributions.transformationPotential;
    const totalVariables = clusterResults.summary.totalVariables;

    const highPotential = (potentialCounts['very-high'] || 0) + (potentialCounts['high'] || 0);
    const highPotentialPercentage = Math.round((highPotential / totalVariables) * 100);

    return {
      highPotentialCount: highPotential,
      highPotentialPercentage,
      distribution: potentialCounts
    };
  }

  /**
   * Generate transformation roadmap
   */
  generateTransformationRoadmap(clusterResults) {
    const roadmap = {
      phases: [],
      timeline: 'Estimated 3-6 months for complete transformation',
      totalEffort: 'Medium to High',
      expectedValue: 'Very High'
    };

    // Phase 1: Quick Wins (0-1 month)
    const quickWins = clusterResults.summary.recommendations.quickWins;
    if (quickWins.length > 0) {
      roadmap.phases.push({
        phase: 1,
        name: 'Quick Wins Implementation',
        duration: '2-4 weeks',
        effort: 'Low to Medium',
        clusters: quickWins.map(qw => qw.clusterName),
        description: 'Implement low-effort, high-value transformations',
        expectedOutcome: 'Immediate value demonstration and momentum building'
      });
    }

    // Phase 2: Strategic Opportunities (1-3 months)
    const strategic = clusterResults.summary.recommendations.strategicOpportunities;
    if (strategic.length > 0) {
      roadmap.phases.push({
        phase: 2,
        name: 'Strategic Feature Development',
        duration: '6-8 weeks',
        effort: 'Medium to High',
        clusters: strategic.slice(0, 3).map(so => so.clusterName), // Top 3 strategic
        description: 'Develop high-value strategic features',
        expectedOutcome: 'Major functionality enhancements and business value'
      });
    }

    // Phase 3: Comprehensive Integration (3-6 months)
    const remainingHighValue = Array.from(clusterResults.clusters.entries())
      .filter(([clusterId, cluster]) => {
        const isQuickWin = quickWins.some(qw => qw.clusterId === clusterId);
        const isStrategic = strategic.some(so => so.clusterId === clusterId);
        return !isQuickWin && !isStrategic && cluster.transformationPotential === 'high';
      });

    if (remainingHighValue.length > 0) {
      roadmap.phases.push({
        phase: 3,
        name: 'Comprehensive System Integration',
        duration: '8-12 weeks',
        effort: 'High',
        clusters: remainingHighValue.slice(0, 5).map(([, cluster]) => cluster.name),
        description: 'Complete system integration and advanced features',
        expectedOutcome: 'Full system transformation and enterprise-grade capabilities'
      });
    }

    return roadmap;
  }

  /**
   * Generate implementation priorities
   */
  generateImplementationPriorities(clusterResults) {
    const priorities = [];

    // Priority 1: Astrological domain (core business value)
    const astrologicalClusters = Array.from(clusterResults.clusters.entries())
      .filter(([, cluster]) => cluster.domain === 'astrological')
      .sort((a, b) => b[1].size - a[1].size);

    if (astrologicalClusters.length > 0) {
      priorities.push({
        priority: 1,
        domain: 'astrological',
        rationale: 'Core business domain with highest user value',
        clusters: astrologicalClusters.slice(0, 3).map(([clusterId, cluster]) => ({
          id: clusterId,
          name: cluster.name,
          size: cluster.size,
          transformationPotential: cluster.transformationPotential
        })),
        recommendedApproach: 'Feature completion and enhancement',
        estimatedImpact: 'Very High'
      });
    }

    // Priority 2: Campaign system (operational excellence)
    const campaignClusters = Array.from(clusterResults.clusters.entries())
      .filter(([, cluster]) => cluster.domain === 'campaign')
      .sort((a, b) => b[1].size - a[1].size);

    if (campaignClusters.length > 0) {
      priorities.push({
        priority: 2,
        domain: 'campaign',
        rationale: 'Operational excellence and system intelligence',
        clusters: campaignClusters.slice(0, 2).map(([clusterId, cluster]) => ({
          id: clusterId,
          name: cluster.name,
          size: cluster.size,
          transformationPotential: cluster.transformationPotential
        })),
        recommendedApproach: 'Dashboard and monitoring activation',
        estimatedImpact: 'High'
      });
    }

    // Priority 3: Culinary domain (feature expansion)
    const culinaryClusters = Array.from(clusterResults.clusters.entries())
      .filter(([, cluster]) => cluster.domain === 'culinary')
      .sort((a, b) => b[1].size - a[1].size);

    if (culinaryClusters.length > 0) {
      priorities.push({
        priority: 3,
        domain: 'culinary',
        rationale: 'Feature expansion and user experience enhancement',
        clusters: culinaryClusters.map(([clusterId, cluster]) => ({
          id: clusterId,
          name: cluster.name,
          size: cluster.size,
          transformationPotential: cluster.transformationPotential
        })),
        recommendedApproach: 'Progressive feature enhancement',
        estimatedImpact: 'Medium to High'
      });
    }

    return priorities;
  }

  /**
   * Save analysis results to JSON file
   */
  saveResults(report, outputPath) {
    try {
      fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
      console.log(`📄 Integrated analysis report saved to: ${outputPath}`);
    } catch (error) {
      console.error(`Error saving report: ${error.message}`);
    }
  }

  /**
   * Generate markdown summary report
   */
  generateMarkdownSummary(report, outputPath) {
    const markdown = this.buildMarkdownReport(report);

    try {
      fs.writeFileSync(outputPath, markdown);
      console.log(`📝 Markdown summary saved to: ${outputPath}`);
    } catch (error) {
      console.error(`Error saving markdown summary: ${error.message}`);
    }
  }

  /**
   * Build markdown report content
   */
  buildMarkdownReport(report) {
    const { metadata, clusterAnalysis, integratedInsights, transformationRoadmap, implementationPriorities } = report;

    return `# Variable Cluster Analysis Report

**Analysis Date:** ${new Date(metadata.analysisDate).toLocaleDateString()}
**Total Variables:** ${metadata.baseVariables}
**Clustered Variables:** ${metadata.clusteredVariables}
**Identified Clusters:** ${metadata.clusterCount}

## Executive Summary

This intelligent cluster analysis identified ${metadata.clusterCount} semantic clusters containing ${metadata.clusteredVariables} variables with significant transformation potential. The analysis reveals ${clusterAnalysis.executiveSummary.highValueClusters} high-value clusters and ${clusterAnalysis.executiveSummary.quickWinOpportunities} quick-win opportunities.

### Key Metrics
- **Transformation Readiness:** ${clusterAnalysis.executiveSummary.transformationReadiness}%
- **Average Cluster Size:** ${clusterAnalysis.executiveSummary.averageClusterSize} variables
- **Quick Win Opportunities:** ${clusterAnalysis.executiveSummary.quickWinOpportunities}
- **Strategic Opportunities:** ${clusterAnalysis.executiveSummary.strategicOpportunities}

## Cluster Analysis Results

${clusterAnalysis.clusterAnalysis.map(cluster => `
### ${cluster.name}
- **Domain:** ${cluster.domain}
- **Size:** ${cluster.size} variables
- **Semantic Coherence:** ${cluster.semanticCoherence}%
- **Transformation Potential:** ${cluster.transformationPotential}
- **Value Grade:** ${cluster.valueAssessment.grade} (Score: ${cluster.valueAssessment.score})
- **Incomplete Features:** ${cluster.incompleteFeatures}
- **Activation Opportunities:** ${cluster.activationOpportunities}

**Recommendation:** ${cluster.valueAssessment.recommendation.description}
`).join('')}

## Integrated Insights

${integratedInsights.map(insight => `
### ${insight.title}
${insight.description}

**Impact:** ${insight.impact}
**Recommendation:** ${insight.recommendation}
`).join('')}

## Transformation Roadmap

**Timeline:** ${transformationRoadmap.timeline}
**Total Effort:** ${transformationRoadmap.totalEffort}
**Expected Value:** ${transformationRoadmap.expectedValue}

${transformationRoadmap.phases.map(phase => `
### Phase ${phase.phase}: ${phase.name}
- **Duration:** ${phase.duration}
- **Effort:** ${phase.effort}
- **Target Clusters:** ${phase.clusters.join(', ')}
- **Description:** ${phase.description}
- **Expected Outcome:** ${phase.expectedOutcome}
`).join('')}

## Implementation Priorities

${implementationPriorities.map(priority => `
### Priority ${priority.priority}: ${priority.domain.toUpperCase()} Domain
**Rationale:** ${priority.rationale}
**Recommended Approach:** ${priority.recommendedApproach}
**Estimated Impact:** ${priority.estimatedImpact}

**Target Clusters:**
${priority.clusters.map(cluster => `- ${cluster.name} (${cluster.size} variables, ${cluster.transformationPotential} potential)`).join('\n')}
`).join('')}

## Quick Win Opportunities

${clusterAnalysis.transformationOpportunities.quickWins.map(qw => `
### ${qw.clusterName}
- **Score:** ${Math.round(qw.score * 100)}%
- **Size:** ${qw.size} variables
- **Opportunities:** ${qw.opportunities.length}
`).join('')}

## Strategic Opportunities

${clusterAnalysis.transformationOpportunities.strategic.map(so => `
### ${so.clusterName}
- **Domain:** ${so.domain}
- **Score:** ${Math.round(so.score * 100)}%
- **Size:** ${so.size} variables
- **Incomplete Features:** ${so.incompleteFeatures}
`).join('')}

## Conclusion

The cluster analysis reveals significant transformation potential across ${metadata.clusterCount} semantic clusters. With ${clusterAnalysis.executiveSummary.transformationReadiness}% transformation readiness and ${clusterAnalysis.executiveSummary.quickWinOpportunities} quick-win opportunities, the codebase is well-positioned for systematic variable activation into valuable features.

**Recommended Next Steps:**
1. Begin with quick-win implementations to demonstrate value
2. Focus on astrological domain clusters for maximum business impact
3. Develop campaign system dashboards for operational excellence
4. Plan strategic feature development for long-term value

`;
  }

  /**
   * Print analysis summary to console
   */
  printAnalysisSummary(report) {
    const { metadata, clusterAnalysis, integratedInsights } = report;

    console.log('\n' + '='.repeat(80));
    console.log('🎯 INTELLIGENT VARIABLE CLUSTER ANALYSIS SUMMARY');
    console.log('='.repeat(80));

    console.log(`\n📊 Analysis Overview:`);
    console.log(`   Total Variables Analyzed: ${metadata.baseVariables}`);
    console.log(`   Successfully Clustered: ${metadata.clusteredVariables}`);
    console.log(`   Semantic Clusters Identified: ${metadata.clusterCount}`);
    console.log(`   Transformation Readiness: ${clusterAnalysis.executiveSummary.transformationReadiness}%`);

    console.log(`\n🏆 High-Value Opportunities:`);
    console.log(`   High-Value Clusters: ${clusterAnalysis.executiveSummary.highValueClusters}`);
    console.log(`   Quick Win Opportunities: ${clusterAnalysis.executiveSummary.quickWinOpportunities}`);
    console.log(`   Strategic Opportunities: ${clusterAnalysis.executiveSummary.strategicOpportunities}`);

    console.log(`\n🔍 Key Insights:`);
    integratedInsights.slice(0, 3).forEach((insight, index) => {
      console.log(`   ${index + 1}. ${insight.title}`);
      console.log(`      ${insight.description}`);
    });

    console.log(`\n🚀 Top Transformation Clusters:`);
    clusterAnalysis.clusterAnalysis
      .filter(cluster => cluster.valueAssessment.score >= 70)
      .slice(0, 5)
      .forEach((cluster, index) => {
        console.log(`   ${index + 1}. ${cluster.name} (${cluster.size} vars, Grade: ${cluster.valueAssessment.grade})`);
      });

    console.log('\n' + '='.repeat(80));
  }
}

// Execute if run directly
if (require.main === module) {
  const integration = new ClusterAnalysisIntegration();
  integration.runCompleteAnalysis().catch(error => {
    console.error('Cluster analysis integration failed:', error);
    process.exit(1);
  });
}

module.exports = ClusterAnalysisIntegration;
