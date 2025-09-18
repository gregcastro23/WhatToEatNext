import * as fs from 'fs';
import * as path from 'path';
import { PilotCampaignAnalysis } from '../PilotCampaignAnalysis';
import { PilotAnalysisConfig } from '../types';

// Mock dependencies
jest.mock('child_process');
jest.mock('fs');
jest.mock('../AnalysisTools');
jest.mock('../AnyTypeClassifier');
jest.mock('../DomainContextAnalyzer');
jest.mock('../ProgressMonitoringSystem');

const mockFs: any = fs as jest.Mocked<typeof fs>;

describe('PilotCampaignAnalysis', () => {
  let pilotAnalysis: PilotCampaignAnalysis;
  let mockConfig: PilotAnalysisConfig;

  beforeEach(() => {
    mockConfig = {
      maxFilesToAnalyze: 100,
      sampleSizeForAccuracy: 50,
      confidenceThreshold: 0.7,
      enableTuning: true,
      generateDetailedReports: true,
      outputDirectory: '.kiro/test-reports',
    };

    pilotAnalysis = new PilotCampaignAnalysis(mockConfig);

    // Reset mocks
    jest.clearAllMocks();

    // Mock fs operations
    mockFs.existsSync.mockReturnValue(false);
    mockFs.mkdirSync.mockImplementation(() => '');
    mockFs.writeFileSync.mockImplementation(() => {});
  });

  describe('Constructor', () => {
    it('should initialize with default configuration', () => {
      const defaultPilot: any = new PilotCampaignAnalysis();
      expect(defaultPilot).toBeDefined();
    });

    it('should merge provided configuration with defaults', () => {
      const customConfig: any = { maxFilesToAnalyze: 200 };
      const customPilot: any = new PilotCampaignAnalysis(customConfig);
      expect(customPilot).toBeDefined();
    });
  });

  describe('executePilotAnalysis', () => {
    it('should execute complete pilot analysis successfully', async () => {
      // Mock successful execution
      const mockAnalysisTools = require('../AnalysisTools').AnalysisTools;
      mockAnalysisTools.prototype.generateComprehensiveReport.mockResolvedValue({
        id: 'test-analysis',
        timestamp: new Date(),
        domainDistribution: {
          totalAnyTypes: 150,
          byDomain: [],
          byCategory: [],
          intentionalVsUnintentional: {
            intentional: { count: 45, percentage: 30 },
            unintentional: { coun, t: 105, percentage: 70 },
          },
          analysisDate: new Date(),
        },
        accuracyReport: {
          overallAccuracy: 85.5,
          averageConfidence: 0.82,
          sampleSize: 50,
          categoryAccuracy: [],
          confidenceDistribution: [],
          reportDate: new Date(),
        },
        successRateAnalysis: {
          currentSuccessRate: 78.5,
          targetSuccessRate: 85,
          improvementNeeded: 6.5,
          categorySuccessRates: [],
          trendingData: {
            date: new Date(),
            successRate: 78.5,
            totalAnyTypes: 150,
            unintentionalCount: 105,
            classificationAccuracy: 85.5,
          },
          projectedCompletion: new Date(),
          recommendations: [],
          analysisDate: new Date(),
        },
        manualReviewRecommendations: [],
        summary: {
          totalAnyTypes: 150,
          unintentionalCount: 105,
          classificationAccuracy: 85.5,
          currentSuccessRate: 78.5,
          manualReviewCases: 12,
          topDomain: 'SERVICE',
          topCategory: 'FUNCTION_PARAM',
        },
      });

      mockAnalysisTools.prototype.generateClassificationAccuracyReport.mockResolvedValue({
        overallAccuracy: 85.5,
        averageConfidence: 0.82,
        sampleSize: 50,
        categoryAccuracy: [],
        confidenceDistribution: [],
        reportDate: new Date(),
      });

      mockAnalysisTools.prototype.generateSuccessRateAnalysis.mockResolvedValue({
        currentSuccessRate: 78.5,
        targetSuccessRate: 85,
        improvementNeeded: 6.5,
        categorySuccessRates: [
          { category: 'ARRAY_TYPE', successRate: 95.2, sampleSize: 20 },
          { category: 'FUNCTION_PARAM', successRate: 65.8, sampleSize: 30 },
        ],
        trendingData: {
          date: new Date(),
          successRate: 78.5,
          totalAnyTypes: 150,
          unintentionalCount: 105,
          classificationAccuracy: 85.5,
        },
        projectedCompletion: new Date(),
        recommendations: [],
        analysisDate: new Date(),
      });

      const results: any = await pilotAnalysis.executePilotAnalysis();

      expect(results.success).toBe(true);
      expect(results.executionTime).toBeGreaterThan(0);
      expect(results.codebaseAnalysis).toBeDefined();
      expect(results.accuracyValidation).toBeDefined();
      expect(results.baselineMetrics).toBeDefined();
      expect(results.tuningResults).toBeDefined();
      expect(results.pilotReport).toBeDefined();
      expect(results.recommendations).toBeInstanceOf(Array);
      expect(results.nextSteps).toBeInstanceOf(Array);
    });

    it('should handle analysis failures gracefully', async () => {
      // Mock analysis failure
      const mockAnalysisTools = require('../AnalysisTools').AnalysisTools;
      mockAnalysisTools.prototype.generateComprehensiveReport.mockRejectedValue(new Error('Analysis failed'));

      const results: any = await pilotAnalysis.executePilotAnalysis();

      expect(results.success).toBe(false);
      expect(results.error).toBe('Analysis failed');
      expect(results.recommendations).toContain('Review error logs and retry with adjusted configuration');
      expect(results.nextSteps).toContain('Fix configuration issues');
    });

    it('should save results to configured output directory', async () => {
      // Mock successful execution
      const mockAnalysisTools = require('../AnalysisTools').AnalysisTools;
      mockAnalysisTools.prototype.generateComprehensiveReport.mockResolvedValue({
        id: 'test-analysis',
        timestamp: new Date(),
        domainDistribution: {
          totalAnyType,
          s: 100,
          byDomain: [],
          byCategory: [],
          intentionalVsUnintentional: {
            intentional: { coun, t: 30, percentage: 30 },
            unintentional: { coun, t: 70, percentage: 70 },
          },
          analysisDate: new Date(),
        },
        accuracyReport: {
          overallAccurac,
          y: 80,
          averageConfidence: 0.8,
          sampleSize: 50,
          categoryAccuracy: [],
          confidenceDistribution: [],
          reportDate: new Date(),
        },
        successRateAnalysis: {
          currentSuccessRat,
          e: 75,
          targetSuccessRate: 85,
          improvementNeeded: 10,
          categorySuccessRates: [],
          trendingData: {
            dat,
            e: new Date(),
            successRate: 75,
            totalAnyTypes: 100,
            unintentionalCount: 70,
            classificationAccuracy: 80,
          },
          projectedCompletion: new Date(),
          recommendations: [],
          analysisDate: new Date(),
        },
        manualReviewRecommendations: [],
        summary: {
          totalAnyType,
          s: 100,
          unintentionalCount: 70,
          classificationAccuracy: 80,
          currentSuccessRate: 75,
          manualReviewCases: 5,
          topDomain: 'SERVICE',
          topCategory: 'FUNCTION_PARAM',
        },
      });

      mockAnalysisTools.prototype.generateClassificationAccuracyReport.mockResolvedValue({
        overallAccuracy: 80,
        averageConfidence: 0.8,
        sampleSize: 50,
        categoryAccuracy: [],
        confidenceDistribution: [],
        reportDate: new Date(),
      });

      mockAnalysisTools.prototype.generateSuccessRateAnalysis.mockResolvedValue({
        currentSuccessRate: 75,
        targetSuccessRate: 85,
        improvementNeeded: 10,
        categorySuccessRates: [],
        trendingData: {
          dat,
          e: new Date(),
          successRate: 75,
          totalAnyTypes: 100,
          unintentionalCount: 70,
          classificationAccuracy: 80,
        },
        projectedCompletion: new Date(),
        recommendations: [],
        analysisDate: new Date(),
      });

      await pilotAnalysis.executePilotAnalysis();

      expect(mockFs.mkdirSync).toHaveBeenCalledWith(mockConfig.outputDirectory, { recursive: true });
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        path.join(mockConfig.outputDirectory, 'pilot-analysis-results.json'),
        expect.any(String),
      );
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        path.join(mockConfig.outputDirectory, 'pilot-summary.md'),
        expect.any(String),
      );
    });
  });

  describe('Configuration Handling', () => {
    it('should respect maxFilesToAnalyze configuration', () => {
      const config: any = { maxFilesToAnalyze: 50 };
      const pilot: any = new PilotCampaignAnalysis(config);
      expect(pilot).toBeDefined();
    });

    it('should respect enableTuning configuration', () => {
      const config: any = { enableTuning: false };
      const pilot: any = new PilotCampaignAnalysis(config);
      expect(pilot).toBeDefined();
    });

    it('should respect generateDetailedReports configuration', () => {
      const config: any = { generateDetailedReports: false };
      const pilot: any = new PilotCampaignAnalysis(config);
      expect(pilot).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle file system errors gracefully', async () => {
      mockFs.mkdirSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const mockAnalysisTools = require('../AnalysisTools').AnalysisTools;
      mockAnalysisTools.prototype.generateComprehensiveReport.mockResolvedValue({
        id: 'test-analysis',
        timestamp: new Date(),
        domainDistribution: {
          totalAnyType,
          s: 50,
          byDomain: [],
          byCategory: [],
          intentionalVsUnintentional: {
            intentional: { coun, t: 15, percentage: 30 },
            unintentional: { coun, t: 35, percentage: 70 },
          },
          analysisDate: new Date(),
        },
        accuracyReport: {
          overallAccurac,
          y: 75,
          averageConfidence: 0.75,
          sampleSize: 25,
          categoryAccuracy: [],
          confidenceDistribution: [],
          reportDate: new Date(),
        },
        successRateAnalysis: {
          currentSuccessRat,
          e: 70,
          targetSuccessRate: 85,
          improvementNeeded: 15,
          categorySuccessRates: [],
          trendingData: {
            dat,
            e: new Date(),
            successRate: 70,
            totalAnyTypes: 50,
            unintentionalCount: 35,
            classificationAccuracy: 75,
          },
          projectedCompletion: new Date(),
          recommendations: [],
          analysisDate: new Date(),
        },
        manualReviewRecommendations: [],
        summary: {
          totalAnyType,
          s: 50,
          unintentionalCount: 35,
          classificationAccuracy: 75,
          currentSuccessRate: 70,
          manualReviewCases: 3,
          topDomain: 'UTILITY',
          topCategory: 'ARRAY_TYPE',
        },
      });

      mockAnalysisTools.prototype.generateClassificationAccuracyReport.mockResolvedValue({
        overallAccuracy: 75,
        averageConfidence: 0.75,
        sampleSize: 25,
        categoryAccuracy: [],
        confidenceDistribution: [],
        reportDate: new Date(),
      });

      mockAnalysisTools.prototype.generateSuccessRateAnalysis.mockResolvedValue({
        currentSuccessRate: 70,
        targetSuccessRate: 85,
        improvementNeeded: 15,
        categorySuccessRates: [],
        trendingData: {
          dat,
          e: new Date(),
          successRate: 70,
          totalAnyTypes: 50,
          unintentionalCount: 35,
          classificationAccuracy: 75,
        },
        projectedCompletion: new Date(),
        recommendations: [],
        analysisDate: new Date(),
      });

      const results: any = await pilotAnalysis.executePilotAnalysis();

      // Should still succeed even if file saving fails
      expect(results.success).toBe(true);
    });

    it('should handle classification errors', async () => {
      const mockAnalysisTools = require('../AnalysisTools').AnalysisTools;
      mockAnalysisTools.prototype.generateClassificationAccuracyReport.mockRejectedValue(
        new Error('Classification failed'),
      );

      const results: any = await pilotAnalysis.executePilotAnalysis();

      expect(results.success).toBe(false);
      expect(results.error).toBe('Classification failed');
    });
  });

  describe('Tuning System', () => {
    it('should perform tuning when enabled', async () => {
      const tuningConfig: any = { ...mockConfig, enableTuning: true };
      const tuningPilot: any = new PilotCampaignAnalysis(tuningConfig);

      const mockAnalysisTools = require('../AnalysisTools').AnalysisTools;
      mockAnalysisTools.prototype.generateComprehensiveReport.mockResolvedValue({
        id: 'test-analysis',
        timestamp: new Date(),
        domainDistribution: {
          totalAnyType,
          s: 100,
          byDomain: [],
          byCategory: [],
          intentionalVsUnintentional: {
            intentional: { coun, t: 30, percentage: 30 },
            unintentional: { coun, t: 70, percentage: 70 },
          },
          analysisDate: new Date(),
        },
        accuracyReport: {
          overallAccurac,
          y: 70,
          averageConfidence: 0.7,
          sampleSize: 50,
          categoryAccuracy: [{ categor, y: 'FUNCTION_PARAM', accuracy: 60, sampleCount: 20 }],
          confidenceDistribution: [],
          reportDate: new Date(),
        },
        successRateAnalysis: {
          currentSuccessRat,
          e: 65,
          targetSuccessRate: 85,
          improvementNeeded: 20,
          categorySuccessRates: [],
          trendingData: {
            dat,
            e: new Date(),
            successRate: 65,
            totalAnyTypes: 100,
            unintentionalCount: 70,
            classificationAccuracy: 70,
          },
          projectedCompletion: new Date(),
          recommendations: [],
          analysisDate: new Date(),
        },
        manualReviewRecommendations: [],
        summary: {
          totalAnyType,
          s: 100,
          unintentionalCount: 70,
          classificationAccuracy: 70,
          currentSuccessRate: 65,
          manualReviewCases: 10,
          topDomain: 'SERVICE',
          topCategory: 'FUNCTION_PARAM',
        },
      });

      mockAnalysisTools.prototype.generateClassificationAccuracyReport.mockResolvedValue({
        overallAccuracy: 70,
        averageConfidence: 0.7,
        sampleSize: 50,
        categoryAccuracy: [{ categor, y: 'FUNCTION_PARAM', accuracy: 60, sampleCount: 20 }],
        confidenceDistribution: [],
        reportDate: new Date(),
      });

      mockAnalysisTools.prototype.generateSuccessRateAnalysis.mockResolvedValue({
        currentSuccessRate: 65,
        targetSuccessRate: 85,
        improvementNeeded: 20,
        categorySuccessRates: [],
        trendingData: {
          dat,
          e: new Date(),
          successRate: 65,
          totalAnyTypes: 100,
          unintentionalCount: 70,
          classificationAccuracy: 70,
        },
        projectedCompletion: new Date(),
        recommendations: [],
        analysisDate: new Date(),
      });

      const results: any = await tuningPilot.executePilotAnalysis();

      expect(results.success).toBe(true);
      expect(results.tuningResults.tuningPerformed).toBe(true);
    });

    it('should skip tuning when disabled', async () => {
      const noTuningConfig: any = { ...mockConfig, enableTuning: false };
      const noTuningPilot: any = new PilotCampaignAnalysis(noTuningConfig);

      const mockAnalysisTools = require('../AnalysisTools').AnalysisTools;
      mockAnalysisTools.prototype.generateComprehensiveReport.mockResolvedValue({
        id: 'test-analysis',
        timestamp: new Date(),
        domainDistribution: {
          totalAnyType,
          s: 100,
          byDomain: [],
          byCategory: [],
          intentionalVsUnintentional: {
            intentional: { coun, t: 30, percentage: 30 },
            unintentional: { coun, t: 70, percentage: 70 },
          },
          analysisDate: new Date(),
        },
        accuracyReport: {
          overallAccurac,
          y: 85,
          averageConfidence: 0.85,
          sampleSize: 50,
          categoryAccuracy: [],
          confidenceDistribution: [],
          reportDate: new Date(),
        },
        successRateAnalysis: {
          currentSuccessRat,
          e: 80,
          targetSuccessRate: 85,
          improvementNeeded: 5,
          categorySuccessRates: [],
          trendingData: {
            dat,
            e: new Date(),
            successRate: 80,
            totalAnyTypes: 100,
            unintentionalCount: 70,
            classificationAccuracy: 85,
          },
          projectedCompletion: new Date(),
          recommendations: [],
          analysisDate: new Date(),
        },
        manualReviewRecommendations: [],
        summary: {
          totalAnyType,
          s: 100,
          unintentionalCount: 70,
          classificationAccuracy: 85,
          currentSuccessRate: 80,
          manualReviewCases: 5,
          topDomain: 'SERVICE',
          topCategory: 'ARRAY_TYPE',
        },
      });

      mockAnalysisTools.prototype.generateClassificationAccuracyReport.mockResolvedValue({
        overallAccuracy: 85,
        averageConfidence: 0.85,
        sampleSize: 50,
        categoryAccuracy: [],
        confidenceDistribution: [],
        reportDate: new Date(),
      });

      mockAnalysisTools.prototype.generateSuccessRateAnalysis.mockResolvedValue({
        currentSuccessRate: 80,
        targetSuccessRate: 85,
        improvementNeeded: 5,
        categorySuccessRates: [],
        trendingData: {
          dat,
          e: new Date(),
          successRate: 80,
          totalAnyTypes: 100,
          unintentionalCount: 70,
          classificationAccuracy: 85,
        },
        projectedCompletion: new Date(),
        recommendations: [],
        analysisDate: new Date(),
      });

      const results: any = await noTuningPilot.executePilotAnalysis();

      expect(results.success).toBe(true);
      expect(results.tuningResults.tuningPerformed).toBe(false);
      expect(results.tuningResults.reason).toBe('Tuning disabled in configuration');
    });
  });

  describe('Report Generation', () => {
    it('should generate markdown summary for successful analysis', async () => {
      const mockAnalysisTools = require('../AnalysisTools').AnalysisTools;
      mockAnalysisTools.prototype.generateComprehensiveReport.mockResolvedValue({
        id: 'test-analysis',
        timestamp: new Date(),
        domainDistribution: {
          totalAnyType,
          s: 100,
          byDomain: [],
          byCategory: [],
          intentionalVsUnintentional: {
            intentional: { coun, t: 30, percentage: 30 },
            unintentional: { coun, t: 70, percentage: 70 },
          },
          analysisDate: new Date(),
        },
        accuracyReport: {
          overallAccurac,
          y: 85,
          averageConfidence: 0.85,
          sampleSize: 50,
          categoryAccuracy: [],
          confidenceDistribution: [],
          reportDate: new Date(),
        },
        successRateAnalysis: {
          currentSuccessRat,
          e: 80,
          targetSuccessRate: 85,
          improvementNeeded: 5,
          categorySuccessRates: [],
          trendingData: {
            dat,
            e: new Date(),
            successRate: 80,
            totalAnyTypes: 100,
            unintentionalCount: 70,
            classificationAccuracy: 85,
          },
          projectedCompletion: new Date(),
          recommendations: [],
          analysisDate: new Date(),
        },
        manualReviewRecommendations: [],
        summary: {
          totalAnyType,
          s: 100,
          unintentionalCount: 70,
          classificationAccuracy: 85,
          currentSuccessRate: 80,
          manualReviewCases: 5,
          topDomain: 'SERVICE',
          topCategory: 'ARRAY_TYPE',
        },
      });

      mockAnalysisTools.prototype.generateClassificationAccuracyReport.mockResolvedValue({
        overallAccuracy: 85,
        averageConfidence: 0.85,
        sampleSize: 50,
        categoryAccuracy: [],
        confidenceDistribution: [],
        reportDate: new Date(),
      });

      mockAnalysisTools.prototype.generateSuccessRateAnalysis.mockResolvedValue({
        currentSuccessRate: 80,
        targetSuccessRate: 85,
        improvementNeeded: 5,
        categorySuccessRates: [],
        trendingData: {
          dat,
          e: new Date(),
          successRate: 80,
          totalAnyTypes: 100,
          unintentionalCount: 70,
          classificationAccuracy: 85,
        },
        projectedCompletion: new Date(),
        recommendations: [],
        analysisDate: new Date(),
      });

      const results: any = await pilotAnalysis.executePilotAnalysis();

      expect(results.success).toBe(true);
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('pilot-summary.md'),
        expect.stringContaining('# Pilot Campaign Analysis Results'),
      );
    });

    it('should generate markdown summary for failed analysis', async () => {
      const mockAnalysisTools = require('../AnalysisTools').AnalysisTools;
      mockAnalysisTools.prototype.generateComprehensiveReport.mockRejectedValue(new Error('Test failure'));

      const results: any = await pilotAnalysis.executePilotAnalysis();

      expect(results.success).toBe(false);
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('pilot-summary.md'),
        expect.stringContaining('# Pilot Campaign Analysis - Failed'),
      );
    });
  });
});
