/**
 * Automated Unused Variable Processing System
 *
 * This service systematically processes unused variable warnings while:
 * - Preserving critical astrological calculation variables
 * - Safely prefixing intentionally unused variables with underscore
 * - Handling function parameters appropriately
 * - Maintaining code functionality and domain logic
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import { log } from '@/services/LoggingService';

interface UnusedVariableIssue {
  file: string;
  line: number;
  column: number;
  variableName: string;
  type: 'variable' | 'parameter' | 'import' | 'type';
  context: string;
  isCritical: boolean;
  canAutoFix: boolean;
}

interface ProcessingResult {
  totalIssues: number;
  processed: number;
  skipped: number;
  errors: string[];
  preservedCritical: string[];
}

export class UnusedVariableProcessor {
  private criticalPatterns = [
    // Astrological calculation patterns
    /planetary|astro|zodiac|element|fire|water|earth|air/i,
    /mercury|venus|mars|jupiter|saturn|uranus|neptune|pluto/i,
    /aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces/i,
    /transit|retrograde|conjunction|opposition|trine|square/i,
    /lunar|solar|eclipse|equinox|solstice/i,

    // Campaign system patterns
    /campaign|progress|metrics|intelligence|safety/i,
    /validation|rollback|checkpoint|threshold/i,

    // Mathematical constants
    /PI|EULER|GOLDEN_RATIO|PHI|SQRT/i,
    /DEGREE|RADIAN|MINUTE|SECOND/i,

    // Fallback data patterns
    /fallback|default|backup|cache/i,
    /positions|coordinates|ephemeris/i,
  ];

  private testPatterns = [
    /mock|stub|test|spec|fixture/i,
    /describe|it|expect|beforeEach|afterEach/i,
  ];

  async processUnusedVariables(): Promise<ProcessingResult> {
    log.info('🔍 Analyzing unused variable warnings...');

    const issues = await this.detectUnusedVariables();
    const result: ProcessingResult = {
      totalIssues: issues.length,
      processed: 0,
      skipped: 0,
      errors: [],
      preservedCritical: [],
    };

    log.info(`Found ${issues.length} unused variable issues`);

    // Group issues by file for efficient processing
    const issuesByFile = this.groupIssuesByFile(issues);

    for (const [filePath, fileIssues] of Object.entries(issuesByFile)) {
      try {
        const processed = await this.processFileIssues(filePath, fileIssues);
        result.processed += processed.fixed;
        result.skipped += processed.skipped;
        result.preservedCritical.push(...processed.preserved);
      } catch (error) {
        result.errors.push(`Error processing ${filePath}: ${(error as Error).message}`);
      }
    }

    return result;
  }

  private async detectUnusedVariables(): Promise<UnusedVariableIssue[]> {
    try {
      const lintOutput = execSync('yarn lint --format=json', {
        encoding: 'utf8',
        stdio: 'pipe',
      });

      const lintResults = JSON.parse(lintOutput);
      const issues: UnusedVariableIssue[] = [];

      for (const result of lintResults) {
        if (!result.messages) continue;

        for (const message of result.messages) {
          if (message.ruleId === '@typescript-eslint/no-unused-vars') {
            const issue = this.parseUnusedVariableMessage(result.filePath, message);
            if (issue) {
              issues.push(issue);
            }
          }
        }
      }

      return issues;
    } catch (error) {
      // Fallback to text parsing if JSON format fails
      return this.parseUnusedVariablesFromText();
    }
  }

  private parseUnusedVariablesFromText(): UnusedVariableIssue[] {
    try {
      const lintOutput = execSync('yarn lint 2>&1 | grep "no-unused-vars"', {
        encoding: 'utf8',
        stdio: 'pipe',
      });

      const lines = lintOutput.split('\n').filter(line => line.trim());
      const issues: UnusedVariableIssue[] = [];

      for (const line of lines) {
        const issue = this.parseUnusedVariableLine(line);
        if (issue) {
          issues.push(issue);
        }
      }

      return issues;
    } catch (error) {
      console.warn('Could not parse unused variables:', (error as Error).message);
      return [];
    }
  }

  private parseUnusedVariableMessage(filePath: string, message: any): UnusedVariableIssue | null {
    const variableMatch = message.message.match(
      /'([^']+)' is (?:defined but never used|assigned a value but never used)/,
    );
    if (!variableMatch) return null;

    const variableName = variableMatch[1];
    const isCritical = this.isCriticalVariable(variableName, filePath);
    const isTest = this.isTestFile(filePath);

    return {
      file: filePath,
      line: message.line,
      column: message.column,
      variableName,
      type: this.determineVariableType(message.message),
      context: message.message,
      isCritical,
      canAutoFix: !isCritical && (isTest || this.canSafelyPrefix(variableName)),
    };
  }

  private parseUnusedVariableLine(line: string): UnusedVariableIssue | null {
    // Parse format: "file.ts:line:col warning 'variable' is defined but never used"
    const match = line.match(/^(.+):(\d+):(\d+)\s+warning\s+'([^']+)' is (.+)/);
    if (!match) return null;

    const [, filePath, lineStr, colStr, variableName, context] = match;
    const isCritical = this.isCriticalVariable(variableName, filePath);
    const isTest = this.isTestFile(filePath);

    return {
      file: filePath,
      line: parseInt(lineStr),
      column: parseInt(colStr),
      variableName,
      type: this.determineVariableType(context),
      context,
      isCritical,
      canAutoFix: !isCritical && (isTest || this.canSafelyPrefix(variableName)),
    };
  }

  private isCriticalVariable(variableName: string, filePath: string): boolean {
    // Check if variable matches critical patterns
    const isCriticalName = this.criticalPatterns.some(
      pattern => pattern.test(variableName) || pattern.test(filePath),
    );

    // Check if it's in astrological calculation files
    const isAstrologicalFile = /calculations|astro|planetary|elemental/i.test(filePath);

    // Check if it's a mathematical constant
    const isMathConstant = /^[A-Z_]+$/.test(variableName) && variableName.length > 2;

    return isCriticalName || (isAstrologicalFile && isMathConstant);
  }

  private isTestFile(filePath: string): boolean {
    return (
      /\.(test|spec)\.(ts|tsx|js|jsx)$/.test(filePath) ||
      /__tests__/.test(filePath) ||
      /test/.test(filePath)
    );
  }

  private canSafelyPrefix(variableName: string): boolean {
    // Don't prefix if already prefixed
    if (variableName.startsWith('_')) return false;

    // Don't prefix React hooks or special patterns
    if (variableName.startsWith('use') || variableName.startsWith('handle')) return false;

    // Don't prefix component names
    if (/^[A-Z]/.test(variableName)) return false;

    return true;
  }

  private determineVariableType(context: string): 'variable' | 'parameter' | 'import' | 'type' {
    if (context.includes('parameter')) return 'parameter';
    if (context.includes('import')) return 'import';
    if (context.includes('type')) return 'type';
    return 'variable';
  }

  private groupIssuesByFile(issues: UnusedVariableIssue[]): Record<string, UnusedVariableIssue[]> {
    const grouped: Record<string, UnusedVariableIssue[]> = {};

    for (const issue of issues) {
      if (!grouped[issue.file]) {
        grouped[issue.file] = [];
      }
      grouped[issue.file].push(issue);
    }

    return grouped;
  }

  private async processFileIssues(
    filePath: string,
    issues: UnusedVariableIssue[],
  ): Promise<{
    fixed: number;
    skipped: number;
    preserved: string[];
  }> {
    if (!fs.existsSync(filePath)) {
      return { fixed: 0, skipped: issues.length, preserved: [] };
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let modified = false;
    let fixed = 0;
    let skipped = 0;
    const preserved: string[] = [];

    // Sort issues by line number (descending) to avoid line number shifts
    const sortedIssues = issues.sort((a, b) => b.line - a.line);

    for (const issue of sortedIssues) {
      if (issue.isCritical) {
        preserved.push(`${issue.variableName} in ${filePath}:${issue.line}`);
        skipped++;
        continue;
      }

      if (!issue.canAutoFix) {
        skipped++;
        continue;
      }

      const lineIndex = issue.line - 1;
      if (lineIndex < 0 || lineIndex >= lines.length) {
        skipped++;
        continue;
      }

      const originalLine = lines[lineIndex];
      const modifiedLine = this.prefixUnusedVariable(originalLine, issue);

      if (modifiedLine !== originalLine) {
        lines[lineIndex] = modifiedLine;
        modified = true;
        fixed++;
        log.info(`  ✓ Prefixed ${issue.variableName} in ${path.basename(filePath)}:${issue.line}`);
      } else {
        skipped++;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, lines.join('\n'));
    }

    return { fixed, skipped, preserved };
  }

  private prefixUnusedVariable(line: string, issue: UnusedVariableIssue): string {
    const { variableName, type } = issue;

    switch (type) {
      case 'parameter':
        return this.prefixParameter(line, variableName);
      case 'variable':
        return this.prefixVariable(line, variableName);
      case 'import':
        return this.prefixImport(line, variableName);
      case 'type':
        return this.prefixType(line, variableName);
      default:
        return line;
    }
  }

  private prefixParameter(line: string, paramName: string): string {
    // Handle function parameters: (param) => or function(param)
    const patterns = [
      new RegExp(`\\b${paramName}\\b(?=\\s*[,)])`, 'g'),
      new RegExp(`\\b${paramName}\\b(?=\\s*:)`, 'g'),
    ];

    for (const pattern of patterns) {
      if (pattern.test(line)) {
        return line.replace(pattern, `_${paramName}`);
      }
    }

    return line;
  }

  private prefixVariable(line: string, varName: string): string {
    // Handle variable declarations: const/let/var varName
    const patterns = [
      new RegExp(`\\b(const|let|var)\\s+${varName}\\b`, 'g'),
      new RegExp(`\\b${varName}\\b(?=\\s*=)`, 'g'),
      new RegExp(`\\{\\s*${varName}\\s*\\}`, 'g'), // Destructuring
      new RegExp(`\\[\\s*${varName}\\s*\\]`, 'g'), // Array destructuring
    ];

    for (const pattern of patterns) {
      if (pattern.test(line)) {
        return line.replace(new RegExp(`\\b${varName}\\b`, 'g'), `_${varName}`);
      }
    }

    return line;
  }

  private prefixImport(line: string, importName: string): string {
    // Handle imports: import { name } from or import name from
    const patterns = [
      new RegExp(`\\{\\s*${importName}\\s*\\}`, 'g'),
      new RegExp(`import\\s+${importName}\\b`, 'g'),
      new RegExp(`\\b${importName}\\s*,`, 'g'),
    ];

    for (const pattern of patterns) {
      if (pattern.test(line)) {
        return line.replace(new RegExp(`\\b${importName}\\b`, 'g'), `_${importName}`);
      }
    }

    return line;
  }

  private prefixType(line: string, typeName: string): string {
    // Handle type definitions: type Name = or interface Name
    const patterns = [
      new RegExp(`\\b(type|interface)\\s+${typeName}\\b`, 'g'),
      new RegExp(`\\b${typeName}\\b(?=\\s*=)`, 'g'),
    ];

    for (const pattern of patterns) {
      if (pattern.test(line)) {
        return line.replace(new RegExp(`\\b${typeName}\\b`, 'g'), `_${typeName}`);
      }
    }

    return line;
  }

  async validateChanges(): Promise<boolean> {
    try {
      log.info('🔍 Validating changes...');

      // Check if TypeScript compilation still works
      execSync('yarn tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
      log.info('  ✓ TypeScript compilation successful');

      // Check if build still works
      execSync('yarn build', { stdio: 'pipe' });
      log.info('  ✓ Build successful');

      return true;
    } catch (error) {
      console.error('❌ Validation failed:', (error as Error).message);
      return false;
    }
  }

  async generateReport(result: ProcessingResult): Promise<void> {
    log.info('\n📊 Unused Variable Processing Report');
    log.info('=====================================');
    log.info(`Total issues found: ${result.totalIssues}`);
    log.info(`Successfully processed: ${result.processed}`);
    log.info(`Skipped (safe): ${result.skipped}`);
    log.info(`Critical variables preserved: ${result.preservedCritical.length}`);

    if (result.errors.length > 0) {
      log.info(`\n❌ Errors encountered: ${result.errors.length}`);
      result.errors.forEach(error => log.info(`  - ${error}`));
    }

    if (result.preservedCritical.length > 0) {
      log.info('\n🔒 Critical variables preserved:');
      result.preservedCritical.slice(0, 10).forEach(item => log.info(`  - ${item}`));
      if (result.preservedCritical.length > 10) {
        log.info(`  ... and ${result.preservedCritical.length - 10} more`);
      }
    }

    const reductionPercentage =
      result.totalIssues > 0 ? ((result.processed / result.totalIssues) * 100).toFixed(1) : '0';

    log.info(`\n✨ Reduction achieved: ${reductionPercentage}%`);
  }
}
