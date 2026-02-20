#!/usr/bin/env node

/**
 * Enhanced ESLint Warning Analyzer
 *
 * Generates detailed categorization and analysis of all ESLint warnings
 * in the codebase for systematic resolution planning.
 *
 * This version handles large JSON output and parsing issues.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class EnhancedESLintWarningAnalyzer {
  constructor() {
    this.warnings = [];
    this.errors = [];
    this.categories = {};
    this.severityBreakdown = {};
    this.fileBreakdown = {};
    this.ruleBreakdown = {};
    this.priorityMatrix = {};
  }

  /**
   * Generate comprehensive ESLint report
   */
  async generateComprehensiveReport() {
    console.log('🔍 Generating enhanced ESLint warning report...');

    try {
      // Run ESLint with compact format to avoid JSON parsing issues
      console.log('📊 Running ESLint analysis...');
      const eslintOutput = this.runESLintAnalysis();

      // Parse and categorize warnings
      console.log('📋 Parsing and categorizing warnings...');
      this.parseESLintOutput(eslintOutput);

      // Generate categorization
      console.log('🏷️ Categorizing warnings by type and severity...');
      this.categorizeWarnings();

      // Create priority matrix
      console.log('⚡ Creating priority matrix...');
      this.createPriorityMatrix();

      // Generate comprehensive report
      console.log('📄 Generating comprehensive report...');
      const report = this.generateReport();

      // Save report to file
      const reportPath = 'enhanced-eslint-warning-report.json';
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

      // Generate markdown summary
      const summaryPath = 'enhanced-eslint-warning-summary.md';
      const markdownSummary = this.generateMarkdownSummary(report);
      fs.writeFileSync(summaryPath, markdownSummary);

      console.log(`✅ Enhanced ESLint report generated:`);
      console.log(`   📊 JSON Report: ${reportPath}`);
      console.log(`   📝 Summary: ${summaryPath}`);
      console.log(`   🎯 Total Issues: ${this.warnings.length + this.errors.length}`);
      console.log(`   ⚠️  Warnings: ${this.warnings.length}`);
      console.log(`   ❌ Errors: ${this.errors.length}`);
      console.log(`   📂 Files Analyzed: ${Object.keys(this.fileBreakdown).length}`);
      console.log(`   🔧 Rule Types: ${Object.keys(this.ruleBreakdown).length}`);

      return report;

    } catch (error) {
      console.error('❌ Error generating ESLint report:', error.message);
      throw error;
    }
  }

  /**
   * Run ESLint analysis and capture output
   */
  runESLintAnalysis() {
    try {
      // Use compact format to avoid JSON parsing issues with large output
      const command = 'yarn lint:quick --format=compact --no-fix';
      console.log(`   Running: ${command}`);

      const output = execSync(command, {
        encoding: 'utf8',
        stdio: 'pipe',
        maxBuffer: 50 * 1024 * 1024 // 50MB buffer for large output
      });

      return output;
    } catch (error) {
      // ESLint returns non-zero exit code when warnings/errors are found
      // The output is still in error.stdout
      if (error.stdout) {
        return error.stdout;
      }
      throw error;
    }
  }

  /**
   * Parse ESLint compact output and extract warnings/errors
   */
  parseESLintOutput(output) {
    try {
      const lines = output.split('\n').filter(line => line.trim());

      for (const line of lines) {
        // Parse compact format: /path/file.ext: line X, col Y, Error/Warning - message (rule)
        const match = line.match(/^(.+?):\s*line\s+(\d+),\s*col\s+(\d+),\s*(Error|Warning)\s*-\s*(.+?)(?:\s+\(([^)]+)\))?$/);

        if (match) {
          const [, filePath, lineStr, colStr, severity, message, rule] = match;
          const lineNum = parseInt(lineStr, 10);
          const colNum = parseInt(colStr, 10);

          const issue = {
            file: this.getRelativePath(filePath),
            line: lineNum,
            column: colNum,
            rule: rule ? rule.trim() : 'unknown',
            message: message.trim(),
            severity: severity.toLowerCase(),
            fixable: false, // We'll determine this based on rule
            suggestions: []
          };

          if (severity.toLowerCase() === 'warning') {
            this.warnings.push(issue);
          } else {
            this.errors.push(issue);
          }
        }
      }

      console.log(`   📊 Parsed ${this.warnings.length} warnings and ${this.errors.length} errors`);
    } catch (error) {
      console.error('❌ Error parsing ESLint output:', error.message);
      throw error;
    }
  }

  /**
   * Categorize warnings by type, severity, and impact
   */
  categorizeWarnings() {
    // Define warning categories
    const categoryMap = {
      'type-safety': [
        '@typescript-eslint/no-explicit-any',
        '@typescript-eslint/no-unsafe-assignment',
        '@typescript-eslint/no-unsafe-member-access',
        '@typescript-eslint/no-unsafe-call',
        '@typescript-eslint/no-unsafe-return',
        '@typescript-eslint/no-unsafe-argument'
      ],
      'code-quality': [
        '@typescript-eslint/no-unused-vars',
        'no-unused-vars',
        'prefer-const',
        'no-var',
        'eqeqeq',
        'no-constant-condition'
      ],
      'react-hooks': [
        'react-hooks/exhaustive-deps',
        'react-hooks/rules-of-hooks'
      ],
      'imports': [
        'import/order',
        'import/no-unresolved',
        'import/no-duplicates',
        '@typescript-eslint/no-unused-imports'
      ],
      'console-debugging': [
        'no-console'
      ],
      'style-formatting': [
        '@typescript-eslint/prefer-nullish-coalescing',
        '@typescript-eslint/prefer-optional-chain',
        'prefer-template',
        'object-shorthand'
      ],
      'security': [
        'no-eval',
        'no-implied-eval',
        'security/detect-object-injection'
      ],
      'performance': [
        'react/jsx-no-bind',
        '@typescript-eslint/prefer-readonly'
      ],
      'syntax-errors': [
        'no-undef',
        'no-redeclare',
        'no-dupe-keys',
        'no-duplicate-case'
      ]
    };

    // Categorize each warning and error
    const allIssues = [...this.warnings, ...this.errors];

    for (const issue of allIssues) {
      const rule = issue.rule;
      let category = 'other';

      for (const [cat, rules] of Object.entries(categoryMap)) {
        if (rules.includes(rule)) {
          category = cat;
          break;
        }
      }

      // Update category breakdown
      if (!this.categories[category]) {
        this.categories[category] = [];
      }
      this.categories[category].push(issue);

      // Update rule breakdown
      if (!this.ruleBreakdown[rule]) {
        this.ruleBreakdown[rule] = 0;
      }
      this.ruleBreakdown[rule]++;

      // Update file breakdown
      if (!this.fileBreakdown[issue.file]) {
        this.fileBreakdown[issue.file] = 0;
      }
      this.fileBreakdown[issue.file]++;

      // Update severity breakdown
      if (!this.severityBreakdown[issue.severity]) {
        this.severityBreakdown[issue.severity] = 0;
      }
      this.severityBreakdown[issue.severity]++;
    }

    console.log(`   🏷️ Categorized issues into ${Object.keys(this.categories).length} categories`);
  }

  /**
   * Create priority matrix for warning resolution
   */
  createPriorityMatrix() {
    // Define priority levels based on impact and effort
    const priorityRules = {
      'critical': {
        description: 'Build-blocking errors, immediate action required',
        rules: [
          'no-undef',
          'no-redeclare',
          'no-dupe-keys',
          'no-duplicate-case'
        ],
        weight: 5
      },
      'high': {
        description: 'High impact, moderate effort',
        rules: [
          '@typescript-eslint/no-unused-vars',
          'no-unused-vars',
          'import/order',
          'react-hooks/exhaustive-deps'
        ],
        weight: 4
      },
      'medium': {
        description: 'Medium impact, variable effort',
        rules: [
          '@typescript-eslint/no-explicit-any',
          '@typescript-eslint/prefer-optional-chain',
          'import/no-unresolved'
        ],
        weight: 3
      },
      'low': {
        description: 'Low impact, style improvements',
        rules: [
          'prefer-template',
          'object-shorthand',
          '@typescript-eslint/prefer-nullish-coalescing'
        ],
        weight: 2
      },
      'console': {
        description: 'Console cleanup, easy automation',
        rules: [
          'no-console'
        ],
        weight: 1
      }
    };

    // Assign priorities to issues
    const allIssues = [...this.warnings, ...this.errors];

    for (const [priority, config] of Object.entries(priorityRules)) {
      this.priorityMatrix[priority] = {
        description: config.description,
        weight: config.weight,
        issues: [],
        count: 0,
        estimatedEffort: 0
      };

      for (const issue of allIssues) {
        if (config.rules.includes(issue.rule)) {
          this.priorityMatrix[priority].issues.push(issue);
          this.priorityMatrix[priority].count++;

          // Estimate effort (minutes per issue)
          const effortMap = {
            'no-console': 0.5,
            'prefer-const': 0.5,
            'no-var': 1,
            'eqeqeq': 2,
            '@typescript-eslint/no-unused-vars': 3,
            'import/order': 1,
            'react-hooks/exhaustive-deps': 10,
            '@typescript-eslint/no-explicit-any': 15,
            'no-undef': 5,
            'no-redeclare': 5
          };

          this.priorityMatrix[priority].estimatedEffort += effortMap[issue.rule] || 5;
        }
      }
    }

    console.log(`   ⚡ Created priority matrix with ${Object.keys(this.priorityMatrix).length} priority levels`);
  }

  /**
   * Generate comprehensive report object
   */
  generateReport() {
    const totalIssues = this.warnings.length + this.errors.length;
    const totalFiles = Object.keys(this.fileBreakdown).length;

    return {
      metadata: {
        generatedAt: new Date().toISOString(),
        totalIssues,
        totalWarnings: this.warnings.length,
        totalErrors: this.errors.length,
        totalFiles,
        totalRules: Object.keys(this.ruleBreakdown).length,
        analysisCommand: 'yarn lint:quick --format=compact'
      },
      summary: {
        issuesBySeverity: this.severityBreakdown,
        issuesByCategory: Object.fromEntries(
          Object.entries(this.categories).map(([cat, issues]) => [cat, issues.length])
        ),
        issuesByPriority: Object.fromEntries(
          Object.entries(this.priorityMatrix).map(([priority, data]) => [priority, data.count])
        ),
        topRules: Object.entries(this.ruleBreakdown)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 15)
          .map(([rule, count]) => ({ rule, count })),
        topFiles: Object.entries(this.fileBreakdown)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 25)
          .map(([file, count]) => ({ file, count }))
      },
      categories: this.categories,
      priorityMatrix: this.priorityMatrix,
      ruleBreakdown: this.ruleBreakdown,
      fileBreakdown: this.fileBreakdown,
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * Generate actionable recommendations
   */
  generateRecommendations() {
    const recommendations = [];

    // Priority-based recommendations
    for (const [priority, data] of Object.entries(this.priorityMatrix)) {
      if (data.count > 0) {
        recommendations.push({
          type: 'priority',
          priority,
          description: `Address ${data.count} ${priority} priority issues`,
          estimatedEffort: `${Math.ceil(data.estimatedEffort / 60)} hours`,
          impact: data.weight >= 4 ? 'high' : data.weight >= 3 ? 'medium' : 'low'
        });
      }
    }

    // Category-based recommendations
    const categoryPriorities = {
      'syntax-errors': { priority: 'critical', reason: 'Prevents compilation and breaks builds' },
      'type-safety': { priority: 'high', reason: 'Improves code reliability and prevents runtime errors' },
      'code-quality': { priority: 'high', reason: 'Reduces technical debt and improves maintainability' },
      'console-debugging': { priority: 'medium', reason: 'Cleans up development artifacts' },
      'react-hooks': { priority: 'high', reason: 'Prevents React performance issues and bugs' },
      'imports': { priority: 'medium', reason: 'Improves code organization and build performance' }
    };

    for (const [category, issues] of Object.entries(this.categories)) {
      if (issues.length > 5) { // Only recommend for categories with significant issues
        const config = categoryPriorities[category] || { priority: 'low', reason: 'General code improvement' };
        recommendations.push({
          type: 'category',
          category,
          count: issues.length,
          priority: config.priority,
          reason: config.reason,
          suggestedApproach: this.getSuggestedApproach(category)
        });
      }
    }

    return recommendations;
  }

  /**
   * Get suggested approach for category
   */
  getSuggestedApproach(category) {
    const approaches = {
      'syntax-errors': 'Immediate manual fixes required - these prevent compilation',
      'type-safety': 'Gradual replacement with proper types, preserve intentional any types',
      'code-quality': 'Automated fixes where safe, manual review for complex cases',
      'console-debugging': 'Automated removal with preservation of intentional debug statements',
      'react-hooks': 'Manual review required, use useCallback and useMemo appropriately',
      'imports': 'Automated import sorting and unused import removal',
      'style-formatting': 'Automated fixes with Prettier integration',
      'performance': 'Manual optimization with performance testing',
      'security': 'Manual review required, security implications'
    };

    return approaches[category] || 'Manual review and systematic resolution';
  }

  /**
   * Generate markdown summary report
   */
  generateMarkdownSummary(report) {
    const { metadata, summary, priorityMatrix, recommendations } = report;

    return `# Enhanced ESLint Warning Analysis Summary

## Overview

**Generated:** ${new Date(metadata.generatedAt).toLocaleString()}
**Total Issues:** ${metadata.totalIssues}
**Warnings:** ${metadata.totalWarnings}
**Errors:** ${metadata.totalErrors}
**Files Analyzed:** ${metadata.totalFiles}
**Rule Types:** ${metadata.totalRules}

## Issue Distribution

### By Severity
${Object.entries(summary.issuesBySeverity)
  .sort(([,a], [,b]) => b - a)
  .map(([severity, count]) => `- **${severity.toUpperCase()}**: ${count} issues`)
  .join('\n')}

### By Category
${Object.entries(summary.issuesByCategory)
  .sort(([,a], [,b]) => b - a)
  .map(([category, count]) => `- **${category}**: ${count} issues`)
  .join('\n')}

### By Priority
${Object.entries(summary.issuesByPriority)
  .sort(([,a], [,b]) => b - a)
  .map(([priority, count]) => `- **${priority.toUpperCase()}**: ${count} issues`)
  .join('\n')}

## Top Issue Rules

${summary.topRules
  .map((rule, index) => `${index + 1}. **${rule.rule}**: ${rule.count} occurrences`)
  .join('\n')}

## High-Impact Files

${summary.topFiles
  .slice(0, 15)
  .map((file, index) => `${index + 1}. \`${file.file}\`: ${file.count} issues`)
  .join('\n')}

## Priority Matrix

${Object.entries(priorityMatrix)
  .filter(([, data]) => data.count > 0)
  .map(([priority, data]) => `### ${priority.toUpperCase()} Priority
- **Count**: ${data.count} issues
- **Description**: ${data.description}
- **Estimated Effort**: ${Math.ceil(data.estimatedEffort / 60)} hours
- **Weight**: ${data.weight}/5`)
  .join('\n\n')}

## Recommendations

${recommendations
  .map((rec, index) => {
    if (rec.type === 'priority') {
      return `${index + 1}. **${rec.priority.toUpperCase()} Priority**: ${rec.description} (${rec.estimatedEffort})`;
    } else {
      return `${index + 1}. **${rec.category}**: ${rec.count} issues - ${rec.reason}
   - **Approach**: ${rec.suggestedApproach}`;
    }
  })
  .join('\n')}

## Next Steps

1. **Critical Issues**: Address ${priorityMatrix.critical?.count || 0} critical issues immediately
2. **High Priority**: Focus on ${priorityMatrix.high?.count || 0} high-priority issues
3. **Console Cleanup**: Automate ${priorityMatrix.console?.count || 0} console statement removals
4. **Type Safety**: Systematic approach to ${summary.issuesByCategory['type-safety'] || 0} type safety issues

## Automation Opportunities

- **Console Statement Cleanup**: ${summary.issuesByCategory['console-debugging'] || 0} issues can be automated
- **Import Organization**: ${summary.issuesByCategory['imports'] || 0} issues can be automated
- **Style Formatting**: ${summary.issuesByCategory['style-formatting'] || 0} issues can be automated
- **Code Quality**: Partial automation possible for ${summary.issuesByCategory['code-quality'] || 0} issues

---

*Report generated by enhanced-eslint-warning-analyzer.cjs*
*Analysis completed at ${new Date().toLocaleString()}*
`;
  }

  /**
   * Get relative path from absolute path
   */
  getRelativePath(absolutePath) {
    return path.relative(process.cwd(), absolutePath);
  }
}

// Main execution
async function main() {
  const analyzer = new EnhancedESLintWarningAnalyzer();

  try {
    const report = await analyzer.generateComprehensiveReport();

    console.log('\n🎯 Analysis Complete!');
    console.log('\n📊 Summary:');
    console.log(`   Total Issues: ${report.metadata.totalIssues}`);
    console.log(`   Warnings: ${report.metadata.totalWarnings}`);
    console.log(`   Errors: ${report.metadata.totalErrors}`);
    console.log(`   Categories: ${Object.keys(report.categories).length}`);
    console.log(`   Priority Levels: ${Object.keys(report.priorityMatrix).length}`);
    console.log(`   Recommendations: ${report.recommendations.length}`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Analysis failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { EnhancedESLintWarningAnalyzer };
