const js = require('@eslint/js');
const ts = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const importPlugin = require('eslint-plugin-import');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2021,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        // Add additional globals to prevent no-undef errors
        Set: 'readonly',
        Map: 'readonly',
        Promise: 'readonly',
        console: 'readonly',
        process: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        exports: 'writable',
        module: 'readonly',
        require: 'readonly',
        global: 'readonly',
        window: 'readonly',
        document: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': ts,
      react,
      'react-hooks': reactHooks,
      import: importPlugin
    },
    rules: {
      // React specific rules
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',
      'react/prop-types': 'off',
      
      // TypeScript rules - Enhanced configuration
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          'argsIgnorePattern': '^_',
          'varsIgnorePattern': '^_',
          'caughtErrorsIgnorePattern': '^_',
          'destructuredArrayIgnorePattern': '^_'
        }
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      'no-undef': 'off', // TypeScript handles this
      
      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      
      // General JavaScript rules - Enhanced
      'no-unused-vars': 'off', // Handled by @typescript-eslint/no-unused-vars
      'no-console': ['warn', { 'allow': ['warn', 'error'] }],
      'no-var': 'error',
      'prefer-const': 'error',
      'eqeqeq': 'error',
      'no-useless-catch': 'error',
      'no-setter-return': 'error',
      'no-duplicate-imports': 'error',
      'no-unreachable': 'error',
      'no-unreachable-loop': 'error',
      'no-unsafe-optional-chaining': 'error',
      
      // Import rules - Enhanced
      'import/no-unresolved': 'warn',
      'import/named': 'warn',
      'import/default': 'warn',
      'import/namespace': 'warn',
      'import/no-duplicates': 'error',
      'import/order': [
        'warn',
        {
          'groups': [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index'
          ],
          'newlines-between': 'always',
          'alphabetize': {
            'order': 'asc',
            'caseInsensitive': true
          }
        }
      ],
      
      // Code quality rules
      'complexity': ['warn', 20],
      'max-depth': ['warn', 4],
      'max-lines': ['warn', 500],
      'max-lines-per-function': ['warn', 100],
      'max-params': ['warn', 5],
      'max-nested-callbacks': ['warn', 3],
      
      // Best practices
      'prefer-template': 'warn',
      'prefer-arrow-callback': 'warn',
      'no-return-assign': 'error',
      'no-self-compare': 'error',
      'no-sequences': 'error',
      'no-throw-literal': 'error',
      'no-unmodified-loop-condition': 'error',
      'no-useless-call': 'error',
      'no-useless-concat': 'error',
      'no-useless-return': 'error',
      'prefer-promise-reject-errors': 'error',
      'require-await': 'warn',
      'yoda': 'error'
    },
    settings: {
      react: {
        version: 'detect'
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json'
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx']
        }
      }
    }
  },
  {
    ignores: [
      "node_modules/",
      "dist/",
      "build/",
      ".next/",
      ".astro/",
      "coverage/",
      "*.config.js",
      "*.config.mjs",
      "*.config.cjs",
      "scripts/",
      "public/"
    ]
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    languageOptions: {
      globals: {
        ...globals.jest
      }
    },
    rules: {
      'max-lines': 'off',
      'max-depth': 'off',
      'max-nested-callbacks': 'off',
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off'
    }
  },
  {
    // Allow console.log in scripts directory
    files: ['**/scripts/**/*.ts', '**/scripts/**/*.js'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'max-lines': 'off',
      'max-lines-per-function': 'off'
    }
  },
  {
    // Configuration for utility files
    files: ['**/utils/**/*.ts', '**/utils/**/*.js'],
    rules: {
      'max-lines': ['warn', 800],
      'max-lines-per-function': ['warn', 150],
      'complexity': ['warn', 25]
    }
  },
  {
    // Configuration for service files
    files: ['**/services/**/*.ts', '**/services/**/*.js'],
    rules: {
      'max-lines': ['warn', 600],
      'max-lines-per-function': ['warn', 120]
    }
  },
  {
    // Configuration for component files
    files: ['**/components/**/*.tsx', '**/components/**/*.ts'],
    rules: {
      'max-lines': ['warn', 400],
      'max-lines-per-function': ['warn', 80],
      'react-hooks/exhaustive-deps': 'warn'
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'import/no-unresolved': 'warn'
    }
  }
]; 