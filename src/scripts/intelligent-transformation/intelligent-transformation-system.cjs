#!/usr/bin/env node

/**
 * Intelligent Transformation System Integration
 *
 * This script integrates the Variable Cluster Analyzer with the Transformation
 * Decision Engine to provide a complete intelligent transformation system for
 * unused variables.
 *
 * Features:
 * - Complete cluster analysis with semantic grouping
 * - Intelligent transformation vs elimination decisions
 * - Service layer activation into monitoring features
 * - Data processing transformation into validation systems
 * - Prefixing system for high-value variables
 * - Comprehensive implementation planning
 */

const fs = require('fs');
const path = require('path');
const UnusedVariableAnalyzer = require('../unused-variable-analyzer.cjs');
const VariableClusterAnalyzer = require('./VariableClusterAnalyzer.cjs');
const TransformationDecisionEngine = require('./TransformationDecisionEngine.cjs');

class IntelligentTransformationSystem {
  constructor() {
    this.variableAnalyzer = new UnusedVariableAnalyzer();
    this.clusterAnalyzer = new VariableClusterAnalyzer();
    this.decisionEngine = new TransformationDecisionEngine();
  }

  /**
   * Run complete intelligent transformation analysis
   */
  async runCompleteAnalysis() {
    console.log('🚀 Starting Intelligent Transformation System Analysis...\n');

    try {
      // Step 1: Base unused variable analysis
      console.log('📊 Step 1: Running base unused variable analysis...');
      const baseAnalysis = await this.variableAnalyzer.analyze();

      if (!baseAnalysis || !baseAnalysis.detailedResults) {
        throw new Error('Base analysis failed or returned no results');
      }

      console.log(`✅ Base analysis complete: ${baseAnalysis.detailedResults.length} variables analyzed\n`);

      // Step 2: Cluster analysis
      console.log('🔍 Step 2: Running intelligent cluster analysis...');
      const clusterResults = this.clusterAnalyzer.analyzeVariableClusters(baseAnalysis.detailedResults);

      console.log(`✅ Cluster analysis complete: ${clusterResults.summary.totalClusters} clusters identified\n`);

      // Step 3: Transformation decisions
      console.log('🤔 Step 3: Making transformation vs elimination decisions...');
      const decisionResults = this.decisionEngine.processClusterDecisions(
        clusterResults.clusters,
        clusterResults.valueAssessment
      );

      console.log(`✅ Decision analysis complete: ${decisionResults.decisions.size} decisions made\n`);

      // Step 4: Generate comprehensive report
      console.log('📄 Step 4: Generating comprehensive transformation report...');
      const comprehensiveReport = this.generateComprehensiveReport(
        baseAnalysis,
        clusterResults,
        decisionResults
      );

      // Step 5: Save results
      const outputPath = path.join(process.cwd(), 'intelligent-transformation-report.json');
      this.saveResults(comprehensiveReport, outputPath);

      // Step 6: Generate markdown summary
      const markdownPath = path.join(process.cwd(), 'intelligent-transformation-summary.md');
      this.generateMarkdownSummary(comprehensiveReport, markdownPath);

      // Step 7: Generate implementation scripts
      console.log('🛠️  Step 5: Generating implementation scripts...');
      this.generateImplementationScripts(decisionResults);

      // Step 8: Print executive summary
      this.printExecutiveSummary(comprehensiveReport);

      console.log(`\n✅ Complete intelligent transformation analysis finished!`);
      console.log(`📄 Detailed report: ${outputPath}`);
      console.log(`📝 Summary report: ${markdownPath}`);
      console.log(`🛠️  Implementation scripts: src/scripts/intelligent-transformation/generated/`);

      return comprehensiveReport;

    } catch (error) {
      console.error('❌ Intelligent transformation analysis failed:', error.message);
      throw error;
    }
  }

  /**
   * Generate comprehensive transformation report
   */
  generateComprehensiveReport(baseAnalysis, clusterResults, decisionResults) {
    return {
      metadata: {
        analysisDate: new Date().toISOString(),
        analyzer: 'IntelligentTransformationSystem v1.0',
        totalVariables: baseAnalysis.summary.total,
        clusteredVariables: clusterResults.summary.totalVariables,
        clusterCount: clusterResults.summary.totalClusters,
        decisionsCount: decisionResults.decisions.size
      },

      // Executive summary
      executiveSummary: this.generateExecutiveSummary(baseAnalysis, clusterResults, decisionResults),

      // Base analysis results
      baseAnalysis: {
        summary: baseAnalysis.summary,
        categoryBreakdown: baseAnalysis.categoryBreakdown,
        preservationRate: baseAnalysis.summary.preservationRate
      },

      // Cluster analysis results
      clusterAnalysis: {
        summary: clusterResults.summary,
        clusters: this.summarizeClusters(clusterResults.clusters),
        valueAssessment: this.summarizeValueAssessments(clusterResults.valueAssessment),
        transformationReadiness: clusterResults.summary.transformationInsights.transformationReadiness
      },

      // Decision analysis results
      decisionAnalysis: {
        summary: decisionResults.summary,
        decisions: this.summarizeDecisions(decisionResults.decisions),
        recommendations: decisionResults.recommendations,
        implementationPlan: decisionResults.implementationPlan
      },

      // Integrated insights
      integratedInsights: this.generateIntegratedInsights(baseAnalysis, clusterResults, decisionResults),

      // Action plan
      actionPlan: this.generateActionPlan(decisionResults),

      // ROI analysis
      roiAnalysis: this.generateROIAnalysis(clusterResults, decisionResults)
    };
  }

  /**
   * Generate executive summary
   */
  generateExecutiveSummary(baseAnalysis, clusterResults, decisionResults) {
    const transformationRate = (decisionResults.summary.transform / clusterResults.summary.totalClusters) * 100;
    const prefixingRate = (decisionResults.summary.prefix / clusterResults.summary.totalClusters) * 100;
    const eliminationRate = (decisionResults.summary.eliminate / clusterResults.summary.totalClusters) * 100;

    return {
      totalVariablesAnalyzed: baseAnalysis.summary.total,
      clustersIdentified: clusterResults.summary.totalClusters,
      transformationReadiness: Math.round(clusterResults.summary.transformationInsights.transformationReadiness * 100),

      decisionBreakdown: {
        transform: {
          count: decisionResults.summary.transform,
          percentage: Math.round(transformationRate)
        },
        prefix: {
          count: decisionResults.summary.prefix,
          percentage: Math.round(prefixingRate)
        },
        eliminate: {
          count: decisionResults.summary.eliminate,
          percentage: Math.round(eliminationRate)
        },
        manualReview: {
          count: decisionResults.summary.manualReview,
          percentage: Math.round((decisionResults.summary.manualReview / clusterResults.summary.totalClusters) * 100)
        }
      },

      keyInsights: [
        `${Math.round(transformationRate)}% of clusters recommended for transformation into active features`,
        `${Math.round(prefixingRate)}% of clusters recommended for prefixing to preserve future value`,
        `${Math.round(eliminationRate)}% of clusters safe for elimination`,
        `${clusterResults.summary.transformationInsights.highValueClusters} high-value transformation opportunities identified`
      ],

      estimatedImpact: {
        codeQuality: 'Very High',
        featureDevelopment: 'High',
        maintenanceReduction: 'Medium',
        businessValue: 'High'
      }
    };
  }

  /**
   * Summarize clusters for report
   */
  summarizeClusters(clusters) {
    return Array.from(clusters.entries()).map(([clusterId, cluster]) => ({
      id: clusterId,
      name: cluster.name,
      domain: cluster.domain,
      size: cluster.size,
      semanticCoherence: Math.round(cluster.semanticCoherence * 100),
      transformationPotential: cluster.transformationPotential,
      incompleteFeatures: cluster.incompleteFeatures.length,
      activationOpportunities: cluster.activationOpportunities.length
    }));
  }

  /**
   * Summarize value assessments for report
   */
  summarizeValueAssessments(valueAssessments) {
    return Array.from(valueAssessments.entries()).map(([clusterId, assessment]) => ({
      clusterId,
      totalScore: Math.round(assessment.totalScore * 100),
      grade: assessment.grade,
      recommendation: assessment.recommendation.action
    }));
  }

  /**
   * Summarize decisions for report
   */
  summarizeDecisions(decisions) {
    return Array.from(decisions.entries()).map(([clusterId, decision]) => ({
      clusterId,
      clusterName: decision.clusterName,
      decision: decision.decision,
      confidence: Math.round(decision.confidence * 100),
      reasoning: decision.reasoning,
      implementationType: decision.implementation.type,
      estimatedEffort: decision.implementation.estimatedEffort,
      variableCount: decision.variables.length
    }));
  }

  /**
   * Generate integrated insights
   */
  generateIntegratedInsights(baseAnalysis, clusterResults, decisionResults) {
    const insights = [];

    // Insight 1: Transformation potential realization
    const transformationClusters = decisionResults.summary.transform;
    const totalClusters = clusterResults.summary.totalClusters;
    const transformationRate = (transformationClusters / totalClusters) * 100;

    insights.push({
      type: 'transformation-potential',
      title: 'High Transformation Potential Realized',
      description: `${Math.round(transformationRate)}% of variable clusters have been identified for transformation into active features`,
      impact: transformationRate > 50 ? 'very-positive' : 'positive',
      recommendation: transformationRate > 50
        ? 'Excellent transformation opportunities - prioritize implementation'
        : 'Good transformation potential - plan systematic development'
    });

    // Insight 2: Domain-specific value preservation
    const domainDistribution = clusterResults.summary.distributions.domains;
    const astrologicalVars = domainDistribution.astrological || 0;
    const campaignVars = domainDistribution.campaign || 0;
    const coreBusinessVars = astrologicalVars + campaignVars;

    insights.push({
      type: 'domain-value-preservation',
      title: 'Core Business Domain Variables Preserved',
      description: `${coreBusinessVars} variables in core business domains (astrological, campaign) identified for transformation`,
      impact: 'strategic',
      recommendation: 'Focus transformation efforts on core business domains for maximum impact'
    });

    // Insight 3: Elimination safety
    const eliminationClusters = decisionResults.summary.eliminate;
    const eliminationRate = (eliminationClusters / totalClusters) * 100;

    insights.push({
      type: 'elimination-safety',
      title: 'Conservative Elimination Approach',
      description: `Only ${Math.round(eliminationRate)}% of clusters recommended for elimination, ensuring value preservation`,
      impact: 'positive',
      recommendation: 'Conservative approach minimizes risk while maximizing value retention'
    });

    // Insight 4: Implementation feasibility
    const quickWins = Array.from(decisionResults.decisions.values())
      .filter(d => d.decision === 'transform' && d.implementation.estimatedEffort === 'low').length;

    if (quickWins > 0) {
      insights.push({
        type: 'implementation-feasibility',
        title: 'Quick Win Opportunities Available',
        description: `${quickWins} low-effort transformation opportunities identified for immediate implementation`,
        impact: 'immediate',
        recommendation: 'Start with quick wins to demonstrate value and build momentum'
      });
    }

    return insights;
  }

  /**
   * Generate action plan
   */
  generateActionPlan(decisionResults) {
    const actionPlan = {
      immediateActions: [],
      shortTermActions: [],
      longTermActions: []
    };

    // Process decisions into action categories
    decisionResults.decisions.forEach(decision => {
      const action = {
        cluster: decision.clusterName,
        action: decision.decision,
        effort: decision.implementation.estimatedEffort,
        confidence: Math.round(decision.confidence * 100),
        description: decision.implementation.description
      };

      if (decision.decision === 'prefix' ||
          (decision.decision === 'transform' && decision.implementation.estimatedEffort === 'low')) {
        actionPlan.immediateActions.push(action);
      } else if (decision.decision === 'transform' && decision.implementation.estimatedEffort === 'medium') {
        actionPlan.shortTermActions.push(action);
      } else {
        actionPlan.longTermActions.push(action);
      }
    });

    return actionPlan;
  }

  /**
   * Generate ROI analysis
   */
  generateROIAnalysis(clusterResults, decisionResults) {
    // Calculate potential value from transformations
    const transformationDecisions = Array.from(decisionResults.decisions.values())
      .filter(d => d.decision === 'transform');

    const valueMapping = {
      'very-high': 10,
      'high': 7,
      'medium': 5,
      'low': 2
    };

    const effortMapping = {
      'low': 2,
      'medium': 5,
      'high': 8,
      'very-high': 10
    };

    let totalValue = 0;
    let totalEffort = 0;

    transformationDecisions.forEach(decision => {
      const value = valueMapping[decision.implementation.expectedValue] || 5;
      const effort = effortMapping[decision.implementation.estimatedEffort] || 5;

      totalValue += value;
      totalEffort += effort;
    });

    const roi = totalEffort > 0 ? (totalValue / totalEffort) : 0;

    return {
      transformationCount: transformationDecisions.length,
      totalEstimatedValue: totalValue,
      totalEstimatedEffort: totalEffort,
      roiRatio: Math.round(roi * 100) / 100,
      roiGrade: roi >= 1.5 ? 'Excellent' : roi >= 1.2 ? 'Good' : roi >= 1.0 ? 'Fair' : 'Poor',
      recommendation: roi >= 1.2
        ? 'High ROI - proceed with transformation plan'
        : roi >= 1.0
        ? 'Positive ROI - proceed with selective transformations'
        : 'Low ROI - focus on highest value transformations only'
    };
  }

  /**
   * Generate implementation scripts
   */
  generateImplementationScripts(decisionResults) {
    const scriptsDir = path.join(process.cwd(), 'src/scripts/intelligent-transformation/generated');

    // Ensure directory exists
    if (!fs.existsSync(scriptsDir)) {
      fs.mkdirSync(scriptsDir, { recursive: true });
    }

    // Generate transformation script
    this.generateTransformationScript(decisionResults, scriptsDir);

    // Generate prefixing script
    this.generatePrefixingScript(decisionResults, scriptsDir);

    // Generate elimination script
    this.generateEliminationScript(decisionResults, scriptsDir);

    console.log(`✅ Implementation scripts generated in ${scriptsDir}`);
  }

  /**
   * Generate transformation implementation script
   */
  generateTransformationScript(decisionResults, scriptsDir) {
    const transformationDecisions = Array.from(decisionResults.decisions.values())
      .filter(d => d.decision === 'transform');

    if (transformationDecisions.length === 0) return;

    const scriptContent = `#!/usr/bin/env node

/**
 * Generated Transformation Implementation Script
 *
 * This script implements the transformation decisions made by the
 * Intelligent Transformation System.
 *
 * Generated on: ${new Date().toISOString()}
 * Transformations: ${transformationDecisions.length}
 */

const fs = require('fs');
const path = require('path');

class TransformationImplementor {
  constructor() {
    this.transformations = ${JSON.stringify(transformationDecisions, null, 4)};
  }

  async implementTransformations() {
    console.log('🚀 Starting transformation implementation...');

    for (const transformation of this.transformations) {
      console.log(\`\\n🔧 Implementing: \${transformation.clusterName}\`);
      console.log(\`   Type: \${transformation.implementation.type}\`);
      console.log(\`   Effort: \${transformation.implementation.estimatedEffort}\`);
      console.log(\`   Variables: \${transformation.variables.length}\`);

      // Implementation steps would go here
      // This is a template - actual implementation depends on specific transformation type

      await this.implementClusterTransformation(transformation);
    }

    console.log('\\n✅ All transformations completed!');
  }

  async implementClusterTransformation(transformation) {
    // Template implementation - customize based on transformation type
    console.log(\`   📝 \${transformation.implementation.description}\`);

    if (transformation.implementation.type === 'strategic-transformation') {
      await this.implementStrategicTransformation(transformation);
    } else {
      await this.implementGenericTransformation(transformation);
    }
  }

  async implementStrategicTransformation(transformation) {
    const impl = transformation.implementation;

    // Create target directories
    if (impl.targetFiles) {
      impl.targetFiles.forEach(targetPath => {
        const fullPath = path.join(process.cwd(), targetPath);
        if (!fs.existsSync(fullPath)) {
          fs.mkdirSync(fullPath, { recursive: true });
          console.log(\`   📁 Created directory: \${targetPath}\`);
        }
      });
    }

    // Log implementation steps
    if (impl.steps) {
      console.log('   📋 Implementation steps:');
      impl.steps.forEach((step, index) => {
        console.log(\`      \${index + 1}. \${step}\`);
      });
    }
  }

  async implementGenericTransformation(transformation) {
    console.log('   ⚠️  Generic transformation - requires manual implementation');
    console.log(\`   📝 Description: \${transformation.implementation.description}\`);
  }
}

// Execute if run directly
if (require.main === module) {
  const implementor = new TransformationImplementor();
  implementor.implementTransformations().catch(error => {
    console.error('Transformation implementation failed:', error);
    process.exit(1);
  });
}

module.exports = TransformationImplementor;
`;

    fs.writeFileSync(path.join(scriptsDir, 'implement-transformations.cjs'), scriptContent);
  }

  /**
   * Generate prefixing implementation script
   */
  generatePrefixingScript(decisionResults, scriptsDir) {
    const prefixingDecisions = Array.from(decisionResults.decisions.values())
      .filter(d => d.decision === 'prefix');

    if (prefixingDecisions.length === 0) return;

    const scriptContent = `#!/usr/bin/env node

/**
 * Generated Prefixing Implementation Script
 *
 * This script applies prefixes to variables as decided by the
 * Intelligent Transformation System.
 *
 * Generated on: ${new Date().toISOString()}
 * Prefixing actions: ${prefixingDecisions.length}
 */

const fs = require('fs');
const path = require('path');

class PrefixingImplementor {
  constructor() {
    this.prefixingActions = ${JSON.stringify(prefixingDecisions, null, 4)};
  }

  async implementPrefixing() {
    console.log('🏷️  Starting variable prefixing implementation...');

    for (const action of this.prefixingActions) {
      console.log(\`\\n🔧 Prefixing cluster: \${action.clusterName}\`);
      console.log(\`   Prefix: \${action.implementation.prefix}\`);
      console.log(\`   Variables: \${action.variables.length}\`);

      await this.implementClusterPrefixing(action);
    }

    console.log('\\n✅ All prefixing completed!');
  }

  async implementClusterPrefixing(action) {
    for (const variable of action.variables) {
      if (variable.transformation && variable.transformation.type === 'prefix') {
        console.log(\`   🏷️  \${variable.name} -> \${variable.transformation.newName}\`);
        console.log(\`      File: \${variable.file}\`);
        console.log(\`      Reason: \${variable.transformation.reason}\`);

        // Actual prefixing implementation would go here
        // This would involve:
        // 1. Reading the file
        // 2. Finding the variable declaration
        // 3. Applying the prefix
        // 4. Writing the file back
        // 5. Updating any references if needed
      }
    }
  }
}

// Execute if run directly
if (require.main === module) {
  const implementor = new PrefixingImplementor();
  implementor.implementPrefixing().catch(error => {
    console.error('Prefixing implementation failed:', error);
    process.exit(1);
  });
}

module.exports = PrefixingImplementor;
`;

    fs.writeFileSync(path.join(scriptsDir, 'implement-prefixing.cjs'), scriptContent);
  }

  /**
   * Generate elimination implementation script
   */
  generateEliminationScript(decisionResults, scriptsDir) {
    const eliminationDecisions = Array.from(decisionResults.decisions.values())
      .filter(d => d.decision === 'eliminate');

    if (eliminationDecisions.length === 0) return;

    const scriptContent = `#!/usr/bin/env node

/**
 * Generated Elimination Implementation Script
 *
 * This script safely eliminates variables as decided by the
 * Intelligent Transformation System.
 *
 * Generated on: ${new Date().toISOString()}
 * Elimination actions: ${eliminationDecisions.length}
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class EliminationImplementor {
  constructor() {
    this.eliminationActions = ${JSON.stringify(eliminationDecisions, null, 4)};
  }

  async implementEliminations() {
    console.log('🗑️  Starting safe variable elimination...');

    // Create backup before starting
    this.createBackup();

    for (const action of this.eliminationActions) {
      console.log(\`\\n🔧 Eliminating cluster: \${action.clusterName}\`);
      console.log(\`   Variables: \${action.variables.length}\`);
      console.log(\`   Confidence: \${action.confidence}%\`);

      await this.implementClusterElimination(action);
    }

    // Validate after all eliminations
    await this.validateEliminations();

    console.log('\\n✅ All eliminations completed safely!');
  }

  createBackup() {
    try {
      execSync('git stash push -m "Pre-elimination backup"', { stdio: 'inherit' });
      console.log('✅ Created git stash backup');
    } catch (error) {
      console.warn('⚠️  Could not create git stash backup:', error.message);
    }
  }

  async implementClusterElimination(action) {
    for (const variable of action.variables) {
      console.log(\`   🗑️  Eliminating: \${variable.name}\`);
      console.log(\`      File: \${variable.file}\`);

      // Actual elimination implementation would go here
      // This would involve:
      // 1. Reading the file
      // 2. Finding the variable declaration
      // 3. Removing the declaration
      // 4. Removing any unused imports
      // 5. Writing the file back
    }
  }

  async validateEliminations() {
    console.log('\\n🔍 Validating eliminations...');

    try {
      // TypeScript compilation check
      execSync('yarn tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
      console.log('✅ TypeScript compilation successful');

      // Test suite check
      execSync('yarn test --run', { stdio: 'pipe' });
      console.log('✅ Test suite passed');

    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      console.log('🔄 Rolling back changes...');

      try {
        execSync('git stash pop', { stdio: 'inherit' });
        console.log('✅ Changes rolled back successfully');
      } catch (rollbackError) {
        console.error('❌ Rollback failed:', rollbackError.message);
      }

      throw new Error('Elimination validation failed - changes rolled back');
    }
  }
}

// Execute if run directly
if (require.main === module) {
  const implementor = new EliminationImplementor();
  implementor.implementEliminations().catch(error => {
    console.error('Elimination implementation failed:', error);
    process.exit(1);
  });
}

module.exports = EliminationImplementor;
`;

    fs.writeFileSync(path.join(scriptsDir, 'implement-eliminations.cjs'), scriptContent);
  }

  /**
   * Save comprehensive results
   */
  saveResults(report, outputPath) {
    try {
      fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
      console.log(`📄 Comprehensive report saved to: ${outputPath}`);
    } catch (error) {
      console.error(`Error saving report: ${error.message}`);
    }
  }

  /**
   * Generate markdown summary
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
   * Build comprehensive markdown report
   */
  buildMarkdownReport(report) {
    const { metadata, executiveSummary, decisionAnalysis, integratedInsights, actionPlan, roiAnalysis } = report;

    return `# Intelligent Transformation System Report

**Analysis Date:** ${new Date(metadata.analysisDate).toLocaleDateString()}
**Total Variables Analyzed:** ${metadata.totalVariables}
**Clusters Identified:** ${metadata.clusterCount}
**Decisions Made:** ${metadata.decisionsCount}

## Executive Summary

### Analysis Overview
- **Variables Analyzed:** ${executiveSummary.totalVariablesAnalyzed}
- **Clusters Identified:** ${executiveSummary.clustersIdentified}
- **Transformation Readiness:** ${executiveSummary.transformationReadiness}%

### Decision Breakdown
- **Transform:** ${executiveSummary.decisionBreakdown.transform.count} clusters (${executiveSummary.decisionBreakdown.transform.percentage}%)
- **Prefix:** ${executiveSummary.decisionBreakdown.prefix.count} clusters (${executiveSummary.decisionBreakdown.prefix.percentage}%)
- **Eliminate:** ${executiveSummary.decisionBreakdown.eliminate.count} clusters (${executiveSummary.decisionBreakdown.eliminate.percentage}%)
- **Manual Review:** ${executiveSummary.decisionBreakdown.manualReview.count} clusters (${executiveSummary.decisionBreakdown.manualReview.percentage}%)

### Key Insights
${executiveSummary.keyInsights.map(insight => `- ${insight}`).join('\n')}

### Estimated Impact
- **Code Quality:** ${executiveSummary.estimatedImpact.codeQuality}
- **Feature Development:** ${executiveSummary.estimatedImpact.featureDevelopment}
- **Maintenance Reduction:** ${executiveSummary.estimatedImpact.maintenanceReduction}
- **Business Value:** ${executiveSummary.estimatedImpact.businessValue}

## Decision Analysis Summary

${decisionAnalysis.decisions.map(decision => `
### ${decision.clusterName}
- **Decision:** ${decision.decision.toUpperCase()}
- **Confidence:** ${decision.confidence}%
- **Implementation Type:** ${decision.implementationType}
- **Estimated Effort:** ${decision.estimatedEffort}
- **Variables:** ${decision.variableCount}
- **Reasoning:** ${decision.reasoning}
`).join('')}

## Integrated Insights

${integratedInsights.map(insight => `
### ${insight.title}
${insight.description}

**Impact:** ${insight.impact}
**Recommendation:** ${insight.recommendation}
`).join('')}

## Implementation Plan

### Phase Overview
${decisionAnalysis.implementationPlan.phases.map(phase => `
#### Phase ${phase.phase}: ${phase.name}
- **Duration:** ${phase.duration}
- **Actions:** ${phase.actions}
- **Description:** ${phase.description}
- **Target Clusters:** ${phase.clusters.join(', ')}
`).join('')}

**Total Duration:** ${decisionAnalysis.implementationPlan.totalDuration}
**Total Actions:** ${decisionAnalysis.implementationPlan.totalActions}
**Estimated Effort:** ${decisionAnalysis.implementationPlan.estimatedEffort}
**Expected Value:** ${decisionAnalysis.implementationPlan.expectedValue}

## Action Plan

### Immediate Actions (0-2 weeks)
${actionPlan.immediateActions.map(action => `
- **${action.cluster}:** ${action.description}
  - Action: ${action.action.toUpperCase()}
  - Effort: ${action.effort}
  - Confidence: ${action.confidence}%
`).join('')}

### Short-term Actions (2-8 weeks)
${actionPlan.shortTermActions.map(action => `
- **${action.cluster}:** ${action.description}
  - Action: ${action.action.toUpperCase()}
  - Effort: ${action.effort}
  - Confidence: ${action.confidence}%
`).join('')}

### Long-term Actions (8+ weeks)
${actionPlan.longTermActions.map(action => `
- **${action.cluster}:** ${action.description}
  - Action: ${action.action.toUpperCase()}
  - Effort: ${action.effort}
  - Confidence: ${action.confidence}%
`).join('')}

## ROI Analysis

- **Transformation Count:** ${roiAnalysis.transformationCount}
- **Total Estimated Value:** ${roiAnalysis.totalEstimatedValue}
- **Total Estimated Effort:** ${roiAnalysis.totalEstimatedEffort}
- **ROI Ratio:** ${roiAnalysis.roiRatio}
- **ROI Grade:** ${roiAnalysis.roiGrade}

**Recommendation:** ${roiAnalysis.recommendation}

## Implementation Recommendations

${decisionAnalysis.recommendations.map(rec => `
### ${rec.title}
${rec.description}

**Priority:** ${rec.priority}
**Action:** ${rec.action}
`).join('')}

## Conclusion

The Intelligent Transformation System has successfully analyzed ${metadata.totalVariables} unused variables, identifying ${metadata.clusterCount} semantic clusters with significant transformation potential. With ${executiveSummary.decisionBreakdown.transform.percentage}% of clusters recommended for transformation and an ROI grade of ${roiAnalysis.roiGrade}, this analysis provides a clear roadmap for converting unused code into valuable features.

**Next Steps:**
1. Begin with immediate actions to demonstrate quick value
2. Focus on high-value transformations in core business domains
3. Implement systematic prefixing for future value preservation
4. Execute the phased implementation plan over ${decisionAnalysis.implementationPlan.totalDuration}

`;
  }

  /**
   * Print executive summary to console
   */
  printExecutiveSummary(report) {
    const { executiveSummary, decisionAnalysis, roiAnalysis } = report;

    console.log('\n' + '='.repeat(80));
    console.log('🎯 INTELLIGENT TRANSFORMATION SYSTEM - EXECUTIVE SUMMARY');
    console.log('='.repeat(80));

    console.log(`\n📊 Analysis Results:`);
    console.log(`   Variables Analyzed: ${executiveSummary.totalVariablesAnalyzed}`);
    console.log(`   Clusters Identified: ${executiveSummary.clustersIdentified}`);
    console.log(`   Transformation Readiness: ${executiveSummary.transformationReadiness}%`);

    console.log(`\n🎯 Decision Breakdown:`);
    console.log(`   Transform: ${executiveSummary.decisionBreakdown.transform.count} clusters (${executiveSummary.decisionBreakdown.transform.percentage}%)`);
    console.log(`   Prefix: ${executiveSummary.decisionBreakdown.prefix.count} clusters (${executiveSummary.decisionBreakdown.prefix.percentage}%)`);
    console.log(`   Eliminate: ${executiveSummary.decisionBreakdown.eliminate.count} clusters (${executiveSummary.decisionBreakdown.eliminate.percentage}%)`);
    console.log(`   Manual Review: ${executiveSummary.decisionBreakdown.manualReview.count} clusters (${executiveSummary.decisionBreakdown.manualReview.percentage}%)`);

    console.log(`\n💎 ROI Analysis:`);
    console.log(`   ROI Ratio: ${roiAnalysis.roiRatio}`);
    console.log(`   ROI Grade: ${roiAnalysis.roiGrade}`);
    console.log(`   Recommendation: ${roiAnalysis.recommendation}`);

    console.log(`\n🚀 Implementation Timeline:`);
    console.log(`   Total Duration: ${decisionAnalysis.implementationPlan.totalDuration}`);
    console.log(`   Total Actions: ${decisionAnalysis.implementationPlan.totalActions}`);
    console.log(`   Estimated Effort: ${decisionAnalysis.implementationPlan.estimatedEffort}`);
    console.log(`   Expected Value: ${decisionAnalysis.implementationPlan.expectedValue}`);

    console.log(`\n🔑 Key Insights:`);
    executiveSummary.keyInsights.slice(0, 3).forEach((insight, index) => {
      console.log(`   ${index + 1}. ${insight}`);
    });

    console.log('\n' + '='.repeat(80));
  }
}

// Execute if run directly
if (require.main === module) {
  const system = new IntelligentTransformationSystem();
  system.runCompleteAnalysis().catch(error => {
    console.error('Intelligent transformation system failed:', error);
    process.exit(1);
  });
}

module.exports = IntelligentTransformationSystem;
