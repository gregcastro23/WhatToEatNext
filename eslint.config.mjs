// eslint.config.mjs - Comprehensive ESLint Configuration for WhatToEatNext
// Updated: November 6, 2025
// ESLint 9 + TypeScript-ESLint v8 + React 19 + Next.js 15

import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

// ============================================================================
// Base Configuration
// ============================================================================

export default [
  // Start with recommended JS rules
  js.configs.recommended,

  // ============================================================================
  // Main TypeScript/React Configuration
  // ============================================================================
  {
    files: ['src/**/*.{ts,tsx,js,jsx}'],

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        // Enable type-aware linting for enhanced TypeScript checks
        project: './tsconfig.json',
        tsconfigRootDir: '.',
      },

      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        ...globals.jest,
        // Explicit globals for clarity
        React: 'readonly',
        JSX: 'readonly',
      },
    },

    plugins: {
      '@typescript-eslint': tseslint,
      'react': reactPlugin,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      'import': importPlugin,
    },

    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
    },

    rules: {
      // ======================================================================
      // TypeScript Rules - Enhanced for Campaign
      // ======================================================================

      // Type Safety (Critical for campaign)
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',

      // Unused Variables (High priority for cleanup)
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],

      // Function and Variable Declarations
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
          allowDirectConstAssertionInArrowFunctions: true,
        },
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-inferrable-types': 'warn',

      // Best Practices
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/prefer-as-const': 'error',
      '@typescript-eslint/prefer-readonly': 'warn',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-for-in-array': 'error',
      '@typescript-eslint/require-await': 'warn',

      // Array and Object Best Practices
      '@typescript-eslint/array-type': ['warn', { default: 'array-simple' }],
      '@typescript-eslint/consistent-type-definitions': ['warn', 'interface'],
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: false,
        },
      ],

      // Naming Conventions
      '@typescript-eslint/naming-convention': [
        'warn',
        {
          selector: 'interface',
          format: ['PascalCase'],
        },
        {
          selector: 'typeAlias',
          format: ['PascalCase'],
        },
        {
          selector: 'enum',
          format: ['PascalCase'],
        },
        {
          selector: 'variable',
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
        },
      ],

      // ======================================================================
      // React Rules - React 19 Compatible
      // ======================================================================

      'react/react-in-jsx-scope': 'off', // Not needed in React 19
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',
      'react/prop-types': 'off', // Using TypeScript
      'react/display-name': 'warn',
      'react/jsx-key': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-undef': 'error',
      'react/no-children-prop': 'warn',
      'react/no-danger-with-children': 'error',
      'react/no-direct-mutation-state': 'error',
      'react/no-unescaped-entities': 'warn',
      'react/no-unknown-property': 'error',
      'react/self-closing-comp': 'warn',
      'react/jsx-boolean-value': ['warn', 'never'],
      'react/jsx-curly-brace-presence': ['warn', { props: 'never', children: 'never' }],

      // ======================================================================
      // React Hooks Rules
      // ======================================================================

      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // ======================================================================
      // Accessibility Rules
      // ======================================================================

      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/anchor-has-content': 'warn',
      'jsx-a11y/anchor-is-valid': 'warn',
      'jsx-a11y/aria-props': 'warn',
      'jsx-a11y/aria-proptypes': 'warn',
      'jsx-a11y/aria-role': 'warn',
      'jsx-a11y/aria-unsupported-elements': 'warn',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/heading-has-content': 'warn',
      'jsx-a11y/html-has-lang': 'warn',
      'jsx-a11y/img-redundant-alt': 'warn',
      'jsx-a11y/interactive-supports-focus': 'warn',
      'jsx-a11y/label-has-associated-control': 'warn',
      'jsx-a11y/mouse-events-have-key-events': 'warn',
      'jsx-a11y/no-access-key': 'warn',
      'jsx-a11y/no-autofocus': 'warn',
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',
      'jsx-a11y/no-redundant-roles': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/role-has-required-aria-props': 'warn',
      'jsx-a11y/role-supports-aria-props': 'warn',
      'jsx-a11y/scope': 'warn',
      'jsx-a11y/tabindex-no-positive': 'warn',

      // ======================================================================
      // Import/Export Rules
      // ======================================================================

      'import/no-unresolved': ['warn', { ignore: ['^@/'] }],
      'import/named': 'warn',
      'import/default': 'warn',
      'import/namespace': 'warn',
      'import/no-duplicates': 'error',
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'type',
          ],
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
            },
          ],
          'newlines-between': 'never',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import/no-cycle': 'warn',
      'import/no-self-import': 'error',
      'import/no-useless-path-segments': 'warn',
      'import/newline-after-import': 'warn',
      'import/no-mutable-exports': 'warn',
      'import/no-default-export': 'off', // Next.js requires default exports

      // ======================================================================
      // General JavaScript Rules
      // ======================================================================

      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'no-debugger': 'error',
      'no-alert': 'warn',

      // Variables
      'no-unused-vars': 'off', // Handled by @typescript-eslint
      'no-undef': 'off', // TypeScript handles this
      'no-var': 'error',
      'prefer-const': 'error',
      'no-const-assign': 'error',

      // Best Practices
      'eqeqeq': ['error', 'always', { null: 'ignore' }],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-return-await': 'off', // @typescript-eslint handles this
      'require-await': 'off', // @typescript-eslint handles this
      'no-throw-literal': 'off', // @typescript-eslint handles this
      'prefer-promise-reject-errors': 'warn',
      'no-sequences': 'error',
      'no-void': 'warn',
      'no-with': 'error',
      'radix': 'error',
      'yoda': 'warn',

      // Code Quality
      'complexity': ['warn', 20],
      'max-depth': ['warn', 4],
      'max-lines': ['warn', { max: 500, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': [
        'warn',
        { max: 100, skipBlankLines: true, skipComments: true },
      ],
      'max-nested-callbacks': ['warn', 3],
      'max-params': ['warn', 5],

      // ES6+ Features
      'arrow-body-style': ['warn', 'as-needed'],
      'prefer-arrow-callback': 'warn',
      'prefer-destructuring': ['warn', { object: true, array: false }],
      'prefer-rest-params': 'warn',
      'prefer-spread': 'warn',
      'prefer-template': 'warn',
      'object-shorthand': ['warn', 'always'],
      'no-useless-computed-key': 'warn',
      'no-useless-constructor': 'off', // @typescript-eslint handles this
      'no-useless-rename': 'warn',
      'symbol-description': 'warn',
    },
  },

  // ============================================================================
  // Test Files Configuration
  // ============================================================================
  {
    files: ['src/**/*.test.{ts,tsx}', 'src/**/*.spec.{ts,tsx}', 'tests/**/*.{ts,tsx}'],

    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },

    rules: {
      // Relax rules for test files
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      'max-nested-callbacks': 'off',
      'no-console': 'off',
    },
  },

  // ============================================================================
  // Scripts Directory Configuration
  // ============================================================================
  {
    files: ['src/scripts/**/*.{ts,js}', 'scripts/**/*.{ts,js}'],

    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'max-lines': 'off',
    },
  },

  // ============================================================================
  // CommonJS Files Configuration
  // ============================================================================
  {
    files: ['**/*.cjs'],

    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },

    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  // ============================================================================
  // Ignores Configuration
  // ============================================================================
  {
    ignores: [
      // Build outputs
      'node_modules/',
      '.next/',
      'out/',
      'build/',
      'dist/',
      '.cache/',
      '.turbo/',
      '.swc/',

      // Yarn
      '.yarn/',
      '.pnp.*',

      // TypeScript
      '*.tsbuildinfo',
      '.eslint-ts-cache/',

      // ESLint
      '.eslintcache',
      '.eslintcache-fast',
      '.eslint-results.json',
      '.eslint-profile.json',

      // Test coverage
      'coverage/',
      '.nyc_output/',

      // Logs
      '*.log',
      'logs/',
      '*.log.*',

      // Temporary files
      'temp/',
      'tmp/',
      '.tmp/',
      '*.backup',
      '*.bak',
      '*.old',
      'backups/',

      // Config files that might have intentional patterns
      '*.config.js',
      '*.config.mjs',
      '*.config.cjs',
      '*.config.ts',
      'next.config.js',
      'tailwind.config.*',
      'postcss.config.*',
      'jest.config.*',

      // Scripts with known issues
      'fix-*.js',
      'fix-*.cjs',
      'analyze-*.js',
      'emergency-*.js',
      'comprehensive-*.js',
      'automated-*.js',
      'enhanced-*.js',
      'systematic-*.js',
      'restore-*.js',
      'debug-*.js',
      'cleanup-*.js',
      'batch-*.js',
      'demo-*.ts',
      'test-*.sh',
      '*-*.sh',

      // Documentation
      'docs/**',
      '*.md',
      '*.ipynb',

      // Generated files
      'extracted_*/',
      'Alchm*/',
      '*.d.ts.map',
      '*.js.map',

      // Data and analysis files
      '*.json',
      '!package.json',
      '!tsconfig.json',
      '!tsconfig.*.json',

      // Patches
      'patches/',
      '*.patch',

      // Media and binary files
      '*.png',
      '*.jpg',
      '*.jpeg',
      '*.gif',
      '*.ico',
      '*.svg',
      '*.woff',
      '*.woff2',
      '*.ttf',
      '*.eot',

      // OS files
      '.DS_Store',
      'Thumbs.db',

      // IDE
      '.vscode/',
      '.idea/',
      '*.swp',
      '*.swo',
      '*~',

      // Project specific
      'backend/',
      'database/',
      'tests/',
      '__tests__/',

      // Untracked development files
      'dev-output.txt',
      'dev-server.log',
      'start-dev.sh',
    ],
  },
];
