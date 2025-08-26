/**
 * SafetyValidator Tests
 * Comprehensive test suite for the Safety Validation System
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import { SafetyValidator } from '../SafetyValidator';
import { ClassificationContext, CodeDomain, TypeReplacement } from '../types';

// Mock execSync for command execution tests
jest.mock('child_process');
const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;

// Mock fs for file system tests
jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('SafetyValidator', () => {
  let validator: SafetyValidator;

  beforeEach(() => {
    validator = new SafetyValidator();
    jest.clearAllMocks();
  });

  describe('TypeScript Compilation Validation', () => {
    test('handles successful compilation', async () => {
      mockExecSync.mockReturnValue('');

      const result = await validator.validateTypeScriptCompilation();

      expect(result.buildSuccessful).toBe(true);
      expect(result.compilationErrors).toHaveLength(0);
      expect(result.performanceMetrics).toBeDefined();
    });

    test('handles compilation errors', async () => {
      const errorOutput = `
        src/test.ts(10,5): error TS2322: Type 'string' is not assignable to type 'number'.
        src/test.ts(15,10): error TS2304: Cannot find name 'unknownVariable'.
        Found 2 errors.
      `;

      mockExecSync.mockImplementation(() => {
        const error = new Error('Compilation failed') as unknown;
        (error as any).stdout = errorOutput;
        throw error;
      });

      const result = await validator.validateTypeScriptCompilation();

      expect(result.buildSuccessful).toBe(false);
      expect(result.compilationErrors).toHaveLength(2);
      expect(result.compilationErrors[0]).toContain('error TS2322');
      expect(result.compilationErrors[1]).toContain('error TS2304');
    });

    test('handles compilation timeout', async () => {
      mockExecSync.mockImplementation(() => {
        const error = new Error('Timeout') as unknown;
        (error as any).code = 'TIMEOUT';
        throw error;
      });

      const result = await validator.validateTypeScriptCompilation();

      expect(result.buildSuccessful).toBe(false);
      expect(result.compilationErrors.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Build Validation After Batch', () => {
    test('validates build successfully', async () => {
      mockExecSync.mockReturnValue('');

      const result = await validator.validateBuildAfterBatch(['test.ts']);

      expect(result.buildSuccessful).toBe(true);
      expect(result.performanceMetrics).toBeDefined();
      expect(result.performanceMetrics?.buildTime ?? -1).toBeGreaterThanOrEqual(0);
    });

    test('includes test validation when requested', async () => {
      mockExecSync.mockReturnValue('');

      const result = await validator.validateBuildAfterBatch(['test.ts'], true);

      expect(result.buildSuccessful).toBe(true);
      expect(result.testResults).toBeDefined();
      expect(result.testResults?.testsPass ?? false).toBe(true);
    });

    test('handles performance threshold violations', async () => {
      // Mock slow build
      mockExecSync.mockImplementation(() => {
        // Simulate slow execution
        const start = Date.now();
        while (Date.now() - start < 100) {
          // Busy wait to simulate slow build
        }
        return '';
      });

      const slowValidator = new SafetyValidator(60000, {
        maximumBuildTime: 50 // Very low threshold
      });

      const result = await slowValidator.validateBuildAfterBatch(['test.ts']);

      expect(result.buildSuccessful).toBe(false);
      expect(result.compilationErrors.some(error =>
        error.includes('Build time') && error.includes('exceeds threshold')
      )).toBe(true);
    });
  });

  describe('Rollback Validation', () => {
    test('validates rollback capability successfully', async () => {
      const originalFiles = new Map([['test.ts', 'test.ts']]);
      const backupFiles = new Map([['test.ts', 'test.ts.backup']]);

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('backup content');
      mockFs.mkdirSync.mockReturnValue(undefined);
      mockFs.writeFileSync.mockReturnValue(undefined);
      mockFs.rmSync.mockReturnValue(undefined);

      const result = await validator.validateRollbackCapability(originalFiles, backupFiles);

      expect(result.canRollback).toBe(true);
      expect(result.backupIntegrity).toBe(true);
      expect(result.rollbackErrors).toHaveLength(0);
    });

    test('detects missing backup files', async () => {
      const originalFiles = new Map([['test.ts', 'test.ts']]);
      const backupFiles = new Map([['test.ts', 'missing.backup']]);

      mockFs.existsSync.mockReturnValue(false);

      const result = await validator.validateRollbackCapability(originalFiles, backupFiles);

      expect(result.canRollback).toBe(false);
      expect(result.backupIntegrity).toBe(false);
      expect(result.rollbackErrors).toContain('Backup file missing: missing.backup');
    });

    test('detects empty backup files', async () => {
      const originalFiles = new Map([['test.ts', 'test.ts']]);
      const backupFiles = new Map([['test.ts', 'empty.backup']]);

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(''); // Empty backup

      const result = await validator.validateRollbackCapability(originalFiles, backupFiles);

      expect(result.backupIntegrity).toBe(false);
      expect(result.rollbackErrors).toContain('Backup file is empty: empty.backup');
    });
  });

  describe('Safety Score Calculation', () => {
    test('calculates safety score for array replacement', () => {
      const replacement: TypeReplacement = {
        original: 'any[]',
        replacement: 'unknown[]',
        filePath: 'test.ts',
        lineNumber: 1,
        confidence: 0.9,
        validationRequired: true
      };

      const context: ClassificationContext = {
        filePath: 'test.ts',
        lineNumber: 1,
        codeSnippet: 'const items: any[] = [];',
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

      const result = validator.calculateSafetyScore(replacement, context);

      expect(result.isValid).toBe(true);
      expect(result.safetyScore).toBeGreaterThan(0.8);
      expect(result.validationErrors).toHaveLength(0);
    });

    test('reduces safety score for error handling contexts', () => {
      const replacement: TypeReplacement = {
        original: 'any',
        replacement: 'unknown',
        filePath: 'test.ts',
        lineNumber: 1,
        confidence: 0.8,
        validationRequired: true
      };

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

      const result = validator.calculateSafetyScore(replacement, errorContext);

      expect(result.safetyScore).toBeLessThan(0.8);
      expect(result.warnings.some(w => w.includes('Error handling context'))).toBe(true);
    });

    test('boosts safety score for test files', () => {
      const replacement: TypeReplacement = {
        original: 'any[]',
        replacement: 'unknown[]',
        filePath: 'test.test.ts',
        lineNumber: 1,
        confidence: 0.8,
        validationRequired: true
      };

      const testContext: ClassificationContext = {
        filePath: 'test.test.ts',
        lineNumber: 1,
        codeSnippet: 'const mockData: any[] = [];',
        surroundingLines: [],
        hasExistingComment: false,
        isInTestFile: true,
        domainContext: {
          domain: CodeDomain.TEST,
          intentionalityHints: [],
          suggestedTypes: [],
          preservationReasons: []
        }
      };

      const result = validator.calculateSafetyScore(replacement, testContext);

      expect(result.safetyScore).toBeGreaterThan(0.8);
    });

    test('warns about external API contexts', () => {
      const replacement: TypeReplacement = {
        original: 'any',
        replacement: 'unknown',
        filePath: 'api.ts',
        lineNumber: 1,
        confidence: 0.8,
        validationRequired: true
      };

      const apiContext: ClassificationContext = {
        filePath: 'api.ts',
        lineNumber: 1,
        codeSnippet: 'const response: any = await fetch("/api/data");',
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

      const result = validator.calculateSafetyScore(replacement, apiContext);

      expect(result.warnings.some(w => w.includes('External API context'))).toBe(true);
      expect(result.recommendations.some(r => r.includes('Verify API response types'))).toBe(true);
    });

    test('handles function parameter replacements with caution', () => {
      const replacement: TypeReplacement = {
        original: 'any',
        replacement: 'unknown',
        filePath: 'function.ts',
        lineNumber: 1,
        confidence: 0.8,
        validationRequired: true
      };

      const functionContext: ClassificationContext = {
        filePath: 'function.ts',
        lineNumber: 1,
        codeSnippet: 'function process(data: unknown) {',
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

      const result = validator.calculateSafetyScore(replacement, functionContext);

      expect(result.safetyScore).toBeLessThanOrEqual(0.8); // Function parameters are riskier
    });
  });

  describe('Safety Thresholds Management', () => {
    test('gets current safety thresholds', () => {
      const thresholds = validator.getSafetyThresholds();

      expect(thresholds.minimumSafetyScore).toBeDefined();
      expect(thresholds.maximumErrorCount).toBeDefined();
      expect(thresholds.maximumBuildTime).toBeDefined();
    });

    test('updates safety thresholds', () => {
      const newThresholds = {
        minimumSafetyScore: 0.9,
        maximumBuildTime: 60000
      };

      validator.updateSafetyThresholds(newThresholds);
      const updatedThresholds = validator.getSafetyThresholds();

      expect(updatedThresholds.minimumSafetyScore).toBe(0.9);
      expect(updatedThresholds.maximumBuildTime).toBe(60000);
    });
  });

  describe('Performance Metrics Validation', () => {
    test('validates acceptable performance metrics', () => {
      const fastValidator = new SafetyValidator(60000, {
        maximumBuildTime: 30000
      });

      const mockReplacement: TypeReplacement = {
        original: 'any[]',
        replacement: 'unknown[]',
        filePath: 'test.ts',
        lineNumber: 1,
        confidence: 0.9,
        validationRequired: true
      };

      const mockContext: ClassificationContext = {
        filePath: 'test.ts',
        lineNumber: 1,
        codeSnippet: 'const items: any[] = [];',
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

      const result = fastValidator.calculateSafetyScore(mockReplacement, mockContext);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Error Output Parsing', () => {
    test('parses TypeScript errors correctly', async () => {
      const complexErrorOutput = `
        src/file1.ts(10,5): error TS2322: Type 'string' is not assignable to type 'number'.
        src/file2.ts(15,10): error TS2304: Cannot find name 'unknownVariable'.
        src/file3.ts(20,15): error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.
        Found 3 errors.
      `;

      mockExecSync.mockImplementation(() => {
        const error = new Error('Compilation failed') as unknown;
        (error as any).stdout = complexErrorOutput;
        throw error;
      });

      const result = await validator.validateTypeScriptCompilation();

      expect(result.buildSuccessful).toBe(false);
      expect(result.compilationErrors).toHaveLength(3);
      expect(result.compilationErrors[0]).toContain('TS2322');
      expect(result.compilationErrors[1]).toContain('TS2304');
      expect(result.compilationErrors[2]).toContain('TS2345');
    });

    test('limits error count to maximum threshold', async () => {
      const manyErrorsOutput = Array.from({ length: 20 }, (_, i) =>
        `src/file${i}.ts(${i},5): error TS2322: Type error ${i}.`
      ).join('\n');

      mockExecSync.mockImplementation(() => {
        const error = new Error('Many errors') as unknown;
        (error as any).stdout = manyErrorsOutput;
        throw error;
      });

      const limitedValidator = new SafetyValidator(60000, {
        maximumErrorCount: 5
      });

      const result = await limitedValidator.validateTypeScriptCompilation();

      expect(result.compilationErrors.length).toBeLessThanOrEqual(5);
    });
  });
});
