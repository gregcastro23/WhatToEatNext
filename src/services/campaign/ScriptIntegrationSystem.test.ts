/**
 * Tests for Script Integration System
 */

import { execSync } from 'child_process';
import fs from 'fs';

import { ScriptExecutionOptions, ScriptIntegrationSystem } from './ScriptIntegrationSystem';

// Mock fs and execSync
jest.mock('fs');
jest.mock('child_process');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;

describe('ScriptIntegrationSystem', () => {
  let scriptSystem: ScriptIntegrationSystem;

  beforeEach(() => {
    scriptSystem = new ScriptIntegrationSystem();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default scripts base path', () => {
      const system = new ScriptIntegrationSystem();
      expect(system).toBeInstanceOf(ScriptIntegrationSystem);
    });

    it('should initialize with custom scripts base path', () => {
      const system = new ScriptIntegrationSystem('/custom/scripts');
      expect(system).toBeInstanceOf(ScriptIntegrationSystem);
    });
  });

  describe('getAvailableScripts', () => {
    it('should return list of available script configurations', () => {
      const scripts = scriptSystem.getAvailableScripts();

      expect(scripts).toHaveLength(4);
      expect(scripts.map(s => s.id)).toContain('typescript-enhanced-v3');
      expect(scripts.map(s => s.id)).toContain('explicit-any-systematic');
      expect(scripts.map(s => s.id)).toContain('unused-variables-enhanced');
      expect(scripts.map(s => s.id)).toContain('console-statements');
    });

    it('should return correct configuration for typescript-enhanced-v3', () => {
      const scripts = scriptSystem.getAvailableScripts();
      const tsScript = scripts.find(s => s.id === 'typescript-enhanced-v3');

      expect(tsScript).toBeDefined();
      expect(tsScript?.config.scriptPath).toBe('scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js');
      expect(tsScript!.config.safetyLevel).toBe('maximum');
      expect(tsScript!.config.maxBatchSize).toBe(25);
      expect(tsScript!.config.requiresGitClean).toBe(true);
      expect(tsScript!.config.supportsJsonOutput).toBe(true);
    });
  });

  describe('executeScript', () => {
    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(true);
      mockExecSync.mockReturnValue('Script executed successfully\n5 files processed\n3 errors fixed');
    });

    it('should execute script with default options', async () => {
      const result = await scriptSystem.executeScript('typescript-enhanced-v3');

      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('fix-typescript-errors-enhanced-v3.js'),
        expect.any(Object),
      );
      expect(result.success).toBe(true);
      expect(result.filesProcessed).toBe(5);
      expect(result.errorsFixed).toBe(3);
    });

    it('should execute script with custom options', async () => {
      const options: ScriptExecutionOptions = {
        maxFiles: 10,
        autoFix: true,
        dryRun: false,
      };

      await scriptSystem.executeScript('typescript-enhanced-v3', options);

      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('--max-files=10 --auto-fix'),
        expect.any(Object),
      );
    });

    it('should throw error for unknown script ID', async () => {
      await expect(scriptSystem.executeScript('unknown-script')).rejects.toThrow('Unknown script ID: unknown-script');
    });

    it('should throw error if script file does not exist', async () => {
      mockFs.existsSync.mockReturnValue(false);

      await expect(scriptSystem.executeScript('typescript-enhanced-v3')).rejects.toThrow('Script not found:');
    });

    it('should handle script execution failure', async () => {
      const error = new Error('Script failed') as unknown;
      error.status = 1;
      (error as any).stdout = 'Some output';
      error.stderr = 'Error message';
      mockExecSync.mockImplementation(() => {
        throw error;
      });

      const result = await scriptSystem.executeScript('typescript-enhanced-v3');

      expect(result.success).toBe(false);
      expect(result.exitCode).toBe(1);
      expect(result.stdout).toContain('Some output');
    });

    it('should parse JSON output correctly', async () => {
      const jsonOutput = JSON.stringify({
        safetyMetrics: {
          totalRuns: 10,
          successfulRuns: 8,
          filesProcessed: 50,
          errorsFixed: 25,
          safetyScore: 0.85,
          recommendedBatchSize: 15,
          lastRunTime: '2025-01-01T00:00:00Z',
        },
      });
      mockExecSync.mockReturnValue(jsonOutput);

      const result = await scriptSystem.executeScript('typescript-enhanced-v3', { json: true });

      expect(result.metrics).toBeDefined();
      expect(result.metrics?.totalRuns).toBe(10);
      expect(result.metrics!.safetyScore).toBe(0.85);
    });

    it('should parse safety events from output', async () => {
      const output = `
        Processing files...
        🚨 Corruption detected in file.ts
        Build validation failed
        📦 Created git stash: test-stash
      `;
      mockExecSync.mockReturnValue(output);

      const result = await scriptSystem.executeScript('typescript-enhanced-v3');

      expect(result.safetyEvents).toHaveLength(3);
      expect(result.safetyEvents[0].type).toBe('corruption');
      expect(result.safetyEvents[1].type).toBe('build_failure');
      expect(result.safetyEvents[2].type).toBe('stash_created');
    });
  });

  describe('getScriptMetrics', () => {
    it('should return null for unknown script', async () => {
      const metrics = await scriptSystem.getScriptMetrics('unknown-script');
      expect(metrics).toBeNull();
    });

    it('should return metrics from script execution', async () => {
      const jsonOutput = JSON.stringify({
        safetyMetrics: {
          totalRuns: 5,
          successfulRuns: 4,
          safetyScore: 0.8,
        },
      });
      mockFs.existsSync.mockReturnValue(true);
      mockExecSync.mockReturnValue(jsonOutput);

      const metrics = await scriptSystem.getScriptMetrics('typescript-enhanced-v3');

      expect(metrics).toBeDefined();
      expect(metrics?.totalRuns).toBe(5);
      expect(metrics!.successfulRuns).toBe(4);
      expect(metrics!.safetyScore).toBe(0.8);
    });

    it('should fallback to reading metrics file directly', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockExecSync.mockImplementation(() => {
        throw new Error('Script failed');
      });
      mockFs.readFileSync.mockReturnValue(
        JSON.stringify({
          totalRuns: 3,
          successfulRuns: 2,
          safetyScore: 0.7,
        }),
      );

      const metrics = await scriptSystem.getScriptMetrics('typescript-enhanced-v3');

      expect(metrics).toBeDefined();
      expect(metrics?.totalRuns).toBe(3);
      expect(metrics!.safetyScore).toBe(0.7);
    });
  });

  describe('validateScriptSafety', () => {
    it('should return unsafe for unknown script', async () => {
      const validation = await scriptSystem.validateScriptSafety('unknown-script');

      expect(validation.safe).toBe(false);
      expect(validation.issues).toContain('Unknown script');
    });

    it('should parse safety validation from script output', async () => {
      const jsonOutput = JSON.stringify({
        safe: true,
        issues: [],
        recommendedBatchSize: 10,
      });
      mockFs.existsSync.mockReturnValue(true);
      mockExecSync.mockReturnValue(jsonOutput);

      const validation = await scriptSystem.validateScriptSafety('typescript-enhanced-v3');

      expect(validation.safe).toBe(true);
      expect(validation.issues).toHaveLength(0);
      expect(validation.recommendedBatchSize).toBe(10);
    });

    it('should fallback to metrics-based safety check', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockExecSync.mockReturnValueOnce('No safety validation output').mockReturnValueOnce(
        JSON.stringify({
          safetyMetrics: {
            totalRuns: 5,
            safetyScore: 0.3,
          },
        }),
      );

      const validation = await scriptSystem.validateScriptSafety('typescript-enhanced-v3');

      expect(validation.safe).toBe(false);
      expect(validation.issues).toContain('Low safety score detected');
    });
  });

  describe('resetScriptMetrics', () => {
    it('should successfully reset metrics', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockExecSync.mockReturnValue('Metrics reset successfully');

      const result = await scriptSystem.resetScriptMetrics('typescript-enhanced-v3');

      expect(result).toBe(true);
      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('--reset-metrics --silent'),
        expect.any(Object),
      );
    });

    it('should handle reset failure gracefully', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockExecSync.mockImplementation(() => {
        throw new Error('Reset failed');
      });

      const result = await scriptSystem.resetScriptMetrics('typescript-enhanced-v3');

      expect(result).toBe(false);
    });
  });

  describe('buildCommandArguments', () => {
    it('should build correct arguments for all options', async () => {
      const options: ScriptExecutionOptions = {
        maxFiles: 15,
        autoFix: true,
        validateSafety: true,
        dryRun: true,
        interactive: true,
        aggressive: true,
        showMetrics: true,
        json: true,
        silent: true,
        resetMetrics: true,
      };

      mockFs.existsSync.mockReturnValue(true);
      mockExecSync.mockReturnValue('test output');

      await scriptSystem.executeScript('typescript-enhanced-v3', options);

      const expectedArgs = [
        '--max-files=15',
        '--auto-fix',
        '--validate-safety',
        '--dry-run',
        '--interactive',
        '--aggressive',
        '--show-metrics',
        '--json',
        '--silent',
        '--reset-metrics',
      ];

      expect(mockExecSync).toHaveBeenCalledWith(expect.stringContaining(expectedArgs.join(' ')), expect.any(Object));
    });
  });
});
