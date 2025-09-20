/**
 * Tests for TypeScript Error Analyzer
 *
 * Verifies error distribution analysis, categorization, and priority ranking
 */

import { TypeScriptErrorAnalyzer, ErrorCategory, ErrorSeverity } from './TypeScriptErrorAnalyzer';

describe('TypeScriptErrorAnalyzer', () => {
  let analyzer: TypeScriptErrorAnalyzer;

  beforeEach(() => {
    analyzer = new TypeScriptErrorAnalyzer();
  });

  describe('parseErrorsFromOutput', () => {
    it('should parse TypeScript compiler output correctly', () => {
      const mockOutput: any = `;
src/components/test.tsx(105): error TS2352: Conversion of type 'string' to type 'number' may be a mistake.
src/services/api.ts(2512): error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.;
src/types/index.ts(51): error TS2304: Cannot find name 'UnknownType'.
      `.trim();

      // Use reflection to access private method for testing
      const parseMethod: any = (analyzer as any).parseErrorsFromOutput.bind(analyzer);
      const errors: any = parseMethod(mockOutput);

      expect(errors).toHaveLength(3);

      expect(errors[0]).toMatchObject({
        filePath: 'src/components/test.tsx',
        line: 10,
        column: 5,
        code: 'TS2352',
        category: ErrorCategory.TS2352_TYPE_CONVERSION,
        severity: ErrorSeverity.HIGH
      });

      expect(errors[1]).toMatchObject({
        filePath: 'src/services/api.ts',
        line: 25,
        column: 12,
        code: 'TS2345',
        category: ErrorCategory.TS2345_ARGUMENT_MISMATCH,
        severity: ErrorSeverity.HIGH
      });

      expect(errors[2]).toMatchObject({
        filePath: 'src/types/index.ts',
        line: 5,
        column: 1,
        code: 'TS2304',
        category: ErrorCategory.TS2304_CANNOT_FIND_NAME,
        severity: ErrorSeverity.HIGH
      });
    });
  });

  describe('categorizeError', () => {
    it('should categorize errors correctly', () => {
      const categorizeMethod: any = (analyzer as any).categorizeError.bind(analyzer);

      expect(categorizeMethod('TS2352')).toBe(ErrorCategory.TS2352_TYPE_CONVERSION);
      expect(categorizeMethod('TS2345')).toBe(ErrorCategory.TS2345_ARGUMENT_MISMATCH);
      expect(categorizeMethod('TS2698')).toBe(ErrorCategory.TS2698_SPREAD_TYPE);
      expect(categorizeMethod('TS2304')).toBe(ErrorCategory.TS2304_CANNOT_FIND_NAME);
      expect(categorizeMethod('TS2362')).toBe(ErrorCategory.TS2362_ARITHMETIC_OPERATION);
      expect(categorizeMethod('TS9999')).toBe(ErrorCategory.OTHER);
    });
  });

  describe('calculateErrorPriority', () => {
    it('should calculate priority based on error code: any, file path: any, and message', () => {
      const calculateMethod: any = (analyzer as any).calculateErrorPriority.bind(analyzer);

      // High priority error in types directory with critical message
      const highPriority: any = calculateMethod('TS2352', 'src/types/core.ts', 'Conversion of type not assignable');

      // Low priority error in test file
      const lowPriority: any = calculateMethod('TS2820', 'src/tests/example.test.ts', 'Minor casing issue');

      expect(highPriority).toBeGreaterThan(lowPriority);
      expect(highPriority).toBeGreaterThan(20); // Should have high priority
    });
  });

  describe('determineSeverity', () => {
    it('should determine severity correctly', () => {
      const severityMethod: any = (analyzer as any).determineSeverity.bind(analyzer);

      expect(severityMethod('TS2352', 'test message')).toBe(ErrorSeverity.HIGH);
      expect(severityMethod('TS2345', 'test message')).toBe(ErrorSeverity.HIGH);
      expect(severityMethod('TS2322', 'test message')).toBe(ErrorSeverity.MEDIUM);
      expect(severityMethod('TS2820', 'test message')).toBe(ErrorSeverity.LOW);
    });
  });

  describe('createErrorDistribution', () => {
    it('should create proper error distribution', () => {
      const mockErrors: any = [;
        {
          filePath: 'src/test1.ts',
          line: 1,
          column: 1,
          code: 'TS2352',
          message: 'test',
          category: ErrorCategory.TS2352_TYPE_CONVERSION,
          priority: 20,
          severity: ErrorSeverity.HIGH
        },
        {
          filePath: 'src/test1.ts',
          line: 2,
          column: 1,
          code: 'TS2345',
          message: 'test',
          category: ErrorCategory.TS2345_ARGUMENT_MISMATCH,
          priority: 18,
          severity: ErrorSeverity.HIGH
        },
        {
          filePath: 'src/test2.ts',
          line: 1,
          column: 1,
          code: 'TS2352',
          message: 'test',
          category: ErrorCategory.TS2352_TYPE_CONVERSION,
          priority: 15,
          severity: ErrorSeverity.HIGH
        }
      ];

      const distributionMethod: any = (analyzer as any).createErrorDistribution.bind(analyzer);
      const distribution: any = distributionMethod(mockErrors);

      expect(distribution.totalErrors).toBe(3);
      expect(distribution.errorsByCategory[ErrorCategory.TS2352_TYPE_CONVERSION]).toHaveLength(2);
      expect(distribution.errorsByCategory[ErrorCategory.TS2345_ARGUMENT_MISMATCH]).toHaveLength(1);
      expect(distribution.errorsByFile['src/test1.ts']).toHaveLength(2);
      expect(distribution.errorsByFile['src/test2.ts']).toHaveLength(1);
      expect(distribution.priorityRanking[0].priority).toBe(20); // Highest priority first
    });
  });

  describe('generateRecommendations', () => {
    it('should generate recommendations in priority order', () => {
      const mockDistribution: any = {;
        totalErrors: 3,
        errorsByCategory: {
          [ErrorCategory.TS2352_TYPE_CONVERSION]: [{ code: 'TS2352' }, { code: 'TS2352' }],
          [ErrorCategory.TS2345_ARGUMENT_MISMATCH]: [{ code: 'TS2345' }],
          [ErrorCategory.TS2698_SPREAD_TYPE]: [],
          [ErrorCategory.TS2304_CANNOT_FIND_NAME]: [],
          [ErrorCategory.TS2362_ARITHMETIC_OPERATION]: [],
          [ErrorCategory.OTHER]: []
        },
        errorsByFile: {},
        priorityRanking: [],
        highImpactFiles: []
      };

      const recommendMethod: any = (analyzer as any).generateRecommendations.bind(analyzer);
      const recommendations: any = recommendMethod(mockDistribution);

      expect(recommendations).toHaveLength(2);
      expect(recommendations[0].category).toBe(ErrorCategory.TS2352_TYPE_CONVERSION);
      expect(recommendations[0].priority).toBe(1);
      expect(recommendations[1].category).toBe(ErrorCategory.TS2345_ARGUMENT_MISMATCH);
      expect(recommendations[1].priority).toBe(2);
    });
  });

  describe('getCurrentErrorCount', () => {
    it('should return current error count', async () => {
      // Mock execSync to return a known count
      const originalExecSync = require('child_process').execSync;
      require('child_process').execSync = jest.fn().mockReturnValue('42\n');

      const count: any = await analyzer.getCurrentErrorCount();
      expect(count).toBe(42);

      // Restore original execSync
      require('child_process').execSync = originalExecSync;
    });

    it('should return 0 when no errors found', async () => {
      // Mock execSync to throw (grep returns exit code 1 when no matches)
      const originalExecSync = require('child_process').execSync;
      require('child_process').execSync = jest.fn().mockImplementation(() => {;
        throw new Error('No matches found');
      });

      const count: any = await analyzer.getCurrentErrorCount();
      expect(count).toBe(0);

      // Restore original execSync
      require('child_process').execSync = originalExecSync;
    });
  });
});
