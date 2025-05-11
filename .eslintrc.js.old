module.exports = {
  // Using standard configuration
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'next/core-web-vitals'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: [
    '@typescript-eslint', 'react', 'import'
  ],
  rules: {
    // Overrides
    'no-undef': 'off', // TypeScript will handle this
    '@typescript-eslint/no-unused-vars': 'off', // Temporarily disable unused vars warnings
    '@typescript-eslint/no-explicit-any': 'off', // Temporarily disable any type warnings
    'import/no-anonymous-default-export': 'off', // Allow anonymous default exports
    'react/react-in-jsx-scope': 'off', // Next.js doesn't require React import
    'react/prop-types': 'off', // TypeScript handles prop validation
    'no-console': 'off', // Allow console for debugging
    'react-hooks/exhaustive-deps': 'off', // Disable missing dependencies warnings
    'react/no-unescaped-entities': 'off', // Disable unescaped entities errors
    '@typescript-eslint/no-inferrable-types': 'off', // Allow trivially inferred types
    '@typescript-eslint/no-var-requires': 'off', // Allow require statements
    '@typescript-eslint/no-empty-function': 'off', // Allow empty functions
    '@typescript-eslint/no-empty-interface': 'off', // Allow empty interfaces
    'prefer-const': 'off', // Allow let for constants
    '@next/next/no-img-element': 'off', // Allow img elements
    '@next/next/no-before-interactive-script-outside-document': 'off', // Allow scripts outside document
    'react/display-name': 'off', // Allow components without display names
    'no-prototype-builtins': 'off', // Allow direct prototype method calls
    'react-hooks/rules-of-hooks': 'off', // Allow hooks in non-component functions
  },
  env: {
    browser: true,
    node: true,
    es6: true
  },
  globals: {
    // Common global objects
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
    URLSearchParams: 'readonly'
  },
  settings: {
    react: {
      version: 'detect'
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      },
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json'
      }
    }
  },
  ignorePatterns: [
    'node_modules/',
    '.next/',
    'out/',
    'public/',
    'src/types/*.d.ts',
    '**/*.js',
    '**/scripts/**/*',
    'src/components/CookingMethods.tsx',
    'src/components/CuisineSection/index.tsx',
    'src/data/ingredients/vinegars/consolidated_vinegars.ts'
  ]
}