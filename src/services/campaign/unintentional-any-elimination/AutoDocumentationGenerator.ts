/**
 * Automatic Documentation Generator for Intentional Any Types
 *
 * This system automatically adds explanatory comments and ESLint disable comments
 * for intentional any types, with domain-specific templates and validation.
 */

import * as fs from 'fs/promises';

import {
  AnyTypeCategory,
  AnyTypeClassification,
  AutoDocumentationGenerator,
  ClassificationContext,
  CodeDomain,
  DocumentationReport,
  DocumentationResult,
  DocumentationTemplate,
  DocumentationValidation
} from './types';

export class AutoDocumentationGeneratorImpl implements AutoDocumentationGenerator {
  private templates: Map<string, DocumentationTemplate> = new Map(),
  private processedFiles: Set<string> = new Set();

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Initialize domain-specific documentation templates
   */
  private initializeTemplates(): void {
    const templates: DocumentationTemplate[] = [
      // Error Handling Templates
      {
        category: AnyTypeCategory.ERROR_HANDLING,
        domain: CodeDomain.UTILITY,
        template:
          '// Intentionally any: Error handling requires flexible typing for unknown error structures',
        eslintDisableComment: '// eslint-disable-next-line @typescript-eslint/no-explicit-any',
        explanation: 'Error objects can have unpredictable structures from various sources'
      },
      {
        category: AnyTypeCategory.ERROR_HANDLING,
        domain: CodeDomain.SERVICE,
        template: '// Intentionally any: Service error handling for external API failures',
        eslintDisableComment: '// eslint-disable-next-line @typescript-eslint/no-explicit-any',
        explanation: 'External services may return varied error formats'
      },

      // External API Templates
      {
        category: AnyTypeCategory.EXTERNAL_API,
        domain: CodeDomain.ASTROLOGICAL,
        template: '// Intentionally any: External astrological API response with dynamic structure',
        eslintDisableComment: '// eslint-disable-next-line @typescript-eslint/no-explicit-any',
        explanation: 'Astrological APIs may return varied planetary position formats'
      },
      {
        category: AnyTypeCategory.EXTERNAL_API,
        domain: CodeDomain.RECIPE,
        template: '// Intentionally any: External recipe API with flexible ingredient data',
        eslintDisableComment: '// eslint-disable-next-line @typescript-eslint/no-explicit-any',
        explanation: 'Recipe APIs have diverse ingredient and nutritional data structures'
      },
      {
        category: AnyTypeCategory.EXTERNAL_API,
        domain: CodeDomain.SERVICE,
        template: '// Intentionally any: External API response with unknown structure',
        eslintDisableComment: '// eslint-disable-next-line @typescript-eslint/no-explicit-any',
        explanation: 'Third-party APIs may change response formats without notice'
      },

      // Test Mock Templates
      {
        category: AnyTypeCategory.TEST_MOCK,
        domain: CodeDomain.TEST,
        template:
          '// Intentionally any: Test mock requires flexible typing for comprehensive testing',
        eslintDisableComment: '// eslint-disable-next-line @typescript-eslint/no-explicit-any',
        explanation: 'Test mocks need to simulate various data structures and edge cases'
      },

      // Dynamic Configuration Templates
      {
        category: AnyTypeCategory.DYNAMIC_CONFIG,
        domain: CodeDomain.CAMPAIGN,
        template:
          '// Intentionally any: Campaign system requires flexible configuration for dynamic behavior',
        eslintDisableComment: '// eslint-disable-next-line @typescript-eslint/no-explicit-any',
        explanation: 'Campaign configurations adapt to various automation scenarios'
      },
      {
        category: AnyTypeCategory.DYNAMIC_CONFIG,
        domain: CodeDomain.INTELLIGENCE,
        template:
          '// Intentionally any: Intelligence system configuration with adaptive parameters',
        eslintDisableComment: '// eslint-disable-next-line @typescript-eslint/no-explicit-any',
        explanation: 'Intelligence systems require flexible configuration for learning algorithms'
      },

      // Legacy Compatibility Templates
      {
        category: AnyTypeCategory.LEGACY_COMPATIBILITY,
        domain: CodeDomain.UTILITY,
        template: '// Intentionally any: Legacy compatibility layer for gradual migration',
        eslintDisableComment: '// eslint-disable-next-line @typescript-eslint/no-explicit-any',
        explanation: 'Maintains compatibility with existing untyped code during migration'
      },

      // Component Templates
      {
        category: AnyTypeCategory.EXTERNAL_API,
        domain: CodeDomain.COMPONENT,
        template: '// Intentionally any: React component props with dynamic external data',
        eslintDisableComment: '// eslint-disable-next-line @typescript-eslint/no-explicit-any',
        explanation: 'Component receives data from external sources with varying structures'
      },

      // Default fallback template
      {
        category: AnyTypeCategory.LEGACY_COMPATIBILITY,
        domain: CodeDomain.UTILITY,
        template: '// Intentionally any: Requires flexible typing for specific use case',
        eslintDisableComment: '// eslint-disable-next-line @typescript-eslint/no-explicit-any',
        explanation: 'Type flexibility needed for this specific implementation'
      }
    ];

    templates.forEach(template => {
      const key = `${template.category}_${template.domain}`;
      this.templates.set(key, template);
    });
  }

  /**
   * Generate documentation for an intentional any type
   */
  async generateDocumentation(
    classification: AnyTypeClassification,
    context: ClassificationContext,
  ): Promise<DocumentationResult> {
    try {
      if (!classification.isIntentional || !classification.requiresDocumentation) {
        return {
          filePath: context.filePath,
          lineNumber: context.lineNumber,
          originalCode: context.codeSnippet,
          documentedCode: context.codeSnippet,
          commentAdded: '',
          success: false,
          error: 'Type is not intentional or does not require documentation'
        };
      }

      // Skip if already has adequate documentation
      if (context.hasExistingComment && this.isCommentAdequate(context.existingComment || '')) {
        return {
          filePath: context.filePath,
          lineNumber: context.lineNumber,
          originalCode: context.codeSnippet,
          documentedCode: context.codeSnippet,
          commentAdded: context.existingComment || '',
          success: true
        };
      }

      const template = this.getTemplate(classification.category, context.domainContext.domain);
      const fileContent = await fs.readFile(context.filePath, 'utf-8');
      const lines = fileContent.split('\n');

      // Generate documentation comment
      const documentationComment = this.generateComment(template, classification, context);
      const eslintDisableComment = template.eslintDisableComment;

      // Insert documentation
      const { updatedLines, insertedComment } = this.insertDocumentation(
        lines,
        context.lineNumber;
        documentationComment,
        eslintDisableComment,
      );

      // Write updated file
      const updatedContent = updatedLines.join('\n');
      await fs.writeFile(context.filePath, updatedContent, 'utf-8');

      this.processedFiles.add(context.filePath);

      return {
        filePath: context.filePath,
        lineNumber: context.lineNumber,
        originalCode: context.codeSnippet,
        documentedCode: updatedLines[context.lineNumber - 1] || context.codeSnippet,
        commentAdded: insertedComment,
        eslintDisableAdded: eslintDisableComment,
        success: true
      };
    } catch (error) {
      return {
        filePath: context.filePath,
        lineNumber: context.lineNumber,
        originalCode: context.codeSnippet,
        documentedCode: context.codeSnippet,
        commentAdded: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Validate existing documentation quality
   */
  async validateDocumentation(context: ClassificationContext): Promise<DocumentationValidation> {
    const hasComment = context.hasExistingComment;
    const comment = context.existingComment || '';

    // Check for ESLint disable comment
    const fileContent = await fs.readFile(context.filePath, 'utf-8');
    const lines = fileContent.split('\n');
    const lineIndex = context.lineNumber - 1;

    const hasEslintDisable = this.hasEslintDisableComment(lines, lineIndex);
    const eslintDisableHasExplanation =
      hasEslintDisable && this.eslintDisableHasExplanation(lines, lineIndex);

    // Assess comment quality
    const commentQuality = this.assessCommentQuality(comment);

    // Check completeness
    const isComplete =
      hasComment && commentQuality !== 'poor' && hasEslintDisable && eslintDisableHasExplanation;

    // Generate suggestions
    const suggestions = this.generateSuggestions(;
      hasComment,
      commentQuality,
      hasEslintDisable,
      eslintDisableHasExplanation,
    ),

    return {
      hasComment,
      commentQuality,
      hasEslintDisable,
      eslintDisableHasExplanation,
      isComplete,
      suggestions
    };
  }

  /**
   * Generate comprehensive documentation report
   */
  async generateReport(): Promise<DocumentationReport> {
    // This would typically scan the entire codebase
    // For nowwe'll return a basic structure
    const report: DocumentationReport = {
      totalIntentionalAnyTypes: 0,
      documentedTypes: 0,
      undocumentedTypes: 0,
      documentationCoverage: 0,
      qualityBreakdown: {
        poor: 0,
        fair: 0,
        good: 0,
        excellent: 0
      },
      undocumentedFiles: [],
      recommendations: [
        'Add explanatory comments for all intentional any types',
        'Include ESLint disable comments with explanations',
        'Use domain-specific documentation templates',
        'Regularly validate documentation completeness'
      ]
    };

    return report;
  }

  /**
   * Get appropriate template for category and domain
   */
  private getTemplate(category: AnyTypeCategory, domain: CodeDomain): DocumentationTemplate {
    const key = `${category}_${domain}`;
    const template = this.templates.get(key);

    if (template) {
      return template
    }

    // Try with default domain
    const defaultKey = `${category}_${CodeDomain.UTILITY}`;
    const defaultTemplate = this.templates.get(defaultKey);

    if (defaultTemplate) {
      return defaultTemplate
    }

    // Fallback to generic template
    return {
      category,
      domain,
      template: '// Intentionally any: Requires flexible typing for specific use case',
      eslintDisableComment: '// eslint-disable-next-line @typescript-eslint/no-explicit-any',
      explanation: 'Type flexibility needed for this specific implementation'
    };
  }

  /**
   * Generate contextual comment based on template and classification
   */
  private generateComment(
    template: DocumentationTemplate,
    classification: AnyTypeClassification,
    context: ClassificationContext,
  ): string {
    let comment = template.template;

    // Add specific reasoning if available
    if (classification.reasoning && classification.reasoning !== template.explanation) {
      comment += ` - ${classification.reasoning}`;
    }

    // Add domain-specific context
    if (context.domainContext.preservationReasons.length > 0) {
      const reason = context.domainContext.preservationReasons[0];
      if (!comment.includes(reason)) {
        comment += ` (${reason})`;
      }
    }

    return comment;
  }

  /**
   * Insert documentation into file lines
   */
  private insertDocumentation(
    lines: string[],
    lineNumber: number,
    comment: string,
    eslintDisable?: string,
  ): { updatedLines: string[], insertedComment: string } {
    const lineIndex = lineNumber - 1;
    const updatedLines = [...lines];
    const indentation = this.getIndentation(lines[lineIndex] || '');

    let insertIndex = lineIndex;
    let insertedComment = comment;

    // Check if there's already a comment on the previous line
    if (lineIndex > 0 && lines[lineIndex - 1] && lines[lineIndex - 1].trim().startsWith('//')) {
      // Replace existing comment
      updatedLines[lineIndex - 1] = `${indentation}${comment}`;
    } else {
      // Insert new comment
      updatedLines.splice(insertIndex, 0, `${indentation}${comment}`);
      insertIndex++;
    }

    // Add ESLint disable comment if needed
    if (eslintDisable && !this.hasEslintDisableComment(lines, lineIndex)) {
      updatedLines.splice(insertIndex, 0, `${indentation}${eslintDisable}`);
      insertedComment += `\n${indentation}${eslintDisable}`;
    }

    return { updatedLines, insertedComment };
  }

  /**
   * Get indentation from a line
   */
  private getIndentation(line: string): string {
    const match = line.match(/^(\s*)/);
    return match ? match[1] : ''
  }

  /**
   * Check if comment is adequate
   */
  private isCommentAdequate(comment: string): boolean {
    if (!comment || comment.trim().length < 15) return false;

    const lowerComment = comment.toLowerCase();
    return (
      lowerComment.includes('intentionally') ||
      lowerComment.includes('deliberately') ||
      lowerComment.includes('required for') ||
      lowerComment.includes('needed for')
    )
  }

  /**
   * Check if ESLint disable comment exists
   */
  private hasEslintDisableComment(lines: string[], lineIndex: number): boolean {
    // Check current line and previous lines
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
        // Check if it's just the disable comment or has explanation
        const parts = line.split('eslint-disable-next-line');
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
    if (!comment || comment.trim().length < 10) {
      return 'poor'
    }

    const lowerComment = comment.toLowerCase();
    let score = 0;

    // Check for intentionality indicators (required for fair+)
    const hasIntentionality =
      lowerComment.includes('intentionally') || lowerComment.includes('deliberately');
    if (hasIntentionality) {
      score += 2;
    }

    // Check for explanation (required for good+)
    const hasExplanation =
      lowerComment.includes('because') ||;
      lowerComment.includes('for') ||
      lowerComment.includes('due to') ||
      lowerComment.includes('requires');
    if (hasExplanation) {
      score += 2;
    }

    // Check for domain-specific context
    const hasDomainContext =
      lowerComment.includes('api') ||;
      lowerComment.includes('external') ||
      lowerComment.includes('dynamic') ||
      lowerComment.includes('flexible');
    if (hasDomainContext) {
      score += 1;
    }

    // Check length and detail (required for excellent)
    const hasDetail = comment.length > 80;
    if (hasDetail) {
      score += 1;
    }

    // More strict scoring
    if (score >= 6) return 'excellent'; // All criteria + detail
    if (score >= 4 && hasIntentionality && hasExplanation) return 'good'; // Intent + explanation + context
    if (score >= 2 && hasIntentionality) return 'fair'; // At least intentionality
    return 'poor';
  }

  /**
   * Generate improvement suggestions
   */
  private generateSuggestions(
    hasComment: boolean,
    commentQuality: 'poor' | 'fair' | 'good' | 'excellent',
    hasEslintDisable: boolean,
    eslintDisableHasExplanation: boolean,
  ): string[] {
    const suggestions: string[] = [];

    if (!hasComment) {
      suggestions.push('Add explanatory comment indicating intentional use of any type');
    } else if (commentQuality === 'poor') {
      suggestions.push('Improve comment quality with more detailed explanation');
    } else if (commentQuality === 'fair') {
      suggestions.push('Consider adding more context about why any type is necessary');
    }

    if (!hasEslintDisable) {
      suggestions.push('Add ESLint disable comment to suppress warnings');
    } else if (!eslintDisableHasExplanation) {
      suggestions.push('Add explanation to ESLint disable comment');
    }

    if (suggestions.length === 0) {
      suggestions.push('Documentation is complete and well-structured');
    }

    return suggestions;
  }
}
