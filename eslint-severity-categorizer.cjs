#!/usr/bin/env node

/**
 * ESLint Severity Categorizer
 *
 * Creates detailed severity and type categorization of ESLint warnings and errors
 * for strategic resolution planning.
 */

const fs = require('fs');

class ESLintSeverityCategorizer {
  constructor() {
    this.severityMatrix = {};
    this.typeCategories = {};
    this.impactAnalysis = {};
    this.resolutionStrategies = {};
  }

  /**
   * Generate detailed severity categorization
   */
  async generateSeverityCategorization() {
    console.log('🔍 Generating detailed ESLint severity categorization...');

    try {
      // Load the enhanced report
      const reportPath = 'enhanced-eslint-warning-report.json';
      if (!fs.existsSync(reportPath)) {
        throw new Error(`Enhanced report not found: ${reportPath}. Run enhanced-eslint-warning-analyzer.cjs first.`);
      }

      const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

      // Create detailed severity matrix
      console.log('📊 Creating detailed severity matrix...');
      this.createDetailedSeverityMatrix(report);

      // Analyze impact by category
      console.log('🎯 Analyzing impact by category...');
      this.analyzeImpactByCategory(report);

      // Generate resolution strategies
      console.log('🛠️ Generating resolution strategies...');
      this.generateResolutionStrategies(report);

      // Create comprehensive categorization report
      const categorizationReport = this.generateCategorizationReport(report);

      // Save detailed report
      const detailedReportPath = 'eslint-severity-categorization-detailed.json';
      fs.writeFileSync(detailedReportPath, JSON.stringify(categorizationReport, null, 2));

      // Generate markdown summary
      const summaryPath = 'eslint-severity-categorization-detailed-summary.md';
      const markdownSummary = this.generateDetailedMarkdownSummary(categorizationReport);
      fs.writeFileSync(summaryPath, markdownSummary);

      console.log(`✅ Detailed severity categorization generated:`);
      console.log(`   📊 JSON Report: ${detailedReportPath}`);
      console.log(`   📝 Summary: ${summaryPath}`);
      console.log(`   🎯 Severity Levels: ${Object.keys(this.severityMatrix).length}`);
      console.log(`   📂 Type Categories: ${Object.keys(this.typeCategories).length}`);
      console.log(`   🛠️ Resolution Strategies: ${Object.keys(this.resolutionStrategies).length}`);

      return categorizationReport;

    } catch (error) {
      console.error('❌ Error generating severity categorization:', error.message);
      throw error;
    }
  }

  /**
   * Create detailed severity matrix with business impact
   */
  createDetailedSeverityMatrix(report) {
    // Define detailed severity levels with business impact
    const severityDefinitions = {
      'BLOCKING': {
        description: 'Prevents compilation or breaks builds',
        businessImpact: 'Critical - blocks deployment',
        urgency: 'Immediate',
        effort: 'High',
        rules: ['no-undef', 'no-redeclare', 'no-const-assign', 'no-case-declarations'],
        weight: 10
      },
      'HIGH_RISK': {
        description: 'High probability of runtime errors',
        businessImpact: 'High - potential production issues',
        urgency: 'Within 24 hours',
        effort: 'Medium-High',
        rules: ['@typescript-eslint/no-unused-vars', 'no-unused-vars', 'react-hooks/rules-of-hooks'],
        weight: 8
      },
      'MAINTAINABILITY': {
        description: 'Affects code maintainability and developer experience',
        businessImpact: 'Medium - technical debt accumulation',
        urgency: 'Within 1 week',
        effort: 'Medium',
        rules: ['@typescript-eslint/no-explicit-any', 'react-hooks/exhaustive-deps'],
        weight: 6
      },
      'DEVELOPMENT': {
        description: 'Development artifacts and debugging code',
        businessImpact: 'Low - affects code cleanliness',
        urgency: 'Within 2 weeks',
        effort: 'Low',
        rules: ['no-console'],
        weight: 3
      },
      'STYLE': {
        description: 'Code style and formatting issues',
        businessImpact: 'Low - affects code consistency',
        urgency: 'Ongoing',
        effort: 'Low',
        rules: ['no-var', 'prefer-const', 'no-useless-escape'],
        weight: 2
      },
      'INFORMATIONAL': {
        description: 'Informational warnings and suggestions',
        businessImpact: 'Minimal - code improvement opportunities',
        urgency: 'As time permits',
        effort: 'Variable',
        rules: ['react/no-unescaped-entities', 'no-empty'],
        weight: 1
      }
    };

    // Categorize issues by detailed severity
    for (const [severityLevel, config] of Object.entries(severityDefinitions)) {
      this.severityMatrix[severityLevel] = {
        ...config,
        issues: [],
        count: 0,
        estimatedEffort: 0,
        files: new Set(),
        categories: new Set()
      };

      // Find matching issues
      for (const [category, issues] of Object.entries(report.categories)) {
        for (const issue of issues) {
          if (config.rules.includes(issue.rule)) {
            this.severityMatrix[severityLevel].issues.push(issue);
            this.severityMatrix[severityLevel].count++;
            this.severityMatrix[severityLevel].files.add(issue.file);
            this.severityMatrix[severityLevel].categories.add(category);

            // Calculate estimated effort
            const effortMap = {
              'no-console': 0.5,
              'prefer-const': 0.5,
              'no-var': 1,
              '@typescript-eslint/no-unused-vars': 3,
              'no-unused-vars': 2,
              '@typescript-eslint/no-explicit-any': 15,
              'react-hooks/exhaustive-deps': 10,
              'no-undef': 5,
              'no-redeclare': 5,
              'no-const-assign': 3
            };

            this.severityMatrix[severityLevel].estimatedEffort += effortMap[issue.rule] || 5;
          }
        }
      }

      // Convert sets to arrays for JSON serialization
      this.severityMatrix[severityLevel].files = Array.from(this.severityMatrix[severityLevel].files);
      this.severityMatrix[severityLevel].categories = Array.from(this.severityMatrix[severityLevel].categories);
    }
  }

  /**
   * Analyze impact by category with business context
   */
  analyzeImpactByCategory(report) {
    const categoryImpactDefinitions = {
      'type-safety': {
        businessRisk: 'High - Runtime type errors can cause application crashes',
        userImpact: 'High - Potential user-facing errors and data corruption',
        developmentImpact: 'Medium - Harder debugging and maintenance',
        priority: 'High',
        automationPotential: 'Medium - Requires careful type analysis'
      },
      'console-debugging': {
        businessRisk: 'Low - Performance impact and information leakage',
        userImpact: 'Low - Console clutter, potential sensitive data exposure',
        developmentImpact: 'Low - Code cleanliness and professionalism',
        priority: 'Medium',
        automationPotential: 'High - Easily automated with preservation rules'
      },
      'code-quality': {
        businessRisk: 'Medium - Accumulating technical debt',
        userImpact: 'Low - Indirect impact through slower development',
        developmentImpact: 'High - Affects developer productivity and code maintainability',
        priority: 'High',
        automationPotential: 'High - Many can be auto-fixed'
      },
      'react-hooks': {
        businessRisk: 'High - Performance issues and infinite re-renders',
        userImpact: 'High - Poor user experience, application freezing',
        developmentImpact: 'Medium - Complex debugging scenarios',
        priority: 'High',
        automationPotential: 'Low - Requires manual analysis'
      },
      'syntax-errors': {
        businessRisk: 'Critical - Prevents application from running',
        userImpact: 'Critical - Application completely broken',
        developmentImpact: 'Critical - Blocks all development',
        priority: 'Critical',
        automationPotential: 'Low - Requires manual fixes'
      },
      'other': {
        businessRisk: 'Variable - Depends on specific issues',
        userImpact: 'Variable - Case-by-case analysis needed',
        developmentImpact: 'Variable - Requires individual assessment',
        priority: 'Medium',
        automationPotential: 'Variable - Depends on specific rules'
      }
    };

    for (const [category, issues] of Object.entries(report.categories)) {
      const definition = categoryImpactDefinitions[category] || categoryImpactDefinitions['other'];

      this.impactAnalysis[category] = {
        ...definition,
        issueCount: issues.length,
        affectedFiles: [...new Set(issues.map(issue => issue.file))].length,
        topRules: this.getTopRulesForCategory(issues),
        estimatedResolutionTime: this.calculateCategoryResolutionTime(issues),
        riskScore: this.calculateRiskScore(definition, issues.length)
      };
    }
  }

  /**
   * Generate resolution strategies for each category
   */
  generateResolutionStrategies(report) {
    const strategyDefinitions = {
      'type-safety': {
        approach: 'Gradual Type Enhancement',
        phases: [
          'Identify safe any → unknown conversions',
          'Replace Record<string, any> with proper interfaces',
          'Add type guards for external data',
          'Preserve intentional any types with ESLint disable comments'
        ],
        tools: ['TypeScript compiler', 'Custom type replacement scripts'],
        timeline: '4-6 weeks',
        resources: 'Senior TypeScript developer',
        risks: 'Breaking changes to astrological calculations'
      },
      'console-debugging': {
        approach: 'Automated Console Cleanup',
        phases: [
          'Identify development vs intentional console statements',
          'Create preservation rules for debugging interfaces',
          'Apply automated removal with safety checks',
          'Validate no functionality is broken'
        ],
        tools: ['Custom console cleanup script', 'ESLint auto-fix'],
        timeline: '1-2 weeks',
        resources: 'Mid-level developer',
        risks: 'Removing intentional debug interfaces'
      },
      'code-quality': {
        approach: 'Systematic Quality Improvement',
        phases: [
          'Apply ESLint auto-fixes for safe rules',
          'Manual review of unused variables',
          'Preserve domain-specific patterns',
          'Validate build stability'
        ],
        tools: ['ESLint --fix', 'Custom unused variable analyzer'],
        timeline: '2-3 weeks',
        resources: 'Mid-level developer with domain knowledge',
        risks: 'Removing variables needed for astrological calculations'
      },
      'react-hooks': {
        approach: 'Manual Hook Optimization',
        phases: [
          'Analyze each hook dependency warning',
          'Determine if missing dependencies are intentional',
          'Add useCallback/useMemo where appropriate',
          'Test for performance regressions'
        ],
        tools: ['React DevTools', 'Performance profiling'],
        timeline: '1-2 weeks',
        resources: 'Senior React developer',
        risks: 'Performance regressions from over-optimization'
      },
      'syntax-errors': {
        approach: 'Immediate Manual Fixes',
        phases: [
          'Identify and fix parsing errors',
          'Resolve undefined variable references',
          'Fix redeclaration conflicts',
          'Validate compilation success'
        ],
        tools: ['TypeScript compiler', 'Manual code review'],
        timeline: '1-3 days',
        resources: 'Senior developer',
        risks: 'Breaking existing functionality'
      }
    };

    for (const category of Object.keys(report.categories)) {
      if (strategyDefinitions[category]) {
        this.resolutionStrategies[category] = {
          ...strategyDefinitions[category],
          issueCount: report.categories[category].length,
          priority: this.impactAnalysis[category]?.priority || 'Medium',
          estimatedCost: this.calculateResolutionCost(strategyDefinitions[category], report.categories[category].length)
        };
      }
    }
  }

  /**
   * Get top rules for a category
   */
  getTopRulesForCategory(issues) {
    const ruleCounts = {};
    for (const issue of issues) {
      ruleCounts[issue.rule] = (ruleCounts[issue.rule] || 0) + 1;
    }

    return Object.entries(ruleCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([rule, count]) => ({ rule, count }));
  }

  /**
   * Calculate category resolution time
   */
  calculateCategoryResolutionTime(issues) {
    const effortMap = {
      'no-console': 0.5,
      '@typescript-eslint/no-explicit-any': 15,
      '@typescript-eslint/no-unused-vars': 3,
      'react-hooks/exhaustive-deps': 10,
      'no-undef': 5
    };

    let totalMinutes = 0;
    for (const issue of issues) {
      totalMinutes += effortMap[issue.rule] || 5;
    }

    return {
      minutes: totalMinutes,
      hours: Math.ceil(totalMinutes / 60),
      days: Math.ceil(totalMinutes / (60 * 8)) // 8-hour work days
    };
  }

  /**
   * Calculate risk score
   */
  calculateRiskScore(definition, issueCount) {
    const priorityWeights = {
      'Critical': 10,
      'High': 8,
      'Medium': 5,
      'Low': 2
    };

    const baseScore = priorityWeights[definition.priority] || 5;
    const volumeMultiplier = Math.min(2, issueCount / 1000); // Cap at 2x for volume

    return Math.min(10, baseScore * (1 + volumeMultiplier));
  }

  /**
   * Calculate resolution cost
   */
  calculateResolutionCost(strategy, issueCount) {
    const timelineWeeks = parseInt(strategy.timeline.split('-')[0]) || 2;
    const developerCostPerWeek = 4000; // Estimated cost

    return {
      estimatedWeeks: timelineWeeks,
      estimatedCost: timelineWeeks * developerCostPerWeek,
      costPerIssue: (timelineWeeks * developerCostPerWeek) / issueCount
    };
  }

  /**
   * Generate comprehensive categorization report
   */
  generateCategorizationReport(originalReport) {
    return {
      metadata: {
        generatedAt: new Date().toISOString(),
        basedOnReport: 'enhanced-eslint-warning-report.json',
        totalIssues: originalReport.metadata.totalIssues,
        analysisDepth: 'detailed-severity-and-impact'
      },
      severityMatrix: this.severityMatrix,
      impactAnalysis: this.impactAnalysis,
      resolutionStrategies: this.resolutionStrategies,
      executiveSummary: this.generateExecutiveSummary(),
      actionPlan: this.generateActionPlan()
    };
  }

  /**
   * Generate executive summary
   */
  generateExecutiveSummary() {
    const totalIssues = Object.values(this.severityMatrix).reduce((sum, level) => sum + level.count, 0);
    const totalEffort = Object.values(this.severityMatrix).reduce((sum, level) => sum + level.estimatedEffort, 0);
    const criticalIssues = this.severityMatrix['BLOCKING']?.count || 0;
    const highRiskIssues = this.severityMatrix['HIGH_RISK']?.count || 0;

    return {
      totalIssues,
      criticalIssues,
      highRiskIssues,
      estimatedTotalEffort: {
        minutes: totalEffort,
        hours: Math.ceil(totalEffort / 60),
        weeks: Math.ceil(totalEffort / (60 * 40)) // 40-hour work weeks
      },
      businessImpact: criticalIssues > 0 ? 'Critical' : highRiskIssues > 100 ? 'High' : 'Medium',
      recommendedAction: criticalIssues > 0 ? 'Immediate action required' : 'Systematic resolution plan needed'
    };
  }

  /**
   * Generate action plan
   */
  generateActionPlan() {
    const phases = [];

    // Phase 1: Critical issues
    if (this.severityMatrix['BLOCKING']?.count > 0) {
      phases.push({
        phase: 1,
        name: 'Critical Issue Resolution',
        duration: '1-3 days',
        issues: this.severityMatrix['BLOCKING'].count,
        description: 'Fix all build-blocking errors immediately',
        success: 'Application compiles and builds successfully'
      });
    }

    // Phase 2: High risk issues
    if (this.severityMatrix['HIGH_RISK']?.count > 0) {
      phases.push({
        phase: phases.length + 1,
        name: 'High Risk Mitigation',
        duration: '1-2 weeks',
        issues: this.severityMatrix['HIGH_RISK'].count,
        description: 'Address issues with high probability of runtime errors',
        success: 'Reduced risk of production issues'
      });
    }

    // Phase 3: Maintainability improvements
    if (this.severityMatrix['MAINTAINABILITY']?.count > 0) {
      phases.push({
        phase: phases.length + 1,
        name: 'Maintainability Enhancement',
        duration: '3-4 weeks',
        issues: this.severityMatrix['MAINTAINABILITY'].count,
        description: 'Improve code maintainability and type safety',
        success: 'Improved developer experience and code quality'
      });
    }

    // Phase 4: Development cleanup
    if (this.severityMatrix['DEVELOPMENT']?.count > 0) {
      phases.push({
        phase: phases.length + 1,
        name: 'Development Cleanup',
        duration: '1-2 weeks',
        issues: this.severityMatrix['DEVELOPMENT'].count,
        description: 'Clean up development artifacts and debugging code',
        success: 'Production-ready code without development artifacts'
      });
    }

    return phases;
  }

  /**
   * Generate detailed markdown summary
   */
  generateDetailedMarkdownSummary(report) {
    const { metadata, severityMatrix, impactAnalysis, resolutionStrategies, executiveSummary, actionPlan } = report;

    return `# Detailed ESLint Severity Categorization

## Executive Summary

**Generated:** ${new Date(metadata.generatedAt).toLocaleString()}
**Total Issues:** ${executiveSummary.totalIssues}
**Critical Issues:** ${executiveSummary.criticalIssues}
**High Risk Issues:** ${executiveSummary.highRiskIssues}
**Business Impact:** ${executiveSummary.businessImpact}
**Estimated Total Effort:** ${executiveSummary.estimatedTotalEffort.hours} hours (${executiveSummary.estimatedTotalEffort.weeks} weeks)

**Recommended Action:** ${executiveSummary.recommendedAction}

## Severity Matrix

${Object.entries(severityMatrix)
  .filter(([, data]) => data.count > 0)
  .map(([severity, data]) => `### ${severity} (${data.count} issues)

**Description:** ${data.description}
**Business Impact:** ${data.businessImpact}
**Urgency:** ${data.urgency}
**Estimated Effort:** ${Math.ceil(data.estimatedEffort / 60)} hours
**Affected Files:** ${data.files.length}
**Categories:** ${data.categories.join(', ')}

**Top Rules:**
${data.issues.reduce((acc, issue) => {
  acc[issue.rule] = (acc[issue.rule] || 0) + 1;
  return acc;
}, {})}`)
  .join('\n\n')}

## Impact Analysis by Category

${Object.entries(impactAnalysis)
  .map(([category, analysis]) => `### ${category.toUpperCase()} (${analysis.issueCount} issues)

**Business Risk:** ${analysis.businessRisk}
**User Impact:** ${analysis.userImpact}
**Development Impact:** ${analysis.developmentImpact}
**Priority:** ${analysis.priority}
**Automation Potential:** ${analysis.automationPotential}
**Risk Score:** ${analysis.riskScore}/10
**Affected Files:** ${analysis.affectedFiles}
**Estimated Resolution:** ${analysis.estimatedResolutionTime.hours} hours

**Top Rules:**
${analysis.topRules.map(rule => `- ${rule.rule}: ${rule.count} occurrences`).join('\n')}`)
  .join('\n\n')}

## Resolution Strategies

${Object.entries(resolutionStrategies)
  .map(([category, strategy]) => `### ${category.toUpperCase()} Strategy

**Approach:** ${strategy.approach}
**Timeline:** ${strategy.timeline}
**Resources:** ${strategy.resources}
**Issue Count:** ${strategy.issueCount}
**Priority:** ${strategy.priority}
**Estimated Cost:** $${strategy.estimatedCost.estimatedCost.toLocaleString()}

**Implementation Phases:**
${strategy.phases.map((phase, index) => `${index + 1}. ${phase}`).join('\n')}

**Tools:** ${strategy.tools.join(', ')}
**Risks:** ${strategy.risks}`)
  .join('\n\n')}

## Action Plan

${actionPlan.map(phase => `### Phase ${phase.phase}: ${phase.name}

**Duration:** ${phase.duration}
**Issues to Address:** ${phase.issues}
**Description:** ${phase.description}
**Success Criteria:** ${phase.success}`)
  .join('\n\n')}

## Implementation Recommendations

### Immediate Actions (Next 24-48 hours)
1. **Fix Critical Issues**: Address all ${severityMatrix['BLOCKING']?.count || 0} blocking issues
2. **Establish Safety Protocols**: Set up rollback mechanisms for automated fixes
3. **Resource Allocation**: Assign senior developers to high-risk categories

### Short Term (1-2 weeks)
1. **Console Cleanup**: Automate removal of ${severityMatrix['DEVELOPMENT']?.count || 0} console statements
2. **High Risk Mitigation**: Address ${severityMatrix['HIGH_RISK']?.count || 0} high-risk issues
3. **Quality Gates**: Implement prevention measures

### Medium Term (3-6 weeks)
1. **Type Safety Enhancement**: Systematic approach to ${impactAnalysis['type-safety']?.issueCount || 0} type safety issues
2. **Code Quality Improvement**: Address ${impactAnalysis['code-quality']?.issueCount || 0} quality issues
3. **Performance Optimization**: React hooks and performance improvements

### Long Term (Ongoing)
1. **Prevention Systems**: Automated quality monitoring
2. **Developer Training**: Best practices and coding standards
3. **Continuous Improvement**: Regular quality assessments

---

*Detailed analysis generated by eslint-severity-categorizer.cjs*
*Based on enhanced ESLint warning analysis*
*Generated at ${new Date().toLocaleString()}*
`;
  }
}

// Main execution
async function main() {
  const categorizer = new ESLintSeverityCategorizer();

  try {
    const report = await categorizer.generateSeverityCategorization();

    console.log('\n🎯 Detailed Severity Categorization Complete!');
    console.log('\n📊 Summary:');
    console.log(`   Severity Levels: ${Object.keys(report.severityMatrix).length}`);
    console.log(`   Impact Categories: ${Object.keys(report.impactAnalysis).length}`);
    console.log(`   Resolution Strategies: ${Object.keys(report.resolutionStrategies).length}`);
    console.log(`   Action Plan Phases: ${report.actionPlan.length}`);
    console.log(`   Business Impact: ${report.executiveSummary.businessImpact}`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Categorization failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { ESLintSeverityCategorizer };
