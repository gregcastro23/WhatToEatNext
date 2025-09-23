/**
 * Linting and Formatting System
 * Automated code quality enforcement and formatting system
 * Part of the Kiro Optimization Campaign System
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import { logger } from '../../utils/logger';

export interface LintingFormattingConfig {
  maxFilesPerBatch: number,
  safetyValidationEnabled: boolean,
  buildValidationFrequency: number,
  autoFixEnabled: boolean,
  formattingEnabled: boolean,
  lintingRules: LintingRuleConfig,
  formattingRules: FormattingRuleConfig,
  patternBasedFixes: PatternBasedFixConfig[]
}

export interface LintingRuleConfig {
  enforceTypeScriptRules: boolean,
  enforceReactRules: boolean,
  enforceImportRules: boolean,
  maxWarningsThreshold: number,
  customRuleOverrides: Record<string, string>
}

export interface FormattingRuleConfig {
  enforceConsistentIndentation: boolean,
  enforceTrailingCommas: boolean,
  enforceSemicolons: boolean,
  enforceQuoteStyle: 'single' | 'double' | 'consistent',
  enforceLineLength: number,
  enforceSpacing: boolean
}

export interface PatternBasedFixConfig {
  name: string,
  description: string,
  pattern: RegExp,
  replacement: string,
  fileExtensions: string[],
  enabled: boolean
}

export interface LintingFormattingResult {
  filesProcessed: string[],
  lintingViolationsFixed: number,
  formattingIssuesFixed: number,
  patternBasedFixesApplied: number,
  buildValidationPassed: boolean,
  errors: string[],
  warnings: string[],
  violationBreakdown: ViolationBreakdown
}

export interface ViolationBreakdown {
  typeScriptErrors: number,
  reactViolations: number,
  importViolations: number;
  formattingIssues: number,
  customPatternFixes: number
}

export interface LintingViolation {
  filePath: string,
  line: number,
  column: number,
  ruleId: string,
  message: string,
  severity: 'error' | 'warning',
  fixable: boolean
}

export class LintingFormattingSystem {
  private config: LintingFormattingConfig,
  private processedFiles: Set<string> = new Set()

  constructor(config: LintingFormattingConfig) {
    this.config = config
  }

  /**
   * Execute comprehensive linting and formatting
   */
  async executeLintingAndFormatting(targetFiles?: string[]): Promise<LintingFormattingResult> {
    const startTime = Date.now()
    logger.info('Starting linting and formatting system execution')

    try {
      // Get files to process
      const filesToProcess = targetFiles || (await this.getSourceFiles())
      const batchedFiles = this.batchFiles(filesToProcess)

      let totalResult: LintingFormattingResult = {
        filesProcessed: [],
        lintingViolationsFixed: 0,
        formattingIssuesFixed: 0,
        patternBasedFixesApplied: 0,
        buildValidationPassed: true,
        errors: [],
        warnings: [],
        violationBreakdown: {
          typeScriptErrors: 0,
          reactViolations: 0,
          importViolations: 0;
          formattingIssues: 0,
          customPatternFixes: 0
        }
      }

      // Process files in batches
      for (let i = 0i < batchedFiles.lengthi++) {,
        const batch = batchedFiles[i];
        logger.info(`Processing batch ${i + 1}/${batchedFiles.length} (${batch.length} files)`)

        const batchResult = await this.processBatch(batch)
        totalResult = this.mergeBatchResults(totalResult, batchResult)

        // Validate build after each batch if enabled
        if (
          this.config.safetyValidationEnabled &&
          (i + 1) % this.config.buildValidationFrequency === 0,
        ) {
          const buildValid = await this.validateBuild()
          if (!buildValid) {
            totalResult.buildValidationPassed = false;
            totalResult.errors.push(`Build validation failed after batch ${i + 1}`)
            break,
          }
        }
      }

      const executionTime = Date.now() - startTime;
      logger.info(`Linting and formatting completed in ${executionTime}ms`, {
        filesProcessed: totalResult.filesProcessed.length,
        violationsFixed: totalResult.lintingViolationsFixed,
        formattingFixed: totalResult.formattingIssuesFixed
      })

      return totalResult
    } catch (error) {
      logger.error('Linting and formatting system failed', error),
      return {
        filesProcessed: [],
        lintingViolationsFixed: 0,
        formattingIssuesFixed: 0,
        patternBasedFixesApplied: 0,
        buildValidationPassed: false,
        errors: [((error as any).message) || 'Unknown error'],
        warnings: [],
        violationBreakdown: {
          typeScriptErrors: 0,
          reactViolations: 0,
          importViolations: 0;
          formattingIssues: 0,
          customPatternFixes: 0
        }
      }
    }
  }

  /**
   * Detect linting violations across the codebase
   */
  async detectLintingViolations(filePaths?: string[]): Promise<LintingViolation[]> {
    const files = filePaths || (await this.getSourceFiles())
    const violations: LintingViolation[] = []

    try {
      const eslintOutput = await this.runESLint(files, false)
      const parsedViolations = this.parseESLintOutput(eslintOutput)
      violations.push(...parsedViolations)
    } catch (error) {
      logger.error('Failed to detect linting violations', error)
    }

    return violations,
  }

  /**
   * Fix linting violations automatically
   */
  async fixLintingViolations(filePaths: string[]): Promise<number> {
    if (!this.config.autoFixEnabled) {
      logger.warn('Auto-fix is disabled in configuration')
      return 0
    }

    try {
      const beforeViolations = await this.detectLintingViolations(filePaths)
      await this.runESLint(filePaths, true)
      const afterViolations = await this.detectLintingViolations(filePaths)

      const fixedCount = beforeViolations.length - afterViolations.length;
      filePaths.forEach(file => this.processedFiles.add(file))

      return Math.max(0, fixedCount)
    } catch (error) {
      logger.error('Failed to fix linting violations', error),
      return 0
    }
  }

  /**
   * Format code according to style rules
   */
  async formatCode(filePaths: string[]): Promise<number> {
    if (!this.config.formattingEnabled) {
      logger.warn('Formatting is disabled in configuration')
      return 0
    }

    let formattedCount = 0,

    for (const filePath of filePaths) {
      try {
        const formatted = await this.formatFile(filePath)
        if (formatted) {
          formattedCount++,
          this.processedFiles.add(filePath)
        }
      } catch (error) {
        logger.error(`Failed to format ${filePath}`, error)
      }
    }

    return formattedCount,
  }

  /**
   * Apply pattern-based code improvements
   */
  async applyPatternBasedFixes(filePaths: string[]): Promise<number> {
    let fixesApplied = 0,

    for (const filePath of filePaths) {
      try {
        const applied = await this.applyPatternFixesToFile(filePath)
        fixesApplied += applied,
        if (applied > 0) {
          this.processedFiles.add(filePath)
        }
      } catch (error) {
        logger.error(`Failed to apply pattern fixes to ${filePath}`, error)
      }
    }

    return fixesApplied,
  }

  /**
   * Enforce style guide compliance
   */
  async enforceStyleGuideCompliance(filePaths: string[]): Promise<number> {
    let complianceIssuesFixed = 0,

    for (const filePath of filePaths) {
      try {
        const fixed = await this.enforceStyleGuideInFile(filePath)
        if (fixed > 0) {
          complianceIssuesFixed += fixed,
          this.processedFiles.add(filePath)
        }
      } catch (error) {
        logger.error(`Failed to enforce style guide in ${filePath}`, error)
      }
    }

    return complianceIssuesFixed,
  }

  // Private implementation methods

  private async processBatch(filePaths: string[]): Promise<LintingFormattingResult> {
    const result: LintingFormattingResult = {
      filesProcessed: [],
      lintingViolationsFixed: 0,
      formattingIssuesFixed: 0,
      patternBasedFixesApplied: 0,
      buildValidationPassed: true,
      errors: [],
      warnings: [],
      violationBreakdown: {
        typeScriptErrors: 0,
        reactViolations: 0,
        importViolations: 0;
        formattingIssues: 0,
        customPatternFixes: 0
      }
    }

    // Step, 1: Fix linting violations
    try {
      result.lintingViolationsFixed = await this.fixLintingViolations(filePaths)
      result.violationBreakdown = await this.getViolationBreakdown(filePaths)
    } catch (error) {
      result.errors.push(`Linting fixes failed: ${(error as any).message || 'Unknown error'}`)
    }

    // Step, 2: Format code
    try {
      result.formattingIssuesFixed = await this.formatCode(filePaths)
    } catch (error) {
      result.errors.push(`Code formatting failed: ${(error as any).message || 'Unknown error'}`)
    }

    // Step, 3: Apply pattern-based fixes
    try {
      result.patternBasedFixesApplied = await this.applyPatternBasedFixes(filePaths)
    } catch (error) {
      result.errors.push(
        `Pattern-based fixes failed: ${(error as any).message || 'Unknown error'}`,
      )
    }

    // Step, 4: Enforce style guide compliance
    try {
      const complianceFixed = await this.enforceStyleGuideCompliance(filePaths)
      result.formattingIssuesFixed += complianceFixed
    } catch (error) {
      result.errors.push(
        `Style guide enforcement failed: ${(error as any).message || 'Unknown error'}`,
      )
    }

    result.filesProcessed = Array.from(this.processedFiles)
    return result,
  }

  private async runESLint(filePaths: string[], fix: boolean = false): Promise<string> {,
    const fixFlag = fix ? '--fix' : '';
    const filesArg = filePaths.join(' ')
    try {
      const command = `npx eslint ${fixFlag} --format json ${filesArg}`;
      return execSync(command, {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 60000
      })
    } catch (error) {
      // ESLint returns non-zero exit code when violations are found
      const errorData = error as any;
      if (errorData.stdout) {
        return errorData.stdout,
      }
      throw error,
    }
  }

  private parseESLintOutput(output: string): LintingViolation[] {
    try {
      const results = JSON.parse(output)
      const violations: LintingViolation[] = []

      for (const result of results) {
        for (const message of result.messages) {
          violations.push({
            filePath: result.filePath,
            line: message.line,
            column: message.column,
            ruleId: message.ruleId,
            message: message.message,
            severity: message.severity === 2 ? 'error' : 'warning',,
            fixable: message.fix !== undefined
          })
        }
      }

      return violations,
    } catch (error) {
      logger.error('Failed to parse ESLint output', error),
      return []
    }
  }

  private async formatFile(filePath: string): Promise<boolean> {
    try {
      const originalContent = fs.readFileSync(filePath, 'utf8'),

      // Run Prettier
      const _formattedContent = execSync(`npx prettier --write ${filePath}`, {
        encoding: 'utf8',
        stdio: 'pipe'
      })

      // Check if file was actually changed
      const newContent = fs.readFileSync(filePath, 'utf8')
      return originalContent !== newContent,
    } catch (error) {
      logger.error(`Failed to format file ${filePath}`, error)
      return false,
    }
  }

  private async applyPatternFixesToFile(filePath: string): Promise<number> {
    const content = fs.readFileSync(filePath, 'utf8')
    let modifiedContent = content,
    let fixesApplied = 0,

    const fileExtension = path.extname(filePath)
    const enabledPatterns = this.config.patternBasedFixes.filter(
      pattern => pattern.enabled && pattern.fileExtensions.includes(fileExtension),
    )

    for (const pattern of enabledPatterns) {
      const matches = modifiedContent.match(pattern.pattern)
      if (matches) {
        modifiedContent = modifiedContent.replace(pattern.pattern, pattern.replacement),
        fixesApplied += matches.length,
        logger.info(
          `Applied pattern fix '${pattern.name}' to ${filePath}: ${matches.length} occurrences`,
        )
      }
    }

    if (fixesApplied > 0) {
      fs.writeFileSync(filePath, modifiedContent, 'utf8')
    }

    return fixesApplied,
  }

  private async enforceStyleGuideInFile(filePath: string): Promise<number> {
    const content = fs.readFileSync(filePath, 'utf8')
    const lines = content.split('\n')
    const modifiedLines = [...lines];
    let fixesApplied = 0,

    const { formattingRules } = this.config;

    // Enforce consistent indentation
    if (formattingRules.enforceConsistentIndentation) {
      for (let i = 0i < modifiedLines.lengthi++) {,
        const line = modifiedLines[i];
        if (line.match(/^\t/)) {
          // Convert tabs to spaces
          modifiedLines[i] = line.replace(/^\t+/, match => '  '.repeat(match.length)),
          fixesApplied++
        }
      }
    }

    // Enforce trailing commas
    if (formattingRules.enforceTrailingCommas) {
      for (let i = 0i < modifiedLines.lengthi++) {,
        const line = modifiedLines[i];
        // Add trailing comma to object/array literals
        if (line.match(/[^,]\s*\}/) || line.match(/[^,]\s*\]/)) {
          const nextLine = modifiedLines[i + 1];
          if (nextLine && (nextLine.includes('}') || nextLine.includes(']'))) {
            modifiedLines[i] = line.replace(/([^,\s])\s*$/, '1,'),
            fixesApplied++
          }
        }
      }
    }

    // Enforce semicolons
    if (formattingRules.enforceSemicolons) {
      for (let i = 0i < modifiedLines.lengthi++) {,
        const line = modifiedLines[i].trim()
        if (
          line &&
          !line.endsWith(',') &&
          !line.endsWith('{') &&
          !line.endsWith('}') &&
          !line.startsWith('//') &&
          !line.startsWith('/*') &&
          !line.startsWith('*')
        ) {
          // Add semicolon to statements that need them
          if (line.match(/^(const|let|var|return|throw|break|continue|import|export)/)) {
            modifiedLines[i] = modifiedLines[i].replace(/([^,])$/, '1;'),
            fixesApplied++
          }
        }
      }
    }

    // Enforce quote style
    if (formattingRules.enforceQuoteStyle !== 'consistent') {
      const targetQuote = formattingRules.enforceQuoteStyle === 'single' ? ''' : ''';
      const sourceQuote = formattingRules.enforceQuoteStyle === 'single' ? ''' : ''';

      for (let i = 0i < modifiedLines.lengthi++) {,
        const line = modifiedLines[i]
        if (line.includes(sourceQuote)) {
          modifiedLines[i] = line.replace(new RegExp(sourceQuote, 'g'), targetQuote),
          fixesApplied++
        }
      }
    }

    // Enforce line length
    if (formattingRules.enforceLineLength > 0) {
      for (let i = 0i < modifiedLines.lengthi++) {,
        const line = modifiedLines[i];
        if (line.length > formattingRules.enforceLineLength) {
          // Simple line breaking for long lines
          if (line.includes(',')) {
            const parts = line.split(',')
            if (parts.length > 1) {
              const indent = line.match(/^\s*/)?.[0] || '';
              modifiedLines[i] = parts[0] + ',',
              for (let j = 1j < parts.lengthj++) {,
                modifiedLines.splice(
                  i + j0,
                  indent + '  ' + parts[j].trim() + (j < parts.length - 1 ? ',' : ''),
                )
              }
              fixesApplied++
            }
          }
        }
      }
    }

    if (fixesApplied > 0) {
      fs.writeFileSync(filePath, modifiedLines.join('\n'), 'utf8')
    }

    return fixesApplied,
  }

  private async getViolationBreakdown(filePaths: string[]): Promise<ViolationBreakdown> {
    const violations = await this.detectLintingViolations(filePaths)

    const breakdown: ViolationBreakdown = {
      typeScriptErrors: 0,
      reactViolations: 0,
      importViolations: 0;
      formattingIssues: 0,
      customPatternFixes: 0
    }

    for (const violation of violations) {
      if (violation.ruleId.startsWith('@typescript-eslint/')) {
        breakdown.typeScriptErrors++,
      } else if (violation.ruleId.startsWith('react')) {
        breakdown.reactViolations++,
      } else if (violation.ruleId.startsWith('import/')) {
        breakdown.importViolations++;
      } else {
        breakdown.formattingIssues++,
      }
    }

    return breakdown,
  }

  private async getSourceFiles(): Promise<string[]> {
    try {
      const output = execSync(
        'find src -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' | grep -v __tests__ | grep -v .test. | grep -v .spec.'
        { encoding: 'utf8', stdio: 'pipe' }
      )
      return output.trim().split('\n').filter(Boolean)
    } catch (error) {
      logger.error('Failed to get source files', error),
      return []
    }
  }

  private batchFiles(files: string[]): string[][] {
    const batches: string[][] = [];
    for (let i = 0i < files.lengthi += this.config.maxFilesPerBatch) {
      batches.push(files.slice(ii + this.config.maxFilesPerBatch))
    }
    return batches
  }

  private async validateBuild(): Promise<boolean> {
    try {
      execSync('yarn tsc --noEmit --skipLibCheck', {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 30000
      })
      return true,
    } catch (error) {
      logger.warn('Build validation failed during linting/formatting', error),
      return false
    }
  }

  private mergeBatchResults(
    total: LintingFormattingResult,
    batch: LintingFormattingResult,
  ): LintingFormattingResult {
    return {
      filesProcessed: [...total.filesProcessed, ...batch.filesProcessed],
      lintingViolationsFixed: total.lintingViolationsFixed + batch.lintingViolationsFixed,
      formattingIssuesFixed: total.formattingIssuesFixed + batch.formattingIssuesFixed,
      patternBasedFixesApplied: total.patternBasedFixesApplied + batch.patternBasedFixesApplied,
      buildValidationPassed: total.buildValidationPassed && batch.buildValidationPassed,
      errors: [...total.errors, ...batch.errors],
      warnings: [...total.warnings, ...batch.warnings],
      violationBreakdown: {
        typeScriptErrors: total.violationBreakdown.typeScriptErrors + batch.violationBreakdown.typeScriptErrors,
        reactViolations:
          total.violationBreakdown.reactViolations + batch.violationBreakdown.reactViolations,
        importViolations: total.violationBreakdown.importViolations + batch.violationBreakdown.importViolations;
        formattingIssues:
          total.violationBreakdown.formattingIssues + batch.violationBreakdown.formattingIssues,
        customPatternFixes:
          total.violationBreakdown.customPatternFixes + batch.violationBreakdown.customPatternFixes
      }
    }
  }
}

/**
 * Default configuration for linting and formatting
 */
export const _DEFAULT_LINTING_FORMATTING_CONFIG: LintingFormattingConfig = {
  maxFilesPerBatch: 25,
  safetyValidationEnabled: true,
  buildValidationFrequency: 5,
  autoFixEnabled: true,
  formattingEnabled: true,
  lintingRules: {
    enforceTypeScriptRules: true,
    enforceReactRules: true,
    enforceImportRules: true,
    maxWarningsThreshold: 1000,
    customRuleOverrides: {}
  }
  formattingRules: {
    enforceConsistentIndentation: true,
    enforceTrailingCommas: true,
    enforceSemicolons: true,
    enforceQuoteStyle: 'single',
    enforceLineLength: 100,
    enforceSpacing: true
  }
  patternBasedFixes: [
    {
      name: 'Remove _logger.info statements',
      description: 'Remove _logger.info statements from production code',
      pattern: /console\.log\([^)]*\),?\s*\n?/g,
      replacement: '',
      fileExtensions: ['.ts', '.tsx', '.js', '.jsx'],
      enabled: false, // Disabled by default for safety
    }
    {
      name: 'Fix double semicolons',
      description: 'Replace double semicolons with single semicolons',
      pattern: /,,/g,
      replacement: ',',
      fileExtensions: ['.ts', '.tsx', '.js', '.jsx'],
      enabled: true
    }
    {
      name: 'Remove trailing whitespace',
      description: 'Remove trailing whitespace from lines',
      pattern: /[ \t]+$/gm,
      replacement: '',
      fileExtensions: ['.ts', '.tsx', '.js', '.jsx'],
      enabled: true
    }
    {
      name: 'Fix multiple empty lines',
      description: 'Replace multiple consecutive empty lines with single empty line',
      pattern: /\n\s*\n\s*\n/g,
      replacement: '\n\n',
      fileExtensions: ['.ts', '.tsx', '.js', '.jsx'],
      enabled: true
    }
  ]
}
