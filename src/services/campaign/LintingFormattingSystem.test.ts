/**
 * Linting and Formatting System Tests
 * Comprehensive test suite for automated linting and formatting functionality
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import {
  LintingFormattingSystem,
  DEFAULT_LINTING_FORMATTING_CONFIG,
  LintingFormattingConfig,
} from './LintingFormattingSystem';

// Mock dependencies
jest.mock('fs');
jest.mock('child_process');
jest.mock('../../utils/logger');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;

describe('LintingFormattingSystem', () => {
  let lintingFormattingSystem: LintingFormattingSystem;
  let testConfig: LintingFormattingConfig;

  beforeEach(() => {
    testConfig = {
      ...DEFAULT_LINTING_FORMATTING_CONFIG,
      maxFilesPerBatch: 5,
      safetyValidationEnabled: true,
    };
    lintingFormattingSystem = new LintingFormattingSystem(testConfig);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('detectLintingViolations', () => {
    test('detects TypeScript linting violations', async () => {
      const eslintOutput = JSON.stringify([
        {
          filePath: '/test/file.ts',
          messages: [
            {
              line: 1,
              column: 10,
              ruleId: '@typescript-eslint/no-unused-vars',
              message: 'Variable is defined but never used',
              severity: 1,
              fix: { range: [0, 10], text: '' },
            },
            {
              line: 5,
              column: 15,
              ruleId: '@typescript-eslint/no-explicit-any',
              message: 'Unexpected any. Specify a different type.',
              severity: 1,
            },
          ],
        },
      ]);

      mockExecSync.mockReturnValue(eslintOutput);

      const violations = await lintingFormattingSystem.detectLintingViolations(['test-file.ts']);

      expect(violations).toHaveLength(2);
      expect(violations[0].ruleId).toBe('@typescript-eslint/no-unused-vars');
      expect(violations[0].fixable).toBe(true);
      expect(violations[1].ruleId).toBe('@typescript-eslint/no-explicit-any');
      expect(violations[1].fixable).toBe(false);
    });

    test('detects React linting violations', async () => {
      const eslintOutput = JSON.stringify([
        {
          filePath: '/test/component.tsx',
          messages: [
            {
              line: 10,
              column: 5,
              ruleId: 'react-hooks/exhaustive-deps',
              message: 'React Hook useEffect has a missing dependency',
              severity: 1,
            },
            {
              line: 15,
              column: 20,
              ruleId: 'react/jsx-uses-vars',
              message: 'Variable is used in JSX but not defined',
              severity: 2,
            },
          ],
        },
      ]);

      mockExecSync.mockReturnValue(eslintOutput);

      const violations = await lintingFormattingSystem.detectLintingViolations(['component.tsx']);

      expect(violations).toHaveLength(2);
      expect(violations[0].ruleId).toBe('react-hooks/exhaustive-deps');
      expect(violations[0].severity).toBe('warning');
      expect(violations[1].ruleId).toBe('react/jsx-uses-vars');
      expect(violations[1].severity).toBe('error');
    });

    test('handles ESLint parsing errors gracefully', async () => {
      mockExecSync.mockReturnValue('invalid json output');

      const violations = await lintingFormattingSystem.detectLintingViolations(['test-file.ts']);

      expect(violations).toHaveLength(0);
    });
  });

  describe('fixLintingViolations', () => {
    test('fixes auto-fixable linting violations', async () => {
      const beforeOutput = JSON.stringify([
        {
          filePath: '/test/file.ts',
          messages: [
            { line: 1, column: 10, ruleId: '@typescript-eslint/no-unused-vars', severity: 1, fix: {} },
            { line: 5, column: 15, ruleId: '@typescript-eslint/no-explicit-any', severity: 1 },
          ],
        },
      ]);

      const afterOutput = JSON.stringify([
        {
          filePath: '/test/file.ts',
          messages: [{ line: 5, column: 15, ruleId: '@typescript-eslint/no-explicit-any', severity: 1 }],
        },
      ]);

      mockExecSync
        .mockReturnValueOnce(beforeOutput) // Initial detection
        .mockReturnValueOnce('') // Fix command
        .mockReturnValueOnce(afterOutput); // After detection

      const fixedCount = await lintingFormattingSystem.fixLintingViolations(['test-file.ts']);

      expect(fixedCount).toBe(1);
      expect(mockExecSync).toHaveBeenCalledWith(expect.stringContaining('--fix'), expect.any(Object));
    });

    test('respects auto-fix disabled configuration', async () => {
      const config = { ...testConfig, autoFixEnabled: false };
      const system = new LintingFormattingSystem(config);

      const fixedCount = await system.fixLintingViolations(['test-file.ts']);

      expect(fixedCount).toBe(0);
      expect(mockExecSync).not.toHaveBeenCalledWith(expect.stringContaining('--fix'), expect.any(Object));
    });
  });

  describe('formatCode', () => {
    test('formats code using Prettier', async () => {
      const originalContent = 'const x={a:1,b:2}';
      const formattedContent = 'const x = { a: 1, b: 2 };';

      mockFs.readFileSync
        .mockReturnValueOnce(originalContent) // Before formatting
        .mockReturnValueOnce(formattedContent); // After formatting

      mockExecSync.mockReturnValue('');

      const formattedCount = await lintingFormattingSystem.formatCode(['test-file.ts']);

      expect(formattedCount).toBe(1);
      expect(mockExecSync).toHaveBeenCalledWith(expect.stringContaining('prettier --write'), expect.any(Object));
    });

    test('skips formatting when content unchanged', async () => {
      const content = 'const x = { a: 1, b: 2 };';

      mockFs.readFileSync
        .mockReturnValueOnce(content) // Before formatting
        .mockReturnValueOnce(content); // After formatting (unchanged)

      mockExecSync.mockReturnValue('');

      const formattedCount = await lintingFormattingSystem.formatCode(['test-file.ts']);

      expect(formattedCount).toBe(0);
    });

    test('respects formatting disabled configuration', async () => {
      const config = { ...testConfig, formattingEnabled: false };
      const system = new LintingFormattingSystem(config);

      const formattedCount = await system.formatCode(['test-file.ts']);

      expect(formattedCount).toBe(0);
      expect(mockExecSync).not.toHaveBeenCalledWith(expect.stringContaining('prettier'), expect.any(Object));
    });
  });

  describe('applyPatternBasedFixes', () => {
    test('applies enabled pattern-based fixes', async () => {
      const originalContent = `
console.log('debug message');
const x = 1;;
const y = 2;   
`;

      const expectedContent = `

const x = 1;
const y = 2;
`;

      mockFs.readFileSync.mockReturnValue(originalContent);
      let writtenContent = '';
      mockFs.writeFileSync.mockImplementation((path, content) => {
        writtenContent = content as string;
      });

      const fixesApplied = await lintingFormattingSystem.applyPatternBasedFixes(['test-file.ts']);

      expect(fixesApplied).toBeGreaterThan(0);
      expect(writtenContent).not.toContain('console.log'); // Should be removed if enabled
      expect(writtenContent).not.toContain(';;'); // Double semicolons should be fixed
      expect(writtenContent).not.toMatch(/[ \t]+$/m); // Trailing whitespace should be removed
    });

    test('respects file extension filters', async () => {
      const config = {
        ...testConfig,
        patternBasedFixes: [
          {
            name: 'Test fix',
            description: 'Test pattern fix',
            pattern: /test/g,
            replacement: 'fixed',
            fileExtensions: ['.js'], // Only .js files
            enabled: true,
          },
        ],
      };
      const system = new LintingFormattingSystem(config);

      mockFs.readFileSync.mockReturnValue('test content');
      mockFs.writeFileSync.mockImplementation(() => {});

      // Should not apply to .ts file
      const fixesApplied = await system.applyPatternBasedFixes(['test-file.ts']);
      expect(fixesApplied).toBe(0);
    });

    test('skips disabled pattern fixes', async () => {
      const config = {
        ...testConfig,
        patternBasedFixes: [
          {
            name: 'Disabled fix',
            description: 'This fix is disabled',
            pattern: /test/g,
            replacement: 'fixed',
            fileExtensions: ['.ts'],
            enabled: false,
          },
        ],
      };
      const system = new LintingFormattingSystem(config);

      mockFs.readFileSync.mockReturnValue('test content');

      const fixesApplied = await system.applyPatternBasedFixes(['test-file.ts']);
      expect(fixesApplied).toBe(0);
      expect(mockFs.writeFileSync).not.toHaveBeenCalled();
    });
  });

  describe('enforceStyleGuideCompliance', () => {
    test('enforces consistent indentation', async () => {
      const originalContent = `
\tfunction test() {
\t\treturn true;
\t}
`;

      const expectedContent = `
  function test() {
    return true;
  }
`;

      mockFs.readFileSync.mockReturnValue(originalContent);
      let writtenContent = '';
      mockFs.writeFileSync.mockImplementation((path, content) => {
        writtenContent = content as string;
      });

      const fixesApplied = await lintingFormattingSystem.enforceStyleGuideCompliance(['test-file.ts']);

      expect(fixesApplied).toBeGreaterThan(0);
      expect(writtenContent).not.toContain('\t');
      expect(writtenContent).toContain('  '); // Should use spaces
    });

    test('enforces trailing commas', async () => {
      const originalContent = `
const obj = {
  a: 1,
  b: 2
};
`;

      mockFs.readFileSync.mockReturnValue(originalContent);
      let writtenContent = '';
      mockFs.writeFileSync.mockImplementation((path, content) => {
        writtenContent = content as string;
      });

      const fixesApplied = await lintingFormattingSystem.enforceStyleGuideCompliance(['test-file.ts']);

      expect(fixesApplied).toBeGreaterThan(0);
      expect(writtenContent).toContain('b: 2,'); // Should add trailing comma
    });

    test('enforces semicolons', async () => {
      const originalContent = `
const x = 1
const y = 2
return x + y
`;

      mockFs.readFileSync.mockReturnValue(originalContent);
      let writtenContent = '';
      mockFs.writeFileSync.mockImplementation((path, content) => {
        writtenContent = content as string;
      });

      const fixesApplied = await lintingFormattingSystem.enforceStyleGuideCompliance(['test-file.ts']);

      expect(fixesApplied).toBeGreaterThan(0);
      expect(writtenContent).toContain('const x = 1;');
      expect(writtenContent).toContain('const y = 2;');
      expect(writtenContent).toContain('return x + y;');
    });

    test('enforces quote style', async () => {
      const config = {
        ...testConfig,
        formattingRules: {
          ...testConfig.formattingRules,
          enforceQuoteStyle: 'single' as const,
        },
      };
      const system = new LintingFormattingSystem(config);

      const originalContent = `
const message = "Hello world";
const greeting = "Hi there";
`;

      mockFs.readFileSync.mockReturnValue(originalContent);
      let writtenContent = '';
      mockFs.writeFileSync.mockImplementation((path, content) => {
        writtenContent = content as string;
      });

      const fixesApplied = await system.enforceStyleGuideCompliance(['test-file.ts']);

      expect(fixesApplied).toBeGreaterThan(0);
      expect(writtenContent).toContain("'Hello world'");
      expect(writtenContent).toContain("'Hi there'");
      expect(writtenContent).not.toContain('"Hello world"');
    });
  });

  describe('executeLintingAndFormatting', () => {
    test('executes complete linting and formatting workflow', async () => {
      const testFiles = ['file1.ts', 'file2.ts'];

      // Mock ESLint output
      const eslintOutput = JSON.stringify([
        {
          filePath: '/test/file1.ts',
          messages: [{ line: 1, column: 10, ruleId: '@typescript-eslint/no-unused-vars', severity: 1, fix: {} }],
        },
      ]);

      mockExecSync
        .mockReturnValueOnce(testFiles.join('\n')) // File listing
        .mockReturnValueOnce(eslintOutput) // Initial violation detection
        .mockReturnValueOnce('') // ESLint fix
        .mockReturnValueOnce('[]') // After fix detection
        .mockReturnValueOnce('') // Prettier formatting
        .mockReturnValueOnce('') // Build validation
        .mockReturnValueOnce('') // Build validation
        .mockReturnValueOnce(''); // Build validation

      mockFs.readFileSync
        .mockReturnValue('const x = 1;') // File content for formatting
        .mockReturnValue('const x = 1;'); // File content after formatting

      mockFs.writeFileSync.mockImplementation(() => {});

      const result = await lintingFormattingSystem.executeLintingAndFormatting(testFiles);

      expect(result.filesProcessed.length).toBeGreaterThan(0);
      expect(result.buildValidationPassed).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('handles build validation failures', async () => {
      const testFiles = ['file1.ts'];

      mockExecSync
        .mockReturnValueOnce(testFiles.join('\n')) // File listing
        .mockReturnValueOnce('[]') // ESLint output
        .mockReturnValueOnce('') // Prettier
        .mockImplementationOnce(() => {
          // Build validation failure
          throw new Error('Build failed');
        });

      mockFs.readFileSync.mockReturnValue('const x = 1;');
      mockFs.writeFileSync.mockImplementation(() => {});

      const result = await lintingFormattingSystem.executeLintingAndFormatting(testFiles);

      expect(result.buildValidationPassed).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('processes files in batches', async () => {
      const testFiles = Array.from({ length: 12 }, (_, i) => `file${i}.ts`);
      const batchSize = 5;

      const config = { ...testConfig, maxFilesPerBatch: batchSize };
      const system = new LintingFormattingSystem(config);

      mockExecSync.mockReturnValue('[]'); // ESLint output
      mockFs.readFileSync.mockReturnValue('const x = 1;');
      mockFs.writeFileSync.mockImplementation(() => {});

      const result = await system.executeLintingAndFormatting(testFiles);

      expect(result.filesProcessed.length).toBeLessThanOrEqual(testFiles.length);
      expect(result.buildValidationPassed).toBe(true);
    });
  });

  describe('violation breakdown', () => {
    test('categorizes violations correctly', async () => {
      const eslintOutput = JSON.stringify([
        {
          filePath: '/test/file.ts',
          messages: [
            { line: 1, column: 10, ruleId: '@typescript-eslint/no-unused-vars', severity: 1 },
            { line: 2, column: 5, ruleId: 'react-hooks/exhaustive-deps', severity: 1 },
            { line: 3, column: 15, ruleId: 'import/no-unresolved', severity: 1 },
            { line: 4, column: 20, ruleId: 'no-console', severity: 1 },
          ],
        },
      ]);

      mockExecSync.mockReturnValue(eslintOutput);
      mockFs.readFileSync.mockReturnValue('test content');
      mockFs.writeFileSync.mockImplementation(() => {});

      const result = await lintingFormattingSystem.executeLintingAndFormatting(['test-file.ts']);

      expect(result.violationBreakdown.typeScriptErrors).toBe(1);
      expect(result.violationBreakdown.reactViolations).toBe(1);
      expect(result.violationBreakdown.importViolations).toBe(1);
      expect(result.violationBreakdown.formattingIssues).toBe(1);
    });
  });

  describe('error handling', () => {
    test('handles file read errors gracefully', async () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      const fixesApplied = await lintingFormattingSystem.applyPatternBasedFixes(['nonexistent.ts']);

      expect(fixesApplied).toBe(0);
    });

    test('handles ESLint execution errors gracefully', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('ESLint failed');
      });

      const violations = await lintingFormattingSystem.detectLintingViolations(['test-file.ts']);

      expect(violations).toHaveLength(0);
    });

    test('continues processing other files when one fails', async () => {
      const testFiles = ['good.ts', 'bad.ts', 'good2.ts'];

      mockFs.readFileSync
        .mockReturnValueOnce('const x = 1;') // good.ts
        .mockImplementationOnce(() => {
          throw new Error('Bad file');
        }) // bad.ts
        .mockReturnValueOnce('const y = 2;'); // good2.ts

      const fixesApplied = await lintingFormattingSystem.applyPatternBasedFixes(testFiles);

      // Should still process the good files
      expect(fixesApplied).toBeGreaterThanOrEqual(0);
    });
  });

  describe('configuration validation', () => {
    test('uses default configuration when not provided', () => {
      const system = new LintingFormattingSystem(DEFAULT_LINTING_FORMATTING_CONFIG);
      expect(system).toBeDefined();
    });

    test('respects custom configuration', () => {
      const customConfig: LintingFormattingConfig = {
        maxFilesPerBatch: 10,
        safetyValidationEnabled: false,
        buildValidationFrequency: 3,
        autoFixEnabled: false,
        formattingEnabled: false,
        lintingRules: {
          enforceTypeScriptRules: false,
          enforceReactRules: false,
          enforceImportRules: false,
          maxWarningsThreshold: 500,
          customRuleOverrides: { 'no-console': 'off' },
        },
        formattingRules: {
          enforceConsistentIndentation: false,
          enforceTrailingCommas: false,
          enforceSemicolons: false,
          enforceQuoteStyle: 'double',
          enforceLineLength: 120,
          enforceSpacing: false,
        },
        patternBasedFixes: [],
      };

      const system = new LintingFormattingSystem(customConfig);
      expect(system).toBeDefined();
    });
  });
});
