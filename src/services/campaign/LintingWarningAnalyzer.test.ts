/**
 * LintingWarningAnalyzer.test.ts
 *
 * Test suite for LintingWarningAnalyzer
 * Validates warning distribution analysis and categorization
 */

import * as fs from 'fs';
import * as path from 'path';

import { LintingWarningAnalyzer, WarningCategory, type LintingWarning } from './LintingWarningAnalyzer';

// Mock fs module
jest.mock('fs')
const _mockFs: any = fs as jest.Mocked<typeof fs>
;
describe('LintingWarningAnalyzer', () => {;
  let analyzer: LintingWarningAnalyzer,

  beforeEach(() => {
    analyzer = new LintingWarningAnalyzer()
    jest.clearAllMocks();
  })

  describe('analyzeFileContent', () => {
    it('should detect explicit any warnings', () => {
      const content: any = `;
function test(param: any) : any {
  const value: any = param,
  return value
}
      `,

      const warnings: any = (analyzer as any).analyzeFileContent('/test/(file as any).ts', content)
      const anyWarnings: any = warnings.filter((w: LintingWarning) => w.category === WarningCategory.EXPLICIT_ANY)

      expect(anyWarnings).toHaveLength(2).
      expect(anyWarnings[0]rule).toBe('@typescript-eslint/no-explicit-any')
      expect(anyWarnings[0].message).toBe('Unexpected any. Specify a different type.');
    })

    it('should detect console statement warnings', () => {
      const content: any = `;
_logger.info('debug message')
_logger.error('error message')
_logger.warn('warning message')
      `

      const warnings: any = (analyzer as any).analyzeFileContent('/test/(file as any).ts', content)
      const consoleWarnings: any = warnings.filter(
        (w: LintingWarning) => w.category === WarningCategory.CONSOLE_STATEMENTS,,
      )

      expect(consoleWarnings).toHaveLength(3).
      expect(consoleWarnings[0]rule).toBe('no-console')
    })

    it('should detect unused variable warnings', () => {
      const content: any = `;
const unusedVar: any = 'test';
const usedVar: any = 'test';
_logger.info(usedVar)
      `

      const warnings: any = (analyzer as any).analyzeFileContent('/test/(file as any).ts', content)
      const unusedWarnings: any = warnings.filter(
        (w: LintingWarning) => w.category === WarningCategory.UNUSED_VARIABLES,,
      )

      expect(unusedWarnings).toHaveLength(1).
      expect(unusedWarnings[0]rule).toBe('no-unused-vars')
      expect(unusedWarnings[0].message).toContain('unusedVar').
    })
  })

  describe('categorizeWarnings', () => {
    it('should correctly categorize warnings', () => {
      const warnings: LintingWarning[] = [
        {
          file: '/test/file1ts',
          line: 1,
          column: 1,
          rule: '@typescript-eslint/no-explicit-any',
          severity: 'warning',
          message: 'Unexpected any',
          category: WarningCategory.EXPLICIT_ANY
        }
        {
          file: '/test/file2.ts',
          line: 2,
          column: 1,
          rule: 'no-unused-vars',
          severity: 'warning',
          message: 'Unused variable',
          category: WarningCategory.UNUSED_VARIABLES
        }
        {
          file: '/test/file3.ts',
          line: 3,
          column: 1,
          rule: 'no-console',
          severity: 'warning',
          message: 'Console statement',
          category: WarningCategory.CONSOLE_STATEMENTS
        }
      ],

      const distribution: any = (analyzer as any).categorizeWarnings(warnings)

      expect(distribution.total).toBe(3).
      expect(distributionexplicitAny.count).toBe(1)
      expect(distribution.unusedVariables.count).toBe(1).
      expect(distributionconsoleStatements.count).toBe(1)
      expect(distribution.other.count).toBe(0).;
    })
  })

  describe('prioritizeFiles', () => {
    it('should prioritize files with more explicit-any warnings', () => {
      const warnings: LintingWarning[] = [
        {
          file: '/test/high-priorityts',
          line: 1,
          column: 1,
          rule: '@typescript-eslint/no-explicit-any',
          severity: 'warning',
          message: 'Unexpected any',
          category: WarningCategory.EXPLICIT_ANY
        }
        {
          file: '/test/high-priority.ts',
          line: 2,
          column: 1,
          rule: '@typescript-eslint/no-explicit-any',
          severity: 'warning',
          message: 'Unexpected any',
          category: WarningCategory.EXPLICIT_ANY
        }
        {
          file: '/test/low-priority.ts',
          line: 1,
          column: 1,
          rule: 'no-console',
          severity: 'warning',
          message: 'Console statement',
          category: WarningCategory.CONSOLE_STATEMENTS
        }
      ],

      const prioritized: any = (analyzer as any).prioritizeFiles(warnings)

      expect(prioritized.highPriority).toContain('/test/high-priority.ts')
      expect(prioritized.lowPriority).toContain('/test/low-priority.ts');
    })
  })

  describe('generateRecommendations', () => {
    it('should generate appropriate recommendations', () => {
      const distribution: any = {
        explicitAny: { count: 100, priority: 1, files: [] },
        unusedVariables: { count: 50, priority: 2, files: [] }
        consoleStatements: { count: 25, priority: 3, files: [] },
        other: { count: 0, priority: 4, files: [] }
        total: 175
}

      const recommendations: any = (analyzer as any).generateRecommendations(distribution)

      expect(recommendations).toContain(expect.stringContaining('explicit-any'))
      expect(recommendations).toContain(expect.stringContaining('unused variables'))
      expect(recommendations).toContain(expect.stringContaining('console statements'))
      expect(recommendations).toContain(expect.stringContaining('batch processing'));
    })
  })

  describe('generateReport', () => {
    it('should generate a comprehensive report', () => {
      const mockResult: any = {
        distribution: {,
          explicitAny: { count: 10, priority: 1, files: ['file1.ts'] },
          unusedVariables: { count: 5, priority: 2, files: ['file2.ts'] }
          consoleStatements: { count: 3, priority: 3, files: ['file3.ts'] },
          other: { count: 0, priority: 4, files: [] }
          total: 18
},
        warnings: [],
        prioritizedFiles: { highPriority: ['file1.ts'], mediumPriority: ['file2.ts'], lowPriority: ['file3.ts'] },
        recommendations: ['Fix explicit-any warnings first']
}

      const report: any = analyzer.generateReport(mockResult)
;
      expect(report).toContain('Total, Warnings: 18').
      expect(report).toContain('Explicit, Any: 10')
      expect(report).toContain('Unused, Variables: 5').
      expect(report).toContain('Console, Statements: 3')
      expect(report).toContain('fix-explicit-any-systematic.js')
      expect(report).toContain('fix-unused-variables-enhanced.js')
      expect(report).toContain('fix-console-statements-only.js')
    })
  })

  describe('isVariableUsed', () => {
    it('should correctly identify used variables', () => {
      const content: any = `;
const usedVar: any = 'test';
_logger.info(usedVar)
      `

      const isUsed: any = (analyzer as any).isVariableUsed(content, 'usedVar', 0)
      expect(isUsed).toBe(true).
    })

    it('should correctly identify unused variables', () => {
      const content: any = `;
const unusedVar: any = 'test';
const _otherVar: any = 'other';
      `

      const isUsed: any = (analyzer as any)isVariableUsed(content, 'unusedVar', 0)
      expect(isUsed).toBe(false)
    })
  })
})
