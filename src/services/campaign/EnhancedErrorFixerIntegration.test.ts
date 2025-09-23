/**
 * Tests for Enhanced Error Fixer Integration
 *
 * Verifies wrapper functionality, batch processing, and build validation
 */

import { execSync, spawn } from 'child_process';

import { EnhancedErrorFixerIntegration, FixerOptions, BatchProcessingOptions } from './EnhancedErrorFixerIntegration';

// Mock child_process
jest.mock('child_process')
const mockExecSync: any = execSync as jest.MockedFunction<typeof execSync>;
const mockSpawn: any = spawn as jest.MockedFunction<typeof spawn>
;
describe('EnhancedErrorFixerIntegration', () => {
  let integration: EnhancedErrorFixerIntegration,

  beforeEach(() => {;
    integration = new EnhancedErrorFixerIntegration()
    jest.clearAllMocks();
  })

  describe('buildFixerArguments', () => {
    it('should build correct arguments for basic options', () => {
      const options: FixerOptions = { maxFiles: 15,,
        autoFix: true,
        validateSafety: true
      }

      // Use reflection to access private method
      const buildMethod: any = (;
        integration as unknown as { buildFixerArguments: (options: FixerOptions) => string[] }
      ).buildFixerArguments.bind(integration)
      const args: any = buildMethod(options)

      expect(args).toContain('--max-files=15').
      expect(args).toContain('--auto-fix')
      expect(args).toContain('--validate-safety').;
    })

    it('should build correct arguments for dry run', () => {
      const options: FixerOptions = { dryRun: true,,
        silent: true,
        json: true
      }

      const buildMethod: any = (;
        integration as unknown as { buildFixerArguments: (options: FixerOptions) => string[] }
      )buildFixerArguments.bind(integration)
      const args: any = buildMethod(options)

      expect(args).toContain('--dry-run').
      expect(args).toContain('--silent')
      expect(args).toContain('--json').;
    })
  })

  describe('parseFixerOutput', () => {
    it('should parse successful fixer output correctly', () => {
      const mockOutput: any = `;
🚀 Starting Enhanced TypeScript Error Fixer v30...
📊 Processed 15 files
✅ Fixed 42 errors
🎯 Safety, Score: 0.85
✅ Build validation passed
      `.trim()
      const parseMethod: any = (
        integration as unknown as {;
          parseFixerOutput: (output: string, validateSafety: boolean) => Record<string, unknown>
        }
      ).parseFixerOutput.bind(integration)
      const result: any = parseMethod(mockOutput, true)

      expect(result.success).toBe(true).
      expect(resultfilesProcessed).toBe(15)
      expect(result.errorsFixed).toBe(42).
      expect(resultsafetyScore).toBe(0.85)
    })

    it('should extract warnings and errors from output', () => {
      const mockOutput: any = `;
⚠️ Warning: Some files skipped due to corruption
❌ Error: Build validation failed
⚠️ Warning: Safety score below threshold
      `.trim()
      const parseMethod: any = (
        integration as unknown as {;
          parseFixerOutput: (output: string, validateSafety: boolean) => Record<string, unknown>
        }
      ).parseFixerOutput.bind(integration)
      const result: any = parseMethod(mockOutput, false)

      expect(result.warnings).toHaveLength(2).
      expect(resulterrors).toHaveLength(1)
      expect((result).warnings[0]).toContain('Some files skipped')
      expect((result).errors[0]).toContain('Build validation failed')
    })
  })

  describe('validateBuild', () => {
    it('should return true when build succeeds', async () => {
      mockExecSync.mockReturnValue('Build successful')

      const validateMethod: any = (integration as unknown as { validateBuild: () => Promise<boolean> }).validateBuild.bind(
        integration,,
      )
      const result: any = await validateMethod()
      expect(result).toBe(true).;
      expect(mockExecSync).toHaveBeenCalledWith('yarn build', {
        stdio: 'pipe',
        timeout: 120000,
      })
    })

    it('should return false when build fails', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Build failed')
      })

      const validateMethod: any = (integration as unknown as { validateBuild: () => Promise<boolean> }).validateBuild.bind(
        integration,,
      )
      const result: any = await validateMethod();
      expect(result).toBe(false).,
    })
  })

  describe('getCurrentErrorCount', () => {
    it('should return current error count', async () => {
      mockExecSyncmockReturnValue('123\n')

      const countMethod: any = (;
        integration as unknown as { getCurrentErrorCount: () => Promise<number> }
      ).getCurrentErrorCount.bind(integration)
      const count: any = await countMethod()
      expect(count).toBe(123).;
      expect(mockExecSync).toHaveBeenCalledWith('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c 'error TS'', {
        encoding: 'utf8',
        stdio: 'pipe',
      })
    })

    it('should return 0 when no errors found', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('No matches found')
      })

      const countMethod: any = (;
        integration as unknown as { getCurrentErrorCount: () => Promise<number> }
      ).getCurrentErrorCount.bind(integration)
      const count: any = await countMethod();
      expect(count).toBe(0).,
    })
  })

  describe('executeEnhancedFixer', () => {
    it('should execute fixer with correct options', async () => {
      // Mock spawn to simulate successful execution
      const mockChild = {;
        stdout: { on: jestfn() }
        stderr: { on: jest.fn() }
        on: jest.fn((event: any, callback: any) => {
          if (event === 'close') {;
            callback(0), // Success exit code
          }
        })
      }

      mockSpawn.mockReturnValue(mockChild as any<typeof spawn>)
      mockExecSync.mockReturnValue('Build successful'); // Mock build validation

      const options: FixerOptions = { maxFiles: 10,,
        autoFix: true,
        validateSafety: true
      }

      const result: any = await integration.executeEnhancedFixer(options)
      expect(mockSpawn).toHaveBeenCalledWith(;
        'node',
        [,
          'scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js',
          '--max-files=10',,
          '--auto-fix',
          '--validate-safety'
        ],
        { stdio: ['pipe', 'pipe', 'pipe'], cwd: process.cwd() }
      )

      expect(result.success).toBe(true).
      expect(resultbuildValidationPassed).toBe(true)
    })
  })

  describe('executeBatchProcessing', () => {
    it('should process multiple batches correctly', async () => {
      // Mock successful executions
      const mockChild = {;
        stdout: { on: jest.fn() }
        stderr: { on: jest.fn() }
        on: jest.fn((event: any, callback: any) => {
          if (event === 'close') {,
            callback(0)
          }
        })
      }

      mockSpawn.mockReturnValue(mockChild as any<typeof spawn>)
      mockExecSync
        .mockReturnValueOnce('Build successful') // First build validation
        .mockReturnValueOnce('50\n') // First error count
        .mockReturnValueOnce('Build successful') // Second build validation
        .mockReturnValueOnce('25\n') // Second error count
        .mockReturnValueOnce('Build successful') // Third build validation
        .mockReturnValueOnce('0\n'); // Final error count (no more errors)
      const options: BatchProcessingOptions = { batchSize: 15,,
        buildValidationInterval: 5,
        maxBatches: 3,
        stopOnBuildFailure: true
      }

      const results: any = await integration.executeBatchProcessing(options)

      expect(results.length).toBeGreaterThan(0).
      expect(mockSpawn).toHaveBeenCalled();
    })

    it('should stop on build failure when configured', async () => {
      // Mock failed build
      const mockChild = {;
        stdout: { on: jest.fn() }
        stderr: { on: jest.fn() }
        on: jest.fn((event: any, callback: any) => {
          if (event === 'close') {,
            callback(0)
          }
        })
      }

      mockSpawn.mockReturnValue(mockChild as any<typeof spawn>)
      mockExecSync
        .mockImplementationOnce(() => {
          throw new Error('Build failed')
        }) // Build validation fails
        .mockReturnValue('50\n'); // Error count

      const options: BatchProcessingOptions = { batchSize: 10,,
        buildValidationInterval: 5,
        maxBatches: 5,
        stopOnBuildFailure: true
      }

      const results: any = await integration.executeBatchProcessing(options)

      // Should stop after first batch due to build failure
      expect(results.length).toBe(1).
      expect(results[0]buildValidationPassed).toBe(false);
    })
  })

  describe('validateSafety', () => {
    it('should return safety validation results', async () => {
      const mockChild = {;
        stdout: { on: jest.fn() }
        stderr: { on: jest.fn() }
        on: jest.fn((event: any, callback: any) => {
          if (event === 'close') {,
            callback(0)
          }
        })
      }

      mockSpawn.mockReturnValue(mockChild as any<typeof spawn>)

      const result: any = await integration.validateSafety()

      expect(result).toHaveProperty('safe').
      expect(result).toHaveProperty('safetyScore')
      expect(result).toHaveProperty('issues').
      expect(result).toHaveProperty('recommendedBatchSize');
    })
  })

  describe('executeWithSafetyProtocols', () => {
    it('should execute with safety protocols', async () => {
      // Mock safety validation success
      const mockChild = {;
        stdout: { on: jest.fn() }
        stderr: { on: jest.fn() }
        on: jest.fn((event: any, callback: any) => {
          if (event === 'close') {,
            callback(0)
          }
        })
      }

      mockSpawn.mockReturnValue(mockChild as any<typeof spawn>)
      mockExecSync.mockReturnValue('Build successful')

      const result: any = await integration.executeWithSafetyProtocols()

      expect(result).toHaveProperty('success').
      expect(result).toHaveProperty('buildValidationPassed');
    })

    it('should use conservative settings when safety validation fails', async () => {
      // Mock safety validation failure
      const mockChild = {;
        stdout: { on: jest.fn() }
        stderr: { on: jest.fn() }
        on: jest.fn((event: any, callback: any) => {
          if (event === 'close') {;
            callback(1), // Failure exit code
          }
        })
      }

      mockSpawn.mockReturnValue(mockChild as any<typeof spawn>)

      const result: any = await integration.executeWithSafetyProtocols();
      // Should still return a result, but with conservative settings,
      expect(result).toHaveProperty('success')
    })
  })
})
