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

describe('Environment Configuration Loader', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('Environment Detection', () => {
    test('detects development environment by default', () => {
      delete process.env.NODE_ENV;
      expect(getCurrentEnvironment()).toBe('development');
    });

    test('detects production environment', () => {
      process.env.NODE_ENV = 'production';
      expect(getCurrentEnvironment()).toBe('production');
    });

    test('detects production environment with "prod"', () => {
      process.env.NODE_ENV = 'prod';
      expect(getCurrentEnvironment()).toBe('production');
    });

    test('detects testing environment', () => {
      process.env.NODE_ENV = 'test';
      expect(getCurrentEnvironment()).toBe('testing');
    });

    test('detects testing environment with "testing"', () => {
      process.env.NODE_ENV = 'testing';
      expect(getCurrentEnvironment()).toBe('testing');
    });

    test('defaults to development for unknown environments', () => {
      process.env.NODE_ENV = 'staging';
      expect(getCurrentEnvironment()).toBe('development');
    });
  });

  describe('Environment Configuration Loading', () => {
    test('loads development configuration', () => {
      const config = loadEnvironmentConfig('development');

      expect(config).toBeDefined();
      expect(config.classification?.intentionalThreshold).toBe(0.7);
      expect(config.safety?.maxBatchSize).toBe(10);
    });

    test('loads production configuration', () => {
      const config = loadEnvironmentConfig('production');

      expect(config).toBeDefined();
      expect(config.classification?.intentionalThreshold).toBe(0.85);
      expect(config.safety?.maxBatchSize).toBe(15);
      expect(config.safety?.safetyLevels?.replacement).toBe('MAXIMUM');
    });

    test('loads testing configuration', () => {
      const config = loadEnvironmentConfig('testing');

      expect(config).toBeDefined();
      expect(config.classification?.intentionalThreshold).toBe(0.6);
      expect(config.safety?.maxBatchSize).toBe(5);
      expect(config.targets?.targetReductionPercentage).toBe(5);
    });

    test('returns empty object for non-existent environment', () => {
      const config = loadEnvironmentConfig('nonexistent' as any);
      expect(config).toEqual({});
    });
  });

  describe('Environment Configuration Merging', () => {
    test('merges development config with defaults', () => {
      const config = getEnvironmentConfig('development');

      // Should have development overrides
      expect(config.classification.intentionalThreshold).toBe(0.7);
      expect(config.safety.maxBatchSize).toBe(10);

      // Should preserve defaults for non-overridden values
      expect(config.classification.intentionalKeywords).toEqual(DEFAULT_CONFIG.classification.intentionalKeywords);
      expect(config.domain.typeSuggestions).toEqual(DEFAULT_CONFIG.domain.typeSuggestions);
    });

    test('merges production config with defaults', () => {
      const config = getEnvironmentConfig('production');

      // Should have production overrides
      expect(config.classification.intentionalThreshold).toBe(0.85);
      expect(config.safety.maxBatchSize).toBe(15);
      expect(config.targets.targetReductionPercentage).toBe(20);

      // Should preserve defaults for non-overridden values
      expect(config.classification.testFilePatterns).toEqual(DEFAULT_CONFIG.classification.testFilePatterns);
    });

    test('handles nested object merging correctly', () => {
      const config = getEnvironmentConfig('production');

      // Safety levels should be merged, not replaced
      expect(config.safety.safetyLevels.replacement).toBe('MAXIMUM');
      expect(config.safety.safetyLevels.classification).toBe('HIGH');
      expect(config.safety.safetyLevels.documentation).toBe('HIGH');
      expect(config.safety.safetyLevels.batch_processing).toBe('MAXIMUM');
    });
  });

  describe('Environment Configuration Validation', () => {
    test('validates development configuration', () => {
      const validation = validateEnvironmentConfig('development');

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.warnings.length).toBeGreaterThanOrEqual(0);
    });

    test('validates production configuration', () => {
      const validation = validateEnvironmentConfig('production');

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('validates testing configuration', () => {
      const validation = validateEnvironmentConfig('testing');

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('provides environment-specific warnings', () => {
      const devValidation = validateEnvironmentConfig('development');
      const prodValidation = validateEnvironmentConfig('production');

      // Development might have warnings about batch size
      // Production should have fewer warnings due to conservative settings
      expect(Array.isArray(devValidation.warnings)).toBe(true);
      expect(Array.isArray(prodValidation.warnings)).toBe(true);
    });
  });

  describe('Configuration Manager Creation', () => {
    test('creates environment-specific configuration manager', () => {
      const manager = createEnvironmentConfigManager('production');
      const config = manager.getConfig();

      // Should have production-specific settings
      expect(config.classification.intentionalThreshold).toBe(0.85);
      expect(config.safety.maxBatchSize).toBe(15);
    });

    test('creates manager for current environment', () => {
      process.env.NODE_ENV = 'testing';
      const manager = createEnvironmentConfigManager();
      const config = manager.getConfig();

      // Should have testing-specific settings
      expect(config.classification.intentionalThreshold).toBe(0.6);
      expect(config.safety.maxBatchSize).toBe(5);
    });

    test('handles custom config path', () => {
      const customPath = '/tmp/custom-config.json';
      const manager = createEnvironmentConfigManager('development', customPath);

      expect(manager).toBeDefined();
      // Note: We can't easily test the path without file system operations
    });
  });

  describe('Environment-Specific Business Rules', () => {
    test('production environment enforces maximum safety', () => {
      const validation = validateEnvironmentConfig('production');

      // Production should not have errors about safety levels
      const safetyErrors = validation.errors.filter(error =>
        error.includes('MAXIMUM safety level')
      );
      expect(safetyErrors).toHaveLength(0);
    });

    test('testing environment allows relaxed settings', () => {
      const config = getEnvironmentConfig('testing');

      // Testing should have relaxed thresholds
      expect(config.classification.intentionalThreshold).toBeLessThan(0.8);
      expect(config.targets.minSuccessRate).toBeLessThan(0.8);
    });

    test('development environment balances safety and speed', () => {
      const config = getEnvironmentConfig('development');

      // Development should be between testing and production
      expect(config.classification.intentionalThreshold).toBeGreaterThan(0.6);
      expect(config.classification.intentionalThreshold).toBeLessThan(0.85);
      expect(config.safety.maxBatchSize).toBeGreaterThan(5);
      expect(config.safety.maxBatchSize).toBeLessThan(25);
    });
  });

  describe('Configuration Consistency', () => {
    test('all environments have valid configurations', () => {
      const environments = ['development', 'production', 'testing'] as const;

      environments.forEach(env => {
        const validation = validateEnvironmentConfig(env);
        expect(validation.isValid).toBe(true);
      });
    });

    test('all environments maintain required properties', () => {
      const environments = ['development', 'production', 'testing'] as const;

      environments.forEach(env => {
        const config = getEnvironmentConfig(env);

        expect(config.classification).toBeDefined();
        expect(config.domain).toBeDefined();
        expect(config.safety).toBeDefined();
        expect(config.targets).toBeDefined();
        expect(config.version).toBeDefined();
        expect(config.lastUpdated).toBeDefined();
      });
    });

    test('production has most conservative settings', () => {
      const dev = getEnvironmentConfig('development');
      const prod = getEnvironmentConfig('production');
      const test = getEnvironmentConfig('testing');

      // Production should have highest thresholds
      expect(prod.classification.intentionalThreshold).toBeGreaterThanOrEqual(dev.classification.intentionalThreshold);
      expect(prod.classification.intentionalThreshold).toBeGreaterThanOrEqual(test.classification.intentionalThreshold);

      // Production should have highest success rate requirements
      expect(prod.targets.minSuccessRate).toBeGreaterThanOrEqual(dev.targets.minSuccessRate);
      expect(prod.targets.minSuccessRate).toBeGreaterThanOrEqual(test.targets.minSuccessRate);
    });

    test('testing has most permissive settings', () => {
      const dev = getEnvironmentConfig('development');
      const prod = getEnvironmentConfig('production');
      const test = getEnvironmentConfig('testing');

      // Testing should have smallest batch size for safety
      expect(test.safety.maxBatchSize).toBeLessThanOrEqual(dev.safety.maxBatchSize);
      expect(test.safety.maxBatchSize).toBeLessThanOrEqual(prod.safety.maxBatchSize);

      // Testing should have lowest target reduction
      expect(test.targets.targetReductionPercentage).toBeLessThanOrEqual(dev.targets.targetReductionPercentage);
      expect(test.targets.targetReductionPercentage).toBeLessThanOrEqual(prod.targets.targetReductionPercentage);
    });
  });
});
