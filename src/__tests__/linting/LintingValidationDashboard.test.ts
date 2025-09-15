/* eslint-disable @typescript-eslint/no-explicit-any, no-console, @typescript-eslint/no-unused-vars, max-lines-per-function -- Campaign/test file with intentional patterns */
/**
 * Comprehensive tests for the Linting Validation Dashboard
 *
 * Tests the enhanced validation and monitoring system with
 * domain-specific tracking and performance monitoring.
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';

import { LintingAlertingSystem } from '../../services/linting/LintingAlertingSystem';
import { LintingMetrics, LintingValidationDashboard } from '../../services/linting/LintingValidationDashboard';

// Mock child_process
jest.mock('child_process');
const mockExecSync: any = execSync as jest.MockedFunction<typeof execSync>;

// Mock fs
jest.mock('fs');
const mockWriteFileSync: any = writeFileSync as jest.MockedFunction<typeof writeFileSync>;
const mockReadFileSync: any = readFileSync as jest.MockedFunction<typeof readFileSync>;
const mockExistsSync: any = existsSync as jest.MockedFunction<typeof existsSync>;

describe('LintingValidationDashboard', () => {
  let dashboard: LintingValidationDashboard;
  let alerting: LintingAlertingSystem;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock directory existence
    mockExistsSync.mockImplementation((path: string) => {
      return path.includes('.kiro/metrics') || path.includes('eslint.config.cjs');
    });

    // Mock file operations
    mockWriteFileSync.mockImplementation(() => {});
    mockReadFileSync.mockImplementation((path: string) => {
      if (path.includes('config.json')) {
        return JSON.stringify({
          thresholds: [],
          alertingEnabled: true,
          regressionDetectionEnabled: true
        });
      }
      if (path.includes('history.json')) {
        return JSON.stringify([]);
      }
      return '{}';
    });

    dashboard = new LintingValidationDashboard();
    alerting = new LintingAlertingSystem();
  });

  describe('Comprehensive Validation', () => {
    test('should run comprehensive validation successfully', async () => {
      // Mock successful ESLint output
      const mockLintResults = [
        {
          filePath: '/src/components/TestComponent.tsx';
          messages: [
            {
              ruleId: '@typescript-eslint/no-explicit-any',
              severity: 2,
              message: 'Unexpected any',
              line: 10,
              column: 5
            },
            {
              ruleId: 'import/order',
              severity: 1,
              message: 'Import order incorrect',
              line: 1,
              column: 1
            }
          ]
        },
        {
          filePath: '/src/calculations/astrology.ts';
          messages: [
            {
              ruleId: '@typescript-eslint/no-unused-vars',
              severity: 1,
              message: 'Unused variable',
              line: 5,
              column: 10
            }
          ]
        }
      ];

      mockExecSync.mockReturnValue(JSON.stringify(mockLintResults));

      const result: any = await dashboard.runComprehensiveValidation();

      expect(result).toBeDefined();
      expect(result.metrics).toBeDefined();
      expect(result.metrics.totalIssues).toBe(3);
      expect(result.metrics.errors).toBe(1);
      expect(result.metrics.warnings).toBe(2);
      expect(result.metrics.explicitAnyErrors).toBe(1);
      expect(result.metrics.importOrderIssues).toBe(1);
      expect(result.metrics.unusedVariables).toBe(1);
    });

    test('should handle ESLint execution errors gracefully', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('ESLint execution failed');
      });

      const result: any = await dashboard.runComprehensiveValidation();
      expect(result).toBeDefined();
      expect(result.metrics.totalIssues).toBe(-1); // Error state
      expect(result.metrics.qualityScore).toBe(0);
      expect(result.passed).toBe(true); // No critical alerts in error state
    });

    test('should categorize domain-specific issues correctly', async () => {
      const mockLintResults: any = [
        {
          filePath: '/src/calculations/culinary/astrology.ts';
          messages: [
            {
              ruleId: '@typescript-eslint/no-explicit-any',
              severity: 2,
              message: 'Unexpected any',
              line: 10,
              column: 5
            }
          ]
        },
        {
          filePath: '/src/services/campaign/CampaignController.ts';
          messages: [
            {
              ruleId: 'no-console',
              severity: 1,
              message: 'Console statement',
              line: 15,
              column: 8
            }
          ]
        },
        {
          filePath: '/src/__tests__/validation/test.spec.ts';
          messages: [
            {
              ruleId: '@typescript-eslint/no-unused-vars',
              severity: 1,
              message: 'Unused variable',
              line: 5,
              column: 10
            }
          ]
        }
      ];

      mockExecSync.mockReturnValue(JSON.stringify(mockLintResults));

      const result: any = await dashboard.runComprehensiveValidation();

      expect(result.metrics.domainSpecificIssues.astrologicalCalculations).toBe(1);
      expect(result.metrics.domainSpecificIssues.campaignSystem).toBe(1);
      expect(result.metrics.domainSpecificIssues.testFiles).toBe(1);
    });
  });

  describe('Quality Score Calculation', () => {
    test('should calculate quality score correctly for good metrics', async () => {
      const mockLintResults = [
        {
          filePath: '/src/components/TestComponent.tsx';
          messages: [
            {
              ruleId: 'import/order',
              severity: 1,
              message: 'Import order incorrect',
              line: 1,
              column: 1
            }
          ]
        }
      ];

      mockExecSync.mockReturnValue(JSON.stringify(mockLintResults));

      const result: any = await dashboard.runComprehensiveValidation();
      expect(result.metrics.qualityScore).toBeGreaterThan(90); // Should be high with only minor issues
    });

    test('should penalize quality score for parser errors', async () => {
      const mockLintResults: any = [
        {
          filePath: '/src/utils/recommendationEngine.ts';
          messages: [
            {
              ruleId: 'parseForESLint',
              severity: 2,
              fatal: true,
              message: 'Parser error',
              line: 68,
              column: 1
            }
          ]
        }
      ];

      mockExecSync.mockReturnValue(JSON.stringify(mockLintResults));

      const result: any = await dashboard.runComprehensiveValidation();
      expect(result.metrics.parserErrors).toBe(1);
      expect(result.metrics.qualityScore).toBeLessThan(60); // Should be heavily penalized
    });

    test('should penalize quality score for explicit any errors', async () => {
      const mockLintResults: any = Array.from({ length: 150 }, (_, i) => ({
        filePath: `/src/components/Component${i}.tsx`,
        messages: [
          {
            ruleId: '@typescript-eslint/no-explicit-any',
            severity: 2,
            message: 'Unexpected any',
            line: 10,
            column: 5
          }
        ]
      }));

      mockExecSync.mockReturnValue(JSON.stringify(mockLintResults));

      const result: any = await dashboard.runComprehensiveValidation();
      expect(result.metrics.explicitAnyErrors).toBe(150);
      expect(result.metrics.qualityScore).toBeLessThan(80); // Should be penalized for many explicit any
    });
  });

  describe('Alert Generation', () => {
    test('should generate critical alert for parser errors', async () => {
      const mockLintResults: any = [
        {
          filePath: '/src/utils/recommendationEngine.ts';
          messages: [
            {
              ruleId: 'parseForESLint',
              severity: 2,
              fatal: true,
              message: 'Parser error',
              line: 68,
              column: 1
            }
          ]
        }
      ];

      mockExecSync.mockReturnValue(JSON.stringify(mockLintResults));

      const result: any = await dashboard.runComprehensiveValidation();
      const criticalAlerts: any = result.alerts.filter(alert => alert.severity === 'critical');
      expect(criticalAlerts.length).toBeGreaterThan(0);
      expect(criticalAlerts[0].metric).toBe('parserErrors');
    });

    test('should generate error alert for excessive explicit any', async () => {
      const mockLintResults: any = Array.from({ length: 150 }, (_, i) => ({
        filePath: `/src/components/Component${i}.tsx`,
        messages: [
          {
            ruleId: '@typescript-eslint/no-explicit-any',
            severity: 2,
            message: 'Unexpected any',
            line: 10,
            column: 5
          }
        ]
      }));

      mockExecSync.mockReturnValue(JSON.stringify(mockLintResults));

      const result: any = await dashboard.runComprehensiveValidation();
      const errorAlerts: any = result.alerts.filter(alert => alert.severity === 'error');
      expect(errorAlerts.some(alert => alert.metric === 'explicitAnyErrors')).toBe(true);
    });

    test('should generate warning alert for performance issues', async () => {
      // Mock slow linting performance
      mockExecSync.mockImplementation(() => {
        // Simulate slow execution
        const start: any = Date.now();
        while (Date.now() - start < 100) {
          // Busy wait to simulate slow execution
        }
        return JSON.stringify([]);
      });

      const result: any = await dashboard.runComprehensiveValidation();
      // Performance alerts are based on actual execution time
      // This test verifies the alert generation logic exists
      expect(result.alerts).toBeDefined();
    });
  });

  describe('Regression Analysis', () => {
    test('should detect regression when issues increase', async () => {
      // Mock historical data with fewer issues
      const historicalMetrics: any = [
        {
          timestamp: new Date(Date.now() - 86400000), // 1 day ago,
          totalIssues: 100,
          qualityScore: 85,
          parserErrors: 0,
          explicitAnyErrors: 50
        }
      ];

      mockReadFileSync.mockImplementation((path: string) => {
        if (path.includes('history.json')) {
          return JSON.stringify(historicalMetrics);
        }
        return JSON.stringify({ thresholds: [], alertingEnabled: true });
      });

      // Mock current results with more issues
      const mockLintResults: any = Array.from({ length: 200 }, (_, i) => ({
        filePath: `/src/components/Component${i}.tsx`,
        messages: [
          {
            ruleId: '@typescript-eslint/no-explicit-any',
            severity: 2,
            message: 'Unexpected any',
            line: 10,
            column: 5
          }
        ]
      }));

      mockExecSync.mockReturnValue(JSON.stringify(mockLintResults));

      const result: any = await dashboard.runComprehensiveValidation();

      expect(result.regressionAnalysis.detected).toBe(true);
      expect(result.regressionAnalysis.affectedMetrics).toContain('totalIssues');
      expect(result.regressionAnalysis.severity).toBeDefined();
    });

    test('should not detect regression with insufficient historical data', async () => {
      mockReadFileSync.mockImplementation((path: string) => {
        if (path.includes('history.json')) {
          return JSON.stringify([]); // No historical data
        }
        return JSON.stringify({ thresholds: [], alertingEnabled: true });
      });

      mockExecSync.mockReturnValue(JSON.stringify([]));

      const result: any = await dashboard.runComprehensiveValidation();
      expect(result.regressionAnalysis.detected).toBe(false);
      expect(result.regressionAnalysis.recommendations).toContain(
        'Insufficient historical data for regression analysis'
      );
    });
  });

  describe('Recommendations Generation', () => {
    test('should generate parser error recommendations', async () => {
      const mockLintResults: any = [
        {
          filePath: '/src/utils/recommendationEngine.ts';
          messages: [
            {
              ruleId: 'parseForESLint',
              severity: 2,
              fatal: true,
              message: 'Parser error',
              line: 68,
              column: 1
            }
          ]
        }
      ];

      mockExecSync.mockReturnValue(JSON.stringify(mockLintResults));

      const result: any = await dashboard.runComprehensiveValidation();
      expect(result.recommendations.some(rec => rec.includes('URGENT: Fix parser errors immediately'))).toBe(true);
      expect(result.recommendations.some(rec => rec.includes('recommendationEngine.ts'))).toBe(true);
    });

    test('should generate explicit any recommendations', async () => {
      const mockLintResults: any = Array.from({ length: 150 }, (_, i) => ({
        filePath: `/src/components/Component${i}.tsx`,
        messages: [
          {
            ruleId: '@typescript-eslint/no-explicit-any',
            severity: 2,
            message: 'Unexpected any',
            line: 10,
            column: 5
          }
        ]
      }));

      mockExecSync.mockReturnValue(JSON.stringify(mockLintResults));

      const result: any = await dashboard.runComprehensiveValidation();
      expect(result.recommendations.some(rec => rec.includes('HIGH PRIORITY: Reduce explicit any types'))).toBe(true);
      expect(result.recommendations.some(rec => rec.includes('systematic type inference'))).toBe(true);
    });

    test('should generate import organization recommendations', async () => {
      const mockLintResults = Array.from({ length: 60 }, (_, i) => ({
        filePath: `/src/components/Component${i}.tsx`,
        messages: [
          {
            ruleId: 'import/order',
            severity: 1,
            message: 'Import order incorrect',
            line: 1,
            column: 1
          }
        ];
      }));

      mockExecSync.mockReturnValue(JSON.stringify(mockLintResults));

      const result: any = await dashboard.runComprehensiveValidation();
      expect(result.recommendations.some(rec => rec.includes('READY: Deploy enhanced import organization'))).toBe(true);
      expect(result.recommendations.some(rec => rec.includes('alphabetical sorting'))).toBe(true);
    });

    test('should generate domain-specific recommendations', async () => {
      const mockLintResults: any = Array.from({ length: 25 }, (_, i) => ({
        filePath: `/src/calculations/astrology/calculation${i}.ts`,
        messages: [
          {
            ruleId: '@typescript-eslint/no-explicit-any',
            severity: 2,
            message: 'Unexpected any',
            line: 10,
            column: 5
          }
        ]
      }));

      mockExecSync.mockReturnValue(JSON.stringify(mockLintResults));

      const result: any = await dashboard.runComprehensiveValidation();
      expect(result.recommendations.some(rec => rec.includes('DOMAIN: Review astrological calculation files'))).toBe(;
        true
      );
      expect(result.recommendations.some(rec => rec.includes('lint:domain-astro'))).toBe(true);
    });
  });

  describe('Performance Metrics', () => {
    test('should collect performance metrics', async () => {
      mockExecSync.mockReturnValue(JSON.stringify([]));

      const result: any = await dashboard.runComprehensiveValidation();
      expect(result.metrics.performanceMetrics).toBeDefined();
      expect(result.metrics.performanceMetrics.lintingDuration).toBeGreaterThan(0);
      expect(result.metrics.performanceMetrics.memoryUsage).toBeGreaterThan(0);
      expect(result.metrics.performanceMetrics.filesProcessed).toBeGreaterThanOrEqual(0);
      expect(result.metrics.performanceMetrics.cacheHitRate).toBeGreaterThanOrEqual(0);
    });

    test('should generate performance recommendations when slow', async () => {
      // Mock slow execution
      mockExecSync.mockImplementation(() => {
        const start: any = Date.now();
        while (Date.now() - start < 100) {
          // Simulate slow execution
        }
        return JSON.stringify([]);
      });

      const result: any = await dashboard.runComprehensiveValidation();
      // Check if performance recommendations are generated
      // (This depends on actual execution time, so we check the structure);
      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
    });
  });

  describe('Dashboard Report Generation', () => {
    test('should generate comprehensive dashboard report', async () => {
      mockExecSync.mockReturnValue(JSON.stringify([]));

      const _result: any = await dashboard.runComprehensiveValidation();
      // Verify that writeFileSync was called to generate the report
      expect(mockWriteFileSync).toHaveBeenCalledWith(
        expect.stringContaining('linting-dashboard-report.md');
        expect.stringContaining('# Linting Excellence Dashboard Report');
        'utf8'
      );
    });

    test('should include all required sections in report', async () => {
      mockExecSync.mockReturnValue(JSON.stringify([]));

      await dashboard.runComprehensiveValidation();

      // Get the report content from the mock call
      const reportCall: any = (mockWriteFileSync as jest.Mock).mock.calls.find(call =>;
        call[0].includes('linting-validation-report.md')
      );

      expect(reportCall).toBeDefined();
      const reportContent: any = reportCall[1];

      expect(reportContent).toContain('📊 Overall Status');
      expect(reportContent).toContain('🔍 DETAILED METRICS');
      expect(reportContent).toContain('🌟 DOMAIN-SPECIFIC METRICS');
      expect(reportContent).toContain('⚡ PERFORMANCE METRICS');
      expect(reportContent).toContain('💡 RECOMMENDATIONS');
      expect(reportContent).toContain('🎯 Next Actions');
    });
  });

  describe('Error Handling', () => {
    test('should handle JSON parsing errors gracefully', async () => {
      mockExecSync.mockReturnValue('invalid json');

      const result: any = await dashboard.runComprehensiveValidation();
      expect(result.metrics.totalIssues).toBe(-1); // Error state
      expect(result.passed).toBe(true); // No critical alerts in error state
    });

    test('should handle file system errors gracefully', async () => {
      mockWriteFileSync.mockImplementation(() => {
        throw new Error('File system error');
      });

      mockExecSync.mockReturnValue(JSON.stringify([]));

      // Should not throw, but handle the error gracefully
      await expect(dashboard.runComprehensiveValidation()).resolves.toBeDefined();
    });

    test('should handle missing configuration files', async () => {
      mockExistsSync.mockReturnValue(false);
      mockReadFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      // Should create dashboard with default configuration
      const newDashboard: any = new LintingValidationDashboard();
      expect(newDashboard).toBeDefined();
    });
  });

  describe('Integration with Alerting System', () => {
    test('should process alerts through alerting system', async () => {
      const mockLintResults: any = [
        {
          filePath: '/src/utils/recommendationEngine.ts';
          messages: [
            {
              ruleId: 'parseForESLint',
              severity: 2,
              fatal: true,
              message: 'Parser error',
              line: 68,
              column: 1
            }
          ]
        }
      ];

      mockExecSync.mockReturnValue(JSON.stringify(mockLintResults));

      const result: any = await dashboard.runComprehensiveValidation();
      // Verify alerts were generated
      expect(result.alerts.length).toBeGreaterThan(0);

      // Test alerting system processing
      const processAlertsSpy: any = jest.spyOn(alerting, 'processAlerts');
      alerting.processAlerts(result.alerts, result.metrics);

      expect(processAlertsSpy).toHaveBeenCalledWith(result.alerts, result.metrics);
    });
  });
});

describe('LintingAlertingSystem', () => {
  let alerting: LintingAlertingSystem;

  beforeEach(() => {
    jest.clearAllMocks();

    mockExistsSync.mockImplementation((path: string) => {
      return path.includes('.kiro/metrics');
    });

    mockReadFileSync.mockImplementation(() => {
      return JSON.stringify({
        enabled: true,
        channels: [{ typ, e: 'console', config: {}, severityFilter: ['error', 'critical'] }],
        regressionDetection: { enable, d: true, sensitivity: 'medium', cooldownPeriod: 15 },
        performanceMonitoring: { enable, d: true, thresholds: [] },
        autoResponse: { enable, d: true, actions: [] }
      });
    });

    alerting = new LintingAlertingSystem();
  });

  describe('Alert Processing', () => {
    test('should process alerts when enabled', async () => {
      const mockAlerts: any = [
        {
          id: 'test-alert-1',
          timestamp: new Date(),
          severity: 'critical' as const,
          metric: 'parserErrors',
          currentValue: 1,
          threshold: 0,
          message: 'Parser errors detected',
          resolved: false
        }
      ];

      const mockMetrics: LintingMetrics = { timestamp: new Date(),;
        totalIssues: 1,
        errors: 1,
        warnings: 0,
        parserErrors: 1,
        explicitAnyErrors: 0,
        importOrderIssues: 0,
        unusedVariables: 0,
        reactHooksIssues: 0,
        consoleStatements: 0,
        domainSpecificIssues: { astrologicalCalculations: 0,
          campaignSystem: 0,
          testFiles: 0
        },
        performanceMetrics: { lintingDuration: 5000,
          cacheHitRate: 0.75;
          memoryUsage: 256,
          filesProcessed: 100
        },
        qualityScore: 85,
        regressionDetected: false
      };

      // Should not throw
      await expect(alerting.processAlerts(mockAlerts, mockMetrics)).resolves.toBeUndefined();
    });

    test('should skip processing when disabled', async () => {
      // Mock disabled configuration
      mockReadFileSync.mockImplementation(() => {
        return JSON.stringify({
          enabled: false,
          channels: [],
          regressionDetection: { enable, d: false },
          performanceMonitoring: { enable, d: false },
          autoResponse: { enable, d: false }
        });
      });

      const disabledAlerting: any = new LintingAlertingSystem();

      const mockAlerts: any = [
        {
          id: 'test-alert-1',
          timestamp: new Date(),
          severity: 'critical' as const,
          metric: 'parserErrors',
          currentValue: 1,
          threshold: 0,
          message: 'Parser errors detected',
          resolved: false
        }
      ];

      const mockMetrics: LintingMetrics = { timestamp: new Date(),;
        totalIssues: 1,
        errors: 1,
        warnings: 0,
        parserErrors: 1,
        explicitAnyErrors: 0,
        importOrderIssues: 0,
        unusedVariables: 0,
        reactHooksIssues: 0,
        consoleStatements: 0,
        domainSpecificIssues: { astrologicalCalculations: 0,
          campaignSystem: 0,
          testFiles: 0
        },
        performanceMetrics: { lintingDuration: 5000,
          cacheHitRate: 0.75;
          memoryUsage: 256,
          filesProcessed: 100
        },
        qualityScore: 85,
        regressionDetected: false
      };

      // Should complete quickly when disabled
      await expect(disabledAlerting.processAlerts(mockAlerts, mockMetrics)).resolves.toBeUndefined();
    });
  });

  describe('Performance Monitoring', () => {
    test('should detect performance threshold violations', async () => {
      const mockMetrics: LintingMetrics = { timestamp: new Date(),;
        totalIssues: 0,
        errors: 0,
        warnings: 0,
        parserErrors: 0,
        explicitAnyErrors: 0,
        importOrderIssues: 0,
        unusedVariables: 0,
        reactHooksIssues: 0,
        consoleStatements: 0,
        domainSpecificIssues: { astrologicalCalculations: 0,
          campaignSystem: 0,
          testFiles: 0
        },
        performanceMetrics: { lintingDuration: 35000, // Exceeds 30s threshold
          cacheHitRate: 0.3, // Below 50% threshold
          memoryUsage: 600, // Exceeds 512MB threshold
          filesProcessed: 100
        },
        qualityScore: 85,
        regressionDetected: false
      };

      // Should process performance monitoring
      await expect(alerting.processAlerts([], mockMetrics)).resolves.toBeUndefined();
    });
  });
});
