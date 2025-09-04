#!/usr/bin/env node

/**
 * High-Impact Warning Prioritizer
 *
 * Identifies and prioritizes warnings that should be fixed immediately
 * based on impact, effort, and automation potential
 */

const fs = require('fs');
const path = require('path');

class HighImpactWarningPrioritizer {
  constructor() {
    this.highImpactWarnings = [];
    this.priorityQueue = [];
    this.automationCandidates = [];
    this.manualReviewRequired = [];
    this.quickWins = [];
  }

  /**
   * Main prioritization function
   */
  async prioritize() {
    console.log('⚡ High-Impact Warning Prioritization');
    console.log('====================================\n');

    try {
      // Load categorization data
      console.log('📊 Step 1: Loading categorization data...');
      const categorizationData = this.loadCategorizationData();

      // Identify high-impact warnings
      console.log('🎯 Step 2: Identifying high-impact warnings...');
      this.identifyHighImpactWarnings(categorizationData);

      // Create priority queue
      console.log('📋 Step 3: Creating priority queue...');
      this.createPriorityQueue(categorizationData);

      // Identify automation candidates
      console.log('🔧 Step 4: Identifying automation candidates...');
      this.identifyAutomationCandidates(categorizationData);

      // Find quick wins
      console.log('⚡ Step 5: Finding quick wins...');
      this.findQuickWins(categorizationData);

      // Generate prioritization report
      console.log('📄 Step 6: Generating prioritization report...');
      const prioritizationReport = this.generatePrioritizationReport(categorizationData);

      // Save reports
      this.savePrioritizationReports(prioritizationReport);

      // Display summary
      this.displayPrioritizationSummary(prioritizationReport);

      return prioritizationReport;

    } catch (error) {
      console.error('❌ Prioritization failed:', error.message);
      throw error;
    }
  }

  /**
   * Load categorization data
   */
  loadCategorizationData() {
    const categorizationPath = 'warning-severity-categorization-report.json';
    const originalPath = 'eslint-warning-categorization-report.json';

    if (!fs.existsSync(categorizationPath)) {
      throw new Error(`Categorization report not found: ${categorizationPath}. Run warning-severity-categorizer.cjs first.`);
    }

    if (!fs.existsSync(originalPath)) {
      throw new Error(`Original report not found: ${originalPath}. Run eslint-warning-categorizer.cjs first.`);
    }

    const categorizationData = JSON.parse(fs.readFileSync(categorizationPath, 'utf8'));
    const originalData = JSON.parse(fs.readFileSync(originalPath, 'utf8'));

    console.log(`   ✅ Loaded categorization data with ${categorizationData.metadata.totalWarnings} warnings`);

    return { categorization: categorizationData, original: originalData };
  }

  /**
   * Identify high-impact warnings based on multiple criteria
   */
  identifyHighImpactWarnings(data) {
    const { categorization, original } = data;

    // Define high-impact criteria
    const highImpactCriteria = {
      'critical-severity': {
        weight: 10,
        description: 'Critical severity warnings that block development',
        filter: (warning) => this.getWarningSeverity(warning, categorization) === 'critical'
      },
      'debug-volume': {
        weight: 8,
        description: 'High-volume debug warnings (console statements)',
        filter: (warning) => warning.rule === 'no-console'
      },
      'type-safety-risk': {
        weight: 9,
        description: 'Type safety violations with runtime risk',
        filter: (warning) => warning.rule === '@typescript-eslint/no-explicit-any'
      },
      'unused-code-clutter': {
        weight: 7,
        description: 'Unused variables that clutter the codebase',
        filter: (warning) => ['@typescript-eslint/no-unused-vars', 'no-unused-vars'].includes(warning.rule)
      },
      'react-performance': {
        weight: 8,
        description: 'React hooks issues that affect performance',
        filter: (warning) => warning.rule === 'react-hooks/exhaustive-deps'
      },
      'high-frequency-files': {
        weight: 6,
        description: 'Warnings in files with many issues (>50 warnings)',
        filter: (warning) => {
          try {
            return this.getFileWarningCount(warning.file, original) > 50;
          } catch (error) {
            console.warn(`Warning: Could not get file count for ${warning.file}`);
            return false;
          }
        }
      }
    };

    // Collect all warnings from original data
    const allWarnings = [];
    for (const [category, categoryData] of Object.entries(original.categories)) {
      allWarnings.push(...categoryData.warnings);
    }

    // Score and categorize warnings
    for (const warning of allWarnings) {
      let totalScore = 0;
      const matchedCriteria = [];

      for (const [criteriaName, criteria] of Object.entries(highImpactCriteria)) {
        if (criteria.filter(warning)) {
          totalScore += criteria.weight;
          matchedCriteria.push({
            name: criteriaName,
            description: criteria.description,
            weight: criteria.weight
          });
        }
      }

      // Consider high-impact if score >= 6
      if (totalScore >= 6) {
        this.highImpactWarnings.push({
          ...warning,
          impactScore: totalScore,
          matchedCriteria,
          severity: this.getWarningSeverity(warning, categorization),
          automationPotential: this.getAutomationPotential(warning),
          estimatedEffort: this.getEstimatedEffort(warning),
          businessImpact: this.getBusinessImpact(warning)
        });
      }
    }

    // Sort by impact score
    this.highImpactWarnings.sort((a, b) => b.impactScore - a.impactScore);

    console.log(`   🎯 Identified ${this.highImpactWarnings.length} high-impact warnings`);
  }

  /**
   * Create priority queue for immediate action
   */
  createPriorityQueue(data) {
    // Define priority levels for immediate action
    const priorityLevels = {
      'immediate': {
        description: 'Fix within 24 hours',
        criteria: (warning) => warning.impactScore >= 9 || warning.severity === 'critical',
        maxEffort: 1, // 1 hour max per warning
        warnings: []
      },
      'urgent': {
        description: 'Fix within 1 week',
        criteria: (warning) => warning.impactScore >= 7 && warning.automationPotential >= 0.7,
        maxEffort: 2, // 2 hours max per warning
        warnings: []
      },
      'high': {
        description: 'Fix within 2 weeks',
        criteria: (warning) => warning.impactScore >= 6 && warning.estimatedEffort <= 5,
        maxEffort: 5, // 5 hours max per warning
        warnings: []
      },
      'planned': {
        description: 'Plan for next sprint',
        criteria: (warning) => warning.impactScore >= 6,
        maxEffort: 15, // 15 hours max per warning
        warnings: []
      }
    };

    // Categorize high-impact warnings by priority
    for (const warning of this.highImpactWarnings) {
      let assigned = false;

      for (const [priority, config] of Object.entries(priorityLevels)) {
        if (config.criteria(warning) && warning.estimatedEffort <= config.maxEffort) {
          config.warnings.push(warning);
          assigned = true;
          break;
        }
      }

      // Default to planned if not assigned
      if (!assigned) {
        priorityLevels.planned.warnings.push(warning);
      }
    }

    this.priorityQueue = priorityLevels;

    console.log(`   📋 Created priority queue with ${Object.keys(priorityLevels).length} levels`);
  }

  /**
   * Identify warnings that can be automated
   */
  identifyAutomationCandidates(data) {
    const automationRules = {
      'console-cleanup': {
        rules: ['no-console'],
        automationLevel: 0.9,
        description: 'Console statements can be automatically removed with preservation rules',
        scriptNeeded: 'console-statement-cleaner.cjs',
        estimatedTime: '1-2 hours',
        riskLevel: 'low'
      },
      'variable-declarations': {
        rules: ['prefer-const', 'no-var'],
        automationLevel: 0.95,
        description: 'Variable declarations can be automatically fixed',
        scriptNeeded: 'ESLint --fix',
        estimatedTime: '30 minutes',
        riskLevel: 'very-low'
      },
      'unused-imports': {
        rules: ['@typescript-eslint/no-unused-imports'],
        automationLevel: 0.8,
        description: 'Unused imports can be automatically removed',
        scriptNeeded: 'unused-import-cleaner.cjs',
        estimatedTime: '1 hour',
        riskLevel: 'low'
      },
      'import-organization': {
        rules: ['import/order'],
        automationLevel: 0.9,
        description: 'Import statements can be automatically organized',
        scriptNeeded: 'ESLint --fix',
        estimatedTime: '15 minutes',
        riskLevel: 'very-low'
      }
    };

    for (const warning of this.highImpactWarnings) {
      for (const [automationType, config] of Object.entries(automationRules)) {
        if (config.rules.includes(warning.rule)) {
          this.automationCandidates.push({
            ...warning,
            automationType,
            automationConfig: config
          });
          break;
        }
      }
    }

    // Also identify manual review candidates
    this.manualReviewRequired = this.highImpactWarnings.filter(warning =>
      !this.automationCandidates.some(auto =>
        auto.file === warning.file &&
        auto.line === warning.line &&
        auto.rule === warning.rule
      )
    );

    console.log(`   🔧 Identified ${this.automationCandidates.length} automation candidates`);
    console.log(`   👤 Identified ${this.manualReviewRequired.length} manual review candidates`);
  }

  /**
   * Find quick wins - high impact, low effort
   */
  findQuickWins(data) {
    // Define quick win criteria
    const quickWinCriteria = {
      highImpactLowEffort: (warning) => warning.impactScore >= 7 && warning.estimatedEffort <= 1,
      highAutomation: (warning) => warning.automationPotential >= 0.8,
      volumeOpportunity: (warning) => {
        try {
          return this.getWarningRuleCount(warning.rule, data.original) >= 100;
        } catch (error) {
          console.warn(`Warning: Could not get rule count for ${warning.rule}`);
          return false;
        }
      }
    };

    for (const warning of this.highImpactWarnings) {
      const isQuickWin = Object.values(quickWinCriteria).some(criteria => criteria(warning));

      if (isQuickWin) {
        this.quickWins.push({
          ...warning,
          quickWinReasons: Object.entries(quickWinCriteria)
            .filter(([, criteria]) => criteria(warning))
            .map(([reason]) => reason)
        });
      }
    }

    // Sort quick wins by impact score
    this.quickWins.sort((a, b) => b.impactScore - a.impactScore);

    console.log(`   ⚡ Identified ${this.quickWins.length} quick wins`);
  }

  /**
   * Generate comprehensive prioritization report
   */
  generatePrioritizationReport(data) {
    const totalHighImpact = this.highImpactWarnings.length;
    const totalAutomatable = this.automationCandidates.length;
    const totalQuickWins = this.quickWins.length;

    return {
      metadata: {
        generatedAt: new Date().toISOString(),
        totalWarnings: data.categorization.metadata.totalWarnings,
        highImpactWarnings: totalHighImpact,
        automationCandidates: totalAutomatable,
        quickWins: totalQuickWins,
        analysisType: 'high-impact-prioritization'
      },
      priorityQueue: this.priorityQueue,
      automationCandidates: this.groupAutomationCandidates(),
      manualReviewRequired: this.groupManualReviewCandidates(),
      quickWins: this.quickWins,
      summary: {
        byPriority: Object.fromEntries(
          Object.entries(this.priorityQueue).map(([priority, data]) => [priority, data.warnings.length])
        ),
        byAutomationType: this.getAutomationTypeSummary(),
        estimatedEffort: this.calculateEstimatedEffort(),
        potentialImpact: this.calculatePotentialImpact()
      },
      actionPlan: this.generateActionPlan(),
      recommendations: this.generatePrioritizationRecommendations()
    };
  }

  /**
   * Group automation candidates by type
   */
  groupAutomationCandidates() {
    const grouped = {};

    for (const candidate of this.automationCandidates) {
      const type = candidate.automationType;
      if (!grouped[type]) {
        grouped[type] = {
          config: candidate.automationConfig,
          warnings: []
        };
      }
      grouped[type].warnings.push(candidate);
    }

    return grouped;
  }

  /**
   * Group manual review candidates by complexity
   */
  groupManualReviewCandidates() {
    const grouped = {
      'high-complexity': {
        description: 'Requires domain expertise and careful analysis',
        warnings: []
      },
      'medium-complexity': {
        description: 'Requires code review and testing',
        warnings: []
      },
      'low-complexity': {
        description: 'Straightforward fixes with clear solutions',
        warnings: []
      }
    };

    for (const warning of this.manualReviewRequired) {
      let complexity = 'medium-complexity';

      if (warning.rule === '@typescript-eslint/no-explicit-any') {
        complexity = 'high-complexity';
      } else if (warning.rule === 'react-hooks/exhaustive-deps') {
        complexity = 'high-complexity';
      } else if (['@typescript-eslint/no-unused-vars', 'no-unused-vars'].includes(warning.rule)) {
        complexity = 'low-complexity';
      }

      grouped[complexity].warnings.push(warning);
    }

    return grouped;
  }

  /**
   * Get automation type summary
   */
  getAutomationTypeSummary() {
    const summary = {};

    for (const candidate of this.automationCandidates) {
      const type = candidate.automationType;
      if (!summary[type]) {
        summary[type] = 0;
      }
      summary[type]++;
    }

    return summary;
  }

  /**
   * Calculate estimated effort for high-impact warnings
   */
  calculateEstimatedEffort() {
    const effort = {
      immediate: 0,
      urgent: 0,
      high: 0,
      planned: 0,
      automation: 0,
      manual: 0
    };

    // Calculate by priority
    for (const [priority, data] of Object.entries(this.priorityQueue)) {
      effort[priority] = data.warnings.reduce((sum, warning) => sum + warning.estimatedEffort, 0);
    }

    // Calculate by resolution type
    effort.automation = this.automationCandidates.reduce((sum, warning) => sum + warning.estimatedEffort, 0);
    effort.manual = this.manualReviewRequired.reduce((sum, warning) => sum + warning.estimatedEffort, 0);

    return effort;
  }

  /**
   * Calculate potential impact of fixing high-impact warnings
   */
  calculatePotentialImpact() {
    const impact = {
      codeQualityImprovement: 0,
      developmentVelocityIncrease: 0,
      maintenanceReduction: 0,
      riskMitigation: 0
    };

    for (const warning of this.highImpactWarnings) {
      // Calculate impact based on warning type and volume
      if (warning.rule === 'no-console') {
        impact.codeQualityImprovement += 2;
        impact.developmentVelocityIncrease += 1;
      } else if (warning.rule === '@typescript-eslint/no-explicit-any') {
        impact.riskMitigation += 3;
        impact.maintenanceReduction += 2;
      } else if (['@typescript-eslint/no-unused-vars', 'no-unused-vars'].includes(warning.rule)) {
        impact.codeQualityImprovement += 3;
        impact.maintenanceReduction += 2;
      } else if (warning.rule === 'react-hooks/exhaustive-deps') {
        impact.riskMitigation += 4;
        impact.developmentVelocityIncrease += 2;
      }
    }

    return impact;
  }

  /**
   * Generate action plan for immediate implementation
   */
  generateActionPlan() {
    const plan = {
      phase1: {
        title: 'Immediate Actions (24-48 hours)',
        description: 'Quick wins and automated fixes',
        actions: [],
        estimatedTime: '4-8 hours',
        expectedImpact: 'High'
      },
      phase2: {
        title: 'Urgent Actions (1 week)',
        description: 'High-impact warnings requiring minimal manual effort',
        actions: [],
        estimatedTime: '8-16 hours',
        expectedImpact: 'High'
      },
      phase3: {
        title: 'High Priority Actions (2 weeks)',
        description: 'Complex warnings requiring domain knowledge',
        actions: [],
        estimatedTime: '16-32 hours',
        expectedImpact: 'Medium-High'
      }
    };

    // Phase 1: Immediate actions
    if (this.quickWins.length > 0) {
      plan.phase1.actions.push({
        action: 'Execute automated console statement cleanup',
        target: `${this.automationCandidates.filter(w => w.rule === 'no-console').length} console warnings`,
        method: 'Run console-statement-cleaner.cjs script',
        time: '1-2 hours'
      });
    }

    if (this.priorityQueue.immediate.warnings.length > 0) {
      plan.phase1.actions.push({
        action: 'Fix critical severity warnings',
        target: `${this.priorityQueue.immediate.warnings.length} critical warnings`,
        method: 'Manual review and immediate fixes',
        time: '2-4 hours'
      });
    }

    // Phase 2: Urgent actions
    if (this.priorityQueue.urgent.warnings.length > 0) {
      plan.phase2.actions.push({
        action: 'Address urgent high-impact warnings',
        target: `${this.priorityQueue.urgent.warnings.length} urgent warnings`,
        method: 'Combination of automation and manual fixes',
        time: '4-8 hours'
      });
    }

    // Phase 3: High priority actions
    if (this.manualReviewRequired.length > 0) {
      plan.phase3.actions.push({
        action: 'Systematic review of type safety warnings',
        target: `${this.manualReviewRequired.filter(w => w.rule === '@typescript-eslint/no-explicit-any').length} explicit any warnings`,
        method: 'Domain expert review with gradual type improvements',
        time: '8-16 hours'
      });
    }

    return plan;
  }

  /**
   * Generate prioritization recommendations
   */
  generatePrioritizationRecommendations() {
    const recommendations = [];

    // Quick wins recommendation
    if (this.quickWins.length > 0) {
      recommendations.push({
        type: 'quick-wins',
        title: 'Execute Quick Wins First',
        priority: 1,
        description: `${this.quickWins.length} warnings can be fixed with minimal effort for maximum impact`,
        actions: [
          'Run automated console statement cleanup',
          'Apply ESLint --fix for variable declarations',
          'Execute unused import cleanup'
        ],
        estimatedTime: '2-4 hours',
        expectedImpact: 'Immediate visible improvement'
      });
    }

    // Automation recommendation
    if (this.automationCandidates.length > 0) {
      recommendations.push({
        type: 'automation',
        title: 'Prioritize Automation Opportunities',
        priority: 2,
        description: `${this.automationCandidates.length} warnings can be resolved through automation`,
        actions: [
          'Create and run automation scripts',
          'Set up pre-commit hooks to prevent regression',
          'Document automation procedures'
        ],
        estimatedTime: '4-8 hours',
        expectedImpact: 'Sustainable long-term improvement'
      });
    }

    // Manual review recommendation
    if (this.manualReviewRequired.length > 0) {
      recommendations.push({
        type: 'manual-review',
        title: 'Plan Manual Review Sessions',
        priority: 3,
        description: `${this.manualReviewRequired.length} warnings require careful manual analysis`,
        actions: [
          'Schedule dedicated review sessions',
          'Involve domain experts for type safety issues',
          'Create review guidelines and checklists'
        ],
        estimatedTime: '16-32 hours',
        expectedImpact: 'Deep code quality improvement'
      });
    }

    return recommendations;
  }

  /**
   * Helper methods
   */
  getWarningSeverity(warning, categorization) {
    for (const [severity, data] of Object.entries(categorization.severityMatrix)) {
      if (data.warnings.some(w =>
        w.file === warning.file &&
        w.line === warning.line &&
        w.rule === warning.rule
      )) {
        return severity;
      }
    }
    return 'medium';
  }

  getAutomationPotential(warning) {
    const automationScores = {
      'no-console': 0.9,
      'prefer-const': 0.95,
      'no-var': 0.95,
      'import/order': 0.9,
      '@typescript-eslint/no-unused-vars': 0.6,
      'no-unused-vars': 0.6,
      '@typescript-eslint/no-explicit-any': 0.2,
      'react-hooks/exhaustive-deps': 0.1
    };

    return automationScores[warning.rule] || 0.3;
  }

  getEstimatedEffort(warning) {
    const effortEstimates = {
      'no-console': 0.25,
      'prefer-const': 0.1,
      'no-var': 0.1,
      'import/order': 0.1,
      '@typescript-eslint/no-unused-vars': 3,
      'no-unused-vars': 3,
      '@typescript-eslint/no-explicit-any': 15,
      'react-hooks/exhaustive-deps': 10
    };

    return effortEstimates[warning.rule] || 5;
  }

  getBusinessImpact(warning) {
    const impactMap = {
      'no-console': 'Low - Cosmetic improvement',
      '@typescript-eslint/no-explicit-any': 'High - Runtime safety risk',
      '@typescript-eslint/no-unused-vars': 'Medium - Code maintainability',
      'react-hooks/exhaustive-deps': 'High - Performance and correctness'
    };

    return impactMap[warning.rule] || 'Medium - Code quality';
  }

  getFileWarningCount(file, originalData) {
    if (!originalData || !originalData.fileBreakdown) {
      return 0;
    }
    return originalData.fileBreakdown[file] || 0;
  }

  getWarningRuleCount(rule, originalData) {
    if (!originalData || !originalData.ruleBreakdown) {
      return 0;
    }
    return originalData.ruleBreakdown[rule] || 0;
  }

  /**
   * Save prioritization reports
   */
  savePrioritizationReports(report) {
    // Save detailed JSON report
    const jsonPath = 'high-impact-warning-prioritization-report.json';
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

    // Save markdown action plan
    const markdownPath = 'high-impact-warning-prioritization-summary.md';
    const markdown = this.generatePrioritizationMarkdown(report);
    fs.writeFileSync(markdownPath, markdown);

    console.log(`   📊 Prioritization JSON Report: ${jsonPath}`);
    console.log(`   📝 Action Plan Summary: ${markdownPath}`);
  }

  /**
   * Generate prioritization markdown
   */
  generatePrioritizationMarkdown(report) {
    const { metadata, priorityQueue, summary, actionPlan, recommendations } = report;

    return `# High-Impact Warning Prioritization

## Executive Summary

**Generated:** ${new Date(metadata.generatedAt).toLocaleString()}
**Total Warnings:** ${metadata.totalWarnings}
**High-Impact Warnings:** ${metadata.highImpactWarnings}
**Automation Candidates:** ${metadata.automationCandidates}
**Quick Wins:** ${metadata.quickWins}

## Priority Queue for Immediate Action

${Object.entries(priorityQueue)
  .filter(([, data]) => data.warnings.length > 0)
  .map(([priority, data]) => `### ${priority.toUpperCase()} Priority (${data.warnings.length} warnings)
**Description:** ${data.description}
**Max Effort per Warning:** ${data.maxEffort} hour(s)
**Total Estimated Effort:** ${Math.ceil(data.warnings.reduce((sum, w) => sum + w.estimatedEffort, 0))} hours`)
  .join('\n\n')}

## Quick Wins Analysis

${this.quickWins.length > 0 ? `
**Total Quick Wins:** ${this.quickWins.length}

### Top Quick Win Opportunities
${this.quickWins.slice(0, 5).map((win, index) => `${index + 1}. **${win.rule}** in \`${win.file}\`
   - Impact Score: ${win.impactScore}
   - Estimated Effort: ${win.estimatedEffort} hours
   - Automation Potential: ${Math.round(win.automationPotential * 100)}%`).join('\n')}
` : 'No quick wins identified with current criteria.'}

## Automation Opportunities

${Object.entries(this.groupAutomationCandidates())
  .map(([type, data]) => `### ${type.replace('-', ' ').toUpperCase()} (${data.warnings.length} warnings)
**Description:** ${data.config.description}
**Automation Level:** ${Math.round(data.config.automationLevel * 100)}%
**Script Needed:** ${data.config.scriptNeeded}
**Estimated Time:** ${data.config.estimatedTime}
**Risk Level:** ${data.config.riskLevel}`)
  .join('\n\n')}

## Action Plan

${Object.entries(actionPlan)
  .map(([phase, data]) => `### ${data.title}
**Description:** ${data.description}
**Estimated Time:** ${data.estimatedTime}
**Expected Impact:** ${data.expectedImpact}

**Actions:**
${data.actions.map(action => `- **${action.action}**
  - Target: ${action.target}
  - Method: ${action.method}
  - Time: ${action.time}`).join('\n')}`)
  .join('\n\n')}

## Detailed Recommendations

${recommendations
  .map((rec, index) => `### ${index + 1}. ${rec.title}
**Priority:** ${rec.priority}
**Description:** ${rec.description}
**Estimated Time:** ${rec.estimatedTime}
**Expected Impact:** ${rec.expectedImpact}

**Actions:**
${rec.actions.map(action => `- ${action}`).join('\n')}`)
  .join('\n\n')}

## Implementation Checklist

### Immediate Actions (Next 24-48 hours)
- [ ] Run console statement cleanup automation
- [ ] Apply ESLint --fix for variable declarations
- [ ] Execute unused import cleanup
- [ ] Address any critical severity warnings

### Short Term (Next week)
- [ ] Create automation scripts for high-volume warnings
- [ ] Set up pre-commit hooks to prevent regression
- [ ] Plan manual review sessions for complex warnings
- [ ] Document automation procedures

### Medium Term (Next 2 weeks)
- [ ] Systematic review of type safety warnings
- [ ] React hooks dependency optimization
- [ ] Code quality improvements in high-impact files
- [ ] Establish ongoing maintenance procedures

## Success Metrics

- **Immediate Impact:** Reduce warning count by ${this.automationCandidates.length} through automation
- **Quality Improvement:** Address ${metadata.highImpactWarnings} high-impact warnings
- **Efficiency Gain:** Achieve ${this.quickWins.length} quick wins with minimal effort
- **Long-term Benefit:** Establish sustainable warning prevention practices

---

*Generated by high-impact-warning-prioritizer.cjs*
*Next: Execute Phase 1 actions for immediate impact*
`;
  }

  /**
   * Display prioritization summary
   */
  displayPrioritizationSummary(report) {
    const { metadata, summary } = report;

    console.log('\n🎯 High-Impact Warning Prioritization Complete!');
    console.log('==============================================\n');

    console.log('📊 **Prioritization Summary:**');
    console.log(`   Total Warnings: ${metadata.totalWarnings}`);
    console.log(`   High-Impact: ${metadata.highImpactWarnings}`);
    console.log(`   Automation Candidates: ${metadata.automationCandidates}`);
    console.log(`   Quick Wins: ${metadata.quickWins}\n`);

    console.log('⚡ **Priority Distribution:**');
    Object.entries(summary.byPriority)
      .filter(([, count]) => count > 0)
      .forEach(([priority, count]) => {
        console.log(`   ${priority.toUpperCase().padEnd(9)}: ${count.toString().padStart(4)} warnings`);
      });

    console.log('\n🔧 **Automation Opportunities:**');
    Object.entries(summary.byAutomationType)
      .forEach(([type, count]) => {
        console.log(`   ${type.replace('-', ' ').padEnd(20)}: ${count.toString().padStart(3)} warnings`);
      });

    console.log('\n📈 **Estimated Effort:**');
    console.log(`   Immediate Priority: ${Math.ceil(summary.estimatedEffort.immediate)} hours`);
    console.log(`   Urgent Priority: ${Math.ceil(summary.estimatedEffort.urgent)} hours`);
    console.log(`   Automation Total: ${Math.ceil(summary.estimatedEffort.automation)} hours`);
    console.log(`   Manual Review: ${Math.ceil(summary.estimatedEffort.manual)} hours`);

    console.log('\n🚀 **Next Steps:**');
    console.log('   1. Execute quick wins for immediate impact');
    console.log('   2. Run automation scripts for high-volume warnings');
    console.log('   3. Plan manual review sessions for complex cases');
    console.log('   4. Set up prevention measures (pre-commit hooks)');
    console.log('   5. Monitor progress and adjust priorities\n');
  }
}

// Main execution
async function main() {
  const prioritizer = new HighImpactWarningPrioritizer();

  try {
    await prioritizer.prioritize();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ High-impact prioritization failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { HighImpactWarningPrioritizer };
