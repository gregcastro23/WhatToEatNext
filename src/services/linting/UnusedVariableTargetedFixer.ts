/**
 * Targeted Unused Variable Fixer
 *
 * Focuses on safe, high-impact unused variable fixes while preserving
 * critical astrological and campaign system variables.
 *
 * Requirements: 3.2, 4.1
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

import { log } from '@/services/LoggingService';

interface FixResult {
  filesProcessed: number,
  variablesFixed: number,
  errors: string[],
  warnings: string[],
}

export class UnusedVariableTargetedFixer {
  private preservePatterns = [
    // Astrological calculation files
    /src\/calculations\//,
    /src\/data\/planets\//,
    /src\/utils\/reliableAstronomy/,
    /src\/utils\/astrologyUtils/,
    /planetary/i,
    /elemental/i,
    /astrological/i,

    // Campaign system files
    /src\/services\/campaign\//,
    /AdvancedAnalyticsIntelligenceService/,
    /MLIntelligenceService/,
    /PredictiveIntelligenceService/,
    /campaign/i,
    /intelligence/i
  ],

  /**
   * Fix unused function parameters by prefixing with underscore
   */
  public async fixUnusedFunctionParameters(): Promise<FixResult> {
    log.info('🔧 Fixing unused function parameters...\n');

    const result: FixResult = {
      filesProcessed: 0,
      variablesFixed: 0,
      errors: [],
      warnings: []
    };

    try {
      // Get files with unused function parameters
      const lintOutput = execSync('yarn lint --format=compact 2>&1', {
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024
      });

      const unusedParams = this.extractUnusedParameters(lintOutput);
      const safeParams = unusedParams.filter(param => !this.shouldPreserveFile(param.file));

      log.info(`Found ${unusedParams.length} unused parameters`);
      log.info(`Safe to fix: ${safeParams.length}`);
      log.info(`Preserved: ${unusedParams.length - safeParams.length}\n`);

      // Group by file for efficient processing
      const fileGroups = this.groupByFile(safeParams);

      for (const [filePath, params] of Object.entries(fileGroups)) {
        try {
          const fixed = await this.fixParametersInFile(filePath, params);
          result.filesProcessed++;
          result.variablesFixed += fixed;
          log.info(`✅ ${filePath.replace(process.cwd(), '')}: ${fixed} parameters fixed`);
        } catch (error) {
          result.errors.push(`Error fixing ${filePath}: ${error}`);
          console.error(`❌ Error fixing ${filePath}:`, error);
        }
      }
    } catch (error) {
      result.errors.push(`Failed to get lint output: ${error}`);
    }

    return result;
  }

  /**
   * Fix unused destructured variables by prefixing with underscore
   */
  public async fixUnusedDestructuredVariables(): Promise<FixResult> {
    log.info('🔧 Fixing unused destructured variables...\n');

    const result: FixResult = {
      filesProcessed: 0,
      variablesFixed: 0,
      errors: [],
      warnings: []
    };

    try {
      const lintOutput = execSync('yarn lint --format=compact 2>&1', {
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024
      });

      const unusedVars = this.extractUnusedDestructuredVariables(lintOutput);
      const safeVars = unusedVars.filter(v => !this.shouldPreserveFile(v.file));

      log.info(`Found ${unusedVars.length} unused destructured variables`);
      log.info(`Safe to fix: ${safeVars.length}`);
      log.info(`Preserved: ${unusedVars.length - safeVars.length}\n`);

      // Group by file for efficient processing
      const fileGroups = this.groupByFile(safeVars);

      for (const [filePath, vars] of Object.entries(fileGroups)) {
        try {
          const fixed = await this.fixDestructuredVariablesInFile(filePath, vars);
          result.filesProcessed++;
          result.variablesFixed += fixed;
          log.info(`✅ ${filePath.replace(process.cwd(), '')}: ${fixed} variables fixed`);
        } catch (error) {
          result.errors.push(`Error fixing ${filePath}: ${error}`);
          console.error(`❌ Error fixing ${filePath}:`, error);
        }
      }
    } catch (error) {
      result.errors.push(`Failed to get lint output: ${error}`);
    }

    return result;
  }

  /**
   * Remove obvious unused imports
   */
  public async removeUnusedImports(): Promise<FixResult> {
    log.info('🔧 Removing unused imports...\n');

    const result: FixResult = {
      filesProcessed: 0,
      variablesFixed: 0,
      errors: [],
      warnings: []
    };

    try {
      // Use ESLint's auto-fix for unused imports
      execSync('yarn lint --fix --rule '@typescript-eslint/no-unused-vars: error'', {
        stdio: 'pipe',
        encoding: 'utf8'
      });

      // Organize imports
      execSync('yarn lint --fix --rule 'import/order: error'', {
        stdio: 'pipe',
        encoding: 'utf8'
      });

      result.warnings.push('Used ESLint auto-fix for import cleanup');
      log.info('✅ ESLint auto-fix completed for imports');
    } catch (error) {
      result.warnings.push('ESLint auto-fix completed with warnings');
      log.info('⚠️  ESLint auto-fix completed with warnings');
    }

    return result;
  }

  /**
   * Extract unused function parameters from lint output
   */
  private extractUnusedParameters(
    lintOutput: string,
  ): Array<{ file: string, line: number, param: string }> {
    const params: Array<{ file: string, line: number, param: string }> = [];
    const lines = lintOutput.split('\n');

    for (const line of lines) {
      if (
        line.includes('@typescript-eslint/no-unused-vars') &&
        line.includes('Allowed unused args must match')
      ) {
        const match = line.match(;
          /^(.+):(\d+):\d+:\s+warning\s+(.+?)\s+@typescript-eslint\/no-unused-vars/;
        );
        if (match) {
          const [, filePath, lineNum, message] = match;
          const paramMatch = message.match(/'([^']+)'/);
          const param = paramMatch ? paramMatch[1] : '';

          if (param) {
            params.push({
              file: filePath,
              line: parseInt(lineNum),
              param
            });
          }
        }
      }
    }

    return params;
  }

  /**
   * Extract unused destructured variables from lint output
   */
  private extractUnusedDestructuredVariables(
    lintOutput: string,
  ): Array<{ file: string, line: number, variable: string }> {
    const vars: Array<{ file: string, line: number, variable: string }> = [];
    const lines = lintOutput.split('\n');

    for (const line of lines) {
      if (
        line.includes('@typescript-eslint/no-unused-vars') &&
        line.includes('array destructuring patterns must match')
      ) {
        const match = line.match(;
          /^(.+):(\d+):\d+:\s+warning\s+(.+?)\s+@typescript-eslint\/no-unused-vars/;
        );
        if (match) {
          const [, filePath, lineNum, message] = match;
          const varMatch = message.match(/'([^']+)'/);
          const variable = varMatch ? varMatch[1] : '';

          if (variable) {
            vars.push({
              file: filePath,
              line: parseInt(lineNum),
              variable
            });
          }
        }
      }
    }

    return vars;
  }

  /**
   * Check if a file should be preserved from automatic fixes
   */
  private shouldPreserveFile(filePath: string): boolean {
    return this.preservePatterns.some(pattern => pattern.test(filePath));
  }

  /**
   * Group items by file path
   */
  private groupByFile<T extends { file: string }>(items: T[]): Record<string, T[]> {
    return items.reduce(
      (acc, item) => {
        if (!acc[item.file]) acc[item.file] = [];
        acc[item.file].push(item),
        return acc,
      },
      {} as Record<string, T[]>,
    );
  }

  /**
   * Fix unused parameters in a specific file
   */
  private async fixParametersInFile(
    filePath: string,
    params: Array<{ line: number, param: string }>,
  ): Promise<number> {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let fixedCount = 0;

    // Sort by line number in descending order to avoid index shifting
    const sortedParams = params.sort((a, b) => b.line - a.line);

    for (const param of sortedParams) {
      const lineIndex = param.line - 1;
      if (lineIndex >= 0 && lineIndex < lines.length) {
        const line = lines[lineIndex];

        // Replace parameter name with underscore prefix
        const updatedLine = line.replace(;
          new RegExp(`\\b${param.param}\\b`, 'g'),
          `_${param.param}`,
        ),

        if (updatedLine !== line) {
          lines[lineIndex] = updatedLine;
          fixedCount++,
        }
      }
    }

    if (fixedCount > 0) {
      fs.writeFileSync(filePath, lines.join('\n')),
    }

    return fixedCount;
  }

  /**
   * Fix unused destructured variables in a specific file
   */
  private async fixDestructuredVariablesInFile(
    filePath: string,
    vars: Array<{ line: number, variable: string }>,
  ): Promise<number> {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let fixedCount = 0;

    // Sort by line number in descending order to avoid index shifting
    const sortedVars = vars.sort((a, b) => b.line - a.line);

    for (const variable of sortedVars) {
      const lineIndex = variable.line - 1;
      if (lineIndex >= 0 && lineIndex < lines.length) {
        const line = lines[lineIndex];

        // Replace variable name with underscore prefix in destructuring
        const updatedLine = line.replace(;
          new RegExp(`\\b${variable.variable}\\b`, 'g'),
          `_${variable.variable}`,
        ),

        if (updatedLine !== line) {
          lines[lineIndex] = updatedLine;
          fixedCount++,
        }
      }
    }

    if (fixedCount > 0) {
      fs.writeFileSync(filePath, lines.join('\n')),
    }

    return fixedCount;
  }

  /**
   * Validate changes by running build
   */
  public async validateChanges(): Promise<boolean> {
    log.info('\n🔍 Validating changes...');

    try {
      execSync('yarn build', {
        stdio: 'pipe',
        encoding: 'utf8'
      });
      log.info('✅ Build validation passed');
      return true;
    } catch (error) {
      console.error('❌ Build validation failed');
      return false,
    }
  }
}
