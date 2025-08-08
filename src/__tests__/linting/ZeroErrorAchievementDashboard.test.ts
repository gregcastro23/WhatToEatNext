/**
 * Zero-Error Achievement Dashboard Tests
 *
 * Comprehensive test suite for the zero-error monitoring and
 * achievement tracking system.
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';

import { LintingMetrics } from '../../services/linting/LintingValidationDashboard';
import { ZeroErrorAchievementDashboard } from '../../services/linting/ZeroErrorAchievementDashboard';

// Mock external dependencies
void jest.mock('child_process');
void jest.mock('fs');

const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;
const mockWriteFileSync = writeFileSync as jest.MockedFunction<typeof writeFileSync>;
const mockReadFileSync = readFileSync as jest.MockedFunction<typeof readFileSync>;
const mockExistsSync = existsSync as jest.MockedFunction<typeof existsSync>;
const mockMkdirSync = mkdirSync as jest.MockedFunction<typeof mkdirSync>;

describe('ZeroErrorAchievementDashboard', () => {
  let dashboard: ZeroErrorAchievementDashboard;
  let mockMetrics: LintingMetrics;

  beforeEach(() => {
    void jest.clearAllMocks()

    // Mock file system operations
    void mockExistsSync.mockReturnValue(true);
    void mockReadFileSync.mockReturnValue('[]');
    void mockWriteFileSync.mockImplementation(() => {});
    void mockMkdirSync.mockImplementation(() => '');

    // Mock successful command execution
    void mockExecSync.mockReturnValue('');

    // Create mock metrics
    mockMetrics = {
  timestamp: new Date(),
      totalIssues: 1500,
      errors: 50,
      warnings: 1450,
      parserErrors: 0,
      explicitAnyErrors: 150,
      importOrderIssues: 200,
      unusedVariables: 300,
      reactHooksIssues: 100,
      consoleStatements: 50,
      domainSpecificIssues: {
  astrologicalCalculations: 25,
        campaignSystem: 15,
        testFiles: 10
      },
      performanceMetrics: {
  lintingDuration: 25000,
        cacheHitRate: 0.75,
        memoryUsage: 256,
        filesProcessed: 500
      },
      qualityScore: 85,
      regressionDetected: false
    };

    dashboard = new ZeroErrorAchievementDashboard()
  });

  afterEach(() => {
    void jest.restoreAllMocks()
  });

  describe('Dashboard Generation', () => {
    test('should generate comprehensive dashboard successfully', async () => {
      // Mock validation dashboard result
      const mockValidationResult = {
  passed: true,
        metrics: mockMetrics,
        alerts: [],
        recommendations: ['Continue systematic improvement'],
        regressionAnalysis: {
  detected: false,
          affectedMetrics: [],
          severity: 'minor' as const,
          recommendations: [],
          historicalComparison: {
  current: 1500,
            previous: 1600,
            change: -100,
            changePercentage: -6.25
          }
        }
      };

      // Mock the validation dashboard
      void jest.spyOn(dashboard['validationDashboard'], 'runComprehensiveValidation')
        .mockResolvedValue(mockValidationResult);

      void dashboard.generateDashboard()

      // Verify dashboard report was generated
      expect(mockWriteFileSync).toHaveBeenCalledWith(
        expect.stringContaining('zero-error-achievement-dashboard.md'),
        expect.stringContaining('# 🎯 Zero-Error Achievement Dashboard'),
        'utf8'
      );

      // Verify JSON data was generated
      expect(mockWriteFileSync).toHaveBeenCalledWith(
        expect.stringContaining('zero-error-achievement-dashboard.json'),
        expect.stringContaining('"timestamp"'),
        undefined
      );
    });

    test('should handle dashboard generation errors gracefully', async () => {
      // Mock validation dashboard failure
      void jest.spyOn(dashboard['validationDashboard'], 'runComprehensiveValidation')
        .mockRejectedValue(new Error('Validation failed'));

      await expect(dashboard.generateDashboard()).rejects.toThrow('Validation failed');
    });

    test('should generate targets with correct progress calculations', async () => {
      const mockValidationResult = {
  passed: true,
        metrics: mockMetrics,
        alerts: [],
        recommendations: [],
        regressionAnalysis: {
  detected: false,
          affectedMetrics: [],
          severity: 'minor' as const,
          recommendations: [],
          historicalComparison: {
  current: 1500,
            previous: 1600,
            change: -100,
            changePercentage: -6.25
          }
        }
      };

      void jest.spyOn(dashboard['validationDashboard'], 'runComprehensiveValidation')
        .mockResolvedValue(mockValidationResult);

      void dashboard.generateDashboard()

      // Verify targets file was written
      const targetsCall = (mockWriteFileSync as jest.Mock).mock.calls.find(call =>
        call[0].includes('zero-error-targets.json')
      );

      expect(targetsCall).toBeDefined()

      const targetsData = JSON.parse(targetsCall[1]);
      expect(targetsData).toBeInstanceOf(Array);
      expect(targetsData.length).toBeGreaterThan(0);

      // Check parser errors target
      const parserErrorsTarget = targetsData.find(t => t.metric === 'parserErrors');
      expect(parserErrorsTarget).toBeDefined()
      expect(parserErrorsTarget.currentValue).toBe(0);
      expect(parserErrorsTarget.targetValue).toBe(0);
      expect(parserErrorsTarget.progress).toBe(100); // Already achieved
      expect(parserErrorsTarget.priority).toBe('critical');
    });
  });

  describe('Real-Time Monitoring', () => {
    test('should detect significant changes in metrics', async () => {
      const previousMetrics = { ...mockMetrics, totalIssues: 1000 };
      const currentMetrics = { ...mockMetrics, totalIssues: 1500 };

      const changes = dashboard['detectSignificantChanges'](previousMetrics, currentMetrics);

      expect(changes).toContain(expect.stringContaining('Total Issues increased'));
      expect(changes[0]).toMatch(/50\.0%/); // 50% increase
    }, 5000); // 5 second timeout

    test('should identify critical issues correctly', () => {
      const criticalMetrics = {
        ...mockMetrics,
        parserErrors: 5,
        explicitAnyErrors: 250,
        qualityScore: 45,
        performanceMetrics: {
          ...mockMetrics.performanceMetrics,
          lintingDuration: 75000
        }
      };

      const criticalIssues = dashboard['identifyCriticalIssues'](criticalMetrics);

      expect(criticalIssues).toContain(expect.stringContaining('5 parser errors'));
      expect(criticalIssues).toContain(expect.stringContaining('250 explicit any errors'));
      expect(criticalIssues).toContain(expect.stringContaining('Quality score 45'));
      expect(criticalIssues).toContain(expect.stringContaining('75000ms'));
    }, 3000); // 3 second timeout

    test('should handle real-time monitoring updates efficiently', async () => {
      const startTime = Date.now();

      // Simulate rapid metric updates
      for (let i = 0; i < 10; i++) {
        const updatedMetrics = { ...mockMetrics, totalIssues: 1000 + i * 10 };
        dashboard['detectSignificantChanges'](mockMetrics, updatedMetrics);
      }

      const duration = Date.now() - startTime;

      // Should handle updates quickly
      expect(duration).toBeLessThan(1000); // Under 1 second
    }, 5000); // 5 second timeout

    test('should validate monitoring consistency', async () => {
      const testMetrics = { ...mockMetrics, totalIssues: 500 };

      // Run the same detection multiple times
      const results: number[] = [];
      for (let i = 0; i < 5; i++) {
        const changes = dashboard['detectSignificantChanges'](mockMetrics, testMetrics);
        void results.push(changes.length);
      }

      // Results should be consistent
      const allSame = results.every(count => count === results[0]);
      expect(allSame).toBe(true);
    }, 3000); // 3 second timeout

    test('should update real-time status correctly', async () => {
      dashboard['updateRealTimeStatus'](mockMetrics);

      const statusCall = (mockWriteFileSync as jest.Mock).mock.calls.find(
        call => call[0].includes('zero-error-achievement-status.json')
      );

      expect(statusCall).toBeDefined();

      const statusData = JSON.parse(statusCall[1]);
      expect(statusData.qualityScore).toBe(85);
      expect(statusData.totalIssues).toBe(1500);
      expect(statusData.parserErrors).toBe(0);
      expect(statusData.status).toBe('good'); // Quality score 85 = good
    });
  });

  describe('Trend Analysis', () => {
    test('should calculate trends correctly with sufficient data', async () => {
      // Mock metrics history with trend data
      const historyData = [
        { ...mockMetrics, totalIssues: 2000, timestamp: new Date('2025-01-01') },
        { ...mockMetrics, totalIssues: 1800, timestamp: new Date('2025-01-02') },
        { ...mockMetrics, totalIssues: 1600, timestamp: new Date('2025-01-03') },
        { ...mockMetrics, totalIssues: 1500, timestamp: new Date('2025-01-04') }
      ];

      void mockReadFileSync.mockReturnValueOnce(JSON.stringify(historyData));

      const trends = dashboard['analyzeTrends'](mockMetrics);

      expect(trends).toBeInstanceOf(Array);
      expect(trends.length).toBeGreaterThan(0);

      const totalIssuesTrend = trends.find(t => t.metric === 'totalIssues');
      expect(totalIssuesTrend).toBeDefined();
      if (totalIssuesTrend) {
        expect(totalIssuesTrend.trend).toBe('improving'); // Decreasing issues = improving
        expect(totalIssuesTrend.velocity).toBeLessThan(0); // Negative velocity = decreasing
      }
    });

    test('should handle insufficient data for trend analysis', async () => {
      // Mock insufficient history data
      const historyData = [mockMetrics];
      void mockReadFileSync.mockReturnValueOnce(JSON.stringify(historyData));

      const trends = dashboard['analyzeTrends'](mockMetrics);

      expect(trends).toEqual([]); // No trends with insufficient data
    });

    test('should project future values correctly', () => {
      const velocity = -10; // Improving by 10 issues per day
      const currentValue = 1500;

      const projection = dashboard['projectFuture'](velocity, currentValue);

      expect(projection.sevenDays).toBe(1430); // 1500 - (10 * 7);
    expect(projection.thirtyDays).toBe(1200); // 1500 - (10 * 30);
    expect(projection.ninetyDays).toBe(600); // 1500 - (10 * 90)
    });
  });

  describe('Quality Gates', () => {
    test('should evaluate quality gates correctly', async () => {
      const gates = dashboard['checkQualityGates'](mockMetrics);

      expect(gates).toBeInstanceOf(Array);
      expect(gates.length).toBeGreaterThan(0);

      // Check parser errors gate (should pass with 0 errors)
      const parserGate = gates.find(g => g.name === 'parser-errors');
      expect(parserGate).toBeDefined();
      if (parserGate) {
        expect(parserGate.status).toBe('passing');
      }

      // Check explicit any gate (should warn with 150 errors)
      const anyGate = gates.find(g => g.name === 'explicit-any');
      expect(anyGate).toBeDefined();
      if (anyGate) {
        expect(anyGate.status).toBe('warning'); // 150 > 100 but <= 150
      }

      // Check quality score gate (should pass with 85)
      const qualityGate = gates.find(g => g.id === 'quality-score-minimum');
      expect(qualityGate).toBeDefined();
      if (qualityGate) {
        expect(qualityGate.status).toBe('passing'); // 85 >= 80
      }
    });

    test('should identify failing quality gates', async () => {
      const failingMetrics = {
        ...mockMetrics,
        parserErrors: 3,
        explicitAnyErrors: 200,
        qualityScore: 65
      };

      const gates = dashboard['checkQualityGates'](failingMetrics);

      const parserGate = gates.find(g => g.name === 'parser-errors');
      if (parserGate) {
        expect(parserGate.status).toBe('failing');
      }

      const anyGate = gates.find(g => g.name === 'explicit-any');
      if (anyGate) {
        expect(anyGate.status).toBe('failing'); // 200 > 150
      }

      const qualityGate = gates.find(g => g.id === 'quality-score-minimum');
      if (qualityGate) {
        expect(qualityGate.status).toBe('warning'); // 65 < 80 but >= 70
      }
    });
  });

  describe('Target Management', () => {
    test('should calculate progress correctly for different metric types', () => {
      // Quality score progress (higher is better)
      const qualityProgress = dashboard['calculateProgress'](85, 95, 'qualityScore');
      expect(qualityProgress).toBeCloseTo(89.47, 1); // (85/95) * 100

      // Error count progress (lower is better)
      const errorProgress = dashboard['calculateProgress'](150, 0, 'explicitAnyErrors');
      expect(errorProgress).toBeGreaterThan(0);
      expect(errorProgress).toBeLessThan(100);
    });

    test('should estimate completion dates based on progress', () => {
      const deadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      const completion = dashboard['estimateCompletion'](150, 0, deadline);

      expect(completion).toBeInstanceOf(Date);
      expect(completion.getTime()).toBeGreaterThan(Date.now());
      expect(completion.getTime()).toBeLessThanOrEqual(deadline.getTime());
    });

    test('should update targets with current metrics', async () => {
      const mockValidationResult = {
  passed: true,
        metrics: mockMetrics,
        alerts: [],
        recommendations: [],
        regressionAnalysis: {
  detected: false,
          affectedMetrics: [],
          severity: 'minor' as const,
          recommendations: [],
          historicalComparison: {
  current: 1500,
            previous: 1600,
            change: -100,
            changePercentage: -6.25
          }
        }
      };

      void jest.spyOn(dashboard['validationDashboard'], 'runComprehensiveValidation')
        .mockResolvedValue(mockValidationResult);

      const targets = dashboard['updateTargets'](mockMetrics);

      expect(targets).toBeInstanceOf(Array);
      expect(targets.length).toBeGreaterThan(0);

      // Verify all targets have required properties
      for (const target of targets) {
        expect(target).toHaveProperty('metric');
        expect(target).toHaveProperty('currentValue');
        expect(target).toHaveProperty('targetValue');
        expect(target).toHaveProperty('progress');
        expect(target).toHaveProperty('priority');
        expect(target).toHaveProperty('strategy');
        expect(target.progress).toBeGreaterThanOrEqual(0);
        expect(target.progress).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('Maintenance Procedures', () => {
    test('should initialize maintenance procedures correctly', () => {
      const procedures = dashboard['maintenanceProcedures'];

      expect(procedures.size).toBeGreaterThan(0);
      expect(procedures.has('daily-health-check')).toBe(true);
      expect(procedures.has('weekly-cache-optimization')).toBe(true);
      expect(procedures.has('monthly-metrics-cleanup')).toBe(true);

      const dailyCheck = procedures.get('daily-health-check');
      expect(dailyCheck).toBeDefined();
      if (dailyCheck) {
        expect(dailyCheck.frequency).toBe('daily');
        expect(dailyCheck.automated).toBe(true);
        expect(typeof dailyCheck.procedure).toBe('function');
      }
    });

    test('should calculate next run times correctly', () => {
      const baseDate = new Date('2025-01-15T10:00:00Z');

      const nextDaily = dashboard['calculateNextRun'](baseDate, 'daily');
      expect(nextDaily.getDate()).toBe(16); // Next day

      const nextWeekly = dashboard['calculateNextRun'](baseDate, 'weekly');
      expect(nextWeekly.getDate()).toBe(22); // 7 days later

      const nextMonthly = dashboard['calculateNextRun'](baseDate, 'monthly');
      expect(nextMonthly.getMonth()).toBe(1); // February (0-indexed)

      const nextQuarterly = dashboard['calculateNextRun'](baseDate, 'quarterly');
      expect(nextQuarterly.getMonth()).toBe(3); // April (0-indexed)
    });

    test('should run scheduled maintenance procedures', async () => {
      // Mock successful command execution for maintenance
      mockExecSync.mockReturnValue('0'); // Success exit code

      const results = dashboard['runScheduledMaintenance']();

      // Should run procedures that are due
      expect(results).toBeInstanceOf(Map);

      // Verify maintenance procedures were updated
      const dailyCheck = dashboard['maintenanceProcedures'].get('daily-health-check');
      if (dailyCheck && results.has('daily-health-check')) {
        expect(dailyCheck.lastRun).toBeInstanceOf(Date);
        expect(dailyCheck.nextRun).toBeInstanceOf(Date);
        if (dailyCheck.nextRun && dailyCheck.lastRun) {
          expect(dailyCheck.nextRun.getTime()).toBeGreaterThan(dailyCheck.lastRun.getTime());
        }
      }
    });
  });

  describe('Report Generation', () => {
    test('should generate comprehensive markdown report', async () => {
      const mockData = {
  validationResult: {
  passed: true,
          metrics: mockMetrics,
          alerts: [],
          recommendations: ['Continue improvement'],
          regressionAnalysis: {
  detected: false,
            affectedMetrics: [],
            severity: 'minor' as const,
            recommendations: [],
            historicalComparison: {
  current: 1500,
              previous: 1600,
              change: -100,
              changePercentage: -6.25
            }
          }
        },
        trendAnalysis: [],
        targets: [],
        qualityGates: [],
        maintenanceResults: new Map(),
        generationTime: 1500
      };

      dashboard['generateComprehensiveReport'](mockData);

      // Verify markdown report was generated
      const markdownCall = (mockWriteFileSync as jest.Mock).mock.calls.find(call =>
        call[0].includes('.md')
      );

      expect(markdownCall).toBeDefined()
      expect(markdownCall[1]).toContain('# 🎯 Zero-Error Achievement Dashboard');
      expect(markdownCall[1]).toContain('Quality Score: 85/100');
      expect(markdownCall[1]).toContain('Total Issues: 1500');
    });

    test('should generate JSON report with structured data', async () => {
      const mockData = {
  validationResult: {
  passed: true,
          metrics: mockMetrics,
          alerts: [],
          recommendations: [],
          regressionAnalysis: {
  detected: false,
            affectedMetrics: [],
            severity: 'minor' as const,
            recommendations: [],
            historicalComparison: {
  current: 1500,
              previous: 1600,
              change: -100,
              changePercentage: -6.25
            }
          }
        },
        trendAnalysis: [],
        targets: [],
        qualityGates: [],
        maintenanceResults: new Map(),
        generationTime: 1500
      };

      dashboard['generateComprehensiveReport'](mockData);

      // Verify JSON report was generated
      const jsonCall = (mockWriteFileSync as jest.Mock).mock.calls.find(call =>
        call[0].includes('.json')
      );

      expect(jsonCall).toBeDefined()

      const jsonData = JSON.parse(jsonCall[1]);
      expect(jsonData).toHaveProperty('timestamp');
      expect(jsonData).toHaveProperty('generationTime', 1500);
      expect(jsonData).toHaveProperty('summary');
      expect(jsonData).toHaveProperty('metrics');
      expect(jsonData.summary).toHaveProperty('qualityScore', 85);
    });
  });

  describe('Helper Methods', () => {
    test('should get metric values correctly from nested objects', () => {
      const value1 = dashboard['getMetricValue'](mockMetrics, 'totalIssues');
      expect(value1).toBe(1500);

      const value2 = dashboard['getMetricValue'](mockMetrics, 'performanceMetrics.lintingDuration');
      expect(value2).toBe(25000);

      const value3 = dashboard['getMetricValue'](mockMetrics, 'domainSpecificIssues.astrologicalCalculations');
      expect(value3).toBe(25);

      const value4 = dashboard['getMetricValue'](mockMetrics, 'nonexistent.path');
      expect(value4).toBe(0);
    });

    test('should calculate overall progress correctly', () => {
      const targets = [
        { progress: 100, metric: 'parserErrors' },
        { progress: 75, metric: 'explicitAnyErrors' },
        { progress: 50, metric: 'totalIssues' },
        { progress: 85, metric: 'qualityScore' }
      ];

      const overallProgress = dashboard['calculateOverallProgress'](targets as any);
      expect(overallProgress).toBe(78); // (100 + 75 + 50 + 85) / 4 = 77.5, rounded to 78
    });

    test('should get overall status correctly', () => {
      const mockValidationResult = {
  passed: true,
        metrics: mockMetrics,
        alerts: [],
        recommendations: [],
        regressionAnalysis: {
  detected: false,
          affectedMetrics: [],
          severity: 'minor' as const,
          recommendations: [],
          historicalComparison: {
  current: 1500,
            previous: 1600,
            change: -100,
            changePercentage: -6.25
          }
        }
      };

      const passingGates = [
        { status: 'passing', blocksDeployment: true },
        { status: 'passing', blocksDeployment: false }
      ];

      const status1 = dashboard['getOverallStatus'](mockValidationResult, passingGates as any);
      expect(status1).toBe('👍 GOOD'); // Quality score 85 = good

      const failingGates = [
        { status: 'failing', blocksDeployment: true }
      ];

      const status2 = dashboard['getOverallStatus'](mockValidationResult, failingGates as any);
      expect(status2).toBe('🚨 CRITICAL'); // Failing deployment-blocking gate = critical
    });
  });

  describe('Error Handling', () => {
    test('should handle file system errors gracefully', async () => {
      mockReadFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      // Should not throw, should use defaults
      const trends = dashboard['analyzeTrends'](mockMetrics);
      expect(trends).toEqual([]);
    });

    test('should handle command execution errors in maintenance', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Command failed');
      });

      const results = dashboard['runScheduledMaintenance']();

      // Should handle errors and continue
      expect(results).toBeInstanceOf(Map);

      // Check if any failed results were recorded
      for (const [_id, result] of results) {
        if (!result.success) {
          expect(result.issues.length).toBeGreaterThan(0);
          expect(result.nextActions.length).toBeGreaterThan(0);
        }
      }
    });
  });
});

describe('ZeroErrorDashboardCLI', () => {
  // CLI tests would go here if needed
  // For now, focusing on the core dashboard functionality
});
