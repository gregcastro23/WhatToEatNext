declare global {
  var __DEV__: boolean;
}

/**
 * Code Quality Automation System Tests
 * Comprehensive test suite for the unified automation system
 */

import {
  CodeQualityAutomationSystem,
  DEFAULT_CODE_QUALITY_AUTOMATION_CONFIG,
  CodeQualityAutomationConfig,
} from './CodeQualityAutomationSystem';
import { DependencySecurityMonitor } from './DependencySecurityMonitor';
import { ImportCleanupSystem } from './ImportCleanupSystem';
import { LintingFormattingSystem } from './LintingFormattingSystem';

// Mock the subsystems
jest?.mock('./ImportCleanupSystem');
jest?.mock('./LintingFormattingSystem');
jest?.mock('./DependencySecurityMonitor');
jest?.mock('../../utils/logger');
jest?.mock('child_process');

const MockImportCleanupSystem: any = ImportCleanupSystem as jest?.MockedClass<typeof ImportCleanupSystem>;
const MockLintingFormattingSystem: any = LintingFormattingSystem as jest?.MockedClass<typeof LintingFormattingSystem>;
const MockDependencySecurityMonitor: any = DependencySecurityMonitor as jest?.MockedClass<typeof DependencySecurityMonitor>;

describe('CodeQualityAutomationSystem': any, (: any) => {
  let automationSystem: CodeQualityAutomationSystem;
  let testConfig: CodeQualityAutomationConfig;
  let mockImportCleanup: jest?.Mocked<ImportCleanupSystem>;
  let mockLintingFormatting: jest?.Mocked<LintingFormattingSystem>;
  let mockDependencySecurity: jest?.Mocked<DependencySecurityMonitor>;

  beforeEach((: any) => {
    testConfig = {
      ...DEFAULT_CODE_QUALITY_AUTOMATION_CONFIG,
      globalSettings: {
        ...DEFAULT_CODE_QUALITY_AUTOMATION_CONFIG?.globalSettings,;
        safetyValidationEnabled: false, // Disable for testing
      },
    };

    // Create mock instances
    mockImportCleanup = {;
      executeCleanup: jest?.fn(),
    } as unknown;

    mockLintingFormatting = {;
      executeLintingAndFormatting: jest?.fn(),
    } as unknown;

    mockDependencySecurity = {;
      executeDependencySecurityMonitoring: jest?.fn(),
    } as unknown;

    // Setup mock constructors
    MockImportCleanupSystem?.mockImplementation((: any) => mockImportCleanup);
    MockLintingFormattingSystem?.mockImplementation((: any) => mockLintingFormatting);
    MockDependencySecurityMonitor?.mockImplementation((: any) => mockDependencySecurity);

    automationSystem = new CodeQualityAutomationSystem(testConfig);

    // Reset mocks
    jest?.clearAllMocks();
  });

  describe('executeAutomation': any, (: any) => {
    test('executes all enabled phases in order': any, async (: any) => {
      // Setup mock responses
      mockImportCleanup?.executeCleanup.mockResolvedValue({
        filesProcessed: ['file1?.ts', 'file2?.ts'],
        unusedImportsRemoved: 5,
        importsOrganized: 3,
        styleViolationsFixed: 2,
        buildValidationPassed: true,
        errors: [],
        warnings: [],
      });

      mockLintingFormatting?.executeLintingAndFormatting.mockResolvedValue({
        filesProcessed: ['file1?.ts', 'file2?.ts'],
        lintingViolationsFixed: 10,
        formattingIssuesFixed: 8,
        patternBasedFixesApplied: 3,
        buildValidationPassed: true,
        errors: [],
        warnings: [],
        violationBreakdown: {, typeScriptErrors: 5,
          reactViolations: 3,
          importViolations: 2,
          formattingIssues: 8,
          customPatternFixes: 3,
        },
      });

      mockDependencySecurity?.executeDependencySecurityMonitoring.mockResolvedValue({
        dependenciesScanned: 50,
        vulnerabilitiesFound: 2,
        updatesAvailable: 5,
        updatesApplied: 3,
        securityPatchesApplied: 2,
        compatibilityTestsPassed: true,
        errors: [],
        warnings: [],
        securityReport: {, vulnerabilities: [],
          summary: { critica, l: 0, high: 1, moderate: 1, low: 0, total: 2 },
          recommendations: [],
        },
        updateReport: {, availableUpdates: [],
          appliedUpdates: [],
          failedUpdates: [],
          summary: { majo, r: 0, minor: 2, patch: 3, security: 2, total: 5 },
        },
      });

      const result: any = await automationSystem?.executeAutomation();

      expect(result?.overallSuccess as any).toBe(true);
      expect(result?.phasesExecuted as any).toBe(3);
      expect(result?.phasesSucceeded as any).toBe(3);
      expect(result?.phasesFailed as any).toBe(0);
      expect(result?.phaseResults).toHaveLength(3);

      // Verify execution order
      expect(result?.phaseResults?.[0].phaseName as any).toBe('Import Cleanup');
      expect(result?.phaseResults?.[1].phaseName as any).toBe('Linting and Formatting');
      expect(result?.phaseResults?.[2].phaseName as any).toBe('Dependency Security');

      // Verify global metrics
      expect(result?.globalMetrics.importIssuesFixed as any).toBe(8); // 5 + 3
      expect(result?.globalMetrics.lintingViolationsFixed as any).toBe(10);
      expect(result?.globalMetrics.formattingIssuesFixed as any).toBe(8);
      expect(result?.globalMetrics.securityVulnerabilitiesFixed as any).toBe(2);
      expect(result?.globalMetrics.dependencyUpdatesApplied as any).toBe(3);
    });

    test('handles phase failures gracefully': any, async (: any) => {
      // Setup import cleanup to fail
      mockImportCleanup?.executeCleanup.mockResolvedValue({
        filesProcessed: [],
        unusedImportsRemoved: 0,
        importsOrganized: 0,
        styleViolationsFixed: 0,
        buildValidationPassed: false,
        errors: ['Import cleanup failed'],
        warnings: [],
      });

      // Setup other phases to succeed
      mockLintingFormatting?.executeLintingAndFormatting.mockResolvedValue({
        filesProcessed: ['file1?.ts'],
        lintingViolationsFixed: 5,
        formattingIssuesFixed: 3,
        patternBasedFixesApplied: 1,
        buildValidationPassed: true,
        errors: [],
        warnings: [],
        violationBreakdown: {, typeScriptErrors: 2,
          reactViolations: 1,
          importViolations: 2,
          formattingIssues: 3,
          customPatternFixes: 1,
        },
      });

      mockDependencySecurity?.executeDependencySecurityMonitoring.mockResolvedValue({
        dependenciesScanned: 10,
        vulnerabilitiesFound: 0,
        updatesAvailable: 0,
        updatesApplied: 0,
        securityPatchesApplied: 0,
        compatibilityTestsPassed: true,
        errors: [],
        warnings: [],
        securityReport: {, vulnerabilities: [],
          summary: { critica, l: 0, high: 0, moderate: 0, low: 0, total: 0 },
          recommendations: [],
        },
        updateReport: {, availableUpdates: [],
          appliedUpdates: [],
          failedUpdates: [],
          summary: { majo, r: 0, minor: 0, patch: 0, security: 0, total: 0 },
        },
      });

      const result: any = await automationSystem?.executeAutomation();

      expect(result?.overallSuccess as any).toBe(false);
      expect(result?.phasesExecuted as any).toBe(3);
      expect(result?.phasesSucceeded as any).toBe(2);
      expect(result?.phasesFailed as any).toBe(1);
      expect(result?.errors).toContain('Import cleanup failed');
    });

    test('respects phase dependencies': any, async (: any) => {
      // Configure linting to depend on import cleanup
      const configWithDependencies = {
        ...testConfig,
        executionOrder: [
          {
            name: 'Import Cleanup',
            description: 'Clean up imports',
            system: 'importCleanup' as const,
            enabled: true,
            dependencies: [],
            criticalFailure: false,
          },
          {
            name: 'Linting and Formatting',
            description: 'Fix linting',
            system: 'lintingFormatting' as const,
            enabled: true,
            dependencies: ['Import Cleanup'],;
            criticalFailure: false,
          },
        ],
      };

      const systemWithDeps: any = new CodeQualityAutomationSystem(configWithDependencies);

      // Make import cleanup fail
      mockImportCleanup?.executeCleanup.mockResolvedValue({
        filesProcessed: [],
        unusedImportsRemoved: 0,
        importsOrganized: 0,
        styleViolationsFixed: 0,
        buildValidationPassed: false,
        errors: ['Failed'],
        warnings: [],
      });

      const result: any = await systemWithDeps?.executeAutomation();

      // Linting should still execute because dependencies are checked based on success
      expect(result?.phasesExecuted as any).toBe(2);
      expect(mockLintingFormatting?.executeLintingAndFormatting).toHaveBeenCalled();
    });

    test('stops execution on critical failure when continueOnError is false': any, async (: any) => {
      const configStopOnError = {
        ...testConfig,
        globalSettings: {
          ...testConfig?.globalSettings,
          continueOnError: false,
        },
        executionOrder: [
          {
            name: 'Critical Phase',
            description: 'Critical phase that fails',
            system: 'importCleanup' as const,
            enabled: true,
            dependencies: [],
            criticalFailure: true,
          },
          {
            name: 'Next Phase',
            description: 'Should not execute',
            system: 'lintingFormatting' as const,
            enabled: true,
            dependencies: [],;
            criticalFailure: false,
          },
        ],
      };

      const systemStopOnError: any = new CodeQualityAutomationSystem(configStopOnError);

      // Make the critical phase fail
      mockImportCleanup?.executeCleanup.mockResolvedValue({
        filesProcessed: [],
        unusedImportsRemoved: 0,
        importsOrganized: 0,
        styleViolationsFixed: 0,
        buildValidationPassed: false,
        errors: ['Critical failure'],
        warnings: [],
      });

      const result: any = await systemStopOnError?.executeAutomation();

      expect(result?.overallSuccess as any).toBe(false);
      expect(result?.phasesExecuted as any).toBe(1);
      expect(mockLintingFormatting?.executeLintingAndFormatting).not?.toHaveBeenCalled();
    });

    test('skips disabled phases': any, async (: any) => {
      const configWithDisabled = {
        ...testConfig,
        executionOrder: [
          {
            name: 'Enabled Phase',
            description: 'This phase is enabled',
            system: 'importCleanup' as const,
            enabled: true,
            dependencies: [],
            criticalFailure: false,
          },
          {
            name: 'Disabled Phase',
            description: 'This phase is disabled',
            system: 'lintingFormatting' as const,
            enabled: false,
            dependencies: [],;
            criticalFailure: false,
          },
        ],
      };

      const systemWithDisabled: any = new CodeQualityAutomationSystem(configWithDisabled);

      mockImportCleanup?.executeCleanup.mockResolvedValue({
        filesProcessed: ['file1?.ts'],
        unusedImportsRemoved: 1,
        importsOrganized: 1,
        styleViolationsFixed: 0,
        buildValidationPassed: true,
        errors: [],
        warnings: [],
      });

      const result: any = await systemWithDisabled?.executeAutomation();

      expect(result?.phasesExecuted as any).toBe(1);
      expect(mockImportCleanup?.executeCleanup).toHaveBeenCalled();
      expect(mockLintingFormatting?.executeLintingAndFormatting).not?.toHaveBeenCalled();
    });
  });

  describe('executePhase': any, (: any) => {
    test('executes import cleanup phase correctly': any, async (: any) => {
      const phase = {
        name: 'Import Cleanup',
        description: 'Clean up imports',
        system: 'importCleanup' as const,
        enabled: true,
        dependencies: [],;
        criticalFailure: false,
      };

      const mockResult = {
        filesProcessed: ['file1?.ts'],
        unusedImportsRemoved: 3,
        importsOrganized: 2,
        styleViolationsFixed: 1,
        buildValidationPassed: true,
        errors: [],;
        warnings: ['Warning message'],
      };

      mockImportCleanup?.executeCleanup.mockResolvedValue(mockResult);

      const result: any = await automationSystem?.executePhase(phase);

      expect(result?.phaseName as any).toBe('Import Cleanup');
      expect(result?.system as any).toBe('importCleanup');
      expect(result?.success as any).toBe(true);
      expect(result?.result as any).toEqual(mockResult);
      expect(result?.warnings as any).toEqual(['Warning message']);
    });

    test('executes linting formatting phase correctly': any, async (: any) => {
      const phase: any = {
        name: 'Linting and Formatting',
        description: 'Fix linting and formatting',
        system: 'lintingFormatting' as const,
        enabled: true,
        dependencies: [],;
        criticalFailure: false,
      };

      const mockResult = {
        filesProcessed: ['file1?.ts'],
        lintingViolationsFixed: 5,
        formattingIssuesFixed: 3,
        patternBasedFixesApplied: 2,
        buildValidationPassed: true,
        errors: [],
        warnings: [],
        violationBreakdown: {, typeScriptErrors: 2,
          reactViolations: 1,
          importViolations: 2,
          formattingIssues: 3,;
          customPatternFixes: 2,
        },
      };

      mockLintingFormatting?.executeLintingAndFormatting.mockResolvedValue(mockResult);

      const result: any = await automationSystem?.executePhase(phase);

      expect(result?.phaseName as any).toBe('Linting and Formatting');
      expect(result?.system as any).toBe('lintingFormatting');
      expect(result?.success as any).toBe(true);
      expect(result?.result as any).toEqual(mockResult);
    });

    test('executes dependency security phase correctly': any, async (: any) => {
      const phase: any = {
        name: 'Dependency Security',
        description: 'Monitor dependencies and security',
        system: 'dependencySecurity' as const,
        enabled: true,
        dependencies: [],;
        criticalFailure: false,
      };

      const mockResult: any = {
        dependenciesScanned: 25,
        vulnerabilitiesFound: 1,
        updatesAvailable: 3,
        updatesApplied: 2,
        securityPatchesApplied: 1,
        compatibilityTestsPassed: true,
        errors: [],
        warnings: [],
        securityReport: {, vulnerabilities: [],
          summary: { critica, l: 0, high: 1, moderate: 0, low: 0, total: 1 },
          recommendations: [],
        },
        updateReport: {, availableUpdates: [],
          appliedUpdates: [],
          failedUpdates: [],;
          summary: { majo, r: 0, minor: 1, patch: 2, security: 1, total: 3 },
        },
      };

      mockDependencySecurity?.executeDependencySecurityMonitoring.mockResolvedValue(mockResult);

      const result: any = await automationSystem?.executePhase(phase);

      expect(result?.phaseName as any).toBe('Dependency Security');
      expect(result?.system as any).toBe('dependencySecurity');
      expect(result?.success as any).toBe(true);
      expect(result?.result as any).toEqual(mockResult);
    });

    test('handles unknown system gracefully': any, async (: any) => {
      const phase: any = {
        name: 'Unknown Phase',
        description: 'Unknown system',
        system: 'unknown' as unknown,
        enabled: true,
        dependencies: [],;
        criticalFailure: false,
      };

      const result: any = await automationSystem?.executePhase(phase);

      expect(result?.success as any).toBe(false);
      expect(result?.errors).toContain('Phase execution failed: Unknown syste, m: any');
    });
  });

  describe('generateReport': any, (: any) => {
    test('generates comprehensive report': any, (: any) => {
      const mockResult = {
        overallSuccess: true,
        phasesExecuted: 2,
        phasesSucceeded: 2,
        phasesFailed: 0,
        totalExecutionTime: 5000,
        phaseResults: [
          {
            phaseName: 'Import Cleanup',
            system: 'importCleanup',
            success: true,
            executionTime: 2000,
            result: {},
            errors: [],
            warnings: ['Minor warning'],
          },
          {
            phaseName: 'Linting and Formatting',
            system: 'lintingFormatting',
            success: true,
            executionTime: 3000,
            result: {},
            errors: [],
            warnings: [],
          },
        ],
        globalMetrics: {, filesProcessed: 10,
          importIssuesFixed: 5,
          lintingViolationsFixed: 8,
          formattingIssuesFixed: 3,
          securityVulnerabilitiesFixed: 1,
          dependencyUpdatesApplied: 2,
          buildValidationsPassed: 2,
          buildValidationsFailed: 0,
        },
        errors: [],
        warnings: ['Global warning'],;
        recommendations: ['Great job!'],
      };

      const report: any = automationSystem?.generateReport(mockResult);

      expect(report).toContain('# Code Quality Automation Report');
      expect(report).toContain('**Overall Success:** ✅');
      expect(report).toContain('- Phases Executed: 2');
      expect(report).toContain('- Import Issues Fixed: 5');
      expect(report).toContain('### ✅ Import Cleanup');
      expect(report).toContain('- Minor warning');
      expect(report).toContain('## Recommendations');
      expect(report).toContain('- Great job!');
    });

    test('includes errors and warnings in report': any, (: any) => {
      const mockResult = {
        overallSuccess: false,
        phasesExecuted: 1,
        phasesSucceeded: 0,
        phasesFailed: 1,
        totalExecutionTime: 1000,
        phaseResults: [
          {
            phaseName: 'Failed Phase',
            system: 'importCleanup',
            success: false,
            executionTime: 1000,
            result: {},
            errors: ['Phase error'],
            warnings: [],
          },
        ],
        globalMetrics: {, filesProcessed: 0,
          importIssuesFixed: 0,
          lintingViolationsFixed: 0,
          formattingIssuesFixed: 0,
          securityVulnerabilitiesFixed: 0,
          dependencyUpdatesApplied: 0,
          buildValidationsPassed: 0,
          buildValidationsFailed: 1,
        },
        errors: ['Global error'],
        warnings: ['Global warning'],;
        recommendations: [],
      };

      const report: any = automationSystem?.generateReport(mockResult);

      expect(report).toContain('**Overall Success:** ❌');
      expect(report).toContain('### ❌ Failed Phase');
      expect(report).toContain('## Errors');
      expect(report).toContain('- ❌ Global error');
      expect(report).toContain('## Warnings');
      expect(report).toContain('- ⚠️ Global warning');
    });
  });

  describe('configuration validation': any, (: any) => {
    test('uses default configuration when not provided': any, (: any) => {
      const system: any = new CodeQualityAutomationSystem(DEFAULT_CODE_QUALITY_AUTOMATION_CONFIG);
      expect(system).toBeDefined();
    });

    test('respects custom configuration': any, (: any) => {
      const customConfig: CodeQualityAutomationConfig = {, importCleanup: {
          maxFilesPerBatch: 10,
          safetyValidationEnabled: false,
          buildValidationFrequency: 3,
          importStyleEnforcement: false,
          organizationRules: {, groupExternalImports: false,
            groupInternalImports: false,
            sortAlphabetically: false,
            separateTypeImports: false,
            enforceTrailingCommas: false,
            maxLineLength: 80,
          },
        },
        lintingFormatting: {, maxFilesPerBatch: 15,
          safetyValidationEnabled: false,
          buildValidationFrequency: 2,
          autoFixEnabled: false,
          formattingEnabled: false,
          lintingRules: {, enforceTypeScriptRules: false,
            enforceReactRules: false,
            enforceImportRules: false,
            maxWarningsThreshold: 500,
            customRuleOverrides: {},
          },
          formattingRules: {, enforceConsistentIndentation: false,
            enforceTrailingCommas: false,
            enforceSemicolons: false,
            enforceQuoteStyle: 'double',
            enforceLineLength: 80,
            enforceSpacing: false,
          },
          patternBasedFixes: [],
        },
        dependencySecurity: {, maxDependenciesPerBatch: 5,
          safetyValidationEnabled: false,
          autoUpdateEnabled: false,
          securityScanEnabled: false,
          compatibilityTestingEnabled: false,
          updateStrategies: [],
          securityThresholds: {, critical: 0,
            high: 0,
            moderate: 0,
            low: 0,
            autoFixCritical: false,
            autoFixHigh: false,
          },
          excludedPackages: [],
        },
        executionOrder: [],
        globalSettings: {, maxConcurrentOperations: 2,
          safetyValidationEnabled: false,
          buildValidationFrequency: 1,
          rollbackOnFailure: true,
          continueOnError: false,;
          reportingEnabled: false,
        },
      };

      const system: any = new CodeQualityAutomationSystem(customConfig);
      expect(system).toBeDefined();
    });
  });
});
