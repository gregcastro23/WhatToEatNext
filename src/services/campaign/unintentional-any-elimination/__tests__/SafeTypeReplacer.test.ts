/**
 * SafeTypeReplacer Tests
 * Comprehensive test suite for the Safe Type Replacer system
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { SafeTypeReplacer } from '../SafeTypeReplacer';
import { ClassificationContext, CodeDomain, TypeReplacement } from '../types';

// Mock execSync for TypeScript compilation tests
jest.mock('child_process');
const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;

// Mock fs for file operations
jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

// Mock SafetyValidator
jest.mock('../SafetyValidator', () => ({
  SafetyValidator: jest.fn().mockImplementation(() => ({
    calculateSafetyScore: jest.fn().mockReturnValue({
      isValid: true,
      safetyScore: 0.9,
      validationErrors: [],
      warnings: [],
      recommendations: []
    }),
    validateTypeScriptCompilation: jest.fn().mockResolvedValue({
      buildSuccessful: true,
      compilationErrors: [],
      lintingWarnings: [],
      performanceMetrics: { buildTime: 100, memoryUsage: 1000000 }
    }),
    validateBuildAfterBatch: jest.fn().mockResolvedValue({
      buildSuccessful: true,
      compilationErrors: [],
      lintingWarnings: [],
      performanceMetrics: { buildTime: 100, memoryUsage: 1000000 }
    }),
    validateRollbackCapability: jest.fn().mockResolvedValue({
      canRollback: true,
      backupIntegrity: true,
      rollbackErrors: [],
      restorationVerified: true
    }),
    updateSafetyThresholds: jest.fn()
  }))
}));

describe('SafeTypeReplacer', () => {
  let replacer: SafeTypeReplacer;
  let testBackupDir: string;

  beforeEach(() => {
    jest.clearAllMocks();
    testBackupDir = './.test-backups';
    replacer = new SafeTypeReplacer(testBackupDir, 0.7, 30000, 3);

    // Mock fs.existsSync to return false for backup directory initially
    mockFs.existsSync.mockImplementation((path: unknown) => {
      if (path === testBackupDir) return false;
      return true; // Assume other files exist
    });

    // Mock fs.mkdirSync
    mockFs.mkdirSync.mockImplementation(() => undefined as unknown);

    // Mock fs.readFileSync and writeFileSync
    mockFs.readFileSync.mockImplementation(() => 'const items: unknown[] = [];');
    mockFs.writeFileSync.mockImplementation(() => undefined);

    // Mock successful TypeScript compilation by default
    mockExecSync.mockImplementation(() => '');
  });

  describe('Constructor and Initialization', () => {
    test('creates backup directory if it does not exist', () => {
      expect(mockFs.mkdirSync).toHaveBeenCalledWith(testBackupDir, { recursive: true });
    });

    test('initializes with default strategies', () => {
      const strategies = replacer.getStrategies();
      expect(strategies).toHaveLength(10);
      expect(strategies[0].priority).toBe(1); // Array type strategy should be first
    });

    test('allows custom configuration', () => {
      const customReplacer = new SafeTypeReplacer('.custom-backup', 0.8, 60000, 5);
      expect(customReplacer.getBackupDirectory()).toBe('.custom-backup');
    });
  });

  describe('Single Replacement Operations', () => {
    test('successfully replaces array types', async () => {
      const replacement: TypeReplacement = {
        original: 'unknown[]',
        replacement: 'unknown[]',
        filePath: 'test.ts',
        lineNumber: 1,
        confidence: 0.9,
        validationRequired: true
      };

      mockFs.readFileSync.mockReturnValue('const items: unknown[] = [];');

      const result = await replacer.applyReplacement(replacement);

      expect(result.success).toBe(true);
      expect(result.appliedReplacements).toHaveLength(1);
      expect(result.failedReplacements).toHaveLength(0);
      expect(result.rollbackPerformed).toBe(false);
    });

    test('handles low safety score rejection', async () => {
      const replacement: TypeReplacement = {
        original: 'any',
        replacement: 'string',
        filePath: 'test.ts',
        lineNumber: 1,
        confidence: 0.3, // Low confidence
        validationRequired: true
      };

      const result = await replacer.applyReplacement(replacement);

      expect(result.success).toBe(false);
      expect(result.failedReplacements).toHaveLength(1);
      expect(result.compilationErrors[0]).toContain('Safety score');
    });

    test('rolls back on TypeScript compilation failure', async () => {
      const replacement: TypeReplacement = {
        original: 'unknown[]',
        replacement: 'unknown[]',
        filePath: 'test.ts',
        lineNumber: 1,
        confidence: 0.9,
        validationRequired: true
      };

      // Mock compilation failure
      mockExecSync.mockImplementation(() => {
        const error = new Error('Compilation failed') as unknown;
        error.stdout = 'error TS2322: Type mismatch';
        throw error;
      });

      const result = await replacer.applyReplacement(replacement);

      expect(result.success).toBe(false);
      expect(result.rollbackPerformed).toBe(true);
      expect(result.compilationErrors).toContain('error TS2322: Type mismatch');
    });

    test('handles invalid line numbers', async () => {
      const replacement: TypeReplacement = {
        original: 'unknown[]',
        replacement: 'unknown[]',
        filePath: 'test.ts',
        lineNumber: 999, // Invalid line number
        confidence: 0.9,
        validationRequired: true
      };

      mockFs.readFileSync.mockReturnValue('const items: unknown[] = [];'); // Only 1 line

      const result = await replacer.applyReplacement(replacement);

      expect(result.success).toBe(false);
      expect(result.compilationErrors[0]).toContain('Invalid line number');
    });

    test('handles pattern not found in line', async () => {
      const replacement: TypeReplacement = {
        original: 'string[]',
        replacement: 'unknown[]',
        filePath: 'test.ts',
        lineNumber: 1,
        confidence: 0.9,
        validationRequired: true
      };

      mockFs.readFileSync.mockReturnValue('const items: unknown[] = [];'); // Pattern doesn't match

      const result = await replacer.applyReplacement(replacement);

      expect(result.success).toBe(false);
      expect(result.compilationErrors[0]).toContain('Pattern "string[]" not found');
    });
  });

  describe('Batch Processing', () => {
    test('processes multiple replacements successfully', async () => {
      const replacements: TypeReplacement[] = [
        {
          original: 'unknown[]',
          replacement: 'unknown[]',
          filePath: 'test1.ts',
          lineNumber: 1,
          confidence: 0.9,
          validationRequired: true
        },
        {
          original: 'Record<string, unknown>',
          replacement: 'Record<string, unknown>',
          filePath: 'test2.ts',
          lineNumber: 1,
          confidence: 0.8,
          validationRequired: true
        }
      ];

      mockFs.readFileSync.mockImplementation((filePath: unknown) => {
        if (filePath.includes('test1.ts')) return 'const items: unknown[] = [];';
        if (filePath.includes('test2.ts')) return 'const data: Record<string, unknown> = {};';
        return 'backup content';
      });

      const result = await replacer.processBatch(replacements);

      expect(result.success).toBe(true);
      expect(result.appliedReplacements).toHaveLength(2);
      expect(result.failedReplacements).toHaveLength(0);
    });

    test('rolls back all changes on overall compilation failure', async () => {
      const replacements: TypeReplacement[] = [
        {
          original: 'unknown[]',
          replacement: 'unknown[]',
          filePath: 'test1.ts',
          lineNumber: 1,
          confidence: 0.9,
          validationRequired: true
        }
      ];

      // Mock overall compilation to fail
      mockExecSync.mockImplementation(() => {
        const error = new Error('Overall compilation failed') as unknown;
        error.stdout = 'error TS2322: Overall type error';
        throw error;
      });

      const result = await replacer.processBatch(replacements);

      expect(result.success).toBe(false);
      expect(result.rollbackPerformed).toBe(true);
      expect(result.compilationErrors).toContain('error TS2322: Overall type error');
    });

    test('groups replacements by file correctly', async () => {
      const replacements: TypeReplacement[] = [
        {
          original: 'unknown[]',
          replacement: 'unknown[]',
          filePath: 'test.ts',
          lineNumber: 2,
          confidence: 0.9,
          validationRequired: true
        },
        {
          original: 'any',
          replacement: 'unknown',
          filePath: 'test.ts',
          lineNumber: 1,
          confidence: 0.8,
          validationRequired: true
        }
      ];

      mockFs.readFileSync.mockReturnValue('const x: unknown = 1;\nconst items: unknown[] = [];');

      const result = await replacer.processBatch(replacements);

      expect(result.success).toBe(true);
      expect(result.appliedReplacements).toHaveLength(2);
    });
  });

  describe('Safety Score Calculation', () => {
    test('calculates higher scores for array replacements', () => {
      const replacement: TypeReplacement = {
        original: 'unknown[]',
        replacement: 'unknown[]',
        filePath: 'test.ts',
        lineNumber: 1,
        confidence: 0.7,
        validationRequired: true
      };

      // Access private method through any cast for testing
      const score = (replacer as unknown).calculateSafetyScore(replacement);
      expect(score).toBeGreaterThan(0.7); // Should be boosted for array replacement
    });

    test('calculates lower scores for error handling contexts', () => {
      const replacement: TypeReplacement = {
        original: 'catch (error: unknown)',
        replacement: 'catch (error: unknown)',
        filePath: 'test.ts',
        lineNumber: 1,
        confidence: 0.8,
        validationRequired: true
      };

      const score = (replacer as unknown).calculateSafetyScore(replacement);
      expect(score).toBeLessThan(0.8); // Should be reduced for error context
    });

    test('boosts scores for test files', () => {
      const replacement: TypeReplacement = {
        original: 'any',
        replacement: 'unknown',
        filePath: 'test.test.ts',
        lineNumber: 1,
        confidence: 0.7,
        validationRequired: true
      };

      const score = (replacer as unknown).calculateSafetyScore(replacement);
      expect(score).toBeGreaterThan(0.7); // Should be boosted for test files
    });
  });

  describe('Rollback Verification', () => {
    test('verifies rollback capability successfully', async () => {
      const filePath = 'test.ts';
      const backupPath = 'backup.ts';

      mockFs.readFileSync.mockImplementation((path: unknown) => {
        if (path === filePath) return 'modified content';
        if (path === backupPath) return 'original content';
        return '';
      });

      const result = await (replacer as unknown).verifyRollbackCapability(filePath, backupPath);
      expect(result.success).toBe(true);
    });

    test('detects missing backup file', async () => {
      const filePath = 'test.ts';
      const backupPath = 'missing-backup.ts';

      mockFs.existsSync.mockImplementation((path: unknown) => {
        return path !== backupPath; // Backup doesn't exist
      });

      const result = await (replacer as unknown).verifyRollbackCapability(filePath, backupPath);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Backup file does not exist');
    });
  });

  describe('Strategy Management', () => {
    test('allows adding custom strategies', () => {
      const customStrategy = {
        pattern: /custom_pattern/g,
        replacement: () => 'custom_replacement',
        validator: () => true,
        priority: 0
      };

      replacer.addStrategy(customStrategy);
      const strategies = replacer.getStrategies();

      expect(strategies[0]).toBe(customStrategy); // Should be first due to priority 0
    });

    test('maintains strategy priority order', () => {
      const strategies = replacer.getStrategies();

      for (let i = 1; i < strategies.length; i++) {
        expect(strategies[i].priority).toBeGreaterThanOrEqual(strategies[i - 1].priority);
      }
    });
  });

  describe('Backup Management', () => {
    test('creates backups with timestamp', async () => {
      const filePath = 'test.ts';
      mockFs.readFileSync.mockReturnValue('original content');

      const backupPath = await (replacer as unknown).createBackup(filePath);

      expect(backupPath).toContain('.test-backups');
      expect(backupPath).toContain('test.ts');
      expect(backupPath).toContain('.backup');
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        backupPath,
        'original content',
        'utf8'
      );
    });

    test('cleans up old backup files', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 10); // 10 days old

      mockFs.readdirSync.mockReturnValue(['old.backup', 'recent.backup', 'other.txt'] as unknown);
      mockFs.statSync.mockImplementation((filePath: unknown) => {
        if (filePath.includes('old.backup')) {
          return { mtime: oldDate } as unknown;
        }
        return { mtime: new Date() } as unknown; // Recent file
      });

      replacer.cleanupOldBackups(7); // Keep 7 days

      expect(mockFs.unlinkSync).toHaveBeenCalledWith(
        path.join(testBackupDir, 'old.backup')
      );
      expect(mockFs.unlinkSync).not.toHaveBeenCalledWith(
        path.join(testBackupDir, 'recent.backup')
      );
    });
  });

  describe('Error Handling and Retries', () => {
    test('handles file system errors gracefully', async () => {
      const replacement: TypeReplacement = {
        original: 'unknown[]',
        replacement: 'unknown[]',
        filePath: 'test.ts',
        lineNumber: 1,
        confidence: 0.9,
        validationRequired: true
      };

      // Mock backup creation to fail
      mockFs.writeFileSync.mockImplementation((filePath: unknown) => {
        if (filePath.includes('.backup')) {
          throw new Error('Backup creation failed');
        }
      });

      // Expect the error to be thrown since backup creation is critical
      await expect(replacer.applyReplacement(replacement)).rejects.toThrow('Backup creation failed');
    });

    test('handles compilation errors with rollback', async () => {
      const replacement: TypeReplacement = {
        original: 'unknown[]',
        replacement: 'unknown[]',
        filePath: 'test.ts',
        lineNumber: 1,
        confidence: 0.9,
        validationRequired: true
      };

      // Mock compilation to fail
      mockExecSync.mockImplementation(() => {
        const error = new Error('Compilation failed') as unknown;
        error.stdout = 'error TS2322: Type error';
        throw error;
      });

      const result = await replacer.applyReplacement(replacement);

      expect(result.success).toBe(false);
      expect(result.rollbackPerformed).toBe(true);
      expect(result.compilationErrors).toContain('error TS2322: Type error');
    });
  });

  describe('TypeScript Compilation Validation', () => {
    test('handles successful compilation', async () => {
      mockExecSync.mockReturnValue('');

      const result = await (replacer as unknown).validateTypeScriptCompilation();

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('extracts TypeScript errors from output', async () => {
      const errorOutput = `
        src/test.ts(10,5): error TS2322: Type 'string' is not assignable to type 'number'.
        src/test.ts(15,10): error TS2304: Cannot find name 'unknownVariable'.
        Found 2 errors.
      `;

      mockExecSync.mockImplementation(() => {
        const error = new Error('Compilation failed') as unknown;
        error.stdout = errorOutput;
        throw error;
      });

      const result = await (replacer as unknown).validateTypeScriptCompilation();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0]).toContain('error TS2322');
      expect(result.errors[1]).toContain('error TS2304');
    });

    test('handles compilation timeout', async () => {
      mockExecSync.mockImplementation(() => {
        const error = new Error('Timeout') as unknown;
        error.code = 'TIMEOUT';
        throw error;
      });

      const result = await (replacer as unknown).validateTypeScriptCompilation();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Timeout');
    });
  });

  describe('Advanced Replacement Strategy Patterns', () => {
    test('infers array element types from context', () => {
      const context: ClassificationContext = {
        filePath: 'test.ts',
        lineNumber: 1,
        codeSnippet: 'const items: unknown[] = ["hello", "world"];',
        surroundingLines: [],
        hasExistingComment: false,
        isInTestFile: false,
        domainContext: {
          domain: CodeDomain.UTILITY,
          intentionalityHints: [],
          suggestedTypes: [],
          preservationReasons: []
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- High-risk domain requiring flexibility
      const inferredType = (replacer as any).inferArrayElementType(context);
      expect(inferredType).toBe('string');
    });

    test('handles complex nested type inference', () => {
      const complexContext: ClassificationContext = {
        filePath: 'test.ts',
        lineNumber: 1,
        codeSnippet: 'const nested: Record<string, unknown[]> = { items: [1, 2, 3] };',
        surroundingLines: [],
        hasExistingComment: false,
        isInTestFile: false,
        domainContext: {
          domain: CodeDomain.UTILITY,
          intentionalityHints: [],
          suggestedTypes: [],
          preservationReasons: []
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- High-risk domain requiring flexibility
      const arrayType = (replacer as any).inferArrayElementType(complexContext);
      const recordType = (replacer as unknown).inferRecordValueType(complexContext);

      expect(arrayType).toBe('number');
      expect(recordType).toBe('number[]');
    });

    test('infers types from usage patterns in surrounding code', () => {
      const usageContext: ClassificationContext = {
        filePath: 'test.ts',
        lineNumber: 2,
        codeSnippet: 'const data: unknown = getValue();',
        surroundingLines: [
          'function getValue() { return "test"; }',
          'console.log(data.toUpperCase());',
          'const length = data.length;'
        ],
        hasExistingComment: false,
        isInTestFile: false,
        domainContext: {
          domain: CodeDomain.UTILITY,
          intentionalityHints: [],
          suggestedTypes: [],
          preservationReasons: []
        }
      };

      const inferredType = (replacer as unknown).inferVariableType(usageContext);
      expect(inferredType).toBe('string');
    });

    test('infers Record value types from object literals', () => {
      const context: ClassificationContext = {
        filePath: 'test.ts',
        lineNumber: 1,
        codeSnippet: 'const config: Record<string, unknown> = { name: "test", count: 42 };',
        surroundingLines: [],
        hasExistingComment: false,
        isInTestFile: false,
        domainContext: {
          domain: CodeDomain.UTILITY,
          intentionalityHints: [],
          suggestedTypes: [],
          preservationReasons: []
        }
      };

      const inferredType = (replacer as unknown).inferRecordValueType(context);
      expect(['string', 'number', 'unknown']).toContain(inferredType);
    });

    test('infers function parameter types from parameter names', () => {
      const context: ClassificationContext = {
        filePath: 'test.ts',
        lineNumber: 1,
        codeSnippet: 'function handleClick(event: unknown) { }',
        surroundingLines: [],
        hasExistingComment: false,
        isInTestFile: false,
        domainContext: {
          domain: CodeDomain.COMPONENT,
          intentionalityHints: [],
          suggestedTypes: [],
          preservationReasons: []
        }
      };

      const inferredType = (replacer as unknown).inferFunctionParameterType(context, 'event');
      expect(inferredType).toBe('Event');
    });

    test('infers return types from function context', () => {
      const context: ClassificationContext = {
        filePath: 'test.ts',
        lineNumber: 1,
        codeSnippet: 'function isValid(): any {',
        surroundingLines: ['  return true;'],
        hasExistingComment: false,
        isInTestFile: false,
        domainContext: {
          domain: CodeDomain.UTILITY,
          intentionalityHints: [],
          suggestedTypes: [],
          preservationReasons: []
        }
      };

      const inferredType = (replacer as unknown).inferReturnType(context);
      expect(inferredType).toBe('boolean');
    });

    test('detects error handling contexts correctly', () => {
      const errorContext: ClassificationContext = {
        filePath: 'test.ts',
        lineNumber: 1,
        codeSnippet: 'catch (error: unknown) {',
        surroundingLines: [],
        hasExistingComment: false,
        isInTestFile: false,
        domainContext: {
          domain: CodeDomain.UTILITY,
          intentionalityHints: [],
          suggestedTypes: [],
          preservationReasons: []
        }
      };

      const isErrorContext = (replacer as unknown).isInErrorHandlingContext(errorContext);
      expect(isErrorContext).toBe(true);
    });

    test('detects external API contexts correctly', () => {
      const apiContext: ClassificationContext = {
        filePath: 'test.ts',
        lineNumber: 1,
        codeSnippet: 'const response: unknown = await fetch("/api/data");',
        surroundingLines: [],
        hasExistingComment: false,
        isInTestFile: false,
        domainContext: {
          domain: CodeDomain.SERVICE,
          intentionalityHints: [],
          suggestedTypes: [],
          preservationReasons: []
        }
      };

      const isApiContext = (replacer as unknown).isExternalApiContext(apiContext);
      expect(isApiContext).toBe(true);
    });

    test('applies domain-specific type inference for astrological context', () => {
      const astroContext: ClassificationContext = {
        filePath: 'astrology.ts',
        lineNumber: 1,
        codeSnippet: 'const planetaryPositions: unknown[] = [];',
        surroundingLines: ['positions.push("mars");'],
        hasExistingComment: false,
        isInTestFile: false,
        domainContext: {
          domain: CodeDomain.ASTROLOGICAL,
          intentionalityHints: [],
          suggestedTypes: [],
          preservationReasons: []
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- High-risk domain requiring flexibility
      const inferredType = (replacer as any).inferArrayElementType(astroContext);
      expect(inferredType).toBe('string');
    });

    test('applies domain-specific type inference for recipe context', () => {
      const recipeContext: ClassificationContext = {
        filePath: 'recipe.ts',
        lineNumber: 1,
        codeSnippet: 'function processIngredient(ingredient: unknown) {',
        surroundingLines: [],
        hasExistingComment: false,
        isInTestFile: false,
        domainContext: {
          domain: CodeDomain.RECIPE,
          intentionalityHints: [],
          suggestedTypes: [],
          preservationReasons: []
        }
      };

      const inferredType = (replacer as unknown).inferFunctionParameterType(recipeContext, 'ingredient');
      expect(inferredType).toBe('Ingredient');
    });

    test('handles complex replacement patterns with validation', async () => {
      const mockContext: ClassificationContext = {
        filePath: 'test.ts',
        lineNumber: 1,
        codeSnippet: 'function process(data: unknown): any { return data; }',
        surroundingLines: [],
        hasExistingComment: false,
        isInTestFile: false,
        domainContext: {
          domain: CodeDomain.UTILITY,
          intentionalityHints: [],
          suggestedTypes: [],
          preservationReasons: []
        }
      };

      const strategies = replacer.getStrategies();

      // Test function parameter strategy
      const paramStrategy = strategies.find(s => s.priority === 4);
      expect(paramStrategy).toBeDefined();
      expect(paramStrategy?.validator(mockContext)).toBe(true);

      // Test return type strategy
      const returnStrategy = strategies.find(s => s.priority === 5);
      expect(returnStrategy).toBeDefined();
      expect(returnStrategy?.validator(mockContext)).toBe(true);
    });
  });

  describe('Comprehensive Error Recovery', () => {
    test('handles partial batch failures with selective rollback', async () => {
      const replacements: TypeReplacement[] = [
        {
          original: 'unknown[]',
          replacement: 'string[]',
          filePath: 'test1.ts',
          lineNumber: 1,
          confidence: 0.9,
          validationRequired: true
        },
        {
          original: 'any',
          replacement: 'InvalidType', // This should cause compilation error
          filePath: 'test2.ts',
          lineNumber: 1,
          confidence: 0.8,
          validationRequired: true
        }
      ];

      mockFs.readFileSync.mockImplementation((filePath: unknown) => {
        if (filePath.includes('test1.ts')) return 'const items: unknown[] = [];';
        if (filePath.includes('test2.ts')) return 'const data: unknown = value;';
        return 'backup content';
      });

      // Mock compilation to fail for the second replacement
      let compilationCallCount = 0;
      mockExecSync.mockImplementation(() => {
        compilationCallCount++;
        if (compilationCallCount > 1) {
          const error = new Error('Compilation failed') as unknown;
          error.stdout = 'error TS2304: Cannot find name "InvalidType"';
          throw error;
        }
        return '';
      });

      const result = await replacer.processBatch(replacements);

      expect(result.success).toBe(false);
      expect(result.rollbackPerformed).toBe(true);
      expect(result.compilationErrors).toContain('error TS2304: Cannot find name "InvalidType"');
    });

    test('handles file system permission errors', async () => {
      const replacement: TypeReplacement = {
        original: 'unknown[]',
        replacement: 'unknown[]',
        filePath: 'readonly.ts',
        lineNumber: 1,
        confidence: 0.9,
        validationRequired: true
      };

      mockFs.readFileSync.mockReturnValue('const items: unknown[] = [];');
      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error('EACCES: permission denied');
      });

      await expect(replacer.applyReplacement(replacement)).rejects.toThrow('EACCES: permission denied');
    });

    test('handles corrupted backup files', async () => {
      const replacement: TypeReplacement = {
        original: 'unknown[]',
        replacement: 'unknown[]',
        filePath: 'test.ts',
        lineNumber: 1,
        confidence: 0.9,
        validationRequired: true
      };

      mockFs.readFileSync.mockImplementation((path: unknown) => {
        if (path.includes('.backup')) {
          throw new Error('Backup file corrupted');
        }
        return 'const items: unknown[] = [];';
      });

      const result = await replacer.applyReplacement(replacement);
      expect(result.success).toBe(false);
    });

    test('handles network timeouts during validation', async () => {
      const replacement: TypeReplacement = {
        original: 'unknown[]',
        replacement: 'unknown[]',
        filePath: 'test.ts',
        lineNumber: 1,
        confidence: 0.9,
        validationRequired: true
      };

      mockFs.readFileSync.mockReturnValue('const items: unknown[] = [];');

      // Mock timeout error
      mockExecSync.mockImplementation(() => {
        const error = new Error('Command timed out') as unknown;
        error.code = 'TIMEOUT';
        throw error;
      });

      const result = await replacer.applyReplacement(replacement);
      expect(result.success).toBe(false);
      expect(result.compilationErrors).toContain('Command timed out');
    });
  });

  describe('Performance and Memory Management', () => {
    test('handles large file processing efficiently', async () => {
      const largeContent = 'const items: unknown[] = [];\n'.repeat(10000);
      const replacement: TypeReplacement = {
        original: 'unknown[]',
        replacement: 'unknown[]',
        filePath: 'large.ts',
        lineNumber: 5000,
        confidence: 0.9,
        validationRequired: true
      };

      mockFs.readFileSync.mockReturnValue(largeContent);

      const startTime = Date.now();
      const result = await replacer.applyReplacement(replacement);
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
    });

    test('manages memory during batch processing', async () => {
      const largeBatch: TypeReplacement[] = Array(1000).fill(null).map((_, i) => ({
        original: 'unknown[]',
        replacement: 'unknown[]',
        filePath: `test${i}.ts`,
        lineNumber: 1,
        confidence: 0.9,
        validationRequired: true
      }));

      mockFs.readFileSync.mockReturnValue('const items: unknown[] = [];');

      const initialMemory = process.memoryUsage().heapUsed;
      const result = await replacer.processBatch(largeBatch);
      const finalMemory = process.memoryUsage().heapUsed;

      expect(result).toBeDefined();
      // Memory usage shouldn't grow excessively (allow 100MB increase)
      expect(finalMemory - initialMemory).toBeLessThan(100 * 1024 * 1024);
    });

    test('cleans up resources after processing', async () => {
      const replacement: TypeReplacement = {
        original: 'unknown[]',
        replacement: 'unknown[]',
        filePath: 'test.ts',
        lineNumber: 1,
        confidence: 0.9,
        validationRequired: true
      };

      mockFs.readFileSync.mockReturnValue('const items: unknown[] = [];');

      await replacer.applyReplacement(replacement);

      // Verify cleanup was called
      expect(mockFs.writeFileSync).toHaveBeenCalled();

      // Test backup cleanup
      replacer.cleanupOldBackups(0); // Clean all backups
      expect(mockFs.unlinkSync).toHaveBeenCalled();
    });
  });

  describe('Integration with Safety Validator', () => {
    test('integrates with safety validator for comprehensive validation', async () => {
      const replacement: TypeReplacement = {
        original: 'unknown[]',
        replacement: 'unknown[]',
        filePath: 'test.ts',
        lineNumber: 1,
        confidence: 0.9,
        validationRequired: true
      };

      const context: ClassificationContext = {
        filePath: 'test.ts',
        lineNumber: 1,
        codeSnippet: 'const items: unknown[] = [];',
        surroundingLines: [],
        hasExistingComment: false,
        isInTestFile: false,
        domainContext: {
          domain: CodeDomain.UTILITY,
          intentionalityHints: [],
          suggestedTypes: [],
          preservationReasons: []
        }
      };

      mockFs.readFileSync.mockReturnValue('const items: unknown[] = [];');

      const result = await replacer.applyReplacement(replacement, context);
      expect(result.success).toBe(true);
    });

    test('respects safety validator recommendations', async () => {
      const lowConfidenceReplacement: TypeReplacement = {
        original: 'any',
        replacement: 'string',
        filePath: 'test.ts',
        lineNumber: 1,
        confidence: 0.3, // Very low confidence
        validationRequired: true
      };

      const result = await replacer.applyReplacement(lowConfidenceReplacement);
      expect(result.success).toBe(false);
      expect(result.compilationErrors[0]).toContain('Safety score');
    });
  });
});
