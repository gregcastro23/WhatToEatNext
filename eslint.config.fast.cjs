/**
 * Fast ESLint Configuration
 * Optimized for speed - skips type-aware rules and uses minimal parsing
 * Target: <10 seconds for full codebase scan
 */

const js = require('@eslint/js');
const ts = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const importPlugin = require('eslint-plugin-import');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  // JavaScript files configuration
  {
    files: ['**/*.js', '**/*.jsx', '**/*.cjs', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        ...globals.es2022,
        React: 'readonly',
        JSX: 'readonly',
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    rules: {
      // React rules (fast checks only)
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',
      'react/prop-types': 'off',
      'react/jsx-key': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-undef': 'error',
      'react/no-unescaped-entities': 'error',
      
      // React Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      
      // Basic JavaScript rules
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-var': 'error',
      'prefer-const': 'error',
      'eqeqeq': 'error',
      'no-debugger': 'warn',
    },
    settings: {
      react: {
        version: '19.1.0',
      },
    },
  },
  // TypeScript files - FAST mode (no type checking)
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        // IMPORTANT: No 'project' field - this is what makes it fast!
        // We sacrifice type-aware rules for speed
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        ...globals.es2022,
        React: 'readonly',
        JSX: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': ts,
      react,
      'react-hooks': reactHooks,
    },
    rules: {
      // React rules
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',
      'react/prop-types': 'off',
      'react/jsx-key': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-undef': 'error',
      'react/no-unescaped-entities': 'error',
      
      // TypeScript rules (only non-type-aware rules)
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^(_|UNUSED_)',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn', // Downgraded to warning for speed
      '@typescript-eslint/prefer-as-const': 'error',
      
      // Disabled type-aware rules for speed
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/prefer-optional-chain': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      
      // React Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      
      // Basic JavaScript rules
      'no-unused-vars': 'off', // Handled by @typescript-eslint/no-unused-vars
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'no-var': 'error',
      'prefer-const': 'error',
      'eqeqeq': 'error',
      'no-debugger': 'warn',
      'no-undef': 'off', // TypeScript handles this
    },
    settings: {
      react: {
        version: '19.1.0',
      },
    },
  },
  // Test files - minimal rules
  {
    files: [
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/__tests__/**/*.ts',
      '**/__tests__/**/*.tsx',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^(_|mock|stub)',
          varsIgnorePattern: '^(_|mock|stub|test|UNUSED_)',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  // Scripts - relaxed rules
  {
    files: ['**/scripts/**/*.ts', '**/scripts/**/*.js', '**/scripts/**/*.cjs', '**/scripts/**/*.mjs'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-process-exit': 'off',
    },
  },
  // Ignore patterns
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      '.next/',
      'coverage/',
      '*.config.js',
      '*.config.mjs',
      '*.config.cjs',
      '.transformation-backups/',
      '.jest-cache/',
      '.eslintcache',
      '.eslint-results.json',
      '.eslint-ts-cache/',
      '.eslint-tsbuildinfo',
      '.lint-backup-*/',
      'yarn.lock',
      'package-lock.json',
    ],
  },
  // Performance optimizations
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    linterOptions: {
      reportUnusedDisableDirectives: false, // Faster without this check
    },
    settings: {
      // Simplified import resolution for speed
      'import/cache': {
        lifetime: 30 * 60, // 30 minutes cache
        max: 5000, // Large cache for speed
      },
      // Skip complex import resolution
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
          moduleDirectory: ['node_modules', 'src'],
        },
      },
    },
  },
];