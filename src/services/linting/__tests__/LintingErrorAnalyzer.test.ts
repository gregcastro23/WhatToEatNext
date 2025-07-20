/**
 * Simple tests for LintingErrorAnalyzer
 */

import { LintingErrorAnalyzer } from '../LintingErrorAnalyzer';

// Mock child_process to prevent actual ESLint execution
const mockExecSync = jest.fn();
jest.mock('child_process', () => ({
  execSync: mockExecSync
}));

describe('LintingErrorAnalyzer', () => {
  let analyzer: LintingErrorAnalyzer;

  beforeEach(() => {
    analyzer = new LintingErrorAnalyzer('/test');
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should create analyzer instance', () => {
      expect(analyzer).toBeDefined();
      expect(analyzer).toBeInstanceOf(LintingErrorAnalyzer);
    });

    it('should handle empty ESLint output', async () => {
      mockExecSync.mockReturnValue('[]');
      
      const result = await analyzer.analyzeAllIssues();
      
      expect(result).toBeDefined();
      expect(result.total).toBe(0);
      expect(result.errors).toBe(0);
      expect(result.warnings).toBe(0);
      expect(result.autoFixable).toHaveLength(0);
    });

    it('should parse ESLint output correctly', async () => {
      const mockOutput = JSON.stringify([
        {
          filePath: '/test/src/App.tsx',
          messages: [
            {
              ruleId: 'import/order',
              severity: 2,
              message: 'Import order is incorrect',
              line: 1,
              column: 1,
              fix: { range: [0, 10], text: 'fixed' }
            },
            {
              ruleId: '@typescript-eslint/no-explicit-any',
              severity: 1,
              message: 'Unexpected any type',
              line: 5,
              column: 10
            }
          ]
        }
      ]);
      
      mockExecSync.mockReturnValue(mockOutput);
      
      const result = await analyzer.analyzeAllIssues();
      
      expect(result.total).toBe(2);
      expect(result.errors).toBe(1); // severity 2
      expect(result.warnings).toBe(1); // severity 1
      expect(result.autoFixable).toHaveLength(1); // import/order has fix
    });

    it('should categorize issues correctly', async () => {
      const mockOutput = JSON.stringify([
        {
          filePath: '/test/src/App.tsx',
          messages: [
            {
              ruleId: 'import/order',
              severity: 2,
              message: 'Import order is incorrect',
              line: 1,
              column: 1,
              fix: { range: [0, 10], text: 'fixed' }
            },
            {
              ruleId: '@typescript-eslint/no-explicit-any',
              severity: 1,
              message: 'Unexpected any type',
              line: 5,
              column: 10
            },
            {
              ruleId: 'react-hooks/exhaustive-deps',
              severity: 1,
              message: 'Missing dependency',
              line: 10,
              column: 5
            }
          ]
        }
      ]);
      
      mockExecSync.mockReturnValue(mockOutput);
      
      const result = await analyzer.analyzeAllIssues();
      
      expect(result.byCategory['import']).toHaveLength(1);
      expect(result.byCategory['typescript']).toHaveLength(1);
      expect(result.byCategory['react']).toHaveLength(1);
    });

    it('should generate resolution plan', async () => {
      const mockOutput = JSON.stringify([
        {
          filePath: '/test/src/App.tsx',
          messages: [
            {
              ruleId: 'import/order',
              severity: 2,
              message: 'Import order is incorrect',
              line: 1,
              column: 1,
              fix: { range: [0, 10], text: 'fixed' }
            }
          ]
        }
      ]);
      
      mockExecSync.mockReturnValue(mockOutput);
      
      const categorized = await analyzer.analyzeAllIssues();
      const plan = analyzer.generateResolutionPlan(categorized);
      
      expect(plan).toBeDefined();
      expect(plan.phases).toBeDefined();
      expect(plan.phases.length).toBeGreaterThan(0);
      expect(plan.totalEstimatedTime).toBeGreaterThan(0);
      expect(plan.riskAssessment).toBeDefined();
      expect(plan.successProbability).toBeGreaterThan(0);
    });

    it('should handle ESLint execution errors', async () => {
      const error = new Error('ESLint failed');
      (error as any).stdout = '[]';
      mockExecSync.mockImplementation(() => {
        throw error;
      });
      
      const result = await analyzer.analyzeAllIssues();
      
      expect(result).toBeDefined();
      expect(result.total).toBe(0);
    });
  });

  describe('Domain Context Detection', () => {
    it('should detect astrological files', async () => {
      const mockOutput = JSON.stringify([
        {
          filePath: '/test/src/calculations/astrology.ts',
          messages: [
            {
              ruleId: '@typescript-eslint/no-explicit-any',
              severity: 1,
              message: 'Unexpected any type',
              line: 5,
              column: 10
            }
          ]
        }
      ]);
      
      mockExecSync.mockReturnValue(mockOutput);
      
      const result = await analyzer.analyzeAllIssues();
      const issue = Object.values(result.byCategory).flat()[0];
      
      expect(issue.domainContext?.isAstrologicalCalculation).toBe(true);
      expect(issue.domainContext?.requiresSpecialHandling).toBe(true);
    });

    it('should detect campaign system files', async () => {
      const mockOutput = JSON.stringify([
        {
          filePath: '/test/src/services/campaign/CampaignController.ts',
          messages: [
            {
              ruleId: 'no-console',
              severity: 1,
              message: 'Unexpected console statement',
              line: 5,
              column: 10
            }
          ]
        }
      ]);
      
      mockExecSync.mockReturnValue(mockOutput);
      
      const result = await analyzer.analyzeAllIssues();
      const issue = Object.values(result.byCategory).flat()[0];
      
      expect(issue.domainContext?.isCampaignSystem).toBe(true);
      expect(issue.domainContext?.requiresSpecialHandling).toBe(true);
    });

    it('should detect test files', async () => {
      const mockOutput = JSON.stringify([
        {
          filePath: '/test/src/components/__tests__/Component.test.tsx',
          messages: [
            {
              ruleId: '@typescript-eslint/no-explicit-any',
              severity: 1,
              message: 'Unexpected any type',
              line: 5,
              column: 10
            }
          ]
        }
      ]);
      
      mockExecSync.mockReturnValue(mockOutput);
      
      const result = await analyzer.analyzeAllIssues();
      const issue = Object.values(result.byCategory).flat()[0];
      
      expect(issue.domainContext?.isTestFile).toBe(true);
      expect(issue.domainContext?.requiresSpecialHandling).toBe(true);
    });
  });

  describe('Resolution Strategy Generation', () => {
    it('should prioritize auto-fixable issues', async () => {
      const mockOutput = JSON.stringify([
        {
          filePath: '/test/src/App.tsx',
          messages: [
            {
              ruleId: 'import/order',
              severity: 2,
              message: 'Import order is incorrect',
              line: 1,
              column: 1,
              fix: { range: [0, 10], text: 'fixed' }
            },
            {
              ruleId: '@typescript-eslint/no-explicit-any',
              severity: 1,
              message: 'Unexpected any type',
              line: 5,
              column: 10
            }
          ]
        }
      ]);
      
      mockExecSync.mockReturnValue(mockOutput);
      
      const categorized = await analyzer.analyzeAllIssues();
      const plan = analyzer.generateResolutionPlan(categorized);
      
      // Auto-fix phase should come first
      const autoFixPhase = plan.phases.find(p => p.id === 'auto-fix');
      expect(autoFixPhase).toBeDefined();
      expect(autoFixPhase?.riskLevel).toBe('low');
    });

    it('should handle domain-specific issues with higher risk', async () => {
      const mockOutput = JSON.stringify([
        {
          filePath: '/test/src/calculations/astrology.ts',
          messages: [
            {
              ruleId: '@typescript-eslint/no-explicit-any',
              severity: 1,
              message: 'Unexpected any type',
              line: 5,
              column: 10
            }
          ]
        }
      ]);
      
      mockExecSync.mockReturnValue(mockOutput);
      
      const categorized = await analyzer.analyzeAllIssues();
      const plan = analyzer.generateResolutionPlan(categorized);
      
      // Domain phase should have higher risk
      const domainPhase = plan.phases.find(p => p.id === 'domain');
      expect(domainPhase).toBeDefined();
      expect(domainPhase?.riskLevel).toBe('high');
    });
  });
});