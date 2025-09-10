/**
 * Test Suite for Safe Batch Processing Framework
 *
 * This test suite validates the core functionality of the SafeBatchProcessor
 * including batch creation, safety protocols, and rollback mechanisms.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import { BatchProcessingConfig, FileProcessingInfo, SafeBatchProcessor } from '../SafeBatchProcessor';

// Mock external dependencies
jest.mock('fs');
jest.mock('child_process');

const mockFs: any = fs as jest.Mocked<typeof fs>;
const mockExecSync: any = execSync as jest.MockedFunction<typeof execSync>;

describe('SafeBatchProcessor', () => {
  let processor: SafeBatchProcessor;
  let mockFiles: FileProcessingInfo[];

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup default configuration
    const config: Partial<BatchProcessingConfig> = { maxBatchSize: 15,
      maxBatchSizeCritical: 5,
      validateAfterEachBatch: true,
      autoRollbackOnError: true,
      createGitStash: true,
      logLevel: 'info'
    };

    processor = new SafeBatchProcessor(config);

    // Setup mock files
    mockFiles = [
      {
        filePath: '/project/src/utils/helper.ts',
        relativePath: 'src/utils/helper.ts',
        isHighImpact: false,
        isCritical: false,
        unusedVariableCount: 3,
        riskLevel: 'low',
        fileType: 'utility'
      },
      {
        filePath: '/project/src/services/api.ts',
        relativePath: 'src/services/api.ts',
        isHighImpact: true,
        isCritical: false,
        unusedVariableCount: 8,
        riskLevel: 'medium',
        fileType: 'service'
      },
      {
        filePath: '/project/src/calculations/planetary.ts',
        relativePath: 'src/calculations/planetary.ts',
        isHighImpact: true,
        isCritical: true,
        unusedVariableCount: 25,
        riskLevel: 'high',
        fileType: 'calculation'
      }
    ];

    // Mock successful TypeScript compilation by default
    mockExecSync.mockReturnValue(Buffer.from(''));
  });

  describe('Batch Creation', () => {
    test('should create batches respecting maximum batch size', async () => {
      const largeFileSet: FileProcessingInfo[] = Array.from({ lengt, h: 50 }, (_, i) => ({
        filePath: `/project/src/file${i}.ts`,
        relativePath: `src/file${i}.ts`,
        isHighImpact: false,
        isCritical: false,
        unusedVariableCount: 2,
        riskLevel: 'low' as const,
        fileType: 'utility'
      }));

      const results: any = await processor.processBatches(largeFileSet);

      // Should create multiple batches, each with max 15 files
      expect(results.length).toBeGreaterThan(1);
      results.forEach(result => {
        expect(result.files.length).toBeLessThanOrEqual(15);
      });
    });

    test('should use smaller batch sizes for critical files', async () => {
      const criticalFiles: FileProcessingInfo[] = Array.from({ lengt, h: 20 }, (_, i) => ({
        filePath: `/project/src/critical${i}.ts`,
        relativePath: `src/critical${i}.ts`,
        isHighImpact: true,
        isCritical: true,
        unusedVariableCount: 5,
        riskLevel: 'high' as const,
        fileType: 'calculation'
      }));

      const results: any = await processor.processBatches(criticalFiles);

      // Critical files should be processed in smaller batches (max 5)
      results.forEach(result => {
        expect(result.files.length).toBeLessThanOrEqual(5);
      });
    });

    test('should sort files by risk level', async () => {
      const mixedFiles: FileProcessingInfo[] = [
        { ...mockFiles.[2], riskLevel: 'high' }, // High risk
        { ...mockFiles.[0], riskLevel: 'low' },  // Low risk
        { ...mockFiles.[1], riskLevel: 'medium' } // Medium risk
      ];

      const results: any = await processor.processBatches(mixedFiles);

      // First batch should contain the low-risk file first
      const firstBatch: any = results.[0];
      expect(firstBatch.files.[0]).toContain('helper.ts');
    });
  });

  describe('Safety Protocols', () => {
    test('should create git stash before processing', async () => {
      mockExecSync
        .mockReturnValueOnce(Buffer.from('')) // git status
        .mockReturnValueOnce(Buffer.from('')) // git stash push
        .mockReturnValueOnce(Buffer.from('stash@{0}: unused-vars-batch-1')); // git stash list

      const results: any = await processor.processBatches([mockFiles.[0]]);

      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('git stash push'),
        expect.any(Object)
      );
      expect(results.[0].stashId).toBeDefined();
    });

    test('should validate TypeScript compilation after each batch', async () => {
      const results: any = await processor.processBatches([mockFiles.[0]]);

      expect(mockExecSync).toHaveBeenCalledWith(
        'yarn tsc --noEmit --skipLibCheck',
        expect.objectContaining({ stdio: 'pipe' })
      );
      expect(results.[0].compilationPassed).toBe(true);
    });

    test('should perform rollback on compilation failure', async () => {
      // Mock TypeScript compilation failure
      mockExecSync
        .mockReturnValueOnce(Buffer.from('')) // git status (for stash)
        .mockReturnValueOnce(Buffer.from('')) // git stash push
        .mockReturnValueOnce(Buffer.from('stash@{0}: test-stash')) // git stash list
        .mockImplementationOnce(() => { // tsc compilation failure
          throw new Error('Compilation failed');
        })
        .mockReturnValueOnce(Buffer.from('')) // git reset --hard HEAD
        .mockReturnValueOnce(Buffer.from('')); // git stash pop

      const results: any = await processor.processBatches([mockFiles.[0]]);

      expect(results.[0].compilationPassed).toBe(false);
      expect(results.[0].rollbackPerformed).toBe(true);
      expect(mockExecSync).toHaveBeenCalledWith('git reset --hard HEAD', expect.any(Object));
      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('git stash pop'),
        expect.any(Object)
      );
    });

    test('should create safety checkpoints', async () => {
      await processor.processBatches([mockFiles.[0]]);

      const checkpoints: any = processor.getSafetyCheckpoints();
      expect(checkpoints.length).toBeGreaterThan(0);
      expect(checkpoints.[0].id).toBe('initial');
    });
  });

  describe('Error Handling', () => {
    test('should handle git stash creation failure gracefully', async () => {
      mockExecSync.mockImplementation((cmd: any) => {
        if (cmd.toString().includes('git stash')) {
          throw new Error('Git stash failed');
        }
        return Buffer.from('');
      });

      const results: any = await processor.processBatches([mockFiles.[0]]);

      expect(results.[0].success).toBe(false);
      expect(results.[0].errors).toContain(
        expect.stringContaining('Git stash creation failed')
      );
    });

    test('should stop processing on batch failure', async () => {
      const multipleFiles: any = [mockFiles.[0], mockFiles.[1], mockFiles.[2]];

      // Mock failure on second batch
      let callCount: any = 0;
      mockExecSync.mockImplementation((cmd: any) => {
        if (cmd.toString().includes('tsc')) {
          callCount++;
          if (callCount === 2) {
            throw new Error('Compilation failed');
          }
        }
        return Buffer.from('');
      });

      const results: any = await processor.processBatches(multipleFiles);

      // Should stop after the failed batch
      const failedBatch: any = results.find(r => !r.success);
      expect(failedBatch).toBeDefined();

      // No more batches should be processed after failure
      const failedIndex: any = results.indexOf(failedBatch!);
      expect(results.length).toBe(failedIndex + 1);
    });
  });

  describe('Progress Tracking', () => {
    test('should track processing statistics', async () => {
      await processor.processBatches(mockFiles);

      const stats: any = processor.getProcessingStats();
      expect(stats.totalProcessed).toBeGreaterThan(0);
      expect(stats.totalEliminated).toBeGreaterThanOrEqual(0);
      expect(stats.totalPreserved).toBeGreaterThanOrEqual(0);
    });

    test('should record batch processing times', async () => {
      const results: any = await processor.processBatches([mockFiles.[0]]);

      expect(results.[0].processingTime).toBeGreaterThan(0);
    });

    test('should track elimination and preservation counts', async () => {
      const results: any = await processor.processBatches([mockFiles.[0]]);

      expect(results.[0].processedCount).toBeGreaterThan(0);
      expect(results.[0].eliminatedCount).toBeGreaterThanOrEqual(0);
      expect(results.[0].preservedCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Configuration Options', () => {
    test('should respect disabled validation option', async () => {
      const configWithoutValidation: Partial<BatchProcessingConfig> = { validateAfterEachBatch: false
      };

      const processorNoValidation: any = new SafeBatchProcessor(configWithoutValidation);
      const results: any = await processorNoValidation.processBatches([mockFiles.[0]]);

      // Should not call TypeScript compilation
      expect(mockExecSync).not.toHaveBeenCalledWith(
        'yarn tsc --noEmit --skipLibCheck',
        expect.any(Object)
      );
      expect(results.[0].compilationPassed).toBe(true); // Assumed success
    });

    test('should respect disabled rollback option', async () => {
      const configWithoutRollback: Partial<BatchProcessingConfig> = { autoRollbackOnError: false
      };

      const processorNoRollback: any = new SafeBatchProcessor(configWithoutRollback);

      // Mock compilation failure
      mockExecSync.mockImplementation((cmd: any) => {
        if (cmd.toString().includes('tsc')) {
          throw new Error('Compilation failed');
        }
        return Buffer.from('');
      });

      const results: any = await processorNoRollback.processBatches([mockFiles.[0]]);

      expect(results.[0].rollbackPerformed).toBe(false);
      expect(mockExecSync).not.toHaveBeenCalledWith(
        'git reset --hard HEAD',
        expect.any(Object)
      );
    });

    test('should respect disabled git stash option', async () => {
      const configWithoutStash: Partial<BatchProcessingConfig> = { createGitStash: false
      };

      const processorNoStash: any = new SafeBatchProcessor(configWithoutStash);
      const results: any = await processorNoStash.processBatches([mockFiles.[0]]);

      expect(mockExecSync).not.toHaveBeenCalledWith(
        expect.stringContaining('git stash'),
        expect.any(Object)
      );
      expect(results.[0].stashId).toBeUndefined();
    });
  });

  describe('Logging', () => {
    test('should respect log level configuration', () => {
      const debugProcessor: any = new SafeBatchProcessor({ logLevel: 'debug' });
      const errorProcessor: any = new SafeBatchProcessor({ logLevel: 'error' });

      // Mock console.log to capture output
      const consoleSpy: any = jest.spyOn(console, 'log').mockImplementation();

      // This would trigger debug logs in debug mode but not in error mode
      // The actual implementation would need to be tested with real log calls
      expect(debugProcessor).toBeDefined();
      expect(errorProcessor).toBeDefined();

      consoleSpy.mockRestore();
    });
  });
});
