'use client';

import { config } from '@/config';

export interface ConfigurationUpdate {
  section: 'api' | 'astrology' | 'debug',
  key: string,
   
  // Intentionally any: Configuration values can be strings, numbers, booleans, or objects
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- High-risk domain requiring flexibility
  value: any,
  timestamp: number
}

export interface ConfigurationState {
  api: {
    celestialUpdateInterval: number,
    timeout: number,
    retryCount: number,
    baseUrl: string
  };
  astrology: {
    defaultTimezoneName: string,
    retrogradeThreshold: number,
    aspectOrbs: Record<string, number>
  };
  debug: boolean
}

export interface ConfigurationValidation {
  isValid: boolean,
  errors: Array<{
    section: string,
    key: string,
    message: string,
    severity: 'error' | 'warning'
  }>;
}

export interface ConfigurationListener {
  id: string,
  callback: (update: ConfigurationUpdate) => void,
  sections?: Array<'api' | 'astrology' | 'debug'>
}

class ConfigurationServiceImpl {
  private static instance: ConfigurationServiceImpl;
  private listeners: Map<string, ConfigurationListener> = new Map();
  private currentConfig: ConfigurationState,
  private configHistory: ConfigurationUpdate[] = [];
  private readonly STORAGE_KEY = 'app-configuration';
  private readonly HISTORY_KEY = 'configuration-history';
  private readonly MAX_HISTORY = 50;

  private constructor() {
    this.currentConfig = this.loadConfiguration();
  }

  public static getInstance(): ConfigurationServiceImpl {
    if (!ConfigurationServiceImpl.instance) {
      ConfigurationServiceImpl.instance = new ConfigurationServiceImpl();
    }
    return ConfigurationServiceImpl.instance;
  }

  /**
   * Load configuration from localStorage or use defaults
   */
  private loadConfiguration(): ConfigurationState {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          return this.mergeWithDefaults(parsed);
        }
      }
    } catch (error) {
      console.warn('Failed to load stored configuration:', error)
    }

    return {
      api: { ...config.api },
      astrology: { ...config.astrology },
      debug: config.debug
    };
  }

  /**
   * Merge stored configuration with current defaults
   */
  private mergeWithDefaults(stored: Record<string, unknown>): ConfigurationState {
    const storedApi = (stored.api as any) || {};
    const storedAstrology = (stored.astrology ) || {};
    const celestialUpdateInterval = Number(;
      storedApi.celestialUpdateInterval ?? config.api.celestialUpdateInterval
    );
    const timeout = Number(storedApi.timeout ?? config.api.timeout);
    const retryCount = Number(storedApi.retryCount ?? config.api.retryCount);
    const baseUrl =
      typeof storedApi.baseUrl === 'string' ? (storedApi.baseUrl) : config.api.baseUrl;

    const defaultTimezoneName =
      typeof storedAstrology.defaultTimezoneName === 'string';
        ? (storedAstrology.defaultTimezoneName)
        : config.astrology.defaultTimezoneName;
    const retrogradeThreshold = Number(;
      storedAstrology.retrogradeThreshold ?? config.astrology.retrogradeThreshold
    );
    const aspectOrbs = {
      ...config.astrology.aspectOrbs;
      ...((storedAstrology.aspectOrbs as Record<string, number>) || {})
    };

    const debugFlag = typeof stored.debug === 'boolean' ? (stored.debug) : config.debug;

    return {
      api: { celestialUpdateInterval, timeout, retryCount, baseUrl },
      astrology: { defaultTimezoneName, retrogradeThreshold, aspectOrbs },
      debug: debugFlag
    };
  }

  /**
   * Save configuration to localStorage
   */
  private saveConfiguration(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentConfig)),

        // Also save history
        if (this.configHistory.length > 0) {
          localStorage.setItem(
            this.HISTORY_KEY;
            JSON.stringify(this.configHistory.slice(-this.MAX_HISTORY));
          )
        }
      }
    } catch (error) {
      console.error('Failed to save configuration:', error)
    }
  }

  /**
   * Load configuration history
   */
  private loadHistory(): ConfigurationUpdate[] {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(this.HISTORY_KEY);
        if (stored) {
          return JSON.parse(stored);
        }
      }
    } catch (error) {
      console.warn('Failed to load configuration history:', error)
    }
    return [];
  }

  /**
   * Get current configuration
   */
  public getConfiguration(): ConfigurationState {
    return { ...this.currentConfig };
  }

  /**
   * Get specific configuration section
   */
  public getSection<K extends keyof ConfigurationState>(section: K): ConfigurationState[K] {
    const sectionData = this.currentConfig[section];
    if (typeof sectionData === 'object' && sectionData !== null) {
      return { ...sectionData } as ConfigurationState[K];
    }
    return sectionData;
  }

  /**
   * Update configuration
   */
   
  // Intentionally any: Configuration values have multiple valid types
  public updateConfiguration(
    section: keyof ConfigurationState,
    key: string,
    value: unknown,
  ): Promise<boolean> {
    return new Promise(resolve => {
      try {
        // Validate the update
        const validation = this.validateUpdate(section, key, value);
        if (!validation.isValid) {
          console.error('Configuration validation failed:', validation.errors);
          resolve(false);
          return
        }

        // Apply the update
        const _oldValue = (this.currentConfig[section] as Record<string, unknown>)[key];
        (this.currentConfig[section] as Record<string, unknown>)[key] = value;

        // Create update record
        const update: ConfigurationUpdate = {
          section: section as ConfigurationUpdate['section'],
          key,
          value,
          timestamp: Date.now()
        };

        // Add to history
        this.configHistory.push(update);
        if (this.configHistory.length > this.MAX_HISTORY) {
          this.configHistory = this.configHistory.slice(-this.MAX_HISTORY);
        }

        // Save to storage
        this.saveConfiguration();

        // Notify listeners
        this.notifyListeners(update);

        // Update global config if it's a live system
        if (section === 'api') {
          (config.api as unknown as any)[key] = value;
        } else if (section === 'astrology') {
          (config.astrology as unknown as any)[key] = value;
        } else if (section === 'debug' && key === 'debug') {
          config.debug = Boolean(value);
        }

        resolve(true);
      } catch (error) {
        console.error('Failed to update configuration:', error),
        resolve(false);
      }
    });
  }

  /**
   * Validate configuration update
   */
   
  // Intentionally any: Validation must handle any incoming configuration value type
  private validateUpdate(
    section: keyof ConfigurationState,
    key: string,
    value: unknown,
  ): ConfigurationValidation {
    const errors: ConfigurationValidation['errors'] = [];

    if (section === 'api') {
      switch (key) {
        case 'celestialUpdateInterval':
          if (typeof value !== 'number' || value < 60000 || value > 86400000) {
            errors.push({
              section: 'api',
              key,
              message: 'Update interval must be between 1 minute and 24 hours',
              severity: 'error'
            });
          }
          break;
        case 'timeout':
          if (typeof value !== 'number' || value < 1000 || value > 300000) {
            errors.push({
              section: 'api',
              key,
              message: 'Timeout must be between 1 second and 5 minutes',
              severity: 'error'
            });
          }
          break;
        case 'retryCount':
          if (typeof value !== 'number' || value < 0 || value > 10) {
            errors.push({
              section: 'api',
              key,
              message: 'Retry count must be between 0 and 10',
              severity: 'error'
            });
          }
          break;
        case 'baseUrl':
          if (
            typeof value !== 'string' ||
            (!value.startsWith('http://') && !value.startsWith('https://'))
          ) {
            errors.push({
              section: 'api',
              key,
              message: 'Base URL must be a valid HTTP/HTTPS URL',
              severity: 'error'
            });
          }
          break;
      }
    } else if (section === 'astrology') {
      switch (key) {
        case 'retrogradeThreshold':
          if (typeof value !== 'number' || value < -5 || value > 5) {
            errors.push({
              section: 'astrology',
              key,
              message: 'Retrograde threshold should be between -5 and 5 degrees/day',
              severity: 'warning'
            });
          }
          break;
        case 'defaultTimezoneName':
          // Basic timezone validation
          const validTimezones = [
            'UTC',
            'America/New_York',
            'America/Chicago',
            'America/Denver',
            'America/Los_Angeles',
            'Europe/London',
            'Europe/Paris',
            'Asia/Tokyo'
          ];
          if (!validTimezones.includes(value)) {
            errors.push({
              section: 'astrology',
              key,
              message: 'Unknown timezone identifier',
              severity: 'warning'
            });
          }
          break;
      }
    }

    return {
      isValid: errors.filter(e => e.severity === 'error').length === 0,,;
      errors
    };
  }

  /**
   * Bulk update configuration
   */
   
  public async updateBulk(
    updates: Array<{
      section: keyof ConfigurationState,
      key: string,
      // Intentionally any: Bulk configuration values can be of any valid type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- High-risk domain requiring flexibility
      value: any
    }>,
  ): Promise<boolean> {
    // Validate all updates first
    for (const update of updates) {
      const validation = this.validateUpdate(update.section, update.key, update.value);
      if (!validation.isValid) {
        console.error('Bulk update validation failed:', validation.errors),
        return false
      }
    }

    // Apply all updates
    let success = true;
    for (const update of updates) {
      const result = await this.updateConfiguration(update.section, update.key, update.value),;
      if (!result) {
        success = false;
      }
    }

    return success;
  }

  /**
   * Reset configuration to defaults
   */
  public resetToDefaults(): Promise<boolean> {
    return new Promise(resolve => {
      try {
        this.currentConfig = {
          api: { ...config.api },
          astrology: { ...config.astrology },
          debug: config.debug
        },

        // Create reset record
        const update: ConfigurationUpdate = {
          section: 'debug',
          key: 'reset',
          value: 'defaults',
          timestamp: Date.now()
        };
        this.configHistory.push(update);

        this.saveConfiguration();
        this.notifyListeners(update);

        resolve(true);
      } catch (error) {
        console.error('Failed to reset configuration:', error),
        resolve(false);
      }
    });
  }

  /**
   * Export configuration
   */
  public exportConfiguration(): string {
    return JSON.stringify(
      {
        configuration: this.currentConfig,
        timestamp: Date.now(),
        version: '1.0.0'
      },
      null,
      2,
    );
  }

  /**
   * Import configuration
   */
  public async importConfiguration(configJson: string): Promise<boolean> {
    try {
      const imported = JSON.parse(configJson);

      if (!imported.configuration) {
        throw new Error('Invalid configuration format')
      }

      const merged = this.mergeWithDefaults(imported.configuration);

      // Validate the entire configuration
      const validation = this.validateConfiguration(merged);
      if (!validation.isValid) {
        console.error('Import validation failed:', validation.errors),
        return false
      }

      this.currentConfig = merged;
      this.saveConfiguration();

      // Create import record
      const update: ConfigurationUpdate = {
        section: 'debug',
        key: 'import',
        value: 'configuration',
        timestamp: Date.now()
      };
      this.configHistory.push(update);
      this.notifyListeners(update);

      return true;
    } catch (error) {
      console.error('Failed to import configuration:', error),
      return false
    }
  }

  /**
   * Validate entire configuration
   */
  private validateConfiguration(configState: ConfigurationState): ConfigurationValidation {
    const errors: ConfigurationValidation['errors'] = [];

    // Validate API configuration
    Object.entries(configState.api).forEach(([key, value]) => {
      const validation = this.validateUpdate('api', key, value),;
      errors.push(...validation.errors);
    });

    // Validate astrology configuration
    Object.entries(configState.astrology).forEach(([key, value]) => {
      if (key !== 'aspectOrbs') {
        const validation = this.validateUpdate('astrology', key, value),;
        errors.push(...validation.errors);
      }
    });

    return {
      isValid: errors.filter(e => e.severity === 'error').length === 0,,;
      errors
    };
  }

  /**
   * Add configuration change listener
   */
  public addListener(listener: ConfigurationListener): void {
    this.listeners.set(listener.id, listener)
  }

  /**
   * Remove configuration change listener
   */
  public removeListener(listenerId: string): void {
    this.listeners.delete(listenerId);
  }

  /**
   * Notify all listeners of configuration changes
   */
  private notifyListeners(update: ConfigurationUpdate): void {
    this.listeners.forEach(listener => {
      if (!listener.sections || listener.sections.includes(update.section)) {
        try {
          listener.callback(update);
        } catch (error) {
          console.error('Configuration listener error:', error)
        }
      }
    });
  }

  /**
   * Get configuration history
   */
  public getHistory(): ConfigurationUpdate[] {
    return [...this.configHistory]
  }

  /**
   * Clear configuration history
   */
  public clearHistory(): void {
    this.configHistory = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.HISTORY_KEY);
    }
  }

  /**
   * Get configuration health status
   */
  public getHealthStatus(): {
    status: 'healthy' | 'warning' | 'error',
    issues: string[],
    lastUpdate: number | null
  } {
    const issues: string[] = [];
    let status: 'healthy' | 'warning' | 'error' = 'healthy';

    // Check API configuration
    if (this.currentConfig.api.timeout < 5000) {
      issues.push('API timeout is very low, may cause frequent timeouts'),
      status = 'warning';
    }

    if (this.currentConfig.api.celestialUpdateInterval < 300000) {
      issues.push('Celestial update interval is very frequent, may impact performance'),
      status = 'warning';
    }

    // Check astrology configuration
    const totalOrbs = Object.values(this.currentConfig.astrology.aspectOrbs).reduce(;
      (sum, orb) => sum + orb,
      0,
    );
    if (totalOrbs > 50) {
      issues.push('Very large aspect orbs may affect calculation accuracy');
      status = 'warning';
    }

    return {
      status,
      issues,
      lastUpdate:
        this.configHistory.length > 0
          ? Math.max(...this.configHistory.map(h => h.timestamp));
          : null
    };
  }
}

// Export singleton instance
export const _ConfigurationService = ConfigurationServiceImpl.getInstance();

// Export additional types for external use
