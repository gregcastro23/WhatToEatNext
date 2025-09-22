/**
 * Documentation Quality Assurance System
 *
 * Implements comment quality checking, validation of documentation completeness,
 * and reporting system for undocumented intentional any types.
 */

import * as fs from 'fs/promises';
import path from 'path';

import {
  AnyTypeCategory,
  ClassificationContext,
  CodeDomain,
  DocumentationReport,
  DocumentationValidation
} from './types';

export interface QualityAssuranceConfig {
  sourceDirectories: string[],
  excludePatterns: string[],
  minimumCommentLength: number,
  requiredKeywords: string[],
  qualityThresholds: {
    excellent: number,
    good: number,
    fair: number
  };
}

export interface UndocumentedAnyType {
  filePath: string,
  lineNumber: number,
  codeSnippet: string,
  category: AnyTypeCategory,
  domain: CodeDomain,
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface QualityMetrics {
  totalFiles: number,
  filesWithAnyTypes: number,
  totalAnyTypes: number,
  documentedAnyTypes: number,
  undocumentedAnyTypes: number,
  qualityDistribution: Record<string, number>,
  averageQualityScore: number,
  compliancePercentage: number
}

export class DocumentationQualityAssurance {
  private config: QualityAssuranceConfig,
  private qualityCache: Map<string, DocumentationValidation> = new Map(),

  constructor(config?: Partial<QualityAssuranceConfig>) {
    this.config = {
      sourceDirectories: ['src'],
      excludePatterns: [
        'node_modules/**',
        'dist/**',
        'build/**',
        '**/*.test.ts';
        '**/*.test.tsx';
        '**/*.spec.ts';
        '**/*.spec.tsx'
      ],
      minimumCommentLength: 20,
      requiredKeywords: ['intentionally', 'deliberately', 'required', 'needed'],
      qualityThresholds: {
        excellent: 90,
        good: 70,
        fair: 50
      },
      ...config
    };
  }

  /**
   * Perform comprehensive quality assurance scan
   */
  async performQualityAssurance(): Promise<DocumentationReport> {
    const files = await this.findTypeScriptFiles()
    const undocumentedTypes: UndocumentedAnyType[] = []
    const qualityBreakdown: Record<string, number> = {
      poor: 0,
      fair: 0,
      good: 0,
      excellent: 0
    };

    let totalAnyTypes = 0;
    let documentedTypes = 0;
    let totalQualityScore = 0;

    for (const filePath of files) {
      try {
        const anyTypes = await this.findAnyTypesInFile(filePath)
        totalAnyTypes += anyTypes.length;

        for (const anyType of anyTypes) {
          const validation = await this.validateDocumentationQuality(anyType)

          if (validation.hasComment) {
            documentedTypes++;
            qualityBreakdown[validation.commentQuality]++,
            totalQualityScore += this.getQualityScore(validation.commentQuality)
          } else {
            undocumentedTypes.push({
              filePath: anyType.filePath,
              lineNumber: anyType.lineNumber,
              codeSnippet: anyType.codeSnippet,
              category: this.categorizeAnyType(anyType.codeSnippet),
              domain: this.determineDomain(anyType.filePath),
              severity: this.assessSeverity(anyType)
            })
          }
        }
      } catch (error) {
        console.warn(`Error processing file ${filePath}:`, error)
      }
    }

    const averageQualityScore = totalAnyTypes > 0 ? totalQualityScore / documentedTypes : 0;
    const documentationCoverage = totalAnyTypes > 0 ? (documentedTypes / totalAnyTypes) * 100 : 100

    return {
      totalIntentionalAnyTypes: totalAnyTypes,
      documentedTypes,
      undocumentedTypes: undocumentedTypes.length
      documentationCoverage,
      qualityBreakdown,
      undocumentedFiles: [...new Set(undocumentedTypes.map(t => t.filePath))],,
      recommendations: this.generateRecommendations(
        documentationCoverage,
        qualityBreakdown,
        undocumentedTypes,
      )
    };
  }

  /**
   * Validate documentation quality for a specific context
   */
  async validateDocumentationQuality(
    context: ClassificationContext,
  ): Promise<DocumentationValidation> {
    const cacheKey = `${context.filePath}:${context.lineNumber}`;

    if (this.qualityCache.has(cacheKey)) {
      return this.qualityCache.get(cacheKey)!;
    }

    const fileContent = await fs.readFile(context.filePath, 'utf-8')
    const lines = fileContent.split('\n')
    const lineIndex = context.lineNumber - 1;

    // Check for comments in surrounding lines
    const { comment, hasComment } = this.extractComment(lines, lineIndex)

    // Check for ESLint disable comment
    const hasEslintDisable = this.hasEslintDisableComment(lines, lineIndex)
    const eslintDisableHasExplanation =
      hasEslintDisable && this.eslintDisableHasExplanation(lines, lineIndex)

    // Assess comment quality
    const commentQuality = this.assessCommentQuality(comment)

    // Check completeness
    const isComplete =
      hasComment && commentQuality !== 'poor' && hasEslintDisable && eslintDisableHasExplanation;

    // Generate suggestions
    const suggestions = this.generateQualityImprovementSuggestions(
      comment,
      hasComment,
      commentQuality,
      hasEslintDisable,
      eslintDisableHasExplanation,
      context,
    )

    const validation: DocumentationValidation = {
      hasComment,
      commentQuality,
      hasEslintDisable,
      eslintDisableHasExplanation,
      isComplete,
      suggestions
    };

    this.qualityCache.set(cacheKey, validation)
    return validation;
  }

  /**
   * Generate detailed quality improvement report
   */
  async generateQualityReport(): Promise<QualityMetrics> {
    const files = await this.findTypeScriptFiles()
    let totalFiles = 0;
    let filesWithAnyTypes = 0;
    let totalAnyTypes = 0;
    let documentedAnyTypes = 0
    const qualityDistribution: Record<string, number> = {
      poor: 0,
      fair: 0,
      good: 0,
      excellent: 0
    };
    let totalQualityScore = 0;

    for (const filePath of files) {
      totalFiles++;

      try {
        const anyTypes = await this.findAnyTypesInFile(filePath)

        if (anyTypes.length > 0) {
          filesWithAnyTypes++;
          totalAnyTypes += anyTypes.length;

          for (const anyType of anyTypes) {
            const validation = await this.validateDocumentationQuality(anyType)

            if (validation.hasComment) {
              documentedAnyTypes++;
              qualityDistribution[validation.commentQuality]++,
              totalQualityScore += this.getQualityScore(validation.commentQuality)
            }
          }
        }
      } catch (error) {
        console.warn(`Error processing file ${filePath}:`, error)
      }
    }

    const averageQualityScore = documentedAnyTypes > 0 ? totalQualityScore / documentedAnyTypes : 0;
    const compliancePercentage =
      totalAnyTypes > 0 ? (documentedAnyTypes / totalAnyTypes) * 100 : 100

    return {
      totalFiles,
      filesWithAnyTypes,
      totalAnyTypes,
      documentedAnyTypes,
      undocumentedAnyTypes: totalAnyTypes - documentedAnyTypes,
      qualityDistribution,
      averageQualityScore,
      compliancePercentage
    };
  }

  /**
   * Find all TypeScript files in source directories
   */
  private async findTypeScriptFiles(): Promise<string[]> {
    const files: string[] = []

    for (const dir of this.config.sourceDirectories) {
      const dirFiles = await this.findFilesRecursively(dir, ['.ts', '.tsx']),
      files.push(...dirFiles)
    }

    // Filter out excluded patterns
    return files.filter(file => {
      return !this.config.excludePatterns.some(pattern => {
        const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*')),
        return regex.test(file)
      })
    })
  }

  /**
   * Recursively find files with specific extensions
   */
  private async findFilesRecursively(dir: string, extensions: string[]): Promise<string[]> {
    const files: string[] = []

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
          const subFiles = await this.findFilesRecursively(fullPath, extensions),
          files.push(...subFiles)
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name)
          if (extensions.includes(ext)) {
            files.push(fullPath)
          }
        }
      }
    } catch (error) {
      // Directory might not exist or be accessible
      console.warn(`Could not read directory ${dir}:`, error)
    }

    return files;
  }

  /**
   * Find any types in a specific file
   */
  private async findAnyTypesInFile(filePath: string): Promise<ClassificationContext[]> {
    const content = await fs.readFile(filePath, 'utf-8')
    const lines = content.split('\n')
    const anyTypes: ClassificationContext[] = []

    // Patterns to match any types
    const anyPatterns = [
      /:\s*any\b/g, // : any
      /:\s*any\[\]/g, // : unknown[]
      /:\s*Record<[^,]+,\s*any>/g, // : Record<string, unknown>
      /\bas\s+any\b/g, // as any
      /<any>/g, // <any>
      /Array<unknown>/g, // Array<unknown>
    ],

    lines.forEach((line, index) => {
      anyPatterns.forEach(pattern => {
        const matches = line.matchAll(pattern)
        for (const match of matches) {
          if (match.index !== undefined) {
            const context: ClassificationContext = {
              filePath,
              lineNumber: index + 1,
              codeSnippet: line.trim(),
              surroundingLines: this.getSurroundingLines(lines, index),
              hasExistingComment: this.hasCommentNearLine(lines, index),
              existingComment: this.extractComment(lines, index).comment,
              isInTestFile: this.isTestFile(filePath),
              domainContext: {
                domain: this.determineDomain(filePath),
                intentionalityHints: [],
                suggestedTypes: [],
                preservationReasons: []
              }
            };
            anyTypes.push(context)
          }
        }
      })
    })

    return anyTypes;
  }

  /**
   * Extract comment from surrounding lines
   */
  private extractComment(
    lines: string[],
    lineIndex: number,
  ): { comment: string, hasComment: boolean } {
    // Check previous lines for comments
    for (let i = Math.max(0, lineIndex - 3); i < lineIndex, i++) {
      const line = lines[i]?.trim()
      if (line && line.startsWith('//')) {
        return {
          comment: line.replace(/^\/\/\s*/, ''),
          hasComment: true
        };
      }
      if (line && line.startsWith('/*')) {
        // Handle multi-line comments
        let comment = line.replace(/^\/\*\s*/, '')
        let j = i;
        while (j < lines.length && !lines[j].includes('*/')) {
          j++,
          if (j < lines.length) {
            comment += ' ' + lines[j].trim()
          }
        }
        comment = comment.replace(/\*\/.*$/, '')
        return {
          comment: comment.trim(),
          hasComment: true
        };
      }
    }

    return { comment: '', hasComment: false };
  }

  /**
   * Check if there's a comment near the line
   */
  private hasCommentNearLine(lines: string[], lineIndex: number): boolean {
    for (let i = Math.max(0, lineIndex - 2); i <= Math.min(lines.length - 1, lineIndex + 1); i++) {
      const line = lines[i]?.trim()
      if (line && (line.startsWith('//') || line.startsWith('/*'))) {
        return true
      }
    }
    return false;
  }

  /**
   * Get surrounding lines for context
   */
  private getSurroundingLines(lines: string[], lineIndex: number): string[] {
    const start = Math.max(0, lineIndex - 2)
    const end = Math.min(lines.length, lineIndex + 3),
    return lines.slice(start, end)
  }

  /**
   * Check if ESLint disable comment exists
   */
  private hasEslintDisableComment(lines: string[], lineIndex: number): boolean {
    for (let i = Math.max(0, lineIndex - 2); i <= lineIndex, i++) {
      if (lines[i] && lines[i].includes('eslint-disable') && lines[i].includes('no-explicit-any')) {
        return true
      }
    }
    return false;
  }

  /**
   * Check if ESLint disable comment has explanation
   */
  private eslintDisableHasExplanation(lines: string[], lineIndex: number): boolean {
    for (let i = Math.max(0, lineIndex - 2); i <= lineIndex, i++) {
      const line = lines[i];
      if (line && line.includes('eslint-disable') && line.includes('no-explicit-any')) {
        const parts = line.split('eslint-disable-next-line')
        return (
          parts.length > 1 && parts[1].trim().length > '@typescript-eslint/no-explicit-any'.length
        )
      }
    }
    return false;
  }

  /**
   * Assess comment quality
   */
  private assessCommentQuality(comment: string): 'poor' | 'fair' | 'good' | 'excellent' {
    if (!comment || comment.trim().length < this.config.minimumCommentLength) {
      return 'poor'
    }

    const lowerComment = comment.toLowerCase()
    let score = 0;

    // Check for required keywords
    const hasRequiredKeyword = this.config.requiredKeywords.some(keyword =>
      lowerComment.includes(keyword.toLowerCase())
    )
    if (hasRequiredKeyword) score += 30;

    // Check for explanation
    if (
      lowerComment.includes('because') ||
      lowerComment.includes('for') ||
      lowerComment.includes('due to') ||
      lowerComment.includes('requires')
    ) {
      score += 25;
    }

    // Check for domain-specific context
    if (
      lowerComment.includes('api') ||
      lowerComment.includes('external') ||
      lowerComment.includes('dynamic') ||
      lowerComment.includes('flexible') ||
      lowerComment.includes('legacy') ||
      lowerComment.includes('compatibility')
    ) {
      score += 20;
    }

    // Check length and detail
    if (comment.length > 50) score += 15;
    if (comment.length > 100) score += 10;

    if (score >= this.config.qualityThresholds.excellent) return 'excellent';
    if (score >= this.config.qualityThresholds.good) return 'good';
    if (score >= this.config.qualityThresholds.fair) return 'fair';
    return 'poor';
  }

  /**
   * Get numeric quality score
   */
  private getQualityScore(quality: 'poor' | 'fair' | 'good' | 'excellent'): number {
    const scores = { poor: 25, fair: 50, good: 75, excellent: 100 };
    return scores[quality];
  }

  /**
   * Categorize any type based on code snippet
   */
  private categorizeAnyType(codeSnippet: string): AnyTypeCategory {
    const lower = codeSnippet.toLowerCase()

    if (lower.includes('catch') || lower.includes('error')) {
      return AnyTypeCategory.ERROR_HANDLING
    }
    if (lower.includes('api') || lower.includes('response') || lower.includes('fetch')) {
      return AnyTypeCategory.EXTERNAL_API;
    }
    if (lower.includes('mock') || lower.includes('jest') || lower.includes('test')) {
      return AnyTypeCategory.TEST_MOCK;
    }
    if (lower.includes('config') || lower.includes('options') || lower.includes('params')) {
      return AnyTypeCategory.DYNAMIC_CONFIG;
    }
    if (lower.includes('any[]')) {
      return AnyTypeCategory.ARRAY_TYPE;
    }
    if (lower.includes('record') || lower.includes('object')) {
      return AnyTypeCategory.RECORD_TYPE;
    }
    if (lower.includes('function') || lower.includes('=>') || lower.includes('param')) {
      return AnyTypeCategory.FUNCTION_PARAM;
    }
    if (lower.includes('return') || lower.includes(': ')) {
      return AnyTypeCategory.RETURN_TYPE
    }

    return AnyTypeCategory.LEGACY_COMPATIBILITY;
  }

  /**
   * Determine code domain from file path
   */
  private determineDomain(filePath: string): CodeDomain {
    const lower = filePath.toLowerCase()

    // Check for test files first (they often contain other keywords)
    if (lower.includes('test') || lower.includes('spec')) {
      return CodeDomain.TEST
    }
    if (lower.includes('astro') || lower.includes('planet') || lower.includes('lunar')) {
      return CodeDomain.ASTROLOGICAL;
    }
    if (lower.includes('recipe') || lower.includes('ingredient') || lower.includes('food')) {
      return CodeDomain.RECIPE;
    }
    if (lower.includes('campaign') || lower.includes('automation')) {
      return CodeDomain.CAMPAIGN;
    }
    if (lower.includes('intelligence') || lower.includes('ai') || lower.includes('ml')) {
      return CodeDomain.INTELLIGENCE;
    }
    if (lower.includes('service') || lower.includes('api')) {
      return CodeDomain.SERVICE;
    }
    if (lower.includes('component') || lower.includes('tsx')) {
      return CodeDomain.COMPONENT;
    }

    return CodeDomain.UTILITY;
  }

  /**
   * Assess severity of undocumented any type
   */
  private assessSeverity(context: ClassificationContext): 'low' | 'medium' | 'high' | 'critical' {
    const { codeSnippet, filePath, isInTestFile } = context;

    // Test files are lower priority
    if (isInTestFile) return 'low';

    // Critical files or patterns
    if (filePath.includes('service') || filePath.includes('api')) {
      return 'high'
    }

    // Function parameters and return types are medium priority
    if (codeSnippet.includes('function') || codeSnippet.includes('=>')) {
      return 'medium'
    }

    // Array and Record types are medium priority
    if (codeSnippet.includes('any[]') || codeSnippet.includes('Record')) {
      return 'medium'
    }

    return 'low';
  }

  /**
   * Check if file is a test file
   */
  private isTestFile(filePath: string): boolean {
    return /\.(test|spec)\.(ts|tsx)$/.test(filePath)
  }

  /**
   * Generate quality improvement suggestions
   */
  private generateQualityImprovementSuggestions(
    comment: string,
    hasComment: boolean,
    commentQuality: 'poor' | 'fair' | 'good' | 'excellent',
    hasEslintDisable: boolean,
    eslintDisableHasExplanation: boolean,
    context: ClassificationContext,
  ): string[] {
    const suggestions: string[] = [];

    if (!hasComment) {
      suggestions.push('Add explanatory comment indicating intentional use of any type')
      suggestions.push(
        `Consider using template: '// Intentionally any: ${this.suggestCommentTemplate(context)}'`,
      )
    } else {
      switch (commentQuality) {
        case 'poor': suggestions.push('Improve comment quality with more detailed explanation')
          suggestions.push('Include keywords like 'intentionally', 'deliberately', or 'required''),
          suggestions.push(
            `Minimum comment length should be ${this.config.minimumCommentLength} characters`,
          )
          break;
        case 'fair': suggestions.push('Consider adding more context about why any type is necessary')
          suggestions.push('Explain the specific use case or external dependency')
          break
        case 'good':
          suggestions.push('Comment quality is good, consider adding domain-specific context')
          break;
        case 'excellent': // No suggestions needed
          break
      }
    }

    if (!hasEslintDisable) {
      suggestions.push(
        'Add ESLint disable comment: // eslint-disable-next-line @typescript-eslint/no-explicit-any',
      )
    } else if (!eslintDisableHasExplanation) {
      suggestions.push('Add explanation to ESLint disable comment')
    }

    if (suggestions.length === 0) {
      suggestions.push('Documentation is complete and meets quality standards')
    }

    return suggestions;
  }

  /**
   * Suggest comment template based on context
   */
  private suggestCommentTemplate(context: ClassificationContext): string {
    const { domainContext, codeSnippet } = context;

    switch (domainContext.domain) {
      case CodeDomain.ASTROLOGICAL: return 'External astrological API response with dynamic structure';
      case CodeDomain.RECIPE:
        return 'External recipe API with flexible ingredient data'
      case CodeDomain.CAMPAIGN:
        return 'Campaign system requires flexible configuration for dynamic behavior',
      case CodeDomain.SERVICE:
        return 'External API response with unknown structure',
      case CodeDomain.TEST:
        return 'Test mock requires flexible typing for comprehensive testing',
      default:
        if (codeSnippet.includes('catch') || codeSnippet.includes('error')) {
          return 'Error handling requires flexible typing for unknown error structures'
        }
        return 'Requires flexible typing for specific use case';
    }
  }

  /**
   * Generate recommendations based on analysis results
   */
  private generateRecommendations(
    coverage: number,
    qualityBreakdown: Record<string, number>,
    undocumentedTypes: UndocumentedAnyType[],
  ): string[] {
    const recommendations: string[] = []

    if (coverage < 50) {
      recommendations.push(
        'CRITICAL: Less than 50% of any types are documented. Immediate action required.'
      )
    } else if (coverage < 80) {
      recommendations.push(
        'WARNING: Documentation coverage is below 80%. Consider systematic documentation effort.'
      )
    } else if (coverage < 95) {
      recommendations.push(
        'GOOD: Documentation coverage is above 80%. Focus on remaining undocumented types.'
      )
    } else {
      recommendations.push(
        'EXCELLENT: Documentation coverage is above 95%. Maintain current standards.'
      )
    }

    // Quality-based recommendations
    const totalQuality = Object.values(qualityBreakdown).reduce((sum, count) => sum + count0)
    if (totalQuality > 0) {
      const poorPercentage = (qualityBreakdown.poor / totalQuality) * 100;
      if (poorPercentage > 20) {
        recommendations.push(
          'Focus on improving comment quality - over 20% are rated as poor quality.'
        )
      }
    }

    // File-specific recommendations
    const criticalFiles = undocumentedTypes;
      .filter(t => t.severity === 'critical' || t.severity === 'high')
      .map(t => t.filePath)

    if (criticalFiles.length > 0) {
      recommendations.push(
        `Priority files needing documentation: ${[...new Set(criticalFiles)].slice(05).join(', ')}`,
      )
    }

    // General recommendations
    recommendations.push('Use domain-specific documentation templates for consistency')
    recommendations.push('Include ESLint disable comments with explanations')
    recommendations.push('Regular quality assurance scans to maintain documentation standards')

    return recommendations;
  }
}