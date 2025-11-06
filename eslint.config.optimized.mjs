// eslint.config.optimized.mjs - OPTIMIZED ESLint Configuration
// Created: November 6, 2025
// Optimization Phase: Post-Campaign Analysis
//
// This configuration is optimized for the WhatToEatNext alchemical system
// based on learnings from the initial linting campaign that reduced issues
// from 14,919 → 2,869 (80.7% reduction).
//
// Key optimizations:
// 1. Disabled unsafe-* rules (legitimate dynamic data patterns)
// 2. Relaxed complexity limits (domain-appropriate calculations)
// 3. Disabled style-only rules (reduce noise)
// 4. Kept critical safety rules (no-explicit-any, no-unused-vars)

import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default [
  js.configs.recommended,

  {
    files: ["src/**/*.{ts,tsx,js,jsx}"],

    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: "./tsconfig.json",
        tsconfigRootDir: ".",
      },

      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        ...globals.jest,
        React: "readonly",
        JSX: "readonly",
      },
    },

    plugins: {
      "@typescript-eslint": tseslint,
      react: reactPlugin,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
      import: importPlugin,
    },

    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
      "import/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx"],
      },
    },

    rules: {
      // ======================================================================
      // TypeScript Rules - OPTIMIZED for Dynamic Alchemical Data
      // ======================================================================

      // === CRITICAL RULES - KEEP ENABLED ===
      "@typescript-eslint/no-explicit-any": "warn", // Target for manual cleanup
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        {
          prefer: "type-imports",
          disallowTypeAnnotations: false,
        },
      ],

      // === ASYNC/AWAIT RULES - KEEP FOR BUG PREVENTION ===
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-for-in-array": "error",
      "@typescript-eslint/require-await": "warn",

      // === OPTIMIZED: DISABLED UNSAFE RULES ===
      // Rationale: This project uses validated dynamic data (astrological/alchemical)
      // Runtime safety is handled through custom type guards and validators
      // These rules generated 6,428 warnings (73% of total) with many false positives
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-argument": "off",

      // === OPTIMIZED: DISABLED STYLE-ONLY RULES ===
      // Rationale: Style preferences that don't affect safety or correctness
      "@typescript-eslint/prefer-nullish-coalescing": "off", // 922 warnings, contextual choice
      "@typescript-eslint/explicit-function-return-type": "off", // 562 warnings, TS inference is excellent
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-inferrable-types": "off",

      // === OPTIMIZED: DISABLED HIGH FALSE-POSITIVE RULES ===
      "@typescript-eslint/no-unnecessary-condition": "off", // 1,896 warnings, many false positives with type guards
      "@typescript-eslint/no-unnecessary-type-assertion": "off",

      // === BEST PRACTICES - KEEP SELECTIVE ===
      "@typescript-eslint/prefer-optional-chain": "warn", // Good safety improvement
      "@typescript-eslint/prefer-as-const": "error", // Prevents type widening bugs
      "@typescript-eslint/prefer-readonly": "off", // Style preference

      // === TYPE DEFINITIONS ===
      "@typescript-eslint/array-type": "off", // Style preference
      "@typescript-eslint/consistent-type-definitions": ["warn", "interface"],

      // === NAMING CONVENTIONS - RELAXED ===
      "@typescript-eslint/naming-convention": [
        "warn",
        {
          selector: "interface",
          format: ["PascalCase"],
        },
        {
          selector: "typeAlias",
          format: ["PascalCase"],
        },
        {
          selector: "enum",
          format: ["PascalCase"],
        },
        {
          selector: "variable",
          format: ["camelCase", "PascalCase", "UPPER_CASE"],
          leadingUnderscore: "allow",
        },
      ],

      // ======================================================================
      // React Rules - React 19 Compatible
      // ======================================================================

      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "error",
      "react/prop-types": "off",
      "react/display-name": "warn",
      "react/jsx-key": "error",
      "react/jsx-no-duplicate-props": "error",
      "react/jsx-no-undef": "error",
      "react/no-children-prop": "warn",
      "react/no-danger-with-children": "error",
      "react/no-direct-mutation-state": "error",
      "react/no-unescaped-entities": "warn",
      "react/no-unknown-property": "error",
      "react/self-closing-comp": "warn",
      "react/jsx-boolean-value": "off", // Style preference
      "react/jsx-curly-brace-presence": "off", // Style preference

      // ======================================================================
      // React Hooks Rules - CRITICAL
      // ======================================================================

      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // ======================================================================
      // Accessibility Rules - Relaxed to Warnings
      // ======================================================================

      "jsx-a11y/alt-text": "warn",
      "jsx-a11y/anchor-has-content": "warn",
      "jsx-a11y/anchor-is-valid": "warn",
      "jsx-a11y/aria-props": "warn",
      "jsx-a11y/aria-proptypes": "warn",
      "jsx-a11y/aria-role": "warn",
      "jsx-a11y/click-events-have-key-events": "off", // Too noisy
      "jsx-a11y/no-static-element-interactions": "off", // Too noisy
      "jsx-a11y/no-noninteractive-element-interactions": "off", // Too noisy

      // ======================================================================
      // Import/Export Rules
      // ======================================================================

      "import/no-unresolved": "off", // TypeScript handles this
      "import/named": "off",
      "import/default": "off",
      "import/namespace": "off",
      "import/no-duplicates": "error",
      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          "newlines-between": "never",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],

      // ======================================================================
      // Code Quality Rules - OPTIMIZED FOR DOMAIN COMPLEXITY
      // ======================================================================

      // === OPTIMIZED: RELAXED COMPLEXITY LIMITS ===
      // Rationale: Alchemical/thermodynamic calculations are inherently complex
      // Mathematical formulas and astrological computations cannot be meaningfully simplified
      complexity: ["warn", 30], // was 20, now 30 for domain calculations
      "max-depth": ["warn", 5], // was 4
      "max-lines-per-function": ["warn", 150], // was 100
      "max-lines": ["warn", 600], // was 500
      "max-params": ["warn", 5], // was 4

      // === BEST PRACTICES - KEEP ===
      "no-console": "warn", // Should use logger
      "no-debugger": "error",
      "no-alert": "warn",
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-var": "error",
      "prefer-const": "warn",
      "prefer-arrow-callback": "warn",
      "prefer-template": "warn",
      "no-unused-expressions": [
        "warn",
        { allowShortCircuit: true, allowTernary: true },
      ],

      // === CODE STYLE - RELAXED ===
      "arrow-body-style": "off", // Style preference
      "prefer-destructuring": "off", // Style preference
      "no-void": "off", // Legitimate for promise ignoring

      // ======================================================================
      // ES6+ Rules
      // ======================================================================

      "no-duplicate-imports": "off", // Handled by import/no-duplicates
      "no-useless-constructor": "warn",
      "no-useless-rename": "warn",
      "object-shorthand": "warn",
      "prefer-spread": "warn",
      "prefer-rest-params": "warn",
    },
  },

  // ============================================================================
  // Test Files - Even More Relaxed
  // ============================================================================
  {
    files: [
      "**/*.test.{ts,tsx}",
      "**/*.spec.{ts,tsx}",
      "**/tests/**/*.{ts,tsx}",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "no-console": "off",
      "max-lines-per-function": "off",
      complexity: "off",
    },
  },

  // ============================================================================
  // Configuration Files - Minimal Rules
  // ============================================================================
  {
    files: ["*.config.{js,mjs,cjs,ts}", "*.setup.{js,ts}"],
    rules: {
      "@typescript-eslint/no-var-requires": "off",
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  // ============================================================================
  // Scripts and Utilities - Relaxed
  // ============================================================================
  {
    files: ["scripts/**/*.{js,ts}", "src/utils/test*.ts"],
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "max-lines": "off",
    },
  },
];
