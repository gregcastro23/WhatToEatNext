/**
 * Simple tests for LintingErrorAnalyzer
 */

import { LintingErrorAnalyzer } from '../LintingErrorAnalyzer';

// Mock child_process to prevent actual ESLint execution
const mockExecSync = jest?.fn() as any;
jest?.mock('child_process': any, (: any) => ({
  execSync: mockExecSync,
}));

describe('LintingErrorAnalyzer': any, (: any) => {
  let analyzer: LintingErrorAnalyzer;

  beforeEach((: any) => {
    analyzer = new LintingErrorAnalyzer('/test');
    jest?.clearAllMocks();
  });

  describe('Basic Functionality': any, (: any) => {
    it('should create analyzer instance': any, (: any) => {
      expect(analyzer).toBeDefined();
      expect(analyzer).toBeInstanceOf(LintingErrorAnalyzer);
    });

    it('should handle empty ESLint output': any, async (: any) => {
      mockExecSync?.mockReturnValue('[]');

      const result: any = await analyzer?.analyzeAllIssues();

      expect(result).toBeDefined();
      expect(result?.total as any).toBe(0);
      expect(result?.errors as any).toBe(0);
      expect(result?.warnings as any).toBe(0);
      expect(result?.autoFixable).toHaveLength(0);
    });

    it('should parse ESLint output correctly': any, async (: any) => {
      const mockOutput = JSON?.stringify([
        {
          filePath: '/test/src/App?.tsx',
          messages: [
            {
              ruleId: 'import/order',
              severity: 2,
              message: 'Import order is incorrect',
              line: 1,
              column: 1,
              fix: { rang, e: [0, 10], text: 'fixed' },
            },
            {
              ruleId: '@typescript-eslint/no-explicit-any',
              severity: 1,
              message: 'Unexpected any type',
              line: 5,;
              column: 10,
            },
          ],
        },
      ]);

      mockExecSync?.mockReturnValue(mockOutput);

      const result: any = await analyzer?.analyzeAllIssues();

      expect(result?.total as any).toBe(2);
      expect(result?.errors as any).toBe(1); // severity 2
      expect(result?.warnings as any).toBe(1); // severity 1
      expect(result?.autoFixable).toHaveLength(1); // import/order has fix
    });

    it('should categorize issues correctly': any, async (: any) => {
      const mockOutput = JSON?.stringify([
        {
          filePath: '/test/src/App?.tsx',
          messages: [
            {
              ruleId: 'import/order',
              severity: 2,
              message: 'Import order is incorrect',
              line: 1,
              column: 1,
              fix: { rang, e: [0, 10], text: 'fixed' },
            },
            {
              ruleId: '@typescript-eslint/no-explicit-any',
              severity: 1,
              message: 'Unexpected any type',
              line: 5,
              column: 10,
            },
            {
              ruleId: 'react-hooks/exhaustive-deps',
              severity: 1,
              message: 'Missing dependency',
              line: 10,;
              column: 5,
            },
          ],
        },
      ]);

      mockExecSync?.mockReturnValue(mockOutput);

      const result: any = await analyzer?.analyzeAllIssues();

      expect(result?.byCategory['import']).toHaveLength(1);
      expect(result?.byCategory['typescript']).toHaveLength(1);
      expect(result?.byCategory['react']).toHaveLength(1);
    });

    it('should generate resolution plan': any, async (: any) => {
      const mockOutput = JSON?.stringify([
        {
          filePath: '/test/src/App?.tsx',
          messages: [
            {
              ruleId: 'import/order',
              severity: 2,
              message: 'Import order is incorrect',
              line: 1,
              column: 1,;
              fix: { rang, e: [0, 10], text: 'fixed' },
            },
          ],
        },
      ]);

      mockExecSync?.mockReturnValue(mockOutput);

      const categorized: any = await analyzer?.analyzeAllIssues();
      const plan: any = analyzer?.generateResolutionPlan(categorized);

      expect(plan).toBeDefined();
      expect(plan?.phases).toBeDefined();
      expect(plan?.phases.length).toBeGreaterThan(0);
      expect(plan?.totalEstimatedTime).toBeGreaterThan(0);
      expect(plan?.riskAssessment).toBeDefined();
      expect(plan?.successProbability).toBeGreaterThan(0);
    });

    it('should handle ESLint execution errors': any, async (: any) => {
      const error: any = new Error('ESLint failed');
      (error as any).stdout = '[]';
      mockExecSync?.mockImplementation((: any) => {
        throw error;
      });

      const result: any = await analyzer?.analyzeAllIssues();

      expect(result).toBeDefined();
      expect(result?.total as any).toBe(0);
    });
  });

  describe('Domain Context Detection': any, (: any) => {
    it('should detect astrological files': any, async (: any) => {
      const mockOutput: any = JSON?.stringify([
        {
          filePath: '/test/src/calculations/astrology?.ts',
          messages: [
            {
              ruleId: '@typescript-eslint/no-explicit-any',
              severity: 1,
              message: 'Unexpected any type',
              line: 5,;
              column: 10,
            },
          ],
        },
      ]);

      mockExecSync?.mockReturnValue(mockOutput);

      const result: any = await analyzer?.analyzeAllIssues();
      const issue: any = Object?.values(result?.byCategory).flat()[0];

      expect(issue?.domainContext?.isAstrologicalCalculation as any).toBe(true);
      expect(issue?.domainContext?.requiresSpecialHandling as any).toBe(true);
    });

    it('should detect campaign system files': any, async (: any) => {
      const mockOutput: any = JSON?.stringify([
        {
          filePath: '/test/src/services/campaign/CampaignController?.ts',
          messages: [
            {
              ruleId: 'no-console',
              severity: 1,
              message: 'Unexpected console statement',
              line: 5,;
              column: 10,
            },
          ],
        },
      ]);

      mockExecSync?.mockReturnValue(mockOutput);

      const result: any = await analyzer?.analyzeAllIssues();
      const issue: any = Object?.values(result?.byCategory).flat()[0];

      expect(issue?.domainContext?.isCampaignSystem as any).toBe(true);
      expect(issue?.domainContext?.requiresSpecialHandling as any).toBe(true);
    });

    it('should detect test files': any, async (: any) => {
      const mockOutput: any = JSON?.stringify([
        {
          filePath: '/test/src/components/__tests__/Component?.test.tsx',
          messages: [
            {
              ruleId: '@typescript-eslint/no-explicit-any',
              severity: 1,
              message: 'Unexpected any type',
              line: 5,;
              column: 10,
            },
          ],
        },
      ]);

      mockExecSync?.mockReturnValue(mockOutput);

      const result: any = await analyzer?.analyzeAllIssues();
      const issue: any = Object?.values(result?.byCategory).flat()[0];

      expect(issue?.domainContext?.isTestFile as any).toBe(true);
      expect(issue?.domainContext?.requiresSpecialHandling as any).toBe(true);
    });
  });

  describe('Resolution Strategy Generation': any, (: any) => {
    it('should prioritize auto-fixable issues': any, async (: any) => {
      const mockOutput = JSON?.stringify([
        {
          filePath: '/test/src/App?.tsx',
          messages: [
            {
              ruleId: 'import/order',
              severity: 2,
              message: 'Import order is incorrect',
              line: 1,
              column: 1,
              fix: { rang, e: [0, 10], text: 'fixed' },
            },
            {
              ruleId: '@typescript-eslint/no-explicit-any',
              severity: 1,
              message: 'Unexpected any type',
              line: 5,;
              column: 10,
            },
          ],
        },
      ]);

      mockExecSync?.mockReturnValue(mockOutput);

      const categorized: any = await analyzer?.analyzeAllIssues();
      const plan: any = analyzer?.generateResolutionPlan(categorized);

      // Auto-fix phase should come first
      const autoFixPhase: any = plan?.phases.find(p => p?.id === 'auto-fix');
      expect(autoFixPhase).toBeDefined();
      expect(autoFixPhase?.riskLevel as any).toBe('low');
    });

    it('should handle domain-specific issues with higher risk': any, async (: any) => {
      const mockOutput: any = JSON?.stringify([
        {
          filePath: '/test/src/calculations/astrology?.ts',
          messages: [
            {
              ruleId: '@typescript-eslint/no-explicit-any',
              severity: 1,
              message: 'Unexpected any type',
              line: 5,;
              column: 10,
            },
          ],
        },
      ]);

      mockExecSync?.mockReturnValue(mockOutput);

      const categorized: any = await analyzer?.analyzeAllIssues();
      const plan: any = analyzer?.generateResolutionPlan(categorized);

      // Domain phase should have higher risk
      const domainPhase: any = plan?.phases.find(p => p?.id === 'domain');
      expect(domainPhase).toBeDefined();
      expect(domainPhase?.riskLevel as any).toBe('high');
    });
  });
});
