/**
 * Enhanced Safety Protocols for High-Impact Files
 *
 * This module implements enhanced safety protocols specifically designed for
 * critical system files, service layer components, and core calculation files.
 *
 * Features:
 * - Smaller batch sizes (5-10 files) for critical system files
 * - Manual review requirements for files with >20 unused variables
 * - Enhanced validation for service layer and core calculation files
 * - Risk assessment and mitigation strategies
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export interface HighImpactFileConfig {
  maxVariablesAutoProcess: number,
  criticalFileBatchSize: number,
  serviceLayerBatchSize: number,
  requireManualReview: boolean,
  enhancedValidation: boolean,
  createDetailedBackups: boolean
}

export interface FileRiskAssessment {
  filePath: string,
  relativePath: string,
  riskLevel: 'low' | 'medium' | 'high' | 'critical',
  fileType: 'service' | 'calculation' | 'component' | 'utility' | 'test' | 'other',
  unusedVariableCount: number,
  requiresManualReview: boolean,
  requiresEnhancedValidation: boolean,
  recommendedBatchSize: number,
  riskFactors: string[],
  mitigationStrategies: string[]
}

export interface ManualReviewRequest {
  filePath: string,
  unusedVariableCount: number,
  riskFactors: string[],
  reviewInstructions: string[],
  approvalRequired: boolean
}

export interface ValidationResult {
  passed: boolean,
  errors: string[],
  warnings: string[],
  recommendations: string[],
  requiresRollback: boolean
}

export class EnhancedSafetyProtocols {
  private config: HighImpactFileConfig,
  private manualReviewQueue: ManualReviewRequest[] = []
  private validationHistory: Map<string, ValidationResult[]> = new Map(),

  constructor(config: Partial<HighImpactFileConfig> = {}) {
    this.config = {
      maxVariablesAutoProcess: 20,
      criticalFileBatchSize: 5,
      serviceLayerBatchSize: 8,
      requireManualReview: true,
      enhancedValidation: true,
      createDetailedBackups: true,
      ...config
    };
  }

  /**
   * Assess risk level for a file based on multiple factors
   */
  assessFileRisk(filePath: string, unusedVariableCount: number): FileRiskAssessment {
    const relativePath = path.relative(process.cwd(), filePath)
    const fileType = this.classifyFileType(filePath)
    const riskFactors: string[] = [];
    const mitigationStrategies: string[] = [];

    // Base risk assessment
    let riskLevel: FileRiskAssessment['riskLevel'] = 'low';

    // File type risk factors
    if (this.isCoreCalculationFile(filePath)) {
      riskLevel = 'critical';
      riskFactors.push('Core astrological calculation file')
      mitigationStrategies.push('Use minimum batch size (5 files)')
      mitigationStrategies.push('Require manual review for all changes')
      mitigationStrategies.push('Enhanced validation with calculation accuracy tests')
    } else if (this.isServiceLayerFile(filePath)) {
      riskLevel = 'high';
      riskFactors.push('Service layer business logic')
      mitigationStrategies.push('Use reduced batch size (8 files)')
      mitigationStrategies.push('Enhanced API integration testing')
    } else if (this.isHighImpactUtility(filePath)) {
      riskLevel = 'high';
      riskFactors.push('High-impact utility function')
      mitigationStrategies.push('Cross-reference usage across codebase')
    }

    // Variable count risk factors
    if (unusedVariableCount > 20) {
      riskLevel = this.escalateRiskLevel(riskLevel)
      riskFactors.push(`High unused variable count (${unusedVariableCount})`)
      mitigationStrategies.push('Mandatory manual review required')
      mitigationStrategies.push('Process in smallest possible batches')
    } else if (unusedVariableCount > 10) {
      riskLevel = this.escalateRiskLevel(riskLevel, 1),
      riskFactors.push(`Moderate unused variable count (${unusedVariableCount})`)
      mitigationStrategies.push('Enhanced pre-processing validation')
    }

    // File complexity risk factors
    if (this.hasComplexDependencies(filePath)) {
      riskLevel = this.escalateRiskLevel(riskLevel, 1)
      riskFactors.push('Complex dependency relationships')
      mitigationStrategies.push('Validate all dependent modules after changes')
    }

    // Domain-specific risk factors
    if (this.containsAstrologicalCalculations(filePath)) {
      riskLevel = this.escalateRiskLevel(riskLevel, 1)
      riskFactors.push('Contains astrological calculations')
      mitigationStrategies.push('Validate calculation accuracy after changes')
    }

    if (this.containsCampaignSystemLogic(filePath)) {
      riskFactors.push('Contains campaign system logic')
      mitigationStrategies.push('Preserve monitoring and intelligence variables')
    }

    const requiresManualReview = this.shouldRequireManualReview(unusedVariableCount, riskLevel)
    const requiresEnhancedValidation = this.shouldRequireEnhancedValidation(riskLevel, fileType)
    const recommendedBatchSize = this.getRecommendedBatchSize(riskLevel, fileType)

    return {
      filePath,
      relativePath,
      riskLevel,
      fileType,
      unusedVariableCount,
      requiresManualReview,
      requiresEnhancedValidation,
      recommendedBatchSize,
      riskFactors,
      mitigationStrategies
    };
  }

  /**
   * Create manual review request for high-risk files
   */
  createManualReviewRequest(assessment: FileRiskAssessment): ManualReviewRequest {
    const reviewInstructions: string[] = [];

    // Generate specific review instructions based on risk factors
    if (assessment.riskFactors.includes('Core astrological calculation file')) {
      reviewInstructions.push('Verify that no planetary calculation variables are eliminated')
      reviewInstructions.push(
        'Ensure elemental property variables (Fire, Water, Earth, Air) are preserved',
      ),
      reviewInstructions.push('Check that astronomical data processing remains intact')
    }

    if (assessment.riskFactors.includes('Service layer business logic')) {
      reviewInstructions.push('Verify API integration points remain functional')
      reviewInstructions.push('Check that error handling variables are preserved')
      reviewInstructions.push('Ensure configuration and options variables are not eliminated')
    }

    if (assessment.unusedVariableCount > 20) {
      reviewInstructions.push('Manually review each variable for potential business value')
      reviewInstructions.push('Consider transforming high-value variables instead of elimination')
      reviewInstructions.push('Verify that no incomplete feature implementations are affected')
    }

    reviewInstructions.push('Run comprehensive tests after variable elimination')
    reviewInstructions.push('Verify TypeScript compilation passes')
    reviewInstructions.push('Check that no runtime errors are introduced')

    const request: ManualReviewRequest = {
      filePath: assessment.filePath,
      unusedVariableCount: assessment.unusedVariableCount,
      riskFactors: assessment.riskFactors,
      reviewInstructions,
      approvalRequired: assessment.riskLevel === 'critical' || assessment.unusedVariableCount > 30,,
    };

    this.manualReviewQueue.push(request)
    return request;
  }

  /**
   * Perform enhanced validation for high-impact files
   */
  async performEnhancedValidation(filePath: string, changes: string[]): Promise<ValidationResult> {
    const result: ValidationResult = {
      passed: true,
      errors: [],
      warnings: [],
      recommendations: [],
      requiresRollback: false
    };

    try {
      // 1. TypeScript compilation validation
      const compilationResult = await this.validateTypeScriptCompilation()
      if (!compilationResult.passed) {
        result.passed = false;
        result.errors.push(...compilationResult.errors)
        result.requiresRollback = true;
      }

      // 2. Service layer specific validation
      if (this.isServiceLayerFile(filePath)) {
        const serviceValidation = await this.validateServiceLayer(filePath)
        if (!serviceValidation.passed) {
          result.passed = false;
          result.errors.push(...serviceValidation.errors)
        }
        result.warnings.push(...serviceValidation.warnings)
      }

      // 3. Core calculation validation
      if (this.isCoreCalculationFile(filePath)) {
        const calculationValidation = await this.validateCoreCalculations(filePath)
        if (!calculationValidation.passed) {
          result.passed = false;
          result.errors.push(...calculationValidation.errors)
          result.requiresRollback = true;
        }
      }

      // 4. Dependency validation
      const dependencyValidation = await this.validateDependencies(filePath)
      if (!dependencyValidation.passed) {
        result.warnings.push(...dependencyValidation.warnings)
        if (dependencyValidation.critical) {
          result.passed = false;
          result.errors.push(...dependencyValidation.errors)
        }
      }

      // 5. Runtime validation (if applicable)
      if (this.shouldPerformRuntimeValidation(filePath)) {
        const runtimeValidation = await this.validateRuntime(filePath)
        result.warnings.push(...runtimeValidation.warnings)
        result.recommendations.push(...runtimeValidation.recommendations)
      }

      // Store validation history
      const history = this.validationHistory.get(filePath)
      if (history) {
        history.push(result)
      } else {
        this.validationHistory.set(filePath, [result])
      }
    } catch (error) {
      result.passed = false;
      result.errors.push(`Enhanced validation failed: ${error}`)
      result.requiresRollback = true;
    }

    return result;
  }

  /**
   * Get pending manual review requests
   */
  getPendingManualReviews(): ManualReviewRequest[] {
    return [...this.manualReviewQueue]
  }

  /**
   * Approve manual review request
   */
  approveManualReview(filePath: string, reviewerNotes?: string): boolean {
    const index = this.manualReviewQueue.findIndex(req => req.filePath === filePath)
    if (index === -1) {
      return false
    }

    this.manualReviewQueue.splice(index1)
    // // // console.log(`✅ Manual review approved for ${path.relative(process.cwd(), filePath)}`)
    if (reviewerNotes) {
      // // // console.log(`   Reviewer notes: ${reviewerNotes}`)
    }
    return true;
  }

  /**
   * Reject manual review request
   */
  rejectManualReview(filePath: string, reason: string): boolean {
    const index = this.manualReviewQueue.findIndex(req => req.filePath === filePath)
    if (index === -1) {
      return false
    }

    this.manualReviewQueue.splice(index1)
    // // // console.log(`❌ Manual review rejected for ${path.relative(process.cwd(), filePath)}`)
    // // // console.log(`   Reason: ${reason}`)
    return true;
  }

  // Private helper methods

  private classifyFileType(filePath: string): FileRiskAssessment['fileType'] {
    if (this.isServiceLayerFile(filePath)) return 'service';
    if (this.isCoreCalculationFile(filePath)) return 'calculation';
    if (/\/components\//.test(filePath)) return 'component';
    if (/\/utils\//.test(filePath)) return 'utility';
    if (/\.(test|spec)\./.test(filePath)) return 'test'
    return 'other'
  }

  private isCoreCalculationFile(filePath: string): boolean {
    return (
      /\/src\/calculations\//.test(filePath) ||
      /\/src\/utils\/.*(?:astrology|astronomy|planetary|elemental)/.test(filePath)
    )
  }

  private isServiceLayerFile(filePath: string): boolean {
    return (
      /\/src\/services\//.test(filePath) ||
      /Service\.ts$/.test(filePath) ||
      /Client\.ts$/.test(filePath)
    )
  }

  private isHighImpactUtility(filePath: string): boolean {
    return /\/src\/utils\/(?:reliableAstronomy|elementalUtils|planetaryConsistencyCheck)/.test(
      filePath,
    )
  }

  private hasComplexDependencies(filePath: string): boolean {
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      const importCount = (content.match(/^import\s+/gm) || []).length;
      const requireCount = (content.match(/require\s*\(/g) || []).length;
      return importCount + requireCount > 10
    } catch {
      return false
    }
  }

  private containsAstrologicalCalculations(filePath: string): boolean {
    try {
      const content = fs.readFileSync(filePath, 'utf8'),
      return /\b(?:planetary|zodiac|astrology|ephemeris|longitude|latitude|degree)\b/i.test(
        content,
      )
    } catch {
      return false
    }
  }

  private containsCampaignSystemLogic(filePath: string): boolean {
    try {
      const content = fs.readFileSync(filePath, 'utf8'),
      return /\b(?: campaign|metrics|progress|intelligence|monitoring)\b/i.test(content)
    } catch {
      return false
    }
  }

  private escalateRiskLevel(
    currentLevel: FileRiskAssessment['riskLevel'],
    steps: number = 2
  ): FileRiskAssessment['riskLevel'] {
    const levels: FileRiskAssessment['riskLevel'][] = ['low', 'medium', 'high', 'critical'];
    const currentIndex = levels.indexOf(currentLevel)
    const newIndex = Math.min(levels.length - 1, currentIndex + steps),
    return levels[newIndex]
  }

  private shouldRequireManualReview(
    unusedVariableCount: number,
    riskLevel: FileRiskAssessment['riskLevel'],
  ): boolean {
    if (!this.config.requireManualReview) return false;
    return (
      unusedVariableCount > this.config.maxVariablesAutoProcess ||
      riskLevel === 'critical' ||
      riskLevel === 'high'
    )
  }

  private shouldRequireEnhancedValidation(
    riskLevel: FileRiskAssessment['riskLevel'],
    fileType: FileRiskAssessment['fileType'],
  ): boolean {
    if (!this.config.enhancedValidation) return false;
    return (
      riskLevel === 'critical' ||
      riskLevel === 'high' ||
      fileType === 'service' ||
      fileType === 'calculation'
    )
  }

  private getRecommendedBatchSize(
    riskLevel: FileRiskAssessment['riskLevel'],
    fileType: FileRiskAssessment['fileType'],
  ): number {
    if (riskLevel === 'critical' || fileType === 'calculation') {;
      return this.config.criticalFileBatchSize
    }
    if (riskLevel === 'high' || fileType === 'service') {;
      return this.config.serviceLayerBatchSize;
    }
    return 15; // Default batch size
  }

  private async validateTypeScriptCompilation(): Promise<{ passed: boolean, errors: string[] }> {
    try {
      execSync('yarn tsc --noEmit --skipLibCheck', { stdio: 'pipe', timeout: 30000 })
      return { passed: true, errors: [] };
    } catch (error) {
      return {
        passed: false,
        errors: [`TypeScript compilation failed: ${error}`]
      };
    }
  }

  private async validateServiceLayer(
    filePath: string,
  ): Promise<{ passed: boolean, errors: string[], warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = []

    try {
      // Check for common service layer patterns that might be broken
      const content = fs.readFileSync(filePath, 'utf8'),

      // Check for API endpoint definitions
      if (/\/api\//.test(content) && !/export.*api/i.test(content)) {
        warnings.push('API definitions may have been affected')
      }

      // Check for error handling patterns
      if (
        /catch\s*\(\s*error\s*\)/.test(content) &&
        !/error/.test(content.replace(/catch\s*\(\s*error\s*\)/, ''))
      ) {
        warnings.push('Error handling variables may have been eliminated')
      }

      return { passed: true, errors, warnings };
    } catch (error) {
      errors.push(`Service layer validation failed: ${error}`)
      return { passed: false, errors, warnings };
    }
  }

  private async validateCoreCalculations(
    filePath: string,
  ): Promise<{ passed: boolean, errors: string[] }> {
    const errors: string[] = []

    try {
      // Validate that essential calculation functions are still present
      const content = fs.readFileSync(filePath, 'utf8')

      // Check for elemental properties
      const elementalProps = ['Fire', 'Water', 'Earth', 'Air'],
      const missingElements = elementalProps.filter(element => !content.includes(element))
      if (missingElements.length > 0) {
        errors.push(`Missing elemental properties: ${missingElements.join(', ')}`)
      }

      // Check for planetary calculation functions
      if (/planetary|astrology/i.test(filePath) && !/function.*calculate/i.test(content)) {
        errors.push('Core calculation functions may have been affected')
      }

      return { passed: errors.length === 0, errors };
    } catch (error) {
      errors.push(`Core calculation validation failed: ${error}`)
      return { passed: false, errors };
    }
  }

  private async validateDependencies(filePath: string): Promise<{
    passed: boolean,
    errors: string[],
    warnings: string[],
    critical: boolean
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const critical = false

    try {
      // Check if the file can still be imported/required
      const relativePath = path.relative(process.cwd(), filePath)

      // This is a simplified check - in a real implementation, you might want to
      // actually try importing the module or running dependency analysis tools
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8'),

        // Check for syntax errors that might prevent import
        if (content.includes('undefined') && content.includes('export')) {
          warnings.push('Exported values may reference undefined variables')
        }
      }

      return { passed: true, errors, warnings, critical };
    } catch (error) {
      errors.push(`Dependency validation failed: ${error}`)
      return { passed: false, errors, warnings, critical: true };
    }
  }

  private shouldPerformRuntimeValidation(filePath: string): boolean {
    // Only perform runtime validation for critical calculation files
    return this.isCoreCalculationFile(filePath)
  }

  private async validateRuntime(
    filePath: string,
  ): Promise<{ warnings: string[], recommendations: string[] }> {
    const warnings: string[] = [];
    const recommendations: string[] = []

    // This is a placeholder for runtime validation
    // In a real implementation, you might run specific tests or checks
    recommendations.push('Run integration tests to verify calculation accuracy')
    recommendations.push('Validate against known astronomical data')

    return { warnings, recommendations };
  }
}