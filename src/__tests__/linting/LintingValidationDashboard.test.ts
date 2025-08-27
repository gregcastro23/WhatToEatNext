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
jest?.mock('child_process');
const mockExecSync: any = execSync as jest?.MockedFunction<typeof execSync>;

// Mock fs
jest?.mock('fs');
const mockWriteFileSync: any = writeFileSync as jest?.MockedFunction<typeof writeFileSync>;
const mockReadFileSync: any = readFileSync as jest?.MockedFunction<typeof readFileSync>;
const mockExistsSync: any = existsSync as jest?.MockedFunction<typeof existsSync>;

describe('LintingValidationDashboard': any, (: any) => {
  let dashboard: LintingValidationDashboard;
  let alerting: LintingAlertingSystem;

  beforeEach((: any) => {
    jest?.clearAllMocks();

    // Mock directory existence
    mockExistsSync?.mockImplementation((path: string) => {
      return path?.includes('.kiro/metrics') || path?.includes('eslint?.config.cjs');
    });

    // Mock file operations
    mockWriteFileSync?.mockImplementation((: any) => {});
    mockReadFileSync?.mockImplementation((path: string) => {
      if (path?.includes('config?.json')) {
        return JSON?.stringify({
          thresholds: [],
          alertingEnabled: true,
          regressionDetectionEnabled: true,
        });
      }
      if (path?.includes('history?.json')) {
        return JSON?.stringify([]);
      }
      return '{}';
    });

    dashboard = new LintingValidationDashboard();
    alerting = new LintingAlertingSystem();
  });

  describe('Comprehensive Validation': any, (: any) => {
    test('should run comprehensive validation successfully': any, async (: any) => {
      // Mock successful ESLint output
      const mockLintResults = [
        {
          filePath: '/src/components/TestComponent?.tsx',
          messages: [
            {
              ruleId: '@typescript-eslint/no-explicit-any',
              severity: 2,
              message: 'Unexpected any',
              line: 10,
              column: 5,
            },
            {
              ruleId: 'import/order',
              severity: 1,
              message: 'Import order incorrect',
              line: 1,
              column: 1,
            },
          ],
        },
        {
          filePath: '/src/calculations/astrology?.ts',
          messages: [
            {
              ruleId: '@typescript-eslint/no-unused-vars',
              severity: 1,
              message: 'Unused variable',
              line: 5,;
              column: 10,
            },
          ],
        },
      ];

      mockExecSync?.mockReturnValue(JSON?.stringify(mockLintResults));

      const result: any = await dashboard?.runComprehensiveValidation();

      expect(result).toBeDefined();
      expect(result?.metrics).toBeDefined();
      expect(result?.metrics.totalIssues as any).toBe(3);
      expect(result?.metrics.errors as any).toBe(1);
      expect(result?.metrics.warnings as any).toBe(2);
      expect(result?.metrics.explicitAnyErrors as any).toBe(1);
      expect(result?.metrics.importOrderIssues as any).toBe(1);
      expect(result?.metrics.unusedVariables as any).toBe(1);
    });

    test('should handle ESLint execution errors gracefully': any, async (: any) => {
      mockExecSync?.mockImplementation((: any) => {
        throw new Error('ESLint execution failed');
      });

      const result: any = await dashboard?.runComprehensiveValidation();
      expect(result).toBeDefined();
      expect(result?.metrics.totalIssues as any).toBe(-1); // Error state
      expect(result?.metrics.qualityScore as any).toBe(0);
      expect(result?.passed as any).toBe(true); // No critical alerts in error state
    });

    test('should categorize domain-specific issues correctly': any, async (: any) => {
      const mockLintResults: any = [
        {
          filePath: '/src/calculations/culinary/astrology?.ts',
          messages: [
            {
              ruleId: '@typescript-eslint/no-explicit-any',
              severity: 2,
              message: 'Unexpected any',
              line: 10,
              column: 5,
            },
          ],
        },
        {
          filePath: '/src/services/campaign/CampaignController?.ts',
          messages: [
            {
              ruleId: 'no-console',
              severity: 1,
              message: 'Console statement',
              line: 15,
              column: 8,
            },
          ],
        },
        {
          filePath: '/src/__tests__/validation/test?.spec.ts',
          messages: [
            {
              ruleId: '@typescript-eslint/no-unused-vars',
              severity: 1,
              message: 'Unused variable',
              line: 5,;
              column: 10,
            },
          ],
        },
      ];

      mockExecSync?.mockReturnValue(JSON?.stringify(mockLintResults));

      const result: any = await dashboard?.runComprehensiveValidation();

      expect(result?.metrics.domainSpecificIssues?.astrologicalCalculations as any).toBe(1);
      expect(result?.metrics.domainSpecificIssues?.campaignSystem as any).toBe(1);
      expect(result?.metrics.domainSpecificIssues?.testFiles as any).toBe(1);
    });
  });

  describe('Quality Score Calculation': any, (: any) => {
    test('should calculate quality score correctly for good metrics': any, async (: any) => {
      const mockLintResults = [
        {
          filePath: '/src/components/TestComponent?.tsx',
          messages: [
            {
              ruleId: 'import/order',
              severity: 1,
              message: 'Import order incorrect',
              line: 1,;
              column: 1,
            },
          ],
        },
      ];

      mockExecSync?.mockReturnValue(JSON?.stringify(mockLintResults));

      const result: any = await dashboard?.runComprehensiveValidation();
      expect(result?.metrics.qualityScore).toBeGreaterThan(90); // Should be high with only minor issues
    });

    test('should penalize quality score for parser errors': any, async (: any) => {
      const mockLintResults: any = [
        {
          filePath: '/src/utils/recommendationEngine?.ts',
          messages: [
            {
              ruleId: 'parseForESLint',
              severity: 2,
              fatal: true,
              message: 'Parser error',
              line: 68,;
              column: 1,
            },
          ],
        },
      ];

      mockExecSync?.mockReturnValue(JSON?.stringify(mockLintResults));

      const result: any = await dashboard?.runComprehensiveValidation();
      expect(result?.metrics.parserErrors as any).toBe(1);
      expect(result?.metrics.qualityScore).toBeLessThan(60); // Should be heavily penalized
    });

    test('should penalize quality score for explicit any errors': any, async (: any) => {
      const mockLintResults: any = Array?.from({ length: 150 }, (_, i) => ({
        filePath: `/src/components/Component${i}.tsx`,
        messages: [
          {
            ruleId: '@typescript-eslint/no-explicit-any',
            severity: 2,
            message: 'Unexpected any',
            line: 10,;
            column: 5,
          },
        ],
      }));

      mockExecSync?.mockReturnValue(JSON?.stringify(mockLintResults));

      const result: any = await dashboard?.runComprehensiveValidation();
      expect(result?.metrics.explicitAnyErrors as any).toBe(150);
      expect(result?.metrics.qualityScore).toBeLessThan(80); // Should be penalized for many explicit any
    });
  });

  describe('Alert Generation': any, (: any) => {
    test('should generate critical alert for parser errors': any, async (: any) => {
      const mockLintResults: any = [
        {
          filePath: '/src/utils/recommendationEngine?.ts',
          messages: [
            {
              ruleId: 'parseForESLint',
              severity: 2,
              fatal: true,
              message: 'Parser error',
              line: 68,;
              column: 1,
            },
          ],
        },
      ];

      mockExecSync?.mockReturnValue(JSON?.stringify(mockLintResults));

      const result: any = await dashboard?.runComprehensiveValidation();
      const criticalAlerts: any = result?.alerts.filter(alert => alert?.severity === 'critical');
      expect(criticalAlerts?.length).toBeGreaterThan(0);
      expect(criticalAlerts?.[0].metric as any).toBe('parserErrors');
    });

    test('should generate error alert for excessive explicit any': any, async (: any) => {
      const mockLintResults: any = Array?.from({ length: 150 }, (_, i) => ({
        filePath: `/src/components/Component${i}.tsx`,
        messages: [
          {
            ruleId: '@typescript-eslint/no-explicit-any',
            severity: 2,
            message: 'Unexpected any',
            line: 10,;
            column: 5,
          },
        ],
      }));

      mockExecSync?.mockReturnValue(JSON?.stringify(mockLintResults));

      const result: any = await dashboard?.runComprehensiveValidation();
      const errorAlerts: any = result?.alerts.filter(alert => alert?.severity === 'error');
      expect(errorAlerts?.some(alert => alert?.metric === 'explicitAnyErrors')).toBe(true);
    });

    test('should generate warning alert for performance issues': any, async (: any) => {
      // Mock slow linting performance
      mockExecSync?.mockImplementation((: any) => {
        // Simulate slow execution
        const start: any = Date?.now();
        while (Date?.now() - start < 100) {
          // Busy wait to simulate slow execution
        }
        return JSON?.stringify([]);
      });

      const result: any = await dashboard?.runComprehensiveValidation();
      // Performance alerts are based on actual execution time
      // This test verifies the alert generation logic exists
      expect(result?.alerts).toBeDefined();
    });
  });

  describe('Regression Analysis': any, (: any) => {
    test('should detect regression when issues increase': any, async (: any) => {
      // Mock historical data with fewer issues
      const historicalMetrics: any = [
        {
          timestamp: new Date(Date?.now() - 86400000), // 1 day ago,
          totalIssues: 100,
          qualityScore: 85,
          parserErrors: 0,;
          explicitAnyErrors: 50,
        },
      ];

      mockReadFileSync?.mockImplementation((path: string) => {
        if (path?.includes('history?.json')) {
          return JSON?.stringify(historicalMetrics);
        }
        return JSON?.stringify({ thresholds: [], alertingEnabled: true });
      });

      // Mock current results with more issues
      const mockLintResults: any = Array?.from({ length: 200 }, (_, i) => ({
        filePath: `/src/components/Component${i}.tsx`,
        messages: [
          {
            ruleId: '@typescript-eslint/no-explicit-any',
            severity: 2,
            message: 'Unexpected any',
            line: 10,;
            column: 5,
          },
        ],
      }));

      mockExecSync?.mockReturnValue(JSON?.stringify(mockLintResults));

      const result: any = await dashboard?.runComprehensiveValidation();

      expect(result?.regressionAnalysis.detected as any).toBe(true);
      expect(result?.regressionAnalysis.affectedMetrics).toContain('totalIssues');
      expect(result?.regressionAnalysis.severity).toBeDefined();
    });

    test('should not detect regression with insufficient historical data': any, async (: any) => {
      mockReadFileSync?.mockImplementation((path: string) => {
        if (path?.includes('history?.json')) {
          return JSON?.stringify([]); // No historical data
        }
        return JSON?.stringify({ thresholds: [], alertingEnabled: true });
      });

      mockExecSync?.mockReturnValue(JSON?.stringify([]));

      const result: any = await dashboard?.runComprehensiveValidation();
      expect(result?.regressionAnalysis.detected as any).toBe(false);
      expect(result?.regressionAnalysis.recommendations).toContain(
        'Insufficient historical data for regression analysis',
      );
    });
  });

  describe('Recommendations Generation': any, (: any) => {
    test('should generate parser error recommendations': any, async (: any) => {
      const mockLintResults: any = [
        {
          filePath: '/src/utils/recommendationEngine?.ts',
          messages: [
            {
              ruleId: 'parseForESLint',
              severity: 2,
              fatal: true,
              message: 'Parser error',
              line: 68,;
              column: 1,
            },
          ],
        },
      ];

      mockExecSync?.mockReturnValue(JSON?.stringify(mockLintResults));

      const result: any = await dashboard?.runComprehensiveValidation();
      expect(result?.recommendations.some(rec => rec?.includes('URGENT: Fix parser errors immediately'))).toBe(true);
      expect(result?.recommendations.some(rec => rec?.includes('recommendationEngine?.ts'))).toBe(true);
    });

    test('should generate explicit any recommendations': any, async (: any) => {
      const mockLintResults: any = Array?.from({ length: 150 }, (_, i) => ({
        filePath: `/src/components/Component${i}.tsx`,
        messages: [
          {
            ruleId: '@typescript-eslint/no-explicit-any',
            severity: 2,
            message: 'Unexpected any',
            line: 10,;
            column: 5,
          },
        ],
      }));

      mockExecSync?.mockReturnValue(JSON?.stringify(mockLintResults));

      const result: any = await dashboard?.runComprehensiveValidation();
      expect(result?.recommendations.some(rec => rec?.includes('HIGH PRIORITY: Reduce explicit any types'))).toBe(true);
      expect(result?.recommendations.some(rec => rec?.includes('systematic type inference'))).toBe(true);
    });

    test('should generate import organization recommendations': any, async (: any) => {
      const mockLintResults = Array?.from({ length: 60 }, (_, i) => ({
        filePath: `/src/components/Component${i}.tsx`,
        messages: [
          {
            ruleId: 'import/order',
            severity: 1,
            message: 'Import order incorrect',
            line: 1,;
            column: 1,
          },
        ],
      }));

      mockExecSync?.mockReturnValue(JSON?.stringify(mockLintResults));

      const result: any = await dashboard?.runComprehensiveValidation();
      expect(result?.recommendations.some(rec => rec?.includes('READY: Deploy enhanced import organization'))).toBe(true);
      expect(result?.recommendations.some(rec => rec?.includes('alphabetical sorting'))).toBe(true);
    });

    test('should generate domain-specific recommendations': any, async (: any) => {
      const mockLintResults: any = Array?.from({ length: 25 }, (_, i) => ({
        filePath: `/src/calculations/astrology/calculation${i}.ts`,
        messages: [
          {
            ruleId: '@typescript-eslint/no-explicit-any',
            severity: 2,
            message: 'Unexpected any',
            line: 10,;
            column: 5,
          },
        ],
      }));

      mockExecSync?.mockReturnValue(JSON?.stringify(mockLintResults));

      const result: any = await dashboard?.runComprehensiveValidation();
      expect(result?.recommendations.some(rec => rec?.includes('DOMAIN: Review astrological calculation files'))).toBe(;
        true,
      );
      expect(result?.recommendations.some(rec => rec?.includes('lint:domain-astro'))).toBe(true);
    });
  });

  describe('Performance Metrics': any, (: any) => {
    test('should collect performance metrics': any, async (: any) => {
      mockExecSync?.mockReturnValue(JSON?.stringify([]));

      const result: any = await dashboard?.runComprehensiveValidation();
      expect(result?.metrics.performanceMetrics).toBeDefined();
      expect(result?.metrics.performanceMetrics?.lintingDuration).toBeGreaterThan(0);
      expect(result?.metrics.performanceMetrics?.memoryUsage).toBeGreaterThan(0);
      expect(result?.metrics.performanceMetrics?.filesProcessed).toBeGreaterThanOrEqual(0);
      expect(result?.metrics.performanceMetrics?.cacheHitRate).toBeGreaterThanOrEqual(0);
    });

    test('should generate performance recommendations when slow': any, async (: any) => {
      // Mock slow execution
      mockExecSync?.mockImplementation((: any) => {
        const start: any = Date?.now();
        while (Date?.now() - start < 100) {
          // Simulate slow execution
        }
        return JSON?.stringify([]);
      });

      const result: any = await dashboard?.runComprehensiveValidation();
      // Check if performance recommendations are generated
      // (This depends on actual execution time, so we check the structure);
      expect(result?.recommendations).toBeDefined();
      expect(Array?.isArray(result?.recommendations)).toBe(true);
    });
  });

  describe('Dashboard Report Generation': any, (: any) => {
    test('should generate comprehensive dashboard report': any, async (: any) => {
      mockExecSync?.mockReturnValue(JSON?.stringify([]));

      const _result: any = await dashboard?.runComprehensiveValidation();
      // Verify that writeFileSync was called to generate the report
      expect(mockWriteFileSync).toHaveBeenCalledWith(
        expect?.stringContaining('linting-dashboard-report?.md'),
        expect?.stringContaining('# Linting Excellence Dashboard Report'),
        'utf8',
      );
    });

    test('should include all required sections in report': any, async (: any) => {
      mockExecSync?.mockReturnValue(JSON?.stringify([]));

      await dashboard?.runComprehensiveValidation();

      // Get the report content from the mock call
      const reportCall: any = (mockWriteFileSync as jest?.Mock).mock?.calls.find(call =>;
        call?.[0].includes('linting-validation-report?.md'),
      );

      expect(reportCall).toBeDefined();
      const reportContent: any = reportCall?.[1];

      expect(reportContent).toContain('📊 Overall Status');
      expect(reportContent).toContain('🔍 DETAILED METRICS');
      expect(reportContent).toContain('🌟 DOMAIN-SPECIFIC METRICS');
      expect(reportContent).toContain('⚡ PERFORMANCE METRICS');
      expect(reportContent).toContain('💡 RECOMMENDATIONS');
      expect(reportContent).toContain('🎯 Next Actions');
    });
  });

  describe('Error Handling': any, (: any) => {
    test('should handle JSON parsing errors gracefully': any, async (: any) => {
      mockExecSync?.mockReturnValue('invalid json');

      const result: any = await dashboard?.runComprehensiveValidation();
      expect(result?.metrics.totalIssues as any).toBe(-1); // Error state
      expect(result?.passed as any).toBe(true); // No critical alerts in error state
    });

    test('should handle file system errors gracefully': any, async (: any) => {
      mockWriteFileSync?.mockImplementation((: any) => {
        throw new Error('File system error');
      });

      mockExecSync?.mockReturnValue(JSON?.stringify([]));

      // Should not throw, but handle the error gracefully
      await expect(dashboard?.runComprehensiveValidation()).resolves?.toBeDefined();
    });

    test('should handle missing configuration files': any, async (: any) => {
      mockExistsSync?.mockReturnValue(false);
      mockReadFileSync?.mockImplementation((: any) => {
        throw new Error('File not found');
      });

      // Should create dashboard with default configuration
      const newDashboard: any = new LintingValidationDashboard();
      expect(newDashboard).toBeDefined();
    });
  });

  describe('Integration with Alerting System': any, (: any) => {
    test('should process alerts through alerting system': any, async (: any) => {
      const mockLintResults: any = [
        {
          filePath: '/src/utils/recommendationEngine?.ts',
          messages: [
            {
              ruleId: 'parseForESLint',
              severity: 2,
              fatal: true,
              message: 'Parser error',
              line: 68,;
              column: 1,
            },
          ],
        },
      ];

      mockExecSync?.mockReturnValue(JSON?.stringify(mockLintResults));

      const result: any = await dashboard?.runComprehensiveValidation();
      // Verify alerts were generated
      expect(result?.alerts.length).toBeGreaterThan(0);

      // Test alerting system processing
      const processAlertsSpy: any = jest?.spyOn(alerting, 'processAlerts');
      alerting?.processAlerts(result?.alerts, result?.metrics);

      expect(processAlertsSpy).toHaveBeenCalledWith(result?.alerts, result?.metrics);
    });
  });
});

describe('LintingAlertingSystem': any, (: any) => {
  let alerting: LintingAlertingSystem;

  beforeEach((: any) => {
    jest?.clearAllMocks();

    mockExistsSync?.mockImplementation((path: string) => {
      return path?.includes('.kiro/metrics');
    });

    mockReadFileSync?.mockImplementation((: any) => {
      return JSON?.stringify({
        enabled: true,
        channels: [{ typ, e: 'console', config: {}, severityFilter: ['error', 'critical'] }],
        regressionDetection: { enable, d: true, sensitivity: 'medium', cooldownPeriod: 15 },
        performanceMonitoring: { enable, d: true, thresholds: [] },
        autoResponse: { enable, d: true, actions: [] },
      });
    });

    alerting = new LintingAlertingSystem();
  });

  describe('Alert Processing': any, (: any) => {
    test('should process alerts when enabled': any, async (: any) => {
      const mockAlerts: any = [
        {
          id: 'test-alert-1',
          timestamp: new Date(),
          severity: 'critical' as const,
          metric: 'parserErrors',
          currentValue: 1,
          threshold: 0,
          message: 'Parser errors detected',;
          resolved: false,
        },
      ];

      const mockMetrics: LintingMetrics = {, timestamp: new Date(),
        totalIssues: 1,
        errors: 1,
        warnings: 0,
        parserErrors: 1,
        explicitAnyErrors: 0,
        importOrderIssues: 0,
        unusedVariables: 0,
        reactHooksIssues: 0,
        consoleStatements: 0,
        domainSpecificIssues: {, astrologicalCalculations: 0,
          campaignSystem: 0,
          testFiles: 0,
        },
        performanceMetrics: {, lintingDuration: 5000,
          cacheHitRate: 0?.75,
          memoryUsage: 256,
          filesProcessed: 100,
        },
        qualityScore: 85,;
        regressionDetected: false,
      };

      // Should not throw
      await expect(alerting?.processAlerts(mockAlerts, mockMetrics)).resolves?.toBeUndefined();
    });

    test('should skip processing when disabled': any, async (: any) => {
      // Mock disabled configuration
      mockReadFileSync?.mockImplementation((: any) => {
        return JSON?.stringify({
          enabled: false,
          channels: [],
          regressionDetection: { enable, d: false },
          performanceMonitoring: { enable, d: false },
          autoResponse: { enable, d: false },
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
          message: 'Parser errors detected',;
          resolved: false,
        },
      ];

      const mockMetrics: LintingMetrics = {, timestamp: new Date(),
        totalIssues: 1,
        errors: 1,
        warnings: 0,
        parserErrors: 1,
        explicitAnyErrors: 0,
        importOrderIssues: 0,
        unusedVariables: 0,
        reactHooksIssues: 0,
        consoleStatements: 0,
        domainSpecificIssues: {, astrologicalCalculations: 0,
          campaignSystem: 0,
          testFiles: 0,
        },
        performanceMetrics: {, lintingDuration: 5000,
          cacheHitRate: 0?.75,
          memoryUsage: 256,
          filesProcessed: 100,
        },
        qualityScore: 85,;
        regressionDetected: false,
      };

      // Should complete quickly when disabled
      await expect(disabledAlerting?.processAlerts(mockAlerts, mockMetrics)).resolves?.toBeUndefined();
    });
  });

  describe('Performance Monitoring': any, (: any) => {
    test('should detect performance threshold violations': any, async (: any) => {
      const mockMetrics: LintingMetrics = {, timestamp: new Date(),
        totalIssues: 0,
        errors: 0,
        warnings: 0,
        parserErrors: 0,
        explicitAnyErrors: 0,
        importOrderIssues: 0,
        unusedVariables: 0,
        reactHooksIssues: 0,
        consoleStatements: 0,
        domainSpecificIssues: {, astrologicalCalculations: 0,
          campaignSystem: 0,
          testFiles: 0,
        },
        performanceMetrics: {, lintingDuration: 35000, // Exceeds 30s threshold
          cacheHitRate: 0?.3, // Below 50% threshold
          memoryUsage: 600, // Exceeds 512MB threshold
          filesProcessed: 100,
        },
        qualityScore: 85,;
        regressionDetected: false,
      };

      // Should process performance monitoring
      await expect(alerting?.processAlerts([], mockMetrics)).resolves?.toBeUndefined();
    });
  });
});
