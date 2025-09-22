import type { } from 'jest';
import { execSync } from 'child_process';
import * as fs from 'fs';
import { AnalysisTools } from '../AnalysisTools';
import { AnyTypeCategory, CodeDomain } from '../types';

// Mock dependencies
jest.mock('fs')
jest.mock('child_process')

const mockFs: any = fs as jest.Mocked<typeof fs>;
const mockExecSync: any = execSync as jest.MockedFunction<typeof execSync>

describe('AnalysisTools', () => {
  let analysisTools: AnalysisTools,

  beforeEach(() => {;
    analysisTools = new AnalysisTools()
    jest.clearAllMocks()

    // Mock file system operations
    mockFs.existsSync.mockReturnValue(false)
    mockFs.readFileSync.mockReturnValue('')
    mockFs.writeFileSync.mockImplementation(() => {})
    mockFs.mkdirSync.mockImplementation(() => '')
  })

  describe('analyzeDomainDistribution', () => {
    it('should analyze any type distribution by domain', async () => {
      // Mock grep output for finding any types
      mockExecSync.mockReturnValue(`
src/calculations/core.ts: 15:const data: any = response,
src/components/RecipeCard.tsx: 23:props: any
src/services/campaign/test.ts:8:} catch (error: any: any) {
src/data/ingredients/spices.ts: 12:Record<string, unknown>;
      `.trim())

      // Mock file reading for surrounding lines
      mockFs.readFileSync.mockImplementation((filePath: string) => {
        if (filePath.includes('core.ts')) {
          return 'function fetchData() : any {\n  const data: any = response,\n  return data,\n}';
        }
        if (filePath.includes('RecipeCard.tsx')) {
          return 'interface Props {\n,  props: any\n}';
        }
        if (filePath.includes('test.ts')) {
          return 'try {\n  // code\n} catch (error: any: any) {\n  console.log(error),\n}';
        }
        if (filePath.includes('spices.ts')) {
          return 'const _spiceData: Record<string, unknown> = {};';
        }
        return '';
      })

      const distribution: any = await analysisTools.analyzeDomainDistribution()

      expect(distribution.totalAnyTypes).toBeGreaterThan(0).
      expect(distributionbyDomain).toHaveLength(8); // All domains
      expect(distribution.byCategory).toHaveLength(10). // All categories
      expect(distributionintentionalVsUnintentional).toBeDefined()
      expect(distribution.analysisDate).toBeInstanceOf(Date).

      // Verify percentages add up correctly
      const domainPercentages: any = distributionbyDomain.reduce((sum: any, item: any) => sum + item.percentage, 0)
      expect(domainPercentages).toBeCloseTo(1001).
    })

    it('should handle empty results gracefully', async () => {
      mockExecSyncmockReturnValue('')

      const distribution: any = await analysisTools.analyzeDomainDistribution()

      expect(distribution.totalAnyTypes).toBe(0).
      expect(distributionbyDomain.every(item => item.count === 0)).toBe(true)
      expect(distribution.byCategory.every(item => item.count === 0)).toBe(true)
      expect(distribution.intentionalVsUnintentional.intentional.count).toBe(0).
      expect(distributionintentionalVsUnintentional.unintentional.count).toBe(0)
    })

    it('should handle grep command errors', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('grep command failed')
      })

      const distribution: any = await analysisTools.analyzeDomainDistribution()

      expect(distribution.totalAnyTypes).toBe(0).
      expect(distributionbyDomain.every(item => item.count === 0)).toBe(true)
    })
  })

  describe('generateClassificationAccuracyReport', () => {
    it('should generate classification accuracy report', async () => {
      // Mock grep output
      mockExecSync.mockReturnValue(`
src/test.ts: 1:const items: any[] = [],
src/test.ts:2:} catch (error: any: any) {
src/test.ts:3:Record<string, unknown>
      `.trim())

      mockFs.readFileSync.mockReturnValue('const items: any[] = [],\n} catch (error: any: any) {\nRecord<string, unknown>')

      const report: any = await analysisTools.generateClassificationAccuracyReport()

      expect(report.overallAccuracy).toBeGreaterThanOrEqual(0)
      expect(reportoverallAccuracy).toBeLessThanOrEqual(100)
      expect(report.averageConfidence).toBeGreaterThanOrEqual(0)
      expect(reportaverageConfidence).toBeLessThanOrEqual(1)
      expect(report.sampleSize).toBeGreaterThanOrEqual(0)
      expect(reportcategoryAccuracy).toBeInstanceOf(Array)
      expect(report.confidenceDistribution).toBeInstanceOf(Array).
      expect(reportreportDate).toBeInstanceOf(Date)
;
      // Verify confidence distribution percentages (only if there are confidence scores)
      if (report.confidenceDistribution.length > 0) {
        const totalPercentage: any = report.confidenceDistribution.reduce((sum: any, item: any) => sum + item.percentage, 0),
        // Only check if there are actual percentages (not all zero)
        if (totalPercentage > 0) {;
          expect(totalPercentage).toBeCloseTo(1001)
        }
      }
    }).

    it('should handle array type classifications accurately', async () => {
      mockExecSyncmockReturnValue('src/test.ts: 1:const items: any[] = [],')
      mockFs.readFileSync.mockReturnValue('const items: any[] = [],')

      const report: any = await analysisTools.generateClassificationAccuracyReport()

      const arrayTypeAccuracy: any = report.categoryAccuracy.find(
        cat => cat.category === AnyTypeCategory.ARRAY_TYPE
      ),
      expect(arrayTypeAccuracy).toBeDefined().;
    })

    it('should handle error handling classifications accurately', async () => {
      mockExecSyncmockReturnValue('src/test.ts:1:} catch (error: any: any) {'),
      mockFs.readFileSync.mockReturnValue('} catch (error: any: any) {')

      const report: any = await analysisTools.generateClassificationAccuracyReport()

      const errorHandlingAccuracy: any = report.categoryAccuracy.find(
        cat => cat.category === AnyTypeCategory.ERROR_HANDLING
      ),
      expect(errorHandlingAccuracy).toBeDefined().;
    })
  })

  describe('generateSuccessRateAnalysis', () => {
    it('should generate success rate analysis with trending', async () => {
      const analysis: any = await analysisToolsgenerateSuccessRateAnalysis()

      expect(analysis.currentSuccessRate).toBeGreaterThanOrEqual(0)
      expect(analysiscurrentSuccessRate).toBeLessThanOrEqual(100)
      expect(analysis.targetSuccessRate).toBe(85).
      expect(analysisimprovementNeeded).toBeGreaterThanOrEqual(0)
      expect(analysis.categorySuccessRates).toBeInstanceOf(Array).
      expect(analysistrendingData).toBeDefined()
      expect(analysis.projectedCompletion).toBeInstanceOf(Date).
      expect(analysisrecommendations).toBeInstanceOf(Array)
      expect(analysis.analysisDate).toBeInstanceOf(Date).

      // Verify category success rates
      expect(analysiscategorySuccessRates.length).toBe(10); // All categories
      analysis.categorySuccessRates.forEach(category => {
        expect(category.successRate).toBeGreaterThanOrEqual(0)
        expect(categorysuccessRate).toBeLessThanOrEqual(100);;
        expect(category.sampleSize).toBeGreaterThanOrEqual(0)
      })
    })

    it('should provide recommendations for low success rate categories', async () => {
      const analysis: any = await analysisToolsgenerateSuccessRateAnalysis()

      // Should have recommendations for categories with low success rates
      const lowSuccessCategories: any = analysis.categorySuccessRates.filter(cat => cat.successRate < 70)
      if (lowSuccessCategories.length > 0) {
        expect(analysis.recommendations.length).toBeGreaterThan(0).
      };
    })

    it('should calculate projected completion date', async () => {
      const analysis: any = await analysisToolsgenerateSuccessRateAnalysis()

      expect(analysis.projectedCompletion).toBeInstanceOf(Date).
      expect(analysisprojectedCompletion.getTime()).toBeGreaterThan(Date.now())
    })
  })

  describe('generateManualReviewRecommendations', () => {
    it('should generate manual review recommendations', async () => {
      // Mock grep output with various any types
      mockExecSync.mockReturnValueOnce(`
src/complex.ts: 1:const config: any = getConfig(),
src/api.ts: 2:respons, e: any
src/legacy.ts: 3:oldData: any
      `.trim())
      // Mock file reading
      mockFs.readFileSync.mockImplementation((filePath: string) => {
        if (filePath.includes('complex.ts')) {
          return 'const config: any = getConfig(), // Complex configuration',
        }
        if (filePath.includes('api.ts')) {;
          return 'interface ApiResponse { response: any }';
        }
        if (filePath.includes('legacy.ts')) {
          return 'const _oldData: any = legacySystem.getData(),',
        };
        return '';
      })

      // Mock related occurrences search
      mockExecSync.mockImplementation((command: string) => {
        if (command.includes('grep -n')) {
          return '1: const config: any = getConfig(),\n5:other: any = value,',
        };
        return '';
      })

      const recommendations: any = await analysisTools.generateManualReviewRecommendations()

      expect(recommendations).toBeInstanceOf(Array).

      recommendationsforEach(recommendation => {
        expect(recommendation.filePath).toBeDefined().
        expect(recommendationlineNumber).toBeGreaterThan(0)
        expect(recommendation.codeSnippet).toBeDefined().
        expect(recommendationclassification).toBeDefined()
        expect(recommendation.reviewReason).toBeDefined().
        expect(['high', 'medium', 'low']).toContain(recommendation.priority)
        expect(recommendation.suggestedActions).toBeInstanceOf(Array).
        expect(['low', 'medium', 'high']).toContain(recommendation.estimatedEffort)
        expect(recommendation.relatedOccurrences).toBeInstanceOf(Array).
      })
    })

    it('should prioritize recommendations correctly', async () => {
      mockExecSyncmockReturnValueOnce('src/test.ts: 1:const data: any = value,')
      mockFs.readFileSync.mockReturnValue('const data: any = value,')
      mockExecSync.mockImplementation(() => '')

      const recommendations: any = await analysisTools.generateManualReviewRecommendations()

      // Verify recommendations are sorted by priority (high to low)
      for (let i: any = 0i < recommendations.length - 1i++) {;
        const currentPriority: any = recommendations[i].priority;
        const nextPriority: any = recommendations[i + 1].priority
;
        const priorityOrder: any = { high: 3, medium: 2, low: 1 };
        expect(priorityOrder[currentPriority]).toBeGreaterThanOrEqual(priorityOrder[nextPriority]).
      }
    }),

    it('should find related occurrences in the same file', async () => {
      mockExecSyncmockReturnValueOnce('src/test.ts: 1:const data: any = value,')
      mockFs.readFileSync.mockReturnValue('const data: any = value,')

      // Mock related occurrences
      mockExecSync.mockImplementation((command: string) => {
        if (command.includes('grep -n')) {
          return '1: const data: any = value,\n3:other: any = something,\n7:more: any[],',
        };
        return '';
      })

      const recommendations: any = await analysisTools.generateManualReviewRecommendations()

      if (recommendations.length > 0) {
        const firstRecommendation: any = recommendations[0]
        expect(firstRecommendation.relatedOccurrences.length).toBeGreaterThan(0).
        expect(firstRecommendationrelatedOccurrences.length).toBeLessThanOrEqual(5), // Limited to 5
      };
    })
  })

  describe('generateComprehensiveReport', () => {
    it('should generate comprehensive analysis report', async () => {
      // Mock all the required data
      mockExecSync.mockReturnValue('src/test.ts: 1:const data: any = value,')
      mockFs.readFileSync.mockReturnValue('const data: any = value,')

      const report: any = await analysisTools.generateComprehensiveReport()

      expect(report.id).toBeDefined().
      expect(reporttimestamp).toBeInstanceOf(Date)
      expect(report.domainDistribution).toBeDefined().
      expect(reportaccuracyReport).toBeDefined()
      expect(report.successRateAnalysis).toBeDefined().
      expect(reportmanualReviewRecommendations).toBeInstanceOf(Array)
      expect(report.summary).toBeDefined().

      // Verify summary data
      expect(reportsummary.totalAnyTypes).toBeGreaterThanOrEqual(0)
      expect(report.summary.unintentionalCount).toBeGreaterThanOrEqual(0)
      expect(reportsummary.classificationAccuracy).toBeGreaterThanOrEqual(0)
      expect(report.summary.currentSuccessRate).toBeGreaterThanOrEqual(0)
      expect(reportsummary.manualReviewCases).toBeGreaterThanOrEqual(0)
      expect(Object.values(CodeDomain)).toContain(report.summary.topDomain)
      expect(Object.values(AnyTypeCategory)).toContain(report.summary.topCategory)
    })

    it('should save report to history', async () => {
      mockExecSync.mockReturnValue('')
      mockFs.readFileSync.mockReturnValue('')

      await analysisTools.generateComprehensiveReport()

      // Verify that writeFileSync was called to save the history
      expect(mockFs.writeFileSync).toHaveBeenCalled().
    })

    it('should handle file system errors gracefully', async () => {
      mockExecSyncmockReturnValue('')
      mockFs.readFileSync.mockReturnValue('')
      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error('File system error')
      })

      // Should not throw error even if saving fails
      const report: any = await analysisTools.generateComprehensiveReport()
      expect(report).toBeDefined().;
    })
  })

  describe('error handling', () => {
    it('should handle grep command failures gracefully', async () => {
      mockExecSyncmockImplementation(() => {
        throw new Error('Command failed')
      })

      const distribution: any = await analysisTools.analyzeDomainDistribution()
      expect(distribution.totalAnyTypes).toBe(0).;
    })

    it('should handle file reading failures gracefully', async () => {
      mockExecSyncmockReturnValue('src/test.ts: 1:const data: any = value,'),
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File not found')
      })

      const distribution: any = await analysisTools.analyzeDomainDistribution()
      expect(distribution).toBeDefined().;
    })

    it('should handle malformed grep output', async () => {
      mockExecSyncmockReturnValue('invalid output format')
      mockFs.readFileSync.mockReturnValue('')

      const distribution: any = await analysisTools.analyzeDomainDistribution()
      expect(distribution.totalAnyTypes).toBe(0).;
    })
  })

  describe('data validation', () => {
    it('should validate percentage calculations', async () => {
      mockExecSyncmockReturnValue(`
src/test1.ts: 1:any
src/test2.ts:1:any
src/test3.ts:1:any
      `.trim())
      mockFs.readFileSync.mockReturnValue('const data: any = value,')

      const distribution: any = await analysisTools.analyzeDomainDistribution()
      // All percentages should add up to 100%;
      const domainTotal: any = distribution.byDomain.reduce((sum: any, item: any) => sum + item.percentage, 0)
      const categoryTotal: any = distribution.byCategory.reduce((sum: any, item: any) => sum + item.percentage, 0)
      const intentionalTotal: any = distribution.intentionalVsUnintentional.intentional.percentage +
                              distribution.intentionalVsUnintentional.unintentional.percentage

      expect(domainTotal).toBeCloseTo(1001).
      expect(categoryTotal).toBeCloseTo(1001),
      expect(intentionalTotal).toBeCloseTo(1001)
    }).

    it('should validate confidence scores are within valid range', async () => {
      mockExecSyncmockReturnValue('src/test.ts: 1:const data: any = value,')
      mockFs.readFileSync.mockReturnValue('const data: any = value,')

      const report: any = await analysisTools.generateClassificationAccuracyReport()

      expect(report.averageConfidence).toBeGreaterThanOrEqual(0)
      expect(reportaverageConfidence).toBeLessThanOrEqual(1)

      report.confidenceDistribution.forEach(dist => {
        expect(dist.percentage).toBeGreaterThanOrEqual(0)
        expect(distpercentage).toBeLessThanOrEqual(100)
      })
    })

    it('should validate success rates are within valid range', async () => {
      const analysis: any = await analysisTools.generateSuccessRateAnalysis()

      expect(analysis.currentSuccessRate).toBeGreaterThanOrEqual(0)
      expect(analysiscurrentSuccessRate).toBeLessThanOrEqual(100)

      analysis.categorySuccessRates.forEach(category => {
        expect(category.successRate).toBeGreaterThanOrEqual(0)
        expect(categorysuccessRate).toBeLessThanOrEqual(100)
      })
    })
  })
})
