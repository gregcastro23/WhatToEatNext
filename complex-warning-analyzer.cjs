#!/usr/bin/env node

/**
 * Complex Warning Analyzer for Manual Review
 *
 * Analyzes ESLint warnings to identify those requiring manual intervention
 * vs those that can be safely automated.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Categories of warnings that require manual review
const MANUAL_REVIEW_CATEGORIES = {
  'COMPLEX_TYPE_ISSUES': {
    rules: ['@typescript-eslint/no-explicit-any'],
    description: 'Type-related warnings requiring domain knowledge',
    priority: 'HIGH',
    estimatedEffort: 'HIGH'
  },
  'SECURITY_CONCERNS': {
    rules: ['no-eval', 'no-implied-eval', 'no-new-func', 'no-script-url'],
    description: 'Security-related warnings requiring careful review',
    priority: 'CRITICAL',
    estimatedEffort: 'MEDIUM'
  },
  'REACT_HOOKS_LOGIC': {
    rules: ['react-hooks/exhaustive-deps', 'react-hooks/rules-of-hooks'],
    description: 'React hooks requiring understanding of component logic',
    priority: 'HIGH',
    estimatedEffort: 'HIGH'
  },
  'DOMAIN_SPECIFIC_VARIABLES': {
    rules: ['@typescript-eslint/no-unused-vars', 'no-unused-vars'],
    description: 'Unused variables that may be domain-specific (astrological, campaign)',
    priority: 'MEDIUM',
    estimatedEffort: 'MEDIUM'
  },
  'INTENTIONAL_CONSOLE': {
    rules: ['no-console'],
    description: 'Console statements that may be intentional (debugging, logging)',
    priority: 'LOW',
    estimatedEffort: 'LOW'
  },
  'SYNTAX_ERRORS': {
    rules: ['no-const-assign', 'no-undef', 'no-redeclare', 'no-dupe-keys'],
    description: 'Syntax errors that may indicate deeper issues',
    priority: 'HIGH',
    estimatedEffort: 'MEDIUM'
  },
  'PERFORMANCE_ISSUES': {
    rules: ['no-unreachable', 'no-useless-catch', 'no-fallthrough'],
    description: 'Performance-related warnings requiring logic review',
    priority: 'MEDIUM',
    estimatedEffort: 'MEDIUM'
  }
};

// Domain-specific patterns to preserve
const DOMAIN_PATTERNS = {
  astrological: [
    'planet', 'sign', 'degree', 'longitude', 'position', 'transit', 'retrograde',
    'elemental', 'fire', 'water', 'earth', 'air', 'zodiac', 'lunar', 'solar'
  ],
  campaign: [
    'campaign', 'metrics', 'progress', 'safety', 'validation', 'intelligence',
    'enterprise', 'transformation', 'analysis', 'monitoring'
  ],
  test: [
    'mock', 'stub', 'test', 'expect', 'describe', 'it', 'beforeEach', 'afterEach'
  ]
};

class ComplexWarningAnalyzer {
  constructor() {
    this.warnings = [];
    this.analysis = {
      total: 0,
      byCategory: {},
      byFile: {},
      complexWarnings: [],
      automatable: [],
      requiresManualReview: []
    };
  }

  async analyzeWarnings() {
    console.log('🔍 Analyzing complex warnings requiring manual intervention...\n');

    try {
      // Get ESLint output in JSON format
      const lintOutput = execSync('yarn lint:quick --format=json 2>/dev/null', {
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      });

      const results = JSON.parse(lintOutput);
      this.processLintResults(results);
      this.categorizeWarnings();
      this.generateReport();

    } catch (error) {
      console.error('Error analyzing warnings:', error.message);
      process.exit(1);
    }
  }

  processLintResults(results) {
    for (const result of results) {
      const filePath = result.filePath;
      const relativePath = path.relative(process.cwd(), filePath);

      for (const message of result.messages) {
        const warning = {
          file: relativePath,
          line: message.line,
          column: message.column,
          rule: message.ruleId,
          message: message.message,
          severity: message.severity === 2 ? 'error' : 'warning',
          source: message.source || ''
        };

        this.warnings.push(warning);
        this.analysis.total++;

        // Track by file
        if (!this.analysis.byFile[relativePath]) {
          this.analysis.byFile[relativePath] = [];
        }
        this.analysis.byFile[relativePath].push(warning);
      }
    }
  }

  categorizeWarnings() {
    for (const warning of this.warnings) {
      let category = 'UNCATEGORIZED';
      let requiresManualReview = false;

      // Check against manual review categories
      for (const [catName, catInfo] of Object.entries(MANUAL_REVIEW_CATEGORIES)) {
        if (catInfo.rules.includes(warning.rule)) {
          category = catName;
          requiresManualReview = this.requiresManualReview(warning, catName);
          break;
        }
      }

      // Track by category
      if (!this.analysis.byCategory[category]) {
        this.analysis.byCategory[category] = [];
      }
      this.analysis.byCategory[category].push(warning);

      // Classify for manual review vs automation
      if (requiresManualReview) {
        this.analysis.requiresManualReview.push({
          ...warning,
          category,
          reason: this.getManualReviewReason(warning, category)
        });
      } else {
        this.analysis.automatable.push({
          ...warning,
          category,
          automationStrategy: this.getAutomationStrategy(warning)
        });
      }
    }
  }

  requiresManualReview(warning, category) {
    const { file, rule, source, message } = warning;

    // Always require manual review for certain categories
    if (['SECURITY_CONCERNS', 'REACT_HOOKS_LOGIC'].includes(category)) {
      return true;
    }

    // Check for domain-specific patterns
    if (this.containsDomainPattern(source) || this.containsDomainPattern(message)) {
      return true;
    }

    // Check file patterns that require manual review
    if (this.isComplexFile(file)) {
      return true;
    }

    // Specific rule-based logic
    switch (rule) {
      case '@typescript-eslint/no-explicit-any':
        // Complex any types in calculations or services require review
        return file.includes('calculations/') ||
               file.includes('services/') ||
               source.includes('Record<') ||
               source.includes('Promise<') ||
               source.includes('Function');

      case 'no-console':
        // Console statements in debug files or with specific patterns
        return file.includes('debug/') ||
               file.includes('test/') ||
               source.includes('console.error') ||
               source.includes('console.warn') ||
               message.includes('intentional');

      case '@typescript-eslint/no-unused-vars':
      case 'no-unused-vars':
        // Variables with domain-specific names
        const varName = this.extractVariableName(source);
        return this.isDomainVariable(varName);

      default:
        return false;
    }
  }

  containsDomainPattern(text) {
    if (!text) return false;
    const lowerText = text.toLowerCase();

    for (const [domain, patterns] of Object.entries(DOMAIN_PATTERNS)) {
      for (const pattern of patterns) {
        if (lowerText.includes(pattern)) {
          return true;
        }
      }
    }
    return false;
  }

  isComplexFile(filePath) {
    const complexPatterns = [
      'calculations/',
      'services/campaign/',
      'services/.*Intelligence',
      'alchemicalEngine',
      'astrology',
      'planetary'
    ];

    return complexPatterns.some(pattern =>
      new RegExp(pattern, 'i').test(filePath)
    );
  }

  extractVariableName(source) {
    if (!source) return '';

    // Extract variable name from various patterns
    const patterns = [
      /'([^']+)' is defined but never used/,
      /'([^']+)' is assigned a value but never used/,
      /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/,
      /let\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/,
      /var\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/
    ];

    for (const pattern of patterns) {
      const match = source.match(pattern);
      if (match) return match[1];
    }

    return '';
  }

  isDomainVariable(varName) {
    if (!varName) return false;
    const lowerName = varName.toLowerCase();

    for (const [domain, patterns] of Object.entries(DOMAIN_PATTERNS)) {
      for (const pattern of patterns) {
        if (lowerName.includes(pattern)) {
          return true;
        }
      }
    }
    return false;
  }

  getManualReviewReason(warning, category) {
    const reasons = {
      'COMPLEX_TYPE_ISSUES': 'Requires domain knowledge for proper typing',
      'SECURITY_CONCERNS': 'Security implications need careful review',
      'REACT_HOOKS_LOGIC': 'Component logic understanding required',
      'DOMAIN_SPECIFIC_VARIABLES': 'May be intentionally preserved for domain logic',
      'INTENTIONAL_CONSOLE': 'May be intentional debugging or logging'
    };

    return reasons[category] || 'Complex logic requires human review';
  }

  getAutomationStrategy(warning) {
    const strategies = {
      'no-console': 'Remove or comment out development console statements',
      '@typescript-eslint/no-unused-vars': 'Prefix with underscore or remove',
      'no-unused-vars': 'Remove unused variable declarations',
      'no-const-assign': 'Fix const reassignment',
      'no-undef': 'Add proper imports or declarations',
      'no-redeclare': 'Rename or remove duplicate declarations'
    };

    return strategies[warning.rule] || 'Apply ESLint auto-fix';
  }

  generateReport() {
    const report = {
      summary: {
        totalWarnings: this.analysis.total,
        requiresManualReview: this.analysis.requiresManualReview.length,
        canBeAutomated: this.analysis.automatable.length,
        manualReviewPercentage: Math.round((this.analysis.requiresManualReview.length / this.analysis.total) * 100)
      },
      categories: {},
      topFiles: this.getTopFiles(),
      recommendations: this.generateRecommendations()
    };

    // Generate category breakdown
    for (const [category, warnings] of Object.entries(this.analysis.byCategory)) {
      const manualCount = warnings.filter(w =>
        this.analysis.requiresManualReview.some(mr =>
          mr.file === w.file && mr.line === w.line && mr.rule === w.rule
        )
      ).length;

      report.categories[category] = {
        total: warnings.length,
        requiresManualReview: manualCount,
        canBeAutomated: warnings.length - manualCount,
        priority: MANUAL_REVIEW_CATEGORIES[category]?.priority || 'MEDIUM',
        description: MANUAL_REVIEW_CATEGORIES[category]?.description || 'Uncategorized warnings'
      };
    }

    this.printReport(report);
    this.saveDetailedReport(report);
  }

  getTopFiles() {
    const fileWarningCounts = Object.entries(this.analysis.byFile)
      .map(([file, warnings]) => ({
        file,
        total: warnings.length,
        manual: warnings.filter(w =>
          this.analysis.requiresManualReview.some(mr =>
            mr.file === w.file && mr.line === w.line && mr.rule === w.rule
          )
        ).length
      }))
      .sort((a, b) => b.manual - a.manual)
      .slice(0, 10);

    return fileWarningCounts;
  }

  generateRecommendations() {
    const recommendations = [];

    // High-priority manual review items
    const highPriorityCategories = Object.entries(this.analysis.byCategory)
      .filter(([cat]) => MANUAL_REVIEW_CATEGORIES[cat]?.priority === 'HIGH')
      .sort(([,a], [,b]) => b.length - a.length);

    if (highPriorityCategories.length > 0) {
      recommendations.push({
        type: 'HIGH_PRIORITY',
        title: 'Focus on High-Priority Manual Reviews',
        description: `Start with ${highPriorityCategories[0][0]} (${highPriorityCategories[0][1].length} warnings)`,
        action: 'Begin manual review of type-related and React hooks warnings'
      });
    }

    // Automation opportunities
    const automatableCount = this.analysis.automatable.length;
    if (automatableCount > 100) {
      recommendations.push({
        type: 'AUTOMATION',
        title: 'Significant Automation Opportunity',
        description: `${automatableCount} warnings can be safely automated`,
        action: 'Run targeted automation scripts for simple fixes'
      });
    }

    // Domain-specific review
    const domainWarnings = this.analysis.requiresManualReview.filter(w =>
      w.reason.includes('domain')
    );
    if (domainWarnings.length > 50) {
      recommendations.push({
        type: 'DOMAIN_REVIEW',
        title: 'Domain-Specific Review Needed',
        description: `${domainWarnings.length} warnings require astrological/campaign domain knowledge`,
        action: 'Review with domain expert to preserve intentional patterns'
      });
    }

    return recommendations;
  }

  printReport(report) {
    console.log('📊 COMPLEX WARNING ANALYSIS REPORT');
    console.log('=' .repeat(50));
    console.log();

    console.log('📈 SUMMARY:');
    console.log(`   Total Warnings: ${report.summary.totalWarnings}`);
    console.log(`   Requires Manual Review: ${report.summary.requiresManualReview} (${report.summary.manualReviewPercentage}%)`);
    console.log(`   Can Be Automated: ${report.summary.canBeAutomated}`);
    console.log();

    console.log('🏷️  CATEGORIES:');
    for (const [category, info] of Object.entries(report.categories)) {
      console.log(`   ${category}:`);
      console.log(`     Total: ${info.total}`);
      console.log(`     Manual Review: ${info.requiresManualReview}`);
      console.log(`     Automatable: ${info.canBeAutomated}`);
      console.log(`     Priority: ${info.priority}`);
      console.log(`     Description: ${info.description}`);
      console.log();
    }

    console.log('📁 TOP FILES REQUIRING MANUAL REVIEW:');
    for (const file of report.topFiles.slice(0, 5)) {
      console.log(`   ${file.file}: ${file.manual} manual / ${file.total} total`);
    }
    console.log();

    console.log('💡 RECOMMENDATIONS:');
    for (const rec of report.recommendations) {
      console.log(`   ${rec.type}: ${rec.title}`);
      console.log(`     ${rec.description}`);
      console.log(`     Action: ${rec.action}`);
      console.log();
    }
  }

  saveDetailedReport(report) {
    const detailedReport = {
      ...report,
      detailedWarnings: {
        manualReview: this.analysis.requiresManualReview,
        automatable: this.analysis.automatable
      },
      generatedAt: new Date().toISOString()
    };

    fs.writeFileSync(
      'complex-warning-analysis-report.json',
      JSON.stringify(detailedReport, null, 2)
    );

    console.log('📄 Detailed report saved to: complex-warning-analysis-report.json');
    console.log();

    // Generate markdown summary
    this.generateMarkdownSummary(report);
  }

  generateMarkdownSummary(report) {
    const markdown = `# Complex Warning Analysis Report

Generated: ${new Date().toISOString()}

## Summary

- **Total Warnings**: ${report.summary.totalWarnings}
- **Requires Manual Review**: ${report.summary.requiresManualReview} (${report.summary.manualReviewPercentage}%)
- **Can Be Automated**: ${report.summary.canBeAutomated}

## Categories Requiring Manual Review

${Object.entries(report.categories)
  .filter(([, info]) => info.requiresManualReview > 0)
  .sort(([, a], [, b]) => b.requiresManualReview - a.requiresManualReview)
  .map(([category, info]) => `
### ${category} (Priority: ${info.priority})

- **Total**: ${info.total}
- **Manual Review**: ${info.requiresManualReview}
- **Description**: ${info.description}
`).join('')}

## Top Files Requiring Manual Review

${report.topFiles.slice(0, 10).map(file =>
  `- \`${file.file}\`: ${file.manual} manual reviews needed (${file.total} total warnings)`
).join('\n')}

## Recommendations

${report.recommendations.map(rec => `
### ${rec.title}

**Type**: ${rec.type}
**Description**: ${rec.description}
**Action**: ${rec.action}
`).join('')}

## Next Steps

1. **Start with High-Priority Categories**: Focus on security and React hooks warnings first
2. **Domain Expert Review**: Have astrological/campaign domain expert review domain-specific warnings
3. **Batch Automation**: Run automation scripts for the ${report.summary.canBeAutomated} automatable warnings
4. **Iterative Approach**: Process in small batches to maintain code stability

`;

    fs.writeFileSync('complex-warning-analysis-summary.md', markdown);
    console.log('📝 Summary report saved to: complex-warning-analysis-summary.md');
  }
}

// Run the analysis
if (require.main === module) {
  const analyzer = new ComplexWarningAnalyzer();
  analyzer.analyzeWarnings().catch(console.error);
}

module.exports = ComplexWarningAnalyzer;
