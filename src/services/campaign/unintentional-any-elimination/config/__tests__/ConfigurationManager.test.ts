/**
 * Tests for Configuration Management System
 */

import { existsSync, mkdirSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { ConfigurationManager, DEFAULT_CONFIG } from '../index';
import { validateCompleteConfig } from '../schema';

describe('ConfigurationManager', () => {
  let tempDir: string;
  let configManager: ConfigurationManager;

  beforeEach(() => {
    // Create temporary directory for test configs
    tempDir = join(tmpdir(), `config-test-${Date.now()}`);
    mkdirSync(tempDir, { recursive: true });

    const configPath = join(tempDir, 'test-config.json');
    configManager = new ConfigurationManager(configPath);
  });

  afterEach(() => {
    // Clean up temporary directory
    if (existsSync(tempDir) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('Configuration Loading', () => {
    test('loads default configuration when no file exists', () => {
      const config = configManager.getConfig();
      expect(config).toEqual(DEFAULT_CONFIG);
    });

    test('validates default configuration', () => {
      const config = configManager.getConfig();
      const validation = validateCompleteConfig(config);

      expect(validation.isValid).toBe(true);
      expect(validation.data).toBeDefined();
    });

    test('saves and loads configuration correctly', () => {
      const updates = {
        classification: {
          intentionalThreshold: 0.9,
          minCommentLength: 20
        }
      };

      configManager.updateConfig(updates);

      // Create new manager with same path
      const newManager = new ConfigurationManager(configManager['configPath']);
      const loadedConfig = newManager.getConfig();

      expect(loadedConfig.classification.intentionalThreshold).toBe(0.9);
      expect(loadedConfig.classification.minCommentLength).toBe(20);
    });
  });

  describe('Configuration Updates', () => {
    test('updates classification configuration', () => {
      const updates = {
        intentionalThreshold: 0.85,
        unintentionalThreshold: 0.65,
        minCommentLength: 15
      };

      configManager.updateClassificationConfig(updates);
      const config = configManager.getClassificationConfig();

      expect(config.intentionalThreshold).toBe(0.85);
      expect(config.unintentionalThreshold).toBe(0.65);
      expect(config.minCommentLength).toBe(15);
    });

    test('updates safety configuration', () => {
      const updates = {
        maxBatchSize: 30,
        validationFrequency: 10,
        compilationTimeout: 45000
      };

      configManager.updateSafetyConfig(updates);
      const config = configManager.getSafetyConfig();

      expect(config.maxBatchSize).toBe(30);
      expect(config.validationFrequency).toBe(10);
      expect(config.compilationTimeout).toBe(45000);
    });

    test('updates target configuration', () => {
      const updates = {
        targetReductionPercentage: 25,
        minSuccessRate: 0.9
      };

      configManager.updateTargetConfig(updates);
      const config = configManager.getTargetConfig();

      expect(config.targetReductionPercentage).toBe(25);
      expect(config.minSuccessRate).toBe(0.9);
    });

    test('preserves other sections when updating one section', () => {
      const originalSafety = configManager.getSafetyConfig();

      configManager.updateClassificationConfig({
        intentionalThreshold: 0.95
      });

      const newSafety = configManager.getSafetyConfig();
      expect(newSafety).toEqual(originalSafety);
    });
  });

  describe('Configuration Validation', () => {
    test('validates correct configuration', () => {
      const validation = configManager.validateConfig();
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('detects invalid threshold values', () => {
      configManager.updateClassificationConfig({
        intentionalThreshold: 1.5 // Invalid: > 1
      });

      const validation = configManager.validateConfig();
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('intentionalThreshold must be between 0 and 1');
    });

    test('detects invalid batch size', () => {
      configManager.updateSafetyConfig({ maxBatchSize: -5 // Invalid, negative
      });

      const validation = configManager.validateConfig();
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('maxBatchSize must be positive');
    });

    test('detects invalid success rate', () => {
      configManager.updateTargetConfig({
        minSuccessRate: 2.0 // Invalid: > 1
      });

      const validation = configManager.validateConfig();
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('minSuccessRate must be between 0 and 1');
    });
  });

  describe('Configuration Reset', () => {
    test('resets to default configuration', () => {
      // Make some changes
      configManager.updateClassificationConfig({
        intentionalThreshold: 0.95
      });
      configManager.updateSafetyConfig({
        maxBatchSize: 50
      });

      // Reset to defaults
      configManager.resetToDefaults();
      const config = configManager.getConfig();

      expect(config).toEqual(expect.objectContaining({
        classification: expect.objectContaining({
          intentionalThreshold: DEFAULT_CONFIG.classification.intentionalThreshold
        }),
        safety: expect.objectContaining({
          maxBatchSize: DEFAULT_CONFIG.safety.maxBatchSize
        })
      }));
    });
  });

  describe('Domain Configuration', () => {
    test('manages domain-specific type suggestions', () => {
      const updates = {
        typeSuggestions: {
          ...configManager.getDomainConfig().typeSuggestions,
          custom: ['CustomType', 'AnotherType']
        }
      };

      configManager.updateDomainConfig(updates);
      const config = configManager.getDomainConfig();

      expect(config.typeSuggestions.custom).toEqual(['CustomType', 'AnotherType']);
    });

    test('manages path patterns for domain detection', () => {
      const updates = {
        pathPatterns: {
          ...configManager.getDomainConfig().pathPatterns,
          custom: ['**/custom/**', '**/special/**']
        }
      };

      configManager.updateDomainConfig(updates);
      const config = configManager.getDomainConfig();

      expect(config.pathPatterns.custom).toEqual(['**/custom/**', '**/special/**']);
    });
  });

  describe('Safety Configuration Edge Cases', () => {
    test('handles safety level configuration', () => {
      const updates = {
        safetyLevels: {
          classification: 'MAXIMUM' as const,
          replacement: 'HIGH' as const,
          documentation: 'MEDIUM' as const,
          batch_processing: 'MAXIMUM' as const
        }
      };

      configManager.updateSafetyConfig(updates);
      const config = configManager.getSafetyConfig();

      expect(config.safetyLevels.classification).toBe('MAXIMUM');
      expect(config.safetyLevels.replacement).toBe('HIGH');
    });

    test('validates backup retention period', () => {
      configManager.updateSafetyConfig({
        backupRetentionDays: 30
      });

      const validation = configManager.validateConfig();
      expect(validation.isValid).toBe(true);
    });
  });

  describe('Target Configuration Milestones', () => {
    test('manages milestone configuration', () => {
      const milestones = [
        { name: 'Phase 1', targetReduction: 5, timeframe: '1 week' },
        { name: 'Phase 2', targetReduction: 15, timeframe: '2 weeks' },
        { name: 'Final', targetReduction: 25, timeframe: '3 weeks' }
      ];

      configManager.updateTargetConfig({ milestones });
      const config = configManager.getTargetConfig();

      expect(config.milestones).toHaveLength(3);
      expect(config.milestones[0].name).toBe('Phase 1');
      expect(config.milestones[2].targetReduction).toBe(25);
    });

    test('validates tracking intervals', () => {
      const trackingIntervals = {
        metrics: 2,
        reports: 0.5,
        checkpoints: 5
      };

      configManager.updateTargetConfig({ trackingIntervals });
      const config = configManager.getTargetConfig();

      expect(config.trackingIntervals.metrics).toBe(2);
      expect(config.trackingIntervals.reports).toBe(0.5);
      expect(config.trackingIntervals.checkpoints).toBe(5);
    });
  });

  describe('Configuration Persistence', () => {
    test('persists configuration across manager instances', () => {
      const configPath = join(tempDir, 'persistent-config.json');
      const manager1 = new ConfigurationManager(configPath);

      manager1.updateClassificationConfig({
        intentionalThreshold: 0.88
      });

      const manager2 = new ConfigurationManager(configPath);
      const config = manager2.getClassificationConfig();

      expect(config.intentionalThreshold).toBe(0.88);
    });

    test('updates lastUpdated timestamp on changes', () => {
      const originalTimestamp = configManager.getConfig().lastUpdated;

      // Wait a bit to ensure timestamp difference
      setTimeout(() => {
        configManager.updateClassificationConfig({
          intentionalThreshold: 0.87
        });

        const newTimestamp = configManager.getConfig().lastUpdated;
        expect(new Date(newTimestamp).getTime()).toBeGreaterThan(new Date(originalTimestamp).getTime());
      }, 10);
    });
  });
});
