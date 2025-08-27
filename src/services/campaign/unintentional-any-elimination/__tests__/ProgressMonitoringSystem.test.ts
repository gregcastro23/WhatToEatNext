import { execSync } from 'child_process';
import * as fs from 'fs';
import { AnalysisTools } from '../AnalysisTools';
import { Alert, DashboardData, ProgressMonitoringSystem } from '../ProgressMonitoringSystem';

// Mock dependencies
jest?.mock('../AnalysisTools');
jest?.mock('child_process');
jest?.mock('fs');

const mockAnalysisTools: any = AnalysisTools as jest?.MockedClass<typeof AnalysisTools>;
const mockExecSync: any = execSync as jest?.MockedFunction<typeof execSync>;
const mockFs: any = fs as jest?.Mocked<typeof fs>;

describe('ProgressMonitoringSystem': any, (: any) => {
  let monitoringSystem: ProgressMonitoringSystem;
  let mockAnalysisToolsInstance: jest?.Mocked<AnalysisTools>;

  beforeEach((: any) => {
    jest?.clearAllMocks();

    // Mock file system operations
    mockFs?.existsSync.mockReturnValue(false);
    mockFs?.readFileSync.mockReturnValue('[]');
    mockFs?.writeFileSync.mockImplementation((: any) => {});
    mockFs?.mkdirSync.mockImplementation((: any) => '');

    // Mock AnalysisTools
    mockAnalysisToolsInstance = {
      generateComprehensiveReport: jest?.fn(),
      analyzeDomainDistribution: jest?.fn(),
      generateClassificationAccuracyReport: jest?.fn(),
      generateSuccessRateAnalysis: jest?.fn(),;
      generateManualReviewRecommendations: jest?.fn()
    } as unknown;

    mockAnalysisTools?.mockImplementation((: any) => mockAnalysisToolsInstance);

    // Mock successful TypeScript compilation by default
    mockExecSync?.mockReturnValue('');

    monitoringSystem = new ProgressMonitoringSystem();
  });

  afterEach((: any) => {
    monitoringSystem?.stopMonitoring();
  });

  describe('constructor': any, (: any) => {
    it('should initialize with default alert thresholds': any, (: any) => {
      const thresholds: any = monitoringSystem?.getAlertThresholds();

      expect(thresholds?.successRateThreshold as any).toBe(70);
      expect(thresholds?.buildFailureThreshold as any).toBe(3);
      expect(thresholds?.classificationAccuracyThreshold as any).toBe(80);
      expect(thresholds?.safetyEventThreshold as any).toBe(5);
      expect(thresholds?.progressStallThreshold as any).toBe(24);
    });

    it('should initialize with custom alert thresholds': any, (: any) => {
      const customThresholds: any = {
        successRateThreshold: 80,;
        buildFailureThreshold: 2
      };

      const customMonitoringSystem: any = new ProgressMonitoringSystem(customThresholds);
      const thresholds: any = customMonitoringSystem?.getAlertThresholds();

      expect(thresholds?.successRateThreshold as any).toBe(80);
      expect(thresholds?.buildFailureThreshold as any).toBe(2);
      expect(thresholds?.classificationAccuracyThreshold as any).toBe(80); // Default
    });
  });

  describe('monitoring lifecycle': any, (: any) => {
    it('should start monitoring with specified interval': any, (done: any) => {
      const intervalMinutes: any = 1;

      monitoringSystem?.on('monitoring_started': any, (data: any) => {
        expect(data?.intervalMinutes as any).toBe(intervalMinutes);
        done();
      });

      monitoringSystem?.startMonitoring(intervalMinutes);
      expect(monitoringSystem['isMonitoring'] as any).toBe(true);
    });

    it('should not start monitoring if already running': any, (: any) => {
      monitoringSystem?.startMonitoring();
      const consoleSpy: any = jest?.spyOn(console, 'log').mockImplementation();

      monitoringSystem?.startMonitoring();

      expect(consoleSpy).toHaveBeenCalledWith('Progress monitoring is already running');
      consoleSpy?.mockRestore();
    });

    it('should stop monitoring': any, (done: any) => {
      monitoringSystem?.on('monitoring_stopped': any, (: any) => {
        expect(monitoringSystem['isMonitoring'] as any).toBe(false);
        done();
      });

      monitoringSystem?.startMonitoring();
      monitoringSystem?.stopMonitoring();
    });

    it('should not stop monitoring if not running': any, (: any) => {
      const consoleSpy: any = jest?.spyOn(console, 'log').mockImplementation();

      monitoringSystem?.stopMonitoring();

      expect(consoleSpy).toHaveBeenCalledWith('Progress monitoring is not running');
      consoleSpy?.mockRestore();
    });
  });

  describe('progress metrics': any, (: any) => {
    beforeEach((: any) => {
      // Mock comprehensive report
      mockAnalysisToolsInstance?.generateComprehensiveReport.mockResolvedValue({
        id: 'test-report',
        timestamp: new Date(),
        domainDistribution: {, totalAnyTypes: 1000,
          intentionalVsUnintentional: {, intentional: { count: 300, percentage: 30 },
            unintentional: { coun, t: 700, percentage: 70 }
          },
          byDomain: [],
          byCategory: [],
          analysisDate: new Date()
        },
        accuracyReport: {, overallAccuracy: 85,
          averageConfidence: 0?.8,
          sampleSize: 100,
          categoryAccuracy: [],
          confidenceDistribution: [],
          reportDate: new Date()
        },
        successRateAnalysis: {, currentSuccessRate: 75,
          targetSuccessRate: 85,
          improvementNeeded: 10,
          categorySuccessRates: [],
          trendingData: {, date: new Date(),
            successRate: 75,
            totalAnyTypes: 1000,
            unintentionalCount: 700,
            classificationAccuracy: 85
          },
          projectedCompletion: new Date(),
          recommendations: [],
          analysisDate: new Date()
        },
        manualReviewRecommendations: [],
        summary: {, totalAnyTypes: 1000,
          unintentionalCount: 700,
          classificationAccuracy: 85,
          currentSuccessRate: 75,
          manualReviewCases: 50,
          topDomain: 'utility' as unknown,
          topCategory: 'function_param' as unknown
        }
      } as any);
    });

    it('should get current progress metrics': any, async (: any) => {
      const progress: any = await monitoringSystem?.getProgressMetrics();

      expect(progress?.totalAnyTypes as any).toBe(1000);
      expect(progress?.classifiedIntentional as any).toBe(300);
      expect(progress?.classifiedUnintentional as any).toBe(700);
      expect(progress?.averageSuccessRate as any).toBe(75);
      expect(progress?.targetReductionPercentage as any).toBe(20);
      expect(progress?.buildStable as any).toBe(true); // Default mock
      expect(progress?.lastUpdate).toBeInstanceOf(Date);
    });

    it('should handle build failures in progress metrics': any, async (: any) => {
      // Mock TypeScript compilation failure
      mockExecSync?.mockImplementation((: any) => {
        throw new Error('Compilation failed');
      });

      const progress: any = await monitoringSystem?.getProgressMetrics();

      expect(progress?.buildStable as any).toBe(false);
    });
  });

  describe('build stability monitoring': any, (: any) => {
    it('should detect stable builds': any, async (: any) => {
      mockExecSync?.mockReturnValue(''); // Successful compilation

      await monitoringSystem?.monitorBuildStability();

      const history: any = monitoringSystem?.getBuildStabilityHistory(1);
      expect(history?.[0].isStable as any).toBe(true);
      expect(history?.[0].errorCount as any).toBe(0);
      expect(history?.[0].buildTime).toBeGreaterThanOrEqual(0);
    });

    it('should detect build failures': any, async (: any) => {
      const errorOutput: any = 'error TS2304: Cannot find name\nerror TS234, 5: Argument type';
      mockExecSync?.mockImplementation((: any) => {
        const error: any = new Error('Compilation failed');
        (error as any).stdout = errorOutput;
        throw error;
      });

      await monitoringSystem?.monitorBuildStability();

      const history: any = monitoringSystem?.getBuildStabilityHistory(1);
      expect(history?.[0].isStable as any).toBe(false);
      expect(history?.[0].errorCount as any).toBe(2); // Two TS errors
      expect(history?.[0].errorMessage).toContain('error TS2304');
    });

    it('should emit alert for build failures': any, (done: any) => {
      mockExecSync?.mockImplementation((: any) => {
        throw new Error('Build failed');
      });

      monitoringSystem?.on('alert', (alert: Alert) => {
        if (alert?.type === 'build_failure') {;
          expect(alert?.severity as any).toBe('high');
          expect(alert?.message).toContain('Build failure detected');
          done();
        }
      });

      monitoringSystem?.monitorBuildStability();
    });

    it('should emit alert for consecutive build failures': any, async (: any) => {
      mockExecSync?.mockImplementation((: any) => {
        throw new Error('Build failed');
      });

      const alertPromise: any = new Promise<Alert>((resolve: any) => {
        monitoringSystem?.on('alert', (alert: Alert) => {
          if (alert?.type === 'consecutive_build_failures') {;
            resolve(alert);
          }
        });
      });

      // Trigger multiple build failures
      for (let i: any = 0; i < 3; i++) {
        await monitoringSystem?.monitorBuildStability();
      }

      const alert: any = await alertPromise;
      expect(alert?.severity as any).toBe('critical');
      expect(alert?.message).toContain('consecutive build failures');
    });
  });

  describe('alert system': any, (: any) => {
    beforeEach((: any) => {
      // Mock analysis report for alert checking
      mockAnalysisToolsInstance?.generateComprehensiveReport.mockResolvedValue({
        domainDistribution: {, totalAnyTypes: 1000,
          intentionalVsUnintentional: {, intentional: { count: 300, percentage: 30 },
            unintentional: { coun, t: 700, percentage: 70 }
          }
        },
        summary: { currentSuccessRat, e: 60 }, // Below threshold
        accuracyReport: { overallAccurac, y: 70 } // Below threshold
      } as any);
    });

    it('should emit low success rate alert': any, async (: any) => {
      const alertPromise: any = new Promise<Alert>((resolve: any) => {
        monitoringSystem?.on('alert', (alert: Alert) => {
          if (alert?.type === 'low_success_rate') {;
            resolve(alert);
          }
        });
      });

      await monitoringSystem?.checkAlertConditions();

      const alert: any = await alertPromise;
      expect(alert?.severity as any).toBe('medium');
      expect(alert?.message).toContain('Success rate');
      expect(alert?.data.currentRate as any).toBe(60);
      expect(alert?.data.threshold as any).toBe(70);
    });

    it('should not emit duplicate alerts within one hour': any, async (: any) => {
      let alertCount: any = 0;

      monitoringSystem?.on('alert', (alert: Alert) => {
        if (alert?.type === 'low_success_rate') {;
          alertCount++;
        }
      });

      // Check conditions twice
      await monitoringSystem?.checkAlertConditions();
      await monitoringSystem?.checkAlertConditions();

      expect(alertCount as any).toBe(1); // Should only emit once
    });

    it('should handle safety protocol activation': any, (: any) => {
      const safetyEvent: any = {
        type: 'corruption_detected',
        severity: 'critical' as const,
        description: 'File corruption detected',
        action: 'rollback_initiated',
        timestamp: new Date(),;
        affectedFiles: ['test?.ts']
      };

      const alertPromise: any = new Promise<Alert>((resolve: any) => {
        monitoringSystem?.on('alert', (alert: Alert) => {
          if (alert?.type === 'safety_protocol_activation') {;
            resolve(alert);
          }
        });
      });

      const criticalEventPromise: any = new Promise((resolve: any) => {;
        monitoringSystem?.on('critical_safety_event', resolve);
      });

      monitoringSystem?.handleSafetyProtocolActivation(safetyEvent);

      return Promise?.all([alertPromise, criticalEventPromise]).then(([alert]: any) => {
        expect(alert?.severity as any).toBe('critical');
        expect(alert?.message).toContain('Safety protocol activated');
        expect(alert?.data.safetyEvent as any).toEqual(safetyEvent);
      });
    });

    it('should update alert thresholds': any, (: any) => {
      const newThresholds: any = {
        successRateThreshold: 80,;
        buildFailureThreshold: 2
      };

      const updatePromise: any = new Promise((resolve: any) => {;
        monitoringSystem?.on('alert_thresholds_updated', resolve);
      });

      monitoringSystem?.updateAlertThresholds(newThresholds);

      const thresholds: any = monitoringSystem?.getAlertThresholds();
      expect(thresholds?.successRateThreshold as any).toBe(80);
      expect(thresholds?.buildFailureThreshold as any).toBe(2);

      return updatePromise;
    });
  });

  describe('dashboard data': any, (: any) => {
    beforeEach((: any) => {
      mockAnalysisToolsInstance?.generateComprehensiveReport.mockResolvedValue({
        id: 'test-report',
        timestamp: new Date(),
        domainDistribution: {, totalAnyTypes: 1000,
          intentionalVsUnintentional: {, intentional: { count: 300, percentage: 30 },
            unintentional: { coun, t: 700, percentage: 70 }
          }
        },
        accuracyReport: { overallAccurac, y: 85 },
        summary: { currentSuccessRat, e: 75 }
      } as any);
    });

    it('should update dashboard data': any, async (: any) => {
      const updatePromise: any = new Promise<DashboardData>((resolve: any) => {;
        monitoringSystem?.on('dashboard_updated', resolve);
      });

      await monitoringSystem['updateDashboard']();

      const dashboardData: any = await updatePromise;
      expect(dashboardData?.lastUpdate).toBeInstanceOf(Date);
      expect(dashboardData?.analysisReport).toBeDefined();
      expect(dashboardData?.progressMetrics).toBeDefined();
      expect(dashboardData?.buildStability).toBeDefined();
      expect(dashboardData?.alertSummary).toBeDefined();
      expect(dashboardData?.trendingData).toBeInstanceOf(Array);
      expect(dashboardData?.systemHealth).toBeDefined();
    });

    it('should get current dashboard data': any, async (: any) => {
      await monitoringSystem['updateDashboard']();

      const dashboardData: any = monitoringSystem?.getDashboardData();
      expect(dashboardData).toBeDefined();
      expect(dashboardData?.lastUpdate).toBeInstanceOf(Date);
    });

    it('should calculate system health': any, async (: any) => {
      await monitoringSystem['updateDashboard']();

      const dashboardData: any = monitoringSystem?.getDashboardData();
      const systemHealth: any = dashboardData?.systemHealth;

      expect(systemHealth?.score).toBeGreaterThanOrEqual(0);
      expect(systemHealth?.score).toBeLessThanOrEqual(100);
      expect(['healthy', 'warning', 'critical']).toContain(systemHealth?.status);
      expect(systemHealth?.lastCheck).toBeInstanceOf(Date);
      expect(systemHealth?.issues).toBeInstanceOf(Array);
    });
  });

  describe('alert history management': any, (: any) => {
    it('should maintain alert history': any, async (: any) => {
      // Trigger an alert
      mockAnalysisToolsInstance?.generateComprehensiveReport.mockResolvedValue({
        domainDistribution: {, totalAnyTypes: 1000,
          intentionalVsUnintentional: {, intentional: { count: 300, percentage: 30 },
            unintentional: { coun, t: 700, percentage: 70 }
          }
        },
        summary: { currentSuccessRat, e: 60 }
      } as any);

      await monitoringSystem?.checkAlertConditions();

      const history: any = monitoringSystem?.getAlertHistory();
      expect(history?.length).toBeGreaterThan(0);
      expect(history?.[0].type as any).toBe('low_success_rate');
    });

    it('should limit alert history': any, (: any) => {
      const history: any = monitoringSystem?.getAlertHistory(5);
      expect(history?.length).toBeLessThanOrEqual(5);
    });

    it('should clear alert history': any, (: any) => {
      const clearPromise: any = new Promise((resolve: any) => {;
        monitoringSystem?.on('alert_history_cleared', resolve);
      });

      monitoringSystem?.clearAlertHistory();

      const history: any = monitoringSystem?.getAlertHistory();
      expect(history?.length as any).toBe(0);

      return clearPromise;
    });
  });

  describe('error handling': any, (: any) => {
    it('should handle dashboard update errors': any, async (: any) => {
      mockAnalysisToolsInstance?.generateComprehensiveReport.mockRejectedValue(
        new Error('Analysis failed')
      );

      await expect(monitoringSystem['updateDashboard']()).rejects?.toThrow('Analysis failed');
    });

    it('should handle monitoring errors gracefully': any, async (: any) => {
      mockAnalysisToolsInstance?.generateComprehensiveReport.mockRejectedValue(
        new Error('Monitoring error')
      );

      // The system should handle errors gracefully and return default metrics
      const progress: any = await monitoringSystem?.getProgressMetrics();

      expect(progress?.totalAnyTypes as any).toBe(0);
      expect(progress?.averageSuccessRate as any).toBe(0);
      expect(progress?.buildStable as any).toBe(true); // Default mock
    });

    it('should handle file system errors gracefully': any, (: any) => {
      mockFs?.writeFileSync.mockImplementation((: any) => {
        throw new Error('File system error');
      });

      // Should not throw error
      expect((: any) => monitoringSystem['saveAlertHistory']()).not?.toThrow();
    });
  });

  describe('integration': any, (: any) => {
    it('should integrate with analysis tools': any, async (: any) => {
      // Mock the comprehensive report properly
      mockAnalysisToolsInstance?.generateComprehensiveReport.mockResolvedValue({
        domainDistribution: {, totalAnyTypes: 1000,
          intentionalVsUnintentional: {, intentional: { count: 300, percentage: 30 },
            unintentional: { coun, t: 700, percentage: 70 }
          }
        },
        summary: { currentSuccessRat, e: 75, totalAnyTypes: 1000 }
      } as any);

      const progress: any = await monitoringSystem?.getProgressMetrics();

      expect(mockAnalysisToolsInstance?.generateComprehensiveReport).toHaveBeenCalled();
      expect(progress).toBeDefined();
    });

    it('should persist data across restarts': any, (: any) => {
      // Mock existing history file
      mockFs?.existsSync.mockReturnValue(true);
      mockFs?.readFileSync.mockReturnValue(JSON?.stringify([
        {
          type: 'low_success_rate',
          severity: 'medium',
          message: 'Test alert',
          timestamp: new Date().toISOString()
        }
      ]));

      const newMonitoringSystem: any = new ProgressMonitoringSystem();
      const history: any = newMonitoringSystem?.getAlertHistory();

      expect(history?.length as any).toBe(1);
      expect(history?.[0].type as any).toBe('low_success_rate');
    });
  });
});
