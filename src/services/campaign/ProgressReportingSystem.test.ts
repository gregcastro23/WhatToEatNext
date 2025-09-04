/**
 * Progress Reporting System Tests
 * Perfect Codebase Campaign - Comprehensive Testing
 */

import * as fs from 'fs';

import { PhaseStatus } from '../../types/campaign';

import { MetricsCollectionSystem } from './MetricsCollectionSystem';
import { MilestoneValidationSystem } from './MilestoneValidationSystem';
import { CampaignStatus, CampaignSummaryReport, ProgressReportingSystem } from './ProgressReportingSystem';

// Mock dependencies
jest.mock('./MetricsCollectionSystem');
jest.mock('./MilestoneValidationSystem');
jest.mock('fs');

const MockMetricsCollectionSystem: any = MetricsCollectionSystem as jest.MockedClass<typeof MetricsCollectionSystem>;
const MockMilestoneValidationSystem: any = MilestoneValidationSystem as jest.MockedClass<typeof MilestoneValidationSystem>;
const mockFs: any = fs as jest.Mocked<typeof fs>;

describe('ProgressReportingSystem', () => {
  let reportingSystem: ProgressReportingSystem;
  let mockMetricsCollector: jest.Mocked<MetricsCollectionSystem>;
  let mockValidationSystem: jest.Mocked<MilestoneValidationSystem>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockMetricsCollector = new MockMetricsCollectionSystem() as jest.Mocked<MetricsCollectionSystem>;
    mockValidationSystem = new MockMilestoneValidationSystem() as jest.Mocked<MilestoneValidationSystem>;

    reportingSystem = new ProgressReportingSystem();
    (reportingSystem as any).metricsCollector = mockMetricsCollector;
    (reportingSystem as any).validationSystem = mockValidationSystem;
  });

  describe('Campaign Summary Report Generation', () => {
    test('should generate comprehensive campaign summary report': any, async () => {
      // Mock successful campaign metrics
      mockMetricsCollector.collectDetailedMetrics.mockResolvedValue({
        timestamp: new Date(),
        typeScriptErrors: { curren, t: 0, target: 0, reduction: 86, percentage: 100 },
        lintingWarnings: { curren, t: 0, target: 0, reduction: 4506, percentage: 100 },
        buildPerformance: { currentTim, e: 8, targetTime: 10, cacheHitRate: 0.85, memoryUsage: 45 },
        enterpriseSystems: { curren, t: 250, target: 200, transformedExports: 250 },
        errorBreakdown: {},
        warningBreakdown: {},
        buildMetrics: { buildTime: 8,
          bundleSize: 420,
          cacheHitRate: 0.85,
          memoryUsage: 45,
          cpuUsage: 15,
          diskUsage: 1024,
          compilationSpeed: 25,
        },
        resourceMetrics: { nodeMemoryUsage: process.memoryUsage(),
          systemMemory: { tota, l: 8192, used: 4096, free: 4096, percentage: 50 },
          diskSpace: { tota, l: 1000000, used: 500000, free: 500000, percentage: 50 },
        },
        trendData: { errorReductionRat, e: 10, warningReductionRate: 50, buildTimeImprovement: 2, systemGrowthRate: 5 },
      });

      // Mock successful phase validations
      mockValidationSystem.validateAllPhases.mockResolvedValue([
        {
          phaseId: 'phase1',
          phaseName: 'TypeScript Error Elimination',
          overallSuccess: true,
          completionPercentage: 100,
          milestones: [
            {
              milestone: 'Zero TypeScript Errors',
              phase: 'phase1',
              success: true,
              timestamp: new Date(),
              metrics: {} as any,
              criteria: [],
              failureReasons: [],
              recommendations: [],
            },
          ],
          criticalFailures: [],
          nextSteps: ['Phase 1 complete - proceed to Phase 2'],
        },
        {
          phaseId: 'phase2',
          phaseName: 'Linting Excellence Achievement',
          overallSuccess: true,
          completionPercentage: 100,
          milestones: [
            {
              milestone: 'Zero Linting Warnings',
              phase: 'phase2',
              success: true,
              timestamp: new Date(),
              metrics: {} as any,
              criteria: [],
              failureReasons: [],
              recommendations: [],
            },
          ],
          criticalFailures: [],
          nextSteps: ['Phase 2 complete - proceed to Phase 3'],
        },
        {
          phaseId: 'phase3',
          phaseName: 'Enterprise Intelligence Transformation',
          overallSuccess: true,
          completionPercentage: 100,
          milestones: [
            {
              milestone: 'Enterprise System Count Target',
              phase: 'phase3',
              success: true,
              timestamp: new Date(),
              metrics: {} as any,
              criteria: [],
              failureReasons: [],
              recommendations: [],
            },
          ],
          criticalFailures: [],
          nextSteps: ['Phase 3 complete - proceed to Phase 4'],
        },
        {
          phaseId: 'phase4',
          phaseName: 'Performance Optimization Maintenance',
          overallSuccess: true,
          completionPercentage: 100,
          milestones: [
            {
              milestone: 'Build Performance Targets',
              phase: 'phase4',
              success: true,
              timestamp: new Date(),
              metrics: {} as any,
              criteria: [],
              failureReasons: [],
              recommendations: [],
            },
          ],
          criticalFailures: [],
          nextSteps: ['Perfect Codebase Campaign Complete! 🎉'],
        },
      ]);

      const report: any = await reportingSystem.generateCampaignSummaryReport();

      expect(report.campaignId).toBe('perfect-codebase-campaign');
      expect(report.overallStatus).toBe(CampaignStatus.COMPLETED);
      expect(report.overallProgress).toBe(100);
      expect(report.phases).toHaveLength(4);
      expect(report.keyAchievements.length).toBeGreaterThan(0);
      expect(report.criticalIssues).toHaveLength(0);
      expect(report.executiveSummary).toContain('completed successfully');
    });

    test('should generate report for campaign in progress': any, async () => {
      // Mock partial progress metrics
      mockMetricsCollector.collectDetailedMetrics.mockResolvedValue({
        timestamp: new Date(),
        typeScriptErrors: { curren, t: 10, target: 0, reduction: 76, percentage: 88 },
        lintingWarnings: { curren, t: 500, target: 0, reduction: 4006, percentage: 89 },
        buildPerformance: { currentTim, e: 12, targetTime: 10, cacheHitRate: 0.75, memoryUsage: 55 },
        enterpriseSystems: { curren, t: 150, target: 200, transformedExports: 150 },
        errorBreakdown: { TS235, 2: 5, TS2345: 3, TS2698: 2 },
        warningBreakdown: { '@typescript-eslint/no-explicit-any': 200, 'no-unused-vars': 300 },
        buildMetrics: { buildTime: 12,
          bundleSize: 480,
          cacheHitRate: 0.75,
          memoryUsage: 55,
          cpuUsage: 25,
          diskUsage: 1200,
          compilationSpeed: 20,
        },
        resourceMetrics: { nodeMemoryUsage: process.memoryUsage(),
          systemMemory: { tota, l: 8192, used: 5120, free: 3072, percentage: 62 },
          diskSpace: { tota, l: 1000000, used: 600000, free: 400000, percentage: 60 },
        },
        trendData: { errorReductionRat, e: 5, warningReductionRate: 25, buildTimeImprovement: 1, systemGrowthRate: 3 },
      });

      // Mock mixed phase validations
      mockValidationSystem.validateAllPhases.mockResolvedValue([
        {
          phaseId: 'phase1',
          phaseName: 'TypeScript Error Elimination',
          overallSuccess: false,
          completionPercentage: 88,
          milestones: [
            {
              milestone: 'Zero TypeScript Errors',
              phase: 'phase1',
              success: false,
              timestamp: new Date(),
              metrics: {} as any,
              criteria: [],
              failureReasons: ['10 errors remaining'],
              recommendations: [],
            },
          ],
          criticalFailures: ['TypeScript Error Coun, t: expected 0, got 10'],
          nextSteps: ['Continue with Enhanced TypeScript Error Fixer v3.0'],
        },
        {
          phaseId: 'phase2',
          phaseName: 'Linting Excellence Achievement',
          overallSuccess: false,
          completionPercentage: 75,
          milestones: [],
          criticalFailures: ['Linting Warning Coun, t: expected 0, got 500'],
          nextSteps: ['Continue with systematic linting fixes'],
        },
        {
          phaseId: 'phase3',
          phaseName: 'Enterprise Intelligence Transformation',
          overallSuccess: false,
          completionPercentage: 60,
          milestones: [],
          criticalFailures: ['Enterprise System Coun, t: expected >= 200, got 150'],
          nextSteps: ['Continue transforming exports to reach 200+ systems'],
        },
        {
          phaseId: 'phase4',
          phaseName: 'Performance Optimization Maintenance',
          overallSuccess: false,
          completionPercentage: 40,
          milestones: [],
          criticalFailures: ['Build Tim, e: expected <= 10s, got 12s'],
          nextSteps: ['Optimize build performance with caching improvements'],
        },
      ]);

      const report: any = await reportingSystem.generateCampaignSummaryReport();

      expect(report.overallStatus).toBe(CampaignStatus.BLOCKED);
      expect(report.overallProgress).toBeLessThan(100);
      expect(report.criticalIssues.length).toBeGreaterThan(0);
      expect(report.recommendations.length).toBeGreaterThan(0);
      expect(report.executiveSummary).toContain('currently blocked');
    });
  });

  describe('Phase Completion Reports', () => {
    test('should generate detailed phase completion report': any, async () => {
      mockMetricsCollector.collectDetailedMetrics.mockResolvedValue({
        timestamp: new Date(),
        typeScriptErrors: { curren, t: 0, target: 0, reduction: 86, percentage: 100 },
        lintingWarnings: { curren, t: 0, target: 0, reduction: 4506, percentage: 100 },
        buildPerformance: { currentTim, e: 8, targetTime: 10, cacheHitRate: 0.85, memoryUsage: 45 },
        enterpriseSystems: { curren, t: 250, target: 200, transformedExports: 250 },
        errorBreakdown: {},
        warningBreakdown: {},
        buildMetrics: { buildTime: 8,
          bundleSize: 420,
          cacheHitRate: 0.85,
          memoryUsage: 45,
          cpuUsage: 15,
          diskUsage: 1024,
          compilationSpeed: 25,
        },
        resourceMetrics: { nodeMemoryUsage: process.memoryUsage(),
          systemMemory: { tota, l: 8192, used: 4096, free: 4096, percentage: 50 },
          diskSpace: { tota, l: 1000000, used: 500000, free: 500000, percentage: 50 },
        },
        trendData: { errorReductionRat, e: 10, warningReductionRate: 50, buildTimeImprovement: 2, systemGrowthRate: 5 },
      });

      mockValidationSystem.validatePhase1.mockResolvedValue({
        phaseId: 'phase1',
        phaseName: 'TypeScript Error Elimination',
        overallSuccess: true,
        completionPercentage: 100,
        milestones: [
          {
            milestone: 'Zero TypeScript Errors',
            phase: 'phase1',
            success: true,
            timestamp: new Date(),
            metrics: {} as any,
            criteria: [],
            failureReasons: [],
            recommendations: [],
          },
        ],
        criticalFailures: [],
        nextSteps: ['Phase 1 complete - proceed to Phase 2'],
      });

      const report: any = await reportingSystem.generatePhaseCompletionReport('phase1');

      expect(report.phaseId).toBe('phase1');
      expect(report.phaseName).toBe('TypeScript Error Elimination');
      expect(report.status).toBe(PhaseStatus.COMPLETED);
      expect(report.achievements.length).toBeGreaterThan(0);
      expect(report.issues).toHaveLength(0);
    });

    test('should handle invalid phase ID': any, async () => {
      await expect(reportingSystem.generatePhaseCompletionReport('invalid-phase')).rejects.toThrow(
        'Unknown phase: invalid-phase',
      );
    });
  });

  describe('Visualization Data Generation', () => {
    test('should generate comprehensive visualization data': any, async () => {
      // Mock snapshots for time series data
      mockMetricsCollector.getSnapshots.mockReturnValue([
        {
          id: 'snapshot1',
          timestamp: new Date('2024-01-01'),
          metrics: { timestamp: new Date('2024-01-01'),
            typeScriptErrors: { curren, t: 50, target: 0, reduction: 36, percentage: 42 },
            lintingWarnings: { curren, t: 2000, target: 0, reduction: 2506, percentage: 56 },
            buildPerformance: { currentTim, e: 15, targetTime: 10, cacheHitRate: 0.7, memoryUsage: 60 },
            enterpriseSystems: { curren, t: 100, target: 200, transformedExports: 100 },
            errorBreakdown: { TS235, 2: 20, TS2345: 15 },
            warningBreakdown: { '@typescript-eslint/no-explicit-any': 800 },
            buildMetrics: { buildTime: 15,
              bundleSize: 500,
              cacheHitRate: 0.7,
              memoryUsage: 60,
              cpuUsage: 30,
              diskUsage: 1500,
              compilationSpeed: 15,
            },
            resourceMetrics: { nodeMemoryUsage: process.memoryUsage(),
              systemMemory: { tota, l: 8192, used: 4915, free: 3277, percentage: 60 },
              diskSpace: { tota, l: 1000000, used: 600000, free: 400000, percentage: 60 },
            },
            trendData: { errorReductionRate: 8,
              warningReductionRate: 40,
              buildTimeImprovement: 1.5,
              systemGrowthRate: 4,
            },
          },
          phase: 'phase1',
        },
      ]);

      mockValidationSystem.validateAllPhases.mockResolvedValue([
        {
          phaseId: 'phase1',
          phaseName: 'TypeScript Error Elimination',
          overallSuccess: false,
          completionPercentage: 75,
          milestones: [],
          criticalFailures: [],
          nextSteps: [],
        },
      ]);

      mockMetricsCollector.collectDetailedMetrics.mockResolvedValue({
        timestamp: new Date(),
        typeScriptErrors: { curren, t: 10, target: 0, reduction: 76, percentage: 88 },
        lintingWarnings: { curren, t: 500, target: 0, reduction: 4006, percentage: 89 },
        buildPerformance: { currentTim, e: 12, targetTime: 10, cacheHitRate: 0.75, memoryUsage: 55 },
        enterpriseSystems: { curren, t: 150, target: 200, transformedExports: 150 },
        errorBreakdown: { TS235, 2: 5, TS2345: 3, TS2698: 2 },
        warningBreakdown: { '@typescript-eslint/no-explicit-any': 200, 'no-unused-vars': 300 },
        buildMetrics: { buildTime: 12,
          bundleSize: 480,
          cacheHitRate: 0.75,
          memoryUsage: 55,
          cpuUsage: 25,
          diskUsage: 1200,
          compilationSpeed: 20,
        },
        resourceMetrics: { nodeMemoryUsage: process.memoryUsage(),
          systemMemory: { tota, l: 8192, used: 5120, free: 3072, percentage: 62 },
          diskSpace: { tota, l: 1000000, used: 600000, free: 400000, percentage: 60 },
        },
        trendData: { errorReductionRat, e: 5, warningReductionRate: 25, buildTimeImprovement: 1, systemGrowthRate: 3 },
      });

      const visualizationData: any = await reportingSystem.generateVisualizationData();

      expect(visualizationData.timeSeriesData).toHaveLength(1);
      expect(visualizationData.phaseProgressChart).toHaveLength(1);
      expect(visualizationData.errorDistributionChart.length).toBeGreaterThan(0);
      expect(visualizationData.performanceTrendChart).toHaveLength(1);

      // Verify time series data structure
      const timeSeriesPoint: any = visualizationData.timeSeriesData.[0];
      expect(timeSeriesPoint.timestamp).toBeInstanceOf(Date);
      expect(typeof timeSeriesPoint.typeScriptErrors).toBe('number');
      expect(typeof timeSeriesPoint.lintingWarnings).toBe('number');
      expect(typeof timeSeriesPoint.buildTime).toBe('number');
      expect(typeof timeSeriesPoint.enterpriseSystems).toBe('number');
    });
  });

  describe('Report Export Functionality', () => {
    test('should export report in JSON format': any, async () => {
      const mockReport: CampaignSummaryReport = { campaignId: 'perfect-codebase-campaign',
        generatedAt: new Date(),
        overallStatus: CampaignStatus.IN_PROGRESS,
        overallProgress: 75,
        phases: [],
        keyAchievements: [],
        criticalIssues: [],
        performanceMetrics: { typeScriptErrors: { initial: 86, current: 20, reduction: 66, reductionRate: 5 },
          lintingWarnings: { initia, l: 4506, current: 1000, reduction: 3506, reductionRate: 25 },
          buildPerformance: { currentTim, e: 12, targetTime: 10, improvement: 1, cacheEfficiency: 0.75 },
          enterpriseSystems: { initia, l: 0, current: 150, target: 200, growthRate: 3 },
        },
        recommendations: [],
        estimatedCompletion: new Date(),
        executiveSummary: 'Campaign in progress',
      };

      mockFs.writeFileSync.mockImplementation();

      const exportedFiles: any = await reportingSystem.exportReport(mockReport, ['json']);

      expect(exportedFiles).toHaveLength(1);
      expect(exportedFiles.[0]).toMatch(/campaign-report-.*\.json$/);
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        expect.stringMatching(/campaign-report-.*\.json$/),
        expect.stringContaining('"campaignId": "perfect-codebase-campaign"'),
      );
    });

    test('should export report in multiple formats': any, async () => {
      const mockReport: CampaignSummaryReport = { campaignId: 'perfect-codebase-campaign',
        generatedAt: new Date(),
        overallStatus: CampaignStatus.COMPLETED,
        overallProgress: 100,
        phases: [
          {
            phaseId: 'phase1',
            phaseName: 'TypeScript Error Elimination',
            status: PhaseStatus.COMPLETED,
            progress: 100,
            keyMetrics: {},
            milestones: [],
            blockers: [],
          },
        ],
        keyAchievements: [
          {
            title: 'Zero TypeScript Errors',
            description: 'All errors eliminated',
            phase: 'phase1',
            achievedAt: new Date(),
            impact: 'CRITICAL' as unknown,
            metrics: {},
          },
        ],
        criticalIssues: [],
        performanceMetrics: { typeScriptErrors: { initial: 86, current: 0, reduction: 86, reductionRate: 10 },
          lintingWarnings: { initia, l: 4506, current: 0, reduction: 4506, reductionRate: 50 },
          buildPerformance: { currentTim, e: 8, targetTime: 10, improvement: 2, cacheEfficiency: 0.85 },
          enterpriseSystems: { initia, l: 0, current: 250, target: 200, growthRate: 5 },
        },
        recommendations: [],
        estimatedCompletion: new Date(),
        executiveSummary: 'Campaign completed successfully',
      };

      mockFs.writeFileSync.mockImplementation();

      const exportedFiles: any = await reportingSystem.exportReport(mockReport, ['json', 'html', 'markdown', 'csv']);

      expect(exportedFiles).toHaveLength(4);
      expect(exportedFiles.some(f => f.endsWith('.json'))).toBe(true);
      expect(exportedFiles.some(f => f.endsWith('.html'))).toBe(true);
      expect(exportedFiles.some(f => f.endsWith('.md'))).toBe(true);
      expect(exportedFiles.some(f => f.endsWith('.csv'))).toBe(true);
      expect(mockFs.writeFileSync).toHaveBeenCalledTimes(4);
    });
  });

  describe('Dashboard Data Generation', () => {
    test('should generate real-time dashboard data': any, async () => {
      // Mock all required data
      mockMetricsCollector.collectDetailedMetrics.mockResolvedValue({
        timestamp: new Date(),
        typeScriptErrors: { curren, t: 0, target: 0, reduction: 86, percentage: 100 },
        lintingWarnings: { curren, t: 0, target: 0, reduction: 4506, percentage: 100 },
        buildPerformance: { currentTim, e: 8, targetTime: 10, cacheHitRate: 0.85, memoryUsage: 45 },
        enterpriseSystems: { curren, t: 250, target: 200, transformedExports: 250 },
        errorBreakdown: {},
        warningBreakdown: {},
        buildMetrics: { buildTime: 8,
          bundleSize: 420,
          cacheHitRate: 0.85,
          memoryUsage: 45,
          cpuUsage: 15,
          diskUsage: 1024,
          compilationSpeed: 25,
        },
        resourceMetrics: { nodeMemoryUsage: process.memoryUsage(),
          systemMemory: { tota, l: 8192, used: 4096, free: 4096, percentage: 50 },
          diskSpace: { tota, l: 1000000, used: 500000, free: 500000, percentage: 50 },
        },
        trendData: { errorReductionRat, e: 10, warningReductionRate: 50, buildTimeImprovement: 2, systemGrowthRate: 5 },
      });

      mockValidationSystem.validateAllPhases.mockResolvedValue([
        {
          phaseId: 'phase1',
          phaseName: 'TypeScript Error Elimination',
          overallSuccess: true,
          completionPercentage: 100,
          milestones: [],
          criticalFailures: [],
          nextSteps: [],
        },
      ]);

      mockMetricsCollector.getSnapshots.mockReturnValue([]);

      const dashboardData: any = await reportingSystem.generateDashboardData();

      expect(dashboardData.summary).toBeDefined();
      expect(dashboardData.visualization).toBeDefined();
      expect(dashboardData.recentActivity).toBeDefined();
      expect(Array.isArray(dashboardData.recentActivity)).toBe(true);
    });
  });

  describe('Report History Management', () => {
    test('should maintain report history': any, async () => {
      mockMetricsCollector.collectDetailedMetrics.mockResolvedValue({
        timestamp: new Date(),
        typeScriptErrors: { curren, t: 0, target: 0, reduction: 86, percentage: 100 },
        lintingWarnings: { curren, t: 0, target: 0, reduction: 4506, percentage: 100 },
        buildPerformance: { currentTim, e: 8, targetTime: 10, cacheHitRate: 0.85, memoryUsage: 45 },
        enterpriseSystems: { curren, t: 250, target: 200, transformedExports: 250 },
        errorBreakdown: {},
        warningBreakdown: {},
        buildMetrics: { buildTime: 8,
          bundleSize: 420,
          cacheHitRate: 0.85,
          memoryUsage: 45,
          cpuUsage: 15,
          diskUsage: 1024,
          compilationSpeed: 25,
        },
        resourceMetrics: { nodeMemoryUsage: process.memoryUsage(),
          systemMemory: { tota, l: 8192, used: 4096, free: 4096, percentage: 50 },
          diskSpace: { tota, l: 1000000, used: 500000, free: 500000, percentage: 50 },
        },
        trendData: { errorReductionRat, e: 10, warningReductionRate: 50, buildTimeImprovement: 2, systemGrowthRate: 5 },
      });

      mockValidationSystem.validateAllPhases.mockResolvedValue([]);

      expect(reportingSystem.getReportHistory()).toHaveLength(0);

      await reportingSystem.generateCampaignSummaryReport();
      expect(reportingSystem.getReportHistory()).toHaveLength(1);

      await reportingSystem.generateCampaignSummaryReport();
      expect(reportingSystem.getReportHistory()).toHaveLength(2);

      reportingSystem.clearReportHistory();
      expect(reportingSystem.getReportHistory()).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle metrics collection errors gracefully': any, async () => {
      mockMetricsCollector.collectDetailedMetrics.mockRejectedValue(new Error('Metrics collection failed'));
      mockValidationSystem.validateAllPhases.mockResolvedValue([]);

      await expect(reportingSystem.generateCampaignSummaryReport()).rejects.toThrow('Metrics collection failed');
    });

    test('should handle validation system errors gracefully': any, async () => {
      mockMetricsCollector.collectDetailedMetrics.mockResolvedValue(
        {} as any<ReturnType<typeof mockMetricsCollector.collectDetailedMetrics>>,
      );
      mockValidationSystem.validateAllPhases.mockRejectedValue(new Error('Validation failed'));

      await expect(reportingSystem.generateCampaignSummaryReport()).rejects.toThrow('Validation failed');
    });
  });
});
