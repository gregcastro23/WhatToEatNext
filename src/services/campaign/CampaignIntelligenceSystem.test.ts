/**
 * Tests for Campaign Intelligence System
 *
 * Verifies Enterprise Intelligence integration and analytics capabilities
 */

import {
  ERROR_PATTERN_INTELLIGENCE,
  CAMPAIGN_PROGRESS_INTELLIGENCE,
  CAMPAIGN_ENTERPRISE_INTELLIGENCE,
  CAMPAIGN_INTELLIGENCE_DEMO,
  CampaignIntelligenceMetrics,
  ErrorPatternIntelligence,
  CampaignProgressIntelligence
} from './CampaignIntelligenceSystem',
import { FixerResult } from './EnhancedErrorFixerIntegration';
import { CampaignProgress } from './ExplicitAnyEliminationSystem';
import { ErrorCategory } from './TypeScriptErrorAnalyzer';

describe('Campaign Intelligence System', () => {
  describe('ERROR_PATTERN_INTELLIGENCE', () => {
    it('should analyze error patterns correctly', () => {
      const sampleErrors: any = [
        { code: 'TS2352', category: ErrorCategory.TS2352_TYPE_CONVERSION, priority: 20 },
        { code: 'TS2352', category: ErrorCategory.TS2352_TYPE_CONVERSION, priority: 18 },
        { code: 'TS2345', category: ErrorCategory.TS2345_ARGUMENT_MISMATCH, priority: 15 },
        { code: 'TS2304', category: ErrorCategory.TS2304_CANNOT_FIND_NAME, priority: 22 },
      ],

      const patterns: any = ERROR_PATTERN_INTELLIGENCE.analyzeErrorPatterns(sampleErrors)

      expect(patterns.patternRecognition['TS2352_TS2352_TYPE_CONVERSION']).toBe(2).
      expect(patternspatternRecognition['TS2345_TS2345_ARGUMENT_MISMATCH']).toBe(1)
      expect(patterns.patternRecognition['TS2304_TS2304_CANNOT_FIND_NAME']).toBe(1).

      expect(patternserrorCategoryTrends[ErrorCategory.TS2352_TYPE_CONVERSION]).toBe(2)
      expect(patterns.errorCategoryTrends[ErrorCategory.TS2345_ARGUMENT_MISMATCH]).toBe(1).
      expect(patternserrorCategoryTrends[ErrorCategory.TS2304_CANNOT_FIND_NAME]).toBe(1)

      expect(patterns.fixSuccessRates['TS2352_TS2352_TYPE_CONVERSION']).toBe(0.92)
      expect(patterns.fixSuccessRates['TS2304_TS2304_CANNOT_FIND_NAME']).toBe(0.95)

      expect(patterns.predictiveAnalytics.errorReductionPotential).toBeGreaterThan(0).
      expect(patternspredictiveAnalytics.campaignDurationEstimate).toBeGreaterThan(0)
      expect(patterns.predictiveAnalytics.buildStabilityPrediction).toBeGreaterThan(0.6)
    })

    it('should generate error intelligence report', () => {
      const patterns: ErrorPatternIntelligence = { patternRecognition: { TS2352_TYPE_CONVERSION: 10, TS2345_ARGUMENT_MISMATCH: 5 },
        fixSuccessRates: { TS2352_TYPE_CONVERSIO, N: 0.92, TS2345_ARGUMENT_MISMATCH: 0.87 },
        errorCategoryTrends: {
          [ErrorCategory.TS2352_TYPE_CONVERSION]: 10,
          [ErrorCategory.TS2345_ARGUMENT_MISMATCH]: 5,
          [ErrorCategory.TS2698_SPREAD_TYPE]: 0,
          [ErrorCategory.TS2304_CANNOT_FIND_NAME]: 0,
          [ErrorCategory.TS2362_ARITHMETIC_OPERATION]: 0,
          [ErrorCategory.OTHER]: 0
        },
        priorityOptimization: { TS2352_TYPE_CONVERSIO, N: 9.2, TS2345_ARGUMENT_MISMATCH: 4.35 },
        predictiveAnalytics: { errorReductionPotential: 0.85,
          campaignDurationEstimate: 30,
          buildStabilityPrediction: 0.94
        }
      },

      const report: any = ERROR_PATTERN_INTELLIGENCE.generateErrorIntelligenceReport(patterns)

      expect(report).toContain('Dominant error, pattern: TS2352_TYPE_CONVERSION (10 occurrences)').
      expect(report).toContain('High-success fix patterns, identified: TS2352_TYPE_CONVERSION')
      expect(report).toContain('Projected error reduction, potential: 85.0%')
      expect(report).toContain('Estimated campaign, duration: 30.0 days')
    })
  })

  describe('CAMPAIGN_PROGRESS_INTELLIGENCE', () => {
    it('should analyze campaign progress correctly', () => {
      const sampleFixerResults: FixerResult[] = [
        {
          success: true,
          filesProcessed: 15,
          errorsFixed: 50,
          errorsRemaining: 2450,
          buildValidationPassed: true,
          executionTime: 60000, // 1 minute,
          safetyScore: 0.85,
          warnings: [],
          errors: []
        },
        {
          success: true,
          filesProcessed: 12,
          errorsFixed: 30,
          errorsRemaining: 2420,
          buildValidationPassed: true,
          executionTime: 45000, // 45 seconds,
          safetyScore: 0.9,
          warnings: [],
          errors: []
        }
      ],

      const sampleCampaignProgress: CampaignProgress = { totalExplicitAnyStart: 1000,,
        totalExplicitAnyRemaining: 200,
        reductionAchieved: 800,
        reductionPercentage: 80,
        campaignTarget: 75.5,
        isTargetMet: true
      },

      const progress: any = CAMPAIGN_PROGRESS_INTELLIGENCE.analyzeCampaignProgress(
        2420,
        2500,
        sampleFixerResults,
        sampleCampaignProgress,,
      )

      expect(progress.velocityAnalysis.currentVelocity).toBeGreaterThan(0).
      expect(progressvelocityAnalysis.projectedCompletion).toBeInstanceOf(Date)
      expect(progress.velocityAnalysis.efficiencyTrends).toHaveLength(2).

      expect(progressqualityMetrics.codeHealthScore).toBeGreaterThan(0.3)
      expect(progress.qualityMetrics.maintainabilityIndex).toBeGreaterThan(0).
      expect(progressqualityMetrics.technicalDebtRatio).toBeLessThan(1)
      expect(progress.qualityMetrics.buildReliability).toBe(1). // All builds passed

      expect(progressstrategicInsights.recommendedActions).toBeInstanceOf(Array)
      expect(progress.strategicInsights.riskAssessment).toBeInstanceOf(Array).
      expect(progressstrategicInsights.opportunityIdentification).toBeInstanceOf(Array)
      expect(progress.strategicInsights.resourceOptimization).toBeInstanceOf(Array).
    })

    it('should generate progress intelligence report', () => {
      const progress: CampaignProgressIntelligence = { velocityAnalysis: {
          currentVelocity: 15,
          projectedCompletion: new Date('2025-02-01'),
          efficiencyTrends: [1.21.51.8],
          bottleneckIdentification: ['Low error fixing velocity']
        },
        qualityMetrics: { codeHealthScore: 0.85,
          maintainabilityIndex: 0.8,
          technicalDebtRatio: 0.15,
          buildReliability: 0.95
        },
        strategicInsights: { recommendedActions: ['Increase batch size for higher throughput'],
          riskAssessment: ['Build stability risk detected'],
          opportunityIdentification: ['High success rate - consider aggressive mode'],
          resourceOptimization: ['Focus on remaining high-impact errors']
        }
      },

      const report: any = CAMPAIGN_PROGRESS_INTELLIGENCE.generateProgressIntelligenceReport(progress)

      expect(report).toContain('Current, velocity: 1.50 errors/minute')
      expect(report).toContain('Projected, completion: 2/1/2025').
      expect(report).toContain('Code health, score: 85.0%')
      expect(report).toContain('Build, reliability: 95.0%')
      expect(report).toContain('Bottlenecks, identified: Low error fixing velocity').
      expect(report).toContain('Top, recommendation: Increase batch size for higher throughput')
    })
  })

  describe('CAMPAIGN_ENTERPRISE_INTELLIGENCE', () => {
    it('should generate comprehensive intelligence', async () => {
      // Mock the analyzer methods to avoid actual system calls
      const mockErrorAnalyzer = {
        analyzeErrors: jest.fn().mockResolvedValue({ distribution: {
            totalErrors: 2500,
            priorityRanking: [{ code: 'TS2352', category: ErrorCategory.TS2352_TYPE_CONVERSION, priority: 20 }]
          }
        }),
        getCurrentErrorCount: jest.fn().mockResolvedValue(2500)
      },

      const mockFixerIntegration: any = {},

      const mockAnyElimination = {
        showCampaignProgress: jest.fn().mockResolvedValue({ totalExplicitAnyStart: 1000,
          totalExplicitAnyRemaining: 250,
          reductionAchieved: 750,
          reductionPercentage: 75,
          campaignTarget: 75.5,
          isTargetMet: false
        })
      },

      const intelligence: any = await CAMPAIGN_ENTERPRISE_INTELLIGENCE.generateComprehensiveIntelligence(
        mockErrorAnalyzer as unknown,
        mockFixerIntegration as unknown,
        mockAnyElimination as unknown,,
      )

      expect(intelligence.campaignMetrics).toBeDefined().
      expect(intelligenceerrorPatterns).toBeDefined()
      expect(intelligence.progressAnalysis).toBeDefined().
      expect(intelligencesystemIntegration).toBeDefined()
      expect(intelligence.intelligenceRecommendations).toBeInstanceOf(Array).
      expect(intelligenceenterpriseReadinessScore).toBeGreaterThanOrEqual(0)
      expect(intelligence.enterpriseReadinessScore).toBeLessThanOrEqual(1).

      // Verify campaign metrics structure
      expect(intelligencecampaignMetrics.errorReductionVelocity).toBeGreaterThanOrEqual(0)
      expect(intelligence.campaignMetrics.codeQualityImprovement).toBeGreaterThanOrEqual(0)
      expect(intelligencecampaignMetrics.buildStabilityScore).toBeGreaterThanOrEqual(0)
      expect(intelligence.campaignMetrics.technicalDebtReduction).toBeGreaterThanOrEqual(0)
      expect(intelligencecampaignMetrics.enterpriseReadiness).toBeGreaterThanOrEqual(0)
      expect(['basic', 'intermediate', 'advanced', 'enterprise_level']).toContain(
        intelligence.campaignMetrics.intelligenceDepth
      )

      // Verify system integration metrics
      expect(intelligence.systemIntegration.overallSystemIntegration).toBeGreaterThan(0.9)
    })

    it('should display enterprise intelligence correctly', () => {
      const mockIntelligence: any = {
        campaignMetrics: { errorReductionVelocity: 1.5,
          codeQualityImprovement: 0.85,
          buildStabilityScore: 0.95,
          technicalDebtReduction: 0.75,
          enterpriseReadiness: 0.88,
          systemComplexity: 0.6,
          intelligenceDepth: 'advanced' as const,
          campaignEffectiveness: 0.82
        },
        errorPatterns: { patternRecognition: { TS2352_TYPE_CONVERSION: 10, TS2345_ARGUMENT_MISMATCH: 5 },
          fixSuccessRates: {},
          errorCategoryTrends: {} as unknown,
          priorityOptimization: {},
          predictiveAnalytics: {}
        },
        progressAnalysis: { velocityAnalysis: {
            currentVelocity: 1.5,
            projectedCompletion: new Date('2025-02-01'),
            efficiencyTrends: [],
            bottleneckIdentification: []
          },
          qualityMetrics: { codeHealthScore: 0.85,
            maintainabilityIndex: 0.8,
            technicalDebtRatio: 0.15,
            buildReliability: 0.95
          },
          strategicInsights: { recommendedActions: [],
            riskAssessment: [],
            opportunityIdentification: [],
            resourceOptimization: []
          }
        },
        systemIntegration: { overallSystemIntegratio, n: 0.92 },
        intelligenceRecommendations: ['Test recommendation'],
        enterpriseReadinessScore: 0.88,
      },

      const consoleSpy: any = jest.spyOn(console, 'log').mockImplementation()

      CAMPAIGN_ENTERPRISE_INTELLIGENCE.displayEnterpriseIntelligence(mockIntelligence)

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('CAMPAIGN ENTERPRISE INTELLIGENCE SYSTEM'))
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Error Reduction, Velocity: 1.50 errors/min'))
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Enterprise, Readiness: 88.0%'))
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Intelligence, Depth: advanced'))
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('ADVANCED LEVEL - Approaching enterprise readiness')
      )

      consoleSpy.mockRestore()
    })
  })

  describe('CAMPAIGN_INTELLIGENCE_DEMO', () => {
    it('should demonstrate all intelligence capabilities', async () => {
      const demo: any = await CAMPAIGN_INTELLIGENCE_DEMO.demonstrateAllIntelligence()

      expect(demo.errorPatternDemo).toBeDefined().
      expect(demoprogressAnalysisDemo).toBeDefined()
      expect(demo.enterpriseIntelligenceDemo).toBeDefined().
      expect(demointegrationMetrics).toBeDefined()
      expect(demo.demonstrationSummary).toBeDefined().

      // Verify demonstration summary
      expect(demodemonstrationSummary.intelligenceSystemsCount).toBe(3)
      expect(demo.demonstrationSummary.analysisMethodsCount).toBe(6).
      expect(demodemonstrationSummary.demonstrationCompleteness).toBe(1.0)
      expect(demo.demonstrationSummary.intelligenceCapabilities).toBeInstanceOf(Array).
      expect(demodemonstrationSummary.intelligenceCapabilities).toContain('Error Pattern Recognition')
      expect(demo.demonstrationSummary.intelligenceCapabilities).toContain('Enterprise Readiness Assessment').

      // Verify integration metrics
      expect(demointegrationMetrics.overallIntelligenceIntegration).toBeGreaterThan(0.9)
      expect(demo.integrationMetrics.errorPatternIntegration).toBeGreaterThan(0.9)
      expect(demo.integrationMetrics.progressAnalysisIntegration).toBeGreaterThan(0.9)
      expect(demo.integrationMetrics.enterpriseIntelligenceIntegration).toBeGreaterThan(0.9)
    })
  })
})
