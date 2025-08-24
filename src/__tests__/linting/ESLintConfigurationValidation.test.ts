/**
 * Comprehensive ESLint Configuration Validation Tests
 *
 * Tests the ESLint configuration structure, rule definitions,
 * and domain-specific configurations to ensure proper setup.
 */

import path from 'path';

import { ESLint } from 'eslint';

describe('ESLint Configuration Validation', () => {
  let eslint: ESLint;
  const configPath = path.resolve(__dirname, '../../eslint.config.cjs');

  beforeAll(async () => {
    // Load the ESLint configuration
    const config = require(configPath);
    eslint = new ESLint({
      baseConfig: config,
      useEslintrc: false,
    });
  });

  describe('Configuration Structure', () => {
    test('should load configuration without errors', () => {
      expect(() => require(configPath)).not.toThrow();
    });

    test('should have required configuration sections', () => {
      const config = require(configPath);

      expect(Array.isArray(config)).toBe(true);
      expect(config.length).toBeGreaterThan(0);

      // Check for JavaScript configuration
      const jsConfig = (config as Record<string, unknown>).find((c: unknown) => (c as Record<string, unknown>)?.files && (c as Record<string, unknown>)?.(files as Record<string, unknown>).includes('**/*.js'));
      expect(jsConfig).toBeDefined();
      expect(jsConfig.plugins).toBeDefined();
      expect(jsConfig.rules).toBeDefined();

      // Check for TypeScript configuration
      const tsConfig = (config as Record<string, unknown>).find((c: unknown) => (c as Record<string, unknown>)?.files && (c as Record<string, unknown>)?.(files as Record<string, unknown>).includes('**/*.ts'));
      expect(tsConfig).toBeDefined();
      expect(tsConfig.plugins).toBeDefined();
      expect(tsConfig.rules).toBeDefined();
    });

    test('should have domain-specific configurations', () => {
      const config = require(configPath);

      // Check for astrological calculation rules
      const astroConfig = config.find(
        (c: unknown) => (c as Record<string, unknown>)?.files && (c as Record<string, unknown>)?.(files as Record<string, unknown>).some((f: string) => (f as Record<string, unknown>).includes('**/calculations/**')),
      );
      expect(astroConfig).toBeDefined();
      expect(astroConfig.plugins).toHaveProperty('astrological');

      // Check for campaign system rules
      const campaignConfig = config.find(
        (c: unknown) => (c as Record<string, unknown>)?.files && (c as Record<string, unknown>)?.(files as Record<string, unknown>).some((f: string) => (f as Record<string, unknown>).includes('**/services/campaign/**')),
      );
      expect(campaignConfig).toBeDefined();

      // Check for test file rules
      const testConfig = (config as Record<string, unknown>).find((c: unknown) => (c as Record<string, unknown>)?.files && (c as Record<string, unknown>)?.(files as Record<string, unknown>).some((f: string) => ((f as Record<string, unknown>)?.includes('**/*.(test as Record<string, unknown>).ts')));
      expect(testConfig).toBeDefined();
    });

    test('should have proper ignore patterns', () => {
      const config = require(configPath);

      const ignoreConfig = config.find((c: unknown) => (c as Record<string, unknown>).ignores);
      expect(ignoreConfig).toBeDefined();
      expect(ignoreConfig.ignores).toContain('node_modules/');
      expect(ignoreConfig.ignores).toContain('dist/');
      expect(ignoreConfig.ignores).toContain('.next/');
      expect(ignoreConfig.ignores).toContain('.eslintcache');
    });
  });

  describe('Rule Configuration Validation', () => {
    test('should have React 19 specific rules configured', () => {
      const config = require(configPath);
      const reactConfig = (config as Record<string, unknown>).find((c: unknown) => (c as Record<string, unknown>)?.rules && (c as Record<string, (unknown>)?.rules as Record<string, unknown>)['react/react-in-jsx-scope']);

      expect(reactConfig).toBeDefined();
      expect(reactConfig.rules['react/react-in-jsx-scope']).toBe('off');
      expect(reactConfig.rules['react/jsx-uses-react']).toBe('off');
      expect(reactConfig.rules['react/jsx-key']).toBe('error');
    });

    test('should have enhanced TypeScript rules', () => {
      const config = require(configPath);
      const tsConfig = (config as Record<string, unknown>).find((c: unknown) => (c as Record<string, unknown>)?.rules && (c as Record<string, (unknown>)?.rules as Record<string, unknown>)['@typescript-eslint/no-explicit-any']);

      expect(tsConfig).toBeDefined();
      expect(tsConfig.rules['@typescript-eslint/no-explicit-any']).toBe('error');
      expect(tsConfig.rules['@typescript-eslint/no-unused-vars']).toBeDefined();
      expect(tsConfig.rules['@typescript-eslint/prefer-optional-chain']).toBe('warn');
    });

    test('should have import organization rules', () => {
      const config = require(configPath);
      const importConfig = (config as Record<string, unknown>).find((c: unknown) => (c as Record<string, unknown>)?.rules && (c as Record<string, (unknown>)?.rules as Record<string, unknown>)['import/order']);

      expect(importConfig).toBeDefined();
      expect(importConfig.rules['import/order']).toBeDefined();
      expect(importConfig.rules['import/no-duplicates']).toBe('error');
      expect(importConfig.rules['import/no-cycle']).toBe('warn');
    });

    test('should have performance optimization settings', () => {
      const config = require(configPath);
      const perfConfig = (config as Record<string, unknown>).find((c: unknown) => (c as Record<string, unknown>).settings && (c as Record<string, (unknown>).settings as Record<string, unknown>)['import/cache']);

      expect(perfConfig).toBeDefined();
      expect(perfConfig.settings['import/cache'].lifetime).toBe(600); // 10 minutes
      expect(perfConfig.settings['import/resolver'].typescript.memoryLimit).toBe(4096);
    });
  });

  describe('Plugin Integration', () => {
    test('should load all required plugins', () => {
      const config = require(configPath);

      // Check for standard plugins
      const tsConfig = (config as Record<string, unknown>).find((c: unknown) => (c as Record<string, unknown>)?.plugins && (c as Record<string, (unknown>)?.plugins as Record<string, unknown>)['@typescript-eslint']);
      expect(tsConfig).toBeDefined();

      const reactConfig = (config as Record<string, unknown>).find((c: unknown) => (c as Record<string, unknown>)?.plugins && (c as Record<string, unknown>)?.(plugins as Record<string, unknown>).react);
      expect(reactConfig).toBeDefined();

      const importConfig = (config as Record<string, unknown>).find((c: unknown) => (c as Record<string, unknown>)?.plugins && (c as Record<string, unknown>)?.(plugins as Record<string, unknown>).import);
      expect(importConfig).toBeDefined();
    });

    test('should load custom astrological plugin', () => {
      const config = require(configPath);
      const astroConfig = (config as Record<string, unknown>).find((c: unknown) => (c as Record<string, unknown>)?.plugins && (c as Record<string, unknown>)?.(plugins as Record<string, unknown>).astrological);

      expect(astroConfig).toBeDefined();
      expect(astroConfig.rules).toHaveProperty('astrological/preserve-planetary-constants');
      expect(astroConfig.rules).toHaveProperty('astrological/validate-planetary-position-structure');
    });
  });

  describe('File Pattern Matching', () => {
    test('should match TypeScript files correctly', async () => {
      const config = eslint.calculateConfigForFile('src/test.ts');
      expect(config.parser).toContain('@typescript-eslint/parser');
    });

    test('should match JavaScript files correctly', async () => {
      const config = eslint.calculateConfigForFile('src/test.js');
      expect(config.languageOptions.ecmaVersion).toBe(2022);
    });

    test('should apply astrological rules to calculation files', async () => {
      const config = eslint.calculateConfigForFile('src/calculations/test.ts');
      expect(config.rules).toHaveProperty('astrological/preserve-planetary-constants');
    });

    test('should apply test-specific rules to test files', async () => {
      const config = eslint.calculateConfigForFile('src/__tests__/test.test.ts');
      expect(config.rules['no-console']).toBe('off');
      expect(config.rules['@typescript-eslint/no-explicit-any']).toBe('off');
    });

    test('should apply campaign rules to campaign files', async () => {
      const config = eslint.calculateConfigForFile('src/services/campaign/test.ts');
      expect(config.rules['no-console']).toBe('off');
      expect(config.rules['complexity']).toEqual(['warn', 15]);
    });
  });

  describe('Path Resolution', () => {
    test('should resolve TypeScript path mappings', () => {
      const config = require(configPath);
      const tsConfig = config.find(
        (c: unknown) => (c as Record<string, unknown>).settings && (c as Record<string, (unknown>).settings as Record<string, (unknown>) as Record<string, unknown>)['import/resolver'] && (c as Record<string, (unknown>).settings as Record<string, (unknown>) as Record<string, unknown>)['import/resolver'].typescript,
      );

      expect(tsConfig).toBeDefined();
      expect(tsConfig.settings['import/resolver'].typescript.paths).toHaveProperty('@/*');
      expect(tsConfig.settings['import/resolver'].typescript.paths).toHaveProperty('@components/*');
      expect(tsConfig.settings['import/resolver'].typescript.paths).toHaveProperty('@utils/*');
    });

    test('should ignore external dependencies correctly', () => {
      const config = require(configPath);
      const importConfig = (config as Record<string, unknown>).find((c: unknown) => (c as Record<string, unknown>)?.rules && (c as Record<string, (unknown>)?.rules as Record<string, unknown>)['import/no-unresolved']);

      expect(importConfig).toBeDefined();
      const ignorePatterns = importConfig.rules['import/no-unresolved'][1].ignore;
      expect(ignorePatterns).toContain('^@/');
      // astronomia dependency removed
      // expect(ignorePatterns).toContain('^astronomia');
      expect(ignorePatterns).toContain('^astronomy-engine');
    });
  });

  describe('Global Variables', () => {
    test('should define React 19 globals', () => {
      const config = require(configPath);
      const reactConfig = config.find(
        (c: unknown) => (c as Record<string, unknown>)?.languageOptions &&
          ((c as Record<string, unknown>)?.languageOptions as Record<string, unknown>)?.globals &&
          (((c as Record<string, unknown>)?.languageOptions as Record<string, unknown>)?.globals as Record<string, unknown>)?.React,
      );

      expect(reactConfig).toBeDefined();
      expect(reactConfig.languageOptions.globals.React).toBe('readonly');
      expect(reactConfig.languageOptions.globals.JSX).toBe('readonly');
    });

    test('should define Node.js globals', () => {
      const config = require(configPath);
      const nodeConfig = config.find(
        (c: unknown) => (c as Record<string, unknown>)?.languageOptions &&
          ((c as Record<string, unknown>)?.languageOptions as Record<string, unknown>)?.globals &&
          (((c as Record<string, unknown>)?.languageOptions as Record<string, unknown>)?.globals as Record<string, unknown>)?.process,
      );

      expect(nodeConfig).toBeDefined();
      expect(nodeConfig.languageOptions.globals.process).toBe('readonly');
      expect(nodeConfig.languageOptions.globals.console).toBe('readonly');
    });

    test('should define test globals for test files', () => {
      const config = require(configPath);
      const testConfig = (config as Record<string, unknown>).find((c: unknown) => (c as Record<string, unknown>)?.files && (c as Record<string, unknown>)?.(files as Record<string, unknown>).some((f: string) => ((f as Record<string, unknown>)?.includes('**/*.(test as Record<string, unknown>).ts')));

      expect(testConfig).toBeDefined();
      expect(testConfig.languageOptions.globals.describe).toBe('readonly');
      expect(testConfig.languageOptions.globals.test).toBe('readonly');
      expect(testConfig.languageOptions.globals.expect).toBe('readonly');
    });
  });

  describe('Configuration Validation', () => {
    test('should validate configuration syntax', async () => {
      // This test ensures the configuration can be loaded by ESLint
      expect(eslint).toBeDefined();

      // Test that we can get configuration for different file types
      const tsConfig = eslint.calculateConfigForFile('test.ts');
      expect(tsConfig).toBeDefined();

      const jsConfig = eslint.calculateConfigForFile('test.js');
      expect(jsConfig).toBeDefined();
    });

    test('should have consistent rule severity levels', () => {
      const config = require(configPath);

      config.forEach((configSection: unknown) => {
        if ((configSection as Record<string, unknown>).rules) {
          Object.entries((configSection as Record<string, unknown>).rules).forEach(([_ruleName, ruleConfig]) => {
            if (Array.isArray(ruleConfig)) {
              const severity = ruleConfig[0];
              expect(['off', 'warn', 'error', 0, 1, 2]).toContain(severity);
            } else {
              expect(['off', 'warn', 'error', 0, 1, 2]).toContain(ruleConfig);
            }
          });
        }
      });
    });

    test('should have proper parser configuration', () => {
      const config = require(configPath);

      const tsConfig = (config as Record<string, unknown>).find((c: unknown) => ((c as Record<string, unknown>)?.languageOptions && (c as Record<string, unknown>)?.(languageOptions as Record<string, unknown>).parser);

      expect(tsConfig).toBeDefined();
      expect(tsConfig.languageOptions.parserOptions.project).toContain('./tsconfig.json');
      expect(tsConfig.languageOptions.parserOptions.ecmaFeatures.jsx).toBe(true);
    });
  });
});
