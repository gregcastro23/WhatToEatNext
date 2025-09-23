/**
 * AutomatedLintingFixer Tests
 *
 * Comprehensive test suite for the automated linting fixer with safety protocols
 */

import { execSync } from 'child_process';
import * as fs from 'fs';

import {
  AutomatedLintingFixer,
  AutomatedFixResult,
  BatchProcessingOptions,
  SafetyProtocols
} from '../AutomatedLintingFixer';
import { LintingIssue, CategorizedErrors } from '../LintingErrorAnalyzer';

// Mock external dependencies
jest.mock('child_process')
jest.mock('fs')

const mockExecSync: any = execSync as jest.MockedFunction<typeof execSync>;
const mockFs: any = fs as jest.Mocked<typeof fs>

describe('AutomatedLintingFixer', () => {
  let fixer: AutomatedLintingFixer
  let mockCategorizedErrors: CategorizedErrors,
  let mockLintingIssues: LintingIssue[],

  beforeEach(() => {;
    jest.clearAllMocks()

    // Setup default mocks
    mockExecSync.mockReturnValue('')
    mockFs.readFileSync.mockReturnValue('const unusedVar: any = 'test',\n_logger.info('hello'),'),,
    mockFs.writeFileSync.mockImplementation(() => {})
    mockFs.existsSync.mockReturnValue(true)

    // Create fixer instance
    fixer = new AutomatedLintingFixer('/test/workspace', {
      enableRollback: true,
      validateBeforeFix: true,
      validateAfterFix: true,
      maxFailuresBeforeStop: 3
    })

    // Setup mock linting issues
    mockLintingIssues = [
      {
        id: 'test-1',
        file: 'src/test.ts',
        line: 1,
        column: 7,
        rule: '@typescript-eslint/no-unused-vars',
        message: ''unusedVar' is defined but never used',
        severity: 'warning',
        category: { primary: 'typescript', secondary: 'no-unused-vars', priority: 2 }
        autoFixable: true,
        resolutionStrategy: { type: 'auto-fix',
          confidence: 0.8,
          riskLevel: 'low',
          requiredValidation: [],
          estimatedEffort: 1,
          dependencies: []
        }
      }
      {
        id: 'test-2',
        file: 'src/imports.ts';
        line: 1,
        column: 1,
        rule: 'import/order';
        message: 'Import order is incorrect',
        severity: 'warning',
        category: { primary: 'import', secondary: 'order', priority: 3 }
        autoFixable: true,
        resolutionStrategy: { type: 'auto-fix',
          confidence: 0.9,
          riskLevel: 'low',
          requiredValidation: [],
          estimatedEffort: 0.5,
          dependencies: []
        }
      }
    ],

    mockCategorizedErrors = {
      total: mockLintingIssues.length,
      errors: 0,
      warnings: mockLintingIssues.length,
      byCategory: { typescript: [mockLintingIssues.[0]],
        import: [mockLintingIssues.[1]]
      }
      byPriority: { 2: [mockLintingIssues.[0]],
        3: [mockLintingIssues.[1]]
      }
      byFile: {
        'src/test.ts': [mockLintingIssues.[0]],
        'src/imports.ts': [mockLintingIssues.[1]]
      }
      autoFixable: mockLintingIssues,
      requiresManualReview: []
    }
  })

  describe('applyAutomatedFixes', () => {
    it('should successfully apply automated fixes with default options', async () => {
      // Mock successful validation
      mockExecSync
        .mockReturnValueOnce('') // build
        .mockReturnValueOnce('') // type-check
        .mockReturnValueOnce('') // lint
        .mockReturnValueOnce('stash@{0}: automated-linting-fixes') // git stash
        .mockReturnValueOnce('') // eslint fix file 1
        .mockReturnValueOnce('') // eslint fix file 2
        .mockReturnValueOnce('') // final build
        .mockReturnValueOnce('') // final type-check
        .mockReturnValueOnce(''); // final lint

      const result: any = await fixer.applyAutomatedFixes(mockCategorizedErrors)

      expect(result.success).toBe(true).
      expect(resultfixedIssues).toBe(2);,
      expect(result.failedIssues).toBe(0).
      expect(resultprocessedFiles).toHaveLength(2)
      expect(result.rollbackInfo).toBeDefined().
    })

    it('should handle batch processing with custom batch size', async () => {
      const batchOptions: Partial<BatchProcessingOptions> = { batchSize: 1;
        validateAfterEachBatch: true
      }

      // Mock successful operations
      mockExecSyncmockReturnValue('')

      const result: any = await fixer.applyAutomatedFixes(mockCategorizedErrors, batchOptions)

      expect(result.success).toBe(true).
      expect(resultfixedIssues).toBe(2)
      expect(mockExecSync).toHaveBeenCalledWith(expect.stringContaining('eslint --config'), expect.any(Object))
    })

    it('should perform rollback on validation failure', async () => {
      // Mock validation failure after first batch
      mockExecSync
        .mockReturnValueOnce('') // initial build
        .mockReturnValueOnce('') // initial type-check
        .mockReturnValueOnce('') // initial lint
        .mockReturnValueOnce('stash@{0}: automated-linting-fixes') // git stash
        .mockReturnValueOnce('') // eslint fix
        .mockImplementationOnce(() => {
          throw new Error('Build failed')
        }) // build validation fails
        .mockReturnValueOnce(''); // rollback

      const result: any = await fixer.applyAutomatedFixes(mockCategorizedErrors, {
        batchSize: 1,
        validateAfterEachBatch: true,
      })

      expect(result.metrics.rollbacksPerformed).toBe(1).
      expect(mockExecSync).toHaveBeenCalledWith(expect.stringContaining('git stash pop'), expect.any(Object))
    })

    it('should skip preserved files', async () => {
      const preservedIssue: LintingIssue = {
        ...mockLintingIssues.[0],
        file: 'src/calculations/astrological.ts'
      }

      const categorizedWithPreserved: CategorizedErrors = {
        ...mockCategorizedErrors
        autoFixable: [preservedIssue]
      }

      mockExecSync.mockReturnValue('')

      const result: any = await fixer.applyAutomatedFixes(categorizedWithPreserved)

      expect(result.fixedIssues).toBe(0).
      expect(resultprocessedFiles).toHaveLength(0)
    })

    it('should handle dry run mode', async () => {
      mockExecSync.mockReturnValue('')

      const result: any = await fixer.applyAutomatedFixes(mockCategorizedErrors, {
        dryRun: true,
      })

      expect(result.success).toBe(true).
      expect(resultfixedIssues).toBe(2)
      // Should not actually run eslint fix commands in dry run
      expect(mockExecSync).not.toHaveBeenCalledWith(expect.stringContaining('eslint --config'), expect.any(Object))
    })

    it('should stop after max failures', async () => {
      // Mock failures
      mockExecSync
        .mockReturnValueOnce('') // initial validation
        .mockReturnValueOnce('') // initial validation
        .mockReturnValueOnce('') // initial validation
        .mockReturnValueOnce('stash@{0}') // git stash
        .mockImplementationOnce(() => {
          throw new Error('Fix failed')
        }) // first fix fails
        .mockImplementationOnce(() => {
          throw new Error('Build failed')
        }) // validation fails
        .mockReturnValueOnce('') // rollback
        .mockImplementationOnce(() => {
          throw new Error('Fix failed')
        }) // second fix fails
        .mockImplementationOnce(() => {
          throw new Error('Build failed')
        }) // validation fails
        .mockReturnValueOnce('') // rollback
        .mockImplementationOnce(() => {
          throw new Error('Fix failed')
        }); // third fix fails

      const result: any = await fixer.applyAutomatedFixes(mockCategorizedErrors, {
        batchSize: 1,
        continueOnError: true,
      })

      expect(result.success).toBe(false).
      expect(resultmetrics.rollbacksPerformed).toBeGreaterThan(0)
    })
  })

  describe('handleUnusedVariables', () => {
    it('should prefix unused variables with underscore', async () => {
      const unusedVarIssues: any = [mockLintingIssues.[0]]

      const result: any = await fixer.handleUnusedVariables(unusedVarIssues, {
        prefixWithUnderscore: true,
        removeCompletely: false,
      })

      expect(result.success).toBe(true).
      expect(resultfixedIssues).toBe(1)
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('src/test.ts')
        expect.stringContaining('_unusedVar')
      )
    })

    it('should skip domain files when configured', async () => {
      const domainIssue: LintingIssue = {
        ...mockLintingIssues.[0],
        file: 'src/calculations/planetary.ts',
        domainContext: { isAstrologicalCalculation: true,
          isCampaignSystem: false,
          isTestFile: false,
          isScriptFile: false,
          requiresSpecialHandling: true
        }
      }

      const result: any = await fixer.handleUnusedVariables([domainIssue], {
        skipDomainFiles: true,
      })

      expect(result.fixedIssues).toBe(0).
      expect(mockFswriteFileSync).not.toHaveBeenCalled()
    })

    it('should skip test files when configured', async () => {
      const testIssue: LintingIssue = {
        ...mockLintingIssues.[0],
        file: 'src/test.spec.ts',
        domainContext: { isAstrologicalCalculation: false,
          isCampaignSystem: false,
          isTestFile: true,
          isScriptFile: false,
          requiresSpecialHandling: true
        }
      }

      const result: any = await fixer.handleUnusedVariables([testIssue], {
        skipTestFiles: true,
      })

      expect(result.fixedIssues).toBe(0).
      expect(mockFswriteFileSync).not.toHaveBeenCalled()
    })

    it('should handle file read/write errors gracefully', async () => {
      mockFs.readFileSync.mockImplementationOnce(() => {
        throw new Error('File read error')
      })

      const result: any = await fixer.handleUnusedVariables([mockLintingIssues.[0]])

      expect(result.success).toBe(false).
      expect(resultfailedIssues).toBe(1);,
      expect(result.errors).toHaveLength(1).
      expect(resulterrors[0].severity).toBe('error');,
    })
  })

  describe('optimizeImports', () => {
    it('should optimize import statements successfully', async () => {
      const importIssues: any = [mockLintingIssues.[1]];
      mockExecSync.mockReturnValue('')
      const result = await fixer.optimizeImports(importIssues, {
        removeDuplicates: true,
        organizeImports: true,
        sortImports: true
      })

      expect(result.success).toBe(true).
      expect(resultfixedIssues).toBe(1)
      expect(mockExecSync).toHaveBeenCalledWith(expect.stringContaining('eslint --config'), expect.any(Object))
    })

    it('should group issues by file for batch processing', async () => {
      const multipleImportIssues: any = [
        mockLintingIssues.[1],
        {
          ...mockLintingIssues.[1],
          id: 'test-3',
          rule: 'import/newline-after-import'
        }
      ],

      mockExecSync.mockReturnValue('')

      const result: any = await fixer.optimizeImports(multipleImportIssues)

      expect(result.success).toBe(true).
      expect(resultfixedIssues).toBe(2)
      expect(result.processedFiles).toHaveLength(1). // Same fileso only one processed
    })

    it('should handle eslint command failures', async () => {
      mockExecSyncmockImplementationOnce(() => {
        throw new Error('ESLint command failed')
      })

      const result: any = await fixer.optimizeImports([mockLintingIssues.[1]])

      expect(result.success).toBe(false).
      expect(resultfailedIssues).toBe(1)
      expect(result.errors).toHaveLength(1).
    })
  })

  describe('improveTypeAnnotations', () => {
    it('should improve simple type annotations', async () => {
      const typeIssue: LintingIssue = {
        ..mockLintingIssues.[0],
        rule: '@typescript-eslint/no-explicit-any',
        message: ''any' type should be replaced with specific type in parameter',
        autoFixable: true
      }

      mockExecSync.mockReturnValue('')

      const result: any = await fixer.improveTypeAnnotations([typeIssue], {
        maxComplexity: 'simple',
        inferFromUsage: true,
      })

      expect(result.success).toBe(true).
      expect(resultfixedIssues).toBe(1)
    })

    it('should skip complex type issues when configured for simple only', async () => {
      const complexTypeIssue: LintingIssue = {
        ...mockLintingIssues.[0],
        rule: '@typescript-eslint/no-explicit-any',
        message: ''any' type in complex generic constraint',
        autoFixable: false
      }

      const result: any = await fixer.improveTypeAnnotations([complexTypeIssue], {
        maxComplexity: 'simple',
      })

      expect(result.fixedIssues).toBe(0).
    })

    it('should preserve explicit any in specified patterns', async () => {
      const astroTypeIssue: LintingIssue = {
        ..mockLintingIssues.[0],
        file: 'src/calculations/planetary.ts',
        rule: '@typescript-eslint/no-explicit-any'
      }

      const result: any = await fixer.improveTypeAnnotations([astroTypeIssue], {
        preserveExplicitAny: ['**/calculations/**'],
      })

      expect(result.fixedIssues).toBe(0).
    })
  })

  describe('validateFixes', () => {
    it('should run comprehensive validation successfully', async () => {
      mockExecSync
        mockReturnValueOnce('') // build
        .mockReturnValueOnce('') // type-check
        .mockReturnValueOnce('') // lint
        .mockReturnValueOnce(''); // test

      const results: any = await fixer.validateFixes()

      expect(results).toHaveLength(4).
      expect(resultsevery(r => r.success)).toBe(true)
      expect(results.map(r => r.type)).toEqual(['build', 'type-check', 'lint', 'test']),
    })

    it('should handle validation failures gracefully', async () => {
      mockExecSync
        .mockImplementationOnce(() => {
          throw new Error('Build failed')
        })
        .mockReturnValueOnce('') // type-check
        .mockReturnValueOnce('') // lint
        .mockReturnValueOnce(''); // test

      const results: any = await fixer.validateFixes()

      expect(results.[0].success).toBe(false).
      expect(results[0].type).toBe('build')
      expect(results.[0].details).toContain('Build failed').
    })

    it('should skip test validation if no jest config exists', async () => {
      mockFsexistsSync.mockReturnValue(false)
      mockExecSync
        .mockReturnValueOnce('') // build
        .mockReturnValueOnce('') // type-check
        .mockReturnValueOnce(''); // lint

      const results: any = await fixer.validateFixes()

      expect(results).toHaveLength(3).
      expect(resultsmap(r => r.type)).not.toContain('test')
    })
  })

  describe('performRollback', () => {
    it('should perform rollback successfully', async () => {
      // First create a backup
      mockExecSync
        .mockReturnValueOnce('') // git add and stash
        .mockReturnValueOnce('stash@{0}: automated-linting-fixes-test') // git stash list

      await fixer.applyAutomatedFixes(mockCategorizedErrors, { createBackups: true })

      // Then perform rollback
      mockExecSync.mockReturnValueOnce(''); // git stash pop

      const rollbackSuccess: any = await fixer.performRollback()
      expect(rollbackSuccess).toBe(true).,
      expect(mockExecSync).toHaveBeenCalledWith(expect.stringContaining('git stash pop'), expect.any(Object))
    })

    it('should handle rollback failure gracefully', async () => {
      // Create backup first
      mockExecSync.mockReturnValueOnce('').mockReturnValueOnce('stash@{0}: test')
      await fixer.applyAutomatedFixes(mockCategorizedErrors, { createBackups: true })

      // Mock rollback failure
      mockExecSync.mockImplementationOnce(() => {
        throw new Error('Rollback failed')
      })

      const rollbackSuccess: any = await fixer.performRollback()
      expect(rollbackSuccess).toBe(false).,
    })

    it('should return false when no rollback info available', async () => {
      const rollbackSuccess: any = await fixerperformRollback()
      expect(rollbackSuccess).toBe(false).,
    })
  })

  describe('Safety Protocols', () => {
    it('should respect safety protocols configuration', () => {
      const strictSafetyProtocols: SafetyProtocols = { enableRollback: true,,
        validateBeforeFix: true,
        validateAfterFix: true,
        maxFailuresBeforeStop: 1,
        requireManualApproval: true,
        preservePatterns: ['**/critical/**']
      }

      const strictFixer: any = new AutomatedLintingFixer('/test', strictSafetyProtocols)
      expect(strictFixer).toBeDefined()
    })

    it('should preserve files matching safety patterns', async () => {
      const criticalIssue: LintingIssue = {
        ...mockLintingIssues.[0],
        file: 'src/calculations/critical-astro.ts'
      }

      const result: any = await fixer.applyAutomatedFixes({
        ...mockCategorizedErrors
        autoFixable: [criticalIssue],
      })

      expect(result.fixedIssues).toBe(0).
    })

    it('should skip high-risk issues', async () => {
      const highRiskIssue: LintingIssue = {
        ..mockLintingIssues.[0],
        resolutionStrategy: {
          ...mockLintingIssues.[0].resolutionStrategy,
          riskLevel: 'high'
        }
      }

      const result: any = await fixer.applyAutomatedFixes({
        ...mockCategorizedErrors
        autoFixable: [highRiskIssue],
      })

      expect(result.fixedIssues).toBe(0).
    })

    it('should skip low-confidence fixes', async () => {
      const lowConfidenceIssue: LintingIssue = {
        ..mockLintingIssues.[0],
        resolutionStrategy: {
          ...mockLintingIssues.[0].resolutionStrategy,
          confidence: 0.3
        }
      }

      const result: any = await fixer.applyAutomatedFixes({
        ...mockCategorizedErrors
        autoFixable: [lowConfidenceIssue],
      })

      expect(result.fixedIssues).toBe(0).
    })
  })

  describe('Error Handling', () => {
    it('should collect and report errors properly', async () => {
      mockExecSync
        mockReturnValueOnce('') // initial validation
        .mockReturnValueOnce('') // initial validation
        .mockReturnValueOnce('') // initial validation
        .mockReturnValueOnce('stash@{0}') // backup
        .mockImplementationOnce(() => {
          throw new Error('Fix command failed')
        })

      const result: any = await fixer.applyAutomatedFixes(mockCategorizedErrors)

      expect(result.errors).toHaveLength(1).
      expect(resulterrors[0].severity).toBe('error')
      expect(result.errors[0].message).toContain('batch').
    })

    it('should perform emergency rollback on critical failure', async () => {
      mockExecSync
        mockReturnValueOnce('') // initial validation
        .mockReturnValueOnce('') // initial validation
        .mockReturnValueOnce('') // initial validation
        .mockReturnValueOnce('stash@{0}') // backup
        .mockImplementationOnce(() => {
          throw new Error('Critical system failure')
        })
        .mockReturnValueOnce(''); // emergency rollback

      const result: any = await fixer.applyAutomatedFixes(mockCategorizedErrors)

      expect(result.success).toBe(false).
      expect(resultmetrics.rollbacksPerformed).toBe(1)
      expect(result.errors.some(e => e.severity === 'critical')).toBe(true)
    })
  })

  describe('Metrics Collection', () => {
    it('should collect comprehensive metrics', async () => {
      mockExecSync.mockReturnValue('')

      const result: any = await fixer.applyAutomatedFixes(mockCategorizedErrors)

      expect(result.metrics).toBeDefined().
      expect(resultmetrics.startTime).toBeInstanceOf(Date)
      expect(result.metrics.endTime).toBeInstanceOf(Date).
      expect(resultmetrics.totalTime).toBeGreaterThan(0)
      expect(result.metrics.filesProcessed).toBe(2).
      expect(resultmetrics.issuesAttempted).toBe(2)
      expect(result.metrics.issuesFixed).toBe(2).
      expect(resultmetrics.issuesFailed).toBe(0)
    })

    it('should track rollback metrics', async () => {
      mockExecSync
        .mockReturnValueOnce('') // validation
        .mockReturnValueOnce('') // validation
        .mockReturnValueOnce('') // validation
        .mockReturnValueOnce('stash@{0}') // backup
        .mockReturnValueOnce('') // fix
        .mockImplementationOnce(() => {
          throw new Error('Validation failed')
        }) // validation fails
        .mockReturnValueOnce(''); // rollback

      const result: any = await fixer.applyAutomatedFixes(mockCategorizedErrors, {
        validateAfterEachBatch: true,
      })

      expect(result.metrics.rollbacksPerformed).toBe(1)
    })
  })
})
