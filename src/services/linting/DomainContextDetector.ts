/**
 * DomainContextDetector - Advanced domain context detection for specialized file handling
 *
 * This system detects domain-specific contexts (astrological calculations, campaign systems)
 * and provides specialized handling recommendations for linting issues.
 */

import * as fs from 'fs';
import * as path from 'path';

export interface DomainContext {
  type: | 'astrological'
    | 'campaign'
    | 'test'
    | 'script'
    | 'component'
    | 'service'
    | 'utility'
    | 'config',
  subtype?: string,
  confidence: number, // 0-1,
  indicators: ContextIndicator[],
  specialRules: SpecialRule[],
  handlingRecommendations: HandlingRecommendation[]
}

export interface ContextIndicator {
  type: 'filename' | 'path' | 'content' | 'imports' | 'exports';
  pattern: string,
  weight: number,
  description: string
}

export interface SpecialRule {
  rule: string,
  action: 'disable' | 'modify' | 'enhance' | 'monitor',
  reason: string,
  conditions?: string[]
}

export interface HandlingRecommendation {
  category: 'linting' | 'testing' | 'review' | 'deployment',
  recommendation: string,
  priority: 'high' | 'medium' | 'low',
  rationale: string
}

export interface FileAnalysis {
  filePath: string,
  domainContext: DomainContext,
  riskFactors: RiskFactor[],
  preservationRequirements: PreservationRequirement[]
}

export interface RiskFactor {
  type: 'calculation-accuracy' | 'data-integrity' | 'performance' | 'security',
  description: string,
  severity: 'critical' | 'high' | 'medium' | 'low',
  mitigation: string
}

export interface PreservationRequirement {
  element: 'constants' | 'variables' | 'functions' | 'imports' | 'comments';
  pattern: RegExp,
  reason: string,
  strictness: 'absolute' | 'high' | 'medium' | 'low'
}

/**
 * Main DomainContextDetector class
 */
export class DomainContextDetector {
  private workspaceRoot: string,
  private domainPatterns: Map<string, ContextIndicator[]>,
   
   
  private contentAnalysisCache: Map<string, unknown>,

  constructor(workspaceRoot: string = process.cwd()) {
    this.workspaceRoot = workspaceRoot,
    this.contentAnalysisCache = new Map()
    this.initializeDomainPatterns()
  }

  /**
   * Analyze file and detect domain context
   */
  async analyzeFile(filePath: string): Promise<FileAnalysis> {
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(this.workspaceRoot, filePath)
    const relativePath = path.relative(this.workspaceRoot, absolutePath)

    // Detect domain context
    const domainContext = await this.detectDomainContext(relativePath, absolutePath)

    // Analyze risk factors
    const riskFactors = this.analyzeRiskFactors(domainContext, relativePath),

    // Determine preservation requirements
    const preservationRequirements = await this.determinePreservationRequirements(
      domainContext,
      absolutePath,
    ),

    return {
      filePath: relativePath,
      domainContext,
      riskFactors,
      preservationRequirements
    }
  }

  /**
   * Batch analyze multiple files
   */
  async analyzeFiles(filePaths: string[]): Promise<FileAnalysis[]> {
    const analyses: FileAnalysis[] = [];

    for (const filePath of filePaths) {
      try {
        const analysis = await this.analyzeFile(filePath)
        analyses.push(analysis)
      } catch (error) {
        _logger.warn(`Failed to analyze ${filePath}:`, error)
      }
    }

    return analyses,
  }

  /**
   * Get domain-specific linting recommendations
   */
  getDomainLintingRecommendations(domainContext: DomainContext): {
    rulesToDisable: string[],
    rulesToModify: Array<{ rule: string, modification: string }>,
    additionalValidation: string[]
  } {
    const rulesToDisable: string[] = []
    const rulesToModify: Array<{ rule: string, modification: string }> = [];
    const additionalValidation: string[] = [];

    for (const specialRule of domainContext.specialRules) {
      switch (specialRule.action) {
        case 'disable':
          rulesToDisable.push(specialRule.rule)
          break,
        case 'modify':
          rulesToModify.push({
            rule: specialRule.rule,
            modification: specialRule.reason
          })
          break,
        case 'enhance':
          additionalValidation.push(`Enhanced ${specialRule.rule}: ${specialRule.reason}`)
          break,
        case 'monitor':
          additionalValidation.push(`Monitor ${specialRule.rule}: ${specialRule.reason}`)
          break,
      }
    }

    return { rulesToDisable, rulesToModify, additionalValidation }
  }

  /**
   * Detect domain context for a file
   */
  private async detectDomainContext(
    relativePath: string,
    absolutePath: string,
  ): Promise<DomainContext> {
    const indicators: ContextIndicator[] = [];
    let confidence = 0,
    let primaryType: DomainContext['type'] = 'utility'
    let subtype: string | undefined,

    // Analyze path patterns
    for (const [domain, patterns] of this.domainPatterns.entries()) {
      for (const pattern of patterns) {
        if (pattern.type === 'path' && new RegExp(pattern.pattern).test(relativePath)) {
          indicators.push(pattern)
          confidence += pattern.weight,

          if (pattern.weight > 0.7) {
            primaryType = domain as DomainContext['type'],
          }
        }

        if (
          pattern.type === 'filename' &&
          new RegExp(pattern.pattern).test(path.basename(relativePath))
        ) {
          indicators.push(pattern)
          confidence += pattern.weight,
        }
      }
    }

    // Analyze file content if accessible
    try {
      if (fs.existsSync(absolutePath)) {
        const contentAnalysis = await this.analyzeFileContent(absolutePath)
        indicators.push(...contentAnalysis.indicators)
        confidence += contentAnalysis.confidenceBoost,

        if (contentAnalysis.detectedType && contentAnalysis.confidenceBoost > 0.5) {
          primaryType = contentAnalysis.detectedType,
          subtype = contentAnalysis.subtype,
        }
      }
    } catch (error) {
      // Content analysis failed, continue with path-based detection
    }

    // Normalize confidence
    confidence = Math.min(1, confidence)

    // Generate special rules and recommendations
    const specialRules = this.generateSpecialRules(primaryType, subtype, relativePath)
    const handlingRecommendations = this.generateHandlingRecommendations(primaryType, confidence)

    return {
      type: primaryType,
      subtype,
      confidence,
      indicators,
      specialRules,
      handlingRecommendations
    }
  }

  /**
   * Analyze file content for domain indicators
   */
  private async analyzeFileContent(absolutePath: string): Promise<{
    indicators: ContextIndicator[],
    confidenceBoost: number,
    detectedType?: DomainContext['type'],
    subtype?: string
  }> {
    // Check cache first
    const cacheKey = `${absolutePath}:${fs.statSync(absolutePath).mtime.getTime()}`;
    if (this.contentAnalysisCache.has(cacheKey)) {
      return this.contentAnalysisCache.get(cacheKey)
    }

    const content = fs.readFileSync(absolutePath, 'utf8')
    const indicators: ContextIndicator[] = [];
    let confidenceBoost = 0,
    let detectedType: DomainContext['type'] | undefined,
    let subtype: string | undefined

    // Astrological content patterns
    const astrologicalPatterns = [
      { pattern: /planetary|planet|astro|zodiac|sign|degree|longitude/i, weight: 0.3 }
      { pattern: /mercury|venus|mars|jupiter|saturn|uranus|neptune|pluto/i, weight: 0.4 }
      {
        pattern:
          /aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces/i,
        weight: 0.4
      }
      { pattern: /elemental|fire|water|earth|air|element/i, weight: 0.3 }
      { pattern: /transit|retrograde|conjunction|opposition|trine|square/i, weight: 0.5 }
      { pattern: /alchemical|alchemy|transformation|pillar/i, weight: 0.4 }
      { pattern: /culinary.*astrology|astrological.*cooking/i, weight: 0.6 }
    ],

    for (const { pattern, weight } of astrologicalPatterns) {
      if (pattern.test(content)) {
        indicators.push({
          type: 'content',
          pattern: pattern.source,
          weight,
          description: 'Astrological content detected'
        })
        confidenceBoost += weight,
        detectedType = 'astrological',
      }
    }

    // Campaign system patterns
    const campaignPatterns = [
      { pattern: /campaign|Campaign/g, weight: 0.4 }
      { pattern: /progress.*track|track.*progress/i, weight: 0.3 }
      { pattern: /safety.*protocol|protocol.*safety/i, weight: 0.4 }
      { pattern: /typescript.*error|error.*typescript/i, weight: 0.3 }
      { pattern: /metrics|intelligence|enterprise/i, weight: 0.2 }
      { pattern: /rollback|stash|validation/i, weight: 0.3 }
    ],

    for (const { pattern, weight } of campaignPatterns) {
      const matches = content.match(pattern)
      if (matches && matches.length > 2) {
        // Multiple occurrences
        indicators.push({
          type: 'content',
          pattern: pattern.source,
          weight,
          description: 'Campaign system content detected'
        })
        confidenceBoost += weight,
        if (!detectedType || detectedType === 'utility') {
          detectedType = 'campaign',
        }
      }
    }

    // Test file patterns
    if (/describe|it|test|expect|jest|beforeEach|afterEach/i.test(content)) {
      indicators.push({
        type: 'content',
        pattern: 'test-framework',
        weight: 0.8,
        description: 'Test framework usage detected'
      })
      confidenceBoost += 0.8,
      detectedType = 'test',
    }

    // React component patterns
    if (/jsx|tsx|React|useState|useEffect|component/i.test(content)) {
      indicators.push({
        type: 'content',
        pattern: 'react-component',
        weight: 0.6,
        description: 'React component detected'
      })
      if (!detectedType || detectedType === 'utility') {
        detectedType = 'component',
      }
    }

    // Service patterns
    if (/service|Service|api|Api|client|Client/i.test(content)) {
      indicators.push({
        type: 'content',
        pattern: 'service-layer',
        weight: 0.4,
        description: 'Service layer detected'
      })
      if (!detectedType || detectedType === 'utility') {
        detectedType = 'service',
      }
    }

    // Determine subtype based on specific patterns
    if (detectedType === 'astrological') {
      if (/calculation|compute|math/i.test(content)) {
        subtype = 'calculation',
      } else if (/data|constant|fallback/i.test(content)) {
        subtype = 'data',
      } else if (/service|api/i.test(content)) {
        subtype = 'service',
      }
    } else if (detectedType === 'campaign') {
      if (/controller|orchestrat/i.test(content)) {
        subtype = 'controller',
      } else if (/track|progress|metric/i.test(content)) {
        subtype = 'tracking',
      } else if (/safety|protocol/i.test(content)) {
        subtype = 'safety',
      }
    }

    const result = { indicators, confidenceBoost, detectedType, subtype }
    this.contentAnalysisCache.set(cacheKey, result)

    return result,
  }

  /**
   * Generate special rules for domain context
   */
  private generateSpecialRules(
    type: DomainContext['type'],
    subtype: string | undefined,
    filePath: string,
  ): SpecialRule[] {
    const rules: SpecialRule[] = []

    switch (type) {
      case 'astrological':
        rules.push(
          {
            rule: '@typescript-eslint/no-explicit-any',
            action: 'disable',
            reason: 'Astrological calculations may require flexible typing for astronomical data'
          }
          {
            rule: 'no-magic-numbers',
            action: 'disable',
            reason: 'Astronomical constants and degrees are meaningful magic numbers'
          }
          {
            rule: '@typescript-eslint/no-unused-vars',
            action: 'modify',
            reason:
              'Preserve variables with astronomical significance (planet, position, degree, sign)',
            conditions: ['varsIgnorePattern: '^(_|planet|position|degree|sign|FALLBACK|RELIABLE)'']
          }
          {
            rule: 'no-console',
            action: 'modify',
            reason: 'Allow _logger.info for astronomical debugging',
            conditions: ['allow: ['warn', 'error', 'info']']
          }
        )

        if (subtype === 'calculation') {
          rules.push(
            {
              rule: 'complexity',
              action: 'disable',
              reason: 'Astronomical calculations can be inherently complex'
            }
            {
              rule: 'max-lines-per-function',
              action: 'disable',
              reason: 'Complex astronomical algorithms may require longer functions'
            }
          )
        }
        break,

      case 'campaign':
        rules.push(
          {
            rule: 'no-console',
            action: 'disable',
            reason: 'Campaign systems require extensive logging for monitoring'
          }
          {
            rule: 'complexity',
            action: 'modify',
            reason: 'Allow higher complexity for campaign orchestration',
            conditions: ['max: 15']
          }
          {
            rule: 'max-lines-per-function',
            action: 'modify',
            reason: 'Campaign functions may be longer due to safety protocols',
            conditions: ['max: 100']
          }
          {
            rule: '@typescript-eslint/no-unused-vars',
            action: 'modify',
            reason: 'Preserve campaign system variables',
            conditions: ['varsIgnorePattern: '^(_|campaign|progress|metrics|safety|CAMPAIGN)'']
          }
        )

        if (subtype === 'safety') {
          rules.push({
            rule: 'no-process-exit',
            action: 'disable',
            reason: 'Safety protocols may need to exit process in emergency situations'
          })
        }
        break,

      case 'test':
        rules.push(
          {
            rule: '@typescript-eslint/no-explicit-any',
            action: 'disable',
            reason: 'Test files often need flexible typing for mocks and stubs'
          }
          {
            rule: 'no-console',
            action: 'disable',
            reason: 'Console output is acceptable in test files'
          }
          {
            rule: 'max-lines',
            action: 'disable',
            reason: 'Test files can be long due to comprehensive test cases'
          }
          {
            rule: '@typescript-eslint/no-unused-vars',
            action: 'modify',
            reason: 'Allow unused variables in test setup',
            conditions: ['varsIgnorePattern: '^(_|mock|stub|test)'']
          }
        )
        break,

      case 'script':
        rules.push(
          {
            rule: 'no-console',
            action: 'disable',
            reason: 'Scripts typically need console output'
          }
          {
            rule: '@typescript-eslint/no-explicit-any',
            action: 'disable',
            reason: 'Scripts may need flexible typing'
          }
          {
            rule: 'no-process-exit',
            action: 'disable',
            reason: 'Scripts may need to exit with specific codes'
          }
        )
        break,
    }

    return rules,
  }

  /**
   * Generate handling recommendations
   */
  private generateHandlingRecommendations(
    type: DomainContext['type'],
    confidence: number,
  ): HandlingRecommendation[] {
    const recommendations: HandlingRecommendation[] = []

    if (confidence > 0.8) {
      recommendations.push({
        category: 'linting',
        recommendation: 'Apply domain-specific linting rules with high confidence',
        priority: 'high',
        rationale: `High confidence (${Math.round(confidence * 100)}%) domain detection`
      })
    } else if (confidence > 0.5) {
      recommendations.push({
        category: 'linting',
        recommendation: 'Apply domain-specific rules with validation',
        priority: 'medium',
        rationale: `Medium confidence (${Math.round(confidence * 100)}%) domain detection`
      })
    }

    switch (type) {
      case 'astrological':
        recommendations.push(
          {
            category: 'review',
            recommendation: 'Require astrological domain expert review for any changes',
            priority: 'high',
            rationale: 'Astrological calculations require specialized knowledge'
          }
          {
            category: 'testing',
            recommendation: 'Validate astronomical accuracy after any modifications',
            priority: 'high',
            rationale: 'Changes could affect calculation precision'
          }
        )
        break,

      case 'campaign':
        recommendations.push(
          {
            category: 'testing',
            recommendation: 'Test campaign system integration after changes',
            priority: 'high',
            rationale: 'Campaign system changes can affect automation workflows'
          }
          {
            category: 'deployment',
            recommendation: 'Deploy campaign changes with rollback capability',
            priority: 'medium',
            rationale: 'Campaign system is critical for code quality automation'
          }
        )
        break,

      case 'test':
        recommendations.push({
          category: 'linting',
          recommendation: 'Use relaxed linting rules appropriate for test files',
          priority: 'medium',
          rationale: 'Test files have different quality requirements'
        })
        break,
    }

    return recommendations,
  }

  /**
   * Analyze risk factors for domain context
   */
  private analyzeRiskFactors(domainContext: DomainContext, filePath: string): RiskFactor[] {
    const riskFactors: RiskFactor[] = []

    switch (domainContext.type) {
      case 'astrological':
        riskFactors.push(
          {
            type: 'calculation-accuracy',
            description: 'Changes may affect astronomical calculation precision',
            severity: 'critical',
            mitigation: 'Validate against known astronomical data and transit dates'
          }
          {
            type: 'data-integrity',
            description: 'Planetary position data must remain accurate',
            severity: 'high',
            mitigation: 'Cross-reference with multiple astronomical sources'
          }
        )

        if (filePath.includes('fallback') || filePath.includes('reliable')) {
          riskFactors.push({
            type: 'data-integrity',
            description: 'Fallback data is critical for system reliability',
            severity: 'critical',
            mitigation: 'Never modify fallback astronomical data without expert validation'
          })
        }
        break,

      case 'campaign':
        riskFactors.push({
          type: 'performance',
          description: 'Campaign system performance affects development workflow',
          severity: 'medium',
          mitigation: 'Monitor execution time and memory usage'
        })

        if (filePath.includes('safety') || filePath.includes('protocol')) {
          riskFactors.push({
            type: 'security',
            description: 'Safety protocols protect against code corruption',
            severity: 'high',
            mitigation: 'Thoroughly test all safety mechanisms'
          })
        }
        break,
    }

    return riskFactors,
  }

  /**
   * Determine preservation requirements
   */
  private async determinePreservationRequirements(
    domainContext: DomainContext,
    absolutePath: string,
  ): Promise<PreservationRequirement[]> {
    const requirements: PreservationRequirement[] = []

    switch (domainContext.type) {
      case 'astrological':
        requirements.push(
          {
            element: 'constants',
            pattern: /RELIABLE_POSITIONS|FALLBACK|TRANSIT_DATES|PLANETARY_/,
            reason: 'Astronomical constants must be preserved for calculation accuracy',
            strictness: 'absolute'
          }
          {
            element: 'variables',
            pattern: /planet|position|degree|longitude|sign|retrograde/i,
            reason: 'Astronomical variables are critical for calculations',
            strictness: 'high'
          }
          {
            element: 'functions',
            pattern: /calculate|validate|getReliable|fallback/i,
            reason: 'Core astronomical functions must be preserved',
            strictness: 'high'
          }
        )
        break,

      case 'campaign':
        requirements.push(
          {
            element: 'variables',
            pattern: /CAMPAIGN|PROGRESS|METRICS|SAFETY|ERROR_THRESHOLD/,
            reason: 'Campaign system constants control automation behavior',
            strictness: 'high'
          }
          {
            element: 'functions',
            pattern: /safety|rollback|validate|track/i,
            reason: 'Safety and tracking functions are critical',
            strictness: 'high'
          }
        )
        break,
    }

    return requirements,
  }

  /**
   * Initialize domain pattern recognition
   */
  private initializeDomainPatterns(): void {
    this.domainPatterns = new Map()
    // Astrological patterns
    this.domainPatterns.set('astrological', [
      {
        type: 'path',
        pattern: '/calculations/',
        weight: 0.8,
        description: 'Astrological calculations directory'
      }
      {
        type: 'path',
        pattern: '/data/planets/',
        weight: 0.9,
        description: 'Planetary data directory'
      }
      {
        type: 'filename',
        pattern: 'reliableAstronomy|planetaryConsistencyCheck|Astrological|Alchemical',
        weight: 0.9,
        description: 'Astrological utility files'
      }
      {
        type: 'path',
        pattern: '/services/.*Astrological|/services/.*Alchemical',
        weight: 0.8,
        description: 'Astrological service files'
      }
    ])

    // Campaign system patterns
    this.domainPatterns.set('campaign', [
      {
        type: 'path',
        pattern: '/services/campaign/',
        weight: 0.9,
        description: 'Campaign system directory'
      }
      {
        type: 'filename',
        pattern: 'Campaign|Progress|Safety|Intelligence',
        weight: 0.8,
        description: 'Campaign system files'
      }
      {
        type: 'path',
        pattern: '/types/campaign',
        weight: 0.9,
        description: 'Campaign type definitions'
      }
    ])

    // Test patterns
    this.domainPatterns.set('test', [
      {
        type: 'filename',
        pattern: '\\.test\\.|\\.spec\\.',
        weight: 0.9,
        description: 'Test files'
      }
      {
        type: 'path',
        pattern: '/__tests__/',
        weight: 0.9,
        description: 'Test directory'
      }
    ])

    // Script patterns
    this.domainPatterns.set('script', [
      {
        type: 'path',
        pattern: '/scripts/',
        weight: 0.9,
        description: 'Scripts directory'
      }
      {
        type: 'filename',
        pattern: '\\.config\\.|setup\\.|install\\.',
        weight: 0.8,
        description: 'Configuration and setup files'
      }
    ])
  }
}