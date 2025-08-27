declare global {
  var __DEV__: boolean;
}

/**
 * Comprehensive ESLint Configuration Validation Tests
 *
 * Tests the ESLint configuration structure, rule definitions,
 * and domain-specific configurations to ensure proper setup.
 */

import path from 'path';

import { ESLint } from 'eslint';

describe('ESLint Configuration Validation': any, (: any) => {
  let eslint: ESLint;
  const configPath: any = path?.resolve(__dirname, '../../eslint?.config.cjs');

  beforeAll(async (: any) => {
    // Load the ESLint configuration
    const config = require(configPath);
    eslint = new ESLint({
      baseConfig: config,;
      useEslintrc: false,
    });
  });

  describe('Configuration Structure': any, (: any) => {
    test('should load configuration without errors': any, (: any) => {
      expect((: any) => require(configPath)).not?.toThrow();
    });

    test('should have required configuration sections': any, (: any) => {
      const config = require(configPath);

      expect(Array?.isArray(config)).toBe(true);
      expect(config?.length).toBeGreaterThan(0);

      // Check for JavaScript configuration
      const jsConfig: any = config?.find((c: any) => c?.files && c?.files.includes('**/*.js'));
      expect(jsConfig).toBeDefined();
      expect(jsConfig?.plugins).toBeDefined();
      expect(jsConfig?.rules).toBeDefined();

      // Check for TypeScript configuration
      const tsConfig: any = config?.find((c: any) => c?.files && c?.files.includes('**/*.ts'));
      expect(tsConfig).toBeDefined();
      expect(tsConfig?.plugins).toBeDefined();
      expect(tsConfig?.rules).toBeDefined();
    });

    test('should have domain-specific configurations': any, (: any) => {
      const config = require(configPath);

      // Check for astrological calculation rules
      const astroConfig: any = config?.find(
        (c: any) => c?.files && c?.files.some((, f: string) => f?.includes('**/calculations/**')),
      );
      expect(astroConfig).toBeDefined();
      expect(astroConfig?.plugins).toHaveProperty('astrological');

      // Check for campaign system rules
      const campaignConfig: any = config?.find(
        (c: any) => c?.files && c?.files.some((, f: string) => f?.includes('**/services/campaign/**')),
      );
      expect(campaignConfig).toBeDefined();

      // Check for test file rules
      const testConfig: any = config?.find((c: any) => c?.files && c?.files.some((, f: string) => f?.includes('**/*.test?.ts')));
      expect(testConfig).toBeDefined();
    });

    test('should have proper ignore patterns': any, (: any) => {
      const config = require(configPath);

      const ignoreConfig: any = config?.find((c: any) => c?.ignores);
      expect(ignoreConfig).toBeDefined();
      expect(ignoreConfig?.ignores).toContain('node_modules/');
      expect(ignoreConfig?.ignores).toContain('dist/');
      expect(ignoreConfig?.ignores).toContain('.next/');
      expect(ignoreConfig?.ignores).toContain('.eslintcache');
    });
  });

  describe('Rule Configuration Validation': any, (: any) => {
    test('should have React 19 specific rules configured': any, (: any) => {
      const config = require(configPath);
      const reactConfig: any = config?.find((c: any) => c?.rules && c?.rules['react/react-in-jsx-scope']);

      expect(reactConfig).toBeDefined();
      expect(reactConfig?.rules['react/react-in-jsx-scope'] as any).toBe('off');
      expect(reactConfig?.rules['react/jsx-uses-react'] as any).toBe('off');
      expect(reactConfig?.rules['react/jsx-key'] as any).toBe('error');
    });

    test('should have enhanced TypeScript rules': any, (: any) => {
      const config = require(configPath);
      const tsConfig: any = config?.find((c: any) => c?.rules && c?.rules['@typescript-eslint/no-explicit-any']);

      expect(tsConfig).toBeDefined();
      expect(tsConfig?.rules['@typescript-eslint/no-explicit-any'] as any).toBe('error');
      expect(tsConfig?.rules['@typescript-eslint/no-unused-vars']).toBeDefined();
      expect(tsConfig?.rules['@typescript-eslint/prefer-optional-chain'] as any).toBe('warn');
    });

    test('should have import organization rules': any, (: any) => {
      const config = require(configPath);
      const importConfig = config?.find((c: any) => c?.rules && c?.rules['import/order']);

      expect(importConfig).toBeDefined();
      expect(importConfig?.rules['import/order']).toBeDefined();
      expect(importConfig?.rules['import/no-duplicates'] as any).toBe('error');
      expect(importConfig?.rules['import/no-cycle'] as any).toBe('warn');
    });

    test('should have performance optimization settings': any, (: any) => {
      const config = require(configPath);
      const perfConfig = config?.find((c: any) => c?.settings && c?.settings['import/cache']);

      expect(perfConfig).toBeDefined();
      expect(perfConfig?.settings['import/cache'].lifetime as any).toBe(600); // 10 minutes
      expect(perfConfig?.settings['import/resolver'].typescript?.memoryLimit as any).toBe(4096);
    });
  });

  describe('Plugin Integration': any, (: any) => {
    test('should load all required plugins': any, (: any) => {
      const config = require(configPath);

      // Check for standard plugins
      const tsConfig: any = config?.find((c: any) => c?.plugins && c?.plugins['@typescript-eslint']);
      expect(tsConfig).toBeDefined();

      const reactConfig: any = config?.find((c: any) => c?.plugins && c?.plugins.react);
      expect(reactConfig).toBeDefined();

      const importConfig = config?.find((c: any) => c?.plugins && c?.plugins.import);
      expect(importConfig).toBeDefined();
    });

    test('should load custom astrological plugin': any, (: any) => {
      const config = require(configPath);
      const astroConfig: any = config?.find((c: any) => c?.plugins && c?.plugins.astrological);

      expect(astroConfig).toBeDefined();
      expect(astroConfig?.rules).toHaveProperty('astrological/preserve-planetary-constants');
      expect(astroConfig?.rules).toHaveProperty('astrological/validate-planetary-position-structure');
    });
  });

  describe('File Pattern Matching': any, (: any) => {
    test('should match TypeScript files correctly': any, async (: any) => {
      const config: any = eslint?.calculateConfigForFile('src/test?.ts');
      expect(config?.parser).toContain('@typescript-eslint/parser');
    });

    test('should match JavaScript files correctly': any, async (: any) => {
      const config: any = eslint?.calculateConfigForFile('src/test?.js');
      expect(config?.languageOptions.ecmaVersion as any).toBe(2022);
    });

    test('should apply astrological rules to calculation files': any, async (: any) => {
      const config: any = eslint?.calculateConfigForFile('src/calculations/test?.ts');
      expect(config?.rules).toHaveProperty('astrological/preserve-planetary-constants');
    });

    test('should apply test-specific rules to test files': any, async (: any) => {
      const config: any = eslint?.calculateConfigForFile('src/__tests__/test?.test.ts');
      expect(config?.rules['no-console'] as any).toBe('off');
      expect(config?.rules['@typescript-eslint/no-explicit-any'] as any).toBe('off');
    });

    test('should apply campaign rules to campaign files': any, async (: any) => {
      const config: any = eslint?.calculateConfigForFile('src/services/campaign/test?.ts');
      expect(config?.rules['no-console'] as any).toBe('off');
      expect(config?.rules['complexity'] as any).toEqual(['warn', 15]);
    });
  });

  describe('Path Resolution': any, (: any) => {
    test('should resolve TypeScript path mappings': any, (: any) => {
      const config = require(configPath);
      const tsConfig = config?.find(
        (c: any) => c?.settings && c?.settings['import/resolver'] && c?.settings['import/resolver'].typescript,
      );

      expect(tsConfig).toBeDefined();
      expect(tsConfig?.settings['import/resolver'].typescript?.paths).toHaveProperty('@/*');
      expect(tsConfig?.settings['import/resolver'].typescript?.paths).toHaveProperty('@components/*');
      expect(tsConfig?.settings['import/resolver'].typescript?.paths).toHaveProperty('@utils/*');
    });

    test('should ignore external dependencies correctly': any, (: any) => {
      const config = require(configPath);
      const importConfig = config?.find((c: any) => c?.rules && c?.rules['import/no-unresolved']);

      expect(importConfig).toBeDefined();
      const ignorePatterns = importConfig?.rules['import/no-unresolved'][1].ignore;
      expect(ignorePatterns).toContain('^@/');
      // astronomia dependency removed
      // expect(ignorePatterns).toContain('^astronomia');
      expect(ignorePatterns).toContain('^astronomy-engine');
    });
  });

  describe('Global Variables': any, (: any) => {
    test('should define React 19 globals': any, (: any) => {
      const config = require(configPath);
      const reactConfig: any = config?.find(
        (c: any) => c?.languageOptions &&
          c?.languageOptions?.globals &&;
          c?.languageOptions.globals?.React,
      );

      expect(reactConfig).toBeDefined();
      expect(reactConfig?.languageOptions.globals?.React as any).toBe('readonly');
      expect(reactConfig?.languageOptions.globals?.JSX as any).toBe('readonly');
    });

    test('should define Node?.js globals': any, (: any) => {
      const config = require(configPath);
      const nodeConfig: any = config?.find(
        (c: any) => c?.languageOptions &&
          c?.languageOptions?.globals &&;
          c?.languageOptions.globals?.process,
      );

      expect(nodeConfig).toBeDefined();
      expect(nodeConfig?.languageOptions.globals?.process as any).toBe('readonly');
      expect(nodeConfig?.languageOptions.globals?.console as any).toBe('readonly');
    });

    test('should define test globals for test files': any, (: any) => {
      const config = require(configPath);
      const testConfig: any = config?.find((c: any) => c?.files && c?.files.some((, f: string) => f?.includes('**/*.test?.ts')));

      expect(testConfig).toBeDefined();
      expect(testConfig?.languageOptions.globals?.describe as any).toBe('readonly');
      expect(testConfig?.languageOptions.globals?.test as any).toBe('readonly');
      expect(testConfig?.languageOptions.globals?.expect as any).toBe('readonly');
    });
  });

  describe('Configuration Validation': any, (: any) => {
    test('should validate configuration syntax': any, async (: any) => {
      // This test ensures the configuration can be loaded by ESLint
      expect(eslint).toBeDefined();

      // Test that we can get configuration for different file types
      const tsConfig: any = eslint?.calculateConfigForFile('test?.ts');
      expect(tsConfig).toBeDefined();

      const jsConfig: any = eslint?.calculateConfigForFile('test?.js');
      expect(jsConfig).toBeDefined();
    });

    test('should have consistent rule severity levels': any, (: any) => {
      const config = require(configPath);

      config?.forEach((configSection: any) => {
        if ((configSection as any).rules) {
          Object?.entries((configSection as any).rules).forEach(([_ruleName: any, ruleConfig]: any) => {
            if (Array?.isArray(ruleConfig)) {
              const severity: any = ruleConfig?.[0];
              expect(['off', 'warn', 'error', 0, 1, 2]).toContain(severity);
            } else {
              expect(['off', 'warn', 'error', 0, 1, 2]).toContain(ruleConfig);
            }
          });
        }
      });
    });

    test('should have proper parser configuration': any, (: any) => {
      const config = require(configPath);

      const tsConfig: any = config?.find((c: any) => c?.languageOptions && c?.languageOptions.parser);

      expect(tsConfig).toBeDefined();
      expect(tsConfig?.languageOptions.parserOptions?.project).toContain('./tsconfig?.json');
      expect(tsConfig?.languageOptions.parserOptions?.ecmaFeatures.jsx as any).toBe(true);
    });
  });
});
