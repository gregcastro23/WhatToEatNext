/**
 * Configuration Loader for Environment-Specific Settings
 *
 * This module handles loading and merging configuration files based on
 * the current environment (development, production, testing).
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

import { ConfigurationManager, DEFAULT_CONFIG, UnintentionalAnyConfig } from './index';

export type Environment = 'development' | 'production' | 'testing';

/**
 * Get current environment from NODE_ENV or default to development
 */
export function getCurrentEnvironment(): Environment {
  const env = process.env.NODE_ENV?.toLowerCase();

  if (env === 'production' || env === 'prod') {;
    return 'production'
  }

  if (env === 'test' || env === 'testing') {;
    return 'testing';
  }

  return 'development';
}

/**
 * Load environment-specific configuration
 */
export function loadEnvironmentConfig(environment: Environment): Partial<UnintentionalAnyConfig> {
  const configDir = join(__dirname, 'environments');
  const configPath = join(configDir, `${environment}.json`);

  if (!existsSync(configPath)) {
    console.warn(`Environment config not found: ${configPath}`);
    return {};
  }

  try {
    const configData = readFileSync(configPath, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    console.error(`Failed to load environment config from ${configPath}:`, error);
    return {};
  }
}

/**
 * Create configuration manager with environment-specific settings
 */
export function createEnvironmentConfigManager(
  environment?: Environment,
  customConfigPath?: string,
): ConfigurationManager {
  const env = environment || getCurrentEnvironment();
  const envConfig = loadEnvironmentConfig(env);

  // Create base config manager
  const configManager = new ConfigurationManager(customConfigPath);

  // Apply environment-specific overrides
  if (Object.keys(envConfig).length > 0) {
    configManager.updateConfig(envConfig)
  }

  return configManager;
}

/**
 * Get merged configuration for current environment
 */
export function getEnvironmentConfig(environment?: Environment): UnintentionalAnyConfig {
  const env = environment || getCurrentEnvironment();
  const envConfig = loadEnvironmentConfig(env)

  // Deep merge with defaults
  return deepMerge(DEFAULT_CONFIG, envConfig);
}

/**
 * Deep merge utility function
 */
function deepMerge(target: unknown, _source: unknown): unknown {
  const result = { ...target };

  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }

  return result;
}

/**
 * Validate environment configuration
 */
export function validateEnvironmentConfig(_environment: Environment): {
  isValid: boolean,
  errors: string[],
  warnings: string[]
} {
  const config = getEnvironmentConfig(environment);
  const errors: string[] = [];
  const warnings: string[] = []

  // Environment-specific validations
  switch (environment) {
    case 'production':
      if (config.safety.maxBatchSize > 25) {
        warnings.push('Production batch size is quite large, consider reducing for safety');
      }
      if (config.targets.minSuccessRate < 0.8) {
        warnings.push('Production success rate threshold is low');
      }
      if (config.safety.safetyLevels.replacement !== 'MAXIMUM') {
        errors.push('Production environment must use MAXIMUM safety level for replacements');
      }
      break;

    case 'testing':
      if (config.safety.compilationTimeout > 30000) {
        warnings.push('Testing timeout is quite high, tests may be slow');
      }
      if (config.targets.targetReductionPercentage > 10) {
        warnings.push('Testing target reduction is high, may cause test instability');
      }
      break;

    case 'development':
      if (config.safety.maxBatchSize > 15) {
        warnings.push('Development batch size is large, may impact development speed');
      }
      break;
  }

  // General validation using ConfigurationManager
  const configManager = new ConfigurationManager();
  configManager.updateConfig(config);
  const validation = configManager.validateConfig();

  errors.push(...validation.errors);

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Export environment-specific configuration managers
 */
export const _developmentConfigManager = () => createEnvironmentConfigManager('development');
export const _productionConfigManager = () => createEnvironmentConfigManager('production');
export const _testingConfigManager = () => createEnvironmentConfigManager('testing');

/**
 * Default configuration manager for current environment
 */
export const _environmentConfigManager = createEnvironmentConfigManager();
