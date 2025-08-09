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
jest.mock('child_process', () => ({
  execSync: jest.fn(),
}));

// Mock the logger
jest.mock('../logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

import { execSync } from 'child_process';

const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;

describe('TypeScript Campaign Trigger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeTypeScriptErrors', () => {
    it('should analyze errors and recommend standard campaign for medium error count', async () => {
      // Mock TypeScript output with 150 errors (above medium threshold)
      const mockTscOutput = Array.from(
        { length: 150 },
        (_, i) => `src/test${i}.ts(10,5): error TS2304: Cannot find name 'test${i}'.`,
      ).join('\n');

      mockExecSync.mockReturnValue(mockTscOutput);

      const result = await analyzeTypeScriptErrors();

      expect(result.shouldTrigger).toBe(true);
      expect(result.campaignMode).toBe(CampaignMode.STANDARD);
      expect(result.errorAnalysis.totalErrors).toBe(150);
      expect(result.safetyLevel).toBe(SafetyLevel.MEDIUM);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should recommend aggressive campaign for high error count', async () => {
      // Mock TypeScript output with 250 errors (above high threshold)
      const mockTscOutput = Array.from(
        { length: 250 },
        (_, i) => `src/test${i}.ts(10,5): error TS2352: Conversion of type 'string' to type 'number'.`,
      ).join('\n');

      mockExecSync.mockReturnValue(mockTscOutput);

      const result = await analyzeTypeScriptErrors();

      expect(result.shouldTrigger).toBe(true);
      expect(result.campaignMode).toBe(CampaignMode.AGGRESSIVE);
      expect(result.errorAnalysis.totalErrors).toBe(250);
      expect(result.safetyLevel).toBe(SafetyLevel.HIGH);
    });

    it('should recommend emergency campaign for critical error count', async () => {
      // Mock TypeScript output with 600 errors (above critical threshold)
      const mockTscOutput = Array.from(
        { length: 600 },
        (_, i) =>
          `src/test${i}.ts(10,5): error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.`,
      ).join('\n');

      mockExecSync.mockReturnValue(mockTscOutput);

      const result = await analyzeTypeScriptErrors();

      expect(result.shouldTrigger).toBe(true);
      expect(result.campaignMode).toBe(CampaignMode.EMERGENCY);
      expect(result.errorAnalysis.totalErrors).toBe(600);
      expect(result.safetyLevel).toBe(SafetyLevel.MAXIMUM);
    });

    it('should not trigger campaign for low error count', async () => {
      // Mock TypeScript output with 50 errors (below medium threshold)
      const mockTscOutput = Array.from(
        { length: 50 },
        (_, i) => `src/test${i}.ts(10,5): error TS2304: Cannot find name 'test${i}'.`,
      ).join('\n');

      mockExecSync.mockReturnValue(mockTscOutput);

      const result = await analyzeTypeScriptErrors();

      expect(result.shouldTrigger).toBe(false);
      expect(result.campaignMode).toBe(CampaignMode.MONITORING);
      expect(result.errorAnalysis.totalErrors).toBe(50);
    });

    it('should handle no errors gracefully', async () => {
      // Mock empty TypeScript output (no errors)
      mockExecSync.mockReturnValue('');

      const result = await analyzeTypeScriptErrors();

      expect(result.shouldTrigger).toBe(false);
      expect(result.campaignMode).toBe(CampaignMode.MONITORING);
      expect(result.errorAnalysis.totalErrors).toBe(0);
      expect(result.recommendations.length).toBe(0);
    });

    it('should categorize different error types correctly', async () => {
      const mockTscOutput = [
        "src/test1.ts(10,5): error TS2352: Conversion of type 'string' to type 'number'.",
        "src/test2.ts(15,10): error TS2304: Cannot find name 'undefined_var'.",
        "src/test3.ts(20,15): error TS2345: Argument of type 'string' is not assignable.",
        'src/test4.ts(25,20): error TS2698: Spread types may only be created from object types.',
        'src/test5.ts(30,25): error TS2362: The left-hand side of an arithmetic operation.',
        'src/test6.ts(35,30): error TS9999: Some other error type.',
      ].join('\n');

      mockExecSync.mockReturnValue(mockTscOutput);

      const result = await analyzeTypeScriptErrors();

      expect(result.errorAnalysis.totalErrors).toBe(6);
      expect(result.errorAnalysis.errorsByCategory[ErrorCategory.TS2352]).toHaveLength(1);
      expect(result.errorAnalysis.errorsByCategory[ErrorCategory.TS2304]).toHaveLength(1);
      expect(result.errorAnalysis.errorsByCategory[ErrorCategory.TS2345]).toHaveLength(1);
      expect(result.errorAnalysis.errorsByCategory[ErrorCategory.TS2698]).toHaveLength(1);
      expect(result.errorAnalysis.errorsByCategory[ErrorCategory.TS2362]).toHaveLength(1);
      expect(result.errorAnalysis.errorsByCategory[ErrorCategory.OTHER]).toHaveLength(1);
    });

    it('should identify high-impact files', async () => {
      // Mock errors with multiple errors in same file
      const mockTscOutput = Array.from(
        { length: 10 },
        (_, i) => `src/high-impact-file.ts(${10 + i},5): error TS2304: Cannot find name 'test${i}'.`,
      ).join('\n');

      mockExecSync.mockReturnValue(mockTscOutput);

      const result = await analyzeTypeScriptErrors();

      expect(result.errorAnalysis.highImpactFiles.length).toBeGreaterThan(0);
      expect(result.errorAnalysis.highImpactFiles[0].filePath).toBe('src/high-impact-file.ts');
      expect(result.errorAnalysis.highImpactFiles[0].errorCount).toBe(10);
    });

    it('should handle TypeScript compilation errors gracefully', async () => {
      // Mock execSync throwing an error (which is normal for tsc with errors)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Intentionally any: Error object needs custom stdout property for test mock scenario
      const error = new Error('Command failed') as any;
      error.stdout = "src/test.ts(10,5): error TS2304: Cannot find name 'test'.";
      mockExecSync.mockImplementation(() => {
        throw error;
      });

      const result = await analyzeTypeScriptErrors();

      expect(result.errorAnalysis.totalErrors).toBe(1);
      expect(result.shouldTrigger).toBe(false); // 1 error is below threshold
    });

    it('should handle complete TypeScript failure gracefully', async () => {
      // Mock execSync throwing an error with no stdout
      mockExecSync.mockImplementation(() => {
        throw new Error('Complete failure');
      });

      const result = await analyzeTypeScriptErrors();

      // Should return safe defaults
      expect(result.shouldTrigger).toBe(false);
      expect(result.campaignMode).toBe(CampaignMode.MONITORING);
      expect(result.errorAnalysis.totalErrors).toBe(-1);
      expect(result.safetyLevel).toBe(SafetyLevel.MAXIMUM);
    });
  });

  describe('getCurrentTypeScriptErrorCount', () => {
    it('should return correct error count', async () => {
      const mockTscOutput = Array.from(
        { length: 25 },
        (_, i) => `src/test${i}.ts(10,5): error TS2304: Cannot find name 'test${i}'.`,
      ).join('\n');

      mockExecSync.mockReturnValue(mockTscOutput);

      const count = await getCurrentTypeScriptErrorCount();

      expect(count).toBe(25);
    });

    it('should return 0 for no errors', async () => {
      mockExecSync.mockReturnValue('');

      const count = await getCurrentTypeScriptErrorCount();

      expect(count).toBe(0);
    });

    it('should return -1 on failure', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Command failed');
      });

      const count = await getCurrentTypeScriptErrorCount();

      expect(count).toBe(-1);
    });
  });

  describe('checkCampaignTriggerConditions', () => {
    it('should return true when error count exceeds threshold', async () => {
      const mockTscOutput = Array.from(
        { length: 150 },
        (_, i) => `src/test${i}.ts(10,5): error TS2304: Cannot find name 'test${i}'.`,
      ).join('\n');

      mockExecSync.mockReturnValue(mockTscOutput);

      const shouldTrigger = await checkCampaignTriggerConditions();

      expect(shouldTrigger).toBe(true);
    });

    it('should return false when error count is below threshold', async () => {
      const mockTscOutput = Array.from(
        { length: 50 },
        (_, i) => `src/test${i}.ts(10,5): error TS2304: Cannot find name 'test${i}'.`,
      ).join('\n');

      mockExecSync.mockReturnValue(mockTscOutput);

      const shouldTrigger = await checkCampaignTriggerConditions();

      expect(shouldTrigger).toBe(false);
    });

    it('should return false on error', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Command failed');
      });

      const shouldTrigger = await checkCampaignTriggerConditions();

      expect(shouldTrigger).toBe(false);
    });
  });

  describe('Error Parsing', () => {
    it('should parse TypeScript error format correctly', async () => {
      const mockTscOutput = "src/components/test.tsx(45,12): error TS2304: Cannot find name 'UndefinedVariable'.";

      mockExecSync.mockReturnValue(mockTscOutput);

      const result = await analyzeTypeScriptErrors();

      expect(result.errorAnalysis.totalErrors).toBe(1);

      const error = result.errorAnalysis.priorityRanking[0];
      expect(error.filePath).toBe('src/components/test.tsx');
      expect(error.line).toBe(45);
      expect(error.column).toBe(12);
      expect(error.code).toBe('TS2304');
      expect(error.category).toBe(ErrorCategory.TS2304);
      expect(error.message).toBe("Cannot find name 'UndefinedVariable'.");
    });

    it('should ignore non-error lines', async () => {
      const mockTscOutput = [
        'Found 5 errors watching for file changes.',
        "src/test.ts(10,5): error TS2304: Cannot find name 'test'.",
        'Compilation complete. Watching for file changes.',
        'src/test2.ts(15,10): error TS2352: Conversion error.',
      ].join('\n');

      mockExecSync.mockReturnValue(mockTscOutput);

      const result = await analyzeTypeScriptErrors();

      expect(result.errorAnalysis.totalErrors).toBe(2);
    });
  });

  describe('Batch Scheduling', () => {
    it('should create appropriate batch sizes for different error categories', async () => {
      const mockTscOutput = [
        ...Array.from({ length: 50 }, (_, i) => `src/test${i}.ts(10,5): error TS2352: Conversion error.`),
        ...Array.from({ length: 30 }, (_, i) => `src/test${i}.ts(15,10): error TS2304: Cannot find name.`),
        ...Array.from({ length: 20 }, (_, i) => `src/test${i}.ts(20,15): error TS2345: Argument error.`),
      ].join('\n');

      mockExecSync.mockReturnValue(mockTscOutput);

      const result = await analyzeTypeScriptErrors();

      expect(result.batchSchedule.batches.length).toBeGreaterThan(0);
      expect(result.batchSchedule.totalEstimatedTime).toBeGreaterThan(0);

      // Should have different batch sizes for different categories
      const batchSizes = result.batchSchedule.batches.map(b => b.batchSize);
      expect(new Set(batchSizes).size).toBeGreaterThan(1); // Multiple different batch sizes
    });

    it('should include safety protocols based on campaign mode', async () => {
      const mockTscOutput = Array.from(
        { length: 600 },
        (_, i) => `src/test${i}.ts(10,5): error TS2304: Cannot find name 'test${i}'.`,
      ).join('\n');

      mockExecSync.mockReturnValue(mockTscOutput);

      const result = await analyzeTypeScriptErrors();

      expect(result.campaignMode).toBe(CampaignMode.EMERGENCY);
      expect(result.batchSchedule.safetyProtocols.length).toBeGreaterThan(0);
      expect(result.batchSchedule.safetyProtocols[0].name).toContain('Emergency');
    });
  });

  describe('Performance', () => {
    it('should complete analysis within reasonable time', async () => {
      const mockTscOutput = Array.from(
        { length: 100 },
        (_, i) => `src/test${i}.ts(10,5): error TS2304: Cannot find name 'test${i}'.`,
      ).join('\n');

      mockExecSync.mockReturnValue(mockTscOutput);

      const startTime = Date.now();
      const result = await analyzeTypeScriptErrors();
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      expect(result).toBeDefined();
    });
  });
});
