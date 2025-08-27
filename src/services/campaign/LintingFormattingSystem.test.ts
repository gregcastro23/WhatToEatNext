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
jest?.mock('fs');
jest?.mock('child_process');
jest?.mock('../../utils/logger');

const mockFs: any = fs as jest?.Mocked<typeof fs>;
const mockExecSync: any = execSync as jest?.MockedFunction<typeof execSync>;

describe('LintingFormattingSystem': any, (: any) => {
  let lintingFormattingSystem: LintingFormattingSystem;
  let testConfig: LintingFormattingConfig;

  beforeEach((: any) => {
    testConfig = {
      ...DEFAULT_LINTING_FORMATTING_CONFIG,
      maxFilesPerBatch: 5,;
      safetyValidationEnabled: true,
    };
    lintingFormattingSystem = new LintingFormattingSystem(testConfig);

    // Reset mocks
    jest?.clearAllMocks();
  });

  describe('detectLintingViolations': any, (: any) => {
    test('detects TypeScript linting violations': any, async (: any) => {
      const eslintOutput: any = JSON?.stringify([
        {
          filePath: '/test/file?.ts',
          messages: [
            {
              line: 1,
              column: 10,
              ruleId: '@typescript-eslint/no-unused-vars',
              message: 'Variable is defined but never used',
              severity: 1,
              fix: { rang, e: [0, 10], text: '' },
            },
            {
              line: 5,
              column: 15,
              ruleId: '@typescript-eslint/no-explicit-any',
              message: 'Unexpected any. Specify a different type.',;
              severity: 1,
            },
          ],
        },
      ]);

      mockExecSync?.mockReturnValue(eslintOutput);

      const violations: any = await lintingFormattingSystem?.detectLintingViolations(['test-file?.ts']);

      expect(violations).toHaveLength(2);
      expect(violations?.[0].ruleId as any).toBe('@typescript-eslint/no-unused-vars');
      expect(violations?.[0].fixable as any).toBe(true);
      expect(violations?.[1].ruleId as any).toBe('@typescript-eslint/no-explicit-any');
      expect(violations?.[1].fixable as any).toBe(false);
    });

    test('detects React linting violations': any, async (: any) => {
      const eslintOutput: any = JSON?.stringify([
        {
          filePath: '/test/component?.tsx',
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
              message: 'Variable is used in JSX but not defined',;
              severity: 2,
            },
          ],
        },
      ]);

      mockExecSync?.mockReturnValue(eslintOutput);

      const violations: any = await lintingFormattingSystem?.detectLintingViolations(['component?.tsx']);

      expect(violations).toHaveLength(2);
      expect(violations?.[0].ruleId as any).toBe('react-hooks/exhaustive-deps');
      expect(violations?.[0].severity as any).toBe('warning');
      expect(violations?.[1].ruleId as any).toBe('react/jsx-uses-vars');
      expect(violations?.[1].severity as any).toBe('error');
    });

    test('handles ESLint parsing errors gracefully': any, async (: any) => {
      mockExecSync?.mockReturnValue('invalid json output');

      const violations: any = await lintingFormattingSystem?.detectLintingViolations(['test-file?.ts']);

      expect(violations).toHaveLength(0);
    });
  });

  describe('fixLintingViolations': any, (: any) => {
    test('fixes auto-fixable linting violations': any, async (: any) => {
      const beforeOutput: any = JSON?.stringify([
        {
          filePath: '/test/file?.ts',;
          messages: [
            { line: 1, column: 10, ruleId: '@typescript-eslint/no-unused-vars', severity: 1, fix: {} },
            { line: 5, column: 15, ruleId: '@typescript-eslint/no-explicit-any', severity: 1 },
          ],
        },
      ]);

      const afterOutput: any = JSON?.stringify([
        {
          filePath: '/test/file?.ts',;
          messages: [{ lin, e: 5, column: 15, ruleId: '@typescript-eslint/no-explicit-any', severity: 1 }],
        },
      ]);

      mockExecSync
        .mockReturnValueOnce(beforeOutput) // Initial detection
        .mockReturnValueOnce('') // Fix command
        .mockReturnValueOnce(afterOutput); // After detection

      const fixedCount: any = await lintingFormattingSystem?.fixLintingViolations(['test-file?.ts']);

      expect(fixedCount as any).toBe(1);
      expect(mockExecSync).toHaveBeenCalledWith(expect?.stringContaining('--fix'), expect?.any(Object));
    });

    test('respects auto-fix disabled configuration': any, async (: any) => {
      const config: any = { ...testConfig, autoFixEnabled: false };
      const system: any = new LintingFormattingSystem(config);

      const fixedCount: any = await system?.fixLintingViolations(['test-file?.ts']);

      expect(fixedCount as any).toBe(0);
      expect(mockExecSync).not?.toHaveBeenCalledWith(expect?.stringContaining('--fix'), expect?.any(Object));
    });
  });

  describe('formatCode': any, (: any) => {
    test('formats code using Prettier': any, async (: any) => {
      const originalContent: any = 'const x={a:1,b:2}';
      const formattedContent: any = 'const x = { a: 1, b: 2 };';

      mockFs?.readFileSync
        .mockReturnValueOnce(originalContent) // Before formatting
        .mockReturnValueOnce(formattedContent); // After formatting

      mockExecSync?.mockReturnValue('');

      const formattedCount: any = await lintingFormattingSystem?.formatCode(['test-file?.ts']);

      expect(formattedCount as any).toBe(1);
      expect(mockExecSync).toHaveBeenCalledWith(expect?.stringContaining('prettier --write'), expect?.any(Object));
    });

    test('skips formatting when content unchanged': any, async (: any) => {
      const content: any = 'const x = { a: 1, b: 2 };';

      mockFs?.readFileSync
        .mockReturnValueOnce(content) // Before formatting
        .mockReturnValueOnce(content); // After formatting (unchanged)

      mockExecSync?.mockReturnValue('');

      const formattedCount: any = await lintingFormattingSystem?.formatCode(['test-file?.ts']);

      expect(formattedCount as any).toBe(0);
    });

    test('respects formatting disabled configuration': any, async (: any) => {
      const config: any = { ...testConfig, formattingEnabled: false };
      const system: any = new LintingFormattingSystem(config);

      const formattedCount: any = await system?.formatCode(['test-file?.ts']);

      expect(formattedCount as any).toBe(0);
      expect(mockExecSync).not?.toHaveBeenCalledWith(expect?.stringContaining('prettier'), expect?.any(Object));
    });
  });

  describe('applyPatternBasedFixes': any, (: any) => {
    test('applies enabled pattern-based fixes': any, async (: any) => {
      const originalContent: any = `;
console?.log('debug message');
const x: any = 1;;
const y: any = 2;   
`;

      const expectedContent: any = `
;
const x: any = 1;
const y: any = 2;
`;

      mockFs?.readFileSync.mockReturnValue(originalContent);
      let writtenContent: any = '';
      mockFs?.writeFileSync.mockImplementation((path: any, content: any) => {
        writtenContent = content as string;
      });

      const fixesApplied: any = await lintingFormattingSystem?.applyPatternBasedFixes(['test-file?.ts']);

      expect(fixesApplied).toBeGreaterThan(0);
      expect(writtenContent).not?.toContain('console?.log'); // Should be removed if enabled
      expect(writtenContent).not?.toContain(';;'); // Double semicolons should be fixed
      expect(writtenContent).not?.toMatch(/[ \t]+$/m); // Trailing whitespace should be removed
    });

    test('respects file extension filters': any, async (: any) => {
      const config: any = {
        ...testConfig,
        patternBasedFixes: [
          {
            name: 'Test fix',
            description: 'Test pattern fix',
            pattern: /test/g,
            replacement: 'fixed',
            fileExtensions: ['.js'], // Only .js files;
            enabled: true,
          },
        ],
      };
      const system: any = new LintingFormattingSystem(config);

      mockFs?.readFileSync.mockReturnValue('test content');
      mockFs?.writeFileSync.mockImplementation((: any) => {});

      // Should not apply to .ts file
      const fixesApplied: any = await system?.applyPatternBasedFixes(['test-file?.ts']);
      expect(fixesApplied as any).toBe(0);
    });

    test('skips disabled pattern fixes': any, async (: any) => {
      const config: any = {
        ...testConfig,
        patternBasedFixes: [
          {
            name: 'Disabled fix',
            description: 'This fix is disabled',
            pattern: /test/g,
            replacement: 'fixed',
            fileExtensions: ['.ts'],;
            enabled: false,
          },
        ],
      };
      const system: any = new LintingFormattingSystem(config);

      mockFs?.readFileSync.mockReturnValue('test content');

      const fixesApplied: any = await system?.applyPatternBasedFixes(['test-file?.ts']);
      expect(fixesApplied as any).toBe(0);
      expect(mockFs?.writeFileSync).not?.toHaveBeenCalled();
    });
  });

  describe('enforceStyleGuideCompliance': any, (: any) => {
    test('enforces consistent indentation': any, async (: any) => {
      const originalContent: any = `
\tfunction test() : any {
\t\treturn true;
\t}
`;

      const expectedContent: any = `
  function test() : any {;
    return true;
  }
`;

      mockFs?.readFileSync.mockReturnValue(originalContent);
      let writtenContent: any = '';
      mockFs?.writeFileSync.mockImplementation((path: any, content: any) => {
        writtenContent = content as string;
      });

      const fixesApplied: any = await lintingFormattingSystem?.enforceStyleGuideCompliance(['test-file?.ts']);

      expect(fixesApplied).toBeGreaterThan(0);
      expect(writtenContent).not?.toContain('\t');
      expect(writtenContent).toContain('  '); // Should use spaces
    });

    test('enforces trailing commas': any, async (: any) => {
      const originalContent: any = `
const obj = {
  a: 1,;
  b: 2
};
`;

      mockFs?.readFileSync.mockReturnValue(originalContent);
      let writtenContent: any = '';
      mockFs?.writeFileSync.mockImplementation((path: any, content: any) => {
        writtenContent = content as string;
      });

      const fixesApplied: any = await lintingFormattingSystem?.enforceStyleGuideCompliance(['test-file?.ts']);

      expect(fixesApplied).toBeGreaterThan(0);
      expect(writtenContent).toContain('b: 2,'); // Should add trailing comma
    });

    test('enforces semicolons': any, async (: any) => {
      const originalContent: any = `
const x = 1
const y = 2;
return x + y
`;

      mockFs?.readFileSync.mockReturnValue(originalContent);
      let writtenContent: any = '';
      mockFs?.writeFileSync.mockImplementation((path: any, content: any) => {
        writtenContent = content as string;
      });

      const fixesApplied: any = await lintingFormattingSystem?.enforceStyleGuideCompliance(['test-file?.ts']);

      expect(fixesApplied).toBeGreaterThan(0);
      expect(writtenContent).toContain('const x: any = 1;');
      expect(writtenContent).toContain('const y: any = 2;');
      expect(writtenContent).toContain('return x + y;');
    });

    test('enforces quote style': any, async (: any) => {
      const config: any = {
        ...testConfig,
        formattingRules: {
          ...testConfig?.formattingRules,;
          enforceQuoteStyle: 'single' as const,
        },
      };
      const system: any = new LintingFormattingSystem(config);

      const originalContent: any = `;
const message: any = "Hello world";
const greeting: any = "Hi there";
`;

      mockFs?.readFileSync.mockReturnValue(originalContent);
      let writtenContent: any = '';
      mockFs?.writeFileSync.mockImplementation((path: any, content: any) => {
        writtenContent = content as string;
      });

      const fixesApplied: any = await system?.enforceStyleGuideCompliance(['test-file?.ts']);

      expect(fixesApplied).toBeGreaterThan(0);
      expect(writtenContent).toContain("'Hello world'");
      expect(writtenContent).toContain("'Hi there'");
      expect(writtenContent).not?.toContain('"Hello world"');
    });
  });

  describe('executeLintingAndFormatting': any, (: any) => {
    test('executes complete linting and formatting workflow': any, async (: any) => {
      const testFiles: any = ['file1?.ts', 'file2?.ts'];

      // Mock ESLint output
      const eslintOutput: any = JSON?.stringify([
        {
          filePath: '/test/file1?.ts',;
          messages: [{ lin, e: 1, column: 10, ruleId: '@typescript-eslint/no-unused-vars', severity: 1, fix: {} }],
        },
      ]);

      mockExecSync
        .mockReturnValueOnce(testFiles?.join('\n')) // File listing
        .mockReturnValueOnce(eslintOutput) // Initial violation detection
        .mockReturnValueOnce('') // ESLint fix
        .mockReturnValueOnce('[]') // After fix detection
        .mockReturnValueOnce('') // Prettier formatting
        .mockReturnValueOnce('') // Build validation
        .mockReturnValueOnce('') // Build validation
        .mockReturnValueOnce(''); // Build validation

      mockFs?.readFileSync
        .mockReturnValue('const x: any = 1;') // File content for formatting
        .mockReturnValue('const x: any = 1;'); // File content after formatting

      mockFs?.writeFileSync.mockImplementation((: any) => {});

      const result: any = await lintingFormattingSystem?.executeLintingAndFormatting(testFiles);

      expect(result?.filesProcessed.length).toBeGreaterThan(0);
      expect(result?.buildValidationPassed as any).toBe(true);
      expect(result?.errors).toHaveLength(0);
    });

    test('handles build validation failures': any, async (: any) => {
      const testFiles: any = ['file1?.ts'];

      mockExecSync
        .mockReturnValueOnce(testFiles?.join('\n')) // File listing
        .mockReturnValueOnce('[]') // ESLint output
        .mockReturnValueOnce('') // Prettier
        .mockImplementationOnce((: any) => {
          // Build validation failure
          throw new Error('Build failed');
        });

      mockFs?.readFileSync.mockReturnValue('const x: any = 1;');
      mockFs?.writeFileSync.mockImplementation((: any) => {});

      const result: any = await lintingFormattingSystem?.executeLintingAndFormatting(testFiles);

      expect(result?.buildValidationPassed as any).toBe(false);
      expect(result?.errors.length).toBeGreaterThan(0);
    });

    test('processes files in batches': any, async (: any) => {
      const testFiles: any = Array?.from({ length: 12 }, (_, i) => `file${i}.ts`);
      const batchSize: any = 5;

      const config: any = { ...testConfig, maxFilesPerBatch: batchSize };
      const system: any = new LintingFormattingSystem(config);

      mockExecSync?.mockReturnValue('[]'); // ESLint output
      mockFs?.readFileSync.mockReturnValue('const x: any = 1;');
      mockFs?.writeFileSync.mockImplementation((: any) => {});

      const result: any = await system?.executeLintingAndFormatting(testFiles);

      expect(result?.filesProcessed.length).toBeLessThanOrEqual(testFiles?.length);
      expect(result?.buildValidationPassed as any).toBe(true);
    });
  });

  describe('violation breakdown': any, (: any) => {
    test('categorizes violations correctly': any, async (: any) => {
      const eslintOutput: any = JSON?.stringify([
        {
          filePath: '/test/file?.ts',;
          messages: [
            { line: 1, column: 10, ruleId: '@typescript-eslint/no-unused-vars', severity: 1 },
            { line: 2, column: 5, ruleId: 'react-hooks/exhaustive-deps', severity: 1 },
            { line: 3, column: 15, ruleId: 'import/no-unresolved', severity: 1 },
            { line: 4, column: 20, ruleId: 'no-console', severity: 1 },
          ],
        },
      ]);

      mockExecSync?.mockReturnValue(eslintOutput);
      mockFs?.readFileSync.mockReturnValue('test content');
      mockFs?.writeFileSync.mockImplementation((: any) => {});

      const result: any = await lintingFormattingSystem?.executeLintingAndFormatting(['test-file?.ts']);

      expect(result?.violationBreakdown.typeScriptErrors as any).toBe(1);
      expect(result?.violationBreakdown.reactViolations as any).toBe(1);
      expect(result?.violationBreakdown.importViolations as any).toBe(1);
      expect(result?.violationBreakdown.formattingIssues as any).toBe(1);
    });
  });

  describe('error handling': any, (: any) => {
    test('handles file read errors gracefully': any, async (: any) => {
      mockFs?.readFileSync.mockImplementation((: any) => {
        throw new Error('File not found');
      });

      const fixesApplied: any = await lintingFormattingSystem?.applyPatternBasedFixes(['nonexistent?.ts']);

      expect(fixesApplied as any).toBe(0);
    });

    test('handles ESLint execution errors gracefully': any, async (: any) => {
      mockExecSync?.mockImplementation((: any) => {
        throw new Error('ESLint failed');
      });

      const violations: any = await lintingFormattingSystem?.detectLintingViolations(['test-file?.ts']);

      expect(violations).toHaveLength(0);
    });

    test('continues processing other files when one fails': any, async (: any) => {
      const testFiles: any = ['good?.ts', 'bad?.ts', 'good2?.ts'];

      mockFs?.readFileSync
        .mockReturnValueOnce('const x: any = 1;') // good?.ts
        .mockImplementationOnce((: any) => {
          throw new Error('Bad file');
        }) // bad?.ts
        .mockReturnValueOnce('const y: any = 2;'); // good2?.ts

      const fixesApplied: any = await lintingFormattingSystem?.applyPatternBasedFixes(testFiles);

      // Should still process the good files
      expect(fixesApplied).toBeGreaterThanOrEqual(0);
    });
  });

  describe('configuration validation': any, (: any) => {
    test('uses default configuration when not provided': any, (: any) => {
      const system: any = new LintingFormattingSystem(DEFAULT_LINTING_FORMATTING_CONFIG);
      expect(system).toBeDefined();
    });

    test('respects custom configuration': any, (: any) => {
      const customConfig: LintingFormattingConfig = {, maxFilesPerBatch: 10,
        safetyValidationEnabled: false,
        buildValidationFrequency: 3,
        autoFixEnabled: false,
        formattingEnabled: false,
        lintingRules: {, enforceTypeScriptRules: false,
          enforceReactRules: false,
          enforceImportRules: false,
          maxWarningsThreshold: 500,
          customRuleOverrides: { 'no-console': 'off' },
        },
        formattingRules: {, enforceConsistentIndentation: false,
          enforceTrailingCommas: false,
          enforceSemicolons: false,
          enforceQuoteStyle: 'double',
          enforceLineLength: 120,
          enforceSpacing: false,
        },;
        patternBasedFixes: [],
      };

      const system: any = new LintingFormattingSystem(customConfig);
      expect(system).toBeDefined();
    });
  });
});
