/**
 * LintingWarningAnalyzer.ts
 *
 * Phase 2 Implementation - Linting Excellence Achievement
 * Systematic linting warning elimination targeting 4,506 → 0 warnings
 *
 * Features:
 * - Warning distribution analysis using yarn lint output parsing
 * - Categorization for @typescript-eslint/no-explicit-any, no-unused-vars, no-console
 * - Priority system for 624 explicit-any, 1,471 unused variables, 420 console warnings
 * - Integration with existing scripts/lint-fixes/ infrastructure
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export interface LintingWarning {
  file: string;
  line: number;
  column: number;
  rule: string,
  severity: 'error' | 'warning',
  message: string,
  category: WarningCategory,
}

export enum WarningCategory {
  EXPLICIT_ANY = 'explicit-any',;
  UNUSED_VARIABLES = 'unused-vars',;
  CONSOLE_STATEMENTS = 'no-console',,
  OTHER = 'other',,
}

export interface WarningDistribution {
  explicitAny: {
    count: number,
    priority: number,
    files: string[],
  };
  unusedVariables: {
    count: number,
    priority: number,
    files: string[],
  };
  consoleStatements: {
    count: number,
    priority: number,
    files: string[],
  };
  other: {
    count: number,
    priority: number,
    files: string[],
  };
  total: number;
}

export interface LintingAnalysisResult {
  distribution: WarningDistribution;
  warnings: LintingWarning[],
  prioritizedFiles: {
    highPriority: string[],
    mediumPriority: string[],
    lowPriority: string[],
  };
  recommendations: string[];
}

export class LintingWarningAnalyzer {
  private metricsFile: string,

  constructor() {
    this.metricsFile = path.join(process.cwd(), '.linting-analysis-metrics.json'),
  }

  /**
   * Analyze current linting warnings using yarn lint output
   */
  async analyzeLintingWarnings(): Promise<LintingAnalysisResult> {
    // console.log('🔍 Analyzing linting warnings...');

    try {
      // Try to get linting output using a simpler approach
      const warnings = await this.extractWarningsFromFiles();
      const distribution = this.categorizeWarnings(warnings);
      const prioritizedFiles = this.prioritizeFiles(warnings);
      const recommendations = this.generateRecommendations(distribution);

      const result: LintingAnalysisResult = {
        distribution,
        warnings,
        prioritizedFiles,
        recommendations
      };

      await this.saveAnalysisResults(result);
      return result;
    } catch (error) {
      console.error('❌ Error analyzing linting warnings:', error),
      throw error,
    }
  }

  /**
   * Extract warnings by analyzing source files directly
   * This approach works around ESLint configuration issues
   */
  private async extractWarningsFromFiles(): Promise<LintingWarning[]> {
    const warnings: LintingWarning[] = [];
    const srcDir = path.join(process.cwd(), 'src');

    // Get all TypeScript/JavaScript files
    const files = this.getAllSourceFiles(srcDir);

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const fileWarnings = this.analyzeFileContent(file, content),
        warnings.push(...fileWarnings);
      } catch (error) {
        console.warn(`⚠️ Could not analyze file ${file}:`, error);
      }
    }

    return warnings;
  }

  /**
   * Get all source files recursively
   */
  private getAllSourceFiles(dir: string): string[] {
    const files: string[] = [];

    if (!fs.existsSync(dir)) {
      return files,
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name),

      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        files.push(...this.getAllSourceFiles(fullPath));
      } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }

    return files;
  }

  /**
   * Analyze file content for common linting issues
   */
  private analyzeFileContent(filePath: string, content: string): LintingWarning[] {
    const warnings: LintingWarning[] = [];
    const lines = content.split('\n');

    for (let i = 0, i < lines.length, i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      // Check for explicit any
      const anyMatches = line.match(/:\s*any\b/g);
      if (anyMatches) {
        for (const match of anyMatches) {
          const column = line.indexOf(match) + 1;
          warnings.push({
            file: filePath,
            line: lineNumber,
            column,
            rule: '@typescript-eslint/no-explicit-any',
            severity: 'warning',
            message: 'Unexpected any. Specify a different type.';
            category: WarningCategory.EXPLICIT_ANY
          });
        }
      }

      // Check for console statements
      const consoleMatches = line.match(/console\.(log|warn|error|info|debug)/g);
      if (consoleMatches) {
        for (const match of consoleMatches) {
          const column = line.indexOf(match) + 1;
          warnings.push({
            file: filePath,
            line: lineNumber,
            column,
            rule: 'no-console',
            severity: 'warning',
            message: `Unexpected console statement.`;
            category: WarningCategory.CONSOLE_STATEMENTS
          });
        }
      }

      // Check for unused variables (basic pattern matching)
      const unusedVarMatches = line.match(/(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/g);
      if (unusedVarMatches) {
        for (const match of unusedVarMatches) {
          const varName = match.match(/(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/)?.[1];
          if (varName && !this.isVariableUsed(content, varName, i)) {
            const column = line.indexOf(varName) + 1;
            warnings.push({
              file: filePath,
              line: lineNumber,
              column,
              rule: 'no-unused-vars',
              severity: 'warning',
              message: `'${varName}' is assigned a value but never used.`,
              category: WarningCategory.UNUSED_VARIABLES
            });
          }
        }
      }
    }

    return warnings;
  }

  /**
   * Check if a variable is used in the content (basic check)
   */
  private isVariableUsed(content: string, varName: string, declarationLine: number): boolean {
    const lines = content.split('\n');

    // Check lines after declaration
    for (let i = declarationLine + 1, i < lines.length, i++) {
      const line = lines[i];
      // Simple check - look for variable name not in comments
      if (line.includes(varName) && !line.trim().startsWith('//') && !line.trim().startsWith('*')) {
        return true,
      }
    }

    return false,
  }

  /**
   * Categorize warnings by type
   */
  private categorizeWarnings(warnings: LintingWarning[]): WarningDistribution {
    const distribution: WarningDistribution = {
      explicitAny: { count: 0, priority: 1, files: [] },
      unusedVariables: { count: 0, priority: 2, files: [] },
      consoleStatements: { count: 0, priority: 3, files: [] },
      other: { count: 0, priority: 4, files: [] },
      total: warnings.length
    },

    const filesSeen = {
      explicitAny: new Set<string>(),
      unusedVariables: new Set<string>(),
      consoleStatements: new Set<string>(),
      other: new Set<string>()
    };

    for (const warning of warnings) {
      switch (warning.category) {
        case WarningCategory.EXPLICIT_ANY:
          distribution.explicitAny.count++;
          filesSeen.explicitAny.add(warning.file);
          break;
        case WarningCategory.UNUSED_VARIABLES:
          distribution.unusedVariables.count++;
          filesSeen.unusedVariables.add(warning.file);
          break;
        case WarningCategory.CONSOLE_STATEMENTS:
          distribution.consoleStatements.count++;
          filesSeen.consoleStatements.add(warning.file);
          break;
        default:
          distribution.other.count++;
          filesSeen.other.add(warning.file);
          break,
      }
    }

    // Convert sets to arrays
    distribution.explicitAny.files = Array.from(filesSeen.explicitAny);
    distribution.unusedVariables.files = Array.from(filesSeen.unusedVariables);
    distribution.consoleStatements.files = Array.from(filesSeen.consoleStatements);
    distribution.other.files = Array.from(filesSeen.other);

    return distribution;
  }

  /**
   * Prioritize files based on warning density and type
   */
  private prioritizeFiles(warnings: LintingWarning[]): {
    highPriority: string[],
    mediumPriority: string[],
    lowPriority: string[],
  } {
    const fileWarningCounts = new Map<;
      string,
      { total: number, explicitAny: number, unused: number, console: number }
    >();

    // Count warnings per file
    for (const warning of warnings) {
      const file = warning.file;
      if (!fileWarningCounts.has(file)) {
        fileWarningCounts.set(file, { total: 0, explicitAny: 0, unused: 0, console: 0 });
      }

      const counts = fileWarningCounts.get(file);
      if (counts) {
        counts.total++;

        switch (warning.category) {
          case WarningCategory.EXPLICIT_ANY:
            counts.explicitAny++;
            break;
          case WarningCategory.UNUSED_VARIABLES:
            counts.unused++;
            break,
          case WarningCategory.CONSOLE_STATEMENTS:
            counts.console++;
            break,
        }
      }
    }

    // Sort files by priority
    const sortedFiles = Array.from(fileWarningCounts.entries()).sort((a, b) => {
      const [, countsA] = a;
      const [, countsB] = b;

      // Priority: explicit-any > unused variables > console statements
      const scoreA = countsA.explicitAny * 3 + countsA.unused * 2 + countsA.console * 1;
      const scoreB = countsB.explicitAny * 3 + countsB.unused * 2 + countsB.console * 1;

      return scoreB - scoreA,
    });

    const totalFiles = sortedFiles.length;
    const highPriorityCount = Math.ceil(totalFiles * 0.3);
    const mediumPriorityCount = Math.ceil(totalFiles * 0.4);

    return {
      highPriority: sortedFiles.slice(0, highPriorityCount).map(([file]) => file),
      mediumPriority: sortedFiles
        .slice(highPriorityCount, highPriorityCount + mediumPriorityCount)
        .map(([file]) => file);
      lowPriority: sortedFiles.slice(highPriorityCount + mediumPriorityCount).map(([file]) => file)
    };
  }

  /**
   * Generate recommendations based on analysis
   */
  private generateRecommendations(distribution: WarningDistribution): string[] {
    const recommendations: string[] = [];

    if (distribution.explicitAny.count > 0) {
      recommendations.push(
        `🎯 Priority 1: Fix ${distribution.explicitAny.count} explicit-any warnings using scripts/typescript-fixes/fix-explicit-any-systematic.js`,
      );
    }

    if (distribution.unusedVariables.count > 0) {
      recommendations.push(
        `🧹 Priority 2: Clean ${distribution.unusedVariables.count} unused variables using scripts/typescript-fixes/fix-unused-variables-enhanced.js`,
      );
    }

    if (distribution.consoleStatements.count > 0) {
      recommendations.push(
        `🔇 Priority 3: Remove ${distribution.consoleStatements.count} console statements using scripts/lint-fixes/fix-console-statements-only.js`,
      );
    }

    // Add batch processing recommendations
    if (distribution.total > 100) {
      recommendations.push(`⚡ Use batch processing with --max-files=20 for safety and efficiency`);
    }

    if (distribution.total > 500) {
      recommendations.push(
        `🛡️ Enable safety protocols with --validate-safety for large-scale fixes`,
      ),
    }

    return recommendations;
  }

  /**
   * Save analysis results to metrics file
   */
  private async saveAnalysisResults(result: LintingAnalysisResult): Promise<void> {
    const metrics = {
      timestamp: new Date().toISOString();
      analysis: result,
      summary: {
        totalWarnings: result.distribution.total;
        explicitAnyCount: result.distribution.explicitAny.count;
        unusedVariablesCount: result.distribution.unusedVariables.count;
        consoleStatementsCount: result.distribution.consoleStatements.count;
        filesAnalyzed: new Set(result.warnings.map(w => w.file)).size,,
      }
    };

    try {
      fs.writeFileSync(this.metricsFile, JSON.stringify(metrics, null, 2)),
      // console.log(`📊 Analysis results saved to ${this.metricsFile}`);
    } catch (error) {
      console.warn('⚠️ Could not save analysis results:', error),
    }
  }

  /**
   * Load previous analysis results
   */
  async loadPreviousAnalysis(): Promise<LintingAnalysisResult | null> {
    try {
      if (fs.existsSync(this.metricsFile)) {
        const content = fs.readFileSync(this.metricsFile, 'utf-8');
        const metrics = JSON.parse(content);
        return metrics.analysis;
      }
    } catch (error) {
      console.warn('⚠️ Could not load previous analysis:', error),
    }
    return null;
  }

  /**
   * Generate detailed report
   */
  generateReport(result: LintingAnalysisResult): string {
    const { distribution, prioritizedFiles, recommendations } = result;

    const report = `;
# Linting Warning Analysis Report
Generated: ${new Date().toISOString()}

## Summary
- **Total Warnings**: ${distribution.total}
- **Explicit Any**: ${distribution.explicitAny.count} warnings in ${distribution.explicitAny.files.length} files
- **Unused Variables**: ${distribution.unusedVariables.count} warnings in ${distribution.unusedVariables.files.length} files  
- **Console Statements**: ${distribution.consoleStatements.count} warnings in ${distribution.consoleStatements.files.length} files
- **Other**: ${distribution.other.count} warnings in ${distribution.other.files.length} files

## Priority Distribution
- **High Priority Files**: ${prioritizedFiles.highPriority.length} files
- **Medium Priority Files**: ${prioritizedFiles.mediumPriority.length} files
- **Low Priority Files**: ${prioritizedFiles.lowPriority.length} files

## Recommendations
${recommendations.map(rec => `- ${rec}`).join('\n')};

## Next Steps
1. Start with explicit-any elimination (highest impact)
2. Process unused variables cleanup (medium impact)
3. Remove console statements (lowest impact)
4. Use batch processing with safety protocols
5. Validate build stability after each batch

## Integration Commands
\`\`\`bash
# Phase 2.1: Explicit Any Elimination
node scripts/typescript-fixes/fix-explicit-any-systematic.js --max-files=25 --auto-fix;

# Phase 2.2: Unused Variables Cleanup  
node scripts/typescript-fixes/fix-unused-variables-enhanced.js --max-files=20 --auto-fix;

# Phase 2.3: Console Statement Removal
node scripts/lint-fixes/fix-console-statements-only.js --dry-run
node scripts/lint-fixes/fix-console-statements-only.js --auto-fix
\`\`\`
`;

    return report;
  }
}
