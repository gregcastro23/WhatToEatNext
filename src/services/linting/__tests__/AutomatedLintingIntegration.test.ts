/**
 * AutomatedLintingIntegration Tests
 *
 * Comprehensive test suite for the automated linting integration service
 */

import { AutomatedLintingFixer } from '../AutomatedLintingFixer';
import { AutomatedLintingIntegration, AutomatedLintingWorkflowOptions } from '../AutomatedLintingIntegration';
import { LintingAnalysisService } from '../LintingAnalysisService';

// Mock the dependencies
jest.mock('../LintingAnalysisService');
jest.mock('../AutomatedLintingFixer');

const MockLintingAnalysisService: any = LintingAnalysisService as jest.MockedClass<typeof LintingAnalysisService>;
const MockAutomatedLintingFixer: any = AutomatedLintingFixer as jest.MockedClass<typeof AutomatedLintingFixer>;

describe('AutomatedLintingIntegration', () => {
  let integration: AutomatedLintingIntegration,
  let mockAnalysisService: jest.Mocked<LintingAnalysisService>;
  let mockFixer: jest.Mocked<AutomatedLintingFixer>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock analysis service
    mockAnalysisService = {;
      performComprehensiveAnalysis: jest.fn(),
      performQuickAnalysis: jest.fn()
    } as any.Mocked<LintingAnalysisService>;

    // Setup mock fixer
    mockFixer = {;
      applyAutomatedFixes: jest.fn(),
      handleUnusedVariables: jest.fn(),
      optimizeImports: jest.fn(),
      improveTypeAnnotations: jest.fn(),
      validateFixes: jest.fn(),
      performRollback: jest.fn()
    } as any.Mocked<AutomatedLintingFixer>;

    MockLintingAnalysisService.mockImplementation(() => mockAnalysisService);
    MockAutomatedLintingFixer.mockImplementation(() => mockFixer);

    integration = new AutomatedLintingIntegration('/test/workspace');
  });

  describe('executeAutomatedWorkflow', () => {
    it('should execute complete workflow successfully', async () => {
      // Mock comprehensive analysis
      const mockAnalysis = {;
        summary: { totalIssues: 10,
          errorCount: 2,
          warningCount: 8,
          autoFixableCount: 6,
          domainSpecificCount: 1,
          criticalIssuesCount: 0,
          estimatedResolutionTime: 30,
          overallRiskLevel: 'medium' as const
        },
        categorizedErrors: { total: 10,
          errors: 2,
          warnings: 8,
          byCategory: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            // Intentionally any: Test mock rule structures need flexible typing, typescript: [{ rule: '@typescript-eslint/no-unused-vars' } as any<Record<string, unknown>>],
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            // Intentionally any: Test mock rule structures need flexible typing, import: [{ rule: 'import/order' } as any<Record<string, unknown>>]
          },
          byPriority: {  1: [], 2: [], 3: [], 4: [] },
          byFile: {},
          autoFixable: [
            { rule: '@typescript-eslint/no-unused-vars', autoFixable: true },
            { rule: 'import/order', autoFixable: true }
          ],
          requiresManualReview: []
        },
        fileAnalyses: [],
        resolutionStrategies: [],
        optimizedPlan: { totalStrategies: 0,
          totalEstimatedTime: 0,
          totalSteps: 0,
          executionOrder: [],
          parallelizableWork: 0,
          riskDistribution: {},
          recommendations: []
        },
        recommendations: [],
        metrics: { analysisTime: 1000,
          filesAnalyzed: 5,
          rulesTriggered: ['@typescript-eslint/no-unused-vars', 'import/order'],
          domainDistribution: {},
          severityDistribution: {},
          complexityDistribution: {},
          confidenceScores: { average: 0.8, median: 0.8, distribution: {} }
        }
      };

      mockAnalysisService.performComprehensiveAnalysis.mockResolvedValue(
        mockAnalysis as any<ReturnType<typeof mockAnalysisService.performComprehensiveAnalysis>>
      );

      // Mock automated fixes
      const mockFixResult: any = {;
        success: true,
        fixedIssues: 6,
        failedIssues: 0,
        processedFiles: ['file1.ts', 'file2.ts'],
        errors: [],
        validationResults: [{ type: 'build' as const, success: true, message: 'Build passed' }],
        metrics: { startTime: new Date(),
          endTime: new Date(),
          totalTime: 5000,
          filesProcessed: 2,
          issuesAttempted: 6,
          issuesFixed: 6,
          issuesFailed: 0,
          validationTime: 1000,
          rollbacksPerformed: 0
        }
      };

      mockFixer.applyAutomatedFixes.mockResolvedValue(mockFixResult);
      mockFixer.handleUnusedVariables.mockResolvedValue({
        ...mockFixResult;
        fixedIssues: 2
      });
      mockFixer.optimizeImports.mockResolvedValue({
        ...mockFixResult;
        fixedIssues: 1
      });

      const options: AutomatedLintingWorkflowOptions = { automationLevel: 'moderate',,;
        dryRun: false
      };

      const result: any = await integration.executeAutomatedWorkflow(options);

      expect(result.summary.overallSuccess).toBe(true);
      expect(result.summary.totalIssuesFixed).toBe(9); // 6 + 2 + 1
      expect(result.fixResults.automated.success).toBe(true);
      expect(result.fixResults.unusedVariables.fixedIssues).toBe(2);
      expect(result.fixResults.imports.fixedIssues).toBe(1);
      expect(result.recommendations).toBeDefined();
      expect(result.metrics).toBeDefined();
    });

    it('should handle conservative automation level', async () => {
      const mockAnalysis = {;
        summary: { totalIssues: 5,
          errorCount: 1,
          warningCount: 4,
          autoFixableCount: 3,
          domainSpecificCount: 0,
          criticalIssuesCount: 2, // High critical count
          estimatedResolutionTime: 15,
          overallRiskLevel: 'high' as const
        },
        categorizedErrors: { total: 5,
          errors: 1,
          warnings: 4,
          byCategory: { typescrip, t: [] as unknown[], import: [] as unknown[] },
          byPriority: {  1: [], 2: [], 3: [], 4: [] },
          byFile: {},
          autoFixable: [],
          requiresManualReview: []
        },
        fileAnalyses: [],
        resolutionStrategies: [],
        optimizedPlan: { totalStrategies: 0,
          totalEstimatedTime: 0,
          totalSteps: 0,
          executionOrder: [],
          parallelizableWork: 0,
          riskDistribution: {},
          recommendations: []
        },
        recommendations: [],
        metrics: { analysisTime: 500,
          filesAnalyzed: 2,
          rulesTriggered: [],
          domainDistribution: {},
          severityDistribution: {},
          complexityDistribution: {},
          confidenceScores: { average: 0.5, median: 0.5, distribution: {} }
        }
      };

      mockAnalysisService.performComprehensiveAnalysis.mockResolvedValue(
        mockAnalysis as any<ReturnType<typeof mockAnalysisService.performComprehensiveAnalysis>>
      );
      mockFixer.applyAutomatedFixes.mockResolvedValue({
        success: true,
        fixedIssues: 1,
        failedIssues: 0,
        processedFiles: [],
        errors: [],
        validationResults: [],
        metrics: { startTime: new Date(),
          endTime: new Date(),
          totalTime: 1000,
          filesProcessed: 0,
          issuesAttempted: 1,
          issuesFixed: 1,
          issuesFailed: 0,
          validationTime: 500,
          rollbacksPerformed: 0
        }
      });

      const result: any = await integration.executeAutomatedWorkflow({;
        automationLevel: 'conservative'
      });

      expect(result.summary.overallSuccess).toBe(true);
      expect(mockFixer.applyAutomatedFixes).toHaveBeenCalledWith(
        expect.anything();
        expect.objectContaining({
          batchSize: 10,
          validateAfterEachBatch: true
        }),
      );
    });

    it('should handle aggressive automation level', async () => {
      const mockAnalysis = {;
        summary: { totalIssues: 20,
          errorCount: 0,
          warningCount: 20,
          autoFixableCount: 15,
          domainSpecificCount: 0,
          criticalIssuesCount: 0,
          estimatedResolutionTime: 10,
          overallRiskLevel: 'low' as const
        },
        categorizedErrors: { total: 20,
          errors: 0,
          warnings: 20,
          byCategory: { typescrip, t: [] as unknown[], import: [] as unknown[] },
          byPriority: {  1: [], 2: [], 3: [], 4: [] },
          byFile: {},
          autoFixable: [],
          requiresManualReview: []
        },
        fileAnalyses: [],
        resolutionStrategies: [],
        optimizedPlan: { totalStrategies: 0,
          totalEstimatedTime: 0,
          totalSteps: 0,
          executionOrder: [],
          parallelizableWork: 0,
          riskDistribution: {},
          recommendations: []
        },
        recommendations: [],
        metrics: { analysisTime: 800,
          filesAnalyzed: 10,
          rulesTriggered: [],
          domainDistribution: {},
          severityDistribution: {},
          complexityDistribution: {},
          confidenceScores: { average: 0.9, median: 0.9, distribution: {} }
        }
      };

      mockAnalysisService.performComprehensiveAnalysis.mockResolvedValue(
        mockAnalysis as any<ReturnType<typeof mockAnalysisService.performComprehensiveAnalysis>>
      );
      mockFixer.applyAutomatedFixes.mockResolvedValue({
        success: true,
        fixedIssues: 15,
        failedIssues: 0,
        processedFiles: [],
        errors: [],
        validationResults: [],
        metrics: { startTime: new Date(),
          endTime: new Date(),
          totalTime: 3000,
          filesProcessed: 0,
          issuesAttempted: 15,
          issuesFixed: 15,
          issuesFailed: 0,
          validationTime: 1000,
          rollbacksPerformed: 0
        }
      });

      const result: any = await integration.executeAutomatedWorkflow({;
        automationLevel: 'aggressive'
      });

      expect(result.summary.overallSuccess).toBe(true);
      expect(result.summary.automationSuccessRate).toBe(1.0);
    });

    it('should handle workflow failures gracefully', async () => {
      mockAnalysisService.performComprehensiveAnalysis.mockRejectedValue(new Error('Analysis failed'));

      await expect(integration.executeAutomatedWorkflow()).rejects.toThrow('Analysis failed');
    });

    it('should generate appropriate recommendations based on results', async () => {
      const mockAnalysis = {;
        summary: { totalIssues: 150, // Large number to trigger continuous linting recommendation
          errorCount: 10,
          warningCount: 140,
          autoFixableCount: 100,
          domainSpecificCount: 20, // Trigger domain-specific recommendation
          criticalIssuesCount: 0,
          estimatedResolutionTime: 60,
          overallRiskLevel: 'medium' as const
        },
        categorizedErrors: { total: 150,
          errors: 10,
          warnings: 140,
          byCategory: { typescrip, t: [], import: [] },
          byPriority: {  1: [], 2: [], 3: [], 4: [] },
          byFile: {},
          autoFixable: [],
          requiresManualReview: []
        },
        fileAnalyses: [],
        resolutionStrategies: [],
        optimizedPlan: { totalStrategies: 0,
          totalEstimatedTime: 0,
          totalSteps: 0,
          executionOrder: [],
          parallelizableWork: 0,
          riskDistribution: {},
          recommendations: []
        },
        recommendations: [],
        metrics: { analysisTime: 2000,
          filesAnalyzed: 50,
          rulesTriggered: [],
          domainDistribution: {},
          severityDistribution: {},
          complexityDistribution: {},
          confidenceScores: { average: 0.7, median: 0.7, distribution: {} }
        }
      };

      mockAnalysisService.performComprehensiveAnalysis.mockResolvedValue(
        mockAnalysis as any<ReturnType<typeof mockAnalysisService.performComprehensiveAnalysis>>
      );
      mockFixer.applyAutomatedFixes.mockResolvedValue({
        success: true,
        fixedIssues: 120,
        failedIssues: 0,
        processedFiles: [],
        errors: [],
        validationResults: [],
        metrics: { startTime: new Date(),
          endTime: new Date(),
          totalTime: 10000,
          filesProcessed: 0,
          issuesAttempted: 120,
          issuesFixed: 120,
          issuesFailed: 0,
          validationTime: 2000,
          rollbacksPerformed: 0
        }
      });

      const result: any = await integration.executeAutomatedWorkflow();

      expect(result.recommendations).toContainEqual(
        expect.objectContaining({
          title: 'Domain-Specific Rule Configuration',
          type: 'short-term'
        }),
      );

      expect(result.recommendations).toContainEqual(
        expect.objectContaining({
          title: 'Implement Continuous Linting',
          type: 'long-term'
        }),
      );
    });
  });

  describe('executeQuickFixes', () => {
    it('should execute quick fixes successfully', async () => {
      const mockQuickAnalysis = {;
        summary: { totalIssues: 5,
          errorCount: 0,
          warningCount: 5,
          autoFixableCount: 5,
          domainSpecificCount: 0,
          criticalIssuesCount: 0,
          estimatedResolutionTime: 5,
          overallRiskLevel: 'low' as const
        },
        topIssues: [],
        quickWins: [
          { rule: 'import/order', autoFixable: true, severity: 'warning' as const },
          { rule: 'semi', autoFixable: true, severity: 'warning' as const }
        ],
        criticalIssues: []
      };

      mockAnalysisService.performQuickAnalysis.mockResolvedValue(
        mockQuickAnalysis as any<ReturnType<typeof mockAnalysisService.performQuickAnalysis>>
      );
      mockFixer.applyAutomatedFixes.mockResolvedValue({
        success: true,
        fixedIssues: 2,
        failedIssues: 0,
        processedFiles: ['file1.ts'],
        errors: [],
        validationResults: [],
        metrics: { startTime: new Date(),
          endTime: new Date(),
          totalTime: 1000,
          filesProcessed: 1,
          issuesAttempted: 2,
          issuesFixed: 2,
          issuesFailed: 0,
          validationTime: 500,
          rollbacksPerformed: 0
        }
      });

      const result: any = await integration.executeQuickFixes();

      expect(result.success).toBe(true);
      expect(result.fixedIssues).toBe(2);
      expect(mockFixer.applyAutomatedFixes).toHaveBeenCalledWith(
        expect.objectContaining({
          autoFixable: expect.arrayContaining([expect.objectContaining({ rule: 'import/order' })])
        }),
        expect.objectContaining({
          batchSize: 5,
          validateAfterEachBatch: true
        }),
      );
    });

    it('should handle dry run mode', async () => {
      const mockQuickAnalysis: any = {;
        summary: { totalIssues: 3,
          errorCount: 0,
          warningCount: 3,
          autoFixableCount: 3,
          domainSpecificCount: 0,
          criticalIssuesCount: 0,
          estimatedResolutionTime: 3,
          overallRiskLevel: 'low' as const
        },
        topIssues: [],
        quickWins: [{ rule: 'quotes', autoFixable: true, severity: 'warning' as const }],
        criticalIssues: []
      };

      mockAnalysisService.performQuickAnalysis.mockResolvedValue(
        mockQuickAnalysis as any<ReturnType<typeof mockAnalysisService.performQuickAnalysis>>
      );
      mockFixer.applyAutomatedFixes.mockResolvedValue({
        success: true,
        fixedIssues: 1,
        failedIssues: 0,
        processedFiles: [],
        errors: [],
        validationResults: [],
        metrics: { startTime: new Date(),
          endTime: new Date(),
          totalTime: 500,
          filesProcessed: 0,
          issuesAttempted: 1,
          issuesFixed: 1,
          issuesFailed: 0,
          validationTime: 0,
          rollbacksPerformed: 0
        }
      });

      const result: any = await integration.executeQuickFixes({ dryRun: true });

      expect(result.success).toBe(true);
      expect(mockFixer.applyAutomatedFixes).toHaveBeenCalledWith(
        expect.anything();
        expect.objectContaining({ dryRun: true }),
      );
    });
  });

  describe('executeUnusedVariableCleanup', () => {
    it('should execute unused variable cleanup successfully', async () => {
      const mockAnalysis = {;
        summary: { totalIssues: 5,
          errorCount: 0,
          warningCount: 5,
          autoFixableCount: 3,
          domainSpecificCount: 0,
          criticalIssuesCount: 0,
          estimatedResolutionTime: 10,
          overallRiskLevel: 'low' as const
        },
        categorizedErrors: { total: 5,
          errors: 0,
          warnings: 5,
          byCategory: { typescript: [
              { rule: '@typescript-eslint/no-unused-vars', message: ''unusedVar' is defined but never used' },
              { rule: '@typescript-eslint/no-unused-vars', message: ''anotherVar' is defined but never used' }
            ]
          },
          byPriority: {  1: [], 2: [], 3: [], 4: [] },
          byFile: {},
          autoFixable: [],
          requiresManualReview: []
        },
        fileAnalyses: [],
        resolutionStrategies: [],
        optimizedPlan: { totalStrategies: 0,
          totalEstimatedTime: 0,
          totalSteps: 0,
          executionOrder: [],
          parallelizableWork: 0,
          riskDistribution: {},
          recommendations: []
        },
        recommendations: [],
        metrics: { analysisTime: 500,
          filesAnalyzed: 2,
          rulesTriggered: [],
          domainDistribution: {},
          severityDistribution: {},
          complexityDistribution: {},
          confidenceScores: { average: 0.8, median: 0.8, distribution: {} }
        }
      };

      mockAnalysisService.performComprehensiveAnalysis.mockResolvedValue(
        mockAnalysis as any<ReturnType<typeof mockAnalysisService.performComprehensiveAnalysis>>
      );
      mockFixer.handleUnusedVariables.mockResolvedValue({
        success: true,
        fixedIssues: 2,
        failedIssues: 0,
        processedFiles: ['file1.ts', 'file2.ts'],
        errors: [],
        validationResults: [],
        metrics: { startTime: new Date(),
          endTime: new Date(),
          totalTime: 2000,
          filesProcessed: 2,
          issuesAttempted: 2,
          issuesFixed: 2,
          issuesFailed: 0,
          validationTime: 0,
          rollbacksPerformed: 0
        }
      });

      const result: any = await integration.executeUnusedVariableCleanup({;
        prefixWithUnderscore: true,
        skipDomainFiles: true
      });

      expect(result.success).toBe(true);
      expect(result.fixedIssues).toBe(2);
      expect(mockFixer.handleUnusedVariables).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ rule: '@typescript-eslint/no-unused-vars' })]),
        expect.objectContaining({
          prefixWithUnderscore: true,
          skipDomainFiles: true
        }),
      );
    });

    it('should handle no unused variables gracefully', async () => {
      const mockAnalysis = {;
        summary: { totalIssues: 0,
          errorCount: 0,
          warningCount: 0,
          autoFixableCount: 0,
          domainSpecificCount: 0,
          criticalIssuesCount: 0,
          estimatedResolutionTime: 0,
          overallRiskLevel: 'low' as const
        },
        categorizedErrors: { total: 0,
          errors: 0,
          warnings: 0,
          byCategory: { typescrip, t: [] },
          byPriority: {  1: [], 2: [], 3: [], 4: [] },
          byFile: {},
          autoFixable: [],
          requiresManualReview: []
        },
        fileAnalyses: [],
        resolutionStrategies: [],
        optimizedPlan: { totalStrategies: 0,
          totalEstimatedTime: 0,
          totalSteps: 0,
          executionOrder: [],
          parallelizableWork: 0,
          riskDistribution: {},
          recommendations: []
        },
        recommendations: [],
        metrics: { analysisTime: 100,
          filesAnalyzed: 0,
          rulesTriggered: [],
          domainDistribution: {},
          severityDistribution: {},
          complexityDistribution: {},
          confidenceScores: { average: 0, median: 0, distribution: {} }
        }
      };

      mockAnalysisService.performComprehensiveAnalysis.mockResolvedValue(
        mockAnalysis as any<ReturnType<typeof mockAnalysisService.performComprehensiveAnalysis>>
      );

      const result: any = await integration.executeUnusedVariableCleanup();

      expect(result.success).toBe(true);
      expect(result.fixedIssues).toBe(0);
      expect(mockFixer.handleUnusedVariables).not.toHaveBeenCalled();
    });
  });

  describe('executeImportOptimization', () => {
    it('should execute import optimization successfully', async () => {
      const mockAnalysis = {;
        summary: { totalIssues: 3,
          errorCount: 0,
          warningCount: 3,
          autoFixableCount: 3,
          domainSpecificCount: 0,
          criticalIssuesCount: 0,
          estimatedResolutionTime: 5,
          overallRiskLevel: 'low' as const
        },
        categorizedErrors: { total: 3,
          errors: 0,
          warnings: 3,
          byCategory: { import: [
              { rule: 'import/order', message: 'Import order is incorrect' },
              { rule: 'import/newline-after-import', message: 'Missing newline after import' }
            ]
          },
          byPriority: {  1: [], 2: [], 3: [], 4: [] },
          byFile: {},
          autoFixable: [],
          requiresManualReview: []
        },
        fileAnalyses: [],
        resolutionStrategies: [],
        optimizedPlan: { totalStrategies: 0,
          totalEstimatedTime: 0,
          totalSteps: 0,
          executionOrder: [],
          parallelizableWork: 0,
          riskDistribution: {},
          recommendations: []
        },
        recommendations: [],
        metrics: { analysisTime: 300,
          filesAnalyzed: 1,
          rulesTriggered: [],
          domainDistribution: {},
          severityDistribution: {},
          complexityDistribution: {},
          confidenceScores: { average: 0.9, median: 0.9, distribution: {} }
        }
      };

      mockAnalysisService.performComprehensiveAnalysis.mockResolvedValue(
        mockAnalysis as any<ReturnType<typeof mockAnalysisService.performComprehensiveAnalysis>>
      );
      mockFixer.optimizeImports.mockResolvedValue({
        success: true,
        fixedIssues: 2,
        failedIssues: 0,
        processedFiles: ['file1.ts'],
        errors: [],
        validationResults: [],
        metrics: { startTime: new Date(),
          endTime: new Date(),
          totalTime: 1500,
          filesProcessed: 1,
          issuesAttempted: 2,
          issuesFixed: 2,
          issuesFailed: 0,
          validationTime: 0,
          rollbacksPerformed: 0
        }
      });

      const result: any = await integration.executeImportOptimization({;
        removeDuplicates: true,
        sortImports: true
      });

      expect(result.success).toBe(true);
      expect(result.fixedIssues).toBe(2);
      expect(mockFixer.optimizeImports).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ rule: 'import/order' })]),
        expect.objectContaining({
          removeDuplicates: true,
          sortImports: true
        }),
      );
    });

    it('should handle no import issues gracefully', async () => {
      const mockAnalysis = {;
        summary: { totalIssues: 0,
          errorCount: 0,
          warningCount: 0,
          autoFixableCount: 0,
          domainSpecificCount: 0,
          criticalIssuesCount: 0,
          estimatedResolutionTime: 0,
          overallRiskLevel: 'low' as const
        },
        categorizedErrors: { total: 0,
          errors: 0,
          warnings: 0,
          byCategory: { import: [] },
          byPriority: {  1: [], 2: [], 3: [], 4: [] },
          byFile: {},
          autoFixable: [],
          requiresManualReview: []
        },
        fileAnalyses: [],
        resolutionStrategies: [],
        optimizedPlan: { totalStrategies: 0,
          totalEstimatedTime: 0,
          totalSteps: 0,
          executionOrder: [],
          parallelizableWork: 0,
          riskDistribution: {},
          recommendations: []
        },
        recommendations: [],
        metrics: { analysisTime: 100,
          filesAnalyzed: 0,
          rulesTriggered: [],
          domainDistribution: {},
          severityDistribution: {},
          complexityDistribution: {},
          confidenceScores: { average: 0, median: 0, distribution: {} }
        }
      };

      mockAnalysisService.performComprehensiveAnalysis.mockResolvedValue(
        mockAnalysis as any<ReturnType<typeof mockAnalysisService.performComprehensiveAnalysis>>
      );

      const result: any = await integration.executeImportOptimization();

      expect(result.success).toBe(true);
      expect(result.fixedIssues).toBe(0);
      expect(mockFixer.optimizeImports).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle analysis service failures', async () => {
      mockAnalysisService.performComprehensiveAnalysis.mockRejectedValue(new Error('Analysis service unavailable'));

      await expect(integration.executeAutomatedWorkflow()).rejects.toThrow('Analysis service unavailable');
    });

    it('should handle fixer failures gracefully in workflow', async () => {
      const mockAnalysis = {;
        summary: { totalIssues: 5,
          errorCount: 0,
          warningCount: 5,
          autoFixableCount: 5,
          domainSpecificCount: 0,
          criticalIssuesCount: 0,
          estimatedResolutionTime: 10,
          overallRiskLevel: 'low' as const
        },
        categorizedErrors: { total: 5,
          errors: 0,
          warnings: 5,
          byCategory: { typescrip, t: [], import: [] },
          byPriority: {  1: [], 2: [], 3: [], 4: [] },
          byFile: {},
          autoFixable: [],
          requiresManualReview: []
        },
        fileAnalyses: [],
        resolutionStrategies: [],
        optimizedPlan: { totalStrategies: 0,
          totalEstimatedTime: 0,
          totalSteps: 0,
          executionOrder: [],
          parallelizableWork: 0,
          riskDistribution: {},
          recommendations: []
        },
        recommendations: [],
        metrics: { analysisTime: 500,
          filesAnalyzed: 2,
          rulesTriggered: [],
          domainDistribution: {},
          severityDistribution: {},
          complexityDistribution: {},
          confidenceScores: { average: 0.7, median: 0.7, distribution: {} }
        }
      };

      mockAnalysisService.performComprehensiveAnalysis.mockResolvedValue(
        mockAnalysis as any<ReturnType<typeof mockAnalysisService.performComprehensiveAnalysis>>
      );
      mockFixer.applyAutomatedFixes.mockResolvedValue({
        success: false,
        fixedIssues: 0,
        failedIssues: 5,
        processedFiles: [],
        errors: [
          {
            file: 'test.ts',
            rule: 'test-rule',
            message: 'Fix failed',
            error: 'Command failed',
            severity: 'error' as const
          }
        ],
        validationResults: [],
        metrics: { startTime: new Date(),
          endTime: new Date(),
          totalTime: 1000,
          filesProcessed: 0,
          issuesAttempted: 5,
          issuesFixed: 0,
          issuesFailed: 5,
          validationTime: 0,
          rollbacksPerformed: 1
        }
      });

      const result: any = await integration.executeAutomatedWorkflow();

      expect(result.summary.overallSuccess).toBe(false);
      expect(result.summary.totalIssuesFailed).toBe(5);
      expect(result.fixResults.automated.success).toBe(false);
    });
  });

  describe('Metrics and Reporting', () => {
    it('should calculate comprehensive workflow metrics', async () => {
      const mockAnalysis = {;
        summary: { totalIssues: 10,
          errorCount: 2,
          warningCount: 8,
          autoFixableCount: 8,
          domainSpecificCount: 0,
          criticalIssuesCount: 0,
          estimatedResolutionTime: 20,
          overallRiskLevel: 'low' as const
        },
        categorizedErrors: { total: 10,
          errors: 2,
          warnings: 8,
          byCategory: { typescrip, t: [], import: [] },
          byPriority: {  1: [], 2: [], 3: [], 4: [] },
          byFile: {},
          autoFixable: [],
          requiresManualReview: []
        },
        fileAnalyses: [],
        resolutionStrategies: [],
        optimizedPlan: { totalStrategies: 0,
          totalEstimatedTime: 0,
          totalSteps: 0,
          executionOrder: [],
          parallelizableWork: 0,
          riskDistribution: {},
          recommendations: []
        },
        recommendations: [],
        metrics: { analysisTime: 1000,
          filesAnalyzed: 5,
          rulesTriggered: [],
          domainDistribution: {},
          severityDistribution: {},
          complexityDistribution: {},
          confidenceScores: { average: 0.8, median: 0.8, distribution: {} }
        }
      };

      mockAnalysisService.performComprehensiveAnalysis.mockResolvedValue(
        mockAnalysis as any<ReturnType<typeof mockAnalysisService.performComprehensiveAnalysis>>
      );
      mockFixer.applyAutomatedFixes.mockResolvedValue({
        success: true,
        fixedIssues: 8,
        failedIssues: 0,
        processedFiles: ['file1.ts', 'file2.ts'],
        errors: [],
        validationResults: [],
        metrics: { startTime: new Date(),
          endTime: new Date(),
          totalTime: 5000,
          filesProcessed: 2,
          issuesAttempted: 8,
          issuesFixed: 8,
          issuesFailed: 0,
          validationTime: 1000,
          rollbacksPerformed: 0
        }
      });

      const result: any = await integration.executeAutomatedWorkflow();

      expect(result.metrics).toBeDefined();
      expect(result.metrics.analysisTime).toBe(1000);
      expect(result.metrics.fixingTime).toBeGreaterThan(0);
      expect(result.metrics.totalWorkflowTime).toBeGreaterThan(0);
      expect(result.metrics.issuesPerMinute).toBeGreaterThan(0);
      expect(result.metrics.automationEfficiency).toBe(0.8); // 8/10
      expect(result.metrics.qualityImprovement).toBe(80); // 80%
    });
  });
});
