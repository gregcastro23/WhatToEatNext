#!/usr/bin/env node

/**
 * Warning Severity Categorizer
 *
 * Creates detailed categorization of warnings by severity and type
 * for systematic resolution planning
 */

const fs = require('fs');
const path = require('path');

class WarningSeverityCategorizer {
  constructor() {
    this.severityMatrix = {};
    this.typeCategories = {};
    this.impactAnalysis = {};
    this.resolutionStrategies = {};
  }

  /**
   * Main categorization function
   */
  async categorize() {
    console.log('🏷️ Warning Severity & Type Categorization');
    console.log('==========================================\n');

    try {
      // Load the comprehensive report
      console.log('📊 Step 1: Loading comprehensive ESLint report...');
      const report = this.loadComprehensiveReport();

      // Create severity matrix
      console.log('⚡ Step 2: Creating severity matrix...');
      this.createSeverityMatrix(report);

      // Analyze warning types
      console.log('🔍 Step 3: Analyzing warning types...');
      this.analyzeWarningTypes(report);

      // Assess impact levels
      console.log('📈 Step 4: Assessing impact levels...');
      this.assessImpactLevels(report);

      // Define resolution strategies
      console.log('🛠️ Step 5: Defining resolution strategies...');
      this.defineResolutionStrategies(report);

      // Generate categorization report
      console.log('📄 Step 6: Generating categorization report...');
      const categorizationReport = this.generateCategorizationReport(report);

      // Save reports
      this.saveCategorizationReports(categorizationReport);

      // Display summary
      this.displayCategorizationSummary(categorizationReport);

      return categorizationReport;

    } catch (error) {
      console.error('❌ Categorization failed:', error.message);
      throw error;
    }
  }

  /**
   * Load the comprehensive ESLint report
   */
  loadComprehensiveReport() {
    const reportPath = 'eslint-warning-categorization-report.json';

    if (!fs.existsSync(reportPath)) {
      throw new Error(`Comprehensive report not found: ${reportPath}. Run eslint-warning-categorizer.cjs first.`);
    }

    const reportData = fs.readFileSync(reportPath, 'utf8');
    const report = JSON.parse(reportData);

    console.log(`   ✅ Loaded report with ${report.metadata.totalWarnings} warnings`);
    return report;
  }

  /**
   * Create detailed severity matrix
   */
  createSeverityMatrix(report) {
    // Define severity levels with detailed criteria
    this.severityMatrix = {
      'critical': {
        description: 'Immediate action required - blocks development or deployment',
        criteria: [
          'Prevents build from completing',
          'Causes runtime errors',
          'Security vulnerabilities',
          'Performance blockers'
        ],
        rules: [],
        warnings: [],
        count: 0,
        maxEffortHours: 1,
        automationPossible: true
      },
      'high': {
        description: 'High impact on code quality and maintainability',
        criteria: [
          'Type safety violations',
          'Unused code that clutters codebase',
          'React performance issues',
          'Import/export problems'
        ],
        rules: [
          '@typescript-eslint/no-explicit-any',
          '@typescript-eslint/no-unused-vars',
          'no-unused-vars',
          'react-hooks/exhaustive-deps'
        ],
        warnings: [],
        count: 0,
        maxEffortHours: 4,
        automationPossible: false
      },
      'medium': {
        description: 'Moderate impact on code quality',
        criteria: [
          'Code style inconsistencies',
          'Suboptimal patterns',
          'Minor performance issues',
          'Readability concerns'
        ],
        rules: [
          'prefer-const',
          'no-var',
          'eqeqeq',
          'import/order'
        ],
        warnings: [],
        count: 0,
        maxEffortHours: 2,
        automationPossible: true
      },
      'low': {
        description: 'Low impact - style and formatting preferences',
        criteria: [
          'Formatting preferences',
          'Style consistency',
          'Optional optimizations',
          'Documentation improvements'
        ],
        rules: [
          'prefer-template',
          'object-shorthand',
          '@typescript-eslint/prefer-optional-chain'
        ],
        warnings: [],
        count: 0,
        maxEffortHours: 0.5,
        automationPossible: true
      },
      'debug': {
        description: 'Development artifacts that should be cleaned up',
        criteria: [
          'Console statements',
          'Debug code',
          'Temporary code',
          'Development-only features'
        ],
        rules: [
          'no-console'
        ],
        warnings: [],
        count: 0,
        maxEffortHours: 0.25,
        automationPossible: true
      }
    };

    // Categorize warnings by severity
    for (const [category, categoryData] of Object.entries(report.categories)) {
      for (const warning of categoryData.warnings) {
        let assigned = false;

        // Check each severity level
        for (const [severity, severityData] of Object.entries(this.severityMatrix)) {
          if (severityData.rules.includes(warning.rule)) {
            severityData.warnings.push(warning);
            severityData.count++;
            assigned = true;
            break;
          }
        }

        // Special handling for console warnings
        if (warning.rule === 'no-console') {
          this.severityMatrix.debug.warnings.push(warning);
          this.severityMatrix.debug.count++;
          assigned = true;
        }

        // Special handling for explicit any
        if (warning.rule === '@typescript-eslint/no-explicit-any') {
          this.severityMatrix.high.warnings.push(warning);
          this.severityMatrix.high.count++;
          assigned = true;
        }

        // Default to medium if not assigned
        if (!assigned) {
          this.severityMatrix.medium.warnings.push(warning);
          this.severityMatrix.medium.count++;
        }
      }
    }

    console.log(`   ⚡ Created severity matrix with ${Object.keys(this.severityMatrix).length} levels`);
  }

  /**
   * Analyze warning types in detail
   */
  analyzeWarningTypes(report) {
    this.typeCategories = {
      'type-system': {
        description: 'TypeScript type system violations and improvements',
        subcategories: {
          'explicit-any': {
            rules: ['@typescript-eslint/no-explicit-any'],
            description: 'Explicit any type usage that should be replaced with proper types',
            resolutionComplexity: 'high',
            domainKnowledgeRequired: true
          },
          'unsafe-operations': {
            rules: [
              '@typescript-eslint/no-unsafe-assignment',
              '@typescript-eslint/no-unsafe-member-access',
              '@typescript-eslint/no-unsafe-call'
            ],
            description: 'Unsafe TypeScript operations that bypass type checking',
            resolutionComplexity: 'high',
            domainKnowledgeRequired: true
          }
        },
        totalWarnings: 0,
        estimatedResolutionTime: 0
      },
      'code-cleanliness': {
        description: 'Unused code and cleanliness issues',
        subcategories: {
          'unused-variables': {
            rules: ['@typescript-eslint/no-unused-vars', 'no-unused-vars'],
            description: 'Variables, parameters, and imports that are declared but not used',
            resolutionComplexity: 'medium',
            domainKnowledgeRequired: false
          },
          'unused-imports': {
            rules: ['@typescript-eslint/no-unused-imports'],
            description: 'Import statements that are not used in the file',
            resolutionComplexity: 'low',
            domainKnowledgeRequired: false
          }
        },
        totalWarnings: 0,
        estimatedResolutionTime: 0
      },
      'react-patterns': {
        description: 'React-specific patterns and best practices',
        subcategories: {
          'hooks-dependencies': {
            rules: ['react-hooks/exhaustive-deps'],
            description: 'Missing or incorrect dependencies in React hooks',
            resolutionComplexity: 'high',
            domainKnowledgeRequired: true
          },
          'hooks-rules': {
            rules: ['react-hooks/rules-of-hooks'],
            description: 'Violations of React hooks rules',
            resolutionComplexity: 'high',
            domainKnowledgeRequired: true
          }
        },
        totalWarnings: 0,
        estimatedResolutionTime: 0
      },
      'development-artifacts': {
        description: 'Development and debugging artifacts',
        subcategories: {
          'console-statements': {
            rules: ['no-console'],
            description: 'Console statements left in production code',
            resolutionComplexity: 'low',
            domainKnowledgeRequired: false
          },
          'debug-code': {
            rules: ['no-debugger'],
            description: 'Debugger statements left in code',
            resolutionComplexity: 'low',
            domainKnowledgeRequired: false
          }
        },
        totalWarnings: 0,
        estimatedResolutionTime: 0
      },
      'code-style': {
        description: 'Code style and formatting preferences',
        subcategories: {
          'variable-declarations': {
            rules: ['prefer-const', 'no-var'],
            description: 'Variable declaration style preferences',
            resolutionComplexity: 'low',
            domainKnowledgeRequired: false
          },
          'comparison-operators': {
            rules: ['eqeqeq'],
            description: 'Strict equality comparison preferences',
            resolutionComplexity: 'low',
            domainKnowledgeRequired: false
          }
        },
        totalWarnings: 0,
        estimatedResolutionTime: 0
      }
    };

    // Analyze warnings by type
    for (const [category, categoryData] of Object.entries(report.categories)) {
      for (const warning of categoryData.warnings) {
        // Find matching type category
        for (const [typeCategory, typeData] of Object.entries(this.typeCategories)) {
          for (const [subcategory, subData] of Object.entries(typeData.subcategories)) {
            if (subData.rules.includes(warning.rule)) {
              typeData.totalWarnings++;

              // Estimate resolution time based on complexity
              const timeEstimates = {
                'low': 1,      // 1 minute per warning
                'medium': 5,   // 5 minutes per warning
                'high': 15     // 15 minutes per warning
              };

              typeData.estimatedResolutionTime += timeEstimates[subData.resolutionComplexity] || 5;
              break;
            }
          }
        }
      }
    }

    console.log(`   🔍 Analyzed ${Object.keys(this.typeCategories).length} warning type categories`);
  }

  /**
   * Assess impact levels for different warning types
   */
  assessImpactLevels(report) {
    this.impactAnalysis = {
      'build-blocking': {
        description: 'Warnings that prevent successful builds',
        impact: 'critical',
        rules: [],
        count: 0,
        businessImpact: 'Prevents deployment and development progress'
      },
      'runtime-risk': {
        description: 'Warnings that could cause runtime errors',
        impact: 'high',
        rules: [
          '@typescript-eslint/no-explicit-any',
          '@typescript-eslint/no-unsafe-assignment'
        ],
        count: 0,
        businessImpact: 'Potential production bugs and user experience issues'
      },
      'maintainability': {
        description: 'Warnings that affect code maintainability',
        impact: 'high',
        rules: [
          '@typescript-eslint/no-unused-vars',
          'no-unused-vars'
        ],
        count: 0,
        businessImpact: 'Increased development time and technical debt'
      },
      'performance': {
        description: 'Warnings that could affect performance',
        impact: 'medium',
        rules: [
          'react-hooks/exhaustive-deps'
        ],
        count: 0,
        businessImpact: 'Potential performance degradation and poor user experience'
      },
      'code-quality': {
        description: 'Warnings that affect code quality and consistency',
        impact: 'medium',
        rules: [
          'prefer-const',
          'no-var',
          'eqeqeq'
        ],
        count: 0,
        businessImpact: 'Reduced code quality and team productivity'
      },
      'development-experience': {
        description: 'Warnings that affect development experience',
        impact: 'low',
        rules: [
          'no-console'
        ],
        count: 0,
        businessImpact: 'Cluttered logs and unprofessional appearance'
      }
    };

    // Count warnings by impact level
    for (const [category, categoryData] of Object.entries(report.categories)) {
      for (const warning of categoryData.warnings) {
        for (const [impactLevel, impactData] of Object.entries(this.impactAnalysis)) {
          if (impactData.rules.includes(warning.rule)) {
            impactData.count++;
            break;
          }
        }
      }
    }

    console.log(`   📈 Assessed impact levels for ${Object.keys(this.impactAnalysis).length} categories`);
  }

  /**
   * Define resolution strategies for each warning type
   */
  defineResolutionStrategies(report) {
    this.resolutionStrategies = {
      'automated-fixes': {
        description: 'Warnings that can be resolved automatically',
        strategy: 'Use ESLint --fix or custom automation scripts',
        rules: [
          'prefer-const',
          'no-var',
          'import/order'
        ],
        warnings: [],
        estimatedTime: '1-2 hours',
        riskLevel: 'low',
        prerequisites: ['Comprehensive test coverage', 'Git backup']
      },
      'semi-automated': {
        description: 'Warnings that can be partially automated with manual review',
        strategy: 'Automated detection and replacement with manual validation',
        rules: [
          'no-console',
          '@typescript-eslint/no-unused-vars'
        ],
        warnings: [],
        estimatedTime: '4-8 hours',
        riskLevel: 'medium',
        prerequisites: ['Domain knowledge review', 'Testing after changes']
      },
      'manual-review': {
        description: 'Warnings requiring careful manual analysis',
        strategy: 'Individual review and custom solutions',
        rules: [
          '@typescript-eslint/no-explicit-any',
          'react-hooks/exhaustive-deps'
        ],
        warnings: [],
        estimatedTime: '20-40 hours',
        riskLevel: 'high',
        prerequisites: ['Deep domain knowledge', 'Extensive testing', 'Code review']
      },
      'domain-specific': {
        description: 'Warnings requiring domain-specific knowledge',
        strategy: 'Expert review with preservation of intentional patterns',
        rules: [
          '@typescript-eslint/no-explicit-any' // In astrological calculations
        ],
        warnings: [],
        estimatedTime: '10-20 hours',
        riskLevel: 'high',
        prerequisites: ['Astrological domain expertise', 'Calculation accuracy validation']
      }
    };

    // Categorize warnings by resolution strategy
    for (const [category, categoryData] of Object.entries(report.categories)) {
      for (const warning of categoryData.warnings) {
        for (const [strategy, strategyData] of Object.entries(this.resolutionStrategies)) {
          if (strategyData.rules.includes(warning.rule)) {
            strategyData.warnings.push(warning);
            break;
          }
        }
      }
    }

    console.log(`   🛠️ Defined ${Object.keys(this.resolutionStrategies).length} resolution strategies`);
  }

  /**
   * Generate comprehensive categorization report
   */
  generateCategorizationReport(originalReport) {
    return {
      metadata: {
        generatedAt: new Date().toISOString(),
        basedOnReport: 'eslint-warning-categorization-report.json',
        totalWarnings: originalReport.metadata.totalWarnings,
        analysisDepth: 'detailed-severity-and-type'
      },
      severityMatrix: this.severityMatrix,
      typeCategories: this.typeCategories,
      impactAnalysis: this.impactAnalysis,
      resolutionStrategies: this.resolutionStrategies,
      summary: {
        bySeverity: Object.fromEntries(
          Object.entries(this.severityMatrix).map(([severity, data]) => [severity, data.count])
        ),
        byImpact: Object.fromEntries(
          Object.entries(this.impactAnalysis).map(([impact, data]) => [impact, data.count])
        ),
        byResolutionStrategy: Object.fromEntries(
          Object.entries(this.resolutionStrategies).map(([strategy, data]) => [strategy, data.warnings.length])
        ),
        totalEstimatedHours: this.calculateTotalEstimatedHours()
      },
      recommendations: this.generateDetailedRecommendations()
    };
  }

  /**
   * Calculate total estimated hours for resolution
   */
  calculateTotalEstimatedHours() {
    let totalHours = 0;

    for (const [severity, data] of Object.entries(this.severityMatrix)) {
      totalHours += data.count * data.maxEffortHours;
    }

    return Math.ceil(totalHours);
  }

  /**
   * Generate detailed recommendations
   */
  generateDetailedRecommendations() {
    const recommendations = [];

    // Severity-based recommendations
    const severityOrder = ['critical', 'debug', 'high', 'medium', 'low'];
    for (const severity of severityOrder) {
      const data = this.severityMatrix[severity];
      if (data.count > 0) {
        recommendations.push({
          type: 'severity',
          severity,
          title: `${severity.toUpperCase()} Severity Warnings`,
          count: data.count,
          description: data.description,
          estimatedHours: Math.ceil(data.count * data.maxEffortHours),
          automationPossible: data.automationPossible,
          priority: severityOrder.indexOf(severity) + 1,
          nextActions: this.getNextActionsForSeverity(severity, data)
        });
      }
    }

    // Strategy-based recommendations
    for (const [strategy, data] of Object.entries(this.resolutionStrategies)) {
      if (data.warnings.length > 0) {
        recommendations.push({
          type: 'strategy',
          strategy,
          title: `${strategy.replace('-', ' ').toUpperCase()} Resolution`,
          count: data.warnings.length,
          description: data.description,
          approach: data.strategy,
          estimatedTime: data.estimatedTime,
          riskLevel: data.riskLevel,
          prerequisites: data.prerequisites
        });
      }
    }

    return recommendations;
  }

  /**
   * Get next actions for severity level
   */
  getNextActionsForSeverity(severity, data) {
    const actions = {
      'critical': [
        'Immediate action required',
        'Block all other development until resolved',
        'Use automated fixes where possible',
        'Manual review for complex cases'
      ],
      'debug': [
        'Create automated console statement cleaner',
        'Preserve intentional debug statements in test files',
        'Run cleanup script on entire codebase',
        'Add pre-commit hooks to prevent future occurrences'
      ],
      'high': [
        'Plan dedicated sprint for resolution',
        'Start with unused variables (easier wins)',
        'Address explicit any types with domain expertise',
        'Implement gradual type improvements'
      ],
      'medium': [
        'Include in regular development cycles',
        'Use ESLint --fix for automated resolution',
        'Address during code reviews',
        'Set up automated formatting'
      ],
      'low': [
        'Address during maintenance windows',
        'Use automated tools',
        'Include in code style improvements',
        'Low priority for manual effort'
      ]
    };

    return actions[severity] || ['Review and address systematically'];
  }

  /**
   * Save categorization reports
   */
  saveCategorizationReports(report) {
    // Save detailed JSON report
    const jsonPath = 'warning-severity-categorization-report.json';
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

    // Save markdown summary
    const markdownPath = 'warning-severity-categorization-summary.md';
    const markdown = this.generateDetailedMarkdownSummary(report);
    fs.writeFileSync(markdownPath, markdown);

    console.log(`   📊 Detailed JSON Report: ${jsonPath}`);
    console.log(`   📝 Detailed Markdown Summary: ${markdownPath}`);
  }

  /**
   * Generate detailed markdown summary
   */
  generateDetailedMarkdownSummary(report) {
    const { metadata, severityMatrix, impactAnalysis, resolutionStrategies, summary, recommendations } = report;

    return `# Warning Severity & Type Categorization

## Overview

**Generated:** ${new Date(metadata.generatedAt).toLocaleString()}
**Total Warnings:** ${metadata.totalWarnings}
**Analysis Depth:** Detailed severity and type categorization
**Estimated Resolution Time:** ${summary.totalEstimatedHours} hours

## Severity Matrix

${Object.entries(severityMatrix)
  .filter(([, data]) => data.count > 0)
  .map(([severity, data]) => `### ${severity.toUpperCase()} Severity (${data.count} warnings)
**Description:** ${data.description}
**Max Effort per Warning:** ${data.maxEffortHours} hour(s)
**Automation Possible:** ${data.automationPossible ? '✅ Yes' : '❌ No'}
**Total Estimated Effort:** ${Math.ceil(data.count * data.maxEffortHours)} hours

**Criteria:**
${data.criteria.map(criterion => `- ${criterion}`).join('\n')}`)
  .join('\n\n')}

## Impact Analysis

${Object.entries(impactAnalysis)
  .filter(([, data]) => data.count > 0)
  .map(([impact, data]) => `### ${impact.replace('-', ' ').toUpperCase()} Impact (${data.count} warnings)
**Description:** ${data.description}
**Impact Level:** ${data.impact}
**Business Impact:** ${data.businessImpact}`)
  .join('\n\n')}

## Resolution Strategies

${Object.entries(resolutionStrategies)
  .filter(([, data]) => data.warnings.length > 0)
  .map(([strategy, data]) => `### ${strategy.replace('-', ' ').toUpperCase()} (${data.warnings.length} warnings)
**Description:** ${data.description}
**Strategy:** ${data.strategy}
**Estimated Time:** ${data.estimatedTime}
**Risk Level:** ${data.riskLevel}

**Prerequisites:**
${data.prerequisites.map(prereq => `- ${prereq}`).join('\n')}`)
  .join('\n\n')}

## Detailed Recommendations

${recommendations
  .map((rec, index) => {
    if (rec.type === 'severity') {
      return `### ${index + 1}. ${rec.title}
**Count:** ${rec.count} warnings
**Priority:** ${rec.priority}
**Estimated Hours:** ${rec.estimatedHours}
**Automation:** ${rec.automationPossible ? 'Possible' : 'Manual review required'}

**Next Actions:**
${rec.nextActions.map(action => `- ${action}`).join('\n')}`;
    } else {
      return `### ${index + 1}. ${rec.title}
**Count:** ${rec.count} warnings
**Approach:** ${rec.approach}
**Time:** ${rec.estimatedTime}
**Risk:** ${rec.riskLevel}

**Prerequisites:**
${rec.prerequisites.map(prereq => `- ${prereq}`).join('\n')}`;
    }
  })
  .join('\n\n')}

## Implementation Priority

### Phase 1: Critical & Debug (Immediate - 1-2 days)
- **CRITICAL**: ${severityMatrix.critical?.count || 0} warnings - ${Math.ceil((severityMatrix.critical?.count || 0) * (severityMatrix.critical?.maxEffortHours || 0))} hours
- **DEBUG**: ${severityMatrix.debug?.count || 0} warnings - ${Math.ceil((severityMatrix.debug?.count || 0) * (severityMatrix.debug?.maxEffortHours || 0))} hours
- Focus on automated fixes and console statement cleanup

### Phase 2: High Impact (1-2 weeks)
- **HIGH**: ${severityMatrix.high?.count || 0} warnings - ${Math.ceil((severityMatrix.high?.count || 0) * (severityMatrix.high?.maxEffortHours || 0))} hours
- Type safety improvements and unused code cleanup
- Requires domain knowledge and careful review

### Phase 3: Medium Impact (2-4 weeks)
- **MEDIUM**: ${severityMatrix.medium?.count || 0} warnings - ${Math.ceil((severityMatrix.medium?.count || 0) * (severityMatrix.medium?.maxEffortHours || 0))} hours
- Code style and consistency improvements
- Can be partially automated

### Phase 4: Low Impact (Ongoing maintenance)
- **LOW**: ${severityMatrix.low?.count || 0} warnings - ${Math.ceil((severityMatrix.low?.count || 0) * (severityMatrix.low?.maxEffortHours || 0))} hours
- Style preferences and optional optimizations
- Mostly automated fixes

## Automation Opportunities

1. **Console Statement Cleanup** (${severityMatrix.debug?.count || 0} warnings)
   - Fully automated with preservation rules
   - Estimated time: 1-2 hours

2. **Variable Declaration Fixes** (${resolutionStrategies['automated-fixes']?.warnings.length || 0} warnings)
   - ESLint --fix can handle most cases
   - Estimated time: 30 minutes

3. **Import Organization** (automated where applicable)
   - ESLint --fix with import/order rule
   - Estimated time: 15 minutes

## Risk Assessment

- **High Risk**: Manual type safety improvements (${severityMatrix.high?.count || 0} warnings)
- **Medium Risk**: React hooks dependency fixes (requires testing)
- **Low Risk**: Automated style fixes and console cleanup

---

*Generated by warning-severity-categorizer.cjs*
*Next: Create specific automation scripts for high-priority categories*
`;
  }

  /**
   * Display categorization summary
   */
  displayCategorizationSummary(report) {
    const { metadata, summary, severityMatrix } = report;

    console.log('\n🎯 Warning Severity & Type Categorization Complete!');
    console.log('===================================================\n');

    console.log('📊 **Categorization Summary:**');
    console.log(`   Total Warnings: ${metadata.totalWarnings}`);
    console.log(`   Estimated Resolution: ${summary.totalEstimatedHours} hours\n`);

    console.log('⚡ **By Severity Level:**');
    Object.entries(summary.bySeverity)
      .sort(([,a], [,b]) => b - a)
      .forEach(([severity, count]) => {
        const data = severityMatrix[severity];
        const hours = Math.ceil(count * data.maxEffortHours);
        const automation = data.automationPossible ? '🔧' : '👤';
        console.log(`   ${severity.toUpperCase().padEnd(8)}: ${count.toString().padStart(4)} warnings (~${hours}h) ${automation}`);
      });

    console.log('\n📈 **By Impact Level:**');
    Object.entries(summary.byImpact)
      .sort(([,a], [,b]) => b - a)
      .forEach(([impact, count]) => {
        if (count > 0) {
          console.log(`   ${impact.replace('-', ' ').padEnd(20)}: ${count.toString().padStart(4)} warnings`);
        }
      });

    console.log('\n🛠️ **By Resolution Strategy:**');
    Object.entries(summary.byResolutionStrategy)
      .sort(([,a], [,b]) => b - a)
      .forEach(([strategy, count]) => {
        if (count > 0) {
          console.log(`   ${strategy.replace('-', ' ').padEnd(20)}: ${count.toString().padStart(4)} warnings`);
        }
      });

    console.log('\n🚀 **Immediate Actions:**');
    console.log('   1. Address CRITICAL severity warnings first');
    console.log('   2. Run automated console statement cleanup');
    console.log('   3. Plan HIGH severity warning resolution sprint');
    console.log('   4. Set up automation for MEDIUM/LOW severity warnings');
    console.log('   5. Create domain-specific resolution guidelines\n');
  }
}

// Main execution
async function main() {
  const categorizer = new WarningSeverityCategorizer();

  try {
    await categorizer.categorize();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Severity categorization failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { WarningSeverityCategorizer };
