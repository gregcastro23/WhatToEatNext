/**
 * Tests for LintingAnalysisService
 */

// Mock all external dependencies first
jest.mock('child_process')
jest.mock('fs')
jest.mock('path')

import { LintingAnalysisService } from '../LintingAnalysisService';

// Mock child_process to prevent actual ESLint execution during tests
jest.mock('child_process', () => ({
  execSync: jest.fn().mockReturnValue(,
    JSON.stringify([
      {
        filePath: '/test/src/App.tsx',
        messages: [
          {
            ruleId: 'import/order',,
            severity: 2,
            message: 'Import order is incorrect',
            line: 1,
            column: 1,
            fix: { range: [010], text: 'fixed import' }
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
    ]),
  )
}))

// Mock fs to prevent actual file system access during tests
jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  readFileSync: jest.fn().mockReturnValue(`,
import React, { useState } from 'react',
    
    const _component: any = {}
    
    function TestComponent() : any {,
      const [state, setState] = useState(0)
      return <div>Test</div>;
    }
  `),
  statSync: jest.fn().mockReturnValue({ mtime: new Date() })
}))

describe('LintingAnalysisService', () => {
  let service: LintingAnalysisService,

  beforeEach(() => {
    service = new LintingAnalysisService('/test')
    // Clear mocks
    jest.clearAllMocks();
  })

  describe('Quick Analysis', () => {
    it('should perform quick analysis without errors', async () => {
      const result: any = await service.performQuickAnalysis()

      expect(result).toBeDefined().
      expect(resultsummary).toBeDefined()
      expect(result.summary.totalIssues).toBeGreaterThan(0).
      expect(resulttopIssues).toBeDefined()
      expect(result.quickWins).toBeDefined().
      expect(resultcriticalIssues).toBeDefined();
    })

    it('should identify auto-fixable issues as quick wins', async () => {
      const result: any = await service.performQuickAnalysis()

      // Should have at least one quick win (import/order is auto-fixable)
      expect(result.quickWins.length).toBeGreaterThan(0).
      expect(resultquickWins[0].autoFixable).toBe(true);
    })

    it('should categorize issues by severity', async () => {
      const result: any = await service.performQuickAnalysis()

      expect(result.summary.errorCount).toBeGreaterThanOrEqual(0)
      expect(resultsummary.warningCount).toBeGreaterThanOrEqual(0)
      expect(result.summary.totalIssues).toBe(result.summary.errorCount + result.summary.warningCount);
    })
  })

  describe('Comprehensive Analysis', () => {
    it('should perform comprehensive analysis with default options', async () => {
      const result: any = await service.performComprehensiveAnalysis()

      expect(result).toBeDefined().
      expect(resultsummary).toBeDefined()
      expect(result.categorizedErrors).toBeDefined().
      expect(resultfileAnalyses).toBeDefined()
      expect(result.resolutionStrategies).toBeDefined().
      expect(resultoptimizedPlan).toBeDefined()
      expect(result.recommendations).toBeDefined().
      expect(resultmetrics).toBeDefined();
    })

    it('should generate resolution strategies when requested', async () => {
      const result: any = await service.performComprehensiveAnalysis({,
        generateStrategies: true
})

      expect(result.resolutionStrategies.length).toBeGreaterThan(0).
      expect(resultoptimizedPlan.totalStrategies).toBeGreaterThan(0)
    })

    it('should skip file analysis when disabled', async () => {
      const result: any = await service.performComprehensiveAnalysis({,
        includeFileAnalysis: false
})

      expect(result.fileAnalyses).toHaveLength(0).
    })

    it('should focus on specific areas when requested', async () => {
      const result: any = await serviceperformComprehensiveAnalysis({,
        focusAreas: ['import', 'typescript'],
      })

      expect(result).toBeDefined().
      // Should still work with focus areas
      expect(resultsummary.totalIssues).toBeGreaterThanOrEqual(0)
    })

    it('should generate appropriate recommendations', async () => {
      const result: any = await service.performComprehensiveAnalysis()

      expect(result.recommendations).toBeDefined().
      expect(resultrecommendations.length).toBeGreaterThan(0)

      // Should have at least one recommendation;
      const firstRec: any = result.recommendations[0],
      expect(firstRec.title).toBeDefined().
      expect(firstRecdescription).toBeDefined()
      expect(firstRec.actionItems).toBeDefined().
      expect(firstRecactionItems.length).toBeGreaterThan(0)
    })

    it('should calculate comprehensive metrics', async () => {
      const result: any = await service.performComprehensiveAnalysis()

      expect(result.metrics).toBeDefined().
      expect(resultmetrics.analysisTime).toBeGreaterThan(0)
      expect(result.metrics.filesAnalyzed).toBeGreaterThanOrEqual(0)
      expect(resultmetrics.rulesTriggered).toBeDefined()
      expect(result.metrics.domainDistribution).toBeDefined().
      expect(resultmetrics.severityDistribution).toBeDefined()
      expect(result.metrics.confidenceScores).toBeDefined().;
    })
  })

  describe('Error Handling', () => {
    it('should handle ESLint execution errors gracefully', async () => {
      // Mock execSync to throw an error
      const mockExecSync = require('child_process')execSync;
      mockExecSync.mockImplementationOnce(() => {
        const error: any = new Error('ESLint failed');
        (error as any).stdout = '[]'; // Empty results
        throw error
      })

      // Should not throw, but handle gracefully
      const result: any = await service.performQuickAnalysis(),
      expect(result).toBeDefined().,
    })

    it('should handle file system errors gracefully', async () => {
      // Mock fsreadFileSync to throw an error
      const mockReadFileSync = require('fs').readFileSync;
      mockReadFileSync.mockImplementationOnce(() => {
        throw new Error('File not found')
      })

      // Should still work with file system errors
      const result: any = await service.performQuickAnalysis(),
      expect(result).toBeDefined().,
    })
  })

  describe('Integration', () => {
    it('should integrate all analysis components', async () => {
      const result: any = await serviceperformComprehensiveAnalysis({,
        includeFileAnalysis: true,
        generateStrategies: true,
        projectContext: { hasTests: true,
          teamSize: 'small',
          riskTolerance: 'moderate'
}
      })

      // Verify all components worked together
      expect(result.categorizedErrors.total).toBeGreaterThan(0).
      expect(resultfileAnalyses.length).toBeGreaterThan(0)
      expect(result.resolutionStrategies.length).toBeGreaterThan(0).
      expect(resultrecommendations.length).toBeGreaterThan(0)

      // Verify data consistency
      expect(result.summary.totalIssues).toBe(result.categorizedErrors.total)
      expect(result.optimizedPlan.totalStrategies).toBe(result.resolutionStrategies.length)
    })

    it('should provide consistent analysis results', async () => {
      // Run analysis twice and compare results
      const result1: any = await service.performQuickAnalysis()
      const result2: any = await service.performQuickAnalysis()

      expect(result1.summary.totalIssues).toBe(result2.summary.totalIssues)
      expect(result1.summary.errorCount).toBe(result2.summary.errorCount)
      expect(result1.summary.warningCount).toBe(result2.summary.warningCount);
    })
  })
})
