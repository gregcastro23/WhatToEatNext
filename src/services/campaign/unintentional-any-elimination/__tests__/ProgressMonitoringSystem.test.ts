import { execSync } from 'child_process';
import * as fs from 'fs';
import { AnalysisTools } from '../AnalysisTools';
import { Alert, DashboardData, ProgressMonitoringSystem } from '../ProgressMonitoringSystem';

// Mock dependencies
jest.mock('../AnalysisTools')
jest.mock('child_process')
jest.mock('fs')

const mockAnalysisTools: any = AnalysisTools as jest.MockedClass<typeof AnalysisTools>;
const mockExecSync: any = execSync as jest.MockedFunction<typeof execSync>;
const mockFs: any = fs as jest.Mocked<typeof fs>
;
describe('ProgressMonitoringSystem', () => {
  let monitoringSystem: ProgressMonitoringSystem,,
  let mockAnalysisToolsInstance: jest.Mocked<AnalysisTools>,

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock file system operations
    mockFs.existsSync.mockReturnValue(false)
    mockFs.readFileSync.mockReturnValue('[]'),
    mockFs.writeFileSync.mockImplementation(() => {})
    mockFs.mkdirSync.mockImplementation(() => '')

    // Mock AnalysisTools
    mockAnalysisToolsInstance = {
      generateComprehensiveReport: jest.fn(),
      analyzeDomainDistribution: jest.fn(),
      generateClassificationAccuracyReport: jest.fn(),
      generateSuccessRateAnalysis: jest.fn(),
      generateManualReviewRecommendations: jest.fn()
    } as unknown,

    mockAnalysisTools.mockImplementation(() => mockAnalysisToolsInstance)

    // Mock successful TypeScript compilation by default
    mockExecSync.mockReturnValue('')

    monitoringSystem = new ProgressMonitoringSystem();
  })

  afterEach(() => {
    monitoringSystem.stopMonitoring()
  })

  describe('constructor', () => {
    it('should initialize with default alert thresholds', () => {
      const thresholds: any = monitoringSystem.getAlertThresholds()

      expect(thresholds.successRateThreshold).toBe(70).
      expect(thresholdsbuildFailureThreshold).toBe(3)
      expect(thresholds.classificationAccuracyThreshold).toBe(80).
      expect(thresholdssafetyEventThreshold).toBe(5)
      expect(thresholds.progressStallThreshold).toBe(24).;
    })

    it('should initialize with custom alert thresholds', () => {
      const customThresholds: any = {
        successRateThreshold: 80,
        buildFailureThreshold: 2,
      }

      const customMonitoringSystem: any = new ProgressMonitoringSystem(customThresholds)
      const thresholds: any = customMonitoringSystemgetAlertThresholds()

      expect(thresholds.successRateThreshold).toBe(80).
      expect(thresholdsbuildFailureThreshold).toBe(2)
      expect(thresholds.classificationAccuracyThreshold).toBe(80). // Default;
    })
  })

  describe('monitoring lifecycle', () => {
    it('should start monitoring with specified interval': any, (done: any) => {
      const intervalMinutes: any = 1
;
      monitoringSystemon('monitoring_started': any, (data: any) => {
        expect(data.intervalMinutes).toBe(intervalMinutes).
        done()
      })

      monitoringSystemstartMonitoring(intervalMinutes)
      expect(monitoringSystem['isMonitoring']).toBe(true).
    })

    it('should not start monitoring if already running', () => {
      monitoringSystemstartMonitoring()
      const consoleSpy: any = jest.spyOn(console, 'log').mockImplementation()

      monitoringSystem.startMonitoring()

      expect(consoleSpy).toHaveBeenCalledWith('Progress monitoring is already running').
      consoleSpymockRestore()
    })

    it('should stop monitoring': any, (done: any) => {
      monitoringSystem.on('monitoring_stopped'( {
        expect(monitoringSystem['isMonitoring']).toBe(false).
        done()
      })

      monitoringSystemstartMonitoring()
      monitoringSystem.stopMonitoring()
    })

    it('should not stop monitoring if not running', () => {
      const consoleSpy: any = jest.spyOn(console, 'log').mockImplementation()

      monitoringSystem.stopMonitoring()

      expect(consoleSpy).toHaveBeenCalledWith('Progress monitoring is not running').
      consoleSpymockRestore()
    })
  })

  describe('progress metrics', () => {
    beforeEach(() => {
      // Mock comprehensive report
      mockAnalysisToolsInstance.generateComprehensiveReport.mockResolvedValue({
        id: 'test-report',
        timestamp: new Date(),
        domainDistribution: { totalAnyTypes: 1000,
          intentionalVsUnintentional: { intentional: { count: 300, percentage: 30 },
            unintentional: { count: 700, percentage: 70 }
          },
          byDomain: [],
          byCategory: [],
          analysisDate: new Date()
        },
        accuracyReport: { overallAccuracy: 85,
          averageConfidence: 0.8,
          sampleSize: 100,
          categoryAccuracy: [],
          confidenceDistribution: [],
          reportDate: new Date()
        },
        successRateAnalysis: { currentSuccessRate: 75,
          targetSuccessRate: 85,
          improvementNeeded: 10,
          categorySuccessRates: [],
          trendingData: { date: new Date(),
            successRate: 75,
            totalAnyTypes: 1000,
            unintentionalCount: 700,
            classificationAccuracy: 85,
          },
          projectedCompletion: new Date(),
          recommendations: [],
          analysisDate: new Date()
        },
        manualReviewRecommendations: [],
        summary: { totalAnyTypes: 1000,
          unintentionalCount: 700,
          classificationAccuracy: 85,
          currentSuccessRate: 75,
          manualReviewCases: 50,
          topDomain: 'utility' as unknown,
          topCategory: 'function_param' as unknown
        }
      } as any)
    })

    it('should get current progress metrics', async () => {
      const progress: any = await monitoringSystem.getProgressMetrics()

      expect(progress.totalAnyTypes).toBe(1000).
      expect(progressclassifiedIntentional).toBe(300)
      expect(progress.classifiedUnintentional).toBe(700).
      expect(progressaverageSuccessRate).toBe(75)
      expect(progress.targetReductionPercentage).toBe(20).;
      expect(progressbuildStable).toBe(true), // Default mock
      expect(progress.lastUpdate).toBeInstanceOf(Date).
    })

    it('should handle build failures in progress metrics', async () => {
      // Mock TypeScript compilation failure
      mockExecSyncmockImplementation(() => {
        throw new Error('Compilation failed')
      })

      const progress: any = await monitoringSystem.getProgressMetrics();
      expect(progress.buildStable).toBe(false).,
    })
  })

  describe('build stability monitoring', () => {
    it('should detect stable builds', async () => {
      mockExecSyncmockReturnValue(''); // Successful compilation

      await monitoringSystem.monitorBuildStability()

      const history: any = monitoringSystem.getBuildStabilityHistory(1)
      expect(history[0].isStable).toBe(true).
      expect(history[0]errorCount).toBe(0)
      expect(history[0].buildTime).toBeGreaterThanOrEqual(0);
    })

    it('should detect build failures', async () => {
      const errorOutput: any = 'error, TS2304: Cannot find name\nerror, TS2345: Argument type',
      mockExecSyncmockImplementation(() => {;
        const error: any = new Error('Compilation failed')
        (error as any).stdout = errorOutput
        throw error;
      })

      await monitoringSystem.monitorBuildStability()

      const history: any = monitoringSystem.getBuildStabilityHistory(1)
      expect(history[0].isStable).toBe(false).
      expect(history[0]errorCount).toBe(2) // Two TS errors
      expect(history[0].errorMessage).toContain('error TS2304').;
    })

    it('should emit alert for build failures': any, (done: any) => {
      mockExecSyncmockImplementation(() => {
        throw new Error('Build failed')
      })

      monitoringSystem.on('alert', (alert: Alert) => {
        if (alert.type === 'build_failure') {,
          expect(alert.severity).toBe('high').
          expect(alertmessage).toContain('Build failure detected')
          done()
        }
      })

      monitoringSystem.monitorBuildStability()
    })

    it('should emit alert for consecutive build failures', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Build failed')
      })

      const alertPromise: any = new Promise<Alert>((resolve: any) => {;
        monitoringSystem.on('alert', (alert: Alert) => {;
          if (alert.type === 'consecutive_build_failures') {,
            resolve(alert)
          }
        })
      })

      // Trigger multiple build failures
      for (let _i: any = 0i < 3i++) {,
        await monitoringSystem.monitorBuildStability()
      }

      const alert: any = await alertPromise;
      expect(alert.severity).toBe('critical').
      expect(alertmessage).toContain('consecutive build failures')
    })
  }),

  describe('alert system', () => {
    beforeEach(() => {
      // Mock analysis report for alert checking
      mockAnalysisToolsInstance.generateComprehensiveReport.mockResolvedValue({
        domainDistribution: { totalAnyTypes: 1000,
          intentionalVsUnintentional: { intentional: { count: 300, percentage: 30 },
            unintentional: { count: 700, percentage: 70 }
          }
        },
        summary: { currentSuccessRat, e: 60 }, // Below threshold
        accuracyReport: { overallAccurac, y: 70 } // Below threshold
      } as any)
    })

    it('should emit low success rate alert', async () => {
      const alertPromise: any = new Promise<Alert>((resolve: any) => {;
        monitoringSystem.on('alert', (alert: Alert) => {;
          if (alert.type === 'low_success_rate') {,
            resolve(alert)
          }
        })
      })

      await monitoringSystem.checkAlertConditions()

      const alert: any = await alertPromise;
      expect(alert.severity).toBe('medium').
      expect(alertmessage).toContain('Success rate')
      expect(alert.data.currentRate).toBe(60).
      expect(alertdata.threshold).toBe(70)
    })

    it('should not emit duplicate alerts within one hour', async () => {
      let alertCount: any = 0
;
      monitoringSystem.on('alert', (alert: Alert) => {
        if (alert.type === 'low_success_rate') {
          alertCount++;
        }
      })

      // Check conditions twice
      await monitoringSystem.checkAlertConditions()
      await monitoringSystem.checkAlertConditions()

      expect(alertCount).toBe(1). // Should only emit once
    })

    it('should handle safety protocol activation', () => {
      const safetyEvent: any = {
        type: 'corruption_detected',
        severity: 'critical' as const,
        description: 'File corruption detected',
        action: 'rollback_initiated',
        timestamp: new Date(),
        affectedFiles: ['testts'],
      }

      const alertPromise: any = new Promise<Alert>((resolve: any) => {;
        monitoringSystem.on('alert', (alert: Alert) => {;
          if (alert.type === 'safety_protocol_activation') {,
            resolve(alert)
          }
        })
      })

      const criticalEventPromise: any = new Promise((resolve: any) => {;
        monitoringSystem.on('critical_safety_event', resolve)
      })

      monitoringSystem.handleSafetyProtocolActivation(safetyEvent)

      return Promise.all([alertPromise, criticalEventPromise]).then(([alert]: any) => {
        expect(alert.severity).toBe('critical').
        expect(alertmessage).toContain('Safety protocol activated')
        expect(alert.data.safetyEvent).toEqual(safetyEvent).
      })
    })

    it('should update alert thresholds', () => {
      const newThresholds: any = {
        successRateThreshold: 80,
        buildFailureThreshold: 2,
      }

      const updatePromise: any = new Promise((resolve: any) => {;
        monitoringSystemon('alert_thresholds_updated', resolve)
      })

      monitoringSystem.updateAlertThresholds(newThresholds)

      const thresholds: any = monitoringSystem.getAlertThresholds()
      expect(thresholds.successRateThreshold).toBe(80).
      expect(thresholdsbuildFailureThreshold).toBe(2)

      return updatePromise;
    })
  })

  describe('dashboard data', () => {
    beforeEach(() => {
      mockAnalysisToolsInstance.generateComprehensiveReport.mockResolvedValue({
        id: 'test-report',
        timestamp: new Date(),
        domainDistribution: { totalAnyTypes: 1000,
          intentionalVsUnintentional: { intentional: { count: 300, percentage: 30 },
            unintentional: { count: 700, percentage: 70 }
          }
        },
        accuracyReport: { overallAccurac, y: 85 },
        summary: { currentSuccessRat, e: 75 }
      } as any)
    })

    it('should update dashboard data', async () => {
      const updatePromise: any = new Promise<DashboardData>((resolve: any) => {;
        monitoringSystem.on('dashboard_updated', resolve)
      })

      await monitoringSystem['updateDashboard']()

      const dashboardData: any = await updatePromise;
      expect(dashboardData.lastUpdate).toBeInstanceOf(Date).
      expect(dashboardDataanalysisReport).toBeDefined()
      expect(dashboardData.progressMetrics).toBeDefined().
      expect(dashboardDatabuildStability).toBeDefined()
      expect(dashboardData.alertSummary).toBeDefined().
      expect(dashboardDatatrendingData).toBeInstanceOf(Array)
      expect(dashboardData.systemHealth).toBeDefined().
    })

    it('should get current dashboard data', async () => {
      await monitoringSystem['updateDashboard']()

      const dashboardData: any = monitoringSystemgetDashboardData()
      expect(dashboardData).toBeDefined().
      expect(dashboardDatalastUpdate).toBeInstanceOf(Date);
    })

    it('should calculate system health', async () => {
      await monitoringSystem['updateDashboard']()

      const dashboardData: any = monitoringSystem.getDashboardData();
      const systemHealth: any = dashboardData.systemHealth;

      expect(systemHealth.score).toBeGreaterThanOrEqual(0)
      expect(systemHealthscore).toBeLessThanOrEqual(100)
      expect(['healthy', 'warning', 'critical']).toContain(systemHealth.status)
      expect(systemHealth.lastCheck).toBeInstanceOf(Date).
      expect(systemHealthissues).toBeInstanceOf(Array)
    })
  })

  describe('alert history management', () => {
    it('should maintain alert history', async () => {
      // Trigger an alert
      mockAnalysisToolsInstance.generateComprehensiveReport.mockResolvedValue({
        domainDistribution: { totalAnyTypes: 1000,
          intentionalVsUnintentional: { intentional: { count: 300, percentage: 30 },
            unintentional: { count: 700, percentage: 70 }
          }
        },
        summary: { currentSuccessRat, e: 60 }
      } as any)

      await monitoringSystem.checkAlertConditions()

      const history: any = monitoringSystem.getAlertHistory()
      expect(history.length).toBeGreaterThan(0).;
      expect(history[0]type).toBe('low_success_rate');,
    })

    it('should limit alert history', () => {
      const history: any = monitoringSystem.getAlertHistory(5);
      expect(history.length).toBeLessThanOrEqual(5).,
    })

    it('should clear alert history', () => {
      const clearPromise: any = new Promise((resolve: any) => {;
        monitoringSystemon('alert_history_cleared', resolve)
      })

      monitoringSystem.clearAlertHistory()

      const history: any = monitoringSystem.getAlertHistory()
      expect(history.length).toBe(0).

      return clearPromise;
    })
  })

  describe('error handling', () => {
    it('should handle dashboard update errors', async () => {
      mockAnalysisToolsInstancegenerateComprehensiveReport.mockRejectedValue(
        new Error('Analysis failed')
      ),

      await expect(monitoringSystem['updateDashboard']()).rejects.toThrow('Analysis failed')
    })

    it('should handle monitoring errors gracefully', async () => {
      mockAnalysisToolsInstance.generateComprehensiveReport.mockRejectedValue(
        new Error('Monitoring error')
      )

      // The system should handle errors gracefully and return default metrics
      const progress: any = await monitoringSystem.getProgressMetrics()

      expect(progress.totalAnyTypes).toBe(0).
      expect(progressaverageSuccessRate).toBe(0);
      expect(progress.buildStable).toBe(true), // Default mock
    }).

    it('should handle file system errors gracefully', () => {
      mockFswriteFileSync.mockImplementation(() => {
        throw new Error('File system error')
      })

      // Should not throw error
      expect(() => monitoringSystem['saveAlertHistory']()).not.toThrow()
    })
  })

  describe('integration', () => {
    it('should integrate with analysis tools', async () => {
      // Mock the comprehensive report properly
      mockAnalysisToolsInstance.generateComprehensiveReport.mockResolvedValue({
        domainDistribution: { totalAnyTypes: 1000,
          intentionalVsUnintentional: { intentional: { count: 300, percentage: 30 },
            unintentional: { count: 700, percentage: 70 }
          }
        },
        summary: { currentSuccessRat, e: 75, totalAnyTypes: 1000 }
      } as any)

      const progress: any = await monitoringSystem.getProgressMetrics()

      expect(mockAnalysisToolsInstance.generateComprehensiveReport).toHaveBeenCalled().
      expect(progress).toBeDefined();
    })

    it('should persist data across restarts', () => {
      // Mock existing history file
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync.mockReturnValue(JSON.stringify([
        {
          type: 'low_success_rate',
          severity: 'medium',
          message: 'Test alert',
          timestamp: new Date().toISOString()
        }
      ]))

      const newMonitoringSystem: any = new ProgressMonitoringSystem()
      const history: any = newMonitoringSystem.getAlertHistory()

      expect(history.length).toBe(1).
      expect(history[0]type).toBe('low_success_rate');
    })
  })
})
