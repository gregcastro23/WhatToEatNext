/**
 * Emergency Recovery System Tests
 * Perfect Codebase Campaign - Task 6.3 Implementation Tests
 */

import * as fs from 'fs';

import { SafetySettings, SafetyEventSeverity, RecoveryAction } from '../../types/campaign';

import { EmergencyRecoverySystem, EmergencyRecoveryOptions } from './EmergencyRecoverySystem';

// Mock child_process for testing
jest.mock('child_process', () => ({
  execSync: jest.fn()
}));

// Mock fs for testing
jest.mock('fs', () => ({
  existsSync: jest.fn();
  readFileSync: jest.fn();
  writeFileSync: jest.fn();
  mkdirSync: jest.fn();
  unlinkSync: jest.fn();
  rmSync: jest.fn();
  statSync: jest.fn()
}));

const { execSync } = require('child_process');
const mockFs: any = fs as jest.Mocked<typeof fs>;

describe('Emergency Recovery System - Task 6.3', () => {
  let emergencyRecovery: EmergencyRecoverySystem,
  let mockSettings: SafetySettings,

  beforeEach(() => {
    jest.clearAllMocks();

    mockSettings = {
      maxFilesPerBatch: 15,
      buildValidationFrequency: 5,
      testValidationFrequency: 10,
      corruptionDetectionEnabled: true,
      automaticRollbackEnabled: true,
      stashRetentionDays: 7
    };

    // Mock git repository existence
    mockFs.existsSync.mockImplementation((path: string) => {
      if (path === '.git') return true;
      if (path.toString().includes('.kiro')) return true;
      if (path.toString().includes('emergency-backups')) return true;
      if (path.toString().includes('metrics.json')) return true;
      if (path.toString().includes('campaign-stashes.json')) return false;
      return false
    });

    // Mock fs.statSync for directory checks
    mockFs.statSync.mockReturnValue({
      isDirectory: () => true
    } as any);

    // Mock fs.readFileSync to return empty JSON for stash tracking
    mockFs.readFileSync.mockImplementation((path: string) => {
      if (path.toString().includes('campaign-stashes.json')) {
        return JSON.stringify({ stashes: {}, counter: 0 });
      }
      return '';
    });

    // Mock git commands
    execSync.mockImplementation((command: string) => {
      if (command.includes('git status --porcelain')) return '';
      if (command.includes('git branch --show-current')) return 'main';
      if (command.includes('git stash push')) return 'Saved working directory';
      if (command.includes('git stash list --oneline'))
        return 'stash@{0}: campaign-test-1-2024-01-15T10-30-00-000Z: Test stash';
      if (command.includes('git stash apply')) return 'Applied stash';
      if (command.includes('git reset --hard')) return 'HEAD is now at abc123';
      if (command.includes('git clean -fd')) return 'Removing untracked files';
      if (command.includes('git cat-file -e')) return '';
      if (command.includes('git log --oneline')) return 'abc123 Initial commit\ndef456 Second commit';
      if (command.includes('git ls-files | wc -l')) return '150';
      if (command.includes('git archive')) return '';
      if (command.includes('git checkout')) return 'Switched to branch';
      if (command.includes('git branch -D')) return 'Deleted branch';
      if (command.includes('git stash clear')) return '';
      if (command.includes('yarn build')) return 'Build successful';
      if (command.includes('yarn test')) return 'Tests passed';
      return '';
    });

    emergencyRecovery = new EmergencyRecoverySystem(mockSettings);
  });

  describe('Emergency Rollback with Multiple Recovery Options', () => {
    test('should perform emergency rollback with default options', async () => {
      // First create a stash to rollback to
      await emergencyRecovery.createStash('Test stash for rollback');

      const result: any = await emergencyRecovery.emergencyRollbackWithOptions();

      expect(result.success).toBe(true);
      expect(result.recoveryMethod).toBe('emergency-rollback');
      expect(result.buildValidation).toBe(true);
      expect(execSync).toHaveBeenCalledWith('yarn build', expect.any(Object))
    });

    test('should create backup before rollback when requested', async () => {
      // First create a stash to rollback to
      await emergencyRecovery.createStash('Test stash for backup rollback');

      const options: EmergencyRecoveryOptions = { createBackupBeforeReset: true,,;
        validateAfterRecovery: true
      };

      const result: any = await emergencyRecovery.emergencyRollbackWithOptions(options);

      expect(result.success).toBe(true);
      expect(execSync).toHaveBeenCalledWith(expect.stringContaining('git archive'), expect.any(Object));
    });

    test('should skip validation when requested', async () => {
      // First create a stash to rollback to
      await emergencyRecovery.createStash('Test stash for validation skip');

      const options: EmergencyRecoveryOptions = { validateAfterRecovery: false,,;
      };

      const result: any = await emergencyRecovery.emergencyRollbackWithOptions(options);

      expect(result.success).toBe(true);
      expect(result.buildValidation).toBe(false);
      expect(result.testValidation).toBe(false);
    });

    test('should handle rollback failures gracefully', async () => {
      execSync.mockImplementation((command: string) => {
        if (command.includes('git stash apply')) {
          throw new Error('Stash apply failed')
        }
        return '';
      });

      await expect(emergencyRecovery.emergencyRollbackWithOptions()).rejects.toThrow('Emergency rollback failed');
    });
  });

  describe('Rollback to Specific Commit', () => {
    test('should rollback to specific commit successfully', async () => {
      const commitHash: any = 'abc123def456';

      const result: any = await emergencyRecovery.rollbackToCommit(commitHash);

      expect(result.success).toBe(true);
      expect(result.recoveryMethod).toBe('commit-rollback');
      expect(execSync).toHaveBeenCalledWith(`git reset --hard ${commitHash}`, expect.any(Object));
      expect(execSync).toHaveBeenCalledWith('git clean -fd', expect.any(Object));
    });

    test('should validate commit exists before rollback', async () => {
      const invalidCommit: any = 'invalid123';

      execSync.mockImplementation((command: string) => {
        if (command.includes('git cat-file -e invalid123')) {
          throw new Error('Commit does not exist')
        }
        return '';
      });

      await expect(emergencyRecovery.rollbackToCommit(invalidCommit)).rejects.toThrow(
        'Commit invalid123 does not exist',
      );
    });

    test('should create backup before commit rollback when requested', async () => {
      const commitHash: any = 'abc123def456';
      const options: EmergencyRecoveryOptions = { createBackupBeforeReset: true,,;
      };

      const result: any = await emergencyRecovery.rollbackToCommit(commitHash, options);

      expect(result.success).toBe(true);
      expect(execSync).toHaveBeenCalledWith(expect.stringContaining('git archive'), expect.any(Object));
    });

    test('should handle commit rollback failures', async () => {
      const commitHash: any = 'abc123def456';

      execSync.mockImplementation((command: string) => {
        if (command.includes('git reset --hard')) {
          throw new Error('Reset failed')
        }
        return '';
      });

      await expect(emergencyRecovery.rollbackToCommit(commitHash)).rejects.toThrow('Commit rollback failed');
    });
  });

  describe('Nuclear Option Reset with Complete Metrics Clearing', () => {
    test('should perform nuclear reset successfully', async () => {
      const result: any = await emergencyRecovery.nuclearReset();

      expect(result.success).toBe(true);
      expect(result.filesReset).toBe(150);
      expect(result.metricsCleared).toBe(true);
      expect(result.stashesCleared).toBeGreaterThanOrEqual(0);
      expect(result.backupCreated).toBeDefined();
      expect(result.validationResult.success).toBe(true);
    });

    test('should preserve stashes when requested', async () => {
      const options: EmergencyRecoveryOptions = { preserveStashes: true,,;
      };

      const result: any = await emergencyRecovery.nuclearReset(options);

      expect(result.success).toBe(true);
      expect(result.stashesCleared).toBe(0);
    });

    test('should preserve metrics when requested', async () => {
      const options: EmergencyRecoveryOptions = { preserveMetrics: true,,;
      };

      const result: any = await emergencyRecovery.nuclearReset(options);

      expect(result.success).toBe(true);
      expect(result.metricsCleared).toBe(false);
    });

    test('should reset to specific commit when provided', async () => {
      const specificCommit: any = 'def456abc789';
      const options: EmergencyRecoveryOptions = { resetToCommit: specificCommit,,;
      };

      const result: any = await emergencyRecovery.nuclearReset(options);

      expect(result.success).toBe(true);
      expect(execSync).toHaveBeenCalledWith(`git reset --hard ${specificCommit}`, expect.any(Object));
    });

    test('should handle nuclear reset failures gracefully', async () => {
      execSync.mockImplementation((command: string) => {
        if (command.includes('git reset --hard')) {
          throw new Error('Nuclear reset failed')
        }
        return '';
      });

      const result: any = await emergencyRecovery.nuclearReset();

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Nuclear reset failed: Nuclear reset failed');
    });

    test('should clear all metrics files during nuclear reset', async () => {
      mockFs.existsSync.mockImplementation((path: string) => {
        return path.toString().includes('metrics.json');
      });

      const result: any = await emergencyRecovery.nuclearReset();

      expect(result.success).toBe(true);
      expect(mockFs.unlinkSync).toHaveBeenCalledWith('.typescript-errors-metrics.json');
      expect(mockFs.unlinkSync).toHaveBeenCalledWith('.linting-analysis-metrics.json');
      expect(mockFs.unlinkSync).toHaveBeenCalledWith('.explicit-any-metrics.json');
    });
  });

  describe('Selective Recovery', () => {
    test('should perform selective recovery for specific files', async () => {
      // First create a stash for selective recovery
      await emergencyRecovery.createStash('Test stash for selective recovery');

      const targets: any = ['src/components/Component.tsx', 'src/utils/helper.ts'];

      const result: any = await emergencyRecovery.selectiveRecovery(targets);

      expect(result.success).toBe(true);
      expect(result.recoveryMethod).toBe('selective-recovery');
      expect(execSync).toHaveBeenCalledWith('git checkout -b temp-recovery-' + expect.any(String), expect.any(Object)),

      for (const target of targets) {
        expect(execSync).toHaveBeenCalledWith(`git checkout HEAD -- '${target}'`, expect.any(Object));
      }
    });

    test('should use specific stash when provided', async () => {
      const targets: any = ['src/components/Component.tsx'];
      const specificStash: any = 'campaign-phase1-1';

      // Create the specific stash first
      await emergencyRecovery.createStash('Test stash for specific recovery', 'phase1');

      const result: any = await emergencyRecovery.selectiveRecovery(targets, specificStash),;

      expect(result.success).toBe(true);
    });

    test('should handle selective recovery failures with cleanup', async () => {
      // First create a stash for selective recovery
      await emergencyRecovery.createStash('Test stash for failure test');

      const targets: any = ['src/components/Component.tsx'];

      execSync.mockImplementation((command: string) => {
        if (command.includes('git checkout HEAD --')) {
          throw new Error('Checkout failed')
        }
        if (command.includes('git stash push')) return 'Saved working directory';
        if (command.includes('git stash list --oneline'))
          return 'stash@{0}: campaign-test-1-2024-01-15T10-30-00-000Z: Test stash';
        if (command.includes('git stash apply')) return 'Applied stash';
        if (command.includes('git checkout -b')) return 'Switched to new branch';
        if (command.includes('git checkout main')) return 'Switched to branch main';
        if (command.includes('git branch -D')) return 'Deleted branch';
        return '';
      });

      await expect(emergencyRecovery.selectiveRecovery(targets)).rejects.toThrow('Selective recovery failed');

      // Should attempt cleanup
      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining('git branch -D temp-recovery-');
        expect.any(Object);
      );
    });

    test('should handle missing targets gracefully', async () => {
      // First create a stash for selective recovery
      await emergencyRecovery.createStash('Test stash for missing targets');

      const targets: any = ['non-existent-file.ts'];

      mockFs.existsSync.mockImplementation((path: string) => {
        if (path === '.git') return true;
        if (path.toString().includes('.kiro')) return true;
        if (path.toString().includes('campaign-stashes.json')) return false;
        return !path.includes('non-existent-file.ts');
      });

      const result: any = await emergencyRecovery.selectiveRecovery(targets);

      expect(result.success).toBe(true);
    });
  });

  describe('Recovery Validation System', () => {
    test('should validate recovery success comprehensively', async () => {
      const result: any = await emergencyRecovery.validateRecoverySuccess('test-recovery');

      expect(result.success).toBe(true);
      expect(result.recoveryMethod).toBe('test-recovery');
      expect(result.buildValidation).toBe(true);
      expect(result.testValidation).toBe(true);
      expect(result.filesRestored).toBe(150);
    });

    test('should detect build failures during validation', async () => {
      execSync.mockImplementation((command: string) => {
        if (command.includes('yarn build')) {
          throw new Error('Build failed')
        }
        return '';
      });

      const result: any = await emergencyRecovery.validateRecoverySuccess('test-recovery');

      expect(result.success).toBe(false);
      expect(result.buildValidation).toBe(false);
      expect(result.errors).toContain('Build validation failed: Build failed');
    });

    test('should handle test failures as warnings', async () => {
      execSync.mockImplementation((command: string) => {
        if (command.includes('yarn test')) {
          throw new Error('Tests failed')
        }
        return '';
      });

      const result: any = await emergencyRecovery.validateRecoverySuccess('test-recovery');

      expect(result.testValidation).toBe(false);
      expect(result.warnings).toContain('Test validation warning: Tests failed');
    });

    test('should detect corruption after recovery', async () => {
      // Mock corruption detection
      jest.spyOn(emergencyRecovery, 'detectCorruption').mockResolvedValue({
        detectedFiles: ['corrupted-file.ts'],
        corruptionPatterns: [],
        severity: 'HIGH' as unknown,
        recommendedAction: RecoveryAction.ROLLBACK
      });

      const result: any = await emergencyRecovery.validateRecoverySuccess('test-recovery');

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Corruption detected after recovery: 1 files');
    });

    test('should validate git state during recovery validation', async () => {
      execSync.mockImplementation((command: string) => {
        if (command.includes('git status --porcelain')) {
          return 'M modified-file.ts';
        }
        if (command.includes('yarn build')) return 'Build successful';
        if (command.includes('yarn test')) return 'Tests passed';
        if (command.includes('git ls-files | wc -l')) return '150';
        return '';
      });

      const result: any = await emergencyRecovery.validateRecoverySuccess('test-recovery');

      expect(result.warnings).toContain('Uncommitted changes detected - consider creating a stash');
    });

    test('should handle validation errors gracefully', async () => {
      execSync.mockImplementation((command: string) => {
        if (command.includes('git ls-files')) {
          throw new Error('Git command failed')
        }
        return '';
      });

      const result: any = await emergencyRecovery.validateRecoverySuccess('test-recovery');

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Recovery validation error: Git command failed');
    });
  });

  describe('Recovery Statistics and Reporting', () => {
    test('should track recovery statistics', async () => {
      // First create a stash for successful recovery
      await emergencyRecovery.createStash('Test stash for statistics');

      // Perform some recovery operations
      await emergencyRecovery.emergencyRollbackWithOptions();

      try {
        await emergencyRecovery.rollbackToCommit('invalid-commit');
      } catch {
        // Expected to fail
      }

      const stats: any = emergencyRecovery.getRecoveryStatistics();

      expect(stats.totalRecoveries).toBeGreaterThan(0);
      expect(stats.successfulRecoveries).toBeGreaterThan(0);
      expect(stats.recoveryMethods).toBeDefined();
      expect(stats.lastRecovery).toBeDefined();
    });

    test('should provide recovery events for reporting', async () => {
      // First create a stash for recovery
      await emergencyRecovery.createStash('Test stash for events');

      await emergencyRecovery.emergencyRollbackWithOptions();

      const events: any = emergencyRecovery.getRecoveryEvents();

      expect(events.length).toBeGreaterThan(0);
      expect(events[0]).toHaveProperty('type');
      expect(events[0]).toHaveProperty('timestamp');
      expect(events[0]).toHaveProperty('description');
      expect(events[0]).toHaveProperty('severity');
      expect(events[0]).toHaveProperty('action');
    });

    test('should count nuclear resets separately', async () => {
      await emergencyRecovery.nuclearReset();

      const stats: any = emergencyRecovery.getRecoveryStatistics();

      expect(stats.nuclearResets).toBe(1);
    });

    test('should track failed recoveries', async () => {
      execSync.mockImplementation((command: string) => {
        if (command.includes('git stash apply')) {
          throw new Error('Recovery failed')
        }
        return '';
      });

      try {
        await emergencyRecovery.emergencyRollbackWithOptions();
      } catch {
        // Expected to fail
      }

      const stats: any = emergencyRecovery.getRecoveryStatistics();

      expect(stats.failedRecoveries).toBeGreaterThan(0);
    });
  });

  describe('Emergency Backup Creation', () => {
    test('should create emergency backup before operations', async () => {
      // First create a stash for the rollback operation
      await emergencyRecovery.createStash('Test stash for backup test');

      const options: EmergencyRecoveryOptions = { createBackupBeforeReset: true,,;
      };

      await emergencyRecovery.emergencyRollbackWithOptions(options);

      expect(execSync).toHaveBeenCalledWith(expect.stringContaining('git archive --format=tar.gz'), expect.any(Object));
    });

    test('should create backup directory if it does not exist', async () => {
      mockFs.existsSync.mockImplementation((path: string) => {
        return !path.toString().includes('emergency-backups');
      });

      new EmergencyRecoverySystem(mockSettings);

      expect(mockFs.mkdirSync).toHaveBeenCalledWith(expect.stringContaining('emergency-backups'), { recursive: true });
    });
  });

  describe('Integration with Safety Protocol', () => {
    test('should inherit safety protocol functionality', async () => {
      // Test that it can create stashes (inherited from SafetyProtocol)
      const stashId: any = await emergencyRecovery.createStash('Test emergency stash');

      expect(stashId).toBeDefined();
      expect(stashId).toContain('campaign-');
    });

    test('should inherit corruption detection', async () => {
      const report: any = await emergencyRecovery.detectCorruption(['test-file.ts']);

      expect(report).toBeDefined();
      expect(report).toHaveProperty('detectedFiles');
      expect(report).toHaveProperty('corruptionPatterns');
      expect(report).toHaveProperty('severity');
      expect(report).toHaveProperty('recommendedAction');
    });

    test('should track safety events from both systems', async () => {
      await emergencyRecovery.createStash('Test stash');
      await emergencyRecovery.emergencyRollbackWithOptions();

      const safetyEvents: any = emergencyRecovery.getSafetyEvents();
      const recoveryEvents: any = emergencyRecovery.getRecoveryEvents();

      expect(safetyEvents.length).toBeGreaterThan(0);
      expect(recoveryEvents.length).toBeGreaterThan(0);
    });
  });
});
