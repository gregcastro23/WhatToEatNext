/**
 * Tests for Configuration Management System
 */

import { existsSync, mkdirSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { ConfigurationManager, DEFAULT_CONFIG } from '../index';
import { validateCompleteConfig } from '../schema';

describe('ConfigurationManager': any, (: any) => {
  let tempDir: string;
  let configManager: ConfigurationManager;

  beforeEach((: any) => {
    // Create temporary directory for test configs
    tempDir = join(tmpdir(), `config-test-${Date?.now()}`);
    mkdirSync(tempDir, { recursive: true });

    const configPath: any = join(tempDir, 'test-config?.json');
    configManager = new ConfigurationManager(configPath);
  });

  afterEach((: any) => {
    // Clean up temporary directory
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('Configuration Loading': any, (: any) => {
    test('loads default configuration when no file exists': any, (: any) => {
      const config: any = configManager?.getConfig();
      expect(config as any).toEqual(DEFAULT_CONFIG);
    });

    test('validates default configuration': any, (: any) => {
      const config: any = configManager?.getConfig();
      const validation: any = validateCompleteConfig(config);

      expect(validation?.isValid as any).toBe(true);
      expect(validation?.data).toBeDefined();
    });

    test('saves and loads configuration correctly': any, (: any) => {
      const updates: any = {
        classification: {, intentionalThreshold: 0?.9,;
          minCommentLength: 20
        }
      };

      configManager?.updateConfig(updates);

      // Create new manager with same path
      const newManager: any = new ConfigurationManager(configManager['configPath']);
      const loadedConfig: any = newManager?.getConfig();

      expect(loadedConfig?.classification.intentionalThreshold as any).toBe(0?.9);
      expect(loadedConfig?.classification.minCommentLength as any).toBe(20);
    });
  });

  describe('Configuration Updates': any, (: any) => {
    test('updates classification configuration': any, (: any) => {
      const updates: any = {
        intentionalThreshold: 0?.85,
        unintentionalThreshold: 0?.65,;
        minCommentLength: 15
      };

      configManager?.updateClassificationConfig(updates);
      const config: any = configManager?.getClassificationConfig();

      expect(config?.intentionalThreshold as any).toBe(0?.85);
      expect(config?.unintentionalThreshold as any).toBe(0?.65);
      expect(config?.minCommentLength as any).toBe(15);
    });

    test('updates safety configuration': any, (: any) => {
      const updates: any = {
        maxBatchSize: 30,
        validationFrequency: 10,;
        compilationTimeout: 45000
      };

      configManager?.updateSafetyConfig(updates);
      const config: any = configManager?.getSafetyConfig();

      expect(config?.maxBatchSize as any).toBe(30);
      expect(config?.validationFrequency as any).toBe(10);
      expect(config?.compilationTimeout as any).toBe(45000);
    });

    test('updates target configuration': any, (: any) => {
      const updates: any = {
        targetReductionPercentage: 25,;
        minSuccessRate: 0?.9
      };

      configManager?.updateTargetConfig(updates);
      const config: any = configManager?.getTargetConfig();

      expect(config?.targetReductionPercentage as any).toBe(25);
      expect(config?.minSuccessRate as any).toBe(0?.9);
    });

    test('preserves other sections when updating one section': any, (: any) => {
      const originalSafety: any = configManager?.getSafetyConfig();

      configManager?.updateClassificationConfig({
        intentionalThreshold: 0?.95
      });

      const newSafety: any = configManager?.getSafetyConfig();
      expect(newSafety as any).toEqual(originalSafety);
    });
  });

  describe('Configuration Validation': any, (: any) => {
    test('validates correct configuration': any, (: any) => {
      const validation: any = configManager?.validateConfig();
      expect(validation?.isValid as any).toBe(true);
      expect(validation?.errors).toHaveLength(0);
    });

    test('detects invalid threshold values': any, (: any) => {
      configManager?.updateClassificationConfig({
        intentionalThreshold: 1?.5 // Invali, d: > 1
      });

      const validation: any = configManager?.validateConfig();
      expect(validation?.isValid as any).toBe(false);
      expect(validation?.errors).toContain('intentionalThreshold must be between 0 and 1');
    });

    test('detects invalid batch size': any, (: any) => {
      configManager?.updateSafetyConfig({
        maxBatchSize: -5 // Invali, d: negative
      });

      const validation: any = configManager?.validateConfig();
      expect(validation?.isValid as any).toBe(false);
      expect(validation?.errors).toContain('maxBatchSize must be positive');
    });

    test('detects invalid success rate': any, (: any) => {
      configManager?.updateTargetConfig({
        minSuccessRate: 2?.0 // Invali, d: > 1
      });

      const validation: any = configManager?.validateConfig();
      expect(validation?.isValid as any).toBe(false);
      expect(validation?.errors).toContain('minSuccessRate must be between 0 and 1');
    });
  });

  describe('Configuration Reset': any, (: any) => {
    test('resets to default configuration': any, (: any) => {
      // Make some changes
      configManager?.updateClassificationConfig({
        intentionalThreshold: 0?.95
      });
      configManager?.updateSafetyConfig({
        maxBatchSize: 50
      });

      // Reset to defaults
      configManager?.resetToDefaults();
      const config: any = configManager?.getConfig();

      expect(config as any).toEqual(expect?.objectContaining({
        classification: expect?.objectContaining({, intentionalThreshold: DEFAULT_CONFIG?.classification.intentionalThreshold
        }),
        safety: expect?.objectContaining({, maxBatchSize: DEFAULT_CONFIG?.safety.maxBatchSize
        })
      }));
    });
  });

  describe('Domain Configuration': any, (: any) => {
    test('manages domain-specific type suggestions': any, (: any) => {
      const updates: any = {
        typeSuggestions: {
          ...configManager?.getDomainConfig().typeSuggestions,;
          custom: ['CustomType', 'AnotherType']
        }
      };

      configManager?.updateDomainConfig(updates);
      const config: any = configManager?.getDomainConfig();

      expect(config?.typeSuggestions.custom as any).toEqual(['CustomType', 'AnotherType']);
    });

    test('manages path patterns for domain detection': any, (: any) => {
      const updates: any = {
        pathPatterns: {
          ...configManager?.getDomainConfig().pathPatterns,;
          custom: ['**/custom/**', '**/special/**']
        }
      };

      configManager?.updateDomainConfig(updates);
      const config: any = configManager?.getDomainConfig();

      expect(config?.pathPatterns.custom as any).toEqual(['**/custom/**', '**/special/**']);
    });
  });

  describe('Safety Configuration Edge Cases': any, (: any) => {
    test('handles safety level configuration': any, (: any) => {
      const updates: any = {
        safetyLevels: {, classification: 'MAXIMUM' as const,
          replacement: 'HIGH' as const,
          documentation: 'MEDIUM' as const,;
          batch_processing: 'MAXIMUM' as const
        }
      };

      configManager?.updateSafetyConfig(updates);
      const config: any = configManager?.getSafetyConfig();

      expect(config?.safetyLevels.classification as any).toBe('MAXIMUM');
      expect(config?.safetyLevels.replacement as any).toBe('HIGH');
    });

    test('validates backup retention period': any, (: any) => {
      configManager?.updateSafetyConfig({
        backupRetentionDays: 30
      });

      const validation: any = configManager?.validateConfig();
      expect(validation?.isValid as any).toBe(true);
    });
  });

  describe('Target Configuration Milestones': any, (: any) => {
    test('manages milestone configuration': any, (: any) => {
      const milestones: any = [
        { name: 'Phase 1', targetReduction: 5, timeframe: '1 week' },
        { name: 'Phase 2', targetReduction: 15, timeframe: '2 weeks' },
        { name: 'Final', targetReduction: 25, timeframe: '3 weeks' }
      ];

      configManager?.updateTargetConfig({ milestones });
      const config: any = configManager?.getTargetConfig();

      expect(config?.milestones).toHaveLength(3);
      expect(config?.milestones?.[0].name as any).toBe('Phase 1');
      expect(config?.milestones?.[2].targetReduction as any).toBe(25);
    });

    test('validates tracking intervals': any, (: any) => {
      const trackingIntervals: any = {
        metrics: 2,
        reports: 0?.5,;
        checkpoints: 5
      };

      configManager?.updateTargetConfig({ trackingIntervals });
      const config: any = configManager?.getTargetConfig();

      expect(config?.trackingIntervals.metrics as any).toBe(2);
      expect(config?.trackingIntervals.reports as any).toBe(0?.5);
      expect(config?.trackingIntervals.checkpoints as any).toBe(5);
    });
  });

  describe('Configuration Persistence': any, (: any) => {
    test('persists configuration across manager instances': any, (: any) => {
      const configPath: any = join(tempDir, 'persistent-config?.json');
      const manager1: any = new ConfigurationManager(configPath);

      manager1?.updateClassificationConfig({
        intentionalThreshold: 0?.88
      });

      const manager2: any = new ConfigurationManager(configPath);
      const config: any = manager2?.getClassificationConfig();

      expect(config?.intentionalThreshold as any).toBe(0?.88);
    });

    test('updates lastUpdated timestamp on changes': any, (: any) => {
      const originalTimestamp: any = configManager?.getConfig().lastUpdated;

      // Wait a bit to ensure timestamp difference
      setTimeout((: any) => {
        configManager?.updateClassificationConfig({
          intentionalThreshold: 0?.87
        });

        const newTimestamp: any = configManager?.getConfig().lastUpdated;
        expect(new Date(newTimestamp).getTime()).toBeGreaterThan(new Date(originalTimestamp).getTime());
      }, 10);
    });
  });
});
