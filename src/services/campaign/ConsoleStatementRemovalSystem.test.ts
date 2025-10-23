/**
 * ConsoleStatementRemovalSystem.test.ts
 *
 * Test suite for ConsoleStatementRemovalSystem
 * Validates selective removal and critical statement preservation
 */

import { execSync } from 'child_process';
import * as fs from 'fs';

import {
  ConsoleStatementRemovalSystem,
  type ConsoleRemovalConfig,
  type ConsoleRemovalResult,
  type ConsoleStatement,
} from './ConsoleStatementRemovalSystem';

// Mock dependencies
jest.mock('child_process');
jest.mock('fs');

const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;
const mockFs = fs as jest.Mocked<typeof fs>;

describe('ConsoleStatementRemovalSystem', () => {
  let removalSystem: ConsoleStatementRemovalSystem;

  beforeEach(() => {
    removalSystem = new ConsoleStatementRemovalSystem();
    jest.clearAllMocks();

    // Mock fs.existsSync to return true for script path
    mockFs.existsSync.mockReturnValue(true);
  });

  describe('constructor', () => {
    it('should initialize with default configuration', () => {
      const system = new ConsoleStatementRemovalSystem();
      expect(system).toBeDefined();
    });

    it('should accept custom configuration', () => {
      const config: Partial<ConsoleRemovalConfig> = {
        maxFiles: 15,
        dryRun: false,
        preserveDebugCritical: false,
        selectiveRemoval: false,
      };

      const system = new ConsoleStatementRemovalSystem(config);
      expect(system).toBeDefined();
    });
  });

  describe('analyzeFileConsoleStatements', () => {
    it('should detect console statements in file content', () => {
      const content = `
console.log('debug message');
console.error('error message');
console.warn('warning message');
console.info('info message');
console.debug('debug message');
      `;

      const statements = (
        removalSystem as unknown as { analyzeFileConsoleStatements: (filePath: string, content: string) => unknown[] }
      ).analyzeFileConsoleStatements('/test/file.ts', content);

      expect(statements).toHaveLength(5);
      expect((statements as Record<string, unknown>)[0].type).toBe('log');
      expect((statements as Record<string, unknown>)[1].type).toBe('error');
      expect((statements as Record<string, unknown>)[2].type).toBe('warn');
      expect((statements as Record<string, unknown>)[3].type).toBe('info');
      expect((statements as Record<string, unknown>)[4].type).toBe('debug');
    });

    it('should extract correct line and column information', () => {
      const content = `
const test = 'value';
console.log('test message');
const another = 'value';
      `;

      const statements = (
        removalSystem as unknown as { analyzeFileConsoleStatements: (filePath: string, content: string) => unknown[] }
      ).analyzeFileConsoleStatements('/test/file.ts', content);

      expect(statements).toHaveLength(1);
      expect((statements as Record<string, unknown>)[0].line).toBe(3);
      expect((statements as Record<string, unknown>)[0].content).toBe("console.log('test message')");
    });
  });

  describe('isConsoleStatementCritical', () => {
    it('should mark error statements as critical', () => {
      const isCritical = (
        removalSystem as unknown as {
          isConsoleStatementCritical: (filePath: string, statement: Record<string, unknown>) => boolean;
        }
      ).isConsoleStatementCritical(
        '/test/file.ts',
        'console.error("Something went wrong")',
        'try { } catch (e) { console.error("Something went wrong"); }',
        'error',
      );

      expect(isCritical).toBe(true);
    });

    it('should mark statements in debug files as critical', () => {
      const isCritical = (removalSystem as any).isConsoleStatementCritical(
        '/test/debug.ts',
        'console.log("Debug info")',
        'console.log("Debug info");',
        'log',
      );

      expect(isCritical).toBe(true);
    });

    it('should mark statements in test files as critical', () => {
      const isCritical = (removalSystem as any).isConsoleStatementCritical(
        '/test/file.test.ts',
        'console.log("Test output")',
        'console.log("Test output");',
        'log',
      );

      expect(isCritical).toBe(true);
    });

    it('should mark statements with error handling context as critical', () => {
      const context = `
        try {
          doSomething();
        } catch (error) {
          console.log("Error occurred");
        }
      `;

      const isCritical = (
        removalSystem as unknown as {
          isConsoleStatementCritical: (filePath: string, statement: Record<string, unknown>) => boolean;
        }
      ).isConsoleStatementCritical('/test/file.ts', 'console.log("Error occurred")', context, 'log');

      expect(isCritical).toBe(true);
    });

    it('should mark statements with important patterns as critical', () => {
      const isCritical = (
        removalSystem as unknown as {
          isConsoleStatementCritical: (filePath: string, statement: Record<string, unknown>) => boolean;
        }
      ).isConsoleStatementCritical(
        '/test/file.ts',
        'console.log("API request failed")',
        'console.log("API request failed");',
        'log',
      );

      expect(isCritical).toBe(true);
    });

    it('should mark warn statements in production code as critical', () => {
      const isCritical = (removalSystem as any).isConsoleStatementCritical(
        '/src/components/Component.ts',
        'console.warn("Deprecated feature")',
        'console.warn("Deprecated feature");',
        'warn',
      );

      expect(isCritical).toBe(true);
    });

    it('should not mark simple log statements as critical', () => {
      const isCritical = (removalSystem as any).isConsoleStatementCritical(
        '/src/components/Component.ts',
        'console.log("Simple debug")',
        'console.log("Simple debug");',
        'log',
      );

      expect(isCritical).toBe(false);
    });
  });

  describe('validatePreConditions', () => {
    it('should validate script exists', async () => {
      mockFs.existsSync.mockReturnValue(false);

      await expect(
        (removalSystem as unknown as { validatePreConditions: () => Promise<void> }).validatePreConditions(),
      ).rejects.toThrow('Console removal script not found');
    });

    it('should check git status when git stash is enabled', async () => {
      mockExecSync.mockReturnValue('');

      await expect(
        (removalSystem as unknown as { validatePreConditions: () => Promise<void> }).validatePreConditions(),
      ).resolves.not.toThrow();
      expect(mockExecSync).toHaveBeenCalledWith('git status --porcelain', { encoding: 'utf-8' });
    });
  });

  describe('createSafetyStash', () => {
    it('should create git stash with timestamp', async () => {
      mockExecSync.mockReturnValue('');

      const stashId = await (
        removalSystem as unknown as { createSafetyStash: () => Promise<string> }
      ).createSafetyStash();

      expect(stashId).toContain('console-removal-');
      expect(mockExecSync).toHaveBeenCalledWith(expect.stringContaining('git stash push -m "console-removal-'), {
        encoding: 'utf-8',
      });
    });

    it('should handle git stash errors gracefully', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Git error');
      });

      const stashId = await (
        removalSystem as unknown as { createSafetyStash: () => Promise<string> }
      ).createSafetyStash();
      expect(stashId).toBe('');
    });
  });

  describe('executeScript', () => {
    it('should execute script with correct arguments for dry run', async () => {
      const config = { dryRun: true, maxFiles: 10 };
      const system = new ConsoleStatementRemovalSystem(config);

      const mockAnalysis: ConsoleStatement[] = [
        {
          file: '/test/file.ts',
          line: 1,
          column: 1,
          type: 'log',
          content: 'console.log("test")',
          context: 'console.log("test");',
          isCritical: false,
          shouldPreserve: false,
        },
      ];

      mockExecSync.mockReturnValue('Files processed: 5\nTotal console statements fixed: 10');

      const result = await (
        system as unknown as { executeScript: (analysis: unknown[]) => Promise<ConsoleRemovalResult> }
      ).executeScript(mockAnalysis);

      expect(result.success).toBe(true);
      expect(result.filesProcessed).toBe(5);
      expect(result.consoleStatementsRemoved).toBe(10);

      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('--dry-run --max-files 10'),
        expect.any(Object),
      );
    });

    it('should calculate preserved statements correctly', async () => {
      const mockAnalysis: ConsoleStatement[] = [
        {
          file: '/test/file.ts',
          line: 1,
          column: 1,
          type: 'error',
          content: 'console.error("critical")',
          context: 'console.error("critical");',
          isCritical: true,
          shouldPreserve: true,
        },
        {
          file: '/test/file.ts',
          line: 2,
          column: 1,
          type: 'log',
          content: 'console.log("normal")',
          context: 'console.log("normal");',
          isCritical: false,
          shouldPreserve: false,
        },
      ];

      mockExecSync.mockReturnValue('Files processed: 1\nTotal console statements fixed: 1');

      const result = await (
        removalSystem as unknown as { executeScript: (analysis: unknown[]) => Promise<ConsoleRemovalResult> }
      ).executeScript(mockAnalysis);

      expect(result.consoleStatementsPreserved).toBe(1);
      expect(result.preservedFiles).toContain('/test/file.ts');
    });

    it('should handle script execution errors', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Script execution failed');
      });

      const result = await (removalSystem as any).executeScript([]);

      expect(result.success).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('Script execution failed'));
    });

    it('should parse warnings and errors from output', async () => {
      const output = `
        Files processed: 5
        ⚠️ Warning: Some statements preserved
        ❌ Error: Failed to process file
        Total console statements fixed: 10
      `;

      mockExecSync.mockReturnValue(output);

      const result = await (removalSystem as any).executeScript([]);

      expect(result.warnings).toHaveLength(1);
      expect(result.errors).toHaveLength(1);
      expect(result.warnings[0]).toContain('Warning: Some statements preserved');
      expect(result.errors[0]).toContain('Error: Failed to process file');
    });
  });

  describe('generateReport', () => {
    it('should generate single execution report', () => {
      const result: ConsoleRemovalResult = {
        success: true,
        filesProcessed: 10,
        consoleStatementsRemoved: 25,
        consoleStatementsPreserved: 5,
        buildTime: 2000,
        errors: [],
        warnings: ['Test warning'],
        preservedFiles: ['/test/debug.ts'],
      };

      const report = removalSystem.generateReport(result);

      expect(report).toContain('Console Statement Removal Report');
      expect(report).toContain('Success: ✅');
      expect(report).toContain('Files Processed: 10');
      expect(report).toContain('Console Statements Removed: 25');
      expect(report).toContain('Console Statements Preserved: 5');
      expect(report).toContain('Build Time: 2000ms');
      expect(report).toContain('/test/debug.ts');
      expect(report).toContain('Test warning');
    });

    it('should generate failure report', () => {
      const result: ConsoleRemovalResult = {
        success: false,
        filesProcessed: 0,
        consoleStatementsRemoved: 0,
        consoleStatementsPreserved: 0,
        buildTime: 0,
        errors: ['Test error'],
        warnings: [],
        preservedFiles: [],
      };

      const report = removalSystem.generateReport(result);

      expect(report).toContain('Success: ❌');
      expect(report).toContain('Test error');
      expect(report).toContain('Console removal failed');
    });
  });

  describe('estimateFilesWithConsoleStatements', () => {
    it('should return default estimate when analyzer fails', async () => {
      // Mock the dynamic import to fail
      jest.doMock('./LintingWarningAnalyzer.js', () => {
        throw new Error('Module not found');
      });

      const estimate = await (
        removalSystem as unknown as { estimateFilesWithConsoleStatements: () => Promise<number> }
      ).estimateFilesWithConsoleStatements();

      expect(estimate).toBe(50);
    });
  });

  describe('saveMetrics', () => {
    it('should save metrics to file', async () => {
      const result: ConsoleRemovalResult = {
        success: true,
        filesProcessed: 5,
        consoleStatementsRemoved: 10,
        consoleStatementsPreserved: 2,
        buildTime: 1500,
        errors: [],
        warnings: [],
        preservedFiles: ['/test/debug.ts'],
      };

      mockFs.writeFileSync.mockImplementation(() => {});

      await (removalSystem as unknown as { saveMetrics: (result: ConsoleRemovalResult) => Promise<void> }).saveMetrics(
        result,
      );

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('.console-removal-metrics.json'),
        expect.stringContaining('"success":true'),
      );
    });

    it('should handle save metrics errors gracefully', async () => {
      const result: ConsoleRemovalResult = {
        success: true,
        filesProcessed: 5,
        consoleStatementsRemoved: 10,
        consoleStatementsPreserved: 2,
        buildTime: 1500,
        errors: [],
        warnings: [],
        preservedFiles: [],
      };

      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error('Write failed');
      });

      await expect(
        (removalSystem as unknown as { saveMetrics: (result: ConsoleRemovalResult) => Promise<void> }).saveMetrics(
          result,
        ),
      ).resolves.not.toThrow();
    });
  });
});
