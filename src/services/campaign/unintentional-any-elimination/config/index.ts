/**
 * Configuration Management System for Unintentional Any Elimination
 *
 * This module provides centralized configuration management for:
 * - Classification rules and thresholds
 * - Domain-specific configuration options
 * - Safety protocol configuration
 * - Target setting and progress tracking configuration
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { AnyTypeCategory, Element, SafetyLevel } from '../types';

export interface ClassificationConfig {
  /** Confidence threshold for intentional classification (0-1) */
  intentionalThreshold: number;
  /** Confidence threshold for unintentional classification (0-1) */
  unintentionalThreshold: number;
  /** Minimum comment length to consider as documentation */
  minCommentLength: number;
  /** Keywords that indicate intentional any usage */
  intentionalKeywords: string[];
  /** File patterns to treat as test files */
  testFilePatterns: string[];
  /** Categories with their default confidence scores */
  categoryDefaults: Record<AnyTypeCategory, number>;
}

export interface DomainConfig {
  /** Domain-specific type suggestions */
  typeSuggestions: Record<string, string[]>;
  /** File path patterns for domain detection */
  pathPatterns: Record<string, string[]>;
  /** Content patterns for domain detection */
  contentPatterns: Record<string, string[]>;
  /** Elemental associations for domains */
  elementalAssociations: Record<string, Element[]>;
}

export interface SafetyConfig {
  /** Maximum files to process in a single batch */
  maxBatchSize: number;
  /** Validation frequency (files processed between checks) */
  validationFrequency: number;
  /** TypeScript compilation timeout in milliseconds */
  compilationTimeout: number;
  /** Maximum rollback attempts before stopping */
  maxRollbackAttempts: number;
  /** Safety level for different operations */
  safetyLevels: Record<string, SafetyLevel>;
  /** Backup retention period in days */
  backupRetentionDays: number;
}

export interface TargetConfig {
  /** Target reduction percentage (0-100) */
  targetReductionPercentage: number;
  /** Minimum success rate to continue (0-1) */
  minSuccessRate: number;
  /** Maximum error increase tolerance */
  maxErrorIncrease: number;
  /** Progress tracking intervals */
  trackingIntervals: {
    metrics: number; // minutes
    reports: number; // hours
    checkpoints: number; // files processed
  };
  /** Realistic milestone targets */
  milestones: Array<{
    name: string;
    targetReduction: number;
    timeframe: string;
  }>;
}

export interface UnintentionalAnyConfig {
  classification: ClassificationConfig;
  domain: DomainConfig;
  safety: SafetyConfig;
  targets: TargetConfig;
  /** Configuration version for compatibility */
  version: string;
  /** Last updated timestamp */
  lastUpdated: string;
}

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: UnintentionalAnyConfig = {
  classification: {
    intentionalThreshold: 0.8,
    unintentionalThreshold: 0.7,
    minCommentLength: 10,
    intentionalKeywords: [
      'intentionally any',
      'external api',
      'dynamic',
      'flexible',
      'legacy',
      'third-party',
      'mock',
      'test',
      'compatibility'
    ],
    testFilePatterns: [
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/test/**',
      '**/tests/**',
      '**/__tests__/**'
    ],
    categoryDefaults: {
      [AnyTypeCategory.ERROR_HANDLING]: 0.9,
      [AnyTypeCategory.EXTERNAL_API]: 0.8,
      [AnyTypeCategory.TEST_MOCK]: 0.8,
      [AnyTypeCategory.DYNAMIC_CONFIG]: 0.7,
      [AnyTypeCategory.LEGACY_COMPATIBILITY]: 0.8,
      [AnyTypeCategory.ARRAY_TYPE]: 0.3,
      [AnyTypeCategory.RECORD_TYPE]: 0.4,
      [AnyTypeCategory.FUNCTION_PARAM]: 0.5,
      [AnyTypeCategory.RETURN_TYPE]: 0.4,
      [AnyTypeCategory.TYPE_ASSERTION]: 0.6
    }
  },
  domain: {
    typeSuggestions: {
      astrological: ['PlanetaryPosition', 'ElementalProperties', 'AstrologicalData'],
      recipe: ['Ingredient', 'Recipe', 'NutritionalInfo', 'CookingMethod'],
      campaign: ['CampaignConfig', 'MetricsData', 'ProgressReport'],
      service: ['ApiResponse', 'ServiceConfig', 'ErrorResponse'],
      component: ['ComponentProps', 'ComponentState', 'EventHandler'],
      utility: ['UtilityFunction', 'HelperType', 'GenericType']
    },
    pathPatterns: {
      astrological: ['**/calculations/**', '**/astrology/**', '**/planetary/**'],
      recipe: ['**/recipe/**', '**/ingredient/**', '**/cooking/**'],
      campaign: ['**/campaign/**', '**/metrics/**', '**/progress/**'],
      service: ['**/services/**', '**/api/**', '**/client/**'],
      component: ['**/components/**', '**/ui/**', '**/pages/**'],
      utility: ['**/utils/**', '**/helpers/**', '**/lib/**']
    },
    contentPatterns: {
      astrological: ['planetary', 'elemental', 'zodiac', 'transit', 'retrograde'],
      recipe: ['ingredient', 'recipe', 'cooking', 'nutrition', 'flavor'],
      campaign: ['campaign', 'metrics', 'progress', 'tracking', 'analysis'],
      service: ['service', 'api', 'client', 'request', 'response'],
      component: ['component', 'props', 'state', 'render', 'jsx'],
      utility: ['util', 'helper', 'function', 'type', 'generic']
    },
    elementalAssociations: {
      astrological: ['Fire', 'Water', 'Earth', 'Air'],
      recipe: ['Fire', 'Water', 'Earth', 'Air'],
      campaign: ['Earth', 'Air'],
      service: ['Water', 'Air'],
      component: ['Air', 'Fire'],
      utility: ['Air', 'Earth']
    }
  },
  safety: {
    maxBatchSize: 25,
    validationFrequency: 5,
    compilationTimeout: 30000,
    maxRollbackAttempts: 3,
    safetyLevels: {
      classification: 'HIGH',
      replacement: 'MAXIMUM',
      documentation: 'MEDIUM',
      batch_processing: 'MAXIMUM'
    },
    backupRetentionDays: 7
  },
  targets: {
    targetReductionPercentage: 18,
    minSuccessRate: 0.8,
    maxErrorIncrease: 5,
    trackingIntervals: {
      metrics: 5,
      reports: 1,
      checkpoints: 10
    },
    milestones: [
      { name: 'Initial Analysis', targetReduction: 0, timeframe: '1 day' },
      { name: 'Conservative Phase', targetReduction: 5, timeframe: '3 days' },
      { name: 'Progressive Phase', targetReduction: 12, timeframe: '1 week' },
      { name: 'Target Achievement', targetReduction: 18, timeframe: '2 weeks' }
    ]
  },
  version: '1.0.0',
  lastUpdated: new Date().toISOString()
};

/**
 * Configuration Manager class
 */
export class ConfigurationManager {
  private config: UnintentionalAnyConfig;
  private configPath: string;

  constructor(configPath?: string) {
    this.configPath = configPath || join(process.cwd(), '.kiro', 'campaign-configs', 'unintentional-any-elimination.json');
    this.config = this.loadConfig();
  }

  /**
   * Load configuration from file or use defaults
   */
  private loadConfig(): UnintentionalAnyConfig {
    if (existsSync(this.configPath)) {
      try {
        const configData = readFileSync(this.configPath, 'utf8');
        const loadedConfig = JSON.parse(configData);

        // Merge with defaults to ensure all properties exist
        return this.mergeWithDefaults(loadedConfig);
      } catch (error) {
        console.warn(`Failed to load config from ${this.configPath}, using defaults:`, error);
        return DEFAULT_CONFIG;
      }
    }

    return DEFAULT_CONFIG;
  }

  /**
   * Merge loaded config with defaults to ensure completeness
   */
  private mergeWithDefaults(loadedConfig: Partial<UnintentionalAnyConfig>): UnintentionalAnyConfig {
    return {
      classification: { ...DEFAULT_CONFIG.classification, ...loadedConfig.classification },
      domain: { ...DEFAULT_CONFIG.domain, ...loadedConfig.domain },
      safety: { ...DEFAULT_CONFIG.safety, ...loadedConfig.safety },
      targets: { ...DEFAULT_CONFIG.targets, ...loadedConfig.targets },
      version: loadedConfig.version || DEFAULT_CONFIG.version,
      lastUpdated: loadedConfig.lastUpdated || DEFAULT_CONFIG.lastUpdated
    };
  }

  /**
   * Save current configuration to file
   */
  saveConfig(): void {
    try {
      const configDir = join(this.configPath, '..');
      if (!existsSync(configDir)) {
        mkdirSync(configDir, { recursive: true });
      }

      this.config.lastUpdated = new Date().toISOString();
      writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      throw new Error(`Failed to save config to ${this.configPath}: ${error}`);
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): UnintentionalAnyConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<UnintentionalAnyConfig>): void {
    this.config = this.mergeWithDefaults({ ...this.config, ...updates });
    this.saveConfig();
  }

  /**
   * Get classification configuration
   */
  getClassificationConfig(): ClassificationConfig {
    return { ...this.config.classification };
  }

  /**
   * Update classification configuration
   */
  updateClassificationConfig(updates: Partial<ClassificationConfig>): void {
    this.config.classification = { ...this.config.classification, ...updates };
    this.saveConfig();
  }

  /**
   * Get domain configuration
   */
  getDomainConfig(): DomainConfig {
    return { ...this.config.domain };
  }

  /**
   * Update domain configuration
   */
  updateDomainConfig(updates: Partial<DomainConfig>): void {
    this.config.domain = { ...this.config.domain, ...updates };
    this.saveConfig();
  }

  /**
   * Get safety configuration
   */
  getSafetyConfig(): SafetyConfig {
    return { ...this.config.safety };
  }

  /**
   * Update safety configuration
   */
  updateSafetyConfig(updates: Partial<SafetyConfig>): void {
    this.config.safety = { ...this.config.safety, ...updates };
    this.saveConfig();
  }

  /**
   * Get target configuration
   */
  getTargetConfig(): TargetConfig {
    return { ...this.config.targets };
  }

  /**
   * Update target configuration
   */
  updateTargetConfig(updates: Partial<TargetConfig>): void {
    this.config.targets = { ...this.config.targets, ...updates };
    this.saveConfig();
  }

  /**
   * Reset configuration to defaults
   */
  resetToDefaults(): void {
    this.config = { ...DEFAULT_CONFIG };
    this.saveConfig();
  }

  /**
   * Validate configuration
   */
  validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate classification config
    const { classification } = this.config;
    if (classification.intentionalThreshold < 0 || classification.intentionalThreshold > 1) {
      errors.push('intentionalThreshold must be between 0 and 1');
    }
    if (classification.unintentionalThreshold < 0 || classification.unintentionalThreshold > 1) {
      errors.push('unintentionalThreshold must be between 0 and 1');
    }
    if (classification.minCommentLength < 0) {
      errors.push('minCommentLength must be non-negative');
    }

    // Validate safety config
    const { safety } = this.config;
    if (safety.maxBatchSize <= 0) {
      errors.push('maxBatchSize must be positive');
    }
    if (safety.validationFrequency <= 0) {
      errors.push('validationFrequency must be positive');
    }
    if (safety.compilationTimeout <= 0) {
      errors.push('compilationTimeout must be positive');
    }

    // Validate target config
    const { targets } = this.config;
    if (targets.targetReductionPercentage < 0 || targets.targetReductionPercentage > 100) {
      errors.push('targetReductionPercentage must be between 0 and 100');
    }
    if (targets.minSuccessRate < 0 || targets.minSuccessRate > 1) {
      errors.push('minSuccessRate must be between 0 and 1');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * Global configuration manager instance
 */
export const configManager = new ConfigurationManager();

/**
 * Convenience functions for accessing configuration
 */
export const getClassificationConfig = () => configManager.getClassificationConfig();
export const getDomainConfig = () => configManager.getDomainConfig();
export const getSafetyConfig = () => configManager.getSafetyConfig();
export const getTargetConfig = () => configManager.getTargetConfig();
