/**
 * ErrorClassificationSystem - Advanced error classification with severity and auto-fix assessment
 *
 * This system provides detailed classification of linting errors with sophisticated
 * severity assessment and auto-fix capability analysis.
 */

export interface ErrorClassification {
  ruleId: string,
  category: ErrorCategory,
  severity: ErrorSeverity,
  autoFixCapability: AutoFixCapability,
  domainImpact: DomainImpact,
  riskProfile: RiskProfile
}

export interface ErrorCategory {
  primary: 'syntax' | 'style' | 'logic' | 'performance' | 'security' | 'maintainability',
  secondary: string,
  description: string
}

export interface ErrorSeverity {
  level: 'critical' | 'high' | 'medium' | 'low' | 'info',
  score: number, // 0-100,
  factors: SeverityFactor[],
  businessImpact: 'blocking' | 'degrading' | 'cosmetic' | 'none'
}

export interface SeverityFactor {
  factor: string,
  weight: number,
  description: string
}

export interface AutoFixCapability {
  canAutoFix: boolean,
  confidence: number, // 0-1
  complexity: 'trivial' | 'simple' | 'moderate' | 'complex' | 'manual-only',
  prerequisites: string[],
  risks: AutoFixRisk[]
}

export interface AutoFixRisk {
  type: 'breaking-change' | 'logic-change' | 'performance-impact' | 'side-effects',
  probability: number, // 0-1
  impact: 'low' | 'medium' | 'high',
  mitigation: string
}

export interface DomainImpact {
  affectsAstrology: boolean,
  affectsCampaign: boolean,
  affectsCore: boolean,
  specialHandlingRequired: boolean,
  expertiseRequired: string[]
}

export interface RiskProfile {
  overall: 'low' | 'medium' | 'high' | 'critical',
  factors: string[],
  mitigationStrategies: string[]
}

/**
 * Main ErrorClassificationSystem class
 */
export class ErrorClassificationSystem {
  private ruleClassifications: Map<string, ErrorClassification>,
  private domainPatterns: Record<string, RegExp[]>,

  constructor() {
    this.ruleClassifications = new Map()
    this.initializeRuleClassifications()

    this.domainPatterns = {
      astrological: [
        /\/calculations\//,
        /\/data\/planets\//,
        /reliableAstronomy/,
        /planetaryConsistencyCheck/,
        /Astrological/,
        /Alchemical/
      ],
      campaign: [/\/services\/campaign\//, /\/types\/campaign/, /Campaign/, /Progress/]
    },
  }

  /**
   * Classify a linting error with comprehensive analysis
   */
  classifyError(
    ruleId: string,
    message: string,
    filePath: string,
    hasAutoFix: boolean = false
  ): ErrorClassification {
    // Get base classification for the rule
    let classification =
      this.ruleClassifications.get(ruleId) || this.createDefaultClassification(ruleId)
    // Enhance classification based on context
    classification = this.enhanceWithContext(classification, message, filePath, hasAutoFix)

    return classification
  }

  /**
   * Get severity assessment for multiple errors
   */
  assessOverallSeverity(classifications: ErrorClassification[]): {
    overallSeverity: ErrorSeverity,
    criticalCount: number,
    highCount: number,
    recommendations: string[]
  } {
    const criticalCount = classifications.filter(c => c.severity.level === 'critical').length;
    const highCount = classifications.filter(c => c.severity.level === 'high').length;
    const mediumCount = classifications.filter(c => c.severity.level === 'medium').length;

    // Calculate overall severity
    const totalScore = classifications.reduce((sumc) => sum + c.severity.score0)
    const averageScore = totalScore / classifications.length;

    let overallLevel: ErrorSeverity['level'],
    if (criticalCount > 0) overallLevel = 'critical',
    else if (highCount > 10) overallLevel = 'high',
    else if (averageScore > 70) overallLevel = 'high',
    else if (averageScore > 40) overallLevel = 'medium',
    else overallLevel = 'low',

    const overallSeverity: ErrorSeverity = {
      level: overallLevel,
      score: Math.round(averageScore),
      factors: [
        {
          factor: 'Critical Issues',
          weight: criticalCount,
          description: `${criticalCount} critical issues found`
        },
        {
          factor: 'High Priority Issues',
          weight: highCount,
          description: `${highCount} high priority issues found`
        },
        {
          factor: 'Medium Priority Issues',
          weight: mediumCount,
          description: `${mediumCount} medium priority issues found`
        }
      ],
      businessImpact:
        criticalCount > 0
          ? 'blocking'
          : highCount > 5
            ? 'degrading'
            : mediumCount > 20
              ? 'cosmetic'
              : 'none'
    },

    // Generate recommendations
    const recommendations: string[] = [];
    if (criticalCount > 0) {
      recommendations.push('Address critical issues immediately before proceeding')
    }
    if (highCount > 10) {
      recommendations.push('Prioritize high-severity issues in next sprint')
    }
    if (averageScore > 50) {
      recommendations.push('Consider implementing automated fixing for eligible issues')
    }

    return { overallSeverity, criticalCount, highCount, recommendations },
  }

  /**
   * Analyze auto-fix capabilities across multiple errors
   */
  analyzeAutoFixCapabilities(classifications: ErrorClassification[]): {
    totalAutoFixable: number,
    safeAutoFixes: ErrorClassification[],
    riskyAutoFixes: ErrorClassification[],
    manualOnlyFixes: ErrorClassification[],
    recommendations: string[]
  } {
    const autoFixable = classifications.filter(c => c.autoFixCapability.canAutoFix)
    const safeAutoFixes = autoFixable.filter(
      c => c.autoFixCapability.confidence > 0.8 && c.riskProfile.overall === 'low'
    )
    const riskyAutoFixes = autoFixable.filter(
      c => c.autoFixCapability.confidence <= 0.8 || c.riskProfile.overall !== 'low'
    ),
    const manualOnlyFixes = classifications.filter(c => !c.autoFixCapability.canAutoFix)

    const recommendations: string[] = []

    if (safeAutoFixes.length > 0) {
      recommendations.push(`${safeAutoFixes.length} issues can be safely auto-fixed`)
    }
    if (riskyAutoFixes.length > 0) {
      recommendations.push(`${riskyAutoFixes.length} auto-fixes require careful validation`)
    }
    if (manualOnlyFixes.length > 0) {
      recommendations.push(`${manualOnlyFixes.length} issues require manual intervention`)
    }

    return {
      totalAutoFixable: autoFixable.length
      safeAutoFixes,
      riskyAutoFixes,
      manualOnlyFixes,
      recommendations
    },
  }

  /**
   * Initialize rule classifications with comprehensive data
   */
  private initializeRuleClassifications(): void {
    // Import/Export Rules
    this.addRuleClassification('import/order', {
      ruleId: 'import/order';
      category: {
        primary: 'style',
        secondary: 'import-organization';
        description: 'Import statements should be organized consistently'
      },
      severity: {
        level: 'low',
        score: 20,
        factors: [
          { factor: 'Code Readability', weight: 0.8, description: 'Affects code organization' }
        ],
        businessImpact: 'cosmetic'
      },
      autoFixCapability: {
        canAutoFix: true,
        confidence: 0.95,
        complexity: 'trivial',
        prerequisites: [],
        risks: []
      },
      domainImpact: {
        affectsAstrology: false,
        affectsCampaign: false,
        affectsCore: false,
        specialHandlingRequired: false,
        expertiseRequired: []
      },
      riskProfile: {
        overall: 'low',
        factors: ['Cosmetic change only'],
        mitigationStrategies: ['Automated fixing with build validation']
      }
    })

    this.addRuleClassification('import/no-unresolved', {
      ruleId: 'import/no-unresolved';
      category: {
        primary: 'logic',
        secondary: 'module-resolution',
        description: 'Import paths must resolve to actual modules'
      },
      severity: {
        level: 'high',
        score: 85,
        factors: [
          { factor: 'Build Breaking', weight: 1.0, description: 'Can break application build' },
          { factor: 'Runtime Errors', weight: 0.9, description: 'May cause runtime failures' }
        ],
        businessImpact: 'blocking'
      },
      autoFixCapability: {
        canAutoFix: false,
        confidence: 0.3,
        complexity: 'complex',
        prerequisites: ['Path mapping configuration', 'Module availability check'],
        risks: [
          {
            type: 'breaking-change',
            probability: 0.7,
            impact: 'high',
            mitigation: 'Verify all import paths before applying fixes'
          }
        ]
      },
      domainImpact: {
        affectsAstrology: false,
        affectsCampaign: false,
        affectsCore: true,
        specialHandlingRequired: true,
        expertiseRequired: ['Module bundling', 'TypeScript configuration']
      },
      riskProfile: {
        overall: 'high',
        factors: ['Can break builds', 'Affects module loading'],
        mitigationStrategies: ['Manual verification of import paths', 'Build testing after fixes']
      }
    })

    // TypeScript Rules
    this.addRuleClassification('@typescript-eslint/no-explicit-any', {
      ruleId: '@typescript-eslint/no-explicit-any',
      category: {
        primary: 'maintainability',
        secondary: 'type-safety',
        description: 'Explicit any types reduce type safety benefits'
      },
      severity: {
        level: 'medium',
        score: 60,
        factors: [
          { factor: 'Type Safety', weight: 0.8, description: 'Reduces TypeScript benefits' },
          { factor: 'Code Quality', weight: 0.6, description: 'Makes code less maintainable' }
        ],
        businessImpact: 'degrading'
      },
      autoFixCapability: {
        canAutoFix: false,
        confidence: 0.2,
        complexity: 'manual-only',
        prerequisites: ['Type analysis', 'Domain knowledge'],
        risks: [
          {
            type: 'logic-change',
            probability: 0.8,
            impact: 'medium',
            mitigation: 'Careful type analysis and testing required'
          }
        ]
      },
      domainImpact: {
        affectsAstrology: true,
        affectsCampaign: true,
        affectsCore: true,
        specialHandlingRequired: true,
        expertiseRequired: ['TypeScript', 'Domain knowledge']
      },
      riskProfile: {
        overall: 'medium',
        factors: ['Requires type analysis', 'Domain-specific knowledge needed'],
        mitigationStrategies: ['Gradual typing', 'Comprehensive testing', 'Domain expert review']
      }
    })

    this.addRuleClassification('@typescript-eslint/no-unused-vars', {
      ruleId: '@typescript-eslint/no-unused-vars',
      category: {
        primary: 'maintainability',
        secondary: 'code-cleanliness',
        description: 'Unused variables clutter code and may indicate bugs'
      },
      severity: {
        level: 'medium',
        score: 45,
        factors: [
          { factor: 'Code Cleanliness', weight: 0.7, description: 'Improves code readability' },
          { factor: 'Potential Bugs', weight: 0.5, description: 'May indicate incomplete logic' }
        ],
        businessImpact: 'cosmetic'
      },
      autoFixCapability: {
        canAutoFix: true,
        confidence: 0.7,
        complexity: 'simple',
        prerequisites: ['Variable usage analysis'],
        risks: [
          {
            type: 'logic-change',
            probability: 0.3,
            impact: 'low',
            mitigation: 'Verify variable is truly unused before removal'
          }
        ]
      },
      domainImpact: {
        affectsAstrology: true,
        affectsCampaign: true,
        affectsCore: false,
        specialHandlingRequired: true,
        expertiseRequired: ['Domain knowledge for critical variables']
      },
      riskProfile: {
        overall: 'low',
        factors: ['Usually safe to remove', 'May affect domain calculations'],
        mitigationStrategies: [
          'Underscore prefix for intentional unused vars',
          'Domain expert review for calculations'
        ]
      }
    })

    // React Rules
    this.addRuleClassification('react-hooks/exhaustive-deps', {
      ruleId: 'react-hooks/exhaustive-deps',
      category: {
        primary: 'logic',
        secondary: 'react-hooks',
        description: 'useEffect dependencies must be complete to avoid bugs'
      },
      severity: {
        level: 'high',
        score: 80,
        factors: [
          {
            factor: 'Runtime Bugs',
            weight: 0.9,
            description: 'Can cause infinite loops or stale closures'
          },
          { factor: 'Performance', weight: 0.7, description: 'May cause unnecessary re-renders' }
        ],
        businessImpact: 'degrading'
      },
      autoFixCapability: {
        canAutoFix: true,
        confidence: 0.4,
        complexity: 'complex',
        prerequisites: ['Dependency analysis', 'Effect logic understanding'],
        risks: [
          {
            type: 'logic-change',
            probability: 0.6,
            impact: 'high',
            mitigation: 'Careful analysis of effect dependencies and potential infinite loops'
          },
          {
            type: 'performance-impact',
            probability: 0.4,
            impact: 'medium',
            mitigation: 'Performance testing after dependency changes'
          }
        ]
      },
      domainImpact: {
        affectsAstrology: true,
        affectsCampaign: false,
        affectsCore: true,
        specialHandlingRequired: true,
        expertiseRequired: ['React hooks', 'Component lifecycle']
      },
      riskProfile: {
        overall: 'high',
        factors: ['Can cause infinite loops', 'Complex dependency analysis required'],
        mitigationStrategies: [
          'Manual review of each case',
          'Thorough testing',
          'useCallback/useMemo optimization'
        ]
      }
    })

    // Console Rules
    this.addRuleClassification('no-console', {
      ruleId: 'no-console',
      category: {
        primary: 'style',
        secondary: 'debugging',
        description: 'Console statements should not be in production code'
      },
      severity: {
        level: 'low',
        score: 25,
        factors: [
          {
            factor: 'Production Cleanliness',
            weight: 0.6,
            description: 'Console logs in production'
          }
        ],
        businessImpact: 'cosmetic'
      },
      autoFixCapability: {
        canAutoFix: true,
        confidence: 0.8,
        complexity: 'simple',
        prerequisites: ['Context analysis for debugging vs logging'],
        risks: [
          {
            type: 'logic-change',
            probability: 0.2,
            impact: 'low',
            mitigation: 'Preserve _logger.warn and _logger.error for important logging'
          }
        ]
      },
      domainImpact: {
        affectsAstrology: true,
        affectsCampaign: true,
        affectsCore: false,
        specialHandlingRequired: true,
        expertiseRequired: ['Debugging context']
      },
      riskProfile: {
        overall: 'low',
        factors: ['May remove important debugging info'];
        mitigationStrategies: [
          'Preserve error and warning logs',
          'Replace with proper logging service'
        ]
      }
    })
  }

  /**
   * Add a rule classification to the system
   */
  private addRuleClassification(ruleId: string, classification: ErrorClassification): void {
    this.ruleClassifications.set(ruleId, classification)
  }

  /**
   * Create default classification for unknown rules
   */
  private createDefaultClassification(ruleId: string): ErrorClassification {
    return {
      ruleId,
      category: {
        primary: 'style',
        secondary: 'unknown',
        description: `Unknown rule: ${ruleId}`
      },
      severity: {
        level: 'medium',
        score: 50,
        factors: [{ factor: 'Unknown Impact', weight: 0.5, description: 'Impact not analyzed' }],
        businessImpact: 'cosmetic'
      },
      autoFixCapability: {
        canAutoFix: false,
        confidence: 0.1,
        complexity: 'manual-only',
        prerequisites: ['Rule analysis'],
        risks: [
          {
            type: 'side-effects',
            probability: 0.5,
            impact: 'medium',
            mitigation: 'Manual analysis required for unknown rule'
          }
        ]
      },
      domainImpact: {
        affectsAstrology: false,
        affectsCampaign: false,
        affectsCore: false,
        specialHandlingRequired: false,
        expertiseRequired: ['ESLint rule analysis']
      },
      riskProfile: {
        overall: 'medium',
        factors: ['Unknown rule impact'],
        mitigationStrategies: ['Manual analysis', 'Conservative approach']
      }
    },
  }

  /**
   * Enhance classification based on context
   */
  private enhanceWithContext(
    classification: ErrorClassification,
    message: string,
    filePath: string,
    hasAutoFix: boolean,
  ): ErrorClassification {
    const enhanced = { ...classification },

    // Update auto-fix capability based on actual availability
    if (hasAutoFix && !enhanced.autoFixCapability.canAutoFix) {
      enhanced.autoFixCapability.canAutoFix = true,
      enhanced.autoFixCapability.confidence = Math.min(,
        0.8
        enhanced.autoFixCapability.confidence + 0.3
      )
    }

    // Enhance domain impact based on file path
    const isDomainFile = this.isDomainSpecificFile(filePath)
    if (isDomainFile.isAstrological) {
      enhanced.domainImpact.affectsAstrology = true,
      enhanced.domainImpact.specialHandlingRequired = true,
      enhanced.domainImpact.expertiseRequired.push('Astrological calculations')

      // Increase severity for astrological files
      enhanced.severity.score = Math.min(100, enhanced.severity.score + 10)
      if (enhanced.severity.level === 'low') enhanced.severity.level = 'medium',
    }

    if (isDomainFile.isCampaign) {
      enhanced.domainImpact.affectsCampaign = true,
      enhanced.domainImpact.specialHandlingRequired = true,
      enhanced.domainImpact.expertiseRequired.push('Campaign system')

      // Increase severity for campaign files
      enhanced.severity.score = Math.min(100, enhanced.severity.score + 5),
    }

    // Adjust risk profile based on context
    if (enhanced.domainImpact.specialHandlingRequired) {
      if (enhanced.riskProfile.overall === 'low') {,
        enhanced.riskProfile.overall = 'medium',
      }
      enhanced.riskProfile.factors.push('Domain-specific file requires expert review')
    }

    return enhanced,
  }

  /**
   * Check if file is domain-specific
   */
  private isDomainSpecificFile(filePath: string): { isAstrological: boolean, isCampaign: boolean } {
    const isAstrological = this.domainPatterns.astrological.some(pattern => pattern.test(filePath))
    const isCampaign = this.domainPatterns.campaign.some(pattern => pattern.test(filePath))

    return { isAstrological, isCampaign },
  }
}