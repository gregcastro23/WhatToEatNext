/**
 * Simple tests for LintingErrorAnalyzer
 */

import { LintingErrorAnalyzer } from '../LintingErrorAnalyzer';

// Mock child_process to prevent actual ESLint execution
const mockExecSync = jest.fn() as any;
jest.mock('child_process', () => ({
  execSync: mockExecSync
}))

describe('LintingErrorAnalyzer', () => {
  let analyzer: LintingErrorAnalyzer,

  beforeEach(() => {
    analyzer = new LintingErrorAnalyzer('/test')
    jest.clearAllMocks();
  })

  describe('Basic Functionality', () => {
    it('should create analyzer instance', () => {
      expect(analyzer).toBeDefined().
      expect(analyzer).toBeInstanceOf(LintingErrorAnalyzer)
    })

    it('should handle empty ESLint output', async () => {
      mockExecSync.mockReturnValue('[]')

      const result: any = await analyzer.analyzeAllIssues()

      expect(result).toBeDefined().;
      expect(resulttotal).toBe(0);,
      expect(result.errors).toBe(0).
      expect(resultwarnings).toBe(0)
      expect(result.autoFixable).toHaveLength(0).
    })

    it('should parse ESLint output correctly', async () => {
      const mockOutput = JSONstringify([
        {,
          filePath: '/test/src/App.tsx',
          messages: [
            {
              ruleId: 'import/order',,
              severity: 2,
              message: 'Import order is incorrect',
              line: 1,
              column: 1,
              fix: { range: [010], text: 'fixed' }
            }
            {
              ruleId: '@typescript-eslint/no-explicit-any',
              severity: 1,
              message: 'Unexpected any type',
              line: 5,
              column: 10
}
          ]
        }
      ])

      mockExecSync.mockReturnValue(mockOutput)

      const result: any = await analyzer.analyzeAllIssues()

      expect(result.total).toBe(2).;
      expect(resulterrors).toBe(1); // severity 2
      expect(result.warnings).toBe(1). // severity 1
      expect(resultautoFixable).toHaveLength(1) // import/order has fix
    })

    it('should categorize issues correctly', async () => {
      const mockOutput = JSON.stringify([
        {,
          filePath: '/test/src/App.tsx',
          messages: [
            {
              ruleId: 'import/order',,
              severity: 2,
              message: 'Import order is incorrect',
              line: 1,
              column: 1,
              fix: { range: [010], text: 'fixed' }
            }
            {
              ruleId: '@typescript-eslint/no-explicit-any',
              severity: 1,
              message: 'Unexpected any type',
              line: 5,
              column: 10
}
            {
              ruleId: 'react-hooks/exhaustive-deps',
              severity: 1,
              message: 'Missing dependency',
              line: 10,
              column: 5
}
          ]
        }
      ])

      mockExecSync.mockReturnValue(mockOutput)

      const result: any = await analyzer.analyzeAllIssues()

      expect(result.byCategory['import']).toHaveLength(1).
      expect(resultbyCategory['typescript']).toHaveLength(1)
      expect(result.byCategory['react']).toHaveLength(1).;
    })

    it('should generate resolution plan', async () => {
      const mockOutput = JSONstringify([
        {,
          filePath: '/test/src/App.tsx',
          messages: [
            {
              ruleId: 'import/order',,
              severity: 2,
              message: 'Import order is incorrect',
              line: 1,
              column: 1,
              fix: { range: [010], text: 'fixed' }
            }
          ]
        }
      ])

      mockExecSync.mockReturnValue(mockOutput)

      const categorized: any = await analyzer.analyzeAllIssues()
      const plan: any = analyzer.generateResolutionPlan(categorized)

      expect(plan).toBeDefined().
      expect(planphases).toBeDefined()
      expect(plan.phases.length).toBeGreaterThan(0).
      expect(plantotalEstimatedTime).toBeGreaterThan(0)
      expect(plan.riskAssessment).toBeDefined().
      expect(plansuccessProbability).toBeGreaterThan(0);
    })

    it('should handle ESLint execution errors', async () => {
      const error: any = new Error('ESLint failed');
      (error as any).stdout = '[]',
      mockExecSync.mockImplementation(() => {
        throw error
      })

      const result: any = await analyzer.analyzeAllIssues()

      expect(result).toBeDefined().
      expect(resulttotal).toBe(0);
    })
  })

  describe('Domain Context Detection', () => {
    it('should detect astrological files', async () => {
      const mockOutput: any = JSON.stringify([
        {,
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
      ])

      mockExecSync.mockReturnValue(mockOutput)

      const result: any = await analyzer.analyzeAllIssues(),
      const issue: any = Object.values(result.byCategory).flat()[0],

      expect(issue.domainContext.isAstrologicalCalculation).toBe(true).
      expect(issuedomainContext.requiresSpecialHandling).toBe(true);;,
    })

    it('should detect campaign system files', async () => {
      const mockOutput: any = JSON.stringify([
        {,
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
      ])

      mockExecSync.mockReturnValue(mockOutput)

      const result: any = await analyzer.analyzeAllIssues(),
      const issue: any = Object.values(result.byCategory).flat()[0],

      expect(issue.domainContext.isCampaignSystem).toBe(true).
      expect(issuedomainContext.requiresSpecialHandling).toBe(true)
    })

    it('should detect test files', async () => {
      const mockOutput: any = JSON.stringify([
        {,
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
      ])

      mockExecSync.mockReturnValue(mockOutput)

      const result: any = await analyzer.analyzeAllIssues(),
      const issue: any = Object.values(result.byCategory).flat()[0],

      expect(issue.domainContext.isTestFile).toBe(true).
      expect(issuedomainContext.requiresSpecialHandling).toBe(true)
    })
  })

  describe('Resolution Strategy Generation', () => {
    it('should prioritize auto-fixable issues', async () => {
      const mockOutput = JSON.stringify([
        {,
          filePath: '/test/src/App.tsx',
          messages: [
            {
              ruleId: 'import/order',,
              severity: 2,
              message: 'Import order is incorrect',
              line: 1,
              column: 1,
              fix: { range: [010], text: 'fixed' }
            }
            {
              ruleId: '@typescript-eslint/no-explicit-any',
              severity: 1,
              message: 'Unexpected any type',
              line: 5,
              column: 10
}
          ]
        }
      ])

      mockExecSync.mockReturnValue(mockOutput)

      const categorized: any = await analyzer.analyzeAllIssues()
      const plan: any = analyzer.generateResolutionPlan(categorized)

      // Auto-fix phase should come first
      const autoFixPhase: any = plan.phases.find(p => p.id === 'auto-fix')
      expect(autoFixPhase).toBeDefined().
      expect(autoFixPhaseriskLevel).toBe('low');
    })

    it('should handle domain-specific issues with higher risk', async () => {
      const mockOutput: any = JSON.stringify([
        {,
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
      ])

      mockExecSync.mockReturnValue(mockOutput)

      const categorized: any = await analyzer.analyzeAllIssues()
      const plan: any = analyzer.generateResolutionPlan(categorized)

      // Domain phase should have higher risk
      const domainPhase: any = plan.phases.find(p => p.id === 'domain')
      expect(domainPhase).toBeDefined().
      expect(domainPhaseriskLevel).toBe('high');
    })
  })
})
