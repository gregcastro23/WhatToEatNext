const js = require('@eslint/js');
const ts = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const importPlugin = require('eslint-plugin-import');
const globals = require('globals');
const astrologicalRules = require('./src/eslint-plugins/astrological-rules.cjs');

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
          jsx: true
        }
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        ...globals.es2022,
        // React 19 and Next.js 15 globals
        React: 'readonly',
        JSX: 'readonly',
        // Additional globals to prevent no-undef errors
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
        document: 'readonly',
        // Next.js specific globals
        __dirname: 'readonly',
        __filename: 'readonly'
      }
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      import: importPlugin
    },
    rules: {
      // React 19 specific rules
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',
      'react/prop-types': 'off',
      'react/jsx-key': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-undef': 'error',
      'react/no-children-prop': 'error',
      'react/no-danger-with-children': 'error',
      'react/no-deprecated': 'warn',
      'react/no-direct-mutation-state': 'error',
      'react/no-find-dom-node': 'error',
      'react/no-is-mounted': 'error',
      'react/no-render-return-value': 'error',
      'react/no-string-refs': 'error',
      'react/no-unescaped-entities': 'error',
      'react/no-unknown-property': 'error',
      'react/require-render-return': 'error',
      
      // JavaScript rules
      'no-unused-vars': [
        'warn',
        {
          'argsIgnorePattern': '^_',
          'varsIgnorePattern': '^_',
          'caughtErrorsIgnorePattern': '^_'
        }
      ],
      
      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      
      // Import rules for JavaScript
      'import/no-unresolved': [
        'warn',
        {
          'ignore': [
            '^@/',
            '^@components/',
            '^@styles/',
            '^@utils/',
            '^@types/',
            '^@providers/',
            '^@services/',
            '^@data/',
            '^@constants/',
            '^@contexts/',
            '^@hooks/',
            '^@lib/',
            '^@calculations/',
            '\\.module\\.css$',
            '^astronomia',
            '^astronomy-engine',
            '^suncalc'
          ]
        }
      ],
      'import/named': 'warn',
      'import/default': 'warn',
      'import/namespace': 'warn',
      'import/no-duplicates': 'error',
      
      // General JavaScript rules
      'no-console': ['warn', { 'allow': ['warn', 'error'] }],
      'no-var': 'error',
      'prefer-const': 'error',
      'eqeqeq': 'error',
      'no-debugger': 'warn',
      'no-alert': 'warn',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error'
    },
    settings: {
      react: {
        version: '19.1.0'
      },
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.json']
        }
      }
    }
  },
  // TypeScript files configuration
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        },
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        ...globals.es2022,
        // React 19 and Next.js 15 globals
        React: 'readonly',
        JSX: 'readonly',
        // Additional globals to prevent no-undef errors
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
        document: 'readonly',
        // Next.js specific globals
        __dirname: 'readonly',
        __filename: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': ts,
      react,
      'react-hooks': reactHooks,
      import: importPlugin,
      'astrological': astrologicalRules
    },
    rules: {
      // React 19 specific rules
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',
      'react/prop-types': 'off',
      'react/jsx-key': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-undef': 'error',
      'react/no-children-prop': 'error',
      'react/no-danger-with-children': 'error',
      'react/no-deprecated': 'warn',
      'react/no-direct-mutation-state': 'error',
      'react/no-find-dom-node': 'error',
      'react/no-is-mounted': 'error',
      'react/no-render-return-value': 'error',
      'react/no-string-refs': 'error',
      'react/no-unescaped-entities': 'error',
      'react/no-unknown-property': 'error',
      'react/require-render-return': 'error',
      
      // Enhanced TypeScript rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          'argsIgnorePattern': '^_',
          'varsIgnorePattern': '^(_|UNUSED_)',
          'caughtErrorsIgnorePattern': '^_',
          'destructuredArrayIgnorePattern': '^_',
          'ignoreRestSiblings': true
        }
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/prefer-as-const': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'off', // Temporarily disabled due to plugin bug
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/strict-boolean-expressions': 'off', // Too strict for existing codebase
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      'no-undef': 'off', // TypeScript handles this
      
      // React Hooks rules with enhanced configuration
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': [
        'warn',
        {
          'additionalHooks': '(useRecoilCallback|useRecoilTransaction_UNSTABLE)'
        }
      ],
      
      // Enhanced import rules with TypeScript path mapping
      'import/no-unresolved': [
        'warn',
        {
          'ignore': [
            '^@/',
            '^@components/',
            '^@styles/',
            '^@utils/',
            '^@types/',
            '^@providers/',
            '^@services/',
            '^@data/',
            '^@constants/',
            '^@contexts/',
            '^@hooks/',
            '^@lib/',
            '^@calculations/',
            '\\.module\\.css$',
            '^astronomia',
            '^astronomy-engine',
            '^suncalc'
          ]
        }
      ],
      'import/named': 'warn',
      'import/default': 'warn',
      'import/namespace': 'warn',
      'import/no-duplicates': 'error',
      'import/order': [
        'error',
        {
          'groups': [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index'
          ],
          'pathGroups': [
            {
              'pattern': '@/**',
              'group': 'internal',
              'position': 'before'
            }
          ],
          'pathGroupsExcludedImportTypes': ['builtin'],
          'newlines-between': 'always',
          'alphabetize': {
            'order': 'asc',
            'caseInsensitive': true
          }
        }
      ],
      'import/no-cycle': 'warn',
      'import/no-self-import': 'error',
      'import/no-useless-path-segments': 'error',
      // Temporarily disabled due to flat config compatibility issue
      // 'import/no-unused-modules': [
      //   'warn',
      //   {
      //     'unusedExports': true,
      //     'missingExports': false,
      //     'ignoreExports': [
      //       '**/pages/**',
      //       '**/app/**',
      //       '**/*.config.*',
      //       '**/scripts/**'
      //     ]
      //   }
      // ],
      
      // General JavaScript rules
      'no-unused-vars': 'off', // Handled by @typescript-eslint/no-unused-vars
      'no-console': ['error', { 'allow': ['warn', 'error', 'info'] }],
      'no-var': 'error',
      'prefer-const': 'error',
      'eqeqeq': 'error',
      'no-debugger': 'warn',
      'no-alert': 'warn',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error'
    },
    settings: {
      react: {
        version: '19.1.0'
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: ['./tsconfig.json'],
          paths: {
            '@/*': ['./src/*'],
            '@components/*': ['./src/components/*'],
            '@styles/*': ['./src/styles/*'],
            '@utils/*': ['./src/utils/*'],
            '@types/*': ['./src/types/*'],
            '@providers/*': ['./src/providers/*'],
            '@services/*': ['./src/services/*'],
            '@data/*': ['./src/data/*'],
            '@constants/*': ['./src/constants/*'],
            '@contexts/*': ['./src/contexts/*'],
            '@hooks/*': ['./src/hooks/*'],
            '@lib/*': ['./src/lib/*'],
            '@calculations/*': ['./src/calculations/*']
          }
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
        }
      },
      'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx']
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
      ".transformation-backups/",
      ".jest-cache/",
      ".eslintcache",
      ".eslint-results.json",
      ".eslint-ts-cache/",
      ".lint-backup-*/",
      "yarn.lock",
      "package-lock.json"
    ]
  },
  
  // Domain-specific rules for astrological calculations
  {
    files: [
      '**/calculations/**/*.ts',
      '**/calculations/**/*.tsx',
      '**/data/planets/**/*.ts',
      '**/utils/reliableAstronomy.ts',
      '**/utils/planetaryConsistencyCheck.ts',
      '**/utils/astrology/**/*.ts',
      '**/services/*Astrological*.ts',
      '**/services/*Alchemical*.ts',
      '**/hooks/use*Astro*.ts',
      '**/hooks/use*Planet*.ts'
    ],
    plugins: {
      '@typescript-eslint': ts,
      react,
      'react-hooks': reactHooks,
      import: importPlugin,
      'astrological': astrologicalRules
    },
    rules: {
      // Custom astrological rules
      'astrological/preserve-planetary-constants': 'error',
      'astrological/validate-planetary-position-structure': 'error',
      'astrological/validate-elemental-properties': 'error',
      'astrological/require-transit-date-validation': 'warn',
      'astrological/preserve-fallback-values': 'error',
      
      // Allow mathematical constants and fallback values
      '@typescript-eslint/no-explicit-any': 'off',
      'no-magic-numbers': 'off',
      
      // Preserve critical astrological calculation variables
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          'argsIgnorePattern': '^(_|planet|position|degree|sign|longitude|retrograde)',
          'varsIgnorePattern': '^(_|FALLBACK|RELIABLE|POSITIONS|TRANSIT|DEFAULT|MARCH2025|UNUSED_|planet|degree|sign|longitude)',
          'caughtErrorsIgnorePattern': '^_',
          'ignoreRestSiblings': true
        }
      ],
      
      // Allow console statements for astronomical debugging
      'no-console': ['warn', { 'allow': ['warn', 'error', 'info', 'debug'] }],
      
      // Relax import resolution for astronomical libraries
      'import/no-unresolved': [
        'warn',
        {
          'ignore': ['astronomia', 'astronomy-engine', 'suncalc', 'swiss-ephemeris']
        }
      ],
      
      // Allow complex expressions for astronomical calculations
      'complexity': 'off',
      'max-lines-per-function': 'off',
      'max-depth': 'off',
      'max-statements': 'off',
      
      // Preserve elemental property structures
      'prefer-destructuring': 'off',
      
      // Allow necessary type assertions for astronomical data
      '@typescript-eslint/no-non-null-assertion': 'off',
      
      // Allow floating promises in astronomical calculations (fire-and-forget logging)
      '@typescript-eslint/no-floating-promises': 'warn',
      
      // Preserve mathematical expressions
      'no-mixed-operators': 'off',
      'no-extra-parens': 'off',
      
      // Allow necessary any types for external astronomical libraries
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      
      // Preserve critical calculation patterns
      'prefer-const': ['error', { 'destructuring': 'all' }],
      
      // Allow necessary object property access patterns
      'dot-notation': 'off',
      
      // Preserve astronomical naming conventions
      'camelcase': [
        'warn',
        {
          'allow': [
            'exactLongitude',
            'isRetrograde',
            'TransitDates',
            'PlanetSpecific',
            'ZodiacTransit',
            'RetrogradePhases',
            'getMarch2025Positions',
            'DEGREES_PER_SIGN',
            'SIGNS_PER_CIRCLE'
          ]
        }
      ]
    }
  },
  
  // Domain-specific rules for campaign system files
  {
    files: [
      '**/services/campaign/**/*.ts',
      '**/services/campaign/**/*.tsx',
      '**/types/campaign.ts',
      '**/utils/*Campaign*.ts',
      '**/utils/*Progress*.ts'
    ],
    rules: {
      // Allow enterprise intelligence patterns
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'off', // Campaign systems need extensive logging
      // Allow complex error handling and metrics collection
      'complexity': ['warn', 15],
      'max-lines-per-function': ['warn', 100],
      'max-depth': ['warn', 6],
      // Preserve campaign system variable patterns
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          'argsIgnorePattern': '^(_|campaign|progress|metrics|safety)',
          'varsIgnorePattern': '^(_|CAMPAIGN|PROGRESS|METRICS|SAFETY|ERROR|UNUSED_)',
          'caughtErrorsIgnorePattern': '^_',
          'ignoreRestSiblings': true
        }
      ],
      // Allow dynamic imports for campaign tools
      'import/no-dynamic-require': 'off',
      // Allow process.exit in campaign emergency protocols
      'no-process-exit': 'off'
    }
  },
  // Performance optimizations for large codebase
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    linterOptions: {
      reportUnusedDisableDirectives: true
    },
    settings: {
      // Enhanced cache settings for improved performance
      'import/cache': {
        lifetime: 10 * 60, // 10 minutes for longer cache retention
        max: 1000 // Maximum cache entries
      },
      // Optimized TypeScript project references
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: ['./tsconfig.json'],
          // Enhanced caching configuration
          cache: true,
          cacheDir: '.eslint-ts-cache',
          // Optimized memory usage for large codebase
          memoryLimit: 4096, // Increased for better performance
          // Parallel processing optimization
          maxParallelFilesPerProcess: 30,
          // Skip type checking for performance (ESLint focuses on linting)
          transpileOnly: true
        },
        // Fallback resolver for faster resolution
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
          moduleDirectory: ['node_modules', 'src']
        }
      },
      // React optimization for large component trees
      react: {
        version: '19.1.0',
        // Enable flow support for better performance
        flowVersion: '0.53',
        // Component wrapper detection optimization
        pragma: 'React',
        pragmaFrag: 'React.Fragment'
      },
      // ESLint performance tuning
      'import/external-module-folders': ['node_modules', 'node_modules/@types'],
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx']
      },
      // Optimize import resolution paths
      'import/resolver-alias': {
        '@': './src',
        '@components': './src/components',
        '@utils': './src/utils',
        '@types': './src/types',
        '@services': './src/services',
        '@data': './src/data',
        '@calculations': './src/calculations'
      }
    }
  },
  
  // Test files configuration
  {
    files: [
      '**/*.test.ts', 
      '**/*.test.tsx', 
      '**/*.spec.ts', 
      '**/*.spec.tsx',
      '**/__tests__/**/*.ts',
      '**/__tests__/**/*.tsx'
    ],
    languageOptions: {
      globals: {
        ...globals.jest,
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly'
      }
    },
    rules: {
      // Relax rules for test files
      'max-lines': 'off',
      'max-depth': 'off',
      'max-nested-callbacks': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
      // Allow unused variables in test setup
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          'argsIgnorePattern': '^(_|mock|stub)',
          'varsIgnorePattern': '^(_|mock|stub|test|UNUSED_)',
          'caughtErrorsIgnorePattern': '^_',
          'ignoreRestSiblings': true
        }
      ],
      // Allow non-null assertions in tests
      '@typescript-eslint/no-non-null-assertion': 'off',
      // Allow magic numbers in tests
      'no-magic-numbers': 'off',
      // Allow any types in test mocks and stubs
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      // Allow empty functions in test setup
      '@typescript-eslint/no-empty-function': 'off',
      // Allow flexible imports in tests
      'import/no-extraneous-dependencies': 'off',
      // Relax complexity rules for comprehensive tests
      'complexity': 'off',
      'max-statements': 'off',
      'max-lines-per-function': 'off'
    }
  },
  // Script files configuration
  {
    files: [
      '**/scripts/**/*.ts', 
      '**/scripts/**/*.js',
      '**/scripts/**/*.cjs',
      '**/scripts/**/*.mjs'
    ],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-process-exit': 'off',
      'import/no-dynamic-require': 'off'
    }
  },
  
  // Next.js specific configuration
  {
    files: [
      '**/pages/**/*.ts',
      '**/pages/**/*.tsx',
      '**/app/**/*.ts',
      '**/app/**/*.tsx',
      'next.config.*',
      '**/middleware.ts'
    ],
    rules: {
      // Next.js allows default exports for pages
      'import/no-default-export': 'off',
      // Allow dynamic imports for Next.js code splitting
      'import/no-dynamic-require': 'off',
      // Next.js specific patterns
      '@typescript-eslint/no-explicit-any': 'warn',
      // Allow console in server-side code
      'no-console': ['warn', { 'allow': ['warn', 'error', 'info'] }]
    }
  },
  
  // Configuration files
  {
    files: [
      '*.config.js',
      '*.config.ts',
      '*.config.mjs',
      '*.config.cjs',
      'tailwind.config.*',
      'postcss.config.*',
      'jest.config.*'
    ],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      'import/no-dynamic-require': 'off'
    }
  }
]; 