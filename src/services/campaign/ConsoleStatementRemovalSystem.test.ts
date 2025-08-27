/**
 * ConsoleStatementRemovalSystem?.test.ts
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
jest?.mock('child_process');
jest?.mock('fs');

const mockExecSync: any = execSync as jest?.MockedFunction<typeof execSync>;
const mockFs: any = fs as jest?.Mocked<typeof fs>;

describe('ConsoleStatementRemovalSystem': any, (: any) => {
  let removalSystem: ConsoleStatementRemovalSystem;

  beforeEach((: any) => {
    removalSystem = new ConsoleStatementRemovalSystem();
    jest?.clearAllMocks();

    // Mock fs?.existsSync to return true for script path
    mockFs?.existsSync.mockReturnValue(true);
  });

  describe('constructor': any, (: any) => {
    it('should initialize with default configuration': any, (: any) => {
      const system: any = new ConsoleStatementRemovalSystem();
      expect(system).toBeDefined();
    });

    it('should accept custom configuration': any, (: any) => {
      const config: Partial<ConsoleRemovalConfig> = {, maxFiles: 15,
        dryRun: false,
        preserveDebugCritical: false,
        selectiveRemoval: false,
      };

      const system: any = new ConsoleStatementRemovalSystem(config);
      expect(system).toBeDefined();
    });
  });

  describe('analyzeFileConsoleStatements': any, (: any) => {
    it('should detect console statements in file content': any, (: any) => {
      const content: any = `;
console?.log('debug message');
console?.error('error message');
console?.warn('warning message');
console?.info('info message');
console?.debug('debug message');
      `;

      const statements: any = (;
        removalSystem as unknown as { analyzeFileConsoleStatements: (filePat, h: string, content: string) => unknown[] }
      ).analyzeFileConsoleStatements('/test/file?.ts', content);

      expect(statements).toHaveLength(5);
      expect((statements as any)[0].type).toBe('log');
      expect((statements as any)[1].type).toBe('error');
      expect((statements as any)[2].type).toBe('warn');
      expect((statements as any)[3].type).toBe('info');
      expect((statements as any)[4].type).toBe('debug');
    });

    it('should extract correct line and column information': any, (: any) => {
      const content: any = `;
const test: any = 'value';
console?.log('test message');
const another: any = 'value';
      `;

      const statements: any = (;
        removalSystem as unknown as { analyzeFileConsoleStatements: (filePat, h: string, content: string) => unknown[] }
      ).analyzeFileConsoleStatements('/test/file?.ts', content);

      expect(statements).toHaveLength(1);
      expect((statements as any)[0].line).toBe(3);
      expect((statements as any)[0].content).toBe("console?.log('test message')");
    });
  });

  describe('isConsoleStatementCritical': any, (: any) => {
    it('should mark error statements as critical': any, (: any) => {
      const isCritical: any = (
        removalSystem as unknown as {;
          isConsoleStatementCritical: (filePat, h: string, statement: Record<string, unknown>) => boolean;
        }
      ).isConsoleStatementCritical(
        '/test/file?.ts',
        'console?.error("Something went wrong")',
        'try { } catch (e) : any { console?.error("Something went wrong"); }',
        'error',
      );

      expect(isCritical as any).toBe(true);
    });

    it('should mark statements in debug files as critical': any, (: any) => {
      const isCritical: any = (removalSystem as any).isConsoleStatementCritical(
        '/test/debug?.ts',
        'console?.log("Debug info")',
        'console?.log("Debug info");',
        'log',
      );

      expect(isCritical as any).toBe(true);
    });

    it('should mark statements in test files as critical': any, (: any) => {
      const isCritical: any = (removalSystem as any).isConsoleStatementCritical(
        '/test/file?.test.ts',
        'console?.log("Test output")',
        'console?.log("Test output");',
        'log',
      );

      expect(isCritical as any).toBe(true);
    });

    it('should mark statements with error handling context as critical': any, (: any) => {
      const context: any = `
        try {;
          doSomething();
        } catch (error) : any {
          console?.log("Error occurred");
        }
      `;

      const isCritical: any = (
        removalSystem as unknown as {;
          isConsoleStatementCritical: (filePat, h: string, statement: Record<string, unknown>) => boolean;
        }
      ).isConsoleStatementCritical('/test/file?.ts', 'console?.log("Error occurred")', context, 'log');

      expect(isCritical as any).toBe(true);
    });

    it('should mark statements with important patterns as critical': any, (: any) => {
      const isCritical: any = (
        removalSystem as unknown as {;
          isConsoleStatementCritical: (filePat, h: string, statement: Record<string, unknown>) => boolean;
        }
      ).isConsoleStatementCritical(
        '/test/file?.ts',
        'console?.log("API request failed")',
        'console?.log("API request failed");',
        'log',
      );

      expect(isCritical as any).toBe(true);
    });

    it('should mark warn statements in production code as critical': any, (: any) => {
      const isCritical: any = (removalSystem as any).isConsoleStatementCritical(
        '/src/components/Component?.ts',
        'console?.warn("Deprecated feature")',
        'console?.warn("Deprecated feature");',
        'warn',
      );

      expect(isCritical as any).toBe(true);
    });

    it('should not mark simple log statements as critical': any, (: any) => {
      const isCritical: any = (removalSystem as any).isConsoleStatementCritical(
        '/src/components/Component?.ts',
        'console?.log("Simple debug")',
        'console?.log("Simple debug");',
        'log',
      );

      expect(isCritical as any).toBe(false);
    });
  });

  describe('validatePreConditions': any, (: any) => {
    it('should validate script exists': any, async (: any) => {
      mockFs?.existsSync.mockReturnValue(false);

      await expect(
        (removalSystem as unknown as { validatePreConditions: () => Promise<any> }).validatePreConditions(),
      ).rejects?.toThrow('Console removal script not found');
    });

    it('should check git status when git stash is enabled': any, async (: any) => {
      mockExecSync?.mockReturnValue('');

      await expect(
        (removalSystem as unknown as { validatePreConditions: () => Promise<any> }).validatePreConditions(),
      ).resolves?.not.toThrow();
      expect(mockExecSync).toHaveBeenCalledWith('git status --porcelain', { encoding: 'utf-8' });
    });
  });

  describe('createSafetyStash': any, (: any) => {
    it('should create git stash with timestamp': any, async (: any) => {
      mockExecSync?.mockReturnValue('');

      const stashId: any = await (;
        removalSystem as unknown as { createSafetyStash: () => Promise<string> }
      ).createSafetyStash();

      expect(stashId).toContain('console-removal-');
      expect(mockExecSync).toHaveBeenCalledWith(expect?.stringContaining('git stash push -m "console-removal-'), {
        encoding: 'utf-8',
      });
    });

    it('should handle git stash errors gracefully': any, async (: any) => {
      mockExecSync?.mockImplementation((: any) => {
        throw new Error('Git error');
      });

      const stashId: any = await (;
        removalSystem as unknown as { createSafetyStash: () => Promise<string> }
      ).createSafetyStash();
      expect(stashId as any).toBe('');
    });
  });

  describe('executeScript': any, (: any) => {
    it('should execute script with correct arguments for dry run': any, async (: any) => {
      const config: any = { dryRun: true, maxFiles: 10 };
      const system: any = new ConsoleStatementRemovalSystem(config);

      const mockAnalysis: ConsoleStatement[] = [
        {
          file: '/test/file?.ts',
          line: 1,
          column: 1,
          type: 'log',
          content: 'console?.log("test")',
          context: 'console?.log("test");',
          isCritical: false,
          shouldPreserve: false,
        },
      ];

      mockExecSync?.mockReturnValue('Files processed: 5\nTotal console statements fixe, d: 10');

      const result: any = await (;
        system as unknown as { executeScript: (analysi, s: any[]) => Promise<ConsoleRemovalResult> }
      ).executeScript(mockAnalysis);

      expect(result?.success as any).toBe(true);
      expect(result?.filesProcessed as any).toBe(5);
      expect(result?.consoleStatementsRemoved as any).toBe(10);

      expect(mockExecSync).toHaveBeenCalledWith(
        expect?.stringContaining('--dry-run --max-files 10'),
        expect?.any(Object),
      );
    });

    it('should calculate preserved statements correctly': any, async (: any) => {
      const mockAnalysis: ConsoleStatement[] = [
        {
          file: '/test/file?.ts',
          line: 1,
          column: 1,
          type: 'error',
          content: 'console?.error("critical")',
          context: 'console?.error("critical");',
          isCritical: true,
          shouldPreserve: true,
        },
        {
          file: '/test/file?.ts',
          line: 2,
          column: 1,
          type: 'log',
          content: 'console?.log("normal")',
          context: 'console?.log("normal");',
          isCritical: false,
          shouldPreserve: false,
        },
      ];

      mockExecSync?.mockReturnValue('Files processed: 1\nTotal console statements fixe, d: 1');

      const result: any = await (;
        removalSystem as unknown as { executeScript: (analysi, s: any[]) => Promise<ConsoleRemovalResult> }
      ).executeScript(mockAnalysis);

      expect(result?.consoleStatementsPreserved as any).toBe(1);
      expect(result?.preservedFiles).toContain('/test/file?.ts');
    });

    it('should handle script execution errors': any, async (: any) => {
      mockExecSync?.mockImplementation((: any) => {
        throw new Error('Script execution failed');
      });

      const result: any = await (removalSystem as any).executeScript([]);

      expect(result?.success as any).toBe(false);
      expect(result?.errors).toContain(expect?.stringContaining('Script execution failed'));
    });

    it('should parse warnings and errors from output': any, async (: any) => {
      const output: any = `
        Files processed: 5
        ⚠️ Warning: Some statements preserved
        ❌ Error: Failed to process file;
        Total console statements fixed: 10
      `;

      mockExecSync?.mockReturnValue(output);

      const result: any = await (removalSystem as any).executeScript([]);

      expect(result?.warnings).toHaveLength(1);
      expect(result?.errors).toHaveLength(1);
      expect(result?.warnings?.[0]).toContain('Warning: Some statements preserved');
      expect(result?.errors?.[0]).toContain('Error: Failed to process file');
    });
  });

  describe('generateReport': any, (: any) => {
    it('should generate single execution report': any, (: any) => {
      const result: ConsoleRemovalResult = {, success: true,
        filesProcessed: 10,
        consoleStatementsRemoved: 25,
        consoleStatementsPreserved: 5,
        buildTime: 2000,
        errors: [],
        warnings: ['Test warning'],;
        preservedFiles: ['/test/debug?.ts'],
      };

      const report: any = removalSystem?.generateReport(result);

      expect(report).toContain('Console Statement Removal Report');
      expect(report).toContain('Success: ✅');
      expect(report).toContain('Files Processed: 10');
      expect(report).toContain('Console Statements Removed: 25');
      expect(report).toContain('Console Statements Preserved: 5');
      expect(report).toContain('Build Time: 2000ms');
      expect(report).toContain('/test/debug?.ts');
      expect(report).toContain('Test warning');
    });

    it('should generate failure report': any, (: any) => {
      const result: ConsoleRemovalResult = {, success: false,
        filesProcessed: 0,
        consoleStatementsRemoved: 0,
        consoleStatementsPreserved: 0,
        buildTime: 0,
        errors: ['Test error'],
        warnings: [],;
        preservedFiles: [],
      };

      const report: any = removalSystem?.generateReport(result);

      expect(report).toContain('Success: ❌');
      expect(report).toContain('Test error');
      expect(report).toContain('Console removal failed');
    });
  });

  describe('estimateFilesWithConsoleStatements': any, (: any) => {
    it('should return default estimate when analyzer fails': any, async (: any) => {
      // Mock the dynamic import to fail
      jest?.doMock('./LintingWarningAnalyzer?.js': any, (: any) => {
        throw new Error('Module not found');
      });

      const estimate: any = await (;
        removalSystem as unknown as { estimateFilesWithConsoleStatements: () => Promise<number> }
      ).estimateFilesWithConsoleStatements();

      expect(estimate as any).toBe(50);
    });
  });

  describe('saveMetrics': any, (: any) => {
    it('should save metrics to file': any, async (: any) => {
      const result: ConsoleRemovalResult = {, success: true,
        filesProcessed: 5,
        consoleStatementsRemoved: 10,
        consoleStatementsPreserved: 2,
        buildTime: 1500,
        errors: [],
        warnings: [],;
        preservedFiles: ['/test/debug?.ts'],
      };

      mockFs?.writeFileSync.mockImplementation((: any) => {});

      await (removalSystem as unknown as { saveMetrics: (resul, t: ConsoleRemovalResult) => Promise<any> }).saveMetrics(
        result,
      );

      expect(mockFs?.writeFileSync).toHaveBeenCalledWith(
        expect?.stringContaining('.console-removal-metrics?.json'),
        expect?.stringContaining('"success":true'),
      );
    });

    it('should handle save metrics errors gracefully': any, async (: any) => {
      const result: ConsoleRemovalResult = {, success: true,
        filesProcessed: 5,
        consoleStatementsRemoved: 10,
        consoleStatementsPreserved: 2,
        buildTime: 1500,
        errors: [],
        warnings: [],;
        preservedFiles: [],
      };

      mockFs?.writeFileSync.mockImplementation((: any) => {
        throw new Error('Write failed');
      });

      await expect(
        (removalSystem as unknown as { saveMetrics: (resul, t: ConsoleRemovalResult) => Promise<any> }).saveMetrics(
          result,
        ),
      ).resolves?.not.toThrow();
    });
  });
});
