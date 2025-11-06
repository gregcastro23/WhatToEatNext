// eslint.config.fast.mjs - Performance-Optimized ESLint Configuration
// Updated: November 6, 2025
// For rapid development and incremental linting

import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

// ============================================================================
// Fast Configuration - Essential Rules Only
// ============================================================================

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
        // NO type-aware linting for speed
        project: false,
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
    },

    settings: {
      react: {
        version: "detect",
      },
    },

    rules: {
      // ======================================================================
      // Critical TypeScript Rules Only
      // ======================================================================

      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",

      // ======================================================================
      // Essential React Rules
      // ======================================================================

      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "error",
      "react/prop-types": "off",
      "react/jsx-key": "error",
      "react/jsx-no-duplicate-props": "error",
      "react/no-direct-mutation-state": "error",

      // ======================================================================
      // Essential React Hooks Rules
      // ======================================================================

      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // ======================================================================
      // Essential JavaScript Rules
      // ======================================================================

      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
      "no-debugger": "error",
      "no-unused-vars": "off",
      "no-undef": "off",
      "no-var": "error",
      "prefer-const": "error",
      "no-const-assign": "error",
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-eval": "error",
    },
  },

  // ============================================================================
  // Test Files - Minimal Rules
  // ============================================================================
  {
    files: [
      "src/**/*.test.{ts,tsx}",
      "src/**/*.spec.{ts,tsx}",
      "tests/**/*.{ts,tsx}",
    ],

    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off",
    },
  },

  // ============================================================================
  // Scripts - Minimal Rules
  // ============================================================================
  {
    files: ["src/scripts/**/*.{ts,js}", "scripts/**/*.{ts,js}"],

    languageOptions: {
      globals: {
        ...globals.node,
      },
    },

    rules: {
      "no-console": "off",
    },
  },

  // ============================================================================
  // CommonJS Files - Node.js Environment
  // ============================================================================
  {
    files: ["**/*.cjs"],

    languageOptions: {
      sourceType: "commonjs",
      globals: {
        ...globals.node,
      },
    },

    rules: {
      "no-console": "off",
    },
  },

  // ============================================================================
  // Ignores - Same as main config
  // ============================================================================
  {
    ignores: [
      "node_modules/",
      ".next/",
      "out/",
      "build/",
      "dist/",
      ".cache/",
      ".turbo/",
      ".swc/",
      ".yarn/",
      "*.tsbuildinfo",
      ".eslint-ts-cache/",
      ".eslintcache",
      ".eslint-results.json",
      "coverage/",
      "*.log",
      "logs/",
      "temp/",
      "tmp/",
      ".tmp/",
      "*.backup",
      "*.bak",
      "backups/",
      "*.config.js",
      "*.config.mjs",
      "*.config.cjs",
      "fix-*.js",
      "fix-*.cjs",
      "analyze-*.js",
      "systematic-*.js",
      "docs/**",
      "*.md",
      "*.ipynb",
      "extracted_*/",
      "*.json",
      "!package.json",
      "!tsconfig.json",
      "!tsconfig.*.json",
      "patches/",
      "*.patch",
      "*.png",
      "*.jpg",
      "*.svg",
      ".DS_Store",
      ".vscode/",
      ".idea/",
      "backend/",
      "database/",
      "tests/",
      "__tests__/",
      "dev-output.txt",
      "dev-server.log",
      "start-dev.sh",
    ],
  },
];
