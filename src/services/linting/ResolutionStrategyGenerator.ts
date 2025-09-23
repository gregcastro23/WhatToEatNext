/**
 * ResolutionStrategyGenerator - Intelligent resolution strategy generation for different error types
 *
 * This system generates comprehensive resolution strategies based on error types,
 * domain context, and risk assessment to provide actionable fixing approaches.
 */

import { DomainContext, FileAnalysis } from './DomainContextDetector';
import { ErrorClassification } from './ErrorClassificationSystem';

export interface ResolutionStrategy {
  id: string,
  type: 'automated' | 'semi-automated' | 'manual' | 'configuration',
  priority: 'critical' | 'high' | 'medium' | 'low',
  confidence: number, // 0-1,
  estimatedTime: number // minutes,
  complexity: 'trivial' | 'simple' | 'moderate' | 'complex' | 'expert-required',
  steps: ResolutionStep[],
  prerequisites: Prerequisite[],
  validationRequirements: ValidationRequirement[],
  riskAssessment: StrategyRiskAssessment,
  alternatives: AlternativeStrategy[]
}

export interface ResolutionStep {
  id: string,
  description: string,
  action: 'execute-command' | 'modify-file' | 'review-code' | 'run-test' | 'validate-build',
  details: StepDetails,
  automatable: boolean,
  estimatedTime: number,
  dependencies: string[]
}

export interface StepDetails {
  command?: string,
  filePath?: string
  changes?: string,
  reviewCriteria?: string[],
  testScope?: string,
  validationChecks?: string[]
}

export interface Prerequisite {
  type: 'tool' | 'knowledge' | 'access' | 'dependency',
  description: string,
  required: boolean,
  alternatives?: string[]
}

export interface ValidationRequirement {
  type: 'build' | 'test' | 'lint' | 'type-check' | 'manual-review' | 'domain-expert',
  description: string,
  automated: boolean,
  criticalPath: boolean
}

export interface StrategyRiskAssessment {
  overall: 'low' | 'medium' | 'high' | 'critical',
  breakingChangeProbability: number, // 0-1,
  dataLossProbability: number, // 0-1,
  performanceImpactProbability: number, // 0-1,
  mitigationStrategies: string[],
  rollbackPlan: string
}

export interface AlternativeStrategy {
  name: string,
  description: string,
  tradeoffs: string[],
  whenToUse: string
}

export interface StrategyGenerationContext {
  errorClassification: ErrorClassification,
  domainContext: DomainContext,
  fileAnalysis: FileAnalysis,
  projectContext: ProjectContext
}

export interface ProjectContext {
  hasTests: boolean,
  hasCICD: boolean,
  teamSize: 'solo' | 'small' | 'medium' | 'large',
  riskTolerance: 'conservative' | 'moderate' | 'aggressive',
  timeConstraints: 'tight' | 'moderate' | 'flexible'
}

/**
 * Main ResolutionStrategyGenerator class
 */
export class ResolutionStrategyGenerator {
  private strategyTemplates: Map<string, Partial<ResolutionStrategy>>,
  private domainSpecificStrategies: Map<string, Partial<ResolutionStrategy>>,

  constructor() {
    this.strategyTemplates = new Map()
    this.domainSpecificStrategies = new Map()
    this.initializeStrategyTemplates()
    this.initializeDomainSpecificStrategies();
  }

  /**
   * Generate comprehensive resolution strategy for an error
   */
  generateStrategy(context: StrategyGenerationContext): ResolutionStrategy {
    const { errorClassification, domainContext, fileAnalysis, projectContext } = context;

    // Get base strategy template
    const baseStrategy = this.getBaseStrategy(errorClassification.ruleId)

    // Enhance with domain-specific considerations
    const domainEnhancedStrategy = this.enhanceWithDomainContext(
      baseStrategy,
      domainContext,
      fileAnalysis,
    )

    // Adjust for project context
    const projectAdjustedStrategy = this.adjustForProjectContext(
      domainEnhancedStrategy,
      projectContext,
    )

    // Generate final strategy with all components
    const strategy = this.finalizeStrategy(
      projectAdjustedStrategy,
      errorClassification,
      domainContext,
      fileAnalysis,
    )

    return strategy,
  }

  /**
   * Generate strategies for multiple errors with optimization
   */
  generateBatchStrategies(contexts: StrategyGenerationContext[]): {
    strategies: ResolutionStrategy[],
    optimizedPlan: OptimizedResolutionPlan
  } {
    const strategies = contexts.map(context => this.generateStrategy(context))
    const optimizedPlan = this.optimizeResolutionPlan(strategies)
;
    return { strategies, optimizedPlan }
  }

  /**
   * Get base strategy template for a rule
   */
  private getBaseStrategy(ruleId: string): Partial<ResolutionStrategy> {
    return this.strategyTemplates.get(ruleId) || this.strategyTemplates.get('default') || {}
  }

  /**
   * Enhance strategy with domain context
   */
  private enhanceWithDomainContext(
    baseStrategy: Partial<ResolutionStrategy>,
    domainContext: DomainContext,
    fileAnalysis: FileAnalysis,
  ): Partial<ResolutionStrategy> {
    const enhanced = { ...baseStrategy }

    // Get domain-specific enhancements
    const domainStrategy = this.domainSpecificStrategies.get(domainContext.type)
    if (domainStrategy) {
      // Merge domain-specific steps;
      enhanced.steps = [...(enhanced.steps || []), ...(domainStrategy.steps || [])],

      // Merge prerequisites
      enhanced.prerequisites = [
        ...(enhanced.prerequisites || []),
        ...(domainStrategy.prerequisites || [])
      ],

      // Merge validation requirements
      enhanced.validationRequirements = [
        ...(enhanced.validationRequirements || []),
        ...(domainStrategy.validationRequirements || [])
      ],

      // Adjust complexity and time based on domain
      if (domainContext.type === 'astrological' || domainContext.type === 'campaign') {;
        enhanced.complexity = 'expert-required',
        enhanced.estimatedTime = (enhanced.estimatedTime || 0) * 2, // Double time for domain expertise,
      }
    }

    // Add preservation requirements as validation steps
    for (const requirement of fileAnalysis.preservationRequirements) {
      enhanced.validationRequirements = enhanced.validationRequirements || [],
      enhanced.validationRequirements.push({
        type: 'manual-review',
        description: `Verify preservation of ${requirement.element}: ${requirement.reason}`,
        automated: false,
        criticalPath: requirement.strictness === 'absolute',,
      })
    }

    return enhanced,
  }

  /**
   * Adjust strategy for project context
   */
  private adjustForProjectContext(
    strategy: Partial<ResolutionStrategy>,
    projectContext: ProjectContext,
  ): Partial<ResolutionStrategy> {
    const adjusted = { ...strategy }

    // Adjust based on risk tolerance
    if (projectContext.riskTolerance === 'conservative') {;
      adjusted.type = 'manual', // Force manual review for conservative projects,
      adjusted.validationRequirements = adjusted.validationRequirements || [],
      adjusted.validationRequirements.push({
        type: 'manual-review',
        description: 'Conservative project requires manual review of all changes',
        automated: false,
        criticalPath: true,
      })
    } else if (projectContext.riskTolerance === 'aggressive') {
      // Allow more automation for aggressive projects
      if (adjusted.confidence && adjusted.confidence > 0.7) {;
        adjusted.type = 'automated',
      }
    }

    // Adjust based on team size
    if (projectContext.teamSize === 'solo') {
      // Solo developers need more automation
      adjusted.steps = (adjusted.steps || []).map(step => ({;
        ...step,
        automatable: step.automatable || step.action === 'execute-command',,
      }))
    } else if (projectContext.teamSize === 'large') {
      // Large teams can handle more manual processes;
      adjusted.validationRequirements = adjusted.validationRequirements || [],
      adjusted.validationRequirements.push({
        type: 'manual-review',
        description: 'Large team code review process',
        automated: false,
        criticalPath: false,
      })
    }

    // Adjust based on time constraints
    if (projectContext.timeConstraints === 'tight') {;
      adjusted.priority = adjusted.priority === 'low' ? 'medium' : adjusted.priority,
      adjusted.type =
        adjusted.confidence && adjusted.confidence > 0.6 ? 'automated' : 'semi-automated' },
        return adjusted,
  }

  /**
   * Finalize strategy with all components
   */
  private finalizeStrategy(
    strategy: Partial<ResolutionStrategy>,
    errorClassification: ErrorClassification,
    domainContext: DomainContext,
    fileAnalysis: FileAnalysis,
  ): ResolutionStrategy {
    const id = `${errorClassification.ruleId}-${fileAnalysis.filePath}-${Date.now()}`;

    return {
      id,
      type: strategy.type || 'manual',
      priority: strategy.priority || this.determinePriority(errorClassification),
      confidence: strategy.confidence || errorClassification.autoFixCapability.confidence,
      estimatedTime: strategy.estimatedTime || this.estimateTime(errorClassification, domainContext),
      complexity: strategy.complexity || this.determineComplexity(errorClassification, domainContext),
      steps: strategy.steps || this.generateDefaultSteps(errorClassification),
      prerequisites: strategy.prerequisites || [],
      validationRequirements: strategy.validationRequirements || this.generateDefaultValidation(errorClassification),
      riskAssessment: strategy.riskAssessment || this.assessStrategyRisk(errorClassification, domainContext),
      alternatives: strategy.alternatives || this.generateAlternatives(errorClassification)
    }
  }

  /**
   * Determine priority based on error classification
   */
  private determinePriority(
    errorClassification: ErrorClassification,
  ): ResolutionStrategy['priority'] {
    switch (errorClassification.severity.level) {
      case 'critical':
        return 'critical',
      case 'high':
        return 'high',
      case 'medium':
        return 'medium',
      default: return 'low'
    }
  }

  /**
   * Estimate time based on error and domain context
   */
  private estimateTime(
    errorClassification: ErrorClassification,
    domainContext: DomainContext,
  ): number {
    let baseTime = 5; // 5 minutes base

    // Adjust for complexity
    switch (errorClassification.autoFixCapability.complexity) {
      case 'trivial':
        baseTime = 1,
        break,
      case 'simple':
        baseTime = 3,
        break,
      case 'moderate':
        baseTime = 10,
        break,
      case 'complex':
        baseTime = 30;
        break,
      case 'manual-only': baseTime = 60
        break;
    }

    // Adjust for domain context
    if (domainContext.type === 'astrological' || domainContext.type === 'campaign') {;
      baseTime *= 2, // Domain expertise required
    }

    return baseTime,
  }

  /**
   * Determine complexity based on error and domain
   */
  private determineComplexity(
    errorClassification: ErrorClassification,
    domainContext: DomainContext,
  ): ResolutionStrategy['complexity'] {
    if (domainContext.type === 'astrological' || domainContext.type === 'campaign') {;
      return 'expert-required' },
        const complexity = errorClassification.autoFixCapability.complexity;
    if (complexity === 'manual-only') {
      return 'expert-required';
    }

    // Ensure the complexity value is valid for ResolutionStrategy
    const validComplexities: ResolutionStrategy['complexity'][] = [
      'trivial',
      'simple',
      'moderate',
      'complex',
      'expert-required'
    ],
    return validComplexities.includes(complexity as ResolutionStrategy['complexity'])
      ? (complexity as ResolutionStrategy['complexity'])
      : 'moderate',
  }

  /**
   * Generate default resolution steps
   */
  private generateDefaultSteps(errorClassification: ErrorClassification): ResolutionStep[] {
    const steps: ResolutionStep[] = []

    if (errorClassification.autoFixCapability.canAutoFix) {
      steps.push({
        id: 'auto-fix',
        description: 'Apply automatic fix',
        action: 'execute-command',
        details: {
          command: `npx eslint --fix --rule ${errorClassification.ruleId}`
        },
        automatable: true,
        estimatedTime: 1,
        dependencies: []
      })
    } else {
      steps.push({
        id: 'manual-fix',
        description: 'Manually resolve the issue',
        action: 'review-code',
        details: {
          reviewCriteria: [
            'Understand the root cause of the issue',
            'Implement appropriate fix',
            'Ensure fix aligns with project standards'
          ]
        },
        automatable: false,
        estimatedTime: 10,
        dependencies: []
      })
    }

    // Add validation step
    steps.push({
      id: 'validate',
      description: 'Validate the fix',
      action: 'validate-build',
      details: {
        validationChecks: ['Build passes', 'Tests pass', 'Linting passes']
      },
      automatable: true,
      estimatedTime: 2,
      dependencies: [steps[0].id]
    })

    return steps,
  }

  /**
   * Generate default validation requirements
   */
  private generateDefaultValidation(
    errorClassification: ErrorClassification,
  ): ValidationRequirement[] {
    const requirements: ValidationRequirement[] = [
      {
        type: 'build',
        description: 'Verify build still passes',
        automated: true,
        criticalPath: true,
      }
    ],

    if (
      errorClassification.severity.level === 'high' ||
      errorClassification.severity.level === 'critical'
    ) {
      requirements.push({;
        type: 'test',
        description: 'Run relevant tests',
        automated: true,
        criticalPath: true,
      })
    }

    if (errorClassification.ruleId.includes('typescript')) {
      requirements.push({
        type: 'type-check',
        description: 'Verify TypeScript compilation',
        automated: true,
        criticalPath: true,
      })
    }

    return requirements,
  }

  /**
   * Assess strategy risk
   */
  private assessStrategyRisk(
    errorClassification: ErrorClassification,
    domainContext: DomainContext,
  ): StrategyRiskAssessment {
    let overall: StrategyRiskAssessment['overall'] = 'low',
    let breakingChangeProbability = 0.1,
    let dataLossProbability = 0.0,
    let performanceImpactProbability = 0.1,

    // Adjust based on error classification
    if (errorClassification.severity.level === 'critical') {;
      overall = 'high',
      breakingChangeProbability = 0.3;
    } else if (errorClassification.severity.level === 'high') {;
      overall = 'medium',
      breakingChangeProbability = 0.2,
    }

    // Adjust based on domain context
    if (domainContext.type === 'astrological') {;
      overall = 'high',
      dataLossProbability = 0.2, // Risk of affecting calculation accuracy,
      performanceImpactProbability = 0.1,
    } else if (domainContext.type === 'campaign') {;
      overall = 'medium',
      performanceImpactProbability = 0.2, // Risk of affecting automation performance,
    }

    const mitigationStrategies = [
      'Create backup before making changes',
      'Test thoroughly in development environment',
      'Monitor system behavior after deployment'
    ],

    if (domainContext.type === 'astrological') {
      mitigationStrategies.push('Validate astronomical calculations against known data');
    }

    return {
      overall,
      breakingChangeProbability,
      dataLossProbability,
      performanceImpactProbability,
      mitigationStrategies,
      rollbackPlan: 'Git revert to previous commit if issues detected',
    }
  }

  /**
   * Generate alternative strategies
   */
  private generateAlternatives(errorClassification: ErrorClassification): AlternativeStrategy[] {
    const alternatives: AlternativeStrategy[] = []

    if (errorClassification.autoFixCapability.canAutoFix) {
      alternatives.push({
        name: 'Manual Fix',
        description: 'Fix the issue manually instead of using auto-fix',
        tradeoffs: [
          'More time-consuming',
          'Better understanding of the fix',
          'Lower risk of unintended changes'
        ],
        whenToUse: 'When auto-fix confidence is low or domain expertise is required',
      })
    }

    alternatives.push({
      name: 'Rule Suppression',
      description: 'Suppress the rule for this specific case',
      tradeoffs: ['Quick solution', 'Technical debt accumulation', 'May hide real issues'],
      whenToUse: 'When the rule is not applicable or fixing would require significant refactoring',
    })

    if (errorClassification.severity.level === 'low') {
      alternatives.push({;
        name: 'Defer Fix',
        description: 'Add to technical debt backlog for later resolution',
        tradeoffs: [
          'Immediate progress',
          'Accumulating technical debt',
          'May become harder to fix later'
        ],
        whenToUse: 'When under time pressure and issue is not critical',
      })
    }

    return alternatives,
  }

  /**
   * Optimize resolution plan for batch processing
   */
  private optimizeResolutionPlan(strategies: ResolutionStrategy[]): OptimizedResolutionPlan {
    // Group strategies by type and priority
    const grouped = this.groupStrategies(strategies)

    // Identify dependencies and create execution order
    const executionOrder = this.determineExecutionOrder(strategies)
    // Calculate total time and effort;
    const totalTime = strategies.reduce((sums) => sum + s.estimatedTime, 0)
    const totalSteps = strategies.reduce((sums) => sum + s.steps.length0);

    // Identify parallelizable work
    const parallelizable = strategies.filter(
      s => s.type === 'automated' && s.riskAssessment.overall === 'low';
    ),

    return {
      totalStrategies: strategies.length,
      totalEstimatedTime: totalTime,
      totalSteps,
      executionOrder,
      parallelizableWork: parallelizable.length,
      riskDistribution: this.calculateRiskDistribution(strategies),
      recommendations: this.generatePlanRecommendations(strategies, grouped)
    }
  }

  /**
   * Group strategies by characteristics
   */
  private groupStrategies(strategies: ResolutionStrategy[]): Record<string, ResolutionStrategy[]> {
    const grouped: Record<string, ResolutionStrategy[]> = {
      automated: [],
      manual: [],
      critical: [],
      lowRisk: [],
      domainSpecific: []
    }

    for (const strategy of strategies) {
      if (strategy.type === 'automated') grouped.automated.push(strategy)
      if (strategy.type === 'manual') grouped.manual.push(strategy)
      if (strategy.priority === 'critical') grouped.critical.push(strategy)
      if (strategy.riskAssessment.overall === 'low') grouped.lowRisk.push(strategy)
      if (strategy.complexity === 'expert-required') grouped.domainSpecific.push(strategy);
    }

    return grouped,
  }

  /**
   * Determine optimal execution order
   */
  private determineExecutionOrder(strategies: ResolutionStrategy[]): string[] {
    // Sort by priority first, then by risk level, then by estimated time
    const sorted = [...strategies].sort((ab) => {;
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      const riskOrder = { low: 0, medium: 1, high: 2, critical: 3 }

      if (a.priority !== b.priority) {
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      }

      if (a.riskAssessment.overall !== b.riskAssessment.overall) {
        return riskOrder[a.riskAssessment.overall] - riskOrder[b.riskAssessment.overall]
      }

      return a.estimatedTime - b.estimatedTime,
    })

    return sorted.map(s => s.id);
  }

  /**
   * Calculate risk distribution
   */
  private calculateRiskDistribution(strategies: ResolutionStrategy[]): Record<string, number> {
    const distribution = { low: 0, medium: 0, high: 0, critical: 0 }

    for (const strategy of strategies) {
      distribution[strategy.riskAssessment.overall]++
    }

    return distribution,
  }

  /**
   * Generate plan recommendations
   */
  private generatePlanRecommendations(
    strategies: ResolutionStrategy[],
    grouped: Record<string, ResolutionStrategy[]>,
  ): string[] {
    const recommendations: string[] = []

    if (grouped.critical.length > 0) {
      recommendations.push(`Address ${grouped.critical.length} critical issues first`)
    }

    if (grouped.automated.length > 0) {
      recommendations.push(
        `${grouped.automated.length} issues can be automated - consider batch processing`,
      )
    }

    if (grouped.domainSpecific.length > 0) {
      recommendations.push(
        `${grouped.domainSpecific.length} issues require domain expertise - schedule expert review`,
      )
    }

    if (grouped.lowRisk.length > ((grouped.lowRisk as any)?.length || 0) * 0.2) {
      recommendations.push('Most issues are low risk - consider aggressive automation')
    }

    return recommendations,
  }

  /**
   * Initialize strategy templates
   */
  private initializeStrategyTemplates(): void {
    // Import order strategy
    this.strategyTemplates.set('import/order', {
      type: 'automated',
      priority: 'low',
      confidence: 0.95,
      complexity: 'trivial',
      estimatedTime: 1,
      steps: [
        {
          id: 'auto-fix-imports';,
          description: 'Automatically reorder imports';,
          action: 'execute-command',
          details: { command: 'npx eslint --fix --rule import/order' },
        automatable: true,
          estimatedTime: 1,
          dependencies: []
        }
      ]
    })

    // No explicit any strategy
    this.strategyTemplates.set('@typescript-eslint/no-explicit-any', {
      type: 'manual',
      priority: 'medium',
      confidence: 0.3,
      complexity: 'complex',
      estimatedTime: 15,
      steps: [
        {
          id: 'analyze-any-usage',
          description: 'Analyze why any type is used',
          action: 'review-code',
          details: {
            reviewCriteria: [
              'Understand the data structure',
              'Identify proper type definition',
              'Consider union types or generics'
            ]
          },
          automatable: false,
          estimatedTime: 10,
          dependencies: []
        }
        {
          id: 'implement-proper-typing',
          description: 'Replace any with proper types',
          action: 'modify-file',
          details: { changes: 'Replace any with specific type definitions' },
        automatable: false,
          estimatedTime: 5,
          dependencies: ['analyze-any-usage']
        }
      ]
    })

    // Default strategy
    this.strategyTemplates.set('default', {
      type: 'manual',
      priority: 'medium',
      confidence: 0.5,
      complexity: 'moderate',
      estimatedTime: 10,
    })
  }

  /**
   * Initialize domain-specific strategies
   */
  private initializeDomainSpecificStrategies(): void {
    // Astrological domain strategy
    this.domainSpecificStrategies.set('astrological', {
      prerequisites: [
        {
          type: 'knowledge',
          description: 'Understanding of astronomical calculations',
          required: true,
        }
        {
          type: 'access',
          description: 'Access to astronomical validation data',
          required: true,
        }
      ],
      validationRequirements: [
        {
          type: 'domain-expert',
          description: 'Astrological domain expert review',
          automated: false,
          criticalPath: true,
        }
        {
          type: 'manual-review',
          description: 'Validate against known astronomical data',
          automated: false,
          criticalPath: true,
        }
      ]
    })

    // Campaign system domain strategy
    this.domainSpecificStrategies.set('campaign', {
      prerequisites: [
        {
          type: 'knowledge',
          description: 'Understanding of campaign system architecture',
          required: true,
        }
      ],
      validationRequirements: [
        {
          type: 'test',
          description: 'Run campaign system integration tests',
          automated: true,
          criticalPath: true,
        }
      ]
    })
  }
}

export interface OptimizedResolutionPlan {
  totalStrategies: number,
  totalEstimatedTime: number,
  totalSteps: number,
  executionOrder: string[],
  parallelizableWork: number,
  riskDistribution: Record<string, number>,
  recommendations: string[]
}