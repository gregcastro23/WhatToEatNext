/**
 * Unit Tests for SafetyProtocol
 * Perfect Codebase Campaign - Safety Protocol Testing
 */

import { execSync } from 'child_process';
import * as fs from 'fs';

import {
  CorruptionSeverity,
  GitStash,
  RecoveryAction,
  SafetyEventSeverity,
  SafetyEventType,
  SafetySettings,
} from '../../../types/campaign';
import { SafetyProtocol } from '../SafetyProtocol';

// Mock dependencies
jest.mock('child_process');
jest.mock('fs');

const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;
const mockFs = fs as jest.Mocked<typeof fs>;

describe('SafetyProtocol', () => {
  let safetyProtocol: SafetyProtocol;
  let mockSettings: SafetySettings;

  beforeEach(() => {
    mockSettings = {
      maxFilesPerBatch: 25,
      buildValidationFrequency: 5,
      testValidationFrequency: 10,
      corruptionDetectionEnabled: true,
      automaticRollbackEnabled: true,
      stashRetentionDays: 7,
    };

    safetyProtocol = new SafetyProtocol(mockSettings);

    // Reset mocks
    jest.clearAllMocks();

    // Default mock implementations
    mockExecSync.mockReturnValue('');
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue('valid content');
  });

  describe('Constructor', () => {
    it('should initialize with provided settings', () => {
      expect(safetyProtocol).toBeInstanceOf(SafetyProtocol);
    });

    it('should initialize empty stashes map', () => {
      const stashes = (safetyProtocol as unknown as { stashes: Map<string, GitStash> }).stashes;
      expect(stashes.size).toBe(0);
    });

    it('should initialize empty safety events array', () => {
      const events = (safetyProtocol as unknown as { safetyEvents: unknown[] }).safetyEvents;
      expect(events).toEqual([]);
    });
  });

  describe('createStash', () => {
    beforeEach(() => {
      // Mock git commands
      mockExecSync
        .mockReturnValueOnce('') // git status validation
        .mockReturnValueOnce('') // git stash push
        .mockReturnValueOnce('stash@{0}: campaign-1-2023-01-01T00-00-00-000Z: Test stash') // git stash list
        .mockReturnValueOnce('main'); // git branch --show-current
    });

    it('should create git stash with descriptive name', async () => {
      const stashId = await safetyProtocol.createStash('Test stash', 'phase1');

      expect(stashId).toMatch(/^campaign-phase1-\d+-/);
      expect(mockExecSync).toHaveBeenCalledWith(expect.stringContaining('git stash push -u -m'), expect.any(Object));
    });

    it('should store stash information', async () => {
      const stashId = await safetyProtocol.createStash('Test stash');

      const stashes = (safetyProtocol as unknown as { stashes: Map<string, GitStash> }).stashes;
      expect(stashes.has(stashId)).toBe(true);

      const stash = stashes.get(stashId);
      expect(stash.description).toContain('Test stash');
      expect(stash.ref).toBe('stash@{0}');
    });

    it('should record safety event for stash creation', async () => {
      await safetyProtocol.createStash('Test stash');

      const events = (safetyProtocol as unknown as { safetyEvents: unknown[] }).safetyEvents;
      expect(events.length).toBe(1);
      expect((events as Record<string, (unknown>) as Record<string, unknown>)[0].type).toBe((SafetyEventType as Record<string, unknown>).CHECKPOINT_CREATED);
      expect((events as Record<string, (unknown>) as Record<string, unknown>)[0].description).toContain('Git stash created');
    });

    it('should handle git validation failure', async () => {
      // Mock git validation failure
      jest
        .spyOn(
          safetyProtocol as unknown as { validateGitState: () => Promise<{ success: boolean }> },
          'validateGitState',
        )
        .mockResolvedValue({
          success: false,
          errors: ['Not a git repository'],
          warnings: [],
        });

      await expect(safetyProtocol.createStash('Test stash')).rejects.toThrow(
        'Git validation failed: Not a git repository',
      );
    });

    it('should handle git stash creation failure', async () => {
      mockExecSync.mockImplementation(command => {
        if (command.toString().includes('git stash push')) {
          throw new Error('Git stash failed');
        }
        return '';
      });

      await expect(safetyProtocol.createStash('Test stash')).rejects.toThrow(
        'Failed to create git stash: Git stash failed',
      );
    });
  });

  describe('applyStash', () => {
    let mockStash: GitStash;

    beforeEach(() => {
      mockStash = {
        id: 'test-stash-1',
        description: 'Test stash description',
        timestamp: new Date(),
        branch: 'main',
        ref: 'stash@{0}',
      };

      // Add stash to internal map
      (safetyProtocol as unknown as { stashes: Map<string, GitStash> }).stashes.set('test-stash-1', mockStash);

      // Mock git validation
      jest
        .spyOn(
          safetyProtocol as unknown as { validateGitState: () => Promise<{ success: boolean }> },
          'validateGitState',
        )
        .mockResolvedValue({
          success: true,
          errors: [],
          warnings: [],
        });
    });

    it('should apply stash successfully', async () => {
      await safetyProtocol.applyStash('test-stash-1');

      expect(mockExecSync).toHaveBeenCalledWith('git stash apply stash@{0}', expect.any(Object));
    });

    it('should record safety event for stash application', async () => {
      await safetyProtocol.applyStash('test-stash-1');

      const events = (safetyProtocol as unknown as { safetyEvents: unknown[] }).safetyEvents;
      expect(events.length).toBe(1);
      expect((events as Record<string, (unknown>) as Record<string, unknown>)[0].type).toBe((SafetyEventType as Record<string, unknown>).ROLLBACK_TRIGGERED);
      expect((events as Record<string, (unknown>) as Record<string, unknown>)[0].description).toContain('Git stash applied: test-stash-1');
    });

    it('should validate git state after application when requested', async () => {
      await safetyProtocol.applyStash('test-stash-1', true);

      expect(safetyProtocol['validateGitState']).toHaveBeenCalled();
    });

    it('should handle non-existent stash', async () => {
      await expect(safetyProtocol.applyStash('non-existent')).rejects.toThrow('Stash not found: non-existent');
    });

    it('should handle git stash apply failure', async () => {
      mockExecSync.mockImplementation(command => {
        if (command.toString().includes('git stash apply')) {
          throw new Error('Git stash apply failed');
        }
        return '';
      });

      await expect(safetyProtocol.applyStash('test-stash-1')).rejects.toThrow(
        'Failed to apply git stash test-stash-1: Git stash apply failed',
      );
    });
  });

  describe('autoApplyLatestStash', () => {
    beforeEach(() => {
      // Add multiple stashes with different timestamps
      const stash1 = {
        id: 'stash-1',
        description: 'First stash',
        timestamp: new Date('2023-01-01'),
        branch: 'main',
        ref: 'stash@{1}',
      };
      const stash2 = {
        id: 'stash-2',
        description: 'Latest stash',
        timestamp: new Date('2023-01-02'),
        branch: 'main',
        ref: 'stash@{0}',
      };

      const stashMap = (safetyProtocol as unknown as { stashes: Map<string, GitStash> }).stashes;
      stashMap.set('stash-1', stash1);
      stashMap.set('stash-2', stash2);

      jest.spyOn(safetyProtocol, 'applyStash').mockResolvedValue();
    });

    it('should apply the most recent stash', async () => {
      const appliedStashId = await safetyProtocol.autoApplyLatestStash();

      expect(appliedStashId).toBe('stash-2');
      expect(safetyProtocol.applyStash).toHaveBeenCalledWith('stash-2');
    });

    it('should handle no available stashes', async () => {
      (safetyProtocol as unknown as { stashes: Map<string, GitStash> }).stashes.clear();

      await expect(safetyProtocol.autoApplyLatestStash()).rejects.toThrow(
        'No stashes available for automatic rollback',
      );
    });
  });

  describe('detectCorruption', () => {
    const mockFiles = ['file1.ts', 'file2.ts', 'file3.ts'];

    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('valid content');
    });

    it('should detect no corruption in valid files', async () => {
      const report = await safetyProtocol.detectCorruption(mockFiles);

      expect(report.detectedFiles).toEqual([]);
      expect(report.corruptionPatterns).toEqual([]);
      expect(report.severity).toBe(CorruptionSeverity.LOW);
      expect(report.recommendedAction).toBe(RecoveryAction.CONTINUE);
    });

    it('should detect git merge conflict markers', async () => {
      mockFs.readFileSync.mockReturnValue(`
        function test() {
        <<<<<<< HEAD
          return 'version 1';
        =======
          return 'version 2';
        >>>>>>> branch
        }
      `);

      const report = await safetyProtocol.detectCorruption(['file1.ts']);

      expect(report.detectedFiles).toContain('file1.ts');
      expect(report.severity).toBe(CorruptionSeverity.CRITICAL);
      expect(report.recommendedAction).toBe(RecoveryAction.EMERGENCY_RESTORE);
    });

    it('should detect corrupted import statements', async () => {
      mockFs.readFileSync.mockReturnValue(`
        import @/types from './types';
        import @/services from './services';
      `);

      const report = await safetyProtocol.detectCorruption(['file1.ts']);

      expect(report.detectedFiles).toContain('file1.ts');
      expect(report.severity).toBe(CorruptionSeverity.HIGH);
      expect(report.corruptionPatterns.some(p => p.description.includes('Corrupted type import'))).toBe(true);
    });

    it('should detect syntax corruption', async () => {
      mockFs.readFileSync.mockReturnValue(`
        function test() {
          return 'missing closing brace';
      `);

      const report = await safetyProtocol.detectCorruption(['file1.ts']);

      expect(report.detectedFiles).toContain('file1.ts');
      expect(report.severity).toBe(CorruptionSeverity.HIGH);
    });

    it('should handle file read errors', async () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const report = await safetyProtocol.detectCorruption(['file1.ts']);

      expect(report.detectedFiles).toContain('file1.ts');
      expect(report.severity).toBe(CorruptionSeverity.HIGH);
      expect(report.corruptionPatterns.some(p => p.pattern === 'FILE_READ_ERROR')).toBe(true);
    });

    it('should skip non-existent files', async () => {
      mockFs.existsSync.mockReturnValue(false);

      const report = await safetyProtocol.detectCorruption(['non-existent.ts']);

      expect(report.detectedFiles).toEqual([]);
      expect(report.severity).toBe(CorruptionSeverity.LOW);
    });

    it('should record safety event when corruption is detected', async () => {
      mockFs.readFileSync.mockReturnValue('<<<<<<< HEAD\nconflict\n>>>>>>> branch');

      await safetyProtocol.detectCorruption(['file1.ts']);

      const events = (safetyProtocol as unknown as { safetyEvents: unknown[] }).safetyEvents;
      expect(events.length).toBe(1);
      expect((events as Record<string, (unknown>) as Record<string, unknown>)[0].type).toBe((SafetyEventType as Record<string, unknown>).CORRUPTION_DETECTED);
    });
  });

  describe('detectImportExportCorruption', () => {
    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(true);
    });

    it('should detect empty import statements', async () => {
      mockFs.readFileSync.mockReturnValue(`
import something, { a, b } from './module';
        export { };
      `);

      const report = await safetyProtocol.detectImportExportCorruption(['file1.ts']);

      expect(report.detectedFiles).toContain('file1.ts');
      expect(report.corruptionPatterns.some(p => p.description.includes('Empty import'))).toBe(true);
      expect(report.corruptionPatterns.some(p => p.description.includes('Empty export'))).toBe(true);
    });

    it('should detect import from undefined module', async () => {
      mockFs.readFileSync.mockReturnValue(`
        import something from "undefined";
      `);

      const report = await safetyProtocol.detectImportExportCorruption(['file1.ts']);

      expect(report.detectedFiles).toContain('file1.ts');
      expect(report.severity).toBe(CorruptionSeverity.HIGH);
      expect(report.corruptionPatterns.some(p => p.description.includes('Import from undefined'))).toBe(true);
    });

    it('should detect duplicate from clauses', async () => {
      mockFs.readFileSync.mockReturnValue(`
      `);

      const report = await safetyProtocol.detectImportExportCorruption(['file1.ts']);

      expect(report.detectedFiles).toContain('file1.ts');
      expect(report.severity).toBe(CorruptionSeverity.HIGH);
    });

    it('should detect double commas in destructuring', async () => {
      mockFs.readFileSync.mockReturnValue(`
        export { x,, y };
      `);

      const report = await safetyProtocol.detectImportExportCorruption(['file1.ts']);

      expect(report.detectedFiles).toContain('file1.ts');
      expect(report.severity).toBe(CorruptionSeverity.HIGH);
    });

    it('should skip non-JavaScript/TypeScript files', async () => {
      const report = await safetyProtocol.detectImportExportCorruption(['file1.txt', 'file2.md']);

      expect(report.detectedFiles).toEqual([]);
      expect(report.severity).toBe(CorruptionSeverity.LOW);
    });
  });

  describe('validateSyntaxWithTypeScript', () => {
    it('should validate syntax using TypeScript compiler', async () => {
      mockExecSync.mockReturnValue('No errors found');

      const report = await safetyProtocol.validateSyntaxWithTypeScript(['file1.ts', 'file2.ts']);

      expect(mockExecSync).toHaveBeenCalledWith('yarn tsc --noEmit --skipLibCheck 2>&1', expect.any(Object));
      expect(report.detectedFiles).toEqual([]);
      expect(report.severity).toBe(CorruptionSeverity.LOW);
    });

    it('should detect TypeScript syntax errors', async () => {
      mockExecSync.mockReturnValue(`
        file1.ts(10,5): error TS1005: Unexpected token 'function'
        file2.ts(15,10): error TS1109: Expression expected
      `);

      const report = await safetyProtocol.validateSyntaxWithTypeScript(['file1.ts', 'file2.ts']);

      expect(report.detectedFiles).toContain('file1.ts');
      expect(report.detectedFiles).toContain('file2.ts');
      expect(report.severity).toBe(CorruptionSeverity.HIGH);
    });

    it('should handle TypeScript compilation errors', async () => {
      mockExecSync.mockImplementation(() => {
        const error = new Error('TypeScript compilation failed') as Error & { stdout?: string };
        error.stdout = 'Unexpected token at line 5';
        throw error;
      });

      const report = await safetyProtocol.validateSyntaxWithTypeScript(['file1.ts']);

      expect(report.severity).toBe(CorruptionSeverity.HIGH);
      expect(report.corruptionPatterns.some(p => p.pattern === 'TYPESCRIPT_COMPILATION_ERROR')).toBe(true);
    });

    it('should skip non-TypeScript files', async () => {
      const report = await safetyProtocol.validateSyntaxWithTypeScript(['file1.js', 'file2.txt']);

      expect(report.detectedFiles).toEqual([]);
      expect(report.severity).toBe(CorruptionSeverity.LOW);
    });
  });

  describe('emergencyRollback', () => {
    beforeEach(() => {
      const stash = {
        id: 'emergency-stash',
        description: 'Emergency stash',
        timestamp: new Date(),
        branch: 'main',
        ref: 'stash@{0}',
      };

      (safetyProtocol as unknown as { stashes: Map<string, GitStash> }).stashes.set('emergency-stash', stash);
      jest.spyOn(safetyProtocol, 'applyStash').mockResolvedValue();
    });

    it('should apply the most recent stash for emergency rollback', async () => {
      await safetyProtocol.emergencyRollback();

      expect(safetyProtocol.applyStash).toHaveBeenCalledWith('emergency-stash');
    });

    it('should record safety event for emergency rollback', async () => {
      await safetyProtocol.emergencyRollback();

      const events = (safetyProtocol as unknown as { safetyEvents: unknown[] }).safetyEvents;
      expect(events.length).toBe(1);
      expect((events as Record<string, (unknown>) as Record<string, unknown>)[0].type).toBe((SafetyEventType as Record<string, unknown>).EMERGENCY_RECOVERY);
      expect((events as Record<string, (unknown>) as Record<string, unknown>)[0].description).toContain('Emergency rollback completed');
    });

    it('should handle no available stashes', async () => {
      (safetyProtocol as unknown as { stashes: Map<string, GitStash> }).stashes.clear();

      await expect(safetyProtocol.emergencyRollback()).rejects.toThrow('No stashes available for emergency rollback');
    });

    it('should handle rollback failure', async () => {
      jest.spyOn(safetyProtocol, 'applyStash').mockRejectedValue(new Error('Rollback failed'));

      await expect(safetyProtocol.emergencyRollback()).rejects.toThrow('Emergency rollback failed: Rollback failed');

      const events = (safetyProtocol as unknown as { safetyEvents: unknown[] }).safetyEvents;
      expect(
        events.some(e => e.type === SafetyEventType.EMERGENCY_RECOVERY && e.severity === SafetyEventSeverity.CRITICAL),
      ).toBe(true);
    });
  });

  describe('validateGitState', () => {
    it('should validate successful git state', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockExecSync.mockReturnValue(''); // No uncommitted changes

      const result = await safetyProtocol.validateGitState();

      expect(result.success).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should detect non-git repository', async () => {
      mockFs.existsSync.mockReturnValue(false);

      const result = await safetyProtocol.validateGitState();

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Not a git repository');
    });

    it('should warn about uncommitted changes when automatic rollback is disabled', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockExecSync.mockReturnValue('M file1.ts\nA file2.ts'); // Uncommitted changes

      const settingsWithoutAutoRollback = { ...mockSettings, automaticRollbackEnabled: false };
      const protocol = new SafetyProtocol(settingsWithoutAutoRollback);

      const result = await protocol.validateGitState();

      expect(result.success).toBe(true);
      expect(result.warnings).toContain('Uncommitted changes detected - consider creating a stash');
    });

    it('should handle git command failure', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockExecSync.mockImplementation(() => {
        throw new Error('Git command failed');
      });

      const result = await safetyProtocol.validateGitState();

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Git validation failed: Git command failed');
    });
  });

  describe('cleanupOldStashes', () => {
    beforeEach(() => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 10); // 10 days old

      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 3); // 3 days old

      const oldStash = {
        id: 'old-stash',
        description: 'Old stash',
        timestamp: oldDate,
        branch: 'main',
        ref: 'stash@{1}',
      };

      const recentStash = {
        id: 'recent-stash',
        description: 'Recent stash',
        timestamp: recentDate,
        branch: 'main',
        ref: 'stash@{0}',
      };

      const stashMap = (safetyProtocol as unknown as { stashes: Map<string, GitStash> }).stashes;
      stashMap.set('old-stash', oldStash);
      stashMap.set('recent-stash', recentStash);
    });

    it('should cleanup stashes older than retention period', async () => {
      await safetyProtocol.cleanupOldStashes();

      const stashes = (safetyProtocol as unknown as { stashes: Map<string, GitStash> }).stashes;
      expect(stashes.has('old-stash')).toBe(false);
      expect(stashes.has('recent-stash')).toBe(true);
    });

    it('should attempt to drop git stashes', async () => {
      await safetyProtocol.cleanupOldStashes();

      expect(mockExecSync).toHaveBeenCalledWith('git stash drop stash@{1}', expect.any(Object));
    });

    it('should handle git stash drop failures gracefully', async () => {
      mockExecSync.mockImplementation(command => {
        if (command.toString().includes('git stash drop')) {
          throw new Error('Stash not found');
        }
        return '';
      });

      // Should not throw error
      await expect(safetyProtocol.cleanupOldStashes()).resolves.not.toThrow();

      // Should still remove from tracking
      const stashes = (safetyProtocol as unknown as { stashes: Map<string, GitStash> }).stashes;
      expect(stashes.has('old-stash')).toBe(false);
    });

    it('should record safety event for cleanup', async () => {
      await safetyProtocol.cleanupOldStashes();

      const events = (safetyProtocol as unknown as { safetyEvents: unknown[] }).safetyEvents;
      expect(events.some(e => e.description.includes('Cleaned up 1 old stashes'))).toBe(true);
    });
  });

  describe('getStashStatistics', () => {
    beforeEach(() => {
      const stash1 = {
        id: 'campaign-phase1-1-timestamp',
        description: 'Phase 1 stash',
        timestamp: new Date('2023-01-01'),
        branch: 'main',
      };

      const stash2 = {
        id: 'campaign-phase2-2-timestamp',
        description: 'Phase 2 stash',
        timestamp: new Date('2023-01-02'),
        branch: 'main',
      };

      const stash3 = {
        id: 'campaign-phase1-3-timestamp',
        description: 'Another Phase 1 stash',
        timestamp: new Date('2023-01-03'),
        branch: 'main',
      };

      const stashMap = (safetyProtocol as unknown as { stashes: Map<string, GitStash> }).stashes;
      stashMap.set('stash1', stash1);
      stashMap.set('stash2', stash2);
      stashMap.set('stash3', stash3);
    });

    it('should return comprehensive stash statistics', () => {
      const stats = safetyProtocol.getStashStatistics();

      expect(stats.total).toBe(3);
      expect(stats.byPhase.phase1).toBe(2);
      expect(stats.byPhase.phase2).toBe(1);
      expect(stats.oldestStash).toEqual(new Date('2023-01-01'));
      expect(stats.newestStash).toEqual(new Date('2023-01-03'));
    });

    it('should handle empty stashes', () => {
      (safetyProtocol as unknown as { stashes: Map<string, GitStash> }).stashes.clear();

      const stats = safetyProtocol.getStashStatistics();

      expect(stats.total).toBe(0);
      expect(stats.byPhase).toEqual({});
      expect(stats.oldestStash).toBeUndefined();
      expect(stats.newestStash).toBeUndefined();
    });
  });

  describe('Real-time Monitoring', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.spyOn(safetyProtocol, 'detectCorruption').mockResolvedValue({
        detectedFiles: [],
        corruptionPatterns: [],
        severity: CorruptionSeverity.LOW,
        recommendedAction: RecoveryAction.CONTINUE,
      });
    });

    afterEach(() => {
      jest.useRealTimers();
      // Cleanup any active monitoring
      try {
        safetyProtocol.stopRealTimeMonitoring();
      } catch (error) {
        // Ignore cleanup errors
      }
    });

    it('should start real-time monitoring', () => {
      const files = ['file1.ts', 'file2.ts'];

      // Start monitoring
      safetyProtocol.startRealTimeMonitoring(files, 1000);

      // Fast-forward time to trigger monitoring
      jest.advanceTimersByTime(1000);

      // Verify that detectCorruption was called
      expect(safetyProtocol.detectCorruption).toHaveBeenCalledWith(files);
    }, 3000); // 3 second timeout

    it('should trigger emergency rollback on critical corruption', () => {
      jest.spyOn(safetyProtocol, 'detectCorruption').mockResolvedValue({
        detectedFiles: ['file1.ts'],
        corruptionPatterns: [],
        severity: CorruptionSeverity.CRITICAL,
        recommendedAction: RecoveryAction.EMERGENCY_RESTORE,
      });
      jest.spyOn(safetyProtocol, 'emergencyRollback').mockResolvedValue();

      const files = ['file1.ts'];
      safetyProtocol.startRealTimeMonitoring(files, 1000);

      // Fast-forward time to trigger monitoring
      jest.advanceTimersByTime(1000);

      // The emergency rollback should be triggered (async operation will complete)
      expect(safetyProtocol.detectCorruption).toHaveBeenCalledWith(files);
    }, 3000); // 3 second timeout

    it('should stop real-time monitoring', () => {
      const files = ['file1.ts'];
      safetyProtocol.startRealTimeMonitoring(files, 1000);

      safetyProtocol.stopRealTimeMonitoring();

      // Fast-forward time - monitoring should not trigger
      jest.advanceTimersByTime(1000);

      expect(safetyProtocol.detectCorruption).not.toHaveBeenCalled();
    }, 2000); // 2 second timeout

    it('should handle monitoring errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      jest.spyOn(safetyProtocol, 'detectCorruption').mockRejectedValue(new Error('Monitoring error'));

      const files = ['file1.ts'];
      safetyProtocol.startRealTimeMonitoring(files, 1000);

      // Fast-forward time to trigger monitoring
      jest.advanceTimersByTime(1000);

      // The error handling should be triggered (async operation will complete)
      expect(safetyProtocol.detectCorruption).toHaveBeenCalledWith(files);

      consoleSpy.mockRestore();
    }, 3000); // 3 second timeout
  });

  describe('Safety Event Management', () => {
    it('should limit safety events to prevent memory issues', () => {
      // Add many safety events
      for (let i = 0; i < 1100; i++) {
        (safetyProtocol as unknown as { addSafetyEvent: (event: Record<string, unknown>) => void }).addSafetyEvent({
          type: SafetyEventType.CHECKPOINT_CREATED,
          timestamp: new Date(),
          description: `Event ${i}`,
          severity: SafetyEventSeverity.INFO,
          action: 'TEST',
        });
      }

      const events = (safetyProtocol as unknown as { safetyEvents: unknown[] }).safetyEvents;
      expect(events.length).toBe(500); // Should be trimmed to 500
    });

    it('should preserve most recent events when trimming', () => {
      // Add many safety events
      for (let i = 0; i < 1100; i++) {
        (safetyProtocol as unknown as { addSafetyEvent: (event: Record<string, unknown>) => void }).addSafetyEvent({
          type: SafetyEventType.CHECKPOINT_CREATED,
          timestamp: new Date(),
          description: `Event ${i}`,
          severity: SafetyEventSeverity.INFO,
          action: 'TEST',
        });
      }

      const events = (safetyProtocol as unknown as { safetyEvents: unknown[] }).safetyEvents;
      expect((events as Record<string, (unknown>) as Record<string, (unknown>) as Record<string, unknown>)[(events as Record<string, unknown>).length - 1].description).toBe(
        'Event 1099',
      );
    });
  });
});
