/**
 * UnusedVariablesCleanupSystem.test.ts
 *
 * Test suite for UnusedVariablesCleanupSystem
 * Validates batch processing and safety protocols
 */

import { execSync } from 'child_process';
import * as fs from 'fs';

import {
  UnusedVariablesCleanupSystem,
  type UnusedVariablesConfig,
  type UnusedVariablesResult,
} from './UnusedVariablesCleanupSystem';

// Mock dependencies
jest.mock('child_process');
jest.mock('fs');

const mockExecSync: any = execSync as jest.MockedFunction<typeof execSync>;
const mockFs: any = fs as jest.Mocked<typeof fs>;

describe('UnusedVariablesCleanupSystem', () => {
  let cleanupSystem: UnusedVariablesCleanupSystem;

  beforeEach(() => {
    cleanupSystem = new UnusedVariablesCleanupSystem();
    jest.clearAllMocks();

    // Mock fs.existsSync to return true for script path
    mockFs.existsSync.mockReturnValue(true);
  });

  describe('constructor', () => {
    it('should initialize with default configuration', () => {
      const system: any = new UnusedVariablesCleanupSystem();
      expect(system).toBeDefined();
    });

    it('should accept custom configuration', () => {
      const config: Partial<UnusedVariablesConfig> = { maxFiles: 30,
        autoFix: true,
        dryRun: false,
      };

      const system: any = new UnusedVariablesCleanupSystem(config);
      expect(system).toBeDefined();
    });
  });

  describe('validatePreConditions', () => {
    it('should validate script exists', async () => {
      mockFs.existsSync.mockReturnValue(false);

      await expect(
        (cleanupSystem as unknown as { validatePreConditions: () => Promise<any> }).validatePreConditions(),
      ).rejects.toThrow('Unused variables script not found');
    });

    it('should check git status when git stash is enabled', async () => {
      mockExecSync.mockReturnValue('');

      await expect(
        (cleanupSystem as unknown as { validatePreConditions: () => Promise<any> }).validatePreConditions(),
      ).resolves.not.toThrow();
      expect(mockExecSync).toHaveBeenCalledWith('git status --porcelain', { encoding: 'utf-8' });
    });

    it('should validate TypeScript compilation', async () => {
      mockExecSync.mockImplementation(command => {
        if (command === 'git status --porcelain') return '';
        if (command === 'yarn tsc --noEmit --skipLibCheck') return '';
        return '';
      });

      await expect(
        (cleanupSystem as unknown as { validatePreConditions: () => Promise<any> }).validatePreConditions(),
      ).resolves.not.toThrow();
    });
  });

  describe('createSafetyStash', () => {
    it('should create git stash with timestamp', async () => {
      mockExecSync.mockReturnValue('');

      const stashId: any = await (;
        cleanupSystem as unknown as { createSafetyStash: () => Promise<string> }
      ).createSafetyStash();

      expect(stashId).toContain('unused-variables-cleanup-');
      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('git stash push -m "unused-variables-cleanup-'),
        { encoding: 'utf-8' },
      );
    });

    it('should handle git stash errors gracefully', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Git error');
      });

      const stashId: any = await (;
        cleanupSystem as unknown as { createSafetyStash: () => Promise<string> }
      ).createSafetyStash();
      expect(stashId).toBe('');
    });
  });

  describe('executeScript', () => {
    it('should execute script with correct arguments for dry run', async () => {
      const config: any = { dryRun: true, maxFiles: 20, validateSafety: true };
      const system: any = new UnusedVariablesCleanupSystem(config);

      mockExecSync.mockReturnValue('5 files processed\n2 variables removed\n3 variables prefixed\nsafety score: 85.5');

      const result: any = await (;
        system as unknown as { executeScript: () => Promise<UnusedVariablesResult> }
      ).executeScript();

      expect(result.success).toBe(true);
      expect(result.filesProcessed).toBe(5);
      expect(result.variablesRemoved).toBe(2);
      expect(result.variablesPrefixed).toBe(3);
      expect(result.safetyScore).toBe(85.5);

      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('--dry-run --max-files=20 --validate-safety'),
        expect.any(Object),
      );
    });

    it('should execute script with auto-fix arguments', async () => {
      const config: any = { autoFix: true, maxFiles: 15 };
      const system: any = new UnusedVariablesCleanupSystem(config);

      mockExecSync.mockReturnValue('10 files processed\n5 variables removed');

      const result: any = await (;
        system as unknown as { executeScript: () => Promise<UnusedVariablesResult> }
      ).executeScript();

      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('--auto-fix --max-files=15'),
        expect.any(Object),
      );
    });

    it('should handle script execution errors', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Script execution failed');
      });

      const result: any = await (;
        cleanupSystem as unknown as { executeScript: () => Promise<UnusedVariablesResult> }
      ).executeScript();

      expect(result.success).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('Script execution failed'));
    });

    it('should parse warnings and errors from output', async () => {
      const output: any = `
        5 files processed
        ⚠️ Warning: Some variables may be used
        ❌ Error: Failed to process file;
        2 variables removed
      `;

      mockExecSync.mockReturnValue(output);

      const result: any = await (;
        cleanupSystem as unknown as { executeScript: () => Promise<UnusedVariablesResult> }
      ).executeScript();

      expect(result.warnings).toHaveLength(1);
      expect(result.errors).toHaveLength(1);
      expect(result.warnings.[0]).toContain('Warning: Some variables may be used');
      expect(result.errors.[0]).toContain('Error: Failed to process file');
    });
  });

  describe('validateBuild', () => {
    it('should validate build successfully', async () => {
      mockExecSync.mockReturnValue('');

      const isValid: any = await (cleanupSystem as unknown as { validateBuild: () => Promise<boolean> }).validateBuild();

      expect(isValid).toBe(true);
      expect(mockExecSync).toHaveBeenCalledWith('yarn build', expect.any(Object));
    });

    it('should handle build validation failure', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Build failed');
      });

      const isValid: any = await (cleanupSystem as unknown as { validateBuild: () => Promise<boolean> }).validateBuild();

      expect(isValid).toBe(false);
    });
  });

  describe('rollbackFromStash', () => {
    it('should rollback from specified stash', async () => {
      mockExecSync.mockReturnValue('');

      await (cleanupSystem as unknown as { rollbackFromStash: (stashNam, e: string) => Promise<any> }).rollbackFromStash(
        'test-stash-name',
      );

      expect(mockExecSync).toHaveBeenCalledWith('git stash apply stash^{/test-stash-name}', { encoding: 'utf-8' });
    });

    it('should handle rollback errors', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Rollback failed');
      });

      await expect(
        (cleanupSystem as unknown as { rollbackFromStash: (stashNam, e: string) => Promise<any> }).rollbackFromStash(
          'test-stash',
        ),
      ).rejects.toThrow('Rollback failed');
    });
  });

  describe('generateReport', () => {
    it('should generate single execution report', () => {
      const result: UnusedVariablesResult = { success: true,
        filesProcessed: 10,
        variablesRemoved: 5,
        variablesPrefixed: 3,
        buildTime: 2000,
        errors: [],
        warnings: ['Test warning'],
        safetyScore: 90.5,
      };

      const report: any = cleanupSystem.generateReport(result);

      expect(report).toContain('Unused Variables Cleanup Report');
      expect(report).toContain('Success: ✅');
      expect(report).toContain('Files Processed: 10');
      expect(report).toContain('Variables Removed: 5');
      expect(report).toContain('Variables Prefixed: 3');
      expect(report).toContain('Build Time: 2000ms');
      expect(report).toContain('Safety Score: 90.5');
      expect(report).toContain('Test warning');
    });

    it('should generate failure report', () => {
      const result: UnusedVariablesResult = { success: false,
        filesProcessed: 0,
        variablesRemoved: 0,
        variablesPrefixed: 0,
        buildTime: 0,
        errors: ['Test error'],
        warnings: [],
        safetyScore: 0,
      };

      const report: any = cleanupSystem.generateReport(result);

      expect(report).toContain('Success: ❌');
      expect(report).toContain('Test error');
      expect(report).toContain('Cleanup failed');
    });
  });

  describe('estimateFilesWithUnusedVariables', () => {
    it('should return default estimate when analyzer fails', async () => {
      // Mock the dynamic import to fail
      jest.doMock('./LintingWarningAnalyzer.js'( {
        throw new Error('Module not found');
      });

      const estimate: any = await (;
        cleanupSystem as unknown as { estimateFilesWithUnusedVariables: () => Promise<number> }
      ).estimateFilesWithUnusedVariables();

      expect(estimate).toBe(100);
    });
  });

  describe('saveMetrics', () => {
    it('should save metrics to file', async () => {
      const result: UnusedVariablesResult = { success: true,
        filesProcessed: 5,
        variablesRemoved: 2,
        variablesPrefixed: 1,
        buildTime: 1500,
        errors: [],
        warnings: [],
        safetyScore: 85.0,
      };

      mockFs.writeFileSync.mockImplementation(() => {});

      await (cleanupSystem as unknown as { saveMetrics: (resul, t: UnusedVariablesResult) => Promise<any> }).saveMetrics(
        result,
      );

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('.unused-variables-cleanup-metrics.json'),
        expect.stringContaining('"success":true'),
      );
    });

    it('should handle save metrics errors gracefully', async () => {
      const result: UnusedVariablesResult = { success: true,
        filesProcessed: 5,
        variablesRemoved: 2,
        variablesPrefixed: 1,
        buildTime: 1500,
        errors: [],
        warnings: [],
        safetyScore: 85.0,
      };

      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error('Write failed');
      });

      await expect(
        (cleanupSystem as unknown as { saveMetrics: (resul, t: UnusedVariablesResult) => Promise<any> }).saveMetrics(
          result,
        ),
      ).resolves.not.toThrow();
    });
  });
});
