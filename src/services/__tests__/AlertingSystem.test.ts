import AlertingSystem, { Alert, AlertRule } from '../AlertingSystem';

// Mock the dependencies
jest.mock('../BuildPerformanceMonitor', () => ({
  buildPerformanceMonitor: {
    subscribe: jest.fn(),
    getPerformanceSummary: jest.fn(() => ({
      averageBuildTime: 45000,
      averageCompilationTime: 30000,
      averageBundleSize: 3 * 1024 * 1024,
      averageMemoryUsage: 256 * 1024 * 1024,
      cacheEfficiency: 85,
      performanceScore: 75
    }))
  }
}));

jest.mock('../ErrorTrackingSystem', () => ({
  errorTrackingSystem: {
    subscribe: jest.fn(),
    getErrorSummary: jest.fn(() => ({
      totalActiveErrors: 150,
      totalActiveLintViolations: 300,
      totalRecentFailures: 2,
      criticalIssues: 5,
      automationOpportunities: 10
    })),
    getCurrentQualityMetrics: jest.fn(() => ({
      codeQualityScore: 75,
      technicalDebtScore: 45,
      maintainabilityIndex: 80,
      errorRate: 0.05,
      warningRate: 0.1
    }))
  }
}));

jest.mock('../QualityMetricsService', () => ({
  qualityMetricsService: {
    subscribe: jest.fn()
  }
}));

describe('AlertingSystem', () => {
  let alertingSystem: AlertingSystem;
  let mockSubscriber: jest.Mock;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create a new instance for each test
    alertingSystem = new (AlertingSystem as any)();
    
    // Reset the instance to ensure clean state
    alertingSystem.reset();
    
    // Mock subscriber
    mockSubscriber = jest.fn();
    alertingSystem.subscribe(mockSubscriber);
  });

  afterEach(() => {
    if (alertingSystem) {
      alertingSystem.reset();
    }
  });

  describe('Alert Rule Management', () => {
    test('should add new alert rule', () => {
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
        notificationChannels: ['console']
      };

      const ruleId = alertingSystem.addAlertRule(rule);
      expect(ruleId).toBeDefined();
      expect(ruleId).toMatch(/^rule-\d+$/);

      const rules = alertingSystem.getAlertRules();
      const addedRule = rules.find(r => r.id === ruleId);
      expect(addedRule).toBeDefined();
      expect(addedRule?.name).toBe('Test Rule');
    });

    test('should update existing alert rule', () => {
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
        notificationChannels: ['console']
      };

      const ruleId = alertingSystem.addAlertRule(rule);
      const updated = alertingSystem.updateAlertRule(ruleId, { 
        threshold: 90000,
        severity: 'error'
      });

      expect(updated).toBe(true);

      const rules = alertingSystem.getAlertRules();
      const updatedRule = rules.find(r => r.id === ruleId);
      expect(updatedRule?.threshold).toBe(90000);
      expect(updatedRule?.severity).toBe('error');
    });

    test('should delete alert rule', () => {
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
        notificationChannels: ['console']
      };

      const ruleId = alertingSystem.addAlertRule(rule);
      const deleted = alertingSystem.deleteAlertRule(ruleId);

      expect(deleted).toBe(true);

      const rules = alertingSystem.getAlertRules();
      const deletedRule = rules.find(r => r.id === ruleId);
      expect(deletedRule).toBeUndefined();
    });
  });

  describe('Alert Generation', () => {
    test('should create alert when threshold is exceeded', () => {
      // Add a rule that should trigger based on mocked data
      const ruleId = alertingSystem.addAlertRule({
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
        responseActions: [],
        notificationChannels: ['console']
      });

      // Manually trigger rule evaluation (in real system this happens automatically)
      const rule = alertingSystem.getAlertRules().find(r => r.id === ruleId);
      if (rule) {
        (alertingSystem as any).evaluateRule(rule);
      }

      // Check if alert was created
      const alerts = alertingSystem.getAlerts({ resolved: false });
      expect(alerts.length).toBeGreaterThan(0);
      
      const alert = alerts.find(a => a.title === 'High Error Count');
      expect(alert).toBeDefined();
      expect(alert?.currentValue).toBe(150);
      expect(alert?.threshold).toBe(100);
      expect(alert?.severity).toBe('warning');
    });

    test('should not create alert when threshold is not exceeded', () => {
      // Add a rule that should NOT trigger based on mocked data
      const ruleId = alertingSystem.addAlertRule({
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
        responseActions: [],
        notificationChannels: ['console']
      });

      // Manually trigger rule evaluation
      const rule = alertingSystem.getAlertRules().find(r => r.id === ruleId);
      if (rule) {
        (alertingSystem as any).evaluateRule(rule);
      }

      // Check that no alert was created for this rule
      const alerts = alertingSystem.getAlerts({ resolved: false });
      const alert = alerts.find(a => a.title === 'Very High Error Count');
      expect(alert).toBeUndefined();
    });

    test('should respect cooldown period', () => {
      const ruleId = alertingSystem.addAlertRule({
        name: 'Cooldown Test',
        description: 'Test cooldown functionality',
        type: 'error',
        metric: 'typescript_errors',
        condition: 'greater_than',
        threshold: 100,
        severity: 'warning',
        enabled: true,
        cooldownMinutes: 0.01, // Very short cooldown for testing (0.6 seconds)
        escalationMinutes: 120,
        autoResponse: false,
        responseActions: [],
        notificationChannels: ['console']
      });

      const rule = alertingSystem.getAlertRules().find(r => r.id === ruleId);
      if (rule) {
        // First evaluation should create alert
        (alertingSystem as any).evaluateRule(rule);
        
        // Second evaluation should be blocked by cooldown (immediate)
        (alertingSystem as any).evaluateRule(rule);
      }

      // Should only have one alert despite two evaluations
      const alerts = alertingSystem.getAlerts({ resolved: false });
      const cooldownAlerts = alerts.filter(a => a.title === 'Cooldown Test');
      expect(cooldownAlerts.length).toBe(1);
    });
  });

  describe('Alert Management', () => {
    test('should acknowledge alert', () => {
      // Create an alert first
      const ruleId = alertingSystem.addAlertRule({
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
        responseActions: [],
        notificationChannels: ['console']
      });

      const rule = alertingSystem.getAlertRules().find(r => r.id === ruleId);
      if (rule) {
        (alertingSystem as any).evaluateRule(rule);
      }

      const alerts = alertingSystem.getAlerts({ resolved: false });
      const alert = alerts.find(a => a.title === 'Test Alert');
      expect(alert).toBeDefined();
      expect(alert?.acknowledged).toBe(false);

      // Acknowledge the alert
      const acknowledged = alertingSystem.acknowledgeAlert(alert!.id);
      expect(acknowledged).toBe(true);

      // Check that alert is now acknowledged
      const updatedAlerts = alertingSystem.getAlerts({ resolved: false });
      const acknowledgedAlert = updatedAlerts.find(a => a.id === alert!.id);
      expect(acknowledgedAlert?.acknowledged).toBe(true);
    });

    test('should resolve alert', () => {
      // Create an alert first
      const ruleId = alertingSystem.addAlertRule({
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
        responseActions: [],
        notificationChannels: ['console']
      });

      const rule = alertingSystem.getAlertRules().find(r => r.id === ruleId);
      if (rule) {
        (alertingSystem as any).evaluateRule(rule);
      }

      const alerts = alertingSystem.getAlerts({ resolved: false });
      const alert = alerts.find(a => a.title === 'Test Alert');
      expect(alert).toBeDefined();
      expect(alert?.resolved).toBe(false);

      // Resolve the alert
      const resolved = alertingSystem.resolveAlert(alert!.id);
      expect(resolved).toBe(true);

      // Check that alert is now resolved
      const unresolvedAlerts = alertingSystem.getAlerts({ resolved: false });
      const unresolvedAlert = unresolvedAlerts.find(a => a.id === alert!.id);
      expect(unresolvedAlert).toBeUndefined();

      const resolvedAlerts = alertingSystem.getAlerts({ resolved: true });
      const resolvedAlert = resolvedAlerts.find(a => a.id === alert!.id);
      expect(resolvedAlert?.resolved).toBe(true);
      expect(resolvedAlert?.resolvedAt).toBeDefined();
    });
  });

  describe('Alert Filtering', () => {
    beforeEach(() => {
      // Create multiple alerts for testing
      const rules = [
        {
          name: 'Performance Alert',
          type: 'performance' as const,
          severity: 'warning' as const,
          metric: 'build_time',
          threshold: 30000
        },
        {
          name: 'Error Alert',
          type: 'error' as const,
          severity: 'error' as const,
          metric: 'typescript_errors',
          threshold: 100
        },
        {
          name: 'Critical Quality Alert',
          type: 'quality' as const,
          severity: 'critical' as const,
          metric: 'code_quality_score',
          threshold: 80 // Mock returns 75, so this should trigger with less_than condition
        }
      ];

      for (const ruleConfig of rules) {
        const ruleId = alertingSystem.addAlertRule({
          ...ruleConfig,
          description: `Test ${ruleConfig.name}`,
          condition: ruleConfig.type === 'quality' ? 'less_than' : 'greater_than',
          enabled: true,
          cooldownMinutes: 5,
          escalationMinutes: 15,
          autoResponse: false,
          responseActions: [],
          notificationChannels: ['console']
        });

        const rule = alertingSystem.getAlertRules().find(r => r.id === ruleId);
        if (rule) {
          (alertingSystem as any).evaluateRule(rule);
        }
      }
    });

    test('should filter alerts by type', () => {
      const performanceAlerts = alertingSystem.getAlerts({ type: 'performance' });
      expect(performanceAlerts.length).toBe(1);
      expect(performanceAlerts[0].type).toBe('performance');

      const errorAlerts = alertingSystem.getAlerts({ type: 'error' });
      expect(errorAlerts.length).toBe(1);
      expect(errorAlerts[0].type).toBe('error');
    });

    test('should filter alerts by severity', () => {
      const criticalAlerts = alertingSystem.getAlerts({ severity: 'critical' });
      expect(criticalAlerts.length).toBe(1);
      expect(criticalAlerts[0].severity).toBe('critical');

      const warningAlerts = alertingSystem.getAlerts({ severity: 'warning' });
      expect(warningAlerts.length).toBe(1);
      expect(warningAlerts[0].severity).toBe('warning');
    });

    test('should limit number of alerts returned', () => {
      const limitedAlerts = alertingSystem.getAlerts({ limit: 2 });
      expect(limitedAlerts.length).toBe(2);
    });
  });

  describe('Alert Summary', () => {
    test('should provide accurate alert summary', () => {
      // Create some test alerts
      const ruleId = alertingSystem.addAlertRule({
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
        responseActions: [],
        notificationChannels: ['console']
      });

      const rule = alertingSystem.getAlertRules().find(r => r.id === ruleId);
      if (rule) {
        (alertingSystem as any).evaluateRule(rule);
      }

      const summary = alertingSystem.getAlertSummary();
      
      expect(summary.totalAlerts).toBeGreaterThan(0);
      expect(summary.unresolvedAlerts).toBeGreaterThan(0);
      expect(summary.criticalAlerts).toBeGreaterThan(0);
      expect(summary.alertsByType).toBeDefined();
      expect(summary.alertsBySeverity).toBeDefined();
      expect(typeof summary.responseSuccessRate).toBe('number');
      expect(typeof summary.averageResolutionTime).toBe('number');
    });
  });

  describe('Test Alert Functionality', () => {
    test('should create test alert', () => {
      const ruleId = alertingSystem.addAlertRule({
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
        responseActions: [],
        notificationChannels: ['console']
      });

      const testResult = alertingSystem.testAlert(ruleId);
      expect(testResult).toBe(true);

      // Check that test alert was created
      const alerts = alertingSystem.getAlerts({ resolved: false });
      const testAlert = alerts.find(a => a.title === 'Test Rule for Testing');
      expect(testAlert).toBeDefined();
      expect(testAlert?.currentValue).toBe(60001); // threshold + 1
    });

    test('should return false for non-existent rule', () => {
      const testResult = alertingSystem.testAlert('non-existent-rule');
      expect(testResult).toBe(false);
    });
  });
});