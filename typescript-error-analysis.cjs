#!/usr/bin/env node

/**
 * Comprehensive TypeScript Error Analysis Script
 *
 * This script provides detailed categorization and analysis of TypeScript errors
 * to support the linting excellence recovery campaign.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Error type definitions and descriptions
const ERROR_DEFINITIONS = {
  'TS18046': {
    name: 'Unknown Type Usage',
    description: 'Variable is of type "unknown" and needs type assertion or narrowing',
    severity: 'high',
    category: 'type-safety',
    fixStrategy: 'Type assertion, type guards, or proper typing'
  },
  'TS2339': {
    name: 'Property Does Not Exist',
    description: 'Property does not exist on type',
    severity: 'critical',
    category: 'type-mismatch',
    fixStrategy: 'Interface updates, optional chaining, or type corrections'
  },
  'TS2571': {
    name: 'Object of Type Unknown',
    description: 'Object is of type "unknown" and cannot be used without type assertion',
    severity: 'high',
    category: 'type-safety',
    fixStrategy: 'Type assertion or type narrowing'
  },
  'TS2345': {
    name: 'Argument Type Mismatch',
    description: 'Argument type is not assignable to parameter type',
    severity: 'high',
    category: 'type-mismatch',
    fixStrategy: 'Type conversion, interface updates, or parameter type fixes'
  },
  'TS2322': {
    name: 'Type Assignment Error',
    description: 'Type is not assignable to another type',
    severity: 'high',
    category: 'type-mismatch',
    fixStrategy: 'Type conversion, union types, or interface updates'
  },
  'TS2305': {
    name: 'Module Not Found',
    description: 'Module has no exported member',
    severity: 'critical',
    category: 'import-export',
    fixStrategy: 'Import path corrections or export additions'
  },
  'TS2307': {
    name: 'Cannot Find Module',
    description: 'Cannot find module or its corresponding type declarations',
    severity: 'critical',
    category: 'import-export',
    fixStrategy: 'Module installation, path corrections, or type declarations'
  },
  'TS2769': {
    name: 'No Overload Matches',
    description: 'No overload matches this call',
    severity: 'high',
    category: 'function-signature',
    fixStrategy: 'Parameter type corrections or function signature updates'
  },
  'TS2300': {
    name: 'Duplicate Identifier',
    description: 'Duplicate identifier found',
    severity: 'medium',
    category: 'naming-conflict',
    fixStrategy: 'Rename conflicting identifiers'
  },
  'TS2352': {
    name: 'Conversion Error',
    description: 'Conversion of type may be a mistake',
    severity: 'medium',
    category: 'type-conversion',
    fixStrategy: 'Proper type assertions or interface updates'
  }
};

class TypeScriptErrorAnalyzer {
  constructor() {
    this.errors = [];
    this.analysis = {
      totalErrors: 0,
      errorBreakdown: {},
      categoryBreakdown: {},
      severityBreakdown: {},
      fileBreakdown: {},
      highImpactFiles: [],
      criticalErrors: [],
      recommendations: []
    };
  }

  async runAnalysis() {
    console.log('🔍 Starting Comprehensive TypeScript Error Analysis...\n');

    try {
      // Get raw TypeScript errors
      console.log('📊 Collecting TypeScript error data...');
      await this.collectErrors();

      // Analyze error patterns
      console.log('🔬 Analyzing error patterns...');
      await this.analyzeErrorPatterns();

      // Categorize errors
      console.log('📋 Categorizing errors by type and severity...');
      await this.categorizeErrors();

      // Identify high-impact files
      console.log('🎯 Identifying high-impact files...');
      await this.identifyHighImpactFiles();

      // Generate recommendations
      console.log('💡 Generating fix recommendations...');
      await this.generateRecommendations();

      // Generate comprehensive report
      console.log('📄 Generating comprehensive report...');
      await this.generateReport();

      console.log('\n✅ Analysis complete! Check typescript-error-analysis-report.json for details.');

    } catch (error) {
      console.error('❌ Error during analysis:', error.message);
      process.exit(1);
    }
  }

  async collectErrors() {
    try {
      // Get error count
      const countOutput = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS" || echo "0"', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      this.analysis.totalErrors = parseInt(countOutput.trim());

      // Get error breakdown by type
      const breakdownOutput = execSync(
        'yarn tsc --noEmit --skipLibCheck 2>&1 | grep -E "error TS" | sed \'s/.*error //\' | cut -d\':\' -f1 | sort | uniq -c | sort -nr',
        { encoding: 'utf8', stdio: 'pipe' }
      );

      const lines = breakdownOutput.trim().split('\n').filter(line => line.trim());
      for (const line of lines) {
        const match = line.trim().match(/^\s*(\d+)\s+(.+)$/);
        if (match) {
          this.analysis.errorBreakdown[match[2].trim()] = parseInt(match[1]);
        }
      }

      // Get detailed error information
      const detailedOutput = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -E "error TS"', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const errorLines = detailedOutput.trim().split('\n').filter(line => line.trim());
      for (const line of errorLines) {
        const match = line.match(/^(.+?)\((\d+),(\d+)\):\s*error\s+(TS\d+):\s*(.+)$/);
        if (match) {
          this.errors.push({
            file: match[1],
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            code: match[4],
            message: match[5].trim()
          });
        }
      }

    } catch (error) {
      console.warn('Warning: Could not collect all error details:', error.message);
    }
  }

  async analyzeErrorPatterns() {
    // Analyze file distribution
    const fileErrorCounts = {};
    for (const error of this.errors) {
      fileErrorCounts[error.file] = (fileErrorCounts[error.file] || 0) + 1;
    }
    this.analysis.fileBreakdown = fileErrorCounts;

    // Identify high-impact files (>10 errors)
    this.analysis.highImpactFiles = Object.entries(fileErrorCounts)
      .filter(([file, count]) => count > 10)
      .sort(([,a], [,b]) => b - a)
      .map(([file, count]) => ({ file, errorCount: count }));
  }

  async categorizeErrors() {
    const categoryBreakdown = {};
    const severityBreakdown = {};
    const criticalErrors = [];

    for (const [errorCode, count] of Object.entries(this.analysis.errorBreakdown)) {
      const definition = ERROR_DEFINITIONS[errorCode];

      if (definition) {
        // Category breakdown
        const category = definition.category;
        categoryBreakdown[category] = (categoryBreakdown[category] || 0) + count;

        // Severity breakdown
        const severity = definition.severity;
        severityBreakdown[severity] = (severityBreakdown[severity] || 0) + count;

        // Track critical errors
        if (severity === 'critical') {
          criticalErrors.push({
            code: errorCode,
            count: count,
            name: definition.name,
            description: definition.description
          });
        }
      } else {
        // Unknown error type
        categoryBreakdown['unknown'] = (categoryBreakdown['unknown'] || 0) + count;
        severityBreakdown['unknown'] = (severityBreakdown['unknown'] || 0) + count;
      }
    }

    this.analysis.categoryBreakdown = categoryBreakdown;
    this.analysis.severityBreakdown = severityBreakdown;
    this.analysis.criticalErrors = criticalErrors;
  }

  async identifyHighImpactFiles() {
    // Already done in analyzeErrorPatterns, but let's add more details
    for (const fileInfo of this.analysis.highImpactFiles) {
      const fileErrors = this.errors.filter(error => error.file === fileInfo.file);
      const errorTypes = {};

      for (const error of fileErrors) {
        errorTypes[error.code] = (errorTypes[error.code] || 0) + 1;
      }

      fileInfo.errorTypes = errorTypes;
      fileInfo.dominantErrorType = Object.entries(errorTypes)
        .sort(([,a], [,b]) => b - a)[0]?.[0];
    }
  }

  async generateRecommendations() {
    const recommendations = [];

    // Critical error recommendations
    if (this.analysis.criticalErrors.length > 0) {
      recommendations.push({
        priority: 'CRITICAL',
        category: 'Critical Error Resolution',
        description: `Address ${this.analysis.criticalErrors.length} critical error types that prevent compilation`,
        actions: this.analysis.criticalErrors.map(error =>
          `Fix ${error.count} instances of ${error.name} (${error.code}): ${error.description}`
        )
      });
    }

    // High-impact file recommendations
    if (this.analysis.highImpactFiles.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'High-Impact File Focus',
        description: `Focus on ${this.analysis.highImpactFiles.length} files with >10 errors each`,
        actions: this.analysis.highImpactFiles.slice(0, 10).map(file =>
          `${file.file}: ${file.errorCount} errors (dominant: ${file.dominantErrorType})`
        )
      });
    }

    // Category-based recommendations
    const topCategories = Object.entries(this.analysis.categoryBreakdown)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    for (const [category, count] of topCategories) {
      recommendations.push({
        priority: 'MEDIUM',
        category: `${category.charAt(0).toUpperCase() + category.slice(1)} Resolution`,
        description: `Address ${count} errors in ${category} category`,
        actions: [`Systematic resolution of ${category} related issues`]
      });
    }

    // Automation recommendations
    const automationCandidates = Object.entries(this.analysis.errorBreakdown)
      .filter(([code, count]) => {
        const definition = ERROR_DEFINITIONS[code];
        return definition && count > 50 && definition.fixStrategy.includes('Type assertion');
      });

    if (automationCandidates.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Automation Opportunities',
        description: 'Errors suitable for automated fixing',
        actions: automationCandidates.map(([code, count]) =>
          `${code}: ${count} instances - ${ERROR_DEFINITIONS[code].fixStrategy}`
        )
      });
    }

    this.analysis.recommendations = recommendations;
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalErrors: this.analysis.totalErrors,
        totalFiles: Object.keys(this.analysis.fileBreakdown).length,
        highImpactFiles: this.analysis.highImpactFiles.length,
        criticalErrorTypes: this.analysis.criticalErrors.length
      },
      errorBreakdown: this.analysis.errorBreakdown,
      categoryBreakdown: this.analysis.categoryBreakdown,
      severityBreakdown: this.analysis.severityBreakdown,
      highImpactFiles: this.analysis.highImpactFiles,
      criticalErrors: this.analysis.criticalErrors,
      recommendations: this.analysis.recommendations,
      errorDefinitions: ERROR_DEFINITIONS,
      detailedErrors: this.errors.slice(0, 100) // First 100 for reference
    };

    // Write JSON report
    fs.writeFileSync('typescript-error-analysis-report.json', JSON.stringify(report, null, 2));

    // Write human-readable summary
    const summary = this.generateHumanReadableSummary(report);
    fs.writeFileSync('typescript-error-analysis-summary.md', summary);

    // Console output
    this.displaySummary(report);
  }

  generateHumanReadableSummary(report) {
    return `# TypeScript Error Analysis Summary

**Analysis Date:** ${new Date(report.timestamp).toLocaleString()}

## Overview
- **Total Errors:** ${report.summary.totalErrors}
- **Files Affected:** ${report.summary.totalFiles}
- **High-Impact Files:** ${report.summary.highImpactFiles} (>10 errors each)
- **Critical Error Types:** ${report.summary.criticalErrorTypes}

## Error Breakdown by Type
${Object.entries(report.errorBreakdown)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 10)
  .map(([code, count]) => {
    const def = ERROR_DEFINITIONS[code];
    return `- **${code}**: ${count} errors - ${def ? def.name : 'Unknown'}`;
  }).join('\n')}

## Error Categories
${Object.entries(report.categoryBreakdown)
  .sort(([,a], [,b]) => b - a)
  .map(([category, count]) => `- **${category}**: ${count} errors`).join('\n')}

## Severity Distribution
${Object.entries(report.severityBreakdown)
  .sort(([,a], [,b]) => b - a)
  .map(([severity, count]) => `- **${severity}**: ${count} errors`).join('\n')}

## High-Impact Files (Top 10)
${report.highImpactFiles.slice(0, 10)
  .map((file, index) => `${index + 1}. **${file.file}**: ${file.errorCount} errors (${file.dominantErrorType})`).join('\n')}

## Critical Errors Requiring Immediate Attention
${report.criticalErrors.map(error =>
  `- **${error.code}** (${error.count} instances): ${error.description}`
).join('\n')}

## Recommendations

${report.recommendations.map(rec => `
### ${rec.category} (${rec.priority} Priority)
${rec.description}

Actions:
${rec.actions.map(action => `- ${action}`).join('\n')}
`).join('\n')}

## Next Steps

1. **Immediate Focus**: Address critical errors (${report.criticalErrors.reduce((sum, err) => sum + err.count, 0)} total)
2. **High-Impact Files**: Focus on files with >10 errors each
3. **Systematic Approach**: Use category-based resolution strategy
4. **Automation**: Leverage existing scripts for repetitive error patterns

---
*Generated by TypeScript Error Analysis Script*
`;
  }

  displaySummary(report) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TYPESCRIPT ERROR ANALYSIS SUMMARY');
    console.log('='.repeat(60));

    console.log(`\n📈 OVERVIEW:`);
    console.log(`   Total Errors: ${report.summary.totalErrors}`);
    console.log(`   Files Affected: ${report.summary.totalFiles}`);
    console.log(`   High-Impact Files: ${report.summary.highImpactFiles}`);
    console.log(`   Critical Error Types: ${report.summary.criticalErrorTypes}`);

    console.log(`\n🔥 TOP ERROR TYPES:`);
    Object.entries(report.errorBreakdown)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([code, count]) => {
        const def = ERROR_DEFINITIONS[code];
        console.log(`   ${code}: ${count} errors - ${def ? def.name : 'Unknown'}`);
      });

    console.log(`\n📂 CATEGORY BREAKDOWN:`);
    Object.entries(report.categoryBreakdown)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`   ${category}: ${count} errors`);
      });

    console.log(`\n⚠️  SEVERITY BREAKDOWN:`);
    Object.entries(report.severityBreakdown)
      .sort(([,a], [,b]) => b - a)
      .forEach(([severity, count]) => {
        console.log(`   ${severity}: ${count} errors`);
      });

    if (report.highImpactFiles.length > 0) {
      console.log(`\n🎯 HIGH-IMPACT FILES (Top 5):`);
      report.highImpactFiles.slice(0, 5).forEach((file, index) => {
        console.log(`   ${index + 1}. ${file.file}: ${file.errorCount} errors`);
      });
    }

    console.log(`\n💡 KEY RECOMMENDATIONS:`);
    report.recommendations.slice(0, 3).forEach(rec => {
      console.log(`   ${rec.priority}: ${rec.description}`);
    });

    console.log('\n📄 Detailed reports saved:');
    console.log('   - typescript-error-analysis-report.json');
    console.log('   - typescript-error-analysis-summary.md');
    console.log('\n' + '='.repeat(60));
  }
}

// Run the analysis
if (require.main === module) {
  const analyzer = new TypeScriptErrorAnalyzer();
  analyzer.runAnalysis().catch(console.error);
}

module.exports = TypeScriptErrorAnalyzer;
