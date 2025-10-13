/**
 * Tests for Explicit-Any Elimination System
 *
 * Verifies batch processing, campaign progress tracking, and 75.5% reduction target
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';

import { ExplicitAnyEliminationSystem, ExplicitAnyOptions } from './ExplicitAnyEliminationSystem';

// Mock child_process and fs
jest.mock('child_process');
jest.mock('fs');

const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;
const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;
const mockFs = fs as jest.Mocked<typeof fs>;

describe('ExplicitAnyEliminationSystem', () => {
  let system: ExplicitAnyEliminationSystem;

  beforeEach(() => {
    system = new ExplicitAnyEliminationSystem();
    jest.clearAllMocks();
  });

  describe('buildFixerArguments', () => {
    it('should build correct arguments for explicit-any options', () => {
      const options: ExplicitAnyOptions = {
        maxFiles: 25,
        autoFix: true,
        aggressive: true,
        validateSafety: true,
      };

      // Use reflection to access private method
      const buildMethod = (
        system as unknown as { buildFixerArguments: (options: ExplicitAnyOptions) => string[] }
      ).buildFixerArguments.bind(system);
      const args = buildMethod(options);

      expect(args).toContain('--max-files=25');
      expect(args).toContain('--auto-fix');
      expect(args).toContain('--aggressive');
      expect(args).toContain('--validate-safety');
    });

    it('should build correct arguments for dry run', () => {
      const options: ExplicitAnyOptions = {
        dryRun: true,
        silent: true,
        json: true,
      };

      const buildMethod = (
        system as unknown as { buildFixerArguments: (options: ExplicitAnyOptions) => string[] }
      ).buildFixerArguments.bind(system);
      const args = buildMethod(options);

      expect(args).toContain('--dry-run');
      expect(args).toContain('--silent');
      expect(args).toContain('--json');
    });
  });

  describe('getCurrentExplicitAnyCount', () => {
    it('should return current explicit-any count', async () => {
      mockExecSync.mockReturnValue('624\n');

      const count = await system.getCurrentExplicitAnyCount();

      expect(count).toBe(624);
      expect(mockExecSync).toHaveBeenCalledWith('yarn lint 2>&1 | grep -c "@typescript-eslint/no-explicit-any"', {
        encoding: 'utf8',
        stdio: 'pipe',
      });
    });

    it('should return 0 when no explicit-any warnings found', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('No matches found');
      });

      const count = await system.getCurrentExplicitAnyCount();

      expect(count).toBe(0);
    });
  });

  describe('parseFixerOutput', () => {
    it('should parse successful fixer output correctly', () => {
      const mockOutput = `
🎯 Starting Explicit-Any Elimination System...
📊 Processed 25 files
✅ Fixed 50 explicit-any warnings
🎯 Safety Score: 0.92
✅ Build validation passed
      `.trim();

      const parseMethod = (system as any).parseFixerOutput.bind(system);
      const result = parseMethod(mockOutput, true);

      expect(result.success).toBe(true);
      expect(result.filesProcessed).toBe(25);
      expect(result.safetyScore).toBe(0.92);
    });

    it('should extract warnings and errors from output', () => {
      const mockOutput = `
⚠️ Warning: Conservative mode enabled
❌ Error: Some files could not be processed
⚠️ Warning: Build validation recommended
      `.trim();

      const parseMethod = (system as any).parseFixerOutput.bind(system);
      const result = parseMethod(mockOutput, false);

      expect(result.warnings).toHaveLength(2);
      expect(result.errors).toHaveLength(1);
      expect(result.warnings[0]).toContain('Conservative mode enabled');
      expect(result.errors[0]).toContain('Some files could not be processed');
    });
  });

  describe('loadCampaignProgress', () => {
    it('should load existing campaign progress', async () => {
      const mockProgress = {
        totalExplicitAnyStart: 1000,
        totalExplicitAnyRemaining: 500,
        reductionAchieved: 500,
        reductionPercentage: 50,
        campaignTarget: 75.5,
        isTargetMet: false,
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.promises.readFile = jest.fn().mockResolvedValue(JSON.stringify(mockProgress));
      mockExecSync.mockReturnValue('400\n'); // Current count

      const loadMethod = (system as any).loadCampaignProgress.bind(system);
      const progress = await loadMethod();

      expect(progress.totalExplicitAnyStart).toBe(1000);
      expect(progress.totalExplicitAnyRemaining).toBe(400); // Updated from current count
      expect(progress.campaignTarget).toBe(75.5);
    });

    it('should initialize new campaign progress when file does not exist', async () => {
      mockFs.existsSync.mockReturnValue(false);
      mockExecSync.mockReturnValue('800\n'); // Current count

      const loadMethod = (system as any).loadCampaignProgress.bind(system);
      const progress = await loadMethod();

      expect(progress.totalExplicitAnyStart).toBe(800);
      expect(progress.totalExplicitAnyRemaining).toBe(800);
      expect(progress.reductionAchieved).toBe(0);
      expect(progress.reductionPercentage).toBe(0);
      expect(progress.campaignTarget).toBe(75.5);
      expect(progress.isTargetMet).toBe(false);
    });
  });

  describe('updateCampaignProgress', () => {
    it('should update campaign progress correctly', async () => {
      const mockProgress = {
        totalExplicitAnyStart: 1000,
        totalExplicitAnyRemaining: 600,
        reductionAchieved: 400,
        reductionPercentage: 40,
        campaignTarget: 75.5,
        isTargetMet: false,
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.promises.readFile = jest.fn().mockResolvedValue(JSON.stringify(mockProgress));
      mockFs.promises.writeFile = jest.fn().mockResolvedValue(undefined);
      mockExecSync.mockReturnValue('500\n'); // New current count

      const updateMethod = (system as any).updateCampaignProgress.bind(system);
      await updateMethod(100);

      expect(mockFs.promises.writeFile).toHaveBeenCalled();
      const writeCall = (mockFs.promises.writeFile as jest.Mock).mock.calls[0];
      const updatedProgress = JSON.parse(writeCall[1]);

      expect(updatedProgress.totalExplicitAnyRemaining).toBe(500);
      expect(updatedProgress.reductionAchieved).toBe(500); // 1000 - 500
      expect(updatedProgress.reductionPercentage).toBe(50);
    });
  });

  describe('executeExplicitAnyFixer', () => {
    it('should execute fixer with correct options and calculate reduction', async () => {
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

      mockSpawn.mockReturnValue(mockChild as unknown as import('child_process').ChildProcess);
      mockExecSync
        .mockReturnValueOnce('100\n') // Initial count
        .mockReturnValueOnce('Build successful') // Build validation
        .mockReturnValueOnce('80\n'); // Final count

      const options: ExplicitAnyOptions = {
        maxFiles: 20,
        autoFix: true,
        validateSafety: true,
      };

      const result = await system.executeExplicitAnyFixer(options);

      expect(mockSpawn).toHaveBeenCalledWith(
        'node',
        [
          'scripts/typescript-fixes/fix-explicit-any-systematic.js',
          '--max-files=20',
          '--auto-fix',
          '--validate-safety',
        ],
        { stdio: ['pipe', 'pipe', 'pipe'], cwd: process.cwd() },
      );

      expect(result.success).toBe(true);
      expect(result.explicitAnyFixed).toBe(20); // 100 - 80
      expect(result.explicitAnyRemaining).toBe(80);
      expect(result.reductionPercentage).toBe(20); // 20/100 * 100
      expect(result.buildValidationPassed).toBe(true);
    });
  });

  describe('executeBatchProcessing', () => {
    it('should process multiple batches until target is met', async () => {
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

      mockSpawn.mockReturnValue(mockChild as unknown as import('child_process').ChildProcess);

      // Mock campaign progress
      const mockProgress = {
        totalExplicitAnyStart: 1000,
        totalExplicitAnyRemaining: 200,
        reductionAchieved: 800,
        reductionPercentage: 80,
        campaignTarget: 75.5,
        isTargetMet: true,
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.promises.readFile = jest.fn().mockResolvedValue(JSON.stringify(mockProgress));
      mockFs.promises.writeFile = jest.fn().mockResolvedValue(undefined);

      mockExecSync
        .mockReturnValueOnce('200\n') // Current count
        .mockReturnValueOnce('Build successful') // Build validation
        .mockReturnValueOnce('150\n') // After first batch
        .mockReturnValueOnce('150\n'); // Load progress

      const results = await system.executeBatchProcessing(2);

      expect(results.length).toBeGreaterThan(0);
      expect(mockSpawn).toHaveBeenCalled();
    });

    it('should stop when no progress is made', async () => {
      const mockChild = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            callback(0);
          }
        }),
      };

      mockSpawn.mockReturnValue(mockChild as unknown as import('child_process').ChildProcess);

      // Mock no progress scenario
      mockFs.existsSync.mockReturnValue(false);
      mockExecSync.mockReturnValue('100\n'); // Same count every time

      const results = await system.executeBatchProcessing(5);

      // Should stop after first batch with no progress
      expect(results.length).toBe(1);
    });
  });

  describe('showCampaignProgress', () => {
    it('should display campaign progress correctly', async () => {
      const mockProgress = {
        totalExplicitAnyStart: 1000,
        totalExplicitAnyRemaining: 245,
        reductionAchieved: 755,
        reductionPercentage: 75.5,
        campaignTarget: 75.5,
        isTargetMet: true,
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.promises.readFile = jest.fn().mockResolvedValue(JSON.stringify(mockProgress));
      mockExecSync.mockReturnValue('245\n');

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const progress = await system.showCampaignProgress();

      expect(progress.isTargetMet).toBe(true);
      expect(progress.reductionPercentage).toBe(75.5);
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Target Met: Yes'));

      consoleSpy.mockRestore();
    });
  });

  describe('executeCampaignContinuation', () => {
    it('should continue campaign when target not met', async () => {
      const mockProgress = {
        totalExplicitAnyStart: 1000,
        totalExplicitAnyRemaining: 400,
        reductionAchieved: 600,
        reductionPercentage: 60,
        campaignTarget: 75.5,
        isTargetMet: false,
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.promises.readFile = jest.fn().mockResolvedValue(JSON.stringify(mockProgress));
      mockFs.promises.writeFile = jest.fn().mockResolvedValue(undefined);
      mockExecSync.mockReturnValue('400\n');

      const mockChild = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            callback(0);
          }
        }),
      };

      mockSpawn.mockReturnValue(mockChild as unknown as import('child_process').ChildProcess);

      const results = await system.executeCampaignContinuation();

      expect(results).toBeDefined();
      // Should attempt to continue the campaign
    });

    it('should return empty array when target already met', async () => {
      const mockProgress = {
        totalExplicitAnyStart: 1000,
        totalExplicitAnyRemaining: 200,
        reductionAchieved: 800,
        reductionPercentage: 80,
        campaignTarget: 75.5,
        isTargetMet: true,
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.promises.readFile = jest.fn().mockResolvedValue(JSON.stringify(mockProgress));
      mockExecSync.mockReturnValue('200\n');

      const results = await system.executeCampaignContinuation();

      expect(results).toEqual([]);
    });
  });

  describe('resetCampaignProgress', () => {
    it('should reset campaign progress file', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.promises.unlink = jest.fn().mockResolvedValue(undefined);

      await system.resetCampaignProgress();

      expect(mockFs.promises.unlink).toHaveBeenCalledWith('.explicit-any-campaign-progress.json');
    });

    it('should handle case when progress file does not exist', async () => {
      mockFs.existsSync.mockReturnValue(false);

      await system.resetCampaignProgress();

      expect(mockFs.promises.unlink).not.toHaveBeenCalled();
    });
  });
});
