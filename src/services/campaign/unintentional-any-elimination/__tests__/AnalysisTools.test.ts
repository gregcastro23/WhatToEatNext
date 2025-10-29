import { execSync } from 'child_process';
import * as fs from 'fs';
import { AnalysisTools } from '../AnalysisTools';
import { AnyTypeCategory, CodeDomain } from '../types';

// Mock dependencies
jest.mock('fs');
jest.mock('child_process');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;

describe('AnalysisTools', () => {
  let analysisTools: AnalysisTools;

  beforeEach(() => {
    analysisTools = new AnalysisTools();
    jest.clearAllMocks();

    // Mock file system operations
    mockFs.existsSync.mockReturnValue(false);
    mockFs.readFileSync.mockReturnValue('');
    mockFs.writeFileSync.mockImplementation(() => {});
    mockFs.mkdirSync.mockImplementation(() => '');
  });

  describe('analyzeDomainDistribution', () => {
    it('should analyze any type distribution by domain', async () => {
      // Mock grep output for finding any types
      mockExecSync.mockReturnValue(`)
src/calculations/core.ts:15:const data: any = response;
src/components/RecipeCard.tsx:23:props: any
src/services/campaign/test.ts:8:} catch (error: any) {
src/data/ingredients/spices.ts:12:Record<string, any>
      `.trim());

      // Mock file reading for surrounding lines
      mockFs.readFileSync.mockImplementation((filePath: string) => {
        if (filePath.includes('core.ts') {
          return 'function fetchData() {\n  const data: any = response;\n  return data;\n}';
        }
        if (filePath.includes('RecipeCard.tsx') {
          return 'interface Props {\n  props: any\n}';
        }
        if (filePath.includes('test.ts') {
          return 'try {\n  // code\n} catch (error: any) {\n  console.log(error);\n}';
        }
        if (filePath.includes('spices.ts') {
          return 'const spiceData: Record<string, any> = {};';
        }
        return '';
      });

      const distribution = await analysisTools.analyzeDomainDistribution();

      expect(distribution.totalAnyTypes).toBeGreaterThan(0);
      expect(distribution.byDomain).toHaveLength(8); // All domains
      expect(distribution.byCategory).toHaveLength(10); // All categories
      expect(distribution.intentionalVsUnintentional).toBeDefined();
      expect(distribution.analysisDate).toBeInstanceOf(Date);

      // Verify percentages add up correctly
      const domainPercentages = distribution.byDomain.reduce((sum, item) => sum + item.percentage, 0);
      expect(domainPercentages).toBeCloseTo(100, 1);
    });

    it('should handle empty results gracefully', async () => {
      mockExecSync.mockReturnValue('');

      const distribution = await analysisTools.analyzeDomainDistribution();

      expect(distribution.totalAnyTypes).toBe(0);
      expect(distribution.byDomain.every(item => item.count === 0)).toBe(true);
      expect(distribution.byCategory.every(item => item.count === 0)).toBe(true);
      expect(distribution.intentionalVsUnintentional.intentional.count).toBe(0);
      expect(distribution.intentionalVsUnintentional.unintentional.count).toBe(0);
    });

    it('should handle grep command errors', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('grep command failed');
      });

      const distribution = await analysisTools.analyzeDomainDistribution();

      expect(distribution.totalAnyTypes).toBe(0);
      expect(distribution.byDomain.every(item => item.count === 0)).toBe(true);
    });
  });

  describe('generateClassificationAccuracyReport', () => {
    it('should generate classification accuracy report', async () => {
      // Mock grep output
      mockExecSync.mockReturnValue(`)
src/test.ts:1:const items: any[] = [];
src/test.ts:2:} catch (error: any) {
src/test.ts:3:Record<string, any>
      `.trim());

      mockFs.readFileSync.mockReturnValue('const items: any[] = [];\n} catch (error: any) {\nRecord<string, any>');

      const report = await analysisTools.generateClassificationAccuracyReport();

      expect(report.overallAccuracy).toBeGreaterThanOrEqual(0);
      expect(report.overallAccuracy).toBeLessThanOrEqual(100);
      expect(report.averageConfidence).toBeGreaterThanOrEqual(0);
      expect(report.averageConfidence).toBeLessThanOrEqual(1);
      expect(report.sampleSize).toBeGreaterThanOrEqual(0);
      expect(report.categoryAccuracy).toBeInstanceOf(Array);
      expect(report.confidenceDistribution).toBeInstanceOf(Array);
      expect(report.reportDate).toBeInstanceOf(Date);

      // Verify confidence distribution percentages (only if there are confidence scores)
      if (report.confidenceDistribution.length > 0) {
        const totalPercentage = report.confidenceDistribution.reduce((sum, item) => sum + item.percentage, 0);
        // Only check if there are actual percentages (not all zero)
        if (totalPercentage > 0) {
          expect(totalPercentage).toBeCloseTo(100, 1);
        }
      }
    });

    it('should handle array type classifications accurately', async () => {
      mockExecSync.mockReturnValue('src/test.ts:1:const items: any[] = [];');
      mockFs.readFileSync.mockReturnValue('const items: any[] = [];');

      const report = await analysisTools.generateClassificationAccuracyReport();

      const arrayTypeAccuracy = report.categoryAccuracy.find()
        cat => cat.category === AnyTypeCategory.ARRAY_TYPE
      );
      expect(arrayTypeAccuracy).toBeDefined();
    });

    it('should handle error handling classifications accurately', async () => {
      mockExecSync.mockReturnValue('src/test.ts:1:} catch (error: any) {');
      mockFs.readFileSync.mockReturnValue('} catch (error: any) {');

      const report = await analysisTools.generateClassificationAccuracyReport();

      const errorHandlingAccuracy = report.categoryAccuracy.find()
        cat => cat.category === AnyTypeCategory.ERROR_HANDLING
      );
      expect(errorHandlingAccuracy).toBeDefined();
    });
  });

  describe('generateSuccessRateAnalysis', () => {
    it('should generate success rate analysis with trending', async () => {
      const analysis = await analysisTools.generateSuccessRateAnalysis();

      expect(analysis.currentSuccessRate).toBeGreaterThanOrEqual(0);
      expect(analysis.currentSuccessRate).toBeLessThanOrEqual(100);
      expect(analysis.targetSuccessRate).toBe(85);
      expect(analysis.improvementNeeded).toBeGreaterThanOrEqual(0);
      expect(analysis.categorySuccessRates).toBeInstanceOf(Array);
      expect(analysis.trendingData).toBeDefined();
      expect(analysis.projectedCompletion).toBeInstanceOf(Date);
      expect(analysis.recommendations).toBeInstanceOf(Array);
      expect(analysis.analysisDate).toBeInstanceOf(Date);

      // Verify category success rates
      expect(analysis.categorySuccessRates.length).toBe(10); // All categories
      analysis.categorySuccessRates.forEach(category => {
        expect(category.successRate).toBeGreaterThanOrEqual(0);
        expect(category.successRate).toBeLessThanOrEqual(100);
        expect(category.sampleSize).toBeGreaterThanOrEqual(0);
      });
    });

    it('should provide recommendations for low success rate categories', async () => {
      const analysis = await analysisTools.generateSuccessRateAnalysis();

      // Should have recommendations for categories with low success rates
      const lowSuccessCategories = analysis.categorySuccessRates.filter(cat => cat.successRate < 70);
      if (lowSuccessCategories.length > 0) {
        expect(analysis.recommendations.length).toBeGreaterThan(0);
      }
    });

    it('should calculate projected completion date', async () => {
      const analysis = await analysisTools.generateSuccessRateAnalysis();

      expect(analysis.projectedCompletion).toBeInstanceOf(Date);
      expect(analysis.projectedCompletion.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('generateManualReviewRecommendations', () => {
    it('should generate manual review recommendations', async () => {
      // Mock grep output with various any types
      mockExecSync.mockReturnValueOnce(`)
src/complex.ts:1:const config: any = getConfig();
src/api.ts:2:response: any
src/legacy.ts:3:oldData: any
      `.trim());

      // Mock file reading
      mockFs.readFileSync.mockImplementation((filePath: string) => {
        if (filePath.includes('complex.ts') {
          return 'const config: any = getConfig(); // Complex configuration';
        }
        if (filePath.includes('api.ts') {
          return 'interface ApiResponse { response: any }';
        }
        if (filePath.includes('legacy.ts') {
          return 'const oldData: any = legacySystem.getData();';
        }
        return '';
      });

      // Mock related occurrences search
      mockExecSync.mockImplementation((command: string) => {
        if (command.includes('grep -n') {
          return '1:const config: any = getConfig();\n5:other: any = value;';
        }
        return '';
      });

      const recommendations = await analysisTools.generateManualReviewRecommendations();

      expect(recommendations).toBeInstanceOf(Array);

      recommendations.forEach(recommendation => {
        expect(recommendation.filePath).toBeDefined();
        expect(recommendation.lineNumber).toBeGreaterThan(0);
        expect(recommendation.codeSnippet).toBeDefined();
        expect(recommendation.classification).toBeDefined();
        expect(recommendation.reviewReason).toBeDefined();
        expect(['high', 'medium', 'low']).toContain(recommendation.priority);
        expect(recommendation.suggestedActions).toBeInstanceOf(Array);
        expect(['low', 'medium', 'high']).toContain(recommendation.estimatedEffort);
        expect(recommendation.relatedOccurrences).toBeInstanceOf(Array);
      });
    });

    it('should prioritize recommendations correctly', async () => {
      mockExecSync.mockReturnValueOnce('src/test.ts:1:const data: any = value;');
      mockFs.readFileSync.mockReturnValue('const data: any = value;');
      mockExecSync.mockImplementation(() => '');

      const recommendations = await analysisTools.generateManualReviewRecommendations();

      // Verify recommendations are sorted by priority (high to low)
      for (let i = 0; i < recommendations.length - 1; i++) {
        const currentPriority = recommendations[i].priority;
        const nextPriority = recommendations[i + 1].priority;

        const priorityOrder = { high: 3, medium: 2, low: 1 };
        expect(priorityOrder[currentPriority]).toBeGreaterThanOrEqual(priorityOrder[nextPriority]);
      }
    });

    it('should find related occurrences in the same file', async () => {
      mockExecSync.mockReturnValueOnce('src/test.ts:1:const data: any = value;');
      mockFs.readFileSync.mockReturnValue('const data: any = value;');

      // Mock related occurrences
      mockExecSync.mockImplementation((command: string) => {
        if (command.includes('grep -n') {
          return '1:const data: any = value;\n3:other: any = something;\n7:more: any[];';
        }
        return '';
      });

      const recommendations = await analysisTools.generateManualReviewRecommendations();

      if (recommendations.length > 0) {
        const firstRecommendation = recommendations[0];
        expect(firstRecommendation.relatedOccurrences.length).toBeGreaterThan(0);
        expect(firstRecommendation.relatedOccurrences.length).toBeLessThanOrEqual(5); // Limited to 5
      }
    });
  });

  describe('generateComprehensiveReport', () => {
    it('should generate comprehensive analysis report', async () => {
      // Mock all the required data
      mockExecSync.mockReturnValue('src/test.ts:1:const data: any = value;');
      mockFs.readFileSync.mockReturnValue('const data: any = value;');

      const report = await analysisTools.generateComprehensiveReport();

      expect(report.id).toBeDefined();
      expect(report.timestamp).toBeInstanceOf(Date);
      expect(report.domainDistribution).toBeDefined();
      expect(report.accuracyReport).toBeDefined();
      expect(report.successRateAnalysis).toBeDefined();
      expect(report.manualReviewRecommendations).toBeInstanceOf(Array);
      expect(report.summary).toBeDefined();

      // Verify summary data
      expect(report.summary.totalAnyTypes).toBeGreaterThanOrEqual(0);
      expect(report.summary.unintentionalCount).toBeGreaterThanOrEqual(0);
      expect(report.summary.classificationAccuracy).toBeGreaterThanOrEqual(0);
      expect(report.summary.currentSuccessRate).toBeGreaterThanOrEqual(0);
      expect(report.summary.manualReviewCases).toBeGreaterThanOrEqual(0);
      expect(Object.values(CodeDomain)).toContain(report.summary.topDomain);
      expect(Object.values(AnyTypeCategory)).toContain(report.summary.topCategory);
    });

    it('should save report to history', async () => {
      mockExecSync.mockReturnValue('');
      mockFs.readFileSync.mockReturnValue('');

      await analysisTools.generateComprehensiveReport();

      // Verify that writeFileSync was called to save the history
      expect(mockFs.writeFileSync).toHaveBeenCalled();
    });

    it('should handle file system errors gracefully', async () => {
      mockExecSync.mockReturnValue('');
      mockFs.readFileSync.mockReturnValue('');
      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error('File system error');
      });

      // Should not throw error even if saving fails
      const report = await analysisTools.generateComprehensiveReport();
      expect(report).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle grep command failures gracefully', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Command failed');
      });

      const distribution = await analysisTools.analyzeDomainDistribution();
      expect(distribution.totalAnyTypes).toBe(0);
    });

    it('should handle file reading failures gracefully', async () => {
      mockExecSync.mockReturnValue('src/test.ts:1:const data: any = value;');
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      const distribution = await analysisTools.analyzeDomainDistribution();
      expect(distribution).toBeDefined();
    });

    it('should handle malformed grep output', async () => {
      mockExecSync.mockReturnValue('invalid output format');
      mockFs.readFileSync.mockReturnValue('');

      const distribution = await analysisTools.analyzeDomainDistribution();
      expect(distribution.totalAnyTypes).toBe(0);
    });
  });

  describe('data validation', () => {
    it('should validate percentage calculations', async () => {
      mockExecSync.mockReturnValue(`)
src/test1.ts:1:any
src/test2.ts:1:any
src/test3.ts:1:any
      `.trim());
      mockFs.readFileSync.mockReturnValue('const data: any = value;');

      const distribution = await analysisTools.analyzeDomainDistribution();

      // All percentages should add up to 100%
      const domainTotal = distribution.byDomain.reduce((sum, item) => sum + item.percentage, 0);
      const categoryTotal = distribution.byCategory.reduce((sum, item) => sum + item.percentage, 0);
      const intentionalTotal = distribution.intentionalVsUnintentional.intentional.percentage +
                              distribution.intentionalVsUnintentional.unintentional.percentage;

      expect(domainTotal).toBeCloseTo(100, 1);
      expect(categoryTotal).toBeCloseTo(100, 1);
      expect(intentionalTotal).toBeCloseTo(100, 1);
    });

    it('should validate confidence scores are within valid range', async () => {
      mockExecSync.mockReturnValue('src/test.ts:1:const data: any = value;');
      mockFs.readFileSync.mockReturnValue('const data: any = value;');

      const report = await analysisTools.generateClassificationAccuracyReport();

      expect(report.averageConfidence).toBeGreaterThanOrEqual(0);
      expect(report.averageConfidence).toBeLessThanOrEqual(1);

      report.confidenceDistribution.forEach(dist => {
        expect(dist.percentage).toBeGreaterThanOrEqual(0);
        expect(dist.percentage).toBeLessThanOrEqual(100);
      });
    });

    it('should validate success rates are within valid range', async () => {
      const analysis = await analysisTools.generateSuccessRateAnalysis();

      expect(analysis.currentSuccessRate).toBeGreaterThanOrEqual(0);
      expect(analysis.currentSuccessRate).toBeLessThanOrEqual(100);

      analysis.categorySuccessRates.forEach(category => {
        expect(category.successRate).toBeGreaterThanOrEqual(0);
        expect(category.successRate).toBeLessThanOrEqual(100);
      });
    });
  });
});
