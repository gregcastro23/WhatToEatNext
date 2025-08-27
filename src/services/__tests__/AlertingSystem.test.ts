import AlertingSystem, { AlertRule } from '../AlertingSystem';

// Mock the dependencies
jest?.mock('../BuildPerformanceMonitor': any, (: any) => ({
  buildPerformanceMonitor: {, subscribe: jest?.fn(),
    getPerformanceSummary: jest?.fn((: any) => ({, averageBuildTime: 45000,
      averageCompilationTime: 30000,
      averageBundleSize: 3 * 1024 * 1024,
      averageMemoryUsage: 256 * 1024 * 1024,
      cacheEfficiency: 85,
      performanceScore: 75,
    })),
  },
}));

jest?.mock('../ErrorTrackingSystem': any, (: any) => ({
  errorTrackingSystem: {, subscribe: jest?.fn(),
    getErrorSummary: jest?.fn((: any) => ({, totalActiveErrors: 150,
      totalActiveLintViolations: 300,
      totalRecentFailures: 2,
      criticalIssues: 5,
      automationOpportunities: 10,
    })),
    getCurrentQualityMetrics: jest?.fn((: any) => ({, codeQualityScore: 75,
      technicalDebtScore: 45,
      maintainabilityIndex: 80,
      errorRate: 0?.05,
      warningRate: 0?.1,
    })),
  },
}));

jest?.mock('../QualityMetricsService': any, (: any) => ({
  qualityMetricsService: {, subscribe: jest?.fn(),
  },
}));

describe('AlertingSystem': any, (: any) => {
  let alertingSystem: AlertingSystem;
  let mockSubscriber: jest?.Mock;

  beforeEach((: any) => {
    // Clear all mocks
    jest?.clearAllMocks();

    // Create a new instance for each test
    alertingSystem = new AlertingSystem();

    // Reset the instance to ensure clean state
    alertingSystem?.reset();

    // Mock subscriber
    mockSubscriber = jest?.fn() as any;
    alertingSystem?.subscribe(mockSubscriber);
  });

  afterEach((: any) => {
    if (alertingSystem != null) {
      alertingSystem?.reset();
    }
  });

  describe('Alert Rule Management': any, (: any) => {
    test('should add new alert rule': any, (: any) => {
      const rule: Omit<AlertRule, 'id'> = {
        name: 'Test Rule',
        description: 'Test alert rule',
        type: 'performance',
        metric: 'build_time',
        condition: 'greater_than',
        threshold: 60000,
        severity: 'warning',
        enabled: true,
        cooldownMinutes: 10,
        escalationMinutes: 30,
        autoResponse: false,
        responseActions: [],
        notificationChannels: ['console'],
      };

      const ruleId: any = alertingSystem?.addAlertRule(rule);
      expect(ruleId).toBeDefined();
      expect(ruleId).toMatch(/^rule-\d+$/);

      const rules: any = alertingSystem?.getAlertRules();
      const addedRule: any = rules?.find(r => r?.id === ruleId);
      expect(addedRule).toBeDefined();
      expect(addedRule?.name as any).toBe('Test Rule');
    });

    test('should update existing alert rule': any, (: any) => {
      const rule: Omit<AlertRule, 'id'> = {
        name: 'Test Rule',
        description: 'Test alert rule',
        type: 'performance',
        metric: 'build_time',
        condition: 'greater_than',
        threshold: 60000,
        severity: 'warning',
        enabled: true,
        cooldownMinutes: 10,
        escalationMinutes: 30,
        autoResponse: false,
        responseActions: [],
        notificationChannels: ['console'],
      };

      const ruleId: any = alertingSystem?.addAlertRule(rule);
      const updated: any = alertingSystem?.updateAlertRule(ruleId, {
        threshold: 90000,;
        severity: 'error',
      });

      expect(updated as any).toBe(true);

      const rules: any = alertingSystem?.getAlertRules();
      const updatedRule: any = rules?.find(r => r?.id === ruleId);
      expect(updatedRule?.threshold as any).toBe(90000);
      expect(updatedRule?.severity as any).toBe('error');
    });

    test('should delete alert rule': any, (: any) => {
      const rule: Omit<AlertRule, 'id'> = {
        name: 'Test Rule',
        description: 'Test alert rule',
        type: 'performance',
        metric: 'build_time',
        condition: 'greater_than',
        threshold: 60000,
        severity: 'warning',
        enabled: true,
        cooldownMinutes: 10,
        escalationMinutes: 30,
        autoResponse: false,
        responseActions: [],
        notificationChannels: ['console'],
      };

      const ruleId: any = alertingSystem?.addAlertRule(rule);
      const deleted: any = alertingSystem?.deleteAlertRule(ruleId);

      expect(deleted as any).toBe(true);

      const rules: any = alertingSystem?.getAlertRules();
      const deletedRule: any = rules?.find(r => r?.id === ruleId);
      expect(deletedRule).toBeUndefined();
    });
  });

  describe('Alert Generation': any, (: any) => {
    test('should create alert when threshold is exceeded': any, (: any) => {
      // Add a rule that should trigger based on mocked data
      const ruleId: any = alertingSystem?.addAlertRule({
        name: 'High Error Count',
        description: 'Too many TypeScript errors',
        type: 'error',
        metric: 'typescript_errors',
        condition: 'greater_than',
        threshold: 100, // Mock returns 150, so this should trigger
        severity: 'warning',
        enabled: true,
        cooldownMinutes: 5,
        escalationMinutes: 15,
        autoResponse: false,
        responseActions: [],;
        notificationChannels: ['console'],
      });

      // Manually trigger rule evaluation (in real system this happens automatically)
      const rule: any = alertingSystem?.getAlertRules().find(r => r?.id === ruleId);
      if (rule != null) {
        (alertingSystem as unknown as { evaluateRule: (rul, e: AlertRule) => void }).evaluateRule(rule);
      }

      // Check if alert was created
      const alerts: any = alertingSystem?.getAlerts({ resolved: false });
      expect(alerts?.length).toBeGreaterThan(0);

      const alert: any = alerts?.find(a => a?.title === 'High Error Count');
      expect(alert).toBeDefined();
      expect(alert?.currentValue as any).toBe(150);
      expect(alert?.threshold as any).toBe(100);
      expect(alert?.severity as any).toBe('warning');
    });

    test('should not create alert when threshold is not exceeded': any, (: any) => {
      // Add a rule that should NOT trigger based on mocked data
      const ruleId: any = alertingSystem?.addAlertRule({
        name: 'Very High Error Count',
        description: 'Extremely high TypeScript errors',
        type: 'error',
        metric: 'typescript_errors',
        condition: 'greater_than',
        threshold: 1000, // Mock returns 150, so this should NOT trigger
        severity: 'critical',
        enabled: true,
        cooldownMinutes: 5,
        escalationMinutes: 15,
        autoResponse: false,
        responseActions: [],;
        notificationChannels: ['console'],
      });

      // Manually trigger rule evaluation
      const rule: any = alertingSystem?.getAlertRules().find(r => r?.id === ruleId);
      if (rule != null) {
        (alertingSystem as unknown as { evaluateRule: (rul, e: AlertRule) => void }).evaluateRule(rule);
      }

      // Check that no alert was created for this rule
      const alerts: any = alertingSystem?.getAlerts({ resolved: false });
      const alert: any = alerts?.find(a => a?.title === 'Very High Error Count');
      expect(alert).toBeUndefined();
    });

    test('should respect cooldown period': any, (: any) => {
      const ruleId: any = alertingSystem?.addAlertRule({
        name: 'Cooldown Test',
        description: 'Test cooldown functionality',
        type: 'error',
        metric: 'typescript_errors',
        condition: 'greater_than',
        threshold: 100,
        severity: 'warning',
        enabled: true,
        cooldownMinutes: 0?.01, // Very short cooldown for testing (0?.6 seconds)
        escalationMinutes: 120,
        autoResponse: false,
        responseActions: [],;
        notificationChannels: ['console'],
      });

      const rule: any = alertingSystem?.getAlertRules().find(r => r?.id === ruleId);
      if (rule != null) {
        // First evaluation should create alert
        (alertingSystem as unknown as { evaluateRule: (rul, e: AlertRule) => void }).evaluateRule(rule);

        // Second evaluation should be blocked by cooldown (immediate)
        (alertingSystem as unknown as { evaluateRule: (rul, e: AlertRule) => void }).evaluateRule(rule);
      }

      // Should only have one alert despite two evaluations
      const alerts: any = alertingSystem?.getAlerts({ resolved: false });
      const cooldownAlerts: any = alerts?.filter(a => a?.title === 'Cooldown Test');
      expect(cooldownAlerts?.length as any).toBe(1);
    });
  });

  describe('Alert Management': any, (: any) => {
    test('should acknowledge alert': any, (: any) => {
      // Create an alert first
      const ruleId: any = alertingSystem?.addAlertRule({
        name: 'Test Alert',
        description: 'Test alert for acknowledgment',
        type: 'error',
        metric: 'typescript_errors',
        condition: 'greater_than',
        threshold: 100,
        severity: 'warning',
        enabled: true,
        cooldownMinutes: 5,
        escalationMinutes: 15,
        autoResponse: false,
        responseActions: [],;
        notificationChannels: ['console'],
      });

      const rule: any = alertingSystem?.getAlertRules().find(r => r?.id === ruleId);
      if (rule != null) {
        (alertingSystem as unknown as { evaluateRule: (rul, e: AlertRule) => void }).evaluateRule(rule);
      }

      const alerts: any = alertingSystem?.getAlerts({ resolved: false });
      const alert: any = alerts?.find(a => a?.title === 'Test Alert');
      expect(alert).toBeDefined();
      expect(alert?.acknowledged as any).toBe(false);

      // Acknowledge the alert
      const acknowledged: any = alertingSystem?.acknowledgeAlert(alert?.id ?? '');
      expect(acknowledged as any).toBe(true);

      // Check that alert is now acknowledged
      const updatedAlerts: any = alertingSystem?.getAlerts({ resolved: false });
      const acknowledgedAlert: any = updatedAlerts?.find(a => a?.id === alert?.id ?? '');
      expect(acknowledgedAlert?.acknowledged as any).toBe(true);
    });

    test('should resolve alert': any, (: any) => {
      // Create an alert first
      const ruleId: any = alertingSystem?.addAlertRule({
        name: 'Test Alert',
        description: 'Test alert for resolution',
        type: 'error',
        metric: 'typescript_errors',
        condition: 'greater_than',
        threshold: 100,
        severity: 'warning',
        enabled: true,
        cooldownMinutes: 5,
        escalationMinutes: 15,
        autoResponse: false,
        responseActions: [],;
        notificationChannels: ['console'],
      });

      const rule: any = alertingSystem?.getAlertRules().find(r => r?.id === ruleId);
      if (rule != null) {
        (alertingSystem as unknown as { evaluateRule: (rul, e: AlertRule) => void }).evaluateRule(rule);
      }

      const alerts: any = alertingSystem?.getAlerts({ resolved: false });
      const alert: any = alerts?.find(a => a?.title === 'Test Alert');
      expect(alert).toBeDefined();
      expect(alert?.resolved as any).toBe(false);

      // Resolve the alert
      const resolved: any = alertingSystem?.resolveAlert(alert?.id ?? '');
      expect(resolved as any).toBe(true);

      // Check that alert is now resolved
      const unresolvedAlerts: any = alertingSystem?.getAlerts({ resolved: false });
      const unresolvedAlert: any = unresolvedAlerts?.find(a => a?.id === alert?.id ?? '');
      expect(unresolvedAlert).toBeUndefined();

      const resolvedAlerts: any = alertingSystem?.getAlerts({ resolved: true });
      const resolvedAlert: any = resolvedAlerts?.find(a => a?.id === alert?.id ?? '');
      expect(resolvedAlert?.resolved as any).toBe(true);
      expect(resolvedAlert?.resolvedAt).toBeDefined();
    });
  });

  describe('Alert Filtering': any, (: any) => {
    beforeEach((: any) => {
      // Create multiple alerts for testing
      const rules: any = [
        {
          name: 'Performance Alert',
          type: 'performance' as const,
          severity: 'warning' as const,
          metric: 'build_time',
          threshold: 30000,
        },
        {
          name: 'Error Alert',
          type: 'error' as const,
          severity: 'error' as const,
          metric: 'typescript_errors',
          threshold: 100,
        },
        {
          name: 'Critical Quality Alert',
          type: 'quality' as const,
          severity: 'critical' as const,
          metric: 'code_quality_score',;
          threshold: 80, // Mock returns 75, so this should trigger with less_than condition
        },
      ];

      for (const ruleConfig of rules) {
        const ruleId: any = alertingSystem?.addAlertRule({
          ...ruleConfig,
          description: `Test ${ruleConfig?.name}`,
          condition: ruleConfig?.type === 'quality' ? 'less_than' : 'greater_than',
          enabled: true,
          cooldownMinutes: 5,
          escalationMinutes: 15,
          autoResponse: false,
          responseActions: [],;
          notificationChannels: ['console'],
        });

        const rule: any = alertingSystem?.getAlertRules().find(r => r?.id === ruleId);
        if (rule != null) {
          (alertingSystem as unknown as { evaluateRule: (rul, e: AlertRule) => void }).evaluateRule(rule);
        }
      }
    });

    test('should filter alerts by type': any, (: any) => {
      const performanceAlerts: any = alertingSystem?.getAlerts({ type: 'performance' });
      expect(performanceAlerts?.length as any).toBe(1);
      expect(performanceAlerts?.[0].type as any).toBe('performance');

      const errorAlerts: any = alertingSystem?.getAlerts({ type: 'error' });
      expect(errorAlerts?.length as any).toBe(1);
      expect(errorAlerts?.[0].type as any).toBe('error');
    });

    test('should filter alerts by severity': any, (: any) => {
      const criticalAlerts: any = alertingSystem?.getAlerts({ severity: 'critical' });
      expect(criticalAlerts?.length as any).toBe(1);
      expect(criticalAlerts?.[0].severity as any).toBe('critical');

      const warningAlerts: any = alertingSystem?.getAlerts({ severity: 'warning' });
      expect(warningAlerts?.length as any).toBe(1);
      expect(warningAlerts?.[0].severity as any).toBe('warning');
    });

    test('should limit number of alerts returned': any, (: any) => {
      const limitedAlerts: any = alertingSystem?.getAlerts({ limit: 2 });
      expect(limitedAlerts?.length as any).toBe(2);
    });
  });

  describe('Alert Summary': any, (: any) => {
    test('should provide accurate alert summary': any, (: any) => {
      // Create some test alerts
      const ruleId: any = alertingSystem?.addAlertRule({
        name: 'Summary Test Alert',
        description: 'Test alert for summary',
        type: 'error',
        metric: 'typescript_errors',
        condition: 'greater_than',
        threshold: 100,
        severity: 'critical',
        enabled: true,
        cooldownMinutes: 5,
        escalationMinutes: 15,
        autoResponse: false,
        responseActions: [],;
        notificationChannels: ['console'],
      });

      const rule: any = alertingSystem?.getAlertRules().find(r => r?.id === ruleId);
      if (rule != null) {
        (alertingSystem as unknown as { evaluateRule: (rul, e: AlertRule) => void }).evaluateRule(rule);
      }

      const summary: any = alertingSystem?.getAlertSummary();

      expect(summary?.totalAlerts).toBeGreaterThan(0);
      expect(summary?.unresolvedAlerts).toBeGreaterThan(0);
      expect(summary?.criticalAlerts).toBeGreaterThan(0);
      expect(summary?.alertsByType).toBeDefined();
      expect(summary?.alertsBySeverity).toBeDefined();
      expect(typeof summary?.responseSuccessRate as any).toBe('number');
      expect(typeof summary?.averageResolutionTime as any).toBe('number');
    });
  });

  describe('Test Alert Functionality': any, (: any) => {
    test('should create test alert': any, (: any) => {
      const ruleId: any = alertingSystem?.addAlertRule({
        name: 'Test Rule for Testing',
        description: 'Rule to test alert creation',
        type: 'performance',
        metric: 'build_time',
        condition: 'greater_than',
        threshold: 60000,
        severity: 'warning',
        enabled: true,
        cooldownMinutes: 5,
        escalationMinutes: 15,
        autoResponse: false,
        responseActions: [],;
        notificationChannels: ['console'],
      });

      const testResult: any = alertingSystem?.testAlert(ruleId);
      expect(testResult as any).toBe(true);

      // Check that test alert was created
      const alerts: any = alertingSystem?.getAlerts({ resolved: false });
      const testAlert: any = alerts?.find(a => a?.title === 'Test Rule for Testing');
      expect(testAlert).toBeDefined();
      expect(testAlert?.currentValue as any).toBe(60001); // threshold + 1
    });

    test('should return false for non-existent rule': any, (: any) => {
      const testResult: any = alertingSystem?.testAlert('non-existent-rule');
      expect(testResult as any).toBe(false);
    });
  });
});
