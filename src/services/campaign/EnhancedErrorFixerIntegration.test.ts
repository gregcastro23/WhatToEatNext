/**
 * Tests for Enhanced Error Fixer Integration
 *
 * Verifies wrapper functionality, batch processing, and build validation
 */

import { execSync, spawn } from 'child_process';

import { EnhancedErrorFixerIntegration, FixerOptions, BatchProcessingOptions } from './EnhancedErrorFixerIntegration';

// Mock child_process
jest.mock('child_process');
const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;
const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;

describe('EnhancedErrorFixerIntegration', () => {
  let integration: EnhancedErrorFixerIntegration;

  beforeEach(() => {
    integration = new EnhancedErrorFixerIntegration();
    jest.clearAllMocks();
  });

  describe('buildFixerArguments', () => {
    it('should build correct arguments for basic options', () => {
      const options: FixerOptions = {
        maxFiles: 15,
        autoFix: true,
        validateSafety: true,
      };

      // Use reflection to access private method
      const buildMethod = (
        integration as unknown as { buildFixerArguments: (options: FixerOptions) => string[] }
      ).buildFixerArguments.bind(integration);
      const args = buildMethod(options);

      expect(args).toContain('--max-files=15');
      expect(args).toContain('--auto-fix');
      expect(args).toContain('--validate-safety');
    });

    it('should build correct arguments for dry run', () => {
      const options: FixerOptions = {
        dryRun: true,
        silent: true,
        json: true,
      };

      const buildMethod = (
        integration as unknown as { buildFixerArguments: (options: FixerOptions) => string[] }
      ).buildFixerArguments.bind(integration);
      const args = buildMethod(options);

      expect(args).toContain('--dry-run');
      expect(args).toContain('--silent');
      expect(args).toContain('--json');
    });
  });

  describe('parseFixerOutput', () => {
    it('should parse successful fixer output correctly', () => {
      const mockOutput = `
🚀 Starting Enhanced TypeScript Error Fixer v3.0...
📊 Processed 15 files
✅ Fixed 42 errors
🎯 Safety Score: 0.85
✅ Build validation passed
      `.trim();

      const parseMethod = (
        integration as unknown as {
          parseFixerOutput: (output: string, validateSafety: boolean) => Record<string, unknown>;
        }
      ).parseFixerOutput.bind(integration);
      const result = parseMethod(mockOutput, true);

      expect(result.success).toBe(true);
      expect(result.filesProcessed).toBe(15);
      expect(result.errorsFixed).toBe(42);
      expect(result.safetyScore).toBe(0.85);
    });

    it('should extract warnings and errors from output', () => {
      const mockOutput = `
⚠️ Warning: Some files skipped due to corruption
❌ Error: Build validation failed
⚠️ Warning: Safety score below threshold
      `.trim();

      const parseMethod = (
        integration as unknown as {
          parseFixerOutput: (output: string, validateSafety: boolean) => Record<string, unknown>;
        }
      ).parseFixerOutput.bind(integration);
      const result = parseMethod(mockOutput, false);

      expect(result.warnings).toHaveLength(2);
      expect(result.errors).toHaveLength(1);
      expect((result as Record<string, unknown>).warnings[0]).toContain('Some files skipped');
      expect((result as Record<string, unknown>).errors[0]).toContain('Build validation failed');
    });
  });

  describe('validateBuild', () => {
    it('should return true when build succeeds', async () => {
      mockExecSync.mockReturnValue('Build successful');

      const validateMethod = (integration as unknown as { validateBuild: () => Promise<boolean> }).validateBuild.bind(
        integration,
      );
      const result = await validateMethod();

      expect(result).toBe(true);
      expect(mockExecSync).toHaveBeenCalledWith('yarn build', {
        stdio: 'pipe',
        timeout: 120000,
      });
    });

    it('should return false when build fails', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Build failed');
      });

      const validateMethod = (integration as unknown as { validateBuild: () => Promise<boolean> }).validateBuild.bind(
        integration,
      );
      const result = await validateMethod();

      expect(result).toBe(false);
    });
  });

  describe('getCurrentErrorCount', () => {
    it('should return current error count', async () => {
      mockExecSync.mockReturnValue('123\n');

      const countMethod = (
        integration as unknown as { getCurrentErrorCount: () => Promise<number> }
      ).getCurrentErrorCount.bind(integration);
      const count = await countMethod();

      expect(count).toBe(123);
      expect(mockExecSync).toHaveBeenCalledWith('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS"', {
        encoding: 'utf8',
        stdio: 'pipe',
      });
    });

    it('should return 0 when no errors found', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('No matches found');
      });

      const countMethod = (
        integration as unknown as { getCurrentErrorCount: () => Promise<number> }
      ).getCurrentErrorCount.bind(integration);
      const count = await countMethod();

      expect(count).toBe(0);
    });
  });

  describe('executeEnhancedFixer', () => {
    it('should execute fixer with correct options', async () => {
      // Mock spawn to simulate successful execution
      const mockChild = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            callback(0); // Success exit code
          }
        }),
      };

      mockSpawn.mockReturnValue(mockChild as unknown as ReturnType<typeof spawn>);
      mockExecSync.mockReturnValue('Build successful'); // Mock build validation

      const options: FixerOptions = {
        maxFiles: 10,
        autoFix: true,
        validateSafety: true,
      };

      const result = await integration.executeEnhancedFixer(options);

      expect(mockSpawn).toHaveBeenCalledWith(
        'node',
        [
          'scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js',
          '--max-files=10',
          '--auto-fix',
          '--validate-safety',
        ],
        { stdio: ['pipe', 'pipe', 'pipe'], cwd: process.cwd() },
      );

      expect(result.success).toBe(true);
      expect(result.buildValidationPassed).toBe(true);
    });
  });

  describe('executeBatchProcessing', () => {
    it('should process multiple batches correctly', async () => {
      // Mock successful executions
      const mockChild = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            callback(0);
          }
        }),
      };

      mockSpawn.mockReturnValue(mockChild as unknown as ReturnType<typeof spawn>);
      mockExecSync
        .mockReturnValueOnce('Build successful') // First build validation
        .mockReturnValueOnce('50\n') // First error count
        .mockReturnValueOnce('Build successful') // Second build validation
        .mockReturnValueOnce('25\n') // Second error count
        .mockReturnValueOnce('Build successful') // Third build validation
        .mockReturnValueOnce('0\n'); // Final error count (no more errors)

      const options: BatchProcessingOptions = {
        batchSize: 15,
        buildValidationInterval: 5,
        maxBatches: 3,
        stopOnBuildFailure: true,
      };

      const results = await integration.executeBatchProcessing(options);

      expect(results.length).toBeGreaterThan(0);
      expect(mockSpawn).toHaveBeenCalled();
    });

    it('should stop on build failure when configured', async () => {
      // Mock failed build
      const mockChild = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            callback(0);
          }
        }),
      };

      mockSpawn.mockReturnValue(mockChild as unknown as ReturnType<typeof spawn>);
      mockExecSync
        .mockImplementationOnce(() => {
          throw new Error('Build failed');
        }) // Build validation fails
        .mockReturnValue('50\n'); // Error count

      const options: BatchProcessingOptions = {
        batchSize: 10,
        buildValidationInterval: 5,
        maxBatches: 5,
        stopOnBuildFailure: true,
      };

      const results = await integration.executeBatchProcessing(options);

      // Should stop after first batch due to build failure
      expect(results.length).toBe(1);
      expect(results[0].buildValidationPassed).toBe(false);
    });
  });

  describe('validateSafety', () => {
    it('should return safety validation results', async () => {
      const mockChild = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            callback(0);
          }
        }),
      };

      mockSpawn.mockReturnValue(mockChild as unknown as ReturnType<typeof spawn>);

      const result = await integration.validateSafety();

      expect(result).toHaveProperty('safe');
      expect(result).toHaveProperty('safetyScore');
      expect(result).toHaveProperty('issues');
      expect(result).toHaveProperty('recommendedBatchSize');
    });
  });

  describe('executeWithSafetyProtocols', () => {
    it('should execute with safety protocols', async () => {
      // Mock safety validation success
      const mockChild = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            callback(0);
          }
        }),
      };

      mockSpawn.mockReturnValue(mockChild as unknown as ReturnType<typeof spawn>);
      mockExecSync.mockReturnValue('Build successful');

      const result = await integration.executeWithSafetyProtocols();

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('buildValidationPassed');
    });

    it('should use conservative settings when safety validation fails', async () => {
      // Mock safety validation failure
      const mockChild = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            callback(1); // Failure exit code
          }
        }),
      };

      mockSpawn.mockReturnValue(mockChild as unknown as ReturnType<typeof spawn>);

      const result = await integration.executeWithSafetyProtocols();

      // Should still return a result, but with conservative settings
      expect(result).toHaveProperty('success');
    });
  });
});
