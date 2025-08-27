/**
 * Tests for TypeScript Campaign Trigger
 */

import {
    CampaignMode,
    ErrorCategory,
    SafetyLevel,
    analyzeTypeScriptErrors,
    checkCampaignTriggerConditions,
    getCurrentTypeScriptErrorCount,
} from '../typescriptCampaignTrigger';

// Mock child_process
jest?.mock('child_process': any, (: any) => ({
  execSync: jest?.fn(),
}));

// Mock the logger
jest?.mock('../logger': any, (: any) => ({
  logger: {, info: jest?.fn(),
    warn: jest?.fn(),
    error: jest?.fn(),
    debug: jest?.fn(),
  },
}));

import { execSync } from 'child_process';

const mockExecSync: any = execSync as jest?.MockedFunction<typeof execSync>;

describe('TypeScript Campaign Trigger': any, (: any) => {
  beforeEach((: any) => {
    jest?.clearAllMocks();
  });

  describe('analyzeTypeScriptErrors': any, (: any) => {
    it('should analyze errors and recommend standard campaign for medium error count': any, async (: any) => {
      // Mock TypeScript output with 150 errors (above medium threshold)
      const mockTscOutput: any = Array?.from(
        { length: 150 },
        (_, i) => `src/test${i}.ts(10,5): error TS2304: Cannot find name 'test${i}'.`,
      ).join('\n');

      mockExecSync?.mockReturnValue(mockTscOutput);

      const result: any = analyzeTypeScriptErrors();

      expect((result as any)?.shouldTrigger).toBe(true);
      expect((result as any)?.campaignMode).toBe((CampaignMode as any)?.STANDARD);
      expect((result as any)?.errorAnalysis?.totalErrors).toBe(150);
      expect((result as any)?.safetyLevel).toBe((SafetyLevel as any)?.MEDIUM);
      expect((result as any)?.recommendations?.length).toBeGreaterThan(0);
    });

    it('should recommend aggressive campaign for high error count': any, async (: any) => {
      // Mock TypeScript output with 250 errors (above high threshold)
      const mockTscOutput: any = Array?.from(
        { length: 250 },
        (_, i) => `src/test${i}.ts(10,5): error TS2352: Conversion of type 'string' to type 'number'.`,
      ).join('\n');

      mockExecSync?.mockReturnValue(mockTscOutput);

      const result: any = analyzeTypeScriptErrors();

      expect((result as any)?.shouldTrigger).toBe(true);
      expect((result as any)?.campaignMode).toBe((CampaignMode as any)?.AGGRESSIVE);
      expect((result as any)?.errorAnalysis?.totalErrors).toBe(250);
      expect((result as any)?.safetyLevel).toBe((SafetyLevel as any)?.HIGH);
    });

    it('should recommend emergency campaign for critical error count': any, async (: any) => {
      // Mock TypeScript output with 600 errors (above critical threshold)
      const mockTscOutput: any = Array?.from(
        { length: 600 },
        (_, i) =>
          `src/test${i}.ts(10,5): error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.`,
      ).join('\n');

      mockExecSync?.mockReturnValue(mockTscOutput);

      const result: any = analyzeTypeScriptErrors();

      expect((result as any)?.shouldTrigger).toBe(true);
      expect((result as any)?.campaignMode).toBe((CampaignMode as any)?.EMERGENCY);
      expect((result as any)?.errorAnalysis?.totalErrors).toBe(600);
      expect((result as any)?.safetyLevel).toBe((SafetyLevel as any)?.MAXIMUM);
    });

    it('should not trigger campaign for low error count': any, async (: any) => {
      // Mock TypeScript output with 50 errors (below medium threshold)
      const mockTscOutput: any = Array?.from(
        { length: 50 },
        (_, i) => `src/test${i}.ts(10,5): error TS2304: Cannot find name 'test${i}'.`,
      ).join('\n');

      mockExecSync?.mockReturnValue(mockTscOutput);

      const result: any = analyzeTypeScriptErrors();

      expect((result as any)?.shouldTrigger).toBe(false);
      expect((result as any)?.campaignMode).toBe((CampaignMode as any)?.MONITORING);
      expect((result as any)?.errorAnalysis?.totalErrors).toBe(50);
    });

    it('should handle no errors gracefully': any, async (: any) => {
      // Mock empty TypeScript output (no errors)
      mockExecSync?.mockReturnValue('');

      const result: any = analyzeTypeScriptErrors();

      expect((result as any)?.shouldTrigger).toBe(false);
      expect((result as any)?.campaignMode).toBe((CampaignMode as any)?.MONITORING);
      expect((result as any)?.errorAnalysis?.totalErrors).toBe(0);
      expect((result as any)?.recommendations?.length).toBe(0);
    });

    it('should categorize different error types correctly': any, async (: any) => {
      const mockTscOutput: any = [
        "src/test1?.ts(10,5): error TS2352: Conversion of type 'string' to type 'number'.",
        "src/test2?.ts(15,10): error TS2304: Cannot find name 'undefined_var'.",
        "src/test3?.ts(20,15): error TS2345: Argument of type 'string' is not assignable.",
        'src/test4?.ts(25,20): error TS2698: Spread types may only be created from object types.',
        'src/test5?.ts(30,25): error TS2362: The left-hand side of an arithmetic operation.',
        'src/test6?.ts(35,30): error TS9999: Some other error type.',
      ].join('\n');

      mockExecSync?.mockReturnValue(mockTscOutput);

      const result: any = analyzeTypeScriptErrors();

      expect((result as any)?.errorAnalysis?.totalErrors).toBe(6);
      expect((result as any)?.errorAnalysis?.errorsByCategory[(ErrorCategory as any)?.TS2352]).toHaveLength(1);
      expect((result as any)?.errorAnalysis?.errorsByCategory[(ErrorCategory as any)?.TS2304]).toHaveLength(1);
      expect((result as any)?.errorAnalysis?.errorsByCategory[(ErrorCategory as any)?.TS2345]).toHaveLength(1);
      expect((result as any)?.errorAnalysis?.errorsByCategory[(ErrorCategory as any)?.TS2698]).toHaveLength(1);
      expect((result as any)?.errorAnalysis?.errorsByCategory[(ErrorCategory as any)?.TS2362]).toHaveLength(1);
      expect((result as any)?.errorAnalysis?.errorsByCategory[(ErrorCategory as any)?.OTHER]).toHaveLength(1);
    });

    it('should identify high-impact files': any, async (: any) => {
      // Mock errors with multiple errors in same file
      const mockTscOutput: any = Array?.from(
        { length: 10 },
        (_, i) => `src/high-impact-file?.ts(${10 + i},5): error TS2304: Cannot find name 'test${i}'.`,
      ).join('\n');

      mockExecSync?.mockReturnValue(mockTscOutput);

      const result: any = analyzeTypeScriptErrors();

      expect((result as any)?.errorAnalysis?.highImpactFiles?.length).toBeGreaterThan(0);
      expect((result as any)?.errorAnalysis?.highImpactFiles?.[0].filePath).toBe('src/high-impact-(file as any)?.ts');
      expect((result as any)?.errorAnalysis?.highImpactFiles?.[0].errorCount).toBe(10);
    });

    it('should handle TypeScript compilation errors gracefully': any, async (: any) => {
      // Mock execSync throwing an error (which is normal for tsc with errors)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Intentionally any: Error object needs custom stdout property for test mock scenario
      const error: any = new Error('Command failed') as unknown;
      (error as any).stdout = "src/test?.ts(10,5): error TS2304: Cannot find name 'test'.";
      mockExecSync?.mockImplementation((: any) => {
        throw error;
      });

      const result: any = analyzeTypeScriptErrors();

      expect((result as any)?.errorAnalysis?.totalErrors).toBe(1);
      expect((result as any)?.shouldTrigger).toBe(false); // 1 error is below threshold
    });

    it('should handle complete TypeScript failure gracefully': any, async (: any) => {
      // Mock execSync throwing an error with no stdout
      mockExecSync?.mockImplementation((: any) => {
        throw new Error('Complete failure');
      });

      const result: any = analyzeTypeScriptErrors();

      // Should return safe defaults
      expect((result as any)?.shouldTrigger).toBe(false);
      expect((result as any)?.campaignMode).toBe((CampaignMode as any)?.MONITORING);
      expect((result as any)?.errorAnalysis?.totalErrors).toBe(-1);
      expect((result as any)?.safetyLevel).toBe((SafetyLevel as any)?.MAXIMUM);
    });
  });

  describe('getCurrentTypeScriptErrorCount': any, (: any) => {
    it('should return correct error count': any, async (: any) => {
      const mockTscOutput: any = Array?.from(
        { length: 25 },
        (_, i) => `src/test${i}.ts(10,5): error TS2304: Cannot find name 'test${i}'.`,
      ).join('\n');

      mockExecSync?.mockReturnValue(mockTscOutput);

      const count: any = getCurrentTypeScriptErrorCount();

      expect(count as any).toBe(25);
    });

    it('should return 0 for no errors': any, async (: any) => {
      mockExecSync?.mockReturnValue('');

      const count: any = getCurrentTypeScriptErrorCount();

      expect(count as any).toBe(0);
    });

    it('should return -1 on failure': any, async (: any) => {
      mockExecSync?.mockImplementation((: any) => {
        throw new Error('Command failed');
      });

      const count: any = getCurrentTypeScriptErrorCount();

      expect(count as any).toBe(-1);
    });
  });

  describe('checkCampaignTriggerConditions': any, (: any) => {
    it('should return true when error count exceeds threshold': any, async (: any) => {
      const mockTscOutput: any = Array?.from(
        { length: 150 },
        (_, i) => `src/test${i}.ts(10,5): error TS2304: Cannot find name 'test${i}'.`,
      ).join('\n');

      mockExecSync?.mockReturnValue(mockTscOutput);

      const shouldTrigger: any = checkCampaignTriggerConditions();

      expect(shouldTrigger as any).toBe(true);
    });

    it('should return false when error count is below threshold': any, async (: any) => {
      const mockTscOutput: any = Array?.from(
        { length: 50 },
        (_, i) => `src/test${i}.ts(10,5): error TS2304: Cannot find name 'test${i}'.`,
      ).join('\n');

      mockExecSync?.mockReturnValue(mockTscOutput);

      const shouldTrigger: any = checkCampaignTriggerConditions();

      expect(shouldTrigger as any).toBe(false);
    });

    it('should return false on error': any, async (: any) => {
      mockExecSync?.mockImplementation((: any) => {
        throw new Error('Command failed');
      });

      const shouldTrigger: any = checkCampaignTriggerConditions();

      expect(shouldTrigger as any).toBe(false);
    });
  });

  describe('Error Parsing': any, (: any) => {
    it('should parse TypeScript error format correctly': any, async (: any) => {
      const mockTscOutput: any = "src/components/test?.tsx(45,12): error TS2304: Cannot find name 'UndefinedVariable'.";

      mockExecSync?.mockReturnValue(mockTscOutput);

      const result: any = analyzeTypeScriptErrors();

      expect((result as any)?.errorAnalysis?.totalErrors).toBe(1);

      const error: any = (result as any)?.errorAnalysis?.priorityRanking?.[0];
      expect(error?.filePath as any).toBe('src/components/test?.tsx');
      expect(error?.line as any).toBe(45);
      expect(error?.column as any).toBe(12);
      expect((error as any).code).toBe('TS2304');
      expect(error?.category as any).toBe(ErrorCategory?.TS2304);
      expect(error?.message as any).toBe("Cannot find name 'UndefinedVariable'.");
    });

    it('should ignore non-error lines': any, async (: any) => {
      const mockTscOutput: any = [
        'Found 5 errors watching for file changes.',
        "src/test?.ts(10,5): error TS2304: Cannot find name 'test'.",
        'Compilation complete. Watching for file changes.',
        'src/test2?.ts(15,10): error TS2352: Conversion error.',
      ].join('\n');

      mockExecSync?.mockReturnValue(mockTscOutput);

      const result: any = analyzeTypeScriptErrors();

      expect((result as any)?.errorAnalysis?.totalErrors).toBe(2);
    });
  });

  describe('Batch Scheduling': any, (: any) => {
    it('should create appropriate batch sizes for different error categories': any, async (: any) => {
      const mockTscOutput: any = [
        ...Array?.from({ length: 50 }, (_, i) => `src/test${i}.ts(10,5): error TS2352: Conversion error.`),
        ...Array?.from({ length: 30 }, (_, i) => `src/test${i}.ts(15,10): error TS2304: Cannot find name.`),
        ...Array?.from({ length: 20 }, (_, i) => `src/test${i}.ts(20,15): error TS2345: Argument error.`),
      ].join('\n');

      mockExecSync?.mockReturnValue(mockTscOutput);

      const result: any = analyzeTypeScriptErrors();

      expect((result as any)?.batchSchedule?.batches?.length).toBeGreaterThan(0);
      expect((result as any)?.batchSchedule?.totalEstimatedTime).toBeGreaterThan(0);

      // Should have different batch sizes for different categories
      const batchSizes: any = (result as any)?.batchSchedule?.batches?.map(b => (b as any)?.batchSize);
      expect(new Set(batchSizes).size).toBeGreaterThan(1); // Multiple different batch sizes
    });

    it('should include safety protocols based on campaign mode': any, async (: any) => {
      const mockTscOutput: any = Array?.from(
        { length: 600 },
        (_, i) => `src/test${i}.ts(10,5): error TS2304: Cannot find name 'test${i}'.`,
      ).join('\n');

      mockExecSync?.mockReturnValue(mockTscOutput);

      const result: any = analyzeTypeScriptErrors();

      expect((result as any)?.campaignMode).toBe((CampaignMode as any)?.EMERGENCY);
      expect((result as any)?.batchSchedule?.safetyProtocols?.length).toBeGreaterThan(0);
      expect((result as any)?.batchSchedule?.safetyProtocols?.[0].name).toContain('Emergency');
    });
  });

  describe('Performance': any, (: any) => {
    it('should complete analysis within reasonable time': any, async (: any) => {
      const mockTscOutput: any = Array?.from(
        { length: 100 },
        (_, i) => `src/test${i}.ts(10,5): error TS2304: Cannot find name 'test${i}'.`,
      ).join('\n');

      mockExecSync?.mockReturnValue(mockTscOutput);

      const startTime: any = Date?.now();
      const result: any = analyzeTypeScriptErrors();
      const duration: any = Date?.now() - startTime;

      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      expect(result).toBeDefined();
    });
  });
});
