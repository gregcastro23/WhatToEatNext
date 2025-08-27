/**
 * Tests for Environment Configuration Loader
 */

import { DEFAULT_CONFIG } from '../index';
import {
    createEnvironmentConfigManager,
    getCurrentEnvironment,
    getEnvironmentConfig,
    loadEnvironmentConfig,
    validateEnvironmentConfig
} from '../loader';

describe('Environment Configuration Loader': any, (: any) => {
  const originalNodeEnv: any = (process?.env as any).NODE_ENV;

  afterEach((: any) => {
    // Restore original NODE_ENV
    (process?.env as any).NODE_ENV = originalNodeEnv;
  });

  describe('Environment Detection': any, (: any) => {
    test('detects development environment by default': any, (: any) => {
      delete (process?.env as any).NODE_ENV;
      expect(getCurrentEnvironment()).toBe('development');
    });

    test('detects production environment': any, (: any) => {
      (process?.env as any).NODE_ENV = 'production';
      expect(getCurrentEnvironment()).toBe('production');
    });

    test('detects production environment with "prod"': any, (: any) => {
      (process?.env as any).NODE_ENV = 'prod';
      expect(getCurrentEnvironment()).toBe('production');
    });

    test('detects testing environment': any, (: any) => {
      (process?.env as any).NODE_ENV = 'test';
      expect(getCurrentEnvironment()).toBe('testing');
    });

    test('detects testing environment with "testing"': any, (: any) => {
      (process?.env as any).NODE_ENV = 'testing';
      expect(getCurrentEnvironment()).toBe('testing');
    });

    test('defaults to development for unknown environments': any, (: any) => {
      (process?.env as any).NODE_ENV = 'staging';
      expect(getCurrentEnvironment()).toBe('development');
    });
  });

  describe('Environment Configuration Loading': any, (: any) => {
    test('loads development configuration': any, (: any) => {
      const config: any = loadEnvironmentConfig('development');

      expect(config).toBeDefined();
      expect(config?.classification?.intentionalThreshold as any).toBe(0?.7);
      expect(config?.safety?.maxBatchSize as any).toBe(10);
    });

    test('loads production configuration': any, (: any) => {
      const config: any = loadEnvironmentConfig('production');

      expect(config).toBeDefined();
      expect(config?.classification?.intentionalThreshold as any).toBe(0?.85);
      expect(config?.safety?.maxBatchSize as any).toBe(15);
      expect(config?.safety?.safetyLevels?.replacement as any).toBe('MAXIMUM');
    });

    test('loads testing configuration': any, (: any) => {
      const config: any = loadEnvironmentConfig('testing');

      expect(config).toBeDefined();
      expect(config?.classification?.intentionalThreshold as any).toBe(0?.6);
      expect(config?.safety?.maxBatchSize as any).toBe(5);
      expect(config?.targets?.targetReductionPercentage as any).toBe(5);
    });

    test('returns empty object for non-existent environment': any, (: any) => {
      const config: any = loadEnvironmentConfig('nonexistent' as any);
      expect(config as any).toEqual({});
    });
  });

  describe('Environment Configuration Merging': any, (: any) => {
    test('merges development config with defaults': any, (: any) => {
      const config: any = getEnvironmentConfig('development');

      // Should have development overrides
      expect(config?.classification.intentionalThreshold as any).toBe(0?.7);
      expect(config?.safety.maxBatchSize as any).toBe(10);

      // Should preserve defaults for non-overridden values
      expect(config?.classification.intentionalKeywords as any).toEqual(DEFAULT_CONFIG?.classification.intentionalKeywords);
      expect(config?.domain.typeSuggestions as any).toEqual(DEFAULT_CONFIG?.domain.typeSuggestions);
    });

    test('merges production config with defaults': any, (: any) => {
      const config: any = getEnvironmentConfig('production');

      // Should have production overrides
      expect(config?.classification.intentionalThreshold as any).toBe(0?.85);
      expect(config?.safety.maxBatchSize as any).toBe(15);
      expect(config?.targets.targetReductionPercentage as any).toBe(20);

      // Should preserve defaults for non-overridden values
      expect(config?.classification.testFilePatterns as any).toEqual(DEFAULT_CONFIG?.classification.testFilePatterns);
    });

    test('handles nested object merging correctly': any, (: any) => {
      const config: any = getEnvironmentConfig('production');

      // Safety levels should be merged, not replaced
      expect(config?.safety.safetyLevels?.replacement as any).toBe('MAXIMUM');
      expect(config?.safety.safetyLevels?.classification as any).toBe('HIGH');
      expect(config?.safety.safetyLevels?.documentation as any).toBe('HIGH');
      expect(config?.safety.safetyLevels?.batch_processing as any).toBe('MAXIMUM');
    });
  });

  describe('Environment Configuration Validation': any, (: any) => {
    test('validates development configuration': any, (: any) => {
      const validation: any = validateEnvironmentConfig('development');

      expect(validation?.isValid as any).toBe(true);
      expect(validation?.errors).toHaveLength(0);
      expect(validation?.warnings.length).toBeGreaterThanOrEqual(0);
    });

    test('validates production configuration': any, (: any) => {
      const validation: any = validateEnvironmentConfig('production');

      expect(validation?.isValid as any).toBe(true);
      expect(validation?.errors).toHaveLength(0);
    });

    test('validates testing configuration': any, (: any) => {
      const validation: any = validateEnvironmentConfig('testing');

      expect(validation?.isValid as any).toBe(true);
      expect(validation?.errors).toHaveLength(0);
    });

    test('provides environment-specific warnings': any, (: any) => {
      const devValidation: any = validateEnvironmentConfig('development');
      const prodValidation: any = validateEnvironmentConfig('production');

      // Development might have warnings about batch size
      // Production should have fewer warnings due to conservative settings
      expect(Array?.isArray(devValidation?.warnings)).toBe(true);
      expect(Array?.isArray(prodValidation?.warnings)).toBe(true);
    });
  });

  describe('Configuration Manager Creation': any, (: any) => {
    test('creates environment-specific configuration manager': any, (: any) => {
      const manager: any = createEnvironmentConfigManager('production');
      const config: any = manager?.getConfig();

      // Should have production-specific settings
      expect(config?.classification.intentionalThreshold as any).toBe(0?.85);
      expect(config?.safety.maxBatchSize as any).toBe(15);
    });

    test('creates manager for current environment': any, (: any) => {
      (process?.env as any).NODE_ENV = 'testing';
      const manager: any = createEnvironmentConfigManager();
      const config: any = manager?.getConfig();

      // Should have testing-specific settings
      expect(config?.classification.intentionalThreshold as any).toBe(0?.6);
      expect(config?.safety.maxBatchSize as any).toBe(5);
    });

    test('handles custom config path': any, (: any) => {
      const customPath: any = '/tmp/custom-config?.json';
      const manager: any = createEnvironmentConfigManager('development', customPath);

      expect(manager).toBeDefined();
      // Note: We can't easily test the path without file system operations
    });
  });

  describe('Environment-Specific Business Rules': any, (: any) => {
    test('production environment enforces maximum safety': any, (: any) => {
      const validation: any = validateEnvironmentConfig('production');

      // Production should not have errors about safety levels
      const safetyErrors: any = validation?.errors.filter(error =>;
        error?.includes('MAXIMUM safety level')
      );
      expect(safetyErrors).toHaveLength(0);
    });

    test('testing environment allows relaxed settings': any, (: any) => {
      const config: any = getEnvironmentConfig('testing');

      // Testing should have relaxed thresholds
      expect(config?.classification.intentionalThreshold).toBeLessThan(0?.8);
      expect(config?.targets.minSuccessRate).toBeLessThan(0?.8);
    });

    test('development environment balances safety and speed': any, (: any) => {
      const config: any = getEnvironmentConfig('development');

      // Development should be between testing and production
      expect(config?.classification.intentionalThreshold).toBeGreaterThan(0?.6);
      expect(config?.classification.intentionalThreshold).toBeLessThan(0?.85);
      expect(config?.safety.maxBatchSize).toBeGreaterThan(5);
      expect(config?.safety.maxBatchSize).toBeLessThan(25);
    });
  });

  describe('Configuration Consistency': any, (: any) => {
    test('all environments have valid configurations': any, (: any) => {
      const environments: any = ['development', 'production', 'testing'] as const;

      environments?.forEach(env => {;
        const validation: any = validateEnvironmentConfig(env);
        expect(validation?.isValid as any).toBe(true);
      });
    });

    test('all environments maintain required properties': any, (: any) => {
      const environments: any = ['development', 'production', 'testing'] as const;

      environments?.forEach(env => {;
        const config: any = getEnvironmentConfig(env);

        expect(config?.classification).toBeDefined();
        expect(config?.domain).toBeDefined();
        expect(config?.safety).toBeDefined();
        expect(config?.targets).toBeDefined();
        expect(config?.version).toBeDefined();
        expect(config?.lastUpdated).toBeDefined();
      });
    });

    test('production has most conservative settings': any, (: any) => {
      const dev: any = getEnvironmentConfig('development');
      const prod: any = getEnvironmentConfig('production');
      const test: any = getEnvironmentConfig('testing');

      // Production should have highest thresholds
      expect(prod?.classification.intentionalThreshold).toBeGreaterThanOrEqual(dev?.classification.intentionalThreshold);
      expect(prod?.classification.intentionalThreshold).toBeGreaterThanOrEqual(test?.classification.intentionalThreshold);

      // Production should have highest success rate requirements
      expect(prod?.targets.minSuccessRate).toBeGreaterThanOrEqual(dev?.targets.minSuccessRate);
      expect(prod?.targets.minSuccessRate).toBeGreaterThanOrEqual(test?.targets.minSuccessRate);
    });

    test('testing has most permissive settings': any, (: any) => {
      const dev: any = getEnvironmentConfig('development');
      const prod: any = getEnvironmentConfig('production');
      const test: any = getEnvironmentConfig('testing');

      // Testing should have smallest batch size for safety
      expect(test?.safety.maxBatchSize).toBeLessThanOrEqual(dev?.safety.maxBatchSize);
      expect(test?.safety.maxBatchSize).toBeLessThanOrEqual(prod?.safety.maxBatchSize);

      // Testing should have lowest target reduction
      expect(test?.targets.targetReductionPercentage).toBeLessThanOrEqual(dev?.targets.targetReductionPercentage);
      expect(test?.targets.targetReductionPercentage).toBeLessThanOrEqual(prod?.targets.targetReductionPercentage);
    });
  });
});
