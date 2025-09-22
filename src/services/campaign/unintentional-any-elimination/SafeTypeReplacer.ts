/**
 * Safe Type Replacer
 * Performs safe replacements of unintentional `any` types with more specific types
 *
 * Core Features: * - Atomic replacement operations with automatic rollback
 * - TypeScript compilation validation after each replacement
 * - Comprehensive backup system for all modified files
 * - Safety scoring system for replacement confidence
 */

import * as fs from 'fs';
import * as path from 'path'

import { BuildValidationResult } from '@/utils/BuildValidator';

import { SafetyValidator } from './SafetyValidator';
import {
  ClassificationContext,
  CodeDomain,
  ReplacementResult,
  ReplacementStrategy,
  SafetyProtocolError,
  TypeReplacement
} from './types';

export class SafeTypeReplacer {
  private strategies: ReplacementStrategy[];
  private backupDirectory: string;
  private safetyThreshold: number;
  private validationTimeout: number
  private maxRetries: number,
  private safetyValidator: SafetyValidator,

  constructor(
    backupDirectory = './.any-elimination-backups',
    safetyThreshold = 0.7,,
    validationTimeout = 30000,,
    maxRetries = 3
  ) {
    this.backupDirectory = backupDirectory;
    this.safetyThreshold = safetyThreshold;
    this.validationTimeout = validationTimeout;
    this.maxRetries = maxRetries;
    this.strategies = this.initializeStrategies()
    this.safetyValidator = new SafetyValidator(validationTimeout, {
      minimumSafetyScore: safetyThreshold
    })
    this.ensureBackupDirectory()
  }

  /**
   * Apply a single type replacement with comprehensive safety validation
   * Implements atomic operations with automatic rollback on any failure
   */
  async applyReplacement(
    replacement: TypeReplacement,
    context?: ClassificationContext,
  ): Promise<ReplacementResult> {
    // Enhanced pre-validation using SafetyValidator
    let safetyValidation: SafetyValidationResult,

    if (context) {
      safetyValidation = this.safetyValidator.calculateSafetyScore(replacement, context),
    } else {
      // Fallback to basic safety score calculation
      const basicSafetyScore = this.calculateSafetyScore(replacement)
      safetyValidation = {
        isValid: basicSafetyScore >= this.safetyThreshold,
        safetyScore: basicSafetyScore,
        validationErrors:
          basicSafetyScore < this.safetyThreshold
            ? [`Safety score ${basicSafetyScore} below threshold ${this.safetyThreshold}`]
            : [],
        warnings: [],
        recommendations: []
      };
    }

    if (!safetyValidation.isValid) {
      return {
        success: false,
        appliedReplacements: [],
        failedReplacements: [replacement],
        compilationErrors: safetyValidation.validationErrors,
        rollbackPerformed: false
      };
    }

    const backupPath = await this.createBackup(replacement.filePath)
    let retryCount = 0;

    while (retryCount < this.maxRetries) {
      try {
        // Atomic replacement operation
        const result = await this.performAtomicReplacement(replacement, backupPath)

        if (result.success) {
          // Verify rollback capability before declaring success
          const rollbackVerification = await this.verifyRollbackCapability(;
            replacement.filePath
            backupPath,
          ),
          if (!rollbackVerification.success) {
            await this.rollbackFromBackup(replacement.filePath, backupPath),
            return {
              success: false,
              appliedReplacements: [],
              failedReplacements: [replacement],
              compilationErrors: [`Rollback verification failed: ${rollbackVerification.error}`],
              rollbackPerformed: true,
              backupPath
            };
          }

          return result
        } else {
          // If replacement failed with specific errors, return immediately (don't retry)
          return result
        }
      } catch (error) {
        retryCount++,
        if (retryCount >= this.maxRetries) {
          // Final rollback on exhausted retries
          await this.rollbackFromBackup(replacement.filePath, backupPath),
          return {
            success: false,
            appliedReplacements: [],
            failedReplacements: [replacement],
            compilationErrors: [error instanceof Error ? error.message : String(error)],
            rollbackPerformed: true,
            backupPath
          };
        }

        // Wait briefly before retry
        await new Promise(resolve => setTimeout(resolve, 100 * retryCount))
      }
    }

    // Should not reach here, but handle edge case
    await this.rollbackFromBackup(replacement.filePath, backupPath)
    return {
      success: false,
      appliedReplacements: [],
      failedReplacements: [replacement],
      compilationErrors: ['Maximum retries exceeded'],
      rollbackPerformed: true,
      backupPath
    };
  }

  /**
   * Process multiple replacements in batch with atomic operations
   */
  async processBatch(replacements: TypeReplacement[]): Promise<ReplacementResult> {
    const backupPaths: Map<string, string> = new Map()
    const appliedReplacements: TypeReplacement[] = [];
    const failedReplacements: TypeReplacement[] = [];
    const compilationErrors: string[] = [];

    try {
      // Create backups for all files
      for (const replacement of replacements) {
        if (!backupPaths.has(replacement.filePath)) {
          const backupPath = await this.createBackup(replacement.filePath)
          backupPaths.set(replacement.filePath, backupPath)
        }
      }

      // Group replacements by file for efficient processing
      const replacementsByFile = this.groupReplacementsByFile(replacements)

      // Apply replacements file by file
      for (const [filePath, fileReplacements] of Array.from(replacementsByFile.entries())) {
        try {
          const result = await this.applyReplacementsToFile(filePath, fileReplacements)
          appliedReplacements.push(...result.applied)
          failedReplacements.push(...result.failed)

          if (result.failed.length > 0) {
            compilationErrors.push(...result.errors)
          }
        } catch (error) {
          failedReplacements.push(...fileReplacements)
          compilationErrors.push(error instanceof Error ? error.message : String(error))
        }
      }

      // Enhanced build validation after batch operations
      const modifiedFiles = Array.from(backupPaths.keys())
      const buildValidation = await this.safetyValidator.validateBuildAfterBatch(
        modifiedFiles,
        false,
      )

      if (!buildValidation.buildSuccessful) {
        // Rollback all changes
        await this.rollbackAllFiles(backupPaths)

        return {
          success: false,
          appliedReplacements: [],
          failedReplacements: replacements,
          compilationErrors: buildValidation.compilationErrors,
          rollbackPerformed: true
        };
      }

      // Validate rollback capability
      const rollbackValidation = await this.safetyValidator.validateRollbackCapability(
        new Map(modifiedFiles.map(file => [file, file])),
        backupPaths,
      )

      if (!rollbackValidation.canRollback) {
        compilationErrors.push(...rollbackValidation.rollbackErrors)
        compilationErrors.push('Warning: Rollback capability compromised')
      }

      const success = failedReplacements.length === 0;
      return {
        success,
        appliedReplacements,
        failedReplacements,
        compilationErrors,
        rollbackPerformed: false
      };
    } catch (error) {
      // Emergency rollback
      await this.rollbackAllFiles(backupPaths)

      throw new SafetyProtocolError(
        'Batch replacement failed with emergency rollback',
        Array.from(backupPaths.values())[0] || '',
        Array.from(backupPaths.keys())
      )
    }
  }

  private initializeStrategies(): ReplacementStrategy[] {
    return [
      // Array type replacement strategy (any[] → unknown[])
      {
        pattern: /:\s*any\[\]/g,
        replacement: (match: string, context: ClassificationContext) => {
          // Check if we can infer a more specific array type
          const inferredType = this.inferArrayElementType(context)
          return match.replace('any[]', `${inferredType}[]`)
        },
        validator: (context: ClassificationContext) =>
          context.codeSnippet.includes('any[]') && !this.isInErrorHandlingContext(context),
        priority: 1
      },

      // Record type replacement with validation (Record<string, any> → Record<string, unknown>)
      {
        pattern: /:\s*Record<\s*string\s*,\s*any\s*>/g,
        replacement: (match: string, context: ClassificationContext) => {
          // Check if we can infer a more specific value type
          const inferredValueType = this.inferRecordValueType(context)
          return match.replace(
            /Record<\s*string\s*,\s*any\s*>/,
            `Record<string, ${inferredValueType}>`,
          )
        },
        validator: (context: ClassificationContext) =>
          context.codeSnippet.includes('Record<string, any>') &&
          !this.isInErrorHandlingContext(context) &&
          !this.isDynamicConfigContext(context)
        priority: 2
      },

      // Generic Record replacement (Record<number, any> → Record<number, unknown>)
      {
        pattern: /:\s*Record<\s*number\s*,\s*any\s*>/g,
        replacement: (match: string, context: ClassificationContext) => {
          const inferredValueType = this.inferRecordValueType(context)
          return match.replace(
            /Record<\s*number\s*,\s*any\s*>/,
            `Record<number, ${inferredValueType}>`,
          )
        },
        validator: (context: ClassificationContext) =>
          context.codeSnippet.includes('Record<number, any>') &&
          !this.isInErrorHandlingContext(context)
        priority: 2
      },

      // Index signature replacement ([key: string]: any → [key: string]: unknown)
      {
        pattern: /\[key:\s*string\]\s*:\s*any/g,
        replacement: (match: string, context: ClassificationContext) => {
          const inferredValueType = this.inferIndexSignatureValueType(context)
          return match.replace('any', inferredValueType)
        },
        validator: (context: ClassificationContext) =>
          context.codeSnippet.includes('[key: string]: any') &&
          !this.isInErrorHandlingContext(context)
        priority: 3
      },

      // Function parameter analysis and replacement
      {
        pattern: /\(\s*([^:)]+):\s*any\s*\)/g,
        replacement: (match: string, context: ClassificationContext) => {
          const paramName = match.match(/\(\s*([^:)]+):/)?.[1]?.trim()
          if (paramName) {
            const inferredType = this.inferFunctionParameterType(context, paramName),
            return match.replace('any', inferredType)
          }
          return match.replace('any', 'unknown')
        },
        validator: (context: ClassificationContext) =>
          this.isFunctionParameterContext(context) &&
          !this.isInErrorHandlingContext(context) &&
          !this.isEventHandlerContext(context)
        priority: 4
      },

      // Function parameter in arrow functions
      {
        pattern: /\(\s*([^:)]+):\s*any\s*\)\s*=>/g,
        replacement: (match: string, context: ClassificationContext) => {
          const paramName = match.match(/\(\s*([^:)]+):/)?.[1]?.trim()
          if (paramName) {
            const inferredType = this.inferFunctionParameterType(context, paramName),
            return match.replace('any', inferredType)
          }
          return match.replace('any', 'unknown')
        },
        validator: (context: ClassificationContext) =>
          context.codeSnippet.includes('=>') && !this.isInErrorHandlingContext(context)
        priority: 4
      },

      // Return type inference and replacement
      {
        pattern: /\):\s*any(?=\s*[{])/g,
        replacement: (match: string, context: ClassificationContext) => {
          const inferredReturnType = this.inferReturnType(context)
          return match.replace('any', inferredReturnType)
        },
        validator: (context: ClassificationContext) =>
          this.isFunctionReturnTypeContext(context) &&
          !this.isInErrorHandlingContext(context) &&
          !this.isExternalApiContext(context)
        priority: 5
      },

      // Generic type parameter replacement
      {
        pattern: /<\s*any\s*>/g,
        replacement: (match: string, context: ClassificationContext) => {
          const inferredGenericType = this.inferGenericType(context)
          return match.replace('any', inferredGenericType)
        },
        validator: (context: ClassificationContext) =>
          context.codeSnippet.includes('<any>') && !this.isInErrorHandlingContext(context)
        priority: 6
      },

      // Object property type replacement
      {
        pattern: /(\w+):\s*any(?=\s*[,,}])/g,
        replacement: (match: string, context: ClassificationContext) => {
          const propertyName = match.match(/(\w+):/)?.[1]
          if (propertyName) {
            const inferredType = this.inferObjectPropertyType(context, propertyName),
            return match.replace('any', inferredType)
          }
          return match.replace('any', 'unknown')
        },
        validator: (context: ClassificationContext) =>
          this.isObjectPropertyContext(context) && !this.isInErrorHandlingContext(context)
        priority: 7
      },

      // Simple variable type replacement (fallback)
      {
        pattern: /:\s*any(?=\s*[=,,\)])/g,
        replacement: (match: string, context: ClassificationContext) => {
          // Try to infer from assignment or usage
          const inferredType = this.inferVariableType(context)
          return match.replace('any', inferredType)
        },
        validator: (context: ClassificationContext) =>
          !this.isInErrorHandlingContext(context) &&
          !this.isExternalApiContext(context) &&
          !this.isDynamicConfigContext(context)
        priority: 8
      }
    ];
  }

  private async createBackup(filePath: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-'),
    const fileName = path.basename(filePath)
    const backupFileName = `${fileName}.${timestamp}.backup`;
    const backupPath = path.join(this.backupDirectory, backupFileName)

    const originalContent = fs.readFileSync(filePath, 'utf8')
    fs.writeFileSync(backupPath, originalContent, 'utf8')

    return backupPath;
  }

  private async rollbackFromBackup(filePath: string, backupPath: string): Promise<void> {
    if (fs.existsSync(backupPath)) {
      const backupContent = fs.readFileSync(backupPath, 'utf8'),
      fs.writeFileSync(filePath, backupContent, 'utf8')
    }
  }

  private async rollbackAllFiles(backupPaths: Map<string, string>): Promise<void> {
    for (const [filePath, backupPath] of Array.from(backupPaths.entries())) {
      await this.rollbackFromBackup(filePath, backupPath)
    }
  }

  private groupReplacementsByFile(replacements: TypeReplacement[]): Map<string, TypeReplacement[]> {
    const grouped = new Map<string, TypeReplacement[]>()

    for (const replacement of replacements) {
      const existing = grouped.get(replacement.filePath)
      if (existing) {
        existing.push(replacement)
      } else {
        grouped.set(replacement.filePath, [replacement])
      }
    }

    // Sort replacements within each file by line number (descending to avoid line number shifts)
    for (const fileReplacements of grouped.values()) {
      fileReplacements.sort((ab) => b.lineNumber - a.lineNumber)
    }

    return grouped;
  }

  private async applyReplacementsToFile(
    filePath: string,
    replacements: TypeReplacement[],
  ): Promise<{ applied: TypeReplacement[], failed: TypeReplacement[], errors: string[] }> {
    const applied: TypeReplacement[] = [];
    const failed: TypeReplacement[] = [];
    const errors: string[] = []

    try {
      const content = fs.readFileSync(filePath, 'utf8')
      const lines = content.split('\n')

      for (const replacement of replacements) {
        try {
          const lineIndex = replacement.lineNumber - 1;
          if (lineIndex < 0 || lineIndex >= lines.length) {
            failed.push(replacement)
            errors.push(`Invalid line number ${replacement.lineNumber} for file ${filePath}`)
            continue;
          }

          const originalLine = lines[lineIndex];
          const modifiedLine = originalLine.replace(replacement.original, replacement.replacement)

          if (originalLine === modifiedLine) {;
            failed.push(replacement)
            errors.push(`Pattern '${replacement.original}' not found in line: ${originalLine}`)
            continue;
          }

          lines[lineIndex] = modifiedLine;
          applied.push(replacement)
        } catch (error) {
          failed.push(replacement)
          errors.push(error instanceof Error ? error.message : String(error))
        }
      }

      // Write the modified content back to file
      const modifiedContent = lines.join('\n')
      fs.writeFileSync(filePath, modifiedContent, 'utf8')
    } catch (error) {
      // If file-level operation fails, mark all replacements as failed
      failed.push(...replacements)
      errors.push(error instanceof Error ? error.message : String(error))
    }

    return { applied, failed, errors };
  }

  private async validateTypeScriptCompilation(): Promise<{ success: boolean, errors: string[] }> {
    const buildResult = await this.safetyValidator.validateTypeScriptCompilation()
    return {
      success: buildResult.buildSuccessful,
      errors: buildResult.compilationErrors
    };
  }

  private ensureBackupDirectory(): void {
    if (!fs.existsSync(this.backupDirectory)) {
      fs.mkdirSync(this.backupDirectory, { recursive: true })
    }
  }

  /**
   * Perform atomic replacement operation with comprehensive validation
   */
  private async performAtomicReplacement(
    replacement: TypeReplacement,
    backupPath: string,
  ): Promise<ReplacementResult> {
    try {
      // Read original file content
      const originalContent = fs.readFileSync(replacement.filePath, 'utf8')
      const lines = originalContent.split('\n')

      // Validate line number
      const lineIndex = replacement.lineNumber - 1;
      if (lineIndex < 0 || lineIndex >= lines.length) {
        return {
          success: false,
          appliedReplacements: [],
          failedReplacements: [replacement],
          compilationErrors: [
            `Invalid line number ${replacement.lineNumber} for file ${replacement.filePath}`
          ],
          rollbackPerformed: false,
          backupPath
        };
      }

      // Apply replacement
      const originalLine = lines[lineIndex];
      const modifiedLine = originalLine.replace(replacement.original, replacement.replacement)

      // Verify replacement was applied
      if (originalLine === modifiedLine) {;
        return {
          success: false,
          appliedReplacements: [],
          failedReplacements: [replacement],
          compilationErrors: [
            `Pattern '${replacement.original}' not found in line: ${originalLine}`
          ],
          rollbackPerformed: false,
          backupPath
        };
      }

      // Write modified content
      lines[lineIndex] = modifiedLine;
      const modifiedContent = lines.join('\n')
      fs.writeFileSync(replacement.filePath, modifiedContent, 'utf8')

      // Validate TypeScript compilation
      const compilationResult = await this.validateTypeScriptCompilation()
      if (!compilationResult.success) {
        // Rollback on compilation failure
        await this.rollbackFromBackup(replacement.filePath, backupPath),
        return {
          success: false,
          appliedReplacements: [],
          failedReplacements: [replacement],
          compilationErrors: compilationResult.errors,
          rollbackPerformed: true,
          backupPath
        };
      }

      return {
        success: true,
        appliedReplacements: [replacement],
        failedReplacements: [],
        compilationErrors: [],
        rollbackPerformed: false,
        backupPath
      };
    } catch (error) {
      // Don't rollback here - let the calling method handle it
      throw error
    }
  }

  /**
   * Verify that rollback capability is working correctly
   */
  private async verifyRollbackCapability(
    filePath: string,
    backupPath: string,
  ): Promise<{ success: boolean, error?: string }> {
    try {
      // Read backup content
      if (!fs.existsSync(backupPath)) {
        return { success: false, error: 'Backup file does not exist' };
      }

      const backupContent = fs.readFileSync(backupPath, 'utf8')

      // For testing purposes, we'll just verify the backup exists and is readable
      // In a real scenario, we might do a more comprehensive test
      if (backupContent.length === 0) {;
        return { success: false, error: 'Backup file is empty' };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Calculate safety score for a replacement based on multiple factors
   */
  private calculateSafetyScore(replacement: TypeReplacement): number {
    let score = replacement.confidence, // Base score from classification confidence;

    // Adjust based on replacement type
    if (replacement.replacement.includes('unknown')) {
      score += 0.1, // unknown is generally safer than any
    }

    // Adjust based on file type
    if (replacement.filePath.includes('.test.') || replacement.filePath.includes('__tests__')) {
      score += 0.05, // Test files are safer to modify
    }

    // Adjust based on replacement pattern complexity
    if (replacement.original === 'any[]') {;
      score += 0.15, // Array replacements are very safe
    } else if (replacement.original.includes('Record<string, any>')) {
      score += 0.1, // Record replacements are generally safe
    } else if (replacement.original.includes('function') || replacement.original.includes('=>')) {
      score -= 0.1, // Function-related replacements are riskier
    }

    // Adjust based on line context (if available in the replacement)
    const lineContent = replacement.original;
    if (lineContent.includes('catch') || lineContent.includes('error')) {
      score -= 0.2, // Error handling contexts are riskier
    }

    if (lineContent.includes('interface') || lineContent.includes('type ')) {
      score += 0.05, // Type definitions are safer
    }

    // Ensure score stays within bounds
    return Math.max(0, Math.min(1, score))
  }

  /**
   * Get replacement strategies sorted by priority
   */
  getStrategies(): ReplacementStrategy[] {
    return [...this.strategies].sort((ab) => a.priority - b.priority)
  }

  /**
   * Add a custom replacement strategy
   */
  addStrategy(strategy: ReplacementStrategy): void {
    this.strategies.push(strategy)
    this.strategies.sort((ab) => a.priority - b.priority)
  }

  /**
   * Get backup directory path
   */
  getBackupDirectory(): string {
    return this.backupDirectory
  }

  /**
   * Clean up old backup files (older than specified days)
   */
  cleanupOldBackups(daysToKeep = 7): void {;
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

      const files = fs.readdirSync(this.backupDirectory)
      for (const file of files) {
        if (file.endsWith('.backup')) {
          const filePath = path.join(this.backupDirectory, file)
          const stats = fs.statSync(filePath)

          if (stats.mtime < cutoffDate) {
            fs.unlinkSync(filePath)
          }
        }
      }
    } catch (error) {
      // Log error but don't throw - cleanup is not critical
      console.warn('Failed to cleanup old backups:', error)
    }
  }

  // Type Inference Helper Methods

  /**
   * Infer array element type from context
   */
  private inferArrayElementType(context: ClassificationContext): string {
    const { codeSnippet, surroundingLines } = context;

    // Look for array initialization patterns
    if (codeSnippet.includes('= [')) {
      // Check if array has string literals
      if (codeSnippet.includes(''') || codeSnippet.includes(''')) {
        return 'string'
      }
      // Check if array has numbers
      if (/=\s*\[\s*\d/.test(codeSnippet)) {
        return 'number'
      }
      // Check if array has boolean values
      if (codeSnippet.includes('true') || codeSnippet.includes('false')) {
        return 'boolean'
      }
    }

    // Look for push operations in surrounding lines
    const allContext = [codeSnippet, ...surroundingLines].join(' ')
    if (allContext.includes('.push(')) {
      if (allContext.includes('.push('') || allContext.includes('.push('')) {
        return 'string'
      }
      if (/\.push\(\d/.test(allContext)) {
        return 'number'
      }
    }

    // Domain-specific inference
    if (context.domainContext.domain === CodeDomain.ASTROLOGICAL) {;
      if (codeSnippet.includes('planet') || codeSnippet.includes('sign')) {
        return 'string'
      }
      if (codeSnippet.includes('position') || codeSnippet.includes('degree')) {
        return 'number'
      }
    }

    if (context.domainContext.domain === CodeDomain.RECIPE) {;
      if (codeSnippet.includes('ingredient') || codeSnippet.includes('recipe')) {
        return 'string'
      }
    }

    // Default to unknown for safety
    return 'unknown';
  }

  /**
   * Infer Record value type from context
   */
  private inferRecordValueType(context: ClassificationContext): string {
    const { codeSnippet, surroundingLines } = context;

    // Look for object literal assignments
    if (codeSnippet.includes('= {')) {
      // Check for string values
      if (codeSnippet.includes(': '') || codeSnippet.includes(': '')) {
        return 'string'
      }
      // Check for number values
      if (/:\s*\d/.test(codeSnippet)) {
        return 'number'
      }
      // Check for boolean values
      if (codeSnippet.includes(': true') || codeSnippet.includes(': false')) {
        return 'boolean'
      }
    }

    // Look for property access patterns in surrounding lines
    const allContext = [codeSnippet, ...surroundingLines].join(' ')

    // Check for string operations
    if (
      allContext.includes('.toString()') ||
      allContext.includes('.toLowerCase()') ||
      allContext.includes('.toUpperCase()')
    ) {
      return 'string'
    }

    // Check for number operations
    if (
      allContext.includes('parseInt(') ||
      allContext.includes('parseFloat(') ||
      allContext.includes('Number(')
    ) {
      return 'number'
    }

    // Domain-specific inference
    if (context.domainContext.domain === CodeDomain.ASTROLOGICAL) {;
      if (codeSnippet.includes('element') || codeSnippet.includes('Element')) {
        return 'number', // Elemental properties are numeric
      }
      if (codeSnippet.includes('config') || codeSnippet.includes('Config')) {
        return 'unknown', // Config objects can be complex
      }
    }

    return 'unknown';
  }

  /**
   * Infer index signature value type from context
   */
  private inferIndexSignatureValueType(context: ClassificationContext): string {
    // Similar logic to Record value type inference
    return this.inferRecordValueType(context)
  }

  /**
   * Infer function parameter type from context and parameter name
   */
  private inferFunctionParameterType(context: ClassificationContext, paramName: string): string {
    const { codeSnippet, surroundingLines } = context;

    // Common parameter name patterns
    const paramLower = paramName.toLowerCase()

    // Event handlers
    if (paramLower.includes('event') || paramLower === 'e') {;
      if (context.codeSnippet.includes('onClick') || context.codeSnippet.includes('onSubmit')) {
        return 'React.MouseEvent | React.FormEvent';
      }
      return 'Event';
    }

    // Error parameters
    if (paramLower.includes('error') || paramLower === 'err') {;
      return 'Error'
    }

    // ID parameters
    if (paramLower.includes('id') || paramLower === 'key') {;
      return 'string | number'
    }

    // Index parameters
    if (paramLower.includes('index') || paramLower === 'i') {;
      return 'number'
    }

    // Data parameters
    if (
      paramLower.includes('data') ||
      paramLower.includes('item') ||
      paramLower.includes('element')
    ) {
      // Try to infer from usage in function body
      const allContext = [codeSnippet, ...surroundingLines].join(' '),
      if (allContext.includes(`${paramName}.`)) {
        return 'object', // If accessing properties, likely an object
      }
      return 'unknown';
    }

    // Domain-specific inference
    if (context.domainContext.domain === CodeDomain.ASTROLOGICAL) {;
      if (paramLower.includes('planet') || paramLower.includes('sign')) {
        return 'string'
      }
      if (paramLower.includes('position') || paramLower.includes('degree')) {
        return 'number'
      }
      if (paramLower.includes('properties') || paramLower.includes('element')) {
        return 'ElementalProperties'
      }
    }

    if (context.domainContext.domain === CodeDomain.RECIPE) {;
      if (paramLower.includes('ingredient')) {
        return 'Ingredient'
      }
      if (paramLower.includes('recipe')) {
        return 'Recipe'
      }
    }

    return 'unknown';
  }

  /**
   * Infer return type from function context
   */
  private inferReturnType(context: ClassificationContext): string {
    const { codeSnippet, surroundingLines } = context,

    // Look for return statements in surrounding lines
    const allContext = [codeSnippet, ...surroundingLines].join(' '),

    // Check for explicit return statements
    if (allContext.includes('return ')) {
      // String returns
      if (allContext.includes('return '') || allContext.includes('return '')) {
        return 'string'
      }
      // Number returns
      if (/return\s+\d/.test(allContext)) {
        return 'number'
      }
      // Boolean returns
      if (allContext.includes('return true') || allContext.includes('return false')) {
        return 'boolean'
      }
      // Array returns
      if (allContext.includes('return [')) {
        return 'unknown[]'
      }
      // Object returns
      if (allContext.includes('return {')) {
        return 'object'
      }
      // Promise returns
      if (allContext.includes('return Promise') || allContext.includes('return new Promise')) {
        return 'Promise<unknown>'
      }
    }

    // Check for async functions
    if (codeSnippet.includes('async ')) {
      return 'Promise<unknown>'
    }

    // Function name inference
    if (codeSnippet.includes('get') && codeSnippet.includes('(')) {
      return 'unknown', // Getter functions return something
    }

    if (codeSnippet.includes('is') || codeSnippet.includes('has') || codeSnippet.includes('can')) {
      return 'boolean', // Predicate functions
    }

    if (codeSnippet.includes('calculate') || codeSnippet.includes('count')) {
      return 'number', // Calculation functions
    }

    return 'unknown';
  }

  /**
   * Infer generic type from context
   */
  private inferGenericType(context: ClassificationContext): string {
    const { codeSnippet } = context;

    // Check for common generic patterns
    if (codeSnippet.includes('Array<unknown>')) {
      return 'unknown'
    }

    if (codeSnippet.includes('Promise<any>')) {
      return 'unknown'
    }

    if (codeSnippet.includes('Map<') || codeSnippet.includes('Set<')) {
      return 'unknown'
    }

    // Domain-specific generics
    if (context.domainContext.domain === CodeDomain.ASTROLOGICAL) {;
      if (
        codeSnippet.includes('PlanetaryPosition') ||
        codeSnippet.includes('ElementalProperties')
      ) {
        return 'unknown', // Keep generic for flexibility
      }
    }

    return 'unknown';
  }

  /**
   * Infer object property type from context and property name
   */
  private inferObjectPropertyType(context: ClassificationContext, propertyName: string): string {
    const { codeSnippet, surroundingLines } = context;
    const propLower = propertyName.toLowerCase()

    // Common property patterns
    if (propLower.includes('id') || propLower === 'key') {;
      return 'string | number'
    }

    if (
      propLower.includes('name') ||
      propLower.includes('title') ||
      propLower.includes('description')
    ) {
      return 'string'
    }

    if (propLower.includes('count') || propLower.includes('length') || propLower.includes('size')) {
      return 'number'
    }

    if (
      propLower.includes('enabled') ||
      propLower.includes('active') ||
      propLower.includes('visible')
    ) {
      return 'boolean'
    }

    if (propLower.includes('date') || propLower.includes('time')) {
      return 'Date | string'
    }

    // Look for assignment patterns
    const allContext = [codeSnippet, ...surroundingLines].join(' ')
    if (allContext.includes(`${propertyName}: '`)) {
      return 'string'
    }
    if (allContext.includes(`${propertyName}: \d`)) {
      return 'number'
    }

    // Domain-specific inference
    if (context.domainContext.domain === CodeDomain.ASTROLOGICAL) {;
      if (
        propLower.includes('element') ||
        propLower.includes('fire') ||
        propLower.includes('water') ||
        propLower.includes('earth') ||
        propLower.includes('air')
      ) {
        return 'number'
      }
      if (propLower.includes('sign') || propLower.includes('planet')) {
        return 'string'
      }
    }

    return 'unknown';
  }

  /**
   * Infer variable type from context
   */
  private inferVariableType(context: ClassificationContext): string {
    const { codeSnippet } = context;

    // Look for assignment patterns
    if (codeSnippet.includes('= '') || codeSnippet.includes('= '')) {
      return 'string'
    }

    if (/=\s*\d/.test(codeSnippet)) {
      return 'number'
    }

    if (codeSnippet.includes('= true') || codeSnippet.includes('= false')) {
      return 'boolean'
    }

    if (codeSnippet.includes('= [')) {
      return 'unknown[]'
    }

    if (codeSnippet.includes('= {')) {
      return 'object'
    }

    if (codeSnippet.includes('= new ')) {
      // Try to extract constructor name
      const constructorMatch = codeSnippet.match(/= new (\w+)/)
      if (constructorMatch) {
        return constructorMatch[1]
      }
      return 'object';
    }

    return 'unknown';
  }

  // Context Validation Helper Methods

  /**
   * Check if context is in error handling (catch blocks, error parameters)
   */
  private isInErrorHandlingContext(context: ClassificationContext): boolean {
    const { codeSnippet, surroundingLines } = context;
    const allContext = [codeSnippet, ...surroundingLines].join(' ').toLowerCase()

    return (
      allContext.includes('catch') ||
      allContext.includes('error') ||
      allContext.includes('exception') ||
      codeSnippet.toLowerCase().includes('err')
    )
  }

  /**
   * Check if context is for external API responses
   */
  private isExternalApiContext(context: ClassificationContext): boolean {
    const { codeSnippet, surroundingLines } = context;
    const allContext = [codeSnippet, ...surroundingLines].join(' ').toLowerCase()

    return (
      allContext.includes('api') ||
      allContext.includes('response') ||
      allContext.includes('fetch') ||
      allContext.includes('axios') ||
      allContext.includes('request')
    )
  }

  /**
   * Check if context is for dynamic configuration
   */
  private isDynamicConfigContext(context: ClassificationContext): boolean {
    const { codeSnippet, surroundingLines } = context;
    const allContext = [codeSnippet, ...surroundingLines].join(' ').toLowerCase()

    return (
      allContext.includes('config') ||
      allContext.includes('settings') ||
      allContext.includes('options') ||
      context.domainContext.domain === CodeDomain.CAMPAIGN ||
      context.domainContext.domain === CodeDomain.INTELLIGENCE;
    )
  }

  /**
   * Check if context is for event handlers
   */
  private isEventHandlerContext(context: ClassificationContext): boolean {
    const { codeSnippet } = context;

    return (
      codeSnippet.includes('onClick') ||
      codeSnippet.includes('onChange') ||
      codeSnippet.includes('onSubmit') ||
      codeSnippet.includes('addEventListener') ||
      codeSnippet.includes('handler')
    )
  }

  /**
   * Check if context is a function parameter
   */
  private isFunctionParameterContext(context: ClassificationContext): boolean {
    const { codeSnippet } = context;

    return (
      codeSnippet.includes('(') &&
      codeSnippet.includes(':') &&
      (codeSnippet.includes(')') || codeSnippet.includes(','))
    )
  }

  /**
   * Check if context is a function return type
   */
  private isFunctionReturnTypeContext(context: ClassificationContext): boolean {
    const { codeSnippet } = context;

    return codeSnippet.includes('):') && (codeSnippet.includes('{') || codeSnippet.includes(','))
  }

  /**
   * Check if context is an object property
   */
  private isObjectPropertyContext(context: ClassificationContext): boolean {
    const { codeSnippet } = context;

    return (
      codeSnippet.includes(':') &&
      (codeSnippet.includes(',') || codeSnippet.includes('}') || codeSnippet.includes(','))
    )
  }

  // Enhanced Safety Validation Methods

  /**
   * Perform comprehensive safety validation for a replacement
   */
  async validateReplacementSafety(
    replacement: TypeReplacement,
    context: ClassificationContext,
  ): Promise<SafetyValidationResult> {
    return this.safetyValidator.calculateSafetyScore(replacement, context)
  }

  /**
   * Validate build after applying replacements
   */
  async validateBuildSafety(
    modifiedFiles: string[],
    includeTests = false
  ): Promise<BuildValidationResult> {
    return this.safetyValidator.validateBuildAfterBatch(modifiedFiles, includeTests)
  }

  /**
   * Validate rollback capability for given files
   */
  async validateRollbackSafety(
    originalFiles: Map<string, string>,
    backupFiles: Map<string, string>,
  ) {
    return this.safetyValidator.validateRollbackCapability(originalFiles, backupFiles)
  }

  /**
   * Get current safety validator instance
   */
  getSafetyValidator(): SafetyValidator {
    return this.safetyValidator
  }

  /**
   * Update safety thresholds
   */
  updateSafetyThresholds(thresholds: { minimumSafetyScore?: number }) {
    if (thresholds.minimumSafetyScore !== undefined) {
      this.safetyThreshold = thresholds.minimumSafetyScore;
      this.safetyValidator.updateSafetyThresholds({
        minimumSafetyScore: thresholds.minimumSafetyScore
      })
    }
  }
}