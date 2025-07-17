/**
 * Git Safety Management Tests
 * Perfect Codebase Campaign - Task 6.1 Implementation Tests
 */

import { SafetyProtocol } from './SafetyProtocol';
import { SafetySettings } from '../../types/campaign';
import * as fs from 'fs';
import * as path from 'path';

// Mock child_process for testing
jest.mock('child_process', () => ({
  execSync: jest.fn()
}));

// Mock fs for testing
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn()
}));

const { execSync } = require('child_process');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('Git Safety Management - Task 6.1', () => {
  let safetyProtocol: SafetyProtocol;
  let mockSettings: SafetySettings;

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
      if (path.toString().includes('.kiro')) return false; // Don't load existing stash data
      return false;
    });

    // Mock git commands
    execSync.mockImplementation((command: string) => {
      if (command.includes('git status --porcelain')) return '';
      if (command.includes('git branch --show-current')) return 'main';
      if (command.includes('git stash push')) return 'Saved working directory';
      if (command.includes('git stash list --oneline')) return 'stash@{0}: campaign-test-1-2024-01-15T10-30-00-000Z: Test stash';
      if (command.includes('git stash list')) return 'stash@{0}: On main: campaign-test-1-2024-01-15T10-30-00-000Z: Test stash';
      if (command.includes('git stash apply')) return 'Applied stash';
      if (command.includes('git stash drop')) return 'Dropped stash';
      return '';
    });

    safetyProtocol = new SafetyProtocol(mockSettings);
  });

  describe('Git Stash Creation with Descriptive Naming', () => {
    test('should create stash with descriptive naming conventions', async () => {
      const description = 'Before TypeScript error fixes';
      const phase = 'phase1';

      const stashId = await safetyProtocol.createStash(description, phase);

      expect(stashId).toMatch(/^campaign-phase1-\d+-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z$/);
      expect(execSync).toHaveBeenCalledWith(
        expect.stringMatching(/git stash push -u -m "campaign-phase1-\d+-.*: Before TypeScript error fixes"/),
        expect.any(Object)
      );
    });

    test('should create checkpoint stash with operation context', async () => {
      const operation = 'Enhanced Error Fixer v3.0';
      const phase = 'phase1';

      const stashId = await safetyProtocol.createCheckpointStash(operation, phase);

      expect(stashId).toMatch(/^campaign-phase1-\d+-/);
      expect(execSync).toHaveBeenCalledWith(
        expect.stringMatching(/git stash push -u -m ".*Checkpoint before Enhanced Error Fixer v3.0 in phase1"/),
        expect.any(Object)
      );
    });

    test('should validate git state before creating stash', async () => {
      // Mock git validation failure
      mockFs.existsSync.mockImplementation((path: string) => {
        if (path === '.git') return false;
        return true;
      });

      await expect(safetyProtocol.createStash('test')).rejects.toThrow('Git validation failed');
    });

    test('should handle stash creation failures gracefully', async () => {
      execSync.mockImplementation((command: string) => {
        if (command.includes('git stash push')) {
          throw new Error('Git stash failed');
        }
        return '';
      });

      await expect(safetyProtocol.createStash('test')).rejects.toThrow('Failed to create git stash: Git stash failed');
    });
  });

  describe('Automatic Stash Application for Rollback Scenarios', () => {
    test('should apply specific stash by ID', async () => {
      // First create a stash
      const stashId = await safetyProtocol.createStash('test stash');
      
      // Then apply it
      await safetyProtocol.applyStash(stashId);

      expect(execSync).toHaveBeenCalledWith(
        'git stash apply stash@{0}',
        expect.any(Object)
      );
    });

    test('should automatically apply latest stash for rollback', async () => {
      // Create multiple stashes
      await safetyProtocol.createStash('first stash');
      await safetyProtocol.createStash('second stash');

      const appliedStashId = await safetyProtocol.autoApplyLatestStash();

      expect(appliedStashId).toMatch(/^campaign-\d+-/);
      expect(execSync).toHaveBeenCalledWith(
        expect.stringMatching(/git stash apply stash@\{\d+\}/),
        expect.any(Object)
      );
    });

    test('should apply stash by phase for targeted rollbacks', async () => {
      // Create stashes for different phases
      await safetyProtocol.createStash('phase1 work', 'phase1');
      await safetyProtocol.createStash('phase2 work', 'phase2');

      const appliedStashId = await safetyProtocol.applyStashByPhase('phase1');

      expect(appliedStashId).toMatch(/^campaign-phase1-/);
    });

    test('should handle missing stash gracefully', async () => {
      await expect(safetyProtocol.applyStash('nonexistent-stash')).rejects.toThrow('Stash not found');
    });

    test('should handle no stashes available for auto-apply', async () => {
      await expect(safetyProtocol.autoApplyLatestStash()).rejects.toThrow('No stashes available for automatic rollback');
    });
  });

  describe('Stash Cleanup with Configurable Retention Policies', () => {
    test('should clean up old stashes based on retention policy', async () => {
      // Mock old stash data
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 10); // 10 days old

      // Mock file existence for this specific test
      mockFs.existsSync.mockImplementation((path: string) => {
        if (path === '.git') return true;
        if (path.toString().includes('campaign-stashes.json')) return true;
        return false;
      });

      mockFs.readFileSync.mockReturnValue(JSON.stringify({
        counter: 2,
        stashes: {
          'old-stash-1': {
            id: 'old-stash-1',
            description: 'Old stash',
            timestamp: oldDate.toISOString(),
            branch: 'main',
            ref: 'stash@{1}'
          }
        }
      }));

      // Create new safety protocol to load the old stash
      const newSafetyProtocol = new SafetyProtocol(mockSettings);
      
      await newSafetyProtocol.cleanupOldStashes();

      expect(execSync).toHaveBeenCalledWith('git stash drop stash@{1}', expect.any(Object));
    });

    test('should get stashes by phase', async () => {
      await safetyProtocol.createStash('phase1 work', 'phase1');
      await safetyProtocol.createStash('phase2 work', 'phase2');
      await safetyProtocol.createStash('more phase1 work', 'phase1');

      const phase1Stashes = await safetyProtocol.getStashesByPhase('phase1');

      expect(phase1Stashes).toHaveLength(2);
      expect(phase1Stashes.every(stash => stash.id.includes('-phase1-'))).toBe(true);
    });

    test('should provide stash statistics', async () => {
      // Create a fresh safety protocol to avoid interference from other tests
      const freshProtocol = new SafetyProtocol(mockSettings);
      
      await freshProtocol.createStash('phase1 work', 'phase1');
      await freshProtocol.createStash('phase2 work', 'phase2');
      await freshProtocol.createStash('more phase1 work', 'phase1');

      const stats = freshProtocol.getStashStatistics();

      expect(stats.total).toBe(3);
      expect(stats.byPhase.phase1).toBe(2);
      expect(stats.byPhase.phase2).toBe(1);
      expect(stats.oldestStash).toBeInstanceOf(Date);
      expect(stats.newestStash).toBeInstanceOf(Date);
    });
  });

  describe('Stash Tracking Persistence', () => {
    test('should save stash tracking to persistent storage', async () => {
      await safetyProtocol.createStash('test stash');

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        expect.stringMatching(/\.kiro[\/\\]campaign-stashes\.json$/),
        expect.stringContaining('"counter":')
      );
    });

    test('should load stash tracking from persistent storage', async () => {
      const mockStashData = {
        counter: 5,
        stashes: {
          'test-stash': {
            id: 'test-stash',
            description: 'Test stash',
            timestamp: new Date().toISOString(),
            branch: 'main',
            ref: 'stash@{0}'
          }
        }
      };

      // Mock file existence for this specific test
      mockFs.existsSync.mockImplementation((path: string) => {
        if (path === '.git') return true;
        if (path.toString().includes('campaign-stashes.json')) return true;
        return false;
      });

      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockStashData));

      const newSafetyProtocol = new SafetyProtocol(mockSettings);
      const stashes = await newSafetyProtocol.listStashes();

      expect(stashes).toHaveLength(1);
      expect(stashes[0].id).toBe('test-stash');
    });

    test('should handle corrupted stash tracking file gracefully', async () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File corrupted');
      });

      // Should not throw, just log warning
      expect(() => new SafetyProtocol(mockSettings)).not.toThrow();
    });
  });

  describe('Git State Validation', () => {
    test('should validate git repository state', async () => {
      const validation = await safetyProtocol.validateGitState();

      expect(validation.success).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should detect non-git repository', async () => {
      mockFs.existsSync.mockImplementation((path: string) => {
        if (path === '.git') return false;
        return true;
      });

      const validation = await safetyProtocol.validateGitState();

      expect(validation.success).toBe(false);
      expect(validation.errors).toContain('Not a git repository');
    });

    test('should warn about uncommitted changes when auto-rollback disabled', async () => {
      execSync.mockImplementation((command: string) => {
        if (command.includes('git status --porcelain')) return 'M modified-file.ts';
        return '';
      });

      const settingsWithoutAutoRollback = {
        ...mockSettings,
        automaticRollbackEnabled: false
      };

      const protocol = new SafetyProtocol(settingsWithoutAutoRollback);
      const validation = await protocol.validateGitState();

      expect(validation.success).toBe(true);
      expect(validation.warnings).toContain('Uncommitted changes detected - consider creating a stash');
    });
  });

  describe('Safety Event Tracking', () => {
    test('should track stash creation events', async () => {
      await safetyProtocol.createStash('test stash');

      const events = safetyProtocol.getSafetyEvents();
      const stashEvent = events.find(e => e.action === 'STASH_CREATE');

      expect(stashEvent).toBeDefined();
      expect(stashEvent?.description).toContain('Git stash created');
    });

    test('should track stash application events', async () => {
      const stashId = await safetyProtocol.createStash('test stash');
      await safetyProtocol.applyStash(stashId);

      const events = safetyProtocol.getSafetyEvents();
      const applyEvent = events.find(e => e.action === 'STASH_APPLY');

      expect(applyEvent).toBeDefined();
      expect(applyEvent?.description).toContain('Git stash applied');
    });

    test('should track cleanup events', async () => {
      // Mock file existence for this specific test
      mockFs.existsSync.mockImplementation((path: string) => {
        if (path === '.git') return true;
        if (path.toString().includes('campaign-stashes.json')) return true;
        return false;
      });

      // Mock old stash
      mockFs.readFileSync.mockReturnValue(JSON.stringify({
        counter: 1,
        stashes: {
          'old-stash': {
            id: 'old-stash',
            description: 'Old stash',
            timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days old
            branch: 'main',
            ref: 'stash@{0}'
          }
        }
      }));

      const newProtocol = new SafetyProtocol(mockSettings);
      await newProtocol.cleanupOldStashes();

      const events = newProtocol.getSafetyEvents();
      const cleanupEvent = events.find(e => e.action === 'STASH_CLEANUP');

      expect(cleanupEvent).toBeDefined();
    });
  });
});