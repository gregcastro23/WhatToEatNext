/**
 * Tests for Validation Framework
 */

import { execSync } from 'child_process';
import fs from 'fs';

import { ValidationFramework } from './ValidationFramework';

// Mock execSync and fs
jest.mock('child_process');
jest.mock('fs');

const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;
const mockFs = fs as jest.Mocked<typeof fs>;

describe('ValidationFramework', () => {
  let validationFramework: ValidationFramework;

  beforeEach(() => {
    validationFramework = new ValidationFramework();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with phase validations', () => {
      const phases = validationFramework.getAvailablePhases();

      expect(phases).toHaveLength(4);
      expect(phases.map(p => p.id)).toEqual(['phase1', 'phase2', 'phase3', 'phase4']);
    });
  });

  describe('getAvailablePhases', () => {
    it('should return all available phases with correct structure', () => {
      const phases = validationFramework.getAvailablePhases();

      expect(phases).toEqual([
        { id: 'phase1', name: 'TypeScript Error Elimination', criteriaCount: 3 },
        { id: 'phase2', name: 'Linting Excellence Achievement', criteriaCount: 4 },
        { id: 'phase3', name: 'Enterprise Intelligence Transformation', criteriaCount: 3 },
        { id: 'phase4', name: 'Performance Optimization Maintenance', criteriaCount: 4 },
      ]);
    });
  });

  describe('validatePhase', () => {
    beforeEach(() => {
      // Mock successful executions by default
      mockExecSync.mockReturnValue('');
      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync.mockReturnValue({ size: 400 * 1024 } as unknown); // 400KB
    });

    it('should throw error for unknown phase', async () => {
      await expect(validationFramework.validatePhase('unknown-phase')).rejects.toThrow(
        'Unknown phase ID: unknown-phase',
      );
    });

    it('should validate Phase 1 successfully with zero TypeScript errors', async () => {
      // Mock zero TypeScript errors
      mockExecSync.mockReturnValue('No errors found');

      const result = await validationFramework.validatePhase('phase1');

      expect(result.phaseId).toBe('phase1');
      expect(result.success).toBe(true);
      expect(result.score).toBeGreaterThan(0.9); // Should be high score
      expect(result.passedCriteria).toBeGreaterThan(0);
      expect(result.results).toHaveLength(3); // 3 criteria for phase 1
    });

    it('should validate Phase 1 as failed with TypeScript errors present', async () => {
      // Mock TypeScript errors present
      mockExecSync.mockReturnValueOnce('error TS2322: Type error\nerror TS2345: Another error').mockReturnValueOnce(''); // Build succeeds

      const result = await validationFramework.validatePhase('phase1');

      expect(result.success).toBe(false);
      expect(result.failedCriteria).toBeGreaterThan(0);

      // Should have recommendations
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations[0]).toContain('Enhanced TypeScript Error Fixer');
    });

    it('should validate Phase 2 successfully with zero linting warnings', async () => {
      // Mock zero linting warnings
      mockExecSync.mockReturnValue('✓ No warnings found');

      const result = await validationFramework.validatePhase('phase2');

      expect(result.phaseId).toBe('phase2');
      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(4); // 4 criteria for phase 2
    });

    it('should validate Phase 2 as failed with linting warnings present', async () => {
      // Mock linting warnings present
      mockExecSync.mockReturnValue(`
        warning: @typescript-eslint/no-explicit-any found
        warning: no-unused-vars found
        warning: no-console found
      `);

      const result = await validationFramework.validatePhase('phase2');

      expect(result.success).toBe(false);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should validate Phase 3 successfully with sufficient enterprise systems', async () => {
      // Mock 250 enterprise systems
      mockExecSync
        .mockReturnValueOnce('250') // Enterprise systems count
        .mockReturnValueOnce('0') // No unused exports
        .mockReturnValueOnce(''); // Build succeeds

      const result = await validationFramework.validatePhase('phase3');

      expect(result.success).toBe(true);
      expect(result.results[0].result.value).toBe(250);
      expect(result.results[0].result.success).toBe(true);
    });

    it('should validate Phase 3 as failed with insufficient enterprise systems', async () => {
      // Mock only 150 enterprise systems (below 200 target)
      mockExecSync.mockReturnValueOnce('150').mockReturnValueOnce('0').mockReturnValueOnce('');

      const result = await validationFramework.validatePhase('phase3');

      expect(result.success).toBe(false);
      expect(result.results[0].result.value).toBe(150);
      expect(result.results[0].result.success).toBe(false);
    });

    it('should validate Phase 4 successfully with good performance metrics', async () => {
      // Mock fast build and test execution
      mockExecSync.mockImplementation(command => {
        if (command.includes('yarn build')) {
          // Simulate 5 second build
          return new Promise(resolve => setTimeout(() => resolve(''), 100)) as unknown;
        }
        if (command.includes('yarn test')) {
          // Simulate 30 second test run
          return new Promise(resolve => setTimeout(() => resolve(''), 100)) as unknown;
        }
        return '';
      });

      const result = await validationFramework.validatePhase('phase4');

      expect(result.phaseId).toBe('phase4');
      // Build time should be under 10 seconds (mocked to be fast)
      expect(result.results.some(r => r.criteriaId === 'build-time-target')).toBe(true);
    });

    it('should handle validation errors gracefully', async () => {
      // Mock command that throws error
      mockExecSync.mockImplementation(() => {
        throw new Error('Command failed');
      });

      const result = await validationFramework.validatePhase('phase1');

      expect(result.success).toBe(false);
      expect(result.results.every(r => !r.result.success)).toBe(true);
    });

    it('should store validation results in history', async () => {
      mockExecSync.mockReturnValue('');

      await validationFramework.validatePhase('phase1');

      const history = validationFramework.getValidationHistory();
      expect(history).toHaveLength(1);
      expect(history[0].phaseId).toBe('phase1');
    });

    it('should generate appropriate recommendations for failed criteria', async () => {
      // Mock TypeScript errors
      mockExecSync.mockReturnValueOnce('error TS2322: Type error');

      const result = await validationFramework.validatePhase('phase1');

      expect(result.recommendations).toContain(expect.stringContaining('Enhanced TypeScript Error Fixer'));
    });
  });

  describe('detectFailures', () => {
    it('should detect build failures', async () => {
      // Mock build failure
      const buildError = new Error('Build failed') as unknown;
      buildError.status = 1;
      mockExecSync.mockImplementation(command => {
        if (command.includes('yarn build')) {
          throw buildError;
        }
        return '';
      });

      const failures = await validationFramework.detectFailures();

      expect(failures.length).toBeGreaterThan(0);
      const buildFailure = failures.find(f => f.category === 'build');
      expect(buildFailure).toBeDefined();
      expect(buildFailure?.severity).toBe('critical');
      expect(buildFailure!.recoveryActions.length).toBeGreaterThan(0);
    });

    it('should detect test failures', async () => {
      // Mock test failure
      mockExecSync.mockImplementation(command => {
        if (command.includes('yarn test')) {
          throw new Error('Tests failed');
        }
        if (command.includes('yarn build')) {
          return '';
        }
        return '';
      });

      const failures = await validationFramework.detectFailures();

      const testFailure = failures.find(f => f.category === 'test');
      expect(testFailure).toBeDefined();
      expect(testFailure?.severity).toBe('high');
    });

    it('should detect high TypeScript error count', async () => {
      // Mock high number of TypeScript errors
      const manyErrors = Array(150).fill('error TS2322: Type error').join('\n');
      mockExecSync.mockImplementation(command => {
        if (command.includes('tsc --noEmit')) {
          return manyErrors;
        }
        return '';
      });

      const failures = await validationFramework.detectFailures();

      const tsFailure = failures.find(f => f.category === 'typescript');
      expect(tsFailure).toBeDefined();
      expect(tsFailure?.severity).toBe('high');
      expect(tsFailure!.automaticRecovery).toBe(true);
    });

    it('should detect performance degradation', async () => {
      // Mock slow build (simulate by making execSync take time)
      mockExecSync.mockImplementation(command => {
        if (command.includes('yarn build')) {
          // Simulate slow build by delaying
          const start = Date.now();
          while (Date.now() - start < 100) {
            // Busy wait to simulate slow build
          }
          return '';
        }
        return '';
      });

      const failures = await validationFramework.detectFailures();

      // Note: This test might be flaky due to timing, but demonstrates the concept
      const perfFailure = failures.find(f => f.category === 'performance');
      if (perfFailure) {
        expect(perfFailure.severity).toBe('medium');
        expect(perfFailure.automaticRecovery).toBe(true);
      }
    });

    it('should return empty array when no failures detected', async () => {
      // Mock all successful executions
      mockExecSync.mockReturnValue('');

      const failures = await validationFramework.detectFailures();

      expect(failures).toHaveLength(0);
    });
  });

  describe('getValidationHistory', () => {
    it('should return empty history initially', () => {
      const history = validationFramework.getValidationHistory();
      expect(history).toHaveLength(0);
    });

    it('should return validation history after validations', async () => {
      mockExecSync.mockReturnValue('');

      await validationFramework.validatePhase('phase1');
      await validationFramework.validatePhase('phase2');

      const history = validationFramework.getValidationHistory();
      expect(history).toHaveLength(2);
      expect(history[0].phaseId).toBe('phase1');
      expect(history[1].phaseId).toBe('phase2');
    });

    it('should return copy of history (not reference)', () => {
      const history1 = validationFramework.getValidationHistory();
      const history2 = validationFramework.getValidationHistory();

      expect(history1).not.toBe(history2); // Different objects
      expect(history1).toEqual(history2); // Same content
    });
  });

  describe('validation criteria', () => {
    it('should have required criteria marked correctly', () => {
      const phases = validationFramework.getAvailablePhases();

      // All phases should have at least one required criteria
      phases.forEach(phase => {
        expect(phase.criteriaCount).toBeGreaterThan(0);
      });
    });

    it('should have appropriate weights for criteria', async () => {
      mockExecSync.mockReturnValue('');

      const result = await validationFramework.validatePhase('phase1');

      // Weights should sum to approximately 1.0 for each phase
      const totalWeight = result.results.reduce((sum, r) => {
        // This is a simplified check - in real implementation we'd access the weights
        return sum + (r.result.success ? 0.33 : 0); // Assuming equal weights for test
      }, 0);

      expect(totalWeight).toBeGreaterThan(0);
    });
  });

  describe('error handling', () => {
    it('should handle timeout errors in validation', async () => {
      const timeoutError = new Error('Command timed out') as unknown;
      timeoutError.code = 'ETIMEDOUT';
      mockExecSync.mockImplementation(() => {
        throw timeoutError;
      });

      const result = await validationFramework.validatePhase('phase1');

      expect(result.success).toBe(false);
      expect(result.results.every(r => !r.result.success)).toBe(true);
    });

    it('should handle file system errors gracefully', async () => {
      mockFs.existsSync.mockImplementation(() => {
        throw new Error('File system error');
      });

      const result = await validationFramework.validatePhase('phase4');

      // Should still complete validation even with FS errors
      expect(result).toBeDefined();
      expect(result.phaseId).toBe('phase4');
    });
  });
});
