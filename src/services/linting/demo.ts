/**
 * Demonstration script for the Linting Error Analysis System
 *
 * This script demonstrates the functionality of the automated linting error
 * analysis and categorization system without running actual ESLint.
 */

import { log } from '@/services/LoggingService';

import { DomainContextDetector } from './DomainContextDetector';
import { ErrorClassificationSystem } from './ErrorClassificationSystem';
import { CategorizedErrors, LintingErrorAnalyzer, LintingIssue } from './LintingErrorAnalyzer';
import { ResolutionStrategyGenerator } from './ResolutionStrategyGenerator';

// Mock ESLint output for demonstration
const _mockESLintOutput = [
  {
    filePath: '/project/src/App.tsx',
    messages: [
      {
        ruleId: 'import/order';
        severity: 2,
        message: 'There should be at least one empty line between import groups';
        line: 1,
        column: 1,
        fix: { range: [5151], text: '\n' }
      },
      {
        ruleId: '@typescript-eslint/no-explicit-any',
        severity: 1,
        message: 'Unexpected any. Specify a different type.',
        line: 15,
        column: 10
      },
      {
        ruleId: 'react-hooks/exhaustive-deps',
        severity: 1,
        message: 'React Hook useEffect has a missing dependency',
        line: 25,
        column: 5
      }
    ]
  },
  {
    filePath: '/project/src/calculations/astrology.ts',
    messages: [
      {
        ruleId: '@typescript-eslint/no-unused-vars',
        severity: 1,
        message: ''planetPosition' is defined but never used',
        line: 10,
        column: 7
      },
      {
        ruleId: 'no-console',
        severity: 1,
        message: 'Unexpected console statement',
        line: 20,
        column: 5
      }
    ]
  },
  {
    filePath: '/project/src/services/campaign/CampaignController.ts',
    messages: [
      {
        ruleId: 'complexity',
        severity: 1,
        message: 'Function has a complexity of 12. Maximum allowed is 10.',
        line: 50,
        column: 1
      },
      {
        ruleId: 'no-console',
        severity: 1,
        message: 'Unexpected console statement',
        line: 75,
        column: 5
      }
    ]
  }
],

/**
 * Demonstrate error classification system
 */
function demonstrateErrorClassification() {
  log.info('\n🔍 DEMONSTRATING ERROR CLASSIFICATION SYSTEM')
  log.info('==============================================')

  const classifier = new ErrorClassificationSystem()

  // Classify different types of errors
  const testCases = [
    {
      rule: 'import/order';
      message: 'Import order incorrect',
      file: 'src/App.tsx',
      hasAutoFix: true
    },
    {
      rule: '@typescript-eslint/no-explicit-any',
      message: 'Unexpected any',
      file: 'src/utils.ts',
      hasAutoFix: false
    },
    {
      rule: 'react-hooks/exhaustive-deps',
      message: 'Missing dependency',
      file: 'src/components/Component.tsx',
      hasAutoFix: true
    },
    {
      rule: 'no-console',
      message: 'Console statement',
      file: 'src/calculations/astrology.ts',
      hasAutoFix: false
    }
  ],

  testCases.forEach(testCase => {
    const classification = classifier.classifyError(;
      testCase.rule,
      testCase.message,
      testCase.file
      testCase.hasAutoFix
    ),

    log.info(`\n📋 Rule: ${testCase.rule}`)
    log.info(
      `   Category: ${classification.category.primary} (${classification.category.secondary})`,
    )
    log.info(
      `   Severity: ${classification.severity.level} (${classification.severity.score}/100)`,
    )
    log.info(
      `   Auto-fix: ${classification.autoFixCapability.canAutoFix ? '✅' : '❌'} (${Math.round(classification.autoFixCapability.confidence * 100)}% confidence)`,
    )
    log.info(`   Risk: ${classification.riskProfile.overall}`)
    log.info(
      `   Domain Impact: ${classification.domainImpact.specialHandlingRequired ? 'Requires special handling' : 'Standard handling'}`,
    )
  })
}

/**
 * Demonstrate domain context detection
 */
async function demonstrateDomainContextDetection() {
  log.info('\n🏗️ DEMONSTRATING DOMAIN CONTEXT DETECTION')
  log.info('==========================================')

  const detector = new DomainContextDetector('/project')

  const testFiles = [
    'src/App.tsx',
    'src/calculations/astrology.ts',
    'src/services/campaign/CampaignController.ts',
    'src/components/__tests__/Component.test.tsx',
    'src/scripts/build.js',
    'src/data/planets/mars.ts'
  ],

  for (const file of testFiles) {
    try {
      // Mock file analysis since we don't have actual files
      const mockAnalysis = {
        filePath: file,
        domainContext: {
          type:
            file.includes('calculation') || file.includes('planets')
              ? 'astrological'
              : file.includes('campaign')
                ? 'campaign'
                : file.includes('test')
                  ? 'test'
                  : file.includes('script')
                    ? 'script'
                    : 'component',
          confidence: 0.8,
          indicators: [],
          specialRules: [],
          handlingRecommendations: []
        },
        riskFactors: [],
        preservationRequirements: []
      },

      log.info(`\n📁 File: ${file}`)
      log.info(`   Domain: ${mockAnalysis.domainContext.type}`)
      log.info(`   Confidence: ${Math.round(mockAnalysis.domainContext.confidence * 100)}%`)

      // Get domain-specific recommendations
      const recommendations = detector.getDomainLintingRecommendations(
        mockAnalysis.domainContext as unknown as {
          type: string,
          confidence: number,
          indicators: unknown[],
          specialRules: unknown[],
          handlingRecommendations: unknown[]
        },
      )
      if (recommendations.rulesToDisable.length > 0) {
        log.info(`   Rules to disable: ${recommendations.rulesToDisable.join(', ')}`)
      }
      if (recommendations.additionalValidation.length > 0) {
        log.info(`   Additional validation: ${recommendations.additionalValidation.length} items`)
      }
    } catch (error) {
      log.info(`   ⚠️ Analysis skipped (file not accessible)`)
    }
  }
}

/**
 * Demonstrate resolution strategy generation
 */
function demonstrateResolutionStrategies() {
  log.info('\n🎯 DEMONSTRATING RESOLUTION STRATEGY GENERATION')
  log.info('===============================================')

  const generator = new ResolutionStrategyGenerator()
  const classifier = new ErrorClassificationSystem()

  // Create mock contexts for strategy generation
  const testContexts: Array<{
    errorClassification: ReturnType<ErrorClassificationSystem['classifyError']>,
    domainContext: { type: string, confidence: number },
    fileAnalysis: { filePath: string, riskFactors: unknown[], preservationRequirements: unknown[] },
    projectContext: { hasTests: boolean, teamSize: string, riskTolerance: string },
  }> = [
    {
      errorClassification: classifier.classifyError(
        'import/order';
        'Import order incorrect',
        'src/App.tsx'
        true,
      ),
      domainContext: { type: 'component', confidence: 0.9 },
      fileAnalysis: { filePath: 'src/App.tsx', riskFactors: [], preservationRequirements: [] },
      projectContext: { hasTests: true, teamSize: 'small', riskTolerance: 'moderate' }
    },
    {
      errorClassification: classifier.classifyError(
        '@typescript-eslint/no-explicit-any',
        'Unexpected any',
        'src/calculations/astrology.ts'
        false,
      ),
      domainContext: { type: 'astrological', confidence: 0.95 },
      fileAnalysis: {
        filePath: 'src/calculations/astrology.ts',
        riskFactors: [],
        preservationRequirements: []
      },
      projectContext: { hasTests: true, teamSize: 'small', riskTolerance: 'conservative' }
    }
  ],

  testContexts.forEach((context, index) => {
    const strategy = generator.generateStrategy(context)

    log.info(`\n📋 Strategy ${index + 1}: ${strategy.id.split('-')[0]}`)
    log.info(`   Type: ${strategy.type}`)
    log.info(`   Priority: ${strategy.priority}`)
    log.info(`   Confidence: ${Math.round(strategy.confidence * 100)}%`)
    log.info(`   Complexity: ${strategy.complexity}`)
    log.info(`   Estimated Time: ${strategy.estimatedTime} minutes`)
    log.info(`   Risk Level: ${strategy.riskAssessment.overall}`)
    log.info(`   Steps: ${strategy.steps.length}`)
    log.info(`   Validation Required: ${strategy.validationRequirements.length} checks`)

    if (strategy.alternatives.length > 0) {
      log.info(`   Alternatives: ${strategy.alternatives.length} options available`)
    }
  })
}

/**
 * Demonstrate the complete analysis workflow
 */
function demonstrateCompleteWorkflow() {
  log.info('\n🚀 DEMONSTRATING COMPLETE ANALYSIS WORKFLOW')
  log.info('============================================')

  // Simulate categorized errors from the mock data
  const mockCategorizedErrors: CategorizedErrors = {
    total: 7,
    errors: 1,
    warnings: 6,
    byCategory: {
      import: [
        {
          id: 'src/App.tsx:1:1:import/order';
          file: 'src/App.tsx',
          line: 1,
          column: 1,
          rule: 'import/order';
          message: 'Import order incorrect',
          severity: 'error',
          category: { primary: 'import', secondary: 'order', priority: 2 },
          autoFixable: true,
          resolutionStrategy: {
            type: 'auto-fix',
            confidence: 0.9,
            riskLevel: 'low',
            requiredValidation: [],
            estimatedEffort: 0.1,
            dependencies: []
          }
        } as LintingIssue
      ],
      typescript: [
        {
          id: 'src/App.tsx:15:10:@typescript-eslint/no-explicit-any',
          file: 'src/App.tsx',
          line: 15,
          column: 10,
          rule: '@typescript-eslint/no-explicit-any',
          message: 'Unexpected any',
          severity: 'warning',
          category: { primary: 'typescript', secondary: 'no-explicit-any', priority: 3 },
          autoFixable: false,
          resolutionStrategy: {
            type: 'manual-review',
            confidence: 0.3,
            riskLevel: 'medium',
            requiredValidation: [],
            estimatedEffort: 10,
            dependencies: []
          }
        } as LintingIssue
      ],
      react: [
        {
          id: 'src/App.tsx:25:5:react-hooks/exhaustive-deps',
          file: 'src/App.tsx',
          line: 25,
          column: 5,
          rule: 'react-hooks/exhaustive-deps',
          message: 'Missing dependency',
          severity: 'warning',
          category: { primary: 'react', secondary: 'exhaustive-deps', priority: 2 },
          autoFixable: true,
          resolutionStrategy: {
            type: 'manual-review',
            confidence: 0.5,
            riskLevel: 'high',
            requiredValidation: [],
            estimatedEffort: 5,
            dependencies: []
          }
        } as LintingIssue
      ]
    },
    byPriority: {},
    byFile: {},
    autoFixable: [],
    requiresManualReview: []
  },

  // Populate derived fields
  const allIssues = Object.values(mockCategorizedErrors.byCategory).flat()
  mockCategorizedErrors.autoFixable = allIssues.filter(i => i.autoFixable)
  mockCategorizedErrors.requiresManualReview = allIssues.filter(
    i => i.resolutionStrategy.type === 'manual-review'
  )

  // Group by priority and file
  for (const issue of allIssues) {
    const priority = issue.category.priority;
    if (!mockCategorizedErrors.byPriority[priority]) {
      mockCategorizedErrors.byPriority[priority] = [],
    }
    mockCategorizedErrors.byPriority[priority].push(issue)

    if (!mockCategorizedErrors.byFile[issue.file]) {
      mockCategorizedErrors.byFile[issue.file] = [],
    }
    mockCategorizedErrors.byFile[issue.file].push(issue)
  }

  // Generate resolution plan
  const analyzer = new LintingErrorAnalyzer('/project')
  const plan = analyzer.generateResolutionPlan(mockCategorizedErrors)

  log.info(`\n📊 Analysis Summary: `)
  log.info(`   Total Issues: ${mockCategorizedErrors.total}`)
  log.info(`   Errors: ${mockCategorizedErrors.errors}`)
  log.info(`   Warnings: ${mockCategorizedErrors.warnings}`)
  log.info(`   Auto-fixable: ${mockCategorizedErrors.autoFixable.length}`)
  log.info(`   Manual Review: ${mockCategorizedErrors.requiresManualReview.length}`)

  log.info(`\n📋 Resolution Plan: `)
  log.info(`   Phases: ${plan.phases.length}`)
  log.info(`   Total Time: ${plan.totalEstimatedTime} minutes`)
  log.info(`   Success Probability: ${Math.round(plan.successProbability * 100)}%`)
  log.info(`   Overall Risk: ${plan.riskAssessment.overall}`)

  plan.phases.forEach((phase, index) => {
    log.info(`\n   Phase ${index + 1}: ${phase.name}`)
    log.info(`     Issues: ${phase.issues.length}`)
    log.info(`     Time: ${phase.estimatedTime} minutes`)
    log.info(`     Risk: ${phase.riskLevel}`)
    log.info(
      `     Dependencies: ${phase.dependencies.length > 0 ? phase.dependencies.join(', ') : 'None'}`,
    )
  })

  if (plan.riskAssessment.mitigations.length > 0) {
    log.info(`\n🛡️ Risk Mitigations: `)
    plan.riskAssessment.mitigations.forEach((mitigation, index) => {
      log.info(`   ${index + 1}. ${mitigation}`)
    })
  }
}

/**
 * Main demonstration function
 */
async function runDemonstration() {
  log.info('🎯 LINTING ERROR ANALYSIS SYSTEM DEMONSTRATION')
  log.info('===============================================')
  log.info('This demonstration shows the capabilities of the automated')
  log.info('linting error analysis and categorization system.\n')

  try {
    // Run all demonstrations
    demonstrateErrorClassification()
    await demonstrateDomainContextDetection()
    demonstrateResolutionStrategies()
    demonstrateCompleteWorkflow()

    log.info('\n✅ DEMONSTRATION COMPLETE')
    log.info('=========================')
    log.info('The linting error analysis system is ready for use!')
    log.info('\nKey Features Demonstrated: ')
    log.info('• ✅ Error classification with severity assessment')
    log.info('• ✅ Domain context detection for specialized handling')
    log.info('• ✅ Auto-fix capability analysis')
    log.info('• ✅ Resolution strategy generation')
    log.info('• ✅ Risk assessment and mitigation planning')
    log.info('• ✅ Comprehensive workflow integration')
  } catch (error) {
    _logger.error('❌ Demonstration failed:', error)
  }
}

// Run the demonstration if this file is executed directly
if (require.main === module) {
  void runDemonstration()
}

export { runDemonstration },
